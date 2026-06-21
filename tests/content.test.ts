import { describe, it, expect } from 'vitest';
import { STATIONS } from '../src/content/stations';
import { EXERCISES } from '../src/content/exercises';
import { SLIDES } from '../src/content/slides';
import { HANDBOOK } from '../src/content/handbook';
import { STAGES, HOSTS } from '../src/content/domain';
import type { ExerciseType } from '../src/types';

describe('Inhaltskonsistenz (Akzeptanzkriterien)', () => {
  it('alle in Stationen referenzierten Aufgaben existieren', () => {
    const ids = new Set(EXERCISES.map((e) => e.id));
    for (const s of STATIONS) {
      for (const ex of s.exerciseIds) expect(ids.has(ex), `fehlt: ${ex}`).toBe(true);
    }
  });

  it('alle in Stationen referenzierten Slides und Sections existieren', () => {
    const slideIds = new Set(SLIDES.map((s) => s.id));
    const sectionIds = new Set(HANDBOOK.map((s) => s.id));
    for (const s of STATIONS) {
      for (const sl of s.slideIds) expect(slideIds.has(sl), `Slide fehlt: ${sl}`).toBe(true);
      for (const sec of s.sectionIds) expect(sectionIds.has(sec), `Section fehlt: ${sec}`).toBe(true);
    }
  });

  it('deckt mindestens 12 Uebungen über alle sieben Aufgabentypen ab', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(12);
    const types = new Set<ExerciseType>(EXERCISES.map((e) => e.type));
    const expected: ExerciseType[] = [
      'prompt-craft',
      'claude-md-builder',
      'code-fill',
      'code-order',
      'terminal-sim',
      'node-mapping',
      'quiz',
    ];
    for (const t of expected) expect(types.has(t), `Typ fehlt: ${t}`).toBe(true);
  });

  it('genau 16 Folien', () => {
    expect(SLIDES.length).toBe(16);
  });

  it('genau sieben Stages mit gueltiger Host-Zuordnung', () => {
    expect(STAGES.length).toBe(7);
    const hostIds = new Set(HOSTS.map((h) => h.id));
    for (const s of STAGES) expect(hostIds.has(s.hostId)).toBe(true);
  });

  it('node-mapping-Aufgabe stimmt mit der Stage-Zuordnung in domain.ts überein', () => {
    const ex = EXERCISES.find((e) => e.id === 'node-mapping-stages');
    expect(ex).toBeDefined();
    if (ex && ex.solution.kind === 'node-mapping') {
      // Build/Unit-Test/Deploy -> maven, Smoke-Wait/ITest -> pytest, Checkout/Report -> controller
      const expectTarget: Record<string, string> = {
        checkout: 'controller',
        build: 'maven',
        'unit-test': 'maven',
        deploy: 'maven',
        'smoke-wait': 'pytest',
        itest: 'pytest',
        report: 'controller',
      };
      for (const item of ex.solution.items) {
        expect(item.targetId).toBe(expectTarget[item.id]);
      }
    }
  });
});
