---
name: TypeScript
description: TypeScript type system, error handling, and compiler strictness guidelines. USE WHEN writing TypeScript code OR reviewing TypeScript code OR refactoring TypeScript OR type safety decisions OR error handling patterns OR configuring tsconfig OR working with generics OR discriminated unions OR Zod validation. Contains 20 rules across 10 priority categories for framework-agnostic TypeScript excellence.
---

# TypeScript

Framework-agnostic TypeScript best practices synthesized from Matt Pocock (Total TypeScript) and Steve Kinney's guidelines. **20 rules across 10 categories, prioritized by impact.** Focuses on the type system, error handling, and compiler strictness — complementing VercelReact's performance-focused rules.

## When to Apply This Skill

**Automatic triggers:**
- Writing TypeScript functions, types, or interfaces
- Reviewing TypeScript code for type safety
- Configuring tsconfig.json
- Error handling decisions (Result types, try/catch)
- Runtime validation of external data
- Refactoring toward stricter types

## Quick Decision Tree

**Start here when writing/reviewing TypeScript:**

1. **Compiler not strict enough?** → Category 1: Compiler Strictness (CRITICAL)
2. **Using `any` or unsafe casts?** → Category 2: Type Safety (CRITICAL)
3. **Modeling variants or states?** → Category 3: Discriminated Unions (HIGH)
4. **Writing reusable typed functions?** → Category 4: Generics (HIGH)
5. **Transforming types manually?** → Category 5: Utility Types (MEDIUM)
6. **Need validated/nominal types?** → Category 6: Branded Types (MEDIUM)
7. **Error handling decisions?** → Category 7: Error Handling (CRITICAL)
8. **External data (APIs, user input)?** → Category 8: Runtime Validation (HIGH)
9. **Import organization?** → Category 9: Import Organization (MEDIUM)
10. **Naming or file structure?** → Category 10: Naming & Files (MEDIUM)

**For detailed implementation:** Read the specific rule file from `Rules/` folder.

## Priority Hierarchy

| Priority | Category | Impact | Key Pattern |
|----------|----------|--------|-------------|
| 1 | Compiler Strictness | CRITICAL | `strict: true`, `noUncheckedIndexedAccess` |
| 2 | Type Safety | CRITICAL | `unknown` over `any`, narrowing before use |
| 3 | Discriminated Unions | HIGH | Unions over enums, exhaustiveness via `never` |
| 4 | Generics | HIGH | Constrained generics, inference over annotation |
| 5 | Utility Types | MEDIUM | `Pick`, `Omit`, `Record`, mapped types |
| 6 | Branded Types | MEDIUM | Nominal types for validated data |
| 7 | Error Handling | CRITICAL | Result types, custom Error subclasses |
| 8 | Runtime Validation | HIGH | Zod schemas, `z.infer` |
| 9 | Import Organization | MEDIUM | `import type`, grouped ordering |
| 10 | Naming & Files | MEDIUM | Conventions, co-location |

## Top 10 High-Impact Rules

These provide the largest type safety gains:

1. **StrictModeAlways** - Catches entire classes of bugs at compile time
2. **NeverAny** - `any` disables type checking and spreads virally
3. **ResultOverTryCatch** - Makes error cases visible in function signatures
4. **ZodForExternalData** - Runtime validation at system boundaries
5. **UnionsOverEnums** - Erasable, composable, narrowable
6. **ExhaustivenessChecking** - Compiler catches unhandled cases
7. **NoUncheckedIndexAccess** - Prevents unsafe array/object indexing
8. **NarrowBeforeUse** - Type guards over type assertions
9. **ConstrainGenerics** - Prevents overly permissive generic functions
10. **ImportTypeForTypes** - Eliminates runtime overhead from type imports

## Examples

**Example 1: Type safety review**
```
User: "Review this TypeScript file for type safety"
→ Applies Category 1-2 rules (Compiler Strictness, Type Safety)
→ Identifies `any` usage, missing strict flags, unsafe assertions
→ Returns specific fixes with Incorrect/Correct examples
```

**Example 2: Error handling refactor**
```
User: "Refactor this try/catch to use Result types"
→ Applies Category 7 rules (ResultOverTryCatch)
→ Introduces discriminated union Result<T, E> pattern
→ Updates callers to handle success/error branches explicitly
```

**Example 3: API response validation**
```
User: "Add type-safe validation to this API response"
→ Applies Category 8 rules (ZodForExternalData, InferFromSchemas)
→ Creates Zod schema, infers TypeScript type with z.infer
→ Replaces `as` assertions with schema.parse()
```

## Reference Documentation

**All 20 rules are sharded into individual files in `Rules/` folder for efficient loading.**

### How to Use Rules

**Pattern:** When applying a rule, read its specific file from Rules/ folder.

```
Decision tree identifies: Category 2 (Type Safety)
Quick ref shows: NeverAny rule
Action: Read Rules/NeverAny.md
Result: Complete code examples and implementation guidance
```

### What's in Each Rule File

Each rule file (`Rules/RuleName.md`) includes:
- Why it matters (explanation + impact level)
- Incorrect code example with explanation
- Correct code example with explanation
- Edge cases and when rule doesn't apply

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `strict-mode-always` → `Rules/StrictModeAlways.md`
- `never-any` → `Rules/NeverAny.md`
- `result-over-try-catch` → `Rules/ResultOverTryCatch.md`

## Complete Rule Index

### 1. Compiler Strictness (CRITICAL)
- StrictModeAlways
- NoUncheckedIndexAccess

### 2. Type Safety (CRITICAL)
- NeverAny
- NarrowBeforeUse

### 3. Discriminated Unions (HIGH)
- UnionsOverEnums
- ExhaustivenessChecking

### 4. Generics (HIGH)
- ConstrainGenerics
- InferOverExplicit

### 5. Utility Types (MEDIUM)
- PreferBuiltinUtilities
- MappedTypes

### 6. Branded Types (MEDIUM)
- BrandedForValidation

### 7. Error Handling (CRITICAL)
- ResultOverTryCatch
- CustomErrorClasses

### 8. Runtime Validation (HIGH)
- ZodForExternalData
- InferFromSchemas

### 9. Import Organization (MEDIUM)
- ImportTypeForTypes
- ImportOrdering

### 10. Naming & Files (MEDIUM)
- NamingConventions
- FileOrganization

## Integration

This skill integrates with PAI's code generation and review workflows. When writing or reviewing TypeScript code, these patterns ensure type-safe, maintainable, and defensive code.

**Complements VercelReact:** VercelReact covers performance patterns (Promise.all, data structures, caching). This skill covers the type system — no duplication, full coverage.

**Sources:** Matt Pocock (Total TypeScript), Steve Kinney (Frontend Masters), TypeScript community consensus
