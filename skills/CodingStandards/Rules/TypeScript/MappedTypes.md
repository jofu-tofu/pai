### TS2.6 Mapped Types for Custom Transformations

**Impact: MEDIUM (When built-in utilities don't fit, mapped types transform types programmatically — DRY at the type level)**

Mapped types iterate over keys and transform each property. They're the `Array.map()` of the type system. Use them when `Partial`, `Pick`, etc. don't express the transformation you need.

**Incorrect: Manual per-property transformations**

```typescript
interface ApiResponse {
  users: User[];
  posts: Post[];
  comments: Comment[];
}

// Manually wrapping each property — breaks when ApiResponse changes
interface AsyncApiResponse {
  users: Promise<User[]>;
  posts: Promise<Post[]>;
  comments: Promise<Comment[]>;
}

// Manually creating nullable versions
interface NullableApiResponse {
  users: User[] | null;
  posts: Post[] | null;
  comments: Comment[] | null;
}
```

**Correct: Mapped types derive transformations**

```typescript
interface ApiResponse {
  users: User[];
  posts: Post[];
  comments: Comment[];
}

// Generic mapped type — reusable across any interface
type Promisified<T> = {
  [K in keyof T]: Promise<T[K]>;
};

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type AsyncApiResponse = Promisified<ApiResponse>;
type NullableApiResponse = Nullable<ApiResponse>;

// Conditional mapped type — transform only array properties
type ArraysToSets<T> = {
  [K in keyof T]: T[K] extends Array<infer U> ? Set<U> : T[K];
};
```

**When acceptable:**
- Prefer built-in utilities (Rule 5.1) when they fit — `Partial`, `Required`, `Readonly` are mapped types already
- Avoid deeply nested conditional mapped types — if the type is harder to read than the manual version, use the manual version
