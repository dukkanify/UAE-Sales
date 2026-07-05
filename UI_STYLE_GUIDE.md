# UAE Sales — UI Style Guide

## Visual Identity

UAE Sales is a **premium UAE marketplace** — not a generic classifieds template. The visual language combines:

- **Luxury Charcoal** authority (like Stripe, Linear)
- **Warm Gold** elegance (UAE heritage)
- **Clean whitespace** (Apple, Airbnb)
- **Trust signals** (escrow, verification — Property Finder, Dubizzle elevated)

## Do's

### Layout
- Use `.app-container` for all page content
- Use `.section-padding` between major homepage sections
- Alternate section backgrounds: default → `bg-surface-muted/40` → default
- Center hero and CTA content with `max-w-*` constraints

### Typography
- Headings: `font-black`, tight tracking
- Body: `font-medium`, `leading-8` for Arabic readability
- Labels: `font-bold`, `text-sm`
- Never use cramped line heights below `leading-6` for Arabic

### Colors
- Primary actions: `bg-primary text-white`
- Secondary/promotional CTAs: `bg-secondary text-primary`
- Prices: `text-accent`
- Success/escrow: `text-success` / `bg-success-soft`
- Muted metadata: `text-muted`

### Cards
- Always use `rounded-[var(--radius-lg)]` or Card component
- Hover: `-translate-y-1` + elevated shadow
- Image cards: gradient overlay at bottom for badge readability

### Buttons
- Minimum height: 44px (`min-h-11`)
- Always show visible Arabic label
- Use `rounded-xl` (not pill on primary actions — reserved for search)

### Forms
- Label above input
- Error messages: `text-accent`, `text-sm font-bold`
- Success messages: `bg-success-soft text-success`

## Don'ts

- ❌ Bootstrap-style heavy borders and flat gray backgrounds
- ❌ Green as primary brand color (use emerald only for success)
- ❌ Icon-only buttons without visible text or `aria-label`
- ❌ Heavy gradients on every section
- ❌ Lorem ipsum or developer placeholder copy in UI
- ❌ Inconsistent border radius (mixing `rounded-full` and `rounded-xl` on same page level)
- ❌ Dark text on dark backgrounds

## Page Patterns

### Homepage
1. Hero with search
2. Stats strip
3. Categories grid
4. Featured listings
5. Latest listings
6. Escrow explainer
7. Why UAE Sales
8. How it works (dark panel)
9. Popular cities
10. Testimonials
11. App download
12. Footer

### Dashboard
- Sidebar: profile, nav, wallet, notifications
- Stats row at top
- Tabs for filtering
- Activity feed sidebar
- Listing rows with actions

### Auth
- Split layout: dark trust panel + white form
- Trust points as glass cards
- Footer link to alternate auth flow

### Listing Detail
- Large gallery
- Price prominent in accent
- Escrow protection card
- Seller panel with rating

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `< 640px` | Single column, mobile nav drawer, stacked forms |
| `640–1024px` | 2-column grids, compact header |
| `> 1024px` | Full sidebar, 3–4 column listing grids |

## Animation Guidelines

- Hover lift: `transition duration-300`
- Image zoom: `group-hover:scale-[1.03]`
- Button press: `active:translate-y-0` after hover lift
- Page sections: optional `animate-fade-up` for hero only
- No spinning loaders, bouncing elements, or parallax

## Copy Tone

- Professional Arabic
- Trust-focused: ضمان، موثق، آمن
- Action-oriented CTAs: أضف إعلان، ابدأ الآن، تصفح
- No technical jargon visible to users (no "mock", "API", "localStorage")
