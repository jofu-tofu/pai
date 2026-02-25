# ModifyContent Workflow

> **Trigger:** "update skill content", "update the skill", "update the [name] skill", "update skill to", "change the skill", "change the [name] skill", "change skill", "edit skill description", "change skill frontmatter", "tweak skill", "adjust skill"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md` — Prompt engineering reference. Read first.
- **Skill System Spec:** `../Standards/SkillSystem.md`
- **Target skill's SkillIntent.md** (if present) — Read before modifying to ensure changes don't contradict original purpose.

## Purpose

Modify the content of an existing skill's SKILL.md file, including frontmatter, description, routing table, or examples section.

## Workflow Steps

### Step 1: Load Prompting Standards

Read `../Standards/PromptingStandards.md`. All content changes must align with its principles (signal density, positive framing, soft trigger language, Claude 4.x patterns).

### Step 2: Identify and Read Target Skill

Verify `$PAI_DIR/skills/[SkillName]/SKILL.md` exists. Read current content. If target skill has SkillIntent.md, read it first. If missing, note it in the output.

### Step 3: Determine Modification Type

| Modification | Target Section |
|--------------|----------------|
| Update description | YAML frontmatter `description:` field |
| Change skill name | YAML frontmatter `name:` field + directory rename |
| Add workflow to table | `## Workflow Routing` table |
| Update examples | `## Examples` section |
| Add new section | Markdown body |

### Step 4: Apply Changes

**For frontmatter changes:**
- Preserve single-line format for description
- Maintain `USE WHEN` clause structure
- Enforce TitleCase for name field

**For routing table changes:**
- Maintain table format alignment
- Verify referenced workflow files exist
- Use TitleCase for workflow names

**For examples changes:**
- Follow existing example format
- Include User prompt and arrow-denoted steps

### Step 5: Validate Changes

1. YAML frontmatter parses correctly
2. `USE WHEN` clause present in description
3. All workflow references in routing table resolve
4. TitleCase naming enforced

### Step 6: Report Changes

```
SUMMARY: Updated [SkillName] skill
ACTIONS:
  - Modified [section] from "[old]" to "[new]"
RESULTS: Skill updated successfully
```

After modifying content, run `ValidateSkill.ts` on the target skill.
