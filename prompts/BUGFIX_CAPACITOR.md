# CODEX PROMPT — Android S24 UI fixes (safe-area, Menu & Collaborator Menu layout/scroll) — Milestones

Sei Codex e impersoni uno **sviluppatore senior frontend + mobile UI** (Capacitor/Android WebView).  
Contesto: APK già funziona, DB Neon già ok. Ora dobbiamo sistemare problemi UI su **Samsung S24** (Android).

Vincoli:
- Fix mirati, senza regressioni su web/desktop.
- Preferisci soluzioni standard (CSS safe-area, layout constraints, overflow control).
- Mantieni la component library esistente.
- Lavoro a milestone, con verifica su viewport mobile (e se possibile emulatore Android).

---

## Problemi da risolvere

### A) Globale / Navigation
- **Il menu principale si sovrappone ai tasti azione del telefono** (gesture/nav bar → safe area in basso).

### B) Pagina Menu
- **Scroll orizzontale** indesiderato.
- **Background accordion scuro** → preferire chiaro.
- **Elementi del singolo ingrediente su righe differenti** → devono stare **sulla stessa riga** (layout riga ingrediente).
- **La pagina scrolla all’infinito** (scroll “elastico”/content height che cresce o virtual scroll errato).

### C) Pagina Menu Collaborator
- Stessi problemi della pagina Menu, ma:
  - scroll orizzontale **ancora più marcato**
  - scroll infinito

---

# MILESTONE 0 — Repro + Misurazioni (S24-first)
## Attività
1) Riproduci i problemi su mobile viewport (Chrome DevTools: 360x800, 412x915) e, se possibile, su Android emulator.
2) Identifica:
   - layout shell (header/nav/menu)
   - pagina Menu e pagina Menu collaborator (route + component)
   - component accordion e row ingredient
3) Debug scroll:
   - trova elemento che causa overflow-x (DevTools → Layout → overflow, oppure `document.scrollingElement.scrollWidth` vs `clientWidth`)
   - ispeziona cause (100vw, padding, min-width, table/grid)
4) Debug scroll infinito:
   - verifica se c’è virtual scroll / infinite loading / observer che continua ad appendere
   - verifica se height del container cambia ad ogni render
   - controlla eventuali `position: fixed` + `height: 100%` errati

## Deliverable
- `docs/ANDROID/S24_UI_BUGS.md` con:
  - steps riproduzione
  - evidenze per ciascun bug (selector/elemento responsabile)
  - root cause candidate per overflow-x e scroll infinito

## DoD
- Root cause preliminare identificata per tutti i punti A/B/C.

---

# MILESTONE 1 — Safe area: evitare sovrapposizione con gesture/nav bar (Bug A)
## Obiettivo
Il menu principale e le pagine non devono finire sotto la “barra azioni”/gesture area del telefono.

## Attività
1) Implementa safe-area bottom con CSS standard:
   - usa `env(safe-area-inset-bottom)` dove disponibile
   - fallback con padding fisso (minimo) per Android
2) Applica padding/margin nel punto giusto:
   - layout shell / container principale
   - oppure specifico su footer/menu se fixed
3) Se ci sono elementi fixed (bottom bar, floating buttons):
   - aggiungi `padding-bottom` al content per non sovrapporli
4) Verifica anche top safe area (status bar) se presente.

## Deliverable
- Fix CSS/layout
- Aggiornamento `docs/ANDROID/S24_UI_BUGS.md` (soluzione e file toccati)

## DoD
- Nessun elemento UI critico è coperto dai tasti/gesture bar su S24.

---

# MILESTONE 2 — Eliminare scroll orizzontale (Menu + Collaborator Menu)
## Obiettivo
Zero overflow-x su entrambe le pagine.

## Attività
1) Individua l’elemento che “sfora” (table/grid/accordion header/content):
   - rimuovi `width: 100vw` dove causa overflow → usa `width: 100%`
   - aggiusta `min-width` e `flex`:
     - per ellipsis corretto: parent flex con `min-width: 0`
   - limita paddings e margin su container piccoli
2) Se ci sono tabelle/colonne:
   - rendi responsivo con wrapping o layout a card su mobile
   - evita di inserire overflow-x globale come “cerotto” (solo se inevitabile e motivato)
3) Aggiungi una guardrail locale, se serve:
   - container pagina: `overflow-x: clip` o `hidden` SOLO se necessario, documentando il perché.

## Deliverable
- Fix overflow-x su Menu e Collaborator Menu
- `docs/ANDROID/S24_UI_OVERFLOW_FIX.md` con:
  - elementi responsabili
  - modifiche applicate e motivazioni

## DoD
- `clientWidth === scrollWidth` (o differenza trascurabile) su entrambe le pagine a viewport mobile.

---

# MILESTONE 3 — Accordion: background chiaro (Menu + Collaborator Menu)
## Obiettivo
Accordion con background chiaro e coerente con resto UI.

## Attività
1) Identifica il componente accordion e come viene tematizzato (tokens/theme/CSS).
2) Applica override **scoped**:
   - solo per queste pagine o per il componente menu (evita impatti globali indesiderati)
3) Verifica contrasto testo e stati hover/expanded.

## Deliverable
- Override styles
- note in `docs/ANDROID/S24_UI_BUGS.md`

## DoD
- Background accordion chiaro su mobile e desktop non degradato.

---

# MILESTONE 4 — Layout riga ingrediente: elementi sulla stessa riga
## Obiettivo
Nel singolo ingrediente (nome, grams/qty, eventuali azioni) deve stare su **una sola riga** (con ellipsis sul nome se lungo).

## Attività
1) Identifica il template “ingredient row”.
2) Applica layout robusto:
   - container `display:flex; align-items:center; gap: ...`
   - nome: `flex: 1 1 auto; min-width:0; white-space:nowrap; text-overflow:ellipsis; overflow:hidden`
   - grams/input: width fissa o `flex: 0 0 <px>`
   - azioni: `flex: 0 0 auto`
3) Verifica su:
   - nomi lunghi
   - input focus (tastiera on-screen) non deve rompere layout

## Deliverable
- Fix layout riga ingrediente su entrambe le pagine
- `docs/ANDROID/S24_UI_ROW_LAYOUT.md` con screenshot/descrizione prima/dopo

## DoD
- Riga ingrediente resta su una linea, senza overlap e senza sforare.

---

# MILESTONE 5 — Fix “scroll infinito” (Menu + Collaborator Menu)
## Obiettivo
La pagina non deve scrollare all’infinito né continuare ad aggiungere spazio/righe.

## Attività
1) Identifica origine:
   - infinite loader/observer
   - virtual scroll misconfig (itemSize, viewport height, container height)
   - append ripetuto di dati in state (duplicazione array ad ogni refresh)
   - CSS height calc errata (es. `min-height: 100vh` combinata con padding dinamici)
2) Implementa fix:
   - se è virtual scroll: configura correttamente viewport e item size, e assicurati che il datasource sia stabile
   - se è duplicazione dati: correggi reducer/state update (no concat ripetuto)
   - se è observer: disabilita su mobile o metti condizioni e cleanup `unsubscribe`
   - se è CSS: sistema height/overflow del container principale pagina
3) Aggiungi un guardrail:
   - log o assert (dev) per evitare che la lista cresca senza motivo

## Deliverable
- Fix definitivo
- `docs/ANDROID/S24_UI_INFINITE_SCROLL_ROOTCAUSE.md` con:
  - root cause finale
  - file e patch
  - come verificare

## DoD
- Scrolling termina correttamente, nessuna crescita continua di contenuto.

---

# MILESTONE 6 — QA finale (S24 profile) + regressioni
## Attività
1) Verifica su viewport:
   - 360x800
   - 412x915 (tipico S24)
2) Checklist:
   - nessun overflow-x (Menu e Collaborator Menu)
   - safe-area ok: nessuna sovrapposizione con gesture/nav bar
   - accordion chiaro
   - ingredient row 1-line
   - niente scroll infinito
3) Verifica web/desktop velocemente per non introdurre regressioni (almeno smoke).
4) Se Cypress esiste, aggiungi un test “layout smoke” solo se già avete pattern (opzionale).

## Deliverable
- `docs/ANDROID/S24_UI_QA.md` checklist completata
- riepilogo file toccati

## DoD
- Bug chiusi e verificati.

---

## Output finale richiesto
Alla fine, fornisci:
- Root cause per ciascun problema A/B/C
- File modificati
- Passi di verifica su S24 (viewport)
- Eventuali trade-off (es. wrap vs ellipsis)

Inizia da **MILESTONE 0**.
