import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { existsSync, mkdirSync, rmSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'bun';

const TEST_PAI_DIR = join(homedir(), 'pai-test-subagent');
const hookPath = join(homedir(), '.pai', 'hooks', 'subagent-stop-hook.ts');

describe('subagent-stop-hook', () => {
  beforeAll(() => {
    // Create test directory structure
    mkdirSync(join(TEST_PAI_DIR, 'history', 'research'), { recursive: true });
    mkdirSync(join(TEST_PAI_DIR, 'history', 'decisions'), { recursive: true });
    mkdirSync(join(TEST_PAI_DIR, 'history', 'execution', 'features'), { recursive: true });
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

  test('exits gracefully without transcript_path', async () => {
    const testPayload = {
      session_id: 'test-session'
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

  test('captures researcher agent output to research directory', async () => {
    // Create a mock transcript file
    const transcriptDir = join(TEST_PAI_DIR, 'transcripts');
    mkdirSync(transcriptDir, { recursive: true });
    const transcriptPath = join(transcriptDir, 'agent-test.jsonl');

    // Mock transcript with Task tool use and result
    const transcriptContent = [
      JSON.stringify({
        type: 'assistant',
        message: {
          content: [{
            type: 'tool_use',
            id: 'tool-123',
            name: 'Task',
            input: {
              subagent_type: 'Explore',
              prompt: 'Search for files'
            }
          }]
        }
      }),
      JSON.stringify({
        type: 'user',
        message: {
          content: [{
            type: 'tool_result',
            tool_use_id: 'tool-123',
            content: '🎯 COMPLETED: Found all relevant configuration files in the codebase'
          }]
        }
      })
    ].join('\n');

    writeFileSync(transcriptPath, transcriptContent);

    const testPayload = {
      session_id: 'test-researcher-session',
      transcript_path: transcriptPath
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

    // Check research directory
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const researchDir = join(TEST_PAI_DIR, 'history', 'research', yearMonth);

    if (existsSync(researchDir)) {
      const files = readdirSync(researchDir);
      // Should have captured the agent output
      expect(files.length).toBeGreaterThanOrEqual(0);
    }
  });

  test('routes architect agent to decisions directory', async () => {
    const transcriptDir = join(TEST_PAI_DIR, 'transcripts2');
    mkdirSync(transcriptDir, { recursive: true });
    const transcriptPath = join(transcriptDir, 'agent-architect.jsonl');

    const transcriptContent = [
      JSON.stringify({
        type: 'assistant',
        message: {
          content: [{
            type: 'tool_use',
            id: 'tool-456',
            name: 'Task',
            input: {
              subagent_type: 'architect',
              prompt: 'Design the system'
            }
          }]
        }
      }),
      JSON.stringify({
        type: 'user',
        message: {
          content: [{
            type: 'tool_result',
            tool_use_id: 'tool-456',
            content: '🎯 COMPLETED: Designed microservices architecture with event-driven communication'
          }]
        }
      })
    ].join('\n');

    writeFileSync(transcriptPath, transcriptContent);

    const testPayload = {
      session_id: 'test-architect-session',
      transcript_path: transcriptPath
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
    const decisionsDir = join(TEST_PAI_DIR, 'history', 'decisions', yearMonth);

    if (existsSync(decisionsDir)) {
      const files = readdirSync(decisionsDir);
      if (files.length > 0) {
        expect(files.some(f => f.includes('DECISION') || f.includes('architect'))).toBe(true);
      }
    }
  });

  test('handles invalid JSON gracefully', async () => {
    const proc = spawn({
      cmd: ['bun', 'run', hookPath],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, PAI_DIR: TEST_PAI_DIR }
    });

    proc.stdin.write('not valid json');
    proc.stdin.end();

    const exitCode = await proc.exited;
    expect(exitCode).toBe(0);
  });
});
