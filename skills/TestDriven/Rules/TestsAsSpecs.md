### 1.2 Tests as Executable Specifications

**Impact: HIGH (tests become living documentation)**

Tests should read as specifications of behavior. When written well, tests document exactly what the system does - and unlike written documentation, they can't become outdated because they're executed.

**Problem: Tests that don't communicate intent**

```pseudocode
function test_1():
    x = MyClass()
    x.do_thing(5, true, "abc")
    assert x.result == 42

function test_2():
    x = MyClass()
    x.do_thing(0, false, "")
    assert x.result == 0
```

**Solution: Tests as readable specifications**

```pseudocode
function test_calculate_shipping_for_domestic_orders():
    // GIVEN a domestic order with standard items
    order = Order(
        destination=domestic_address,
        items=[standard_item]
    )

    // WHEN calculating shipping
    shipping = calculate_shipping(order)

    // THEN flat rate domestic shipping applies
    assert shipping.cost == DOMESTIC_FLAT_RATE
    assert shipping.carrier == "USPS"

function test_calculate_shipping_for_oversized_international():
    // GIVEN an international order with oversized item
    order = Order(
        destination=international_address,
        items=[oversized_item]
    )

    // WHEN calculating shipping
    shipping = calculate_shipping(order)

    // THEN premium international carrier required
    assert shipping.cost > DOMESTIC_FLAT_RATE
    assert shipping.carrier == "FedEx International"
```

**The Test:** "Could a new team member understand the system's behavior by reading only the tests?"

**Best practices:**
- Test names describe the scenario and expected outcome
- Use descriptive variable names that convey meaning
- Structure tests to show Given/When/Then or Arrange/Act/Assert
- Test edge cases explicitly with named scenarios
- Avoid magic numbers - use named constants or clearly labeled values
