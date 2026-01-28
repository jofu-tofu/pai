### 1.3 Clean Code That Works

**Impact: HIGH (TDD delivers both correctness and maintainability)**

Kent Beck's summary of TDD's goal: "Clean code that works." TDD isn't just about testing - it's a design methodology that produces code which is both correct (works) and maintainable (clean). The refactor step is not optional.

**Problem: Skipping the refactor step**

```pseudocode
// Test passes, developer moves on
function calculate_price(item, quantity, customer, date, promo_code):
    price = item.base_price * quantity
    if customer.tier == "gold":
        price = price * 0.9
    elif customer.tier == "silver":
        price = price * 0.95
    if promo_code == "SAVE10":
        price = price * 0.9
    elif promo_code == "SAVE20":
        price = price * 0.8
    if date.month == 12:
        price = price * 0.95
    // ... 50 more lines of nested conditionals
    return price

// Tests pass! Ship it! (But code is unmaintainable)
```

**Solution: Refactor after green**

```pseudocode
// After tests pass, REFACTOR to clean design
function calculate_price(item, quantity, customer, date, promo_code):
    base = calculate_base_price(item, quantity)
    discounts = [
        get_loyalty_discount(customer),
        get_promo_discount(promo_code),
        get_seasonal_discount(date)
    ]
    return apply_discounts(base, discounts)

function get_loyalty_discount(customer):
    discounts = {"gold": 0.10, "silver": 0.05}
    return discounts.get(customer.tier, 0)

// Each function is small, focused, testable
// Tests still pass - behavior unchanged, design improved
```

**The Test:** "After making my test green, did I look for opportunities to improve the code's design?"

**The TDD mantra:**
1. **Red** - Write a test that fails (defines what you need)
2. **Green** - Make it pass with the simplest code that works
3. **Refactor** - Improve the design while keeping tests green

**Why refactoring is mandatory:**
- "Green" code is often ugly - you wrote the fastest thing that works
- Technical debt accumulates if you skip refactoring
- Clean code is easier to test, which enables more TDD
- The tests give you safety to refactor aggressively
