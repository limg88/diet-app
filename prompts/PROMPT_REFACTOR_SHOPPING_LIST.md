# CODEX PROMPT — Migrate “collaborator grams” info from hover tooltip to dedicated column in Shopping List table — Milestones

Sei Codex e impersoni uno **sviluppatore senior frontend-first** (con attenzione a UX e accessibilità).  
Contesto: app in versione consistente su GitHub; evita regressioni. Prima di iniziare leggi `AGENTS.md` presenti nella repo per vincoli e flussi.

## Obiettivo funzionale
Nella tabella **Shopping List** oggi, passando in hover sul nome ingrediente, vengono mostrate informazioni aggiuntive (es. **grammature per collaboratori** / breakdown collaborator).  
Voglio **spostare** (migrare) quell’informazione in una **colonna dedicata** nella tabella Shopping List, eliminando la dipendenza dall’hover (soprattutto per mobile).

### Requisiti principali
- Aggiungere una nuova colonna (nome suggerito: **Collaborator Qty** / **Collaborator Grams** / **Collaborator**).
- La colonna deve mostrare le informazioni che oggi compaiono in hover:
  - grammature/quantità del collaboratore (e, se presente, eventuale breakdown per giorno/pasto)
- Il tooltip/hover può essere:
  - rimosso, oppure
  - mantenuto ma come “fallback” (decidi in base a UX; documenta la scelta)
- La colonna deve essere **responsive**:
  - su mobile deve essere leggibile (testo compatto, wrap controllato, eventualmente riga secondaria)
- Non cambiare la logica di calcolo della Shopping List: solo spostare la visualizzazione (salvo bug evidenti).

---

# MILESTONE 0 — Discovery: dove nasce l’hover e qual è il dato esatto
## Attività
1) Individua nella UI Shopping List:
   - componente tabella “This week”
   - cella ingrediente con hover/tooltip
2) Trova la fonte dati:
   - il breakdown collaborator arriva già dall’API oppure viene calcolato in frontend?
   - identifica struttura dati (es. `collaboratorQuantity`, `breakdown`, `sources`, ecc.)
3) Definisci esattamente cosa va mostrato nella colonna:
   - solo quantità totale collaboratore (es. “120 g”)
   - oppure dettaglio (es. “Mon 40g, Wed 80g”)
   - scegli la rappresentazione più usabile; preferenza: **totale** + (opzionale) dettaglio espandibile/tooltip secondario

## Deliverable
- `docs/SHOPPING_COLLAB_COLUMN_SPEC.md` con:
  - screenshot/descrizione dell’hover attuale
  - mapping dato → colonna
  - scelta formato colonna (totale vs dettaglio) e rationale
  - impatto su mobile

## DoD
- Specifica chiara prima di cambiare markup.

---

# MILESTONE 1 — Implementazione UI: nuova colonna + rendering coerente
## Attività
1) Aggiungi la colonna nella tabella Shopping List:
   - intestazione chiara (es. “Collaborator”)
   - allineamento come le altre colonne numeriche
2) Migra il rendering:
   - riusa la stessa funzione/formatter usata dal tooltip
   - evita duplicazione di logica: estrai helper condiviso
3) Gestione assenza collaboratore:
   - mostra `—` oppure `0`
4) Responsive:
   - su mobile: riduci label, usa `nowrap` dove serve, e `text-overflow: ellipsis` se lungo
   - se dettagli troppo lunghi: mostra totale e un’icona/info che apre un piccolo popover (touch-friendly) **solo se necessario**

## Deliverable
- Codice UI aggiornato
- eventuali stili dedicati (minimali)
- aggiornamento `docs/SHOPPING_COLLAB_COLUMN_SPEC.md` con screenshot/descrizione nuova colonna

## DoD
- L’informazione collaboratore è sempre visibile senza hover e non rompe la tabella.

---

# MILESTONE 2 — Cleanup: hover/tooltip
## Attività
- Rimuovi il tooltip/hover se diventa ridondante **oppure** trasformalo in fallback:
  - esempio: tooltip mostra solo dettaglio giornaliero, mentre colonna mostra totale
- Assicurati che su mobile non sia necessario hover per ottenere info.

## Deliverable
- Tooltip rimosso o ridotto (documentato)
- note su accessibilità

## DoD
- UX migliorata: info chiave sempre visibile e mobile-friendly.

---

# MILESTONE 3 — QA / Regressioni + (opzionale) test
## Attività
1) Verifica manuale:
   - con e senza collaboratore attivo
   - ingredienti con nomi lunghi
   - viewport 360x800 e desktop
2) Verifica che le somme (Shopping aggregata) non cambino.
3) Se Cypress è presente:
   - aggiungi/aggiorna uno smoke test:
     - visita Shopping List
     - verifica presenza colonna “Collaborator”
     - verifica che per un ingrediente noto il valore non sia vuoto (se dataset seed lo consente)

## Deliverable
- `docs/SHOPPING_COLLAB_COLUMN_QA.md` checklist
- eventuale spec Cypress

## DoD
- Nessuna regressione visiva o funzionale.

---

## Output finale richiesto
Alla fine, fornisci:
- Root cause/razionale (perché hover → colonna)
- File modificati
- Steps di verifica
- Eventuali decisioni UX (totale vs dettaglio, tooltip sì/no)

Inizia da **MILESTONE 0**.
