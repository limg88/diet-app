# CODEX PROMPT — Implement missing feature: Shopping List “This week” (Warehouse + To Purchase) — Milestones

Sei Codex e impersoni uno **sviluppatore senior** (frontend-first, con attenzione a data model e persistenza).
⚠️ Contesto importante: l’utente ha finalmente ottenuto una **versione consistente** dell’applicativo e l’ha **versionata su GitHub**.  
Devi quindi lavorare in modo “production-grade”:
- **non rompere** comportamenti esistenti
- modifiche minimali e ben isolate
- se possibile, crea commit piccoli e descrittivi (se il flusso lo prevede)
- leggi `AGENTS.md` (o più file) presenti nella repo per vincoli/requisiti

Obiettivo: completare la funzionalità mancante nella sezione **Shopping List**, tabella **This week**:
- aggiungere 2 colonne: **Warehouse** e **To Purchase**
- **Warehouse**: campo numerico **editabile**
- **To Purchase**: valore calcolato = **Quantity - Warehouse**
  - deve aggiornarsi in tempo reale quando Warehouse cambia
  - gestire casi limite (Warehouse vuoto, negativo, > Quantity)

Vincoli:
- Mantieni lo stack e la component library già presente (PrimeNG/Material/ecc.).
- Rispetta lo stile UI esistente e i pattern (form, table editing, state management).
- Il dato Warehouse deve essere **persistito** (DB/Backend o storage usato dal progetto).
- Non introdurre nuove dipendenze se non indispensabile.

---

## MILESTONE 0 — Analisi repo e aggancio al modello dati esistente
### Attività
1) Leggi tutti gli `AGENTS.md` in repo per capire come è gestita la Shopping List e i dati della settimana corrente.
2) Individua:
   - componente/pagina “Shopping List”
   - tabella “This week”
   - modello dati della riga (es. item/ingredient row)
   - dove viene calcolato `Quantity` e come viene persistito lo stato “acquistato”/simili (se presente)
3) Definisci dove vive `Warehouse`:
   - è un campo della riga shopping “This week”?
   - è legato all’ingrediente (global stock) oppure alla settimana corrente?
   - scegli l’approccio **coerente con il progetto** e documentalo.

### Deliverable
- `docs/SHOPPING_WAREHOUSE_DESIGN.md` con:
  - file/componenti coinvolti
  - decisione sul modello e persistenza (con motivazione)
  - mapping UI → model → persistence

### DoD
- È chiaro dove verrà salvato `Warehouse` e come si ricalcola `To Purchase`.

---

## MILESTONE 1 — Data model + persistence (Warehouse)
### Attività
1) Aggiungi il campo `warehouse` (o naming coerente) al modello corretto.
2) Aggiorna:
   - DTO / entity / schema (se backend + DB)
   - migrations (se necessarie)
   - API/endpoint (se necessari)
   - servizi FE di lettura/scrittura
3) Default:
   - se non presente, `warehouse = 0`
   - garantisci retrocompatibilità con dati già salvati

### Deliverable
- Modello aggiornato + eventuale migration
- eventuale aggiornamento endpoint/service
- nota in `docs/SHOPPING_WAREHOUSE_DESIGN.md` su retrocompatibilità

### DoD
- `Warehouse` viene letto e salvato correttamente senza rompere dataset esistenti.

---

## MILESTONE 2 — UI Table: colonne Warehouse (editable) e To Purchase (computed)
### Requisiti UI
- Aggiungi due colonne alla tabella **This week** nell’ordine più naturale (es: … Quantity | Warehouse | To Purchase).
- **Warehouse**:
  - input numerico editabile inline (pattern coerente con il progetto: cell editing / row editing / modal)
  - validazione: numero >= 0
  - se l’utente inserisce vuoto → trattalo come 0
  - se inserisce > Quantity: consentito o clamp?  
    - implementa regola coerente (preferibilmente clamp a Quantity o warning UI); documenta la scelta.
- **To Purchase**:
  - readonly
  - calcolo: `max(Quantity - Warehouse, 0)` (se scegli di evitare negativi)
  - aggiornamento immediato quando Warehouse cambia
- Persistenza:
  - salva `Warehouse` quando l’utente conferma (blur/enter/save row) seguendo il pattern già usato.

### Deliverable
- Tabella aggiornata
- styling coerente (colonne numeriche allineate, larghezze sensate)
- `docs/SHOPPING_WAREHOUSE_UI_NOTES.md` con passi di verifica

### DoD
- Warehouse editabile, persistito, To Purchase corretto e reattivo.

---

## MILESTONE 3 — Hardening + mini test (se presenti)
### Attività
- Gestisci edge cases:
  - Quantity null/undefined
  - Warehouse null/undefined/string
  - Quantity 0
  - Warehouse > Quantity
  - rounding/decimali (scegli standard: int o decimale, coerente con app)
- Se Cypress esiste:
  - aggiungi uno smoke test:
    - modifica Warehouse → verifica aggiornamento To Purchase → refresh pagina → valore Warehouse persistito
- Aggiorna eventuali `data-cy` se necessari (senza rompere test esistenti)

### Deliverable
- `docs/SHOPPING_WAREHOUSE_QA.md` checklist
- eventuali test Cypress

### DoD
- Funzione stabile, non flaky, pronta per merge.

---

## Output finale richiesto
Alla fine:
1) Riepilogo implementazione (model/persistence/UI)
2) File modificati/creati
3) Comandi per avviare app e (se presenti) test
4) Note su scelte (clamp/negativi/decimali) e retrocompatibilità

Inizia subito da **MILESTONE 0**, poi procedi con la **MILESTONE 1**, poi con la **MILESTONE 2** e infine con la **MILESTONE 3**
