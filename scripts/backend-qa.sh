#!/usr/bin/env bash
# Backend QA test script — run against local dev server
set -euo pipefail

BASE="${BASE_URL:-http://localhost:3000}"
COOKIE_JAR="/tmp/uae-sales-qa-cookies.txt"
PASSED=0
FAILED=0
RESULTS=()

log_pass() { PASSED=$((PASSED+1)); RESULTS+=("PASS: $1"); echo "✅ PASS: $1"; }
log_fail() { FAILED=$((FAILED+1)); RESULTS+=("FAIL: $1 — $2"); echo "❌ FAIL: $1 — $2"; }

assert_status() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    log_pass "$name (HTTP $actual)"
  else
    log_fail "$name" "expected HTTP $expected, got $actual"
  fi
}

assert_json_field() {
  local name="$1" json="$2" field="$3"
  if echo "$json" | jq -e ".$field" >/dev/null 2>&1; then
    log_pass "$name (has .$field)"
  else
    log_fail "$name" "missing .$field in response"
  fi
}

echo "=== UAE Sales Backend QA ==="
echo "Base URL: $BASE"
rm -f "$COOKIE_JAR"

# --- Health ---
STATUS=$(curl -s -o /tmp/qa-health.json -w "%{http_code}" "$BASE/api/health")
assert_status "GET /api/health" "200" "$STATUS"
if jq -e '.database == true' /tmp/qa-health.json >/dev/null 2>&1; then
  log_pass "Health reports database=true"
else
  log_fail "Health database flag" "$(cat /tmp/qa-health.json)"
fi

# --- Categories ---
STATUS=$(curl -s -o /tmp/qa-categories.json -w "%{http_code}" "$BASE/api/categories")
assert_status "GET /api/categories" "200" "$STATUS"
COUNT=$(jq 'length' /tmp/qa-categories.json)
if [ "$COUNT" -ge 13 ]; then
  log_pass "Categories count >= 13 ($COUNT)"
else
  log_fail "Categories count" "got $COUNT"
fi

STATUS=$(curl -s -o /tmp/qa-category-slug.json -w "%{http_code}" "$BASE/api/categories/cars")
assert_status "GET /api/categories/cars" "200" "$STATUS"
assert_json_field "Category by slug" "$(cat /tmp/qa-category-slug.json)" "slug"

STATUS=$(curl -s -o /tmp/qa-category-missing.json -w "%{http_code}" "$BASE/api/categories/nonexistent-xyz")
assert_status "GET /api/categories/nonexistent (404)" "404" "$STATUS"

# --- Listings ---
STATUS=$(curl -s -o /tmp/qa-listings.json -w "%{http_code}" "$BASE/api/listings")
assert_status "GET /api/listings" "200" "$STATUS"
LCOUNT=$(jq 'length' /tmp/qa-listings.json)
if [ "$LCOUNT" -ge 35 ]; then
  log_pass "Listings count >= 35 ($LCOUNT)"
else
  log_fail "Listings count" "got $LCOUNT"
fi

STATUS=$(curl -s -o /tmp/qa-listing-slug.json -w "%{http_code}" "$BASE/api/listings?slug=mercedes-amg-g63-2024")
assert_status "GET /api/listings?slug=mercedes-amg-g63-2024" "200" "$STATUS"
assert_json_field "Listing by slug" "$(cat /tmp/qa-listing-slug.json)" "slug"

STATUS=$(curl -s -o /tmp/qa-listing-missing.json -w "%{http_code}" "$BASE/api/listings?slug=nonexistent-listing-xyz")
assert_status "GET /api/listings?slug=missing (404)" "404" "$STATUS"

# --- Auth: Invalid login ---
STATUS=$(curl -s -o /tmp/qa-bad-login.json -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@uaesales.demo","password":"WrongPassword"}')
assert_status "POST /api/auth/login invalid password (401)" "401" "$STATUS"

# --- Auth: User account ---
rm -f "$COOKIE_JAR"
STATUS=$(curl -s -o /tmp/qa-user-login.json -w "%{http_code}" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@uaesales.demo","password":"User@123"}')
assert_status "User login step 1" "200" "$STATUS"

STATUS=$(curl -s -o /tmp/qa-user-otp.json -w "%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@uaesales.demo","code":"123456"}')
assert_status "User OTP verify" "200" "$STATUS"
assert_json_field "User OTP response" "$(cat /tmp/qa-user-otp.json)" "user"
assert_json_field "User OTP token" "$(cat /tmp/qa-user-otp.json)" "token"

USER_EMAIL=$(jq -r '.user.email' /tmp/qa-user-otp.json)
if [ "$USER_EMAIL" = "user@uaesales.demo" ]; then
  log_pass "User email matches demo account"
else
  log_fail "User email" "got $USER_EMAIL"
fi

STATUS=$(curl -s -o /tmp/qa-user-me.json -w "%{http_code}" -b "$COOKIE_JAR" "$BASE/api/auth/me")
assert_status "GET /api/auth/me (user)" "200" "$STATUS"

STATUS=$(curl -s -o /tmp/qa-dashboard-summary.json -w "%{http_code}" -b "$COOKIE_JAR" "$BASE/api/dashboard/summary")
assert_status "GET /api/dashboard/summary (user)" "200" "$STATUS"

STATUS=$(curl -s -o /tmp/qa-dashboard-listings.json -w "%{http_code}" -b "$COOKIE_JAR" "$BASE/api/dashboard/listings")
assert_status "GET /api/dashboard/listings (user)" "200" "$STATUS"
DLCOUNT=$(jq 'length' /tmp/qa-dashboard-listings.json)
if [ "$DLCOUNT" -ge 5 ]; then
  log_pass "Dashboard listings count >= 5 ($DLCOUNT)"
else
  log_fail "Dashboard listings count" "got $DLCOUNT"
fi

STATUS=$(curl -s -o /tmp/qa-wallet.json -w "%{http_code}" -b "$COOKIE_JAR" "$BASE/api/wallet")
assert_status "GET /api/wallet (user)" "200" "$STATUS"

STATUS=$(curl -s -o /tmp/qa-wallet-tx.json -w "%{http_code}" -b "$COOKIE_JAR" "$BASE/api/wallet/transactions")
assert_status "GET /api/wallet/transactions (user)" "200" "$STATUS"

# --- Unauthorized dashboard ---
STATUS=$(curl -s -o /tmp/qa-unauth-dashboard.json -w "%{http_code}" "$BASE/api/dashboard/summary")
assert_status "GET /api/dashboard/summary unauthorized (401)" "401" "$STATUS"

# --- Logout ---
STATUS=$(curl -s -o /tmp/qa-logout.json -w "%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/logout")
assert_status "POST /api/auth/logout" "200" "$STATUS"

STATUS=$(curl -s -o /tmp/qa-me-after-logout.json -w "%{http_code}" -b "$COOKIE_JAR" "$BASE/api/auth/me")
assert_status "GET /api/auth/me after logout (401)" "401" "$STATUS"

# --- Auth: Business account ---
rm -f "$COOKIE_JAR"
curl -s -c "$COOKIE_JAR" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"company@uaesales.demo","password":"Company@123"}' >/dev/null
STATUS=$(curl -s -o /tmp/qa-business-otp.json -w "%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"company@uaesales.demo","code":"123456"}')
assert_status "Business OTP verify" "200" "$STATUS"
BIZ_ROLE=$(jq -r '.user.role' /tmp/qa-business-otp.json)
if [ "$BIZ_ROLE" = "business" ]; then
  log_pass "Business role is business"
else
  log_fail "Business role" "got $BIZ_ROLE"
fi

# --- Auth: Admin account ---
rm -f "$COOKIE_JAR"
curl -s -c "$COOKIE_JAR" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@uaesales.demo","password":"Admin@123"}' >/dev/null
STATUS=$(curl -s -o /tmp/qa-admin-otp.json -w "%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@uaesales.demo","code":"123456"}')
assert_status "Admin OTP verify" "200" "$STATUS"
ADMIN_ROLE=$(jq -r '.user.role' /tmp/qa-admin-otp.json)
if [ "$ADMIN_ROLE" = "admin" ]; then
  log_pass "Admin role is admin"
else
  log_fail "Admin role" "got $ADMIN_ROLE"
fi

# --- Invalid OTP ---
rm -f "$COOKIE_JAR"
curl -s -c "$COOKIE_JAR" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@uaesales.demo","password":"User@123"}' >/dev/null
STATUS=$(curl -s -o /tmp/qa-bad-otp.json -w "%{http_code}" -X POST "$BASE/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@uaesales.demo","code":"000000"}')
assert_status "Invalid OTP (401)" "401" "$STATUS"

# --- Invalid request body ---
STATUS=$(curl -s -o /tmp/qa-bad-body.json -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"x"}')
assert_status "Invalid login body (400)" "400" "$STATUS"

# --- Orders (need auth + listing) ---
rm -f "$COOKIE_JAR"
curl -s -c "$COOKIE_JAR" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@uaesales.demo","password":"User@123"}' >/dev/null
curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@uaesales.demo","code":"123456"}' >/dev/null

LISTING_ID=$(jq -r '.[0].id' /tmp/qa-listings.json)
STATUS=$(curl -s -o /tmp/qa-order-create.json -w "%{http_code}" -b "$COOKIE_JAR" -X POST "$BASE/api/orders" \
  -H "Content-Type: application/json" \
  -d "{\"listingId\":\"$LISTING_ID\",\"amount\":5000,\"paymentFee\":50}")
assert_status "POST /api/orders" "201" "$STATUS"
ORDER_ID=$(jq -r '.id' /tmp/qa-order-create.json)
if [ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ]; then
  log_pass "Order created with id $ORDER_ID"
else
  log_fail "Order creation" "no order id"
fi

STATUS=$(curl -s -o /tmp/qa-order-get.json -w "%{http_code}" -b "$COOKIE_JAR" "$BASE/api/orders/$ORDER_ID")
assert_status "GET /api/orders/[id]" "200" "$STATUS"

# --- Frontend pages (SSR with DB) ---
for PAGE in "/" "/search" "/categories" "/categories/cars" "/listings/mercedes-amg-g63-2024" "/dashboard/listings" "/login"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$PAGE")
  if [ "$STATUS" = "200" ]; then
    log_pass "Page loads $PAGE (HTTP 200)"
  else
    log_fail "Page $PAGE" "HTTP $STATUS"
  fi
done

echo ""
echo "=== SUMMARY ==="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
printf '%s\n' "${RESULTS[@]}"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi
