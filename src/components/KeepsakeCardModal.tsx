import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';

interface KeepsakeCardModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text: string;
  sourceLabel?: string;
  slug?: string;
  initialPassage?: string | null;
}

type CardExtractMode = 'first' | 'last' | 'stanza' | 'all';
type CardTheme = 'midnight' | 'paper';
type CardFormat = 'square' | 'story' | 'bookmark';

const FORMAT_DIMENSIONS: Record<
  CardFormat,
  { width: number; height: number; label: string; aspectClass: string }
> = {
  square: {
    width: 1080,
    height: 1080,
    label: 'Square (1:1)',
    aspectClass: 'aspect-square max-w-sm',
  },
  story: {
    width: 1080,
    height: 1920,
    label: 'Wallpaper (9:16)',
    aspectClass: 'aspect-[9/16] max-w-[230px]',
  },
  bookmark: {
    width: 720,
    height: 1600,
    label: 'Bookmark',
    aspectClass: 'aspect-[9/20] max-w-[195px]',
  },
};

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  rawLines: string[],
  maxWidth: number
): string[] {
  const out: string[] = [];
  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      out.push('');
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) out.push(current);
        current = word;
      }
    }
    if (current) out.push(current);
  }
  return out;
}

export function KeepsakeCardModal({
  open,
  onClose,
  title,
  text,
  sourceLabel,
  slug,
  initialPassage,
}: KeepsakeCardModalProps) {
  const stanzas = useMemo(() => {
    return text
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('~'));
  }, [text]);

  const [extractMode, setExtractMode] = useState<CardExtractMode>(
    initialPassage ? 'stanza' : 'first'
  );
  const [stanzaIndex, setStanzaIndex] = useState<number>(0);
  const [theme, setTheme] = useState<CardTheme>('midnight');
  const [format, setFormat] = useState<CardFormat>('square');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (initialPassage) {
      const idx = stanzas.findIndex((s) => s === initialPassage.trim());
      if (idx > -1) {
        setExtractMode('stanza');
        setStanzaIndex(idx);
        return;
      }
    }
    setExtractMode('first');
    setStanzaIndex(0);
  }, [open, initialPassage, stanzas]);

  const lines = useMemo(() => text.split('\n').map((l) => l.trim()), [text]);

  const selectedPassage = useMemo(() => {
    if (extractMode === 'stanza') {
      if (stanzas.length > 0) {
        return stanzas[stanzaIndex] ?? stanzas[0];
      }
      if (initialPassage) return initialPassage;
    }
    if (extractMode === 'first') {
      if (stanzas.length > 0) return stanzas[0];
      const stanza = [];
      for (const line of lines) {
        if (!line && stanza.length > 0) break;
        if (line) stanza.push(line);
      }
      return stanza.slice(0, 5).join('\n') || lines.slice(0, 4).join('\n');
    }
    if (extractMode === 'last') {
      if (stanzas.length > 0) return stanzas[stanzas.length - 1];
      const nonEmpties = lines.filter((l) => l.length > 0);
      return nonEmpties.slice(-4).join('\n');
    }
    return lines.slice(0, 10).join('\n');
  }, [lines, stanzas, extractMode, stanzaIndex, initialPassage]);

  if (!open) return null;

  const handleCopyText = async () => {
    const citation = `“${selectedPassage}”\n\n— ${title}\nTejas Purvesh Phirake · BENIYAAZ ROOH${
      sourceLabel ? ` (${sourceLabel})` : ''
    }`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const { width, height } = FORMAT_DIMENSIONS[format];
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isDark = theme === 'midnight';
      const bg = isDark ? '#0C0B0A' : '#F6F1E7';
      const ink = isDark ? '#EFEAE0' : '#1E1A16';
      const verseInk = isDark ? '#FFFBF2' : '#2D261E';
      const gold = isDark ? '#C9A45C' : '#997334';
      const muted = isDark ? '#8A8275' : '#736859';

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const pad = format === 'bookmark' ? 32 : 42;
      ctx.strokeStyle = isDark ? 'rgba(201, 164, 92, 0.45)' : 'rgba(163, 131, 80, 0.45)';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

      ctx.strokeStyle = isDark ? 'rgba(201, 164, 92, 0.18)' : 'rgba(163, 131, 80, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(pad + 12, pad + 12, width - (pad + 12) * 2, height - (pad + 12) * 2);

      const topY = format === 'square' ? 112 : 170;
      ctx.fillStyle = gold;
      ctx.font = format === 'bookmark' ? '600 20px serif' : '600 24px serif';
      ctx.textAlign = 'center';
      ctx.fillText('BENIYAAZ ROOH · EK PANNA', width / 2, topY);

      ctx.fillStyle = ink;
      ctx.font = format === 'bookmark' ? '500 34px serif' : '500 44px serif';
      const titleLines = wrapCanvasText(ctx, [title], width - pad * 3.2);
      let titleY = topY + 72;
      for (const tl of titleLines.slice(0, 2)) {
        ctx.fillText(tl, width / 2, titleY);
        titleY += 48;
      }

      ctx.strokeStyle = isDark ? 'rgba(201, 164, 92, 0.35)' : 'rgba(163, 131, 80, 0.35)';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 70, titleY + 6);
      ctx.lineTo(width / 2 + 70, titleY + 6);
      ctx.stroke();

      const bodyFontSize =
        format === 'bookmark'
          ? 27
          : format === 'story'
            ? 34
            : 31;
      ctx.fillStyle = verseInk;
      ctx.font = `400 ${bodyFontSize}px "Noto Serif Devanagari", Georgia, serif`;
      const wrappedVerse = wrapCanvasText(
        ctx,
        selectedPassage.split('\n'),
        width - pad * 3.4
      );
      const lineGap = format === 'bookmark' ? 46 : 54;
      const blockHeight = wrappedVerse.length * lineGap;
      const midCenterY = (titleY + 40 + (height - 170)) / 2;
      let cursorY = midCenterY - blockHeight / 2 + bodyFontSize * 0.4;

      for (const line of wrappedVerse) {
        if (line) {
          ctx.fillText(line, width / 2, cursorY);
        }
        cursorY += lineGap;
      }

      const footerY = format === 'square' ? height - 115 : height - 135;
      ctx.fillStyle = gold;
      ctx.font = format === 'bookmark' ? '500 20px serif' : '500 24px serif';
      ctx.fillText('तेजस पुर्वेश फिरके (Tejas Purvesh Phirake)', width / 2, footerY);

      ctx.fillStyle = muted;
      ctx.font = format === 'bookmark' ? '400 15px sans-serif' : '400 18px sans-serif';
      ctx.fillText(
        sourceLabel ? `${sourceLabel} · Preserved Literary Archive` : 'Preserved Literary Archive',
        width / 2,
        footerY + 32
      );

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `${slug || 'ek-panna'}-${format}-keepsake.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      // Ignored
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keepsake-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm"
    >
      <div className="relative my-auto w-full max-w-2xl rounded-lg border border-[#2B2823] bg-[#11100E] p-5 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-[#2B2823] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C9A45C]">
              Ek Panna Keepsake Card
            </p>
            <h3 id="keepsake-modal-title" className="font-literary text-2xl text-[#EFEAE0]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close keepsake modal"
            className="rounded p-1.5 text-[#9A9285] hover:text-[#EFEAE0]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customization controls */}
        <div className="mt-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#9A9285]">Extract:</span>
              {(['first', 'stanza', 'last', 'all'] as CardExtractMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setExtractMode(mode)}
                  className={`rounded px-2.5 py-1 transition-colors whitespace-nowrap ${
                    extractMode === mode
                      ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                      : 'border border-[#2B2823] bg-[#191714] text-[#C4BDB0] hover:text-[#EFEAE0]'
                  }`}
                >
                  {mode === 'first'
                    ? 'Opening'
                    : mode === 'stanza'
                      ? 'Pick Stanza'
                      : mode === 'last'
                        ? 'Closing'
                        : 'Passage'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#9A9285]">Surface:</span>
              {(['midnight', 'paper'] as CardTheme[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`rounded px-2.5 py-1 capitalize transition-colors ${
                    theme === t
                      ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                      : 'border border-[#2B2823] bg-[#191714] text-[#C4BDB0] hover:text-[#EFEAE0]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#9A9285]">Format:</span>
              {(['square', 'story', 'bookmark'] as CardFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`rounded px-2.5 py-1 transition-colors whitespace-nowrap ${
                    format === fmt
                      ? 'border border-[#C9A45C] bg-[#1C1A17] font-medium text-[#DEC07C]'
                      : 'border border-[#2B2823] bg-[#141311] text-[#9A9285] hover:text-[#EFEAE0]'
                  }`}
                >
                  {FORMAT_DIMENSIONS[fmt].label}
                </button>
              ))}
            </div>

            {extractMode === 'stanza' && stanzas.length > 1 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="mr-1 text-[#9A9285]">Stanza:</span>
                {stanzas.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStanzaIndex(idx)}
                    className={`h-6 min-w-[26px] rounded px-1.5 tabular-nums transition-colors ${
                      stanzaIndex === idx
                        ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                        : 'border border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:border-[#C9A45C]/50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Card Preview */}
        <div className="mt-5 flex justify-center">
          <div
            ref={cardRef}
            className={`relative flex w-full flex-col justify-between rounded-md border p-5 text-center shadow-lg transition-all ${
              FORMAT_DIMENSIONS[format].aspectClass
            } ${
              theme === 'paper'
                ? 'border-[#CEC2AD] bg-[#F6F1E7] text-[#1E1A16]'
                : 'border-[#C9A45C]/45 bg-[#0C0B0A] text-[#EFEAE0]'
            }`}
          >
            <div>
              <p
                className={`text-[9px] font-semibold uppercase tracking-widest ${
                  theme === 'paper' ? 'text-[#997334]' : 'text-[#C9A45C]'
                }`}
              >
                BENIYAAZ ROOH
              </p>
              <h4 className="mt-1 font-literary text-base font-medium sm:text-lg">{title}</h4>
              <div
                className={`mx-auto mt-2 h-px w-10 ${
                  theme === 'paper' ? 'bg-[#997334]/40' : 'bg-[#C9A45C]/40'
                }`}
              />
            </div>

            <div className="my-auto py-2">
              <pre
                className={`devanagari-verse whitespace-pre-wrap font-literary leading-relaxed ${
                  format === 'bookmark' ? 'text-xs sm:text-sm' : 'text-xs sm:text-base'
                } ${theme === 'paper' ? 'text-[#2D261E]' : 'text-[#FFF8ED]'}`}
              >
                {selectedPassage}
              </pre>
            </div>

            <div className="border-t border-current/15 pt-2 text-[9px]">
              <p className={theme === 'paper' ? 'text-[#997334]' : 'text-[#C9A45C]'}>
                तेजस पुर्वेश फिरके
              </p>
              <p className="truncate opacity-70">{sourceLabel || 'Preserved Literary Works'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-[#2B2823] pt-4">
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex h-9 items-center gap-1.5 rounded border border-[#2B2823] bg-[#141311] px-3.5 text-xs text-[#C4BDB0] hover:border-[#C9A45C]/60 hover:text-[#DEC07C]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#C9A45C]" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Quote'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="inline-flex h-9 items-center gap-1.5 rounded bg-[#C9A45C] px-4 text-xs font-semibold text-[#0C0B0A] hover:bg-[#DEC07C] disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? 'Generating PNG...' : `Download ${FORMAT_DIMENSIONS[format].label}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
