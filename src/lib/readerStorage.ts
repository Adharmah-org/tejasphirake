import {
  BookBookmark,
  LocalReaderState,
  ReaderPreferences,
  RecentlyViewedItem,
  SavedStanzaNote,
} from '../types/literary';

const STORAGE_KEY = 'tejas_beniyaaz_reader_v1';

const DEFAULT_PREFERENCES: ReaderPreferences = {
  fontSizePx: 19,
  lineHeight: 1.85,
  surfaceMode: 'midnight',
  minimalMode: false,
  pdfNightTint: false,
  pdfReadingMode: 'warm-paper',
  pdfSpreadMode: 'auto',
  pdfTurnSound: false,
  pdfInstantTurn: false,
  audioVoiceGender: 'male',
};

const DEFAULT_STATE: LocalReaderState = {
  progressBySlug: {},
  bookmarksBySlug: {},
  favouritePoemIds: [],
  savedStanzas: [],
  recentlyViewed: [],
  preferences: DEFAULT_PREFERENCES,
};

export function loadReaderState(): LocalReaderState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<LocalReaderState>;
    const mergedPrefs: ReaderPreferences = {
      ...DEFAULT_PREFERENCES,
      ...(parsed.preferences ?? {}),
    };
    if (!parsed.preferences?.pdfReadingMode && parsed.preferences?.pdfNightTint) {
      mergedPrefs.pdfReadingMode = 'midnight';
    }
    return {
      progressBySlug: parsed.progressBySlug ?? {},
      bookmarksBySlug: parsed.bookmarksBySlug ?? {},
      favouritePoemIds: Array.isArray(parsed.favouritePoemIds)
        ? parsed.favouritePoemIds
        : [],
      savedStanzas: Array.isArray(parsed.savedStanzas) ? parsed.savedStanzas : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed)
        ? parsed.recentlyViewed
        : [],
      preferences: mergedPrefs,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveReaderState(next: LocalReaderState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function recordBookProgress(
  slug: string,
  currentPage: number,
  totalPages: number
): LocalReaderState {
  const state = loadReaderState();
  const next: LocalReaderState = {
    ...state,
    progressBySlug: {
      ...state.progressBySlug,
      [slug]: {
        slug,
        currentPage,
        totalPages,
        lastReadAt: new Date().toISOString(),
      },
    },
  };
  saveReaderState(next);
  return next;
}

export function toggleBookBookmark(
  slug: string,
  page: number,
  note?: string
): LocalReaderState {
  const state = loadReaderState();
  const existing = state.bookmarksBySlug[slug] ?? [];
  const hasPage = existing.some((b) => b.page === page);
  const updated: BookBookmark[] = hasPage
    ? existing.filter((b) => b.page !== page)
    : [...existing, { page, note, createdAt: new Date().toISOString() }].sort(
        (a, b) => a.page - b.page
      );
  const next: LocalReaderState = {
    ...state,
    bookmarksBySlug: {
      ...state.bookmarksBySlug,
      [slug]: updated,
    },
  };
  saveReaderState(next);
  return next;
}

export function toggleFavouritePoem(poemId: string): LocalReaderState {
  const state = loadReaderState();
  const exists = state.favouritePoemIds.includes(poemId);
  const next: LocalReaderState = {
    ...state,
    favouritePoemIds: exists
      ? state.favouritePoemIds.filter((id) => id !== poemId)
      : [poemId, ...state.favouritePoemIds],
  };
  saveReaderState(next);
  return next;
}

export function recordRecentlyViewed(
  item: Omit<RecentlyViewedItem, 'viewedAt'>
): LocalReaderState {
  const state = loadReaderState();
  const filtered = state.recentlyViewed.filter(
    (entry) => !(entry.type === item.type && entry.slug === item.slug)
  );
  const next: LocalReaderState = {
    ...state,
    recentlyViewed: [
      { ...item, viewedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, 18),
  };
  saveReaderState(next);
  return next;
}

export function updateReaderPreferences(
  partial: Partial<ReaderPreferences>
): LocalReaderState {
  const state = loadReaderState();
  const next: LocalReaderState = {
    ...state,
    preferences: {
      ...state.preferences,
      ...partial,
    },
  };
  saveReaderState(next);
  return next;
}

export function addOrUpdateSavedStanza(
  entry: Omit<SavedStanzaNote, 'id' | 'createdAt'>
): LocalReaderState {
  const state = loadReaderState();
  const normalized = entry.stanzaText.trim();
  const existingIdx = state.savedStanzas.findIndex(
    (s) => s.poemId === entry.poemId && s.stanzaText.trim() === normalized
  );
  const nextList = [...state.savedStanzas];
  if (existingIdx > -1) {
    nextList[existingIdx] = {
      ...nextList[existingIdx],
      note: entry.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
  } else {
    nextList.unshift({
      ...entry,
      stanzaText: normalized,
      note: entry.note?.trim() || undefined,
      id: `stanza-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    });
  }
  const next: LocalReaderState = {
    ...state,
    savedStanzas: nextList.slice(0, 60),
  };
  saveReaderState(next);
  return next;
}

export function deleteSavedStanza(id: string): LocalReaderState {
  const state = loadReaderState();
  const next: LocalReaderState = {
    ...state,
    savedStanzas: state.savedStanzas.filter((s) => s.id !== id),
  };
  saveReaderState(next);
  return next;
}
