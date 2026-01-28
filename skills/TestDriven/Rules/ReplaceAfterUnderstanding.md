### 4.3 Replace Characterization Tests After Understanding

**Impact: MEDIUM (test maintenance and clarity)**

Characterization tests are scaffolding, not permanent fixtures. As you understand the system, replace them with proper behavior tests that document intent. Characterization tests say "it does this"; behavior tests say "it should do this."

**Problem: Keeping characterization tests forever**

```pseudocode
// Written 2 years ago when we inherited the code
function test_process_payment_characterization():
    inputs = load_all_fixtures()

    for input in inputs:
        result = process_payment(input)
        assert result == load_golden_master(input.id)

// Problems:
// - No one knows WHY certain behaviors exist
// - Golden masters may encode bugs
// - Hard to modify when requirements change
// - New developers can't understand the rules
// - Test failures are cryptic ("output differs at line 47")
```

**Solution: Evolve to behavior tests**

```pseudocode
// After understanding the system, write proper tests

// Characterization test revealed: member orders get 10% discount
function test_member_orders_receive_10_percent_discount():
    order = Order(customer_type="member", subtotal=100)

    result = process_payment(order)

    assert result.discount == 10
    assert result.total == 90

// Characterization test revealed: orders over $500 require approval
function test_large_orders_require_approval():
    order = Order(subtotal=501)

    result = process_payment(order)

    assert result.status == "pending_approval"
    assert result.requires_approval == true

// Characterization test revealed: international orders add flat $25 fee
function test_international_orders_include_shipping_fee():
    order = Order(shipping_country="CA")

    result = process_payment(order)

    assert result.shipping_fee == 25

// Now delete the characterization test - behavior is documented properly
```

**The Test:** "Do I understand this code well enough to explain WHY it behaves this way?"

**When to replace characterization tests:**
- You understand the business rule behind the behavior
- You can name the test after the intent, not just the output
- You can simplify the test to focus on one concept
- Stakeholders have confirmed the behavior is correct (not a bug)

**Transition strategy:**
1. Keep characterization test as safety net
2. Write behavior test for one understood aspect
3. Verify both tests pass/fail together
4. Once confident, remove that case from characterization test
5. Repeat until characterization test is empty
6. Delete characterization test

**Warning signs to NOT replace yet:**
- "I think it does this because..."
- "It must be for..."
- "Probably legacy from..."
- If you're guessing, keep the characterization test
