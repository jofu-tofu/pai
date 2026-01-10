/**
 * Debug logging utilities for PAI CLI.
 * Provides conditional debug output with [debug] prefix.
 */

let debugEnabled = false

/**
 * Check if debug mode is enabled.
 */
export function isDebugEnabled(): boolean {
  return debugEnabled
}

/**
 * Enable or disable debug mode.
 */
export function setDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled
}

/**
 * Log a debug message if debug mode is enabled.
 * Messages are prefixed with [debug] and output to stderr.
 * @param message - The message to log
 */
export function debug(message: string): void {
  if (debugEnabled) {
    // Use dim color if terminal supports it, otherwise plain text
    const supportsColor = process.stderr.isTTY
    if (supportsColor) {
      // ANSI dim: \u001B[2m, reset: \u001B[0m
      process.stderr.write(`\u001B[2m[debug] ${message}\u001B[0m\n`)
    } else {
      process.stderr.write(`[debug] ${message}\n`)
    }
  }
}
