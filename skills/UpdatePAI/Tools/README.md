# UpdatePAI Automation Tools

Scripts powering autonomous PAI updates.

## Scripts

| Script | Purpose |
|--------|---------|
| `detect-version.sh` | Detect v1 vs v2 installation |
| `analyze-breaking-changes.sh` | Parse git commits for breaking changes |
| `calculate-complexity.sh` | Assess update complexity |
| `detect-packs.sh` | Find installed PAI packs |
| `identify-custom-skills.sh` | Identify custom skills to preserve |
| `merge-settings.sh` | Auto-merge settings.json |
| `update-paths.sh` | Update path references for v2 |
| `test-installation.sh` | Automated verification suite |
| `update-env-var.sh` | Update PAI_DIR environment variable |

## Usage

```bash
TOOLS_DIR="$PAI_DIR/skills/UpdatePAI/Tools"

# Version detection
"$TOOLS_DIR/detect-version.sh" "$PAI_DIR"

# Breaking changes analysis
"$TOOLS_DIR/analyze-breaking-changes.sh" "/path/to/repo"

# Complexity calculation
"$TOOLS_DIR/calculate-complexity.sh" "v1" "v2" "$PAI_DIR"

# Pack detection
"$TOOLS_DIR/detect-packs.sh" "$PAI_DIR"

# Custom skill identification
"$TOOLS_DIR/identify-custom-skills.sh" "$PAI_DIR"

# Settings merge
"$TOOLS_DIR/merge-settings.sh" old.json new.json output.json

# Path updates (with dry-run)
"$TOOLS_DIR/update-paths.sh" "$PAI_DIR/skills" --dry-run

# Installation verification
"$TOOLS_DIR/test-installation.sh" "$PAI_DIR"

# Environment update
"$TOOLS_DIR/update-env-var.sh" "/new/pai/dir"
```

## Design Principles

1. **Idempotent** - Safe to run multiple times
2. **Cross-platform** - Windows (Git Bash), Linux, macOS
3. **JSON output** - Structured output where applicable
4. **Clear exit codes** - 0 success, 1+ error

## Requirements

- Bash 4.0+
- jq (for JSON processing)
- git (for breaking change analysis)

## Integration

Scripts orchestrated by `AutoUpdate.md` workflow:
- **Phase 1:** Pre-flight analysis (detect-version, analyze-breaking-changes, calculate-complexity, detect-packs, identify-custom-skills)
- **Phase 3:** Execution (merge-settings, update-paths)
- **Phase 4:** Verification (test-installation)
- **Phase 5:** Switch (update-env-var)
