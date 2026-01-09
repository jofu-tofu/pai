# UpdatePAI Quick Start Guide

**Autonomous PAI system updates** in 5-10 minutes with minimal user thinking.

## ⚡ What's New in v2.0

**Fully Autonomous Updates** - Just say "Update PAI" and let automation handle everything:
- ✅ Pre-flight analysis runs automatically
- ✅ Smart defaults for all decisions
- ✅ Only 3 critical decisions required
- ✅ Completes in 5-10 minutes
- ✅ Zero manual commands needed

## 🚀 Quick Start

### The Simplest Way (NEW - Autonomous)

```
User: "Update PAI system"
```

That's it! The AutoUpdate workflow will:
1. **Analyze automatically** - Detect version, parse commits, calculate complexity
2. **Ask 3 questions** - DAIDENTITY (if new), install new packs?, final approval
3. **Execute automatically** - Backup, install, migrate, test, switch
4. **Complete in 5-10 min** - No manual steps required

### What You'll Be Asked

**Only 3 critical decisions:**

1. **DAIDENTITY** (only if you don't have one)
   - AI Name (e.g., "Aria")
   - Display Name
   - Color (hex code)
   - Voice ID (optional)

2. **New Packs?** (only packs NOT currently installed)
   - Example: "Browser, Algorithm, Prompting available. Install? (y/n)"

3. **Final Approval**
   - Shows summary
   - Estimated time
   - Press 'y' to proceed

## Workflows

| Workflow | When to Use | Time |
|----------|-------------|------|
| **AutoUpdate** ⭐ | Standard update (DEFAULT - autonomous) | 5-10 min |
| **Analyze** | Check what's changed before updating | 1 min |
| **Backup** | Create safety backup before manual changes | 2 min |
| **HybridUpdate** | Manual alternative if you want control | 1-2 hours |
| **FreshInstall** | Clean slate for corrupted installations | 30 min |
| **Verify** | Check installation health | 1 min |

## Example Workflows

### 1. Autonomous Update (Recommended)

```
User: "Update PAI to latest version"

[Automated pre-flight analysis]
- Detecting version: v1
- Analyzing commits: 47 commits, 3 breaking changes
- Calculating complexity: medium (score: 5)
- Detecting packs: Browser, THEALGORITHM, Prompting
- Identifying customs: EpicCode, EpicGit, EpicWiki

[Critical decisions - consolidated prompt]
✓ DAIDENTITY exists - will reuse
✓ No new packs available
? Ready to proceed? (y/n): y

[Automated execution]
✓ Backup created: ~/.pai-backups/pai-backup-20260109-150322
✓ Core installed in: /c/EpicSource/pai-v2-20260109
✓ DAIDENTITY migrated
✓ Custom skills preserved (3)
✓ History migrated (learnings + 30 days)
✓ Settings auto-merged
✓ Path references updated (12 files)
✓ Automated tests passed (18/18)
✓ PAI_DIR updated

[Complete!]
→ Restart Claude Code to activate new installation
→ Total time: 7 minutes
```

### 2. Analyze Before Updating

```
User: "What's changed in latest PAI?"

[Analysis runs automatically]
- Current version: v1
- Latest version: v2.1.1
- Commits behind: 47
- Breaking changes: 3
  - pai-history-system retirement
  - CORE restructuring (USER/SYSTEM)
  - MEMORY flattening
- New features available:
  - Voice system
  - Algorithm pack updates
  - Security system (PAISECURITYSYSTEM)
- Recommended: AutoUpdate workflow
- Estimated time: 8-10 minutes
```

### 3. Verify After Update

```
User: "Verify PAI installation"

[Automated verification suite]
✓ PAI_DIR exists
✓ skills/ directory exists
✓ MEMORY/ directory exists
✓ CORE skill exists
✓ USER/ directory exists
✓ DAIDENTITY.md exists
✓ Hook system installed
✓ Settings valid
✓ No History/ subdirectory (correct for v2)

Result: All tests passed! Installation verified.
```

## What's Automated

**v2.0 automates everything except critical decisions:**

| Task | v1.0 (Manual) | v2.0 (Autonomous) |
|------|---------------|-------------------|
| Version detection | Manual check | ✅ Automated |
| Breaking change analysis | Manual git log | ✅ Automated |
| Complexity calculation | Manual estimate | ✅ Automated |
| Backup creation | Manual commands | ✅ Automated |
| Custom skill detection | Manual list | ✅ Automated |
| Pack detection | Manual check | ✅ Automated |
| History migration | Interactive prompt | ✅ Smart default (learnings + 30 days) |
| Settings merge | Manual diff/merge | ✅ Auto-merge with conflict detection |
| Path updates | Manual find/replace | ✅ Auto-fix (6 patterns) |
| Testing | Manual verification | ✅ Automated test suite (18 tests) |
| Env var update | Manual PowerShell | ✅ Automated cross-platform |
| **Total time** | **1-2 hours** | **5-10 minutes** |
| **User decisions** | **9+ manual steps** | **3 critical decisions** |

## Automation Tools

UpdatePAI v2.0 includes 9 automation scripts in `Tools/`:

1. **detect-version.sh** - Auto-detect v1.x vs v2.x
2. **analyze-breaking-changes.sh** - Parse git commits
3. **calculate-complexity.sh** - Assess difficulty
4. **detect-packs.sh** - Find installed packs
5. **identify-custom-skills.sh** - Find custom skills
6. **merge-settings.sh** - Auto-merge settings
7. **update-paths.sh** - Auto-fix path references
8. **test-installation.sh** - Automated verification
9. **update-env-var.sh** - Update PAI_DIR automatically

## Prerequisites

- Repository clone at `C:\EpicSource\Github\Personal_AI_Infrastructure`
- Git pull to latest version
- 5-10 GB free disk space for backups
- **jq** (for JSON processing) - `apt install jq` or `brew install jq`

## Breaking Changes Handled Automatically

v2.0 detects and handles these breaking changes automatically:

1. **pai-history-system retirement** → Migrated to MEMORY
2. **CORE restructuring** → Flat files moved to USER/SYSTEM
3. **MEMORY flattening** → Removed History/ parent directory
4. **DAIDENTITY requirement** → Reuses existing or creates new
5. **Security system** → PAISECURITYSYSTEM installed
6. **Hook updates** → Paths updated automatically
7. **Settings changes** → Auto-merged with conflict detection

## Custom Skills Preserved

All custom skills are auto-detected and preserved:
- ✅ EpicCode
- ✅ EpicGit
- ✅ EpicWiki
- ✅ Any user-created skills

## Rollback

If issues occur after update:

```bash
# Automatic rollback script included
~/. pai-backups/pai-backup-YYYYMMDD-HHMMSS/rollback.sh
```

Or manual rollback:
```bash
# Restore PAI_DIR to backup location
export PAI_DIR="~/.pai-backups/pai-backup-YYYYMMDD-HHMMSS/pai"
# Restart Claude Code
```

## Success Metrics

| Metric | Before (v1.0) | After (v2.0) |
|--------|---------------|--------------|
| Update time | 1-2 hours | 5-10 minutes |
| User decisions | 9+ | 3 |
| Manual commands | 20+ | 0 |
| Thinking time | 30-60 min | < 5 min |
| Error risk | Medium-High | Low |
| Rollback difficulty | Complex | Simple |

## Support

**Repository:** https://github.com/danielmiessler/Personal_AI_Infrastructure
**Local Clone:** C:\EpicSource\Github\Personal_AI_Infrastructure
**Tools Documentation:** [Tools/README.md](Tools/README.md)

## Tips

1. **Just say "Update PAI"** - Let automation handle the rest
2. **Run "Analyze PAI" first** if you want to see what's changed
3. **Backups are automatic** - No need to manually create them
4. **Settings auto-merge** - No manual diff/merge needed
5. **Path updates automatic** - No find/replace needed
6. **Tests run automatically** - No manual verification needed
7. **Restart after update** - Required to load new PAI_DIR

## What Makes v2.0 Different

**v1.0:** Manual workflow with many decision points
**v2.0:** Autonomous workflow with smart defaults

The key insight: **Most decisions don't require user thinking**. v2.0 uses smart defaults and automation to handle 90% of the work, only asking users about the 3 things that truly matter: identity preferences, optional features, and final approval.

**Result:** Update PAI in the time it takes to make coffee ☕
