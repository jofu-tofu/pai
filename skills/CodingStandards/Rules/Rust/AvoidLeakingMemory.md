### RS9.6 AvoidLeakingMemory

**Impact: MEDIUM (Leaked memory is permanent for the process lifetime; leaked Drop obligations silently skip cleanup)**

Rust guarantees memory safety but does not guarantee destructors will run. `std::mem::forget`, `Box::leak`, and reference cycles with `Rc` all prevent `Drop` from executing. If your program relies on `Drop` for correctness (not just cleanup), these leaks become logic bugs. Design types so that leaking them is wasteful but not incorrect, and document intentional leaks with clear comments explaining the lifetime rationale.

**Incorrect: Relying on Drop for correctness, then leaking**

```rust
struct TempDir {
    path: PathBuf,
}

impl Drop for TempDir {
    fn drop(&mut self) {
        // Correctness depends on this running -- leaked TempDir
        // leaves orphaned directories forever
        std::fs::remove_dir_all(&self.path).ok();
    }
}

fn setup_environment() -> &'static Path {
    let dir = Box::new(TempDir {
        path: PathBuf::from("/tmp/myapp-work"),
    });
    std::fs::create_dir_all(&dir.path).unwrap();
    // Leak to get 'static reference -- Drop NEVER runs
    let leaked: &'static TempDir = Box::leak(dir);
    &leaked.path
}
```

**Correct: Intentional leaks documented; Drop not required for correctness**

```rust
/// Application-wide configuration loaded once at startup.
/// Intentionally leaked to get a 'static reference because:
/// 1. The config lives for the entire process lifetime
/// 2. No cleanup is needed -- it's read-only data
/// 3. The OS reclaims memory on process exit
fn init_config() -> &'static Config {
    let config = Box::new(Config::load_from_env().expect("config required"));
    Box::leak(config)
}

/// Temporary directory with explicit cleanup method.
/// Drop serves as a safety net, but callers should use cleanup()
/// for guaranteed removal since Drop may not run.
struct TempDir {
    path: PathBuf,
    cleaned: bool,
}

impl TempDir {
    fn cleanup(mut self) -> std::io::Result<()> {
        std::fs::remove_dir_all(&self.path)?;
        self.cleaned = true;
        Ok(())
    }
}

impl Drop for TempDir {
    fn drop(&mut self) {
        if !self.cleaned {
            eprintln!("warning: TempDir dropped without explicit cleanup: {:?}", self.path);
            std::fs::remove_dir_all(&self.path).ok();
        }
    }
}
```

**When acceptable:**
- Leaking process-lifetime singletons (logger, config, thread pool) where the OS reclaims memory on exit
- `Box::leak` for string literals or lookup tables that genuinely live for `'static`
- Test harnesses where leaked allocations are cleaned up by process exit
