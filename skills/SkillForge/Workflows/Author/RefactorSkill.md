# RefactorSkill Workflow

> **Trigger:** "refactor skill", "restructure skill", "reorganize skill", "major skill update", "add workflow to skill", "add workflow", "remove workflow", "rename workflow", "create workflow"

## Reference Material

- **Risk Framework:** `../../Standards/RiskFramework.md`
- **Authoritative Spec:** `../../Standards/SkillSystem.md`
- **Prompting Standards:** `../../Standards/PromptingStandards.md` — Wording and trigger phrase quality rules. Read before writing trigger phrases for new workflows.
- **Target skill's SkillIntent.md** (if present) — Read before restructuring; changes must not contradict the skill's stated out-of-scope decisions or constraints.
- `../../SkillIntent.md` — SkillForge's own design philosophy (First Principles guide how skills should be structured and maintained)
- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Perform major restructuring of an existing skill while preserving functionality. Use this for significant changes that affect multiple files or the overall skill architecture.

## Context & Motivation

Skills accumulate technical debt over time: naming conventions drift, workflows become disorganized, and structure diverges from SkillSystem.md requirements. Refactoring restores compliance and improves usability, but requires careful planning because changes affect multiple files and may break existing workflows. The structured approach here minimizes risk while enabling meaningful improvements.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Read `../../Standards/SkillSystem.md` for structure requirements
- User approval required before executing changes

## Workflow Steps

### Scope Detection — Quick vs. Full Refactor

Before beginning, determine the scope of the request:

| User Intent | Scope | Entry Point |
|-------------|-------|-------------|
| "Add a workflow", "remove workflow", "rename workflow", "create workflow" | **Quick** — single workflow operation | Jump to **Quick Operations** below |
| "Refactor skill", "restructure", "reorganize", "major update" | **Full** — multi-file restructuring | Continue to **Step 1** below |

If the user's intent is ambiguous, ask:
```
Is this a quick workflow operation (add/remove/rename) or a broader restructuring?
  [Q] Quick — single workflow change
  [F] Full — structural refactoring
```

---

## Quick Operations

For adding, removing, or renaming individual workflows. These are lightweight operations that don't require full structural analysis.

### Add Workflow

#### Step Q-A1: Determine Workflow Details

Gather from user:
- Workflow name (enforce TitleCase)
- Trigger phrase(s)
- Purpose/description

#### Step Q-A2: Create Workflow File

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

#### Step Q-A2.5: Trigger Phrase Quality Gate

Before writing trigger phrases into the workflow file or routing table, verify them against `PromptingStandards.md` (in this skill's root dir).

Check each proposed trigger phrase against:
- [ ] **Length**: 2-6 words. Longer phrases are fragile; single words over-trigger.
- [ ] **Natural language**: Would a real user say this unprompted? Test by imagining saying it aloud.
- [ ] **Specificity**: Does the phrase unambiguously indicate THIS workflow and not another?
- [ ] **Overlap check**: Compare against all existing trigger phrases in the target skill's SKILL.md routing table. No semantic duplicates.
- [ ] **Verb clarity**: The phrase should make the intended action obvious (add, remove, rename, validate, etc.)

If any phrase fails: revise before proceeding. Document the rejected phrase and reason in the summary output.

#### Step Q-A3: Update Routing Table

Add row to `## Workflow Routing` table in SKILL.md:

```markdown
| **[WorkflowName]** | "[trigger]" | `Workflows/[WorkflowName].md` |
```

#### Step Q-A4: Validate

- Verify file was created
- Verify routing table entry points to existing file
- Run skill validation

---

### Remove Workflow

#### Step Q-R1: Confirm Deletion

Request user confirmation before deletion to prevent accidental loss of workflow logic.

```
WARNING: This will permanently delete:
  - $PAI_DIR/skills/[SkillName]/Workflows/[WorkflowName].md

Type "confirm" to proceed.
```

#### Step Q-R2: Remove File

```bash
rm $PAI_DIR/skills/[SkillName]/Workflows/[WorkflowName].md
```

#### Step Q-R3: Update Routing Table

Remove the corresponding row from `## Workflow Routing` table in SKILL.md.

#### Step Q-R4: Validate

- Verify file was deleted
- Verify no orphan references remain in SKILL.md

---

### Rename Workflow

#### Step Q-N1: Validate New Name

- Enforce TitleCase
- Check new name doesn't conflict with existing workflow

#### Step Q-N2: Rename File

```bash
mv $PAI_DIR/skills/[SkillName]/Workflows/[OldName].md \
   $PAI_DIR/skills/[SkillName]/Workflows/[NewName].md
```

#### Step Q-N3: Update File Content

Update the `# [WorkflowName] Workflow` header inside the file.

#### Step Q-N4: Update Routing Table

Update the workflow name and file path in SKILL.md routing table.

#### Step Q-N5: Validate

- Verify old file no longer exists
- Verify new file exists
- Verify routing table points to correct file

---

## Full Refactor

For major restructuring that affects multiple files or the overall skill architecture.

### Step 1: Document Current State

Create a snapshot of the skill's current structure:

```
Skill: [SkillName]
Location: $PAI_DIR/skills/[SkillName]/

Files:
- SKILL.md (X lines)
- Tools/
  - [list files]
- Workflows/
  - [list files]
- [other files]

Frontmatter:
  name: [current name]
  description: [current description]

Workflows: [count]
Tools: [count]
```

### Step 1.5: SkillIntent Required Sections Check (MANDATORY — cannot skip)

Check if the target skill has a `SkillIntent.md` and whether it contains all three required sections.

```bash
cat $PAI_DIR/skills/[SkillName]/SkillIntent.md
```

**If SkillIntent.md does NOT exist:**
```
⚠️ [SkillName] has no SkillIntent.md.
Refactoring without a SkillIntent is high-risk — there is no anchor for what must not change.
Options:
  [C] Create SkillIntent now (chains to CreateSkillIntent, then resumes from Step 2)
  [S] Skip this refactor and create SkillIntent first
```
Do not proceed to Step 2 until SkillIntent.md exists.

**If SkillIntent.md exists — check for ALL THREE required sections:**

Scan for: `## Problem This Skill Solves`, `## Constraints`, `## Success Criteria`.

**If ANY required section is MISSING:**
```
⚠️ [SkillName]/SkillIntent.md is missing required section(s): [list missing sections].
Refactoring without a complete SkillIntent risks contradicting unstated design decisions.
Options:
  [A] Add missing sections now via CreateSkillIntent, then continue with refactor
  [S] Skip this refactor and complete the SkillIntent first
```
Do not proceed to Step 2 until all three sections are present. There is no defer path.

**If all three sections are PRESENT:** Proceed to Step 2. No action needed.

---

### Step 2: Identify Refactoring Goals

Common refactoring scenarios:

| Goal | Actions Required |
|------|------------------|
| **Rename skill** | Rename directory, update frontmatter, update internal references |
| **Split skill** | Create new skill, move workflows, update both routing tables |
| **Merge skills** | Combine workflows, merge routing tables, delete source skill |
| **Restructure workflows** | Rename/reorganize workflow files, update routing |
| **Canonicalize** | Apply TitleCase, add missing sections, fix structure |

### Step 3: Analyze Current State

**Scoping Note:** Match analysis depth to refactoring complexity:
- **Simple** (rename 1-2 files, fix TitleCase): Review only relevant dimensions below
- **Moderate** (restructure workflows, add sections): Review all dimensions briefly
- **Complex** (rename skill, merge skills, major changes): Conduct full analysis with checklists

Before proposing specific changes, analyze these dimensions as needed:

#### 3.1 Structural Issues

Examine the skill's organization and file structure:

- **File organization:** Are files in correct directories (Tools/, Workflows/)?
- **Naming consistency:** Do files follow TitleCase conventions?
- **Section ordering:** Does SKILL.md follow standard section order?
- **Duplicate content:** Is information repeated across multiple files?
- **Missing components:** Are required sections/files absent?

**Structural Checklist**
- [ ] Directory structure matches SkillSystem.md requirements
- [ ] All files use TitleCase naming
- [ ] No duplicate workflow definitions
- [ ] Required sections present (Examples, Prerequisites, etc.)

#### 3.2 Usability Issues

Evaluate how easy it is to understand and use the skill:

- **Workflow routing:** Can users easily find the right workflow?
- **Examples clarity:** Are examples realistic and helpful?
- **Documentation completeness:** Are all features documented?
- **Discoverability:** Can users figure out what the skill does?
- **Onboarding friction:** What barriers exist for first-time users?

**Usability Checklist**
- [ ] Routing table clearly maps triggers to workflows
- [ ] Each workflow has concrete examples
- [ ] USE WHEN clauses are specific and actionable
- [ ] Frontmatter description accurately reflects capabilities

#### 3.3 Compliance Issues

Check adherence to SkillSystem.md requirements:

- **Frontmatter validity:** YAML syntax correct, required fields present
- **TitleCase compliance:** Skill name, files, and workflows properly cased
- **USE WHEN clauses:** Present in frontmatter description
- **Routing table:** Properly formatted and complete
- **Tool documentation:** All tools documented with usage instructions

**Compliance Checklist**
- [ ] YAML frontmatter parses without errors
- [ ] Name follows TitleCase (no spaces, hyphens, underscores)
- [ ] Description includes "USE WHEN" clause
- [ ] Routing table uses correct markdown format
- [ ] Tools/ scripts have header comments with usage

#### 3.4 Impact and Risk Factors

Identify factors that will inform your decision framework:

- **Breaking changes** - Changes affecting existing users or integrations
- **Backward compatibility** - What must be preserved for existing workflows
- **Complexity implications** - Added complexity vs. improved clarity
- **Maintenance burden** - Long-term implications for skill maintenance
- **User impact scope** - Who is affected and how significantly

**Common Impact Patterns**
- **Renaming skill** → User commands, git history, documentation
- **Restructuring workflows** → Existing user workflows, routing
- **Adding sections** → Increased length vs. better guidance
- **Removing content** → Lost information vs. reduced noise

> Document these factors in detail in Step 4 Decision Framework.

### Step 4: Plan Changes with Decision Framework

For each proposed change, document using this framework:

#### Change Documentation Template

For each proposed change, document concisely:

```
CHANGE #: [Title of change]

What changes: [Specific files, sections, or content being modified]
Why: [Root problem being addressed]
Impact: [CRITICAL/HIGH/MEDIUM/LOW] - [who/what affected]
Risk: [HIGH/MEDIUM/LOW] - [brief justification]
Rollback: [Specific steps to undo, or "Revert file changes" for simple cases]
Dependencies: [List if any, or "None"]
```

**Note:** Keep each field to 1-2 lines. For simple changes, brief answers are acceptable.

#### Present Complete Plan

Show users the complete plan with all changes documented:

```
REFACTORING PLAN: [SkillName]

Goal: [High-level objective]

Summary:
  - X breaking changes (HIGH risk)
  - Y structural improvements (MEDIUM risk)
  - Z minor cleanups (LOW risk)

CHANGE 1: [Title]
  What: [Brief summary]
  Why: [Brief reason]
  Impact: [Severity level]
  Risk: [Level]

CHANGE 2: [Title]
  What: [Brief summary]
  Why: [Brief reason]
  Impact: [Severity level]
  Risk: [Level]

Total files affected: X
Estimated rollback effort: [Quick / Moderate / Extensive]

Confirm to proceed? (yes/no)
```

#### Example: Simple Refactor Walkthrough

**Scenario:** Fix TitleCase violation in DaemonSkill - rename "cleanup.md" to "Cleanup.md"

**Step 3 Analysis (Simple refactor - abbreviated):**
- **Structural:** ✓ TitleCase violation found (cleanup.md)
- **Usability:** ✓ No impact (routing will be updated, functionality unchanged)
- **Compliance:** ✓ Fixes TitleCase requirement from SkillSystem.md
- **Impact Factors:** Breaking=No, Backward Compat=Yes, Complexity=Minimal, User Impact=None

**Step 4 Decision Framework:**

```
CHANGE 1: Fix TitleCase for cleanup workflow

What changes: Workflows/cleanup.md → Workflows/Cleanup.md, update routing in SKILL.md
Why: TitleCase convention compliance per SkillSystem.md requirements
Impact: LOW - Internal file rename with routing update, no user-facing changes
Risk: LOW - Single file rename, straightforward operation
Rollback: Rename file back to cleanup.md, revert SKILL.md routing table
Dependencies: None
```

**Result:** Clear, concise documentation for a simple 1-file refactor. For complex refactors, expand each section accordingly.

### Step 5: Execute Changes

**Execute in dependency order per Decision Framework:**

1. **Backup reference** - Note all original values
2. **File operations** - Renames, moves, creates
3. **Content updates** - Internal references, routing tables
4. **Cleanup** - Remove orphaned files/references

### Step 6: Validate Result

Run full validation:

```bash
bun run $PAI_DIR/skills/SkillForge/Tools/ValidateSkill.ts [SkillName]
```

Manual checks:
- [ ] SKILL.md has valid frontmatter
- [ ] All workflow references resolve
- [ ] TitleCase naming throughout
- [ ] Examples section present
- [ ] Tools/ directory exists
- [ ] Risk assessments from Decision Framework were accurate
- [ ] No unexpected side effects occurred

### Step 7: Report Before/After

```
REFACTORING COMPLETE: [SkillName]

Before:
- [X] workflows
- [Y] tools
- Structure issues: [list]

After:
- [X'] workflows
- [Y'] tools
- All validation checks pass

Changes made:
1. [Change 1]
2. [Change 2]
```

## Rollback Procedure

If refactoring fails partway:

1. Report exactly which step failed
2. List completed changes that may need reverting
3. Provide manual rollback instructions if needed

## Constraints

- **User approval required** - Present plan before executing
- **Document everything** - Record before/after state
- **Validate thoroughly** - Run all checks after completion
- **Atomic when possible** - Complete fully or report failure point

## Example Output

```
SUMMARY: Refactored Daemon skill to comply with TitleCase conventions
ACTIONS:
  - Renamed workflows/cleanup.md -> Workflows/Cleanup.md
  - Renamed workflows/status.md -> Workflows/Status.md
  - Updated SKILL.md routing table references
  - Added missing Examples section
RESULTS: All validation checks pass
COMPLETED: Daemon skill refactored - now fully compliant with SkillSystem.md.
```

## Follow-Up

After completing this workflow, execute these chains:

| Condition | Chain To | Action |
|---|---|---|
| ALWAYS after restructuring | AgentEvalOrchestrator(scoped) | Announce: "Running scoped evaluation after major restructure..." then invoke `Orchestration/AgentEvalOrchestrator.md` with mode=scoped, changes="major restructure" |

This chain is Always — run it unconditionally after every RefactorSkill execution. For major restructures, the orchestrator may escalate scoped mode to full if changes are broad enough.

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Always chains: log `condition true — fired`. Silence on any chain entry violates SC7.
