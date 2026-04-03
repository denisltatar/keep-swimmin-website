# Keep Swimmin' Website

Marketing site for the Keep Swimmin' iOS app. Built with **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**, and **static export** for **GitHub Pages**.

## Scripts

- **`npm run dev`** — local dev with Turbopack. Open **`http://localhost:3000/`** (no `basePath` in development).
- **`npm run build`** — static export to **`out/`** (and copies `index.html` → `404.html` for SPA-style fallbacks).
- **`npm run deploy`** — `gh-pages` publishes **`out/`** (run after `npm run build` via `predeploy`).

## Stack

- Next.js App Router, `output: 'export'`, `basePath: '/keep-swimmin-website'` **only when `NODE_ENV === 'production'`** (GitHub Pages); dev uses `basePath: ''` so the site loads at `/`.
- Tailwind v4 via `@tailwindcss/postcss`, tokens in `app/globals.css`
- Geist Sans / Mono (`geist`), Lobster for the wordmark (`next/font/google`)
- `lucide-react`, `framer-motion`, `clsx` + `tailwind-merge` (`cn()` in `lib/utils.ts`)

## Paths

- **`@/*`** → repo root (`tsconfig.json`)
- Public assets: **`public/images/`**; use **`publicAsset()`** from `lib/base-path.ts` with `next/image` when deploying with `basePath` so URLs resolve on GitHub Pages.
