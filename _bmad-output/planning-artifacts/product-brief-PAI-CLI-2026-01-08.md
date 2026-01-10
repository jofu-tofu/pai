---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
date: 2026-01-08
author: Josh
---

# Product Brief: PAI CLI

## Executive Summary

PAI CLI is a convenience-focused command-line launcher that removes friction from daily Claude Code usage within the Personal AI Infrastructure (PAI) ecosystem. By automating repetitive setup tasks—like permission flags, hook injection, and token monitoring—it eliminates the cognitive tax of remembering manual steps and reduces session startup time. PAI CLI serves as auxiliary tooling that enhances the PAI experience without becoming a core dependency, providing a maintainable framework for future automation while delivering immediate value through zero-friction launches.

**Target User:** Josh (personal use, with potential for others to adopt)
**Core Value:** Time savings + reduced cognitive load + extensible automation framework
**Success Metric:** `pai launch` becomes the daily entry point, replacing manual Claude Code invocations

---

## Core Vision

### Problem Statement

Using Claude Code within the PAI ecosystem involves repetitive manual setup that creates friction and cognitive overhead:
- Typing `--dangerouslyDisableSandbox` flag every session
- Manually injecting hook system for PAI functionality
- Starting observability servers separately
- Managing MCP server context across sessions
- Remembering multi-step sequences ("did I forget something?")

This cognitive tax compounds over time: each session requires mental checklist management instead of immediate focus on actual work. Session startup can be slow due to MCP server loading, and there's no easy way to monitor token usage in real-time.

### Problem Impact

**Daily Friction:**
- "Quite a bit of time" lost to repetitive setup
- Mental energy spent on remembering command sequences
- Broken flow from setup overhead before starting work

**System Incompleteness:**
- PAI feels less cohesive without automation layer
- No framework for adding future automation
- Manual orchestration of what should be automatic workflows

**Compounding Effect:**
- Slower development velocity
- Discouragement from using certain features due to setup complexity
- Missed opportunities for workflow optimization

### Why Existing Solutions Fall Short

**Shell aliases/bash scripts:**
- Require step-by-step manual execution
- Not easily packageable with PAI system
- Lack extensibility for future automation
- No framework for hook injection or context management

**Generic CLI launchers:**
- Don't understand PAI ecosystem (hooks, observability, BMAD)
- Can't inject status bars or manage MCP context intelligently
- Not customizable for personal workflow needs

**Gap:** Need a maintainable, extensible framework that orchestrates multiple scripts automatically while remaining auxiliary (PAI works without it).

### Proposed Solution

PAI CLI provides a zero-friction launch experience through intelligent automation:

**Core Capabilities (MVP):**
- `pai launch` - Opens Claude Code with dangerously skipped permissions automatically
- Status bar injection showing token usage percentage in real-time
- Automatic hook system integration for PAI functionality
- Framework architecture designed for future extensibility

**Enhancement Capabilities:**
- MCP server context management (prevent performance bottlenecks)
- Observability server auto-start via flags
- BMAD installation automation (`--install-bmad`)
- Extensible command structure for future skills/integrations

**Design Philosophy:**
- **Auxiliary tooling** - PAI works without CLI; CLI enhances experience
- **Framework-first** - Maintainable architecture over feature completeness
- **Useful now** - Solve immediate friction while enabling future automation
- **Personal customization** - Built for Josh's workflow, adaptable for others

### Key Differentiators

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

**Why Now:**
This foundational piece must exist before building other workflows, skills, and automation on top. PAI CLI is the starting point that removes friction today while enabling ambitious automation tomorrow.

---

## Target Users

### Primary Users

**Josh - Solo Developer & Personal AI Infrastructure Builder**

Josh is building and maintaining his Personal AI Infrastructure (PAI) ecosystem, a sophisticated automation framework integrating Claude Code, BMAD workflows, observability, hooks, and custom skills. He launches Claude Code multiple times daily—sometimes running parallel sessions for different workstreams—and values zero-friction automation that eliminates cognitive overhead.

**Daily Context:**
- Opens terminal, wants to start coding immediately
- Multiple PAI sessions throughout the day (existing workspace)
- Mental energy focused on building features, not remembering setup steps
- Values seeing automation happen automatically

**Current Pain Points:**

*Daily Launch Friction (High Frequency):*
- Typing `--dangerouslyDisableSandbox` every session
- Manually symlinking settings.json
- No real-time token usage visibility
- Mental checklist: "Did I forget something?"
- Broken flow before actual work begins

*Project Initialization Friction (Low Frequency, High Cognitive Tax):*
- Running bmad install script repeatedly
- Going through same options every time
- Deciding what's shared vs project-specific for versioning/commits
- Manual configuration of agents and workflows
- Cognitive load on decisions that should be automated

**Success Vision:**

*Daily Launch Journey:*
- Opens terminal in existing PAI workspace
- Types `pai launch`
- Claude Code opens with status bar showing token usage
- Settings already injected, hooks active
- Types `/bmad` → agents already loaded
- Starts coding immediately, zero mental overhead

*Project Init Journey:*
- Opens new folder/project
- Types `pai init bmad`
- BMAD downloads and configures automatically with sensible defaults
- Agents and workflows set up without option prompts
- Types `pai launch` → ready to work
- Zero cognitive load on setup/versioning decisions

**Aha Moment:**
The first time Josh types `pai launch` or `pai init bmad` and watches automation happen without manual intervention—that's when PAI CLI proves its worth.

---

### Secondary Users

**Other Personal AI Infrastructure Builders**

Developers who discover PAI and want to build their own customized personal AI infrastructure. They may fork PAI CLI and adapt it for their own workflows, adding custom flags, hooks, and automation specific to their needs.

**Characteristics:**
- Technical users comfortable with CLI tools
- Value customization and extensibility
- Want framework they can adapt, not rigid product
- Self-sufficient (can modify via Claude Code configuration)

**Usage Pattern:**
- Fork/clone PAI repository
- Customize CLI behavior for their environment
- Add their own automation scripts and flags
- Use as foundation for personal infrastructure

**Note:** PAI CLI is designed for Josh's workflow but structured to be forkable. Secondary users are not the design driver but benefit from the extensible framework architecture.

---

### User Journey

**Daily Launch Journey (Primary - High Frequency):**

1. **Discovery:** Josh realizes typing flags manually is slowing him down
2. **First Use:** Types `pai launch` for the first time
3. **Aha Moment:** Claude Code opens instantly with status bar, settings injected, no mental checklist
4. **Core Usage:** Multiple launches per day, sometimes parallel sessions—each time zero friction
5. **Long-term:** `pai launch` becomes muscle memory, replaces raw `claude` command entirely
6. **Success Metric:** Weeks go by without typing `--dangerouslyDisableSandbox` once

**Project Init Journey (Primary - Low Frequency, High Cognitive Relief):**

1. **Trigger:** Starting new project or workspace that needs BMAD
2. **Old Way:** Run install script, answer same questions, make versioning decisions, configure manually
3. **New Way:** Type `pai init bmad` → automation handles everything
4. **Relief Moment:** Watching setup complete without option prompts or decision fatigue
5. **Follow-up:** Type `pai launch` → immediately productive in new workspace
6. **Long-term Impact:** New projects no longer feel like setup tax, lowers barrier to experimentation

**Secondary User Journey (Fork & Customize):**

1. **Discovery:** Find PAI repository, intrigued by automation approach
2. **Exploration:** Clone repo, read CLI code and structure
3. **Customization:** Add own flags, modify behavior for their environment
4. **Adoption:** Use as foundation for personal AI infrastructure
5. **Long-term:** Maintain their fork, possibly contribute improvements back

---

## Success Metrics

### User Success Criteria

Success is measured by Josh's actual usage patterns and productivity improvements:

**Primary Success Indicators:**

1. **Complete Adoption:** 100% of Claude Code launches go through `pai` - never use raw `claude` command again
2. **Time Savings:** Minimum 30 minutes saved per day on manual setup, increasing as AI development scales
3. **Mental Load Reduction:** 50% reduction in cognitive overhead initially, stabilizing at 20% long-term (measured subjectively via daily reflection)
4. **Persistence:** Continuous usage over time without replacement - basic features remain consistently useful
5. **Aha Moment:** First successful `pai launch` where automation executes without any manual intervention

**Behavioral Success Signals:**
- Multiple parallel Claude Code sessions launched effortlessly
- Zero instances of typing `--dangerouslyDisableSandbox` manually
- New projects initialized with `pai init bmad` without setup friction
- Daily diverse usage of multiple PAI CLI commands (not just launch)

---

### Business Objectives

Since PAI CLI is personal infrastructure tooling (not commercial product), business objectives are framed as **personal productivity goals and PAI ecosystem advancement**:

**3-Month Objectives:**
- PAI CLI becomes exclusive daily entry point for Claude Code
- Successfully initialize BMAD in 2+ new projects using `pai init bmad`
- Add 3-5 custom automation commands beyond MVP
- Achieve measurable time savings (30+ minutes/day documented)

**12-Month Objectives:**
- Advanced features proliferate: MCP management, observability controls, custom commands used daily
- CLI skill framework implemented - plug code → commands automatically
- Recursive/compound automation working (commands triggering commands)
- PAI CLI has enabled building new skills/integrations that wouldn't exist without this foundation

**Strategic Impact:**
- **Development Velocity:** Build features faster by eliminating setup friction
- **Reduced Friction:** Work smoother with zero mental overhead on setup
- **Enabling Future Capabilities:** Foundation that unlocks next phase of PAI evolution - automation at scale, meta-automation frameworks, recursive workflows

**Long-term Vision:** PAI CLI becomes the extensible automation platform that enables increasingly sophisticated personal AI assistance capabilities.

---

### Key Performance Indicators

**Immediate Success (0-3 months):**
- ✅ 100% adoption rate - all Claude Code launches through `pai` (zero raw `claude` usage)
- ✅ First successful automated `pai launch` within first week of MVP completion
- ✅ 30+ minutes saved per day on manual setup (tracked via time logs)
- ✅ `pai init bmad` successfully used in minimum 2 new projects
- ✅ Zero manual typing of `--dangerouslyDisableSandbox` flag

**Medium-term Success (3-6 months):**
- ✅ 3-5 custom commands/flags added beyond MVP features
- ✅ Daily usage of multiple PAI CLI features (launch + at least 2 others)
- ✅ Mental load reduction stabilizes at 20% (measured via subjective weekly assessment)
- ✅ Zero regressions to manual workflow
- ✅ Cumulative time savings: 50+ hours documented

**Long-term Success (6-12 months):**
- ✅ CLI skill framework functional - automated code-to-command generation working
- ✅ Recursive automation examples operational (commands triggering commands)
- ✅ PAI CLI enabled 3+ new skills/integrations that wouldn't have been built without it
- ✅ Framework remains core tool - no replacement considered
- ✅ Advanced features used daily (MCP management, observability, custom workflows)

**Leading Indicators of Success:**
- Speed of adding new commands (faster over time = good framework)
- Frequency of `pai` usage across different contexts
- Number of automation ideas spawned by having CLI foundation
- Reduced time-to-productivity when starting new PAI projects

---

## MVP Scope

### Core Features

The MVP focuses on eliminating daily launch friction through intelligent automation:

**Essential Features:**

1. **`pai launch` Command**
   - Primary entry point for launching Claude Code
   - Single command replaces manual multi-step workflow
   - Zero configuration required after initial setup

2. **Automatic Permission Handling**
   - Auto-applies `--dangerouslyDisableSandbox` flag
   - Eliminates manual flag typing every session
   - Trust in hooks for security protection

3. **Hook System Auto-Injection**
   - Automatically injects PAI hook system on launch
   - Ensures all PAI functionality available immediately
   - Seamless integration without manual steps

4. **Token Usage Status Bar**
   - Real-time token usage percentage display
   - Integrated into Claude Code session
   - Visibility into context consumption at all times

5. **Extensible Framework Architecture**
   - Clean, maintainable code structure
   - Designed for easy command additions
   - Foundation for future automation capabilities

**MVP Philosophy:** Solve immediate daily friction (launch workflow) while building framework that enables future automation. Minimum features, maximum impact.

---

### Out of Scope for MVP

The following features are explicitly deferred to prevent scope creep and ensure focused delivery:

**Deferred to Version 1.1:**
- **`pai init bmad` command** - BMAD installation automation (low frequency use case, high value but not blocking daily work)
- **Additional automation flags** - Specific workflow enhancements identified during MVP usage

**Deferred to Version 2.0:**
- **MCP server context management** - Intelligent server loading/unloading per session
- **Observability server auto-start** - Automated observability integration
- **Advanced automation commands** - Project-specific or workflow-specific commands

**Long-term Vision (12+ months):**
- **CLI skill framework** - Plug code → commands automatically
- **Recursive automation** - Commands triggering other commands
- **Meta-automation platform** - Self-expanding automation ecosystem

**Rationale:** MVP must prove the launch workflow value and framework architecture before investing in advanced features. Each deferred feature requires the MVP foundation to exist first.

---

### MVP Success Criteria

**Validation Gates:**

**Immediate Success (Week 1):**
- ✅ First successful `pai launch` executes without manual intervention
- ✅ Status bar displays correctly in Claude Code session
- ✅ Hooks inject properly - PAI functionality works as expected
- ✅ Josh experiences the "aha moment" - automation working seamlessly

**Short-term Validation (Month 1):**
- ✅ 100% of Claude Code launches use `pai launch` (zero raw `claude` usage)
- ✅ Zero regressions to manual workflow
- ✅ Daily time savings documented (targeting 30+ min/day)
- ✅ No critical bugs blocking usage

**Framework Validation:**
- ✅ Adding a test command demonstrates clean architecture
- ✅ Code structure supports extension without major refactoring
- ✅ Pattern for future commands is clear and repeatable

**Decision Point:** If MVP achieves 100% adoption and demonstrates framework extensibility within first month, proceed to v1.1 with `pai init bmad` and additional commands.

---

### Future Vision

**Post-MVP Evolution:**

**Version 1.1 (Months 2-3):**
- Add `pai init bmad` for automated project initialization
- Implement additional automation flags based on usage patterns
- Refine framework based on real-world extension experience
- Target: 3-5 new commands demonstrating extensibility

**Version 2.0 (Months 4-6):**
- MCP server context management (performance optimization)
- Observability server integration
- Smart defaults and configuration management
- Advanced workflow automation commands

**Long-term Vision (12+ months):**
- **CLI Skill Framework:** Automated code-to-command generation
- **Recursive Automation:** Commands composing and triggering other commands
- **Meta-Automation Platform:** Self-expanding automation that learns from usage patterns
- **Ecosystem Integration:** Deep integration with skills, hooks, MCP servers, observability

**Ultimate Goal:** PAI CLI becomes the extensible automation platform that enables increasingly sophisticated personal AI assistance. Every new capability added to PAI can be exposed through CLI commands, creating compound automation value over time.

**Strategic Impact:** Foundation piece that unlocks next phase of PAI evolution - from manual workflow tool to intelligent automation platform that amplifies developer productivity through progressive enhancement.
