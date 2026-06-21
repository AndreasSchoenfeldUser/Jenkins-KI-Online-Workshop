import { useState } from 'react';
import { Lightbulb, Eye } from 'lucide-react';

// Gestaffelte Hinweise (progressive disclosure) plus optionale Musterloesung.
export function Hints({ hints, sample }: { hints: string[]; sample?: React.ReactNode }) {
  const [shown, setShown] = useState(0);
  const [showSample, setShowSample] = useState(false);

  return (
    <div className="mt-4">
      {hints.slice(0, shown).map((h, i) => (
        <div key={i} className="mb-2 flex gap-2 rounded bg-amber/10 p-3 text-sm">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber" aria-hidden />
          <span>
            <strong>Hinweis {i + 1}:</strong> {h}
          </span>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {shown < hints.length && (
          <button
            type="button"
            onClick={() => setShown((s) => s + 1)}
            className="inline-flex items-center gap-1.5 rounded border border-amber px-3 py-1.5 text-sm font-medium text-amber hover:bg-amber/10"
          >
            <Lightbulb size={15} aria-hidden />
            {shown === 0 ? 'Hinweis anzeigen' : 'Weiterer Hinweis'} ({shown}/{hints.length})
          </button>
        )}
        {sample && shown >= hints.length && !showSample && (
          <button
            type="button"
            onClick={() => setShowSample(true)}
            className="inline-flex items-center gap-1.5 rounded border border-navy px-3 py-1.5 text-sm font-medium text-navy hover:bg-navy/5"
          >
            <Eye size={15} aria-hidden />
            Musterlösung anzeigen
          </button>
        )}
      </div>

      {showSample && sample && (
        <div className="mt-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-soft)] p-3">
          <p className="mb-2 text-sm font-semibold">Musterlösung</p>
          {sample}
        </div>
      )}
    </div>
  );
}
