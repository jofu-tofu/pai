### 2.3 Test the Contract

**Impact: CRITICAL (tests document and enforce API guarantees)**

Test what goes in and what comes out - the contract between caller and callee. The contract is what callers can rely on; implementation is how you deliver it. Tests should verify contract compliance, not implementation fidelity.

**Problem: Testing internal mechanics**

```pseudocode
function test_sort_uses_quicksort():
    array = [3, 1, 4, 1, 5]
    sorter = Sorter()

    // Spy on internal method
    spy_on(sorter, "partition")

    sorter.sort(array)

    // Verifies HOW it sorts, not THAT it sorts
    assert sorter.partition.was_called()
    assert sorter.partition.call_count > 0
```

**Solution: Test the contract (input → output)**

```pseudocode
function test_sort_returns_elements_in_ascending_order():
    array = [3, 1, 4, 1, 5, 9, 2, 6]
    sorter = Sorter()

    result = sorter.sort(array)

    // Contract: sorted output with same elements
    assert result == [1, 1, 2, 3, 4, 5, 6, 9]

function test_sort_preserves_all_elements():
    array = [3, 1, 4]
    sorter = Sorter()

    result = sorter.sort(array)

    assert length(result) == length(array)
    assert set(result) == set(array)

function test_sort_handles_empty_array():
    sorter = Sorter()

    result = sorter.sort([])

    assert result == []
```

**The Test:** "Does this test verify what callers care about, or internal details they shouldn't depend on?"

**A contract includes:**
- Given valid input X, return output Y
- Given invalid input, throw specific error
- Side effects that callers depend on (files created, events emitted)
- Performance guarantees (if documented)
- Thread safety guarantees (if documented)

**A contract does NOT include:**
- Which algorithm is used
- Internal data structures
- Order of internal operations
- Which helper methods are called
- How many iterations or recursions occur
