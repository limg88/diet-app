-- Seed weekly menu for collaborator from docs/dieta.xlsx (menu rows 31-59)
-- Use: psql -v user_email='user@example.com' -v week_start_date='YYYY-MM-DD'
BEGIN;
-- ROLLBACK;

WITH params AS (
  SELECT :'user_email'::text AS user_email, :'week_start_date'::date AS week_start_date
),
target_user AS (
  SELECT id FROM users u JOIN params p ON u.email = p.user_email
),
upsert_menu AS (
  INSERT INTO weekly_menus (user_id, week_start_date)
  SELECT target_user.id, params.week_start_date
  FROM target_user, params
  ON CONFLICT (user_id, week_start_date) DO UPDATE
    SET week_start_date = EXCLUDED.week_start_date
  RETURNING id
),
insert_meals AS (
  INSERT INTO menu_meals (weekly_menu_id, day_of_week, meal_type)
  SELECT upsert_menu.id, d.day_of_week, d.meal_type
  FROM upsert_menu
  CROSS JOIN (VALUES
    (1, 'BREAKFAST'),
    (1, 'MORNING_SNACK'),
    (1, 'LUNCH'),
    (1, 'AFTERNOON_SNACK'),
    (1, 'DINNER'),
    (2, 'BREAKFAST'),
    (2, 'MORNING_SNACK'),
    (2, 'LUNCH'),
    (2, 'AFTERNOON_SNACK'),
    (2, 'DINNER'),
    (3, 'BREAKFAST'),
    (3, 'MORNING_SNACK'),
    (3, 'LUNCH'),
    (3, 'AFTERNOON_SNACK'),
    (3, 'DINNER'),
    (4, 'BREAKFAST'),
    (4, 'MORNING_SNACK'),
    (4, 'LUNCH'),
    (4, 'AFTERNOON_SNACK'),
    (4, 'DINNER'),
    (5, 'BREAKFAST'),
    (5, 'MORNING_SNACK'),
    (5, 'LUNCH'),
    (5, 'AFTERNOON_SNACK'),
    (5, 'DINNER'),
    (6, 'BREAKFAST'),
    (6, 'MORNING_SNACK'),
    (6, 'LUNCH'),
    (6, 'AFTERNOON_SNACK'),
    (6, 'DINNER'),
    (7, 'BREAKFAST'),
    (7, 'MORNING_SNACK'),
    (7, 'LUNCH'),
    (7, 'AFTERNOON_SNACK'),
    (7, 'DINNER')
  ) AS d(day_of_week, meal_type)
  ON CONFLICT (weekly_menu_id, day_of_week, meal_type) DO NOTHING
  RETURNING weekly_menu_id
)
INSERT INTO meal_items (menu_meal_id, ingredient_id, quantity, unit)
SELECT mm.id, i.id, v.quantity, v.unit
FROM menu_meals mm
JOIN weekly_menus wm ON wm.id = mm.weekly_menu_id
JOIN target_user u ON u.id = wm.user_id
JOIN (VALUES
  (1, 'BREAKFAST', 'bevanda di riso', 200.0, 'gr'),
  (1, 'MORNING_SNACK', 'pera', 25.0, 'gr'),
  (1, 'LUNCH', 'uova di gallina intero', 120.0, 'gr'),
  (1, 'AFTERNOON_SNACK', 'yogurt scremato', 125.0, 'gr'),
  (1, 'DINNER', 'petto di pollo', 130.0, 'gr'),
  (1, 'BREAKFAST', 'biscotti misura privolat', 30.0, 'gr'),
  (1, 'LUNCH', 'zucchine', 200.0, 'gr'),
  (1, 'AFTERNOON_SNACK', 'frutta secca', 20.0, 'gr'),
  (1, 'DINNER', 'panko', 30.0, 'gr'),
  (1, 'DINNER', 'minestrone leggerezza', 250.0, 'gr'),
  (1, 'DINNER', 'pane tostato', 20.0, 'gr'),
  (2, 'BREAKFAST', 'bevanda di riso', 200.0, 'gr'),
  (2, 'MORNING_SNACK', 'pera', 200.0, 'gr'),
  (2, 'LUNCH', 'primosale', 120.0, 'gr'),
  (2, 'AFTERNOON_SNACK', 'pane tostato', 50.0, 'gr'),
  (2, 'DINNER', 'pane tostato', 50.0, 'gr'),
  (2, 'BREAKFAST', 'biscotti misura privolat', 30.0, 'gr'),
  (2, 'LUNCH', 'zucca', 200.0, 'gr'),
  (2, 'AFTERNOON_SNACK', 'miele', 10.0, 'gr'),
  (2, 'DINNER', 'prosciutto cotto', 80.0, 'gr'),
  (2, 'AFTERNOON_SNACK', 'noci', 10.0, 'gr'),
  (2, 'DINNER', 'zucca', 200.0, 'gr'),
  (3, 'BREAKFAST', 'bevanda di riso', 200.0, 'gr'),
  (3, 'MORNING_SNACK', 'cachi', 200.0, 'gr'),
  (3, 'LUNCH', 'salmone affumicato', 80.0, 'gr'),
  (3, 'AFTERNOON_SNACK', 'yogurt greco', 150.0, 'gr'),
  (3, 'DINNER', 'polpo', 300.0, 'gr'),
  (3, 'BREAKFAST', 'biscotti misura privolat', 30.0, 'gr'),
  (3, 'LUNCH', 'valeriana', 50.0, 'gr'),
  (3, 'DINNER', 'patate', 200.0, 'gr'),
  (3, 'LUNCH', 'carote', 150.0, 'gr'),
  (4, 'BREAKFAST', 'bevanda di riso', 200.0, 'gr'),
  (4, 'MORNING_SNACK', 'mela', 200.0, 'gr'),
  (4, 'LUNCH', 'fior di latte', 150.0, 'gr'),
  (4, 'AFTERNOON_SNACK', 'crackers riso su riso', 25.0, 'gr'),
  (4, 'DINNER', 'hamburger vegetale', 150.0, 'gr'),
  (4, 'BREAKFAST', 'biscotti misura privolat', 30.0, 'gr'),
  (4, 'LUNCH', 'melanzane', 200.0, 'gr'),
  (4, 'DINNER', 'tris di verdure', 200.0, 'gr'),
  (5, 'BREAKFAST', 'bevanda di riso', 200.0, 'gr'),
  (5, 'MORNING_SNACK', 'banana', 200.0, 'gr'),
  (5, 'LUNCH', 'prosciutto cotto', 80.0, 'gr'),
  (5, 'AFTERNOON_SNACK', 'yogurt scremato', 125.0, 'gr'),
  (5, 'DINNER', 'roastbeef', 180.0, 'gr'),
  (5, 'BREAKFAST', 'biscotti misura privolat', 30.0, 'gr'),
  (5, 'LUNCH', 'piselli', 80.0, 'gr'),
  (5, 'AFTERNOON_SNACK', 'frutta secca', 20.0, 'gr'),
  (5, 'DINNER', 'melanzane', 200.0, 'gr'),
  (5, 'LUNCH', 'funghi', 200.0, 'gr'),
  (6, 'BREAKFAST', 'latte scramato', 200.0, 'gr'),
  (6, 'MORNING_SNACK', 'pera', 25.0, 'gr'),
  (6, 'LUNCH', 'salmone', 200.0, 'gr'),
  (6, 'AFTERNOON_SNACK', 'mela', 200.0, 'gr'),
  (6, 'BREAKFAST', 'farina di riso', 50.0, 'gr'),
  (6, 'LUNCH', 'tris di verdure', 200.0, 'gr'),
  (6, 'BREAKFAST', 'marmellata', 20.0, 'gr'),
  (6, 'BREAKFAST', 'albume', 80.0, 'gr'),
  (7, 'BREAKFAST', 'latte scramato', 200.0, 'gr'),
  (7, 'MORNING_SNACK', 'pera', 200.0, 'gr'),
  (7, 'LUNCH', 'pasta', 50.0, 'gr'),
  (7, 'AFTERNOON_SNACK', 'uva', 200.0, 'gr'),
  (7, 'DINNER', 'pane tostato', 50.0, 'gr'),
  (7, 'BREAKFAST', 'farina di riso', 50.0, 'gr'),
  (7, 'LUNCH', 'passata di pomodoro', 200.0, 'gr'),
  (7, 'DINNER', 'tris di verdure', 200.0, 'gr'),
  (7, 'BREAKFAST', 'marmellata', 20.0, 'gr'),
  (7, 'LUNCH', 'manzo magro macinato', 150.0, 'gr'),
  (7, 'DINNER', 'fesa di tacchino', 80.0, 'gr'),
  (7, 'BREAKFAST', 'albume', 80.0, 'gr'),
  (7, 'DINNER', 'philadelphia', 25.0, 'gr')
) AS v(day_of_week, meal_type, ingredient_name, quantity, unit)
  ON mm.day_of_week = v.day_of_week AND mm.meal_type = v.meal_type
JOIN ingredients i ON i.user_id = u.id AND i.name = v.ingredient_name;

COMMIT;
