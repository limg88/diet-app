ALTER TABLE shopping_items
  ADD COLUMN IF NOT EXISTS item_key text;

UPDATE shopping_items
SET item_key = LOWER(TRIM(name)) || '|' || unit
WHERE item_key IS NULL OR item_key = '';

ALTER TABLE shopping_items
  ALTER COLUMN item_key SET NOT NULL;

WITH duplicates AS (
  SELECT
    user_id,
    week_start_date,
    source,
    item_key,
    MIN(id::text) AS keep_id_text,
    ARRAY_AGG(id) AS ids,
    SUM(quantity) AS total_quantity,
    MAX(warehouse) AS max_warehouse,
    BOOL_OR(purchased) AS any_purchased,
    MAX(ingredient_id::text)::uuid AS keep_ingredient,
    MAX(name) AS keep_name,
    MAX(category) AS keep_category,
    MAX(unit) AS keep_unit
  FROM shopping_items
  GROUP BY user_id, week_start_date, source, item_key
  HAVING COUNT(*) > 1
)
UPDATE shopping_items si
SET
  ingredient_id = COALESCE(si.ingredient_id, d.keep_ingredient),
  name = d.keep_name,
  category = d.keep_category,
  unit = d.keep_unit,
  quantity = d.total_quantity,
  warehouse = d.max_warehouse,
  purchased = d.any_purchased,
  updated_at = now()
FROM duplicates d
WHERE si.id = d.keep_id_text::uuid;

WITH duplicates AS (
  SELECT
    user_id,
    week_start_date,
    source,
    item_key,
    MIN(id::text) AS keep_id_text,
    ARRAY_AGG(id) AS ids
  FROM shopping_items
  GROUP BY user_id, week_start_date, source, item_key
  HAVING COUNT(*) > 1
)
DELETE FROM shopping_items si
USING duplicates d
WHERE si.id = ANY(d.ids) AND si.id <> d.keep_id_text::uuid;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_shopping_items_item_key
  ON shopping_items(user_id, week_start_date, source, item_key);
