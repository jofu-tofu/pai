---
name: UpdateSkill
description: Modify and maintain existing skills. USE WHEN update skill, edit skill, add workflow, remove workflow, modify skill, refactor skill, skill maintenance.
---

# UpdateSkill

Structured framework for updating, modifying, and maintaining existing skills in the PAI system. Complements CreateSkill (which handles new skill creation) by focusing on modifications to established skills.

## Authoritative Source

**Before modifying ANY skill, READ:** `$PAI_DIR/skills/CORE/SkillSystem.md`

This ensures all changes comply with:
- TitleCase naming conventions
- Required SKILL.md structure
- Workflow file conventions

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ModifyContent** | "update skill content", "edit skill description" | `Workflows/ModifyContent.md` |
| **ManageWorkflows** | "add workflow", "remove workflow", "rename workflow" | `Workflows/ManageWorkflows.md` |
| **RefactorSkill** | "refactor skill", "restructure skill" | `Workflows/RefactorSkill.md` |
| **ValidateSkill** | "validate skill", "check skill" | `Workflows/ValidateSkill.md` |

## Key Constraints

1. **Never delete without confirmation** - Removing workflows requires explicit user confirmation
2. **Preserve formatting** - Maintain existing indentation and style conventions
3. **Atomic operations** - All multi-step changes should complete fully or roll back
4. **Reference SkillSystem.md** - All validation must check against the authoritative spec
5. **TitleCase enforcement** - Automatically correct casing issues when found

## Examples

**Example 1: Add a workflow to an existing skill**
```
User: "Add a cleanup workflow to the Daemon skill"
-> Creates Workflows/Cleanup.md
-> Updates SKILL.md routing table
-> Validates references resolve
```

**Example 2: Update skill description**
```
User: "Update the Prompting skill description to include template generation"
-> Reads current SKILL.md frontmatter
-> Modifies description field
-> Preserves USE WHEN clause structure
```

**Example 3: Validate a skill after changes**
```
User: "Check if the CreateSkill skill is valid"
-> Runs full validation suite
-> Reports: All checks passed
```
