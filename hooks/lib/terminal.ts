/**
 * terminal.ts - Cross-platform terminal detection utilities
 *
 * Centralized terminal detection to avoid duplicated code across hooks.
 * Handles platform-specific terminal features like Kitty tab colors and
 * Windows Terminal ANSI escape code support.
 *
 * SUPPORTED TERMINALS:
 * - Kitty (macOS, Linux): Full tab color control via remote API
 * - Windows Terminal (Windows 10+): ANSI escape codes for titles
 * - iTerm2 (macOS): ANSI escape codes
 * - Standard terminals: Basic ANSI escape codes where supported
 *
 * Note: Platform detection functions are now centralized in platform.ts.
 * This module re-exports them for backward compatibility.
 */

// Re-export platform detection functions for backward compatibility
export {
  isWindows,
  isMacOS,
  isLinux,
  isUnix,
  normalizePathForComparison,
  isAbsolutePath,
  getDefaultShell,
  canUseKitty,
} from './platform';

// Import for internal use
import { isWindows, canUseKitty } from './platform';

/**
 * Check if we're running in a Kitty terminal.
 * Returns true only on Linux/macOS when TERM indicates Kitty.
 * Kitty terminal doesn't exist on Windows.
 */
export function isKittyTerminal(): boolean {
  // Skip on Windows - Kitty doesn't run there (native Windows, not WSL)
  if (!canUseKitty()) {
    return false;
  }

  // KITTY_LISTEN_ON is the most reliable indicator of running in Kitty
  if (process.env.KITTY_LISTEN_ON) {
    return true;
  }

  // Fallback: Check TERM environment variable for kitty variants
  const term = process.env.TERM || '';
  return /kitty(-direct)?|xterm-kitty/.test(term);
}

/**
 * Check if we're running in Windows Terminal.
 * Windows Terminal supports ANSI escape codes including OSC sequences for titles.
 * WT_SESSION environment variable is set when running inside Windows Terminal.
 */
export function isWindowsTerminal(): boolean {
  return isWindows() && !!process.env.WT_SESSION;
}

/**
 * Check if the terminal supports ANSI escape codes for setting titles.
 * Returns true for:
 * - Kitty terminal (macOS/Linux)
 * - Windows Terminal (Windows 10+)
 * - Most Unix terminals (iTerm2, Terminal.app, xterm, etc.)
 *
 * Returns false for:
 * - Legacy Windows cmd.exe
 * - Older PowerShell without Windows Terminal
 */
export function supportsAnsiTitles(): boolean {
  // Kitty has its own remote control API, but also supports ANSI
  if (isKittyTerminal()) {
    return true;
  }

  // Windows Terminal supports ANSI escape codes
  if (isWindowsTerminal()) {
    return true;
  }

  // On Unix, most terminals support ANSI escape codes
  if (!isWindows()) {
    return true;
  }

  // Legacy Windows without Windows Terminal
  return false;
}

/**
 * Get the current platform as a friendly string.
 */
export function getPlatformName(): 'windows' | 'macos' | 'linux' | 'unknown' {
  switch (process.platform) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    default:
      return 'unknown';
  }
}

/**
 * Normalize a path for cross-platform comparison.
 * Converts backslashes to forward slashes.
 *
 * @deprecated Use normalizePathForComparison from platform.ts for full functionality
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}
