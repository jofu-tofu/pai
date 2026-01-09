# Verify Workflow

Comprehensive verification of PAI installation integrity and correctness.

## Objective

Verify installation health by checking:
- Directory structure
- SKILL.md files and frontmatter
- Workflow file references
- Configuration completeness
- Hook system
- Security system
- Custom skills
- Path references

## Steps

### 1. Verify PAI_DIR
```bash
echo "=== Verifying PAI_DIR ==="
echo "PAI_DIR: $PAI_DIR"

if [ -z "$PAI_DIR" ]; then
    echo "✗ ERROR: PAI_DIR not set"
    exit 1
fi

if [ ! -d "$PAI_DIR" ]; then
    echo "✗ ERROR: PAI_DIR directory does not exist"
    exit 1
fi

echo "✓ PAI_DIR is set and exists"
```

### 2. Verify Directory Structure
```bash
echo "=== Verifying Directory Structure ==="

# Check required top-level directories
REQUIRED_DIRS=(".claude" "skills" "hooks")
OPTIONAL_DIRS=("MEMORY" "history" "tools" "observability")

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$PAI_DIR/$dir" ]; then
        echo "✓ $dir/ exists"
    else
        echo "✗ ERROR: $dir/ missing (REQUIRED)"
    fi
done

for dir in "${OPTIONAL_DIRS[@]}"; do
    if [ -d "$PAI_DIR/$dir" ]; then
        echo "✓ $dir/ exists"
    else
        echo "ℹ Info: $dir/ not present (optional)"
    fi
done
```

### 3. Verify MEMORY/History Structure
```bash
echo "=== Verifying MEMORY Structure ==="

# Check for v2.1.1 structure (flattened) vs old structure (History/ parent)
if [ -d "$PAI_DIR/MEMORY" ]; then
    echo "✓ MEMORY directory exists"

    # Check if it's the new flattened structure (v2.1.1)
    if [ -d "$PAI_DIR/MEMORY/sessions" ] && [ ! -d "$PAI_DIR/MEMORY/History" ]; then
        echo "✓ MEMORY structure is v2.1.1 (flattened - correct)"

        # Check for new v2.1.1 directories
        V2_DIRS=("backups" "decisions" "execution" "recovery" "security" "State")
        for dir in "${V2_DIRS[@]}"; do
            if [ -d "$PAI_DIR/MEMORY/$dir" ]; then
                echo "  ✓ $dir/ exists (v2.1.1 feature)"
            fi
        done

    elif [ -d "$PAI_DIR/MEMORY/History" ]; then
        echo "⚠ WARNING: MEMORY/History/ structure detected (v1.x - outdated)"
        echo "  Consider updating to v2.1.1 flattened structure"
    fi

elif [ -d "$PAI_DIR/history" ]; then
    echo "ℹ Info: Using old history/ directory (v1.x)"
    echo "  Consider migrating to MEMORY/ structure (v2.1.1)"
else
    echo "⚠ Warning: No MEMORY or history directory found"
fi
```

### 4. Verify CORE Skill Structure
```bash
echo "=== Verifying CORE Skill ==="

if [ ! -d "$PAI_DIR/skills/CORE" ]; then
    echo "✗ ERROR: CORE skill missing (CRITICAL)"
    exit 1
fi

echo "✓ CORE skill exists"

# Check for v2.1.1 structure (USER/SYSTEM) vs old structure (flat)
if [ -d "$PAI_DIR/skills/CORE/USER" ] && [ -d "$PAI_DIR/skills/CORE/SYSTEM" ]; then
    echo "✓ CORE structure is v2.1.1 (USER/SYSTEM - correct)"

    # Verify USER/ files
    echo "  Checking USER/ files..."
    USER_FILES=("DAIDENTITY.md" "CONTACTS.md" "TECHSTACKPREFERENCES.md" "BASICINFO.md")
    for file in "${USER_FILES[@]}"; do
        if [ -f "$PAI_DIR/skills/CORE/USER/$file" ]; then
            echo "  ✓ USER/$file exists"
        else
            echo "  ⚠ Warning: USER/$file missing"
        fi
    done

    # Check PAISECURITYSYSTEM
    if [ -d "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM" ]; then
        echo "  ✓ PAISECURITYSYSTEM directory exists"

        if [ -f "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM/patterns.yaml" ]; then
            echo "    ✓ patterns.yaml exists"
        else
            echo "    ⚠ Warning: patterns.yaml missing"
        fi
    else
        echo "  ℹ Info: PAISECURITYSYSTEM not installed (v2.1.1 feature)"
    fi

    # Verify SYSTEM/ files
    echo "  Checking SYSTEM/ files..."
    SYSTEM_FILES=("PAISYSTEMARCHITECTURE.md" "SKILLSYSTEM.md" "MEMORYSYSTEM.md")
    for file in "${SYSTEM_FILES[@]}"; do
        if [ -f "$PAI_DIR/skills/CORE/SYSTEM/$file" ]; then
            echo "  ✓ SYSTEM/$file exists"
        else
            echo "  ⚠ Warning: SYSTEM/$file missing"
        fi
    done

elif [ -f "$PAI_DIR/skills/CORE/Contacts.md" ]; then
    echo "⚠ WARNING: CORE has old flat structure (v1.x)"
    echo "  Found: Contacts.md, CoreStack.md, etc."
    echo "  Consider updating to USER/SYSTEM structure (v2.1.1)"
else
    echo "✗ ERROR: CORE structure is invalid"
fi

# Verify CORE SKILL.md
if [ -f "$PAI_DIR/skills/CORE/SKILL.md" ]; then
    echo "✓ CORE/SKILL.md exists"

    # Check frontmatter
    if grep -q "^name: CORE" "$PAI_DIR/skills/CORE/SKILL.md"; then
        echo "  ✓ SKILL.md has valid frontmatter"
    else
        echo "  ⚠ Warning: SKILL.md frontmatter may be invalid"
    fi
else
    echo "✗ ERROR: CORE/SKILL.md missing"
fi
```

### 5. Verify Custom Skills
```bash
echo "=== Verifying Custom Skills ==="

# Check for Epic skills
CUSTOM_SKILLS=("EpicCode" "EpicGit" "EpicWiki")
FOUND_CUSTOM=0

for skill in "${CUSTOM_SKILLS[@]}"; do
    if [ -d "$PAI_DIR/skills/$skill" ]; then
        echo "✓ Custom skill found: $skill"
        FOUND_CUSTOM=$((FOUND_CUSTOM + 1))

        # Verify SKILL.md
        if [ -f "$PAI_DIR/skills/$skill/SKILL.md" ]; then
            echo "  ✓ $skill/SKILL.md exists"
        else
            echo "  ✗ ERROR: $skill/SKILL.md missing"
        fi

        # Check for old path references (breaking changes)
        echo "  Checking for outdated path references..."

        if grep -r "CORE/Contacts.md" "$PAI_DIR/skills/$skill" 2>/dev/null; then
            echo "  ⚠ WARNING: Found CORE/Contacts.md reference"
            echo "    Should be: CORE/USER/CONTACTS.md (v2.1.1)"
        fi

        if grep -r "history/History/" "$PAI_DIR/skills/$skill" 2>/dev/null; then
            echo "  ⚠ WARNING: Found history/History/ reference"
            echo "    Should be: MEMORY/ (v2.1.1)"
        fi

        if grep -r "MEMORY/History/" "$PAI_DIR/skills/$skill" 2>/dev/null; then
            echo "  ⚠ WARNING: Found MEMORY/History/ reference"
            echo "    Should be: MEMORY/ (v2.1.1)"
        fi
    fi
done

if [ $FOUND_CUSTOM -eq 0 ]; then
    echo "ℹ Info: No custom Epic skills found"
fi
```

### 6. Verify All Skills
```bash
echo "=== Verifying All Skills ==="

SKILL_COUNT=0
ERROR_COUNT=0

for skill_dir in "$PAI_DIR/skills"/*/; do
    if [ -d "$skill_dir" ]; then
        skill_name=$(basename "$skill_dir")
        SKILL_COUNT=$((SKILL_COUNT + 1))

        echo "Checking: $skill_name"

        # Check SKILL.md exists
        if [ ! -f "$skill_dir/SKILL.md" ]; then
            echo "  ✗ ERROR: SKILL.md missing"
            ERROR_COUNT=$((ERROR_COUNT + 1))
            continue
        fi

        # Verify frontmatter
        if ! grep -q "^---" "$skill_dir/SKILL.md"; then
            echo "  ⚠ Warning: SKILL.md missing frontmatter"
        else
            # Check for required fields
            if ! grep -q "^name:" "$skill_dir/SKILL.md"; then
                echo "  ✗ ERROR: SKILL.md missing 'name' field"
                ERROR_COUNT=$((ERROR_COUNT + 1))
            fi

            if ! grep -q "^description:.*USE WHEN" "$skill_dir/SKILL.md"; then
                echo "  ⚠ Warning: SKILL.md missing 'USE WHEN' in description"
            fi
        fi

        # Check for Tools directory
        if [ ! -d "$skill_dir/Tools" ]; then
            echo "  ℹ Info: No Tools/ directory (optional)"
        fi

        # Check for Workflows directory
        if [ -d "$skill_dir/Workflows" ]; then
            echo "  ✓ Workflows/ directory exists"

            # Verify workflow references
            WORKFLOWS=$(grep -o "Workflows/[^)]*\.md" "$skill_dir/SKILL.md" 2>/dev/null)
            for workflow in $WORKFLOWS; do
                if [ -f "$skill_dir/$workflow" ]; then
                    echo "    ✓ $workflow exists"
                else
                    echo "    ✗ ERROR: $workflow referenced but missing"
                    ERROR_COUNT=$((ERROR_COUNT + 1))
                fi
            done
        fi
    fi
done

echo ""
echo "Total skills checked: $SKILL_COUNT"
if [ $ERROR_COUNT -eq 0 ]; then
    echo "✓ All skills valid"
else
    echo "✗ Found $ERROR_COUNT errors"
fi
```

### 7. Verify Hook System
```bash
echo "=== Verifying Hook System ==="

if [ ! -d "$PAI_DIR/hooks" ]; then
    echo "ℹ Info: No hooks directory"
else
    echo "✓ Hooks directory exists"

    # List hooks
    echo "Installed hooks:"
    ls -la "$PAI_DIR/hooks/"*.ts 2>/dev/null || echo "  No .ts hooks found"

    # Check for identity library (v2.1.1 feature)
    if [ -f "$PAI_DIR/hooks/lib/identity.ts" ]; then
        echo "  ✓ identity.ts library exists (v2.1.1 feature)"
    else
        echo "  ℹ Info: identity.ts not found (v1.x or not using identity features)"
    fi

    # Check for retired pai-history-system hooks (breaking change)
    RETIRED_HOOKS=("capture-all-events.ts" "capture-session-summary.ts" "stop-hook.ts" "subagent-stop-hook.ts")
    for hook in "${RETIRED_HOOKS[@]}"; do
        if [ -f "$PAI_DIR/hooks/$hook" ]; then
            echo "  ⚠ WARNING: Found retired hook: $hook"
            echo "    This hook was retired in v2.1.1 (pai-history-system removal)"
        fi
    done
fi
```

### 8. Verify Settings
```bash
echo "=== Verifying Settings ==="

SETTINGS_FILE="$PAI_DIR/.claude/settings.json"

if [ ! -f "$SETTINGS_FILE" ]; then
    echo "⚠ Warning: settings.json not found"
    echo "  Expected: $SETTINGS_FILE"
else
    echo "✓ settings.json exists"

    # Check for retired hook references
    if grep -q "pai-history-system" "$SETTINGS_FILE" 2>/dev/null; then
        echo "  ⚠ WARNING: Found pai-history-system reference in settings"
        echo "    This pack was retired in v2.1.1"
        echo "    Remove hook references to avoid errors"
    fi

    # Check if valid JSON
    if command -v jq &> /dev/null; then
        if jq empty "$SETTINGS_FILE" 2>/dev/null; then
            echo "  ✓ Valid JSON format"
        else
            echo "  ✗ ERROR: Invalid JSON format"
        fi
    fi
fi
```

### 9. Verify Security System
```bash
echo "=== Verifying Security System ==="

SECURITY_DIR="$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM"

if [ -d "$SECURITY_DIR" ]; then
    echo "✓ PAISECURITYSYSTEM directory exists"

    # Check critical files
    if [ -f "$SECURITY_DIR/patterns.yaml" ]; then
        echo "  ✓ patterns.yaml exists"

        # Validate YAML if possible
        if command -v yamllint &> /dev/null; then
            yamllint "$SECURITY_DIR/patterns.yaml" 2>/dev/null && \
                echo "    ✓ Valid YAML format"
        fi
    else
        echo "  ✗ ERROR: patterns.yaml missing (CRITICAL)"
    fi

    # Check documentation files
    SECURITY_DOCS=("README.md" "ARCHITECTURE.md" "COMMANDINJECTION.md" "PROMPTINJECTION.md")
    for doc in "${SECURITY_DOCS[@]}"; do
        if [ -f "$SECURITY_DIR/$doc" ]; then
            echo "  ✓ $doc exists"
        else
            echo "  ℹ Info: $doc not found"
        fi
    done
else
    echo "ℹ Info: PAISECURITYSYSTEM not installed (v2.1.1 feature)"
    echo "  Consider installing for enhanced security"
fi
```

### 10. Version Detection
```bash
echo "=== Detecting PAI Version ==="

# Detect version based on structure
VERSION="Unknown"

if [ -d "$PAI_DIR/skills/CORE/USER" ] && [ -d "$PAI_DIR/skills/CORE/SYSTEM" ]; then
    if [ -d "$PAI_DIR/MEMORY" ] && [ ! -d "$PAI_DIR/MEMORY/History" ]; then
        if [ -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]; then
            VERSION="v2.1.1 or later"
        else
            VERSION="v2.0.x - v2.1.0"
        fi
    else
        VERSION="v1.1.0 - v1.4.0"
    fi
elif [ -f "$PAI_DIR/skills/CORE/Contacts.md" ]; then
    VERSION="v1.0.x - v1.1.0"
else
    VERSION="Unknown or custom"
fi

echo "Detected PAI version: $VERSION"

if [[ "$VERSION" == *"v1."* ]]; then
    echo "⚠ WARNING: Running outdated PAI version"
    echo "  Latest version: v2.1.1"
    echo "  Consider upgrading using UpdatePAI skill"
fi
```

### 11. Generate Verification Report
```bash
echo ""
echo "=== Verification Report Summary ==="

cat << EOF

PAI Installation Verification Report
=====================================

Installation: $PAI_DIR
Version: $VERSION
Date: $(date +"%Y-%m-%d %H:%M:%S")

Directory Structure:
  [✓/✗] .claude/
  [✓/✗] skills/
  [✓/✗] hooks/
  [✓/✗/ℹ] MEMORY/ or history/

CORE Skill:
  [✓/✗] CORE/SKILL.md
  [✓/⚠/ℹ] USER/SYSTEM structure
  [✓/⚠/ℹ] DAIDENTITY.md
  [✓/⚠/ℹ] PAISECURITYSYSTEM

Custom Skills:
  [Count] custom skills found
  [✓/⚠] Path references checked

Hook System:
  [✓/ℹ] Hooks installed
  [✓/⚠] No retired hooks

Settings:
  [✓/⚠] settings.json exists
  [✓/⚠] No retired references

Security:
  [✓/ℹ] PAISECURITYSYSTEM configured
  [✓/⚠/ℹ] patterns.yaml valid

Overall Status: [PASS/WARNINGS/FAIL]

EOF

# Determine overall status based on errors found
if [ $ERROR_COUNT -gt 0 ]; then
    echo "Overall Status: ✗ FAIL ($ERROR_COUNT errors found)"
    echo ""
    echo "Action required: Fix errors before using PAI system"
    exit 1
else
    echo "Overall Status: ✓ PASS"
    echo ""
    echo "PAI installation is healthy and ready to use"
fi
```

## Success Criteria

- [ ] PAI_DIR set and valid
- [ ] Required directories exist
- [ ] MEMORY/history structure correct for version
- [ ] CORE skill valid and complete
- [ ] All SKILL.md files have valid frontmatter
- [ ] All workflow references resolve
- [ ] No broken path references in custom skills
- [ ] No retired hook references
- [ ] Settings valid
- [ ] Security system configured (if v2.1.1)
- [ ] Overall status: PASS

## Output

Report includes:
1. Directory structure validation
2. Version detection
3. CORE skill structure check
4. Custom skill validation
5. Hook system verification
6. Settings verification
7. Security system check
8. Overall health status
9. Recommendations for issues found

## Recommendations

Based on findings, provide recommendations:
- If v1.x detected: "Consider upgrading to v2.1.1"
- If broken references found: "Update paths to v2.1.1 structure"
- If retired hooks found: "Remove pai-history-system hook references"
- If PAISECURITYSYSTEM missing: "Consider installing for enhanced security"
- If errors found: "Fix critical errors before using PAI"
