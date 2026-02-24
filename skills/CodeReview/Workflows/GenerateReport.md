# GenerateReport Workflow

> Internal workflow — invoked by Review.md, not user-facing.

## Input / Output

**Input:**
- Path to `$REVIEW_DIR/verified-findings.md` (verified findings from VerifyClaims)
- Path to `$REVIEW_DIR/context.md` (review context)

**Output:**
- Writes report to `$REVIEW_DIR/report.md`
- Returns the report content AND the absolute path to `report.md`

This workflow does two jobs: **synthesize** the verified findings (deduplicate, resolve severity conflicts, build architectural map) and then **generate** the final report.

## Purpose

The report is the product. Everything before this was machinery. A technically correct but unreadable report fails the success criteria as much as a wrong one does. The goal: the user reads every word, doesn't skim, and comes away with a clear picture of (1) what they must fix, (2) what they should fix, and (3) what changed architecturally.

## Phase 1: Synthesize Findings

Multiple agents reviewing the same diff will overlap. Two agents may flag the same null check. This phase collapses duplicates, resolves conflicts, and produces a unified findings list before report formatting.

### Step S1: Deduplicate

Two findings are duplicates when they reference the **same file AND overlapping line ranges** (within 5 lines of each other) AND describe the same category of issue.

**Dedup rules:**
- Same file + same line range + same issue category → merge into one finding
- Same file + overlapping lines + different issue categories → keep both (different concerns)
- Different files + similar issue pattern → keep both but note the pattern

**When merging duplicates:**
- Keep the higher severity rating
- Combine recommendations from both agents
- Note which agents independently flagged it (multi-agent agreement = higher confidence)

### Step S2: Resolve Severity Conflicts

When two agents flag the same issue with different severities:
- If one says CRITICAL and another says LOW → use CRITICAL, but note the disagreement
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

This is the "What Looks Good" section — it builds credibility by proving agents actually reviewed, not just that they didn't flag.

## Phase 2: Generate Report

## Formatting Principles

- **Lead with the verdict** — Start with a 2-3 sentence summary
- **Severity ordering** — CRITICAL first, then HIGH, MEDIUM, LOW, SUGGESTIONS
- **No wall of text** — Each finding is a card: issue, location, why it matters, what to do
- **Architectural map** — Structured overview of what modules changed and how they relate
- **Clean domains** — Group by concern within each severity level
- **What passed** — Include a "What Looks Good" section
- **Verification count** — Always surface "N/M findings verified"

## Step 1: Write Report Header

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

## Step 2: Write Verdict

2-3 sentences. Answer depends on mode:

**Diff mode:**
- Is this change safe to merge?
- What's the most important thing to know?
- What's the overall quality assessment?

**Audit mode:**
- What is the overall health of this codebase section?
- What's the most important issue to address?
- What's the quality trajectory — improving or accumulating debt?

```markdown
## Verdict
[2-3 sentence overall assessment. Be direct. "This change is solid with two issues
that should be fixed before merge." or "Three critical issues need attention before
this is merge-ready."]
```

## Step 3: Write Architectural Map

From the Phase 1 architectural summary:
- What modules/components changed
- How they relate to each other
- What the change accomplishes structurally

```markdown
## Architectural Map
[Structured summary — what changed at a system level. 3-5 sentences or a brief
bullet list of modules touched with their role in the change.]
```

## Step 4: Write Findings by Severity

For each severity level that has findings, write a section. Each finding is a **card**:

```markdown
## 🔴 Critical Issues (must fix)

### [Short title] — `[filename]:[line]`
**Why it matters:** [1 sentence — what goes wrong if unfixed]
**What to do:** [Concrete recommendation]
**Introduced in:** commit [SHA prefix] "[commit message excerpt]"
**Verified:** ✓ Confirmed in review range

---

## 🟠 High Issues (should fix)
[Same card format]

## 🟡 Medium Issues (consider fixing)
[Same card format]

## 🔵 Low / Suggestions
[Same card format — lighter weight, grouped if related]
```

**Card rules:**
- "Why it matters" is ONE sentence. Not a paragraph.
- "What to do" is a concrete action, not "consider fixing this"
- Diff mode: include the commit SHA so the user can trace to the exact change
- Audit mode: omit "Introduced in" line (no commit context); include dimension/heuristic that triggered the finding
- Verification status on every finding

## Step 5: Write "What Looks Good"

From the Phase 1 clean domains:

```markdown
## ✅ What Looks Good
- **[Domain]:** [What was reviewed and found clean — e.g., "TypeScript types are consistent, no unsafe casts found (8 files reviewed)"]
- **[Domain]:** [...]
```

This section is NOT filler. It builds credibility by proving agents actually reviewed these areas.

## Step 6: Write Pre-existing Issues Appendix (if any)

If VerifyClaims discarded any pre-existing issues:

```markdown
## 📎 Pre-existing Issues (not introduced by this change)
_These were found in surrounding code but predate your changes. Listed for awareness only._

- `[file]:[line]` — [brief description] (commit [SHA] from [date])
```

If no pre-existing issues were discarded, omit this section entirely.

## Step 7: Confidence Indicators

For findings flagged by multiple agents, note the agreement:

```
**Confidence:** Flagged by 3/4 agents independently
```

Single-agent findings get no special annotation — they're still valid, just single-perspective.

## Step 8: Output and Save

1. Output the full report directly in the conversation
2. Write to: `$REVIEW_DIR/report.md`
3. If the user requested `--comment` or "post to PR": run `gh pr comment [number] --body-file [report-path]`

## Follow-Up

Returns the report content and path to the orchestrator. The orchestrator outputs the report to the user.
