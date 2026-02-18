# Audit Workflow

Verifies every claim in the CLAUDE.md context layer tree against actual file content.
Uses parallel haiku agents — one per CLAUDE.md file — to check accuracy.
Auto-applies corrections across the full tree.

---

## When to Use

- CLAUDE.md exists but may be stale after code changes
- User says "update the context layer", "audit my context", "is my CLAUDE.md stale"
- After significant refactors or dependency changes
- Periodic maintenance (weekly or after major changes)

**Audit vs. Prune:** Audit checks if claims are still *accurate* (external reality). Prune checks if content is still *necessary* (internal quality). Run Audit when you suspect accuracy problems; run Prune when you suspect verbosity.

---

## Workflow Steps

### Step 1 — Find All CLAUDE.md Files

Find all CLAUDE.md files in the project tree (skip: `node_modules`, `.git`, `dist`, `build`).
Build a list: each file path + its location in the tree.

### Step 2 — Extract Claims from Each CLAUDE.md

For each CLAUDE.md file, extract all verifiable claims:
- **Command entries** — "command X does Y" — verifiable: does the command exist in package.json/Makefile?
- **File path references** — "key file is src/auth/index.ts" — verifiable: does the file exist?
- **Convention claims** — "files use kebab-case naming" — verifiable: sample actual files
- **Inline cross-boundary summaries** — "Auth owns JWT logic, entry: src/auth/" — verifiable: does src/auth/ exist? does it handle JWT? *(High rot risk per Science H3 caveat — prioritize these)*
- **Constraint claims** — "no direct DB writes from API layer" — verifiable: scan API layer imports

### Step 3 — Dispatch Parallel Haiku Agents

Dispatch one haiku agent per CLAUDE.md file simultaneously.
Use the prompt template from `HaikuAgentPattern.md` with this modification:

**Audit-specific prompt addition:**
```
You are auditing the following CLAUDE.md file for accuracy.

CLAUDE.md content:
[paste the CLAUDE.md content]

Read the files and paths referenced in this CLAUDE.md:
[list only the files/paths mentioned in the CLAUDE.md]

Return JSON:
{
  "still_accurate": ["entry text that is still correct"],
  "stale": [{"entry": "entry text", "reason": "why stale", "fix": "corrected text or empty string if should be removed"}],
  "missing": ["new high-value entry not in CLAUDE.md but found in files"]
}
```

**Scope:** Each agent reads ONLY the files/paths referenced in its assigned CLAUDE.md.
Do NOT scan the full project — only what the CLAUDE.md claims to know about.

**Missing path handling:** If a referenced path (file or directory) no longer exists on disk, do NOT attempt to read it. Instead, immediately mark every CLAUDE.md entry that references that path as stale with reason "path no longer exists on disk" and fix set to empty string (remove the entry). Do not wait for the haiku agent to discover this — check path existence before dispatching.

### Step 4 — Synthesize and Update

For each CLAUDE.md, apply agent results:
1. **Stale entries with fix provided** → replace with the corrected text
2. **Stale entries with empty fix** → remove the entry entirely
3. **Missing entries** → add to appropriate section (apply falsifiability test first)
   **Important:** Before adding "missing" entries, check if the CLAUDE.md intentionally delegates to another file (e.g., "read DEVELOPMENT.md first"). If so, entries found in that delegated file should NOT be added here — they already live in the right place. Adding them would duplicate content and create a maintenance burden.
   **Config-data directories:** If the audited directory contains only config/data files (`.json`, `.yaml`, `.toml`, `.env`, `.ini`) with no code patterns, commands, or naming conventions, the `missing` field will likely be empty or contain only data values. Data values (port numbers, timeout settings, pool sizes) fail the falsifiability test — do NOT add them. If an entire audit produces only data values in `missing`, add nothing.
4. **Still accurate entries** → keep unchanged

### Step 5 — Auto-Apply All Changes

Write updated CLAUDE.md files across the full tree.
**Auto-apply — no confirmation required.** Changes are reversible via git.

Report on completion:
```
ContextLayer Audit complete:
  Files checked: N
  Files updated: M
  Entries removed (stale): X
  Entries corrected: Y
  Entries added (missing): Z
```

If zero changes: "All CLAUDE.md files are accurate — no changes needed."

---

## Reference Files

- `HaikuAgentPattern.md` — Prompt template, JSON schema, retry/fallback spec
- `ScanProtocol.md` — Falsifiability test for evaluating "missing" entries before adding
