# Data & Forms -- Svelte

> The data and forms dimension covers SvelteKit's data loading architecture and form handling -- how data flows from server to client, how mutations are submitted, and how server and client state remain cleanly separated.

## Mental Model

SvelteKit's data architecture is built on a fundamental separation: server-only code runs exclusively on the server (never shipped to the client), while universal code runs on both server and client. This separation is enforced by file naming conventions -- `+page.server.ts` and `+layout.server.ts` are server-only, while `+page.ts` and `+layout.ts` are universal. Understanding this boundary is the single most important concept for SvelteKit data handling, because it determines where secrets are safe, where database access is possible, and what code ends up in the client bundle.

Load functions are the primary data-fetching mechanism. They run before the page renders, providing data as props to the page component. The key design constraint is that load functions should be lean -- they should fetch and return data, not transform, filter, or compute derived values that could be done on the client. This keeps server response times low and lets the client handle presentation logic. When a page needs data from multiple independent sources, those fetches must run in parallel via `Promise.all` to avoid sequential waterfalls that multiply latency.

Form actions are SvelteKit's answer to data mutations. Rather than building custom API endpoints and wiring up fetch calls, form actions use the HTML `<form>` element with `method="POST"` and SvelteKit's `use:enhance` directive. This pattern provides progressive enhancement (forms work without JavaScript), automatic form state management (pending, success, error), and built-in CSRF protection. The server-side action handler receives the form data, validates it, performs the mutation, and returns a result that the page can react to.

The final principle is server/client state separation. Data returned from load functions (server state) should not be mixed with client-only state (UI state like modal open/closed, form input values, scroll position) in the same reactive structures. Mixing them creates confusion about what is authoritative (server data) versus transient (client state), and can cause hydration issues when server-rendered HTML conflicts with client-initialized state.

## Consumer Guide

### When Reviewing Code

Check that any load function accessing secrets, databases, or private APIs lives in a `+page.server.ts` or `+layout.server.ts` file, not a universal `+page.ts` file. Look for sequential `await` calls in load functions that could be parallelized with `Promise.all`. Verify that form mutations use SvelteKit form actions with `use:enhance` rather than manual `fetch` calls to API routes. Check that server-side validation exists for all form inputs -- client-side validation is a UX convenience, not a security measure. Examine whether load functions are doing heavy data transformation that could be deferred to the client. Look for patterns where server-loaded data is merged into `$state` objects alongside client-only UI state.

### When Designing / Planning

Map out which data each route needs and whether it requires server-only access (databases, secrets) or can be universal (public APIs). Identify data shared across multiple pages in a route group and plan to load it in `+layout.server.ts` to avoid duplication. Design form interactions around SvelteKit's action model: each mutation gets a named action, the form posts to it, and the action returns success/failure data. Plan validation as a server-side concern with client-side mirroring for UX. Establish clear boundaries between server-authoritative data (user profile, database records) and client-transient state (form drafts, UI toggles).

### When Implementing

Place all load functions that touch secrets or databases in `+page.server.ts`. Use `Promise.all` for independent data fetches within a single load function. For forms, define actions in `+page.server.ts` as an `actions` object with named handlers, and use `<form method="POST" action="?/actionName" use:enhance>` on the client. Validate all input server-side using a validation library (Zod, Valibot) or manual checks, returning `fail()` with error details for invalid input. Keep load functions lean -- return raw data and let components derive presentation values with `$derived`. Maintain separate reactive structures for server data (`data` prop from load) and client state (local `$state` variables).

## Rules in This Dimension

| Rule | Impact | Summary |
|------|--------|---------|
| [ServerLoadForSecrets](../../Rules/Svelte/ServerLoadForSecrets.md) | HIGH | Use +page.server.ts for load functions accessing secrets or databases |
| [ParallelLoading](../../Rules/Svelte/ParallelLoading.md) | HIGH | Fetch independent data in parallel with Promise.all in load functions |
| [FormActionsOverFetch](../../Rules/Svelte/FormActionsOverFetch.md) | HIGH | Use SvelteKit form actions with use:enhance instead of manual fetch |
| [ValidateServerSide](../../Rules/Svelte/ValidateServerSide.md) | HIGH | Always validate form data on the server, not just the client |
| [LeanLoadFunctions](../../Rules/Svelte/LeanLoadFunctions.md) | MEDIUM | Keep load functions focused on fetching; defer transformations to client |
| [SeparateServerClientState](../../Rules/Svelte/SeparateServerClientState.md) | HIGH | Keep server-loaded data and client UI state in separate reactive structures |

## Rule Interactions

- **ServerLoadForSecrets + EnvVarSafety (SV2)**: ServerLoadForSecrets ensures the load function is server-only; EnvVarSafety ensures the environment variables within it use `$env/static/private`. Together they form a complete secret-safety pattern.
- **ParallelLoading + LeanLoadFunctions**: Both optimize load function performance. Parallel loading eliminates fetch waterfalls; lean functions reduce the work done per request. Combined, they minimize time-to-first-byte.
- **FormActionsOverFetch + ValidateServerSide**: Form actions provide the transport; server validation provides the security. Every form action handler should validate its input before performing the mutation.
- **SeparateServerClientState + Reactivity rules (SV1)**: Server data comes from the `data` prop (provided by the load function), while client state uses `$state`. Keeping them separate means the reactive graph is clean -- `$derived` computations over server data re-run when the page navigates, and client `$state` resets appropriately.
- **LeanLoadFunctions + DerivedOverEffect (SV1)**: Data transformations deferred from the load function should use `$derived` in the component, not `$effect` writing to `$state`.

## Anti-Patterns (Severity Calibration)

### CRITICAL

- **Secrets in universal load**: Accessing database connections, API keys, or private environment variables in `+page.ts` instead of `+page.server.ts`. The entire module, including the secret, ships to the client bundle. This is a security vulnerability.
- **Client-only validation**: Validating form input only on the client with no server-side checks. Client validation is trivially bypassed -- any user with dev tools can submit arbitrary data directly to the action endpoint.

### HIGH

- **Sequential fetch waterfall**: Multiple independent `await fetch()` calls in sequence within a load function. Each fetch waits for the previous to complete, multiplying page load latency by the number of fetches. Use `Promise.all` for independent requests.
- **Manual fetch for mutations**: Using `fetch('/api/endpoint', { method: 'POST', ... })` for data mutations instead of SvelteKit form actions. This breaks progressive enhancement (no JS = no functionality), requires manual loading/error state management, and skips SvelteKit's built-in CSRF protection.
- **Mixed server/client state**: Merging server-loaded data into a single `$state` object alongside client UI state. When the page navigates and the load function returns fresh data, the merged object creates conflicts between stale client state and fresh server data.

### MEDIUM

- **Heavy load functions**: Performing data transformation, sorting, filtering, or formatting in the load function instead of returning raw data and letting the component handle presentation. This increases server response time and wastes server resources on work the client can do.
- **Missing use:enhance**: Using `<form method="POST">` without `use:enhance`. The form works but causes a full page reload on submission, losing client state and producing a jarring UX.

## Examples

**Parallel data loading with lean pattern:**

```typescript
// +page.server.ts
import { db } from '$lib/server/database';

export async function load({ params }) {
  const [post, comments, relatedPosts] = await Promise.all([
    db.post.findUnique({ where: { slug: params.slug } }),
    db.comment.findMany({ where: { postSlug: params.slug } }),
    db.post.findMany({ where: { category: params.category }, take: 5 }),
  ]);

  return { post, comments, relatedPosts };
}
```

```svelte
<!-- +page.svelte: derived values computed on client -->
<script lang="ts">
  let { data } = $props();
  let sortOrder = $state<'newest' | 'oldest'>('newest');

  let sortedComments = $derived(
    [...data.comments].sort((a, b) =>
      sortOrder === 'newest'
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt
    )
  );
</script>
```

**Form action with server validation:**

```typescript
// +page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const body = formData.get('body') as string;

    const errors: Record<string, string> = {};
    if (!title || title.length < 3) errors.title = 'Title must be at least 3 characters';
    if (!body || body.length < 10) errors.body = 'Body must be at least 10 characters';

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors, title, body });
    }

    await db.post.create({ data: { title, body } });
    return { success: true };
  },
} satisfies Actions;
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  let { form } = $props();
</script>

<form method="POST" action="?/create" use:enhance>
  <input name="title" value={form?.title ?? ''} />
  {#if form?.errors?.title}<span class="error">{form.errors.title}</span>{/if}

  <textarea name="body">{form?.body ?? ''}</textarea>
  {#if form?.errors?.body}<span class="error">{form.errors.body}</span>{/if}

  <button type="submit">Create Post</button>
</form>
```

**Separated server and client state:**

```svelte
<script lang="ts">
  // Server state: from load function, authoritative
  let { data } = $props();

  // Client state: UI-only, transient
  let isEditing = $state(false);
  let draftTitle = $state('');

  function startEdit() {
    draftTitle = data.post.title;  // Copy server value into client draft
    isEditing = true;
  }
</script>
```

## Does Not Cover

- **Reactive state management** ($state, $derived, $effect) -- see Reactivity dimension (SV1).
- **Component architecture** (props, snippets, context) -- see Architecture dimension (SV2).
- **TypeScript typing** for load functions and actions -- see TypeSystem dimension (SV3).
- **SSR safety** and hydration concerns -- see PerformanceSSR dimension (SV5).
- **Error handling** in load functions (error() helper) -- see PerformanceSSR dimension (SV5).

## Sources

- SvelteKit documentation: Loading Data, Form Actions, Modules
- SvelteKit documentation: $env modules
- Svelte 5 migration guide: data loading changes
- Joy of Code: SvelteKit form actions deep dive
- Cursor Directory: SvelteKit best practices
