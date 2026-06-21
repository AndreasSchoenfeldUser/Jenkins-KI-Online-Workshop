import { describe, it, expect } from 'vitest';
import {
  validatePromptCraft,
  validateClaudeMdBuilder,
  validateCodeFill,
  validateCodeOrder,
  validateNodeMapping,
  validateQuiz,
  matchTerminalStep,
} from '../src/lib/validate';
import { normalize, stripWhitespace, matchesAny } from '../src/lib/validate/normalize';
import type {
  PromptCraftSolution,
  ClaudeMdBuilderSolution,
  CodeFillSolution,
  CodeOrderSolution,
  NodeMappingSolution,
  QuizSolution,
  TerminalSimSolution,
} from '../src/types';

describe('normalize', () => {
  it('vereinheitlicht Whitespace und Gross-/Kleinschreibung', () => {
    expect(normalize('  Hallo   WELT \n')).toBe('hallo welt');
  });
  it('entfernt jeglichen Whitespace', () => {
    expect(stripWhitespace('a b\tc')).toBe('abc');
  });
  it('matchesAny toleriert Whitespace und nutzt Regex', () => {
    expect(matchesAny('mvn  -B clean package -DskipTests', ['mvn -B clean package -DskipTests'])).toBe(
      true,
    );
    expect(matchesAny('mvn clean package -DskipTests', [], 'mvn\\s+clean\\s+package')).toBe(true);
    expect(matchesAny('falsch', ['richtig'])).toBe(false);
  });
});

describe('validatePromptCraft', () => {
  const sol: PromptCraftSolution = {
    kind: 'prompt-craft',
    sample: '…',
    criteria: [
      { id: 'a', label: 'Artefakt', anyOf: ['skript', '.sh'], hint: '' },
      { id: 'b', label: 'HTTPS', anyOf: ['https', 'certbot'], hint: '' },
    ],
  };
  it('erkennt alle Kriterien erfuellt', () => {
    const r = validatePromptCraft(sol, 'Erzeuge ein Skript mit HTTPS via certbot.');
    expect(r.solved).toBe(true);
    expect(r.details.every((d) => d.ok)).toBe(true);
  });
  it('meldet offene Kriterien', () => {
    const r = validatePromptCraft(sol, 'Erzeuge ein Skript.');
    expect(r.solved).toBe(false);
    expect(r.details.find((d) => d.label === 'HTTPS')?.ok).toBe(false);
  });
  it('leerer Prompt ist nie geloest', () => {
    expect(validatePromptCraft(sol, '   ').solved).toBe(false);
  });
});

describe('validateCodeFill', () => {
  const sol: CodeFillSolution = {
    kind: 'code-fill',
    lang: 'groovy',
    template: "label '{{1}}' / {{2}}",
    blanks: [
      { id: 1, label: 'Label', accept: ['maven'] },
      { id: 2, label: 'Kommando', accept: ['mvn -B clean package -DskipTests'], regex: 'mvn.*package' },
    ],
  };
  it('akzeptiert korrekte Eingaben (whitespace-tolerant)', () => {
    const r = validateCodeFill(sol, { 1: ' maven ', 2: 'mvn clean package' });
    expect(r.solved).toBe(true);
  });
  it('lehnt falsche Eingaben ab', () => {
    const r = validateCodeFill(sol, { 1: 'pytest', 2: 'echo' });
    expect(r.solved).toBe(false);
    expect(r.details[0].ok).toBe(false);
  });
  it('Teil-Loesung ist nicht geloest', () => {
    const r = validateCodeFill(sol, { 1: 'maven', 2: '' });
    expect(r.solved).toBe(false);
  });
});

describe('validateCodeOrder', () => {
  const sol: CodeOrderSolution = {
    kind: 'code-order',
    items: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ],
  };
  it('erkennt korrekte Reihenfolge', () => {
    expect(validateCodeOrder(sol, ['a', 'b', 'c']).solved).toBe(true);
  });
  it('erkennt falsche Reihenfolge', () => {
    const r = validateCodeOrder(sol, ['b', 'a', 'c']);
    expect(r.solved).toBe(false);
    expect(r.details[0].ok).toBe(false);
    expect(r.details[2].ok).toBe(true);
  });
});

describe('validateNodeMapping', () => {
  const sol: NodeMappingSolution = {
    kind: 'node-mapping',
    targets: [
      { id: 'maven', label: 'maven' },
      { id: 'pytest', label: 'pytest' },
    ],
    items: [
      { id: 'build', label: 'Build', targetId: 'maven' },
      { id: 'itest', label: 'ITest', targetId: 'pytest' },
    ],
  };
  it('erkennt korrekte Zuordnung', () => {
    expect(validateNodeMapping(sol, { build: 'maven', itest: 'pytest' }).solved).toBe(true);
  });
  it('erkennt falsche Zuordnung', () => {
    const r = validateNodeMapping(sol, { build: 'pytest', itest: 'pytest' });
    expect(r.solved).toBe(false);
  });
});

describe('validateQuiz', () => {
  const single: QuizSolution = {
    kind: 'quiz',
    multiple: false,
    explanation: 'x',
    options: [
      { id: 'a', text: 'A', correct: true },
      { id: 'b', text: 'B', correct: false },
    ],
  };
  const multi: QuizSolution = {
    kind: 'quiz',
    multiple: true,
    explanation: 'x',
    options: [
      { id: 'a', text: 'A', correct: true },
      { id: 'b', text: 'B', correct: true },
      { id: 'c', text: 'C', correct: false },
    ],
  };
  it('single choice korrekt', () => {
    expect(validateQuiz(single, ['a']).solved).toBe(true);
    expect(validateQuiz(single, ['b']).solved).toBe(false);
  });
  it('multiple choice braucht genau die richtigen', () => {
    expect(validateQuiz(multi, ['a', 'b']).solved).toBe(true);
    expect(validateQuiz(multi, ['a']).solved).toBe(false);
    expect(validateQuiz(multi, ['a', 'b', 'c']).solved).toBe(false);
  });
});

describe('validateClaudeMdBuilder', () => {
  const sol: ClaudeMdBuilderSolution = {
    kind: 'claude-md-builder',
    order: ['x', 'y'],
    blocks: [
      {
        id: 'x',
        title: 'X',
        bullets: [
          { id: 'x1', text: 'richtig', correct: true },
          { id: 'x2', text: 'falsch', correct: false },
        ],
      },
      {
        id: 'y',
        title: 'Y',
        bullets: [{ id: 'y1', text: 'richtig', correct: true }],
      },
    ],
  };
  it('korrekte Reihenfolge und Stichpunkte', () => {
    const r = validateClaudeMdBuilder(sol, ['x', 'y'], { x: ['x1'], y: ['y1'] });
    expect(r.solved).toBe(true);
  });
  it('falsche Reihenfolge schlaegt fehl', () => {
    const r = validateClaudeMdBuilder(sol, ['y', 'x'], { x: ['x1'], y: ['y1'] });
    expect(r.solved).toBe(false);
  });
  it('falscher Stichpunkt schlaegt fehl', () => {
    const r = validateClaudeMdBuilder(sol, ['x', 'y'], { x: ['x1', 'x2'], y: ['y1'] });
    expect(r.solved).toBe(false);
  });
});

describe('matchTerminalStep', () => {
  const sol: TerminalSimSolution = {
    kind: 'terminal-sim',
    steps: [
      { prompt: '', accept: ['chmod\\s+600\\s+.*ed25519'], output: 'ok', hintCommand: '' },
    ],
  };
  it('akzeptiert passenden Befehl und liefert Ausgabe', () => {
    const r = matchTerminalStep(sol, 0, 'chmod 600 ~/.ssh/host1_ed25519');
    expect(r.ok).toBe(true);
    expect(r.output).toBe('ok');
  });
  it('lehnt unpassenden Befehl ab', () => {
    expect(matchTerminalStep(sol, 0, 'ls -la').ok).toBe(false);
  });
});
