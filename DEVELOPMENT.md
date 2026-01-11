# Development Guide - PAI System

## Quick Start

### 1. Set Environment Variable

**CRITICAL STEP:** Before running any tests or development commands, navigate to your development worktree root and set `PAI_DIR`:

#### PowerShell (Windows)
```powershell
# From repository/worktree root
$env:PAI_DIR = $PWD.Path
```

#### Bash (Unix/Git Bash)
```bash
# From repository/worktree root
export PAI_DIR="$(pwd)"
```

### 2. Verify Setup
```bash
# PowerShell
echo $env:PAI_DIR

# Bash
echo $PAI_DIR

# Should output: /path/to/your/worktree (your current directory)
```

### 3. Run Tests
```bash
bun test
```

## Why PAI_DIR Matters

The PAI system uses `PAI_DIR` to locate resources:
- Code: `$PAI_DIR/hooks/`, `$PAI_DIR/scripts/`, etc.
- Data: `$PAI_DIR/mem-store/`, `$PAI_DIR/MEMORY/`, etc.

**During Development:** Point to your worktree (isolated testing)
**In Production:** Points to global `.pai` directory

Without setting `PAI_DIR`, code may try to access the wrong directory.

## Development vs Production

| Environment | PAI_DIR Value | Purpose |
|-------------|---------------|---------|
| **Development** | `$(pwd)` (worktree root) | Isolated testing in development branch |
| **Production** | `~/.pai` or `$HOME\.pai` | Deployed global PAI system |

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

## Common Development Workflow

1. **Create new branch/worktree** for feature or fix
2. **Set PAI_DIR** to worktree root (`$PWD` or `$(pwd)`)
3. **Run tests** to verify setup
4. **Develop** your changes
5. **Test** frequently during development
6. **Verify** all tests pass before committing

## Common Issues

### Tests fail with "path not found"
**Solution:** Set `PAI_DIR` environment variable (see step 1)

### Files created in wrong location
**Solution:** Verify `PAI_DIR` is set correctly before running code

### Can't find types/modules
**Solution:** Run `bun install` if dependencies are missing

### Tests pass locally but fail in CI
**Solution:** Check if CI has `PAI_DIR` configured properly

## Deployment Checklist

When ready to deploy to production:

- [ ] All tests passing (`bun test`)
- [ ] Code review complete
- [ ] Documentation updated
- [ ] Set PAI_DIR to global: `$env:PAI_DIR = "$HOME\.pai"` (PowerShell) or `export PAI_DIR="$HOME/.pai"` (Bash)
- [ ] Copy/deploy code to production location
- [ ] Create required data directories
- [ ] Update `.claude/settings.json` with any new hooks/configurations
- [ ] Test in production environment

## Best Practices

1. **Always set PAI_DIR** at the start of your session
2. **Run tests before committing** to catch issues early
3. **Keep dev and prod separated** using PAI_DIR
4. **Document changes** in relevant files
5. **Follow existing patterns** in the codebase
