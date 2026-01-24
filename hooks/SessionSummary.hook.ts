#!/usr/bin/env bun
/**
 * SessionSummary.hook.ts - Mark Work Complete and Clear State (SessionEnd)
 *
 * PURPOSE:
 * Finalizes a Claude Code session by marking the current work directory as
 * COMPLETED and clearing the session state. This ensures clean session boundaries
 * and accurate work tracking.
 *
 * TRIGGER: SessionEnd
 *
 * INPUT:
 * - stdin: Hook input JSON (session_id, transcript_path)
 * - Files: MEMORY/STATE/current-work.json
 *
 * OUTPUT:
 * - stdout: None
 * - stderr: Status messages
 * - exit(0): Always (non-blocking)
 *
 * SIDE EFFECTS:
 * - Updates: MEMORY/WORK/<dir>/META.yaml (status: COMPLETED, completed_at timestamp)
 * - Deletes: MEMORY/STATE/current-work.json (clears session state)
 *
 * INTER-HOOK RELATIONSHIPS:
 * - DEPENDS ON: AutoWorkCreation (expects WORK/ structure and current-work.json)
 * - COORDINATES WITH: WorkCompletionLearning (both run at SessionEnd)
 * - MUST RUN BEFORE: None (final cleanup)
 * - MUST RUN AFTER: WorkCompletionLearning (learning capture uses state before clear)
 *
 * STATE TRANSITIONS:
 * - META.yaml status: "ACTIVE" → "COMPLETED"
 * - META.yaml completed_at: null → ISO timestamp
 * - current-work.json: exists → deleted
 *
 * DESIGN NOTES:
 * - Does NOT write to SESSIONS/ directory (WORK/ is the primary tracking system)
 * - Deleting current-work.json signals a clean slate for next session
 *
 * ERROR HANDLING:
 * - No current work: Logs message, exits gracefully
 * - Missing META.yaml: Skips update, continues to state clear
 * - File operation failures: Logged to stderr
 *
 * PERFORMANCE:
 * - Non-blocking: Yes
 * - Typical execution: <50ms
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getISOTimestamp } from './lib/time';
import { getMemoryDir } from './lib/paths';
import { getSession, removeSession } from './utils/current-work';

const MEMORY_DIR = getMemoryDir();
const WORK_DIR = join(MEMORY_DIR, 'WORK');

/**
 * Mark work directory as completed and clear session state
 */
function clearSessionWork(sessionId: string): void {
  try {
    // Get session state using multi-session utility
    const currentWork = getSession(sessionId);
    if (!currentWork) {
      console.error('[SessionSummary] No current work to complete for this session');
      return;
    }

    // Mark work directory as COMPLETED
    if (currentWork.work_dir) {
      const metaPath = join(WORK_DIR, currentWork.work_dir, 'META.yaml');
      if (existsSync(metaPath)) {
        let metaContent = readFileSync(metaPath, 'utf-8');
        metaContent = metaContent.replace(/^status: "ACTIVE"$/m, 'status: "COMPLETED"');
        metaContent = metaContent.replace(/^completed_at: null$/m, `completed_at: "${getISOTimestamp()}"`);
        writeFileSync(metaPath, metaContent, 'utf-8');
        console.error(`[SessionSummary] Marked work directory as COMPLETED: ${currentWork.work_dir}`);
      }
    }

    // Remove this session from multi-session state (deletes file if last session)
    removeSession(sessionId);
    console.error('[SessionSummary] Cleared session work state');
  } catch (error) {
    console.error(`[SessionSummary] Error clearing session work: ${error}`);
  }
}

interface HookInput {
  session_id: string;
  transcript_path?: string;
}

async function main() {
  try {
    // Read input from stdin to get session_id
    const input = await Bun.stdin.text();
    if (!input || input.trim() === '') {
      process.exit(0);
    }

    const data: HookInput = JSON.parse(input);
    const sessionId = data.session_id || 'unknown';

    // Mark work as complete and clear state for this session
    // NOTE: Does NOT write to SESSIONS/ - WORK/ is the primary system
    clearSessionWork(sessionId);

    console.error('[SessionSummary] Session ended, work marked complete');
    process.exit(0);
  } catch (error) {
    // Silent failure - don't disrupt workflow
    console.error(`[SessionSummary] SessionEnd hook error: ${error}`);
    process.exit(0);
  }
}

main();
