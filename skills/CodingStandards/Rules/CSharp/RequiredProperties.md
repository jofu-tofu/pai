### CS2.4 Required Properties

**Impact: CRITICAL (Prevents incomplete object construction) - C# 11+**

The `required` modifier ensures properties must be set during object initialization. This catches missing required data at compile time rather than discovering it as null at runtime.

**Incorrect: Optional properties with runtime validation**

```csharp
public class CreateUserRequest
{
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Password { get; set; }
}

// Compiler allows incomplete initialization
var request = new CreateUserRequest
{
    Email = "user@example.com"
    // Name and Password forgotten - compiles fine
};

// Must validate at runtime
if (string.IsNullOrEmpty(request.Name))
    throw new ValidationException("Name is required");  // Runtime crash
```

**Correct: Required properties enforce initialization**

```csharp
public class CreateUserRequest
{
    public required string Email { get; init; }
    public required string Name { get; init; }
    public required string Password { get; init; }
    public string? OptionalNickname { get; init; }  // Truly optional
}

// Compiler error if required properties are missing
var request = new CreateUserRequest
{
    Email = "user@example.com"
    // Error CS9035: Required member 'Name' must be set
    // Error CS9035: Required member 'Password' must be set
};

// Must provide all required properties
var request = new CreateUserRequest
{
    Email = "user@example.com",
    Name = "John Doe",
    Password = "secure123"
    // OptionalNickname can be omitted
};
```

**With primary constructors (C# 12+):**

```csharp
public class User(string email, string name)
{
    public string Email { get; } = email;
    public string Name { get; } = name;
    public string? Bio { get; init; }  // Optional via init
}

// Constructor enforces required parameters
var user = new User("user@example.com", "John");
```

**SetsRequiredMembers for constructor initialization:**

```csharp
public class Config
{
    public required string ConnectionString { get; init; }
    public required int Timeout { get; init; }

    [SetsRequiredMembers]
    public Config(string connectionString, int timeout)
    {
        ConnectionString = connectionString;
        Timeout = timeout;
    }
}
```
