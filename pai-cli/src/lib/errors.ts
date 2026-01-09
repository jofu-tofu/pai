import {EXIT_CODES, type ExitCode} from '../types/index.js'

/**
 * Base error class for PAI CLI.
 * All custom errors extend this class.
 */
export class PaiError extends Error {
  constructor(
    message: string,
    public readonly exitCode: ExitCode = EXIT_CODES.GENERAL_ERROR,
  ) {
    super(message)
    this.name = 'PaiError'
  }
}

/**
 * Error thrown when configuration is not found.
 */
export class ConfigNotFoundError extends PaiError {
  constructor(message: string) {
    super(message, EXIT_CODES.ENVIRONMENT_ERROR)
    this.name = 'ConfigNotFoundError'
  }
}

/**
 * Error thrown when environment prerequisites are missing.
 */
export class EnvironmentError extends PaiError {
  constructor(message: string) {
    super(message, EXIT_CODES.ENVIRONMENT_ERROR)
    this.name = 'EnvironmentError'
  }
}
