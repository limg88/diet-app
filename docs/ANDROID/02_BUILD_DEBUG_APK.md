# Build Android Debug APK (Milestone 2)

## Prerequisites
- Android Studio (includes SDK + build-tools)
- JDK 21 (Capacitor Android compileOptions target Java 21)
- ANDROID_SDK_ROOT set (or Android Studio default SDK path)

## Android project
- The Android project lives in `frontend/android/`.
- If the Gradle wrapper is missing, regenerate the platform:
  1) Remove `frontend/android/`
  2) Run `npm --prefix frontend run android:add`
  3) Run `npm --prefix frontend run android:sync`

## Build debug APK
From repo root:
```
cd frontend/android
.\gradlew.bat assembleDebug
```

If `JAVA_HOME` and the Android SDK are not global, you can run:
```
$env:JAVA_HOME="C:\Java\jdk-21.0.9"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:GRADLE_USER_HOME="C:\dev\gradle-home"
.\gradlew.bat assembleDebug
```

## APK output path
- `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## Run on device/emulator
```
npm --prefix frontend run android:run
```

## Notes
- If you see `ERR_CLEARTEXT_NOT_PERMITTED`, see `docs/ANDROID/03_NETWORKING.md` (Milestone 3).
