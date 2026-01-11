import {existsSync} from 'node:fs'
import {homedir} from 'node:os'
import {join} from 'node:path'

import {debug} from './debug.js'
import {ConfigNotFoundError} from './errors.js'

/**
 * PAI configuration interface.
 * Contains all resolved paths for PAI CLI operation.
 */
export interface PaiConfig {
  claudeConfigPath: string
  paiHome: string
  settingsPath: string
}

/**
 * Resolve PAI home directory.
 * Priority: PAI_HOME env var > ~/.pai default
 */
export function getPaiHome(): string {
  return process.env['PAI_HOME'] ?? join(homedir(), '.pai')
}

/**
 * Validate that PAI home directory exists.
 * @throws {ConfigNotFoundError} When directory does not exist
 */
export function validatePaiHome(paiHome: string): void {
  if (!existsSync(paiHome)) {
    throw new ConfigNotFoundError(`PAI_HOME not found at ${paiHome}. Run 'pai setup' or set PAI_HOME env var.`)
  }
}

/**
 * Load and validate PAI configuration.
 * @returns Fully resolved PaiConfig with all paths
 * @throws {ConfigNotFoundError} When PAI_HOME does not exist
 */
export function loadConfig(): PaiConfig {
  const paiHome = getPaiHome()
  debug(`Resolved PAI_HOME: ${paiHome}`)

  validatePaiHome(paiHome)

  const config = {
    claudeConfigPath: join(homedir(), '.claude'),
    paiHome,
    settingsPath: join(paiHome, '.claude', 'settings.json'),
  }

  debug(`claudeConfigPath: ${config.claudeConfigPath}`)
  debug(`settingsPath: ${config.settingsPath}`)

  return config
}
