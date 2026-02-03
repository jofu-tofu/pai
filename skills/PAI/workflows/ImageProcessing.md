# Image Processing Workflow

Background removal, addition, and image optimization utilities.

## Key Tools

Two main tools available in `skills/PAI/Tools/`:

1. **RemoveBg.ts** - Uses remove.bg API for background elimination
2. **AddBg.ts** - Applies solid background colors via ImageMagick

## Basic Commands

### Remove Background

```bash
bun skills/PAI/Tools/RemoveBg.ts image.png output.png
```

Options:
- Single file processing
- Batch processing with glob patterns
- Preserves alpha channel

### Add Background

```bash
bun skills/PAI/Tools/AddBg.ts input.png "#FFFFFF" output.png
```

Supports any hex color code.

## Requirements

### RemoveBg.ts

Requires `REMOVEBG_API_KEY` environment variable.
- Get API key at remove.bg/api
- 50 free credits per month

### AddBg.ts

Requires ImageMagick installation:
```bash
# macOS
brew install imagemagick

# Windows
choco install imagemagick

# Linux
apt install imagemagick
```

## Common Use Cases

### Remove AI-Generated Backgrounds

```bash
bun RemoveBg.ts generated-art.png transparent-art.png
```

### Create Blog Headers

Use standard background color for branding:
```bash
bun AddBg.ts logo.png "#EAE9DF" header.png
```

### Batch Process Diagrams

```bash
bun RemoveBg.ts "diagrams/*.png" "output/"
```

### Dark Mode Backgrounds

```bash
bun AddBg.ts icon.png "#1a1a1a" icon-dark.png
```

## Integration with Other Workflows

### Art Generation Pipeline

1. Generate image with AI
2. Remove background if needed
3. Add branded background
4. Optimize for web

### Blog Post Pipeline

1. Create/source image
2. Process for transparency
3. Generate social preview
4. Optimize dimensions

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| API key missing | No REMOVEBG_API_KEY | Set environment variable |
| Credits exhausted | Monthly limit reached | Wait for reset or upgrade |
| ImageMagick not found | Not installed | Install via package manager |
| Invalid color | Bad hex format | Use format "#RRGGBB" |

## Related

- Art skill workflows
- Blogging skill image processing
- Social media preview generation
