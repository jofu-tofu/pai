### 5.3 Tests Are Untested Code

**Impact: MEDIUM (hidden complexity risk)**

Test code doesn't have tests. Every line of test code is unverified code that can contain bugs. Keep tests simple, obvious, and straightforward. Complexity in tests is hidden risk.

**Problem: Complex test code**

```pseudocode
// Test with too much logic
function test_calculate_shipping():
    // Complex setup logic
    items = []
    for i in range(5):
        weight = random.randint(1, 100) if i % 2 == 0 else 50
        items.append(create_item(weight=weight))

    // Dynamic expected value calculation
    expected_base = sum(item.weight * 0.5 for item in items)
    expected_discount = expected_base * 0.1 if len(items) > 3 else 0
    expected_total = expected_base - expected_discount

    result = calculate_shipping(items)

    assert abs(result - expected_total) < 0.01

// Problems:
// - Is the expected value calculation correct?
// - Random values make failures hard to reproduce
// - The test logic itself might have bugs
// - Reader can't verify correctness at a glance
```

**Solution: Simple, obvious tests**

```pseudocode
function test_shipping_base_rate_is_50_cents_per_pound():
    items = [
        create_item(weight=10),  // 10 lbs
        create_item(weight=20),  // 20 lbs
    ]

    result = calculate_shipping(items)

    // 30 lbs * $0.50 = $15.00 (obvious arithmetic)
    assert result == 15.00

function test_shipping_discount_10_percent_over_3_items():
    items = [
        create_item(weight=10),
        create_item(weight=10),
        create_item(weight=10),
        create_item(weight=10),  // 4 items
    ]

    result = calculate_shipping(items)

    // Base: 40 lbs * $0.50 = $20.00
    // Discount: $20.00 * 10% = $2.00
    // Total: $18.00
    assert result == 18.00
```

**The Test:** "Can someone verify this test is correct by reading it once?"

**Keep tests simple:**
- No loops in test logic
- No conditionals in test logic
- Hardcoded expected values (not calculated)
- Obvious, round numbers for test data
- No randomness in test setup
- One concept per test

**When tests need complexity:**
If you find yourself needing complex test logic:
1. Maybe the code under test is too complex - simplify it
2. Maybe you need a test helper - but keep helpers simple too
3. Maybe you need a builder/factory - but keep builders obvious

**Test helpers should be:**
- Obviously correct (no edge cases)
- Frequently reused (justifies the abstraction)
- Tested by use (many tests failing would reveal bugs)
