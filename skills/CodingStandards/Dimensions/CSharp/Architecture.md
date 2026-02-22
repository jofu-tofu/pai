# Architecture -- C\#

> Sound type design is the foundation of maintainable C# systems; every class should have one job, depend on narrow interfaces, favor composition over inheritance, and guard its own state.

## Mental Model

C# architecture revolves around a single governing idea: **boundaries define quality**. Every type in your system is a boundary -- between what callers can see and what remains internal, between one responsibility and another, between stable contracts and volatile implementations. When those boundaries are drawn well, changes stay local, tests stay simple, and the codebase scales without accumulating friction.

Think of a well-architected C# project as a collection of small, sealed rooms connected by narrow doors. Each room (class) does one thing. The doors (interfaces) expose only what the next room needs. No room reaches into another's drawers (encapsulation), and rooms are bolted together with screws (composition), not welded into a rigid frame (inheritance). When requirements change, you unbolt and replace a single room rather than re-welding the frame.

The four rules in this dimension enforce that mental model from different angles. **SingleResponsibility** ensures each class has one reason to change, so a modification to email logic never risks breaking database persistence. **InterfaceSegregation** keeps the doors narrow: a consumer that only reads users should never see write or notification methods. **PreferComposition** replaces fragile inheritance trees with pluggable behavior objects, allowing runtime flexibility and eliminating Liskov Substitution violations. **EncapsulateState** locks the drawers: internal collections and fields are hidden behind controlled methods, so callers cannot corrupt invariants.

These four rules reinforce each other. A class that follows SingleResponsibility naturally produces small interfaces (InterfaceSegregation). A class assembled from composed behaviors (PreferComposition) has less internal state to protect, and what remains is easier to encapsulate (EncapsulateState). Violating any one rule weakens the others -- a god class with public mutable fields and a deep inheritance tree is the predictable result when all four fail simultaneously.

## Consumer Guide

### When Reviewing Code

- Check that each class has a single, clearly statable responsibility. If you struggle to describe what a class does in one sentence without the word "and", it likely violates SingleResponsibility.
- Look for interfaces with more than five or six methods. Large interfaces are a smell -- consumers depend on methods they never call.
- Flag inheritance hierarchies deeper than two levels. Ask whether composition would give the same behavior with less coupling.
- Scan for public fields, public setters on collection properties, or methods that return mutable internal collections. Each is an encapsulation breach that invites external corruption.

### When Designing / Planning

- Start every new feature by identifying responsibilities. Each responsibility maps to one class. If a feature touches users, persistence, and notifications, plan three classes, not one.
- Define interfaces before implementations. Write the narrowest contract a consumer needs, then implement behind it. This naturally drives InterfaceSegregation.
- Default to composition. Reach for inheritance only when there is a true "is-a" relationship with a stable base class (e.g., inheriting from ASP.NET's `ControllerBase`).
- Decide early which state is internal. Mark fields private, expose read-only views of collections, and provide mutation through well-named methods that enforce invariants.

### When Implementing

- Apply the "one constructor, few dependencies" heuristic. If a constructor takes more than three or four dependencies, the class likely has too many responsibilities.
- When two classes share behavior, extract a shared component and inject it rather than creating a base class.
- Use `private set`, `init`, or `readonly` on every property unless external mutation is explicitly required.
- Return `IReadOnlyList<T>` or `IReadOnlyCollection<T>` for collection properties. Never expose the backing `List<T>` directly.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [SingleResponsibility](../../Rules/CSharp/SingleResponsibility.md) | CRITICAL | Each class should have exactly one reason to change |
| [InterfaceSegregation](../../Rules/CSharp/InterfaceSegregation.md) | CRITICAL | Keep interfaces small so consumers depend only on what they use |
| [PreferComposition](../../Rules/CSharp/PreferComposition.md) | CRITICAL | Assemble behavior from injected components instead of inheriting it |
| [EncapsulateState](../../Rules/CSharp/EncapsulateState.md) | CRITICAL | Hide internal fields and collections behind controlled access |

## Rule Interactions

- **SingleResponsibility + InterfaceSegregation**: Splitting a class into single-responsibility units often reveals the natural interface boundaries. A reader component and a writer component expose two small interfaces rather than one large one.
- **PreferComposition + EncapsulateState**: Composed dependencies are stored as private readonly fields. The encapsulation rule ensures those fields remain hidden and that no external code can swap implementations after construction.
- **InterfaceSegregation + PreferComposition**: Narrow interfaces become the injection points for composed behaviors. A class accepts `IMovementBehavior` rather than a concrete `Bird` base class, enabling runtime flexibility.
- **All four together**: A class with one responsibility, narrow interface contracts, composed dependencies, and encapsulated state is inherently testable, loosely coupled, and resilient to change.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **God class**: A single class handling validation, persistence, notification, and reporting. Every change to any concern risks breaking the others. Refactor immediately by extracting each responsibility into its own class.
- **Publicly mutable collections**: `public List<Order> Orders { get; set; }` allows callers to replace or clear the collection. Internal invariants (ordering, capacity limits) are unenforceable.

### HIGH

- **Deep inheritance hierarchies**: Three or more levels of inheritance create fragile chains where base class changes cascade unpredictably. Extract shared behavior into components and compose.
- **Fat interfaces**: An interface with ten methods forces every implementer and mock to address all ten, even when only two are relevant. Split into focused role interfaces.

### MEDIUM

- **Premature abstraction**: Creating interfaces and composition layers for code that has a single implementation and no foreseeable variation. This adds indirection without benefit. Wait for the second use case before abstracting.
- **Anemic domain models**: Classes that are pure data bags with no behavior, where all logic lives in external service classes. Some state and its directly related behavior should live together.

## Examples

**Composition replacing inheritance**:

```csharp
// Before: Fragile hierarchy
public class SqlRepository : BaseRepository { ... }
public class CachedRepository : SqlRepository { ... } // Tight coupling

// After: Composed behaviors
public class CachedRepository : IRepository
{
    private readonly IRepository _inner;
    private readonly ICache _cache;

    public CachedRepository(IRepository inner, ICache cache)
    {
        _inner = inner;
        _cache = cache;
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken ct)
    {
        if (_cache.TryGet(id, out User? user)) return user;
        user = await _inner.GetByIdAsync(id, ct);
        if (user is not null) _cache.Set(id, user);
        return user;
    }
}
```

**Encapsulated aggregate root**:

```csharp
public class ShoppingCart
{
    private readonly List<CartItem> _items = [];

    public IReadOnlyList<CartItem> Items => _items;
    public decimal Total => _items.Sum(i => i.Price * i.Quantity);

    public void AddItem(CartItem item)
    {
        ArgumentNullException.ThrowIfNull(item);
        if (item.Quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(item));

        _items.Add(item);
    }

    public bool RemoveItem(int productId) =>
        _items.RemoveAll(i => i.ProductId == productId) > 0;
}
```

## Does Not Cover

- **Project structure and folder conventions** -- this dimension addresses type-level design, not solution organization or layer naming.
- **Dependency injection container configuration** -- how to register services in `IServiceCollection` is a framework concern, not an architectural principle.
- **Null safety** -- nullable reference types and null-return patterns are covered by the Null Safety dimension (CS2).
- **Async patterns** -- how to structure async methods and cancellation is covered by the Async Patterns dimension (CS3).
- **Method-level design** -- parameter specificity, return types, and method size are covered by the Member Design dimension (CS4).

## Sources

- C# Coding Guidelines (csharpcodingguidelines.com) -- AV1000 series (Type Design)
- .NET Framework Design Guidelines -- Type Design Guidelines
- Robert C. Martin, *Clean Architecture* -- Single Responsibility Principle, Dependency Inversion
