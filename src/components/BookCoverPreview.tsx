import { useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import type { BookPublication } from '../types/literary';
import { renderPdfCoverThumbnail } from '../lib/pdfSetup';

interface BookCoverPreviewProps {
  book: BookPublication;
  className?: string;
}

const TONE_CLASSES: Record<BookPublication['coverTone'], string> = {
  midnight: 'from-[#1C1A17] via-[#141311] to-[#0C0B0A]',
  obsidian: 'from-[#191816] via-[#11100E] to-[#0A0908]',
  'crimson-slate': 'from-[#231616] via-[#150F0F] to-[#0B0909]',
  'parchment-gold': 'from-[#262017] via-[#18130F] to-[#0D0A09]',
};

export function BookCoverPreview({ book, className = '' }: BookCoverPreviewProps) {
  const [renderedSrc, setRenderedSrc] = useState<string | null>(
    book.customCoverUrl || null
  );
  const [imgError, setImgError] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 50, sy: 30, hovered: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setImgError(false);
    if (book.customCoverUrl) {
      setRenderedSrc(book.customCoverUrl);
      return;
    }
    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const loadCover = async () => {
      const dataUrl = await renderPdfCoverThumbnail(book.pdfUrl, book.coverPageNumber || 1);
      if (!cancelled && dataUrl) {
        setRenderedSrc(dataUrl);
      }
    };

    const el = containerRef.current;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            void loadCover();
            observer?.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(el);
    } else {
      void loadCover();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [book.pdfUrl, book.coverPageNumber, book.customCoverUrl]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || e.pointerType !== 'mouse') return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const ry = (px - 0.5) * 14;
    const rx = (0.5 - py) * 10;
    setTilt({
      rx,
      ry,
      sx: Math.round(px * 100),
      sy: Math.round(py * 100),
      hovered: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, sx: 50, sy: 30, hovered: false });
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={
        prefersReducedMotion
          ? undefined
          : {
              transform: tilt.hovered
                ? `perspective(920px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-3px) scale3d(1.018, 1.018, 1.018)`
                : 'perspective(920px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)',
            }
      }
      className={`hardcover-book-frame relative aspect-[3/4] w-full overflow-hidden rounded-r-md rounded-l-[2px] border border-[#342E26] bg-gradient-to-b transition-transform duration-200 ease-out ${TONE_CLASSES[book.coverTone]} ${className}`}
    >
      {renderedSrc && !imgError ? (
        <img
          src={renderedSrc}
          alt={`Cover of ${book.title}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          draggable={false}
          onError={() => setImgError(true)}
          className="h-full w-full select-none object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between p-5 pl-6 text-left">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#C9A45C]/80">
            <span className="truncate">{book.language}</span>
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
          </div>
          <div className="my-auto py-3">
            <p className="font-literary text-xl font-semibold leading-snug text-[#EFEAE0] headline-balance">
              {book.title}
            </p>
            {book.subtitle ? (
              <p className="mt-2 line-clamp-2 text-xs text-[#9A9285]">{book.subtitle}</p>
            ) : null}
          </div>
          <div className="border-t border-[#C9A45C]/25 pt-2.5 text-[11px] tracking-wider text-[#C4BDB0]">
            {book.authorCreditLabel || book.author}
          </div>
        </div>
      )}

      {/* Tactile hardcover cloth spine groove */}
      <div
        aria-hidden="true"
        className="hardcover-spine-crease pointer-events-none absolute inset-y-0 left-0 w-4"
      />

      {/* Physical stacked paper edges along right edge */}
      <div
        aria-hidden="true"
        className="hardcover-page-edges pointer-events-none absolute inset-y-[3px] right-0 w-[4px] opacity-80"
      />

      {/* Directional warm brass candle sheen reacting to pointer tilt */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: tilt.hovered ? 1 : 0,
          background: `radial-gradient(circle at ${tilt.sx}% ${tilt.sy}%, rgba(255, 238, 198, 0.22) 0%, rgba(201, 164, 92, 0.08) 34%, transparent 66%)`,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-r-md ring-1 ring-inset ring-white/10"
      />
    </div>
  );
}
