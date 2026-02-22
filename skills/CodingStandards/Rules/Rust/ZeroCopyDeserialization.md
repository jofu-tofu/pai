### RS4.8 ZeroCopyDeserialization

**Impact: MEDIUM (Borrowing from the input buffer instead of allocating owned Strings eliminates per-field heap allocations during deserialization of large payloads)**

Standard deserialization allocates a new String for every string field in the input. For large payloads with many string fields -- log records, API responses, configuration files -- these allocations dominate parse time. Zero-copy deserialization borrows directly from the input buffer, replacing per-field allocations with lifetime-tracked references. The serde `#[serde(borrow)]` attribute, the zerocopy crate, and rkyv provide different levels of zero-copy support.

**Incorrect: Owning all deserialized strings**

```rust
use serde::Deserialize;

#[derive(Deserialize)]
struct LogEntry {
    timestamp: String,  // allocates
    level: String,      // allocates
    message: String,    // allocates
    source: String,     // allocates -- 4 allocations per log entry
}

fn parse_logs(json_bytes: &[u8]) -> Vec<LogEntry> {
    // Each entry allocates 4 Strings from the allocator
    serde_json::from_slice(json_bytes).unwrap()
}
```

**Correct: Borrow from the input buffer**

```rust
use serde::Deserialize;

#[derive(Deserialize)]
struct LogEntry<'a> {
    #[serde(borrow)]
    timestamp: &'a str,  // points into input buffer
    #[serde(borrow)]
    level: &'a str,      // points into input buffer
    #[serde(borrow)]
    message: &'a str,    // points into input buffer
    #[serde(borrow)]
    source: &'a str,     // zero allocations per log entry
}

fn parse_logs(json_bytes: &[u8]) -> Vec<LogEntry<'_>> {
    // Borrows string data directly from json_bytes -- no per-field allocation
    serde_json::from_slice(json_bytes).unwrap()
}

// For binary formats, zerocopy provides truly zero-cost access:
// use zerocopy::{FromBytes, Immutable, KnownLayout};
// #[derive(FromBytes, Immutable, KnownLayout)]
// #[repr(C)]
// struct Header { version: u32, length: u64 }
// let header = Header::read_from_prefix(bytes).unwrap();
```

**When acceptable:**
- Deserialized data must outlive the input buffer (stored in a cache, sent to another thread)
- The payload is small and allocation cost is negligible compared to network latency
- String fields require transformation (trimming, case conversion) that would invalidate borrowed references anyway
