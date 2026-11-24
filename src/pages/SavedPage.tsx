import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Check, Copy, Feather, Heart, Image as ImageIcon, Trash2 } from 'lucide-react';
import { KeepsakeCardModal } from '../components/KeepsakeCardModal';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { SavedStanzaNote } from '../types/literary';

export function SavedPage() {
  useDocumentMeta(
    'My Bookshelf: Saved Bookmarks, Favourites & Reading Progress',
    'Your locally saved book reading progress, page bookmarks, favourite poems, saved stanzas, and recently viewed works.'
  );

  const { books, poems } = useCatalog();
  const { state, toggleFavourite, toggleBookmark, removeStanzaNote, clearHistory } =
    useReader();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cardTarget, setCardTarget] = useState<SavedStanzaNote | null>(null);

  const favouritePoems = poems.filter((p) => state.favouritePoemIds.includes(p.id));
  const booksWithProgress = books
    .map((b) => ({
      book: b,
      progress: state.progressBySlug[b.slug],
      bookmarks: state.bookmarksBySlug[b.slug] ?? [],
    }))
    .filter((item) => item.progress || item.bookmarks.length > 0);

  const handleCopyStanza = async (item: SavedStanzaNote) => {
    const formatted = `“${item.stanzaText}”\n\n— ${item.poemTitle}\nTejas Purvesh Phirake · BENIYAAZ ROOH`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2B2823] pb-8">
        <p className="text-xs font-medium text-[#C9A45C]">Local Bookshelf</p>
        <h1 className="mt-2 font-literary text-4xl font-medium text-[#EFEAE0] headline-balance sm:text-5xl">
          My Bookshelf
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#C4BDB0]">
          Saved privately in this browser with no account required: your reading
          positions, bookmarked pages, favourite poems, collected stanzas, and recently
          visited works.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        {/* Book Reading Progress & Page Bookmarks */}
        <section className="min-w-0 lg:col-span-6">
          <h2 className="font-literary text-2xl text-[#EFEAE0]">
            Books in Progress &amp; Page Bookmarks
          </h2>

          {booksWithProgress.length === 0 ? (
            <div className="mt-4 border-t border-[#2B2823] pt-4 text-sm text-[#9A9285]">
              Open any book in the online reader to track reading progress and bookmark
              specific pages.{' '}
              <Link to="/books" className="text-[#DEC07C] hover:underline">
                Browse Library →
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {booksWithProgress.map(({ book, progress, bookmarks }) => {
                const pct =
                  progress && progress.totalPages > 0
                    ? Math.round((progress.currentPage / progress.totalPages) * 100)
                    : 0;
                return (
                  <div
                    key={book.id}
                    className="rounded-md border border-[#2B2823] bg-[#141311] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/books/${book.slug}`}
                          className="font-literary text-xl text-[#EFEAE0] hover:text-[#DEC07C]"
                        >
                          {book.title}
                        </Link>
                        {progress && (
                          <p className="mt-1 text-xs tabular-nums text-[#9A9285]">
                            Last read: Page {progress.currentPage} of {progress.totalPages}{' '}
                            ({pct}%)
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/read/${book.slug}`}
                        className="shrink-0 rounded bg-[#C9A45C] px-3.5 py-1.5 text-xs font-semibold text-[#0C0B0A] hover:bg-[#DEC07C]"
                      >
                        Resume
                      </Link>
                    </div>

                    {pct > 0 && (
                      <div className="mt-3 h-1 w-full overflow-hidden bg-[#2B2823]">
                        <div className="h-full bg-[#C9A45C]" style={{ width: `${pct}%` }} />
                      </div>
                    )}

                    {bookmarks.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#2B2823] pt-3">
                        <Bookmark className="h-3.5 w-3.5 text-[#C9A45C]" />
                        {bookmarks.map((bm) => (
                          <div
                            key={bm.page}
                            className="inline-flex items-center overflow-hidden rounded border border-[#2B2823] bg-[#0C0B0A] text-xs"
                          >
                            <Link
                              to={`/read/${book.slug}?page=${bm.page}`}
                              className="px-2.5 py-1 tabular-nums text-[#EFEAE0] hover:text-[#DEC07C]"
                            >
                              Page {bm.page}
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleBookmark(book.slug, bm.page)}
                              aria-label={`Remove bookmark on page ${bm.page}`}
                              className="border-l border-[#2B2823] px-2 py-1 text-[#9A9285] hover:text-[#EFEAE0]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Favourite Poems */}
        <section className="min-w-0 lg:col-span-6">
          <h2 className="font-literary text-2xl text-[#EFEAE0]">
            Favourite Poems ({favouritePoems.length})
          </h2>

          {favouritePoems.length === 0 ? (
            <div className="mt-4 border-t border-[#2B2823] pt-4 text-sm text-[#9A9285]">
              Heart any poem in the Poetry Room to keep it close here.{' '}
              <Link to="/poetry" className="text-[#DEC07C] hover:underline">
                Enter Poetry →
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#2B2823] border-y border-[#2B2823]">
              {favouritePoems.map((poem) => (
                <div
                  key={poem.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <Link to={`/poetry/${poem.slug}`} className="min-w-0 flex-1">
                    <p className="truncate font-literary text-xl text-[#EFEAE0] hover:text-[#DEC07C]">
                      {poem.title}
                    </p>
                    <p className="text-xs text-[#9A9285]">
                      {poem.language} · {poem.category}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavourite(poem.id)}
                    aria-label="Remove from favourites"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#C9A45C] hover:bg-[#1C1A17]"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Saved Stanzas & Personal Reflections */}
      <section className="mt-14 border-t border-[#2B2823] pt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#C9A45C]">
              <Feather className="h-3.5 w-3.5" />
              <span>Collected Verses</span>
            </div>
            <h2 className="mt-1 font-literary text-2xl text-[#EFEAE0]">
              Saved Stanzas &amp; Personal Notes ({state.savedStanzas.length})
            </h2>
          </div>
          <Link to="/poetry" className="text-xs text-[#DEC07C] hover:underline">
            Explore Poetry Room →
          </Link>
        </div>

        {state.savedStanzas.length === 0 ? (
          <p className="mt-4 text-sm text-[#9A9285]">
            Tap any stanza inside a poem and choose <span className="text-[#DEC07C]">Save Line</span> to keep specific verses and personal reflections here.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {state.savedStanzas.map((entry) => (
              <article
                key={entry.id}
                className="flex flex-col justify-between rounded-md border border-[#2B2823] bg-[#141311] p-5"
              >
                <div>
                  <Link
                    to={`/poetry/${entry.poemSlug}`}
                    className="text-xs font-medium text-[#C9A45C] hover:underline"
                  >
                    {entry.poemTitle} →
                  </Link>
                  <pre className="devanagari-verse mt-3 whitespace-pre-wrap font-literary text-base leading-relaxed text-[#EFEAE0]">
                    {entry.stanzaText}
                  </pre>
                  {entry.note && (
                    <p className="mt-3 border-t border-[#2B2823] pt-2.5 text-xs italic text-[#DEC07C]">
                      “{entry.note}”
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#2B2823] pt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyStanza(entry)}
                    className="inline-flex items-center gap-1 rounded border border-[#2B2823] bg-[#0C0B0A] px-2.5 py-1 text-[#C4BDB0] hover:border-[#C9A45C] hover:text-[#DEC07C]"
                  >
                    {copiedId === entry.id ? (
                      <Check className="h-3 w-3 text-[#C9A45C]" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copiedId === entry.id ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTarget(entry)}
                    className="inline-flex items-center gap-1 rounded border border-[#2B2823] bg-[#0C0B0A] px-2.5 py-1 text-[#DEC07C] hover:border-[#C9A45C]"
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span>Ek Panna Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStanzaNote(entry.id)}
                    aria-label="Remove saved stanza"
                    className="inline-flex items-center gap-1 rounded border border-[#2B2823] bg-[#0C0B0A] px-2.5 py-1 text-[#9A9285] hover:text-[#EFEAE0]"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed History */}
      <section className="mt-14 border-t border-[#2B2823] pt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-literary text-2xl text-[#EFEAE0]">Recently Viewed</h2>
          {state.recentlyViewed.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-[#9A9285] hover:text-[#DEC07C]"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear History
            </button>
          )}
        </div>

        {state.recentlyViewed.length === 0 ? (
          <p className="mt-4 text-sm text-[#9A9285]">
            Your recently opened books, poems, and notes will appear here.
          </p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.recentlyViewed.map((item) => {
              const target =
                item.type === 'book'
                  ? `/books/${item.slug}`
                  : item.type === 'poem'
                    ? `/poetry/${item.slug}`
                    : `/journal/${item.slug}`;
              return (
                <Link
                  key={`${item.type}-${item.slug}`}
                  to={target}
                  className="rounded-md border border-[#2B2823] bg-[#141311] p-4 transition-colors hover:border-[#C9A45C]/50"
                >
                  <p className="text-xs font-medium capitalize text-[#C9A45C]">
                    {item.type}
                  </p>
                  <p className="mt-1 truncate font-literary text-lg text-[#EFEAE0]">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="mt-0.5 truncate text-xs text-[#9A9285]">
                      {item.subtitle}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Reader Preferences */}
      <section className="mt-14 border-t border-[#2B2823] pt-10">
        <div>
          <h2 className="font-literary text-2xl text-[#EFEAE0]">Reading Preferences</h2>
          <p className="mt-1 text-xs text-[#9A9285]">
            Your saved Poetry Room and PDF reading display settings in this browser.
          </p>
        </div>

        <div className="mt-5 grid gap-4 rounded-md border border-[#2B2823] bg-[#141311] p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-[#C9A45C]">Verse Font Size</p>
            <p className="mt-1 text-sm tabular-nums text-[#EFEAE0]">
              {state.preferences.fontSizePx}px
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#C9A45C]">Poetry Surface</p>
            <p className="mt-1 text-sm capitalize text-[#EFEAE0]">
              {state.preferences.surfaceMode}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#C9A45C]">PDF Reader Theme</p>
            <p className="mt-1 text-sm capitalize text-[#EFEAE0]">
              {state.preferences.pdfReadingMode}
            </p>
          </div>
        </div>
      </section>

      {cardTarget && (
        <KeepsakeCardModal
          open={Boolean(cardTarget)}
          onClose={() => setCardTarget(null)}
          title={cardTarget.poemTitle}
          text={cardTarget.stanzaText}
          slug={cardTarget.poemSlug}
          initialPassage={cardTarget.stanzaText}
        />
      )}
    </div>
  );
}
