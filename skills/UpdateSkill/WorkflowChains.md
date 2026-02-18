# Workflow Chains — UpdateSkill

> **For agents modifying this skill:** Consult this file before and after changes.
> After completing any workflow, check the Chain Table below for follow-up workflows to run.
> **This file is the authoritative source for all chain definitions.** Follow-Up sections in individual workflow files are execution copies derived from this file. When chains change, update this file FIRST, then sync affected Follow-Up sections. This file wins any conflict.

## Chain Table

| Source Workflow | Chains To | Condition | Tier |
|---|---|---|---|
| ModifyContent | PromptQualityAudit | IF trigger phrases or USE WHEN clause were modified | Always |
| ModifyContent | StressTest | IF structural changes made (not just description edits) | Conditional |
| ManageWorkflows | StressTest | IF a workflow was added or removed | Always |
| ManageWorkflows | PromptQualityAudit | IF a new workflow was added (audit its trigger phrases) | Always |
| RefactorSkill | ValidateSkill | ALWAYS after restructuring | Always |
| RefactorSkill | StressTest | ALWAYS after restructuring | Always |
| StressTest | InvocationSim | IF structural checks pass but routing issues reported | Conditional |
| StressTest | PromptQualityAudit | IF trigger consistency check found mismatches | Conditional |
| InvocationSim | PromptQualityAudit | IF dead routes or ambiguous scenarios found | Conditional |
| Retrospective | ModifyContent | IF improvement recommendations require content changes | Conditional |
| WorkflowDecompose | RefactorSkill | IF analysis reveals structural issues needing action | Conditional |
| ValidateSkill | StressTest | IF validation passed but user reported routing issues or requested deeper assurance | Conditional |

## Chaining Rules

- **Full cascade:** Chained workflows execute their own Follow-Up sections. Depth is naturally limited by terminal nodes.
- **Tier inheritance:** Once a workflow runs (for any reason), its Follow-Up tiers apply as written. "Always" means always.
- **Two tiers only:** Always (auto-run after primary completes) and Conditional (evaluate IF condition, run if true).
- **Max practical depth:** 3-4 levels (e.g., WorkflowDecompose → RefactorSkill → ValidateSkill → StressTest).
- **Condition context:** Conditions evaluate against what THIS workflow just did during its execution, not the upstream trigger context.
- **Agent behavior:** Announce each chained workflow before executing: "Following up with [WorkflowName] because [condition]..."

## Chain Graph (DAG)

```
Retrospective ──→ ModifyContent ──┬──→ PromptQualityAudit
                                  └──→ StressTest ──┬──→ InvocationSim ──→ PromptQualityAudit
                                                    └──→ PromptQualityAudit
WorkflowDecompose ──→ RefactorSkill ──┬──→ ValidateSkill ──→ StressTest
                                      └──→ StressTest

ManageWorkflows ──┬──→ StressTest
                  └──→ PromptQualityAudit

Terminal nodes (no outgoing chains): PromptQualityAudit, InvocationSim, CreateSkillIntent
No cycles — all paths terminate at PromptQualityAudit or InvocationSim.
```

## Impact Map

When modifying a workflow, these downstream workflows may be affected:

| If You Modify... | Check These Downstream Workflows |
|---|---|
| ModifyContent | PromptQualityAudit, StressTest |
| ManageWorkflows | StressTest, PromptQualityAudit |
| RefactorSkill | ValidateSkill, StressTest |
| StressTest | InvocationSim, PromptQualityAudit |
| InvocationSim | PromptQualityAudit |
| Retrospective | ModifyContent (and its chains) |
| WorkflowDecompose | RefactorSkill (and its chains) |
| ValidateSkill | StressTest |
| PromptQualityAudit | (terminal — no downstream) |
| CreateSkillIntent | (terminal — no downstream) |
