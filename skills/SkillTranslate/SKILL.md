---
name: SkillTranslate
description: Translate skills and workflows between systems (Claude Code, Windsurf, Cursor, etc). USE WHEN translate skill, convert workflow, map to windsurf, cross-platform skill, skill equivalents.
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# SkillTranslate - Cross-Platform Skill Translation

**Invoke when:** Converting skills between platforms, showing platform equivalents, understanding cross-system mappings, translating workflows.

## Overview

SkillTranslate provides a declarative, maintainable system for translating skills and workflows between different AI coding assistant platforms:
- **Claude Code** ↔ **Windsurf** (with hooks support!)
- **Claude Code** ↔ **Cursor** (future)
- Easily extensible to new platforms via Universal Intermediate Format (UIF)

**New in v1.0:**
- ✅ Hub-and-spoke architecture (linear scaling, not quadratic!)
- ✅ Lifecycle hooks translation (settings.json ↔ hooks.json)
- ✅ Universal Intermediate Format for platform-agnostic representation

## Architecture

### 1. Platform Schemas (`Mappings/Platforms/`)
Define the structure of each platform's skill system:
- Directory layout
- File formats
- Required/optional components
- Metadata fields

### 2. Translation Mappings (`Mappings/Translations/`)
Bidirectional mappings between platforms:
- Component equivalencies (skill → cascade, workflow → flow)
- Field mappings (name → cascadeName)
- Directory structure mappings
- Semantic concept translations

### 3. Translation Tools (`Tools/`)
Executable engines for translation:
- **TranslateSkill.ts** - Main translation engine
- **ShowMappings.ts** - Visual display of equivalents
- **ValidateMappings.ts** - Completeness checker

## Workflow Routing

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **TranslateSkill** | "translate skill to X", "convert to windsurf" | Translate complete skill |
| **ShowEquivalents** | "show mappings", "what's the windsurf equivalent" | Display platform mappings |
| **ValidateMapping** | "validate translation", "check completeness" | Verify mapping coverage |

## Quick Start

**Translate a skill to Windsurf:**
```bash
bun run $PAI_DIR/.claude/skills/SkillTranslate/Tools/TranslateSkill.ts \
  --skill UpdatePAI \
  --from claude-code \
  --to windsurf \
  --output ~/windsurf-skills/
```

**Show platform equivalents:**
```bash
bun run $PAI_DIR/.claude/skills/SkillTranslate/Tools/ShowMappings.ts \
  --from claude-code \
  --to windsurf
```

**Validate mapping completeness:**
```bash
bun run $PAI_DIR/.claude/skills/SkillTranslate/Tools/ValidateMappings.ts \
  --mapping claude-windsurf
```

## Key Principles

1. **Hub-and-Spoke** - All platforms map to/from UIF (linear growth: N platforms = N mappings)
2. **Declarative** - Mappings are data (YAML), not code
3. **Bidirectional** - Translate in both directions
4. **Extensible** - Add new platforms by adding mapping files
5. **Maintainable** - Clear visual mappings, easy to update
6. **Validated** - Automated checks for completeness
7. **Hooks-Aware** - Translates lifecycle hooks between platforms

## Hub-and-Spoke Architecture

**Problem:** Direct platform-to-platform mappings grow quadratically (N² problem)
- 3 platforms = 3 mappings
- 5 platforms = 10 mappings
- 10 platforms = 45 mappings ❌

**Solution:** Universal Intermediate Format (UIF) as central hub
- N platforms = N mappings ✅
- Add new platform = add 1 file
- Maintainable and scalable

**How it works:**
```
Source Platform → UIF → Target Platform
   (parse)      (convert)    (generate)
```

## Platform Schemas

Each platform has a schema file defining its structure:

**Claude Code** (`Platforms/claude-code.yaml`):
- SKILL.md with frontmatter
- Workflows/ directory
- Tools/ directory (TypeScript)
- Templates/ directory (Handlebars)
- Hooks in settings.json (NOT frontmatter!)

**Windsurf** (`Platforms/windsurf.yaml`):
- cascade.yaml metadata file
- flows/ directory
- commands/ directory
- templates/ directory
- Hooks in .windsurf/hooks.json (NOT frontmatter!)

**Universal Intermediate Format** (`UniversalFormat.yaml`):
- Platform-agnostic schema
- Snake_case naming convention
- All platforms map to/from this
- See README.md for full hook event mappings

## Translation Mappings

Mappings connect platform concepts:

```yaml
component_mappings:
  skill:
    claude: "Skill (SKILL.md)"
    windsurf: "Cascade (cascade.yaml)"

  workflow:
    claude: "Workflow (Workflows/*.md)"
    windsurf: "Flow (flows/*.yaml)"
```

## Examples

**Example 1: Translate UpdatePAI skill to Windsurf**
```
User: "Translate the UpdatePAI skill to Windsurf format"
→ Reads UpdatePAI/SKILL.md
→ Applies claude-windsurf mapping
→ Generates cascade.yaml + flows/
→ Outputs to windsurf-skills/UpdatePAI/
```

**Example 2: Show what a workflow maps to**
```
User: "What's the Windsurf equivalent of a Claude workflow?"
→ Shows: Workflow (Workflows/*.md) → Flow (flows/*.yaml)
→ Displays field mappings
→ Shows example transformation
```

**Example 3: Add support for Cursor**
```
User: "Add Cursor platform support"
→ Create Platforms/cursor.yaml
→ Create Translations/claude-cursor.yaml
→ Define component and field mappings
→ Translation engine automatically supports it
```

## Visual Mapping Display

The ShowMappings tool displays clear equivalencies:

```
┌─────────────────────────────────────────────────────────────┐
│ CLAUDE CODE → WINDSURF MAPPINGS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Skill (SKILL.md)             →  Cascade (cascade.yaml)     │
│   ├─ name                    →    cascadeName              │
│   └─ description             →    summary                  │
│                                                             │
│ Workflow (Workflows/*.md)    →  Flow (flows/*.yaml)        │
│   ├─ # Workflow Name         →    flowName                 │
│   └─ ## Steps                →    steps[]                  │
│                                                             │
│ Tool (Tools/*.ts)            →  Command (commands/*.ts)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Extending to New Platforms

To add a new platform (e.g., Cursor):

1. **Create platform schema:**
   - `Mappings/Platforms/cursor.yaml`
   - Define structure, file formats, fields

2. **Create translation mapping:**
   - `Mappings/Translations/claude-cursor.yaml`
   - Map components and fields

3. **Test translation:**
   - Run TranslateSkill with new platform
   - Validate output structure

The translation engine automatically supports new platforms when schemas are added.

## Use Cases

1. **Cross-platform skill sharing** - Share skills between Claude Code and Windsurf users
2. **Platform migration** - Move entire skill library to new platform
3. **Understanding equivalents** - Learn how concepts map across platforms
4. **Maintaining parallel versions** - Keep skills in sync across platforms
5. **Documentation** - Show "Windsurf equivalent" in skill docs

## References

- `Mappings/Platforms/` - Platform schema definitions
- `Mappings/Translations/` - Bidirectional mapping files
- `Tools/TranslateSkill.ts` - Main translation engine implementation
