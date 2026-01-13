CREATE TABLE IF NOT EXISTS weekly_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start_date)
);

CREATE TABLE IF NOT EXISTS menu_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_menu_id uuid NOT NULL REFERENCES weekly_menus(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type text NOT NULL CHECK (
    meal_type IN ('BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER')
  ),
  UNIQUE (weekly_menu_id, day_of_week, meal_type)
);

CREATE TABLE IF NOT EXISTS meal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_meal_id uuid NOT NULL REFERENCES menu_meals(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity numeric NOT NULL CHECK (quantity > 0),
  unit text NOT NULL CHECK (unit IN ('gr', 'ml', 'unit'))
);

CREATE INDEX IF NOT EXISTS idx_weekly_menus_user_date ON weekly_menus(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_menu_meals_weekly_menu ON menu_meals(weekly_menu_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_menu_meal ON meal_items(menu_meal_id);
