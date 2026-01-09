#!/usr/bin/env bash
# calculate-complexity.sh - Calculate update complexity score
#
# Usage: ./calculate-complexity.sh [CURRENT_VERSION] [TARGET_VERSION] [PAI_DIR]
# Output: JSON object with complexity assessment
# Exit codes: 0 = success

set -euo pipefail

CURRENT_VERSION="${1:-unknown}"
TARGET_VERSION="${2:-v2}"
PAI_DIR="${3:-$PAI_DIR}"

complexity_score=0
factors=()

# Factor 1: Version gap (v1->v2 = +3, v2->v2 = +1)
if [[ "$CURRENT_VERSION" == "v1" && "$TARGET_VERSION" == "v2" ]]; then
    complexity_score=$((complexity_score + 3))
    factors+=("\"Major version upgrade (v1→v2): +3\"")
elif [[ "$CURRENT_VERSION" == "v2" && "$TARGET_VERSION" == "v2" ]]; then
    complexity_score=$((complexity_score + 1))
    factors+=("\"Minor version upgrade (v2→v2): +1\"")
fi

# Factor 2: Custom skills count (+1 per custom skill)
if [[ -d "$PAI_DIR/skills" ]]; then
    custom_count=$(find "$PAI_DIR/skills" -mindepth 1 -maxdepth 1 -type d | wc -l)
    custom_count=$((custom_count - 5)) # Subtract ~5 official skills
    if [[ $custom_count -gt 0 ]]; then
        complexity_score=$((complexity_score + custom_count))
        factors+=("\"Custom skills to preserve: $custom_count (+$custom_count)\"")
    fi
fi

# Factor 3: History size (+1 if > 100MB, +2 if > 1GB)
if [[ -d "$PAI_DIR/history" ]] || [[ -d "$PAI_DIR/MEMORY" ]]; then
    history_dir="$PAI_DIR/history"
    if [[ ! -d "$history_dir" ]]; then
        history_dir="$PAI_DIR/MEMORY"
    fi

    if [[ -d "$history_dir" ]]; then
        history_size=$(du -sm "$history_dir" 2>/dev/null | cut -f1 || echo "0")
        if [[ $history_size -gt 1000 ]]; then
            complexity_score=$((complexity_score + 2))
            factors+=("\"Large history (${history_size}MB): +2\"")
        elif [[ $history_size -gt 100 ]]; then
            complexity_score=$((complexity_score + 1))
            factors+=("\"Medium history (${history_size}MB): +1\"")
        fi
    fi
fi

# Factor 4: Custom settings (+1 if settings.json exists and differs from default)
if [[ -f "$PAI_DIR/.claude/settings.json" ]]; then
    complexity_score=$((complexity_score + 1))
    factors+=("\"Custom settings found: +1\"")
fi

# Calculate complexity level
if [[ $complexity_score -le 3 ]]; then
    complexity="simple"
elif [[ $complexity_score -le 6 ]]; then
    complexity="medium"
else
    complexity="complex"
fi

# Estimate time
if [[ "$complexity" == "simple" ]]; then
    time_estimate="5-10 minutes"
elif [[ "$complexity" == "medium" ]]; then
    time_estimate="10-15 minutes"
else
    time_estimate="15-30 minutes"
fi

# Output as JSON
echo "{"
echo "  \"complexity_score\": $complexity_score,"
echo "  \"complexity_level\": \"$complexity\","
echo "  \"time_estimate\": \"$time_estimate\","
echo "  \"factors\": ["
if [[ ${#factors[@]} -gt 0 ]]; then
    IFS=,; echo "    ${factors[*]}"
fi
echo "  ]"
echo "}"
