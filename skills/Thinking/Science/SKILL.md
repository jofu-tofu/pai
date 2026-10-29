---
name: Science
evals:
  manual:
    reason: "diagnoses and investigations require judgment that their hypotheses distinguish plausible explanations for the supplied problem"
    falsifier: "the reviewer finds no proposed observation could falsify a hypothesis or the evidence gathered cannot discriminate among alternatives"
metadata:
  short-description: "Diagnose or investigate a problem with a locked goal, plural falsifiable hypotheses and discriminating evidence; measured improvement goes to measured iteration."
version: 1.2.1
description: "The scientific method for understanding a problem: a goal locked before evidence, plural falsifiable hypotheses, and the cheapest evidence that tells them apart, from a timeboxed debug to a research-grade investigation. USE WHEN think about, figure out, diagnose, investigate, why is this happening, science, quick diagnosis, structured investigation, define the goal, what are we trying to achieve, research-grade investigation. NOT FOR multi-angle lens passes (IterativeDepth) or measured improvement of a target (measured iteration)."
---

Read `PORTABILITY.md` before use; it defines the standalone tool and storage contract and replaces any inherited platform-specific setup.

# Science

Applies the scientific method to understanding a problem: a checkable goal fixed before evidence, competing falsifiable hypotheses, the evidence that tells them apart, and a decision on what to do next. DefineGoal frames the problem, QuickDiagnosis handles timeboxed debugging, and StructuredInvestigation runs the whole loop at working grade or research grade. Improving a target by measured experiment (hypotheses for a change, experiment design, reading results, iterating) is measured iteration's job, and `skills/measured iteration/References/Experiments.md` describes a well-framed experiment; a climb that stalls on a wrong frame comes back here. Use IterativeDepth for multi-lens exploration.

## Ideal State

- Every investigation ties a goal locked before evidence collection to competing falsifiable hypotheses, and every verdict traces to evidence against those precommitted criteria.
- Rigor matches the stakes: a quick diagnosis stays timeboxed, a complex problem leaves an auditable record, and a research-grade question gets pre-registration and independent review.
- Goal achievement and hypothesis support are judged separately, null and inconclusive results stay visible, and every investigation ends in an explicit next action or stopping decision.
- A question that turns into "make this measured number better" leaves Science for measured iteration with its goal and hypotheses attached.

## Intent Routing

| Intent | Trigger | File |
|----------|---------|------|
| **DefineGoal** | "define the goal", "what are we trying to achieve" | `Intents/DefineGoal.md` |
| **QuickDiagnosis** | Quick debugging (15-min rule); not for an obvious five-minute fix or creative/generative work, which need no ceremony | `Intents/QuickDiagnosis.md` |
| **StructuredInvestigation** | "investigate", complex or research-grade investigation | `Intents/StructuredInvestigation.md` |

Experiment requests ("what might work", "how do we test", "iterate", "analyze the results", "optimize") on a target with a measurement go to measured iteration (`skills/measured iteration/SKILL.md`).

| File | Read when |
|------|-----------|
| `Methodology.md` | running or measuring an investigation: execution invariants and tool routing |
| `Protocol.md` | handing work to a specialist skill, sizing formality by scale, or receiving a stalled climb; also the contract a skill follows when its body says it implements the Science protocol |
| `Templates.md` | a record's status values or its compact form |
| `Examples.md` | interpreting improvement when the goal is still unmet, or an aggregate score against failed criteria |

## Data & Config

Use request preferences or local `Customizations/PREFERENCES.md`. Save outputs to the user's requested destination. Read `PORTABILITY.md`.

## Gotchas

_No gotchas documented yet. Add failures here as they're discovered._

## Examples

- "Why is this test flaky?" → QuickDiagnosis: a one-sentence GOAL, H1-H3 with falsifiers, the cheapest discriminating test first.

- "What might work to cut churn?" → measured iteration: churn is a measured product number, so it is a metric climb with its hypotheses, experiments and keeps in the climb ledger.

- A weeks-long decision needing methodology review and statistical rigor → StructuredInvestigation at research grade: pre-registered goal, five or more hypotheses, independent review recorded.
