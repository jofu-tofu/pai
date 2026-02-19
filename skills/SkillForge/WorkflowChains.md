# Workflow Chains — SkillForge

> **For agents modifying this skill:** Consult this file before and after changes.
> After completing any workflow, check the Chain Table below for follow-up workflows to run.
> **This file is the authoritative source for all chain definitions.** Follow-Up sections in individual workflow files are execution copies derived from this file. When chains change, update this file FIRST, then sync affected Follow-Up sections. This file wins any conflict.

## Chain Table

| Source Workflow | Chains To | Condition | Tier |
|---|---|---|---|
| CreateSkill | ValidateSkill | ALWAYS after new skill creation | Always |
| CreateSkill | CreateSkillIntent | ALWAYS after new skill creation | Always |
| CanonicalizeSkill | ValidateSkill | ALWAYS after canonicalization completes | Always |
| ModifyContent | PromptQualityAudit | ALWAYS after ModifyContent completes (completion gate may satisfy this inline) | Always |
| ModifyContent | StressTest | IF structural changes made (not just description edits) | Conditional |
| ModifyContent | StressTest | IF the Context Files table was modified (detect new orphans) | Conditional |
| ManageWorkflows | StressTest | IF a workflow was added or removed | Conditional |
| ManageWorkflows | PromptQualityAudit | ALWAYS after add, rename, or remove operations (completion gate may satisfy this inline) | Always |
| RefactorSkill | ValidateSkill | ALWAYS after restructuring | Always |
| RefactorSkill | StressTest | ALWAYS after restructuring | Always |
| StressTest | InvocationSim | IF structural checks pass but routing issues reported | Conditional |
| StressTest | PromptQualityAudit | IF trigger consistency check found mismatches | Conditional |
| InvocationSim | PromptQualityAudit | IF dead routes or ambiguous scenarios found | Conditional |
| Retrospective | ModifyContent | IF improvement recommendations require content changes | Conditional |
| Retrospective | ManageWorkflows | IF session reveals a missing workflow that should be added | Conditional |
| WorkflowDecompose | RefactorSkill | IF analysis reveals structural issues needing action | Conditional |
| ValidateSkill | StressTest | IF validation passed but user reported routing issues or requested deeper assurance | Conditional |
| ValidateSkill | CreateSkillIntent | IF target SkillIntent.md is missing OR exists but lacks `## Success Criteria` | Conditional |
| ImproveSkill | ModifyContent | IF user selected content improvements | Conditional |
| ImproveSkill | ManageWorkflows | IF user selected workflow additions/removals | Conditional |
| ImproveSkill | RefactorSkill | IF user selected structural changes | Conditional |
| AuditSkill | ImproveSkill | IF audit found WARN or FAIL results and user wants to act | Conditional |
| ContentAudit | ModifyContent | IF content gaps or contradictions found needing targeted fixes | Conditional |
| ContentAudit | ImproveSkill | IF findings suggest broader improvement beyond content edits | Conditional |

## Orphan Detection Note

SC4 ("WorkflowChains.md has entry for every workflow file present") checks in ONE direction: workflow file exists → entry in chains.md. The **reverse direction** (entry in chains.md → workflow file exists) is also important and checked by ValidateSkill. Both directions must pass for the dependency graph to be considered clean.

## Chaining Rules

- **Full cascade:** Chained workflows execute their own Follow-Up sections. Depth is naturally limited by terminal nodes.
- **Tier inheritance:** Once a workflow runs (for any reason), its Follow-Up tiers apply as written. "Always" means always.
- **Two tiers only:** Always (auto-run after primary completes) and Conditional (evaluate IF condition, run if true).
- **Max practical depth:** 3-4 levels (e.g., WorkflowDecompose → RefactorSkill → ValidateSkill → StressTest).
- **Condition context:** Conditions evaluate against what THIS workflow just did during its execution, not the upstream trigger context.
- **Agent behavior:** For every chain evaluated, log one line in this format BEFORE announcing execution:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
  Where `[WorkflowName]` is the target workflow name. Log ALL evaluated chains — including ones that did NOT fire. Then for fired chains, announce: "Following up with [WorkflowName] because [condition]..." and execute. Silence on a skipped chain violates SC7.

## Chain Graph (DAG)

```
CreateSkill ──┬──→ ValidateSkill ──→ StressTest (conditional)
              └──→ CreateSkillIntent

CanonicalizeSkill ──→ ValidateSkill ──→ StressTest (conditional)

Retrospective ──┬──→ ModifyContent ──┬──→ PromptQualityAudit
               │                    └──→ StressTest ──┬──→ InvocationSim ──→ PromptQualityAudit
               │                                      └──→ PromptQualityAudit
               └──→ ManageWorkflows ──┬──→ StressTest
                                      └──→ PromptQualityAudit
WorkflowDecompose ──→ RefactorSkill ──┬──→ ValidateSkill ──→ StressTest
                                      └──→ StressTest

ImproveSkill ──┬──→ ModifyContent ──┬──→ PromptQualityAudit
               │                   └──→ StressTest
               ├──→ ManageWorkflows ──┬──→ StressTest
               │                      └──→ PromptQualityAudit
               └──→ RefactorSkill ──┬──→ ValidateSkill
                                    └──→ StressTest

AuditSkill ──→ ImproveSkill (conditional, see above)

ContentAudit ──┬──→ ModifyContent (conditional)
               └──→ ImproveSkill (conditional)

Note: CreateSkillIntent is no longer a conditional follow-up chain from modification workflows.
It now runs inline at Step 2.5 (blocking gate) when required sections are missing.

Terminal nodes (no outgoing chains): PromptQualityAudit, InvocationSim, CreateSkillIntent
No cycles — all paths terminate at PromptQualityAudit, InvocationSim, or CreateSkillIntent.
```

## Impact Map

When modifying a workflow, these downstream workflows may be affected:

| If You Modify... | Check These Downstream Workflows |
|---|---|
| CreateSkill | ValidateSkill, CreateSkillIntent |
| CanonicalizeSkill | ValidateSkill (and its chains) |
| ModifyContent | PromptQualityAudit, StressTest |
| ManageWorkflows | StressTest, PromptQualityAudit |
| RefactorSkill | ValidateSkill, StressTest |
| StressTest | InvocationSim, PromptQualityAudit |
| InvocationSim | PromptQualityAudit |
| Retrospective | ModifyContent (and its chains), ManageWorkflows (if new workflow added) |
| WorkflowDecompose | RefactorSkill (and its chains) |
| ValidateSkill | StressTest, CreateSkillIntent (if SkillIntent missing or incomplete) |
| ImproveSkill | ModifyContent (and its chains), ManageWorkflows (and its chains), RefactorSkill (and its chains) |
| AuditSkill | ImproveSkill (and its chains) |
| ContentAudit | ModifyContent (and its chains), ImproveSkill (and its chains) |
| PromptQualityAudit | (terminal — no downstream) |
| CreateSkillIntent | (terminal — no downstream) |
