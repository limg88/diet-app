# Seed scripts (dieta.xlsx)

## Files
1. `01_seed_ingredients.sql`
2. `02_seed_menu_user.sql`
3. `03_seed_menu_collaborator.sql` (no-op for now)
4. `99_seed_verify.sql`

## How to run (manual)
- Use `psql` variables for email and week start date.
- Execute scripts in order inside a transaction-capable SQL client.
- Examples:
  - `psql -v user_email='giovanni.limatola@gmail.com' -f sql/seed/01_seed_ingredients.sql`
  - `psql -v user_email='giovanni.limatola@gmail.com' -v week_start_date='2026-01-12' -f sql/seed/02_seed_menu_user.sql`
  - `psql -v user_email='ggiacobonep@gmail.com' -v week_start_date='2026-01-12' -f sql/seed/03_seed_menu_collaborator.sql`
  - `psql -v user_email='giovanni.limatola@gmail.com' -v week_start_date='2026-01-12' -f sql/seed/99_seed_verify.sql`
- Review `00_seed_report.md` before execution.
- Use the verify script for sanity checks.

## Rollback
- Each script includes `BEGIN;` and `COMMIT;` with a commented `ROLLBACK;` placeholder.
- Use `ROLLBACK;` instead of `COMMIT;` if needed.
