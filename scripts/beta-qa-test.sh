#!/usr/bin/env bash
set -euo pipefail

BASE="http://localhost:3000"
PASS=0
FAIL=0
BUGS=()
FIXED=()

log() { echo "[QA] $*"; }
pass() { PASS=$((PASS+1)); log "PASS: $1"; }
fail() { FAIL=$((FAIL+1)); BUGS+=("$1"); log "FAIL: $1"; }

auth_login() {
  local jar=$1 email=$2 password=$3
  sleep 1.2
  curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" \
    -d "{\"identifier\":\"$email\",\"password\":\"$password\"}" > /dev/null
  sleep 1.2
  curl -s -c "$jar" -b "$jar" -X POST "$BASE/api/auth/verify-otp" \
    -H "Content-Type: application/json" -H "Origin: $BASE" \
    -d "{\"identifier\":\"$email\",\"code\":\"123456\"}"
}

log "Waiting for rate limit window..."
sleep 65

# --- Health & SEO ---
log "=== Health & SEO ==="
curl -s "$BASE/api/health" | grep -q '"status":"ok"' && pass "API health" || fail "API health"
curl -s "$BASE/robots.txt" | grep -q "Disallow: /admin" && pass "robots.txt" || fail "robots.txt"
curl -s "$BASE/sitemap.xml" | grep -q "<urlset" && pass "sitemap.xml" || fail "sitemap.xml"
curl -s "$BASE/listings/iphone-16-pro-max-256gb" | grep -q "application/ld+json" && pass "Listing metadata/JSON-LD" || fail "Listing JSON-LD"
curl -s "$BASE/categories/mobiles" | grep -q "application/ld+json" && pass "Category metadata/JSON-LD" || fail "Category JSON-LD"

# --- Security ---
log "=== Security ==="
[[ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/wallet")" == "307" ]] && pass "Wallet redirect logged out" || fail "Wallet redirect"
[[ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin")" == "307" ]] && pass "Admin redirect logged out" || fail "Admin redirect"
curl -s -X POST "$BASE/api/orders" -H "Content-Type: application/json" -d '{"listingId":"x","amount":100}' | grep -q "UNAUTHORIZED" && pass "Orders API unauth" || fail "Orders unauth"
curl -s -X POST "$BASE/api/auth/verify-otp" -H "Content-Type: application/json" -d '{"identifier":"user@uaesales.demo","code":"000000"}' | grep -q "UNAUTHORIZED" && pass "Invalid OTP" || fail "Invalid OTP"
curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d '{"identifier":"user@uaesales.demo","password":"wrongpass"}' | grep -q "UNAUTHORIZED" && pass "Invalid login" || fail "Invalid login"

# --- User Flow ---
log "=== User Flow ==="
USER_JAR="/tmp/qa-user.txt"
rm -f "$USER_JAR"
user_otp=$(auth_login "$USER_JAR" "user@uaesales.demo" "User@123")
echo "$user_otp" | grep -q '"user"' && pass "User login + OTP" || fail "User login: $user_otp"

[[ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")" == "200" ]] && pass "Homepage" || fail "Homepage"
[[ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/search?q=iphone")" == "200" ]] && pass "Search" || fail "Search"
[[ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/listings/iphone-16-pro-max-256gb")" == "200" ]] && pass "Listing detail" || fail "Listing detail"

listing_id=$(curl -s "$BASE/api/listings" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'])" 2>/dev/null)
listing_slug="iphone-16-pro-max-256gb"

fav=$(curl -s -b "$USER_JAR" -X POST "$BASE/api/favorites" -H "Content-Type: application/json" -H "Origin: $BASE" -d "{\"listingId\":\"$listing_id\"}")
echo "$fav" | grep -q '"id"' && pass "Favorite listing" || fail "Favorite: $fav"

chat=$(curl -s -b "$USER_JAR" "$BASE/api/chat/conversations/by-listing/$listing_slug")
conv_id=$(echo "$chat" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")
[[ -n "$conv_id" ]] && pass "Chat conversation (GET)" || fail "Chat: $chat"

if [[ -n "$conv_id" ]]; then
  msg=$(curl -s -b "$USER_JAR" -X POST "$BASE/api/chat/conversations/$conv_id/messages" \
    -H "Content-Type: application/json" -H "Origin: $BASE" -d '{"text":"مرحباً"}')
  echo "$msg" | grep -q '"id"' && pass "Chat message sent" || fail "Chat message: $msg"
fi

[[ "$(curl -s -o /dev/null -w '%{http_code}' -b "$USER_JAR" "$BASE/checkout?listingId=$listing_id")" == "200" ]] && pass "Checkout page" || fail "Checkout page"

order=$(curl -s -b "$USER_JAR" -X POST "$BASE/api/orders" -H "Content-Type: application/json" -H "Origin: $BASE" \
  -d "{\"listingId\":\"$listing_id\",\"amount\":4500}")
order_id=$(echo "$order" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")
[[ -n "$order_id" ]] && pass "Order created" || fail "Order: $order"

if [[ -n "$order_id" ]]; then
  [[ "$(curl -s -o /dev/null -w '%{http_code}' -b "$USER_JAR" "$BASE/orders/$order_id")" == "200" ]] && pass "Order detail page" || fail "Order detail"
  confirm=$(curl -s -b "$USER_JAR" -X POST "$BASE/api/orders/$order_id/confirm-received" -H "Origin: $BASE")
  echo "$confirm" | grep -q '"id"' && pass "Confirm received" || fail "Confirm: $confirm"
fi

curl -s -b "$USER_JAR" "$BASE/api/wallet" | grep -q "availableBalance" && pass "Wallet API" || fail "Wallet"
curl -s -b "$USER_JAR" "$BASE/api/notifications" | grep -q '\[' && pass "Notifications" || fail "Notifications"
curl -s -b "$USER_JAR" -X POST "$BASE/api/auth/logout" -H "Origin: $BASE" > /dev/null && pass "Logout"

# --- Seller Flow ---
log "=== Seller Flow ==="
SELLER_JAR="/tmp/qa-seller.txt"
rm -f "$SELLER_JAR"
seller_otp=$(auth_login "$SELLER_JAR" "company@uaesales.demo" "Company@123")
echo "$seller_otp" | grep -q "business" && pass "Business login" || fail "Business login: $seller_otp"
[[ "$(curl -s -o /dev/null -w '%{http_code}' -b "$SELLER_JAR" "$BASE/dashboard/listings")" == "200" ]] && pass "My Listings" || fail "My Listings"

slug="qa-phone-$(date +%s)"
new_listing=$(curl -s -b "$SELLER_JAR" -X POST "$BASE/api/listings" -H "Content-Type: application/json" -H "Origin: $BASE" -d "{
  \"categoryId\":\"mobiles\",
  \"titleArabic\":\"هاتف تجريبي QA\",
  \"slug\":\"$slug\",
  \"descriptionArabic\":\"هاتف للبيع للاختبار التجريبي في البيتا\",
  \"price\":1999,
  \"condition\":\"used\",
  \"status\":\"active\"
}")
new_id=$(echo "$new_listing" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")
[[ -n "$new_id" ]] && pass "Add listing" || fail "Add listing: $new_listing"

if [[ -n "$new_id" ]]; then
  edit=$(curl -s -b "$SELLER_JAR" -X PATCH "$BASE/api/listings/$new_id" -H "Content-Type: application/json" -H "Origin: $BASE" -d '{"price":1899}')
  echo "$edit" | grep -q '"id"' && pass "Edit listing" || fail "Edit: $edit"
fi

curl -s -b "$SELLER_JAR" "$BASE/api/wallet" | grep -q "pendingBalance" && pass "Wallet pending balance" || fail "Wallet pending"

# --- Admin Flow ---
log "=== Admin Flow ==="
ADMIN_JAR="/tmp/qa-admin.txt"
rm -f "$ADMIN_JAR"
admin_otp=$(auth_login "$ADMIN_JAR" "admin@uaesales.demo" "Admin@123")
echo "$admin_otp" | grep -q "admin" && pass "Admin login" || fail "Admin login: $admin_otp"
[[ "$(curl -s -o /dev/null -w '%{http_code}' -b "$ADMIN_JAR" "$BASE/admin")" == "200" ]] && pass "Admin dashboard" || fail "Admin dashboard"
curl -s -b "$ADMIN_JAR" "$BASE/api/admin/users" | grep -q '\[' && pass "Admin users" || fail "Admin users"
curl -s -b "$ADMIN_JAR" "$BASE/api/admin/listings" | grep -q '\[' && pass "Admin listings" || fail "Admin listings"

# Approve/reject listing
if [[ -n "${new_id:-}" ]]; then
  patch=$(curl -s -b "$ADMIN_JAR" -X PATCH "$BASE/api/admin/listings/$new_id" -H "Content-Type: application/json" -H "Origin: $BASE" -d '{"status":"active","featured":true}')
  echo "$patch" | grep -q '"id"' && pass "Admin approve listing" || fail "Admin approve: $patch"
fi

curl -s -b "$ADMIN_JAR" "$BASE/api/admin/orders" | grep -q '\[' && pass "Admin orders" || fail "Admin orders"
curl -s -b "$ADMIN_JAR" "$BASE/api/admin/escrow" | grep -q '\[' && pass "Admin escrow" || fail "Admin escrow"
curl -s -b "$ADMIN_JAR" "$BASE/api/admin/disputes" | grep -q '\[' && pass "Admin disputes" || fail "Admin disputes"
curl -s -b "$ADMIN_JAR" "$BASE/api/admin/reports" | grep -q '{' && pass "Admin reports" || fail "Admin reports"

# User blocked from admin (middleware)
USER2_JAR="/tmp/qa-user2.txt"
rm -f "$USER2_JAR"
auth_login "$USER2_JAR" "user@uaesales.demo" "User@123" > /dev/null
admin_user_code=$(curl -s -o /dev/null -w '%{http_code}' -b "$USER2_JAR" "$BASE/admin/unauthorized")
[[ "$admin_user_code" == "200" ]] && pass "Admin unauthorized page exists" || fail "Unauthorized page ($admin_user_code)"
user_admin_redirect=$(curl -s -o /dev/null -w '%{redirect_url}' -b "$USER2_JAR" "$BASE/admin")
echo "$user_admin_redirect" | grep -q "unauthorized" && pass "Non-admin redirected from /admin" || fail "Non-admin admin access: $user_admin_redirect"

# --- Register ---
log "=== Register ==="
reg_email="beta-qa-$(date +%s)@test.demo"
reg=$(curl -s -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -H "Origin: $BASE" -d "{
  \"fullName\":\"Beta Tester\",
  \"email\":\"$reg_email\",
  \"phone\":\"0509998877\",
  \"password\":\"Test@123\",
  \"accountType\":\"individual\"
}")
echo "$reg" | grep -q "otpRequested" && pass "Register" || fail "Register: $reg"

# --- Image QA ---
log "=== Image QA ==="
broken=0; total=0
while IFS= read -r url; do
  [[ -z "$url" ]] && continue
  total=$((total+1))
  code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "$url" 2>/dev/null || echo "000")
  [[ "$code" != "200" ]] && broken=$((broken+1))
done < <(curl -s "$BASE/api/listings" | python3 -c "import sys,json; [print(l.get('imageUrl','')) for l in json.load(sys.stdin) if l.get('imageUrl')]")
[[ "$broken" -eq 0 && "$total" -gt 0 ]] && pass "All $total listing images OK" || fail "$broken/$total images broken"

# --- Performance smoke ---
log "=== Performance ==="
home_ms=$(curl -s -o /dev/null -w "%{time_total}" "$BASE/")
listing_ms=$(curl -s -o /dev/null -w "%{time_total}" "$BASE/listings/iphone-16-pro-max-256gb")
python3 -c "import sys; h=float('$home_ms'); l=float('$listing_ms'); print(f'Home {h:.2f}s Listing {l:.2f}s'); sys.exit(0 if h<3 and l<3 else 1)" && pass "Page load <3s (home ${home_ms}s, listing ${listing_ms}s)" || fail "Slow pages home=${home_ms}s listing=${listing_ms}s"

echo ""
echo "========== SUMMARY =========="
echo "PASSED: $PASS"
echo "FAILED: $FAIL"
if [[ ${#BUGS[@]} -gt 0 ]]; then
  echo "REMAINING:"
  for b in "${BUGS[@]}"; do echo "  - $b"; done
fi
