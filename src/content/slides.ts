import type { Slide } from '../types';
import { p, ul, ol, img, hostTable, httpsTable, stageTable, code } from './blocks';
import { JENKINS_URL } from './domain';
import { EXAMPLE_PROMPTS } from './snippets';

// 16 Folien — inhaltsgleich zur PPTX-Vorlage. Dunkle Titel-/Divider-/Summary-
// Folien, helle Content-Folien.

export const SLIDES: Slide[] = [
  {
    id: 's-title',
    kind: 'title',
    background: 'navy',
    kicker: 'DevOps-Workshop',
    title: 'Jenkins-Infrastruktur mit Claude Code',
    body: [
      p('Eine verteilte CI/CD-Umgebung spezifizieren statt abtippen.'),
      img('./assets/banner.svg', 'Workshop-Banner'),
    ],
    speakerNotes:
      'Begrüßung. Heute bauen wir gemeinsam eine verteilte Jenkins-Umgebung über vier Hosts — ' +
      'nicht durch Abtippen, sondern durch Spezifizieren. Claude Code generiert, wir prüfen.',
  },
  {
    id: 's-faden',
    kind: 'content',
    background: 'white',
    kicker: 'Überblick',
    title: 'Der rote Faden',
    body: [
      ol(
        'Warum & Was — der Paradigmenwechsel.',
        'Architektur — vier Knoten, klare Rollen.',
        'Claude Code — der Arbeitszyklus.',
        'CLAUDE.md — die prüfbare Spezifikation.',
        'Prompten — Zielartefakt, Quelle, Bedingung.',
        'Durchführung — Ablauf und Abnahme.',
      ),
    ],
    speakerNotes:
      'Sechs Stationen strukturieren den Tag. Jede Station verbindet Theorie (Lehrbuch), ' +
      'Vortrag (diese Folien) und Praxis (interaktive Übungen).',
  },
  {
    id: 's-mindset',
    kind: 'content',
    background: 'white',
    kicker: 'Station 1',
    title: 'Mindset: Spezifizieren statt Abtippen',
    body: [
      ul(
        'Nicht „welche Befehle tippe ich?“, sondern „welches prüfbare Ziel beschreibe ich?“.',
        'Claude Code erzeugt Skripte und Pipeline aus der Spezifikation.',
        'Der Mensch prüft, korrigiert und verantwortet das Ergebnis.',
      ),
    ],
    speakerNotes:
      'Kernbotschaft des Tages. Die Verantwortung verschiebt sich vom Tippen zum Spezifizieren und ' +
      'Prüfen. Das ist kein Kontrollverlust, sondern eine Verlagerung der Sorgfalt.',
  },
  {
    id: 's-ausgangslage',
    kind: 'content',
    background: 'white',
    kicker: 'Station 1',
    title: 'Ausgangslage: Hosts, Domain & HTTPS',
    body: [hostTable(), httpsTable()],
    speakerNotes:
      'Vier vorbereitete Ubuntu-VMs, Zugang per SSH-Key als ubuntu. Der DNS-A-Record für die ' +
      'Domain zeigt bereits auf host1; HTTPS richten wir im Installationsprozess ein. ' +
      'Sicherheitshinweis: private Schlüssel niemals ins Repository.',
  },
  {
    id: 's-arch-divider',
    kind: 'divider',
    background: 'navy',
    kicker: 'Station 2',
    title: 'Architektur',
    speakerNotes: 'Übergang zur Topologie: vier Knoten mit klar getrennten Rollen.',
  },
  {
    id: 's-knoten',
    kind: 'content',
    background: 'white',
    kicker: 'Station 2',
    title: 'Knoten & Rollen',
    body: [
      ul(
        'host1 — Controller: orchestriert, Web-UI (HTTPS), Checkout & Report.',
        'host2 — Agent maven: Build, Unit-Test, Deploy.',
        'host3 — Deployment-Ziel: systemd-Service demo-app.',
        'host4 — Agent pytest: Smoke-Wait & Integrationstests.',
      ),
    ],
    speakerNotes:
      'Der Controller baut nicht selbst. Build/Deploy auf maven (host2), Test auf pytest (host4), ' +
      'Zielsystem ist host3.',
  },
  {
    id: 's-datenfluss',
    kind: 'content',
    background: 'white',
    kicker: 'Station 2',
    title: 'Datenfluss',
    body: [
      img(
        './assets/datenfluss.svg',
        'Datenfluss-Diagramm: Controller orchestriert, JAR fließt zu host3, host4 testet host3.',
      ),
    ],
    speakerNotes:
      'Durchgezogen = Artefakt-/Datenfluss (JAR nach host3, HTTP-Tests), gestrichelt = ' +
      'Orchestrierung durch den Controller. Rollentrennung dient Sicherheit, Skalierung, Stabilität.',
  },
  {
    id: 's-cc-divider',
    kind: 'divider',
    background: 'navy',
    kicker: 'Station 3',
    title: 'Claude Code',
    speakerNotes: 'Wie arbeiten wir mit dem Werkzeug?',
  },
  {
    id: 's-arbeitsweise',
    kind: 'content',
    background: 'white',
    kicker: 'Station 3',
    title: 'Arbeitsweise & Projektstruktur',
    body: [
      ol('Spezifizieren', 'Generieren', 'Prüfen', 'Korrigieren'),
      code(
        'text',
        `jenkins-infra/
├─ CLAUDE.md
├─ scripts/{install-host1.sh, setup-agent.sh}
├─ Jenkinsfile
└─ tests/test_app.py`,
      ),
    ],
    speakerNotes:
      'Der Zyklus wiederholt sich, bis die Akzeptanzkriterien erfüllt sind. Die Projektstruktur ' +
      'hält Spezifikation, Skripte, Pipeline und Tests zusammen.',
  },
  {
    id: 's-md-divider',
    kind: 'divider',
    background: 'navy',
    kicker: 'Station 4',
    title: 'CLAUDE.md',
    speakerNotes: 'Die Spezifikation ist das Herzstück.',
  },
  {
    id: 's-bausteine',
    kind: 'content',
    background: 'white',
    kicker: 'Station 4',
    title: 'Acht Bausteine einer Spezifikation',
    body: [
      ol(
        'Projektüberblick',
        'Topologie',
        'Installation (inkl. nginx + certbot)',
        'Konfiguration',
        'Umgebung (Domain, Ports)',
        'Plugins',
        'Pipeline (sieben Stages)',
        'Akzeptanzkriterien (inkl. HTTPS)',
      ),
    ],
    speakerNotes:
      'Diese acht Bausteine machen die Spezifikation vollständig und prüfbar. Randbedingungen: ' +
      'Idempotenz und Credential Store.',
  },
  {
    id: 's-stages',
    kind: 'content',
    background: 'white',
    kicker: 'Station 4',
    title: 'Die sieben Pipeline-Stages',
    body: [stageTable()],
    speakerNotes:
      'Checkout & Report auf dem Controller, Build/Unit-Test/Deploy auf maven, Smoke-Wait & ITest ' +
      'auf pytest. Diese Zuordnung ist der fachliche Kern.',
  },
  {
    id: 's-prompt-divider',
    kind: 'divider',
    background: 'navy',
    kicker: 'Station 5',
    title: 'Prompten',
    speakerNotes: 'Wie formulieren wir gute Prompts?',
  },
  {
    id: 's-prompt-muster',
    kind: 'content',
    background: 'white',
    kicker: 'Station 5',
    title: 'Prompt-Muster & Beispiel',
    body: [
      p('Drei Zutaten: **Zielartefakt** · **Quelle (CLAUDE.md)** · **prüfbare Bedingung**.'),
      code('text', EXAMPLE_PROMPTS[3].prompt, { caption: 'Beispiel: Jenkinsfile' }),
    ],
    speakerNotes:
      'Ein guter Prompt nennt, was entstehen soll, woher die Fakten stammen und woran man Erfolg ' +
      'erkennt. Gegenbeispiel: „Richte mir Jenkins ein.“ — unprüfbar.',
  },
  {
    id: 's-durchfuehrung',
    kind: 'content',
    background: 'white',
    kicker: 'Station 6',
    title: 'Durchführung & Abnahme',
    body: [
      ul(
        'Controller + HTTPS provisionieren, Agenten anbinden.',
        'Jenkinsfile generieren, Pipeline starten.',
        'Abnahme: HTTPS erreichbar, Agenten online, alle Stages grün, Deploy & Tests bestanden.',
      ),
    ],
    speakerNotes:
      'Bewertet wird die Arbeitsweise: Qualität der Spezifikation, Sorgfalt beim Prüfen, sicherer ' +
      'Umgang mit Credentials, Idempotenz. Erweiterungen: JCasC, Container-Agent, Security-Stage.',
  },
  {
    id: 's-zusammenfassung',
    kind: 'summary',
    background: 'navy',
    kicker: 'Abschluss',
    title: 'Zusammenfassung',
    body: [
      ul(
        'Spezifizieren statt abtippen — der Mensch prüft.',
        'Rollentrennung über vier Hosts: Sicherheit, Skalierung, Stabilität.',
        'Sieben Stages von Checkout bis Report.',
        `Ergebnis: reproduzierbare CI/CD-Umgebung unter ${JENKINS_URL}.`,
      ),
    ],
    speakerNotes:
      'Zusammenfassen, Fragen sammeln, auf die interaktiven Übungen und das Lehrbuch in der App ' +
      'verweisen.',
  },
];

export const slideById = (id: string) => SLIDES.find((s) => s.id === id);
