#!/usr/bin/env bun

/**
 * PAI Banner - Dynamic Multi-Design Neofetch Banner
 * Randomly selects from curated designs based on terminal size
 *
 * Large terminals (85+ cols): Navy, Electric, Teal, Ice themes
 * Small terminals (<85 cols): Minimal, Vertical, Wrapping layouts
 *
 * Adapted to use centralized path resolution from hooks/lib/paths.ts
 */

import { readdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { spawnSync } from "child_process";
import { homedir } from "os";

// Get PAI directory - mirrors hooks/lib/paths.ts logic
function getPaiDir(): string {
  const envPaiDir = process.env.PAI_DIR;
  if (envPaiDir) {
    const home = homedir();
    return envPaiDir
      .replace(/^\$HOME(?=\/|$)/, home)
      .replace(/^\$\{HOME\}(?=\/|$)/, home)
      .replace(/^~(?=\/|$)/, home);
  }
  return join(homedir(), '.claude');
}

const PAI_DIR = getPaiDir();

// ═══════════════════════════════════════════════════════════════════════════
// Terminal Width Detection
// ═══════════════════════════════════════════════════════════════════════════

function getTerminalWidth(): number {
  let width: number | null = null;

  const kittyWindowId = process.env.KITTY_WINDOW_ID;
  if (kittyWindowId) {
    try {
      const result = spawnSync("kitten", ["@", "ls"], { encoding: "utf-8" });
      if (result.stdout) {
        const data = JSON.parse(result.stdout);
        for (const osWindow of data) {
          for (const tab of osWindow.tabs) {
            for (const win of tab.windows) {
              if (win.id === parseInt(kittyWindowId)) {
                width = win.columns;
                break;
              }
            }
          }
        }
      }
    } catch {}
  }

  if (!width || width <= 0) {
    try {
      const result = spawnSync("sh", ["-c", "stty size </dev/tty 2>/dev/null"], { encoding: "utf-8" });
      if (result.stdout) {
        const cols = parseInt(result.stdout.trim().split(/\s+/)[1]);
        if (cols > 0) width = cols;
      }
    } catch {}
  }

  if (!width || width <= 0) {
    try {
      const result = spawnSync("tput", ["cols"], { encoding: "utf-8" });
      if (result.stdout) {
        const cols = parseInt(result.stdout.trim());
        if (cols > 0) width = cols;
      }
    } catch {}
  }

  if (!width || width <= 0) {
    width = parseInt(process.env.COLUMNS || "100") || 100;
  }

  return width;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANSI Helpers
// ═══════════════════════════════════════════════════════════════════════════

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const ITALIC = "\x1b[3m";

const rgb = (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`;

// Sparkline characters
const SPARK = ["\u2581", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588"];

// Box drawing
const BOX = {
  tl: "\u256d", tr: "\u256e", bl: "\u2570", br: "\u256f",
  h: "\u2500", v: "\u2502", dh: "\u2550",
};

// ═══════════════════════════════════════════════════════════════════════════
// Stats Collection
// ═══════════════════════════════════════════════════════════════════════════

interface SystemStats {
  name: string;
  skills: number;
  workflows: number;
  hooks: number;
  learnings: number;
  userFiles: number;
  sessions: number;
  model: string;
  platform: string;
  arch: string;
  ccVersion: string;
  paiVersion: string;
}

function getStats(): SystemStats {
  let name = "PAI";
  let paiVersion = "2.0";
  try {
    const settings = JSON.parse(readFileSync(join(PAI_DIR, "settings.json"), "utf-8"));
    name = settings.daidentity?.displayName || settings.daidentity?.name || "PAI";
    paiVersion = settings.pai?.version || "2.0";
  } catch {}

  let skills = 0, workflows = 0, hooks = 0, learnings = 0, userFiles = 0, sessions = 0;

  try {
    for (const e of readdirSync(join(PAI_DIR, "skills"), { withFileTypes: true })) {
      if (e.isDirectory() && existsSync(join(PAI_DIR, "skills", e.name, "SKILL.md"))) skills++;
    }
  } catch {}

  // Count workflows in skills/CORE/Workflows
  try {
    const workflowsDir = join(PAI_DIR, "skills/CORE/Workflows");
    if (existsSync(workflowsDir)) {
      for (const e of readdirSync(workflowsDir, { withFileTypes: true })) {
        if (e.isFile() && e.name.endsWith(".md")) workflows++;
      }
    }
  } catch {}

  try {
    for (const e of readdirSync(join(PAI_DIR, "hooks"), { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith(".ts")) hooks++;
    }
  } catch {}

  const countFiles = (dir: string): number => {
    let c = 0;
    try {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) c += countFiles(join(dir, e.name));
        else if (e.isFile()) c++;
      }
    } catch {}
    return c;
  };

  learnings = countFiles(join(PAI_DIR, "MEMORY/LEARNING"));
  userFiles = countFiles(join(PAI_DIR, "skills/CORE/USER"));

  try {
    const historyFile = join(PAI_DIR, "history.jsonl");
    if (existsSync(historyFile)) {
      const content = readFileSync(historyFile, "utf-8");
      sessions = content.split("\n").filter(line => line.trim()).length;
    }
  } catch {}

  // Get platform info
  const platform = process.platform === "darwin" ? "macOS" : process.platform;
  const arch = process.arch;

  // Try to get Claude Code version
  let ccVersion = "2.0";
  try {
    const result = spawnSync("claude", ["--version"], { encoding: "utf-8" });
    if (result.stdout) {
      const match = result.stdout.match(/(\d+\.\d+\.\d+)/);
      if (match) ccVersion = match[1];
    }
  } catch {}

  return {
    name,
    skills: skills || 15,
    workflows: workflows || 10,
    hooks: hooks || 15,
    learnings: learnings || 0,
    userFiles: userFiles || 0,
    sessions: sessions || 0,
    model: "Opus 4.5",
    platform,
    arch,
    ccVersion,
    paiVersion,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

function visibleLength(str: string): number {
  return str.replace(/\x1b\[[0-9;]*m/g, "").length;
}

function padEnd(str: string, width: number): string {
  return str + " ".repeat(Math.max(0, width - visibleLength(str)));
}

function padStart(str: string, width: number): string {
  return " ".repeat(Math.max(0, width - visibleLength(str))) + str;
}

function center(str: string, width: number): string {
  const visible = visibleLength(str);
  const left = Math.floor((width - visible) / 2);
  return " ".repeat(Math.max(0, left)) + str + " ".repeat(Math.max(0, width - visible - left));
}

function randomHex(len: number = 4): string {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join("");
}

function sparkline(length: number, colors?: string[]): string {
  return Array.from({ length }, (_, i) => {
    const level = Math.floor(Math.random() * 8);
    const color = colors ? colors[i % colors.length] : "";
    return `${color}${SPARK[level]}${RESET}`;
  }).join("");
}

// ═══════════════════════════════════════════════════════════════════════════
// LARGE TERMINAL DESIGNS (85+ cols)
// ═══════════════════════════════════════════════════════════════════════════

// Design 13: Navy/Steel Blue Theme - Neofetch style
function createNavyBanner(stats: SystemStats, width: number): string {
  const C = {
    navy: rgb(30, 58, 138),
    medBlue: rgb(59, 130, 246),
    lightBlue: rgb(147, 197, 253),
    steel: rgb(51, 65, 85),
    slate: rgb(100, 116, 139),
    silver: rgb(203, 213, 225),
    white: rgb(240, 240, 255),
    muted: rgb(71, 85, 105),
    deepNavy: rgb(30, 41, 82),
    royalBlue: rgb(65, 105, 225),
    skyBlue: rgb(135, 206, 235),
    iceBlue: rgb(176, 196, 222),
    periwinkle: rgb(140, 160, 220),
    darkTeal: rgb(55, 100, 105),
  };

  const B = "\u2588";
  const logo = [
    `${C.navy}${B.repeat(16)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(16)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.navy}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.navy}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(16)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(16)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.medBlue}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.medBlue}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.medBlue}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.medBlue}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
  ];
  const LOGO_WIDTH = 20;
  const SEPARATOR = `${C.steel}${BOX.v}${RESET}`;

  const infoLines = [
    `${C.slate}"${RESET}${C.lightBlue}${stats.name}${RESET} ${C.slate}here, ready to go..."${RESET}`,
    `${C.steel}${BOX.h.repeat(24)}${RESET}`,
    `${C.navy}\u2B22${RESET}  ${C.slate}PAI${RESET}       ${C.silver}v${stats.paiVersion}${RESET}`,
    `${C.lightBlue}\u2726${RESET}  ${C.slate}Skills${RESET}    ${C.silver}${stats.skills}${RESET}`,
    `${C.skyBlue}\u21BB${RESET}  ${C.slate}Workflows${RESET} ${C.iceBlue}${stats.workflows}${RESET}`,
    `${C.royalBlue}\u21AA${RESET}  ${C.slate}Hooks${RESET}     ${C.periwinkle}${stats.hooks}${RESET}`,
    `${C.medBlue}\u2726${RESET}  ${C.slate}Signals${RESET}   ${C.skyBlue}${stats.learnings}${RESET}`,
    `${C.navy}\u2261${RESET}  ${C.slate}Files${RESET}     ${C.lightBlue}${stats.userFiles}${RESET}`,
    `${C.steel}${BOX.h.repeat(24)}${RESET}`,
    ``,
  ];

  const gap = "   ";
  const gapAfter = "  ";
  const totalContentWidth = LOGO_WIDTH + gap.length + 1 + gapAfter.length + 28;
  const leftPad = Math.floor((width - totalContentWidth) / 2);
  const pad = " ".repeat(Math.max(2, leftPad));
  const emptyLogoSpace = " ".repeat(LOGO_WIDTH);
  const logoTopPad = Math.ceil((infoLines.length - logo.length) / 2);

  const RETICLE = {
    tl: "\u250F", tr: "\u2513", bl: "\u2517", br: "\u251B", h: "\u2501",
  };

  const frameWidth = 70;
  const framePad = " ".repeat(Math.floor((width - frameWidth) / 2));

  const lines: string[] = [""];

  const topBorder = `${C.steel}${RETICLE.tl}${RETICLE.h.repeat(frameWidth - 2)}${RETICLE.tr}${RESET}`;
  lines.push(`${framePad}${topBorder}`);
  lines.push("");

  const paiColored = `${C.navy}P${RESET}${C.medBlue}A${RESET}${C.lightBlue}I${RESET}`;
  const headerText = `${paiColored} ${C.steel}|${RESET} ${C.slate}Personal AI Infrastructure${RESET}`;
  const headerPad = " ".repeat(Math.floor((width - 33) / 2));
  lines.push(`${headerPad}${headerText}`);
  lines.push("");

  const quote = `${ITALIC}${C.lightBlue}"Magnifying human capabilities..."${RESET}`;
  const quotePad = " ".repeat(Math.floor((width - 35) / 2));
  lines.push(`${quotePad}${quote}`);
  lines.push("");
  lines.push("");

  for (let i = 0; i < infoLines.length; i++) {
    const logoIndex = i - logoTopPad;
    const logoRow = (logoIndex >= 0 && logoIndex < logo.length) ? logo[logoIndex] : emptyLogoSpace;
    const infoRow = infoLines[i];
    lines.push(`${pad}${padEnd(logoRow, LOGO_WIDTH)}${gap}${SEPARATOR}${gapAfter}${infoRow}`);
  }

  lines.push("");
  lines.push("");

  const urlLine = `${C.steel}\u2192${RESET} ${C.medBlue}github.com/danielmiessler/PAI${RESET}`;
  const urlPad = " ".repeat(Math.floor((width - 32) / 2));
  lines.push(`${urlPad}${urlLine}`);
  lines.push("");

  const bottomBorder = `${C.steel}${RETICLE.bl}${RETICLE.h.repeat(frameWidth - 2)}${RETICLE.br}${RESET}`;
  lines.push(`${framePad}${bottomBorder}`);
  lines.push("");

  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIVE NAVY BANNER VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

function getNavyColors() {
  return {
    navy: rgb(30, 58, 138),
    medBlue: rgb(59, 130, 246),
    lightBlue: rgb(147, 197, 253),
    steel: rgb(51, 65, 85),
    slate: rgb(100, 116, 139),
    silver: rgb(203, 213, 225),
    iceBlue: rgb(176, 196, 222),
    periwinkle: rgb(140, 160, 220),
    skyBlue: rgb(135, 206, 235),
    royalBlue: rgb(65, 105, 225),
  };
}

function getSmallLogo(C: ReturnType<typeof getNavyColors>) {
  const B = "\u2588";
  return [
    `${C.navy}${B.repeat(8)}${RESET}${C.lightBlue}${B.repeat(2)}${RESET}`,
    `${C.navy}${B.repeat(2)}${RESET}    ${C.navy}${B.repeat(2)}${RESET}${C.lightBlue}${B.repeat(2)}${RESET}`,
    `${C.navy}${B.repeat(8)}${RESET}${C.lightBlue}${B.repeat(2)}${RESET}`,
    `${C.navy}${B.repeat(2)}${RESET}    ${C.medBlue}${B.repeat(2)}${RESET}${C.lightBlue}${B.repeat(2)}${RESET}`,
    `${C.navy}${B.repeat(2)}${RESET}    ${C.medBlue}${B.repeat(2)}${RESET}${C.lightBlue}${B.repeat(2)}${RESET}`,
  ];
}

// Medium Banner (70-84 cols)
function createNavyMediumBanner(stats: SystemStats, width: number): string {
  const C = getNavyColors();
  const B = "\u2588";

  const logo = [
    `${C.navy}${B.repeat(16)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(16)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.navy}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.navy}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(16)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(16)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.medBlue}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.medBlue}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.medBlue}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
    `${C.navy}${B.repeat(4)}${RESET}        ${C.medBlue}${B.repeat(4)}${RESET}${C.lightBlue}${B.repeat(4)}${RESET}`,
  ];
  const LOGO_WIDTH = 20;
  const SEPARATOR = `${C.steel}${BOX.v}${RESET}`;

  const infoLines = [
    `${C.slate}"${RESET}${C.lightBlue}${stats.name}${RESET} ${C.slate}here, ready to go..."${RESET}`,
    `${C.steel}${BOX.h.repeat(24)}${RESET}`,
    `${C.navy}\u2B22${RESET}  ${C.slate}PAI${RESET}       ${C.silver}v${stats.paiVersion}${RESET}`,
    `${C.lightBlue}\u2726${RESET}  ${C.slate}Skills${RESET}    ${C.silver}${stats.skills}${RESET}`,
    `${C.skyBlue}\u21BB${RESET}  ${C.slate}Workflows${RESET} ${C.iceBlue}${stats.workflows}${RESET}`,
    `${C.royalBlue}\u21AA${RESET}  ${C.slate}Hooks${RESET}     ${C.periwinkle}${stats.hooks}${RESET}`,
    `${C.medBlue}\u2726${RESET}  ${C.slate}Signals${RESET}   ${C.skyBlue}${stats.learnings}${RESET}`,
    `${C.navy}\u2261${RESET}  ${C.slate}Files${RESET}     ${C.lightBlue}${stats.userFiles}${RESET}`,
    `${C.steel}${BOX.h.repeat(24)}${RESET}`,
    ``,
  ];

  const gap = "   ";
  const gapAfter = "  ";
  const totalContentWidth = LOGO_WIDTH + gap.length + 1 + gapAfter.length + 28;
  const leftPad = Math.floor((width - totalContentWidth) / 2);
  const pad = " ".repeat(Math.max(1, leftPad));
  const emptyLogoSpace = " ".repeat(LOGO_WIDTH);
  const logoTopPad = Math.ceil((infoLines.length - logo.length) / 2);

  const lines: string[] = [""];

  const paiColored = `${C.navy}P${RESET}${C.medBlue}A${RESET}${C.lightBlue}I${RESET}`;
  const headerText = `${paiColored} ${C.steel}|${RESET} ${C.slate}Personal AI Infrastructure${RESET}`;
  const headerPad = " ".repeat(Math.max(0, Math.floor((width - 33) / 2)));
  lines.push(`${headerPad}${headerText}`);
  lines.push("");

  const quote = `${ITALIC}${C.lightBlue}"Magnifying human capabilities..."${RESET}`;
  const quotePad = " ".repeat(Math.max(0, Math.floor((width - 35) / 2)));
  lines.push(`${quotePad}${quote}`);
  lines.push("");

  for (let i = 0; i < infoLines.length; i++) {
    const logoIndex = i - logoTopPad;
    const logoRow = (logoIndex >= 0 && logoIndex < logo.length) ? logo[logoIndex] : emptyLogoSpace;
    lines.push(`${pad}${padEnd(logoRow, LOGO_WIDTH)}${gap}${SEPARATOR}${gapAfter}${infoLines[i]}`);
  }

  lines.push("");
  const urlLine = `${C.steel}\u2192${RESET} ${C.medBlue}github.com/danielmiessler/PAI${RESET}`;
  const urlPad = " ".repeat(Math.max(0, Math.floor((width - 32) / 2)));
  lines.push(`${urlPad}${urlLine}`);
  lines.push("");

  return lines.join("\n");
}

// Compact Banner (55-69 cols)
function createNavyCompactBanner(stats: SystemStats, width: number): string {
  const C = getNavyColors();
  const logo = getSmallLogo(C);
  const LOGO_WIDTH = 10;
  const SEPARATOR = `${C.steel}${BOX.v}${RESET}`;

  const infoLines = [
    `${C.slate}"${RESET}${C.lightBlue}${stats.name}${RESET} ${C.slate}ready..."${RESET}`,
    `${C.steel}${BOX.h.repeat(18)}${RESET}`,
    `${C.navy}\u2B22${RESET} ${C.slate}PAI${RESET}    ${C.silver}v${stats.paiVersion}${RESET}`,
    `${C.lightBlue}\u2726${RESET} ${C.slate}Skills${RESET} ${C.silver}${stats.skills}${RESET}  ${C.royalBlue}\u21AA${RESET} ${C.periwinkle}${stats.hooks}${RESET}`,
    `${C.medBlue}\u2726${RESET} ${C.slate}Signals${RESET} ${C.skyBlue}${stats.learnings}${RESET}`,
    `${C.steel}${BOX.h.repeat(18)}${RESET}`,
  ];

  const gap = "  ";
  const gapAfter = " ";
  const totalContentWidth = LOGO_WIDTH + gap.length + 1 + gapAfter.length + 20;
  const leftPad = Math.floor((width - totalContentWidth) / 2);
  const pad = " ".repeat(Math.max(1, leftPad));
  const emptyLogoSpace = " ".repeat(LOGO_WIDTH);
  const logoTopPad = Math.floor((infoLines.length - logo.length) / 2);

  const lines: string[] = [""];

  const paiColored = `${C.navy}P${RESET}${C.medBlue}A${RESET}${C.lightBlue}I${RESET}`;
  const headerPad = " ".repeat(Math.max(0, Math.floor((width - 3) / 2)));
  lines.push(`${headerPad}${paiColored}`);
  lines.push("");

  for (let i = 0; i < infoLines.length; i++) {
    const logoIndex = i - logoTopPad;
    const logoRow = (logoIndex >= 0 && logoIndex < logo.length) ? logo[logoIndex] : emptyLogoSpace;
    lines.push(`${pad}${padEnd(logoRow, LOGO_WIDTH)}${gap}${SEPARATOR}${gapAfter}${infoLines[i]}`);
  }
  lines.push("");

  return lines.join("\n");
}

// Minimal Banner (45-54 cols)
function createNavyMinimalBanner(stats: SystemStats, width: number): string {
  const C = getNavyColors();
  const logo = getSmallLogo(C);
  const LOGO_WIDTH = 10;

  const infoLines = [
    `${C.lightBlue}${stats.name}${RESET}${C.slate}@pai${RESET}`,
    `${C.slate}v${stats.paiVersion}${RESET}`,
    `${C.steel}${BOX.h.repeat(14)}${RESET}`,
    `${C.lightBlue}\u2726${RESET}${C.silver}${stats.skills}${RESET} ${C.royalBlue}\u21AA${RESET}${C.periwinkle}${stats.hooks}${RESET} ${C.medBlue}\u2726${RESET}${C.skyBlue}${stats.learnings}${RESET}`,
    ``,
  ];

  const gap = " ";
  const totalContentWidth = LOGO_WIDTH + gap.length + 16;
  const leftPad = Math.floor((width - totalContentWidth) / 2);
  const pad = " ".repeat(Math.max(1, leftPad));

  const lines: string[] = [""];

  for (let i = 0; i < logo.length; i++) {
    lines.push(`${pad}${padEnd(logo[i], LOGO_WIDTH)}${gap}${infoLines[i] || ""}`);
  }
  lines.push("");

  return lines.join("\n");
}

// Ultra-compact Banner (<45 cols)
function createNavyUltraCompactBanner(stats: SystemStats, width: number): string {
  const C = getNavyColors();

  const paiColored = `${C.navy}P${RESET}${C.medBlue}A${RESET}${C.lightBlue}I${RESET}`;

  const lines: string[] = [""];
  lines.push(center(paiColored, width));
  lines.push(center(`${C.lightBlue}${stats.name}${RESET}${C.slate}@pai v${stats.paiVersion}${RESET}`, width));
  lines.push(center(`${C.steel}${BOX.h.repeat(Math.min(20, width - 4))}${RESET}`, width));
  lines.push(center(`${C.lightBlue}\u2726${RESET}${C.silver}${stats.skills}${RESET} ${C.royalBlue}\u21AA${RESET}${C.periwinkle}${stats.hooks}${RESET} ${C.medBlue}\u2726${RESET}${C.skyBlue}${stats.learnings}${RESET}`, width));
  lines.push("");

  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Banner Selection
// ═══════════════════════════════════════════════════════════════════════════

const BREAKPOINTS = {
  FULL: 85,
  MEDIUM: 70,
  COMPACT: 55,
  MINIMAL: 45,
};

type DesignName = "navy" | "navy-medium" | "navy-compact" | "navy-minimal" | "navy-ultra";
const ALL_DESIGNS: DesignName[] = ["navy", "navy-medium", "navy-compact", "navy-minimal", "navy-ultra"];

function createBanner(forceDesign?: string): string {
  const width = getTerminalWidth();
  const stats = getStats();

  if (forceDesign) {
    switch (forceDesign) {
      case "navy": return createNavyBanner(stats, width);
      case "navy-medium": return createNavyMediumBanner(stats, width);
      case "navy-compact": return createNavyCompactBanner(stats, width);
      case "navy-minimal": return createNavyMinimalBanner(stats, width);
      case "navy-ultra": return createNavyUltraCompactBanner(stats, width);
    }
  }

  if (width >= BREAKPOINTS.FULL) {
    return createNavyBanner(stats, width);
  } else if (width >= BREAKPOINTS.MEDIUM) {
    return createNavyMediumBanner(stats, width);
  } else if (width >= BREAKPOINTS.COMPACT) {
    return createNavyCompactBanner(stats, width);
  } else if (width >= BREAKPOINTS.MINIMAL) {
    return createNavyMinimalBanner(stats, width);
  } else {
    return createNavyUltraCompactBanner(stats, width);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const testMode = args.includes("--test");
const designArg = args.find(a => a.startsWith("--design="))?.split("=")[1];

try {
  if (testMode) {
    for (const design of ALL_DESIGNS) {
      console.log(`\n${"═".repeat(60)}`);
      console.log(`  DESIGN: ${design.toUpperCase()}`);
      console.log(`${"═".repeat(60)}`);
      console.log(createBanner(design));
    }
  } else {
    console.log(createBanner(designArg));
  }
} catch (e) {
  console.error("Banner error:", e);
}
