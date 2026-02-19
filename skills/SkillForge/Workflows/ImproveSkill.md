# ImproveSkill — SkillForge Workflow

> **Trigger:** "improve skill", "make skill better", "what's wrong with this skill", "how can we improve this skill"

> **Purpose:** Goal-directed skill improvement driven by evaluating the target skill against its own Success Criteria. Unlike Retrospective (which is session-based and inductive), ImproveSkill is deductive: it starts from stated criteria and works backward to find gaps.

## Reference Material

- `../RiskFramework.md` — Risk classification for proposed improvements (referenced in Step 4)
- `../SkillIntent.md` — SkillForge's own design philosophy (First Principles guide how skills should be structured and maintained)

---

## When to Use

- "Improve this skill" (without session context)
- "Make this skill better"
- "What's wrong with this skill?"
- "How can we improve the X skill?"
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

### Step 4 — Identify Improvement Opportunities

From Step 3 findings, produce a ranked list of improvement opportunities:
- **Priority 1 (FAIL):** Success Criteria that are not met at all
- **Priority 2 (WEAK):** Success Criteria that are fragile or partially met
- **Priority 3 (Enhancement):** Opportunities beyond stated criteria (new capabilities, better UX, missing edge cases)

For each opportunity:
- One-sentence description of the gap
- Proposed fix (what would change)
- Risk level per `../RiskFramework.md`
- Which workflow would apply the fix (ModifyContent, ManageWorkflows, RefactorSkill)

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
- New/removed workflows → `ManageWorkflows`
- Structural reorganization → `RefactorSkill`

Execute chains sequentially. Each chained workflow runs its own Follow-Up chains (full cascade per WorkflowChains.md rules).

---

## Follow-Up

Evaluate all chains below. Log each using SC7 format before announcing execution:

| Chains To | Condition | Tier |
|---|---|---|
| ModifyContent | IF user selected content improvements in Step 6 | Conditional |
| ManageWorkflows | IF user selected workflow additions/removals in Step 6 | Conditional |
| RefactorSkill | IF user selected structural changes in Step 6 | Conditional |

**Chain Decision Log (mandatory per SC7):**
```
Chain ModifyContent: condition [true/false] — [fired/skipped]
Chain ManageWorkflows: condition [true/false] — [fired/skipped]
Chain RefactorSkill: condition [true/false] — [fired/skipped]
```
