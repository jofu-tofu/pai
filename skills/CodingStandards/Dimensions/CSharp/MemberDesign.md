# Member Design -- C\#

> Well-designed members -- methods, properties, and fields -- form the API surface that other code touches daily; getting signatures, visibility, and size right determines whether a codebase is a pleasure or a burden to work in.

## Mental Model

If architecture is about the shape of classes and their relationships, member design is about the shape of each class's surface. Every public method, property, and field is a promise to callers. The promise says: "Call me with these inputs, and I will give you this output, at this cost, with these guarantees." When those promises are well-crafted -- specific parameters, immutable returns, cheap property access, small focused methods, meaningful constants, and minimal visibility -- callers can write correct code almost by instinct. When they are poorly crafted, callers make assumptions that the implementation violates.

The six rules in this dimension address complementary aspects of member surface quality:

**ReturnImmutableCollections** ensures that returning a collection does not hand callers a reference to internal state. A `List<T>` return is a backdoor: callers can add, remove, or clear items and corrupt the object's invariants. Returning `IReadOnlyList<T>` closes that door while still allowing efficient enumeration and indexing.

**MethodOverProperty** draws the boundary between cheap access and expensive operations. Properties should behave like field access -- fast, idempotent, side-effect free. When an operation queries a database, generates a report, or performs any non-trivial computation, it should be a method. The naming convention alone (`report.Title` vs. `report.GenerateFullReport()`) signals to callers whether caching is needed.

**SpecificParameters** enforces minimal coupling at the method level. A method that accepts an entire `Order` object when it only uses `Order.TotalWeight` is coupled to the `Order` class and harder to test. Accepting `decimal totalWeight` or `IEnumerable<decimal> itemWeights` reduces coupling and makes the method reusable with any source of weight data.

**SmallMethods** limits method complexity. A method that fits on one screen (roughly 20-30 lines) has a single purpose, is easy to name, and is straightforward to test. Long methods mix multiple concerns: validation, data fetching, computation, and persistence interleaved in a single block. Extracting each concern into a named helper method makes the orchestration method read like a narrative.

**NoMagicNumbers** requires that literal values in code carry names. The number `0.08m` means nothing; `TaxRate` is self-documenting. Named constants also centralize changes: updating a rate in one constant propagates everywhere, while hunting for scattered `0.08m` literals risks missed updates.

**PrivateByDefault** establishes the visibility rule: everything starts `private` and is promoted only when a concrete need arises. Every public member is a commitment. Making something public that could be private creates coupling that constrains future refactoring.

Together these six rules create a coherent design philosophy: expose the minimum surface, make it self-documenting, keep it cheap and safe, and ensure each member has one clear purpose.

## Consumer Guide

### When Reviewing Code

- Check every method that returns a collection. If the return type is `List<T>`, `Dictionary<TKey, TValue>`, or another mutable type, flag it. The return should be `IReadOnlyList<T>`, `IReadOnlyDictionary<TKey, TValue>`, or an immutable equivalent.
- Look at property getters for expensive operations: database queries, file I/O, complex calculations, or network calls. These should be methods, not properties.
- Examine method signatures for over-broad parameter types. A method accepting `User user` but only accessing `user.Email` should accept `string email` instead.
- Flag methods longer than 30 lines. Look for natural boundaries where the method can be decomposed into named helpers.
- Search for literal numbers in logic (especially in conditionals, loop bounds, and arithmetic). Each should be a named constant unless it is a universally obvious value like 0, 1, or 100.
- Check visibility modifiers. If a method or property is `public` or `internal` but is only called from within the same class, it should be `private`.

### When Designing / Planning

- Define the public API of a class before implementing it. List only the methods and properties that external callers genuinely need. Everything else is private.
- For each public method, decide what the minimum set of parameters is. Accept interfaces (`IEnumerable<T>`, `IReadOnlyList<T>`) rather than concrete types when possible.
- Plan collection-returning methods to use read-only interfaces from the start. Changing a return type from `List<T>` to `IReadOnlyList<T>` later is a breaking change for callers that relied on mutability.
- Identify business constants (rates, limits, thresholds) during design and name them in a central location or within the relevant class.

### When Implementing

- Return `IReadOnlyList<T>` for ordered collections and `IReadOnlyCollection<T>` when order does not matter. Use `.AsReadOnly()` or collection expressions `[.._items]` for the backing implementation.
- Convert properties with side effects, I/O operations, or O(n) or worse complexity into methods. Name them as verbs: `CalculateTotal()`, `FetchCurrentPrice()`.
- Accept the narrowest parameter type that satisfies the method's needs. Prefer `string email` over `User user`, and `IEnumerable<decimal> weights` over `List<OrderItem> items`.
- Extract methods when a block of code within a method serves a distinct purpose. Name the extracted method to describe that purpose, making the calling method read as a sequence of steps.
- Declare constants with `const` for compile-time values and `static readonly` for values that require runtime initialization. Group related constants together.
- Start every new field, method, and class as `private`. Promote to `internal` when needed by another class in the same assembly, and to `public` only for the intentional external API.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [ReturnImmutableCollections](../../Rules/CSharp/ReturnImmutableCollections.md) | HIGH | Return IReadOnlyList/IReadOnlyCollection to prevent callers from mutating internal state |
| [MethodOverProperty](../../Rules/CSharp/MethodOverProperty.md) | HIGH | Use methods for expensive or side-effecting operations; properties should be cheap |
| [SpecificParameters](../../Rules/CSharp/SpecificParameters.md) | HIGH | Accept only the data a method needs, not entire parent objects |
| [SmallMethods](../../Rules/CSharp/SmallMethods.md) | MEDIUM | Keep methods under 30 lines with a single clear purpose |
| [NoMagicNumbers](../../Rules/CSharp/NoMagicNumbers.md) | MEDIUM | Replace literal values with named constants that explain intent |
| [PrivateByDefault](../../Rules/CSharp/PrivateByDefault.md) | MEDIUM | Start with private visibility and widen only when explicitly needed |

## Rule Interactions

- **ReturnImmutableCollections + PrivateByDefault**: Encapsulation works at two levels. PrivateByDefault hides the member entirely; ReturnImmutableCollections protects the data that must be exposed. A private backing `List<T>` exposed through a public `IReadOnlyList<T>` property is a textbook combination.
- **SpecificParameters + SmallMethods**: Methods with specific, narrow parameters tend to be small because they do less. A method that accepts three scalar values rather than an entire entity has a naturally constrained scope.
- **MethodOverProperty + SmallMethods**: Converting an expensive property into a method often reveals that the computation itself can be decomposed into smaller helper methods, further improving readability.
- **NoMagicNumbers + SmallMethods**: Named constants improve readability in any method, but the effect is most pronounced in small methods where the constant's role in the logic is immediately visible.
- **PrivateByDefault + SpecificParameters**: When internal helper methods are private, their parameter types can be changed freely without breaking external callers. This freedom encourages using the most specific parameter type.
- **ReturnImmutableCollections + SpecificParameters**: A method that returns `IReadOnlyList<T>` and accepts `IEnumerable<T>` communicates a clear contract: "Give me any sequence, I will give you back an immutable snapshot."

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Mutable collection return exposing internal state**: `public List<Item> Items => _items;` allows callers to `.Clear()` or `.Add()` arbitrary items, bypassing all validation and invariant enforcement. This can corrupt data silently.

### HIGH

- **Expensive property with database access**: A property getter that executes a SQL query. Callers will read it repeatedly (in loops, in templates, in logging) without realizing each read hits the database. Convert to an async method.
- **God method**: A single method of 200+ lines handling validation, business logic, persistence, and notification. Bugs hide in the interleaved concerns and the method is untestable as a unit.
- **Accepting entire entity when one field is needed**: A method taking `User user` but only accessing `user.Email` forces test code to construct full User objects and couples the method to User's structure.

### MEDIUM

- **Magic numbers in business logic**: `if (total > 100)` and `var tax = subtotal * 0.08m` scattered through code. When the threshold or rate changes, developers must find every occurrence. Named constants centralize the change.
- **Public helper methods**: Internal utility methods (`FormatDateString`, `SanitizeInput`) marked `public` when no external code calls them. This inflates the class's apparent API surface and constrains refactoring.
- **Premature optimization through visibility**: Making everything `internal` "in case another class needs it" rather than starting private. This weakens the signal of what the true public API is.

## Examples

**Immutable collection return with specific parameters**:

```csharp
public class OrderService
{
    private readonly List<Order> _orders = [];

    // Immutable return type, specific parameter
    public IReadOnlyList<Order> GetOrdersByStatus(OrderStatus status)
    {
        return [.. _orders.Where(o => o.Status == status)];
    }

    // Method (not property) for expensive operation
    public async Task<OrderSummary> CalculateSummaryAsync(
        int userId,
        CancellationToken ct)
    {
        var orders = await _repository.GetByUserAsync(userId, ct);
        return BuildSummary(orders);
    }

    // Private helper -- not exposed
    private OrderSummary BuildSummary(IReadOnlyList<Order> orders)
    {
        return new OrderSummary
        {
            Count = orders.Count,
            Total = orders.Sum(o => o.Total),
            AverageValue = orders.Average(o => o.Total)
        };
    }
}
```

**Small methods with named constants**:

```csharp
public class ShippingCalculator
{
    private const decimal FreeShippingThreshold = 75.00m;
    private const decimal StandardRate = 5.99m;
    private const decimal ExpressRate = 12.99m;
    private const decimal HeavyItemSurchargePerKg = 2.50m;
    private const decimal HeavyItemThresholdKg = 10.0m;

    public decimal Calculate(IEnumerable<decimal> itemWeights, bool express)
    {
        var totalWeight = itemWeights.Sum();
        var baseRate = express ? ExpressRate : StandardRate;

        if (QualifiesForFreeShipping(totalWeight))
            return 0m;

        return baseRate + CalculateHeavySurcharge(totalWeight);
    }

    private bool QualifiesForFreeShipping(decimal totalWeight) =>
        totalWeight <= HeavyItemThresholdKg;

    private decimal CalculateHeavySurcharge(decimal totalWeight) =>
        totalWeight > HeavyItemThresholdKg
            ? (totalWeight - HeavyItemThresholdKg) * HeavyItemSurchargePerKg
            : 0m;
}
```

## Does Not Cover

- **Class-level architecture** -- how to structure classes, choose between composition and inheritance, and define responsibilities is covered by the Architecture dimension (CS1).
- **Null safety in return types** -- whether methods should return null or empty collections is addressed by the Null Safety dimension (CS2).
- **Async method patterns** -- how to structure async method signatures, cancellation, and context is covered by the Async Patterns dimension (CS3).
- **Naming conventions** -- specific naming rules (PascalCase for methods, camelCase for parameters) are language conventions outside the scope of member design principles.
- **XML documentation** -- whether and how to document public members is a documentation concern.

## Sources

- C# Coding Guidelines (csharpcodingguidelines.com) -- AV1500 series (Member Design), AV1515 (Properties), AV1521 (Parameters)
- .NET Framework Design Guidelines -- Member Design Guidelines
- Robert C. Martin, *Clean Code* -- Functions chapter (small methods, single purpose)
