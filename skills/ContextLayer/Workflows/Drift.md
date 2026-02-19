# Drift Workflow

Detects staleness in the CLAUDE.md context layer tree using git history.
**No haiku agents. No source file reads. Cheap to run anytime.**

---

## When to Use

- "Is my context up to date?"
- "When was my CLAUDE.md last updated?"
- "Check if my context is stale"
- Before deciding whether to run Audit (Drift tells you *if* you need it; Audit does the actual verification)
- After adding new skills, directories, or modules
- After any significant refactor

**Drift vs. Audit:** Drift uses git log to detect *potential* staleness — it cannot verify accuracy, only flag risk. Audit reads actual files to verify and correct. Run Drift first; run Audit on the flagged files.

---

## Workflow Steps

### Step 1 — Find All CLAUDE.md Files

Find all CLAUDE.md files in the project tree (skip: `node_modules`, `.git`, `dist`, `build`).
For each file, record:
- Path
- Last git modification date: `git log -1 --format="%ai" -- {path}`

### Step 2 — Find Directories Without CLAUDE.md

Walk the project tree (same skip-list as Step 1).
For each directory with 3+ files of its own that has NO CLAUDE.md:
- Flag as: `"[MISSING] {dir} — no CLAUDE.md, {N} files"`

These are gaps in the coverage, not staleness — but surface them alongside staleness results.

### Step 3 — Check Git Activity Since Last Update

For each CLAUDE.md found in Step 1, check what changed in its covered directory since the CLAUDE.md was last updated:

```
git log --oneline --since="{CLAUDE.md last modified date}" -- {directory}/
```

- **0 commits:** No activity since last update → mark `FRESH`
- **1–5 commits:** Low activity → mark `LOW DRIFT` (probably fine)
- **6–20 commits:** Moderate activity → mark `MODERATE DRIFT` (consider Audit)
- **21+ commits:** High activity → mark `HIGH DRIFT` (run Audit)

Also check for structural changes (new directories added since last CLAUDE.md update):
```
git log --oneline --diff-filter=A --since="{date}" --name-only -- {directory}/
```
If new subdirectories appear: mark `STRUCTURAL CHANGE` regardless of commit count.

### Step 4 — Check Freshness Timestamps (if present)

If a CLAUDE.md contains a line matching `<!-- context-layer: generated=... -->`:
- Parse the `last-audited` field
- If `last-audited=never` and file is >30 days old: add `NEVER AUDITED` flag
- If `last-audited` date is >60 days ago: add `AUDIT OVERDUE` flag

### Step 5 — Report

Output a staleness report:

```
ContextLayer Drift Report — {date}

FRESH (no action needed):
  ✓ {path} — last updated {date}, {N} commits since = 0

LOW DRIFT (monitor):
  ~ {path} — last updated {date}, {N} commits since update

MODERATE DRIFT (consider Audit):
  ⚠ {path} — last updated {date}, {N} commits since update
  ⚠ {path} — AUDIT OVERDUE (last audited {date})

HIGH DRIFT (run Audit):
  ✗ {path} — last updated {date}, {N} commits since update
  ✗ {path} — STRUCTURAL CHANGE: new directories added since last update
  ✗ {path} — NEVER AUDITED ({N} days since generation)

MISSING COVERAGE:
  ✗ {dir} — no CLAUDE.md, {N} files

Recommended actions:
  Run Audit on: [{list of HIGH DRIFT and STRUCTURAL CHANGE paths}]
  Consider Audit on: [{list of MODERATE DRIFT paths}]
  Consider Generate for: [{list of MISSING COVERAGE dirs}]
```

**No files are modified by Drift.** It is read-only. All changes happen in Audit or Generate.

---

## Reference Material

No context files required — Drift reads only git metadata and CLAUDE.md file headers. No haiku agents, no source reads.

---

## Notes

- Drift can run on a schedule (daily via a hook or script) with no side effects
- Drift output is a diagnostic, not a verdict — LOW DRIFT files may still have subtle inaccuracies
- If git is not available or the project is not a git repository, skip Steps 1–4 and report: "Git history unavailable — cannot assess drift. Run Audit to verify accuracy directly."
