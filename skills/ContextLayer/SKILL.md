---
name: ContextLayer
description: >
  Generate and maintain slim, high-signal CLAUDE.md context files.
  USE WHEN user says "update context layer", "prune context layer",
  "generate CLAUDE.md", "audit my context", "is my CLAUDE.md stale",
  "slim down CLAUDE.md", "context layer", "update context", OR any
  request to create or improve project context for AI agents.
---

# ContextLayer

Generates and maintains the full hierarchical CLAUDE.md tree for a project.
Minimizes **fusion friction** — every wrong or stale line in CLAUDE.md causes
agents to operate with bad context and produce subtly wrong behavior.

**Context layer = tree**, not a single file. Root CLAUDE.md for global
orientation; subdirectory CLAUDE.md files for scoped domain context.

## Workflow Routing

| Trigger | Workflow | When |
|---------|----------|------|
| "generate", "create a CLAUDE.md", "set up context", "new project" | `Workflows/Generate.md` | Project has no CLAUDE.md or needs full rebuild |
| "audit", "update", "is it stale", "review context layer", "update context layer" | `Workflows/Audit.md` | CLAUDE.md exists; verify claims against actual files |
| "prune", "slim down", "shrink", "remove stale", "prune context layer" | `Workflows/Prune.md` | CLAUDE.md exists; remove redundant/obvious content |

## Quick Reference

- **Generate** → parallel haiku agents per subsystem → synthesized CLAUDE.md tree
- **Audit** → haiku agents verify each CLAUDE.md's claims → auto-apply corrections
- **Prune** → content-only pass (no filesystem reads) → remove low-signal lines
- **Budget:** Root 800–1500 tokens | Subdir 200–500 tokens
- **Auto-apply:** All workflows write changes directly — reversible via git

## Context Files

- `ScanProtocol.md` — What to scan and in what order; haiku agent dispatch rules
- `BudgetModel.md` — Token budget math and per-file allocation
- `HaikuAgentPattern.md` — Prompt template, JSON schema, retry/fallback spec
- `PruningInstruction.md` — Template embedded at bottom of every generated CLAUDE.md
- `DesignRationale.md` — Hypothesis verdicts (H1–H6) and RedTeam findings

## Invocation Examples

```
"generate a CLAUDE.md for this project"          → Workflows/Generate.md
"update the context layer"                       → Workflows/Audit.md
"prune the context layer, it's getting bloated"  → Workflows/Prune.md
"is my CLAUDE.md stale?"                         → Workflows/Audit.md
"slim down the CLAUDE.md files"                  → Workflows/Prune.md
```
