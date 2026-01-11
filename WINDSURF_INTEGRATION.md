# Windsurf Integration for BMAD

This document describes the Windsurf IDE integration added to the PAI CLI for BMAD workflows.

## Overview

The PAI CLI `init` command now supports Windsurf IDE in addition to Claude Code. When you run `pai init --method bmad --ide windsurf`, it installs Windsurf-compatible workflow files that enable you to use all BMAD commands directly in Windsurf's Cascade AI.

## What Was Added

### 1. Windsurf Workflow Files
Created `.windsurf/workflows/bmad/` directory structure in `pai-cli/src/templates/bmad/` containing:
- **46 workflow files total** (45 workflows + 1 README)
- All workflows converted from Claude Code command format to Windsurf workflow format
- Organized in same structure as Claude commands: `bmm/` and `core/` categories

### 2. Conversion Script
Created `scripts/convert-bmad-to-windsurf.ts` to automatically convert Claude commands to Windsurf workflows.

**Usage:**
```bash
bun run scripts/convert-bmad-to-windsurf.ts
```

This script:
- Reads all `.md` files from `.claude/commands/bmad/`
- Converts frontmatter to Windsurf format (adds `auto_execution_mode: 1`)
- Preserves all workflow instructions and references
- Outputs to `.windsurf/workflows/bmad/` maintaining directory structure

### 3. Documentation
Created comprehensive README at `.windsurf/README.md` explaining:
- How to install and use Windsurf workflows
- List of all available workflows and agents
- Differences between Claude Code and Windsurf formats
- Usage examples

## Installation

### For Claude Code Only (existing behavior)
```bash
pai init --method bmad --ide claude
```
Installs: `_bmad/` + `.claude/`

### For Windsurf Only (new)
```bash
pai init --method bmad --ide windsurf
```
Installs: `_bmad/` + `.windsurf/`

### For Both IDEs (new)
```bash
pai init --method bmad --ide claude --ide windsurf
```
Installs: `_bmad/` + `.claude/` + `.windsurf/`

## How It Works

The template installer (`pai-cli/src/lib/template-installer.ts`) automatically:
1. Scans template directory for dot folders (`.claude`, `.windsurf`)
2. Maps them to IDE names (`claude`, `windsurf`)
3. Installs only the dot folders matching the `--ide` flags
4. Always installs non-dot folders (`_bmad/`)

This means adding `.windsurf/` to the template required **no code changes** - the installer automatically detected and integrated it!

## Workflow Format

### Claude Code Format
```markdown
---
description: 'Workflow description'
---

IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @_bmad/bmm/workflows/...
```

### Windsurf Format
```markdown
---
description: Workflow description
auto_execution_mode: 1
---

IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND: LOAD the FULL @_bmad/bmm/workflows/...
```

**Key Differences:**
1. No quotes around description value in Windsurf
2. Added `auto_execution_mode: 1` for Windsurf
3. Workflow body/instructions remain identical

## Available Workflows

### Agents (9 total)
- `/analyst` - Business Analyst
- `/architect` - Software Architect
- `/dev` - Developer
- `/pm` - Product Manager
- `/sm` - Scrum Master
- `/tea` - Test Engineering Architect
- `/tech-writer` - Technical Writer
- `/ux-designer` - UX Designer
- `/quick-flow-solo-dev` - Solo Developer
- `/bmad-master` - BMAD Master (core)

### Workflows (35 total)

**Analysis & Planning:**
- `/create-product-brief` - Product discovery
- `/create-prd` - Product requirements
- `/research` - Market/technical research

**Design:**
- `/create-architecture` - System architecture
- `/create-ux-design` - UX specifications
- `/create-tech-spec` - Technical specifications
- `/create-excalidraw-dataflow` - Dataflow diagrams
- `/create-excalidraw-diagram` - General diagrams
- `/create-excalidraw-flowchart` - Flowcharts
- `/create-excalidraw-wireframe` - Wireframes

**Implementation:**
- `/create-epics-and-stories` - Story creation
- `/dev-story` - Story development
- `/code-review` - Adversarial code review
- `/sprint-planning` - Sprint planning
- `/sprint-status` - Sprint tracking
- `/quick-dev` - Quick development flow
- `/check-implementation-readiness` - Pre-implementation check
- `/correct-course` - Course correction

**Testing (TestArch):**
- `/testarch-atdd` - Acceptance Test-Driven Development
- `/testarch-automate` - Test automation
- `/testarch-ci` - CI integration
- `/testarch-framework` - Test framework setup
- `/testarch-nfr` - Non-functional requirements
- `/testarch-test-design` - Test design
- `/testarch-test-review` - Test review
- `/testarch-trace` - Traceability

**Documentation:**
- `/document-project` - Project documentation
- `/generate-project-context` - Context generation

**Workflow Management:**
- `/workflow-init` - Initialize workflow
- `/workflow-status` - Check workflow status

**Core Workflows:**
- `/brainstorming` - Brainstorming sessions
- `/party-mode` - Fun collaborative mode
- `/index-docs` - Documentation indexing

## Testing

To test the Windsurf integration:

1. **Install to a test project:**
   ```bash
   cd /path/to/test-project
   pai init --method bmad --ide windsurf
   ```

2. **Verify installation:**
   ```bash
   ls -la .windsurf/workflows/bmad/
   ```
   Should show: `bmm/`, `core/`, `README.md`

3. **Open in Windsurf IDE:**
   - Windsurf should automatically detect workflows in `.windsurf/workflows/`
   - Test invoking a workflow: `/analyst` or `/code-review`

4. **Verify workflow execution:**
   - Workflow should load `_bmad/` files and execute BMAD methodology
   - Check that references to `@_bmad/` files resolve correctly

## File Structure

```
pai-cli/src/templates/bmad/
├── .claude/                    # Claude Code commands
│   └── commands/
│       └── bmad/
│           ├── bmm/
│           │   ├── agents/     # 9 agent files
│           │   └── workflows/  # 31 workflow files
│           └── core/
│               ├── agents/     # 1 agent file
│               ├── tasks/      # 1 task file
│               └── workflows/  # 2 workflow files
│
├── .windsurf/                  # NEW - Windsurf workflows
│   ├── README.md               # Documentation
│   └── workflows/
│       └── bmad/
│           ├── bmm/
│           │   ├── agents/     # 9 agent files
│           │   └── workflows/  # 31 workflow files
│           └── core/
│               ├── agents/     # 1 agent file
│               ├── tasks/      # 1 task file
│               └── workflows/  # 2 workflow files
│
└── _bmad/                      # Shared BMAD resources
    ├── bmm/                    # BMAD Method Module
    └── core/                   # Core resources
```

## Maintenance

When updating BMAD workflows:

1. Update the source files in `.claude/commands/bmad/`
2. Regenerate Windsurf workflows:
   ```bash
   bun run scripts/convert-bmad-to-windsurf.ts
   ```
3. Test in both Claude Code and Windsurf
4. Commit all changes

## Benefits

1. **Cross-IDE Compatibility**: Use BMAD in both Claude Code and Windsurf
2. **Same Methodology**: Both IDEs reference the same `_bmad/` resources
3. **Automatic Sync**: Conversion script ensures Windsurf workflows stay in sync
4. **No Code Changes**: Template installer automatically handles new IDE
5. **User Choice**: Developers can choose their preferred IDE

## Known Limitations

1. Windsurf workflows have 12,000 character limit per file (current files are well within this)
2. Workflow names must be unique across all `.windsurf/workflows/` locations
3. Some Windsurf-specific features (like advanced step definitions) are not used yet

## Future Enhancements

1. Add Windsurf-specific workflow features (conditional steps, loops)
2. Create Windsurf-specific agents optimized for Cascade
3. Add IDE-specific customizations while maintaining core compatibility
4. Support other IDEs (Cursor, VS Code with Copilot, etc.)

## References

- [Windsurf Workflows Documentation](https://docs.windsurf.com/windsurf/cascade/workflows)
- [PAI CLI Repository](https://github.com/jofu-tofu/pai-cli)
- [BMAD Methodology](https://github.com/jofu-tofu/bmad)
