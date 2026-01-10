# Story 2.1: Implement Configuration Resolution

## Story

As a developer,
I want PAI CLI to automatically resolve configuration paths,
So that it works out-of-the-box with sensible defaults while supporting customization.

## Status

**Status:** done
**Epic:** 2 - Zero-Friction Claude Code Launch
**Priority:** High

## Acceptance Criteria

- [x] **AC1**: Given no environment variables set, when PAI CLI resolves configuration, then it uses `~/.pai` as the default PAI home directory and paths are correctly resolved on Windows, macOS, and Linux
- [x] **AC2**: Given `PAI_HOME` environment variable is set, when PAI CLI resolves configuration, then it uses the specified path instead of `~/.pai` and debug output shows the resolved path
- [x] **AC3**: Given `PAI_HOME` points to a non-existent directory, when PAI CLI resolves configuration, then it fails gracefully with an actionable error message (exit code 3)

## Tasks

- [x] Create `src/lib/config.ts` with configuration resolution logic
  - [x] Implement `getPaiHome()` function with PAI_HOME override
  - [x] Implement `validatePaiHome()` for directory existence check
  - [x] Implement `loadConfig()` returning full PaiConfig
  - [x] Add debug logging for resolved paths
- [x] Create `src/lib/debug.ts` with debug logging utilities
  - [x] Implement `debug()` function with [debug] prefix
  - [x] Implement `setDebugEnabled()` and `isDebugEnabled()`
  - [x] Output to stderr with dim color when TTY supports it
- [x] Create `src/lib/errors.ts` with custom error classes
  - [x] Implement `PaiError` base class with exit code
  - [x] Implement `ConfigNotFoundError` with exit code 3
- [x] Update `src/lib/index.ts` barrel exports
- [x] Write unit tests in `test/lib/config.test.ts`
  - [x] Test default path resolution
  - [x] Test PAI_HOME override
  - [x] Test validation error with actionable message
  - [x] Test cross-platform path handling
- [x] Write unit tests in `test/lib/debug.test.ts`
  - [x] Test debug output when enabled/disabled
  - [x] Test [debug] prefix formatting
- [x] Write integration tests in `test/integration/config.test.ts`
  - [x] End-to-end config loading tests
  - [x] Platform-specific path verification

## Dev Agent Record

### Implementation Notes

Configuration resolution implemented following architecture patterns:
- Uses `node:os` homedir() for cross-platform home directory
- Uses `node:path` join() for platform-appropriate path separators
- Uses `node:fs` existsSync() for directory validation
- Debug output to stderr with dim ANSI color when TTY supports

### File List

| File | Change Type | Description |
|------|-------------|-------------|
| `pai-cli/src/lib/config.ts` | Modified | Added loadConfig, validatePaiHome, expanded PaiConfig interface |
| `pai-cli/src/lib/debug.ts` | Added | Debug logging utilities |
| `pai-cli/src/lib/errors.ts` | Existing | Custom error classes with exit codes |
| `pai-cli/src/lib/paths.ts` | Existing | Cross-platform path utilities |
| `pai-cli/src/lib/index.ts` | Modified | Updated barrel exports for debug module |
| `pai-cli/test/lib/config.test.ts` | Modified | Expanded unit tests for config |
| `pai-cli/test/lib/debug.test.ts` | Added | Unit tests for debug module |
| `pai-cli/test/lib/index.test.ts` | Modified | Tests for barrel exports |
| `pai-cli/test/integration/config.test.ts` | Added | Integration tests for config |

### Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-01-09 | Dev Agent | Initial implementation of config resolution |
| 2026-01-09 | Code Review | Fixed missing debug.ts, added tests, created story file |

## References

- Architecture: `_bmad-output/planning-artifacts/architecture.md` (Configuration & Environment section)
- Epic: `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.1)
- Project Context: `_bmad-output/project-context.md`
