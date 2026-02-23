# MUMPS Dimensions

Structured knowledge lenses for MUMPS / Chronicles coding. Each dimension groups related rules for one concern and links back to canonical rule files.

## Dimensions

| ID | Dimension | File | Load When |
|----|-----------|------|-----------|
| M1 | Portability | Portability.md | ANSI-compliance, IRIS/GT.M portability, implementation-specific isolation |
| M2 | Syntax and Formatting | SyntaxFormatting.md | Parser-sensitive syntax, command spacing, readability consistency |
| M3 | Naming and Documentation | NamingAndDocumentation.md | Routine/tag names, tag definitions, routine and tag headers |
| M4 | Variable Scope | VariableScope.md | NEW/KILL discipline, scratch-variable safety, parameter validation |
| M5 | Data and Globals | DataGlobals.md | API-first Chronicles access, loop traversal, global reference hygiene |
| M6 | Concurrency and Errors | ConcurrencyAndErrors.md | Lock wrappers, lock/update sequencing, standard trap setup |

## Default

Load **Portability (M1)** for any MUMPS task. Add targeted dimensions based on the review goal.
