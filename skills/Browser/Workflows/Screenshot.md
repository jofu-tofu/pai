# Screenshot Workflow

Take a screenshot of a URL.

## Steps

1. **Launch browser**
   ```typescript
   import { PlaywrightBrowser } from '../index.ts'
   const browser = new PlaywrightBrowser()
   await browser.launch({ headless: false })  // Visible by default
   ```

2. **Navigate to URL**
   ```typescript
   await browser.navigate(url)
   ```

3. **Take screenshot**
   ```typescript
   import { tmpdir } from 'os'
   import { join } from 'path'

   await browser.screenshot({
     path: join(tmpdir(), 'screenshot.png'),
     fullPage: false  // true for full page
   })
   ```

4. **Close browser**
   ```typescript
   await browser.close()
   ```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `path` | - | Output file path |
| `fullPage` | false | Capture full scrollable page |
| `selector` | - | Capture specific element |
| `type` | 'png' | 'png' or 'jpeg' |
| `quality` | - | JPEG quality (0-100) |

## Example: Element Screenshot

```typescript
await browser.screenshot({
  selector: '.hero-section',
  path: join(tmpdir(), 'hero.png')
})
```

## Example: Mobile Screenshot

```typescript
await browser.launch()
await browser.setDevice('iPhone 14')
await browser.navigate(url)
await browser.screenshot({ path: join(tmpdir(), 'mobile.png') })
```
