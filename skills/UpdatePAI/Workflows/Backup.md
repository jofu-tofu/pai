# Backup Workflow

Create comprehensive timestamped backup of current PAI installation.

## Context

Preserves complete installation including custom skills, settings, history, and configuration before making changes.

## Instructions

### 1. Create Backup Directories

```bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/c/EpicSource/pai-backup-$TIMESTAMP"
CUSTOM_SKILLS_DIR="/c/EpicSource/pai-custom-skills-$TIMESTAMP"

mkdir -p "$BACKUP_DIR"
mkdir -p "$CUSTOM_SKILLS_DIR"
```

### 2. Backup Complete Installation

```bash
cp -r "$PAI_DIR" "$BACKUP_DIR/pai-complete/"
echo "Backup size: $(du -sh "$BACKUP_DIR/pai-complete/" | cut -f1)"
```

### 3. Backup Custom Skills Separately

```bash
for skill in EpicCode EpicGit EpicWiki; do
    if [ -d "$PAI_DIR/skills/$skill" ]; then
        cp -r "$PAI_DIR/skills/$skill" "$CUSTOM_SKILLS_DIR/"
        echo "Backed up: $skill"
    fi
done
```

### 4. Backup Settings

```bash
[ -f "$PAI_DIR/.claude/settings.json" ] && \
    cp "$PAI_DIR/.claude/settings.json" "/c/Users/$USER/pai-settings-backup-$TIMESTAMP.json"
```

### 5. Backup History

```bash
HISTORY_BACKUP="/c/EpicSource/pai-history-backup-$TIMESTAMP"
mkdir -p "$HISTORY_BACKUP"
cp -r "$PAI_DIR/history" "$HISTORY_BACKUP/" 2>/dev/null || \
    cp -r "$PAI_DIR/MEMORY" "$HISTORY_BACKUP/"
```

### 6. Create Manifest

```bash
cat > "$BACKUP_DIR/BACKUP_MANIFEST.md" << EOF
# PAI Backup Manifest

**Date:** $(date +"%Y-%m-%d %H:%M:%S")
**Original PAI_DIR:** $PAI_DIR

## Locations
- Complete: $BACKUP_DIR/pai-complete/
- Custom Skills: $CUSTOM_SKILLS_DIR/
- History: $HISTORY_BACKUP/
- Settings: /c/Users/$USER/pai-settings-backup-$TIMESTAMP.json

## Restoration
\`\`\`bash
cp -r $BACKUP_DIR/pai-complete/ $PAI_DIR/
\`\`\`

**Retention:** 30 days minimum
EOF
```

### 7. Verify Backup

```bash
[ -d "$BACKUP_DIR/pai-complete" ] && echo "Complete backup: OK" || echo "ERROR: Backup failed"
[ -f "$BACKUP_DIR/pai-complete/skills/CORE/SKILL.md" ] && echo "CORE skill: OK" || echo "ERROR: CORE missing"
```

## Output

Report backup locations, sizes, and verification status.

## Success Criteria

- [ ] Complete installation backed up
- [ ] Custom skills backed up separately
- [ ] Settings backed up
- [ ] History backed up
- [ ] Manifest created
- [ ] Backup verified
