#!/usr/bin/env bun

/**
 * Session Capture Hook
 *
 * Captures session transcripts when SessionEnd event fires.
 * Writes raw transcript to queue for async processing.
 * Spawns background processor if none is running.
 *
 * CRITICAL: ALWAYS exits 0 (never blocks PAI)
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { generateSessionId } from './lib/id-generator';
import { isProcessorRunning } from './lib/lock';
import { getMemoryConfig } from './core/config';

// Constants
const STALE_LOCK_TIMEOUT_MS = 60000; // 60 seconds

/**
 * Gets PAI directory path from environment or uses default.
 */
function getPaiDir(): string {
  return process.env.PAI_DIR || join(homedir(), '.pai');
}

/**
 * Reads complete stdin stream using Bun's ReadableStream API.
 */
async function readStdin(): Promise<string> {
  let input = '';
  const decoder = new TextDecoder();
  const reader = Bun.stdin.stream().getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      input += decoder.decode(value, { stream: true });
    }
  } catch (e) {
    // Ignore read errors - graceful degradation
  }

  return input;
}

/**
 * Spawns background processor as fully detached process.
 * Uses fire-and-forget pattern (no wait).
 */
function spawnProcessor() {
  const processorPath = join(getPaiDir(), 'hooks', 'memory', 'process-queue.ts');

  try {
    // Spawn using Bun.spawn (NOT child_process)
    Bun.spawn(['bun', 'run', processorPath], {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore'],
      env: process.env
    });

    console.error('[Memory:Capture] Spawned background processor');
  } catch (error) {
    console.error(`[Memory:Capture] Failed to spawn processor: ${(error as Error).message}`);
    // Don't throw - this is not critical failure
  }
}

/**
 * Main hook logic
 */
async function main() {
  const startTime = Date.now();

  try {
    // LEVEL 1: Check if memory system is globally enabled
    const configResult = await getMemoryConfig();

    if (!configResult.ok) {
      console.error(`[Memory:Capture] Failed to load config: ${configResult.error.message}`);
      console.error('[Memory:Capture] Using defaults, assuming enabled');
      // Graceful degradation - continue with defaults
    } else {
      const config = configResult.value;

      // LEVEL 1: Global toggle check
      if (!config.enabled) {
        console.error('[Memory:Capture] Memory system disabled, exiting');
        process.exit(0);  // No-op, zero overhead
      }

      // LEVEL 2: Hook-specific toggle check (Story 3.3)
      if (!config.hooks.sessionEnd) {
        console.error('[Memory:Capture] SessionEnd hook disabled, exiting');
        process.exit(0);  // No-op, zero overhead
      }
    }

    // THEN: Read session payload from stdin
    const input = await readStdin();
    if (!input.trim()) {
      // Empty input - graceful no-op
      process.exit(0);
    }

    // Parse payload
    let payload: any;
    try {
      payload = JSON.parse(input);
      // Basic validation: ensure it's an object
      if (typeof payload !== 'object' || payload === null) {
        throw new Error('Payload must be an object');
      }
    } catch (parseError) {
      throw new Error(`Invalid JSON payload: ${(parseError as Error).message}`);
    }

    // Generate session ID
    const sessionIdResult = generateSessionId();
    if (!sessionIdResult.ok) {
      console.error(`[Memory:Capture] Failed to generate session ID: ${sessionIdResult.error.message}`);
      process.exit(0);
    }
    const sessionId = sessionIdResult.value;

    // Create queue file
    const queueDir = join(getPaiDir(), 'mem-store', 'queue');
    await fs.mkdir(queueDir, { recursive: true });

    const timestamp = Date.now();
    const queueFile = join(queueDir, `${timestamp}_${sessionId}.json`);

    const queueData = {
      sessionId,
      transcript: payload.transcript || payload,
      capturedAt: timestamp,
      metadata: {
        source: 'SessionEnd',
        version: '1.0.0',
        ...payload.metadata
      }
    };

    await fs.writeFile(queueFile, JSON.stringify(queueData, null, 2), 'utf-8');

    // Check if processor is running
    const lockPath = join(queueDir, '.processor.lock');
    const processorCheck = isProcessorRunning(lockPath, STALE_LOCK_TIMEOUT_MS);

    if (!processorCheck.ok) {
      // Error checking lock - assume no processor running
      console.error(`[Memory:Capture] Error checking lock: ${processorCheck.error.message}`);
      spawnProcessor();
    } else if (!processorCheck.value) {
      // No processor running - spawn one
      spawnProcessor();
    } else {
      // Processor already running
      console.error('[Memory:Capture] Processor already running, skipping spawn');
    }

    // Performance monitoring
    const elapsed = Date.now() - startTime;
    if (elapsed > 1000) {
      console.error(`[Memory:Capture] WARNING: Execution took ${elapsed}ms (budget: 1000ms)`);
    }

    process.exit(0);
  } catch (error) {
    console.error(`[Memory:Capture] Error: ${(error as Error).message}`);
    process.exit(0); // CRITICAL: Always exit 0
  }
}

main();
