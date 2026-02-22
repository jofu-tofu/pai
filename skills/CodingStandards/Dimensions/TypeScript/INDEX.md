# TypeScript Dimensions

Structured knowledge lenses for TypeScript. Each dimension groups related rules with deep context for a specific concern.

## Dimensions

| ID | Dimension | File | Load When |
|----|-----------|------|-----------|
| TS1 | Type Safety | TypeSafety.md | Compiler config, strict mode, any usage, type narrowing, branded types |
| TS2 | Type Modeling | TypeModeling.md | Discriminated unions, generics, utility types, mapped types |
| TS3 | Error Handling | ErrorHandling.md | Result types, custom errors, Zod validation, schema inference |
| TS4 | Conventions | Conventions.md | Import organization, naming conventions, file structure |

## Default

Load **Type Safety (TS1)** for any TypeScript task. Add task-specific dimensions on top.
