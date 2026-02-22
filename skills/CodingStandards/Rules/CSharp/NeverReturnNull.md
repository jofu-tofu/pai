### CS2.2 Never Return Null Collections

**Impact: CRITICAL (Eliminates null checks at every call site)**

Returning null for "no items" forces every caller to check for null before iterating. Return empty collections instead - callers can safely iterate without null checks.

**Incorrect: Null for empty collections**

```csharp
public class OrderService
{
    public List<Order>? GetOrdersByUser(int userId)
    {
        var orders = _repository.FindByUser(userId);
        return orders.Any() ? orders : null;  // Null for "no orders"
    }
}

// Every caller must check for null
var orders = service.GetOrdersByUser(userId);
if (orders != null)  // Required null check
{
    foreach (var order in orders)
    {
        // ...
    }
}

// Easy to forget the check
var total = service.GetOrdersByUser(userId).Sum(o => o.Total);  // NullReferenceException
```

**Correct: Empty collection for no items**

```csharp
public class OrderService
{
    public IReadOnlyList<Order> GetOrdersByUser(int userId)
    {
        var orders = _repository.FindByUser(userId);
        return orders;  // Empty list if no orders, never null
    }
}

// Callers can iterate safely without null checks
var orders = service.GetOrdersByUser(userId);
foreach (var order in orders)  // Works for empty list
{
    // ...
}

// LINQ operations work directly
var total = service.GetOrdersByUser(userId).Sum(o => o.Total);  // Returns 0 for empty
```

**Use collection expressions (C# 12+) for empty returns:**

```csharp
public IReadOnlyList<Order> GetPendingOrders()
{
    if (!_hasPendingOrders)
        return [];  // Empty collection expression

    return _repository.GetPending();
}
```

**Standard empty collection patterns:**

```csharp
// Arrays
return Array.Empty<Order>();  // Cached empty array

// Lists (return interface, not concrete type)
return Enumerable.Empty<Order>().ToList();

// Modern C# 12+
return [];  // Collection expression - compiler picks optimal type
```
