/**
 * spawn.ts - Cross-platform process spawning utilities
 *
 * Provides platform-agnostic wrappers around child_process that work
 * consistently across Windows, macOS, and Linux, and across runtimes
 * (Node.js, Bun, Deno).
 *
 * Use these instead of Bun.spawn or Bun.$ for portable code.
 */

import { spawn, spawnSync, type SpawnOptions, type SpawnSyncOptions } from 'child_process';
import {
  isWindows,
  getDefaultShell,
  getWindowsSpawnOptions,
  getWindowsSyncSpawnOptions,
  getEnvVar,
} from './platform';

// =============================================================================
// Shell Command Helper
// =============================================================================

/**
 * Get the appropriate shell and argument for the current platform.
 * Windows uses cmd /c, Unix-like systems use the default shell with -c.
 */
function getShellCommand(): { shell: string; arg: string } {
  return isWindows()
    ? { shell: 'cmd', arg: '/c' }
    : { shell: getDefaultShell(), arg: '-c' };
}

// =============================================================================
// Types
// =============================================================================

export interface CrossSpawnOptions extends SpawnOptions {
  /** If true, the child process will be detached from the parent */
  detached?: boolean;
  /** Working directory for the child process */
  cwd?: string;
  /** Environment variables for the child process */
  env?: NodeJS.ProcessEnv;
}

export interface CrossSpawnSyncOptions extends SpawnSyncOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  /** Working directory for the child process */
  cwd?: string;
  /** Encoding for stdout/stderr */
  encoding?: BufferEncoding;
}

export interface SpawnResult {
  /** Exit code (null if process was killed) */
  code: number | null;
  /** Signal that killed the process (null if exited normally) */
  signal: NodeJS.Signals | null;
  /** stdout as string (if encoding was specified) */
  stdout: string;
  /** stderr as string (if encoding was specified) */
  stderr: string;
  /** Whether the process exited successfully (code 0) */
  success: boolean;
}

// =============================================================================
// Runtime Detection
// =============================================================================

/**
 * Detect the current JavaScript runtime.
 */
export function getRuntime(): 'bun' | 'node' | 'deno' | 'unknown' {
  // @ts-ignore - Bun global exists in Bun runtime
  if (typeof Bun !== 'undefined') return 'bun';
  // @ts-ignore - Deno global exists in Deno runtime
  if (typeof Deno !== 'undefined') return 'deno';
  if (typeof process !== 'undefined' && process.versions?.node) return 'node';
  return 'unknown';
}

/**
 * Get the command to invoke the current runtime.
 * Useful for spawning scripts that should run in the same runtime.
 */
export function getRuntimeCommand(): string {
  const runtime = getRuntime();
  switch (runtime) {
    case 'bun': return 'bun';
    case 'deno': return 'deno';
    case 'node': return 'node';
    default: return getEnvVar('RUNTIME_CMD') || 'node';
  }
}

// =============================================================================
// Spawn Functions
// =============================================================================

/**
 * Spawn a child process asynchronously.
 * Cross-platform wrapper around child_process.spawn.
 *
 * @param command - The command to run
 * @param args - Arguments to pass to the command
 * @param options - Spawn options
 * @returns The spawned ChildProcess
 */
export function crossSpawn(
  command: string,
  args: string[] = [],
  options: CrossSpawnOptions = {}
) {
  const spawnOptions: SpawnOptions = {
    ...options,
    // Use shell on Windows for better command resolution
    shell: options.shell ?? false,
    // Hide console window on Windows
    ...getWindowsSpawnOptions(),
  };

  return spawn(command, args, spawnOptions);
}

/**
 * Spawn a child process synchronously and wait for it to complete.
 * Cross-platform wrapper around child_process.spawnSync.
 *
 * @param command - The command to run
 * @param args - Arguments to pass to the command
 * @param options - Spawn options
 * @returns SpawnResult with exit code, stdout, stderr
 */
export function crossSpawnSync(
  command: string,
  args: string[] = [],
  options: CrossSpawnSyncOptions = {}
): SpawnResult {
  const spawnOptions: SpawnSyncOptions = {
    encoding: options.encoding || 'utf-8',
    timeout: options.timeout,
    cwd: options.cwd,
    env: options.env,
    stdio: options.stdio || ['pipe', 'pipe', 'pipe'],
    // Hide console window on Windows
    ...getWindowsSyncSpawnOptions(),
  };

  const result = spawnSync(command, args, spawnOptions);

  return {
    code: result.status,
    signal: result.signal,
    stdout: (result.stdout?.toString() || '').trim(),
    stderr: (result.stderr?.toString() || '').trim(),
    success: result.status === 0,
  };
}

/**
 * Run a shell command string.
 * This is the cross-platform replacement for Bun.$ template literals.
 *
 * SECURITY NOTE: Avoid using this with user input. Prefer crossSpawn with
 * explicit args array for better security.
 *
 * @param command - The shell command to run
 * @param options - Spawn options
 * @returns Promise that resolves with the result
 */
export async function shellExec(
  command: string,
  options: CrossSpawnOptions = {}
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    // Use platform-appropriate shell with proper argument syntax
    const { shell, arg: shellArg } = getShellCommand();

    const child = spawn(shell, [shellArg, command], {
      ...options,
      stdio: options.stdio || ['pipe', 'pipe', 'pipe'],
      // Hide console window on Windows
      ...getWindowsSpawnOptions(),
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code, signal) => {
      resolve({
        code,
        signal,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        success: code === 0,
      });
    });
  });
}

/**
 * Run a shell command string synchronously.
 * Cross-platform replacement for synchronous shell execution.
 *
 * @param command - The shell command to run
 * @param options - Spawn options
 * @returns SpawnResult with exit code, stdout, stderr
 */
export function shellExecSync(
  command: string,
  options: CrossSpawnSyncOptions = {}
): SpawnResult {
  // Use platform-appropriate shell with proper argument syntax
  const { shell, arg: shellArg } = getShellCommand();

  return crossSpawnSync(shell, [shellArg, command], options);
}

/**
 * Spawn a fire-and-forget background process.
 * The process runs independently and won't block the parent.
 *
 * @param command - The command to run
 * @param args - Arguments to pass to the command
 * @param options - Spawn options
 */
export function spawnDetached(
  command: string,
  args: string[] = [],
  options: CrossSpawnOptions = {}
): void {
  const child = spawn(command, args, {
    ...options,
    detached: true,
    stdio: options.stdio || 'ignore',
    // Hide console window on Windows
    ...getWindowsSpawnOptions(),
  });

  // Unref so the parent can exit independently
  child.unref();
}

/**
 * Run a script using the current runtime.
 * Automatically uses bun/node/deno based on detected runtime.
 *
 * @param scriptPath - Path to the script to run
 * @param args - Arguments to pass to the script
 * @param options - Spawn options
 * @returns SpawnResult
 */
export function runScript(
  scriptPath: string,
  args: string[] = [],
  options: CrossSpawnSyncOptions = {}
): SpawnResult {
  const runtime = getRuntimeCommand();
  return crossSpawnSync(runtime, [scriptPath, ...args], options);
}

/**
 * Run a script in the background using the current runtime.
 *
 * @param scriptPath - Path to the script to run
 * @param args - Arguments to pass to the script
 * @param options - Spawn options
 */
export function runScriptDetached(
  scriptPath: string,
  args: string[] = [],
  options: CrossSpawnOptions = {}
): void {
  const runtime = getRuntimeCommand();
  spawnDetached(runtime, [scriptPath, ...args], options);
}
