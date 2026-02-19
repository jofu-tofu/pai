### 2.1 Enable Nullable Reference Types

**Impact: CRITICAL (Compiler catches null bugs before runtime)**

Nullable reference types make null a compile-time concern rather than a runtime crash. The compiler tracks nullability flow and warns about potential null dereferences.

**Incorrect: Nullable context disabled**

```csharp
// Nullable not enabled - compiler doesn't track null
public class UserService
{
    public User GetUser(int id)
    {
        return _repository.Find(id);  // Might return null
    }

    public string GetDisplayName(User user)
    {
        return user.Name;  // NullReferenceException if user is null
    }
}

// Caller has no indication that null is possible
var user = service.GetUser(123);
Console.WriteLine(user.Name);  // Crash at runtime
```

**Correct: Nullable context enabled**

```csharp
#nullable enable

public class UserService
{
    public User? GetUser(int id)
    {
        return _repository.Find(id);  // Return type shows null is possible
    }

    public string GetDisplayName(User user)
    {
        return user.Name ?? "Unknown";  // Handle potential null name
    }
}

// Compiler enforces null checks
var user = service.GetUser(123);
Console.WriteLine(user.Name);  // Warning: user may be null

// Fixed with null check
var user = service.GetUser(123);
if (user is not null)
{
    Console.WriteLine(user.Name);  // OK - null checked
}

// Or with null-conditional
Console.WriteLine(user?.Name ?? "Not found");
```

**Enable project-wide in .csproj:**

```xml
<PropertyGroup>
    <Nullable>enable</Nullable>
</PropertyGroup>
```

**Nullable annotations:**
- `string` - never null
- `string?` - might be null
- `[NotNull]` - parameter validated to be non-null
- `[MaybeNull]` - return value might be null even if type says otherwise
