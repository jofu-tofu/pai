#!/usr/bin/env bun
import { crossSpawnSync } from './lib/spawn';
import { pathContainsSegment, getEnvVar } from './lib/platform';
/**
 * CheckVersion.hook.ts - Check for Claude Code Updates (SessionStart)
 *
 * PURPOSE:
 * Compares the installed Claude Code version against the latest available on npm.
 * If an update is available, displays a notification to stderr. This keeps the
 * system current without interrupting workflow.
 *
 * TRIGGER: SessionStart
 *
 * INPUT:
 * - None (reads version info from CLI and npm)
 *
 * OUTPUT:
 * - stdout: None
 * - stderr: Update notification if newer version available
 * - exit(0): Always (non-blocking)
 *
 * SIDE EFFECTS:
 * - Network request to npm registry (brief)
 * - Spawns two child processes for version checks
 *
 * INTER-HOOK RELATIONSHIPS:
 * - DEPENDS ON: None
 * - COORDINATES WITH: None (fully independent)
 * - MUST RUN BEFORE: None (informational only)
 * - MUST RUN AFTER: None
 *
 * ERROR HANDLING:
 * - Network failures: Silent exit (doesn't block session)
 * - Parse failures: Returns 'unknown', silent exit
 *
 * PERFORMANCE:
 * - Non-blocking: Yes
 * - Typical execution: <500ms
 * - Skipped for subagents: Yes
 */

function getCurrentVersion(): string {
  try {
    const result = crossSpawnSync('claude', ['--version']);
    if (!result.success) return 'unknown';
    const match = result.stdout.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

function getLatestVersion(): string {
  try {
    const result = crossSpawnSync('npm', ['view', '@anthropic-ai/claude-code', 'version']);
    if (!result.success) return 'unknown';
    return result.stdout.trim() || 'unknown';
  } catch {
    return 'unknown';
  }
}

async function main() {
  try {
    // Skip for subagents - use cross-platform path matching and case-insensitive env access
    const claudeProjectDir = getEnvVar('CLAUDE_PROJECT_DIR') || '';
    const isSubagent = pathContainsSegment(claudeProjectDir, '.claude/Agents') ||
                      getEnvVar('CLAUDE_AGENT_TYPE') !== undefined;

    if (isSubagent) {
      process.exit(0);
    }

    const currentVersion = getCurrentVersion();
    const latestVersion = getLatestVersion();

    if (currentVersion !== 'unknown' && latestVersion !== 'unknown' && currentVersion !== latestVersion) {
      console.error(`💡 Update available: CC ${currentVersion} → ${latestVersion}`);
    }

    process.exit(0);
  } catch {
    process.exit(0);
  }
}

main();
