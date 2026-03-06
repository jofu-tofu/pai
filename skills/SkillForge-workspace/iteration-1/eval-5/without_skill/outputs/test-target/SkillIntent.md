# TestTarget — Design Intent

## Problem
Need a simple skill to test SkillForge's UpdateSkill workflow.

## Constraints
1. Must remain minimal for testing purposes
2. Must have at least one workflow

## Success Criteria
1. The skill correctly routes user requests matching trigger phrases ("do something", "run task") to the DoSomething workflow
2. The DoSomething workflow reads the user's input and determines the appropriate action before executing
3. The skill remains minimal and self-contained, with no unnecessary dependencies or complexity
4. Examples in SKILL.md accurately reflect real usage patterns and expected outcomes
