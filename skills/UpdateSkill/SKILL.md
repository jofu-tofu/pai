---
name: UpdateSkill
description: Modify and maintain existing skills. USE WHEN update skill OR edit skill OR review skill OR improve skill OR add workflow OR remove workflow OR modify skill OR refactor skill OR optimize skill prompts OR skill maintenance OR retrospective OR analyze skill performance OR analyze skill structure OR skill not triggering.
---

# UpdateSkill

Structured framework for updating, modifying, and maintaining existing skills in the PAI system. Complements CreateSkill (which handles new skill creation) by focusing on modifications to established skills.

## Modifying This Skill

Before making any changes to UpdateSkill itself, read `SkillIntent.md` in this skill's root directory. It captures the original design decisions, explicit out-of-scope boundaries, and constraints that all updates must respect.

## Authoritative Source

**Skill structure spec lives here:** `SkillSystem.md` (in this skill's root directory)
Defines TitleCase naming, required SKILL.md structure, workflow file conventions, and validation checklist. All workflows reference this local copy — no external dependencies.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**
After completing a workflow, check its `## Follow-Up` section for chained workflows to run. See `WorkflowChains.md` for the full chain map.

| Workflow | Trigger | File |
|----------|---------|------|
| **ModifyContent** | "update skill content", "edit skill description", "change skill frontmatter" | `Workflows/ModifyContent.md` |
| **ManageWorkflows** | "add workflow to skill", "add workflow", "remove workflow", "rename workflow", "create workflow" | `Workflows/ManageWorkflows.md` |
| **RefactorSkill** | "refactor skill", "restructure skill", "reorganize skill", "major skill update" | `Workflows/RefactorSkill.md` |
| **ValidateSkill** | "validate skill", "check skill", "verify skill", "is skill valid" | `Workflows/ValidateSkill.md` |
| **Retrospective** | "retrospective on skill", "analyze skill performance", "improve skill based on session", "review skill usage" | `Workflows/Retrospective.md` |
| **WorkflowDecompose** | "decompose skill", "usage analysis", "analyze skill structure", "how is this skill structured", "audit skill structure" | `Workflows/WorkflowDecompose.md` |

### Quality Assurance Workflows

These workflows run as follow-ups from primary workflows (see `WorkflowChains.md`) but can also be invoked directly.

| Workflow | Trigger | File |
|----------|---------|------|
| **StressTest** | "stress test skill", "health check skill", "verify skill health", "test skill integrity", "run skill diagnostics", "skill not triggering" | `Workflows/StressTest.md` |
| **InvocationSim** | "invocation sim", "simulate invocations", "test routing", "routing audit", "usage simulation", "trigger coverage", "coverage test", "what invocations work", "does this skill route correctly" | `Workflows/InvocationSim.md` |
| **PromptQualityAudit** | "prompt quality audit", "audit skill wording", "check skill trigger phrases", "review skill prompts", "wording audit", "audit prompts" | `Workflows/PromptQualityAudit.md` |
| **CreateSkillIntent** | "create skill intent", "add skill intent", "document skill purpose", "write skill intent", "generate skill intent" | `Workflows/CreateSkillIntent.md` |
## Context Files

Reference material extracted from workflows for reuse:

| File | Purpose |
|------|---------|
| `SkillSystem.md` | Authoritative skill structure spec — TitleCase naming, required SKILL.md structure, directory layout, validation checklist. All workflows reference this instead of any external spec. |
| `ValidationChecklist.md` | Complete validation checklist for skill compliance |
| `RiskFramework.md` | Change categorization and risk assessment guide |
| `PromptingStandards.md` | Wording and trigger phrase quality rules — used by ModifyContent, ManageWorkflows, and PromptQualityAudit |
| `SkillIntent.md` | **Per-skill design intent document.** Lives in each skill's own root dir, not here. Read by ModifyContent, RefactorSkill, and Retrospective when operating on a target skill. Captures the why behind design decisions and must not be contradicted by updates. |
| `WorkflowChains.md` | **Authoritative chain map.** Defines which workflows chain to which, under what conditions, and at what tier (Always/Conditional). Follow-Up sections in workflow files are derived from this file. Update this first when chains change. |

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

**Example 5: Diagnose why a skill isn't triggering**
```
User: "The Research skill isn't triggering"
-> Invokes StressTest workflow
-> Checks file structure, routing table integrity, trigger consistency
-> If StressTest passes but routing still feels wrong:
   -> Invokes PromptQualityAudit workflow
   -> Audits trigger phrase wording against PromptingStandards.md
   -> Reports specific phrases that are too vague, too long, or semantically overlapping
```

**Example 6: Verify a skill's routing coverage**
```
User: "Does the Council skill route correctly?"
-> Invokes InvocationSim workflow
-> Generates 20+ realistic user invocations across all categories
-> Judges each for correct routing, wrong route, or unrouted
-> Reports dead routes, ambiguous zones, and coverage gaps
```

**Disambiguation: "improve" vs "refactor" vs "trigger phrases"**
```
"improve" → Retrospective (session-based: what did we learn this session?)
"refactor" → RefactorSkill (structural: reorganize files, merge workflows, rename)
"fix the skill" → ValidateSkill or StressTest (diagnostic: what's actually wrong?)
"skill not triggering" → StressTest first; if structure is clean → PromptQualityAudit
"trigger phrases feel wrong" → PromptQualityAudit (wording audit against standards)
"too big / bloated" → WorkflowDecompose (analyze first), then RefactorSkill (act)
```

## Quick Reference

```
VALIDATION:   bun $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts [SkillName]
BATCH:        bun $PAI_DIR/skills/UpdateSkill/Tools/ValidateSkill.ts --all

OPERATIONS:
  Content        -> ModifyContent     (frontmatter, description, examples)
  Workflows      -> ManageWorkflows   (add, remove, rename)
  Structure      -> RefactorSkill     (major restructuring)
  Quality        -> ValidateSkill     (compliance checks)
  Improvement    -> Retrospective     (session-based enhancement)
  Structure      -> WorkflowDecompose (file map, orphan detection, coverage gaps)
  Health Check   -> StressTest        (file structure, routing, canary)
  Routing Test   -> InvocationSim     (simulate invocations, find dead routes)
  Trigger Words  -> PromptQualityAudit (wording audit, phrase quality)

CONTEXT FILES:
  ValidationChecklist.md  - What to check for compliance
  RiskFramework.md        - How to categorize and assess changes
  PromptingStandards.md   - Trigger phrase and description wording rules
```
