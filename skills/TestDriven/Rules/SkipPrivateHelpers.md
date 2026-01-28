### 2.4 Skip Testing Private Helpers

**Impact: HIGH (reduces test maintenance, improves design)**

Private/internal helper functions are implementation details. Test them through the public API they support. If a helper is complex enough to need its own tests, it's probably complex enough to be its own public unit.

**Problem: Testing private helpers directly**

```pseudocode
class OrderProcessor:
    function process(order):
        validated = self._validate(order)
        calculated = self._calculate_totals(validated)
        return self._format_result(calculated)

    // Private helpers
    function _validate(order): ...
    function _calculate_totals(order): ...
    function _format_result(order): ...

// Tests that reach into private methods
function test_validate_rejects_empty_order():
    processor = OrderProcessor()
    // Accessing private method - couples test to implementation
    result = processor._validate(empty_order)
    assert result.is_invalid

function test_calculate_totals_applies_tax():
    processor = OrderProcessor()
    // Another private method test
    result = processor._calculate_totals(order)
    assert result.tax == expected_tax
```

**Solution: Test through the public interface**

```pseudocode
// Test the same behaviors through the public API
function test_process_rejects_empty_order():
    processor = OrderProcessor()

    result = processor.process(empty_order)

    assert result.status == "rejected"
    assert result.error == "Order cannot be empty"

function test_process_includes_calculated_tax():
    processor = OrderProcessor()
    order = Order(items=[item_100_dollars])

    result = processor.process(order)

    assert result.tax == 10.00  // Assuming 10% tax
    assert result.total == 110.00

// Now you can freely refactor:
// - Inline helpers
// - Extract to separate class
// - Rename methods
// - Change internal flow
// Tests don't break
```

**The Test:** "If I renamed or inlined this private function tomorrow, would tests break?" If yes, move the tests to the public interface.

**When private helpers DO need tests:**
If a helper is so complex it needs dedicated tests, consider:
1. Extracting it to its own public class/module
2. Making it a documented utility function
3. Recognizing it as a hidden abstraction that deserves its own public interface

The need for testing is a design signal - listen to it.
