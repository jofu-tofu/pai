### CS4.1 Return Immutable Collections

**Impact: HIGH (Prevents callers from mutating internal state)**

Returning mutable collections exposes internal state. Callers can modify the returned collection, corrupting the object's data. Return immutable or read-only views instead.

**Incorrect: Returning mutable internal collection**

```csharp
public class ShoppingCart
{
    private readonly List<Item> _items = [];

    public List<Item> GetItems()
    {
        return _items;  // Caller gets reference to internal list
    }
}

// Caller can corrupt internal state
var cart = new ShoppingCart();
cart.AddItem(new Item("Book"));

var items = cart.GetItems();
items.Clear();  // Cart's internal state destroyed!
items.Add(new Item("Fake"));  // Injected unauthorized item
```

**Correct: Return read-only views**

```csharp
public class ShoppingCart
{
    private readonly List<Item> _items = [];

    // Option 1: IReadOnlyList property (preferred)
    public IReadOnlyList<Item> Items => _items;

    // Option 2: AsReadOnly() for List<T>
    public IReadOnlyList<Item> GetItems() => _items.AsReadOnly();

    // Option 3: Return copy if mutation of copy is needed
    public List<Item> GetItemsCopy() => [.._items];

    // Option 4: ImmutableList for full immutability guarantees
    public ImmutableList<Item> GetImmutableItems() => [.._items];
}

// Caller can read but not modify
var items = cart.Items;
// items.Clear();  // Won't compile - no Clear on IReadOnlyList
// items.Add(...); // Won't compile - no Add on IReadOnlyList
```

**Collection expression patterns (C# 12+):**

```csharp
public class UserGroup
{
    private readonly List<User> _members = [];

    // Return as read-only
    public IReadOnlyList<User> Members => _members;

    // Filter and return new immutable collection
    public IReadOnlyList<User> GetActiveMembers() =>
        [.. _members.Where(m => m.IsActive)];

    // Combine collections into new immutable result
    public IReadOnlyList<User> GetAllUsers(IEnumerable<User> additional) =>
        [.. _members, .. additional];
}
```
