# SearchByIngredient Workflow

> **Trigger:** "search by ingredient", "find recipe with", "what can I make with", "recipes using"

## Reference Material

- None.

## Purpose

Search the recipe collection to find recipes that use specific ingredients. Returns ranked results showing how well each recipe matches the provided ingredients, helping users decide what to cook with what they have on hand.

## Workflow Steps

### Step 1: Collect Search Ingredients

Ask the user which ingredients they want to search for. Accept:
- A comma-separated list ("chicken, rice, soy sauce")
- A natural language description ("I have chicken and some vegetables")
- A pantry inventory ("what can I make with what's in my fridge: eggs, cheese, spinach, bread")

Normalize each ingredient to lowercase singular form.

### Step 2: Search Recipe Collection

For each recipe in the collection:
1. Compare the search ingredients against the recipe's ingredient list
2. Calculate a match score: (matched ingredients / total recipe ingredients) * 100
3. Track which search ingredients matched and which recipe ingredients are missing

### Step 3: Rank and Filter Results

Sort results by match score (highest first). Apply these filters:
- Show recipes with at least 50% ingredient match
- If fewer than 3 recipes meet the threshold, lower it to 25%
- If still no results, report that no matching recipes were found

### Step 4: Present Results

For each matching recipe, display:

```
[Recipe Name] — [match score]% match
  Have: [matched ingredients]
  Need: [missing ingredients]
  Tags: [tags]
  Servings: [N] | Cook time: [time]
```

Order by match score descending. Highlight any recipes with 100% match (all ingredients available).
