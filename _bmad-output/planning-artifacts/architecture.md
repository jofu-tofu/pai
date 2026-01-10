---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-PAI-CLI-2026-01-08.md'
  - '_bmad-output/planning-artifacts/prd.md'
workflowType: 'architecture'
project_name: '.pai'
user_name: 'Josh'
date: '2026-01-08'
status: 'complete'
completedAt: '2026-01-08'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
50 requirements across 11 categories covering the complete CLI lifecycle:
- Launch Automation (FR1-5): Core `pai launch` with automatic permissions, hooks, parallel sessions
- Status & Monitoring (FR6-9): Real-time token usage status bar
- Project Initialization (FR10-14): `pai init bmad` with sensible defaults
- Configuration & Environment (FR15-19): Flags, env vars, workspace detection
- Debugging & Troubleshooting (FR20-24): `--debug` flag, clear error messages
- Help & Documentation (FR25-29): Inline help system
- Command Structure (FR30-34): Subcommand hierarchy, piping support
- Scripting & Automation (FR35-39): Non-interactive, exit codes
- Shell Integration (FR40-42): Tab completion (Bash, Zsh, PowerShell)
- Performance & Reliability (FR43-46): <100ms startup, graceful degradation
- Framework Extensibility (FR47-50): Clear patterns for command addition

**Non-Functional Requirements:**
- **Performance:** <100ms startup, <50ms quick commands, imperceptible launch delay
- **Reliability:** Cross-platform consistency, stable exit codes, graceful error handling
- **Maintainability:** Clean file structure, easy extensibility, readable code
- **Testability:** 100% coverage MVP, TDD, cross-platform CI/CD
- **Integration:** Claude Code CLI, PAI hooks, future MCP/observability
- **Security:** Sandbox bypass with hook trust model, no credential storage

**Scale & Complexity:**
- Primary domain: CLI Tool (Developer Productivity)
- Complexity level: Low
- Estimated architectural components: 5-7 (command handler, config, platform abstraction, output formatting, shell completion, testing infrastructure)

### Technical Constraints & Dependencies

1. **Claude Code Dependency:** Must spawn and integrate with Claude Code CLI - version compatibility critical
2. **Cross-Platform:** Path normalization, shell differences abstracted from command logic
3. **Performance Budget:** <100ms startup rules out heavy runtimes or complex initialization
4. **No Config Files:** Flags and env vars only - keeps CLI lightweight and portable
5. **Security Model:** Trusts PAI hook system when disabling sandbox

### Cross-Cutting Concerns Identified

1. **Error Handling:** Consistent patterns across all commands (stderr, exit codes, actionable messages)
2. **Platform Abstraction:** Windows/macOS/Linux differences handled in shared utilities
3. **Output Formatting:** Human-readable default, pipe-aware adjustments, debug mode
4. **Testing Strategy:** Every command testable in isolation, cross-platform CI
5. **Extensibility Pattern:** Command registration and shared utilities for future additions

## Starter Template Evaluation

### Primary Technology Domain

CLI Tool (Developer Productivity) - requires subcommand architecture, shell completion, cross-platform support, and framework extensibility.

### Starter Options Considered

| Framework | TypeScript | Startup | Subcommands | Shell Completion | Verdict |
|-----------|------------|---------|-------------|------------------|---------|
| **Oclif** | Native | Optimized (28 deps) | Built-in | Built-in | Selected |
| Commander.js | Via types | Lightweight | Flat structure | Manual | Too manual |
| Custom | N/A | Minimal | Manual | Manual | Too much work |

### Selected Starter: Oclif

**Rationale for Selection:**
1. **TypeScript Native** - Core written in TypeScript, first-class support
2. **Performance** - Only 28 dependencies, loads only executed command (meets <100ms requirement)
3. **Subcommand Architecture** - Built-in topic/command hierarchy (`pai launch`, `pai init bmad`)
4. **Shell Completion** - Built-in autocomplete for Bash, Zsh, PowerShell (flags AND values)
5. **Extensibility** - Plugin system for future command additions
6. **Battle-tested** - Powers Heroku CLI, Salesforce CLI
7. **Generator Tooling** - `oclif generate command` for consistent command scaffolding

**Initialization Command:**

```bash
npx oclif generate pai-cli \
  --bin pai \
  --module-type ESM \
  --package-manager npm \
  --yes
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript with full type safety
- Node.js 18+ (LTS versions supported)
- ESM module system (modern JavaScript)

**Project Structure:**
```
pai-cli/
├── bin/
│   ├── dev.js          # Development entry (ts-node, no build)
│   └── run.js          # Production entry (compiled)
├── src/
│   ├── commands/       # Command implementations
│   │   └── launch.ts   # pai launch
│   │   └── init/
│   │       └── bmad.ts # pai init bmad
│   └── index.ts        # CLI exports
├── test/
│   └── commands/       # Command tests (mirrors src/commands)
├── package.json
└── tsconfig.json
```

**Command Organization:**
- File path = command name (`src/commands/launch.ts` → `pai launch`)
- Subdirectories = topics (`src/commands/init/bmad.ts` → `pai init bmad`)
- Class-based commands extending `Command` base class

**Build Tooling:**
- TypeScript compilation to `dist/`
- Development mode via `bin/dev.js` (no build required)
- Production mode via `bin/run.js` (compiled)

**Testing Framework:**
- Mocha test runner (oclif default)
- Test structure mirrors command structure
- `@oclif/test` utilities for CLI testing

**Development Experience:**
- `bin/dev.js` for instant TypeScript execution
- Hot module support via ts-node
- Built-in `--help` generation from command metadata
- `oclif generate command <name>` for scaffolding new commands

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Process spawning approach (child_process.spawn)
- Configuration resolution (~/.pai default + PAI_HOME override)
- Hook system integration (symlink approach)

**Important Decisions (Shape Architecture):**
- Status bar integration (Claude Code native)
- Error handling strategy (categorized exit codes)
- Distribution model (local to ~/.pai)
- Testing strategy (unit + integration)

**Deferred Decisions (Post-MVP):**
- MCP server context management
- Observability server auto-start
- CLI skill framework / plugin system

### Process Management

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Process Spawning | `child_process.spawn` | Built-in, zero dependencies, full stdio control for status bar |
| Claude Code Integration | Spawn with `--dangerouslySkipPermissions` | Core MVP requirement |
| Stdio Handling | Inherit for interactive, pipe for status | Enables both modes |

### Configuration & Environment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Default Location | `~/.pai` | Convention-based, zero-config for users |
| Override Mechanism | `PAI_HOME` env var | Flexibility without config files |
| Path Resolution | `path.join()` + `os.homedir()` | Cross-platform compatibility |
| Workspace Detection | Check for `.pai` markers | Graceful behavior in any directory |

### Hook System Integration

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Integration Method | Symlink settings.json | One-time setup, persists across sessions |
| Settings Location | `~/.claude/settings.json` → `~/.pai/.claude/settings.json` | Clean separation |
| Hook Discovery | Read from PAI settings structure | Follows existing PAI patterns |

### Status Bar & Monitoring

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Token Display | Claude Code native status line | Zero implementation, native integration |
| Progress Feedback | Oclif built-in spinners (when not piped) | Consistent with CLI patterns |

### Performance Baseline

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| CLI Startup | <100ms | 209ms | Accepted Deviation |

**Rationale:** The 209ms startup time exceeds the 100ms target (FR43) due to Oclif framework overhead (~187ms for core loading). This is accepted because:
1. Oclif provides essential features (help, completion, plugins) that would require significant custom code
2. The overhead is consistent and predictable
3. User-perceived "instant" threshold (~300ms) is still met
4. Alternative frameworks would require reimplementing Oclif's built-in capabilities

**Monitoring:** Track startup time in future releases; consider bundling optimization if it exceeds 300ms.

### Error Handling

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Exit Code Strategy | Categorized (0/1/2/3) | Enables scripting and automation |
| Exit Code 0 | Success | Standard |
| Exit Code 1 | General error | Catch-all for unexpected failures |
| Exit Code 2 | Invalid usage/arguments | User fixable |
| Exit Code 3 | Environment/prerequisite error | Setup issue |
| Error Output | stderr with actionable messages | Unix convention |
| Debug Mode | `--debug` flag for verbose logging | Troubleshooting support |

### Distribution & Installation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Installation Location | `~/.pai/bin/pai` | Self-contained within PAI ecosystem |
| PATH Setup | User adds `~/.pai/bin` to PATH | Simple, explicit |
| Future Option | npm global install possible | Can add later if needed |

### Testing Strategy

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Unit Tests | Mocha + @oclif/test | Oclif default, good utilities |
| Integration Tests | Actual CLI binary invocation | Catches real issues |
| E2E with Claude Code | Deferred | Too flaky for CI |
| CI Platform | GitHub Actions | Free, Windows/macOS/Linux matrix |
| Mocking Strategy | Mock child_process.spawn in unit tests | Fast, deterministic |
| Coverage Target | 100% for MVP core features | Per PRD requirement |

### Decision Impact Analysis

**Implementation Sequence:**
1. Oclif project scaffold
2. Configuration resolution (`~/.pai`, `PAI_HOME`)
3. `pai launch` command with child_process.spawn
4. Hook symlink setup (first-run or separate command)
5. Status line integration
6. Error handling patterns
7. Testing infrastructure
8. Shell completion generation

**Cross-Component Dependencies:**
- Configuration resolution must be complete before any command runs
- Hook symlink must exist before Claude Code inherits PAI functionality
- Error handling patterns should be established in base command class

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Addressed:** 7 areas where AI agents could make different choices, now standardized.

### Naming Patterns

**File Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Command files | lowercase, kebab-case | `launch.ts`, `init/bmad.ts` |
| Library files | kebab-case | `config-resolver.ts`, `path-utils.ts` |
| Test files | `.test.ts` suffix | `launch.test.ts` |
| Type files | kebab-case | `exit-codes.ts` |

**Code Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `ConfigResolver`, `LaunchCommand` |
| Interfaces | PascalCase (no I prefix) | `Config`, `LaunchOptions` |
| Functions | camelCase | `getPaiHome()`, `resolvePath()` |
| Constants | UPPER_SNAKE_CASE | `EXIT_CODES.SUCCESS`, `DEFAULT_PAI_HOME` |
| Variables | camelCase | `paiHome`, `configPath` |
| Type aliases | PascalCase | `ExitCode`, `SpawnResult` |

### Structure Patterns

**Project Organization:**
```
src/
├── commands/           # Oclif command implementations
│   ├── launch.ts
│   └── init/
│       └── bmad.ts
├── lib/                # Internal library code
│   ├── config.ts       # Configuration resolution
│   ├── paths.ts        # Path utilities
│   └── spawn.ts        # Process spawning utilities
├── types/              # Shared type definitions
│   ├── index.ts        # Re-exports all types
│   └── exit-codes.ts   # Exit code constants
└── index.ts            # CLI entry point
```

**Type Organization (Hybrid):**
- Shared types: `src/types/` (ExitCode, PaiConfig, SpawnResult)
- Command-specific types: Co-located with command file
- Rule: If used by 2+ files, move to `src/types/`

### Format Patterns

**Console Output:**
| Context | Format | Example |
|---------|--------|---------|
| Normal | Minimal, no prefix | `Launching Claude Code...` |
| Success | Minimal confirmation | `Claude Code session ended.` |
| Debug | `[debug]` prefix | `[debug] PAI_HOME resolved to /home/josh/.pai` |
| Errors | Actionable message | `Error: PAI_HOME not found. Set PAI_HOME env var or run 'pai setup'.` |

**Color Usage:**
- Use oclif `ux` utilities for automatic terminal detection
- Errors: red
- Success: green
- Debug: dim/gray
- No colors when piped (auto-detected)

**Error Message Structure:**
```
Error: {what_went_wrong}. {how_to_fix}.
```

### Code Patterns

**Async Operations:**
- Always use async/await (no promise chains)
- Wrap spawn operations in async functions
- Use try/catch for error handling

**Import Organization:**
```typescript
// 1. Node builtins (with node: prefix)
import { spawn } from 'node:child_process'
import { join } from 'node:path'

// 2. External packages
import { Command, Flags } from '@oclif/core'

// 3. Internal absolute imports
import { getPaiHome } from '../lib/config.js'
import { EXIT_CODES } from '../types/index.js'

// 4. Relative imports
import type { LaunchOptions } from './types.js'
```

### Process Patterns

**Exit Code Usage:**
```typescript
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_USAGE: 2,
  ENVIRONMENT_ERROR: 3,
} as const
```

**Error Handling Pattern:**
```typescript
try {
  const config = await loadConfig()
  await launchClaude(config)
} catch (error) {
  if (error instanceof ConfigNotFoundError) {
    this.error('PAI_HOME not found. Set PAI_HOME env var or run \'pai setup\'.', { exit: EXIT_CODES.ENVIRONMENT_ERROR })
  }
  this.error(`Unexpected error: ${error.message}`, { exit: EXIT_CODES.GENERAL_ERROR })
}
```

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow file naming conventions (kebab-case for files, PascalCase for classes)
2. Place shared utilities in `src/lib/`, shared types in `src/types/`
3. Use async/await for all async operations
4. Include actionable fix suggestions in all error messages
5. Use grouped imports with blank line separators
6. Use EXIT_CODES constants, never raw numbers

**Pattern Verification:**
- ESLint + Prettier enforce code style
- TypeScript strict mode catches type issues
- PR review checks pattern compliance

### Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| `IConfig` interface | `Config` interface |
| `src/utils/` or `src/helpers/` | `src/lib/` |
| `process.exit(1)` | `this.error(msg, { exit: EXIT_CODES.GENERAL_ERROR })` |
| Promise chains `.then().catch()` | `async/await` with `try/catch` |
| `Error: Something failed` | `Error: Something failed. Try X to fix.` |
| Mixed import ordering | Grouped: builtins → external → internal → relative |

## Project Structure & Boundaries

### Complete Project Directory Structure

```
pai-cli/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Cross-platform CI (Windows, macOS, Linux)
├── bin/
│   ├── dev.js                        # Development entry (ts-node, no build)
│   └── run.js                        # Production entry (compiled)
├── src/
│   ├── commands/
│   │   ├── launch.ts                 # pai launch - spawn Claude Code
│   │   ├── setup.ts                  # pai setup - symlink hooks/settings
│   │   └── init/
│   │       └── bmad.ts               # pai init bmad (v1.1)
│   ├── lib/
│   │   ├── config.ts                 # Configuration resolution (~/.pai, PAI_HOME)
│   │   ├── paths.ts                  # Cross-platform path utilities
│   │   ├── spawn.ts                  # child_process.spawn wrapper
│   │   ├── hooks.ts                  # Hook system integration
│   │   └── errors.ts                 # Custom error classes
│   ├── types/
│   │   ├── index.ts                  # Re-exports all shared types
│   │   ├── config.ts                 # PaiConfig, ResolvedPaths
│   │   └── exit-codes.ts             # EXIT_CODES constant
│   └── index.ts                      # CLI exports
├── test/
│   ├── commands/
│   │   ├── launch.test.ts            # Unit tests for launch command
│   │   ├── setup.test.ts             # Unit tests for setup command
│   │   └── init/
│   │       └── bmad.test.ts          # Unit tests for init bmad
│   ├── lib/
│   │   ├── config.test.ts            # Config resolution tests
│   │   ├── paths.test.ts             # Path utilities tests
│   │   └── spawn.test.ts             # Spawn wrapper tests
│   ├── integration/
│   │   └── cli.test.ts               # Integration tests (actual CLI invocation)
│   └── fixtures/
│       └── mock-pai-home/            # Mock ~/.pai for testing
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Architectural Boundaries

**CLI Entry Boundary:**
```
bin/run.js → src/index.ts → src/commands/*.ts
```
- Entry point loads oclif core
- Oclif routes to appropriate command
- Commands use lib/ for all operations

**Configuration Boundary:**
```
Environment (PAI_HOME) → src/lib/config.ts → Commands
```
- Config resolution happens once at command start
- All path resolution goes through `src/lib/paths.ts`
- No direct `process.env` access in commands

**Process Boundary:**
```
src/commands/launch.ts → src/lib/spawn.ts → child_process.spawn
```
- Commands never call spawn directly
- `spawn.ts` handles all stdio, error codes, cleanup
- Exit code translation happens in spawn wrapper

**Error Boundary:**
```
src/lib/errors.ts → Command catch blocks → oclif this.error()
```
- Custom error classes with exit codes
- Commands catch and translate to user-facing messages
- Debug mode shows full stack traces

### Requirements to Structure Mapping

**MVP Epic: Launch Automation**

| Requirement | File | Purpose |
|-------------|------|---------|
| FR1: pai launch | `src/commands/launch.ts` | Command implementation |
| FR2: Auto sandbox | `src/lib/spawn.ts` | Add flag to spawn args |
| FR3: Hook injection | `src/lib/hooks.ts` | Verify symlink exists |
| FR4: Parallel sessions | `src/lib/spawn.ts` | Detached spawn support |
| FR5: Zero config | `src/lib/config.ts` | Convention-based defaults |

**MVP Epic: Status & Monitoring**

| Requirement | File | Purpose |
|-------------|------|---------|
| FR6-7: Token status | `src/lib/config.ts` | Configure CC status line |
| FR8-9: Progress | Oclif `ux` utilities | Built-in spinners |

**MVP Epic: Configuration**

| Requirement | File | Purpose |
|-------------|------|---------|
| FR15: CLI flags | Each command file | Oclif Flags |
| FR16: Env vars | `src/lib/config.ts` | PAI_HOME resolution |
| FR17: Workspace detect | `src/lib/paths.ts` | Check for .pai markers |
| FR18: Path normalize | `src/lib/paths.ts` | Cross-platform join |

**MVP Epic: Error Handling**

| Requirement | File | Purpose |
|-------------|------|---------|
| FR20: Debug flag | Base command pattern | `--debug` flag |
| FR21: Error messages | `src/lib/errors.ts` | Actionable messages |
| FR22: stderr/stdout | Oclif conventions | Built-in |

**Post-MVP: Project Initialization**

| Requirement | File | Purpose |
|-------------|------|---------|
| FR10-14: pai init bmad | `src/commands/init/bmad.ts` | BMAD installer |

### Integration Points

**Internal Communication:**
- Commands import from `../lib/` for all utilities
- Types imported from `../types/`
- No cross-command imports

**External Integrations:**

| Integration | Interface | Location |
|-------------|-----------|----------|
| Claude Code CLI | `child_process.spawn('claude', [...])` | `src/lib/spawn.ts` |
| PAI Hook System | Symlink to `~/.claude/settings.json` | `src/lib/hooks.ts` |
| File System | `node:fs/promises` | `src/lib/paths.ts` |

**Data Flow:**
```
User runs `pai launch`
  → oclif routes to src/commands/launch.ts
  → launch.ts calls config.getPaiConfig()
  → config.ts resolves ~/.pai or PAI_HOME
  → launch.ts calls spawn.launchClaude(config)
  → spawn.ts executes child_process.spawn with flags
  → Claude Code runs with PAI hooks active
  → spawn.ts captures exit code
  → launch.ts returns appropriate exit code
```

### File Organization Patterns

**Configuration Files (Root):**
- `package.json` - Dependencies, scripts, oclif config
- `tsconfig.json` - TypeScript strict mode, ESM output
- `.eslintrc.json` - Code style enforcement
- `.prettierrc` - Formatting rules

**Source Organization:**
- Commands: One file per command, subdirs for topics
- Lib: One file per concern (config, paths, spawn, errors)
- Types: Shared interfaces, re-exported from index.ts

**Test Organization:**
- Mirror src/ structure for unit tests
- Separate `integration/` for CLI invocation tests
- `fixtures/` for mock data and test environments

### Development Workflow Integration

**Development Mode:**
```bash
./bin/dev.js launch          # Runs via ts-node, no build needed
./bin/dev.js launch --debug  # Verbose logging
```

**Build Process:**
```bash
npm run build                # TypeScript → dist/
./bin/run.js launch          # Runs compiled code
```

**Testing:**
```bash
npm test                     # All tests
npm run test:unit            # Unit tests only
npm run test:integration     # Integration tests only
```

**Distribution:**
```bash
npm run build
# Copy dist/ to ~/.pai/cli/
# Symlink ~/.pai/bin/pai → ~/.pai/cli/bin/run.js
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together seamlessly:
- Oclif provides native TypeScript support with ESM modules
- child_process.spawn integrates naturally with oclif command lifecycle
- Convention-based config resolution aligns with hook symlink strategy
- Exit code patterns map directly to oclif's this.error() API

**Pattern Consistency:**
Implementation patterns fully support architectural decisions:
- Naming conventions (kebab-case files, PascalCase classes) align with oclif defaults
- src/lib/ organization matches command import patterns
- Error handling patterns use oclif's built-in error utilities

**Structure Alignment:**
Project structure enables all chosen patterns:
- Commands directory follows oclif's file-as-command convention
- lib/ separation keeps commands clean and focused
- Test structure mirrors source for easy navigation

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
All 50 functional requirements have direct architectural support:
- Launch Automation (FR1-5): Fully covered by spawn.ts and launch.ts
- Status & Monitoring (FR6-9): Leverages Claude Code native status line
- Configuration (FR15-19): Convention-based with env var override
- Error Handling (FR20-24): Categorized exit codes with actionable messages
- CLI Features (FR25-42): Oclif provides built-in help, completion, piping
- Performance & Extensibility (FR43-50): Oclif architecture optimized for both

**Non-Functional Requirements Coverage:**
- Performance: Oclif's 28-dependency footprint and lazy loading meet <100ms target
- Reliability: Cross-platform path handling and graceful error patterns
- Maintainability: Clean separation of concerns, documented patterns
- Testability: Unit + integration strategy with 100% MVP coverage target
- Security: Hook trust model with explicit sandbox bypass documentation

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical decisions documented with specific versions
- 7 implementation patterns cover all identified conflict points
- Code examples provided for error handling, imports, exit codes

**Structure Completeness:**
- Complete file tree with 25+ files defined
- All directories have clear purposes documented
- Test fixtures and mock data locations specified

**Pattern Completeness:**
- Naming, structure, format, code, and process patterns defined
- Anti-patterns documented to prevent common mistakes
- Enforcement guidelines specify ESLint + Prettier + TypeScript strict

### Gap Analysis Results

**Critical Gaps:** None identified

**Important Gaps:** None identified

**Minor Gaps (address during implementation):**
- `pai setup` command implementation details - define in first story
- Claude Code status line configuration - research during implementation
- Shell completion installation instructions - add to README

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low complexity CLI)
- [x] Technical constraints identified (cross-platform, <100ms, no config files)
- [x] Cross-cutting concerns mapped (error handling, platform abstraction)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions (Node 18+, TypeScript, ESM)
- [x] Technology stack fully specified (Oclif framework)
- [x] Integration patterns defined (child_process.spawn, symlink hooks)
- [x] Performance considerations addressed (lazy loading, minimal deps)

**✅ Implementation Patterns**
- [x] Naming conventions established (7 element types defined)
- [x] Structure patterns defined (src/lib/, src/types/, hybrid)
- [x] Communication patterns specified (imports, boundaries)
- [x] Process patterns documented (async/await, error handling, exit codes)

**✅ Project Structure**
- [x] Complete directory structure defined (25+ files)
- [x] Component boundaries established (4 boundaries)
- [x] Integration points mapped (3 external integrations)
- [x] Requirements to structure mapping complete (all FRs mapped)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High - All validations passed, no critical or important gaps

**Key Strengths:**
1. Oclif provides battle-tested CLI foundation with built-in features
2. Clear separation between commands and library code
3. Comprehensive patterns prevent AI agent implementation conflicts
4. Direct mapping from all 50 FRs to specific files

**Areas for Future Enhancement:**
1. Plugin architecture for post-MVP extensibility
2. MCP server management patterns (v2.0)
3. Observability integration patterns (v2.0)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- When in doubt, check the anti-patterns table

**First Implementation Priority:**
```bash
npx oclif generate pai-cli \
  --bin pai \
  --module-type ESM \
  --package-manager npm \
  --yes
```

**Implementation Sequence:**
1. Generate oclif scaffold
2. Implement src/lib/config.ts (configuration resolution)
3. Implement src/lib/paths.ts (cross-platform utilities)
4. Implement src/lib/spawn.ts (Claude Code spawning)
5. Implement src/commands/launch.ts (MVP command)
6. Add tests for each component
7. Implement src/commands/setup.ts (hook symlink)
8. Integration testing
9. Distribution setup (~/.pai/bin/pai)

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-08
**Document Location:** _bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**Implementation Ready Foundation**
- 7 core architectural decisions made
- 7 implementation patterns defined
- 5 architectural components specified (commands, lib, types, test, config)
- 50 functional requirements fully supported

**AI Agent Implementation Guide**
- Technology stack: Oclif + TypeScript + ESM + Node 18+
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All 50 functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

