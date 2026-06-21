import { useState } from 'react';
import type { Exercise, PromptCraftSolution, ValidationResult } from '../../../types';
import { validatePromptCraft } from '../../../lib/validate';
import { useExercise } from '../useExercise';
import { Feedback } from '../Feedback';
import { Hints } from '../Hints';

export function PromptCraft({ exercise }: { exercise: Exercise }) {
  const sol = exercise.solution as PromptCraftSolution;
  const { apply } = useExercise(exercise);
  const [text, setText] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);

  function check() {
    const r = validatePromptCraft(sol, text);
    setResult(r);
    apply(r, { selected: [], correct: r.solved });
  }

  return (
    <div>
      <label htmlFor={`prompt-${exercise.id}`} className="mb-1 block text-sm font-medium">
        Ihr Prompt
      </label>
      <textarea
        id={`prompt-${exercise.id}`}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setResult(null);
        }}
        rows={7}
        placeholder="Formulieren Sie hier Ihren Claude-Code-Prompt …"
        className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3 font-mono text-sm text-[color:var(--text)] focus:border-orange"
      />
      <div className="mt-2 rounded-lg bg-[color:var(--bg-soft)] p-3">
        <p className="text-sm font-semibold">Kriterien-Checkliste</p>
        <ul className="mt-1 space-y-0.5 text-sm text-[color:var(--text-muted)]">
          {sol.criteria.map((c) => (
            <li key={c.id}>• {c.label}</li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={check}
        disabled={text.trim().length === 0}
        className="mt-4 rounded bg-orange px-4 py-2 font-medium text-white transition hover:bg-orange/90 disabled:opacity-50"
      >
        Prompt prüfen
      </button>
      <Feedback result={result} />
      <Hints
        hints={exercise.hints}
        sample={<p className="font-mono text-sm text-[color:var(--text)]">{sol.sample}</p>}
      />
    </div>
  );
}
