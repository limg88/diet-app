# CODEX PROMPT — Collaboration (Invites + Collaborator Menu + Aggregated Shopping) — Milestones

Sei Codex e impersoni uno **sviluppatore senior full-stack** (NestJS/Angular o stack già presente nel repo).  
Contesto: l’app è già in una versione consistente e versionata su GitHub. Devi lavorare con attenzione a:
- retro-compatibilità
- sicurezza (access control)
- migrazioni DB minimali e safe
- UI coerente con l’app
- documentazione chiara

⚠️ Prima di procedere: leggi TUTTI i file `AGENTS.md` presenti nella repo per capire requisiti, vincoli, modelli dati e flussi esistenti (auth, menu, shopping, week scope Europe/Rome).

Obiettivo: implementare una nuova funzionalità di **collaborazione**:
1) un utente può **invitare** un altro utente a collaborare alla dieta
2) quando la collaborazione è attiva:
   - aggiungere una pagina **clone della pagina Menu** (stesse funzionalità) che mostri la dieta del collaboratore
3) la pagina **Shopping** deve sommare le quantità:
   - del menu principale (utente)
   - + del menu del collaboratore (collaborator)
   - mantenendo le logiche esistenti (This week, off-menu, warehouse/to purchase se già presente)

---

## Principi di dominio (da rispettare)
- Collaborazione = visibilità + modifica reciproca (se già previsto dai requisiti originali) oppure definisci chiaramente i permessi.
- La dieta è “settimana corrente” (lun→dom) in Europe/Rome, coerente con implementazione esistente.
- Shopping List aggrega la settimana corrente e ora deve includere anche collaborator diet.

---

# MILESTONE 0 — Discovery & Design (prima di scrivere codice)
## Attività
1) Analizza repo e `AGENTS.md` per:
   - auth e gestione utenti (entity/DTO/endpoint)
   - modello dati di Menu/Meals/Ingredients e calcolo Shopping
   - routing UI e componenti della pagina Menu
2) Definisci “collaboration model”:
   - Invite states: `pending`, `accepted`, `rejected`, `revoked` (minimo indispensabile)
   - Direzione: invito da user A a user B
   - Relazione attiva: `collaboration` (A <-> B) o `accepted_invite`
3) Definisci i permessi:
   - Chi può vedere/modificare la dieta di chi?
   - Default: collaborazione = accesso bidirezionale (se coerente con i requisiti originali). Se no, implementa read-only per collaborator, ma documenta.

## Deliverable
- `docs/COLLABORATION_DESIGN.md` con:
  - data model (tabelle/entity)
  - API contract (endpoint, payload, error codes)
  - UI flows (invite, accept, list collaborators)
  - impatto su Menu/Shopping
  - decisioni su permessi

## DoD
- Design chiaro e implementabile senza ambiguità.

---

# MILESTONE 1 — Backend: Invites + Collaboration + Access Control
## Attività
1) Data model + migration:
   - Tabella/Entity `collaboration_invites` (o simile)
   - (Opzionale) tabella `collaborations` se vuoi normalizzare dopo accept
2) Endpoint (minimo):
   - `POST /collaboration/invites` (invite user by email/username/userId)
   - `GET /collaboration/invites` (incoming/outgoing)
   - `POST /collaboration/invites/:id/accept`
   - `POST /collaboration/invites/:id/reject`
   - `DELETE /collaboration/invites/:id` (revoke/cancel) o equivalente
   - `GET /collaboration/partners` (lista collaboratori attivi)
3) Sicurezza:
   - solo autenticati
   - solo destinatario può accept/reject
   - solo mittente può revoke
   - validazioni: no self-invite, no duplicate pending, gestione già collaboratori
4) Data access:
   - endpoints per leggere/scrivere “menu del collaborator” (vedi milestone 2)
   - definisci come si identifica il “menu owner”: `ownerUserId` nel menu data.

## Deliverable
- Migration + entity + service + controller
- `docs/API_COLLABORATION.md` con esempi request/response

## DoD
- API funzionante e protetta con auth/authorization.
- Stati inviti gestiti correttamente.

---

# MILESTONE 2 — Backend: Menu “per utente” (owner) e duplicazione funzionalità
## Obiettivo
Permettere di leggere e modificare un menu “week current” per:
- utente loggato
- collaborator (solo se collaboration attiva)

## Attività
1) Se il menu era “per utente implicito”:
   - aggiungi `ownerUserId` (o equivalente) alle entità del menu (o tabella parent)
   - aggiorna query/servizi: default owner = current user
2) Aggiungi endpoint parametrici (o estendi quelli esistenti):
   - `GET /menu?ownerUserId=...` (se autorizzato)
   - `PUT/POST /menu...` con ownerUserId (se autorizzato)
3) Authorization guard:
   - owner = self OK
   - owner = collaborator OK solo se collaboration attiva
   - altrimenti 403

## Deliverable
- Menu data model aggiornato + retrocompatibilità
- Endpoint aggiornati + guard
- `docs/MENU_MULTI_OWNER.md`

## DoD
- Stessa funzionalità menu funzionante sia per user che collaborator, lato API.

---

# MILESTONE 3 — Frontend: UI Invites + Collaborators page/section
## Attività
1) Aggiungi area “Collaboration” (in settings o profilo) con:
   - form “Invite user” (email/username, secondo modello utenti)
   - lista inviti inviati (pending + revoke)
   - lista inviti ricevuti (pending + accept/reject)
   - lista collaboratori attivi
2) UX:
   - feedback (toast), empty state, error state
   - proteggi da doppio click e loading state

## Deliverable
- Pagina/section collaborazione + servizi FE
- `docs/UI_COLLABORATION.md` (flow e verifica manuale)

## DoD
- Flusso invito → accept → compare tra collaboratori.

---

# MILESTONE 4 — Frontend: “Collaborator Menu” (clone di Menu con stesse funzionalità)
## Requisito
Aggiungere una pagina clone della pagina Menu (stesso comportamento) che mostri la dieta del collaborator.

## Attività
1) Routing:
   - `/menu` = menu utente corrente
   - `/collaborators/:collaboratorId/menu` = menu collaborator
2) Implementazione:
   - NON duplicare codice copiando: estrai un componente riusabile `MenuPageComponent` che riceve `ownerUserId`
   - la pagina “menu collaborator” passa `ownerUserId = collaboratorId`
3) Visual:
   - titolo chiaro: “Menu di <nome collaborator>”
   - badge/indicator “Collaborator”
4) Verifica funzionalità:
   - tutte le features del Menu devono funzionare (edit grams, add/remove ingredients, ecc.)
   - salva sul menu del collaborator, non sul proprio

## Deliverable
- Refactor “Menu page” in componente riusabile + nuova route
- `docs/COLLABORATOR_MENU.md`

## DoD
- Menu collaborator pienamente operativo e coerente.

---

# MILESTONE 5 — Shopping: aggregazione tra menu utente + menu collaborator
## Requisito
La pagina spesa deve sommare le quantità presenti nel menu principale + menu collaborator.

## Attività
1) Identifica il punto di aggregazione:
   - se shopping è calcolata FE: estendi query per recuperare anche menu collaborator e sommare
   - se shopping è calcolata BE: modifica endpoint per includere collaborator menus e restituire totali aggregati
2) Regole:
   - aggregazione per “ingrediente/prodotto” (chiave coerente col modello: ingredientId + unità)
   - somma quantità (Quantity)
   - (se esiste) Warehouse e To Purchase:
     - Quantity = totale aggregato
     - Warehouse resta per riga (decidi se warehouse è unico o per-owner; preferibile unico per item aggregato)
     - To Purchase = Quantity - Warehouse
3) UI:
   - evidenzia per riga (opzionale) breakdown: “you + collaborator”
   - ma mantenere semplice: total first

## Deliverable
- Calcolo shopping aggregato aggiornato
- `docs/SHOPPING_AGGREGATION.md` con esempi e casi limite

## DoD
- Shopping “This week” riflette correttamente somma dei due menu.

---

# MILESTONE 6 — QA & Tests (minimo indispensabile)
## Attività
- Se Cypress è presente, aggiungi smoke tests:
  1) Invite → accept → collaborator appare
  2) Apri collaborator menu → modifica un item → verifica persistenza
  3) Shopping total aumenta includendo ingredienti collaborator
- Aggiorna eventuali `data-cy` necessari

## Deliverable
- spec Cypress + `docs/QA_COLLABORATION.md`

## DoD
- Flusso end-to-end verificabile e non flaky.

---

## Output finale richiesto
Al termine, fornisci:
1) elenco file modificati/creati
2) comandi per avvio FE/BE e test
3) note su migrazioni e retrocompatibilità
4) checklist per test manuale completa

Inizia subito da **MILESTONE 0** e NON procedere a milestone successive senza chiudere la DoD della corrente.