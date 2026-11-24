import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InkRevealSection, ManuscriptDivider } from '../components/FolioCraft';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function JournalPage() {
  useDocumentMeta(
    'The Unsaid Journal: Author Notes & Reflections',
    'Author prefaces, stage directions, reflections, and essays from Tejas Purvesh Phirake.'
  );

  const { journal } = useCatalog();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      <header className="border-b border-[#2B2823] pb-8">
        <p className="text-xs font-medium text-[#C9A45C]">
          Author&apos;s Notes
        </p>
        <h1 className="mt-2 font-literary text-4xl font-medium text-[#EFEAE0] headline-balance sm:text-5xl">
          The Unsaid Journal
        </h1>
        <p className="editorial-justify mt-3 max-w-2xl text-sm leading-relaxed text-[#C4BDB0] sm:text-base">
          Prefaces, reader instructions, director notes, and reflections gathered from
          the manuscripts of Tejas Purvesh Phirake, kept separate from published poetry.
        </p>
      </header>

      <InkRevealSection className="mt-8 space-y-5">
        {journal.map((post) => (
          <article
            key={post.id}
            className="collector-folio-plate folio-frame rounded-md border border-[#2B2823] bg-[#141311] p-6 transition-colors hover:border-[#C9A45C]/45 sm:p-8"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9A9285]">
              <span className="text-[#C9A45C]">{post.sourceLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{post.language}</span>
              <span aria-hidden="true">·</span>
              <time className="tabular-nums">{post.publishedAt}</time>
            </div>

            <Link to={`/journal/${post.slug}`} className="group mt-2.5 block">
              <h2 className="devanagari-verse font-literary text-2xl font-medium text-[#EFEAE0] transition-colors group-hover:text-[#DEC07C] sm:text-3xl">
                {post.title}
              </h2>
            </Link>

            <p className="editorial-justify mt-3 text-sm leading-relaxed text-[#C4BDB0] sm:text-base">
              {post.excerpt}
            </p>

            <ManuscriptDivider className="my-5" />

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
              <Link
                to={`/journal/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-[#DEC07C] hover:underline"
              >
                Read Note <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {post.relatedBookSlug && (
                <Link
                  to={`/books/${post.relatedBookSlug}`}
                  className="text-[#9A9285] hover:text-[#EFEAE0]"
                >
                  View Related Publication →
                </Link>
              )}
            </div>
          </article>
        ))}
      </InkRevealSection>
    </div>
  );
}
