# ModifyContent Workflow

> **Trigger:** "update skill content", "edit skill description", "change skill frontmatter"

## Reference Material

- `PromptingStandards.md` — Wording and trigger phrase quality rules. Read when modifying frontmatter descriptions or trigger phrases.
- `[target skill]/SkillIntent.md` — Target skill's design intent (if present). Read before modifying to ensure changes don't contradict original purpose or out-of-scope decisions.
- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Modify the content of an existing skill's SKILL.md file, including frontmatter, description, routing table, or examples section.

## Context & Motivation

Skills evolve as usage patterns emerge. When frontmatter becomes stale, routing tables drift from actual workflows, or examples no longer match real usage, the skill loses effectiveness. This workflow provides a structured approach to content updates that preserves skill integrity while enabling necessary evolution.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Read `../SkillSystem.md` for structure requirements

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

### Step 4.5: Prompt Quality Gate (descriptions and trigger phrases only)

**Skip this step if the modification was structural only** (adding a section, updating examples format, renaming a file path). Run this step if the modification touched any of: `description:` field, `USE WHEN` clause, trigger phrases in the routing table.

Read `PromptingStandards.md` (in this skill's root dir) and verify the modified wording against these criteria:

**For USE WHEN / description wording:**
- [ ] Starts with a clear action verb or "USE WHEN" clause
- [ ] Specific enough to not over-trigger (no vague terms like "when needed" or "as appropriate")
- [ ] No XML tags — markdown-first per Claude 4.x patterns
- [ ] Concrete signal words a user would actually say, not meta-descriptions

**For trigger phrases:**
- [ ] Each phrase is 2–6 words (shorter = more reliable matching)
- [ ] No phrase overlaps semantically with another workflow's triggers
- [ ] Phrase is something a real user would naturally say, not internal jargon
- [ ] New phrase doesn't create ambiguity with adjacent workflows

Report any gate failures before proceeding to Step 5. If failures found: revise wording and re-check. Do not skip the gate.

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

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| Trigger phrases or USE WHEN clause were modified | PromptQualityAudit | Announce: "Running prompt quality audit on the phrases you just changed..." then execute `Workflows/PromptQualityAudit.md` |
| Significant structural changes made (not just description edits) | StressTest | Announce: "Running stress test to verify skill integrity..." then execute `Workflows/StressTest.md` |

If no conditions match, skip follow-ups.
