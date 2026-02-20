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

### Step 0 — Detect Scope

Check if the user's request specifies a directory path or named subdirectory.

**Full-tree mode** (default — no scope specified):
- Operate across the entire project tree.
- Continue with Step 1 as written below.

**Targeted mode** (scope specified — e.g., "generate context for src/auth"):
- Resolve SCOPE_PATH relative to project root.
- In Step 1: scan only SCOPE_PATH, not the whole tree.
- In Step 1.5: build dependency map before dispatching agents.
- In Steps 2–4: dispatch agents only for SCOPE_PATH; write only that dir's CLAUDE.md.
- In Step 6: write targeted CLAUDE.md only. If root CLAUDE.md's Subsystems section
  would need updating (new subsystem not yet listed there), surface a notice:
  `"Note: Root CLAUDE.md Subsystems entry for [SCOPE_PATH] may need updating."`
  Do NOT auto-update root in targeted mode unless the user explicitly asked for it.

---

### Step 1 — Find Project Root and Build Tree Map

1. Find the project root: look for `.git` directory walking up from the current directory
2. Walk the directory tree (skip: `node_modules`, `.git`, `dist`, `build`, `.next`, `__pycache__`, `.cache`, `coverage`)
   - **Targeted mode:** walk only SCOPE_PATH, not the full project tree
3. List all existing `CLAUDE.md` files in the tree — note their paths
4. Identify subsystems using the two-question placement rule:
   **Q1:** Would an agent make at least one wrong decision in this directory without knowing its conventions, constraints, or non-obvious patterns?
   **Q2:** Is that knowledge non-obvious from reading the files themselves?
   → If YES to both: this directory gets its own CLAUDE.md and haiku agent.
   → If NO to either: include key facts in the parent CLAUDE.md's Subsystems section instead.
   *Practical guide:* Directories with code patterns, naming conventions, local constraints, or historical decisions that span files → YES. Directories that are pure write-targets, static assets, or whose content is fully self-describing → NO.

```
Example tree map:
  /project/               → root CLAUDE.md needed
  /project/src/auth/      → 8 files → haiku agent needed
  /project/src/api/       → 5 files → haiku agent needed
  /project/src/db/        → 4 files → haiku agent needed
  /project/src/utils/     → 2 files → include in root agent's file list
```

### Step 1.5 — Dependency Mapping (targeted mode only)

Before dispatching agents, map the target directory's cross-boundary dependencies.
This gives the haiku agent facts it cannot discover by reading only its own files.

**1. Extract outbound imports (what SCOPE_PATH depends on):**

Scan every file in SCOPE_PATH for import statements. Use language-agnostic patterns:
- TypeScript/JS: `import ... from`, `require(`
- Python: `import `, `from ... import`
- Go: `import (` blocks
- Rust: `use `, `mod `
- General: any path-like string referencing `../` or a sibling directory

Categorize each import:
- **External package**: a package name (not a local path) — e.g., `express`, `bcrypt`, `zod`
- **Internal dep**: a path resolving to another directory in this project — e.g., `../db/`, `@/config`

**2. Extract inbound consumers (what imports SCOPE_PATH):**

Grep the project (from root) for import statements that reference the target dir name:
```
grep -r "from.*[scope-dir-name]" --include="*.ts" .
grep -r "require.*[scope-dir-name]" .
grep -r "import.*[scope-dir-name]" .
```
List the directories of files that reference SCOPE_PATH — these are its consumers.

**3. Build dependency context:**
```
DEPENDENCY CONTEXT for [SCOPE_PATH]:
  External packages: [list — or "none"]
  Internal deps:     [dir → what is imported from it — or "none"]
  Consumed by:       [dirs that import from SCOPE_PATH — or "none / unknown"]
```

**4. Append to haiku agent prompt in Step 2:**
```
Additionally, this subsystem has the following cross-boundary dependencies:
[paste DEPENDENCY CONTEXT block]

If internal deps or consumers exist, include a ## Dependencies section in your output:
  - Depends on: [dir — reason, e.g., "src/db — User model for auth queries"]
  - Consumed by: [dir — reason, e.g., "src/api/routes — used as auth middleware"]
Only include entries that would cause an agent to fail without knowing them.
```

---

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

## Context Tree

Before working in a subsystem, read its CLAUDE.md to understand conventions.
After working in a subsystem, check its CLAUDE.md for entries your changes invalidated.

[List subdirectory CLAUDE.md files here, e.g.:]
- `src/auth/CLAUDE.md` — auth conventions, JWT handling, session patterns
- `src/api/CLAUDE.md` — route patterns, middleware order, error handling
*(Omit this section if no subdirectory CLAUDE.md files exist yet.)*

These files are not auto-loaded. Read the relevant one before working in that directory.

## Scope

This file is the root context layer — it contains only things that apply across
the entire project. Directory-specific conventions belong in that directory's
CLAUDE.md. Architectural WHY decisions belong in inline comments or ADRs.
Anything an agent can infer from reading the code belongs nowhere.

When you modify files, check if the nearest CLAUDE.md (this file or a
subdirectory's) still accurately describes the conventions and constraints.
Update stale entries before finishing your task.

---
## Context Maintenance

**After modifying files in this project:** scan the entries above — if any claim is now
false or incomplete, update this file before ending the task. Do not defer.

**Add** an entry only if an agent would fail without knowing it, it is not obvious from
the code, and applies project-wide (not just one directory).

**Remove** any entry that fails the falsifiability test: if removing it would not change
how an agent acts, remove it. If a convention here conflicts with the codebase, the
codebase wins — update this file, do not work around it. Prune aggressively.

**Staleness anchor:** This file assumes `[key_entry_point]` exists. If it doesn't, this file
is stale — update or regenerate before relying on it.

**Trigger Audit or Generate:** rename/move files → Audit; >20% of files changed →
Generate; 30+ days without touching this file → Audit.
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

## Dependencies

- Depends on: [other dir — what is used from it, e.g., "src/db — User model"]
- Consumed by: [other dir — how it uses this one, e.g., "src/api/routes — auth middleware"]

*(Omit this section if no internal cross-boundary dependencies exist.)*

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

**Add freshness timestamp** to the `## Context Maintenance` section of every file written:
```
<!-- context-layer: generated={YYYY-MM-DD} | last-audited=never | version=1 -->
```
This timestamp is machine-readable and used by the Drift workflow to detect staleness. Update `last-audited` to the current date whenever Audit runs against this file.

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
- `DesignRationale.md` — Hypothesis verdicts (H1–H6) and past RedTeam findings; read to avoid re-implementing rejected designs
