#!/usr/bin/env bun
/**
 * Inference.ts - Unified Claude Inference Tool
 *
 * Provides a unified interface for Claude API calls with three
 * configurable speed/capability levels.
 *
 * Usage:
 *   bun run skills/CORE/Tools/Inference.ts --level [fast|standard|smart] [--json] [--timeout ms] <system_prompt> <user_prompt>
 */

import { spawn } from 'child_process';
import { getKillSignal, getWindowsShellOptions } from '../../../hooks/lib/platform';

type InferenceLevel = 'fast' | 'standard' | 'smart';

interface InferenceOptions {
  systemPrompt: string;
  userPrompt: string;
  level?: InferenceLevel;
  json?: boolean;
  timeout?: number;
}

interface InferenceResult {
  success: boolean;
  output: string;
  parsed?: unknown;
  error?: string;
  level: InferenceLevel;
  latencyMs: number;
}

const LEVEL_CONFIG: Record<InferenceLevel, { model: string; timeout: number }> = {
  fast: { model: 'claude-3-haiku-20240307', timeout: 15000 },
  standard: { model: 'claude-3-5-sonnet-20241022', timeout: 30000 },
  smart: { model: 'claude-3-opus-20240229', timeout: 90000 }
};

export async function inference(options: InferenceOptions): Promise<InferenceResult> {
  const level = options.level || 'standard';
  const config = LEVEL_CONFIG[level];
  const timeout = options.timeout || config.timeout;
  const startTime = Date.now();

  return new Promise((resolve) => {
    const args = [
      '--model', config.model,
      '--print',
      '--no-hooks',
      '-p', `${options.systemPrompt}\n\n${options.userPrompt}`
    ];

    // Remove API key from env to force subscription auth
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;

    const proc = spawn('claude', args, {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      // Windows needs shell: true for command resolution and windowsHide to prevent console popup
      ...getWindowsShellOptions(),
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      // Use platform-appropriate signal (Windows doesn't support POSIX signals)
      proc.kill(getKillSignal());
    }, timeout);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;

      if (timedOut) {
        resolve({
          success: false,
          output: stdout,
          error: `Timeout after ${timeout}ms`,
          level,
          latencyMs
        });
        return;
      }

      if (code !== 0) {
        resolve({
          success: false,
          output: stdout,
          error: stderr || `Exit code: ${code}`,
          level,
          latencyMs
        });
        return;
      }

      let parsed: unknown = undefined;
      if (options.json) {
        try {
          // Extract JSON from response
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          // JSON parsing failed, but that's ok
        }
      }

      resolve({
        success: true,
        output: stdout.trim(),
        parsed,
        level,
        latencyMs
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        success: false,
        output: '',
        error: err.message,
        level,
        latencyMs: Date.now() - startTime
      });
    });
  });
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Inference CLI - Unified Claude inference with configurable levels

Usage:
  bun Inference.ts [options] <system_prompt> <user_prompt>

Options:
  --level <fast|standard|smart>  Model selection (default: standard)
  --json                         Parse JSON from response
  --timeout <ms>                 Custom timeout in milliseconds

Levels:
  fast     - Haiku, 15s timeout (quick tasks)
  standard - Sonnet, 30s timeout (balanced)
  smart    - Opus, 90s timeout (complex reasoning)

Examples:
  bun Inference.ts "You are a helpful assistant" "What is 2+2?"
  bun Inference.ts --level fast "Summarizer" "Summarize: [text]"
  bun Inference.ts --level smart --json "Return JSON" "List 3 colors as JSON array"
`);
    process.exit(0);
  }

  let level: InferenceLevel = 'standard';
  let json = false;
  let timeout: number | undefined;
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--level' && args[i + 1]) {
      level = args[++i] as InferenceLevel;
    } else if (args[i] === '--json') {
      json = true;
    } else if (args[i] === '--timeout' && args[i + 1]) {
      timeout = parseInt(args[++i], 10);
    } else {
      positional.push(args[i]);
    }
  }

  if (positional.length < 2) {
    console.error('Error: Both system_prompt and user_prompt are required');
    process.exit(1);
  }

  const [systemPrompt, userPrompt] = positional;

  console.log(`Running inference (level: ${level})...`);
  const result = await inference({ systemPrompt, userPrompt, level, json, timeout });

  if (result.success) {
    console.log(`\nSuccess (${result.latencyMs}ms):\n`);
    console.log(result.output);
    if (result.parsed) {
      console.log('\nParsed JSON:');
      console.log(JSON.stringify(result.parsed, null, 2));
    }
  } else {
    console.error(`\nError (${result.latencyMs}ms): ${result.error}`);
    if (result.output) {
      console.log('Partial output:', result.output);
    }
    process.exit(1);
  }
}

// Only run CLI when executed directly, not when imported
if (import.meta.main) {
  main().catch(console.error);
}
