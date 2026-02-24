# DesignReview Orchestrator

> You are a thin orchestrator. Spawn stage agents and check artifacts.
> Stage agents read their own workflow files and write outputs.
> Your job: pass file paths, check artifacts, then continue.

## Step 0: Resolve Paths

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
SKILL_ROOT=$REPO_ROOT/skills/DesignReview
```

## Path Conventions

`$REVIEW_DIR` follows:
`_output/contexts/[context-slug]/reviews/designreview/[YYYYMMDD-HHMMSS]`

If no context slug is available, create:
`YYYYMMDD-HHMM-designreview-[target-skill]`

## Step 1: Setup

Determine target skill from user request.
If none specified, default to `CodeReview`.

Create review directory:

```bash
mkdir -p $REVIEW_DIR
```

## Step 2: Gather Context

Spawn agent:
- **prompt:** `"Read $SKILL_ROOT/Workflows/GatherContext.md and execute it. Target skill: [target]. Requested scope hints: [user hints, if any]. Write your output to: $REVIEW_DIR/context.md. Return the absolute path to context.md."`
- **subagent_type:** `general-purpose`

**CHECK:** `$REVIEW_DIR/context.md` exists and is non-empty.
- If missing -> retry once.
- If missing again -> abort with error.

## Step 3: Select Dimensions

Spawn agent:
- **prompt:** `"Read $SKILL_ROOT/Workflows/SelectDimensions.md and execute it. Context file: $REVIEW_DIR/context.md. Dimensions directory: $SKILL_ROOT/Dimensions/. Write your output to: $REVIEW_DIR/dimensions.json. Return the absolute path to dimensions.json."`
- **subagent_type:** `general-purpose`

**CHECK:** `$REVIEW_DIR/dimensions.json` exists and contains a dimension array.
- If missing -> retry once.
- If missing again -> abort with error.

## Step 4: Spawn Dimension Agents

Read `$REVIEW_DIR/dimensions.json` and launch one agent per selected dimension in parallel.

Per agent prompt:

```
You are a design reviewer for one specific dimension.

1. Read [dimension.path] for the heuristics and scoring rubric.
2. Read $REVIEW_DIR/context.md for target scope and artifact map.
3. Review [dimension.files].
4. Write findings to: $REVIEW_DIR/dimension-[dimension.id].md
5. Return the absolute output path.
```

**Synchronization:**
1. Collect each returned path.
2. Verify each file exists and is non-empty.
3. Retry missing outputs once per failed dimension.
4. Build full list of dimension output paths for downstream steps.

The orchestrator collects file paths only and does not interpret dimension findings.

## Step 5: Verify Coverage

Spawn agent:
- **prompt:** `"Read $SKILL_ROOT/Workflows/VerifyCoverage.md and execute it. Dimension output files: [list of $REVIEW_DIR/dimension-*.md paths]. Context file: $REVIEW_DIR/context.md. Write output to: $REVIEW_DIR/verified-findings.md. Return the absolute path."`
- **subagent_type:** `general-purpose`

**CHECK:** `$REVIEW_DIR/verified-findings.md` exists.

## Step 6: Generate Report

Spawn agent:
- **prompt:** `"Read $SKILL_ROOT/Workflows/GenerateReport.md and execute it. Verified findings: $REVIEW_DIR/verified-findings.md. Context: $REVIEW_DIR/context.md. Template: $SKILL_ROOT/Templates/DesignReviewReportTemplate.md. Write output to: $REVIEW_DIR/report.md. Return report content and absolute path."`
- **subagent_type:** `general-purpose`

Output the report to the user.
