# Variable Scope -- MUMPS

> Symbol-table discipline in M is non-negotiable; weak NEW/KILL practices cause cross-call contamination and hard-to-diagnose production behavior.

## Mental Model

M routines execute within process symbol tables that can leak state across calls if not explicitly constrained. Every routine should define ownership boundaries: NEW what you use, avoid destructive KILL patterns, and validate required inputs up front.

## Consumer Guide

### When Reviewing Code

- Confirm local variables are NEWed before mutation in reusable routines.
- Flag argumentless KILL and broad kill patterns.
- Verify custom code does not rely on unstable scratch-variable assumptions.
- Ensure required parameters are validated before side effects.

### When Designing / Planning

- Decide variable ownership at routine boundaries.
- Define parameter validation policy and standard return/error behavior.
- Reserve scratch-variable usage for known-safe contexts only.

### When Implementing

- NEW all routine-local mutable variables.
- Never use argumentless KILL in shared code paths.
- Validate required inputs early and return explicit error signals.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [NewVariablesBeforeUse](../../Rules/MUMPS/NewVariablesBeforeUse.md) | CRITICAL | NEW local variables to isolate symbol-table side effects |
| [AvoidArgumentlessKill](../../Rules/MUMPS/AvoidArgumentlessKill.md) | CRITICAL | Never clear symbol tables with broad or implicit KILL patterns |
| [ProtectScratchVariables](../../Rules/MUMPS/ProtectScratchVariables.md) | HIGH | Avoid unsafe assumptions about shared scratch variables |
| [ValidateRequiredParameters](../../Rules/MUMPS/ValidateRequiredParameters.md) | HIGH | Verify required arguments before executing business logic |

## Does Not Cover

- Data access contract choices (see Data and Globals).
- Locking and trap setup (see Concurrency and Errors).
- Tag naming and interface headers (see Naming and Documentation).

## Sources

- Epic coding standards recommendations for custom M code variable hygiene
- Chronicles programmer best-practice guidance
