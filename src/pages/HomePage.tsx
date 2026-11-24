import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Feather,
  Moon,
  Theater,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { BookCoverPreview } from '../components/BookCoverPreview';
import {
  CollectorFoilSeal,
  FolioCornerFiligree,
  InkRevealSection,
  ManuscriptDivider,
  ParallaxArtworkFrame,
} from '../components/FolioCraft';
import { InlineSongPlayer } from '../components/InlineSongPlayer';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ARTWORKS } from '../lib/artworks';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { MIDNIGHT_EXCERPTS } from '../data/midnightExcerpts';
import { MOOD_DEFINITIONS } from '../data/moodCatalog';

const ECOSYSTEM_ROOMS = [
  {
    num: '01',
    name: 'The Library',
    note: 'Novels, plays & preserved editions',
    to: '/books',
    previewQuote: '“Because some stories end on paper, but continue to live within us.”',
    previewMeta: 'Full PDF folios with Warm Paper, Sepia & Midnight reading modes',
  },
  {
    num: '02',
    name: 'About the Author',
    note: 'Biography, timeline & bibliography',
    to: '/author',
    previewQuote: 'Writing across Marathi, Hindi, and English — from 3:47 AM notebooks to the stage.',
    previewMeta: 'Chronology from 2024 to 2026 & complete publication record',
  },
  {
    num: '03',
    name: 'Poetry Room',
    note: 'Marathi · Hindi · English anthology',
    to: '/poetry',
    previewQuote: '“ती नसताना, तिच्याच आठवणींसोबत माणूस इतका जिवंत कसा राहू शकतो?”',
    previewMeta: '83+ numbered & illustrated poems with companion tracks & stanza cards',
  },
  {
    num: '04',
    name: 'The Theatre',
    note: 'Three-act Marathi stage script',
    to: '/theatre',
    previewQuote: 'रंगमंचावर फक्त एकच मोठं अर्धवट प्रश्नचिन्ह (?) आणि रात्री ३:४८ चा प्रकाश.',
    previewMeta: 'Revolving stage deck, lighting cues & 28 Marathi stage scenes',
  },
  {
    num: '05',
    name: 'Story Archives',
    note: 'Chapters & character dossiers',
    to: '/stories',
    previewQuote: 'From Project Nexus in Delhi to Arjun Kulkarni’s 3:47 AM hostel room.',
    previewMeta: 'Chapter indexes, character profiles & Story Memory Constellations',
  },
  {
    num: '06',
    name: 'Unsaid Journal',
    note: 'Prefaces & author reflections',
    to: '/journal',
    previewQuote: '“काही प्रश्न सुटण्यासाठी नसतात; ते फक्त विचारण्यासाठी असतात.”',
    previewMeta: 'Author’s prefaces, director’s stage notes & closing essays',
  },
  {
    num: '07',
    name: 'Midnight Page',
    note: 'Rotating manuscript excerpts',
    to: '/midnight-page',
    previewQuote: 'Curated late-night passages with Hindi & English translations side by side.',
    previewMeta: 'Quiet passages curated for after-hours reading',
  },
  {
    num: '08',
    name: 'Choose Your Mood',
    note: 'Discover works by emotion',
    to: '/moods',
    previewQuote: 'Viraha · Unspoken Love · Mystery · Self-Discovery · Moonlight',
    previewMeta: 'Eight emotional entryways connecting poems, novels & journal notes',
  },
  {
    num: '09',
    name: 'My Bookshelf',
    note: 'Saved favourites & reading memory',
    to: '/saved',
    previewQuote: 'Keep your reading position, bookmarked pages & favourite stanzas close.',
    previewMeta: 'Private local shelf saved directly in your browser',
  },
  {
    num: '10',
    name: 'UNDEFINED',
    note: 'An archive of unresolved moments',
    to: '/undefined',
    previewQuote: 'A quiet room reserved for thoughts that do not ask for a conclusion.',
    previewMeta: 'Atmospheric archival space & lingering fragments',
  },
];

export function HomePage() {
  useDocumentMeta(
    'TEJAS | BENIYAAZ ROOH: Literary Works by Tejas Purvesh Phirake',
    'Novels, Marathi theatre, multilingual poetry, story archives, and reflections by Tejas Purvesh Phirake. Some feelings leave. The words stay.'
  );

  const { books, poems, journal } = useCatalog();
  const prefersReducedMotion = useReducedMotion();

  const [midnightIdx, setMidnightIdx] = useState(0);
  const [selectedMoodKey, setSelectedMoodKey] = useState(MOOD_DEFINITIONS[0].key);
  const [activeRoomNum, setActiveRoomNum] = useState<string>(ECOSYSTEM_ROOMS[0].num);

  const isNocturnalHours = useMemo(() => {
    const h = new Date().getHours();
    return h >= 22 || h < 5;
  }, []);

  const activeRoom =
    ECOSYSTEM_ROOMS.find((r) => r.num === activeRoomNum) || ECOSYSTEM_ROOMS[0];

  const totalPages = useMemo(
    () => books.reduce((sum, b) => sum + (b.pageCount || 0), 0),
    [books]
  );

  const heroBook =
    books.find((b) => b.slug === 'a-love-truly-never-fades') ||
    books.find((b) => b.featured) ||
    books[0];

  const featuredBooks = useMemo(
    () => books.filter((b) => b.featured).slice(0, 4),
    [books]
  );
  const leadPublication = featuredBooks[0] || books[0];
  const shelfPublications = featuredBooks.slice(1, 4);

  const featuredPoem =
    poems.find((p) => p.slug === 'tujhya-saundaryachi-najaakat') ||
    poems.find((p) => p.featured) ||
    poems[0];

  const activeExcerpt = MIDNIGHT_EXCERPTS[midnightIdx] || MIDNIGHT_EXCERPTS[0];

  const activeMood = useMemo(
    () =>
      MOOD_DEFINITIONS.find((m) => m.key === selectedMoodKey) ||
      MOOD_DEFINITIONS[0],
    [selectedMoodKey]
  );

  const moodBooks = useMemo(
    () => books.filter((b) => activeMood.bookSlugs.includes(b.slug)),
    [books, activeMood]
  );
  const moodPoems = useMemo(
    () => poems.filter((p) => activeMood.poemCategories.includes(p.category)),
    [poems, activeMood]
  );

  return (
    <div className="divide-y divide-[#2B2823]">
      {/* 1. Asymmetric Editorial Hero */}
      <section className="section-reveal relative overflow-x-clip">
        <div className="mx-auto grid w-full max-w-6xl items-stretch gap-8 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Brand Identity, Author, Tagline, Dual Doors */}
          <div className="flex min-w-0 flex-col justify-center lg:col-span-6">
            <p className="text-xs font-medium tracking-[0.18em] text-[#C9A45C]">
              BENIYAAZ ROOH · Tejas Purvesh Phirake
              {isNocturnalHours ? ' · Late-Night Reading Hours' : ''}
            </p>
            <h1 className="mt-4 font-literary text-4xl font-medium leading-[1.06] tracking-tight text-[#F5F0E6] headline-balance sm:mt-5 sm:text-5xl lg:text-[3.85rem]">
              Some feelings leave.
              <br />
              <span className="italic text-[#DEC07C]">The words stay.</span>
            </h1>

            <motion.div
              initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left center' }}
              className="editorial-hairline mt-6 w-32"
              aria-hidden="true"
            />

            <p className="editorial-justify mt-5 max-w-xl text-base leading-[1.75] text-[#C4BDB0] sm:mt-6 sm:text-lg">
              The literary archive of{' '}
              <span className="text-[#F5F0E6]">Tejas Purvesh Phirake</span>:
              thrillers, Marathi fiction, a three-act play, and poetry in{' '}
              <span className="text-[#F5F0E6]">Marathi, Hindi, and English</span>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
              <Link
                to="/books"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-[#C9A45C] px-5 text-xs font-semibold tracking-wider text-[#0C0B0A] transition-colors duration-200 hover:bg-[#DEC07C] whitespace-nowrap sm:h-12 sm:px-7"
              >
                <BookOpen className="h-4 w-4" />
                <span>Explore The Library</span>
              </Link>
              <Link
                to="/author"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-[#C9A45C]/45 bg-[#141311] px-5 text-xs font-semibold tracking-wider text-[#EFEAE0] transition-colors duration-200 hover:border-[#DEC07C] hover:text-[#DEC07C] whitespace-nowrap sm:h-12 sm:px-7"
              >
                <Feather className="h-4 w-4 text-[#C9A45C]" />
                <span>Meet the Author</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Candlelit Manuscript Artwork + Featured Edition Plate */}
          <div className="flex min-w-0 flex-col lg:col-span-6">
            <div className="collector-folio-plate folio-frame relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-[#2B2823] bg-[#141311]">
              <div className="relative min-h-[250px] flex-1 sm:min-h-[340px]">
                <ParallaxArtworkFrame
                  src={ARTWORKS.heroDesk.src}
                  alt={ARTWORKS.heroDesk.alt}
                  fallbackTitle={ARTWORKS.heroDesk.fallbackTitle}
                  fallbackSubtitle={ARTWORKS.heroDesk.fallbackSubtitle}
                  priority
                  className="h-full w-full"
                  scrimClassName="bg-gradient-to-t from-[#0C0B0A] via-[#0C0B0A]/25 to-transparent"
                />
                <FolioCornerFiligree className="z-10 opacity-80" />
              </div>

              {heroBook && (
                <Link
                  to={`/books/${heroBook.slug}`}
                  className="group relative z-10 min-w-0 border-t border-[#2B2823] bg-[#131210]/95 p-4 transition-colors duration-200 hover:bg-[#1A1815] sm:p-5"
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-14 shrink-0 sm:w-20">
                      <BookCoverPreview book={heroBook} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#C9A45C]">
                        <span className="truncate">Featured Edition</span>
                        <span className="shrink-0 tabular-nums text-[#9A9285]">
                          {heroBook.pageCount} Pages
                        </span>
                      </div>
                      <h2 className="mt-1 truncate font-literary text-xl font-medium text-[#F5F0E6] transition-colors group-hover:text-[#DEC07C] sm:text-2xl">
                        {heroBook.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#C4BDB0]">
                        {heroBook.description}
                      </p>
                      <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#DEC07C]">
                        Open Publication <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width Archival Ledger */}
        <div className="border-t border-[#2B2823] bg-[#100F0D]">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-y divide-[#2B2823] px-4 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:px-6">
            <div className="py-5 sm:pr-6">
              <dt className="text-xs text-[#9A9285]">
                Books &amp; Editions
              </dt>
              <dd className="mt-1 font-literary text-3xl tabular-nums text-[#F5F0E6]">
                {books.length}
              </dd>
            </div>
            <div className="py-5 pl-4 sm:px-6">
              <dt className="text-xs text-[#9A9285]">
                Pages
              </dt>
              <dd className="mt-1 font-literary text-3xl tabular-nums text-[#F5F0E6]">
                {totalPages}
              </dd>
            </div>
            <div className="py-5 sm:px-6">
              <dt className="text-xs text-[#9A9285]">
                Poems
              </dt>
              <dd className="mt-1 font-literary text-3xl tabular-nums text-[#F5F0E6]">
                {poems.length}
              </dd>
            </div>
            <div className="py-5 pl-4 sm:pl-6">
              <dt className="text-xs text-[#9A9285]">
                Languages
              </dt>
              <dd className="devanagari-verse mt-1 font-literary text-xl text-[#DEC07C] sm:text-2xl">
                मराठी · हिंदी · English
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 2. The Library — Featured Publications */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2B2823] pb-6">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-[#C9A45C]">
              I · The Library
            </p>
            <h2 className="mt-1.5 font-literary text-3xl font-medium text-[#F5F0E6] headline-balance sm:text-4xl">
              Featured Publications
            </h2>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-1.5 text-sm text-[#DEC07C] transition-colors hover:text-[#F5F0E6]"
          >
            Enter The Library ({books.length}) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* Lead Publication (open catalog layout, zero puffy box) */}
          {leadPublication && (
            <article className="group flex min-w-0 flex-col gap-6 border-b border-[#2B2823] pb-8 sm:flex-row sm:items-center lg:col-span-6 lg:border-b-0 lg:pb-0">
              <Link to={`/books/${leadPublication.slug}`} className="mx-auto w-40 shrink-0 sm:mx-0 sm:w-48">
                <BookCoverPreview book={leadPublication} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-xs text-[#C9A45C]">
                  {leadPublication.language} · {leadPublication.genre} ·{' '}
                  <span className="tabular-nums">{leadPublication.pageCount}p</span>
                </p>
                <Link to={`/books/${leadPublication.slug}`}>
                  <h3 className="mt-2 font-literary text-3xl font-medium leading-snug text-[#F5F0E6] transition-colors group-hover:text-[#DEC07C]">
                    {leadPublication.title}
                  </h3>
                </Link>
                {leadPublication.subtitle && (
                  <p className="mt-1 font-literary text-base italic text-[#9A9285]">
                    {leadPublication.subtitle}
                  </p>
                )}
                <p className="editorial-justify mt-3 line-clamp-4 text-sm leading-relaxed text-[#C4BDB0]">
                  {leadPublication.description}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    to={`/read/${leadPublication.slug}`}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-[#C9A45C] px-5 text-xs font-semibold tracking-wider text-[#0C0B0A] transition-colors duration-200 hover:bg-[#DEC07C]"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Read Online</span>
                  </Link>
                  <Link
                    to={`/books/${leadPublication.slug}`}
                    className="text-xs font-medium text-[#DEC07C] hover:underline"
                  >
                    Book Details →
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Secondary Curated Shelf */}
          <div className="min-w-0 divide-y divide-[#2B2823] border-y border-[#2B2823] lg:col-span-6">
            {shelfPublications.map((book) => (
              <article
                key={book.id}
                className="group flex items-center gap-5 py-4 first:pt-2 last:pb-2"
              >
                <Link to={`/books/${book.slug}`} className="w-16 shrink-0 sm:w-20">
                  <BookCoverPreview book={book} />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#9A9285]">
                    {book.language} · {book.genre} ·{' '}
                    <span className="tabular-nums">{book.pageCount} pages</span>
                  </p>
                  <Link to={`/books/${book.slug}`}>
                    <h3 className="devanagari-verse mt-1 truncate font-literary text-2xl font-medium text-[#F5F0E6] transition-colors group-hover:text-[#DEC07C]">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="mt-1 line-clamp-1 text-xs text-[#C4BDB0]">
                    {book.subtitle || book.description}
                  </p>
                  <div className="mt-2.5 flex items-center gap-4 text-xs font-medium">
                    <Link
                      to={`/read/${book.slug}`}
                      className="text-[#DEC07C] hover:underline"
                    >
                      Read Online
                    </Link>
                    <span aria-hidden="true" className="text-[#2B2823]">
                      /
                    </span>
                    <Link
                      to={`/books/${book.slug}`}
                      className="text-[#9A9285] hover:text-[#F5F0E6]"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. About the Author & Literary Index */}
      <section className="bg-[#100F0D]">
        <InkRevealSection className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <div className="collector-folio-plate folio-frame relative min-w-0 rounded-md border border-[#2B2823] bg-[#141311] p-7 sm:p-9 lg:col-span-5">
              <FolioCornerFiligree />
              <p className="text-xs font-medium tracking-[0.14em] text-[#C9A45C]">
                II · About the Author
              </p>
              <h2 className="mt-2 font-literary text-3xl font-medium text-[#F5F0E6] sm:text-4xl">
                Tejas Purvesh Phirake
              </h2>
              <p className="mt-1 text-xs tracking-wide text-[#9A9285]">
                तेजस पुर्वेश फिरके · BENIYAAZ ROOH
              </p>

              <ManuscriptDivider className="my-5" />

              <p className="editorial-justify text-sm leading-[1.8] text-[#C4BDB0] sm:text-base">
                <span className="text-[#F5F0E6]">Tejas Purvesh Phirake</span> writes
                across Marathi, Hindi, and English: novels, stage drama, and poetry
                shaped by unspoken feelings, memory, and ordinary life.
              </p>
              <p className="mt-5 font-literary text-xl italic leading-relaxed text-[#DEC07C]">
                “Because some stories end on paper, but continue to live within us.”
              </p>
              <div className="mt-6 border-t border-[#2B2823] pt-5">
                <CollectorFoilSeal compact />
              </div>
              <div className="mt-5 flex flex-wrap gap-5 border-t border-[#2B2823] pt-4 text-sm font-medium">
                <Link to="/author" className="inline-flex items-center gap-1.5 text-[#DEC07C] hover:underline">
                  Author&apos;s Archive <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/about" className="text-[#C4BDB0] transition-colors hover:text-[#F5F0E6]">
                  Full Biography →
                </Link>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <div className="flex items-end justify-between border-b border-[#2B2823] pb-4">
                <div>
                  <p className="text-xs font-medium tracking-[0.14em] text-[#C9A45C]">
                    Complete Literary Index
                  </p>
                  <h3 className="mt-1 font-literary text-2xl text-[#F5F0E6]">
                    Rooms &amp; Archives
                  </h3>
                </div>
                <span className="text-xs tabular-nums text-[#9A9285]">
                  {ECOSYSTEM_ROOMS.length} Rooms
                </span>
              </div>
              <div className="mt-2 grid divide-y divide-[#2B2823] border-b border-[#2B2823] sm:grid-cols-2 sm:gap-x-8">
                {ECOSYSTEM_ROOMS.map((room) => {
                  const isActive = room.num === activeRoom.num;
                  return (
                    <Link
                      key={room.num}
                      to={room.to}
                      onMouseEnter={() => setActiveRoomNum(room.num)}
                      onFocus={() => setActiveRoomNum(room.num)}
                      className={`group flex min-w-0 items-baseline justify-between gap-3 py-3.5 transition-colors hover:text-[#DEC07C] ${
                        isActive ? 'text-[#DEC07C]' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="mr-2.5 font-literary text-xs tabular-nums text-[#C9A45C]">
                          {room.num}
                        </span>
                        <span
                          className={`font-literary text-xl transition-colors group-hover:text-[#DEC07C] ${
                            isActive ? 'text-[#DEC07C]' : 'text-[#F5F0E6]'
                          }`}
                        >
                          {room.name}
                        </span>
                        <p className="truncate pl-6 text-xs text-[#9A9285]">{room.note}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#9A9285] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#DEC07C]" />
                    </Link>
                  );
                })}
              </div>

              {/* Interactive Desk Preview Plate for hovered/focused room */}
              <div className="mt-5 flex flex-col justify-between gap-3 rounded-md border border-[#2B2823] bg-[#141311]/90 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-[#C9A45C]">
                    Room {activeRoom.num} · {activeRoom.name}
                  </p>
                  <p className="devanagari-verse mt-1.5 font-literary text-lg italic leading-snug text-[#EFEAE0]">
                    {activeRoom.previewQuote}
                  </p>
                  <p className="mt-1 text-xs text-[#9A9285]">{activeRoom.previewMeta}</p>
                </div>
                <Link
                  to={activeRoom.to}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded border border-[#C9A45C]/50 bg-[#0C0B0A] px-4 text-xs font-medium text-[#DEC07C] transition-colors hover:bg-[#C9A45C] hover:text-[#0C0B0A] whitespace-nowrap"
                >
                  <span>Enter Room</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </InkRevealSection>
      </section>

      {/* 4. Poetry Broadsheet Spotlight */}
      {featuredPoem && (
        <section className="bg-[#0C0B0A]">
          <InkRevealSection className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              <div className="min-w-0 lg:col-span-5">
                <div className="group folio-frame overflow-hidden rounded-md border border-[#2B2823] bg-[#141311]">
                  <ParallaxArtworkFrame
                    src={ARTWORKS.poetryQuill.src}
                    alt={ARTWORKS.poetryQuill.alt}
                    fallbackTitle={ARTWORKS.poetryQuill.fallbackTitle}
                    fallbackSubtitle={ARTWORKS.poetryQuill.fallbackSubtitle}
                    className="aspect-[4/3] w-full"
                    imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                  />
                </div>

                <p className="mt-6 text-xs font-medium tracking-[0.14em] text-[#C9A45C]">
                  III · The Poetry Room
                </p>
                <h2 className="devanagari-verse mt-2 font-literary text-3xl font-medium text-[#F5F0E6] headline-balance sm:text-4xl">
                  {featuredPoem.title}
                </h2>
                <p className="mt-2 text-xs text-[#9A9285]">
                  {featuredPoem.language} · {featuredPoem.category}
                  {featuredPoem.partName ? ` · ${featuredPoem.partName}` : ''}
                </p>

                {featuredPoem.songs && featuredPoem.songs.length > 0 && (
                  <div className="mt-5 border-t border-[#2B2823] pt-4">
                    <p className="text-xs text-[#9A9285]">
                      Companion Melody
                    </p>
                    <div className="mt-2.5 space-y-2.5">
                      {featuredPoem.songs.map((song) => (
                        <InlineSongPlayer key={song.title} song={song} compact />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    to={`/poetry/${featuredPoem.slug}`}
                    className="inline-flex h-11 items-center gap-2 rounded-md border border-[#C9A45C]/60 px-5 text-xs font-medium tracking-wider text-[#DEC07C] transition-colors duration-200 hover:bg-[#C9A45C] hover:text-[#0C0B0A]"
                  >
                    Read Full Poem
                  </Link>
                  <Link
                    to="/poetry"
                    className="inline-flex h-11 items-center text-xs font-medium text-[#C4BDB0] hover:text-[#F5F0E6]"
                  >
                    All {poems.length} Poems →
                  </Link>
                </div>
              </div>

              <div className="min-w-0 lg:col-span-7">
                <ProtectedReadingSurface showWatermark>
                  <blockquote className="collector-folio-plate folio-frame relative rounded-md border border-[#2B2823] bg-[#131210] p-7 sm:p-12">
                    <FolioCornerFiligree />
                    <pre className="devanagari-verse max-w-full whitespace-pre-wrap break-words text-base leading-[2] text-[#F5F0E6] sm:text-lg">
                      {featuredPoem.body}
                    </pre>
                    <ManuscriptDivider className="mt-8" />
                    <footer className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      <CollectorFoilSeal compact />
                      <span className="text-xs tracking-wider text-[#9A9285]">
                        ~ {featuredPoem.author}
                      </span>
                    </footer>
                  </blockquote>
                </ProtectedReadingSurface>
              </div>
            </div>
          </InkRevealSection>
        </section>
      )}

      {/* 5. The Theatre & Story Archives Diptych */}
      <section className="bg-[#100F0D]">
        <InkRevealSection className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22">
          <div className="grid gap-8 md:grid-cols-2">
            {/* IV · Marathi Theatre */}
            <article className="group collector-folio-plate folio-frame flex flex-col overflow-hidden rounded-md border border-[#2B2823] bg-[#141311] transition-colors duration-200 hover:border-[#C9A45C]/45">
              <ParallaxArtworkFrame
                src={ARTWORKS.theatreStage.src}
                alt={ARTWORKS.theatreStage.alt}
                fallbackTitle={ARTWORKS.theatreStage.fallbackTitle}
                fallbackSubtitle={ARTWORKS.theatreStage.fallbackSubtitle}
                className="aspect-[16/10] w-full"
                imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              />
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                <div>
                  <p className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C9A45C]">
                    <Theater className="h-3.5 w-3.5" />
                    <span>IV · The Theatre · तीन अंकी मराठी नाटक</span>
                  </p>
                  <h2 className="devanagari-verse mt-2.5 font-literary text-3xl text-[#F5F0E6]">
                    मीच प्रश्न, मीच उत्तर (नाट्यसंहिता)
                  </h2>
                  <p className="editorial-justify mt-3 text-sm leading-relaxed text-[#C4BDB0]">
                    Three acts, 28 stage scenes, cast list, the suspended question-mark
                    stage architecture (<span className="text-[#DEC07C]">?</span>), verbatim
                    opening scenes, and director&apos;s notes.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    to="/theatre"
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-[#C9A45C] px-5 text-xs font-semibold tracking-wider text-[#0C0B0A] transition-colors duration-200 hover:bg-[#DEC07C]"
                  >
                    Enter The Theatre <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>

            {/* V · Story Archives */}
            <article className="group collector-folio-plate folio-frame flex flex-col overflow-hidden rounded-md border border-[#2B2823] bg-[#141311] transition-colors duration-200 hover:border-[#C9A45C]/45">
              <ParallaxArtworkFrame
                src={ARTWORKS.thrillerStudy.src}
                alt={ARTWORKS.thrillerStudy.alt}
                fallbackTitle={ARTWORKS.thrillerStudy.fallbackTitle}
                fallbackSubtitle={ARTWORKS.thrillerStudy.fallbackSubtitle}
                className="aspect-[16/10] w-full"
                imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              />
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                <div>
                  <p className="text-xs font-medium tracking-[0.12em] text-[#C9A45C]">
                    V · Story Archives · Fiction &amp; Thrillers
                  </p>
                  <h2 className="mt-2.5 font-literary text-3xl text-[#F5F0E6]">
                    Chapters &amp; Character Dossiers
                  </h2>
                  <p className="editorial-justify mt-3 text-sm leading-relaxed text-[#C4BDB0]">
                    Chapter indexes and character notes from{' '}
                    <span className="italic text-[#DEC07C]">Chupke Chupke Sach 1 &amp; 2</span> and{' '}
                    <span className="text-[#DEC07C]">मीच प्रश्न, मीच उत्तर</span>.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    to="/stories"
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-[#C9A45C]/60 bg-[#0C0B0A] px-5 text-xs font-semibold tracking-wider text-[#DEC07C] transition-colors duration-200 hover:bg-[#C9A45C] hover:text-[#0C0B0A]"
                  >
                    Explore Story Archives <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </InkRevealSection>
      </section>

      {/* 6. Expanded Midnight Page Showcase */}
      {activeExcerpt && (
        <section className="bg-[#0C0B0A]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2B2823] pb-5">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-[#C9A45C]">
                  <Moon className="h-3.5 w-3.5" />
                  <span>
                    VI · The Midnight Page · Excerpt {midnightIdx + 1} / {MIDNIGHT_EXCERPTS.length}
                  </span>
                </p>
                <h2 className="mt-1.5 font-literary text-3xl font-medium text-[#F5F0E6] headline-balance sm:text-4xl">
                  Late-Night Lines &amp; Turning Points
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMidnightIdx(
                      (i) => (i - 1 + MIDNIGHT_EXCERPTS.length) % MIDNIGHT_EXCERPTS.length
                    )
                  }
                  aria-label="Previous midnight excerpt"
                  className="inline-flex h-9 w-9 items-center justify-center rounded border border-[#2B2823] bg-[#141311] text-[#C4BDB0] transition-colors hover:border-[#C9A45C] hover:text-[#DEC07C]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMidnightIdx((i) => (i + 1) % MIDNIGHT_EXCERPTS.length)
                  }
                  aria-label="Next midnight excerpt"
                  className="inline-flex h-9 w-9 items-center justify-center rounded border border-[#2B2823] bg-[#141311] text-[#C4BDB0] transition-colors hover:border-[#C9A45C] hover:text-[#DEC07C]"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <Link
                  to="/midnight-page"
                  className="ml-2 text-xs font-medium text-[#DEC07C] hover:underline"
                >
                  Explore All {MIDNIGHT_EXCERPTS.length} Excerpts →
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-stretch">
              <ProtectedReadingSurface
                className="collector-folio-plate folio-frame relative flex flex-col justify-between rounded-md border border-[#2B2823] bg-[#12110F] p-7 sm:p-11 lg:col-span-8"
                showWatermark
              >
                <FolioCornerFiligree />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeExcerpt.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="flex h-full flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9A9285]">
                        <span className="font-medium text-[#C9A45C]">
                          {activeExcerpt.highlightTag || activeExcerpt.sourceType}
                        </span>
                        <span className="capitalize">
                          {activeExcerpt.sourceType} · {activeExcerpt.language}
                          {activeExcerpt.pageLabel ? ` · ${activeExcerpt.pageLabel}` : ''}
                        </span>
                      </div>

                      <pre className="devanagari-verse mt-6 max-w-full whitespace-pre-wrap break-words font-literary text-xl leading-[1.95] text-[#F5F0E6] sm:text-2xl">
                        {activeExcerpt.quote}
                      </pre>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#2B2823] pt-4 text-xs">
                      <span className="devanagari-verse text-[#DEC07C]">
                        {activeExcerpt.sourceTitle}
                      </span>
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/midnight-page?excerpt=${activeExcerpt.id}`}
                          className="text-[#9A9285] hover:text-[#DEC07C]"
                        >
                          Translations (HI/EN)
                        </Link>
                        <Link
                          to={activeExcerpt.targetUrl}
                          className="inline-flex items-center gap-1 font-medium text-[#DEC07C] hover:underline"
                        >
                          Read in Context <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </ProtectedReadingSurface>

              {/* Companion Midnight Desk Index */}
              <div className="flex flex-col justify-between rounded-md border border-[#2B2823] bg-[#141311] p-5 lg:col-span-4">
                <div>
                  <p className="text-xs font-medium text-[#C9A45C]">
                    On the Midnight Desk
                  </p>
                  <p className="editorial-justify mt-1.5 text-xs leading-relaxed text-[#9A9285]">
                    Select an excerpt to read at midnight, or open the full archive for Hindi and English translations.
                  </p>

                  <div className="mt-4 divide-y divide-[#2B2823] border-y border-[#2B2823]">
                    {MIDNIGHT_EXCERPTS.slice(0, 5).map((item, idx) => {
                      const isSelected = idx === midnightIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMidnightIdx(idx)}
                          className={`block w-full py-3 text-left transition-colors ${
                            isSelected
                              ? 'text-[#DEC07C]'
                              : 'text-[#C4BDB0] hover:text-[#F5F0E6]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-[#9A9285]">
                            <span className={isSelected ? 'text-[#C9A45C]' : ''}>
                              {item.highlightTag || item.sourceType}
                            </span>
                            <span className="tabular-nums">
                              #{String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <p className="devanagari-verse mt-1 truncate font-literary text-base">
                            {item.sourceTitle}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Link
                  to="/midnight-page"
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded border border-[#C9A45C]/50 bg-[#0C0B0A] px-4 text-xs font-medium text-[#DEC07C] transition-colors hover:bg-[#C9A45C] hover:text-[#0C0B0A]"
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Open Full Midnight Room ({MIDNIGHT_EXCERPTS.length})</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Choose Your Mood: Hairline-Ruled Interactive Matrix */}
      <section className="bg-[#100F0D]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2B2823] pb-6">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[#C9A45C]">
                By Mood
              </p>
              <h2 className="mt-1.5 font-literary text-3xl font-medium text-[#F5F0E6] sm:text-4xl">
                Choose Your Mood
              </h2>
            </div>
            <Link to="/moods" className="text-sm text-[#DEC07C] hover:underline">
              Open Mood Explorer →
            </Link>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-12">
            <div className="min-w-0 divide-y divide-[#2B2823] border-y border-[#2B2823] lg:col-span-6">
              {MOOD_DEFINITIONS.map((mood) => {
                const isSelected = mood.key === activeMood.key;
                return (
                  <button
                    key={mood.key}
                    type="button"
                    onClick={() => setSelectedMoodKey(mood.key)}
                    className={`flex w-full items-center justify-between gap-4 px-3.5 py-3.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#1C1A17] text-[#F5F0E6]'
                        : 'text-[#C4BDB0] hover:bg-[#141311]'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="devanagari-verse text-xs text-[#C9A45C]">
                        {mood.devanagariLabel}
                      </span>
                      <span className="ml-3 font-literary text-xl text-[#F5F0E6]">
                        {mood.title}
                      </span>
                    </div>
                    <ArrowRight
                      className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                        isSelected ? 'translate-x-0.5 text-[#DEC07C]' : 'text-[#9A9285]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="folio-frame flex min-w-0 flex-col justify-between rounded-md border border-[#2B2823] bg-[#141311] p-6 sm:p-8 lg:col-span-6">
              <div>
                <p className="devanagari-verse text-xs font-medium text-[#C9A45C]">
                  {activeMood.devanagariLabel}
                </p>
                <h3 className="mt-1.5 font-literary text-3xl text-[#F5F0E6]">
                  {activeMood.title}
                </h3>
                <p className="editorial-justify mt-3 text-sm leading-relaxed text-[#C4BDB0]">
                  {activeMood.description}
                </p>

                <div className="mt-6 space-y-2.5 border-t border-[#2B2823] pt-5">
                  {moodBooks.slice(0, 2).map((b) => (
                    <Link
                      key={b.id}
                      to={`/books/${b.slug}`}
                      className="flex items-center justify-between text-sm text-[#EFEAE0] hover:text-[#DEC07C]"
                    >
                      <span className="truncate">{b.title}</span>
                      <span className="ml-3 shrink-0 text-xs text-[#9A9285]">
                        {b.language}
                      </span>
                    </Link>
                  ))}
                  {moodPoems.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      to={`/poetry/${p.slug}`}
                      className="flex items-center justify-between text-sm text-[#C4BDB0] hover:text-[#DEC07C]"
                    >
                      <span className="devanagari-verse truncate">{p.title}</span>
                      <span className="ml-3 shrink-0 text-xs text-[#9A9285]">
                        {p.language}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-[#2B2823] pt-4 text-xs">
                <span className="tabular-nums text-[#9A9285]">
                  {moodBooks.length} Books · {moodPoems.length} Poems
                </span>
                <Link
                  to={`/moods?mood=${activeMood.key}`}
                  className="font-medium text-[#DEC07C] hover:underline"
                >
                  Explore This Mood →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Unsaid Journal Preview */}
      <section className="bg-[#0C0B0A]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-22">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#2B2823] pb-6">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[#C9A45C]">
                Unsaid Journal
              </p>
              <h2 className="mt-1.5 font-literary text-3xl font-medium text-[#F5F0E6] sm:text-4xl">
                Author&apos;s Notes &amp; Prefaces
              </h2>
            </div>
            <Link to="/journal" className="text-sm text-[#DEC07C] hover:underline">
              Read All Notes →
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {journal.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                to={`/journal/${post.slug}`}
                className="group folio-frame flex min-w-0 flex-col justify-between rounded-md border border-[#2B2823] bg-[#141311] p-6 transition-colors duration-200 hover:border-[#C9A45C]/45"
              >
                <div>
                  <p className="text-xs text-[#9A9285]">
                    {post.sourceLabel} · {post.language}
                  </p>
                  <h3 className="mt-2.5 font-literary text-2xl text-[#F5F0E6] transition-colors group-hover:text-[#DEC07C]">
                    {post.title}
                  </h3>
                  <p className="editorial-justify mt-2.5 line-clamp-3 text-xs leading-relaxed text-[#C4BDB0]">
                    {post.excerpt}
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#DEC07C]">
                  Read Note <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
