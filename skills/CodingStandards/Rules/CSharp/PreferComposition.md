### CS1.3 Prefer Composition Over Inheritance

**Impact: CRITICAL (Inheritance creates fragile hierarchies)**

Inheritance creates tight coupling between base and derived classes. Changes to base classes ripple through all descendants, and deep hierarchies become difficult to understand and modify.

**Incorrect: Inheritance hierarchy**

```csharp
public class Animal
{
    public virtual void Move() { /* default movement */ }
    public virtual void Eat() { /* default eating */ }
}

public class Bird : Animal
{
    public override void Move() { /* fly */ }
    public virtual void Sing() { /* tweet */ }
}

public class Penguin : Bird
{
    // Problem: Penguins can't fly but inherit from Bird
    public override void Move() { /* walk - violates Liskov */ }
    public override void Sing() { /* ... */ }
}

// Fragile: Adding MigrateSouth() to Bird breaks Penguin
```

**Correct: Composition with behaviors**

```csharp
public interface IMovementBehavior
{
    void Move();
}

public interface IFeedingBehavior
{
    void Eat();
}

public class FlyingBehavior : IMovementBehavior
{
    public void Move() { /* fly */ }
}

public class WalkingBehavior : IMovementBehavior
{
    public void Move() { /* walk */ }
}

public class Animal
{
    private readonly IMovementBehavior _movement;
    private readonly IFeedingBehavior _feeding;

    public Animal(IMovementBehavior movement, IFeedingBehavior feeding)
    {
        _movement = movement;
        _feeding = feeding;
    }

    public void Move() => _movement.Move();
    public void Eat() => _feeding.Eat();
}

// Penguin gets walking behavior without inheriting flying
var penguin = new Animal(new WalkingBehavior(), new FishEatingBehavior());
var eagle = new Animal(new FlyingBehavior(), new MeatEatingBehavior());
```

**When inheritance is appropriate:**
- True "is-a" relationships with stable base classes
- Framework requirements (Controller, DbContext)
- Sealed classes that won't be extended further
