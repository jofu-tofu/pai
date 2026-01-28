### 3.2 Avoid Implementation Coupling

**Impact: CRITICAL (brittle tests vs stable tests)**

Implementation coupling is when tests depend on HOW code works internally rather than WHAT it produces. Common culprits: mocking internal collaborators, asserting on private state, verifying method call sequences.

**Problem: Mocking internal collaborators**

```pseudocode
class OrderService:
    function __init__(self, repository, calculator, notifier):
        self.repo = repository
        self.calc = calculator
        self.notifier = notifier

    function place_order(order):
        saved = self.repo.save(order)
        total = self.calc.calculate(saved)
        self.notifier.send(saved, total)
        return saved

// Test mocks every internal piece
function test_place_order():
    repo = mock()
    calc = mock()
    notifier = mock()
    repo.save.returns(order_with_id)
    calc.calculate.returns(100)

    service = OrderService(repo, calc, notifier)
    service.place_order(order)

    // Coupled to exact internal orchestration
    assert repo.save.was_called_with(order)
    assert calc.calculate.was_called_with(order_with_id)
    assert notifier.send.was_called_with(order_with_id, 100)

// Refactoring to combine calc into repo breaks tests
// Changing notification strategy breaks tests
// Any internal restructuring breaks tests
```

**Solution: Test at system boundaries only**

```pseudocode
// Use real implementations or integration-level fakes
function test_place_order_saves_and_notifies():
    // Real or in-memory implementations
    repo = InMemoryOrderRepository()
    notifier = FakeNotifier()  // Captures notifications for assertions
    service = create_order_service(repo, notifier)

    result = service.place_order(order)

    // Assert on observable outcomes
    assert repo.find(result.id) == result  // Order was persisted
    assert notifier.last_notification.order_id == result.id  // Notification sent

// Internal reorganization doesn't affect tests
// Only boundary behavior matters
```

**The Test:** "Am I testing how internal pieces talk to each other, or what the system as a whole produces?"

**Mock at system boundaries (external dependencies):**
- External HTTP APIs
- Databases (or use in-memory versions)
- File systems (or use in-memory versions)
- Time/clock
- Random number generators
- External services you don't own

**Use real implementations for internal code:**
- Classes and modules you wrote
- Internal collaborators and helpers
- Business logic components

When you see tests mocking internal classes, refactor to use real implementations or in-memory fakes at the system boundary instead.
