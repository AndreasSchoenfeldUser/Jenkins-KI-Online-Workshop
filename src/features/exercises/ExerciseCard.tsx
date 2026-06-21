import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Maximize2, Star } from 'lucide-react';
import type { Exercise } from '../../types';
import { useExercise } from './useExercise';
import { ExerciseRunner, exerciseTypeLabel } from './ExerciseRunner';
import { ProgressBadge } from '../../components/ProgressBadge';

// Aufklappbare Uebungskarte fuer die Einbettung in Stationsseiten.
export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);
  const { status } = useExercise(exercise);

  return (
    <div className="surface overflow-hidden rounded-lg shadow-soft">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {open ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
          <span className="min-w-0">
            <span className="block truncate font-semibold">{exercise.title}</span>
            <span className="text-sm text-[color:var(--text-muted)]">
              {exerciseTypeLabel(exercise.type)}
            </span>
          </span>
        </button>
        <span className="hidden items-center gap-1 text-sm text-amber sm:inline-flex">
          <Star size={14} aria-hidden /> {exercise.xp}
        </span>
        <ProgressBadge status={status} showLabel={false} />
        <Link
          to={`/exercise/${exercise.id}`}
          className="rounded p-1.5 text-[color:var(--text-muted)] hover:bg-[color:var(--bg-soft)] hover:text-orange"
          aria-label="Im Vollbild öffnen"
          title="Im Vollbild öffnen"
        >
          <Maximize2 size={16} aria-hidden />
        </Link>
      </div>
      {open && (
        <div className="border-t border-[color:var(--border)] p-4">
          <p className="mb-4 text-[15px] leading-relaxed">{exercise.prompt}</p>
          <ExerciseRunner exercise={exercise} />
        </div>
      )}
    </div>
  );
}
