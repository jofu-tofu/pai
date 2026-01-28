### 2.1 Test Behavior, Not Implementation

**Impact: CRITICAL (tests that survive refactoring vs tests that break constantly)**

Tests should verify WHAT the code does, not HOW it does it. If you could rewrite the entire implementation with a different algorithm and the test should still pass, the test is correct.

**Problem: Testing implementation details**

```pseudocode
// This test is coupled to HOW we get users
function test_get_active_users():
    db = mock()
    db.execute.returns([{id: 1, active: true}])
    service = UserService(db)

    service.get_active_users()

    // Breaks if we change to ORM, add caching, or restructure query
    assert db.execute.was_called_with("SELECT * FROM users WHERE active = 1")
```

**Solution: Testing behavior through observable outcomes**

```pseudocode
// This test verifies WHAT we get, survives any implementation change
function test_get_active_users_returns_only_active():
    service = UserService(test_database)
    service.create_user("alice", active=true)
    service.create_user("bob", active=false)

    result = service.get_active_users()

    assert length(result) == 1
    assert result[0].name == "alice"
```

**The Test:** "If I rewrote this entire function with a different algorithm, should this test still pass?" If no, the test is too coupled to implementation.

**Test these (observable behavior):**
- Return values
- State changes visible through public interface
- Side effects at system boundaries (files written, HTTP calls made)
- Exceptions thrown for invalid inputs
- Observable outputs

**Let these vary freely (implementation details):**
- Which internal methods are called
- The order of internal operations
- Which data structures are used internally
- Exact SQL queries or internal APIs
- Number of times internal functions execute

When you see tests asserting on the second list, refactor them to assert on the first list instead.
