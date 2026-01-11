# Architecture - PAI CLI

**Audience:** Both AI and Users
**Purpose:** System architecture, design principles, extensibility

---

## Executive Summary

PAI CLI is a **command-line wrapper** around Claude Code that provides:
- Zero-friction launch with PAI configuration pre-loaded
- Cross-platform compatibility (Windows, macOS, Linux)
- Scriptability-first design with consistent exit codes
- Extensibility through init system

**Architecture Pattern:** Command Pattern + Shared Library System
**Framework:** Oclif v4
**Language:** TypeScript 5 (ESM, Strict Mode)

---

## Founding Principles

### 1. Zero-Friction User Experience

**Goal:** Make PAI-aware Claude Code launch as simple as `pai launch`

**Implementation:**
- Single command replaces multi-step manual process
- Automatic PAI_DIR detection
- Pre-flight checks (version compatibility, permissions)
- Graceful degradation (warns but doesn't block)

### 2. Transparent Pass-Through

**Goal:** User interacts with Claude Code, not a wrapper layer

**Implementation:**
```typescript
spawn('claude', args, {
  stdio: 'inherit',  // Direct I/O pass-through
  cwd: process.cwd() // Preserve working directory
})
```

**Result:** User sees Claude Code directly; PAI CLI is invisible after launch

### 3. Cross-Platform Compatibility

**Goal:** Same behavior on Windows, macOS, Linux

**Implementation:**
- Cross-platform path utilities (`node:path`, `node:os`)
- Platform-specific entry points (`bin/run.js`, `bin/run.cmd`)
- TTY detection for output adaptation
- Exit code standardization

### 4. Scriptability-First

**Goal:** Enable automation without compromises

**Implementation:**
- Consistent exit codes (0/1/2/3)
- `--quiet` flag for minimal output
- Clean stdout/stderr separation
- Auto-detection of piped output
- NO_COLOR / FORCE_COLOR support

### 5. Extensibility

**Goal:** Add new capabilities without breaking core

**Implementation:**
- Plugin-based init system (`pai init <template>`)
- Shared library architecture
- Command auto-registration (file-based)

---

## System Architecture

### High-Level Flow

```
User runs `pai launch`
  ↓
Entry point (bin/run.js)
  ↓
Oclif framework loads command
  ↓
Launch command executes
  ├─ Resolve PAI_DIR
  ├─ Check Claude Code version
  ├─ Validate prerequisites
  └─ Spawn Claude Code with PAI config
      ↓
Claude Code runs (transparent to user)
```

### Component Layers

```
┌─────────────────────────────────┐
│   Commands (User Interface)     │  ← Commands (launch, init)
├─────────────────────────────────┤
│   Shared Libraries              │  ← Utilities (config, spawn, debug)
├─────────────────────────────────┤
│   Oclif Framework               │  ← CLI infrastructure
├─────────────────────────────────┤
│   Node.js Runtime               │  ← Process management, I/O
└─────────────────────────────────┘
```

---

## Command Architecture

### File-Based Auto-Registration

**Pattern:** File path = Command name

```
src/commands/launch.ts      → pai launch
src/commands/init/bmad.ts   → pai init bmad
```

**Benefits:**
- No manual registration
- Clear command structure
- Easy to add new commands

### Base Command Inheritance

```typescript
export default class Launch extends BaseCommand {
  static override flags = {
    ...BaseCommand.baseFlags,  // Inherit global flags
    // Command-specific flags
  }

  async run(): Promise<void> {
    // Implementation
  }
}
```

**BaseCommand provides:**
- Global flags (`--quiet`, `--debug`, `--help`)
- Error handling patterns
- Output utilities

---

## Shared Library System

### Foundational Libraries (🔒 Locked)

**Cannot be removed without breaking core functionality:**

| Library | Purpose | Why Foundational |
|---------|---------|------------------|
| `config.ts` | Resolve PAI_DIR, Claude Code path | Every command needs config |
| `paths.ts` | Cross-platform path operations | Core to platform compatibility |
| `errors.ts` | Standardized error handling | Ensures consistent exit codes |
| `spawn.ts` | Process spawning with options | Core launch mechanism |

### Feature Libraries (✏️ Modifiable)

**Can be modified, replaced, or removed:**

| Library | Purpose | Modifiability |
|---------|---------|---------------|
| `debug.ts` | Debug logging | Can change format/implementation |
| `output.ts` | Colored output | Can replace with different UI |
| `version.ts` | Version compatibility | Can adjust logic/requirements |
| `spinner.ts` | Loading indicators | Can remove or replace |
| `quiet.ts` | Quiet mode handling | Can change behavior |
| `bmad-installer.ts` | BMAD installation | Feature-specific, removable |

---

## Command Dependencies

### `pai launch`

**Depends on:**
- 🔒 `config.ts` - Resolve PAI_DIR
- 🔒 `spawn.ts` - Launch Claude Code
- ✏️ `version.ts` - Version compatibility check
- ✏️ `debug.ts` - Debug logging
- ✏️ `output.ts` - Colored messages

**Can function without:**
- `spinner.ts` - Launch works, just no loading indicator
- `quiet.ts` - Launch works, just no quiet mode

### `pai init bmad`

**Depends on:**
- 🔒 `config.ts` - Resolve PAI_DIR
- ✏️ `bmad-installer.ts` - Installation logic
- ✏️ `output.ts` - Progress messages

---

## Cross-Platform Design

### Path Handling

```typescript
// ✅ CORRECT - Cross-platform
import {join} from 'node:path'
const paiHome = join(homedir(), '.pai')

// ❌ WRONG - Unix-only
const paiHome = `${homedir()}/.pai`
```

### Entry Points

| Platform | Entry | Purpose |
|----------|-------|---------|
| Unix/Mac | `bin/run.js` | Node shebang |
| Windows | `bin/run.cmd` | CMD wrapper |

### Output Adaptation

```typescript
// Auto-detect TTY
const isTTY = process.stdout.isTTY

// Adapt behavior
if (isTTY) {
  showSpinners()
  useColors()
} else {
  suppressSpinners()
  plainText()
}
```

---

## Exit Code Strategy

| Code | Category | Use Cases |
|------|----------|-----------|
| `0` | Success | Command completed, help shown |
| `1` | General Error | Runtime failures, unexpected errors |
| `2` | Invalid Usage | Unknown flags, missing arguments |
| `3` | Environment Error | Missing prerequisites, permissions |

**Rationale:**
- `0` - Standard success
- `1` - Catch-all for runtime issues
- `2` - User can fix by correcting command
- `3` - User must fix environment (install, permissions)

---

## Extensibility Patterns

### Init System

**Pattern:** Subcommands under `init` topic

```
src/commands/init/
├── bmad.ts       → pai init bmad
└── template.ts   → pai init template
```

**Benefits:**
- Easy to add new initializers
- Organized by topic
- Self-documenting via `pai init --help`

### Plugin Architecture

Oclif supports plugins (currently unused):
```bash
pai plugins:install <plugin-name>
```

**Future:** Custom PAI CLI plugins for domain-specific workflows

---

## Integration Points

### Claude Code

**Integration:**
- Spawns `claude` executable
- Passes all args unchanged
- Inherits stdio (transparent)

**Version Check:**
- Minimum: 0.1.0
- Incompatible: 0.0.9
- Warns but doesn't block

### PAI Configuration

**Integration:**
- Reads from `PAI_DIR` (default: `~/.pai`)
- Pre-loads hooks via `.clauderc`
- Enables sandbox access via symlinks

**Environment Variables:**
- `PAI_DIR` - Override config location
- `NO_COLOR` - Disable colors
- `FORCE_COLOR` - Force colors

### Hooks System

**Integration:**
- Hooks execute in Claude Code, not PAI CLI
- PAI CLI enables hook loading via config
- Hooks can inspect/block user prompts

**Types:**
- `session-start-hook` - Runs at session start
- `user-prompt-submit-hook` - Runs on prompt submit
- `tool-call-hook` - Runs on tool invocation

---

## Testing Strategy

### Unit Tests

**Location:** `test/commands/`
**Purpose:** Test command logic in isolation

**Example:**
```typescript
test
  .stdout()
  .command(['launch', '--help'])
  .it('shows help')
```

### Integration Tests

**Location:** `test/integration/`
**Purpose:** Test actual CLI invocation

**Example:**
```typescript
const result = execSync(`${bin} launch --help`)
expect(result).to.include('Launch Claude Code')
```

### Coverage Goals

- Commands: 100% (critical path)
- Libraries: 80%+ (shared utilities)
- Integration: Key workflows

---

## Security Considerations

### File System Operations

**Risk:** File operations can be abused for directory traversal

**Mitigation:**
- Validate source/target paths
- Require explicit user action (installation scripts)
- Warn on Windows (requires permissions)

### Process Spawning

**Risk:** Command injection via spawned process

**Mitigation:**
- Use `spawn()` with array args (not shell strings)
- Validate executable path
- Don't interpolate user input into commands

### Environment Variables

**Risk:** Malicious environment override

**Mitigation:**
- Validate `PAI_DIR` path
- Prefer defaults over user-provided values
- Log overrides in debug mode

---

## Performance Characteristics

### Startup Time

**Target:** < 100ms from `pai launch` to Claude Code launch

**Optimizations:**
- Lazy-load libraries (only import what's needed)
- Async operations where possible
- Minimal dependencies

### Memory Footprint

**Target:** < 50MB before spawning Claude Code

**Profile:** Mostly Oclif framework + Node.js runtime

---

## Future Extensibility

### Planned Features

1. **Plugin System** - Third-party PAI CLI extensions
2. **Config Management** - `pai config get/set` commands
3. **Template Registry** - Shareable `pai init` templates
4. **Workflow Automation** - `pai workflow run <name>`

### Extensibility Design

**Principles:**
- Additive changes (don't break existing commands)
- Maintain founding principles (transparency, cross-platform)
- Keep core simple (complexity in plugins)

---

## Modifiable vs. Foundational

### 🔒 LOCKED (Architectural Foundation)

**Cannot change without breaking core functionality:**
- Command Pattern architecture
- Oclif framework
- TypeScript + ESM
- Cross-platform compatibility
- Transparent pass-through principle
- Exit code standardization

### ✏️ MODIFIABLE (Implementation Details)

**Can change without architectural impact:**
- Output formatting (colors, spinners)
- Debug logging implementation
- Version compatibility logic
- Init templates and installers
- CLI flag names (with care)
- Help text and documentation

---

## Documentation

**For Users:**
- Installation & usage: `README.md`
- Troubleshooting: `README.md` (Troubleshooting section)
- API reference: Built-in `--help` flags

**For Developers:**
- Architecture: `docs/architecture.md`
- Development guide: `docs/development-guide.md`
- Project context: `_bmad-output/project-context.md`

**For AI:**
- This file: Understanding system design
- `DevelopmentContext.md`: Development patterns
- `AiContext.md`: Integration behavior

---

**Last Updated:** 2026-01-11
**Canonical Source:** `~/.pai/skills/PaiCli/Architecture.md`
