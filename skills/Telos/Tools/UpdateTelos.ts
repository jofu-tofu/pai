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
 *   update-telos <file> "<content>" "<change-description>"
 *
 * Example:
 *   update-telos BOOKS.md "- Project Hail Mary by Andy Weir" "Added new favorite book"
 *
 * Files that can be updated:
 * - BELIEFS.md - Core beliefs and world model
 * - BOOKS.md - Favorite books
 * - CHALLENGES.md - Current challenges
 * - FRAMES.md - Mental frames and perspectives
 * - GOALS.md - Life goals
 * - LESSONS.md - Lessons learned
 * - MISSION.md - Life mission
 * - MODELS.md - Mental models
 * - MOVIES.md - Favorite movies
 * - NARRATIVES.md - Personal narratives
 * - PREDICTIONS.md - Predictions about the future
 * - PROBLEMS.md - Problems to solve
 * - PROJECTS.md - Active projects
 * - STRATEGIES.md - Strategies being employed
 * - TELOS.md - Main TELOS document
 * - TRAUMAS.md - Past traumas
 * - WISDOM.md - Accumulated wisdom
 * - WRONG.md - Things I was wrong about
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getPrincipal } from '../../../hooks/lib/identity';
import { paiPath } from '../../../hooks/lib/paths';

// TELOS content lives in skills/CORE/USER/TELOS/ (not context/life/telos)
const TELOS_DIR = paiPath('skills', 'CORE', 'USER', 'TELOS');
const BACKUPS_DIR = join(TELOS_DIR, 'Backups');
const UPDATES_FILE = join(TELOS_DIR, 'updates.md');

// Valid TELOS files
const VALID_FILES = [
  'BELIEFS.md', 'BOOKS.md', 'CHALLENGES.md', 'FRAMES.md', 'GOALS.md',
  'LESSONS.md', 'MISSION.md', 'MODELS.md', 'MOVIES.md', 'NARRATIVES.md',
  'PREDICTIONS.md', 'PROBLEMS.md', 'PROJECTS.md', 'STRATEGIES.md',
  'TELOS.md', 'TRAUMAS.md', 'WISDOM.md', 'WRONG.md'
];

/**
 * Get timestamp for backup filenames using Intl API for cross-platform consistency.
 * Uses the principal's timezone (from settings) with reliable Intl.DateTimeFormat.
 */
function getPacificTimestamp(): string {
  const now = new Date();
  const principal = getPrincipal();
  const timezone = principal.timezone || 'UTC';

  // Use Intl.DateTimeFormat for consistent cross-platform date formatting
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

  // Use Intl.DateTimeFormat for consistent cross-platform date formatting
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

  // Get timezone abbreviation
  const tzAbbr = timezone.includes('America/Los_Angeles') ? 'PT' :
                 timezone.includes('America/New_York') ? 'ET' :
                 timezone.includes('UTC') ? 'UTC' : timezone.split('/').pop() || 'TZ';

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${tzAbbr}`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('❌ Usage: update-telos <file> "<content>" "<change-description>"');
    console.error('\nExample: update-telos BOOKS.md "- New Book Title" "Added favorite book"');
    console.error('\nValid files:', VALID_FILES.join(', '));
    process.exit(1);
  }

  const [filename, content, changeDescription] = args;

  // Validate filename
  if (!VALID_FILES.includes(filename)) {
    console.error(`❌ Invalid file: ${filename}`);
    console.error(`Valid files: ${VALID_FILES.join(', ')}`);
    process.exit(1);
  }

  const targetFile = join(TELOS_DIR, filename);

  // Check if file exists
  if (!existsSync(targetFile)) {
    console.error(`❌ File does not exist: ${targetFile}`);
    process.exit(1);
  }

  // Step 1: Create timestamped backup
  const timestamp = getPacificTimestamp();
  const backupFilename = filename.replace('.md', `-${timestamp}.md`);
  const backupPath = join(BACKUPS_DIR, backupFilename);

  try {
    copyFileSync(targetFile, backupPath);
    console.log(`✅ Backup created: ${backupFilename}`);
  } catch (error) {
    console.error(`❌ Failed to create backup: ${error}`);
    process.exit(1);
  }

  // Step 2: Update the target file (append content)
  try {
    const currentContent = readFileSync(targetFile, 'utf-8');
    const updatedContent = currentContent.trimEnd() + '\n' + content + '\n';
    writeFileSync(targetFile, updatedContent, 'utf-8');
    console.log(`✅ Updated: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to update file: ${error}`);
    process.exit(1);
  }

  // Step 3: Update updates.md with change log
  try {
    const logTimestamp = getPacificDateForLog();
    const logEntry = `
## ${logTimestamp}

- **File Modified**: ${filename}
- **Change Type**: Content Addition
- **Description**: ${changeDescription}
- **Backup Location**: \`backups/${backupFilename}\`

`;

    const updatesContent = readFileSync(UPDATES_FILE, 'utf-8');

    // Insert the new entry after "## Future Changes" section
    const futureChangesMarker = '## Future Changes';
    const insertPosition = updatesContent.indexOf(futureChangesMarker);

    if (insertPosition !== -1) {
      const beforeMarker = updatesContent.substring(0, insertPosition + futureChangesMarker.length);
      const afterMarker = updatesContent.substring(insertPosition + futureChangesMarker.length);

      // Find the end of the "Document all changes below..." line
      // Handle both Unix (LF) and Windows (CRLF) line endings
      const lfIndex = afterMarker.indexOf('\n');
      const crlfIndex = afterMarker.indexOf('\r\n');
      const nextLineBreak = crlfIndex !== -1 && (crlfIndex < lfIndex || lfIndex === -1) ? crlfIndex : lfIndex;
      const headerSection = afterMarker.substring(0, nextLineBreak + 1);
      const changesList = afterMarker.substring(nextLineBreak + 1);

      const updatedUpdates = beforeMarker + headerSection + logEntry + changesList;
      writeFileSync(UPDATES_FILE, updatedUpdates, 'utf-8');
      console.log(`✅ Change logged in updates.md`);
    } else {
      // Fallback: just append
      const updatedUpdates = updatesContent.trimEnd() + '\n' + logEntry;
      writeFileSync(UPDATES_FILE, updatedUpdates, 'utf-8');
      console.log(`✅ Change logged in updates.md (appended)`);
    }
  } catch (error) {
    console.error(`❌ Failed to update updates.md: ${error}`);
    process.exit(1);
  }

  console.log('\n🎯 TELOS update complete!');
  console.log(`   File: ${filename}`);
  console.log(`   Backup: backups/${backupFilename}`);
  console.log(`   Change: ${changeDescription}`);
}

main();
