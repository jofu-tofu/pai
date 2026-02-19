### 4.1 Keyword Arguments for Complex Functions

**Impact: HIGH (Self-documenting call sites)**

Functions with multiple parameters of the same type become confusing at call sites. Keyword arguments make calls self-documenting and prevent argument order mistakes.

**Incorrect: Positional arguments obscure meaning**

```python
def create_rectangle(x1: int, y1: int, x2: int, y2: int) -> Rectangle:
    ...

# Which is width? Which is height? Which corner is which?
rect = create_rectangle(10, 20, 100, 200)

def send_email(
    recipient: str,
    sender: str,
    subject: str,
    body: str
) -> None:
    ...

# Easy to swap recipient and sender by mistake
send_email("alice@co.com", "bob@co.com", "Hello", "Message")
```

**Correct: Keyword-only arguments enforce clarity**

```python
def create_rectangle(
    *,  # Forces all following to be keyword-only
    x1: int,
    y1: int,
    x2: int,
    y2: int,
) -> Rectangle:
    ...

# Call site is self-documenting
rect = create_rectangle(x1=10, y1=20, x2=100, y2=200)

def send_email(
    *,
    recipient: str,
    sender: str,
    subject: str,
    body: str,
) -> None:
    ...

# Can't accidentally swap arguments
send_email(
    recipient="alice@co.com",
    sender="bob@co.com",
    subject="Hello",
    body="Message",
)
```

**Guidelines:**
- Use `*` to force keyword-only for 3+ parameters
- Use keyword-only when parameters have same type
- Use keyword-only for boolean parameters (avoid `do_thing(True, False)`)
- First 1-2 "obvious" parameters can remain positional

```python
# OK: First parameter is obvious, rest are keyword-only
def fetch(url: str, *, timeout: int = 30, retries: int = 3) -> Response:
    ...

fetch("https://api.example.com", timeout=60, retries=5)
```
