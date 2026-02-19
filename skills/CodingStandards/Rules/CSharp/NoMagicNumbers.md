### 5.2 No Magic Numbers

**Impact: MEDIUM (Named constants explain intent)**

Literal numbers scattered through code are "magic" - their meaning is unclear. Named constants make code self-documenting and changes safer (update one place, not many).

**Incorrect: Magic numbers**

```csharp
public class OrderProcessor
{
    public decimal CalculateTotal(decimal subtotal)
    {
        // What is 0.08? Tax rate? Which jurisdiction?
        var tax = subtotal * 0.08m;

        // What is 100? Minimum for free shipping?
        if (subtotal > 100)
            return subtotal + tax;

        // What is 5.99? Shipping cost?
        return subtotal + tax + 5.99m;
    }

    public bool IsValidOrder(Order order)
    {
        // What do these numbers mean?
        return order.Items.Count <= 50
            && order.Items.All(i => i.Quantity <= 999)
            && order.TotalWeight <= 70;
    }
}
```

**Correct: Named constants**

```csharp
public class OrderProcessor
{
    private const decimal TaxRate = 0.08m;
    private const decimal FreeShippingThreshold = 100m;
    private const decimal StandardShippingCost = 5.99m;

    private const int MaxItemsPerOrder = 50;
    private const int MaxQuantityPerItem = 999;
    private const decimal MaxShippingWeightKg = 70m;

    public decimal CalculateTotal(decimal subtotal)
    {
        var tax = subtotal * TaxRate;

        if (subtotal > FreeShippingThreshold)
            return subtotal + tax;

        return subtotal + tax + StandardShippingCost;
    }

    public bool IsValidOrder(Order order)
    {
        return order.Items.Count <= MaxItemsPerOrder
            && order.Items.All(i => i.Quantity <= MaxQuantityPerItem)
            && order.TotalWeight <= MaxShippingWeightKg;
    }
}
```

**When literals are acceptable:**
- 0, 1, -1 in obvious contexts (initialization, increment)
- Mathematical constants (2 for doubling, 100 for percentage)
- Array indices when meaning is clear from context

```csharp
// These are fine
for (int i = 0; i < items.Count; i++)  // 0 is obvious
var doubled = value * 2;  // 2 is obvious
var percentage = ratio * 100;  // 100 is obvious
```
