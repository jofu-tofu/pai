### 4.1 Characterization Tests for Unknown Behavior

**Impact: HIGH (safe refactoring of legacy code)**

When you need to change code you don't fully understand, first capture its current behavior. Characterization tests don't verify correctness - they detect change. They're your safety net while refactoring legacy code.

**Problem: Refactoring without a safety net**

```pseudocode
// 200 lines of legacy code, no tests, no documentation
function process_order(order):
    // Complex business logic accumulated over years
    // Some of it is obviously correct
    // Some of it handles edge cases you don't know about
    // Some of it might be bugs that customers now depend on

    // Changing anything could break unknown dependencies
    // How do you know if your refactoring changed behavior?
```

**Solution: Characterize before changing**

```pseudocode
// Step 1: Gather realistic inputs
sample_orders = load_from_production_logs()  // Or create representative samples

// Step 2: Record current behavior
for order in sample_orders:
    result = process_order(order)
    save_expected_result(order.id, result)  // Golden master

// Step 3: Create characterization test
function test_process_order_characterization():
    sample_orders = load_sample_orders()

    for order in sample_orders:
        result = process_order(order)
        expected = load_expected_result(order.id)

        assert result == expected

// Step 4: Refactor with confidence
// - If test passes: behavior preserved
// - If test fails: you changed behavior - investigate if intentional

// Step 5: As you understand the code, add semantic tests
function test_process_order_applies_member_discount():
    member_order = Order(customer_type="member", total=100)

    result = process_order(member_order)

    assert result.discount == 10  // Now you understand this rule
```

**The Test:** "Would I notice if this code's behavior changed subtly?" Characterization tests are change detectors.

**When to use characterization tests:**
- Inheriting legacy code without tests
- Before large refactoring efforts
- When documentation is missing or outdated
- When the original developers are unavailable
- Before replacing a system (to ensure parity)

**Important caveats:**
- Characterization tests may encode bugs as "expected" behavior
- They're temporary - replace with proper tests as understanding grows
- They don't tell you if behavior is correct, only if it changed
- Use realistic production data when possible
