import { useState } from 'react';
import type { Exercise, QuizSolution, ValidationResult } from '../../../types';
import { validateQuiz } from '../../../lib/validate';
import { useExercise } from '../useExercise';
import { Feedback } from '../Feedback';

export function Quiz({ exercise }: { exercise: Exercise }) {
  const sol = exercise.solution as QuizSolution;
  const { apply } = useExercise(exercise);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<ValidationResult | null>(null);

  function toggle(id: string) {
    setResult(null);
    if (sol.multiple) {
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    } else {
      setSelected([id]);
    }
  }

  function check() {
    const r = validateQuiz(sol, selected);
    setResult(r);
    apply(r, { selected, correct: r.solved });
  }

  return (
    <div>
      <fieldset>
        <legend className="sr-only">Antwortmöglichkeiten</legend>
        <ul className="space-y-2">
          {sol.options.map((o) => {
            const checked = selected.includes(o.id);
            return (
              <li key={o.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                    checked ? 'border-orange bg-orange/5' : 'border-[color:var(--border)] hover:bg-[color:var(--bg-soft)]'
                  }`}
                >
                  <input
                    type={sol.multiple ? 'checkbox' : 'radio'}
                    name={`quiz-${exercise.id}`}
                    checked={checked}
                    onChange={() => toggle(o.id)}
                    className="mt-1 h-4 w-4 accent-[color:var(--orange)]"
                  />
                  <span>{o.text}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
      {sol.multiple && (
        <p className="mt-2 text-xs text-[color:var(--text-muted)]">Mehrfachauswahl möglich.</p>
      )}
      <button
        type="button"
        onClick={check}
        disabled={selected.length === 0}
        className="mt-4 rounded bg-orange px-4 py-2 font-medium text-white transition hover:bg-orange/90 disabled:opacity-50"
      >
        Antwort prüfen
      </button>
      <Feedback result={result} />
    </div>
  );
}
