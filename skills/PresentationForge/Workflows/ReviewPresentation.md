# ReviewPresentation Workflow

> **Trigger:** "review presentation", "polish slide deck", "presentation quality check"

## Scope

**Best fit for:** Quality-checking and polishing an existing presentation or document, returning a PASS/FAIL verdict with actionable fixes.
**Route to:** `CreatePresentation` for building a new deck from scratch. `RepurposePresentation` for converting between HTML and PPT. For graphic design overhauls or full visual redesigns, use dedicated design tools instead.

## Reference Material

- `../FirstPrinciples.md`
- `../Standards/ReadabilityStandards.md`
- `../Standards/CodebaseAnalysisStandards.md`

## Purpose

Run a quality and delivery-readiness audit on a presentation or document. Combines narrative structure checks with readability scoring (via ReadabilityGate) and format-specific technical checks.

## Workflow Steps

### Step 1: Validate Narrative Structure

Check:
- Clear objective and desired decision
- Logical content progression
- Evidence-claim alignment
- Explicit closing ask

### Step 2: Run Readability Scoring

Delegate readability scoring to the `ReadabilityGate` workflow:
- Pass the artifact, content type, and format
- ReadabilityGate returns advisory PASS/FAIL verdict with per-category scores
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

Combine narrative, readability, and format-specific findings. Report in this order:
1. Blockers (must fix before presenting/sharing)
2. Major quality issues
3. Polish improvements

### Step 5: Output Ready-State

Return:
- `PASS` or `FAIL`
- Top 3 fixes with direct rationale
- Optional fast-pass fix plan for time-constrained revisions
