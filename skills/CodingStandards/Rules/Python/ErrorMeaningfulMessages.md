### 5.3 Meaningful Error Messages

**Impact: MEDIUM (Debugging without context wastes time)**

Error messages without context require developers to reproduce the issue and add logging to understand what went wrong. Good error messages include what failed, why, and relevant state.

**Incorrect: Vague error messages**

```python
# No context about what failed
if not user:
    raise ValueError("Invalid user")

# No information about the bad value
if age < 0:
    raise ValueError("Invalid age")

# No guidance on what's expected
if not re.match(r"^\d{3}-\d{4}$", phone):
    raise ValueError("Invalid phone number")
```

**Correct: Contextual error messages**

```python
# Include what was attempted and what was found
if not user:
    raise ValueError(f"User not found for id={user_id}")

# Include the invalid value
if age < 0:
    raise ValueError(f"Age must be non-negative, got {age}")

# Include what was expected and what was received
if not re.match(r"^\d{3}-\d{4}$", phone):
    raise ValueError(
        f"Phone number must be in format XXX-XXXX, got {phone!r}"
    )
```

**Error message patterns:**

```python
# Include operation context
def process_file(path: Path) -> Data:
    if not path.exists():
        raise FileNotFoundError(
            f"Cannot process file: {path} does not exist"
        )
    if not path.is_file():
        raise ValueError(
            f"Expected file, got directory: {path}"
        )

# Include relevant IDs for debugging
def transfer_funds(from_account: str, to_account: str, amount: Decimal):
    if amount <= 0:
        raise ValueError(
            f"Transfer amount must be positive, got {amount} "
            f"(from={from_account}, to={to_account})"
        )

# Chain exceptions to preserve original context
try:
    data = json.loads(raw_content)
except json.JSONDecodeError as e:
    raise ConfigurationError(
        f"Invalid JSON in config file {config_path}: {e}"
    ) from e
```
