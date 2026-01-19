# Android Networking (Milestone 3)

## API base URL (dev/prod)
The Android build uses `frontend/src/environments/environment.android.ts`.

Edit this value before building the APK:
```
apiBaseUrl: 'http://<LAN_IP>:3000/api'
```

Examples:
- Device on same Wi‑Fi: `http://192.168.1.50:3000/api`
- Android emulator: `http://10.0.2.2:3000/api`

For production, use your HTTPS endpoint (reverse proxy / public host).

## Build command (Android config)
```
npm --prefix frontend run build:android
npx --prefix frontend cap sync android
```

## Cleartext HTTP (debug)
Debug builds allow HTTP via:
- `frontend/android/app/src/debug/AndroidManifest.xml`
- `frontend/android/app/src/debug/res/xml/network_security_config.xml`

For release, use HTTPS and remove/adjust cleartext settings.

## Backend CORS
If running the backend outside the APK host domain, ensure CORS allows the Android origin.
For local dev over HTTP, allow the device/emulator origin in the backend config.

## Troubleshooting
- `ERR_CLEARTEXT_NOT_PERMITTED`: ensure debug manifest + network security config exist, or use HTTPS.
- `Failed to fetch`: verify device can reach the backend host/IP and that firewall allows port 3000.
