import { describe, test, expect } from 'bun:test';
import { PATH_VIOLATIONS } from './PaiDirLinter';

describe('PaiDirLinter Pattern Matching', () => {
  describe('shellPath patterns', () => {
    const patterns = PATH_VIOLATIONS.shellPath.patterns;

    test('should match ~/.claude paths', () => {
      const text = '~/.claude/settings.json';
      const hasMatch = patterns.some(p => p.test(text));
      expect(hasMatch).toBe(true);
    });

    test('should NOT match ~/.claude/claude-code paths', () => {
      const text = '~/.claude/claude-code/bin';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(false);
    });

    test('should match ~/pai paths', () => {
      const text = '~/pai/skills';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should NOT match ~/pair or ~/paint', () => {
      const texts = ['~/pair', '~/paint', '~/pairs'];
      for (const text of texts) {
        const hasMatch = patterns.some(p => {
          p.lastIndex = 0;
          return p.test(text);
        });
        expect(hasMatch).toBe(false);
      }
    });

    test('should match $HOME/.claude paths', () => {
      const text = '$HOME/.claude/hooks';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should match ${HOME}/.claude paths', () => {
      const text = '${HOME}/.claude/skills';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should match $HOME/pai paths', () => {
      const text = '$HOME/pai/tools';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });
  });

  describe('jsPath patterns', () => {
    const patterns = PATH_VIOLATIONS.jsPath.patterns;

    test('should match process.env.HOME + "/.claude"', () => {
      const text = 'const path = process.env.HOME + "/.claude"';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should match process.env.HOME + "/pai"', () => {
      const text = 'const path = process.env.HOME + "/pai"';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should match join(process.env.HOME, ".claude")', () => {
      const text = 'join(process.env.HOME, ".claude")';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should match string literals with ~/paths', () => {
      const texts = [
        'const p = "~/.claude"',
        "const p = '~/.claude'",
        'const p = `~/.claude`'
      ];

      for (const text of texts) {
        const hasMatch = patterns.some(p => {
          p.lastIndex = 0;
          return p.test(text);
        });
        expect(hasMatch).toBe(true);
      }
    });
  });

  describe('windowsPath patterns', () => {
    const patterns = PATH_VIOLATIONS.windowsPath.patterns;

    test('should match Windows absolute paths to .claude', () => {
      const text = 'C:\\Users\\johndoe\\.claude\\settings.json';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should match Windows absolute paths to pai', () => {
      const text = 'C:\\Users\\alice\\pai\\hooks';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should be case insensitive', () => {
      const text = 'c:\\users\\bob\\pai\\skills';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });
  });

  describe('markdownPath patterns', () => {
    const patterns = PATH_VIOLATIONS.markdownPath.patterns;

    test('should match markdown code blocks with ~/.claude', () => {
      const text = 'Run `~/.claude/hooks/init.sh` to setup';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should match markdown code blocks with ~/pai', () => {
      const text = 'The file is at `~/pai/skills/CORE/SKILL.md`';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(true);
    });

    test('should NOT match ~/.claude/claude-code in markdown', () => {
      const text = 'Install from `~/.claude/claude-code/bin`';
      const hasMatch = patterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(false);
    });
  });

  describe('Pattern severity levels', () => {
    test('shellPath should be error severity', () => {
      expect(PATH_VIOLATIONS.shellPath.severity).toBe('error');
    });

    test('jsPath should be error severity', () => {
      expect(PATH_VIOLATIONS.jsPath.severity).toBe('error');
    });

    test('windowsPath should be error severity', () => {
      expect(PATH_VIOLATIONS.windowsPath.severity).toBe('error');
    });

    test('markdownPath should be warning severity', () => {
      expect(PATH_VIOLATIONS.markdownPath.severity).toBe('warning');
    });
  });

  describe('Edge cases', () => {
    test('should not match PAI_DIR usage', () => {
      const text = '${PAI_DIR}/skills/CORE';
      const allPatterns = Object.values(PATH_VIOLATIONS).flatMap(v => v.patterns);
      const hasMatch = allPatterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(false);
    });

    test('should not match process.env.PAI_DIR usage', () => {
      const text = 'const path = process.env.PAI_DIR';
      const allPatterns = Object.values(PATH_VIOLATIONS).flatMap(v => v.patterns);
      const hasMatch = allPatterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(false);
    });

    test('should not match relative paths', () => {
      const text = './pai/local-file.ts';
      const allPatterns = Object.values(PATH_VIOLATIONS).flatMap(v => v.patterns);
      const hasMatch = allPatterns.some(p => {
        p.lastIndex = 0;
        return p.test(text);
      });
      expect(hasMatch).toBe(false);
    });
  });
});
