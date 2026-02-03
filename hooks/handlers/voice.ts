/**
 * voice.ts - Voice notification handler
 *
 * Pure handler: receives pre-parsed transcript data, sends to voice server.
 * No I/O for transcript reading - that's done by orchestrator.
 */

import { existsSync, appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { paiPath } from '../core/paths';
import { getIdentity } from '../core/identity';
import { getISOTimestamp } from '../core/time';
import { isValidVoiceCompletion, getVoiceFallback } from '../core/response-format';
import { getSession } from '../core/current-work';
import type { ParsedTranscript } from '../../skills/PAI/Tools/TranscriptParser';

const DA_IDENTITY = getIdentity();

interface NotificationPayload {
  title: string;
  message: string;
  voice_enabled: boolean;
  priority?: 'low' | 'normal' | 'high';
  voice_id: string;
}

interface VoiceEvent {
  timestamp: string;
  session_id: string;
  event_type: 'sent' | 'failed' | 'skipped';
  message: string;
  character_count: number;
  voice_id: string;
  status_code?: number;
  error?: string;
}

const VOICE_LOG_PATH = paiPath('MEMORY', 'VOICE', 'voice-events.jsonl');

function getActiveWorkDir(sessionId: string): string | null {
  try {
    const session = getSession(sessionId);
    if (session?.work_dir) {
      const workPath = paiPath('MEMORY', 'WORK', session.work_dir);
      if (existsSync(workPath)) return workPath;
    }
  } catch {
    // Silent fail
  }
  return null;
}

function logVoiceEvent(event: VoiceEvent): void {
  const line = JSON.stringify(event) + '\n';

  try {
    const dir = paiPath('MEMORY', 'VOICE');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    appendFileSync(VOICE_LOG_PATH, line);
  } catch {
    // Silent fail
  }

  try {
    // Multi-session: use session_id from event to find work directory
    const workDir = getActiveWorkDir(event.session_id);
    if (workDir) {
      appendFileSync(join(workDir, 'voice.jsonl'), line);
    }
  } catch {
    // Silent fail
  }
}

async function sendNotification(payload: NotificationPayload, sessionId: string): Promise<void> {
  const baseEvent: Omit<VoiceEvent, 'event_type' | 'status_code' | 'error'> = {
    timestamp: getISOTimestamp(),
    session_id: sessionId,
    message: payload.message,
    character_count: payload.message.length,
    voice_id: payload.voice_id,
  };

  try {
    const response = await fetch('http://localhost:8888/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Voice] Server error:', response.statusText);
      logVoiceEvent({
        ...baseEvent,
        event_type: 'failed',
        status_code: response.status,
        error: response.statusText,
      });
    } else {
      logVoiceEvent({
        ...baseEvent,
        event_type: 'sent',
        status_code: response.status,
      });
    }
  } catch (error) {
    console.error('[Voice] Failed to send:', error);
    logVoiceEvent({
      ...baseEvent,
      event_type: 'failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Handle voice notification with pre-parsed transcript data.
 */
export async function handleVoice(parsed: ParsedTranscript, sessionId: string): Promise<void> {
  let voiceCompletion = parsed.voiceCompletion;

  // Validate voice completion
  if (!isValidVoiceCompletion(voiceCompletion)) {
    console.error(`[Voice] Invalid completion: "${voiceCompletion.slice(0, 50)}..."`);
    voiceCompletion = getVoiceFallback();
  }

  // Skip empty or too-short messages
  if (!voiceCompletion || voiceCompletion.length < 5) {
    console.error('[Voice] Skipping - message too short or empty');
    return;
  }

  const payload: NotificationPayload = {
    title: DA_IDENTITY.name,
    message: voiceCompletion,
    voice_enabled: true,
    priority: 'normal',
    voice_id: DA_IDENTITY.voiceId,
  };

  await sendNotification(payload, sessionId);
}
