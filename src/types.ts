// Zentrale Typdefinitionen. Inhalt ist strikt von der Darstellung getrennt:
// alle Inhalte liegen typisiert in src/content/ und werden ueber diese Typen gerendert.

// ----------------------------------------------------------------------------
// RichBlock — diskriminierte Union fuer alle Inhaltsbloecke.
// ----------------------------------------------------------------------------
export type CodeLang =
  | 'bash'
  | 'groovy'
  | 'python'
  | 'yaml'
  | 'markdown'
  | 'dockerfile'
  | 'text';

export type ParagraphBlock = {
  kind: 'paragraph';
  // Inline-Markup: **fett**, `code`. Wird in RichText interpretiert.
  text: string;
};

export type ListBlock = {
  kind: 'list';
  ordered?: boolean;
  items: string[];
};

export type CodeBlock = {
  kind: 'code';
  lang: CodeLang;
  code: string;
  caption?: string;
  // Bei langen Referenz-Artefakten standardmaessig einklappen.
  collapsible?: boolean;
};

export type TableBlock = {
  kind: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
};

export type ImageBlock = {
  kind: 'image';
  src: string;
  alt: string;
  caption?: string;
};

export type CalloutBlock = {
  kind: 'callout';
  tone: 'info' | 'warning' | 'success' | 'security';
  title?: string;
  text: string;
};

export type QuoteBlock = {
  kind: 'quote';
  text: string;
  cite?: string;
};

export type HeadingBlock = {
  kind: 'heading';
  level: 2 | 3 | 4;
  text: string;
  id?: string;
};

export type RichBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | CodeBlock
  | TableBlock
  | ImageBlock
  | CalloutBlock
  | QuoteBlock;

// ----------------------------------------------------------------------------
// Stationen, Lehrbuch, Slides
// ----------------------------------------------------------------------------
export type HandbookSection = {
  id: string; // "2.2-datenfluss"
  heading: string;
  body: RichBlock[];
};

export type Station = {
  id: number; // 1..6
  slug: string;
  kicker: string;
  title: string;
  summary: string;
  learningGoals: string[];
  sectionIds: string[]; // Verweis auf HandbookSection.id
  slideIds: string[];
  exerciseIds: string[];
};

export type Slide = {
  id: string;
  kind: 'title' | 'divider' | 'content' | 'summary';
  kicker?: string;
  title: string;
  body?: RichBlock[];
  speakerNotes: string;
  background: 'navy' | 'white';
};

// ----------------------------------------------------------------------------
// Uebungen
// ----------------------------------------------------------------------------
export type ExerciseType =
  | 'prompt-craft'
  | 'claude-md-builder'
  | 'code-fill'
  | 'code-order'
  | 'terminal-sim'
  | 'node-mapping'
  | 'quiz';

export type ExerciseStatus = 'not-started' | 'in-progress' | 'solved';

// --- Solution-Varianten je Aufgabentyp ---

export type PromptCraftSolution = {
  kind: 'prompt-craft';
  criteria: PromptCriterion[];
  sample: string; // Musterloesung
};

export type PromptCriterion = {
  id: string;
  label: string;
  // Erfuellt, wenn mind. eines der Patterns (case-insensitiv) im Text vorkommt.
  anyOf: string[];
  hint: string;
};

export type ClaudeMdBuilderSolution = {
  kind: 'claude-md-builder';
  // Korrekte Reihenfolge der Bausteine (Liste von block.id).
  order: string[];
  blocks: ClaudeMdBlock[];
};

export type ClaudeMdBlock = {
  id: string;
  title: string;
  // Auswahl von Stichpunkten; correct = gehoeren in diesen Baustein.
  bullets: { id: string; text: string; correct: boolean }[];
};

export type CodeFillSolution = {
  kind: 'code-fill';
  lang: CodeLang;
  // Template mit nummerierten Luecken {{1}}, {{2}}, ...
  template: string;
  blanks: CodeBlank[];
};

export type CodeBlank = {
  id: number;
  label: string;
  // Akzeptierte Loesungen (normalisiert verglichen). Optional Regex.
  accept: string[];
  regex?: string;
  placeholder?: string;
};

export type CodeOrderSolution = {
  kind: 'code-order';
  // Items in korrekter Reihenfolge.
  items: { id: string; label: string; detail?: string }[];
};

export type TerminalSimSolution = {
  kind: 'terminal-sim';
  steps: TerminalStep[];
};

export type TerminalStep = {
  // Erwarteter Befehl: einer der Patterns (Regex, case-insensitiv) passt.
  accept: string[];
  output: string; // vorbereitete Ausgabe
  prompt: string; // Aufgabenbeschreibung des Schritts
  hintCommand: string; // Beispielbefehl als Hilfe
};

export type NodeMappingSolution = {
  kind: 'node-mapping';
  targets: { id: string; label: string }[]; // Hosts/Labels
  items: { id: string; label: string; targetId: string }[]; // Stages -> targetId
};

export type QuizSolution = {
  kind: 'quiz';
  multiple: boolean;
  options: { id: string; text: string; correct: boolean }[];
  explanation: string;
};

export type Solution =
  | PromptCraftSolution
  | ClaudeMdBuilderSolution
  | CodeFillSolution
  | CodeOrderSolution
  | TerminalSimSolution
  | NodeMappingSolution
  | QuizSolution;

export type Exercise = {
  id: string;
  stationId: number;
  title: string;
  type: ExerciseType;
  prompt: string;
  hints: string[];
  solution: Solution;
  xp: number;
};

// ----------------------------------------------------------------------------
// Glossar
// ----------------------------------------------------------------------------
export type GlossaryEntry = {
  term: string;
  definition: string;
};

// ----------------------------------------------------------------------------
// Fortschritt (localStorage-Persistenz)
// ----------------------------------------------------------------------------
export type QuizAnswer = {
  exerciseId: string;
  selected: string[];
  correct: boolean;
};

export type ProgressState = {
  // exerciseId -> Status
  exercises: Record<string, ExerciseStatus>;
  // exerciseId -> erreichte XP (einmalig bei Loesung)
  earnedXp: Record<string, number>;
  // exerciseId -> gespeicherte Quiz-/Eingabe-Antworten
  answers: Record<string, QuizAnswer>;
  version: number;
};

export type ValidationResult = {
  solved: boolean;
  // Pro Kriterium/Schritt: Rueckmeldung erfuellt/offen.
  details: { label: string; ok: boolean }[];
  message?: string;
};
