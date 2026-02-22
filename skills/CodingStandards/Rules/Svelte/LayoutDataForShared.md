### SV2.7 Use Layout Load for Shared Data

**Impact: HIGH (eliminates duplicated data fetching across routes)**

Use `+layout.server.ts` for data shared across child routes (user session, theme, locale). This runs once and is inherited by all child pages.

**Incorrect: every page fetches user data**

```typescript
// routes/dashboard/+page.server.ts
export async function load({ locals }) {
  const user = await getUser(locals.userId);
  const dashData = await getDashboard();
  return { user, dashData };
}

// routes/settings/+page.server.ts
export async function load({ locals }) {
  const user = await getUser(locals.userId); // Duplicated!
  const settings = await getSettings();
  return { user, settings };
}
```

**Correct: layout loads shared data once**

```typescript
// routes/(app)/+layout.server.ts
export async function load({ locals }) {
  return { user: await getUser(locals.userId) };
}

// routes/(app)/dashboard/+page.server.ts
export async function load() {
  return { dashData: await getDashboard() };
  // user is inherited from layout
}
```
