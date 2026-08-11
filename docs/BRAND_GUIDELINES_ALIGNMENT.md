# Brand guidelines alignment

Applied from the official **AVIATOR PASS Brand Guidelines** PDF — **Option A: Horizon Blue & Sun Gold**.

## Applied

- Palette core: Horizon Blue / Aero Blue `#2E7DAA`, Sun Gold / Altitude Orange `#DD9B30`, Academic Grey `#7C7B80`
- Supporting companions: Cloud `#F7FAFC`, Sky Mist `#E8F3F8`, Navy Ink `#0F2A3D`, Sand Glow `#F8F1E4`, Sun Soft `#F3E0B8`, Mist Grey `#D5DCE3`
- Tagline: **YOUR AVIATION JOURNEY STARTS HERE**
- Secondary (stacked): **UNLOCK YOUR PILOT LICENSE**
- Logos: transparent PNG lockups + SVG masters under `public/brand/` (UI prefers PNG)
- Guidelines PDF: `public/brand/source/AVIATORPASS_Brand_Guidelines.pdf`
- Option A reference: `public/brand/source/option-a-horizon-sun-gold.png`
- Tokens: `styles/globals.css`, `config/theme.ts`, `config/design-system.ts`, `config/branding.ts`
- Surfaces: marketing hero, footer, emails, invoices, charts, manifest, maintenance

## Pending (licensed asset)

- **Stimulatio Flat** font files — place under `public/fonts/` and wire via `next/font/local`, then set `brandingConfig.pending.officialTypography = false` and `typographyPending: false` in platform settings defaults.
- Until then, headings use **Space Grotesk** as the approved web substitute.
