# ReviewPresentation Workflow

> **Trigger:** "review presentation", "polish slide deck", "presentation quality check"

## Scope

**Best fit for:** Quality-checking and polishing an existing presentation deck, returning a PASS/FAIL verdict with actionable fixes.
**Route to:** `CreatePresentation` for building a new deck from scratch. `RepurposePresentation` for converting between HTML and PPT. For graphic design overhauls or full visual redesigns, use dedicated design tools instead.

## Reference Material

- `../FirstPrinciples.md`
- `../QualityChecklist.md`

## Purpose

Run a quality and delivery-readiness audit on a presentation, prioritizing message clarity first and format-specific reliability second.

## Workflow Steps

### Step 1: Validate Narrative Structure

Check:
- Clear objective and desired decision
- Logical slide progression
- Evidence-claim alignment
- Explicit closing ask

### Step 2: Run Checklist Scoring

Apply `../QualityChecklist.md` and score each category:
- Message quality
- Visual quality
- HTML-specific reliability (if HTML deck)
- PPT-specific reliability (if PPT deck)

### Step 3: Produce Severity-Ranked Findings

Report findings in this order:
1. Blockers (must fix before presenting)
2. Major quality issues
3. Polish improvements

### Step 4: Output Ready-State

Return:
- `PASS` or `FAIL`
- Top 3 fixes with direct rationale
- Optional fast-pass fix plan for time-constrained revisions
