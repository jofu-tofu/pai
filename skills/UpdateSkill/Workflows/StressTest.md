# StressTest Workflow

> **Trigger:** "stress test skill", "test update skill", "self-test skill", "verify update skill works"

## Purpose

Validate that UpdateSkill is functioning correctly by running a battery of self-checks across all workflows, file references, and structural compliance. Meta-proof: UpdateSkill modified itself to add this workflow, which is the first passing test.

## When to Run

- After modifying UpdateSkill itself
- When a workflow fails to trigger correctly
- Periodic health check of the skill system
- After PAI system upgrades or migrations

## Workflow Steps

### Step 1: File Structure Check

Verify all required files exist in `/home/fujos/.claude/skills/UpdateSkill/`:

| File | Expected Path | Pass Signal |
|------|--------------|-------------|
| SKILL.md | `SKILL.md` | File readable |
| ModifyContent | `Workflows/ModifyContent.md` | File readable |
| ManageWorkflows | `Workflows/ManageWorkflows.md` | File readable |
| RefactorSkill | `Workflows/RefactorSkill.md` | File readable |
| ValidateSkill | `Workflows/ValidateSkill.md` | File readable |
| Retrospective | `Workflows/Retrospective.md` | File readable |
| WorkflowDecompose | `Workflows/WorkflowDecompose.md` | File readable |
| StressTest | `Workflows/StressTest.md` | File readable (this file) |
| ValidationChecklist | `ValidationChecklist.md` | File readable |
| RiskFramework | `RiskFramework.md` | File readable |

**Pass:** All 10 files readable.
**Fail:** Report missing files by name, do not proceed.

### Step 2: Routing Table Integrity Check

Read SKILL.md and verify:
1. Every `Workflows/*.md` file listed in the routing table physically exists on disk
2. No routing table entry points to a missing file (orphan reference)
3. No workflow file exists on disk without a routing table entry (ghost file)

**Pass:** Routing table and disk are in 1:1 sync.
**Fail:** List orphan references or ghost files by name.

### Step 3: Workflow Trigger Coverage Check

For each workflow, verify the trigger phrase in SKILL.md matches the `> **Trigger:**` line inside the workflow file:

| Workflow | SKILL.md Trigger | Internal Trigger | Match? |
|----------|-----------------|------------------|--------|
| ModifyContent | check SKILL.md | check file header | Y/N |
| ManageWorkflows | check SKILL.md | check file header | Y/N |
| RefactorSkill | check SKILL.md | check file header | Y/N |
| ValidateSkill | check SKILL.md | check file header | Y/N |
| Retrospective | check SKILL.md | check file header | Y/N |
| WorkflowDecompose | check SKILL.md | check file header | Y/N |
| StressTest | check SKILL.md | check file header | Y/N |

**Pass:** All triggers semantically consistent (exact match not required; purpose alignment required).
**Fail:** List mismatched workflows and their conflicting trigger phrases.

### Step 4: Canary Operation — Add and Remove Test Workflow

This is the live functional test. It exercises ManageWorkflows on a real (but throwaway) workflow.

#### 4a. Add Test Workflow

Create a minimal canary file at `Workflows/_StressTestCanary.md`:

```markdown
# StressTestCanary Workflow

> **Trigger:** "_stress_test_canary"

## Purpose

Temporary canary workflow created during StressTest. Delete after test.
```

Then add a routing row to SKILL.md for `_StressTestCanary`.

**Pass signal for 4a:** File exists, SKILL.md row present.

#### 4b. Verify Canary

Confirm:
- Canary file is readable
- SKILL.md has the canary row
- Routing table count increased by 1

**Pass signal for 4b:** Count = (pre-test count + 1).

#### 4c. Remove Test Workflow

Delete `Workflows/_StressTestCanary.md` and remove its routing row from SKILL.md.

**Pass signal for 4c:** File gone, SKILL.md row removed, count restored to pre-test count.

### Step 5: Self-Reference Verification

Confirm UpdateSkill can be invoked on itself without infinite loop or crash:

Check that the SKILL.md description field includes "update skill" as a trigger — ensuring UpdateSkill triggers for requests to modify itself.

**Pass:** `description` field in SKILL.md frontmatter contains "update skill".
**Fail:** Trigger missing from frontmatter — run ModifyContent to add it.

### Step 6: Report Results

```
STRESS TEST REPORT — UpdateSkill
================================
Step 1 — File Structure:     [PASS/FAIL: N/10 files found]
Step 2 — Routing Integrity:  [PASS/FAIL: N orphans, M ghosts]
Step 3 — Trigger Coverage:   [PASS/FAIL: N/7 triggers matched]
Step 4 — Canary Operation:   [PASS/FAIL: add/verify/remove]
Step 5 — Self-Reference:     [PASS/FAIL]

OVERALL: [PASS / FAIL — list failing steps]
```

If any step fails: do not auto-fix. Report failures and ask user which to remediate.

## Example Output

```
STRESS TEST REPORT — UpdateSkill
================================
Step 1 — File Structure:     PASS: 10/10 files found
Step 2 — Routing Integrity:  PASS: 0 orphans, 0 ghosts
Step 3 — Trigger Coverage:   PASS: 7/7 triggers matched
Step 4 — Canary Operation:   PASS: add/verify/remove all clean
Step 5 — Self-Reference:     PASS

OVERALL: PASS — UpdateSkill is healthy and self-consistent.
```
