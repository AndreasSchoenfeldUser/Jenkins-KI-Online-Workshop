import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './features/home/HomePage';
import { LoginPage } from './features/auth/LoginPage';
import { ProgressProvider } from './lib/progress';
import { ProgressReporter } from './lib/ProgressReporter';
import { useAuth } from './lib/auth';

// Code-Splitting pro Route. Monaco/Editor-lastige sowie selten genutzte
// Bereiche werden erst bei Bedarf geladen (CLAUDE.md: schlankes Initial-Bundle).
const StationPage = lazy(() =>
  import('./features/stations/StationPage').then((m) => ({ default: m.StationPage })),
);
const HandbookPage = lazy(() =>
  import('./features/handbook/HandbookPage').then((m) => ({ default: m.HandbookPage })),
);
const PresentPage = lazy(() =>
  import('./features/present/PresentPage').then((m) => ({ default: m.PresentPage })),
);
const ExercisePage = lazy(() =>
  import('./features/exercises/ExercisePage').then((m) => ({ default: m.ExercisePage })),
);
const GlossaryPage = lazy(() =>
  import('./features/glossary/GlossaryPage').then((m) => ({ default: m.GlossaryPage })),
);
const ProgressPage = lazy(() =>
  import('./features/progress/ProgressPage').then((m) => ({ default: m.ProgressPage })),
);
const UserAdminPage = lazy(() =>
  import('./features/admin/UserAdminPage').then((m) => ({ default: m.UserAdminPage })),
);

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-[color:var(--text-muted)]" role="status">
      Lädt …
    </div>
  );
}

export default function App() {
  const { ready, currentUser } = useAuth();

  // Bis die Benutzerdaten (inkl. Erstanlage des Admins) geladen sind, warten.
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[color:var(--text-muted)]" role="status">
        Lädt …
      </div>
    );
  }

  // Nicht angemeldet: Landing-/Login-Seite mit Workshop-Übersicht.
  if (!currentUser) return <LoginPage />;

  // Angemeldet: Fortschritt pro Benutzer; key erzwingt frischen State bei Wechsel.
  return (
    <ProgressProvider key={currentUser.id} userId={currentUser.id}>
      <ProgressReporter />
      <HashRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Alle Seiten im Standard-Layout (mit Hauptmenue/Topbar) — auch die
                Praesentation, damit man sie jederzeit verlassen kann. Echtes Vollbild
                liefert die Fullscreen-API innerhalb der Praesentation. */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/station/:id" element={<StationPage />} />
              <Route path="/exercise/:id" element={<ExercisePage />} />
              <Route path="/handbook" element={<HandbookPage />} />
              <Route path="/handbook/:sectionId" element={<HandbookPage />} />
              <Route path="/present" element={<PresentPage />} />
              <Route path="/present/:slideIndex" element={<PresentPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/admin/users" element={<UserAdminPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ProgressProvider>
  );
}
