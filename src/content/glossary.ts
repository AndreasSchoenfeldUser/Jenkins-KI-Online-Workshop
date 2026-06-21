import type { GlossaryEntry } from '../types';

// Fachbegriffe, alphabetisch sortiert ausgeliefert (siehe Glossar-Feature).
export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Agent',
    definition:
      'Ein vom Controller gesteuerter Knoten, der Pipeline-Schritte ausführt. Über ein Label ' +
      '(z. B. maven, pytest) wird festgelegt, welche Stage auf welchem Agent läuft.',
  },
  {
    term: 'certbot',
    definition:
      'Kommandozeilen-Werkzeug von Let’s Encrypt zum Ausstellen und Erneuern von TLS-Zertifikaten. ' +
      'Integriert sich über ein nginx-Plugin und richtet HTTP→HTTPS-Redirects ein.',
  },
  {
    term: 'CI/CD',
    definition:
      'Continuous Integration / Continuous Delivery: das automatisierte Bauen, Testen und ' +
      'Ausliefern von Software bei jeder Änderung.',
  },
  {
    term: 'Controller',
    definition:
      'Die zentrale Jenkins-Instanz (host1). Sie orchestriert die Pipeline und stellt die Web-UI ' +
      'bereit, baut und testet aber nicht selbst.',
  },
  {
    term: 'Credential Store',
    definition:
      'Sicherer Speicher in Jenkins für Geheimnisse (z. B. SSH-Schlüssel). Credentials werden nur ' +
      'zur Laufzeit in Stages gebunden, nie im Jenkinsfile hartkodiert.',
  },
  {
    term: 'Declarative Pipeline',
    definition:
      'Strukturierte Jenkinsfile-Syntax (pipeline { … }) zur Definition von Stages und Agenten — ' +
      'Pipeline as Code.',
  },
  {
    term: 'Deployment',
    definition:
      'Das Ausliefern des Build-Artefakts auf das Zielsystem. Hier: JAR per scp auf host3, gefolgt ' +
      'vom Neustart des systemd-Service demo-app.',
  },
  {
    term: 'Idempotenz',
    definition:
      'Eigenschaft eines Skripts, bei mehrfacher Ausführung dasselbe Ergebnis zu erzeugen, ohne ' +
      'Schaden anzurichten. Voraussetzung für wiederholbare Provisionierung.',
  },
  {
    term: 'JUnit',
    definition:
      'Verbreitetes Testframework/-Berichtsformat (XML). Jenkins wertet JUnit-Reports aus und ' +
      'stellt Testergebnisse grafisch dar.',
  },
  {
    term: 'Let’s Encrypt',
    definition:
      'Kostenlose Zertifizierungsstelle für TLS-Zertifikate, automatisiert über certbot.',
  },
  {
    term: 'nginx',
    definition:
      'Webserver/Reverse Proxy. Hier terminiert er TLS auf 443 und leitet an Jenkins auf ' +
      '127.0.0.1:8080 weiter; Port 80 wird auf 443 umgeleitet.',
  },
  {
    term: 'Pipeline as Code',
    definition:
      'Der Ansatz, die CI/CD-Pipeline versioniert als Datei (Jenkinsfile) im Repository zu halten ' +
      'statt sie in der UI zu klicken.',
  },
  {
    term: 'pytest',
    definition:
      'Python-Testframework. Führt hier die Integrationstests gegen die deployte Anwendung aus und ' +
      'schreibt einen JUnit-XML-Report (--junitxml).',
  },
  {
    term: 'Reverse Proxy',
    definition:
      'Server, der Anfragen entgegennimmt und an einen internen Dienst weiterleitet — hier nginx ' +
      'vor Jenkins, inklusive TLS-Terminierung.',
  },
  {
    term: 'Smoke-Wait',
    definition:
      'Stage, die nach dem Deploy wartet, bis die Anwendung über /actuator/health bereit ist, ' +
      'bevor die Integrationstests starten.',
  },
  {
    term: 'sshagent',
    definition:
      'Jenkins-Mechanismus (credentials-binding), der einen SSH-Schlüssel aus dem Credential Store ' +
      'für die Dauer eines Blocks bereitstellt — genutzt beim Deploy.',
  },
  {
    term: 'Stage',
    definition:
      'Ein benannter Abschnitt der Pipeline (z. B. Build, Deploy). Jede Stage kann einem bestimmten ' +
      'Agenten/Label zugeordnet sein.',
  },
  {
    term: 'systemd',
    definition:
      'Init-/Service-Manager unter Linux. Die deployte Anwendung läuft als systemd-Service ' +
      'demo-app; die Zertifikatserneuerung nutzt einen systemd-Timer.',
  },
];

export const sortedGlossary = (): GlossaryEntry[] =>
  [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, 'de'));
