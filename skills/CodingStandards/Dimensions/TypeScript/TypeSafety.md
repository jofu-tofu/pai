# Type Safety — TypeScript

> The compiler is only as useful as its configuration allows; type safety is not a feature you get by default but a discipline you enforce through strict settings, deliberate type narrowing, and structural guarantees that prevent entire classes of runtime failures.

## Mental Model

TypeScript's type system is opt-in at every level. Without `strict: true`, the compiler permits implicit `any`, unchecked null access, and unsafe function binds — all of which compile cleanly and crash at runtime. Strict mode is not a preference; it is the minimum configuration that makes TypeScript meaningfully different from JavaScript.

Beyond the compiler, type safety is a layered defense. The first layer is the `tsconfig.json` flags: `strict: true` enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and `strictBindCallApply`. The second layer is `noUncheckedIndexedAccess`, which closes the gap where TypeScript lies about array and record indexing — treating `array[n]` as `T` when it should be `T | undefined`. These two layers eliminate the most common source of production null-reference errors.

The third layer is discipline in how you handle types at runtime. `any` is not a flexible type — it is the absence of type checking, and it spreads virally. Every value that touches `any` loses its type information, and every function that returns `any` infects its callers. The antidote is `unknown`, which forces you to prove what a value is before using it. Type assertions (`as`) are the opposite: they tell the compiler to trust you without evidence. Type guards (`typeof`, `instanceof`, `in`, custom predicates) prove the type through runtime checks that the compiler can verify. Assertions hide bugs; narrowing catches them.

The final layer is branded types. TypeScript is structurally typed, so `UserId` and `OrderId` are interchangeable if both are strings. Branded types add a phantom property that makes them nominally distinct at the type level, while remaining plain strings at runtime. Combined with validation functions that brand on creation, they close the gap between "this is a string" and "this is a validated, domain-specific identifier."

Together, these layers form a defense-in-depth strategy: the compiler catches structural errors, strict flags catch null and implicit-any errors, narrowing catches unsafe access patterns, and branding catches semantic misuse of structurally identical types.

## Consumer Guide

### When Reviewing Code

Check `tsconfig.json` first. If `strict` is not `true`, flag it as CRITICAL regardless of what the rest of the code looks like — the compiler is not doing its job. Next, search for `noUncheckedIndexedAccess` — its absence means every array and record access is silently unsafe. Then scan for `any` in type annotations, function parameters, and return types. Each instance is a hole in the type system. Finally, look for `as` assertions that are not preceded by a runtime check — these are assertions without evidence. Legitimate uses of `as` include `as const` (safe) and post-Zod-parse casting (validated).

### When Designing / Planning

Start every new project with `strict: true` and `noUncheckedIndexedAccess: true` in `tsconfig.json`. Design function signatures to accept `unknown` for external data and return precise types. Plan branded types early for domain identifiers (user IDs, order IDs, email addresses) — retrofitting them is harder than adding them from the start. When designing module boundaries, decide which types cross boundaries and ensure those boundary types are narrow and validated rather than wide and assumed.

### When Implementing

Enable all strict flags before writing the first line of code. Use `unknown` instead of `any` for values whose type you do not know at the point of declaration. Write type guard functions (returning `value is T`) for complex narrowing that you will reuse. Use `instanceof` for class hierarchies, `in` for discriminated objects, and `typeof` for primitives. Prefer optional chaining (`?.`) and nullish coalescing (`??`) over non-null assertions (`!`). Create branded type constructors that validate and brand in a single step, so unbranded values never enter the system.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [StrictModeAlways](../../Rules/TypeScript/StrictModeAlways.md) | CRITICAL | Enable `strict: true` in every tsconfig — without it, TypeScript is JavaScript with extra syntax |
| [NoUncheckedIndexAccess](../../Rules/TypeScript/NoUncheckedIndexAccess.md) | CRITICAL | Enable `noUncheckedIndexedAccess` so array and record indexing returns `T \| undefined` |
| [NeverAny](../../Rules/TypeScript/NeverAny.md) | CRITICAL | Replace `any` with `unknown` and narrow — `any` disables type checking and spreads virally |
| [NarrowBeforeUse](../../Rules/TypeScript/NarrowBeforeUse.md) | CRITICAL | Use type guards to prove types at runtime instead of `as` assertions that bypass safety |
| [BrandedForValidation](../../Rules/TypeScript/BrandedForValidation.md) | MEDIUM | Use branded types to distinguish semantically different values that share the same primitive type |

## Rule Interactions

**StrictModeAlways + NoUncheckedIndexAccess** form the compiler foundation. StrictModeAlways enables the core strict flags; NoUncheckedIndexAccess extends this to cover array and record indexing, which `strict: true` does not include. Both should be enabled together — they are not redundant.

**NeverAny + NarrowBeforeUse** are complementary. NeverAny eliminates `any` at the declaration site by replacing it with `unknown`. NarrowBeforeUse eliminates unsafe access to `unknown` values by requiring type guards before use. Together, they form a complete pattern: accept `unknown`, narrow to a specific type, use safely.

**BrandedForValidation + NarrowBeforeUse** interact at the validation boundary. Branded type constructors validate and brand in one step. The type guard pattern from NarrowBeforeUse can also be used to create brand-checking predicates (e.g., `isUserId(value): value is UserId`).

**NeverAny connects to ErrorHandling dimension**: `JSON.parse()` returns `any` — the immediate fix is to validate with Zod (see ErrorHandling dimension), which eliminates the `any` at the source.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **`strict: false` or missing strict in tsconfig.json** — The compiler is not checking nulls, implicit any, or unsafe binds. Every line of code is unverified. No amount of careful coding compensates for a permissive compiler.
- **`any` in function signatures** — A function parameter or return typed as `any` infects every caller. The infection is invisible because the code compiles without error while losing all type safety.
- **`as` assertion without preceding runtime check** — Casting `user as AdminUser` without verifying the value is an admin creates a type-level lie that crashes at runtime when the assumption is wrong.

### HIGH

- **Missing `noUncheckedIndexedAccess`** — Array and record indexing silently returns `T` instead of `T | undefined`. Every `array[i]` and `record[key]` is an unguarded access that can crash.
- **Non-null assertion operator (`!`) used to silence the compiler** — `value!.property` tells the compiler to ignore a null check. If the value is actually null, this crashes. Use optional chaining or narrow first.

### MEDIUM

- **Primitive types used for domain identifiers without branding** — Passing a `string` where a `UserId` is expected is a semantic error the compiler cannot catch without branded types. Low risk in small codebases, increasing risk as the domain grows.
- **Overly wide type assertions in tests** — `as unknown as T` in test factories is acceptable for partial mocks but should not leak into production code.

## Examples

**Example 1: Strict configuration audit**
```typescript
// tsconfig.json — complete strict setup
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

**Example 2: Unknown + narrowing replacing any**
```typescript
// Before: any spreads silently
function processEvent(event: any) {
  return event.payload.data;  // no checking
}

// After: unknown + type guard
interface AppEvent {
  type: string;
  payload: { data: unknown };
}

function isAppEvent(value: unknown): value is AppEvent {
  return (
    typeof value === "object" && value !== null &&
    "type" in value && "payload" in value
  );
}

function processEvent(event: unknown): unknown {
  if (!isAppEvent(event)) {
    throw new Error("Invalid event structure");
  }
  return event.payload.data;  // narrowed to AppEvent
}
```

**Example 3: Branded type for domain safety**
```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };
type Email = Brand<string, "Email">;

function Email(value: string): Email {
  if (!value.includes("@")) throw new Error(`Invalid email: ${value}`);
  return value as Email;
}

function sendEmail(to: Email, subject: string): void { /* ... */ }

// Compiler prevents passing raw strings
sendEmail("not-validated", "Hello");     // compile error
sendEmail(Email("user@example.com"), "Hello");  // works
```

## Does Not Cover

- **Runtime validation with Zod** — Covered in the ErrorHandling dimension (TS3). This dimension covers the type system; ErrorHandling covers runtime schema validation.
- **Generic type design** — Covered in the TypeModeling dimension (TS2). Generics are a modeling tool, not a safety mechanism.
- **Import and naming conventions** — Covered in the Conventions dimension (TS4). Type safety is about correctness, not style.

## Sources

- Matt Pocock, *Total TypeScript* — strict mode advocacy, branded types patterns, `unknown` over `any`
- TypeScript Handbook — Strict Mode, Type Narrowing, Branded Types sections
- Steve Kinney, *Frontend Masters TypeScript* — compiler configuration best practices
