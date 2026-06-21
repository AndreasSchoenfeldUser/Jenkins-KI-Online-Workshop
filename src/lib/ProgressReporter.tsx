import { useEffect } from 'react';
import { useProgress } from './progress';
import { EXERCISES } from '../content/exercises';
import { STATIONS } from '../content/stations';

// Meldet den Fortschritt des angemeldeten Teilnehmers an das Backend
// (PUT /api/progress). Der Server protokolliert daraus neu geloeste Aufgaben
// und haelt einen Snapshot je Teilnehmer fuer den Admin-Bereich.
export function ProgressReporter() {
  const { state, solvedCount, totalCount, earnedXpTotal, totalXp, quizScore } = useProgress();

  useEffect(() => {
    const solved = EXERCISES.filter((e) => state.exercises[e.id] === 'solved').map((e) => ({
      id: e.id,
      title: e.title,
      stationId: e.stationId,
      xp: e.xp,
    }));
    const stations = STATIONS.map((s) => {
      const list = EXERCISES.filter((e) => e.stationId === s.id);
      return {
        id: s.id,
        title: s.title,
        solved: list.filter((e) => state.exercises[e.id] === 'solved').length,
        total: list.length,
      };
    });

    const payload = {
      solvedCount,
      totalCount,
      earnedXp: earnedXpTotal,
      totalXp,
      quizCorrect: quizScore.correct,
      quizAnswered: quizScore.answered,
      solved,
      stations,
    };

    // Kurzes Debounce, damit schnelle Statuswechsel zusammengefasst werden.
    const t = window.setTimeout(() => {
      fetch('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      }).catch(() => {
        /* offline / Backend nicht erreichbar — Snapshot wird beim naechsten Mal gesendet */
      });
    }, 600);

    return () => window.clearTimeout(t);
  }, [state, solvedCount, totalCount, earnedXpTotal, totalXp, quizScore.correct, quizScore.answered]);

  return null;
}
