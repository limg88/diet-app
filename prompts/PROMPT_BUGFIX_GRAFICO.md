# CODEX PROMPT — Fix bug: Mobile “Collab” page width is off and menu disappears — Milestones

Sei Codex e impersoni uno **sviluppatore senior frontend** (con competenze responsive/layout).  
Contesto: progetto già in versione consistente su GitHub. Il fix deve essere minimale, coerente con il design system esistente e non deve introdurre regressioni desktop.

## Bug
Nella versione **mobile** della sezione **Collab**:
- la larghezza risulta “sfasata” (overflow/viewport mismatch)
- il menu (navbar/sidebar/drawer) **scompare** oppure non è più accessibile

Obiettivo: correggere layout e navigazione su mobile, garantendo:
- nessun overflow orizzontale
- menu sempre accessibile (hamburger/drawer/bottom nav, secondo pattern del progetto)
- comportamento coerente con le altre pagine

---

# MILESTONE 0 — Riproduzione e raccolta evidenze (mobile-first)
## Attività
1) Avvia FE (e BE se serve) e riproduci su mobile:
   - Chrome DevTools device toolbar (es. 360x800, 390x844)
2) Raccogli evidenze:
   - screenshot/descrizione
   - console errors/warnings
   - verifica se c’è overflow orizzontale (scroll laterale)
3) Identifica:
   - route della pagina collab
   - componente pagina + layout shell (header/sidebar/container)
   - CSS coinvolto (global styles, page styles, component styles)

## Deliverable
- `docs/BUG_COLLAB_MOBILE_LAYOUT.md` con:
  - steps riproduzione
  - viewport testati
  - ipotesi root cause (overflow, width:100vw, position fixed, nested flex, ecc.)
  - file/componenti candidati

## DoD
- Bug riprodotto e componenti coinvolti identificati.

---

# MILESTONE 1 — Fix overflow / width mismatch (cause più comuni)
## Checklist cause tipiche (verifica e correggi se presenti)
- Uso di `width: 100vw` su container interno (spesso causa overflow per scrollbar) → preferisci `width: 100%`
- `min-width` troppo alto su card/table/form o su colonne grid → rendi responsivo con breakpoints
- padding/margin che sommano oltre il 100% in layout flex
- elementi assoluti/fissi che escono dal viewport
- tabelle o liste non responsive (serve wrapping o overflow-x auto con contenitore)
- immagini/icones senza max-width

## Implementazione
- Applica fix nel punto giusto (preferibilmente stile del componente o layout shell, non hack globali)
- Aggiungi una regola “guardrail” per mobile:
  - container principale: `max-width: 100%`, `overflow-x: hidden` SOLO se necessario e motivato
- Mantieni l’allineamento con il resto dell’app

## Deliverable
- Fix CSS/HTML applicato
- aggiornamento `docs/BUG_COLLAB_MOBILE_LAYOUT.md` con:
  - root cause confermata
  - cambi applicati e perché

## DoD
- Nessun overflow orizzontale su mobile.

---

# MILESTONE 2 — Fix “menu disappears” su mobile (nav accessibile)
## Attività
1) Capisci quale menu “scompare”:
   - header/topbar?
   - sidebar?
   - hamburger/drawer?
   - bottom nav?
2) Verifica condizioni responsive:
   - breakpoint che nasconde il menu per quella route
   - `z-index` dietro al contenuto
   - `position: fixed` che collassa per height/overflow parent
   - overlay/drawer che si chiude subito (state/route change)
3) Implementa correzione coerente:
   - se esiste pattern hamburger/drawer, assicurati che sia presente anche in Collab
   - se la pagina Collab usa un layout diverso, riallineala al layout standard (preferibile)
   - correggi `z-index` e stacking context se necessario
   - garantisci aree tappabili e safe-area iOS (se rilevante)

## Deliverable
- Menu mobile nuovamente accessibile in Collab
- nota in doc con “come verificare”

## DoD
- Su mobile, dalla pagina Collab il menu è sempre raggiungibile e funziona come nelle altre pagine.

---

# MILESTONE 3 — Hardening + mini test (se possibile)
## Attività
- Verifica viewport:
  - 360x800, 390x844, 414x896
- Verifica orientamento landscape
- Verifica altre pagine: il fix non deve rompere Menu/Ingredients/Shopping
- Se Cypress esiste:
  - aggiungi uno smoke test responsive (se già avete pattern):
    - visita /collab
    - verifica assenza di overflow (approccio indiretto: controlla che il body non superi viewport)
    - verifica presenza del bottone menu/hamburger e che apra la navigation

## Deliverable
- eventuale test + aggiornamento doc

## DoD
- Fix stabile e senza regressioni evidenti.

---

## Output finale richiesto
Alla fine, fornisci:
- Root cause (1-2 frasi)
- File modificati
- Steps per verificare su mobile
- Eventuali considerazioni su breakpoints/layout

Inizia da **MILESTONE 0**.