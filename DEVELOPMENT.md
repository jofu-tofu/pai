# Development Guide - PAI System

## Context & Motivation

The PAI system architecture requires `PAI_DIR` to locate code and data across the entire codebase. Without proper configuration, tests access wrong paths, create files in incorrect locations, and development work pollutes production environments. This guide ensures isolated development with reliable test execution.

## Critical Environment Setup

Before running ANY tests or development commands, configure your environment. This prevents path errors, wrong file locations, and cross-environment pollution.

### Step 1: Set PAI_DIR

Navigate to your development worktree root, then set the environment variable:

**PowerShell (Windows):**
```powershell
$env:PAI_DIR = $PWD.Path
```

**Bash (Unix/Git Bash):**
```bash
export PAI_DIR="$(pwd)"
```

### Step 2: Verify Configuration

```bash
# PowerShell
echo $env:PAI_DIR

# Bash
echo $PAI_DIR
```

**Expected output:** Your current worktree directory path

### Step 3: Run Initial Test

```bash
bun test
```

**Success:** Tests run without path errors
**Failure:** PAI_DIR not set correctly - repeat Step 1

## How PAI_DIR Works

The PAI system uses `PAI_DIR` as the root path for all resource location:

**Code locations:**
- `$PAI_DIR/hooks/` - Git hooks and automation
- `$PAI_DIR/scripts/` - Utility scripts
- `$PAI_DIR/skills/` - Skill definitions

**Data locations:**
- `$PAI_DIR/mem-store/` - Memory system data
- `$PAI_DIR/MEMORY/` - Session and state data
- `$PAI_DIR/agentic_logs/` - Agent execution logs

**Environment isolation:**
- **Development:** `PAI_DIR=$(pwd)` - Your worktree (isolated testing)
- **Production:** `PAI_DIR=~/.pai` - Global installation (live system)

## Development vs Production

| Environment | PAI_DIR Value | Purpose |
|-------------|---------------|---------|
| **Development** | `$(pwd)` (worktree root) | Isolated testing in development branch |
| **Production** | `~/.pai` or `$HOME\.pai` | Deployed global PAI system |

## Working with Hooks

Claude Code uses a **per-directory** hook system. Hooks are only active when Claude Code finds a `.claude/settings.json` file in the current working directory or parent directories.

### Hook Architecture

**Production PAI System:**
- Location: `$HOME/.pai/.claude/settings.json`
- Active when: Working in `~/.pai` directory
- Purpose: Full PAI System hooks (memory, security, context loading)

**Development (this repository):**
- Location: `$(pwd)/.claude/settings.json` (optional, create as needed)
- Active when: Working in this worktree
- Purpose: Test hooks in isolation without affecting production PAI System

**Other directories:**
- No hooks active
- Clean Claude Code experience
- Perfect for general development work

### Developing Hooks

When working on hook code in this repository:

1. **Set PAI_DIR to your worktree** (as per standard workflow):
   ```powershell
   $env:PAI_DIR = $PWD.Path
   ```

2. **Create local .claude/settings.json** (if testing hooks):
   ```powershell
   bun run scripts/setup-hooks.ts
   ```
   This creates `.claude/settings.json` pointing to hooks in THIS repository.

3. **Launch Claude Code** in this directory:
   ```bash
   claude
   ```
   Hooks will now execute from your development code, not production.

4. **Verify hook behavior**:
   - Check terminal output for hook execution messages
   - Verify files are written to `$PAI_DIR/history/` (your worktree)
   - Not writing to production `~/.pai/history/`

5. **When done**, remove `.claude/settings.json` to disable hooks:
   ```powershell
   rm .claude/settings.json
   ```

### Hook Reference

Each hook serves a specific purpose in the PAI System:

#### SessionStart Hooks

1. **initialize-session.ts** - Session initialization
   - Sets terminal tab title with project name
   - Creates required directory structure
   - Writes session marker file
   - Sends events to observability

2. **load-core-context.ts** - Context injection
   - Loads CORE skill from `$PAI_DIR/skills/CORE/SKILL.md`
   - Injects into Claude's context as `<system-reminder>`
   - Skips for subagent sessions

#### PreToolUse Hooks

3. **security-validator.ts** - Security validation (Bash tool only)
   - Validates Bash commands against attack patterns
   - Blocks: rm -rf, reverse shells, credential theft, prompt injection
   - Warns: git force operations, sudo usage
   - Logs: network operations, system modifications

#### Continuous Capture Hooks

4. **capture-all-events.ts** - Universal event logger
   - Captures ALL hook events to JSONL files
   - Location: `$PAI_DIR/history/raw-outputs/YYYY-MM/YYYY-MM-DD_all-events.jsonl`
   - Tracks agent types and session mapping
   - Runs on: SessionStart, PreToolUse, PostToolUse, Stop, SubagentStop, SessionEnd, UserPromptSubmit

#### UserPromptSubmit Hooks

5. **update-tab-titles.ts** - UI updates
   - Updates terminal tab title based on user prompt
   - Extracts keywords from prompt
   - Sets dynamic tab title (e.g., "🤖 Fix authentication bug")

#### Stop Hooks

6. **stop-hook.ts** - Main session capture
   - Captures main agent work summaries
   - Detects learnings vs regular sessions
   - Routes to: `history/learnings/` or `history/sessions/`
   - Extracts summary from final response

7. **subagent-stop-hook.ts** - Subagent output capture
   - Captures Task tool outputs
   - Routes by agent type:
     - `researcher` → `history/research/`
     - `architect` → `history/decisions/`
     - `engineer`, `designer` → `history/execution/features/`
   - Extracts completion message

#### SessionEnd Hooks

8. **capture-session-summary.ts** - Final session summary
   - Analyzes entire session from raw events
   - Determines session focus (blog-work, hook-development, etc.)
   - Lists files changed, commands executed, tools used
   - Creates comprehensive session summary

### Hook Development Best Practices

1. **Never test hooks in production** - Always use a development worktree with `PAI_DIR=$(pwd)`

2. **Check hook output** - Hooks write to stderr for logging; Claude sees stdout

3. **Exit codes matter**:
   - `0` - Success, allow operation
   - `2` - Block operation (security-validator)
   - Non-zero - Error, operation may be blocked

4. **Memory/History writes** - All hooks write to `$PAI_DIR/history/`, verify it's your worktree

5. **Cross-platform** - Hooks must work on Windows (PowerShell) and Unix (bash)

## Running Tests

```bash
# All tests
bun test

# Specific file
bun test path/to/test-file.test.ts

# Watch mode
bun test --watch

# With coverage (if configured)
bun test --coverage
```

## Standard Development Workflow

Follow this pattern for all development work:

1. **Create branch/worktree** for your feature or fix
2. **Navigate to worktree root** in your terminal
3. **Set PAI_DIR** using commands in Step 1 above
4. **Verify configuration** using Step 2 above
5. **Run initial tests** to confirm environment is correct
6. **Develop changes** iteratively
7. **Run tests frequently** during development
8. **Verify all tests pass** before committing
9. **Commit and push** when complete

## Troubleshooting

Use this section to resolve common development issues.

### Issue: Tests fail with "path not found" errors

**Cause:** PAI_DIR environment variable not set

**Solution:**
1. Navigate to worktree root
2. Run: `$env:PAI_DIR = $PWD.Path` (PowerShell) or `export PAI_DIR="$(pwd)"` (Bash)
3. Verify: `echo $env:PAI_DIR` should show your worktree path
4. Run tests again

### Issue: Files created in unexpected locations

**Cause:** PAI_DIR points to wrong directory

**Solution:**
1. Check current PAI_DIR: `echo $env:PAI_DIR`
2. Compare to current directory: `pwd`
3. If different, set PAI_DIR to current directory
4. Verify configuration

### Issue: Cannot find types or modules

**Cause:** Dependencies not installed

**Solution:**
1. Run: `bun install`
2. Wait for installation to complete
3. Run tests again

### Issue: Tests pass locally but fail in CI

**Cause:** CI environment missing PAI_DIR configuration

**Solution:**
1. Check CI configuration file
2. Ensure PAI_DIR is set in CI environment
3. Verify CI uses correct directory structure

## Deployment Checklist

Complete all items before deploying to production:

**Pre-Deployment Verification:**
- [ ] All tests passing: `bun test` shows no failures
- [ ] Code review approved by team member
- [ ] Documentation updated to reflect changes
- [ ] No debug code or console.logs in production code
- [ ] All dependencies in package.json are production-ready

**Environment Configuration:**
- [ ] Set PAI_DIR to production path
  - PowerShell: `$env:PAI_DIR = "$HOME\.pai"`
  - Bash: `export PAI_DIR="$HOME/.pai"`
- [ ] Verify production PAI_DIR: `echo $env:PAI_DIR`

**Deployment Steps:**
- [ ] Copy code to production location
- [ ] Create required data directories (mem-store, MEMORY, etc.)
- [ ] Update `.claude/settings.json` with new hooks/configurations
- [ ] Run production smoke tests
- [ ] Verify all features work in production environment

**Post-Deployment:**
- [ ] Monitor logs for errors
- [ ] Verify data is being written to correct locations
- [ ] Test critical user workflows

## Success Criteria

Development environment is correctly configured when:

✅ PAI_DIR environment variable is set and verified
✅ `bun test` runs without path-related errors
✅ Files are created in worktree, not in global .pai directory
✅ Changes can be made without affecting production environment
✅ All tests pass consistently

## Development Best Practices

1. **Set PAI_DIR first** - Every development session starts with environment configuration
2. **Verify before running** - Always check PAI_DIR is correct before tests or code execution
3. **Test frequently** - Run tests after each meaningful change
4. **Isolate environments** - Keep development and production strictly separated via PAI_DIR
5. **Follow patterns** - Match existing code structure and conventions
6. **Document changes** - Update relevant documentation when modifying behavior
