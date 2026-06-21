import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Presentation,
  Moon,
  Sun,
  Trophy,
  LogOut,
  Users,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useProgress } from '../lib/progress';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../lib/auth';
import { Logo } from './Logo';

const MODES = [
  { to: '/handbook', label: 'Lehrbuch', icon: BookOpen },
  { to: '/', label: 'Stationen', icon: GraduationCap, exact: true },
  { to: '/present', label: 'Präsentation', icon: Presentation },
];

export function Topbar() {
  const { solvedCount, totalCount, earnedXpTotal } = useProgress();
  const { theme, toggle } = useTheme();
  const { currentUser, isAdmin, logout, registrations } = useAuth();
  const pending = registrations.length;
  const loc = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Bei Routenwechsel das Menue schliessen.
  useEffect(() => setMenuOpen(false), [loc.pathname]);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-3" aria-label="Startseite — Comquent Jenkins-Workshop">
          <Logo height={26} />
          <span className="hidden items-center gap-3 md:flex">
            <span className="h-6 w-px bg-[color:var(--border)]" aria-hidden />
            <span className="font-serif text-base font-bold text-[color:var(--text)]">
              Jenkins-Workshop
            </span>
          </span>
        </Link>

        <nav aria-label="Modus" className="ml-2 flex items-center gap-1">
          {MODES.map((m) => {
            const active =
              m.exact
                ? loc.pathname === '/' || loc.pathname.startsWith('/station')
                : loc.pathname.startsWith(m.to);
            const Icon = m.icon;
            return (
              <Link
                key={m.to}
                to={m.to}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-navy text-white'
                    : 'text-[color:var(--text)] hover:bg-[color:var(--bg-soft)]'
                }`}
              >
                <Icon size={16} aria-hidden />
                <span className="hidden md:inline">{m.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <NavLink
            to="/progress"
            className="inline-flex items-center gap-1.5 rounded bg-[color:var(--bg-soft)] px-2.5 py-1 text-sm font-medium text-[color:var(--text)]"
            title="Fortschritt"
          >
            <Trophy size={15} className="text-amber" aria-hidden />
            <span>
              {solvedCount}/{totalCount}
            </span>
            <span className="hidden text-[color:var(--text-muted)] sm:inline">· {earnedXpTotal} XP</span>
          </NavLink>

          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Helles Design' : 'Dunkles Design'}
            className="rounded p-1.5 text-[color:var(--text)] hover:bg-[color:var(--bg-soft)]"
          >
            {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          </button>

          {currentUser && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium text-[color:var(--text)] hover:bg-[color:var(--bg-soft)]"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold uppercase text-white"
                  aria-hidden
                >
                  {currentUser.displayName.slice(0, 2)}
                </span>
                <span className="hidden max-w-[10rem] truncate sm:inline">
                  {currentUser.displayName}
                </span>
                {isAdmin && pending > 0 && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-white"
                    aria-label={`${pending} offene Registrierungsanfragen`}
                  >
                    {pending}
                  </span>
                )}
                <ChevronDown size={15} aria-hidden />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] py-1 shadow-soft-lg"
                >
                  <div className="border-b border-[color:var(--border)] px-3 py-2">
                    <p className="truncate text-sm font-semibold">{currentUser.displayName}</p>
                    <p className="flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                      {isAdmin ? (
                        <>
                          <ShieldCheck size={12} aria-hidden /> Administrator
                        </>
                      ) : (
                        'Teilnehmer'
                      )}{' '}
                      · @{currentUser.username}
                    </p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin/users"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[color:var(--bg-soft)]"
                    >
                      <Users size={16} aria-hidden /> Administration
                      {pending > 0 && (
                        <span className="ml-auto rounded-full bg-orange px-1.5 text-xs font-bold text-white">
                          {pending}
                        </span>
                      )}
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-orange hover:bg-orange/10"
                  >
                    <LogOut size={16} aria-hidden /> Abmelden
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
