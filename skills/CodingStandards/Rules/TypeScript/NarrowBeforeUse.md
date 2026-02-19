### 2.2 Narrow Before Use

**Impact: CRITICAL (Type assertions lie to the compiler — type guards prove correctness)**

Type assertions (`as`) tell the compiler "trust me" without evidence. Type guards (`typeof`, `in`, `instanceof`, custom predicates) prove the type through runtime checks that the compiler can verify. Assertions hide bugs; narrowing catches them.

**Incorrect: Type assertions bypass safety**

```typescript
interface AdminUser {
  role: "admin";
  permissions: string[];
}

function getPermissions(user: unknown): string[] {
  const admin = user as AdminUser;     // no runtime check
  return admin.permissions;            // crashes if user isn't AdminUser
}

// Even with known types, 'as' is dangerous
const input = document.getElementById("email") as HTMLInputElement;
input.value = "test";  // crashes if element is null or not an input
```

**Correct: Type guards prove the type**

```typescript
function isAdminUser(user: unknown): user is AdminUser {
  return (
    typeof user === "object" &&
    user !== null &&
    "role" in user &&
    (user as { role: unknown }).role === "admin"
  );
}

function getPermissions(user: unknown): string[] {
  if (!isAdminUser(user)) {
    throw new Error("Expected admin user");
  }
  return user.permissions;  // TypeScript knows this is AdminUser
}

// Narrow DOM elements properly
const input = document.getElementById("email");
if (input instanceof HTMLInputElement) {
  input.value = "test";  // safe — proven to be HTMLInputElement
}
```

**When acceptable:**
- `as const` for literal type assertions — this is safe and encouraged
- After Zod `.parse()` which performs runtime validation (see Rule 8.1)
- Double assertion `as unknown as T` in test factories where you intentionally create partial mocks
