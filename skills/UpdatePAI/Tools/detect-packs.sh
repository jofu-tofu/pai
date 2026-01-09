#!/usr/bin/env bash
# detect-packs.sh - Auto-detect installed PAI packs
#
# Usage: ./detect-packs.sh [PAI_DIR]
# Output: JSON array of installed pack names
# Exit codes: 0 = success

set -euo pipefail

PAI_DIR="${1:-$PAI_DIR}"

if [[ -z "$PAI_DIR" ]]; then
    echo "ERROR: PAI_DIR not specified" >&2
    exit 1
fi

# Known pack skills and their indicators
declare -A PACKS=(
    ["pai-browser-skill"]="skills/Browser/SKILL.md"
    ["pai-algorithm-skill"]="skills/THEALGORITHM/SKILL.md"
    ["pai-prompting-skill"]="skills/Prompting/SKILL.md"
    ["pai-voice-system"]="skills/CORE/SYSTEM/VOICESYSTEM.md"
    ["pai-art-skill"]="skills/Art/SKILL.md"
    ["pai-agent-skill"]="skills/Agents/SKILL.md"
    ["pai-upgrades-skill"]="skills/Upgrades/SKILL.md"
    ["pai-review-skill"]="skills/Review/SKILL.md"
    ["pai-createskill"]="skills/CreateSkill/SKILL.md"
    ["pai-updateskill"]="skills/UpdateSkill/SKILL.md"
)

installed=()

for pack in "${!PACKS[@]}"; do
    indicator="${PACKS[$pack]}"
    if [[ -f "$PAI_DIR/$indicator" ]]; then
        installed+=("\"$pack\"")
    fi
done

# Output as JSON array
if [[ ${#installed[@]} -gt 0 ]]; then
    echo "[$(IFS=,; echo "${installed[*]}")]"
else
    echo "[]"
fi
