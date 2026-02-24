# Python Dimensions

Structured knowledge lenses for Python. Each dimension groups related rules with deep context for a specific concern, with full rule content inlined.

## Dimensions

| ID | Dimension | File | Load When |
|----|-----------|------|-----------|
| PY1 | Defensive Programming and Performance | DefensiveAndPerformance.md | Input validation, LBYL patterns, path checking, cast verification, magic methods, import deferral, mutable defaults |
| PY2 | Type System | TypeSystem.md | Type hints, Literal types, avoiding Any, Optional/nullable |
| PY3 | Code Organization | CodeOrganization.md | Keyword args, declaration scope, error handling, single responsibility |

## Default

Load **Defensive Programming and Performance (PY1)** for any Python task. Add task-specific dimensions on top.
