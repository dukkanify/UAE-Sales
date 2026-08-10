# Brand guidelines alignment

Applied from the official **AVIATOR PASS Brand Guidelines** PDF.

## Applied

- Palette: Aero Blue `#2E7DAA`, Altitude Orange `#DD9B30`, Academic Grey `#7C7B80`
- Tagline: **YOUR AVIATION JOURNEY STARTS HERE**
- Secondary (stacked): **UNLOCK YOUR PILOT LICENSE**
- Logos: horizontal + dark + stacked + OG under `public/brand/`
- Guidelines PDF: `public/brand/source/AVIATORPASS_Brand_Guidelines.pdf`
- Tokens: `styles/globals.css`, `config/theme.ts`, `config/design-system.ts`, `config/branding.ts`
- Surfaces: marketing hero, footer, emails, invoices, charts, manifest, maintenance

## Pending (licensed asset)

- **Stimulatio Flat** font files — place under `public/fonts/` and wire via `next/font/local`, then set `brandingConfig.pending.officialTypography = false` and `typographyPending: false` in platform settings defaults.
- Until then, headings use **Space Grotesk** as the approved web substitute.
