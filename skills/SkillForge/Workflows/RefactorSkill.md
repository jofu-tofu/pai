# RefactorSkill Workflow

> **Trigger:** "refactor skill", "restructure skill", "reorganize skill", "major skill update", "add workflow", "remove workflow", "rename workflow", "create workflow", "canonicalize skill", "fix skill structure", "convert skill format"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md`
- **Skill System Spec:** `../Standards/SkillSystem.md`
- **Target skill's SkillIntent.md** (if present) — Read before restructuring; changes must not contradict the skill's stated out-of-scope or constraints.

## Purpose

Perform major restructuring of an existing skill while preserving functionality. Also handles canonicalization (converting old-format skills to current standard). Use this for significant changes that affect multiple files or the overall skill architecture.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- User approval required before executing changes

## Scope Detection

| User Intent | Scope | Entry Point |
|-------------|-------|-------------|
| "Add a workflow", "remove workflow", "rename workflow" | **Quick** — single workflow operation | Jump to **Quick Operations** |
| "Refactor skill", "restructure", "reorganize", "major update" | **Full** — multi-file restructuring | Continue to **Full Refactor** |
| "Canonicalize skill", "fix skill structure", "convert skill format" | **Canonicalize** — format conversion | Continue to **Full Refactor** with canonicalization focus |

---

## Quick Operations

### Add Workflow

- Gather workflow name (TitleCase), trigger phrases, and purpose from user
- Create `Workflows/[WorkflowName].md` with standard structure (Trigger, Reference Material, Purpose, Workflow Steps)
- Add routing table entry in SKILL.md
- Verify trigger phrases: 2-6 words, natural language, no overlap with existing triggers
- Run ValidateSkill.ts

### Remove Workflow

- Confirm deletion with user (unconditional confirmation required)
- Delete workflow file
- Remove routing table entry from SKILL.md
- Verify no orphan references remain

### Rename Workflow

- Validate new name is TitleCase and doesn't conflict
- Rename file, update header inside file
- Update routing table entry in SKILL.md
- Verify old file gone, new file exists, routing correct

---

## Full Refactor

### Step 1: Document Current State

Read the target skill and create a snapshot: file count, workflow count, structure overview.

### Step 2: SkillIntent Check

If target skill has `SkillIntent.md`, read it. If missing, offer to create one via CreateSkillIntent before proceeding. If it exists but lacks required sections (`## Problem This Skill Solves`, `## Constraints`, `## Success Criteria`), offer to complete it first.

### Step 3: Identify Issues

Analyze against SkillSystem.md requirements. Common issues:

**Structural:** Files in wrong directories, missing TitleCase, duplicate content, missing required sections

**Format (canonicalization):** Multi-line YAML `description: |`, separate `triggers:` arrays, separate `workflows:` arrays in YAML, non-TitleCase file/directory names, missing `USE WHEN` in description, workflow routing missing from markdown body

**Compliance:** Invalid YAML, missing USE WHEN, broken routing references

### Step 4: Plan Changes

For each proposed change, document:
- What changes and why
- Risk level (Low/Medium/High per SkillSystem.md)
- Rollback approach

Present the complete plan to user for approval before executing.

### Step 5: Execute Changes

Execute in dependency order:
1. File operations (renames, moves, creates)
2. Content updates (references, routing tables, frontmatter)
3. Cleanup (remove orphaned files/references)

### Step 6: Validate

Run `ValidateSkill.ts` on the target skill. Fix any failures before reporting.

### Step 7: Report

Report before/after state, all changes made, and validation results.
