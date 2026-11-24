import { BASE_BOOKS_CATALOG } from '../src/data/booksCatalog.ts';
import { BASE_POEMS_CATALOG } from '../src/data/poemsIndex.ts';
import { BASE_JOURNAL_POSTS } from '../src/data/journalSeed.ts';

export async function GET(): Promise<Response> {
  const baseUrl =
    process.env.APP_URL?.replace(/\/+$/, '') ||
    'https://tejasphirake.vercel.app';

  const books = BASE_BOOKS_CATALOG.filter((b) => b.published);
  const poems = BASE_POEMS_CATALOG.filter((p) => p.published);
  const journal = BASE_JOURNAL_POSTS.filter((j) => j.published);

  const urls = [
    `${baseUrl}/`,
    `${baseUrl}/books`,
    `${baseUrl}/poetry`,
    `${baseUrl}/stories`,
    `${baseUrl}/theatre`,
    `${baseUrl}/journal`,
    `${baseUrl}/author`,
    `${baseUrl}/midnight-page`,
    `${baseUrl}/moods`,
    `${baseUrl}/saved`,
    `${baseUrl}/undefined`,
    ...books.flatMap((b) => [`${baseUrl}/books/${b.slug}`, `${baseUrl}/read/${b.slug}`]),
    ...poems.map((p) => `${baseUrl}/poetry/${p.slug}`),
    ...journal.map((j) => `${baseUrl}/journal/${j.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc.replace(/&/g, '&amp;')}</loc>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
