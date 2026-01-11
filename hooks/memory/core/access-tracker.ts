/**
 * Access tracking for memory usage signals.
 *
 * Updates accessCount and lastAccessed for retrieved segments.
 */

import { join } from 'path';
import { homedir } from 'os';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Result } from '../types/common';

export interface AccessError {
  code: string;
  message: string;
  cause?: Error;
}

function getPaiDir(): string {
  return process.env.PAI_DIR || join(homedir(), '.pai');
}

const REGISTRY_PATH = 'mem-store/structured/session-registry.json';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 50;

/**
 * Increment access count and update lastAccessed for a segment.
 *
 * Updates session-registry.json with new values.
 * Includes retry logic for concurrent update conflicts.
 *
 * @param segmentId - Segment to update
 * @returns Result indicating success or failure
 */
export async function incrementAccessCount(
  segmentId: string
): Promise<Result<void, AccessError>> {
  const paiDir = getPaiDir();
  const registryPath = join(paiDir, REGISTRY_PATH);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (!existsSync(registryPath)) {
        console.error(
          `[Memory:AccessTracker] Registry not found at ${registryPath}, skipping update`
        );
        return { ok: true };  // Not an error, system may not be initialized yet
      }

      // Read current registry
      const registryContent = readFileSync(registryPath, 'utf-8');
      const registry = JSON.parse(registryContent);

      // Find segment in registry
      let found = false;
      for (const session of (registry.sessions || [])) {
        for (const segment of (session.segments || [])) {
          if (segment.id === segmentId) {
            segment.accessCount = (segment.accessCount || 0) + 1;
            segment.lastAccessed = Date.now();
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        console.error(
          `[Memory:AccessTracker] Segment ${segmentId} not found in registry, skipping update`
        );
        return { ok: true };  // Not an error, segment may be new
      }

      // Write updated registry
      writeFileSync(
        registryPath,
        JSON.stringify(registry, null, 2),
        'utf-8'
      );

      console.error(
        `[Memory:AccessTracker] Updated access count for ${segmentId}`
      );

      return { ok: true };

    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES - 1;

      if (!isLastAttempt) {
        console.error(
          `[Memory:AccessTracker] Retry ${attempt + 1}/${MAX_RETRIES} for ${segmentId}`
        );
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
        continue;
      }

      return {
        ok: false,
        error: {
          code: 'ACCESS_UPDATE_FAILED',
          message: `Failed to update access count: ${(error as Error).message}`,
          cause: error as Error
        }
      };
    }
  }

  // Should never reach here
  return {
    ok: false,
    error: {
      code: 'ACCESS_UPDATE_FAILED',
      message: 'Max retries exceeded',
    }
  };
}

/**
 * Batch update access counts for multiple segments.
 *
 * More efficient than individual updates when injecting multiple memories.
 *
 * @param segmentIds - Array of segment IDs to update
 * @returns Result with count of successful updates
 */
export async function batchIncrementAccessCounts(
  segmentIds: string[]
): Promise<Result<number, AccessError>> {
  const paiDir = getPaiDir();
  const registryPath = join(paiDir, REGISTRY_PATH);

  try {
    if (!existsSync(registryPath)) {
      console.error(
        `[Memory:AccessTracker] Registry not found, skipping batch update`
      );
      return { ok: true, value: 0 };
    }

    // Read current registry
    const registryContent = readFileSync(registryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    // Build set for fast lookup
    const targetIds = new Set(segmentIds);
    let updateCount = 0;
    const currentTime = Date.now();

    // Update all matching segments
    for (const session of (registry.sessions || [])) {
      for (const segment of (session.segments || [])) {
        if (targetIds.has(segment.id)) {
          segment.accessCount = (segment.accessCount || 0) + 1;
          segment.lastAccessed = currentTime;
          updateCount++;
        }
      }
    }

    // Write updated registry
    writeFileSync(
      registryPath,
      JSON.stringify(registry, null, 2),
      'utf-8'
    );

    console.error(
      `[Memory:AccessTracker] Updated ${updateCount}/${segmentIds.length} segments`
    );

    return { ok: true, value: updateCount };

  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'BATCH_UPDATE_FAILED',
        message: `Batch update failed: ${(error as Error).message}`,
        cause: error as Error
      }
    };
  }
}
