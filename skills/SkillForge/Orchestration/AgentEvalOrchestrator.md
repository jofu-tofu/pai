# AgentEvalOrchestrator

> **Internal workflow** — invoked by AuditSkill and author workflows via WorkflowChains.
> Do not add to SKILL.md routing table. Not user-invocable.

## Purpose

Single quality gate that fans out skill evaluation to focused agents. Each agent receives one evaluation dimension's rubric plus the `ExploreSkill.ts` command to run. Agents run the script themselves as their first action, getting the complete skill snapshot (file tree, contents, routing analysis, validation results) directly in their own context. The orchestrator only coordinates and aggregates — it never evaluates deeply itself.

## Modes

| Mode | When | Dimension Selection |
|------|------|---------------------|
| **full** | Called by AuditSkill, ImproveSkill | All 7 dimensions, no exceptions |
| **scoped** | Called by author workflows after mutations | Intelligently select relevant dimensions based on change context |

## Inputs

- **Target skill path** — the skill directory to evaluate (e.g., `$PAI_DIR/skills/Research/`)
- **Mode** — `full` or `scoped`
- **Change context** (scoped mode only) — what was modified: files changed, type of change (description edit, workflow add/remove, restructure, content change)

---

## Steps

### Step 1: Identify Target Skill

Resolve the target skill name (e.g., `Research`). Verify the skill directory exists. Do NOT run `ExploreSkill.ts` yourself — each agent will run it independently as their first action.

Record:
- **Skill name** — directory name (e.g., `Research`)
- **Explore command** — `bun run $PAI_DIR/skills/SkillForge/Tools/ExploreSkill.ts <SkillName>`

### Step 2: Load Rubrics

Read all `.md` files from `Orchestration/Rubrics/` directory:
- `FirstPrinciples.md`
- `StructuralIntegrity.md`
- `RoutingHealth.md`
- `BehavioralResilience.md`
- `ContentCoherence.md`
- `InvocationCoverage.md`
- `PromptQuality.md`

Each file is one evaluation dimension with a `## Focus`, `## Reference Material`, and `## Rubric` table.

### Step 3: Select Dimensions

**Full mode:** Select all 7 rubrics. No filtering.

**Scoped mode:** Examine the change context and each rubric's `## Focus` statement. Select only dimensions whose evaluation criteria could be affected by the changes. Document selection reasoning.

Scoped selection guidance:

| Change Type | Relevant Dimensions |
|---|---|
| Description/trigger edit | PromptQuality, RoutingHealth |
| Workflow add/remove | StructuralIntegrity, RoutingHealth, InvocationCoverage |
| Content rewrite | ContentCoherence, PromptQuality, FirstPrinciples |
| File restructure | StructuralIntegrity, RoutingHealth, InvocationCoverage |
| Major restructure (broad changes) | All 7 — escalate scoped to full |
| New skill created | All 7 — new skills need comprehensive check |
| SkillIntent modification | FirstPrinciples, ContentCoherence, BehavioralResilience |

Output:
```
MODE: [full/scoped]
CHANGE CONTEXT: [description of changes, if scoped]
SELECTED DIMENSIONS: [list with reasoning]
AGENT COUNT: [N]
```

### Step 4: Prepare Agent Prompts

For each selected rubric, construct an agent prompt containing:

1. **Role instruction:** "You are a focused skill quality evaluator. Your FIRST action must be to run the ExploreSkill command below to get a complete skill snapshot. Then evaluate against the rubric using the snapshot as evidence. Do not suggest fixes — report findings only."
2. **Explore command:** `bun run $PAI_DIR/skills/SkillForge/Tools/ExploreSkill.ts <SkillName>` — agent runs this via Bash as its first action
3. **Rubric content:** The full rubric file (Focus, Reference Material, Rubric table)
4. **Output format instructions:** See Agent Output Format section below
5. **Time budget:** "Complete evaluation within 60 seconds."

Each agent runs the script itself (~2 seconds), getting the complete skill snapshot directly in its own context — file tree, naming audit, routing table with existence checks, trigger extraction, ValidateSkill output, and all file contents. The orchestrator never needs to hold or copy the snapshot.

### Step 5: Dispatch Agents

Spawn one agent per selected dimension using the Task tool with `run_in_background: true`. All agents run in parallel.

```
For each selected rubric:
  Task(
    subagent_type: "general-purpose",
    prompt: [constructed prompt from Step 4],
    run_in_background: true,
    description: "Eval: {dimension name}"
  )
```

**Fallback:** If parallel dispatch is unavailable or fails, run agents sequentially with isolated prompts. Each agent still receives the same prompt — only execution order changes.

### Step 6: Collect Results

Wait for all agents to complete. For each agent:
- Parse the structured output (see Agent Output Format)
- Extract per-criterion PASS/WARN/FAIL ratings with evidence
- If an agent timed out or returned malformed output, record as ERROR with raw response

```
COLLECTION RESULTS:
  FirstPrinciples:       [COMPLETE / ERROR]
  StructuralIntegrity:   [COMPLETE / ERROR]
  RoutingHealth:         [COMPLETE / ERROR]
  BehavioralResilience:  [COMPLETE / ERROR]
  ContentCoherence:      [COMPLETE / ERROR]
  InvocationCoverage:    [COMPLETE / ERROR]
  PromptQuality:         [COMPLETE / ERROR]
  Agents completed: [N/M]
```

### Step 7: Cross-Dimension Synthesis

**Full mode only.** Skip in scoped mode.

Compare findings across dimensions to identify compound patterns:
- Do multiple dimensions flag the same file or section?
- Do structural issues (SI) explain routing failures (RH)?
- Do content coherence gaps (CC) trace back to first principles drift (FP)?
- Do invocation coverage gaps (IC) correlate with prompt quality issues (PQ)?

Output compound findings if any patterns emerge.

### Step 8: Return Composite

Assemble and return the composite report to the calling workflow. Do not present directly to the user — the caller (AuditSkill, ImproveSkill, or author workflow) decides how to present.

```
## Agent Evaluation Composite — {Skill Name}

### Summary
| Dimension | Overall | Critical | Warnings |
|---|---|---|---|
| First Principles | PASS/WARN/FAIL | N | N |
| Structural Integrity | PASS/WARN/FAIL | N | N |
| Routing Health | PASS/WARN/FAIL | N | N |
| Behavioral Resilience | PASS/WARN/FAIL | N | N |
| Content Coherence | PASS/WARN/FAIL | N | N |
| Invocation Coverage | PASS/WARN/FAIL | N | N |
| Prompt Quality | PASS/WARN/FAIL | N | N |

### Per-Dimension Findings
[Full agent output per dimension]

### Cross-Dimension Patterns (full mode only)
[Compound findings, or "No cross-dimension patterns found"]

### Errors
[Agent failures/timeouts, or "None — all agents completed"]
```

---

## Agent Output Format

Each agent returns findings in this format:

```
DIMENSION: {name}
SKILL: {skill_name}

FINDINGS:
{PREFIX}-1: {criterion_name}
Rating: PASS|WARN|FAIL
Evidence: {file_path:section}
Detail: {1-2 sentences}

{PREFIX}-2: {criterion_name}
Rating: PASS|WARN|FAIL
Evidence: {file_path:section}
Detail: {1-2 sentences}

[...continue for all criteria in the rubric]

DIMENSION SUMMARY:
Overall: PASS|WARN|FAIL
Critical: {N} | Warnings: {N}
Top issue: {1 line or "None"}
```

The PREFIX matches the rubric file's prefix (FP, SI, RH, BR, CC, IC, PQ).

---

## Error Handling

- **Agent timeout:** Record dimension as ERROR. Include partial output if available. 6/7 dimensions completing is still valuable.
- **Malformed output:** Record dimension as ERROR with raw agent response. Do not attempt to parse.
- **All agents fail:** Return error composite indicating system-level failure. Do not return empty report.

## Token Budget Assumption

Agent prompts are lean — each receives a rubric (~1-2K tokens) plus the `ExploreSkill.ts` command (~100 tokens). Each agent runs the script itself via Bash (~2 seconds), getting the full snapshot directly in its own context. The orchestrator prompt stays small — no need to hold or copy the snapshot. Total orchestrator prompt: 7 agents × ~3K each = ~21K tokens. Each agent independently loads ~10-30K of snapshot data via its own Bash call.
