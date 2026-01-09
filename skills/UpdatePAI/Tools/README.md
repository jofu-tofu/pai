# UpdatePAI Automation Tools

This directory contains 9 automation scripts that power the autonomous UpdatePAI workflow.

## Overview

These tools eliminate manual analysis, decision-making, and execution steps from PAI updates, reducing user thinking time from 30-60 minutes to < 5 minutes.

## Scripts

### 1. detect-version.sh

**Purpose:** Auto-detect PAI installation version

**Usage:**
```bash
./detect-version.sh [PAI_DIR]
```

**Output:** `v1`, `v2`, or `unknown`

**Detection criteria:**
- v2: MEMORY/ (not MEMORY/History/), CORE/USER/, DAIDENTITY.md, hooks/lib/identity.ts
- v1: history/ or MEMORY/History/, flat CORE structure, CoreStack.md

**Exit codes:** 0 = success, 1 = error

---

### 2. analyze-breaking-changes.sh

**Purpose:** Parse git commits for breaking changes

**Usage:**
```bash
./analyze-breaking-changes.sh [REPO_DIR] [SINCE_TAG]
```

**Output:** JSON object with breaking commits and known breaking changes

**Keywords detected:**
- BREAKING, breaking change, deprecated, removed, renamed, moved, migrat, restructur

**Known breaking changes (v1→v2):**
- pai-history-system retirement
- CORE restructuring (USER/SYSTEM)
- MEMORY flattening
- DAIDENTITY requirement
- Security system addition

**Exit codes:** 0 = success, 1 = error

---

### 3. calculate-complexity.sh

**Purpose:** Calculate update complexity score

**Usage:**
```bash
./calculate-complexity.sh [CURRENT_VERSION] [TARGET_VERSION] [PAI_DIR]
```

**Output:** JSON with complexity assessment

**Factors:**
- Version gap (v1→v2: +3, v2→v2: +1)
- Custom skills count (+1 each)
- History size (>100MB: +1, >1GB: +2)
- Custom settings (+1)

**Complexity levels:**
- Simple: 0-3 points (5-10 min)
- Medium: 4-6 points (10-15 min)
- Complex: 7+ points (15-30 min)

**Exit codes:** 0 = success

---

### 4. detect-packs.sh

**Purpose:** Auto-detect installed PAI packs

**Usage:**
```bash
./detect-packs.sh [PAI_DIR]
```

**Output:** JSON array of pack names

**Known packs:**
- pai-browser-skill
- pai-algorithm-skill
- pai-prompting-skill
- pai-voice-system
- pai-art-skill
- pai-agent-skill
- pai-upgrades-skill
- pai-review-skill
- pai-createskill
- pai-updateskill

**Exit codes:** 0 = success

---

### 5. identify-custom-skills.sh

**Purpose:** Identify custom skills to preserve

**Usage:**
```bash
./identify-custom-skills.sh [PAI_DIR]
```

**Output:** JSON array of custom skill names

**Logic:**
- Scans `skills/` directory for directories with `SKILL.md`
- Excludes official skills (CORE, Browser, THEALGORITHM, etc.)
- Returns all custom skills (typically Epic*, user-created)

**Exit codes:** 0 = success

---

### 6. merge-settings.sh

**Purpose:** Auto-merge settings.json with conflict detection

**Usage:**
```bash
./merge-settings.sh [OLD_SETTINGS] [NEW_SETTINGS] [OUTPUT]
```

**Strategy:**
1. Start with new settings (latest defaults)
2. Preserve user customizations
3. Auto-update paths to use `$PAI_DIR`
4. Remove retired hooks (pai-history-system)
5. Detect conflicts

**Requires:** jq (JSON processor)

**Exit codes:**
- 0 = success
- 1 = conflicts detected
- 2 = error

---

### 7. update-paths.sh

**Purpose:** Auto-update path references for v2 structure

**Usage:**
```bash
./update-paths.sh [TARGET_DIR] [--dry-run]
```

**Path mappings:**
- `CORE/Contacts.md` → `CORE/USER/CONTACTS.md`
- `CORE/CoreStack.md` → `CORE/USER/TECHSTACKPREFERENCES.md`
- `CORE/BasicInfo.md` → `CORE/USER/BASICINFO.md`
- `history/History/` → `MEMORY/`
- `MEMORY/History/` → `MEMORY/`
- `/history/` → `/MEMORY/`

**Features:**
- Scans all `.md`, `.ts`, `.json` files
- Creates `.bak` backups before changes
- Supports dry-run mode
- Provides detailed summary

**Exit codes:** 0 = success, 1 = error

---

### 8. test-installation.sh

**Purpose:** Automated verification suite

**Usage:**
```bash
./test-installation.sh [PAI_DIR]
```

**Tests:**
- Core structure (PAI_DIR, skills/, MEMORY/, hooks/)
- CORE skill (SKILL.md, USER/, SYSTEM/, DAIDENTITY.md)
- MEMORY system (learnings/, sessions/, research/, no History/)
- Hook system (security-validator.ts, load-core-context.ts, lib/identity.ts)
- Settings (settings.json exists and is valid JSON)
- Security system (PAISECURITYSYSTEM if installed)

**Output:** Pass/fail for each test with summary

**Exit codes:**
- 0 = all tests passed
- 1 = one or more tests failed

---

### 9. update-env-var.sh

**Purpose:** Update PAI_DIR environment variable

**Usage:**
```bash
./update-env-var.sh [NEW_PAI_DIR]
```

**Platform support:**
- **Windows:** Updates PowerShell User environment + bash profiles
- **macOS:** Updates .zshrc and .bashrc
- **Linux:** Updates .bashrc

**Features:**
- Auto-detects platform
- Removes old PAI_DIR exports
- Adds new PAI_DIR export
- Provides restart instructions
- Converts paths appropriately (Windows path format handling)

**Exit codes:** 0 = success, 1 = error

---

## Design Principles

All scripts follow these principles:

1. **Idempotent** - Safe to run multiple times
2. **Clear output** - Human-readable with status indicators
3. **Error handling** - Validates inputs and provides helpful error messages
4. **Cross-platform** - Works on Windows (Git Bash/PowerShell), Linux, macOS
5. **Dry-run support** - Where applicable (e.g., update-paths.sh)
6. **JSON output** - Structured output for programmatic use (where applicable)
7. **Exit codes** - Proper exit codes for automation
8. **Documentation** - Inline comments explaining logic

## Integration

These tools are orchestrated by the `AutoUpdate.md` workflow to provide:

- **Phase 1:** Pre-flight analysis (scripts 1-5)
- **Phase 2:** Critical decisions (user prompts only)
- **Phase 3:** Automated execution (scripts 6-7)
- **Phase 4:** Automated testing (script 8)
- **Phase 5:** Environment update (script 9)

## Testing

To test individual scripts:

```bash
# Test version detection
./detect-version.sh "$PAI_DIR"

# Test pack detection
./detect-packs.sh "$PAI_DIR"

# Test custom skill detection
./identify-custom-skills.sh "$PAI_DIR"

# Test path updates (dry-run)
./update-paths.sh "$PAI_DIR/skills" --dry-run

# Test installation verification
./test-installation.sh "$PAI_DIR"
```

## Requirements

- **Bash** 4.0+ (Git Bash on Windows, native on Linux/macOS)
- **jq** - For JSON processing (merge-settings.sh)
- **git** - For breaking change analysis
- Standard Unix tools: find, grep, sed, awk, du

## Maintenance

When adding new features to PAI:

1. **New official skills:** Add to `identify-custom-skills.sh` OFFICIAL_SKILLS array
2. **New packs:** Add to `detect-packs.sh` PACKS associative array
3. **New path patterns:** Add to `update-paths.sh` PATH_MAPPINGS array
4. **New tests:** Add to `test-installation.sh` test sections
5. **New breaking changes:** Add to `analyze-breaking-changes.sh` known_breaking array

## Version History

- **v2.0** (2026-01-09): Initial release with 9 automation scripts
  - Fully autonomous update workflow
  - Smart defaults for all decisions
  - Reduced user thinking to 3 critical decisions
  - 5-10 minute update time
