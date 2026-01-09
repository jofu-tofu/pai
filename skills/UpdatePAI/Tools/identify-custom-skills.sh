#!/usr/bin/env bash
# identify-custom-skills.sh - Identify custom skills that need preservation
#
# Usage: ./identify-custom-skills.sh [PAI_DIR]
# Output: JSON array of custom skill names
# Exit codes: 0 = success

set -euo pipefail

PAI_DIR="${1:-$PAI_DIR}"

if [[ -z "$PAI_DIR" ]]; then
    echo "ERROR: PAI_DIR not specified" >&2
    exit 1
fi

SKILLS_DIR="$PAI_DIR/skills"

if [[ ! -d "$SKILLS_DIR" ]]; then
    echo "[]"
    exit 0
fi

# Known official skills (don't preserve these)
OFFICIAL_SKILLS=(
    "CORE"
    "Browser"
    "THEALGORITHM"
    "Prompting"
    "Art"
    "Agents"
    "Upgrades"
    "Review"
    "CreateSkill"
    "UpdateSkill"
    "UpdatePAI"
)

custom_skills=()

# Find all directories in skills/ with SKILL.md
for skill_dir in "$SKILLS_DIR"/*/; do
    if [[ ! -f "$skill_dir/SKILL.md" ]]; then
        continue
    fi

    skill_name=$(basename "$skill_dir")

    # Check if it's an official skill
    is_official=false
    for official in "${OFFICIAL_SKILLS[@]}"; do
        if [[ "$skill_name" == "$official" ]]; then
            is_official=true
            break
        fi
    done

    # If not official, it's custom
    if [[ "$is_official" == "false" ]]; then
        custom_skills+=("\"$skill_name\"")
    fi
done

# Output as JSON array
if [[ ${#custom_skills[@]} -gt 0 ]]; then
    echo "[$(IFS=,; echo "${custom_skills[*]}")]"
else
    echo "[]"
fi
