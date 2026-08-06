# Brand source assets

Official AviatorPass brand guidelines PDF lives here for audit and regeneration of digital assets.

## Files

| File                               | Purpose                                                           |
| ---------------------------------- | ----------------------------------------------------------------- |
| `AVIATORPASS_Brand_Guidelines.pdf` | Official brand book (logo, colours, typography, digital presence) |

## Official palette (from guidelines)

| Token                           | Hex       | Role                                |
| ------------------------------- | --------- | ----------------------------------- |
| Aero Blue                       | `#2E7DAA` | Primary brand / CTAs                |
| Altitude Orange / Success Amber | `#DD9B30` | Accent / PASS wordmark / highlights |
| Academic Grey                   | `#7C7B80` | Secondary / muted UI                |

## Typography

| Role     | Brand font      | Web substitute               |
| -------- | --------------- | ---------------------------- |
| Headings | Stimulatio Flat | Space Grotesk                |
| Body     | IBM Plex Sans   | IBM Plex Sans (Google Fonts) |

Stimulatio Flat is proprietary — load licensed files under `public/fonts/` when available and set `brandingConfig.pending.typography = false`.

## Regenerated digital assets

SVG logos and icons under `public/brand/` were redrawn to match the PDF logo system (wing + open book, dual-colour wordmark) for crisp UI use. Prefer SVG over raster crops from the PDF for product chrome.
