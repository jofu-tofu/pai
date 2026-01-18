# PAI Development Guide

## Quick Start (Required Before Any Work)

PAI requires the `PAI_DIR` environment variable to locate all resources. Set it to your current working directory before running tests or making changes.

**PowerShell 7 (Windows):**
```powershell
$env:PAI_DIR = $PWD.Path
```

**Bash (Unix/Git Bash):**
```bash
export PAI_DIR="$(pwd)"
```

**Verify:** `echo $env:PAI_DIR` (pwsh) or `echo $PAI_DIR` (bash) → should show your worktree path

**Test:** `bun test` → should run without path errors

---

## Critical Path Rules

### PAI_DIR vs ~/.claude

This repository IS the PAI_DIR. Claude Code's `~/.claude` is completely separate.

| Path | Purpose |
|------|---------|
| `~/.claude/` | Claude Code's global config (NOT PAI) |
| `$PAI_DIR/` | PAI system root |
| `$PAI_DIR/.claude/` | PAI's hook configuration |

**Code referencing `~/.claude` directly is a bug.** Use `$PAI_DIR` instead.

```typescript
// ✅ Correct
const settingsPath = path.join(process.env.PAI_DIR!, '.claude', 'settings.json');

// ❌ Wrong - bypasses PAI_DIR
const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
```

**Run the linter to catch violations:** `bun run tools/PaiDirLinter.ts`

### Verify Local Paths Before Writing Code

This instance diverges from upstream PAI. A path that exists upstream may not exist here.

**Before writing imports or references:**
```bash
ls -la "$PAI_DIR/path/you/expect"
find "$PAI_DIR" -name "filename.ts" 2>/dev/null
```

---

## Environment Isolation

| Environment | PAI_DIR | Purpose |
|-------------|---------|---------|
| Development | `$(pwd)` | Isolated testing in worktree |
| Production | `~/pai` | Live PAI system |

Setting PAI_DIR to your worktree ensures:
- Tests write to your worktree, not production
- Hook changes don't affect the live system
- Development and production remain isolated

---

## Directory Structure

```
$PAI_DIR/
├── .claude/settings.json     ← Hook configuration
├── hooks/                    ← Hook system (*.hook.ts)
│   ├── handlers/             ← Handler modules
│   └── lib/                  ← Shared utilities
├── skills/                   ← Skill definitions (CORE, etc.)
├── tools/                    ← Linters, generators
├── scripts/                  ← Setup scripts
├── MEMORY/                   ← Session history, state, learnings
└── agentic_logs/             ← Agent execution logs
```

---

## Hook System

Hooks execute at Claude Code lifecycle events. They are only active when `.claude/settings.json` exists in the current directory or a parent.

### Hook Types

| Event | Hooks | Purpose |
|-------|-------|---------|
| SessionStart | LoadContext, StartupGreeting, CheckVersion | Context injection, greetings |
| PreToolUse | SecurityValidator | Block dangerous operations |
| UserPromptSubmit | UpdateTabTitle, FormatEnforcer, AutoWorkCreation, memory/retrieve | UI updates, format reminders, memory |
| Stop | StopOrchestrator (voice, capture, tab-state handlers) | Response processing |
| SubagentStop | AgentOutputCapture | Capture Task tool outputs |
| SessionEnd | SessionSummary, QuestionAnswered | Session analysis |

### Hook Reference

**SessionStart:**
- **LoadContext.hook.ts** — Loads CORE skill, injects as `<system-reminder>`, loads active work items. Skips subagents.
- **StartupGreeting.hook.ts** — Announces session via voice server, sets tab state.
- **CheckVersion.hook.ts** — Verifies PAI system version compatibility.

**PreToolUse:**
- **SecurityValidator.hook.ts** — Validates Bash/Edit/Write/Read against `patterns.yaml`. Categories: `blocked` (exit 2), `confirm`, `alert`. Writes to `MEMORY/SECURITY/`.

**UserPromptSubmit:**
- **UpdateTabTitle.hook.ts** — Dynamic tab title from prompt keywords.
- **SetQuestionTab.hook.ts** — Detects question-type prompts.
- **AutoWorkCreation.hook.ts** — Creates WORK/ items with Work.md, IdealState.jsonl, TRACE.jsonl.
- **FormatEnforcer.hook.ts** — Response format reminders, tracks compliance streaks.

**Stop:**
- **StopOrchestrator.hook.ts** — Single entry point, reads transcript once, distributes to handlers:
  - `voice.ts` — Extracts 🗣️ line for voice server
  - `capture.ts` — Updates WORK/ items
  - `tab-state.ts` — Resets tab to default
  - `SystemIntegrity.ts` — Detects PAI changes, spawns maintenance
- **WorkCompletionLearning.hook.ts** — Extracts learnings, routes to phase directories.
- **ExplicitRatingCapture.hook.ts** — Captures user satisfaction ratings.
- **ImplicitSentimentCapture.hook.ts** — Detects implicit satisfaction signals.

**SubagentStop:**
- **AgentOutputCapture.hook.ts** — Captures Task tool outputs, routes by agent type.

**SessionEnd:**
- **SessionSummary.hook.ts** — Analyzes session, creates summary in `MEMORY/sessions/`.
- **QuestionAnswered.hook.ts** — Tracks question resolution.

### Hook Command Escaping (settings.json)

PowerShell hook commands require triple backslash-quote (`\\\"`) for paths:

```json
{
  "type": "command",
  "command": "pwsh -NoProfile -Command \"bun run \\\"$env:PAI_DIR/hooks/MyHook.hook.ts\\\"\""
}
```

**How it parses:**

| Level | Sees |
|-------|------|
| JSON string | `pwsh -NoProfile -Command "bun run \"$env:PAI_DIR/hooks/MyHook.hook.ts\""` |
| Shell | `pwsh -NoProfile -Command "bun run \"$env:PAI_DIR/hooks/MyHook.hook.ts\""` |
| PowerShell | `bun run "$env:PAI_DIR/hooks/MyHook.hook.ts"` |

**Symptom of incorrect escaping:** Hooks silently fail, PowerShell token errors.

### Settings Setup (Cross-Platform)

Hook paths in `settings.json` must be absolute because Claude Code's shell doesn't reliably expand environment variables like `$PAI_DIR` on all platforms.

**Solution:** Use a template file with placeholders, then expand to absolute paths.

| File | Purpose | Git Status |
|------|---------|------------|
| `settings.template.json` | Source with `{{PAI_DIR}}` placeholders | Tracked |
| `settings.json` | Generated with absolute paths | Ignored |

**Generate settings.json:**
```bash
bun scripts/expand-settings.ts
```

This reads `{{PAI_DIR}}` placeholders and replaces them with the resolved absolute path (e.g., `C:/Users/fujos/pai`).

**Deploy to Claude Code:**
```bash
# Copy to global Claude config
cp settings.json ~/.claude/settings.json
```

**Full workflow after changes:**
```bash
# 1. Edit the template (not settings.json directly)
#    settings.template.json uses {{PAI_DIR}} placeholders

# 2. Generate settings.json with absolute paths
bun scripts/expand-settings.ts

# 3. Copy to Claude Code's config directory
cp settings.json ~/.claude/settings.json

# 4. Restart Claude Code to pick up changes
```

**Note:** If you move your PAI directory, re-run the expand script and copy again.

### Developing Hooks

1. Set `PAI_DIR` to your worktree
2. Generate settings: `bun scripts/expand-settings.ts`
3. Deploy settings: `cp settings.json ~/.claude/settings.json`
4. Launch Claude Code: `claude`
5. Verify files write to `$PAI_DIR/MEMORY/`, not `~/pai/MEMORY/`
6. Remove `~/.claude/settings.json` when done (or restore original)

### Hook Best Practices

| Practice | Reason |
|----------|--------|
| Write to `$PAI_DIR/MEMORY/` | Ensures environment isolation |
| Log to stderr, output to stdout | Claude sees stdout only |
| Exit 0 (allow), 2 (block) | Exit codes control hook behavior |
| Use `hooks/lib/` utilities | Consistent path resolution, notifications |
| Support both pwsh and bash | Cross-platform compatibility |

---

## Testing

```bash
bun test                              # All tests
bun test hooks/lib/paths.test.ts      # Specific file
bun test --watch                      # Watch mode
```

---

## Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Path not found errors | PAI_DIR not set | Set `$env:PAI_DIR = $PWD.Path` |
| PowerShell 5 errors | Using `powershell` not `pwsh` | Install PowerShell 7, use `pwsh` |
| Files in wrong location | PAI_DIR points elsewhere | Verify PAI_DIR matches `pwd` |
| Missing types/modules | Dependencies not installed | Run `bun install` |

---

## Upstream Relationship

This instance derives from [danielmiessler/PAI](https://github.com/danielmiessler/PAI).

| Resource | Location |
|----------|----------|
| Local upstream clone | `C:\Users\fujos\Github\Personal_AI_Infrastructure` |
| GitHub repository | https://github.com/danielmiessler/Personal_AI_Infrastructure |

### Active Development Warning

The upstream project changes frequently. This instance intentionally diverges:

- **Volatile changes** — Upstream may change significantly between pulls
- **Partial adoption** — We use parts of upstream, not all
- **Local implementations** — Some features here don't exist upstream
- **Missing features** — Some upstream features aren't present here

### Key Differences

| Area | This Instance | Upstream |
|------|---------------|----------|
| Hooks | `.hook.ts` naming, custom handlers | Different patterns |
| Memory | Provider-based architecture | Different implementation |
| Skills | Adapted subset | Full library |
| Configuration | Personalized | Generic/template |

### Using Upstream as Reference

1. **Source of truth** — How PAI concepts *should* work per original design
2. **Missing hook reference** — Check upstream for full implementations
3. **Pattern reference** — Consistent naming, structure, architecture
4. **Documentation source** — May have docs not incorporated here

**Sync upstream:** `cd C:\Users\fujos\Github\Personal_AI_Infrastructure && git pull origin main`

### Writing Code in This Instance

Paths and structures may differ from upstream. Before writing code:

1. **Verify paths exist locally** — `ls -la "$PAI_DIR/path/you/expect"`
2. **Search for actual location** — `find "$PAI_DIR" -name "filename.ts"`
3. **Adapt imports** — Upstream's `../lib/utils` might be `hooks/lib/` here
4. **Don't copy blindly** — Adapt code to local paths and patterns

---

## Deployment Checklist

**Pre-Deploy:**
- [ ] `bun test` passes
- [ ] `bun run tools/PaiDirLinter.ts` shows no violations
- [ ] No debug code in production files

**Deploy:**
- [ ] Set `$env:PAI_DIR = "$HOME/pai"`
- [ ] Copy files to production location
- [ ] Update `.claude/settings.json`
- [ ] Run smoke tests

**Post-Deploy:**
- [ ] Monitor logs
- [ ] Verify files write to correct locations
