# CODEX PROMPT — Fix bug: Ingredients page does not show full list (DB has more) — Milestones

Sei Codex e impersoni uno **sviluppatore senior full-stack** (frontend + backend).  
Contesto: progetto in versione consistente su GitHub; evita regressioni e fai modifiche minimali ma robuste.  
Prima di modificare: leggi `AGENTS.md` presenti in repo per contesto su architettura, requisiti e flussi.

## Bug
Nella sezione **Ingredients** non viene mostrata tutta la lista degli ingredienti **anche se** a database gli ingredienti sono presenti.

Obiettivo: individuare e correggere la causa (FE o BE), assicurando che:
- la lista mostrata in UI corrisponda ai dati DB (salvo filtri espliciti)
- paginazione/virtual scroll/filtri non “taglino” involontariamente i risultati
- eventuali flag (soft delete / active / owner / category) siano gestiti correttamente e coerenti
- il fix sia verificabile con passi chiari, e con un mini test se possibile

---

# MILESTONE 0 — Riproduzione e diagnosi end-to-end
## Attività
1) Avvia BE + FE e riproduci il bug.
2) Verifica quanti ingredienti ci sono a DB:
   - esegui una query di conteggio (o usa repository/query builder) e annota il numero.
3) Confronta con quanto mostra la UI (conteggio visualizzato / items renderizzati).
4) Apri DevTools (Network):
   - identifica la chiamata API usata dalla pagina Ingredients
   - annota URL, query params (page/limit/filter/sort), response count e response payload
5) Determina dove avviene il “taglio”:
   - il backend restituisce già meno record?
   - oppure FE riceve tutti ma renderizza solo una parte (paginazione/virtual scroll)?

## Deliverable
- `docs/BUG_INGREDIENTS_NOT_FULL_LIST.md` con:
  - steps riproduzione
  - conteggio DB vs conteggio API vs conteggio UI
  - prima ipotesi di root cause con evidenze (params, response, logs)

## DoD
- Root cause preliminare identificata (almeno BE vs FE).

---

# MILESTONE 1 — Fix Backend (se applicabile)
## Checklist cause comuni (verifica tutte quelle pertinenti)
- Pagination di default troppo bassa (es. limit=10/20) senza “load more”.
- Query con `take/limit` hardcoded.
- Filtri impliciti: `isDeleted=false`, `isActive=true`, `ownerUserId`, `category`, ecc.
- Soft delete: ingredienti presenti ma marcati deleted/archived.
- Sorting che rompe offset (es. paging non deterministico).
- Endpoint che ritorna solo “page 1” e FE non pagina.

## Implementazione fix
- Se serve paginazione: ritorna anche `total` e `page/pageSize`, e assicurati che FE la usi.
- Se non serve paginazione: aggiungi endpoint “list all” o alza un default ragionevole (documenta).
- Non cambiare contratti senza aggiornare FE.
- Aggiungi log/guardrail: se request chiede `pageSize` oltre massimo, clamp.

## Deliverable
- Fix codice BE
- (Se possibile) unit/integration test su service/repository per garantire che ritorni tutti i record attesi
- aggiornamento doc con cosa è cambiato e perché

## DoD
- Chiamando l’API si ottiene lo stesso conteggio del DB (salvo filtri intenzionali).

---

# MILESTONE 2 — Fix Frontend (se applicabile)
## Checklist cause comuni
- UI usa paginazione ma non implementa:
  - next page / infinite scroll / lazy load
- `*ngFor` limitato da slice/pipe o da `take(n)` su observable
- Virtual scroll configurato male (viewport height, itemSize, trackBy)
- Filtri predefiniti “nascosti” (search, category, allowed meals, ecc.)
- Stato non aggiornato dopo refresh/add/edit
- Merge di liste che sovrascrive e tronca (es. `setIngredients(response.items)` senza concatenare pagine)

## Implementazione fix
- Se l’API è paginata: implementa correttamente:
  - paginator UI oppure infinite scroll
  - fetch con `page/pageSize` e `total`
  - concatenazione/replace in base all’azione
- Se l’API ritorna tutto: assicurati che la UI renderizzi tutto senza limitazioni
- Gestisci loading/empty/error state e non bloccare render su errori minori

## Deliverable
- Fix FE
- eventuali `data-cy`/selettori aggiornati (se esistono test)
- doc aggiornata con steps verifica

## DoD
- UI mostra l’intera lista prevista (conteggio coerente con API).

---

# MILESTONE 3 — Verifica finale + regressioni minime
## Attività
1) Re-run end-to-end:
   - conteggio DB = conteggio API = conteggio UI
2) Verifica casi:
   - ingredienti con category null
   - soft-deleted (se esiste): devono comparire solo se previsto
   - filtri (se presenti): applicazione/rimozione non deve troncare permanentemente la lista
3) (Se Cypress presente) aggiungi uno smoke test:
   - visita pagina Ingredients
   - verifica che “numero righe”/“total” sia > X (se esiste un contatore), oppure che un ingrediente noto in fondo alla lista sia visibile cercandolo

## Deliverable
- `docs/BUG_INGREDIENTS_NOT_FULL_LIST.md` aggiornato con root cause finale + fix
- eventuale spec Cypress o test minimo

## DoD
- Bug chiuso, verificabile, senza regressioni.

---

## Output finale richiesto
Alla fine, fornisci:
- Root cause (1-2 frasi) con evidenza
- File modificati
- Comandi per avviare e verificare
- Eventuali limiti/assunzioni (paginazione, filtri, soft delete)

Inizia da **MILESTONE 0**.
