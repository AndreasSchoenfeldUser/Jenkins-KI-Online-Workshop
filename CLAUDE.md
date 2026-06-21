# CLAUDE.md — Interaktive Workshop-Web-App „Jenkins-Infrastruktur mit Claude Code"

> Diese Datei ist die verbindliche Spezifikation für Claude Code. Ziel ist eine
> vollständige, interaktive Web-Applikation, die das Whitepaper, die Präsentation
> und die praktische Übung zu einem zusammenhängenden Lernerlebnis verbindet.
> Arbeite die Abschnitte der Reihe nach ab. Halte dich strikt an Design-System,
> Datenmodell und Akzeptanzkriterien. Frage nicht nach offensichtlichen Defaults,
> sondern triff sinnvolle Annahmen und dokumentiere sie im Code.

---

## 1. Projektüberblick

Es entsteht eine Single-Page-Web-Applikation (SPA), die einen ganztägigen
DevOps-Workshop begleitet. Im Workshop bauen Teilnehmende mit Claude Code eine
verteilte Jenkins-CI/CD-Umgebung über vier Hosts auf: Build mit Maven und JUnit,
Deployment auf einen Zielhost und Testautomatisierung in Python.

Die App erfüllt drei Funktionen zugleich:

1. **Lehrbuch** — der gesamte Whitepaper-Inhalt, lesbar und durchsuchbar aufbereitet.
2. **Präsentation** — ein eingebauter Vortragsmodus (Slide-Deck) für die Trainerin.
3. **Interaktive Übung** — geführte Aufgaben mit Code-Editoren, simuliertem
   Terminal, Prompt-Übungen, Quiz und Fortschritts-Tracking.

Die App ist self-contained, läuft lokal ohne Backend und ohne externe Netzwerk-
Abhängigkeiten zur Laufzeit (alle Inhalte sind eingebettet oder als statische
Assets gebündelt). Sie muss als statisches Bundle deploybar sein.

### Nicht-Ziele
- Es wird **keine** echte Jenkins-Instanz provisioniert; die Übung ist eine
  realitätsnahe Simulation mit deterministischen, vorgegebenen Soll-Lösungen.
- Keine Anmeldung, kein Server, keine Datenbank. Persistenz nur lokal (s. u.).

---

## 2. Technologie-Stack

- **Framework:** React 18 + TypeScript, gebündelt mit **Vite**.
- **Routing:** `react-router-dom` (Hash- oder Browser-Router; Hash bevorzugt für
  einfaches statisches Hosting).
- **Styling:** Tailwind CSS. Design-Tokens (Farben, Fonts) zentral in
  `tailwind.config.js` und CSS-Variablen.
- **State:** React Context + `useReducer` für globalen Fortschritt; lokaler
  Komponenten-State via Hooks. Keine schwere State-Library nötig.
- **Persistenz:** `localStorage` für Fortschritt, Quiz-Antworten, gelöste
  Aufgaben und Theme. Eine Abstraktionsschicht `lib/storage.ts` kapselt Zugriffe
  und behandelt fehlendes/leeres/ungültiges localStorage robust (try/catch).
- **Code-Anzeige & -Editor:** `@monaco-editor/react` für editierbare Code-Felder
  und `shiki` **oder** `prism-react-renderer` für Syntax-Highlighting in
  Lese-Ansichten. Sprachen: bash, groovy (Jenkinsfile), python, yaml, markdown,
  dockerfile.
- **Diagramme:** Statische SVGs (mitgeliefert) plus optional `mermaid` für
  generierte Flussdiagramme.
- **Präsentationsmodus:** Eigene Slide-Komponente (kein reveal.js nötig), Vollbild
  via Fullscreen-API, Tastatursteuerung.
- **Icons:** `lucide-react`.
- **Tests:** `vitest` + `@testing-library/react` für Kernkomponenten und die
  Validierungslogik der Aufgaben.
- **Linting/Format:** ESLint + Prettier, TypeScript `strict: true`.
- **Build-Output:** `npm run build` erzeugt ein statisches Bundle in `dist/`,
  das über jeden Static-Host (auch `file://`-tauglich mit Hash-Router) läuft.

Wenn eine genannte Bibliothek nicht verfügbar ist, wähle eine gleichtgewichtige,
gut gepflegte Alternative und dokumentiere die Entscheidung in `DECISIONS.md`.

---

## 3. Design-System „Soft Precision" (verbindlich)

Die App übernimmt das Branding der Comquent GmbH. Diese Tokens sind verbindlich.

### Farben
| Token | Hex | Verwendung |
|-------|-----|------------|
| `navy` | `#0E2A4A` | Primär, dunkle Flächen, Titel, Kopfzeilen |
| `navy-2` | `#16395F` | Sekundäre dunkle Fläche, Karten auf Navy |
| `orange` | `#E8520A` | Akzent, aktive Zustände, Call-to-Action, Pfeile |
| `amber` | `#F5A623` | Sekundärakzent, Hervorhebungen, Nummern |
| `grey` | `#55606B` | Fließtext sekundär, Captions |
| `light` | `#EEF1F4` | Helle Karten, Flächen |
| `ink` | `#1A1A1A` | Fließtext primär |
| `white` | `#FFFFFF` | Hintergrund Content-Bereiche |

Eine Farbe dominiert je Fläche (60–70 % Gewicht), Navy für Struktur, Orange als
sparsamer Akzent. **Keine** dekorativen Farbbalken oder Accent-Stripes als Motiv.

### Typografie
- **Headings:** eine Serifen-Schrift mit Charakter (z. B. "Source Serif 4" oder
  als Fallback Cambria/Georgia). Titel groß und fett.
- **Body/UI:** eine klare Sans (z. B. "Inter" oder Fallback Arial/Calibri).
- **Code:** Monospace ("JetBrains Mono" oder Fallback Consolas/Courier New).
- Schriftgrößen großzügig, klare Hierarchie (Slide-Titel ≥ 30px, Body 15–17px).

### Sprache & Ton
- Gesamte UI und alle Inhalte auf **Deutsch**. Sachlich, präzise, formell, ohne
  Marketing-Floskeln und ohne KI-Buzzwords.
- Englische Fachbegriffe bleiben englisch: Pipeline, Pull Request, DevOps, Build,
  Stage, Agent, Controller, Deployment, Credential, Commit.
- Keine Emojis in Inhalten.

### Layout-Prinzipien
- Großzügige Weißräume, mindestens 16px Innenabstand in Karten.
- Abgerundete Ecken (radius ~8px), dezente Schatten statt Rahmenlinien.
- Konsistente Abstände (4/8/16/24/32-Raster).
- Responsives Layout: Desktop zweispaltig, Tablet/Mobile einspaltig.
- Barrierearm: Fokus-Ringe, ausreichende Kontraste (WCAG AA), `aria`-Labels,
  vollständige Tastaturbedienbarkeit.

---

## 4. Informationsarchitektur & Routing

Sechs „Stationen" bilden den roten Faden des Workshops. Sie sind die oberste
Navigationsebene. Zusätzlich gibt es Lehrbuch- und Präsentationsmodus.

```
/                      Startseite / Übersicht (roter Faden, Fortschritt)
/station/1             Station 1 — Warum & Was (Mindset, Ausgangslage)
/station/2             Station 2 — Architektur (Topologie, Datenfluss)
/station/3             Station 3 — Claude Code (Arbeitsweise)
/station/4             Station 4 — CLAUDE.md (Spezifikation, Pipeline-Stages)
/station/5             Station 5 — Prompten (Prompt-Muster, Aufgaben)
/station/6             Station 6 — Durchführung (Ablauf, Abnahme)
/exercise/:id          Einzelne interaktive Übungsaufgabe (Vollbild-Workspace)
/handbook              Lehrbuch-Modus: gesamtes Whitepaper als Langtext
/handbook/:sectionId   Direktsprung zu einem Kapitel
/present               Präsentationsmodus (Slide-Deck, Vollbild)
/present/:slideIndex   Direkter Foliensprung
/glossary              Glossar der Fachbegriffe
/progress              Fortschritts-Dashboard (gelöste Aufgaben, Quiz-Score)
```

Eine persistente Topbar zeigt: Logo/Workshop-Titel, Stations-Navigation,
Umschalter „Lehrbuch / Stationen / Präsentation", Fortschrittsanzeige (z. B.
„7/15 Aufgaben"), Theme-Toggle (hell/dunkel optional). Eine Sidebar (Desktop)
zeigt die Stationen mit Erledigt-Status.

---

## 5. Datenmodell (Single Source of Truth)

Alle Inhalte liegen als typisierte Daten in `src/content/` (TypeScript-Module
oder JSON + Zod-Schema), getrennt von der Darstellung. So bleiben Whitepaper,
Slides und Übungen aus einer gemeinsamen Quelle konsistent.

### 5.1 Kernkonzepte (Infrastruktur — über die ganze App identisch)

Diese Fakten müssen überall konsistent erscheinen:

**Hosts**
| Host | Rolle | IP | Privater Schlüssel | Label |
|------|-------|----|--------------------|-------|
| host1 | Jenkins Controller | 10.0.0.11 | ~/.ssh/host1_ed25519 | — |
| host2 | Agent I — Build | 10.0.0.12 | ~/.ssh/host2_ed25519 | maven |
| host3 | Deployment-Ziel | 10.0.0.13 | ~/.ssh/host3_ed25519 | — |
| host4 | Agent II — Test | 10.0.0.14 | ~/.ssh/host4_ed25519 | pytest |

**Domain & HTTPS (host1)**
- Domain: `jenkins.example.com` (Platzhalter; als Konstante `DOMAIN` zentral
  definieren, damit sie an einer Stelle änderbar ist).
- DNS-A-Record ist bereits erstellt und zeigt auf host1.
- HTTPS über Let's Encrypt (certbot), in den Installationsprozess integriert.
- nginx als Reverse Proxy: 443 → 127.0.0.1:8080, 80 → 443 (Redirect).
- Automatische Zertifikatserneuerung via systemd-Timer.
- Jenkins-URL: `https://jenkins.example.com`.

**Vorbereitete Umgebung**
- Vier VMs (Ubuntu 24.04 LTS) sind bereitgestellt, Basis-Netzwerk eingerichtet.
- Zugang per SSH-Key als Benutzer `ubuntu` (sudo-berechtigt).
- Versionen: OpenJDK 17 (Temurin), Maven 3.9.x, Python 3.12, Jenkins LTS.

**Sieben Pipeline-Stages (declarative, Pipeline as Code)**
1. Checkout — Quellcode aus Git holen (Controller).
2. Build — `mvn -B clean package -DskipTests` (Agent `maven`).
3. Unit-Test — `mvn -B test`, JUnit-Reports veröffentlichen (Agent `maven`).
4. Deploy — JAR per `scp` auf host3, systemd-Service `demo-app` neu starten
   (Agent `maven`, Credential `deploy-key`).
5. Smoke-Wait — auf `http://10.0.0.13:8080/actuator/health` warten (Agent `pytest`).
6. ITest — `pytest tests/test_app.py --junitxml=it-results.xml` (Agent `pytest`).
7. Report — Testergebnisse archivieren und veröffentlichen.

**Benötigte Jenkins-Plugins (host1)**
workflow-aggregator, git, ssh-slaves, credentials-binding, junit,
pipeline-stage-view, ws-cleanup.

Lege diese Fakten als Konstanten/Datenstrukturen in `src/content/domain.ts` ab
und referenziere sie überall. Widersprüche zwischen Slides, Lehrbuch und Übung
sind ein Fehler.

### 5.2 TypeScript-Typen (Richtschnur, anpassbar)

```ts
type Station = {
  id: number;                 // 1..6
  slug: string;               // "warum-und-was"
  kicker: string;             // "Station 1 · Warum & Was"
  title: string;
  summary: string;
  learningGoals: string[];
  sections: HandbookSection[]; // Lehrbuch-Inhalte dieser Station
  slides: SlideId[];           // zugehörige Präsentationsfolien
  exercises: ExerciseId[];     // zugehörige Übungsaufgaben
};

type HandbookSection = {
  id: string;                 // "2.2-datenfluss"
  heading: string;
  body: RichBlock[];          // Absätze, Listen, Code, Tabellen, Bilder, Callouts
};

type Slide = {
  id: string;
  kind: "title" | "divider" | "content" | "summary";
  kicker?: string;
  title: string;
  body?: RichBlock[];
  speakerNotes: string;       // Sprechernotizen (wie im PPTX)
  background: "navy" | "white";
};

type Exercise = {
  id: string;
  stationId: number;
  title: string;
  type: ExerciseType;
  prompt: string;             // Aufgabenstellung
  hints: string[];            // gestaffelte Hinweise (progressive disclosure)
  solution: Solution;         // Soll-Lösung + Validierung
  xp: number;                 // Punkte für Fortschritt
};

type ExerciseType =
  | "prompt-craft"            // guten Claude-Code-Prompt formulieren
  | "claude-md-builder"       // CLAUDE.md-Abschnitt zusammenstellen
  | "code-fill"               // Lücken im Jenkinsfile/Skript füllen
  | "code-order"              // Pipeline-Stages in richtige Reihenfolge bringen
  | "terminal-sim"            // simulierte Shell-Session durchführen
  | "node-mapping"            // Stage ↔ Host/Label zuordnen (Drag&Drop)
  | "quiz";                   // Single/Multiple Choice
```

`RichBlock` ist eine diskriminierte Union (paragraph, list, code, table, image,
callout, quote). Render über eine `RichText`-Komponente, die alle Block-Typen
im Design-System darstellt.

---

## 6. Funktionsbereiche im Detail

### 6.1 Startseite `/`
- Hero mit Workshop-Titel, Untertitel und dem mitgelieferten Banner-Bild.
- Der „rote Faden" als sechs Karten (Stationen 1–6), je mit Icon, Kurzbeschreibung
  und Fortschrittsstatus (offen / begonnen / erledigt).
- Klick auf eine Karte → zugehörige Station.
- Sekundäre Einstiege: „Lehrbuch lesen", „Präsentation starten", „Fortschritt".
- Anzeige des Gesamtfortschritts (Aufgaben gelöst, Quiz-Score, gesammelte XP).

### 6.2 Stationsseiten `/station/:id`
Jede Station kombiniert Lehre und Praxis auf einer Seite:
- Kopf: Kicker, Titel, Lernziele als Liste.
- Lehrtext-Block (aus `HandbookSection`s der Station), mit Code, Diagrammen,
  Callouts und Tabellen.
- Eingebettete Übungsaufgaben der Station als aufklappbare Karten oder als
  Verlinkung in den Vollbild-Workspace `/exercise/:id`.
- „Weiter"-Navigation zur nächsten Station; Breadcrumb zum roten Faden.
- Mindestinhalte je Station (inhaltlich identisch zu Whitepaper/Deck):
  1. **Warum & Was:** Paradigmenwechsel (Abtippen → Spezifizieren), Lernziele,
     Ausgangslage mit Host-Tabelle, Domain/HTTPS, Sicherheitshinweis zu Keys.
  2. **Architektur:** Knoten & Rollen (4 Karten), Datenfluss-Diagramm (SVG),
     Begründung der Rollentrennung (Sicherheit, Skalierung, Stabilität).
  3. **Claude Code:** Arbeitszyklus Spezifizieren → Generieren → Prüfen →
     Korrigieren; Projektverzeichnis-Struktur; Sicherheitsprinzip „Mensch prüft".
  4. **CLAUDE.md:** acht Bausteine einer Spezifikation; vollständige Beispiel-
     CLAUDE.md (als Code-Block, kopierbar); die sieben Pipeline-Stages mit
     Host-/Label-Zuordnung; Plugin-Liste.
  5. **Prompten:** Drei-Zutaten-Muster (Zielartefakt, Quelle CLAUDE.md, prüfbare
     Bedingung); sechs Beispiel-Prompts; Gegenbeispiel „vage Prompts".
  6. **Durchführung:** Zeitplan, Abnahmekriterien, Bewertung der Arbeitsweise,
     Erweiterungen (JCasC, Container-Agent, Security-Stage).

### 6.3 Lehrbuch-Modus `/handbook`
- Das vollständige Whitepaper als durchgehender, gut typografierter Langtext.
- Klebrige Inhaltsverzeichnis-Sidebar mit Sprungmarken (Scrollspy hebt aktiven
  Abschnitt hervor).
- Kapitelstruktur entspricht dem Whitepaper:
  1. Einleitung & Zielsetzung (Lernziele, Voraussetzungen, vorbereitete Umgebung
     inkl. Host-Tabelle, Domain/HTTPS-Tabelle).
  2. Zielarchitektur (Knoten & Rollen, Datenfluss mit Diagramm).
  3. Claude Code als Provisionierungswerkzeug (Projektstruktur, Arbeitszyklus,
     Sicherheitshinweis).
  4. Die CLAUDE.md erstellen (Aufbau, vollständige Beispiel-CLAUDE.md).
  5. Anleitung zur Verwendung (schrittweises Vorgehen, sechs Beispiel-Prompts).
  6. Referenz-Jenkinsfile (vollständige declarative Pipeline).
  7. Übungsablauf & Bewertung (Zeitplan, Kriterien, Erweiterungen).
  8. Zusammenfassung.
- Jeder Code-Block hat einen „Kopieren"-Button.
- Volltextsuche über alle Kapitel (clientseitig, z. B. mit einfachem Index oder
  `fuse.js`), Treffer mit Sprung und Hervorhebung.
- Druck-/PDF-freundliches Stylesheet (`@media print`).

### 6.4 Präsentationsmodus `/present`
- Slide-Deck mit denselben Inhalten wie die PPTX-Vorlage (16 Folien):
  Titel (Banner) · roter Faden · Mindset · Ausgangslage (Hosts + Domain/HTTPS) ·
  Architektur-Divider · Knoten & Rollen · Datenfluss · Claude-Code-Divider ·
  Arbeitsweise + Projektstruktur · CLAUDE.md-Divider · acht Bausteine ·
  sieben Stages · Prompten-Divider · Prompt-Muster + Beispiel · Durchführung ·
  Zusammenfassung.
- Vollbild (Fullscreen-API). Tastatur: ←/→ blättern, `F` Vollbild, `S`
  Sprechernotizen ein/aus, `O` Übersicht (Grid aller Folien), `Esc` schließt.
- Sprechernotizen-Panel (Presenter-View), nur für die Trainerin sichtbar.
- Fortschrittsbalken/Folienzähler unten. 16:9-Bühne, zentriert, skaliert mit
  Fenstergröße. Dunkle Titel-/Divider-/Summary-Folien, helle Content-Folien.

### 6.5 Interaktive Übungen `/exercise/:id`
Vollbild-Workspace pro Aufgabe mit konsistentem Layout: links Aufgabenstellung
und Hinweise, rechts der interaktive Bereich. Pro Aufgabentyp:

- **prompt-craft:** Textfeld, in dem der/die Lernende einen Claude-Code-Prompt
  formuliert. Validierung gegen Kriterien-Checkliste (nennt Zielartefakt?
  verweist auf CLAUDE.md? enthält prüfbare Bedingung? nennt Host/Label korrekt?).
  Feedback je Kriterium (erfüllt/offen) + Musterlösung nach Versuch.
- **claude-md-builder:** Bausteine (Projektüberblick, Topologie, Installation,
  Konfiguration, Umgebung, Plugins, Pipeline, Akzeptanzkriterien) per Drag&Drop
  in sinnvolle Reihenfolge bringen und je Baustein die korrekten Stichpunkte aus
  einer Auswahl markieren. Validierung gegen Soll.
- **code-fill:** Monaco-Editor mit einem Jenkinsfile/Skript, in dem Lücken
  (`/* TODO */`) zu füllen sind (z. B. `agent { label '___' }`, `mvn ___`,
  scp-Ziel, certbot-Aufruf). Validierung per normalisiertem Vergleich oder
  Regex gegen die Soll-Lösung; tolerant gegenüber Whitespace.
- **code-order:** Die sieben Stages als Karten mischen; per Drag&Drop in die
  richtige Reihenfolge bringen. Sofort-Feedback bei richtiger Sequenz.
- **terminal-sim:** Simuliertes Terminal. Eine Befehlssequenz ist abzuarbeiten
  (z. B. `chmod 600 ...`, `ssh -i ... hostname`, Skript ausführen). Der Sim
  kennt erwartete Befehle und gibt vorbereitete, realistische Ausgaben zurück.
  Toleranz für Varianten; Hilfe bei falschen Befehlen. Kein echter Shell-Zugriff.
- **node-mapping:** Jede Stage einem Host/Label zuordnen (Checkout/Report →
  Controller, Build/Unit-Test/Deploy → maven/host2, Smoke-Wait/ITest →
  pytest/host4). Drag&Drop oder Verbindungslinien; Validierung gegen Soll.
- **quiz:** Single-/Multiple-Choice zu Konzepten (z. B. „Warum baut der
  Controller nicht selbst?", „Wozu dient Smoke-Wait?", „Warum gehört der
  Private Key nicht ins Repository?"). Erklärung nach Beantwortung.

Gemeinsames Verhalten aller Übungen:
- Zustände: nicht begonnen / in Arbeit / gelöst. Persistenz in localStorage.
- Gestaffelte Hinweise (erst nach Anforderung sichtbar), danach Musterlösung.
- XP-Vergabe bei Lösung; Beitrag zum Gesamtfortschritt.
- „Zurücksetzen" pro Aufgabe und global (mit Bestätigung).

### 6.6 Übergreifend
- **Glossar** `/glossary`: Fachbegriffe (CI/CD, Controller, Agent, Stage,
  Credential Store, JUnit, pytest, certbot, Reverse Proxy, Idempotenz, …) mit
  knappen, präzisen Definitionen; alphabetisch und durchsuchbar.
- **Fortschritts-Dashboard** `/progress`: Übersicht aller Stationen und Aufgaben,
  gelöst/offen, Quiz-Score, gesammelte XP, Reset-Option.
- **Kopierbare Code-Blöcke** überall, mit visuellem Bestätigungs-Feedback.
- **Deep-Linking:** Jede Station, Folie, Aufgabe und jedes Kapitel hat eine
  stabile URL.

---

## 7. Inhalte: Vollständigkeit (Pflicht)

Die App muss inhaltlich vollständig sein — sie ist die digitale Fassung von
Whitepaper **und** Präsentation. Insbesondere müssen folgende Artefakte 1:1 als
kopierbare, syntaxgehighlightete Code-Blöcke enthalten sein:

1. **Vollständige Beispiel-CLAUDE.md** für die Jenkins-Übung (Projektüberblick,
   vorbereitete Umgebung mit Keys, Topologie, Installation je Host inkl. nginx +
   Let's Encrypt/certbot auf host1, Konfiguration, Umgebung mit Domain/Ports,
   Plugins, sieben Pipeline-Stages, Akzeptanzkriterien inkl. HTTPS, Randbedingungen
   zu Idempotenz und Credential Store).
2. **Referenz-Jenkinsfile** (declarative, sieben Stages, `agent { label … }`
   je Stage, `junit`-Veröffentlichung, `sshagent`/`scp`-Deploy, Smoke-Wait per
   curl-Schleife, pytest mit `--junitxml`, `post`-Block).
3. **Installationsskript-Auszug host1** (OpenJDK 17, Jenkins LTS, nginx Reverse
   Proxy, certbot für `jenkins.example.com`, Auto-Renew; idempotent; Kopf-
   kommentar mit Voraussetzungen).
4. **Agenten-Setup-Auszug** (Parameter `ROLE=maven|pytest`; Maven bzw.
   Python/venv; Benutzer und Arbeitsverzeichnis).
5. **Python-Testsuite** `test_app.py` (pytest + requests; Health-Check
   `/actuator/health`; mind. zwei fachliche Endpunkte; JUnit-XML-Report).
6. **Sechs Beispiel-Prompts** (Controller-Installation inkl. TLS, Agenten-Setup,
   Plugins & Agent-Anbindung, Jenkinsfile, Python-Tests, Fehlersuche „Agent
   offline").
7. **Datenfluss-Diagramm** als SVG (vier Knoten, durchgezogene Pfeile =
   Artefakt-/Datenfluss, gestrichelt = Orchestrierung durch den Controller).

Quelle dieser Inhalte ist das begleitende Whitepaper/Deck; übernimm die Texte
sinngemäß und vollständig. Wenn dir Originaltexte als Dateien vorliegen, lies sie
aus und übernimm sie; andernfalls erzeuge inhaltsgleiche Fassungen gemäß den
Fakten in Abschnitt 5.1.

---

## 8. Projektstruktur (Zielbild)

```
jenkins-workshop-app/
├─ CLAUDE.md                 # diese Datei
├─ DECISIONS.md              # getroffene Annahmen/Abweichungen
├─ README.md                 # Setup, Scripts, Deployment
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tailwind.config.js
├─ tsconfig.json
├─ public/
│   └─ assets/               # Banner-PNG, Diagramm-SVG, Fonts
├─ src/
│   ├─ main.tsx
│   ├─ App.tsx               # Router, Layout, Providers
│   ├─ theme/                # Tokens, globale Styles
│   ├─ components/           # UI: Topbar, Sidebar, RichText, CodeBlock,
│   │                        #     Callout, Card, ProgressBadge, CopyButton …
│   ├─ features/
│   │   ├─ stations/
│   │   ├─ handbook/
│   │   ├─ present/          # Slide-Engine, SpeakerNotes, Overview-Grid
│   │   ├─ exercises/        # je Aufgabentyp eine Komponente + Validator
│   │   ├─ glossary/
│   │   └─ progress/
│   ├─ content/
│   │   ├─ domain.ts         # Hosts, Domain, Stages, Plugins (Single Source)
│   │   ├─ stations.ts
│   │   ├─ handbook.ts
│   │   ├─ slides.ts
│   │   ├─ exercises.ts
│   │   ├─ glossary.ts
│   │   └─ snippets/         # claude-md.md, Jenkinsfile, install.sh, test_app.py
│   ├─ lib/
│   │   ├─ storage.ts        # localStorage-Abstraktion (robust)
│   │   ├─ progress.ts       # Fortschrittslogik/Reducer
│   │   └─ validate/         # Validatoren je Aufgabentyp (rein, getestet)
│   └─ types.ts
└─ tests/                    # vitest-Tests für Validatoren & Kernkomponenten
```

---

## 9. Qualität, Tests, Barrierefreiheit

- **Validatoren sind reine Funktionen** (`lib/validate/*`) und vollständig
  unit-getestet (richtige/falsche Eingaben, Whitespace-Toleranz, Teil-Lösungen).
- **Komponententests** für: Fortschritts-Reducer, CLAUDE.md-Builder-Validierung,
  Stage-Reihenfolge-Validierung, Prompt-Kriterien-Prüfung.
- **A11y:** Tastaturnavigation in Präsentation und Drag&Drop (mit Tastatur-
  Alternative!), Fokus-Management bei Routenwechsel, `aria`-Rollen, AA-Kontraste.
- **Performance:** Code-Splitting pro Route (lazy), Monaco nur auf Übungsseiten
  laden. Initiales Bundle schlank halten.
- **Robustheit:** App funktioniert ohne localStorage (Fallback in-memory) und
  ohne Netzwerk zur Laufzeit.

---

## 10. Deliverables & Setup

- Lauffähiges Projekt mit:
  - `npm install`
  - `npm run dev` (Entwicklungsserver)
  - `npm run build` (statisches Bundle in `dist/`)
  - `npm run preview` (Vorschau des Builds)
  - `npm run test` (vitest)
  - `npm run lint`
- `README.md` mit Kurzanleitung, Scripts, Deployment-Hinweis und der Stelle, an
  der `DOMAIN` und IPs zentral geändert werden.
- `DECISIONS.md` mit allen getroffenen Annahmen und Bibliotheks-Alternativen.

---

## 11. Akzeptanzkriterien (Definition of Done)

Die Aufgabe gilt als erfüllt, wenn:

1. `npm install && npm run build` fehlerfrei durchläuft; `npm run preview` zeigt
   die App; TypeScript läuft im `strict`-Modus ohne Fehler; Lint ist sauber.
2. Alle Routen aus Abschnitt 4 existieren und sind erreichbar; Deep-Links
   funktionieren (Hash-Router).
3. Der **rote Faden** ist durchgängig: Startseite → sechs Stationen → Aufgaben,
   mit sichtbarem, persistentem Fortschritt.
4. Der **Lehrbuch-Modus** enthält alle acht Whitepaper-Kapitel inkl. der
   vollständigen Beispiel-CLAUDE.md und des Referenz-Jenkinsfile als kopierbare,
   gehighlightete Code-Blöcke; Suche und Scrollspy funktionieren.
5. Der **Präsentationsmodus** zeigt die 16 Folien mit Sprechernotizen, Vollbild,
   Tastatursteuerung und Übersichts-Grid.
6. Es gibt **mindestens 12 interaktive Übungen**, die alle sieben Aufgabentypen
   aus 5.2 abdecken; jede hat Aufgabenstellung, gestaffelte Hinweise, funktionierende
   Validierung mit Feedback und eine Musterlösung.
7. Alle Infrastruktur-Fakten (Hosts, IPs, Keys, Labels, Domain/HTTPS, Stages,
   Plugins, Versionen) stammen aus `content/domain.ts` und sind über Stationen,
   Lehrbuch, Slides und Übungen **widerspruchsfrei** identisch.
8. Das Design-System „Soft Precision" ist konsequent umgesetzt; UI und Inhalte
   sind durchgängig deutsch, sachlich, ohne Buzzwords; englische Fachbegriffe
   bleiben erhalten; keine Accent-Stripes als Motiv.
9. Fortschritt, Quiz-Antworten und gelöste Aufgaben überleben einen Reload
   (localStorage) und lassen sich zurücksetzen.
10. Grundlegende A11y ist gegeben (Tastatur, Fokus, Kontrast, aria); Drag&Drop hat
    eine Tastatur-Alternative.
11. Validator-Unit-Tests sind vorhanden und grün (`npm run test`).
12. `README.md` und `DECISIONS.md` sind vorhanden und korrekt.

---

## 12. Randbedingungen & Hinweise für die Umsetzung

- Beginne mit Gerüst und Datenmodell (`content/domain.ts`, Typen, Routing,
  Layout), dann Lehrbuch, dann Präsentation, dann Übungen — inkrementell, jeweils
  lauffähig committen.
- Trenne Inhalt strikt von Darstellung; keine Texte hart in Komponenten.
- Keine echten Secrets, IPs oder Keys aus realen Umgebungen einbauen; die
  Platzhalter aus 5.1 verwenden. Der Sicherheitsgrundsatz (Keys gehören nicht ins
  Repository, Deploy über Credential Store) wird auch inhaltlich vermittelt.
- Simulationen sind deterministisch und offline; niemals echte SSH-/Shell-Befehle
  ausführen.
- Dokumentiere jede nennenswerte Annahme in `DECISIONS.md`.
- Halte die sieben Stages, die Host-/Label-Zuordnung und die Akzeptanzkriterien
  exakt konsistent mit Abschnitt 5.1 — sie sind der fachliche Kern des Workshops.
