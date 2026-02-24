# GenerateReport Workflow

> Internal workflow - invoked by `Review.md`, not user-facing.

## Input / Output

**Input:**
- `$REVIEW_DIR/verified-findings.md`
- `$REVIEW_DIR/context.md`
- Report template path

**Output:**
- Writes `$REVIEW_DIR/report.md`
- Returns report content and absolute path

## Purpose

Generate a high-signal final report using verified findings and the standard report template.

## Step 1: Synthesize Results

1. Compute total weighted score from dimension score lines.
2. Produce top risk and top opportunity.
3. Build priority groups:
   - Must Fix
   - Should Fix
   - Optional

## Step 2: Build Coverage Sections

From context and verified findings, produce:
1. `Design Metadata Links` (only when external artifacts are referenced)
2. `Critical Context Coverage` matrix
3. `Structure Enumeration` summary:
   - Routing and entry points
   - Internal stages
   - Artifact contracts

## Step 3: Render Required Visuals

Include at least:
1. Execution flow Mermaid diagram
2. Structure map Mermaid diagram

If diagrams already exist in source artifacts, reuse and adapt as needed.

## Step 4: Populate Dimension Scores

For each dimension run:
1. Use extracted raw/weighted score
2. Add one evidence statement
3. Add one concrete recommendation (or `Keep`)

## Step 5: Write Final Report

Write the report to `$REVIEW_DIR/report.md` in this order:
1. Summary
2. Scope
3. Design Metadata Links (if applicable)
4. Critical Context Coverage
5. Structure Enumeration
6. Visuals
7. Dimension Scores
8. Findings by Priority
9. Source Links (if used)

Return full report content and the output path.
