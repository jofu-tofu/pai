#!/usr/bin/env bun
// $PAI_DIR/hooks/cleanup-temp-files.ts
// UserPromptSubmit hook: Clean up temporary Claude files

import { join } from 'path';
import { readdir, rm, stat } from 'fs/promises';

/**
 * Recursively find and delete files matching pattern
 */
async function cleanupTempFiles(
  directory: string,
  pattern: RegExp
): Promise<number> {
  let deletedCount = 0;

  try {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      try {
        if (entry.isDirectory()) {
          // Recurse into subdirectories
          deletedCount += await cleanupTempFiles(fullPath, pattern);
        } else if (pattern.test(entry.name)) {
          // Delete matching file
          await rm(fullPath, { force: true });
          deletedCount++;
        }
      } catch (err) {
        // Skip files/dirs we can't access
        continue;
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }

  return deletedCount;
}

/**
 * Also check for and cleanup temp directories matching pattern
 */
async function cleanupTempDirectories(
  directory: string,
  pattern: RegExp
): Promise<number> {
  let deletedCount = 0;

  try {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      try {
        if (entry.isDirectory()) {
          if (pattern.test(entry.name)) {
            // Delete matching directory recursively
            await rm(fullPath, { recursive: true, force: true });
            deletedCount++;
          } else {
            // Recurse into non-matching subdirectories
            deletedCount += await cleanupTempDirectories(fullPath, pattern);
          }
        }
      } catch (err) {
        // Skip directories we can't access
        continue;
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }

  return deletedCount;
}

async function main() {
  try {
    const cwd = process.cwd();

    // Pattern for Claude temp files and directories
    const tempPattern = /^tmpclaude-/;

    // Clean up temp files
    const filesDeleted = await cleanupTempFiles(cwd, tempPattern);

    // Clean up temp directories
    const dirsDeleted = await cleanupTempDirectories(cwd, tempPattern);

    // Silent operation - only log if items were deleted (optional)
    // Uncomment the line below if you want to see cleanup stats
    // if (filesDeleted > 0 || dirsDeleted > 0) {
    //   console.error(`Cleaned up ${filesDeleted} temp files and ${dirsDeleted} temp directories`);
    // }

  } catch (error) {
    // Never crash - just log error silently
    // Uncomment the line below if you want to see errors
    // console.error('Temp file cleanup error:', error);
  }

  process.exit(0);
}

// Only run main when executed directly (not when imported for testing)
if (import.meta.main) {
  main();
}
