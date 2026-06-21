import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  StickyNote,
  LayoutGrid,
  X,
  LogOut,
} from 'lucide-react';
import { SLIDES } from '../../content/slides';
import { SlideView } from './SlideView';

// Slide-Deck mit Vollbild, Tastatursteuerung, Sprechernotizen und Uebersicht.
export function PresentPage() {
  const { slideIndex } = useParams<{ slideIndex: string }>();
  const navigate = useNavigate();
  const start = Math.min(Math.max(Number(slideIndex ?? 0) || 0, 0), SLIDES.length - 1);

  const [index, setIndex] = useState(start);
  const [notes, setNotes] = useState(false);
  const [overview, setOverview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (i: number) => {
      const clamped = Math.min(Math.max(i, 0), SLIDES.length - 1);
      setIndex(clamped);
      navigate(`/present/${clamped}`, { replace: true });
    },
    [navigate],
  );

  // Praesentation verlassen — ggf. zuerst Vollbild beenden, dann zur Startseite.
  const exitPresentation = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
    navigate('/');
  }, [navigate]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await stageRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* Fullscreen-API evtl. nicht verfuegbar */
    }
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          if (overview) return;
          go(index + 1);
          break;
        case 'ArrowLeft':
          if (overview) return;
          go(index - 1);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 's':
        case 'S':
          setNotes((n) => !n);
          break;
        case 'o':
        case 'O':
          setOverview((o) => !o);
          break;
        case 'Escape':
          // Erst Übersicht schließen, dann Vollbild, sonst Präsentation verlassen.
          if (overview) {
            setOverview(false);
          } else if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            exitPresentation();
          }
          break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, overview, go, toggleFullscreen, exitPresentation]);

  const slide = SLIDES[index];

  return (
    <div ref={stageRef} className="no-print bg-[color:var(--bg)]">
      {/* Buehne 16:9 */}
      <div className="relative mx-auto" style={{ maxWidth: fullscreen ? '100vw' : '1100px' }}>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-soft-lg">
          <SlideView slide={slide} />
        </div>

        {/* Steuerleiste */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              aria-label="Vorherige Folie"
              className="rounded p-2 hover:bg-[color:var(--bg-soft)] disabled:opacity-30"
            >
              <ChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={index === SLIDES.length - 1}
              aria-label="Nächste Folie"
              className="rounded p-2 hover:bg-[color:var(--bg-soft)] disabled:opacity-30"
            >
              <ChevronRight aria-hidden />
            </button>
            <span className="ml-2 text-sm tabular-nums text-[color:var(--text-muted)]">
              {index + 1} / {SLIDES.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ToolbarButton active={notes} onClick={() => setNotes((n) => !n)} label="Sprechernotizen (S)">
              <StickyNote size={18} aria-hidden />
            </ToolbarButton>
            <ToolbarButton active={overview} onClick={() => setOverview((o) => !o)} label="Übersicht (O)">
              <LayoutGrid size={18} aria-hidden />
            </ToolbarButton>
            <ToolbarButton active={fullscreen} onClick={toggleFullscreen} label="Vollbild (F)">
              {fullscreen ? <Minimize size={18} aria-hidden /> : <Maximize size={18} aria-hidden />}
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-[color:var(--border)]" aria-hidden />
            <button
              type="button"
              onClick={exitPresentation}
              className="inline-flex items-center gap-1.5 rounded px-3 py-2 text-sm font-medium text-orange hover:bg-orange/10"
              title="Präsentation beenden (Esc)"
            >
              <LogOut size={16} aria-hidden /> Beenden
            </button>
          </div>
        </div>

        {/* Fortschrittsbalken */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--bg-soft)]">
          <div
            className="h-full bg-orange transition-all"
            style={{ width: `${((index + 1) / SLIDES.length) * 100}%` }}
          />
        </div>

        {/* Sprechernotizen (Presenter-View) */}
        {notes && (
          <div className="mt-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--bg-soft)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]">
              Sprechernotizen
            </p>
            <p className="mt-1 text-[15px] leading-relaxed">{slide.speakerNotes}</p>
          </div>
        )}

        <p className="mt-3 text-center text-xs text-[color:var(--text-muted)]">
          Tastatur: ←/→ blättern · F Vollbild · S Notizen · O Übersicht · Esc Übersicht/Vollbild schließen bzw. Präsentation beenden
        </p>
      </div>

      {/* Uebersichts-Grid */}
      {overview && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-navy/95 p-6"
          role="dialog"
          aria-label="Folienübersicht"
        >
          <div className="mb-4 flex items-center justify-between text-white">
            <h2 className="font-serif text-xl font-bold">Übersicht</h2>
            <button type="button" onClick={() => setOverview(false)} aria-label="Schließen" className="rounded p-2 hover:bg-white/10">
              <X aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  go(i);
                  setOverview(false);
                }}
                className={`group relative aspect-video overflow-hidden rounded-lg ring-2 transition ${
                  i === index ? 'ring-orange' : 'ring-transparent hover:ring-amber'
                }`}
              >
                <SlideView slide={s} thumbnail />
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-xs text-white">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`rounded p-2 transition ${active ? 'bg-navy text-white' : 'hover:bg-[color:var(--bg-soft)]'}`}
    >
      {children}
    </button>
  );
}
