# Translate Skill

**Primary workflow for translating skills between platforms.**

## Purpose

Translate a complete skill from one platform to another (e.g., Claude Code → Windsurf) using declarative mapping files. Preserves functionality, workflows, and semantics while adapting to target platform structure.

## When to Use

- Converting a skill to another platform
- Sharing skills across AI coding assistants
- Migrating skill libraries
- Creating parallel platform versions

## Steps

### 1. Verify Source Skill

Ensure the source skill exists and is valid:
```bash
# Check skill exists
ls $PAI_DIR/.claude/skills/SkillName/SKILL.md

# Validate skill structure (if validator available)
bun run $PAI_DIR/.claude/skills/UpdateSkill/Tools/ValidateSkill.ts SkillName
```

### 2. Check Platform Support

Verify that both platforms have schemas defined:
```bash
# List available platforms
ls $PAI_DIR/.claude/skills/SkillTranslate/Mappings/Platforms/

# Check if mapping exists
ls $PAI_DIR/.claude/skills/SkillTranslate/Mappings/Translations/
```

### 3. View Platform Mappings (Optional)

Understand what will be translated:
```bash
bun run $PAI_DIR/.claude/skills/SkillTranslate/Tools/ShowMappings.ts \
  --from claude-code \
  --to windsurf
```

This shows:
- Component equivalencies (Skill → Cascade)
- Field mappings (name → cascadeName)
- Directory structure changes
- Transform functions

### 4. Validate Mapping (Optional)

Ensure the mapping file is complete:
```bash
bun run $PAI_DIR/.claude/skills/SkillTranslate/Tools/ValidateMappings.ts \
  --from claude-code \
  --to windsurf
```

### 5. Run Translation

Execute the translation:
```bash
bun run $PAI_DIR/.claude/skills/SkillTranslate/Tools/TranslateSkill.ts \
  --skill SkillName \
  --from claude-code \
  --to windsurf \
  --output ~/windsurf-skills/
```

**Parameters:**
- `--skill` - Name of skill to translate (e.g., UpdatePAI)
- `--from` - Source platform (e.g., claude-code)
- `--to` - Target platform (e.g., windsurf)
- `--output` - Optional output directory (defaults to skill directory with suffix)

### 6. Review Output

Check the generated files:
```bash
# List generated structure
tree ~/windsurf-skills/skill-name/

# Review main metadata file
cat ~/windsurf-skills/skill-name/cascade.yaml

# Check translated workflows
ls ~/windsurf-skills/skill-name/flows/
```

### 7. Test Target Skill (Platform-Specific)

Test the translated skill in the target platform:

**For Windsurf:**
```bash
# Copy to Windsurf skills directory
cp -r ~/windsurf-skills/skill-name ~/windsurf/cascades/

# Test cascade invocation
windsurf run skill-name
```

### 8. Iterate if Needed

If translation is incomplete:
- Check validation warnings
- Update mapping file with missing mappings
- Re-run translation
- Consider contributing improvements to mappings

## Translation Process

The translation engine:

1. **Loads schemas** - Reads platform structure definitions
2. **Loads mapping** - Gets bidirectional component/field mappings
3. **Parses source** - Reads source skill structure (SKILL.md, workflows, tools)
4. **Transforms metadata** - Converts skill metadata using field mappings
5. **Translates components** - Converts workflows to flows, tools to commands
6. **Applies transforms** - TitleCase → kebab-case, markdown → YAML, etc.
7. **Generates output** - Writes target platform structure

## What Gets Translated

| Component | Claude Code | Windsurf | Transformation |
|-----------|-------------|----------|----------------|
| Metadata | SKILL.md frontmatter | cascade.yaml | Field mapping + transforms |
| Workflows | Workflows/*.md | flows/*.yaml | Markdown → YAML structure |
| Tools | Tools/*.ts | commands/*.ts | File copy + rename |
| Templates | Templates/*.hbs | templates/*.hbs | Direct copy (compatible) |
| Data | Data/*.yaml | config/*.yaml | Direct copy |

## Examples

**Example 1: Translate UpdatePAI to Windsurf**
```bash
bun run TranslateSkill.ts \
  --skill UpdatePAI \
  --from claude-code \
  --to windsurf \
  --output ~/windsurf-skills/
```

Result:
```
~/windsurf-skills/update-pai/
├── cascade.yaml           # From SKILL.md
├── flows/
│   ├── auto-update.yaml  # From Workflows/AutoUpdate.md
│   ├── backup.yaml       # From Workflows/Backup.md
│   └── verify.yaml       # From Workflows/Verify.md
└── commands/
    ├── detect-version.ts # From Tools/DetectVersion.ts
    └── merge-settings.ts # From Tools/MergeSettings.ts
```

**Example 2: Show what will be mapped**
```bash
bun run ShowMappings.ts --from claude-code --to windsurf --component workflow
```

Output shows how workflows map to flows with field transformations.

## Troubleshooting

**Translation fails with "Platform schema not found":**
- Check that platform schema exists in `Mappings/Platforms/`
- Verify platform name matches schema file name

**Translation fails with "Mapping not found":**
- Check that mapping exists in `Mappings/Translations/`
- Try reverse mapping if bidirectional (windsurf-claude.yaml)

**Output missing components:**
- Run validation: `bun run ValidateMappings.ts`
- Check warnings for incomplete mappings
- Update mapping file to include missing components

**Transformed names incorrect:**
- Check transform functions in mapping file
- Verify naming conventions in platform schemas
- Update transforms section if needed

## References

- `../SKILL.md` - SkillTranslate overview
- `../Mappings/Translations/claude-windsurf.yaml` - Mapping definitions
- `../Tools/TranslateSkill.ts` - Translation engine implementation
- `ShowEquivalents.md` - Visual mapping display workflow
