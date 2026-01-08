import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { existsSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'bun';

const TEST_PAI_DIR = join(homedir(), '.pai-test-stop-hook');
const hookPath = join(homedir(), '.pai', 'hooks', 'stop-hook.ts');

describe('stop-hook', () => {
  beforeAll(() => {
    // Create test directory structure
    mkdirSync(join(TEST_PAI_DIR, 'history', 'sessions'), { recursive: true });
    mkdirSync(join(TEST_PAI_DIR, 'history', 'learnings'), { recursive: true });
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

  test('exits gracefully with no response', async () => {
    const testPayload = {
      session_id: 'test-session-no-response',
      stop_hook_active: true
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

    const exitCode = await proc.exited;
    expect(exitCode).toBe(0);
  });

  test('captures learning with learning indicators', async () => {
    const testPayload = {
      session_id: 'test-learning-session',
      stop_hook_active: true,
      response: 'I discovered the problem was a bug in the code. After debugging, I fixed the error by updating the function.'
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

    // Check that file was created in learnings
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const learningsDir = join(TEST_PAI_DIR, 'history', 'learnings', yearMonth);

    expect(existsSync(learningsDir)).toBe(true);

    const files = readdirSync(learningsDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.includes('LEARNING'))).toBe(true);
  });

  test('captures session without learning indicators', async () => {
    const testPayload = {
      session_id: 'test-regular-session',
      stop_hook_active: true,
      response: 'I completed the task by creating a new component. The implementation follows the existing patterns in the codebase.'
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

    // Check that file was created in sessions
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const sessionsDir = join(TEST_PAI_DIR, 'history', 'sessions', yearMonth);

    expect(existsSync(sessionsDir)).toBe(true);

    const files = readdirSync(sessionsDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.includes('SESSION'))).toBe(true);
  });

  test('extracts summary from COMPLETED section', async () => {
    const testPayload = {
      session_id: 'test-completed-summary',
      stop_hook_active: true,
      response: '🎯 COMPLETED: Added authentication to the app\n\nThe implementation includes login and logout functionality.'
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
    const files = readdirSync(sessionsDir);

    // Should have a file with the summary in the filename
    expect(files.some(f => f.toLowerCase().includes('authentication') || f.toLowerCase().includes('added'))).toBe(true);
  });
});
