# ModifyContent Workflow

> **Trigger:** "update skill content", "update the skill", "update the [name] skill", "update skill to", "change the skill", "change the [name] skill", "change skill", "edit skill description", "change skill frontmatter", "tweak skill", "adjust skill"

## Reference Material

- `../../Standards/PromptingStandards.md` — Wording and trigger phrase quality rules. Read when modifying frontmatter descriptions or trigger phrases.
- `../../Standards/RiskFramework.md` — Change risk classification guide. Consult before Step 4 to classify the modification as Additive/Enhancement/Modification/Destructive and apply the appropriate approval level.
- `[target skill]/SkillIntent.md` — Target skill's design intent (if present). Read before modifying to ensure changes don't contradict original purpose or out-of-scope decisions.
- `../../SkillIntent.md` — SkillForge's own design philosophy (First Principles guide how skills should be structured and maintained)
- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Modify the content of an existing skill's SKILL.md file, including frontmatter, description, routing table, or examples section.

## Context & Motivation

Skills evolve as usage patterns emerge. When frontmatter becomes stale, routing tables drift from actual workflows, or examples no longer match real usage, the skill loses effectiveness. This workflow provides a structured approach to content updates that preserves skill integrity while enabling necessary evolution.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Read `../../Standards/SkillSystem.md` for structure requirements

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

### Step 2.5: SkillIntent Required Sections Check (MANDATORY — cannot skip)

Check if the target skill has a `SkillIntent.md` and whether it contains all three required sections.

**Check A — SkillIntent exists:**
```bash
cat $PAI_DIR/skills/[SkillName]/SkillIntent.md
```

**If SkillIntent.md does NOT exist:**
```
⚠️ [SkillName] has no SkillIntent.md.
This update cannot be considered complete without one.
Options:
  [C] Create SkillIntent now (chains to CreateSkillIntent, then resumes from Step 3)
  [S] Skip this update and create SkillIntent first
```
Do not proceed to Step 3 until SkillIntent.md exists.

**If SkillIntent.md exists — Check B — All three required sections present:**

Scan for ALL THREE sections: `## Problem This Skill Solves`, `## Constraints`, `## Success Criteria`.

**If ANY required section is MISSING:**
```
⚠️ [SkillName]/SkillIntent.md is missing required section(s): [list missing sections].
These sections are required before this update is considered complete.
Options:
  [A] Add missing sections now via CreateSkillIntent, then continue with this modification
  [S] Skip this update and complete the SkillIntent first
```
Do not proceed to Step 3 until all three sections are present. There is no defer path — the sections must exist before this modification completes.

**If all three sections are PRESENT:** Proceed to Step 3. No action needed.

---

### Step 3: Determine Modification Type

| Modification | Target Section |
|--------------|----------------|
| Update description | YAML frontmatter `description:` field |
| Change skill name | YAML frontmatter `name:` field + directory rename |
| Add workflow to table | `## Workflow Routing` table |
| Update examples | `## Examples` section |
| Add new section | Markdown body |

### Step 3.5: Authoring Context Load

If this modification touches user-facing wording (description, USE WHEN clause, trigger phrases, examples), read the prompting standards before writing:

```
$PAI_DIR/skills/SkillForge/Standards/PromptingStandards.md
```

This is a context load, not a gate. Use these standards while making changes in Step 4. Step 4.5 will verify the output — this step ensures you write correctly the first time.

**When in doubt, load.** The cost of reading 139 lines is negligible; the cost of skipping when wording is involved creates a rewrite loop. Only skip for changes that are unambiguously structural:
- **Skip examples:** section reordering with no wording edits, path-only renames, adding a missing `Tools/` directory
- **Load examples:** editing description text, changing USE WHEN clause, modifying trigger phrases, rewriting examples, renaming a trigger phrase for clarity

Record reason if skipped. Uses the same scope as Step 4.5.

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

### Step 4.5: Prompt Quality Gate (default-on for wording edits)

Run this step whenever the modification touches user-facing wording. Only skip if the change is strictly non-text structural (for example: section reordering with no wording changes, or path-only renames).

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

Report any gate failures before proceeding to Step 5. If failures found: revise wording and re-check. If this step is skipped, record the exact reason.

### Step 5: Validate Changes

Run validation checks:
1. YAML frontmatter parses correctly
2. `USE WHEN` clause present in description
3. All workflow references in routing table resolve
4. TitleCase naming enforced

---

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
| ALWAYS after ModifyContent completes | AgentEvalOrchestrator(scoped) | Announce: "Running scoped evaluation on modified content..." then invoke `Orchestration/AgentEvalOrchestrator.md` with mode=scoped, changes="{description of what was edited — e.g., 'description frontmatter updated', 'routing table modified', 'examples rewritten'}" |

This chain is Always — run it unconditionally after every ModifyContent execution. The orchestrator selects relevant evaluation dimensions based on the change context.

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Always chains: log `condition true — fired`. Silence on any chain entry violates SC7.
