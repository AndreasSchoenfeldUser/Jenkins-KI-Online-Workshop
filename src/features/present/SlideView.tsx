import type { ImageBlock, Slide } from '../../types';
import { RichText } from '../../components/RichText';

// Eine 16:9-Folie. Dunkle Titel-/Divider-/Summary-Folien, helle Content-Folien.
export function SlideView({ slide, thumbnail = false }: { slide: Slide; thumbnail?: boolean }) {
  const dark = slide.background === 'navy';
  const isContent = slide.kind === 'content';

  // Bilder werden getrennt vom Fliesstext in einem hoehenbegrenzten Bereich
  // gerendert, damit grosse Diagramme die 16:9-Buehne nicht ueberlaufen.
  const imageBlocks = (slide.body ?? []).filter((b): b is ImageBlock => b.kind === 'image');
  const textBlocks = (slide.body ?? []).filter((b) => b.kind !== 'image');

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

      {textBlocks.length > 0 && !thumbnail && (
        <div className={`mt-4 overflow-y-auto ${isContent ? 'text-[17px]' : 'text-lg'} ${dark ? 'slide-dark' : ''}`}>
          <RichText blocks={textBlocks} />
        </div>
      )}

      {/* Diagramme/Bilder: zentriert und hoehenbegrenzt, damit nichts abgeschnitten wird. */}
      {imageBlocks.length > 0 && !thumbnail && (
        <div className="mt-4 flex min-h-0 flex-1 items-center justify-center gap-6">
          {imageBlocks.map((b, i) => (
            <figure key={i} className="flex h-full min-h-0 flex-col items-center justify-center">
              <img src={b.src} alt={b.alt} className="max-h-full w-auto max-w-full" />
              {b.caption && (
                <figcaption className={`mt-2 text-center text-sm ${dark ? 'text-light/70' : 'text-grey'}`}>
                  {b.caption}
                </figcaption>
              )}
            </figure>
          ))}
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
