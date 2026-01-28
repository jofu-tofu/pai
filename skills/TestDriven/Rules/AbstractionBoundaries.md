### 2.2 Test at Abstraction Boundaries

**Impact: CRITICAL (stable tests vs constantly rewriting tests)**

Test through public interfaces, not internal classes. Public APIs form stable contracts that change rarely; internal structure changes frequently during refactoring. Tests at the right abstraction level survive internal reorganization.

**Problem: Testing internal classes directly**

```pseudocode
// Internal implementation detail
class HelperFormatter:
    function format(data):
        // formatting logic

// Public API
class ReportGenerator:
    helper = HelperFormatter()

    function generate(data):
        return helper.format(data)

// Test targets internal class - breaks if we inline or restructure
function test_helper_formatter_formats_correctly():
    helper = HelperFormatter()
    result = helper.format(sample_data)
    assert result == expected_format
```

**Solution: Test through the public interface**

```pseudocode
// Test the public API - internal structure can change freely
function test_report_generator_outputs_correct_format():
    generator = ReportGenerator()

    result = generator.generate(sample_data)

    assert result.contains("Expected Header")
    assert result.contains(sample_data.key_value)

// Now we can freely:
// - Inline HelperFormatter into ReportGenerator
// - Split HelperFormatter into multiple classes
// - Replace with a library
// - Change the internal algorithm
// All without touching tests
```

**The Test:** "Is this class/function part of the public API, or could I delete it during refactoring?" If it could be deleted or inlined, test through something more stable.

**Identifying abstraction boundaries:**
- Module/package public exports
- Class public methods
- API endpoints
- Published interfaces or contracts
- Anything documented for external use

**Not abstraction boundaries (internal):**
- Private/protected methods
- Helper classes in the same module
- Internal utility functions
- Implementation-detail classes
