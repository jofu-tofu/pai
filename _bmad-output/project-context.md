---
project_name: 'PAI CLI'
user_name: 'Josh'
date: '2026-01-08'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'anti_patterns']
status: 'complete'
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code for PAI CLI. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Framework:** Oclif (CLI framework by Salesforce)
- **Language:** TypeScript (strict mode)
- **Module System:** ESM (`"type": "module"`)
- **Runtime:** Node.js 18+ (LTS)
- **Testing:** Mocha + @oclif/test
- **Linting:** ESLint + Prettier

## Critical Implementation Rules

### Oclif Command Patterns

- Commands live in `src/commands/` - filename = command name
- Subdirectories = topics (`src/commands/init/bmad.ts` → `pai init bmad`)
- Extend `Command` from `@oclif/core`
- Use `Flags` from `@oclif/core` for flag definitions
- Never call `process.exit()` directly - use `this.error(msg, { exit: code })`

### TypeScript & ESM Rules

- Use `node:` prefix for Node builtins: `import { spawn } from 'node:child_process'`
- File extensions required in imports: `import { config } from './config.js'`
- Async/await only - no Promise chains
- No `I` prefix on interfaces: `Config` not `IConfig`

### Import Organization (Strict Order)

```typescript
// 1. Node builtins (with node: prefix)
import { spawn } from 'node:child_process'

// 2. External packages
import { Command, Flags } from '@oclif/core'

// 3. Internal absolute imports
import { getPaiHome } from '../lib/config.js'

// 4. Relative imports
import type { LaunchOptions } from './types.js'
```

### Project Structure Rules

- `src/commands/` - Oclif command files only
- `src/lib/` - Internal library code (config, paths, spawn, errors)
- `src/types/` - Shared type definitions
- `test/` - Mirrors src/ structure
- Never put utilities in `src/utils/` or `src/helpers/` - use `src/lib/`

### Error Handling Rules

- Use categorized exit codes from `EXIT_CODES` constant:
  - `0` = Success
  - `1` = General error
  - `2` = Invalid usage/arguments
  - `3` = Environment/prerequisite error
- Error messages must be actionable: `Error: {what_wrong}. {how_to_fix}.`
- Errors go to stderr, data to stdout

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `config-resolver.ts` |
| Classes | PascalCase | `ConfigResolver` |
| Interfaces | PascalCase (no I) | `Config`, `LaunchOptions` |
| Functions | camelCase | `getPaiHome()` |
| Constants | UPPER_SNAKE | `EXIT_CODES.SUCCESS` |

### Testing Rules

- Unit tests mirror src/ structure in `test/`
- Integration tests in `test/integration/`
- Mock `child_process.spawn` in unit tests
- Test files use `.test.ts` suffix
- Target 100% coverage for MVP core features

### Configuration Resolution

- Default location: `~/.pai`
- Override via `PAI_HOME` environment variable
- Use `os.homedir()` for cross-platform home directory
- Use `path.join()` for all path construction

### Critical Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| `process.exit(1)` | `this.error(msg, { exit: EXIT_CODES.GENERAL_ERROR })` |
| `import { x } from './file'` | `import { x } from './file.js'` (ESM requires extension) |
| `src/utils/` or `src/helpers/` | `src/lib/` |
| Raw exit code numbers | `EXIT_CODES.SUCCESS`, `EXIT_CODES.GENERAL_ERROR` |
| `.then().catch()` chains | `async/await` with `try/catch` |
| `IConfig` interface | `Config` interface |

---

**Reference:** See `_bmad-output/planning-artifacts/architecture.md` for complete architectural decisions.
