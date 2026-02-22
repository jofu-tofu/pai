### CS4.4 Keep Methods Small

**Impact: MEDIUM (Easier to understand, test, and modify)**

Small methods with clear names are easier to read, test, and modify. Long methods mix multiple concerns, making bugs harder to find and changes riskier.

**Incorrect: Large method with multiple concerns**

```csharp
public async Task<OrderResult> ProcessOrder(Order order)
{
    // Validation (lines 1-20)
    if (order.Items.Count == 0)
        return OrderResult.Failed("No items");
    if (order.CustomerId <= 0)
        return OrderResult.Failed("Invalid customer");
    foreach (var item in order.Items)
    {
        if (item.Quantity <= 0)
            return OrderResult.Failed("Invalid quantity");
        // ... more validation
    }

    // Inventory check (lines 21-40)
    foreach (var item in order.Items)
    {
        var stock = await _inventory.GetStock(item.ProductId);
        if (stock < item.Quantity)
            return OrderResult.Failed("Insufficient stock");
        // ... more inventory logic
    }

    // Price calculation (lines 41-70)
    decimal subtotal = 0;
    foreach (var item in order.Items)
    {
        var price = await _pricing.GetPrice(item.ProductId);
        subtotal += price * item.Quantity;
        // ... discounts, taxes
    }

    // Payment processing (lines 71-100)
    // ... payment logic

    // Order creation (lines 101-130)
    // ... persistence logic

    return OrderResult.Success(orderId);
}
```

**Correct: Small methods with single purpose**

```csharp
public async Task<OrderResult> ProcessOrder(Order order)
{
    var validation = ValidateOrder(order);
    if (!validation.IsValid)
        return OrderResult.Failed(validation.Error);

    var stockCheck = await CheckInventoryAsync(order.Items);
    if (!stockCheck.Available)
        return OrderResult.Failed("Insufficient stock");

    var pricing = await CalculatePricingAsync(order.Items);

    var payment = await ProcessPaymentAsync(order.CustomerId, pricing.Total);
    if (!payment.Success)
        return OrderResult.Failed(payment.Error);

    var orderId = await CreateOrderAsync(order, pricing, payment);

    return OrderResult.Success(orderId);
}

private ValidationResult ValidateOrder(Order order)
{
    if (order.Items.Count == 0)
        return ValidationResult.Invalid("No items");
    if (order.CustomerId <= 0)
        return ValidationResult.Invalid("Invalid customer");
    // Focused validation logic
    return ValidationResult.Valid();
}

private async Task<StockCheckResult> CheckInventoryAsync(IEnumerable<OrderItem> items)
{
    // Focused inventory logic
}

private async Task<PricingResult> CalculatePricingAsync(IEnumerable<OrderItem> items)
{
    // Focused pricing logic
}
```

**Guideline: Methods should fit on one screen (~20-30 lines)**
