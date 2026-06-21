// Vollstaendige, kopierbare Referenz-Artefakte (CLAUDE.md Abschnitt 7).
// Als String-Konstanten gehalten, damit sie ueberall (Lehrbuch, Slides,
// Uebungen) identisch und syntaxgehighlightet eingebunden werden koennen.

export const CLAUDE_MD_EXAMPLE = `# CLAUDE.md — Verteilte Jenkins-CI/CD-Umgebung

## 1. Projektüberblick
Aufbau einer verteilten Jenkins-Umgebung über vier Hosts: ein Controller mit
HTTPS-Zugang, ein Build-Agent (Maven/JUnit), ein Deployment-Ziel und ein
Test-Agent (Python/pytest). Die Provisionierung erfolgt idempotent über Skripte;
die CI/CD-Pipeline ist als declarative Jenkinsfile (Pipeline as Code) definiert.

## 2. Vorbereitete Umgebung
- Vier VMs, Ubuntu 24.04 LTS, Benutzer \`ubuntu\` (sudo), Zugang per SSH-Key.
- Versionen: OpenJDK 17 (Temurin), Maven 3.9.x, Python 3.12, Jenkins LTS.
- Private Schlüssel liegen lokal unter ~/.ssh/, NIEMALS im Repository.

| Host  | Rolle               | IP         | Schlüssel               | Label  |
|-------|---------------------|------------|-------------------------|--------|
| host1 | Jenkins Controller  | 10.0.0.11  | ~/.ssh/host1_ed25519    | —      |
| host2 | Agent I — Build     | 10.0.0.12  | ~/.ssh/host2_ed25519    | maven  |
| host3 | Deployment-Ziel     | 10.0.0.13  | ~/.ssh/host3_ed25519    | —      |
| host4 | Agent II — Test     | 10.0.0.14  | ~/.ssh/host4_ed25519    | pytest |

## 3. Topologie & Datenfluss
- Controller (host1) orchestriert; baut nicht selbst.
- Build/Unit-Test/Deploy laufen auf Agent \`maven\` (host2).
- Smoke-Wait/ITest laufen auf Agent \`pytest\` (host4) gegen host3.
- Deploy schiebt das JAR per scp auf host3 und startet den systemd-Service
  \`demo-app\` neu.

## 4. Installation je Host
### host1 — Controller + HTTPS
- OpenJDK 17 (Temurin), Jenkins LTS installieren.
- nginx als Reverse Proxy: 443 → 127.0.0.1:8080, 80 → 443 (Redirect).
- certbot (Let’s Encrypt) für jenkins.example.com; Auto-Renew via systemd-Timer.
- Idempotent: erneutes Ausführen verändert nichts, wenn bereits eingerichtet.

### host2 — Agent maven
- OpenJDK 17, Maven 3.9.x, Arbeitsverzeichnis /home/ubuntu/agent.
- Über SSH als Agent mit Label \`maven\` anbinden.

### host4 — Agent pytest
- OpenJDK 17 (für den Agent-Prozess), Python 3.12 + venv, requests, pytest.
- Über SSH als Agent mit Label \`pytest\` anbinden.

### host3 — Deployment-Ziel
- systemd-Service \`demo-app\` für das Spring-Boot-JAR, Port 8080.
- Deploy-Benutzer akzeptiert den Public Key des Credentials \`deploy-key\`.

## 5. Konfiguration
- Jenkins-URL: https://jenkins.example.com.
- Agenten per ssh-slaves; Credentials im Jenkins Credential Store:
  \`deploy-key\` (SSH Private Key) für das Deployment auf host3.
- Sicherheitsrelevante Werte ausschließlich über den Credential Store binden
  (credentials-binding), nie im Jenkinsfile hartkodieren.

## 6. Umgebung (Domain & Ports)
- DOMAIN = jenkins.example.com (DNS-A-Record zeigt auf host1).
- Jenkins lauscht intern auf 127.0.0.1:8080, öffentlich 443 (HTTPS).
- Anwendung auf host3: Port 8080, Health-Endpoint /actuator/health.

## 7. Benötigte Plugins (host1)
workflow-aggregator, git, ssh-slaves, credentials-binding, junit,
pipeline-stage-view, ws-cleanup.

## 8. Pipeline (sieben Stages, Pipeline as Code)
1. Checkout   — Quellcode aus Git holen (Controller).
2. Build      — mvn -B clean package -DskipTests (Agent maven).
3. Unit-Test  — mvn -B test, JUnit-Reports veröffentlichen (Agent maven).
4. Deploy     — JAR per scp auf host3, systemd-Service demo-app neu starten
                (Agent maven, Credential deploy-key).
5. Smoke-Wait — auf http://10.0.0.13:8080/actuator/health warten (Agent pytest).
6. ITest      — pytest tests/test_app.py --junitxml=it-results.xml (Agent pytest).
7. Report     — Testergebnisse archivieren und veröffentlichen.

## 9. Akzeptanzkriterien
- https://jenkins.example.com per HTTPS erreichbar (gültiges Zertifikat,
  HTTP→HTTPS-Redirect).
- Beide Agenten online und korrekt gelabelt (maven, pytest).
- Pipeline durchläuft alle sieben Stages grün.
- JAR auf host3 deployt, demo-app neu gestartet, /actuator/health antwortet.
- pytest-Integrationstests grün, JUnit-Report veröffentlicht.

## 10. Randbedingungen
- Alle Skripte idempotent (mehrfaches Ausführen ist sicher).
- Keine Secrets im Repository; Deployment ausschließlich über Credential Store.
- Mensch prüft jede generierte Änderung vor dem Anwenden.
`;

export const JENKINSFILE = `pipeline {
    agent none
    options {
        timestamps()
        disableConcurrentBuilds()
    }
    environment {
        DEPLOY_HOST = '10.0.0.13'
        HEALTH_URL  = 'http://10.0.0.13:8080/actuator/health'
    }

    stages {
        stage('Checkout') {
            agent any
            steps {
                checkout scm
            }
        }

        stage('Build') {
            agent { label 'maven' }
            steps {
                sh 'mvn -B clean package -DskipTests'
                stash name: 'app-jar', includes: 'target/*.jar'
            }
        }

        stage('Unit-Test') {
            agent { label 'maven' }
            steps {
                sh 'mvn -B test'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                }
            }
        }

        stage('Deploy') {
            agent { label 'maven' }
            steps {
                unstash 'app-jar'
                sshagent(credentials: ['deploy-key']) {
                    sh '''
                        scp -o StrictHostKeyChecking=no target/*.jar \\
                            ubuntu@\${DEPLOY_HOST}:/opt/demo-app/app.jar
                        ssh -o StrictHostKeyChecking=no ubuntu@\${DEPLOY_HOST} \\
                            'sudo systemctl restart demo-app'
                    '''
                }
            }
        }

        stage('Smoke-Wait') {
            agent { label 'pytest' }
            steps {
                sh '''
                    for i in $(seq 1 30); do
                        if curl -fsS "\${HEALTH_URL}" >/dev/null; then
                            echo "Anwendung ist bereit."
                            exit 0
                        fi
                        echo "Warte auf demo-app ... ($i/30)"
                        sleep 5
                    done
                    echo "Timeout: demo-app nicht erreichbar." >&2
                    exit 1
                '''
            }
        }

        stage('ITest') {
            agent { label 'pytest' }
            steps {
                sh '''
                    python3 -m venv .venv
                    . .venv/bin/activate
                    pip install -q requests pytest
                    pytest tests/test_app.py --junitxml=it-results.xml
                '''
            }
            post {
                always {
                    junit 'it-results.xml'
                }
            }
        }

        stage('Report') {
            agent any
            steps {
                archiveArtifacts artifacts: '**/it-results.xml, **/surefire-reports/*.xml',
                                 allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo "Pipeline beendet mit Status: \${currentBuild.currentResult}"
        }
        cleanup {
            cleanWs()
        }
    }
}
`;

export const INSTALL_HOST1 = `#!/usr/bin/env bash
# install-host1.sh — Jenkins Controller + nginx + Let's Encrypt (HTTPS)
# Voraussetzungen:
#   - Ubuntu 24.04 LTS, Benutzer ubuntu (sudo)
#   - DNS-A-Record fuer jenkins.example.com zeigt bereits auf host1 (10.0.0.11)
# Eigenschaften: idempotent — mehrfaches Ausfuehren ist sicher.
set -euo pipefail

DOMAIN="jenkins.example.com"
EMAIL="admin@example.com"

# --- OpenJDK 17 (Temurin) ---
if ! java -version 2>&1 | grep -q '17\\.'; then
  sudo apt-get update
  sudo apt-get install -y openjdk-17-jdk
fi

# --- Jenkins LTS ---
if ! systemctl list-unit-files | grep -q '^jenkins\\.service'; then
  curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \\
    | sudo tee /usr/share/keyrings/jenkins-keyring.asc >/dev/null
  echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \\
https://pkg.jenkins.io/debian-stable binary/" \\
    | sudo tee /etc/apt/sources.list.d/jenkins.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y jenkins
fi
# Jenkins nur lokal: 127.0.0.1:8080 (nginx terminiert TLS)
sudo systemctl enable --now jenkins

# --- nginx als Reverse Proxy ---
sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/jenkins >/dev/null <<EOF
server {
    listen 80;
    server_name \${DOMAIN};
    return 301 https://\\$host\\$request_uri;   # 80 -> 443 Redirect
}
server {
    listen 443 ssl;
    server_name \${DOMAIN};
    # Zertifikatspfade werden von certbot eingetragen
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/jenkins /etc/nginx/sites-enabled/jenkins
sudo rm -f /etc/nginx/sites-enabled/default

# --- certbot / Let's Encrypt (idempotent dank --keep-until-expiring) ---
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d "\${DOMAIN}" \\
  --non-interactive --agree-tos -m "\${EMAIL}" \\
  --redirect --keep-until-expiring

# --- Automatische Erneuerung (systemd-Timer ist durch certbot bereits aktiv) ---
sudo systemctl enable --now certbot.timer

sudo nginx -t && sudo systemctl reload nginx
echo "host1 fertig: https://\${DOMAIN}"
`;

export const SETUP_AGENT = `#!/usr/bin/env bash
# setup-agent.sh — Build-Agent (maven) oder Test-Agent (pytest)
# Aufruf:  ROLE=maven  ./setup-agent.sh     # host2
#          ROLE=pytest ./setup-agent.sh     # host4
# Idempotent; legt Benutzer/Arbeitsverzeichnis fuer den Jenkins-Agent an.
set -euo pipefail

ROLE="\${ROLE:?ROLE=maven|pytest erforderlich}"
AGENT_HOME="/home/ubuntu/agent"

sudo apt-get update
# Java wird vom Jenkins-Agent-Prozess auf jedem Agenten benoetigt.
sudo apt-get install -y openjdk-17-jdk
mkdir -p "\${AGENT_HOME}"

case "\${ROLE}" in
  maven)
    if ! command -v mvn >/dev/null; then
      sudo apt-get install -y maven
    fi
    echo "Agent-Rolle: maven (Build/Unit-Test/Deploy) bereit."
    ;;
  pytest)
    sudo apt-get install -y python3.12 python3.12-venv python3-pip
    python3 -m venv "\${AGENT_HOME}/.venv"
    "\${AGENT_HOME}/.venv/bin/pip" install --quiet requests pytest
    echo "Agent-Rolle: pytest (Smoke-Wait/ITest) bereit."
    ;;
  *)
    echo "Unbekannte ROLE: \${ROLE}" >&2
    exit 1
    ;;
esac

echo "Agent-Setup abgeschlossen. Label in Jenkins setzen: \${ROLE}"
`;

export const TEST_APP_PY = `# tests/test_app.py — Integrationstests gegen die deployte demo-app (host3).
# Ausgefuehrt vom Agent 'pytest' (host4). JUnit-XML via --junitxml=it-results.xml.
import os
import requests

BASE_URL = os.environ.get("APP_BASE_URL", "http://10.0.0.13:8080")
TIMEOUT = 5


def test_health_endpoint():
    """Die Anwendung meldet sich als UP (Spring-Boot-Actuator)."""
    resp = requests.get(f"{BASE_URL}/actuator/health", timeout=TIMEOUT)
    assert resp.status_code == 200
    assert resp.json().get("status") == "UP"


def test_root_greeting():
    """Fachlicher Endpunkt 1: Begruessung liefert erwarteten Text."""
    resp = requests.get(f"{BASE_URL}/api/greeting", timeout=TIMEOUT)
    assert resp.status_code == 200
    body = resp.json()
    assert "message" in body
    assert body["message"]


def test_echo_endpoint():
    """Fachlicher Endpunkt 2: Echo spiegelt die Eingabe zurueck."""
    payload = {"value": "ci-cd"}
    resp = requests.post(f"{BASE_URL}/api/echo", json=payload, timeout=TIMEOUT)
    assert resp.status_code == 200
    assert resp.json().get("value") == "ci-cd"
`;

// Sechs Beispiel-Prompts (CLAUDE.md Abschnitt 7.6 / Station 5).
export type ExamplePrompt = { id: string; title: string; prompt: string };

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: 'controller-tls',
    title: 'Controller-Installation inkl. TLS',
    prompt:
      'Erzeuge ein idempotentes Bash-Skript install-host1.sh gemäß CLAUDE.md Abschnitt 4, ' +
      'das auf host1 OpenJDK 17 und Jenkins LTS installiert, nginx als Reverse Proxy ' +
      '(443 → 127.0.0.1:8080, 80 → 443) konfiguriert und certbot für jenkins.example.com ' +
      'einrichtet. Prüfbar: nginx -t läuft fehlerfrei und https://jenkins.example.com ' +
      'liefert ein gültiges Let’s-Encrypt-Zertifikat.',
  },
  {
    id: 'agent-setup',
    title: 'Agenten-Setup',
    prompt:
      'Schreibe ein Skript setup-agent.sh, das über die Variable ROLE=maven|pytest gesteuert ' +
      'wird (CLAUDE.md Abschnitt 4): Für maven Maven 3.9.x, für pytest Python 3.12 + venv mit ' +
      'requests und pytest. Arbeitsverzeichnis /home/ubuntu/agent. Prüfbar: mvn -version bzw. ' +
      'pytest --version liefern die erwarteten Versionen.',
  },
  {
    id: 'plugins-attach',
    title: 'Plugins & Agent-Anbindung',
    prompt:
      'Beschreibe für host1 die Installation der Plugins workflow-aggregator, git, ssh-slaves, ' +
      'credentials-binding, junit, pipeline-stage-view, ws-cleanup und die Anbindung von host2 ' +
      '(Label maven) und host4 (Label pytest) per ssh-slaves. Prüfbar: beide Agenten erscheinen ' +
      'in Jenkins als online mit korrektem Label.',
  },
  {
    id: 'jenkinsfile',
    title: 'Jenkinsfile',
    prompt:
      'Erzeuge ein declarative Jenkinsfile mit den sieben Stages aus CLAUDE.md Abschnitt 8. ' +
      'Jede Stage nutzt agent { label … } gemäß Host-Zuordnung, Unit-Test und ITest ' +
      'veröffentlichen JUnit-Reports, Deploy nutzt sshagent mit dem Credential deploy-key. ' +
      'Prüfbar: die Pipeline durchläuft alle Stages grün.',
  },
  {
    id: 'python-tests',
    title: 'Python-Tests',
    prompt:
      'Schreibe tests/test_app.py mit pytest und requests: ein Health-Check gegen ' +
      '/actuator/health sowie mindestens zwei fachliche Endpunkte. Report als JUnit-XML über ' +
      '--junitxml=it-results.xml. Prüfbar: pytest läuft grün und erzeugt it-results.xml.',
  },
  {
    id: 'agent-offline',
    title: 'Fehlersuche „Agent offline“',
    prompt:
      'Der Agent maven (host2) erscheint in Jenkins als offline. Analysiere systematisch ' +
      'mögliche Ursachen (SSH-Erreichbarkeit, Java auf dem Agenten, Schlüssel/Credentials, ' +
      'Label-Schreibweise) und nenne je Ursache einen prüfbaren Befehl, um sie zu bestätigen ' +
      'oder auszuschließen.',
  },
];
