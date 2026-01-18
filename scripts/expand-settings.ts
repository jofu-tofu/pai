#!/usr/bin/env bun
/**
 * PAI Settings Expander
 *
 * Expands {{PAI_DIR}} placeholders in settings.template.json to create
 * a platform-appropriate settings.json file.
 *
 * This utility resolves PAI_DIR from multiple sources:
 *   1. PAI_DIR environment variable
 *   2. Current working directory (if it contains settings.template.json)
 *   3. User's home directory ~/.pai-config (if exists)
 *
 * Usage:
 *   bun run scripts/expand-settings.ts [--output <path>]
 *
 * The generated settings.json uses absolute paths that work on any platform.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { toForwardSlash } from '../hooks/lib/platform';

// ============================================================================
// Configuration
// ============================================================================

const TEMPLATE_NAME = 'settings.template.json';
const OUTPUT_NAME = 'settings.json';
const PLACEHOLDER_PATTERN = /\{\{PAI_DIR\}\}/g;

// ============================================================================
// PAI_DIR Resolution
// ============================================================================

interface ResolutionResult {
  paiDir: string;
  source: string;
}

/**
 * Resolves PAI_DIR from multiple sources in priority order
 */
function resolvePaiDir(): ResolutionResult {
  // Priority 1: Environment variable
  const envPaiDir = process.env.PAI_DIR;
  if (envPaiDir) {
    const expanded = expandHomePath(envPaiDir);
    return { paiDir: normalizePath(expanded), source: 'PAI_DIR environment variable' };
  }

  // Priority 2: Config file in home directory
  const configPath = join(homedir(), '.pai-config');
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      if (config.PAI_DIR) {
        const expanded = expandHomePath(config.PAI_DIR);
        return { paiDir: normalizePath(expanded), source: `~/.pai-config` };
      }
    } catch {
      // Config file exists but is invalid, continue to next source
    }
  }

  // Priority 3: Current working directory (if template exists here)
  const cwdTemplate = join(process.cwd(), TEMPLATE_NAME);
  if (existsSync(cwdTemplate)) {
    return { paiDir: normalizePath(process.cwd()), source: 'current directory (contains template)' };
  }

  // Priority 4: Script's directory (go up from scripts/ to pai/)
  // Use fileURLToPath for cross-platform URL-to-path conversion
  // This properly handles Windows paths (file:///C:/... -> C:\...)
  const scriptPath = fileURLToPath(import.meta.url);
  const scriptDir = dirname(scriptPath);
  const parentDir = resolve(scriptDir, '..');
  const parentTemplate = join(parentDir, TEMPLATE_NAME);
  if (existsSync(parentTemplate)) {
    return { paiDir: normalizePath(parentDir), source: 'script parent directory' };
  }

  // No valid source found
  console.error('❌ ERROR: Could not determine PAI_DIR');
  console.error('');
  console.error('Please set PAI_DIR using one of these methods:');
  console.error('');
  console.error('  Option 1: Environment variable');
  console.error('    PowerShell:  $env:PAI_DIR = "C:\\Users\\YourName\\pai"');
  console.error('    Bash:        export PAI_DIR="/home/yourname/pai"');
  console.error('');
  console.error('  Option 2: Config file (~/.pai-config)');
  console.error('    { "PAI_DIR": "/path/to/your/pai" }');
  console.error('');
  console.error('  Option 3: Run from PAI directory');
  console.error('    cd /path/to/pai && bun run scripts/expand-settings.ts');
  console.error('');
  process.exit(1);
}

/**
 * Expands ~ and $HOME in path strings
 */
function expandHomePath(inputPath: string): string {
  const home = homedir();
  return inputPath
    .replace(/^~(?=[\/\\]|$)/, home)
    .replace(/^\$HOME(?=[\/\\]|$)/, home)
    .replace(/^\$\{HOME\}(?=[\/\\]|$)/, home)
    .replace(/^%USERPROFILE%(?=[\/\\]|$)/i, home)
    .replace(/^%HOME%(?=[\/\\]|$)/i, home);
}

/**
 * Normalizes path separators to forward slashes (works cross-platform with bun)
 */
function normalizePath(inputPath: string): string {
  return toForwardSlash(resolve(inputPath));
}

// ============================================================================
// Template Expansion
// ============================================================================

/**
 * Reads template, expands placeholders, and writes output
 */
function expandTemplate(paiDir: string, outputPath?: string): void {
  const templatePath = join(paiDir, TEMPLATE_NAME);

  // Verify template exists
  if (!existsSync(templatePath)) {
    console.error(`❌ ERROR: Template not found: ${templatePath}`);
    console.error('');
    console.error('Expected to find settings.template.json in your PAI directory.');
    process.exit(1);
  }

  // Read template
  const templateContent = readFileSync(templatePath, 'utf-8');

  // Expand placeholders
  const expandedContent = templateContent.replace(PLACEHOLDER_PATTERN, paiDir);

  // Determine output path
  const finalOutputPath = outputPath || join(paiDir, OUTPUT_NAME);

  // Backup existing settings if present
  if (existsSync(finalOutputPath)) {
    const timestamp = new Date().toISOString().split('T')[0];
    const backupPath = finalOutputPath.replace('.json', `.backup-${timestamp}.json`);
    const existingContent = readFileSync(finalOutputPath, 'utf-8');
    writeFileSync(backupPath, existingContent);
    console.log(`📦 Backed up existing settings: ${backupPath}`);
  }

  // Write expanded settings
  writeFileSync(finalOutputPath, expandedContent);
  console.log(`✅ Generated: ${finalOutputPath}`);
}

// ============================================================================
// CLI
// ============================================================================

function main(): void {
  console.log('🔧 PAI Settings Expander');
  console.log('');

  // Parse arguments
  const args = process.argv.slice(2);
  let outputPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      outputPath = args[i + 1];
      i++;
    }
  }

  // Resolve PAI_DIR
  const { paiDir, source } = resolvePaiDir();
  console.log(`📁 PAI_DIR: ${paiDir}`);
  console.log(`   (resolved from: ${source})`);
  console.log('');

  // Expand template
  expandTemplate(paiDir, outputPath);

  console.log('');
  console.log('✨ Settings expanded successfully!');
  console.log('');
  console.log('The {{PAI_DIR}} placeholders have been replaced with:');
  console.log(`   ${paiDir}`);
  console.log('');
  console.log('If you move your PAI directory, re-run this script to update paths.');
}

main();
