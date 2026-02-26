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

## UI system choice (per project)

- Default: shadcn/ui
- Allowed alternative: Tailwind UI (copy components into repo), but must be declared in the UI System section of `AGENTS.md`.
