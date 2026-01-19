#!/usr/bin/env bun
/**
 * Cross-platform hook runner
 *
 * CROSS-PLATFORM NOTES:
 * - Shebang line (#!/usr/bin/env bun) is for Unix systems only
 * - On Windows, invoke hooks via: bun run hooks/HookName.hook.ts
 * - On Unix, can also do: ./hooks/HookName.hook.ts (if executable)
 *
 * PURPOSE:
 * Expands $PAI_DIR in hook paths for platforms where the shell doesn't
 * automatically expand environment variables (e.g., Windows PowerShell).
 *
 * USAGE:
 *   bun run-hook.ts <hook-name>
 *
 * EXAMPLES:
 *   bun run-hook.ts StartupGreeting.hook.ts
 *   bun run-hook.ts $PAI_DIR/hooks/StartupGreeting.hook.ts  (Unix)
 *   bun run-hook.ts %PAI_DIR%/hooks/StartupGreeting.hook.ts (Windows CMD)
 *
 * The hook name can be:
 * - Just the filename: StartupGreeting.hook.ts
 * - Relative path: hooks/StartupGreeting.hook.ts
 * - Path with $PAI_DIR: $PAI_DIR/hooks/StartupGreeting.hook.ts
 * - Path with %PAI_DIR%: %PAI_DIR%/hooks/StartupGreeting.hook.ts (Windows)
 */

import { join, normalize, isAbsolute } from 'path';
import { existsSync } from 'fs';
import { getPaiDir, expandPath } from './lib/paths';

function expandPaiDir(path: string): string {
  const paiDir = getPaiDir();

  // Handle various PAI_DIR reference formats
  return path
    .replace(/^\$PAI_DIR(?=[\/\\]|$)/, paiDir)
    .replace(/^\$\{PAI_DIR\}(?=[\/\\]|$)/, paiDir)
    .replace(/^%PAI_DIR%(?=[\/\\]|$)/i, paiDir);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: bun run-hook.ts <hook-path>');
    console.error('Example: bun run-hook.ts StartupGreeting.hook.ts');
    process.exit(1);
  }

  let hookPath = args[0];
  const hookArgs = args.slice(1);

  // Expand $PAI_DIR if present
  hookPath = expandPaiDir(hookPath);

  // If not absolute and doesn't exist, try relative to hooks directory
  if (!isAbsolute(hookPath) && !existsSync(hookPath)) {
    const paiDir = getPaiDir();

    // Try hooks/ subdirectory first
    const hooksPath = join(paiDir, 'hooks', hookPath);
    if (existsSync(hooksPath)) {
      hookPath = hooksPath;
    } else {
      // Try direct from PAI_DIR
      const directPath = join(paiDir, hookPath);
      if (existsSync(directPath)) {
        hookPath = directPath;
      }
    }
  }

  hookPath = normalize(hookPath);

  if (!existsSync(hookPath)) {
    console.error(`Hook not found: ${hookPath}`);
    console.error(`PAI_DIR: ${getPaiDir()}`);
    process.exit(1);
  }

  // Pass through original args to the hook via environment
  // (stdin is already passed through automatically)
  try {
    await import(hookPath);
  } catch (error) {
    console.error(`Failed to run hook ${hookPath}:`, error);
    process.exit(1);
  }
}

main();
