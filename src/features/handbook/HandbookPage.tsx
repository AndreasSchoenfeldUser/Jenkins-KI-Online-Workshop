import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Search, Printer, X } from 'lucide-react';
import { HANDBOOK } from '../../content/handbook';
import type { RichBlock } from '../../types';
import { RichText } from '../../components/RichText';

// Plaintext eines Blocks fuer den Suchindex.
function blockText(b: RichBlock): string {
  switch (b.kind) {
    case 'paragraph':
    case 'heading':
    case 'quote':
      return b.text;
    case 'list':
      return b.items.join(' ');
    case 'code':
      return `${b.caption ?? ''} ${b.code}`;
    case 'table':
      return `${b.caption ?? ''} ${b.headers.join(' ')} ${b.rows.flat().join(' ')}`;
    case 'callout':
      return `${b.title ?? ''} ${b.text}`;
    case 'image':
      return `${b.alt} ${b.caption ?? ''}`;
    default:
      return '';
  }
}

type SearchDoc = { id: string; heading: string; text: string };

export function HandbookPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(HANDBOOK[0]?.id ?? '');
  const contentRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(() => {
    const docs: SearchDoc[] = HANDBOOK.map((s) => ({
      id: s.id,
      heading: s.heading,
      text: s.body.map(blockText).join(' '),
    }));
    return new Fuse(docs, { keys: ['heading', 'text'], threshold: 0.4, ignoreLocation: true });
  }, []);

  const results = query.trim() ? fuse.search(query).slice(0, 8) : [];

  // Scrollspy via IntersectionObserver.
  useEffect(() => {
    const headings = HANDBOOK.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  // Direktsprung zu /handbook/:sectionId.
  useEffect(() => {
    if (sectionId) {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sectionId]);

  function jump(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setQuery('');
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8">
      {/* Inhaltsverzeichnis + Suche (klebrig) */}
      <aside className="no-print hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Im Lehrbuch suchen …"
              aria-label="Volltextsuche"
              className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] py-2 pl-9 pr-8 text-sm focus:border-orange"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Suche leeren"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X size={15} aria-hidden />
              </button>
            )}
          </div>

          {query.trim() ? (
            <ul className="mt-3 space-y-1">
              {results.length === 0 && (
                <li className="px-2 text-sm text-[color:var(--text-muted)]">Keine Treffer.</li>
              )}
              {results.map((r) => (
                <li key={r.item.id}>
                  <button
                    type="button"
                    onClick={() => jump(r.item.id)}
                    className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[color:var(--bg-soft)]"
                  >
                    {r.item.heading}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <nav aria-label="Kapitel" className="mt-3">
              <ul className="space-y-0.5">
                {HANDBOOK.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => jump(s.id)}
                      aria-current={active === s.id ? 'true' : undefined}
                      className={`block w-full rounded px-2 py-1.5 text-left text-sm transition ${
                        active === s.id
                          ? 'bg-navy font-medium text-white'
                          : 'text-[color:var(--text)] hover:bg-[color:var(--bg-soft)]'
                      }`}
                    >
                      {s.heading}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 inline-flex items-center gap-1.5 rounded border border-[color:var(--border)] px-3 py-1.5 text-sm hover:bg-[color:var(--bg-soft)]"
          >
            <Printer size={15} aria-hidden /> Drucken / PDF
          </button>
        </div>
      </aside>

      {/* Lehrbuch-Langtext */}
      <article ref={contentRef} className="print-full min-w-0 max-w-3xl flex-1">
        <h1 className="font-serif text-4xl font-bold">Lehrbuch</h1>
        <p className="mt-2 text-[color:var(--text-muted)]">
          Das vollständige Whitepaper zum Workshop „Jenkins-Infrastruktur mit Claude Code“.
        </p>
        {HANDBOOK.map((s) => (
          <section key={s.id} className="mt-10 scroll-mt-20" id={s.id}>
            <h2 className="font-serif text-2xl font-bold">{s.heading}</h2>
            <RichText blocks={s.body} />
          </section>
        ))}
      </article>
    </div>
  );
}
