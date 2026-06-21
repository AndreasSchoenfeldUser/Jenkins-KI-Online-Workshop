import { Circle, CircleDot, CheckCircle2 } from 'lucide-react';
import type { ExerciseStatus } from '../types';

const MAP: Record<ExerciseStatus, { icon: typeof Circle; label: string; cls: string }> = {
  'not-started': { icon: Circle, label: 'offen', cls: 'text-[color:var(--text-muted)]' },
  'in-progress': { icon: CircleDot, label: 'begonnen', cls: 'text-amber' },
  solved: { icon: CheckCircle2, label: 'erledigt', cls: 'text-green-600' },
};

export function ProgressBadge({ status, showLabel = true }: { status: ExerciseStatus; showLabel?: boolean }) {
  const m = MAP[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${m.cls}`}>
      <Icon size={16} aria-hidden />
      {showLabel && <span>{m.label}</span>}
      <span className="sr-only">Status: {m.label}</span>
    </span>
  );
}
