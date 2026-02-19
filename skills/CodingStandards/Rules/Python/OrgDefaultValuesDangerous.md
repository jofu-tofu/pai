### 4.3 Default Values Are Dangerous

**Impact: HIGH (Callers forget to provide, causes surprises)**

Default values seem convenient but hide required decisions. Callers rely on defaults without understanding them, leading to bugs when defaults don't match their use case.

**Incorrect: Defaults hide important decisions**

```python
def fetch_data(
    url: str,
    timeout: int = 30,
    retries: int = 3,
    verify_ssl: bool = True,
) -> Response:
    ...

# Caller uses defaults without thinking
data = fetch_data("https://api.example.com")
# Is 30s timeout appropriate? Are 3 retries right for this call?

def create_user(
    name: str,
    role: str = "user",
    active: bool = True,
) -> User:
    ...

# Accidentally creates active admin users
admin = create_user("Alice", role="admin")  # active=True by default
```

**Correct: Require explicit decisions for important parameters**

```python
def fetch_data(
    url: str,
    *,
    timeout: int,  # No default - caller must decide
    retries: int,  # No default - caller must decide
    verify_ssl: bool = True,  # OK - safe default
) -> Response:
    ...

# Caller forced to think about timeout and retries
data = fetch_data(
    "https://api.example.com",
    timeout=10,  # Appropriate for this use case
    retries=1,   # Don't retry this particular call
)

def create_user(
    name: str,
    *,
    role: str,     # No default - force explicit role assignment
    active: bool,  # No default - force explicit activation decision
) -> User:
    ...

# Caller must explicitly decide
admin = create_user("Alice", role="admin", active=False)
```

**When defaults are appropriate:**
- Truly optional parameters with safe, obvious defaults
- Backward compatibility (but consider deprecation)
- Parameters where 90%+ of callers want the same value
