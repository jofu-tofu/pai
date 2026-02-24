# DelegateAgents Workflow

> Internal workflow — invoked by Review.md, not user-facing.

Read the context layer from GatherContext, load structured review dimensions, construct review dimensions from the full context, then launch one subagent per dimension in parallel.

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

Discover all dimension categories by reading every INDEX.md file found under `skills/CodeReview/Dimensions/*/INDEX.md` (glob pattern from repo root).

Use the Glob tool: `skills/CodeReview/Dimensions/*/INDEX.md`

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
- A lens name (e.g., "Complexity Reduction [S4]", "TypeScript + CodingStandards", "Boundary Errors [B1]")
- For structured dimensions: the file path to the dimension document (repo-root-relative)
- For context-emergent dimensions: the specific knowledge/rules to inject into the agent prompt
- Which files from the diff are relevant to this dimension

**Always include at minimum:**
- Baseline structured dimensions: A5 (Design Intent Clarity), S4 (Complexity Reduction), D3 (Assumption Audit), B1 (Boundary Errors), and B2 (Logic Errors)

**Constraint:** Every context signal must map to at least one dimension. No signal — especially a user-requested lens — should be silently dropped.

## Step 2.5: Dimension Selection Audit

> Audit prints HERE (before spawning) so the user sees reasoning before agents launch. Step 5 prints DURING spawning for progress. Do not merge — they serve different UX purposes.

After constructing dimensions (Step 2) and before determining agent count (Step 3), **print a Dimension Selection Audit to chat.** This uses only data already gathered in Steps 1, 1.5, and 2 — no new tool calls.

> NEVER hardcode dimension IDs in this audit template. IDs are canonical in Dimensions/*/INDEX.md and discovered dynamically via Step 1.5 glob. Hardcoding breaks auto-discovery of new dimensions.

**The audit MUST list every dimension from every INDEX.md file discovered in Step 1.5**, with a disposition (ACTIVATE or SKIP) and the specific context signal that caused the match or non-match. Every context-emergent dimension must list the signal that triggered it and the files routed to it. No dimension — structured or emergent — can be silently evaluated.

**Output — Subsection 1: Structured Dimension Scan (all dimensions from discovered INDEX.md files):**

```
📐 DIMENSION SELECTION AUDIT

━━━ Structured Dimensions (from INDEX.md files) ━━━

| ID | Dimension | Status | Reason | Files |
|----|-----------|--------|--------|-------|
| A1 | Modularity & Boundaries | ACTIVATE | Diff spans 4 directories (trigger: 3+) | src/auth/, src/api/, lib/core/ |
| A2 | Modifiability & Extensibility | SKIP | No new interfaces, no refactor signal | — |
| A3 | Consistency & Conventions | ACTIVATE | Diff spans 2+ modules | src/auth/login.ts, src/api/routes.ts |
| A4 | Dependency Health | ACTIVATE | Import statements changed + 4 directories | src/auth/login.ts, lib/core/deps.ts |
| A5 | Design Intent Clarity | ACTIVATE | Always-on baseline | [all changed files] |
| S1 | Bloat Detection | ACTIVATE | 187 lines changed (trigger: >50) | [all changed files] |
| S2 | Coupling Analysis | ACTIVATE | 2+ modules + import changes | src/auth/, src/api/ |
| S3 | Dispensability Scan | ACTIVATE | 187 lines (trigger: >100) | [all changed files] |
| S4 | Complexity Reduction | ACTIVATE | Always-on baseline | [all changed files] |
| S5 | Change Resistance | SKIP | 2 directories (trigger: 3+) | — |
| D1 | Placement Validity | ACTIVATE | New files created | src/auth/middleware.ts (new) |
| D2 | Architectural Trajectory | ACTIVATE | New files + 187 lines (trigger: >150) | [all changed files] |
| D3 | Assumption Audit | ACTIVATE | Always-on baseline | [all changed files] |

Activated: 11/13 | Skipped: 2/13
```

**The table above is an example. The actual table must include every dimension from every INDEX.md file discovered in Step 1.5 — the IDs, names, and count will vary based on what INDEX.md files exist at review time.**

**Output — Subsection 2: Context-Emergent Dimensions (from context signals, not INDEX.md):**

```
━━━ Context-Emergent Dimensions ━━━

- General correctness — mandatory baseline (always included) → [all changed files]
- TypeScript correctness — fingerprint: 12 .ts files in diff → [list of .ts files]
- CodingStandards/TypeScript — user-requested lens: /CodingStandards → [list of .ts files]
```

**Each context-emergent dimension must state: the dimension name, the specific context signal that triggered it, and the files routed to it.**

**Output — Subsection 3: Summary:**

```
Total dimensions: 14 (11 structured + 3 context-emergent)
```

## Step 2.75: Sizing Rationale

**Before determining agent count in Step 3, print the sizing rationale.** This explains WHY the review is Small/Medium/Large so the agent count decision flows naturally from it. Uses only data from Step 1 — no new tool calls.

**The rationale must cite the specific threshold that determined the tier and explain why complexity modifiers did or did not apply.**

**Output (diff mode):**

```
📏 SIZING RATIONALE

Mode: diff
Metric: lines changed
Value: 187 lines (+142/-45)
Tier: MEDIUM (threshold: 50-300 lines)
Agent cap: 8

Why Medium: 187 lines exceeds the Small threshold (50) but falls below Large (300).
  No complexity modifiers apply (single language, no generated code mix).
```

**Output (audit mode):**

```
📏 SIZING RATIONALE

Mode: audit
Metric: target file count + structural complexity
Value: 34 files across 3 directories
Tier: MEDIUM (threshold: 10-50 files, 2-4 modules)
Agent cap: 8

Why Medium: 34 files across 3 modules. No complexity upgrade triggered
  (single language, no deep dependency chains, no generated code).
```

## Step 3: Determine Agent Count

Each dimension becomes one agent. Scale with **review target size and complexity** — the metric depends on review mode:

**Diff mode** — size measured by lines changed:

| Size Tier | Lines Changed | Max Agents | Strategy |
|-----------|--------------|------------|----------|
| Small | 1-50 lines | 5 | Baselines (A5, S4, D3, B1, B2) |
| Medium | 50-300 lines | 8 | General + baselines + language + domain-specific |
| Large | 300+ lines | 12 | General + full dimensional coverage across all activated categories |

**Audit mode** — size measured by target file count and structural complexity:

| Size Tier | Target Scope | Max Agents | Strategy |
|-----------|-------------|------------|----------|
| Small | 1-10 files, single module | 5 | Baselines (A5, S4, D3, B1, B2) |
| Medium | 10-50 files, 2-4 modules | 8 | General + baselines + per-language + per-domain |
| Large | 50+ files, 5+ modules or deep nesting | 12 | General + full dimensional coverage across all activated categories |

**Complexity modifiers (audit mode):** Upgrade size tier by one level when:
- Target contains 3+ languages
- Target has deep dependency chains (imports spanning 4+ directories)
- Target includes generated code, config files, AND application code together

When activated dimensions exceed the agent cap for the size tier, prioritize:
1. Baseline dimensions: A5, S4, D3, B1, B2 (always)
2. Dimensions whose trigger conditions matched most strongly
3. User-requested lenses (never drop these)

**After determining agent count, print the Agent Allocation to chat.** The category breakdown MUST be generated dynamically from the dimension categories discovered in Step 1.5 (each `Dimensions/*/INDEX.md` directory is one category) plus a "Context-emergent" group. Do NOT hardcode category names — new categories added as `Dimensions/NewCategory/INDEX.md` must auto-appear.

**Output — Agent Allocation:**

```
🔢 AGENT ALLOCATION

Category breakdown (from discovered INDEX.md categories + context-emergent):
  Architecture: 4 agents (A1, A3, A4, A5) — multi-module change with import modifications
    A1 → src/auth/, src/api/, lib/core/ (module boundary analysis)
    A3 → src/auth/login.ts, src/api/routes.ts (cross-module consistency)
    A4 → src/auth/login.ts, lib/core/deps.ts (import graph)
    A5 → all changed files (design intent baseline)
  Simplification: 3 agents (S1, S3, S4) — medium+ change size
    S1 → all changed files (bloat scan)
    S3 → all changed files (dispensability)
    S4 → all changed files (complexity baseline)
  Strategic: 3 agents (D1, D2, D3) — new files + substantial size
    D1 → src/auth/middleware.ts (placement check)
    D2 → all changed files (trajectory)
    D3 → all changed files (assumption baseline)
  Context-emergent: 3 agents
    General correctness → all changed files
    TypeScript → 12 .ts files
    CodingStandards/TS → 12 .ts files

Total requesting: 13 agents | Cap: 8
```

**The example above is illustrative. The actual output must use the category names from discovered INDEX.md directories and the dimensions activated in Step 2.5. Per-agent lines show dimension→files mapping (the "which files" field from Step 2 output).**

**Conditional overflow output (only when activated dimensions exceed the agent cap):**

```
⚠️ CAP OVERFLOW: 13 dimensions activated, cap is 8.
Prioritization applied (per Step 3 rules):
  1. General correctness (always) ✓
  2. Baselines A5, S4, D3, B1, B2 (always) ✓ ✓ ✓ ✓ ✓
  3. User-requested: CodingStandards/TS ✓
  4. Strongest triggers: A1 (4 dirs), A4 (imports changed) ✓ ✓
  DEFERRED: S1 (weaker trigger), S3 (weaker trigger), A3 (partial), D2 (covered by D3 baseline)
  Rule applied: baselines → user lenses → strongest trigger match

Final allocation: 8 agents
```

**This overflow block prints ONLY when the total requesting count exceeds the cap. When dimensions fit within the cap, skip this block entirely.**

## Step 4: Construct Agent Prompts

Each agent receives a prompt tailored to whether it has a structured dimension document or is context-emergent.

### Structured Dimension Agent Prompt (for agents with a Tier 3 dimension document)

```markdown
# [DIMENSION_NAME] Review

## Context
[Context layer — intent, summary, commit range]

## Your Lens
Review specifically for [DIMENSION_NAME] concerns.

## Dimension Rules
First, read this file — it contains your detection heuristics, severity calibration, and examples:
  [REPO_ROOT]/skills/CodeReview/Dimensions/[CATEGORY]/[DIMENSION].md

Work through every heuristic in the document systematically. For each heuristic, check every file in the diff. Cite the specific heuristic that triggered each finding — generic phrasing is not useful.

[IF CODINGSTANDARDS LENS REQUESTED — append this block:]
## Additional Standards
Read the relevant CodingStandards rules for this language:
  [REPO_ROOT]/skills/CodingStandards/Dimensions/[LANGUAGE]/INDEX.md
Then read the dimension files listed in that INDEX that are relevant to your review.
Available languages: React, TypeScript, Svelte, Tailwind, Python, CSharp, Rust

## Diff
[Filtered diff — your domain only]

## Commit Range
[SHA..SHA]
Flag only issues in lines introduced within this commit range. Pre-existing issues erode review credibility — skip them silently.

## Scope
- Focus on issues that affect correctness, security, or maintainability
- Assume linters run in CI — skip lint-catchable issues
- Note missing test coverage as a finding, but leave test generation to the developer
- Surface style concerns only when they create bugs or maintainability problems

## Output Format
For each issue found:
- Severity: [from the dimension document's calibration]
- File: [filename]
- Line: [line number or range]
- Heuristic: [which specific heuristic from the dimension document was triggered]
- Issue: [1-2 sentence description]
- Recommendation: [specific fix]
```

**Architecture agents (A1, A4) receive additional context:**
- `file_list`: all files in affected modules (not just changed files) from GatherContext
- `module_map`: directory tree showing the module structure from GatherContext

This enables evaluating dependency direction, boundary violations, and import patterns across the module — not just within changed lines.

### Context-Emergent Agent Prompt (for agents without a dimension document)

For language-specific agents where CodingStandards rules exist, inject the relevant filepath:

```markdown
# [DOMAIN] Review

## Context
[Context layer — intent, summary, commit range]

## Your Lens
Review specifically for [DOMAIN] concerns: [specific focus areas from skill].
A separate subagent handles general correctness — stay focused on your domain.

[IF THIS IS A LANGUAGE-SPECIFIC AGENT WITH CODINGSTANDARDS COVERAGE — append:]
## Coding Standards
First, read the relevant coding standards for this language:
  [REPO_ROOT]/skills/CodingStandards/Dimensions/[LANGUAGE]/INDEX.md
Then read each dimension file listed in the INDEX that is relevant to your review.

Available CodingStandards languages and their INDEX paths:
  - React:      skills/CodingStandards/Dimensions/React/INDEX.md
  - TypeScript:  skills/CodingStandards/Dimensions/TypeScript/INDEX.md
  - Svelte:      skills/CodingStandards/Dimensions/Svelte/INDEX.md
  - Tailwind:    skills/CodingStandards/Dimensions/Tailwind/INDEX.md
  - Python:      skills/CodingStandards/Dimensions/Python/INDEX.md
  - CSharp:      skills/CodingStandards/Dimensions/CSharp/INDEX.md
  - Rust:        skills/CodingStandards/Rules/Rust/ (individual rule files)

## Diff
[Filtered diff — only files relevant to this agent's domain]

## Commit Range
[SHA..SHA]
Flag only issues in lines introduced within this commit range. Pre-existing issues erode review credibility — skip them silently.

## Scope
- Focus on issues that affect correctness, security, or maintainability
- Assume linters run in CI — skip lint-catchable issues
- Note missing test coverage as a finding, but leave test generation to the developer
- Surface style concerns only when they create bugs or maintainability problems

## Output Format
For each issue found:
- Severity: CRITICAL / HIGH / MEDIUM / LOW / SUGGESTION
- File: [filename]
- Line: [line number or range]
- Commit: [which commit introduced this line — verify with git blame]
- Issue: [1-2 sentence description]
- Recommendation: [what to do about it]
```

### Audit Mode Agent Prompt (for codebase audits without a diff)

Used when `mode: audit` — agents review the full file set of the target, not a filtered diff.

**Structured Dimension Audit Agent:**
```markdown
# [DIMENSION_NAME] Audit

## Context
[Context layer — target path, scope summary, intent]

## Your Lens
Audit specifically for [DIMENSION_NAME] concerns across the target codebase.

## Dimension Rules
First, read this file — it contains your detection heuristics, severity calibration, and examples:
  [REPO_ROOT]/skills/CodeReview/Dimensions/[CATEGORY]/[DIMENSION].md

Work through every heuristic systematically. Cite the specific heuristic that triggered each finding.

[IF CODINGSTANDARDS LENS REQUESTED — append this block:]
## Additional Standards
Read the relevant CodingStandards rules for this language:
  [REPO_ROOT]/skills/CodingStandards/Dimensions/[LANGUAGE]/INDEX.md
Then read the dimension files listed in that INDEX that are relevant to your audit.

## Target Files
[Full file list — all files in the audit target]

## Scope
- Focus on issues that affect correctness, security, or maintainability
- Assume linters run in CI — skip lint-catchable issues
- Note missing test coverage as a finding, but leave test generation to the developer
- Surface style concerns only when they create bugs or maintainability problems

## Output Format
For each issue found:
- Severity: [from the dimension document's calibration]
- File: [filename]
- Line: [line number or range]
- Heuristic: [which specific heuristic from the dimension document was triggered]
- Issue: [1-2 sentence description]
- Recommendation: [specific fix]
```

**Context-Emergent Audit Agent:**
```markdown
# [DOMAIN] Audit

## Context
[Context layer — target path, scope summary, intent]

## Your Lens
Audit specifically for [DOMAIN] concerns: [specific focus areas from skill].
A separate subagent handles general correctness — stay focused on your domain.

## Target Files
[Full file list — only files relevant to this agent's domain]

## Scope
- Focus on issues that affect correctness, security, or maintainability
- Assume linters run in CI — skip lint-catchable issues
- Note missing test coverage as a finding, but leave test generation to the developer
- Surface style concerns only when they create bugs or maintainability problems

## Output Format
For each issue found:
- Severity: CRITICAL / HIGH / MEDIUM / LOW / SUGGESTION
- File: [filename]
- Line: [line number or range]
- Issue: [1-2 sentence description]
- Recommendation: [what to do about it]
```

## Step 5: Announce and Launch Agents in Parallel

**(Dimension Selection Audit, Sizing Rationale, and Agent Allocation already printed above — see Steps 2.5, 2.75, and 3.)**

**Announce before spawning (makes proportionality visible to the user):**
```
Change size: [TIER] ([N] lines) → spawning [N] agents: [domain1], [domain2], ...
Structured dimensions: [list dimension IDs, e.g., A5, S4, A1]
Context-emergent: [list context dimensions, e.g., TypeScript, React patterns]
```

**Spawning subagents:**

Each review dimension becomes one subagent. Spawn all subagents in parallel (not sequential) with `run_in_background: true`. Each receives the constructed prompt from Step 4.

**`[REPO_ROOT]` resolution:** Before constructing prompts, resolve the repo root path via `git rev-parse --show-toplevel` or the current working directory. Replace all `[REPO_ROOT]` placeholders with this absolute path.

**Concrete example — 6 subagents for a medium TypeScript diff review:**

```
Subagent 1: B1 Boundary Errors (structured dimension — baseline)
  description: "B1 Boundary Errors review"
  background: true
  prompt: [see Structured Dimension prompt — reads BoundaryErrors.md]

Subagent 2: B2 Logic Errors (structured dimension — baseline)
  description: "B2 Logic Errors review"
  background: true
  prompt: [see Structured Dimension prompt — reads LogicErrors.md]

Subagent 3: S4 Complexity Reduction (structured dimension — baseline)
  description: "S4 Complexity Reduction review"
  background: true
  prompt: [see Structured Dimension prompt — reads ComplexityReduction.md]

Subagent 4: A5 Design Intent Clarity (structured dimension — baseline)
  description: "A5 Design Intent review"
  background: true
  prompt: [see Structured Dimension prompt — reads DesignIntent.md]

Subagent 5: D3 Assumption Audit (structured dimension — baseline)
  description: "D3 Assumption Audit review"
  background: true
  prompt: [see Structured Dimension prompt — reads AssumptionAudit.md]

Subagent 6: TypeScript + CodingStandards (context-emergent with lens)
  description: "TypeScript standards review"
  background: true
  prompt: [see Context-Emergent prompt — reads CodingStandards/TypeScript/INDEX.md]
```

B1 (Boundary Errors) and B2 (Logic Errors) use the Structured Dimension Agent Prompt template above — no separate general correctness prompt is needed. They read their dimension documents at `Dimensions/Behavioral/BoundaryErrors.md` and `Dimensions/Behavioral/LogicErrors.md` respectively.

**Example Structured Dimension subagent prompt (fully populated):**

```markdown
# Complexity Reduction Review [S4]

## Context
[paste context layer summary here]

## Your Lens
Review specifically for Complexity Reduction concerns.

## Dimension Rules
First, read this file — it contains your detection heuristics, severity calibration, and examples:
  [REPO_ROOT]/skills/CodeReview/Dimensions/Simplification/ComplexityReduction.md

Work through every heuristic systematically. Cite the specific heuristic that triggered each finding.

## Diff
[paste filtered diff here]

## Commit Range
abc1234..def5678
Flag only issues in lines introduced within this commit range.

## Output Format
For each issue found:
- Severity: [from the dimension document's calibration]
- File: [filename]
- Line: [line number or range]
- Heuristic: [which specific heuristic was triggered]
- Issue: [1-2 sentence description]
- Recommendation: [specific fix]
```

**Key rules for subagent spawning:**
1. **All subagents launch in parallel** — one message, multiple spawns, not sequential
2. **All subagents run in background** — non-blocking parallel execution
3. **Every structured dimension prompt includes the absolute path** to its dimension document
4. **Every language-specific prompt includes the CodingStandards path** when that lens was requested
5. **Collect outputs** from each subagent's result when all complete

Output a status message so the user knows what's running:
```
Launching [N] review agents:
✓ B1 Boundary Errors agent — started (will read BoundaryErrors.md)
✓ B2 Logic Errors agent — started (will read LogicErrors.md)
✓ S4 Complexity Reduction agent — started (will read ComplexityReduction.md)
✓ A5 Design Intent Clarity agent — started (will read DesignIntent.md)
✓ D3 Assumption Audit agent — started (will read AssumptionAudit.md)
✓ TypeScript agent — started (will read CodingStandards/TypeScript/INDEX.md)
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
