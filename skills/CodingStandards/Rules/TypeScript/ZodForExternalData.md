### 8.1 Zod for External Data Validation

**Impact: HIGH (Type assertions on external data are lies — Zod validates at runtime and infers types, closing the compile-time/runtime gap)**

Data from APIs, user input, environment variables, and JSON files has no type at runtime. A type assertion (`as User`) tells the compiler "trust me" but performs zero validation. Zod schemas validate the actual data structure and infer the TypeScript type, giving you both runtime safety and compile-time types from a single source.

**Incorrect: Type assertions on unvalidated data**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data = await res.json();
  return data as User;  // DANGEROUS: no runtime validation
}

// If API returns { id: 123, nm: "Alice" } — no error, silent corruption
const user = await fetchUser("1");
console.log(user.name.toUpperCase());  // runtime crash: undefined.toUpperCase()
```

**Correct: Zod schema as single source of truth**

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive(),
});

type User = z.infer<typeof UserSchema>;  // type derived from schema

async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data = await res.json();
  return UserSchema.parse(data);  // throws ZodError with details on mismatch
}

// For non-throwing validation
const result = UserSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);  // structured error details
  return;
}
const user = result.data;  // typed as User
```

**When acceptable:**
- Internal data passed between trusted functions in the same process — validation at system boundaries is sufficient
- Performance-critical hot paths where Zod's overhead matters — but profile first, don't assume
