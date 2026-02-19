# StressTest Workflow

> **Trigger:** "stress test skill", "health check skill", "verify skill health", "test skill integrity", "run skill diagnostics", "skill not triggering"

## Reference Material

- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Run a battery of health checks against any target skill to validate file structure, routing table integrity, trigger consistency, and live add/remove functionality. Works on any skill in the PAI system — not just SkillForge.

## When to Run

- After modifying any skill's workflows or routing table
- When a workflow fails to trigger correctly
- Periodic health check after PAI system upgrades or migrations
- As a final validation step after CreateSkill or SkillForge operations

---

## Workflow Steps

### Step 0: Identify Target Skill

Ask the user which skill to test if not specified in the prompt.

```
TARGET: [SkillName]
SKILL_DIR: $PAI_DIR/skills/[SkillName]/   (or ~/.claude/skills/[SkillName]/ if installed there)
```

Locate the skill directory and confirm `SKILL.md` is readable before proceeding. If not found, report and stop.

---

### Step 1: File Structure Check

Read the target skill's `SKILL.md` to discover what files should exist. Then verify each one is present on disk.

**Required for every skill:**
- `SKILL.md` — must exist and be readable

**Derived from routing table:** Read `## Workflow Routing` section and extract every file path in the `File` column. Each one must exist on disk.

**Derived from Context Files section (if present):** Read `## Context Files` section (if it exists) and extract every file listed. Each one must exist on disk.

```
SKILL.md:             [present / MISSING]
Workflows found:      [N from routing table]
Workflows on disk:    [N present / M missing: list missing ones]
Context files:        [N present / M missing: list missing ones]
```

**Pass:** All files derived from SKILL.md exist on disk.
**Fail:** List every missing file by path. Do not proceed past Step 1 if SKILL.md itself is missing.

---

### Step 2: Routing Table Integrity Check

Cross-check routing table entries against actual files on disk in both directions:

1. **Orphan references:** Every file path in the routing table exists on disk
2. **Ghost files:** Every `Workflows/*.md` file on disk has a corresponding routing table entry

```
Orphan references (table → no file): [list or "none"]
Ghost files (file → no table entry): [list or "none"]
```

**Pass:** Zero orphans and zero ghosts.
**Fail:** List each orphan and ghost by name.

---

### Step 3: Workflow Trigger Coverage Check

For each workflow listed in the routing table:
1. Read the workflow file's `> **Trigger:**` header line
2. Compare against the trigger phrases in the routing table row

```
| Workflow | Routing Table Trigger | File Trigger Header | Consistent? |
|----------|-----------------------|---------------------|-------------|
| [name]   | [phrase(s)]           | [phrase(s)]         | Y / N       |
| ...      | ...                   | ...                 | ...         |
```

**Pass:** All workflows show Y (semantically consistent — exact match not required; purpose alignment is sufficient).
**Fail:** List inconsistent workflows with both trigger strings so the mismatch is clear.

---

### Step 4: Canary Operation — Live Add and Remove Test

This is the live functional test. It exercises the skill's ManageWorkflows capability end-to-end by adding and removing a throwaway workflow.

**Only run this step if the target skill has a ManageWorkflows-equivalent workflow** (i.e., a workflow for adding/removing workflows). If not, skip and note "Canary: N/A — no ManageWorkflows-equivalent".

#### 4a. Record Pre-Test State

Count current routing table rows and files in `Workflows/`. Record both numbers.

#### 4b. Add Canary Workflow

Create a minimal file at `Workflows/StressTestCanary.md`:

```markdown
# StressTestCanary Workflow

> **Trigger:** "stress_test_canary_do_not_invoke"

## Purpose

Temporary canary workflow created during StressTest health check. Delete after test.
```

Add a routing row for `StressTestCanary` to SKILL.md.

**Pass signal:** File exists, routing row present, counts increased by 1.

#### 4c. Verify Canary

Confirm:
- Canary file is readable at expected path
- SKILL.md routing table contains the canary row
- Routing table count = pre-test count + 1

#### 4d. Remove Canary

Delete `Workflows/StressTestCanary.md` and remove its routing row from SKILL.md.

**Pass signal:** File gone, routing row removed, counts restored to pre-test values.

---

### Step 5: Report Results

```
STRESS TEST REPORT — [SkillName]
================================
Step 1 — File Structure:     [PASS/FAIL: N/M files found]
Step 2 — Routing Integrity:  [PASS/FAIL: N orphans, M ghosts]
Step 3 — Trigger Coverage:   [PASS/FAIL: N/M workflows consistent]
Step 4 — Canary Operation:   [PASS/FAIL/N/A]

OVERALL: [PASS / FAIL — list failing steps]
```

If any step fails: do not auto-fix. Report failures and ask user which to remediate, then invoke the appropriate SkillForge workflow (ManageWorkflows, ModifyContent, etc.) for each fix.

---

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| Structural checks pass but routing issues were reported | InvocationSim | Announce: "Running invocation sim for deeper routing analysis..." then execute `Workflows/InvocationSim.md` |
| Trigger consistency check found mismatches | PromptQualityAudit | Announce: "Running prompt quality audit on mismatched triggers..." then execute `Workflows/PromptQualityAudit.md` |

**Chain Decision Log (MANDATORY — SC7):**
Log one line per chain in the table above, regardless of outcome:
  `Chain [WorkflowName]: condition [true/false] — [fired/skipped]`
Skipped chains MUST be logged — silence on a skipped chain violates SC7.

If no conditions match, skip follow-ups.

---

## Example Output

```
STRESS TEST REPORT — Research
================================
Step 1 — File Structure:     PASS: 6/6 files found
Step 2 — Routing Integrity:  PASS: 0 orphans, 0 ghosts
Step 3 — Trigger Coverage:   PASS: 4/4 workflows consistent
Step 4 — Canary Operation:   PASS: add/verify/remove all clean

OVERALL: PASS — Research skill is healthy and self-consistent.
```
