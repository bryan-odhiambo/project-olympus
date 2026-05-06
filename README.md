# Project Olympus — Investor Site

A scroll-driven, web-native investor presentation for **CrestHaven Capital's** acquisition of **Greenpoint Technologies** (Project Olympus). $175M enterprise value carve-out, $800M+ contracted backlog, $100M structured-capital ask.

> Strictly Private & Confidential. Not an offer to sell or solicitation to buy securities.

## Stack

- **Astro 4** (static output, no SSR)
- **Tailwind CSS** (utility-first; no UI framework)
- **GSAP 3.15** + **ScrollTrigger** (free under the GreenSock Standard "No Charge" license, post-Webflow)
- **TypeScript** (strict)
- All charts hand-built SVG — no Chart.js / D3 / Recharts

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
```

Build & preview:

```bash
npm run build        # outputs to ./dist
npm run preview      # serves ./dist locally
```

Type-check:

```bash
npm run typecheck
```

## Project structure

```
src/
  pages/index.astro          ← composes the section components
  components/
    sections/                ← one .astro file per scroll section
  layouts/Base.astro         ← <html>, font preloads, GSAP boot
  content/deck-data.ts       ← single source of truth for all copy & numbers
  scripts/animations.ts      ← GSAP timelines (ScrollTrigger / pinning)
  styles/global.css          ← Tailwind layers + font-face declarations
public/
  fonts/                     ← drop licensed Editorial New / Inter / JetBrains Mono here
  images/
source/
  Project_Olympus_Investor_Deck_v4.pptx
```

## Editing content

All copy, numbers, scenarios, team bios, and disclosures live in
[`src/content/deck-data.ts`](src/content/deck-data.ts). Update values there — never inline a number into a component or animation file.

## Fonts

Real font files belong in `/public/fonts/`:

- `EditorialNew-Regular.woff2`, `EditorialNew-Italic.woff2`
- `Inter-Variable.woff2`
- `JetBrainsMono-Variable.woff2`

The `@font-face` block in [`src/styles/global.css`](src/styles/global.css) tries `local()` first, then the file in `/public/fonts/`. Until the licensed faces are dropped in, the cascade falls back to system serif / sans / mono — the layout stays intact.

## Deploying to Cloudflare Pages

### Option A — GitHub integration (recommended)

1. Push this repo to GitHub.
2. In Cloudflare Pages, **Create application → Connect to Git**, select the repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `20` (set `NODE_VERSION=20` in env vars)
4. Deploy. Subsequent commits to `main` auto-publish.

### Option B — Direct upload (Wrangler)

```bash
npm run build
npx wrangler pages deploy dist --project-name=project-olympus
```

## Animation principles

- All eases default to `expo.out` / `power3.out` — never `linear`, never `bounce`
- Section pinning via ScrollTrigger only where it adds meaning (Snapshot)
- Number tweens use `tabular-nums` to prevent layout shift
- `prefers-reduced-motion` honored globally — every animation falls back to instant reveals

## Sections (build status)

| #  | Section                          | Status |
|----|----------------------------------|--------|
| 01 | Hero                             | ✓ Built |
| 02 | The Snapshot (4-stat reveal)     | ✓ Built |
| 03 | The Floor (revenue mix)          | — Pending review |
| 04 | Three-Phase Growth Architecture  | — Pending review |
| 05 | The Asset (Greenpoint)           | — Pending review |
| 06 | Scenario analysis                | ✓ Built |
| 07 | The Transaction                  | — Pending review |
| 08 | The Ask                          | — Pending review |
| 09 | The Team                         | — Pending review |
| 10 | Track Record                     | — Pending review |
| 11 | Close                            | — Pending review |
| 12 | Disclosure                       | — Pending review |

Sections 1, 2, and 6 are built first per brief — review and confirm direction before remaining sections proceed.
