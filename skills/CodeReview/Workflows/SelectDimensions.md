# SelectDimensions Workflow

> Internal workflow — invoked as a standalone agent by the orchestrator (Review.md), not user-facing.

## Input / Output

**Input:**
- Path to `context.md` (review context from GatherContext)
- Path to `Dimensions/` directory (dimension rule files)

**Output:**
- Writes `dimensions.json` to `$REVIEW_DIR/dimensions.json`
- Returns the absolute path to `dimensions.json`

## Purpose

Select which review dimensions are relevant to this specific review, based on the context and the available dimension files. No trigger matching — use judgment based on context + dimension descriptions.

## Step 1: Read Context

Read the `context.md` file provided as input. Extract:
- Languages in the change fingerprint
- Domains touched (API, UI, data, config, tests)
- Size tier (Small/Medium/Large)
- Intent (new feature, refactor, bug fix)
- Risk areas identified

## Step 2: Discover Dimensions

Glob `Dimensions/**/*.md` (relative to the skill root) to find all dimension files.

For each dimension file found:
1. Read the YAML frontmatter to get: id, name, category, baseline flag
2. Read the first paragraph after the heading to understand what the dimension covers

Build a list of all available dimensions with their metadata.

## Step 3: Select Dimensions

Using the context from Step 1 and the dimension inventory from Step 2:

1. **Baseline dimensions always included** — any dimension with `baseline: true` in frontmatter is included unless the review has fewer than 10 changed lines. Baselines are: B1 (Boundary Errors), B2 (Logic Errors), S4 (Complexity Reduction), A5 (Design Intent), D3 (Assumption Audit).

2. **Context-driven selection** — for non-baseline dimensions, use judgment:
   - Architecture dimensions (A1, A2) activate when changes touch module boundaries, imports, or multi-file structural changes
   - Behavioral dimensions (B3, B4, B5) activate based on the nature of code changes (case handling, data transformation, testability concerns)
   - Simplification dimensions (S1, S2) activate when changes add significant new code or modify existing complex code
   - Strategic dimensions (D1) activate for larger changes that affect architectural direction

3. **No trigger conditions** — do not parse or match trigger syntax. Read the context, read what the dimension covers, decide if it's relevant.

## Step 4: Determine Sizing

Based on review size from context:

| Tier | Diff Lines | Audit Files | Agent Cap |
|------|-----------|-------------|-----------|
| Small | 1-50 | 1-10 | 5 |
| Medium | 50-300 | 10-50 | 8 |
| Large | 300+ | 50+ | 13 |

If selected dimensions exceed the agent cap, prioritize: baselines first, then by relevance to the specific changes.

## Step 5: Route Files

For each selected dimension, assign the subset of changed/target files relevant to its concern:
- Architecture dimensions: entire modules/directories affected
- Behavioral dimensions (B1, B2): all changed files (these are universal)
- Language-specific dimensions: files matching the language
- Simplification dimensions: files with significant additions or modifications

## Step 6: Write Output

Write `dimensions.json` to `$REVIEW_DIR/dimensions.json`:

```json
{
  "mode": "diff",
  "tier": "MEDIUM",
  "agent_cap": 8,
  "dimensions": [
    {
      "id": "B1",
      "name": "Boundary & Edge Case Errors",
      "path": "/absolute/path/to/Dimensions/Behavioral/BoundaryErrors.md",
      "reason": "Baseline — always relevant for code changes",
      "files": ["src/auth/login.ts", "src/api/routes.ts"]
    }
  ],
  "audit_summary": "Selected: N dimensions for M-line diff across K modules"
}
```

## Step 7: Print Selection Rationale

Output to chat for user transparency:
- How many dimensions selected and why
- Which baselines were included
- Which non-baselines were added and the reasoning
- Sizing tier and agent cap
