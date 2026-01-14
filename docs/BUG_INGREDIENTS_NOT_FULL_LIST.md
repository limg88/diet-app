# BUG: Ingredients list not full

## Steps to reproduce
1. Ensure backend and frontend are running (already available at http://localhost:3000 and http://localhost:4200).
2. Create a user and more than 20 ingredients via API:
   - Register/login user `bugfix_1768387266@example.com` / `Password123!`.
   - POST 25 ingredients.
3. Open Ingredients page for that user (or call the API) and compare counts.

## Counts
- DB count (ingredients for user): 25
  - SQL: `select count(*) from ingredients i join users u on u.id=i.user_id where u.email = 'bugfix_1768387266@example.com' and i.deleted_at is null;`
- API response (GET /api/ingredients): items=20, total=25, pageSize=20
- UI (Ingredients page): renders `items` only, so it shows 20 rows (same as API items array).

## Evidence
- API call uses default pagination (no pageSize supplied) and backend defaults to pageSize=20.
- Frontend `IngredientsComponent.load()` does not pass page/pageSize and does not implement pagination.

## Preliminary root cause
Backend list endpoint enforces default pagination (pageSize=20). Frontend calls `/ingredients` without page/pageSize and renders only `items`, so the UI is truncated at 20 even when more ingredients exist in DB.

## Fix
- Backend now returns all ingredients when pagination params are omitted.
- Pagination still applies when `page` and/or `pageSize` are provided.
- Added e2e coverage to ensure the default list returns all records.

## Verification
- `npm --prefix backend run test:e2e -- ingredients.e2e-spec.ts` passes.
