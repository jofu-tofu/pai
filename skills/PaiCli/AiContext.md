# AI Context - PAI CLI

**Audience:** Claude Code (AI-only knowledge for autonomous operation)
**Purpose:** Understanding non-scriptable features, integration points, and behavioral context

---

## What Claude Code Needs to Know

### 1. PAI CLI's Role in the Ecosystem

PAI CLI is a **wrapper around Claude Code** that:
- Pre-loads PAI configuration from `~/.pai/`
- Executes hooks defined in `~/.pai/.clauderc`
- Provides convenience commands for PAI-specific workflows
- Maintains transparent pass-through to Claude Code

**Key Insight:** When a user runs `pai launch`, they are ultimately launching **you** (Claude Code) with PAI configuration pre-loaded.

### 2. Non-Scriptable Features

These are features that exist in the Claude Code environment but cannot be automated via scripts:

#### Hook System
- **Location:** `~/.pai/.clauderc`
- **Types:** `user-prompt-submit-hook`, `session-start-hook`, `tool-call-hook`
- **Behavior:** Hooks execute in response to events, providing feedback visible to Claude Code
- **AI Action:** Treat hook feedback as user input; respond to blocked actions by adjusting approach

#### Sandbox Permissions
- **Setup:** `pai setup` creates symlinks to enable sandbox access
- **Purpose:** Allow Claude Code to read PAI configuration without manual approval
- **AI Action:** If PAI config is inaccessible, suggest `pai setup`

#### TTY Detection
- **Behavior:** PAI CLI auto-adjusts output (colors, spinners) based on terminal type
- **AI Context:** Output differences aren't errors; they're intentional adaptations
- **Piped Output:** Automatically clean (no ANSI codes) when stdout is redirected

### 3. Integration Points

#### Claude Code Version Compatibility
- **Check:** PAI CLI validates Claude Code version on launch
- **Minimum:** 0.1.0
- **Incompatible:** 0.0.9
- **AI Action:** If version warnings appear, suggest upgrading Claude Code

#### Environment Variables
- `PAI_HOME` - Override default `~/.pai` location
- `NO_COLOR` - Disable colored output
- `FORCE_COLOR` - Force colors in non-TTY environments
- **AI Action:** Recognize these in debug output; suggest settings when appropriate

#### Exit Codes
PAI CLI uses standardized codes for automation:
- `0` - Success
- `1` - General error
- `2` - Invalid usage
- `3` - Environment error (Claude Code missing, permissions denied)

**AI Action:** When debugging failures, check exit codes to identify error category

### 4. Hooks Behavior (Critical Understanding)

**User Prompt Submit Hook:**
```bash
# Executes AFTER user submits prompt
# Can inspect prompt content
# Can block execution with exit code 1
```

**AI Implications:**
- Blocked prompts appear as error messages
- You should adjust your approach if a hook blocks your action
- Hooks are user-defined; respect their intent

**Session Start Hook:**
```bash
# Executes when Claude Code session begins
# Can load context (CORE skill auto-loads here)
# Output appears as system reminders
```

**AI Implications:**
- Session start content is provided FOR you, not BY you
- Don't respond to auto-loaded context unless directly relevant

### 5. When PAI CLI Isn't the Answer

**PAI CLI is NOT:**
- A replacement for Claude Code (it's a launcher)
- A separate tool with unique capabilities
- Required for Claude Code operation (it's optional convenience)

**AI Guidance:**
- If the user's question is about Claude Code features, answer directly
- If it's about PAI integration, reference PAI CLI
- If it's about automation/scripting PAI workflows, that's PAI CLI's domain

### 6. Development Context Awareness

**When user asks you to work on PAI CLI itself:**
- Read `~/.pai/pai-cli/DEVELOPMENT.md` FIRST
- Use development environment (`bin/dev.js`), not production build
- Tests are in `test/` directory
- Never pollute production environment with development work

### 7. Autonomous Decision Making

**Use PAI CLI knowledge to:**
- Suggest `pai setup` when sandbox permissions are needed
- Recommend `pai launch` over manual `claude` invocation for PAI users
- Debug version compatibility issues
- Understand why hooks might be blocking actions

**Don't:**
- Over-explain PAI CLI's existence (users already know they're using it)
- Confuse PAI CLI commands with Claude Code capabilities
- Assume all users have PAI CLI installed

---

## Quick Decision Tree

```
User mentions PAI CLI issue
  ├─ Installation problem → Read UserReference.md (installation section)
  ├─ Command not working → Check exit codes, suggest debug mode
  ├─ Hook behavior → Explain hook system, suggest checking .clauderc
  ├─ Development task → Read DevelopmentContext.md
  └─ Architecture question → Read Architecture.md
```

---

**Last Updated:** 2026-01-11
**Canonical Source:** `~/.pai/skills/PaiCli/AiContext.md`
