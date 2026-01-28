### 3.4 ConfigureAwait Correctly

**Impact: HIGH (Library code shouldn't capture sync context)**

By default, `await` captures the synchronization context and resumes on it. Library code should use `ConfigureAwait(false)` to avoid capturing context, preventing deadlocks and improving performance.

**Incorrect: Library code captures context**

```csharp
// Library code without ConfigureAwait
public class DataService  // Shared library
{
    public async Task<Data> GetDataAsync()
    {
        // Captures sync context - can cause deadlock when called from UI
        var response = await _httpClient.GetAsync(url);
        var content = await response.Content.ReadAsStringAsync();
        return Parse(content);
    }
}

// UI code calls library
public void Button_Click()
{
    // Deadlock: UI thread blocked, awaiter wants to resume on UI thread
    var data = _dataService.GetDataAsync().Result;
}
```

**Correct: Library uses ConfigureAwait(false)**

```csharp
// Library code doesn't capture context
public class DataService  // Shared library
{
    public async Task<Data> GetDataAsync()
    {
        var response = await _httpClient.GetAsync(url)
            .ConfigureAwait(false);
        var content = await response.Content.ReadAsStringAsync()
            .ConfigureAwait(false);
        return Parse(content);
    }
}

// Application code (UI, ASP.NET) can omit ConfigureAwait
// because it DOES need to resume on the sync context
public async void Button_Click()
{
    var data = await _dataService.GetDataAsync();
    // This runs on UI thread, can update UI
    _label.Text = data.Name;
}
```

**Guidelines:**

| Code Type | ConfigureAwait |
|-----------|---------------|
| Library/shared code | Always use `ConfigureAwait(false)` |
| ASP.NET Core | Not needed (no sync context by default) |
| UI applications | Omit when you need UI thread, use `false` otherwise |
| Console applications | Not needed (no sync context) |

**Modern alternative - SuppressFlow:**

```csharp
// For entire async method, suppress flow
[MethodImpl(MethodImplOptions.AggressiveInlining)]
public async ValueTask<Data> GetDataAsync()
{
    await using var _ = ExecutionContext.SuppressFlow();
    // All awaits in this method won't capture context
    var response = await _httpClient.GetAsync(url);
    return Parse(await response.Content.ReadAsStringAsync());
}
```
