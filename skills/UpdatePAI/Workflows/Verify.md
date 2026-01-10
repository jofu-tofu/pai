# Verify Workflow

Comprehensive verification of PAI installation integrity.

## Context

Checks directory structure, skill files, configuration, hooks, and security system to ensure installation is healthy.

## Instructions

### 1. Verify PAI_DIR

```bash
if [ -z "$PAI_DIR" ] || [ ! -d "$PAI_DIR" ]; then
    echo "ERROR: PAI_DIR not set or does not exist"
    exit 1
fi
echo "PAI_DIR: $PAI_DIR"
```

### 2. Verify Directory Structure

```bash
REQUIRED=(".claude" "skills" "hooks")
OPTIONAL=("MEMORY" "history" "tools" "observability")

for dir in "${REQUIRED[@]}"; do
    [ -d "$PAI_DIR/$dir" ] && echo "OK: $dir/" || echo "ERROR: $dir/ missing"
done

for dir in "${OPTIONAL[@]}"; do
    [ -d "$PAI_DIR/$dir" ] && echo "OK: $dir/" || echo "INFO: $dir/ not present"
done
```

### 3. Verify MEMORY Structure

```bash
if [ -d "$PAI_DIR/MEMORY" ]; then
    if [ -d "$PAI_DIR/MEMORY/sessions" ] && [ ! -d "$PAI_DIR/MEMORY/History" ]; then
        echo "OK: MEMORY structure (v2 flattened)"
    elif [ -d "$PAI_DIR/MEMORY/History" ]; then
        echo "WARNING: MEMORY/History/ detected (v1 structure - outdated)"
    fi
elif [ -d "$PAI_DIR/history" ]; then
    echo "INFO: Using old history/ directory (v1)"
fi
```

### 4. Verify CORE Skill

```bash
if [ ! -d "$PAI_DIR/skills/CORE" ]; then
    echo "ERROR: CORE skill missing"
    exit 1
fi

# Check structure
if [ -d "$PAI_DIR/skills/CORE/USER" ] && [ -d "$PAI_DIR/skills/CORE/SYSTEM" ]; then
    echo "OK: CORE structure (USER/SYSTEM)"

    # Check key files
    [ -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ] && echo "OK: DAIDENTITY.md" || echo "WARNING: DAIDENTITY.md missing"
    [ -d "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM" ] && echo "OK: PAISECURITYSYSTEM" || echo "INFO: PAISECURITYSYSTEM not installed"
else
    echo "WARNING: CORE has flat structure (v1)"
fi

# Verify SKILL.md
[ -f "$PAI_DIR/skills/CORE/SKILL.md" ] && echo "OK: CORE/SKILL.md" || echo "ERROR: CORE/SKILL.md missing"
```

### 5. Verify All Skills

```bash
ERROR_COUNT=0

for skill_dir in "$PAI_DIR/skills"/*/; do
    skill_name=$(basename "$skill_dir")

    if [ ! -f "$skill_dir/SKILL.md" ]; then
        echo "ERROR: $skill_name missing SKILL.md"
        ERROR_COUNT=$((ERROR_COUNT + 1))
        continue
    fi

    # Check frontmatter
    if ! grep -q "^name:" "$skill_dir/SKILL.md"; then
        echo "ERROR: $skill_name SKILL.md missing name field"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi

    # Check workflow references
    for workflow in $(grep -o "Workflows/[^)]*\.md" "$skill_dir/SKILL.md" 2>/dev/null); do
        [ -f "$skill_dir/$workflow" ] || echo "ERROR: $skill_name $workflow missing"
    done
done

echo "Skills checked. Errors: $ERROR_COUNT"
```

### 6. Verify Custom Skills Path References

```bash
for skill in EpicCode EpicGit EpicWiki; do
    if [ -d "$PAI_DIR/skills/$skill" ]; then
        grep -r "CORE/Contacts.md" "$PAI_DIR/skills/$skill" 2>/dev/null && \
            echo "WARNING: $skill has outdated CORE/Contacts.md reference"
        grep -r "history/History/" "$PAI_DIR/skills/$skill" 2>/dev/null && \
            echo "WARNING: $skill has outdated history/History/ reference"
    fi
done
```

### 7. Verify Hooks

```bash
if [ -d "$PAI_DIR/hooks" ]; then
    echo "OK: Hooks directory"
    ls "$PAI_DIR/hooks/"*.ts 2>/dev/null | head -5

    # Check for retired hooks
    for hook in capture-all-events.ts capture-session-summary.ts; do
        [ -f "$PAI_DIR/hooks/$hook" ] && echo "WARNING: Retired hook found: $hook"
    done
fi
```

### 8. Verify Settings

```bash
SETTINGS="$PAI_DIR/.claude/settings.json"

if [ -f "$SETTINGS" ]; then
    echo "OK: settings.json exists"

    # Check for retired references
    grep -q "pai-history-system" "$SETTINGS" && \
        echo "WARNING: pai-history-system reference in settings (retired)"

    # Validate JSON
    command -v jq &>/dev/null && jq empty "$SETTINGS" 2>/dev/null && echo "OK: Valid JSON"
else
    echo "WARNING: settings.json not found"
fi
```

### 9. Detect Version

```bash
if [ -d "$PAI_DIR/skills/CORE/USER" ] && [ ! -d "$PAI_DIR/MEMORY/History" ]; then
    [ -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ] && VERSION="v2.1.1+" || VERSION="v2.0.x"
elif [ -d "$PAI_DIR/skills/CORE/USER" ]; then
    VERSION="v1.1.0-v1.4.0"
elif [ -f "$PAI_DIR/skills/CORE/Contacts.md" ]; then
    VERSION="v1.0.x"
else
    VERSION="Unknown"
fi

echo "Detected version: $VERSION"
```

## Output

Report includes:
1. Directory structure validation
2. Version detection
3. CORE skill integrity
4. Custom skill validation
5. Hook system verification
6. Settings verification
7. Overall health status

## Success Criteria

- [ ] PAI_DIR valid
- [ ] Required directories exist
- [ ] CORE skill complete
- [ ] All SKILL.md files valid
- [ ] No broken workflow references
- [ ] No outdated path references
- [ ] No retired hook references
- [ ] Settings valid
