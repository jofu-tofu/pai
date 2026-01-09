#!/usr/bin/env bash
# test-installation.sh - Automated verification suite for PAI installation
#
# Usage: ./test-installation.sh [PAI_DIR]
# Output: Test results with pass/fail for each check
# Exit codes: 0 = all tests passed, 1 = one or more tests failed

set -euo pipefail

PAI_DIR="${1:-$PAI_DIR}"
TESTS_PASSED=0
TESTS_FAILED=0
FAILURES=()

test_check() {
    local test_name="$1"
    local test_command="$2"

    echo -n "Testing: $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo "✓ PASS"
        ((TESTS_PASSED++))
        return 0
    else
        echo "✗ FAIL"
        ((TESTS_FAILED++))
        FAILURES+=("$test_name")
        return 1
    fi
}

echo "========================================="
echo "PAI Installation Verification"
echo "========================================="
echo "Testing: $PAI_DIR"
echo ""

# Core structure tests
echo "Core Structure:"
test_check "PAI_DIR exists" "[[ -d \"$PAI_DIR\" ]]"
test_check "skills/ directory exists" "[[ -d \"$PAI_DIR/skills\" ]]"
test_check "MEMORY/ directory exists" "[[ -d \"$PAI_DIR/MEMORY\" ]]"
test_check "hooks/ directory exists" "[[ -d \"$PAI_DIR/hooks\" ]]"
echo ""

# CORE skill tests
echo "CORE Skill:"
test_check "CORE skill exists" "[[ -f \"$PAI_DIR/skills/CORE/SKILL.md\" ]]"
test_check "USER/ directory exists" "[[ -d \"$PAI_DIR/skills/CORE/USER\" ]]"
test_check "SYSTEM/ directory exists" "[[ -d \"$PAI_DIR/skills/CORE/SYSTEM\" ]]"
test_check "DAIDENTITY.md exists" "[[ -f \"$PAI_DIR/skills/CORE/USER/DAIDENTITY.md\" ]]"
echo ""

# MEMORY system tests
echo "MEMORY System:"
test_check "learnings/ exists" "[[ -d \"$PAI_DIR/MEMORY/learnings\" ]]"
test_check "sessions/ exists" "[[ -d \"$PAI_DIR/MEMORY/sessions\" ]]"
test_check "research/ exists" "[[ -d \"$PAI_DIR/MEMORY/research\" ]]"
test_check "No History/ subdirectory" "[[ ! -d \"$PAI_DIR/MEMORY/History\" ]]"
echo ""

# Hook system tests
echo "Hook System:"
test_check "security-validator.ts exists" "[[ -f \"$PAI_DIR/hooks/security-validator.ts\" ]]"
test_check "load-core-context.ts exists" "[[ -f \"$PAI_DIR/hooks/load-core-context.ts\" ]]"
test_check "lib/identity.ts exists" "[[ -f \"$PAI_DIR/hooks/lib/identity.ts\" ]]"
echo ""

# Settings tests
echo "Settings:"
test_check "settings.json exists" "[[ -f \"$PAI_DIR/.claude/settings.json\" ]]"
test_check "settings.json is valid JSON" "jq empty \"$PAI_DIR/.claude/settings.json\" 2>/dev/null"
echo ""

# Security system tests (if exists)
echo "Security System:"
if [[ -d "$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM" ]]; then
    test_check "PAISECURITYSYSTEM exists" "[[ -d \"$PAI_DIR/skills/CORE/USER/PAISECURITYSYSTEM\" ]]"
else
    echo "  (Security system not installed - optional)"
fi
echo ""

# Results summary
echo "========================================="
echo "Results:"
echo "  ✓ Passed: $TESTS_PASSED"
echo "  ✗ Failed: $TESTS_FAILED"
echo "========================================="

if [[ $TESTS_FAILED -gt 0 ]]; then
    echo ""
    echo "Failed tests:"
    for failure in "${FAILURES[@]}"; do
        echo "  - $failure"
    done
    echo ""
    exit 1
fi

echo ""
echo "✓ All tests passed! Installation verified."
exit 0
