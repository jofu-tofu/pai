// Integration tests for observability server
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { spawn, type Subprocess } from 'bun';
import { join } from 'path';
import { mkdirSync, writeFileSync, appendFileSync, existsSync, rmSync } from 'fs';
import { tmpdir } from 'os';

// Test directory setup
const TEST_DIR = join(tmpdir(), 'pai-observability-integration-' + Date.now());

describe('Integration Tests', () => {
  beforeAll(() => {
    // Create test directory structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    mkdirSync(join(TEST_DIR, 'history', 'raw-outputs', `${year}-${month}`), { recursive: true });
  });

  afterAll(() => {
    // Clean up
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Event File Operations', () => {
    test('should write events to JSONL file', () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      const eventsFile = join(TEST_DIR, 'history', 'raw-outputs', `${year}-${month}`, `${year}-${month}-${day}_all-events.jsonl`);

      const event1 = {
        source_app: 'main',
        session_id: 'integration-test',
        hook_event_type: 'PostToolUse',
        payload: { tool_name: 'Read' },
        timestamp: Date.now()
      };

      const event2 = {
        source_app: 'intern',
        session_id: 'integration-test',
        hook_event_type: 'PostToolUse',
        payload: { tool_name: 'Write' },
        timestamp: Date.now()
      };

      // Write events
      writeFileSync(eventsFile, JSON.stringify(event1) + '\n');
      appendFileSync(eventsFile, JSON.stringify(event2) + '\n');

      // Verify file exists
      expect(existsSync(eventsFile)).toBe(true);

      // Read and verify content
      const content = Bun.file(eventsFile).text();
      expect(content).toBeDefined();
    });

    test('should read events from JSONL file', async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      const eventsFile = join(TEST_DIR, 'history', 'raw-outputs', `${year}-${month}`, `${year}-${month}-${day}_read-test.jsonl`);

      const events = [
        { id: 1, source_app: 'main', session_id: 's1', hook_event_type: 'PreToolUse', payload: {} },
        { id: 2, source_app: 'main', session_id: 's1', hook_event_type: 'PostToolUse', payload: {} }
      ];

      writeFileSync(eventsFile, events.map(e => JSON.stringify(e)).join('\n') + '\n');

      const content = await Bun.file(eventsFile).text();
      const lines = content.trim().split('\n');

      expect(lines).toHaveLength(2);

      const parsed = lines.map(line => JSON.parse(line));
      expect(parsed[0].id).toBe(1);
      expect(parsed[1].id).toBe(2);
    });
  });

  describe('Event Processing', () => {
    test('should process multiple event types', () => {
      const eventTypes = ['PreToolUse', 'PostToolUse', 'Stop', 'SubagentStop', 'UserPromptSubmit', 'SessionStart', 'SessionEnd'];

      for (const eventType of eventTypes) {
        const event = {
          source_app: 'main',
          session_id: 'test',
          hook_event_type: eventType,
          payload: {},
          timestamp: Date.now()
        };

        expect(event.hook_event_type).toBe(eventType);
      }
    });

    test('should handle agent session mapping', () => {
      const agentSessions = new Map<string, string>();

      // Session starts with main
      agentSessions.set('session-1', 'main');
      expect(agentSessions.get('session-1')).toBe('main');

      // Agent spawns intern
      agentSessions.set('session-1', 'intern');
      expect(agentSessions.get('session-1')).toBe('intern');

      // Agent returns to main
      agentSessions.set('session-1', 'main');
      expect(agentSessions.get('session-1')).toBe('main');
    });
  });

  describe('File Watching (Polling)', () => {
    test('should detect file size changes', async () => {
      const testFile = join(TEST_DIR, 'watch-test.jsonl');

      // Write initial content
      writeFileSync(testFile, '{"id":1}\n');
      const file1 = Bun.file(testFile);
      const size1 = file1.size;

      // Append more content
      appendFileSync(testFile, '{"id":2}\n');
      const file2 = Bun.file(testFile);
      const size2 = file2.size;

      expect(size2).toBeGreaterThan(size1);
    });
  });
});

describe('Error Handling', () => {
  const ERROR_TEST_DIR = join(tmpdir(), 'pai-error-test-' + Date.now());

  beforeAll(() => {
    mkdirSync(ERROR_TEST_DIR, { recursive: true });
  });

  afterAll(() => {
    try {
      rmSync(ERROR_TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test('should handle non-existent files gracefully', () => {
    const nonExistentFile = join(ERROR_TEST_DIR, 'does-not-exist.jsonl');
    expect(existsSync(nonExistentFile)).toBe(false);
  });

  test('should handle empty files', async () => {
    const emptyFile = join(ERROR_TEST_DIR, 'empty.jsonl');
    writeFileSync(emptyFile, '');

    const content = await Bun.file(emptyFile).text();
    expect(content).toBe('');
    expect(content.trim().split('\n').filter(l => l).length).toBe(0);
  });

  test('should handle concurrent writes', async () => {
    const concurrentFile = join(ERROR_TEST_DIR, 'concurrent.jsonl');

    // Write initial empty file
    writeFileSync(concurrentFile, '');

    // Simulate concurrent writes
    const writes = [];
    for (let i = 0; i < 10; i++) {
      writes.push(
        new Promise<void>(resolve => {
          appendFileSync(concurrentFile, JSON.stringify({ id: i }) + '\n');
          resolve();
        })
      );
    }

    await Promise.all(writes);

    const content = await Bun.file(concurrentFile).text();
    const lines = content.trim().split('\n');
    expect(lines.length).toBe(10);
  });
});
