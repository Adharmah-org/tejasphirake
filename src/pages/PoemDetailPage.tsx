import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Compass,
  Eye,
  EyeOff,
  Heart,
  Image as ImageIcon,
  Languages,
  Loader2,
  Moon,
  Type,
} from 'lucide-react';
import { AmbientSoundscapeToggle } from '../components/AmbientSoundscapeToggle';
import {
  CollectorFoilSeal,
  FolioCornerFiligree,
  ManuscriptDivider,
} from '../components/FolioCraft';
import { InlineSongPlayer } from '../components/InlineSongPlayer';
import { KeepsakeCardModal } from '../components/KeepsakeCardModal';
import { MarginNotesDrawer } from '../components/MarginNotesDrawer';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { useTranslation } from '../context/TranslationContext';
import { POEM_MARGIN_NOTES } from '../data/marginNotesData';
import { getMotifThreadsForPoem } from '../data/motifThreads';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { ReaderSurfaceMode } from '../types/literary';

type CompanionLang = 'off' | 'hi' | 'en';

export function PoemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { poems } = useCatalog();
  const {
    state,
    toggleFavourite,
    saveStanzaNote,
    removeStanzaNote,
    markViewed,
    setPreferences,
  } = useReader();
  const { translateTexts } = useTranslation();

  const [keepsakeOpen, setKeepsakeOpen] = useState(false);
  const [keepsakePassage, setKeepsakePassage] = useState<string | null>(null);
  const [stanzaFocus, setStanzaFocus] = useState(false);
  const [activeStanzaIdx, setActiveStanzaIdx] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteOpenIdx, setNoteOpenIdx] = useState<number | null>(null);
  const [companionLang, setCompanionLang] = useState<CompanionLang>('off');
  const [companionTranslations, setCompanionTranslations] = useState<
    Record<string, string[]>
  >({});
  const [companionLoading, setCompanionLoading] = useState(false);
  const [companionError, setCompanionError] = useState<string | null>(null);
  const [companionRetrySeq, setCompanionRetrySeq] = useState(0);

  const index = useMemo(() => poems.findIndex((p) => p.slug === slug), [poems, slug]);
  const poem = index > -1 ? poems[index] : undefined;
  const marginNotes = poem ? POEM_MARGIN_NOTES[poem.slug] ?? [] : [];
  const motifThreads = useMemo(
    () => (poem ? getMotifThreadsForPoem(poem.slug) : []),
    [poem]
  );
  const prevPoem = index > 0 ? poems[index - 1] : undefined;
  const nextPoem = index > -1 && index < poems.length - 1 ? poems[index + 1] : undefined;

  const stanzas = useMemo(() => {
    if (!poem) return [];
    return poem.body
      .split(/\n\s*\n/)
      .map((block) => block.trimEnd())
      .filter((block) => block.trim().length > 0);
  }, [poem]);

  useDocumentMeta(
    poem ? `${poem.title} | BENIYAAZ ROOH` : 'Poem Not Found',
    poem ? poem.body.slice(0, 145) : undefined
  );

  useEffect(() => {
    setActiveStanzaIdx(null);
    setNoteOpenIdx(null);
    setNoteDraft('');
    setCompanionLang('off');
    setKeepsakePassage(null);
    if (poem) {
      markViewed({
        type: 'poem',
        slug: poem.slug,
        title: poem.title,
        subtitle: `${poem.language} · ${poem.category}`,
      });
    }
  }, [poem?.slug]);

  useEffect(() => {
    if (!poem || companionLang === 'off') {
      setCompanionError(null);
      return;
    }
    const cacheKey = `${poem.slug}:${companionLang}`;
    if (companionTranslations[cacheKey]) {
      setCompanionError(null);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setCompanionLoading(true);
    setCompanionError(null);
    translateTexts(stanzas, companionLang, controller.signal)
      .then((res) => {
        if (!cancelled) {
          setCompanionTranslations((prev) => ({ ...prev, [cacheKey]: res }));
        }
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        setCompanionError(
          err instanceof Error ? err.message : 'Unable to load companion translation.'
        );
      })
      .finally(() => {
        if (!cancelled) setCompanionLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [poem, companionLang, stanzas, companionTranslations, translateTexts, companionRetrySeq]);

  if (!poem) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-literary text-3xl text-[#EFEAE0]">Poem not found</h1>
        <Link
          to="/poetry"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#C9A45C] px-5 py-2.5 text-xs font-semibold text-[#0C0B0A]"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Poetry Room
        </Link>
      </div>
    );
  }

  const isFav = state.favouritePoemIds.includes(poem.id);
  const { fontSizePx, lineHeight, surfaceMode, minimalMode } = state.preferences;

  const surfaceStyles: Record<ReaderSurfaceMode, string> = {
    midnight: 'bg-[#0B0A09] border-[#221F1B] text-[#F3EEE3]',
    ink: 'bg-[#060505] border-[#181614] text-[#E8E2D5]',
    paper: 'bg-[#EFE8DA] border-[#D4C8B0] text-[#24201B]',
  };

  const cycleSurfaceMode = () => {
    const order: ReaderSurfaceMode[] = ['midnight', 'ink', 'paper'];
    const next = order[(order.indexOf(surfaceMode) + 1) % order.length];
    setPreferences({ surfaceMode: next });
  };

  const activeCompanionLines =
    companionLang !== 'off'
      ? companionTranslations[`${poem.slug}:${companionLang}`] ?? null
      : null;

  const savedByText = new Map(
    state.savedStanzas
      .filter((s) => s.poemId === poem.id)
      .map((s) => [s.stanzaText.trim(), s])
  );

  const openKeepsakeFor = (passage: string | null) => {
    setKeepsakePassage(passage);
    setKeepsakeOpen(true);
  };

  const handleSaveStanza = (idx: number, block: string) => {
    const normalized = block.trim();
    const existing = savedByText.get(normalized);
    if (existing && noteOpenIdx !== idx) {
      removeStanzaNote(existing.id);
      return;
    }
    saveStanzaNote({
      poemId: poem.id,
      poemSlug: poem.slug,
      poemTitle: poem.title,
      stanzaText: normalized,
      note: noteDraft,
    });
    setNoteOpenIdx(null);
    setNoteDraft('');
  };

  return (
    <div
      className={
        minimalMode
          ? 'fixed inset-0 z-50 overflow-y-auto bg-[#090807] px-4 py-10 pb-24 sm:px-6 sm:pb-12'
          : 'mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6 sm:py-16 sm:pb-16'
      }
    >
      <ScrollProgressHairline />

      {/* Top Action Strip: streamlined on mobile, rich controls on sm+ */}
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        {minimalMode ? (
          <button
            type="button"
            onClick={() => setPreferences({ minimalMode: false })}
            className="inline-flex items-center gap-2 rounded border border-[#2B2823] bg-[#141311] px-3.5 py-2 text-xs text-[#DEC07C]"
          >
            <EyeOff className="h-3.5 w-3.5" /> Exit Minimal Mode
          </button>
        ) : (
          <Link
            to="/poetry"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#9A9285] hover:text-[#DEC07C]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Poetry Room
          </Link>
        )}

        {/* Quick Mobile-Visible Focus & Companion Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStanzaFocus((v) => !v);
              if (stanzaFocus) setActiveStanzaIdx(null);
            }}
            aria-pressed={stanzaFocus}
            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap ${
              stanzaFocus
                ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#DEC07C]'
                : 'border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:border-[#C9A45C]/50'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Stanza Focus</span>
          </button>

          {poem.language !== 'English' && (
            <div
              data-no-translate="true"
              className="flex items-center gap-0.5 rounded border border-[#2B2823] bg-[#141311] p-1 text-[11px]"
              role="group"
              aria-label="Dual-script companion translation"
            >
              <Languages className="ml-1 mr-0.5 h-3 w-3 text-[#C9A45C]" />
              {(['off', 'hi', 'en'] as CompanionLang[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setCompanionLang(lang)}
                  className={`rounded px-2 py-0.5 uppercase transition-colors ${
                    companionLang === lang
                      ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                      : 'text-[#9A9285] hover:text-[#EFEAE0]'
                  }`}
                >
                  {lang === 'off' ? 'Orig' : lang}
                </button>
              ))}
            </div>
          )}

          <AmbientSoundscapeToggle compact />
        </div>

        {/* Full Typography & Calm Surface Controls (Desktop/Tablet inline, mobile handled by Bottom Dock) */}
        <div className="hidden w-full flex-wrap items-center justify-end gap-2 sm:flex">
          <div className="flex items-center gap-1 rounded border border-[#2B2823] bg-[#141311] p-1">
            <Type className="ml-1.5 h-3.5 w-3.5 text-[#9A9285]" />
            <button
              type="button"
              onClick={() =>
                setPreferences({ fontSizePx: Math.max(15, fontSizePx - 1) })
              }
              aria-label="Decrease font size"
              className="rounded px-2 py-1 text-xs text-[#C4BDB0] hover:text-[#DEC07C]"
            >
              A-
            </button>
            <span className="text-[11px] tabular-nums text-[#9A9285]">{fontSizePx}</span>
            <button
              type="button"
              onClick={() =>
                setPreferences({ fontSizePx: Math.min(26, fontSizePx + 1) })
              }
              aria-label="Increase font size"
              className="rounded px-2 py-1 text-xs text-[#C4BDB0] hover:text-[#DEC07C]"
            >
              A+
            </button>
          </div>

          <div
            className="flex items-center gap-1 rounded border border-[#2B2823] bg-[#141311] p-1 text-xs"
            role="group"
            aria-label="Line spacing"
          >
            {[
              { label: 'Compact', value: 1.65 },
              { label: 'Balanced', value: 1.9 },
              { label: 'Airy', value: 2.15 },
            ].map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => setPreferences({ lineHeight: sp.value })}
                className={`rounded px-2 py-1 text-[11px] transition-colors ${
                  Math.abs(lineHeight - sp.value) < 0.08
                    ? 'bg-[#26231E] text-[#DEC07C]'
                    : 'text-[#9A9285] hover:text-[#EFEAE0]'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded border border-[#2B2823] bg-[#141311] p-1 text-xs">
            {(['midnight', 'ink', 'paper'] as ReaderSurfaceMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreferences({ surfaceMode: mode })}
                className={`rounded px-2.5 py-1 capitalize transition-colors ${
                  surfaceMode === mode
                    ? 'bg-[#C9A45C] font-medium text-[#0C0B0A]'
                    : 'text-[#9A9285] hover:text-[#EFEAE0]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {!minimalMode && (
            <button
              type="button"
              onClick={() => setPreferences({ minimalMode: true })}
              className="rounded border border-[#2B2823] bg-[#141311] px-3 py-1.5 text-xs text-[#C4BDB0] hover:border-[#C9A45C]/60 hover:text-[#DEC07C]"
            >
              Minimal Mode
            </button>
          )}
        </div>
      </div>

      {/* Main Protected Poem Reading Plate */}
      <ProtectedReadingSurface
        showWatermark
        enableFocusVeil
        className="mx-auto mt-6 max-w-3xl sm:mt-8"
      >
        <article
          className={`folio-frame relative rounded-md border p-6 transition-colors sm:p-12 ${
            surfaceMode !== 'paper' ? 'collector-folio-plate' : ''
          } ${surfaceStyles[surfaceMode]}`}
        >
          <FolioCornerFiligree surface={surfaceMode} />
          <header
            className={`border-b pb-6 ${
              surfaceMode === 'paper' ? 'border-[#DDD3C0]' : 'border-[#2B2823]'
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#C9A45C]">
              {poem.number ? (
                <span className="tabular-nums">
                  No. {String(poem.number).padStart(2, '0')}
                </span>
              ) : null}
              {poem.number ? <span aria-hidden="true">·</span> : null}
              <span>{poem.language}</span>
              <span aria-hidden="true">·</span>
              <span>{poem.category}</span>
              {poem.dateLabel ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{poem.dateLabel}</span>
                </>
              ) : null}
            </div>

            <h1 className="mt-3 font-literary text-3xl font-semibold leading-tight headline-balance sm:text-5xl">
              {poem.title}
            </h1>
            {poem.englishSubtitle && (
              <p
                className={`mt-1.5 text-xs tracking-wide ${
                  surfaceMode === 'paper' ? 'text-[#6A5F52]' : 'text-[#9A9285]'
                }`}
              >
                {poem.englishSubtitle}
              </p>
            )}
            {poem.partName && (
              <p
                className={`mt-2 text-xs ${
                  surfaceMode === 'paper' ? 'text-[#6A5F52]' : 'text-[#9A9285]'
                }`}
              >
                {poem.partName}
              </p>
            )}
          </header>

          {poem.dedication && (
            <div
              className={`editorial-justify mt-6 border-b pb-5 font-literary text-base italic leading-relaxed whitespace-pre-line ${
                surfaceMode === 'paper'
                  ? 'border-[#DDD3C0] text-[#443C32]'
                  : 'border-[#2B2823] text-[#C4BDB0]'
              }`}
            >
              {poem.dedication}
            </div>
          )}

          {companionLang !== 'off' && (
            <div
              data-no-translate="true"
              className={`mt-5 flex items-center justify-between border-b pb-2.5 text-[11px] ${
                surfaceMode === 'paper'
                  ? 'border-[#DDD3C0] text-[#6A5F52]'
                  : 'border-[#2B2823] text-[#9A9285]'
              }`}
            >
              <span>
                Bilingual Folio · Original + {companionLang === 'hi' ? 'Hindi' : 'English'} meaning beneath each stanza
              </span>
              {companionLoading ? (
                <span className="inline-flex items-center gap-1 text-[#C9A45C]">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading
                </span>
              ) : companionError ? (
                <button
                  type="button"
                  onClick={() => setCompanionRetrySeq((n) => n + 1)}
                  className="inline-flex items-center gap-1 text-amber-300 underline hover:text-[#DEC07C]"
                >
                  Retry translation
                </button>
              ) : null}
            </div>
          )}

          <div className="mx-auto max-w-2xl space-y-6 py-8">
            {stanzas.map((block, idx) => {
              const isSelected = activeStanzaIdx === idx;
              const isDimmed =
                stanzaFocus && activeStanzaIdx !== null && activeStanzaIdx !== idx;
              const savedEntry = savedByText.get(block.trim());
              const companionText = activeCompanionLines?.[idx];

              return (
                <div
                  key={idx}
                  onClick={() =>
                    setActiveStanzaIdx((prev) => (prev === idx ? null : idx))
                  }
                  className={`group relative cursor-pointer rounded-md px-3 py-2.5 -mx-3 transition-all duration-200 ${
                    isSelected
                      ? surfaceMode === 'paper'
                        ? 'bg-[#EBE2CE]/70 ring-1 ring-[#C9A45C]/45'
                        : 'bg-[#1B1915]/85 ring-1 ring-[#C9A45C]/35'
                      : surfaceMode === 'paper'
                        ? 'hover:bg-[#EFE8DA]/55'
                        : 'hover:bg-[#191714]/50'
                  } ${isDimmed ? 'opacity-40 hover:opacity-85' : 'opacity-100'}`}
                >
                  <pre
                    className="devanagari-verse whitespace-pre-wrap break-words font-normal"
                    style={{ fontSize: `${fontSizePx}px`, lineHeight }}
                  >
                    {block}
                  </pre>

                  {companionText && companionText.trim() !== block.trim() && (
                    <p
                      data-no-translate="true"
                      className={`devanagari-verse mt-2.5 border-t pt-2 font-literary text-sm italic leading-relaxed whitespace-pre-line ${
                        surfaceMode === 'paper'
                          ? 'border-[#D8CCB7] text-[#5B5247]'
                          : 'border-[#2B2823] text-[#C4BDB0]'
                      }`}
                    >
                      {companionText}
                    </p>
                  )}

                  {savedEntry?.note && (
                    <p
                      data-no-translate="true"
                      className={`mt-2 text-xs italic ${
                        surfaceMode === 'paper' ? 'text-[#7A5D28]' : 'text-[#DEC07C]'
                      }`}
                    >
                      Note: “{savedEntry.note}”
                    </p>
                  )}

                  {isSelected && (
                    <div
                      data-no-translate="true"
                      onClick={(e) => e.stopPropagation()}
                      className={`mt-3 flex flex-wrap items-center gap-2 border-t pt-2.5 text-[11px] ${
                        surfaceMode === 'paper'
                          ? 'border-[#D8CCB7]'
                          : 'border-[#2B2823]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSaveStanza(idx, block)}
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-1 font-medium transition-colors ${
                          savedEntry
                            ? 'bg-[#C9A45C] text-[#0C0B0A]'
                            : surfaceMode === 'paper'
                              ? 'border border-[#C9A45C]/60 bg-[#FAF6EC] text-[#5B451B]'
                              : 'border border-[#2B2823] bg-[#0C0B0A] text-[#DEC07C] hover:border-[#C9A45C]'
                        }`}
                      >
                        {savedEntry ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Line Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-3 w-3" />
                            <span>Save Line</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNoteOpenIdx((prev) => (prev === idx ? null : idx));
                          setNoteDraft(savedEntry?.note || '');
                        }}
                        className={`rounded border px-2.5 py-1 transition-colors ${
                          surfaceMode === 'paper'
                            ? 'border-[#D5C9B4] text-[#5B5247] hover:border-[#8C6828]'
                            : 'border-[#2B2823] text-[#9A9285] hover:text-[#EFEAE0]'
                        }`}
                      >
                        {savedEntry?.note ? 'Edit Note' : 'Add Reflection'}
                      </button>

                      <button
                        type="button"
                        onClick={() => openKeepsakeFor(block)}
                        className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 transition-colors ${
                          surfaceMode === 'paper'
                            ? 'border-[#D5C9B4] text-[#5B5247] hover:border-[#8C6828]'
                            : 'border-[#2B2823] text-[#C4BDB0] hover:border-[#C9A45C] hover:text-[#DEC07C]'
                        }`}
                      >
                        <ImageIcon className="h-3 w-3" />
                        <span>Card from Stanza</span>
                      </button>
                    </div>
                  )}

                  {isSelected && noteOpenIdx === idx && (
                    <div
                      data-no-translate="true"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2.5 flex flex-col gap-2 sm:flex-row"
                    >
                      <input
                        type="text"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Write a brief personal reflection for My Bookshelf..."
                        className={`h-8 flex-1 rounded border px-2.5 text-xs focus:outline-none ${
                          surfaceMode === 'paper'
                            ? 'border-[#CEC2AD] bg-[#FAF6EC] text-[#1E1A16]'
                            : 'border-[#2B2823] bg-[#0C0B0A] text-[#EFEAE0] focus:border-[#C9A45C]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          saveStanzaNote({
                            poemId: poem.id,
                            poemSlug: poem.slug,
                            poemTitle: poem.title,
                            stanzaText: block,
                            note: noteDraft,
                          });
                          setNoteOpenIdx(null);
                        }}
                        className="h-8 rounded bg-[#C9A45C] px-3 text-xs font-semibold text-[#0C0B0A] hover:bg-[#DEC07C]"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <ManuscriptDivider surface={surfaceMode} className="mb-6" />
          <footer>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-2">
                <CollectorFoilSeal surface={surfaceMode} compact />
                <p
                  className={`text-xs ${
                    surfaceMode === 'paper' ? 'text-[#6A5F52]' : 'text-[#9A9285]'
                  }`}
                >
                  TEJAS · BENIYAAZ ROOH
                  {poem.sourcePublicationSlug && poem.sourceTitle ? (
                    <>
                      {' · '}
                      <Link
                        to={`/books/${poem.sourcePublicationSlug}`}
                        className="text-[#C9A45C] hover:underline"
                      >
                        {poem.sourceTitle}
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openKeepsakeFor(null)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded border px-3.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    surfaceMode === 'paper'
                      ? 'border-[#CEC2AD] bg-[#EFE8DA] text-[#3B2B14] hover:border-[#8C6828]'
                      : 'border-[#C9A45C]/45 bg-[#1B1813] text-[#DEC07C] hover:border-[#DEC07C]'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Ek Panna Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavourite(poem.id)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded border px-3.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    isFav
                      ? 'border-[#C9A45C] bg-[#C9A45C] text-[#0C0B0A]'
                      : surfaceMode === 'paper'
                        ? 'border-[#CEC2AD] text-[#1E1A16] hover:border-[#C9A45C]'
                        : 'border-[#2B2823] text-[#EFEAE0] hover:border-[#C9A45C]'
                  }`}
                >
                  {isFav ? (
                    <BookmarkCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Heart className="h-3.5 w-3.5" />
                  )}
                  <span>{isFav ? 'Saved to Bookshelf' : 'Save Poem'}</span>
                </button>
              </div>
            </div>

            {marginNotes.length > 0 && (
              <MarginNotesDrawer notes={marginNotes} surface={surfaceMode} />
            )}

            {poem.songs && poem.songs.length > 0 && (
              <div
                className={`mt-6 border-t pt-5 ${
                  surfaceMode === 'paper' ? 'border-[#DDD3C0]' : 'border-[#2B2823]'
                }`}
              >
                <p className="text-xs font-medium text-[#C9A45C]">Companion Song</p>
                <div className="mt-3 space-y-2.5">
                  {poem.songs.map((song) => (
                    <InlineSongPlayer
                      key={song.title}
                      song={song}
                      surface={surfaceMode === 'paper' ? 'paper' : 'midnight'}
                    />
                  ))}
                </div>
              </div>
            )}
          </footer>
        </article>
      </ProtectedReadingSurface>

      {/* Connected Motif Threads */}
      {motifThreads.length > 0 && (
        <section className="mx-auto mt-10 max-w-3xl rounded-md border border-[#2B2823] bg-[#12110F] p-5 sm:p-6">
          {motifThreads.slice(0, 1).map((thread) => (
            <div key={thread.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B2823] pb-3">
                <div className="flex items-center gap-2 text-xs text-[#C9A45C]">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Connected Thread · {thread.devanagariLabel}</span>
                </div>
                <span className="text-xs text-[#9A9285]">{thread.title}</span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-[#C4BDB0]">
                {thread.description}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {thread.targets.map((target) => (
                  <Link
                    key={target.to}
                    to={target.to}
                    className="group rounded border border-[#2B2823] bg-[#0C0B0A] p-3 transition-colors hover:border-[#C9A45C]/50"
                  >
                    <p className="text-[11px] text-[#9A9285]">{target.meta}</p>
                    <p className="devanagari-verse mt-1 truncate text-xs font-medium text-[#EFEAE0] group-hover:text-[#DEC07C]">
                      {target.label}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Previous / Next Poem Navigation */}
      <nav
        aria-label="Adjacent poems"
        className="mx-auto mt-8 flex max-w-3xl items-center justify-between gap-4 text-xs"
      >
        {prevPoem ? (
          <Link
            to={`/poetry/${prevPoem.slug}`}
            className="inline-flex items-center gap-2 text-[#C4BDB0] hover:text-[#DEC07C]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="max-w-[140px] truncate sm:max-w-xs">{prevPoem.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {nextPoem ? (
          <Link
            to={`/poetry/${nextPoem.slug}`}
            className="inline-flex items-center gap-2 text-right text-[#C4BDB0] hover:text-[#DEC07C]"
          >
            <span className="max-w-[140px] truncate sm:max-w-xs">{nextPoem.title}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {/* Compact Mobile Bottom Reading Dock (<= 52px high, strictly within 15% mobile cap) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2B2823] bg-[#0E0D0B]/95 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex h-13 max-w-lg items-center justify-between px-2 text-xs">
          {prevPoem ? (
            <Link
              to={`/poetry/${prevPoem.slug}`}
              aria-label="Previous poem"
              className="inline-flex h-10 w-10 items-center justify-center rounded text-[#C4BDB0] hover:text-[#DEC07C]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span className="w-10" />
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setPreferences({ fontSizePx: Math.max(15, fontSizePx - 1) })
              }
              aria-label="Smaller text"
              className="h-9 rounded px-2 text-[#C4BDB0] hover:text-[#DEC07C]"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() =>
                setPreferences({ fontSizePx: Math.min(26, fontSizePx + 1) })
              }
              aria-label="Larger text"
              className="h-9 rounded px-2 text-[#C4BDB0] hover:text-[#DEC07C]"
            >
              A+
            </button>
          </div>

          <button
            type="button"
            onClick={cycleSurfaceMode}
            className="h-9 rounded border border-[#2B2823] bg-[#141311] px-2.5 text-[11px] capitalize text-[#DEC07C]"
          >
            {surfaceMode}
          </button>

          <button
            type="button"
            onClick={() => toggleFavourite(poem.id)}
            aria-label={isFav ? 'Saved' : 'Save poem'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded ${
              isFav ? 'text-[#C9A45C]' : 'text-[#C4BDB0]'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => openKeepsakeFor(null)}
            aria-label="Open Ek Panna card"
            className="inline-flex h-9 w-9 items-center justify-center rounded text-[#DEC07C]"
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          {nextPoem ? (
            <Link
              to={`/poetry/${nextPoem.slug}`}
              aria-label="Next poem"
              className="inline-flex h-10 w-10 items-center justify-center rounded text-[#C4BDB0] hover:text-[#DEC07C]"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="w-10" />
          )}
        </div>
      </div>

      <KeepsakeCardModal
        open={keepsakeOpen}
        onClose={() => {
          setKeepsakeOpen(false);
          setKeepsakePassage(null);
        }}
        title={poem.title}
        text={poem.body}
        sourceLabel={poem.sourceTitle}
        slug={poem.slug}
        initialPassage={keepsakePassage}
      />
    </div>
  );
}
