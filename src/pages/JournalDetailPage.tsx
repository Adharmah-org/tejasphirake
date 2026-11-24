import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import {
  CollectorFoilSeal,
  FolioCornerFiligree,
  ManuscriptDivider,
} from '../components/FolioCraft';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useReader } from '../context/ReaderContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { journal, books } = useCatalog();
  const { markViewed } = useReader();

  const post = journal.find((j) => j.slug === slug);
  const relatedBook = post?.relatedBookSlug
    ? books.find((b) => b.slug === post.relatedBookSlug)
    : undefined;

  useDocumentMeta(post ? post.title : 'Note Not Found', post?.excerpt);

  useEffect(() => {
    if (post) {
      markViewed({
        type: 'journal',
        slug: post.slug,
        title: post.title,
        subtitle: post.sourceLabel,
      });
    }
  }, [post?.slug]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-literary text-3xl text-[#EFEAE0]">Note not found</h1>
        <Link
          to="/journal"
          className="mt-6 inline-flex items-center gap-2 rounded bg-[#C9A45C] px-5 py-2.5 text-xs font-semibold text-[#0C0B0A]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <Link
        to="/journal"
        className="inline-flex items-center gap-2 text-xs font-medium text-[#9A9285] hover:text-[#DEC07C]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Journal
      </Link>

      <div className="collector-folio-plate folio-frame relative mt-8 rounded-md border border-[#2B2823] bg-[#141311] p-6 sm:p-11">
        <FolioCornerFiligree />
        <header className="border-b border-[#2B2823] pb-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#C9A45C]">
            <span>{post.sourceLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{post.language}</span>
            <span aria-hidden="true">·</span>
            <time className="tabular-nums text-[#9A9285]">{post.publishedAt}</time>
          </div>

          <h1 className="devanagari-verse mt-3 font-literary text-3xl font-medium leading-tight text-[#EFEAE0] headline-balance sm:text-5xl">
            {post.title}
          </h1>
        </header>

        <ProtectedReadingSurface showWatermark enableFocusVeil className="py-8">
          <pre className="devanagari-verse whitespace-pre-wrap break-words text-base leading-[1.9] text-[#E8E2D5] sm:text-lg">
            {post.content}
          </pre>
        </ProtectedReadingSurface>

        <ManuscriptDivider className="mb-5" />
        <div className="flex justify-end">
          <CollectorFoilSeal compact />
        </div>
      </div>

      {relatedBook && (
        <div className="collector-folio-plate mt-8 rounded-md border border-[#2B2823] bg-[#141311] p-6">
          <p className="text-xs font-medium text-[#9A9285]">
            Connected Publication
          </p>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="devanagari-verse font-literary text-2xl text-[#EFEAE0]">
                {relatedBook.title}
              </h2>
              <p className="text-xs text-[#9A9285]">
                {relatedBook.genre} · {relatedBook.language} ·{' '}
                <span className="tabular-nums">{relatedBook.pageCount} pages</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/read/${relatedBook.slug}`}
                className="inline-flex h-10 items-center gap-2 rounded bg-[#C9A45C] px-4 text-xs font-semibold text-[#0C0B0A] hover:bg-[#DEC07C]"
              >
                <BookOpen className="h-3.5 w-3.5" /> Read Online
              </Link>
              <Link
                to={`/books/${relatedBook.slug}`}
                className="inline-flex h-10 items-center rounded border border-[#2B2823] px-4 text-xs text-[#EFEAE0] hover:border-[#C9A45C]"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
