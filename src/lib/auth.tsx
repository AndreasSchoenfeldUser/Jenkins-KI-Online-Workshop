import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// ============================================================================
// Frontend-Auth: spricht ausschliesslich die /api-Endpunkte des Backends an.
// Benutzer + Passwoerter liegen serverseitig in server/data/user.yaml; das
// Frontend erhaelt nie Hash/Salt und kann die Datei nicht per URL abrufen.
// ============================================================================

export type Role = 'admin' | 'user';

// Oeffentliche Sicht eines Benutzers (ohne Hash/Salt — der Server liefert nur dies).
export type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: Role;
  createdAt: number;
};

export type Registration = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: number;
};

export type AuthError =
  | 'invalid-credentials'
  | 'username-taken'
  | 'username-empty'
  | 'password-empty'
  | 'email-empty'
  | 'email-invalid'
  | 'cannot-delete-self'
  | 'cannot-remove-last-admin'
  | 'not-found'
  | 'network';

export const AUTH_ERROR_TEXT: Record<AuthError, string> = {
  'invalid-credentials': 'Benutzername oder Passwort ist falsch.',
  'username-taken': 'Dieser Benutzername ist bereits vergeben.',
  'username-empty': 'Bitte einen Benutzernamen angeben.',
  'password-empty': 'Bitte ein Passwort angeben.',
  'email-empty': 'Bitte eine E-Mail-Adresse angeben.',
  'email-invalid': 'Bitte eine gültige E-Mail-Adresse angeben.',
  'cannot-delete-self': 'Das eigene Konto kann nicht gelöscht werden.',
  'cannot-remove-last-admin':
    'Der letzte Administrator kann nicht entfernt oder herabgestuft werden.',
  'not-found': 'Eintrag nicht gefunden.',
  network: 'Server nicht erreichbar. Läuft das Backend?',
};

export const DEFAULT_ADMIN_HINT = { username: 'admin', password: 'admin' };

type ApiResult = { ok: boolean; error?: AuthError };

async function api(path: string, options?: RequestInit): Promise<{ status: number; data: any }> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* leere Antwort */
  }
  return { status: res.status, data };
}

type AuthContextValue = {
  ready: boolean;
  users: User[];
  registrations: Registration[];
  currentUser: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<ApiResult>;
  logout: () => Promise<void>;
  register: (input: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<ApiResult>;
  createUser: (input: {
    username: string;
    password: string;
    role: Role;
    displayName?: string;
    email?: string;
  }) => Promise<ApiResult>;
  updateUser: (
    id: string,
    changes: { displayName?: string; role?: Role; password?: string },
  ) => Promise<ApiResult>;
  deleteUser: (id: string) => Promise<ApiResult>;
  approveRegistration: (id: string) => Promise<ApiResult>;
  rejectRegistration: (id: string) => Promise<ApiResult>;
  defaultAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [defaultAdmin, setDefaultAdmin] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Laedt Admin-Daten (Benutzerliste + offene Registrierungen).
  async function refreshUsers(user: User | null) {
    if (user?.role === 'admin') {
      try {
        const [u, r] = await Promise.all([api('/users'), api('/registrations')]);
        if (u.status === 200) setUsers(u.data.users ?? []);
        if (r.status === 200) setRegistrations(r.data.registrations ?? []);
      } catch {
        setUsers([]);
        setRegistrations([]);
      }
    } else {
      setUsers([]);
      setRegistrations([]);
    }
  }

  // Beim Start die bestehende Session laden.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status, data } = await api('/session');
        if (!cancelled && status === 200) {
          setCurrentUser(data.user ?? null);
          setDefaultAdmin(!!data.defaultAdmin);
          await refreshUsers(data.user ?? null);
        }
      } catch {
        /* Backend evtl. nicht erreichbar */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthContextValue = {
    ready,
    users,
    registrations,
    currentUser,
    isAdmin,
    defaultAdmin,

    async login(username, password) {
      try {
        const { status, data } = await api('/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        });
        if (status === 200) {
          setCurrentUser(data.user);
          await refreshUsers(data.user);
          return { ok: true };
        }
        return { ok: false, error: (data?.error as AuthError) ?? 'invalid-credentials' };
      } catch {
        return { ok: false, error: 'network' };
      }
    },

    async logout() {
      try {
        await api('/logout', { method: 'POST' });
      } catch {
        /* ignore */
      }
      setCurrentUser(null);
      setUsers([]);
      setRegistrations([]);
    },

    async register(input) {
      try {
        const { status, data } = await api('/register', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        if (status === 201) return { ok: true };
        return { ok: false, error: (data?.error as AuthError) ?? 'network' };
      } catch {
        return { ok: false, error: 'network' };
      }
    },

    async approveRegistration(id) {
      try {
        const { status, data } = await api(`/registrations/${id}/approve`, { method: 'POST' });
        if (status === 200) {
          await refreshUsers(currentUser);
          return { ok: true };
        }
        return { ok: false, error: (data?.error as AuthError) ?? 'network' };
      } catch {
        return { ok: false, error: 'network' };
      }
    },

    async rejectRegistration(id) {
      try {
        const { status, data } = await api(`/registrations/${id}`, { method: 'DELETE' });
        if (status === 200) {
          await refreshUsers(currentUser);
          return { ok: true };
        }
        return { ok: false, error: (data?.error as AuthError) ?? 'network' };
      } catch {
        return { ok: false, error: 'network' };
      }
    },

    async createUser(input) {
      try {
        const { status, data } = await api('/users', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        if (status === 201) {
          await refreshUsers(currentUser);
          return { ok: true };
        }
        return { ok: false, error: (data?.error as AuthError) ?? 'network' };
      } catch {
        return { ok: false, error: 'network' };
      }
    },

    async updateUser(id, changes) {
      try {
        const { status, data } = await api(`/users/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(changes),
        });
        if (status === 200) {
          await refreshUsers(currentUser);
          return { ok: true };
        }
        return { ok: false, error: (data?.error as AuthError) ?? 'network' };
      } catch {
        return { ok: false, error: 'network' };
      }
    },

    async deleteUser(id) {
      try {
        const { status, data } = await api(`/users/${id}`, { method: 'DELETE' });
        if (status === 200) {
          await refreshUsers(currentUser);
          return { ok: true };
        }
        return { ok: false, error: (data?.error as AuthError) ?? 'network' };
      } catch {
        return { ok: false, error: 'network' };
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden.');
  return ctx;
}
