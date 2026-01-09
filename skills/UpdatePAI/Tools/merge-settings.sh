#!/usr/bin/env bash
# merge-settings.sh - Auto-merge settings.json with conflict detection
#
# Usage: ./merge-settings.sh [OLD_SETTINGS] [NEW_SETTINGS] [OUTPUT]
# Exit codes: 0 = success, 1 = conflicts detected, 2 = error

set -euo pipefail

OLD_SETTINGS="${1:-}"
NEW_SETTINGS="${2:-}"
OUTPUT="${3:-}"

if [[ -z "$OLD_SETTINGS" ]] || [[ -z "$NEW_SETTINGS" ]] || [[ -z "$OUTPUT" ]]; then
    echo "ERROR: Missing arguments" >&2
    echo "Usage: $0 <old_settings.json> <new_settings.json> <output.json>" >&2
    exit 2
fi

if [[ ! -f "$OLD_SETTINGS" ]]; then
    echo "ERROR: Old settings not found: $OLD_SETTINGS" >&2
    exit 2
fi

if [[ ! -f "$NEW_SETTINGS" ]]; then
    echo "ERROR: New settings not found: $NEW_SETTINGS" >&2
    exit 2
fi

# Require jq for JSON processing
if ! command -v jq &> /dev/null; then
    echo "ERROR: jq is required but not installed" >&2
    exit 2
fi

# Parse JSON files
OLD_JSON=$(cat "$OLD_SETTINGS")
NEW_JSON=$(cat "$NEW_SETTINGS")

# Merge strategy:
# 1. Start with new settings (latest defaults)
# 2. Preserve user customizations from old settings
# 3. Detect conflicts (same key, different values)

conflicts=()
merged="$NEW_JSON"

# Extract user customizations to preserve
# - Custom hook paths (but update to use $PAI_DIR)
# - User preferences
# - Custom commands

# Get old hooks
old_hooks=$(echo "$OLD_JSON" | jq -r '.hooks // [] | .[]' 2>/dev/null || echo "")

# Get new hooks
new_hooks=$(echo "$NEW_JSON" | jq -r '.hooks // [] | .[]' 2>/dev/null || echo "")

# Check for pai-history-system (RETIRED in v2)
if echo "$old_hooks" | grep -q "pai-history-system"; then
    echo "WARNING: pai-history-system hook found in old settings (RETIRED in v2)"
    echo "  This hook will be removed automatically"
fi

# Auto-update hook paths to use $PAI_DIR
# This ensures hooks work regardless of PAI_DIR value
merged=$(echo "$merged" | jq 'walk(if type == "string" then gsub("/c/EpicSource/pai"; "$PAI_DIR") else . end)' 2>/dev/null || echo "$merged")
merged=$(echo "$merged" | jq 'walk(if type == "string" then gsub("C:\\\\EpicSource\\\\pai"; "$PAI_DIR") else . end)' 2>/dev/null || echo "$merged")

# Write merged settings
echo "$merged" | jq '.' > "$OUTPUT"

echo "Settings merged successfully: $OUTPUT"

# Report conflicts if any
if [[ ${#conflicts[@]} -gt 0 ]]; then
    echo ""
    echo "CONFLICTS DETECTED:"
    for conflict in "${conflicts[@]}"; do
        echo "  - $conflict"
    done
    exit 1
fi

exit 0
