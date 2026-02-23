# Concurrency and Errors -- MUMPS

> Reliable M code treats locking and error traps as first-class control flow, not optional hardening.

## Mental Model

Chronicles routines often run in high-contention operational paths. Concurrency safety requires explicit, shared lock strategy; failure safety requires consistent trap initialization. Wrapper-driven lock APIs and standard traps reduce deadlocks, silent corruption, and untraceable failures.

## Consumer Guide

### When Reviewing Code

- Ensure lock acquisition follows approved wrapper patterns.
- Confirm lock and unlock paths are balanced.
- Verify standard trap setup exists before risky operations.
- Flag ad hoc locking that bypasses shared conventions.

### When Designing / Planning

- Define lock scope and ordering strategy before implementation.
- Decide trap setup and error-return conventions for each public tag.
- Include timeout and fallback behavior for contested locks.

### When Implementing

- Use standard lock wrappers instead of custom lock strings.
- Keep lock windows minimal and explicit.
- Initialize standard error traps early in execution flow.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [UseChroniclesLockWrappers](../../Rules/MUMPS/UseChroniclesLockWrappers.md) | CRITICAL | Use shared lock/unlock wrappers for predictable behavior |
| [SetStandardErrorTrap](../../Rules/MUMPS/SetStandardErrorTrap.md) | CRITICAL | Initialize standard trap handling before mutation-heavy logic |

## Does Not Cover

- API-vs-global access design (see Data and Globals).
- Naming and interface documentation conventions (see Naming and Documentation).
- Broad portability requirements (see Portability).

## Sources

- Epic Chronicles locking guidance
- Epic programming guidelines for trap and failure handling
