# GenerateReport Workflow

> Internal workflow — invoked by Review.md, not user-facing.

## Input / Output

**Input:**
- Path to `$REVIEW_DIR/verified-findings.md` (verified findings from VerifyClaims)
- Path to `$REVIEW_DIR/context.md` (review context)

**Output:**
- Writes report to `$REVIEW_DIR/report.md`
- Returns the report content AND the absolute path to `report.md`

This workflow does two jobs: **synthesize** the verified findings (deduplicate, resolve severity conflicts, identify clean areas) and then **generate** the final report.

## Purpose

The report is the product. Everything before this was machinery. A technically correct but unreadable report fails the success criteria as much as a wrong one does. The goal: the user reads every word, doesn't skim, and comes away with a clear picture of (1) what rules are being violated, (2) where, and (3) what to do about it.

## Inputs

- Verified findings from `$REVIEW_DIR/verified-findings.md`
- Context layer from `$REVIEW_DIR/context.md`

## Phase 1: Synthesize Findings

Multiple agents reviewing the same code may overlap — especially when a file maps to multiple languages (e.g., a `.tsx` file reviewed by both React and TypeScript agents). This phase collapses duplicates, resolves conflicts, and produces a unified findings list before report formatting.

### Step S1: Deduplicate

Two findings are duplicates when they reference the **same file AND overlapping line ranges** (within 5 lines of each other) AND describe the same category of issue.

**Dedup rules:**
- Same file + same line range + same rule category -> merge into one finding
- Same file + overlapping lines + different rule categories -> keep both (different concerns)
- Different files + similar rule violation pattern -> keep both but note the pattern

**When merging duplicates:**
- Keep the higher severity rating
- Keep the most specific rule ID
- Combine recommendations from both agents
- Note which agents independently flagged it (multi-agent agreement = higher confidence)

### Step S2: Resolve Severity Conflicts

When two agents flag the same issue with different severities:
- If one says CRITICAL and another says LOW -> use CRITICAL, but note the disagreement
- General rule: take the higher severity and add a confidence note
- Exception: if the lower-severity agent provides specific reasoning for downgrading, include that reasoning as context

### Step S3: Identify Clean Areas

For each language dimension that found NO violations, record it:
- "TypeScript Type Safety: No violations found (4 files reviewed against 5 rules)"
- "React Architecture: All patterns conform to standards (6 components reviewed)"

This is the "What Looks Good" section — it builds credibility by proving agents actually reviewed, not just that they didn't flag.

## Phase 2: Generate Report

## Formatting Principles

- **Lead with the verdict** — Start with a 2-3 sentence summary
- **Severity ordering** — CRITICAL first, then HIGH, MEDIUM, LOW
- **No wall of text** — Each finding is a card: rule ID, issue, location, what to do
- **Rule ID on every finding** — Users should be able to trace findings back to specific standards
- **What passed** — Include a "What Looks Good" section
- **Verification count** — Always surface "N/M findings verified"

## Step 1: Write Report Header

Adapt header based on review mode from context layer:

**Diff mode:**
```markdown
# StandardsReview Report
**Branch/Range:** [commit range from context layer]
**Review date:** [today's date]
**Languages:** [detected languages]
**Dimensions checked:** [N dimensions across M languages]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W
**Verified:** [N]/[M] findings confirmed against changed commits
```

**Audit mode:**
```markdown
# StandardsReview Audit Report
**Target:** [target path from context layer]
**Scope:** [N files across M directories]
**Review date:** [today's date]
**Languages:** [detected languages]
**Dimensions checked:** [N dimensions across M languages]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W
**Verified:** [N]/[M] findings confirmed against actual code
```

## Step 2: Write Verdict

2-3 sentences. Answer depends on mode:

**Diff mode:**
- Does this change follow language-specific standards?
- What's the most common category of violation?
- Overall standards conformance assessment

**Audit mode:**
- What is the overall standards health of this codebase section?
- Which language has the most violations?
- What's the highest-priority category to address?

```markdown
## Verdict
[2-3 sentence overall assessment. Be direct. "This change follows TypeScript standards
well but has 3 React anti-patterns that should be fixed before merge." or "Standards
conformance is solid across all 4 detected languages."]
```

## Step 3: Write Findings by Severity

For each severity level that has findings, write a section. Each finding is a **card**:

```markdown
## CRITICAL Issues (must fix)

### [RULE_ID] [Short title] — `[filename]:[line]`
**Rule:** [Rule name from dimension file]
**Why it matters:** [1 sentence — what goes wrong if unfixed]
**What to do:** [Concrete recommendation]
**Introduced in:** commit [SHA prefix] "[commit message excerpt]"
**Verified:** Confirmed in review range

---

## HIGH Issues (should fix)
[Same card format]

## MEDIUM Issues (consider fixing)
[Same card format]

## LOW Issues
[Same card format — lighter weight, grouped if related]
```

**Card rules:**
- Rule ID is ALWAYS included — this is what makes StandardsReview findings actionable
- "Why it matters" is ONE sentence. Not a paragraph.
- "What to do" is a concrete action, not "consider fixing this"
- Diff mode: include the commit SHA so the user can trace to the exact change
- Audit mode: omit "Introduced in" line (no commit context)
- Verification status on every finding

## Step 4: Write "What Looks Good"

From the Phase 1 clean areas:

```markdown
## What Looks Good
- **[Language] [Dimension]:** [What was reviewed and found clean — e.g., "TypeScript type safety rules all pass (4 files, 5 rules checked)"]
- **[Language] [Dimension]:** [...]
```

This section is NOT filler. It builds credibility by proving agents actually reviewed these areas.

## Step 5: Write Pre-existing Issues Appendix (if any)

If VerifyClaims discarded any pre-existing issues:

```markdown
## Pre-existing Issues (not introduced by this change)
_These were found in surrounding code but predate your changes. Listed for awareness only._

- `[file]:[line]` — [RULE_ID] [brief description] (commit [SHA] from [date])
```

If no pre-existing issues were discarded, omit this section entirely.

## Step 6: Confidence Indicators

For findings flagged by multiple agents (e.g., React and TypeScript agents both flagging the same issue), note the agreement:

```
**Confidence:** Flagged by 2 agents independently (React + TypeScript)
```

Single-agent findings get no special annotation.

## Step 7: Output and Save

1. Output the full report directly in the conversation
2. Write to: `$REVIEW_DIR/report.md`
3. If the user requested `--comment` or "post to PR": run `gh pr comment [number] --body-file [report-path]`

## Follow-Up

Returns the report content and path to the orchestrator. The orchestrator outputs the report to the user.
