---
name: Telos
description: Life OS and project analysis with personal TELOS stored in the Obsidian vault. USE WHEN TELOS, life goals, mission, beliefs, current direction, career strategy, projects, dependencies, dashboard, narrative, report. SkillSearch('telos') for docs.
compatibility: Designed for Claude Code and Devin (or similar agent products). Requires access to an Obsidian vault with TELOS data.
metadata:
  author: pai
  version: "1.0.0"
---

# Telos

**TELOS** (Telic Evolution and Life Operating System) is a comprehensive context-gathering system with two applications:

1. **Personal TELOS** - {PRINCIPAL.NAME}'s life context system (mission, beliefs, goals, current direction, career synthesis) in the Obsidian vault at `~/Obsidian/TELOS/`
2. **Project TELOS** - Analysis framework for organizations/projects (relationships, dependencies, goals, progress)


## Workflow Routing

**When executing a workflow, output this notification directly:**

```
Running the **WorkflowName** workflow from the **Telos** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **Update** | "add to TELOS", "update my goals", "update my TELOS" | `Workflows/Update.md` |
| **InterviewExtraction** | "extract content", "extract interviews", "analyze interviews" | `Workflows/InterviewExtraction.md` |
| **CreateNarrativePoints** | "create narrative", "narrative points", "TELOS report", "n=24" | `Workflows/CreateNarrativePoints.md` |
| **WriteReport** | "write report", "McKinsey report", "create TELOS report", "professional report" | `Workflows/WriteReport.md` |

**Note:** For general project analysis, dashboards, dependency mapping, and executive summaries, the skill handles these directly without a separate workflow file.

## Examples

**Example 1: Update personal TELOS**
```
User: "update my TELOS goals"
--> Invokes Update workflow
--> Creates timestamped backup of Direction/GOALS.md
--> Appends the new goal content to the Obsidian TELOS note
--> Logs change in Reviews/updates.md with timestamp
```

**Example 2: Analyze project with TELOS**
```
User: "analyze ~/Projects/MyApp with TELOS"
--> Scans all .md and .csv files in directory
--> Extracts entities, relationships, dependencies
--> Returns analysis with dependency chains and progress metrics
```

**Example 3: Build project dashboard**
```
User: "build a dashboard for TELOSAPP"
--> Launches up to 10 parallel engineers
--> Creates Next.js dashboard with shadcn/ui + Aceternity
--> Returns interactive dashboard with dependency graphs, metrics cards, progress tables
```

**Example 4: Generate narrative points**
```
User: "create TELOS narrative for Acme Corp, n=24"
--> Invokes CreateNarrativePoints workflow
--> Analyzes TELOS context (situation, problems, recommendations)
--> Returns a story-driven narrative with evidence, stakes, vision, and close
--> Output is slide-ready for presentations or customer briefings
```

**Example 5: Generate McKinsey-style report**
```
User: "write a TELOS report for Acme Corp"
--> Invokes WriteReport workflow
--> First runs CreateNarrativePoints to generate story content
--> Maps narrative to McKinsey report structure
--> Generates web-based report with professional styling
--> Output at {project_dir}/report - run `bun dev` to view
--> White background, subtle Tokyo Night Storm accents
--> Includes: cover page, executive summary, findings, recommendations, roadmap
```

---

## Context Detection

**How {DAIDENTITY.NAME} determines which TELOS context:**

| User Request | Context | Location |
|--------------|---------|----------|
| "my TELOS", "my goals", "my beliefs", "add to TELOS" | Personal TELOS | `~/Obsidian/TELOS/` |
| "Alma", "TELOSAPP", "analyze [project]", "dashboard for" | Project TELOS | User-specified directory |
| "analyze ~/path/to/project" | Project TELOS | Specified path |

---

# Part 1: Personal TELOS ({PRINCIPAL.NAME}'s Life)

## Location

**CRITICAL PATH:** Personal TELOS lives in the Obsidian vault at:
```
~/Obsidian/TELOS/
```

On this machine, that resolves to:
```
C:\Users\fujos\Obsidian\TELOS\
```

## Personal TELOS Framework

Current structure inside `~/Obsidian/TELOS/`:

### Orientation
- **Home.md** - Overview of the TELOS folder and linked strategic notes
- **Now.md** - Live snapshot of current priorities, constraints, and active decisions
- **CLAUDE.md** - Routing and quality guidance for the TELOS folder

### Core
- **Core/MISSION.md** - Life mission statement
- **Core/BELIEFS.md** - Core beliefs and world model

### Direction
- **Direction/GOALS.md** - Near-term, medium-term, and long-term goals

### Career
- **Career/Overview.md** - Career synthesis and current positioning
- **Career/Everything Resume.md** - Broad experience inventory
- **Career/Target Roles.md** - Roles worth pursuing
- **Career/Gap Analysis.md** - Capability and evidence gaps
- **Career/Strategy.md** - Career strategy and directional moves

### Reviews
- **Reviews/updates.md** - Lightweight changelog of meaningful TELOS changes
- **Backups/** - Timestamped note backups created by the Update workflow

## Working with Personal TELOS

### Read Files

```bash
# View specific files
read ~/Obsidian/TELOS/Direction/GOALS.md
read ~/Obsidian/TELOS/Core/BELIEFS.md
read ~/Obsidian/TELOS/Now.md

# View recent updates
read ~/Obsidian/TELOS/Reviews/updates.md
```

### Update Personal TELOS

**CRITICAL:** Use the Update workflow with a relative note path inside `~/Obsidian/TELOS/`.

**Workflow:** `Workflows/Update.md`

The workflow provides:
- Automatic timestamped backups under `Backups/`
- Change logging in `Reviews/updates.md`
- Version history preservation
- Support for nested note paths inside the TELOS folder

**Common note paths for updates:**
Home.md, Now.md, Core/MISSION.md, Core/BELIEFS.md, Direction/GOALS.md, Career/Overview.md, Career/Everything Resume.md, Career/Target Roles.md, Career/Gap Analysis.md, Career/Strategy.md, Reviews/updates.md

---

# Part 2: Project TELOS (Organizational Analysis)

## Capabilities

For any project directory, TELOS provides:

1. **Relationship Discovery** - Find how files/entities connect
2. **Dependency Mapping** - Identify what depends on what
3. **Goal Extraction** - Discover stated and implied objectives
4. **Progress Analysis** - Track advancement and metrics
5. **Narrative Generation** - Create executive summaries
6. **Visual Dashboards** - Build beautiful UIs with data

## Target Directory Detection

**Flexible file discovery - no required structure:**

```bash
# User specifies directory
"Analyze ~/Cloud/Projects/TELOSAPP"
--> {DAIDENTITY.NAME} scans for .md and .csv files anywhere in tree

# {DAIDENTITY.NAME} automatically finds all .md and .csv files regardless of structure
```

## Analysis Workflow

### Step 1: Identify Target

**Auto-detection:**
- User mentions project name (TELOSAPP, Alma, etc.)
- User provides path explicitly
- {DAIDENTITY.NAME} looks for common project locations

### Step 2: Scan Files

Discover all markdown and CSV files:
```bash
find $TARGET_DIR -type f \( -name "*.md" -o -name "*.csv" \)
```

Index:
- Markdown structure (headings, sections, links)
- CSV schema (columns, data types)
- Cross-references and mentions
- Entities (people, teams, projects, problems)

### Step 3: Relationship Analysis

Build relationship graph:
1. **Entity Extraction** - Identify unique entities
2. **Connection Discovery** - Find explicit/implicit links
3. **Dependency Mapping** - Trace dependencies
4. **Network Construction** - Build directed graph

### Step 4: Generate Insights

Produce analytics:
- **Dependency Chains**: PROBLEMS --> GOALS --> STRATEGIES --> PROJECTS
- **Bottlenecks**: What blocks progress?
- **Goal Alignment**: Projects aligned with objectives?
- **Progress Metrics**: Completion percentages
- **Risk Areas**: Overdue items, blocked work

### Step 5: Create Outputs

**Output Formats:**

1. **Markdown Report** - Static analysis with Mermaid diagrams
2. **Web Dashboard** - Interactive app with shadcn/ui + Aceternity
3. **JSON Export** - Structured data
4. **Executive Summary** - Narrative overview
5. **Custom Format** - As requested

## Building Dashboards

### Parallel Engineer Strategy

**CRITICAL: When building UIs, use up to 16 parallel engineers.**

**Launch Strategy:**
Use single message with 10 Task calls in parallel:

```
Engineer 1: Project structure + layout + navigation
Engineer 2: Overview page with metrics cards
Engineer 3: Projects page with progress tracking
Engineer 4: Teams page with performance tables
Engineer 5: Vulnerabilities/issues page
Engineer 6: Progress timeline visualization
Engineer 7: Data parsing library (MD/CSV)
Engineer 8: Shared components (cards, badges, tables)
Engineer 9: Design polish and theme
Engineer 10: Integration and testing
```

### Dashboard Requirements

**Tech Stack:**
- Next.js 14 + TypeScript
- shadcn/ui for UI components
- Aceternity UI for layouts
- Tailwind CSS
- Tokyo Night Day theme (professional light)

**Features:**
- Dependency graphs (Mermaid or D3.js)
- Progress tables (sortable, filterable)
- Metrics cards (KPIs, stats)
- Timeline visualizations
- Relationship networks

**Design:**
```css
--background: #ffffff
--foreground: #1a1b26
--primary: #2e7de9
--accent: #9854f1
--destructive: #f52a65
--success: #33b579
--warning: #f0a020
```

## Common TELOS Files

**Standard Project TELOS Structure** (auto-detected):

### Context Files
- **OVERVIEW.md** - Project overview
- **COMPANY.md** - Organization context
- **PROBLEMS.md** - Issues to solve
- **GOALS.md** - Objectives
- **MISSION.md** - Mission statement
- **STRATEGIES.md** - Strategic approaches
- **PROJECTS.md** - Active initiatives

### Operational Files
- **EMPLOYEES.md** - Team members
- **ENGINEERING_TEAMS.md** - Team structure
- **BUDGET.md** - Financial tracking
- **KPI_TRACKING.md** - Metrics
- **APPLICATIONS.md** - App inventory
- **TOOLS.md** - Tooling
- **VENDORS.md** - Third parties

### Security Files
- **VULNERABILITIES.md** - Security issues
- **SECURITY_POSTURE.md** - Security state
- **THREAT_MODEL.md** - Threats

### Data Files (CSV)
- **data/VULNERABILITIES.csv** - Vuln tracking
- **data/INCIDENTS.csv** - Incident log
- **data/VENDORS.csv** - Vendor data

**Note:** Files are optional. TELOS adapts to whatever exists.

## Visualization Types

**Available Visualizations:**

- **Dependency Graphs** - Mermaid or D3.js network
- **Progress Tables** - shadcn/ui tables with filters
- **Metrics Cards** - Aceternity card layouts
- **Timeline Charts** - Progress over time
- **Status Dashboards** - KPI overviews
- **Relationship Networks** - Force-directed graphs
- **Bar Charts** - Recharts for comparisons
- **Line Charts** - Trend analysis

---

## Security & Privacy

**Personal TELOS:**
- NEVER commit to public repos
- NEVER share publicly
- Always backup before changes
- Use Update workflow only

**Project TELOS:**
- May contain sensitive data
- Ask before sharing externally
- Redact sensitive info in examples
- Follow PAI security protocols

---

## Key Principles

1. **Dual Context** - Handles both personal and project TELOS seamlessly
   - Personal TELOS: `~/Obsidian/TELOS/` (inside the Obsidian vault)
   - Project TELOS: User-specified directories
2. **Auto-Detection** - Determines context from user question
3. **Flexible Discovery** - Finds files regardless of structure
4. **TELOS Methodology** - Applies relationships, dependencies, goals, narratives
5. **Parallel Execution** - Up to 10 engineers for dashboard builds
6. **Visual Excellence** - Beautiful outputs with shadcn/ui + Aceternity
7. **Privacy-Aware** - Respects sensitive data
8. **Integrated** - Works with development, research, and other skills

---

**TELOS is {PRINCIPAL.NAME}'s life operating system AND project analysis framework. One skill, two powerful contexts.**

**Remember:** Personal TELOS files live at `~/Obsidian/TELOS/` inside the Obsidian vault
