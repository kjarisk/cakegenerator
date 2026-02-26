# Plan (Vertical Slices)

## Principles

- Build in end-to-end slices (UI → state → API/data → tests).
- Keep tasks small; each task should be doable in ~15–60 minutes.
- After each task: run tests + commit a checkpoint.

---

## Phase 0 — Project foundation

- [ ] Scaffold React + Vite + TS + Tailwind
- [ ] Add routing (if needed)
- [ ] Add TanStack Query + Zustand baseline setup
- [ ] Add shadcn/ui baseline components + theme tokens
- [ ] Add lint + format + test baseline
- [ ] Create first screen skeletons (no real data yet)

## Phase 1 — First “happy path” end-to-end

- [ ] Implement Flow 1 (happy path)
- [ ] Add loading + error states
- [ ] Add tests for Flow 1
- [ ] Commit stable slice

## Phase 2 — Expand core flows

- [ ] Implement Flow 2 + tests
- [ ] Implement Flow 3 + tests
- [ ] Implement Flow 4 + tests
- [ ] Bonanza calendar view (monthly grid with assignments)
- [ ] Bonanza cake rating (1–5 stars per week, list + calendar views)

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

- [ ] Accessibility pass (keyboard/focus, labels)
- [ ] Performance quick pass (avoid unnecessary rerenders)
- [ ] UX polish (empty states, toasts)
- [ ] Final cleanup + docs
