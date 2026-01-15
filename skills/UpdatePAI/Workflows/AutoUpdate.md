# AutoUpdate Workflow

Autonomous update with smart defaults. Completes full PAI update with only 3 user decisions.

## Context

This workflow automates version detection, backup, installation, migration, and verification. User input required only for identity configuration, pack selection, and final approval.

## Phase 1: Pre-Flight Analysis

Run automation tools to gather system state:

```bash
TOOLS_DIR="$PAI_DIR/skills/UpdatePAI/Tools"
REPO_DIR="/c/EpicSource/Github/Personal_AI_Infrastructure"

echo "=== PAI AutoUpdate - Pre-Flight Analysis ==="

# Detect version, analyze changes, calculate complexity
CURRENT_VERSION=$("$TOOLS_DIR/detect-version.sh" "$PAI_DIR")
BREAKING_CHANGES=$("$TOOLS_DIR/analyze-breaking-changes.sh" "$REPO_DIR")
COMPLEXITY=$("$TOOLS_DIR/calculate-complexity.sh" "$CURRENT_VERSION" "v2" "$PAI_DIR")

# Detect packs and custom skills
INSTALLED_PACKS=$("$TOOLS_DIR/detect-packs.sh" "$PAI_DIR")
CUSTOM_SKILLS=$("$TOOLS_DIR/identify-custom-skills.sh" "$PAI_DIR")

echo "Version: $CURRENT_VERSION"
echo "Complexity: $(echo "$COMPLEXITY" | jq -r '.complexity_level')"
echo "Custom skills: $(echo "$CUSTOM_SKILLS" | jq 'length')"
```

## Phase 2: User Decisions

Collect all required input in single prompt:

### Decision 1: DAIDENTITY (if missing)

If `$PAI_DIR/skills/CORE/USER/DAIDENTITY.md` does not exist, ask:
- AI Name (e.g., Aria, Nova)
- Display Name
- Color (hex code)
- Voice ID (optional)

### Decision 2: New Packs

Compare installed packs against available. Ask about NEW packs only:
- pai-browser-skill
- pai-algorithm-skill
- pai-prompting-skill
- pai-voice-system
- pai-art-skill

### Decision 3: Final Approval

Show summary and confirm:
```
Summary:
- Backup current installation
- Install latest version in parallel
- Preserve [N] custom skills
- Migrate learnings + 30 days sessions
- Auto-merge settings
- Update path references

Proceed? (y/n)
```

## Phase 3: Automated Execution

```bash
NEW_PAI_DIR="/c/EpicSource/pai-v2-$(date +%Y%m%d)"
BACKUP_DIR="$HOME/pai-backups/pai-backup-$(date +%Y%m%d-%H%M%S)"

# Step 1: Backup
mkdir -p "$BACKUP_DIR"
cp -r "$PAI_DIR" "$BACKUP_DIR/"

# Step 2: Install core
CORE_PACK="$REPO_DIR/Packs/pai-core-install"
mkdir -p "$NEW_PAI_DIR"
cp -r "$CORE_PACK/src"/* "$NEW_PAI_DIR/"

# Step 3: DAIDENTITY
if [[ "$NEEDS_DAIDENTITY" == "true" ]]; then
    cat > "$NEW_PAI_DIR/skills/CORE/USER/DAIDENTITY.md" << EOF
# Digital Assistant Identity
- **Name:** $AI_NAME
- **Display Name:** $AI_DISPLAY
- **Color:** $AI_COLOR
- **Voice ID:** $AI_VOICE
EOF
else
    cp "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" "$NEW_PAI_DIR/skills/CORE/USER/"
fi

# Step 4: Preserve custom skills
echo "$CUSTOM_SKILLS" | jq -r '.[]' | while read -r skill; do
    cp -r "$PAI_DIR/skills/$skill" "$NEW_PAI_DIR/skills/"
done

# Step 5: Migrate history (learnings + 30 days)
cp -r "$PAI_DIR/history/learnings"/* "$NEW_PAI_DIR/MEMORY/learnings/" 2>/dev/null || true
find "$PAI_DIR/history/sessions" -type f -mtime -30 -exec cp {} "$NEW_PAI_DIR/MEMORY/sessions/" \; 2>/dev/null || true

# Step 6: Merge settings
"$TOOLS_DIR/merge-settings.sh" "$PAI_DIR/.claude/settings.json" "$NEW_PAI_DIR/.claude/settings.json" "$NEW_PAI_DIR/.claude/settings.json"

# Step 7: Update paths
"$TOOLS_DIR/update-paths.sh" "$NEW_PAI_DIR/skills"

# Step 8: Install new packs
for pack in "${PACKS_TO_INSTALL[@]}"; do
    case "$pack" in
        pai-browser-skill)
            cp -r "$REPO_DIR/Packs/pai-browser-skill/src/skills/Browser" "$NEW_PAI_DIR/skills/";;
        pai-algorithm-skill)
            cp -r "$REPO_DIR/Packs/pai-algorithm-skill/src/skills/THEALGORITHM" "$NEW_PAI_DIR/skills/";;
        pai-prompting-skill)
            cp -r "$REPO_DIR/Packs/pai-prompting-skill/src/skills/Prompting" "$NEW_PAI_DIR/skills/";;
        pai-voice-system)
            cp -r "$REPO_DIR/Packs/pai-voice-system/src"/* "$NEW_PAI_DIR/";;
        pai-art-skill)
            cp -r "$REPO_DIR/Packs/pai-art-skill/src/skills/Art" "$NEW_PAI_DIR/skills/";;
    esac
done
```

## Phase 4: Verification

```bash
if "$TOOLS_DIR/test-installation.sh" "$NEW_PAI_DIR"; then
    echo "All tests passed"
else
    echo "Tests failed - review before continuing"
    read -p "Continue anyway? (y/n): " CONTINUE
    [[ "$CONTINUE" != "y" ]] && exit 1
fi
```

## Phase 5: Switch Installation

```bash
# Update environment variable
"$TOOLS_DIR/update-env-var.sh" "$NEW_PAI_DIR"

echo "=== Update Complete ==="
echo "New installation: $NEW_PAI_DIR"
echo "Backup: $BACKUP_DIR"
echo ""
echo "Restart Claude Code to activate new installation"
```

## Success Criteria

- [ ] Pre-flight analysis complete
- [ ] User decisions collected
- [ ] Backup created
- [ ] Core installed
- [ ] Custom skills preserved
- [ ] History migrated
- [ ] Settings merged
- [ ] Paths updated
- [ ] Tests passed
- [ ] Environment updated

## Rollback

```bash
OLD_BACKUP="$BACKUP_DIR/pai"
mv "$NEW_PAI_DIR" "$NEW_PAI_DIR.failed"
mv "$OLD_BACKUP" "$PAI_DIR"
"$TOOLS_DIR/update-env-var.sh" "$PAI_DIR"
```
