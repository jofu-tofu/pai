# Data Storage

Conventions for how recipe data is stored on disk, how files are named, and how ingredients are normalized.

## Directory Layout

```
recipes/
  chicken-tikka-masala.yaml
  pasta-primavera.yaml
  black-bean-tacos.yaml
  ...
```

All recipe files live in a single flat directory. No subdirectories by cuisine or meal type -- tags handle categorization, and flat directories are simpler to scan and glob.

Default location: `recipes/` at the project root. If the user specifies a different location, all workflows use that path instead.

## File Naming

- Filename = `{slug}.yaml`
- Slug is derived from recipe name: lowercase, spaces replaced with hyphens, non-alphanumeric characters removed
- Examples:
  - "Chicken Tikka Masala" -> `chicken-tikka-masala.yaml`
  - "Mom's Pasta Sauce" -> `moms-pasta-sauce.yaml`
  - "Pad Thai (Easy Version)" -> `pad-thai-easy-version.yaml`

## Ingredient Normalization

Normalization happens at write time (during AddRecipe). The goal is that the same real-world ingredient always has the same `item` string, so search and aggregation work without fuzzy matching at read time.

### Rules

1. **Singular form** -- Always use singular: "onion" not "onions", "egg" not "eggs"
2. **Lowercase** -- All item names are lowercase: "chicken thigh" not "Chicken Thigh"
3. **No brand names** -- Use generic names: "tortilla chip" not "Tostitos"
4. **Qualifier after base** -- "bell pepper, red" not "red bell pepper". This groups related items together when sorted alphabetically
5. **Common name preferred** -- "cilantro" not "coriander leaf", "scallion" not "green onion"
6. **No preparation in item name** -- Preparation goes in the `prep` field: item "garlic" with prep "minced", not item "minced garlic"
7. **Specific cuts for proteins** -- "chicken thigh" not just "chicken", "ground beef" not just "beef"

### Normalization Lookup Table (Common Synonyms)

| Input variants | Normalized form |
|---|---|
| green onion, spring onion | scallion |
| coriander (leaf context) | cilantro |
| capsicum | bell pepper |
| aubergine | eggplant |
| courgette | zucchini |
| rocket | arugula |
| caster sugar, superfine sugar | sugar, caster |
| icing sugar, confectioner's sugar | sugar, powdered |
| single cream | cream, light |
| double cream | cream, heavy |
| minced meat, ground meat | ground beef / ground pork / etc. (specify animal) |

### Unit Normalization

When users provide non-standard units, convert to the standard unit list:

| Input | Normalized |
|---|---|
| "tablespoons", "Tbsp", "T" | `tbsp` |
| "teaspoons", "tsp." | `tsp` |
| "cups", "c." | `cup` |
| "pounds", "lbs" | `lb` |
| "ounces", "oz." | `oz` |
| "grams", "gm" | `g` |
| "a handful" | `cup` (approximate as 0.5 cup) |
| "a dash" | `pinch` |
| "a splash" | `tbsp` (approximate as 1 tbsp) |

## Duplicate Detection

Before writing a new recipe file, check if a file with the same slug already exists. If it does:

1. Notify the user that a recipe with that name already exists
2. Show the existing recipe's name, servings, and ingredient count
3. Ask whether to overwrite, rename the new recipe, or cancel
4. Do not overwrite without explicit confirmation

## Backup

No automated backup system. The recipe directory is plain files suitable for version control (git). Users are encouraged to keep their recipes directory in a git repository or synced folder.
