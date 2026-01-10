# PAI Memory System - Architecture Analysis

**Analysis Date:** 2026-01-09
**Version:** 1.0.0
**Status:** Active system with migration in progress

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

**MEMORY/** (created 2026-01-09 - newer, used by THEALGORITHM):
```
MEMORY/
├── State/                 # Contains algorithm-state.json
├── Work/                  # ISC files from THEALGORITHM
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

**history/** (created 2026-01-06 - older, used by hooks):
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
- `skills/THEALGORITHM/Tools/AlgorithmDisplay.ts:21-22`
- `skills/THEALGORITHM/Tools/ISCManager.ts:51`
- `skills/THEALGORITHM/Tools/RalphLoopExecutor.ts:51`

### CORE Skill
| Folder | Usage |
|--------|-------|
| `MEMORY/security/` | Security event logging |
| `MEMORY/sessions/` | Session history references |
| `MEMORY/Backups/` | Skill and config backups |

**Source files:**
- `skills/CORE/USER/PAISECURITYSYSTEM/COMMANDINJECTION.md:295`
- `skills/CORE/USER/PAISECURITYSYSTEM/PROMPTINJECTION.md:105`
- `skills/CORE/USER/PAISECURITYSYSTEM/REPOSITORIES.md:159`

### UpdatePAI Skill
| Folder | Usage |
|--------|-------|
| `history/` | Source for migration (old system) |
| `MEMORY/` | Target for migration (new system) |

**Migration commands:**
```bash
cp -r "$PAI_DIR/history/learnings"/* "$NEW_PAI_DIR/MEMORY/learnings/"
find "$PAI_DIR/history/sessions" -type f -mtime -30 -exec cp {} "$NEW_PAI_DIR/MEMORY/sessions/"
```

### Hooks (initialize-session.ts)
| Folder | Usage |
|--------|-------|
| `history/sessions` | Session initialization |
| `history/learnings` | Learning capture |
| `history/research` | Research outputs |

**CRITICAL GAP:** Hooks still write to `history/`, not `MEMORY/`.

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

| Folder | In `MEMORY/` | In `history/` | Conflict? |
|--------|--------------|---------------|-----------|
| sessions/ | Yes | Yes | **YES** |
| learnings/ | Yes | Yes | **YES** |
| research/ | Yes | Yes | **YES** |
| decisions/ | Yes | Yes | **YES** |
| execution/ | Yes | Yes | **YES** |
| raw-outputs/ | Yes | Yes | **YES** |
| State/ | Yes | No | No |
| Work/ | Yes | No | No |
| Signals/ | Yes | No | No |
| Learning/ | Yes | No | No |
| recovery/ | Yes | No | No |
| security/ | Yes | No | No |
| backups/ | Yes | No | No |

**Root Cause:** The hooks (installed from `pai-hook-system` pack) were designed for the old `history/` structure. The MEMORYSYSTEM.md documents the new canonical `MEMORY/` structure, but hooks haven't been updated.

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
| `Learning/` phase folders | Created but empty | Need curation logic |
| `Signals/` files | Defined but not written | Need signal capture hooks |
| `archive/` | Exists but no archiver | Need archival script |
| `session-events.jsonl` | Documented but missing | Main event log not created |

### Documentation Gaps

| Gap | Location | Notes |
|-----|----------|-------|
| No cleanup schedule | MEMORYSYSTEM.md | Retention defined, not enforced |
| No archival process | MEMORYSYSTEM.md | Archive folder exists, no process |
| Hook-to-memory mapping | THEHOOKSYSTEM.md | Doesn't specify which hooks write where |

---

## 10. Recommendations

### Immediate Actions

1. **Consolidate to MEMORY/**
   ```bash
   # Migrate history/ to MEMORY/
   cp -rn "$PAI_DIR/history/"* "$PAI_DIR/MEMORY/"
   ```

2. **Update hooks** to write to `MEMORY/` instead of `history/`

3. **Create cleanup script** and schedule via cron

### Future Enhancements

1. Implement signal capture in THEALGORITHM VERIFY phase
2. Add learning curation logic to bubble up insights
3. Create memory search capability
4. Add observability dashboard for memory metrics

---

## Related Documentation

- **Full architecture:** `skills/CORE/SYSTEM/MEMORYSYSTEM.md`
- **Hook configuration:** `skills/CORE/SYSTEM/THEHOOKSYSTEM.md`
- **Backup strategies:** `skills/CORE/SYSTEM/BACKUPS.md`
- **System architecture:** `skills/CORE/SYSTEM/PAISYSTEMARCHITECTURE.md`
