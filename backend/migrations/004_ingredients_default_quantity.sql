ALTER TABLE ingredients
ADD COLUMN IF NOT EXISTS default_quantity numeric NOT NULL DEFAULT 100;
