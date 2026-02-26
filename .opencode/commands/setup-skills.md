# /setup-skills

Check whether recommended skills are installed and offer to install them.

## Steps

1. Run `npx ctx7 skills list` to see what is currently installed in `.agents/skills/`.

2. Compare the output against the recommended skills from `docs/skills.md`:
   - `frontend-design`
   - `frontend-ui-ux`
   - `web-design-guidelines`
   - `ui-design-system`
   - `ux-researcher-designer`

3. If `.agents/skills/` is **empty or missing** all recommended skills:
   - Tell the user which skills are not installed.
   - Ask: "Install all recommended skills now? (Yes / No / Let me pick)"
   - If Yes: run the bulk install command:
     ```bash
     npx ctx7 skills install /agentskills-community/agentskills \
       frontend-design frontend-ui-ux web-design-guidelines ui-design-system ux-researcher-designer
     ```
   - If "Let me pick": list each skill with a one-line description and ask which to install, then run `npx ctx7 skills install /agentskills-community/agentskills <selected>`.
   - If No: skip and continue.

4. If some skills are already installed, only offer to install the missing ones.

5. After install (or skip), confirm the final list of installed skills to the user.

6. Remind the user that project-specific skills (`add-feature`, `add-component`, `add-route`) in `.opencode/skills/` are always available and require no installation.

## Notes

- `.agents/skills/` is gitignored — each developer installs locally.
- Skills follow the [Agent Skills](https://agentskills.io) open standard and work in OpenCode, Claude Code, Cursor, and Amp.
- See `docs/skills.md` for full reference and install commands.
