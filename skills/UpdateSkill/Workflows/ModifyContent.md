# ModifyContent Workflow

> **Trigger:** "update skill content", "edit skill description", "change skill frontmatter"

## Reference Material

- None. (this workflow operates entirely on what the user provides and the target skill's SKILL.md)

## Purpose

Modify the content of an existing skill's SKILL.md file, including frontmatter, description, routing table, or examples section.

## Context & Motivation

Skills evolve as usage patterns emerge. When frontmatter becomes stale, routing tables drift from actual workflows, or examples no longer match real usage, the skill loses effectiveness. This workflow provides a structured approach to content updates that preserves skill integrity while enabling necessary evolution.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Read `$PAI_DIR/skills/PAI/SYSTEM/SKILLSYSTEM.md` for structure requirements

## Workflow Steps

### Step 1: Identify Target Skill

```
User specifies: "[SkillName]"
-> Verify $PAI_DIR/skills/[SkillName]/SKILL.md exists
-> If not found, report error and list available skills
```

### Step 2: Read Current Content

```bash
# Read the current SKILL.md
cat $PAI_DIR/skills/[SkillName]/SKILL.md
```

Identify:
- Current frontmatter (name, description)
- Workflow routing table
- Examples section
- Any additional sections

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

Run validation checks:
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
COMPLETED: [SkillName] [section] updated.
```

## Constraints

- **Preserve structure** - Do not remove required sections
- **Backup awareness** - Note original values in output for rollback reference
- **Validation required** - Always validate after changes

## Example Output

```
SUMMARY: Updated Prompting skill description
ACTIONS:
  - Modified frontmatter description
  - Added "template generation" to USE WHEN clause
RESULTS: SKILL.md updated, validation passed
COMPLETED: Prompting description updated with template generation.
```
