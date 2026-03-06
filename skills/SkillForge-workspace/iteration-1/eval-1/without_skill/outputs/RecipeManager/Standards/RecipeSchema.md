# Recipe Schema

Every recipe file is a YAML document that conforms to this schema. The schema is designed for machine-parseability (consistent field names, typed values, normalized ingredients) while remaining human-readable and hand-editable.

## Required Fields

```yaml
name: "Chicken Tikka Masala"
slug: "chicken-tikka-masala"          # Lowercase, hyphenated, used as filename
servings: 4
prep_time_minutes: 20
cook_time_minutes: 35
total_time_minutes: 55

tags:
  - indian
  - chicken
  - curry
  - weeknight

source: "https://example.com/recipe"   # URL, book title, or "original"

ingredients:
  - item: "chicken thigh"
    quantity: 1.5
    unit: "lb"
    prep: "cut into 1-inch cubes"
    category: "protein"

  - item: "plain yogurt"
    quantity: 0.5
    unit: "cup"
    prep: null
    category: "dairy"

steps:
  - "Marinate chicken in yogurt and spices for at least 30 minutes."
  - "Heat oil in a large skillet over medium-high heat."
  - "Cook chicken until browned on all sides, about 5 minutes."
  - "Add sauce ingredients and simmer for 20 minutes."

notes: "Can substitute Greek yogurt. Tastes better the next day."
```

## Field Specifications

### Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Human-readable recipe name, title case |
| `slug` | string | Yes | Lowercase hyphenated identifier, used as filename (`{slug}.yaml`) |
| `servings` | integer | Yes | Number of servings the recipe produces |
| `prep_time_minutes` | integer | Yes | Active preparation time in minutes |
| `cook_time_minutes` | integer | Yes | Passive cooking/baking time in minutes |
| `total_time_minutes` | integer | Yes | Total time (prep + cook + any resting) |
| `tags` | list[string] | Yes | Lowercase tags for categorization (cuisine, protein, meal type, dietary) |
| `source` | string | Yes | Where the recipe came from -- URL, book title + page, or "original" |
| `ingredients` | list[ingredient] | Yes | Structured ingredient list (see below) |
| `steps` | list[string] | Yes | Ordered cooking instructions, one string per step |
| `notes` | string | No | Freeform notes -- substitutions, tips, storage instructions |

### Ingredient Object

| Field | Type | Required | Description |
|---|---|---|---|
| `item` | string | Yes | Normalized ingredient name (see DataStorage.md for normalization rules) |
| `quantity` | number | Yes | Numeric quantity (use decimals, not fractions: 0.5 not 1/2) |
| `unit` | string | Yes | Standardized unit (see allowed units below) |
| `prep` | string | No | Preparation instructions ("diced", "minced", "at room temperature") |
| `category` | string | Yes | Store section for shopping list grouping |

### Allowed Units

Use these standardized unit abbreviations consistently:

| Unit | Abbreviation | Notes |
|---|---|---|
| teaspoon | `tsp` | |
| tablespoon | `tbsp` | |
| cup | `cup` | |
| fluid ounce | `fl_oz` | |
| pint | `pint` | |
| quart | `quart` | |
| gallon | `gallon` | |
| milliliter | `ml` | |
| liter | `l` | |
| ounce | `oz` | Weight |
| pound | `lb` | |
| gram | `g` | |
| kilogram | `kg` | |
| whole | `whole` | For counted items (eggs, lemons, onions) |
| clove | `clove` | Garlic specifically |
| pinch | `pinch` | Small unmeasured amounts |
| to taste | `to_taste` | Salt, pepper, etc. |
| bunch | `bunch` | Herbs, greens |
| can | `can` | Specify size in prep field (e.g., "15 oz can") |
| slice | `slice` | Bread, cheese |
| piece | `piece` | Generic counted items |

### Ingredient Categories

Use these categories for shopping list grouping:

| Category | Examples |
|---|---|
| `produce` | Vegetables, fruits, fresh herbs |
| `protein` | Meat, poultry, fish, tofu, tempeh |
| `dairy` | Milk, cheese, yogurt, butter, cream |
| `grain` | Rice, pasta, bread, flour, oats |
| `canned` | Canned beans, tomatoes, coconut milk |
| `spice` | Dried spices, seasoning blends |
| `condiment` | Soy sauce, vinegar, oils, mustard |
| `frozen` | Frozen vegetables, fruits, dough |
| `baking` | Sugar, baking powder, vanilla, chocolate |
| `other` | Anything that doesn't fit above |

## Validation Rules

1. `slug` must match the filename (without `.yaml` extension)
2. `total_time_minutes` must be >= `prep_time_minutes + cook_time_minutes`
3. Every ingredient must have a non-zero `quantity` (except `to_taste` items, which use `quantity: 0`)
4. Every ingredient `unit` must be from the allowed units list
5. Every ingredient `category` must be from the categories list
6. `tags` should include at least one cuisine tag and one meal-type tag
7. `steps` must have at least one entry
8. `ingredients` must have at least one entry
