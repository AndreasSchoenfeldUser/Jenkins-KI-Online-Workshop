import { Fragment, useState } from 'react';
import type { Exercise, CodeFillSolution, ValidationResult } from '../../../types';
import { validateCodeFill } from '../../../lib/validate';
import { useExercise } from '../useExercise';
import { Feedback } from '../Feedback';
import { Hints } from '../Hints';
import { CodeBlock } from '../../../components/CodeBlock';

export function CodeFill({ exercise }: { exercise: Exercise }) {
  const sol = exercise.solution as CodeFillSolution;
  const { apply } = useExercise(exercise);
  const [values, setValues] = useState<Record<number, string>>({});
  const [result, setResult] = useState<ValidationResult | null>(null);

  // Template an {{n}} aufsplitten und Eingabefelder einfuegen.
  const parts = sol.template.split(/(\{\{\d+\}\})/g);

  function setVal(id: number, v: string) {
    setValues((prev) => ({ ...prev, [id]: v }));
    setResult(null);
  }

  function check() {
    const r = validateCodeFill(sol, values);
    setResult(r);
    apply(r, { selected: [], correct: r.solved });
  }

  // Musterloesung: Template mit eingesetzten ersten akzeptierten Werten.
  const solved = sol.blanks.reduce(
    (acc, b) => acc.replace(`{{${b.id}}}`, b.accept[0]),
    sol.template,
  );

  return (
    <div>
      <div className="overflow-x-auto rounded-lg bg-navy p-4 font-mono text-sm leading-7 text-light">
        <pre className="whitespace-pre-wrap">
          {parts.map((part, i) => {
            const m = part.match(/\{\{(\d+)\}\}/);
            if (m) {
              const id = Number(m[1]);
              const blank = sol.blanks.find((b) => b.id === id);
              return (
                <input
                  key={i}
                  aria-label={blank?.label ?? `Lücke ${id}`}
                  value={values[id] ?? ''}
                  onChange={(e) => setVal(id, e.target.value)}
                  placeholder={blank?.placeholder ?? '…'}
                  spellCheck={false}
                  className="mx-1 inline-block min-w-[8rem] rounded border border-amber bg-navy-2 px-2 py-0.5 font-mono text-amber placeholder:text-light/40 focus:border-orange"
                />
              );
            }
            return <Fragment key={i}>{part}</Fragment>;
          })}
        </pre>
      </div>

      <ul className="mt-3 space-y-0.5 text-sm text-[color:var(--text-muted)]">
        {sol.blanks.map((b) => (
          <li key={b.id}>
            <strong>Lücke {b.id}:</strong> {b.label}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={check}
        className="mt-4 rounded bg-orange px-4 py-2 font-medium text-white transition hover:bg-orange/90"
      >
        Lösung prüfen
      </button>
      <Feedback result={result} />
      <Hints hints={exercise.hints} sample={<CodeBlock code={solved} lang={sol.lang} />} />
    </div>
  );
}
