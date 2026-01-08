import { describe, test, expect } from 'bun:test';
import { validateCommand, ATTACK_PATTERNS } from '../security-validator';
import dangerousFixtures from './fixtures/bash-dangerous.json';
import safeFixtures from './fixtures/bash-safe.json';

describe('security-validator', () => {
  describe('validateCommand', () => {
    describe('allows safe commands', () => {
      test.each(safeFixtures.safe)('allows: $tool_input.command', (payload) => {
        const result = validateCommand(payload.tool_input.command);
        expect(result.allowed).toBe(true);
      });

      test('allows empty commands', () => {
        expect(validateCommand('')).toEqual({ allowed: true });
        expect(validateCommand('a')).toEqual({ allowed: true });
        expect(validateCommand('ab')).toEqual({ allowed: true });
      });
    });

    describe('blocks catastrophic commands', () => {
      test.each(dangerousFixtures.catastrophic)('blocks: $tool_input.command', (payload) => {
        const result = validateCommand(payload.tool_input.command);
        expect(result.allowed).toBe(false);
        expect(result.action).toBe('block');
        expect(result.message).toContain('BLOCKED');
      });
    });

    describe('blocks reverse shell patterns', () => {
      test.each(dangerousFixtures.reverseShell)('blocks: $tool_input.command', (payload) => {
        const result = validateCommand(payload.tool_input.command);
        expect(result.allowed).toBe(false);
        expect(result.action).toBe('block');
      });
    });

    describe('blocks credential theft patterns', () => {
      test.each(dangerousFixtures.credentialTheft)('blocks: $tool_input.command', (payload) => {
        const result = validateCommand(payload.tool_input.command);
        expect(result.allowed).toBe(false);
        expect(result.action).toBe('block');
      });
    });

    describe('blocks prompt injection patterns', () => {
      test.each(dangerousFixtures.promptInjection)('blocks: $tool_input.command', (payload) => {
        const result = validateCommand(payload.tool_input.command);
        expect(result.allowed).toBe(false);
        expect(result.action).toBe('block');
      });
    });

    describe('blocks exfiltration patterns', () => {
      test.each(dangerousFixtures.exfiltration)('blocks: $tool_input.command', (payload) => {
        const result = validateCommand(payload.tool_input.command);
        expect(result.allowed).toBe(false);
        expect(result.action).toBe('block');
      });
    });

    describe('blocks PAI protection patterns', () => {
      test.each(dangerousFixtures.paiProtection)('blocks: $tool_input.command', (payload) => {
        const result = validateCommand(payload.tool_input.command);
        expect(result.allowed).toBe(false);
        expect(result.action).toBe('block');
      });
    });
  });

  describe('ATTACK_PATTERNS', () => {
    test('has all expected tiers', () => {
      const expectedTiers = [
        'catastrophic',
        'reverseShell',
        'credentialTheft',
        'promptInjection',
        'envManipulation',
        'gitDangerous',
        'systemMod',
        'network',
        'exfiltration',
        'paiProtection'
      ];

      expect(Object.keys(ATTACK_PATTERNS)).toEqual(expectedTiers);
    });

    test('each tier has patterns and action', () => {
      for (const [tierName, tier] of Object.entries(ATTACK_PATTERNS)) {
        expect(tier.patterns).toBeArray();
        expect(tier.patterns.length).toBeGreaterThan(0);
        expect(tier.action).toBeOneOf(['block', 'warn', 'confirm', 'log']);
        expect(tier.message).toBeString();
      }
    });
  });
});
