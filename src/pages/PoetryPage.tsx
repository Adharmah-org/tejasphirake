import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Feather, Heart, Music2, Search } from 'lucide-react';
import { AmbientSoundscapeToggle } from '../components/AmbientSoundscapeToggle';
import {
  InkRevealSection,
  ManuscriptDivider,
  ParallaxArtworkFrame,
} from '../components/FolioCraft';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { POEM_CATEGORIES, POEM_LANGUAGES } from '../data/poemsIndex';
import { ARTWORKS } from '../lib/artworks';
import { useDocumentMeta } from '../lib/useDocumentMeta';

interface PreciousLineEntry {
  id: string;
  slug: string;
  poemTitle: string;
  language: 'मराठी' | 'हिंदी' | 'English';
  theme: string;
  lines: string;
}

const PRECIOUS_POETRY_LINES: PreciousLineEntry[] = [
  {
    id: 'precious-nasleli-ti',
    slug: 'nasleli-ti',
    poemTitle: 'नसलेली ती',
    language: 'मराठी',
    theme: 'विरह',
    lines: `आज परीक्षा द्यायला गेलो, नियतीने पुन्हा डाव मांडला,
तिच्या आठवणींचाच पेपर माझ्यासमोर उघडला.
सगळी उत्तरं लिहिली मी, एकच कोरं राहिलं,
ते उत्तर शोधताना डोळ्यांतून सारं वाहिलं.`,
  },
  {
    id: 'precious-najaakat',
    slug: 'tujhya-saundaryachi-najaakat',
    poemTitle: 'तुझ्या सौंदर्याची नजाकत...',
    language: 'मराठी',
    theme: 'सौंदर्य',
    lines: `चंद्राचं सौंदर्य कागदावर उतरवता येईल कदाचित,
पण तुझं ?
तुला पाहिल्यावर शब्दही सुंदर होतात...
आणि तरीही अपुरेच राहतात.`,
  },
  {
    id: 'precious-hasnyacha-chandana',
    slug: 'tujhya-hasnyacha-chandana',
    poemTitle: 'तुझ्या हसण्याचं चांदणं...',
    language: 'मराठी',
    theme: 'एकतर्फी प्रेम',
    lines: `तू हसलीस... अन् माझ्या कोऱ्या कवितेला
पहिली ओळ मिळाली...
तुला ठाऊकही नसेल, त्या क्षणांचं मोल किती,
तुझ्या नकळत कुणाच्या मनात उमलते कविता किती...`,
  },
  {
    id: 'precious-adhuri-dastaan',
    slug: 'adhuri-dastaan',
    poemTitle: 'Adhuri Dastaan',
    language: 'हिंदी',
    theme: 'विरह',
    lines: `Ajeeb hai yeh dastaan mohabbat ki,
Jise dil se chaha, use pa na sake, aur itna chaha ki umr bhar bhula na sake.`,
  },
  {
    id: 'precious-bhaakri-aani-kavita',
    slug: 'bhaakri-aani-kavita',
    poemTitle: 'भाकरी आणि कविता',
    language: 'मराठी',
    theme: 'जीवन',
    lines: `कवितेने पोट भरत नाही, खरंय,
पोट भरायला भाकरी असते.
पण भाकरी खाल्ल्यावर जी जागा रिकामी राहते,
तिथे कुणीतरी हळूच शब्द ठेवावे लागतात.`,
  },
  {
    id: 'precious-petals-falling',
    slug: 'petals-falling',
    poemTitle: 'Petals Falling',
    language: 'English',
    theme: 'Unsaid Feelings',
    lines: `If I were a flower, you would see my petals fall one by one
as you look into his eyes.
You cannot see my heart breaking, but that does not mean I am all right.`,
  },
  {
    id: 'precious-bhulana-chahta',
    slug: 'bhulana-chahta-bhi-nahi',
    poemTitle: 'Bhulana Chahta Bhi Nahi',
    language: 'हिंदी',
    theme: 'विरह',
    lines: `Baat ye nahi ki main usey bhula nahi paa raha.
Sach toh ye hai ki main usey bhulana hi nahi chahta.`,
  },
  {
    id: 'precious-kojagiri',
    slug: 'kojagiri-standalone-edition',
    poemTitle: 'कोजागरी (दूर असलेला चंद्र)',
    language: 'मराठी',
    theme: 'विरह',
    lines: `चंद्र आजही उगवतो, चांदणं आजही बरसतं,
फक्त तू नसताना, हे सुंदर आकाशही परकं वाटतं.`,
  },
];

export function PoetryPage() {
  useDocumentMeta(
    'Poetry Room · BENIYAAZ ROOH',
    'Read original Marathi, Hindi, and English poetry by Tejas Purvesh Phirake under BENIYAAZ ROOH. Every poem preserved verbatim.'
  );

  const { poems } = useCatalog();
  const { state, toggleFavourite } = useReader();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeLang = searchParams.get('lang') || 'all';
  const activeCat = searchParams.get('cat') || 'all';
  const [query, setQuery] = useState('');

  const setFilter = (key: 'lang' | 'cat', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const filteredPoems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return poems.filter((p) => {
      if (activeLang !== 'all' && p.language !== activeLang) return false;
      if (activeCat !== 'all' && p.category !== activeCat) return false;
      if (
        q &&
        !`${p.title} ${p.englishSubtitle ?? ''} ${p.body} ${p.partName ?? ''} ${
          p.songs?.map((s) => s.title).join(' ') ?? ''
        }`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [poems, activeLang, activeCat, query]);

  const visiblePreciousLines = useMemo(() => {
    if (query.trim()) return [];
    return PRECIOUS_POETRY_LINES.filter(
      (entry) =>
        (activeLang === 'all' || entry.language === activeLang) &&
        (activeCat === 'all' || entry.theme === activeCat)
    );
  }, [activeLang, activeCat, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      {/* Poetry Universe Header */}
      <header className="border-b border-[#2B2823] pb-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-8">
            <p className="text-xs font-medium text-[#C9A45C]">
              BENIYAAZ ROOH · Anthology
            </p>
            <h1 className="mt-3 font-literary text-4xl font-medium text-[#EFEAE0] headline-balance sm:text-5xl">
              The Poetry Room
            </h1>
            <p className="editorial-justify mt-3 max-w-2xl text-sm leading-relaxed text-[#C4BDB0] sm:text-base">
              A multilingual anthology across{' '}
              <span className="text-[#EFEAE0]">मराठी, हिंदी, and English</span>. Every verse,
              line break, date, and song pairing is preserved verbatim from{' '}
              <span className="italic text-[#DEC07C]">A Love Truly Never Fades</span>,
              standalone illustrated editions, and notebook pages.
            </p>
          </div>

          <div className="hidden lg:col-span-4 lg:block">
            <div className="collector-folio-plate folio-frame overflow-hidden rounded-md border border-[#2B2823] bg-[#141311]">
              <ParallaxArtworkFrame
                src={ARTWORKS.poetryQuill.src}
                alt={ARTWORKS.poetryQuill.alt}
                fallbackTitle={ARTWORKS.poetryQuill.fallbackTitle}
                fallbackSubtitle={ARTWORKS.poetryQuill.fallbackSubtitle}
                className="aspect-[16/10]"
              />
            </div>
          </div>
        </div>

        {/* Language & Category Filter Controls */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilter('lang', 'all')}
                className={`rounded px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeLang === 'all'
                    ? 'bg-[#C9A45C] text-[#0C0B0A]'
                    : 'border border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:text-[#EFEAE0]'
                }`}
              >
                All Languages ({poems.length})
              </button>
              {POEM_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setFilter('lang', lang)}
                  className={`rounded px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    activeLang === lang
                      ? 'bg-[#C9A45C] text-[#0C0B0A]'
                      : 'border border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:text-[#EFEAE0]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9A9285]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search poem, line, or song..."
                className="h-10 w-full rounded border border-[#2B2823] bg-[#141311] pl-9 pr-3 text-xs text-[#EFEAE0] placeholder-[#9A9285] focus:border-[#C9A45C] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('cat', 'all')}
              className={`rounded px-3 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 ${
                activeCat === 'all'
                  ? 'border border-[#C9A45C] bg-[#1C1A17] text-[#DEC07C]'
                  : 'border border-[#2B2823]/80 bg-[#0F0E0C] text-[#9A9285] hover:text-[#EFEAE0]'
              }`}
            >
              All Themes
            </button>
            {POEM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter('cat', cat)}
                className={`rounded px-3 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 ${
                  activeCat === cat
                    ? 'border border-[#C9A45C] bg-[#1C1A17] text-[#DEC07C]'
                    : 'border border-[#2B2823]/80 bg-[#0F0E0C] text-[#9A9285] hover:text-[#EFEAE0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#9A9285]">
        <div className="flex items-center gap-4">
          <span className="tabular-nums">
            Showing {filteredPoems.length} {filteredPoems.length === 1 ? 'poem' : 'poems'}
          </span>
          {(activeLang !== 'all' || activeCat !== 'all' || query) && (
            <button
              type="button"
              onClick={() => {
                setSearchParams({});
                setQuery('');
              }}
              className="text-[#DEC07C] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
        <AmbientSoundscapeToggle />
      </div>

      {/* Most Precious Lines · Curated Verbatim Couplets in Kavita Kaksh */}
      {visiblePreciousLines.length > 0 && (
        <section
          aria-labelledby="precious-lines-heading"
          className="mt-8 rounded-md border border-[#2B2823] bg-[#11100E] p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#2B2823] pb-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C9A45C]">
                <Feather className="h-3.5 w-3.5" />
                <span>Kavita Kaksh · Selected Couplets</span>
              </p>
              <h2
                id="precious-lines-heading"
                className="mt-1.5 font-literary text-2xl font-medium text-[#EFEAE0] sm:text-3xl"
              >
                Most Precious Lines
              </h2>
            </div>
            <p className="text-xs italic text-[#9A9285]">
              Lines kept close to the candle
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {visiblePreciousLines.map((entry) => (
              <article
                key={entry.id}
                className="collector-folio-plate flex flex-col justify-between rounded-md border border-[#2B2823]/90 bg-[#141311] p-5 transition-colors hover:border-[#C9A45C]/50"
              >
                <ProtectedReadingSurface>
                  <blockquote className="devanagari-verse whitespace-pre-line border-l-2 border-[#C9A45C]/55 pl-4 text-sm leading-relaxed text-[#EFEAE0] sm:text-[15px]">
                    {entry.lines}
                  </blockquote>
                </ProtectedReadingSurface>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#2B2823]/70 pt-3 text-xs">
                  <div className="min-w-0 text-[#9A9285]">
                    <span className="font-literary text-sm text-[#DEC07C]">
                      {entry.poemTitle}
                    </span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>{entry.language}</span>
                  </div>
                  <Link
                    to={`/poetry/${entry.slug}`}
                    className="shrink-0 font-medium text-[#DEC07C] hover:underline"
                  >
                    Read Full Poem
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {filteredPoems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-literary text-2xl text-[#EFEAE0]">
            No poems matched your selection.
          </p>
          <p className="mt-2 text-sm text-[#9A9285]">
            Try clearing one of the language or emotion filters.
          </p>
        </div>
      ) : (
        <InkRevealSection className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPoems.map((poem) => {
            const isFav = state.favouritePoemIds.includes(poem.id);
            const firstStanza = poem.body.split('\n').slice(0, 4).join('\n');

            return (
              <article
                key={poem.id}
                className="group collector-folio-plate flex flex-col justify-between rounded-md border border-[#2B2823] bg-[#141311] p-6 transition-colors hover:border-[#C9A45C]/55"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9A9285]">
                      {poem.number ? (
                        <span className="tabular-nums text-[#C9A45C]">
                          #{String(poem.number).padStart(2, '0')}
                        </span>
                      ) : null}
                      <span>{poem.language}</span>
                      <span aria-hidden="true">·</span>
                      <span>{poem.category}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavourite(poem.id)}
                      aria-label={isFav ? 'Remove from favourites' : 'Save poem to favourites'}
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors ${
                        isFav
                          ? 'text-[#C9A45C]'
                          : 'text-[#9A9285] hover:text-[#DEC07C]'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <Link to={`/poetry/${poem.slug}`} className="mt-3 block">
                    <h2 className="font-literary text-2xl font-medium text-[#EFEAE0] group-hover:text-[#DEC07C]">
                      {poem.title}
                    </h2>
                    {poem.englishSubtitle && (
                      <p className="mt-0.5 text-xs tracking-wide text-[#9A9285]">
                        {poem.englishSubtitle}
                      </p>
                    )}
                  </Link>

                  <ProtectedReadingSurface className="mt-4">
                    <Link to={`/poetry/${poem.slug}`} className="block">
                      <p className="devanagari-verse line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-[#C4BDB0]">
                        {firstStanza}
                      </p>
                    </Link>
                  </ProtectedReadingSurface>
                </div>

                  <ManuscriptDivider className="mt-5 mb-3.5" />
                  <div className="flex items-center justify-between text-xs">
                  {poem.songs?.[0] ? (
                    <span className="flex min-w-0 items-center gap-1.5 text-[#9A9285]">
                      <Music2 className="h-3.5 w-3.5 shrink-0 text-[#C9A45C]" />
                      <span className="truncate">{poem.songs[0].title}</span>
                    </span>
                  ) : (
                    <span className="text-[#9A9285]">{poem.dateLabel || poem.sourceTitle}</span>
                  )}
                  <Link
                    to={`/poetry/${poem.slug}`}
                    className="ml-3 shrink-0 font-medium text-[#DEC07C] hover:underline"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            );
          })}
        </InkRevealSection>
      )}
    </div>
  );
}
