# Concurrency & Async -- Rust

> Write concurrent code that leverages the type system to prevent data races at compile time and respects the async runtime's cooperative scheduling contract.

## Mental Model

Rust's concurrency story is built on three pillars: the ownership system, the Send/Sync marker traits, and the async runtime's cooperative scheduling model. Understanding how these interact is essential to writing correct concurrent Rust.

**Ownership eliminates data races at compile time.** The borrow checker enforces that mutable access is exclusive -- you cannot have a `&mut T` while any other reference to that `T` exists. This guarantee, which costs nothing at runtime, means that the entire class of "concurrent modification" bugs that plague other languages simply cannot compile in Rust. Shared state requires explicit synchronization primitives (Mutex, RwLock, channels), and the compiler verifies that they are used.

**Send and Sync define the thread-safety contract.** `Send` means a type can be transferred to another thread. `Sync` means a type can be shared between threads via reference. These are auto-traits -- the compiler derives them from the type's fields. `Rc` is not Send (its reference count is not atomic); `Arc` is Send + Sync (its count is atomic). When you write `tokio::spawn(async { ... })`, the future must be `Send + 'static` because the runtime may move it between worker threads at any .await point. Types that are alive across .await points become part of the future's state and must satisfy these bounds. Understanding this is the key to deciphering the otherwise cryptic error messages that arise from non-Send types in async code.

**The async runtime is cooperatively scheduled.** Unlike OS threads, async tasks yield control voluntarily at .await points. Between .await points, a task has exclusive use of its worker thread. This means CPU-intensive work that does not yield will starve every other task on that thread. It also means that std::sync::Mutex -- which blocks the OS thread -- will block the worker thread and potentially deadlock the runtime if the lock holder is suspended on the same worker. The solution is to use async-aware primitives (tokio::sync::Mutex) when locks must be held across .await, and spawn_blocking for CPU-bound work.

**Channels encode protocols in the type system.** Arc<Mutex<T>> gives every holder unrestricted read-write access with no indication of the intended data flow. Channels (mpsc, oneshot, broadcast, watch) make the communication pattern explicit: who sends, who receives, how many messages, whether it is one-shot or streaming. This makes the concurrent architecture legible to readers and allows the compiler to enforce protocol violations (sending on a closed channel, receiving from a dropped sender).

## Consumer Guide

### When Reviewing Code

Scan for these patterns: std::sync::Mutex guards that are alive across .await points (look for `let guard = mutex.lock()` without a closing brace before the next `.await`). Arc<Mutex<T>> used where a channel would make the data flow explicit. tokio::spawn of CPU-intensive closures that do not use spawn_blocking. Rc or RefCell used in async code that will be spawned. Unbounded channels in production paths. Multiple mutexes acquired without a consistent ordering convention. async-trait macro on codebases targeting Rust 1.75+. Flag any fire-and-forget tokio::spawn where the JoinHandle is discarded -- errors from that task are silently lost.

### When Designing / Planning

Decide on communication patterns early. For request-response between tasks, use oneshot channels. For streaming data pipelines, use bounded mpsc channels with explicit capacity based on expected throughput. For shared configuration or state that is read far more often than written, use tokio::sync::watch or Arc<RwLock<T>>. Reserve Arc<Mutex<T>> for cases where the shared data structure requires random-access mutation and cannot be serialized through a channel. Document the lock ordering convention if multiple locks exist. Plan CPU-intensive work to run on spawn_blocking from the start -- retrofitting it later is a source of subtle regressions.

### When Implementing

Default to channels over shared state. Use bounded channels and choose capacity based on the expected burst size and acceptable latency. Drop std::sync::Mutex guards before .await -- use block scoping to make this visually obvious. Reach for tokio::sync::Mutex only when you genuinely need to hold a lock across an await point; it is slower than std::sync::Mutex for non-async use. Offload any computation that takes more than a few hundred microseconds to spawn_blocking. Use JoinSet to manage groups of spawned tasks -- it provides structured cancellation (all tasks cancelled on drop) and error propagation. Prefer native async fn in traits over the async-trait crate on Rust 1.75+.

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [NoMutexAcrossAwait](../../Rules/Rust/NoMutexAcrossAwait.md) | CRITICAL | Never hold a std::sync::Mutex guard across an .await point |
| [MessagePassingOverSharedState](../../Rules/Rust/MessagePassingOverSharedState.md) | HIGH | Prefer channels over Arc<Mutex<T>> to make data flow explicit |
| [SpawnBlockingForCpuWork](../../Rules/Rust/SpawnBlockingForCpuWork.md) | CRITICAL | Offload CPU-intensive work to spawn_blocking to avoid starving the async runtime |
| [SendSyncAwareness](../../Rules/Rust/SendSyncAwareness.md) | HIGH | Ensure types across .await points are Send + 'static for spawned tasks |
| [StructuredConcurrency](../../Rules/Rust/StructuredConcurrency.md) | HIGH | Use JoinSet, select!, or FuturesUnordered instead of fire-and-forget spawns |
| [ChannelCapacityBounds](../../Rules/Rust/ChannelCapacityBounds.md) | HIGH | Always use bounded channels in production to enforce back-pressure |
| [AsyncTraitConsiderations](../../Rules/Rust/AsyncTraitConsiderations.md) | MEDIUM | Prefer native async fn in traits (1.75+) over the async-trait crate |
| [DeadlockPrevention](../../Rules/Rust/DeadlockPrevention.md) | HIGH | Establish consistent lock ordering and prefer RwLock for read-heavy workloads |

## Rule Interactions

**NoMutexAcrossAwait + SendSyncAwareness**: These rules address complementary aspects of the same problem. NoMutexAcrossAwait prevents runtime deadlocks from blocking the worker thread; SendSyncAwareness prevents compile-time errors from non-Send types in futures. Together they guide developers toward the correct synchronization primitive: tokio::sync::Mutex when a lock must span .await, std::sync::Mutex (scoped) for synchronous critical sections, and Arc for shared ownership.

**MessagePassingOverSharedState + ChannelCapacityBounds**: Adopting channels without bounding them trades one failure mode (deadlock) for another (OOM). These rules form a pair: first choose channels over shared state, then choose bounded channels with explicit capacity.

**SpawnBlockingForCpuWork + StructuredConcurrency**: spawn_blocking returns a JoinHandle that must be awaited to retrieve the result and detect panics. StructuredConcurrency ensures these handles are not discarded. Using JoinSet with spawn_blocking tasks provides structured lifecycle management for CPU-offloaded work.

**DeadlockPrevention + NoMutexAcrossAwait**: Deadlock prevention through lock ordering applies to both sync and async contexts. In async code, the additional constraint from NoMutexAcrossAwait means that even correctly-ordered std::sync::Mutex locks can deadlock the runtime if held across .await. Both rules must be satisfied simultaneously.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **std::sync::Mutex guard held across .await**: Blocks the tokio worker thread, potentially deadlocking the entire runtime when the lock holder is parked on the same thread as the task waiting for the lock.
- **CPU-intensive loop in an async fn without spawn_blocking**: Starves all tasks on the same worker thread. Under load, cascades into timeout failures and apparent service hangs.

### HIGH

- **Arc<Mutex<T>> as the default sharing mechanism**: Scatters synchronization logic across the codebase, makes data-flow direction invisible, and introduces lock contention. Channels are almost always a better choice.
- **Unbounded channels in production code**: Converts back-pressure failures into silent memory growth that ends with an OOM kill. The process gives no warning before termination.
- **Fire-and-forget tokio::spawn**: Discarding the JoinHandle means panics and errors in the spawned task are silently lost. The parent task has no way to detect or recover from child failures.
- **Inconsistent lock ordering across multiple mutexes**: Creates deadlocks that only manifest under specific thread scheduling, making them nearly impossible to reproduce in testing.

### MEDIUM

- **Using async-trait crate on Rust 1.75+**: Adds unnecessary heap allocation per call and erases concrete future types, degrading both performance and compiler diagnostics.
- **Rc/RefCell in code that may later be spawned**: Works initially in synchronous or single-threaded contexts but causes confusing Send errors when the code is moved into an async task.

## Examples

**Choosing the right synchronization primitive:**

```rust
// SITUATION: Multiple tasks need to read a configuration, one task updates it occasionally
// BAD: Arc<Mutex<Config>> -- every reader blocks on the writer
// GOOD: tokio::sync::watch channel
use tokio::sync::watch;

let (tx, rx) = watch::channel(Config::load()?);

// Readers: cheap, non-blocking, always see the latest value
let config = rx.borrow().clone();

// Writer: sends new config, all readers see it on next borrow
tx.send(new_config)?;
```

**Structured concurrency with cancellation:**

```rust
use tokio::task::JoinSet;
use tokio::time::{timeout, Duration};

async fn fetch_all(urls: Vec<String>) -> Vec<Response> {
    let mut set = JoinSet::new();
    for url in urls {
        set.spawn(async move { reqwest::get(&url).await });
    }

    let mut responses = Vec::new();
    // Timeout the entire batch -- JoinSet::drop cancels remaining tasks
    let result = timeout(Duration::from_secs(30), async {
        while let Some(res) = set.join_next().await {
            if let Ok(Ok(response)) = res {
                responses.push(response);
            }
        }
    }).await;

    if result.is_err() {
        eprintln!("Batch timed out, returning partial results");
    }
    responses
    // JoinSet dropped here -- any still-running tasks are cancelled
}
```

## Does Not Cover

- **Atomic operations and lock-free data structures** -- low-level concurrency primitives (AtomicU64, crossbeam) are a separate domain requiring memory-ordering expertise.
- **Async runtime selection** (tokio vs async-std vs smol) -- this dimension assumes tokio but the principles apply broadly.
- **Distributed concurrency** (consensus, distributed locks) -- this dimension covers single-process concurrency only.
- **Signal handling and graceful shutdown** -- related to cancellation but involves OS-level concerns beyond concurrency primitives.

## See Also

- **RS9 (Advanced Type System)**: Pin<&mut Self> is fundamental to how async futures are represented in memory. Understanding Pin is necessary when implementing custom futures or working with self-referential async state machines.

## Sources

- Tokio documentation: Shared State, Channels, Select, Bridging with Sync Code
- Effective Rust by David Drysdale, Item 17: Prefer channels over shared state
- The Rust Programming Language, Chapter 16: Fearless Concurrency
- Rust Blog: async fn in traits (stabilized in 1.75)
- Tokio API documentation: JoinSet, sync::Mutex, sync::RwLock, sync::mpsc
