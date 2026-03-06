# GenerateShoppingList Workflow

> **Trigger:** "generate shopping list", "grocery list", "shopping list from meal plan", "what do I need to buy"

## Reference Material

- None.

## Purpose

Generate a consolidated shopping list from a meal plan (a set of recipes with serving counts). Combines duplicate ingredients, converts units for consistency, and organizes the final list by grocery store category for efficient shopping.

## Workflow Steps

### Step 1: Collect Meal Plan

Ask the user for their meal plan. Accept any of these formats:
- A list of recipe names with optional serving multipliers ("Chicken Tikka Masala x2, Caesar Salad x4")
- A day-by-day plan ("Monday: pasta, Tuesday: stir fry")
- A reference to saved meal plans

Look up each recipe in the collection. If a recipe is not found, ask the user to clarify or provide it.

### Step 2: Scale Ingredients

For each recipe in the meal plan:
1. Retrieve the full ingredient list
2. Multiply quantities by the serving multiplier (default: 1x the recipe's base servings)
3. Maintain the normalized ingredient structure (quantity, unit, item)

### Step 3: Consolidate Ingredients

Merge ingredients across all recipes:
1. Group by ingredient name (case-insensitive match)
2. Convert units to compatible forms before summing (e.g., 3 tsp + 1 tbsp = 2 tbsp)
3. Sum quantities for identical ingredient + unit combinations
4. Keep preparation notes separate (they don't affect shopping)

### Step 4: Categorize

Assign each ingredient to a grocery category:

| Category | Examples |
|----------|----------|
| Produce | fruits, vegetables, fresh herbs |
| Meat & Seafood | chicken, beef, fish, shrimp |
| Dairy & Eggs | milk, cheese, butter, eggs |
| Pantry | rice, pasta, canned goods, oils |
| Spices & Seasonings | salt, pepper, cumin, paprika |
| Bakery | bread, tortillas, buns |
| Frozen | frozen vegetables, ice cream |
| Other | anything that doesn't fit above |

### Step 5: Output Shopping List

Present the final list organized by category:

```
## Shopping List — [Meal Plan Name/Date Range]

### Produce
- [ ] 4 large tomatoes
- [ ] 2 bunch cilantro
- [ ] 1 lb spinach

### Meat & Seafood
- [ ] 3 lb chicken breast

### Dairy & Eggs
- [ ] 2 cup heavy cream
- [ ] 12 large eggs

[...additional categories...]

---
Recipes included: [list of recipe names]
Total items: [N]
```

Use checkbox format for easy use as a shopping checklist.
