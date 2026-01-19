# Android APK Decisions (Milestone 0)

## Tooling
- Packaging tool: Capacitor (preferred for Angular SPA, minimal changes).

## Frontend build output (webDir)
- Angular build uses `@angular/build:application`.
- The Docker build outputs the web bundle to `dist/browser`.
- Capacitor `webDir` will be `dist/browser`.
- Recommended build command for mobile: `npm --prefix frontend run build -- --output-path=dist`.

## API base URL strategy (Android)
- Web uses relative `apiBaseUrl: '/api'` via `frontend/src/environments/environment.ts`.
- Android cannot use `localhost`; it must target a reachable host.
- Plan:
  - Add an Android-specific environment (ex: `environment.android.ts`) with full `API_BASE_URL`.
  - Provide two values:
    - Dev: LAN IP of the dev machine (ex: `http://192.168.x.x:3000/api`).
    - Prod: public HTTPS endpoint/reverse proxy.
  - Select the environment via build configuration (ex: `--configuration android`).

## Notes
- No code changes applied in Milestone 0 beyond documentation.
- Next step is to integrate Capacitor per Milestone 1.
