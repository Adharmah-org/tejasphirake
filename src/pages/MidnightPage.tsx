import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Highlighter,
  Image as ImageIcon,
  Languages,
  Moon,
  Shuffle,
} from 'lucide-react';
import { AmbientSoundscapeToggle } from '../components/AmbientSoundscapeToggle';
import {
  CollectorFoilSeal,
  FolioCornerFiligree,
  ManuscriptDivider,
} from '../components/FolioCraft';
import { KeepsakeCardModal } from '../components/KeepsakeCardModal';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useTranslation } from '../context/TranslationContext';
import { MIDNIGHT_EXCERPTS } from '../data/midnightExcerpts';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { MidnightExcerpt } from '../types/literary';

type SourceFilter = 'all' | MidnightExcerpt['sourceType'];

const SOURCE_FILTERS: { key: SourceFilter; label: string }[] = [
  { key: 'all', label: 'All Highlights' },
  { key: 'poem', label: 'Poetry' },
  { key: 'book', label: 'Books' },
  { key: 'theatre', label: 'Theatre' },
  { key: 'journal', label: 'Journal' },
];

function renderHighlightedQuote(
  quote: string,
  highlightLine: string | undefined,
  enabled: boolean
): ReactNode {
  if (!enabled || !highlightLine) {
    return quote;
  }

  const idx = quote.indexOf(highlightLine);
  if (idx === -1) {
    return quote;
  }

  const before = quote.slice(0, idx);
  const match = quote.slice(idx, idx + highlightLine.length);
  const after = quote.slice(idx + highlightLine.length);

  return (
    <>
      {before}
      <mark className="inline rounded-sm bg-[#C9A45C]/18 px-1.5 py-0.5 text-[#FFF8EA] shadow-[inset_0_-1px_0_rgba(222,192,124,0.65)]">
        {match}
      </mark>
      {after}
    </>
  );
}

export function MidnightPage() {
  useDocumentMeta(
    'The Midnight Page: Featured Published Excerpts',
    'Rotating verbatim excerpts and highlights from the novels, play, notes, and poems of Tejas Purvesh Phirake.'
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const excerptId = searchParams.get('excerpt');
  const shouldReduceMotion = useReducedMotion();
  const spotlightRef = useRef<HTMLDivElement>(null);

  const initialIndex = useMemo(() => {
    if (excerptId) {
      const idx = MIDNIGHT_EXCERPTS.findIndex((e) => e.id === excerptId);
      if (idx >= 0) return idx;
    }
    return 0;
  }, [excerptId]);

  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (!excerptId) return;
    const idx = MIDNIGHT_EXCERPTS.findIndex((e) => e.id === excerptId);
    if (idx >= 0) {
      setIndex(idx);
    }
  }, [excerptId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        setIndex((prev) => (prev + 1) % MIDNIGHT_EXCERPTS.length);
      } else if (e.key === 'ArrowLeft') {
        setIndex(
          (prev) => (prev - 1 + MIDNIGHT_EXCERPTS.length) % MIDNIGHT_EXCERPTS.length
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const { langMode: translationMode, setLangMode: setTranslationMode } = useTranslation();
  const [showHighlights, setShowHighlights] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [keepsakeOpen, setKeepsakeOpen] = useState(false);

  const current = MIDNIGHT_EXCERPTS[index] || MIDNIGHT_EXCERPTS[0];

  const activeQuote = useMemo(() => {
    if (translationMode === 'hi') return current.translations.hi;
    if (translationMode === 'en') return current.translations.en;
    return current.quote;
  }, [current, translationMode]);

  const activeHighlightLine = useMemo(() => {
    if (translationMode === 'hi') return current.translations.highlightLineHi;
    if (translationMode === 'en') return current.translations.highlightLineEn;
    return current.highlightLine;
  }, [current, translationMode]);

  const activeLanguageLabel = useMemo(() => {
    if (translationMode === 'hi') return 'हिंदी Translation';
    if (translationMode === 'en') return 'English Translation';
    return current.language;
  }, [current.language, translationMode]);

  const goTo = (nextIdx: number, scrollToSpotlight = false) => {
    const wrapped = (nextIdx + MIDNIGHT_EXCERPTS.length) % MIDNIGHT_EXCERPTS.length;
    setIndex(wrapped);
    const next = new URLSearchParams(searchParams);
    next.set('excerpt', MIDNIGHT_EXCERPTS[wrapped].id);
    setSearchParams(next);

    if (scrollToSpotlight && spotlightRef.current) {
      spotlightRef.current.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  const pickRandom = () => {
    if (MIDNIGHT_EXCERPTS.length <= 1) return;
    let nextIdx = index;
    while (nextIdx === index) {
      nextIdx = Math.floor(Math.random() * MIDNIGHT_EXCERPTS.length);
    }
    goTo(nextIdx);
  };

  const toggleViceVersaTranslate = () => {
    if (translationMode === 'original') {
      // If original is already English, translate to Hindi first; otherwise translate to English first
      setTranslationMode(current.language === 'English' ? 'hi' : 'en');
      return;
    }
    // Toggle cleanly between Hindi <-> English
    setTranslationMode(translationMode === 'en' ? 'hi' : 'en');
  };

  const viceVersaLabel = useMemo(() => {
    if (translationMode === 'hi') return 'Switch to English';
    if (translationMode === 'en') return 'हिंदी में बदलें';
    return current.language === 'English'
      ? 'Translate → हिंदी'
      : 'Translate → English';
  }, [current.language, translationMode]);

  const filteredHighlights = useMemo(() => {
    return MIDNIGHT_EXCERPTS.map((item, originalIdx) => ({ item, originalIdx })).filter(
      ({ item }) => sourceFilter === 'all' || item.sourceType === sourceFilter
    );
  }, [sourceFilter]);

  const filterCounts = useMemo(() => {
    const counts: Record<SourceFilter, number> = {
      all: MIDNIGHT_EXCERPTS.length,
      poem: 0,
      book: 0,
      theatre: 0,
      journal: 0,
    };
    for (const item of MIDNIGHT_EXCERPTS) {
      counts[item.sourceType] = (counts[item.sourceType] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2B2823] pb-8 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#C9A45C]">
          <Moon className="h-3.5 w-3.5" />
          <span>Midnight Excerpts · {MIDNIGHT_EXCERPTS.length} Passages</span>
        </div>
        <h1 className="mt-2.5 font-literary text-4xl font-medium text-[#EFEAE0] headline-balance sm:text-5xl">
          The Midnight Page
        </h1>
        <p className="editorial-justify mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#C4BDB0]">
          Selected late-night lines, dialogues, and turning points curated from published novels,
          three-act Marathi theatre, illustrated booklets, and multilingual poetry, complete with
          line-preserving Hindi and English translations.
        </p>
      </header>

      {/* Main Protected Editorial Plate */}
      <div ref={spotlightRef} className="relative mt-10 scroll-mt-24">
        <ProtectedReadingSurface showWatermark enableFocusVeil className="relative">
          <section className="collector-folio-plate folio-frame relative overflow-hidden rounded-md border border-[#2B2823] bg-[#141311] p-5 sm:p-11">
            <FolioCornerFiligree />
            {/* Meta Row (zero pill borders or Sparkles icons) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2823] pb-4 text-xs">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {current.highlightTag && (
                  <>
                    <span className="font-medium text-[#DEC07C]">
                      {current.highlightTag}
                    </span>
                    <span aria-hidden="true" className="text-[#9A9285]">·</span>
                  </>
                )}
                <span className="capitalize text-[#9A9285]">
                  {current.sourceType} · {activeLanguageLabel}
                  {current.pageLabel ? ` · ${current.pageLabel}` : ''}
                </span>
              </div>
              <span className="shrink-0 tabular-nums text-[#9A9285]">
                Highlight {index + 1} of {MIDNIGHT_EXCERPTS.length}
              </span>
            </div>

            {/* Clean Hairline Utility Strip (flattened, not nested inside another card) */}
            <div
              data-no-translate="true"
              className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#2B2823] py-3.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleViceVersaTranslate}
                  data-testid="midnight-translate-toggle"
                  className="inline-flex h-8 items-center gap-1.5 rounded border border-[#C9A45C]/55 bg-[#1C1A17] px-3 text-xs font-medium text-[#DEC07C] transition-colors hover:border-[#DEC07C]"
                >
                  <Languages className="h-3.5 w-3.5 shrink-0" />
                  <span>{viceVersaLabel}</span>
                </button>

                <div
                  role="group"
                  aria-label="Passage language selector"
                  className="inline-flex items-center rounded border border-[#2B2823] bg-[#0C0B0A] p-0.5 text-[11px]"
                >
                  <button
                    type="button"
                    onClick={() => setTranslationMode('original')}
                    aria-pressed={translationMode === 'original'}
                    className={`rounded px-2.5 py-1 transition-colors ${
                      translationMode === 'original'
                        ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                        : 'text-[#C4BDB0] hover:text-[#EFEAE0]'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranslationMode('hi')}
                    aria-pressed={translationMode === 'hi'}
                    className={`rounded px-2.5 py-1 transition-colors ${
                      translationMode === 'hi'
                        ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                        : 'text-[#C4BDB0] hover:text-[#EFEAE0]'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranslationMode('en')}
                    aria-pressed={translationMode === 'en'}
                    className={`rounded px-2.5 py-1 transition-colors ${
                      translationMode === 'en'
                        ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                        : 'text-[#C4BDB0] hover:text-[#EFEAE0]'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <AmbientSoundscapeToggle compact />
                <button
                  type="button"
                  onClick={() => setShowHighlights((v) => !v)}
                  aria-pressed={showHighlights}
                  className={`inline-flex h-9 items-center gap-1.5 rounded border px-2.5 text-[11px] transition-colors whitespace-nowrap ${
                    showHighlights
                      ? 'border-[#C9A45C]/50 bg-[#C9A45C]/12 text-[#DEC07C]'
                      : 'border-[#2B2823] bg-[#0C0B0A] text-[#9A9285] hover:text-[#C4BDB0]'
                  }`}
                >
                  <Highlighter className="h-3.5 w-3.5 shrink-0" />
                  <span>{showHighlights ? 'Key Line Highlighted' : 'Highlight Key Line'}</span>
                </button>
              </div>
            </div>

            {translationMode !== 'original' && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9A9285]">
                <span>
                  Showing {translationMode === 'hi' ? 'हिंदी' : 'English'} translation of
                  original ({current.language}) text
                </span>
                <button
                  type="button"
                  onClick={() => setTranslationMode('original')}
                  className="text-[#DEC07C] underline-offset-4 hover:underline"
                >
                  Back to Original
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.blockquote
                key={`${current.id}-${translationMode}`}
                data-no-translate="true"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                className="my-8 sm:my-10"
              >
                <pre className="devanagari-verse max-w-full whitespace-pre-wrap break-words font-literary text-xl leading-[1.9] text-[#EFEAE0] sm:text-2xl">
                  {renderHighlightedQuote(activeQuote, activeHighlightLine, showHighlights)}
                </pre>
              </motion.blockquote>
            </AnimatePresence>

            <ManuscriptDivider className="mt-2 mb-5" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1.5">
                <p className="devanagari-verse text-sm font-medium text-[#DEC07C]">
                  {current.sourceTitle}
                </p>
                <CollectorFoilSeal compact />
              </div>
              <Link
                to={`/moods?mood=${current.moodKey}`}
                className="text-xs font-medium text-[#C9A45C] hover:text-[#DEC07C] hover:underline"
              >
                Explore Mood Archive →
              </Link>
            </div>

            {/* Navigation Actions */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  className="inline-flex h-10 items-center gap-1.5 rounded border border-[#2B2823] bg-[#0C0B0A] px-3.5 text-xs text-[#C4BDB0] hover:border-[#C9A45C]/60 hover:text-[#EFEAE0]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  className="inline-flex h-10 items-center gap-1.5 rounded border border-[#2B2823] bg-[#0C0B0A] px-3.5 text-xs text-[#C4BDB0] hover:border-[#C9A45C]/60 hover:text-[#EFEAE0]"
                >
                  <span>Next</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={pickRandom}
                  className="inline-flex h-10 items-center gap-1.5 rounded border border-[#2B2823] bg-[#0C0B0A] px-3.5 text-xs text-[#DEC07C] hover:border-[#C9A45C]"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  <span>Another Page</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setKeepsakeOpen(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded border border-[#C9A45C]/55 bg-[#1B1813] px-4 text-xs font-medium text-[#DEC07C] transition-colors hover:border-[#DEC07C] whitespace-nowrap"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Ek Panna Card</span>
                </button>

                <Link
                  to={current.targetUrl}
                  className="inline-flex h-10 items-center gap-1.5 rounded bg-[#C9A45C] px-4 text-xs font-semibold text-[#0C0B0A] hover:bg-[#DEC07C] whitespace-nowrap"
                >
                  <span>Read in Context</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </ProtectedReadingSurface>
      </div>

      {/* Midnight Highlights Grid */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2B2823] pb-4">
          <div>
            <p className="text-xs font-medium text-[#C9A45C]">
              All Excerpts
            </p>
            <h2 className="mt-1 font-literary text-2xl font-medium text-[#EFEAE0] sm:text-3xl">
              Selected Excerpts ({filteredHighlights.length})
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter midnight highlights by category"
            className="flex flex-wrap gap-1.5"
          >
            {SOURCE_FILTERS.map((filter) => {
              const isSelected = sourceFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSourceFilter(filter.key)}
                  className={`rounded border px-3 py-1.5 text-xs tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'border-[#C9A45C] bg-[#C9A45C]/16 font-medium text-[#DEC07C]'
                      : 'border-[#2B2823] bg-[#141311] text-[#9A9285] hover:border-[#3A352E] hover:text-[#EFEAE0]'
                  }`}
                >
                  {filter.label} ({filterCounts[filter.key]})
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredHighlights.map(({ item, originalIdx }) => {
            const isActive = originalIdx === index;
            const previewLine =
              translationMode === 'hi'
                ? item.translations.highlightLineHi || item.translations.hi
                : translationMode === 'en'
                  ? item.translations.highlightLineEn || item.translations.en
                  : item.highlightLine || item.quote;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(originalIdx, true)}
                className={`group collector-folio-plate relative flex min-w-0 flex-col justify-between rounded-md border p-5 text-left transition-colors ${
                  isActive
                    ? 'border-[#C9A45C]/80 bg-[#1C1A17]'
                    : 'border-[#2B2823] bg-[#141311] hover:border-[#C9A45C]/45 hover:bg-[#191714]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-[#C9A45C]">
                      {item.highlightTag || item.sourceType}
                    </span>
                    <span className="tabular-nums text-[#9A9285]">
                      #{originalIdx + 1} · {item.language}
                    </span>
                  </div>

                  <p
                    data-no-translate="true"
                    className="devanagari-verse mt-3 font-literary text-base leading-relaxed text-[#EFEAE0] sm:text-lg"
                  >
                    “{previewLine}”
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#2B2823] pt-3">
                  <div className="min-w-0">
                    <p
                      className={`devanagari-verse truncate text-xs font-medium ${
                        isActive ? 'text-[#DEC07C]' : 'text-[#C4BDB0]'
                      }`}
                    >
                      {item.sourceTitle}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] capitalize text-[#9A9285]">
                      {item.sourceType}
                      {item.pageLabel ? ` · ${item.pageLabel}` : ''}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[#9A9285] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#DEC07C]" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <KeepsakeCardModal
        open={keepsakeOpen}
        onClose={() => setKeepsakeOpen(false)}
        title={current.sourceTitle}
        text={activeQuote}
        sourceLabel={current.pageLabel ? `${current.sourceType} · ${current.pageLabel}` : current.sourceType}
        slug={current.id}
      />
    </div>
  );
}
