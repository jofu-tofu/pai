### 7.3 Use Event Delegation for Large Lists

**Impact: HIGH (reduces memory usage from N listeners to 1)**

For large lists, use a single event listener on the parent element instead of attaching listeners to each item. Read the target item from data attributes.

**Incorrect: one listener per item — N listeners**

```svelte
<ul>
  {#each items as item}
    <li onclick={() => selectItem(item.id)}>
      {item.name}
    </li>
  {/each}
</ul>
```

**Correct: single delegated listener — 1 listener**

```svelte
<script lang="ts">
  function handleListClick(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest('[data-item-id]');
    if (target) {
      const id = target.getAttribute('data-item-id')!;
      selectItem(id);
    }
  }
</script>

<ul onclick={handleListClick}>
  {#each items as item}
    <li data-item-id={item.id}>
      {item.name}
    </li>
  {/each}
</ul>
```
