import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { existsSync, mkdirSync, rmSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'bun';

const TEST_PAI_DIR = join(homedir(), '.pai-test-session-summary');
const hookPath = join(homedir(), '.pai', 'hooks', 'capture-session-summary.ts');

describe('capture-session-summary', () => {
  beforeAll(() => {
    // Create test directory structure
    mkdirSync(join(TEST_PAI_DIR, 'history', 'sessions'), { recursive: true });
    mkdirSync(join(TEST_PAI_DIR, 'history', 'raw-outputs'), { recursive: true });
  });

  afterAll(() => {
    // Clean up test directory
    if (existsSync(TEST_PAI_DIR)) {
      rmSync(TEST_PAI_DIR, { recursive: true, force: true });
    }
  });

  test('hook file exists', () => {
    expect(existsSync(hookPath)).toBe(true);
  });

  test('exits gracefully with empty input', async () => {
    const proc = spawn({
      cmd: ['bun', 'run', hookPath],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PAI_DIR: TEST_PAI_DIR }
    });

    proc.stdin.write('');
    proc.stdin.end();

    const exitCode = await proc.exited;
    expect(exitCode).toBe(0);
  });

  test('creates session summary file', async () => {
    const testPayload = {
      session_id: 'test-session-summary-123',
      timestamp: new Date().toISOString()
    };

    const proc = spawn({
      cmd: ['bun', 'run', hookPath],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PAI_DIR: TEST_PAI_DIR }
    });

    proc.stdin.write(JSON.stringify(testPayload));
    proc.stdin.end();

    await proc.exited;

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const sessionsDir = join(TEST_PAI_DIR, 'history', 'sessions', yearMonth);

    expect(existsSync(sessionsDir)).toBe(true);
    const files = readdirSync(sessionsDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.includes('SESSION'))).toBe(true);
  });

  test('analyzes raw-outputs for session focus', async () => {
    // Create a fake raw-outputs file with hook-related events
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const day = String(now.getDate()).padStart(2, '0');
    const rawOutputsDir = join(TEST_PAI_DIR, 'history', 'raw-outputs', yearMonth);
    mkdirSync(rawOutputsDir, { recursive: true });

    const testEvent = {
      payload: {
        tool_name: 'Edit',
        tool_input: {
          file_path: 'C:/Users/test/.pai/hooks/test-hook.ts'
        }
      }
    };

    writeFileSync(
      join(rawOutputsDir, `${now.getFullYear()}-${yearMonth.split('-')[1]}-${day}_all-events.jsonl`),
      JSON.stringify(testEvent) + '\n'
    );

    const testPayload = {
      session_id: 'test-focus-detection',
      timestamp: new Date().toISOString()
    };

    const proc = spawn({
      cmd: ['bun', 'run', hookPath],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PAI_DIR: TEST_PAI_DIR }
    });

    proc.stdin.write(JSON.stringify(testPayload));
    proc.stdin.end();

    await proc.exited;

    const sessionsDir = join(TEST_PAI_DIR, 'history', 'sessions', yearMonth);
    const files = readdirSync(sessionsDir);

    // Should detect hook-development as focus
    expect(files.some(f => f.includes('hook-development') || f.includes('test-hook'))).toBe(true);
  });

  test('session summary contains expected sections', async () => {
    const testPayload = {
      session_id: 'test-content-check',
      timestamp: new Date().toISOString()
    };

    const proc = spawn({
      cmd: ['bun', 'run', hookPath],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PAI_DIR: TEST_PAI_DIR }
    });

    proc.stdin.write(JSON.stringify(testPayload));
    proc.stdin.end();

    await proc.exited;

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const sessionsDir = join(TEST_PAI_DIR, 'history', 'sessions', yearMonth);
    const files = readdirSync(sessionsDir).filter(f => f.includes('SESSION'));

    if (files.length > 0) {
      const content = readFileSync(join(sessionsDir, files[files.length - 1]), 'utf-8');

      expect(content).toContain('capture_type: SESSION');
      expect(content).toContain('session_id:');
      expect(content).toContain('## Tools Used');
      expect(content).toContain('## Files Modified');
      expect(content).toContain('## Commands Executed');
      expect(content).toContain('PAI History System');
    }
  });
});
