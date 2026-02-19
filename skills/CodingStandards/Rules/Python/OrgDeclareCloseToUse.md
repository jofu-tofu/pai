### 4.2 Declare Variables Close to Use

**Impact: HIGH (Reduces cognitive load, clarifies data flow)**

Variables declared far from their use force readers to scroll back and forth, increasing cognitive load. Declaring close to use makes data flow obvious and reduces the "working memory" needed to understand code.

**Incorrect: Variables declared far from use**

```python
def process_order(order: Order) -> Receipt:
    # Variables declared at top, used much later
    tax_rate = 0.08
    discount_multiplier = 0.9
    shipping_cost = 5.99

    # ... 50 lines of validation ...

    # ... 30 lines of inventory checks ...

    # Finally using the variables
    subtotal = calculate_subtotal(order.items)
    tax = subtotal * tax_rate  # Where was tax_rate defined?
    total = subtotal * discount_multiplier + tax + shipping_cost

    return Receipt(total=total)
```

**Correct: Variables declared at point of use**

```python
def process_order(order: Order) -> Receipt:
    validate_order(order)
    check_inventory(order.items)

    # Variables declared right where they're used
    subtotal = calculate_subtotal(order.items)

    tax_rate = 0.08
    tax = subtotal * tax_rate

    discount_multiplier = 0.9
    discounted = subtotal * discount_multiplier

    shipping_cost = 5.99
    total = discounted + tax + shipping_cost

    return Receipt(total=total)
```

**Additional benefits:**
- Easier to extract functions (related code is grouped)
- Reduces variable scope (fewer places where bugs can hide)
- Makes dead code obvious (unused variables near their declaration)

**Exception: Configuration/constants at module or class level**

```python
# OK at module level - these are configuration
TAX_RATE = 0.08
SHIPPING_BASE = 5.99

class OrderProcessor:
    # OK at class level - shared by all methods
    DEFAULT_DISCOUNT = 0.9
```
