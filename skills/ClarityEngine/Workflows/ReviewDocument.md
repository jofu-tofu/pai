# ReviewDocument Workflow

> **Trigger:** "review presentation", "polish slide deck", "presentation quality check", "review document", "quality check"

## Scope

**Best fit for:** Quality-checking and polishing an existing document or presentation, returning a PASS/FAIL verdict with actionable fixes.
**Route to:** `CreateDocument` for building a new document from scratch. `RepurposeDocument` for converting between HTML and PPT. For graphic design overhauls or full visual redesigns, use dedicated design tools.

## Reference Material

- `../Philosophy.md` — Comprehension principles and Readability Contract
- `../FormatAdapters.md` — Format-specific technical checks

## Purpose

Run a quality and delivery-readiness audit on a document or presentation. Combines narrative structure checks against Philosophy.md principles with readability scoring (via ReadabilityGate) and format-specific technical checks.

## Workflow Steps

### Step 1: Validate Against Comprehension Principles

Check the document against Philosophy.md's five principles:
- **Layman First**: Is the opening accessible to non-experts?
- **Skip-Friendly**: Can any section be read independently?
- **Clarity Over Brevity**: Are there vague or jargon-laden sections?
- **Scannable Architecture**: Are sections chunked properly? Visual hierarchy present?
- **Evidence Over Assertion**: Are claims specific and traceable?

### Step 2: Run Readability Scoring

Delegate readability scoring to the `ReadabilityGate` workflow:
- Pass the artifact, content type, and format
- ReadabilityGate returns advisory PASS/FAIL verdict with per-checkpoint scores
- Incorporate ReadabilityGate findings into the overall review

### Step 3: Run Format-Specific Technical Checks

**HTML documents:**
- Document loads without console errors
- Navigation (sticky ToC, section anchors) functions correctly
- Layout remains stable at common viewport widths
- CDN dependencies load correctly

**PPT decks:**
- File opens in PowerPoint without repair warnings
- Theme and fonts render as intended
- Speaker notes exist where presenter support is needed
- Animations are intentional and minimal
- Output file size fits distribution channel constraints

### Step 4: Produce Severity-Ranked Findings

Combine principle, readability, and format-specific findings. Report in this order:
1. Blockers (must fix before sharing)
2. Major quality issues
3. Polish improvements

### Step 5: Output Ready-State

Return:
- `PASS` or `FAIL`
- Top 3 fixes with direct rationale
- Optional fast-pass fix plan for time-constrained revisions
