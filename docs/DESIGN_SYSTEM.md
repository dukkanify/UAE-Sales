# ATPL PASS Design System

Enterprise UI foundation for the Aviation Education Platform.

## Principles

- Premium SaaS quality (Stripe / Linear / Vercel caliber)
- Deep aviation blue + sky accent
- English LTR only
- Light theme default; dark + system supported
- Reusable primitives — no business logic in this layer

## Tokens

| Token | Value |
|-------|--------|
| Primary | `#0B1F3A` Deep Aviation Blue |
| Accent | `#38BDF8` Sky Blue |
| Success / Warning / Danger | Green / Orange / Red |
| Background | `#F3F4F6` Light Gray |
| Cards | White |
| Radius | 12–16px (`--radius: 0.75rem`) |
| Display font | Plus Jakarta Sans |
| Body font | DM Sans |

Source files:

- `config/design-system.ts` — breakpoints, type scale, motion, empty presets
- `config/theme.ts` — color scales
- `styles/globals.css` — CSS variables + utilities (`.text-h1`, `.shadow-soft`, …)

## Layouts

| Layout | Path | Use |
|--------|------|-----|
| Public | `PublicLayout` | Marketing |
| Auth | `AuthLayout` | Login / register / OTP |
| Dashboard | `RoleShell` | Role dashboards |
| Blank | `BlankLayout` | Minimal chrome |
| System | `SystemLayout` | Status pages |

## Navigation

- Header, Footer, Sidebar, Breadcrumb, Role top nav
- User menu + notification bell (dashboard shell)
- **Command palette** — `⌘K` / `Ctrl+K` (`components/navigation/command-palette.tsx`)

## Component inventory

Import from `@/components/ui`.

**Buttons:** primary, secondary, outline, ghost, accent, success, warning, danger, loading, icon, `ButtonGroup`, `SplitButton`

**Forms:** Input, Textarea, Select, MultiSelect, Checkbox, Radio, Switch, DatePicker, TimePicker, PhoneInput, OtpInput, FileUpload, ColorPicker, PasswordInput, SearchInput, CurrencyInput

**Feedback:** Toast (sonner), Alert, Banner, EmptyState + presets, Skeleton, Progress, Spinner

**Data:** Table + DataTable, Pagination, Badge, Tag, Avatar, Timeline, StatCard, Charts

**Overlays:** Dialog/Modal, Drawer, Popover, Tooltip, Dropdown, ContextMenu, ConfirmationDialog

**Media:** `OptimizedImage` (lazy + fallback)

**Motion:** `PageTransition`, `FadeIn`, `HoverLift`

## Showcase

Interactive catalog: [`/design-system`](/design-system)

## Error & empty pages

| Route | Purpose |
|-------|---------|
| `/` 404 via `app/not-found.tsx` | Not found |
| `/401` | Sign in required |
| `/403` | Forbidden |
| `app/error.tsx` | 500 |
| `/maintenance` | Maintenance |
| `/coming-soon` | Coming soon |
| `/offline` | No internet |
| Preset empty states | courses, students, notifications, calendar, messages, community, reports |

## Accessibility

- Focus rings via `:focus-visible`
- ARIA labels on icon buttons, OTP digits, command palette
- Keyboard: command palette, OTP paste/backspace, dropdowns (Radix)
- Color contrast targets WCAG AA on primary surfaces

## Theme

`ThemeProvider` (`next-themes`) + `ThemeToggle` — light / dark / system.

## Performance

- `optimizePackageImports` for lucide / recharts / framer-motion / date-fns
- Lazy images via `OptimizedImage`
- Showcase and heavy widgets are client components; route shells stay server where possible

## Do not

- Put auth, courses, Zoom, payments, or learning logic in design-system components
- Mix icon libraries (Lucide only)
- Use inline styles except controlled color swatches in the showcase
