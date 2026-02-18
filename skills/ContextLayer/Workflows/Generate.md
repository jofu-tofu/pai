# Generate Workflow

Creates or rebuilds the full CLAUDE.md context layer tree for a project.
Uses parallel haiku agents per subsystem to read actual file content.

---

## When to Use

- Project has no CLAUDE.md and needs one created
- Existing CLAUDE.md is so outdated it's faster to rebuild than audit
- User says "generate a CLAUDE.md", "create context layer", "set up context"

---

## Workflow Steps

### Step 1 — Find Project Root and Build Tree Map

1. Find the project root: look for `.git` directory walking up from the current directory
2. Walk the directory tree (skip: `node_modules`, `.git`, `dist`, `build`, `.next`, `__pycache__`, `.cache`, `coverage`)
3. List all existing `CLAUDE.md` files in the tree — note their paths
4. Identify subsystems: top-level directories with 3+ files of their own

```
Example tree map:
  /project/               → root CLAUDE.md needed
  /project/src/auth/      → 8 files → haiku agent needed
  /project/src/api/       → 5 files → haiku agent needed
  /project/src/db/        → 4 files → haiku agent needed
  /project/src/utils/     → 2 files → include in root agent's file list
```

### Step 2 — Dispatch Parallel Haiku Agents

Dispatch one agent per subsystem AND one root-level agent simultaneously.
Use the exact prompt template from `HaikuAgentPattern.md`.

**Root-level agent reads:**
- `package.json` (scripts section)
- `README.md` (Getting Started / Development / Running sections)
- `Makefile`, `justfile`, or `Taskfile.yml` (if present)
- `.nvmrc`, `.tool-versions`, `.python-version` (if present)
- Top-level source files (not subdirectory contents)

**Per-subsystem agent reads** (per HaikuAgentPattern.md dispatch rules):
- Entry file for the subsystem
- Config file (if any)
- 1-2 representative implementation files
- Maximum 6 files total per agent

**Collect all JSON results before proceeding to Step 3.**
Failed agents → apply retry protocol from `HaikuAgentPattern.md`.

### Step 3 — Synthesize Root CLAUDE.md

From root-level agent results + cross-subsystem knowledge, synthesize root CLAUDE.md:

```markdown
# [Project Name]

## Commands

| Command | Purpose |
|---------|---------|
| [cmd] | [purpose] |

## Conventions

- [project-specific convention 1]
- [project-specific convention 2]

## File Structure

```
[top-level directory tree with 1-line annotations]
```

## Subsystems

- **[Name]:** [what it owns] (entry: [path])

## Constraints

- [hard prohibition or requirement]

## Scope

This file is the root context layer — it contains only things that apply across
the entire project. Directory-specific conventions belong in that directory's
CLAUDE.md. Architectural WHY decisions belong in inline comments or ADRs.
Anything an agent can infer from reading the code belongs nowhere.

---
## Context Maintenance

**Remove** any entry that fails the falsifiability test: if removing a line would not
change how an agent works in this project, remove it. If a convention here conflicts
with the actual codebase, the codebase wins — update this file to match, do not work
around it. Prune aggressively. This file should shrink as the codebase matures.

**Add** an entry here only if it would cause an agent to fail without knowing it, is
not obvious from the code, and applies project-wide (not just one directory).

**When to trigger a full Audit or Generate:** after renaming directories, after major
refactors (>20% of files changed), or after 30+ days without touching this file.
```

**Apply falsifiability test** (from `ScanProtocol.md`) to every entry before writing.
**Check budget** (from `BudgetModel.md`): root CLAUDE.md target is 800–1500 tokens.

### Step 4 — Synthesize Subdirectory CLAUDE.md Files

For each subsystem with its own haiku agent result:

```markdown
# [Directory Name]

## Commands

| Command | Purpose |
|---------|---------|

## Conventions

- [local convention]

## Key Files

| File | Role |
|------|------|
| [path] | [role] |

## Constraints

- [local constraint]

## Scope

This file covers only conventions and constraints specific to this directory.
Project-wide rules belong in the root CLAUDE.md. WHY decisions belong in
inline comments. Anything inferable from reading the code belongs nowhere.

---
## Context Maintenance

This file is intentionally slim. [... same template as root, from PruningInstruction.md ...]
```

**Budget check:** Each subdir CLAUDE.md targets 200–500 tokens.
Skip sections with no content — do not include empty tables.

### Step 5 — Apply Falsifiability Filter

Before writing any file, for each entry:
1. Apply primary test: "If removed, would agent behavior degrade in a way I'd notice?"
2. Apply secondary test: "Would removing this cause wrong behavior even 10% of the time in this project?"
3. Remove entries that fail both tests

### Step 6 — Write All Files

Write root CLAUDE.md and all subdirectory CLAUDE.md files.
**Overwrite behavior:** If a CLAUDE.md already exists at the target path, overwrite it completely. Generate creates the authoritative context from scratch — do not merge with existing content. If you want to preserve existing content, use Audit instead.
**Auto-apply — no confirmation required.** Changes are reversible via git.

Report on completion:
```
ContextLayer Generate complete:
  Files created/updated: N
  Root CLAUDE.md: ~X tokens
  Subdirectory files: N files, ~X tokens average
  Entries removed by falsifiability filter: N
```

---

## Reference Files

- `ScanProtocol.md` — Scan order and falsifiability test rules
- `BudgetModel.md` — Token budget enforcement
- `HaikuAgentPattern.md` — Exact prompt template, JSON schema, retry/fallback
- `PruningInstruction.md` — Template to embed at bottom of each file
