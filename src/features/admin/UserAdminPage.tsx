import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  UserPlus,
  Trash2,
  Pencil,
  ShieldCheck,
  User as UserIcon,
  X,
  Check,
  Mail,
  Inbox,
  Activity,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useAuth, AUTH_ERROR_TEXT, type Role, type User } from '../../lib/auth';

// ----------------------------------------------------------------------------
// Typen fuer den Fortschrittsbericht (GET /api/progress, nur Admin).
// ----------------------------------------------------------------------------
type ProgressLogEntry = {
  at: number;
  type: string;
  exerciseId: string;
  title: string;
  stationId: number;
  xp: number;
};
type ProgressRecord = {
  summary: {
    solvedCount: number;
    totalCount: number;
    earnedXp: number;
    totalXp: number;
    quizCorrect: number;
    quizAnswered: number;
    stations: { id: number; title: string; solved: number; total: number }[];
  };
  log: ProgressLogEntry[];
  updatedAt: number;
  startedAt: number;
};
type Participant = { user: User; progress: ProgressRecord | null };

function fmt(ts: number): string {
  try {
    return new Date(ts).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '—';
  }
}

export function UserAdminPage() {
  const {
    isAdmin,
    users,
    currentUser,
    registrations,
    createUser,
    updateUser,
    deleteUser,
    approveRegistration,
    rejectRegistration,
  } = useAuth();

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="flex items-center gap-2 font-serif text-3xl font-bold">
        <ShieldCheck className="text-orange" aria-hidden /> Administration
      </h1>
      <p className="mt-1 text-[color:var(--text-muted)]">
        Registrierungsanfragen freigeben, Benutzer verwalten und den Fortschritt der Teilnehmer
        verfolgen.
      </p>

      {/* Registrierungsanfragen */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
          <Inbox className="text-orange" aria-hidden /> Registrierungsanfragen
          {registrations.length > 0 && (
            <span className="rounded-full bg-orange px-2 py-0.5 text-xs font-bold text-white">
              {registrations.length}
            </span>
          )}
        </h2>
        {registrations.length === 0 ? (
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Keine offenen Anfragen.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {registrations.map((r) => (
              <li
                key={r.id}
                className="surface flex flex-wrap items-center justify-between gap-3 rounded-lg p-4 shadow-soft"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {r.displayName} <span className="text-[color:var(--text-muted)]">@{r.username}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-[color:var(--text-muted)]">
                    <Mail size={14} aria-hidden /> {r.email} · angefragt {fmt(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => approveRegistration(r.id)}
                    className="inline-flex items-center gap-1.5 rounded bg-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-orange/90"
                  >
                    <Check size={15} aria-hidden /> Freigeben
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectRegistration(r.id)}
                    className="inline-flex items-center gap-1.5 rounded border border-[color:var(--border)] px-3 py-1.5 text-sm hover:bg-[color:var(--bg-soft)]"
                  >
                    <X size={15} aria-hidden /> Ablehnen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CreateUserForm onCreate={createUser} />

      {/* Benutzerliste */}
      <h2 className="mt-10 font-serif text-xl font-bold">Benutzer ({users.length})</h2>
      <ul className="mt-3 space-y-2">
        {users.map((u) => (
          <UserRow
            key={u.id}
            user={u}
            isSelf={u.id === currentUser?.id}
            onUpdate={updateUser}
            onDelete={deleteUser}
          />
        ))}
      </ul>

      {/* Fortschritt der Teilnehmer */}
      <ParticipantProgress />
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return role === 'admin' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2 py-0.5 text-xs font-medium text-white">
      <ShieldCheck size={12} aria-hidden /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--bg-soft)] px-2 py-0.5 text-xs font-medium text-[color:var(--text)]">
      <UserIcon size={12} aria-hidden /> Teilnehmer
    </span>
  );
}

function CreateUserForm({
  onCreate,
}: {
  onCreate: (input: {
    username: string;
    password: string;
    role: Role;
    displayName?: string;
    email?: string;
  }) => Promise<{ ok: boolean; error?: keyof typeof AUTH_ERROR_TEXT }>;
}) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await onCreate({ username, password, role, displayName, email });
    setBusy(false);
    if (res.ok) {
      setMsg({ kind: 'ok', text: `Benutzer „${username}“ wurde angelegt.` });
      setUsername('');
      setDisplayName('');
      setEmail('');
      setPassword('');
      setRole('user');
    } else if (res.error) {
      setMsg({ kind: 'err', text: AUTH_ERROR_TEXT[res.error] });
    }
  }

  return (
    <form onSubmit={submit} className="surface mt-8 rounded-lg p-4 shadow-soft">
      <h2 className="flex items-center gap-2 font-semibold">
        <UserPlus size={18} className="text-orange" aria-hidden /> Neuen Benutzer anlegen
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Benutzername" id="new-username">
          <input
            id="new-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            required
            className="w-full rounded border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 focus:border-orange"
          />
        </Field>
        <Field label="E-Mail (optional)" id="new-email">
          <input
            id="new-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            className="w-full rounded border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 focus:border-orange"
          />
        </Field>
        <Field label="Anzeigename (optional)" id="new-displayname">
          <input
            id="new-displayname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="off"
            className="w-full rounded border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 focus:border-orange"
          />
        </Field>
        <Field label="Passwort" id="new-password">
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full rounded border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 focus:border-orange"
          />
        </Field>
        <Field label="Rolle" id="new-role">
          <select
            id="new-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 focus:border-orange"
          >
            <option value="user">Teilnehmer</option>
            <option value="admin">Administrator</option>
          </select>
        </Field>
      </div>
      {msg && (
        <p
          role="status"
          className={`mt-3 rounded px-3 py-2 text-sm ${
            msg.kind === 'ok' ? 'bg-green-50 text-green-800' : 'border-l-4 border-orange bg-orange/10 text-ink'
          }`}
        >
          {msg.text}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="mt-4 inline-flex items-center gap-2 rounded bg-orange px-4 py-2 font-medium text-white transition hover:bg-orange/90 disabled:opacity-50"
      >
        <UserPlus size={16} aria-hidden /> Anlegen
      </button>
    </form>
  );
}

function UserRow({
  user,
  isSelf,
  onUpdate,
  onDelete,
}: {
  user: User;
  isSelf: boolean;
  onUpdate: (
    id: string,
    changes: { displayName?: string; role?: Role; password?: string },
  ) => Promise<{ ok: boolean; error?: keyof typeof AUTH_ERROR_TEXT }>;
  onDelete: (id: string) => Promise<{ ok: boolean; error?: keyof typeof AUTH_ERROR_TEXT }>;
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [role, setRole] = useState<Role>(user.role);
  const [password, setPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    const res = await onUpdate(user.id, { displayName, role, password: password || undefined });
    if (res.ok) {
      setEditing(false);
      setPassword('');
    } else if (res.error) {
      setErr(AUTH_ERROR_TEXT[res.error]);
    }
  }

  async function remove() {
    const res = await onDelete(user.id);
    if (!res.ok && res.error) setErr(AUTH_ERROR_TEXT[res.error]);
    setConfirmDelete(false);
  }

  return (
    <li className="surface rounded-lg p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold">
            {user.displayName}
            {isSelf && <span className="text-xs text-[color:var(--text-muted)]">(Sie)</span>}
          </p>
          <p className="text-sm text-[color:var(--text-muted)]">
            @{user.username}
            {user.email ? (
              <>
                {' '}
                · <Mail size={12} className="inline" aria-hidden /> {user.email}
              </>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role} />
          {!editing && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setErr(null);
                }}
                aria-label={`${user.username} bearbeiten`}
                className="rounded p-1.5 hover:bg-[color:var(--bg-soft)]"
              >
                <Pencil size={16} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={isSelf}
                aria-label={`${user.username} löschen`}
                title={isSelf ? 'Eigenes Konto kann nicht gelöscht werden' : 'Löschen'}
                className="rounded p-1.5 text-orange hover:bg-orange/10 disabled:opacity-30"
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-3 grid gap-3 border-t border-[color:var(--border)] pt-3 sm:grid-cols-3">
          <Field label="Anzeigename" id={`dn-${user.id}`}>
            <input
              id={`dn-${user.id}`}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 focus:border-orange"
            />
          </Field>
          <Field label="Rolle" id={`role-${user.id}`}>
            <select
              id={`role-${user.id}`}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 focus:border-orange"
            >
              <option value="user">Teilnehmer</option>
              <option value="admin">Administrator</option>
            </select>
          </Field>
          <Field label="Neues Passwort (optional)" id={`pw-${user.id}`}>
            <input
              id={`pw-${user.id}`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="leer lassen = unverändert"
              className="w-full rounded border border-[color:var(--border)] bg-[color:var(--bg)] px-3 py-2 focus:border-orange"
            />
          </Field>
          <div className="flex items-center gap-2 sm:col-span-3">
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-1.5 rounded bg-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-orange/90"
            >
              <Check size={15} aria-hidden /> Speichern
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDisplayName(user.displayName);
                setRole(user.role);
                setPassword('');
                setErr(null);
              }}
              className="inline-flex items-center gap-1.5 rounded border border-[color:var(--border)] px-3 py-1.5 text-sm hover:bg-[color:var(--bg-soft)]"
            >
              <X size={15} aria-hidden /> Abbrechen
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded border-l-4 border-orange bg-orange/10 p-3 text-sm">
          <span>Benutzer „{user.username}“ wirklich löschen?</span>
          <button type="button" onClick={remove} className="rounded bg-orange px-3 py-1 font-medium text-white">
            Löschen
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded border border-[color:var(--border)] px-3 py-1"
          >
            Abbrechen
          </button>
        </div>
      )}

      {err && (
        <p role="alert" className="mt-2 text-sm text-orange">
          {err}
        </p>
      )}
    </li>
  );
}

// ----------------------------------------------------------------------------
// Fortschritt der Teilnehmer (Live vom Backend).
// ----------------------------------------------------------------------------
function ParticipantProgress() {
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [error, setError] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/progress', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants ?? []);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    load();
    const t = window.setInterval(load, 15000); // periodisch aktualisieren
    return () => window.clearInterval(t);
  }, []);

  // Nur Teilnehmer (keine Admins) anzeigen.
  const list = (participants ?? []).filter((p) => p.user.role === 'user');

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
          <Activity className="text-orange" aria-hidden /> Fortschritt der Teilnehmer
        </h2>
        <button
          type="button"
          onClick={load}
          className="rounded border border-[color:var(--border)] px-3 py-1.5 text-sm hover:bg-[color:var(--bg-soft)]"
        >
          Aktualisieren
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-orange">Fortschritt konnte nicht geladen werden.</p>}
      {!error && list.length === 0 && (
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          Noch keine Teilnehmer mit Aktivität.
        </p>
      )}

      <ul className="mt-3 space-y-2">
        {list.map((p) => (
          <ParticipantRow key={p.user.id} participant={p} />
        ))}
      </ul>
    </section>
  );
}

function ParticipantRow({ participant }: { participant: Participant }) {
  const [open, setOpen] = useState(false);
  const { user, progress } = participant;
  const s = progress?.summary;
  const pct = s && s.totalCount ? Math.round((s.solvedCount / s.totalCount) * 100) : 0;

  return (
    <li className="surface rounded-lg p-4 shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        {open ? <ChevronDown size={18} aria-hidden /> : <ChevronRight size={18} aria-hidden />}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">
            {user.displayName} <span className="font-normal text-[color:var(--text-muted)]">@{user.username}</span>
          </span>
          <span className="text-sm text-[color:var(--text-muted)]">
            {progress ? (
              <>
                {s!.solvedCount}/{s!.totalCount} Aufgaben · {s!.earnedXp}/{s!.totalXp} XP · Quiz{' '}
                {s!.quizCorrect}/{s!.quizAnswered} · zuletzt {fmt(progress.updatedAt)}
              </>
            ) : (
              'Noch keine Aktivität'
            )}
          </span>
        </span>
        <span className="w-28 shrink-0">
          <span className="mb-1 block text-right text-xs font-medium tabular-nums">{pct} %</span>
          <span className="block h-2 w-full overflow-hidden rounded-full bg-[color:var(--bg-soft)]">
            <span className="block h-full bg-orange" style={{ width: `${pct}%` }} />
          </span>
        </span>
      </button>

      {open && progress && (
        <div className="mt-4 border-t border-[color:var(--border)] pt-4">
          {/* Stationsbalken */}
          <div className="grid gap-2 sm:grid-cols-2">
            {s!.stations.map((st) => {
              const p = st.total ? Math.round((st.solved / st.total) * 100) : 0;
              return (
                <div key={st.id} className="text-sm">
                  <div className="flex justify-between">
                    <span>
                      {st.id}. {st.title}
                    </span>
                    <span className="tabular-nums text-[color:var(--text-muted)]">
                      {st.solved}/{st.total}
                    </span>
                  </div>
                  <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--bg-soft)]">
                    <span className="block h-full bg-amber" style={{ width: `${p}%` }} />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Ereignis-Log */}
          <h3 className="mt-4 flex items-center gap-1.5 text-sm font-semibold">
            <Clock size={14} aria-hidden /> Verlauf
          </h3>
          {progress.log.length === 0 ? (
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">Noch keine Ereignisse.</p>
          ) : (
            <ol className="mt-2 space-y-1 text-sm">
              {progress.log
                .slice()
                .reverse()
                .map((e, i) => (
                  <li key={`${e.exerciseId}-${i}`} className="flex items-baseline justify-between gap-3">
                    <span>
                      Aufgabe gelöst: <strong>{e.title}</strong> (Station {e.stationId}, +{e.xp} XP)
                    </span>
                    <span className="shrink-0 tabular-nums text-[color:var(--text-muted)]">{fmt(e.at)}</span>
                  </li>
                ))}
            </ol>
          )}
        </div>
      )}
    </li>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
