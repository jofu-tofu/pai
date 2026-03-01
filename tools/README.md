# PAI Tools

Development and maintenance tools for the PAI system.

## Cross-Platform Support

All tools are designed to work on Windows, macOS, and Linux.

### Running Tools

The `bun run` command works across all platforms:

```bash
# Unix (macOS/Linux)
bun run tools/PaiDirLinter.ts

# Windows (PowerShell or cmd)
bun run tools/PaiDirLinter.ts
```

### Path Differences

| Platform | Home Directory | PAI_DIR Default |
|----------|----------------|-----------------|
| macOS/Linux | `$HOME` or `~` | home `.claude` directory |
| Windows | `%USERPROFILE%` | `C:\Users\<username>\.claude` |

The tools automatically detect your platform and use the appropriate path handling.

## Available Tools

### PaiDirLinter.ts

Lints the codebase to ensure proper usage of `PAI_DIR` environment variable instead of hardcoded paths.

**Purpose:**
- Enforces consistent path handling across the codebase
- Prevents hardcoded references to home `.claude` paths or `~/pai`
- Ensures portability between development and production environments

**Usage:**

```bash
# Scan entire codebase
bun run tools/PaiDirLinter.ts

# Scan specific directory
bun run tools/PaiDirLinter.ts path/to/directory

# Auto-fix violations
bun run tools/PaiDirLinter.ts --fix

# Auto-fix specific directory
bun run tools/PaiDirLinter.ts --fix path/to/directory
```

**What it detects:**

| Pattern | Example | Severity | Auto-fix |
|---------|---------|----------|----------|
| Shell paths | `~/pai`, home `.claude` path, `$HOME/pai` | Error | ✅ |
| JS/TS paths | `process.env.HOME + "/pai"` | Error | ✅ |
| Windows paths | `C:\Users\user\.claude` | Error | ✅ |
| Markdown docs | `` `~/pai` `` in markdown | Warning | ❌ |

**Auto-fix replacements:**
- `~/pai` → `${PAI_DIR}`
- `$HOME/pai` → `${PAI_DIR}`
- `process.env.HOME + "/.claude"` → `process.env.PAI_DIR`
- `join(process.env.HOME, "pai")` → `process.env.PAI_DIR`

**Skipped files:**
- Test files (`*.test.ts`, `*.spec.ts`)
- Node modules
- Generated files
- History and log directories

**Run tests:**

```bash
bun test tools/PaiDirLinter.test.ts
```

---

### SkillSearch.ts

Search the skill index to discover capabilities dynamically.

**Usage:**

```bash
# Search for skills
bun run $PAI_DIR/tools/SkillSearch.ts <query>

# List all skills
bun run $PAI_DIR/tools/SkillSearch.ts --list
```

---

### GenerateSkillIndex.ts

Generates the skill index from all skill definitions in the skills directory.

**Usage:**

```bash
bun run $PAI_DIR/tools/GenerateSkillIndex.ts
```

---

## Adding New Tools

When adding a new tool:

1. Create the tool file in `tools/` directory
2. Add shebang: `#!/usr/bin/env bun`
3. Add JSDoc comments explaining purpose and usage
4. Create corresponding test file if applicable
5. Document the tool in this README
6. Use `PAI_DIR` for all path references
