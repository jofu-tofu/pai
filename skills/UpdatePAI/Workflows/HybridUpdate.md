# HybridUpdate Workflow

Fresh install in parallel location with custom skill preservation. Manual alternative to AutoUpdate.

## Context

Installs latest version alongside current installation, allowing testing before switching. Lowest risk upgrade path with full control.

## Prerequisites

- [ ] Backup completed (run Backup workflow first)
- [ ] Repository clone at `/c/EpicSource/Github/Personal_AI_Infrastructure`
- [ ] Repository up to date (`git pull`)

## Critical Rules

**During Phases 1-8 (building new installation):**
- Keep PAI_DIR pointing to OLD installation
- Do not modify settings.json manually
- Do not restart Claude Code
- Do not delete old installation

**Phase 9 only (switching):**
- Update PAI_DIR to new location
- Restart Claude Code
- Archive old installation

## Instructions

### Phase 1: Prepare

```bash
REPO_DIR="/c/EpicSource/Github/Personal_AI_Infrastructure"
NEW_PAI_DIR="/c/EpicSource/pai-v2"
OLD_PAI="$PAI_DIR"

# Verify repository
cd "$REPO_DIR" && git pull origin main

# Create new directory
mkdir -p "$NEW_PAI_DIR"

# Identify custom skills
CUSTOM_SKILLS=()
for skill in EpicCode EpicGit EpicWiki; do
    [ -d "$OLD_PAI/skills/$skill" ] && CUSTOM_SKILLS+=("$skill")
done
```

### Phase 2: Install Core

```bash
CORE_PACK="$REPO_DIR/Packs/pai-core-install"

mkdir -p "$NEW_PAI_DIR"/{.claude,hooks,observability,skills,tools}
cp -r "$CORE_PACK/src/MEMORY" "$NEW_PAI_DIR/"
cp -r "$CORE_PACK/src/skills/CORE" "$NEW_PAI_DIR/skills/"
cp -r "$CORE_PACK/src/hooks" "$NEW_PAI_DIR/"
```

### Phase 3: Migrate Configuration

Ask for DAIDENTITY if not exists, otherwise copy existing:

```bash
if [ -f "$OLD_PAI/skills/CORE/USER/DAIDENTITY.md" ]; then
    cp "$OLD_PAI/skills/CORE/USER/DAIDENTITY.md" "$NEW_PAI_DIR/skills/CORE/USER/"
else
    # Create new DAIDENTITY with user input
fi

# Migrate personal files
[ -f "$OLD_PAI/skills/CORE/Contacts.md" ] && \
    cp "$OLD_PAI/skills/CORE/Contacts.md" "$NEW_PAI_DIR/skills/CORE/USER/CONTACTS.md"
[ -f "$OLD_PAI/skills/CORE/CoreStack.md" ] && \
    cp "$OLD_PAI/skills/CORE/CoreStack.md" "$NEW_PAI_DIR/skills/CORE/USER/TECHSTACKPREFERENCES.md"

# Merge settings
cp "$CORE_PACK/settings.json.template" "$NEW_PAI_DIR/.claude/settings.json"
```

### Phase 4: Preserve Custom Skills

```bash
for skill in "${CUSTOM_SKILLS[@]}"; do
    cp -r "$OLD_PAI/skills/$skill" "$NEW_PAI_DIR/skills/"
    echo "Copied: $skill"
done
```

### Phase 5: Update Path References

```bash
# Update old paths in custom skills
for skill in "${CUSTOM_SKILLS[@]}"; do
    SKILL_DIR="$NEW_PAI_DIR/skills/$skill"

    # Check for updates needed
    grep -r "CORE/Contacts.md" "$SKILL_DIR" && \
        echo "Update: CORE/Contacts.md -> CORE/USER/CONTACTS.md"
    grep -r "history/History/" "$SKILL_DIR" && \
        echo "Update: history/History/ -> MEMORY/"
done
```

### Phase 6: Migrate History

```bash
# Migrate learnings
cp -r "$OLD_PAI/history/learnings"/* "$NEW_PAI_DIR/MEMORY/learnings/" 2>/dev/null

# Migrate research
cp -r "$OLD_PAI/history/research"/* "$NEW_PAI_DIR/MEMORY/research/" 2>/dev/null

# Migrate recent sessions (30 days)
find "$OLD_PAI/history/sessions" -type f -mtime -30 -exec cp {} "$NEW_PAI_DIR/MEMORY/sessions/" \; 2>/dev/null
```

### Phase 7: Install Additional Packs

Ask which packs to install, then:

```bash
# Example: Browser skill
cp -r "$REPO_DIR/Packs/pai-browser-skill/src/skills/Browser" "$NEW_PAI_DIR/skills/"

# Example: Algorithm skill
cp -r "$REPO_DIR/Packs/pai-algorithm-skill/src/skills/THEALGORITHM" "$NEW_PAI_DIR/skills/"
```

### Phase 8: Verify and Test

Run Verify workflow on new installation:

```bash
# Temporarily test with new PAI_DIR
PAI_DIR="$NEW_PAI_DIR" # For testing only
```

Verify:
- CORE skill loads
- Custom skills work
- New features available

### Phase 9: Switch Installation

**Only after all previous phases complete successfully.**

```bash
# Verify all components present
[ -f "$NEW_PAI_DIR/skills/CORE/SKILL.md" ] || exit 1
[ -f "$NEW_PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ] || exit 1
[ -f "$NEW_PAI_DIR/hooks/security-validator.ts" ] || exit 1

# Update environment variable
# PowerShell:
# [System.Environment]::SetEnvironmentVariable('PAI_DIR', 'C:\EpicSource\pai-v2', 'User')

# Bash profile:
# export PAI_DIR=/c/EpicSource/pai-v2

# Archive old installation
mv "$OLD_PAI" "/c/EpicSource/pai-v1-archived-$(date +%Y%m%d)"
```

**Restart Claude Code to activate new installation.**

## Success Criteria

- [ ] Core installed in parallel
- [ ] Configuration migrated
- [ ] Custom skills preserved
- [ ] Paths updated
- [ ] History migrated
- [ ] Packs installed
- [ ] Verification passed
- [ ] Testing completed
- [ ] Environment updated
- [ ] Old installation archived

## Rollback

```bash
# Restore old installation
mv "/c/EpicSource/pai-v1-archived-*" "$PAI_DIR"

# Update PAI_DIR back
export PAI_DIR=/c/EpicSource/pai
```
