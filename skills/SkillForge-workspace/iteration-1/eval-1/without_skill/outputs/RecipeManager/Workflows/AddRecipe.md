# Workflow: AddRecipe

Add a new recipe to the collection in structured YAML format with normalized ingredients.

## Input

- Recipe information from the user. Can be provided as:
  - Freeform text description ("I made chicken tikka masala with...")
  - A URL to fetch a recipe from
  - Structured data (ingredients list, steps, etc.)
  - Partial information that requires follow-up questions

## Output

- A new YAML file written to the recipes directory following `Standards/RecipeSchema.md`
- Confirmation message with recipe summary

## Steps

### Step 1: Gather Recipe Information

Collect all required fields defined in `Standards/RecipeSchema.md`:

- **name** -- Ask if not obvious from context
- **servings** -- Ask if not provided
- **prep_time_minutes** and **cook_time_minutes** -- Estimate if not provided, but tell the user the estimates
- **tags** -- Infer from cuisine, protein, meal type; confirm with user
- **source** -- Ask where the recipe came from (URL, cookbook, original)
- **ingredients** -- Full list with quantities and units
- **steps** -- Ordered cooking instructions
- **notes** -- Optional, ask if the user has any tips or substitutions

If the user provides a URL, fetch the recipe content and extract the structured data.

If the user provides partial information, ask follow-up questions for missing required fields. Group questions to minimize back-and-forth -- ask for all missing fields in one message rather than one at a time.

### Step 2: Normalize Ingredients

For each ingredient, apply the normalization rules from `Standards/DataStorage.md`:

1. Convert to singular form
2. Lowercase the item name
3. Remove brand names
4. Move qualifiers after the base name ("bell pepper, red")
5. Move preparation details to the `prep` field
6. Apply the synonym lookup table
7. Convert units to standard abbreviations
8. Assign a store category to each ingredient

Present the normalized ingredient list to the user for confirmation before writing. This catches normalization errors early.

### Step 3: Generate Slug and Check for Duplicates

1. Derive the slug from the recipe name (lowercase, hyphenated, no special characters)
2. Check if `{slug}.yaml` already exists in the recipes directory
3. If duplicate found:
   - Show existing recipe summary (name, servings, ingredient count)
   - Ask: overwrite, rename, or cancel
   - Do not proceed without explicit user choice

### Step 4: Validate Schema

Before writing, validate the complete recipe object:

1. All required fields present
2. `total_time_minutes` >= `prep_time_minutes` + `cook_time_minutes`
3. All ingredient units are from the allowed list
4. All ingredient categories are from the allowed list
5. At least one ingredient and one step exist
6. Tags include at least one cuisine and one meal-type tag

If validation fails, fix the issue (ask the user if the fix is ambiguous) and re-validate.

### Step 5: Write Recipe File

1. Write the YAML file to `recipes/{slug}.yaml`
2. Output confirmation:
   ```
   Recipe saved: {name}
   File: recipes/{slug}.yaml
   Servings: {servings}
   Ingredients: {count}
   Total time: {total_time_minutes} minutes
   Tags: {tags joined by comma}
   ```

## Error Handling

- **Missing recipe directory**: Create `recipes/` if it doesn't exist
- **Unparseable URL**: Tell the user the URL couldn't be read and ask them to provide the recipe details manually
- **Ambiguous units**: Ask the user to clarify (e.g., "oz" could be weight or fluid -- context usually disambiguates but ask if unclear)
- **Unknown ingredient**: If an ingredient doesn't match the synonym table and seems unusual, confirm spelling with the user
