# PAI Development Guide

## Context & Motivation

This guide ensures development work stays isolated from production and works correctly across platforms. Following these patterns prevents:
- Tests polluting production data
- Cross-platform failures (Windows vs Linux differences)
- Path resolution errors from hardcoded assumptions

---

## Quick Start

Set `PAI_DIR` before any development work. This single step isolates your changes from production.

**PowerShell 7 (Windows):**
```powershell
$env:PAI_DIR = $PWD.Path
```

**Bash (Unix/Git Bash):**
```bash
export PAI_DIR="$(pwd)"
```

**Verify setup:**
```bash
# Should show your worktree path
echo $env:PAI_DIR   # PowerShell
echo $PAI_DIR       # Bash

# Should run without path errors
bun test
```

---

## Path Resolution Rules

### Use `$PAI_DIR` for All Path Construction

Claude Code's `~/.claude` is separate from PAI. All PAI paths resolve from `$PAI_DIR`.

| Path | Purpose |
|------|---------|
| `$PAI_DIR/` | PAI system root |
| `$PAI_DIR/.claude/` | PAI's hook configuration |
| `~/.claude/` | Claude Code global config (NOT PAI) |

**Example: Correct Path Construction**
```typescript
// Use process.env.PAI_DIR
const settingsPath = path.join(process.env.PAI_DIR!, '.claude', 'settings.json');

// Use hooks/lib/paths.ts utilities
import { getSettingsPath, paiPath } from './lib/paths';
const settingsPath = getSettingsPath();
const memoryDir = paiPath('MEMORY');
```

**Validate paths with the linter:** `bun run tools/PaiDirLinter.ts`

### Verify Paths Before Writing Code

This instance diverges from upstream. Verify paths exist locally before writing imports:

```bash
ls -la "$PAI_DIR/path/you/expect"
find "$PAI_DIR" -name "filename.ts" 2>/dev/null
```

---

## Environment Isolation

| Environment | PAI_DIR Value | Purpose |
|-------------|---------------|---------|
| Development | `$(pwd)` (worktree) | Isolated testing |
| Production | `~/pai` | Live system |

Setting `PAI_DIR` to your worktree ensures tests write to your worktree, hook changes don't affect the live system, and development remains isolated from production.

---

## Directory Structure

```
$PAI_DIR/
├── .claude/settings.json     ← Hook configuration
├── hooks/                    ← Hook system (*.hook.ts)
│   ├── handlers/             ← Handler modules
│   └── lib/                  ← Cross-platform utilities (use these)
├── skills/                   ← Skill definitions
├── tools/                    ← Linters, generators
├── scripts/                  ← Setup scripts
├── MEMORY/                   ← Session history, state, learnings
└── agentic_logs/             ← Agent execution logs
```

---

## Cross-Platform Utilities

Use `hooks/lib/` utilities for all platform-dependent operations. These handle Windows/Linux differences automatically.

### Why These Matter

Direct approaches fail across platforms:

| Operation | Direct Approach | Problem | Use Instead |
|-----------|-----------------|---------|-------------|
| Path comparison | `pathA === pathB` | Case sensitivity, backslashes | `normalizePathForComparison()` |
| Line splitting | `content.split('\n')` | CRLF leaves `\r` on Windows | `splitLines()` |
| Platform check | `process.platform === 'win32'` | Scattered, inconsistent | `isWindows()`, `isUnix()` |
| Environment vars | Hardcoded paths | `$HOME` not expanded | `expandPath()`, `getPaiDir()` |
| Process spawning | `Bun.$` | Bun-specific, breaks in Node | `shellExec()` |
| Terminal features | Direct Kitty codes | Crashes on Windows | `canUseKitty()` |

### Import Patterns

```typescript
// Platform detection
import { isWindows, isUnix, isMacOS, isLinux } from './lib/platform';

// Path handling
import { normalizePathForComparison, splitLines, toForwardSlash } from './lib/platform';
import { getPaiDir, paiPath, expandPath, getSettingsPath } from './lib/paths';

// Process execution
import { crossSpawnSync, shellExec, runScript } from './lib/spawn';

// Terminal features
import { canUseKitty, supportsAnsiColors, getTerminalWidth } from './lib/platform';

// Environment variables
import { getEnvVar, expandEnvVars } from './lib/platform';
```

### Usage Examples

**Platform detection:**
```typescript
if (isWindows()) { /* Windows-specific logic */ }
if (isUnix()) { /* macOS or Linux */ }
```

**Path handling:**
```typescript
const paiDir = getPaiDir();                    // Expands PAI_DIR or defaults to ~/pai
const memoryDir = paiPath('MEMORY');           // $PAI_DIR/MEMORY
const settingsPath = getSettingsPath();        // $PAI_DIR/settings.json
const expanded = expandPath('$HOME/Documents'); // Handles $HOME, ~, %USERPROFILE%
```

**Line splitting (handles CRLF):**
```typescript
const lines = splitLines(fileContent);
```

**Process execution:**
```typescript
const result = crossSpawnSync('git', ['status']);
const output = await shellExec('echo "hello" && ls');
```

**Terminal features:**
```typescript
if (canUseKitty()) { /* Safe to use Kitty escape codes */ }
```

---

## Hook System

Hooks execute at Claude Code lifecycle events when `.claude/settings.json` exists in the current directory or a parent.

### Hook Events

| Event | Hooks | Purpose |
|-------|-------|---------|
| SessionStart | LoadContext, StartupGreeting, CheckVersion | Context injection, greetings |
| PreToolUse | SecurityValidator | Block dangerous operations |
| UserPromptSubmit | UpdateTabTitle, FormatEnforcer, AutoWorkCreation | UI updates, format reminders |
| Stop | StopOrchestrator (voice, capture, tab-state) | Response processing |
| SubagentStop | AgentOutputCapture | Capture Task tool outputs |
| SessionEnd | SessionSummary, QuestionAnswered | Session analysis |

### Settings Configuration

Hook paths in `settings.json` use absolute paths because Claude Code's shell doesn't reliably expand environment variables.

| File | Purpose | Git Status |
|------|---------|------------|
| `settings.template.json` | Source with `{{PAI_DIR}}` placeholders | Tracked |
| `settings.json` | Generated with absolute paths | Ignored |

**Generate and deploy settings:**
```bash
bun scripts/expand-settings.ts           # Generate from template
cp settings.json ~/.claude/settings.json # Deploy to Claude Code
```

### PowerShell Command Escaping

PowerShell hook commands require triple backslash-quote (`\\\"`) for paths:

```json
{
  "type": "command",
  "command": "pwsh -NoProfile -Command \"bun run \\\"$env:PAI_DIR/hooks/MyHook.hook.ts\\\"\""
}
```

### Hook Development Workflow

1. Set `PAI_DIR` to your worktree
2. Generate settings: `bun scripts/expand-settings.ts`
3. Deploy settings: `cp settings.json ~/.claude/settings.json`
4. Launch Claude Code: `claude`
5. Verify files write to `$PAI_DIR/MEMORY/`
6. Restore original settings when done

### Hook Best Practices

| Practice | Reason |
|----------|--------|
| Write to `$PAI_DIR/MEMORY/` | Environment isolation |
| Log to stderr, output to stdout | Claude sees stdout only |
| Exit 0 (allow), 2 (block) | Exit codes control behavior |
| Use `hooks/lib/` utilities | Consistent cross-platform behavior |

---

## Adapting Upstream Code

This instance derives from [danielmiessler/PAI](https://github.com/danielmiessler/PAI) which runs on Linux. Adapt code for Windows compatibility when pulling features.

### Platform Differences

| Area | This Instance | Upstream |
|------|---------------|----------|
| Platform | Windows (PowerShell 7) | Linux (Bash) |
| Root directory | `$PAI_DIR` | `.claude/` folder |
| Hooks | `.hook.ts` naming, handlers | Different patterns |
| Skills | Symlinked, adapted | All in `.claude/` |
| Shell | PowerShell 7 (`pwsh`) | Bash/Zsh |

### Structure Comparison

```
UPSTREAM (.claude/)              THIS INSTANCE ($PAI_DIR/)
├── hooks/                        ├── hooks/
│   └── *.ts                      │   ├── *.hook.ts
│                                 │   ├── handlers/
│                                 │   └── lib/          ← Cross-platform utilities
├── Observability/                ├── Observability/
├── skills/ (inline)              ├── skills/           ← Can be symlinked
├── settings.json                 ├── settings.template.json
│                                 ├── settings.json     ← Generated
└── PAIInstallWizard.ts           └── scripts/setup.ts
```

### Adaptation Mapping

| Upstream Pattern | Local Replacement |
|------------------|-------------------|
| `~/.claude/settings.json` | `getSettingsPath()` |
| `/home/user/.claude` | `toForwardSlash()` or `path.join()` |
| `$HOME`, `$PAI_DIR` | `expandPath()`, `getPaiDir()` |
| Exact path matching | `normalizePathForComparison()` |
| `content.split('\n')` | `splitLines()` |
| `.sh` shell scripts | Convert to TypeScript |
| `Bun.$\`command\`` | `shellExec()` |
| `process.platform === 'linux'` | `isLinux()` |
| `chmod +x` | Usually not needed |
| `osascript` | Guard with `isMacOS()` |
| `/dev/null` | Platform-aware redirect |
| Kitty terminal codes | Guard with `canUseKitty()` |

### Adaptation Checklist

Before starting:
- [ ] Read upstream code completely
- [ ] Identify path references, shell commands, environment variable usage

Required adaptations:
- [ ] Replace hardcoded paths with `hooks/lib/paths.ts` functions
- [ ] Replace `process.platform` with `hooks/lib/platform.ts` functions
- [ ] Replace `Bun.$` with `shellExec()` from `hooks/lib/spawn.ts`
- [ ] Replace `.split('\n')` with `splitLines()` from `hooks/lib/platform.ts`
- [ ] Convert shell scripts to TypeScript
- [ ] Replace `~/.claude` with `$PAI_DIR` equivalents

Verification:
- [ ] `bun test` passes
- [ ] `bun run tools/PaiDirLinter.ts` shows no violations
- [ ] Hooks work in PowerShell 7 context

### Upstream Resources

| Resource | Location |
|----------|----------|
| Local clone | `C:\Users\fujos\Github\Personal_AI_Infrastructure` |
| GitHub | https://github.com/danielmiessler/Personal_AI_Infrastructure |
| Versioned releases | `\\wsl.localhost\Ubuntu-24.04\root\PAI_Releases\Releases\` |

**Sync upstream:** `cd C:\Users\fujos\Github\Personal_AI_Infrastructure && git pull origin main`

---

## Testing

```bash
bun test                              # All tests
bun test hooks/lib/paths.test.ts      # Specific file
bun test --watch                      # Watch mode
```

---

## Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| Path not found errors | PAI_DIR not set | `$env:PAI_DIR = $PWD.Path` |
| PowerShell 5 errors | Using `powershell` | Install PowerShell 7, use `pwsh` |
| Files in wrong location | PAI_DIR mismatch | Verify PAI_DIR matches `pwd` |
| Missing types/modules | Dependencies | Run `bun install` |
| Hooks silently fail | Escaping errors | Check triple backslash-quote |

---

## Deployment Checklist

**Pre-deploy:**
- [ ] `bun test` passes
- [ ] `bun run tools/PaiDirLinter.ts` clean
- [ ] No debug code in production files

**Deploy:**
- [ ] Set `$env:PAI_DIR = "$HOME/pai"`
- [ ] Copy files to production
- [ ] Update `.claude/settings.json`
- [ ] Run smoke tests

**Post-deploy:**
- [ ] Monitor logs
- [ ] Verify files write to correct locations
