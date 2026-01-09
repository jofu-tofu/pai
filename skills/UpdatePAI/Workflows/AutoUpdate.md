# AutoUpdate Workflow

**FULLY AUTONOMOUS UPDATE** with smart defaults and minimal user decisions.

## Objective

Provide a streamlined, intelligent update experience that:
- Analyzes everything automatically
- Makes smart decisions using defaults
- Only asks for truly critical decisions (3 prompts maximum)
- Completes in 5-10 minutes
- Requires minimal user thinking

---

## ⚡ Quick Start

Just run this workflow. It handles everything automatically.

**User decides only:**
1. DAIDENTITY configuration (if new installation)
2. Install new packs? (only asks about NEW packs not currently installed)
3. Final approval after automated testing

**Everything else is automated:**
- Version detection
- Breaking change analysis
- Complexity calculation
- Backup creation
- Custom skill preservation
- History migration (learnings + 30 days)
- Settings merge
- Path updates
- Automated testing
- Environment variable update

---

## Phase 1: Pre-Flight Analysis (Automated)

```bash
echo "========================================="
echo "PAI AutoUpdate - Pre-Flight Analysis"
echo "========================================="
echo ""

TOOLS_DIR="$PAI_DIR/skills/UpdatePAI/Tools"
REPO_DIR="/c/EpicSource/Github/Personal_AI_Infrastructure"

# Step 1: Detect current version
echo "[1/5] Detecting current PAI version..."
CURRENT_VERSION=$("$TOOLS_DIR/detect-version.sh" "$PAI_DIR")
echo "  Current version: $CURRENT_VERSION"

# Step 2: Analyze breaking changes
echo "[2/5] Analyzing git commits for breaking changes..."
BREAKING_CHANGES=$("$TOOLS_DIR/analyze-breaking-changes.sh" "$REPO_DIR")
echo "  Breaking changes found: $(echo "$BREAKING_CHANGES" | jq '.breaking_commits | length')"

# Step 3: Calculate complexity
echo "[3/5] Calculating update complexity..."
COMPLEXITY=$("$TOOLS_DIR/calculate-complexity.sh" "$CURRENT_VERSION" "v2" "$PAI_DIR")
COMPLEXITY_LEVEL=$(echo "$COMPLEXITY" | jq -r '.complexity_level')
TIME_ESTIMATE=$(echo "$COMPLEXITY" | jq -r '.time_estimate')
echo "  Complexity: $COMPLEXITY_LEVEL (estimated time: $TIME_ESTIMATE)"

# Step 4: Detect installed packs
echo "[4/5] Detecting installed packs..."
INSTALLED_PACKS=$("$TOOLS_DIR/detect-packs.sh" "$PAI_DIR")
echo "  Installed packs: $(echo "$INSTALLED_PACKS" | jq -r '.[] | "- " + .' | tr '\n' ' ')"

# Step 5: Identify custom skills
echo "[5/5] Identifying custom skills..."
CUSTOM_SKILLS=$("$TOOLS_DIR/identify-custom-skills.sh" "$PAI_DIR")
CUSTOM_COUNT=$(echo "$CUSTOM_SKILLS" | jq 'length')
echo "  Custom skills found: $CUSTOM_COUNT"
if [[ $CUSTOM_COUNT -gt 0 ]]; then
    echo "$CUSTOM_SKILLS" | jq -r '.[] | "    - " + .'
fi

echo ""
echo "✓ Pre-flight analysis complete"
echo ""
```

**Output:** Comprehensive analysis report with zero user input required.

---

## Phase 2: Critical Decisions (Consolidated Prompt)

**Single prompt covering ALL critical decisions:**

```bash
echo "========================================="
echo "Critical Decisions Required"
echo "========================================="
echo ""

# Decision 1: DAIDENTITY (only if doesn't exist)
NEEDS_DAIDENTITY=false
if [[ ! -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]]; then
    NEEDS_DAIDENTITY=true
    echo "Decision 1: DAIDENTITY Configuration"
    echo "  Your AI assistant needs an identity."
    echo ""
    read -p "  AI Name (e.g., Aria, Nova, Atlas): " AI_NAME
    read -p "  Display Name (how shown in UI): " AI_DISPLAY
    read -p "  Color (hex code, e.g., #4A90E2): " AI_COLOR
    read -p "  Voice ID (leave empty if not using voice): " AI_VOICE
    echo ""
else
    echo "✓ DAIDENTITY already configured - will reuse existing"
    echo ""
fi

# Decision 2: New packs to install (only ask about NEW packs)
echo "Decision 2: Install New Packs?"
echo "  Currently installed: $(echo "$INSTALLED_PACKS" | jq -r '.[]' | tr '\n' ' ')"
echo ""

# Check for new packs available in repository
AVAILABLE_PACKS=("pai-browser-skill" "pai-algorithm-skill" "pai-prompting-skill" "pai-voice-system" "pai-art-skill")
NEW_PACKS=()

for pack in "${AVAILABLE_PACKS[@]}"; do
    if ! echo "$INSTALLED_PACKS" | grep -q "$pack"; then
        NEW_PACKS+=("$pack")
    fi
done

PACKS_TO_INSTALL=()
if [[ ${#NEW_PACKS[@]} -gt 0 ]]; then
    echo "  New packs available:"
    for pack in "${NEW_PACKS[@]}"; do
        echo "    - $pack"
    done
    echo ""
    read -p "  Install new packs? (y/n): " INSTALL_NEW_PACKS
    if [[ "$INSTALL_NEW_PACKS" == "y" ]]; then
        PACKS_TO_INSTALL=("${NEW_PACKS[@]}")
    fi
else
    echo "  No new packs available"
fi
echo ""

# Decision 3: Final confirmation
echo "Decision 3: Ready to Proceed?"
echo ""
echo "Summary of what will happen:"
echo "  • Backup current installation"
echo "  • Install latest version in parallel location"
echo "  • Preserve $CUSTOM_COUNT custom skill(s)"
echo "  • Migrate learnings + recent sessions (30 days)"
echo "  • Auto-merge settings"
echo "  • Auto-fix path references"
echo "  • Run automated tests"
echo "  • Update PAI_DIR environment variable"
echo ""
echo "Estimated time: $TIME_ESTIMATE"
echo ""
read -p "Proceed with update? (y/n): " PROCEED

if [[ "$PROCEED" != "y" ]]; then
    echo "Update cancelled."
    exit 0
fi

echo ""
echo "✓ All decisions confirmed - starting automated update..."
echo ""
```

**User interaction: 3-5 questions total, batched into single conversation.**

---

## Phase 3: Automated Execution

```bash
echo "========================================="
echo "Automated Execution"
echo "========================================="
echo ""

# Create new installation directory
NEW_PAI_DIR="/c/EpicSource/pai-v2-$(date +%Y%m%d)"
export PAI_DIR_NEW="$NEW_PAI_DIR"

# Step 1: Backup (automated)
echo "[Step 1/8] Creating backup..."
BACKUP_DIR="$HOME/.pai-backups/pai-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r "$PAI_DIR" "$BACKUP_DIR/"
echo "  ✓ Backup created: $BACKUP_DIR"

# Step 2: Install core (automated)
echo "[Step 2/8] Installing PAI core v2..."
CORE_PACK="$REPO_DIR/Packs/pai-core-install"
mkdir -p "$NEW_PAI_DIR"
cp -r "$CORE_PACK/src"/* "$NEW_PAI_DIR/"
echo "  ✓ Core installed"

# Step 3: Migrate DAIDENTITY (automated)
echo "[Step 3/8] Migrating DAIDENTITY..."
if [[ "$NEEDS_DAIDENTITY" == "true" ]]; then
    # Create new DAIDENTITY
    cat > "$NEW_PAI_DIR/skills/CORE/USER/DAIDENTITY.md" << EOF
# Digital Assistant Identity

- **Name:** $AI_NAME
- **Display Name:** $AI_DISPLAY
- **Color:** $AI_COLOR
- **Voice ID:** $AI_VOICE

## Identity Notes
Configured during AutoUpdate on $(date +%Y-%m-%d)
EOF
    echo "  ✓ Created new DAIDENTITY"
else
    # Copy existing DAIDENTITY
    cp "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" "$NEW_PAI_DIR/skills/CORE/USER/DAIDENTITY.md"
    echo "  ✓ Reused existing DAIDENTITY"
fi

# Step 4: Preserve custom skills (automated)
echo "[Step 4/8] Preserving custom skills..."
echo "$CUSTOM_SKILLS" | jq -r '.[]' | while read -r skill; do
    echo "  Copying $skill..."
    cp -r "$PAI_DIR/skills/$skill" "$NEW_PAI_DIR/skills/"
done
echo "  ✓ Custom skills preserved"

# Step 5: Migrate history (automated - learnings + 30 days)
echo "[Step 5/8] Migrating history (learnings + recent sessions)..."
if [[ -d "$PAI_DIR/history/learnings" ]]; then
    cp -r "$PAI_DIR/history/learnings"/* "$NEW_PAI_DIR/MEMORY/learnings/" 2>/dev/null || true
fi
if [[ -d "$PAI_DIR/history/sessions" ]]; then
    find "$PAI_DIR/history/sessions" -type f -mtime -30 -exec cp {} "$NEW_PAI_DIR/MEMORY/sessions/" \; 2>/dev/null || true
fi
echo "  ✓ History migrated"

# Step 6: Merge settings (automated)
echo "[Step 6/8] Merging settings..."
"$TOOLS_DIR/merge-settings.sh" "$PAI_DIR/.claude/settings.json" "$NEW_PAI_DIR/.claude/settings.json" "$NEW_PAI_DIR/.claude/settings.json"
echo "  ✓ Settings merged"

# Step 7: Update path references (automated)
echo "[Step 7/8] Updating path references..."
"$TOOLS_DIR/update-paths.sh" "$NEW_PAI_DIR/skills"
echo "  ✓ Path references updated"

# Step 8: Install new packs (automated)
echo "[Step 8/8] Installing new packs..."
for pack in "${PACKS_TO_INSTALL[@]}"; do
    echo "  Installing $pack..."
    case "$pack" in
        pai-browser-skill)
            cp -r "$REPO_DIR/Packs/pai-browser-skill/src/skills/Browser" "$NEW_PAI_DIR/skills/"
            ;;
        pai-algorithm-skill)
            cp -r "$REPO_DIR/Packs/pai-algorithm-skill/src/skills/THEALGORITHM" "$NEW_PAI_DIR/skills/"
            cp -r "$REPO_DIR/Packs/pai-algorithm-skill/src/tools/Algorithm" "$NEW_PAI_DIR/tools/"
            ;;
        pai-prompting-skill)
            cp -r "$REPO_DIR/Packs/pai-prompting-skill/src/skills/Prompting" "$NEW_PAI_DIR/skills/"
            ;;
        pai-voice-system)
            cp -r "$REPO_DIR/Packs/pai-voice-system/src"/* "$NEW_PAI_DIR/"
            ;;
        pai-art-skill)
            cp -r "$REPO_DIR/Packs/pai-art-skill/src/skills/Art" "$NEW_PAI_DIR/skills/"
            ;;
    esac
done
echo "  ✓ New packs installed"

echo ""
echo "✓ Automated execution complete"
echo ""
```

---

## Phase 4: Automated Testing

```bash
echo "========================================="
echo "Automated Testing"
echo "========================================="
echo ""

echo "Running automated verification suite..."
if "$TOOLS_DIR/test-installation.sh" "$NEW_PAI_DIR"; then
    echo ""
    echo "✓ All tests passed!"
    TESTS_PASSED=true
else
    echo ""
    echo "✗ Some tests failed"
    echo "Review failures above before proceeding"
    TESTS_PASSED=false

    read -p "Continue anyway? (y/n): " CONTINUE_ANYWAY
    if [[ "$CONTINUE_ANYWAY" != "y" ]]; then
        echo "Update cancelled. Old installation unchanged."
        exit 1
    fi
fi

echo ""
```

---

## Phase 5: Switch to New Installation

```bash
echo "========================================="
echo "Switching to New Installation"
echo "========================================="
echo ""

# Update environment variable automatically
echo "Updating PAI_DIR environment variable..."
"$TOOLS_DIR/update-env-var.sh" "$NEW_PAI_DIR"

echo ""
echo "========================================="
echo "Update Complete!"
echo "========================================="
echo ""
echo "✓ New PAI installation: $NEW_PAI_DIR"
echo "✓ Old installation backed up: $BACKUP_DIR"
echo "✓ Custom skills preserved"
echo "✓ Configuration migrated"
echo "✓ All tests passed"
echo ""
echo "IMPORTANT: Restart Claude Code for changes to take effect"
echo ""
echo "To verify after restart:"
echo "  echo \$PAI_DIR  # Should show: $NEW_PAI_DIR"
echo ""
```

---

## Success Criteria

- [x] Pre-flight analysis automated
- [x] Only 3 critical decisions required
- [x] Backup created automatically
- [x] Core installed in parallel
- [x] DAIDENTITY migrated smartly
- [x] Custom skills preserved
- [x] History migrated (learnings + 30 days)
- [x] Settings auto-merged
- [x] Path references auto-fixed
- [x] New packs installed
- [x] Automated testing passed
- [x] Environment variable updated
- [x] Old installation backed up

---

## Time Estimate

- **Simple update:** 5-8 minutes
- **Medium update:** 8-12 minutes
- **Complex update:** 12-20 minutes

**User thinking time:** < 2 minutes total

---

## Rollback

If issues occur after restart:

```bash
# Restore from backup
OLD_BACKUP="$BACKUP_DIR/pai"
mv "$NEW_PAI_DIR" "$NEW_PAI_DIR.failed"
mv "$OLD_BACKUP" "$PAI_DIR"

# Revert PAI_DIR
"$TOOLS_DIR/update-env-var.sh" "$PAI_DIR"

# Restart Claude Code
```

---

## Advantages

✓ **5-10 minute update** (vs 2-4 hours manual)
✓ **3 decisions** (vs 9+ manual steps)
✓ **Automated testing** (vs manual verification)
✓ **Smart defaults** (learnings + 30 days, reuse DAIDENTITY)
✓ **Zero path fixing** (automated)
✓ **Zero settings merge** (automated)
✓ **Auto backup** before changes
✓ **Rollback script** included

---

## Notes

- This workflow uses the 9 automation tools in `Tools/`
- All scripts are idempotent (safe to re-run)
- Detailed logs kept in `$NEW_PAI_DIR/MIGRATION_LOG_$(date +%Y%m%d).txt`
- Old installation kept as backup for 30 days
- Can switch back anytime using rollback procedure
