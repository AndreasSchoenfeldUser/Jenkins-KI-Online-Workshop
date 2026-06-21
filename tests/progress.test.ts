import { describe, it, expect } from 'vitest';
import { progressReducer, type ProgressAction } from '../src/lib/progress';
import type { ProgressState } from '../src/types';

const initial: ProgressState = { exercises: {}, earnedXp: {}, answers: {}, version: 1 };

function run(state: ProgressState, actions: ProgressAction[]): ProgressState {
  return actions.reduce(progressReducer, state);
}

describe('progressReducer', () => {
  it('setzt Status auf in-progress', () => {
    const s = run(initial, [{ type: 'SET_STATUS', exerciseId: 'e1', status: 'in-progress' }]);
    expect(s.exercises.e1).toBe('in-progress');
  });

  it('vergibt XP einmalig bei SOLVE', () => {
    const s = run(initial, [
      { type: 'SOLVE', exerciseId: 'e1', xp: 20 },
      { type: 'SOLVE', exerciseId: 'e1', xp: 20 },
    ]);
    expect(s.exercises.e1).toBe('solved');
    expect(s.earnedXp.e1).toBe(20);
    expect(Object.values(s.earnedXp).reduce((a, b) => a + b, 0)).toBe(20);
  });

  it('stuft eine geloeste Aufgabe nicht zurueck', () => {
    const s = run(initial, [
      { type: 'SOLVE', exerciseId: 'e1', xp: 10 },
      { type: 'SET_STATUS', exerciseId: 'e1', status: 'in-progress' },
    ]);
    expect(s.exercises.e1).toBe('solved');
  });

  it('speichert Quiz-Antworten', () => {
    const s = run(initial, [
      { type: 'SAVE_ANSWER', answer: { exerciseId: 'q1', selected: ['a'], correct: true } },
    ]);
    expect(s.answers.q1.correct).toBe(true);
  });

  it('RESET_ONE entfernt nur eine Aufgabe', () => {
    const s = run(initial, [
      { type: 'SOLVE', exerciseId: 'e1', xp: 10 },
      { type: 'SOLVE', exerciseId: 'e2', xp: 10 },
      { type: 'RESET_ONE', exerciseId: 'e1' },
    ]);
    expect(s.exercises.e1).toBeUndefined();
    expect(s.exercises.e2).toBe('solved');
  });

  it('RESET_ALL leert den Zustand', () => {
    const s = run(initial, [
      { type: 'SOLVE', exerciseId: 'e1', xp: 10 },
      { type: 'RESET_ALL' },
    ]);
    expect(s.exercises).toEqual({});
    expect(s.earnedXp).toEqual({});
  });
});
