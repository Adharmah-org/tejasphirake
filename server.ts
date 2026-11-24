import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import OpenAI from 'openai';
import { BASE_BOOKS_CATALOG } from './src/data/booksCatalog.ts';
import { BASE_POEMS_CATALOG } from './src/data/poemsIndex.ts';
import { BASE_JOURNAL_POSTS } from './src/data/journalSeed.ts';
import type {
  BookPublication,
  CatalogPayload,
  JournalPost,
  PoemEntry,
} from './src/types/literary.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);

const STORAGE_DIR = path.resolve(__dirname, 'storage');
const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');
const CMS_DATA_FILE = path.join(STORAGE_DIR, 'cms-data.json');
const AUTH_FILE = path.join(STORAGE_DIR, 'auth.json');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function cleanEnvValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/^["']|["']$/g, '').trim();
  return cleaned || undefined;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = cleanEnvValue(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isApiKeyAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('API_KEY_INVALID') ||
    msg.includes('API key not valid') ||
    msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
    msg.includes('UNAUTHENTICATED') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('"code":401') ||
    msg.includes('"code":403')
  );
}

interface CmsOverrideStore {
  bookOverrides: Record<string, Partial<BookPublication>>;
  customBooks: BookPublication[];
  deletedBookIds: string[];
  poemOverrides: Record<string, Partial<PoemEntry>>;
  customPoems: PoemEntry[];
  deletedPoemIds: string[];
  journalOverrides: Record<string, Partial<JournalPost>>;
  customJournal: JournalPost[];
  deletedJournalIds: string[];
}

interface AuthStore {
  sessionSecret: string;
  passphraseHash?: string;
  passphraseSalt?: string;
}

const DEFAULT_CMS_DATA: CmsOverrideStore = {
  bookOverrides: {},
  customBooks: [],
  deletedBookIds: [],
  poemOverrides: {},
  customPoems: [],
  deletedPoemIds: [],
  journalOverrides: {},
  customJournal: [],
  deletedJournalIds: [],
};

function readCmsStore(): CmsOverrideStore {
  try {
    if (!fs.existsSync(CMS_DATA_FILE)) return { ...DEFAULT_CMS_DATA };
    const parsed = JSON.parse(fs.readFileSync(CMS_DATA_FILE, 'utf-8')) as Partial<CmsOverrideStore>;
    return {
      ...DEFAULT_CMS_DATA,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_CMS_DATA };
  }
}

function writeCmsStore(data: CmsOverrideStore): void {
  fs.writeFileSync(CMS_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function readAuthStore(): AuthStore {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8')) as AuthStore;
      if (parsed.sessionSecret) return parsed;
    }
  } catch {
    // Regenerate cleanly below
  }
  const fresh: AuthStore = {
    sessionSecret: crypto.randomBytes(32).toString('hex'),
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(fresh, null, 2), 'utf-8');
  return fresh;
}

function writeAuthStore(store: AuthStore): void {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function buildMergedCatalog(includeUnpublished: boolean): CatalogPayload {
  const store = readCmsStore();
  const deletedBookSet = new Set(store.deletedBookIds);
  const deletedPoemSet = new Set(store.deletedPoemIds);
  const deletedJournalSet = new Set(store.deletedJournalIds);

  const books = [
    ...BASE_BOOKS_CATALOG.filter((b) => !deletedBookSet.has(b.id)).map((b) => ({
      ...b,
      ...(store.bookOverrides[b.id] ?? {}),
    })),
    ...store.customBooks.filter((b) => !deletedBookSet.has(b.id)),
  ]
    .filter((b) => includeUnpublished || b.published)
    .sort((a, b) => a.releaseOrder - b.releaseOrder);

  const poems = [
    ...BASE_POEMS_CATALOG.filter((p) => !deletedPoemSet.has(p.id)).map((p) => ({
      ...p,
      ...(store.poemOverrides[p.id] ?? {}),
    })),
    ...store.customPoems.filter((p) => !deletedPoemSet.has(p.id)),
  ].filter((p) => includeUnpublished || p.published);

  const journal = [
    ...BASE_JOURNAL_POSTS.filter((j) => !deletedJournalSet.has(j.id)).map((j) => ({
      ...j,
      ...(store.journalOverrides[j.id] ?? {}),
    })),
    ...store.customJournal.filter((j) => !deletedJournalSet.has(j.id)),
  ]
    .filter((j) => includeUnpublished || j.published)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return { books, poems, journal };
}

function parseCookies(header?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

function signSessionToken(secret: string): string {
  const expires = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = `author:${expires}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    if (
      !crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))
    ) {
      return false;
    }
  } catch {
    return false;
  }
  const [, expStr] = payload.split(':');
  const exp = Number(expStr);
  return Number.isFinite(exp) && Date.now() < exp;
}

function hashPassphrase(passphrase: string, salt: string): string {
  return crypto.scryptSync(passphrase, salt, 64).toString('hex');
}

function isAuthorPassphraseConfigured(): boolean {
  if (process.env.AUTHOR_CMS_PASSPHRASE && process.env.AUTHOR_CMS_PASSPHRASE.trim().length > 0) {
    return true;
  }
  const auth = readAuthStore();
  return Boolean(auth.passphraseHash && auth.passphraseSalt);
}

function verifyAuthorPassphrase(candidate: string): boolean {
  const envPass = process.env.AUTHOR_CMS_PASSPHRASE?.trim();
  if (envPass) {
    const a = crypto.createHash('sha256').update(candidate).digest();
    const b = crypto.createHash('sha256').update(envPass).digest();
    return crypto.timingSafeEqual(a, b);
  }
  const auth = readAuthStore();
  if (!auth.passphraseHash || !auth.passphraseSalt) return false;
  const candidateHash = hashPassphrase(candidate, auth.passphraseSalt);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(candidateHash, 'hex'),
      Buffer.from(auth.passphraseHash, 'hex')
    );
  } catch {
    return false;
  }
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '');
    const safeBase = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 48);
    cb(null, `${Date.now()}_${safeBase || 'upload'}${safeExt}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 80 * 1024 * 1024 },
});

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9\u0900-\u097f]+/g, '-')
      .replace(/^-+|-+$/g, '') || `item-${Date.now()}`
  );
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Public Catalog
  app.get('/api/catalog', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json(buildMergedCatalog(false));
  });

  // Server-Side Literary Page Translation (Hindi <-> English via OpenAI Gateway, Gemini, or Google Translate HTTP fallback)
  const translateCache = new Map<string, string>();
  let geminiAuthBlockedUntil = 0;

  const parseTranslationArray = (rawText: string, expectedLen: number): string[] | null => {
    const cleaned = rawText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.slice(0, expectedLen).map((v) => (typeof v === 'string' ? v : ''));
    }
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray((parsed as { translations?: unknown }).translations)
    ) {
      const arr = (parsed as { translations: unknown[] }).translations;
      return arr.slice(0, expectedLen).map((v) => (typeof v === 'string' ? v : ''));
    }
    return null;
  };

  const splitForTranslateEndpoint = (text: string, maxLen = 400): string[] => {
    if (text.length <= maxLen) return [text];
    const lines = text.split('\n');
    const chunks: string[] = [];
    let current = '';
    for (const line of lines) {
      if (line.length > maxLen) {
        if (current) {
          chunks.push(current);
          current = '';
        }
        for (let i = 0; i < line.length; i += maxLen) {
          chunks.push(line.slice(i, i + maxLen));
        }
        continue;
      }
      const next = current ? `${current}\n${line}` : line;
      if (next.length > maxLen) {
        if (current) chunks.push(current);
        current = line;
      } else {
        current = next;
      }
    }
    if (current) chunks.push(current);
    return chunks.length > 0 ? chunks : [text];
  };

  const postProcessTranslation = (raw: string, targetLang: 'hi' | 'en'): string => {
    if (targetLang === 'hi') {
      return raw
        .replace(/तेजस\s+पूर्वेश\s+फिरके/g, 'तेजस पुर्वेश फिरके')
        .replace(/पूर्वेश/g, 'पुर्वेश')
        .replace(/बेनियाज़\s+रूह/g, 'BENIYAAZ ROOH');
    }
    return raw.replace(/Tejas\s+Poorvesh\s+Phirake/gi, 'Tejas Purvesh Phirake');
  };

  const detectSourceLangForMyMemory = (
    text: string,
    targetLang: 'hi' | 'en'
  ): 'en' | 'hi' | 'mr' | null => {
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    if (!hasDevanagari) {
      if (targetLang === 'hi') return 'en';
      const hinglishHints =
        /\b(kya|nahi|nahin|mujhe|tum|tumko|mera|meri|mere|tera|teri|tere|dil|mohabbat|ishq|yaad|khushi|saath|aankhon|zindagi|pyaar|woh|main|mein|hain|hoon|kahani|adhuri|chaha|waqt|lamha|raat|subah|duniya|sapne|khwaab|aansu)\b/i;
      return hinglishHints.test(text) ? 'hi' : null;
    }
    const marathiHints =
      /[\u0933\u0972\u0911]|(?:^|\s)(आहे|नाही|माझं|माझ्या|माझा|तुझं|तुझ्या|तुझा|मला|तुला|तिच्या|त्याच्या|जणू|कधी|असं|कसं|पाऊस|आठवण|आठवणी|झालं|होतं|राहिलं|नसताना|सगळी|पुन्हा|फक्त|म्हणजे|असतं|दिसतेस)(?:\s|[.,!?।…]|$)/;
    if (marathiHints.test(text)) return 'mr';
    if (targetLang === 'hi') return null;
    return 'hi';
  };

  const translateSingleViaGoogleHttp = async (
    text: string,
    targetLang: 'hi' | 'en'
  ): Promise<string> => {
    const trimmed = text.trim();
    if (!trimmed) return text;
    if (trimmed === 'BENIYAAZ ROOH') return 'BENIYAAZ ROOH';
    if (trimmed === 'Tejas Purvesh Phirake') {
      return targetLang === 'hi' ? 'तेजस पुर्वेश फिरके' : 'Tejas Purvesh Phirake';
    }
    if (trimmed === 'तेजस पुर्वेश फिरके') {
      return targetLang === 'en' ? 'Tejas Purvesh Phirake' : 'तेजस पुर्वेश फिरके';
    }

    const srcLang = detectSourceLangForMyMemory(trimmed, targetLang);
    if (!srcLang) {
      return postProcessTranslation(text, targetLang);
    }

    const parts = splitForTranslateEndpoint(text, 400);
    const outParts: string[] = [];

    for (const part of parts) {
      let translated: string | null = null;
      try {
        const memUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          part
        )}&langpair=${srcLang}|${targetLang}`;
        const memResp = await fetch(memUrl, {
          headers: { 'User-Agent': 'BeniyaazRoohArchive/1.0' },
          signal: AbortSignal.timeout(5500),
        });
        if (memResp.ok) {
          const memData = (await memResp.json()) as {
            responseData?: { translatedText?: string };
          };
          const candidate = memData?.responseData?.translatedText;
          if (
            candidate &&
            candidate.trim().length > 0 &&
            !candidate.startsWith('MYMEMORY WARNING') &&
            !candidate.includes('INVALID LANGUAGE PAIR')
          ) {
            translated = candidate;
          }
        }
      } catch {
        // Fallback to Google Translate HTTP below
      }

      if (!translated) {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
            part
          )}`;
          const resp = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            redirect: 'error',
            signal: AbortSignal.timeout(4500),
          });
          if (resp.ok) {
            const contentType = resp.headers.get('content-type') || '';
            if (contentType.includes('json')) {
              const data = (await resp.json()) as unknown;
              if (Array.isArray(data) && Array.isArray(data[0])) {
                const joined = (data[0] as unknown[])
                  .map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
                  .join('');
                if (joined) translated = joined;
              }
            }
          }
        } catch {
          // Handled below
        }
      }

      if (!translated) {
        throw new Error('Translation fallback services unavailable.');
      }
      outParts.push(translated);
    }

    return postProcessTranslation(outParts.join('\n'), targetLang);
  };

  const translateViaGoogleTranslate = async (
    texts: string[],
    targetLang: 'hi' | 'en'
  ): Promise<string[]> => {
    const out = new Array<string>(texts.length);
    const CONCURRENCY = 6;
    let successCount = 0;
    let firstErr: unknown = null;

    for (let i = 0; i < texts.length; i += CONCURRENCY) {
      const slice = texts.slice(i, i + CONCURRENCY);
      await Promise.all(
        slice.map(async (item, offset) => {
          try {
            out[i + offset] = await translateSingleViaGoogleHttp(item, targetLang);
            successCount += 1;
          } catch (err: unknown) {
            if (!firstErr) firstErr = err;
            out[i + offset] = item;
          }
        })
      );
    }

    if (successCount === 0 && texts.length > 0) {
      throw firstErr ?? new Error('Unable to translate page content.');
    }

    return out;
  };

  app.post('/api/translate', async (req, res) => {
    try {
      const targetLang =
        req.body?.targetLang === 'hi' ? 'hi' : req.body?.targetLang === 'en' ? 'en' : null;
      const rawTexts = Array.isArray(req.body?.texts) ? req.body.texts : null;

      if (!targetLang || !rawTexts) {
        res.status(400).json({ error: 'targetLang ("hi" | "en") and texts[] are required.' });
        return;
      }

      const texts: string[] = rawTexts
        .slice(0, 120)
        .map((t: unknown) => (typeof t === 'string' ? t : String(t ?? '')));

      if (texts.length === 0) {
        res.json({ translations: [] });
        return;
      }

      const results = new Array<string>(texts.length);
      const missingIndices: number[] = [];
      const missingTexts: string[] = [];

      texts.forEach((text, i) => {
        const key = `${targetLang}::${text}`;
        const hit = translateCache.get(key);
        if (hit !== undefined) {
          results[i] = hit;
        } else {
          missingIndices.push(i);
          missingTexts.push(text);
        }
      });

      if (missingTexts.length > 0) {
        const systemInstruction =
          targetLang === 'hi'
            ? 'You are a sensitive literary translator for an Indian literary archive. Translate EVERY input word, adjective, verb, and clause completely into natural, expressive Hindi (Devanagari script). NEVER leave untranslated English words (such as "gripping", "emotional", etc.) in Hindi output; translate them cleanly (for example, "gripping" -> "रोमांचक"). Preserve ONLY proper names (Tejas, Purvesh -> पुर्वेश, Arjun, Kabir, Riya, Aryan, BENIYAAZ ROOH), verse line breaks (\\n), punctuation, and numbers. If a string is already natural Devanagari Hindi, keep it cleanly in Hindi.'
            : 'You are a sensitive literary translator for an Indian literary archive. Translate each input string from Marathi, Hindi, or Hinglish accurately into natural, expressive English. Preserve proper names (Tejas, Purvesh, Arjun, Kabir, Riya, Aryan, BENIYAAZ ROOH), verse line breaks (\\n), punctuation, and numbers. If a string is already natural English, keep it cleanly in English.';

        let translatedBatch: string[] | null = null;
        let lastError: unknown;

        const openaiKey = process.env.OPENAI_API_KEY?.trim();
        const openaiBaseUrl = process.env.OPENAI_BASE_URL?.trim();

        if (openaiKey && openaiBaseUrl) {
          const openai = new OpenAI({
            apiKey: openaiKey,
            baseURL: openaiBaseUrl,
            timeout: 21000,
          });
          for (const model of ['gpt-4o-mini', 'gpt-4.1-mini']) {
            try {
              const completion = await openai.chat.completions.create({
                model,
                temperature: 0.2,
                response_format: { type: 'json_object' },
                messages: [
                  {
                    role: 'system',
                    content: `${systemInstruction} Return ONLY a valid JSON object of shape {"translations": string[]} where "translations" has EXACTLY ${missingTexts.length} items matching the input order 1-for-1.`,
                  },
                  {
                    role: 'user',
                    content: JSON.stringify({ texts: missingTexts }),
                  },
                ],
              });
              const content = completion.choices[0]?.message?.content ?? '';
              const arr = parseTranslationArray(content, missingTexts.length);
              if (arr && arr.length > 0) {
                translatedBatch = arr.map((item) => postProcessTranslation(item, targetLang));
                break;
              }
            } catch (err: unknown) {
              lastError = err;
            }
          }
        }

        if (
          !translatedBatch &&
          cleanEnvValue(process.env.GEMINI_API_KEY) &&
          Date.now() >= geminiAuthBlockedUntil
        ) {
          const ai = getGeminiClient();
          const attempts: { model: string; thinkingLevel: ThinkingLevel }[] = [
            { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
            { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
          ];

          for (const attempt of attempts) {
            try {
              const response = await ai.models.generateContent({
                model: attempt.model,
                contents: JSON.stringify(missingTexts),
                config: {
                  systemInstruction: `${systemInstruction} Return a JSON array of strings with the EXACT same length (${missingTexts.length}) and order as the input array.`,
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  thinkingConfig: { thinkingLevel: attempt.thinkingLevel },
                },
              });
              const arr = parseTranslationArray(response.text ?? '[]', missingTexts.length);
              if (arr && arr.length > 0) {
                translatedBatch = arr.map((item) => postProcessTranslation(item, targetLang));
                break;
              }
            } catch (err: unknown) {
              lastError = err;
              if (isApiKeyAuthError(err)) {
                geminiAuthBlockedUntil = Date.now() + 5 * 60 * 1000;
                console.warn(
                  'Gemini Translate auth skipped; using fallback translator.'
                );
                break;
              }
              const msg = err instanceof Error ? err.message : String(err);
              const retryable =
                msg.includes('404') ||
                msg.includes('NOT_FOUND') ||
                msg.includes('429') ||
                msg.includes('RESOURCE_EXHAUSTED') ||
                msg.includes('503') ||
                msg.includes('504') ||
                msg.includes('UNAVAILABLE') ||
                msg.includes('DEADLINE_EXCEEDED') ||
                msg.toLowerCase().includes('timeout') ||
                msg.toLowerCase().includes('aborted');
              if (!retryable) break;
            }
          }
        }

        if (!translatedBatch) {
          try {
            translatedBatch = await translateViaGoogleTranslate(missingTexts, targetLang);
          } catch (fallbackErr: unknown) {
            lastError = fallbackErr;
          }
        }

        if (!translatedBatch) {
          throw lastError ?? new Error('Unable to translate page content.');
        }

        missingTexts.forEach((orig, idx) => {
          const candidate = translatedBatch?.[idx];
          const translated =
            typeof candidate === 'string' && candidate.trim().length > 0
              ? candidate
              : orig;
          const origIndex = missingIndices[idx];
          results[origIndex] = translated;
          if (translateCache.size > 4000) translateCache.clear();
          translateCache.set(`${targetLang}::${orig}`, translated);
        });
      }

      res.json({ translations: results });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to translate page content.';
      console.warn('Translate error:', message);
      const isQuota = message.includes('429') || message.includes('RESOURCE_EXHAUSTED');
      res.status(isQuota ? 429 : 502).json({
        error: isQuota
          ? 'Rate limit reached briefly. Wait a few seconds and tap Retry.'
          : message,
      });
    }
  });

  // Dynamic YouTube embed-friendly version resolver for search URLs
  app.get('/api/youtube-resolve', async (req, res) => {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({ videoIds: [] });
    }
    const blockedHints = [
      't-series',
      'sony music india',
      'zeemusiccompany',
      'zee music company',
      'yrf',
      'tips official',
      'saregama',
      'speed records',
      'shemaroo',
    ];
    try {
      const ytRes = await fetch(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
            Cookie: 'SOCS=CAI',
          },
          signal: AbortSignal.timeout(7000),
        }
      );
      const html = await ytRes.text();
      const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
      if (!match) {
        return res.json({ videoIds: [] });
      }
      const root = JSON.parse(match[1]) as unknown;
      const items: Array<{ id: string; title: string; author: string }> = [];
      const walk = (node: unknown) => {
        if (!node || typeof node !== 'object') return;
        const rec = node as Record<string, unknown>;
        if (rec.videoRenderer && typeof rec.videoRenderer === 'object') {
          const vr = rec.videoRenderer as {
            videoId?: string;
            title?: { runs?: Array<{ text?: string }> };
            ownerText?: { runs?: Array<{ text?: string }> };
          };
          if (vr.videoId) {
            items.push({
              id: vr.videoId,
              title: vr.title?.runs?.map((r) => r.text ?? '').join('') ?? '',
              author: vr.ownerText?.runs?.map((r) => r.text ?? '').join('') ?? '',
            });
          }
          return;
        }
        if (Array.isArray(node)) node.forEach(walk);
        else Object.values(rec).forEach(walk);
      };
      walk(root);

      const scored = items
        .filter((v) => !v.title.toLowerCase().includes('#shorts'))
        .sort((a, b) => {
          const aScore =
            (a.title.toLowerCase().includes('lyric') ? 10 : 0) -
            (blockedHints.some((h) => a.author.toLowerCase().includes(h)) ? 12 : 0);
          const bScore =
            (b.title.toLowerCase().includes('lyric') ? 10 : 0) -
            (blockedHints.some((h) => b.author.toLowerCase().includes(h)) ? 12 : 0);
          return bScore - aScore;
        })
        .slice(0, 6);

      const videoIds: string[] = [];
      for (const c of scored) {
        try {
          const oe = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${c.id}&format=json`,
            { signal: AbortSignal.timeout(3500) }
          );
          if (oe.ok) {
            videoIds.push(c.id);
            if (videoIds.length >= 3) break;
          }
        } catch {
          // skip
        }
      }
      return res.json({ videoIds });
    } catch {
      return res.status(502).json({ videoIds: [] });
    }
  });

  // Dynamic XML Sitemap
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl =
      process.env.APP_URL?.replace(/\/+$/, '') ||
      'https://tejasphirake.vercel.app';
    const { books, poems, journal } = buildMergedCatalog(false);
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

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Author CMS Auth Status
  app.get('/api/cms/status', (req, res) => {
    const auth = readAuthStore();
    const cookies = parseCookies(req.headers.cookie);
    const authenticated = verifySessionToken(cookies.tejas_author_session, auth.sessionSecret);
    res.json({
      authenticated,
      needsSetup: !isAuthorPassphraseConfigured(),
    });
  });

  // One-time passphrase initialization when AUTHOR_CMS_PASSPHRASE is not set
  app.post('/api/cms/setup', (req, res) => {
    if (isAuthorPassphraseConfigured()) {
      res.status(403).json({ error: 'Author passphrase is already configured.' });
      return;
    }
    const passphrase = String(req.body?.passphrase || '').trim();
    if (passphrase.length < 6) {
      res.status(400).json({ error: 'Passphrase must be at least 6 characters.' });
      return;
    }
    const auth = readAuthStore();
    const salt = crypto.randomBytes(16).toString('hex');
    auth.passphraseSalt = salt;
    auth.passphraseHash = hashPassphrase(passphrase, salt);
    writeAuthStore(auth);

    const token = signSessionToken(auth.sessionSecret);
    res.setHeader(
      'Set-Cookie',
      `tejas_author_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`
    );
    res.json({ authenticated: true, needsSetup: false });
  });

  // Author CMS Login
  app.post('/api/cms/auth', (req, res) => {
    const passphrase = String(req.body?.passphrase || '');
    if (!isAuthorPassphraseConfigured()) {
      res.status(400).json({ error: 'Studio passphrase has not been initialized yet.' });
      return;
    }
    if (!verifyAuthorPassphrase(passphrase)) {
      res.status(401).json({ error: 'Invalid author passphrase.' });
      return;
    }
    const auth = readAuthStore();
    const token = signSessionToken(auth.sessionSecret);
    res.setHeader(
      'Set-Cookie',
      `tejas_author_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`
    );
    res.json({ authenticated: true });
  });

  // Author CMS Logout
  app.post('/api/cms/logout', (_req, res) => {
    res.setHeader(
      'Set-Cookie',
      'tejas_author_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    );
    res.json({ authenticated: false });
  });

  // Auth Guard Middleware for CMS mutations & drafts
  function requireAuthorSession(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const auth = readAuthStore();
    const cookies = parseCookies(req.headers.cookie);
    if (!verifySessionToken(cookies.tejas_author_session, auth.sessionSecret)) {
      res.status(401).json({ error: 'Author authentication required.' });
      return;
    }
    next();
  }

  // Full CMS Catalog (including unpublished items)
  app.get('/api/cms/catalog', requireAuthorSession, (_req, res) => {
    res.json(buildMergedCatalog(true));
  });

  // Upload PDF or Cover File
  app.post(
    '/api/cms/upload',
    requireAuthorSession,
    upload.single('file'),
    (req, res) => {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
      }
      res.json({
        url: `/uploads/${req.file.filename}`,
        originalFilename: req.file.originalname,
      });
    }
  );

  // Create Book
  app.post('/api/cms/books', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const body = req.body as Partial<BookPublication>;
    if (!body.title || !body.pdfUrl) {
      res.status(400).json({ error: 'Title and PDF file URL are required.' });
      return;
    }
    const id = `book-custom-${Date.now()}`;
    const newBook: BookPublication = {
      id,
      slug: body.slug ? slugify(body.slug) : `${slugify(body.title)}-${Date.now().toString().slice(-4)}`,
      title: body.title.trim(),
      subtitle: body.subtitle?.trim() || undefined,
      author: body.author?.trim() || 'Tejas Purvesh Phirake',
      authorCreditLabel: body.authorCreditLabel?.trim() || 'Tejas Purvesh Phirake',
      section: body.section || 'novels',
      editionLabel: body.editionLabel?.trim() || undefined,
      editionGroup: body.editionGroup?.trim() || undefined,
      language: body.language || 'मराठी',
      genre: body.genre?.trim() || 'Literary Work',
      pageCount: Number(body.pageCount) || 1,
      pdfUrl: body.pdfUrl,
      originalFilename: body.originalFilename || `${body.title.trim()}.pdf`,
      coverPageNumber: Number(body.coverPageNumber) || 1,
      customCoverUrl: body.customCoverUrl || undefined,
      coverTone: body.coverTone || 'midnight',
      description: body.description?.trim() || '',
      structureHighlights: Array.isArray(body.structureHighlights)
        ? body.structureHighlights
        : [],
      published: body.published ?? true,
      featured: body.featured ?? false,
      recentlyAdded: body.recentlyAdded ?? true,
      releaseOrder: Number(body.releaseOrder) || 100 + store.customBooks.length,
      createdAt: new Date().toISOString(),
    };
    store.customBooks.push(newBook);
    writeCmsStore(store);
    res.status(201).json(newBook);
  });

  // Update Book (works for both base & custom books)
  app.put('/api/cms/books/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    const patch = req.body as Partial<BookPublication>;
    const customIdx = store.customBooks.findIndex((b) => b.id === id);
    if (customIdx > -1) {
      store.customBooks[customIdx] = { ...store.customBooks[customIdx], ...patch };
    } else {
      store.bookOverrides[id] = { ...(store.bookOverrides[id] ?? {}), ...patch };
    }
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Delete Book
  app.delete('/api/cms/books/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    store.customBooks = store.customBooks.filter((b) => b.id !== id);
    if (!store.deletedBookIds.includes(id)) store.deletedBookIds.push(id);
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Create Poem
  app.post('/api/cms/poems', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const body = req.body as Partial<PoemEntry>;
    if (!body.title || !body.body) {
      res.status(400).json({ error: 'Poem title and verbatim text are required.' });
      return;
    }
    const id = `poem-custom-${Date.now()}`;
    const newPoem: PoemEntry = {
      id,
      slug: body.slug ? slugify(body.slug) : `poem-${Date.now().toString().slice(-6)}`,
      number: body.number,
      title: body.title.trim(),
      englishSubtitle: body.englishSubtitle?.trim() || undefined,
      body: body.body, // Preserve exact verbatim whitespace & punctuation
      language: body.language || 'मराठी',
      category: body.category || 'Unsaid Feelings',
      author: body.author?.trim() || 'Tejas Purvesh Phirake',
      sourcePublicationSlug: body.sourcePublicationSlug || undefined,
      sourceTitle: body.sourceTitle?.trim() || 'BENIYAAZ.ROOH',
      partName: body.partName?.trim() || undefined,
      dateLabel: body.dateLabel?.trim() || undefined,
      dedication: body.dedication || undefined,
      songs: Array.isArray(body.songs) ? body.songs : undefined,
      audioUrl: body.audioUrl?.trim() || undefined,
      audioDurationLabel: body.audioDurationLabel?.trim() || undefined,
      featured: body.featured ?? false,
      recentlyAdded: body.recentlyAdded ?? true,
      published: body.published ?? true,
      createdAt: new Date().toISOString(),
    };
    store.customPoems.unshift(newPoem);
    writeCmsStore(store);
    res.status(201).json(newPoem);
  });

  // Update Poem
  app.put('/api/cms/poems/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    const patch = req.body as Partial<PoemEntry>;
    const customIdx = store.customPoems.findIndex((p) => p.id === id);
    if (customIdx > -1) {
      store.customPoems[customIdx] = { ...store.customPoems[customIdx], ...patch };
    } else {
      store.poemOverrides[id] = { ...(store.poemOverrides[id] ?? {}), ...patch };
    }
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Delete Poem
  app.delete('/api/cms/poems/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    store.customPoems = store.customPoems.filter((p) => p.id !== id);
    if (!store.deletedPoemIds.includes(id)) store.deletedPoemIds.push(id);
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Create Journal Post
  app.post('/api/cms/journal', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const body = req.body as Partial<JournalPost>;
    if (!body.title || !body.content) {
      res.status(400).json({ error: 'Journal title and content are required.' });
      return;
    }
    const id = `journal-custom-${Date.now()}`;
    const newPost: JournalPost = {
      id,
      slug: body.slug ? slugify(body.slug) : `note-${Date.now().toString().slice(-6)}`,
      title: body.title.trim(),
      excerpt: body.excerpt?.trim() || body.content.trim().slice(0, 140),
      content: body.content,
      sourceLabel: body.sourceLabel?.trim() || 'Author Reflection · TEJAS · BENIYAAZ.ROOH',
      relatedBookSlug: body.relatedBookSlug || undefined,
      language: body.language || 'English',
      publishedAt: body.publishedAt || new Date().toISOString().slice(0, 10),
      published: body.published ?? true,
    };
    store.customJournal.unshift(newPost);
    writeCmsStore(store);
    res.status(201).json(newPost);
  });

  // Update Journal Post
  app.put('/api/cms/journal/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    const patch = req.body as Partial<JournalPost>;
    const customIdx = store.customJournal.findIndex((j) => j.id === id);
    if (customIdx > -1) {
      store.customJournal[customIdx] = { ...store.customJournal[customIdx], ...patch };
    } else {
      store.journalOverrides[id] = { ...(store.journalOverrides[id] ?? {}), ...patch };
    }
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Delete Journal Post
  app.delete('/api/cms/journal/:id', requireAuthorSession, (req, res) => {
    const store = readCmsStore();
    const { id } = req.params;
    store.customJournal = store.customJournal.filter((j) => j.id !== id);
    if (!store.deletedJournalIds.includes(id)) store.deletedJournalIds.push(id);
    writeCmsStore(store);
    res.json({ ok: true });
  });

  // Vite dev middleware OR production static files
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, max-age=0');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TEJAS · BENIYAAZ.ROOH server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
