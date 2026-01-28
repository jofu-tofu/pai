### 4.3 Accept Specific Parameters

**Impact: HIGH (Accept only needed data, not entire objects)**

Methods should accept only the data they need, not entire objects containing that data. This reduces coupling, improves testability, and makes dependencies explicit.

**Incorrect: Accepting entire objects**

```csharp
// Takes entire User when only email is needed
public void SendWelcomeEmail(User user)
{
    _emailService.Send(user.Email, "Welcome!");
}

// Takes entire Order when only calculating shipping
public decimal CalculateShipping(Order order)
{
    return order.Items.Sum(i => i.Weight) * _ratePerKg;
}

// Hard to test - must construct entire Order
[Test]
public void CalculateShipping_ReturnsCorrectAmount()
{
    var order = new Order
    {
        Id = 1,
        UserId = 1,
        CreatedAt = DateTime.Now,
        Status = OrderStatus.Pending,
        // ... many other required properties
        Items = [new OrderItem { Weight = 2.5m }]
    };
    var result = _service.CalculateShipping(order);
}
```

**Correct: Accept only what's needed**

```csharp
// Takes only what's needed
public void SendWelcomeEmail(string email)
{
    _emailService.Send(email, "Welcome!");
}

// Takes the specific data required
public decimal CalculateShipping(IEnumerable<decimal> itemWeights)
{
    return itemWeights.Sum() * _ratePerKg;
}

// Or with a focused interface
public interface IShippable
{
    decimal TotalWeight { get; }
}

public decimal CalculateShipping(IShippable item)
{
    return item.TotalWeight * _ratePerKg;
}

// Easy to test
[Test]
public void CalculateShipping_ReturnsCorrectAmount()
{
    var weights = new[] { 2.5m, 1.0m };
    var result = _service.CalculateShipping(weights);
    Assert.Equal(3.5m * _ratePerKg, result);
}
```

**Benefits:**
- Clearer API - parameters show what's actually used
- Easier testing - no need to construct complex objects
- Better reusability - works with any source of the data
- Reduced coupling - method doesn't depend on User/Order structure
