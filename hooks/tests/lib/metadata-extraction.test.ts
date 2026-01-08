import { describe, test, expect } from 'bun:test';
import { extractAgentInstanceId, enrichEventWithAgentMetadata, isAgentSpawningCall } from '../../lib/metadata-extraction';

describe('metadata-extraction', () => {
  describe('extractAgentInstanceId', () => {
    test('extracts from description with [agent-type-N] format', () => {
      const result = extractAgentInstanceId({}, '[code-researcher-1]');
      expect(result.agent_type).toBe('code-researcher');
      expect(result.instance_number).toBe(1);
      expect(result.agent_instance_id).toBe('code-researcher-1');
    });

    test('extracts from prompt with [AGENT_INSTANCE: ...] format', () => {
      const toolInput = {
        prompt: 'Do something [AGENT_INSTANCE: test-agent-2] please'
      };
      const result = extractAgentInstanceId(toolInput);
      expect(result.agent_instance_id).toBe('test-agent-2');
      expect(result.agent_type).toBe('test-agent');
      expect(result.instance_number).toBe(2);
    });

    test('falls back to subagent_type when no other metadata', () => {
      const toolInput = {
        subagent_type: 'Explore'
      };
      const result = extractAgentInstanceId(toolInput);
      expect(result.agent_type).toBe('Explore');
      expect(result.agent_instance_id).toBeUndefined();
    });

    test('returns empty object when no metadata available', () => {
      const result = extractAgentInstanceId({});
      expect(result.agent_type).toBeUndefined();
      expect(result.agent_instance_id).toBeUndefined();
      expect(result.instance_number).toBeUndefined();
    });

    test('description takes priority over prompt', () => {
      const toolInput = {
        prompt: '[AGENT_INSTANCE: from-prompt-1]'
      };
      const result = extractAgentInstanceId(toolInput, '[test-researcher-5]');
      expect(result.agent_instance_id).toBe('test-researcher-5');
      expect(result.instance_number).toBe(5);
    });
  });

  describe('enrichEventWithAgentMetadata', () => {
    test('adds agent metadata to event', () => {
      const event = { type: 'test', timestamp: 123 };
      const toolInput = { subagent_type: 'Explore' };
      const result = enrichEventWithAgentMetadata(event, toolInput, '[explorer-researcher-3]');

      expect(result.type).toBe('test');
      expect(result.timestamp).toBe(123);
      expect(result.agent_type).toBe('explorer-researcher');
      expect(result.instance_number).toBe(3);
      expect(result.agent_instance_id).toBe('explorer-researcher-3');
    });

    test('preserves original event when no metadata', () => {
      const event = { type: 'test', data: 'value' };
      const result = enrichEventWithAgentMetadata(event, {});
      expect(result).toEqual(event);
    });
  });

  describe('isAgentSpawningCall', () => {
    test('returns true for Task tool with subagent_type', () => {
      expect(isAgentSpawningCall('Task', { subagent_type: 'Explore' })).toBe(true);
    });

    test('returns false for Task tool without subagent_type', () => {
      expect(isAgentSpawningCall('Task', {})).toBe(false);
      expect(isAgentSpawningCall('Task', null)).toBe(false);
    });

    test('returns false for non-Task tools', () => {
      expect(isAgentSpawningCall('Bash', { subagent_type: 'test' })).toBe(false);
      expect(isAgentSpawningCall('Read', {})).toBe(false);
    });
  });
});
