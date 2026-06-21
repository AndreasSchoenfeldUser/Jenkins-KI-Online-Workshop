import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';
import { exerciseById } from '../../content/exercises';
import { stationById } from '../../content/stations';
import { ExerciseRunner, exerciseTypeLabel } from './ExerciseRunner';
import { useExercise } from './useExercise';
import { ProgressBadge } from '../../components/ProgressBadge';

// Vollbild-Workspace pro Aufgabe: links Aufgabenstellung, rechts Interaktion.
export function ExercisePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const exercise = id ? exerciseById(id) : undefined;

  if (!exercise) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <p className="text-lg">Aufgabe nicht gefunden.</p>
        <Link to="/" className="mt-4 inline-block text-orange underline">
          Zur Übersicht
        </Link>
      </div>
    );
  }

  return <ExerciseWorkspace key={exercise.id} exerciseId={exercise.id} onClose={() => navigate(-1)} />;
}

function ExerciseWorkspace({ exerciseId, onClose }: { exerciseId: string; onClose: () => void }) {
  const exercise = exerciseById(exerciseId)!;
  const station = stationById(exercise.stationId);
  const { status, reset } = useExercise(exercise);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--text-muted)] hover:text-orange"
        >
          <ArrowLeft size={16} aria-hidden /> Zurück
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded border border-[color:var(--border)] px-3 py-1.5 text-sm hover:bg-[color:var(--bg-soft)]"
        >
          <RotateCcw size={15} aria-hidden /> Zurücksetzen
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        {/* Links: Aufgabenstellung */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange">
            {station?.kicker} · {exerciseTypeLabel(exercise.type)}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{exercise.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <ProgressBadge status={status} />
            <span className="inline-flex items-center gap-1 text-amber">
              <Star size={15} aria-hidden /> {exercise.xp} XP
            </span>
          </div>
          <p className="mt-4 text-[16px] leading-relaxed">{exercise.prompt}</p>
        </div>

        {/* Rechts: Interaktion */}
        <div className="surface rounded-lg p-4 shadow-soft md:p-6">
          <ExerciseRunner exercise={exercise} />
        </div>
      </div>
    </div>
  );
}
