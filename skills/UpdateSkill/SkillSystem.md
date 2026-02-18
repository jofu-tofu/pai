# Skill System Spec

> **Authoritative source for all skill structure, naming, and validation rules.**
> All UpdateSkill workflows reference this file instead of any external spec.

---

## TitleCase Naming Convention (MANDATORY)

All naming in the skill system uses TitleCase (PascalCase).

| Component | Wrong | Correct |
|---|---|---|
| Skill directory | `createskill`, `create-skill`, `CREATE_SKILL` | `CreateSkill` |
| Workflow files | `create.md`, `update-info.md` | `Create.md`, `UpdateInfo.md` |
| Context files | `prosody-guide.md`, `API_REFERENCE.md` | `ProsodyGuide.md`, `ApiReference.md` |
| Tool files | `manage-server.ts` | `ManageServer.ts` |
| YAML name field | `name: create-skill` | `name: CreateSkill` |

**Rules:**
- First letter of each word capitalized, no hyphens/underscores/spaces
- Single words: `Blogging`, `Daemon`
- Multi-word: `UpdateDaemonInfo`, `SyncRepo`
- **Exception:** `SKILL.md` is always all-caps (convention for the main skill file)

---

## Required SKILL.md Structure

Every `SKILL.md` has two parts:

### Part 1: YAML Frontmatter

```yaml
---
name: SkillName
description: [What it does]. USE WHEN [intent triggers using OR]. [Additional capabilities].
---
```

**Rules:**
- `name` uses TitleCase
- `description` is a **single line** (not multi-line with `|`)
- `USE WHEN` keyword is MANDATORY — this is how the agent decides when to activate the skill
- Use intent-based triggers with `OR` for multiple conditions
- Max 1024 characters
- No separate `triggers:` or `workflows:` arrays in YAML

### Part 2: Markdown Body

Required sections in order:

```markdown
# SkillName

[Brief description]

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowOne** | "trigger phrase" | `Workflows/WorkflowOne.md` |

## Examples

**Example 1: [Use case]**
```
User: "[Realistic user request]"
-> Invokes WorkflowOne workflow
-> [What the skill does]
-> [What the user gets back]
```
```

**Critical:** The explicit instruction "read its file and follow the steps within it" MUST appear above the routing table. Without it, an agent may see the table but not read the workflow file.

**Examples section:** Required. 2–3 concrete patterns. Anthropic research shows examples improve tool selection accuracy from 72% to 90%.

---

## Workflow File Structure

Every `Workflows/*.md` file MUST follow this structure:

```markdown
# WorkflowName Workflow

> **Trigger:** "trigger phrase", "another phrase"

## Reference Material

- **Context File Name:** `../ContextFile.md`
- **Another Resource:** `../OtherFile.md`

## Purpose

[What this workflow does and why]

## Workflow Steps
...
```

**Rules:**
- `## Reference Material` appears immediately after the trigger line, BEFORE `## Purpose`
- Lists every context file the workflow reads, using relative paths (`../ContextFile.md`)
- If no additional files needed: `- None.`
- This section is the **load manifest** — it's how other workflows (WorkflowDecompose, StressTest) infer what context a workflow requires

---

## Directory Structure

```
SkillName/                    # TitleCase directory name
├── SKILL.md                  # Main skill file (always uppercase)
├── ContextFile.md            # Context files in skill ROOT (TitleCase)
├── SkillIntent.md            # Design intent document (see below)
├── WorkflowChains.md         # Workflow chain map (recommended for 5+ workflows)
├── Tools/                    # CLI tools (ALWAYS present, even if empty)
│   └── ToolName.ts           # TypeScript CLI tool (TitleCase)
└── Workflows/                # Execution workflows (TitleCase)
    ├── Create.md
    └── Update.md
```

**Critical rules:**
- Context files live in the **skill root**, never in subdirectories
- NEVER create `Context/`, `Docs/`, or `Resources/` subdirectories
- `Tools/` directory MUST always be present (create empty if no tools yet)
- Maximum directory depth: 2 levels (`SkillName/Category/file.md`)
- No `backups/` directories inside skills

---

## SkillIntent.md Convention

Every skill SHOULD have a `SkillIntent.md` in its root directory. This is the design intent anchor — read by agents before modifying the skill to ensure changes don't contradict original purpose.

**Standard structure:**

```markdown
# SkillIntent — SkillName

> **For agents modifying this skill:** Read this before making any changes.

## Problem This Skill Solves
[What gap exists without this skill?]

## Design Decisions
| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|

## Explicit Out-of-Scope
[What this skill deliberately does NOT handle, and why]

## Constraints
[Non-negotiable rules that must remain true through any update]

## Evolution Notes
| Version/Date | Change | Rationale |
|---|---|---|
```

Use the `CreateSkillIntent` workflow to generate this file for any skill.

---

## Workflow Chaining Convention

Skills with 5+ workflows often have natural follow-up relationships between workflows. For example, modifying content may require a prompt quality audit, or restructuring a skill should always trigger validation. The **Workflow Chaining** convention captures these relationships explicitly.

**When to use:** Recommended for skills with 5+ workflows where workflows have natural follow-up relationships. Not required for simpler skills with 1-3 workflows.

**Two components:**

1. **`WorkflowChains.md`** — A centralized chain map file in the skill root. This is the **authoritative source** for all chain definitions. Contains:
   - **Chain Table** — every workflow-to-workflow chain with its condition and tier (Always/Conditional)
   - **Chaining Rules** — cascade behavior, tier definitions, condition context evaluation
   - **Chain Graph** — ASCII DAG showing the full chain topology
   - **Impact Map** — reverse lookup for downstream impact analysis

2. **`## Follow-Up` sections** — Added as the LAST section in each workflow file that has outgoing chains. These are **execution copies** derived from WorkflowChains.md — they provide in-context chain instructions so the agent sees them at workflow completion. Format:

   ```markdown
   ## Follow-Up

   After completing this workflow, evaluate these chain conditions:

   | Condition | Chain To | Action |
   |---|---|---|
   | [condition from chain table] | [target workflow] | Announce: "[message]..." then execute `Workflows/[Target].md` |

   If no conditions match, skip follow-ups.
   ```

**Chaining rules:**
- **Two tiers only:** Always (auto-run after primary completes) and Conditional (evaluate IF condition, run if true)
- **Full cascade:** Chained workflows execute their own Follow-Up sections. Depth naturally limited by terminal nodes.
- **Condition context:** Conditions evaluate against what THIS workflow just did, not the upstream caller's context
- **Source of truth:** WorkflowChains.md is canonical. Update it first when chains change, then sync Follow-Up sections.

---

## Intent Matching, Not String Matching

Skill descriptions use **intent language**, not exact phrase lists.

**Good:**
```yaml
description: Browser automation and debugging. USE WHEN user wants to automate a browser, take screenshots, debug web UI, verify frontend behavior, or troubleshoot page rendering.
```

**Bad:**
```yaml
description: USE WHEN user says "open browser" or "take screenshot" or "automate browser".
```

Use `OR` to combine multiple trigger conditions. Cover the domain conceptually.

---

## CLI Tool Requirements

Every tool in `Tools/` must:
1. Be TypeScript with `#!/usr/bin/env bun` shebang
2. Use TitleCase naming (`ToolName.ts`)
3. Have a corresponding help file (`ToolName.help.md`)
4. Support `--help` flag
5. Handle errors gracefully with clear messages and exit codes

---

## Validation Checklist

### Naming
- [ ] Skill directory uses TitleCase
- [ ] YAML `name:` uses TitleCase
- [ ] All workflow files use TitleCase
- [ ] All context files use TitleCase
- [ ] All tool files use TitleCase
- [ ] Routing table workflow names match actual file names

### YAML Frontmatter
- [ ] Single-line `description` with embedded `USE WHEN`
- [ ] No separate `triggers:` or `workflows:` arrays
- [ ] Description uses intent-based language
- [ ] Description under 1024 characters

### Markdown Body
- [ ] `## Workflow Routing` section with table format
- [ ] Explicit "read its file and follow the steps within it" instruction above table
- [ ] All routing table entries resolve to existing files
- [ ] `## Examples` section with 2–3 concrete patterns

### Structure
- [ ] `Tools/` directory exists (even if empty)
- [ ] No `backups/`, `Context/`, `Docs/`, or `Resources/` subdirectories
- [ ] Context files live in skill root, not in subdirectories
- [ ] Each workflow file has `## Reference Material` section
- [ ] `SkillIntent.md` present (recommended; required for skills with active update history)
- [ ] `WorkflowChains.md` present (recommended for skills with 5+ workflows)

### Workflow chaining
- [ ] `WorkflowChains.md` present (recommended for skills with 5+ workflows)
- [ ] Each workflow with outgoing chains has a `## Follow-Up` section
- [ ] Follow-Up sections match entries in `WorkflowChains.md` (WorkflowChains.md is authoritative)

### Bidirectional integrity
- [ ] Every routing table entry has a matching file on disk
- [ ] Every `Workflows/*.md` file has a routing table entry (no ghost files)
- [ ] Every context file in `## Reference Material` exists on disk
