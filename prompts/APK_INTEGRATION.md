# CODEX PROMPT — Android APK packaging for diet-app (Capacitor) — Milestones

Sei Codex e impersoni uno **sviluppatore senior Frontend + Mobile packager**.  
Contesto:
- Il database **Neon** è già configurato e funzionante per l’app desktop/web.
- Obiettivo di questo lavoro: rendere l’app eseguibile su **Android come APK**.
- Mantieni lo stack esistente: FE (Angular) + BE (es. NestJS) già funzionanti.  
- Non introdurre regressioni sul web/desktop.

Vincoli operativi:
- Lavoro a milestone.
- Esegui in autonomia build/run/test e sistema eventuali bug.
- Nessuna interazione manuale durante l’esecuzione: usa esecuzione non interattiva e auto-approve.

---

## MILESTONE 0 — Discovery (stack + scelta tecnologia APK)
### Obiettivo
Capire come impacchettare correttamente la SPA e come raggiungere il backend da Android.

### Attività
1) Leggi `AGENTS.md` per vincoli UX, routing, auth e base URL API.
2) Identifica:
   - build output FE (`dist/...`), scripts di build
   - base-href / routing strategy
   - configurazione env FE per API base URL
3) Scegli approccio APK:
   - **Capacitor** (preferito, standard e semplice per SPA Angular)
   - NON usare TWA/PWA salvo motivazioni forti.

### Deliverable
- `docs/ANDROID/00_DECISIONS.md` con:
  - tool scelto (Capacitor)
  - webDir e output build
  - strategia API base URL su Android (dev/prod)

### DoD
- Piano chiaro, nessun cambiamento ancora.

---

## MILESTONE 1 — Integra Capacitor nel Frontend
### Obiettivo
Aggiungere i file e la config per generare progetto Android.

### Attività
1) Nel frontend:
   - installa Capacitor deps (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)
2) Inizializza Capacitor con:
   - `appId` (es. `it.<org>.dietapp`)
   - `appName` coerente
   - `webDir` = cartella output della build Angular
3) Aggiungi/aggiorna `capacitor.config.*`:
   - configura `server` (solo se necessario per dev hot reload)
   - configura `android` defaults
4) Aggiungi script package manager:
   - `build:mobile` (build FE)
   - `android:add` (cap add android, solo se non presente)
   - `android:sync` (cap sync android)
   - `android:open` (cap open android)
   - `android:run` (se praticabile)

### Deliverable
- Capacitor configurato e versionato
- `docs/ANDROID/01_SETUP_CAPACITOR.md` con comandi

### DoD
- Build FE produce i file in `webDir` e `cap sync` non fallisce.

---

## MILESTONE 2 — Progetto Android + build APK debug
### Obiettivo
Creare progetto Android e generare un APK debug installabile.

### Attività
1) Genera progetto:
   - `npx cap add android` (se non esiste)
   - `npx cap sync android`
2) Apri progetto in Android Studio (automatizzabile via `cap open android`) e verifica build Gradle.
3) Genera APK debug:
   - via Gradle task / comando
4) Documenta dove trovare l’APK generato.

### Deliverable
- Cartella `android/` in repo
- `docs/ANDROID/02_BUILD_DEBUG_APK.md` con:
  - prerequisiti (Android Studio, SDK, JDK)
  - build & run su emulator/device
  - path output APK

### DoD
- APK debug generato senza errori.

---

## MILESTONE 3 — Networking: far parlare l’APK con il backend (Neon già OK)
### Obiettivo
Su Android NON esiste `localhost`: serve configurazione API base URL robusta.

### Requisiti
- L’app Android deve chiamare il backend con un **URL raggiungibile dal telefono**:
  - dev: IP LAN del PC (es. `http://192.168.x.x:3000`)
  - prod: hostname pubblico / reverse proxy (se esiste)
- Gestisci CORS sul backend se necessario.
- Evita hardcoding: usare env/config.

### Attività
1) Implementa una strategia di config FE:
   - `environment.android.ts` oppure runtime config (file json) oppure variabili di build
   - definisci `API_BASE_URL`
2) Gestisci Android network security:
   - se usi HTTP in dev, configura `network_security_config` per permettere cleartext su domini/IP di dev
   - preferisci HTTPS per prod
3) Verifica chiamate reali da dispositivo:
   - login (se esiste)
   - fetch dati menu/ingredients/shopping

### Deliverable
- `docs/ANDROID/03_NETWORKING.md` con:
  - come impostare API base URL dev/prod
  - note su CORS e cleartext
  - troubleshooting (ERR_CLEARTEXT_NOT_PERMITTED, CORS)

### DoD
- APK funziona e recupera dati reali dal backend.

---

## MILESTONE 4 — UX mobile hardening (minimo indispensabile)
### Obiettivo
Rendere l’esperienza mobile “usabile”, senza stravolgere UI.

### Attività
- Fix viewport/scroll, safe-area, overflow
- Controlla pagine critiche:
  - Menu (tabella)
  - Ingredients (modal/dropdown)
  - Shopping (table)
  - Collaboration (già noto il bug mobile)
- Migliora tap targets per menu/hamburger e modali

### Deliverable
- `docs/ANDROID/04_MOBILE_QA.md` checklist
- fix UI mirati

### DoD
- Navigazione e principali use case completabili su smartphone.

---

## MILESTONE 5 — Release APK (opzionale ma consigliato)
### Obiettivo
Produrre un APK “release” firmato (localmente) e documentare.

### Attività
- Configura keystore (documenta senza includere segreti)
- Build `assembleRelease`
- Documenta installazione manuale

### Deliverable
- `docs/ANDROID/05_RELEASE_APK.md`

### DoD
- Processo release riproducibile.

---

## Test & qualità (obbligatorio)
- Alla fine di ogni milestone:
  - build FE
  - `cap sync`
  - build Android (debug)
- Se test web esistono, assicurati che non siano rotti (almeno smoke).

---

## Output finale richiesto
Alla fine, riepiloga:
1) file modificati/creati
2) comandi completi per:
   - build web
   - sync android
   - build APK debug
3) come configurare API base URL per Android (dev/prod)
4) note su eventuali limitazioni

Inizia da **MILESTONE 0**.
