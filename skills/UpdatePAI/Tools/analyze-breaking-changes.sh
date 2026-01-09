#!/usr/bin/env bash
# analyze-breaking-changes.sh - Parse git commits for breaking changes
#
# Usage: ./analyze-breaking-changes.sh [REPO_DIR] [SINCE_TAG]
# Output: JSON object with breaking changes
# Exit codes: 0 = success, 1 = error

set -euo pipefail

REPO_DIR="${1:-/c/EpicSource/Github/Personal_AI_Infrastructure}"
SINCE_TAG="${2:-}" # Optional: start from specific tag/commit

if [[ ! -d "$REPO_DIR/.git" ]]; then
    echo "ERROR: Not a git repository: $REPO_DIR" >&2
    exit 1
fi

cd "$REPO_DIR"

# Keywords that indicate breaking changes
BREAKING_KEYWORDS=(
    "BREAKING"
    "breaking change"
    "breaking:"
    "deprecated"
    "removed"
    "renamed"
    "moved"
    "migrat"
    "restructur"
)

# Build grep pattern
pattern=$(IFS="|"; echo "${BREAKING_KEYWORDS[*]}")

# Get commits (all if no SINCE_TAG, or since tag if specified)
if [[ -z "$SINCE_TAG" ]]; then
    commits=$(git log --oneline --all)
else
    commits=$(git log --oneline "$SINCE_TAG"..HEAD)
fi

# Find breaking changes
breaking_commits=()
while IFS= read -r line; do
    if echo "$line" | grep -iE "$pattern" > /dev/null; then
        commit_hash=$(echo "$line" | awk '{print $1}')
        commit_msg=$(echo "$line" | cut -d' ' -f2-)
        breaking_commits+=("{\"hash\":\"$commit_hash\",\"message\":\"$commit_msg\"}")
    fi
done <<< "$commits"

# Known breaking changes (hardcoded from v1 -> v2 migration)
known_breaking=()
known_breaking+=("{\"change\":\"pai-history-system retirement\",\"impact\":\"Migrate to MEMORY system\"}")
known_breaking+=("{\"change\":\"CORE restructuring\",\"impact\":\"Flat files moved to USER/SYSTEM\"}")
known_breaking+=("{\"change\":\"MEMORY flattening\",\"impact\":\"history/History/ removed\"}")
known_breaking+=("{\"change\":\"DAIDENTITY requirement\",\"impact\":\"Must create identity config\"}")
known_breaking+=("{\"change\":\"Security system\",\"impact\":\"PAISECURITYSYSTEM directory added\"}")

# Output as JSON
echo "{"
echo "  \"breaking_commits\": ["
if [[ ${#breaking_commits[@]} -gt 0 ]]; then
    IFS=,; echo "    ${breaking_commits[*]}"
fi
echo "  ],"
echo "  \"known_breaking_changes\": ["
if [[ ${#known_breaking[@]} -gt 0 ]]; then
    IFS=,; echo "    ${known_breaking[*]}"
fi
echo "  ]"
echo "}"
