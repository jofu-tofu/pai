---
name: ContextLayer
description: >
  Generate and maintain slim, high-signal CLAUDE.md context files for AI agents.
  USE WHEN the request involves creating, reviewing, correcting, shrinking, or
  refreshing CLAUDE.md files — whether the user says so explicitly or describes
  symptoms like "agents are confused", "context is stale", "CLAUDE.md is too big",
  or "just started a new project". Covers the full lifecycle of agent context files.
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

// Redirects (handle without ContextLayer)
"update my README"         → edit the README directly
"generate API docs"        → use documentation tooling
"delete context files"     → use the filesystem directly
```
