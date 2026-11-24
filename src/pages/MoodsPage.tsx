import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { BookCoverPreview } from '../components/BookCoverPreview';
import {
  FolioCornerFiligree,
  InkRevealSection,
  ManuscriptDivider,
} from '../components/FolioCraft';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { MOOD_DEFINITIONS } from '../data/moodCatalog';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import type { MoodKey } from '../types/literary';

export function MoodsPage() {
  useDocumentMeta(
    'Choose Your Mood: Emotion-Guided Literary Discovery',
    'Discover books, Marathi/Hindi/English poems, and reflections by Tejas Purvesh Phirake through emotion-based literary moods.'
  );

  const { books, poems, journal } = useCatalog();
  const { state, toggleFavourite } = useReader();
  const [searchParams, setSearchParams] = useSearchParams();

  const moodParam = searchParams.get('mood') as MoodKey | null;
  const activeMood = useMemo(
    () =>
      MOOD_DEFINITIONS.find((m) => m.key === moodParam) || MOOD_DEFINITIONS[0],
    [moodParam]
  );

  const selectMood = (key: MoodKey) => {
    const next = new URLSearchParams(searchParams);
    next.set('mood', key);
    setSearchParams(next);
  };

  const matchingBooks = useMemo(
    () => books.filter((b) => activeMood.bookSlugs.includes(b.slug)),
    [books, activeMood.bookSlugs]
  );

  const matchingPoems = useMemo(
    () => poems.filter((p) => activeMood.poemCategories.includes(p.category)),
    [poems, activeMood.poemCategories]
  );

  const matchingJournal = useMemo(
    () => journal.filter((j) => activeMood.journalSlugs.includes(j.slug)),
    [journal, activeMood.journalSlugs]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2B2823] pb-10">
        <p className="text-xs font-medium text-[#C9A45C]">
          Read by Mood
        </p>
        <h1 className="mt-2 font-literary text-4xl font-medium text-[#EFEAE0] headline-balance sm:text-5xl">
          Choose Your Mood
        </h1>
        <p className="editorial-justify mt-3 max-w-2xl text-sm leading-relaxed text-[#C4BDB0] sm:text-base">
          Pick a mood to find matching books, poems, and author notes.
        </p>

        {/* Hairline-Ruled Mood Selector Matrix */}
        <div className="mt-8 grid overflow-hidden rounded-md border border-[#2B2823] bg-[#2B2823] gap-px sm:grid-cols-2 lg:grid-cols-4">
          {MOOD_DEFINITIONS.map((mood) => {
            const isSelected = mood.key === activeMood.key;
            const bookCount = books.filter((b) =>
              mood.bookSlugs.includes(b.slug)
            ).length;
            const poemCount = poems.filter((p) =>
              mood.poemCategories.includes(p.category)
            ).length;
            const journalCount = journal.filter((j) =>
              mood.journalSlugs.includes(j.slug)
            ).length;
            const totalItems = bookCount + poemCount + journalCount;

            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => selectMood(mood.key)}
                className={`flex flex-col p-5 text-left transition-colors ${
                  isSelected
                    ? 'bg-[#1C1A17] shadow-[inset_0_2px_0_0_#C9A45C]'
                    : 'bg-[#0C0B0A] hover:bg-[#141311]'
                }`}
              >
                <span className="devanagari-verse text-xs font-medium text-[#C9A45C]">
                  {mood.devanagariLabel}
                </span>
                <span
                  className={`mt-1.5 font-literary text-xl ${
                    isSelected ? 'text-[#DEC07C]' : 'text-[#EFEAE0]'
                  }`}
                >
                  {mood.title}
                </span>
                <span className="mt-2 text-xs tabular-nums text-[#9A9285]">
                  {totalItems} matching works
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Active Mood Banner */}
      <section className="collector-folio-plate folio-frame relative mt-10 rounded-md border border-[#2B2823] bg-[#141311] p-6 sm:p-8">
        <FolioCornerFiligree />
        <p className="devanagari-verse text-xs font-medium text-[#C9A45C]">
          {activeMood.devanagariLabel}
        </p>
        <h2 className="mt-1.5 font-literary text-3xl text-[#EFEAE0]">
          {activeMood.title}
        </h2>
        <ManuscriptDivider className="my-4" />
        <p className="editorial-justify max-w-2xl text-sm leading-relaxed text-[#C4BDB0]">
          {activeMood.description}
        </p>
      </section>

      {/* Matching Books */}
      {matchingBooks.length > 0 && (
        <InkRevealSection className="mt-10">
          <h3 className="text-xs font-medium text-[#C9A45C]">
            Books &amp; Editions ({matchingBooks.length})
          </h3>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {matchingBooks.map((book) => (
              <div
                key={book.id}
                className="collector-folio-plate flex gap-4 rounded-md border border-[#2B2823] bg-[#141311] p-4 transition-colors hover:border-[#C9A45C]/50"
              >
                <Link to={`/books/${book.slug}`} className="w-24 shrink-0">
                  <BookCoverPreview book={book} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[11px] tabular-nums text-[#C9A45C]">
                    {book.language} · {book.pageCount}p
                  </p>
                  <Link to={`/books/${book.slug}`}>
                    <h4 className="mt-1 font-literary text-xl leading-snug text-[#EFEAE0] hover:text-[#DEC07C]">
                      {book.title}
                    </h4>
                  </Link>
                  <p className="editorial-justify mt-1.5 line-clamp-2 text-xs text-[#9A9285]">
                    {book.description}
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-3 text-xs font-medium">
                    <Link
                      to={`/read/${book.slug}`}
                      className="text-[#DEC07C] hover:underline"
                    >
                      Read Online
                    </Link>
                    <Link
                      to={`/books/${book.slug}`}
                      className="text-[#C4BDB0] hover:text-[#EFEAE0]"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InkRevealSection>
      )}

      {/* Matching Poems */}
      {matchingPoems.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xs font-medium text-[#C9A45C]">
              Poems ({matchingPoems.length})
            </h3>
            {activeMood.poemCategories[0] && (
              <Link
                to={`/poetry?cat=${encodeURIComponent(activeMood.poemCategories[0])}`}
                className="inline-flex items-center gap-1 text-xs text-[#DEC07C] hover:underline"
              >
                Open in Poetry Room <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {matchingPoems.slice(0, 12).map((poem) => {
              const isFav = state.favouritePoemIds.includes(poem.id);
              const previewLines = poem.body.split('\n').slice(0, 3).join('\n');
              return (
              <article
                key={poem.id}
                className="collector-folio-plate flex flex-col rounded-md border border-[#2B2823] bg-[#141311] p-5 transition-colors hover:border-[#C9A45C]/50"
              >
                  <div className="flex items-center justify-between gap-2 text-xs text-[#9A9285]">
                    <span>
                      {poem.language} · {poem.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFavourite(poem.id)}
                      aria-label={isFav ? 'Remove favourite' : 'Save poem'}
                      className={`p-1 transition-colors ${
                        isFav
                          ? 'text-[#DEC07C]'
                          : 'text-[#9A9285] hover:text-[#EFEAE0]'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <Link to={`/poetry/${poem.slug}`} className="mt-2 block">
                    <h4 className="devanagari-verse font-literary text-xl text-[#EFEAE0] hover:text-[#DEC07C]">
                      {poem.title}
                    </h4>
                  </Link>
                  <ProtectedReadingSurface className="mt-3 flex-1">
                    <pre className="devanagari-verse line-clamp-3 max-w-full whitespace-pre-wrap break-words text-xs leading-relaxed text-[#C4BDB0]">
                      {previewLines}
                    </pre>
                  </ProtectedReadingSurface>

                  <Link
                    to={`/poetry/${poem.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#DEC07C] hover:underline"
                  >
                    Read Full Verse <ArrowRight className="h-3 w-3" />
                  </Link>
                </article>
              );
            })}
          </div>
          {matchingPoems.length > 12 && activeMood.poemCategories[0] && (
            <div className="mt-6 text-center">
              <Link
                to={`/poetry?cat=${encodeURIComponent(activeMood.poemCategories[0])}`}
                className="inline-flex h-10 items-center gap-2 rounded border border-[#C9A45C]/50 px-5 text-xs font-medium text-[#DEC07C] hover:bg-[#C9A45C] hover:text-[#0C0B0A]"
              >
                View All {matchingPoems.length} Poems in This Mood →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Matching Journal Notes */}
      {matchingJournal.length > 0 && (
        <section className="mt-12">
          <h3 className="text-xs font-medium text-[#C9A45C]">
            The Unsaid Journal ({matchingJournal.length})
          </h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {matchingJournal.map((post) => (
              <Link
                key={post.id}
                to={`/journal/${post.slug}`}
                className="group rounded-md border border-[#2B2823] bg-[#141311] p-5 transition-colors hover:border-[#C9A45C]/50"
              >
                <p className="text-xs text-[#9A9285]">
                  {post.sourceLabel} · {post.language}
                </p>
                <h4 className="mt-1.5 font-literary text-xl text-[#EFEAE0] group-hover:text-[#DEC07C]">
                  {post.title}
                </h4>
                <p className="editorial-justify mt-2 line-clamp-2 text-xs leading-relaxed text-[#C4BDB0]">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
