# Decompose Workflow

> Internal workflow — invoked by Think.md, not user-facing.
> You are ONE of five parallel agents. You see ONE perspective file only.

## Input / Output

**Input:**
- One perspective file: `$THINK_DIR/perspective-N.md` (reframed problem from one lens)
- Original problem: `$THINK_DIR/prompt.txt`

**Output:**
- Appends a `## First-Principles Decomposition` section to the same perspective file
- Returns the absolute path to the updated file

## Background

The perspective file contains a problem reframed through one lens's vocabulary and mental models. Decompose it to irreducible components within that lens — strip away assumptions, conventions, and "obvious" answers until you reach bedrock truths that cannot be further reduced. Then rebuild understanding upward from those truths.

## Instructions

### Step 1: Read Your Perspective File

Read the reframed problem. Identify:
- The lens's native framing
- The key questions the frame raises
- The vocabulary and mental models in use

Also read `prompt.txt` — this grounds the decomposition in the user's real problem, not just the abstract reframing.

### Step 2: Challenge Assumptions

List assumptions embedded in:
- The original problem statement (what does the user take for granted?)
- The lens's reframing (what does this lens take for granted?)

For each assumption: Is it necessarily true? Under what conditions does it break?

### Step 3: Extract Irreducible Components

Break the problem into its smallest meaningful pieces within this lens. For each component:
- Define precisely in this lens's terms
- Identify what drives it
- Map its dependencies (prerequisites, inputs)
- Map what depends on it (downstream effects)
- Assess whether it can be decomposed further (if yes, continue)

### Step 4: Map Relationships

Identify how components relate:
- Dependencies (A requires B)
- Tensions (A and B pull in opposite directions)
- Feedback loops (A influences B influences A)
- Emergent properties (combination produces something none produces alone)

### Step 5: Identify Leverage Points

Locate where a small change produces a large effect — the high-leverage intervention points. Name each explicitly with its mechanism of impact.

## Output Format

Append to the perspective file:

```markdown
---

## First-Principles Decomposition

### Assumptions Challenged

| Assumption | Status | Reasoning |
|-----------|--------|-----------|
| [Assumption from original problem] | [Holds / Breaks / Conditional] | [Why] |
| [Assumption from lens] | [Holds / Breaks / Conditional] | [Why] |

### Irreducible Components

**Component 1: [Name]**
- Definition: [Precise definition in this lens's terms]
- Driver: [What causes or sustains this]
- Dependencies: [What it requires]
- Downstream: [What depends on it]

**Component 2: [Name]**
[Same structure]

[Continue for all irreducible components — typically 4-8]

### Relationship Map

[Narrative description of key relationships between components: dependencies, tensions, feedback loops, emergent properties.]

### Leverage Points

[Ordered by impact. For each: what it is, why it's high-leverage, what moving it changes.]

1. **[Leverage point]** — [Why this is the highest-impact intervention point]
2. **[Leverage point]** — [Why]
3. **[Leverage point]** — [Why]

### Key Insight

[1-2 sentences: What does this decomposition reveal that was invisible before?]
```

## Constraints

1. **Do NOT read other perspective files.** Only read `perspective-N.md` (your assigned file) and `prompt.txt`. Reading other perspective files contaminates your reasoning — exposure to another lens's framing causes unconscious convergence, destroying your independent analysis. The pipeline's value depends on five genuinely independent chains.
2. **Stay in your lane.** Decompose within your assigned lens only. The other four agents handle the other lenses.
3. **Depth over breadth.** 4 deeply analyzed components are worth more than 10 superficial ones.
4. **Challenge the frame.** Identify where this lens's assumptions fail for this specific problem. "This lens doesn't capture X" is a valid finding.
5. **Stay concrete.** Every component, relationship, and leverage point connects back to the user's actual problem.

## Follow-Up

Return the path to the updated perspective file. The orchestrator passes this same file to a Solve agent in Wave 3.
