### CS4.6 Private by Default

**Impact: MEDIUM (Start restrictive, open up as needed)**

Making members public exposes implementation details and creates maintenance burden. Start with `private`, only increase visibility when there's a clear need. It's easy to make private things public later, but hard to make public things private.

**Incorrect: Everything public**

```csharp
public class UserService
{
    public IDbConnection Connection;  // Internal detail exposed
    public ILogger Logger;  // Internal detail exposed

    public string ConnectionString;  // Sensitive data exposed
    public int RetryCount = 3;  // Configuration as public field

    public void ValidateInternal(User user) { }  // Helper exposed
    public User TransformUser(User user) { }  // Helper exposed

    public User GetUser(int id)
    {
        ValidateInternal(user);  // Implementation detail
        return TransformUser(LoadFromDb(id));
    }
}

// Users depend on internal details
var service = new UserService();
service.Connection = null;  // Can break internal state
service.ValidateInternal(user);  // Calling internal helper
```

**Correct: Minimal public surface**

```csharp
public class UserService
{
    private readonly IDbConnection _connection;
    private readonly ILogger _logger;
    private readonly UserServiceOptions _options;

    public UserService(
        IDbConnection connection,
        ILogger logger,
        UserServiceOptions options)
    {
        _connection = connection;
        _logger = logger;
        _options = options;
    }

    // Only truly public operations
    public User? GetUser(int id)
    {
        Validate(id);
        return Transform(LoadFromDb(id));
    }

    public void CreateUser(User user)
    {
        ValidateUser(user);
        SaveToDb(user);
    }

    // Internal helpers are private
    private void Validate(int id) { }
    private void ValidateUser(User user) { }
    private User? LoadFromDb(int id) { }
    private void SaveToDb(User user) { }
    private User Transform(User? user) { }
}
```

**Visibility guidelines:**
- `private` - default for fields and helper methods
- `private protected` - subclass access in same assembly
- `protected` - subclass access (use sparingly)
- `internal` - assembly access for shared utilities
- `public` - only for intentional API surface
