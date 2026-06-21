import { Fragment, type ReactNode } from 'react';

// Interpretiert leichtes Inline-Markup: **fett** und `code`.
export function Inline({ text }: { text: string }): JSX.Element {
  const nodes: ReactNode[] = [];
  // Token-Regex: **fett** oder `code`.
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    const tok = match[0];
    if (tok.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-semibold text-[color:var(--text)]">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-[color:var(--bg-soft)] px-1.5 py-0.5 font-mono text-[0.85em] text-orange"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }
  return <>{nodes}</>;
}
