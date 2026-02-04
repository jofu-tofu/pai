/**
 * current-work.ts - Multi-session work state management
 *
 * PURPOSE:
 * Provides concurrent-safe, multi-session state management using per-session files.
 * Each session writes to its own file, eliminating read-modify-write race conditions.
 *
 * FEATURES:
 * - Per-session files (no race conditions)
 * - Atomic writes (temp file + rename pattern)
 * - Stale session cleanup (24h threshold, opportunistic)
 *
 * STORAGE FORMAT:
 * MEMORY/STATE/sessions/
 *   {sessionId}.json → { work_dir, created_at, item_count }
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, renameSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { getPaiDir } from './paths';

// === Constants ===
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSIONS_DIR = 'sessions';

// Lazy-evaluated paths (allows PAI_DIR override in tests)
function getStateDir(): string {
  return join(getPaiDir(), 'MEMORY', 'STATE');
}

function getSessionsDir(): string {
  return join(getStateDir(), SESSIONS_DIR);
}

function getSessionFile(sessionId: string): string {
  // Sanitize sessionId to prevent path traversal
  const safeId = sessionId.replace(/[^a-zA-Z0-9-]/g, '_');
  return join(getSessionsDir(), `${safeId}.json`);
}

// === Types ===

/** Session work state (stored per session) */
export interface SessionWork {
  work_dir: string;
  created_at: string;
  item_count: number;
}

// === Atomic Write ===

/**
 * Write file atomically using temp file + rename pattern.
 * Prevents partial writes from corrupting state.
 */
function atomicWrite(filePath: string, data: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const tempPath = `${filePath}.tmp.${process.pid}`;
  writeFileSync(tempPath, data, 'utf-8');
  renameSync(tempPath, filePath);
}

// === Stale Cleanup ===

/**
 * Remove sessions older than 24 hours.
 * Called opportunistically on new session creation.
 */
function cleanupStaleSessions(): void {
  const sessionsDir = getSessionsDir();
  if (!existsSync(sessionsDir)) return;

  const now = Date.now();

  try {
    const files = readdirSync(sessionsDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      try {
        const filePath = join(sessionsDir, file);
        const content = readFileSync(filePath, 'utf-8');
        const session = JSON.parse(content) as SessionWork;
        const createdAt = new Date(session.created_at).getTime();

        if (!isNaN(createdAt) && now - createdAt > STALE_THRESHOLD_MS) {
          unlinkSync(filePath);
          console.error(`[CurrentWork] Cleaned stale session: ${file}`);
        }
      } catch {
        // Skip files that fail to parse or delete
      }
    }
  } catch {
    // Ignore directory read errors
  }
}

// === Public API ===

/**
 * Get session work state by session ID.
 * Returns null if session doesn't exist.
 */
export function getSession(sessionId: string): SessionWork | null {
  const filePath = getSessionFile(sessionId);
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as SessionWork;
  } catch {
    return null;
  }
}

/**
 * Set session work state.
 * Each session writes ONLY to its own file - no race condition.
 * Runs stale cleanup opportunistically on new session creation.
 */
export function setSession(sessionId: string, session: SessionWork): void {
  const sessionsDir = getSessionsDir();
  if (!existsSync(sessionsDir)) {
    mkdirSync(sessionsDir, { recursive: true });
  }

  const filePath = getSessionFile(sessionId);
  const isNewSession = !existsSync(filePath);

  // Each session writes ONLY to its own file - no race condition
  atomicWrite(filePath, JSON.stringify(session, null, 2));

  // Run stale cleanup opportunistically on new session creation only
  if (isNewSession) {
    cleanupStaleSessions();
  }
}

/**
 * Remove session from state.
 * Deletes the session's file.
 */
export function removeSession(sessionId: string): void {
  const filePath = getSessionFile(sessionId);
  if (existsSync(filePath)) {
    try {
      unlinkSync(filePath);
    } catch {
      // Ignore deletion failure
    }
  }
}

/**
 * Get all active sessions.
 * Aggregates from individual session files.
 */
export function getAllSessions(): Record<string, SessionWork> {
  const sessionsDir = getSessionsDir();
  if (!existsSync(sessionsDir)) {
    return {};
  }

  const sessions: Record<string, SessionWork> = {};

  try {
    const files = readdirSync(sessionsDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const sessionId = file.replace('.json', '');
      try {
        const content = readFileSync(join(sessionsDir, file), 'utf-8');
        sessions[sessionId] = JSON.parse(content) as SessionWork;
      } catch {
        // Skip corrupt files
      }
    }
  } catch {
    // Return empty on directory read error
  }

  return sessions;
}

/**
 * Check if a session exists.
 */
export function hasSession(sessionId: string): boolean {
  return existsSync(getSessionFile(sessionId));
}
