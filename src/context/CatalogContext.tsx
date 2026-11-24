import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { BASE_BOOKS_CATALOG } from '../data/booksCatalog';
import { BASE_POEMS_CATALOG } from '../data/poemsIndex';
import { BASE_JOURNAL_POSTS } from '../data/journalSeed';
import { BookPublication, CatalogPayload, JournalPost, PoemEntry } from '../types/literary';

interface CatalogContextValue extends CatalogPayload {
  loading: boolean;
  refreshCatalog: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue>({
  books: BASE_BOOKS_CATALOG,
  poems: BASE_POEMS_CATALOG,
  journal: BASE_JOURNAL_POSTS,
  loading: false,
  refreshCatalog: async () => {},
});

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<BookPublication[]>(BASE_BOOKS_CATALOG);
  const [poems, setPoems] = useState<PoemEntry[]>(BASE_POEMS_CATALOG);
  const [journal, setJournal] = useState<JournalPost[]>(BASE_JOURNAL_POSTS);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = (await res.json()) as CatalogPayload;
        if (Array.isArray(data.books)) setBooks(data.books);
        if (Array.isArray(data.poems)) setPoems(data.poems);
        if (Array.isArray(data.journal)) setJournal(data.journal);
      }
    } catch {
      // Fallback smoothly to bundled catalog
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  return (
    <CatalogContext.Provider value={{ books, poems, journal, loading, refreshCatalog }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
