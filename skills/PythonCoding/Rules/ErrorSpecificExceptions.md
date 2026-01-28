### 5.2 Catch Specific Exceptions

**Impact: MEDIUM (Bare except hides bugs)**

Catching `Exception` or using bare `except:` hides bugs by treating all failures the same. A typo causing `NameError` looks identical to the network error you intended to handle.

**Incorrect: Overly broad exception handling**

```python
# Bare except catches everything, including bugs
try:
    result = process_data(data)
except:
    result = default_value

# Catching Exception hides programming errors
try:
    user = users[user_id]  # KeyError if missing
    email = user.email.lower()  # AttributeError if no email
    send_notification(emial)  # NameError: typo in 'email'
except Exception:
    logger.error("Failed to send notification")
    # Bug hidden - typo never discovered
```

**Correct: Catch specific expected exceptions**

```python
# Catch only what you expect and can handle
try:
    result = process_data(data)
except ValueError as e:
    logger.warning(f"Invalid data format: {e}")
    result = default_value
except ConnectionError as e:
    logger.error(f"Network error: {e}")
    raise  # Re-raise if we can't handle it

# Multiple specific exceptions
try:
    user = users[user_id]
    email = user.email.lower()
    send_notification(email)
except KeyError:
    logger.warning(f"User {user_id} not found")
except AttributeError:
    logger.warning(f"User {user_id} has no email")
except NotificationError as e:
    logger.error(f"Notification failed: {e}")
# NameError from typo will propagate and be discovered
```

**Group related exceptions when appropriate:**

```python
# OK to group when handling is identical
try:
    data = fetch_from_api(url)
except (ConnectionError, TimeoutError, HTTPError) as e:
    logger.error(f"API request failed: {e}")
    raise ServiceUnavailableError("External service down") from e
```
