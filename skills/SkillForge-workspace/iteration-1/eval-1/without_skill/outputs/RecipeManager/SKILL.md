---
name: RecipeManager
description: Organize, search, and plan around recipes — add new recipes, search by ingredient, and generate shopping lists from meal plans. USE WHEN recipes, cooking, meal planning, add recipe, new recipe, save recipe, find recipe, search recipe, search by ingredient, what can I make, shopping list, grocery list, meal plan, weekly meals, ingredients, what to cook, dinner ideas, recipe lookup.
---

# RecipeManager

Skill for managing a personal recipe collection. Handles three core workflows: adding new recipes to the collection, searching existing recipes by ingredient, and generating consolidated shopping lists from meal plans.

## Data Location

All recipe data lives in a `recipes/` directory at the project root (or a user-specified location). Recipes are stored as individual YAML files following the schema defined in `Standards/RecipeSchema.md`. The storage conventions are defined in `Standards/DataStorage.md`.

## Success Criteria

1. **Structured data** -- Every recipe follows the standard schema so it can be searched, filtered, and aggregated programmatically
2. **Ingredient normalization** -- Ingredients use consistent naming so search and shopping list aggregation work reliably (e.g., "garlic clove" not sometimes "clove of garlic")
3. **Accurate aggregation** -- Shopping lists correctly combine quantities across recipes, converting units where possible (e.g., two recipes each needing 1/2 cup butter = 1 cup butter)
4. **Idempotent additions** -- Adding a recipe that already exists (by name match) warns before overwriting
5. **Useful search** -- Ingredient search returns partial matches and ranks by relevance (recipes using the ingredient prominently rank higher)

## Workflow Routing

**When executing a workflow, output this notification IMMEDIATELY -- before any other actions:**

```
Running the **[WorkflowName]** workflow from the **RecipeManager** skill...
```

| Request Pattern | Route To |
|---|---|
| Add recipe, new recipe, save recipe, store recipe, I made something, log recipe | `Workflows/AddRecipe.md` |
| Search by ingredient, what can I make with, find recipes with, recipe lookup, ingredient search, what to cook with | `Workflows/SearchByIngredient.md` |
| Shopping list, grocery list, meal plan, weekly meals, what do I need to buy, generate list from meals | `Workflows/GenerateShoppingList.md` |

## Standards

| Standard | Purpose | File |
|---|---|---|
| Recipe Schema | Defines the YAML structure every recipe must follow | `Standards/RecipeSchema.md` |
| Data Storage | Conventions for file naming, directory layout, and ingredient normalization | `Standards/DataStorage.md` |

## Examples

**Example 1: Adding a recipe**
```
User: "Add a recipe for chicken tikka masala"
-> Invokes AddRecipe workflow
-> Prompts user for ingredients, steps, servings, and metadata
-> Writes recipes/chicken-tikka-masala.yaml
```

**Example 2: Searching by ingredient**
```
User: "What can I make with chickpeas and spinach?"
-> Invokes SearchByIngredient workflow
-> Scans all recipe files for ingredient matches
-> Returns ranked list of matching recipes with match details
```

**Example 3: Generating a shopping list**
```
User: "Generate a shopping list for this week: Monday chicken tikka masala, Wednesday pasta primavera, Friday black bean tacos"
-> Invokes GenerateShoppingList workflow
-> Looks up each recipe, aggregates ingredients, combines duplicates
-> Outputs consolidated shopping list grouped by store section
```

**Example 4: Partial ingredient search**
```
User: "Find recipes with any kind of cheese"
-> Invokes SearchByIngredient workflow
-> Matches cheddar, mozzarella, parmesan, feta, etc.
-> Returns all cheese-containing recipes
```

## Architecture Notes

The skill operates on flat YAML files rather than a database. This keeps the recipe collection human-readable, version-controllable, and portable. The tradeoff is that search performance degrades linearly with collection size, but for a personal collection (typically under 500 recipes), file-scanning is effectively instant.

Ingredient normalization happens at write time (AddRecipe) rather than read time (SearchByIngredient). This front-loads the work so that search and aggregation can trust the data without re-normalizing on every query.
