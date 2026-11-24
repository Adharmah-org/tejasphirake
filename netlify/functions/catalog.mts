import { BASE_BOOKS_CATALOG } from '../../src/data/booksCatalog.ts';
import { BASE_POEMS_CATALOG } from '../../src/data/poemsIndex.ts';
import { BASE_JOURNAL_POSTS } from '../../src/data/journalSeed.ts';

export const config = {
  path: '/api/catalog',
  method: ['GET'],
};

export default async () => {
  const books = BASE_BOOKS_CATALOG.filter((b) => b.published).sort(
    (a, b) => a.releaseOrder - b.releaseOrder
  );
  const poems = BASE_POEMS_CATALOG.filter((p) => p.published);
  const journal = BASE_JOURNAL_POSTS.filter((j) => j.published).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );

  return Response.json(
    { books, poems, journal },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
};
