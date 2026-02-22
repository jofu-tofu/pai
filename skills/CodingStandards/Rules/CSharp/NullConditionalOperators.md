### CS2.3 Use Null-Conditional Operators

**Impact: CRITICAL (Cleaner than nested null checks)**

Null-conditional operators (`?.` and `?[]`) replace verbose nested null checks with concise, readable expressions. They short-circuit on null, returning null instead of throwing.

**Incorrect: Nested null checks**

```csharp
// Deeply nested null checks
string? city = null;
if (user != null)
{
    if (user.Address != null)
    {
        if (user.Address.City != null)
        {
            city = user.Address.City;
        }
    }
}

// Verbose conditional for method calls
string? displayName = null;
if (user != null)
{
    displayName = user.GetDisplayName();
}
```

**Correct: Null-conditional operators**

```csharp
// Chain through nullable references
string? city = user?.Address?.City;

// Method calls
string? displayName = user?.GetDisplayName();

// Array/indexer access
string? firstTag = user?.Tags?[0];

// Combined with null-coalescing for defaults
string city = user?.Address?.City ?? "Unknown";

// Combined with null-coalescing assignment
user ??= new User();  // Assign only if null
```

**Null-conditional with delegates:**

```csharp
// Instead of checking delegate for null
if (OnUserCreated != null)
{
    OnUserCreated(user);
}

// Use null-conditional invoke
OnUserCreated?.Invoke(user);
```

**Pattern matching for more complex scenarios:**

```csharp
// When you need to do more than just access
if (user?.Address is { City: var city, PostalCode: var zip })
{
    Console.WriteLine($"{city}, {zip}");
}

// Switch expression with null handling
var status = user?.Status switch
{
    UserStatus.Active => "Active",
    UserStatus.Pending => "Pending",
    null => "Unknown",
    _ => "Other"
};
```
