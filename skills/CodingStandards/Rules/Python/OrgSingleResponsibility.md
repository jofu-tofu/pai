### PY4.4 Single Responsibility

**Impact: HIGH (Easier to test, modify, understand)**

Functions and classes that do one thing well are easier to test, modify, and compose. When a function has multiple responsibilities, changes to one responsibility risk breaking others.

**Incorrect: Multiple responsibilities mixed**

```python
def process_and_save_user(data: dict) -> User:
    # Responsibility 1: Validation
    if not data.get("email"):
        raise ValueError("Email required")
    if not data.get("name"):
        raise ValueError("Name required")

    # Responsibility 2: Transformation
    user = User(
        email=data["email"].lower(),
        name=data["name"].strip(),
        created_at=datetime.now(),
    )

    # Responsibility 3: Persistence
    db.session.add(user)
    db.session.commit()

    # Responsibility 4: Notification
    send_welcome_email(user)

    return user
```

**Correct: Single responsibility per function**

```python
def validate_user_data(data: dict) -> None:
    """Validate user data, raise ValueError if invalid."""
    if not data.get("email"):
        raise ValueError("Email required")
    if not data.get("name"):
        raise ValueError("Name required")

def create_user_from_data(data: dict) -> User:
    """Transform raw data into User object."""
    return User(
        email=data["email"].lower(),
        name=data["name"].strip(),
        created_at=datetime.now(),
    )

def save_user(user: User) -> None:
    """Persist user to database."""
    db.session.add(user)
    db.session.commit()

def notify_new_user(user: User) -> None:
    """Send welcome notification to new user."""
    send_welcome_email(user)

# Compose as needed
def register_user(data: dict) -> User:
    """Orchestrate user registration."""
    validate_user_data(data)
    user = create_user_from_data(data)
    save_user(user)
    notify_new_user(user)
    return user
```

**Benefits:**
- Each function is independently testable
- Responsibilities can be reused (validate without save)
- Changes to one responsibility don't affect others
- Clear names describe what each function does
