### RS3.6 ChannelCapacityBounds

**Impact: HIGH (Unbounded channels convert back-pressure failures into OOM kills)**

An unbounded channel will accept messages as fast as the sender can produce them, regardless of how fast the receiver consumes them. If the producer outpaces the consumer -- due to a slow downstream service, a burst of traffic, or a bug -- the channel's internal buffer grows without limit until the process is killed by the OOM reaper. Bounded channels make back-pressure explicit: when the buffer is full, the sender's .send().await suspends, naturally throttling the producer to match the consumer's pace.

**Incorrect: Unbounded channel hides back-pressure**

```rust
use tokio::sync::mpsc;

async fn ingest_events(mut stream: EventStream) {
    // No limit -- if processing is slow, memory grows unbounded
    let (tx, mut rx) = mpsc::unbounded_channel::<Event>();

    tokio::spawn(async move {
        while let Some(event) = stream.next().await {
            // unbounded_send never blocks, never signals overload
            tx.send(event).unwrap();
        }
    });

    while let Some(event) = rx.recv().await {
        process_event(event).await; // if this is slow, queue grows forever
    }
}
```

**Correct: Bounded channel with explicit capacity**

```rust
use tokio::sync::mpsc;

async fn ingest_events(mut stream: EventStream) {
    // Bounded: sender suspends when buffer is full
    let (tx, mut rx) = mpsc::channel::<Event>(1024);

    tokio::spawn(async move {
        while let Some(event) = stream.next().await {
            // Awaits when buffer is full -- applies back-pressure
            if tx.send(event).await.is_err() {
                break; // receiver dropped, stop producing
            }
        }
    });

    while let Some(event) = rx.recv().await {
        process_event(event).await;
    }
}
```

**When acceptable:**
- Command channels with guaranteed-small message volumes (e.g., shutdown signals, configuration reloads)
- Test harnesses where simplicity matters more than memory safety
- Situations where the producer is strictly slower than the consumer by design and this invariant is documented
