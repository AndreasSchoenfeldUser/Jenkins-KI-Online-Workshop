import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { ExerciseStatus, ProgressState, QuizAnswer } from '../types';
import { loadJSON, saveJSON } from './storage';
import { EXERCISES } from '../content/exercises';

const STORAGE_PREFIX = 'jenkins-workshop:progress:v1';
const VERSION = 1;

const initialState: ProgressState = {
  exercises: {},
  earnedXp: {},
  answers: {},
  version: VERSION,
};

export type ProgressAction =
  | { type: 'SET_STATUS'; exerciseId: string; status: ExerciseStatus }
  | { type: 'SOLVE'; exerciseId: string; xp: number }
  | { type: 'SAVE_ANSWER'; answer: QuizAnswer }
  | { type: 'RESET_ONE'; exerciseId: string }
  | { type: 'RESET_ALL' }
  | { type: 'HYDRATE'; state: ProgressState };

export function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'SET_STATUS': {
      // Eine bereits geloeste Aufgabe nicht auf "in-progress" zurueckstufen.
      if (state.exercises[action.exerciseId] === 'solved' && action.status !== 'solved') {
        return state;
      }
      return {
        ...state,
        exercises: { ...state.exercises, [action.exerciseId]: action.status },
      };
    }

    case 'SOLVE': {
      const already = state.exercises[action.exerciseId] === 'solved';
      return {
        ...state,
        exercises: { ...state.exercises, [action.exerciseId]: 'solved' },
        // XP nur einmalig vergeben.
        earnedXp: already
          ? state.earnedXp
          : { ...state.earnedXp, [action.exerciseId]: action.xp },
      };
    }

    case 'SAVE_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.answer.exerciseId]: action.answer },
      };

    case 'RESET_ONE': {
      const exercises = { ...state.exercises };
      const earnedXp = { ...state.earnedXp };
      const answers = { ...state.answers };
      delete exercises[action.exerciseId];
      delete earnedXp[action.exerciseId];
      delete answers[action.exerciseId];
      return { ...state, exercises, earnedXp, answers };
    }

    case 'RESET_ALL':
      return { ...initialState };

    default:
      return state;
  }
}

type ProgressContextValue = {
  state: ProgressState;
  dispatch: React.Dispatch<ProgressAction>;
  // abgeleitete Werte
  totalXp: number;
  earnedXpTotal: number;
  solvedCount: number;
  totalCount: number;
  quizScore: { correct: number; answered: number };
  statusOf: (exerciseId: string) => ExerciseStatus;
  stationProgress: (stationId: number) => { solved: number; total: number };
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string;
}) {
  // Fortschritt wird pro Benutzer getrennt persistiert.
  const storageKey = `${STORAGE_PREFIX}:${userId ?? 'default'}`;

  const [state, dispatch] = useReducer(progressReducer, initialState, () => {
    const loaded = loadJSON<ProgressState>(storageKey, initialState);
    // Versionsmigration: bei abweichender Version frisch beginnen.
    if (!loaded || loaded.version !== VERSION) return initialState;
    return { ...initialState, ...loaded };
  });

  useEffect(() => {
    saveJSON(storageKey, state);
  }, [state, storageKey]);

  const totalXp = EXERCISES.reduce((sum, e) => sum + e.xp, 0);
  const earnedXpTotal = Object.values(state.earnedXp).reduce((a, b) => a + b, 0);
  const solvedCount = Object.values(state.exercises).filter((s) => s === 'solved').length;
  const totalCount = EXERCISES.length;

  const quizAnswers = Object.values(state.answers);
  const quizScore = {
    correct: quizAnswers.filter((a) => a.correct).length,
    answered: quizAnswers.length,
  };

  const statusOf = (exerciseId: string): ExerciseStatus =>
    state.exercises[exerciseId] ?? 'not-started';

  const stationProgress = (stationId: number) => {
    const list = EXERCISES.filter((e) => e.stationId === stationId);
    return {
      solved: list.filter((e) => state.exercises[e.id] === 'solved').length,
      total: list.length,
    };
  };

  const value: ProgressContextValue = {
    state,
    dispatch,
    totalXp,
    earnedXpTotal,
    solvedCount,
    totalCount,
    quizScore,
    statusOf,
    stationProgress,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress muss innerhalb von ProgressProvider verwendet werden.');
  return ctx;
}
