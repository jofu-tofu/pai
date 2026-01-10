/**
 * Shared library code for PAI CLI.
 * Re-exports all library modules from this barrel file.
 */

// Configuration resolution
export {getPaiHome, loadConfig, type PaiConfig, validatePaiHome} from './config.js'

// Debug logging
export {debug, debugConfig, debugSpawn, debugVersion, isDebugEnabled, setDebugEnabled} from './debug.js'

// Custom error classes and utilities
export {
  ConfigNotFoundError,
  EnvironmentError,
  formatErrorMessage,
  InvalidUsageError,
  PaiError,
  ProcessSpawnError,
} from './errors.js'

// Cross-platform path utilities
export {
  expandPath,
  findWorkspaceRoot,
  getHomePath,
  getWorkspacePath,
  isWorkspace,
  normalizePath,
  pathExists,
  resolvePath,
  toUnixPath,
  toWindowsPath,
} from './paths.js'

// Process spawning utilities
export {spawnProcess, type SpawnProcessOptions} from './spawn.js'
