import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { Logo } from './Logo';

// Standard-Layout mit Topbar + Sidebar. Setzt bei Routenwechsel den Fokus auf
// die Hauptregion (Fokus-Management fuer A11y).
export function Layout() {
  const loc = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  return (
    <div className="min-h-screen">
      <a href="#main" className="skip-link no-print">
        Zum Inhalt springen
      </a>
      <Topbar />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main id="main" ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 outline-none md:px-8">
          <Outlet />
        </main>
      </div>

      <footer className="no-print mt-8 border-t border-[color:var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-[color:var(--text-muted)] sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo height={24} />
            <span>Industrial DevOps</span>
          </div>
          <p>
            Workshop „Jenkins-Infrastruktur mit Claude Code“ · © Comquent GmbH
          </p>
        </div>
      </footer>
    </div>
  );
}
