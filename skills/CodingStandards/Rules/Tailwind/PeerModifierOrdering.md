### TW2.7 Peer Element Must Come Before Styled Siblings in DOM

**Impact: HIGH (peer modifiers silently fail if DOM order is wrong)**

The `peer` modifier only works on elements that come AFTER the peer in the DOM, because it uses the CSS `~` general sibling combinator. Place the triggering element (with `peer` class) before the element that reacts to it.

**Incorrect: styled element is BEFORE the peer — does nothing**

```html
<p class="peer-invalid:text-red-500">Error message</p>
<input class="peer" type="email" />
```

**Correct: peer comes FIRST, styled element comes AFTER**

```html
<input class="peer" type="email" />
<p class="hidden peer-invalid:block peer-invalid:text-red-500">
  Please enter a valid email
</p>
```
