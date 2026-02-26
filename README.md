# CakeGen — Theme Cake Generator

A lightweight team app that turns a customer's theme request into cake concepts (recipe + generated image), estimates ingredient costs, and supports sharing for approval and comments — with a reusable Cake Bank of themed cakes.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

## Commands

```bash
npm run dev            # start dev server (localhost:5173)
npm run build          # type-check + production build → dist/
npm run test           # vitest in watch mode
npm run test -- --run  # run tests once (CI mode)
npm run lint           # ESLint + Prettier check
npm run lint:fix       # ESLint + Prettier auto-fix
npm run format         # Prettier auto-format all files
```

## OpenAI setup (optional)

Real AI generation requires an OpenAI API key. Without one the app runs on mock data — no account needed.

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Add your key to `.env.local`:
   ```
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart the dev server.

The sidebar footer shows **AI: Live** when the key is active, **AI: Mock** otherwise.

## Data storage

All data is stored in `localStorage` under `cakegen:*` keys. No server or database is required.

| Key                        | Contents                                       |
| -------------------------- | ---------------------------------------------- |
| `cakegen:users`            | User profiles                                  |
| `cakegen:cakeRequests`     | Cake generation requests + status              |
| `cakegen:cakeConcepts`     | Generated cake concepts (recipe, image, costs) |
| `cakegen:themeCategories`  | Cake Bank theme categories                     |
| `cakegen:shareLinks`       | Share tokens for review links                  |
| `cakegen:comments`         | Comments on shared concepts                    |
| `cakegen:bonanzaSchedules` | Weekly Bonanza periods + baker assignments     |

Each collection is a JSON array. You can export/import all data at once via `exportDatabase()` / `importDatabase()` in `src/lib/storage.ts`.

## Features

- **Create cake request** — prompt, theme, servings, skill level, dietary toggles, budget, cake style
- **Generate concepts** — GPT-4o recipes, DALL-E 3 images, shopping plan with cost estimates
- **Regenerate** — full concept, recipe only, or image only
- **Cake Bank** — save concepts to themed categories, browse and search by tag
- **Share for approval** — generate a read-only link; stakeholders can approve, request changes, and leave comments
- **Weekly Bonanza** — create periods, assign bakers per week, override cake day, view a monthly calendar, rate each week 1–5 stars

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS v4 (CSS-first config, `@theme inline` in `src/index.css`)
- shadcn/ui components (`src/components/ui/`)
- TanStack Query (server state) + Zustand (UI state)
- Vitest + Testing Library

## Docs

| File                 | Purpose                              |
| -------------------- | ------------------------------------ |
| `docs/outline.md`    | Scope lock — what to build           |
| `docs/plan.md`       | Phased implementation plan           |
| `docs/decisions.md`  | Architecture decision log            |
| `docs/QUICKSTART.md` | Setup + commands (quick reference)   |
| `AGENTS.md`          | AI agent rules + project conventions |
