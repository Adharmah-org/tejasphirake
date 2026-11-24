import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bookmark, Feather } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { BookCoverPreview } from '../components/BookCoverPreview';
import {
  CollectorFoilSeal,
  FolioCornerFiligree,
  ManuscriptDivider,
} from '../components/FolioCraft';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { books, poems } = useCatalog();
  const { state, markViewed } = useReader();

  const book = useMemo(() => books.find((b) => b.slug === slug), [books, slug]);

  useDocumentMeta(
    book ? book.title : 'Publication Not Found',
    book?.description
  );

  useEffect(() => {
    if (book) {
      markViewed({
        type: 'book',
        slug: book.slug,
        title: book.title,
        subtitle: book.editionLabel || book.genre,
      });
    }
  }, [book?.slug]);

  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-literary text-3xl text-[#EFEAE0]">
          Publication not found
        </h1>
        <p className="mt-3 text-sm text-[#9A9285]">
          This book or edition may have been moved or unpublished.
        </p>
        <Link
          to="/books"
          className="mt-6 inline-flex items-center gap-2 rounded bg-[#C9A45C] px-5 py-2.5 text-xs font-semibold text-[#0C0B0A]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </Link>
      </div>
    );
  }

  const alternateEditions = book.editionGroup
    ? books.filter(
        (other) => other.editionGroup === book.editionGroup && other.id !== book.id
      )
    : [];

  const linkedPoems = poems.filter((p) => p.sourcePublicationSlug === book.slug);
  const progress = state.progressBySlug[book.slug];
  const bookmarks = state.bookmarksBySlug[book.slug] ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-xs font-medium text-[#9A9285] hover:text-[#DEC07C]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Digital Library
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="mx-auto w-full max-w-sm lg:col-span-4 lg:max-w-none">
          <BookCoverPreview book={book} className="shadow-2xl" />
          <p className="mt-3 text-center text-xs text-[#9A9285]">
            Preserved Archive Edition · Online Reading Only
          </p>
          <div className="mt-5 flex justify-center border-t border-[#2B2823] pt-4">
            <CollectorFoilSeal compact />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#C9A45C]">
            <span>{book.genre}</span>
            <span aria-hidden="true">·</span>
            <span>{book.language}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{book.pageCount} Pages</span>
          </div>

          <h1 className="mt-3 font-literary text-4xl font-medium leading-tight text-[#EFEAE0] headline-balance sm:text-5xl">
            {book.title}
          </h1>

          {book.subtitle && (
            <p className="mt-2 font-literary text-xl italic text-[#C4BDB0]">
              {book.subtitle}
            </p>
          )}

          <p className="mt-4 text-sm text-[#9A9285]">
            By <span className="text-[#EFEAE0]">{book.authorCreditLabel || book.author}</span>
            {book.editionLabel ? ` · ${book.editionLabel}` : ''}
          </p>

          <ProtectedReadingSurface
            showWatermark
            className="collector-folio-plate relative mt-6 rounded-md border border-[#2B2823] bg-[#141311] p-6 sm:p-8"
          >
            <FolioCornerFiligree />
            <p className="editorial-justify text-base leading-relaxed text-[#C4BDB0]">
              {book.description}
            </p>

            {book.structureHighlights.length > 0 && (
              <div className="mt-6">
                <ManuscriptDivider className="mb-5" />
                <h2 className="text-xs font-medium text-[#9A9285]">
                  Inside This Edition
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm text-[#C4BDB0]">
                  {book.structureHighlights.map((line, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 shrink-0 font-literary text-sm tabular-nums text-[#C9A45C]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ProtectedReadingSurface>

          {/* Primary Reading Action */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to={`/read/${book.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded bg-[#C9A45C] px-6 text-xs font-semibold text-[#0C0B0A] transition-colors hover:bg-[#DEC07C] whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4" />
              <span>
                {progress && progress.currentPage > 1
                  ? `Resume Reading Room (Page ${progress.currentPage})`
                  : 'Enter Reading Room'}
              </span>
            </Link>

            {book.section === 'theatre' && (
              <Link
                to="/theatre"
                className="inline-flex h-11 items-center gap-2 rounded border border-[#2B2823] bg-[#141311] px-5 text-xs font-medium text-[#EFEAE0] transition-colors hover:border-[#C9A45C]/60 hover:text-[#DEC07C] whitespace-nowrap"
              >
                <span>Open Stage Archive</span>
              </Link>
            )}

            {book.section === 'poetry-collections' && (
              <Link
                to="/poetry"
                className="inline-flex h-11 items-center gap-2 rounded border border-[#2B2823] bg-[#141311] px-5 text-xs font-medium text-[#EFEAE0] transition-colors hover:border-[#C9A45C]/60 hover:text-[#DEC07C] whitespace-nowrap"
              >
                <Feather className="h-4 w-4 text-[#C9A45C]" />
                <span>Open Poetry Room</span>
              </Link>
            )}
          </div>

          {/* Saved Page Bookmarks for this book */}
          {bookmarks.length > 0 && (
            <div className="mt-8 border-t border-[#2B2823] pt-6">
              <h2 className="flex items-center gap-2 text-xs font-medium text-[#C9A45C]">
                <Bookmark className="h-3.5 w-3.5" />
                <span>Your Bookmarked Pages</span>
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {bookmarks.map((bm) => (
                  <Link
                    key={bm.page}
                    to={`/read/${book.slug}?page=${bm.page}`}
                    className="rounded border border-[#2B2823] bg-[#141311] px-3 py-1.5 text-xs tabular-nums text-[#EFEAE0] hover:border-[#C9A45C]"
                  >
                    Page {bm.page}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Preserved Alternate / Related Editions */}
          {alternateEditions.length > 0 && (
            <div className="mt-8 border-t border-[#2B2823] pt-6">
              <h2 className="text-xs font-medium text-[#9A9285]">
                Other Preserved Editions of This Work
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {alternateEditions.map((alt) => (
                  <Link
                    key={alt.id}
                    to={`/books/${alt.slug}`}
                    className="rounded-md border border-[#2B2823] bg-[#141311] p-4 transition-colors hover:border-[#C9A45C]/60"
                  >
                    <p className="text-xs text-[#C9A45C]">
                      {alt.editionLabel || alt.genre}
                    </p>
                    <p className="mt-1 font-literary text-lg text-[#EFEAE0]">
                      {alt.title}
                    </p>
                    <p className="mt-1 text-xs tabular-nums text-[#9A9285]">
                      {alt.pageCount} pages · {alt.language}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Linked Extracted Poems */}
          {linkedPoems.length > 0 && (
            <div className="mt-8 border-t border-[#2B2823] pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium text-[#9A9285]">
                  Poems Preserved from This Publication ({linkedPoems.length})
                </h2>
                <Link
                  to="/poetry"
                  className="text-xs text-[#DEC07C] hover:underline"
                >
                  Open Poetry Room →
                </Link>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {linkedPoems.slice(0, 10).map((poem) => (
                  <Link
                    key={poem.id}
                    to={`/poetry/${poem.slug}`}
                    className="flex items-center justify-between rounded border border-[#2B2823] bg-[#141311]/75 px-3.5 py-2.5 text-sm text-[#C4BDB0] hover:border-[#C9A45C]/50 hover:text-[#DEC07C]"
                  >
                    <span className="truncate">{poem.title}</span>
                    <span className="ml-2 shrink-0 text-xs text-[#9A9285]">
                      {poem.category}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
