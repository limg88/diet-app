# Decisions (frozen)

- Timezone: Europe/Rome
- Current week: ISO Monday-start week, shown only for the current week
- Meals: 5 fixed meal types (BREAKFAST, MORNING_SNACK, LUNCH, AFTERNOON_SNACK, DINNER)
- Units: gr, ml, unit
- Ingredient allowedMealTypes:
  - If empty/null => allowed for all meals
  - Otherwise must contain the mealType of the target meal
- Weekly rollover:
  - On demand when requesting current menu:
    - If current week menu missing, create it
    - If previous week exists, copy it
    - Else create empty
- Shopping:
  - Aggregate by (ingredientId, unit)
  - Persist purchased/off-menu items
- Deletion strategy for ingredients: soft-delete preferred (deletedAt)
