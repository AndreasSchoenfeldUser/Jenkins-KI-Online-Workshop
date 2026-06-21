import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { sortedGlossary } from '../../content/glossary';

export function GlossaryPage() {
  const [query, setQuery] = useState('');
  const all = useMemo(() => sortedGlossary(), []);
  const q = query.trim().toLowerCase();
  const entries = q
    ? all.filter((e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q))
    : all;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-bold">Glossar</h1>
      <p className="mt-1 text-[color:var(--text-muted)]">
        Fachbegriffe rund um die verteilte Jenkins-Umgebung, alphabetisch sortiert.
      </p>

      <div className="relative mt-4">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Begriff suchen …"
          aria-label="Glossar durchsuchen"
          className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] py-2 pl-9 pr-3 focus:border-orange"
        />
      </div>

      <dl className="mt-6 space-y-4">
        {entries.length === 0 && <p className="text-[color:var(--text-muted)]">Keine Treffer.</p>}
        {entries.map((e) => (
          <div key={e.term} className="surface rounded-lg p-4 shadow-soft">
            <dt className="font-serif text-lg font-bold text-orange">{e.term}</dt>
            <dd className="mt-1 text-[15px] leading-relaxed">{e.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
