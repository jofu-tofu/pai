# ValidateSkill Workflow

> **Trigger:** "validate skill", "check skill", "verify skill", "is skill valid"

## Reference Material

- **Authoritative Spec:** `../SkillSystem.md`
- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Run comprehensive validation checks on a skill to ensure it complies with the SkillSystem.md specification. Reports all issues found with specific remediation guidance.

## Context & Motivation

Skills must follow SkillSystem.md conventions for the PAI system to route commands correctly, display accurate descriptions, and maintain consistent behavior. Validation catches structural issues (missing sections, broken references), naming violations (TitleCase requirements), and compliance gaps (missing USE WHEN clauses) before they cause runtime problems or user confusion.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Reference: `../SkillSystem.md`

## Workflow Steps

### Step 1: Identify Target

```
User specifies: "[SkillName]"
-> Check if $PAI_DIR/skills/[SkillName]/ exists
-> If not found, list available skills
```

### Step 2: Run Validation Checks

#### Check 1: SKILL.md Exists

The SKILL.md file is the entry point for all skill routing. Without it, the PAI system cannot discover or invoke the skill.

```
[ ] $PAI_DIR/skills/[SkillName]/SKILL.md exists
```

#### Check 2: Valid Frontmatter

Frontmatter provides metadata for skill routing and display. The USE WHEN clause enables accurate command matching; TitleCase ensures consistent naming across the system.

```yaml
---
name: [Must be TitleCase]
description: [Must be single line, must contain "USE WHEN"]
---
```

Validate:
- [ ] Frontmatter delimiters present (`---`)
- [ ] `name` field exists and uses TitleCase
- [ ] `description` field exists
- [ ] `description` contains `USE WHEN` clause
- [ ] `description` is single line (no `|` multiline)
- [ ] `description` under 1024 characters

#### Check 3: TitleCase Naming

TitleCase naming enforces consistency across all skills, making them predictable for users and enabling reliable programmatic access.

- [ ] Skill directory name is TitleCase
- [ ] YAML `name` matches directory name
- [ ] All workflow files use TitleCase
- [ ] All tool files use TitleCase

#### Check 4: Required Sections

Required sections ensure skills are discoverable and usable. The routing table maps user intents to workflows; examples demonstrate real usage patterns.

- [ ] `## Workflow Routing` section exists (if workflows present)
- [ ] `## Examples` section exists
- [ ] Routing table uses correct format

#### Check 4.5: SkillIntent Completeness

- [ ] `SkillIntent.md` exists at skill root (WARNING if missing — do not fail, but chain to CreateSkillIntent after report)
- [ ] `SkillIntent.md` contains `## Success Criteria` section (FAILURE if file exists but section is absent)
- [ ] `## Success Criteria` contains at least 3 distinct binary-testable criteria (FAILURE if section exists but has fewer than 3 — one vague criterion does not satisfy SC2)

#### Check 5: Workflow References Resolve

Broken references cause runtime failures when users trigger workflows that point to missing files.

For each entry in routing table:
- [ ] Referenced file path exists
- [ ] File path uses correct format: `Workflows/Name.md`

#### Check 6: Directory Structure

The standard directory structure (Tools/, Workflows/) enables consistent organization and automated tooling across all skills.

```
- [ ] Tools/ directory exists
- [ ] Workflows/ directory exists (if workflows referenced)
```

### Step 3: Run Automated Validator

```bash
# Validate specific skill
bun run $PAI_DIR/skills/SkillForge/Tools/ValidateSkill.ts [SkillName]

# Validate all skills
bun run $PAI_DIR/skills/SkillForge/Tools/ValidateSkill.ts --all

# List skills with status
bun run $PAI_DIR/skills/SkillForge/Tools/ValidateSkill.ts --list
```

### Step 4: Generate Report

**All Checks Passed:**

```
VALIDATION REPORT: [SkillName]

Status: PASSED

Checks:
  [x] SKILL.md exists
  [x] Valid frontmatter
  [x] TitleCase naming
  [x] Required sections present
  [x] Workflow references resolve
  [x] Directory structure correct

COMPLETED: [SkillName] validation passed - all checks OK.
```

**Issues Found:**

```
VALIDATION REPORT: [SkillName]

Status: FAILED

Checks:
  [x] SKILL.md exists
  [ ] Valid frontmatter - ISSUE: Missing USE WHEN clause
  [x] TitleCase naming
  [ ] Required sections - ISSUE: Missing Examples section
  [x] Workflow references resolve
  [x] Directory structure correct

Issues (2):
1. Frontmatter description missing "USE WHEN" clause
   Fix: Add "USE WHEN [triggers]" to description field

2. Missing Examples section
   Fix: Add "## Examples" section with 2-3 usage patterns

COMPLETED: [SkillName] validation failed - 2 issues found.
```

## Validation Checklist Reference

Complete checklist from SkillSystem.md:

```
- [ ] Skill directory uses TitleCase
- [ ] YAML `name:` uses TitleCase
- [ ] Single-line `description` with `USE WHEN` clause
- [ ] `## Workflow Routing` section with table format
- [ ] `## Examples` section with 2-3 usage patterns
- [ ] `Tools/` directory exists (even if empty)
- [ ] All workflow files use TitleCase
- [ ] `SkillIntent.md` exists (WARNING if missing)
- [ ] `SkillIntent.md` contains `## Success Criteria` (FAILURE if file present but section absent)
```

## Batch Validation

To validate all skills:

```bash
bun run $PAI_DIR/skills/SkillForge/Tools/ValidateSkill.ts --all
```

## Example Output

```
SUMMARY: Validated CreateSkill skill
ACTIONS:
  - Checked SKILL.md structure
  - Verified frontmatter format
  - Confirmed workflow references
  - Validated TitleCase naming
RESULTS: All 6 checks passed
COMPLETED: CreateSkill is valid and compliant.
```

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| Validation passed but user reported routing issues or requested deeper assurance | StressTest | Announce: "Running stress test for deeper routing assurance..." then execute `Workflows/StressTest.md` |
| Target SkillIntent.md is missing OR exists but lacks `## Success Criteria` | CreateSkillIntent | Announce: "SkillIntent.md incomplete — running CreateSkillIntent to resolve..." then execute `Workflows/CreateSkillIntent.md` |

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Skipped chains MUST be logged — silence on a skipped chain violates SC7.

If no conditions match, skip follow-ups.
