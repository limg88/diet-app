# CODEx PROMPT — Bug Hunt + Cypress E2E + UX/UI Responsive (Milestones)

Sei Codex in modalità agente. Nella cartella corrente è già presente un applicativo funzionante e un file `AGENTS.md` che contiene il prompt originale con cui l’app è stata generata: usalo come riferimento per capire requisiti, scopo, vincoli e scelte architetturali.

Obiettivo: lavorare in 3 “ruoli” (Senior Developer, Senior Test Manager, UX/UI Designer) e consegnare fix, test E2E Cypress e miglioramenti UI responsive (mobile + desktop), organizzando il lavoro in milestone.

## Regole generali
- Lavora in modo incrementale e sicuro: piccoli step, commit frequenti (se previsto), e descrizioni chiare.
- Non introdurre breaking changes non necessarie.
- Ogni modifica deve avere: motivo, impatto, e come verificarla.
- Se mancano dipendenze / script / configurazioni, aggiungile nel modo più standard possibile per lo stack già presente.
- Se trovi ambiguità tra codebase e prompt originale, privilegia il prompt originale e documenta il delta.
- Produci output “actionable”: file creati/modificati, comandi di esecuzione, e checklist di verifica.

---

# MILESTONE 0 — Onboarding & Baseline (lettura e inventario)
## Deliverable
1) `docs/BASELINE.md` con:
   - stack (FE/BE), versioni, entrypoints, script di run/build/test
   - mappa feature principali (dalla UI e dal prompt originale)
   - elenco rotte/pagine principali + componenti critici
2) `docs/KNOWN_ISSUES.md` inizialmente vuoto (poi popolato nelle milestone successive)

## Attività
- Leggi `AGENTS.md` e sintetizza requisiti/feature chiave.
- Scansiona repository: struttura, moduli, configurazioni, env vars, test già presenti.
- Esegui l’app (o parti essenziali) e verifica che si avvii localmente.

---

# MILESTONE 1 — Senior Developer: Bug hunting (tecnici + funzionali)
## Obiettivo
Individuare bug e debiti tecnici che impattano stabilità, sicurezza, performance e correttezza funzionale. Correggerli con cambiamenti minimali e testabili.

## Deliverable
1) `docs/BUG_REPORT.md` con tabella:
   - ID, tipo (tecnico/funzionale), severità, descrizione, come riprodurre, root cause, fix, file toccati, note
2) Fix applicati nel codice + eventuali test unit/integration minimi se esistono già framework.
3) Aggiornamento `docs/KNOWN_ISSUES.md` per ciò che viene rimandato (con motivazione e workaround).

## Cosa cercare (checklist)
- Errori runtime/console, call API fallite, race condition, null/undefined.
- Validazioni mancanti, gestione errori e loading states.
- Edge cases: input vuoti, date/ timezone (Europe/Rome), permessi/ruoli (se esistono), mobile viewport.
- Problemi di performance: render inutili, query ripetute, N+1, payload grandi.
- Config/env: variabili mancanti, default sbagliati, build non deterministica.
- Security baseline: injection, XSS, CORS, secret in repo, log sensibili.

## Definition of Done (M1)
- App si avvia e flusso principale è utilizzabile.
- Bug critici e alti risolti o documentati con workaround.
- `BUG_REPORT.md` aggiornato e coerente.

---

# MILESTONE 2 — Senior Test Manager: Scenari Cypress per tutti gli use case
## Obiettivo
Scrivere una suite Cypress E2E che copra TUTTI gli use case descritti in `AGENTS.md` + quelli emersi dalla UI.

## Deliverable
1) `docs/TEST_PLAN_E2E.md` con:
   - elenco use case → mapping su spec Cypress
   - dati di test (seed/fixture), precondizioni, assunzioni
   - strategia selettori (`data-cy`), gestione auth, cleanup
2) Setup Cypress (se non presente):
   - configurazione, script `npm run e2e` / `pnpm e2e` ecc.
3) Spec Cypress:
   - una spec per macro-area o use case group (nome parlante)
   - test positivi + negativi + edge case
4) Aggiornamento UI con `data-cy` dove serve (minimo indispensabile, senza sporcare il markup)

## Linee guida Cypress
- Usa selettori stabili: `data-cy`.
- Evita attese arbitrarie (`cy.wait(1000)`): preferisci `intercept`, `should`, `contains`.
- Test indipendenti: ogni spec deve poter girare da sola.
- Se backend non è disponibile: prevedi modalità mock (intercept + fixtures) oppure seed DB.
- Inserisci una pipeline minima per run headless.

## Definition of Done (M2)
- `npm run e2e` (o equivalente) esegue la suite senza flaky evidenti.
- Copertura: 100% use case mappati nel test plan.
- Report chiaro su cosa è coperto e cosa no.

---

# MILESTONE 3 — UX/UI Designer: UI migliorata e fully responsive (mobile + desktop)
## Obiettivo
Migliorare usabilità, accessibilità e resa responsive senza stravolgere l’architettura. Layout coerente, navigazione chiara, form leggibili, touch-friendly.

## Deliverable
1) `docs/UI_UX_IMPROVEMENTS.md` con:
   - problemi rilevati (mobile/desktop) e soluzioni
   - regole di spacing, typography, component usage
2) Implementazione UI:
   - layout responsive (breakpoint), navbar/menu adattivi
   - miglioramenti form (validation messages, label, input size)
   - miglioramenti feedback (toast, empty state, error state)
   - accessibilità minima: focus states, aria-label dove serve, contrast, tab order
3) (Opzionale) `docs/RESPONSIVE_CHECKLIST.md` con checklist di verifica manuale

## Linee guida
- Mobile-first: garantisci che i flussi principali siano completabili da smartphone.
- Riduci frizione: CTA evidenti, spaziature coerenti, testi chiari.
- Non cambiare component library se già presente; lavora con essa (es. PrimeNG, Material, ecc.).
- Aggiungi `data-cy` con attenzione per non rompere i test.

## Definition of Done (M3)
- UI usabile in viewport 360x800 e 1366x768.
- Nessun overflow orizzontale indesiderato.
- Navigazione e azioni principali sempre raggiungibili.

---

# MILESTONE 4 — Hardening finale & Consegna
## Deliverable
1) `docs/RUNBOOK.md`:
   - requisiti, install, run, env, troubleshooting
   - comandi: lint/build/test/e2e
2) Verifica finale:
   - bug report chiuso/aggiornato
   - test plan allineato ai test presenti
   - checklist responsive completata

## Definition of Done (M4)
- Repo “ready to handoff”: chiunque clona e riesce ad avviare + lanciare test.
- Documentazione minima ma completa.

---

## Operatività: come devi procedere (ordine obbligatorio)
1) Esegui M0, poi M1, poi M2, poi M3, poi M4.
2) Alla fine di ogni milestone aggiorna i file docs e lascia note su cosa hai fatto e come verificarlo.
3) Non passare alla milestone successiva se quella corrente non rispetta la DoD.

Fai partire subito MILESTONE 0.
