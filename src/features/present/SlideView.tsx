import type { Slide } from '../../types';
import { RichText } from '../../components/RichText';

// Eine 16:9-Folie. Dunkle Titel-/Divider-/Summary-Folien, helle Content-Folien.
export function SlideView({ slide, thumbnail = false }: { slide: Slide; thumbnail?: boolean }) {
  const dark = slide.background === 'navy';
  const isContent = slide.kind === 'content';

  return (
    <div
      className={`flex h-full w-full flex-col ${dark ? 'bg-navy text-white' : 'bg-white text-ink'} ${
        thumbnail ? 'p-3' : 'p-8 md:p-12'
      } ${slide.kind === 'title' || slide.kind === 'divider' || slide.kind === 'summary' ? 'justify-center' : ''}`}
    >
      {slide.kicker && (
        <p
          className={`font-semibold uppercase tracking-wide ${dark ? 'text-amber' : 'text-orange'} ${
            thumbnail ? 'text-[8px]' : 'text-sm'
          }`}
        >
          {slide.kicker}
        </p>
      )}
      <h2
        className={`font-serif font-bold ${dark ? 'text-white' : 'text-navy'} ${
          thumbnail ? 'text-[13px] leading-tight' : 'mt-2 text-3xl md:text-4xl'
        }`}
      >
        {slide.title}
      </h2>

      {slide.body && !thumbnail && (
        <div className={`mt-4 overflow-y-auto ${isContent ? 'text-[17px]' : 'text-lg'} ${dark ? 'slide-dark' : ''}`}>
          <RichText blocks={slide.body} />
        </div>
      )}

      {/* Titelfolie: Topologie-Grafik als Hero, hoehenbegrenzt (kein Ueberlauf der Buehne) */}
      {slide.kind === 'title' && !thumbnail && (
        <div className="mt-6 flex min-h-0 flex-1 items-center justify-center">
          <img
            src="./assets/banner.svg"
            alt="Topologie: Controller (host1) orchestriert die Agenten host2 (maven) und host4 (pytest); beide wirken auf das Deployment-Ziel host3."
            className="max-h-full w-auto max-w-[78%]"
          />
        </div>
      )}

      {/* Dezenter Akzent statt Accent-Stripe-Motiv */}
      {(slide.kind === 'title' || slide.kind === 'divider') && !thumbnail && (
        <span className="mt-6 inline-block h-1 w-16 rounded bg-orange" aria-hidden />
      )}

      {/* Markenzeichen auf Titel- und Abschlussfolie */}
      {(slide.kind === 'title' || slide.kind === 'summary') && !thumbnail && (
        <div className="mt-auto flex items-center gap-2 pt-6 text-sm text-light/80">
          <span>Comquent GmbH</span>
          <img
            src="./assets/comquent-logo.webp"
            alt="Comquent GmbH"
            style={{ height: 24 }}
            className="w-auto"
          />
        </div>
      )}
    </div>
  );
}
