# Data and Globals -- MUMPS

> Direct global access is fast but brittle; in Chronicles environments, API-first access patterns provide durability, compatibility, and clearer intent.

## Mental Model

Global structure is an implementation detail, not a durable application contract. Prefer released APIs and wrapper functions for reads, writes, and traversal. When direct references are unavoidable, enforce strict safety rules (no naked references, no null subscripts).

## Consumer Guide

### When Reviewing Code

- Flag direct global access where released APIs exist.
- Replace raw `$order` traversal of Chronicles structures with API loops.
- Reject naked global references in maintainable code paths.
- Verify subscript construction forbids null values.

### When Designing / Planning

- Design data workflows around supported Chronicles APIs.
- Use wrapper points for expected schema evolution.
- Define fallback strategy for exceptional low-level global operations.

### When Implementing

- Prefer API wrappers for data access and iteration.
- Keep explicit global names in every reference.
- Guard subscript generation to avoid null-valued keys.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [PreferChroniclesApisOverDirectGlobals](../../Rules/MUMPS/PreferChroniclesApisOverDirectGlobals.md) | CRITICAL | Use released APIs before direct global reads/writes |
| [UseApiLoopingInsteadOfRawOrder](../../Rules/MUMPS/UseApiLoopingInsteadOfRawOrder.md) | CRITICAL | Prefer API loop primitives over raw `$order` on data globals |
| [AvoidNakedGlobalReferences](../../Rules/MUMPS/AvoidNakedGlobalReferences.md) | CRITICAL | Keep every global reference explicit and stable |
| [AvoidNullValuedSubscripts](../../Rules/MUMPS/AvoidNullValuedSubscripts.md) | CRITICAL | Never create or rely on null-valued subscripts |

## Does Not Cover

- Variable-scope control (see Variable Scope).
- Lock sequencing and trap policy (see Concurrency and Errors).
- Syntax formatting details (see Syntax and Formatting).

## Sources

- Epic Chronicles coding guidance on data APIs and global safety
- Epic portability guidelines for M globals
