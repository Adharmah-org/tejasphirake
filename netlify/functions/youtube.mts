export const config = {
  path: '/api/youtube-resolve',
  method: ['GET'],
};

const BLOCKED_LABEL_HINTS = [
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

function extractVideoRenderers(
  obj: unknown,
  out: Array<{ id: string; title: string; author: string }> = []
) {
  if (!obj || typeof obj !== 'object') return out;
  const rec = obj as Record<string, unknown>;
  if (rec.videoRenderer && typeof rec.videoRenderer === 'object') {
    const vr = rec.videoRenderer as {
      videoId?: string;
      title?: { runs?: Array<{ text?: string }> };
      ownerText?: { runs?: Array<{ text?: string }> };
    };
    if (vr.videoId) {
      out.push({
        id: vr.videoId,
        title: vr.title?.runs?.map((r) => r.text ?? '').join('') ?? '',
        author: vr.ownerText?.runs?.map((r) => r.text ?? '').join('') ?? '',
      });
    }
    return out;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) extractVideoRenderers(item, out);
  } else {
    for (const k of Object.keys(rec)) extractVideoRenderers(rec[k], out);
  }
  return out;
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const query = (url.searchParams.get('q') || '').trim();
  if (!query) {
    return Response.json({ videoIds: [] }, { status: 400 });
  }

  try {
    const res = await fetch(
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
    const html = await res.text();
    const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
    if (!match) {
      return Response.json({ videoIds: [] });
    }
    const parsed = JSON.parse(match[1]) as unknown;
    const candidates = extractVideoRenderers(parsed)
      .filter((v) => !v.title.toLowerCase().includes('#shorts'))
      .sort((a, b) => {
        const aScore =
          (a.title.toLowerCase().includes('lyric') ? 10 : 0) -
          (BLOCKED_LABEL_HINTS.some((h) => a.author.toLowerCase().includes(h)) ? 12 : 0);
        const bScore =
          (b.title.toLowerCase().includes('lyric') ? 10 : 0) -
          (BLOCKED_LABEL_HINTS.some((h) => b.author.toLowerCase().includes(h)) ? 12 : 0);
        return bScore - aScore;
      })
      .slice(0, 6);

    const verified: string[] = [];
    for (const c of candidates) {
      try {
        const oe = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${c.id}&format=json`,
          { signal: AbortSignal.timeout(3500) }
        );
        if (oe.ok) {
          verified.push(c.id);
          if (verified.length >= 3) break;
        }
      } catch {
        // skip
      }
    }

    return Response.json({ videoIds: verified });
  } catch {
    return Response.json({ videoIds: [] }, { status: 502 });
  }
};
