### 3.1 Async for I/O-Bound Operations Only

**Impact: HIGH (Async releases threads during waits, not CPU work)**

Async/await is designed for I/O-bound operations where the thread waits for external resources. Using async for CPU-bound work adds overhead without benefit - use `Task.Run` instead.

**Incorrect: Async for CPU-bound work**

```csharp
// Wasteful: async for computation
public async Task<int> CalculatePrimeAsync(int n)
{
    // CPU-bound work - async adds overhead, doesn't help
    return await Task.FromResult(CalculatePrime(n));
}

// Worse: Wrapping sync in Task.Run inside async method
public async Task<Report> GenerateReportAsync(Data data)
{
    // This just moves CPU work to thread pool, defeating async purpose
    return await Task.Run(() => GenerateCpuIntensiveReport(data));
}
```

**Correct: Async for I/O, sync or Task.Run for CPU**

```csharp
// Async for I/O: thread released while waiting for database
public async Task<User?> GetUserAsync(int id, CancellationToken ct)
{
    return await _dbContext.Users
        .FirstOrDefaultAsync(u => u.Id == id, ct);
}

// Async for I/O: thread released while waiting for HTTP response
public async Task<string> FetchDataAsync(string url, CancellationToken ct)
{
    using var response = await _httpClient.GetAsync(url, ct);
    return await response.Content.ReadAsStringAsync(ct);
}

// Sync method for CPU-bound work
public int CalculatePrime(int n)
{
    // Pure computation - no async needed
    return ComputeNthPrime(n);
}

// Let caller decide about Task.Run for CPU work
public Report GenerateReport(Data data)
{
    return GenerateCpuIntensiveReport(data);
}

// Caller can use Task.Run if they need to offload
var report = await Task.Run(() => service.GenerateReport(data));
```

**I/O-bound (use async):**
- Database queries
- HTTP requests
- File I/O
- Network calls

**CPU-bound (don't use async):**
- Calculations
- Data transformations
- Image processing
- Compression
