# CODEX PROMPT — Fix bug: Ingredient name not visible on certain desktop resolutions (Menu page) — Milestones

Sei Codex e impersoni uno **sviluppatore senior frontend** (responsive CSS/layout + component library).  
Contesto: repo stabile su GitHub. Il fix deve essere mirato, senza regressioni su mobile e altre pagine.

## Bug
Su **alcune risoluzioni desktop** nella pagina **Menu** il **nome dell’ingrediente non viene visualizzato** (sparisce o risulta invisibile).

Obiettivo: identificare la causa (CSS/layout/rendering) e correggerla, garantendo:
- nome ingrediente sempre visibile su tutte le principali risoluzioni desktop
- niente overflow/overlap che lo nasconde
- comportamento coerente con mobile (dove probabilmente è ok)
- nessun impatto negativo su colonne, truncation/ellipsis, tooltip, editing grams

---

# MILESTONE 0 — Riproduzione precisa e raccolta evidenze
## Attività
1) Riproduci il bug con Chrome DevTools:
   - testa almeno: 1024x768, 1280x720, 1366x768, 1440x900, 1920x1080
   - annota per quali breakpoint/resolution si verifica
2) Identifica esattamente il DOM dell’ingrediente:
   - cella/elemento che dovrebbe mostrare il nome
   - eventuali wrapper (flex/grid), badge, input grams, icons
3) Ispeziona CSS effettivo quando “sparisce”:
   - `display/visibility/opacity`
   - `width/min-width/max-width`
   - `overflow/clip`
   - `z-index` e sovrapposizioni
   - `line-height`, `font-size`, `color` (possibile testo “trasparente” o uguale allo sfondo)
4) Verifica se il testo è nel DOM ma invisibile, o se non viene proprio renderizzato (condizione *ngIf / template / trackBy).

## Deliverable
- `docs/BUG_MENU_INGREDIENT_NAME_DESKTOP.md` con:
  - risoluzioni affette + non affette
  - screenshot/descrizione
  - evidenze (CSS rilevante, DOM, eventuali condizioni template)
  - ipotesi root cause (1-2 candidate)

## DoD
- Riproduzione consistente + root cause preliminare.

---

# MILESTONE 1 — Fix CSS/Layout (cause più probabili)
## Checklist cause tipiche (verifica e correggi quelle pertinenti)
- Colonna/cella con `width: 0` o `flex: 0 0 auto` errato su certi breakpoint
- `min-width` mancante su testo dentro flex (serve spesso `min-width: 0` sul parent per far funzionare ellipsis correttamente)
- `overflow: hidden` su un parent che taglia tutto e lascia solo altri elementi
- `text-overflow: ellipsis` applicato senza `white-space: nowrap` / `max-width`
- `position: absolute` o layering che copre il testo (es. input grams sopra)
- Media query che nasconde il testo accidentalmente (`display:none` su class condivisa)
- Colore testo non leggibile per token/theme su quel breakpoint

## Implementazione fix
- Applica fix nel punto più locale possibile:
  - stile del componente Menu / cell renderer
  - evitando hack globali
- Mantieni l’intento UI:
  - se il nome è lungo: ellipsis + tooltip (se già previsto)
  - ma **non** deve diventare “vuoto” a nessun breakpoint desktop
- Se necessario, ristruttura il layout della cella ingrediente:
  - testo in un container flex con `min-width:0`
  - grams/input allineato a destra con width fissa

## Deliverable
- Fix implementato (CSS + eventuale markup)
- aggiornamento `docs/BUG_MENU_INGREDIENT_NAME_DESKTOP.md` con root cause finale e spiegazione della soluzione

## DoD
- Nome ingrediente visibile in tutte le risoluzioni desktop testate.

---

# MILESTONE 2 — Verifica regressioni (Menu + responsive generale)
## Attività
1) Verifica manuale su:
   - desktop: tutte le risoluzioni sopra
   - mobile: 360x800
2) Verifica casi:
   - ingrediente con nome corto e lunghissimo
   - presenza di più ingredienti nella stessa cella
   - editing grams (se presente) non deve sovrapporsi al testo
   - colonne (giorni/pasti) restano coerenti
3) Se Cypress presente:
   - aggiungi un test piccolo o aggiorna uno esistente:
     - visita pagina Menu
     - verifica che almeno un nome ingrediente noto sia visibile (`be.visible`) su viewport desktop (es. 1366x768)
   - se non c’è un dato noto, usa un selettore per trovare il primo ingredient name e verificare che abbia testo non vuoto.

## Deliverable
- (Opzionale) spec Cypress o aggiornamento test
- `docs/BUG_MENU_INGREDIENT_NAME_DESKTOP.md` completato con checklist di verifica

## DoD
- Fix stabile senza regressioni.

---

## Output finale richiesto
Alla fine, fornisci:
- Root cause (1-2 frasi)
- File modificati
- Steps di verifica (risoluzioni)
- Eventuali note su CSS/flex/ellipsis e perché era “invisibile”

Inizia da **MILESTONE 0**.
