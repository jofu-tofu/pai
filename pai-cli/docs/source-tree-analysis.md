# PAI CLI - Source Tree Analysis

**Generated:** 2026-01-10

---

## Annotated Directory Structure

```
pai-cli/
├── bin/                           # Entry point executables
│   ├── run.js                     # Production entry point
│   ├── run.cmd                    # Windows wrapper for run.js
│   ├── dev.js                     # Development entry point (auto-rebuild)
│   └── dev.cmd                    # Windows wrapper for dev.js
│
├── src/                           # TypeScript source code
│   ├── index.ts                   # Main module export
│   │
│   ├── commands/                  # CLI commands (Oclif pattern)
│   │   ├── base.ts                # Base command with common functionality
│   │   ├── launch.ts              # 🎯 CORE: Launch Claude Code with PAI config
│   │   ├── setup.ts               # 🎯 CORE: Setup symlinks and permissions
│   │   ├── init/                  # Init command topic (extensible)
│   │   │   ├── index.ts           # Init base command
│   │   │   └── bmad.ts            # Install BMAD methodology
│   │   └── hello/                 # Example commands (can be removed)
│   │       ├── index.ts           # Hello command
│   │       └── world.ts           # Hello world subcommand
│   │
│   ├── lib/                       # 🏗️ Shared library utilities
│   │   ├── index.ts               # Library exports
│   │   │
│   │   │ # === FOUNDATIONAL LIBRARIES (Required) ===
│   │   ├── config.ts              # 🔒 Config resolution (PAI_HOME)
│   │   ├── paths.ts               # 🔒 Cross-platform path utilities
│   │   ├── errors.ts              # 🔒 Error handling + exit codes
│   │   ├── spawn.ts               # 🔒 Process spawning (Claude Code)
│   │   │
│   │   │ # === FEATURE LIBRARIES (Modifiable) ===
│   │   ├── debug.ts               # ✏️ Debug logging system
│   │   ├── output.ts              # ✏️ Output formatting
│   │   ├── spinner.ts             # ✏️ Loading spinners (ora)
│   │   ├── tty-detection.ts       # ✏️ TTY/terminal detection
│   │   ├── quiet.ts               # ✏️ Quiet mode support
│   │   ├── stdin.ts               # ✏️ Standard input handling
│   │   ├── version.ts             # ✏️ Claude Code version checking
│   │   └── bmad-installer.ts      # ✏️ BMAD installation utility
│   │
│   └── types/                     # TypeScript type definitions
│       └── (shared interfaces)
│
├── test/                          # Test files (mirrors src/)
│   ├── commands/                  # Unit tests for commands
│   │   ├── base.test.ts
│   │   ├── launch.test.ts
│   │   ├── setup.test.ts
│   │   ├── init/
│   │   │   └── bmad.test.ts
│   │   └── hello/
│   │       ├── index.test.ts
│   │       └── world.test.ts
│   │
│   ├── integration/               # Integration tests
│   │   ├── cli.test.ts            # General CLI behavior
│   │   ├── launch.test.ts         # Launch integration
│   │   ├── config.test.ts         # Config resolution
│   │   ├── debug.test.ts          # Debug mode
│   │   ├── piping-support.test.ts # Piping stdin/stdout
│   │   ├── exit-codes.test.ts     # Exit code consistency
│   │   ├── quiet-mode.test.ts     # Quiet mode
│   │   ├── command-chaining.test.ts # Command chaining
│   │   ├── epic-2-validation.test.ts # Epic 2 feature validation
│   │   ├── epic-3-validation.test.ts # Epic 3 feature validation
│   │   ├── bmad-init.test.ts      # BMAD init
│   │   └── init-command-structure.test.ts # Init structure
│   │
│   └── index.test.ts              # Main module tests
│
├── dist/                          # 📦 Compiled JavaScript output (generated)
│   ├── commands/
│   ├── lib/
│   ├── types/
│   └── index.js
│
├── node_modules/                  # Dependencies (gitignored)
│
├── .github/                       # GitHub CI/CD workflows
│   └── workflows/
│       ├── test.yml               # Run tests on PR
│       ├── onPushToMain.yml       # Deploy on main push
│       └── onRelease.yml          # Publish on release
│
├── .vscode/                       # VS Code workspace settings
│
├── package.json                   # 📋 Project manifest + dependencies
├── package-lock.json              # Dependency lock file
├── tsconfig.json                  # TypeScript configuration
├── .mocharc.json                  # Mocha test runner config
├── eslint.config.mjs              # ESLint configuration
├── .prettierrc.json               # Prettier formatting config
├── .c8rc.json                     # C8 coverage config
├── .gitignore                     # Git ignore rules
├── .prettierignore                # Prettier ignore rules
└── README.md                      # 📖 Main project documentation
```

---

## Critical Directories Explained

### `src/commands/`
**Purpose:** All CLI commands live here. Filename determines command name.

**Pattern:** Oclif automatically discovers commands based on file structure:
- `launch.ts` → `pai launch`
- `setup.ts` → `pai setup`
- `init/index.ts` → `pai init`
- `init/bmad.ts` → `pai init bmad`

**Extensibility:** Add new commands by creating new `.ts` files. They auto-register.

---

### `src/lib/`
**Purpose:** Shared utilities used across commands.

**Organization:**
- **Foundational libraries (🔒):** Required for core functionality
- **Feature libraries (✏️):** Can be modified/replaced

**Anti-Pattern:** Never create `src/utils/` or `src/helpers/` - use `src/lib/`

---

### `test/`
**Purpose:** Comprehensive test coverage

**Structure:**
- **`test/commands/`** - Unit tests (one per command)
- **`test/integration/`** - Integration tests (cross-command, real CLI execution)

**Pattern:** Test files mirror source structure (`src/commands/launch.ts` → `test/commands/launch.test.ts`)

---

### `dist/`
**Purpose:** Compiled JavaScript output

**Generated by:** `npm run build` (runs `tsc -b`)

**Contents:** Transpiled `.js` files, `.d.ts` type definitions, source maps

**Gitignored:** Yes - generated on build

---

### `bin/`
**Purpose:** Executable entry points

**Files:**
- `run.js` - Production (uses compiled `dist/`)
- `dev.js` - Development (uses `ts-node` for auto-rebuild)
- `.cmd` wrappers - Windows compatibility

---

## Entry Points

### Production Entry Point: `bin/run.js`

```javascript
#!/usr/bin/env node
// Runs compiled dist/index.js
```

**Used by:**
- `npm install -g .`
- Production execution
- `pai <command>` (after global install)

---

### Development Entry Point: `bin/dev.js`

```javascript
#!/usr/bin/env node
// Uses ts-node for on-the-fly compilation
```

**Used by:**
- Local development
- `./bin/dev.js <command>`
- Auto-rebuilds on source changes

---

## Integration Points

### External Dependencies

**Claude Code:**
- Spawned via `spawn.ts`
- Located via PATH lookup
- Version checked via `version.ts`

**File System:**
- PAI_HOME directory (default: `~/.pai`)
- Claude Code settings directory
- Symlinks created by `setup` command

**Environment:**
- `PAI_HOME` - Override PAI home directory
- `DEBUG` - Enable debug logging
- CI environment detection

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Source files | kebab-case.ts | `config-resolver.ts` |
| Test files | matches source + `.test.ts` | `config-resolver.test.ts` |
| Command files | kebab-case.ts | `launch.ts` |
| Classes | PascalCase | `ConfigResolver` |
| Interfaces | PascalCase (no I prefix) | `Config` |

---

## Build Output

### Compilation Process

```
TypeScript Source (src/)
    ↓ (tsc -b)
JavaScript Output (dist/)
    ↓ (npm pack / npm publish)
NPM Package
    ↓ (npm install -g)
Global Binary (pai)
```

### What Gets Published

From `package.json` `files` field:
- `./bin` - Entry point scripts
- `./dist` - Compiled JavaScript
- `./oclif.manifest.json` - Generated command manifest

**Excluded:**
- `src/` (source TypeScript)
- `test/` (tests)
- `node_modules/` (dependencies installed separately)

---

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project manifest, dependencies, scripts |
| `tsconfig.json` | TypeScript compiler options |
| `.mocharc.json` | Mocha test runner configuration |
| `eslint.config.mjs` | ESLint code quality rules |
| `.prettierrc.json` | Prettier code formatting rules |
| `.c8rc.json` | C8 coverage reporter configuration |
| `.gitignore` | Git ignore patterns |

---

## Key Observations

1. **Clean separation:** Commands, libraries, and types are clearly separated
2. **Test coverage:** Comprehensive unit and integration tests
3. **Build artifacts:** `dist/` is generated, not committed
4. **Cross-platform:** Uses Oclif patterns for Windows/Unix compatibility
5. **Extensible:** Easy to add new commands and libraries
6. **Standard conventions:** Follows Oclif and TypeScript best practices

---

## Navigation Tips for Developers

**To understand how a command works:**
1. Start in `src/commands/<command>.ts`
2. Check which `lib/` modules it imports
3. Read the command's test file in `test/commands/`
4. Check integration tests in `test/integration/`

**To add a new command:**
1. Create `src/commands/<name>.ts` extending `Command`
2. Add flags and args using `@oclif/core` decorators
3. Implement `async run()` method
4. Create corresponding test file
5. Run `npm run build` and test with `./bin/dev.js <name>`

**To modify a library:**
1. Check if it's foundational (🔒) or feature (✏️) in this doc
2. Read the library file in `src/lib/`
3. Check usage with: `grep -r "from.*<lib-name>" src/`
4. Update tests if behavior changes
5. Run `npm test` to verify

---

This source tree reflects a mature, well-organized CLI project following industry-standard patterns with clear separation of concerns and comprehensive test coverage.
