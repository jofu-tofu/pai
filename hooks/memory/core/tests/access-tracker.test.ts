import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { incrementAccessCount, batchIncrementAccessCounts } from '../access-tracker';

const TEST_PAI_DIR = join(homedir(), '.pai-test-access-tracker');
const REGISTRY_DIR = join(TEST_PAI_DIR, 'mem-store/structured');
const REGISTRY_PATH = join(REGISTRY_DIR, 'session-registry.json');

describe('Access Tracker', () => {
  beforeAll(() => {
    mkdirSync(REGISTRY_DIR, { recursive: true });
    process.env.PAI_DIR = TEST_PAI_DIR;
  });

  afterAll(() => {
    if (existsSync(TEST_PAI_DIR)) {
      rmSync(TEST_PAI_DIR, { recursive: true, force: true });
    }
    delete process.env.PAI_DIR;
  });

  describe('incrementAccessCount()', () => {
    test('should increment access count for existing segment', async () => {
      // Create initial registry
      const initialRegistry = {
        sessions: [
          {
            sessionId: 'mem_test_001',
            segments: [
              {
                id: 'seg_access_001',
                timestamp: Date.now(),
                accessCount: 5,
                lastAccessed: Date.now() - 10000
              }
            ]
          }
        ]
      };

      writeFileSync(REGISTRY_PATH, JSON.stringify(initialRegistry, null, 2), 'utf-8');

      const result = await incrementAccessCount('seg_access_001');

      expect(result.ok).toBe(true);

      // Verify update
      const updatedContent = readFileSync(REGISTRY_PATH, 'utf-8');
      const updated = JSON.parse(updatedContent);

      const segment = updated.sessions[0].segments[0];
      expect(segment.accessCount).toBe(6);
      expect(segment.lastAccessed).toBeGreaterThan(initialRegistry.sessions[0].segments[0].lastAccessed!);
    });

    test('should handle missing registry gracefully', async () => {
      // Remove registry file
      if (existsSync(REGISTRY_PATH)) {
        rmSync(REGISTRY_PATH);
      }

      const result = await incrementAccessCount('seg_any');

      expect(result.ok).toBe(true);
    });

    test('should handle missing segment gracefully', async () => {
      const registry = {
        sessions: [
          {
            sessionId: 'mem_test_001',
            segments: [
              {
                id: 'seg_exists',
                timestamp: Date.now(),
                accessCount: 2,
                lastAccessed: null
              }
            ]
          }
        ]
      };

      writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

      const result = await incrementAccessCount('seg_nonexistent');

      expect(result.ok).toBe(true);
    });

    test('should initialize accessCount if missing', async () => {
      const registry = {
        sessions: [
          {
            sessionId: 'mem_test_001',
            segments: [
              {
                id: 'seg_no_count',
                timestamp: Date.now()
                // accessCount missing
              }
            ]
          }
        ]
      };

      writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

      const result = await incrementAccessCount('seg_no_count');

      expect(result.ok).toBe(true);

      // Verify initialized to 1
      const updatedContent = readFileSync(REGISTRY_PATH, 'utf-8');
      const updated = JSON.parse(updatedContent);
      expect(updated.sessions[0].segments[0].accessCount).toBe(1);
    });

    test('should find segment across multiple sessions', async () => {
      const registry = {
        sessions: [
          {
            sessionId: 'mem_test_001',
            segments: [
              { id: 'seg_other', timestamp: Date.now(), accessCount: 1 }
            ]
          },
          {
            sessionId: 'mem_test_002',
            segments: [
              { id: 'seg_target', timestamp: Date.now(), accessCount: 3 }
            ]
          }
        ]
      };

      writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

      const result = await incrementAccessCount('seg_target');

      expect(result.ok).toBe(true);

      const updatedContent = readFileSync(REGISTRY_PATH, 'utf-8');
      const updated = JSON.parse(updatedContent);
      expect(updated.sessions[1].segments[0].accessCount).toBe(4);
    });
  });

  describe('batchIncrementAccessCounts()', () => {
    test('should update multiple segments in batch', async () => {
      const registry = {
        sessions: [
          {
            sessionId: 'mem_test_001',
            segments: [
              { id: 'seg_batch_001', timestamp: Date.now(), accessCount: 2 },
              { id: 'seg_batch_002', timestamp: Date.now(), accessCount: 5 },
              { id: 'seg_batch_003', timestamp: Date.now(), accessCount: 1 }
            ]
          }
        ]
      };

      writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

      const result = await batchIncrementAccessCounts([
        'seg_batch_001',
        'seg_batch_002',
        'seg_batch_003'
      ]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(3);
      }

      // Verify all updated
      const updatedContent = readFileSync(REGISTRY_PATH, 'utf-8');
      const updated = JSON.parse(updatedContent);

      expect(updated.sessions[0].segments[0].accessCount).toBe(3);
      expect(updated.sessions[0].segments[1].accessCount).toBe(6);
      expect(updated.sessions[0].segments[2].accessCount).toBe(2);
    });

    test('should handle partial matches in batch', async () => {
      const registry = {
        sessions: [
          {
            sessionId: 'mem_test_001',
            segments: [
              { id: 'seg_exists', timestamp: Date.now(), accessCount: 1 }
            ]
          }
        ]
      };

      writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

      const result = await batchIncrementAccessCounts([
        'seg_exists',
        'seg_nonexistent'
      ]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(1);  // Only one found
      }
    });

    test('should handle empty segment list', async () => {
      const registry = {
        sessions: [
          {
            sessionId: 'mem_test_001',
            segments: []
          }
        ]
      };

      writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

      const result = await batchIncrementAccessCounts([]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(0);
      }
    });

    test('should handle missing registry gracefully', async () => {
      if (existsSync(REGISTRY_PATH)) {
        rmSync(REGISTRY_PATH);
      }

      const result = await batchIncrementAccessCounts(['seg_any']);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(0);
      }
    });

    test('should update lastAccessed timestamp for all segments', async () => {
      const oldTime = Date.now() - 10000;
      const registry = {
        sessions: [
          {
            sessionId: 'mem_test_001',
            segments: [
              { id: 'seg_time_001', timestamp: oldTime, accessCount: 0, lastAccessed: oldTime },
              { id: 'seg_time_002', timestamp: oldTime, accessCount: 0, lastAccessed: oldTime }
            ]
          }
        ]
      };

      writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

      const result = await batchIncrementAccessCounts(['seg_time_001', 'seg_time_002']);

      expect(result.ok).toBe(true);

      const updatedContent = readFileSync(REGISTRY_PATH, 'utf-8');
      const updated = JSON.parse(updatedContent);

      // All lastAccessed should be updated to recent time
      expect(updated.sessions[0].segments[0].lastAccessed).toBeGreaterThan(oldTime);
      expect(updated.sessions[0].segments[1].lastAccessed).toBeGreaterThan(oldTime);
    });

    test('should use same timestamp for all updates in batch', async () => {
      const registry = {
        sessions: [
          {
            sessionId: 'mem_test_001',
            segments: [
              { id: 'seg_sync_001', timestamp: Date.now(), accessCount: 0 },
              { id: 'seg_sync_002', timestamp: Date.now(), accessCount: 0 }
            ]
          }
        ]
      };

      writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

      const result = await batchIncrementAccessCounts(['seg_sync_001', 'seg_sync_002']);

      expect(result.ok).toBe(true);

      const updatedContent = readFileSync(REGISTRY_PATH, 'utf-8');
      const updated = JSON.parse(updatedContent);

      // Both should have same lastAccessed timestamp (batch update)
      expect(updated.sessions[0].segments[0].lastAccessed).toBe(
        updated.sessions[0].segments[1].lastAccessed
      );
    });
  });
});
