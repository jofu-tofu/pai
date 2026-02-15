#!/usr/bin/env bun

/**
 * ShowMappings - Visual display of platform equivalencies
 *
 * Shows clear mappings between platforms for understanding equivalencies.
 *
 * Usage:
 *   bun run ShowMappings.ts --from claude-code --to windsurf
 *   bun run ShowMappings.ts --from claude-code --to windsurf --component workflow
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { parse as parseYAML } from 'yaml';
import { homedir } from 'os';
import { getEnvVar } from '../../../hooks/lib/platform';

// Configuration
const PAI_DIR = getEnvVar('PAI_DIR') || join(homedir(), 'pai');
const MAPPINGS_DIR = join(PAI_DIR, '.claude', 'skills', 'SkillTranslate', 'Mappings');

// Parse CLI arguments
function parseArgs(): { from: string; to: string; component?: string } {
  const args = process.argv.slice(2);
  const result: any = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    result[key] = value;
  }

  if (!result.from || !result.to) {
    console.error('Usage: ShowMappings.ts --from <platform> --to <platform> [--component <name>]');
    process.exit(1);
  }

  return result as { from: string; to: string; component?: string };
}

// Load translation mapping
function loadMapping(from: string, to: string): any {
  const mappingPath = join(MAPPINGS_DIR, 'Translations', `${from}-${to}.yaml`);
  const content = readFileSync(mappingPath, 'utf-8');
  return parseYAML(content);
}

// Display header
function displayHeader(from: string, to: string): void {
  const fromUpper = from.toUpperCase().replace(/-/g, ' ');
  const toUpper = to.toUpperCase().replace(/-/g, ' ');

  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log(`│ ${fromUpper} → ${toUpper} MAPPINGS`.padEnd(65) + '│');
  console.log('├─────────────────────────────────────────────────────────────────┤');
}

// Display footer
function displayFooter(): void {
  console.log('└─────────────────────────────────────────────────────────────────┘\n');
}

// Display component mappings
function displayComponentMappings(mapping: any): void {
  console.log('│                                                                 │');
  console.log('│ COMPONENT MAPPINGS                                              │');
  console.log('│ ─────────────────                                               │');

  for (const [key, value] of Object.entries(mapping.component_mappings)) {
    const v = value as any;
    const claudeComponent = v.claude.padEnd(30);
    const windsurfComponent = v.windsurf;

    console.log(`│   ${claudeComponent} →  ${windsurfComponent.padEnd(28)}│`);

    if (v.description) {
      const desc = `     ${v.description}`;
      console.log(`│   ${desc.substring(0, 61).padEnd(61)}│`);
    }
    console.log('│                                                                 │');
  }
}

// Display field mappings
function displayFieldMappings(mapping: any): void {
  console.log('│ FIELD MAPPINGS                                                  │');
  console.log('│ ──────────────                                                  │');
  console.log('│                                                                 │');

  for (const [section, fields] of Object.entries(mapping.field_mappings)) {
    console.log(`│   ${section}:`.padEnd(65) + '│');

    for (const field of fields as any[]) {
      const sourceField = field.source_field || field.source;
      const targetField = field.target_field || field.target;
      const transform = field.transform || 'none';

      const mapping = `${sourceField} → ${targetField}`;
      console.log(`│     ${mapping.padEnd(59)}│`);

      if (transform !== 'none') {
        console.log(`│       (transform: ${transform})`.padEnd(65) + '│');
      }

      if (field.example) {
        const claudeEx = `       Claude: "${field.example.claude}"`;
        const windsurfEx = `       Windsurf: "${field.example.windsurf}"`;
        console.log(`│   ${claudeEx.substring(0, 61).padEnd(61)}│`);
        console.log(`│   ${windsurfEx.substring(0, 61).padEnd(61)}│`);
      }
    }
    console.log('│                                                                 │');
  }
}

// Display directory mappings
function displayDirectoryMappings(mapping: any): void {
  console.log('│ DIRECTORY MAPPINGS                                              │');
  console.log('│ ──────────────────                                              │');
  console.log('│                                                                 │');

  for (const dirMap of mapping.directory_mappings) {
    const source = dirMap.source.padEnd(25);
    const target = dirMap.target.padEnd(25);

    console.log(`│   ${source} →  ${target}│`);

    if (dirMap.description) {
      const desc = `     ${dirMap.description}`;
      console.log(`│   ${desc.substring(0, 61).padEnd(61)}│`);
    }
  }
  console.log('│                                                                 │');
}

// Display specific component
function displayComponent(mapping: any, component: string): void {
  console.log('│                                                                 │');

  const componentMap = mapping.component_mappings[component];
  if (!componentMap) {
    console.log(`│   Component not found: ${component}`.padEnd(65) + '│');
    return;
  }

  console.log(`│ COMPONENT: ${component.toUpperCase()}`.padEnd(65) + '│');
  console.log('│ ─────────────────────────────────────────────────────           │');
  console.log('│                                                                 │');
  console.log(`│   ${componentMap.claude.padEnd(59)}│`);
  console.log(`│     ↓`.padEnd(65) + '│');
  console.log(`│   ${componentMap.windsurf.padEnd(59)}│`);
  console.log('│                                                                 │');

  if (componentMap.description) {
    console.log(`│   ${componentMap.description.substring(0, 61).padEnd(61)}│`);
  }

  // Find relevant field mappings
  const relevantFields = findRelevantFieldMappings(mapping, component);
  if (relevantFields.length > 0) {
    console.log('│                                                                 │');
    console.log('│   Field mappings:                                               │');

    for (const field of relevantFields) {
      const sourceField = field.source_field || field.source;
      const targetField = field.target_field || field.target;
      const fieldMapping = `${sourceField} → ${targetField}`;

      console.log(`│     • ${fieldMapping.substring(0, 57).padEnd(57)}│`);

      if (field.transform && field.transform !== 'none') {
        console.log(`│       (${field.transform})`.padEnd(65) + '│');
      }
    }
  }

  console.log('│                                                                 │');
}

// Find field mappings relevant to a component
function findRelevantFieldMappings(mapping: any, component: string): any[] {
  const fields: any[] = [];

  for (const [section, sectionFields] of Object.entries(mapping.field_mappings)) {
    if (section.toLowerCase().includes(component.toLowerCase())) {
      fields.push(...(sectionFields as any[]));
    }
  }

  return fields;
}

// Main display function
function showMappings(from: string, to: string, component?: string): void {
  const mapping = loadMapping(from, to);

  displayHeader(from, to);

  if (component) {
    displayComponent(mapping, component);
  } else {
    displayComponentMappings(mapping);
    displayFieldMappings(mapping);
    displayDirectoryMappings(mapping);
  }

  displayFooter();

  // Show examples if available
  if (mapping.examples && mapping.examples.length > 0) {
    console.log('EXAMPLES:');
    console.log('─────────\n');

    for (const example of mapping.examples) {
      console.log(`${example.name}:`);
      console.log(`  Input (${from}):  ${example.input.skill || example.input.file}`);
      console.log(`  Output (${to}): ${example.output.cascade || example.output.file}`);
      console.log();
    }
  }
}

// Main execution
if (import.meta.main) {
  const args = parseArgs();

  try {
    showMappings(args.from, args.to, args.component);
  } catch (error) {
    console.error(`\n❌ Error displaying mappings:`, (error as Error).message);
    process.exit(1);
  }
}

export { showMappings };
