import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Target } from 'lucide-react';
import { STATIONS, stationById } from '../../content/stations';
import { handbookById } from '../../content/handbook';
import { exerciseById } from '../../content/exercises';
import { RichText } from '../../components/RichText';
import { ExerciseCard } from '../exercises/ExerciseCard';

export function StationPage() {
  const { id } = useParams<{ id: string }>();
  const stationId = Number(id);
  const station = stationById(stationId);

  if (!station) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg">Station nicht gefunden.</p>
        <Link to="/" className="mt-4 inline-block text-orange underline">
          Zur Übersicht
        </Link>
      </div>
    );
  }

  const prev = STATIONS.find((s) => s.id === stationId - 1);
  const next = STATIONS.find((s) => s.id === stationId + 1);
  const sections = station.sectionIds.map(handbookById).filter(Boolean);
  const exercises = station.exerciseIds.map(exerciseById).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Brotkrumen" className="text-sm text-[color:var(--text-muted)]">
        <Link to="/" className="hover:text-orange">
          Roter Faden
        </Link>{' '}
        / {station.title}
      </nav>

      <header className="mt-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange">{station.kicker}</p>
        <h1 className="mt-1 font-serif text-3xl font-bold">{station.title}</h1>
        <p className="mt-2 text-lg text-[color:var(--text-muted)]">{station.summary}</p>
      </header>

      <section className="mt-6 rounded-lg bg-[color:var(--bg-soft)] p-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <Target size={18} className="text-orange" aria-hidden /> Lernziele
        </h2>
        <ul className="mt-2 ml-6 list-disc space-y-1 text-[15px]">
          {station.learningGoals.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </section>

      {/* Lehrtext */}
      <article className="mt-8">
        {sections.map((sec) => (
          <section key={sec!.id} id={sec!.id}>
            <h2 className="font-serif text-2xl font-bold">{sec!.heading}</h2>
            <RichText blocks={sec!.body} />
          </section>
        ))}
      </article>

      {/* Eingebettete Uebungen */}
      {exercises.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">Übungen dieser Station</h2>
          <p className="mt-1 text-[color:var(--text-muted)]">
            Aufklappen zum Bearbeiten oder im Vollbild öffnen.
          </p>
          <div className="mt-4 space-y-3">
            {exercises.map((ex) => (
              <ExerciseCard key={ex!.id} exercise={ex!} />
            ))}
          </div>
        </section>
      )}

      {/* Weiter-Navigation */}
      <nav className="mt-12 flex items-center justify-between border-t border-[color:var(--border)] pt-6">
        {prev ? (
          <Link
            to={`/station/${prev.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-orange"
          >
            <ArrowLeft size={16} aria-hidden /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/station/${next.id}`}
            className="inline-flex items-center gap-2 rounded bg-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange/90"
          >
            Weiter: {next.title} <ArrowRight size={16} aria-hidden />
          </Link>
        ) : (
          <Link
            to="/progress"
            className="inline-flex items-center gap-2 rounded bg-orange px-4 py-2 text-sm font-medium text-white hover:bg-orange/90"
          >
            Fortschritt ansehen <ArrowRight size={16} aria-hidden />
          </Link>
        )}
      </nav>
    </div>
  );
}
