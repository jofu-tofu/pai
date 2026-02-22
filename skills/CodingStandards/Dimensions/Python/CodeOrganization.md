# Code Organization -- Python

> Structure code so that each function does one thing, call sites are self-documenting, and error handling is precise and informative.

## Mental Model

Code organization in Python is about reducing the cognitive cost of reading and modifying code. Python's flexibility -- optional keyword arguments, implicit returns, broad exception catching, arbitrarily long functions -- makes it easy to write code that works but is expensive to understand. This dimension groups seven rules that address the most common organizational failures: ambiguous call sites, variables declared far from use, dangerous defaults, bloated functions, and imprecise error handling.

The central principle is **locality of understanding**. A reader should be able to understand what a piece of code does by looking at the code itself, without scrolling to distant declarations, tracing exception handlers, or guessing what positional arguments mean. Keyword arguments make call sites self-documenting. Declaring variables close to their use keeps data flow visible within a screen of context. Single responsibility keeps functions short enough to fit in working memory.

Keyword arguments are the highest-leverage organizational pattern. When a function accepts `create_user("Alice", "admin", True, False)`, the call site is opaque -- the reader must jump to the function signature to understand each argument. When the same call is `create_user(name="Alice", role="admin", active=True, notify=False)`, the call site is self-documenting. Python's `*` separator makes keyword-only enforcement a language feature, not just a convention. For any function with three or more parameters, or any function with boolean parameters, keyword-only arguments should be the default.

Default values introduce a subtler organizational problem. When a function has defaults, callers naturally omit parameters they do not think about. This is convenient but dangerous for parameters where the default is not universally appropriate. A `timeout=30` default means every caller implicitly accepts 30 seconds without making a conscious decision. For parameters where the correct value depends on the caller's context, removing the default forces an explicit decision at every call site.

Variable declaration distance is a readability issue that compounds in longer functions. When `tax_rate = 0.08` is declared 50 lines above `tax = subtotal * tax_rate`, the reader must hold `tax_rate`'s value in working memory across the intervening code, or scroll back to find it. Declaring `tax_rate` immediately before its use eliminates this cognitive overhead and makes the data flow visually apparent.

Single responsibility is the structural constraint that keeps functions short enough for the other organizational rules to matter. A 200-line function with five responsibilities cannot have variables close to use, because each responsibility creates its own variable cluster spread across the function body. Decomposition into focused functions solves this organically.

Error handling bridges organization and correctness. Context managers ensure deterministic cleanup regardless of exception paths. Specific exception types prevent bug-masking (a `NameError` from a typo should not be caught by a broad `except Exception`). Meaningful error messages provide the context needed to debug failures without reproducing them.

## Consumer Guide

### When Reviewing Code

Check function call sites for positional arguments: any call with three or more positional arguments, or any call with boolean arguments, should use keyword arguments. Look for variables declared at the top of a function that are not used until much later -- these should be moved closer to their point of use. Check for functions longer than 30-40 lines and assess whether they have multiple responsibilities that could be extracted. Verify that every try/except catches specific exception types (not bare `except` or `except Exception`), and that error messages include the values that caused the failure. Check that every resource acquisition (file opens, locks, connections) uses a context manager.

### When Designing / Planning

When designing function interfaces, start with keyword-only parameters for anything beyond the first one or two "obvious" arguments. Explicitly decide which parameters should have defaults and which should force callers to provide values. When designing a module's internal structure, plan for single-responsibility functions that can be composed in orchestrator functions. When designing error handling strategy, define domain-specific exception classes so that callers can catch specific failures without catching unrelated bugs. Plan context manager usage for any resource that requires cleanup.

### When Implementing

Use `*` in function signatures to enforce keyword-only arguments for functions with three or more parameters or any boolean parameters. Place variable declarations immediately before their first use, not at the top of the function. When a function exceeds 20-30 lines, look for natural responsibility boundaries and extract helper functions with clear names that describe their purpose. Use `with` statements for all resource management. Catch the most specific exception type that matches the expected failure mode. In error messages, include the actual value that failed validation, the expected value or constraint, and enough context (IDs, file paths, parameter names) to locate the problem without a debugger.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [OrgKeywordArguments](../../Rules/Python/OrgKeywordArguments.md) | HIGH | Use keyword-only arguments for functions with 3+ parameters or boolean params |
| [OrgDeclareCloseToUse](../../Rules/Python/OrgDeclareCloseToUse.md) | HIGH | Declare variables immediately before their first use, not at function top |
| [OrgDefaultValuesDangerous](../../Rules/Python/OrgDefaultValuesDangerous.md) | HIGH | Remove defaults from parameters where callers should make explicit decisions |
| [OrgSingleResponsibility](../../Rules/Python/OrgSingleResponsibility.md) | HIGH | Each function should have exactly one responsibility |
| [ErrorContextManagers](../../Rules/Python/ErrorContextManagers.md) | MEDIUM | Use context managers for all resource acquisition and cleanup |
| [ErrorSpecificExceptions](../../Rules/Python/ErrorSpecificExceptions.md) | MEDIUM | Catch specific exception types, never bare except or except Exception |
| [ErrorMeaningfulMessages](../../Rules/Python/ErrorMeaningfulMessages.md) | MEDIUM | Include failed value, expected constraint, and context in error messages |

## Rule Interactions

**OrgKeywordArguments + OrgDefaultValuesDangerous**: These two rules work in tension and complement. Keyword arguments make defaults visible at call sites (`fetch(url, timeout=30)` shows the default being used). But OrgDefaultValuesDangerous warns that some defaults should not exist at all. The combination is: use keyword arguments to make parameters explicit, and remove defaults where callers should be forced to decide.

**OrgDeclareCloseToUse + OrgSingleResponsibility**: Single responsibility naturally solves declaration distance. When a function does one thing, its variables cluster tightly around the operations that use them. Long declaration distances are often a symptom of multi-responsibility functions.

**ErrorSpecificExceptions + DefensiveProgramming dimension (DefensiveNeverSwallow)**: SpecificExceptions determines which exceptions to catch; NeverSwallow determines what to do with them. Together: catch specific types, then handle meaningfully, transform to domain exceptions, or re-raise. Never catch broad and never swallow.

**ErrorContextManagers + ErrorSpecificExceptions**: Context managers handle the cleanup path; specific exceptions handle the error path. A `with` block ensures resources are released, while the except blocks inside or outside the `with` handle specific failure modes. The `__exit__` method must not suppress exceptions (`return False`); leave exception handling to explicit except blocks.

**ErrorMeaningfulMessages + OrgKeywordArguments**: When functions use keyword arguments, the parameter names are available at the call site and in error messages. A meaningful error message can reference parameter names that match the call site, making it easy to trace from error message back to the exact call that caused it.

**OrgSingleResponsibility + ErrorContextManagers**: When each function has a single responsibility, the resource lifecycle is contained within one function. This makes context manager usage straightforward -- the `with` block wraps the entire function body rather than being nested alongside unrelated logic.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Bare `except:` or `except Exception:` in production code**: Catches programming errors (`NameError`, `TypeError`, `AttributeError`) alongside operational errors. Bugs become invisible. The only acceptable broad catch is in top-level error handlers that log and terminate.
- **Boolean positional arguments**: `process(data, True, False, True)` is completely unreadable. Boolean parameters must always be keyword-only because their meaning cannot be inferred from the value.

### HIGH

- **Function with 5+ responsibilities**: A function that validates, transforms, persists, notifies, and logs is untestable in isolation and changes for five different reasons. Extract each responsibility into a named function and compose them in an orchestrator.
- **Variables declared 20+ lines before use**: Forces readers to hold values in working memory across unrelated code. Move declarations to the line immediately before first use.
- **Dangerous defaults on security-sensitive parameters**: `verify_ssl=True` as a default is fine (secure by default). `verify_ssl=False` as a default is dangerous. `role="admin"` as a default is dangerous. Parameters that affect security or authorization must require explicit values.
- **Error messages without the failing value**: `raise ValueError("Invalid input")` gives no debugging context. Always include what was received and what was expected.

### MEDIUM

- **Three positional parameters of the same type**: `create_rect(10, 20, 100, 200)` -- which is x, which is y, which is width? Same-type positional arguments invite ordering mistakes.
- **Context manager not used for file operations**: `f = open(path); data = f.read(); f.close()` -- if `f.read()` raises, `f.close()` is never reached. Always use `with open(path) as f:`.
- **Overly granular exception handling**: Catching five specific exceptions with identical handling in separate except blocks. Group related exceptions: `except (ConnectionError, TimeoutError) as e:`.

## Examples

**Self-documenting call sites vs. opaque calls:**

```python
# BAD: positional arguments obscure meaning
send_email("alice@co.com", "bob@co.com", "Hello", "Message body", True, False)

# GOOD: keyword arguments are self-documenting
send_email(
    recipient="alice@co.com",
    sender="bob@co.com",
    subject="Hello",
    body="Message body",
    html=True,
    track_opens=False,
)
```

**Single responsibility decomposition:**

```python
# BAD: one function with four responsibilities
def handle_order(data: dict) -> Order:
    # Validate
    if not data.get("items"):
        raise ValueError("No items")
    # Transform
    order = Order(items=[Item(**i) for i in data["items"]])
    # Persist
    db.session.add(order)
    db.session.commit()
    # Notify
    send_confirmation(order.customer_email, order.id)
    return order

# GOOD: composed single-responsibility functions
def validate_order_data(data: dict) -> None:
    if not data.get("items"):
        raise ValueError(f"Order data missing 'items' key, got keys: {list(data.keys())}")

def build_order(data: dict) -> Order:
    return Order(items=[Item(**i) for i in data["items"]])

def persist_order(order: Order) -> None:
    db.session.add(order)
    db.session.commit()

def handle_order(data: dict) -> Order:
    validate_order_data(data)
    order = build_order(data)
    persist_order(order)
    send_confirmation(order.customer_email, order.id)
    return order
```

**Precise error handling with context:**

```python
# BAD: broad catch with vague message
try:
    user = db.get_user(user_id)
    process_payment(user.account, amount)
except Exception as e:
    logger.error("Payment failed")

# GOOD: specific catches with meaningful messages
try:
    user = db.get_user(user_id)
except UserNotFoundError:
    raise PaymentError(f"Cannot process payment: user {user_id} not found")

try:
    process_payment(user.account, amount)
except InsufficientFundsError as e:
    raise PaymentError(
        f"Insufficient funds for user {user_id}: "
        f"required={amount}, available={e.balance}"
    ) from e
except PaymentGatewayError as e:
    logger.error(f"Gateway error for user {user_id}, amount {amount}: {e}")
    raise
```

## Does Not Cover

- **Module and package organization** (directory structure, `__init__.py` design, circular import resolution) -- this dimension covers intra-function and function-interface organization, not inter-module architecture.
- **Naming conventions** (PEP 8 naming, variable name quality) -- complementary but not in scope for this structural dimension.
- **Documentation and docstrings** -- related to readability but a separate concern from code structure.
- **Class design patterns** (inheritance hierarchies, mixins, metaclasses) -- higher-level design decisions outside the scope of these rules.
- **Mutable default arguments** -- covered in the Performance dimension (OrgNoMutableDefaults) due to its data-leak characteristics.

## Sources

- minimaxir's Python CLAUDE.md (keyword arguments, single responsibility, declare close to use)
- Dagster's "Dignified Python" (dangerous defaults, context managers, specific exceptions)
- PEP 3102 (keyword-only arguments)
- Python documentation on context managers and the `with` statement
