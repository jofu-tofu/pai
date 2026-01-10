---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
status: complete
completedAt: 2026-01-08
---

# .pai - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for .pai (PAI CLI), decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Launch Automation**
- FR1: User can launch Claude Code with a single command (`pai launch`)
- FR2: System automatically applies dangerous sandbox disable permission when launching
- FR3: System automatically injects PAI hook system during Claude Code launch
- FR4: User can launch multiple parallel Claude Code sessions
- FR5: System ensures zero manual configuration required after initial setup

**Status & Monitoring**
- FR6: User can view real-time token usage percentage in status bar
- FR7: System displays token consumption at all times during session
- FR8: User can see clear status indicators for launch operations
- FR9: System provides progress feedback for long-running operations

**Project Initialization**
- FR10: User can initialize BMAD in a new project with a single command (`pai init bmad`)
- FR11: System applies sensible default configuration without prompting user
- FR12: System automatically configures agents and workflows during initialization
- FR13: System makes version control-aware setup decisions automatically
- FR14: User can initialize future integrations using `pai init <thing>` pattern

**Configuration & Environment**
- FR15: User can configure PAI CLI using command-line flags
- FR16: User can override settings using environment variables
- FR17: System detects PAI workspace context automatically
- FR18: System normalizes file paths across Windows, macOS, and Linux
- FR19: User can specify custom PAI home directory

**Debugging & Troubleshooting**
- FR20: User can enable verbose debug logging with `--debug` flag
- FR21: System provides clear error messages with actionable next steps
- FR22: System outputs errors to stderr and data to stdout correctly
- FR23: User can diagnose hook injection failures through detailed logging
- FR24: System displays version information in debug output

**Help & Documentation**
- FR25: User can view global help with `pai --help`
- FR26: User can view command-specific help with `pai <command> --help`
- FR27: System displays clear, actionable help messages with examples
- FR28: User can check PAI CLI version with `pai --version`
- FR29: System provides inline help text for all commands

**Command Structure & Interface**
- FR30: User can execute commands using subcommand hierarchy (`pai <command> <subcommand>`)
- FR31: User can use both short and long flag forms (e.g., `-d` and `--debug`)
- FR32: System provides consistent command naming patterns for discoverability
- FR33: User can pipe PAI CLI output to other tools
- FR34: System adjusts output formatting when piping is detected

**Scripting & Automation**
- FR35: User can execute all commands non-interactively in scripts
- FR36: System returns appropriate exit codes (0 for success, non-zero for failures)
- FR37: User can suppress output for scripting contexts
- FR38: System provides stable, predictable output formats for parsing
- FR39: User can chain PAI CLI commands with other CLI tools

**Shell Integration**
- FR40: User can use tab completion for commands and subcommands (Bash, Zsh, PowerShell)
- FR41: System suggests available commands during tab completion
- FR42: User can autocomplete flags during command entry

**Performance & Reliability**
- FR43: System starts CLI in under 100ms
- FR44: System executes quick commands instantaneously
- FR45: System gracefully handles missing prerequisites
- FR46: System validates version compatibility with Claude Code

**Framework Extensibility**
- FR47: Developer can add new commands following clear patterns
- FR48: Developer can register subcommands using consistent architecture
- FR49: Developer can use shared utilities for common CLI operations
- FR50: System provides hooks for command extension points

### NonFunctional Requirements

**Performance**
- NFR-P1: CLI binary startup time must be under 100ms from command execution to first output
- NFR-P2: `pai launch` must complete without noticeable delay; hook injection must be instant
- NFR-P3: Quick commands (help, version) execute in under 50ms

**Reliability**
- NFR-R1: All commands must fail gracefully with clear, actionable error messages
- NFR-R2: Commands must handle missing prerequisites gracefully with partial functionality
- NFR-R3: Commands must behave identically on Windows, macOS, and Linux
- NFR-R4: Exit codes must be stable and predictable for scripting

**Maintainability**
- NFR-M1: File structure must be organized, logical, and intuitive
- NFR-M2: Adding new commands requires minimal code changes following clear patterns
- NFR-M3: Code must be readable and well-documented
- NFR-M4: Time to add new command decreases over time

**Testability**
- NFR-T1: 100% test coverage for all MVP core features
- NFR-T2: Tests written before implementation (TDD)
- NFR-T3: All features tested on Windows, macOS, and Linux
- NFR-T4: Exit code and help text validation in test suite

**Integration**
- NFR-I1: Seamless integration with Claude Code CLI with version compatibility
- NFR-I2: Hook system integration works reliably
- NFR-I3: Architecture supports future MCP and observability integration
- NFR-I4: Tab completion works correctly across Bash, Zsh, PowerShell

**Security**
- NFR-S1: CLI disables sandbox only through explicit `pai launch`; relies on hook trust model
- NFR-S2: No storage of credentials or sensitive data

### Additional Requirements

**From Architecture - Starter Template:**
- CRITICAL: Use Oclif framework for CLI scaffold (affects Epic 1 Story 1)
- Initialization command: `npx oclif generate pai-cli --bin pai --module-type ESM --package-manager npm --yes`

**From Architecture - Process Management:**
- Use `child_process.spawn` for Claude Code integration (zero dependencies, full stdio control)
- Spawn with `--dangerouslySkipPermissions` flag
- Inherit stdio for interactive mode, pipe for status capture

**From Architecture - Configuration:**
- Default PAI location: `~/.pai` (convention-based, zero-config)
- Override via `PAI_HOME` environment variable
- Cross-platform path resolution using `path.join()` + `os.homedir()`
- Workspace detection by checking for `.pai` markers

**From Architecture - Hook System:**
- Integration via symlink: `~/.claude/settings.json` → `~/.pai/.claude/settings.json`
- One-time setup that persists across sessions
- Requires `pai setup` command for symlink creation

**From Architecture - Status Bar:**
- Leverage Claude Code native status line (zero implementation needed)
- Use Oclif built-in spinners for progress feedback

**From Architecture - Error Handling:**
- Categorized exit codes: 0 (success), 1 (general error), 2 (invalid usage), 3 (environment error)
- All error messages on stderr with actionable next steps
- `--debug` flag for verbose logging

**From Architecture - Distribution:**
- Install to `~/.pai/bin/pai`
- User adds `~/.pai/bin` to PATH manually
- Future option: npm global install

**From Architecture - Testing:**
- Mocha + @oclif/test for unit tests
- Actual CLI binary invocation for integration tests
- GitHub Actions CI with Windows/macOS/Linux matrix
- Mock child_process.spawn in unit tests

**From Architecture - Project Structure:**
- Commands in `src/commands/` (file path = command name)
- Shared utilities in `src/lib/` (config, paths, spawn, hooks, errors)
- Shared types in `src/types/`
- Tests mirror source structure

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Launch Claude Code with single command |
| FR2 | Epic 2 | Auto-apply sandbox disable permission |
| FR3 | Epic 2 | Auto-inject PAI hook system |
| FR4 | Epic 2 | Multiple parallel sessions |
| FR5 | Epic 2 | Zero manual config after setup |
| FR6 | Epic 2 | Real-time token usage in status bar |
| FR7 | Epic 2 | Token consumption visible always |
| FR8 | Epic 2 | Clear status indicators for launch |
| FR9 | Epic 2 | Progress feedback for operations |
| FR10 | Epic 4 | `pai init bmad` command |
| FR11 | Epic 4 | Sensible defaults without prompts |
| FR12 | Epic 4 | Auto-configure agents/workflows |
| FR13 | Epic 4 | Version control-aware decisions |
| FR14 | Epic 4 | `pai init <thing>` pattern |
| FR15 | Epic 2 | CLI flags for configuration |
| FR16 | Epic 2 | Environment variable overrides |
| FR17 | Epic 2 | Workspace context detection |
| FR18 | Epic 2 | Cross-platform path normalization |
| FR19 | Epic 2 | Custom PAI_HOME directory |
| FR20 | Epic 2 | `--debug` verbose logging |
| FR21 | Epic 2 | Actionable error messages |
| FR22 | Epic 2 | Proper stderr/stdout usage |
| FR23 | Epic 2 | Hook injection failure diagnosis |
| FR24 | Epic 2 | Version info in debug output |
| FR25 | Epic 1 | Global help (`pai --help`) |
| FR26 | Epic 1 | Command-specific help |
| FR27 | Epic 1 | Actionable help with examples |
| FR28 | Epic 1 | Version check (`pai --version`) |
| FR29 | Epic 1 | Inline help for all commands |
| FR30 | Epic 3 | Subcommand hierarchy |
| FR31 | Epic 3 | Short and long flag forms |
| FR32 | Epic 3 | Consistent command naming |
| FR33 | Epic 3 | Pipe output to other tools |
| FR34 | Epic 3 | Adjust output for piping |
| FR35 | Epic 3 | Non-interactive script execution |
| FR36 | Epic 3 | Appropriate exit codes |
| FR37 | Epic 3 | Suppress output for scripts |
| FR38 | Epic 3 | Stable output formats |
| FR39 | Epic 3 | Chain with other CLI tools |
| FR40 | Epic 3 | Tab completion (Bash/Zsh/PowerShell) |
| FR41 | Epic 3 | Command suggestions in completion |
| FR42 | Epic 3 | Flag autocomplete |
| FR43 | Epic 1 | CLI startup <100ms |
| FR44 | Epic 2 | Quick command execution |
| FR45 | Epic 2 | Graceful prerequisite handling |
| FR46 | Epic 2 | Claude Code version compatibility |
| FR47 | Epic 1 | Clear command addition patterns |
| FR48 | Epic 1 | Subcommand registration architecture |
| FR49 | Epic 1 | Shared CLI utilities |
| FR50 | Epic 1 | Command extension hooks |

## Epic List

### Epic 1: CLI Foundation & Core Framework

**User Outcome:** PAI CLI is installed and running with basic help, version commands, and a clean extensible architecture ready for command additions.

**FRs Covered:** FR25, FR26, FR27, FR28, FR29, FR43, FR47, FR48, FR49, FR50

**Implementation Notes:**
- Oclif scaffold with `npx oclif generate pai-cli --bin pai --module-type ESM --package-manager npm --yes`
- Establishes project structure (`src/commands/`, `src/lib/`, `src/types/`)
- Sets up testing infrastructure (Mocha, cross-platform CI)
- `pai --help` and `pai --version` functional

---

### Epic 2: Zero-Friction Claude Code Launch

**User Outcome:** Josh can launch Claude Code with `pai launch`, automatically configured with sandbox permissions, hooks injected, and token usage visible in the status bar. Multiple parallel sessions supported.

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR44, FR45, FR46

**Implementation Notes:**
- `pai launch` spawns Claude Code with `--dangerouslySkipPermissions`
- `pai setup` creates hook symlink (`~/.claude/settings.json` → `~/.pai/.claude/settings.json`)
- Configuration resolution: `~/.pai` default, `PAI_HOME` override
- Token status bar via Claude Code native status line
- `--debug` flag for troubleshooting

---

### Epic 3: Scripting & Shell Integration

**User Outcome:** PAI CLI integrates seamlessly into scripts, automation pipelines, and shell workflows with tab completion and predictable behavior.

**FRs Covered:** FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR42

**Implementation Notes:**
- Consistent exit codes (0/1/2/3) for scripting
- Piping detection with adjusted output formatting
- Tab completion for Bash, Zsh, PowerShell
- Non-interactive execution for CI/CD

---

### Epic 4: Project Initialization (v1.1)

**User Outcome:** Josh can initialize BMAD and other tools in new projects with `pai init bmad`, with sensible defaults and no prompts.

**FRs Covered:** FR10, FR11, FR12, FR13, FR14

**Implementation Notes:**
- `pai init bmad` automates BMAD installation
- Extensible `pai init <thing>` pattern for future tools
- Version control-aware decisions
- Zero prompts, sensible defaults

---

## Epic 1: CLI Foundation & Core Framework

**Goal:** PAI CLI is installed and running with basic help, version commands, and a clean extensible architecture ready for command additions.

### Story 1.1: Generate Oclif CLI Scaffold

As a developer,
I want to initialize the PAI CLI project using Oclif,
So that I have a working CLI foundation with built-in help and version commands.

**Acceptance Criteria:**

**Given** an empty project directory
**When** I run `npx oclif generate pai-cli --bin pai --module-type ESM --package-manager npm --yes`
**Then** a new Oclif project is created with TypeScript and ESM modules
**And** `./bin/dev.js --help` displays CLI usage information
**And** `./bin/dev.js --version` displays the version number
**And** the project structure includes `src/commands/`, `bin/`, and `package.json`

---

### Story 1.2: Configure Development Environment

As a developer,
I want TypeScript strict mode and code quality tooling configured,
So that the codebase maintains high quality standards from day one.

**Acceptance Criteria:**

**Given** the Oclif scaffold from Story 1.1
**When** I configure the development environment
**Then** `tsconfig.json` has `strict: true` enabled
**And** ESLint is configured with TypeScript rules
**And** Prettier is configured for consistent formatting
**And** `npm run lint` validates code style
**And** `npm run build` compiles TypeScript to `dist/`

---

### Story 1.3: Create Shared Library Structure

As a developer,
I want shared utilities and type definitions organized in dedicated directories,
So that future commands can reuse common functionality consistently.

**Acceptance Criteria:**

**Given** the configured project from Story 1.2
**When** I create the shared library structure
**Then** `src/lib/` directory exists with placeholder modules:
  - `config.ts` (configuration resolution - stub)
  - `paths.ts` (cross-platform path utilities - stub)
  - `errors.ts` (custom error classes - stub)
**And** `src/types/` directory exists with:
  - `index.ts` (re-exports all types)
  - `exit-codes.ts` (EXIT_CODES constant: 0, 1, 2, 3)
**And** import patterns follow architecture conventions (node: prefix, grouped imports)

---

### Story 1.4: Set Up Testing Infrastructure

As a developer,
I want a comprehensive testing setup with cross-platform CI,
So that all code is validated automatically before merge.

**Acceptance Criteria:**

**Given** the project structure from Story 1.3
**When** I configure testing infrastructure
**Then** Mocha is configured with `@oclif/test` utilities
**And** `npm test` runs all tests successfully
**And** `test/` directory mirrors `src/` structure
**And** `.github/workflows/ci.yml` runs tests on Windows, macOS, and Linux
**And** test coverage reporting is configured
**And** a sample test for the help command passes

---

### Story 1.5: Validate CLI Foundation Complete

As a developer,
I want to verify the CLI foundation meets all performance and extensibility requirements,
So that I can confidently proceed to implementing launch functionality.

**Acceptance Criteria:**

**Given** the complete CLI foundation from Stories 1.1-1.4
**When** I validate the foundation
**Then** `pai --help` displays global help with examples (FR25, FR27)
**And** `pai <command> --help` pattern works (FR26, FR29)
**And** `pai --version` displays version (FR28)
**And** CLI startup time is under 100ms (FR43)
**And** adding a new test command follows clear patterns (FR47, FR48)
**And** shared utilities in `src/lib/` are accessible from commands (FR49)
**And** documentation includes command extension examples (FR50)

---

## Epic 2: Zero-Friction Claude Code Launch

**Goal:** Josh can launch Claude Code with `pai launch`, automatically configured with sandbox permissions, hooks injected, and token usage visible in the status bar. Multiple parallel sessions supported.

### Story 2.1: Implement Configuration Resolution

As a developer,
I want PAI CLI to automatically resolve configuration paths,
So that it works out-of-the-box with sensible defaults while supporting customization.

**Acceptance Criteria:**

**Given** no environment variables set
**When** PAI CLI resolves configuration
**Then** it uses `~/.pai` as the default PAI home directory
**And** paths are correctly resolved on Windows, macOS, and Linux

**Given** `PAI_HOME` environment variable is set
**When** PAI CLI resolves configuration
**Then** it uses the specified path instead of `~/.pai`
**And** debug output shows the resolved path

**Given** `PAI_HOME` points to a non-existent directory
**When** PAI CLI resolves configuration
**Then** it fails gracefully with an actionable error message (exit code 3)

---

### Story 2.2: Implement Cross-Platform Path Utilities

As a developer,
I want path utilities that handle OS differences transparently,
So that the CLI works identically on all platforms.

**Acceptance Criteria:**

**Given** path operations in the CLI
**When** executed on Windows, macOS, or Linux
**Then** `path.join()` and `os.homedir()` are used consistently
**And** path separators are handled correctly per platform
**And** workspace detection checks for `.pai` directory markers (FR17)

---

### Story 2.3: Create Error Handling System

As a user,
I want clear error messages that tell me how to fix problems,
So that I can resolve issues without searching for documentation.

**Acceptance Criteria:**

**Given** an error occurs during CLI execution
**When** the error is displayed
**Then** it follows the format: `Error: {what_went_wrong}. {how_to_fix}.`
**And** errors output to stderr (FR22)
**And** exit codes are categorized: 0=success, 1=general, 2=invalid usage, 3=environment (FR21)

**Given** a ConfigNotFoundError is thrown
**When** caught by the command
**Then** it displays: `Error: PAI_HOME not found. Set PAI_HOME env var or run 'pai setup'.`
**And** exits with code 3

---

### Story 2.4: Implement Debug Logging

As a developer troubleshooting issues,
I want verbose debug output with the `--debug` flag,
So that I can diagnose problems quickly.

**Acceptance Criteria:**

**Given** a command is run with `--debug` flag
**When** the command executes
**Then** debug messages are prefixed with `[debug]` (FR20)
**And** PAI_HOME resolution path is logged
**And** Claude Code spawn arguments are logged
**And** version information is displayed (FR24)
**And** debug output uses dim/gray color (when terminal supports it)

---

### Story 2.5: Create Process Spawning Utilities

As a developer,
I want a reusable spawn wrapper for launching external processes,
So that Claude Code integration is consistent and maintainable.

**Acceptance Criteria:**

**Given** the spawn utility in `src/lib/spawn.ts`
**When** spawning Claude Code
**Then** `child_process.spawn` is used with proper stdio inheritance
**And** multiple parallel sessions can be launched (FR4)
**And** exit codes from Claude Code are captured and returned
**And** spawn errors are wrapped in custom error types

---

### Story 2.6: Implement pai launch Command

As Josh,
I want to launch Claude Code with a single `pai launch` command,
So that I never have to type flags or remember setup steps.

**Acceptance Criteria:**

**Given** PAI CLI is installed and configured
**When** I run `pai launch`
**Then** Claude Code starts with `--dangerouslySkipPermissions` flag applied (FR1, FR2)
**And** the launch feels instant with no perceptible delay (FR44)
**And** I can run `pai launch` in another terminal for parallel sessions (FR4)
**And** when Claude Code exits, `pai` exits with the same code

**Given** Claude Code is not installed or not in PATH
**When** I run `pai launch`
**Then** an actionable error is displayed: `Error: Claude Code not found. Install it from...`
**And** exit code is 3 (environment error)

---

### Story 2.7: Implement pai setup Command

As Josh,
I want a one-time setup command that configures PAI hooks,
So that my PAI functionality is available in every Claude Code session.

**Acceptance Criteria:**

**Given** PAI CLI is installed
**When** I run `pai setup`
**Then** a symlink is created: `~/.claude/settings.json` → `~/.pai/.claude/settings.json` (FR3)
**And** success message confirms the setup
**And** subsequent `pai launch` sessions have PAI hooks active (FR5)

**Given** the symlink already exists
**When** I run `pai setup`
**Then** it verifies the symlink is correct
**And** displays "Already configured" message (no error)

**Given** `~/.claude/settings.json` exists as a regular file
**When** I run `pai setup`
**Then** it warns user and asks for confirmation before replacing
**Or** provides instructions for manual resolution

---

### Story 2.8: Configure Token Status Bar

As Josh,
I want to see my token usage in real-time,
So that I know when I'm approaching context limits.

**Acceptance Criteria:**

**Given** PAI hooks are configured via `pai setup`
**When** I run `pai launch` and use Claude Code
**Then** token usage percentage is visible in the Claude Code status bar (FR6, FR7)
**And** status updates in real-time without performance impact

**Given** a long-running operation in the CLI (future commands)
**When** operation is in progress and not piped
**Then** progress feedback is shown using Oclif spinners (FR8, FR9)

---

### Story 2.9: Add Version Compatibility Check

As a developer,
I want PAI CLI to check Claude Code version compatibility,
So that I'm warned before incompatible versions cause issues.

**Acceptance Criteria:**

**Given** Claude Code is installed
**When** `pai launch` runs (or with `--debug`)
**Then** Claude Code version is detected and logged
**And** known incompatible versions trigger a warning (FR46)

**Given** Claude Code version cannot be determined
**When** `pai launch` runs
**Then** it proceeds with a warning, not a failure (FR45 - graceful handling)

---

### Story 2.10: Validate Launch Epic Complete

As Josh,
I want confirmation that the complete launch workflow is production-ready,
So that I can confidently use `pai launch` as my daily driver.

**Acceptance Criteria:**

**Given** all Epic 2 stories are complete
**When** I validate the launch workflow
**Then** `pai launch` starts Claude Code with all configuration applied
**And** `pai setup` correctly establishes hook symlink
**And** `--debug` provides complete diagnostic information (FR23)
**And** all error paths are tested with appropriate messages
**And** integration tests pass on Windows, macOS, and Linux
**And** FR1-9, FR15-24, FR44-46 are verified complete

---

## Epic 3: Scripting & Shell Integration

**Goal:** PAI CLI integrates seamlessly into scripts, automation pipelines, and shell workflows with tab completion and predictable behavior.

### Story 3.1: Implement Subcommand Architecture

As a developer,
I want a consistent subcommand structure with standard flag conventions,
So that the CLI is intuitive and follows established patterns.

**Acceptance Criteria:**

**Given** the PAI CLI command structure
**When** I use commands
**Then** subcommand hierarchy works correctly (`pai <command> <subcommand>`) (FR30)
**And** both short and long flag forms work (`-d` and `--debug`) (FR31)
**And** command naming follows consistent patterns (FR32)
**And** `pai help <command>` works as alternative to `pai <command> --help`

---

### Story 3.2: Add Piping Support

As a scripter,
I want PAI CLI to detect when output is piped,
So that formatting doesn't break my pipelines.

**Acceptance Criteria:**

**Given** PAI CLI output is piped to another command
**When** CLI executes
**Then** colors are automatically disabled
**And** progress spinners are suppressed
**And** output is clean for parsing (FR33, FR34)

**Given** PAI CLI runs in a terminal (not piped)
**When** CLI executes
**Then** colors and formatting are enabled
**And** progress feedback is shown for long operations

---

### Story 3.3: Implement Exit Code Consistency

As a scripter,
I want predictable exit codes from all commands,
So that my scripts can handle errors reliably.

**Acceptance Criteria:**

**Given** any PAI CLI command
**When** it completes
**Then** exit code 0 indicates success
**And** exit code 1 indicates general error
**And** exit code 2 indicates invalid usage/arguments
**And** exit code 3 indicates environment/prerequisite error (FR36)
**And** exit codes are documented in help text

---

### Story 3.4: Add Quiet Mode for Scripting

As a scripter,
I want to suppress informational output,
So that only essential data appears in my automation.

**Acceptance Criteria:**

**Given** a command run with `--quiet` or `-q` flag
**When** the command executes
**Then** informational messages are suppressed (FR37)
**And** errors still output to stderr
**And** essential data still outputs to stdout

**Given** commands designed for scripting
**When** output is generated
**Then** format is stable and predictable for parsing (FR35, FR38)

---

### Story 3.5: Enable Command Chaining

As a power user,
I want to chain PAI CLI with other tools,
So that I can build complex automation workflows.

**Acceptance Criteria:**

**Given** PAI CLI in a pipeline
**When** chained with other commands
**Then** stdout contains only data (no status messages)
**And** stderr contains only errors/warnings
**And** exit codes propagate correctly for `&&` chains (FR39)

**Given** commands that accept input
**When** stdin is provided
**Then** it is handled appropriately (future consideration)

---

### Story 3.6: Generate Shell Completions

As a power user,
I want tab completion for commands and flags,
So that I can work faster without memorizing syntax.

**Acceptance Criteria:**

**Given** PAI CLI is installed
**When** I configure shell completion
**Then** Bash completion works for commands and subcommands (FR40)
**And** Zsh completion works with descriptions
**And** PowerShell completion works on Windows
**And** flags autocomplete correctly (FR42)
**And** available commands are suggested (FR41)

**Given** shell completion is installed
**When** I type `pai la<TAB>`
**Then** it completes to `pai launch`

---

### Story 3.7: Validate Scripting Epic Complete

As a developer,
I want confirmation that scripting integration is production-ready,
So that PAI CLI can be used reliably in automation.

**Acceptance Criteria:**

**Given** all Epic 3 stories are complete
**When** I validate scripting integration
**Then** example scripts demonstrate common patterns
**And** all exit codes are tested
**And** piping behavior is verified
**And** shell completions install correctly on all platforms
**And** FR30-42 are verified complete

---

## Epic 4: Project Initialization (v1.1)

**Goal:** Josh can initialize BMAD and other tools in new projects with `pai init bmad`, with sensible defaults and no prompts.

### Story 4.1: Create Extensible Init Command Structure

As a developer,
I want an extensible `pai init` command structure,
So that future initialization tools can be added easily.

**Acceptance Criteria:**

**Given** the PAI CLI
**When** I run `pai init --help`
**Then** it shows available init subcommands
**And** the pattern `pai init <thing>` is established (FR14)
**And** adding new init targets follows clear patterns

**Given** I run `pai init` without a subcommand
**When** the command executes
**Then** it displays available options with descriptions
**And** suggests `pai init bmad` as the primary option

---

### Story 4.2: Implement pai init bmad Command

As Josh,
I want to initialize BMAD in a new project with a single command,
So that I can start working immediately without setup friction.

**Acceptance Criteria:**

**Given** a project directory without BMAD
**When** I run `pai init bmad`
**Then** BMAD is downloaded and installed (FR10)
**And** no prompts are displayed during installation (FR11)
**And** sensible defaults are applied automatically
**And** success message confirms installation

**Given** BMAD is already installed in the directory
**When** I run `pai init bmad`
**Then** it detects existing installation
**And** offers to update or skip (graceful handling)

---

### Story 4.3: Auto-Configure Agents and Workflows

As Josh,
I want BMAD agents and workflows configured automatically,
So that I can use them immediately after initialization.

**Acceptance Criteria:**

**Given** `pai init bmad` is run
**When** installation completes
**Then** BMAD agents are configured and ready to use (FR12)
**And** default workflows are set up
**And** configuration follows PAI ecosystem conventions
**And** `pai launch` works immediately after init

---

### Story 4.4: Implement Version Control Awareness

As Josh,
I want init to make smart decisions based on version control state,
So that my repository stays clean and properly configured.

**Acceptance Criteria:**

**Given** a directory with git initialized
**When** I run `pai init bmad`
**Then** `.gitignore` is updated appropriately (FR13)
**And** generated files respect VCS conventions
**And** no unnecessary files are added to tracking

**Given** a directory without git
**When** I run `pai init bmad`
**Then** initialization proceeds normally
**And** VCS-specific steps are skipped gracefully

---

### Story 4.5: Validate Init Epic Complete

As Josh,
I want confirmation that project initialization is production-ready,
So that I can confidently use it for new projects.

**Acceptance Criteria:**

**Given** all Epic 4 stories are complete
**When** I validate the init workflow
**Then** `pai init bmad` works end-to-end in a fresh directory
**And** the initialized project works with `pai launch`
**And** VCS integration is verified
**And** extensibility pattern is documented for future init targets
**And** FR10-14 are verified complete
