# diet-app — Integrazione DB locale + Neon Postgres (Free Tier)

Questo documento guida (e istruisce Codex a implementare) l’integrazione di **diet-app** con **Neon Postgres** (https://console.neon.tech), mantenendo **piena compatibilità** con il database Postgres locale.

Neon utilizza un approccio **Postgres standard (JDBC/psql-compatible)**, quindi **NON introduce vendor lock-in**: è un Postgres remoto con SSL obbligatorio.

> Obiettivo: l’app deve poter partire in **due modalità**:
> 1) **LOCAL**: DB Postgres locale (come oggi)
> 2) **NEON**: DB Postgres remoto su Neon (Free Tier)

---

## Come eseguire Codex senza approvazioni (auto-approve)

```powershell
codex run --approval=never --file docs/NEON_INTEGRATION.md
```

---

## Vincoli e principi

- Non rompere la modalità DB locale.
- Neon è usato come Postgres managed puro.
- Connessione tramite DATABASE_URL standard.
- SSL obbligatorio su Neon (sslmode=require).
- Nessun dato inventato.
- Codex deve eseguire build/run/test e correggere errori automaticamente.

---

## Milestone

### M0 — Discovery & Baseline
Analisi stack, config DB attuale, run e test locali.

### M1 — Configurazione DB dual-mode
Supporto DB locale e Neon via env (DB_MODE, DATABASE_URL, SSL).

### M2 — Neon setup & migrations
Applicazione migrations su Neon.

### M3 — Run modes
Avvio app con o senza DB locale.

### M4 — Test automatici e bugfix
Esecuzione test in entrambe le modalità.

### M5 — Hardening Neon Free Tier
Pooling, health check, timezone.

---

## Environment variables

### Local
```env
DB_MODE=local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dietapp
DB_SSL=false
```

### Neon
```env
DB_MODE=neon
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require&channel_binding=require
DB_SSL=true
```

---

## Output finale richiesto
- File modificati/creati
- Comandi di avvio e test
- Limitazioni note
