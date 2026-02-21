---
name: SkillForge
description: Create, modify, and maintain skills. MANDATORY for ALL skill modifications — direct Edit bypasses quality gates, workflow chains, and evaluation rubrics. USE WHEN create skill OR new skill OR update skill OR update the skill OR update the [name] skill OR edit skill OR improve skill OR improve the [name] skill OR change skill OR change the skill OR change the [name] skill OR tweak skill OR adjust skill OR add workflow OR remove workflow OR modify skill OR refactor skill OR canonicalize skill OR fix skill structure OR retrospective OR run retrospective OR run a retrospective on skill OR run a retrospective on the [name] skill OR do a retrospective on skill OR do a retrospective on the [name] skill OR skill retrospective OR analyze skill performance OR analyze skill structure OR skill not triggering OR audit skill OR audit the [name] skill OR comprehensive skill check OR improve skill against criteria OR what's wrong with this skill OR diagnose and fix skill.
---

# SkillForge

Unified skill lifecycle framework: creating, modifying, validating, and canonicalizing skills in the PAI system.

> **For agents modifying ANY skill (including SkillForge itself):** Modify skill triggers, descriptions, and workflow routing through SkillForge workflows (ModifyContent, RefactorSkill) — direct Edit bypasses quality gate chains. Typo or formatting fixes may use direct Edit.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**
After completing a workflow, check its `## Follow-Up` section for chained workflows to run. See `WorkflowChains.md` for the full chain map.

**When executing a workflow, output this notification:**

```
Running the **[WorkflowName]** workflow from the **SkillForge** skill...
```

Quality evaluation is handled by `AgentEvalOrchestrator` (in `Orchestration/AgentEvalOrchestrator.md`), which dispatches parallel agents across 7 evaluation dimensions defined in `Orchestration/Rubrics/`. Author workflows chain to the orchestrator automatically — see `Orchestration/WorkflowChains.md`. `CreateSkillIntent` (in `Workflows/Gates/`) runs when a skill lacks a SkillIntent.

### Author Workflows

For creating, modifying, and restructuring skills.

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateSkill** | "create a new skill", "new skill", "build a skill", "make a skill" | `Workflows/Author/CreateSkill.md` |
| **CanonicalizeSkill** | "canonicalize skill", "fix skill structure", "convert skill format", "skill naming wrong" | `Workflows/Author/CanonicalizeSkill.md` |
| **ModifyContent** | "update skill content", "update the skill", "update the [name] skill", "update skill to", "change the skill", "change the [name] skill", "change skill", "edit skill description", "change skill frontmatter", "tweak skill", "adjust skill" | `Workflows/Author/ModifyContent.md` |
| **RefactorSkill** | "refactor skill", "restructure skill", "reorganize skill", "major skill update", "add workflow", "remove workflow", "rename workflow", "create workflow" | `Workflows/Author/RefactorSkill.md` |

### Quality Workflows

For understanding, improving, auditing, and diagnosing skills.

| Workflow | Trigger | File |
|----------|---------|------|
| **ImproveSkill** | "improve skill", "make skill better", "what's wrong with this skill", "how can we improve this skill", "diagnose and fix skill", "fix what's wrong with skill", "comprehensive skill improvement" | `Workflows/Quality/ImproveSkill.md` |
| **AuditSkill** | "audit skill", "full skill health check", "comprehensive skill check", "run all checks on skill" | `Workflows/Quality/AuditSkill.md` |
| **Retrospective** | "retrospective on skill", "run a retrospective on skill", "run a retrospective on the [name] skill", "run retrospective", "do a retrospective on skill", "do a retrospective on the [name] skill", "skill retrospective", "analyze skill performance", "review skill usage" | `Workflows/Quality/Retrospective.md` |
| **ExplainSkill** | "explain skill", "analyze skill structure", "skill usage analysis", "how does this skill work", "decompose skill" | `Workflows/Quality/ExplainSkill.md` |

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

**Example 3: Improve a skill against its criteria**
```
User: "Improve the Browser skill"
-> Invokes ImproveSkill workflow
-> Evaluates against Success Criteria, produces ranked improvements
```

**Example 4: Run a comprehensive audit**
```
User: "Audit the Research skill"
-> Invokes AuditSkill workflow
-> Dispatches 7 evaluation agents across quality dimensions, produces composite PASS/WARN/FAIL report
```

**Example 5: Diagnose why a skill isn't triggering**
```
User: "The Research skill isn't triggering"
-> Invokes AuditSkill workflow
-> Dispatches 7 evaluation agents (routing health, prompt quality, etc.)
-> Composite report identifies routing issues
```
