# DelegateAgents Workflow

Read the context layer from GatherContext, construct review dimensions from the full context, then spawn one agent per dimension in parallel.

## Purpose

Comprehensiveness comes from **specialization** — each agent reviews through a specific lens rather than one agent going shallow across everything. The dimensions aren't predetermined; they emerge from the context. What changed, what the user asked for, what the intent reveals, and what the architecture demands all combine to determine how many dimensions we need and what each one focuses on.

## Step 1: Read Context Layer

Load `$REVIEW_DIR/context.md` (the review directory created by GatherContext)

Extract ALL context signals:
- **Change fingerprint** — languages, domains, risk areas, size tier
- **Intent** — what the change is trying to accomplish, why it matters
- **Requested lenses** — any skill names the user passed as arguments
- **Architectural scope** — how many modules, how they connect, what changed structurally

## Step 2: Construct Review Dimensions

Review dimensions are **lenses** — each one defines what an agent focuses on and what knowledge it brings. Dimensions emerge from the context, not from a fixed mapping.

**Context signals that produce dimensions:**

| Signal | How It Creates Dimensions |
|--------|--------------------------|
| **Change fingerprint** (languages) | Each language in the diff may warrant its own dimension (TypeScript correctness, React patterns, Python idioms) |
| **Change fingerprint** (domains) | Each affected domain (API, UI, data model, auth) may warrant a dimension |
| **Change fingerprint** (risk areas) | Security-sensitive changes, auth code, data handling add security/safety dimensions |
| **Requested lenses** (skill arguments) | Each requested skill is read and its relevant categories become dimensions. Multi-category skills (like CodingStandards) are decomposed — match their sub-categories to the fingerprint and only load what's relevant. |
| **Intent context** | If the *why* matters more than the *how* (architecture decision, design philosophy shift), add an architectural/philosophical dimension |
| **Test changes** | If tests were added or modified, add a test quality dimension |

**The process:**
1. List all context signals from the context layer
2. For each signal, identify what review dimension(s) it implies
3. Merge dimensions that would overlap (e.g., "TypeScript correctness" from the fingerprint and "TypeScript standards" from a CodingStandards argument become one combined "TypeScript" dimension with both general and standards-specific rules)
4. For each dimension, identify which PAI skill(s) provide relevant knowledge. Read those skills and extract the specific rules/principles the agent should apply — don't just name the skill.

**Output:** A list of review dimensions, each with:
- A lens name (e.g., "TypeScript + CodingStandards", "React patterns", "Test quality", "General correctness")
- The specific knowledge/rules to inject into the agent prompt
- Which files from the diff are relevant to this dimension

**Always include at minimum:**
- 1 General correctness dimension (logic, patterns, bugs — applied to the full diff)
- At least 1 domain-specific dimension

**Constraint:** Every context signal must map to at least one dimension. No signal — especially a user-requested lens — should be silently dropped.

## Step 3: Determine Agent Count

Each dimension becomes one agent. Scale the number of dimensions with change size:

| Size Tier | Lines Changed | Typical Dimensions | Strategy |
|-----------|--------------|-------------------|----------|
| Small | 1-50 lines | 2-3 | General + 1-2 focused |
| Medium | 50-300 lines | 3-5 | General + language + domain-specific |
| Large | 300+ lines | 5-8 | General + full dimensional coverage |

Cap at 8 agents — diminishing returns past that, and synthesis complexity increases.

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

## Step 5: Announce and Launch Agents in Parallel

**MANDATORY announcement before spawning (makes proportionality visible):**
```
Change size: [TIER] ([N] lines) → spawning [N] agents: [domain1], [domain2], ...
```

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

Write raw outputs to: `$REVIEW_DIR/agent-outputs.md`

## Follow-Up

Always chains to → **SynthesizeFindings**

## TODO

- [ ] Define how to filter the diff per agent (which files/sections go to which agent)
- [ ] Define fallback if a skill isn't loaded/available (use general agent as fallback)
- [ ] Define how to handle overlap — what if TypeScript and React agents flag the same line?
- [ ] Define token budget per agent prompt (context layer + diff must fit in one message)
- [ ] Consider: should agents be aware of each other's domains to avoid redundancy?
