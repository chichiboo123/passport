# Character Travel Passport Maker

A Canva-like web editor where children create virtual travel passports for their mascot characters, with multilingual support, emoji stamps, photo upload, and image export.

## Run & Operate

- `pnpm --filter @workspace/passport-maker run dev` — run the frontend app (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- No database required (fully client-side)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS
- Fonts: Black Han Sans (Google), Pretendard GOV (jsdelivr CDN)
- Icons: Google Material Symbols Outlined (CDN)
- Image export: html2canvas
- No backend required — all state is browser-local

## Where things live

- `artifacts/passport-maker/src/pages/PassportMaker.tsx` — main app page (state + layout)
- `artifacts/passport-maker/src/components/Sidebar.tsx` — editor panel
- `artifacts/passport-maker/src/components/PassportProfile.tsx` — profile passport view
- `artifacts/passport-maker/src/components/PassportStamps.tsx` — stamp passport view
- `artifacts/passport-maker/src/lib/i18n.ts` — 4-language translations (ko/en/ja/id)
- `artifacts/passport-maker/src/lib/utils.ts` — MRZ generator, stamp utils
- `artifacts/passport-maker/src/lib/types.ts` — shared TypeScript types
- `artifacts/passport-maker/src/index.css` — theme system (4 themes via CSS vars)

## Architecture decisions

- All photo/data processing is done entirely in the browser via FileReader (no server upload)
- 4 theme colors (blue/red/green/brown) are implemented via CSS custom property classes (`theme-blue`, etc.)
- Stamp positions are stored as percentages (x/y 0-100%) so they scale with the canvas
- JSON export/import includes the full app state (including base64 photo) for complete portability
- MRZ code is generated purely decoratively using a simplified ICAO TD3 format

## Product

- Canva-like editor: left sidebar controls, right canvas preview
- 4 theme colors applied to sidebar header + passport cover
- Character info: photo upload, name, birthdate, nationality, favorites
- Profile view: passport spread with travel tag + profile page with MRZ
- Stamp view: two-page spread with emoji stamps at random position/angle/color
- Stamp hover reveals delete button
- JSON save/load for full state persistence
- html2canvas PNG export
- 4 languages: Korean, English, Japanese, Indonesian

## User preferences

- Strict KRDS (Korean Government Web UI/UX) design principles
- Footer: "Created by. 교육뮤지컬 꿈꾸는 치수쌤" linking to https://litt.ly/chichiboo
- Watermark: "NOT AN OFFICIAL DOCUMENT / KIDS PLAY PASSPORT" on all passport pages

## Gotchas

- Google Fonts `@import url(...)` must be the first line in index.css (before `@import "tailwindcss"`)
- html2canvas is installed as a regular dep in `@workspace/passport-maker`

## Pointers

- See the `pnpm-workspace` skill for workspace structure and TypeScript setup
