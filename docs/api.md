# API contract (v1)

Base path: /api
Auth: Bearer JWT

## Health
GET /health -> 200 { status: "ok" }

## Auth
POST /auth/register { email, password } -> 201
POST /auth/login { email, password } -> 200 { accessToken }

## Ingredients
GET /ingredients?search=&category=&unit=&mealType=&includeDeleted=&sort=&page=&pageSize=
GET /ingredients/categories
POST /ingredients { name, category?, defaultUnit, defaultQuantity, allowedMealTypes? }
GET /ingredients/:id
PUT /ingredients/:id { name?, category?, defaultUnit?, defaultQuantity?, allowedMealTypes? }
DELETE /ingredients/:id (soft delete preferred)

## Menu (current week only)
GET /menu/current?ownerUserId= -> returns weekStartDate, days[7]{ dayOfWeek, meals[5]{ mealType, items[] } }
POST /menu/current/meals/:mealId/items?ownerUserId= { ingredientId, quantity, unit }
PUT /menu/current/items/:itemId?ownerUserId= { quantity, unit }
DELETE /menu/current/items/:itemId?ownerUserId=

Server validates:
- ingredient exists and belongs to user
- ingredient allowedMealTypes contains mealType (unless empty/null)
- unit is allowed
- quantity > 0

## Shopping (current week only)
GET /shopping/current?search=&category=&unit=&source=&purchased=&sort=
PATCH /shopping/current/items/:id { purchased }
PATCH /shopping/current/items/:id/warehouse { warehouse }
POST /shopping/current/off-menu { name, category?, quantity, unit }
PUT /shopping/current/off-menu/:id { name?, category?, quantity?, unit?, category? }
DELETE /shopping/current/off-menu/:id

## Collaboration
POST /collaboration/invites { email }
GET /collaboration/invites
POST /collaboration/invites/:id/accept
POST /collaboration/invites/:id/reject
DELETE /collaboration/invites/:id
GET /collaboration/partners
