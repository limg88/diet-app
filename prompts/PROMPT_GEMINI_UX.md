# GEMINI PROMPT — UX/UI Redesign “bella e accattivante” (in continuità con Codex) — Milestones

Sei Gemini e lavori come **Lead UX/UI Designer + Frontend Architect**.  
Nella cartella corrente c’è un applicativo già esistente e uno o più file `AGENTS.md` (con prompt e requisiti originali).  
**Prima di proporre o applicare qualsiasi modifica**, devi **analizzare il progetto** e leggere **tutti** gli `AGENTS.md` presenti nella folder per capire: obiettivi, use case, vincoli, stack, component library, routing, struttura UI.

## Obiettivo
La UI/UX prodotta finora “non piace”: voglio una UX/UI **moderna, bella e accattivante**, ma anche:
- chiara e veloce da usare
- coerente (design system interno)
- **responsive** (mobile + desktop)
- accessibile (base)
- pronta per essere testata (selettori stabili, non fragili)

Non cambiare lo stack senza motivazione forte: se il progetto usa una component library (es. PrimeNG / Material / ecc.), lavora con quella. Se proponi alternative, devono essere opzionali e motivate.

## Regole operative
- Lavoro a **milestone** (obbligatorio).
- Ogni milestone deve produrre deliverable concreti: file, componenti, refactor, linee guida.
- Ogni modifica deve includere: *perché*, *cosa cambia*, *come verificare*.
- Evita “restyling superficiale”: voglio miglioramenti percepibili (gerarchia visiva, spacing, layout, micro-interazioni, stati, copy).
- Mantieni i flussi funzionali invariati (salvo bug UX evidenti), e documenta ogni variazione di comportamento.
- Non introdurre regressioni: se tocchi markup, fallo in modo compatibile con eventuali `data-cy` e test.

---

# MILESTONE 0 — Audit: capire davvero il progetto prima di disegnare
## Output richiesto
Crea `docs/UX_AUDIT.md` con:
1) Sintesi di cosa fa l’app (dai prompt `AGENTS.md` + UI reale)
2) Mappa pagine/route e flussi principali (happy path + edge)
3) Inventario UI:
   - component library usata
   - layout attuale (header/sidebar/breadcrumb/tabs)
   - pattern ricorrenti (form, tabelle, dialog, wizard)
4) Problemi rilevati (con screenshot/descrizione testuale se possibile):
   - gerarchia visiva, spacing, tipografia
   - confusione nei CTA
   - densità info eccessiva
   - navigazione poco chiara
   - mobile issues (overflow, tap target, sticky bar, modali)
   - stati mancanti (loading/empty/error)
5) Vincoli tecnici (theme system, CSS approach, tokens, ecc.)

## DoD (M0)
- `docs/UX_AUDIT.md` completo e aderente a codebase + `AGENTS.md`.
- NESSUNA modifica UI ancora.

---

# MILESTONE 1 — Vision & Design System leggero: “look & feel” accattivante ma sostenibile
## Obiettivo
Definire un “mini design system” implementabile nel progetto, senza Figma obbligatorio.

## Output richiesto
1) `docs/UI_STYLE_GUIDE.md` con:
   - principi (tone of voice, densità, leggibilità)
   - tipografia (scala, pesi, gerarchie)
   - spacing (grid e scale, es. 4/8/12/16/24 ’ish)
   - component states (default/hover/focus/disabled/error)
   - pattern: primary/secondary CTA, form, table, card, modal, toast
   - linee guida mobile-first
2) Definisci (e implementa) **design tokens** nel modo più compatibile con lo stack:
   - se c’è theming (es. PrimeNG tokens), usa quello
   - altrimenti: CSS variables in `styles.scss` / `theme.css` con naming pulito
3) “Quick wins” visivi (senza stravolgere layout):
   - padding coerente
   - typography gerarchica
   - card surface e separatori
   - stati hover/focus coerenti

## DoD (M1)
- Guideline + tokens applicati in modo consistente.
- UI già “più moderna” anche senza cambiare pagine.

---

# MILESTONE 2 — Information Architecture & Layout: desktop potente, mobile impeccabile
## Obiettivo
Rendere navigazione e struttura più chiare e “premium”.

## Interventi tipici (adatta a ciò che trovi)
- Header con azioni principali e contesto pagina
- Sidebar/collapsible nav su desktop
- Bottom nav o drawer su mobile (se ha senso)
- Breadcrumb dove utile
- Miglioramento “first meaningful screen” per ogni pagina

## Output richiesto
1) `docs/IA_AND_LAYOUT.md`:
   - proposte layout + rationale
   - mapping route → layout
   - pattern responsive (breakpoint, stacking, sticky actions)
2) Implementazione:
   - layout responsive base (shell)
   - navigation responsive
   - page templates (almeno 2-3 per coprire le tipologie)

## DoD (M2)
- Nessun overflow orizzontale su viewport 360x800.
- Desktop: contenuti leggibili, non “stirati” su schermi larghi.
- Navigazione chiara e raggiungibile.

---

# MILESTONE 3 — Component refactor: Forms, Tables, Dialogs “wow” (ma usabili)
## Obiettivo
Rendere i componenti chiave davvero piacevoli e robusti.

## Output richiesto
1) Migliora:
   - Forms: label, help text, validation inline, error summary se necessario
   - Tables/lists: densità, colonne, filtri, empty state, loading skeleton
   - Dialogs: header/azioni coerenti, chiusura chiara, responsive
   - CTA: primary evidente, secondary discreto, destructive separato
2) Introduci pattern coerenti per:
   - empty state (icon + testo + CTA)
   - error state (messaggio chiaro + retry)
   - loading (skeleton o spinner non invasivo)
3) Se utile: micro-interazioni (transizioni leggere, feedback su salvataggio)

## DoD (M3)
- Almeno i flussi principali (da `AGENTS.md`) risultano:
  - più rapidi
  - più chiari
  - più “belli” visivamente

---

# MILESTONE 4 — Polish finale: accessibilità base + coerenza + performance UI
## Output richiesto
1) A11y base:
   - focus visibile ovunque
   - tab order sensato
   - aria-label su elementi icon-only
   - contrast sufficiente
2) Coerenza:
   - spacing e typography uniformi
   - componenti con stessi pattern di stato
3) Performance UI:
   - elimina re-render inutili dove introdotti
   - evita layout shift (CLS) con skeleton/placeholder

## DoD (M4)
- UI pronta per demo: “bella e accattivante” ma professionale.
- Checklist responsive e a11y in `docs/UI_CHECKLIST.md`.

---

# Modalità di esecuzione (obbligatoria)
1) Parti da M0: analizza repo + leggi tutti gli `AGENTS.md`.
2) Produci i documenti richiesti.
3) Solo dopo, implementa M1 → M4 in sequenza.
4) Al termine di ogni milestone, lascia:
   - elenco file modificati
   - cosa verificare manualmente (passi concreti)
   - eventuali rischi/regressioni possibili

Inizia subito con **MILESTONE 0**: analisi progetto + lettura `AGENTS.md` e creazione `docs/UX_AUDIT.md`.
