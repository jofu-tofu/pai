#!/usr/bin/env bash
# update-paths.sh - Auto-update path references for v2 structure
#
# Usage: ./update-paths.sh [TARGET_DIR] [--dry-run]
# Updates: CORE file paths, MEMORY paths in custom skills
# Exit codes: 0 = success, 1 = error

set -euo pipefail

TARGET_DIR="${1:-}"
DRY_RUN=false

if [[ "$#" -ge 2 && "$2" == "--dry-run" ]]; then
    DRY_RUN=true
fi

if [[ -z "$TARGET_DIR" ]]; then
    echo "ERROR: TARGET_DIR not specified" >&2
    echo "Usage: $0 <target_dir> [--dry-run]" >&2
    exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
    echo "ERROR: Directory does not exist: $TARGET_DIR" >&2
    exit 1
fi

# Path mappings (old -> new)
declare -A PATH_MAPPINGS=(
    ["CORE/Contacts.md"]="CORE/USER/CONTACTS.md"
    ["CORE/CoreStack.md"]="CORE/USER/TECHSTACKPREFERENCES.md"
    ["CORE/BasicInfo.md"]="CORE/USER/BASICINFO.md"
    ["history/History/"]="MEMORY/"
    ["MEMORY/History/"]="MEMORY/"
    ["/history/"]="/MEMORY/"
)

updates_made=0
files_scanned=0

echo "Scanning for path references in: $TARGET_DIR"
if [[ "$DRY_RUN" == "true" ]]; then
    echo "(DRY RUN - no changes will be made)"
fi
echo ""

# Find all markdown and typescript files
while IFS= read -r file; do
    ((files_scanned++))
    file_updated=false

    for old_path in "${!PATH_MAPPINGS[@]}"; do
        new_path="${PATH_MAPPINGS[$old_path]}"

        if grep -q "$old_path" "$file" 2>/dev/null; then
            echo "Found: $old_path in $file"
            echo "  → Will replace with: $new_path"

            if [[ "$DRY_RUN" == "false" ]]; then
                # Create backup
                cp "$file" "$file.bak"

                # Perform replacement
                sed -i "s|$old_path|$new_path|g" "$file"

                file_updated=true
            fi
        fi
    done

    if [[ "$file_updated" == "true" ]]; then
        ((updates_made++))
    fi
done < <(find "$TARGET_DIR" -type f \( -name "*.md" -o -name "*.ts" -o -name "*.json" \))

echo ""
echo "Summary:"
echo "  Files scanned: $files_scanned"
echo "  Files updated: $updates_made"

if [[ "$DRY_RUN" == "true" ]]; then
    echo ""
    echo "This was a dry run. Run without --dry-run to apply changes."
fi

if [[ $updates_made -gt 0 && "$DRY_RUN" == "false" ]]; then
    echo ""
    echo "Backups created with .bak extension"
    echo "To restore: find $TARGET_DIR -name '*.bak' -exec bash -c 'mv \"\$0\" \"\${0%.bak}\"' {} \;"
fi
