import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { existsSync, mkdirSync, rmSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'bun';

const TEST_PAI_DIR = join(homedir(), 'pai-test-history');
const hookPath = join(homedir(), 'pai', 'hooks', 'capture-all-events.ts');

describe('capture-all-events', () => {
  beforeAll(() => {
    // Create test directory structure
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

  test('captures PreToolUse event to JSONL', async () => {
    const testPayload = {
      session_id: 'test-session-123',
      tool_name: 'Bash',
      tool_input: { command: 'ls' }
    };

    const proc = spawn({
      cmd: ['bun', 'run', hookPath, '--event-type', 'PreToolUse'],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PAI_DIR: TEST_PAI_DIR }
    });

    proc.stdin.write(JSON.stringify(testPayload));
    proc.stdin.end();

    await proc.exited;

    // Check that JSONL file was created - find the actual file
    // (bun test runs in UTC but spawned process uses local time)
    const rawOutputsDir = join(TEST_PAI_DIR, 'history', 'raw-outputs');
    expect(existsSync(rawOutputsDir)).toBe(true);

    const monthDirs = readdirSync(rawOutputsDir);
    expect(monthDirs.length).toBeGreaterThan(0);

    const monthDir = join(rawOutputsDir, monthDirs[0]);
    const files = readdirSync(monthDir).filter(f => f.endsWith('_all-events.jsonl'));
    expect(files.length).toBeGreaterThan(0);

    // Verify content
    const content = readFileSync(join(monthDir, files[0]), 'utf-8');
    const lines = content.trim().split('\n');
    const lastEvent = JSON.parse(lines[lines.length - 1]);

    expect(lastEvent.hook_event_type).toBe('PreToolUse');
    expect(lastEvent.session_id).toBe('test-session-123');
    expect(lastEvent.payload.tool_name).toBe('Bash');
  });

  test('exits with code 0 on missing --event-type', async () => {
    const proc = spawn({
      cmd: ['bun', 'run', hookPath],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PAI_DIR: TEST_PAI_DIR }
    });

    proc.stdin.write('{}');
    proc.stdin.end();

    const exitCode = await proc.exited;
    expect(exitCode).toBe(0);
  });

  test('handles Task tool with subagent_type', async () => {
    const testPayload = {
      session_id: 'test-session-456',
      tool_name: 'Task',
      tool_input: {
        subagent_type: 'Explore',
        prompt: 'Search the codebase'
      }
    };

    const proc = spawn({
      cmd: ['bun', 'run', hookPath, '--event-type', 'PreToolUse'],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PAI_DIR: TEST_PAI_DIR }
    });

    proc.stdin.write(JSON.stringify(testPayload));
    proc.stdin.end();

    await proc.exited;

    // Find the actual file (bun test runs in UTC but spawned process uses local time)
    const rawOutputsDir = join(TEST_PAI_DIR, 'history', 'raw-outputs');
    const monthDirs = readdirSync(rawOutputsDir);
    const monthDir = join(rawOutputsDir, monthDirs[0]);
    const files = readdirSync(monthDir).filter(f => f.endsWith('_all-events.jsonl'));

    const content = readFileSync(join(monthDir, files[0]), 'utf-8');
    const lines = content.trim().split('\n');
    const lastEvent = JSON.parse(lines[lines.length - 1]);

    expect(lastEvent.agent_type).toBe('Explore');
  });

  test('handles invalid JSON gracefully', async () => {
    const proc = spawn({
      cmd: ['bun', 'run', hookPath, '--event-type', 'PreToolUse'],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PAI_DIR: TEST_PAI_DIR }
    });

    proc.stdin.write('not valid json');
    proc.stdin.end();

    const exitCode = await proc.exited;
    expect(exitCode).toBe(0); // Should exit gracefully
  });
});
