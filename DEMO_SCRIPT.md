# Demo Script — UAE Sales

**Duration:** ~20–25 minutes  
**Audience:** Investors, partners, stakeholders  
**Language:** Arabic UI (present in Arabic or English as preferred)

> Before starting: complete `DEMO_SETUP.md` and review `DEMO_CREDENTIALS.md`.

---

## Part 1 — Buyer Journey (12 min)

*Login as **User** if not already logged in: `user@uaesales.demo` / `User@123` / OTP `123456`*

### Step 1 — Open Homepage
- **URL:** `http://localhost:3000`
- **Say:** "UAE Sales is an Arabic-first classifieds marketplace for the UAE, built with trust and escrow at the center."
- **Show:** Featured listings, categories, RTL layout, premium marketplace feel
- **Time:** 1 min

### Step 2 — Search for Mercedes
- **Action:** Use the search bar or go to `/search?q=مرسيدس` (or `mercedes`)
- **Say:** "Buyers can search across cars, real estate, electronics, and more with filters."
- **Show:** Search results with the Mercedes-AMG G63 listing
- **Time:** 1 min

### Step 3 — Open Listing
- **URL:** `/listings/mercedes-amg-g63-2024`
- **Say:** "Each listing has rich detail — gallery, seller info, escrow badge, and safety tips."
- **Show:** Image gallery, price (895,000 AED), verified seller badge, escrow available
- **Time:** 2 min

### Step 4 — Chat with Seller
- **Action:** Click the chat / message seller button on the listing
- **Say:** "Buyers can negotiate directly with sellers before committing to purchase."
- **Show:** Conversation opens, send a message e.g. "هل السيارة متوفرة للمعاينة؟"
- **Time:** 2 min

### Step 5 — Buy Now
- **Action:** Click **Buy Now** (or equivalent CTA on listing)
- **Say:** "When ready, the buyer moves into a protected checkout flow."
- **Show:** Redirect to checkout with listing pre-selected
- **Time:** 30 sec

### Step 6 — Checkout
- **URL:** `/checkout?listingId=listing-car-001`
- **Say:** "Payment is held in escrow — neither party risks the full transaction upfront."
- **Show:** Order summary, fees breakdown, confirm purchase
- **Action:** Complete the order
- **Time:** 2 min

### Step 7 — Order Details
- **Action:** Navigate to `/orders` → open the new order
- **Say:** "Both buyer and seller have full visibility into order status."
- **Show:** Order number, listing preview, status, escrow state
- **Time:** 1 min

### Step 8 — Confirm Received
- **Action:** On order detail, click **Confirm Received**
- **Say:** "The buyer confirms delivery, which triggers escrow release to the seller."
- **Show:** Status updates after confirmation
- **Time:** 1 min

### Step 9 — Wallet Update
- **URL:** `/wallet`
- **Say:** "Every user has a wallet showing available and pending balances from transactions."
- **Show:** Balance, transaction history (deposits, escrow holds, releases)
- **Time:** 1 min

### Step 10 — Logout
- **Action:** Log out from profile/menu
- **Time:** 15 sec

---

## Part 2 — Seller Journey (5 min)

### Step 11 — Login as Business Seller
- **URL:** `/login`
- **Credentials:** `company@uaesales.demo` / `Company@123` / OTP `123456`
- **Say:** "Business sellers manage inventory, orders, and payouts from a dedicated dashboard."
- **Time:** 1 min

### Step 12 — Add Listing
- **URL:** `/listings/new`
- **Action:** Create a new listing (e.g. phone or car)
  - Title: `سيارة تجريبية للعرض`
  - Category: mobiles or cars
  - Price: e.g. `45000`
  - Condition: used
- **Say:** "Sellers publish listings in minutes with category-specific fields."
- **Time:** 2 min

### Step 13 — View My Listings
- **URL:** `/dashboard/listings`
- **Say:** "Sellers track all their ads — active, draft, and pending review."
- **Show:** Listing list including the new entry and Mercedes G63 (Al Noor Motors)
- **Time:** 1 min

### Step 14 — Logout
- **Action:** Log out
- **Time:** 15 sec

---

## Part 3 — Admin Journey (6 min)

### Step 15 — Login as Admin
- **URL:** `/login`
- **Credentials:** `admin@uaesales.demo` / `Admin@123` / OTP `123456`
- **Say:** "Platform operators have a full admin panel for moderation and oversight."
- **Time:** 1 min

### Step 16 — Review Users
- **URL:** `/admin/users`
- **Show:** User list, verify/suspend controls, search
- **Say:** "We can verify sellers, suspend bad actors, and manage trust."
- **Time:** 1 min

### Step 17 — Review Listings
- **URL:** `/admin/listings`
- **Show:** All listings, approve/reject, feature/premium toggles
- **Action:** Optionally feature the newly created listing
- **Say:** "Listings go through moderation before going live at scale."
- **Time:** 1.5 min

### Step 18 — Review Escrow
- **URL:** `/admin/escrow`
- **Show:** Escrow transactions — held, released, refunded
- **Say:** "Admin has full visibility into funds held in escrow and can intervene in disputes."
- **Time:** 1 min

### Step 19 — Review Reports
- **URL:** `/admin/reports`
- **Show:** Platform metrics — users, listings, orders, revenue indicators
- **Say:** "Operational reporting gives leadership a single view of marketplace health."
- **Time:** 1 min

---

## Closing (1 min)

- **Say:** "UAE Sales combines the reach of classifieds with the trust of escrow, wallet, chat, and admin tooling — ready for beta with a clear path to production."
- **Offer:** `INVESTOR_DEMO_NOTES.md` for business context, `BETA_QA_REPORT.md` for technical validation

---

## Demo Shortcuts (if running short on time)

| Skip | Jump to |
|------|---------|
| Chat | Step 5 (Buy Now) directly |
| Add listing | Step 13 (My Listings only) |
| Reports | End after escrow (Step 18) |

## Key URLs Reference

| Page | URL |
|------|-----|
| Homepage | `/` |
| Search Mercedes | `/search?q=مرسيدس` |
| Mercedes listing | `/listings/mercedes-amg-g63-2024` |
| Checkout | `/checkout?listingId=listing-car-001` |
| Orders | `/orders` |
| Wallet | `/wallet` |
| Add listing | `/listings/new` |
| My listings | `/dashboard/listings` |
| Admin | `/admin` |
