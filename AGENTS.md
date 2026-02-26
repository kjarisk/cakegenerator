# Agent Instructions

This is a vibecoding template for AI-assisted development.

## Before writing any code

1. Read `docs/outline.md` — this is the scope lock. Only build what is listed there.
2. Read `docs/plan.md` — this is the phased implementation plan.
3. **Visual direction:** If `docs/visual-direction.md` exists and is non-empty (not just the placeholder), read it for color, typography, tone, and layout guidance. If it is empty/placeholder, check `docs/screenshots/` and `docs/moodboard/` for images instead. If those are also empty, use your best judgment. Do NOT re-read images if `docs/visual-direction.md` already has content.
4. **Skills check:** Check whether `.agents/skills/` exists and has installed skills. If it is missing or empty, run `/setup-skills` (or prompt the user to) before starting implementation. See `docs/skills.md` for the recommended skill list.

---

## Rules

### 1. Scope & Guardrails (NON-NEGOTIABLE)

- Do not add features that are not explicitly described in `docs/outline.md`.
- If you believe a feature is missing, STOP and ask:
  "This is not in outline. Add it? (Yes/No)".
- Implement the single smallest next task only.
- Avoid big rewrites. Avoid multi-feature PRs.
- Before making changes, state which section + bullet in `docs/outline.md` this supports. If none → STOP and ask.
- Do not add libraries unless needed for the current task. Ask before adding any new dependency.

### 2. Tech Stack

**Default stack:**

- React + Vite + TypeScript
- Tailwind CSS for styling
- TanStack Query for server state
- Zustand for client/UI state

**Optional (ask first):**

- React Router (if multi-page routes needed)
- Zod (validation)
- React Hook Form (forms)
- Sonner / toast library (UX)

**Not allowed without explicit approval:**

- Switching frameworks (no Next.js unless explicitly requested)
- Switching state approach (no Redux, MobX, etc.)
- Adding UI libraries besides shadcn/ui or Tailwind UI approach

### 3. UI System

- Default: shadcn/ui components in `src/components/ui/*`
- Use Tailwind tokens / CSS variables consistent with shadcn setup.
- Prefer composing shadcn primitives rather than custom one-off UI.
- If Tailwind UI is used instead, copy components into `src/components/twui/*` and treat them as owned code.
- Pick one approach per project (default shadcn). If you must mix, document it in `docs/decisions.md`.

### 4. Architecture & Structure

**Project structure:**

- `src/components/` for reusable UI
- `src/components/ui/` for shadcn components
- `src/features/<feature>/` for feature slices:
  - `components/`
  - `api/` (query hooks, request functions)
  - `state/` (zustand store if needed)
  - `types.ts`
  - `index.ts`

**State boundaries:**

- TanStack Query: anything server-backed (fetching, caching, mutations)
- Zustand: UI state (dialogs, filters, selections) and non-server client state

**Data fetching:**

- No fetching directly in random components.
- Use dedicated query hooks: `useXQuery`, `useYMutation`.

**Error/loading states:**

- Every data-driven UI must handle: loading, error, and empty state (if relevant).

**Naming conventions:**

- Components: PascalCase
- Hooks: useXxx
- Files: kebab-case or PascalCase, but be consistent

### 5. Quality

- Use Vitest + Testing Library. Prefer behavior-based tests. Critical flows should have tests.
- Interactive elements must be keyboard accessible. Inputs must have labels. Dialogs must manage focus.
- Run lint + format before checkpoint commits. Keep imports tidy.
- Avoid unnecessary global state. Avoid re-fetching loops. Memoize only when needed.

### 6. Commits & Checkpoints

- Commit after each small, working improvement. If something breaks, revert to last checkpoint.
- Commit message style: `chore:`, `feat:`, `fix:`, `refactor:`, `test:`
- Do not leave the repo in a failing state on main.
- Before commit: tests pass (or explain why not), app runs locally.

### 7. Plan & Outline Tracking (NON-NEGOTIABLE)

- **After every completed task:** update `docs/plan.md` — check off the completed item, add sub-bullets if the task was broken into smaller steps.
- **After every completed task:** update `docs/outline.md` — check off the corresponding Definition of Done checkbox if applicable.
- If a new task is added mid-session that was not in the plan, add it to `docs/plan.md` before starting it.
- These files are the single source of truth for what has been done and what remains.

### 8. Skills

- Project-specific skills live in `.opencode/skills/` (committed, always available).
- Third-party skills live in `.agents/skills/` (gitignored, installed locally per developer).
- Before starting implementation: if `.agents/skills/` is empty or missing, run `/setup-skills`.
- See `docs/skills.md` for the full skills reference, install commands, and recommended skill list.

---

## Stack

- React + Vite + TypeScript
- Tailwind CSS (v4, no tailwind.config — uses `@theme inline` in `src/index.css`)
- shadcn/ui components in `src/components/ui/`
- TanStack Query for server state
- Zustand for UI/client state
- Vitest + Testing Library for tests

## Project structure

```
src/
  components/ui/    # shadcn/ui primitives (do not modify without reason)
  features/<name>/  # feature slices: components/, api/, state/, types.ts
  hooks/            # shared custom hooks
  lib/              # shared utilities
  test/             # test setup
docs/
  outline.md           # scope lock — the single source of truth
  plan.md              # phased implementation plan
  decisions.md         # architecture decision log
  prompts.md           # reusable prompts for AI tools
  skills.md            # skills reference (install commands, recommended list)
  visual-direction.md  # generated visual summary (run /generate-visual-direction)
  QUICKSTART.md        # setup + commands
  screenshots/         # UI inspiration images
  moodboard/           # visual direction assets
.opencode/
  commands/         # custom slash commands (/lint, /test, /build, /new-feature, /review, /setup-skills, /generate-visual-direction)
  skills/           # agent skills (add-feature, add-component, add-route)
opencode.json       # OpenCode configuration (instructions, formatters, MCP)
```

## Workflow

1. Read `docs/outline.md` and `docs/plan.md`.
2. Check `docs/visual-direction.md` — if populated, use it. Otherwise check `docs/moodboard/` and `docs/screenshots/`. Run `/generate-visual-direction` if images are present but the file hasn't been generated yet.
3. Check `.agents/skills/` — if empty or missing, run `/setup-skills` before coding.
4. Propose the next single smallest task.
5. Before coding: cite which exact bullet in the outline it supports.
6. Implement without adding features not in the outline.
7. After coding: run `/lint` and `/build` to verify (or `npm run lint` and `npm run build`).
8. Update `docs/plan.md` and `docs/outline.md` checkboxes.
9. Suggest a checkpoint commit message.

## OpenCode skills and commands

This project includes reusable agent skills and custom commands via `.opencode/`.

**Skills** (loaded on-demand via the `skill` tool):

- `add-feature` — scaffold a new feature slice under `src/features/<name>/`
- `add-component` — add a shadcn/ui component or create a custom reusable component
- `add-route` — add React Router and configure a new route/page

Third-party skills (from the Context7 registry) live in `.agents/skills/` — see `docs/skills.md` for install instructions and the recommended list.

**Commands** (run via `/command-name` in OpenCode):

- `/lint` — run linting and auto-fix issues
- `/test` — run tests with coverage report
- `/build` — type-check and build for production
- `/new-feature <name>` — scaffold a new feature slice (uses the `add-feature` skill)
- `/review` — review recent changes for quality issues
- `/setup-skills` — check installed skills and offer to install recommended ones
- `/generate-visual-direction` — read moodboard/screenshot images and write `docs/visual-direction.md`

When scaffolding new features, prefer using the `/new-feature` command or the `add-feature` skill to ensure consistent structure.

## Documentation discipline

- If the plan changes, update `docs/plan.md`.
- If a tool/approach choice changes, update `docs/decisions.md`.
- After every completed task, check off `docs/plan.md` and `docs/outline.md` (DoD) items.
- Visual direction lives in `docs/visual-direction.md` (generated) — re-run `/generate-visual-direction` if the moodboard changes.
