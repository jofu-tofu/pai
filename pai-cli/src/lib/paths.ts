import {existsSync} from 'node:fs'
import {join} from 'node:path'

/**
 * Join path segments using platform-appropriate separator.
 */
export function resolvePath(...segments: string[]): string {
  return join(...segments)
}

/**
 * Check if directory is a PAI workspace (contains .pai marker).
 */
export function isWorkspace(dir: string): boolean {
  return existsSync(join(dir, '.pai'))
}
