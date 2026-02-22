# Async Patterns -- C\#

> Async/await in C# exists to release threads during I/O waits; misusing it for CPU-bound work, mixing it with synchronous blocking, or ignoring cancellation turns a concurrency tool into a source of deadlocks and resource waste.

## Mental Model

The async/await machinery in C# is fundamentally about **thread efficiency during waiting**. When a method hits `await _httpClient.GetAsync(url)`, the thread is released back to the thread pool while the network request completes. No thread is consumed during the wait. When the response arrives, a thread picks up execution from where it left off. This is the entire value proposition: under load, a server can handle thousands of concurrent I/O operations without thousands of blocked threads.

The model breaks down in three predictable ways, and the four rules in this dimension address each failure mode. First, developers apply async to **CPU-bound work** where no waiting occurs. Wrapping a computation in `Task.FromResult` or `Task.Run` inside an async method adds overhead without releasing any thread during actual work. **AsyncForIoBound** draws the line: async is for database queries, HTTP calls, and file operations -- not for number crunching or data transformation.

Second, developers **mix async and sync** by calling `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` on a task from synchronous code. In environments with a synchronization context (ASP.NET pre-Core, WPF, WinForms), this creates a deadlock: the calling thread blocks waiting for the task, while the task is waiting for the calling thread to become available so it can resume on the sync context. **NoMixingAsyncSync** enforces the principle of "async all the way" -- once a call chain goes async, every caller must also be async up to the entry point.

Third, long-running operations ignore **cancellation tokens**. A user navigates away or a request times out, but the server continues processing a report nobody wants. **CancellationTokens** mandates that every async method accepts a `CancellationToken`, passes it to all inner async calls, and checks it in loops.

Fourth, **library code captures the synchronization context** unnecessarily. When a library awaits without `ConfigureAwait(false)`, it insists on resuming on the original context, which can deadlock when that context is blocked. **ConfigureAwaitContext** establishes the rule: library code always uses `ConfigureAwait(false)`; application code (which needs UI thread access or request context) omits it.

These four rules form a complete async discipline. Apply async only to I/O. Never block on it from sync. Always support cancellation. And configure the context correctly based on whether you are writing library or application code.

## Consumer Guide

### When Reviewing Code

- Check every `async` method for what it actually awaits. If the awaited operations are all CPU-bound computations wrapped in `Task.Run` or `Task.FromResult`, the method should not be async.
- Search for `.Result`, `.Wait()`, and `.GetAwaiter().GetResult()` in the codebase. Each is a potential deadlock. Verify that they only appear in console application entry points or other contexts without a synchronization context.
- Verify that every async method accepting a `CancellationToken` actually uses it: passing it to inner async calls and checking `ThrowIfCancellationRequested()` in loops.
- In library or shared code, confirm that every `await` is followed by `.ConfigureAwait(false)`. In ASP.NET Core application code, `ConfigureAwait` is unnecessary (no sync context by default).

### When Designing / Planning

- Identify which operations in your feature are I/O-bound (database, HTTP, file system) versus CPU-bound (calculations, transformations). Only the I/O-bound operations should be async.
- Plan the async chain from the entry point (controller action, event handler) down to the lowest I/O call. Every method in the chain must be async. Do not plan for synchronous wrappers around async internals.
- Include `CancellationToken` in every service interface method signature from the start. Adding it later requires changing every implementation and caller.
- Decide whether code is library-level (shared across projects/contexts) or application-level. This determines `ConfigureAwait` usage.

### When Implementing

- Suffix async methods with `Async`: `GetUserAsync`, `SaveOrderAsync`. This convention signals to callers that they must await or handle the Task.
- Accept `CancellationToken ct` as the last parameter. Pass it to every `async` call: `await _db.SaveChangesAsync(ct)`.
- In loops that process items with async calls, add `ct.ThrowIfCancellationRequested()` at the beginning of each iteration.
- For CPU-bound work that must run off the calling thread, let the caller use `Task.Run(() => CpuBoundMethod())` rather than hiding `Task.Run` inside the method.
- In library code, chain `.ConfigureAwait(false)` on every await expression. In ASP.NET Core controllers and middleware, omit it.
- Never return `async void` except in event handlers. Use `async Task` so callers can observe exceptions and await completion.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [AsyncForIoBound](../../Rules/CSharp/AsyncForIoBound.md) | HIGH | Reserve async/await for I/O operations; keep CPU work synchronous |
| [NoMixingAsyncSync](../../Rules/CSharp/NoMixingAsyncSync.md) | HIGH | Never call .Result or .Wait() on tasks from synchronous code |
| [CancellationTokens](../../Rules/CSharp/CancellationTokens.md) | HIGH | Accept, propagate, and check cancellation tokens in all async paths |
| [ConfigureAwaitContext](../../Rules/CSharp/ConfigureAwaitContext.md) | HIGH | Use ConfigureAwait(false) in library code to prevent context capture |

## Rule Interactions

- **AsyncForIoBound + NoMixingAsyncSync**: When async is correctly reserved for I/O, the temptation to wrap sync-over-async disappears. Developers who incorrectly make CPU methods async often create the blocking calls that NoMixingAsyncSync forbids.
- **NoMixingAsyncSync + ConfigureAwaitContext**: Deadlocks from `.Result` occur because the awaiter tries to resume on a captured sync context while the thread owning that context is blocked. `ConfigureAwait(false)` mitigates (but does not eliminate) this by not capturing the context. Both rules together provide defense in depth.
- **CancellationTokens + AsyncForIoBound**: Cancellation is most valuable in I/O-bound chains where operations involve external latency. A cancelled HTTP request stops the network wait; cancelling a CPU computation inside `Task.Run` requires cooperative checks via the same token mechanism.
- **All four together**: A well-structured async method awaits only I/O, propagates cancellation, configures context correctly, and never calls itself synchronously. This combination eliminates deadlocks, resource waste, and unresponsive operations.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Deadlock from sync-over-async**: `var result = GetDataAsync().Result;` in ASP.NET or UI code. The thread blocks, the continuation cannot resume, and the application hangs permanently. This is a production outage waiting to happen.
- **async void in non-event-handler methods**: Exceptions from `async void` methods crash the process because they cannot be observed or caught by callers.

### HIGH

- **Ignoring CancellationToken parameter**: Accepting a token but never passing it to inner calls or checking it in loops. The operation runs to completion regardless of cancellation, wasting server resources and delaying responses.
- **Wrapping CPU-bound work in Task.FromResult**: `return await Task.FromResult(ComputeHash(data))` adds async overhead to purely synchronous computation with zero benefit.

### MEDIUM

- **Missing ConfigureAwait(false) in library code**: Not an immediate crash in ASP.NET Core (no sync context), but creates deadlock risk when the library is consumed from WPF, WinForms, or legacy ASP.NET.
- **Unnecessary async method wrapping**: An async method that does nothing but await a single inner call adds a state machine allocation for no benefit. Return the Task directly instead: `return _inner.GetAsync(id, ct)`.

## Examples

**Correct async chain with cancellation**:

```csharp
// Controller entry point -- no ConfigureAwait needed in ASP.NET Core
public async Task<IActionResult> GetUserOrders(int userId, CancellationToken ct)
{
    var orders = await _orderService.GetByUserAsync(userId, ct);
    return Ok(orders);
}

// Service layer
public async Task<IReadOnlyList<Order>> GetByUserAsync(int userId, CancellationToken ct)
{
    var orders = await _repository.FindByUserAsync(userId, ct);

    foreach (var order in orders)
    {
        ct.ThrowIfCancellationRequested();
        order.StatusLabel = ComputeStatusLabel(order); // CPU: sync
    }

    return orders;
}

// Repository -- library code uses ConfigureAwait(false)
public async Task<List<Order>> FindByUserAsync(int userId, CancellationToken ct)
{
    return await _dbContext.Orders
        .Where(o => o.UserId == userId)
        .ToListAsync(ct)
        .ConfigureAwait(false);
}
```

**CPU-bound work kept synchronous**:

```csharp
// The method is synchronous because it does CPU work
public Report GenerateReport(ReportData data)
{
    var summary = CalculateSummary(data.Entries);
    var charts = BuildCharts(data.Entries);
    return new Report(summary, charts);
}

// Caller offloads to thread pool if needed
var report = await Task.Run(() => _generator.GenerateReport(data));
```

## Does Not Cover

- **Parallel processing** -- `Parallel.ForEachAsync`, `Task.WhenAll` for concurrent execution, and thread-safe collections are parallelism concerns beyond basic async/await patterns.
- **Reactive extensions (Rx)** -- observable streams and reactive patterns are a distinct programming model.
- **SignalR and WebSocket patterns** -- long-lived async connections have additional concerns around connection lifetime management.
- **Type design** -- how async methods fit into class architecture is covered by the Architecture dimension (CS1).
- **Return type design** -- whether async methods return null or empty collections is covered by the Null Safety dimension (CS2).

## Sources

- Microsoft Learn -- Asynchronous programming with async and await
- Stephen Cleary, *Concurrency in C# Cookbook* -- async/await best practices
- C# Coding Guidelines (csharpcodingguidelines.com) -- AV2235 (Async patterns)
- .NET documentation -- ConfigureAwait FAQ
