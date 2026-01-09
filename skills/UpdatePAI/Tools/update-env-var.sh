#!/usr/bin/env bash
# update-env-var.sh - Update PAI_DIR environment variable cross-platform
#
# Usage: ./update-env-var.sh [NEW_PAI_DIR]
# Supports: Windows (PowerShell + Git Bash), Linux, macOS
# Exit codes: 0 = success, 1 = error

set -euo pipefail

NEW_PAI_DIR="${1:-}"

if [[ -z "$NEW_PAI_DIR" ]]; then
    echo "ERROR: NEW_PAI_DIR not specified" >&2
    echo "Usage: $0 <new_pai_dir>" >&2
    exit 1
fi

if [[ ! -d "$NEW_PAI_DIR" ]]; then
    echo "ERROR: Directory does not exist: $NEW_PAI_DIR" >&2
    exit 1
fi

# Convert to absolute path
NEW_PAI_DIR=$(cd "$NEW_PAI_DIR" && pwd)

echo "Updating PAI_DIR to: $NEW_PAI_DIR"
echo ""

# Detect platform
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    PLATFORM="windows"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macos"
else
    PLATFORM="linux"
fi

echo "Detected platform: $PLATFORM"
echo ""

case "$PLATFORM" in
    windows)
        # Windows: Update both User environment variable AND bash profile

        # Convert to Windows path
        WIN_PATH=$(echo "$NEW_PAI_DIR" | sed 's|^/c/|C:/|' | sed 's|/|\\|g')

        echo "Step 1: Updating Windows User environment variable..."
        echo "Run this command in PowerShell (or Administrator PowerShell):"
        echo ""
        echo "  [System.Environment]::SetEnvironmentVariable('PAI_DIR', '$WIN_PATH', 'User')"
        echo ""

        # Update bash profile if exists
        if [[ -f "$HOME/.bashrc" ]]; then
            echo "Step 2: Updating ~/.bashrc..."

            # Remove old PAI_DIR export
            sed -i '/export PAI_DIR=/d' "$HOME/.bashrc"

            # Add new PAI_DIR export
            echo "export PAI_DIR=\"$NEW_PAI_DIR\"" >> "$HOME/.bashrc"

            echo "  ✓ Updated ~/.bashrc"
        fi

        if [[ -f "$HOME/.bash_profile" ]]; then
            echo "Step 3: Updating ~/.bash_profile..."

            # Remove old PAI_DIR export
            sed -i '/export PAI_DIR=/d' "$HOME/.bash_profile"

            # Add new PAI_DIR export
            echo "export PAI_DIR=\"$NEW_PAI_DIR\"" >> "$HOME/.bash_profile"

            echo "  ✓ Updated ~/.bash_profile"
        fi

        echo ""
        echo "IMPORTANT: You must restart your terminal for changes to take effect!"
        ;;

    macos)
        # macOS: Update .zshrc (default shell in recent macOS)
        if [[ -f "$HOME/.zshrc" ]]; then
            echo "Updating ~/.zshrc..."

            # Remove old PAI_DIR export
            sed -i '' '/export PAI_DIR=/d' "$HOME/.zshrc"

            # Add new PAI_DIR export
            echo "export PAI_DIR=\"$NEW_PAI_DIR\"" >> "$HOME/.zshrc"

            echo "  ✓ Updated ~/.zshrc"
        fi

        # Also update .bashrc if exists
        if [[ -f "$HOME/.bashrc" ]]; then
            echo "Updating ~/.bashrc..."

            sed -i '' '/export PAI_DIR=/d' "$HOME/.bashrc"
            echo "export PAI_DIR=\"$NEW_PAI_DIR\"" >> "$HOME/.bashrc"

            echo "  ✓ Updated ~/.bashrc"
        fi

        echo ""
        echo "Please restart your terminal or run: source ~/.zshrc"
        ;;

    linux)
        # Linux: Update .bashrc
        if [[ -f "$HOME/.bashrc" ]]; then
            echo "Updating ~/.bashrc..."

            # Remove old PAI_DIR export
            sed -i '/export PAI_DIR=/d' "$HOME/.bashrc"

            # Add new PAI_DIR export
            echo "export PAI_DIR=\"$NEW_PAI_DIR\"" >> "$HOME/.bashrc"

            echo "  ✓ Updated ~/.bashrc"
        fi

        echo ""
        echo "Please restart your terminal or run: source ~/.bashrc"
        ;;
esac

echo ""
echo "========================================="
echo "Environment variable update initiated"
echo "========================================="
echo ""
echo "To verify after restart:"
echo "  echo \$PAI_DIR"
echo ""
echo "Expected output: $NEW_PAI_DIR"
