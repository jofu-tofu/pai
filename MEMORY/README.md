# PAI Memory System - Architecture Analysis

**Analysis Date:** 2026-01-13
**Version:** 1.1.0
**Status:** Active system with partial migration complete

---

## Executive Summary

The PAI memory system is designed as a **three-tier architecture** (Hot/Warm/Cold) for managing session history, learnings, operational state, and per-task work. However, this analysis reveals a **critical architectural discrepancy**: two parallel memory systems exist due to an incomplete migration from the legacy `history/` system to the canonical `MEMORY/` system.

---

## 1. File Structure (Canonical vs Actual)

### Canonical Structure (Documented in MEMORYSYSTEM.md)

```
$PAI_DIR/MEMORY/
├── research/              # Deep research outputs (YYYY-MM subdirs)
├── sessions/              # Session summaries (YYYY-MM subdirs)
├── learnings/             # Learning artifacts
├── decisions/             # Architecture Decision Records
├── execution/             # Task execution logs
├── security/              # Security event logs
├── recovery/              # Recovery snapshots & journals
│   ├── journal/YYYY-MM-DD.jsonl
│   ├── snapshots/YYYY-MM-DD/
│   └── index.json
├── raw-outputs/           # JSONL event streams (YYYY-MM subdirs)
├── backups/               # Pre-refactoring backups
├── archive/               # Compressed historical archives
├── analysis/              # Analysis documents
├── ideas/                 # Brainstorm captures
├── releases/              # Release notes
├── skills/                # Skill-related history
├── session-events.jsonl   # Main session event log
├── Learning/              # Phase-based curated learnings (Warm tier)
│   ├── OBSERVE/
│   ├── THINK/
│   ├── PLAN/
│   ├── BUILD/
│   ├── EXECUTE/
│   ├── VERIFY/
│   ├── ALGORITHM/
│   └── sessions/
├── State/                 # Real-time operational state (Hot tier)
│   ├── algorithm-stats.json
│   ├── algorithm-streak.json
│   ├── format-streak.json
│   ├── last-judge-rating.json
│   └── active-work.json
├── Signals/               # Pattern detection & anomalies
│   ├── failures.jsonl
│   ├── loopbacks.jsonl
│   ├── patterns.jsonl
│   ├── ratings.jsonl
│   └── agent-routing.jsonl
└── Work/                  # Per-task active memory
    └── [Task-Name_TIMESTAMP]/
        ├── Work.md
        ├── IdealState.jsonl
        ├── TRACE.jsonl
        ├── Output/
        └── Learning/
```

### Actual Current Structure (Local Installation)

**MEMORY/** (created 2026-01-09 - canonical location):
```
MEMORY/
├── State/                 # Algorithm state tracking
├── Work/                  # Per-task ISC files from THEALGORITHM
├── backups/
├── decisions/
├── execution/
├── learnings/
├── raw-outputs/
├── recovery/
├── research/
├── security/
├── sessions/
└── README.md
```

**Note:** The following directories documented in MEMORYSYSTEM.md do NOT yet exist:
- Learning/ (phase-based curated learnings)
- Signals/ (pattern detection)
- archive/ (compressed archives)
- analysis/ (analysis documents)
- ideas/ (brainstorm captures)
- releases/ (release notes)
- skills/ (skill-related history)
- session-events.jsonl (main event log)

**history/** (created 2026-01-06 - legacy location, still used by hooks):
```
history/
├── decisions/
├── execution/
├── learnings/
├── raw-outputs/
├── research/
├── sessions/
└── Upgrades.jsonl
```

---

## 2. What Each Folder Stores

| Folder | Contents | Format |
|--------|----------|--------|
| **research/** | Deep research outputs, investigations | Markdown (YYYY-MM subdirs) |
| **sessions/** | Session summaries captured at session end | Markdown with YAML frontmatter |
| **learnings/** | Extracted insights from sessions | Markdown with structured headers |
| **decisions/** | Architecture Decision Records (ADRs) | Markdown |
| **execution/** | Task/feature/bug execution logs | Markdown |
| **security/** | Security events and audit logs | JSONL |
| **recovery/** | Recovery snapshots, journals | JSONL + snapshots |
| **raw-outputs/** | All event streams from hooks | JSONL (by date) |
| **backups/** | Pre-change state backups | Various |
| **archive/** | Compressed old data | Tar/gzip |
| **State/** | Operational state (algorithm stats, streaks) | JSON |
| **Signals/** | Pattern detection (failures, loopbacks) | JSONL |
| **Work/** | Per-task ISC, traces, deliverables | JSON + Markdown |
| **Learning/** | Phase-organized curated insights | Markdown (by phase) |

---

## 3. Which Skills Use Which Folders

### THEALGORITHM Skill
| Folder | Usage |
|--------|-------|
| `MEMORY/Work/` | ISC storage (`current-isc.json`), archived ISCs |
| `MEMORY/State/` | Algorithm state, streaks, stats |
| `MEMORY/Learning/ALGORITHM/` | Algorithm-specific learnings |
| `MEMORY/Signals/` | Failure tracking, loopback patterns |

**Source files:**
- `skills/THEALGORITHM/Tools/AlgorithmDisplay.ts` (verified exists)
- `skills/THEALGORITHM/Tools/ISCManager.ts` (verified exists)
- `skills/THEALGORITHM/Tools/RalphLoopExecutor.ts` (verified exists)

### CORE Skill
| Folder | Usage |
|--------|-------|
| `MEMORY/security/` | Security event logging |
| `MEMORY/sessions/` | Session history references |
| `MEMORY/backups/` | Skill and config backups |

**Source files:**
- `skills/CORE/USER/PAISECURITYSYSTEM/COMMANDINJECTION.md` (verified exists)
- `skills/CORE/USER/PAISECURITYSYSTEM/PROMPTINJECTION.md` (verified exists)
- `skills/CORE/USER/PAISECURITYSYSTEM/REPOSITORIES.md` (verified exists)

**Note:** Actual directory is `MEMORY/backups/` (lowercase), not `MEMORY/Backups/`.

### UpdatePAI Skill
| Folder | Usage |
|--------|-------|
| `history/` | Source for migration (old system) |
| `MEMORY/` | Target for migration (new system) |

**Migration references:**
Migration commands found in:
- `skills/UpdatePAI/Workflows/HybridUpdate.md` (verified exists)
- `skills/UpdatePAI/Workflows/AutoUpdate.md` (verified exists)

These workflows contain migration logic to copy data from `history/` to `MEMORY/`.

### Hooks (hooks/)
| Hook File | Folder | Usage |
|-----------|--------|-------|
| `initialize-session.ts` | `history/sessions` | Creates session directories on session start |
| `capture-session-summary.ts` | `history/sessions` | Captures session summaries on session end |
| `capture-all-events.ts` | `history/raw-outputs` | Captures all hook events |
| `stop-hook.ts` | `history/sessions` | Session cleanup |

**CRITICAL GAP:** Hooks still write to `history/`, not `MEMORY/`.

**Source verification:**
- Lines 116-119 in `initialize-session.ts` reference `history/sessions`, `history/learnings`, `history/research`
- Line 57 in `capture-session-summary.ts` references `history/raw-outputs`
- Line 124 in `capture-session-summary.ts` uses `history/` directory
- Line 133 in `capture-session-summary.ts` writes to `history/sessions`

---

## 4. Memory Type Classification

### Session Memory (Ephemeral - Single Session)
| Location | Purpose | Lifecycle |
|----------|---------|-----------|
| `Work/[Task-Name]/` | Active task ISC, traces | Duration of task |
| `State/active-work.json` | Current work pointer | Session duration |
| `.current-session` | Session marker file | Session duration |

### Inter-Session Memory (Persistent - Cross-Session)
| Location | Purpose | Lifecycle |
|----------|---------|-----------|
| `sessions/` | Session summaries | 90-day rolling |
| `learnings/` | Extracted insights | Permanent |
| `Learning/` | Phase-curated learnings | Permanent |
| `State/algorithm-stats.json` | Cumulative statistics | Permanent |
| `State/algorithm-streak.json` | Streak tracking | Permanent |
| `Signals/` | Pattern detection | Aggregated weekly |
| `research/` | Research outputs | Permanent |
| `decisions/` | ADRs | Permanent |
| `security/` | Audit logs | Permanent |

---

## 5. Overlap Analysis

### CRITICAL: Duplicate Memory Systems

| Folder | In `MEMORY/` | In `history/` | Conflict? | Status |
|--------|--------------|---------------|-----------|--------|
| sessions/ | Yes | Yes | **YES** | Both exist, hooks write to history/ |
| learnings/ | Yes | Yes | **YES** | Both exist, hooks reference history/ |
| research/ | Yes | Yes | **YES** | Both exist, hooks reference history/ |
| decisions/ | Yes | Yes | **YES** | Both exist |
| execution/ | Yes | Yes | **YES** | Both exist |
| raw-outputs/ | Yes | Yes | **YES** | Both exist, hooks write to history/ |
| State/ | Yes | No | No | Only in MEMORY/ |
| Work/ | Yes | No | No | Only in MEMORY/ |
| Signals/ | No* | No | No | Documented but not created |
| Learning/ | No* | No | No | Documented but not created |
| recovery/ | Yes | No | No | Only in MEMORY/ |
| security/ | Yes | No | No | Only in MEMORY/ |
| backups/ | Yes | No | No | Only in MEMORY/ |
| archive/ | No* | No | No | Documented but not created |
| analysis/ | No* | No | No | Documented but not created |
| ideas/ | No* | No | No | Documented but not created |
| releases/ | No* | No | No | Documented but not created |
| skills/ | No* | No | No | Documented but not created |

**Root Cause:** The hooks write to `history/` structure. MEMORYSYSTEM.md documents the canonical `MEMORY/` structure, but hooks haven't been updated to use it.

**Verified via code inspection:**
- `initialize-session.ts` lines 116-119 create `history/sessions`, `history/learnings`, `history/research`
- `capture-session-summary.ts` lines 57, 124, 133 reference `history/` directories
- No hooks currently write to `MEMORY/` directories

### Overlap Consequences

1. **Data Fragmentation:** Session data split between two locations
2. **Inconsistent Reads:** Skills read from MEMORY/ but hooks write to history/
3. **Migration Incomplete:** UpdatePAI has migration scripts but they're not auto-run
4. **Stale history/:** Older data in history/, newer structure in MEMORY/

---

## 6. Retention Policies

### Documented Retention (from README.md)

| Directory | Retention | Type |
|-----------|-----------|------|
| `research/` | **Permanent** | Cold storage |
| `sessions/` | **Rolling 90 days** | Warm storage |
| `learnings/` | **Permanent** | Cold storage |
| `decisions/` | **Permanent** | Cold storage |
| `execution/` | **Rolling 30 days** | Warm storage |
| `security/` | **Permanent** | Cold/Compliance |
| `recovery/` | **Rolling 7 days** | Hot/Recovery |
| `raw-outputs/` | **Rolling 7 days** | Hot/Debug |
| `backups/` | **As needed** | Manual |
| `State/` | **Active** | Hot/Real-time |

### Storage Temperature Model

```
HOT (Real-time, <7 days)
├── Work/          → Per-task active memory
├── State/         → Operational state
├── recovery/      → Recovery snapshots (7 days)
└── raw-outputs/   → Event streams (7 days)

WARM (Aggregated, 30-90 days)
├── sessions/      → Session summaries (90 days)
├── execution/     → Task logs (30 days)
├── Learning/      → Phase-curated insights
└── Signals/       → Weekly pattern aggregation

COLD (Permanent archive)
├── research/      → Investigation reports
├── learnings/     → Permanent insights
├── decisions/     → ADRs
├── security/      → Audit logs
└── archive/       → Compressed old data
```

---

## 7. Cleanup Mechanisms

### Current State: **NO AUTOMATED CLEANUP EXISTS**

**Evidence:**
1. No cron jobs or scheduled tasks found
2. No cleanup scripts in hooks/
3. No cleanup tool in THEALGORITHM/Tools/
4. Retention policies are documented but **not enforced**

### Manual Cleanup (from UpdatePAI)

The only cleanup-like behavior is in the migration scripts:
```bash
# Only copies sessions from last 30 days during migration
find "$PAI_DIR/history/sessions" -type f -mtime -30 -exec cp {} ...
```

This provides implicit cleanup during updates but is **not automatic**.

### Recommended Cleanup Implementation

```bash
# Should exist but doesn't: $PAI_DIR/scripts/memory-cleanup.sh

# Remove raw-outputs older than 7 days
find "$PAI_DIR/MEMORY/raw-outputs" -type f -mtime +7 -delete

# Remove recovery older than 7 days
find "$PAI_DIR/MEMORY/recovery" -type f -mtime +7 -delete

# Remove sessions older than 90 days
find "$PAI_DIR/MEMORY/sessions" -type f -mtime +90 -delete

# Remove execution logs older than 30 days
find "$PAI_DIR/MEMORY/execution" -type f -mtime +30 -delete

# Archive old months
tar -czf "$PAI_DIR/MEMORY/archive/YYYY-MM.tar.gz" ...
```

---

## 8. Future Development Potential

Based on the architecture, here's what the structure suggests for future development:

### Near-Term (Structure Already Exists)

1. **Learning/ Phase System** - Structure exists but appears unused
   - Could auto-categorize learnings by algorithm phase
   - Enable phase-specific retrieval during THEALGORITHM execution

2. **Signals/ Pattern Detection** - Files defined but not populated
   - `failures.jsonl` - Could track VERIFY failures
   - `loopbacks.jsonl` - Could track iteration patterns
   - `patterns.jsonl` - Could aggregate weekly patterns
   - `ratings.jsonl` - Could capture user ratings

3. **Work/ Task Memory** - Partially implemented
   - ISC stored but traces not captured
   - Could implement full decision trace logging

### Medium-Term (Structural Support Implied)

4. **Automated Archival**
   - `archive/` exists but no archival scripts
   - Compress monthly data automatically

5. **Memory Consolidation**
   - Merge `history/` into `MEMORY/`
   - Update hooks to write to `MEMORY/`
   - Remove duplicate structures

6. **Cross-Session Learning**
   - Use `Learning/` folders to improve future sessions
   - Retrieve relevant learnings based on current task phase

### Long-Term (Architecture Supports)

7. **Memory Search/Retrieval**
   - Index all markdown/JSONL files
   - Enable semantic search across memory

8. **Memory-Informed Planning**
   - Use `Signals/patterns.jsonl` to adjust effort classification
   - Learn from past failures to improve ISC creation

9. **Audit & Compliance**
   - `security/` could support full audit trails
   - Decision provenance through `decisions/`

---

## 9. Known Issues & Gaps

### Critical Issues

| Issue | Impact | Resolution |
|-------|--------|------------|
| Dual memory systems (`MEMORY/` vs `history/`) | Data fragmentation | Run migration, update hooks |
| No cleanup automation | Unbounded storage growth | Implement scheduled cleanup |
| Hooks write to wrong location | THEALGORITHM can't access hook data | Update hook paths |

### Structural Gaps

| Gap | Status | Notes |
|-----|--------|-------|
| `Learning/` phase folders | **Not created** | Documented in MEMORYSYSTEM.md but directories don't exist |
| `Signals/` files | **Not created** | Documented in MEMORYSYSTEM.md but directory doesn't exist |
| `archive/` | **Not created** | Documented in MEMORYSYSTEM.md but directory doesn't exist |
| `analysis/` | **Not created** | Documented in MEMORYSYSTEM.md but directory doesn't exist |
| `ideas/` | **Not created** | Documented in MEMORYSYSTEM.md but directory doesn't exist |
| `releases/` | **Not created** | Documented in MEMORYSYSTEM.md but directory doesn't exist |
| `skills/` | **Not created** | Documented in MEMORYSYSTEM.md but directory doesn't exist |
| `session-events.jsonl` | **Not created** | Documented in MEMORYSYSTEM.md but file doesn't exist |

### Documentation Gaps

| Gap | Location | Notes |
|-----|----------|-------|
| No cleanup schedule | MEMORYSYSTEM.md | Retention defined, not enforced |
| No archival process | MEMORYSYSTEM.md | Archive folder documented but not created, no process exists |
| Hook-to-memory mapping | hooks/ | Hooks write to `history/` but docs specify `MEMORY/` |
| Undocumented directories | MEMORYSYSTEM.md | Several documented directories don't exist in actual installation |

---

## 10. Recommendations

### Immediate Actions

1. **Update hooks to write to MEMORY/**
   - Modify `initialize-session.ts` lines 116-119 to create MEMORY/ subdirectories
   - Modify `capture-session-summary.ts` lines 57, 124, 133 to write to MEMORY/
   - Update all other hooks that reference history/

2. **Create missing MEMORY/ directories**
   ```bash
   mkdir -p "$PAI_DIR/MEMORY/Learning"/{OBSERVE,THINK,PLAN,BUILD,EXECUTE,VERIFY,ALGORITHM,sessions}
   mkdir -p "$PAI_DIR/MEMORY/Signals"
   mkdir -p "$PAI_DIR/MEMORY/archive"
   mkdir -p "$PAI_DIR/MEMORY/analysis"
   mkdir -p "$PAI_DIR/MEMORY/ideas"
   mkdir -p "$PAI_DIR/MEMORY/releases"
   mkdir -p "$PAI_DIR/MEMORY/skills"
   ```

3. **Optional: Consolidate existing history/ data into MEMORY/**
   ```bash
   # After hooks are updated, migrate existing history data
   cp -rn "$PAI_DIR/history/"* "$PAI_DIR/MEMORY/"
   ```

4. **Create cleanup script** and schedule for retention enforcement

### Future Enhancements

1. **Implement signal capture** in THEALGORITHM VERIFY phase
   - Create `Signals/failures.jsonl`, `Signals/loopbacks.jsonl`, etc.
   - Add signal capture hooks to algorithm execution

2. **Add learning curation logic** to bubble up insights
   - Implement logic to move learnings from Work/ to Learning/ by phase
   - Create automated curation based on generalizability criteria

3. **Create memory search capability**
   - Index all markdown/JSONL files
   - Enable semantic search across memory tiers

4. **Deprecate history/ directory**
   - Once hooks are updated and data migrated, remove history/ directory
   - Update all documentation to remove history/ references

---

## 11. Verification Summary (2026-01-13)

### Files and Directories Verified

**Existing in MEMORY/:**
- backups/ (created 2026-01-09)
- decisions/ (created 2026-01-09)
- execution/ (created 2026-01-09)
- learnings/ (created 2026-01-09)
- raw-outputs/ (created 2026-01-09)
- recovery/ (created 2026-01-09)
- research/ (created 2026-01-09)
- security/ (created 2026-01-09)
- sessions/ (created 2026-01-09)
- State/ (created 2026-01-11)
- Work/ (created 2026-01-12, contains algorithm-a1-implementation/)
- README.md (last updated 2026-01-12)

**Existing in history/:**
- decisions/ (created 2026-01-06)
- execution/ (created 2026-01-06)
- learnings/ (created 2026-01-06)
- raw-outputs/ (created 2026-01-06)
- research/ (created 2026-01-07)
- sessions/ (created 2026-01-06)
- Upgrades.jsonl (created 2026-01-06)

**Documented but NOT existing:**
- MEMORY/Learning/ and all phase subdirectories
- MEMORY/Signals/ and all signal files
- MEMORY/archive/
- MEMORY/analysis/
- MEMORY/ideas/
- MEMORY/releases/
- MEMORY/skills/
- MEMORY/session-events.jsonl

### Hook Verification

All hooks verified in `C:\Users\fujos\pai\hooks\`:
- capture-all-events.ts
- capture-session-summary.ts (writes to history/raw-outputs and history/sessions)
- cleanup-temp-files.ts
- initialize-session.ts (creates history/sessions, history/learnings, history/research)
- load-core-context.ts
- security-validator.ts
- stop-hook.ts
- subagent-stop-hook.ts
- update-tab-titles.ts

**Confirmed:** Hooks write to `history/`, not `MEMORY/`.

### Source Code Verification

All referenced source files verified to exist:
- skills/THEALGORITHM/Tools/AlgorithmDisplay.ts
- skills/THEALGORITHM/Tools/ISCManager.ts
- skills/THEALGORITHM/Tools/RalphLoopExecutor.ts
- skills/CORE/USER/PAISECURITYSYSTEM/COMMANDINJECTION.md
- skills/CORE/USER/PAISECURITYSYSTEM/PROMPTINJECTION.md
- skills/CORE/USER/PAISECURITYSYSTEM/REPOSITORIES.md
- skills/UpdatePAI/Workflows/HybridUpdate.md
- skills/UpdatePAI/Workflows/AutoUpdate.md

### Key Findings

1. **Dual memory systems confirmed**: Both MEMORY/ and history/ exist and are actively used
2. **Hooks use history/**: All session capture hooks write to history/ directories
3. **Partial implementation**: Only core directories exist in MEMORY/, advanced features (Learning/, Signals/) not yet implemented
4. **Documentation accuracy**: MEMORYSYSTEM.md describes ideal state, not current state
5. **Migration incomplete**: Data exists in both locations, creating fragmentation

---

## Related Documentation

- **Full architecture:** `skills/CORE/SYSTEM/MEMORYSYSTEM.md`
- **Hook configuration:** `skills/CORE/SYSTEM/THEHOOKSYSTEM.md`
- **Backup strategies:** `skills/CORE/SYSTEM/BACKUPS.md`
- **System architecture:** `skills/CORE/SYSTEM/PAISYSTEMARCHITECTURE.md`
