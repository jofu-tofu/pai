# CreateSkillIntent Workflow

> **Trigger:** "create skill intent", "add skill intent", "document skill purpose", "write skill intent", "generate skill intent"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md`
- **Skill System Spec:** `../Standards/SkillSystem.md` — SkillIntent.md standard structure
- **SkillForge's SkillIntent:** `../SkillIntent.md` — concrete example

## Purpose

Generate a `SkillIntent.md` for any target skill. This document captures the original design decisions, out-of-scope boundaries, and constraints that all future updates must respect.

## Workflow Steps

### Step 1: Identify Target Skill

Read the target skill's `SKILL.md`. Extract description, routing table, and examples. Check if `SkillIntent.md` already exists — if so, ask user whether to update or overwrite.

### Step 2: Infer Context

Before interviewing the user, synthesize what can be inferred from existing files:
- **From description:** What problem does the skill solve?
- **From routing table:** What are the distinct operations?
- **From examples:** What are the canonical use cases?

### Step 3: Interview for Design Decisions

Ask the user (as a group, not one-by-one):
1. **First principles:** What enduring truths guide this skill's design?
2. **Problem statement:** Does the inferred problem capture why the skill was built?
3. **Key design decisions:** Why does the skill work the way it does? What alternatives were rejected?
4. **Explicit out-of-scope:** What should this skill NEVER do?
5. **Non-negotiable constraints:** What rules must survive any future refactoring?
6. **Success criteria:** Binary YES/NO philosophical conditions describing the ideal state.

### Step 4: Generate SkillIntent.md

Write using the standard structure from SkillSystem.md: First Principles, Problem This Skill Solves, Design Decisions table, Explicit Out-of-Scope, Success Criteria, Constraints.

### Step 5: Testability Gate

Before confirming with user, verify each success criterion:
- Binary-testable (YES/NO in under 5 seconds)
- Points to an observable artifact
- Atomic (no "and" — split if needed)
- Minimum 3 criteria covering distinct aspects

### Step 6: Confirm and Write

Show generated SkillIntent.md to user for review. On confirmation, write the file and report summary.
