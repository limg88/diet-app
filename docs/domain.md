# Domain model

## Entities (conceptual)
### User
- id
- email
- passwordHash

### Ingredient
- id
- userId
- name (required)
- category (optional)
- defaultUnit: gr|ml|unit (required)
- defaultQuantity: number > 0 (required)
- allowedMealTypes: array of meal types (optional; if empty => all)
- deletedAt (optional)

### WeeklyMenu
- id
- userId
- weekStartDate (DATE in Europe/Rome context, Monday)
- createdAt

### MenuMeal
- id
- weeklyMenuId
- dayOfWeek (1..7, Monday=1)
- mealType (enum)

### MealItem
- id
- menuMealId
- ingredientId
- quantity (number > 0)
- unit (gr|ml|unit)

### ShoppingItem
- id
- userId
- weekStartDate (DATE, Monday)
- source: MENU|OFF_MENU
- ingredientId (nullable for OFF_MENU)
- name (required for OFF_MENU; for MENU derive from ingredient)
- category (optional)
- unit (gr|ml|unit)
- quantity (number > 0)
- mealType (nullable; if derived from multiple meals can be null or "MULTI" at DTO level)
- purchased (boolean)

## Key processes
### Get current menu
- Compute current weekStartDate (Monday) in Europe/Rome
- Find weeklyMenu for that date
- If not found:
  - compute prev weekStartDate = current - 7 days
  - if prev exists: copy structure+items
  - else: create empty structure (7*5 meals)
- Return a normalized DTO with 7 days × 5 meals

### Shopping aggregation
- For current week:
  - sum meal items grouped by (ingredientId, unit)
  - enrich with ingredient (name, category)
  - determine mealType display:
    - if appears in one mealType => that
    - else => MULTI (DTO only)
  - merge purchased state from persisted ShoppingItem rows (source=MENU)
  - include OFF_MENU items persisted
