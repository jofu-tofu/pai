### 3.3 Higher-Level Tests Are More Stable

**Impact: HIGH (test pyramid economics)**

Tests at higher abstraction levels (integration, feature, API) survive structural changes better than low-level unit tests. While unit tests are faster, they're more coupled to implementation. Balance your test pyramid accordingly.

**Problem: Over-investment in low-level tests**

```pseudocode
// Testing every internal class separately
class UserValidator:
    function validate(user): ...

class UserRepository:
    function save(user): ...

class UserNotifier:
    function notify(user): ...

class UserService:
    function create(user):
        self.validator.validate(user)
        saved = self.repo.save(user)
        self.notifier.notify(saved)
        return saved

// 4 test files, one per class
// test_user_validator.py - 10 tests
// test_user_repository.py - 8 tests
// test_user_notifier.py - 5 tests
// test_user_service.py - 12 tests (mocking all collaborators)

// Refactoring: Combine validator into service, change repo interface
// Result: 3 of 4 test files need significant rewrites
```

**Solution: More tests at service/feature level**

```pseudocode
// Test the user creation feature, not individual classes
function test_create_user_with_valid_data():
    service = create_user_service(test_database, fake_email)
    user_data = valid_user_data()

    result = service.create(user_data)

    assert result.id is not None
    assert test_database.find_user(result.id).email == user_data.email
    assert fake_email.was_sent_to(user_data.email)

function test_create_user_rejects_invalid_email():
    service = create_user_service(test_database, fake_email)
    user_data = user_data_with(email="invalid")

    error = expect_error(service.create, user_data)

    assert error.field == "email"
    assert test_database.count_users() == 0  // Nothing persisted
    assert fake_email.was_not_called()

// Internal class boundaries can now shift freely
// Combine, split, rename, reorganize - tests survive
```

**The Test:** "Would this test survive if I merged these two classes, or split this one into three?"

**The stability gradient:**
```
Most Stable    │ E2E / Feature tests (test whole user journeys)
               │ API / Integration tests (test service boundaries)
               │ Component tests (test public module interfaces)
Least Stable   │ Class/unit tests (test individual class behavior)
```

**Balancing the pyramid:**
- More tests doesn't mean more stability
- A few well-placed integration tests often provide more confidence than many unit tests
- Unit tests for complex algorithms; integration tests for orchestration
- If you're constantly rewriting tests after refactoring, move up a level
