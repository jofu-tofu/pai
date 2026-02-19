# DelegateAgents Workflow

Read the context layer from GatherContext, identify which PAI skills are relevant, determine how many agents to spawn, then launch them in parallel.

## Purpose

The key insight: comprehensiveness is achieved through **specialization**, not through one agent trying to review everything. Each agent is given a specific lens and only the relevant portion of the diff. This makes reviews both deeper (each agent goes far in its domain) and faster (all agents run in parallel).

## Step 1: Read Context Layer

Load `_output/contexts/[context-slug]/notes/CodeReview-Context.md`

Extract:
- Change fingerprint (languages, domains, risk areas)
- Size tier (Small / Medium / Large)
- Intent summary

## Step 2: Select Relevant Skills

Scan the available skills against the change fingerprint. Match skills to what was changed:

| Change Type | Consider These Skills |
|-------------|----------------------|
| TypeScript changes | TypeScript skill |
| React / TSX components | React skill |
| Python code | PythonCoding skill |
| C# / .NET | CSharp skill |
| UI / CSS / accessibility | WebDesign skill |
| Tests added/modified | TestDriven skill |
| Architecture changes | Design skill |
| Documentation changes | DocPhilosophy skill |
| Any code (general correctness) | Always include a General agent |
| Security-sensitive areas | Consider RedTeam agent |

**Philosophical dimension:** If the intent context reveals the *why* of the change is more important than the mechanics (e.g., a major architectural decision, a design philosophy shift), add a philosophical/architectural agent using the Design or DocPhilosophy skill.

**Always include at minimum:**
- 1 General agent (overall correctness, logic, patterns)
- 1 language-specific agent (TypeScript, Python, etc.)

## Step 3: Determine Agent Count

Scale with size tier:

| Size Tier | Lines Changed | Agent Count | Strategy |
|-----------|--------------|-------------|----------|
| Small | 1-50 lines | 2 agents | General + 1 domain |
| Medium | 50-300 lines | 3-4 agents | General + 2-3 domains |
| Large | 300+ lines | 5-8 agents | General + full domain coverage |

Cap at 8 agents regardless of size — diminishing returns past that, and synthesis complexity increases.

## Step 4: Construct Agent Prompts

Each agent receives:
1. The context layer (intent + summary — NOT the full diff unless needed)
2. The diff sections relevant to their domain only
3. Their specific review lens/skill
4. The commit range to scope their claims to
5. Output format requirements

**Agent prompt template:**
```
You are a [DOMAIN] code reviewer.

CONTEXT:
[Context layer — intent, summary, commit range]

YOUR LENS:
You are reviewing specifically for [DOMAIN] concerns: [specific focus areas from skill].
Do NOT review general correctness — a separate agent handles that.

DIFF (your domain only):
[Filtered diff — only files relevant to this agent's domain]

COMMIT RANGE: [SHA..SHA]
IMPORTANT: Only flag issues that exist in lines introduced in this commit range.
Do not flag pre-existing issues in surrounding context lines.

OUTPUT FORMAT:
For each issue found:
- Severity: [CRITICAL / HIGH / MEDIUM / LOW / SUGGESTION]
- File: [filename]
- Line: [line number or range]
- Commit: [which commit introduced this line — verify with git blame]
- Issue: [1-2 sentence description]
- Recommendation: [what to do about it]
```

## Step 5: Launch Agents in Parallel

Spawn all agents simultaneously using `run_in_background: true`.

Each agent:
- Reads the context layer
- Applies its skill's knowledge to the relevant diff sections
- Returns structured findings

```
# Launch in parallel — do not wait for one before starting the next
Agent 1: General correctness → background
Agent 2: TypeScript → background
Agent 3: React → background
...
```

Output a status message so the user knows what's running:
```
Launching [N] review agents:
✓ General correctness agent — started
✓ TypeScript agent — started
✓ React agent — started
[...]
All agents running in parallel. Collecting results...
```

## Step 6: Collect Agent Outputs

Wait for all agents to complete. Collect their structured findings.

Write raw outputs to: `_output/contexts/[context-slug]/notes/CodeReview-AgentOutputs.md`

## Follow-Up

Always chains to → **SynthesizeFindings**

## TODO

- [ ] Define how to filter the diff per agent (which files/sections go to which agent)
- [ ] Define fallback if a skill isn't loaded/available (use general agent as fallback)
- [ ] Define how to handle overlap — what if TypeScript and React agents flag the same line?
- [ ] Define token budget per agent prompt (context layer + diff must fit in one message)
- [ ] Consider: should agents be aware of each other's domains to avoid redundancy?
