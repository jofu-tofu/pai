# Show Equivalents

**Display visual mappings between platform concepts.**

## Purpose

Show clear, visual representation of how components, fields, and directories map between platforms. Helps understand equivalencies before translation.

## When to Use

- Learning how platforms relate to each other
- Before translating a skill (preview what will happen)
- Documenting cross-platform equivalents
- Understanding field transformations

## Steps

### 1. Show All Mappings

Display complete mapping between platforms:
```bash
bun run $PAI_DIR/skills/SkillTranslate/Tools/ShowMappings.ts \
  --from claude-code \
  --to windsurf
```

**Output includes:**
- Component mappings (Skill → Cascade, Workflow → Flow)
- Field mappings (name → cascadeName with transforms)
- Directory structure mappings
- Example transformations

### 2. Show Specific Component

Focus on a single component type:
```bash
bun run $PAI_DIR/skills/SkillTranslate/Tools/ShowMappings.ts \
  --from claude-code \
  --to windsurf \
  --component workflow
```

**Available components:**
- `skill` - Skill/cascade metadata
- `workflow` - Workflow/flow definitions
- `tool` - Tool/command executables
- `template` - Template files
- `data` - Data/config files

### 3. Understand Field Transformations

The display shows:
- **Source field** - Field name in source platform
- **Target field** - Field name in target platform
- **Transform** - Function applied (e.g., to_kebab_case)
- **Example** - Before/after values

Example output:
```
┌─────────────────────────────────────────────────────────────┐
│ CLAUDE CODE → WINDSURF MAPPINGS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Skill (SKILL.md)             →  Cascade (cascade.yaml)     │
│   ├─ name                    →    cascadeName              │
│   │   (transform: to_kebab_case)                           │
│   │   Claude: "UpdatePAI"                                  │
│   │   Windsurf: "update-pai"                               │
│   └─ description             →    summary                  │
│                                                             │
│ Workflow (Workflows/*.md)    →  Flow (flows/*.yaml)        │
│   ├─ # Workflow Name         →    flowName                 │
│   └─ ## Steps                →    steps[]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Understanding the Display

### Component Mappings Section

Shows high-level equivalencies:
- What a "Skill" in Claude Code becomes in Windsurf
- What a "Workflow" maps to
- What "Tools" are called in target platform

### Field Mappings Section

Shows how metadata fields transform:
- Field name changes (name → cascadeName)
- Data transformations (TitleCase → kebab-case)
- Structure changes (string → array for triggers)

### Directory Mappings Section

Shows file system structure changes:
- SKILL.md → cascade.yaml
- Workflows/ → flows/
- Tools/ → commands/

## Use Cases

**Use Case 1: Learning Platform Differences**
```bash
# Understand how Windsurf differs from Claude Code
bun run ShowMappings.ts --from claude-code --to windsurf

# Focus on workflows
bun run ShowMappings.ts --from claude-code --to windsurf --component workflow
```

**Use Case 2: Before Translation**
```bash
# Preview what will happen before translating
bun run ShowMappings.ts --from claude-code --to windsurf

# Then translate
bun run TranslateSkill.ts --skill MySkill --from claude-code --to windsurf
```

**Use Case 3: Documentation**
```bash
# Generate mapping documentation
bun run ShowMappings.ts --from claude-code --to windsurf > mappings.txt
```

**Use Case 4: Reverse Understanding**
```bash
# If mapping is bidirectional, show reverse
bun run ShowMappings.ts --from windsurf --to claude-code
```

## Examples in Output

The display includes examples from the mapping file:

```
EXAMPLES:
─────────

Simple skill translation:
  Input (claude-code):  UpdatePAI
  Output (windsurf):    update-pai

Workflow to flow:
  Input (claude-code):  Workflows/TranslateSkill.md
  Output (windsurf):    flows/translate-skill.yaml
```

## Adding Custom Mappings

To add new platform mappings for display:

1. **Create platform schema:**
   ```yaml
   # Mappings/Platforms/cursor.yaml
   platform: cursor
   version: 1.0
   # ... define structure
   ```

2. **Create translation mapping:**
   ```yaml
   # Mappings/Translations/claude-cursor.yaml
   source: claude-code
   target: cursor
   component_mappings:
     skill:
       claude: "Skill (SKILL.md)"
       cursor: "Plugin (plugin.json)"
   # ... define mappings
   ```

3. **Show new mappings:**
   ```bash
   bun run ShowMappings.ts --from claude-code --to cursor
   ```

## References

- `../SKILL.md` - SkillTranslate overview
- `../Mappings/Translations/` - Mapping definitions
- `../Tools/ShowMappings.ts` - Display tool implementation
- `TranslateSkill.md` - Translation workflow
