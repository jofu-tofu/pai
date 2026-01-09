import {homedir} from 'node:os'
import {join} from 'node:path'

/**
 * PAI configuration interface.
 * Placeholder for future config properties.
 */
export interface PaiConfig {
  paiHome: string
}

/**
 * Resolve PAI home directory.
 * Priority: PAI_HOME env var > ~/.pai default
 */
export function getPaiHome(): string {
  return process.env['PAI_HOME'] ?? join(homedir(), '.pai')
}
