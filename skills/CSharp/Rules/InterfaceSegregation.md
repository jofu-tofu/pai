### 1.2 Interface Segregation

**Impact: CRITICAL (Small interfaces enable testing and flexibility)**

Clients shouldn't depend on methods they don't use. Large interfaces force implementers to stub unused methods and make mocking difficult.

**Incorrect: Fat interface**

```csharp
public interface IUserService
{
    User GetById(int id);
    IEnumerable<User> GetAll();
    void Create(User user);
    void Update(User user);
    void Delete(int id);
    void SendEmail(int userId, string message);
    void ResetPassword(int userId);
    void VerifyEmail(int userId);
    AuditLog GetAuditHistory(int userId);
}

// Component that only needs to read users must implement everything
public class UserDisplayComponent : IUserService
{
    public User GetById(int id) { /* actual implementation */ }
    public IEnumerable<User> GetAll() { /* actual implementation */ }

    // Forced to stub all these unused methods
    public void Create(User user) => throw new NotImplementedException();
    public void Update(User user) => throw new NotImplementedException();
    public void Delete(int id) => throw new NotImplementedException();
    // ... more stubs
}
```

**Correct: Segregated interfaces**

```csharp
public interface IUserReader
{
    User? GetById(int id);
    IEnumerable<User> GetAll();
}

public interface IUserWriter
{
    void Create(User user);
    void Update(User user);
    void Delete(int id);
}

public interface IUserNotification
{
    void SendEmail(int userId, string message);
    void ResetPassword(int userId);
    void VerifyEmail(int userId);
}

public interface IUserAudit
{
    AuditLog GetHistory(int userId);
}

// Component depends only on what it needs
public class UserDisplayComponent
{
    private readonly IUserReader _users;

    public UserDisplayComponent(IUserReader users) => _users = users;

    public void Display(int id)
    {
        var user = _users.GetById(id);
        // ...
    }
}
```

**Benefits:**
- Easy to mock in tests (fewer methods to setup)
- Components declare their actual dependencies
- Implementation classes can implement only relevant interfaces
