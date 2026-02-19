# ContentAudit — SkillForge Workflow

> **Trigger:** "content audit skill", "check skill content quality", "audit skill content"

> **Purpose:** Evaluate whether a skill's content semantically delivers on its stated purpose. This is the quality dimension that structural checks (ValidateSkill, StressTest) and routing checks (InvocationSim) cannot see: does the skill's actual content make sense, cohere internally, and fulfill the SkillIntent?

## Reference Material

- `../PromptingStandards.md` — Wording quality rules (used when evaluating trigger phrase coherence)
- `../SkillIntent.md` — SkillForge's own design philosophy (First Principles guide how skills should be structured and maintained)

---

## When to Use

- "Content audit on the X skill"
- "Is this skill's content coherent?"
- "Check the content quality of this skill"
- "Audit this skill's content"
- "Review skill content quality"

**Not this workflow if:** User wants structural compliance (→ ValidateSkill), routing correctness (→ InvocationSim), trigger phrase quality (→ PromptQualityAudit), or a full audit across all dimensions (→ AuditSkill).

---

## Steps

### Step 1 — Read SkillIntent

Read the target skill's `SkillIntent.md`. Extract:
- `## Problem This Skill Solves` — the skill's stated purpose
- `## Success Criteria` — what success looks like
- `## Constraints` — what must not be violated
- `## Design Decisions` — intentional choices (especially "Alternatives Rejected")

If `SkillIntent.md` is missing: note as a **CRITICAL** finding. A skill without stated intent cannot be evaluated for content coherence. Recommend chaining to `CreateSkillIntent`.

### Step 2 — Read SKILL.md

Read the target skill's `SKILL.md`. Extract:
- `description` frontmatter — the one-line pitch
- Routing table — what workflows exist and their triggers
- Examples section — what usage looks like
- Key Constraints — behavioral boundaries

### Step 3 — Read All Workflow Files

Read every `.md` file in the target skill's `Workflows/` directory. For each, note:
- What the workflow claims to do (purpose/header)
- What the steps actually instruct the agent to do
- What the Follow-Up chains are

### Step 4 — Promise vs. Delivery Check

Compare SKILL.md description against actual workflow capabilities:
- Does the `description` frontmatter accurately reflect what the workflows can do?
- Are there capabilities promised in the description that no workflow delivers?
- Are there workflows that deliver capabilities not mentioned in the description?

Output: List of mismatches (if any).

### Step 5 — Intent vs. Implementation Check

Compare SkillIntent against workflow implementations:
- Does each workflow's step sequence logically achieve part of the stated `## Problem This Skill Solves`?
- Do any workflow instructions contradict `## Constraints`?
- Do any workflow instructions contradict `## Design Decisions`?
- Are `## Design Decisions` "Alternatives Rejected" accidentally reintroduced in any workflow?

Output: List of contradictions (if any).

### Step 6 — Step Coherence Check

For each workflow file:
- Do the steps follow a logical sequence? (No circular references, no gaps where output of step N is needed by step N+2 but not produced)
- Are step instructions specific enough that two different agents would produce similar results?
- Are there vague instructions that could cause agent divergence? (Look for: "as appropriate", "if needed", "consider", "optionally" without clear criteria)

Output: List of coherence issues (if any).

### Step 7 — Success Criteria Coverage Check

For each Success Criterion in the target skill's SkillIntent:
- Is there at least one workflow step, chain condition, or Follow-Up that verifies or enforces this criterion?
- If a criterion has no enforcement mechanism, it's a **dead criterion** — stated but never checked.

Output: Coverage map showing which criteria are enforced and which are dead.

### Step 8 — Content Coherence Report

Produce a structured report:

```
## Content Audit Report: {Skill Name}
Date: {YYYY-MM-DD}

### Overall Coherence: HIGH | MEDIUM | LOW

### Check Results
| Check | Result | Findings |
|---|---|---|
| Promise vs. Delivery | PASS/WARN/FAIL | {1-line} |
| Intent vs. Implementation | PASS/WARN/FAIL | {1-line} |
| Step Coherence | PASS/WARN/FAIL | {1-line} |
| Success Criteria Coverage | PASS/WARN/FAIL | {N}/{M} criteria enforced |

### Detailed Findings
{Per-check detailed findings with file + section references}

### Recommendations
{Ranked list of content issues to fix}
```

### Step 9 — Present Findings

Present the content coherence report to the user. Offer to chain to `ModifyContent` for content fixes or `ImproveSkill` for broader improvement.

---

## Follow-Up

Evaluate all chains below. Log each using SC7 format:

| Chains To | Condition | Tier |
|---|---|---|
| ModifyContent | IF content gaps or contradictions found that need targeted fixes | Conditional |
| ImproveSkill | IF findings suggest broader improvement beyond content edits | Conditional |

**Chain Decision Log (mandatory per SC7):**
```
Chain ModifyContent: condition [true/false] — [fired/skipped]
Chain ImproveSkill: condition [true/false] — [fired/skipped]
```
