# Portability -- MUMPS

> Epic-released M code should run safely across supported implementations, so ANSI-compatible defaults are the baseline and implementation-specific behavior is isolated by design.

## Mental Model

Treat portability as a reliability feature. If a routine depends on vendor behavior by accident, upgrades and environment changes become production risks. Keep core code ANSI-oriented, isolate implementation-specific behavior in wrappers, and enforce limits that remain safe across engines.

## Consumer Guide

### When Reviewing Code

- Flag direct use of non-portable implementation commands in routine logic.
- Confirm that identifier lengths remain within portable limits.
- Check device, open/use/close, and OS-facing behavior for implementation assumptions.

### When Designing / Planning

- Choose ANSI-compatible constructs first, then document exceptions.
- Push vendor-specific behavior into dedicated wrapper routines.
- Define explicit portability constraints for routine, tag, variable, and subscript lengths.

### When Implementing

- Prefer standards-compliant commands and functions in core logic.
- Keep implementation-specific branches in wrapper layers.
- Validate naming and subscript lengths before introducing new APIs.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [PreferAnsiMCore](../../Rules/MUMPS/PreferAnsiMCore.md) | CRITICAL | Keep core routine logic within ANSI-compatible M behavior |
| [IsolateImplementationSpecificCode](../../Rules/MUMPS/IsolateImplementationSpecificCode.md) | CRITICAL | Contain vendor-specific behavior in dedicated wrapper routines |
| [EnforcePortableNameLimits](../../Rules/MUMPS/EnforcePortableNameLimits.md) | CRITICAL | Keep routine, tag, variable, and global names in portable bounds |
| [AvoidNonPortableDeviceCommands](../../Rules/MUMPS/AvoidNonPortableDeviceCommands.md) | HIGH | Use wrapper APIs for device and OS interactions |

## Does Not Cover

- Naming readability details beyond hard limits (see Naming and Documentation).
- Command-level formatting and spacing (see Syntax and Formatting).
- Locking and trap behavior (see Concurrency and Errors).

## Sources

- Epic Chronicles programmer guidelines and coding standards references
- Epic GT.M ANSI compatibility guidance
- Official InterSystems and YottaDB portability references
