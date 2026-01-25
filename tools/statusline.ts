#!/usr/bin/env bun
/**
 * PAI Status Line - Cross-Platform TypeScript Implementation
 *
 * Responsive status line with 4 display modes based on terminal width:
 *   - nano   (<35 cols): Minimal single-line displays
 *   - micro  (35-54):    Compact with key metrics
 *   - mini   (55-79):    Balanced information density
 *   - normal (80+):      Full display with sparklines
 *
 * Output order: PAI Branding → Context → Git → Memory → Learning → Quote
 *
 * KNOWN LIMITATION: Context percentage won't match /context exactly.
 * Hook JSON excludes system prompt, tools, MCP tokens. See:
 * github.com/anthropics/claude-code/issues/13783
 *
 * Usage: echo '{"context_window": {...}}' | bun run tools/statusline.ts
 */

import { existsSync, statSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { spawnSync, type SpawnSyncOptions } from 'child_process';
import { isWindows, isMacOS, getEnvVar, splitLines, getWindowsSyncSpawnOptions, isNoColorSet } from '../hooks/core/platform';
import { getPaiDir } from '../hooks/core/paths';

// Helper for cross-platform spawn options with windowsHide
function getSpawnOpts(timeout = 2000): SpawnSyncOptions {
  return {
    encoding: 'utf-8' as const,
    timeout,
    ...getWindowsSyncSpawnOptions(),
  };
}

// =============================================================================
// Configuration
// =============================================================================

const PAI_DIR = getPaiDir();
const SETTINGS_FILE = join(PAI_DIR, 'settings.json');
const RATINGS_FILE = join(PAI_DIR, 'MEMORY', 'LEARNING', 'SIGNALS', 'ratings.jsonl');
const MODEL_CACHE = join(PAI_DIR, 'MEMORY', 'STATE', 'model-cache.txt');
const QUOTE_CACHE = join(PAI_DIR, '.quote-cache');
const LOCATION_CACHE = join(PAI_DIR, 'MEMORY', 'STATE', 'location-cache.json');
const WEATHER_CACHE = join(PAI_DIR, 'MEMORY', 'STATE', 'weather-cache.json');

// Context baseline: preloaded tokens not visible to hooks (~22.6k typical)
const CONTEXT_BASELINE = 22600;

// Cache TTL in seconds
const LOCATION_CACHE_TTL = 3600; // 1 hour
const WEATHER_CACHE_TTL = 900; // 15 minutes

// =============================================================================
// Feature Flags (toggle sections on/off)
// =============================================================================

const SHOW_PAI_BRANDING = false;     // PAI branding header with location, time, weather
const SHOW_MEMORY_SECTION = false;   // Memory stats (work, ratings, sessions, research)
const SHOW_LEARNING_SECTION = false; // Learning signal with sparklines

// =============================================================================
// Color Palette (Tailwind-inspired)
// Respects NO_COLOR environment variable: https://no-color.org
// =============================================================================

// Check if colors should be disabled (NO_COLOR standard)
const NO_COLOR = isNoColorSet();

const RESET = NO_COLOR ? '' : '\x1b[0m';

// Structural (chrome, labels, separators)
const SLATE_300 = NO_COLOR ? '' : '\x1b[38;2;203;213;225m';
const SLATE_400 = NO_COLOR ? '' : '\x1b[38;2;148;163;184m';
const SLATE_500 = NO_COLOR ? '' : '\x1b[38;2;100;116;139m';
const SLATE_600 = NO_COLOR ? '' : '\x1b[38;2;71;85;105m';

// Semantic colors
const EMERALD = NO_COLOR ? '' : '\x1b[38;2;74;222;128m';
const ROSE = NO_COLOR ? '' : '\x1b[38;2;251;113;133m';

// Rating gradient
const RATING_10 = NO_COLOR ? '' : '\x1b[38;2;74;222;128m';
const RATING_8 = NO_COLOR ? '' : '\x1b[38;2;163;230;53m';
const RATING_7 = NO_COLOR ? '' : '\x1b[38;2;250;204;21m';
const RATING_6 = NO_COLOR ? '' : '\x1b[38;2;251;191;36m';
const RATING_5 = NO_COLOR ? '' : '\x1b[38;2;251;146;60m';
const RATING_4 = NO_COLOR ? '' : '\x1b[38;2;248;113;113m';
const RATING_LOW = NO_COLOR ? '' : '\x1b[38;2;239;68;68m';

// Line themes
const GREET_PRIMARY = NO_COLOR ? '' : '\x1b[38;2;167;139;250m';
const WIELD_PRIMARY = NO_COLOR ? '' : '\x1b[38;2;34;211;238m';
const WIELD_ACCENT = NO_COLOR ? '' : '\x1b[38;2;103;232;249m';
const WIELD_WORKFLOWS = NO_COLOR ? '' : '\x1b[38;2;94;234;212m';
const WIELD_HOOKS = NO_COLOR ? '' : '\x1b[38;2;6;182;212m';
const GIT_PRIMARY = NO_COLOR ? '' : '\x1b[38;2;56;189;248m';
const GIT_VALUE = NO_COLOR ? '' : '\x1b[38;2;186;230;253m';
const GIT_DIR = NO_COLOR ? '' : '\x1b[38;2;147;197;253m';
const GIT_CLEAN = NO_COLOR ? '' : '\x1b[38;2;125;211;252m';
const GIT_MODIFIED = NO_COLOR ? '' : '\x1b[38;2;96;165;250m';
const GIT_ADDED = NO_COLOR ? '' : '\x1b[38;2;59;130;246m';
const GIT_STASH = NO_COLOR ? '' : '\x1b[38;2;165;180;252m';
const GIT_AGE_FRESH = NO_COLOR ? '' : '\x1b[38;2;125;211;252m';
const GIT_AGE_RECENT = NO_COLOR ? '' : '\x1b[38;2;96;165;250m';
const GIT_AGE_STALE = NO_COLOR ? '' : '\x1b[38;2;59;130;246m';
const GIT_AGE_OLD = NO_COLOR ? '' : '\x1b[38;2;99;102;241m';
const LEARN_PRIMARY = NO_COLOR ? '' : '\x1b[38;2;167;139;250m';
const LEARN_SECONDARY = NO_COLOR ? '' : '\x1b[38;2;196;181;253m';
const LEARN_WORK = NO_COLOR ? '' : '\x1b[38;2;192;132;252m';
const LEARN_SIGNALS = NO_COLOR ? '' : '\x1b[38;2;139;92;246m';
const LEARN_RESEARCH = NO_COLOR ? '' : '\x1b[38;2;129;140;248m';
const LEARN_SESSIONS = NO_COLOR ? '' : '\x1b[38;2;99;102;241m';
const SIGNAL_PERIOD = NO_COLOR ? '' : '\x1b[38;2;148;163;184m';
const LEARN_LABEL = NO_COLOR ? '' : '\x1b[38;2;21;128;61m';
const CTX_PRIMARY = NO_COLOR ? '' : '\x1b[38;2;129;140;248m';
const CTX_SECONDARY = NO_COLOR ? '' : '\x1b[38;2;165;180;252m';
const CTX_ACCENT = NO_COLOR ? '' : '\x1b[38;2;139;92;246m';
const CTX_BUCKET_EMPTY = NO_COLOR ? '' : '\x1b[38;2;75;82;95m';
const QUOTE_PRIMARY = NO_COLOR ? '' : '\x1b[38;2;252;211;77m';
const QUOTE_AUTHOR = NO_COLOR ? '' : '\x1b[38;2;180;140;60m';
const PAI_P = NO_COLOR ? '' : '\x1b[38;2;30;58;138m';
const PAI_A = NO_COLOR ? '' : '\x1b[38;2;59;130;246m';
const PAI_I = NO_COLOR ? '' : '\x1b[38;2;147;197;253m';
const PAI_LABEL = NO_COLOR ? '' : '\x1b[38;2;100;116;139m';
const PAI_CITY = NO_COLOR ? '' : '\x1b[38;2;147;197;253m';
const PAI_STATE = NO_COLOR ? '' : '\x1b[38;2;100;116;139m';
const PAI_TIME = NO_COLOR ? '' : '\x1b[38;2;96;165;250m';
const PAI_WEATHER = NO_COLOR ? '' : '\x1b[38;2;135;206;235m';

// =============================================================================
// Types
// =============================================================================

type DisplayMode = 'nano' | 'micro' | 'mini' | 'normal';

interface InputData {
  workspace?: { current_dir?: string };
  cwd?: string;
  model?: { display_name?: string };
  version?: string;
  cost?: { total_duration_ms?: number };
  context_window?: {
    current_usage?: {
      cache_read_input_tokens?: number;
      input_tokens?: number;
      cache_creation_input_tokens?: number;
      output_tokens?: number;
    };
    context_window_size?: number;
  };
}

interface Settings {
  daidentity?: {
    name?: string;
    displayName?: string;
  };
  pai?: { version?: string };
  env?: { DA?: string };
}

interface LocationData {
  city?: string;
  regionName?: string;
  lat?: number;
  lon?: number;
}

interface RatingEntry {
  timestamp: string;
  rating: number;
  source?: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

function getFileMtime(filePath: string): number {
  try {
    return Math.floor(statSync(filePath).mtimeMs / 1000);
  } catch {
    return 0;
  }
}

function countFiles(dir: string, pattern?: RegExp, recursive: boolean = true): number {
  try {
    if (!existsSync(dir)) return 0;
    let count = 0;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (recursive) {
          count += countFiles(fullPath, pattern, recursive);
        }
      } else if (!pattern || pattern.test(entry.name)) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

function countWorkflows(skillsDir: string): number {
  // Count .md files in */workflows/ or */Workflows/ subdirectories
  // (matching bash: ls "$PAI_DIR/skills"/*/workflows/*.md)
  // Note: Check both 'Workflows' and 'workflows' for case-sensitive filesystems (Linux)
  try {
    if (!existsSync(skillsDir)) return 0;
    let count = 0;
    const skills = readdirSync(skillsDir, { withFileTypes: true });
    for (const skill of skills) {
      if (skill.isDirectory()) {
        const skillDir = join(skillsDir, skill.name);

        // Try both common casing conventions for case-sensitive filesystems
        // This avoids performance penalty of readdir + lowercase comparison
        const workflowsDirCandidates = [
          join(skillDir, 'Workflows'),  // Pascal case (project convention)
          join(skillDir, 'workflows'),  // lowercase
        ];

        for (const workflowsDir of workflowsDirCandidates) {
          if (existsSync(workflowsDir)) {
            try {
              const files = readdirSync(workflowsDir, { withFileTypes: true });
              for (const file of files) {
                if (!file.isDirectory() && file.name.endsWith('.md')) {
                  count++;
                }
              }
              break; // Only count one workflows directory per skill
            } catch {
              // Continue to next candidate
            }
          }
        }
      }
    }
    return count;
  } catch {
    return 0;
  }
}

function countDirectories(dir: string, depth: number = 1): number {
  try {
    if (!existsSync(dir) || depth < 1) return 0;
    let count = 0;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (depth === 1) {
          count++;
        } else {
          count += countDirectories(join(dir, entry.name), depth - 1);
        }
      }
    }
    return count;
  } catch {
    return 0;
  }
}

function countLinesInFile(filePath: string): number {
  try {
    if (!existsSync(filePath)) return 0;
    const content = readFileSync(filePath, 'utf-8');
    return content.split(/\r?\n/).filter((line) => line.trim()).length;
  } catch {
    return 0;
  }
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  try {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch {
    // Silently fail for cache writes
  }
}

function ensureDir(dir: string): void {
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Silently fail
  }
}

// =============================================================================
// Terminal Width Detection
// =============================================================================

function detectTerminalWidth(): number {
  // Try Kitty IPC first (most accurate for Kitty panes)
  const kittyWindowId = getEnvVar('KITTY_WINDOW_ID');
  if (kittyWindowId && !isWindows()) {
    try {
      const result = spawnSync('kitten', ['@', 'ls'], {
        encoding: 'utf-8',
        timeout: 1000,
      });
      if (result.stdout) {
        const data = JSON.parse(result.stdout);
        for (const os of data) {
          for (const tab of os.tabs || []) {
            for (const win of tab.windows || []) {
              if (win.id === parseInt(kittyWindowId)) {
                return win.columns || 80;
              }
            }
          }
        }
      }
    } catch {
      // Fall through to other methods
    }
  }

  // Try tput (Unix systems)
  if (!isWindows()) {
    try {
      const result = spawnSync('tput', ['cols'], {
        encoding: 'utf-8',
        timeout: 1000,
      });
      const cols = parseInt(result.stdout?.trim() || '');
      if (!isNaN(cols) && cols > 0) return cols;
    } catch {
      // Fall through
    }
  }

  // Try Windows mode command
  if (isWindows()) {
    try {
      // Use cmd.exe explicitly to run 'mode con' since it's a cmd built-in
      const result = spawnSync('cmd', ['/c', 'mode', 'con'], getSpawnOpts(1000));
      // Multi-locale support for "Columns" in various languages:
      // English: Columns, German: Spalten, Spanish: Columnas, French: Colonnes,
      // Italian: Colonne, Dutch: Kolommen, Portuguese: Colunas, Polish: Kolumny,
      // Swedish: Kolumner, Norwegian: Kolonner, Czech: Sloupce, Danish: Kolonner
      const match = result.stdout?.match(/(?:Columns|Spalten|Columnas|Colonnes|Colonne|Kolommen|Colunas|Kolumny|Kolumner|Kolonner|Sloupce):\s*(\d+)/i);
      if (match) {
        const cols = parseInt(match[1]);
        if (!isNaN(cols) && cols > 0) return cols;
      }
    } catch {
      // Fall through
    }

    // ConEmu/Cmder terminal detection (popular Windows terminal emulators)
    // These set environment variables with terminal dimensions
    const conemuCols = getEnvVar('ConEmuColumns') || getEnvVar('TERM_WIDTH');
    if (conemuCols) {
      const cols = parseInt(conemuCols);
      if (!isNaN(cols) && cols > 0) return cols;
    }
  }

  // Environment variable fallback
  const cols = parseInt(getEnvVar('COLUMNS') || '');
  if (!isNaN(cols) && cols > 0) return cols;

  // stdout columns (if available)
  if (process.stdout.columns && process.stdout.columns > 0) {
    return process.stdout.columns;
  }

  return 80; // Default fallback
}

function getDisplayMode(width: number): DisplayMode {
  if (width < 35) return 'nano';
  if (width < 55) return 'micro';
  if (width < 80) return 'mini';
  return 'normal';
}

// =============================================================================
// Rating Color Helpers
// =============================================================================

function getRatingColor(val: string | number | undefined): string {
  if (val === undefined || val === null || val === '—' || val === '') {
    return SLATE_400;
  }
  const rating = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(rating)) return SLATE_400;

  if (rating >= 9) return RATING_10;
  if (rating >= 8) return RATING_8;
  if (rating >= 7) return RATING_7;
  if (rating >= 6) return RATING_6;
  if (rating >= 5) return RATING_5;
  if (rating >= 4) return RATING_4;
  return RATING_LOW;
}

function getBucketColor(pos: number, max: number): string {
  const pct = Math.floor((pos * 100) / max);
  let r: number, g: number, b: number;

  if (pct <= 33) {
    r = Math.floor(74 + ((250 - 74) * pct) / 33);
    g = Math.floor(222 + ((204 - 222) * pct) / 33);
    b = Math.floor(128 + ((21 - 128) * pct) / 33);
  } else if (pct <= 66) {
    const t = pct - 33;
    r = Math.floor(250 + ((251 - 250) * t) / 33);
    g = Math.floor(204 + ((146 - 204) * t) / 33);
    b = Math.floor(21 + ((60 - 21) * t) / 33);
  } else {
    const t = pct - 66;
    r = Math.floor(251 + ((239 - 251) * t) / 34);
    g = Math.floor(146 + ((68 - 146) * t) / 34);
    b = Math.floor(60 + ((68 - 60) * t) / 34);
  }

  return `\x1b[38;2;${r};${g};${b}m`;
}

let LAST_BUCKET_COLOR = EMERALD;

function renderContextBar(width: number, pct: number): string {
  pct = Math.min(100, Math.max(0, pct));
  const filled = Math.floor((pct * width) / 100);
  let output = '';

  for (let i = 1; i <= width; i++) {
    if (i <= filled) {
      const color = getBucketColor(i, width);
      LAST_BUCKET_COLOR = color;
      output += `${color}\u26C1${RESET}`;
    } else {
      output += `${CTX_BUCKET_EMPTY}\u26C1${RESET}`;
    }
    if (width > 8) output += ' ';
  }

  return output.trimEnd();
}

// =============================================================================
// Git Status
// =============================================================================

interface GitStatus {
  branch: string;
  modified: number;
  staged: number;
  untracked: number;
  stashCount: number;
  ahead: number;
  behind: number;
  ageDisplay: string;
  ageColor: string;
  isRepo: boolean;
}

function getGitStatus(cwd: string): GitStatus {
  const status: GitStatus = {
    branch: 'main',
    modified: 0,
    staged: 0,
    untracked: 0,
    stashCount: 0,
    ahead: 0,
    behind: 0,
    ageDisplay: '',
    ageColor: GIT_AGE_FRESH,
    isRepo: false,
  };

  try {
    // Check if git repo
    const gitCheck = spawnSync('git', ['rev-parse', '--git-dir'], {
      ...getSpawnOpts(),
      cwd,
    });
    if (gitCheck.status !== 0) return status;
    status.isRepo = true;

    // Branch
    const branchResult = spawnSync('git', ['branch', '--show-current'], {
      ...getSpawnOpts(),
      cwd,
    });
    status.branch = branchResult.stdout?.trim() || 'detached';

    // Modified files
    const diffResult = spawnSync('git', ['diff', '--name-only'], {
      ...getSpawnOpts(),
      cwd,
    });
    status.modified = splitLines(diffResult.stdout?.trim() || '').filter(Boolean).length;

    // Staged files
    const stagedResult = spawnSync('git', ['diff', '--cached', '--name-only'], {
      ...getSpawnOpts(),
      cwd,
    });
    status.staged = splitLines(stagedResult.stdout?.trim() || '').filter(Boolean).length;

    // Untracked files
    const untrackedResult = spawnSync('git', ['ls-files', '--others', '--exclude-standard'], {
      ...getSpawnOpts(),
      cwd,
    });
    status.untracked = splitLines(untrackedResult.stdout?.trim() || '').filter(Boolean).length;

    // Stash count
    const stashResult = spawnSync('git', ['stash', 'list'], {
      ...getSpawnOpts(),
      cwd,
    });
    status.stashCount = splitLines(stashResult.stdout?.trim() || '').filter(Boolean).length;

    // Ahead/behind
    const aheadBehindResult = spawnSync('git', ['rev-list', '--left-right', '--count', 'HEAD...@{u}'], {
      ...getSpawnOpts(),
      cwd,
    });
    if (aheadBehindResult.stdout) {
      const parts = aheadBehindResult.stdout.trim().split(/\s+/);
      status.ahead = parseInt(parts[0]) || 0;
      status.behind = parseInt(parts[1]) || 0;
    }

    // Commit age
    const logResult = spawnSync('git', ['log', '-1', '--format=%ct'], {
      ...getSpawnOpts(),
      cwd,
    });
    if (logResult.stdout) {
      const lastCommitEpoch = parseInt(logResult.stdout.trim());
      if (!isNaN(lastCommitEpoch)) {
        const now = Math.floor(Date.now() / 1000);
        const ageSeconds = now - lastCommitEpoch;
        const ageMinutes = Math.floor(ageSeconds / 60);
        const ageHours = Math.floor(ageSeconds / 3600);
        const ageDays = Math.floor(ageSeconds / 86400);

        if (ageMinutes < 1) {
          status.ageDisplay = 'now';
          status.ageColor = GIT_AGE_FRESH;
        } else if (ageHours < 1) {
          status.ageDisplay = `${ageMinutes}m`;
          status.ageColor = GIT_AGE_FRESH;
        } else if (ageHours < 24) {
          status.ageDisplay = `${ageHours}h`;
          status.ageColor = GIT_AGE_RECENT;
        } else if (ageDays < 7) {
          status.ageDisplay = `${ageDays}d`;
          status.ageColor = GIT_AGE_STALE;
        } else {
          status.ageDisplay = `${ageDays}d`;
          status.ageColor = GIT_AGE_OLD;
        }
      }
    }
  } catch {
    // Return default status
  }

  return status;
}

// =============================================================================
// Location & Weather
// =============================================================================

async function fetchLocation(): Promise<{ city: string; state: string }> {
  const now = Math.floor(Date.now() / 1000);
  const cacheAge = now - getFileMtime(LOCATION_CACHE);

  if (cacheAge <= LOCATION_CACHE_TTL) {
    const cached = readJsonFile<LocationData>(LOCATION_CACHE);
    if (cached) {
      return { city: cached.city || 'Unknown', state: cached.regionName || '' };
    }
  }

  try {
    const response = await fetch('http://ip-api.com/json/?fields=city,regionName,country,lat,lon', {
      signal: AbortSignal.timeout(2000),
    });
    const data = (await response.json()) as LocationData;
    if (data.city) {
      writeJsonFile(LOCATION_CACHE, data);
      return { city: data.city, state: data.regionName || '' };
    }
  } catch {
    // Fall through to cache or default
  }

  const cached = readJsonFile<LocationData>(LOCATION_CACHE);
  if (cached) {
    return { city: cached.city || 'Unknown', state: cached.regionName || '' };
  }

  return { city: 'Unknown', state: '' };
}

async function fetchWeather(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const cacheAge = now - getFileMtime(WEATHER_CACHE);

  if (cacheAge <= WEATHER_CACHE_TTL && existsSync(WEATHER_CACHE)) {
    try {
      return readFileSync(WEATHER_CACHE, 'utf-8').trim() || '—';
    } catch {
      // Fall through
    }
  }

  try {
    // Get lat/lon from location cache
    let lat = 37.7749;
    let lon = -122.4194;
    const locData = readJsonFile<LocationData>(LOCATION_CACHE);
    if (locData?.lat && locData?.lon) {
      lat = locData.lat;
      lon = locData.lon;
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius`,
      { signal: AbortSignal.timeout(3000) }
    );
    const data = await response.json();

    if (data?.current) {
      const temp = data.current.temperature_2m;
      const code = data.current.weather_code;

      let condition = 'Clear';
      switch (code) {
        case 0:
          condition = 'Clear';
          break;
        case 1:
        case 2:
        case 3:
          condition = 'Cloudy';
          break;
        case 45:
        case 48:
          condition = 'Foggy';
          break;
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
          condition = 'Drizzle';
          break;
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
          condition = 'Rain';
          break;
        case 71:
        case 73:
        case 75:
        case 77:
          condition = 'Snow';
          break;
        case 80:
        case 81:
        case 82:
          condition = 'Showers';
          break;
        case 85:
        case 86:
          condition = 'Snow';
          break;
        case 95:
        case 96:
        case 99:
          condition = 'Storm';
          break;
      }

      const weatherStr = `${temp}\u00B0C ${condition}`;
      writeFileSync(WEATHER_CACHE, weatherStr);
      return weatherStr;
    }
  } catch {
    // Fall through
  }

  if (existsSync(WEATHER_CACHE)) {
    try {
      return readFileSync(WEATHER_CACHE, 'utf-8').trim() || '—';
    } catch {
      // Fall through
    }
  }

  return '—';
}

// =============================================================================
// Ratings & Learning
// =============================================================================

interface RatingStats {
  latest: string;
  latestSource: string;
  q15Avg: string;
  hourAvg: string;
  todayAvg: string;
  weekAvg: string;
  monthAvg: string;
  allAvg: string;
  q15Sparkline: string;
  hourSparkline: string;
  daySparkline: string;
  weekSparkline: string;
  monthSparkline: string;
  trend: 'up' | 'down' | 'stable';
  totalCount: number;
}

function parseIsoToEpoch(ts: string): number {
  try {
    return Math.floor(new Date(ts).getTime() / 1000);
  } catch {
    return 0;
  }
}

function toBar(rating: number): string {
  // Use ASCII characters when NO_COLOR is set
  const bar = NO_COLOR ? '#' : (rating >= 10 ? '\u2585' : rating >= 8 ? '\u2584' : rating >= 5 ? '\u2583' : rating >= 3 ? '\u2582' : '\u2581');
  if (NO_COLOR) return bar;
  if (rating >= 10) return '\x1b[38;2;34;197;94m\u2585\x1b[0m';
  if (rating >= 9) return '\x1b[38;2;74;222;128m\u2585\x1b[0m';
  if (rating >= 8) return '\x1b[38;2;134;239;172m\u2584\x1b[0m';
  if (rating >= 7) return '\x1b[38;2;59;130;246m\u2583\x1b[0m';
  if (rating >= 6) return '\x1b[38;2;96;165;250m\u2582\x1b[0m';
  if (rating >= 5) return '\x1b[38;2;253;224;71m\u2581\x1b[0m';
  if (rating >= 4) return '\x1b[38;2;253;186;116m\u2582\x1b[0m';
  if (rating >= 3) return '\x1b[38;2;251;146;60m\u2583\x1b[0m';
  if (rating >= 2) return '\x1b[38;2;248;113;113m\u2584\x1b[0m';
  return '\x1b[38;2;239;68;68m\u2585\x1b[0m';
}

function makeSparkline(
  entries: Array<{ epoch: number; rating: number }>,
  periodStart: number,
  now: number
): string {
  const dur = now - periodStart;
  const slotSize = dur / 58;
  const bars: string[] = [];

  for (let i = 0; i < 58; i++) {
    const slotStart = periodStart + i * slotSize;
    const slotEnd = slotStart + slotSize;
    const slotRatings = entries.filter((e) => e.epoch >= slotStart && e.epoch < slotEnd).map((e) => e.rating);

    if (slotRatings.length === 0) {
      bars.push(NO_COLOR ? '.' : '\x1b[38;2;45;50;60m \x1b[0m');
    } else {
      const avg = slotRatings.reduce((a, b) => a + b, 0) / slotRatings.length;
      bars.push(toBar(avg));
    }
  }

  return bars.join('');
}

function calculateRatingStats(): RatingStats | null {
  if (!existsSync(RATINGS_FILE)) return null;

  try {
    const content = readFileSync(RATINGS_FILE, 'utf-8');
    // Handle both Unix (LF) and Windows (CRLF) line endings
    const lines = splitLines(content).filter((l) => l.trim());
    if (lines.length === 0) return null;

    const entries: Array<{ epoch: number; rating: number; source: string }> = [];
    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as RatingEntry;
        if (entry.rating !== undefined && entry.timestamp) {
          entries.push({
            epoch: parseIsoToEpoch(entry.timestamp),
            rating: entry.rating,
            source: entry.source || 'explicit',
          });
        }
      } catch {
        continue;
      }
    }

    if (entries.length === 0) return null;

    const now = Math.floor(Date.now() / 1000);
    const q15Start = now - 900;
    const hourStart = now - 3600;
    const todayStart = now - 86400;
    const weekStart = now - 604800;
    const monthStart = now - 2592000;

    const calcAvg = (filtered: typeof entries): string => {
      if (filtered.length === 0) return '—';
      const avg = filtered.reduce((a, e) => a + e.rating, 0) / filtered.length;
      return (Math.floor(avg * 10) / 10).toString();
    };

    const q15 = entries.filter((e) => e.epoch >= q15Start);
    const hour = entries.filter((e) => e.epoch >= hourStart);
    const today = entries.filter((e) => e.epoch >= todayStart);
    const week = entries.filter((e) => e.epoch >= weekStart);
    const month = entries.filter((e) => e.epoch >= monthStart);

    const calcTrend = (data: typeof entries): 'up' | 'down' | 'stable' => {
      if (data.length < 2) return 'stable';
      const half = Math.floor(data.length / 2);
      const recent = data.slice(-half);
      const older = data.slice(0, half);
      const recentAvg = recent.reduce((a, e) => a + e.rating, 0) / recent.length;
      const olderAvg = older.reduce((a, e) => a + e.rating, 0) / older.length;
      const diff = recentAvg - olderAvg;
      if (diff > 0.5) return 'up';
      if (diff < -0.5) return 'down';
      return 'stable';
    };

    const lastEntry = entries[entries.length - 1];

    return {
      latest: lastEntry.rating.toString(),
      latestSource: lastEntry.source,
      q15Avg: calcAvg(q15),
      hourAvg: calcAvg(hour),
      todayAvg: calcAvg(today),
      weekAvg: calcAvg(week),
      monthAvg: calcAvg(month),
      allAvg: calcAvg(entries),
      q15Sparkline: makeSparkline(entries, q15Start, now),
      hourSparkline: makeSparkline(entries, hourStart, now),
      daySparkline: makeSparkline(entries, todayStart, now),
      weekSparkline: makeSparkline(entries, weekStart, now),
      monthSparkline: makeSparkline(entries, monthStart, now),
      trend: calcTrend(entries),
      totalCount: entries.length,
    };
  } catch {
    return null;
  }
}

// =============================================================================
// Quote
// =============================================================================

async function getQuote(): Promise<{ text: string; author: string } | null> {
  const now = Math.floor(Date.now() / 1000);
  const cacheAge = now - getFileMtime(QUOTE_CACHE);

  // Try cache first if fresh enough
  if (cacheAge <= 30 && existsSync(QUOTE_CACHE)) {
    try {
      const cached = readFileSync(QUOTE_CACHE, 'utf-8').trim();
      const [text, author] = cached.split('|');
      if (text && author) return { text, author };
    } catch {
      // Fall through
    }
  }

  // Fetch new quote if API key available
  const apiKey = getEnvVar('ZENQUOTES_API_KEY');
  if (apiKey) {
    try {
      const response = await fetch(`https://zenquotes.io/api/random/${apiKey}`, {
        signal: AbortSignal.timeout(1000),
      });
      const data = await response.json();
      if (data?.[0]?.q && data[0].q.length < 80) {
        const quote = { text: data[0].q, author: data[0].a };
        writeFileSync(QUOTE_CACHE, `${quote.text}|${quote.author}`);
        return quote;
      }
    } catch {
      // Fall through to cache
    }
  }

  // Return cached quote if available
  if (existsSync(QUOTE_CACHE)) {
    try {
      const cached = readFileSync(QUOTE_CACHE, 'utf-8').trim();
      const [text, author] = cached.split('|');
      if (text && author) return { text, author };
    } catch {
      // Fall through
    }
  }

  return null;
}

// =============================================================================
// Output Rendering
// =============================================================================

function renderPaiBranding(
  mode: DisplayMode,
  ccVersion: string,
  paiVersion: string,
  skillsCount: number,
  workflowsCount: number,
  hooksCount: number,
  currentTime: string,
  location: { city: string; state: string },
  weather: string
): void {
  const separator = `${SLATE_600}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`;

  switch (mode) {
    case 'nano':
      console.log(`${SLATE_600}\u2500\u2500 \u2502${RESET} ${PAI_P}P${PAI_A}A${PAI_I}I${RESET} ${SLATE_600}\u2502 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`);
      console.log(`${PAI_TIME}${currentTime}${RESET} ${PAI_WEATHER}${weather}${RESET}`);
      console.log(`${SLATE_400}ENV:${RESET} ${SLATE_500}v${PAI_A}${paiVersion}${RESET} ${SLATE_400}S:${SLATE_300}${skillsCount}${RESET}`);
      break;
    case 'micro':
      console.log(`${SLATE_600}\u2500\u2500 \u2502${RESET} ${PAI_P}P${PAI_A}A${PAI_I}I${RESET} ${PAI_A}STATUSLINE${RESET} ${SLATE_600}\u2502 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`);
      console.log(`${PAI_LABEL}LOC:${RESET} ${PAI_CITY}${location.city}${RESET} ${SLATE_600}\u2502${RESET} ${PAI_TIME}${currentTime}${RESET} ${SLATE_600}\u2502${RESET} ${PAI_WEATHER}${weather}${RESET}`);
      console.log(`${SLATE_400}ENV:${RESET} ${SLATE_400}CC:${RESET} ${PAI_A}${ccVersion}${RESET} ${SLATE_600}\u2502${RESET} ${SLATE_500}PAI:${RESET} ${PAI_A}v${paiVersion}${RESET} ${SLATE_600}\u2502${RESET} ${SLATE_400}S:${SLATE_300}${skillsCount}${RESET} ${SLATE_400}W:${SLATE_300}${workflowsCount}${RESET} ${SLATE_400}H:${SLATE_300}${hooksCount}${RESET}`);
      break;
    case 'mini':
      console.log(`${SLATE_600}\u2500\u2500 \u2502${RESET} ${PAI_P}P${PAI_A}A${PAI_I}I${RESET} ${PAI_A}STATUSLINE${RESET} ${SLATE_600}\u2502 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`);
      console.log(`${PAI_LABEL}LOC:${RESET} ${PAI_CITY}${location.city}${RESET}${SLATE_600},${RESET} ${PAI_STATE}${location.state}${RESET} ${SLATE_600}\u2502${RESET} ${PAI_TIME}${currentTime}${RESET} ${SLATE_600}\u2502${RESET} ${PAI_WEATHER}${weather}${RESET}`);
      console.log(`${SLATE_400}ENV:${RESET} ${SLATE_400}CC:${RESET} ${PAI_A}${ccVersion}${RESET} ${SLATE_600}\u2502${RESET} ${SLATE_500}PAI:${RESET} ${PAI_A}v${paiVersion}${RESET} ${SLATE_600}\u2502${RESET} ${WIELD_ACCENT}Skills:${RESET}${SLATE_300}${skillsCount}${RESET} ${WIELD_WORKFLOWS}Workflows:${RESET}${SLATE_300}${workflowsCount}${RESET} ${WIELD_HOOKS}Hooks:${RESET}${SLATE_300}${hooksCount}${RESET}`);
      break;
    case 'normal':
      console.log(`${SLATE_600}\u2500\u2500 \u2502${RESET} ${PAI_P}P${PAI_A}A${PAI_I}I${RESET} ${PAI_A}STATUSLINE${RESET} ${SLATE_600}\u2502 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`);
      console.log(`${PAI_LABEL}LOC:${RESET} ${PAI_CITY}${location.city}${RESET}${SLATE_600},${RESET} ${PAI_STATE}${location.state}${RESET} ${SLATE_600}\u2502${RESET} ${PAI_TIME}${currentTime}${RESET} ${SLATE_600}\u2502${RESET} ${PAI_WEATHER}${weather}${RESET}`);
      console.log(`${SLATE_400}ENV:${RESET} ${SLATE_400}CC:${RESET} ${PAI_A}${ccVersion}${RESET} ${SLATE_600}\u2502${RESET} ${SLATE_500}PAI:${RESET} ${PAI_A}v${paiVersion}${RESET} ${SLATE_600}\u2502${RESET} ${WIELD_ACCENT}Skills:${RESET} ${SLATE_300}${skillsCount}${RESET} ${SLATE_600}\u2502${RESET} ${WIELD_WORKFLOWS}Workflows:${RESET} ${SLATE_300}${workflowsCount}${RESET} ${SLATE_600}\u2502${RESET} ${WIELD_HOOKS}Hooks:${RESET} ${SLATE_300}${hooksCount}${RESET}`);
      break;
  }
  console.log(separator);
}

function renderContext(
  mode: DisplayMode,
  contextPct: number,
  contextK: number,
  maxK: number,
  timeDisplay: string,
  modelName: string
): void {
  const pctColor = contextPct <= 33 ? EMERALD : contextPct <= 66 ? '\x1b[38;2;251;191;36m' : ROSE;
  const separator = `${SLATE_600}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`;

  // Format model name for display (shorten common prefixes)
  const shortModel = modelName
    .replace('claude-opus-4-5', 'opus-4.5')
    .replace('claude-sonnet-4', 'sonnet-4')
    .replace('claude-3-5-sonnet', 'sonnet-3.5')
    .replace('claude-3-5-haiku', 'haiku-3.5')
    .replace('claude-', '');

  switch (mode) {
    case 'nano': {
      const bar = renderContextBar(5, contextPct);
      console.log(`${CTX_PRIMARY}\u25C9${RESET} ${CTX_ACCENT}${shortModel}${RESET} ${bar} ${pctColor}${contextPct}%${RESET} ${CTX_ACCENT}\u23F1${RESET} ${SLATE_300}${timeDisplay}${RESET}`);
      break;
    }
    case 'micro': {
      const bar = renderContextBar(6, contextPct);
      console.log(`${CTX_PRIMARY}\u25C9${RESET} ${CTX_ACCENT}${shortModel}${RESET} ${SLATE_600}\u2502${RESET} ${bar} ${pctColor}${contextPct}%${RESET} ${SLATE_500}(${contextK}k)${RESET} ${CTX_ACCENT}\u23F1${RESET} ${SLATE_300}${timeDisplay}${RESET}`);
      break;
    }
    case 'mini': {
      const bar = renderContextBar(8, contextPct);
      console.log(`${CTX_PRIMARY}\u25C9${RESET} ${CTX_ACCENT}${shortModel}${RESET} ${SLATE_600}\u2502${RESET} ${CTX_SECONDARY}CTX:${RESET} ${bar} ${pctColor}${contextPct}%${RESET} ${SLATE_500}(${contextK}k/${maxK}k)${RESET} ${CTX_ACCENT}\u23F1${RESET} ${SLATE_300}${timeDisplay}${RESET}`);
      break;
    }
    case 'normal': {
      const bar = renderContextBar(16, contextPct);
      console.log(`${CTX_PRIMARY}\u25C9${RESET} ${CTX_SECONDARY}Model:${RESET} ${CTX_ACCENT}${shortModel}${RESET} ${SLATE_600}\u2502${RESET} ${CTX_SECONDARY}Context:${RESET} ${bar} ${LAST_BUCKET_COLOR}${contextPct}%${RESET} ${SLATE_500}(${contextK}k/${maxK}k)${RESET} ${SLATE_600}\u2502${RESET} ${CTX_ACCENT}\u23F1${RESET} ${SLATE_300}${timeDisplay}${RESET}`);
      break;
    }
  }
  console.log(separator);
}

function renderGit(mode: DisplayMode, git: GitStatus, dirName: string): void {
  if (!git.isRepo) return;

  const totalChanged = git.modified + git.staged;
  const gitStatusIcon = totalChanged > 0 || git.untracked > 0 ? '*' : '\u2713';
  const separator = `${SLATE_600}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`;

  switch (mode) {
    case 'nano': {
      let line = `${GIT_PRIMARY}\u25C8${RESET} ${GIT_DIR}${dirName}${RESET} ${GIT_VALUE}${git.branch}${RESET} `;
      line += gitStatusIcon === '\u2713' ? `${GIT_CLEAN}\u2713${RESET}` : `${GIT_MODIFIED}*${totalChanged}${RESET}`;
      console.log(line);
      break;
    }
    case 'micro': {
      let line = `${GIT_PRIMARY}\u25C8${RESET} ${GIT_DIR}${dirName}${RESET} ${GIT_VALUE}${git.branch}${RESET}`;
      if (git.ageDisplay) line += ` ${git.ageColor}${git.ageDisplay}${RESET}`;
      line += ' ';
      line += gitStatusIcon === '\u2713' ? `${GIT_CLEAN}${gitStatusIcon}${RESET}` : `${GIT_MODIFIED}${gitStatusIcon}${totalChanged}${RESET}`;
      console.log(line);
      break;
    }
    case 'mini': {
      let line = `${GIT_PRIMARY}\u25C8${RESET} ${GIT_DIR}${dirName}${RESET} ${SLATE_600}\u2502${RESET} ${GIT_VALUE}${git.branch}${RESET}`;
      if (git.ageDisplay) line += ` ${SLATE_600}\u2502${RESET} ${git.ageColor}${git.ageDisplay}${RESET}`;
      line += ` ${SLATE_600}\u2502${RESET} `;
      if (gitStatusIcon === '\u2713') {
        line += `${GIT_CLEAN}${gitStatusIcon}${RESET}`;
      } else {
        line += `${GIT_MODIFIED}${gitStatusIcon}${totalChanged}${RESET}`;
        if (git.untracked > 0) line += ` ${GIT_ADDED}+${git.untracked}${RESET}`;
      }
      console.log(line);
      break;
    }
    case 'normal': {
      let line = `${GIT_PRIMARY}\u25C8${RESET} ${GIT_PRIMARY}PWD:${RESET} ${GIT_DIR}${dirName}${RESET} ${SLATE_600}\u2502${RESET} `;
      line += `${GIT_PRIMARY}Branch:${RESET} ${GIT_VALUE}${git.branch}${RESET}`;
      if (git.ageDisplay) line += ` ${SLATE_600}\u2502${RESET} ${GIT_PRIMARY}Age:${RESET} ${git.ageColor}${git.ageDisplay}${RESET}`;
      if (git.stashCount > 0) line += ` ${SLATE_600}\u2502${RESET} ${GIT_PRIMARY}Stash:${RESET} ${GIT_STASH}${git.stashCount}${RESET}`;

      if (totalChanged > 0 || git.untracked > 0) {
        line += ` ${SLATE_600}\u2502${RESET} `;
        if (totalChanged > 0) line += `${GIT_PRIMARY}Mod:${RESET} ${GIT_MODIFIED}${totalChanged}${RESET}`;
        if (git.untracked > 0) {
          if (totalChanged > 0) line += ' ';
          line += `${GIT_PRIMARY}New:${RESET} ${GIT_ADDED}${git.untracked}${RESET}`;
        }
      } else {
        line += ` ${SLATE_600}\u2502${RESET} ${GIT_CLEAN}\u2713 clean${RESET}`;
      }

      if (git.ahead > 0 || git.behind > 0) {
        line += ` ${SLATE_600}\u2502${RESET} ${GIT_PRIMARY}Sync:${RESET} `;
        if (git.ahead > 0) line += `${GIT_CLEAN}\u2191${git.ahead}${RESET}`;
        if (git.behind > 0) line += `${GIT_STASH}\u2193${git.behind}${RESET}`;
      }
      console.log(line);
      break;
    }
  }
  // Separator moved to main() for conditional control
}

function renderMemory(
  mode: DisplayMode,
  workCount: number,
  ratingsCount: number,
  sessionsCount: number,
  researchCount: number
): void {
  switch (mode) {
    case 'nano':
    case 'micro':
      console.log(`${LEARN_PRIMARY}\u25CE${RESET} ${LEARN_WORK}\uD83D\uDCC1${RESET} ${SLATE_300}${workCount}${RESET} ${LEARN_SIGNALS}\u2726${RESET} ${SLATE_300}${ratingsCount}${RESET} ${LEARN_SESSIONS}\u2295${RESET} ${SLATE_300}${sessionsCount}${RESET} ${LEARN_RESEARCH}\u25C7${RESET} ${SLATE_300}${researchCount}${RESET}`);
      break;
    case 'mini':
      console.log(`${LEARN_PRIMARY}\u25CE${RESET} ${LEARN_SECONDARY}MEMORY:${RESET} ${LEARN_WORK}\uD83D\uDCC1${RESET} ${SLATE_300}${workCount}${RESET} ${SLATE_600}\u2502${RESET} ${LEARN_SIGNALS}\u2726${RESET} ${SLATE_300}${ratingsCount}${RESET} ${SLATE_600}\u2502${RESET} ${LEARN_SESSIONS}\u2295${RESET} ${SLATE_300}${sessionsCount}${RESET} ${SLATE_600}\u2502${RESET} ${LEARN_RESEARCH}\u25C7${RESET} ${SLATE_300}${researchCount}${RESET}`);
      break;
    case 'normal':
      console.log(`${LEARN_PRIMARY}\u25CE${RESET} ${LEARN_SECONDARY}MEMORY:${RESET} ${LEARN_WORK}\uD83D\uDCC1${RESET} ${SLATE_300}${workCount}${RESET} ${LEARN_WORK}Work${RESET} ${SLATE_600}\u2502${RESET} ${LEARN_SIGNALS}\u2726${RESET} ${SLATE_300}${ratingsCount}${RESET} ${LEARN_SIGNALS}Ratings${RESET} ${SLATE_600}\u2502${RESET} ${LEARN_SESSIONS}\u2295${RESET} ${SLATE_300}${sessionsCount}${RESET} ${LEARN_SESSIONS}Sessions${RESET} ${SLATE_600}\u2502${RESET} ${LEARN_RESEARCH}\u25C7${RESET} ${SLATE_300}${researchCount}${RESET} ${LEARN_RESEARCH}Research${RESET}`);
      break;
  }
}

function renderLearning(mode: DisplayMode, stats: RatingStats | null): void {
  if (!stats || stats.totalCount === 0) {
    console.log(`${LEARN_LABEL}\u273F${RESET} ${LEARN_LABEL}LEARNING:${RESET}`);
    console.log(`  ${SLATE_500}No ratings yet${RESET}`);
    return;
  }

  const srcLabel = stats.latestSource === 'explicit' ? 'EXP' : 'IMP';
  const latestColor = getRatingColor(stats.latest);
  const q15Color = getRatingColor(stats.q15Avg);
  const hourColor = getRatingColor(stats.hourAvg);
  const todayColor = getRatingColor(stats.todayAvg);
  const weekColor = getRatingColor(stats.weekAvg);
  const monthColor = getRatingColor(stats.monthAvg);

  switch (mode) {
    case 'nano':
      console.log(`${LEARN_LABEL}\u273F${RESET} ${latestColor}${stats.latest}${RESET} ${SIGNAL_PERIOD}1d:${RESET} ${todayColor}${stats.todayAvg}${RESET}`);
      break;
    case 'micro':
      console.log(`${LEARN_LABEL}\u273F${RESET} ${latestColor}${stats.latest}${RESET} ${SIGNAL_PERIOD}1h:${RESET} ${hourColor}${stats.hourAvg}${RESET} ${SIGNAL_PERIOD}1d:${RESET} ${todayColor}${stats.todayAvg}${RESET} ${SIGNAL_PERIOD}1w:${RESET} ${weekColor}${stats.weekAvg}${RESET}`);
      break;
    case 'mini':
      console.log(`${LEARN_LABEL}\u273F${RESET} ${LEARN_LABEL}LEARNING:${RESET} ${SLATE_600}\u2502${RESET} ${latestColor}${stats.latest}${RESET} ${SIGNAL_PERIOD}1h:${RESET} ${hourColor}${stats.hourAvg}${RESET} ${SIGNAL_PERIOD}1d:${RESET} ${todayColor}${stats.todayAvg}${RESET} ${SIGNAL_PERIOD}1w:${RESET} ${weekColor}${stats.weekAvg}${RESET}`);
      break;
    case 'normal':
      console.log(`${LEARN_LABEL}\u273F${RESET} ${LEARN_LABEL}LEARNING:${RESET} ${SLATE_600}\u2502${RESET} ${latestColor}${stats.latest}${RESET}${SLATE_500}${srcLabel}${RESET} ${SLATE_600}\u2502${RESET} ${SIGNAL_PERIOD}15m:${RESET} ${q15Color}${stats.q15Avg}${RESET} ${SIGNAL_PERIOD}60m:${RESET} ${hourColor}${stats.hourAvg}${RESET} ${SIGNAL_PERIOD}1d:${RESET} ${todayColor}${stats.todayAvg}${RESET} ${SIGNAL_PERIOD}1w:${RESET} ${weekColor}${stats.weekAvg}${RESET} ${SIGNAL_PERIOD}1mo:${RESET} ${monthColor}${stats.monthAvg}${RESET}`);
      // Sparklines
      console.log(`   ${SLATE_600}\u251C\u2500${RESET} ${SIGNAL_PERIOD}15m:${RESET}  ${stats.q15Sparkline}`);
      console.log(`   ${SLATE_600}\u251C\u2500${RESET} ${SIGNAL_PERIOD}60m:${RESET}  ${stats.hourSparkline}`);
      console.log(`   ${SLATE_600}\u251C\u2500${RESET} ${SIGNAL_PERIOD}1d:${RESET}   ${stats.daySparkline}`);
      console.log(`   ${SLATE_600}\u251C\u2500${RESET} ${SIGNAL_PERIOD}1w:${RESET}   ${stats.weekSparkline}`);
      console.log(`   ${SLATE_600}\u2514\u2500${RESET} ${SIGNAL_PERIOD}1mo:${RESET}  ${stats.monthSparkline}`);
      break;
  }
}

async function renderQuote(mode: DisplayMode): Promise<void> {
  if (mode !== 'normal') return;

  // Separator handled by main() for conditional control

  const quote = await getQuote();
  if (!quote) return;

  const maxLine = 72;
  const authorSuffix = `" \u2014${quote.author}`;
  const fullLen = quote.text.length + authorSuffix.length + 4;

  if (fullLen <= maxLine) {
    console.log(`${QUOTE_PRIMARY}\u2726${RESET} ${SLATE_400}"${quote.text}"${RESET} ${QUOTE_AUTHOR}\u2014${quote.author}${RESET}`);
  } else {
    // Wrap quote
    const targetLine1 = 60;
    let splitPos = Math.min(targetLine1, quote.text.length - 12);
    const firstPart = quote.text.substring(0, splitPos);
    const lastSpace = firstPart.lastIndexOf(' ');
    if (lastSpace > 10) splitPos = lastSpace;

    const line1 = quote.text.substring(0, splitPos);
    const line2 = quote.text.substring(splitPos).trim();

    if (line2.length < 10) {
      console.log(`${QUOTE_PRIMARY}\u2726${RESET} ${SLATE_400}"${quote.text}"${RESET} ${QUOTE_AUTHOR}\u2014${quote.author}${RESET}`);
    } else {
      console.log(`${QUOTE_PRIMARY}\u2726${RESET} ${SLATE_400}"${line1}${RESET}`);
      console.log(`  ${SLATE_400}${line2}"${RESET} ${QUOTE_AUTHOR}\u2014${quote.author}${RESET}`);
    }
  }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  // Read input from stdin
  let inputJson = '';
  for await (const chunk of Bun.stdin.stream()) {
    inputJson += new TextDecoder().decode(chunk);
  }

  let input: InputData = {};
  try {
    input = JSON.parse(inputJson);
  } catch {
    // Use defaults
  }

  // Detect terminal width and mode
  const termWidth = detectTerminalWidth();
  const mode = getDisplayMode(termWidth);

  // Load settings
  const settings = readJsonFile<Settings>(SETTINGS_FILE) || {};
  const daName = settings.daidentity?.name || settings.daidentity?.displayName || settings.env?.DA || 'Assistant';
  const paiVersion = settings.pai?.version || '—';

  // Extract input data
  const currentDir = input.workspace?.current_dir || input.cwd || process.cwd();
  const dirName = basename(currentDir);
  const modelName = input.model?.display_name || 'unknown';
  const durationMs = input.cost?.total_duration_ms || 0;
  const cacheRead = input.context_window?.current_usage?.cache_read_input_tokens || 0;
  const inputTokens = input.context_window?.current_usage?.input_tokens || 0;
  const cacheCreation = input.context_window?.current_usage?.cache_creation_input_tokens || 0;
  const outputTokens = input.context_window?.current_usage?.output_tokens || 0;
  const contextMax = input.context_window?.context_window_size || 200000;

  // Get CC version (cross-platform: use shell on Windows for proper command resolution)
  let ccVersion = input.version || 'unknown';
  if (ccVersion === 'unknown') {
    try {
      const result = spawnSync('claude', ['--version'], {
        ...getSpawnOpts(),
        shell: isWindows(),  // Use shell on Windows for .exe/.cmd/.bat resolution
      });
      ccVersion = result.stdout?.trim().split(' ')[0] || 'unknown';
    } catch {
      // Keep unknown
    }
  }

  // Cache model name
  ensureDir(dirname(MODEL_CACHE));
  try {
    writeFileSync(MODEL_CACHE, modelName);
  } catch {
    // Silently fail
  }

  // Count resources
  const skillsCount = countDirectories(join(PAI_DIR, 'skills'));
  const workflowsCount = countWorkflows(join(PAI_DIR, 'skills'));
  const hooksCount = countFiles(join(PAI_DIR, 'hooks'), /\.ts$/, false); // Non-recursive to match bash
  const workCount = countDirectories(join(PAI_DIR, 'MEMORY', 'WORK'), 2);
  const ratingsCount = countLinesInFile(RATINGS_FILE);
  const sessionsCount = countFiles(join(PAI_DIR, 'MEMORY'), /\.jsonl$/);
  const researchCount = countFiles(join(PAI_DIR, 'MEMORY', 'RESEARCH'), /\.(md|json)$/);

  // Calculate context usage
  const contentTokens = cacheRead + inputTokens + cacheCreation + outputTokens;
  const contextUsed = contentTokens + CONTEXT_BASELINE;
  const contextPct = contextMax > 0 ? Math.floor((contextUsed * 100) / contextMax) : 0;
  const contextK = Math.floor(contextUsed / 1000);
  const maxK = Math.floor(contextMax / 1000);

  // Format duration
  const durationSec = Math.floor(durationMs / 1000);
  let timeDisplay: string;
  if (durationSec >= 3600) {
    timeDisplay = `${Math.floor(durationSec / 3600)}h${Math.floor((durationSec % 3600) / 60)}m`;
  } else if (durationSec >= 60) {
    timeDisplay = `${Math.floor(durationSec / 60)}m${durationSec % 60}s`;
  } else {
    timeDisplay = `${durationSec}s`;
  }

  // Get current time
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Fetch location and weather (parallel)
  const [location, weather] = await Promise.all([fetchLocation(), fetchWeather()]);

  // Get git status
  const gitStatus = getGitStatus(currentDir);

  // Get rating stats
  const ratingStats = calculateRatingStats();

  // Separator helper
  const separator = `${SLATE_600}\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500${RESET}`;

  // Render output
  if (SHOW_PAI_BRANDING) {
    renderPaiBranding(mode, ccVersion, paiVersion, skillsCount, workflowsCount, hooksCount, currentTime, location, weather);
  }
  renderContext(mode, contextPct, contextK, maxK, timeDisplay, modelName);
  renderGit(mode, gitStatus, dirName);

  // Conditionally render memory/learning sections with smart separator handling
  if (SHOW_MEMORY_SECTION || SHOW_LEARNING_SECTION) {
    console.log(separator); // Separator after git when memory/learning sections exist
    if (SHOW_MEMORY_SECTION) {
      renderMemory(mode, workCount, ratingsCount, sessionsCount, researchCount);
    }
    if (SHOW_LEARNING_SECTION) {
      renderLearning(mode, ratingStats);
    }
  }

  // Quote section (normal mode only) - separator printed before quote
  if (mode === 'normal') {
    console.log(separator);
    await renderQuote(mode);
  }
}

main().catch(console.error);
