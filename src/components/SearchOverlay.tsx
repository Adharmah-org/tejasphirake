import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Feather, FileText, Search, Theater, Users, X } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { STORY_ARCHIVES_DATA } from '../data/storiesArchiveData';
import { THEATRE_ACTS, THEATRE_PLAY_META } from '../data/theatreArchiveData';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

interface SearchHit {
  key: string;
  group: 'Library' | 'Poetry' | 'Stories' | 'Theatre' | 'Journal';
  title: string;
  subtitle: string;
  to: string;
  actionLabel: string;
  devanagari?: boolean;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { books, poems, journal } = useCatalog();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  const normalized = query.trim().toLowerCase();

  const hits = useMemo<SearchHit[]>(() => {
    const items: SearchHit[] = [];

    if (!normalized) {
      books.slice(0, 4).forEach((b) =>
        items.push({
          key: `book-${b.id}`,
          group: 'Library',
          title: b.title,
          subtitle: `${b.genre} · ${b.language} · ${b.pageCount} pages`,
          to: `/books/${b.slug}`,
          actionLabel: 'View',
        })
      );
      poems.slice(0, 5).forEach((p) =>
        items.push({
          key: `poem-${p.id}`,
          group: 'Poetry',
          title: `${p.title}${p.englishSubtitle ? ` · ${p.englishSubtitle}` : ''}`,
          subtitle: `${p.language} · ${p.category}`,
          to: `/poetry/${p.slug}`,
          actionLabel: 'Read',
          devanagari: true,
        })
      );
      journal.slice(0, 3).forEach((j) =>
        items.push({
          key: `journal-${j.id}`,
          group: 'Journal',
          title: j.title,
          subtitle: j.sourceLabel,
          to: `/journal/${j.slug}`,
          actionLabel: 'Read',
        })
      );
      return items;
    }

    books
      .filter((b) =>
        `${b.title} ${b.subtitle ?? ''} ${b.genre} ${b.language} ${b.description}`
          .toLowerCase()
          .includes(normalized)
      )
      .slice(0, 6)
      .forEach((b) =>
        items.push({
          key: `book-${b.id}`,
          group: 'Library',
          title: b.title,
          subtitle: `${b.genre} · ${b.language} · ${b.pageCount} pages`,
          to: `/books/${b.slug}`,
          actionLabel: 'View',
        })
      );

    poems
      .filter((p) =>
        `${p.title} ${p.englishSubtitle ?? ''} ${p.body} ${p.category} ${p.language} ${
          p.songs?.map((s) => s.title).join(' ') ?? ''
        }`
          .toLowerCase()
          .includes(normalized)
      )
      .slice(0, 8)
      .forEach((p) =>
        items.push({
          key: `poem-${p.id}`,
          group: 'Poetry',
          title: `${p.title}${p.englishSubtitle ? ` · ${p.englishSubtitle}` : ''}`,
          subtitle: `${p.language} · ${p.category}${
            p.songs?.[0]?.title ? ` · ♪ ${p.songs[0].title}` : ''
          }`,
          to: `/poetry/${p.slug}`,
          actionLabel: 'Read',
          devanagari: true,
        })
      );

    for (const dossier of STORY_ARCHIVES_DATA) {
      for (const ch of dossier.chapters) {
        if (
          `${dossier.title} ${ch.title} ${ch.partLabel ?? ''}`
            .toLowerCase()
            .includes(normalized)
        ) {
          items.push({
            key: `${dossier.id}-ch-${ch.page}`,
            group: 'Stories',
            title: `${ch.numberLabel}. ${ch.title}`,
            subtitle: `${dossier.title} · Page ${ch.page}`,
            to: `/read/${dossier.bookSlug}?page=${ch.page}`,
            actionLabel: 'Open',
            devanagari: true,
          });
        }
      }
      for (const c of dossier.characters) {
        if (
          `${c.name} ${c.role} ${c.description}`.toLowerCase().includes(normalized)
        ) {
          items.push({
            key: c.id,
            group: 'Stories',
            title: c.name,
            subtitle: `${c.role} · ${dossier.title}`,
            to: `/stories?story=${encodeURIComponent(dossier.slug)}`,
            actionLabel: 'Dossier',
            devanagari: true,
          });
        }
      }
    }

    for (const act of THEATRE_ACTS) {
      for (const scene of act.scenes) {
        if (
          `${act.actNumber} ${act.title} ${scene.sceneNumber} ${scene.title}`
            .toLowerCase()
            .includes(normalized)
        ) {
          items.push({
            key: `${act.actNumber}-${scene.sceneNumber}`,
            group: 'Theatre',
            title: `${scene.sceneNumber}: ${scene.title}`,
            subtitle: `${act.actNumber} · Page ${scene.page}`,
            to: `/read/${THEATRE_PLAY_META.bookSlug}?page=${scene.page}`,
            actionLabel: 'Read',
            devanagari: true,
          });
        }
      }
    }

    journal
      .filter((j) =>
        `${j.title} ${j.excerpt} ${j.content} ${j.sourceLabel}`
          .toLowerCase()
          .includes(normalized)
      )
      .slice(0, 4)
      .forEach((j) =>
        items.push({
          key: `journal-${j.id}`,
          group: 'Journal',
          title: j.title,
          subtitle: j.sourceLabel,
          to: `/journal/${j.slug}`,
          actionLabel: 'Read',
        })
      );

    return items;
  }, [books, poems, journal, normalized]);

  useEffect(() => {
    setActiveIndex(0);
  }, [normalized]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown' && hits.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % hits.length);
      } else if (e.key === 'ArrowUp' && hits.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + hits.length) % hits.length);
      } else if (e.key === 'Enter' && hits[activeIndex]) {
        const target = document.activeElement;
        if (target === inputRef.current) {
          e.preventDefault();
          navigate(hits[activeIndex].to);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, hits, activeIndex, navigate]);

  if (!open) return null;

  const groupedOrder: SearchHit['group'][] = [
    'Library',
    'Poetry',
    'Stories',
    'Theatre',
    'Journal',
  ];

  const renderGroupIcon = (group: SearchHit['group']) => {
    switch (group) {
      case 'Library':
        return <BookOpen className="h-4 w-4 shrink-0 text-[#C9A45C]" />;
      case 'Poetry':
        return <Feather className="h-4 w-4 shrink-0 text-[#C9A45C]" />;
      case 'Stories':
        return <Users className="h-4 w-4 shrink-0 text-[#C9A45C]" />;
      case 'Theatre':
        return <Theater className="h-4 w-4 shrink-0 text-[#C9A45C]" />;
      default:
        return <FileText className="h-4 w-4 shrink-0 text-[#C9A45C]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 px-4 pt-16 backdrop-blur-sm sm:pt-24"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search literary archive"
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-md border border-[#2B2823] bg-[#141311] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#2B2823] px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-[#C9A45C]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, poems, characters, chapters, play scenes, or journal notes..."
            className="w-full bg-transparent text-sm text-[#EFEAE0] placeholder-[#9A9285] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded text-[#9A9285] transition-colors hover:bg-[#1C1A17] hover:text-[#EFEAE0]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5">
          {hits.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-literary text-xl text-[#EFEAE0]">
                No works matched “{query}”.
              </p>
              <p className="mt-1 text-sm text-[#9A9285]">
                Try searching by Marathi or Hindi title, English subtitle, character name, or category.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedOrder.map((groupName) => {
                const groupHits = hits
                  .map((hit, idx) => ({ hit, idx }))
                  .filter((entry) => entry.hit.group === groupName);
                if (groupHits.length === 0) return null;

                return (
                  <div key={groupName}>
                    <h3 className="mb-2 text-xs font-medium text-[#9A9285]">
                      {groupName} ({groupHits.length})
                    </h3>
                    <div className="divide-y divide-[#2B2823]/70 border-y border-[#2B2823]">
                      {groupHits.map(({ hit, idx }) => {
                        const isSelected = idx === activeIndex;
                        return (
                          <Link
                            key={hit.key}
                            to={hit.to}
                            onClick={onClose}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`flex items-center justify-between gap-4 px-2 py-3 transition-colors ${
                              isSelected
                                ? 'bg-[#1C1A17] text-[#DEC07C]'
                                : 'hover:bg-[#1C1A17]/60 hover:text-[#DEC07C]'
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {renderGroupIcon(hit.group)}
                              <div className="min-w-0">
                                <p
                                  className={`truncate font-literary text-base text-[#EFEAE0] ${
                                    hit.devanagari ? 'devanagari-verse' : ''
                                  }`}
                                >
                                  {hit.title}
                                </p>
                                <p className="truncate text-xs text-[#9A9285]">
                                  {hit.subtitle}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 text-xs text-[#C9A45C]">
                              {hit.actionLabel}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#2B2823] bg-[#0C0B0A] px-5 py-2.5 text-[11px] text-[#9A9285]">
          <span>Use ↑ ↓ arrows to navigate, Enter to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
