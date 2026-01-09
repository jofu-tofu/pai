---
name: UpdatePAI
description: Fully autonomous PAI system updater with smart defaults and minimal user thinking. USE WHEN user requests PAI update OR system upgrade OR sync with repository. Analyzes, backs up, migrates, tests, and switches automatically. Only 3 critical decisions required. Completes in 5-10 minutes.
version: 2.0
---

# UpdatePAI

**Autonomous PAI system updater** with intelligent automation that minimizes user thinking and maximizes efficiency.

Manages complete PAI updates from GitHub repository at `C:\EpicSource\Github\Personal_AI_Infrastructure`. Handles major version upgrades (v1.x → v2.1.1+), breaking changes, custom skill preservation, and configuration migration **automatically**.

**Repository:** https://github.com/danielmiessler/Personal_AI_Infrastructure

## ⚡ New in v2.0: Fully Autonomous Updates

**What's Automated:**
- ✅ Version detection (v1.x vs v2.x)
- ✅ Breaking change analysis (git commits)
- ✅ Complexity calculation
- ✅ Backup creation
- ✅ Custom skill preservation
- ✅ History migration (learnings + 30 days)
- ✅ Settings auto-merge
- ✅ Path reference updates
- ✅ Automated testing
- ✅ Environment variable update

**What You Decide:**
1. DAIDENTITY configuration (if new)
2. Install new packs? (only NEW ones)
3. Final approval after testing

**Time Required:** 5-10 minutes (vs 2-4 hours manual)

## Key Capabilities

- **9 automation tools** in `Tools/` directory
- **Pre-flight analysis** runs automatically
- **Smart defaults** for all decisions
- **Automated testing** verifies installation
- **Rollback capability** included
- **Custom skills** auto-detected and preserved
- **Breaking changes** handled automatically

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **AutoUpdate** | "update PAI" OR "upgrade PAI" OR "sync PAI" (**DEFAULT - AUTONOMOUS**) | `Workflows/AutoUpdate.md` |
| **Analyze** | "analyze PAI" OR "check PAI version" OR "compare installation" | `Workflows/Analyze.md` |
| **Backup** | "backup PAI" OR "backup current installation" OR pre-update backup | `Workflows/Backup.md` |
| **HybridUpdate** | "manual update PAI" OR "hybrid update" (manual alternative) | `Workflows/HybridUpdate.md` |
| **FreshInstall** | "fresh install PAI" OR "clean install" OR "reinstall PAI" | `Workflows/FreshInstall.md` |
| **Verify** | "verify PAI" OR "check installation" OR post-update verification | `Workflows/Verify.md` |

## Examples

**Example 1: Autonomous update (default - NEW in v2.0)**
```
User: "Update PAI system to latest version"
→ Invokes AutoUpdate workflow (fully autonomous)
→ Pre-flight analysis runs automatically (version, commits, complexity, packs, customs)
→ Consolidated prompt with 3 critical decisions
→ Creates backup automatically
→ Installs latest version in parallel automatically
→ Preserves all custom skills automatically
→ Migrates learnings + 30 days sessions automatically
→ Auto-merges settings with conflict detection
→ Auto-fixes all path references
→ Installs new packs if requested
→ Runs automated test suite
→ Updates PAI_DIR environment variable automatically
→ Archives old installation
→ Result: Complete autonomous update in 5-10 minutes
```

**Example 2: Analyze before updating**
```
User: "What's different in my PAI vs the latest version?"
→ Invokes Analyze workflow
→ Examines git commit history and recent changes
→ Compares current installation structure with repository
→ Identifies missing features (voice system, algorithm pack, security system)
→ Lists breaking changes from commit messages
→ Shows version gap and number of commits behind
→ Recommends hybrid update strategy
→ Estimates migration complexity
→ Result: Detailed analysis report without making changes
```

**Example 3: Fresh install scenario**
```
User: "I want to start fresh with the latest PAI"
→ Invokes FreshInstall workflow
→ Creates comprehensive backup of current installation
→ Backs up custom skills separately
→ Removes old installation completely
→ Installs latest version from repository using wizard installers
→ Restores custom Epic skills
→ Guides user through DAIDENTITY and USER/ configuration
→ Imports critical history/learnings
→ Verifies all components
→ Result: Clean latest installation, all custom work preserved
```

**Example 4: Backup before manual changes**
```
User: "Backup my current PAI installation"
→ Invokes Backup workflow
→ Creates timestamped backup: pai-backup-20260109-143022
→ Backs up custom skills separately: pai-custom-skills/
→ Backs up settings.json
→ Backs up history directory
→ Backs up environment configuration
→ Generates backup manifest with checksums
→ Result: Complete backup ready for restoration
```

**Example 5: Verify installation health**
```
User: "Verify my PAI installation is working correctly"
→ Invokes Verify workflow
→ Checks PAI_DIR structure and required directories
→ Validates SKILL.md files have proper frontmatter
→ Verifies workflow references resolve
→ Checks CORE/USER/ configuration completeness
→ Tests hook system integration
→ Validates security system (PAISECURITYSYSTEM)
→ Checks for broken path references
→ Tests custom Epic skills
→ Result: Health report with any issues found
```

## Update Strategies

### Hybrid Update (RECOMMENDED)
- Fresh install latest version in parallel location
- Preserve custom Epic skills
- Migrate user configuration
- Test before switching
- Lowest risk, all benefits

### Fresh Install
- Complete clean slate
- Manual reconfiguration
- Best for major corruption
- Maximum work required

### Incremental Update
- Merge changes into existing installation
- Complex conflict resolution
- High risk of inconsistent state
- NOT RECOMMENDED due to breaking changes

## Breaking Changes Handled

1. **pai-history-system retirement** - Migrates to pai-core-install MEMORY system
2. **CORE restructuring** - Migrates flat files to USER/SYSTEM directories
3. **MEMORY flattening** - Removes History/ parent directory
4. **DAIDENTITY requirement** - Creates identity configuration
5. **Security system** - Installs PAISECURITYSYSTEM directory
6. **Hook updates** - Updates hook references and paths
7. **Settings migration** - Updates settings.json structure

## Custom Skills Preserved

- **EpicCode** - Epic-specific code workflows
- **EpicGit** - Epic git DLG management
- **EpicWiki** - Epic wiki content extraction

All custom skills are auto-detected, backed up, and restored with updated path references.

## Automation Tools (v2.0)

The `Tools/` directory contains 9 automation scripts that power autonomous updates:

| Script | Purpose |
|--------|---------|
| `detect-version.sh` | Auto-detect v1.x vs v2.x installation |
| `analyze-breaking-changes.sh` | Parse git commits for breaking changes |
| `calculate-complexity.sh` | Assess update complexity (simple/medium/complex) |
| `detect-packs.sh` | Find all installed PAI packs |
| `identify-custom-skills.sh` | Identify custom skills to preserve |
| `merge-settings.sh` | Auto-merge settings.json with conflict detection |
| `update-paths.sh` | Auto-fix path references (CORE/USER, MEMORY) |
| `test-installation.sh` | Automated verification suite |
| `update-env-var.sh` | Update PAI_DIR environment variable |

All scripts:
- Are idempotent (safe to re-run)
- Include error handling
- Provide clear output
- Support dry-run mode where applicable
- Work cross-platform (Windows/Linux/macOS)
