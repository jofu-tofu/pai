// Metadata loading utility for search filtering
// Loads segment metadata from session registry without loading full content

import { Result } from '../types/common';
import { SegmentMetadata, FilterError } from '../types/filters';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

function getPaiDir(): string {
  return process.env.PAI_DIR || join(homedir(), '.pai');
}

interface SessionRegistry {
  sessions: Array<{
    sessionId: string;
    capturedAt: number;
    segmentCount: number;
    tags: string[];
  }>;
  segments: {
    [segmentId: string]: SegmentMetadata;
  };
}

export async function loadSegmentMetadata(
  segmentIds: string[]
): Promise<Result<SegmentMetadata[], FilterError>> {
  try {
    const paiDir = getPaiDir();
    const registryPath = join(
      paiDir,
      'mem-store',
      'structured',
      'session-registry.json'
    );

    // Read registry file
    const content = await readFile(registryPath, 'utf-8');
    const registry: SessionRegistry = JSON.parse(content);

    // Extract metadata for requested segments
    const metadata: SegmentMetadata[] = [];

    for (const segmentId of segmentIds) {
      const segmentData = registry.segments[segmentId];

      if (segmentData) {
        metadata.push(segmentData);
      } else {
        // Segment not found in registry - log warning but continue
        console.error(
          `[Memory:MetadataLoader] Segment ${segmentId} not found in registry`
        );
      }
    }

    console.error(
      `[Memory:MetadataLoader] Loaded metadata for ${metadata.length}/${segmentIds.length} segments`
    );

    return { ok: true, value: metadata };

  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    // Missing registry is acceptable - return empty
    if (err.code === 'ENOENT') {
      console.error('[Memory:MetadataLoader] Registry not found, returning empty');
      return { ok: true, value: [] };
    }

    // Corrupted registry is an error
    if (error instanceof SyntaxError) {
      return {
        ok: false,
        error: {
          code: 'FILTER_REGISTRY_CORRUPT',
          message: `Session registry is corrupted: ${error.message}`,
          cause: error
        }
      };
    }

    // Other errors
    return {
      ok: false,
      error: {
        code: 'FILTER_METADATA_LOAD_FAILED',
        message: `Failed to load metadata: ${err.message}`,
        cause: err
      }
    };
  }
}
