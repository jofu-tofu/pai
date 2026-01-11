# Development Context - PAI CLI

**Audience:** Claude Code (AI-only development knowledge)
**Purpose:** Development workflow, testing patterns, code structure

---

## CRITICAL: Read First

**Before ANY development or testing work:**

1. **Read:** `~/.pai/pai-cli/DEVELOPMENT.md`
2. **Verify:** You're in development environment
3. **Use:** `bin/dev.js` (NOT `bin/run.js`)

**Why:** Prevents test failures, wrong paths, and pollution of production environment.

---

## Development Environment Setup

### File Locations

```
~/.pai/pai-cli/              # PAI CLI source
~/development/pai-cli/       # Development workspace (if separate)
```

### Entry Points

| File | Purpose | When to Use |
|------|---------|-------------|
| `bin/run.js` | Production build | After `npm run build`, global install |
| `bin/dev.js` | Development | Local testing, no build required |

### Commands

```bash
# Development (auto-compiles TypeScript)
./bin/dev.js launch --debug

# Production (requires build)
npm run build
./bin/run.js launch
```

---

## Project Structure

```
pai-cli/
├── src/
│   ├── commands/           # Command implementations
│   │   ├── base.ts        # BaseCommand (ALL commands extend this)
│   │   ├── launch.ts      # pai launch
│   │   ├── setup.ts       # pai setup
│   │   └── init/          # Topic: pai init
│   │       └── bmad.ts    # pai init bmad
│   ├── lib/               # Shared libraries
│   │   ├── config.ts      # 🔒 Foundational - Config resolution
│   │   ├── paths.ts       # 🔒 Foundational - Cross-platform paths
│   │   ├── errors.ts      # 🔒 Foundational - Error handling
│   │   ├── spawn.ts       # 🔒 Foundational - Process spawning
│   │   ├── debug.ts       # ✏️ Modifiable - Debug logging
│   │   ├── output.ts      # ✏️ Modifiable - Output formatting
│   │   └── version.ts     # ✏️ Modifiable - Version checking
│   └── types/             # Type definitions
│       └── index.ts
├── test/
│   ├── commands/          # Unit tests
│   └── integration/       # Integration tests
├── bin/
│   ├── run.js            # Production entry
│   └── dev.js            # Development entry
└── docs/                  # Documentation
```

**Legend:**
- 🔒 Foundational - Required for core functionality, rarely modified
- ✏️ Modifiable - Feature libraries, can be changed/replaced

---

## Development Workflow

### Adding a New Command

1. **Create command file:**
```bash
touch src/commands/status.ts
```

2. **Implement:**
```typescript
import BaseCommand from './base.js'
import {Flags} from '@oclif/core'

export default class Status extends BaseCommand {
  static override description = 'Show PAI status'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    ...BaseCommand.baseFlags,  // ALWAYS inherit base flags
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Status)
    this.log('Status output')
  }
}
```

3. **Add tests:**
```typescript
// test/commands/status.test.ts
import {expect, test} from '@oclif/test'

describe('status', () => {
  test
    .stdout()
    .command(['status'])
    .it('shows status', ctx => {
      expect(ctx.stdout).to.contain('Status output')
    })
})
```

4. **Test locally:**
```bash
./bin/dev.js status
npm test
```

---

## Testing Patterns

### Unit Tests

**Location:** `test/commands/`
**Purpose:** Test command logic in isolation

```typescript
import {expect, test} from '@oclif/test'

describe('launch', () => {
  test
    .stdout()
    .command(['launch', '--help'])
    .it('shows help', ctx => {
      expect(ctx.stdout).to.contain('Launch Claude Code')
    })
})
```

### Integration Tests

**Location:** `test/integration/`
**Purpose:** Test actual CLI invocation

```typescript
import {execSync} from 'node:child_process'
import {platform} from 'node:os'

const bin = platform() === 'win32'
  ? String.raw`.\bin\dev.cmd`
  : './bin/dev.js'

it('executes command', () => {
  const result = execSync(`${bin} status`, {encoding: 'utf8'})
  expect(result).to.include('expected output')
})
```

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- test/commands/launch.test.ts

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## Code Conventions

### Import Organization (Enforced by ESLint)

```typescript
// 1. Node builtins (with node: prefix)
import {spawn} from 'node:child_process'
import {join} from 'node:path'

// 2. External packages
import {Flags} from '@oclif/core'

// 3. Internal absolute imports (with .js extension)
import BaseCommand from './base.js'
import {getPaiHome} from '../lib/config.js'

// 4. Type imports
import type {LaunchOptions} from '../types/index.js'
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Command files | kebab-case | `launch.ts`, `init/bmad.ts` |
| Command classes | PascalCase | `Launch`, `InitBmad` |
| Flags | camelCase | `debug`, `paiHome`, `quiet` |
| Constants | UPPER_SNAKE_CASE | `EXIT_CODES.SUCCESS` |

### Error Handling

```typescript
import {EXIT_CODES} from '../types/index.js'

// Actionable error format: {what_wrong}. {how_to_fix}
this.error(
  'Claude Code not found. Install with: npm install -g @anthropic-ai/claude-code',
  {exit: EXIT_CODES.ENVIRONMENT_ERROR}
)
```

**Exit Codes:**
- `EXIT_CODES.SUCCESS` (0)
- `EXIT_CODES.GENERAL_ERROR` (1)
- `EXIT_CODES.INVALID_USAGE` (2)
- `EXIT_CODES.ENVIRONMENT_ERROR` (3)

---

## Critical Rules

### MUST

- Extend `BaseCommand` for ALL commands
- Inherit `BaseCommand.baseFlags` in flag definitions
- Use `.js` extension in ALL imports (ESM requirement)
- Add `node:` prefix for Node builtins
- Use `this.error()` instead of `process.exit()`
- Provide both short (`-f`) and long (`--flag`) flag forms
- Follow kebab-case for command file names

### MUST NOT

- Call `process.exit()` directly
- Create `src/utils/` or `src/helpers/` (use `src/lib/`)
- Use `I` prefix on interfaces (`Config` not `IConfig`)
- Skip `.js` extension in imports
- Use Promise chains (use async/await)

---

## Common Development Tasks

### Adding a Shared Library

1. **Create in `src/lib/`:**
```bash
touch src/lib/my-utility.ts
```

2. **Export from `src/lib/index.ts`:**
```typescript
export * from './my-utility.js'
```

3. **Import in commands:**
```typescript
import {myUtility} from '../lib/index.js'
```

### Adding a Flag

```typescript
static override flags = {
  ...BaseCommand.baseFlags,
  myFlag: Flags.string({
    char: 'm',
    description: 'My flag description',
    required: false,
  }),
}
```

### Cross-Platform Paths

```typescript
import {join} from 'node:path'
import {homedir} from 'node:os'

// ✅ CORRECT - Cross-platform
const paiHome = join(homedir(), '.pai')

// ❌ WRONG - Unix-only
const paiHome = `${homedir()}/.pai`
```

---

## Build & Release

### Local Build

```bash
npm run build        # Compile TypeScript
npm run lint         # Check code quality
npm run format       # Auto-format code
```

### Testing Build

```bash
npm run build
./bin/run.js launch --help
```

### Global Install (Testing)

```bash
npm run build
npm install -g .
pai --version
```

---

## Debugging

### Enable Debug Mode

```bash
./bin/dev.js launch --debug
```

### Debug Output Includes

- Resolved PAI_HOME path
- Claude Code version detection
- Compatibility check results
- Spawn arguments and configuration

### VSCode Debugging

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug PAI CLI",
  "program": "${workspaceFolder}/bin/dev.js",
  "args": ["launch", "--debug"]
}
```

---

## Linting & Formatting

### Run Linter

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

### Format Code

```bash
npm run format      # Auto-format with Prettier
```

### Pre-commit Checks

```bash
npm run precommit   # Runs lint + tests
```

---

## Architecture Patterns

### Command Pattern

Each command is self-contained:
- Extends `BaseCommand`
- Auto-registers based on file location
- Testable in isolation

### Shared Library Pattern

Common functionality in `src/lib/`:
- Foundational libraries (config, paths, errors, spawn)
- Feature libraries (debug, output, version)

### Transparent Pass-Through

```typescript
spawn('claude', args, {
  stdio: 'inherit',  // User sees Claude Code directly
  cwd: process.cwd()
})
```

---

## Resources

**Oclif Documentation:**
- Commands: https://oclif.io/docs/commands
- Flags: https://oclif.io/docs/flags
- Testing: https://oclif.io/docs/testing

**Internal Documentation:**
- Architecture: `~/.pai/pai-cli/docs/architecture.md`
- Development Guide: `~/.pai/pai-cli/docs/development-guide.md`
- Project Context: `~/.pai/pai-cli/_bmad-output/project-context.md`

---

**Last Updated:** 2026-01-11
**Canonical Source:** `~/.pai/skills/PaiCli/DevelopmentContext.md`
