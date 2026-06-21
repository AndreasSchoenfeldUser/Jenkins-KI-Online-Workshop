import { NavLink } from 'react-router-dom';
import { BookText, ListChecks, Trophy, Users } from 'lucide-react';
import { STATIONS } from '../content/stations';
import { useProgress } from '../lib/progress';
import { useAuth } from '../lib/auth';
import { ProgressBadge } from './ProgressBadge';

// Desktop-Sidebar: Stationen mit Erledigt-Status, plus Sekundaer-Links.
export function Sidebar() {
  const { stationProgress } = useProgress();
  const { isAdmin, registrations } = useAuth();
  const pending = registrations.length;

  return (
    <aside className="no-print hidden w-60 shrink-0 border-r border-[color:var(--border)] lg:block">
      <nav aria-label="Stationen" className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
          Stationen
        </p>
        <ul className="mt-2 space-y-0.5">
          {STATIONS.map((s) => {
            const prog = stationProgress(s.id);
            const done = prog.total > 0 && prog.solved === prog.total;
            return (
              <li key={s.id}>
                <NavLink
                  to={`/station/${s.id}`}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-2 rounded px-2 py-2 text-sm transition ${
                      isActive
                        ? 'bg-navy text-white'
                        : 'text-[color:var(--text)] hover:bg-[color:var(--bg-soft)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                            isActive ? 'bg-orange text-white' : 'bg-[color:var(--bg-soft)] text-[color:var(--text)]'
                          }`}
                        >
                          {s.id}
                        </span>
                        {s.title}
                      </span>
                      <ProgressBadge
                        status={done ? 'solved' : prog.solved > 0 ? 'in-progress' : 'not-started'}
                        showLabel={false}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 px-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
          Mehr
        </p>
        <ul className="mt-2 space-y-0.5">
          {[
            { to: '/handbook', label: 'Lehrbuch', icon: BookText },
            { to: '/glossary', label: 'Glossar', icon: ListChecks },
            { to: '/progress', label: 'Fortschritt', icon: Trophy },
            ...(isAdmin ? [{ to: '/admin/users', label: 'Administration', icon: Users }] : []),
          ].map((l) => {
            const Icon = l.icon;
            return (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded px-2 py-2 text-sm transition ${
                      isActive ? 'bg-navy text-white' : 'text-[color:var(--text)] hover:bg-[color:var(--bg-soft)]'
                    }`
                  }
                >
                  <Icon size={16} aria-hidden />
                  {l.label}
                  {l.to === '/admin/users' && pending > 0 && (
                    <span className="ml-auto rounded-full bg-orange px-1.5 text-xs font-bold text-white">
                      {pending}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
