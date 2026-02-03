# RefactorSkill Workflow

> **Trigger:** "refactor skill", "restructure skill", "reorganize skill", "major skill update"

## Reference Material

- **Validation Checklist:** `../ValidationChecklist.md`
- **Risk Framework:** `../RiskFramework.md`
- **Authoritative Spec:** `$PAI_DIR/skills/PAI/SYSTEM/SKILLSYSTEM.md`

## Purpose

Perform major restructuring of an existing skill while preserving functionality. Use this for significant changes that affect multiple files or the overall skill architecture.

## Context & Motivation

Skills accumulate technical debt over time: naming conventions drift, workflows become disorganized, and structure diverges from SkillSystem.md requirements. Refactoring restores compliance and improves usability, but requires careful planning because changes affect multiple files and may break existing workflows. The structured approach here minimizes risk while enabling meaningful improvements.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Read `$PAI_DIR/skills/PAI/SkillSystem.md` for structure requirements
- User approval required before executing changes

## Workflow Steps

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
bun run $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts [SkillName]
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
