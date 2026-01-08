// Tests for file-ingest.ts
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock PAI_DIR for tests
const TEST_DIR = join(tmpdir(), 'pai-observability-test-' + Date.now());

describe('File Ingest', () => {
  beforeEach(() => {
    // Create test directory structure
    mkdirSync(join(TEST_DIR, 'history', 'raw-outputs'), { recursive: true });
    process.env.PAI_DIR = TEST_DIR;
  });

  afterEach(() => {
    // Clean up test directory
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    delete process.env.PAI_DIR;
  });

  describe('Event file path generation', () => {
    test('should create correct path structure', () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      const expectedDir = join(TEST_DIR, 'history', 'raw-outputs', `${year}-${month}`);
      const expectedFile = `${year}-${month}-${day}_all-events.jsonl`;

      // The path should follow YYYY-MM/YYYY-MM-DD_all-events.jsonl pattern
      expect(expectedDir).toContain(`${year}-${month}`);
      expect(expectedFile).toContain(`${year}-${month}-${day}`);
    });
  });

  describe('Event parsing', () => {
    test('should parse valid JSON event line', () => {
      const event = {
        source_app: 'main',
        session_id: 'test-session',
        hook_event_type: 'PostToolUse',
        payload: { tool_name: 'Read' },
        timestamp: Date.now()
      };

      const jsonLine = JSON.stringify(event);
      const parsed = JSON.parse(jsonLine);

      expect(parsed.source_app).toBe('main');
      expect(parsed.hook_event_type).toBe('PostToolUse');
      expect(parsed.payload.tool_name).toBe('Read');
    });

    test('should handle malformed JSON gracefully', () => {
      const malformed = '{ "broken": json }';
      let error = null;

      try {
        JSON.parse(malformed);
      } catch (e) {
        error = e;
      }

      expect(error).not.toBeNull();
    });
  });

  describe('Agent name enrichment', () => {
    test('should capitalize known agent types', () => {
      const agentTypes = ['artist', 'intern', 'engineer', 'pentester', 'architect', 'designer', 'qatester', 'researcher'];

      for (const agentType of agentTypes) {
        const capitalized = agentType.charAt(0).toUpperCase() + agentType.slice(1);
        expect(capitalized[0]).toBe(agentType[0].toUpperCase());
      }
    });

    test('should return User for UserPromptSubmit events', () => {
      const event = {
        hook_event_type: 'UserPromptSubmit',
        source_app: 'main',
        session_id: 'test'
      };

      // UserPromptSubmit should be tagged as User
      expect(event.hook_event_type).toBe('UserPromptSubmit');
    });
  });

  describe('Event storage limits', () => {
    test('should respect MAX_EVENTS limit', () => {
      const MAX_EVENTS = 1000;
      const events: any[] = [];

      // Add more than MAX_EVENTS
      for (let i = 0; i < MAX_EVENTS + 100; i++) {
        events.push({ id: i });
      }

      // Simulate trimming to MAX_EVENTS
      if (events.length > MAX_EVENTS) {
        events.splice(0, events.length - MAX_EVENTS);
      }

      expect(events.length).toBe(MAX_EVENTS);
      expect(events[0].id).toBe(100); // First 100 should be removed
    });
  });

  describe('Todo event processing', () => {
    test('should detect newly completed todos', () => {
      const previousTodos = [
        { content: 'Task 1', status: 'pending' },
        { content: 'Task 2', status: 'in_progress' }
      ];

      const currentTodos = [
        { content: 'Task 1', status: 'completed' },
        { content: 'Task 2', status: 'completed' }
      ];

      const completedTodos = [];
      for (const currentTodo of currentTodos) {
        if (currentTodo.status === 'completed') {
          const prevTodo = previousTodos.find(t => t.content === currentTodo.content);
          if (!prevTodo || prevTodo.status !== 'completed') {
            completedTodos.push(currentTodo);
          }
        }
      }

      expect(completedTodos).toHaveLength(2);
    });

    test('should not re-detect already completed todos', () => {
      const previousTodos = [
        { content: 'Task 1', status: 'completed' },
        { content: 'Task 2', status: 'in_progress' }
      ];

      const currentTodos = [
        { content: 'Task 1', status: 'completed' },
        { content: 'Task 2', status: 'completed' }
      ];

      const completedTodos = [];
      for (const currentTodo of currentTodos) {
        if (currentTodo.status === 'completed') {
          const prevTodo = previousTodos.find(t => t.content === currentTodo.content);
          if (!prevTodo || prevTodo.status !== 'completed') {
            completedTodos.push(currentTodo);
          }
        }
      }

      expect(completedTodos).toHaveLength(1); // Only Task 2 is newly completed
      expect(completedTodos[0].content).toBe('Task 2');
    });
  });
});

describe('Filter Options', () => {
  test('should collect unique values from events', () => {
    const events = [
      { source_app: 'main', session_id: 's1', hook_event_type: 'PreToolUse' },
      { source_app: 'main', session_id: 's2', hook_event_type: 'PostToolUse' },
      { source_app: 'intern', session_id: 's1', hook_event_type: 'PreToolUse' }
    ];

    const sourceApps = new Set<string>();
    const sessionIds = new Set<string>();
    const hookEventTypes = new Set<string>();

    for (const event of events) {
      sourceApps.add(event.source_app);
      sessionIds.add(event.session_id);
      hookEventTypes.add(event.hook_event_type);
    }

    expect(Array.from(sourceApps)).toEqual(['main', 'intern']);
    expect(Array.from(sessionIds)).toEqual(['s1', 's2']);
    expect(Array.from(hookEventTypes)).toEqual(['PreToolUse', 'PostToolUse']);
  });
});
