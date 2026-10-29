---
name: Telos
evals:
  manual:
    reason: "whether a personal goal, belief, or strategy update is right needs the principal's approval against their intended state; the tool's write contract is the deterministic test above"
    falsifier: "the principal rejects an update as inaccurate, unauthorized, or inconsistent with the intended goals"
metadata:
  short-description: "Read or update personal TELOS goals, beliefs, and strategies; analyze project dependencies and alignment. Use Interview for conversational state refresh."
version: 1.1.3
description: Personal TELOS reads and updates goals, beliefs, narratives, and strategies with timestamped backups; Project TELOS analyzes .md/.csv directories for dependencies, bottlenecks, and alignment. USE WHEN Telos, life goals, projects, dependencies, update TELOS, narrative points, McKinsey report, dashboard, what am I wrong about, life frames, mental models. NOT FOR conversational constitutional review (Interview).
---

Read `PORTABILITY.md` before use; it defines the standalone tool and storage contract and replaces any inherited platform-specific setup.

# Telos

**Contents:** Ideal State · Intent Routing · Data & Config · Project TELOS Analysis · Building Dashboards · Gotchas · Examples

Reads and changes the principal's personal TELOS (life goals, ideal and current state, beliefs, strategies, wisdom, lessons, wrong-beliefs and the rest) at the path explicitly supplied in `TELOS_DIR`, every change made through the Update intent's tool with a timestamped backup and a changelog line, because a hand edit can lose history or break the structure other tools parse. **TELOS** (Telic Evolution and Life Operating System) is the context-gathering system behind it. The same skill also runs Project TELOS: it reads a directory of .md/.csv files for dependency chains (PROBLEMS→GOALS→STRATEGIES→PROJECTS), bottlenecks, alignment and progress, and renders the analysis as a McKinsey-style report, n=24 narrative points, or a Next.js dashboard built by parallel engineers.

## Ideal State

- Personal TELOS changes only through the Update intent's tool: each change lands in the right file (and section, on a section-structured TELOS.md) with existing content preserved, a timestamped backup taken first, and a line in the changelog. The one other writer, the dashboard template's file save, keeps the same guarantees: it holds the shared TELOS lock, copies the file to `Backups/<name>.dashboard-<stamp>` first, logs the change, and refuses any edit inside an AUTOMATED region.
- Advice and analysis rest on the TELOS or project files as they are now, read in this run, and every claim traces to a file; nothing comes from cached knowledge.
- A project analysis surfaces the dependency chains PROBLEMS→GOALS→STRATEGIES→PROJECTS, the bottlenecks, alignment with stated objectives, progress and risk areas, delivered in the format asked for: report, narrative, dashboard, JSON or executive summary.
- Personal TELOS never leaves the private tree: it is never included in public repos, skills, or outputs. Project material may be sensitive, so it is shared outward only with the principal's yes, sensitive details are redacted in examples, and individual names are reduced to roles in anything board-facing.

## Intent Routing

| Intent | Trigger | File |
|----------|---------|------|
| **Update** | "add to TELOS", "add to ideal state", "update my goals", "add book to TELOS" | `Intents/Update.md` |
| **InterviewExtraction** | "extract content", "extract telos content", "extract interviews", "analyze interviews" | `Intents/InterviewExtraction.md` |
| **CreateNarrativePoints** | "create narrative", "narrative points", "TELOS report", "n=24" | `Intents/CreateNarrativePoints.md` |
| **WriteReport** | "write report", "McKinsey report", "create TELOS report", "professional report" | `Intents/WriteReport.md` |

General project analysis, dashboards, dependency mapping and executive summaries have no intent file; the skill handles them directly (§ Project TELOS Analysis, § Building Dashboards).

| User Request | Context | Location |
|--------------|---------|----------|
| "my TELOS", "my goals", "my beliefs", "add to TELOS" | Personal TELOS | `PORTABILITY.md` |
| "analyze [project]", "dashboard for" | Project TELOS | User-specified directory |
| "analyze the explicitly selected notes directory | Project TELOS | Specified path |

| File | Read when |
|------|-----------|
| `DashboardTemplate/` | building a project dashboard: the shipped Next.js scaffold, with copy-and-run steps in its README |
| `ReportTemplate/` | WriteReport copies it as the report app (components, styles, placeholder `lib/report-data.ts`) |
| `Setup.md` | first-time setup: the TELOS files, and the optional report theme (`ReportTheme.ts`, `Fonts/`) |

## Data & Config

Use request preferences or local `Customizations/PREFERENCES.md`. Save outputs to the user's requested destination. Read `PORTABILITY.md`.

## Project TELOS Analysis

Point the skill at a project directory (named project, explicit path, or common location). The analysis covers every `.md`/`.csv` file in the target tree (e.g. `the explicitly selected notes directory`), with no required structure and no fixed file list:

```bash
find $TARGET_DIR -type f \( -name "*.md" -o -name "*.csv" \)
```

Deliver in whatever format was asked: markdown report (Mermaid diagrams), interactive web dashboard, JSON export, or executive summary.

## Building Dashboards

The deliverable is an interactive Next.js dashboard that renders the analysis with dependency graphs (Mermaid or D3.js), sortable and filterable progress tables, metrics cards (KPIs, stats), timeline visualizations and relationship networks. **Start from the shipped scaffold at `DashboardTemplate/`** (working Next.js app: file browser, markdown/CSV rendering, dependency views — see its README for the copy-and-run steps) rather than from scratch, then adapt pages to the analysis. Its stack (Next.js 15, TypeScript, shadcn/ui, Tailwind CSS) and its Tokyo Night Day design tokens in `DashboardTemplate/app/globals.css` are the dashboard's. Fan the build out across parallel agents wherever the work splits cleanly: data-parsing lib, shared components, per-page views, theme, integration. (Template wired per public issue #1555, @tzioup.)

## Gotchas

- **Project dashboards pull from multiple sources.** Verify data freshness before presenting.

## Examples

**Example 1: Change the ideal state**
```
User: "add to ideal state: publish one book a year"
--> Update intent
--> The entry sits under its heading in TELOS.md's Ideal State section (written with --section), a backup is in Backups/, and updates.md logs the change
```

**Example 2: Analyze project with TELOS**
```
User: "analyze the explicitly selected notes directory with TELOS"
--> Project TELOS analysis over every .md and .csv file in the tree
--> Dependency chains, bottlenecks, alignment and progress metrics, each traced to its file
```

**Example 3: Board report from an assessment**
```
User: "create a TELOS report for Acme Corp"
--> WriteReport intent
--> A running Next.js report app in the output directory, nine sections, role-based sources, print-ready
```

## Existing notes

Set `TELOS_DIR` to your own notes directory. No global vault discovery or migration occurs. `Tools/UpdateTelos.ts` accepts only its documented flat TELOS filenames; for nested vault notes use the host editor with an explicit backup rather than claiming that tool supports arbitrary paths. Logs use `TELOS_TIMEZONE` or UTC.
