# ManageWorkflows Workflow

> **Trigger:** "add workflow to skill", "remove workflow", "rename workflow", "create workflow"

## Purpose

Add, remove, or rename workflow files within an existing skill, and update the SKILL.md routing table accordingly.

## Context & Motivation

Skills grow and change as new capabilities are needed or existing workflows become obsolete. Adding workflows extends skill functionality; removing workflows reduces clutter; renaming workflows improves discoverability. All changes must keep the SKILL.md routing table synchronized with actual workflow files to prevent broken references.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Read `$PAI_DIR/skills/CORE/SkillSystem.md` for workflow conventions

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
