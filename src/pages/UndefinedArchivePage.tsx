import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import {
  FIRST_WRITING_DAY_DATE,
  FIRST_WRITING_DAY_RECORDS,
  UNDEFINED_CLOSING_TEXT,
  UNDEFINED_INDEX_RECORDS,
  UNDEFINED_OPENING_TEXT,
  type ArchivalStatusLabel,
  type FirstDayPoemRecord,
} from '../data/undefinedArchiveData';
import { useDocumentMeta } from '../lib/useDocumentMeta';

function statusToneClass(status: ArchivalStatusLabel): string {
  switch (status) {
    case 'CLASSIFIED':
      return 'text-[#C8B99B]';
    case 'SEALED':
      return 'text-[#9F988C]';
    case 'UNRESOLVED':
      return 'text-[#D6CCBA]';
    case 'PRESERVED':
    default:
      return 'text-[#B5AEA1]';
  }
}

function OriginalArtworkPlate({ record }: { record: FirstDayPoemRecord }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center border border-[#242329] bg-[#0B0B0E] p-8 text-center">
        <p className="font-archival-mono text-[11px] uppercase tracking-[0.24em] text-[#8E877B]">
          {record.accessionId}
        </p>
        <p className="mt-3 font-literary text-xl text-[#ECE7DC]">
          {record.recordCode}
        </p>
        <p className="mt-2 font-archival-mono text-xs text-[#7B7469]">
          Signature: {record.signature}
        </p>
      </div>
    );
  }

  return (
    <figure className="relative overflow-hidden border border-[#242329] bg-[#040406] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.95)]">
      <div className="aspect-square w-full bg-[#040406]">
        <img
          src={record.artworkUrl}
          alt={record.artworkAlt}
          referrerPolicy="no-referrer"
          draggable={false}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-contain select-none"
        />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1D1C21] bg-[#08080B] px-4 py-2.5 text-[11px] text-[#8E877B]">
        <span className="font-archival-mono uppercase tracking-[0.16em]" data-no-translate="true">
          {record.accessionId}
        </span>
        <span className="font-archival-mono" data-no-translate="true">
          {record.signature}
        </span>
      </figcaption>
    </figure>
  );
}

export function UndefinedArchivePage() {
  useDocumentMeta(
    'UNDEFINED: An Archive of Unresolved Moments | BENIYAAZ ROOH',
    'A restricted literary archive preserving fragments from 20 January 2023 and an unresolved historical index within BENIYAAZ ROOH.'
  );

  const [revealedTranscripts, setRevealedTranscripts] = useState<Record<string, boolean>>({});
  const [expandedIndexIds, setExpandedIndexIds] = useState<Record<string, boolean>>({});

  const toggleTranscript = (code: string) => {
    setRevealedTranscripts((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleIndexEntry = (code: string) => {
    setExpandedIndexIds((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const allExpanded = UNDEFINED_INDEX_RECORDS.every((e) => Boolean(expandedIndexIds[e.indexCode]));

  const toggleAllIndexEntries = () => {
    if (allExpanded) {
      setExpandedIndexIds({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const item of UNDEFINED_INDEX_RECORDS) {
      next[item.indexCode] = true;
    }
    setExpandedIndexIds(next);
  };

  return (
    <div className="archival-obsidian-bg relative min-h-screen text-[#ECE7DC]">
      <ScrollProgressHairline />

      {/* Subtle archival film grain & smoky obsidian vignette */}
      <div
        aria-hidden="true"
        className="archival-film-grain pointer-events-none fixed inset-0 opacity-75"
      />
      <div
        aria-hidden="true"
        className="archival-vignette pointer-events-none fixed inset-0"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        {/* Opening Dossier Threshold */}
        <header className="section-reveal relative border-b border-[#26242C] pb-14">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#8E877B]">
            <span
              data-no-translate="true"
              className="font-archival-mono uppercase tracking-[0.26em]"
            >
              ARC-UND · RESTRICTED LITERARY RECORD
            </span>
            <Link
              to="/"
              className="inline-flex min-h-[40px] items-center gap-1.5 font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#9E978B] transition-colors hover:text-[#ECE7DC]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Archive</span>
            </Link>
          </div>

          <div className="mt-10 sm:mt-14">
            <h1
              data-no-translate="true"
              className="font-literary text-5xl font-medium tracking-[0.12em] text-[#ECE7DC] headline-balance sm:text-7xl"
            >
              UNDEFINED
            </h1>
            <p className="mt-3 font-literary text-xl italic text-[#B8B1A3] sm:text-2xl">
              An Archive of Unresolved Moments.
            </p>
          </div>

          <div className="mt-10 max-w-xl space-y-1.5 border-t border-[#1D1C21] pt-7 font-literary text-lg leading-relaxed text-[#D0C9BC] sm:text-xl">
            {UNDEFINED_OPENING_TEXT.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </header>

        {/* Section I: The First Writing Day */}
        <section className="py-16 sm:py-20" aria-labelledby="first-writing-day-heading">
          <div className="flex flex-col justify-between gap-4 border-b border-[#232227] pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-archival-mono text-[11px] uppercase tracking-[0.24em] text-[#8E877B]">
                Section I · Preserved Manuscript Folio
              </p>
              <h2
                id="first-writing-day-heading"
                className="mt-2 font-literary text-3xl font-medium text-[#ECE7DC] sm:text-4xl"
              >
                The First Writing Day
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <p className="font-literary text-2xl text-[#ECE7DC] sm:text-3xl">
                {FIRST_WRITING_DAY_DATE}
              </p>
              <p className="font-archival-mono text-[11px] uppercase tracking-[0.2em] text-[#7D766A]">
                Three Records · Clock Time Withheld
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-20">
            {FIRST_WRITING_DAY_RECORDS.map((record) => {
              const isTranscriptOpen = Boolean(revealedTranscripts[record.recordCode]);

              return (
                <article
                  key={record.accessionId}
                  className="grid items-start gap-8 border-b border-[#1D1C21] pb-16 last:border-b-0 last:pb-0 lg:grid-cols-12 lg:gap-10"
                >
                  {/* Original Preserved Artwork */}
                  <div className="min-w-0 lg:col-span-6">
                    <ProtectedReadingSurface showWatermark={false} enableFocusVeil>
                      <OriginalArtworkPlate record={record} />
                    </ProtectedReadingSurface>
                  </div>

                  {/* Archival Accession Metadata & Preserved Text Toggle */}
                  <div className="min-w-0 lg:col-span-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#232227] pb-4">
                      <div>
                        <p className="font-archival-mono text-xs uppercase tracking-[0.22em] text-[#C8B99B]">
                          {record.recordCode}
                        </p>
                        <p className="mt-1 font-literary text-2xl text-[#ECE7DC]">
                          {record.sequenceLabel}
                        </p>
                      </div>
                      <span
                        data-no-translate="true"
                        className={`font-archival-mono text-[11px] uppercase tracking-[0.2em] ${statusToneClass(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </div>

                    <dl className="divide-y divide-[#1D1C21] text-sm">
                      <div className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#7D766A]">
                          Date
                        </dt>
                        <dd className="font-literary text-lg text-[#ECE7DC]">
                          {record.dateLabel}
                        </dd>
                      </div>

                      <div className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#7D766A]">
                          Time
                        </dt>
                        <dd className="font-archival-mono text-xs uppercase tracking-[0.16em] text-[#7D766A]">
                          Sealed
                        </dd>
                      </div>

                      {record.occasion && (
                        <div className="flex items-baseline justify-between gap-4 py-3">
                          <dt className="font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#7D766A]">
                            Occasion
                          </dt>
                          <dd className="text-right text-sm text-[#D0C9BC]">
                            {record.occasion}
                          </dd>
                        </div>
                      )}

                      {record.location && (
                        <div className="flex items-baseline justify-between gap-4 py-3">
                          <dt className="font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#7D766A]">
                            Location
                          </dt>
                          <dd className="text-right text-sm text-[#D0C9BC]">
                            {record.location}
                          </dd>
                        </div>
                      )}

                      <div className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#7D766A]">
                          Signature
                        </dt>
                        <dd
                          data-no-translate="true"
                          className="font-archival-mono text-xs text-[#ECE7DC]"
                        >
                          {record.signature}
                        </dd>
                      </div>

                      <div className="flex items-baseline justify-between gap-4 py-3">
                        <dt className="font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#7D766A]">
                          Title
                        </dt>
                        <dd className="font-archival-mono text-xs uppercase tracking-[0.14em] text-[#7D766A]">
                          Untitled
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => toggleTranscript(record.recordCode)}
                        aria-expanded={isTranscriptOpen}
                        className="inline-flex min-h-[44px] items-center gap-2 border border-[#2C2A32] bg-[#0B0B0E] px-4 py-2 font-archival-mono text-xs uppercase tracking-[0.16em] text-[#D0C9BC] transition-colors duration-150 hover:border-[#8E877B] hover:text-[#ECE7DC]"
                      >
                        {isTranscriptOpen ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-[#8E877B]" />
                            <span>Conceal Text</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-[#C8B99B]" />
                            <span>Read Preserved Text</span>
                          </>
                        )}
                      </button>

                      {isTranscriptOpen && (
                        <ProtectedReadingSurface
                          showWatermark={false}
                          className="mt-4 border border-[#1E1D23] bg-[#09090C] p-5"
                        >
                          <div
                            data-no-translate="true"
                            className="devanagari-verse whitespace-pre-wrap text-base leading-[1.9] text-[#ECE7DC]"
                          >
                            {record.verbatimLines.map((line, i) =>
                              line === '' ? (
                                <div key={i} className="h-3" aria-hidden="true" />
                              ) : (
                                <p key={i}>{line}</p>
                              )
                            )}
                          </div>
                          <p
                            data-no-translate="true"
                            className="mt-4 border-t border-[#1D1C21] pt-3 font-archival-mono text-xs text-[#9E978B]"
                          >
                            ~ {record.signature}
                          </p>
                        </ProtectedReadingSurface>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section II: The Undefined Index */}
        <section
          className="border-t border-[#232227] py-16 sm:py-20"
          aria-labelledby="undefined-index-heading"
        >
          <div className="flex flex-col justify-between gap-4 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-archival-mono text-[11px] uppercase tracking-[0.24em] text-[#8E877B]">
                Section II · Concealed Chronology
              </p>
              <h2
                id="undefined-index-heading"
                className="mt-2 font-literary text-3xl font-medium text-[#ECE7DC] sm:text-4xl"
              >
                The Undefined Index
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#9E978B]">
                Six timestamped fragments entered into the archive. Select any entry to reveal
                its archival note.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleAllIndexEntries}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center border border-[#2C2A32] bg-[#0B0B0E] px-4 py-2 font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#B8B1A3] transition-colors duration-150 hover:border-[#8E877B] hover:text-[#ECE7DC]"
            >
              {allExpanded ? 'Seal All' : 'Reveal All'}
            </button>
          </div>

          <div className="mt-4 divide-y divide-[#232227] border-y border-[#232227]">
            {UNDEFINED_INDEX_RECORDS.map((entry) => {
              const isOpen = Boolean(expandedIndexIds[entry.indexCode]);

              return (
                <div key={entry.identifier} className="transition-colors hover:bg-[#0B0B0E]/70">
                  <button
                    type="button"
                    onClick={() => toggleIndexEntry(entry.indexCode)}
                    aria-expanded={isOpen}
                    className="flex min-h-[64px] w-full flex-col gap-3 px-2 py-5 text-left sm:flex-row sm:items-center sm:justify-between sm:px-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1 sm:flex sm:items-baseline sm:gap-5 sm:space-y-0">
                      <span
                        data-no-translate="true"
                        className="inline-block w-16 shrink-0 font-archival-mono text-xs text-[#7D766A]"
                      >
                        {entry.indexCode}
                      </span>

                      <span className="block w-44 shrink-0 font-literary text-xl text-[#ECE7DC] sm:text-2xl">
                        {entry.dateLabel}
                      </span>

                      <span
                        data-no-translate="true"
                        className="block w-32 shrink-0 font-archival-mono text-xs tracking-[0.08em] text-[#C8B99B]"
                      >
                        {entry.timeLabel}
                      </span>

                      <span className="block min-w-0 flex-1 text-sm text-[#D6D0C4] sm:text-base">
                        {entry.eventTitle}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                      <span
                        data-no-translate="true"
                        className="hidden font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#7D766A] lg:inline"
                      >
                        {entry.partiallyConcealedTag}
                      </span>

                      <span
                        data-no-translate="true"
                        className={`font-archival-mono text-[11px] uppercase tracking-[0.2em] ${statusToneClass(
                          entry.classification
                        )}`}
                      >
                        {entry.classification}
                      </span>

                      <ChevronDown
                        className={`h-4 w-4 text-[#8E877B] transition-transform duration-150 ${
                          isOpen ? 'rotate-180 text-[#ECE7DC]' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#1A191E] bg-[#0A0A0E]/90 px-3 py-5 sm:px-6">
                      <div className="grid gap-4 sm:grid-cols-12">
                        <div className="sm:col-span-4">
                          <p
                            data-no-translate="true"
                            className="font-archival-mono text-[11px] uppercase tracking-[0.18em] text-[#7D766A]"
                          >
                            {entry.identifier}
                          </p>
                          <p
                            data-no-translate="true"
                            className="mt-1 font-archival-mono text-[11px] uppercase tracking-[0.16em] text-[#C8B99B]"
                          >
                            {entry.dateLabel} · {entry.timeLabel}
                          </p>
                        </div>
                        <div className="sm:col-span-8">
                          <p className="text-sm leading-relaxed text-[#D6D0C4]">
                            {entry.description}
                          </p>
                          <p className="mt-2.5 font-archival-mono text-xs text-[#7D766A]">
                            {entry.noteLine}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing Archival Reflection */}
        <footer className="border-t border-[#232227] pt-14 text-center">
          <div className="mx-auto max-w-xl space-y-1 font-literary text-2xl italic leading-relaxed text-[#D0C9BC] sm:text-3xl">
            {UNDEFINED_CLOSING_TEXT.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 font-archival-mono text-xs uppercase tracking-[0.2em] text-[#8E877B]">
            <Link to="/midnight-page" className="transition-colors hover:text-[#ECE7DC]">
              The Midnight Page →
            </Link>
            <Link to="/poetry" className="transition-colors hover:text-[#ECE7DC]">
              Poetry Room →
            </Link>
            <Link to="/books" className="transition-colors hover:text-[#ECE7DC]">
              The Library →
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
