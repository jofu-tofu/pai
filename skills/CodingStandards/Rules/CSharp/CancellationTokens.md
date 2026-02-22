### CS3.3 Honor Cancellation Tokens

**Impact: HIGH (Long operations need graceful cancellation)**

Cancellation tokens allow callers to abort long-running operations. Ignoring tokens wastes resources and leaves users waiting for operations they've already abandoned.

**Incorrect: Ignoring cancellation tokens**

```csharp
// Token accepted but never used
public async Task<List<Report>> GenerateReportsAsync(
    int[] ids,
    CancellationToken ct)
{
    var reports = new List<Report>();
    foreach (var id in ids)
    {
        // No cancellation check - runs to completion even if cancelled
        var data = await FetchDataAsync(id);
        reports.Add(GenerateReport(data));
    }
    return reports;
}

// Token not passed to inner async calls
public async Task<User> GetUserWithOrdersAsync(int id, CancellationToken ct)
{
    var user = await _db.Users.FindAsync(id);  // Token not passed!
    var orders = await _db.Orders.Where(o => o.UserId == id).ToListAsync();
    return user;
}
```

**Correct: Check and propagate cancellation tokens**

```csharp
// Check token in loops, pass to all async calls
public async Task<List<Report>> GenerateReportsAsync(
    int[] ids,
    CancellationToken ct)
{
    var reports = new List<Report>();
    foreach (var id in ids)
    {
        ct.ThrowIfCancellationRequested();  // Check before each iteration

        var data = await FetchDataAsync(id, ct);  // Pass token
        reports.Add(GenerateReport(data));
    }
    return reports;
}

// Pass token to all async operations
public async Task<User?> GetUserWithOrdersAsync(int id, CancellationToken ct)
{
    var user = await _db.Users.FindAsync(new object[] { id }, ct);
    if (user is null) return null;

    var orders = await _db.Orders
        .Where(o => o.UserId == id)
        .ToListAsync(ct);

    user.Orders = orders;
    return user;
}

// CPU-bound work should also check
public List<Result> ProcessItems(IEnumerable<Item> items, CancellationToken ct)
{
    var results = new List<Result>();
    foreach (var item in items)
    {
        ct.ThrowIfCancellationRequested();
        results.Add(Process(item));
    }
    return results;
}
```

**Guidelines:**
- Accept `CancellationToken ct` as last parameter
- Pass token to all async method calls
- Check `ThrowIfCancellationRequested()` in loops
- Use `ct.Register()` for cleanup on cancellation
