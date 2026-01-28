### 1.1 Single Responsibility Principle

**Impact: CRITICAL (Classes with multiple responsibilities break unpredictably)**

A class should have only one reason to change. When a class handles multiple concerns, a change to one concern risks breaking unrelated functionality.

**Incorrect: Multiple responsibilities mixed**

```csharp
public class UserService
{
    private readonly IDbConnection _db;

    // Responsibility 1: User validation
    public bool ValidateUser(User user)
    {
        if (string.IsNullOrEmpty(user.Email)) return false;
        if (!user.Email.Contains("@")) return false;
        return true;
    }

    // Responsibility 2: Database persistence
    public void SaveUser(User user)
    {
        _db.Execute("INSERT INTO Users ...", user);
    }

    // Responsibility 3: Email notification
    public void SendWelcomeEmail(User user)
    {
        var smtp = new SmtpClient();
        smtp.Send(new MailMessage("noreply@app.com", user.Email));
    }
}
```

**Correct: Single responsibility per class**

```csharp
public class UserValidator
{
    public bool Validate(User user)
    {
        if (string.IsNullOrEmpty(user.Email)) return false;
        if (!user.Email.Contains("@")) return false;
        return true;
    }
}

public class UserRepository
{
    private readonly IDbConnection _db;

    public UserRepository(IDbConnection db) => _db = db;

    public void Save(User user)
    {
        _db.Execute("INSERT INTO Users ...", user);
    }
}

public class WelcomeEmailSender
{
    private readonly IEmailService _email;

    public WelcomeEmailSender(IEmailService email) => _email = email;

    public void Send(User user)
    {
        _email.Send("noreply@app.com", user.Email, "Welcome!");
    }
}
```

**Benefits:**
- Each class is independently testable
- Changes to validation don't affect persistence
- Email implementation can change without touching user logic
