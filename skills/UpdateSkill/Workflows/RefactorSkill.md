# RefactorSkill Workflow

> **Trigger:** "refactor skill", "restructure skill", "reorganize skill", "major skill update"

## Purpose

Perform major restructuring of an existing skill while preserving functionality. Use this for significant changes that affect multiple files or the overall skill architecture.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Read `$PAI_DIR/skills/CORE/SkillSystem.md` for structure requirements
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

### Step 3: Plan Changes

Present refactoring plan to user:

```
REFACTORING PLAN: [SkillName]

Goal: [What we're trying to achieve]

Changes:
1. [First change]
2. [Second change]
3. [Third change]

Files affected:
- [file1] - [what changes]
- [file2] - [what changes]

Confirm to proceed? (yes/no)
```

### Step 4: Execute Changes

**Execute in order:**

1. **Backup reference** - Note all original values
2. **File operations** - Renames, moves, creates
3. **Content updates** - Internal references, routing tables
4. **Cleanup** - Remove orphaned files/references

### Step 5: Validate Result

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

### Step 6: Report Before/After

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
