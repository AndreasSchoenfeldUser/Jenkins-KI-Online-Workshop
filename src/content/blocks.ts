// Kurze Konstruktoren fuer RichBlock-Inhalte — halten die Content-Module lesbar.
import type {
  CalloutBlock,
  CodeBlock,
  CodeLang,
  HeadingBlock,
  ImageBlock,
  ListBlock,
  ParagraphBlock,
  QuoteBlock,
  TableBlock,
} from '../types';

export const p = (text: string): ParagraphBlock => ({ kind: 'paragraph', text });

export const ul = (...items: string[]): ListBlock => ({ kind: 'list', items });

export const ol = (...items: string[]): ListBlock => ({ kind: 'list', ordered: true, items });

export const h = (level: 2 | 3 | 4, text: string, id?: string): HeadingBlock => ({
  kind: 'heading',
  level,
  text,
  id,
});

export const code = (
  lang: CodeLang,
  codeStr: string,
  opts: { caption?: string; collapsible?: boolean } = {},
): CodeBlock => ({ kind: 'code', lang, code: codeStr, ...opts });

export const table = (headers: string[], rows: string[][], caption?: string): TableBlock => ({
  kind: 'table',
  headers,
  rows,
  caption,
});

export const img = (src: string, alt: string, caption?: string): ImageBlock => ({
  kind: 'image',
  src,
  alt,
  caption,
});

export const callout = (
  tone: CalloutBlock['tone'],
  text: string,
  title?: string,
): CalloutBlock => ({ kind: 'callout', tone, text, title });

export const quote = (text: string, cite?: string): QuoteBlock => ({ kind: 'quote', text, cite });

// Aus den Domain-Fakten abgeleitete, wiederverwendbare Tabellen.
import { HOSTS, HTTPS_FACTS, ENVIRONMENT, STAGES, PLUGINS, hostById } from './domain';

export const hostTable = (): TableBlock =>
  table(
    ['Host', 'Rolle', 'IP', 'Privater Schlüssel', 'Label'],
    HOSTS.map((host) => [host.id, host.role, host.ip, host.sshKey, host.label ?? '—']),
    'Vier Hosts der vorbereiteten Umgebung (Single Source: content/domain.ts).',
  );

export const httpsTable = (): TableBlock =>
  table(
    ['Aspekt', 'Festlegung'],
    [
      ['Domain', HTTPS_FACTS.domain],
      ['DNS', HTTPS_FACTS.dns],
      ['Zertifikat', HTTPS_FACTS.cert],
      ['Reverse Proxy', HTTPS_FACTS.proxy],
      ['Erneuerung', HTTPS_FACTS.renew],
      ['Jenkins-URL', HTTPS_FACTS.url],
    ],
    'Domain & HTTPS auf host1.',
  );

export const versionTable = (): TableBlock =>
  table(
    ['Komponente', 'Version'],
    [
      ['Betriebssystem', ENVIRONMENT.versions.os],
      ['Java', ENVIRONMENT.versions.java],
      ['Maven', ENVIRONMENT.versions.maven],
      ['Python', ENVIRONMENT.versions.python],
      ['Jenkins', ENVIRONMENT.versions.jenkins],
    ],
    'Vorinstallierte Versionen.',
  );

export const stageTable = (): TableBlock =>
  table(
    ['#', 'Stage', 'Beschreibung', 'Host', 'Label'],
    STAGES.map((s) => [
      String(s.n),
      s.name,
      s.description,
      `${s.hostId} (${hostById(s.hostId)?.role ?? ''})`,
      s.agentLabel ?? '— (Controller)',
    ]),
    'Die sieben Pipeline-Stages mit Host-/Label-Zuordnung.',
  );

export const pluginTable = (): TableBlock =>
  table(
    ['Plugin', 'Zweck'],
    PLUGINS.map((pl) => [pl.id, pl.purpose]),
    'Benötigte Jenkins-Plugins auf host1.',
  );
