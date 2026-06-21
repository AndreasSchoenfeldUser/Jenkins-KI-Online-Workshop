import { useRef, useState } from 'react';
import type { Exercise, TerminalSimSolution } from '../../../types';
import { matchTerminalStep } from '../../../lib/validate';
import { useExercise } from '../useExercise';
import { Hints } from '../Hints';

type Line = { kind: 'cmd' | 'out' | 'err'; text: string };

// Deterministisches, offline-Terminal. Fuehrt niemals echte Befehle aus.
export function TerminalSim({ exercise }: { exercise: Exercise }) {
  const sol = exercise.solution as TerminalSimSolution;
  const { apply, markInProgress } = useExercise(exercise);
  const [lines, setLines] = useState<Line[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const done = stepIndex >= sol.steps.length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    setInput('');
    markInProgress();

    const next: Line[] = [...lines, { kind: 'cmd', text: cmd }];
    const { ok, output } = matchTerminalStep(sol, stepIndex, cmd);

    if (ok) {
      if (output) next.push({ kind: 'out', text: output });
      const newIndex = stepIndex + 1;
      next.push({ kind: 'out', text: `✓ Schritt ${stepIndex + 1} erledigt.` });
      setStepIndex(newIndex);
      if (newIndex >= sol.steps.length) {
        next.push({ kind: 'out', text: 'Alle Schritte abgeschlossen.' });
        apply({ solved: true, details: [] }, { selected: [], correct: true });
      }
    } else {
      next.push({
        kind: 'err',
        text: 'Befehl passt nicht zum aktuellen Schritt. Tipp: Hinweise unten beachten.',
      });
    }
    setLines(next);
  }

  const current = sol.steps[stepIndex];

  return (
    <div>
      {!done && current && (
        <div className="mb-3 rounded-lg bg-[color:var(--bg-soft)] p-3 text-sm">
          <strong>
            Schritt {stepIndex + 1}/{sol.steps.length}:
          </strong>{' '}
          {current.prompt}
        </div>
      )}

      <div
        className="overflow-x-auto rounded-lg bg-[#0a1626] p-4 font-mono text-[13px] leading-relaxed text-light"
        onClick={() => inputRef.current?.focus()}
        role="log"
        aria-label="Terminal-Ausgabe"
      >
        {lines.length === 0 && (
          <p className="text-light/50">Geben Sie den ersten Befehl ein …</p>
        )}
        {lines.map((l, i) => (
          <pre key={i} className={`whitespace-pre-wrap ${l.kind === 'err' ? 'text-orange' : l.kind === 'cmd' ? 'text-amber' : 'text-light'}`}>
            {l.kind === 'cmd' ? `ubuntu@workstation:~$ ${l.text}` : l.text}
          </pre>
        ))}

        {!done && (
          <form onSubmit={submit} className="mt-1 flex items-center gap-2">
            <span className="shrink-0 text-amber">ubuntu@workstation:~$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              aria-label="Befehl eingeben"
              className="flex-1 border-none bg-transparent font-mono text-light outline-none"
            />
          </form>
        )}
        {done && <p className="mt-1 text-green-400">$ Sitzung abgeschlossen ✓</p>}
      </div>

      <Hints
        hints={[...exercise.hints, ...sol.steps.map((s, i) => `Befehl Schritt ${i + 1}: ${s.hintCommand}`)]}
      />
    </div>
  );
}
