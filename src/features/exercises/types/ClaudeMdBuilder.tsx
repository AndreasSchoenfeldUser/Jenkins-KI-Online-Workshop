import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Exercise, ClaudeMdBuilderSolution, ValidationResult } from '../../../types';
import { validateClaudeMdBuilder } from '../../../lib/validate';
import { useExercise } from '../useExercise';
import { Feedback } from '../Feedback';
import { Hints } from '../Hints';

function scramble<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ClaudeMdBuilder({ exercise }: { exercise: Exercise }) {
  const sol = exercise.solution as ClaudeMdBuilderSolution;
  const { apply } = useExercise(exercise);
  const [order, setOrder] = useState<string[]>(() => scramble(sol.order));
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<ValidationResult | null>(null);

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    setResult(null);
  }

  function toggleBullet(blockId: string, bulletId: string) {
    setSelected((prev) => {
      const cur = new Set(prev[blockId] ?? []);
      if (cur.has(bulletId)) cur.delete(bulletId);
      else cur.add(bulletId);
      return { ...prev, [blockId]: [...cur] };
    });
    setResult(null);
  }

  function check() {
    const r = validateClaudeMdBuilder(sol, order, selected);
    setResult(r);
    apply(r, { selected: order, correct: r.solved });
  }

  const blockById = (id: string) => sol.blocks.find((b) => b.id === id)!;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">1. Bausteine in sinnvolle Reihenfolge bringen</p>
      <ol className="space-y-3">
        {order.map((id, i) => {
          const block = blockById(id);
          return (
            <li
              key={id}
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium">{block.title}</span>
                <span className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`„${block.title}“ nach oben`}
                    className="rounded p-1 hover:bg-[color:var(--bg-soft)] disabled:opacity-30"
                  >
                    <ArrowUp size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === order.length - 1}
                    aria-label={`„${block.title}“ nach unten`}
                    className="rounded p-1 hover:bg-[color:var(--bg-soft)] disabled:opacity-30"
                  >
                    <ArrowDown size={16} aria-hidden />
                  </button>
                </span>
              </div>
              <fieldset className="mt-2 pl-10">
                <legend className="text-xs text-[color:var(--text-muted)]">
                  Korrekte Stichpunkte markieren:
                </legend>
                {block.bullets.map((b) => (
                  <label key={b.id} className="mt-1 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(selected[block.id] ?? []).includes(b.id)}
                      onChange={() => toggleBullet(block.id, b.id)}
                      className="h-4 w-4 accent-[color:var(--orange)]"
                    />
                    {b.text}
                  </label>
                ))}
              </fieldset>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={check}
        className="mt-4 rounded bg-orange px-4 py-2 font-medium text-white transition hover:bg-orange/90"
      >
        Aufbau prüfen
      </button>
      <Feedback result={result} />
      <Hints
        hints={exercise.hints}
        sample={
          <ol className="ml-5 list-decimal text-sm">
            {sol.order.map((id) => (
              <li key={id}>{blockById(id).title}</li>
            ))}
          </ol>
        }
      />
    </div>
  );
}
