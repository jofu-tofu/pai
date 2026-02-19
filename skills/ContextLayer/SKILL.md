---
name: ContextLayer
description: >
  Generate and maintain slim, high-signal CLAUDE.md context files for AI agents.
  USE WHEN the request involves creating, reviewing, correcting, shrinking, or
  refreshing CLAUDE.md files — whether the user says so explicitly or describes
  symptoms like "agents are confused", "context is stale", "CLAUDE.md is too big",
  "just started a new project", "agents keep putting things in the wrong place",
  "my skill is getting confused about its own structure", "agents don't know about
  our workaround", "why did we implement it this way is lost", "context hasn't been
  updated in a while", or "I just added a new module and agents don't know about it".
  Covers the full lifecycle of agent context files.
  For README, API docs, or non-CLAUDE.md documentation, handle directly without this skill.
---

# ContextLayer

Generates and maintains the full hierarchical CLAUDE.md tree for a project.
Minimizes **fusion friction** — every wrong or stale line in CLAUDE.md causes
agents to operate with bad context and produce subtly wrong behavior.

**Context layer = tree**, not a single file. Root CLAUDE.md for global
orientation; subdirectory CLAUDE.md files for scoped domain context.

## Workflow Decision

Choose the workflow based on what state the user's context is in:

**→ Generate** (`Workflows/Generate.md`) when no CLAUDE.md exists yet, or a full
rebuild is needed. The project is starting fresh, or the existing context is so
wrong it's better to regenerate than repair. Use this when the user is onboarding
a new project, adding a new AI agent to a codebase for the first time, or explicitly
wants to rebuild from scratch.

**→ Audit** (`Workflows/Audit.md`) when a CLAUDE.md exists but may be wrong,
outdated, or incomplete. The file exists — it just might be lying. Use this when
the user reports agent confusion, suspects stale information, wants a regular
health check, or notices the codebase has changed since the context was written.

**→ Prune** (`Workflows/Prune.md`) when a CLAUDE.md exists and has grown too large
or noisy. The content may be correct, but there's too much of it. Use this when
the user reports context files getting bloated, hitting token limits, or wanting
to reduce context overhead without a full audit.

**→ Drift** (`Workflows/Drift.md`) when the user wants to check if their context
layer is stale without doing a full Audit. Uses git history only — no source reads,
no haiku agents. Cheap diagnostic that tells you *which* files need Audit, not what's
wrong with them. Run Drift before Audit to avoid auditing files that haven't changed.

## When It's Ambiguous

Some requests don't clearly signal which workflow to use. Resolve by asking one question:

- **"improve / fix / make better"** → ask: *Is the content wrong, or is it too long?*
  - Content wrong or outdated → Audit
  - Too long or noisy → Prune

- **"look at my CLAUDE.md" / bare "context layer"** → ask: *What's the problem you're trying to solve?*
  - No CLAUDE.md yet → Generate
  - Might be stale → Audit
  - Too long → Prune

When genuinely unclear, default to **Audit** — verifying the existing context is the
most common need and causes no harm if the content was already correct.

## Quick Reference

- **Generate** → parallel haiku agents per subsystem → synthesized CLAUDE.md tree
- **Audit** → new-content scan + haiku agents verify claims → auto-apply corrections
- **Prune** → content-only pass (no filesystem reads) → remove low-signal lines
- **Drift** → git log staleness check → diagnostic report, no file changes
- **Budget:** Root 800–1500 tokens | Subdir 200–500 tokens
- **Auto-apply:** All workflows write changes directly — reversible via git
- **Protected:** `## Context Maintenance` sections are never removed by Prune (see Prune Step 2.5)
- **Scope:** All workflows support targeted mode — specify a directory to operate on just that subtree
- **Dependency map:** Generate (targeted) maps imports + consumers → adds ## Dependencies section

## Context Files

- `ScanProtocol.md` — What to scan and in what order; haiku agent dispatch rules
- `BudgetModel.md` — Token budget math and per-file allocation
- `HaikuAgentPattern.md` — Prompt template, JSON schema, retry/fallback spec
- `PruningInstruction.md` — Template embedded at bottom of every generated CLAUDE.md
- `DesignRationale.md` — Hypothesis verdicts (H1–H6) and RedTeam findings

## Invocation Examples

```
// Explicit triggers
"generate a CLAUDE.md for this project"          → Generate
"initialize context for this codebase"           → Generate
"rebuild the context layer from scratch"         → Generate
"update the context layer"                       → Audit
"check my CLAUDE.md for issues"                  → Audit
"is my CLAUDE.md stale?"                         → Audit
"prune the context layer, it's getting bloated"  → Prune
"compress my CLAUDE.md to save tokens"           → Prune

// Diagnostic phrasings (symptom → workflow)
"agents keep putting files in the wrong place"   → Audit (stale paths)
"Claude ignores my CLAUDE.md, it's too long"     → Prune
"just started a new repo, agents have no clue"   → Generate
"we refactored last week, context is now wrong"  → Audit

// Scoped / targeted (operate on one directory, not the whole tree)
"generate context for just the auth directory"   → Generate (targeted: src/auth)
"audit only the api subdirectory's CLAUDE.md"    → Audit (targeted: src/api)
"prune just the db context file"                 → Prune (targeted: src/db)
"the workers module has no context yet"          → Generate (targeted: src/workers)

// Redirects (handle without ContextLayer)
"update my README"         → edit the README directly
"generate API docs"        → use documentation tooling
"delete context files"     → use the filesystem directly
```
