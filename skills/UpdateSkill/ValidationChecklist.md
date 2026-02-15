# Validation Checklist

Complete validation reference for skill compliance with SkillSystem.md.

**Authoritative Source:** `$PAI_DIR/skills/PAI/SYSTEM/SKILLSYSTEM.md`

---

## Quick Validation

```bash
# Validate specific skill
bun $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts [SkillName]

# Validate all skills
bun $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts --all

# List skills with status
bun $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts --list
```

---

## Complete Checklist

### 1. File Existence

| Check | Requirement |
|-------|-------------|
| SKILL.md | Must exist at `$PAI_DIR/skills/[SkillName]/SKILL.md` |
| Tools/ | Directory must exist (even if empty) |
| Workflows/ | Directory must exist if workflows are referenced |

### 2. YAML Frontmatter

```yaml
---
name: SkillName        # Must be TitleCase
description: [text]    # Must be single line, must contain USE WHEN
---
```

| Check | Requirement |
|-------|-------------|
| Delimiters | Opening and closing `---` present |
| `name` field | Exists and uses TitleCase |
| `description` field | Exists as single line (no `\|` multiline) |
| `USE WHEN` clause | Present in description |
| Length | Description under 1024 characters |

### 3. TitleCase Naming

| Component | Wrong | Correct |
|-----------|-------|---------|
| Skill directory | `createskill`, `create-skill` | `CreateSkill` |
| YAML `name:` | `create-skill` | `CreateSkill` |
| Workflow files | `create.md`, `update-info.md` | `Create.md`, `UpdateInfo.md` |
| Tool files | `manage-server.ts` | `ManageServer.ts` |
| Context files | `api-reference.md` | `ApiReference.md` |

**Rules:**
- First letter of each word capitalized
- No hyphens, underscores, or spaces
- No ALL_CAPS or all_lowercase
- Exception: `SKILL.md` is always uppercase

### 4. Required Sections

| Section | Required When |
|---------|---------------|
| `## Workflow Routing` | Workflows exist |
| `## Examples` | Always (2-3 patterns) |

**Routing Table Format:**
```markdown
| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowName** | "trigger phrase" | `Workflows/WorkflowName.md` |
```

### 5. Workflow References

For each entry in the routing table:
- [ ] Referenced file path exists
- [ ] File path format: `Workflows/Name.md`
- [ ] Workflow name in table matches filename exactly

### 6. Directory Structure

```
SkillName/                    # TitleCase
├── SKILL.md                  # Always uppercase
├── ContextFile.md            # Context files in root (TitleCase)
├── Tools/                    # CLI tools
│   └── ToolName.ts           # TitleCase
└── Workflows/                # Execution procedures
    └── WorkflowName.md       # TitleCase
```

**Forbidden:**
- `Context/` or `Docs/` subdirectories (context files go in root)
- More than 2 levels deep
- `backups/` directory inside skill

---

## Validation Report Templates

### All Checks Passed

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

### Issues Found

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

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Missing USE WHEN | Add `USE WHEN [intent triggers]` to description |
| Non-TitleCase name | Rename directory and update YAML `name:` |
| Missing Examples | Add `## Examples` with 2-3 usage patterns |
| Broken workflow reference | Check file exists, verify path spelling |
| Missing Tools/ directory | Create empty `Tools/` directory |
| Context files in subdirectory | Move to skill root directory |

---

## Why Each Check Matters

| Check | Impact If Missing |
|-------|-------------------|
| SKILL.md | PAI cannot discover or invoke skill |
| USE WHEN | Skill won't activate on user intent |
| TitleCase | Inconsistent naming breaks automation |
| Examples | Claude may misunderstand how skill works |
| Workflow references | Runtime failures when workflows don't exist |
| Directory structure | Tools and automation may fail |
