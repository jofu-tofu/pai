# Story 1.1: Generate Oclif CLI Scaffold

Status: done

## Story

As a developer,
I want to initialize the PAI CLI project using Oclif,
so that I have a working CLI foundation with built-in help and version commands.

## Acceptance Criteria

1. **Given** an empty project directory
   **When** I run `npx oclif generate pai-cli --bin pai --module-type ESM --package-manager npm --yes`
   **Then** a new Oclif project is created with TypeScript and ESM modules

2. **Given** the generated Oclif project
   **When** I run `./bin/dev.js --help`
   **Then** CLI usage information is displayed

3. **Given** the generated Oclif project
   **When** I run `./bin/dev.js --version`
   **Then** the version number is displayed

4. **Given** the generated Oclif project
   **When** I inspect the project structure
   **Then** the structure includes:
   - `src/commands/` directory for command implementations
   - `bin/` directory with dev.js and run.js entry points
   - `package.json` with oclif configuration
   - `tsconfig.json` with TypeScript configuration

## Tasks / Subtasks

- [x] Task 1: Generate Oclif Scaffold (AC: #1)
  - [x] 1.1 Create empty project directory `pai-cli/` inside ~/.pai
  - [x] 1.2 Run `npx oclif generate pai-cli --bin pai --module-type ESM --package-manager npm --yes`
  - [x] 1.3 Verify TypeScript configuration is present
  - [x] 1.4 Verify ESM module type in package.json (`"type": "module"`)

- [x] Task 2: Verify CLI Entry Points (AC: #2, #3)
  - [x] 2.1 Run `./bin/dev.js --help` and verify output
  - [x] 2.2 Run `./bin/dev.js --version` and verify output
  - [x] 2.3 Ensure bin files have correct shebang and are executable

- [x] Task 3: Verify Project Structure (AC: #4)
  - [x] 3.1 Confirm `src/commands/` directory exists
  - [x] 3.2 Confirm `bin/dev.js` and `bin/run.js` exist
  - [x] 3.3 Confirm `package.json` has oclif configuration section
  - [x] 3.4 Confirm `tsconfig.json` has strict mode enabled

- [x] Task 4: Initial Build Verification
  - [x] 4.1 Run `npm run build` to compile TypeScript
  - [x] 4.2 Verify `dist/` directory is created
  - [x] 4.3 Run `./bin/run.js --help` (production entry point)

## Dev Notes

### Critical Architecture Compliance

**Framework Selection:** Oclif (Salesforce CLI framework)
- Rationale: Native TypeScript, <100ms startup, built-in subcommand architecture, shell completion
- Powers Heroku CLI, Salesforce CLI - battle-tested

**Exact Initialization Command:**
```bash
npx oclif generate pai-cli \
  --bin pai \
  --module-type ESM \
  --package-manager npm \
  --yes
```

**DO NOT DEVIATE** from this command - architecture decisions depend on these specific flags.

### Technology Stack (from Architecture)

| Component | Specification |
|-----------|---------------|
| Framework | Oclif |
| Language | TypeScript (strict mode) |
| Module System | ESM (`"type": "module"`) |
| Runtime | Node.js 18+ LTS |
| Package Manager | npm |

### Expected Project Structure After Generation

```
pai-cli/
├── bin/
│   ├── dev.js          # Development entry (ts-node, no build)
│   └── run.js          # Production entry (compiled)
├── src/
│   ├── commands/       # Command implementations (file = command)
│   └── index.ts        # CLI exports
├── test/
│   └── commands/       # Command tests
├── package.json        # With oclif config section
└── tsconfig.json       # TypeScript strict mode
```

### Import Pattern Requirements

All imports in this project MUST follow this order:
```typescript
// 1. Node builtins (with node: prefix)
import { spawn } from 'node:child_process'

// 2. External packages
import { Command, Flags } from '@oclif/core'

// 3. Internal absolute imports
import { getPaiHome } from '../lib/config.js'

// 4. Relative imports
import type { LaunchOptions } from './types.js'
```

**CRITICAL:** ESM requires file extensions in imports (`.js` not `.ts`)

### Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| `import { x } from './file'` | `import { x } from './file.js'` |
| Create `src/utils/` directory | Use `src/lib/` (created in Story 1.3) |
| Modify default oclif structure | Accept scaffold as-is for this story |

### Project Location

**Target Directory:** `~/.pai/pai-cli/` (or `$PAI_HOME/pai-cli/` if set)

This keeps the CLI source within the PAI ecosystem. The compiled binary will later be symlinked to `~/.pai/bin/pai`.

### Verification Commands

After scaffold generation, verify with:
```bash
cd pai-cli
./bin/dev.js --help     # Should show oclif help
./bin/dev.js --version  # Should show version
npm run build           # Should compile to dist/
./bin/run.js --help     # Production mode help
```

### Project Structure Notes

- Oclif scaffold provides minimal structure - additional directories created in later stories
- `src/lib/` and `src/types/` will be added in Story 1.3
- Test infrastructure expanded in Story 1.4
- This story focuses ONLY on successful scaffold generation

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter-Template-Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Selected-Starter-Oclif]
- [Source: _bmad-output/planning-artifacts/prd.md#MVP-Feature-Set]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.1]
- [Source: _bmad-output/project-context.md#Oclif-Command-Patterns]

### Success Criteria Checklist

- [x] Oclif project generated with correct flags
- [x] TypeScript strict mode enabled
- [x] ESM module system configured
- [x] `./bin/dev.js --help` works
- [x] `./bin/dev.js --version` works
- [x] `npm run build` succeeds
- [x] Project structure matches architecture specification

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - scaffold generation completed without errors requiring debugging.

### Completion Notes List

- **2026-01-08**: Successfully generated Oclif scaffold at `~/.pai/pai-cli/`
- Used exact command: `npx oclif generate pai-cli --bin pai --module-type ESM --package-manager npm --yes`
- All acceptance criteria verified and passing
- Test suite passes (2 tests, linting successful)
- Minor Node.js deprecation warnings related to Node v24 (non-blocking)

### File List

**New Files Created (via oclif scaffold generator):**
- `pai-cli/.gitignore`
- `pai-cli/.prettierrc.json`
- `pai-cli/.mocharc.json`
- `pai-cli/eslint.config.mjs`
- `pai-cli/package.json`
- `pai-cli/package-lock.json`
- `pai-cli/README.md`
- `pai-cli/tsconfig.json`
- `pai-cli/bin/dev.js`
- `pai-cli/bin/dev.cmd`
- `pai-cli/bin/run.js`
- `pai-cli/bin/run.cmd`
- `pai-cli/src/index.ts`
- `pai-cli/src/commands/hello/index.ts`
- `pai-cli/src/commands/hello/world.ts`
- `pai-cli/test/tsconfig.json`
- `pai-cli/test/commands/hello/index.test.ts`
- `pai-cli/test/commands/hello/world.test.ts`
- `pai-cli/.vscode/launch.json`
- `pai-cli/.github/workflows/onPushToMain.yml`
- `pai-cli/.github/workflows/onRelease.yml`
- `pai-cli/.github/workflows/test.yml`
- `pai-cli/dist/` (compiled output)
- `pai-cli/tsconfig.tsbuildinfo` (TypeScript build info)

**Modified Files (Code Review Fixes):**
- `pai-cli/package.json` - Fixed description, GitHub URLs, keywords

## Senior Developer Review (AI)

**Review Date:** 2026-01-08
**Reviewer:** Claude Opus 4.5 (Adversarial Code Review)
**Review Outcome:** Changes Requested

### Summary

Code review identified 8 issues (2 High, 3 Medium, 3 Low). Fixed 4 issues automatically:
- ✅ Added pai-cli/ to git tracking
- ✅ Fixed invalid GitHub URLs in package.json
- ✅ Updated generic description to describe PAI CLI
- ✅ Added missing tsconfig.tsbuildinfo to File List

### Action Items

- [ ] [HIGH] Security vulnerability in @oclif/plugin-plugins transitive dependency (glob CLI command injection). Cannot auto-fix without breaking changes. Monitor for upstream fix. [pai-cli/package.json]
- [x] [HIGH] Git tracking missing - pai-cli/ was untracked. **FIXED** - Added to git staging.
- [x] [MEDIUM] Invalid GitHub URLs (.pai is not valid org). **FIXED** - Updated to pai-cli/pai-cli placeholder.
- [x] [MEDIUM] Generic description. **FIXED** - Updated to "PAI CLI - Personal AI Infrastructure command-line interface".
- [x] [MEDIUM] Story File List incomplete. **FIXED** - Added tsconfig.tsbuildinfo.
- [ ] [LOW] Test coverage - Tests only cover happy path, no error case testing. [pai-cli/test/commands/]
- [ ] [LOW] Author field is "jofu-tofu" - update when GitHub org finalized. [pai-cli/package.json:5]
- [ ] [LOW] Placeholder hello commands - will be cleaned up in future stories. [pai-cli/src/commands/hello/]

### Review Follow-ups (AI)

- [ ] [AI-Review][HIGH] Monitor @oclif/plugin-plugins for security fix to glob CLI vulnerability
- [ ] [AI-Review][LOW] Add error case tests for hello commands (missing required args)
- [ ] [AI-Review][LOW] Update author field when GitHub organization is established

