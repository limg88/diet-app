# Capacitor Setup (Milestone 1)

## Install dependencies
From repo root:
```
npm --prefix frontend install
```

## Build web assets for mobile
```
npm --prefix frontend run build:mobile
```

## Capacitor commands
```
npm --prefix frontend run android:add
npm --prefix frontend run android:sync
npm --prefix frontend run android:open
npm --prefix frontend run android:run
```

## Notes
- `webDir` is `dist/browser` (matches Angular output in the Docker build).
- `android:add` will create the `android/` folder (Milestone 2).
