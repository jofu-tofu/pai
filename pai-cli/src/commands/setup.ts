import {lstat, mkdir, readlink, rename, symlink} from 'node:fs/promises'
import {homedir} from 'node:os'
import {dirname, join} from 'node:path'

import BaseCommand from './base.js'
import {getPaiHome} from '../lib/config.js'
import {ConfigNotFoundError} from '../lib/errors.js'
import {EXIT_CODES} from '../types/index.js'

/**
 * Configure PAI hooks by creating symlink from Claude Code settings to PAI settings.
 *
 * Creates: ~/.claude/settings.json → ~/.pai/.claude/settings.json
 * One-time setup that persists across all Claude Code sessions.
 */
export default class SetupCommand extends BaseCommand {
  static override description =
    'Configure PAI hooks (one-time setup for Claude Code integration)\n\n' +
    'EXIT CODES\n' +
    '  0  Success - PAI hooks configured successfully\n' +
    '  1  General error - unexpected failure during setup\n' +
    '  2  Invalid usage - check your arguments and flags\n' +
    '  3  Environment error - PAI_HOME not found or permission denied'
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --debug  # Enable verbose logging',
    '# Verify success\n<%= config.bin %> <%= command.id %> && echo "Setup complete"',
  ]

  async run(): Promise<void> {
    try {
      // Resolve PAI home directory
      const paiHome = getPaiHome()

      // Define symlink paths
      const targetPath = join(paiHome, '.claude', 'settings.json')
      const linkPath = join(homedir(), '.claude', 'settings.json')

      this.debug(`Target: ${targetPath}`)
      this.debug(`Link: ${linkPath}`)

      // Check if symlink already exists and is correct
      const isConfigured = await this.checkExistingSymlink(linkPath, targetPath)
      if (isConfigured) {
        this.logSuccess('✓ PAI hooks already configured')
        this.log(`  ${linkPath} → ${targetPath}`)
        return
      }

      // Ensure parent directories exist
      await mkdir(dirname(targetPath), {recursive: true})
      await mkdir(dirname(linkPath), {recursive: true})

      // Check for conflicts (regular file exists)
      await this.handleConflicts(linkPath)

      // Create the symlink
      await symlink(targetPath, linkPath)

      // Success message
      this.logSuccess('✓ PAI hooks configured successfully')
      this.log(`  ${linkPath} → ${targetPath}`)
      this.log('')
      this.log('Next step: Run `pai launch` to start Claude Code with PAI hooks active')
    } catch (error: unknown) {
      // Handle known error types first
      if (error instanceof ConfigNotFoundError) {
        this.error('PAI_HOME not found. Set PAI_HOME environment variable or ensure ~/.pai directory exists.', {
          exit: EXIT_CODES.ENVIRONMENT_ERROR,
        })
        return // Unreachable due to exit, but explicit for clarity
      }

      const err = error as NodeJS.ErrnoException

      if (err.code === 'EACCES' || err.code === 'EPERM') {
        this.error('Permission denied creating symlink. On Windows, enable Developer Mode or run as administrator.', {
          exit: EXIT_CODES.ENVIRONMENT_ERROR,
        })
        return // Unreachable due to exit, but explicit for clarity
      }

      // Generic error fallback
      this.debug(`Error details: ${err.message || String(error)}`)
      this.error(`Failed to configure PAI hooks: ${err.message || String(error)}`, {exit: EXIT_CODES.GENERAL_ERROR})
    }
  }

  private async checkExistingSymlink(linkPath: string, expectedTarget: string): Promise<boolean> {
    try {
      const stats = await lstat(linkPath)

      if (!stats.isSymbolicLink()) {
        // Path exists but is not a symlink - will handle in conflict resolution
        return false
      }

      // Read symlink target
      const actualTarget = await readlink(linkPath)

      // Check if symlink points to correct target
      if (actualTarget === expectedTarget) {
        return true
      }

      this.debug(`Symlink exists but points to wrong target: ${actualTarget}`)
      return false
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Symlink doesn't exist - need to create
        return false
      }

      throw error
    }
  }

  private async handleConflicts(linkPath: string): Promise<void> {
    try {
      const stats = await lstat(linkPath)

      if (stats.isFile() || stats.isDirectory()) {
        // Regular file or directory exists at symlink location
        this.warn(`Existing file found at ${linkPath}`)
        this.warn('This file will be backed up and replaced with a symlink to enable PAI hooks.')
        this.log('')

        // Auto-backup existing file
        const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
        const backupPath = `${linkPath}.backup-${timestamp}`

        await rename(linkPath, backupPath)
        this.logSuccess(`✓ Backup created: ${backupPath}`)
      }
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // No conflict - path doesn't exist
        return
      }

      throw error
    }
  }
}
