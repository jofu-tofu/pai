# VerifyCoverage Workflow

> Internal workflow - invoked by `Review.md`, not user-facing.

## Input / Output

**Input:**
- List of dimension output files: `$REVIEW_DIR/dimension-[id].md`
- `$REVIEW_DIR/context.md`

**Output:**
- Writes `$REVIEW_DIR/verified-findings.md`
- Returns absolute path to `verified-findings.md`

## Purpose

Enforce credibility by checking that every finding is traceable to real artifacts and that metadata-link claims are verifiable.

## Step 1: Collect Findings

From each dimension output file, extract:
1. Dimension id
2. Severity
3. Artifact path and section/line reference
4. Evidence summary
5. Recommendation
6. Dimension score line

## Step 2: Verify Artifact References

For each finding:
1. Verify artifact path exists.
2. Verify cited section/line can be located.
3. Mark finding:
   - `VERIFIED` if artifact and evidence location resolve
   - `UNVERIFIED` if evidence location cannot be confirmed
   - `INVALID` if artifact does not exist

## Step 3: Verify External Links (if referenced)

For findings that depend on external links:
1. Check HTTP status (`200` expected) with `curl -L`.
2. If link unavailable, mark as `UNVERIFIED-LINK`.
3. Do not discard the finding if the issue is about missing summaries for linked metadata.

## Step 4: Deduplicate

Deduplicate by:
1. Same artifact
2. Same issue theme
3. Overlapping location

Merge duplicates and keep highest severity.

## Step 5: Tally and Write

Write `verified-findings.md` with:
1. Verification tally
2. Verified findings (ordered by severity)
3. Unverified findings appendix
4. Invalid findings appendix
5. Consolidated dimension scores
