# Validate Mapping

**Check mapping files for completeness and correctness.**

## Purpose

Validate that translation mapping files are complete, correct, and ready to use. Catches missing fields, undefined transforms, and structural issues before translation.

## When to Use

- After creating a new mapping file
- After updating an existing mapping
- Before running translation (optional)
- When debugging translation issues
- When adding new platform support

## Steps

### 1. Validate by Mapping Name

If you know the mapping file name:
```bash
bun run $PAI_DIR/.claude/skills/SkillTranslate/Tools/ValidateMappings.ts \
  --mapping claude-windsurf
```

### 2. Validate by Platform Names

If you know source and target platforms:
```bash
bun run $PAI_DIR/.claude/skills/SkillTranslate/Tools/ValidateMappings.ts \
  --from claude-code \
  --to windsurf
```

Both methods check the same mapping file.

### 3. Review Validation Output

The validator checks:
- **Structure** - Required fields present
- **Platform schemas** - Both platforms have schema files
- **Component mappings** - All components properly mapped
- **Field mappings** - Source/target fields specified
- **Directory mappings** - Directory structure defined
- **Transforms** - Referenced transforms are defined
- **Examples** - Example translations provided

### 4. Fix Errors

**Error types:**

**Missing required field:**
```
❌ ERRORS:
   • Missing required field: component_mappings
```
**Fix:** Add missing field to mapping file.

**Platform schema not found:**
```
❌ ERRORS:
   • Source platform schema not found: cursor.yaml
```
**Fix:** Create `Mappings/Platforms/cursor.yaml`.

**Component missing mappings:**
```
❌ ERRORS:
   • Component 'workflow' missing claude or windsurf mapping
```
**Fix:** Add both `claude` and target platform fields to component.

**Field mapping missing source/target:**
```
❌ ERRORS:
   • Field mapping in 'skill_metadata' missing source or target
```
**Fix:** Ensure each field mapping has both source_field and target_field.

### 5. Address Warnings

**Warning types:**

**Missing description:**
```
⚠️  WARNINGS:
   • Component 'tool' missing description
```
**Fix:** Add description field to component (recommended but not required).

**No examples:**
```
⚠️  WARNINGS:
   • No examples provided (recommended for documentation)
```
**Fix:** Add examples array to mapping file.

**Undefined transform:**
```
⚠️  WARNINGS:
   • Transform 'extract_sections' is referenced but not defined
```
**Fix:** Add transform definition or remove reference.

### 6. Review Info

Info messages show what's working:
```
ℹ️  INFO:
   ✓ Source schema found: claude-code
   ✓ Target schema found: windsurf
   ✓ 5 component mappings defined
   ✓ 12 field mappings defined
   ✓ 6 directory mappings defined
   ✓ 4 transforms defined
   ✓ 2 examples provided
```

## Validation Output

**Success:**
```
╔═══════════════════════════════════════════════════════════════╗
║ VALIDATION: claude-windsurf                                   ║
╚═══════════════════════════════════════════════════════════════╝

ℹ️  INFO:
   ✓ Source schema found: claude-code
   ✓ Target schema found: windsurf
   ✓ 5 component mappings defined
   ✓ 12 field mappings defined
   ✓ 6 directory mappings defined
   ✓ 4 transforms defined
   ✓ 2 examples provided

✅ VALIDATION PASSED
```

**Failure:**
```
╔═══════════════════════════════════════════════════════════════╗
║ VALIDATION: claude-cursor                                     ║
╚═══════════════════════════════════════════════════════════════╝

❌ ERRORS:
   • Target platform schema not found: cursor.yaml
   • Missing required field: component_mappings

⚠️  WARNINGS:
   • No examples provided (recommended for documentation)

❌ VALIDATION FAILED
```

## What Gets Validated

### Mapping Structure

Required fields:
- `mapping_version` - Version number (e.g., "1.0")
- `source` - Source platform identifier
- `target` - Target platform identifier
- `bidirectional` - Boolean indicating if mapping works both ways
- `component_mappings` - Component equivalencies
- `field_mappings` - Field-level mappings
- `directory_mappings` - Directory structure mappings

### Platform Schemas

Verifies that schema files exist:
- `Mappings/Platforms/{source}.yaml`
- `Mappings/Platforms/{target}.yaml`

### Component Mappings

Each component must have:
- Source platform field (e.g., `claude`)
- Target platform field (e.g., `windsurf`)
- Description (recommended)

### Field Mappings

Each field mapping must have:
- `source_field` or `source`
- `target_field` or `target`
- Optional: `transform`, `description`, `example`

### Transform Consistency

- All referenced transforms should be defined
- Unused transforms trigger info message

## Continuous Validation

**During Development:**
```bash
# Watch for changes and validate
while true; do
  bun run ValidateMappings.ts --mapping claude-windsurf
  sleep 5
done
```

**In CI/CD:**
```bash
# Exit with error code on failure
bun run ValidateMappings.ts --mapping claude-windsurf
# Exit code 0 = success, 1 = failure
```

## Creating New Mappings

When creating a new platform mapping:

1. **Create platform schema:**
   ```bash
   # Mappings/Platforms/cursor.yaml
   ```

2. **Create mapping file:**
   ```bash
   # Mappings/Translations/claude-cursor.yaml
   ```

3. **Validate early and often:**
   ```bash
   bun run ValidateMappings.ts --mapping claude-cursor
   ```

4. **Fix errors, then warnings:**
   - Start with errors (blocking issues)
   - Then address warnings (quality issues)
   - Use info to verify completeness

5. **Add examples:**
   ```yaml
   examples:
     - name: "Simple skill translation"
       input: { platform: claude-code, skill: MySkill }
       output: { platform: cursor, plugin: my-skill }
   ```

6. **Final validation:**
   ```bash
   bun run ValidateMappings.ts --mapping claude-cursor
   ```

Should see: `✅ VALIDATION PASSED`

## Examples

**Example 1: Validate existing mapping**
```bash
bun run ValidateMappings.ts --from claude-code --to windsurf
```

**Example 2: Validate after adding new component**
```bash
# Edit claude-windsurf.yaml to add new component
# Then validate
bun run ValidateMappings.ts --mapping claude-windsurf
```

**Example 3: Validate new platform support**
```bash
# After creating Platforms/cursor.yaml and Translations/claude-cursor.yaml
bun run ValidateMappings.ts --from claude-code --to cursor
```

## References

- `../SKILL.md` - SkillTranslate overview
- `../Mappings/Translations/` - Mapping files
- `../Tools/ValidateMappings.ts` - Validation implementation
- `TranslateSkill.md` - Translation workflow
