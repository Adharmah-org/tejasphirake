import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { lookupStaticTranslation } from '../data/uiTranslations';

export type GlobalLangMode = 'original' | 'hi' | 'en';

interface TranslationContextValue {
  langMode: GlobalLangMode;
  setLangMode: (mode: GlobalLangMode) => void;
  toggleViceVersa: () => void;
  retryTranslation: () => void;
  isTranslating: boolean;
  translateError: string | null;
  clearError: () => void;
  translateTexts: (
    texts: string[],
    targetLang: 'hi' | 'en',
    signal?: AbortSignal
  ) => Promise<string[]>;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

const MODE_STORAGE_KEY = 'tejas-global-lang-mode';
const CACHE_STORAGE_KEY = 'tejas-global-translate-cache-v3';
const LEGACY_CACHE_KEYS = ['tejas-global-translate-cache-v2'];
const SKIP_SELECTOR =
  'script,style,noscript,svg,canvas,input,textarea,select,option,code,kbd,[data-no-translate="true"],[aria-hidden="true"]';

function loadInitialMode(): GlobalLangMode {
  try {
    const saved = sessionStorage.getItem(MODE_STORAGE_KEY);
    if (saved === 'hi' || saved === 'en' || saved === 'original') {
      return saved;
    }
  } catch {
    // Ignore storage restriction
  }
  return 'original';
}

function loadPersistentCache(): Map<string, string> {
  const map = new Map<string, string>();
  try {
    for (const oldKey of LEGACY_CACHE_KEYS) {
      localStorage.removeItem(oldKey);
      sessionStorage.removeItem(oldKey);
    }
    const raw =
      localStorage.getItem(CACHE_STORAGE_KEY) ||
      sessionStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return map;
    const entries = JSON.parse(raw) as [string, string][];
    if (Array.isArray(entries)) {
      for (const [k, v] of entries) {
        if (typeof k === 'string' && typeof v === 'string') {
          map.set(k, v);
        }
      }
    }
  } catch {
    // Ignore corrupted cache
  }
  return map;
}

function persistCache(cache: Map<string, string>) {
  try {
    const entries = Array.from(cache.entries());
    const trimmed =
      entries.length > 2500 ? entries.slice(entries.length - 2500) : entries;
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    try {
      const entries = Array.from(cache.entries()).slice(-1200);
      sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore quota errors
    }
  }
}

function isTranslatableText(core: string): boolean {
  if (core.length < 2) return false;
  if (/^https?:\/\//i.test(core)) return false;
  if (!/[A-Za-z\u0900-\u097F]{2,}/.test(core)) return false;
  return true;
}

function splitWhitespace(value: string): {
  leading: string;
  core: string;
  trailing: string;
} {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return { leading: '', core: value, trailing: '' };
  return {
    leading: match[1] ?? '',
    core: match[2] ?? '',
    trailing: match[3] ?? '',
  };
}

function collectEligibleTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
      const val = node.nodeValue ?? '';
      if (!isTranslatableText(val.trim())) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }
  return nodes;
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { pathname, search } = useLocation();
  const [langMode, setLangModeState] = useState<GlobalLangMode>(loadInitialMode);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [retrySeq, setRetrySeq] = useState(0);

  const cacheRef = useRef<Map<string, string> | null>(null);
  if (!cacheRef.current) {
    cacheRef.current = loadPersistentCache();
  }

  const originalTextMapRef = useRef(new WeakMap<Text, string>());
  const lastWrittenMapRef = useRef(new WeakMap<Text, string>());
  const touchedNodesRef = useRef(new Set<Text>());
  const isMutatingRef = useRef(false);
  const isPassRunningRef = useRef(false);
  const cooldownUntilRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const lookupCachedOrStatic = useCallback(
    (core: string, targetLang: 'hi' | 'en'): string | undefined => {
      const staticHit = lookupStaticTranslation(core, targetLang);
      if (staticHit !== undefined) return staticHit;
      return cacheRef.current?.get(`${targetLang}::${core}`);
    },
    []
  );

  const setLangMode = useCallback((mode: GlobalLangMode) => {
    cooldownUntilRef.current = 0;
    setTranslateError(null);
    setLangModeState(mode);
    try {
      sessionStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage error
    }
  }, []);

  const toggleViceVersa = useCallback(() => {
    cooldownUntilRef.current = 0;
    setTranslateError(null);
    setLangModeState((prev) => {
      let next: GlobalLangMode;
      if (prev === 'hi') {
        next = 'en';
      } else if (prev === 'en') {
        next = 'hi';
      } else {
        const sample = (document.querySelector('main')?.textContent ?? '').slice(0, 2000);
        const devanagariCount = (sample.match(/[\u0900-\u097F]/g) ?? []).length;
        const latinCount = (sample.match(/[A-Za-z]/g) ?? []).length;
        next = devanagariCount > latinCount * 0.45 ? 'en' : 'hi';
      }
      try {
        sessionStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const retryTranslation = useCallback(() => {
    cooldownUntilRef.current = 0;
    setTranslateError(null);
    setRetrySeq((n) => n + 1);
  }, []);

  const translateTexts = useCallback(
    async (
      texts: string[],
      targetLang: 'hi' | 'en',
      signal?: AbortSignal
    ): Promise<string[]> => {
      const cache = cacheRef.current!;
      const results = new Array<string>(texts.length);
      const missingUnique: string[] = [];
      const seenMissing = new Set<string>();

      texts.forEach((txt, i) => {
        const trimmed = txt.trim();
        if (!isTranslatableText(trimmed)) {
          results[i] = txt;
          return;
        }
        const hit = lookupCachedOrStatic(trimmed, targetLang);
        if (hit !== undefined) {
          const { leading, trailing } = splitWhitespace(txt);
          results[i] = `${leading}${hit}${trailing}`;
        } else if (!seenMissing.has(trimmed)) {
          seenMissing.add(trimmed);
          missingUnique.push(trimmed);
        }
      });

      // Split into 24-string chunks and run up to 3 concurrently for fast responsive translation
      const CHUNK_SIZE = 24;
      const chunks: string[][] = [];
      for (let start = 0; start < missingUnique.length; start += CHUNK_SIZE) {
        chunks.push(missingUnique.slice(start, start + CHUNK_SIZE));
      }

      const fetchChunk = async (chunk: string[]) => {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const timeoutCtrl = new AbortController();
        const timeoutId = window.setTimeout(() => timeoutCtrl.abort(), 30000);
        const onOuterAbort = () => timeoutCtrl.abort();
        signal?.addEventListener('abort', onOuterAbort, { once: true });

        try {
          const resp = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetLang, texts: chunk }),
            signal: timeoutCtrl.signal,
          });
          const data = (await resp.json().catch(() => ({}))) as {
            translations?: string[];
            error?: string;
          };
          if (!resp.ok || !Array.isArray(data.translations)) {
            if (resp.status === 401 || resp.status === 403) {
              cooldownUntilRef.current = Date.now() + 300000;
              throw new Error(
                data.error ||
                  'Translation needs a valid Gemini API key in Settings > Secrets.'
              );
            }
            if (resp.status === 429) {
              cooldownUntilRef.current = Date.now() + 15000;
              throw new Error(
                'Rate limit reached briefly. Wait a few seconds and tap Retry.'
              );
            }
            cooldownUntilRef.current = Date.now() + 6000;
            throw new Error(
              data.error || 'Translation is temporarily unavailable. Tap Retry to try again.'
            );
          }

          chunk.forEach((orig, idx) => {
            const rawTranslated = data.translations?.[idx];
            const candidate =
              typeof rawTranslated === 'string' && rawTranslated.trim().length > 0
                ? rawTranslated
                : '';
            if (!candidate) return;
            // Guard against caching untranslated multi-word English strings when translating to Hindi
            if (
              targetLang === 'hi' &&
              candidate === orig &&
              !/[\u0900-\u097F]/.test(orig) &&
              orig.trim().split(/\s+/).length >= 3
            ) {
              return;
            }
            cache.set(`${targetLang}::${orig}`, candidate);
          });
        } catch (err: unknown) {
          if (signal?.aborted) throw err;
          if (err instanceof DOMException && err.name === 'AbortError') {
            cooldownUntilRef.current = Date.now() + 5000;
            throw new Error('Translation timed out. Please tap Retry.');
          }
          throw err;
        } finally {
          window.clearTimeout(timeoutId);
          signal?.removeEventListener('abort', onOuterAbort);
        }
      };

      const MAX_CONCURRENCY = 3;
      for (let i = 0; i < chunks.length; i += MAX_CONCURRENCY) {
        const pair = chunks.slice(i, i + MAX_CONCURRENCY);
        await Promise.all(pair.map((chunk) => fetchChunk(chunk)));
      }

      if (missingUnique.length > 0) {
        persistCache(cache);
      }

      texts.forEach((txt, i) => {
        if (results[i] !== undefined) return;
        const { leading, core, trailing } = splitWhitespace(txt);
        const translatedCore = lookupCachedOrStatic(core, targetLang) ?? core;
        results[i] = `${leading}${translatedCore}${trailing}`;
      });

      return results;
    },
    [lookupCachedOrStatic]
  );

  const restoreOriginals = useCallback(() => {
    isMutatingRef.current = true;
    try {
      for (const node of touchedNodesRef.current) {
        if (!node.isConnected) {
          touchedNodesRef.current.delete(node);
          continue;
        }
        const orig = originalTextMapRef.current.get(node);
        const lastWritten = lastWrittenMapRef.current.get(node);
        if (orig !== undefined && node.nodeValue === lastWritten) {
          node.nodeValue = orig;
        }
        lastWrittenMapRef.current.delete(node);
      }
    } finally {
      isMutatingRef.current = false;
    }
  }, []);

  const applyTranslationPass = useCallback(
    async (mode: 'hi' | 'en') => {
      if (Date.now() < cooldownUntilRef.current) return;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const root = document.body;
      if (!root) return;

      const nodes = collectEligibleTextNodes(root);
      const nodeOriginals: { node: Text; leading: string; core: string; trailing: string }[] = [];

      for (const node of nodes) {
        if (!node.isConnected) continue;
        const currentVal = node.nodeValue ?? '';
        const prevWritten = lastWrittenMapRef.current.get(node);

        if (prevWritten === undefined || currentVal !== prevWritten) {
          originalTextMapRef.current.set(node, currentVal);
        }

        const origFull = originalTextMapRef.current.get(node) ?? currentVal;
        const { leading, core, trailing } = splitWhitespace(origFull);
        if (!isTranslatableText(core)) continue;

        touchedNodesRef.current.add(node);
        nodeOriginals.push({ node, leading, core, trailing });
      }

      if (nodeOriginals.length === 0) return;

      const applyCachedNow = () => {
        isMutatingRef.current = true;
        try {
          for (const item of nodeOriginals) {
            if (!item.node.isConnected) continue;
            const hit = lookupCachedOrStatic(item.core, mode);
            if (hit !== undefined) {
              const nextVal = `${item.leading}${hit}${item.trailing}`;
              if (item.node.nodeValue !== nextVal) {
                item.node.nodeValue = nextVal;
              }
              lastWrittenMapRef.current.set(item.node, nextVal);
            }
          }
        } finally {
          isMutatingRef.current = false;
        }
      };

      // Instant 0ms synchronous pass for static dictionary + cached literary segments
      applyCachedNow();

      const missingCores = Array.from(
        new Set(
          nodeOriginals
            .map((x) => x.core)
            .filter((core) => lookupCachedOrStatic(core, mode) === undefined)
        )
      );

      if (missingCores.length === 0) {
        setIsTranslating(false);
        return;
      }

      isPassRunningRef.current = true;
      setIsTranslating(true);
      setTranslateError(null);
      try {
        await translateTexts(missingCores, mode, controller.signal);
        if (controller.signal.aborted) return;
        applyCachedNow();
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Translation failed.';
        setTranslateError(msg);
      } finally {
        if (abortControllerRef.current === controller) {
          isPassRunningRef.current = false;
          setIsTranslating(false);
        }
      }
    },
    [lookupCachedOrStatic, translateTexts]
  );

  // Trigger translation or restore whenever langMode, route, or explicit retry changes
  useEffect(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (langMode === 'original') {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      isPassRunningRef.current = false;
      setIsTranslating(false);
      restoreOriginals();
      return;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      void applyTranslationPass(langMode);
    }, 60);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [langMode, pathname, search, retrySeq, applyTranslationPass, restoreOriginals]);

  // Observe genuinely new DOM updates while translated (never re-trigger while API pass is in flight or cooling down)
  useEffect(() => {
    if (langMode === 'original') return;

    const targetRoot = document.getElementById('root') ?? document.body;
    const observer = new MutationObserver(() => {
      if (isMutatingRef.current || isPassRunningRef.current) return;
      if (Date.now() < cooldownUntilRef.current) return;
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = window.setTimeout(() => {
        if (!isPassRunningRef.current && Date.now() >= cooldownUntilRef.current) {
          void applyTranslationPass(langMode);
        }
      }, 280);
    });

    observer.observe(targetRoot, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [langMode, applyTranslationPass]);

  return (
    <TranslationContext.Provider
      value={{
        langMode,
        setLangMode,
        toggleViceVersa,
        retryTranslation,
        isTranslating,
        translateError,
        clearError: () => setTranslateError(null),
        translateTexts,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return ctx;
}
