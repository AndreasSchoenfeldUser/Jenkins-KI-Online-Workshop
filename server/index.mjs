// Express-Backend der Jenkins-Workshop-App.
// - Stellt die Auth-/Benutzer-API unter /api bereit.
// - Speichert Benutzer in server/data/user.yaml (NIE statisch ausgeliefert).
// - Liefert in Produktion das gebaute Frontend aus dist/ aus.
import express from 'express';
import cookieParser from 'cookie-parser';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  authenticate,
  createSession,
  getSessionUserId,
  destroySession,
  findById,
  publicUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  isDefaultAdminOnly,
  createRegistration,
  listRegistrations,
  publicRegistration,
  approveRegistration,
  rejectRegistration,
  putProgress,
  progressFor,
} from './store.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PORT = process.env.PORT || 3001;
const COOKIE = 'jw_sid';

const app = express();
app.use(express.json());
app.use(cookieParser());

// Session-Kontext aus dem httpOnly-Cookie ableiten.
function currentUser(req) {
  const userId = getSessionUserId(req.cookies?.[COOKIE]);
  return userId ? findById(userId) : null;
}

function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  next();
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 60 * 12, // 12 Stunden
  });
}

// --- Session / Login ---
app.get('/api/session', (req, res) => {
  const user = currentUser(req);
  res.json({ user: publicUser(user), defaultAdmin: isDefaultAdminOnly() });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = authenticate(username, password);
  if (!user) return res.status(401).json({ error: 'invalid-credentials' });
  const token = createSession(user.id);
  setSessionCookie(res, token);
  res.json({ user: publicUser(user) });
});

app.post('/api/logout', (req, res) => {
  destroySession(req.cookies?.[COOKIE]);
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
});

// --- Registrierung (oeffentlich) ---
app.post('/api/register', (req, res) => {
  const result = createRegistration(req.body || {});
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({ registration: publicRegistration(result.registration) });
});

// --- Registrierungsanfragen verwalten (nur Admin) ---
app.get('/api/registrations', requireAuth, requireAdmin, (_req, res) => {
  res.json({ registrations: listRegistrations().map(publicRegistration) });
});

app.post('/api/registrations/:id/approve', requireAuth, requireAdmin, (req, res) => {
  const result = approveRegistration(req.params.id);
  if (result.error) {
    const code = result.error === 'not-found' ? 404 : 400;
    return res.status(code).json({ error: result.error });
  }
  res.json({ user: publicUser(result.user) });
});

app.delete('/api/registrations/:id', requireAuth, requireAdmin, (req, res) => {
  const result = rejectRegistration(req.params.id);
  if (result.error) return res.status(404).json({ error: result.error });
  res.json({ ok: true });
});

// --- Fortschritt ---
// Teilnehmer melden ihren eigenen Fortschritt.
app.put('/api/progress', requireAuth, (req, res) => {
  putProgress(req.user.id, req.body || {});
  res.json({ ok: true });
});

// Admin sieht den Fortschritt aller Teilnehmer.
app.get('/api/progress', requireAuth, requireAdmin, (_req, res) => {
  const participants = listUsers().map((u) => ({
    user: publicUser(u),
    progress: progressFor(u.id),
  }));
  res.json({ participants });
});

// --- Benutzerverwaltung (nur Admin) ---
app.get('/api/users', requireAuth, requireAdmin, (_req, res) => {
  res.json({ users: listUsers().map(publicUser) });
});

app.post('/api/users', requireAuth, requireAdmin, (req, res) => {
  const result = createUser(req.body || {});
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({ user: publicUser(result.user) });
});

app.patch('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
  const result = updateUser(req.params.id, req.body || {});
  if (result.error) {
    const code = result.error === 'not-found' ? 404 : 400;
    return res.status(code).json({ error: result.error });
  }
  res.json({ user: publicUser(result.user) });
});

app.delete('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
  const result = deleteUser(req.params.id, req.user.id);
  if (result.error) {
    const code = result.error === 'not-found' ? 404 : 400;
    return res.status(code).json({ error: result.error });
  }
  res.json({ ok: true });
});

// Unbekannte API-Routen sauber abweisen.
app.use('/api', (_req, res) => res.status(404).json({ error: 'not-found' }));

// --- Frontend aus dist/ ausliefern (Produktion) ---
// Es wird ausschliesslich dist/ statisch bereitgestellt — server/data/user.yaml
// liegt ausserhalb und ist damit ueber keine URL erreichbar.
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (_req, res) => res.sendFile(join(DIST, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`[server] API bereit auf http://localhost:${PORT}`);
  if (!existsSync(DIST)) {
    console.log('[server] Kein dist/ gefunden — im Dev-Modus liefert Vite (Port 5173) das Frontend.');
  }
});
