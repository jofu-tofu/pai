#!/usr/bin/env bun
/**
 * update-telos - Update TELOS life context with automatic backups and change tracking
 *
 * This command manages updates to the TELOS life context files, ensuring:
 * - Automatic timestamped backups before any modification
 * - Change tracking in updates.md
 * - Complete version history
 *
 * Usage:
 *   update-telos <relative-path> "<content>" "<change-description>"
 *
 * Example:
 *   update-telos Core/BELIEFS.md "## AI Consciousness Timeline\n\nI believe..." "Updated belief about AI consciousness"
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, isAbsolute, join, parse, relative } from 'path';
import { homedir } from 'os';
import { getPrincipal } from '../../../hooks/lib/identity';

const TELOS_DIR = join(homedir(), 'Obsidian', 'TELOS');
const BACKUPS_DIR = join(TELOS_DIR, 'Backups');
const UPDATES_FILE = join(TELOS_DIR, 'Reviews', 'updates.md');

function normalizeTelosPath(filePath: string): string {
  return filePath.trim().replace(/\\/g, '/');
}

function validateTelosPath(filePath: string): { valid: boolean; normalized?: string; reason?: string } {
  const normalized = normalizeTelosPath(filePath);

  if (!normalized) {
    return { valid: false, reason: 'File path is required' };
  }

  if (isAbsolute(normalized)) {
    return { valid: false, reason: 'Use a path relative to the TELOS folder, not an absolute path' };
  }

  if (!normalized.toLowerCase().endsWith('.md')) {
    return { valid: false, reason: 'Only markdown notes inside TELOS can be updated' };
  }

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { valid: false, reason: 'File path is empty' };
  }

  const invalidChars = /[<>:"|?*]/;
  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/;

  for (const segment of segments) {
    if (segment === '.' || segment === '..') {
      return { valid: false, reason: 'Path traversal is not allowed' };
    }

    if (invalidChars.test(segment)) {
      return { valid: false, reason: 'Path contains invalid characters: < > : " | ? *' };
    }

    const baseName = segment.replace(/\.[^.]+$/, '').toUpperCase();
    if (reserved.test(baseName)) {
      return { valid: false, reason: `"${baseName}" is a reserved filename on Windows` };
    }
  }

  const resolvedPath = join(TELOS_DIR, ...segments);
  const relativeToRoot = relative(TELOS_DIR, resolvedPath);
  if (relativeToRoot.startsWith('..') || isAbsolute(relativeToRoot)) {
    return { valid: false, reason: 'File path must stay inside the TELOS folder' };
  }

  return { valid: true, normalized: segments.join('/') };
}

/**
 * Get timestamp for backup filenames using Intl API for cross-platform consistency.
 * Uses the principal's timezone (from settings) with reliable Intl.DateTimeFormat.
 */
function getPacificTimestamp(): string {
  const now = new Date();
  const principal = getPrincipal();
  const timezone = principal.timezone || 'UTC';

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hours = getPart('hour');
  const minutes = getPart('minute');
  const seconds = getPart('second');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Get formatted date for change logs using Intl API for cross-platform consistency.
 * Uses the principal's timezone (from settings) with reliable Intl.DateTimeFormat.
 */
function getPacificDateForLog(): string {
  const now = new Date();
  const principal = getPrincipal();
  const timezone = principal.timezone || 'UTC';

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hours = getPart('hour');
  const minutes = getPart('minute');
  const seconds = getPart('second');

  const tzAbbr = timezone.includes('America/Los_Angeles') ? 'PT' :
                 timezone.includes('America/New_York') ? 'ET' :
                 timezone.includes('UTC') ? 'UTC' : timezone.split('/').pop() || 'TZ';

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${tzAbbr}`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('❌ Usage: update-telos <relative-path> "<content>" "<change-description>"');
    console.error('\nExample: update-telos Core/BELIEFS.md "## Belief\n\nDetails" "Updated belief"');
    process.exit(1);
  }

  const [inputPath, content, changeDescription] = args;

  const pathCheck = validateTelosPath(inputPath);
  if (!pathCheck.valid || !pathCheck.normalized) {
    console.error(`❌ Invalid TELOS file path: ${inputPath}`);
    console.error(pathCheck.reason);
    process.exit(1);
  }

  const relativePath = pathCheck.normalized;
  const targetFile = join(TELOS_DIR, ...relativePath.split('/'));

  if (!existsSync(targetFile)) {
    console.error(`❌ File does not exist: ${targetFile}`);
    process.exit(1);
  }

  const timestamp = getPacificTimestamp();
  const parsed = parse(relativePath);
  const backupRelativePath = join(parsed.dir, `${parsed.name}-${timestamp}${parsed.ext}`).replace(/\\/g, '/');
  const backupPath = join(BACKUPS_DIR, backupRelativePath);

  try {
    mkdirSync(dirname(backupPath), { recursive: true });
    copyFileSync(targetFile, backupPath);
    console.log(`✅ Backup created: ${backupRelativePath}`);
  } catch (error) {
    console.error(`❌ Failed to create backup: ${error}`);
    process.exit(1);
  }

  try {
    const currentContent = readFileSync(targetFile, 'utf-8');
    const updatedContent = currentContent.trimEnd() + '\n' + content + '\n';
    writeFileSync(targetFile, updatedContent, 'utf-8');
    console.log(`✅ Updated: ${relativePath}`);
  } catch (error) {
    console.error(`❌ Failed to update file: ${error}`);
    process.exit(1);
  }

  try {
    mkdirSync(dirname(UPDATES_FILE), { recursive: true });
    const logTimestamp = getPacificDateForLog();
    const logEntry = `\n## ${logTimestamp}\n\n- **File Modified**: ${relativePath}\n- **Change Type**: Content Addition\n- **Description**: ${changeDescription}\n- **Backup Location**: \`Backups/${backupRelativePath}\`\n`;
    const updatesContent = existsSync(UPDATES_FILE) ? readFileSync(UPDATES_FILE, 'utf-8') : '# Updates\n';
    writeFileSync(UPDATES_FILE, updatesContent.trimEnd() + '\n' + logEntry, 'utf-8');
    console.log('✅ Change logged in Reviews/updates.md');
  } catch (error) {
    console.error(`❌ Failed to update updates.md: ${error}`);
    process.exit(1);
  }

  console.log('\n🎯 TELOS update complete!');
  console.log(`   File: ${relativePath}`);
  console.log(`   Backup: Backups/${backupRelativePath}`);
  console.log(`   Change: ${changeDescription}`);
}

main();
