import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  addOrUpdateSavedStanza,
  deleteSavedStanza,
  loadReaderState,
  recordBookProgress,
  recordRecentlyViewed,
  saveReaderState,
  toggleBookBookmark,
  toggleFavouritePoem,
  updateReaderPreferences,
} from '../lib/readerStorage';
import {
  LocalReaderState,
  ReaderPreferences,
  RecentlyViewedItem,
  SavedStanzaNote,
} from '../types/literary';

interface ReaderContextValue {
  state: LocalReaderState;
  setBookProgress: (slug: string, currentPage: number, totalPages: number) => void;
  toggleBookmark: (slug: string, page: number, note?: string) => void;
  toggleFavourite: (poemId: string) => void;
  saveStanzaNote: (entry: Omit<SavedStanzaNote, 'id' | 'createdAt'>) => void;
  removeStanzaNote: (id: string) => void;
  markViewed: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
  setPreferences: (partial: Partial<ReaderPreferences>) => void;
  clearHistory: () => void;
}

const ReaderContext = createContext<ReaderContextValue | null>(null);

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LocalReaderState>(() => loadReaderState());

  const setBookProgress = useCallback((slug: string, currentPage: number, totalPages: number) => {
    setState(recordBookProgress(slug, currentPage, totalPages));
  }, []);

  const toggleBookmark = useCallback((slug: string, page: number, note?: string) => {
    setState(toggleBookBookmark(slug, page, note));
  }, []);

  const toggleFavourite = useCallback((poemId: string) => {
    setState(toggleFavouritePoem(poemId));
  }, []);

  const saveStanzaNote = useCallback(
    (entry: Omit<SavedStanzaNote, 'id' | 'createdAt'>) => {
      setState(addOrUpdateSavedStanza(entry));
    },
    []
  );

  const removeStanzaNote = useCallback((id: string) => {
    setState(deleteSavedStanza(id));
  }, []);

  const markViewed = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    setState(recordRecentlyViewed(item));
  }, []);

  const setPreferences = useCallback((partial: Partial<ReaderPreferences>) => {
    setState(updateReaderPreferences(partial));
  }, []);

  const clearHistory = useCallback(() => {
    const next: LocalReaderState = {
      ...loadReaderState(),
      recentlyViewed: [],
    };
    saveReaderState(next);
    setState(next);
  }, []);

  return (
    <ReaderContext.Provider
      value={{
        state,
        setBookProgress,
        toggleBookmark,
        toggleFavourite,
        saveStanzaNote,
        removeStanzaNote,
        markViewed,
        setPreferences,
        clearHistory,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const ctx = useContext(ReaderContext);
  if (!ctx) {
    throw new Error('useReader must be used inside ReaderProvider');
  }
  return ctx;
}
