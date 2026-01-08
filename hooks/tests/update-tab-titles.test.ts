import { describe, test, expect } from 'bun:test';
import { extractTaskKeywords } from '../update-tab-titles';
import promptFixtures from './fixtures/user-prompt.json';

describe('update-tab-titles', () => {
  describe('extractTaskKeywords', () => {
    test('extracts keywords from prompts', () => {
      for (const [input, expected] of Object.entries(promptFixtures.expectedKeywords)) {
        const result = extractTaskKeywords(input);
        expect(result).toBe(expected);
      }
    });

    test('removes stop words', () => {
      const result = extractTaskKeywords('Please help me with the fix');
      expect(result).not.toContain('please');
      expect(result).not.toContain('help');
      expect(result).not.toContain('the');
      expect(result).not.toContain('with');
    });

    test('capitalizes first word', () => {
      const result = extractTaskKeywords('fix the authentication bug');
      expect(result).toMatch(/^[A-Z]/);
    });

    test('returns "Working" for empty prompts', () => {
      expect(extractTaskKeywords('')).toBe('Working');
      expect(extractTaskKeywords('the a an')).toBe('Working');
    });

    test('limits to 4 keywords', () => {
      const result = extractTaskKeywords('implement user authentication system with oauth2 tokens and refresh functionality');
      const words = result.split(' ');
      expect(words.length).toBeLessThanOrEqual(4);
    });

    test('handles special characters', () => {
      const result = extractTaskKeywords('Fix bug #123 in src/auth.ts!');
      expect(result).toBeString();
      expect(result.length).toBeGreaterThan(0);
    });

    test('handles prompts with only short words', () => {
      const result = extractTaskKeywords('do it');
      // 'do' and 'it' are both stopwords or too short
      expect(result).toBe('Working');
    });
  });
});
