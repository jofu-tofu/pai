import {Command, Flags} from '@oclif/core'

import {debugVersion, setDebugEnabled} from '../lib/debug.js'

/**
 * Base command class that all PAI CLI commands should extend.
 * Provides global --debug flag support for verbose logging.
 *
 * @example Basic command with debug support
 * import {debug} from '../lib/debug.js'
 *
 * export default class MyCommand extends BaseCommand {
 *   static override flags = {
 *     ...BaseCommand.baseFlags,
 *     // command-specific flags
 *   }
 *
 *   async run() {
 *     // debug mode is already enabled if --debug flag was passed
 *     // version info is automatically logged when debug enabled
 *     debug('My debug message')
 *   }
 * }
 *
 * @example Command with spinner progress feedback
 * import {ux} from '@oclif/core'
 *
 * export default class LongCommand extends BaseCommand {
 *   async run() {
 *     // Check if output is piped (suppress spinners for piped output)
 *     const isPiped = !process.stdout.isTTY
 *
 *     if (!isPiped) {
 *       // Show spinner for long operations in interactive terminal
 *       ux.action.start('Processing')
 *       await longRunningOperation()
 *       ux.action.stop()
 *     } else {
 *       // Piped output - suppress spinner
 *       await longRunningOperation()
 *     }
 *   }
 * }
 *
 * @example Spinner with status updates
 * import {ux} from '@oclif/core'
 *
 * export default class MultiStepCommand extends BaseCommand {
 *   async run() {
 *     if (process.stdout.isTTY) {
 *       ux.action.start('Installing packages')
 *       await installPackages()
 *
 *       // Update spinner status
 *       ux.action.status = 'Configuring'
 *       await configure()
 *
 *       ux.action.stop('Done!')
 *     } else {
 *       await installPackages()
 *       await configure()
 *     }
 *   }
 * }
 */
export default abstract class BaseCommand extends Command {
  static override baseFlags = {
    debug: Flags.boolean({
      char: 'd',
      description: 'Enable verbose debug logging',
      default: false,
    }),
  }

  override async init() {
    await super.init()
    const {flags} = await this.parse(this.constructor as typeof BaseCommand)
    const debugEnabled = flags.debug ?? false
    setDebugEnabled(debugEnabled)

    // Automatically show version info in debug mode (AC4, FR24)
    if (debugEnabled) {
      debugVersion()
    }
  }

  // Force subclasses to implement run method
  abstract override run(): Promise<void>
}
