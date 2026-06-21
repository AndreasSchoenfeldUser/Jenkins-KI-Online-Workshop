# Jenkins-Workshop-App

Interaktive Single-Page-Web-App zum ganztägigen DevOps-Workshop **„Jenkins-Infrastruktur
mit Claude Code“**. Sie vereint drei Funktionen:

1. **Lehrbuch** – das vollständige Whitepaper in acht Kapiteln, durchsuchbar, mit
   kopierbaren, syntaxgehighlighteten Code-Blöcken.
2. **Präsentation** – ein eingebauter Vortragsmodus mit 16 Folien, Sprechernotizen,
   Vollbild und Tastatursteuerung.
3. **Interaktive Übungen** – 18 geführte Aufgaben über alle sieben Aufgabentypen mit
   gestaffelten Hinweisen, Validierung, Musterlösung und persistentem Fortschritt.

Die Lern-Inhalte sind self-contained und laufen ohne Netzwerk. Für die
**Benutzerverwaltung/Anmeldung** gibt es ein schlankes Node/Express-Backend, das die
Login-Daten in `server/data/user.yaml` hält (siehe unten).

## Schnellstart

```bash
npm install
npm run dev        # startet Backend (Port 3001) und Vite-Frontend (Port 5173) zusammen
```

Frontend öffnen: <http://localhost:5173>. Erstanmeldung: **admin / admin**
(Passwort danach unter „Benutzer verwalten“ ändern).

## Scripts

| Script             | Zweck                                                        |
|--------------------|--------------------------------------------------------------|
| `npm run dev`      | Backend + Vite-Frontend gleichzeitig (HMR), API-Proxy        |
| `npm run dev:web`  | nur Vite-Frontend                                            |
| `npm run dev:server` | nur Backend (`node --watch`)                               |
| `npm run build`    | Typprüfung (tsc) + Frontend-Bundle nach `dist/`              |
| `npm run start`    | Produktion: Express serviert `dist/` **und** die `/api`-Routen |
| `npm run test`     | Unit-Tests der Validatoren/Reducer (vitest)                  |
| `npm run lint`     | ESLint                                                       |

## Architektur / Login

- **Frontend** (`src/`) ist ein React-SPA. Auth läuft ausschließlich über die
  `/api`-Endpunkte; das Frontend erhält nie Passwort-Hash oder Salt.
- **Backend** (`server/`) ist ein Express-Server:
  - speichert Benutzer in **`server/data/user.yaml`** (Rollen `admin`/`user`, inkl. E-Mail),
  - offene **Registrierungsanfragen** in `server/data/registrations.yaml`,
  - den **Fortschritt der Teilnehmer** in `server/data/progress.yaml` (Snapshot + Ereignis-Log),
  - hasht Passwörter mit **scrypt + Salt** (kein Klartext),
  - verwaltet Sessions über ein **httpOnly-Cookie**,
  - liefert in Produktion das gebaute Frontend aus `dist/` aus.
- **Diese YAML-Dateien sind nicht über das Frontend/URL erreichbar:** Sie liegen außerhalb
  von `dist/`; statisch wird ausschließlich `dist/` ausgeliefert. Im Dev-Modus sperrt
  zusätzlich `server.fs.deny` in `vite.config.ts` den Zugriff.

### Registrierung & Freigabe

Auf der Startseite können sich Interessenten mit **Benutzername, E-Mail und Passwort**
registrieren. Die Anfrage wird nicht sofort aktiv, sondern landet im Admin-Bereich
(`/admin/users`) unter „Registrierungsanfragen“. Ein Administrator gibt sie frei (legt damit
das Konto an) oder lehnt sie ab. Offene Anfragen werden als Badge in Topbar/Sidebar angezeigt.

### Fortschritts-Logging

Das Frontend meldet den Lernfortschritt des angemeldeten Teilnehmers an
`PUT /api/progress`. Das Backend speichert je Teilnehmer einen Snapshot (gelöste Aufgaben,
XP, Quiz, Fortschritt pro Station) und protokolliert neu gelöste Aufgaben in einem
Ereignis-Log. Im Admin-Bereich sieht die Trainerin unter „Fortschritt der Teilnehmer“ je
Person den Gesamtstand (%), den Stand pro Station und den zeitlichen Verlauf.

## Deployment

```bash
npm run build      # erzeugt dist/
npm run start      # Express serviert dist/ + /api auf Port 3001 (PORT überschreibbar)
```

Hinweis: Mit aktivierter Benutzerverwaltung ist die App **nicht** mehr rein statisch —
sie benötigt den Node-Server (für `/api` und die `user.yaml`). Der Lern-/Präsentations-
teil selbst bleibt netzwerkunabhängig.

## Inhalte zentral ändern

Alle Infrastruktur-Fakten sind die **Single Source of Truth** in
[`src/content/domain.ts`](src/content/domain.ts):

- **`DOMAIN`** – die Workshop-Domain (`jenkins.example.com`). An genau dieser Stelle
  ändern; sie wird überall (Lehrbuch, Slides, Übungen, Snippets) referenziert.
- **`HOSTS`** – die vier Hosts mit Rollen, **IPs**, SSH-Schlüsseln und Labels.
- **`STAGES`** – die sieben Pipeline-Stages mit Host-/Label-Zuordnung.
- **`PLUGINS`**, **`ENVIRONMENT`**, **`HTTPS_FACTS`** – Plugins, Versionen, HTTPS-Setup.

Die übrigen Inhalte liegen getrennt von der Darstellung in `src/content/`
(`stations.ts`, `handbook.ts`, `slides.ts`, `exercises.ts`, `glossary.ts`,
`snippets/`).

## Projektstruktur

```
src/
├─ components/   UI-Bausteine (Topbar, Sidebar, RichText, CodeBlock, Callout …)
├─ features/     Stationen, Lehrbuch, Präsentation, Übungen, Glossar, Fortschritt
├─ content/      Inhalte (domain.ts = Single Source of Truth) + snippets/
├─ lib/          storage.ts, progress.tsx (Reducer), validate/ (reine Validatoren)
├─ theme/        Design-Tokens, globale Styles, ThemeContext
└─ types.ts      zentrale Typen
server/
├─ index.mjs     Express-App: /api-Routen + Auslieferung von dist/
├─ store.mjs     YAML-Persistenz (user/registrations/progress), scrypt-Hashing, Sessions
└─ data/         user.yaml · registrations.yaml · progress.yaml (Laufzeit, nicht eingecheckt)
tests/           vitest-Tests (Validatoren, Reducer, Inhaltskonsistenz)
```

## Routen

`/` · `/station/:id` · `/exercise/:id` · `/handbook` · `/handbook/:sectionId` ·
`/present` · `/present/:slideIndex` · `/glossary` · `/progress`

## Tastatur (Präsentationsmodus)

←/→ blättern · `F` Vollbild · `S` Sprechernotizen · `O` Übersicht · `Esc` schließt.

## Barrierefreiheit

Sichtbare Fokus-Ringe, Skip-Link, Fokus-Management bei Routenwechsel, `aria`-Labels,
AA-Kontraste. Drag&Drop-Aufgaben (Reihenfolge, Zuordnung) haben eine vollständig
tastaturbedienbare Alternative (Hoch/Runter-Buttons bzw. Auswahlfelder).

Siehe [`DECISIONS.md`](DECISIONS.md) für getroffene Annahmen und Abweichungen.
