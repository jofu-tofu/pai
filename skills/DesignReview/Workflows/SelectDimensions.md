# SelectDimensions Workflow

> Internal workflow - invoked by `Review.md`, not user-facing.

## Input / Output

**Input:**
- `$REVIEW_DIR/context.md`
- `Dimensions/` directory path

**Output:**
- Writes `$REVIEW_DIR/dimensions.json`
- Returns absolute path to `dimensions.json`

## Purpose

Select review dimensions for this run and emit a machine-readable manifest used by the orchestrator to launch dimension agents.

## Step 1: Read Context

Read `context.md` and extract:
1. Target size (file count)
2. Scope type (`structure-only` or `structure+content`)
3. Risk signals from the context layer
4. User-priority hints

## Step 2: Discover Dimension Files

Glob `Dimensions/**/*.md`.

For each file:
1. Read frontmatter fields:
   - `id`
   - `name`
   - `category`
   - `baseline`
   - `weight`
2. Read first paragraph for purpose summary.

## Step 3: Select Dimension Set

Rules:
1. Include all `baseline: true` dimensions.
2. If no explicit user scoping is provided, include all dimensions.
3. If user scope is narrow, include dimensions that match the context signals plus baselines.

Tiering:

| Tier | Target Files | Agent Cap |
|---|---|---|
| Small | 1-10 | 5 |
| Medium | 11-30 | 6 |
| Large | 31+ | 8 |

If selected dimensions exceed cap:
1. Keep all baselines.
2. Prioritize dimensions by direct relevance to user scope.
3. Defer lowest-relevance non-baseline dimensions.

## Step 4: Route Files Per Dimension

For each selected dimension, assign relevant files:
1. Structural dimensions (`D2`, `D4`, `D5`, `D8`) -> all core docs
2. Visual dimension (`D7`) -> files with flow/topology prose or existing diagrams
3. Readability/signal dimensions (`D1`, `D3`) -> user-facing and internal workflow docs
4. Verification dimension (`D6`) -> files that make process claims

## Step 5: Write `dimensions.json`

Write output:

```json
{
  "tier": "MEDIUM",
  "agent_cap": 6,
  "dimensions": [
    {
      "id": "D2",
      "name": "Scope and Boundaries",
      "path": "/absolute/path/to/Dimensions/Core/ScopeBoundaries.md",
      "reason": "Baseline dimension",
      "files": ["skills/Target/SKILL.md", "..."]
    }
  ],
  "selection_summary": "Selected N dimensions for M files"
}
```

Print a short rationale summary to chat.
