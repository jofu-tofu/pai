# ReadabilityGate Workflow

> **Trigger:** "readability check", "check readability", "run readability gate"

## Scope

**Best fit for:** Running a readability and quality audit on a generated document or presentation, returning an advisory PASS/FAIL verdict with severity-ranked findings.
**Auto-chained by:** CreatePresentation, CreateHtmlDocument, CreatePptPresentation, RepurposePresentation.
**Route to:** `ReviewPresentation` for a full narrative + readability + format-specific audit. This workflow focuses on readability standards only.

## Reference Material

- `../Standards/ReadabilityStandards.md`
- `../Standards/CodebaseAnalysisStandards.md` (when content type is `codebase-analysis`)

## Purpose

Score a document or presentation against research-backed readability standards and return an advisory report. The gate always completes and returns findings — it does not block delivery. Users iterate on findings at their discretion.

## Gate Behavior

**ADVISORY, not blocking.** The gate always completes and returns findings alongside the artifact. The parent workflow delivers the artifact with the gate report attached. No retry loop. No halt-on-fail.

## Input Interface Contract

All callers pass this stable interface:

| Field | Type | Description |
|-------|------|-------------|
| `artifact` | string | Path to the generated file or inline content |
| `content_type` | enum | One of: `general`, `codebase-analysis`, `technical-writeup` |
| `format` | enum | One of: `html`, `ppt` |

## Scoring Model

- Each rule scores **PASS** or **FAIL** (binary, with evidence cited)
- Severity assigned per rule:
  - **Blocker** — accessibility violations, missing document structure
  - **Major** — readability degradation, cognitive load violations
  - **Polish** — improvements that enhance but do not degrade
- Overall verdict: **FAIL** if any Blocker exists; **PASS** otherwise
- Per-category summary: `{category}: {passed}/{total} rules`

## Workflow Steps

### Step 1: Receive Context

Accept the input interface contract fields:
- `artifact`: path or content to audit
- `content_type`: determines which standards files to load
- `format`: determines format-contextual interpretation of rules

### Step 2: Load Applicable Standards

Always load `../Standards/ReadabilityStandards.md` (33 general rules).

If `content_type` is `codebase-analysis`, also load `../Standards/CodebaseAnalysisStandards.md` (~21 additional rules).

### Step 3: Score Each Rule

For each loaded rule:
1. Apply the rule's test method to the artifact
2. Record PASS or FAIL
3. Cite specific evidence: element inspected, value found, threshold compared
4. Assign severity: Blocker, Major, or Polish

Interpret rules contextually per format:
- HTML rules about CSS properties apply directly
- PPT rules about CSS map to equivalent slide formatting properties (font size, contrast, spacing)

### Step 4: Classify and Rank Findings

Group findings by severity:
1. **Blockers** — must address for accessibility/usability
2. **Major** — significantly impacts readability
3. **Polish** — nice-to-have improvements

Within each severity, group by category (Typography, Contrast, etc.).

### Step 5: Return Advisory Report

Deliver:
- **Overall Verdict:** PASS or FAIL (FAIL only if Blockers exist)
- **Per-Category Scores:** `{category}: {passed}/{total}`
- **Severity-Ranked Findings:** Blockers first, then Major, then Polish
- **Top 3 Actionable Fixes:** The three highest-impact changes to improve readability
- **Rule Coverage:** Total rules checked vs. total applicable rules
