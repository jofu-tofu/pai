### SV5.1 Lazy-Load Heavy Components with Dynamic Imports

**Impact: HIGH (reduces initial bundle size for rarely-shown UI)**

Use dynamic imports to lazy-load heavy components (modals, charts, rich text editors) that aren't needed for initial render.

**Incorrect: top-level import — loaded even if never shown**

```svelte
<script lang="ts">
  import Chart from './Chart.svelte';

  let showChart = $state(false);
</script>

<button onclick={() => showChart = true}>Show Chart</button>
{#if showChart}
  <Chart data={chartData} />
{/if}
```

**Correct: dynamic import on demand**

```svelte
<script lang="ts">
  let showChart = $state(false);
  let Chart: typeof import('./Chart.svelte').default | null = $state(null);

  async function loadChart() {
    Chart = (await import('./Chart.svelte')).default;
    showChart = true;
  }
</script>

<button onclick={loadChart}>Show Chart</button>
{#if showChart && Chart}
  <Chart data={chartData} />
{/if}
```
