import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { getCurrentTimestamp, getSourceApp } from '../../lib/observability';

describe('observability', () => {
  describe('getCurrentTimestamp', () => {
    test('returns ISO 8601 formatted timestamp', () => {
      const timestamp = getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    test('returns current time (within 1 second)', () => {
      const before = new Date().getTime();
      const timestamp = getCurrentTimestamp();
      const after = new Date().getTime();

      const parsed = new Date(timestamp).getTime();
      expect(parsed).toBeGreaterThanOrEqual(before);
      expect(parsed).toBeLessThanOrEqual(after);
    });
  });

  describe('getSourceApp', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      delete process.env.PAI_SOURCE_APP;
      delete process.env.DA;
    });

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    test('returns PAI_SOURCE_APP when set', () => {
      process.env.PAI_SOURCE_APP = 'CustomApp';
      expect(getSourceApp()).toBe('CustomApp');
    });

    test('returns DA when PAI_SOURCE_APP is not set', () => {
      process.env.DA = 'Tofu';
      expect(getSourceApp()).toBe('Tofu');
    });

    test('prefers PAI_SOURCE_APP over DA', () => {
      process.env.PAI_SOURCE_APP = 'AppName';
      process.env.DA = 'Tofu';
      expect(getSourceApp()).toBe('AppName');
    });

    test('returns "PAI" as default', () => {
      expect(getSourceApp()).toBe('PAI');
    });
  });
});
