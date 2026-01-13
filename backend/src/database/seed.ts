import 'dotenv/config';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import { MealType } from '../common/enums/meal-type.enum';
import { Unit } from '../common/enums/unit.enum';
import { formatDateToIso, getCurrentRomeDate, getIsoWeekStart } from '../common/utils/time';

const DEFAULT_DATABASE_URL = 'postgresql://dietapp:dietapp@localhost:5433/dietapp';
const DEMO_EMAIL = 'demo@diet.app';
const DEMO_PASSWORD = 'password123';

type IngredientSeed = {
  name: string;
  category: string;
  defaultUnit: Unit;
  defaultQuantity: number;
  allowedMealTypes?: MealType[];
};

const INGREDIENTS: IngredientSeed[] = [
  { name: 'Greek Yogurt', category: 'Dairy', defaultUnit: Unit.GR, defaultQuantity: 200, allowedMealTypes: [MealType.BREAKFAST] },
  { name: 'Oats', category: 'Grains', defaultUnit: Unit.GR, defaultQuantity: 60, allowedMealTypes: [MealType.BREAKFAST] },
  { name: 'Chicken Breast', category: 'Protein', defaultUnit: Unit.GR, defaultQuantity: 180, allowedMealTypes: [MealType.LUNCH, MealType.DINNER] },
  { name: 'Cherry Tomatoes', category: 'Vegetables', defaultUnit: Unit.GR, defaultQuantity: 120 },
  { name: 'Olive Oil', category: 'Pantry', defaultUnit: Unit.ML, defaultQuantity: 10 },
];

const MEAL_ORDER: MealType[] = [
  MealType.BREAKFAST,
  MealType.MORNING_SNACK,
  MealType.LUNCH,
  MealType.AFTERNOON_SNACK,
  MealType.DINNER,
];

async function seed() {
  const connectionString = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const existingUsers = await client.query('SELECT id FROM users LIMIT 1');
    if ((existingUsers.rowCount ?? 0) > 0) {
      return;
    }

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const userResult = await client.query<{ id: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [DEMO_EMAIL, passwordHash],
    );
    const userId = userResult.rows[0].id;

    const ingredientMap = new Map<string, string>();
    for (const ingredient of INGREDIENTS) {
      const result = await client.query<{ id: string }>(
        `INSERT INTO ingredients (user_id, name, category, default_unit, default_quantity, allowed_meal_types)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          userId,
          ingredient.name,
          ingredient.category,
          ingredient.defaultUnit,
          ingredient.defaultQuantity,
          ingredient.allowedMealTypes ?? null,
        ],
      );
      ingredientMap.set(ingredient.name, result.rows[0].id);
    }

    const monday = getIsoWeekStart(getCurrentRomeDate());
    const weekStartDate = formatDateToIso(monday);

    const menuResult = await client.query<{ id: string }>(
      'INSERT INTO weekly_menus (user_id, week_start_date) VALUES ($1, $2) RETURNING id',
      [userId, weekStartDate],
    );
    const menuId = menuResult.rows[0].id;

    const mealValues: string[] = [];
    const mealParams: unknown[] = [menuId];
    for (let day = 1; day <= 7; day += 1) {
      for (const mealType of MEAL_ORDER) {
        mealParams.push(day, mealType);
        const dayParam = mealParams.length - 1;
        const mealParam = mealParams.length;
        mealValues.push(`($1, $${dayParam}, $${mealParam})`);
      }
    }
    await client.query(
      `INSERT INTO menu_meals (weekly_menu_id, day_of_week, meal_type)
       VALUES ${mealValues.join(', ')}`,
      mealParams,
    );

    const mealRows = await client.query<{
      id: string;
      day_of_week: number;
      meal_type: MealType;
    }>(
      `SELECT id, day_of_week, meal_type
       FROM menu_meals
       WHERE weekly_menu_id = $1`,
      [menuId],
    );

    const mealMap = new Map<string, string>();
    for (const row of mealRows.rows) {
      mealMap.set(`${row.day_of_week}:${row.meal_type}`, row.id);
    }

    const items = [
      {
        day: 1,
        mealType: MealType.BREAKFAST,
        ingredient: 'Greek Yogurt',
        quantity: 200,
        unit: Unit.GR,
      },
      {
        day: 1,
        mealType: MealType.BREAKFAST,
        ingredient: 'Oats',
        quantity: 60,
        unit: Unit.GR,
      },
      {
        day: 1,
        mealType: MealType.LUNCH,
        ingredient: 'Chicken Breast',
        quantity: 180,
        unit: Unit.GR,
      },
      {
        day: 2,
        mealType: MealType.DINNER,
        ingredient: 'Chicken Breast',
        quantity: 150,
        unit: Unit.GR,
      },
      {
        day: 2,
        mealType: MealType.DINNER,
        ingredient: 'Cherry Tomatoes',
        quantity: 120,
        unit: Unit.GR,
      },
      {
        day: 2,
        mealType: MealType.DINNER,
        ingredient: 'Olive Oil',
        quantity: 10,
        unit: Unit.ML,
      },
    ];

    for (const item of items) {
      const mealId = mealMap.get(`${item.day}:${item.mealType}`);
      const ingredientId = ingredientMap.get(item.ingredient);
      if (!mealId || !ingredientId) continue;
      await client.query(
        `INSERT INTO meal_items (menu_meal_id, ingredient_id, quantity, unit)
         VALUES ($1, $2, $3, $4)`,
        [mealId, ingredientId, item.quantity, item.unit],
      );
    }

    await client.query(
      `INSERT INTO shopping_items
       (user_id, week_start_date, source, ingredient_id, item_key, name, category, unit, quantity, meal_type, purchased)
       VALUES ($1, $2, 'OFF_MENU', NULL, $3, 'Sparkling Water', 'Drinks', $4, $5, NULL, false)`,
      [userId, weekStartDate, `sparkling water|${Unit.ML}`, Unit.ML, 1500],
    );
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
