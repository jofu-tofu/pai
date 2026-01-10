# FreshInstall Workflow

Complete clean slate installation of latest PAI version.

## Context

Removes old installation and installs fresh from repository. Use when installation is corrupted or clean start preferred.

## Prerequisites

- [ ] Backup completed (run Backup workflow first)
- [ ] Repository clone at `/c/EpicSource/Github/Personal_AI_Infrastructure`
- [ ] Repository up to date (`git pull`)

## Instructions

### Phase 1: Verify Backup

```bash
LATEST_BACKUP=$(ls -td /c/EpicSource/pai-backup-* | head -1)

if [ ! -d "$LATEST_BACKUP" ]; then
    echo "ERROR: No backup found. Run Backup workflow first."
    exit 1
fi

echo "Backup verified: $LATEST_BACKUP"
```

### Phase 2: Remove Old Installation

**Ask user to confirm before proceeding.**

```bash
rm -rf "$PAI_DIR"

if [ ! -d "$PAI_DIR" ]; then
    echo "Old installation removed"
else
    echo "ERROR: Failed to remove old installation"
    exit 1
fi
```

### Phase 3: Install Fresh

```bash
REPO_DIR="/c/EpicSource/Github/Personal_AI_Infrastructure"
CORE_PACK="$REPO_DIR/Packs/pai-core-install"

# Create directory structure
mkdir -p "$PAI_DIR"/{.claude,hooks,observability,skills,tools}

# Install core components
cp -r "$CORE_PACK/src/MEMORY" "$PAI_DIR/"
cp -r "$CORE_PACK/src/skills/CORE" "$PAI_DIR/skills/"
cp -r "$CORE_PACK/src/hooks" "$PAI_DIR/"
cp "$CORE_PACK/settings.json.template" "$PAI_DIR/.claude/settings.json"
```

### Phase 4: Configure DAIDENTITY

Ask user for identity configuration:
- AI Name
- Display Name
- Color (hex)
- Voice ID (optional)

```bash
cat > "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" << EOF
# Digital Assistant Identity
- **Name:** [AI_NAME]
- **Display Name:** [DISPLAY_NAME]
- **Color:** [COLOR]
- **Voice ID:** [VOICE_ID]
EOF
```

### Phase 5: Restore Custom Skills

```bash
CUSTOM_BACKUP=$(ls -td /c/EpicSource/pai-custom-skills-* | head -1)

for skill in EpicCode EpicGit EpicWiki; do
    if [ -d "$CUSTOM_BACKUP/$skill" ]; then
        cp -r "$CUSTOM_BACKUP/$skill" "$PAI_DIR/skills/"
        echo "Restored: $skill"
    fi
done
```

### Phase 6: Update Custom Skill Paths

Check and update outdated path references:

```bash
for skill in EpicCode EpicGit EpicWiki; do
    if [ -d "$PAI_DIR/skills/$skill" ]; then
        # Check for old paths
        grep -r "CORE/Contacts.md" "$PAI_DIR/skills/$skill" && \
            echo "Update needed: CORE/Contacts.md -> CORE/USER/CONTACTS.md"
        grep -r "history/History/" "$PAI_DIR/skills/$skill" && \
            echo "Update needed: history/History/ -> MEMORY/"
    fi
done
```

### Phase 7: Restore History

Ask which history to restore:
- All learnings (recommended)
- Recent sessions (last 30 days)
- Research
- Skip (fresh start)

```bash
HISTORY_BACKUP=$(find "$LATEST_BACKUP/pai-complete" -type d -name "history" | head -1)

# Restore learnings
cp -r "$HISTORY_BACKUP/learnings"/* "$PAI_DIR/MEMORY/learnings/" 2>/dev/null

# Restore recent sessions
find "$HISTORY_BACKUP/sessions" -type f -mtime -30 -exec cp {} "$PAI_DIR/MEMORY/sessions/" \; 2>/dev/null
```

### Phase 8: Install Additional Packs

Ask which packs to install:
- pai-browser-skill
- pai-algorithm-skill
- pai-prompting-skill
- pai-voice-system
- pai-art-skill

### Phase 9: Verify

Run Verify workflow to check installation.

## Success Criteria

- [ ] Old installation removed
- [ ] Fresh core installed
- [ ] DAIDENTITY configured
- [ ] Custom skills restored
- [ ] History restored
- [ ] Additional packs installed
- [ ] Verification passed

## Rollback

```bash
rm -rf "$PAI_DIR"
cp -r "$LATEST_BACKUP/pai-complete/" "$PAI_DIR/"
```
