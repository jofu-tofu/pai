# Workflow Chains — SkillForge

> **For agents modifying this skill:** Consult this file before and after changes.
> After completing any workflow, check the Chain Table below for follow-up workflows to run.
> **This file is the authoritative source for all chain definitions.** Follow-Up sections in individual workflow files are execution copies derived from this file. When chains change, update this file FIRST, then sync affected Follow-Up sections. This file wins any conflict.

## Architecture

All quality evaluation routes through `AgentEvalOrchestrator` (in `Orchestration/AgentEvalOrchestrator.md`). There is no pipeline between individual evaluation dimensions — the orchestrator handles fan-out to parallel agents and aggregation.

- **Full mode:** Used by AuditSkill and ImproveSkill. Evaluates all 7 dimensions.
- **Scoped mode:** Used by author workflows after mutations. Orchestrator selects relevant dimensions based on change context.

Evaluation rubrics live in `Orchestration/Rubrics/` — one file per dimension.

## Chain Table

| Source Workflow | Chains To | Condition | Tier |
|---|---|---|---|
| CreateSkill | AgentEvalOrchestrator(scoped) | ALWAYS after creation — changes: "new skill created, all files new" | Always |
| CreateSkill | CreateSkillIntent | ALWAYS after creation | Always |
| CanonicalizeSkill | AgentEvalOrchestrator(scoped) | ALWAYS — changes: "file structure reorganized" | Always |
| ModifyContent | AgentEvalOrchestrator(scoped) | ALWAYS — changes: passed from ModifyContent (what was edited) | Always |
| ManageWorkflows | AgentEvalOrchestrator(scoped) | ALWAYS — changes: "workflow added/removed/renamed" | Always |
| RefactorSkill | AgentEvalOrchestrator(scoped) | ALWAYS — changes: "major restructure" | Always |
| AuditSkill | AgentEvalOrchestrator(full) | ALWAYS (Step 2) | Always |
| ImproveSkill | AgentEvalOrchestrator(full) | ALWAYS after SC evaluation | Always |
| Retrospective | ModifyContent | IF improvement recommendations require content changes | Conditional |
| Retrospective | ManageWorkflows | IF session reveals a missing workflow | Conditional |
| WorkflowDecompose | RefactorSkill | IF analysis reveals structural issues | Conditional |
| AuditSkill | ImproveSkill | IF audit found WARN or FAIL results and user wants to act | Conditional |
| ImproveSkill | ModifyContent | IF user selected content improvements | Conditional |
| ImproveSkill | ManageWorkflows | IF user selected workflow additions/removals | Conditional |
| ImproveSkill | RefactorSkill | IF user selected structural changes | Conditional |

## Chaining Rules

- **Full cascade:** Chained workflows execute their own Follow-Up sections. Depth is naturally limited by terminal nodes.
- **Tier inheritance:** Once a workflow runs (for any reason), its Follow-Up tiers apply as written. "Always" means always.
- **Two tiers only:** Always (auto-run after primary completes) and Conditional (evaluate IF condition, run if true).
- **Condition context:** Conditions evaluate against what THIS workflow just did during its execution, not the upstream trigger context.
- **Agent behavior:** For every chain evaluated, log one line in this format BEFORE announcing execution:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
  Where `[WorkflowName]` is the target workflow name. Log ALL evaluated chains — including ones that did NOT fire. Then for fired chains, announce: "Following up with [WorkflowName] because [condition]..." and execute. Silence on a skipped chain violates SC7.

## Chain Graph (DAG)

```
CreateSkill ──┬──→ AgentEvalOrchestrator(scoped: "new skill")
              └──→ CreateSkillIntent

CanonicalizeSkill ──→ AgentEvalOrchestrator(scoped: "file structure reorganized")

ModifyContent ──→ AgentEvalOrchestrator(scoped: change details)

ManageWorkflows ──→ AgentEvalOrchestrator(scoped: "workflow added/removed/renamed")

RefactorSkill ──→ AgentEvalOrchestrator(scoped: "major restructure")

Retrospective ──┬──→ ModifyContent (conditional) ──→ AgentEvalOrchestrator(scoped)
                └──→ ManageWorkflows (conditional) ──→ AgentEvalOrchestrator(scoped)

WorkflowDecompose ──→ RefactorSkill (conditional) ──→ AgentEvalOrchestrator(scoped)

AuditSkill ──┬──→ AgentEvalOrchestrator(full) [Step 2]
             └──→ ImproveSkill (conditional) ──→ AgentEvalOrchestrator(full)

ImproveSkill ──┬──→ AgentEvalOrchestrator(full) [Step 3.5]
               ├──→ ModifyContent (conditional) ──→ AgentEvalOrchestrator(scoped)
               ├──→ ManageWorkflows (conditional) ──→ AgentEvalOrchestrator(scoped)
               └──→ RefactorSkill (conditional) ──→ AgentEvalOrchestrator(scoped)

Terminal nodes (no outgoing chains): AgentEvalOrchestrator, CreateSkillIntent
No cycles — all paths terminate at AgentEvalOrchestrator or CreateSkillIntent.
```

## Impact Map

When modifying a workflow, these downstream workflows may be affected:

| If You Modify... | Check These Downstream Workflows |
|---|---|
| CreateSkill | AgentEvalOrchestrator(scoped), CreateSkillIntent |
| CanonicalizeSkill | AgentEvalOrchestrator(scoped) |
| ModifyContent | AgentEvalOrchestrator(scoped) |
| ManageWorkflows | AgentEvalOrchestrator(scoped) |
| RefactorSkill | AgentEvalOrchestrator(scoped) |
| Retrospective | ModifyContent (and its chains), ManageWorkflows (and its chains) |
| WorkflowDecompose | RefactorSkill (and its chains) |
| AuditSkill | AgentEvalOrchestrator(full), ImproveSkill (and its chains) |
| ImproveSkill | AgentEvalOrchestrator(full), ModifyContent (and its chains), ManageWorkflows (and its chains), RefactorSkill (and its chains) |
| AgentEvalOrchestrator | (terminal — no downstream) |
| CreateSkillIntent | (terminal — no downstream) |
