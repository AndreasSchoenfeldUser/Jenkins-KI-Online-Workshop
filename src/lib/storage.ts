// Robuste localStorage-Abstraktion. Faellt auf einen In-Memory-Store zurueck,
// wenn localStorage fehlt, voll oder deaktiviert ist (z. B. Private Mode,
// file://-Kontext, SSR). Alle Zugriffe sind in try/catch gekapselt.

const memoryStore = new Map<string, string>();

function hasLocalStorage(): boolean {
  try {
    const probe = '__ws_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const useLs = typeof window !== 'undefined' && hasLocalStorage();

export function readRaw(key: string): string | null {
  try {
    if (useLs) return window.localStorage.getItem(key);
    return memoryStore.has(key) ? (memoryStore.get(key) as string) : null;
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

export function writeRaw(key: string, value: string): void {
  try {
    if (useLs) {
      window.localStorage.setItem(key, value);
      return;
    }
    memoryStore.set(key, value);
  } catch {
    // Quota o. Ae. — In-Memory als Fallback, damit die Sitzung weiterlaeuft.
    memoryStore.set(key, value);
  }
}

export function removeRaw(key: string): void {
  try {
    if (useLs) window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  memoryStore.delete(key);
}

export function loadJSON<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Ungueltiger Inhalt — verwerfen und Fallback nutzen.
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    writeRaw(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const isPersistent = useLs;
