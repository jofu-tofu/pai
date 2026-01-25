#!/usr/bin/env bun
/**
 * get-work-dir.ts - CLI helper to get current session's work directory
 *
 * PURPOSE:
 * Provides a simple CLI interface for skills and scripts to get the current
 * session's work directory from the multi-session current-work.json format.
 *
 * USAGE:
 * bun run hooks/core/get-work-dir.ts [options]
 *
 * OPTIONS:
 * --session-id <id>   Get work_dir for specific session
 * --latest           Get most recently created work directory (default fallback)
 * --scratch          Return full scratch path instead of just work_dir
 * --all              List all active sessions
 * --json             Output as JSON instead of plain text
 *
 * EXAMPLES:
 * bun run hooks/core/get-work-dir.ts
 *   → Returns most recent work_dir
 *
 * bun run hooks/core/get-work-dir.ts --scratch
 *   → Returns full path: /path/to/MEMORY/WORK/<work_dir>/scratch
 *
 * bun run hooks/core/get-work-dir.ts --session-id abc-123
 *   → Returns work_dir for specific session
 *
 * bun run hooks/core/get-work-dir.ts --all --json
 *   → Lists all sessions as JSON
 *
 * EXIT CODES:
 * 0 - Success
 * 1 - No work directory found
 * 2 - Invalid arguments
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { getSession, getAllSessions, type SessionWork } from './current-work';
import { getPaiDir } from './paths';

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  sessionId: null as string | null,
  latest: false,
  scratch: false,
  all: false,
  json: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--session-id':
      flags.sessionId = args[++i];
      break;
    case '--latest':
      flags.latest = true;
      break;
    case '--scratch':
      flags.scratch = true;
      break;
    case '--all':
      flags.all = true;
      break;
    case '--json':
      flags.json = true;
      break;
    case '--help':
    case '-h':
      console.log(`Usage: get-work-dir [options]

Options:
  --session-id <id>   Get work_dir for specific session
  --latest           Get most recently created work directory (default)
  --scratch          Return full scratch path instead of work_dir name
  --all              List all active sessions
  --json             Output as JSON

Examples:
  get-work-dir                     # Get most recent work_dir
  get-work-dir --scratch           # Get full scratch path
  get-work-dir --session-id abc    # Get specific session's work_dir
  get-work-dir --all --json        # List all sessions as JSON`);
      process.exit(0);
  }
}

const WORK_DIR = join(getPaiDir(), 'MEMORY', 'WORK');

/**
 * Get the most recently created work directory by examining the filesystem
 */
function getMostRecentWorkDir(): string | null {
  if (!existsSync(WORK_DIR)) {
    return null;
  }

  const dirs = readdirSync(WORK_DIR)
    .filter(name => {
      const fullPath = join(WORK_DIR, name);
      return statSync(fullPath).isDirectory() && !name.startsWith('.');
    })
    .map(name => ({
      name,
      mtime: statSync(join(WORK_DIR, name)).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime); // Most recent first

  return dirs.length > 0 ? dirs[0].name : null;
}

/**
 * Get work_dir from sessions, preferring most recent
 */
function getWorkDirFromSessions(): string | null {
  const sessions = getAllSessions();
  const entries = Object.entries(sessions);

  if (entries.length === 0) {
    return null;
  }

  // Sort by created_at descending (most recent first)
  entries.sort((a, b) => {
    const aTime = new Date(a[1].created_at).getTime();
    const bTime = new Date(b[1].created_at).getTime();
    return bTime - aTime;
  });

  return entries[0][1].work_dir;
}

// Main logic
try {
  // Handle --all flag
  if (flags.all) {
    const sessions = getAllSessions();
    if (flags.json) {
      console.log(JSON.stringify(sessions, null, 2));
    } else {
      const entries = Object.entries(sessions);
      if (entries.length === 0) {
        console.log('No active sessions');
      } else {
        entries.forEach(([id, session]) => {
          console.log(`${id}: ${session.work_dir} (${session.item_count} items, ${session.created_at})`);
        });
      }
    }
    process.exit(0);
  }

  // Get work_dir based on flags
  let workDir: string | null = null;

  if (flags.sessionId) {
    // Specific session requested
    const session = getSession(flags.sessionId);
    if (session) {
      workDir = session.work_dir;
    } else {
      console.error(`Session not found: ${flags.sessionId}`);
      process.exit(1);
    }
  } else {
    // No specific session - use most recent from current-work.json or filesystem
    workDir = getWorkDirFromSessions();

    // Fallback to filesystem if no sessions in current-work.json
    if (!workDir) {
      workDir = getMostRecentWorkDir();
    }
  }

  if (!workDir) {
    console.error('No work directory found');
    process.exit(1);
  }

  // Output the result
  if (flags.scratch) {
    const scratchPath = join(WORK_DIR, workDir, 'scratch');
    if (flags.json) {
      console.log(JSON.stringify({ work_dir: workDir, scratch_path: scratchPath }));
    } else {
      console.log(scratchPath);
    }
  } else {
    if (flags.json) {
      console.log(JSON.stringify({ work_dir: workDir }));
    } else {
      console.log(workDir);
    }
  }

  process.exit(0);
} catch (err) {
  console.error(`Error: ${err}`);
  process.exit(1);
}
