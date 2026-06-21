import type { RichBlock } from '../types';
import { Inline } from './Inline';
import { CodeBlock } from './CodeBlock';
import { Callout } from './Callout';

// Rendert eine Liste von RichBlocks im Design-System. Inhalt bleibt strikt
// von der Darstellung getrennt — diese Komponente ist der einzige Renderer.
export function RichText({ blocks }: { blocks: RichBlock[] }) {
  return (
    <div className="space-y-1">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: RichBlock }) {
  switch (block.kind) {
    case 'heading': {
      const cls =
        block.level === 2
          ? 'mt-8 mb-3 text-2xl font-bold'
          : block.level === 3
            ? 'mt-6 mb-2 text-xl font-semibold'
            : 'mt-4 mb-1 text-lg font-semibold';
      if (block.level === 2) return <h2 id={block.id} className={cls}>{block.text}</h2>;
      if (block.level === 3) return <h3 id={block.id} className={cls}>{block.text}</h3>;
      return <h4 id={block.id} className={cls}>{block.text}</h4>;
    }

    case 'paragraph':
      return (
        <p className="my-3 text-[16px] leading-relaxed text-[color:var(--text)]">
          <Inline text={block.text} />
        </p>
      );

    case 'list':
      return block.ordered ? (
        <ol className="my-3 ml-6 list-decimal space-y-1.5 text-[16px] leading-relaxed">
          {block.items.map((it, i) => (
            <li key={i}>
              <Inline text={it} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="my-3 ml-6 list-disc space-y-1.5 text-[16px] leading-relaxed">
          {block.items.map((it, i) => (
            <li key={i}>
              <Inline text={it} />
            </li>
          ))}
        </ul>
      );

    case 'code':
      return (
        <CodeBlock
          code={block.code}
          lang={block.lang}
          caption={block.caption}
          collapsible={block.collapsible}
        />
      );

    case 'table':
      return (
        <figure className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[15px]">
            <thead>
              <tr className="bg-navy text-white">
                {block.headers.map((hd, i) => (
                  <th key={i} className="px-3 py-2 font-semibold">
                    {hd}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 ? 'bg-[color:var(--bg)]' : 'bg-[color:var(--bg-soft)]'}
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-b border-[color:var(--border)] px-3 py-2 align-top">
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && (
            <figcaption className="mt-1.5 text-sm text-[color:var(--text-muted)]">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'image':
      return (
        <figure className="my-5">
          <img src={block.src} alt={block.alt} className="mx-auto max-w-full rounded-lg" loading="lazy" />
          {block.caption && (
            <figcaption className="mt-2 text-center text-sm text-[color:var(--text-muted)]">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'callout':
      return <Callout tone={block.tone} title={block.title} text={block.text} />;

    case 'quote':
      return (
        <blockquote className="my-4 border-l-4 border-amber bg-[color:var(--bg-soft)] px-4 py-2 italic">
          <Inline text={block.text} />
          {block.cite && <cite className="mt-1 block text-sm not-italic text-[color:var(--text-muted)]">— {block.cite}</cite>}
        </blockquote>
      );

    default:
      return null;
  }
}
