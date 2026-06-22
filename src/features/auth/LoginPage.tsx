import { useState } from 'react';
import {
  LogIn,
  Lock,
  User as UserIcon,
  Info,
  GraduationCap,
  Network,
  FileCode2,
  Mail,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, AUTH_ERROR_TEXT, DEFAULT_ADMIN_HINT } from '../../lib/auth';
import { useTheme } from '../../theme/ThemeContext';
import { STATIONS } from '../../content/stations';
import { HOSTS, STAGES } from '../../content/domain';
import { Logo } from '../../components/Logo';

// Landing- und Login-Seite fuer nicht angemeldete Nutzer: zeigt eine Uebersicht
// ueber den Workshop und das Anmeldeformular.
export function LoginPage() {
  const { login, register, ready, defaultAdmin } = useAuth();
  const { theme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setError(null);
    setRegistered(false);
    setPassword('');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    if (mode === 'login') {
      const res = await login(username, password);
      setBusy(false);
      if (!res.ok && res.error) setError(AUTH_ERROR_TEXT[res.error]);
    } else {
      const res = await register({ username, email, password, displayName });
      setBusy(false);
      if (res.ok) {
        setRegistered(true);
        setUsername('');
        setEmail('');
        setDisplayName('');
        setPassword('');
      } else if (res.error) {
        setError(AUTH_ERROR_TEXT[res.error]);
      }
    }
  }

  // Hinweis auf Standard-Admin nur, solange ausschliesslich dieser existiert.
  const showAdminHint = ready && defaultAdmin;

  return (
    <div className="min-h-screen bg-[color:var(--bg)]" data-theme={theme}>
      {/* Kopf */}
      <header className="border-b border-[color:var(--border)] bg-[color:var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo height={28} />
          <span className="text-sm text-[color:var(--text-muted)]">Industrial DevOps</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Uebersicht */}
          <section>
            <div className="overflow-hidden rounded-lg shadow-soft-lg">
              <img
                src="./assets/hero-banner.webp"
                alt="Jenkins-Infrastruktur mit Claude Code — vier vernetzte Knoten einer verteilten CI/CD-Pipeline."
                className="w-full"
              />
            </div>

            <h1 className="mt-6 font-serif text-3xl font-bold">
              Workshop: Jenkins-Infrastruktur mit Claude Code
            </h1>
            <p className="mt-2 text-[17px] leading-relaxed text-[color:var(--text-muted)]">
              Ein ganztägiger DevOps-Workshop. Sie bauen eine verteilte Jenkins-CI/CD-Umgebung über
              vier Hosts auf — nicht durch Abtippen, sondern durch <strong>Spezifizieren</strong>:
              Claude Code generiert die Artefakte, Sie prüfen und verantworten das Ergebnis.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Fact icon={<Network className="text-orange" aria-hidden />} value={`${HOSTS.length} Hosts`} label="verteilte Topologie" />
              <Fact icon={<FileCode2 className="text-orange" aria-hidden />} value={`${STAGES.length} Stages`} label="Pipeline as Code" />
              <Fact icon={<GraduationCap className="text-orange" aria-hidden />} value={`${STATIONS.length} Stationen`} label="roter Faden" />
            </div>

            <h2 className="mt-7 font-serif text-xl font-bold">Der rote Faden</h2>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {STATIONS.map((s) => (
                <li
                  key={s.id}
                  className="flex gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                    {s.id}
                  </span>
                  <span>
                    <span className="block font-semibold">{s.title}</span>
                    <span className="text-sm text-[color:var(--text-muted)]">{s.summary}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Login / Registrierung */}
          <section className="lg:sticky lg:top-8 lg:self-start">
            <div className="surface rounded-lg p-6 shadow-soft">
              {/* Umschalter */}
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-[color:var(--bg-soft)] p-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => switchMode('login')}
                  className={`flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition ${
                    mode === 'login' ? 'bg-[color:var(--surface)] text-orange shadow-soft' : 'text-[color:var(--text-muted)]'
                  }`}
                >
                  <LogIn size={15} aria-hidden /> Anmelden
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  onClick={() => switchMode('register')}
                  className={`flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition ${
                    mode === 'register' ? 'bg-[color:var(--surface)] text-orange shadow-soft' : 'text-[color:var(--text-muted)]'
                  }`}
                >
                  <UserPlus size={15} aria-hidden /> Registrieren
                </button>
              </div>

              <h2 className="font-serif text-2xl font-bold">
                {mode === 'login' ? 'Anmeldung' : 'Registrierung'}
              </h2>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                {mode === 'login'
                  ? 'Bitte melden Sie sich an, um den Workshop zu starten.'
                  : 'Konto anfragen — ein Administrator gibt es anschließend frei.'}
              </p>

              {registered ? (
                <div className="mt-5 flex gap-2 rounded-lg border border-green-600 bg-green-50 p-3 text-sm text-green-900">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
                  <span>
                    Ihre Registrierung wurde übermittelt. Sobald ein Administrator sie freigibt,
                    können Sie sich anmelden.
                  </span>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="login-username" className="mb-1 block text-sm font-medium">
                      Benutzername
                    </label>
                    <div className="relative">
                      <UserIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" aria-hidden />
                      <input
                        id="login-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                        className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] py-2 pl-9 pr-3 focus:border-orange"
                      />
                    </div>
                  </div>

                  {mode === 'register' && (
                    <>
                      <div>
                        <label htmlFor="reg-email" className="mb-1 block text-sm font-medium">
                          E-Mail-Adresse
                        </label>
                        <div className="relative">
                          <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" aria-hidden />
                          <input
                            id="reg-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] py-2 pl-9 pr-3 focus:border-orange"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="reg-displayname" className="mb-1 block text-sm font-medium">
                          Anzeigename (optional)
                        </label>
                        <input
                          id="reg-displayname"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          autoComplete="name"
                          className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 focus:border-orange"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="login-password" className="mb-1 block text-sm font-medium">
                      Passwort
                    </label>
                    <div className="relative">
                      <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" aria-hidden />
                      <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        required
                        className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--bg)] py-2 pl-9 pr-3 focus:border-orange"
                      />
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="rounded border-l-4 border-orange bg-orange/10 px-3 py-2 text-sm text-ink">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy || !ready}
                    className="inline-flex w-full items-center justify-center gap-2 rounded bg-orange px-4 py-2.5 font-medium text-white transition hover:bg-orange/90 disabled:opacity-50"
                  >
                    {mode === 'login' ? (
                      <>
                        <LogIn size={16} aria-hidden /> {busy ? 'Anmelden …' : 'Anmelden'}
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} aria-hidden /> {busy ? 'Senden …' : 'Registrierung anfragen'}
                      </>
                    )}
                  </button>
                </form>
              )}

              {mode === 'login' && showAdminHint && (
                <div className="mt-5 flex gap-2 rounded-lg bg-amber/10 p-3 text-sm">
                  <Info size={16} className="mt-0.5 shrink-0 text-amber" aria-hidden />
                  <span>
                    Erstanmeldung als Administrator: Benutzer <strong>{DEFAULT_ADMIN_HINT.username}</strong>,
                    Passwort <strong>{DEFAULT_ADMIN_HINT.password}</strong>. Bitte das Passwort nach der
                    Anmeldung unter „Benutzer verwalten“ ändern.
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-[color:var(--border)]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-6 text-sm text-[color:var(--text-muted)]">
          <Logo height={22} />
          <span>· © Comquent GmbH — Industrial DevOps</span>
        </div>
      </footer>
    </div>
  );
}

function Fact({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="surface flex items-center gap-3 rounded-lg p-3 shadow-soft">
      {icon}
      <div>
        <p className="text-lg font-bold leading-tight">{value}</p>
        <p className="text-xs text-[color:var(--text-muted)]">{label}</p>
      </div>
    </div>
  );
}
