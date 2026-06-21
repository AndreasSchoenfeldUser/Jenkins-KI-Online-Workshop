import type { Station } from '../types';

// Sechs Stationen — der rote Faden des Workshops. sectionIds verweisen auf
// HandbookSection.id, slideIds auf Slide.id, exerciseIds auf Exercise.id.

export const STATIONS: Station[] = [
  {
    id: 1,
    slug: 'warum-und-was',
    kicker: 'Station 1 · Warum & Was',
    title: 'Warum & Was',
    summary:
      'Paradigmenwechsel vom Abtippen zum Spezifizieren, Ausgangslage, Hosts, Domain/HTTPS und der Umgang mit Schlüsseln.',
    learningGoals: [
      'Den Wechsel von „Befehle abtippen“ zu „Ziel spezifizieren“ erklären.',
      'Die vorbereitete Umgebung (vier Hosts, Versionen, Domain/HTTPS) benennen.',
      'Verstehen, warum private Schlüssel nicht ins Repository gehören.',
    ],
    sectionIds: ['1-einleitung'],
    slideIds: ['s-title', 's-faden', 's-mindset', 's-ausgangslage'],
    exerciseIds: ['quiz-mindset', 'prompt-controller', 'quiz-keys'],
  },
  {
    id: 2,
    slug: 'architektur',
    kicker: 'Station 2 · Architektur',
    title: 'Architektur',
    summary:
      'Topologie der vier Knoten, Datenfluss zwischen Build, Deploy und Test, Begründung der Rollentrennung.',
    learningGoals: [
      'Die vier Knoten mit Rollen und Labels zuordnen.',
      'Den Datenfluss von Checkout bis Report nachvollziehen.',
      'Sicherheit, Skalierung und Stabilität als Gründe der Rollentrennung nennen.',
    ],
    sectionIds: ['2-architektur'],
    slideIds: ['s-arch-divider', 's-knoten', 's-datenfluss'],
    exerciseIds: ['node-mapping-stages', 'quiz-controller-build'],
  },
  {
    id: 3,
    slug: 'claude-code',
    kicker: 'Station 3 · Claude Code',
    title: 'Claude Code',
    summary:
      'Der Arbeitszyklus Spezifizieren → Generieren → Prüfen → Korrigieren und das Prinzip „Mensch prüft“.',
    learningGoals: [
      'Den vierstufigen Arbeitszyklus beschreiben.',
      'Die empfohlene Projektstruktur kennen.',
      'Das Sicherheitsprinzip der menschlichen Prüfung anwenden.',
    ],
    sectionIds: ['3-claude-code'],
    slideIds: ['s-cc-divider', 's-arbeitsweise'],
    exerciseIds: ['code-order-cycle', 'quiz-human-review'],
  },
  {
    id: 4,
    slug: 'claude-md',
    kicker: 'Station 4 · CLAUDE.md',
    title: 'CLAUDE.md',
    summary:
      'Die acht Bausteine einer Spezifikation, die vollständige Beispiel-CLAUDE.md sowie die sieben Pipeline-Stages und Plugins.',
    learningGoals: [
      'Die acht Bausteine einer CLAUDE.md ordnen.',
      'Die sieben Stages den richtigen Hosts/Labels zuordnen.',
      'Die benötigten Plugins benennen.',
    ],
    sectionIds: ['4-claude-md', '6-jenkinsfile'],
    slideIds: ['s-md-divider', 's-bausteine', 's-stages'],
    exerciseIds: ['claude-md-order', 'code-order-stages', 'code-fill-jenkinsfile', 'quiz-plugins'],
  },
  {
    id: 5,
    slug: 'prompten',
    kicker: 'Station 5 · Prompten',
    title: 'Prompten',
    summary:
      'Das Drei-Zutaten-Muster, sechs Beispiel-Prompts und das Gegenbeispiel vager Prompts.',
    learningGoals: [
      'Zielartefakt, Quelle und prüfbare Bedingung in einem Prompt formulieren.',
      'Gute von vagen Prompts unterscheiden.',
      'Prompts für Installation, Jenkinsfile und Tests schreiben.',
    ],
    sectionIds: ['5-anleitung'],
    slideIds: ['s-prompt-divider', 's-prompt-muster'],
    exerciseIds: ['prompt-jenkinsfile', 'prompt-agent', 'code-fill-install'],
  },
  {
    id: 6,
    slug: 'durchfuehrung',
    kicker: 'Station 6 · Durchführung',
    title: 'Durchführung',
    summary: 'Ablauf, Abnahmekriterien, Bewertung der Arbeitsweise und mögliche Erweiterungen.',
    learningGoals: [
      'Den Tagesablauf und die Abnahmekriterien kennen.',
      'Eine simulierte Provisionierungssequenz im Terminal durchführen.',
      'Erweiterungen (JCasC, Container-Agent, Security-Stage) einordnen.',
    ],
    sectionIds: ['7-ablauf', '8-zusammenfassung'],
    slideIds: ['s-durchfuehrung', 's-zusammenfassung'],
    exerciseIds: ['terminal-keys', 'terminal-deploy', 'quiz-smoke-wait'],
  },
];

export const stationById = (id: number) => STATIONS.find((s) => s.id === id);
export const stationBySlug = (slug: string) => STATIONS.find((s) => s.slug === slug);
