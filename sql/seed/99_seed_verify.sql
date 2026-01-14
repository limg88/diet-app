-- Verify seed results
-- Use: psql -v user_email='user@example.com' -v week_start_date='YYYY-MM-DD'

WITH params AS (SELECT :'user_email'::text AS user_email, :'week_start_date'::date AS week_start_date)
SELECT u.email, COUNT(*) AS ingredient_count
FROM ingredients i
JOIN users u ON u.id = i.user_id
JOIN params p ON u.email = p.user_email
GROUP BY u.email;

WITH params AS (SELECT :'user_email'::text AS user_email)
SELECT i.name, i.category
FROM ingredients i
JOIN users u ON u.id = i.user_id
JOIN params p ON u.email = p.user_email
WHERE i.category IS NULL
ORDER BY i.name;

WITH params AS (SELECT :'user_email'::text AS user_email, :'week_start_date'::date AS week_start_date)
SELECT mm.day_of_week, mm.meal_type, COUNT(mi.id) AS items
FROM weekly_menus wm
JOIN menu_meals mm ON mm.weekly_menu_id = wm.id
LEFT JOIN meal_items mi ON mi.menu_meal_id = mm.id
JOIN users u ON u.id = wm.user_id
JOIN params p ON u.email = p.user_email AND wm.week_start_date = p.week_start_date
GROUP BY mm.day_of_week, mm.meal_type
ORDER BY mm.day_of_week, mm.meal_type;

-- Spot check menu items by day/meal
WITH params AS (SELECT :'user_email'::text AS user_email, :'week_start_date'::date AS week_start_date)
SELECT mm.day_of_week, mm.meal_type, i.name, mi.quantity, mi.unit
FROM weekly_menus wm
JOIN menu_meals mm ON mm.weekly_menu_id = wm.id
JOIN meal_items mi ON mi.menu_meal_id = mm.id
JOIN ingredients i ON i.id = mi.ingredient_id
JOIN users u ON u.id = wm.user_id
JOIN params p ON u.email = p.user_email AND wm.week_start_date = p.week_start_date
ORDER BY mm.day_of_week, mm.meal_type, i.name;
