import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  to?: string;
  children: ReactNode;
  className?: string;
};

// Karte im Design-System: abgerundet, dezenter Schatten, kein harter Rahmen.
export function Card({ to, children, className = '' }: Props) {
  const base =
    'surface rounded-lg p-4 shadow-soft transition ' +
    (to ? 'hover:shadow-soft-lg hover:-translate-y-0.5 focus-visible:-translate-y-0.5 ' : '') +
    className;
  if (to) {
    return (
      <Link to={to} className={`block ${base}`}>
        {children}
      </Link>
    );
  }
  return <div className={base}>{children}</div>;
}
