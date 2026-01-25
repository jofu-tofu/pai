/**
 * current-work.test.ts - Multi-session work state management tests
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { getSession, setSession, removeSession, getAllSessions, hasSession, type SessionWork } from './current-work';

// Test in isolated temp directory
const TEST_BASE = process.cwd();
const TEST_DIR = join(TEST_BASE, '_test_temp');

// Helper to get paths after PAI_DIR is set
function getTestStateDir(): string {
  return join(TEST_DIR, 'MEMORY', 'STATE');
}

function getTestCurrentWorkFile(): string {
  return join(getTestStateDir(), 'current-work.json');
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

describe('current-work multi-session', () => {
  test('getSession returns null for missing session', () => {
    const result = getSession('nonexistent');
    expect(result).toBeNull();
  });

  test('setSession creates new session', () => {
    const session: SessionWork = {
      work_dir: '20260124-test-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    setSession('session-1', session);

    const result = getSession('session-1');
    expect(result).not.toBeNull();
    expect(result!.work_dir).toBe('20260124-test-work');
    expect(result!.item_count).toBe(1);
  });

  test('setSession updates existing session', () => {
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

  test('multiple sessions are independent', () => {
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

    const result1 = getSession('session-1');
    const result2 = getSession('session-2');

    expect(result1!.work_dir).toBe('20260124-session1-work');
    expect(result2!.work_dir).toBe('20260124-session2-work');
    expect(result1!.item_count).toBe(1);
    expect(result2!.item_count).toBe(3);
  });

  test('removeSession removes only specified session', () => {
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

    expect(getSession('session-1')).toBeNull();
    expect(getSession('session-2')).not.toBeNull();
  });

  test('removeSession deletes file when last session removed', () => {
    const session: SessionWork = {
      work_dir: '20260124-test-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    setSession('session-1', session);
    expect(existsSync(getTestCurrentWorkFile())).toBe(true);

    removeSession('session-1');
    expect(existsSync(getTestCurrentWorkFile())).toBe(false);
  });

  test('getAllSessions returns all sessions', () => {
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
});

describe('legacy migration', () => {
  test('migrates v1 format to v2', () => {
    // Write legacy format directly
    const legacy = {
      session_id: 'legacy-session',
      work_dir: '20260124-legacy-work',
      created_at: new Date().toISOString(),
      item_count: 5
    };

    writeFileSync(getTestCurrentWorkFile(), JSON.stringify(legacy, null, 2));

    // Read should trigger migration
    const result = getSession('legacy-session');

    expect(result).not.toBeNull();
    expect(result!.work_dir).toBe('20260124-legacy-work');
    expect(result!.item_count).toBe(5);

    // Verify file is now v2 format
    const content = JSON.parse(readFileSync(getTestCurrentWorkFile(), 'utf-8'));
    expect(content._version).toBe(2);
    expect(content.sessions).toBeDefined();
    expect(content.sessions['legacy-session']).toBeDefined();
  });
});

describe('corruption recovery', () => {
  test('recovers from corrupted JSON', () => {
    // Write invalid JSON
    writeFileSync(getTestCurrentWorkFile(), 'not valid json {{{');

    // Should recover gracefully
    const result = getSession('any-session');
    expect(result).toBeNull();

    // Should have backed up corrupt file
    const files = require('fs').readdirSync(getTestStateDir());
    const backupFiles = files.filter((f: string) => f.includes('.corrupt.'));
    expect(backupFiles.length).toBeGreaterThan(0);
  });
});

describe('stale cleanup', () => {
  test('cleans stale sessions on new session creation', () => {
    // Create a session with old timestamp
    const staleSession: SessionWork = {
      work_dir: '20260120-stale-work',
      created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
      item_count: 1
    };

    const freshSession: SessionWork = {
      work_dir: '20260124-fresh-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    // Write stale session directly to bypass cleanup
    const state = {
      _version: 2,
      sessions: {
        'stale-session': staleSession,
        'fresh-session': freshSession
      }
    };
    writeFileSync(getTestCurrentWorkFile(), JSON.stringify(state, null, 2));

    // Creating a new session should trigger cleanup
    const newSession: SessionWork = {
      work_dir: '20260124-new-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };
    setSession('new-session', newSession);

    // Stale session should be cleaned
    expect(getSession('stale-session')).toBeNull();
    // Fresh session should remain
    expect(getSession('fresh-session')).not.toBeNull();
    // New session should exist
    expect(getSession('new-session')).not.toBeNull();
  });

  test('does not clean sessions on update (not new)', () => {
    // Create a session with old timestamp
    const staleSession: SessionWork = {
      work_dir: '20260120-stale-work',
      created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
      item_count: 1
    };

    const existingSession: SessionWork = {
      work_dir: '20260124-existing-work',
      created_at: new Date().toISOString(),
      item_count: 1
    };

    // Write both sessions directly
    const state = {
      _version: 2,
      sessions: {
        'stale-session': staleSession,
        'existing-session': existingSession
      }
    };
    writeFileSync(getTestCurrentWorkFile(), JSON.stringify(state, null, 2));

    // Update existing session (not new)
    existingSession.item_count = 5;
    setSession('existing-session', existingSession);

    // Stale session should NOT be cleaned on update
    expect(getSession('stale-session')).not.toBeNull();
    expect(getSession('existing-session')!.item_count).toBe(5);
  });
});
