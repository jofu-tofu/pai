# Error Handling — TypeScript

> Errors that are invisible in function signatures are errors that callers will forget to handle; making failure explicit in the type system transforms error handling from a discipline problem into a compiler-enforced guarantee.

## Mental Model

JavaScript's error handling model is built on `throw` and `try/catch`, a mechanism inherited from Java that is fundamentally at odds with TypeScript's type system. A function that throws has an invisible failure mode: its signature says `Promise<User>`, but it can also produce an `Error` — or a `string`, or a `number`, or anything else, because JavaScript lets you throw any value. Callers have no way to know a function can fail without reading its implementation, and `catch (e)` gives you `unknown` with no type information about what was caught.

Result types fix this by encoding success and failure in the return type itself. A function returning `Result<User, NotFoundError | NetworkError>` makes its failure modes visible in the signature. The caller must handle both branches because TypeScript's type narrowing demands it — you cannot access `result.data` without first checking `result.success`. This is not a new concept; Rust's `Result<T, E>`, Haskell's `Either`, and Go's multiple return values all solve the same problem. In TypeScript, a discriminated union with a `success` boolean discriminant is the idiomatic approach.

Custom error classes complement Result types by adding structure to the error branch. When everything throws `new Error("something went wrong")`, error handling degrades to string parsing. Custom Error subclasses carry structured data (`NotFoundError` has an `entity` and `id`; `InsufficientFundsError` has `balance` and `required`) and enable `instanceof` checks that are refactor-safe and type-narrowing compatible.

At system boundaries — API responses, user input, environment variables, JSON files — data has no type at runtime. Type assertions (`as User`) are lies: they tell the compiler to trust you without performing any validation. Zod schemas close this gap by validating the actual data structure at runtime and inferring the TypeScript type from the schema. A single Zod schema replaces both the runtime validation and the TypeScript interface, eliminating the drift that occurs when you maintain both separately. The `z.infer<typeof Schema>` pattern derives the type from the schema, making the schema the single source of truth.

Together, these four practices create a coherent error handling strategy: Result types make failure visible in signatures, custom errors add structure to failure values, Zod validates external data at boundaries, and schema inference eliminates type drift. The result is a system where error handling is not optional — the compiler enforces it.

## Consumer Guide

### When Reviewing Code

Check function signatures for functions that throw but declare no error in their return type — these should return `Result<T, E>` instead. Look for `catch (e)` blocks that use string matching (`e.message.includes(...)`) to determine error type — these should use `instanceof` with custom error classes. Scan for `as` assertions on data from external sources (API responses, JSON.parse, environment variables) — these should use Zod `.parse()` or `.safeParse()`. Check whether Zod schemas have a corresponding manually-written TypeScript interface — if so, the interface should be replaced with `z.infer<typeof Schema>`.

### When Designing / Planning

Decide on a Result type definition early and use it consistently across the project. A simple discriminated union works: `type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }`. Identify system boundaries where external data enters the application and plan Zod schemas for each boundary. Design a custom error hierarchy for the domain: group errors by category (NotFoundError, ValidationError, AuthorizationError, ConflictError) and give each structured properties that callers need. Decide whether to use `.parse()` (throws on invalid data) or `.safeParse()` (returns a Result-like object) as the project default — `.safeParse()` pairs naturally with the Result type pattern.

### When Implementing

Define the Result type once and import it everywhere. Write functions that can fail to return `Result<T, E>` instead of throwing. Use `try/catch` internally to wrap third-party code that throws, converting thrown errors into Result values at the boundary. Create custom Error subclasses with structured properties using class declarations that extend Error and set `this.name` in the constructor. Write Zod schemas for every external data source and derive TypeScript types with `z.infer`. Never maintain both a Zod schema and a separate interface for the same data shape — one will drift from the other. Use `.extend()` and `.pick()` on Zod schemas to derive related schemas (e.g., `CreateUserSchema` from `UserSchema`).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [ResultOverTryCatch](../../Rules/TypeScript/ResultOverTryCatch.md) | CRITICAL | Return `Result<T, E>` instead of throwing so callers see failure in the type signature |
| [CustomErrorClasses](../../Rules/TypeScript/CustomErrorClasses.md) | HIGH | Use Error subclasses with structured data instead of generic `new Error(message)` strings |
| [ZodForExternalData](../../Rules/TypeScript/ZodForExternalData.md) | HIGH | Validate external data with Zod schemas instead of `as` assertions at system boundaries |
| [InferFromSchemas](../../Rules/TypeScript/InferFromSchemas.md) | HIGH | Derive TypeScript types from Zod schemas with `z.infer` — never maintain parallel definitions |

## Rule Interactions

**ResultOverTryCatch + CustomErrorClasses** define the two halves of typed error handling. Result types make the error branch visible in the signature. Custom error classes give the error branch structure and `instanceof` narrowing. A `Result<User, NotFoundError | ValidationError>` signature tells callers exactly what can go wrong and gives them typed access to error details.

**ZodForExternalData + InferFromSchemas** are always used together. ZodForExternalData says to validate external data with Zod. InferFromSchemas says to derive the TypeScript type from the schema. Using Zod without `z.infer` means you still have a parallel interface that can drift. Using `z.infer` without Zod means you have a type with no runtime validation.

**ResultOverTryCatch + ZodForExternalData** interact at API boundaries. A function that fetches and validates external data should use Zod's `.safeParse()` inside and return a `Result<T, ZodError>` to the caller, combining runtime validation with typed error handling in a single pattern.

**CustomErrorClasses connects to TypeModeling dimension**: Custom error classes are discriminated by `instanceof`, which is a form of type narrowing. The error hierarchy can also be modeled as a discriminated union (`type AppError = NotFoundError | ValidationError | AuthError`) for exhaustiveness checking.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Functions that throw with no indication in their return type** — A function typed as `Promise<User>` that throws on failure is a hidden landmine. Callers have no way to know it can fail from the signature alone. Every function that can fail should return `Result<T, E>`.
- **`as` assertions on unvalidated external data** — `const user = data as User` performs zero runtime checks. If the API returns `{ id: 123, nm: "Alice" }` instead of `{ id: "abc", name: "Alice" }`, the assertion silently passes and the code crashes later when accessing missing properties.

### HIGH

- **Generic `new Error(message)` with string parsing in catch blocks** — When all errors are plain `Error` with a message string, callers must parse strings to determine the error type. This is fragile (breaks on typo changes), untypeable (no structured data), and unrefactorable (find-and-replace on strings is unsafe).
- **Parallel Zod schema and TypeScript interface for the same data** — Maintaining both `const UserSchema = z.object(...)` and `interface User { ... }` means they will drift. One source of truth: define the schema, infer the type.
- **Using `.parse()` without catching `ZodError`** — `schema.parse(data)` throws on invalid data. If the caller does not catch the error, validation failures become unhandled exceptions. Prefer `.safeParse()` for controlled error handling, or wrap `.parse()` in a Result-returning function.

### MEDIUM

- **Over-applying Result types to internal code** — Not every internal helper needs a Result return type. Functions that are called within a single module and whose errors are truly exceptional (programmer errors, not domain errors) can throw. Result types are most valuable at module boundaries and public API surfaces.
- **Deeply nested Zod schemas without `.extend()` or `.pick()`** — Duplicating schema definitions for related shapes (CreateUser, UpdateUser, UserResponse) when they could be derived from a base schema with `.extend()`, `.pick()`, or `.omit()`.

## Examples

**Example 1: Result type pattern**
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function getUser(id: string): Promise<Result<User, NotFoundError | NetworkError>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (res.status === 404) {
      return { success: false, error: new NotFoundError("User", id) };
    }
    if (!res.ok) {
      return { success: false, error: new NetworkError(res.status) };
    }
    const data = UserSchema.parse(await res.json());
    return { success: true, data };
  } catch (e) {
    return { success: false, error: new NetworkError(0) };
  }
}

// Caller must handle both branches
const result = await getUser("123");
if (!result.success) {
  if (result.error instanceof NotFoundError) {
    console.log(`User ${result.error.id} not found`);
  }
  return;
}
console.log(result.data.name);  // TypeScript knows this is User
```

**Example 2: Custom error hierarchy**
```typescript
class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class NotFoundError extends AppError {
  constructor(public readonly entity: string, public readonly id: string) {
    super(`${entity} not found: ${id}`);
  }
}

class ValidationError extends AppError {
  constructor(public readonly field: string, public readonly reason: string) {
    super(`Validation failed on ${field}: ${reason}`);
  }
}

class NetworkError extends AppError {
  constructor(public readonly statusCode: number) {
    super(`Network error: HTTP ${statusCode}`);
  }
}
```

**Example 3: Zod schema as single source of truth**
```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
});

// Type derived from schema — always in sync
type User = z.infer<typeof UserSchema>;

// Derived schemas for variants
const CreateUserSchema = UserSchema.omit({ id: true }).extend({
  password: z.string().min(8),
});
type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Safe parsing returns a Result-like object
const result = UserSchema.safeParse(apiResponse);
if (!result.success) {
  console.error(result.error.issues);
  return;
}
const user: User = result.data;
```

## Does Not Cover

- **Type narrowing and type guards** — Covered in the TypeSafety dimension (TS1). This dimension uses narrowing (e.g., checking `result.success`) but does not teach the narrowing patterns themselves.
- **Discriminated union design** — Covered in the TypeModeling dimension (TS2). Result types are discriminated unions, but the general principles of union design and exhaustiveness checking belong to TS2.
- **Compiler configuration** — Covered in the TypeSafety dimension (TS1). Error handling patterns assume `strict: true` is already enabled.

## Sources

- Matt Pocock, *Total TypeScript* — Result type patterns, Zod integration, schema inference
- TypeScript Handbook — Discriminated Unions (as applied to Result types)
- Zod documentation — Schema definition, `z.infer`, `.safeParse()`, schema composition
- Steve Kinney, *Frontend Masters TypeScript* — error handling patterns, custom error classes
