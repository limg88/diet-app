# Diet App (Angular + PrimeNG, NestJS, Postgres)

## Prerequisites
- Node.js LTS
- Docker Desktop
- Git

## Setup
1) Copy env (PowerShell)
```
Copy-Item .env.example .env
```

2) Install dependencies
```
npm install
```

## Run with Docker (PowerShell)
```
docker compose up -d
```

Frontend: http://localhost:4200  
Backend: http://localhost:3000/api/health  
Postgres: localhost:5433

Demo user:
- Email: demo@diet.app
- Password: password123

## Run locally (PowerShell)
1) Start DB
```
docker compose up -d db
```

2) Run migrations
```
npm --prefix backend run migration:run
```

3) Seed demo data (optional)
```
npm --prefix backend run seed:run
```

4) Start dev servers
```
npm run dev
```

## Run with Neon (PowerShell)
1) Set env in `.env`
```
DB_MODE=neon
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
DATABASE_POOL_MAX=5
DATABASE_POOL_IDLE_TIMEOUT_MS=10000
DATABASE_POOL_CONN_TIMEOUT_MS=2000
```

2) Run migrations (Neon)
```
npm --prefix backend run migration:run
```

3) Start dev servers
```
npm run dev
```

## Tests (PowerShell)
```
npm test
```

## App flow
- Register or login at `/login`.
- Use bottom navigation to switch between Weekly Menu, Shopping, and Ingredients.

## Notes
- Timezone is Europe/Rome
- App shows only current week
