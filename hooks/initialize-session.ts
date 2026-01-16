#!/usr/bin/env bun
// $PAI_DIR/hooks/initialize-session.ts
// SessionStart hook: Initialize session state and environment

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface SessionStartPayload {
  session_id: string;
  cwd?: string;
  [key: string]: any;
}

export function getLocalTimestamp(): string {
  const date = new Date();
  const tz = process.env.TIME_ZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;

  try {
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const seconds = String(localDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return new Date().toISOString();
  }
}

function setTabTitle(title: string): void {
  // OSC escape sequence for terminal tab title
  const tabEscape = `\x1b]1;${title}\x07`;
  const windowEscape = `\x1b]2;${title}\x07`;

  process.stderr.write(tabEscape);
  process.stderr.write(windowEscape);
}

export function getProjectName(cwd: string | undefined): string {
  if (!cwd) return 'Session';

  // Extract project name from path
  const parts = cwd.split('/').filter(p => p);

  // Look for common project indicators
  const projectIndicators = ['Projects', 'projects', 'src', 'repos', 'code'];
  for (let i = parts.length - 1; i >= 0; i--) {
    if (projectIndicators.includes(parts[i]) && parts[i + 1]) {
      return parts[i + 1];
    }
  }

  // Default to last directory component
  return parts[parts.length - 1] || 'Session';
}

// Node.js compatible stdin reading (works on Windows)
function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => resolve(data));
    if (process.stdin.readableEnded) resolve(data);
  });
}

async function checkForUpdates(): Promise<void> {
  // Optional: Check for Claude Code updates in background
  // This is non-blocking and fails silently
  try {
    const proc = Bun.spawn(['claude', '--version'], {
      stdout: 'pipe',
      stderr: 'pipe'
    });

    const output = await new Response(proc.stdout).text();
    const version = output.trim().match(/[\d.]+/)?.[0];

    if (version) {
      // Could compare against known latest version
      // For now, just log it
      console.error(`[PAI] Claude Code version: ${version}`);
    }
  } catch {
    // Silently ignore - version check is optional
  }
}

async function main() {
  try {
    const stdinData = await readStdin();
    if (!stdinData.trim()) {
      process.exit(0);
    }

    const payload: SessionStartPayload = JSON.parse(stdinData);
    const paiDir = process.env.PAI_DIR || join(homedir(), 'pai');

    // 1. Set initial tab title
    const projectName = getProjectName(payload.cwd);
    setTabTitle(`🤖 ${projectName}`);

    // 2. Ensure required directories exist
    const requiredDirs = [
      join(paiDir, 'hooks', 'lib'),
      join(paiDir, 'history', 'sessions'),
      join(paiDir, 'history', 'learnings'),
      join(paiDir, 'history', 'research'),
    ];

    for (const dir of requiredDirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }

    // 3. Create session marker file (optional - for tracking)
    const sessionFile = join(paiDir, '.current-session');
    writeFileSync(sessionFile, JSON.stringify({
      session_id: payload.session_id,
      started: getLocalTimestamp(),
      cwd: payload.cwd,
      project: projectName
    }, null, 2));

    // 4. Background version check (non-blocking)
    checkForUpdates().catch(() => {});

    // Output session info
    console.error(`[PAI] Session initialized: ${projectName}`);
    console.error(`[PAI] Time: ${getLocalTimestamp()}`);

  } catch (error) {
    // Never crash - just log
    console.error('Session initialization error:', error);
  }

  process.exit(0);
}

// Only run main when executed directly (not when imported for testing)
if (import.meta.main) {
  main();
}
