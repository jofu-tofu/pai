# CreateSkill Workflow

> **Trigger:** "create a new skill", "new skill", "build a skill", "make a skill"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md`
- **Skill System Spec:** `../Standards/SkillSystem.md`

## Purpose

Create a new skill following the canonical structure with proper TitleCase naming.

## Workflow Steps

### Step 1: Understand the Request

Ask the user:
1. What does this skill do?
2. What should trigger it?
3. What workflows does it need?

### Step 2: Classify Workflows

Before creating files, classify each workflow:
- **User-facing** (user would type the trigger phrase) -> goes in routing table
- **Internal** (called by another workflow) -> file exists but NOT in routing table

### Step 3: Determine TitleCase Names

All names must use TitleCase (PascalCase). See SkillSystem.md for naming rules.

### Step 4: Create Directory Structure

```bash
mkdir -p $PAI_DIR/skills/[SkillName]/Workflows
mkdir -p $PAI_DIR/skills/[SkillName]/Tools
```

### Step 5: Create SKILL.md

Follow the structure defined in SkillSystem.md:
- YAML frontmatter with TitleCase `name:` and single-line `description:` containing `USE WHEN`
- `## Workflow Routing` section with table
- `## Examples` section with 2-3 concrete patterns

### Step 6: Create Workflow Files

For each workflow, create `Workflows/[WorkflowName].md` with:
- Trigger line
- `## Reference Material` section
- `## Purpose` section
- `## Workflow Steps` section

If a workflow calls a CLI tool, include intent-to-flag mapping tables.

### Step 7: Verify

- All files use TitleCase naming
- YAML frontmatter parses correctly with USE WHEN clause
- All routing table entries resolve to existing files
- Examples section present with 2-3 patterns
- Tools/ directory exists

After creating the skill, run `ValidateSkill.ts` on it.
