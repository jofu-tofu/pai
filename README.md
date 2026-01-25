# PAI - Personal AI Infrastructure

A personal AI infrastructure layer for Claude Code that adds hooks, skills, and more.

---

**⚠️ DEVELOPMENT WORKTREE NOTICE**

This is the **Memory System Development Worktree** (`pai-memory-work` branch).

**For Memory System Development:**
- See **[DEVELOPMENT.md](./DEVELOPMENT.md)** for setup instructions
- **CRITICAL:** Set `PAI_DIR` to repo root before testing: `$env:PAI_DIR = $PWD.Path` (PowerShell) or `export PAI_DIR="$(pwd)"` (Bash)
- Story artifacts in `_bmad-output/implementation-artifacts/`

**For Main PAI Documentation:** See below

---

## Quick Install

```bash
# Clone the repository (default location: $HOME/pai)
git clone https://github.com/jofu-tofu/pai.git $HOME/pai

# Run setup
cd $HOME/pai && bun run scripts/setup.ts
```

## Prerequisites

- **Bun** (v1.0+) - [Install Bun](https://bun.sh)
- **Claude Code** - [Install Claude Code](https://claude.ai/code)
- **Git** (optional) - For version control

## Manual Setup

If the setup script doesn't work, follow these steps:

### 1. Set Environment Variable

Add `PAI_DIR` to your shell profile:

**Bash/Zsh (~/.bashrc or ~/.zshrc):**
```bash
export PAI_DIR="$HOME/pai"
```

**PowerShell ($PROFILE):**
```powershell
$env:PAI_DIR = "$HOME\pai"
```

**Windows (System Environment Variables):**
- Search "Environment Variables" in Start menu
- Add `PAI_DIR` with value `C:\Users\<YOUR_USERNAME>\pai`

### 2. Install Dependencies

```bash
cd $PAI_DIR/hooks && bun install
cd $PAI_DIR/skills/Prompting/Tools && bun install
```

### 3. Configure Claude Code Hooks

**Option A: Run Claude from PAI directory**

Claude Code automatically uses `.claude/settings.json` when you run from the PAI directory:

```bash
cd ~/pai && claude
```

**Option B: Copy hooks to global settings**

Merge the hooks from `pai/.claude/settings.json` into your global Claude settings.

### 4. Verify Installation

```bash
bun run scripts/setup.ts doctor
```

## Setup Scripts

| Command | Description |
|---------|-------------|
| `bun run scripts/setup.ts` | Install/setup PAI |
| `bun run scripts/setup.ts doctor` | Diagnose issues |
| `bun run scripts/setup.ts fix` | Auto-fix issues (install deps, create junctions) |

## What `fix` Does

- Creates missing directories
- Installs node dependencies (`bun install`)
- Creates junction: `.claude/skills` → `skills` (so Claude finds skills when run from PAI directory)

## Directory Structure

```
$PAI_DIR/
├── .claude/           # Claude Code project settings (hooks config)
├── hooks/             # Hook scripts (security, session tracking, etc.)
├── skills/            # AI skills and workflows
│   ├── CORE/          # Core identity and preferences
│   ├── CreateSkill/   # Skill creation utilities
│   ├── Prompting/     # Meta-prompting system
│   ├── UpdateSkill/   # Skill modification utilities
│   ├── UpdatePAI/     # PAI system updater
│   ├── Upgrades/      # Upgrade opportunity tracking
│   └── Agents/        # Dynamic agent composition
├── tools/             # MCP tools and utilities
├── MEMORY/            # Memory system storage (gitignored)
├── history/           # Session history and learnings (gitignored)
├── agentic_logs/      # Success/error logs (gitignored)
├── voice/             # Voice/audio output (gitignored)
└── scripts/           # Setup and utility scripts
```

## Features

### Hooks

- **Security Validator** - Blocks dangerous commands (rm -rf /, reverse shells, etc.)
- **Session Summary Capture** - Captures session summaries and learnings at SessionEnd
- **Event Capture** - Records all tool calls and session events (all hook types)
- **Tab Title Updates** - Updates terminal tab with current task
- **Temporary File Cleanup** - Cleans up tmpclaude-* files before each prompt
- **Session Initialization** - Sets up session tracking and environment
- **CORE Context Loading** - Loads CORE skill at session start

### Skills

- **CORE** - Identity, preferences, and response format
- **Prompting** - Meta-prompting and template system
- **CreateSkill** - Skill creation utilities and validation
- **UpdateSkill** - Skill modification and maintenance
- **UpdatePAI** - Fully autonomous PAI system updater
- **Upgrades** - Track PAI upgrade opportunities
- **Agents** - Dynamic agent composition and management

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PAI_DIR` | PAI installation directory | `$HOME/pai` |
| `TIME_ZONE` | Local timezone | System default |
| `DA` | Assistant name | `Tofu` |

### Customizing CORE

Edit `skills/CORE/SKILL.md` to customize:
- Assistant name and identity
- Response format
- Personality traits
- Stack preferences

## Troubleshooting

### Hooks not firing

1. Ensure `PAI_DIR` is set: `echo $PAI_DIR`
2. Run doctor: `bun run scripts/setup.ts doctor`
3. Check Claude is using project settings (run from `$PAI_DIR`)

### Permission errors on Windows

Run PowerShell as Administrator and set execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Tests failing

```bash
cd $PAI_DIR/hooks && bun test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests: `cd hooks && bun test`
5. Submit a pull request

## License

MIT
