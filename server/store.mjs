// Server-seitige Benutzer-Speicherung in user.yaml + Passwort-Hashing + Sessions.
// Die Datei liegt unter server/data/ — ausserhalb des ausgelieferten dist/-
// Verzeichnisses und wird vom Server NIEMALS als statische Datei ausgeliefert.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = join(__dirname, 'data');
export const USERS_FILE = join(DATA_DIR, 'user.yaml');
export const REGS_FILE = join(DATA_DIR, 'registrations.yaml');
export const PROGRESS_FILE = join(DATA_DIR, 'progress.yaml');

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin',
  displayName: 'Administrator',
  email: 'admin@example.com',
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- Passwort-Hashing (scrypt, salted) ---
function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString('hex');
}
function makeSalt() {
  return randomBytes(16).toString('hex');
}
function verifyPassword(password, salt, expectedHash) {
  const actual = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function newId() {
  return 'u_' + randomBytes(8).toString('hex');
}

// --- YAML-Persistenz ---
function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(USERS_FILE)) {
    const salt = makeSalt();
    const admin = {
      id: newId(),
      username: DEFAULT_ADMIN.username,
      displayName: DEFAULT_ADMIN.displayName,
      email: DEFAULT_ADMIN.email,
      role: 'admin',
      salt,
      passwordHash: hashPassword(DEFAULT_ADMIN.password, salt),
      createdAt: Date.now(),
    };
    writeUsers([admin]);
  }
}

function readUsers() {
  ensureStore();
  try {
    const doc = YAML.parse(readFileSync(USERS_FILE, 'utf8')) || {};
    return Array.isArray(doc.users) ? doc.users : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const header =
    '# Benutzer der Jenkins-Workshop-App.\n' +
    '# Passwoerter sind als scrypt-Hash + Salt gespeichert (kein Klartext).\n' +
    '# Diese Datei wird NICHT ueber das Frontend/URL ausgeliefert.\n';
  writeFileSync(USERS_FILE, header + YAML.stringify({ users }), 'utf8');
}

// Oeffentliche Sicht eines Users (ohne Hash/Salt).
export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    email: u.email ?? '',
    role: u.role,
    createdAt: u.createdAt,
  };
}

// --- API der Storage-Schicht ---
export function listUsers() {
  return readUsers();
}

export function findById(id) {
  return readUsers().find((u) => u.id === id) || null;
}

export function authenticate(username, password) {
  const user = readUsers().find(
    (u) => u.username.toLowerCase() === String(username).trim().toLowerCase(),
  );
  if (!user) return null;
  if (!verifyPassword(password, user.salt, user.passwordHash)) return null;
  return user;
}

export function isDefaultAdminOnly() {
  const users = readUsers();
  return users.length === 1 && users[0].username === DEFAULT_ADMIN.username;
}

export function createUser({ username, password, role, displayName, email }) {
  const name = String(username || '').trim();
  if (!name) return { error: 'username-empty' };
  if (!password) return { error: 'password-empty' };
  const mail = String(email || '').trim();
  if (mail && !EMAIL_RE.test(mail)) return { error: 'email-invalid' };
  const users = readUsers();
  if (users.some((u) => u.username.toLowerCase() === name.toLowerCase())) {
    return { error: 'username-taken' };
  }
  const salt = makeSalt();
  const user = {
    id: newId(),
    username: name,
    displayName: String(displayName || name).trim() || name,
    email: mail,
    role: role === 'admin' ? 'admin' : 'user',
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: Date.now(),
  };
  users.push(user);
  writeUsers(users);
  return { user };
}

export function updateUser(id, changes) {
  const users = readUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return { error: 'not-found' };
  // Letzten Admin nicht herabstufen.
  if (changes.role === 'user' && target.role === 'admin') {
    if (users.filter((u) => u.role === 'admin').length <= 1) {
      return { error: 'cannot-remove-last-admin' };
    }
  }
  if (typeof changes.displayName === 'string' && changes.displayName.trim()) {
    target.displayName = changes.displayName.trim();
  }
  if (changes.role === 'admin' || changes.role === 'user') {
    target.role = changes.role;
  }
  if (changes.password) {
    target.salt = makeSalt();
    target.passwordHash = hashPassword(changes.password, target.salt);
  }
  writeUsers(users);
  return { user: target };
}

export function deleteUser(id, currentUserId) {
  if (id === currentUserId) return { error: 'cannot-delete-self' };
  const users = readUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return { error: 'not-found' };
  if (target.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
    return { error: 'cannot-remove-last-admin' };
  }
  writeUsers(users.filter((u) => u.id !== id));
  return { ok: true };
}

// --- In-Memory-Sessions (Token -> userId) ---
const sessions = new Map();

export function createSession(userId) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { userId, createdAt: Date.now() });
  return token;
}
export function getSessionUserId(token) {
  return token && sessions.has(token) ? sessions.get(token).userId : null;
}
export function destroySession(token) {
  if (token) sessions.delete(token);
}

// ===========================================================================
// Registrierungsanfragen (registrations.yaml)
// ===========================================================================
function readRegs() {
  if (!existsSync(REGS_FILE)) return [];
  try {
    const doc = YAML.parse(readFileSync(REGS_FILE, 'utf8')) || {};
    return Array.isArray(doc.registrations) ? doc.registrations : [];
  } catch {
    return [];
  }
}

function writeRegs(regs) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const header =
    '# Offene Registrierungsanfragen. Passwoerter als scrypt-Hash + Salt.\n' +
    '# Wird NICHT ueber das Frontend/URL ausgeliefert.\n';
  writeFileSync(REGS_FILE, header + YAML.stringify({ registrations: regs }), 'utf8');
}

export function publicRegistration(r) {
  if (!r) return null;
  return {
    id: r.id,
    username: r.username,
    email: r.email,
    displayName: r.displayName,
    createdAt: r.createdAt,
  };
}

export function listRegistrations() {
  return readRegs();
}

export function createRegistration({ username, email, password, displayName }) {
  const name = String(username || '').trim();
  const mail = String(email || '').trim();
  if (!name) return { error: 'username-empty' };
  if (!mail) return { error: 'email-empty' };
  if (!EMAIL_RE.test(mail)) return { error: 'email-invalid' };
  if (!password) return { error: 'password-empty' };

  const taken =
    readUsers().some((u) => u.username.toLowerCase() === name.toLowerCase()) ||
    readRegs().some((r) => r.username.toLowerCase() === name.toLowerCase());
  if (taken) return { error: 'username-taken' };

  const salt = makeSalt();
  const reg = {
    id: 'r_' + randomBytes(8).toString('hex'),
    username: name,
    email: mail,
    displayName: String(displayName || name).trim() || name,
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: Date.now(),
  };
  const regs = readRegs();
  regs.push(reg);
  writeRegs(regs);
  return { registration: reg };
}

export function approveRegistration(id) {
  const regs = readRegs();
  const reg = regs.find((r) => r.id === id);
  if (!reg) return { error: 'not-found' };
  const users = readUsers();
  if (users.some((u) => u.username.toLowerCase() === reg.username.toLowerCase())) {
    // Username inzwischen vergeben -> Anfrage verwerfen.
    writeRegs(regs.filter((r) => r.id !== id));
    return { error: 'username-taken' };
  }
  // Hash/Salt werden uebernommen (kein erneutes Hashing noetig).
  const user = {
    id: newId(),
    username: reg.username,
    displayName: reg.displayName,
    email: reg.email,
    role: 'user',
    salt: reg.salt,
    passwordHash: reg.passwordHash,
    createdAt: Date.now(),
  };
  users.push(user);
  writeUsers(users);
  writeRegs(regs.filter((r) => r.id !== id));
  return { user };
}

export function rejectRegistration(id) {
  const regs = readRegs();
  if (!regs.some((r) => r.id === id)) return { error: 'not-found' };
  writeRegs(regs.filter((r) => r.id !== id));
  return { ok: true };
}

// ===========================================================================
// Fortschritt (progress.yaml) — Snapshot je User + Ereignis-Log
// ===========================================================================
const MAX_LOG = 200;

function readProgress() {
  if (!existsSync(PROGRESS_FILE)) return {};
  try {
    const doc = YAML.parse(readFileSync(PROGRESS_FILE, 'utf8')) || {};
    return doc.progress && typeof doc.progress === 'object' ? doc.progress : {};
  } catch {
    return {};
  }
}

function writeProgress(progress) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const header = '# Fortschritt der Teilnehmer (Snapshot + Ereignis-Log).\n';
  writeFileSync(PROGRESS_FILE, header + YAML.stringify({ progress }), 'utf8');
}

// Nimmt einen Fortschritts-Snapshot entgegen und protokolliert neu geloeste Aufgaben.
export function putProgress(userId, payload) {
  const all = readProgress();
  const prev = all[userId] || { solvedIds: [], log: [] };
  const solved = Array.isArray(payload?.solved) ? payload.solved : [];
  const incomingIds = solved.map((s) => s.id);
  const newOnes = solved.filter((s) => !prev.solvedIds.includes(s.id));

  const log = Array.isArray(prev.log) ? prev.log.slice() : [];
  for (const s of newOnes) {
    log.push({
      at: Date.now(),
      type: 'solved',
      exerciseId: s.id,
      title: s.title,
      stationId: s.stationId,
      xp: s.xp,
    });
  }

  all[userId] = {
    solvedIds: incomingIds,
    summary: {
      solvedCount: payload?.solvedCount ?? incomingIds.length,
      totalCount: payload?.totalCount ?? 0,
      earnedXp: payload?.earnedXp ?? 0,
      totalXp: payload?.totalXp ?? 0,
      quizCorrect: payload?.quizCorrect ?? 0,
      quizAnswered: payload?.quizAnswered ?? 0,
      stations: Array.isArray(payload?.stations) ? payload.stations : [],
    },
    log: log.slice(-MAX_LOG),
    updatedAt: Date.now(),
    startedAt: prev.startedAt ?? Date.now(),
  };
  writeProgress(all);
  return { ok: true };
}

export function progressFor(userId) {
  return readProgress()[userId] ?? null;
}
