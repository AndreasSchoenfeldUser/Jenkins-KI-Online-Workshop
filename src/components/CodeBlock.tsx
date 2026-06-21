import { useState } from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CodeLang } from '../types';
import { CopyButton } from './CopyButton';

// prism-react-renderer buendelt nur eine Teilmenge der Sprachen. Nicht
// unterstuetzte Sprachen (groovy, dockerfile) werden ohne Tokens dargestellt;
// ein clike-Fallback verbessert das Ergebnis fuer Groovy.
const LANG_MAP: Record<CodeLang, Language> = {
  bash: 'bash',
  groovy: 'clike' as Language,
  python: 'python',
  yaml: 'yaml',
  markdown: 'markdown',
  dockerfile: 'docker' as Language,
  text: 'markup',
};

type Props = {
  code: string;
  lang: CodeLang;
  caption?: string;
  collapsible?: boolean;
};

export function CodeBlock({ code, lang, caption, collapsible }: Props) {
  const [open, setOpen] = useState(!collapsible);
  const language = LANG_MAP[lang] ?? ('markup' as Language);

  return (
    <figure className="my-4 overflow-hidden rounded-lg shadow-soft">
      <div className="flex items-center justify-between bg-navy px-3 py-2">
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-xs font-medium text-light hover:text-white"
            >
              {open ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
              {open ? 'Einklappen' : 'Ausklappen'}
            </button>
          )}
          <span className="font-mono text-[11px] uppercase tracking-wide text-amber">{lang}</span>
        </div>
        <CopyButton text={code} />
      </div>
      {open && (
        <Highlight code={code.replace(/\n$/, '')} language={language} theme={themes.vsDark}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} overflow-x-auto p-4 text-[13px] leading-relaxed`}
              style={style}
              tabIndex={0}
            >
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line });
                return (
                  <div key={i} {...lineProps}>
                    <span className="mr-4 inline-block w-6 select-none text-right text-white/30">
                      {i + 1}
                    </span>
                    {line.map((token, key) => {
                      const tokenProps = getTokenProps({ token });
                      return <span key={key} {...tokenProps} />;
                    })}
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      )}
      {caption && (
        <figcaption className="bg-navy-2 px-4 py-2 text-xs text-light/80">{caption}</figcaption>
      )}
    </figure>
  );
}
