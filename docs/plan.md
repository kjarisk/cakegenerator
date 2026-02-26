# Plan (Vertical Slices)

## Principles

- Build in end-to-end slices (UI → state → API/data → tests).
- Keep tasks small; each task should be doable in ~15–60 minutes.
- After each task: run tests + commit a checkpoint.

---

## Phase 0 — Project foundation

- [x] Scaffold React + Vite + TS + Tailwind
- [x] Add routing (if needed)
- [x] Add TanStack Query + Zustand baseline setup
- [x] Add shadcn/ui baseline components + theme tokens
- [x] Add lint + format + test baseline
- [x] Create first screen skeletons (no real data yet)

## Phase 1 — First "happy path" end-to-end

- [x] Implement Flow 1 (happy path)
- [x] Add loading + error states
- [x] Add tests for Flow 1
- [x] Commit stable slice

## Phase 2 — Expand core flows

- [x] Implement Flow 2 + tests
- [x] Implement Flow 3 + tests
- [x] Implement Flow 4 + tests
- [x] Bonanza calendar view (monthly grid with assignments)
- [x] Bonanza cake rating (1–5 stars per week, list + calendar views)

## Phase 2.5 — AI Integration (OpenAI)

- [x] Install `openai` SDK, set up `.env.local` with `VITE_OPENAI_API_KEY`
- [x] Create OpenAI client (`openai-client.ts`) — lazy init, `dangerouslyAllowBrowser` for local dev
- [x] Create prompt templates (`ai-prompts.ts`) — system prompts + prompt builders for GPT-4o and DALL-E 3
- [x] Create real AI service (`openai-ai.ts`) — GPT-4o JSON mode for recipes/text, DALL-E 3 for images
- [x] Create dispatcher (`ai-service.ts`) — routes to real OpenAI or mock based on env
- [x] Update consuming code to import from dispatcher instead of mock-ai
- [x] Add `CakeImage` component with DALL-E URL expiry fallback
- [x] Add AI status indicator in sidebar (Live / Mock badge)
- [x] Add tests for prompt templates + dispatcher
- [x] Update docs (decisions.md, QUICKSTART.md, outline.md, plan.md)

## Phase 3 — Polish + hardening

### Phase 3a — UX/UI Upgrade (vibrant moodboard alignment)

- [x] Color token overhaul: doubled contrast, added `--warm`/`--success` tokens, boosted borders
- [x] Glow & lighting effects: `shadow-glow-warm`, `animate-pulse-glow`, `text-gradient-warm`, radial glows, `table-striped`
- [x] Typography: Space Grotesk display font via Google Fonts, applied to all headings
- [x] HomePage: hero blobs boosted, gold accents, feature card borders, stat card variants, highlight colors
- [x] CreateRequestPage: themed header banner, form card glows, gradient submit button
- [x] ConceptDetailPage: colored stat cards, warm cost display, striped tables
- [x] CakeBankPage: card hover scale, gradient overlay, warm empty state
- [x] BonanzaPage + CalendarView: warm "This Week" badge, current week highlighting, font-display headings
- [x] Layout/Sidebar: gradient logo, warm sparkle, active nav border, stronger sidebar borders
- [x] SharePage: font-display headings, warm cost display
- [x] Update docs (decisions.md, plan.md)

### Phase 3a.1 — Light/Dark Theme Toggle

- [x] Designed light theme tokens: warm cream bg, terracotta/coral primary, soft borders (moodboard-inspired)
- [x] Made all CSS utilities theme-aware (glows, glass, gradients, table-striped) with `:root` / `.dark` variants
- [x] Created Zustand theme store (`theme-store.ts`) with localStorage persistence
- [x] Added inline script in `index.html` to prevent theme flash on load
- [x] Removed hardcoded `.dark` class from Layout, SharePage, index.html
- [x] Added Sun/Moon toggle button to sidebar footer + mobile header
- [x] Replaced hardcoded Tailwind palette colors with semantic tokens for theme consistency
- [x] Update docs (decisions.md, plan.md)

### Phase 3a.2 — Bonanza Upgrade (Periods + Hype)

- [x] Updated data model: `BonanzaSchedule` now has `endDate`, `status` (active/completed), `BonanzaAssignment` has `cakeDay` (overridable, default Friday) and `cakeName`
- [x] Updated schemas: `createBonanzaPeriodSchema` with date range + refinement validation
- [x] Rewrote query hooks: `useCreateBonanzaPeriodMutation`, `useAssignBakerMutation`, `useUpdateCakeDayMutation`, `useCompletePeriodMutation`, helper functions (`getActivePeriod`, `getArchivedPeriods`)
- [x] Updated Zustand store: `viewingArchiveId` for archive browsing, `isAssignBakerOpen`/`assignBakerWeek` dialog state
- [x] Built `HypeBanner` component: canvas-confetti burst on load, animated gradient, bouncing cake emoji, non-Friday "HEADS UP" alert
- [x] Built `CreatePeriodDialog`: date range picker, bulk week generation, period name suggestion
- [x] Built `AssignBakerDialog`: baker selection, cake day override, cake name/theme input
- [x] Updated `CalendarView`: period-aware, cake day markers per week, non-Friday callouts, `isReadOnly` prop for archives
- [x] Rewrote `BonanzaPage`: hype banner, period info card, archive dropdown, list+calendar views, empty state
- [x] Added `animate-gradient-shift` CSS keyframe animation
- [x] Fixed Monday/Sunday week-start inconsistency (all Monday-start now)
- [x] Updated `docs/outline.md` entity definition for new period model
- [x] Build passes, lint passes (only expected React Compiler warning)

### Phase 3b — Remaining polish

- [x] Accessibility pass (keyboard/focus, labels)
  - `aria-hidden` on all decorative icons/blobs across all pages
  - `role="alert"` on all error states; `aria-busy` + `aria-label` on all skeletons/loading states
  - `role="status"` on approval banners (SharePage); `role="alert"` on non-Friday Bonanza warning (HypeBanner)
  - Proper `<Label htmlFor>` + `id` linkage in AssignBakerDialog and ShareDialog
  - `aria-label` on all icon-only buttons (copy, remove, assign, unassign, nav prev/next)
  - `aria-pressed` on view-toggle buttons (BonanzaPage list/calendar)
  - `aria-current` on active category nav items (CakeBankPage)
  - `aria-label="Sidebar"` on `<aside>`, `aria-label="Main navigation"` on `<nav>` (deduplicated)
  - `<div>` → `<main>` for all three SharePage render states
  - `role="row" aria-hidden` on CalendarView day-of-week header row
- [x] Performance quick pass (avoid unnecessary rerenders)
  - Fixed `useCallback` dep array bug in CakeBankPage (`handleRemoveFromBank`)
  - Changed `ConceptCard.onRemove` prop type to `(id: string) => void` — stable callback, no inline arrow in map
- [x] UX polish (empty states, toasts)
  - `?theme=` query param pre-fill wired into CreateRequestPage via `useSearchParams` (homepage chips now work end-to-end)
  - Verified all error/loading/empty states exist; all mutation actions have `toast.success` / `toast.error`
- [x] CreateRequestPage full redesign
  - Full-bleed hero section with floating orbs + animated cake emojis (`animate-float`)
  - Prompt textarea inside the hero; 5 one-click inspiration chips pre-fill textarea
  - `PillOption` components replace all `Select` dropdowns (skill level, budget range, cake style)
  - Stepper buttons (+/−) for servings with contextual label ("Mega event 🎉" at high counts)
  - Dietary toggles as colorful emoji chips with `--success` active state
  - Numbered concept count buttons (1–5) with scale animation
  - Animated shimmer CTA: `primary → accent → warm` gradient with `animate-gradient-shift`; shows count dynamically
  - Bundle chunk shrank from 19.88 kB → 14.10 kB (dropped unused shadcn Select/Slider/Checkbox)
- [x] Final cleanup + docs
  - Tests added for sharing flow (`sharing-logic.test.ts`: token generation, expiry, comment flow, approval transitions)
  - Tests added for bonanza mutations (`bonanza-logic.test.ts`: week generation, period creation, assign/unassign baker, cake day override, rating, archive helpers)
  - README rewritten with project-specific run instructions, localStorage data format, feature summary, and tech stack
