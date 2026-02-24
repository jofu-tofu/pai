---
name: DesignReview
description: Multi-agent design review system with orchestrator-enforced process boundaries. USE WHEN user asks for a design review of a skill, wants to enumerate skill structure, requests readability or signal-density improvements, asks for scope and metadata-boundary checks, or wants visual-first design analysis. Runs dimension agents from dimension files and returns a prioritized report.
---

# DesignReview

Multi-agent design review system with process-boundary enforcement.

## Success Criteria

1. **Structure-first** - Every review enumerates entry points, internal stages, and artifact contracts.
2. **Dimension-driven** - Findings come from dedicated dimension files, not free-form ad hoc checks.
3. **Credible output** - Every finding links to concrete artifacts or verified metadata links.
4. **Digestible report** - Results are concise, scoped, and visual-first when topology is involved.

## Orchestrator Architecture (MANDATORY)

**This skill uses a thin orchestrator that spawns separate agents for each pipeline step.**

### Core Invariant

**The orchestrator (`Review.md`) never reads internal workflow step files.** It only:
- Passes internal workflow file paths to stage agents
- Checks artifact existence between stages
- Reads `dimensions.json` to launch dimension agents

### Pipeline Steps

| Step | Agent | Input | Output | Artifact Check |
|------|-------|-------|--------|---------------|
| 1 | Setup | User request | `$REVIEW_DIR` created | Directory exists |
| 2 | GatherContext | Target skill + scope | `context.md` | Exists and non-empty |
| 3 | SelectDimensions | `context.md` + `Dimensions/` | `dimensions.json` | Valid JSON with dimension array |
| 4 | Dimension Agents (parallel) | Dimension file + `context.md` | `dimension-[id].md` per agent | All outputs exist |
| 5 | VerifyCoverage | Dimension outputs + `context.md` | `verified-findings.md` | File exists |
| 6 | GenerateReport | `verified-findings.md` + `context.md` | `report.md` | File exists, output returned |

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **Review** | "design review skill", "review skill structure", "enumerate skill structure", "audit skill readability", "analyze skill design" | `Workflows/Review.md` |

> Internal workflows (`GatherContext`, `SelectDimensions`, `VerifyCoverage`, `GenerateReport`) are stage agents invoked by `Review.md` and are not user-facing routes.

## Dimension System

Eight dimensions are reviewed through dedicated files in `Dimensions/`:

- `D1` Audience, Readability, and Accessibility
- `D2` Scope and Boundaries
- `D3` Signal Density and Digestibility
- `D4` Decision Traceability and Tradeoffs
- `D5` Workflow and Ownership Clarity
- `D6` Verification and Credibility
- `D7` Visual Expressiveness (Mermaid-First)
- `D8` Metadata Boundary and Link Hygiene

## Examples

**Example 1: Enumerate CodeReview structure**
```
User: "Do a design review skill that enumerates the structure of the CodeReview skill."
-> Invokes Review workflow
-> Orchestrator spawns stage agents and dimension agents
-> Extracts topology, routing, internal pipeline, and artifact contracts
-> Returns a concise report with Mermaid diagrams and prioritized findings
```

**Example 2: Improve readability and scope clarity**
```
User: "Review this skill for readability, scope, and signal density."
-> Invokes Review workflow
-> Dimension agents run D1, D2, D3, and related checks
-> Scores the skill against design dimensions
-> Returns concrete rewrite suggestions ordered by impact
```

**Example 3: Visual-first output**
```
User: "Show this as a Mermaid diagram instead of long prose."
-> Invokes Review workflow
-> D7 dimension is prioritized
-> Produces workflow and structure diagrams
-> Keeps prose limited to key decisions and actions
```
