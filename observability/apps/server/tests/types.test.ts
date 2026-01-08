// Tests for types.ts
import { describe, test, expect } from 'bun:test';
import type { HookEvent, TodoItem, FilterOptions } from '../src/types';

describe('Types', () => {
  describe('HookEvent', () => {
    test('should have required fields', () => {
      const event: HookEvent = {
        source_app: 'main',
        session_id: 'test-session',
        hook_event_type: 'PostToolUse',
        payload: { tool_name: 'Bash' }
      };

      expect(event.source_app).toBe('main');
      expect(event.session_id).toBe('test-session');
      expect(event.hook_event_type).toBe('PostToolUse');
      expect(event.payload).toEqual({ tool_name: 'Bash' });
    });

    test('should allow optional fields', () => {
      const event: HookEvent = {
        source_app: 'intern',
        session_id: 'test-session',
        hook_event_type: 'PostToolUse',
        payload: {},
        id: 1,
        agent_name: 'Intern',
        summary: 'Test summary',
        timestamp: Date.now(),
        todos: [],
        completedTodos: []
      };

      expect(event.id).toBe(1);
      expect(event.agent_name).toBe('Intern');
      expect(event.summary).toBe('Test summary');
      expect(event.timestamp).toBeDefined();
    });
  });

  describe('TodoItem', () => {
    test('should have correct structure', () => {
      const todo: TodoItem = {
        content: 'Test task',
        status: 'in_progress',
        activeForm: 'Testing task'
      };

      expect(todo.content).toBe('Test task');
      expect(todo.status).toBe('in_progress');
      expect(todo.activeForm).toBe('Testing task');
    });

    test('status should be one of pending, in_progress, completed', () => {
      const pending: TodoItem = { content: 'a', status: 'pending', activeForm: 'b' };
      const inProgress: TodoItem = { content: 'a', status: 'in_progress', activeForm: 'b' };
      const completed: TodoItem = { content: 'a', status: 'completed', activeForm: 'b' };

      expect(pending.status).toBe('pending');
      expect(inProgress.status).toBe('in_progress');
      expect(completed.status).toBe('completed');
    });
  });

  describe('FilterOptions', () => {
    test('should have array fields', () => {
      const options: FilterOptions = {
        source_apps: ['main', 'intern'],
        session_ids: ['session-1', 'session-2'],
        hook_event_types: ['PreToolUse', 'PostToolUse']
      };

      expect(options.source_apps).toHaveLength(2);
      expect(options.session_ids).toHaveLength(2);
      expect(options.hook_event_types).toHaveLength(2);
    });
  });
});
