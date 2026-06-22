import {
  BookOpen,
  Presentation,
  Trophy,
  Lightbulb,
  Network,
  Bot,
  FileCode2,
  MessageSquare,
  PlayCircle,
} from 'lucide-react';
import { STATIONS } from '../../content/stations';
import { useProgress } from '../../lib/progress';
import { Card } from '../../components/Card';
import { ProgressBadge } from '../../components/ProgressBadge';
import { Logo } from '../../components/Logo';

const ICONS = [Lightbulb, Network, Bot, FileCode2, MessageSquare, PlayCircle];

export function HomePage() {
  const { solvedCount, totalCount, earnedXpTotal, totalXp, quizScore, stationProgress } =
    useProgress();

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero */}
      <section className="overflow-hidden rounded-lg bg-navy shadow-soft-lg">
        <img
          src="./assets/hero-banner.png"
          alt="Jenkins-Infrastruktur mit Claude Code — vier vernetzte Knoten einer verteilten CI/CD-Pipeline."
          className="w-full"
        />
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-white/10 bg-navy-2 px-4 py-3 text-sm text-light">
          <span>Ein Workshop der</span>
          <Logo height={22} />
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card to="/handbook">
          <BookOpen className="text-orange" aria-hidden />
          <h2 className="mt-2 font-serif text-lg font-bold">Lehrbuch lesen</h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            Das vollständige Whitepaper in acht Kapiteln.
          </p>
        </Card>
        <Card to="/present">
          <Presentation className="text-orange" aria-hidden />
          <h2 className="mt-2 font-serif text-lg font-bold">Präsentation starten</h2>
          <p className="text-sm text-[color:var(--text-muted)]">16 Folien mit Sprechernotizen.</p>
        </Card>
        <Card to="/progress">
          <Trophy className="text-amber" aria-hidden />
          <h2 className="mt-2 font-serif text-lg font-bold">Fortschritt</h2>
          <p className="text-sm text-[color:var(--text-muted)]">
            {solvedCount}/{totalCount} Aufgaben · {earnedXpTotal}/{totalXp} XP · Quiz {quizScore.correct}/
            {quizScore.answered}
          </p>
        </Card>
      </section>

      {/* Roter Faden */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold">Der rote Faden</h2>
        <p className="mt-1 text-[color:var(--text-muted)]">
          Sechs Stationen führen vom Mindset bis zur fertigen Pipeline.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATIONS.map((s, i) => {
            const prog = stationProgress(s.id);
            const done = prog.total > 0 && prog.solved === prog.total;
            const Icon = ICONS[i] ?? Lightbulb;
            return (
              <Card key={s.id} to={`/station/${s.id}`} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-base font-bold text-white">
                    {s.id}
                  </span>
                  <Icon className="text-orange" aria-hidden />
                </div>
                <h3 className="mt-3 font-serif text-lg font-bold">{s.title}</h3>
                <p className="mt-1 flex-1 text-sm text-[color:var(--text-muted)]">{s.summary}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <ProgressBadge
                    status={done ? 'solved' : prog.solved > 0 ? 'in-progress' : 'not-started'}
                  />
                  <span className="text-[color:var(--text-muted)]">
                    {prog.solved}/{prog.total} Aufgaben
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
