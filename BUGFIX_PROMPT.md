# CODEX PROMPT — Fix bug UI/UX (Menu / Ingredients / Shopping) + Milestones

Sei Codex e impersoni uno **sviluppatore senior full-stack** (frontend-first).  
Nella cartella corrente è presente il progetto dell’app + un file `AGENTS.md` (o più di uno) con requisiti e contesto: **leggili prima di modificare qualsiasi cosa**.

Obiettivo: **sistemare i bug elencati** su:
- Pagina **Menu**
- Pagina **Ingredients**
- Pagina **Shopping**

Vincoli:
- Mantieni lo stack e la component library già in uso (es. PrimeNG o altro).
- Evita refactor massivi: fai fix mirati e testabili.
- Se esistono test (unit/e2e) aggiorna o aggiungine di minimi per prevenire regressioni.
- Ogni milestone deve produrre deliverable concreti e verificabili.

---

## MILESTONE 0 — Setup, riproduzione e mappatura
### Attività
1) Leggi tutti gli `*.md` presenti e riassumi i requisiti UI rilevanti.
2) Avvia l’app localmente, individua le route/pagine:
   - Menu
   - Ingredients
   - Shopping
3) Riproduci ogni bug e annota:
   - passi per riprodurre
   - file/componenti coinvolti
   - causa probabile (layout, state, form binding, ecc.)

### Deliverable
- `docs/BUGFIX_PLAN.md` con tabella:
  - Bug, pagina, severità, riproduzione, file toccati, strategia fix, note

### DoD
- Tutti i bug sono riproducibili o motivatamente “non riproducibili” (con spiegazione).

---

## MILESTONE 1 — Pagina Menu: layout colonne + ingredient name truncation + grammi editabili
### Bug da risolvere
1) **La colonna dei giorni dev’essere a sinistra**
   - Sposta la colonna “giorni” come prima colonna del layout/table/grid.
2) **La colonna breakfast è più stretta rispetto alle altre**
   - Uniforma larghezza colonne pasti (breakfast/lunch/dinner/…).
3) **Nome ingrediente deve essere troncato per non rompere la UI**
   - Aggiungi ellissi (`text-overflow: ellipsis`) e vincolo di max width.
   - Tooltip opzionale su hover/tap (mobile-friendly) per vedere il nome completo.
4) **Grammi modificabili e prevalorizzati con quantità di default definita in ingredienti**
   - I grammi devono essere input editabili per riga/ingrediente.
   - Default value = “quantità di default” dell’ingrediente (dalla pagina Ingredients / data model).
   - Persistenza: se già salvati nel menu, prevale il valore salvato; altrimenti usa default.
   - Validazioni minime: numero > 0, gestione empty, blur/save coerente con UX esistente.

### Deliverable
- Fix implementati sulla pagina Menu.
- (Se presente) aggiornamento types/models per includere `defaultGrams` / `defaultQuantity` e campo “grams” per item del menu.
- `docs/BUGFIX_NOTES_MENU.md` con:
  - cosa è stato cambiato
  - come verificare manualmente (passi)

### DoD
- Giorni a sinistra, colonne pasti uniformi, testo ingredienti non rompe layout, grammi editabili e correttamente prevalorizzati.

---

## MILESTONE 2 — Pagina Ingredients: dropdown overflow + category select estendibile + modal edit
### Bug da risolvere
1) **Modal Add ingredient: dropdown Allowed Meals coperto da overflow**
   - Risolvi overlay/append target della dropdown (es. appendTo body / portal / overlay container).
   - Assicurati che il menu a tendina sia cliccabile e non tagliato.
2) **Category dev’essere una select con opzioni predefinite (aggiungibili)**
   - Implementa:
     - elenco categorie predefinite (iniziale)
     - possibilità di aggiungere nuove categorie (UI + persistenza)
   - Salvataggio: dove stanno i dati? (backend/db/local storage) — usa la soluzione esistente nel progetto.
   - UI: se library supporta “editable select/combobox”, usala; altrimenti aggiungi pulsante “Add category”.
3) **Click su “modifica” non fa nulla: deve aprire modal Edit ingredient**
   - Implementa modal “Edit ingredient” con campi precompilati.
   - Salvataggio e refresh list.
   - Gestisci cancel/close.
   - Mantieni allineamento con “Add ingredient” (stesso form component riusabile se possibile).

### Deliverable
- Fix implementati sulla pagina Ingredients.
- `docs/BUGFIX_NOTES_INGREDIENTS.md` con steps di verifica.
- (Opzionale) `docs/DATA_MODEL_CATEGORIES.md` se introduci entità/endpoint per categorie.

### DoD
- Dropdown Allowed Meals funzionante nella modal.
- Category selezionabile da set predefinito + aggiunta nuova categoria possibile e persistente.
- Modal Edit ingredient appare e salva correttamente.

---

## MILESTONE 3 — Pagina Shopping: off-menu create/edit via modali
### Bug da risolvere
1) **Per aggiunta off menu usare modale come Add ingredient**
   - Implementa modal “Add Off menu” (pattern identico a Add ingredient).
   - Campi coerenti con il modello (nome, qty/grams, note, categoria?, ecc. come da progetto).
2) **Per modifica off menu deve comparire modal Edit Off menu**
   - Implementa modal “Edit Off menu” precompilata.
   - Save/Cancel e aggiornamento lista.

### Deliverable
- Fix Shopping implementati.
- `docs/BUGFIX_NOTES_SHOPPING.md` con steps di verifica.

### DoD
- Off menu aggiungibile e modificabile esclusivamente tramite modali, coerenti con UX dell’app.

---

## MILESTONE 4 — Hardening: regressioni, styling, mini test
### Attività
- Verifica manuale completa (happy path + edge):
  - ingredienti con nome lunghissimo
  - dropdown in modale su viewport mobile
  - grams vuoti/0/valori grandi
  - categorie nuove + riapertura app
- Se Cypress è presente:
  - aggiungi/aggiorna 1–3 spec minime o smoke test per:
    - apertura modali add/edit ingredient
    - edit grams in menu
    - add/edit off menu shopping
- Aggiorna documentazione rapida per run e verifica.

### Deliverable
- `docs/QA_CHECKLIST.md`
- eventuali test aggiunti
- riepilogo file toccati

### DoD
- Nessun errore console critico.
- UI non si rompe su mobile.
- Fix verificati e documentati.

---

## Output finale richiesto
Al termine, fornisci:
1) elenco bug risolti (con riferimento ai punti)
2) elenco file modificati/creati
3) comandi per eseguire app + test
4) note su eventuali trade-off o TODO rimasti

Inizia subito da **MILESTONE 0**.
