import { Info, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { CalloutBlock } from '../types';
import { Inline } from './Inline';

const TONES: Record<
  CalloutBlock['tone'],
  { icon: typeof Info; ring: string; bg: string; label: string }
> = {
  info: { icon: Info, ring: 'border-l-navy-2', bg: 'bg-light', label: 'Hinweis' },
  warning: { icon: AlertTriangle, ring: 'border-l-amber', bg: 'bg-amber/10', label: 'Achtung' },
  success: { icon: CheckCircle2, ring: 'border-l-green-600', bg: 'bg-green-50', label: 'Ergebnis' },
  security: { icon: ShieldAlert, ring: 'border-l-orange', bg: 'bg-orange/10', label: 'Sicherheit' },
};

export function Callout({ tone, title, text }: { tone: CalloutBlock['tone']; title?: string; text: string }) {
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <div
      role="note"
      className={`my-4 flex gap-3 rounded border-l-4 ${t.ring} ${t.bg} p-4 text-ink`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        <p className="font-semibold">{title ?? t.label}</p>
        <p className="mt-1 text-[15px] leading-relaxed">
          <Inline text={text} />
        </p>
      </div>
    </div>
  );
}
