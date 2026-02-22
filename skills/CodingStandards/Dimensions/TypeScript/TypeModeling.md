# Type Modeling — TypeScript

> Types are not annotations bolted onto values after the fact; they are the design language of your system, encoding domain constraints, state transitions, and invariants that the compiler enforces for free.

## Mental Model

Type modeling is the practice of designing types that make illegal states unrepresentable. Where type safety (TS1) ensures the compiler is configured to catch errors, type modeling ensures there are fewer errors to catch in the first place — because the type system encodes business rules directly.

The foundation is discriminated unions. A union type with a literal discriminant property (like `kind` or `type`) lets TypeScript narrow the full type based on a single property check. This replaces class hierarchies, boolean flags, and optional properties with a structure the compiler can reason about exhaustively. When you add a new variant to a discriminated union, every `switch` statement that uses exhaustiveness checking (assigning the default case to `never`) becomes a compile error, turning the compiler into a changelog reviewer that tells you everywhere the new variant needs handling.

Generics are the second pillar. A well-constrained generic function communicates its contract through its type signature: "I accept any T that has these properties, and I return something derived from T." Unconstrained generics (`<T>` with no `extends`) are barely better than `any` — they accept everything and know nothing. The `extends` clause is the generic's contract. But generics should be inferred, not annotated: when you call `identity(42)`, TypeScript infers `number` for `T`. Explicit type arguments like `identity<number>(42)` add noise and can lie if the argument does not actually match.

Utility types are the third pillar. TypeScript ships with `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `Extract`, and `Exclude` — type-level functions that derive new types from existing ones. Using them instead of manually defining partial or subset interfaces eliminates drift: when the source type changes, derived types update automatically. When built-in utilities do not fit, mapped types let you write custom transformations that iterate over keys and transform each property programmatically, the `Array.map()` of the type system.

Together, these tools let you model your domain so precisely that many categories of bugs become structurally impossible. A function that accepts `Shape` and switches on `kind` with exhaustiveness checking cannot forget to handle triangles. A generic `getProperty<T, K extends keyof T>` cannot be called with a key that does not exist on the object. A `Partial<User>` cannot drift from `User` because it is derived from it.

## Consumer Guide

### When Reviewing Code

Look for boolean flags or optional properties that represent mutually exclusive states — these should be discriminated unions. Check `switch` statements over unions for a `default` that returns a fallback value instead of calling `assertNever` — this hides missing cases. Scan for unconstrained generics (`<T>` without `extends`) in utility functions — they accept too much. Look for manually defined subset interfaces (e.g., `UserSummary` with copy-pasted fields from `User`) that should use `Pick` or `Omit`. Flag explicit type arguments at call sites when the compiler can infer them.

### When Designing / Planning

Model domain states as discriminated unions from the start. Identify the states an entity can be in and make each state a variant with its own properties. Choose the discriminant property name consistently across the codebase (`type`, `kind`, or `status` — pick one and use it everywhere). Design generic utility functions with `extends` constraints that document what the function needs from its input. Plan type derivation: define the canonical source type and derive all variants using utility types, so changes propagate automatically.

### When Implementing

Write discriminated unions with a string literal discriminant. Always add an `assertNever` helper and use it in the `default` case of every switch over a union. When writing generic functions, start with the constraint: what does the function need from `T`? Add `extends` accordingly. Let TypeScript infer generic type arguments at call sites — only add explicit type arguments when inference fails or when the result is ambiguous. Use built-in utility types (`Partial`, `Pick`, `Omit`, `Record`) before writing custom mapped types. When built-in utilities do not fit, write a named mapped type with a clear name that describes the transformation (e.g., `Promisified<T>`, `Nullable<T>`).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [UnionsOverEnums](../../Rules/TypeScript/UnionsOverEnums.md) | HIGH | Use string literal unions or `as const` objects instead of enums — zero runtime overhead, full narrowing |
| [ExhaustivenessChecking](../../Rules/TypeScript/ExhaustivenessChecking.md) | HIGH | Assign the default case to `never` so the compiler catches unhandled union variants |
| [ConstrainGenerics](../../Rules/TypeScript/ConstrainGenerics.md) | HIGH | Use `extends` to constrain generics to types with the properties the function needs |
| [InferOverExplicit](../../Rules/TypeScript/InferOverExplicit.md) | HIGH | Let TypeScript infer generic type arguments from usage instead of annotating them explicitly |
| [PreferBuiltinUtilities](../../Rules/TypeScript/PreferBuiltinUtilities.md) | MEDIUM | Use `Partial`, `Pick`, `Omit`, `Record` instead of manually defining subset interfaces |
| [MappedTypes](../../Rules/TypeScript/MappedTypes.md) | MEDIUM | Write mapped types for custom type transformations when built-in utilities do not fit |

## Rule Interactions

**UnionsOverEnums + ExhaustivenessChecking** are inseparable. Discriminated unions gain their real power when every switch includes exhaustiveness checking via `assertNever`. Without exhaustiveness checking, adding a new variant to a union is just as invisible as adding a new enum member. Together, they create a system where new states are impossible to forget.

**ConstrainGenerics + InferOverExplicit** govern generic function design from opposite ends. ConstrainGenerics defines what the function accepts (the `extends` clause). InferOverExplicit defines how callers use it (let the compiler figure out `T` from the argument). A well-constrained generic with good inference requires no explicit type arguments at call sites.

**PreferBuiltinUtilities + MappedTypes** form a hierarchy. Always reach for built-in utilities first. Only write a custom mapped type when `Partial`, `Pick`, `Omit`, `Record`, `Readonly`, `Extract`, and `Exclude` cannot express the transformation. Mapped types are more powerful but harder to read; built-in utilities are universally understood.

**UnionsOverEnums connects to TypeSafety dimension**: Unions paired with `as const` objects replace enums with zero runtime overhead. The `as const` assertion (from the TypeSafety dimension's NarrowBeforeUse rule) is the mechanism that makes the values literal types.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Boolean flags for mutually exclusive states** — `{ isLoading: boolean; isError: boolean; data?: T }` allows `{ isLoading: true, isError: true, data: undefined }`, which is an impossible state that the type permits. Use a discriminated union: `{ status: "loading" } | { status: "error"; error: Error } | { status: "success"; data: T }`.

### HIGH

- **Switch without exhaustiveness checking** — A `default` case that returns a fallback value instead of calling `assertNever` means adding a new union variant silently falls through to the default. Every switch on a discriminated union must use exhaustiveness checking.
- **Unconstrained generics in utility functions** — `function getProperty<T>(obj: T, key: string)` accepts anything for `T` and knows nothing about it, forcing `any` casts inside. Constrain with `<T extends object, K extends keyof T>`.
- **TypeScript enums used for new code** — Enums generate runtime JavaScript objects, cannot be tree-shaken, and numeric enums have surprising bidirectional mapping. Use string literal unions or `as const` objects.

### MEDIUM

- **Manually defined subset interfaces that duplicate fields** — `interface UserSummary { id: string; name: string }` alongside `interface User { id: string; name: string; email: string }` will drift. Use `type UserSummary = Pick<User, "id" | "name">`.
- **Explicit type arguments where inference works** — `names.map<string>(n => n.toUpperCase())` is noise. Let the compiler infer the return type from the callback.
- **Deeply nested conditional mapped types** — If a mapped type requires more than two levels of conditional inference, it is harder to read than the manual version. Prefer clarity over cleverness.

## Examples

**Example 1: Discriminated union with exhaustiveness**
```typescript
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function renderState<T>(state: RequestState<T>): string {
  switch (state.status) {
    case "idle":    return "Ready";
    case "loading": return "Loading...";
    case "success": return `Got: ${state.data}`;
    case "error":   return `Error: ${state.error.message}`;
    default:        return assertNever(state);
  }
}
```

**Example 2: Constrained generic with inference**
```typescript
function pluck<T extends object, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const users = [{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }];
const names = pluck(users, "name");  // inferred: string[]
const ages = pluck(users, "age");    // inferred: number[]
// pluck(users, "email");            // compile error: "email" not in keyof
```

**Example 3: Utility types over manual definitions**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

type CreateUserInput = Omit<User, "id">;
type UserUpdate = Partial<Pick<User, "name" | "email">>;
type UserSummary = Pick<User, "id" | "name">;
type ReadonlyUser = Readonly<User>;
// All derived — change User, and these update automatically.
```

## Does Not Cover

- **Compiler configuration and strict flags** — Covered in the TypeSafety dimension (TS1). This dimension assumes the compiler is already strict.
- **Runtime validation and Zod schemas** — Covered in the ErrorHandling dimension (TS3). Type modeling is compile-time; runtime validation is a separate concern.
- **Branded types for nominal safety** — Covered in the TypeSafety dimension (TS1). Branding is a safety mechanism, not a modeling tool.

## Sources

- Matt Pocock, *Total TypeScript* — discriminated unions, generics constraints, utility type patterns
- TypeScript Handbook — Narrowing, Generics, Mapped Types, Conditional Types
- Steve Kinney, *Frontend Masters TypeScript* — exhaustiveness checking, generic design patterns
