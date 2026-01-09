# HybridUpdate Workflow

**RECOMMENDED STRATEGY:** Fresh install v2.1.1 in parallel location + preserve custom skills + migrate configuration.

## Objective

Safest and most effective upgrade path that:
- Gets all v2.1.1 features and architecture
- Preserves custom Epic skills
- Avoids merge conflicts
- Allows thorough testing before switching
- Enables quick rollback if needed

---

## ⚠️ CRITICAL RULES - READ FIRST

### 🚫 DO NOT Do These Until ALL Phases Complete

**These actions MUST ONLY be done in Phase 9, after all other phases are complete:**

1. **DO NOT update PAI_DIR environment variable**
   - Keep `PAI_DIR` pointing to old installation during entire process
   - Old installation remains active while building new one
   - Only update PAI_DIR in Phase 9 after everything is verified

2. **DO NOT modify ~/.claude/settings.json manually**
   - Hooks auto-configured to use `$PAI_DIR` variable
   - Settings will automatically use correct location when PAI_DIR updated
   - Manual edits during migration can cause conflicts

3. **DO NOT restart Claude Code**
   - Old hooks remain active during migration
   - New hooks activate only after PAI_DIR updated + restart
   - Restarting early causes hook conflicts

4. **DO NOT delete old installation**
   - Serves as backup and active system during migration
   - Only archive after Phase 9 when switch is complete
   - Keep for 30 days after successful switch

### ✅ Safe During Migration (Phases 1-8)

- Install all components to NEW parallel location
- Configure DAIDENTITY.md and USER/ files in new location
- Install additional packs to new location
- Read and verify new installation files
- Run verification commands on new location
- Test new installation (with temporary PAI_DIR override)

### 🎯 Update Sequence (Phase 9 ONLY)

**Only after Phases 1-8 are 100% complete:**
1. Update PAI_DIR environment variable → new location
2. Restart Claude Code → activates new hooks
3. Verify new installation active → test everything
4. Archive old installation → keep as backup

**Current PAI_DIR during migration:** Points to OLD installation (active system)
**New installation location:** Parallel directory (being built)
**Switch happens:** Phase 9, after all verification complete

---

## Prerequisites

- [ ] Backup completed (invoke Backup workflow first)
- [ ] Repository clone exists at `C:\EpicSource\Github\Personal_AI_Infrastructure`
- [ ] Repository is on latest version (git pull)
- [ ] **Understand critical rules above** - PAI_DIR stays unchanged until Phase 9

## Steps

### Phase 1: Preparation

#### 1.1 Verify Repository
```bash
echo "=== Verifying Repository ==="
cd /c/EpicSource/Github/Personal_AI_Infrastructure

# Check current branch and pull latest
git branch
git pull origin main

# Verify v2.1.1
echo "Repository version:"
grep -i "version" README.md | head -5

echo "Available packs:"
ls -la Packs/
```

#### 1.2 Create Parallel Installation Directory
```bash
# Create new installation location
NEW_PAI_DIR="/c/EpicSource/pai-v2"
echo "Creating new PAI installation at: $NEW_PAI_DIR"
mkdir -p "$NEW_PAI_DIR"

# Set temporary environment variable
export PAI_DIR_NEW="$NEW_PAI_DIR"
echo "New PAI directory: $PAI_DIR_NEW"
```

#### 1.3 Identify Custom Skills
```bash
echo "=== Identifying Custom Skills to Preserve ==="
OLD_PAI="$PAI_DIR"

# List custom Epic skills
CUSTOM_SKILLS=()
if [ -d "$OLD_PAI/skills/EpicCode" ]; then
    CUSTOM_SKILLS+=("EpicCode")
    echo "✓ Found: EpicCode"
fi

if [ -d "$OLD_PAI/skills/EpicGit" ]; then
    CUSTOM_SKILLS+=("EpicGit")
    echo "✓ Found: EpicGit"
fi

if [ -d "$OLD_PAI/skills/EpicWiki" ]; then
    CUSTOM_SKILLS+=("EpicWiki")
    echo "✓ Found: EpicWiki"
fi

echo "Custom skills to preserve: ${CUSTOM_SKILLS[@]}"
```

### Phase 2: Install v2.1.1 Core

#### 2.1 Install pai-core-install
```bash
echo "=== Installing pai-core-install v2.1.1 ==="

REPO_DIR="/c/EpicSource/Github/Personal_AI_Infrastructure"
CORE_PACK="$REPO_DIR/Packs/pai-core-install"

# Read installation instructions
cat "$CORE_PACK/INSTALL.md"
```

**Manual Step:** Follow pai-core-install wizard installation

The wizard will:
1. Analyze system (check dependencies)
2. Ask user questions (installation preferences)
3. Create backup (if existing installation detected)
4. Install core structure (MEMORY, skills/CORE, hooks)
5. Verify installation

#### 2.2 Install Core Directory Structure
```bash
echo "=== Installing Core Structure ==="

# Create base directories
mkdir -p "$NEW_PAI_DIR"/{.claude,hooks,observability,skills,tools}

# Install MEMORY system (v2.1.1 structure - flattened)
echo "Installing MEMORY system..."
cp -r "$CORE_PACK/src/MEMORY" "$NEW_PAI_DIR/"

# Verify MEMORY structure (no History/ parent in v2.1.1)
echo "MEMORY structure:"
ls -la "$NEW_PAI_DIR/MEMORY/"

# Should see: backups, decisions, execution, learnings, raw-outputs, recovery, research, security, sessions, State
# Should NOT see: History/ subdirectory
```

#### 2.3 Install CORE Skill
```bash
echo "=== Installing CORE Skill ==="

# Install new CORE structure with USER/SYSTEM
cp -r "$CORE_PACK/src/skills/CORE" "$NEW_PAI_DIR/skills/"

# Verify USER/SYSTEM structure
echo "CORE structure:"
ls -la "$NEW_PAI_DIR/skills/CORE/"
ls -la "$NEW_PAI_DIR/skills/CORE/USER/"
ls -la "$NEW_PAI_DIR/skills/CORE/SYSTEM/"

# Should see:
# USER/: ABOUTME.md, ALGOPREFS.md, ART.md, ASSETMANAGEMENT.md, BASICINFO.md,
#        CONTACTS.md, CORECONTENT.md, DAIDENTITY.md, DEFINITIONS.md,
#        PAISECURITYSYSTEM/, README.md, REMINDERS.md, RESUME.md,
#        TECHSTACKPREFERENCES.md, TELOS.md
# SYSTEM/: AGENTS.md, MEMORYSYSTEM.md, PAISYSTEMARCHITECTURE.md,
#          SKILLSYSTEM.md, THEHOOKSYSTEM.md
```

#### 2.4 Install Hooks
```bash
echo "=== Installing Hook System ==="

# Install hooks with identity support
cp -r "$CORE_PACK/src/hooks" "$NEW_PAI_DIR/"

echo "Hooks installed:"
ls -la "$NEW_PAI_DIR/hooks/"
ls -la "$NEW_PAI_DIR/hooks/lib/"

# Should see: lib/identity.ts, load-core-context.ts, security-validator.ts, etc.
```

### Phase 3: Migrate User Configuration

#### 3.1 Migrate DAIDENTITY (NEW in v2.1.1)
```bash
echo "=== Creating DAIDENTITY Configuration ==="

# This is a NEW file required in v2.1.1
# User needs to provide their AI identity information
```

**Interactive:** Ask user for identity information:
- AI Name (e.g., "Aria", "Nova", "Atlas")
- Display Name (how shown in UI)
- Color (hex code, e.g., #4A90E2)
- Voice ID (if using voice system, otherwise empty)

Create `$NEW_PAI_DIR/skills/CORE/USER/DAIDENTITY.md`:
```markdown
# Digital Assistant Identity

- **Name:** [USER_PROVIDED]
- **Display Name:** [USER_PROVIDED]
- **Color:** [USER_PROVIDED]
- **Voice ID:** [USER_PROVIDED or empty]

## Identity Notes
[Optional: User can add personality notes]
```

#### 3.2 Migrate Personal Information
```bash
echo "=== Migrating User Configuration ==="

# Migrate Contacts (old path → new path)
if [ -f "$OLD_PAI/skills/CORE/Contacts.md" ]; then
    cp "$OLD_PAI/skills/CORE/Contacts.md" "$NEW_PAI_DIR/skills/CORE/USER/CONTACTS.md"
    echo "✓ Migrated Contacts"
fi

# Migrate TechStack (renamed file)
if [ -f "$OLD_PAI/skills/CORE/CoreStack.md" ]; then
    cp "$OLD_PAI/skills/CORE/CoreStack.md" "$NEW_PAI_DIR/skills/CORE/USER/TECHSTACKPREFERENCES.md"
    echo "✓ Migrated Tech Stack Preferences"
fi

# Migrate BasicInfo if exists
if [ -f "$OLD_PAI/skills/CORE/BasicInfo.md" ]; then
    cp "$OLD_PAI/skills/CORE/BasicInfo.md" "$NEW_PAI_DIR/skills/CORE/USER/BASICINFO.md"
    echo "✓ Migrated Basic Info"
fi

# Copy any other custom USER files
# Note: Most files are NEW in v2.1.1, user will need to fill them out
```

#### 3.3 Migrate Settings
```bash
echo "=== Migrating Settings ==="

# Copy settings template
cp "$CORE_PACK/settings.json.template" "$NEW_PAI_DIR/.claude/settings.json"

# Merge old settings if needed
if [ -f "$OLD_PAI/.claude/settings.json" ]; then
    echo "Old settings found. Manual review recommended."
    echo "Old: $OLD_PAI/.claude/settings.json"
    echo "New: $NEW_PAI_DIR/.claude/settings.json"

    # Show diff for user review
    echo "=== Settings Comparison ==="
    diff "$OLD_PAI/.claude/settings.json" "$NEW_PAI_DIR/.claude/settings.json" || true
fi
```

**Manual Step:** Review and merge settings, especially:
- Hook configurations (breaking changes in v2.1.1)
- Remove pai-history-system hook references (RETIRED in v2.1.1)
- Update paths to use new directory structure

### Phase 4: Preserve Custom Skills

#### 4.1 Copy Custom Epic Skills
```bash
echo "=== Copying Custom Epic Skills ==="

for skill in "${CUSTOM_SKILLS[@]}"; do
    echo "Copying $skill..."
    cp -r "$OLD_PAI/skills/$skill" "$NEW_PAI_DIR/skills/"

    # Verify copy
    if [ -d "$NEW_PAI_DIR/skills/$skill" ]; then
        echo "✓ $skill copied successfully"
    else
        echo "✗ ERROR: Failed to copy $skill"
    fi
done

echo ""
echo "Custom skills in new installation:"
ls -la "$NEW_PAI_DIR/skills/"
```

#### 4.2 Update Path References in Custom Skills
```bash
echo "=== Updating Path References ==="

# Update old CORE structure references to new USER/SYSTEM structure
for skill in "${CUSTOM_SKILLS[@]}"; do
    SKILL_DIR="$NEW_PAI_DIR/skills/$skill"

    if [ -d "$SKILL_DIR" ]; then
        echo "Checking $skill for path updates..."

        # Find files with old CORE paths
        grep -r "CORE/Contacts.md" "$SKILL_DIR" && \
            echo "  ⚠ Found CORE/Contacts.md reference - needs update to CORE/USER/CONTACTS.md"

        grep -r "CORE/CoreStack.md" "$SKILL_DIR" && \
            echo "  ⚠ Found CORE/CoreStack.md reference - needs update to CORE/USER/TECHSTACKPREFERENCES.md"

        grep -r "history/History/" "$SKILL_DIR" && \
            echo "  ⚠ Found history/History/ reference - needs update to MEMORY/"

        grep -r "MEMORY/History/" "$SKILL_DIR" && \
            echo "  ⚠ Found MEMORY/History/ reference - needs update to MEMORY/"
    fi
done
```

**Manual Step:** If path references found, update them:
- `CORE/Contacts.md` → `CORE/USER/CONTACTS.md`
- `CORE/CoreStack.md` → `CORE/USER/TECHSTACKPREFERENCES.md`
- `history/History/` → `MEMORY/`
- `MEMORY/History/` → `MEMORY/`

### Phase 5: Selective History Migration

#### 5.1 Ask User About History
**Interactive:** Ask user which history to migrate:
- [ ] All learnings (recommended)
- [ ] Recent sessions (last 30 days)
- [ ] Critical research
- [ ] Skip history (fresh start)

#### 5.2 Migrate Selected History
```bash
echo "=== Migrating History ==="

# Migrate learnings (recommended)
if [ -d "$OLD_PAI/history/learnings" ]; then
    echo "Migrating learnings..."
    cp -r "$OLD_PAI/history/learnings"/* "$NEW_PAI_DIR/MEMORY/learnings/" 2>/dev/null
    echo "✓ Learnings migrated"
fi

# Migrate research
if [ -d "$OLD_PAI/history/research" ]; then
    echo "Migrating research..."
    cp -r "$OLD_PAI/history/research"/* "$NEW_PAI_DIR/MEMORY/research/" 2>/dev/null
    echo "✓ Research migrated"
fi

# Migrate recent sessions (optional)
# Note: Old structure was history/sessions/, new is MEMORY/sessions/
if [ -d "$OLD_PAI/history/sessions" ]; then
    echo "Migrating recent sessions..."
    find "$OLD_PAI/history/sessions" -type f -mtime -30 -exec cp {} "$NEW_PAI_DIR/MEMORY/sessions/" \;
    echo "✓ Recent sessions (last 30 days) migrated"
fi

echo ""
echo "History migration complete."
echo "New MEMORY structure:"
ls -la "$NEW_PAI_DIR/MEMORY/"
```

### Phase 6: Install Additional Packs (Optional)

#### 6.1 Ask User About Additional Packs
**Interactive:** Ask if user wants to install:
- [ ] pai-browser-skill (Browser automation)
- [ ] pai-algorithm-skill (THE ALGORITHM execution framework)
- [ ] pai-prompting-skill (Prompt engineering)
- [ ] pai-voice-system (Voice notifications)
- [ ] pai-art-skill (Art generation)

#### 6.2 Install Selected Packs
```bash
echo "=== Installing Additional Packs ==="

# Example: Install Browser skill
if [[ user wants browser ]]; then
    echo "Installing pai-browser-skill..."
    cp -r "$REPO_DIR/Packs/pai-browser-skill/src/skills/Browser" "$NEW_PAI_DIR/skills/"
    echo "✓ Browser skill installed"
fi

# Example: Install Algorithm skill
if [[ user wants algorithm ]]; then
    echo "Installing pai-algorithm-skill..."
    cp -r "$REPO_DIR/Packs/pai-algorithm-skill/src/skills/THEALGORITHM" "$NEW_PAI_DIR/skills/"
    # Copy tools
    cp -r "$REPO_DIR/Packs/pai-algorithm-skill/src/tools/Algorithm" "$NEW_PAI_DIR/tools/"
    echo "✓ Algorithm skill installed"
fi

# Similar for other packs...
```

### Phase 7: Verification

#### 7.1 Verify New Installation
```bash
echo "=== Verifying New Installation ==="

# Invoke Verify workflow on new installation
export PAI_DIR="$NEW_PAI_DIR"
```

**Invoke:** Verify workflow (Workflows/Verify.md) to check:
- Directory structure
- CORE skill integrity
- Custom skills present
- Settings valid
- No broken path references

### Phase 8: Testing

#### 8.1 Test in Parallel
```bash
echo "=== Testing New Installation ==="
echo "Old PAI_DIR: $OLD_PAI"
echo "New PAI_DIR: $NEW_PAI_DIR"
echo ""
echo "You can now test the new installation without affecting the old one."
```

**Manual Testing Steps:**
1. Open new Claude Code session with `PAI_DIR=$NEW_PAI_DIR`
2. Test CORE skill loads correctly
3. Test custom Epic skills work
4. Test new features (DAIDENTITY, PAISECURITYSYSTEM)
5. Test workflows
6. Verify memory system

#### 8.2 User Acceptance
**Interactive:** Ask user:
- Does new installation work correctly?
- Are custom skills functioning?
- Ready to switch to new installation?

### Phase 9: Switch to New Installation

**⚠️ CRITICAL: Only proceed with Phase 9 after ALL previous phases are 100% complete:**
- ✅ Phase 1-2: Core installation complete
- ✅ Phase 3: User configuration migrated
- ✅ Phase 4: Custom skills preserved and updated
- ✅ Phase 5: History migrated
- ✅ Phase 6: Additional packs installed (if desired)
- ✅ Phase 7: Verification passed
- ✅ Phase 8: Testing completed successfully

**DO NOT proceed if any phase is incomplete or had errors.**

---

#### 9.1 Pre-Switch Verification

```bash
echo "=== Pre-Switch Verification ==="
echo ""
echo "Verify ALL phases complete before switching:"
echo ""

# Check new installation structure
if [ -f "$NEW_PAI_DIR/skills/CORE/SKILL.md" ]; then
    echo "✓ CORE skill installed"
else
    echo "✗ CORE skill missing - DO NOT SWITCH"
    exit 1
fi

if [ -f "$NEW_PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]; then
    echo "✓ DAIDENTITY configured"
else
    echo "✗ DAIDENTITY not configured - DO NOT SWITCH"
    exit 1
fi

# Check hooks installed
if [ -f "$NEW_PAI_DIR/hooks/security-validator.ts" ]; then
    echo "✓ Hooks installed"
else
    echo "✗ Hooks missing - DO NOT SWITCH"
    exit 1
fi

# Check custom skills
for skill in "${CUSTOM_SKILLS[@]}"; do
    if [ -d "$NEW_PAI_DIR/skills/$skill" ]; then
        echo "✓ $skill present"
    else
        echo "✗ $skill missing - DO NOT SWITCH"
        exit 1
    fi
done

echo ""
echo "✓ All critical components present"
echo "✓ Safe to proceed with switch"
```

#### 9.2 Update Environment Variable

**⚠️ POINT OF NO RETURN - After this step, new installation becomes active**

```bash
echo "=== Switching to New Installation ==="
echo ""
echo "Current PAI_DIR: $PAI_DIR (old installation)"
echo "New PAI_DIR will be: $NEW_PAI_DIR"
echo ""
echo "This is the POINT OF NO RETURN."
echo "After updating PAI_DIR, the new installation becomes active."
echo ""

# Update PAI_DIR environment variable
# For PowerShell:
echo "Run this command in PowerShell:"
echo "[System.Environment]::SetEnvironmentVariable('PAI_DIR', 'C:\EpicSource\pai_v2', 'User')"
echo ""

# For bash profile (if using Git Bash):
echo "Add to ~/.bashrc:"
echo "export PAI_DIR=/c/EpicSource/pai_v2"
echo ""
```

**Manual Step:** User updates PAI_DIR environment variable

**After updating PAI_DIR:**
- Restart terminal/shell to pick up new variable
- Verify: `echo $PAI_DIR` should show new location
- Claude Code will use new installation on next start

#### 9.3 Restart Claude Code

```bash
echo "=== Next Steps ==="
echo ""
echo "1. Close this Claude Code session"
echo "2. Restart terminal (to load new PAI_DIR)"
echo "3. Verify PAI_DIR updated: echo \$PAI_DIR"
echo "4. Start new Claude Code session"
echo "5. New hooks and installation will activate"
echo ""
echo "The new installation is now active!"
```

**Manual Step:** Restart Claude Code

**NOTE:** ~/.claude/settings.json does NOT need manual updates because:
- Hooks are configured with `$PAI_DIR` variable
- They automatically use whatever PAI_DIR points to
- No manual settings.json editing required

#### 9.4 Verify New Installation Active

```bash
echo "=== Verifying New Installation Active ==="

# In new Claude Code session, check PAI_DIR
echo "Current PAI_DIR: $PAI_DIR"

if [[ "$PAI_DIR" == *"pai_v2"* ]] || [[ "$PAI_DIR" == *"pai-v2"* ]]; then
    echo "✓ PAI_DIR correctly points to new installation"
else
    echo "✗ PAI_DIR still points to old location"
    echo "Please restart terminal and try again"
    exit 1
fi

# Verify CORE loads from new location
if [ -f "$PAI_DIR/skills/CORE/SKILL.md" ]; then
    echo "✓ CORE skill accessible from new location"
else
    echo "✗ Cannot access CORE skill"
    exit 1
fi

echo ""
echo "✓ New installation is active and working!"
```

#### 9.3 Archive Old Installation
```bash
echo "=== Archiving Old Installation ==="

# Rename old installation for 30-day retention
OLD_ARCHIVE="/c/EpicSource/pai-v1-archived-$(date +%Y%m%d)"
mv "$OLD_PAI" "$OLD_ARCHIVE"

echo "✓ Old installation archived to: $OLD_ARCHIVE"
echo "Keep for 30 days, then delete if no issues with v2.1.1"
```

### Phase 10: Final Verification

#### 10.1 Verify Environment
```bash
echo "=== Final Verification ==="

# Restart shell to pick up new PAI_DIR
echo "Current PAI_DIR: $PAI_DIR"

# Should point to new installation
if [[ "$PAI_DIR" == *"pai-v2"* ]]; then
    echo "✓ PAI_DIR correctly points to new installation"
else
    echo "⚠ Warning: PAI_DIR may not be updated. Restart shell."
fi

# Verify new installation loads
ls -la "$PAI_DIR/skills/CORE/"
```

#### 10.2 Generate Migration Report
```bash
REPORT_FILE="$NEW_PAI_DIR/MIGRATION_REPORT_$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# PAI Migration Report

**Migration Date:** $(date +"%Y-%m-%d %H:%M:%S")
**Strategy:** Hybrid Update
**Old Installation:** $OLD_ARCHIVE
**New Installation:** $NEW_PAI_DIR

## Migration Summary

### Installed Version
- **Version:** v2.1.1
- **Source:** C:\EpicSource\Github\Personal_AI_Infrastructure

### Custom Skills Preserved
$(for skill in "${CUSTOM_SKILLS[@]}"; do echo "- ✓ $skill"; done)

### Configuration Migrated
- ✓ Personal information (Contacts, Tech Stack)
- ✓ DAIDENTITY created
- ✓ Settings migrated and updated
- ✓ Hooks configured

### History Migrated
- ✓ Learnings
- ✓ Research
- ✓ Recent sessions (last 30 days)

### New Features Available
- ✓ PAISECURITYSYSTEM (enhanced security)
- ✓ USER/SYSTEM architecture
- ✓ MEMORY system (flattened structure)
- ✓ DAIDENTITY (AI identity)
- ✓ Voice integration hooks (if voice pack installed)
- ✓ Wizard installers
- ✓ New packs available

### Breaking Changes Handled
- ✓ pai-history-system retirement (migrated to MEMORY)
- ✓ CORE restructuring (USER/SYSTEM separation)
- ✓ MEMORY flattening (removed History/ parent)
- ✓ Path references updated in custom skills
- ✓ Settings updated for v2.1.1

## Archive Information

**Old Installation Location:** $OLD_ARCHIVE
**Retention Period:** 30 days
**Delete After:** $(date -d "+30 days" +"%Y-%m-%d" 2>/dev/null || date -v +30d +"%Y-%m-%d" 2>/dev/null)

## Rollback Procedure (if needed)

\`\`\`bash
# Stop any running PAI processes

# Restore old installation
mv $OLD_ARCHIVE /c/EpicSource/pai

# Update PAI_DIR back to original
export PAI_DIR=/c/EpicSource/pai

# Restart shell
\`\`\`

## Next Steps

1. Test all custom skills thoroughly
2. Explore new features (PAISECURITYSYSTEM, voice, algorithm)
3. Fill out remaining USER/ configuration files
4. Install additional packs if desired
5. Delete old archive after 30 days if no issues

## Support

- Repository: https://github.com/danielmiessler/Personal_AI_Infrastructure
- Issues: Report to repository

---
*Migration completed by UpdatePAI skill - HybridUpdate workflow*
EOF

echo "✓ Migration report created: $REPORT_FILE"
cat "$REPORT_FILE"
```

## Success Criteria

- [ ] New v2.1.1 installation in parallel location
- [ ] Custom Epic skills copied and working
- [ ] User configuration migrated (DAIDENTITY, CONTACTS, TECHSTACK)
- [ ] Settings updated for v2.1.1
- [ ] History selectively migrated
- [ ] Path references updated
- [ ] Verification passed
- [ ] Testing completed successfully
- [ ] PAI_DIR environment variable updated
- [ ] Old installation archived
- [ ] Migration report generated

## Rollback Plan

If issues occur:
1. Restore from backup (Workflows/Backup.md restoration instructions)
2. Or revert PAI_DIR to archived v1 installation
3. Debug issues before retrying

## Advantages of Hybrid Approach

✓ Clean v2.1.1 architecture (no merge conflicts)
✓ All new features available immediately
✓ Custom work fully preserved
✓ Thorough testing before switching
✓ Quick rollback capability
✓ Old installation archived for safety
✓ Lowest risk of all strategies
