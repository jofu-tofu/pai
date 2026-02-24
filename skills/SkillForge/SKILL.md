---
name: SkillForge
description: Create, modify, and maintain skills. MANDATORY for ALL skill modifications — direct Edit bypasses quality gates and validation. USE WHEN create skill OR new skill OR update skill OR update the skill OR update the [name] skill OR edit skill OR improve skill OR improve the [name] skill OR change skill OR change the skill OR change the [name] skill OR tweak skill OR adjust skill OR add workflow OR remove workflow OR modify skill OR refactor skill OR fix skill structure OR retrospective OR run retrospective OR run a retrospective on skill OR run a retrospective on the [name] skill OR do a retrospective on skill OR do a retrospective on the [name] skill OR skill retrospective OR analyze skill performance OR analyze skill structure OR skill not triggering OR audit skill OR audit the [name] skill OR comprehensive skill check OR improve skill against criteria OR what's wrong with this skill OR diagnose and fix skill OR review skill.
---

# SkillForge

Unified skill lifecycle framework: creating, modifying, validating, and reviewing skills in the PAI system.

> **For agents modifying ANY skill (including SkillForge itself):** Modify skill triggers, descriptions, and workflow routing through SkillForge workflows — direct Edit bypasses quality gates. Typo or formatting fixes may use direct Edit.

**Before executing any workflow below, first read `Standards/PromptingStandards.md`.**

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

**When executing a workflow, output this notification:**

```
Running the **[WorkflowName]** workflow from the **SkillForge** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateSkill** | "create a new skill", "new skill", "build a skill", "make a skill" | `Workflows/CreateSkill.md` |
| **ModifyContent** | "update skill content", "update the skill", "update the [name] skill", "change the skill", "change skill", "edit skill description", "tweak skill", "adjust skill" | `Workflows/ModifyContent.md` |
| **RefactorSkill** | "refactor skill", "restructure skill", "reorganize skill", "major skill update", "add workflow", "remove workflow", "rename workflow", "create workflow", "canonicalize skill", "fix skill structure" | `Workflows/RefactorSkill.md` |
| **CreateSkillIntent** | "create skill intent", "add skill intent", "document skill purpose", "write skill intent" | `Workflows/CreateSkillIntent.md` |
| **ReviewSkill** | "review skill", "audit skill", "improve skill", "retrospective on skill", "what's wrong with this skill", "skill health check", "diagnose and fix skill" | `Workflows/ReviewSkill.md` |

**After completing any author workflow (CreateSkill, ModifyContent, RefactorSkill), run `ValidateSkill.ts` on the target skill.**

## Examples

**Example 1: Create a new skill**
```
User: "Create a skill for managing recipes"
-> Invokes CreateSkill workflow
-> Creates skill directory with TitleCase naming, SKILL.md, Workflows/, Tools/
```

**Example 2: Modify skill content**
```
User: "Update the Prompting skill description to include template generation"
-> Invokes ModifyContent workflow
-> Modifies description field, preserves USE WHEN structure
```

**Example 3: Review a skill**
```
User: "Audit the Research skill"
-> Invokes ReviewSkill workflow
-> Runs structural validation + quality review, produces PASS/WARN/FAIL report
```
