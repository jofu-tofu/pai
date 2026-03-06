---
name: RecipeManager
description: Organize and manage recipes, search by ingredient, and generate shopping lists from meal plans. USE WHEN recipes OR cooking OR meal planning OR add recipe OR search ingredient OR shopping list OR meal prep OR recipe collection OR find recipe OR what ingredients OR grocery list.
---

# RecipeManager

Recipe organization and meal planning assistant: add new recipes, search your collection by ingredient, and generate consolidated shopping lists from meal plans.

> **For agents modifying this skill:** Read SkillIntent.md before making any changes.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **AddRecipe** | "add recipe", "new recipe", "save recipe", "create recipe" | `Workflows/AddRecipe.md` |
| **SearchByIngredient** | "search by ingredient", "find recipe with", "what can I make with", "recipes using" | `Workflows/SearchByIngredient.md` |
| **GenerateShoppingList** | "generate shopping list", "grocery list", "shopping list from meal plan", "what do I need to buy" | `Workflows/GenerateShoppingList.md` |

## Examples

**Example 1: Add a new recipe**
```
User: "Add a recipe for chicken tikka masala"
-> Invokes AddRecipe workflow
-> Collects recipe details: name, ingredients, instructions, servings, tags
-> Saves structured recipe to the recipe collection
-> Confirms recipe was added with summary
```

**Example 2: Search recipes by ingredient**
```
User: "What can I make with chicken and coconut milk?"
-> Invokes SearchByIngredient workflow
-> Searches recipe collection for matching ingredients
-> Returns ranked list of recipes that use those ingredients
-> Shows match percentage and missing ingredients for each result
```

**Example 3: Generate a shopping list**
```
User: "Generate a shopping list for this week's meal plan"
-> Invokes GenerateShoppingList workflow
-> Reads the specified meal plan (list of recipes and servings)
-> Consolidates all ingredients, combining duplicates and converting units
-> Outputs organized shopping list grouped by category (produce, dairy, pantry, etc.)
```
