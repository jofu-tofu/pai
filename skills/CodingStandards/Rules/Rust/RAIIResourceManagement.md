### RS9.4 RAIIResourceManagement

**Impact: HIGH (Drop-based cleanup prevents resource leaks on every exit path including panics)**

Rust's `Drop` trait provides deterministic resource cleanup that runs on every exit path: normal returns, early returns with `?`, and panics (in unwind mode). Manual cleanup code is fragile because every new `return` or `?` introduces a path that can skip the cleanup. Wrap resources in RAII guard types so that cleanup is structurally guaranteed by the compiler.

**Incorrect: Manual cleanup that leaks on early return**

```rust
fn process_file(path: &Path) -> Result<Stats, Error> {
    let lock_path = path.with_extension("lock");
    std::fs::write(&lock_path, "locked")?;

    let data = std::fs::read_to_string(path)?; // <-- early return leaks lock file

    let parsed = parse_data(&data)?;            // <-- early return leaks lock file

    let stats = compute_stats(&parsed);

    std::fs::remove_file(&lock_path)?;          // cleanup only runs on success
    Ok(stats)
}
```

**Correct: RAII guard ensures cleanup on all paths**

```rust
struct LockFile {
    path: PathBuf,
}

impl LockFile {
    fn acquire(path: PathBuf) -> std::io::Result<Self> {
        std::fs::write(&path, "locked")?;
        Ok(Self { path })
    }
}

impl Drop for LockFile {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.path);
    }
}

fn process_file(path: &Path) -> Result<Stats, Error> {
    let _lock = LockFile::acquire(path.with_extension("lock"))?;
    // Lock is released on ANY exit: normal return, ?, or panic

    let data = std::fs::read_to_string(path)?;
    let parsed = parse_data(&data)?;
    Ok(compute_stats(&parsed))
}
```

**When acceptable:**
- Trivial scopes with a single possible exit point where a guard type would be over-engineering
- Performance-critical inner loops where the Drop overhead of creating and destroying guards per iteration is measurable
- When using `ManuallyDrop` for FFI types where Rust must not run the destructor because ownership transfers to C
