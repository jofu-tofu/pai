/**
 * platform.ts - Centralized platform detection utility
 *
 * Consolidates all platform detection logic into one place.
 * Used by hooks and other utilities for cross-platform compatibility.
 */

import * as path from 'path';

// =============================================================================
// Platform Detection Functions
// =============================================================================

/**
 * Check if we're running on Windows.
 */
export function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * Check if we're running on macOS.
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * Check if we're running on Linux.
 */
export function isLinux(): boolean {
  return process.platform === 'linux';
}

/**
 * Check if we're running on a Unix-like system (macOS or Linux).
 */
export function isUnix(): boolean {
  return isMacOS() || isLinux();
}

// =============================================================================
// Path Utilities
// =============================================================================

/**
 * Normalize a path for cross-platform comparison.
 * - Converts all backslashes to forward slashes
 * - On Windows, converts to lowercase for case-insensitive comparison
 *
 * @param p - The path to normalize
 * @returns Normalized path suitable for comparison
 */
export function normalizePathForComparison(p: string): string {
  // Convert backslashes to forward slashes
  let normalized = p.replace(/\\/g, '/');

  // On Windows, paths are case-insensitive
  if (isWindows()) {
    normalized = normalized.toLowerCase();
  }

  return normalized;
}

/**
 * Check if a path is absolute.
 * Wrapper around path.isAbsolute() for consistency.
 *
 * @param p - The path to check
 * @returns true if the path is absolute
 */
export function isAbsolutePath(p: string): boolean {
  return path.isAbsolute(p);
}

// =============================================================================
// Shell Utilities
// =============================================================================

/**
 * Get the default shell for the current platform.
 *
 * @returns The default shell command/path
 */
export function getDefaultShell(): string {
  if (isWindows()) {
    // On Windows, COMSPEC points to cmd.exe which is always present
    // Fall back to cmd.exe (not pwsh) since cmd is guaranteed to exist
    return process.env.COMSPEC || 'cmd.exe';
  }

  // On Unix systems, use SHELL environment variable or fall back to 'sh'
  // Don't hardcode /bin/sh - let PATH resolve it for portability
  return process.env.SHELL || 'sh';
}

/**
 * Check if Kitty terminal features can be used.
 * Returns true on Unix systems (macOS, Linux) and WSL where Kitty terminal exists.
 * Kitty is not available in native Windows (PowerShell/cmd), but works in WSL
 * which reports process.platform === 'linux'.
 *
 * Note: This checks if Kitty CAN be used (platform support), not if it IS being used.
 * For checking if currently running in Kitty, use isKittyTerminal() from terminal.ts.
 *
 * @returns true if the platform supports Kitty terminal
 */
export function canUseKitty(): boolean {
  return isUnix();
}

// =============================================================================
// Text Utilities
// =============================================================================

/**
 * Split text into lines, handling both Unix (LF) and Windows (CRLF) line endings.
 * This is the cross-platform safe way to split file contents into lines.
 *
 * @param content - The text content to split
 * @returns Array of lines (without line ending characters)
 */
export function splitLines(content: string): string[] {
  return content.split(/\r?\n/);
}

/**
 * Normalize path separators to forward slashes.
 * Useful for pattern matching and URL construction.
 *
 * Unlike normalizePathForComparison(), this does NOT apply case normalization,
 * making it suitable for display purposes or when you need the original case.
 *
 * @param p - The path to normalize
 * @returns Path with all backslashes converted to forward slashes
 */
export function toForwardSlash(p: string): string {
  return p.replace(/\\/g, '/');
}

// =============================================================================
// Environment Variable Utilities
// =============================================================================

/**
 * Get an environment variable with case-insensitive lookup on Windows.
 * On Windows, environment variables are case-insensitive (HOME == home == Home).
 * On Unix, they are case-sensitive.
 *
 * @param key - The environment variable name
 * @returns The value or undefined if not found
 */
export function getEnvVar(key: string): string | undefined {
  // Direct lookup works on all platforms
  const direct = process.env[key];
  if (direct !== undefined) return direct;

  // On Windows, try case-insensitive lookup
  if (isWindows()) {
    const upperKey = key.toUpperCase();
    for (const [k, v] of Object.entries(process.env)) {
      if (k.toUpperCase() === upperKey) {
        return v;
      }
    }
  }

  return undefined;
}

/**
 * Expand environment variables in a string.
 * Handles Unix ($VAR, ${VAR}) and Windows (%VAR%) syntax.
 * Uses case-insensitive lookup on Windows.
 *
 * @param content - String with environment variable references
 * @returns String with variables expanded
 */
export function expandEnvVars(content: string): string {
  return content
    // Unix: ${VAR}
    .replace(/\$\{(\w+)\}/g, (_, key) => getEnvVar(key) || '')
    // Unix: $VAR (but not $$)
    .replace(/\$(\w+)/g, (_, key) => getEnvVar(key) || '')
    // Windows: %VAR%
    .replace(/%(\w+)%/g, (_, key) => getEnvVar(key) || '');
}

// =============================================================================
// Process Utilities
// =============================================================================

/**
 * Get the appropriate signal for terminating a process.
 * Windows doesn't support POSIX signals like SIGTERM.
 *
 * @returns Signal for Unix, undefined for Windows (uses default termination)
 */
export function getKillSignal(): NodeJS.Signals | undefined {
  return isWindows() ? undefined : 'SIGTERM';
}

/**
 * Check if a command exists in PATH.
 * Uses 'where' on Windows, 'which' on Unix.
 * Includes fallback mechanisms for edge cases.
 *
 * @param cmd - The command to check
 * @returns true if the command exists
 */
export function commandExistsSync(cmd: string): boolean {
  const { spawnSync } = require('child_process');

  try {
    if (isWindows()) {
      // Primary: Use 'where' command (cmd.exe built-in)
      // Using shell: true ensures 'where' built-in is available from any context
      const result = spawnSync('where', [cmd], {
        encoding: 'utf-8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,  // Ensures where built-in is available
      });
      if (result.status === 0) return true;

      // Fallback: Try invoking the command directly with --version or -h
      // This catches cases where 'where' fails but the command exists
      try {
        const fallback = spawnSync(cmd, ['--version'], {
          encoding: 'utf-8',
          timeout: 2000,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true,
        });
        return fallback.status === 0 || (fallback.stdout && fallback.stdout.length > 0);
      } catch {
        return false;
      }
    } else {
      // Unix: Use 'which' command
      const result = spawnSync('which', [cmd], {
        encoding: 'utf-8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return result.status === 0;
    }
  } catch {
    return false;
  }
}

// =============================================================================
// Path Matching Utilities
// =============================================================================

/**
 * Check if a path contains a specific path segment.
 * Handles both Unix and Windows path separators correctly.
 *
 * @param fullPath - The full path to check
 * @param segment - The segment to look for (e.g., '.claude/Agents')
 * @returns true if the segment is found in the path
 */
export function pathContainsSegment(fullPath: string, segment: string): boolean {
  const normalizedPath = toForwardSlash(fullPath);
  const normalizedSegment = toForwardSlash(segment);

  // Ensure we're matching complete path segments, not substrings
  // Add leading/trailing slashes to avoid partial matches
  const pathWithSlashes = `/${normalizedPath}/`;
  const segmentWithSlashes = `/${normalizedSegment}/`;

  if (isWindows()) {
    return pathWithSlashes.toLowerCase().includes(segmentWithSlashes.toLowerCase());
  }
  return pathWithSlashes.includes(segmentWithSlashes);
}

// =============================================================================
// Filesystem Utilities
// =============================================================================

/**
 * Check if filesystem is case-insensitive (Windows and macOS)
 * Replaces duplicate inline checks in SecurityValidator.hook.ts and change-detection.ts
 */
export function isCaseInsensitiveFilesystem(): boolean {
  return isWindows() || isMacOS();
}

/**
 * Get platform-appropriate binary extension
 * Replaces inline ternaries in bin/trufflehog.ts
 */
export function getBinaryExtension(): string {
  return isWindows() ? '.exe' : '';
}

/**
 * Get human-readable platform name
 * Replaces inline ternary chains in Banner.ts
 */
export function getPlatformDisplayName(): string {
  if (isWindows()) return 'Windows';
  if (isMacOS()) return 'macOS';
  return 'Linux';
}

// =============================================================================
// Terminal Detection Utilities
// =============================================================================

/**
 * Check if running in Windows Terminal (has better ANSI support)
 */
export function isWindowsTerminal(): boolean {
  return isWindows() && !!process.env.WT_SESSION;
}

/**
 * Check if terminal supports ANSI colors (for safe color output)
 */
export function supportsAnsiColors(): boolean {
  if (!process.stdout.isTTY) return false;
  if (isWindowsTerminal()) return true;
  const term = process.env.TERM || '';
  const colorTerm = process.env.COLORTERM || '';
  return colorTerm === 'truecolor' || colorTerm === '24bit' ||
         term.includes('256color') || term.includes('truecolor');
}
