# DesignReview Orchestrator

> You are a thin orchestrator. Spawn stage agents and check artifacts.
> Stage agents read their own workflow files and write outputs.
> Your job: pass file paths, check artifacts, then continue.

## Step 0: Resolve Skill Paths

Resolve `SKILL_ROOT` in this order:
1. If this workflow file path is known, derive `SKILL_ROOT` from its parent (`.../skills/DesignReview`).
2. Else try git root (`$REPO_ROOT/skills/DesignReview`).
3. Else require explicit `SKILL_ROOT` from the caller and fail with a clear error if missing.

## Path Conventions

`$REVIEW_DIR` follows:
`_output/contexts/[context-slug]/reviews/designreview/[YYYYMMDD-HHMMSS]`

If no context slug is available, create:
`YYYYMMDD-HHMM-designreview-[target-artifact]`

## Step 1: Setup

Determine target artifact from user request:
1. Explicit file or directory path
2. Skill name/path
3. If none specified and request is skill-oriented, default to `CodeReview`

Create review directory:

```bash
mkdir -p $REVIEW_DIR
```

Set report style:
- `compact` when user asks for short/concise/quick output
- `full` otherwise

## Step 2: Gather Context

Spawn agent:
- **prompt:** `"Read $SKILL_ROOT/Workflows/GatherContext.md and execute it. Target artifact: [target]. Requested scope hints: [user hints, if any]. Report style: [compact|full]. Write your output to: $REVIEW_DIR/context.md. Return the absolute path to context.md."`
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

Before launching dimension agents:
1. Close completed stage agents from Steps 2-3.
2. Read `$REVIEW_DIR/dimensions.json`.
3. Launch dimension agents in parallel batches (not one unbounded fanout).
4. Batch size = `min(agent_cap, available_agent_slots)`.

If spawn fails due agent/thread limits:
1. Close completed agents.
2. Retry with a smaller batch.
3. Continue until all selected dimensions complete.

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
- **prompt:** `"Read $SKILL_ROOT/Workflows/GenerateReport.md and execute it. Verified findings: $REVIEW_DIR/verified-findings.md. Context: $REVIEW_DIR/context.md. Template: $SKILL_ROOT/Templates/DesignReviewReportTemplate.md. Report style: [compact|full]. Write output to: $REVIEW_DIR/report.md. Return report content and absolute path."`
- **subagent_type:** `general-purpose`

Output the report to the user.
