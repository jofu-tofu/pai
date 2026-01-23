---
name: UpdateSkill
description: Modify and maintain existing skills. USE WHEN update skill OR edit skill OR review skill OR improve skill OR add workflow OR remove workflow OR modify skill OR refactor skill OR optimize skill prompts OR skill maintenance OR retrospective OR analyze skill performance.
---

# UpdateSkill

Structured framework for updating, modifying, and maintaining existing skills in the PAI system. Complements CreateSkill (which handles new skill creation) by focusing on modifications to established skills.

## Authoritative Source

**Before modifying ANY skill, READ:** `$PAI_DIR/skills/CORE/SYSTEM/SKILLSYSTEM.md`

This ensures all changes comply with:
- TitleCase naming conventions
- Required SKILL.md structure
- Workflow file conventions

## Voice Notification

**When executing a workflow, do BOTH:**

1. **Send voice notification**:
   ```bash
   curl -s -X POST ${VOICE_SERVER_URL}/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow from the UpdateSkill skill"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow from the **UpdateSkill** skill...
   ```

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **ModifyContent** | "update skill content", "edit skill description" | `Workflows/ModifyContent.md` |
| **ManageWorkflows** | "add workflow", "remove workflow", "rename workflow" | `Workflows/ManageWorkflows.md` |
| **RefactorSkill** | "refactor skill", "restructure skill", "major update" | `Workflows/RefactorSkill.md` |
| **ValidateSkill** | "validate skill", "check skill" | `Workflows/ValidateSkill.md` |
| **Retrospective** | "retrospective on skill", "analyze skill performance", "improve skill from session" | `Workflows/Retrospective.md` |

## Context Files

Reference material extracted from workflows for reuse:

| File | Purpose |
|------|---------|
| `ValidationChecklist.md` | Complete validation checklist for skill compliance |
| `RiskFramework.md` | Change categorization and risk assessment guide |

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
-> Invokes ManageWorkflows workflow
-> Creates Workflows/Cleanup.md
-> Updates SKILL.md routing table
-> Validates references resolve
```

**Example 2: Update skill description**
```
User: "Update the Prompting skill description to include template generation"
-> Invokes ModifyContent workflow
-> Reads current SKILL.md frontmatter
-> Modifies description field
-> Preserves USE WHEN clause structure
```

**Example 3: Validate a skill after changes**
```
User: "Check if the CreateSkill skill is valid"
-> Invokes ValidateSkill workflow
-> Runs full validation suite (see ValidationChecklist.md)
-> Reports: All checks passed
```

**Example 4: Improve skill from session insights**
```
User: "Run a retrospective on the Browser skill"
-> Invokes Retrospective workflow
-> Analyzes session for skill usage patterns
-> Identifies improvement opportunities
-> Presents findings with risk assessment (see RiskFramework.md)
```

## Quick Reference

```
VALIDATION:   bun $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts [SkillName]
BATCH:        bun $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts --all

OPERATIONS:
  Content     -> ModifyContent workflow (frontmatter, description, examples)
  Workflows   -> ManageWorkflows workflow (add, remove, rename)
  Structure   -> RefactorSkill workflow (major restructuring)
  Quality     -> ValidateSkill workflow (compliance checks)
  Improvement -> Retrospective workflow (session-based enhancement)

CONTEXT FILES:
  ValidationChecklist.md  - What to check for compliance
  RiskFramework.md        - How to categorize and assess changes
```
