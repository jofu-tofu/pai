# Syntax and Formatting -- MUMPS

> In M, whitespace and command structure are semantic, so formatting consistency is not cosmetic; it is behavioral safety.

## Mental Model

Code style in M affects parser behavior. A misplaced space, empty line, or inconsistent command form can alter execution and complicate maintenance. Establish one predictable style and enforce it uniformly.

## Consumer Guide

### When Reviewing Code

- Check spacing around commands and arguments for consistency.
- Flag mixed command styles (abbreviated and verbose) inside one routine.
- Verify each line contains valid code or comment content.

### When Designing / Planning

- Choose command-style conventions per routine or module.
- Standardize spacing rules so reviews can detect true defects quickly.
- Document exceptions where parser constraints force a specific pattern.

### When Implementing

- Keep command separation and argument spacing consistent.
- Avoid introducing null executable lines.
- Treat whitespace edits as behavior-sensitive changes.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [RespectMWhitespaceSensitivity](../../Rules/MUMPS/RespectMWhitespaceSensitivity.md) | HIGH | Treat spacing and indentation as syntax-level concerns |
| [KeepCommandSpacingConsistent](../../Rules/MUMPS/KeepCommandSpacingConsistent.md) | HIGH | Keep command and argument spacing predictable and uniform |
| [AvoidNullCodeLines](../../Rules/MUMPS/AvoidNullCodeLines.md) | MEDIUM | Ensure each code line is executable code or a comment |
| [UseConsistentCommandStyle](../../Rules/MUMPS/UseConsistentCommandStyle.md) | MEDIUM | Do not mix short and long command forms arbitrarily |

## Does Not Cover

- Identifier and tag contract design (see Naming and Documentation).
- Variable scoping and symbol-table safety (see Variable Scope).
- Portability policy itself (see Portability).

## Sources

- Epic M syntax training references
- Epic coding standards guidance for Caché/M
