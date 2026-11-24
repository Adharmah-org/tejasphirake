import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAnimate, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Maximize2,
  Minimize2,
  Moon,
  RotateCcw,
  ScrollText,
  Square,
  Sun,
  Volume2,
  VolumeX,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { disposePdfDocument, pdfjsLib } from '../lib/pdfSetup';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { useTranslation } from '../context/TranslationContext';
import { GlobalTranslateControl } from '../components/GlobalTranslateControl';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { playSubtlePageTurnSound } from '../lib/pageTurnSound';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { BookPublication, PdfReadingMode, PdfSpreadMode } from '../types/literary';

const READING_MODES: { key: PdfReadingMode; label: string }[] = [
  { key: 'daylight', label: 'Daylight' },
  { key: 'warm-paper', label: 'Warm Paper' },
  { key: 'sepia', label: 'Sepia' },
  { key: 'midnight', label: 'Midnight' },
];

export function BookReaderPage() {
  const { slug } = useParams<{ slug: string }>();
  const { books } = useCatalog();
  const book = books.find((b) => b.slug === slug);

  useDocumentMeta(
    book ? `Reading ${book.title}` : 'Online Reading Room',
    book?.description
  );

  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-literary text-3xl text-[#EFEAE0]">Publication not found</h1>
        <Link
          to="/books"
          className="mt-6 inline-flex items-center gap-2 rounded bg-[#C9A45C] px-5 py-2.5 text-xs font-semibold text-[#0C0B0A]"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Library
        </Link>
      </div>
    );
  }

  return <PdfBookReader book={book} />;
}

function PdfBookReader({ book }: { book: BookPublication }) {
  const [searchParams] = useSearchParams();
  const { state, setBookProgress, toggleBookmark, markViewed, setPreferences } =
    useReader();
  const osReducedMotion = useReducedMotion();

  const readerContainerRef = useRef<HTMLDivElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [spreadScope, animateSpread] = useAnimate<HTMLDivElement>();
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftRenderTaskRef = useRef<RenderTask | null>(null);
  const rightRenderTaskRef = useRef<RenderTask | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [numPages, setNumPages] = useState<number>(book?.pageCount || 1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [zoom, setZoom] = useState<number>(1.0);
  const [loadingPdf, setLoadingPdf] = useState<boolean>(true);
  const [renderingPages, setRenderingPages] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showBookmarksBar, setShowBookmarksBar] = useState<boolean>(false);
  const [chromeVisible, setChromeVisible] = useState<boolean>(true);
  const [turnDir, setTurnDir] = useState<'next' | 'prev'>('next');
  const [viewportSize, setViewportSize] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const readingMode = state.preferences.pdfReadingMode || 'warm-paper';
  const spreadPref = state.preferences.pdfSpreadMode || 'auto';
  const turnSound = Boolean(state.preferences.pdfTurnSound);
  const instantTurn = Boolean(state.preferences.pdfInstantTurn) || Boolean(osReducedMotion);
  const { langMode, setLangMode, translateTexts } = useTranslation();
  const [pdfPageTranslation, setPdfPageTranslation] = useState<{
    pagesKey: string;
    lang: 'hi' | 'en';
    text: string;
    empty?: boolean;
    error?: string;
    loading: boolean;
  } | null>(null);
  const [pdfRetrySeq, setPdfRetrySeq] = useState(0);

  // Measure viewport & orientation cleanly for adaptive single vs two-page spread
  useEffect(() => {
    const onResize = () => {
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isLandscape = viewportSize.w > viewportSize.h;
  const canFitSpread = viewportSize.w >= 760 && (viewportSize.w >= 960 || isLandscape);
  const isTwoPageSpread =
    spreadPref === 'spread'
      ? viewportSize.w >= 640
      : spreadPref === 'single'
      ? false
      : canFitSpread;

  // Compute exact displayed pages without reordering or omitting any PDF page:
  // Cover/Page 1 sits alone as opening folio; 2-3, 4-5, 6-7... form natural facing spreads.
  const displayedPages = useMemo(() => {
    const safeCurrent = Math.min(Math.max(1, currentPage), Math.max(1, numPages));
    if (!isTwoPageSpread || numPages <= 1 || safeCurrent === 1) {
      return [safeCurrent];
    }
    const leftPage = safeCurrent % 2 === 0 ? safeCurrent : safeCurrent - 1;
    const rightPage = leftPage + 1 <= numPages ? leftPage + 1 : null;
    return rightPage ? [leftPage, rightPage] : [leftPage];
  }, [currentPage, numPages, isTwoPageSpread]);

  // Translate visible PDF page text when global Hindi/English translation mode is active
  useEffect(() => {
    if (langMode === 'original' || loadingPdf || !pdfDocRef.current || displayedPages.length === 0) {
      if (langMode === 'original') {
        setPdfPageTranslation(null);
      }
      return;
    }

    const controller = new AbortController();
    const pagesKey = displayedPages.join('-');
    let cancelled = false;

    setPdfPageTranslation({
      pagesKey,
      lang: langMode,
      text: '',
      loading: true,
    });

    (async () => {
      try {
        const doc = pdfDocRef.current;
        if (!doc) return;
        const pageStrings: string[] = [];
        for (const pNum of displayedPages) {
          const page = await doc.getPage(pNum);
          const content = await page.getTextContent();
          const lines: string[] = [];
          let currentLine = '';
          for (const item of content.items) {
            if (!('str' in item)) continue;
            currentLine += item.str;
            if ('hasEOL' in item && item.hasEOL) {
              if (currentLine.trim()) lines.push(currentLine.trim());
              currentLine = '';
            } else if (item.str && !item.str.endsWith(' ')) {
              currentLine += ' ';
            }
          }
          if (currentLine.trim()) lines.push(currentLine.trim());
          const joined = lines.join('\n').trim();
          if (joined) {
            pageStrings.push(
              displayedPages.length > 1 ? `[Page ${pNum}]\n${joined}` : joined
            );
          }
        }

        if (cancelled) return;
        const combined = pageStrings.join('\n\n').trim();
        if (!combined) {
          setPdfPageTranslation({
            pagesKey,
            lang: langMode,
            text: '',
            empty: true,
            loading: false,
          });
          return;
        }

        const [translated] = await translateTexts(
          [combined],
          langMode,
          controller.signal
        );
        if (cancelled) return;
        setPdfPageTranslation({
          pagesKey,
          lang: langMode,
          text: translated || combined,
          loading: false,
        });
      } catch (err: unknown) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        setPdfPageTranslation({
          pagesKey,
          lang: langMode,
          text: '',
          error: err instanceof Error ? err.message : 'Unable to translate this page.',
          loading: false,
        });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [langMode, loadingPdf, displayedPages, translateTexts, pdfRetrySeq]);

  // Auto-hide reading toolbar while immersed; reappear on tap/mouse movement
  const wakeChrome = (keepOpen = false) => {
    setChromeVisible(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (!keepOpen && !showBookmarksBar) {
      hideTimerRef.current = window.setTimeout(() => {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT') {
          setChromeVisible(false);
        }
      }, 3800);
    }
  };

  useEffect(() => {
    wakeChrome();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [showBookmarksBar]);

  // Determine initial page from URL query or remembered last-read page
  useEffect(() => {
    if (!book) return;
    const requestedPage = Number(searchParams.get('page'));
    const savedPage = state.progressBySlug[book.slug]?.currentPage;
    const startPage =
      Number.isFinite(requestedPage) && requestedPage >= 1
        ? requestedPage
        : savedPage && savedPage >= 1
        ? savedPage
        : 1;
    setCurrentPage(startPage);
    setPageInput(String(startPage));
    markViewed({
      type: 'book',
      slug: book.slug,
      title: book.title,
      subtitle: book.editionLabel || book.genre,
    });
  }, [book?.slug]);

  // Sync subsequent ?page= URL changes when remaining on the same book slug
  const pageQuery = searchParams.get('page');
  useEffect(() => {
    if (!book || !pageQuery) return;
    const requested = Number(pageQuery);
    if (Number.isFinite(requested) && requested >= 1) {
      const clamped = Math.min(Math.max(1, Math.round(requested)), Math.max(1, numPages));
      setCurrentPage(clamped);
      setPageInput(String(clamped));
    }
  }, [book?.slug, pageQuery, numPages]);

  // Sync fullscreen change events
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Load PDF document via PDF.js
  useEffect(() => {
    if (!book) return;
    let cancelled = false;
    setLoadingPdf(true);
    setErrorMsg(null);

    const loadDoc = async () => {
      try {
        if (pdfDocRef.current) {
          await disposePdfDocument(pdfDocRef.current);
          pdfDocRef.current = null;
        }
        const task = pdfjsLib.getDocument({ url: book.pdfUrl });
        const doc = await task.promise;
        if (cancelled) {
          await disposePdfDocument(doc);
          return;
        }
        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setCurrentPage((prev) => {
          const clamped = Math.min(Math.max(1, prev), doc.numPages);
          setPageInput(String(clamped));
          return clamped;
        });
        setLoadingPdf(false);
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(
            err instanceof Error
              ? err.message
              : 'Unable to load this manuscript right now.'
          );
          setLoadingPdf(false);
        }
      }
    };

    void loadDoc();

    return () => {
      cancelled = true;
      leftRenderTaskRef.current?.cancel();
      rightRenderTaskRef.current?.cancel();
      if (pdfDocRef.current) {
        void disposePdfDocument(pdfDocRef.current);
        pdfDocRef.current = null;
      }
    };
  }, [book?.pdfUrl]);

  // Compute responsive page canvas width so two-page spreads fit cleanly without horizontal clipping
  const targetPageWidth = useMemo(() => {
    const horizontalPadding = viewportSize.w < 640 ? 28 : 84;
    const available = Math.max(260, viewportSize.w - horizontalPadding);
    if (displayedPages.length === 2) {
      return Math.min(Math.floor((available - 36) / 2), 540);
    }
    return Math.min(available, 680);
  }, [viewportSize.w, displayedPages.length]);

  // Render active spread pages faithfully via PDF.js
  useEffect(() => {
    const doc = pdfDocRef.current;
    if (!doc || loadingPdf || !book) return;

    let cancelled = false;
    setRenderingPages(true);

    const renderSingleCanvas = async (
      pageNum: number,
      canvas: HTMLCanvasElement | null,
      taskRef: React.MutableRefObject<RenderTask | null>
    ) => {
      if (!canvas) return;
      taskRef.current?.cancel();
      const page = await doc.getPage(pageNum);
      if (cancelled) return;

      const baseViewport = page.getViewport({ scale: 1 });
      const fitScale = targetPageWidth / baseViewport.width;
      const effectiveScale = fitScale * zoom;
      const viewport = page.getViewport({ scale: effectiveScale });
      const dpr = Math.min(window.devicePixelRatio || 1, 2.25);

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const task = page.render({ canvasContext: ctx, viewport, canvas });
      taskRef.current = task;
      await task.promise;
    };

    const renderSpread = async () => {
      try {
        const leftPageNum = displayedPages[0];
        const rightPageNum = displayedPages[1];

        await Promise.all([
          renderSingleCanvas(leftPageNum, leftCanvasRef.current, leftRenderTaskRef),
          rightPageNum
            ? renderSingleCanvas(rightPageNum, rightCanvasRef.current, rightRenderTaskRef)
            : Promise.resolve(),
        ]);

        if (!cancelled) {
          setRenderingPages(false);
          const highestVisible = displayedPages[displayedPages.length - 1];
          setBookProgress(book.slug, highestVisible, doc.numPages);

          // Gently warm cache for next page
          if (highestVisible + 1 <= doc.numPages) {
            void doc.getPage(highestVisible + 1).catch(() => undefined);
          }
        }
      } catch (err: unknown) {
        if (
          err &&
          typeof err === 'object' &&
          'name' in err &&
          (err as { name: string }).name === 'RenderingCancelledException'
        ) {
          return;
        }
        if (!cancelled) {
          setRenderingPages(false);
        }
      }
    };

    void renderSpread();

    return () => {
      cancelled = true;
    };
  }, [displayedPages, zoom, targetPageWidth, loadingPdf, book?.slug]);

  const navigateToPage = (target: number, direction?: 'next' | 'prev') => {
    const clamped = Math.min(Math.max(1, target), numPages);
    if (clamped === currentPage) return;
    const dir = direction || (clamped > currentPage ? 'next' : 'prev');
    setTurnDir(dir);
    setCurrentPage(clamped);
    setPageInput(String(clamped));
    if (turnSound) {
      playSubtlePageTurnSound();
    }
    if (!instantTurn && spreadScope.current) {
      void animateSpread(
        spreadScope.current,
        {
          opacity: [0.55, 1],
          x: [dir === 'next' ? 20 : -20, 0],
        },
        { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
      );
    }
  };

  const turnNext = () => {
    const step =
      displayedPages.length === 2
        ? displayedPages[1] + 1
        : displayedPages[0] + 1;
    navigateToPage(step, 'next');
  };

  const turnPrev = () => {
    if (!isTwoPageSpread || displayedPages[0] <= 2) {
      navigateToPage(displayedPages[0] - 1, 'prev');
    } else {
      navigateToPage(displayedPages[0] - 2, 'prev');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        turnNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        turnPrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [displayedPages, numPages, isTwoPageSpread, turnSound]);

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(pageInput);
    if (Number.isFinite(parsed)) {
      navigateToPage(Math.round(parsed));
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && readerContainerRef.current) {
        await readerContainerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen denial on restricted browsers
    }
  };

  const bookmarks = state.bookmarksBySlug[book.slug] ?? [];
  const activeBookmarkPage = displayedPages[0];
  const isCurrentBookmarked = displayedPages.some((p) =>
    bookmarks.some((b) => b.page === p)
  );
  const highestVisiblePage = displayedPages[displayedPages.length - 1];
  const progressPercent = Math.min(
    100,
    Math.round((highestVisiblePage / Math.max(1, numPages)) * 100)
  );

  const folioPaperClass =
    readingMode === 'daylight'
      ? 'paper-folio-daylight'
      : readingMode === 'sepia'
      ? 'paper-folio-sepia'
      : readingMode === 'midnight'
      ? 'paper-folio-midnight'
      : 'paper-folio-warm';

  const canvasFilterClass =
    readingMode === 'midnight'
      ? 'invert-[0.88] hue-rotate-180 contrast-[0.93]'
      : readingMode === 'sepia'
      ? 'mix-blend-multiply sepia-[0.28] contrast-[1.03]'
      : readingMode === 'warm-paper'
      ? 'mix-blend-multiply contrast-[1.03] sepia-[0.08]'
      : 'mix-blend-multiply';

  const ambientBackdropClass =
    readingMode === 'daylight'
      ? 'bg-[#181715]'
      : readingMode === 'sepia'
      ? 'bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.14)_0%,#130E09_70%)] bg-[#130E09]'
      : readingMode === 'midnight'
      ? 'bg-[#080706]'
      : 'bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.08)_0%,#0C0B0A_68%)] bg-[#0C0B0A]';

  const isMidnightMode = readingMode === 'midnight';
  const nextFabMode: PdfReadingMode = isMidnightMode ? 'sepia' : 'midnight';

  const toggleSepiaMidnight = () => {
    setPreferences({
      pdfReadingMode: nextFabMode,
      pdfNightTint: nextFabMode === 'midnight',
    });
    wakeChrome();
  };

  const pageLabel =
    displayedPages.length === 2
      ? `Pages ${displayedPages[0]}–${displayedPages[1]} of ${numPages}`
      : `Page ${displayedPages[0]} of ${numPages}`;

  const canGoPrev = displayedPages[0] > 1;
  const canGoNext = highestVisiblePage < numPages;

  return (
    <div
      ref={readerContainerRef}
      data-reading-mode={readingMode}
      onMouseMove={() => wakeChrome()}
      className={`relative flex min-h-screen flex-col text-[#EFEAE0] transition-colors duration-300 ${ambientBackdropClass} ${
        isFullscreen ? 'overflow-y-auto' : ''
      }`}
    >
      {/* Top Minimal Auto-Hiding Reading Toolbar */}
      <header
        className={`fixed left-0 right-0 top-0 z-40 border-b border-[#2B2823] bg-[#0C0B0A]/94 backdrop-blur-md transition-all duration-200 ${
          chromeVisible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full pointer-events-none opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to={`/books/${book.slug}`}
              className="inline-flex h-9 items-center gap-1.5 rounded border border-[#2B2823] bg-[#141311] px-3 text-xs text-[#C4BDB0] hover:border-[#C9A45C]/60 hover:text-[#DEC07C] whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Book Details</span>
            </Link>
            <div className="min-w-0">
              <h1 className="truncate font-literary text-base font-medium text-[#EFEAE0] sm:text-lg">
                {book.title}
              </h1>
              <p className="truncate text-[11px] tabular-nums text-[#9A9285]">
                {book.language} · {pageLabel} ({progressPercent}%)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Reading Modes: Daylight, Warm Paper, Sepia, Midnight */}
            <div
              className="flex items-center gap-0.5 rounded border border-[#2B2823] bg-[#141311] p-0.5 text-[11px]"
              role="group"
              aria-label="Reading surface mode"
            >
              {READING_MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setPreferences({
                      pdfReadingMode: m.key,
                      pdfNightTint: m.key === 'midnight',
                    });
                    wakeChrome();
                  }}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1.5 transition-colors whitespace-nowrap ${
                    readingMode === m.key
                      ? 'bg-[#C9A45C] text-[#0C0B0A] font-semibold'
                      : 'text-[#C4BDB0] hover:text-[#EFEAE0]'
                  }`}
                >
                  {m.key === 'daylight' ? (
                    <Sun className="h-3 w-3" />
                  ) : m.key === 'sepia' ? (
                    <ScrollText className="h-3 w-3" />
                  ) : m.key === 'midnight' ? (
                    <Moon className="h-3 w-3" />
                  ) : (
                    <BookOpen className="h-3 w-3" />
                  )}
                  <span className="hidden md:inline">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Spread Toggle on capable viewports */}
            {viewportSize.w >= 640 && (
              <button
                type="button"
                onClick={() => {
                  const next: PdfSpreadMode = isTwoPageSpread ? 'single' : 'spread';
                  setPreferences({ pdfSpreadMode: next });
                  wakeChrome();
                }}
                title={
                  isTwoPageSpread
                    ? 'Switch to Single-Page View'
                    : 'Switch to Two-Page Book Spread'
                }
                className="inline-flex h-9 items-center gap-1.5 rounded border border-[#2B2823] bg-[#141311] px-2.5 text-xs text-[#C4BDB0] hover:border-[#C9A45C]/60 hover:text-[#DEC07C]"
              >
                {isTwoPageSpread ? (
                  <Square className="h-3.5 w-3.5" />
                ) : (
                  <Columns2 className="h-3.5 w-3.5" />
                )}
                <span className="hidden lg:inline">
                  {isTwoPageSpread ? 'Single' : 'Spread'}
                </span>
              </button>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 rounded border border-[#2B2823] bg-[#141311] p-0.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.12).toFixed(2)))}
                aria-label="Zoom out"
                className="inline-flex h-8 w-8 items-center justify-center rounded text-[#C4BDB0] hover:text-[#DEC07C]"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[2.5rem] text-center text-[11px] tabular-nums text-[#9A9285]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.85, +(z + 0.12).toFixed(2)))}
                aria-label="Zoom in"
                className="inline-flex h-8 w-8 items-center justify-center rounded text-[#C4BDB0] hover:text-[#DEC07C]"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Instant Page Turn Toggle (Reduced-motion / zero animation alternative) */}
            <button
              type="button"
              onClick={() => setPreferences({ pdfInstantTurn: !state.preferences.pdfInstantTurn })}
              title={
                instantTurn
                  ? 'Instant page turns active'
                  : 'Switch to instant page turns'
              }
              aria-label="Toggle instant page turns"
              className={`hidden h-9 w-9 items-center justify-center rounded border sm:inline-flex ${
                instantTurn
                  ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#DEC07C]'
                  : 'border-[#2B2823] bg-[#141311] text-[#9A9285] hover:text-[#EFEAE0]'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
            </button>

            {/* Optional Subtle Page-Turn Sound (OFF by default) */}
            <button
              type="button"
              onClick={() => {
                setPreferences({ pdfTurnSound: !turnSound });
                wakeChrome();
              }}
              title={turnSound ? 'Mute page-turn sound' : 'Enable subtle page-turn sound'}
              aria-label="Toggle subtle page-turn sound"
              className={`inline-flex h-9 w-9 items-center justify-center rounded border ${
                turnSound
                  ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#DEC07C]'
                  : 'border-[#2B2823] bg-[#141311] text-[#9A9285] hover:text-[#EFEAE0]'
              }`}
            >
              {turnSound ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
            </button>

            <GlobalTranslateControl variant="compact" />

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => {
                toggleBookmark(book.slug, activeBookmarkPage);
                wakeChrome();
              }}
              aria-label="Bookmark page"
              className={`inline-flex h-9 items-center gap-1.5 rounded border px-2.5 text-xs ${
                isCurrentBookmarked
                  ? 'border-[#C9A45C] bg-[#C9A45C] text-[#0C0B0A] font-semibold'
                  : 'border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:text-[#DEC07C]'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">
                {isCurrentBookmarked ? 'Saved' : 'Bookmark'}
              </span>
            </button>

            {bookmarks.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBookmarksBar((v) => !v)}
                className="inline-flex h-9 items-center rounded border border-[#2B2823] bg-[#141311] px-2.5 text-xs tabular-nums text-[#DEC07C]"
              >
                {bookmarks.length}
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleFullscreen}
              aria-label="Toggle fullscreen"
              className="hidden h-9 w-9 items-center justify-center rounded border border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:text-[#DEC07C] sm:inline-flex"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="h-[2px] w-full bg-[#1C1A17]">
          <div
            className="h-full bg-[#C9A45C] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {showBookmarksBar && bookmarks.length > 0 && (
          <div className="border-t border-[#2B2823] bg-[#141311] px-4 py-2">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 text-xs">
              <span className="text-[#9A9285]">Bookmarked pages:</span>
              {bookmarks.map((bm) => (
                <button
                  key={bm.page}
                  type="button"
                  onClick={() => {
                    navigateToPage(bm.page);
                    setShowBookmarksBar(false);
                  }}
                  className={`rounded px-2.5 py-1 tabular-nums ${
                    displayedPages.includes(bm.page)
                      ? 'bg-[#C9A45C] font-medium text-[#0C0B0A]'
                      : 'border border-[#2B2823] bg-[#1C1A17] text-[#EFEAE0] hover:border-[#C9A45C]'
                  }`}
                >
                  p. {bm.page}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Center Physical Open-Book Reading Stage */}
      <ProtectedReadingSurface
        enableFocusVeil
        className="flex flex-1 flex-col items-center justify-center px-2 py-16 sm:px-6 sm:py-20"
      >
        <div
          ref={stageWrapRef}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            if (relX < 0.16 && canGoPrev) {
              turnPrev();
            } else if (relX > 0.84 && canGoNext) {
              turnNext();
            } else {
              setChromeVisible((prev) => !prev);
            }
          }}
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartXRef.current === null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
            const delta = endX - touchStartXRef.current;
            touchStartXRef.current = null;
            if (Math.abs(delta) > 52) {
              if (delta < 0 && canGoNext) turnNext();
              else if (delta > 0 && canGoPrev) turnPrev();
            }
          }}
          className="relative flex w-full max-w-6xl flex-col items-center justify-center"
        >
          {errorMsg ? (
            <div className="my-12 max-w-md rounded-md border border-[#2B2823] bg-[#141311] p-8 text-center">
              <p className="font-literary text-2xl text-[#EFEAE0]">
                Could not open manuscript
              </p>
              <p className="mt-2 text-sm text-[#9A9285]">{errorMsg}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded border border-[#C9A45C]/60 px-4 py-2 text-xs text-[#DEC07C]"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retry Loading
                </button>
                <Link
                  to={`/books/${book.slug}`}
                  className="inline-flex items-center gap-2 rounded bg-[#C9A45C] px-4 py-2 text-xs font-semibold text-[#0C0B0A]"
                >
                  Book Details
                </Link>
              </div>
            </div>
          ) : (
            <>
              {(loadingPdf || renderingPages) && (
                <div className="mb-3 text-xs tracking-wider text-[#C9A45C]">
                  {loadingPdf ? 'Opening hardcover edition...' : 'Turning page...'}
                </div>
              )}

              {/* Hardcover Book Binding Container */}
              <div className="relative rounded-md border border-[#2B2823] bg-[#141311] p-2 sm:p-3.5 book-spread-stack">
                <div
                  ref={spreadScope}
                  data-turn-dir={turnDir}
                  className={`relative flex items-stretch justify-center overflow-x-auto rounded ${
                    displayedPages.length === 2 ? 'gap-0' : ''
                  }`}
                >
                  {/* Left or Single Page Leaf */}
                  <div
                    className={`relative overflow-hidden ${folioPaperClass} ${
                      displayedPages.length === 2
                        ? 'rounded-l border-r border-black/15'
                        : 'rounded'
                    }`}
                  >
                    <canvas
                      ref={leftCanvasRef}
                      className={`block ${canvasFilterClass}`}
                    />
                    {displayedPages.length === 2 && (
                      <div
                        aria-hidden="true"
                        className="book-gutter-left pointer-events-none absolute inset-y-0 right-0 w-10"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={`devanagari-verse pointer-events-none absolute bottom-2 left-3 text-[11px] tracking-normal ${
                        readingMode === 'midnight'
                          ? 'text-[#C9A45C]/35'
                          : 'text-[#3A2D1A]/35'
                      }`}
                    >
                      अधुराक्षर
                    </span>
                  </div>

                  {/* Right Facing Page Leaf (Spread Mode) */}
                  {displayedPages.length === 2 && (
                    <div className={`relative overflow-hidden rounded-r ${folioPaperClass}`}>
                      <canvas
                        ref={rightCanvasRef}
                        className={`block ${canvasFilterClass}`}
                      />
                      <div
                        aria-hidden="true"
                        className="book-gutter-right pointer-events-none absolute inset-y-0 left-0 w-10"
                      />
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute bottom-2 right-3 text-[10px] tabular-nums ${
                          readingMode === 'midnight'
                            ? 'text-[#C9A45C]/40'
                            : 'text-[#3A2D1A]/45'
                        }`}
                      >
                        {displayedPages[1]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {langMode !== 'original' && pdfPageTranslation && (
                <div
                  data-no-translate="true"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-6 w-full max-w-3xl rounded-md border border-[#C9A45C]/40 bg-[#141311]/95 p-5 shadow-2xl"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-[#2B2823] pb-3 text-xs">
                    <span className="font-medium text-[#C9A45C]">
                      {pdfPageTranslation.lang === 'hi'
                        ? 'हिंदी Translation'
                        : 'English Translation'}{' '}
                      · Page {displayedPages.join('–')}
                    </span>
                    <div className="flex items-center gap-2">
                      {pdfPageTranslation.error && (
                        <button
                          type="button"
                          onClick={() => setPdfRetrySeq((n) => n + 1)}
                          className="inline-flex items-center gap-1 rounded border border-[#C9A45C]/60 bg-[#1C1A17] px-2.5 py-1 text-[11px] font-medium text-[#DEC07C] hover:border-[#DEC07C]"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Retry</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setLangMode('original')}
                        className="inline-flex items-center gap-1 rounded border border-[#2B2823] bg-[#0C0B0A] px-2 py-1 text-[11px] text-[#C4BDB0] hover:border-[#C9A45C] hover:text-[#EFEAE0]"
                      >
                        <X className="h-3 w-3" />
                        <span>Original</span>
                      </button>
                    </div>
                  </div>
                  {pdfPageTranslation.loading ? (
                    <p className="mt-3 text-xs text-[#9A9285]">
                      Translating page text…
                    </p>
                  ) : pdfPageTranslation.error ? (
                    <p className="mt-3 text-xs text-amber-300">
                      {pdfPageTranslation.error}
                    </p>
                  ) : pdfPageTranslation.empty ? (
                    <p className="mt-3 text-xs text-[#9A9285]">
                      This page is an illustrated plate without extractable text.
                    </p>
                  ) : (
                    <pre className="devanagari-verse mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap break-words font-literary text-base leading-[1.85] text-[#EFEAE0] sm:text-lg">
                      {pdfPageTranslation.text}
                    </pre>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </ProtectedReadingSurface>

      {/* Bottom Auto-Hiding Page Navigation Dock */}
      <div
        className={`fixed bottom-4 left-1/2 z-40 -translate-x-1/2 transition-all duration-200 ${
          chromeVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-8 pointer-events-none opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 rounded-md border border-[#2B2823] bg-[#0C0B0A]/95 px-3 py-2 shadow-2xl backdrop-blur-md sm:gap-3 sm:px-4">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={turnPrev}
            className="inline-flex h-10 items-center gap-1 rounded border border-[#2B2823] px-3 text-xs font-medium text-[#EFEAE0] transition-colors hover:border-[#C9A45C] disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-1.5">
            <label htmlFor="page-jump" className="sr-only">
              Jump to page number
            </label>
            <input
              id="page-jump"
              type="number"
              min={1}
              max={numPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="h-9 w-14 rounded border border-[#2B2823] bg-[#0C0B0A] text-center text-xs tabular-nums text-[#EFEAE0] focus:border-[#C9A45C] focus:outline-none"
            />
            <span className="text-xs tabular-nums text-[#9A9285] whitespace-nowrap">
              / {numPages}
            </span>
          </form>

          <button
            type="button"
            disabled={!canGoNext}
            onClick={turnNext}
            className="inline-flex h-10 items-center gap-1 rounded bg-[#C9A45C] px-3.5 text-xs font-semibold text-[#0C0B0A] transition-colors hover:bg-[#DEC07C] disabled:opacity-35"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Floating Action Button: Toggle Sepia Paper Texture & Midnight Dark Mode */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleSepiaMidnight();
        }}
        data-testid="reading-mode-fab"
        aria-pressed={isMidnightMode}
        aria-label={
          isMidnightMode
            ? 'Switch reading view to Sepia paper texture'
            : 'Switch reading view to Midnight dark mode'
        }
        title={
          isMidnightMode
            ? 'Switch to Sepia paper texture'
            : 'Switch to Midnight dark mode'
        }
        className={`fixed bottom-20 right-4 z-50 inline-flex h-12 items-center justify-center gap-2 rounded-full border px-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.65)] backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-95 sm:bottom-6 sm:right-6 sm:px-4 ${
          isMidnightMode
            ? 'border-[#C9A45C]/70 bg-[#1B140E]/95 text-[#EAD8B1] hover:border-[#DEC07C]'
            : 'border-[#C9A45C]/60 bg-[#141311]/95 text-[#DEC07C] hover:border-[#DEC07C]'
        }`}
      >
        {isMidnightMode ? (
          <>
            <ScrollText className="h-4 w-4 shrink-0 text-[#DEC07C]" />
            <span className="hidden text-xs font-medium tracking-wide sm:inline">
              Sepia
            </span>
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 shrink-0 text-[#DEC07C]" />
            <span className="hidden text-xs font-medium tracking-wide sm:inline">
              Midnight
            </span>
          </>
        )}
      </button>
    </div>
  );
}
