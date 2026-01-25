/**
 * current-work.ts - Multi-session work state management
 *
 * PURPOSE:
 * Provides atomic, multi-session state management for current-work.json.
 * Allows multiple Claude Code sessions to run concurrently without
 * overwriting each other's state.
 *
 * FEATURES:
 * - Atomic writes (temp file + rename pattern)
 * - Legacy format migration (v1 → v2)
 * - Corruption recovery with backup
 * - Stale session cleanup (24h threshold, on new session only)
 *
 * DATA FORMAT (v2):
 * {
 *   "_version": 2,
 *   "sessions": {
 *     "session-id-1": { work_dir, created_at, item_count },
 *     "session-id-2": { work_dir, created_at, item_count }
 *   }
 * }
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { getPaiDir } from './paths';

// === Constants ===
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

// Lazy-evaluated paths (allows PAI_DIR override in tests)
function getStateDir(): string {
  return join(getPaiDir(), 'MEMORY', 'STATE');
}

function getCurrentWorkFile(): string {
  return join(getStateDir(), 'current-work.json');
}

// === Types ===

/** Session work state (stored per session) */
export interface SessionWork {
  work_dir: string;
  created_at: string;
  item_count: number;
}

/** Legacy v1 format (single session, no version field) */
interface LegacyFormat {
  session_id: string;
  work_dir: string;
  created_at: string;
  item_count: number;
}

/** Current v2 format (multi-session with version) */
interface CurrentWorkState {
  _version: 2;
  sessions: Record<string, SessionWork>;
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

// === Format Detection & Migration ===

/**
 * Check if data is in legacy v1 format (has session_id, no _version).
 */
function isLegacyFormat(data: unknown): data is LegacyFormat {
  return !!data && typeof data === 'object' &&
         'session_id' in data && !('_version' in data);
}

/**
 * Migrate legacy v1 format to v2 multi-session format.
 */
function migrateLegacy(legacy: LegacyFormat): CurrentWorkState {
  return {
    _version: 2,
    sessions: {
      [legacy.session_id]: {
        work_dir: legacy.work_dir,
        created_at: legacy.created_at,
        item_count: legacy.item_count
      }
    }
  };
}

// === Stale Cleanup ===

/**
 * Remove sessions older than 24 hours.
 * Only called on new session start to minimize race window.
 */
function cleanupStale(sessions: Record<string, SessionWork>): Record<string, SessionWork> {
  const now = Date.now();
  const cleaned: Record<string, SessionWork> = {};

  for (const [id, session] of Object.entries(sessions)) {
    const createdAt = new Date(session.created_at).getTime();
    // Keep if timestamp invalid (be safe) or not stale
    if (isNaN(createdAt) || now - createdAt < STALE_THRESHOLD_MS) {
      cleaned[id] = session;
    } else {
      console.error(`[CurrentWork] Cleaned stale session: ${id}`);
    }
  }

  return cleaned;
}

// === Core Operations ===

/**
 * Read and parse current work state.
 * Handles missing file, legacy migration, and corruption recovery.
 */
function readState(): CurrentWorkState {
  if (!existsSync(getCurrentWorkFile())) {
    return { _version: 2, sessions: {} };
  }

  try {
    const content = readFileSync(getCurrentWorkFile(), 'utf-8');
    const data = JSON.parse(content);

    // Handle legacy format migration
    if (isLegacyFormat(data)) {
      console.error('[CurrentWork] Migrating legacy format to v2');
      const migrated = migrateLegacy(data);
      atomicWrite(getCurrentWorkFile(), JSON.stringify(migrated, null, 2));
      return migrated;
    }

    return data as CurrentWorkState;
  } catch (err) {
    // Backup corrupt file, don't overwrite
    const backupPath = `${getCurrentWorkFile()}.corrupt.${Date.now()}`;
    console.error(`[CurrentWork] Parse error, backing up to ${backupPath}`);
    try {
      renameSync(getCurrentWorkFile(), backupPath);
    } catch {
      // Ignore backup failure - file may already be gone
    }
    return { _version: 2, sessions: {} };
  }
}

/**
 * Write current work state atomically.
 */
function writeState(state: CurrentWorkState): void {
  atomicWrite(getCurrentWorkFile(), JSON.stringify(state, null, 2));
}

// === Public API ===

/**
 * Get session work state by session ID.
 * Returns null if session doesn't exist.
 */
export function getSession(sessionId: string): SessionWork | null {
  const state = readState();
  return state.sessions[sessionId] || null;
}

/**
 * Set session work state.
 * Runs stale cleanup on new session creation only.
 */
export function setSession(sessionId: string, session: SessionWork): void {
  const state = readState();
  const isNewSession = !(sessionId in state.sessions);

  // Only cleanup on new session start (not every write)
  if (isNewSession) {
    state.sessions = cleanupStale(state.sessions);
  }

  state.sessions[sessionId] = session;
  writeState(state);
}

/**
 * Remove session from state.
 * Deletes file if this was the last session.
 */
export function removeSession(sessionId: string): void {
  const state = readState();
  delete state.sessions[sessionId];

  if (Object.keys(state.sessions).length === 0) {
    // No sessions left - delete the file
    if (existsSync(getCurrentWorkFile())) {
      try {
        unlinkSync(getCurrentWorkFile());
      } catch {
        // Ignore deletion failure
      }
    }
  } else {
    writeState(state);
  }
}

/**
 * Get all active sessions.
 * Useful for debugging/diagnostics.
 */
export function getAllSessions(): Record<string, SessionWork> {
  return readState().sessions;
}

/**
 * Check if a session exists.
 */
export function hasSession(sessionId: string): boolean {
  const state = readState();
  return sessionId in state.sessions;
}
