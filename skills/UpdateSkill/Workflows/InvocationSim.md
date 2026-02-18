# InvocationSim Workflow

> **Trigger:** "invocation sim", "simulate invocations", "test routing", "routing audit", "usage simulation", "trigger coverage", "coverage test", "what invocations work", "does this skill route correctly"

## Purpose

Simulate the full space of realistic user invocations for a target skill and judge whether each routes correctly, routes to the right workflow, and gives the agent enough context to succeed. Surfaces dead routes (workflows with no realistic path in) and coverage gaps (invocations that fall through).

This is the first-principles quality test for any skill: if you can't enumerate how it will be used and verify each usage routes correctly, the skill is unproven.

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

Find:
1. **Unrouted scenarios** — generated scenarios where routing outcome = UNROUTED
2. **Wrong-route scenarios** — routing outcome = WRONG_ROUTE
3. **Over-trigger scenarios** — routing outcome = OVER_TRIGGER
4. **Context gaps** — routing outcome = CORRECT but agent context insufficient

---

### Step 6: Report and Recommendations

Output format:

```
INVOCATION SIM REPORT — [SkillName]
=====================================
Target: [SkillName]
Scenarios generated: [N]
Workflows tested: [M]

ROUTING RESULTS:
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

CONTEXT GAPS:
  "[scenario]" routed correctly to [WorkflowX] but agent lacks [context]
  → Recommendation: Add [context file | example | prerequisite note] to SKILL.md

OVERALL HEALTH: [HEALTHY / NEEDS_WORK / CRITICAL]
Score: [correct + out_of_scope] / [total — ambiguous] = N%
```

**This workflow is read-only.** Do not auto-apply recommendations. Present findings and ask user which to remediate, then invoke the appropriate workflow (ModifyContent, ManageWorkflows, etc.) for each fix.

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
