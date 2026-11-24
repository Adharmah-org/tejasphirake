import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import OpenAI from 'openai';

const warmTranslateCache = new Map<string, string>();
let geminiAuthBlockedUntil = 0;

function readEnv(key: string): string | undefined {
  const cleaned = process.env[key]
    ?.trim()
    .replace(/^["']|["']$/g, '')
    .trim();
  return cleaned || undefined;
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

function parseTranslationArray(rawText: string, expectedLen: number): string[] | null {
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
}

function postProcessTranslation(raw: string, targetLang: 'hi' | 'en'): string {
  if (targetLang === 'hi') {
    return raw
      .replace(/तेजस\s+पूर्वेश\s+फिरके/g, 'तेजस पुर्वेश फिरके')
      .replace(/पूर्वेश/g, 'पुर्वेश')
      .replace(/बेनियाज़\s+रूह/g, 'BENIYAAZ ROOH');
  }
  return raw.replace(/Tejas\s+Poorvesh\s+Phirake/gi, 'Tejas Purvesh Phirake');
}

function splitForTranslateEndpoint(text: string, maxLen = 400): string[] {
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
}

function detectSourceLangForMyMemory(
  text: string,
  targetLang: 'hi' | 'en'
): 'en' | 'hi' | 'mr' | null {
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
  if (targetLang === 'hi') return null; // Already Hindi Devanagari
  return 'hi';
}

async function translateSingleFallback(
  text: string,
  targetLang: 'hi' | 'en'
): Promise<string> {
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

    // Try MyMemory with explicit valid source language (never autodetect)
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
          responseStatus?: number;
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
      // Fallback below
    }

    // Secondary Google Translate HTTP attempt (works from residential/edge IPs)
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
        // Keep below
      }
    }

    if (!translated) {
      throw new Error('Translation fallback services unavailable.');
    }
    outParts.push(translated);
  }

  return postProcessTranslation(outParts.join('\n'), targetLang);
}

async function translateViaFallbackBatch(
  items: string[],
  targetLang: 'hi' | 'en'
): Promise<string[]> {
  const out = new Array<string>(items.length);
  const CONCURRENCY = 6;
  let successCount = 0;
  let firstErr: unknown = null;

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const slice = items.slice(i, i + CONCURRENCY);
    await Promise.all(
      slice.map(async (item, offset) => {
        try {
          out[i + offset] = await translateSingleFallback(item, targetLang);
          successCount += 1;
        } catch (err: unknown) {
          if (!firstErr) firstErr = err;
          out[i + offset] = item;
        }
      })
    );
  }

  if (successCount === 0 && items.length > 0) {
    throw firstErr ?? new Error('Unable to translate page content.');
  }

  return out;
}

export async function POST(req: Request): Promise<Response> {
  const startedAt = Date.now();
  try {
    const body = (await req.json().catch(() => ({}))) as {
      targetLang?: string;
      texts?: unknown;
    };

    const targetLang =
      body.targetLang === 'hi' ? 'hi' : body.targetLang === 'en' ? 'en' : null;
    const rawTexts = Array.isArray(body.texts) ? body.texts : null;

    if (!targetLang || !rawTexts) {
      return Response.json(
        { error: 'targetLang ("hi" | "en") and texts[] are required.' },
        { status: 400 }
      );
    }

    const texts = rawTexts
      .slice(0, 120)
      .map((t) => (typeof t === 'string' ? t : String(t ?? '')));

    if (texts.length === 0) {
      return Response.json({ translations: [] });
    }

    const results = new Array<string>(texts.length);
    const missingIndices: number[] = [];
    const missingTexts: string[] = [];

    texts.forEach((text, i) => {
      const hit = warmTranslateCache.get(`${targetLang}::${text}`);
      if (hit !== undefined) {
        results[i] = hit;
      } else {
        missingIndices.push(i);
        missingTexts.push(text);
      }
    });

    if (missingTexts.length === 0) {
      return Response.json({ translations: results });
    }

    const systemInstruction =
      targetLang === 'hi'
        ? 'You are a sensitive literary translator for an Indian literary archive. Translate EVERY input word, adjective, verb, and clause completely into natural, expressive Hindi (Devanagari script). NEVER leave untranslated English words (such as "gripping", "emotional", etc.) in Hindi output; translate them cleanly (for example, "gripping" -> "रोमांचक"). Preserve ONLY proper names (Tejas, Purvesh -> पुर्वेश, Arjun, Kabir, Riya, Aryan, BENIYAAZ ROOH), verse line breaks (\\n), punctuation, and numbers. If a string is already natural Devanagari Hindi, keep it cleanly in Hindi.'
        : 'You are a sensitive literary translator for an Indian literary archive. Translate each input string from Marathi, Hindi, or Hinglish accurately into natural, expressive English. Preserve proper names (Tejas, Purvesh, Arjun, Kabir, Riya, Aryan, BENIYAAZ ROOH), verse line breaks (\\n), punctuation, and numbers. If a string is already natural English, keep it cleanly in English.';

    let translatedBatch: string[] | null = null;
    let lastError: unknown;

    const openaiKey = readEnv('OPENAI_API_KEY');
    const openaiBaseUrl = readEnv('OPENAI_BASE_URL');
    if (openaiKey && openaiBaseUrl) {
      const openai = new OpenAI({
        apiKey: openaiKey,
        baseURL: openaiBaseUrl,
        timeout: 18000,
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

    const activeGeminiKey = readEnv('GOOGLE_API_KEY') || readEnv('GEMINI_API_KEY');
    if (
      !translatedBatch &&
      activeGeminiKey &&
      Date.now() >= geminiAuthBlockedUntil
    ) {
      const ai = new GoogleGenAI({
        apiKey: activeGeminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
          timeout: 12000,
        },
      });

      const attempts: { model: string; thinkingLevel: ThinkingLevel }[] = [
        { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW },
        { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
      ];

      for (const attempt of attempts) {
        if (Date.now() - startedAt > 16000) break;
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
            break;
          }
        }
      }
    }

    if (!translatedBatch) {
      try {
        translatedBatch = await translateViaFallbackBatch(missingTexts, targetLang);
      } catch (fallbackErr: unknown) {
        lastError = fallbackErr;
      }
    }

    if (!translatedBatch) {
      throw lastError ?? new Error('Unable to translate page content.');
    }

    missingTexts.forEach((orig, idx) => {
      const candidate = translatedBatch?.[idx];
      const finalVal =
        typeof candidate === 'string' && candidate.trim().length > 0 ? candidate : orig;
      const origIndex = missingIndices[idx];
      results[origIndex] = finalVal;
      if (warmTranslateCache.size > 4000) warmTranslateCache.clear();
      warmTranslateCache.set(`${targetLang}::${orig}`, finalVal);
    });

    return Response.json({ translations: results });
  } catch (err: unknown) {
    const raw =
      err instanceof Error ? err.message : 'Unable to translate page content.';
    const isQuota = raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED');
    return Response.json(
      {
        error: isQuota
          ? 'Rate limit reached briefly. Wait a few seconds and tap Retry.'
          : raw,
      },
      { status: isQuota ? 429 : 502 }
    );
  }
}
