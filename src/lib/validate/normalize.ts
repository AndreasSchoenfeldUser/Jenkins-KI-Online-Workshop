// Hilfsfunktionen fuer toleranten Vergleich von Eingaben.

// Normalisiert Whitespace, Anfuehrungszeichen und Gross-/Kleinschreibung.
export function normalize(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Entfernt jeglichen Whitespace (fuer kompakten Code-Vergleich).
export function stripWhitespace(s: string): string {
  return s.replace(/\s+/g, '').replace(/[“”„]/g, '"').replace(/[‘’]/g, "'").toLowerCase();
}

export function containsAny(haystack: string, needles: string[]): boolean {
  const n = normalize(haystack);
  return needles.some((needle) => n.includes(normalize(needle)));
}

export function matchesAny(value: string, patterns: string[], regex?: string): boolean {
  if (regex) {
    try {
      if (new RegExp(regex, 'i').test(value.trim())) return true;
    } catch {
      /* ungueltige Regex ignorieren */
    }
  }
  const target = stripWhitespace(value);
  return patterns.some((p) => stripWhitespace(p) === target);
}
