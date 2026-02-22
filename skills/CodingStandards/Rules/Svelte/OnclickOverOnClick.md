### SV5.2 Use Svelte 5 Event Attribute Syntax

**Impact: MEDIUM (Svelte 5 standard — on:event directive is deprecated)**

Use lowercase event attributes (`onclick`, `onsubmit`) instead of Svelte 4's `on:click` directive syntax. The new syntax is standard HTML and aligns with Svelte 5's move toward HTML-native patterns.

**Incorrect: Svelte 4 directive syntax — deprecated**

```svelte
<button on:click={handleClick}>Click me</button>
<form on:submit|preventDefault={handleSubmit}>
  <input on:input={handleInput} />
</form>
```

**Correct: Svelte 5 event attribute syntax**

```svelte
<button onclick={handleClick}>Click me</button>
<form onsubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
  <input oninput={handleInput} />
</form>
```
