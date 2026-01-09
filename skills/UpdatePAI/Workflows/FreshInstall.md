# FreshInstall Workflow

Complete clean slate installation - removes old installation and installs v2.1.1 from scratch.

## Objective

Start completely fresh with v2.1.1 while preserving critical data and custom skills.

**Use when:**
- Old installation is corrupted
- Want cleanest possible v2.1.1 setup
- Willing to manually reconfigure settings
- Don't mind losing non-critical history

## Prerequisites

- [ ] **CRITICAL:** Backup completed first (invoke Backup workflow)
- [ ] Repository clone exists and is up-to-date
- [ ] User confirms ready to remove old installation

## Steps

### Phase 1: Comprehensive Backup

#### 1.1 Invoke Backup Workflow
**MANDATORY:** Run Backup workflow before proceeding
```bash
# This must complete successfully before continuing
```

#### 1.2 Verify Backup
```bash
# Verify backup exists
LATEST_BACKUP=$(ls -td /c/EpicSource/pai-backup-* | head -1)
echo "Latest backup: $LATEST_BACKUP"

if [ -d "$LATEST_BACKUP" ]; then
    echo "✓ Backup verified"
else
    echo "✗ ERROR: No backup found! Run Backup workflow first."
    exit 1
fi
```

### Phase 2: Remove Old Installation

#### 2.1 User Confirmation
**Interactive:** Ask user to confirm:
```
⚠️  WARNING: About to remove old PAI installation

This will delete:
- $PAI_DIR (entire directory)
- All installed skills (except backed up Epic skills)
- All history (except backup)
- All settings (except backup)

Backups are safe at:
- Complete: $LATEST_BACKUP
- Custom skills: $(ls -td /c/EpicSource/pai-custom-skills-* | head -1)

Type 'CONFIRM' to proceed:
```

#### 2.2 Remove Old Installation
```bash
echo "=== Removing Old Installation ==="

OLD_PAI_DIR="$PAI_DIR"

# Remove old installation
rm -rf "$OLD_PAI_DIR"

# Verify removal
if [ ! -d "$OLD_PAI_DIR" ]; then
    echo "✓ Old installation removed"
else
    echo "✗ ERROR: Failed to remove old installation"
    exit 1
fi
```

### Phase 3: Fresh Install v2.1.1

#### 3.1 Create Fresh PAI Directory
```bash
echo "=== Creating Fresh PAI Installation ==="

# Use original PAI_DIR location (clean slate)
mkdir -p "$PAI_DIR"/{.claude,hooks,observability,skills,tools}

echo "✓ Fresh directory structure created"
ls -la "$PAI_DIR/"
```

#### 3.2 Install pai-core-install Using Wizard
```bash
REPO_DIR="/c/EpicSource/Github/Personal_AI_Infrastructure"
CORE_PACK="$REPO_DIR/Packs/pai-core-install"

echo "=== Reading Core Pack Installation Instructions ==="
cat "$CORE_PACK/INSTALL.md"
```

**Manual Installation:** Follow the wizard-style installer in `INSTALL.md`

The wizard includes:
- Phase 1: System Analysis
- Phase 2: User Questions
- Phase 3: Backup (skipped - already done)
- Phase 4: Installation
- Phase 5: Verification

#### 3.3 Copy Core Structure
```bash
echo "=== Installing Core Structure ==="

# Install MEMORY system (v2.1.1 - flattened)
cp -r "$CORE_PACK/src/MEMORY" "$PAI_DIR/"

# Install CORE skill (USER/SYSTEM structure)
cp -r "$CORE_PACK/src/skills/CORE" "$PAI_DIR/skills/"

# Install hooks
cp -r "$CORE_PACK/src/hooks" "$PAI_DIR/"

# Copy settings template
cp "$CORE_PACK/settings.json.template" "$PAI_DIR/.claude/settings.json"

echo "✓ Core structure installed"
```

#### 3.4 Verify Core Installation
```bash
echo "=== Verifying Core Installation ==="

# Check MEMORY (should be flattened)
if [ -d "$PAI_DIR/MEMORY/sessions" ] && [ ! -d "$PAI_DIR/MEMORY/History" ]; then
    echo "✓ MEMORY structure correct (flattened)"
else
    echo "✗ ERROR: MEMORY structure incorrect"
fi

# Check CORE structure (USER/SYSTEM)
if [ -d "$PAI_DIR/skills/CORE/USER" ] && [ -d "$PAI_DIR/skills/CORE/SYSTEM" ]; then
    echo "✓ CORE structure correct (USER/SYSTEM)"
else
    echo "✗ ERROR: CORE structure incorrect"
fi

# Check PAISECURITYSYSTEM
if [ -d "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM" ]; then
    echo "✓ PAISECURITYSYSTEM installed"
else
    echo "⚠ Warning: PAISECURITYSYSTEM missing"
fi
```

### Phase 4: Configure User Settings

#### 4.1 Create DAIDENTITY (Required)
**Interactive:** Guide user through DAIDENTITY creation

Ask for:
- AI Name
- Display Name
- Color (hex code)
- Voice ID (optional)

```bash
# Create DAIDENTITY.md with user responses
cat > "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" << EOF
# Digital Assistant Identity

- **Name:** [USER_NAME]
- **Display Name:** [USER_DISPLAY]
- **Color:** [USER_COLOR]
- **Voice ID:** [USER_VOICE_ID or leave blank]

## Identity Notes
[User can add personality description]
EOF

echo "✓ DAIDENTITY created"
```

#### 4.2 Configure USER/ Files
**Interactive:** Guide user through essential USER/ files

**Required:**
- `BASICINFO.md` - Basic personal information
- `CONTACTS.md` - Contact information
- `TECHSTACKPREFERENCES.md` - Technology preferences

**Restoration:** Offer to restore from backup
```bash
BACKUP_CORE=$(find "$LATEST_BACKUP/pai-complete/skills/CORE" -type f -name "*.md" 2>/dev/null)

if [ -n "$BACKUP_CORE" ]; then
    echo "Found configuration in backup. Restore?"
    # If yes:
    # - CORE/Contacts.md → USER/CONTACTS.md
    # - CORE/CoreStack.md → USER/TECHSTACKPREFERENCES.md
    # - CORE/BasicInfo.md → USER/BASICINFO.md
fi
```

**New Files:** User should review and fill out:
- `ABOUTME.md`
- `ALGOPREFS.md`
- `ART.md`
- `ASSETMANAGEMENT.md`
- `CORECONTENT.md`
- `DEFINITIONS.md`
- `REMINDERS.md`
- `RESUME.md`
- `TELOS.md`

#### 4.3 Configure PAISECURITYSYSTEM
```bash
echo "=== Configuring Security System ==="

# Review security patterns
cat "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM/patterns.yaml"

# User can customize security rules if needed
echo "Security system ready. Review patterns.yaml for customization."
```

#### 4.4 Configure Settings
```bash
echo "=== Configuring Settings ==="

# Review settings template
cat "$PAI_DIR/.claude/settings.json"

# Restore old settings if compatible
echo "Check backup for old settings to merge"
echo "Old: $LATEST_BACKUP/pai-complete/.claude/settings.json"
echo "New: $PAI_DIR/.claude/settings.json"
```

### Phase 5: Restore Custom Skills

#### 5.1 Identify Custom Skills from Backup
```bash
CUSTOM_BACKUP=$(ls -td /c/EpicSource/pai-custom-skills-* | head -1)
echo "Custom skills backup: $CUSTOM_BACKUP"

if [ -d "$CUSTOM_BACKUP" ]; then
    echo "Custom skills found:"
    ls -la "$CUSTOM_BACKUP/"
else
    echo "⚠ No custom skills backup found"
fi
```

#### 5.2 Restore Custom Epic Skills
```bash
echo "=== Restoring Custom Skills ==="

# Restore EpicCode
if [ -d "$CUSTOM_BACKUP/EpicCode" ]; then
    cp -r "$CUSTOM_BACKUP/EpicCode" "$PAI_DIR/skills/"
    echo "✓ Restored EpicCode"
fi

# Restore EpicGit
if [ -d "$CUSTOM_BACKUP/EpicGit" ]; then
    cp -r "$CUSTOM_BACKUP/EpicGit" "$PAI_DIR/skills/"
    echo "✓ Restored EpicGit"
fi

# Restore EpicWiki
if [ -d "$CUSTOM_BACKUP/EpicWiki" ]; then
    cp -r "$CUSTOM_BACKUP/EpicWiki" "$PAI_DIR/skills/"
    echo "✓ Restored EpicWiki"
fi

echo "Custom skills restored:"
ls -la "$PAI_DIR/skills/"
```

#### 5.3 Update Custom Skill Paths
```bash
echo "=== Checking Custom Skills for Path Updates ==="

# Check for breaking change references
for skill in EpicCode EpicGit EpicWiki; do
    if [ -d "$PAI_DIR/skills/$skill" ]; then
        echo "Checking $skill..."

        # Check for old paths
        grep -r "CORE/Contacts.md" "$PAI_DIR/skills/$skill" 2>/dev/null && \
            echo "  ⚠ Update needed: CORE/Contacts.md → CORE/USER/CONTACTS.md"

        grep -r "history/History/" "$PAI_DIR/skills/$skill" 2>/dev/null && \
            echo "  ⚠ Update needed: history/History/ → MEMORY/"
    fi
done
```

**Manual Step:** If references found, update them in custom skills

### Phase 6: Install Additional Packs

#### 6.1 Ask About Additional Packs
**Interactive:** Ask which packs to install:
- [ ] pai-browser-skill
- [ ] pai-prompting-skill
- [ ] pai-algorithm-skill (THE ALGORITHM)
- [ ] pai-voice-system
- [ ] pai-art-skill
- [ ] pai-agents-skill

#### 6.2 Install Selected Packs
```bash
echo "=== Installing Additional Packs ==="

REPO_DIR="/c/EpicSource/Github/Personal_AI_Infrastructure"

# For each selected pack, copy to installation
# Example: Browser skill
if [[ user_wants_browser ]]; then
    cp -r "$REPO_DIR/Packs/pai-browser-skill/src/skills/Browser" "$PAI_DIR/skills/"
    echo "✓ Browser skill installed"
fi

# Similar for other packs...
```

### Phase 7: Restore History (Selective)

#### 7.1 Ask About History Restoration
**Interactive:** Ask what to restore:
- [ ] All learnings (recommended)
- [ ] Recent sessions (last 30 days)
- [ ] All research
- [ ] Critical history only
- [ ] Skip history (fresh start)

#### 7.2 Restore Selected History
```bash
echo "=== Restoring History ==="

HISTORY_BACKUP=$(find "$LATEST_BACKUP/pai-complete" -type d -name "history" 2>/dev/null | head -1)

if [ -d "$HISTORY_BACKUP" ]; then
    # Restore learnings (recommended)
    cp -r "$HISTORY_BACKUP/learnings"/* "$PAI_DIR/MEMORY/learnings/" 2>/dev/null
    echo "✓ Learnings restored"

    # Restore research
    cp -r "$HISTORY_BACKUP/research"/* "$PAI_DIR/MEMORY/research/" 2>/dev/null
    echo "✓ Research restored"

    # Restore recent sessions
    find "$HISTORY_BACKUP/sessions" -type f -mtime -30 -exec cp {} "$PAI_DIR/MEMORY/sessions/" \; 2>/dev/null
    echo "✓ Recent sessions restored"
else
    echo "⚠ No history found in backup"
fi
```

### Phase 8: Verification

#### 8.1 Run Verification
**Invoke:** Verify workflow (Workflows/Verify.md)

### Phase 9: Final Configuration

#### 9.1 Environment Variables
```bash
echo "=== Verifying Environment ==="

# PAI_DIR should already point to correct location (fresh install in same place)
echo "Current PAI_DIR: $PAI_DIR"

if [ -d "$PAI_DIR/skills/CORE" ]; then
    echo "✓ PAI_DIR correct"
else
    echo "✗ ERROR: PAI_DIR incorrect"
fi
```

#### 9.2 Generate Installation Report
```bash
REPORT_FILE="$PAI_DIR/FRESH_INSTALL_REPORT_$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# PAI Fresh Installation Report

**Installation Date:** $(date +"%Y-%m-%d %H:%M:%S")
**Version:** v2.1.1
**Strategy:** Fresh Install
**Installation Location:** $PAI_DIR

## Installation Summary

### Source
- **Repository:** https://github.com/danielmiessler/Personal_AI_Infrastructure
- **Local Clone:** /c/EpicSource/Github/Personal_AI_Infrastructure
- **Version:** v2.1.1

### Core Components Installed
- ✓ pai-core-install v1.4.0
- ✓ MEMORY system (flattened structure)
- ✓ CORE skill (USER/SYSTEM architecture)
- ✓ Hook system
- ✓ PAISECURITYSYSTEM

### Custom Skills Restored
$([ -d "$PAI_DIR/skills/EpicCode" ] && echo "- ✓ EpicCode")
$([ -d "$PAI_DIR/skills/EpicGit" ] && echo "- ✓ EpicGit")
$([ -d "$PAI_DIR/skills/EpicWiki" ] && echo "- ✓ EpicWiki")

### Configuration
- ✓ DAIDENTITY created
- ✓ USER/ files configured
- ✓ Settings configured
- ✓ Security system configured

### History Restored
- ✓ Learnings
- ✓ Research
- ✓ Recent sessions (last 30 days)

### Backup Information
- **Location:** $LATEST_BACKUP
- **Retention:** 30 days minimum
- **Recovery:** See backup manifest for restoration instructions

## Next Steps

1. **Test Installation:**
   - Test CORE skill loads
   - Test custom Epic skills
   - Test new features

2. **Complete Configuration:**
   - Fill out remaining USER/ files
   - Customize PAISECURITYSYSTEM if needed
   - Review and adjust settings

3. **Explore New Features:**
   - PAISECURITYSYSTEM (enhanced security)
   - DAIDENTITY (AI personality)
   - Voice integration (if installed)
   - THE ALGORITHM (if installed)

4. **Install Additional Packs:**
   - pai-algorithm-skill
   - pai-voice-system
   - pai-art-skill
   - Others as needed

## Support

- Repository: https://github.com/danielmiessler/Personal_AI_Infrastructure

---
*Fresh installation completed by UpdatePAI skill*
EOF

echo "✓ Installation report created: $REPORT_FILE"
cat "$REPORT_FILE"
```

## Success Criteria

- [ ] Old installation backed up
- [ ] Old installation removed
- [ ] Fresh v2.1.1 installed
- [ ] DAIDENTITY configured
- [ ] USER/ files configured
- [ ] Custom Epic skills restored and working
- [ ] History selectively restored
- [ ] Additional packs installed (optional)
- [ ] Verification passed
- [ ] Environment configured
- [ ] Installation report generated

## Recovery

If issues occur:
```bash
# Restore from backup
rm -rf $PAI_DIR
cp -r $LATEST_BACKUP/pai-complete/ $PAI_DIR/
```

## Advantages

✓ Cleanest possible v2.1.1 installation
✓ No legacy cruft or conflicts
✓ Latest architecture from day 1
✓ All new features available

## Disadvantages

✗ More manual configuration required
✗ Must reconfigure all settings
✗ History requires selective restoration
✗ More time-intensive than hybrid approach
