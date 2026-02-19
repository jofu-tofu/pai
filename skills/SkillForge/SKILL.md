---
name: SkillForge
description: Create, modify, and maintain skills. USE WHEN create skill OR new skill OR update skill OR edit skill OR review skill OR improve skill OR add workflow OR remove workflow OR modify skill OR refactor skill OR canonicalize skill OR fix skill structure OR optimize skill prompts OR skill maintenance OR retrospective OR analyze skill performance OR analyze skill structure OR skill not triggering OR audit skill OR content audit skill OR comprehensive skill check OR improve skill against criteria OR what's wrong with this skill.
---

# SkillForge

Unified skill lifecycle framework: creating, modifying, validating, and canonicalizing skills in the PAI system.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**
After completing a workflow, check its `## Follow-Up` section for chained workflows to run. See `WorkflowChains.md` for the full chain map.

**When executing a workflow, output this notification:**

```
Running the **[WorkflowName]** workflow from the **SkillForge** skill...
```

Internal gates (ValidateSkill, StressTest, InvocationSim, CreateSkillIntent) run automatically via workflow chains — see `WorkflowChains.md`. They can be invoked directly but are primarily quality gates.

### Author Workflows

For creating, modifying, and restructuring skills.

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateSkill** | "create a new skill", "new skill", "build a skill", "make a skill" | `Workflows/CreateSkill.md` |
| **CanonicalizeSkill** | "canonicalize skill", "fix skill structure", "convert skill format", "skill naming wrong" | `Workflows/CanonicalizeSkill.md` |
| **ModifyContent** | "update skill content", "edit skill description", "change skill frontmatter" | `Workflows/ModifyContent.md` |
| **ManageWorkflows** | "add workflow to skill", "add workflow", "remove workflow", "rename workflow", "create workflow" | `Workflows/ManageWorkflows.md` |
| **RefactorSkill** | "refactor skill", "restructure skill", "reorganize skill", "major skill update" | `Workflows/RefactorSkill.md` |

### Quality Workflows

For understanding, improving, auditing, and diagnosing skills.

| Workflow | Trigger | File |
|----------|---------|------|
| **ImproveSkill** | "improve skill", "make skill better", "what's wrong with this skill", "how can we improve this skill" | `Workflows/ImproveSkill.md` |
| **AuditSkill** | "audit skill", "full skill health check", "comprehensive skill check", "run all checks on skill" | `Workflows/AuditSkill.md` |
| **Retrospective** | "retrospective on skill", "analyze skill performance", "review skill usage" | `Workflows/Retrospective.md` |
| **WorkflowDecompose** | "decompose skill", "skill usage analysis", "analyze skill structure" | `Workflows/WorkflowDecompose.md` |
| **ContentAudit** | "content audit skill", "check skill content quality", "audit skill content" | `Workflows/ContentAudit.md` |
| **PromptQualityAudit** | "prompt quality audit", "audit skill wording", "check skill trigger phrases" | `Workflows/PromptQualityAudit.md` |

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
-> Runs all 6 audit phases, produces composite PASS/WARN/FAIL report
```

**Example 5: Diagnose why a skill isn't triggering**
```
User: "The Research skill isn't triggering"
-> Invokes StressTest workflow (auto-chains to PromptQualityAudit if structure is clean)
```
