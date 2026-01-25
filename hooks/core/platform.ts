/**
 * platform.ts - Centralized platform detection utility
 *
 * Consolidates all platform detection logic into one place.
 * Used by hooks and other utilities for cross-platform compatibility.
 */

import * as path from 'path';
import type { SpawnOptions, SpawnSyncOptions } from 'child_process';

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
 * - On case-insensitive filesystems (Windows, macOS), converts to lowercase
 *
 * @param p - The path to normalize
 * @returns Normalized path suitable for comparison
 */
export function normalizePathForComparison(p: string): string {
  // Convert backslashes to forward slashes
  let normalized = p.replace(/\\/g, '/');

  // On case-insensitive filesystems (Windows, macOS), normalize case
  if (isCaseInsensitiveFilesystem()) {
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
    // Use getEnvVar for case-insensitive lookup on Windows
    return getEnvVar('COMSPEC') || 'cmd.exe';
  }

  // On Unix systems, use SHELL environment variable or fall back to 'sh'
  // Don't hardcode /bin/sh - let PATH resolve it for portability
  return getEnvVar('SHELL') || 'sh';
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
 * Join lines with LF line endings.
 *
 * NOTE: Always uses LF (\n) regardless of platform because:
 * 1. Git normalizes line endings on commit (core.autocrlf)
 * 2. Modern editors handle LF correctly on all platforms
 * 3. Consistency is more important than platform-native endings
 * 4. CRLF in source files can cause issues with some tools
 *
 * Use this instead of .join('\n') for explicit intent.
 *
 * @param lines - Array of lines to join
 * @returns Joined string with LF line endings
 */
export function joinLines(lines: string[]): string {
  return lines.join('\n');
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
 * @param options - Optional configuration
 * @param options.timeout - Timeout in ms (default: 5000)
 * @param options.fallbackTimeout - Timeout for fallback check in ms (default: 2000)
 * @returns true if the command exists
 */
export function commandExistsSync(
  cmd: string,
  options: { timeout?: number; fallbackTimeout?: number } = {}
): boolean {
  const { spawnSync } = require('child_process');
  const { timeout = 5000, fallbackTimeout = 2000 } = options;

  try {
    if (isWindows()) {
      // Primary: Use 'where' command (cmd.exe built-in)
      // Using shell: true ensures 'where' built-in is available from any context
      const result = spawnSync('where', [cmd], {
        encoding: 'utf-8',
        timeout,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,  // Ensures where built-in is available
      });
      if (result.status === 0) return true;

      // Fallback: Try invoking the command directly with --version or -h
      // This catches cases where 'where' fails but the command exists
      try {
        const fallback = spawnSync(cmd, ['--version'], {
          encoding: 'utf-8',
          timeout: fallbackTimeout,
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
        timeout,
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
// Process Spawn Utilities
// =============================================================================

/**
 * Get spawn options for Windows that hide the console window.
 * Use this to avoid console flashing when spawning processes on Windows.
 *
 * Usage: spawn(cmd, args, { ...getWindowsSpawnOptions() })
 */
export function getWindowsSpawnOptions(): Partial<SpawnOptions> {
  return isWindows() ? { windowsHide: true } : {};
}

/**
 * Get spawn options for Windows that use shell and hide console.
 * Use this when running commands that need shell resolution on Windows.
 *
 * Usage: spawn(cmd, args, { ...getWindowsShellOptions() })
 */
export function getWindowsShellOptions(): Partial<SpawnOptions> {
  return isWindows() ? { shell: true, windowsHide: true } : {};
}

/**
 * Get sync spawn options for Windows that hide the console window.
 *
 * Usage: spawnSync(cmd, args, { ...getWindowsSyncSpawnOptions() })
 */
export function getWindowsSyncSpawnOptions(): Partial<SpawnSyncOptions> {
  return isWindows() ? { windowsHide: true } : {};
}

// =============================================================================
// Terminal Detection Utilities
// =============================================================================

/**
 * Check if NO_COLOR environment variable is set.
 * NO_COLOR is a standard for disabling color output.
 * See: https://no-color.org/
 */
export function isNoColorSet(): boolean {
  return getEnvVar('NO_COLOR') !== undefined;
}

/**
 * Check if FORCE_COLOR environment variable is set.
 * FORCE_COLOR can override NO_COLOR and enable colors even without TTY.
 */
export function isForceColorSet(): boolean {
  const forceColor = getEnvVar('FORCE_COLOR');
  return forceColor !== undefined && forceColor !== '0' && forceColor.toLowerCase() !== 'false';
}

/**
 * Check if running in Windows Terminal (has better ANSI support).
 * Checks multiple indicators for more reliable detection.
 *
 * Note: For terminal-specific features, prefer using terminal.ts functions.
 * This is a lightweight check for platform.ts internal use.
 */
export function isWindowsTerminal(): boolean {
  if (!isWindows()) return false;
  // WT_SESSION is the primary indicator
  if (getEnvVar('WT_SESSION')) return true;
  // WT_PROFILE_ID is set in newer versions
  if (getEnvVar('WT_PROFILE_ID')) return true;
  return false;
}

/**
 * Check if terminal supports ANSI colors.
 *
 * This function is context-aware:
 * - Respects NO_COLOR (disables colors)
 * - Respects FORCE_COLOR (enables colors even without TTY)
 * - Works in hook contexts where TTY may not be available
 * - Checks environment variables that indicate color support
 */
export function supportsAnsiColors(): boolean {
  // NO_COLOR always takes precedence
  if (isNoColorSet()) return false;

  // FORCE_COLOR enables colors regardless of TTY
  if (isForceColorSet()) return true;

  // Windows Terminal supports colors
  if (isWindowsTerminal()) return true;

  // Check COLORTERM for truecolor support
  const colorTerm = getEnvVar('COLORTERM') || '';
  if (colorTerm === 'truecolor' || colorTerm === '24bit') return true;

  // Check TERM for color support indicators
  const term = getEnvVar('TERM') || '';
  if (term.includes('256color') || term.includes('truecolor') || term.includes('color')) {
    return true;
  }

  // For hooks and non-interactive contexts, we can't rely on TTY
  // but we can assume most modern terminals support basic ANSI
  // unless explicitly disabled via NO_COLOR
  if (term && term !== 'dumb') {
    return true;
  }

  // If we have a TTY, assume color support (traditional check)
  if (process.stdout?.isTTY) return true;

  // Default: no color support if we can't determine
  return false;
}

/**
 * Get terminal width in columns.
 * Cross-platform: Works on Windows, macOS, and Linux.
 *
 * Detection order:
 * 1. process.stdout.columns (Node.js built-in, most reliable)
 * 2. COLUMNS environment variable (standard Unix, also works on Windows)
 * 3. Windows: 'mode con' command (for legacy cmd.exe)
 * 4. Unix: 'tput cols' command (fallback for edge cases)
 * 5. Default: returns specified fallback (default 80)
 *
 * @param fallback - Default width if detection fails (default: 80)
 * @returns Terminal width in columns
 */
export function getTerminalWidth(fallback: number = 80): number {
  const { spawnSync } = require('child_process');

  // 1. Primary: Use Node.js built-in (works on all platforms)
  if (process.stdout.columns && process.stdout.columns > 0) {
    return process.stdout.columns;
  }

  // 2. Environment variable (cross-platform, case-insensitive on Windows)
  const envColumns = parseInt(getEnvVar('COLUMNS') || '0');
  if (envColumns > 0) {
    return envColumns;
  }

  // 3. Platform-specific fallbacks
  try {
    if (isWindows()) {
      // Windows: Use 'mode con' command
      const result = spawnSync('cmd', ['/c', 'mode', 'con'], {
        encoding: 'utf-8',
        timeout: 2000,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      });
      if (result.stdout) {
        // Match multi-locale column names
        const match = result.stdout.match(/(?:Columns|Spalten|Columnas|Colonnes|Colonne|Kolommen|Colunas|Kolumny|Kolumner|Kolonner|Sloupce):\s*(\d+)/i);
        if (match) {
          const cols = parseInt(match[1]);
          if (cols > 0) return cols;
        }
      }
    } else {
      // Unix/macOS: Use 'tput cols'
      const result = spawnSync('tput', ['cols'], {
        encoding: 'utf-8',
        timeout: 2000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      if (result.stdout) {
        const cols = parseInt(result.stdout.trim());
        if (cols > 0) return cols;
      }
    }
  } catch {
    // Command failed - use fallback
  }

  return fallback;
}

// =============================================================================
// Architecture Utilities
// =============================================================================

/**
 * Get the current CPU architecture.
 * Common values: 'x64', 'arm64', 'ia32', 'arm'
 */
export function getArchitecture(): string {
  return process.arch;
}

/**
 * Get platform and architecture combined.
 * Useful for downloading platform-specific binaries.
 * Examples: 'win32-x64', 'darwin-arm64', 'linux-x64'
 */
export function getPlatformAndArch(): string {
  return `${process.platform}-${process.arch}`;
}

/**
 * Get platform string for binary downloads.
 * Maps Node's process.platform to common naming conventions.
 * Examples: 'windows', 'darwin', 'linux'
 */
export function getPlatformString(): string {
  if (isWindows()) return 'windows';
  if (isMacOS()) return 'darwin';
  return 'linux';
}

// =============================================================================
// CRLF / Line Ending Utilities
// =============================================================================

/**
 * Normalize line endings to LF (Unix-style).
 * Use this when processing file content that may have Windows CRLF line endings.
 *
 * @param content - Text content that may contain CRLF
 * @returns Content with all CRLF converted to LF
 */
export function normalizeCRLF(content: string): string {
  return content.replace(/\r\n/g, '\n');
}

/**
 * Cross-platform frontmatter regex pattern.
 * Matches YAML frontmatter blocks that start and end with ---.
 *
 * IMPORTANT: This regex assumes LF-normalized content.
 * Always use with normalizeCRLF() first, or use parseFrontmatter() which handles this.
 *
 * @example
 * const normalized = normalizeCRLF(content);
 * const match = normalized.match(FRONTMATTER_REGEX);
 *
 * @deprecated Prefer using parseFrontmatter() which handles CRLF normalization automatically
 */
export const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?/;

/**
 * Parse YAML frontmatter from content, handling both CRLF and LF line endings.
 * This is the safe, cross-platform way to extract frontmatter.
 *
 * @param content - File content that may contain frontmatter
 * @returns Object with frontmatter (raw YAML string) and body (remaining content), or null if no frontmatter
 */
export function parseFrontmatter(content: string): { frontmatter: string; body: string } | null {
  // Normalize CRLF to LF for consistent matching
  const normalized = normalizeCRLF(content);
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) return null;

  return {
    frontmatter: match[1],
    body: match[2] || '',
  };
}

/**
 * Extract the first line from content after a pattern, handling CRLF.
 * Use this instead of regex patterns like /Pattern\n\n([^\n]+)/
 *
 * @param content - Content to search
 * @param pattern - Pattern to find (e.g., "## Overview")
 * @returns The first non-empty line after the pattern, or null if not found
 */
export function extractLineAfterPattern(content: string, pattern: string): string | null {
  const normalized = normalizeCRLF(content);
  const index = normalized.indexOf(pattern);
  if (index === -1) return null;

  const afterPattern = normalized.slice(index + pattern.length);
  const lines = splitLines(afterPattern);

  // Find first non-empty line
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) return trimmed;
  }

  return null;
}

/**
 * Ensure a path ends with a forward slash (for prefix matching).
 * Use this for consistent path prefix comparisons across platforms.
 * All paths should be normalized to forward slashes first using toForwardSlash().
 *
 * NOTE: Uses forward slash '/' intentionally because:
 * 1. This function is for path PREFIX MATCHING, not filesystem operations
 * 2. Forward slashes work cross-platform in Node.js/Bun for path operations
 * 3. Paths should be normalized with toForwardSlash() before calling this
 *
 * @param p - The path (should already be normalized to forward slashes)
 * @returns Path guaranteed to end with '/'
 */
export function ensureTrailingSeparator(p: string): string {
  return p.endsWith('/') ? p : p + '/';
}

/**
 * Get a display-friendly path that works for user-facing messages.
 * On Windows, shows actual path. On Unix, can optionally use ~ for home.
 *
 * @param p - The path to format
 * @param options - Options for formatting
 * @returns Formatted path suitable for display
 */
export function formatPathForDisplay(p: string, options: { useTilde?: boolean } = {}): string {
  const { useTilde = !isWindows() } = options;
  const home = require('os').homedir();
  const normalizedPath = toForwardSlash(p);
  const normalizedHome = toForwardSlash(home);

  if (useTilde && normalizedPath.startsWith(normalizedHome)) {
    return '~' + normalizedPath.slice(normalizedHome.length);
  }
  return normalizedPath;
}

/**
 * Get the platform-appropriate environment variable syntax for display.
 * Use this when showing command examples to users.
 *
 * @param varName - The variable name (e.g., "PAI_DIR")
 * @returns Platform-appropriate syntax (e.g., "$PAI_DIR" or "%PAI_DIR%")
 */
export function getEnvVarSyntax(varName: string): string {
  return isWindows() ? `%${varName}%` : `$${varName}`;
}

/**
 * Split content on a CRLF-safe pattern and capture content up to the next newline.
 * Use this instead of regex like /SUMMARY:\s*([^\n]+)/
 *
 * @param content - Content to search
 * @param pattern - Pattern to find (e.g., "SUMMARY:")
 * @returns The captured content after the pattern until newline, or null if not found
 */
export function captureAfterPattern(content: string, pattern: string | RegExp): string | null {
  const normalized = normalizeCRLF(content);
  let index: number;
  let matchLength: number;

  if (typeof pattern === 'string') {
    index = normalized.indexOf(pattern);
    matchLength = pattern.length;
  } else {
    const match = normalized.match(pattern);
    if (!match) return null;
    index = match.index!;
    matchLength = match[0].length;
  }

  if (index === -1) return null;

  const afterPattern = normalized.slice(index + matchLength);
  const newlineIndex = afterPattern.indexOf('\n');
  const captured = newlineIndex === -1 ? afterPattern : afterPattern.slice(0, newlineIndex);

  return captured.trim();
}
