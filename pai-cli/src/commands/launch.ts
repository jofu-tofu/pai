import BaseCommand from './base.js'
import {ProcessSpawnError} from '../lib/errors.js'
import {spawnProcess} from '../lib/spawn.js'
import {checkVersionCompatibility, getClaudeCodeVersion} from '../lib/version.js'
import {EXIT_CODES} from '../types/index.js'

/**
 * Launch Claude Code with PAI configuration.
 *
 * Spawns Claude Code CLI with --dangerouslySkipPermissions flag,
 * enabling unattended execution. Designed for PAI hook system safety guardrails
 * (requires pai setup - Story 2.7). Supports multiple parallel sessions.
 */
export default class LaunchCommand extends BaseCommand {
  static override description =
    'Launch Claude Code with PAI configuration (sandbox disabled, supports parallel sessions)'
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --debug  # Enable verbose logging',
  ]

  async run(): Promise<void> {
    try {
      // Check Claude Code version compatibility (non-blocking)
      const version = await getClaudeCodeVersion()
      const versionCheck = checkVersionCompatibility(version)

      // Debug logging: show version information
      this.debug(`Claude Code version: ${versionCheck.version ?? 'unknown'}`)
      this.debug(`Compatibility status: ${versionCheck.compatible ? 'compatible' : 'incompatible'}`)

      // Non-blocking warning for incompatibility or unknown version
      if (versionCheck.warning) {
        this.warn(versionCheck.warning)
      }

      // Spawn Claude Code with sandbox permissions disabled
      // PAI hook system provides safety guardrails
      // Continue launch regardless of version check result (graceful degradation)
      const exitCode = await spawnProcess('claude', ['--dangerouslySkipPermissions'])

      // Pass through Claude Code's exit code
      this.exit(exitCode)
    } catch (error) {
      if (error instanceof ProcessSpawnError) {
        // Actionable error message (already includes installation link)
        this.error(error.message, {exit: EXIT_CODES.ENVIRONMENT_ERROR})
      }

      // Unexpected error
      this.error('Unexpected launch failure.', {exit: EXIT_CODES.GENERAL_ERROR})
    }
  }
}
