#!/usr/bin/env bun
/**
 * PAI_DIR Path Linter
 *
 * Enforces proper usage of PAI_DIR environment variable instead of hardcoded paths.
 * Detects and optionally fixes violations like ~/pai, ~/.claude, $HOME/pai, etc.
 *
 * Cross-Platform Support:
 *   - Works on Windows, macOS, and Linux
 *   - Handles both Unix-style (/) and Windows-style (\) path separators
 *   - Normalizes paths before pattern matching for consistent detection
 *
 * Path Formats Detected:
 *   Unix:    ~/pai, ~/.claude, $HOME/pai, ${HOME}/.claude
 *   Windows: C:\Users\username\pai, C:\Users\username\.claude
 *   JS/TS:   process.env.HOME + "/pai", join(process.env.HOME, ".claude")
 *
 * Usage:
 *   bun run tools/PaiDirLinter.ts              # Scan entire codebase
 *   bun run tools/PaiDirLinter.ts path/to/dir  # Scan specific directory
 *   bun run tools/PaiDirLinter.ts --fix        # Auto-fix violations
 */

import * as fs from 'fs';
import * as path from 'path';
import { toForwardSlash } from '../hooks/lib/platform';

// Pattern categories for different violation types
export const PATH_VIOLATIONS = {
  shellPath: {
    severity: 'error' as const,
    patterns: [
      // ~/.claude but NOT ~/.claude/claude-code
      /~\/\.claude(?!\/claude-code)(?:\/|$)/g,
      // ~/pai with word boundary (not ~/pair, ~/paint, etc.)
      /~\/pai(?:\/|$)/g,
      // $HOME/.claude but NOT $HOME/.claude/claude-code
      /\$HOME\/\.claude(?!\/claude-code)(?:\/|$)/g,
      // ${HOME}/.claude but NOT ${HOME}/.claude/claude-code
      /\$\{HOME\}\/\.claude(?!\/claude-code)(?:\/|$)/g,
      // $HOME/pai with word boundary
      /\$HOME\/pai(?:\/|$)/g,
      // ${HOME}/pai with word boundary
      /\$\{HOME\}\/pai(?:\/|$)/g,
    ],
    fix: (text: string) => {
      let result = text;
      // Fix ~/.claude paths
      result = result.replace(/~\/\.claude(?!\/claude-code)(\/|$)/g, '${PAI_DIR}/.claude$1');
      // Fix ~/pai paths
      result = result.replace(/~\/pai(\/|$)/g, '${PAI_DIR}$1');
      // Fix $HOME/.claude paths
      result = result.replace(/\$HOME\/\.claude(?!\/claude-code)(\/|$)/g, '${PAI_DIR}/.claude$1');
      // Fix ${HOME}/.claude paths
      result = result.replace(/\$\{HOME\}\/\.claude(?!\/claude-code)(\/|$)/g, '${PAI_DIR}/.claude$1');
      // Fix $HOME/pai paths
      result = result.replace(/\$HOME\/pai(\/|$)/g, '${PAI_DIR}$1');
      // Fix ${HOME}/pai paths
      result = result.replace(/\$\{HOME\}\/pai(\/|$)/g, '${PAI_DIR}$1');
      return result;
    }
  },
  jsPath: {
    severity: 'error' as const,
    patterns: [
      // process.env.HOME + "/.claude" or process.env.HOME + '/pai'
      /process\.env\.HOME\s*\+\s*["'`]\/(?:\.claude|pai)["'`]/g,
      // join(process.env.HOME, ".claude") or similar
      /join\s*\(\s*process\.env\.HOME\s*,\s*["'`](?:\.claude|pai)["'`]\s*\)/g,
      // String literals with ~/ paths
      /["'`]~\/(?:\.claude(?!\/claude-code)|pai)(?:\/[^"'`]*)?["'`]/g,
    ],
    fix: (text: string) => {
      let result = text;
      // Fix process.env.HOME + "/.claude" or "/pai"
      result = result.replace(
        /process\.env\.HOME\s*\+\s*["'`]\/(?:\.claude|pai)(\/[^"'`]*)?["'`]/g,
        (match, trailing) => `process.env.PAI_DIR${trailing ? ` + "${trailing}"` : ''}`
      );
      // Fix join(process.env.HOME, ".claude") or "pai"
      result = result.replace(
        /join\s*\(\s*process\.env\.HOME\s*,\s*["'`](?:\.claude|pai)["'`]\s*\)/g,
        'process.env.PAI_DIR!'
      );
      return result;
    }
  },
  windowsPath: {
    severity: 'error' as const,
    patterns: [
      // C:\Users\username\.claude or C:\Users\username\pai
      /[A-Za-z]:\\[Uu]sers\\[^\\]+\\(?:\.claude|pai)(?:\\|$)/gi,
    ],
    fix: (text: string) => {
      let result = text;
      // Fix Windows paths to .claude - use forward slashes for cross-platform compatibility
      // (Forward slashes work in both Bun/Node.js paths and JSON on all platforms)
      result = result.replace(
        /[A-Za-z]:\\[Uu]sers\\[^\\]+\\\.claude(\\|$)/gi,
        (_, trailing) => `\${PAI_DIR}/.claude${trailing === '\\' ? '/' : ''}`
      );
      // Fix Windows paths to pai
      result = result.replace(
        /[A-Za-z]:\\[Uu]sers\\[^\\]+\\pai(\\|$)/gi,
        (_, trailing) => `\${PAI_DIR}${trailing === '\\' ? '/' : ''}`
      );
      return result;
    }
  },
  markdownPath: {
    severity: 'warning' as const,
    patterns: [
      // Backtick code with ~/.claude (not claude-code) or ~/pai
      /`[^`]*~\/(?:\.claude(?!\/claude-code)|pai)[^`]*`/g,
    ],
    fix: null // Manual fix required for markdown
  }
};

interface Violation {
  file: string;
  line: number;
  column: number;
  text: string;
  category: string;
  severity: 'error' | 'warning';
}

// Files and directories to skip (patterns use forward slashes for cross-platform compatibility)
const SKIP_PATTERNS = [
  /node_modules/,
  /\.test\.ts$/,
  /\.spec\.ts$/,
  /\.git/,
  /agentic_logs/,
  /MEMORY\/sessions/,
  /MEMORY\/Work/,
  /MEMORY\/Learning/,
  /backups/,
  /\.map$/,
  /\.d\.ts$/,
  /PaiDirLinter\.ts$/, // Don't lint ourselves
  /history\//, // Historical learning files
  /DEVELOPMENT\.md$/, // Documentation showing examples of bad patterns
  /tools\/README\.md$/, // Documentation showing bad patterns
];

/**
 * Checks if a file should be skipped during linting.
 * Normalizes path separators for cross-platform consistency.
 */
function shouldSkip(filePath: string): boolean {
  const normalizedPath = toForwardSlash(filePath);
  return SKIP_PATTERNS.some(pattern => pattern.test(normalizedPath));
}

function getFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (shouldSkip(fullPath)) continue;

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.ts', '.js', '.md', '.sh', '.ps1', '.yaml', '.yml'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];

  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return violations;
  }

  // Handle both Unix (LF) and Windows (CRLF) line endings
  const lines = content.split(/\r?\n/);

  for (const [categoryName, category] of Object.entries(PATH_VIOLATIONS)) {
    for (const pattern of category.patterns) {
      // Reset the regex
      pattern.lastIndex = 0;

      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        pattern.lastIndex = 0;

        let match;
        while ((match = pattern.exec(line)) !== null) {
          violations.push({
            file: filePath,
            line: lineNum + 1,
            column: match.index + 1,
            text: match[0],
            category: categoryName,
            severity: category.severity
          });
        }
      }
    }
  }

  return violations;
}

function fixFile(filePath: string): boolean {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return false;
  }

  let modified = content;

  for (const category of Object.values(PATH_VIOLATIONS)) {
    if (category.fix) {
      modified = category.fix(modified);
    }
  }

  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf-8');
    return true;
  }

  return false;
}

function formatViolation(v: Violation): string {
  const icon = v.severity === 'error' ? '\x1b[31m✗\x1b[0m' : '\x1b[33m⚠\x1b[0m';
  return `${icon} ${v.file}:${v.line}:${v.column} - ${v.category}: ${v.text}`;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const targetDir = args.find(arg => !arg.startsWith('--')) || process.env.PAI_DIR || process.cwd();

  console.log(`\n\x1b[1mPAI_DIR Path Linter\x1b[0m`);
  console.log(`Scanning: ${targetDir}`);
  if (shouldFix) {
    console.log('\x1b[33mAuto-fix mode enabled\x1b[0m\n');
  } else {
    console.log('');
  }

  const files = getFiles(targetDir);
  let allViolations: Violation[] = [];
  let fixedFiles = 0;

  for (const file of files) {
    const violations = scanFile(file);

    if (violations.length > 0) {
      allViolations = allViolations.concat(violations);

      if (shouldFix && fixFile(file)) {
        fixedFiles++;
        console.log(`\x1b[32m✓ Fixed: ${file}\x1b[0m`);
      }
    }
  }

  if (!shouldFix) {
    for (const v of allViolations) {
      console.log(formatViolation(v));
    }
  }

  // Summary
  const errors = allViolations.filter(v => v.severity === 'error').length;
  const warnings = allViolations.filter(v => v.severity === 'warning').length;

  console.log(`\n\x1b[1mSummary:\x1b[0m`);
  console.log(`  Files scanned: ${files.length}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Warnings: ${warnings}`);

  if (shouldFix) {
    console.log(`  Files fixed: ${fixedFiles}`);
  }

  // Exit with error code if there are errors
  if (errors > 0 && !shouldFix) {
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}
