import type { Exercise } from '../types';

// Mindestens 12 Uebungen, die alle sieben Aufgabentypen abdecken. Alle
// Infrastruktur-Fakten stammen aus content/domain.ts und sind konsistent.

export const EXERCISES: Exercise[] = [
  // ===================== Station 1 =====================
  {
    id: 'quiz-mindset',
    stationId: 1,
    title: 'Paradigmenwechsel verstehen',
    type: 'quiz',
    prompt:
      'Was beschreibt den Kern der Arbeitsweise in diesem Workshop am besten?',
    hints: [
      'Es geht nicht um das schnellere Tippen einzelner Befehle.',
      'Die CLAUDE.md beschreibt ein prüfbares Ziel.',
    ],
    xp: 10,
    solution: {
      kind: 'quiz',
      multiple: false,
      options: [
        { id: 'a', text: 'Befehle schneller abtippen als von Hand.', correct: false },
        {
          id: 'b',
          text: 'Eine gewünschte Zielumgebung spezifizieren, generieren lassen und das Ergebnis prüfen.',
          correct: true,
        },
        { id: 'c', text: 'Die Konfiguration vollständig der KI überlassen, ohne sie zu prüfen.', correct: false },
        { id: 'd', text: 'Auf Skripte verzichten und alles in der Web-UI klicken.', correct: false },
      ],
      explanation:
        'Der Paradigmenwechsel ist Spezifizieren statt Abtippen: Ziel und prüfbare Bedingungen ' +
        'festlegen, generieren lassen, prüfen und verantworten.',
    },
  },
  {
    id: 'prompt-controller',
    stationId: 1,
    title: 'Prompt: Controller mit HTTPS',
    type: 'prompt-craft',
    prompt:
      'Formulieren Sie einen Prompt, der ein idempotentes Installationsskript für den Jenkins ' +
      'Controller (host1) inklusive HTTPS erzeugt. Nennen Sie Zielartefakt, Quelle und eine ' +
      'prüfbare Bedingung.',
    hints: [
      'Nennen Sie das konkrete Zielartefakt (z. B. ein Bash-Skript).',
      'Verweisen Sie auf die CLAUDE.md / den passenden Abschnitt.',
      'Geben Sie eine prüfbare Bedingung an (z. B. gültiges Zertifikat unter der Domain).',
    ],
    xp: 20,
    solution: {
      kind: 'prompt-craft',
      criteria: [
        {
          id: 'artifact',
          label: 'Nennt das Zielartefakt (Skript / install-host1.sh)',
          anyOf: ['skript', 'install-host1', 'bash', '.sh'],
          hint: 'Sagen Sie explizit, dass ein (Bash-)Skript entstehen soll.',
        },
        {
          id: 'source',
          label: 'Verweist auf CLAUDE.md / Spezifikation',
          anyOf: ['claude.md', 'spezifikation', 'abschnitt'],
          hint: 'Beziehen Sie sich auf die CLAUDE.md als Quelle.',
        },
        {
          id: 'https',
          label: 'Fordert HTTPS / certbot / nginx',
          anyOf: ['https', 'certbot', "let's encrypt", 'lets encrypt', 'nginx', 'tls'],
          hint: 'HTTPS via nginx + certbot gehört zur Controller-Installation.',
        },
        {
          id: 'checkable',
          label: 'Enthält eine prüfbare Bedingung',
          anyOf: ['prüfbar', 'gültig', 'erreichbar', 'zertifikat', 'jenkins.example.com', 'nginx -t'],
          hint: 'Woran erkennt man Erfolg? z. B. gültiges Zertifikat unter jenkins.example.com.',
        },
      ],
      sample:
        'Erzeuge ein idempotentes Bash-Skript install-host1.sh gemäß CLAUDE.md Abschnitt 4, das ' +
        'auf host1 OpenJDK 17 und Jenkins LTS installiert, nginx als Reverse Proxy ' +
        '(443 → 127.0.0.1:8080, 80 → 443) konfiguriert und certbot für jenkins.example.com ' +
        'einrichtet. Prüfbar: nginx -t läuft fehlerfrei und https://jenkins.example.com liefert ' +
        'ein gültiges Let’s-Encrypt-Zertifikat.',
    },
  },
  {
    id: 'quiz-keys',
    stationId: 1,
    title: 'Schlüssel und Repository',
    type: 'quiz',
    prompt: 'Warum gehört der private SSH-Schlüssel nicht ins Git-Repository?',
    hints: ['Denken Sie an die Folgen eines geleakten Schlüssels.'],
    xp: 10,
    solution: {
      kind: 'quiz',
      multiple: true,
      options: [
        {
          id: 'a',
          text: 'Im Repository ist er für jeden mit Lesezugriff einsehbar und kompromittierbar.',
          correct: true,
        },
        {
          id: 'b',
          text: 'Deployments sollen Secrets nur über den Jenkins Credential Store binden.',
          correct: true,
        },
        { id: 'c', text: 'Private Schlüssel ändern sich bei jedem Build automatisch.', correct: false },
        {
          id: 'd',
          text: 'Ein versehentlich committeter Schlüssel bleibt in der Git-Historie erhalten.',
          correct: true,
        },
      ],
      explanation:
        'Schlüssel im Repo sind dauerhaft kompromittiert (auch über die Historie). Secrets gehören ' +
        'in den Credential Store und werden nur zur Laufzeit gebunden.',
    },
  },

  // ===================== Station 2 =====================
  {
    id: 'node-mapping-stages',
    stationId: 2,
    title: 'Stages den Hosts zuordnen',
    type: 'node-mapping',
    prompt:
      'Ordnen Sie jede der sieben Stages dem ausführenden Host bzw. Label zu.',
    hints: [
      'Checkout und Report orchestriert der Controller.',
      'Build, Unit-Test und Deploy laufen auf dem maven-Agenten.',
      'Smoke-Wait und ITest laufen auf dem pytest-Agenten.',
    ],
    xp: 25,
    solution: {
      kind: 'node-mapping',
      targets: [
        { id: 'controller', label: 'host1 · Controller' },
        { id: 'maven', label: 'host2 · Agent maven' },
        { id: 'pytest', label: 'host4 · Agent pytest' },
      ],
      items: [
        { id: 'checkout', label: 'Checkout', targetId: 'controller' },
        { id: 'build', label: 'Build', targetId: 'maven' },
        { id: 'unit-test', label: 'Unit-Test', targetId: 'maven' },
        { id: 'deploy', label: 'Deploy', targetId: 'maven' },
        { id: 'smoke-wait', label: 'Smoke-Wait', targetId: 'pytest' },
        { id: 'itest', label: 'ITest', targetId: 'pytest' },
        { id: 'report', label: 'Report', targetId: 'controller' },
      ],
    },
  },
  {
    id: 'quiz-controller-build',
    stationId: 2,
    title: 'Warum baut der Controller nicht selbst?',
    type: 'quiz',
    prompt: 'Welche Gründe sprechen dafür, dass der Controller nicht selbst baut und testet?',
    hints: ['Drei Stichworte: Sicherheit, Skalierung, Stabilität.'],
    xp: 15,
    solution: {
      kind: 'quiz',
      multiple: true,
      options: [
        { id: 'a', text: 'Sicherheit: keine Build-Toolchains/Secrets dauerhaft auf dem Controller.', correct: true },
        { id: 'b', text: 'Skalierung: Last liegt auf ergänzbaren Agenten.', correct: true },
        { id: 'c', text: 'Stabilität: ein abstürzender Build gefährdet nicht die Steuerung.', correct: true },
        { id: 'd', text: 'Der Controller besitzt technisch keine CPU für Builds.', correct: false },
      ],
      explanation:
        'Die Rollentrennung dient Sicherheit, Skalierung und Stabilität — nicht einer technischen ' +
        'Unfähigkeit des Controllers.',
    },
  },

  // ===================== Station 3 =====================
  {
    id: 'code-order-cycle',
    stationId: 3,
    title: 'Arbeitszyklus ordnen',
    type: 'code-order',
    prompt: 'Bringen Sie die vier Schritte des Arbeitszyklus in die richtige Reihenfolge.',
    hints: ['Am Anfang steht die Spezifikation, am Ende die Korrektur.'],
    xp: 15,
    solution: {
      kind: 'code-order',
      items: [
        { id: 'spec', label: 'Spezifizieren', detail: 'Ziel & prüfbare Bedingungen festlegen.' },
        { id: 'gen', label: 'Generieren', detail: 'Claude Code erzeugt das Artefakt.' },
        { id: 'check', label: 'Prüfen', detail: 'Ausgabe gegen Spezifikation abgleichen.' },
        { id: 'fix', label: 'Korrigieren', detail: 'Prompt präzisieren, erneut generieren.' },
      ],
    },
  },
  {
    id: 'quiz-human-review',
    stationId: 3,
    title: 'Prinzip „Mensch prüft“',
    type: 'quiz',
    prompt: 'Was bedeutet das Sicherheitsprinzip „Mensch prüft“ konkret?',
    hints: ['Es geht um die Verantwortung für generierte Änderungen.'],
    xp: 10,
    solution: {
      kind: 'quiz',
      multiple: false,
      options: [
        { id: 'a', text: 'Generierte Skripte werden ungeprüft ausgeführt, solange Tests grün sind.', correct: false },
        {
          id: 'b',
          text: 'Jede generierte Änderung wird vor dem Anwenden gelesen, verstanden und verantwortet.',
          correct: true,
        },
        { id: 'c', text: 'Nur die Trainerin darf Prompts schreiben.', correct: false },
      ],
      explanation:
        'Die Verantwortung bleibt beim Menschen: kein ungeprüftes Skript wird auf den Hosts ausgeführt.',
    },
  },

  // ===================== Station 4 =====================
  {
    id: 'claude-md-order',
    stationId: 4,
    title: 'CLAUDE.md-Bausteine zusammenstellen',
    type: 'claude-md-builder',
    prompt:
      'Bringen Sie die acht Bausteine der CLAUDE.md in eine sinnvolle Reihenfolge und markieren ' +
      'Sie je Baustein die korrekten Stichpunkte.',
    hints: [
      'Erst der Überblick, dann Topologie, dann Installation/Konfiguration.',
      'Akzeptanzkriterien stehen am Ende.',
    ],
    xp: 30,
    solution: {
      kind: 'claude-md-builder',
      order: [
        'overview',
        'topology',
        'install',
        'config',
        'env',
        'plugins',
        'pipeline',
        'acceptance',
      ],
      blocks: [
        {
          id: 'overview',
          title: 'Projektüberblick',
          bullets: [
            { id: 'o1', text: 'Ziel, Umfang und Nicht-Ziele', correct: true },
            { id: 'o2', text: 'Vollständiger Jenkinsfile-Quelltext', correct: false },
          ],
        },
        {
          id: 'topology',
          title: 'Topologie',
          bullets: [
            { id: 't1', text: 'Hosts, Rollen, IPs und Labels', correct: true },
            { id: 't2', text: 'Lebenslauf der Trainerin', correct: false },
          ],
        },
        {
          id: 'install',
          title: 'Installation',
          bullets: [
            { id: 'i1', text: 'Idempotente Schritte je Host inkl. nginx + certbot', correct: true },
            { id: 'i2', text: 'Beliebige, einmalige Handgriffe ohne Wiederholbarkeit', correct: false },
          ],
        },
        {
          id: 'config',
          title: 'Konfiguration',
          bullets: [
            { id: 'c1', text: 'Jenkins-URL, Agenten-Anbindung, Credential deploy-key', correct: true },
            { id: 'c2', text: 'Klartext-Passwörter im Jenkinsfile', correct: false },
          ],
        },
        {
          id: 'env',
          title: 'Umgebung',
          bullets: [
            { id: 'e1', text: 'DOMAIN, Ports, Health-Endpoint', correct: true },
            { id: 'e2', text: 'Lieblingsfarbe des Teams', correct: false },
          ],
        },
        {
          id: 'plugins',
          title: 'Plugins',
          bullets: [
            { id: 'p1', text: 'workflow-aggregator, git, ssh-slaves, junit …', correct: true },
            { id: 'p2', text: 'Browser-Erweiterungen für den Laptop', correct: false },
          ],
        },
        {
          id: 'pipeline',
          title: 'Pipeline',
          bullets: [
            { id: 'pl1', text: 'Sieben Stages mit Host-/Label-Zuordnung', correct: true },
            { id: 'pl2', text: 'Nur eine einzige Stage „alles“', correct: false },
          ],
        },
        {
          id: 'acceptance',
          title: 'Akzeptanzkriterien',
          bullets: [
            { id: 'a1', text: 'Prüfbare Definition of Done inkl. HTTPS', correct: true },
            { id: 'a2', text: '„Läuft schon irgendwie“', correct: false },
          ],
        },
      ],
    },
  },
  {
    id: 'code-order-stages',
    stationId: 4,
    title: 'Sieben Stages ordnen',
    type: 'code-order',
    prompt: 'Bringen Sie die sieben Pipeline-Stages in die korrekte Reihenfolge.',
    hints: ['Checkout zuerst, Report zuletzt.', 'Smoke-Wait kommt vor den Integrationstests.'],
    xp: 20,
    solution: {
      kind: 'code-order',
      items: [
        { id: 'checkout', label: 'Checkout' },
        { id: 'build', label: 'Build' },
        { id: 'unit-test', label: 'Unit-Test' },
        { id: 'deploy', label: 'Deploy' },
        { id: 'smoke-wait', label: 'Smoke-Wait' },
        { id: 'itest', label: 'ITest' },
        { id: 'report', label: 'Report' },
      ],
    },
  },
  {
    id: 'code-fill-jenkinsfile',
    stationId: 4,
    title: 'Jenkinsfile-Lücken füllen',
    type: 'code-fill',
    prompt:
      'Ergänzen Sie die fehlenden Stellen in diesem Auszug aus dem Jenkinsfile.',
    hints: [
      'Build und Test laufen auf dem maven-Agenten.',
      'Das Build-Kommando paketiert ohne Tests (-DskipTests).',
      'Der Deploy bindet das Credential deploy-key.',
    ],
    xp: 25,
    solution: {
      kind: 'code-fill',
      lang: 'groovy',
      template: `stage('Build') {
    agent { label '{{1}}' }
    steps {
        sh '{{2}}'
    }
}
stage('Deploy') {
    agent { label 'maven' }
    steps {
        sshagent(credentials: ['{{3}}']) {
            sh 'scp target/*.jar ubuntu@10.0.0.13:/opt/demo-app/app.jar'
        }
    }
}`,
      blanks: [
        {
          id: 1,
          label: 'Agent-Label für den Build',
          accept: ['maven'],
          placeholder: 'Label',
        },
        {
          id: 2,
          label: 'Build-Kommando (Paketieren ohne Tests)',
          accept: ['mvn -B clean package -DskipTests', 'mvn clean package -DskipTests'],
          regex: 'mvn\\s+(-B\\s+)?clean\\s+package\\s+-DskipTests',
          placeholder: 'mvn …',
        },
        {
          id: 3,
          label: 'Credential-ID für das Deployment',
          accept: ['deploy-key'],
          placeholder: 'Credential',
        },
      ],
    },
  },
  {
    id: 'quiz-plugins',
    stationId: 4,
    title: 'Benötigte Plugins',
    type: 'quiz',
    prompt: 'Welche Plugins werden auf host1 benötigt?',
    hints: ['Pipeline, Git, SSH-Agenten, Credentials, JUnit …'],
    xp: 15,
    solution: {
      kind: 'quiz',
      multiple: true,
      options: [
        { id: 'a', text: 'workflow-aggregator', correct: true },
        { id: 'b', text: 'ssh-slaves', correct: true },
        { id: 'c', text: 'credentials-binding', correct: true },
        { id: 'd', text: 'minecraft-builder', correct: false },
        { id: 'e', text: 'junit', correct: true },
      ],
      explanation:
        'Benötigt werden u. a. workflow-aggregator, git, ssh-slaves, credentials-binding, junit, ' +
        'pipeline-stage-view und ws-cleanup.',
    },
  },

  // ===================== Station 5 =====================
  {
    id: 'prompt-jenkinsfile',
    stationId: 5,
    title: 'Prompt: Jenkinsfile',
    type: 'prompt-craft',
    prompt:
      'Formulieren Sie einen Prompt, der ein declarative Jenkinsfile mit den sieben Stages erzeugt.',
    hints: [
      'Nennen Sie das Zielartefakt (Jenkinsfile) und die Stage-Zahl.',
      'Verweisen Sie auf die CLAUDE.md.',
      'Nennen Sie eine prüfbare Bedingung (Pipeline grün).',
    ],
    xp: 20,
    solution: {
      kind: 'prompt-craft',
      criteria: [
        {
          id: 'artifact',
          label: 'Nennt das Zielartefakt (Jenkinsfile)',
          anyOf: ['jenkinsfile', 'pipeline'],
          hint: 'Sagen Sie, dass ein declarative Jenkinsfile entstehen soll.',
        },
        {
          id: 'stages',
          label: 'Nennt die sieben Stages / agent label',
          anyOf: ['sieben', '7 stages', 'sieben stages', 'agent { label', 'label'],
          hint: 'Erwähnen Sie die sieben Stages und die Label-Zuordnung.',
        },
        {
          id: 'source',
          label: 'Verweist auf CLAUDE.md',
          anyOf: ['claude.md', 'spezifikation', 'abschnitt'],
          hint: 'Beziehen Sie sich auf die CLAUDE.md.',
        },
        {
          id: 'checkable',
          label: 'Enthält eine prüfbare Bedingung',
          anyOf: ['grün', 'gruen', 'prüfbar', 'durchläuft', 'junit'],
          hint: 'z. B.: die Pipeline durchläuft alle Stages grün.',
        },
      ],
      sample:
        'Erzeuge ein declarative Jenkinsfile mit den sieben Stages aus CLAUDE.md Abschnitt 8. ' +
        'Jede Stage nutzt agent { label … } gemäß Host-Zuordnung, Unit-Test und ITest ' +
        'veröffentlichen JUnit-Reports, Deploy nutzt sshagent mit deploy-key. Prüfbar: die ' +
        'Pipeline durchläuft alle Stages grün.',
    },
  },
  {
    id: 'prompt-agent',
    stationId: 5,
    title: 'Prompt: Agenten-Setup',
    type: 'prompt-craft',
    prompt:
      'Formulieren Sie einen Prompt für ein Setup-Skript, das per ROLE zwischen maven- und ' +
      'pytest-Agent unterscheidet.',
    hints: ['Nennen Sie die Variable ROLE und die Werkzeuge je Rolle.'],
    xp: 20,
    solution: {
      kind: 'prompt-craft',
      criteria: [
        {
          id: 'artifact',
          label: 'Nennt das Zielartefakt (Skript)',
          anyOf: ['skript', 'setup-agent', '.sh', 'bash'],
          hint: 'Ein Setup-Skript soll entstehen.',
        },
        {
          id: 'role',
          label: 'Nennt die Steuervariable ROLE=maven|pytest',
          anyOf: ['role=', 'role ', 'maven', 'pytest'],
          hint: 'Die Rolle wird über ROLE=maven|pytest gesteuert.',
        },
        {
          id: 'tools',
          label: 'Nennt die Werkzeuge (Maven bzw. Python/venv)',
          anyOf: ['maven', 'python', 'venv', 'pytest', 'requests'],
          hint: 'maven: Maven; pytest: Python 3.12 + venv mit requests/pytest.',
        },
        {
          id: 'checkable',
          label: 'Enthält eine prüfbare Bedingung',
          anyOf: ['prüfbar', '-version', 'version', 'online', 'label'],
          hint: 'z. B.: mvn -version bzw. pytest --version liefern die erwarteten Versionen.',
        },
      ],
      sample:
        'Schreibe ein idempotentes Skript setup-agent.sh, gesteuert über ROLE=maven|pytest gemäß ' +
        'CLAUDE.md Abschnitt 4: für maven Maven 3.9.x, für pytest Python 3.12 + venv mit requests ' +
        'und pytest. Prüfbar: mvn -version bzw. pytest --version liefern die erwarteten Versionen.',
    },
  },
  {
    id: 'code-fill-install',
    stationId: 5,
    title: 'certbot-Aufruf vervollständigen',
    type: 'code-fill',
    prompt: 'Ergänzen Sie den certbot-Aufruf und das nginx-Proxy-Ziel im Installationsskript.',
    hints: [
      'certbot bindet sich über das nginx-Plugin ein.',
      'Die Domain ist jenkins.example.com.',
      'Jenkins lauscht intern auf 127.0.0.1:8080.',
    ],
    xp: 25,
    solution: {
      kind: 'code-fill',
      lang: 'bash',
      template: `# nginx leitet auf den lokalen Jenkins-Port weiter
proxy_pass http://{{1}};

# Zertifikat fuer die Domain ausstellen (Let's Encrypt)
sudo certbot --{{2}} -d {{3}} --non-interactive --agree-tos -m admin@example.com --redirect`,
      blanks: [
        {
          id: 1,
          label: 'Proxy-Ziel (Host:Port von Jenkins)',
          accept: ['127.0.0.1:8080', 'localhost:8080'],
          regex: '(127\\.0\\.0\\.1|localhost):8080',
          placeholder: 'Host:Port',
        },
        {
          id: 2,
          label: 'certbot-Plugin für den Webserver',
          accept: ['nginx'],
          placeholder: 'Plugin',
        },
        {
          id: 3,
          label: 'Domain',
          accept: ['jenkins.example.com'],
          placeholder: 'Domain',
        },
      ],
    },
  },

  // ===================== Station 6 =====================
  {
    id: 'terminal-keys',
    stationId: 6,
    title: 'Terminal: Schlüssel absichern & verbinden',
    type: 'terminal-sim',
    prompt:
      'Sichern Sie den privaten Schlüssel mit den richtigen Rechten und verbinden Sie sich per ' +
      'SSH zum Controller. Geben Sie die Befehle nacheinander ein.',
    hints: [
      'Ein privater Schlüssel muss die Rechte 600 haben.',
      'Verbinden Sie sich als Benutzer ubuntu zu host1 (10.0.0.11).',
    ],
    xp: 25,
    solution: {
      kind: 'terminal-sim',
      steps: [
        {
          prompt: 'Setzen Sie die Rechte des privaten Schlüssels ~/.ssh/host1_ed25519 auf 600.',
          accept: ['chmod\\s+600\\s+~?/?\\.?ssh/host1_ed25519', 'chmod\\s+600\\s+.*host1_ed25519'],
          hintCommand: 'chmod 600 ~/.ssh/host1_ed25519',
          output: '',
        },
        {
          prompt: 'Verbinden Sie sich per SSH als ubuntu zu host1 (10.0.0.11) mit diesem Schlüssel.',
          accept: [
            'ssh\\s+-i\\s+~?/?\\.?ssh/host1_ed25519\\s+ubuntu@(10\\.0\\.0\\.11|host1)',
            'ssh\\s+ubuntu@(10\\.0\\.0\\.11|host1)',
          ],
          hintCommand: 'ssh -i ~/.ssh/host1_ed25519 ubuntu@10.0.0.11',
          output:
            'Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0 x86_64)\nubuntu@host1:~$',
        },
        {
          prompt: 'Prüfen Sie den Status des Jenkins-Dienstes.',
          accept: [
            'sudo\\s+systemctl\\s+status\\s+jenkins',
            'systemctl\\s+status\\s+jenkins',
          ],
          hintCommand: 'sudo systemctl status jenkins',
          output:
            '● jenkins.service - Jenkins Continuous Integration Server\n   Active: active (running)\n   Listening on 127.0.0.1:8080',
        },
      ],
    },
  },
  {
    id: 'terminal-deploy',
    stationId: 6,
    title: 'Terminal: Deploy auf host3',
    type: 'terminal-sim',
    prompt:
      'Spielen Sie das Deployment des JAR auf host3 durch und starten Sie den Service neu.',
    hints: [
      'Kopieren Sie das JAR per scp nach /opt/demo-app/app.jar auf host3 (10.0.0.13).',
      'Starten Sie anschließend den systemd-Service demo-app neu.',
      'Prüfen Sie den Health-Endpoint mit curl.',
    ],
    xp: 25,
    solution: {
      kind: 'terminal-sim',
      steps: [
        {
          prompt: 'Kopieren Sie target/app.jar per scp nach ubuntu@10.0.0.13:/opt/demo-app/app.jar.',
          accept: ['scp\\s+.*\\.jar\\s+ubuntu@(10\\.0\\.0\\.13|host3):/opt/demo-app/app\\.jar'],
          hintCommand: 'scp target/app.jar ubuntu@10.0.0.13:/opt/demo-app/app.jar',
          output: 'app.jar                       100%   24MB  48.0MB/s   00:00',
        },
        {
          prompt: 'Starten Sie auf host3 den Service demo-app neu.',
          accept: [
            'ssh\\s+ubuntu@(10\\.0\\.0\\.13|host3)\\s+.*systemctl\\s+restart\\s+demo-app',
            'sudo\\s+systemctl\\s+restart\\s+demo-app',
          ],
          hintCommand: "ssh ubuntu@10.0.0.13 'sudo systemctl restart demo-app'",
          output: '',
        },
        {
          prompt: 'Prüfen Sie den Health-Endpoint der Anwendung mit curl.',
          accept: ['curl\\s+.*10\\.0\\.0\\.13:8080/actuator/health'],
          hintCommand: 'curl http://10.0.0.13:8080/actuator/health',
          output: '{"status":"UP"}',
        },
      ],
    },
  },
  {
    id: 'quiz-smoke-wait',
    stationId: 6,
    title: 'Wozu dient Smoke-Wait?',
    type: 'quiz',
    prompt: 'Warum gibt es vor den Integrationstests die Stage Smoke-Wait?',
    hints: ['Die Anwendung braucht nach dem Neustart einen Moment.'],
    xp: 15,
    solution: {
      kind: 'quiz',
      multiple: false,
      options: [
        {
          id: 'a',
          text: 'Sie wartet, bis die deployte Anwendung über /actuator/health bereit ist, bevor getestet wird.',
          correct: true,
        },
        { id: 'b', text: 'Sie raucht den Build symbolisch durch.', correct: false },
        { id: 'c', text: 'Sie ersetzt die Unit-Tests.', correct: false },
      ],
      explanation:
        'Nach dem Neustart braucht die Anwendung Zeit. Smoke-Wait pollt /actuator/health und ' +
        'verhindert, dass die Integrationstests gegen eine noch nicht bereite Anwendung laufen.',
    },
  },
];

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id);
