#!/usr/bin/env bun
/**
 * ============================================================================
 * INFERENCE - Unified inference tool with three run levels
 * ============================================================================
 *
 * PURPOSE:
 * Single inference tool with configurable speed/capability trade-offs:
 * - Fast: Haiku - quick tasks, simple generation, basic classification
 * - Standard: Sonnet - balanced reasoning, typical analysis
 * - Smart: Opus - deep reasoning, strategic decisions, complex analysis
 *
 * USAGE:
 *   import { inference } from './core/inference';
 *   const result = await inference({
 *     systemPrompt: 'You classify prompts...',
 *     userPrompt: 'Hello world',
 *     level: 'standard',
 *     expectJson: true,
 *   });
 *
 * BILLING: Uses Claude CLI with subscription (not API key)
 *
 * ============================================================================
 */

import { spawn } from 'child_process';

export type InferenceLevel = 'fast' | 'standard' | 'smart';

export interface InferenceOptions {
  systemPrompt: string;
  userPrompt: string;
  level?: InferenceLevel;
  expectJson?: boolean;
  timeout?: number;
}

export interface InferenceResult {
  success: boolean;
  output: string;
  parsed?: unknown;
  error?: string;
  latencyMs: number;
  level: InferenceLevel;
}

// Level configurations
const LEVEL_CONFIG: Record<InferenceLevel, { model: string; defaultTimeout: number }> = {
  fast: { model: 'haiku', defaultTimeout: 15000 },
  standard: { model: 'sonnet', defaultTimeout: 30000 },
  smart: { model: 'opus', defaultTimeout: 90000 },
};

/**
 * Run inference with configurable level
 */
export async function inference(options: InferenceOptions): Promise<InferenceResult> {
  const level = options.level || 'standard';
  const config = LEVEL_CONFIG[level];
  const startTime = Date.now();
  const timeout = options.timeout || config.defaultTimeout;

  return new Promise((resolve) => {
    // Build environment WITHOUT ANTHROPIC_API_KEY to force subscription auth
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;

    // Windows cmd.exe quoting: with shell:true, Node.js sets
    // windowsVerbatimArguments — args are joined with spaces, NOT quoted.
    // We must manually wrap multi-word/special-char args in "..." for cmd.exe.
    // Inside double quotes: "" = literal ", and |&<> are safe (not interpreted).
    const isWin = process.platform === 'win32';

    let sysPromptArg = options.systemPrompt.replace(/\r?\n/g, ' ');
    if (isWin) {
      sysPromptArg = '"' + sysPromptArg.replace(/"/g, '""') + '"';
    }

    // On Windows with shell:true, empty '' is dropped by cmd.exe.
    // Use '""' which cmd.exe interprets as actual empty string.
    const empty = isWin ? '""' : '';

    const args = [
      '--print',
      '--model', config.model,
      '--tools', empty,  // Disable tools for faster response
      '--output-format', 'text',
      '--setting-sources', empty,  // Disable hooks to prevent recursion
      '--system-prompt', sysPromptArg,
    ];

    let stdout = '';
    let stderr = '';

    // shell:true needed for .cmd resolution on Windows. User prompt piped
    // via stdin to bypass cmd.exe interpretation of special chars in prompt.
    const proc = spawn('claude', args, {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      windowsHide: true,
    });

    // Pipe user prompt via stdin (avoids arg parsing issues on Windows)
    proc.stdin.write(options.userPrompt);
    proc.stdin.end();

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle timeout
    const timeoutId = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        success: false,
        output: '',
        error: `Timeout after ${timeout}ms`,
        latencyMs: Date.now() - startTime,
        level,
      });
    }, timeout);

    proc.on('close', (code) => {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (code !== 0) {
        resolve({
          success: false,
          output: stdout,
          error: stderr || `Process exited with code ${code}`,
          latencyMs,
          level,
        });
        return;
      }

      const output = stdout.trim();

      // Parse JSON if requested
      if (options.expectJson) {
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            resolve({
              success: true,
              output,
              parsed,
              latencyMs,
              level,
            });
            return;
          } catch {
            resolve({
              success: false,
              output,
              error: 'Failed to parse JSON response',
              latencyMs,
              level,
            });
            return;
          }
        }
        resolve({
          success: false,
          output,
          error: 'No JSON found in response',
          latencyMs,
          level,
        });
        return;
      }

      resolve({
        success: true,
        output,
        latencyMs,
        level,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutId);
      resolve({
        success: false,
        output: '',
        error: err.message,
        latencyMs: Date.now() - startTime,
        level,
      });
    });
  });
}
