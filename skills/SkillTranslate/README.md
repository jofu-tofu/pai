# SkillTranslate - Architecture Documentation

**Cross-platform skill translation system with declarative mappings.**

## Overview

SkillTranslate provides a maintainable, extensible architecture for translating skills and workflows between different AI coding assistant platforms (Claude Code, Windsurf, Cursor, etc.).

## Design Principles

### 1. Declarative Over Imperative

**Principle:** Mappings are data (YAML), not code.

**Why:** Easier to maintain, understand, and extend. Non-developers can contribute mappings.

**Implementation:** Platform schemas and translation mappings are pure YAML declarations.

### 2. Bidirectional by Design

**Principle:** Translations work in both directions.

**Why:** Share skills between platforms without lock-in.

**Implementation:** Single mapping file supports both directions with `bidirectional: true`.

### 3. Extensible Without Code Changes

**Principle:** Add new platforms without modifying core engine.

**Why:** Scales to N platforms without growing code complexity.

**Implementation:** Translation engine reads schemas dynamically. Adding a platform = adding YAML files.

### 4. Visual Understanding

**Principle:** Clear display of what maps to what.

**Why:** Users need to understand equivalencies before translation.

**Implementation:** ShowMappings tool provides formatted visual display.

### 5. Validated Correctness

**Principle:** Catch errors in mappings before translation.

**Why:** Better dev experience, faster iteration.

**Implementation:** ValidateMappings tool checks structure, completeness, and consistency.

## Hub-and-Spoke Architecture (v1.0+)

**Problem Solved:** The original architecture required N*(N-1)/2 direct mapping files between platforms, growing quadratically. With 5 platforms, you'd need 10 mapping files!

**Solution:** Hub-and-spoke model with Universal Intermediate Format (UIF) as the central hub.

```
   Platform A ←→ UIF ←→ Platform B
       ↑           ↑           ↑
       └───────────┼───────────┘
           Platform C
```

**Benefits:**
- **Linear growth:** For N platforms, only N mapping files needed (+ 1 UIF schema)
- **Single source of truth:** UIF defines all concepts once
- **Easy extensibility:** Add new platform = add 1 mapping file
- **Maintainable:** Changes to translation logic happen in 1 place

**Translation Flow:**
1. **Source → UIF:** Read source platform skill, convert to UIF representation
2. **UIF → Target:** Read UIF representation, generate target platform skill

**Example:** Claude Code → Windsurf
```
Claude Skill → UIF representation → Windsurf Cascade
     (parse claude-code-uif.yaml)     (generate from windsurf-uif.yaml)
```

**Backward Compatibility:** Direct mappings (claude-code-windsurf.yaml) still work but are deprecated.

## Architecture Components

### 0. Universal Intermediate Format (`Mappings/UniversalFormat.yaml`)

**Purpose:** Platform-agnostic schema that all platforms map to/from.

**Contents:**
- **metadata** - Skill/cascade name, description, triggers
- **workflows** - Executable sequences (platform-neutral)
- **tools** - Commands/utilities (runtime-agnostic)
- **hooks** - Lifecycle hooks (generic event types)
- **templates** - Dynamic content generation
- **data** - Configuration files
- **agents** - Agent definitions

**Why UIF?**
- Captures ALL concepts from ALL platforms
- Uses snake_case for neutrality
- Extensible for new platform concepts
- Single place to document cross-platform equivalencies

## Hooks Support (v1.0+)

**New Feature:** SkillTranslate now supports translating lifecycle hooks between platforms!

**Important:** Hooks are NOT in frontmatter for either platform:
- **Claude Code:** Hooks defined in `settings.json` or `.claude/settings.json`
- **Windsurf:** Hooks defined in `.windsurf/hooks.json`

**Hook Translation Process:**
1. Read hooks from platform-specific config file
2. Convert to UIF generic hook events
3. Map UIF events to target platform hook types
4. Generate target platform hooks config

**Supported Hook Events:**

| UIF Event | Claude Code | Windsurf |
|-----------|-------------|----------|
| session_start | SessionStart | ❌ (no equivalent) |
| session_end | SessionEnd | ❌ (no equivalent) |
| user_prompt_pre | ❌ | pre_user_prompt |
| user_prompt_submit | UserPromptSubmit | ❌ |
| pre_file_read | PreToolUse (Read) | pre_read_code |
| post_file_read | PostToolUse (Read) | post_read_code |
| pre_file_write | PreToolUse (Edit/Write) | pre_write_code |
| post_file_write | PostToolUse (Edit/Write) | post_write_code |
| pre_command | PreToolUse (Bash) | pre_run_command |
| post_command | PostToolUse (Bash) | post_run_command |
| pre_tool_use | PreToolUse (*) | pre_mcp_tool_use |
| post_tool_use | PostToolUse (*) | post_mcp_tool_use |
| agent_response_complete | Stop | post_cascade_response |
| agent_stop | SubagentStop | ❌ |

**Example Hook Translation:**

Claude Code settings.json:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "validate-command.sh"
          }
        ]
      }
    ]
  }
}
```

→ UIF:
```yaml
hooks:
  - event: pre_command
    matcher: "command:*"
    command: "validate-command.sh"
    can_block: true
```

→ Windsurf .windsurf/hooks.json:
```json
{
  "hooks": {
    "pre_run_command": [
      {
        "command": "validate-command.sh",
        "show_output": true
      }
    ]
  }
}
```

**Limitations:**
- Hooks without platform equivalents are documented but not translated
- Some platforms have unique hook features (Claude matchers, Windsurf blocking)
- Translation preserves intent but may lose platform-specific features

### 1. Platform Schemas (`Mappings/Platforms/`)

**Purpose:** Define the structure of each platform's skill system.

**Schema Contents:**
- Directory structure (required/optional components)
- File formats (markdown, YAML, TypeScript)
- Naming conventions (TitleCase, kebab-case)
- Component metadata
- Field definitions

**Example:**
```yaml
platform: claude-code
structure:
  skill_root:
    required: [SKILL.md]
    optional: [Workflows/, Tools/]
  skill_metadata:
    file: SKILL.md
    format: markdown-frontmatter
    required_fields: [name, description]
```

**Adding a Platform:**
1. Create `Platforms/{platform-name}.yaml`
2. Define structure, components, naming conventions
3. No code changes required

### 2. Translation Mappings (`Mappings/Translations/`)

**Purpose:** Define how components, fields, and directories map between platforms.

**Mapping Contents:**
- Component mappings (Skill → Cascade)
- Field mappings (name → cascadeName)
- Directory mappings (Workflows/ → flows/)
- Transform functions (TitleCase → kebab-case)
- Examples

**Example:**
```yaml
component_mappings:
  skill:
    claude: "Skill (SKILL.md)"
    windsurf: "Cascade (cascade.yaml)"

field_mappings:
  skill_metadata:
    - source_field: name
      target_field: cascadeName
      transform: to_kebab_case
```

**Adding a Mapping:**
1. Create `Translations/{source}-{target}.yaml`
2. Define component, field, directory mappings
3. Add transform functions if needed
4. Validate with ValidateMappings tool

### 3. Translation Engine (`Tools/TranslateSkill.ts`)

**Purpose:** Core engine that performs translations.

**Process:**
1. Load source and target platform schemas
2. Load translation mapping
3. Parse source skill structure
4. Apply component mappings
5. Apply field transformations
6. Generate target structure
7. Write output files

**Key Functions:**
- `loadPlatformSchema()` - Read platform definitions
- `loadTranslationMapping()` - Read mapping rules
- `parseClaudeSkill()` - Parse source skill
- `generateWindsurfCascade()` - Generate target metadata
- `translateWorkflowToFlow()` - Transform workflows

**Extensibility:** Engine is platform-agnostic. All platform-specific logic is in YAML mappings.

### 4. Visual Display (`Tools/ShowMappings.ts`)

**Purpose:** Show clear visual representation of platform mappings.

**Display Sections:**
- Component mappings
- Field mappings (with transforms and examples)
- Directory structure mappings
- Translation examples

**Use Cases:**
- Learning platform differences
- Preview before translation
- Documentation generation

### 5. Validation (`Tools/ValidateMappings.ts`)

**Purpose:** Check mapping completeness and correctness.

**Validations:**
- Structure (required fields present)
- Platform schemas exist
- Component mappings complete
- Field mappings have source/target
- Directory mappings defined
- Transforms defined and used
- Examples provided

**Output:**
- ✓ Errors (blocking issues)
- ✓ Warnings (quality issues)
- ✓ Info (statistics)

## Data Flow

```
┌─────────────────┐
│ Platform Schema │
│  (Source)       │
└────────┬────────┘
         │
         ├─────────────┐
         │             │
         ▼             ▼
    ┌────────┐   ┌──────────┐
    │ Source │   │ Mapping  │
    │ Skill  │   │   File   │
    └───┬────┘   └────┬─────┘
        │             │
        └──────┬──────┘
               │
               ▼
        ┌──────────────┐
        │ Translation  │
        │   Engine     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ Target Skill │
        │ (Generated)  │
        └──────────────┘
               │
               ▼
    ┌──────────────────┐
    │ Platform Schema  │
    │   (Target)       │
    └──────────────────┘
```

## Transform System

**Purpose:** Handle naming convention and structure changes.

**Built-in Transforms:**
- `to_kebab_case` - TitleCase → kebab-case
- `to_title_case` - kebab-case → TitleCase
- `extract_trigger_patterns` - Parse "USE WHEN" patterns
- `extract_frontmatter` - Parse markdown frontmatter
- `markdown_to_flow_steps` - Convert MD lists to YAML

**Adding Custom Transforms:**
1. Define in mapping file's `transforms` section
2. Implement in TranslateSkill.ts `transforms` object
3. Reference in field mappings

## Extending the System

### Add a New Platform (e.g., Cursor)

**1. Create Platform Schema:**
```yaml
# Mappings/Platforms/cursor.yaml
platform: cursor
version: 1.0
structure:
  plugin_root:
    required: [plugin.json]
  # ... define structure
```

**2. Create Translation Mapping:**
```yaml
# Mappings/Translations/claude-cursor.yaml
source: claude-code
target: cursor
bidirectional: true
component_mappings:
  skill:
    claude: "Skill (SKILL.md)"
    cursor: "Plugin (plugin.json)"
  # ... define mappings
```

**3. Validate Mapping:**
```bash
bun run ValidateMappings.ts --mapping claude-cursor
```

**4. Test Translation:**
```bash
bun run TranslateSkill.ts --skill TestSkill --from claude-code --to cursor
```

**5. Iterate:**
- Add missing component mappings
- Add field transformations
- Add examples
- Re-validate

### Add a New Component Type

**1. Update Platform Schema:**
```yaml
# Mappings/Platforms/claude-code.yaml
structure:
  agents:
    location: Agents/
    format: markdown
    extension: .md
```

**2. Update Translation Mapping:**
```yaml
# Mappings/Translations/claude-windsurf.yaml
component_mappings:
  agent:
    claude: "Agent (Agents/*.md)"
    windsurf: "Agent (agents/*.yaml)"
```

**3. Extend Translation Engine:**
Add translation logic in `TranslateSkill.ts` if needed.

**4. Validate:**
```bash
bun run ValidateMappings.ts --mapping claude-windsurf
```

## Maintenance

### Updating Mappings

**When to update:**
- Platform structure changes
- New component types added
- Field naming changes
- Transform functions needed

**Process:**
1. Edit mapping YAML file
2. Run validation
3. Fix errors/warnings
4. Test translation
5. Update examples

### Version Management

Mapping files include version:
```yaml
mapping_version: 1.0
```

When making breaking changes:
- Increment version
- Update validation to handle multiple versions
- Provide migration guide

## File Organization

```
SkillTranslate/
├── SKILL.md                          # Skill metadata (frontmatter + doc)
├── README.md                         # Architecture documentation (this file)
│
├── Mappings/                         # All mapping data
│   ├── Platforms/                    # Platform structure definitions
│   │   ├── claude-code.yaml         # Claude Code schema
│   │   └── windsurf.yaml            # Windsurf schema
│   └── Translations/                 # Bidirectional mappings
│       └── claude-windsurf.yaml     # Claude ↔ Windsurf
│
├── Tools/                            # Executable utilities
│   ├── package.json                 # Dependencies
│   ├── TranslateSkill.ts            # Main translation engine
│   ├── ShowMappings.ts              # Visual display
│   └── ValidateMappings.ts          # Validation checker
│
└── Workflows/                        # Usage workflows
    ├── TranslateSkill.md            # Translation workflow
    ├── ShowEquivalents.md           # Display workflow
    └── ValidateMapping.md           # Validation workflow
```

## Design Decisions

### Why YAML for Mappings?

**Alternatives considered:** JSON, TypeScript, DSL

**Decision:** YAML

**Reasons:**
- Human-readable and writable
- Comments supported
- Clean syntax for nested structures
- Standard in config/mapping scenarios
- Easy to diff in version control

### Why Not Programmatic Mappings?

**Alternative:** Functions that define mappings

**Decision:** Declarative YAML

**Reasons:**
- Lower barrier to contribution
- Easier to validate
- Clear visual inspection
- No code execution risk
- Can generate tooling from schemas

### Why Bidirectional in Single File?

**Alternative:** Separate files for each direction

**Decision:** Single bidirectional mapping

**Reasons:**
- Maintains consistency (one source of truth)
- Half the files to maintain
- Easier to see symmetry (or lack thereof)
- Less duplication

### Why Separate Platform Schemas?

**Alternative:** Embed schema in mapping

**Decision:** Separate platform schema files

**Reasons:**
- Reusable across multiple mappings (claude-windsurf, claude-cursor)
- Platform schema is independent concept
- Easier to update platform schema without touching mappings
- Can validate platform independently

## Future Enhancements

### 1. Partial Translation

Support translating just workflows or tools:
```bash
bun run TranslateSkill.ts --skill MySkill --component workflow --from claude-code --to windsurf
```

### 2. Merge Translation

Translate into existing target skill:
```bash
bun run TranslateSkill.ts --skill MySkill --from claude-code --to windsurf --merge
```

### 3. Diff Tool

Show what changed in a translation:
```bash
bun run DiffTranslation.ts --skill MySkill --from claude-code --to windsurf
```

### 4. Reverse Translation

Translate back to verify losslessness:
```bash
bun run ReverseTest.ts --skill MySkill --from claude-code --to windsurf
```

### 5. Multi-Platform

Translate to multiple platforms at once:
```bash
bun run TranslateSkill.ts --skill MySkill --from claude-code --to windsurf,cursor
```

## References

- `SKILL.md` - User-facing skill documentation
- `Mappings/Platforms/` - Platform schema definitions
- `Mappings/Translations/` - Translation mapping files
- `Tools/` - Translation engine implementation
- `Workflows/` - Usage workflow documentation
