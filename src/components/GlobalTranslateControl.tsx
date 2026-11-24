import { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Languages, Loader2, X } from 'lucide-react';
import { useTranslation, type GlobalLangMode } from '../context/TranslationContext';

interface GlobalTranslateControlProps {
  variant?: 'header' | 'compact';
}

export function GlobalTranslateControl({
  variant = 'header',
}: GlobalTranslateControlProps) {
  const { langMode, setLangMode, toggleViceVersa, isTranslating } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const choose = (mode: GlobalLangMode) => {
    setLangMode(mode);
    setMenuOpen(false);
  };

  if (variant === 'compact') {
    const shortLabel =
      langMode === 'hi' ? 'हिंदी' : langMode === 'en' ? 'ENG' : 'अ/A';
    return (
      <div className="relative" ref={popRef} data-no-translate="true">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          data-testid="reader-translate-btn"
          aria-expanded={menuOpen}
          aria-label="Translate page between Hindi and English"
          className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors ${
            langMode !== 'original'
              ? 'border-[#C9A45C] bg-[#C9A45C]/18 font-medium text-[#DEC07C]'
              : 'border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:border-[#C9A45C]/60 hover:text-[#DEC07C]'
          }`}
        >
          {isTranslating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C9A45C]" />
          ) : (
            <Languages className="h-3.5 w-3.5 text-[#C9A45C]" />
          )}
          <span className="whitespace-nowrap">{shortLabel}</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-[#2B2823] bg-[#141311] p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                toggleViceVersa();
                setMenuOpen(false);
              }}
              className="mb-1.5 flex w-full items-center justify-between rounded border border-[#C9A45C]/45 bg-[#1C1A17] px-3 py-2 text-xs font-medium text-[#DEC07C] hover:border-[#DEC07C]"
            >
              <span>{langMode === 'en' ? 'Switch → हिंदी' : langMode === 'hi' ? 'Switch → English' : 'Translate · हिंदी ↔ Eng'}</span>
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>
            <div className="grid grid-cols-3 gap-1">
              {(['original', 'hi', 'en'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => choose(mode)}
                  className={`rounded py-1.5 text-[11px] transition-colors ${
                    langMode === mode
                      ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                      : 'border border-[#2B2823] bg-[#0C0B0A] text-[#C4BDB0] hover:text-[#EFEAE0]'
                  }`}
                >
                  {mode === 'original' ? 'Original' : mode === 'hi' ? 'हिंदी' : 'English'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const mobileBadge =
    langMode === 'hi' ? 'हिंदी' : langMode === 'en' ? 'ENG' : 'अ/A';

  return (
    <div className="relative flex items-center" ref={popRef} data-no-translate="true">
      {/* Desktop inline segmented switcher */}
      <div
        role="group"
        aria-label="Translate page language"
        className="hidden h-10 items-center gap-0.5 rounded-md border border-[#2B2823] bg-[#141311] p-1 lg:inline-flex"
      >
        <span className="inline-flex items-center px-1.5 text-[#C9A45C]">
          {isTranslating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Languages className="h-3.5 w-3.5" />
          )}
        </span>
        <button
          type="button"
          onClick={() => choose('original')}
          aria-pressed={langMode === 'original'}
          data-testid="global-translate-original"
          className={`rounded px-2 py-1 text-[11px] transition-colors ${
            langMode === 'original'
              ? 'bg-[#26231E] font-medium text-[#EFEAE0]'
              : 'text-[#9A9285] hover:text-[#EFEAE0]'
          }`}
        >
          Orig
        </button>
        <button
          type="button"
          onClick={() => choose('hi')}
          aria-pressed={langMode === 'hi'}
          data-testid="global-translate-hi"
          className={`rounded px-2 py-1 text-[11px] transition-colors ${
            langMode === 'hi'
              ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
              : 'text-[#C4BDB0] hover:text-[#DEC07C]'
          }`}
        >
          हिंदी
        </button>
        <button
          type="button"
          onClick={() => choose('en')}
          aria-pressed={langMode === 'en'}
          data-testid="global-translate-en"
          className={`rounded px-2 py-1 text-[11px] transition-colors ${
            langMode === 'en'
              ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
              : 'text-[#C4BDB0] hover:text-[#DEC07C]'
          }`}
        >
          Eng
        </button>
      </div>

      {/* Tablet / Mobile compact button */}
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        data-testid="global-translate-btn"
        aria-expanded={menuOpen}
        aria-label="Translate page between Hindi and English"
        className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors lg:hidden ${
          langMode !== 'original'
            ? 'border-[#C9A45C] bg-[#C9A45C]/18 text-[#DEC07C]'
            : 'border-[#2B2823] bg-[#141311] text-[#EFEAE0] hover:border-[#C9A45C]/60 hover:text-[#DEC07C]'
        }`}
      >
        {isTranslating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C9A45C]" />
        ) : (
          <Languages className="h-3.5 w-3.5 text-[#C9A45C]" />
        )}
        <span className="whitespace-nowrap">{mobileBadge}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-md border border-[#2B2823] bg-[#141311] p-2.5 shadow-2xl lg:hidden">
          <p className="mb-2 px-1 text-[11px] font-medium text-[#C9A45C]">
            Page Translation
          </p>
          <button
            type="button"
            onClick={() => {
              toggleViceVersa();
              setMenuOpen(false);
            }}
            className="mb-2 flex w-full items-center justify-between rounded border border-[#C9A45C]/50 bg-[#1C1A17] px-3 py-2 text-xs font-medium text-[#DEC07C] hover:border-[#DEC07C]"
          >
            <span>
              {langMode === 'en'
                ? 'Switch → हिंदी'
                : langMode === 'hi'
                  ? 'Switch → English'
                  : 'Translate · हिंदी ↔ Eng'}
            </span>
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
          <div className="grid grid-cols-3 gap-1">
            {(['original', 'hi', 'en'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => choose(mode)}
                className={`rounded py-1.5 text-[11px] transition-colors ${
                  langMode === mode
                    ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                    : 'border border-[#2B2823] bg-[#0C0B0A] text-[#C4BDB0] hover:text-[#EFEAE0]'
                }`}
              >
                {mode === 'original' ? 'Original' : mode === 'hi' ? 'हिंदी' : 'English'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function GlobalTranslationBanner() {
  const {
    langMode,
    setLangMode,
    toggleViceVersa,
    retryTranslation,
    isTranslating,
    translateError,
    clearError,
  } = useTranslation();

  if (langMode === 'original' && !isTranslating && !translateError) {
    return null;
  }

  return (
    <div
      data-no-translate="true"
      className="border-b border-[#2B2823] bg-[#141311]/95 px-4 py-2 text-xs"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#C4BDB0]">
          {isTranslating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C9A45C]" />
              <span>
                Translating page into {langMode === 'hi' ? 'हिंदी' : 'English'}…
              </span>
            </>
          ) : translateError ? (
            <span className="text-amber-300">{translateError}</span>
          ) : (
            <>
              <Languages className="h-3.5 w-3.5 text-[#C9A45C]" />
              <span>
                Reading in{' '}
                <strong className="font-medium text-[#DEC07C]">
                  {langMode === 'hi' ? 'हिंदी (Hindi)' : 'English'}
                </strong>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {translateError && langMode !== 'original' && (
            <button
              type="button"
              onClick={retryTranslation}
              className="inline-flex items-center gap-1 rounded border border-[#C9A45C]/60 bg-[#1C1A17] px-2.5 py-1 text-[11px] font-medium text-[#DEC07C] hover:border-[#DEC07C]"
            >
              <span>Retry</span>
            </button>
          )}
          {langMode !== 'original' && !translateError && (
            <button
              type="button"
              onClick={toggleViceVersa}
              className="inline-flex items-center gap-1 rounded border border-[#C9A45C]/45 bg-[#1C1A17] px-2.5 py-1 text-[11px] font-medium text-[#DEC07C] hover:border-[#DEC07C]"
            >
              <ArrowLeftRight className="h-3 w-3" />
              <span>{langMode === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              clearError();
              setLangMode('original');
            }}
            className="inline-flex items-center gap-1 rounded border border-[#2B2823] bg-[#0C0B0A] px-2.5 py-1 text-[11px] text-[#C4BDB0] hover:border-[#C9A45C]/50 hover:text-[#EFEAE0]"
          >
            <X className="h-3 w-3" />
            <span>Original</span>
          </button>
        </div>
      </div>
    </div>
  );
}
