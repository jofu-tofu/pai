# Workflow: GenerateShoppingList

Generate a consolidated shopping list from a meal plan (one or more recipes).

## Input

- A list of recipes to include. Can be provided as:
  - Recipe names: "chicken tikka masala, pasta primavera, black bean tacos"
  - A meal plan: "Monday: tikka masala, Wednesday: pasta, Friday: tacos"
  - Serving adjustments: "tikka masala for 6" (default recipe is for 4, so scale 1.5x)
  - Recipe file paths directly

## Output

- Consolidated shopping list grouped by store section (category)
- Quantities aggregated across all recipes
- Per-recipe breakdown available on request

## Steps

### Step 1: Resolve Recipes

For each recipe name in the input:

1. Search for a matching file in the recipes directory by slug or name
2. If exact match found, use it
3. If no exact match, try fuzzy matching (Levenshtein distance, substring) and present candidates to the user for confirmation
4. If no match at all, ask the user if they want to add the recipe first (invoke AddRecipe workflow) or skip it

Parse any serving adjustments:
- "tikka masala for 6" with a recipe that serves 4 -> scale factor 1.5
- "double the pasta" -> scale factor 2.0
- No adjustment -> scale factor 1.0

### Step 2: Extract and Scale Ingredients

For each resolved recipe:

1. Read the YAML file
2. Extract all ingredients
3. Apply the serving scale factor to each ingredient's quantity
4. Tag each ingredient with its source recipe (for the per-recipe breakdown)

### Step 3: Aggregate Ingredients

Combine ingredients across all recipes:

1. Group by normalized `item` name (exact match only -- normalization at write time ensures consistency)
2. Within each group, combine quantities if units are the same: `0.5 cup + 0.75 cup = 1.25 cup`
3. If units differ but are convertible (e.g., `tbsp` and `cup`), convert to the larger unit and combine
4. If units differ and are not convertible (e.g., `clove` and `tsp`), keep as separate line items under the same ingredient name

### Unit Conversion Table (for aggregation)

| From | To | Factor |
|---|---|---|
| 3 tsp | 1 tbsp | |
| 16 tbsp | 1 cup | |
| 2 cup | 1 pint | |
| 2 pint | 1 quart | |
| 4 quart | 1 gallon | |
| 8 fl_oz | 1 cup | |
| 16 oz | 1 lb | |
| 1000 g | 1 kg | |
| 1000 ml | 1 l | |

Convert to the larger unit only when the result is a clean number (e.g., 48 tsp -> 1 cup, but 7 tsp stays as 7 tsp or converts to 2 tbsp + 1 tsp). Use judgment: the goal is a list the shopper can actually use at the store.

### Step 4: Group by Store Section

Organize the aggregated list by ingredient category:

1. **Produce** -- vegetables, fruits, fresh herbs
2. **Protein** -- meat, poultry, fish, tofu
3. **Dairy** -- milk, cheese, yogurt, butter
4. **Grain** -- rice, pasta, bread, flour
5. **Canned** -- canned goods
6. **Spice** -- dried spices, seasonings
7. **Condiment** -- sauces, oils, vinegars
8. **Frozen** -- frozen items
9. **Baking** -- sugar, baking powder, vanilla
10. **Other** -- anything uncategorized

Within each section, sort items alphabetically.

### Step 5: Identify Pantry Staples

Mark common pantry staples that the user likely already has:

- salt, black pepper, olive oil, vegetable oil, butter, sugar, flour, garlic, onion

Present these in a separate "Check Pantry" section rather than the main shopping list. The user can mentally check these off rather than buying them every time.

### Step 6: Present Shopping List

Format the output:

```
Shopping List for {N} meals ({total servings} total servings)
Recipes: {recipe names}

PRODUCE
- bell pepper, red: 3 whole
- cilantro: 2 bunch
- onion, yellow: 4 whole *[pantry]*
- spinach: 6 cup

PROTEIN
- chicken thigh: 3 lb
- ground beef: 1.5 lb

DAIRY
- cheddar cheese: 2 cup (shredded)
- plain yogurt: 1 cup
- sour cream: 0.5 cup

...

CHECK PANTRY (you probably have these)
- butter: 4 tbsp
- garlic: 8 clove
- olive oil: 3 tbsp
- salt: to taste
```

### Step 7: Offer Follow-Up Actions

- "Want a per-recipe breakdown?" -- shows which recipe each ingredient comes from
- "Adjust servings for any recipe?"
- "Remove a recipe from the plan?"
- "Save this meal plan for reuse?" (future feature)

## Error Handling

- **Recipe not found**: Offer fuzzy matches or suggest adding the recipe (see Step 1)
- **Conflicting units that can't be converted**: Keep as separate line items, note the conflict
- **Zero-quantity items** (`to_taste`): List without quantity, just the item name
- **Missing recipe directory**: Tell the user no recipe collection was found
