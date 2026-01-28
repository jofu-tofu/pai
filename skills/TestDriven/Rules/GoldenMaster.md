### 4.2 Golden Master for Complex Output

**Impact: HIGH (testing untestable code)**

When output is complex (reports, rendered HTML, file formats, serialized data), compare against a saved "golden master" snapshot. Any difference triggers review. Particularly useful for legacy code or output that's hard to assert on piece by piece.

**Problem: Complex output is hard to test**

```pseudocode
function generate_monthly_report(data):
    // Returns 500-line formatted report with:
    // - Headers, tables, calculations
    // - Dynamic content based on data
    // - Formatting that matters for readability

// How do you test this?
function test_generate_report():
    result = generate_monthly_report(data)

    // Asserting on every line is unmaintainable
    assert result.line[0] == "Monthly Report - January 2024"
    assert result.line[1] == "================================"
    assert result.line[2] == ""
    assert result.line[3] == "Summary:"
    // ... 500 more assertions
```

**Solution: Golden master comparison**

```pseudocode
function test_monthly_report_golden_master():
    data = load_test_fixture("january_data")

    result = generate_monthly_report(data)

    // Compare to saved expected output
    golden = load_golden_master("january_report.txt")
    assert result == golden

// To update golden master after intentional changes:
// 1. Review the diff carefully
// 2. If changes are correct, save new output as golden master
// 3. Commit the updated golden master

function update_golden_master():
    data = load_test_fixture("january_data")
    result = generate_monthly_report(data)
    save_golden_master("january_report.txt", result)
```

**The Test:** "Can I detect any unintended change in this complex output?"

**Golden master workflow:**
1. Generate output with known input
2. Review output manually (or get stakeholder approval)
3. Save as golden master
4. Future tests compare against golden master
5. On failure: diff shows exactly what changed
6. Developer decides: bug or intentional change?

**Best practices:**
- Use deterministic inputs (no random, no timestamps)
- Normalize output (sort collections, consistent formatting)
- Store golden masters in version control
- Include review step before accepting new golden master
- Consider multiple golden masters for different scenarios

**Good candidates for golden master:**
- Report generation
- HTML/PDF rendering
- Serialization (JSON, XML, etc.)
- File format output
- Log output patterns
- Complex calculations with many outputs
