# SITE_TITLE

SITE_DESCRIPTION

## Stack
- Next.js 16 + React 19 + TypeScript 5
- Tailwind CSS 4 + DaisyUI 5
- Static export (`output: "export"`)
- pnpm

## Setup
```bash
pnpm install
pnpm dev       # http://localhost:3000
pnpm build     # static export to out/
```

## Customize
1. Replace all `SITE_TITLE`, `SITE_DESCRIPTION`, `SUBDOMAIN`, `DAISY_THEME` placeholders
2. Edit `STYLEGUIDE.md` with design references
3. Implement scraper: `scripts/scrape.py`
4. Update `src/app/sitemap.ts` with dynamic routes
5. Add JSON-LD via `src/components/JsonLd.tsx`

## Data
- Scraper: `scripts/scrape.py`
- Output: `src/data/records.json`
- Budget: ≤$5 AUD/year

## Deploy
Vercel auto-deploys from `main` branch.
Domain: `SUBDOMAIN.rollersoft.com.au`
