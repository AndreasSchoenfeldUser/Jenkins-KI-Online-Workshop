import { useState } from 'react';
import type { Exercise, NodeMappingSolution, ValidationResult } from '../../../types';
import { validateNodeMapping } from '../../../lib/validate';
import { useExercise } from '../useExercise';
import { Feedback } from '../Feedback';
import { Hints } from '../Hints';

// Zuordnung Stage -> Host/Label ueber Auswahlfelder (tastaturbedienbare
// Alternative zu Drag&Drop, CLAUDE.md A11y-Anforderung).
export function NodeMapping({ exercise }: { exercise: Exercise }) {
  const sol = exercise.solution as NodeMappingSolution;
  const { apply } = useExercise(exercise);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ValidationResult | null>(null);

  function setTarget(itemId: string, targetId: string) {
    setMapping((m) => ({ ...m, [itemId]: targetId }));
    setResult(null);
  }

  function check() {
    const r = validateNodeMapping(sol, mapping);
    setResult(r);
    apply(r, { selected: Object.values(mapping), correct: r.solved });
  }

  const allChosen = sol.items.every((i) => mapping[i.id]);

  return (
    <div>
      <ul className="space-y-2">
        {sol.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3"
          >
            <span className="font-medium">{item.label}</span>
            <label className="flex items-center gap-2 text-sm">
              <span className="sr-only">Ziel für {item.label}</span>
              <select
                value={mapping[item.id] ?? ''}
                onChange={(e) => setTarget(item.id, e.target.value)}
                className="rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1.5 text-[color:var(--text)] focus:border-orange"
              >
                <option value="">— bitte wählen —</option>
                {sol.targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={check}
        disabled={!allChosen}
        className="mt-4 rounded bg-orange px-4 py-2 font-medium text-white transition hover:bg-orange/90 disabled:opacity-50"
      >
        Zuordnung prüfen
      </button>
      <Feedback result={result} />
      <Hints
        hints={exercise.hints}
        sample={
          <ul className="text-sm">
            {sol.items.map((i) => (
              <li key={i.id}>
                {i.label} → {sol.targets.find((t) => t.id === i.targetId)?.label}
              </li>
            ))}
          </ul>
        }
      />
    </div>
  );
}
