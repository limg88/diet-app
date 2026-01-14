# Seed Mapping (dieta.xlsx -> DB)

## DB schema references
- `users`: `id`, `email`.
- `ingredients`: `user_id`, `name`, `category`, `default_unit`, `default_quantity`, `allowed_meal_types`.
- `weekly_menus`: `user_id`, `week_start_date`.
- `menu_meals`: `weekly_menu_id`, `day_of_week` (1-7), `meal_type`.
- `meal_items`: `menu_meal_id`, `ingredient_id`, `quantity`, `unit`.

## Canonical categories (from UI defaults)
- Dairy
- Grains
- Protein
- Vegetables
- Fruit
- Pantry
- Drinks
- Snacks

## Excel -> DB mapping
### Sheet: banca dati
- Columns are categories (row 1).
- Each column cell (row >= 2) is an ingredient name.
- Category is mapped via the table below; if not mapped or ambiguous, category is left NULL.

### Sheet: Foglio10
- Columns A/B and I/J provide ingredient names and gram quantities.
- Used only when a single deterministic quantity exists for the ingredient.

### Sheet: menu
- Column E contains the day name (lunedi..domenica). Rows without a day inherit the last day.
- Columns for meals (name/qty/unit in each group):
  - Colazione: F/G/H -> BREAKFAST
  - Spuntino: I/J/K -> MORNING_SNACK
  - Pranzo: L/M/N -> LUNCH
  - Spuntino 2: O/P/Q -> AFTERNOON_SNACK
  - Cena: R/S/T -> DINNER

## Normalization rules
- Trim, lowercase, remove accents, collapse whitespace.
- Dedup key: normalized name.

## Category mapping rules
- Exact normalized match first.
- If multiple raw categories for the same ingredient name, category is left NULL.

| Excel category | System category |
| --- | --- |
| colazione | NULL (ambiguous) |
| yogurt scremato | NULL (ambiguous) |
| frutta | Fruit |
| verdura | Vegetables |
| carne e hamburger | Protein |
| pesce | Protein |
| latticini e salumi | NULL (ambiguous) |
| carboidrati | Grains |
