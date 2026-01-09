#!/usr/bin/env bash
# detect-version.sh - Automatically detect PAI installation version (v1.x vs v2.x)
#
# Usage: ./detect-version.sh [PAI_DIR]
# Returns: v1 or v2 or unknown
# Exit codes: 0 = success, 1 = error

set -euo pipefail

PAI_DIR="${1:-$PAI_DIR}"

if [[ -z "$PAI_DIR" ]]; then
    echo "ERROR: PAI_DIR not specified" >&2
    exit 1
fi

if [[ ! -d "$PAI_DIR" ]]; then
    echo "ERROR: Directory does not exist: $PAI_DIR" >&2
    exit 1
fi

# v2.x detection criteria:
# - MEMORY/ exists (not history/ or history/History/)
# - skills/CORE/USER/ exists (not flat CORE structure)
# - skills/CORE/USER/DAIDENTITY.md exists (new in v2)
# - hooks/lib/identity.ts exists (new in v2)

score_v2=0
score_v1=0

# Check for v2 indicators
if [[ -d "$PAI_DIR/MEMORY" ]] && [[ ! -d "$PAI_DIR/MEMORY/History" ]]; then
    ((score_v2++))
fi

if [[ -d "$PAI_DIR/skills/CORE/USER" ]]; then
    ((score_v2++))
fi

if [[ -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]]; then
    ((score_v2++))
fi

if [[ -f "$PAI_DIR/hooks/lib/identity.ts" ]]; then
    ((score_v2++))
fi

# Check for v1 indicators
if [[ -d "$PAI_DIR/history" ]] || [[ -d "$PAI_DIR/MEMORY/History" ]]; then
    ((score_v1++))
fi

if [[ -f "$PAI_DIR/skills/CORE/Contacts.md" ]] && [[ ! -d "$PAI_DIR/skills/CORE/USER" ]]; then
    ((score_v1++))
fi

if [[ -f "$PAI_DIR/skills/CORE/CoreStack.md" ]]; then
    ((score_v1++))
fi

# Determine version
if [[ $score_v2 -ge 2 ]]; then
    echo "v2"
    exit 0
elif [[ $score_v1 -ge 2 ]]; then
    echo "v1"
    exit 0
else
    echo "unknown"
    exit 0
fi
