#!/usr/bin/env bun
/**
 * PAI System Hook Setup Script
 *
 * Creates .claude/settings.json in PAI_DIR with all PAI System hooks configured.
 *
 * Usage:
 *   bun run scripts/setup-hooks.ts
 *
 * Requirements:
 *   - PAI_DIR environment variable must be set
 *   - Hook scripts must exist in $PAI_DIR/hooks/
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { toForwardSlash, getEnvVar } from '../hooks/core/platform';

interface HookConfig {
  type: string;
  command: string;
}

interface HookMatcher {
  matcher?: string;
  hooks: HookConfig[];
}

interface SettingsJson {
  model: string;
  statusLine?: {
    type: string;
    command: string;
  };
  hooks: Record<string, HookMatcher[]>;
}

/**
 * Creates the hook command - uses absolute paths for cross-platform compatibility
 */
function getHookCommand(scriptPath: string): string {
  // Use 'bun run' with absolute path - works on all platforms
  return `bun run ${scriptPath}`;
}

/**
 * Gets the PAI_DIR path or exits with error
 */
function getPaiDir(): string {
  const paiDir = getEnvVar('PAI_DIR');

  if (!paiDir) {
    console.error('❌ ERROR: PAI_DIR environment variable not set');
    console.error('');
    console.error('Please set PAI_DIR to your PAI System installation directory:');
    console.error('');
    console.error('  PowerShell:  $env:PAI_DIR = "C:\\Users\\YourName\\pai"');
    console.error('  Bash:        export PAI_DIR="/home/yourname/pai"');
    console.error('');
    process.exit(1);
  }

  return paiDir;
}

/**
 * Generates the complete settings.json configuration
 * Uses absolute paths with forward slashes for cross-platform compatibility
 */
function generateSettings(paiDir: string): SettingsJson {
  // Normalize to forward slashes - works on all platforms with bun
  const normalizedPaiDir = toForwardSlash(paiDir);

  // Helper to create absolute hook path - use join() then normalize to forward slashes
  // This is more maintainable than template literals with hardcoded separators
  const hookPath = (scriptName: string) => toForwardSlash(join(paiDir, 'hooks', scriptName));
  const toolPath = (scriptName: string) => toForwardSlash(join(paiDir, 'tools', scriptName));

  return {
    model: 'sonnet',
    statusLine: {
      type: 'command',
      command: getHookCommand(toolPath('statusline.ts'))
    },
    hooks: {
      SessionStart: [
        {
          matcher: '*',
          hooks: [
            {
              type: 'command',
              command: getHookCommand(hookPath('initialize-session.ts'))
            },
            {
              type: 'command',
              command: getHookCommand(hookPath('load-core-context.ts'))
            },
            {
              type: 'command',
              command: `${getHookCommand(hookPath('capture-all-events.ts'))} --event-type SessionStart`
            }
          ]
        }
      ],
      PreToolUse: [
        {
          matcher: 'Bash',
          hooks: [
            {
              type: 'command',
              command: getHookCommand(hookPath('security-validator.ts'))
            }
          ]
        },
        {
          matcher: '*',
          hooks: [
            {
              type: 'command',
              command: `${getHookCommand(hookPath('capture-all-events.ts'))} --event-type PreToolUse`
            }
          ]
        }
      ],
      PostToolUse: [
        {
          matcher: '*',
          hooks: [
            {
              type: 'command',
              command: `${getHookCommand(hookPath('capture-all-events.ts'))} --event-type PostToolUse`
            }
          ]
        }
      ],
      Stop: [
        {
          hooks: [
            {
              type: 'command',
              command: getHookCommand(hookPath('stop-hook.ts'))
            },
            {
              type: 'command',
              command: `${getHookCommand(hookPath('capture-all-events.ts'))} --event-type Stop`
            }
          ]
        }
      ],
      SubagentStop: [
        {
          hooks: [
            {
              type: 'command',
              command: getHookCommand(hookPath('subagent-stop-hook.ts'))
            },
            {
              type: 'command',
              command: `${getHookCommand(hookPath('capture-all-events.ts'))} --event-type SubagentStop`
            }
          ]
        }
      ],
      SessionEnd: [
        {
          hooks: [
            {
              type: 'command',
              command: getHookCommand(hookPath('capture-session-summary.ts'))
            },
            {
              type: 'command',
              command: `${getHookCommand(hookPath('capture-all-events.ts'))} --event-type SessionEnd`
            }
          ]
        }
      ],
      UserPromptSubmit: [
        {
          matcher: '*',
          hooks: [
            {
              type: 'command',
              command: getHookCommand(hookPath('cleanup-temp-files.ts'))
            },
            {
              type: 'command',
              command: getHookCommand(hookPath('update-tab-titles.ts'))
            },
            {
              type: 'command',
              command: `${getHookCommand(hookPath('capture-all-events.ts'))} --event-type UserPromptSubmit`
            }
          ]
        }
      ]
    }
  };
}

/**
 * Validates that all required hook scripts exist
 */
function validateHooks(paiDir: string): boolean {
  const requiredHooks = [
    'initialize-session.ts',
    'load-core-context.ts',
    'security-validator.ts',
    'capture-all-events.ts',
    'cleanup-temp-files.ts',
    'update-tab-titles.ts',
    'stop-hook.ts',
    'subagent-stop-hook.ts',
    'capture-session-summary.ts'
  ];

  const hooksDir = join(paiDir, 'hooks');
  const missing: string[] = [];

  for (const hook of requiredHooks) {
    const hookPath = join(hooksDir, hook);
    if (!existsSync(hookPath)) {
      missing.push(hook);
    }
  }

  if (missing.length > 0) {
    console.error('⚠️  WARNING: Some hook scripts are missing:');
    for (const hook of missing) {
      console.error(`  - ${hook}`);
    }
    console.error('');
    console.error('The setup will continue, but hooks may not work correctly.');
    console.error('');
    return false;
  }

  return true;
}

/**
 * Main setup function
 */
async function main() {
  console.log('🔧 PAI System Hook Setup');
  console.log('');

  // Step 1: Get and validate PAI_DIR
  const paiDir = getPaiDir();
  console.log(`✓ PAI_DIR: ${paiDir}`);

  // Step 2: Ensure PAI_DIR exists
  if (!existsSync(paiDir)) {
    console.error(`❌ ERROR: PAI_DIR does not exist: ${paiDir}`);
    console.error('Please create the directory first or check your PAI_DIR setting.');
    process.exit(1);
  }

  // Step 3: Validate hook scripts exist
  console.log('');
  console.log('Validating hook scripts...');
  const allHooksExist = validateHooks(paiDir);

  if (!allHooksExist) {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('Continue anyway? (y/n): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }

  // Step 4: Create .claude directory
  const claudeDir = join(paiDir, '.claude');
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
    console.log(`✓ Created: ${claudeDir}`);
  } else {
    console.log(`✓ Directory exists: ${claudeDir}`);
  }

  // Step 5: Generate settings.json
  const settings = generateSettings(paiDir);
  const settingsPath = join(claudeDir, 'settings.json');

  // Backup existing settings if present
  if (existsSync(settingsPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupPath = join(claudeDir, `settings.backup-${timestamp}.json`);
    const existingContent = await Bun.file(settingsPath).text();
    writeFileSync(backupPath, existingContent);
    console.log(`✓ Backed up existing settings: ${backupPath}`);
  }

  // Write new settings
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  console.log(`✓ Created: ${settingsPath}`);

  // Step 6: Success message
  console.log('');
  console.log('✅ PAI System hooks configured successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Ensure you\'re working within the PAI System directory when you want hooks active');
  console.log('  2. Run: cd $PAI_DIR');
  console.log('  3. Launch Claude Code normally: claude');
  console.log('');
  console.log('Hook Behavior:');
  console.log('  • Hooks are ONLY active when Claude runs in a directory with .claude/settings.json');
  console.log('  • Working in other directories = no hooks (clean Claude Code)');
  console.log('  • This allows isolated development and testing');
  console.log('');
}

// Run main function
main().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
