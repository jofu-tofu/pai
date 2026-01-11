import {Command} from '@oclif/core'

/**
 * Base topic command for 'pai init'.
 *
 * This command provides the foundation for initializing various tools
 * and integrations in a project.
 *
 * EXTENSIBILITY PATTERN:
 * To add a new init target (e.g., 'pai init foo'):
 * 1. Create src/commands/init/foo.ts
 * 2. Extend Command from @oclif/core
 * 3. Implement initialization logic
 * 4. Add to the list in this file's run() method
 * 5. Create integration tests in test/integration/
 *
 * EXAMPLES:
 * - src/commands/init/bmad.ts → pai init bmad (Story 4.2)
 * - src/commands/init/mcp.ts → pai init mcp (future)
 */
export default class Init extends Command {
  static override description = 'Initialize tools and integrations in your project'
  static override examples = [
    '<%= config.bin %> <%= command.id %> bmad',
  ]

  async run(): Promise<void> {
    await this.parse(Init)

    // When run without subcommand, show available options
    this.log('Available init commands:')
    this.log('')
    this.log('  pai init bmad    Initialize BMAD project management system')
    this.log('')
    this.log('Run "pai init --help" for more information')
    this.log('Run "pai init <command> --help" for command-specific help')
  }
}
