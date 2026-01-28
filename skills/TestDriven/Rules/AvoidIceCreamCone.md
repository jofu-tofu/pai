### 5.1 Avoid the Ice Cream Cone

**Impact: HIGH (fast, reliable test suite vs slow, flaky mess)**

The "ice cream cone" is an inverted test pyramid: many slow E2E tests, few unit tests. This leads to slow feedback, flaky tests, and high maintenance cost. Flip it to a proper pyramid.

**Problem: Too many E2E tests**

```pseudocode
// The ice cream cone anti-pattern
//
//         /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
//        /   Manual Tests   \
//       /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
//      /      E2E Tests        \      <- Many: 200 tests, 45 min runtime
//     /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
//    /    Integration Tests      \    <- Some: 50 tests
//    ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
//           Unit Tests               <- Few: 20 tests
//
// Result: 45+ minute test runs, constant flakiness,
// debugging failures is painful

test_suite:
    e2e_tests: 200 tests, 45 minutes
    integration_tests: 50 tests, 5 minutes
    unit_tests: 20 tests, 2 seconds
```

**Solution: The proper test pyramid**

```pseudocode
// The test pyramid (correct)
//
//              /\
//             /  \
//            / E2E \              <- Few: 10 critical user journeys
//           /‾‾‾‾‾‾‾‾\
//          /Integration\          <- Some: 50 tests at service boundaries
//         /‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
//        /   Unit Tests    \      <- Many: 500 tests for logic
//       ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
//
// Result: 2 minute test runs, reliable, easy to debug

test_suite:
    unit_tests: 500 tests, 10 seconds
    integration_tests: 50 tests, 2 minutes
    e2e_tests: 10 tests, 3 minutes
```

**The Test:** "How long does our test suite take? How often do tests flake?"

**Symptoms of the ice cream cone:**
- Test suite takes 30+ minutes
- Developers don't run tests locally (too slow)
- "That test is flaky, just re-run it"
- Test failures are hard to diagnose
- Most tests require the full system running
- CI queue backs up waiting for tests

**How to fix it:**
1. Identify what E2E tests are actually testing
2. Push tests down: if it tests logic, make it a unit test
3. If it tests integration, use an integration test
4. Keep E2E only for critical user journeys
5. New features: write unit tests first, E2E last

**What belongs at each level:**
- **Unit:** Business logic, algorithms, calculations, validations
- **Integration:** Database queries, API contracts, service interactions
- **E2E:** Critical user journeys, smoke tests, deployment verification
