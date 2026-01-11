#!/usr/bin/env bun
/**
 * PAI (Personal AI Infrastructure) Setup & Doctor Script
 *
 * Usage:
 *   bun run scripts/setup.ts          # Interactive installation
 *   bun run scripts/setup.ts doctor   # Diagnose issues
 *   bun run scripts/setup.ts fix      # Auto-fix issues where possible
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir, platform } from 'os';
import { $ } from 'bun';
import * as readline from 'readline';

// ============================================
// Configuration
// ============================================

const SCRIPT_DIR = dirname(import.meta.path);
const PAI_DIR = dirname(SCRIPT_DIR); // Parent of scripts/
const CLAUDE_DIR = join(homedir(), '.claude');
const CLAUDE_SETTINGS = join(CLAUDE_DIR, 'settings.json');

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  fix?: () => Promise<void>;
}

const results: CheckResult[] = [];

// ============================================
// Utility Functions
// ============================================

function log(icon: string, message: string) {
  console.log(`${icon} ${message}`);
}

function logSection(title: string) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(50));
}

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function askYesNo(question: string, defaultYes: boolean = true): Promise<boolean> {
  const suffix = defaultYes ? ' [Y/n]: ' : ' [y/N]: ';
  const answer = await askQuestion(question + suffix);

  if (answer === '') return defaultYes;
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

async function commandExists(cmd: string): Promise<boolean> {
  try {
    await $`which ${cmd}`.quiet();
    return true;
  } catch {
    // Try Windows 'where' command
    try {
      await $`where ${cmd}`.quiet();
      return true;
    } catch {
      return false;
    }
  }
}

async function getCommandVersion(cmd: string): Promise<string | null> {
  try {
    const result = await $`${cmd} --version`.quiet();
    return result.stdout.toString().trim().split('\n')[0];
  } catch {
    return null;
  }
}

function detectShell(): { type: 'bash' | 'zsh' | 'powershell' | 'unknown', profilePath: string | null } {
  const shell = process.env.SHELL || '';
  const isWindows = platform() === 'win32';

  if (isWindows) {
    // PowerShell
    const psProfile = process.env.PROFILE;
    if (psProfile) {
      return { type: 'powershell', profilePath: psProfile };
    }
    // Default PowerShell profile location
    const defaultProfile = join(homedir(), 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1');
    return { type: 'powershell', profilePath: defaultProfile };
  }

  if (shell.includes('zsh')) {
    return { type: 'zsh', profilePath: join(homedir(), '.zshrc') };
  }

  if (shell.includes('bash')) {
    return { type: 'bash', profilePath: join(homedir(), '.bashrc') };
  }

  // Default to bash
  return { type: 'bash', profilePath: join(homedir(), '.bashrc') };
}

// ============================================
// Checks
// ============================================

async function checkBun(): Promise<CheckResult> {
  const exists = await commandExists('bun');
  if (!exists) {
    return {
      name: 'Bun Runtime',
      status: 'fail',
      message: 'Bun is not installed. Visit https://bun.sh to install.',
    };
  }
  const version = await getCommandVersion('bun');
  return {
    name: 'Bun Runtime',
    status: 'pass',
    message: `Installed: ${version}`,
  };
}

async function checkGit(): Promise<CheckResult> {
  const exists = await commandExists('git');
  if (!exists) {
    return {
      name: 'Git',
      status: 'warn',
      message: 'Git not found. Optional but recommended.',
    };
  }
  const version = await getCommandVersion('git');
  return {
    name: 'Git',
    status: 'pass',
    message: `Installed: ${version}`,
  };
}

async function checkPaiDir(): Promise<CheckResult> {
  const envPaiDir = process.env.PAI_DIR;

  if (!envPaiDir) {
    return {
      name: 'PAI_DIR Environment Variable',
      status: 'fail',
      message: 'PAI_DIR is not set in environment',
      fix: async () => {
        log('🔧', `Setting PAI_DIR=${PAI_DIR}`);
        // This sets it for the current process; user needs to set permanently
        process.env.PAI_DIR = PAI_DIR;
        log('⚠️', 'Add to your shell profile for permanent setup:');
        log('  ', `export PAI_DIR="${PAI_DIR}"`);
      },
    };
  }

  if (envPaiDir !== PAI_DIR) {
    return {
      name: 'PAI_DIR Environment Variable',
      status: 'warn',
      message: `PAI_DIR (${envPaiDir}) differs from script location (${PAI_DIR})`,
    };
  }

  return {
    name: 'PAI_DIR Environment Variable',
    status: 'pass',
    message: `Set to: ${envPaiDir}`,
  };
}

async function checkDirectories(): Promise<CheckResult> {
  const requiredDirs = [
    'hooks',
    'skills',
    'tools',
    'history',
    'agentic_logs',
    'voice',
  ];

  const missing: string[] = [];
  for (const dir of requiredDirs) {
    if (!existsSync(join(PAI_DIR, dir))) {
      missing.push(dir);
    }
  }

  if (missing.length > 0) {
    return {
      name: 'Directory Structure',
      status: 'fail',
      message: `Missing directories: ${missing.join(', ')}`,
      fix: async () => {
        for (const dir of missing) {
          const fullPath = join(PAI_DIR, dir);
          log('🔧', `Creating ${dir}/`);
          mkdirSync(fullPath, { recursive: true });
        }
      },
    };
  }

  return {
    name: 'Directory Structure',
    status: 'pass',
    message: 'All required directories exist',
  };
}

async function checkDependencies(): Promise<CheckResult> {
  const packageDirs = [
    'hooks',
    'observability/apps/server',
    'observability/apps/client',
    'skills/Prompting/Tools',
  ];

  const needsInstall: string[] = [];

  for (const dir of packageDirs) {
    const packageJson = join(PAI_DIR, dir, 'package.json');
    const nodeModules = join(PAI_DIR, dir, 'node_modules');

    if (existsSync(packageJson) && !existsSync(nodeModules)) {
      needsInstall.push(dir);
    }
  }

  if (needsInstall.length > 0) {
    return {
      name: 'Node Dependencies',
      status: 'fail',
      message: `Missing node_modules in: ${needsInstall.join(', ')}`,
      fix: async () => {
        for (const dir of needsInstall) {
          const fullPath = join(PAI_DIR, dir);
          log('🔧', `Installing dependencies in ${dir}/`);
          try {
            await $`cd ${fullPath} && bun install`.quiet();
            log('✅', `Installed ${dir}/`);
          } catch (e) {
            log('❌', `Failed to install ${dir}/`);
          }
        }
      },
    };
  }

  return {
    name: 'Node Dependencies',
    status: 'pass',
    message: 'All dependencies installed',
  };
}

async function checkClaudeSettings(): Promise<CheckResult> {
  const paiSettings = join(PAI_DIR, '.claude', 'settings.json');

  if (!existsSync(CLAUDE_DIR)) {
    return {
      name: 'Claude Code Directory',
      status: 'fail',
      message: '~/.claude directory not found. Is Claude Code installed?',
    };
  }

  if (!existsSync(paiSettings)) {
    return {
      name: 'PAI Hook Settings',
      status: 'fail',
      message: '.claude/settings.json not found in PAI directory',
    };
  }

  // Check if global settings have hooks configured
  if (existsSync(CLAUDE_SETTINGS)) {
    try {
      const globalSettings = JSON.parse(readFileSync(CLAUDE_SETTINGS, 'utf-8'));
      if (globalSettings.hooks) {
        // Check if hooks reference PAI_DIR or hardcoded paths
        const settingsStr = JSON.stringify(globalSettings.hooks);
        if (settingsStr.includes('$PAI_DIR') || settingsStr.includes('${PAI_DIR}')) {
          return {
            name: 'Claude Hook Settings',
            status: 'pass',
            message: 'Global settings use $PAI_DIR variable',
          };
        } else if (settingsStr.includes('.pai/hooks') || settingsStr.includes('.pai\\hooks')) {
          return {
            name: 'Claude Hook Settings',
            status: 'warn',
            message: 'Global settings use hardcoded paths (works but not portable)',
          };
        }
      }
    } catch (e) {
      // Continue to check
    }
  }

  return {
    name: 'Claude Hook Settings',
    status: 'warn',
    message: 'Could not verify hook configuration. Run Claude from PAI directory to use project settings.',
  };
}

async function checkSkillsJunction(): Promise<CheckResult> {
  const paiSkills = join(PAI_DIR, 'skills');
  const paiClaudeDir = join(PAI_DIR, '.claude');
  const paiClaudeSkills = join(paiClaudeDir, 'skills');

  if (!existsSync(paiSkills)) {
    return {
      name: 'Skills Junction',
      status: 'fail',
      message: 'PAI skills directory not found',
    };
  }

  // Ensure .claude directory exists
  if (!existsSync(paiClaudeDir)) {
    mkdirSync(paiClaudeDir, { recursive: true });
  }

  if (!existsSync(paiClaudeSkills)) {
    return {
      name: 'Skills Junction',
      status: 'fail',
      message: `Junction not created: .claude/skills does not exist`,
      fix: async () => {
        log('🔧', `Creating junction: ${paiClaudeSkills} -> ${paiSkills}`);
        try {
          // Use PowerShell to create junction (works without admin)
          await $`powershell -Command "New-Item -ItemType Junction -Path '${paiClaudeSkills}' -Target '${paiSkills}'"`.quiet();
          log('✅', 'Skills junction created');
        } catch (e) {
          // Fallback to mklink
          try {
            await $`cmd /c mklink /J "${paiClaudeSkills}" "${paiSkills}"`.quiet();
            log('✅', 'Skills junction created (mklink)');
          } catch (e2) {
            log('❌', 'Failed to create junction. Try running as administrator.');
            throw e2;
          }
        }
      },
    };
  }

  // Check if it's actually a junction/symlink pointing to PAI skills
  try {
    // Simple check - see if a known file exists through the junction
    const testFile = join(paiClaudeSkills, 'CORE', 'SKILL.md');
    if (existsSync(testFile)) {
      return {
        name: 'Skills Junction',
        status: 'pass',
        message: `.claude/skills -> skills`,
      };
    }
  } catch (e) {
    // Continue to warning
  }

  return {
    name: 'Skills Junction',
    status: 'warn',
    message: `.claude/skills exists but may not be linked correctly`,
  };
}

async function checkHooksWork(): Promise<CheckResult> {
  const testHook = join(PAI_DIR, 'hooks', 'security-validator.ts');

  if (!existsSync(testHook)) {
    return {
      name: 'Hook Scripts',
      status: 'fail',
      message: 'Hook scripts not found',
    };
  }

  // Verify hook files exist and can be loaded
  try {
    const hooksDir = join(PAI_DIR, 'hooks');
    const requiredHooks = [
      'security-validator.ts',
      'capture-all-events.ts',
      'stop-hook.ts',
      'subagent-stop-hook.ts',
      'initialize-session.ts',
      'load-core-context.ts',
    ];

    const missing: string[] = [];
    for (const hook of requiredHooks) {
      if (!existsSync(join(hooksDir, hook))) {
        missing.push(hook);
      }
    }

    if (missing.length > 0) {
      return {
        name: 'Hook Files',
        status: 'fail',
        message: `Missing hooks: ${missing.join(', ')}`,
      };
    }

    return {
      name: 'Hook Files',
      status: 'pass',
      message: `All ${requiredHooks.length} core hooks present (run 'cd hooks && bun test' to verify)`,
    };
  } catch (e) {
    return {
      name: 'Hook Files',
      status: 'warn',
      message: `Could not verify hooks: ${e instanceof Error ? e.message : 'unknown error'}`,
    };
  }
}

async function checkSkills(): Promise<CheckResult> {
  const coreSkill = join(PAI_DIR, 'skills', 'CORE', 'SKILL.md');

  if (!existsSync(coreSkill)) {
    return {
      name: 'Core Skill',
      status: 'fail',
      message: 'CORE skill not found',
    };
  }

  // Count skills
  const skillsDir = join(PAI_DIR, 'skills');
  try {
    const entries = await Bun.file(skillsDir).exists()
      ? []
      : (await $`ls -d ${skillsDir}/*/`.quiet()).stdout.toString().trim().split('\n');

    const skillCount = entries.filter(e => e.trim()).length;
    return {
      name: 'Skills',
      status: 'pass',
      message: `${skillCount} skills installed`,
    };
  } catch {
    return {
      name: 'Skills',
      status: 'pass',
      message: 'CORE skill found',
    };
  }
}

// ============================================
// Interactive Installation Functions
// ============================================

async function configureHooks(): Promise<void> {
  logSection('Hook Configuration');

  log('🔧', 'Configuring PAI hooks...');

  // Call setup-hooks.ts to create PAI's .claude/settings.json
  const setupHooksScript = join(SCRIPT_DIR, 'setup-hooks.ts');

  if (!existsSync(setupHooksScript)) {
    log('❌', 'setup-hooks.ts not found. Skipping hook configuration.');
    return;
  }

  try {
    // Set PAI_DIR for the subprocess
    process.env.PAI_DIR = PAI_DIR;
    await $`bun run ${setupHooksScript}`.env({ PAI_DIR });
    log('✅', 'PAI hooks configured successfully');
  } catch (e) {
    log('❌', 'Failed to configure hooks');
    console.error(e);
    return;
  }

  // Ask about global hooks
  console.log('\nWhere should PAI hooks be active?');
  console.log('  1. Only in PAI directory (recommended)');
  console.log('  2. Globally for all Claude Code sessions');
  console.log('');

  const wantGlobal = await askYesNo('Install hooks globally?', false);

  if (wantGlobal) {
    log('🔧', 'Installing hooks globally...');

    const paiSettings = join(PAI_DIR, '.claude', 'settings.json');

    if (!existsSync(paiSettings)) {
      log('❌', 'PAI settings.json not found');
      return;
    }

    // Backup global settings if they exist
    if (existsSync(CLAUDE_SETTINGS)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const backupPath = join(CLAUDE_DIR, `settings.backup-${timestamp}.json`);
      const existingContent = readFileSync(CLAUDE_SETTINGS, 'utf-8');
      writeFileSync(backupPath, existingContent);
      log('💾', `Backed up existing global settings: ${backupPath}`);
    }

    // Copy PAI settings to global
    const paiSettingsContent = readFileSync(paiSettings, 'utf-8');
    writeFileSync(CLAUDE_SETTINGS, paiSettingsContent);
    log('✅', 'Global hooks installed');
    log('ℹ️', 'PAI hooks will now be active in all directories');
  } else {
    log('✅', 'Hooks configured for PAI directory only');
    log('ℹ️', 'Run Claude Code from PAI directory to activate hooks:');
    log('  ', `cd ${PAI_DIR} && claude`);
  }
}

async function addPaiDirToShellProfile(): Promise<void> {
  logSection('Environment Variable Setup');

  const shell = detectShell();

  if (!shell.profilePath) {
    log('⚠️', 'Could not detect shell profile. Please add PAI_DIR manually:');
    log('  ', `export PAI_DIR="${PAI_DIR}"`);
    return;
  }

  log('🔍', `Detected shell: ${shell.type}`);
  log('📄', `Profile: ${shell.profilePath}`);

  const wantAutoAdd = await askYesNo('Automatically add PAI_DIR to shell profile?', true);

  if (!wantAutoAdd) {
    log('ℹ️', 'Add this to your shell profile manually:');
    if (shell.type === 'powershell') {
      log('  ', `$env:PAI_DIR = "${PAI_DIR}"`);
    } else {
      log('  ', `export PAI_DIR="${PAI_DIR}"`);
    }
    return;
  }

  try {
    // Ensure profile file exists
    if (!existsSync(shell.profilePath)) {
      const profileDir = dirname(shell.profilePath);
      if (!existsSync(profileDir)) {
        mkdirSync(profileDir, { recursive: true });
      }
      writeFileSync(shell.profilePath, '');
    }

    // Check if PAI_DIR is already set
    const profileContent = readFileSync(shell.profilePath, 'utf-8');
    if (profileContent.includes('PAI_DIR')) {
      log('✅', 'PAI_DIR already configured in shell profile');
      return;
    }

    // Add PAI_DIR to profile
    const exportLine = shell.type === 'powershell'
      ? `\n# PAI System\n$env:PAI_DIR = "${PAI_DIR}"\n`
      : `\n# PAI System\nexport PAI_DIR="${PAI_DIR}"\n`;

    appendFileSync(shell.profilePath, exportLine);
    log('✅', `Added PAI_DIR to ${shell.profilePath}`);
    log('ℹ️', 'Restart your terminal or run:');
    if (shell.type === 'powershell') {
      log('  ', `. $PROFILE`);
    } else {
      log('  ', `source ${shell.profilePath}`);
    }
  } catch (e) {
    log('❌', 'Failed to add PAI_DIR to shell profile');
    console.error(e);
  }
}

async function offerPaiCliInstall(): Promise<void> {
  logSection('PAI CLI Installation');

  const paiCliDir = join(PAI_DIR, 'pai-cli');

  if (!existsSync(paiCliDir)) {
    log('⚠️', 'pai-cli directory not found. Skipping CLI installation.');
    return;
  }

  log('ℹ️', 'PAI CLI provides convenience commands like `pai launch` and `pai init bmad`');
  log('ℹ️', 'Note: This will eventually be decoupled from PAI System');

  const wantCli = await askYesNo('Install pai-cli globally?', true);

  if (!wantCli) {
    log('⏭️', 'Skipping pai-cli installation');
    return;
  }

  try {
    log('🔧', 'Installing pai-cli dependencies...');
    await $`cd ${paiCliDir} && npm install`.quiet();

    log('🔧', 'Building pai-cli...');
    await $`cd ${paiCliDir} && npm run build`.quiet();

    log('🔧', 'Installing pai-cli globally...');
    await $`cd ${paiCliDir} && npm install -g .`.quiet();

    log('✅', 'pai-cli installed successfully');
    log('ℹ️', 'You can now use: pai launch, pai init bmad');
  } catch (e) {
    log('❌', 'Failed to install pai-cli');
    console.error(e);
  }
}

// ============================================
// Main Functions
// ============================================

async function runChecks(): Promise<void> {
  logSection('Prerequisites');
  results.push(await checkBun());
  results.push(await checkGit());

  logSection('Environment');
  results.push(await checkPaiDir());
  results.push(await checkDirectories());

  logSection('Dependencies');
  results.push(await checkDependencies());

  logSection('Claude Code Integration');
  results.push(await checkClaudeSettings());
  results.push(await checkSkillsJunction());

  logSection('Verification');
  results.push(await checkHooksWork());
  results.push(await checkSkills());
}

function printResults(): void {
  logSection('Results');

  let passes = 0;
  let fails = 0;
  let warns = 0;

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    log(icon, `${result.name}: ${result.message}`);

    if (result.status === 'pass') passes++;
    else if (result.status === 'fail') fails++;
    else warns++;
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  ✅ ${passes} passed  ❌ ${fails} failed  ⚠️ ${warns} warnings`);
  console.log('─'.repeat(50));

  if (fails > 0) {
    console.log('\nRun with "fix" argument to auto-fix issues:');
    console.log('  bun run scripts/setup.ts fix\n');
  }
}

async function runFixes(): Promise<void> {
  const fixable = results.filter(r => r.status === 'fail' && r.fix);

  if (fixable.length === 0) {
    log('✅', 'No auto-fixable issues found');
    return;
  }

  logSection('Applying Fixes');

  for (const result of fixable) {
    log('🔧', `Fixing: ${result.name}`);
    try {
      await result.fix!();
      log('✅', `Fixed: ${result.name}`);
    } catch (e) {
      log('❌', `Failed to fix: ${result.name}`);
      console.error(e);
    }
  }
}

async function install(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════╗
║     PAI (Personal AI Infrastructure) Setup       ║
╚══════════════════════════════════════════════════╝
`);

  log('📍', `PAI Directory: ${PAI_DIR}`);
  log('🏠', `Home Directory: ${homedir()}`);

  // Run checks first
  await runChecks();
  printResults();

  const hasFails = results.some(r => r.status === 'fail');
  if (hasFails) {
    log('❌', 'Critical issues detected. Please fix issues and re-run setup.');
    process.exit(1);
  }

  // Interactive configuration
  console.log('\n');
  const proceed = await askYesNo('Continue with interactive setup?', true);

  if (!proceed) {
    log('⏭️', 'Setup cancelled');
    process.exit(0);
  }

  // Step 1: Configure hooks
  await configureHooks();

  // Step 2: Add PAI_DIR to shell profile
  await addPaiDirToShellProfile();

  // Step 3: Offer pai-cli installation
  await offerPaiCliInstall();

  // Final success message
  logSection('Installation Complete');
  log('✅', 'PAI System installed successfully!');
  console.log('\nNext steps:');
  console.log('  1. Restart your terminal (or source your shell profile)');
  console.log('  2. Launch Claude Code:');
  console.log(`     cd ${PAI_DIR} && claude`);
  console.log('     OR');
  console.log('     pai launch  (if you installed pai-cli)');
  console.log('');
}

async function doctor(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════╗
║          PAI Doctor - System Diagnosis           ║
╚══════════════════════════════════════════════════╝
`);

  log('📍', `PAI Directory: ${PAI_DIR}`);

  await runChecks();
  printResults();
}

async function fix(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════╗
║         PAI Setup - Auto-Fix Mode                ║
╚══════════════════════════════════════════════════╝
`);

  await runChecks();
  await runFixes();

  // Re-run checks to show updated status
  results.length = 0;
  await runChecks();
  printResults();
}

// ============================================
// Entry Point
// ============================================

const command = process.argv[2] || 'install';

switch (command) {
  case 'doctor':
  case 'check':
    await doctor();
    break;
  case 'fix':
  case 'repair':
    await fix();
    break;
  case 'install':
  case 'setup':
  default:
    await install();
    break;
}
