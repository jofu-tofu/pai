#!/usr/bin/env bun
/**
 * trufflehog.ts
 *
 * Cross-platform TruffleHog wrapper script.
 * Ensures the appropriate binary exists (downloading if necessary) and executes it.
 *
 * Usage:
 *   bun bin/trufflehog.ts [trufflehog arguments...]
 *
 * Examples:
 *   bun bin/trufflehog.ts filesystem /path/to/scan
 *   bun bin/trufflehog.ts git file:///path/to/repo
 *   bun bin/trufflehog.ts --help
 */

import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getBinaryExtension } from "../hooks/lib/platform";
import { crossSpawnSync } from "../hooks/lib/spawn";

/**
 * Get the binary filename for the current platform
 */
function getBinaryFilename(): string {
  return `trufflehog${getBinaryExtension()}`;
}

/**
 * Get the path to the bin directory (where this script lives)
 * Uses fileURLToPath for cross-platform compatibility
 */
function getBinDir(): string {
  return dirname(fileURLToPath(import.meta.url));
}

/**
 * Download the trufflehog binary using the download script
 */
async function downloadBinary(binDir: string): Promise<void> {
  const downloadScript = join(binDir, "trufflehog-download.ts");

  if (!existsSync(downloadScript)) {
    throw new Error(
      `Download script not found at: ${downloadScript}\n` +
      "Please ensure trufflehog-download.ts exists in the bin directory."
    );
  }

  console.log("TruffleHog binary not found. Downloading...\n");

  const result = crossSpawnSync("bun", ["run", downloadScript], {
    cwd: binDir,
  });

  if (!result.success) {
    throw new Error("Failed to download TruffleHog binary");
  }
}

/**
 * Execute the trufflehog binary with the given arguments
 */
function executeTrufflehog(binaryPath: string, args: string[]): number {
  // Use stdio: 'inherit' for real-time output streaming during scans
  const result = crossSpawnSync(binaryPath, args, {
    stdio: 'inherit',
  });

  return result.code ?? 1;
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const binDir = getBinDir();
  const binaryFilename = getBinaryFilename();
  const binaryPath = join(binDir, binaryFilename);

  // Check if binary exists
  if (!existsSync(binaryPath)) {
    try {
      await downloadBinary(binDir);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }

    // Verify download succeeded
    if (!existsSync(binaryPath)) {
      console.error(`Error: Binary still not found after download at: ${binaryPath}`);
      process.exit(1);
    }
  }

  // Get arguments to pass to trufflehog (skip bun, script path)
  const args = process.argv.slice(2);

  // Execute trufflehog
  const exitCode = executeTrufflehog(binaryPath, args);
  process.exit(exitCode);
}

// Run
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
