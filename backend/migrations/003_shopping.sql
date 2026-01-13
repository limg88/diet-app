CREATE TABLE IF NOT EXISTS shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  source text NOT NULL CHECK (source IN ('MENU', 'OFF_MENU')),
  ingredient_id uuid NULL REFERENCES ingredients(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NULL,
  unit text NOT NULL CHECK (unit IN ('gr', 'ml', 'unit')),
  quantity numeric NOT NULL CHECK (quantity > 0),
  meal_type text NULL,
  purchased boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start_date, source, ingredient_id, unit)
);

CREATE INDEX IF NOT EXISTS idx_shopping_items_user_week ON shopping_items(user_id, week_start_date);
