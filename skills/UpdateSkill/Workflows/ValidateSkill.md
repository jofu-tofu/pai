# ValidateSkill Workflow

> **Trigger:** "validate skill", "check skill", "verify skill", "is skill valid"

## Reference Material

- **Full Checklist:** `../ValidationChecklist.md`
- **Authoritative Spec:** `$PAI_DIR/skills/PAI/SYSTEM/SKILLSYSTEM.md`

## Purpose

Run comprehensive validation checks on a skill to ensure it complies with the SkillSystem.md specification. Reports all issues found with specific remediation guidance.

## Context & Motivation

Skills must follow SkillSystem.md conventions for the PAI system to route commands correctly, display accurate descriptions, and maintain consistent behavior. Validation catches structural issues (missing sections, broken references), naming violations (TitleCase requirements), and compliance gaps (missing USE WHEN clauses) before they cause runtime problems or user confusion.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- Reference: `$PAI_DIR/skills/PAI/SYSTEM/SKILLSYSTEM.md`

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
bun run $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts [SkillName]

# Validate all skills
bun run $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts --all

# List skills with status
bun run $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts --list
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
```

## Batch Validation

To validate all skills:

```bash
bun run $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts --all
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
