# Button System Report — UAE Sales

توحيد نظام الأزرار عبر المنصة باستخدام مكون واحد: `shared/ui/Button.tsx`.

**Branch:** `cursor/button-system-unification-37ba`  
**Validation:** `npm run lint` ✅ · `npm run build` ✅

---

## 1. Button Variants

| Variant | Use case | Examples |
|---------|----------|----------|
| `primary` | Primary actions | تطبيق الفلاتر، حفظ التغييرات، إنشاء الحساب |
| `secondary` | Secondary actions | رجوع، تصفح الإعلانات |
| `outline` | Filters, light actions | مفضلة، مشاركة، فلاتر غير نشطة |
| `ghost` | Tables, lists, inline actions | تسجيل الخروج، إزالة مرفق، تحديد صف |
| `danger` | Destructive actions | حذف، رفض، إلغاء، استرداد |
| `success` | Approve / confirm | قبول، تأكيد الاستلام، تحرير المبلغ |
| `gold` | UAE brand CTAs | أضف إعلانك، شراء الآن، تأكيد الدفع، بحث |
| `accent` | Alias → `gold` | Backward compatibility |

---

## 2. Button Sizes

| Size | Height | Padding inline | Typical use |
|------|--------|----------------|-------------|
| `sm` | 36px (`h-9`) | 14px | Filters, cards, compact actions |
| `md` | 42px | 18px | Default — header, forms, dashboard |
| `lg` | 50px | 24px (`px-6`) | Hero search CTA |
| `xl` | 58px | 30px | Large promotional CTAs |

**Shared layout rules (all sizes):**
- `inline-flex` · `items-center` · `justify-center`
- `whitespace-nowrap` · `overflow-visible` · `shrink-0`
- Icon gap via `gap-*` per size
- `shape`: `rounded` (default) or `pill`

---

## 3. Button States

| State | Implementation |
|-------|----------------|
| Default | Variant color + shadow |
| Hover | `hover:brightness-*`, `hover:bg-surface-muted`, `interactive-lift` |
| Active | `active:brightness-95` |
| Focus | `focus-ring` utility (keyboard-visible) |
| Disabled | `disabled` + `opacity-60` + `pointer-events-none` |
| Loading | Spinner icon (`clock`, 16px), `aria-busy`, button disabled |

---

## 4. Icon Rules

- Icons use `Icon` component with fixed size (typically 16–20px)
- `shrink-0` on all icons
- Gap between icon and label via size-based `gap-*`
- RTL: flex order preserves correct icon/text placement
- `iconOnly` buttons require `aria-label` (dev warning if missing)

---

## 5. Core Component

**File:** `shared/ui/Button.tsx`

**Props:** `variant`, `size`, `shape`, `fullWidth`, `loading`, `iconOnly`, `href` (renders as Next.js `Link`), standard button HTML attributes.

**Rendering:**
- `href` without disabled/loading → `<Link>`
- Otherwise → `<button type="button|submit">`

---

## 6. Files Updated (27)

### Core
- `shared/ui/Button.tsx` — unified variants, sizes, states, loading, icon-only

### Headers & Homepage (buttons only — layout unchanged)
- `shared/layouts/SiteHeader.tsx`
- `features/home/components/marketplace/MarketHeader.tsx`
- `features/home/components/marketplace/MarketHeroSearch.tsx`
- `features/home/components/marketplace/MarketEscrow.tsx`

### Shared actions
- `shared/components/FavoriteButton.tsx`
- `shared/components/ShareButton.tsx`
- `shared/components/CardShareButton.tsx`

### Auth
- `features/auth/components/OtpVerification.tsx`

### Listings
- `features/listings/components/BuyNowButton.tsx`
- `features/listings/components/AddListingForm.tsx`
- `features/listings/components/ListingDetailToolbar.tsx`
- `features/listings/components/PremiumListingCard.tsx`

### Commerce
- `features/checkout/components/CheckoutForm.tsx`
- `features/orders/components/OrderDetailPanel.tsx`
- `features/disputes/components/DisputeForm.tsx`
- `app/escrow/page.tsx`

### Chat & Notifications
- `features/chat/components/MessageInput.tsx`
- `features/chat/components/ChatShell.tsx`
- `features/notifications/components/NotificationCard.tsx`

### Search & Dashboard
- `features/search/components/SavedSearches.tsx`
- `features/dashboard/components/DashboardShell.tsx`

### Admin
- `features/admin/components/AdminShell.tsx`
- `features/admin/components/AdminListingsPanel.tsx`
- `features/admin/components/AdminDisputesPanel.tsx`
- `features/admin/components/AdminEscrowPanel.tsx`
- `features/admin/components/AdminUsersPanel.tsx`

---

## 7. Inline Buttons Replaced

| Location | Before | After |
|----------|--------|-------|
| SiteHeader / MarketHeader | Styled links & raw buttons for CTA, menu, logout | `Button` gold / outline / ghost |
| MarketHeroSearch | Custom styled submit | `Button variant="gold" size="lg"` |
| BuyNowButton, CheckoutForm | Mixed accent classes | `Button variant="gold"` |
| OrderDetailPanel, DisputeForm | Inline danger/success styles | `Button variant="danger|success"` |
| Admin panels | Raw `<button>` for actions & row select | `Button` with semantic variants |
| ChatShell, MessageInput | Icon buttons without system | `Button iconOnly` + `aria-label` |
| FavoriteButton, ShareButton | Custom border/hover classes | `Button variant="outline"` |
| SavedSearches, NotificationCard | Text links as actions | `Button variant="ghost" size="sm"` |
| OtpVerification | Inline resend/back buttons | `Button ghost / outline` |

**Total CTA/action buttons migrated:** 80+ instances across 27 files.

---

## 8. Intentionally Excluded (not CTAs)

These remain as native `<button>` because they are selection controls, not action buttons:

| File | Reason |
|------|--------|
| `features/listings/components/ListingGallery.tsx` | Image thumbnail picker |
| `features/listings/components/add-listing/CategorySelectionStep.tsx` | Category card selector |
| `shared/ui/Tabs.tsx` | Tab navigation primitive |

**Navigation links** (header nav, footer, breadcrumbs, text links in forms) remain `<Link>` — they are navigation, not buttons. CTAs that navigate use `Button href="..."`.

---

## 9. Accessibility Fixes

- All icon-only buttons have `aria-label` (menu, search, share, favorite, attach remove)
- `aria-busy` + `disabled` during loading state
- `aria-pressed` on toggle buttons (favorite)
- `aria-expanded` on mobile menu toggle
- Real `disabled` attribute (not CSS-only)
- `focus-ring` for keyboard navigation
- No button-inside-link or link-inside-button nesting for CTAs
- Dev warning when `iconOnly` lacks `aria-label`

---

## 10. Special Fixes Verified

| Item | Fix |
|------|-----|
| Header «أضف إعلانك» | `whitespace-nowrap`, `overflow-visible`, `shrink-0`, pill gold `md` |
| Hero search button | `gold` `lg` with existing shadow override preserved |
| شراء الآن | `BuyNowButton` → `gold` fullWidth |
| تأكيد الدفع | `CheckoutForm` → `gold` with loading |
| Dashboard / Admin | Same `Button` variants as rest of site |
| Mobile drawer | `fullWidth` gold CTA, `iconOnly` menu with `aria-label` |
| RTL icon order | Flex gap + `shrink-0` icons |

---

## 11. Pages Checked

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ | MarketHeader + HeroSearch gold buttons |
| `/login` | ✅ | LoginForm primary submit |
| `/register` | ✅ | RegisterForm primary submit |
| `/forgot-password` | ✅ | ForgotPasswordForm primary |
| `/search` | ✅ | SearchFilters primary + outline chips |
| `/categories` | ✅ | EmptyState / nav links unchanged |
| `/categories/[slug]` | ✅ | Listing cards use unified share/favorite |
| `/featured` | ✅ | Card action buttons |
| `/listings/[slug]` | ✅ | BuyNow gold, toolbar outline/ghost |
| `/listings/new` | ✅ | AddListingForm primary submit |
| `/dashboard/listings` | ✅ | DashboardShell + MyListings actions |
| `/profile` | ✅ | ProfileForm primary |
| `/checkout` | ✅ | CheckoutForm gold confirm |
| `/orders` | ✅ | OrdersList links + actions |
| `/orders/[id]` | ✅ | OrderDetailPanel success/danger |
| `/wallet` | ✅ | Wallet page Button imports |
| `/escrow` | ✅ | Escrow page unified buttons |
| `/chat` | ✅ | ChatShell + MessageInput |
| `/notifications` | ✅ | NotificationCard ghost actions |
| `/admin` | ✅ | AdminShell navigation |
| `/admin/users` | ✅ | danger/success + ghost row select |
| `/admin/listings` | ✅ | approve/reject/suspend variants |
| `/admin/orders` | ✅ | filter + action buttons |
| `/admin/disputes` | ✅ | ghost row cards + resolve actions |

---

## 12. Remaining Issues / Notes

1. **Navigation styling** — Header/footer nav links use link-specific hover styles (not `Button`). This is intentional per spec: navigation stays as links.
2. **Gallery thumbnails & category cards** — Selection UIs use native buttons with custom selected-state styling; migrating would add complexity without UX benefit.
3. **Tabs component** — Internal tab buttons use its own primitive; separate from CTA button system.
4. **Filter chips on homepage** (`MarketHero.tsx`) — Decorative category chips, not action buttons; left unchanged to preserve homepage design.
5. **Homepage layout** — No structural or visual layout changes; only button elements within existing slots were unified.

---

## 13. Usage Examples

```tsx
// Primary CTA
<Button variant="gold" size="md" href="/listings/new">
  <Icon name="plus" size={16} className="shrink-0" />
  أضف إعلانك
</Button>

// Form submit with loading
<Button type="submit" variant="primary" loading={isLoading} fullWidth>
  تأكيد الدفع
</Button>

// Icon-only with accessibility
<Button iconOnly aria-label="بحث" variant="ghost" href="/search">
  <Icon name="search" size={20} />
</Button>

// Destructive action
<Button variant="danger" size="sm" onClick={handleReject}>
  رفض
</Button>
```

---

*Generated as part of the Global Button System Unification task.*
