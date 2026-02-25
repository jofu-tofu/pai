# VerifyAndReport Workflow

> Internal workflow — invoked by Review.md, not user-facing.

## Input / Output

**Input:**
- List of per-dimension agent output files: `$REVIEW_DIR/dimension-[id].md` (paths provided by orchestrator)
- Path to `$REVIEW_DIR/context.md` (review context, includes review mode)

**Output:**
- Writes verified findings to `$REVIEW_DIR/verified-findings.md`
- Writes final report to `$REVIEW_DIR/report.md`
- Returns the report content AND the absolute path to `report.md`

## Purpose

This workflow does three jobs in one pass: **verify** that findings trace to actual changed lines and are not false positives, **synthesize** findings (deduplicate, resolve conflicts, build architectural map), and **generate** the final report with only confirmed, genuine issues. Combining these eliminates a redundant agent handoff — the same agent that verifies claims already has the full findings context needed to write the report.

---

## Phase 1: Collect and Verify Findings

### Step 1: Collect Findings from Agent Outputs

Each review agent wrote its findings to a separate file. Collect them into a unified list:

1. Read each agent output file from the paths provided by the orchestrator
2. Extract all findings from each file: severity, file, line, heuristic, description, recommendation
3. Tag each finding with the dimension that produced it (infer from the filename: `dimension-[id].md`)
4. Combine into a single findings list ordered by file path, then line number

### Step 2: Mode Selection

Read the context layer's `Mode:` field:

- **`diff`** → Proceed to Step 3 (git blame verification against commit range)
- **`audit`** → Skip to Step 3A (file-presence verification — no commit range exists)

### Step 3A: Verify Audit Findings (audit mode only)

In audit mode, there is no commit range. Findings are verified by confirming the cited code actually exists.

For EVERY finding in the findings list:

```bash
# Does the file exist?
test -f [filename] && echo "EXISTS" || echo "MISSING"

# Does the cited line range exist and match the described issue?
sed -n '[start],[end]p' [filename]
```

**Decision tree (audit mode):**

| Condition | Result | Action |
|---|---|---|
| File exists AND cited lines contain the described pattern AND the issue is a genuine problem (not a false positive) | VERIFIED | Keep finding in report |
| File exists AND cited lines match BUT the flagged pattern is intentional, idiomatic, or not actually problematic | FALSE POSITIVE | Discard finding — do not include in report |
| File exists BUT cited lines don't match the description | MISLOCATED | Agent to re-check, or mark "Location uncertain" |
| File does not exist | INVALID | Discard finding |

After verification, skip to Phase 2 (synthesize).

### Step 3: Verify Each Finding (diff mode)

For EVERY finding in the findings list, run:

```bash
# Who introduced this line?
git blame -L [line],[line] [filename] --porcelain | head -1
```

Extract the commit SHA from the first line of porcelain output.

```bash
# Was this commit in our review range?
git log [base]..HEAD --oneline --format="%H" | grep [commit-sha-prefix]
```

**Decision tree:**

| Condition | Result | Action |
|---|---|---|
| Commit SHA IS in the review range AND the issue is a genuine problem (not a false positive) | VERIFIED | Keep finding in report |
| Commit SHA IS in the review range BUT the flagged pattern is intentional, idiomatic, or not actually problematic | FALSE POSITIVE | Discard — do not include in report |
| Commit SHA is NOT in the review range | PRE-EXISTING | Move to appendix "Pre-existing Issues" |
| Commit IS in range but a LATER commit in range changed the same line | SELF-CORRECTED | Discard — issue was fixed within the PR |
| Cannot determine (binary file, generated code, blame unavailable) | UNVERIFIED | Keep but mark as "Unverified — manual review recommended" |

**Self-correction check (for VERIFIED findings):**
```bash
# Did a later commit in the range touch this same line?
git log [finding-commit-sha]..HEAD --oneline -- [filename] | head -5
```
If a later commit modified the same file, re-blame the line to check if it was changed.

### Step 4: Handle Special Cases

**New files (all lines new):**
```bash
git log --diff-filter=A --format="%H" -- [filename]
```
If the file was added in the review range, all lines auto-verified. Skip blame.

**Deleted code:**
The deletion itself is the finding. Verify the deletion commit is in range:
```bash
git log [range] --diff-filter=D -- [filename]
```

**Renamed files:**
```bash
git log --follow --format="%H" -- [filename] | head -5
```

**Generated code (lockfiles, build output):**
Flag as "Generated — human review recommended" rather than VERIFIED or DISCARDED.

### Step 5: Write Verified Findings

Write verification results to `$REVIEW_DIR/verified-findings.md`:

For each finding, append verification status:
```
Verification: VERIFIED (commit abc1234 in range)
Verification: DISCARDED (commit def5678 predates review range — pre-existing)
Verification: FALSE POSITIVE (pattern is intentional/idiomatic — not a real issue)
Verification: UNVERIFIED (blame data unavailable — generated file)
```

Remove DISCARDED findings from the main findings sections. Move them to a new appendix section:

```markdown
### Pre-existing Issues (not introduced by this change)
[Findings that were discarded — kept for awareness, not for action]
```

Record the verification tally:
```
Verification: [N]/[total] findings confirmed against changed commits
([M] pre-existing discarded, [F] false positives removed, [P] unverified, [Q] self-corrected)
```

---

## Phase 2: Synthesize Findings

### Step S1: Deduplicate

Two findings are duplicates when they reference the **same file AND overlapping line ranges** (within 5 lines of each other) AND describe the same category of issue.

**Dedup rules:**
- Same file + same line range + same issue category -> merge into one finding
- Same file + overlapping lines + different issue categories -> keep both (different concerns)
- Different files + similar issue pattern -> keep both but note the pattern

**When merging duplicates:**
- Keep the higher severity rating
- Combine recommendations from both agents
- Note which agents independently flagged it (multi-agent agreement = higher confidence)

### Step S2: Resolve Severity Conflicts

When two agents flag the same issue with different severities:
- If one says CRITICAL and another says LOW -> use CRITICAL, but note the disagreement
- General rule: take the higher severity and add a confidence note
- Exception: if the lower-severity agent provides specific reasoning for downgrading, include that reasoning as context

### Step S3: Build Architectural Map

Using the context layer's change fingerprint and the findings:
- Group changed files by module/component
- Identify which modules have findings and which are clean
- Produce a 3-5 sentence structural summary: "This change touches [modules]. The [X] module has the most findings ([N]). The [Y] module passed clean across all agents."

### Step S4: Identify Clean Domains

For each agent domain that found NO issues, record it:
- "TypeScript types: No issues found (TypeScript agent reviewed 8 files)"
- "Security: No vulnerabilities detected (Security agent reviewed auth-related changes)"

This is the "What Looks Good" section — builds credibility by proving agents actually reviewed.

---

## Phase 3: Generate Report

### Formatting Principles

- **Lead with the verdict** — Start with a 2-3 sentence summary
- **Severity ordering** — CRITICAL first, then HIGH, MEDIUM, LOW, SUGGESTIONS
- **No wall of text** — Each finding is a card: issue, location, why it matters, what to do
- **Architectural map** — Structured overview of what modules changed and how they relate
- **What passed** — Include a "What Looks Good" section
- **Verification count** — Always surface "N/M findings verified" and how many false positives were filtered out
- **Only genuine issues** — The report includes only verified, non-false-positive findings. False positives are excluded entirely.

### Step R1: Write Report Header

Adapt header based on review mode from context layer:

**Diff mode:**
```markdown
# Code Review Report
**Branch/Range:** [commit range from context layer]
**Review date:** [today's date]
**Agents used:** [N agents — list domains covered]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W | SUGGESTIONS: V
**Verified:** [N]/[M] findings confirmed against changed commits
```

**Audit mode:**
```markdown
# Codebase Audit Report
**Target:** [target path from context layer]
**Scope:** [N files across M directories]
**Review date:** [today's date]
**Agents used:** [N agents — list dimensions covered]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W | SUGGESTIONS: V
**Verified:** [N]/[M] findings confirmed against actual code
```

### Step R2: Write Verdict

2-3 sentences. Answer depends on mode:

**Diff mode:**
- Is this change safe to merge?
- What's the most important thing to know?
- What's the overall quality assessment?

**Audit mode:**
- What is the overall health of this codebase section?
- What's the most important issue to address?
- What's the quality trajectory — improving or accumulating debt?

### Step R3: Write Architectural Map

From Phase 2 architectural summary:
- What modules/components changed
- How they relate to each other
- What the change accomplishes structurally

### Step R4: Write Findings by Severity

For each severity level that has findings, write a section. Each finding is a **card**:

```markdown
## Critical Issues (must fix)

### [Short title] -- `[filename]:[line]`
**Why it matters:** [1 sentence — what goes wrong if unfixed]
**What to do:** [Concrete recommendation]
**Introduced in:** commit [SHA prefix] "[commit message excerpt]"
**Verified:** Confirmed in review range
```

**Card rules:**
- "Why it matters" is ONE sentence. Not a paragraph.
- "What to do" is a concrete action, not "consider fixing this"
- Diff mode: include the commit SHA so the user can trace to the exact change
- Audit mode: omit "Introduced in" line (no commit context); include dimension/heuristic that triggered the finding
- Verification status on every finding

### Step R5: Write "What Looks Good"

From Phase 2 clean domains:

```markdown
## What Looks Good
- **[Domain]:** [What was reviewed and found clean]
- **[Domain]:** [...]
```

This section is NOT filler. It builds credibility by proving agents actually reviewed these areas.

### Step R6: Write Pre-existing Issues Appendix (if any)

If verification discarded any pre-existing issues:

```markdown
## Pre-existing Issues (not introduced by this change)
_These were found in surrounding code but predate your changes. Listed for awareness only._

- `[file]:[line]` -- [brief description] (commit [SHA] from [date])
```

If no pre-existing issues were discarded, omit this section entirely.

### Step R7: Confidence Indicators

For findings flagged by multiple agents, note the agreement:

```
**Confidence:** Flagged by 3/4 agents independently
```

Single-agent findings get no special annotation — they're still valid, just single-perspective.

### Step R8: Output and Save

1. Write to: `$REVIEW_DIR/report.md`
2. Return the report content AND the absolute path to `report.md`
3. If the user requested `--comment` or "post to PR": run `gh pr comment [number] --body-file [report-path]`

## Follow-Up

Returns the report content and path to the orchestrator. The orchestrator outputs the report to the user.
