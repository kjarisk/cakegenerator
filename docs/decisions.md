# Decisions Log

Keep this short: what we decided, and why.

## Decisions

- 2026-02-07: Chose shadcn/ui as default UI layer for speed + consistency.
- 2026-02-07: State strategy = TanStack Query (server) + Zustand (UI/client).
- 2026-02-26: Enabled Context7 MCP for live library docs during implementation.
- 2026-02-26: localStorage for persistence in v1 (no server). JSON export/import for backup later.
- 2026-02-26: Mock AI service for v1 — build UI flow with placeholder recipes/images, wire real AI later.
- 2026-02-26: Dark purple + pink/magenta theme inspired by moodboard. Dark mode as default.
- 2026-02-26: Generic store types (Budget/Standard/Premium) instead of country-specific stores in v1.
- 2026-02-26: AI-estimated prices (mocked in v1) — no static price catalog.
- 2026-02-26: 4 first-class dietary toggles (gluten-free, nut-free, vegan, lactose-free) + free-text notes.
- 2026-02-26: Concept art / moodboard style for generated images (single style, no toggle in v1).
- 2026-02-26: Name-only commenting on share links — no login required for reviewers.
- 2026-02-26: Simple approval states (Draft → Shared → Approved / Changes Requested) — no versioning.
- 2026-02-26: In-app only bonanza notifications — no email/Slack in v1.
- 2026-02-26: Hero + dashboard homepage with rotating theme cards and quick actions.
- 2026-02-26: Bonanza calendar view as default view for weekly schedule visibility.
- 2026-02-26: 1–5 star rating on bonanza assignments — rate after the week is done, stored on the assignment object.
- 2026-02-26: GitHub Pages deployment via GitHub Actions (project site at /cakegenerator/).
- 2026-02-26: OpenAI integration: GPT-4o for text/recipes, DALL-E 3 for concept images.
- 2026-02-26: AI dispatcher pattern — `ai-service.ts` routes to real OpenAI or mock based on `VITE_OPENAI_API_KEY` presence.
- 2026-02-26: API key via `VITE_OPENAI_API_KEY` in `.env.local` — local dev only, mock fallback in production/CI.
- 2026-02-26: DALL-E 3 temporary URLs accepted in v1 — graceful fallback via `CakeImage` component when expired.
- 2026-02-26: JSON mode (`response_format: { type: "json_object" }`) for structured GPT-4o output — no zodResponseFormat due to Zod v4 compatibility.
- 2026-02-26: Prompt templates isolated in `ai-prompts.ts` for easy iteration without touching API logic.
- 2026-02-26: UX/UI upgrade — doubled card-vs-background contrast (L=0.10 bg, L=0.18 card, L=0.08 sidebar) for visible separation.
- 2026-02-26: Added gold/warm accent color (`oklch(0.78 0.18 85)`) as `--warm` token — moodboard was 95% purple/pink, gold was missing.
- 2026-02-26: Added `--success` color token for positive states.
- 2026-02-26: Space Grotesk as display font (`--font-display`) for headings — loaded via Google Fonts.
- 2026-02-26: New CSS utility classes: `shadow-glow-warm`, `animate-pulse-glow`, `text-gradient-warm`, `bg-radial-glow-*`, `table-striped`.
- 2026-02-26: Borders boosted to L=0.35, muted-foreground to L=0.78 for better readability.
- 2026-02-26: Light/dark theme toggle — Zustand store (`theme-store.ts`) with localStorage persistence, inline script in index.html to prevent flash.
- 2026-02-26: Light theme: warm cream/off-white bg (`oklch(0.965 0.008 75)`), terracotta/coral primary (`oklch(0.52 0.14 30)`), inspired by moodboard (Ashton Aesthetics aesthetic).
- 2026-02-26: All CSS utility classes (glows, glass, gradients, table-striped) made theme-aware with `:root` / `.dark` variants.
- 2026-02-26: Replaced hardcoded Tailwind palette colors (amber-400, green-500, orange-500, emerald-400) with semantic tokens (`--warm`, `--success`, `--destructive`) for theme consistency.
- 2026-02-26: Dark mode remains the default — toggle persists choice to localStorage.

## UI system choice (per project)

- Default: shadcn/ui
- Allowed alternative: Tailwind UI (copy components into repo), but must be declared in the UI System section of `AGENTS.md`.
