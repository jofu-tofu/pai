# Story 2.2: Implement Cross-Platform Path Utilities

Status: review

## Story

As a developer,
I want path utilities that handle OS differences transparently,
So that the CLI works identically on Windows, macOS, and Linux.

## Epic Context

**Epic 2: Zero-Friction Claude Code Launch**
Goal: Josh can launch Claude Code with `pai launch`, automatically configured with sandbox permissions, hooks injected, and token usage visible in the status bar.

## Acceptance Criteria

1. **AC1**: Given path operations in the CLI, when executed on Windows, macOS, or Linux, then `path.join()` and `os.homedir()` are used consistently for all path construction
2. **AC2**: Given path operations in the CLI, when executed on any platform, then path separators are handled correctly per platform (backslash on Windows, forward slash on Unix)
3. **AC3**: Given a directory to check, when workspace detection is performed, then it checks for `.pai` directory markers correctly (FR17)
4. **AC4**: Given mixed path separators in input (e.g., from environment variables or user input), when paths are resolved, then they are normalized to platform-appropriate separators

## Tasks / Subtasks

- [x] **Task 1: Expand path utilities in `src/lib/paths.ts`** (AC: #1, #2, #4)
  - [x] 1.1: Add `normalizePath()` function to convert any path to platform-native separators
  - [x] 1.2: Add `getHomePath()` wrapper around `os.homedir()` for consistency
  - [x] 1.3: Add `expandPath()` function to handle `~` home directory expansion
  - [x] 1.4: Add `toUnixPath()` and `toWindowsPath()` for cross-platform path logging/display
  - [x] 1.5: Add `pathExists()` async wrapper for cleaner path validation
  - [x] 1.6: Ensure all functions use `node:path` and `node:os` with proper prefix

- [x] **Task 2: Enhance workspace detection** (AC: #3)
  - [x] 2.1: Update `isWorkspace()` to check for `.pai` directory (not just file)
  - [x] 2.2: Add `findWorkspaceRoot()` to search up the directory tree for `.pai` marker
  - [x] 2.3: Add `getWorkspacePath()` that returns null or workspace root path

- [x] **Task 3: Write comprehensive unit tests** (AC: #1, #2, #3, #4)
  - [x] 3.1: Add tests for `normalizePath()` with mixed separators
  - [x] 3.2: Add tests for `expandPath()` with `~` prefix
  - [x] 3.3: Add tests for workspace detection functions
  - [x] 3.4: Add cross-platform test fixtures (mock Windows/Unix paths)
  - [x] 3.5: Test edge cases: empty paths, absolute vs relative, trailing separators

- [x] **Task 4: Update barrel exports and integrate** (AC: all)
  - [x] 4.1: Update `src/lib/index.ts` with new exports
  - [x] 4.2: Verify no breaking changes to existing `config.ts` usage
  - [x] 4.3: Run full test suite to ensure no regressions

## Dev Notes

### Architecture Compliance

Per `architecture.md` (Implementation Patterns section):
- Use `node:` prefix for Node builtins: `import { join } from 'node:path'`
- File naming: kebab-case (`paths.ts` - already correct)
- Function naming: camelCase (`resolvePath`, `isWorkspace`)
- Place shared utilities in `src/lib/`

### Previous Story Intelligence

From Story 2.1 (Implement Configuration Resolution):
- `config.ts` already uses `paths.ts` indirectly via `node:path` and `node:os`
- Pattern established: functions return values, throw errors on failure
- Debug logging pattern: use `debug()` from `./debug.js` for verbose output
- Error handling pattern: throw custom errors from `./errors.js`

Files created in 2.1 that interact with paths:
- `pai-cli/src/lib/config.ts` - uses `homedir()`, `join()`
- `pai-cli/src/lib/debug.ts` - outputs to stderr
- `pai-cli/src/lib/errors.ts` - custom error classes

### Technical Requirements

**Node.js Path Module Key Functions:**
```typescript
import { join, normalize, sep, parse, format, isAbsolute, relative, resolve } from 'node:path'
import { homedir, platform } from 'node:os'
```

**Platform Detection:**
- `process.platform` returns: `'win32'` | `'darwin'` | `'linux'` | etc.
- `path.sep` returns `'\\'` on Windows, `'/'` on Unix

**Key Considerations:**
1. Windows accepts both `/` and `\` as separators in Node.js `path.join()`
2. Environment variables may contain mixed separators
3. User input (CLI args) may use either separator
4. Display/logging should use native separators for clarity

### File Structure Requirements

Per architecture, paths.ts should contain:
```
src/lib/
  paths.ts         # Cross-platform path utilities (this story)
  config.ts        # Uses paths for configuration resolution
  errors.ts        # Custom error classes
  debug.ts         # Debug logging
  index.ts         # Barrel exports
```

### Testing Standards

Per `project-context.md`:
- Test files use `.test.ts` suffix
- Tests mirror src/ structure: `test/lib/paths.test.ts`
- Mock filesystem operations where needed
- Target 100% coverage for MVP core features

### Code Patterns to Follow

**Import Organization:**
```typescript
// 1. Node builtins (with node: prefix)
import { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import { join, normalize, sep, isAbsolute } from 'node:path'

// 2. Internal imports
import { debug } from './debug.js'
```

**Function Documentation:**
```typescript
/**
 * Brief description of what the function does.
 * @param paramName - Description of parameter
 * @returns Description of return value
 */
export function functionName(paramName: string): string {
  // implementation
}
```

### Project Structure Notes

Current `paths.ts` implementation (17 lines):
- `resolvePath(...segments)` - wraps `path.join()`
- `isWorkspace(dir)` - checks for `.pai` marker

After this story, `paths.ts` should include:
- All existing functions (maintained for backward compatibility)
- `normalizePath(path)` - platform-native separator normalization
- `getHomePath()` - consistent home directory access
- `expandPath(path)` - handle `~` expansion
- `toUnixPath(path)` / `toWindowsPath(path)` - cross-platform display
- `pathExists(path)` - async path validation
- `findWorkspaceRoot(startDir)` - search for `.pai` marker up tree
- `getWorkspacePath(startDir)` - return workspace root or null

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Configuration-&-Environment]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.2]
- [Source: _bmad-output/project-context.md#TypeScript-&-ESM-Rules]
- [Source: pai-cli/src/lib/config.ts] - current usage patterns
- [Source: pai-cli/src/lib/paths.ts] - current implementation to extend

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - No debug issues encountered

### Completion Notes List

- Implemented 8 new path utility functions following red-green-refactor TDD cycle
- All functions use `node:` prefix for Node.js builtins per architecture requirements
- `normalizePath()` handles mixed separators (forward/back slashes) and normalizes to platform-native
- `getHomePath()` provides consistent wrapper around `os.homedir()`
- `expandPath()` handles `~` tilde expansion at path start only
- `toUnixPath()` and `toWindowsPath()` enable cross-platform logging/display
- `pathExists()` provides async path validation using `fs/promises.access()`
- `findWorkspaceRoot()` searches up directory tree for `.pai` marker
- `getWorkspacePath()` wraps `findWorkspaceRoot()` with cwd default
- All 110 tests pass including 37 new path utility tests
- Lint passes with only pre-existing unrelated warning

### File List

| File | Change Type | Description |
|------|-------------|-------------|
| `pai-cli/src/lib/paths.ts` | Modified | Added 8 new path utility functions (getHomePath, expandPath, toUnixPath, toWindowsPath, normalizePath, pathExists, findWorkspaceRoot, getWorkspacePath) |
| `pai-cli/src/lib/index.ts` | Modified | Added exports for all 10 path functions |
| `pai-cli/test/lib/paths.test.ts` | Modified | Added 37 comprehensive unit tests for all path utilities |

### Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-01-09 | SM Agent | Story created with comprehensive context |
| 2026-01-09 | Dev Agent (Amelia) | Implemented all path utilities with tests, all ACs satisfied |
