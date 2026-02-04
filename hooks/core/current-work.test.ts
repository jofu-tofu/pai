/**
 * current-work.test.ts - Multi-session work state management tests
 *
 * Tests the per-session file storage pattern that eliminates race conditions.
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { getSession, setSession, removeSession, getAllSessions, hasSession, type SessionWork } from './current-work';

// Test in isolated temp directory
const TEST_BASE = process.cwd();
const TEST_DIR = join(TEST_BASE, '_test_temp');

// Helper to get paths after PAI_DIR is set
function getTestStateDir(): string {
  return join(TEST_DIR, 'MEMORY', 'STATE');
}

function getTestSessionsDir(): string {
  return join(getTestStateDir(), 'sessions');
}

function getTestSessionFile(sessionId: string): string {
  const safeId = sessionId.replace(/[^a-zA-Z0-9-]/g, '_');
  return join(getTestSessionsDir(), `${safeId}.json`);
}

// Override getPaiDir for tests
const originalEnv = process.env.PAI_DIR;

beforeEach(() => {
  // Set PAI_DIR to test directory BEFORE any module imports evaluate paths
  process.env.PAI_DIR = TEST_DIR;

  // Clean up any existing test data
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
  mkdirSync(getTestStateDir(), { recursive: true });
});

afterEach(() => {
  // Restore original PAI_DIR
  process.env.PAI_DIR = originalEnv;

  // Clean up test directory
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('current-work per-session files', () => {
  test('getSession returns null for missing session', () => {
    const result = getSession('nonexistent');
    expect(result).toBeNull();
  });

  test('setSession creates session file', () => {
    const session: SessionWork = {
      work_dir: '20260124-test-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    setSession('session-1', session);

    // Verify file was created
    expect(existsSync(getTestSessionFile('session-1'))).toBe(true);

    const result = getSession('session-1');
    expect(result).not.toBeNull();
    expect(result!.work_dir).toBe('20260124-test-work');
    expect(result!.item_count).toBe(1);
  });

  test('setSession updates existing session file', () => {
    const session: SessionWork = {
      work_dir: '20260124-test-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    setSession('session-1', session);

    // Update item count
    session.item_count = 5;
    setSession('session-1', session);

    const result = getSession('session-1');
    expect(result!.item_count).toBe(5);
  });

  test('multiple sessions are independent files', () => {
    const session1: SessionWork = {
      work_dir: '20260124-session1-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    const session2: SessionWork = {
      work_dir: '20260124-session2-work',
      created_at: new Date().toISOString(),
      item_count: 3
    };

    setSession('session-1', session1);
    setSession('session-2', session2);

    // Verify separate files
    expect(existsSync(getTestSessionFile('session-1'))).toBe(true);
    expect(existsSync(getTestSessionFile('session-2'))).toBe(true);

    const result1 = getSession('session-1');
    const result2 = getSession('session-2');

    expect(result1!.work_dir).toBe('20260124-session1-work');
    expect(result2!.work_dir).toBe('20260124-session2-work');
    expect(result1!.item_count).toBe(1);
    expect(result2!.item_count).toBe(3);
  });

  test('removeSession removes only specified session file', () => {
    const session1: SessionWork = {
      work_dir: '20260124-session1-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    const session2: SessionWork = {
      work_dir: '20260124-session2-work',
      created_at: new Date().toISOString(),
      item_count: 3
    };

    setSession('session-1', session1);
    setSession('session-2', session2);

    removeSession('session-1');

    expect(existsSync(getTestSessionFile('session-1'))).toBe(false);
    expect(existsSync(getTestSessionFile('session-2'))).toBe(true);
    expect(getSession('session-1')).toBeNull();
    expect(getSession('session-2')).not.toBeNull();
  });

  test('getAllSessions aggregates from all session files', () => {
    const session1: SessionWork = {
      work_dir: '20260124-session1-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    const session2: SessionWork = {
      work_dir: '20260124-session2-work',
      created_at: new Date().toISOString(),
      item_count: 3
    };

    setSession('session-1', session1);
    setSession('session-2', session2);

    const all = getAllSessions();
    expect(Object.keys(all).length).toBe(2);
    expect(all['session-1']).toBeDefined();
    expect(all['session-2']).toBeDefined();
  });

  test('hasSession returns correct boolean', () => {
    const session: SessionWork = {
      work_dir: '20260124-test-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    expect(hasSession('session-1')).toBe(false);

    setSession('session-1', session);

    expect(hasSession('session-1')).toBe(true);
    expect(hasSession('session-2')).toBe(false);
  });

  test('sessionId is sanitized to prevent path traversal', () => {
    const session: SessionWork = {
      work_dir: '20260124-test-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    // Attempt path traversal in session ID
    setSession('../../../evil', session);

    // Should be sanitized to safe filename (../ becomes ___ for each segment)
    const files = readdirSync(getTestSessionsDir());
    expect(files).toContain('_________evil.json');
    expect(files.some(f => f.includes('..'))).toBe(false);
  });
});

describe('corruption recovery', () => {
  test('handles corrupt session file gracefully', () => {
    // Create sessions directory and write invalid JSON
    mkdirSync(getTestSessionsDir(), { recursive: true });
    writeFileSync(getTestSessionFile('corrupt-session'), 'not valid json {{{');

    // Should recover gracefully
    const result = getSession('corrupt-session');
    expect(result).toBeNull();
  });

  test('getAllSessions skips corrupt files', () => {
    const validSession: SessionWork = {
      work_dir: '20260124-valid-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    setSession('valid-session', validSession);

    // Write corrupt file
    writeFileSync(getTestSessionFile('corrupt-session'), 'not valid json');

    const all = getAllSessions();
    expect(Object.keys(all).length).toBe(1);
    expect(all['valid-session']).toBeDefined();
  });
});

describe('stale cleanup', () => {
  test('cleans stale session files on new session creation', () => {
    // Create sessions directory first
    mkdirSync(getTestSessionsDir(), { recursive: true });

    // Write stale session file directly
    const staleSession: SessionWork = {
      work_dir: '20260120-stale-work',
      created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
      item_count: 1
    };
    writeFileSync(getTestSessionFile('stale-session'), JSON.stringify(staleSession, null, 2));

    // Write fresh session file directly
    const freshSession: SessionWork = {
      work_dir: '20260124-fresh-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };
    writeFileSync(getTestSessionFile('fresh-session'), JSON.stringify(freshSession, null, 2));

    // Creating a new session should trigger cleanup
    const newSession: SessionWork = {
      work_dir: '20260124-new-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };
    setSession('new-session', newSession);

    // Stale session should be cleaned
    expect(existsSync(getTestSessionFile('stale-session'))).toBe(false);
    // Fresh session should remain
    expect(existsSync(getTestSessionFile('fresh-session'))).toBe(true);
    // New session should exist
    expect(existsSync(getTestSessionFile('new-session'))).toBe(true);
  });

  test('does not clean sessions on update (not new)', () => {
    // Create sessions directory first
    mkdirSync(getTestSessionsDir(), { recursive: true });

    // Write stale session file directly
    const staleSession: SessionWork = {
      work_dir: '20260120-stale-work',
      created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
      item_count: 1
    };
    writeFileSync(getTestSessionFile('stale-session'), JSON.stringify(staleSession, null, 2));

    // Create existing session (this triggers cleanup once)
    const existingSession: SessionWork = {
      work_dir: '20260124-existing-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };
    setSession('existing-session', existingSession);

    // Write another stale session directly (after first cleanup)
    const staleSession2: SessionWork = {
      work_dir: '20260120-stale-work-2',
      created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      item_count: 1
    };
    writeFileSync(getTestSessionFile('stale-session-2'), JSON.stringify(staleSession2, null, 2));

    // Update existing session (not new)
    existingSession.item_count = 5;
    setSession('existing-session', existingSession);

    // Stale session 2 should NOT be cleaned on update
    expect(existsSync(getTestSessionFile('stale-session-2'))).toBe(true);
    expect(getSession('existing-session')!.item_count).toBe(5);
  });
});

describe('concurrency safety', () => {
  test('concurrent setSession calls do not lose entries', async () => {
    // Spawn 10 concurrent setSession calls
    const promises = Array.from({ length: 10 }, (_, i) =>
      new Promise<void>(resolve => {
        setSession(`concurrent-${i}`, {
          work_dir: `work-${i}`,
          created_at: new Date().toISOString(),
          item_count: i
        });
        resolve();
      })
    );

    await Promise.all(promises);

    // All 10 sessions should exist
    const all = getAllSessions();
    expect(Object.keys(all).length).toBe(10);

    // Verify each session
    for (let i = 0; i < 10; i++) {
      expect(all[`concurrent-${i}`]).toBeDefined();
      expect(all[`concurrent-${i}`].work_dir).toBe(`work-${i}`);
    }
  });

  test('concurrent read and write do not interfere', async () => {
    // Create some initial sessions
    for (let i = 0; i < 5; i++) {
      setSession(`initial-${i}`, {
        work_dir: `initial-work-${i}`,
        created_at: new Date().toISOString(),
        item_count: i
      });
    }

    // Mix of concurrent reads and writes
    const operations: Promise<void>[] = [];

    // Reads
    for (let i = 0; i < 5; i++) {
      operations.push(
        new Promise<void>(resolve => {
          const session = getSession(`initial-${i}`);
          expect(session).not.toBeNull();
          resolve();
        })
      );
    }

    // Writes
    for (let i = 5; i < 10; i++) {
      operations.push(
        new Promise<void>(resolve => {
          setSession(`new-${i}`, {
            work_dir: `new-work-${i}`,
            created_at: new Date().toISOString(),
            item_count: i
          });
          resolve();
        })
      );
    }

    await Promise.all(operations);

    // All sessions should exist
    const all = getAllSessions();
    expect(Object.keys(all).length).toBe(10);
  });
});
