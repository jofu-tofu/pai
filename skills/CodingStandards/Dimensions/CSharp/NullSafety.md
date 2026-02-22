# Null Safety -- C\#

> Null reference exceptions are the most common runtime crash in C# codebases; the nullable reference types system, combined with disciplined API design, moves null from a runtime surprise to a compile-time decision.

## Mental Model

Every C# reference type historically carried an invisible second value: null. This shadow value flows silently through assignments, method returns, and collection elements until it reaches a member access and detonates as a `NullReferenceException`. The nullable reference types feature, introduced in C# 8, makes that shadow visible. When you enable the nullable context, the compiler tracks which references can be null (`string?`) and which cannot (`string`), and it warns when you treat a maybe-null value as definitely-not-null.

Think of null safety as a contract system. Each method signature becomes a promise: "I will never return null here" or "I might return null here, and you must handle it." When those contracts are enforced by the compiler, the burden shifts from runtime vigilance to compile-time verification. Callers no longer need defensive null checks at every call site -- they only check where the type system says null is possible.

The four rules in this dimension build a complete null safety strategy. **EnableNullableContext** turns on the compiler's tracking, making nullability an explicit part of every type signature. **NeverReturnNull** for collections eliminates the most common source of unnecessary null checks -- when "no results" is represented as an empty collection rather than null, every caller can iterate safely without a guard clause. **NullConditionalOperators** provide concise syntax for navigating nullable chains, replacing deeply nested `if (x != null)` blocks with readable `x?.Property?.Method()` expressions. **RequiredProperties** close the construction gap by ensuring that objects cannot be created with missing mandatory data, catching incomplete initialization at compile time rather than discovering it as a null field at runtime.

Together these rules create a layered defense: the nullable context provides the warning infrastructure, return-type discipline eliminates unnecessary nulls at API boundaries, operators provide safe navigation when null is genuinely possible, and required properties prevent null from entering through object construction.

## Consumer Guide

### When Reviewing Code

- Verify that the project or file has `#nullable enable` or the `.csproj` contains `<Nullable>enable</Nullable>`. Without the nullable context, none of the other rules have compiler backing.
- Flag any method that returns `null` for a collection type. The return type should be `IReadOnlyList<T>` (non-nullable), and the "no results" case should return an empty collection or `[]`.
- Look for verbose nested null checks (`if (x != null) { if (x.Y != null) { ... } }`). Replace these with null-conditional chains (`x?.Y?.Z`).
- Check DTOs, request objects, and configuration classes for properties that must always be set. These should use the `required` modifier (C# 11+) so the compiler rejects incomplete initialization.
- Watch for nullable suppression (`!`) operator usage. Each use is an assertion that bypasses the compiler's null tracking. Flag every instance and verify it is justified with a comment.

### When Designing / Planning

- Decide at the project level whether nullable reference types will be enabled globally (recommended) or file-by-file. Global enablement provides consistent guarantees.
- For every method return type, ask: "Can this legitimately be absent?" If yes, use `T?`. If no, use `T` and ensure the implementation never returns null.
- Design collection-returning APIs to always return non-null collections. Use `IReadOnlyList<T>` as the return type and `[]` or `Array.Empty<T>()` for empty cases.
- For data transfer objects and configuration classes, identify which properties are mandatory at construction time. Mark them `required` and use `init` setters to prevent post-construction mutation.

### When Implementing

- Enable nullable context at the project level in `.csproj`: `<Nullable>enable</Nullable>`. Avoid per-file `#nullable enable` unless migrating incrementally.
- Use `string?`, `User?`, etc. for values that can legitimately be absent. Use non-nullable types for values that must always exist.
- Replace `return null` with `return []` for collection returns. Use `Array.Empty<T>()` when targeting older frameworks without collection expressions.
- Chain null-conditional operators with null-coalescing for defaults: `user?.Address?.City ?? "Unknown"`.
- Use pattern matching (`is not null`, `is { Property: var x }`) for more complex null handling scenarios rather than `!= null`.
- Apply `required` to properties that must be set during initialization. Use `[SetsRequiredMembers]` on constructors that fulfill all requirements.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [EnableNullableContext](../../Rules/CSharp/EnableNullableContext.md) | CRITICAL | Turn on compiler null tracking to catch null bugs before runtime |
| [NeverReturnNull](../../Rules/CSharp/NeverReturnNull.md) | CRITICAL | Return empty collections instead of null to eliminate caller null checks |
| [NullConditionalOperators](../../Rules/CSharp/NullConditionalOperators.md) | CRITICAL | Use `?.` and `??` instead of nested null-check blocks |
| [RequiredProperties](../../Rules/CSharp/RequiredProperties.md) | CRITICAL | Mark mandatory properties `required` to prevent incomplete construction |

## Rule Interactions

- **EnableNullableContext + NeverReturnNull**: The nullable context makes the non-nullable return type a compiler-enforced contract. When `GetOrders()` returns `IReadOnlyList<Order>` (not `IReadOnlyList<Order>?`), the compiler guarantees callers will never receive null, and the compiler will warn inside the implementation if a code path could return null.
- **EnableNullableContext + NullConditionalOperators**: The nullable context tells you where null is possible. Null-conditional operators are the tool for safely navigating those nullable paths. Without the context, you cannot tell which chains genuinely need `?.`.
- **NeverReturnNull + RequiredProperties**: Both rules attack the same problem from opposite ends. NeverReturnNull ensures methods do not produce unnecessary nulls. RequiredProperties ensures objects are not constructed with missing data. Together they minimize the number of nullable references flowing through the system.
- **NullConditionalOperators + RequiredProperties**: When required properties guarantee that an object's mandatory fields are populated, null-conditional navigation is only needed for genuinely optional nested properties, reducing operator noise.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Nullable context disabled on a project with runtime NullReferenceExceptions**: The compiler cannot help if the feature is off. Enable it globally and address warnings incrementally.
- **Returning null for collections**: `return null` where `return []` should be used forces every caller into a null check. A single missed check produces a runtime crash.

### HIGH

- **Excessive nullable suppression (`!`)**: Each `!` is an unchecked assertion. More than a few per file suggests the nullable annotations are wrong or the code is fighting the type system.
- **Using `string.IsNullOrEmpty()` checks instead of nullable types**: When the nullable context is enabled, relying on runtime string checks rather than `string?` annotations bypasses compile-time safety.

### MEDIUM

- **Optional properties that should be required**: A DTO where `Email` is `string?` but every consumer throws if it is null. The property should be `required string Email { get; init; }`.
- **Overusing null-coalescing assignment**: `x ??= new Foo()` is convenient but can mask design issues where the value should have been required at construction time.

## Examples

**Nullable context with safe collection returns**:

```csharp
#nullable enable

public class OrderService
{
    private readonly IOrderRepository _repository;

    public OrderService(IOrderRepository repository) => _repository = repository;

    // Non-nullable return: callers never need to check for null
    public IReadOnlyList<Order> GetOrdersByUser(int userId)
    {
        var orders = _repository.FindByUser(userId);
        return orders.Any() ? orders : [];
    }

    // Nullable return: caller must handle absence
    public Order? GetOrderById(int id)
    {
        return _repository.Find(id);
    }
}

// Caller code -- compiler guides usage
var orders = service.GetOrdersByUser(userId);
foreach (var order in orders) // Safe: never null
{
    Console.WriteLine(order.Total);
}

var order = service.GetOrderById(42);
if (order is not null) // Required: type is Order?
{
    Console.WriteLine(order.Total);
}
```

**Required properties preventing incomplete construction**:

```csharp
public class CreateUserRequest
{
    public required string Email { get; init; }
    public required string Name { get; init; }
    public required string Password { get; init; }
    public string? Nickname { get; init; } // Genuinely optional
}

// Compile error if required properties are missing
var request = new CreateUserRequest
{
    Email = "user@example.com",
    Name = "Jane Doe",
    Password = "secure"
    // Nickname can be omitted -- it is truly optional
};
```

## Does Not Cover

- **Type design and class structure** -- deciding how many classes to create and how they relate is covered by the Architecture dimension (CS1).
- **Async null patterns** -- how to handle null in async method returns (e.g., `Task<User?>`) is covered by the Async Patterns dimension (CS3).
- **Validation frameworks** -- runtime validation with FluentValidation or DataAnnotations is a separate concern from compile-time null safety.
- **Database NULL mapping** -- how Entity Framework maps nullable columns is an ORM concern, not a language-level null safety rule.

## Sources

- Microsoft Learn -- Nullable reference types documentation
- C# Coding Guidelines (csharpcodingguidelines.com) -- AV1130, AV1135 (Null Safety)
- .NET API Design Guidelines -- Null and empty collection conventions
