### 1.2 Never Swallow Exceptions

**Impact: CRITICAL (Silent failures cause data corruption)**

Catching exceptions without handling them hides bugs that corrupt data or leave systems in invalid states. Silent failures are worse than crashes because they go undetected until damage spreads.

**Incorrect: Exception swallowed silently**

```python
# Bug hidden - order may be in corrupted state
try:
    process_order(order)
except Exception:
    pass

# Logging without re-raising loses the failure signal
try:
    save_to_database(record)
except DatabaseError as e:
    logger.error(f"Failed: {e}")
    # Function returns normally despite failure
```

**Correct: Handle, transform, or re-raise**

```python
# Option 1: Handle meaningfully
try:
    process_order(order)
except ValidationError as e:
    order.status = "invalid"
    order.error_reason = str(e)
    notify_support(order, e)

# Option 2: Log and re-raise
try:
    save_to_database(record)
except DatabaseError as e:
    logger.error(f"Database save failed: {e}")
    raise  # Caller must handle

# Option 3: Transform to domain exception
try:
    external_api.call()
except RequestException as e:
    raise ServiceUnavailableError("External service down") from e
```

**The only acceptable "swallow":**
- Cleanup code in `finally` blocks where you must continue regardless
- Even then, log the suppressed exception
