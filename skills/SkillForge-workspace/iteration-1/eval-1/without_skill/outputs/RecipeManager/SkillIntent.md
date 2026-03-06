# SkillIntent: RecipeManager

## Purpose

A personal recipe management system that treats recipes as structured data rather than freeform text. The skill exists because recipe management has a consistency problem: people store recipes in notes apps, bookmarks, screenshots, and memory -- each in a different format, unsearchable, and impossible to aggregate. When you want to answer "what can I make with what I have?" or "what do I need to buy for this week's meals?", you're stuck manually scanning through unstructured sources.

RecipeManager solves this by enforcing a single structured format (YAML) with normalized ingredients, making three operations reliable:
1. **Add** -- capture a recipe in structured form, normalizing ingredients on the way in
2. **Search** -- find recipes by ingredient with partial and fuzzy matching
3. **Aggregate** -- combine ingredients across multiple recipes into a deduplicated shopping list with unit conversion

## Design Philosophy

### Structured Data Over Freeform Text

Recipes stored as prose are human-readable but machine-opaque. You can't programmatically answer "how much butter do I need this week?" from a collection of paragraph-format recipes. YAML gives both: human-readable files that are also machine-parseable. Every recipe follows the same schema, so every operation (search, aggregate, filter) works uniformly across the entire collection.

### Normalize at Write Time

Ingredient normalization (consistent naming, standardized units, separated quantities) happens when a recipe is added, not when it's searched or aggregated. This is a deliberate front-loading choice. The alternative -- normalizing at read time -- means every search and every shopping list generation has to re-solve the same normalization problems. Write-time normalization means the data is clean once and stays clean.

### Flat Files Over Databases

A personal recipe collection is small enough (typically under 500 recipes) that file-per-recipe storage in a directory is simpler, more portable, and more debuggable than any database. Files can be version-controlled, manually edited, synced across machines, and inspected with standard tools. The tradeoff (linear search time) is irrelevant at this scale.

### Ingredient-Centric Organization

Recipes are stored by name but indexed by ingredient. The primary lookup pattern for home cooks is not "I want to make chicken tikka masala" (you already know where that recipe is) but "I have chicken thighs and yogurt, what can I make?" The search workflow optimizes for this ingredient-first access pattern.

### Conservative Unit Conversion

Shopping list aggregation converts units only when the conversion is unambiguous and lossless. "2 tbsp + 1 tbsp = 3 tbsp" is safe. "3 cloves garlic + 1 tsp minced garlic" is not -- these stay as separate line items rather than risk an incorrect conversion. Precision matters more than tidiness in a shopping list.

## Success Criteria

1. Every recipe in the collection follows the same schema and can be parsed programmatically
2. Ingredient search finds recipes even with partial matches ("cheese" matches "cheddar cheese")
3. Shopping lists correctly aggregate quantities with same-unit ingredients combined
4. The recipe collection is portable -- plain files, no external dependencies, works offline
5. Adding a duplicate recipe (by name) warns before overwriting

## Explicit Out-of-Scope

- **Nutritional analysis** -- calculating calories, macros, or dietary compliance is a separate concern
- **Recipe recommendation** -- suggesting recipes based on preferences or history is not search-by-ingredient
- **Cooking instructions** -- the skill stores and retrieves recipes but does not guide the cooking process
- **Inventory tracking** -- knowing what ingredients you currently have on hand is a separate system
- **Recipe scaling** -- adjusting quantities for different serving sizes could be added later but is not in the initial scope

## Evolution Notes

*2026-03-05: Initial skill creation. Three workflows (AddRecipe, SearchByIngredient, GenerateShoppingList) and two standards (RecipeSchema, DataStorage). Designed around flat YAML files with write-time ingredient normalization.*
