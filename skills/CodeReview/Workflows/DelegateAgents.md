# DelegateAgents Workflow

> Internal workflow — invoked by Review.md, not user-facing.

Read the context layer from GatherContext, load structured review dimensions, construct review dimensions from the full context, then spawn one agent per dimension in parallel.

## Purpose

Comprehensiveness comes from **specialization** — each agent reviews through a specific lens rather than one agent going shallow across everything. Dimensions come from two sources: (1) structured dimension documents in `Dimensions/` that provide concrete heuristics, and (2) context-emergent dimensions from change fingerprint, requested lenses, and intent. The structured dimensions ensure agents receive specific, auditable rule files — not generic phrasing.

## Step 1: Read Context Layer

Load `$REVIEW_DIR/context.md` (the review directory created by GatherContext)

Determine the **review mode** from the context layer header:
- `mode: diff` — traditional diff-based review (commit range exists)
- `mode: audit` — codebase audit (target path exists, no commit range)

Extract ALL context signals:
- **Change fingerprint** (diff mode) — languages, domains, risk areas, size tier based on lines changed
- **Target fingerprint** (audit mode) — languages, domains, risk areas, size tier based on file count and complexity
- **Intent** — what the change is trying to accomplish (diff) or what the user wants evaluated (audit)
- **Requested lenses** — any skill names the user passed as arguments
- **Architectural scope** — how many modules, how they connect, what changed (diff) or what exists (audit)

## Step 1.5: Load Review Dimensions

Discover all dimension categories by reading every INDEX.md file found under `../Dimensions/*/INDEX.md` (glob pattern).

This discovers dimension categories dynamically — adding a new category (e.g., `Dimensions/Security/INDEX.md`) requires zero changes to this workflow file. Just create the directory with an INDEX.md and dimension documents.

Each INDEX.md lists dimensions with:
- **ID** — unique identifier (e.g., A1, S4)
- **Dimension name** — what the lens evaluates
- **File path** — the Tier 3 dimension document the agent will read
- **Triggers When** — context signals from GatherContext that activate this dimension

Parse the "Triggers When" column against the context signals from Step 1 to determine which dimensions activate.

**Activation rules:**
1. Match each dimension's trigger condition against context signals
2. Dimensions marked `ALWAYS` activate for every review
3. Dimensions with conditional triggers activate only when their conditions match
4. The INDEX.md `Triggers When` column is the **authoritative routing logic** — this workflow does not maintain a separate signal table

## Step 2: Construct Review Dimensions

Combine structured dimensions (from Step 1.5) with context-emergent dimensions to build the full review dimension list.

**Structured dimensions** (from `Dimensions/` INDEX files):
- Already determined in Step 1.5 based on trigger matching
- Each comes with a concrete dimension document file path

**Context-emergent dimensions** (from context signals):

| Signal | How It Creates Dimensions |
|--------|--------------------------|
| **Fingerprint** (languages) | Each language in the target may warrant its own dimension (TypeScript correctness, React patterns, Python idioms) |
| **Fingerprint** (domains) | Each affected domain (API, UI, data model, auth) may warrant a dimension |
| **Fingerprint** (risk areas) | Security-sensitive code, auth modules, data handling add security/safety dimensions |
| **Requested lenses** (skill arguments) | Each requested skill is read and its relevant categories become dimensions. Multi-category skills (like CodingStandards) are decomposed — match their sub-categories to the fingerprint and only load what's relevant. |
| **Intent context** | If the *why* matters more than the *how* (architecture decision, design philosophy shift), add an architectural/philosophical dimension |
| **Test presence** (diff: test changes; audit: test coverage) | If tests were changed (diff) or test files exist in the target (audit), add a test quality dimension |

**The process:**
1. Start with the activated structured dimensions from Step 1.5
2. Add context-emergent dimensions from the signals above
3. Merge dimensions that would overlap (e.g., if both A3 Consistency and a CodingStandards dimension cover naming conventions, merge them — the structured dimension document takes precedence as the agent's instruction set)
4. For context-emergent dimensions without a structured document, identify which PAI skill(s) provide relevant knowledge and extract specific rules

**Output:** A list of review dimensions, each with:
- A lens name (e.g., "Complexity Reduction [S4]", "TypeScript + CodingStandards", "General correctness")
- For structured dimensions: the file path to the dimension document (repo-root-relative)
- For context-emergent dimensions: the specific knowledge/rules to inject into the agent prompt
- Which files from the diff are relevant to this dimension

**Always include at minimum:**
- 1 General correctness dimension (logic, patterns, bugs — applied to the full diff)
- Baseline structured dimensions: A5 (Design Intent Clarity) and S4 (Complexity Reduction)

**Constraint:** Every context signal must map to at least one dimension. No signal — especially a user-requested lens — should be silently dropped.

## Step 3: Determine Agent Count

Each dimension becomes one agent. Scale with **review target size and complexity** — the metric depends on review mode:

**Diff mode** — size measured by lines changed:

| Size Tier | Lines Changed | Max Agents | Strategy |
|-----------|--------------|------------|----------|
| Small | 1-50 lines | 4 | General + baselines (A5, S4) + 1 focused |
| Medium | 50-300 lines | 8 | General + baselines + language + domain-specific |
| Large | 300+ lines | 12 | General + full dimensional coverage across all activated categories |

**Audit mode** — size measured by target file count and structural complexity:

| Size Tier | Target Scope | Max Agents | Strategy |
|-----------|-------------|------------|----------|
| Small | 1-10 files, single module | 4 | General + baselines (A5, S4) + 1 focused |
| Medium | 10-50 files, 2-4 modules | 8 | General + baselines + per-language + per-domain |
| Large | 50+ files, 5+ modules or deep nesting | 12 | General + full dimensional coverage across all activated categories |

**Complexity modifiers (audit mode):** Upgrade size tier by one level when:
- Target contains 3+ languages
- Target has deep dependency chains (imports spanning 4+ directories)
- Target includes generated code, config files, AND application code together

When activated dimensions exceed the agent cap for the size tier, prioritize:
1. General correctness (always)
2. Baseline dimensions: A5, S4 (always)
3. Dimensions whose trigger conditions matched most strongly
4. User-requested lenses (never drop these)

## Step 4: Construct Agent Prompts

Each agent receives a prompt tailored to whether it has a structured dimension document or is context-emergent.

### Structured Dimension Agent Prompt (for agents with a Tier 3 dimension document)

```
You are a code reviewer specializing in [DIMENSION_NAME].

CONTEXT:
[Context layer — intent, summary, commit range]

YOUR REVIEW LENS:
You are reviewing specifically for [DIMENSION_NAME] concerns.

MANDATORY: Read this file FIRST before reviewing any code:
  skills/CodeReview/Dimensions/[CATEGORY]/[DIMENSION].md

This file contains:
- Your mental model for this review dimension
- Specific detection heuristics ordered by severity
- Severity calibration specific to this dimension
- Language-specific notes for the languages in this diff
- Good vs. bad examples

Work through EVERY heuristic in the document systematically.
For each heuristic, check every file in the diff. Do not skip heuristics.
Do not use generic phrasing — cite the specific heuristic that triggered each finding.

DIFF (your domain only):
[Filtered diff]

COMMIT RANGE: [SHA..SHA]
IMPORTANT: Only flag issues that exist in lines introduced in this commit range.
Do not flag pre-existing issues in surrounding context lines.

SCOPE CONSTRAINTS (from SkillIntent — enforce these):
- Do NOT flag linter-catchable issues (assume linters run in CI)
- Do NOT suggest test generation (note missing coverage, but don't write tests)
- Minimize style nitpicks — only surface if they create bugs or maintainability problems

OUTPUT FORMAT:
For each issue found:
- Severity: [from the dimension document's calibration]
- File: [filename]
- Line: [line number or range]
- Heuristic: [which specific heuristic from the dimension document was triggered]
- Issue: [1-2 sentence description]
- Recommendation: [specific fix, not vague]
```

**Architecture agents (A1, A4) receive additional context:**
- `file_list`: all files in affected modules (not just changed files) from GatherContext
- `module_map`: directory tree showing the module structure from GatherContext

This enables evaluating dependency direction, boundary violations, and import patterns across the module — not just within changed lines.

### Context-Emergent Agent Prompt (for agents without a dimension document)

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

SCOPE CONSTRAINTS (from SkillIntent — enforce these):
- Do NOT flag linter-catchable issues (assume linters run in CI)
- Do NOT suggest test generation (note missing coverage, but don't write tests)
- Minimize style nitpicks — only surface if they create bugs or maintainability problems

OUTPUT FORMAT:
For each issue found:
- Severity: [CRITICAL / HIGH / MEDIUM / LOW / SUGGESTION]
- File: [filename]
- Line: [line number or range]
- Commit: [which commit introduced this line — verify with git blame]
- Issue: [1-2 sentence description]
- Recommendation: [what to do about it]
```

### Audit Mode Agent Prompt (for codebase audits without a diff)

Used when `mode: audit` — agents review the full file set of the target, not a filtered diff.

**Structured Dimension Audit Agent:**
```
You are a code auditor specializing in [DIMENSION_NAME].

CONTEXT:
[Context layer — target path, scope summary, intent]

YOUR AUDIT LENS:
You are auditing specifically for [DIMENSION_NAME] concerns across the target codebase.

MANDATORY: Read this file FIRST before reviewing any code:
  skills/CodeReview/Dimensions/[CATEGORY]/[DIMENSION].md

This file contains:
- Your mental model for this audit dimension
- Specific detection heuristics ordered by severity
- Severity calibration specific to this dimension
- Language-specific notes for the languages in this target
- Good vs. bad examples

Work through EVERY heuristic in the document systematically.
For each heuristic, check every file in the target. Do not skip heuristics.
Do not use generic phrasing — cite the specific heuristic that triggered each finding.

TARGET FILES:
[Full file list — all files in the audit target]

SCOPE CONSTRAINTS:
- Do NOT flag linter-catchable issues (assume linters run in CI)
- Do NOT suggest test generation (note missing coverage, but don't write tests)
- Minimize style nitpicks — only surface if they create bugs or maintainability problems

OUTPUT FORMAT:
For each issue found:
- Severity: [from the dimension document's calibration]
- File: [filename]
- Line: [line number or range]
- Heuristic: [which specific heuristic from the dimension document was triggered]
- Issue: [1-2 sentence description]
- Recommendation: [specific fix, not vague]
```

**Context-Emergent Audit Agent:**
```
You are a [DOMAIN] code auditor.

CONTEXT:
[Context layer — target path, scope summary, intent]

YOUR LENS:
You are auditing specifically for [DOMAIN] concerns: [specific focus areas from skill].
Do NOT audit general correctness — a separate agent handles that.

TARGET FILES:
[Full file list — only files relevant to this agent's domain]

SCOPE CONSTRAINTS:
- Do NOT flag linter-catchable issues (assume linters run in CI)
- Do NOT suggest test generation (note missing coverage, but don't write tests)
- Minimize style nitpicks — only surface if they create bugs or maintainability problems

OUTPUT FORMAT:
For each issue found:
- Severity: [CRITICAL / HIGH / MEDIUM / LOW / SUGGESTION]
- File: [filename]
- Line: [line number or range]
- Issue: [1-2 sentence description]
- Recommendation: [what to do about it]
```

## Step 5: Announce and Launch Agents in Parallel

**MANDATORY announcement before spawning (makes proportionality visible):**
```
Change size: [TIER] ([N] lines) → spawning [N] agents: [domain1], [domain2], ...
Structured dimensions: [list dimension IDs, e.g., A5, S4, A1]
Context-emergent: [list context dimensions, e.g., TypeScript, General correctness]
```

Spawn all agents simultaneously using `run_in_background: true`.

Each agent:
- Structured dimension agents: Read their dimension document first, then apply heuristics to the diff
- Context-emergent agents: Apply their injected knowledge to the relevant diff sections
- All agents: Return structured findings

```
# Launch in parallel — do not wait for one before starting the next
Agent 1: General correctness → background
Agent 2: S4 Complexity Reduction → background
Agent 3: A5 Design Intent Clarity → background
Agent 4: TypeScript → background
...
```

Output a status message so the user knows what's running:
```
Launching [N] review agents:
✓ General correctness agent — started
✓ S4 Complexity Reduction agent — started (reading ComplexityReduction.md)
✓ A5 Design Intent Clarity agent — started (reading DesignIntent.md)
✓ TypeScript agent — started
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
