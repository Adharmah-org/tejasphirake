import { useState } from 'react';
import { ChevronDown, Feather } from 'lucide-react';
import type { ArchivalMarginNote } from '../data/marginNotesData';
import type { ReaderSurfaceMode } from '../types/literary';

interface MarginNotesDrawerProps {
  notes: ArchivalMarginNote[];
  surface?: ReaderSurfaceMode;
  headingLabel?: string;
}

export function MarginNotesDrawer({
  notes,
  surface = 'midnight',
  headingLabel = 'Between the Lines · Archival Notes',
}: MarginNotesDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!notes || notes.length === 0) return null;

  const isPaper = surface === 'paper';

  return (
    <div
      className={`mt-6 rounded border transition-colors ${
        isPaper
          ? 'border-[#DDD3C0] bg-[#EFE8DA]/60'
          : 'border-[#2B2823] bg-[#0E0D0B]'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
          isPaper ? 'hover:bg-[#EAE1D1]' : 'hover:bg-[#161412]'
        }`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Feather className="h-3.5 w-3.5 text-[#C9A45C]" />
          <span
            className={`font-literary text-xs font-medium tracking-wide ${
              isPaper ? 'text-[#3E352B]' : 'text-[#DEC07C]'
            }`}
          >
            {headingLabel} ({notes.length})
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${isPaper ? 'text-[#7D7060]' : 'text-[#9A9285]'}`}
        />
      </button>

      {isOpen && (
        <div
          className={`divide-y px-4 pb-4 pt-1 ${
            isPaper ? 'divide-[#DDD3C0]' : 'divide-[#2B2823]'
          }`}
        >
          {notes.map((note) => (
            <div key={note.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A45C]">
                  {note.sourceTag}
                </span>
                {note.contextLine && (
                  <span
                    className={`italic text-xs ${
                      isPaper ? 'text-[#6A5F52]' : 'text-[#9A9285]'
                    }`}
                  >
                    “{note.contextLine}”
                  </span>
                )}
              </div>
              <h4
                className={`mt-1 font-literary text-sm font-medium ${
                  isPaper ? 'text-[#2D261E]' : 'text-[#EFEAE0]'
                }`}
              >
                {note.title}
              </h4>
              <p
                className={`devanagari-verse editorial-justify mt-1 text-xs leading-relaxed ${
                  isPaper ? 'text-[#4A3F33]' : 'text-[#C4BDB0]'
                }`}
              >
                {note.note}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
