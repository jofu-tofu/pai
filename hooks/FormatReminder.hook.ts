#!/usr/bin/env bun
/**
 * FormatReminder.hook.ts - Algorithm enforcement via AI inference (v2.5)
 *
 * Uses AI inference (standard tier / Sonnet) to classify:
 * - Depth: FULL | ITERATION | MINIMAL
 * - Capabilities: agent types (engineer, architect, etc.)
 * - Skills: specific skill:workflow pairs (Pass 1 hints)
 * - Thinking tools: meta-cognitive tools (Council, RedTeam, etc.)
 *
 * This is Pass 1 of Two-Pass Capability Selection.
 * Pass 1 (this hook): draft hints from raw prompt
 * Pass 2 (THINK phase): validates against reverse-engineered request + ISC
 *
 * On inference failure: defaults to FULL (nothing escapes the Algorithm).
 *
 * TRIGGER: UserPromptSubmit
 */

import { inference } from './core/inference';
import { getDAName } from './core/identity';
import { getEnvVar, pathContainsSegment } from './core/platform';

// Maps inference capability names → output format for the reminder
const CAPABILITY_MAP: Record<string, { name: string; agents: string }> = {
  research: { name: 'Research skill', agents: 'GeminiResearcher, ClaudeResearcher, GrokResearcher' },
  engineer: { name: 'Engineer Agent', agents: 'Engineer (subagent_type=Engineer)' },
  architect: { name: 'Architect Agent', agents: 'Architect (subagent_type=Architect)' },
  analyst: { name: 'Algorithm Agent', agents: 'Algorithm (subagent_type=Algorithm)' },
  qa: { name: 'QATester Agent', agents: 'QATester (subagent_type=QATester)' },
};

// Thinking tools that can be suggested by the hook
const THINKING_TOOLS = ['council', 'redteam', 'firstprinciples', 'science', 'becreative', 'prompting'] as const;

const THINKING_MAP: Record<string, { name: string; description: string }> = {
  council: { name: 'Council', description: 'Multi-agent debate for weighing approaches' },
  redteam: { name: 'RedTeam', description: 'Adversarial stress-testing of claims/proposals' },
  firstprinciples: { name: 'FirstPrinciples', description: 'Root cause decomposition, challenge assumptions' },
  science: { name: 'Science', description: 'Hypothesis-test-analyze cycles' },
  becreative: { name: 'BeCreative', description: 'Extended thinking, creative divergence' },
  prompting: { name: 'Prompting', description: 'Meta-prompting, prompt generation at scale' },
};

const CLASSIFICATION_SYSTEM_PROMPT = `You classify user prompts for an AI assistant's response depth, required capabilities, relevant skills, and thinking tools.

DEPTH LEVELS (choose exactly one):
- FULL: Any non-trivial work. Problem-solving, analysis, implementation, design, planning, thinking, evaluation, creation. This is the DEFAULT. Use it unless the request CLEARLY fits ITERATION or MINIMAL.
- ITERATION: Continuing/adjusting EXISTING work in progress. The user is directing ongoing work: "now try X", "ok do Y instead", "use a different approach", "that didn't work". Key signal: the response only makes sense as a continuation of prior work.
- MINIMAL: Pure social interaction with ZERO task content. ONLY: greetings ("hi", "hey"), ratings (a single number 1-10), or acknowledgments ("thanks", "cool", "got it"). If there is ANY task, question, or directive, it is NOT minimal.

CAPABILITIES (choose zero or more that would help):
- research: Investigation, exploration, finding information, looking into something
- engineer: Building, implementing, coding, fixing, creating, writing code
- architect: System design, architecture, structure decisions, planning systems
- analyst: Analysis, review, evaluation, assessment, deep thinking
- qa: Testing, verification, validation, quality checks, browser verification

SKILLS (choose zero or more matching skills — use "SkillName" or "SkillName:WorkflowName"):
- AccessibleUI: WCAG accessibility, inclusive design, a11y. Triggers: accessibility, WCAG, ARIA, screen reader, focus management
- Agents: Agent composition, custom agents. Triggers: create custom agents, agent personalities, agent voices
- BeCreative: Extended thinking, creative divergence. Triggers: be creative, deep thinking, extended reasoning
- PAI: PAI system reference (auto-loaded). Triggers: system, identity, configuration
- Council: Multi-agent debate. Triggers: council, debate, perspectives, agents discuss
- CreateSkill: Skill creation/validation. Triggers: create skill, new skill, canonicalize
- CSharp: C# coding guidelines. Triggers: C#, .NET, async patterns, null safety
- Evals: Agent evaluation framework. Triggers: eval, evaluate, test agent, benchmark, regression test
- Fabric: 240+ prompt patterns. Triggers: use fabric, fabric pattern, extract wisdom, summarize
- FirstPrinciples: Fundamental analysis. Triggers: first principles, root cause, challenge assumptions
- Obsidian: Knowledge management. Triggers: obsidian, notes, vault, research, mermaid diagrams
- Prompting: Meta-prompting system. Triggers: meta-prompting, template generation, prompt optimization
- PythonCoding: Python code quality. Triggers: Python code, Python review, Python refactoring
- RedTeam: Adversarial analysis. Triggers: red team, attack idea, counterarguments, critique, stress test
- Research: Comprehensive research. Triggers: research, investigate, find information, analyze content
- SkillTranslate: Cross-platform skill translation. Triggers: translate skill, convert workflow, cross-platform
- System: System maintenance. Triggers: integrity check, document session, security scan, git push
- Telos: Life OS and project analysis. Triggers: TELOS, life goals, projects, dependencies
- TestDriven: TDD methodology. Triggers: test, TDD, unit test, refactoring, characterization testing
- UpdateSkill: Skill modification. Triggers: update skill, edit skill, modify skill, skill maintenance
- Upgrades: PAI upgrade tracking. Triggers: upgrades, improvement tracking
- VercelReact: React/Next.js optimization. Triggers: React, Next.js, Vercel, performance, server components

THINKING TOOLS (choose zero or more — these are DRAFT hints, the main agent validates in THINK phase):
- council: Multiple valid approaches exist. Need to weigh tradeoffs. Design decisions with no clear winner.
- redteam: Claims need stress-testing. Security implications. Proposals that could fail non-obviously.
- firstprinciples: Problem may be a symptom. Assumptions need examining. "Why" over "how."
- science: Iterative problem. Experimentation needed. Multiple hypotheses to test.
- becreative: Need creative divergence. Novel solution space. Avoiding obvious answers.
- prompting: Need to generate prompts at scale. Prompt optimization.

CRITICAL RULES:
- Assess EFFORT REQUIRED, not prompt length or keywords
- "analyze everything" is 2 words but FULL depth with analyst capability
- "hey there my friend how are you doing on this fine day" is long but MINIMAL
- "just think about it" contains "just" but if thinking is the task, it's FULL
- When uncertain, ALWAYS choose FULL. False FULL is safe. False MINIMAL loses quality.
- MINIMAL is RARE. Almost everything is FULL or ITERATION.
- Capabilities should reflect what SPECIALIST AGENTS would genuinely help with
- Skills are HINTS only — the main agent validates after reverse-engineering the request
- Thinking tools are HINTS only — the main agent runs a justify-exclusion assessment in THINK

Return ONLY valid JSON. No explanation, no markdown, no wrapping:
{"depth":"FULL","capabilities":["analyst","engineer"],"skills":["CreateSkill:UpdateSkill"],"thinking":["council"]}`;

// Read stdin with timeout
async function readStdin(timeout = 3000): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    const timer = setTimeout(() => resolve(data), timeout);
    process.stdin.on('data', chunk => { data += chunk.toString(); });
    process.stdin.on('end', () => { clearTimeout(timer); resolve(data); });
    process.stdin.on('error', () => { clearTimeout(timer); resolve(''); });
  });
}

// Classify prompt using AI inference
async function classifyPrompt(prompt: string): Promise<{
  depth: 'FULL' | 'ITERATION' | 'MINIMAL';
  capabilities: string[];
  skills: string[];
  thinking: string[];
}> {
  const result = await inference({
    systemPrompt: CLASSIFICATION_SYSTEM_PROMPT,
    userPrompt: prompt,
    level: 'standard',
    expectJson: true,
    timeout: 10000, // 10s — if Sonnet can't classify in 10s, fall back to FULL
  });

  if (result.success && result.parsed) {
    const parsed = result.parsed as { depth?: string; capabilities?: string[]; skills?: string[]; thinking?: string[] };
    const depth = ['FULL', 'ITERATION', 'MINIMAL'].includes(parsed.depth || '')
      ? (parsed.depth as 'FULL' | 'ITERATION' | 'MINIMAL')
      : 'FULL';
    const capabilities = Array.isArray(parsed.capabilities)
      ? parsed.capabilities.filter((c: string) => c in CAPABILITY_MAP)
      : [];
    const skills = Array.isArray(parsed.skills)
      ? parsed.skills.filter((s: string) => typeof s === 'string' && s.length > 0)
      : [];
    const thinking = Array.isArray(parsed.thinking)
      ? parsed.thinking.filter((t: string) => t in THINKING_MAP)
      : [];
    return { depth, capabilities, skills, thinking };
  }

  // Inference failed — safe default: FULL, no specific capabilities
  return { depth: 'FULL', capabilities: [], skills: [], thinking: [] };
}

// Build the reminder output
function buildReminder(
  depth: 'FULL' | 'ITERATION' | 'MINIMAL',
  capabilities: string[],
  skills: string[],
  thinking: string[],
): string {
  const daName = getDAName();

  const capabilitySection = capabilities.length > 0
    ? `\n⚡ DETECTED CAPABILITIES (based on your request):\n${capabilities.map(c => {
        const cap = CAPABILITY_MAP[c];
        return cap ? `- ${cap.name} → ${cap.agents}` : '';
      }).filter(Boolean).join('\n')}\n\nYou SHOULD spawn these agents in BUILD/EXECUTE phases.`
    : '';

  const skillSection = skills.length > 0
    ? `\n🎯 DETECTED SKILLS (Pass 1 hints — validate in THINK against ISC):\n${skills.map(s => `- ${s}`).join('\n')}`
    : '';

  const thinkingSection = thinking.length > 0
    ? `\n🧠 SUGGESTED THINKING TOOLS (Pass 1 hints — run justify-exclusion in THINK):\n${thinking.map(t => {
        const tool = THINKING_MAP[t];
        return tool ? `- ${tool.name} — ${tool.description}` : '';
      }).filter(Boolean).join('\n')}`
    : '';

  switch (depth) {
    case 'FULL':
      return `<system-reminder>
ALGORITHM REQUIRED — DEPTH: FULL
Nothing escapes the Algorithm. Your response MUST use the 7-phase format:
- Start with: 🤖 PAI ALGORITHM header
- Include ALL phases: OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN
- THINK phase MUST include: Thinking Tools Assessment, Skill Check, Capability Selection
- Use TaskCreate for ISC criteria, TaskList to display them
- End with voice line
${capabilitySection}${skillSection}${thinkingSection}
</system-reminder>`;

    case 'ITERATION':
      return `<system-reminder>
ALGORITHM REQUIRED — DEPTH: ITERATION
Nothing escapes the Algorithm. Use condensed format:
🤖 PAI ALGORITHM ═════
🔄 ITERATION on: [context]
🔧 CHANGE: [what's different]
✅ VERIFY: [evidence]
🗣️ ${daName}: [result]
${capabilitySection}${skillSection}${thinkingSection}
</system-reminder>`;

    case 'MINIMAL':
      return `<system-reminder>
ALGORITHM REQUIRED — DEPTH: MINIMAL
Nothing escapes the Algorithm. Use header format:
🤖 PAI ALGORITHM ═════════════════════════════════════════════════════════════
   Task: [6 words]
📋 SUMMARY: [what was done]
🗣️ ${daName}: [voice line]
</system-reminder>`;
  }
}

async function main() {
  try {
    // Skip for subagents — they run their own patterns
    const claudeProjectDir = getEnvVar('CLAUDE_PROJECT_DIR') || '';
    if (pathContainsSegment(claudeProjectDir, '.claude/Agents') || getEnvVar('CLAUDE_AGENT_TYPE')) {
      process.exit(0);
    }

    const input = await readStdin();
    if (!input) {
      process.exit(0);
    }

    const data = JSON.parse(input);
    const prompt = data.prompt || data.user_prompt || '';

    if (!prompt) {
      process.exit(0);
    }

    // AI-powered classification — no regex, no keywords, no length heuristics
    const { depth, capabilities, skills, thinking } = await classifyPrompt(prompt);
    const reminder = buildReminder(depth, capabilities, skills, thinking);

    console.log(reminder);
    process.exit(0);
  } catch (err) {
    // On any error, output FULL as safe default
    const daName = getDAName();
    console.log(`<system-reminder>
ALGORITHM REQUIRED — DEPTH: FULL
Nothing escapes the Algorithm. Your response MUST use the 7-phase format:
- Start with: 🤖 PAI ALGORITHM header
- Include ALL phases: OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN
- THINK phase MUST include: Thinking Tools Assessment, Skill Check, Capability Selection
- Use TaskCreate for ISC criteria, TaskList to display them
- End with voice line
</system-reminder>`);
    process.exit(0);
  }
}

main();
