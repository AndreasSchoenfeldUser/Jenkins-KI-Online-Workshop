import type { HandbookSection } from '../types';
import {
  p,
  ul,
  ol,
  code,
  callout,
  img,
  hostTable,
  httpsTable,
  versionTable,
  stageTable,
  pluginTable,
} from './blocks';
import {
  CLAUDE_MD_EXAMPLE,
  JENKINSFILE,
  INSTALL_HOST1,
  SETUP_AGENT,
  TEST_APP_PY,
  EXAMPLE_PROMPTS,
} from './snippets';
import { DOMAIN, JENKINS_URL, WORKSHOP_ACCEPTANCE, WORKSHOP_REQUIREMENTS } from './domain';

// Das vollstaendige Whitepaper als acht Kapitel. Jede Section hat eine stabile id
// (Deep-Linking, Scrollspy). Stationen referenzieren diese ids.

export const HANDBOOK: HandbookSection[] = [
  // ----------------------------------------------------------------------
  {
    id: '1-einleitung',
    heading: '1. Einleitung & Zielsetzung',
    body: [
      p(
        'Dieser Workshop vermittelt einen Paradigmenwechsel in der Infrastruktur-Arbeit: weg ' +
          'vom zeilenweisen Abtippen von Befehlen, hin zum **Spezifizieren** einer gewünschten ' +
          'Zielumgebung, die ein KI-gestütztes Werkzeug — Claude Code — generiert. Sie prüfen, ' +
          'korrigieren und verantworten das Ergebnis.',
      ),
      p(
        'Im Tagesverlauf entsteht eine verteilte Jenkins-CI/CD-Umgebung über vier Hosts: ein ' +
          'Controller mit HTTPS-Zugang, ein Build-Agent (Maven/JUnit), ein Deployment-Ziel und ' +
          'ein Test-Agent (Python/pytest).',
      ),
      { kind: 'heading', level: 3, text: 'Lernziele', id: '1.1-lernziele' },
      ul(
        'Eine verteilte Jenkins-Topologie verstehen und begründen (Rollentrennung).',
        'Eine CLAUDE.md als prüfbare Spezifikation formulieren.',
        'Mit Claude Code idempotente Provisionierungsskripte und eine declarative Pipeline erzeugen.',
        'Generierte Artefakte kritisch prüfen — der Mensch trägt die Verantwortung.',
      ),
      { kind: 'heading', level: 3, text: 'Voraussetzungen', id: '1.2-voraussetzungen' },
      ul(
        'Grundkenntnisse Linux-Kommandozeile, SSH und Git.',
        'Verständnis von CI/CD-Grundbegriffen (Build, Test, Deployment).',
        'Ein Konto/Zugang zu Claude Code in der Workshop-Umgebung.',
      ),
      { kind: 'heading', level: 3, text: 'Vorbereitete Umgebung', id: '1.3-umgebung' },
      p(
        'Vier VMs (Ubuntu 24.04 LTS) sind bereitgestellt und im Basis-Netzwerk verbunden. Der ' +
          'Zugang erfolgt per SSH-Key als Benutzer `ubuntu` (sudo-berechtigt).',
      ),
      hostTable(),
      versionTable(),
      { kind: 'heading', level: 3, text: 'Domain & HTTPS', id: '1.4-https' },
      p(
        `Der Controller ist öffentlich unter \`${DOMAIN}\` erreichbar. Der DNS-A-Record existiert ` +
          'bereits; HTTPS wird im Installationsprozess über Let’s Encrypt eingerichtet.',
      ),
      httpsTable(),
      callout(
        'security',
        'Private Schlüssel gehören niemals ins Repository. Sie liegen lokal unter ~/.ssh/, ' +
          'das Deployment nutzt ausschließlich den Jenkins Credential Store (deploy-key).',
        'Sicherheitshinweis zu Keys',
      ),
    ],
  },

  // ----------------------------------------------------------------------
  {
    id: '2-architektur',
    heading: '2. Zielarchitektur',
    body: [
      p(
        'Die Umgebung trennt Verantwortlichkeiten konsequent auf vier Knoten. Der Controller ' +
          'orchestriert nur — er baut und testet nicht selbst.',
      ),
      { kind: 'heading', level: 3, text: 'Knoten & Rollen', id: '2.1-knoten' },
      hostTable(),
      ul(
        '**host1 — Controller:** Jenkins-Steuerung, Web-UI (HTTPS), Checkout und Report.',
        '**host2 — Agent maven:** Build, Unit-Test und Deploy (führt scp/ssh aus).',
        '**host3 — Deployment-Ziel:** betreibt die Anwendung als systemd-Service demo-app.',
        '**host4 — Agent pytest:** Smoke-Wait und Integrationstests gegen host3.',
      ),
      { kind: 'heading', level: 3, text: 'Datenfluss', id: '2.2-datenfluss' },
      img(
        './assets/datenfluss.svg',
        'Datenfluss zwischen den vier Hosts: Controller orchestriert (gestrichelt), ' +
          'Build-Artefakt und Tests fließen durchgezogen.',
        'Durchgezogene Pfeile = Artefakt-/Datenfluss, gestrichelt = Orchestrierung durch den Controller.',
      ),
      p(
        'Der Controller verteilt die Arbeit an die Agenten (gestrichelt). Das Build-Artefakt ' +
          '(JAR) wandert von host2 per scp auf host3; der Test-Agent host4 prüft die laufende ' +
          'Anwendung auf host3 über HTTP.',
      ),
      { kind: 'heading', level: 3, text: 'Begründung der Rollentrennung', id: '2.3-begruendung' },
      ul(
        '**Sicherheit:** Der Controller hält keine Build-Toolchains und keine Deploy-Schlüssel ' +
          'im Klartext; Credentials werden nur zur Laufzeit in Stages gebunden.',
        '**Skalierung:** Build- und Testlast liegen auf Agenten, die unabhängig ergänzt werden ' +
          'können; der Controller bleibt schlank.',
        '**Stabilität:** Ein abstürzender Build gefährdet nicht die Steuerungsinstanz; Agenten ' +
          'sind austausch- und wiederherstellbar.',
      ),
    ],
  },

  // ----------------------------------------------------------------------
  {
    id: '3-claude-code',
    heading: '3. Claude Code als Provisionierungswerkzeug',
    body: [
      p(
        'Claude Code generiert Skripte und Konfigurationen aus einer Spezifikation. Es ersetzt ' +
          'nicht das Urteil der Ingenieurin — es beschleunigt das Erzeugen prüfbarer Artefakte.',
      ),
      { kind: 'heading', level: 3, text: 'Projektverzeichnis-Struktur', id: '3.1-struktur' },
      code(
        'text',
        `jenkins-infra/
├─ CLAUDE.md            # Spezifikation (Single Source of Truth)
├─ scripts/
│  ├─ install-host1.sh  # Controller + nginx + certbot
│  └─ setup-agent.sh    # ROLE=maven|pytest
├─ Jenkinsfile          # declarative Pipeline (sieben Stages)
└─ tests/
   └─ test_app.py       # pytest-Integrationstests`,
        { caption: 'Empfohlene Projektstruktur im Repository.' },
      ),
      { kind: 'heading', level: 3, text: 'Arbeitszyklus', id: '3.2-zyklus' },
      ol(
        '**Spezifizieren:** Ziel und prüfbare Bedingungen in CLAUDE.md/Prompt festlegen.',
        '**Generieren:** Claude Code erzeugt Skript/Pipeline/Test.',
        '**Prüfen:** Ausgabe lesen, gegen die Spezifikation und Sicherheitsregeln abgleichen.',
        '**Korrigieren:** gezielt nachschärfen (Prompt präzisieren), erneut generieren.',
      ),
      callout(
        'security',
        'Sicherheitsprinzip „Mensch prüft“: Jede generierte Änderung wird vor dem Anwenden ' +
          'gelesen und verstanden. Kein Skript wird ungeprüft auf den Hosts ausgeführt.',
        'Verantwortung bleibt beim Menschen',
      ),
    ],
  },

  // ----------------------------------------------------------------------
  {
    id: '4-claude-md',
    heading: '4. Die CLAUDE.md erstellen',
    body: [
      p(
        'Die CLAUDE.md ist die verbindliche Spezifikation. Sie macht implizite Annahmen explizit ' +
          'und prüfbar. Bewährt haben sich acht Bausteine:',
      ),
      ol(
        '**Projektüberblick** — Ziel, Umfang, Nicht-Ziele.',
        '**Topologie** — Hosts, Rollen, IPs, Labels.',
        '**Installation** — je Host, idempotent, inkl. nginx + Let’s Encrypt auf host1.',
        '**Konfiguration** — Jenkins-URL, Agenten-Anbindung, Credentials.',
        '**Umgebung** — Domain, Ports, Health-Endpoint.',
        '**Plugins** — benötigte Jenkins-Plugins.',
        '**Pipeline** — die sieben Stages mit Host-/Label-Zuordnung.',
        '**Akzeptanzkriterien** — prüfbare Definition of Done, inkl. HTTPS.',
      ),
      callout(
        'info',
        'Randbedingungen gehören dazu: Idempotenz aller Skripte und ausschließliche Nutzung des ' +
          'Credential Store für Secrets.',
      ),
      { kind: 'heading', level: 3, text: 'Vollständige Beispiel-CLAUDE.md', id: '4.1-beispiel' },
      code('markdown', CLAUDE_MD_EXAMPLE, {
        caption: 'Kopierbare Beispiel-CLAUDE.md für die Jenkins-Übung.',
        collapsible: true,
      }),
      pluginTable(),
    ],
  },

  // ----------------------------------------------------------------------
  {
    id: '5-anleitung',
    heading: '5. Anleitung zur Verwendung',
    body: [
      p('Schrittweises Vorgehen vom leeren Repository bis zur grünen Pipeline:'),
      ol(
        'CLAUDE.md anlegen und mit den acht Bausteinen füllen.',
        'Controller installieren (install-host1.sh) inkl. HTTPS prüfen.',
        'Agenten einrichten (setup-agent.sh mit ROLE=maven bzw. pytest).',
        'Plugins installieren und beide Agenten per ssh-slaves anbinden.',
        'Jenkinsfile generieren und die Pipeline anlegen.',
        'pytest-Tests ergänzen, Pipeline starten, Reports prüfen.',
      ),
      { kind: 'heading', level: 3, text: 'Das Drei-Zutaten-Muster', id: '5.1-muster' },
      p(
        'Ein guter Prompt nennt drei Dinge: das **Zielartefakt** (was soll entstehen), die ' +
          '**Quelle** (Verweis auf CLAUDE.md/Abschnitt) und eine **prüfbare Bedingung** (woran ' +
          'erkennt man Erfolg).',
      ),
      callout(
        'warning',
        'Gegenbeispiel (vage): „Richte mir Jenkins ein.“ — kein Zielartefakt, keine Quelle, ' +
          'keine prüfbare Bedingung. Solche Prompts erzeugen unprüfbare, beliebige Ergebnisse.',
        'Vage Prompts vermeiden',
      ),
      { kind: 'heading', level: 3, text: 'Sechs Beispiel-Prompts', id: '5.2-prompts' },
      ...EXAMPLE_PROMPTS.flatMap((ex) => [
        { kind: 'heading' as const, level: 4 as const, text: ex.title },
        code('text', ex.prompt),
      ]),
    ],
  },

  // ----------------------------------------------------------------------
  {
    id: '6-jenkinsfile',
    heading: '6. Referenz-Jenkinsfile',
    body: [
      p(
        'Die vollständige declarative Pipeline mit sieben Stages. Jede Stage wählt ihren Agenten ' +
          'über `agent { label … }`; Unit-Test und ITest veröffentlichen JUnit-Reports, Deploy ' +
          'nutzt `sshagent` mit dem Credential deploy-key, Smoke-Wait wartet per curl-Schleife.',
      ),
      stageTable(),
      code('groovy', JENKINSFILE, {
        caption: 'Vollständiges, kopierbares Referenz-Jenkinsfile.',
        collapsible: true,
      }),
      { kind: 'heading', level: 3, text: 'Installationsskript host1 (Auszug)', id: '6.1-install' },
      code('bash', INSTALL_HOST1, {
        caption: 'host1: OpenJDK 17, Jenkins LTS, nginx Reverse Proxy, certbot, Auto-Renew (idempotent).',
        collapsible: true,
      }),
      { kind: 'heading', level: 3, text: 'Agenten-Setup (Auszug)', id: '6.2-agent' },
      code('bash', SETUP_AGENT, {
        caption: 'setup-agent.sh: ROLE=maven|pytest.',
        collapsible: true,
      }),
      { kind: 'heading', level: 3, text: 'Python-Testsuite', id: '6.3-tests' },
      code('python', TEST_APP_PY, {
        caption: 'tests/test_app.py: Health-Check plus zwei fachliche Endpunkte, JUnit-XML.',
        collapsible: true,
      }),
    ],
  },

  // ----------------------------------------------------------------------
  {
    id: '7-ablauf',
    heading: '7. Übungsablauf & Bewertung',
    body: [
      {
        kind: 'heading',
        level: 3,
        text: 'Checkliste: Was zur Durchführung benötigt wird',
        id: '7.0-checkliste',
      },
      p(
        'Bevor der Workshop startet, müssen Infrastruktur, Zugänge und Beispielartefakte ' +
          'bereitstehen. Die folgende Checkliste fasst alles zusammen, gruppiert nach ' +
          'Verantwortungsbereich.',
      ),
      ...WORKSHOP_REQUIREMENTS.flatMap((group) => [
        { kind: 'heading' as const, level: 4 as const, text: group.title },
        ul(...group.items),
      ]),
      callout(
        'info',
        'Die Hosts müssen zu Beginn nur als leere Ubuntu-VMs bereitstehen — OpenJDK, Jenkins, ' +
          'Maven, Python, nginx und certbot installieren die Teilnehmenden im Workshop selbst ' +
          'über die generierten Provisionierungsskripte.',
      ),
      { kind: 'heading', level: 3, text: 'Zeitplan (Richtwert)', id: '7.1-zeitplan' },
      ul(
        '09:00 — Einführung, Mindset, Ausgangslage.',
        '10:00 — Architektur & CLAUDE.md.',
        '11:00 — Controller + HTTPS provisionieren.',
        '13:00 — Agenten einrichten und anbinden.',
        '14:30 — Jenkinsfile & Pipeline.',
        '16:00 — Integrationstests, Abnahme, Retrospektive.',
      ),
      { kind: 'heading', level: 3, text: 'Abnahmekriterien', id: '7.2-abnahme' },
      ul(...WORKSHOP_ACCEPTANCE),
      { kind: 'heading', level: 3, text: 'Bewertung der Arbeitsweise', id: '7.3-bewertung' },
      ul(
        'Qualität der Spezifikation (prüfbare Akzeptanzkriterien).',
        'Sorgfalt beim Prüfen generierter Artefakte.',
        'Sicherer Umgang mit Credentials und Schlüsseln.',
        'Idempotenz und Wiederholbarkeit der Skripte.',
      ),
      { kind: 'heading', level: 3, text: 'Erweiterungen', id: '7.4-erweiterungen' },
      ul(
        '**JCasC** (Jenkins Configuration as Code) statt manueller UI-Konfiguration.',
        '**Container-Agent** (Docker/Kubernetes) statt statischer SSH-Agenten.',
        '**Security-Stage** (z. B. Dependency-/Container-Scan) in die Pipeline aufnehmen.',
      ),
    ],
  },

  // ----------------------------------------------------------------------
  {
    id: '8-zusammenfassung',
    heading: '8. Zusammenfassung',
    body: [
      p(
        'Sie haben eine verteilte Jenkins-Umgebung nicht zusammengetippt, sondern **spezifiziert**: ' +
          'die CLAUDE.md beschreibt das Ziel prüfbar, Claude Code erzeugt die Artefakte, und Sie ' +
          'prüfen und verantworten das Ergebnis.',
      ),
      ul(
        'Rollentrennung über vier Hosts erhöht Sicherheit, Skalierbarkeit und Stabilität.',
        'Die sieben Stages bilden den Weg von Checkout bis Report ab.',
        'HTTPS, Credentials im Store und Idempotenz sind keine Extras, sondern Akzeptanzkriterien.',
      ),
      callout(
        'success',
        `Ergebnis: eine reproduzierbare CI/CD-Umgebung, erreichbar unter ${JENKINS_URL}, deren ` +
          'Pipeline alle sieben Stages grün durchläuft.',
      ),
    ],
  },
];

export const handbookById = (id: string) => HANDBOOK.find((s) => s.id === id);
