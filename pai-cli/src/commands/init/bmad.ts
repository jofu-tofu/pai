import {promises as fs} from 'node:fs'
import {basename, join} from 'node:path'

import {Command} from '@oclif/core'

import {detectUsername, installBmad, updateGitignore} from '../../lib/bmad-installer.js'
import {EXIT_CODES} from '../../types/exit-codes.js'

/**
 * Detect if BMAD is already installed in the given directory.
 * Checks for _bmad directory existence.
 */
export async function detectExistingInstallation(targetDir: string): Promise<boolean> {
  try {
    const bmadPath = join(targetDir, '_bmad')
    await fs.access(bmadPath)
    return true
  } catch {
    return false
  }
}

/**
 * Detect if current directory is a git repository.
 * Checks for .git directory existence.
 */
export async function detectGitRepository(targetDir: string): Promise<boolean> {
  try {
    const gitPath = join(targetDir, '.git')
    await fs.access(gitPath)
    return true
  } catch {
    return false
  }
}

/**
 * Extract project name from directory path.
 * Returns the basename of the given directory.
 */
export function detectProjectName(targetDir: string): string {
  return basename(targetDir)
}

/**
 * Initialize BMAD project management system in the current directory.
 */
export default class Bmad extends Command {
  static override description = 'Initialize BMAD project management system'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  async run(): Promise<void> {
    await this.parse(Bmad)

    const targetDir = process.cwd()

    try {
      // Check if BMAD already exists
      const bmadExists = await detectExistingInstallation(targetDir)
      if (bmadExists) {
        this.warn('BMAD already installed in this directory.')
        this.log('To reinstall, remove the _bmad directory first.')
        return
      }

      // Validate write permissions before proceeding
      try {
        const testFile = join(targetDir, '.pai-write-test')
        await fs.writeFile(testFile, '', 'utf8')
        await fs.unlink(testFile)
      } catch {
        this.error('Permission denied. Cannot write to current directory.', {
          exit: EXIT_CODES.ENVIRONMENT_ERROR,
        })
      }

      // Detect configuration values
      const username = await detectUsername()
      const projectName = detectProjectName(targetDir)
      const hasGit = await detectGitRepository(targetDir)

      this.log(`Installing BMAD for project: ${projectName}`)
      this.log(`Detected user: ${username}`)

      // Install BMAD structure
      await installBmad({
        projectName,
        targetDir,
        username,
      })

      this.log('✓ BMAD directory structure created')
      this.log('✓ Core and BMM modules configured')
      this.log('✓ Agents and workflows installed')

      // Update .gitignore if git repository exists
      if (hasGit) {
        await updateGitignore(targetDir)
        this.log('✓ .gitignore updated')
      }

      this.log('')
      this.log('✓ BMAD initialized successfully')
      this.log('')
      this.log('Next steps:')
      this.log('  pai launch    Start Claude Code with BMAD agents')
    } catch (error) {
      const err = error as Error

      // Categorize errors for better user feedback
      if (err.message.includes('Permission denied') || err.message.includes('EACCES')) {
        this.error(`Permission denied. Cannot write to current directory. ${err.message}`, {
          exit: EXIT_CODES.ENVIRONMENT_ERROR,
        })
      }

      if (err.message.includes('BMAD template not found')) {
        this.error(
          `BMAD template not found. This indicates a corrupted pai-cli installation. ` +
          `Please reinstall: npm install -g pai-cli. ${err.message}`,
          {exit: EXIT_CODES.ENVIRONMENT_ERROR}
        )
      }

      // Generic error fallback
      this.error(`BMAD installation failed: ${err.message}`, {
        exit: EXIT_CODES.GENERAL_ERROR,
      })
    }
  }
}
