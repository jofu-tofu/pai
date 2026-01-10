---
stepsCompleted: [1, 2, 3, 4, 7, 8, 9, 10, 11]
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-PAI-CLI-2026-01-08.md'
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
workflowType: 'prd'
lastStep: 11
date: 2026-01-08
author: Josh
completedAt: 2026-01-08
---

# Product Requirements Document - .pai

**Author:** Josh
**Date:** 2026-01-08

## Executive Summary

PAI CLI is a convenience-focused command-line launcher that removes friction from daily Claude Code usage within the Personal AI Infrastructure (PAI) ecosystem. By automating repetitive setup tasks—like permission flags, hook injection, and token monitoring—it eliminates the cognitive tax of remembering manual steps and reduces session startup time.

**Target User:** Josh (personal use, with potential for others to adopt)
**Core Value:** Time savings + reduced cognitive load + extensible automation framework
**Success Metric:** `pai launch` becomes the daily entry point, replacing manual Claude Code invocations

### The Problem

Using Claude Code within the PAI ecosystem involves repetitive manual setup that creates friction and cognitive overhead:
- Typing `--dangerouslyDisableSandbox` flag every session
- Manually injecting hook system for PAI functionality
- Starting observability servers separately
- Managing MCP server context across sessions
- Remembering multi-step sequences ("did I forget something?")

This cognitive tax compounds over time: each session requires mental checklist management instead of immediate focus on actual work. Session startup can be slow due to MCP server loading, and there's no easy way to monitor token usage in real-time.

### The Solution

PAI CLI provides a zero-friction launch experience through intelligent automation:

**Core Capabilities (MVP):**
- `pai launch` - Opens Claude Code with sandbox permissions automatically
- Status bar injection showing token usage percentage in real-time
- Automatic hook system integration for PAI functionality
- Framework architecture designed for future extensibility

**Enhancement Capabilities:**
- MCP server context management (prevent performance bottlenecks)
- Observability server auto-start via flags
- BMAD installation automation (`--install-bmad`)
- Extensible command structure for future skills/integrations

### What Makes This Special

**Personal Infrastructure Focus:**
- Built specifically for PAI ecosystem integration (hooks, observability, BMAD)
- Intimate knowledge of actual workflow pain points drives design
- Customization prioritized over market positioning

**Foundation for Future Automation:**
- Extensible framework enables skill development and workflow automation
- Unlocks next phase of PAI evolution (more extensive personal assistant capabilities)
- Creates standardized entry point for future integrations

**Framework Over Features:**
- Maintainable architecture designed for long-term evolution
- Clear separation of concerns (auxiliary, not core dependency)
- Possibly includes CLI-integrated skill that Claude can read and execute

**Auxiliary Design Philosophy:**
- PAI works without CLI; CLI enhances experience
- Framework-first approach over feature completeness
- Useful now while enabling future automation

## Project Classification

**Technical Type:** CLI Tool
**Domain:** General (Developer Productivity)
**Complexity:** Low
**Project Context:** Greenfield - new project

This is a command-line tool focused on developer productivity and workflow automation. The project leverages well-understood CLI patterns and standard software practices. As a personal infrastructure tool, it prioritizes maintainability and extensibility over feature completeness, serving as the foundation for future PAI automation capabilities.

## Success Criteria

### User Success

Success is measured by Josh's actual usage patterns and productivity improvements:

**Primary Success Indicators:**

1. **Complete Adoption:** 100% of Claude Code launches go through `pai` - never use raw `claude` command again
2. **Time Savings:** Minimum 30 minutes saved per day on manual setup, increasing as AI development scales
3. **Mental Load Reduction:** 50% reduction in cognitive overhead initially, stabilizing at 20% long-term (measured subjectively via daily reflection)
4. **Quality of Life:** The CLI removes friction and creates a sense of ease - work feels smoother, setup disappears into the background
5. **Persistence:** Continuous usage over time without replacement - basic features remain consistently useful
6. **Aha Moment:** First successful `pai launch` where automation executes without any manual intervention

**Behavioral Success Signals:**
- Multiple parallel Claude Code sessions launched effortlessly
- Zero instances of typing `--dangerouslyDisableSandbox` manually
- New projects initialized with `pai init bmad` without setup friction
- Daily diverse usage of multiple PAI CLI commands (not just launch)

### Business Success

Since PAI CLI is personal infrastructure tooling (not commercial product), business objectives are framed as **personal productivity goals and PAI ecosystem advancement**:

**3-Month Objectives:**
- PAI CLI becomes exclusive daily entry point for Claude Code
- Successfully initialize BMAD in 2+ new projects using `pai init bmad`
- Add 3-5 custom automation commands beyond MVP
- Achieve measurable time savings (30+ minutes/day documented)
- Quality of life improvement: measurably reduced friction in daily workflow

**12-Month Objectives:**
- Advanced features proliferate: MCP management, observability controls, custom commands used daily
- CLI skill framework implemented - plug code → commands automatically
- Recursive/compound automation working (commands triggering commands)
- PAI CLI has enabled building new skills/integrations that wouldn't exist without this foundation

**Strategic Impact:**
- **Development Velocity:** Build features faster by eliminating setup friction
- **Quality of Life:** Work smoother with zero mental overhead on setup - this is the primary goal
- **Innovation Enabled:** Foundation that unlocks next phase of PAI evolution - automation at scale, meta-automation frameworks, recursive workflows

### Technical Success

**Performance Requirements:**
- **Seamless Experience:** Launch time should be imperceptible - no noticeable delay vs manual launch
- Hook injection completes instantly without blocking
- Status bar updates in real-time without performance impact
- MCP server management (when added) doesn't slow down startup

**Maintainability Standards:**
- **Clean File Structure:** Organized, logical directory layout that makes finding code intuitive
- **Easy Future Changes:** Adding new commands requires minimal code changes and follows clear patterns
- **Test-Driven Development:** All features have comprehensive test coverage before implementation
- **Code Quality:** Readable, well-documented code that future Josh (or contributors) can understand immediately

**Framework Extensibility:**
- Adding a new command demonstrates clean architecture
- Code structure supports extension without major refactoring
- Pattern for future commands is clear and repeatable
- No technical debt that blocks future automation capabilities

### Measurable Outcomes

**Immediate Success (0-3 months):**
- ✅ 100% adoption rate - all Claude Code launches through `pai` (zero raw `claude` usage)
- ✅ First successful automated `pai launch` within first week of MVP completion
- ✅ 30+ minutes saved per day on manual setup (tracked via time logs)
- ✅ `pai init bmad` successfully used in minimum 2 new projects
- ✅ Zero manual typing of `--dangerouslyDisableSandbox` flag
- ✅ Framework extensibility proven by adding test command cleanly

**Medium-term Success (3-6 months):**
- ✅ 3-5 custom commands/flags added beyond MVP features
- ✅ Daily usage of multiple PAI CLI features (launch + at least 2 others)
- ✅ Mental load reduction stabilizes at 20% (measured via subjective weekly assessment)
- ✅ Zero regressions to manual workflow
- ✅ Cumulative time savings: 50+ hours documented
- ✅ Code maintains clean structure despite feature additions

**Long-term Success (6-12 months):**
- ✅ CLI skill framework functional - automated code-to-command generation working
- ✅ Recursive automation examples operational (commands triggering commands)
- ✅ PAI CLI enabled 3+ new skills/integrations that wouldn't have been built without it
- ✅ Framework remains core tool - no replacement considered
- ✅ Advanced features used daily (MCP management, observability, custom workflows)
- ✅ Test coverage above 80% for all core functionality

**Leading Indicators of Success:**
- Speed of adding new commands (faster over time = good framework)
- Frequency of `pai` usage across different contexts
- Number of automation ideas spawned by having CLI foundation
- Reduced time-to-productivity when starting new PAI projects
- Code review time for new features (shorter = better maintainability)

## Product Scope

### MVP - Minimum Viable Product

The MVP focuses on eliminating daily launch friction through intelligent automation with a clean, maintainable foundation:

**Essential Features:**

1. **`pai launch` Command**
   - Primary entry point for launching Claude Code
   - Single command replaces manual multi-step workflow
   - Zero configuration required after initial setup

2. **Automatic Permission Handling**
   - Auto-applies `--dangerouslyDisableSandbox` flag
   - Eliminates manual flag typing every session

3. **Hook System Auto-Injection**
   - Automatically injects PAI hook system on launch
   - Ensures all PAI functionality available immediately

4. **Token Usage Status Bar**
   - Real-time token usage percentage display
   - Integrated into Claude Code session
   - Visibility into context consumption at all times

5. **Clean Framework Architecture**
   - Organized file structure with clear separation of concerns
   - Test-driven development from day one
   - Designed for easy command additions
   - Foundation for future automation capabilities

**MVP Success Criteria:**
- ✅ First successful `pai launch` executes without manual intervention
- ✅ Status bar displays correctly in Claude Code session
- ✅ Hooks inject properly - PAI functionality works as expected
- ✅ Josh experiences the "aha moment" - automation working seamlessly
- ✅ 100% test coverage for core features
- ✅ Clean file structure that makes sense at first glance

### Growth Features (Post-MVP)

**Version 1.1 (Months 2-3):**
- Add `pai init bmad` for automated project initialization
- Implement additional automation flags based on usage patterns
- Refine framework based on real-world extension experience
- Target: 3-5 new commands demonstrating extensibility
- Maintain test coverage and code quality standards

**Version 2.0 (Months 4-6):**
- MCP server context management (performance optimization)
- Observability server integration
- Smart defaults and configuration management
- Advanced workflow automation commands
- Framework patterns proven and documented

### Vision (Future)

**Long-term Vision (12+ months):**

- **CLI Skill Framework:** Automated code-to-command generation - write code, get commands automatically
- **Recursive Automation:** Commands composing and triggering other commands - meta-automation in action
- **Meta-Automation Platform:** Self-expanding automation that learns from usage patterns
- **Ecosystem Integration:** Deep integration with skills, hooks, MCP servers, observability
- **Community Extensions:** Framework so clean that others can fork and extend easily

**Ultimate Goal:** PAI CLI becomes the extensible automation platform that enables increasingly sophisticated personal AI assistance. Every new capability added to PAI can be exposed through CLI commands, creating compound automation value over time.

**Strategic Impact:** Foundation piece that unlocks next phase of PAI evolution - from manual workflow tool to intelligent automation platform that amplifies developer productivity through progressive enhancement.

## User Journeys

**Journey 1: Josh - The Daily Launch (Primary User - Happy Path)**

Josh wakes up with a clear idea for improving his skill system architecture. Coffee in hand, he opens terminal and types `pai launch`. The CLI springs to life—sandbox permissions applied, hooks injected, status bar showing 2% token usage. Within 5 seconds, Claude Code is ready. No flags to remember. No manual steps. Just pure readiness.

Mid-morning, he needs to test something in a parallel session. Again: `pai launch`. Instant. By lunch, he's launched 4 different Claude Code sessions across different workstreams, each time friction-free. The mental energy he used to spend on setup mechanics? Now spent on architectural decisions that actually matter.

Six weeks later, Josh realizes he hasn't typed `--dangerouslyDisableSandbox` even once. The CLI has become invisible infrastructure—exactly what he wanted. Quality of life: dramatically improved.

**Journey 2: Josh - Project Initialization Relief (Primary User - Edge Case)**

It's Saturday morning and Josh has an idea for a new automation tool. He creates a directory, navigates into it, and pauses. In the old world, this is where the friction starts—running install scripts, answering prompts, remembering configuration decisions.

Instead, he types `pai init bmad`. The CLI orchestrates everything automatically. BMAD downloads. Configuration applies sensible defaults he's refined over months. Agents and workflows appear. No prompts. No decisions. Just automation doing what automation should do.

Thirty seconds later: `pai launch`. Claude Code opens, fully configured, ready to build. The 15-minute setup tax? Gone. The decision fatigue? Eliminated. He's writing code for his new idea within a minute of creating the directory.

Three months later, Josh has initialized 5 new experimental projects using `pai init bmad`. Each time: frictionless. The barrier to experimentation has collapsed, and he's shipping more ideas than ever before.

**Journey 3: Sarah Chen - Forking for Her Own Infrastructure (Secondary User)**

Sarah clones the PAI repository on a Friday evening, curious but skeptical. She's seen too many "framework" projects that are actually rigid systems in disguise. She opens the CLI code expecting to spend the weekend untangling architecture.

Instead, she finds clean separation of concerns. Commands live in logical directories. The framework pattern is obvious. She adds a test command to verify the architecture—it takes 10 minutes and works perfectly. Encouraged, she starts customizing.

By Sunday afternoon, she has her own version running. `sarah-cli launch` opens VS Code with her custom settings. `sarah-cli py-setup` initializes Python projects with her preferred structure. The extensibility isn't theoretical—it's proven in her hands.

Six months later, Sarah has added 12 custom commands. She's recommended PAI to three colleagues who've also forked and customized it. The framework architecture made this possible—clean, maintainable, extensible.

**Journey 4: Josh - Debugging When Things Break (Troubleshooting)**

Josh updates Claude Code and immediately runs `pai launch` to test. Error. The familiar startup doesn't happen. Status bar missing. Hooks not injecting.

He types `pai launch --debug`. Detailed logs stream past: permission handling ✓, settings path... ✗. There it is—Claude Code changed the settings directory structure.

Because the CLI codebase follows the maintainability standards he set from day one, finding the settings injection code takes 2 minutes. The file structure is logical. The code is readable. He makes a 3-line fix, runs tests (100% coverage means he catches an edge case immediately), commits the change.

`pai launch` — success. Total recovery time: 12 minutes. Without the clean architecture? Could have been hours of debugging tangled code.

### Journey Requirements Summary

**Capabilities Revealed by These Journeys:**

**Core Launch Automation (Journey 1):**
- `pai launch` command with zero-configuration execution
- Automatic sandbox permission handling
- Hook system auto-injection
- Real-time token usage status bar
- Support for multiple parallel sessions
- Seamless, imperceptible performance

**Project Initialization (Journey 2):**
- `pai init bmad` command for automated BMAD setup
- Sensible default configuration (no prompts)
- Automatic agent and workflow configuration
- Version control-aware setup decisions
- Sequential command support (init → launch)

**Framework Extensibility (Journey 3):**
- Clean, logical file structure for easy navigation
- Clear command addition patterns
- Modular architecture for customization
- Configuration system for personal preferences
- Documentation/examples for extension

**Debugging & Maintainability (Journey 4):**
- `--debug` flag for detailed logging
- Clear error messages with actionable information
- Modular code structure for fast issue location
- Comprehensive test coverage
- Version compatibility handling

## CLI Tool Specific Requirements

### Project-Type Overview

PAI CLI is a subcommand-based command-line tool designed for scriptability and cross-platform compatibility. It prioritizes clean architecture, human-readable output, and seamless integration with the PAI ecosystem. The design philosophy emphasizes lightweight configuration (flags over config files), graceful error handling, and eventual scriptability without sacrificing immediate usability.

### Technical Architecture Considerations

**Execution Model:**
- Single binary with subcommand architecture (`pai <command> <subcommand>`)
- Extensible command structure to support future additions (e.g., `pai init <thing>`)
- Non-interactive by default - commands execute without prompting
- Scriptable design from day one - all commands work in automation contexts

**Cross-Platform Support:**
- Automatic handling of Windows, macOS, and Linux differences
- Path normalization across operating systems
- Platform-specific behaviors abstracted away from command logic
- Maintainability is a constraint - avoid platform-specific complexity where possible

**Environment Detection:**
- Workspace context awareness - detect if running in PAI workspace vs random directory
- Graceful command failures when prerequisites aren't met
- Clear error messages indicating what's missing or misconfigured
- No hard prerequisite validation - let commands fail gracefully with helpful messages

### Command Structure

**Subcommand Hierarchy:**
- Top-level commands: `launch`, `init`, etc.
- Nested subcommands where logical: `pai init bmad`, `pai init <future-thing>`
- Consistent command naming patterns for discoverability
- Command structure designed for future extensibility

**Help System:**
- Global help: `pai --help` shows all available commands
- Command-specific help: `pai launch --help` shows command details
- Inline help text (no man pages)
- Clear, actionable help messages with examples

**Version Management:**
- `pai --version` displays current PAI system version
- PAI CLI version tied to PAI system version
- Version compatibility tracking with Claude Code
- Clear version information in debug output

### Output Formats

**Human-Readable Focus:**
- Clean, readable terminal output optimized for humans
- Structured output with clear sections and status indicators
- Progress feedback for long-running operations (when not piped)
- No machine-readable formats (JSON/YAML) in MVP - human-first design

**Output Modes:**
- **Standard:** Normal human-readable output
- **Debug:** Verbose logging with `--debug` flag for troubleshooting
- **Quiet:** Minimal output for scripting contexts (detect piping automatically)
- **Error Output:** Clear error messages on stderr with actionable next steps

**Piping Support:**
- Detect when output is piped and adjust formatting accordingly
- Non-interactive mode by default - no progress bars that break piping
- Proper use of stdout (data) vs stderr (messages/errors)
- Exit codes for script integration (0 = success, non-zero = failure types)

### Config Schema

**Lightweight Configuration Approach:**
- **Primary:** Command-line flags for all options
- **No config files:** PAI CLI is not an application - avoid configuration complexity
- **Environment variables:** Optional support for common settings (e.g., PAI_HOME)
- **Precedence:** Flags override environment variables

**Flag Design:**
- Both short and long forms: `-d` / `--debug`, `-v` / `--version`
- Consistent naming patterns across commands
- Boolean flags don't require values (`--debug`, not `--debug=true`)
- Clear, descriptive long-form names

**Configuration Examples:**
```bash
# Standard usage with flags
pai launch --debug

# Environment variable support
export PAI_HOME=/custom/path
pai launch

# Flags override environment
PAI_HOME=/custom/path pai launch --home=/other/path
```

### Scripting Support

**Automation-First Design:**
- All commands designed to work in scripts without modification
- Non-interactive execution by default (no prompts)
- Stable exit codes for error handling in scripts
- Predictable output formats for parsing when needed

**Exit Codes:**
- `0` - Success
- `1` - General error
- `2` - Invalid usage/arguments
- `3` - Environment/prerequisite errors
- Additional codes as needed for specific failure modes

**Shell Integration:**
- Shell completion support recommended for quality of life:
  - Bash completion
  - Zsh completion
  - PowerShell completion (Windows support)
- Tab completion for commands, subcommands, and flags
- Improves discoverability and reduces typing

**Piping and Composition:**
- Support standard Unix piping patterns
- Input from stdin where relevant
- Output to stdout suitable for further processing
- Composable with other CLI tools

### Implementation Considerations

**Error Handling Strategy:**
- `--debug` flag provides verbose troubleshooting output
- Clear error messages with context and actionable next steps
- Graceful degradation when prerequisites missing
- Error messages indicate what went wrong and how to fix it

**Testing Requirements:**
- CLI commands must be testable in isolation
- Cross-platform testing on Windows, macOS, Linux
- Exit code validation in test suite
- Help text validation (ensure `--help` works for all commands)

**Extensibility Patterns:**
- Clear pattern for adding new commands
- Subcommand registration system
- Shared utilities for common CLI operations (output formatting, error handling)
- Plugin architecture consideration for future (not MVP)

**Performance:**
- CLI startup time should be imperceptible (<100ms)
- Command execution should feel instant for quick operations
- Long-running operations show progress (when not piped)
- No unnecessary network calls or heavy initialization

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP with Framework Foundation

PAI CLI's MVP focuses on eliminating the core daily friction point—launching Claude Code with proper configuration—while establishing the architectural foundation for future automation. This approach prioritizes immediate value delivery (daily launch automation) while building maintainable, extensible infrastructure that enables rapid feature additions post-MVP.

**Strategic Rationale:**
- **Immediate Value:** Solve the highest-frequency pain point (multiple daily launches)
- **Framework-First:** Invest in clean architecture from day one to enable fast iteration
- **Validation Path:** 100% adoption of `pai launch` proves the concept before expanding
- **Risk Mitigation:** Small, focused MVP reduces implementation risk while testing core assumptions

**Resource Requirements:**
- **Solo developer** (Josh) building personal infrastructure
- **Test-driven development** from MVP start
- **Cross-platform support** built in from beginning (not retrofitted)
- **Time estimate:** Weeks, not months - lean scope enables fast delivery

### MVP Feature Set (Phase 1)

**Core User Journey Supported:**
Journey 1: Josh - The Daily Launch (Primary User - Happy Path)

**Must-Have Capabilities:**

1. **`pai launch` Command**
   - Single command launches Claude Code with all configuration
   - Replaces manual multi-step workflow entirely
   - Zero configuration required after initial setup
   - Supports multiple parallel sessions

2. **Automatic Permission Handling**
   - Auto-applies `--dangerouslyDisableSandbox` flag
   - Eliminates manual flag typing every session
   - No user intervention needed

3. **Hook System Auto-Injection**
   - Automatically injects PAI hook system on launch
   - Ensures all PAI functionality available immediately
   - Seamless integration without manual steps

4. **Token Usage Status Bar**
   - Real-time token usage percentage display
   - Integrated into Claude Code session
   - Visibility into context consumption at all times

5. **Clean Framework Architecture**
   - Organized file structure with clear separation of concerns
   - Test-driven development with 100% coverage for core features
   - Subcommand architecture ready for extensibility
   - Cross-platform support (Windows, macOS, Linux)
   - Clear patterns for adding commands post-MVP

**MVP Success Criteria:**
- ✅ First successful `pai launch` within first week of completion
- ✅ 100% adoption within first month (zero raw `claude` command usage)
- ✅ Status bar displays correctly
- ✅ Hooks inject properly
- ✅ Framework extensibility proven by adding a test command
- ✅ Clean file structure that makes sense at first glance

**Out of Scope for MVP:**
- `pai init bmad` command (deferred to v1.1)
- MCP server context management (deferred to v2.0)
- Observability server auto-start (deferred to v2.0)
- Advanced automation commands (future)
- CLI skill framework (12+ month vision)

### Post-MVP Features

**Phase 2: v1.1 (Months 2-3)**

**Core Focus:** Project initialization automation

**Features:**
- `pai init bmad` command for automated BMAD setup
- Sensible default configuration (no prompts, no decision fatigue)
- Automatic agent and workflow configuration
- Version control-aware setup decisions
- Additional automation flags based on MVP usage patterns
- Target: 3-5 new commands demonstrating framework extensibility

**User Journeys Enabled:**
- Journey 2: Josh - Project Initialization Relief
- Expanded use cases for secondary users (Sarah Chen)

**Success Criteria:**
- Successfully initialize BMAD in 2+ new projects
- Maintain test coverage and code quality standards
- Zero regressions to MVP functionality

**Phase 3: v2.0 (Months 4-6)**

**Core Focus:** Performance optimization and ecosystem integration

**Features:**
- MCP server context management (prevent performance bottlenecks)
- Observability server integration with auto-start flags
- Smart defaults and configuration management
- Advanced workflow automation commands
- Framework patterns proven and documented

**User Journeys Enhanced:**
- All existing journeys with better performance
- Journey 4: Enhanced debugging capabilities
- New automation workflows enabled

**Success Criteria:**
- Advanced features used daily
- MCP management prevents slowdowns
- Framework remains maintainable despite feature growth

### Long-Term Vision (6-12+ Months)

**Phase 4: Meta-Automation Platform**

**Strategic Goals:**
- CLI skill framework operational (automated code-to-command generation)
- Recursive automation working (commands triggering commands)
- PAI CLI has enabled 3+ new skills/integrations that wouldn't exist without it
- Community extensions possible (framework so clean others can fork/extend)

**Ultimate Goal:**
PAI CLI becomes the extensible automation platform that enables increasingly sophisticated personal AI assistance. Every new capability added to PAI can be exposed through CLI commands, creating compound automation value over time.

### Risk Mitigation Strategy

**Technical Risks:**

*Risk:* Claude Code API changes break hook injection or status bar integration
*Mitigation:*
- Version compatibility checking from day one
- `--debug` flag for rapid troubleshooting
- Comprehensive test coverage catches breakage early
- Clean architecture makes fixes fast (Journey 4: 12-minute recovery)

*Risk:* Cross-platform differences create maintenance burden
*Mitigation:*
- Avoid platform-specific complexity where possible
- Test on all platforms from MVP
- Path normalization abstracted in shared utilities

**Market Risks:**

*Risk:* MVP doesn't deliver enough value for adoption
*Mitigation:*
- Focus on highest-frequency pain point (daily launches)
- 30-day adoption window validates or invalidates concept quickly
- Pivot to different commands if launch automation isn't sticky

*Risk:* Framework architecture adds complexity without benefit
*Mitigation:*
- Test extensibility immediately by adding a test command
- Framework patterns must be obvious and repeatable
- If adding commands is still hard, refactor before v1.1

**Resource Risks:**

*Risk:* Implementation takes longer than expected
*Mitigation:*
- Lean MVP scope (5 core features only)
- Solo developer - no coordination overhead
- Can ship MVP with even fewer features if needed (just `pai launch` proves concept)

*Risk:* Maintenance burden grows with features
*Mitigation:*
- Test-driven development prevents regression
- Clean architecture keeps cognitive load low
- Quality bar (maintainability) blocks feature additions if architecture degrades

**Contingency Plan:**

If MVP takes too long or proves too complex:
- **Minimum Viable Launch:** Ship just `pai launch` without status bar
- **Manual Fallback:** Document the manual steps as interim solution
- **Scope Reduction:** Keep using raw `claude` command while refining architecture

## Functional Requirements

### Launch Automation

- **FR1:** User can launch Claude Code with a single command (`pai launch`)
- **FR2:** System automatically applies dangerous sandbox disable permission when launching
- **FR3:** System automatically injects PAI hook system during Claude Code launch
- **FR4:** User can launch multiple parallel Claude Code sessions
- **FR5:** System ensures zero manual configuration required after initial setup

### Status & Monitoring

- **FR6:** User can view real-time token usage percentage in status bar
- **FR7:** System displays token consumption at all times during session
- **FR8:** User can see clear status indicators for launch operations
- **FR9:** System provides progress feedback for long-running operations

### Project Initialization

- **FR10:** User can initialize BMAD in a new project with a single command (`pai init bmad`)
- **FR11:** System applies sensible default configuration without prompting user
- **FR12:** System automatically configures agents and workflows during initialization
- **FR13:** System makes version control-aware setup decisions automatically
- **FR14:** User can initialize future integrations using `pai init <thing>` pattern

### Configuration & Environment

- **FR15:** User can configure PAI CLI using command-line flags
- **FR16:** User can override settings using environment variables
- **FR17:** System detects PAI workspace context automatically
- **FR18:** System normalizes file paths across Windows, macOS, and Linux
- **FR19:** User can specify custom PAI home directory

### Debugging & Troubleshooting

- **FR20:** User can enable verbose debug logging with `--debug` flag
- **FR21:** System provides clear error messages with actionable next steps
- **FR22:** System outputs errors to stderr and data to stdout correctly
- **FR23:** User can diagnose hook injection failures through detailed logging
- **FR24:** System displays version information in debug output

### Help & Documentation

- **FR25:** User can view global help with `pai --help`
- **FR26:** User can view command-specific help with `pai <command> --help`
- **FR27:** System displays clear, actionable help messages with examples
- **FR28:** User can check PAI CLI version with `pai --version`
- **FR29:** System provides inline help text for all commands

### Command Structure & Interface

- **FR30:** User can execute commands using subcommand hierarchy (`pai <command> <subcommand>`)
- **FR31:** User can use both short and long flag forms (e.g., `-d` and `--debug`)
- **FR32:** System provides consistent command naming patterns for discoverability
- **FR33:** User can pipe PAI CLI output to other tools
- **FR34:** System adjusts output formatting when piping is detected

### Scripting & Automation

- **FR35:** User can execute all commands non-interactively in scripts
- **FR36:** System returns appropriate exit codes (0 for success, non-zero for failures)
- **FR37:** User can suppress output for scripting contexts
- **FR38:** System provides stable, predictable output formats for parsing
- **FR39:** User can chain PAI CLI commands with other CLI tools

### Shell Integration

- **FR40:** User can use tab completion for commands and subcommands (Bash, Zsh, PowerShell)
- **FR41:** System suggests available commands during tab completion
- **FR42:** User can autocomplete flags during command entry

### Performance & Reliability

- **FR43:** System starts CLI in under 100ms
- **FR44:** System executes quick commands instantaneously
- **FR45:** System gracefully handles missing prerequisites
- **FR46:** System validates version compatibility with Claude Code

### Framework Extensibility

- **FR47:** Developer can add new commands following clear patterns
- **FR48:** Developer can register subcommands using consistent architecture
- **FR49:** Developer can use shared utilities for common CLI operations
- **FR50:** System provides hooks for command extension points

## Non-Functional Requirements

### Performance

**NFR-P1: Startup Performance**
- CLI binary startup time must be under 100ms from command execution to first output
- User should perceive commands as executing instantaneously for quick operations

**NFR-P2: Launch Performance**
- `pai launch` command must complete Claude Code initialization without noticeable delay compared to manual launch
- Hook injection must complete instantly without blocking user interaction
- Status bar updates must not introduce perceptible performance degradation

**NFR-P3: Responsiveness**
- Quick commands (help, version) execute in under 50ms
- Long-running operations provide immediate feedback (progress indicators when not piped)
- No unnecessary network calls or heavy initialization during startup

### Reliability

**NFR-R1: Error Handling**
- All commands must fail gracefully with clear, actionable error messages
- Error messages must indicate what went wrong and how to fix it
- System must never crash or leave processes in inconsistent states

**NFR-R2: Graceful Degradation**
- Commands must handle missing prerequisites gracefully (not hard fail)
- Clear messaging when environment is misconfigured
- Partial functionality maintained when optional features unavailable

**NFR-R3: Cross-Platform Consistency**
- Commands must behave identically on Windows, macOS, and Linux
- Path handling must work correctly across all platforms
- Platform differences must be abstracted from user experience

**NFR-R4: Exit Code Reliability**
- Exit codes must be stable and predictable for scripting
- 0 = success, non-zero values map to specific failure modes consistently
- Scripts can reliably detect success/failure through exit codes

### Maintainability

**NFR-M1: Code Structure**
- File structure must be organized, logical, and intuitive
- New developers (or future Josh) can understand codebase immediately
- Finding specific functionality takes minutes, not hours
- Clear separation of concerns across modules

**NFR-M2: Extensibility**
- Adding new commands requires minimal code changes
- Pattern for command addition must be clear and repeatable
- No major refactoring required to add new features
- Framework supports extension without breaking existing functionality

**NFR-M3: Code Quality**
- Code must be readable and well-documented
- Complex logic includes inline comments explaining "why"
- Consistent coding patterns throughout codebase
- No technical debt that blocks future automation capabilities

**NFR-M4: Change Velocity**
- Time to add new command decreases over time (proves good framework)
- Bug fixes localized to specific modules without cascading changes
- Code review time for new features remains short (indicates maintainability)

### Testability

**NFR-T1: Test Coverage**
- 100% test coverage for all MVP core features
- 80%+ test coverage for all features post-MVP
- Every command must be testable in isolation

**NFR-T2: Test-Driven Development**
- Tests written before implementation for all features
- Test failures caught before code commits
- No features ship without comprehensive tests

**NFR-T3: Cross-Platform Testing**
- All features tested on Windows, macOS, and Linux
- CI/CD pipeline validates cross-platform compatibility
- Platform-specific bugs caught before release

**NFR-T4: Validation Coverage**
- Exit code validation in test suite
- Help text validation (ensure `--help` works for all commands)
- Error handling scenarios tested comprehensively

### Integration

**NFR-I1: Claude Code Integration**
- Seamless integration with Claude Code CLI
- Version compatibility checking prevents breaking changes
- Hook injection compatible with Claude Code security model

**NFR-I2: PAI Ecosystem Integration**
- Hook system integration works reliably
- Settings injection supports all PAI functionality
- Status bar integration compatible with Claude Code UI

**NFR-I3: Future Integration Readiness**
- Architecture supports MCP server integration (v2.0)
- Framework ready for observability server integration (v2.0)
- Extension points available for future automation

**NFR-I4: Shell Integration**
- Tab completion works correctly across Bash, Zsh, PowerShell
- Environment variable support compatible with shell standards
- Piping and stdout/stderr handling follows Unix conventions

### Security Model

**NFR-S1: Sandbox Bypass Security**
- CLI disables Claude Code sandbox only when explicitly launching through `pai launch`
- Security relies on PAI hook system for protection (trust model)
- Clear documentation of security trade-offs for users

**NFR-S2: Credential Handling**
- No storage of credentials or sensitive data by CLI
- Environment variables handled securely
- File permissions respect OS security models
