# User Reference - PAI CLI

**Audience:** Users querying PAI CLI capabilities
**Purpose:** Command reference, usage examples, troubleshooting

---

## Installation

### Global Installation (Recommended)

```bash
cd ~/.pai/pai-cli  # or C:\Users\YOUR_USERNAME\.pai\pai-cli on Windows
npm install
npm run build
npm install -g .
```

**Verify:**
```bash
pai --version
pai --help
```

### Without Global Install

```bash
cd ~/.pai/pai-cli
./bin/run.js <command>   # Unix/Mac
.\bin\run.cmd <command>  # Windows
```

---

## Commands

### `pai launch`

Launch Claude Code with PAI configuration.

**Usage:**
```bash
pai launch              # Launch with PAI config
pai launch --quiet      # Suppress informational output
pai launch --debug      # Show verbose debug info
```

**Flags:**
- `--quiet, -q` - Suppress informational messages (errors still shown)
- `--debug, -d` - Enable verbose logging
- `--help, -h` - Show help

**Exit Codes:**
- `0` - Success
- `1` - General error
- `2` - Invalid usage
- `3` - Environment error (Claude Code not installed)

**Examples:**
```bash
# Normal launch
pai launch

# Silent execution for scripts
pai launch --quiet

# Debug version issues
pai launch --debug

# Pipe help to grep
pai launch --help | grep "flags"
```

---

### `pai setup`

Setup symlinks and sandbox permissions for PAI configuration access.

**Usage:**
```bash
pai setup              # Create symlinks for sandbox access
pai setup --debug      # Show verbose setup process
```

**What it does:**
- Creates symlinks from sandbox to `~/.pai/`
- Enables Claude Code to read PAI config without manual approval
- Required once per environment

**Windows Notes:**
- Requires Developer Mode OR Administrator privileges
- See troubleshooting section if symlink creation fails

---

### `pai init`

Initialize new projects with templates.

**Usage:**
```bash
pai init               # Show available initializers
```

**Subcommands:**

#### `pai init bmad`

Install BMAD (Build-Measure-Analyze-Deploy) methodology framework.

```bash
pai init bmad          # Install BMAD to current directory
```

**What it installs:**
- BMAD project structure
- Workflow templates
- Agent definitions
- Best practices documentation

---

## Global Flags

All commands support these flags:

| Flag | Short | Description |
|------|-------|-------------|
| `--quiet` | `-q` | Suppress informational output |
| `--debug` | `-d` | Enable verbose logging |
| `--help` | `-h` | Show command help |

---

## Environment Variables

### `PAI_HOME`

Override default PAI configuration directory.

```bash
PAI_HOME=/custom/path pai launch
```

**Default:** `~/.pai`

---

### `NO_COLOR`

Disable colored output for scripting.

```bash
NO_COLOR=1 pai launch
```

---

### `FORCE_COLOR`

Force colored output in non-TTY environments.

```bash
FORCE_COLOR=1 pai launch | less -R  # Basic colors
FORCE_COLOR=2 pai launch            # 256 colors
FORCE_COLOR=3 pai launch            # Truecolor
```

---

## Scripting & Automation

### Exit Codes

PAI CLI uses standardized exit codes:

| Code | Meaning | Example Scenarios |
|------|---------|-------------------|
| `0` | Success | Command completed, help displayed |
| `1` | General Error | Runtime failures, unexpected errors |
| `2` | Invalid Usage | Unknown flags, invalid arguments |
| `3` | Environment Error | Claude Code not installed, permissions denied |

### Quiet Mode for Scripts

Suppress informational output while preserving errors:

```bash
# Silent execution
pai launch --quiet

# Check exit code
pai launch --quiet
EXIT_CODE=$?
```

### Command Chaining

```bash
# Sequential execution (stops on failure)
pai setup && pai launch

# Conditional execution
pai launch || echo "Launch failed"

# Error handling
if pai launch --quiet; then
  echo "Success"
else
  echo "Failed with code $?"
fi
```

### Piping

```bash
# Search help
pai --help | grep "launch"

# Extract flags
pai launch --help | grep -E "^  -"

# Combine with quiet mode
pai launch --help --quiet | wc -l
```

---

## Troubleshooting

### Windows: Symlink Permission Denied

**Symptom:** `pai setup` fails with "Permission denied" or "EPERM"

**Solutions:**

**Option 1: Enable Developer Mode (Recommended)**
1. Windows Settings → Privacy & Security → For developers
2. Enable "Developer Mode"
3. Run `pai setup` again

**Option 2: Run as Administrator**
1. Open PowerShell as Administrator
2. Run `pai setup`

---

### Version Compatibility Warning

**Symptom:** Warning about Claude Code version incompatibility

**Solution:**
1. Check version: `claude --version`
2. Upgrade if needed: `npm install -g @anthropic-ai/claude-code@latest`
3. Minimum version: 0.1.0

**Debug:**
```bash
pai launch --debug  # Shows version detection details
```

---

### Command Not Found

**Symptom:** `pai: command not found`

**Solutions:**
1. Verify global install: `npm list -g pai-cli`
2. Check PATH includes npm global bin
3. Reinstall: `npm install -g .` from `~/.pai/pai-cli`

---

### PAI_HOME Not Found

**Symptom:** Error about missing PAI configuration

**Solutions:**
1. Verify `~/.pai/` exists
2. Set `PAI_HOME` if using custom location
3. Run `pai setup` to create necessary symlinks

---

## Shell Completion

### Bash

```bash
# Add to ~/.bashrc
eval "$(pai autocomplete:script bash)"

# Or one-liner
printf 'eval "$(pai autocomplete:script bash)"\n' >> ~/.bashrc && source ~/.bashrc
```

### Zsh

```bash
# Add to ~/.zshrc
eval "$(pai autocomplete:script zsh)"

# Or one-liner
printf 'eval "$(pai autocomplete:script zsh)"\n' >> ~/.zshrc && source ~/.zshrc
```

### PowerShell

```powershell
# Run and follow instructions
pai autocomplete powershell
```

### Refresh Cache

```bash
pai autocomplete --refresh-cache
# Or short form
pai autocomplete -r
```

---

## Requirements

**Minimum Claude Code Version:** 0.1.0 or later

**Known Incompatible Versions:**
- 0.0.9 - Has integration issues

**Check version:**
```bash
claude --version
```

**Upgrade:**
```bash
npm install -g @anthropic-ai/claude-code@latest
```

---

## Common Use Cases

### Daily Usage

```bash
# Standard launch with PAI config
pai launch

# Quick help reference
pai launch --help
```

### Scripting

```bash
# Automated deployment
pai setup && pai launch --quiet || exit 1

# CI/CD pipeline
NO_COLOR=1 pai launch --quiet 2>&1 | tee deployment.log
```

### Development

```bash
# Debug mode for troubleshooting
pai launch --debug

# Test command chaining
pai --version && pai launch --help
```

---

## Resources

**Documentation:**
- Main README: `~/.pai/pai-cli/README.md`
- Architecture: `~/.pai/pai-cli/docs/architecture.md`
- Development: `~/.pai/pai-cli/docs/development-guide.md`

**Source:**
- Repository: `~/.pai/pai-cli/`
- Commands: `~/.pai/pai-cli/src/commands/`

---

**Last Updated:** 2026-01-11
**Canonical Source:** `~/.pai/skills/PaiCli/UserReference.md`
