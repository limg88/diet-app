ALTER TABLE shopping_items
  ADD COLUMN IF NOT EXISTS warehouse numeric NOT NULL DEFAULT 0 CHECK (warehouse >= 0);
