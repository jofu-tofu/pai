# Boundary & Edge Case Error Review

> Evaluate whether the code handles boundary values correctly — the inputs at the edges of valid ranges where off-by-one, empty-collection, and limit-condition bugs hide.

## Mental Model

Developers mentally test the "middle" case and assume boundaries follow. The code works for N=10 but fails for N=0, N=1, or N=MAX. Boundary errors are the most common correctness bugs found by both human reviewers and automated tools because they live in the gap between the developer's mental model ("this loop processes all items") and the actual behavior at the edges ("this loop skips the last item" or "this loop crashes on empty input"). The reviewer's job is to mentally substitute boundary values — zero, one, last, max, empty — into every arithmetic expression, loop bound, and collection access.

## Detection Heuristics (ordered by severity)

### CRITICAL
- **Fencepost error in loop bounds** — `<` vs `<=`, iteration count vs semantic goal. The loop body executes one too many or one too few times. Check: does the loop process exactly the intended range, or is the boundary off by one?
- **Slice/substring boundary mismatch** — inclusive vs exclusive end, language-dependent. Python slices are `[start:end)`, JavaScript `slice(start, end)` is exclusive on end, but `substring` has different edge-case behavior. Check: does the slice include the intended last element?
- **Empty collection bypass** — first access assumes >=1 element: `arr[0]`, `reduce()` without initial value, `min()`/`max()` on empty set. The code crashes or returns undefined when the collection is empty. Check: what happens when the input array/list/set has zero elements?

### HIGH
- **Comparison direction error** — operands on wrong side, `<` where `>` intended. Often a copy-paste artifact where the comparison was reversed. Check: trace the comparison with a concrete value on each side of the boundary.
- **Index arithmetic drift** — computed offset wrong for zero-based vs one-based. Common when translating between APIs that use different indexing conventions (database rows are 1-based, arrays are 0-based). Check: does the index calculation account for the base?
- **Pagination/window boundary** — offset+limit produces overlap, gap, or off-by-one between pages. Page 1 shows items 1-10, page 2 should show 11-20 but shows 10-20 (overlap) or 12-21 (gap). Check: do consecutive pages tile perfectly with no overlap or gap?

### MEDIUM
- **Integer division truncation at boundary** — correct for most inputs, wrong at even/odd edge. `Math.floor(n/2)` vs `Math.ceil(n/2)` matters when n is odd. Check: test with both even and odd boundary values.
- **Length vs last-index confusion** — `.length` where `length - 1` needed, or vice versa. Accessing `arr[arr.length]` is always out of bounds; `arr[arr.length - 1]` is the last element. Check: is the code using length as an index or as a count?

## Severity Calibration

CRITICAL = boundary error produces wrong results or crashes for real-world inputs (empty collections, first/last elements). Immediate fix required.
HIGH = boundary error produces wrong results for edge cases that occur in production (pagination boundaries, index conversion). Should be fixed in this PR.
MEDIUM = boundary error produces wrong results for rare edge cases (odd-sized inputs, single-element collections). Flag for awareness.

## Language-Specific Notes

- **TypeScript/React:** `Array.prototype.reduce()` without initial value throws on empty arrays. `String.prototype.slice()` accepts negative indices (counts from end). `for...in` iterates keys as strings, causing arithmetic drift when used with numeric indices. React list rendering with `.map()` on potentially empty arrays is safe (returns `[]`) but `.reduce()` is not.
- **Python:** Slices never throw `IndexError` — `arr[100:200]` on a 3-element list returns `[]` silently. This hides boundary bugs. `range(n)` is `[0, n)` — fencepost errors when the developer thinks it includes `n`. `//` (floor division) truncates toward negative infinity, not toward zero — different from most languages.
- **Svelte:** `{#each items as item}` handles empty arrays gracefully (renders nothing), but accessing `items[0]` in a reactive statement will be `undefined` when the array is empty. `$:` reactive blocks re-run on any dependency change — boundary conditions in reactive computations can cause cascading re-renders.

## Good vs. Bad Examples

### Bad (before)

```typescript
// Fencepost: processes one too few items
function sumRange(start: number, end: number): number {
  let sum = 0;
  for (let i = start; i < end; i++) {  // excludes 'end'
    sum += i;
  }
  return sum;
}

// Empty collection bypass: crashes on empty array
function getAverage(scores: number[]): number {
  return scores.reduce((a, b) => a + b) / scores.length;
}
```

### Good (after)

```typescript
// Fencepost: inclusive range clearly documented
function sumRange(start: number, end: number): number {
  let sum = 0;
  for (let i = start; i <= end; i++) {  // includes 'end'
    sum += i;
  }
  return sum;
}

// Empty collection handled
function getAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
```

## Output Format

For each finding in this dimension, report:
- **Severity:** [CRITICAL/HIGH/MEDIUM]
- **File:** [path]
- **Line:** [range]
- **Heuristic:** [which specific heuristic from above was triggered]
- **Issue:** [1-2 sentences]
- **Recommendation:** [specific fix, not vague]

---

Sources: CWE-193 (Off-by-One Error), CWE-682 (Incorrect Calculation), Beizer (1990) Ch. 24 Domain Bugs, Clippy `absurd_extreme_comparisons`, SmartBear/Cisco Study checklist, Google Engineering Practices — "What to Look for in a Code Review."
