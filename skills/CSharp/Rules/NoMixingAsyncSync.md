### 3.2 Never Mix Async and Sync

**Impact: HIGH (Task.Wait causes deadlocks in sync contexts)**

Calling `.Result` or `.Wait()` on a task from synchronous code blocks the thread. In contexts with a synchronization context (UI, ASP.NET), this causes deadlocks.

**Incorrect: Blocking on async from sync code**

```csharp
// Deadlock in ASP.NET/UI: sync context captured, then blocked
public string GetData()
{
    // DEADLOCK: Thread blocks waiting for task
    // Task is waiting for thread to continue (sync context)
    return GetDataAsync().Result;
}

public void ProcessData()
{
    // Same problem with .Wait()
    ProcessDataAsync().Wait();  // Deadlock
}

// Also problematic: GetAwaiter().GetResult() can deadlock
public User GetUser(int id)
{
    return GetUserAsync(id).GetAwaiter().GetResult();  // Deadlock risk
}
```

**Correct: Async all the way**

```csharp
// Async method calls async method
public async Task<string> GetDataAsync()
{
    return await FetchFromApiAsync();
}

public async Task ProcessDataAsync()
{
    var data = await GetDataAsync();
    await SaveDataAsync(data);
}

// If you must call async from sync (rare), use proper patterns
public string GetDataSync()
{
    // Only use in console apps or when no sync context exists
    return Task.Run(async () => await GetDataAsync()).Result;
}
```

**Entry points should be async:**

```csharp
// ASP.NET Controller
public async Task<IActionResult> GetUser(int id)
{
    var user = await _userService.GetUserAsync(id);
    return Ok(user);
}

// Console app Main
public static async Task Main(string[] args)
{
    await RunAsync();
}
```

**When blocking is acceptable:**
- Console applications without sync context
- Test methods (with caution)
- Truly synchronous APIs that can't be changed
- Use `ConfigureAwait(false)` to avoid capturing context
