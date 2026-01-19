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
import { isWindows, canUseKitty, getEnvVar, isNoColorSet } from './platform';

/**
 * Check if we're running in a Kitty terminal.
 * Returns true only on Linux/macOS when TERM indicates Kitty.
 * Kitty terminal doesn't exist on Windows.
 *
 * Detection methods (in order of reliability):
 * 1. KITTY_LISTEN_ON - Most reliable, set when remote control is enabled
 * 2. KITTY_WINDOW_ID - Set in all Kitty windows
 * 3. KITTY_PID - Process ID of the Kitty instance
 * 4. TERM variable - Checks for kitty-related TERM values
 */
export function isKittyTerminal(): boolean {
  // Skip on Windows - Kitty doesn't run there (native Windows, not WSL)
  if (!canUseKitty()) {
    return false;
  }

  // KITTY_LISTEN_ON is the most reliable indicator (remote control enabled)
  // Use getEnvVar for consistent cross-platform env var access
  if (getEnvVar('KITTY_LISTEN_ON')) {
    return true;
  }

  // KITTY_WINDOW_ID is set in all Kitty windows (even without remote control)
  if (getEnvVar('KITTY_WINDOW_ID')) {
    return true;
  }

  // KITTY_PID indicates we're running inside Kitty
  if (getEnvVar('KITTY_PID')) {
    return true;
  }

  // Fallback: Check TERM environment variable for kitty variants
  const term = getEnvVar('TERM') || '';
  return /kitty(-direct)?|xterm-kitty/.test(term);
}

/**
 * Check if we're running in Windows Terminal.
 * Windows Terminal supports ANSI escape codes including OSC sequences for titles.
 *
 * Detection methods:
 * 1. WT_SESSION - Primary indicator (session GUID)
 * 2. WT_PROFILE_ID - Profile identifier (set in newer versions)
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
 * Check if the terminal supports ANSI escape codes for setting titles.
 * Returns true for:
 * - Kitty terminal (macOS/Linux)
 * - Windows Terminal (Windows 10+)
 * - Most Unix terminals (iTerm2, Terminal.app, xterm, etc.)
 *
 * Returns false for:
 * - Legacy Windows cmd.exe
 * - Older PowerShell without Windows Terminal
 * - When NO_COLOR is set (respects user preference)
 */
export function supportsAnsiTitles(): boolean {
  // Respect NO_COLOR - if set, assume no ANSI support desired
  if (isNoColorSet()) {
    return false;
  }

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

// NOTE: getPlatformName() and normalizePath() were removed as duplicates.
// Use getPlatformDisplayName() and normalizePathForComparison() from platform.ts instead.
