import { Link } from 'react-router-dom';
import { BookOpen, Feather } from 'lucide-react';
import { BookCoverPreview } from '../components/BookCoverPreview';
import {
  CollectorFoilSeal,
  FolioCornerFiligree,
  InkRevealSection,
  ManuscriptDivider,
} from '../components/FolioCraft';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function AuthorPage() {
  useDocumentMeta(
    'Tejas Purvesh Phirake: Author Profile & Archive',
    'Official literary archive of Tejas Purvesh Phirake (TEJAS · BENIYAAZ ROOH): novels, Marathi three-act theatre, poetry collection, and editions.'
  );

  const { books, poems } = useCatalog();

  const totalPages = books.reduce((sum, b) => sum + (b.pageCount || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      {/* Authentic Author Identity */}
      <header className="grid gap-10 border-b border-[#2B2823] pb-12 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <p className="text-xs font-medium text-[#C9A45C]">
            Author · Poet · Storyteller
          </p>
          <h1 className="mt-3 font-literary text-4xl font-medium text-[#EFEAE0] headline-balance sm:text-5xl">
            Tejas Purvesh Phirake
          </h1>
          <p className="mt-2 font-literary text-xl italic text-[#DEC07C]">
            तेजस पुर्वेश फिरके · “Some feelings leave. The words stay.”
          </p>

          <ProtectedReadingSurface className="mt-6 max-w-2xl">
            <div className="editorial-justify space-y-4 text-base leading-relaxed text-[#C4BDB0]">
              <p>
                <span className="text-[#EFEAE0]">Tejas Purvesh Phirake</span> is an
                independent Indian writer whose work centres on human emotions,
                unspoken feelings, relationships, and the questions people carry
                silently.
              </p>
              <p>
                Writing in Marathi, Hindi, and English across poetry, fiction, and
                stage drama, he often draws from ordinary moments: an unfinished
                conversation, a familiar face, a distant memory, or a question left
                unasked.
              </p>
              <p>
                His books include{' '}
                <Link
                  to="/books/a-love-truly-never-fades"
                  className="italic text-[#DEC07C] hover:underline"
                >
                  A Love Truly Never Fades
                </Link>
                , a multilingual poetry collection;{' '}
                <Link
                  to="/books/chupke-chupke-sach"
                  className="italic text-[#DEC07C] hover:underline"
                >
                  Chupke Chupke Sach
                </Link>
                , a thriller about hidden truth; and{' '}
                <Link
                  to="/books/meech-prashna-meech-uttar"
                  className="text-[#DEC07C] hover:underline"
                >
                  मीच प्रश्न, मीच उत्तर
                </Link>
                , a Marathi novel following student expectations, identity, and
                self-discovery.
              </p>
              <p>
                For him, writing is less about ornament and more about giving shape
                to thoughts that usually go unsaid, moving between tenderness and
                confrontation, silence and memory.
              </p>
              <p>
                This archive brings together his published books, poems, stories,
                and stage plays in one place.
              </p>
            </div>

            <blockquote className="mt-6 border-y border-[#C9A45C]/30 py-4 font-literary text-xl italic text-[#EFEAE0]">
              Because some stories end on paper, but continue to live within us.
              <footer className="mt-1.5 text-sm not-italic tracking-wider text-[#C9A45C]">
                ~ Tejas Purvesh Phirake
              </footer>
            </blockquote>
          </ProtectedReadingSurface>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/books"
              className="inline-flex h-11 items-center gap-2 rounded bg-[#C9A45C] px-5 text-xs font-semibold text-[#0C0B0A] transition-colors hover:bg-[#DEC07C]"
            >
              <BookOpen className="h-4 w-4" /> Explore Books
            </Link>
            <Link
              to="/poetry"
              className="inline-flex h-11 items-center gap-2 rounded border border-[#2B2823] bg-[#141311] px-5 text-xs font-medium text-[#EFEAE0] hover:border-[#C9A45C]"
            >
              <Feather className="h-4 w-4 text-[#C9A45C]" /> Enter Poetry Room
            </Link>
          </div>
        </div>

        <aside className="min-w-0 lg:col-span-4">
          <div className="collector-folio-plate folio-frame relative rounded-md border border-[#2B2823] bg-[#141311] p-6">
            <FolioCornerFiligree />
            <dl className="divide-y divide-[#2B2823] text-sm">
              <div className="pb-4">
                <dt className="text-xs text-[#9A9285]">
                  Literary Signature
                </dt>
                <dd className="mt-1 font-medium text-[#EFEAE0]">TEJAS · BENIYAAZ ROOH</dd>
              </div>
              <div className="py-4">
                <dt className="text-xs text-[#9A9285]">
                  Languages
                </dt>
                <dd className="mt-1 text-[#C4BDB0]">Marathi · Hindi · English</dd>
              </div>
              <div className="py-4">
                <dt className="text-xs text-[#9A9285]">
                  Literary Forms
                </dt>
                <dd className="mt-1 text-[#C4BDB0]">
                  Poetry · Fiction · Drama · Psychological Storytelling
                </dd>
              </div>
              <div className="py-4">
                <dt className="text-xs text-[#9A9285]">
                  Published Catalogue
                </dt>
                <dd className="mt-1 tabular-nums text-[#DEC07C]">
                  {books.length} Editions · {totalPages} Pages · {poems.length} Poems
                </dd>
              </div>
            </dl>
            <ManuscriptDivider className="my-5" />
            <CollectorFoilSeal compact />
          </div>
        </aside>
      </header>

      {/* Literary Chronology & Edition History */}
      <InkRevealSection className="mt-14 border-t border-[#2B2823] pt-12">
        <div className="mb-8">
          <p className="text-xs font-medium text-[#C9A45C]">
            Publication Chronology &amp; Edition Lineage
          </p>
          <h2 className="mt-2 font-literary text-3xl font-medium text-[#EFEAE0]">
            Literary Timeline (2024 to 2026)
          </h2>
          <p className="editorial-justify mt-2 max-w-2xl text-sm text-[#9A9285]">
            Chronology of books, alternate editions, stage scripts, and poetry
            collections published under TEJAS · BENIYAAZ ROOH.
          </p>
        </div>

        <ol className="divide-y divide-[#2B2823] border-y border-[#2B2823]">
          {[
            {
              era: '2024 to 2026',
              work: 'BENIYAAZ.ROOH Notebook & A LOVE TRULY NEVER FADES',
              note: '98-page multilingual anthology collecting 83 numbered poems across Marathi, Hindi, and English with paired companion tracks.',
              to: '/books/a-love-truly-never-fades',
            },
            {
              era: 'Nov 2025',
              work: 'CHUPKE CHUPKE SACH.. (Part I)',
              note: '61-page Hinglish investigative thriller introducing Riya Malhotra, Kabir Arora, Project Nexus, and Mr. X.',
              to: '/books/chupke-chupke-sach',
            },
            {
              era: 'Jan 2026',
              work: 'CHUPKE CHUPKE SACH 2: The Anonymous X',
              note: '51-page cyber thriller sequel uncovering Ghost Protocol, Black Archive, and Neural Access Core.',
              to: '/books/chupke-chupke-sach-2',
            },
            {
              era: 'Mar 2026',
              work: 'मीच प्रश्न, मीच उत्तर · Standard Print (129p) & MBL Edition (179p)',
              note: '31-chapter Marathi novel about student expectations and self-questioning, with “आईच्या वहीतून” poems.',
              to: '/books/meech-prashna-meech-uttar',
            },
            {
              era: 'Apr 2026',
              work: 'मीच प्रश्न, मीच उत्तर · तीन अंकी मराठी नाटक (46p)',
              note: 'Three-Act, 28-Scene Marathi stage drama adaptation featuring the half-drawn question mark (?) stage motif and director’s notes.',
              to: '/theatre',
            },
            {
              era: '2026 Editions',
              work: 'Standalone Illustrated Poetry Keepsakes',
              note: 'Five individual illustrated editions: नसलेली ती, कोजागरी (दूर असलेला चंद्र), तुझ्या सौंदर्याची नजाकत..., तुझ्या हसण्याचं चांदणं..., and दिवस निसटले...',
              to: '/books?section=special-editions',
            },
          ].map((milestone) => (
            <li
              key={milestone.work}
              className="flex flex-col justify-between gap-3 py-5 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium tabular-nums text-[#C9A45C]">
                  {milestone.era}
                </span>
                <h3 className="devanagari-verse mt-1 font-literary text-xl text-[#EFEAE0]">
                  {milestone.work}
                </h3>
                <p className="editorial-justify mt-1 text-sm text-[#9A9285]">{milestone.note}</p>
              </div>
              <Link
                to={milestone.to}
                className="shrink-0 text-xs font-medium text-[#DEC07C] hover:underline"
              >
                Explore Work →
              </Link>
            </li>
          ))}
        </ol>
      </InkRevealSection>

      {/* Complete Publication Archive */}
      <section className="mt-14 border-t border-[#2B2823] pt-12">
        <div className="mb-8">
          <p className="text-xs font-medium text-[#C9A45C]">
            Complete Bibliography
          </p>
          <h2 className="mt-2 font-literary text-3xl font-medium text-[#EFEAE0]">
            Published Archive &amp; Alternate Editions
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#9A9285]">
            All published books and alternate editions.
          </p>
        </div>

        <div className="divide-y divide-[#2B2823] border-y border-[#2B2823]">
          {books.map((book) => (
            <div
              key={book.id}
              className="grid items-center gap-5 py-5 sm:grid-cols-12"
            >
              <div className="w-20 sm:col-span-2 sm:w-24">
                <Link to={`/books/${book.slug}`}>
                  <BookCoverPreview book={book} />
                </Link>
              </div>
              <div className="sm:col-span-7">
                <p className="text-xs text-[#C9A45C]">
                  {book.editionLabel || book.genre} · {book.language}
                </p>
                <Link to={`/books/${book.slug}`}>
                  <h3 className="mt-1 font-literary text-2xl font-medium text-[#EFEAE0] hover:text-[#DEC07C]">
                    {book.title}
                  </h3>
                </Link>
                {book.subtitle && (
                  <p className="mt-0.5 text-xs text-[#9A9285]">{book.subtitle}</p>
                )}
                <p className="editorial-justify mt-2 line-clamp-2 text-sm text-[#C4BDB0]">
                  {book.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-3 sm:justify-end">
                <Link
                  to={`/read/${book.slug}`}
                  className="inline-flex h-9 items-center rounded bg-[#C9A45C] px-4 text-xs font-semibold text-[#0C0B0A] hover:bg-[#DEC07C]"
                >
                  Read Online
                </Link>
                <Link
                  to={`/books/${book.slug}`}
                  className="inline-flex h-9 items-center rounded border border-[#2B2823] px-4 text-xs text-[#EFEAE0] hover:border-[#C9A45C]"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
