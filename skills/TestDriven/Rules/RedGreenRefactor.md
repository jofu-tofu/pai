### 1.1 Red-Green-Refactor Cycle

**Impact: CRITICAL (foundation of test-driven development)**

The fundamental TDD rhythm: write a failing test (red), make it pass with minimal code (green), then improve the design (refactor). This cycle ensures tests drive design and every line of production code exists because a test required it.

**Problem: Writing tests after code**

```pseudocode
// Code written first, tests bolted on after
function calculate_discount(order):
    // Complex logic written without test guidance
    if order.total > 100:
        if order.customer.is_premium:
            return order.total * 0.2
        return order.total * 0.1
    return 0

// Tests written after - often miss edge cases
// and tend to test the implementation that exists
function test_calculate_discount():
    assert calculate_discount(order_101) == 10.1  // Just verifies what code does
```

**Solution: Red-Green-Refactor**

```pseudocode
// RED: Write failing test first - defines expected behavior
function test_no_discount_under_100():
    order = Order(total=99)
    assert calculate_discount(order) == 0  // FAILS - function doesn't exist

// GREEN: Write minimal code to pass
function calculate_discount(order):
    return 0  // Passes first test

// RED: Next test
function test_10_percent_over_100():
    order = Order(total=150)
    assert calculate_discount(order) == 15  // FAILS

// GREEN: Make it pass
function calculate_discount(order):
    if order.total > 100:
        return order.total * 0.1
    return 0

// REFACTOR: Improve design while tests stay green
// Extract constants, improve naming, simplify logic
```

**The Test:** "Did I write my test before the code it tests? Did the test fail first?"

**Why this matters:**
- Tests written after code tend to verify the implementation, not the requirements
- Failing-first proves the test can actually fail (catching assertion bugs)
- Forces you to think about the interface before implementation
- Each test adds exactly one new behavior requirement
