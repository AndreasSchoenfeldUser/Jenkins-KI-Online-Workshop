import { Check, X } from 'lucide-react';
import type { ValidationResult } from '../../types';

// Zeigt pro Kriterium/Schritt erfuellt/offen und eine optionale Gesamtmeldung.
export function Feedback({ result }: { result: ValidationResult | null }) {
  if (!result) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-4 rounded-lg border p-3 ${
        result.solved ? 'border-green-600 bg-green-50' : 'border-[color:var(--border)] bg-[color:var(--bg-soft)]'
      }`}
    >
      <p className="font-semibold text-ink">
        {result.solved ? 'Gelöst!' : 'Noch nicht vollständig — siehe Kriterien:'}
      </p>
      {result.details.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-ink">
          {result.details.map((d, i) => (
            <li key={i} className="flex items-start gap-2">
              {d.ok ? (
                <Check size={16} className="mt-0.5 shrink-0 text-green-600" aria-label="erfüllt" />
              ) : (
                <X size={16} className="mt-0.5 shrink-0 text-orange" aria-label="offen" />
              )}
              <span>{d.label}</span>
            </li>
          ))}
        </ul>
      )}
      {result.message && <p className="mt-2 text-sm text-ink">{result.message}</p>}
    </div>
  );
}
