# CreateSkill Workflow

> **Trigger:** "create a new skill", "new skill", "build a skill", "make a skill"

Create a new skill following the canonical structure with proper TitleCase naming.

## Reference Material

- `../SkillSystem.md` — Canonical skill structure spec (TitleCase naming, required sections, directory layout)
- `../PromptingStandards.md` — Wording and trigger phrase quality rules for new skill descriptions
- `../SkillIntent.md` — SkillForge's own design philosophy (First Principles guide how skills should be structured)

## Step 1: Read the Authoritative Sources

**REQUIRED FIRST:**

1. Read the skill system documentation: `$PAI_DIR/skills/SkillForge/SkillSystem.md`

## Step 2: Understand the Request

Ask the user:
1. What does this skill do?
2. What should trigger it?
3. What workflows does it need?

## Step 2.5: Separate User-Facing Workflows from Internal Pipeline Stages

**Before creating any files, classify every workflow the user described:**

> **The routing table maps USER INTENTS → workflows. It is not a list of all workflow files.**
> A user never says "gather context" or "synthesize findings" — those are pipeline internals.

For each workflow the user mentioned, ask:
- Would a real user type this trigger phrase? → **User-facing** → goes in routing table
- Is this called by another workflow, not directly by the user? → **Internal** → file exists but NOT in routing table

**Produce a classification table before writing any files:**

| Workflow | Type | Routing Table? |
|----------|------|----------------|
| [WorkflowName] | User-facing | ✓ YES |
| [PipelineStage] | Internal (called by [OrchestratorWorkflow]) | ✗ NO |

**Common signal for internal stages:** If the user described a numbered pipeline ("step 1 gathers X, step 2 does Y…"), those numbered steps are internal. The entry point that kicks off the pipeline is user-facing.

**Note in the workflow file for internal stages:** Add a comment at the top:
```
> **Internal workflow** — invoked by [OrchestratorWorkflow].md, not user-facing.
> Do not add to SKILL.md routing table.
```

Only proceed to Step 3 once every workflow has been classified.

## Step 3: Determine TitleCase Names

**All names must use TitleCase (PascalCase).**

| Component | Format | Example |
|-----------|--------|---------|
| Skill directory | TitleCase | `Blogging`, `Daemon`, `CreateSkill` |
| Workflow files | TitleCase.md | `Create.md`, `UpdateDaemonInfo.md` |
| Reference docs | TitleCase.md | `ProsodyGuide.md`, `ApiReference.md` |
| Tool files | TitleCase.ts | `ManageServer.ts` |
| Help files | TitleCase.help.md | `ManageServer.help.md` |

**Wrong naming (NEVER use):**
- `create-skill`, `create_skill`, `CREATESKILL` -> Use `CreateSkill`
- `create.md`, `CREATE.md`, `create-info.md` -> Use `Create.md`, `CreateInfo.md`

## Step 4: Create the Skill Directory

```bash
mkdir -p $PAI_DIR/skills/[SkillName]/Workflows
mkdir -p $PAI_DIR/skills/[SkillName]/Tools
```

**Example:**
```bash
mkdir -p $PAI_DIR/skills/Daemon/Workflows
mkdir -p $PAI_DIR/skills/Daemon/Tools
```

## Step 5: Create SKILL.md

Follow this exact structure:

```yaml
---
name: SkillName
description: [What it does]. USE WHEN [intent triggers using OR]. [Additional capabilities].
---

# SkillName

[Brief description]

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running the **WorkflowName** workflow from the **SkillName** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowOne** | "trigger phrase" | `Workflows/WorkflowOne.md` |
| **WorkflowTwo** | "another trigger" | `Workflows/WorkflowTwo.md` |

## Examples

**Example 1: [Common use case]**
```
User: "[Typical user request]"
-> Invokes WorkflowOne workflow
-> [What skill does]
-> [What user gets back]
```

**Example 2: [Another use case]**
```
User: "[Different request]"
-> [Process]
-> [Output]
```

## [Additional Documentation]

[Any other relevant info]
```

## Step 6: Create Workflow Files

For each workflow in the routing section:

```bash
touch $PAI_DIR/skills/[SkillName]/Workflows/[WorkflowName].md
```

### Workflow-to-Tool Integration (REQUIRED for workflows with CLI tools)

**If a workflow calls a CLI tool, it MUST include intent-to-flag mapping tables.**

This pattern translates natural language user requests into appropriate CLI flags:

```markdown
## Intent-to-Flag Mapping

### Model/Mode Selection

| User Says | Flag | When to Use |
|-----------|------|-------------|
| "fast", "quick", "draft" | `--model haiku` | Speed priority |
| (default), "best", "high quality" | `--model opus` | Quality priority |

### Output Options

| User Says | Flag | Effect |
|-----------|------|--------|
| "JSON output" | `--format json` | Machine-readable |
| "detailed" | `--verbose` | Extra information |

## Execute Tool

Based on user request, construct the CLI command:

\`\`\`bash
bun ToolName.ts \
  [FLAGS_FROM_INTENT_MAPPING] \
  --required-param "value"
\`\`\`
```

**Why this matters:**
- Tools have rich configuration via flags
- Workflows should expose this flexibility, not hardcode single patterns
- Users speak naturally; workflows translate to precise CLI

**Reference:** `$PAI_DIR/skills/PAI/SYSTEM/CLIFIRSTARCHITECTURE.md` (Workflow-to-Tool Integration section)

**Examples (TitleCase):**
```bash
touch $PAI_DIR/skills/Daemon/Workflows/UpdateDaemonInfo.md
touch $PAI_DIR/skills/Daemon/Workflows/UpdatePublicRepo.md
touch $PAI_DIR/skills/Blogging/Workflows/Create.md
touch $PAI_DIR/skills/Blogging/Workflows/Publish.md
```

## Step 7: Verify TitleCase

Run this check:
```bash
ls $PAI_DIR/skills/[SkillName]/
ls $PAI_DIR/skills/[SkillName]/Workflows/
ls $PAI_DIR/skills/[SkillName]/Tools/
```

Verify ALL files use TitleCase:
- `SKILL.md` (exception - always uppercase)
- `WorkflowName.md`
- `ToolName.ts`
- `ToolName.help.md`

## Step 8: Final Checklist

### Naming (TitleCase)
- [ ] Skill directory uses TitleCase (e.g., `Blogging`, `Daemon`)
- [ ] All workflow files use TitleCase (e.g., `Create.md`, `UpdateInfo.md`)
- [ ] All reference docs use TitleCase (e.g., `ProsodyGuide.md`)
- [ ] All tool files use TitleCase (e.g., `ManageServer.ts`)
- [ ] Routing table workflow names match file names exactly

### YAML Frontmatter
- [ ] `name:` uses TitleCase
- [ ] `description:` is single-line with embedded `USE WHEN` clause
- [ ] No separate `triggers:` or `workflows:` arrays
- [ ] Description uses intent-based language
- [ ] Description is under 1024 characters

### Markdown Body
- [ ] `## Workflow Routing` section with table format
- [ ] Only **user-facing** workflows appear in routing table (internal pipeline stages must NOT be listed)
- [ ] Every routing table entry has a trigger phrase a real user would actually say
- [ ] `## Examples` section with 2-3 concrete usage patterns

### Structure
- [ ] `Tools/` directory exists (even if empty)
- [ ] No `backups/` directory inside skill

### CLI-First Integration (for skills with CLI tools)
- [ ] CLI tools expose configuration via flags (see CliFirstArchitecture.md)
- [ ] Workflows that call CLI tools have intent-to-flag mapping tables
- [ ] Flag mappings cover: mode selection, output options, post-processing (where applicable)

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| New skill was created | ValidateSkill | Announce: "Validating newly created skill..." then execute `Workflows/ValidateSkill.md` |
| New skill was created | CreateSkillIntent | Announce: "Generating SkillIntent for new skill..." then execute `Workflows/CreateSkillIntent.md` |

Both chains are Always — run them unconditionally after every CreateSkill execution.

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Both chains here are Always — both log `condition true — fired` after CreateSkill completes.

## Done

Skill created following canonical structure with proper TitleCase naming throughout.
