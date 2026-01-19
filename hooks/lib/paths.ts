/**
 * Centralized Path Resolution
 *
 * Handles environment variable expansion for portable PAI configuration.
 * Claude Code doesn't expand $HOME in settings.json env values, so we do it here.
 *
 * Cross-platform support:
 * - Unix: $HOME, ${HOME}, ~
 * - Windows: %USERPROFILE%, %HOME%
 * - All paths are normalized to the platform's native separator
 *
 * Usage:
 *   import { getPaiDir, getSettingsPath } from './lib/paths';
 *   const paiDir = getPaiDir(); // Always returns expanded absolute path
 */

import { homedir } from 'os';
import { join, normalize, resolve, sep } from 'path';
import { isWindows, toForwardSlash, getEnvVar } from './platform';

/**
 * Expand shell variables in a path string
 * Supports:
 * - Unix: $HOME, ${HOME}, ~
 * - Windows: %USERPROFILE%, %HOME%
 *
 * Returns normalized path with platform-native separators
 */
export function expandPath(inputPath: string): string {
  const home = homedir();

  let expanded = inputPath
    // Unix-style variables
    .replace(/^\$HOME(?=[\/\\]|$)/, home)
    .replace(/^\$\{HOME\}(?=[\/\\]|$)/, home)
    .replace(/^~(?=[\/\\]|$)/, home)
    // Windows-style variables
    .replace(/^%USERPROFILE%(?=[\/\\]|$)/i, home)
    .replace(/^%HOME%(?=[\/\\]|$)/i, home);

  // Normalize to platform-native separators and resolve . and ..
  return normalize(expanded);
}

/**
 * Get the PAI directory (expanded)
 * Priority: PAI_DIR env var (expanded) → $HOME/pai (default fallback)
 */
export function getPaiDir(): string {
  // Use getEnvVar for case-insensitive lookup on Windows (handles environment variable case differences)
  const envPaiDir = getEnvVar('PAI_DIR');

  if (envPaiDir) {
    return expandPath(envPaiDir);
  }

  return join(homedir(), 'pai');
}

/**
 * Get the settings.json path
 */
export function getSettingsPath(): string {
  return join(getPaiDir(), 'settings.json');
}

/**
 * Get a path relative to PAI_DIR
 */
export function paiPath(...segments: string[]): string {
  return join(getPaiDir(), ...segments);
}

/**
 * Get the hooks directory
 */
export function getHooksDir(): string {
  return paiPath('hooks');
}

/**
 * Get the skills directory
 */
export function getSkillsDir(): string {
  return paiPath('skills');
}

/**
 * Get the MEMORY directory
 */
export function getMemoryDir(): string {
  return paiPath('MEMORY');
}

/**
 * Normalize a path: resolve to absolute and convert to forward slashes.
 * Useful for consistent path handling across platforms.
 *
 * @param inputPath - Path to normalize (can be relative or absolute)
 * @returns Absolute path with forward slashes
 */
export function normalizePath(inputPath: string): string {
  return toForwardSlash(resolve(inputPath));
}
