# ArchitectureMapping Workflow

Analyze and map architectural differences between current PAI installation and public repository for informed integration decisions.

## Context & Motivation

Understanding the structural gap between your customized PAI installation and the canonical repository enables targeted updates without disrupting existing functionality. This workflow produces an actionable mapping that reveals missing components, architectural drift, and integration pathways.

## Instructions

### 1. Discover Current Architecture

Scan the local installation to build a comprehensive structural map.

```bash
PAI_DIR="${PAI_DIR:-$HOME/.pai}"
echo "=== Current PAI Architecture Discovery ==="

# Core structure
echo "## Directory Structure"
find "$PAI_DIR" -maxdepth 3 -type d | sort

# Skills inventory
echo "## Installed Skills"
for skill_dir in "$PAI_DIR/skills"/*/; do
    skill_name=$(basename "$skill_dir")
    has_skillmd=$([ -f "$skill_dir/SKILL.md" ] && echo "yes" || echo "no")
    workflow_count=$(find "$skill_dir" -name "*.md" -path "*/Workflows/*" 2>/dev/null | wc -l)
    tool_count=$(find "$skill_dir" -name "*.ts" -o -name "*.sh" -path "*/Tools/*" 2>/dev/null | wc -l)
    echo "- $skill_name: SKILL.md=$has_skillmd, workflows=$workflow_count, tools=$tool_count"
done

# Configuration files
echo "## Configuration Files"
find "$PAI_DIR" -maxdepth 2 -name "*.json" -o -name "*.yaml" -o -name "*.yml" 2>/dev/null | sort

# Hooks detection
echo "## Hooks"
[ -f "$PAI_DIR/.claude/settings.json" ] && jq '.hooks // empty' "$PAI_DIR/.claude/settings.json" 2>/dev/null
```

### 2. Fetch Public Repository Structure

Retrieve the canonical architecture from the public repository for comparison.

```bash
REPO_URL="https://api.github.com/repos/danielmiessler/PAI/git/trees/main?recursive=1"
REPO_DIR="${REPO_DIR:-$HOME/Github/PAI}"

echo "=== Public Repository Architecture ==="

# Use local clone if available, otherwise fetch from API
if [ -d "$REPO_DIR" ]; then
    echo "Using local clone: $REPO_DIR"
    cd "$REPO_DIR" && git fetch origin 2>/dev/null
    echo "Latest commit: $(git log -1 --oneline)"

    echo "## Packs Available"
    ls -1 "$REPO_DIR/Packs/" 2>/dev/null

    echo "## Skills Discovery"
    # Find skills in nested structure (src/skills/SkillName)
    echo "Nested skills:"
    find "$REPO_DIR/Packs" -path "*/src/skills/*" -name "SKILL.md" 2>/dev/null | while read f; do
        skill_dir=$(dirname "$f")
        echo "- $(basename "$skill_dir") ($(echo "$skill_dir" | sed 's|.*/Packs/||' | cut -d'/' -f1))"
    done

    # Find standalone skill packs (SKILL.md at pack root)
    echo "Standalone skill packs:"
    find "$REPO_DIR/Packs" -maxdepth 2 -name "SKILL.md" 2>/dev/null | while read f; do
        pack_dir=$(dirname "$f")
        pack_name=$(basename "$pack_dir")
        echo "- $pack_name (standalone pack)"
    done

    echo "## Recent Structural Changes"
    git log --name-only --diff-filter=A --since="90 days ago" --pretty=format:"" -- "*.md" 2>/dev/null | grep -v "^$" | sort -u | head -15
else
    echo "Fetching from GitHub API..."
    curl -s "$REPO_URL" | jq -r '.tree[] | select(.type == "tree") | .path' | head -50
fi
```

### 3. Build Component Mapping

Create a structured comparison between local and public architectures.

```bash
echo "=== Component Mapping ==="

# Dynamically discover canonical skills from public repo
echo "## Discovering skills from repository..."

# Build list of canonical skills (nested + standalone)
CANONICAL_SKILLS=()

# Nested skills (src/skills/SkillName)
while IFS= read -r skill_md; do
    skill_name=$(basename $(dirname "$skill_md"))
    CANONICAL_SKILLS+=("$skill_name")
done < <(find "$REPO_DIR/Packs" -path "*/src/skills/*" -name "SKILL.md" 2>/dev/null)

# Standalone skill packs (SKILL.md at pack root, extract skill name from pack name)
while IFS= read -r skill_md; do
    pack_name=$(basename $(dirname "$skill_md"))
    # Extract skill name from pack name (pai-browser-skill -> Browser)
    skill_name=$(echo "$pack_name" | sed 's/^pai-//' | sed 's/^kai-//' | sed 's/-skill$//' | sed 's/.*/\u&/')
    CANONICAL_SKILLS+=("$pack_name:standalone")
done < <(find "$REPO_DIR/Packs" -maxdepth 2 -name "SKILL.md" 2>/dev/null)

echo "Found ${#CANONICAL_SKILLS[@]} canonical components"

# Map each component
echo ""
echo "## Component Status"
for entry in "${CANONICAL_SKILLS[@]}"; do
    if [[ "$entry" == *":standalone" ]]; then
        pack_name="${entry%:standalone}"
        echo "- $pack_name: STANDALONE_PACK (install separately)"
    else
        skill="$entry"
        local_path="$PAI_DIR/skills/$skill"

        if [ -d "$local_path" ]; then
            # Find the pack containing this skill
            pack_skill=$(find "$REPO_DIR/Packs" -type d -name "$skill" -path "*/skills/*" 2>/dev/null | head -1)
            if [ -n "$pack_skill" ]; then
                local_files=$(find "$local_path" -type f -name "*.md" 2>/dev/null | wc -l)
                repo_files=$(find "$pack_skill" -type f -name "*.md" 2>/dev/null | wc -l)
                if [ "$local_files" -eq "$repo_files" ]; then
                    echo "- $skill: PRESENT (files match)"
                else
                    echo "- $skill: MODIFIED (local: $local_files, repo: $repo_files files)"
                fi
            else
                echo "- $skill: PRESENT (local only)"
            fi
        else
            echo "- $skill: MISSING"
        fi
    fi
done
```

### 4. Identify Custom Extensions

Detect skills and modifications unique to the local installation.

```bash
echo "=== Custom Extensions ==="

# Build list of canonical skill names from repo
CANONICAL_NAMES=()
while IFS= read -r skill_md; do
    CANONICAL_NAMES+=("$(basename $(dirname "$skill_md"))")
done < <(find "$REPO_DIR/Packs" -path "*/src/skills/*" -name "SKILL.md" 2>/dev/null)

echo "## Custom Skills (not in public repository)"
for skill_dir in "$PAI_DIR/skills"/*/; do
    skill_name=$(basename "$skill_dir")
    is_canonical=false
    for canonical in "${CANONICAL_NAMES[@]}"; do
        [ "$skill_name" == "$canonical" ] && is_canonical=true && break
    done

    if [ "$is_canonical" == "false" ]; then
        echo "CUSTOM: $skill_name"
        [ -f "$skill_dir/SKILL.md" ] && echo "  - Has SKILL.md"
        [ -d "$skill_dir/Workflows" ] && echo "  - Workflows: $(ls "$skill_dir/Workflows" 2>/dev/null | wc -l)"
        [ -d "$skill_dir/Tools" ] && echo "  - Tools: $(ls "$skill_dir/Tools" 2>/dev/null | wc -l)"
        echo ""
    fi
done

echo "## Custom Hooks"
[ -f "$PAI_DIR/.claude/settings.json" ] && jq -r '.hooks | keys[]' "$PAI_DIR/.claude/settings.json" 2>/dev/null | while read hook; do
    echo "- $hook"
done

echo "## Custom Commands"
[ -d "$PAI_DIR/.claude/commands" ] && find "$PAI_DIR/.claude/commands" -name "*.md" 2>/dev/null | wc -l | xargs -I{} echo "Found {} custom commands"
```

### 5. Analyze Integration Pathways

Determine how missing components can be integrated without disrupting custom work.

```bash
echo "=== Integration Analysis ==="

# Analyze nested skills (missing from local)
echo "## Missing Nested Skills"
while IFS= read -r skill_md; do
    skill_name=$(basename $(dirname "$skill_md"))
    if [ ! -d "$PAI_DIR/skills/$skill_name" ]; then
        echo "### $skill_name"
        pack_path=$(dirname $(dirname $(dirname "$skill_md")))
        pack_name=$(basename "$pack_path")
        echo "Source Pack: $pack_name"
        echo "Source Path: $(dirname "$skill_md")"

        # Check for package.json dependencies
        if [ -f "$pack_path/package.json" ]; then
            echo "Dependencies: $(cat "$pack_path/package.json" | grep -A3 '"dependencies"' 2>/dev/null | tr '\n' ' ')"
        fi

        # Check for conflicts
        skill_refs=$(grep -r "$skill_name" "$PAI_DIR/skills" 2>/dev/null | wc -l)
        [ "$skill_refs" -gt 0 ] && echo "References in existing skills: $skill_refs"

        echo "Integration: cp -r \"$(dirname "$skill_md")\" \"\$PAI_DIR/skills/$skill_name\""
        echo ""
    fi
done < <(find "$REPO_DIR/Packs" -path "*/src/skills/*" -name "SKILL.md" 2>/dev/null)

# Analyze standalone skill packs
echo "## Standalone Skill Packs"
while IFS= read -r skill_md; do
    pack_dir=$(dirname "$skill_md")
    pack_name=$(basename "$pack_dir")
    echo "### $pack_name"
    echo "Type: Standalone pack (install as whole unit)"

    # Check for install instructions
    [ -f "$pack_dir/INSTALL.md" ] && echo "Has INSTALL.md: yes"
    [ -f "$pack_dir/package.json" ] && echo "Has package.json: yes"

    # List key files
    echo "Contents: $(ls "$pack_dir" 2>/dev/null | tr '\n' ' ')"
    echo "Integration: Follow $pack_dir/INSTALL.md or copy entire pack"
    echo ""
done < <(find "$REPO_DIR/Packs" -maxdepth 2 -name "SKILL.md" 2>/dev/null)
```

### 6. Generate Mapping Report

Compile findings into a structured integration plan.

Read the collected data and produce a report in this format:

```markdown
# PAI Architecture Mapping Report

## Summary
- Current Installation: [path]
- Public Repository: [version/commit]
- Analysis Date: [timestamp]

## Component Status

| Component | Status | Notes |
|-----------|--------|-------|
| [skill] | PRESENT/MODIFIED/MISSING | [details] |

## Missing Components

### [Component Name]
- **Source Pack:** [pack name]
- **Integration Path:** [steps to add]
- **Dependencies:** [any prerequisites]
- **Potential Conflicts:** [issues to resolve]

## Custom Extensions (Preserve)

| Extension | Type | Integration Notes |
|-----------|------|-------------------|
| [name] | skill/hook/config | [preserve strategy] |

## Recommended Integration Order

1. [First component] - [rationale]
2. [Second component] - [rationale]

## Configuration Merge Points

- settings.json: [merge strategy]
- hooks: [merge strategy]
```

## Example

**Scenario:** User has custom EpicCode and EpicGit skills, missing Browser and Art skills

**Output:**
```
Component Status:
- CORE: PRESENT (modified)
- Browser: MISSING
- Art: MISSING
- EpicCode: CUSTOM (preserve)
- EpicGit: CUSTOM (preserve)

Integration Plan:
1. Browser - No conflicts, copy from pai-browser-skill pack
2. Art - No conflicts, copy from pai-art-skill pack

Preserve: EpicCode, EpicGit (not in public repo)
```

## Implementation Notes

**Pack Structure Variations:**
The PAI repository contains two types of skill packaging:

1. **Nested skills** - Located at `Packs/<pack-name>/src/skills/<SkillName>/SKILL.md`
   - Examples: CORE, Agents, THEALGORITHM, Art, Prompting
   - Integration: Copy the skill directory to `$PAI_DIR/skills/`

2. **Standalone packs** - SKILL.md at pack root `Packs/<pack-name>/SKILL.md`
   - Examples: pai-browser-skill, kai-browser-skill
   - Integration: Follow pack's INSTALL.md or copy entire pack structure

**Common Pitfalls:**
- Assuming uniform pack structure leads to missing standalone packs
- Hardcoding skill lists misses new additions to the repository
- File count comparison is a rough heuristic; content hashing is more accurate
- Custom commands in `.claude/commands/` are easy to overlook

**Prerequisites:**
- Local clone of PAI repository recommended for accurate comparison
- `jq` required for JSON parsing of settings.json
- Bash 4.0+ required for associative arrays and process substitution

## Constraints

**Success Criteria:**
- Complete inventory of local installation structure
- Full mapping against public repository components
- Clear identification of missing vs custom components
- Actionable integration pathways with conflict analysis
- Preservation strategy for custom work

**Failure Criteria:**
- Unable to access local PAI directory
- Cannot fetch public repository structure
- Missing component analysis incomplete

## Output Format

Present findings as:
1. Executive summary (3-5 bullet points)
2. Component mapping table
3. Missing components with integration steps
4. Custom extensions preservation plan
5. Recommended integration order with rationale

## Changelog

- **2026-01-09**: Initial version with hardcoded skill list
- **2026-01-09**: Fixed to use dynamic discovery; added standalone pack support; added custom commands detection
