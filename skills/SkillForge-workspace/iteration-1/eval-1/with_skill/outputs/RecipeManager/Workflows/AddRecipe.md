# AddRecipe Workflow

> **Trigger:** "add recipe", "new recipe", "save recipe", "create recipe"

## Reference Material

- None.

## Purpose

Capture a new recipe from the user and store it in a structured format within the recipe collection. Ensures consistent formatting, required fields, and proper tagging for searchability.

## Workflow Steps

### Step 1: Collect Recipe Details

Gather the following from the user (ask for any missing information):

| Field | Required | Description |
|-------|----------|-------------|
| Name | Yes | Recipe title |
| Ingredients | Yes | List with quantities and units |
| Instructions | Yes | Numbered preparation steps |
| Servings | Yes | Number of servings produced |
| Prep Time | No | Time to prepare ingredients |
| Cook Time | No | Active cooking time |
| Tags | No | Categories (e.g., "dinner", "vegetarian", "quick") |
| Source | No | Where the recipe came from (URL, cookbook, etc.) |
| Notes | No | Additional tips or variations |

### Step 2: Normalize Ingredients

For each ingredient, structure as:
- **Quantity:** numeric amount (use decimals, not fractions)
- **Unit:** standardized unit (tsp, tbsp, cup, oz, lb, g, kg, ml, L, piece, clove, bunch)
- **Item:** ingredient name in lowercase
- **Preparation:** optional (e.g., "diced", "minced", "melted")

### Step 3: Format and Store

Create a structured recipe file using this template:

```markdown
# [Recipe Name]

**Servings:** [N] | **Prep:** [time] | **Cook:** [time]
**Tags:** [comma-separated tags]
**Source:** [source]

## Ingredients

- [quantity] [unit] [item], [preparation]

## Instructions

1. [Step]
2. [Step]

## Notes

[Any additional notes or variations]
```

Save to the recipe collection directory.

### Step 4: Confirm

Display a summary of the saved recipe including:
- Recipe name
- Number of ingredients
- Number of steps
- Tags assigned
