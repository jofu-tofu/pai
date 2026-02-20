# ImproveSkill — SkillForge Workflow

> **Trigger:** "improve skill", "make skill better", "what's wrong with this skill", "how can we improve this skill", "diagnose and fix skill", "fix what's wrong with skill", "comprehensive skill improvement"

> **Purpose:** Comprehensive skill improvement driven by evaluating the target skill against its own Success Criteria AND content coherence. Unlike Retrospective (which is session-based and inductive), ImproveSkill is deductive: it starts from stated criteria, adds content coherence analysis via ContentAudit, and works backward to find gaps across both dimensions.

## Reference Material

- `../../Standards/RiskFramework.md` — Risk classification for proposed improvements (referenced in Step 4)
- `../../SkillIntent.md` — SkillForge's own design philosophy (First Principles guide how skills should be structured and maintained)

---

## When to Use

- "Improve this skill" (without session context)
- "Make this skill better"
- "What's wrong with this skill?"
- "How can we improve the X skill?"
- "Diagnose and fix this skill"
- "Fix what's wrong with this skill"
- "Comprehensive skill improvement"
- User wants directional improvement but doesn't know where to start

**Not this workflow if:** User has session-specific observations (→ Retrospective), wants structural reorganization (→ RefactorSkill), or wants to change specific content they already identified (→ ModifyContent).

---

## Steps

### Step 1 — Read SkillIntent

Read the target skill's `SkillIntent.md`. Extract:
- `## Problem This Skill Solves` — what it's supposed to do
- `## Success Criteria` — the specific criteria to evaluate against
- `## Constraints` — boundaries that must not be violated
- `## Design Decisions` — choices that should be preserved

If `SkillIntent.md` is missing or lacks `## Success Criteria`:
- **[A] Add Now** — Chain to `CreateSkillIntent` before continuing. Return here after.
- **[S] Skip** — Abort ImproveSkill. Cannot improve without criteria to improve against.

### Step 2 — Read Current Skill State

Read the target skill's:
- `SKILL.md` — description, routing table, examples, key constraints
- 2-3 representative workflow files (prioritize workflows that appear most central to the skill's purpose)
- Any context files referenced in the Context Files table

### Step 3 — Evaluate Against Success Criteria

For each Success Criterion in the target skill's SkillIntent:
1. State the criterion verbatim
2. Evaluate: **PASS** (clearly satisfied), **WEAK** (partially satisfied or fragile), **FAIL** (not satisfied)
3. Cite specific evidence from the files read in Step 2

Output format per criterion:
```
SC{N}: "{criterion text}"
Status: PASS | WEAK | FAIL
Evidence: {specific file + line or section reference}
Gap: {if WEAK or FAIL, what's missing}
```

### Step 3.5 — Agent Evaluation

Invoke `AgentEvalOrchestrator` with mode=full on the target skill (read `../../Orchestration/AgentEvalOrchestrator.md`). This dispatches 7 parallel agents across all evaluation dimensions — structural integrity, routing health, content coherence, prompt quality, first principles, behavioral resilience, and invocation coverage.

Capture agent evaluation findings and integrate them into Step 4's improvement opportunities:
- PASS findings → no action needed
- WARN findings → add as Priority 2 improvements
- FAIL findings → add as Priority 1 improvements (alongside SC FAILs)

### Step 4 — Identify Improvement Opportunities

From Step 3 (SC evaluation) AND Step 3.5 (ContentAudit) findings, produce a ranked list of improvement opportunities:
- **Priority 1 (FAIL):** SC not met OR ContentAudit FAIL findings
- **Priority 2 (WEAK):** SC fragile OR ContentAudit WARN findings
- **Priority 3 (Enhancement):** Opportunities beyond stated criteria (new capabilities, better UX, missing edge cases)

For each opportunity:
- One-sentence description of the gap
- Proposed fix (what would change)
- Risk level per `../../Standards/RiskFramework.md`
- Which workflow would apply the fix (ModifyContent, RefactorSkill)

### Step 5 — Optional Deep Analysis

If the user requested deep analysis, or if Step 4 produced 5+ opportunities:
- Offer to invoke **RedTeam** for adversarial analysis of the skill's weak points
- Offer to invoke **Council** for multi-perspective debate on the most impactful improvements

This step is optional and user-gated. Do not auto-invoke.

### Step 6 — Present Recommendations

Present the ranked improvement list to the user. For each:
- [ ] Improvement description
- Risk: Low / Medium / High
- Fix via: {workflow name}
- Estimated scope: {1-sentence}

Ask user to select which improvements to apply.

### Step 7 — Apply Selected Improvements

For each selected improvement, chain to the appropriate workflow:
- Content changes → `ModifyContent`
- New/removed workflows or structural reorganization → `RefactorSkill`

Execute chains sequentially. Each chained workflow runs its own Follow-Up chains (full cascade per WorkflowChains.md rules).

---

## Follow-Up

Evaluate all chains below. Log each using SC7 format before announcing execution:

| Chains To | Condition | Tier |
|---|---|---|
| AgentEvalOrchestrator(full) | ALWAYS after SC evaluation completes (Step 3) | Always |
| ModifyContent | IF user selected content improvements in Step 6 | Conditional |
| RefactorSkill | IF user selected workflow additions/removals or structural changes in Step 6 | Conditional |

**Chain Decision Log (mandatory per SC7):**
```
Chain AgentEvalOrchestrator(full): condition [true] — [fired]
Chain ModifyContent: condition [true/false] — [fired/skipped]
Chain RefactorSkill: condition [true/false] — [fired/skipped]
```
