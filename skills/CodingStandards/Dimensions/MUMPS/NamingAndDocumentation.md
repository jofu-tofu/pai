# Naming and Documentation -- MUMPS

> Routine and tag names are public contracts in M code, so naming clarity and header quality directly influence safety, discoverability, and maintainability.

## Mental Model

In Chronicles code, tags and routines are APIs. If names are ambiguous or headers are missing, callers misuse interfaces and maintainers fail to understand assumptions. Keep names descriptive, syntactically valid, and documented with stable headers.

## Consumer Guide

### When Reviewing Code

- Check routine/tag names for meaning and portability-safe forms.
- Validate tag-name start rules and conventions.
- Ensure tags that behave like callable interfaces have explicit signatures.
- Require routine and tag headers where integration or ownership matters.

### When Designing / Planning

- Define naming patterns before broad routine creation.
- Decide header templates for routine-level and tag-level documentation.
- Document tag parameter contracts and return behaviors.

### When Implementing

- Use descriptive names that communicate business intent.
- Follow allowed tag-start forms and avoid ambiguous shorthand.
- Add or refresh standard headers when creating or changing interfaces.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [UseDescriptiveRoutineAndTagNames](../../Rules/MUMPS/UseDescriptiveRoutineAndTagNames.md) | HIGH | Choose names that describe behavior, not local shorthand |
| [FollowTagStartRules](../../Rules/MUMPS/FollowTagStartRules.md) | HIGH | Tag names must follow valid starting-character rules |
| [IncludeTagParentheses](../../Rules/MUMPS/IncludeTagParentheses.md) | HIGH | Use explicit tag definitions for callable interfaces |
| [MaintainRoutineAndTagHeaders](../../Rules/MUMPS/MaintainRoutineAndTagHeaders.md) | HIGH | Keep routine/tag headers current and actionable |

## Does Not Cover

- Parser-level formatting behavior (see Syntax and Formatting).
- Variable scoping and state ownership (see Variable Scope).
- Locking and trap orchestration (see Concurrency and Errors).

## Sources

- Epic coding standards wiki guidance for M tags and headers
- Epic Chronicles programmer guideline conventions
