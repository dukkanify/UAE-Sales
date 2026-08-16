# Brand guidelines alignment

Applied from the official **AVIATOR PASS Brand Guidelines** PDF.

## Applied

- Palette core: Aviator Blue `#143048`, Aviator Gold `#CCA04C` (gradient `#9E712E → #CCA04C → #F6C36C`), Academic Grey `#7C7B80`
- Supporting companions: Cloud `#F4F6F8`, Sky Mist `#E6ECF1`, Navy Ink `#0D2235`, Sand Glow `#F8F1E4`, Sun Soft `#F3E4C0`, Mist Grey `#D5D8DD`
- Tagline: **YOUR AVIATION JOURNEY STARTS HERE**
- Secondary (stacked): **UNLOCK YOUR PILOT LICENSE**
- Mark: aircraft wing (Aviator Blue) + open book (Aviator Gold)
- Logos: transparent PNG lockups + SVG masters under `public/brand/` (UI prefers PNG; cache `?v=brand-guide-2`)
- Guidelines PDF: `public/brand/source/AVIATORPASS_Brand_Guidelines.pdf`
- Tokens: `styles/globals.css`, `config/theme.ts`, `config/design-system.ts`, `config/branding.ts`
- Surfaces: marketing hero, footer, emails, invoices, charts, manifest, maintenance

## Pending (licensed asset)

- **Stimulatio Flat** font files — place under `public/fonts/` and wire via `next/font/local`, then set `brandingConfig.pending.officialTypography = false` and `typographyPending: false` in platform settings defaults.
- Until then, headings use **Exo 2** as the approved wide/aerodynamic web substitute.
