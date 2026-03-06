# SkillIntent — RecipeManager

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

1. **Recipes are structured data.** Free-form text recipes are hard to search, scale, and combine. Every recipe stored through this skill follows a consistent schema with normalized ingredients.
2. **Cooking starts with what you have.** The most common question is "what can I make with these ingredients?" — search must be ingredient-first, not recipe-name-first.
3. **Shopping is the bridge between planning and cooking.** A meal plan is only useful if it produces an actionable shopping list. Consolidation (combining duplicates, converting units) is the core value-add over manually listing ingredients.

## Problem This Skill Solves

Without RecipeManager, recipes live as scattered notes, bookmarks, and screenshots with no consistent format. Finding what to cook requires manual scanning. Planning meals for a week means manually cross-referencing ingredients across multiple recipes and hoping you don't forget anything at the store. RecipeManager provides structured storage, ingredient-based search, and automated shopping list generation from meal plans.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Ingredient normalization | Lowercase singular form with standardized units | Free-form text, user-defined units | Enables reliable search matching and accurate shopping list consolidation |
| Search scoring | Percentage-based match (matched/total) | Boolean match (has all or not) | Partial matches are useful — users often want to see what they're close to making |
| Shopping list categorization | Fixed category taxonomy | User-defined categories, no categories | Fixed categories match how grocery stores are organized; reduces cognitive load |
| Recipe storage format | Markdown files with structured sections | JSON, database, YAML | Markdown is human-readable, version-controllable, and consistent with PAI conventions |

## Explicit Out-of-Scope

- **Nutritional analysis** — Calculating calories, macros, or dietary metrics. Use a dedicated nutrition tool.
- **Recipe web scraping** — Automatically extracting recipes from URLs. Users provide recipe details directly.
- **Meal plan generation** — Automatically creating meal plans based on preferences. Users define their own meal plans; this skill generates shopping lists FROM plans.
- **Inventory tracking** — Tracking what ingredients are currently in the pantry. This skill searches recipes by stated ingredients, not by pantry state.
- **Recipe sharing or collaboration** — Multi-user recipe collections or social features.

## Success Criteria

1. A recipe added through AddRecipe can be found by SearchByIngredient using any of its ingredients.
2. SearchByIngredient returns results ranked by ingredient match percentage with clear indication of what is missing.
3. GenerateShoppingList produces a single consolidated list with no duplicate ingredients when given a meal plan with overlapping recipes.
4. Every stored recipe has all required fields populated (name, ingredients with quantities, instructions, servings).
5. Shopping list quantities are correctly scaled when recipes are multiplied for different serving counts.

## Constraints

- All ingredient quantities use decimal notation (0.5, not 1/2) for reliable arithmetic during consolidation.
- Ingredient names are stored in lowercase singular form to prevent duplicate entries ("tomato" not "Tomatoes").
- Unit standardization uses the defined set (tsp, tbsp, cup, oz, lb, g, kg, ml, L, piece, clove, bunch) — no ad-hoc units.
- Recipe files use markdown format consistent with PAI file conventions.
- Shopping list output always uses checkbox format for usability as a checklist.
