# AuditSkill — SkillForge Workflow

> **Trigger:** "audit skill", "full skill health check", "comprehensive skill check", "run all checks on skill"

> **Purpose:** Single-entry-point comprehensive audit that dispatches parallel evaluation agents across 7 quality dimensions and produces a composite report.

## Reference Material

- `../../Standards/SkillSystem.md` — Canonical structure spec and validation checklist
- `../../Standards/RiskFramework.md` — Risk classification for audit findings
- `../../SkillIntent.md` — SkillForge's own design philosophy
- `../../Orchestration/AgentEvalOrchestrator.md` — The evaluation dispatch engine
- `../../Orchestration/Rubrics/` — The 7 evaluation dimension rubrics

---

## When to Use

- "Audit this skill"
- "Full health check on the X skill"
- "Is this skill production-ready?"
- "Comprehensive skill check"
- "Run all checks on this skill"

**Not this workflow if:** User wants a specific dimension only (use the relevant rubric's criteria manually), or wants improvement recommendations (→ ImproveSkill, which runs AuditSkill as a prerequisite).

---

## Steps

### Step 1 — Read SkillIntent

Read the target skill's `SkillIntent.md`. If missing, note as a **CRITICAL** finding and chain to `CreateSkillIntent` before continuing.

Extract:
- `## Success Criteria` — for use in Step 3
- `## First Principles` — included in skill context for agent evaluation
- `## Constraints` — included in skill context for agent evaluation

### Step 2 — Run Agent Evaluation

Invoke `AgentEvalOrchestrator` with:
- **Target skill path:** the skill directory being audited
- **Mode:** `full` (all 7 dimensions — no exceptions for comprehensive audit)

Read and follow `../../Orchestration/AgentEvalOrchestrator.md`. The orchestrator will:
1. Load all target skill files
2. Load all 7 rubrics from `Orchestration/Rubrics/`
3. Dispatch 7 parallel agents (one per dimension)
4. Collect and aggregate results
5. Perform cross-dimension synthesis
6. Return a composite report

Receive the composite report for use in Steps 3-4.

### Step 3 — Success Criteria Evaluation

Using the Success Criteria extracted in Step 1, evaluate each criterion against the composite agent findings from Step 2:

For each Success Criterion:
- **PASS** — criterion clearly satisfied by evidence from agent evaluation dimensions
- **WARN** — criterion partially satisfied or evidence is ambiguous
- **FAIL** — criterion not satisfied; cite which dimension(s) surfaced the issue

```
SC{N}: "{criterion text}"
Status: PASS | WARN | FAIL
Evidence: {dimension(s) and specific finding(s) that inform this judgment}
```

### Step 4 — Report and Recommend

Present the composite report to the user:

```
## Audit Report: {Skill Name}
Date: {YYYY-MM-DD}

### Summary
Overall: PASS | WARN | FAIL
Dimensions evaluated: 7/7

### Dimension Results
| Dimension | Result | Top Finding |
|---|---|---|
| First Principles | PASS/WARN/FAIL | {1-line} |
| Structural Integrity | PASS/WARN/FAIL | {1-line} |
| Routing Health | PASS/WARN/FAIL | {1-line} |
| Behavioral Resilience | PASS/WARN/FAIL | {1-line} |
| Content Coherence | PASS/WARN/FAIL | {1-line} |
| Invocation Coverage | PASS/WARN/FAIL | {1-line} |
| Prompt Quality | PASS/WARN/FAIL | {1-line} |

### Cross-Dimension Patterns
{Compound findings from orchestrator synthesis, or "None found"}

### Success Criteria Evaluation
{Per-criterion PASS/WARN/FAIL with evidence from Step 3}

### Actionable Next Steps
{Ranked list of issues to address, organized by severity}
```

If WARN or FAIL findings exist, offer to chain to `ImproveSkill` for systematic improvement.

---

## Follow-Up

Evaluate all chains below. Log each using SC7 format:

| Chains To | Condition | Tier |
|---|---|---|
| ImproveSkill | IF audit found WARN or FAIL results and user wants to act | Conditional |

**Chain Decision Log (mandatory per SC7):**
```
Chain ImproveSkill: condition [true/false] — [fired/skipped]
```
