-- Seed weekly menu for user from docs/dieta.xlsx (menu rows 3-30)
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
  (1, 'BREAKFAST', 'yogurt greco', 150.0, 'gr'),
  (1, 'MORNING_SNACK', 'banana', 200.0, 'gr'),
  (1, 'LUNCH', 'pane tostato', 100.0, 'gr'),
  (1, 'AFTERNOON_SNACK', 'pane', 50.0, 'gr'),
  (1, 'DINNER', 'petto di pollo', 280.0, 'gr'),
  (1, 'BREAKFAST', 'cheerios', 30.0, 'gr'),
  (1, 'MORNING_SNACK', 'frutta secca', 20.0, 'gr'),
  (1, 'LUNCH', 'zucchine', 200.0, 'gr'),
  (1, 'AFTERNOON_SNACK', 'fesa di tacchino', 120.0, 'gr'),
  (1, 'DINNER', 'pane tostato', 50.0, 'gr'),
  (1, 'LUNCH', 'uova di gallina intero', 120.0, 'gr'),
  (1, 'DINNER', 'minestrone leggerezza', 250.0, 'gr'),
  (1, 'LUNCH', 'albume', 100.0, 'gr'),
  (2, 'BREAKFAST', 'te', 300.0, 'gr'),
  (2, 'MORNING_SNACK', 'pera', 200.0, 'gr'),
  (2, 'LUNCH', 'pasta', 100.0, 'gr'),
  (2, 'AFTERNOON_SNACK', 'crackers riso su riso', 30.0, 'gr'),
  (2, 'DINNER', 'arista di maiale', 300.0, 'gr'),
  (2, 'BREAKFAST', 'pane tostato', 40.0, 'gr'),
  (2, 'LUNCH', 'primosale', 120.0, 'gr'),
  (2, 'AFTERNOON_SNACK', 'parmigiano', 40.0, 'gr'),
  (2, 'DINNER', 'pane tostato', 80.0, 'gr'),
  (2, 'LUNCH', 'zucca', 200.0, 'gr'),
  (2, 'DINNER', 'zucca', 200.0, 'gr'),
  (2, 'BREAKFAST', 'marmellata', 20.0, 'gr'),
  (3, 'BREAKFAST', 'yogurt greco', 150.0, 'gr'),
  (3, 'MORNING_SNACK', 'mela', 200.0, 'gr'),
  (3, 'LUNCH', 'zuppa del casale', 300.0, 'gr'),
  (3, 'AFTERNOON_SNACK', 'pane', 50.0, 'gr'),
  (3, 'DINNER', 'polpo', 450.0, 'gr'),
  (3, 'BREAKFAST', 'cheerios', 30.0, 'gr'),
  (3, 'MORNING_SNACK', 'frutta secca', 20.0, 'gr'),
  (3, 'AFTERNOON_SNACK', 'prosciutto cotto', 100.0, 'gr'),
  (3, 'DINNER', 'patate', 350.0, 'gr'),
  (4, 'BREAKFAST', 'te', 1.0, 'gr'),
  (4, 'MORNING_SNACK', 'cachi', 200.0, 'gr'),
  (4, 'LUNCH', 'pasta', 80.0, 'gr'),
  (4, 'AFTERNOON_SNACK', 'yogurt greco', 150.0, 'gr'),
  (4, 'DINNER', 'hamburger vegetale', 200.0, 'gr'),
  (4, 'BREAKFAST', 'pane tostato', 40.0, 'gr'),
  (4, 'LUNCH', 'passata di pomodoro', 150.0, 'gr'),
  (4, 'AFTERNOON_SNACK', 'mela', 200.0, 'gr'),
  (4, 'DINNER', 'tris di verdure', 200.0, 'gr'),
  (4, 'BREAKFAST', 'marmellata', 20.0, 'gr'),
  (4, 'LUNCH', 'fior di latte', 150.0, 'gr'),
  (5, 'BREAKFAST', 'yogurt greco', 150.0, 'gr'),
  (5, 'MORNING_SNACK', 'banana', 200.0, 'gr'),
  (5, 'LUNCH', 'pasta', 80.0, 'gr'),
  (5, 'AFTERNOON_SNACK', 'yogurt greco', 150.0, 'gr'),
  (5, 'DINNER', 'roastbeef', 300.0, 'gr'),
  (5, 'BREAKFAST', 'cheerios', 30.0, 'gr'),
  (5, 'LUNCH', 'pesto', 50.0, 'gr'),
  (5, 'AFTERNOON_SNACK', 'banana', 200.0, 'gr'),
  (5, 'DINNER', 'lattuga', 125.0, 'gr'),
  (5, 'LUNCH', 'fesa di tacchino', 120.0, 'gr'),
  (5, 'DINNER', 'panino', 80.0, 'gr'),
  (6, 'BREAKFAST', 'te', 1.0, 'gr'),
  (6, 'MORNING_SNACK', 'mela', 200.0, 'gr'),
  (6, 'AFTERNOON_SNACK', 'pane tostato', 60.0, 'gr'),
  (6, 'BREAKFAST', 'pane tostato', 40.0, 'gr'),
  (6, 'AFTERNOON_SNACK', 'uova di gallina', 120.0, 'gr'),
  (6, 'BREAKFAST', 'marmellata', 20.0, 'gr'),
  (6, 'BREAKFAST', 'burro di arachidi', 150.0, 'gr'),
  (7, 'BREAKFAST', 'te', 300.0, 'gr'),
  (7, 'MORNING_SNACK', 'pera', 200.0, 'gr'),
  (7, 'LUNCH', 'pasta', 80.0, 'gr'),
  (7, 'AFTERNOON_SNACK', 'arance', 200.0, 'gr'),
  (7, 'DINNER', 'pane tostato', 80.0, 'gr'),
  (7, 'BREAKFAST', 'fette biscottate', 40.0, 'gr'),
  (7, 'LUNCH', 'passata di pomodoro', 200.0, 'gr'),
  (7, 'DINNER', 'tris di verdure', 200.0, 'gr'),
  (7, 'BREAKFAST', 'marmellata', 20.0, 'gr'),
  (7, 'LUNCH', 'manzo magro macinato', 200.0, 'gr'),
  (7, 'DINNER', 'fesa di tacchino', 100.0, 'gr'),
  (7, 'DINNER', 'philadelphia', 50.0, 'gr')
) AS v(day_of_week, meal_type, ingredient_name, quantity, unit)
  ON mm.day_of_week = v.day_of_week AND mm.meal_type = v.meal_type
JOIN ingredients i ON i.user_id = u.id AND i.name = v.ingredient_name;

COMMIT;
