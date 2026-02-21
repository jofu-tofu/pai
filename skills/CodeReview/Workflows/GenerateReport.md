# GenerateReport Workflow

Transform verified findings into a report the user will actually read — clear, concise, severity-ordered, with an architectural map of what changed and why it matters.

## Purpose

The report is the product. Everything before this was machinery. A technically correct but unreadable report fails the success criteria as much as a wrong one does. The goal: the user reads every word, doesn't skim, and comes away with a clear picture of (1) what they must fix, (2) what they should fix, and (3) what changed architecturally.

## Inputs

- Verified findings from `$REVIEW_DIR/findings.md`
- Context layer from `$REVIEW_DIR/context.md`
- Verification tally from VerifyClaims

## Formatting Principles

- **Lead with the verdict** — Start with a 2-3 sentence summary
- **Severity ordering** — CRITICAL first, then HIGH, MEDIUM, LOW, SUGGESTIONS
- **No wall of text** — Each finding is a card: issue, location, why it matters, what to do
- **Architectural map** — Structured overview of what modules changed and how they relate
- **Clean domains** — Group by concern within each severity level
- **What passed** — Include a "What Looks Good" section
- **Verification count** — Always surface "N/M findings verified"

## Step 1: Write Report Header

```markdown
# Code Review Report
**Branch/Range:** [commit range from context layer]
**Review date:** [today's date]
**Agents used:** [N agents — list domains covered]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W | SUGGESTIONS: V
**Verified:** [N]/[M] findings confirmed against changed commits
```

## Step 2: Write Verdict

2-3 sentences. Answer:
- Is this change safe to merge?
- What's the most important thing to know?
- What's the overall quality assessment?

```markdown
## Verdict
[2-3 sentence overall assessment. Be direct. "This change is solid with two issues
that should be fixed before merge." or "Three critical issues need attention before
this is merge-ready."]
```

## Step 3: Write Architectural Map

From the SynthesizeFindings architectural summary:
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
- Include the commit SHA so the user can trace to the exact change
- Verification status on every finding

## Step 5: Write "What Looks Good"

From the SynthesizeFindings clean domains:

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

End of pipeline — no automatic chains. Report delivered to user.
