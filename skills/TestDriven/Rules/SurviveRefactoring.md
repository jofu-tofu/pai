### 3.1 Tests Should Survive Refactoring

**Impact: CRITICAL (the whole point of having tests)**

Refactoring means changing code structure without changing behavior. If tests break during a valid refactoring, they're testing structure, not behavior. Tests that require changes after every refactoring provide false security and slow development.

**Problem: Tests break when you refactor**

```pseudocode
// Original code
class ShoppingCart:
    items = []

    function add(item):
        self.items.append(item)

    function total():
        sum = 0
        for item in self.items:
            sum += item.price
        return sum

// Test coupled to implementation
function test_add_appends_to_items():
    cart = ShoppingCart()
    cart.add(item)
    assert cart.items == [item]  // Directly accessing internal list

// Refactoring: change internal storage to dictionary for O(1) lookup
class ShoppingCart:
    items = {}  // Changed from list to dict

    function add(item):
        self.items[item.id] = item  // Different internal structure

    function total():
        return sum(item.price for item in self.items.values())

// TEST BREAKS! Even though behavior is identical
```

**Solution: Test observable behavior only**

```pseudocode
function test_added_items_contribute_to_total():
    cart = ShoppingCart()
    item1 = Item(price=10)
    item2 = Item(price=20)

    cart.add(item1)
    cart.add(item2)

    assert cart.total() == 30

function test_cart_contains_added_items():
    cart = ShoppingCart()
    item = Item(id="abc", price=10)

    cart.add(item)

    assert cart.contains(item.id)  // Public method, not internal access

// Now the list→dict refactoring doesn't break any tests
```

**The Test:** "If I restructured this code's internals without changing its external behavior, would these tests still pass?"

**Signs your test is resilient (good):**
- Tests call only public methods
- Tests assert on return values and observable state
- Tests verify outcomes, not call sequences
- Tests use fakes at system boundaries, not internal mocks

**Signs to refactor your test (needs work):**
- Tests access private/internal fields directly
- Tests verify method call sequences
- Tests assert on internal data structures
- Tests mock collaborators at the wrong level

**These refactorings should leave tests green:**
- Extracting a method
- Inlining a method
- Changing internal data structures
- Renaming private variables
- Reorganizing internal code flow
- Extracting or inlining a class

If tests break on any of these, the tests are coupled to implementation.
