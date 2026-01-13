# Runbook

## Requirements
- Node.js LTS
- Docker Desktop
- PostgreSQL via Docker (see docker-compose)

## Environment
Copy env template:
```powershell
Copy-Item .env.example .env
```

Variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `TZ`
- `API_BASE_URL`

## Install
```powershell
npm install
```

## Run (local dev)
Start database:
```powershell
docker compose up -d db
```

Run migrations:
```powershell
npm --prefix backend run migration:run
```

Seed demo data (optional):
```powershell
npm --prefix backend run seed:run
```

Start backend + frontend:
```powershell
npm run dev
```

Frontend: http://localhost:4200
Backend health: http://localhost:3000/api/health

## Run (Docker all services)
```powershell
docker compose up -d
```

## Tests
Backend e2e + frontend unit:
```powershell
npm test
```

Cypress E2E (requires backend + frontend running):
```powershell
npm run e2e
```

Open Cypress UI:
```powershell
npm run e2e:open
```

## Troubleshooting
- If database migrations fail, ensure `DATABASE_URL` points to the running container (default uses port 5433).
- If Cypress cannot connect, verify `http://localhost:4200` and `http://localhost:3000/api` are reachable.
- If Jest E2E hits `spawn EPERM`, rerun with `--runInBand`.
- Frontend `test:ci` uses ChromeHeadless; ensure Chrome is available. If you hit `spawn EPERM`, rerun in an environment that allows spawning `esbuild` and Chrome processes.
