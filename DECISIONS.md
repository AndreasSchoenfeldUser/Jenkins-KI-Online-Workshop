# DECISIONS.md — Getroffene Annahmen & Abweichungen

Dieses Dokument hält die wesentlichen Entscheidungen fest, die bei der Umsetzung der
Spezifikation (CLAUDE.md) getroffen wurden.

## Bibliotheken

- **Syntax-Highlighting: `prism-react-renderer`** statt `shiki`. Beide sind in der
  Spezifikation als gleichwertig genannt; prism-react-renderer ist leichtgewichtig,
  benötigt keinen WASM-/Onig-Build und funktioniert problemlos im statischen Bundle.
  `groovy` und `dockerfile` sind nicht im Standard-Sprachsatz enthalten; sie werden
  auf `clike` bzw. `docker` gemappt und notfalls ohne Tokens, aber lesbar dargestellt.
- **Code-Eingabe ohne Monaco.** Die `code-fill`-Aufgaben verwenden **inline
  Eingabefelder** an den Lückenpositionen statt eines vollen Monaco-Editors. Begründung:
  fokussierte Lückentext-UX, vollständige Tastatur-/Screenreader-Bedienbarkeit und ein
  deutlich schlankeres Bundle (kein Editor-Lazy-Load auf Übungsseiten). Die in der
  Spezifikation genannte Monaco-Abhängigkeit wurde daher entfernt. Lese-Ansichten
  nutzen `CodeBlock` (prism) mit Kopier-Button.
- **Suche: `fuse.js`** für die clientseitige Volltextsuche im Lehrbuch (in der
  Spezifikation als Option genannt).
- **Mermaid nicht verwendet.** Das Datenfluss-Diagramm liegt als handgepflegtes,
  statisches SVG (`public/assets/datenfluss.svg`) vor — deterministisch, ohne
  Laufzeit-Abhängigkeit. Mermaid war optional.
- **Zod nicht verwendet.** Inhalte liegen als typisierte TypeScript-Module vor; die
  Typprüfung erfolgt zur Compile-Zeit durch `strict`-TypeScript. Ein Laufzeit-Schema
  (Zod) bringt hier keinen Mehrwert, da keine externen Daten geladen werden.

## Routing & Hosting

- **Hash-Router** (`HashRouter`) plus relative Vite-`base` (`./`), damit das Bundle
  ohne Server-Konfiguration auf jedem Static-Host und über `file://` läuft
  (Akzeptanzkriterium 2).

## Drag & Drop

- Statt echtem Drag&Drop werden **tastaturbedienbare Steuerelemente** eingesetzt:
  Hoch/Runter-Buttons für Reihenfolge-Aufgaben (`code-order`, `claude-md-builder`) und
  Auswahlfelder (`<select>`) für Zuordnungen (`node-mapping`). Das erfüllt die
  A11y-Anforderung „Drag&Drop hat eine Tastatur-Alternative“ direkt und robust, ohne
  zusätzliche DnD-Bibliothek.

## Inhalte & Konsistenz

- Sämtliche Infrastruktur-Fakten stammen aus `src/content/domain.ts` (Single Source of
  Truth) und werden über Stationen, Lehrbuch, Slides, Übungen und Snippets referenziert.
  Ein Test (`tests/content.test.ts`) prüft Konsistenz und Referenzintegrität.
- **18 Übungen** (Spezifikation fordert mindestens 12) decken alle sieben Aufgabentypen
  ab. Verteilung u. a.: 6× quiz, 3× prompt-craft, 2× code-order, 2× code-fill,
  2× terminal-sim, 1× node-mapping, 1× claude-md-builder.
- Die **16 Folien** entsprechen der in der Spezifikation vorgegebenen Reihenfolge.
- Beispiel-CLAUDE.md, Referenz-Jenkinsfile, Installationsskripte, Agenten-Setup und die
  Python-Testsuite liegen 1:1 als kopierbare Code-Blöcke in `src/content/snippets/`.

## State & Persistenz

- Globaler Fortschritt über React Context + `useReducer`; Persistenz in `localStorage`
  über die robuste Abstraktion `lib/storage.ts` (try/catch, In-Memory-Fallback ohne
  localStorage). XP werden je Aufgabe nur einmalig vergeben; eine gelöste Aufgabe wird
  nicht zurückgestuft. Versionierter Storage-Key erlaubt spätere Migration.

## Design-System

- Tokens aus „Soft Precision“ sind in `tailwind.config.js` und als CSS-Variablen in
  `theme/global.css` zentralisiert (inkl. optionalem Dark-Mode). Kein Accent-Stripe als
  Motiv; Orange wird sparsam als Akzent eingesetzt. Schriften referenzieren System-/
  Fallback-Fonts (Source Serif 4 / Inter / JetBrains Mono mit Fallbacks), um ohne
  Netzwerk-Webfont-Laden auszukommen.

## Benutzerverwaltung / Login (Abweichung von der ursprünglichen Spezifikation)

Die ursprüngliche CLAUDE.md schloss eine Anmeldung explizit aus („Keine Anmeldung, kein
Server, keine Datenbank“). Auf ausdrücklichen Wunsch wurde nachträglich eine
**clientseitige Benutzerverwaltung** als Workshop-Zugang ergänzt:

- **Login mit Benutzername/Passwort.** Nicht angemeldete Nutzer sehen eine Landing-Seite
  (`features/auth/LoginPage.tsx`), die zugleich eine **Übersicht über den Workshop**
  (Banner, Kennzahlen, roter Faden) und das Anmeldeformular zeigt.
- **Rollen:** `admin` und `user` (Teilnehmer). Admins erreichen unter `/admin/users` eine
  Verwaltung zum **Anlegen, Bearbeiten (Anzeigename, Rolle, Passwort-Reset) und Löschen**
  von Benutzern. Schutzregeln: das eigene Konto ist nicht löschbar, der letzte Admin kann
  nicht gelöscht oder herabgestuft werden.
- **Standard-Admin** beim ersten Start: `admin` / `admin` (Hinweis wird im Login
  angezeigt, solange nur dieses Konto existiert; Passwort sollte sofort geändert werden).
### Speicherung in `user.yaml` (Backend statt rein statisch)

Auf ausdrücklichen Wunsch werden die Login-Daten in einer **`user.yaml`** abgelegt, die
**nicht über Frontend/URL erreichbar** sein darf. Ein reines Static-SPA kann das nicht
leisten (der Browser kann keine serverseitige Datei lesen/schreiben, und alles unter
`public/`/`dist/` wäre per URL abrufbar). Daher wurde ein **schlankes Node/Express-Backend**
(`server/`) ergänzt — eine bewusste Abkehr vom ursprünglichen „nur statisches Bundle“:

- Benutzer liegen in **`server/data/user.yaml`** (außerhalb von `dist/`).
- **Passwörter** werden serverseitig mit **scrypt + zufälligem Salt** gehasht
  (`node:crypto`), Vergleich per `timingSafeEqual`. Es wird **nie Klartext** gespeichert,
  und Hash/Salt verlassen den Server nie (die API liefert nur eine „public“ Benutzer-Sicht).
- **Sessions** über ein **httpOnly-Cookie** (In-Memory-Token-Store, `sameSite=lax`).
- Admin-Schutz (Anlegen/Ändern/Löschen) wird **serverseitig** erzwungen; Regeln „eigenes
  Konto nicht löschbar“ und „letzter Admin nicht entfernbar/herabstufbar“ liegen im Backend.
- **Schutz der Datei vor URL-Zugriff:** Der Server liefert statisch ausschließlich `dist/`
  aus; `server/data/` liegt außerhalb. Im Dev-Modus sperrt zusätzlich `server.fs.deny`
  (`vite.config.ts`) den Zugriff. Verifiziert per Smoke-Test (kein `passwordHash` über
  irgendeine URL abrufbar).
- **Fortschritt** bleibt clientseitig in `localStorage`, pro Benutzer getrennt
  (Storage-Key enthält die vom Server vergebene User-ID).
- `server/data/` ist in `.gitignore` ausgeschlossen (enthält gehashte Zugangsdaten).

### Registrierung mit E-Mail (Freigabe-Workflow)

- Interessenten registrieren sich (Benutzername, **E-Mail**, Passwort) über `POST /api/register`.
  Die Anfrage wird **nicht sofort aktiv**, sondern als Eintrag in `registrations.yaml`
  gespeichert (Passwort bereits scrypt-gehasht). Erst die **Freigabe durch einen Admin**
  (`/api/registrations/:id/approve`) legt das Konto in `user.yaml` an; Ablehnen verwirft die
  Anfrage. Damit behält die Trainerin die Kontrolle über die Teilnehmerliste.
- E-Mail wird serverseitig grob validiert (Format) und ist Teil der Benutzerdaten; sie wird in
  der „public“ Benutzer-Sicht an Admins ausgeliefert (nicht jedoch an andere Teilnehmer, da
  `/api/users` admin-geschützt ist).

### Fortschritts-Logging der Teilnehmer

- Der Lernfortschritt bleibt primär clientseitig (`localStorage`, pro Benutzer), wird aber
  zusätzlich an das Backend gemeldet (`PUT /api/progress`, debounced). Der Server hält je
  Teilnehmer einen **Snapshot** (gelöste Aufgaben, XP, Quiz, Stand je Station) und ein
  **Ereignis-Log**: beim Eingang eines Snapshots werden **neu** gelöste Aufgaben gegen den
  zuvor gespeicherten Stand diffd und mit Server-Zeitstempel protokolliert (gedeckelt auf 200
  Einträge). So entsteht ein verlässlicher Verlauf, auch wenn offline/auf mehreren Geräten
  gelöst wurde. Der Admin-Bereich zeigt daraus Gesamtfortschritt (%), Stand pro Station und
  den zeitlichen Verlauf.
- Bewusst schlank gehalten: kein separates Event-Streaming, keine DB — eine `progress.yaml`
  genügt für den Workshop-Maßstab.

> **Sicherheitshinweis (bewusst):** Das Modell ist für den Workshop-Kontext gedacht
> (Single-Node, In-Memory-Sessions, kein TLS-Zwang in Dev). Für echten Produktivbetrieb
> wären u. a. HTTPS, persistente/rotierende Sessions, Rate-Limiting und ggf. ein
> Account-Lockout zu ergänzen. Der Grundsatz „Secrets nicht im Frontend/Repository“ wird
> hier konsequent umgesetzt — passend zum im Workshop vermittelten Prinzip des Credential
> Store.

## Annahmen

- `EMAIL` im Installationsskript (`admin@example.com`) und der Pfad
  `/opt/demo-app/app.jar` sind sinnvolle Platzhalter, konsistent mit den Domain-Fakten.
- Der Workshop bleibt eine **Simulation**: keine echten Secrets/IPs, keine echte
  SSH-/Shell-Ausführung; das Terminal ist deterministisch und offline.
