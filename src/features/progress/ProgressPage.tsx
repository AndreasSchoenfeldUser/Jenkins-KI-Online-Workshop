import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Star, CheckCircle2 } from 'lucide-react';
import { STATIONS } from '../../content/stations';
import { EXERCISES } from '../../content/exercises';
import { useProgress } from '../../lib/progress';
import { ProgressBadge } from '../../components/ProgressBadge';
import { exerciseTypeLabel } from '../exercises/ExerciseRunner';

export function ProgressPage() {
  const { solvedCount, totalCount, earnedXpTotal, totalXp, quizScore, statusOf, dispatch } =
    useProgress();
  const [confirm, setConfirm] = useState(false);

  const pct = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-3xl font-bold">Fortschritt</h1>

      {/* Kennzahlen */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Aufgaben gelöst" value={`${solvedCount}/${totalCount}`} icon={<CheckCircle2 className="text-green-600" aria-hidden />} />
        <Stat label="Gesammelte XP" value={`${earnedXpTotal}/${totalXp}`} icon={<Star className="text-amber" aria-hidden />} />
        <Stat label="Quiz-Score" value={`${quizScore.correct}/${quizScore.answered || 0}`} icon={<CheckCircle2 className="text-navy-2" aria-hidden />} />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-sm text-[color:var(--text-muted)]">
          <span>Gesamtfortschritt</span>
          <span>{pct} %</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[color:var(--bg-soft)]">
          <div className="h-full bg-orange transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Stationen & Aufgaben */}
      {STATIONS.map((station) => {
        const list = EXERCISES.filter((e) => e.stationId === station.id);
        return (
          <section key={station.id} className="mt-8">
            <h2 className="font-serif text-xl font-bold">
              {station.kicker}
            </h2>
            <ul className="mt-2 divide-y divide-[color:var(--border)] overflow-hidden rounded-lg border border-[color:var(--border)]">
              {list.map((ex) => (
                <li key={ex.id} className="flex items-center justify-between gap-3 bg-[color:var(--surface)] p-3">
                  <Link to={`/exercise/${ex.id}`} className="min-w-0 flex-1 hover:text-orange">
                    <span className="block truncate font-medium">{ex.title}</span>
                    <span className="text-sm text-[color:var(--text-muted)]">
                      {exerciseTypeLabel(ex.type)} · {ex.xp} XP
                    </span>
                  </Link>
                  <ProgressBadge status={statusOf(ex.id)} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {/* Globaler Reset */}
      <section className="mt-10 rounded-lg border border-orange/40 bg-orange/5 p-4">
        <h2 className="font-semibold">Fortschritt zurücksetzen</h2>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          Löscht alle gelösten Aufgaben, Antworten und XP. Dies kann nicht rückgängig gemacht werden.
        </p>
        {confirm ? (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'RESET_ALL' });
                setConfirm(false);
              }}
              className="inline-flex items-center gap-1.5 rounded bg-orange px-4 py-2 text-sm font-medium text-white"
            >
              <RotateCcw size={15} aria-hidden /> Wirklich zurücksetzen
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="rounded border border-[color:var(--border)] px-4 py-2 text-sm"
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded border border-orange px-4 py-2 text-sm font-medium text-orange hover:bg-orange/10"
          >
            <RotateCcw size={15} aria-hidden /> Zurücksetzen
          </button>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="surface flex items-center gap-3 rounded-lg p-4 shadow-soft">
      {icon}
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
      </div>
    </div>
  );
}
