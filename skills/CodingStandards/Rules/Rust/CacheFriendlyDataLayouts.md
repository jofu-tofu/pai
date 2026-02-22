### RS4.5 CacheFriendlyDataLayouts

**Impact: MEDIUM (Struct-of-Arrays layout keeps hot fields contiguous in memory, reducing cache misses in tight loops by an order of magnitude)**

Modern CPUs fetch memory in cache lines (typically 64 bytes). When you iterate over a Vec of structs (AoS) but only touch one field, every cache line loads the other fields as wasted bytes. Splitting into separate Vecs per field (SoA) ensures the hot data is packed contiguously, maximizing cache utilization. This matters most in tight loops over thousands of elements.

**Incorrect: Array-of-Structs wastes cache on cold fields**

```rust
struct Particle {
    position: [f64; 3], // 24 bytes -- hot in physics step
    velocity: [f64; 3], // 24 bytes -- hot in physics step
    color: [u8; 4],     // 4 bytes  -- cold in physics step
    name: String,        // 24 bytes -- cold in physics step
}

fn update_positions(particles: &mut Vec<Particle>, dt: f64) {
    // Each cache line loads color and name alongside position/velocity
    for p in particles.iter_mut() {
        p.position[0] += p.velocity[0] * dt;
        p.position[1] += p.velocity[1] * dt;
        p.position[2] += p.velocity[2] * dt;
    }
}
```

**Correct: Struct-of-Arrays keeps hot data contiguous**

```rust
struct Particles {
    positions: Vec<[f64; 3]>,  // contiguous in memory
    velocities: Vec<[f64; 3]>, // contiguous in memory
    colors: Vec<[u8; 4]>,      // separate, not loaded during physics
    names: Vec<String>,         // separate, not loaded during physics
}

fn update_positions(particles: &mut Particles, dt: f64) {
    // Only positions and velocities are in cache -- no waste
    for (pos, vel) in particles.positions.iter_mut()
        .zip(particles.velocities.iter())
    {
        pos[0] += vel[0] * dt;
        pos[1] += vel[1] * dt;
        pos[2] += vel[2] * dt;
    }
}
```

**When acceptable:**
- Small collections (fewer than ~100 elements) where cache behavior is irrelevant
- All fields are accessed together in every operation, making AoS and SoA equivalent
- Code clarity is more important than performance (configuration structs, domain models not in hot loops)
