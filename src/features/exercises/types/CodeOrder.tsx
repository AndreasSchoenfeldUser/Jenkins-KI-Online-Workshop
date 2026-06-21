import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Exercise, CodeOrderSolution, ValidationResult } from '../../../types';
import { validateCodeOrder } from '../../../lib/validate';
import { useExercise } from '../useExercise';
import { Feedback } from '../Feedback';
import { Hints } from '../Hints';

// Reihenfolge per Hoch/Runter-Buttons — vollstaendig tastaturbedienbar
// (Tastatur-Alternative zu Drag&Drop, CLAUDE.md A11y-Anforderung).
function scramble<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Falls zufaellig korrekt: ein Tausch erzwingt eine echte Aufgabe.
  return a;
}

export function CodeOrder({ exercise }: { exercise: Exercise }) {
  const sol = exercise.solution as CodeOrderSolution;
  const { apply } = useExercise(exercise);
  const [order, setOrder] = useState<string[]>(() => {
    const ids = sol.items.map((i) => i.id);
    const s = scramble(ids);
    if (s.every((id, i) => id === ids[i]) && s.length > 1) {
      [s[0], s[1]] = [s[1], s[0]];
    }
    return s;
  });
  const [result, setResult] = useState<ValidationResult | null>(null);

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    setResult(null);
  }

  function check() {
    const r = validateCodeOrder(sol, order);
    setResult(r);
    apply(r, { selected: order, correct: r.solved });
  }

  const labelOf = (id: string) => sol.items.find((i) => i.id === id);

  return (
    <div>
      <ol className="space-y-2">
        {order.map((id, i) => {
          const item = labelOf(id);
          return (
            <li
              key={id}
              className="flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-medium">{item?.label}</span>
                {item?.detail && (
                  <span className="block text-sm text-[color:var(--text-muted)]">{item.detail}</span>
                )}
              </span>
              <span className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`„${item?.label}“ nach oben`}
                  className="rounded p-1 hover:bg-[color:var(--bg-soft)] disabled:opacity-30"
                >
                  <ArrowUp size={16} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                  aria-label={`„${item?.label}“ nach unten`}
                  className="rounded p-1 hover:bg-[color:var(--bg-soft)] disabled:opacity-30"
                >
                  <ArrowDown size={16} aria-hidden />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={check}
        className="mt-4 rounded bg-orange px-4 py-2 font-medium text-white transition hover:bg-orange/90"
      >
        Reihenfolge prüfen
      </button>
      <Feedback result={result} />
      <Hints
        hints={exercise.hints}
        sample={
          <ol className="ml-5 list-decimal text-sm">
            {sol.items.map((i) => (
              <li key={i.id}>{i.label}</li>
            ))}
          </ol>
        }
      />
    </div>
  );
}
