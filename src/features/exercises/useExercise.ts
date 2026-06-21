import { useCallback } from 'react';
import type { Exercise, QuizAnswer, ValidationResult } from '../../types';
import { useProgress } from '../../lib/progress';

// Bindet eine Uebung an den globalen Fortschritt: Status setzen, loesen,
// Antworten speichern, zuruecksetzen.
export function useExercise(exercise: Exercise) {
  const { dispatch, statusOf } = useProgress();
  const status = statusOf(exercise.id);

  const markInProgress = useCallback(() => {
    dispatch({ type: 'SET_STATUS', exerciseId: exercise.id, status: 'in-progress' });
  }, [dispatch, exercise.id]);

  const solve = useCallback(() => {
    dispatch({ type: 'SOLVE', exerciseId: exercise.id, xp: exercise.xp });
  }, [dispatch, exercise.id, exercise.xp]);

  const saveAnswer = useCallback(
    (answer: Omit<QuizAnswer, 'exerciseId'>) => {
      dispatch({ type: 'SAVE_ANSWER', answer: { ...answer, exerciseId: exercise.id } });
    },
    [dispatch, exercise.id],
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET_ONE', exerciseId: exercise.id });
  }, [dispatch, exercise.id]);

  // Verarbeitet ein Validierungsergebnis und aktualisiert den Status.
  const apply = useCallback(
    (result: ValidationResult, recordAnswer?: Omit<QuizAnswer, 'exerciseId'>) => {
      if (recordAnswer) saveAnswer(recordAnswer);
      if (result.solved) solve();
      else markInProgress();
    },
    [markInProgress, solve, saveAnswer],
  );

  return { status, markInProgress, solve, saveAnswer, reset, apply };
}
