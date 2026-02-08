### 5.1 Prefer Built-in Utility Types

**Impact: MEDIUM (Reduces type duplication — built-in utilities are well-tested, well-documented, and universally understood)**

TypeScript ships with utility types (`Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`, `Extract`, `Exclude`) that transform existing types. Reimplementing these manually creates drift, bugs, and cognitive overhead.

**Incorrect: Manual type transformations**

```typescript
// Manually making fields optional — drifts when User changes
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface UserUpdate {
  id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "user";
}

// Manual subset — must be updated when User changes
interface UserSummary {
  id: string;
  name: string;
}
```

**Correct: Derive types from the source**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

type UserUpdate = Partial<User>;
type UserSummary = Pick<User, "id" | "name">;
type UserWithoutEmail = Omit<User, "email">;
type ReadonlyUser = Readonly<User>;
type UserLookup = Record<string, User>;

// Compose utilities for complex transformations
type CreateUserInput = Omit<User, "id"> & { password: string };
type AdminUser = Extract<User["role"], "admin">;
```

**When acceptable:**
- When you need a named type for documentation: `type UserId = string` is clearer than using `string` everywhere, even though it's not a utility
- Custom mapped types when built-in utilities don't cover the transformation (see Rule 5.2)
