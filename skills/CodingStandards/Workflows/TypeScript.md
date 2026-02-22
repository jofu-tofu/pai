# TypeScript Workflow

> **Trigger:** File signals: `.ts` files (non-React), `tsconfig.json`, TypeScript generics, discriminated unions, `z.infer`, `Zod` imports

## Purpose

Apply TypeScript coding standards covering compiler strictness, type safety, discriminated unions, generics, error handling, and runtime validation across 19 rules in 10 priority categories.

## Reference Material

- `../Rules/TypeScript/` — 19 individual rule files across 10 categories

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

**For detailed implementation:** Read the specific rule file from `../Rules/TypeScript/` folder.

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

## How to Use Rules

**Pattern:** When applying a rule, read its specific file from `../Rules/TypeScript/` folder.

```
Decision tree identifies: Category 2 (Type Safety)
Quick ref shows: NeverAny rule
Action: Read ../Rules/TypeScript/NeverAny.md
Result: Complete code examples and implementation guidance
```

### Rule File Naming Convention

Rules use TitleCase naming for PAI compliance:
- `strict-mode-always` → `../Rules/TypeScript/StrictModeAlways.md`
- `never-any` → `../Rules/TypeScript/NeverAny.md`
- `result-over-try-catch` → `../Rules/TypeScript/ResultOverTryCatch.md`

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

**Complements React:** React skill covers component architecture and performance patterns (composition, Promise.all, data structures, caching). This skill covers the type system — no duplication, full coverage.

**Sources:** Matt Pocock (Total TypeScript), Steve Kinney (Frontend Masters), TypeScript community consensus

## Dimensional Loading

For agents that need focused subsets rather than the full rule set, read `../Dimensions/TypeScript/INDEX.md` for a routing table.

| Dimension | File | Rule Count | Load When |
|-----------|------|------------|-----------|
| Type Safety | TypeSafety.md | 5 | Compiler config, strict mode, any usage, narrowing |
| Type Modeling | TypeModeling.md | 6 | Discriminated unions, generics, utility types |
| Error Handling | ErrorHandling.md | 4 | Result types, custom errors, Zod validation |
| Conventions | Conventions.md | 4 | Import organization, naming, file structure |

**Default:** Load Type Safety for any TypeScript task.

**Use the full workflow (this file) when:** comprehensive standards review for a complete module.

**Use a dimension when:** focused context for a specific concern, multi-agent review, or constrained-context scenarios.
