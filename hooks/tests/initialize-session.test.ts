import { describe, test, expect } from 'bun:test';
import { getProjectName, getLocalTimestamp } from '../initialize-session';
import sessionFixtures from './fixtures/session-start.json';

describe('initialize-session', () => {
  describe('getProjectName', () => {
    test('extracts project name from /Projects/ path', () => {
      expect(getProjectName('/home/user/Projects/myapp')).toBe('myapp');
      expect(getProjectName('/home/user/Projects/webapp/src')).toBe('webapp');
    });

    test('extracts project name from /projects/ path (lowercase)', () => {
      expect(getProjectName('/home/user/projects/myapp')).toBe('myapp');
    });

    test('extracts project name from /code/ path', () => {
      expect(getProjectName('/home/user/code/webapp')).toBe('webapp');
    });

    test('extracts project name from /repos/ path', () => {
      expect(getProjectName('/home/user/repos/api-server')).toBe('api-server');
    });

    test('extracts project name from /src/ path', () => {
      expect(getProjectName('/home/user/src/myproject')).toBe('myproject');
    });

    test('falls back to last directory component', () => {
      expect(getProjectName('/var/www/html')).toBe('html');
      expect(getProjectName('/tmp/workspace')).toBe('workspace');
    });

    test('returns "Session" for undefined cwd', () => {
      expect(getProjectName(undefined)).toBe('Session');
    });

    test('returns "Session" for empty cwd', () => {
      expect(getProjectName('')).toBe('Session');
    });

    test('returns "Session" for root path', () => {
      expect(getProjectName('/')).toBe('Session');
    });

    test('handles paths from fixtures', () => {
      for (const session of sessionFixtures.validSessions) {
        const projectName = getProjectName(session.cwd);
        expect(projectName).toBeString();
        expect(projectName.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getLocalTimestamp', () => {
    test('returns a formatted timestamp string', () => {
      const timestamp = getLocalTimestamp();
      expect(timestamp).toBeString();
      // Should match format: YYYY-MM-DD HH:MM:SS
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('timestamp is recent (within last minute)', () => {
      const timestamp = getLocalTimestamp();
      const parts = timestamp.split(/[-: ]/);
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
      const day = parseInt(parts[2]);
      const hours = parseInt(parts[3]);
      const minutes = parseInt(parts[4]);

      const parsed = new Date(year, month, day, hours, minutes);
      const now = new Date();

      // Should be within 1 minute of now
      const diffMs = Math.abs(now.getTime() - parsed.getTime());
      expect(diffMs).toBeLessThan(60000);
    });
  });
});
