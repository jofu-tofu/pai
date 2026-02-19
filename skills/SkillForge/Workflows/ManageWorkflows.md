# ManageWorkflows Workflow

> **Trigger:** "add workflow to skill", "add workflow", "remove workflow", "rename workflow", "create workflow"

## Reference Material

- `../PromptingStandards.md` — Wording and trigger phrase quality rules (Claude 4.x). Read before writing trigger phrases for new workflows.
- `../RiskFramework.md` — Change risk classification guide. Add = Low, Rename = Medium, Remove = High. Consult before executing the operation to apply the correct approval level.
- `[target skill]/SkillIntent.md` — Target skill's design intent (if present). Read before modifying to ensure changes don't contradict original purpose or out-of-scope decisions.
- `../SkillIntent.md` — SkillForge's own design philosophy (First Principles guide how skills should be structured and maintained)
- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Add, remove, or rename workflow files within an existing skill, and update the SKILL.md routing table accordingly.

## Context & Motivation

Skills grow and change as new capabilities are needed or existing workflows become obsolete. Adding workflows extends skill functionality; removing workflows reduces clutter; renaming workflows improves discoverability. All changes must keep the SKILL.md routing table synchronized with actual workflow files to prevent broken references.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Read `../SkillSystem.md` for workflow conventions

## Workflow Steps

### Step 1: Identify Operation

| Operation | Description |
|-----------|-------------|
| **Add** | Create new workflow file and add to routing table |
| **Remove** | Delete workflow file and remove from routing table |
| **Rename** | Rename file and update all references |

### Step 2: Validate Target Skill

```
Verify: $PAI_DIR/skills/[SkillName]/SKILL.md exists
Verify: $PAI_DIR/skills/[SkillName]/Workflows/ directory exists
```

If Workflows/ directory doesn't exist for an Add operation, create it.

### Step 2.5: SkillIntent Required Sections Check (MANDATORY — cannot skip)

Check if the target skill has a `SkillIntent.md` and whether it contains all three required sections.

```bash
cat $PAI_DIR/skills/[SkillName]/SkillIntent.md
```

**If SkillIntent.md does NOT exist:**
```
⚠️ [SkillName] has no SkillIntent.md.
This update cannot be considered complete without one.
Options:
  [C] Create SkillIntent now (chains to CreateSkillIntent, then resumes operation)
  [S] Skip this update and create SkillIntent first
```
Do not proceed to the operation steps until SkillIntent.md exists.

**If SkillIntent.md exists — check for ALL THREE required sections:**

Scan for: `## Problem This Skill Solves`, `## Constraints`, `## Success Criteria`.

**If ANY required section is MISSING:**
```
⚠️ [SkillName]/SkillIntent.md is missing required section(s): [list missing sections].
Options:
  [A] Add missing sections now via CreateSkillIntent, then continue with the operation
  [S] Skip this update and complete the SkillIntent first
```
Do not proceed until all three sections are present. There is no defer path.

**If all three sections are PRESENT:** Proceed to the operation steps below. No action needed.

**Note — SkillIntent.md content modifications:** If the requested operation involves editing the *content* of a target skill's `SkillIntent.md` (not just checking it), this qualifies as a SkillIntent.md modification per `../RiskFramework.md § Unconditional Confirmation Triggers`. Obtain explicit user confirmation before making any content changes to SkillIntent.md.

---

## Add Workflow

### Step A1: Determine Workflow Details

Gather from user:
- Workflow name (enforce TitleCase)
- Trigger phrase(s)
- Purpose/description

### Step A2: Create Workflow File

Create `$PAI_DIR/skills/[SkillName]/Workflows/[WorkflowName].md`:

```markdown
# [WorkflowName] Workflow

> **Trigger:** "[trigger phrases]"

## Purpose

[Description of what this workflow does]

## Workflow Steps

### Step 1: [First Step]

[Instructions]

### Step 2: [Second Step]

[Instructions]

## Example Output

\`\`\`
SUMMARY: [What was done]
ACTIONS: [Steps taken]
RESULTS: [Outcome]
COMPLETED: [Brief completion message]
\`\`\`
```

### Step A2.5: Trigger Phrase Quality Gate

Before writing trigger phrases into the workflow file or routing table, verify them against `PromptingStandards.md` (in this skill's root dir).

Check each proposed trigger phrase against:
- [ ] **Length**: 2–6 words. Longer phrases are fragile; single words over-trigger.
- [ ] **Natural language**: Would a real user say this unprompted? Test by imagining saying it aloud.
- [ ] **Specificity**: Does the phrase unambiguously indicate THIS workflow and not another?
- [ ] **Overlap check**: Compare against all existing trigger phrases in the target skill's SKILL.md routing table. No semantic duplicates.
- [ ] **Verb clarity**: The phrase should make the intended action obvious (add, remove, rename, validate, etc.)

If any phrase fails: revise before proceeding to Step A3. Document the rejected phrase and reason in the summary output.

### Step A3: Update Routing Table

Add row to `## Workflow Routing` table in SKILL.md:

```markdown
| **[WorkflowName]** | "[trigger]" | `Workflows/[WorkflowName].md` |
```

### Step A4: Validate

- Verify file was created
- Verify routing table entry points to existing file
- Run skill validation

---

## Remove Workflow

### Step R1: Confirm Deletion

Request user confirmation before deletion to prevent accidental loss of workflow logic.

```
WARNING: This will permanently delete:
  - $PAI_DIR/skills/[SkillName]/Workflows/[WorkflowName].md

Type "confirm" to proceed.
```

### Step R2: Remove File

```bash
rm $PAI_DIR/skills/[SkillName]/Workflows/[WorkflowName].md
```

### Step R3: Update Routing Table

Remove the corresponding row from `## Workflow Routing` table in SKILL.md.

### Step R4: Validate

- Verify file was deleted
- Verify no orphan references remain in SKILL.md

---

## Rename Workflow

### Step N1: Validate New Name

- Enforce TitleCase
- Check new name doesn't conflict with existing workflow

### Step N2: Rename File

```bash
mv $PAI_DIR/skills/[SkillName]/Workflows/[OldName].md \
   $PAI_DIR/skills/[SkillName]/Workflows/[NewName].md
```

### Step N3: Update File Content

Update the `# [WorkflowName] Workflow` header inside the file.

### Step N4: Update Routing Table

Update the workflow name and file path in SKILL.md routing table.

### Step N5: Validate

- Verify old file no longer exists
- Verify new file exists
- Verify routing table points to correct file

---

### Completion Gate: Prompt Quality Audit (BLOCKING — cannot skip)

**After ANY Add or Rename operation completes**, PromptQualityAudit MUST run before reporting completion. This is not optional — every workflow addition introduces trigger phrases, and every rename may change routing.

1. Log: `Chain PromptQualityAudit: condition true — firing (completion gate)`
2. Execute `Workflows/PromptQualityAudit.md` on the modified skill
3. If PromptQualityAudit finds failures: fix them before proceeding to the summary output
4. After PromptQualityAudit passes: proceed to summary

**For Remove operations only:** PromptQualityAudit is not required (no new phrases introduced), but log: `Completion Gate: remove operation — PromptQualityAudit skipped`

**Why this gate exists:** Step A2.5 catches issues during creation. This gate catches issues that Step A2.5 missed or that emerged from interaction with existing phrases. Two layers: inline check + full audit.

---

## Constraints

- **TitleCase mandatory** - All workflow names must use TitleCase
- **Confirmation for deletions** - Always obtain explicit user confirmation before deleting workflows
- **Atomic operations** - Complete all steps or report failure point
- **Routing sync** - SKILL.md routing table must always match actual files

## Example Output

```
SUMMARY: Added Cleanup workflow to Daemon skill
ACTIONS:
  - Created Workflows/Cleanup.md
  - Added routing table entry
  - Validated references
RESULTS: Workflow added successfully
COMPLETED: Daemon skill now includes Cleanup workflow.
```

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| A workflow was added or removed | StressTest | Announce: "Running stress test to verify skill integrity after workflow change..." then execute `Workflows/StressTest.md` |
| A new workflow was added | PromptQualityAudit | Announce: "Running prompt quality audit on the new workflow's trigger phrases..." then execute `Workflows/PromptQualityAudit.md` |

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Skipped chains MUST be logged — silence on a skipped chain violates SC7.

If no conditions match, skip follow-ups.
