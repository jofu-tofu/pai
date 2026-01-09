# Analyze Workflow

Compare current PAI installation against latest repository version.

## Context

Provides detailed comparison showing version gap, breaking changes, structural differences, and migration recommendations without making changes.

## Instructions

### 1. Verify Repository

```bash
REPO_DIR="/c/EpicSource/Github/Personal_AI_Infrastructure"

cd "$REPO_DIR"
git fetch origin 2>/dev/null || true

echo "Current branch: $(git branch --show-current)"
echo "Latest commit: $(git log -1 --oneline)"
echo "Commits in last 30 days: $(git log --since='30 days ago' --oneline | wc -l)"
```

### 2. Analyze Changes

```bash
echo "=== Recent Changes ==="

# Version tags
git tag --sort=-v:refname | head -5

# Breaking changes
echo "Breaking changes:"
git log --grep="BREAKING" --pretty=format:"%h - %s" | head -10

# Major features
echo "New features:"
git log --grep="feat:" --pretty=format:"%h - %s" --since="60 days ago" | head -10
```

### 3. Check Current Installation

```bash
echo "=== Current Installation ==="
echo "PAI_DIR: $PAI_DIR"

# Detect version from structure
if [ -d "$PAI_DIR/skills/CORE/USER" ] && [ ! -d "$PAI_DIR/MEMORY/History" ]; then
    if [ -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]; then
        VERSION="v2.1.1+"
    else
        VERSION="v2.0.x"
    fi
elif [ -d "$PAI_DIR/skills/CORE/USER" ]; then
    VERSION="v1.1.0-v1.4.0"
elif [ -f "$PAI_DIR/skills/CORE/Contacts.md" ]; then
    VERSION="v1.0.x"
else
    VERSION="Unknown"
fi

echo "Detected version: $VERSION"
```

### 4. Identify Custom Skills

```bash
echo "=== Custom Skills ==="

for skill in EpicCode EpicGit EpicWiki; do
    [ -d "$PAI_DIR/skills/$skill" ] && echo "Found: $skill"
done
```

### 5. Check Breaking Changes Impact

```bash
echo "=== Breaking Changes Impact ==="

# Check for retired hook references
if grep -q "pai-history-system" "$PAI_DIR/.claude/settings.json" 2>/dev/null; then
    echo "WARNING: pai-history-system references found (retired in v2)"
fi

# Check for old path references in custom skills
for skill in EpicCode EpicGit EpicWiki; do
    if [ -d "$PAI_DIR/skills/$skill" ]; then
        grep -r "CORE/Contacts\.md\|history/History/" "$PAI_DIR/skills/$skill" 2>/dev/null && \
            echo "$skill has outdated path references"
    fi
done
```

### 6. Missing Features

```bash
echo "=== Missing Features ==="

[ ! -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ] && echo "Missing: DAIDENTITY.md"
[ ! -d "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM" ] && echo "Missing: PAISECURITYSYSTEM"
[ -d "$PAI_DIR/MEMORY/History" ] && echo "Outdated: MEMORY needs flattening"
```

## Output

Present analysis report with:
1. Version comparison
2. Recent changes from git
3. Structural differences
4. Custom skills to preserve
5. Breaking changes impact
6. Missing features
7. Recommended strategy

## Recommendations

Based on detected version:
- **v2.1.1+**: Installation up to date
- **v1.x or v2.0.x**: Use AutoUpdate workflow
- **Unknown**: Manual analysis required
