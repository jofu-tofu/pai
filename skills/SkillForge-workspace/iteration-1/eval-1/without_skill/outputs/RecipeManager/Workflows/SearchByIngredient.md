# Workflow: SearchByIngredient

Search the recipe collection for recipes that use specific ingredients.

## Input

- One or more ingredient names from the user
- Optional modifiers:
  - "only these ingredients" -- strict mode, recipes must not require ingredients beyond what's listed
  - "any of these" -- match recipes with at least one of the listed ingredients (default is all)

## Output

- Ranked list of matching recipes with match details
- For each match: recipe name, match count, matched ingredients, total ingredient count, cook time

## Steps

### Step 1: Parse Search Ingredients

Extract ingredient names from the user's request. Apply the same normalization rules as AddRecipe (singular, lowercase, qualifier-after-base, synonym lookup) so search terms match stored data.

Examples:
- "chickpeas and spinach" -> ["chickpea", "spinach"]
- "any kind of cheese" -> ["cheese"] (will use partial matching)
- "chicken thighs, rice, and soy sauce" -> ["chicken thigh", "rice", "soy sauce"]

Determine search mode:
- **ALL mode** (default): Recipe must contain all listed ingredients
- **ANY mode**: Recipe must contain at least one listed ingredient
- **STRICT mode**: Recipe must contain only the listed ingredients (plus pantry staples)

### Step 2: Scan Recipe Files

1. Glob for all `*.yaml` files in the recipes directory
2. Parse each file and extract the `ingredients` list
3. For each recipe, check each search term against each ingredient's `item` field

### Step 3: Match Ingredients

Matching uses three tiers, checked in order:

1. **Exact match**: search term equals ingredient item ("chicken thigh" matches "chicken thigh")
2. **Substring match**: search term is contained within ingredient item ("cheese" matches "cheddar cheese", "cream cheese", "parmesan cheese")
3. **Base-word match**: the base word of the search term matches the base word of the ingredient ("chicken" matches "chicken thigh", "chicken breast", "chicken stock")

A recipe's match score is the number of search terms that matched (at any tier). Exact matches are weighted higher in ranking.

### Step 4: Rank Results

Sort matching recipes by:

1. **Match count** (descending) -- recipes matching more search terms rank higher
2. **Match quality** (descending) -- exact matches rank higher than substring matches
3. **Ingredient ratio** -- recipes where matched ingredients are a larger fraction of total ingredients rank higher (a 5-ingredient recipe matching 3 terms ranks higher than a 20-ingredient recipe matching 3 terms)
4. **Total time** (ascending) -- tie-breaker: faster recipes rank higher

### Step 5: Present Results

Format output as a ranked list:

```
Found {N} recipes matching {search terms}:

1. **Chicken Tikka Masala** (3/3 ingredients matched, 12 total ingredients, 55 min)
   Matched: chicken thigh, plain yogurt, garam masala

2. **Butter Chicken** (2/3 ingredients matched, 15 total ingredients, 60 min)
   Matched: chicken thigh, plain yogurt
   Missing: garam masala

3. **Chicken Fried Rice** (1/3 ingredients matched, 8 total ingredients, 25 min)
   Matched: chicken thigh
   Missing: plain yogurt, garam masala
```

If no recipes match, suggest:
- Check spelling of search terms
- Try broader terms (e.g., "chicken" instead of "chicken thigh")
- Try ANY mode if using ALL mode

### Step 6: Offer Follow-Up Actions

After presenting results, offer:
- "View full recipe for any of these?"
- "Search with different ingredients?"
- "Generate a shopping list for any of these?"

## Pantry Staples (for STRICT mode)

In STRICT mode, these ingredients are not counted against the "only these ingredients" constraint, since most kitchens have them on hand:

- salt
- black pepper
- olive oil
- vegetable oil
- water
- butter
- garlic
- onion
- sugar
- flour
- egg

## Error Handling

- **No recipes directory**: Tell the user no recipe collection was found and suggest adding recipes first
- **Empty collection**: Tell the user the collection is empty
- **No matches**: Suggest broadening the search (see Step 5)
- **Malformed recipe file**: Skip the file, note it in output ("Skipped 1 malformed file: {filename}")
