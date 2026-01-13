#!/bin/bash
# DetectVersion.sh - Detect PAI installation version
# Part of UpdatePAI skill

set -e

PAI_DIR="${PAI_DIR:-}"

if [[ -z "$PAI_DIR" ]]; then
    echo "ERROR: PAI_DIR environment variable not set" >&2
    exit 1
fi

echo "Detecting PAI version at: $PAI_DIR"
echo ""

# Check if PAI_DIR exists
if [ ! -d "$PAI_DIR" ]; then
    echo "ERROR: PAI_DIR not found at $PAI_DIR"
    exit 1
fi

# Detect version based on structural features
VERSION="Unknown"
CONFIDENCE="Unknown"

# v2.1.1+ indicators
if [ -d "$PAI_DIR/skills/CORE/USER" ] && \
   [ -d "$PAI_DIR/skills/CORE/SYSTEM" ] && \
   [ -d "$PAI_DIR/MEMORY" ] && \
   [ ! -d "$PAI_DIR/MEMORY/History" ] && \
   [ -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]; then
    VERSION="v2.1.1+"
    CONFIDENCE="High"

# v2.0.x - v2.1.0 indicators
elif [ -d "$PAI_DIR/skills/CORE/USER" ] && \
     [ -d "$PAI_DIR/skills/CORE/SYSTEM" ] && \
     [ -d "$PAI_DIR/MEMORY" ] && \
     [ ! -d "$PAI_DIR/MEMORY/History" ]; then
    VERSION="v2.0.x - v2.1.0"
    CONFIDENCE="High"

# v1.1.0 - v1.4.0 indicators
elif [ -d "$PAI_DIR/skills/CORE/USER" ] && \
     [ -d "$PAI_DIR/skills/CORE/SYSTEM" ]; then
    VERSION="v1.1.0 - v1.4.0"
    CONFIDENCE="Medium"

# v1.0.x - v1.1.0 indicators
elif [ -f "$PAI_DIR/skills/CORE/Contacts.md" ] || \
     [ -f "$PAI_DIR/skills/CORE/CoreStack.md" ]; then
    VERSION="v1.0.x - v1.1.0"
    CONFIDENCE="High"

# Custom or unknown
else
    VERSION="Unknown or custom"
    CONFIDENCE="Low"
fi

echo "Detected Version: $VERSION"
echo "Confidence: $CONFIDENCE"
echo ""

# Detailed feature detection
echo "Feature Detection:"
echo "=================="

# MEMORY system
if [ -d "$PAI_DIR/MEMORY" ]; then
    if [ -d "$PAI_DIR/MEMORY/History" ]; then
        echo "  MEMORY: Present (with History/ parent - v1.x structure)"
    else
        echo "  MEMORY: Present (flattened - v2.1.1 structure)"
    fi
elif [ -d "$PAI_DIR/history" ]; then
    echo "  MEMORY: Old history/ directory (v1.0.x)"
else
    echo "  MEMORY: Not found"
fi

# CORE structure
if [ -d "$PAI_DIR/skills/CORE/USER" ] && [ -d "$PAI_DIR/skills/CORE/SYSTEM" ]; then
    echo "  CORE: USER/SYSTEM structure (v1.1.0+)"
elif [ -f "$PAI_DIR/skills/CORE/Contacts.md" ]; then
    echo "  CORE: Flat structure (v1.0.x)"
else
    echo "  CORE: Unknown structure"
fi

# DAIDENTITY
if [ -f "$PAI_DIR/skills/CORE/USER/DAIDENTITY.md" ]; then
    echo "  DAIDENTITY: Present (v1.4.0+)"
else
    echo "  DAIDENTITY: Not found (< v1.4.0 or not configured)"
fi

# PAISECURITYSYSTEM
if [ -d "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM" ]; then
    if [ -f "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM/patterns.yaml" ]; then
        echo "  PAISECURITYSYSTEM: Present with patterns.yaml (v1.3.0+)"
    else
        echo "  PAISECURITYSYSTEM: Directory exists but patterns.yaml missing"
    fi
else
    echo "  PAISECURITYSYSTEM: Not found (< v1.3.0)"
fi

# Voice system hooks
if [ -f "$PAI_DIR/hooks/stop-hook-voice.ts" ]; then
    echo "  Voice System: Hooks present (v1.4.0+)"
else
    echo "  Voice System: Not installed"
fi

# Retired hooks check
RETIRED_HOOKS=("capture-all-events.ts" "capture-session-summary.ts" "stop-hook.ts" "subagent-stop-hook.ts")
FOUND_RETIRED=0
for hook in "${RETIRED_HOOKS[@]}"; do
    if [ -f "$PAI_DIR/hooks/$hook" ]; then
        if [ $FOUND_RETIRED -eq 0 ]; then
            echo "  Retired Hooks: Found (WARNING - removed in v2.1.1)"
        fi
        FOUND_RETIRED=$((FOUND_RETIRED + 1))
    fi
done
if [ $FOUND_RETIRED -eq 0 ]; then
    echo "  Retired Hooks: None found (clean)"
fi

# Custom skills detection
echo ""
echo "Custom Skills:"
echo "=============="
CUSTOM_FOUND=0
for skill in EpicCode EpicGit EpicWiki; do
    if [ -d "$PAI_DIR/skills/$skill" ]; then
        echo "  ✓ $skill"
        CUSTOM_FOUND=$((CUSTOM_FOUND + 1))
    fi
done
if [ $CUSTOM_FOUND -eq 0 ]; then
    echo "  No custom Epic skills found"
fi

# Upgrade recommendation
echo ""
echo "Recommendation:"
echo "==============="

if [[ "$VERSION" == *"v1."* ]] || [[ "$VERSION" == *"v2.0"* ]]; then
    echo "  Your installation is behind the latest version (v2.1.1)"
    echo "  Consider upgrading using UpdatePAI skill:"
    echo "    - Run: Invoke UpdatePAI skill"
    echo "    - Choose: HybridUpdate workflow (recommended)"
    echo ""
    echo "  Benefits of upgrading:"
    echo "    - Enhanced PAISECURITYSYSTEM"
    echo "    - Voice integration support"
    echo "    - THE ALGORITHM execution framework"
    echo "    - Improved MEMORY structure"
    echo "    - Latest features and bug fixes"
elif [[ "$VERSION" == "v2.1.1+" ]]; then
    echo "  ✓ You are running the latest version!"
else
    echo "  Unable to determine upgrade path"
    echo "  Consider running Analyze workflow for detailed comparison"
fi

exit 0
