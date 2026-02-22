# Python Dimensions

Structured knowledge lenses for Python. Each dimension groups related rules with deep context for a specific concern.

## Dimensions

| ID | Dimension | File | Load When |
|----|-----------|------|-----------|
| PY1 | Defensive Programming | DefensiveProgramming.md | Input validation, LBYL patterns, path checking, cast verification |
| PY2 | Type System | TypeSystem.md | Type hints, Literal types, avoiding Any, Optional/nullable |
| PY3 | Performance | Performance.md | Magic methods, import deferral, mutable defaults |
| PY4 | Code Organization | CodeOrganization.md | Keyword args, declaration scope, error handling, single responsibility |

## Default

Load **Defensive Programming (PY1)** for any Python task. Add task-specific dimensions on top.
