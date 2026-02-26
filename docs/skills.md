# Skills

Skills are reusable prompt templates that extend the capabilities of your AI coding assistant. They follow the [Agent Skills](https://agentskills.io) open standard and work across OpenCode, Claude Code, Cursor, and other AI tools.

---

## How skills work

A skill is a directory containing a `SKILL.md` file. When you invoke a skill (via the `skill` tool in OpenCode), the agent loads those instructions and follows them for the current task.

Skills live in two places:

| Location            | Purpose                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `.agents/skills/`   | Third-party skills from the Context7 registry (universal client)       |
| `.opencode/skills/` | Project-specific custom skills (add-feature, add-component, add-route) |

`.agents/skills/` is gitignored by default — each developer installs skills locally. `.opencode/skills/` is committed to the repo so the whole team shares the same custom workflows.

---

## Installing skills

Skills are managed with the Context7 CLI (`ctx7`). No global install required — use `npx`:

```bash
# Search the registry
npx ctx7 skills search <keyword>

# Install a specific skill
npx ctx7 skills install /org/repo <skill-name>

# Install multiple at once
npx ctx7 skills install /org/repo skill-a skill-b

# Auto-suggest skills based on your package.json dependencies
npx ctx7 skills suggest

# List what's currently installed
npx ctx7 skills list
```

Or run the `/setup-skills` command in OpenCode to be guided through the process interactively.

---

## Recommended skills for this stack

These skills are commonly useful for React + Vite + Tailwind + shadcn projects:

| Skill                    | Registry path                        | What it does                                                                     |
| ------------------------ | ------------------------------------ | -------------------------------------------------------------------------------- |
| `frontend-design`        | `/agentskills-community/agentskills` | Production-grade UI with bold aesthetic direction, avoids generic AI aesthetics  |
| `frontend-ui-ux`         | `/agentskills-community/agentskills` | Designer-turned-developer approach for UI/UX without mockups                     |
| `web-design-guidelines`  | `/agentskills-community/agentskills` | Review UI code for accessibility, spacing, typography, responsive best practices |
| `ui-design-system`       | `/agentskills-community/agentskills` | Design tokens, component documentation, developer handoff                        |
| `ux-researcher-designer` | `/agentskills-community/agentskills` | Persona generation, journey mapping, usability testing frameworks                |

Install them all at once:

```bash
npx ctx7 skills install /agentskills-community/agentskills \
  frontend-design frontend-ui-ux web-design-guidelines ui-design-system ux-researcher-designer
```

Or let the CLI suggest what's relevant:

```bash
npx ctx7 skills suggest
```

---

## Project-specific skills (`.opencode/skills/`)

These are committed to the repo and always available:

| Skill           | When to use                                                     |
| --------------- | --------------------------------------------------------------- |
| `add-feature`   | Scaffold a new feature slice under `src/features/<name>/`       |
| `add-component` | Add a shadcn/ui component or create a custom reusable component |
| `add-route`     | Add React Router and configure a new route/page                 |

Invoke them via the OpenCode `skill` tool or the `/new-feature` command.

---

## Further reading

- Context7 Skills docs: https://context7.com/docs/skills
- Agent Skills open standard: https://agentskills.io
- Browse the registry: https://context7.com/skills
