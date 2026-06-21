// ============================================================================
// Single Source of Truth — Infrastruktur-Fakten der Jenkins-Uebung.
// Alle Stationen, das Lehrbuch, die Slides und die Uebungen referenzieren
// ausschliesslich diese Konstanten. Widersprueche sind ein Fehler (siehe
// CLAUDE.md Abschnitt 5.1 und Akzeptanzkriterium 7).
// ============================================================================

// Zentral aenderbarer Platzhalter — an genau einer Stelle definiert.
export const DOMAIN = 'jenkins.example.com';
export const JENKINS_URL = `https://${DOMAIN}`;

export type HostRole = 'controller' | 'build' | 'deploy' | 'test';

export type Host = {
  id: string; // host1..host4
  role: string; // Klartext-Rolle
  roleKind: HostRole;
  ip: string;
  sshKey: string; // privater Schluessel-Pfad (Platzhalter)
  label: string | null; // Jenkins-Agent-Label
};

export const HOSTS: Host[] = [
  {
    id: 'host1',
    role: 'Jenkins Controller',
    roleKind: 'controller',
    ip: '10.0.0.11',
    sshKey: '~/.ssh/host1_ed25519',
    label: null,
  },
  {
    id: 'host2',
    role: 'Agent I — Build',
    roleKind: 'build',
    ip: '10.0.0.12',
    sshKey: '~/.ssh/host2_ed25519',
    label: 'maven',
  },
  {
    id: 'host3',
    role: 'Deployment-Ziel',
    roleKind: 'deploy',
    ip: '10.0.0.13',
    sshKey: '~/.ssh/host3_ed25519',
    label: null,
  },
  {
    id: 'host4',
    role: 'Agent II — Test',
    roleKind: 'test',
    ip: '10.0.0.14',
    sshKey: '~/.ssh/host4_ed25519',
    label: 'pytest',
  },
];

export const hostById = (id: string): Host | undefined => HOSTS.find((h) => h.id === id);

// ----------------------------------------------------------------------------
// Domain & HTTPS (host1)
// ----------------------------------------------------------------------------
export const HTTPS_FACTS = {
  domain: DOMAIN,
  dns: 'DNS-A-Record ist bereits erstellt und zeigt auf host1.',
  cert: 'HTTPS über Let’s Encrypt (certbot), in den Installationsprozess integriert.',
  proxy: 'nginx als Reverse Proxy: 443 → 127.0.0.1:8080, 80 → 443 (Redirect).',
  renew: 'Automatische Zertifikatserneuerung via systemd-Timer.',
  url: JENKINS_URL,
} as const;

// ----------------------------------------------------------------------------
// Vorbereitete Umgebung
// ----------------------------------------------------------------------------
export const ENVIRONMENT = {
  vms: 'Vier VMs (Ubuntu 24.04 LTS) sind bereitgestellt, Basis-Netzwerk eingerichtet.',
  access: 'Zugang per SSH-Key als Benutzer ubuntu (sudo-berechtigt).',
  versions: {
    java: 'OpenJDK 17 (Temurin)',
    maven: 'Maven 3.9.x',
    python: 'Python 3.12',
    jenkins: 'Jenkins LTS',
    os: 'Ubuntu 24.04 LTS',
  },
} as const;

// ----------------------------------------------------------------------------
// Sieben Pipeline-Stages (declarative, Pipeline as Code)
// ----------------------------------------------------------------------------
export type Stage = {
  n: number;
  id: string;
  name: string;
  description: string;
  hostId: string; // ausfuehrender Host
  agentLabel: string | null; // Jenkins-Label oder null (Controller)
  command?: string;
  credential?: string;
};

export const STAGES: Stage[] = [
  {
    n: 1,
    id: 'checkout',
    name: 'Checkout',
    description: 'Quellcode aus Git holen.',
    hostId: 'host1',
    agentLabel: null,
  },
  {
    n: 2,
    id: 'build',
    name: 'Build',
    description: 'Anwendung kompilieren und paketieren.',
    hostId: 'host2',
    agentLabel: 'maven',
    command: 'mvn -B clean package -DskipTests',
  },
  {
    n: 3,
    id: 'unit-test',
    name: 'Unit-Test',
    description: 'Unit-Tests ausführen, JUnit-Reports veröffentlichen.',
    hostId: 'host2',
    agentLabel: 'maven',
    command: 'mvn -B test',
  },
  {
    n: 4,
    id: 'deploy',
    name: 'Deploy',
    description: 'JAR per scp auf host3, systemd-Service demo-app neu starten.',
    hostId: 'host2',
    agentLabel: 'maven',
    credential: 'deploy-key',
  },
  {
    n: 5,
    id: 'smoke-wait',
    name: 'Smoke-Wait',
    description: 'Auf http://10.0.0.13:8080/actuator/health warten.',
    hostId: 'host4',
    agentLabel: 'pytest',
  },
  {
    n: 6,
    id: 'itest',
    name: 'ITest',
    description: 'Integrationstests mit pytest ausführen.',
    hostId: 'host4',
    agentLabel: 'pytest',
    command: 'pytest tests/test_app.py --junitxml=it-results.xml',
  },
  {
    n: 7,
    id: 'report',
    name: 'Report',
    description: 'Testergebnisse archivieren und veröffentlichen.',
    hostId: 'host1',
    agentLabel: null,
  },
];

export const HEALTH_URL = 'http://10.0.0.13:8080/actuator/health';
export const DEPLOY_CREDENTIAL = 'deploy-key';
export const SYSTEMD_SERVICE = 'demo-app';

// ----------------------------------------------------------------------------
// Benoetigte Jenkins-Plugins (host1)
// ----------------------------------------------------------------------------
export const PLUGINS: { id: string; purpose: string }[] = [
  { id: 'workflow-aggregator', purpose: 'Declarative & Scripted Pipeline (Pipeline as Code).' },
  { id: 'git', purpose: 'Quellcode aus Git-Repositories holen.' },
  { id: 'ssh-slaves', purpose: 'Agenten per SSH anbinden.' },
  { id: 'credentials-binding', purpose: 'Credentials sicher in Stages einbinden.' },
  { id: 'junit', purpose: 'JUnit-Testberichte veröffentlichen und auswerten.' },
  { id: 'pipeline-stage-view', purpose: 'Stage-Verlauf visualisieren.' },
  { id: 'ws-cleanup', purpose: 'Workspace vor/nach dem Build bereinigen.' },
];

// ----------------------------------------------------------------------------
// Checkliste: Was zur Durchfuehrung des Workshops benoetigt wird.
// Gruppiert nach Verantwortungsbereich; abgeleitet aus den uebrigen
// Domain-Fakten (Hosts, Versionen, Plugins, Stages) — Single Source of Truth.
// ----------------------------------------------------------------------------
export type RequirementGroup = { title: string; items: string[] };

export const WORKSHOP_REQUIREMENTS: RequirementGroup[] = [
  {
    title: 'Infrastruktur (vorab bereitzustellen)',
    items: [
      'Vier VMs mit Ubuntu 24.04 LTS (host1–host4, 10.0.0.11–10.0.0.14), im Basis-Netzwerk untereinander per SSH erreichbar.',
      'Benutzer ubuntu mit sudo-Rechten auf allen vier Hosts.',
      'Je Host ein SSH-Schlüsselpaar (~/.ssh/hostN_ed25519); der öffentliche Schlüssel ist auf dem jeweiligen Host hinterlegt.',
      'DNS-A-Record für jenkins.example.com, der öffentlich auflösbar auf host1 zeigt (Voraussetzung für Let’s Encrypt).',
      'Ausgehender Internetzugang für apt-Pakete, pkg.jenkins.io, PyPI und die Let’s-Encrypt-ACME-Server.',
      'Offene Ports: 22/SSH zwischen Arbeitsplatz und Hosts, 80 und 443 öffentlich auf host1, 8080 auf host3 (intern), SSH-Agent-Anbindung zu host2 und host4.',
    ],
  },
  {
    title: 'Zugänge & Artefakte',
    items: [
      'Zugang zu Claude Code in der Workshop-Umgebung (Konto/Lizenz) je Teilnehmenden.',
      'Git-Repository für CLAUDE.md, Provisionierungsskripte, Jenkinsfile und Tests — für Jenkins lesbar erreichbar.',
      'Eine baubare Maven-/Spring-Boot-Beispielanwendung mit den Endpunkten /actuator/health, /api/greeting und /api/echo.',
      'Eine gültige E-Mail-Adresse für die Let’s-Encrypt-Registrierung (certbot).',
    ],
  },
  {
    title: 'Auf den Hosts (Ergebnis der Provisionierung)',
    items: [
      'host1: OpenJDK 17 (Temurin), Jenkins LTS, nginx, certbot sowie die Plugins workflow-aggregator, git, ssh-slaves, credentials-binding, junit, pipeline-stage-view, ws-cleanup.',
      'host2: OpenJDK 17 und Maven 3.9.x (Agent-Label maven).',
      'host4: OpenJDK 17, Python 3.12 mit venv (requests, pytest) und curl (Agent-Label pytest).',
      'host3: systemd-Service demo-app auf Port 8080 mit Schreibrecht für das Deploy-Ziel /opt/demo-app.',
      'Jenkins Credential Store: deploy-key (SSH Private Key) für das Deployment auf host3.',
    ],
  },
  {
    title: 'Teilnehmende & Arbeitsplatz',
    items: [
      'Grundkenntnisse Linux-Kommandozeile, SSH und Git sowie der CI/CD-Grundbegriffe (Build, Test, Deployment).',
      'Laptop mit Terminal, SSH-Client und aktuellem Browser; Zugriff auf das Repository und Claude Code.',
    ],
  },
];

// ----------------------------------------------------------------------------
// Abnahmekriterien des Workshops (fachlich, nicht Build-Akzeptanz der App)
// ----------------------------------------------------------------------------
export const WORKSHOP_ACCEPTANCE: string[] = [
  'Jenkins ist unter https://jenkins.example.com per HTTPS erreichbar (gültiges Let’s-Encrypt-Zertifikat, HTTP→HTTPS-Redirect).',
  'Beide Agenten (maven auf host2, pytest auf host4) sind online und korrekt gelabelt.',
  'Die Pipeline durchläuft alle sieben Stages grün.',
  'Das Build-Artefakt (JAR) wird auf host3 deployt und der Service demo-app neu gestartet.',
  'Smoke-Wait erkennt die laufende Anwendung über /actuator/health.',
  'pytest-Integrationstests laufen auf host4 und liefern einen JUnit-Report.',
  'Test- und Build-Reports sind in Jenkins veröffentlicht und archiviert.',
];
