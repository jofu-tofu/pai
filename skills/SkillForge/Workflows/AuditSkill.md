# AuditSkill — SkillForge Workflow

> **Trigger:** "audit skill", "full skill health check", "comprehensive skill check", "run all checks on skill"

> **Purpose:** Single-entry-point comprehensive audit that orchestrates all quality checks and produces a composite report.

## Reference Material

- `../SkillSystem.md` — Canonical structure spec and validation checklist
- `../RiskFramework.md` — Risk classification for audit findings
- `../SkillIntent.md` — SkillForge's own design philosophy (First Principles guide how skills should be structured and maintained)

---

## When to Use

- "Audit this skill"
- "Full health check on the X skill"
- "Is this skill production-ready?"
- "Comprehensive skill check"
- "Run all checks on this skill"

**Not this workflow if:** User wants a specific check only (→ StressTest, InvocationSim, PromptQualityAudit, ValidateSkill, ContentAudit). AuditSkill runs ALL of them.

---

## Steps

### Step 1 — Read SkillIntent

Read the target skill's `SkillIntent.md`. If missing, note as a **CRITICAL** finding and chain to `CreateSkillIntent` before continuing.

Extract Success Criteria for use in Step 9. Extract First Principles for use in Step 2.

### Step 2 — First Principles Analysis

Evaluate the target skill's actual content against two sets of First Principles:

**2a. Target skill's own First Principles:**

Read the `## First Principles` section from the target skill's `SkillIntent.md`. For each principle, examine the skill's files and ask: "Does the skill's implementation embody this principle, or contradict it?"

For each principle, report:
- **ALIGNED** — content clearly reflects this principle
- **DRIFT** — content partially contradicts or has drifted from this principle; cite specific file and section
- **CONTRADICTION** — content directly violates this principle; cite specific evidence

**2b. SkillForge First Principles (from `../SkillIntent.md`):**

Apply SkillForge's own First Principles as a quality lens on the target skill:

1. **Signal density over completeness** — Is there content that doesn't earn its token cost? Duplicated sections across files? Reference material that repeats what another file already says?
2. **User-workflow-first** — Does the routing table contain only workflows a user would naturally invoke? Are internal gates leaking into the routing table?
3. **The WHY endures, the WHAT changes** — Are there implementation-specific references (step numbers, exact file paths, log formats) embedded where they'll break on refactor?
4. **Progressive disclosure correctness** — Is each piece of content at the correct architectural layer? Check for layer violations:
   - **Layer 0 (SKILL.md):** Should contain only routing and examples. Flag: procedures, reference tables, or lengthy documentation here.
   - **Layer 1 (Workflow files):** Should contain only step-by-step procedures. Flag: reference material, naming tables, or checklist duplicates from context files here.
   - **Layer 2 (Context files):** Should contain only reference material loaded on demand. Flag: content duplicated across two context files, or content that belongs in a workflow's steps.
   - **Layer 3 (SkillIntent.md):** Should contain only design intent. Flag: implementation details, step numbers, or operational instructions here.
   - Check: is any content duplicated across layers? Is any file's content a strict subset of another file?

Capture: alignment/drift findings per principle, specific files and sections where issues were found.

### Step 3 — Structural Understanding (WorkflowDecompose)

Run the `WorkflowDecompose` workflow on the target skill.
Capture: file map, orphan detection results, coverage gaps.

### Step 4 — Compliance Check (ValidateSkill)

Run the `ValidateSkill` workflow on the target skill.
Capture: pass/fail per check, any warnings.

### Step 5 — Health Check (StressTest)

Run the `StressTest` workflow on the target skill.
Capture: structural integrity, routing table consistency, canary results.

### Step 6 — Routing Coverage (InvocationSim)

Run the `InvocationSim` workflow on the target skill.
Capture: dead routes, ambiguous scenarios, coverage percentage.

### Step 7 — Content Coherence (ContentAudit)

Run the `ContentAudit` workflow on the target skill.
Capture: coherence findings, contradiction detection, specificity assessment.

### Step 8 — Trigger Quality (PromptQualityAudit)

Run the `PromptQualityAudit` workflow on the target skill.
Capture: phrase quality scores, overlap detection, improvement suggestions.

### Step 9 — Success Criteria Evaluation

Using the Success Criteria extracted in Step 1, evaluate each criterion against findings from Steps 2-8:
- **PASS** — criterion clearly satisfied by evidence from audit phases
- **WARN** — criterion partially satisfied or evidence is ambiguous
- **FAIL** — criterion not satisfied; cite which audit phase surfaced the issue

### Step 10 — Composite Audit Report

Produce a structured report:

```
## Audit Report: {Skill Name}
Date: {YYYY-MM-DD}

### Summary
Overall: PASS | WARN | FAIL
Phases completed: {N}/7

### Phase Results
| Phase | Result | Key Findings |
|---|---|---|
| First Principles | PASS/WARN/FAIL | {1-line} |
| Structure (WorkflowDecompose) | PASS/WARN/FAIL | {1-line} |
| Compliance (ValidateSkill) | PASS/WARN/FAIL | {1-line} |
| Health (StressTest) | PASS/WARN/FAIL | {1-line} |
| Routing (InvocationSim) | PASS/WARN/FAIL | {1-line} |
| Content (ContentAudit) | PASS/WARN/FAIL | {1-line} |
| Triggers (PromptQualityAudit) | PASS/WARN/FAIL | {1-line} |

### Success Criteria Evaluation
{Per-criterion PASS/WARN/FAIL with evidence}

### Actionable Next Steps
{Ranked list of issues to fix, with recommended workflow for each}
```

### Step 11 — Present and Recommend

Present the audit report to the user. If issues were found, offer to chain to `ImproveSkill` for systematic improvement.

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
