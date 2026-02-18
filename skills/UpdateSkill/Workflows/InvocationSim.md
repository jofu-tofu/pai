# InvocationSim Workflow

> **Trigger:** "invocation sim", "simulate invocations", "test routing", "routing audit", "usage simulation", "trigger coverage", "coverage test", "what invocations work", "does this skill route correctly"

## Reference Material

- **Workflow Chains:** `../WorkflowChains.md` — Check Follow-Up section after completing this workflow

## Purpose

Simulate the full space of realistic user invocations for a target skill across **three layers**:

- **Layer 1** — Skill-level routing: does the right workflow trigger from the user's prompt?
- **Layer 2** — Workflow-level routing: once inside the workflow, does the agent navigate its internal branches, modes, and parameter requirements correctly?
- **Layer 3** — Content-chain enforcement: when a workflow reads a reference file (SkillIntent.md, PromptingStandards.md, etc.), does the agent actually apply its rules correctly — and do all workflows that should read a context file actually reference it?

Surfaces dead routes (workflows with no realistic path in), coverage gaps (invocations that fall through), depth gaps (internal paths the agent can't navigate given the user's prompt), and enforcement gaps (rules from reference files that get read but not applied).

This is the first-principles quality test for any skill: if you can't enumerate how it will be used and verify each routing layer is sound, the skill is unproven.

## When to Run

- After creating or significantly modifying a skill
- When users report a skill "not working" or "not triggering"
- As part of a periodic quality review
- After adding new workflows to check for routing conflicts

---

## Workflow Steps

### Step 1: Load Target Skill

Read the target skill's SKILL.md fully. Extract:
- **Frontmatter description** (the USE WHEN clause — this is the primary routing signal)
- **Workflow Routing table** (workflow names, triggers, file paths)
- **Context Files** (what supporting material the agent can access)
- **Examples section** (what invocations the skill author expected)

```
TARGET SKILL: [SkillName]
WORKFLOWS: [list from routing table]
TRIGGER PHRASES: [all phrases from routing table]
CONTEXT FILES: [list]
```

### Step 2: Generate Invocation Scenarios

Generate at minimum 20 scenarios across ALL categories below. More is better. Real coverage requires uncomfortable scenarios — adversarial, ambiguous, and out-of-scope.

#### Category A: Direct / Obvious (should trivially route)
These map cleanly to trigger phrases. If ANY of these fail, the skill has a critical problem.

Scenarios to generate:
1. Each trigger phrase from the routing table used verbatim
2. "Use [SkillName] to [workflow action]"
3. "Run [workflow name] on [skill]"

#### Category B: Action-Verb Variants (trigger phrase coverage)
Users rarely say the exact trigger phrase. Test synonym coverage.

Scenarios to generate per workflow:
4. Replace trigger verb with: improve / enhance / clean up / fix / tweak / update / edit / modify / adjust / change / rework
5. "I want to [action] the [target skill]'s [component]"
6. Passive forms: "the [component] needs to be [action]ed"

#### Category C: Problem-Statement Invocations (diagnostic scenarios)
Users often describe symptoms, not operations.

Scenarios to generate:
7. "The [SkillName] skill isn't triggering correctly"
8. "The [workflow] workflow isn't working"
9. "Something's wrong with how [skill] handles [scenario]"
10. "Users are confused by [skill]'s output"
11. "The [skill] isn't doing what I expected"

#### Category D: Ambiguous / Vague (routing stress)
These reveal whether skill routing is brittle or robust.

Scenarios to generate:
12. "Make [skill] better"
13. "Improve [skill]"
14. "The [skill] needs work"
15. "Look at [skill] and tell me what's wrong"
16. "Can you help with [skill]?"

#### Category E: Scope Creep (out-of-scope detection)
These should NOT route to this skill (or this workflow) at all. If they do, the triggers are too broad.

Scenarios to generate:
17. "Create a new skill for [domain]" → should go to CreateSkill, not UpdateSkill
18. "Delete the entire [skill]" → dangerous — should confirm and potentially block
19. "Build a workflow from scratch" → CreateSkill territory
20. "[SkillName]-specific cross-skill question" → out of scope

#### Category F: Meta / Self-Referential
21. "Update the UpdateSkill skill" (recursive case)
22. "Add a workflow to the skill we're currently editing"
23. "Validate the skill that handles skill validation"

#### Category G: Workflow-Specific Direct Calls
For each workflow in the routing table, generate:
24. "Run [WorkflowName] on [SkillName]"
25. "Do a [WorkflowName] for [SkillName]"
26. "[WorkflowName] the [SkillName] skill"

#### Category H: Synonym / Near-Miss Triggers
27. "validate" vs "verify" vs "check" vs "audit" vs "inspect"
28. "retrospective" vs "review" vs "analyze performance" vs "look back on"
29. "decompose" vs "break down" vs "split" vs "simplify"
30. "refactor" vs "restructure" vs "reorganize" vs "rewrite"

---

### Step 3: Agent Perspective Simulation

For EACH scenario, simulate what the agent actually experiences:

**What the agent sees:**
```
PROMPT: "[scenario text]"

SKILL.md FRONTMATTER:
  description: [USE WHEN clause — this is matched by Claude's skill routing]

ROUTING TABLE:
  [list all workflows and their trigger phrases]

AVAILABLE CONTEXT:
  [list context files]
```

**Routing judgment for this scenario:**

| Question | Answer |
|----------|--------|
| Does the description trigger UpdateSkill at all? | YES / NO / MAYBE |
| Which routing table row best matches this prompt? | [WorkflowName] or NONE |
| Is that the CORRECT workflow for this request? | YES / NO / AMBIGUOUS |
| Does the agent have enough context to execute? | YES / NO / PARTIAL |
| What's missing if context is insufficient? | [list] |

**Routing outcomes:**
- **CORRECT** — Routes to right workflow, agent has context to succeed
- **WRONG_ROUTE** — Routes somewhere, but wrong workflow
- **UNROUTED** — No trigger matches; falls through
- **AMBIGUOUS** — Multiple workflows could match; unclear which wins
- **OUT_OF_SCOPE** — Correctly does NOT trigger (good)
- **OVER_TRIGGER** — Triggers when it shouldn't (bad)

---

### Step 3.5: Skill Shape Detection

Before running depth analysis, classify the target skill's shape. This calibrates how deep the simulation needs to go.

```
BREADTH-HEAVY  — many workflows, simple linear internals
  Indicators:  5+ workflows in routing table; each workflow < 50 lines;
               no named modes, no conditional branches
  Sim focus:   Thorough Layer 1 (horizontal coverage); Layer 2 spot-check on
               2–3 most-used workflows only

DEPTH-HEAVY    — few workflows, complex internals
  Indicators:  Workflows with named modes (quick/standard/extensive),
               conditional branches, multi-phase execution, or sub-file references
  Sim focus:   Standard Layer 1; full Layer 2 for every workflow

HYBRID         — many workflows AND complex internals
  Indicators:  Both above apply (e.g., Research skill, Browser skill)
  Sim focus:   Full Layer 1 AND full Layer 2 — most expensive run
```

```
SKILL SHAPE:    [Breadth-Heavy / Depth-Heavy / Hybrid]
LAYER 1 DEPTH:  [Standard (20 scenarios) / Extended (30+ scenarios)]
LAYER 2 DEPTH:  [None / Spot-check / Full]
LAYER 3 DEPTH:  [None (no context files) / Spot-check / Full]
```

**Layer 3 shape guidance:**
- Skills with 0 context files → Layer 3 = None
- Skills with 1-2 context files → Layer 3 = Spot-check (1 chain per file)
- Skills with 3+ context files or guard/gate patterns → Layer 3 = Full

---

### Step 3b: Layer 2 — Intra-Workflow Depth Analysis

For each workflow that received **CORRECT** routing in Step 3, read its workflow file and simulate navigation within it.

#### 3b.1: Identify Internal Decision Points

Read the workflow file. Extract:

- **Named modes** — Does the workflow offer variants like quick/standard/extensive or similar?
- **Conditional branches** — Steps that say "if X then Y else Z"
- **Required inputs** — Parameters the workflow needs from the user's prompt (skill name, URL, file path, mode selection, etc.) that it won't prompt for
- **Sub-file references** — Does this workflow tell the agent to read other files? Are those reads conditional or always-required?
- **Output variants** — Does the workflow produce meaningfully different outputs depending on input?

```
WORKFLOW: [Name]
Modes found:          [list or "none"]
Conditional branches: [N — list key branch conditions]
Required inputs:      [list — what must the user have specified upfront?]
Sub-file references:  [list with read condition: always / conditional / optional]
Output variants:      [list or "uniform"]
```

If a workflow has zero internal decision points (no modes, no branches, no required params), it is **flat** — Layer 2 is trivially passing; note it and skip to the next.

#### 3b.2: Generate Layer 2 Sub-Scenarios

For each decision point identified in 3b.1, generate sub-scenarios that probe different internal paths:

- **Mode coverage** — One scenario per named mode: "quick research on X" vs "thorough research on X" — does the agent pick the right mode?
- **Missing required input** — What happens if the user didn't specify a required param? Does the workflow prompt for it or silently fail?
- **Branch variation** — At least one scenario per conditional branch to exercise both paths
- **Sub-file navigation** — Would the agent know to read a referenced file? For conditional reads, does the prompt context trigger the condition?

Generate at minimum **3 sub-scenarios per workflow** that has internal decision points.

#### 3b.3: Layer 2 Routing Judgment

For each sub-scenario:

| Sub-Scenario | Workflow | Internal Path | Judgment |
|---|---|---|---|
| "[prompt text]" | [WorkflowName] | [mode/branch being tested] | [outcome] |

**Layer 2 outcomes:**
- **DEEP_CORRECT** — User prompt specific enough; agent navigates internal path correctly
- **DEEP_AMBIGUOUS** — Workflow has a branch but user prompt doesn't resolve which to take; agent must guess or ask
- **CONTEXT_INSUFFICIENT** — Workflow requires a param the user didn't provide and the workflow doesn't prompt for it; silent failure risk
- **DEEP_UNRESOLVABLE** — Workflow internal logic is ambiguous even with a specific prompt; the workflow file needs clarification

#### 3b.4: Sub-File Reachability Check

For any workflow with sub-file references:

1. Does the referenced file exist on disk?
2. Would the agent know to read it from the workflow instructions alone?
3. If the read is conditional, does the trigger condition appear in the workflow text?

Flag: **REACHABLE** / **MISSING** / **UNREACHABLE** (file exists but agent wouldn't know to read it).

This step validates file-level reachability only. Whether the agent correctly *applies* rules from those files is Layer 3's concern (Step 3c).

---

### Step 3c: Layer 3 — Content-Chain Enforcement

Layer 2 (3b.4) confirms the agent can *reach* referenced files. Layer 3 asks: once the agent reads them, does it actually *apply their rules*? This is the terminal depth layer — it catches the most insidious failure mode: a workflow that reads a reference file and then ignores its constraints.

**Prerequisites:** Only run Layer 3 on workflows where 3b.4 flagged sub-file references as **REACHABLE**. If a file is MISSING or UNREACHABLE, that's a Layer 2 problem — fix it first.

#### 3c.1: Content-Chain Inventory

For each workflow with REACHABLE sub-file references, map the content chain:

```
WORKFLOW: [Name]
CHAIN: [User prompt] → [Workflow] → reads [File] → applies [what rules?]

Content chains found:
  [WorkflowName] → [FileName] → [rule type: constraints / standards / intent / checklist]
  ...
```

**Common chain patterns to look for:**
- **Gate pattern** — Workflow reads a standards file before acting (e.g., PromptQualityAudit → PromptingStandards.md). Rules in the file constrain what the workflow outputs.
- **Guard pattern** — Workflow reads an intent/constraint file before modifying (e.g., ModifyContent → SkillIntent.md). Rules in the file can *block* proposed changes.
- **Checklist pattern** — Workflow reads a validation spec and must check every item (e.g., ValidateSkill → ValidationChecklist.md).

#### 3c.2: Rule Extraction from Referenced Files

For each content chain, read the referenced file and extract its actionable rules:

```
FILE: [FileName]
RULES EXTRACTED:
  R1: [specific rule, constraint, or prohibition from the file]
  R2: [...]
  ...
RULE COUNT: [N]
```

Only extract rules that the *workflow* is supposed to enforce. Skip informational content.

#### 3c.3: Enforcement Scenario Generation

For each content chain, generate adversarial scenarios that test whether the agent applies the rules:

**Type A — Constraint compliance:** Prompts where the user's request should be shaped by a rule from the reference file.
- "Audit the trigger phrases for [skill]" → Does the agent apply PromptingStandards.md rules to its output?
- "Update [skill]'s description" → Does the agent check SkillIntent.md before allowing changes?

**Type B — Constraint violation:** Prompts where the user explicitly asks for something a reference file prohibits.
- "Remove the SkillIntent guard from [skill]" → Does the agent recognize SkillIntent.md blocks this?
- "Add a trigger phrase that's 15 words long" → Does the agent catch PromptingStandards.md length limits?

**Type C — Silent pass-through:** Prompts where the workflow reads the file but the user's request has no interaction with its rules. The agent should still read the file but not falsely constrain the output.
- "Add a new workflow to [skill]" when SkillIntent.md says nothing about workflow count → agent should not invent a constraint.

Generate at minimum **2 scenarios per content chain** (1 compliance + 1 violation).

#### 3c.4: Layer 3 Enforcement Judgment

For each scenario:

| Scenario | Workflow | Reference File | Rule Tested | Judgment |
|---|---|---|---|---|
| "[prompt]" | [Name] | [File] | R[N] | [outcome] |

**Layer 3 outcomes:**
- **ENFORCED** — Agent reads file, applies rule correctly to shape or block output
- **UNENFORCED** — Agent reads file but ignores relevant rule; output violates constraint
- **OVER_ENFORCED** — Agent invents constraints not in the reference file; false restriction
- **CHAIN_BROKEN** — Workflow doesn't tell agent to read the file at all for this scenario; rule never reaches agent

#### 3c.5: Cross-Workflow Context File Coverage

This checks the reverse direction: instead of asking "does each workflow correctly use its referenced files?" it asks "does each context file get referenced by all the workflows that need it?"

1. List all context files from SKILL.md's `## Context Files` section.
2. For each context file, determine which workflows *should* read it based on the file's stated purpose.
3. For each of those workflows, check whether the workflow file contains an explicit instruction to read the context file.

```
CONTEXT FILE: [FileName]
PURPOSE: [from SKILL.md Context Files table]
SHOULD BE READ BY: [list of workflows, based on purpose alignment]
ACTUALLY REFERENCED BY: [list of workflows that mention this file]
COVERAGE GAP: [workflows that should read it but don't mention it]
```

Flag gaps as: **COVERED** / **UNREFERENCED** (workflow should read it but doesn't mention it).

---

### Step 4: Dead Route Detection

List all workflows from the routing table. For each, count how many scenarios from Step 2 mapped to it.

```
WorkflowName | Scenario count | Dead?
ModifyContent | N             | YES if 0
ManageWorkflows | N           | YES if 0
...
```

**Dead route** = a workflow with 0 scenarios mapping to it. This means either:
- The workflow is never realistically invoked
- The trigger phrases are so specific users won't hit them
- The workflow should be merged with another

---

### Step 5: Coverage Gap Analysis

**Layer 1 gaps:**
1. **Unrouted scenarios** — routing outcome = UNROUTED
2. **Wrong-route scenarios** — routing outcome = WRONG_ROUTE
3. **Over-trigger scenarios** — routing outcome = OVER_TRIGGER
4. **Context gaps** — routing outcome = CORRECT but agent context insufficient

**Layer 2 gaps:**
5. **Depth ambiguity** — DEEP_AMBIGUOUS internal paths where prompt doesn't resolve a branch
6. **Silent param failures** — CONTEXT_INSUFFICIENT where a required input was missing and the workflow doesn't prompt for it
7. **Unreachable sub-files** — workflow references a file the agent wouldn't know to read
8. **Flat workflow check** — note workflows with zero internal decision points; these may be good candidates for enrichment or merging

**Layer 3 gaps:**
9. **Unenforced rules** — agent reads reference file but ignores relevant constraints in its output
10. **Over-enforced rules** — agent invents constraints not present in the reference file
11. **Broken chains** — workflow doesn't instruct agent to read the reference file for a scenario where rules apply
12. **Cross-workflow coverage gaps** — context file should be read by a workflow but isn't referenced in the workflow file

---

### Step 6: Report and Recommendations

Output format:

```
INVOCATION SIM REPORT — [SkillName]
=====================================
Target:             [SkillName]
Skill shape:        [Breadth-Heavy / Depth-Heavy / Hybrid]
L1 scenarios:       [N generated]
L2 workflows probed:[M of N total — list any skipped as flat]
L3 content chains:  [N chains across M workflows]

LAYER 1 — ROUTING RESULTS:
  CORRECT:       N (N%)
  WRONG_ROUTE:   N
  UNROUTED:      N
  AMBIGUOUS:     N
  OUT_OF_SCOPE:  N (expected)
  OVER_TRIGGER:  N

DEAD ROUTES:
  [WorkflowName] — 0 scenarios mapped
  → Recommendation: [merge with X | add trigger phrase Y | remove if unused]

UNROUTED SCENARIOS:
  "[scenario]" → routes to nothing
  → Recommendation: Add trigger "[phrase]" to [WorkflowName] routing row

WRONG ROUTE SCENARIOS:
  "[scenario]" → routed to [WorkflowA] but should be [WorkflowB]
  → Recommendation: [move trigger | add disambiguation | split workflow]

L1 CONTEXT GAPS:
  "[scenario]" routed correctly to [WorkflowX] but agent lacks [context]
  → Recommendation: Add [context file | example | prerequisite note] to SKILL.md

LAYER 2 — DEPTH RESULTS:
  DEEP_CORRECT:          N
  DEEP_AMBIGUOUS:        N  ← branch unresolvable from user prompt
  CONTEXT_INSUFFICIENT:  N  ← required param not supplied, workflow doesn't prompt
  FLAT (no branches):    N workflows — trivially passing

DEPTH GAPS:
  [WorkflowName] — "[sub-scenario]" → DEEP_AMBIGUOUS: [which branch?]
  → Recommendation: [add AskUserQuestion gate | add default mode | clarify branch condition]

  [WorkflowName] — "[sub-scenario]" → CONTEXT_INSUFFICIENT: missing [param]
  → Recommendation: Add explicit prompt for [param] in workflow Step [N]

SUB-FILE GAPS:
  [WorkflowName] references [file] — UNREACHABLE (agent wouldn't know to read it)
  → Recommendation: Add explicit "Read [file]" instruction in workflow

LAYER 3 — CONTENT-CHAIN ENFORCEMENT:
  Content chains found:  N
  ENFORCED:              N  ← agent reads file, applies rules correctly
  UNENFORCED:            N  ← agent reads file, ignores rules
  OVER_ENFORCED:         N  ← agent invents constraints not in file
  CHAIN_BROKEN:          N  ← workflow doesn't instruct file read

ENFORCEMENT GAPS:
  [WorkflowName] → [File] → rule R[N]: UNENFORCED
  → Recommendation: Add explicit "Apply rules from [File]" instruction in workflow

  [WorkflowName] → [File] → rule R[N]: OVER_ENFORCED
  → Recommendation: Remove false constraint or clarify rule scope in [File]

CROSS-WORKFLOW COVERAGE:
  [ContextFile] — UNREFERENCED by [WorkflowName] (should read based on purpose)
  → Recommendation: Add "Read [ContextFile]" instruction to [WorkflowName]

OVERALL HEALTH: [HEALTHY / NEEDS_WORK / CRITICAL]
L1 Score: [correct + out_of_scope] / [total — ambiguous] = N%
L2 Score: [deep_correct + flat] / [total probed] = N%
L3 Score: [enforced] / [total chains — chain_broken] = N%
Combined: [weighted average or qualitative assessment]
```

**This workflow is read-only.** Do not auto-apply recommendations. Present findings and ask user which to remediate, then invoke the appropriate workflow (ModifyContent, ManageWorkflows, etc.) for each fix.

---

## Follow-Up

After completing this workflow, evaluate these chain conditions:

| Condition | Chain To | Action |
|---|---|---|
| Dead routes or ambiguous scenarios found | PromptQualityAudit | Announce: "Running prompt quality audit on problematic trigger phrases..." then execute `Workflows/PromptQualityAudit.md` |

If no conditions match, skip follow-ups.

---

## Working Through UpdateSkill as the Example

Running InvocationSim on UpdateSkill itself reveals the following scenario space:

### Sample Scenarios (UpdateSkill)

| # | Scenario | Expected Route | Notes |
|---|----------|---------------|-------|
| 1 | "Update the Browser skill description" | ModifyContent | Direct |
| 2 | "Add a cleanup workflow to Daemon" | ManageWorkflows | Direct |
| 3 | "Remove the deprecated workflow from Research" | ManageWorkflows | Direct |
| 4 | "Rename the Init workflow to Setup" | ManageWorkflows | Direct |
| 5 | "Check if the Fabric skill is valid" | ValidateSkill | Direct |
| 6 | "Validate the Research skill" | ValidateSkill | Direct |
| 7 | "Run a retrospective on Browser" | Retrospective | Direct |
| 8 | "Analyze how the Council skill performed this session" | Retrospective | Direct |
| 9 | "Refactor the Council skill structure" | RefactorSkill | Direct |
| 10 | "Decompose the UpdateSkill into smaller pieces" | WorkflowDecompose | Direct |
| 11 | "Token audit the Research skill" | WorkflowDecompose | Direct |
| 12 | "Stress test UpdateSkill" | StressTest | Direct |
| 13 | "Make the Browser skill better" | Retrospective? | AMBIGUOUS |
| 14 | "The Browser skill isn't triggering" | ValidateSkill | Diagnostic — trigger coverage |
| 15 | "Fix the skill" | UNROUTED | Too vague — which skill? |
| 16 | "Improve the Research skill" | Retrospective? | AMBIGUOUS — improve = retrospective or refactor? |
| 17 | "Create a new skill for cooking" | OUT_OF_SCOPE | → CreateSkill |
| 18 | "Delete the Telos skill entirely" | OUT_OF_SCOPE | → skill deletion not in UpdateSkill |
| 19 | "Update UpdateSkill" | Retrospective? | Meta — ambiguous routing |
| 20 | "Edit the trigger phrases for Browser" | ModifyContent | Synonym hit — "edit" should trigger |
| 21 | "The workflow descriptions are too long" | WorkflowDecompose | Symptom maps to decompose |
| 22 | "Clean up the Research skill" | RefactorSkill? | AMBIGUOUS — clean up = refactor or modify? |
| 23 | "Check skill" | ValidateSkill | Trigger phrase direct |
| 24 | "Analyze skill structure" | WorkflowDecompose | Direct |
| 25 | "Does this skill work?" | ValidateSkill? | Ambiguous — could also be StressTest |

**Findings from this sample:**
- Scenarios 13, 16, 19, 22: Ambiguous between Retrospective and RefactorSkill — trigger phrases overlap
- Scenario 15: Unrouted — "Fix the skill" (missing target) — valid gap
- Scenarios 17, 18: Correctly out of scope (good)
- Dead route risk: StressTest has only 1 natural trigger ("stress test skill") — low coverage

## Example Output (abbreviated)

```
INVOCATION SIM REPORT — UpdateSkill
=====================================
Scenarios generated: 25
Workflows tested: 8

ROUTING RESULTS:
  CORRECT:       18 (72%)
  WRONG_ROUTE:   0
  UNROUTED:      2 ("fix the skill", "make it work")
  AMBIGUOUS:     4 (improve, clean up, make better, update skill itself)
  OUT_OF_SCOPE:  2 (correct)
  OVER_TRIGGER:  0

DEAD ROUTES: None at 25-scenario depth

UNROUTED SCENARIOS:
  "Fix the skill" → no target specified, no route
  → Recommendation: Add AskUserQuestion gate: "Which skill? What to fix?"

AMBIGUOUS SCENARIOS:
  "Improve the Research skill" → Retrospective or RefactorSkill?
  → Recommendation: Add disambiguation note to SKILL.md examples:
    "improve = Retrospective (session-based) vs. refactor = RefactorSkill (structural)"

OVERALL HEALTH: NEEDS_WORK
Score: 20/23 = 87% (excluding 2 expected out-of-scope)
```
