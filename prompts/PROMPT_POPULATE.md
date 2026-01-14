# CODEX PROMPT — SQL seed scripts from docs/dieta.xlsx (Ingredients + Menu user/collaborator) with category reconciliation & dedup — Milestones

Sei Codex e impersoni uno **sviluppatore senior** con competenze data engineering.  
Nel repository esiste uno schema DB già definito. In `docs/` c’è `dieta.xlsx` con più fogli.

Obiettivo: generare **script SQL** (NON eseguirli) per popolare il DB con:
1) ingredienti dal foglio **banca dati**
2) menu **mio** dal foglio **menu**
3) menu **collaboratore** dal foglio **menu** (in step successivo)
4) query di verifica per review

## Vincoli extra (IMPORTANTI, da rispettare alla lettera)
1) **Categorie**: se le categorie dell’Excel non combaciano, **riconducile** alle categorie già presenti nel sistema.
   - Se non è possibile mappare con alta confidenza → **non valorizzare** la categoria (lascia NULL / ometti campo).
2) **Incoerenze**: se ci sono incoerenze nei dati, **non forzare** valorizzazioni solo per “riempire campi”.
   - Se un campo è dichiarato obbligatorio nel DB ma il dato è incoerente/non mappabile, **non inserirlo** e segnala la riga come “skipped” o “needs manual fix” in un report.
3) **Duplicazioni evidenti**: se l’Excel contiene duplicati, **evitali** (dedup) usando regole chiare e documentate.

> Nota: se il DB ha vincoli NOT NULL che impediscono NULL/omissione, NON inventare dati.
> In quel caso:
> - non inserire la riga (skippa)
> - logga la motivazione in un report SQL o markdown
> - mantieni gli script eseguibili senza errori

---

## OUTPUT ATTESO (file)
Crea `sql/seed/`:
- `sql/seed/00_readme_seed.md`
- `sql/seed/00_seed_report.md` (report di dedup, mapping categorie, righe skippate)
- `sql/seed/01_seed_ingredients.sql`
- `sql/seed/02_seed_menu_user.sql`
- `sql/seed/03_seed_menu_collaborator.sql`
- `sql/seed/99_seed_verify.sql`

Gli script devono essere:
- revisionabili (commenti, mapping, blocchi per foglio)
- transazionali (`BEGIN; ... COMMIT;`) con rollback commentato
- senza esecuzione automatica

---

# MILESTONE 0 — Discovery: schema + categorie esistenti + struttura Excel
## Attività
1) Analizza schema DB (migrations/entities) e identifica:
   - tabella ingredienti e campi obbligatori
   - tabella categorie (se esiste) e come referenziarla
   - tabelle menu/week/day/meal e join con ingredienti
   - come l’app gestisce “owner” (utente vs collaboratore)
2) Leggi `docs/dieta.xlsx` e identifica:
   - colonne banca dati (ingredienti)
   - colonne menu (giorno/pasto/ingredient/qty) e come distinguere user/collaborator
3) Estrai la lista **categorie già presenti nel sistema** (da DB seed esistente o migration) e definisci un set “canonico”.

## Deliverable
- `docs/SEED_MAPPING.md` con:
  - Excel → DB mapping
  - lista categorie canoniche del sistema
  - regole di matching ingredienti
- `sql/seed/00_seed_report.md` (inizialmente con sezioni vuote)

## DoD
- È chiaro come mappare/lookup categorie esistenti.

---

# MILESTONE 1 — Category reconciliation (Excel → System categories) + dedup rules
## Requisiti
1) **Riconduzione categorie**
   - Implementa una tabella di mapping (nel report + nello script) tipo:
     - normalizzazione (trim, lowercase, rimozione accenti/punteggiatura, singolare/plurale)
     - mapping per sinonimi (es. “Verdure” → “Vegetables”, ecc. secondo sistema)
   - Matching:
     - 1) match esatto normalizzato
     - 2) match per sinonimi
     - 3) match “contains” con soglia alta (solo se davvero univoco)
   - Se NON univoco / bassa confidenza → categoria = NULL e segnala nel report.

2) **Deduplicazione ingredienti**
   - Definisci chiave dedup (in ordine):
     - ingredient code (se esiste)
     - altrimenti nome normalizzato + unità
   - Se duplicati con differenze minori (spazi, maiuscole, accenti) → tienine uno.
   - Se duplicati con differenze sostanziali (stesso nome ma categorie/valori diversi) → non scegliere a caso:
     - o skippa e segnala
     - o tieni quello più completo SOLO se la scelta è deterministica (documenta).

## Deliverable
- Aggiornamento `sql/seed/00_seed_report.md` con:
  - tabella mapping categorie (excel → system/NULL)
  - elenco duplicati risolti (keep/remove)
  - elenco “ambigui” skippati

## DoD
- Regole chiare prima di generare gli INSERT.

---

# MILESTONE 2 — Generate ingredients seed (foglio “banca dati”) con safe inserts
## Requisiti
- Inserisci ingredienti deduplicati.
- Categoria:
  - usa solo categorie mappate con alta confidenza
  - altrimenti NULL (o ometti campo) e logga
- Campi obbligatori:
  - NON inventare dati.
  - Se un ingrediente non può soddisfare vincoli DB senza inventare → **non inserirlo** e logga nel report.
- Campi mancanti:
  - puoi inferire SOLO se deterministico dal foglio menu (es. default grams se chiaramente ricavabile)
  - se non deterministico → lascia NULL/omesso oppure skippa se vincolo NOT NULL

## Deliverable
- `sql/seed/01_seed_ingredients.sql`
- aggiornamento `sql/seed/00_seed_report.md` (inserted vs skipped + motivazioni)

## DoD
- Script eseguibile (non lo eseguire) e review-friendly.

---

# MILESTONE 3 — Generate menu seed (foglio “menu”) per user e collaborator
## Requisiti
- Importa prima menu user (`02_seed_menu_user.sql`), poi collaborator (`03_seed_menu_collaborator.sql`).
- Righe menu che referenziano ingredienti non inseriti:
  - NON creare ingredienti “fantasma”.
  - Skippa la riga menu e logga nel report (con ingredient name e motivo).
- Quantità:
  - usa quantità dal foglio menu.
  - se quantità mancante/invalid → skippa riga menu e logga.
- Owner:
  - identifica come assegnare owner user/collaborator (lookup by email/username o variabili in testa script).
  - se serve creare utenti seed, fallo in modo esplicito e revisionabile.

## Deliverable
- `sql/seed/02_seed_menu_user.sql`
- `sql/seed/03_seed_menu_collaborator.sql`
- aggiornamento `sql/seed/00_seed_report.md`

## DoD
- Menu scripts coerenti e senza riferimenti a ingredienti inesistenti (skippati e loggati).

---

# MILESTONE 4 — Verification scripts + guida review
## Requisiti
- `99_seed_verify.sql` con query per:
  - conteggio ingredienti inseriti
  - ingredienti senza categoria (per review)
  - righe menu per giorno/pasto/owner
  - righe menu skippate (se hai creato una tabella/CTE di report) oppure confronti indiretti
- `00_readme_seed.md`:
  - ordine esecuzione
  - come sostituire user/collaborator identifiers
  - come fare dry-run e rollback
  - cosa controllare prima di eseguire (report + verify queries)

## Deliverable
- `sql/seed/99_seed_verify.sql`
- `sql/seed/00_readme_seed.md`

## DoD
- Review completa possibile prima dell’esecuzione.

---

## Implementation notes (obbligatori)
- Non usare ID hardcoded se evitabile: preferisci lookup su chiavi naturali.
- Se il DB è Postgres: preferisci `INSERT ... ON CONFLICT ...`.
- Se MySQL: `INSERT ... ON DUPLICATE KEY ...`.
- Se non sai il DB: rilevalo dai file del progetto e usa la sintassi corretta.
- Ogni riga skippata o non mappabile deve comparire nel report con: sheet, row key, reason.

---

## OUTPUT FINALE (in chat)
Alla fine, riassumi:
1) DB rilevato (Postgres/MySQL/altro) e perché
2) quante categorie mappate vs non mappate
3) quanti ingredienti deduplicati e quanti skippati
4) quanti menu items generati per user e collaborator e quanti skippati

Inizia da **MILESTONE 0**. NON eseguire alcuno script.
