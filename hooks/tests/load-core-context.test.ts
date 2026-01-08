import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { isSubagentSession } from '../load-core-context';

describe('load-core-context', () => {
  describe('isSubagentSession', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      // Clear relevant env vars before each test
      delete process.env.CLAUDE_CODE_AGENT;
      delete process.env.SUBAGENT;
    });

    afterEach(() => {
      // Restore original env
      process.env = { ...originalEnv };
    });

    test('returns false when no subagent env vars are set', () => {
      expect(isSubagentSession()).toBe(false);
    });

    test('returns true when CLAUDE_CODE_AGENT is set', () => {
      process.env.CLAUDE_CODE_AGENT = 'true';
      expect(isSubagentSession()).toBe(true);
    });

    test('returns true when CLAUDE_CODE_AGENT is any value', () => {
      process.env.CLAUDE_CODE_AGENT = '';
      // Even empty string means it's defined
      expect(isSubagentSession()).toBe(true);
    });

    test('returns true when SUBAGENT is "true"', () => {
      process.env.SUBAGENT = 'true';
      expect(isSubagentSession()).toBe(true);
    });

    test('returns false when SUBAGENT is "false"', () => {
      process.env.SUBAGENT = 'false';
      expect(isSubagentSession()).toBe(false);
    });

    test('returns true when both env vars are set', () => {
      process.env.CLAUDE_CODE_AGENT = 'agent-123';
      process.env.SUBAGENT = 'true';
      expect(isSubagentSession()).toBe(true);
    });
  });
});
