# Analyze Workflow

Analyzes differences between current PAI installation and latest repository version using git commit history and structure comparison.

## Objective

Provide detailed comparison report showing:
- Current version vs repository version
- Number of commits behind
- Recent changes and new features from commit history
- Structural differences
- Breaking changes detected
- Custom skill compatibility
- Recommended migration strategy

## Steps

### 1. Verify Repository
```bash
echo "=== Checking Repository ==="
REPO_DIR="/c/EpicSource/Github/Personal_AI_Infrastructure"

if [ ! -d "$REPO_DIR/.git" ]; then
    echo "✗ ERROR: Repository not found or not a git repo"
    exit 1
fi

cd "$REPO_DIR"

# Ensure up to date
echo "Fetching latest changes..."
git fetch origin 2>/dev/null || true

echo "Current branch:"
git branch --show-current

echo "Latest commit:"
git log -1 --oneline
```

### 2. Check Repository Version and Recent Activity
```bash
echo ""
echo "=== Repository Information ==="

# Check README for version
echo "Repository version:"
grep -i "version\|v[0-9]\." README.md | head -5 || echo "Version not specified in README"

# Count total commits
TOTAL_COMMITS=$(git rev-list --count HEAD)
echo "Total commits: $TOTAL_COMMITS"

# Recent activity
echo ""
echo "Recent commits (last 30 days):"
git log --since="30 days ago" --oneline | wc -l | xargs echo "Commits:"

echo ""
echo "Latest 10 commits:"
git log -10 --pretty=format:"%h - %s (%cr)" --abbrev-commit
```

### 3. Identify Major Changes from Commit History
```bash
echo ""
echo "=== Analyzing Recent Changes ==="

# Look for version tags
echo "Version tags:"
git tag --sort=-v:refname | head -10

# Identify breaking changes from commit messages
echo ""
echo "Breaking changes detected (BREAKING CHANGE in commits):"
git log --grep="BREAKING" --pretty=format:"%h - %s" | head -20

# Look for major features
echo ""
echo "Major features (feat: in commits):"
git log --grep="feat:" --pretty=format:"%h - %s" --since="60 days ago" | head -20

# Look for pack changes
echo ""
echo "Pack-related changes:"
git log --grep="pack\|Pack" --pretty=format:"%h - %s" --since="60 days ago" | head -15

# Look for core changes
echo ""
echo "Core system changes:"
git log --grep="core\|CORE" --pretty=format:"%h - %s" --since="60 days ago" | head -15
```

### 4. Check Current Installation Structure
```bash
echo ""
echo "=== Checking Current Installation ==="
echo "PAI_DIR: $PAI_DIR"

if [ ! -d "$PAI_DIR" ]; then
    echo "✗ ERROR: PAI_DIR not found"
    exit 1
fi

# Check directory structure
echo ""
echo "Current structure:"
ls -la "$PAI_DIR/" | head -15

# Check CORE structure (v1.x vs v2.x indicator)
if [ -d "$PAI_DIR/skills/CORE/USER" ]; then
    echo "  CORE: USER/SYSTEM structure (v1.1.0+)"
elif [ -f "$PAI_DIR/skills/CORE/Contacts.md" ]; then
    echo "  CORE: Flat structure (v1.0.x)"
else
    echo "  CORE: Unknown structure"
fi

# Check MEMORY structure
if [ -d "$PAI_DIR/MEMORY" ]; then
    if [ -d "$PAI_DIR/MEMORY/History" ]; then
        echo "  MEMORY: With History/ parent (v1.x)"
    else
        echo "  MEMORY: Flattened (v2.1.1+)"
    fi
elif [ -d "$PAI_DIR/history" ]; then
    echo "  MEMORY: Old history/ directory (v1.0.x)"
else
    echo "  MEMORY: Not found"
fi

# Detect installed version
if [ -d "$PAI_DIR/skills/CORE/USER" ] && [ -d "$PAI_DIR/MEMORY" ] && [ ! -d "$PAI_DIR/MEMORY/History" ]; then
    if [ -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]; then
        INSTALLED_VERSION="v2.1.1+"
    else
        INSTALLED_VERSION="v2.0.x - v2.1.0"
    fi
elif [ -d "$PAI_DIR/skills/CORE/USER" ]; then
    INSTALLED_VERSION="v1.1.0 - v1.4.0"
elif [ -f "$PAI_DIR/skills/CORE/Contacts.md" ]; then
    INSTALLED_VERSION="v1.0.x - v1.1.0"
else
    INSTALLED_VERSION="Unknown"
fi

echo ""
echo "Detected installed version: $INSTALLED_VERSION"
```

### 5. Compare Repository Structure with Installation
```bash
echo ""
echo "=== Comparing Structures ==="

# Check what's in the repository
echo "Repository pack structure:"
ls -la "$REPO_DIR/Packs/" | head -20

# Check for new directories in MEMORY
echo ""
echo "Repository MEMORY structure:"
if [ -d "$REPO_DIR/Packs/pai-core-install/src/MEMORY" ]; then
    ls -la "$REPO_DIR/Packs/pai-core-install/src/MEMORY/"
fi

# Check for new USER/ files
echo ""
echo "Repository CORE/USER files:"
if [ -d "$REPO_DIR/Packs/pai-core-install/src/skills/CORE/USER" ]; then
    ls -la "$REPO_DIR/Packs/pai-core-install/src/skills/CORE/USER/" | grep "\.md"
fi

# Check for PAISECURITYSYSTEM
if [ -d "$REPO_DIR/Packs/pai-core-install/src/skills/CORE/USER/PAISECURITYSYSTEM" ]; then
    echo ""
    echo "✓ Repository has PAISECURITYSYSTEM"
else
    echo ""
    echo "ℹ PAISECURITYSYSTEM not found in repository"
fi
```

### 6. Identify Custom Skills
```bash
echo ""
echo "=== Identifying Custom Skills ==="

# List custom Epic skills
CUSTOM_SKILLS=()
if [ -d "$PAI_DIR/skills/EpicCode" ]; then
    CUSTOM_SKILLS+=("EpicCode")
    echo "✓ Found: EpicCode"
fi

if [ -d "$PAI_DIR/skills/EpicGit" ]; then
    CUSTOM_SKILLS+=("EpicGit")
    echo "✓ Found: EpicGit"
fi

if [ -d "$PAI_DIR/skills/EpicWiki" ]; then
    CUSTOM_SKILLS+=("EpicWiki")
    echo "✓ Found: EpicWiki"
fi

if [ ${#CUSTOM_SKILLS[@]} -eq 0 ]; then
    echo "ℹ No custom Epic skills found"
else
    echo ""
    echo "Custom skills to preserve: ${CUSTOM_SKILLS[@]}"
fi
```

### 7. Check for Breaking Changes Impact
```bash
echo ""
echo "=== Checking Breaking Changes Impact ==="

# Check for pai-history-system references
if [ -f "$PAI_DIR/.claude/settings.json" ]; then
    if grep -q "pai-history-system\|capture-all-events\|capture-session-summary" "$PAI_DIR/.claude/settings.json" 2>/dev/null; then
        echo "⚠ WARNING: Found pai-history-system references in settings.json"
        echo "   This pack was retired - hooks need migration"
    else
        echo "✓ No pai-history-system references found"
    fi
fi

# Check for old CORE structure references in custom skills
if [ ${#CUSTOM_SKILLS[@]} -gt 0 ]; then
    echo ""
    echo "Checking custom skills for outdated references:"
    for skill in "${CUSTOM_SKILLS[@]}"; do
        echo "  Checking $skill..."
        if grep -r "CORE/Contacts\.md\|CORE/CoreStack\.md" "$PAI_DIR/skills/$skill" 2>/dev/null; then
            echo "    ⚠ Found old CORE path references"
        fi
        if grep -r "history/History/\|MEMORY/History/" "$PAI_DIR/skills/$skill" 2>/dev/null; then
            echo "    ⚠ Found old History path references"
        fi
    done
fi
```

### 8. Identify Missing Features
```bash
echo ""
echo "=== Missing Features in Current Installation ==="

# Check for DAIDENTITY
if [ ! -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]; then
    echo "✗ DAIDENTITY.md (AI identity configuration) - Added in v1.4.0"
fi

# Check for PAISECURITYSYSTEM
if [ ! -d "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM" ]; then
    echo "✗ PAISECURITYSYSTEM (enhanced security) - Added in v1.3.0"
fi

# Check for flattened MEMORY
if [ -d "$PAI_DIR/MEMORY/History" ]; then
    echo "✗ Flattened MEMORY structure (still using History/ parent) - Changed in v2.1.1"
fi

# Check for new MEMORY directories
NEW_MEMORY_DIRS=("backups" "decisions" "execution" "recovery" "security" "State")
for dir in "${NEW_MEMORY_DIRS[@]}"; do
    if [ ! -d "$PAI_DIR/MEMORY/$dir" ] && [ ! -d "$PAI_DIR/history/$dir" ]; then
        echo "✗ MEMORY/$dir directory - Added in v1.2.0+"
    fi
done

# Check for new packs
echo ""
echo "New packs available in repository:"
NEW_PACKS=("pai-algorithm-skill" "pai-voice-system" "pai-art-skill" "pai-upgrades-skill")
for pack in "${NEW_PACKS[@]}"; do
    if [ -d "$REPO_DIR/Packs/$pack" ]; then
        echo "  ✓ $pack"
    fi
done
```

### 9. Generate Analysis Report

Create comprehensive analysis report:

```bash
echo ""
echo "=== ANALYSIS REPORT ==="
echo "======================"
echo ""

# Version Information
echo "VERSION INFORMATION:"
echo "  Current Installation: $INSTALLED_VERSION"
echo "  Repository Location: $REPO_DIR"
echo "  Latest Commit: $(cd "$REPO_DIR" && git log -1 --format='%h - %s (%cr)')"
echo "  Recent Activity: $(cd "$REPO_DIR" && git log --since='30 days ago' --oneline | wc -l) commits in last 30 days"
echo ""

# Structural Comparison
echo "STRUCTURAL DIFFERENCES:"
if [ -d "$PAI_DIR/MEMORY" ] && [ ! -d "$PAI_DIR/MEMORY/History" ]; then
    echo "  ✓ MEMORY structure: Up to date (flattened)"
elif [ -d "$PAI_DIR/MEMORY/History" ]; then
    echo "  ⚠ MEMORY structure: Outdated (needs flattening)"
elif [ -d "$PAI_DIR/history" ]; then
    echo "  ⚠ MEMORY structure: Old (history/ directory)"
fi

if [ -d "$PAI_DIR/skills/CORE/USER" ] && [ -d "$PAI_DIR/skills/CORE/SYSTEM" ]; then
    echo "  ✓ CORE structure: USER/SYSTEM architecture"
else
    echo "  ⚠ CORE structure: Outdated (flat structure)"
fi

if [ -d "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM" ]; then
    echo "  ✓ Security: PAISECURITYSYSTEM installed"
else
    echo "  ✗ Security: PAISECURITYSYSTEM missing"
fi

if [ -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]; then
    echo "  ✓ Identity: DAIDENTITY.md configured"
else
    echo "  ✗ Identity: DAIDENTITY.md missing"
fi

echo ""

# Custom Skills
echo "CUSTOM SKILLS:"
if [ ${#CUSTOM_SKILLS[@]} -gt 0 ]; then
    for skill in "${CUSTOM_SKILLS[@]}"; do
        echo "  ✓ $skill (will be preserved)"
    done
else
    echo "  ℹ None found"
fi

echo ""

# Breaking Changes
echo "BREAKING CHANGES TO HANDLE:"
echo "  1. pai-history-system retirement (if using)"
echo "  2. CORE flat → USER/SYSTEM structure (if old version)"
echo "  3. MEMORY/History/ → MEMORY/ flattening (if old structure)"
echo "  4. DAIDENTITY.md requirement (if missing)"
echo "  5. PAISECURITYSYSTEM installation (if missing)"
echo ""

# Recommendation
echo "RECOMMENDED STRATEGY:"
if [[ "$INSTALLED_VERSION" == "v2.1.1+" ]]; then
    echo "  ✓ Your installation appears up to date!"
    echo "  Run 'git pull' in repository to check for newest changes."
elif [[ "$INSTALLED_VERSION" == *"v1."* ]] || [[ "$INSTALLED_VERSION" == *"v2.0"* ]]; then
    echo "  → HybridUpdate workflow (RECOMMENDED)"
    echo "     - Fresh install in parallel location"
    echo "     - Preserves custom Epic skills"
    echo "     - Migrates configuration"
    echo "     - Test before switching"
    echo "     - Risk: Low | Complexity: Medium | Time: 2-4 hours"
else
    echo "  → Analyze current installation manually"
    echo "     - Version detection inconclusive"
    echo "     - Review structure and decide on strategy"
fi

echo ""
echo "=== END OF ANALYSIS ==="
```

## Output

Present report to user with:
1. Version comparison (installed vs repository)
2. Recent changes from git commit history
3. Structural differences detected
4. Custom skills that will be preserved
5. Breaking changes impact
6. Missing features
7. Recommended migration strategy
8. Next steps

## Usage

Ask user if they want to proceed:
- **Yes** → Proceed with recommended HybridUpdate workflow
- **View recent commits** → Show detailed git log
- **Not yet** → Exit without changes

## Example Questions for User

After presenting analysis:
- "Would you like to proceed with the HybridUpdate workflow?"
- "Do you want to see detailed git commit history?"
- "Should I create a backup before updating?"
- "Would you like to install additional new packs (voice, algorithm, art)?"
