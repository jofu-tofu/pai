#!/usr/bin/env bun

/**
 * ValidateMappings - Completeness checker for translation mappings
 *
 * Validates that mapping files are complete and correct.
 *
 * Usage:
 *   bun run ValidateMappings.ts --mapping claude-windsurf
 *   bun run ValidateMappings.ts --from claude-code --to windsurf
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseYAML } from 'yaml';
import { homedir } from 'os';
import { getEnvVar } from '../../../hooks/core/platform';

// Configuration
const PAI_DIR = getEnvVar('PAI_DIR') || join(homedir(), 'pai');
const MAPPINGS_DIR = join(PAI_DIR, '.claude', 'skills', 'SkillTranslate', 'Mappings');

// Parse CLI arguments
function parseArgs(): { mapping?: string; from?: string; to?: string } {
  const args = process.argv.slice(2);
  const result: any = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    result[key] = value;
  }

  if (!result.mapping && (!result.from || !result.to)) {
    console.error('Usage: ValidateMappings.ts --mapping <name> OR --from <platform> --to <platform>');
    process.exit(1);
  }

  return result as { mapping?: string; from?: string; to?: string };
}

// Validation results
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

// Load mapping
function loadMapping(name: string): any {
  const mappingPath = join(MAPPINGS_DIR, 'Translations', `${name}.yaml`);

  if (!existsSync(mappingPath)) {
    throw new Error(`Mapping file not found: ${name}.yaml`);
  }

  const content = readFileSync(mappingPath, 'utf-8');
  return parseYAML(content);
}

// Load platform schema
function loadPlatformSchema(platform: string): any {
  const schemaPath = join(MAPPINGS_DIR, 'Platforms', `${platform}.yaml`);

  if (!existsSync(schemaPath)) {
    return null;
  }

  const content = readFileSync(schemaPath, 'utf-8');
  return parseYAML(content);
}

// Validate mapping structure
function validateMappingStructure(mapping: any, result: ValidationResult): void {
  const requiredFields = [
    'mapping_version',
    'source',
    'target',
    'bidirectional',
    'component_mappings',
    'field_mappings',
    'directory_mappings'
  ];

  for (const field of requiredFields) {
    if (!mapping[field]) {
      result.errors.push(`Missing required field: ${field}`);
    }
  }

  // Check mapping version
  if (mapping.mapping_version && mapping.mapping_version !== '1.0') {
    result.warnings.push(`Mapping version ${mapping.mapping_version} may not be supported`);
  }
}

// Validate platform schemas exist
function validatePlatformSchemas(mapping: any, result: ValidationResult): void {
  const sourceSchema = loadPlatformSchema(mapping.source);
  const targetSchema = loadPlatformSchema(mapping.target);

  if (!sourceSchema) {
    result.errors.push(`Source platform schema not found: ${mapping.source}.yaml`);
  } else {
    result.info.push(`✓ Source schema found: ${mapping.source}`);
  }

  if (!targetSchema) {
    result.errors.push(`Target platform schema not found: ${mapping.target}.yaml`);
  } else {
    result.info.push(`✓ Target schema found: ${mapping.target}`);
  }
}

// Validate component mappings
function validateComponentMappings(mapping: any, result: ValidationResult): void {
  const components = mapping.component_mappings;

  if (!components || Object.keys(components).length === 0) {
    result.errors.push('No component mappings defined');
    return;
  }

  let validComponents = 0;
  for (const [key, value] of Object.entries(components)) {
    const v = value as any;

    if (!v.claude || !v.windsurf) {
      result.errors.push(`Component '${key}' missing claude or windsurf mapping`);
    } else {
      validComponents++;
    }

    if (!v.description) {
      result.warnings.push(`Component '${key}' missing description`);
    }
  }

  result.info.push(`✓ ${validComponents} component mappings defined`);
}

// Validate field mappings
function validateFieldMappings(mapping: any, result: ValidationResult): void {
  const fieldMappings = mapping.field_mappings;

  if (!fieldMappings || Object.keys(fieldMappings).length === 0) {
    result.warnings.push('No field mappings defined (may be intentional)');
    return;
  }

  let totalFields = 0;
  for (const [section, fields] of Object.entries(fieldMappings)) {
    if (!Array.isArray(fields)) {
      result.errors.push(`Field mapping section '${section}' is not an array`);
      continue;
    }

    for (const field of fields as any[]) {
      const sourceField = field.source_field || field.source;
      const targetField = field.target_field || field.target;

      if (!sourceField || !targetField) {
        result.errors.push(`Field mapping in '${section}' missing source or target`);
      } else {
        totalFields++;
      }
    }
  }

  result.info.push(`✓ ${totalFields} field mappings defined`);
}

// Validate directory mappings
function validateDirectoryMappings(mapping: any, result: ValidationResult): void {
  const dirMappings = mapping.directory_mappings;

  if (!dirMappings || !Array.isArray(dirMappings) || dirMappings.length === 0) {
    result.warnings.push('No directory mappings defined');
    return;
  }

  let validMappings = 0;
  for (const dirMap of dirMappings) {
    if (!dirMap.source || !dirMap.target) {
      result.errors.push('Directory mapping missing source or target');
    } else {
      validMappings++;
    }
  }

  result.info.push(`✓ ${validMappings} directory mappings defined`);
}

// Validate transforms
function validateTransforms(mapping: any, result: ValidationResult): void {
  const transforms = mapping.transforms;

  if (!transforms || Object.keys(transforms).length === 0) {
    result.warnings.push('No transforms defined (may be intentional)');
    return;
  }

  // Check that all referenced transforms are defined
  const definedTransforms = new Set(Object.keys(transforms));
  const referencedTransforms = new Set<string>();

  // Collect referenced transforms from field mappings
  if (mapping.field_mappings) {
    for (const fields of Object.values(mapping.field_mappings)) {
      for (const field of fields as any[]) {
        if (field.transform && field.transform !== 'none') {
          referencedTransforms.add(field.transform);
        }
      }
    }
  }

  // Check for undefined transforms
  for (const transform of referencedTransforms) {
    if (!definedTransforms.has(transform)) {
      result.warnings.push(`Transform '${transform}' is referenced but not defined`);
    }
  }

  // Check for unused transforms
  for (const transform of definedTransforms) {
    if (!referencedTransforms.has(transform)) {
      result.info.push(`  Transform '${transform}' defined but not used`);
    }
  }

  result.info.push(`✓ ${definedTransforms.size} transforms defined`);
}

// Validate examples
function validateExamples(mapping: any, result: ValidationResult): void {
  const examples = mapping.examples;

  if (!examples || !Array.isArray(examples) || examples.length === 0) {
    result.warnings.push('No examples provided (recommended for documentation)');
    return;
  }

  let validExamples = 0;
  for (const example of examples) {
    if (!example.name || !example.input || !example.output) {
      result.warnings.push('Example missing name, input, or output');
    } else {
      validExamples++;
    }
  }

  result.info.push(`✓ ${validExamples} examples provided`);
}

// Main validation function
function validateMapping(name: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  };

  try {
    const mapping = loadMapping(name);

    // Run all validations
    validateMappingStructure(mapping, result);
    validatePlatformSchemas(mapping, result);
    validateComponentMappings(mapping, result);
    validateFieldMappings(mapping, result);
    validateDirectoryMappings(mapping, result);
    validateTransforms(mapping, result);
    validateExamples(mapping, result);

    // Set overall validity
    result.valid = result.errors.length === 0;

  } catch (error) {
    result.valid = false;
    result.errors.push((error as Error).message);
  }

  return result;
}

// Display validation results
function displayResults(name: string, result: ValidationResult): void {
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║ VALIDATION: ${name.padEnd(48)}║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

  // Display errors
  if (result.errors.length > 0) {
    console.log('❌ ERRORS:');
    for (const error of result.errors) {
      console.log(`   • ${error}`);
    }
    console.log();
  }

  // Display warnings
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    for (const warning of result.warnings) {
      console.log(`   • ${warning}`);
    }
    console.log();
  }

  // Display info
  if (result.info.length > 0) {
    console.log('ℹ️  INFO:');
    for (const info of result.info) {
      console.log(`   ${info}`);
    }
    console.log();
  }

  // Overall result
  if (result.valid) {
    console.log('✅ VALIDATION PASSED\n');
  } else {
    console.log('❌ VALIDATION FAILED\n');
  }
}

// Main execution
if (import.meta.main) {
  const args = parseArgs();

  const mappingName = args.mapping || `${args.from}-${args.to}`;

  try {
    const result = validateMapping(mappingName);
    displayResults(mappingName, result);

    process.exit(result.valid ? 0 : 1);

  } catch (error) {
    console.error(`\n❌ Validation error:`, (error as Error).message);
    process.exit(1);
  }
}

export { validateMapping };
