### 4.2 Use Methods for Expensive Operations

**Impact: HIGH (Properties imply cheap access)**

Properties should be fast and side-effect free. Developers expect properties to behave like field access - reading a property multiple times should be safe and cheap. Use methods when operations are expensive or have side effects.

**Incorrect: Expensive operations as properties**

```csharp
public class ReportGenerator
{
    // Looks cheap, actually expensive
    public Report FullReport
    {
        get
        {
            // Takes seconds, called every time property is read
            return GenerateFullReport(_data);
        }
    }

    // Side effect in property getter
    public User CurrentUser
    {
        get
        {
            _accessCount++;  // Side effect!
            return _user;
        }
    }

    // Network call hidden in property
    public decimal StockPrice => FetchCurrentPrice(_symbol);
}

// Caller assumes this is cheap
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(generator.FullReport.Title);  // 10 full reports generated!
}
```

**Correct: Methods signal cost, properties are cheap**

```csharp
public class ReportGenerator
{
    // Method signals this might take time
    public Report GenerateFullReport()
    {
        return GenerateFullReport(_data);
    }

    // Property is just field access
    public User CurrentUser => _user;

    // Separate property for access tracking
    public int AccessCount => _accessCount;
    public void RecordAccess() => _accessCount++;

    // Method for network operations
    public async Task<decimal> FetchStockPriceAsync()
    {
        return await FetchCurrentPrice(_symbol);
    }
}

// Caller knows to cache the result
var report = generator.GenerateFullReport();
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(report.Title);  // Reuses single report
}
```

**Property guidelines:**
- Should complete instantly (O(1) or close)
- Should be idempotent (same value on repeated reads)
- Should have no visible side effects
- Use `Async` suffix for async operations (always methods)
