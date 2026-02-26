# Prompt Pack (Reusable)

These are prompts you paste into your AI tool (OpenCode, Claude Code, etc.).

## 0) Project boot prompt

"Read /docs/outline.md, /docs/plan.md, and AGENTS.md.
Summarize the goal in 1 sentence.
Then propose the next _single smallest task_ to implement (max 10 lines).
Do NOT add features not in outline. If something is missing, ask."

## 1) Task execution prompt

"Implement ONLY this task: <task>.
Before coding: tell me which exact bullet in /docs/outline.md it supports.
After coding: provide commands to run tests and lint.
Do not change unrelated files."

## 2) Code review prompt

"Review the diff for correctness, simplicity, and scope.
Flag anything that violates AGENTS.md or adds unrequested functionality.
Suggest the smallest fix set."

## 3) Test generation prompt

"Generate tests for the feature we just added.
Use Vitest + Testing Library.
Prefer testing behavior over implementation details."

## 4) Refactor prompt (guarded)

"Refactor only for readability and consistency with the Architecture section of AGENTS.md.
No new features. No new dependencies without asking."

## 5) Visual direction generation prompt

"Read every image in docs/moodboard/ and docs/screenshots/ (skip README.md files).
Analyse and synthesise a visual direction summary covering:

- Color palette (backgrounds, primary/accent/highlight, text, borders, gradients/glows)
- Typography (font families, heading weight/size feel, hierarchy)
- Tone & personality (adjectives describing the mood; what the design is NOT)
- Layout patterns (page structure, spacing, card style, repeated motifs)
- Light vs dark themes (how the palette shifts, which is default)
- Key UI patterns to replicate (specific component styles worth noting)
- Patterns to avoid (anything that clashes with the observed aesthetic)
  Write the result to docs/visual-direction.md using the structure above.
  Keep it scannable: short bullet lists, not long paragraphs.
  Include approximate color values where identifiable.
  End with a Quick Reference table: token name → description → example value.
  Note which source image files you used."
