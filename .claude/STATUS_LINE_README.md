# Status Line Configuration

## Overview

The `statusLine` configuration in `settings.json` enables real-time token usage display in Claude Code's status bar.

## Configuration

```json
{
  "statusLine": {
    "type": "command",
    "command": "powershell -NoProfile -Command \"& \\\"$env:PAI_DIR/scripts/statusline.ps1\\\"\""
  }
}
```

**Critical Syntax Notes:**
- Must use `-Command` parameter to allow PowerShell variable expansion
- Must use `&` (call operator) to execute the .ps1 script file
- Must use **double quotes** (not single quotes) around the script path for `$env:PAI_DIR` expansion
- In JSON, double quotes must be escaped as `\\\"`
- PowerShell automatically pipes stdin to scripts, so no explicit pipe command needed

## How It Works

1. **Claude Code** sends JSON context data via stdin to the configured command
2. **statusline.ps1** script parses the JSON and formats output
3. **Status bar** displays the formatted string (e.g., `[opus-4] 15500 tokens (7%)`)

## Input Data

Claude Code provides the following JSON structure via stdin:

```json
{
  "model": {
    "id": "claude-opus-4-5-20251101",
    "display_name": "Opus 4.5"
  },
  "context_window": {
    "total_input_tokens": 55117,
    "total_output_tokens": 17649,
    "context_window_size": 200000,
    "current_usage": {
      "input_tokens": 7,
      "output_tokens": 1,
      "cache_creation_input_tokens": 559,
      "cache_read_input_tokens": 37651
    }
  }
}
```

## Output Format

The script outputs a single-line string displayed in the status bar:

```
[model-short] token-count (percentage%)
```

**Examples:**
- `[opus-4] 41002 tokens (20%)`
- `[sonnet-4] 15500 tokens (7%)`
- `[haiku] 2500 tokens (1%)`

## Requirements

1. **Environment Variable:** `PAI_DIR` must be set (default: `C:\Users\<username>\.pai`)
2. **Script Exists:** `$env:PAI_DIR\scripts\statusline.ps1` must exist
3. **PowerShell:** PowerShell 5.1+ (included in Windows 10/11)
4. **Symlink:** `~/.claude/settings.json` → `~/.pai/.claude/settings.json` (created by `pai setup`)

## Troubleshooting

### Status Bar Shows Error

1. **Verify PAI_DIR is set:**
   ```powershell
   echo $env:PAI_DIR
   # Should output: C:\Users\<username>\.pai
   ```

2. **Check script exists:**
   ```powershell
   Test-Path "$env:PAI_DIR\scripts\statusline.ps1"
   # Should output: True
   ```

3. **Test script manually:**
   ```powershell
   $json = @"
   {
     "model": {"id": "claude-opus-4-5-20251101"},
     "context_window": {
       "context_window_size": 200000,
       "current_usage": {
         "input_tokens": 10000,
         "cache_creation_input_tokens": 500,
         "cache_read_input_tokens": 5000
       }
     }
   }
   "@

   # Test with correct syntax
   echo $json | powershell -NoProfile -Command "& \"`$env:PAI_DIR/scripts/statusline.ps1\""
   # Expected output: [opus-4] 15500 tokens (7%)

   # Alternative: Direct file path (if PAI_DIR is set)
   echo $json | powershell -NoProfile -File "$env:PAI_DIR\scripts\statusline.ps1"
   ```

4. **Check PowerShell execution policy:**
   ```powershell
   Get-ExecutionPolicy
   # If Restricted, the -NoProfile flag handles this
   ```

### Status Bar Not Updating

1. **Verify PAI_DIR is set:**
   ```powershell
   [System.Environment]::GetEnvironmentVariable('PAI_DIR', 'User')
   # Should output: C:\Users\<username>\.pai
   ```

   If not set, run:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('PAI_DIR', "$env:USERPROFILE\.pai", 'User')
   ```

2. **Ensure symlink exists:**
   - `~/.claude/settings.json` → `~/.pai/.claude/settings.json`
   - Run `pai setup` to create/verify symlink

3. **CRITICAL: Restart Claude Code completely**
   - Close ALL Claude Code windows
   - Restart to pick up the new PAI_DIR environment variable
   - User-level environment variables only load at process start

## Platform Support

### Windows (Current)
- Uses PowerShell script: `statusline.ps1`
- Command: `powershell -NoProfile -Command "& \"$env:PAI_DIR/scripts/statusline.ps1\""`
- PowerShell automatically pipes stdin to the script (no explicit pipe needed)
- Uses `$env:PAI_DIR` environment variable for path resolution
- Requires PowerShell 5.1+ (included in Windows 10/11)

**Why this specific syntax:**
- `-Command` allows PowerShell to expand `$env:PAI_DIR` variable
- `&` (call operator) executes the `.ps1` script file
- Double quotes enable variable expansion (single quotes would treat `$env:PAI_DIR` as literal text)
- Forward slashes `/` work on Windows and match hook patterns
- In JSON: `\"` escapes to `"`, and `\\\"` escapes to `\"`

**Setting up PAI_DIR environment variable:**
```powershell
# Option 1: Set for current session
$env:PAI_DIR = "$env:USERPROFILE\.pai"

# Option 2: Set permanently (user level)
[System.Environment]::SetEnvironmentVariable('PAI_DIR', "$env:USERPROFILE\.pai", 'User')

# Option 3: Set permanently (system level - requires admin)
[System.Environment]::SetEnvironmentVariable('PAI_DIR', "$env:USERPROFILE\.pai", 'Machine')
```

### macOS/Linux (Future)
- Will require bash/shell equivalent: `statusline.sh`
- Command: `bash -c "$PAI_DIR/scripts/statusline.sh"`
- May need `jq` for JSON parsing

## Technical Details

### Model Name Shortening

The script uses regex to shorten model IDs:

| Model ID | Display Name |
|----------|--------------|
| `claude-opus-4-*` | `opus-4` |
| `claude-sonnet-4-*` | `sonnet-4` |
| `claude-sonnet-3-5-*` | `sonnet-3.5` |
| `claude-haiku-*` | `haiku` |
| Others | Removes `claude-` prefix and timestamp |

### Token Calculation

Includes all token types for accurate count:
```powershell
$currentTokens = $usage.input_tokens +
                 $usage.cache_creation_input_tokens +
                 $usage.cache_read_input_tokens
```

This ensures prompt caching scenarios show accurate token usage.

### Percentage Calculation

Uses `Floor()` to prevent misleading percentages:
```powershell
$percent = [math]::Floor(($currentTokens * 100) / $windowSize)
```

## PowerShell Syntax Deep Dive

### Why `-Command` instead of `-File`?

**Problem:** When Claude Code invokes the statusLine command, it's executed from a context where `$env:PAI_DIR` needs to be expanded by PowerShell, not by the shell (cmd.exe or other).

**Solution Comparison:**

| Syntax | Result | Works? |
|--------|--------|--------|
| `-File "$env:PAI_DIR\..."` | cmd.exe passes literal string `$env:PAI_DIR` | ❌ No |
| `-Command '& "$env:PAI_DIR/..."'` | Single quotes prevent variable expansion | ❌ No |
| `-Command "& \"$env:PAI_DIR/...\""` | Double quotes allow expansion, `&` executes script | ✅ Yes |

### Testing the Command

```bash
# This works - PowerShell expands $env:PAI_DIR before executing script
echo '{"model":{"id":"test"}}' | powershell -NoProfile -Command "& \"`$env:PAI_DIR/scripts/statusline.ps1\""

# This fails - Single quotes prevent expansion
echo '{"model":{"id":"test"}}' | powershell -NoProfile -Command "& '$env:PAI_DIR/scripts/statusline.ps1'"

# This fails - No -Command means PowerShell doesn't expand the variable
echo '{"model":{"id":"test"}}' | powershell -NoProfile "$env:PAI_DIR/scripts/statusline.ps1"
```

### JSON Escaping Rules

In `settings.json`, quotes must be escaped:
- `"` → `\"` (escape once for JSON)
- To get a literal `"` inside a PowerShell command string, use `\\\"`
  - JSON parses `\\\"` → PowerShell receives `\"`
  - PowerShell interprets `\"` → Actual quote character `"`

**Example:**
```json
"command": "powershell -Command \"& \\\"$env:VAR\\\"\""
```
Parses to: `powershell -Command "& \"$env:VAR\""`

## References

- **Script Implementation:** `scripts/statusline.ps1`
- **Integration:** Story 2.7 (`pai setup` command creates symlink)
- **Launch Command:** Story 2.6 (`pai launch` command launches Claude Code)
- **Git Commit:** f8dcc82 (Jan 9, 2026) - Statusline refactoring
- **Syntax Fix:** (Jan 10, 2026) - Fixed PowerShell variable expansion with `-Command` and proper quoting
