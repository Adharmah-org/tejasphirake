import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Music2,
  Play,
  RefreshCw,
} from 'lucide-react';
import type { PoemSong } from '../types/literary';

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: { playVideo: () => void } }) => void;
            onStateChange?: (e: { data: number }) => void;
            onError?: (e: { data: number }) => void;
          };
        }
      ) => {
        destroy: () => void;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
    __beniyaazYtCallbacks?: Array<() => void>;
  }
}

export function extractYouTubeVideoId(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      if (
        parts.length >= 2 &&
        (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') &&
        /^[a-zA-Z0-9_-]{11}$/.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    window.__beniyaazYtCallbacks = window.__beniyaazYtCallbacks || [];
    window.__beniyaazYtCallbacks.push(resolve);

    if (!document.getElementById('beniyaaz-yt-iframe-api')) {
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevReady?.();
        const cbs = window.__beniyaazYtCallbacks || [];
        window.__beniyaazYtCallbacks = [];
        cbs.forEach((fn) => fn());
      };
      const tag = document.createElement('script');
      tag.id = 'beniyaaz-yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }
  });
}

interface InlineSongPlayerProps {
  song: PoemSong;
  surface?: 'midnight' | 'paper' | 'dark';
  compact?: boolean;
}

export function InlineSongPlayer({
  song,
  surface = 'midnight',
  compact = false,
}: InlineSongPlayerProps) {
  const playerSlotId = useId().replace(/:/g, '_');
  const mountNodeRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<{ destroy: () => void } | null>(null);

  const staticIds = useMemo(() => {
    const raw = [song.youtubeUrl, ...(song.altYoutubeUrls ?? [])];
    const ids: string[] = [];
    for (const url of raw) {
      const id = extractYouTubeVideoId(url);
      if (id && !ids.includes(id)) ids.push(id);
    }
    return ids;
  }, [song.youtubeUrl, song.altYoutubeUrls]);

  const [dynamicIds, setDynamicIds] = useState<string[]>([]);
  const candidateIds = staticIds.length > 0 ? staticIds : dynamicIds;

  const [expanded, setExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [allBlocked, setAllBlocked] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setActiveIdx(0);
    setAllBlocked(false);
    setFailedCount(0);
    setDynamicIds([]);
  }, [song.title, song.youtubeUrl]);

  const currentVideoId = candidateIds[activeIdx] ?? null;

  const handleToggleOpen = async () => {
    if (expanded) {
      setExpanded(false);
      window.dispatchEvent(new CustomEvent('beniyaaz:song-pause'));
      return;
    }

    window.dispatchEvent(new CustomEvent('beniyaaz:song-play'));
    setAllBlocked(false);
    setFailedCount(0);
    setActiveIdx(0);
    setExpanded(true);

    if (staticIds.length === 0 && dynamicIds.length === 0) {
      setResolving(true);
      try {
        const searchQ = `${song.title} ${song.artist ?? ''} lyrics`.trim();
        const res = await fetch(
          `/api/youtube-resolve?q=${encodeURIComponent(searchQ)}`
        );
        const data = (await res.json().catch(() => ({}))) as {
          videoIds?: string[];
        };
        if (res.ok && Array.isArray(data.videoIds) && data.videoIds.length > 0) {
          setDynamicIds(data.videoIds);
        } else {
          setAllBlocked(true);
        }
      } catch {
        setAllBlocked(true);
      } finally {
        setResolving(false);
      }
    }
  };

  useEffect(() => {
    if (!expanded || !currentVideoId || !mountNodeRef.current) return;

    let cancelled = false;
    const container = mountNodeRef.current;
    container.innerHTML = '';
    const inner = document.createElement('div');
    inner.id = `yt_${playerSlotId}_${activeIdx}`;
    container.appendChild(inner);

    loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !window.YT?.Player) return;
        ytPlayerRef.current?.destroy();
        ytPlayerRef.current = new window.YT.Player(inner, {
          videoId: currentVideoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (e) => {
              if (!cancelled) {
                try {
                  e.target.playVideo();
                } catch {
                  // autoplay fallback handled by user tap
                }
              }
            },
            onStateChange: (e) => {
              if (cancelled) return;
              if (e.data === 1) {
                window.dispatchEvent(new CustomEvent('beniyaaz:song-play'));
              } else if (e.data === 0 || e.data === 2) {
                window.dispatchEvent(new CustomEvent('beniyaaz:song-pause'));
              }
            },
            onError: (e) => {
              if (cancelled) return;
              // 101 / 150 = owner disabled embed playback; 100 = video unavailable
              if ([2, 5, 100, 101, 150].includes(e.data)) {
                setFailedCount((prev) => {
                  const nextFailed = prev + 1;
                  if (activeIdx + 1 < candidateIds.length && nextFailed < candidateIds.length) {
                    setActiveIdx((i) => i + 1);
                  } else {
                    setAllBlocked(true);
                  }
                  return nextFailed;
                });
              }
            },
          },
        });
      })
      .catch(() => {
        // Fallback plain iframe if API script is blocked
        if (cancelled || !mountNodeRef.current) return;
        mountNodeRef.current.innerHTML = `<iframe title="${song.title.replace(
          /"/g,
          '&quot;'
        )}" src="https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&rel=0" class="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      });

    return () => {
      cancelled = true;
      window.dispatchEvent(new CustomEvent('beniyaaz:song-pause'));
      try {
        ytPlayerRef.current?.destroy();
      } catch {
        // ignore cleanup error
      }
      ytPlayerRef.current = null;
    };
  }, [expanded, currentVideoId, activeIdx, candidateIds.length, playerSlotId, song.title]);

  const isPaper = surface === 'paper';
  const externalWatchUrl = currentVideoId
    ? `https://www.youtube.com/watch?v=${currentVideoId}`
    : song.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.title} ${song.artist ?? ''}`.trim())}`;

  const switchVersion = () => {
    if (candidateIds.length <= 1) return;
    setAllBlocked(false);
    setActiveIdx((i) => (i + 1) % candidateIds.length);
  };

  return (
    <div
      data-no-translate="true"
      className={`rounded-md border transition-colors ${
        isPaper
          ? 'border-[#D5C9B4] bg-[#F7F2E7] text-[#1E1A16]'
          : 'border-[#2B2823] bg-[#0F0E0C] text-[#EFEAE0]'
      } ${compact ? 'p-3' : 'p-3.5 sm:p-4'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Music2 className="h-4 w-4 shrink-0 text-[#C9A45C]" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{song.title}</p>
            {song.artist && (
              <p
                className={`truncate text-xs ${
                  isPaper ? 'text-[#6A5F52]' : 'text-[#9A9285]'
                }`}
              >
                {song.artist}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleOpen}
            aria-expanded={expanded}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              expanded
                ? 'border border-[#C9A45C] bg-[#C9A45C] text-[#0C0B0A]'
                : isPaper
                  ? 'border border-[#C9A45C]/70 bg-[#EFE6D4] text-[#4E3D1C] hover:bg-[#C9A45C] hover:text-[#0C0B0A]'
                  : 'border border-[#C9A45C]/55 bg-[#1C1A17] text-[#DEC07C] hover:bg-[#C9A45C] hover:text-[#0C0B0A]'
            }`}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Hide Player</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play Inline</span>
                <ChevronDown className="h-3 w-3 opacity-80" />
              </>
            )}
          </button>

          <a
            href={externalWatchUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${song.title} on YouTube`}
            className={`inline-flex min-h-[36px] items-center gap-1 rounded border px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap ${
              isPaper
                ? 'border-[#CEC2AD] text-[#5B5247] hover:border-[#C9A45C] hover:text-[#1E1A16]'
                : 'border-[#2B2823] text-[#9A9285] hover:border-[#C9A45C]/60 hover:text-[#DEC07C]'
            }`}
          >
            <span>YouTube</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {expanded && (
        <div
          className={`mt-3 border-t pt-3 ${
            isPaper ? 'border-[#DDD3C0]' : 'border-[#2B2823]'
          }`}
        >
          {resolving ? (
            <div className="flex h-44 items-center justify-center gap-2 rounded bg-[#080706] text-xs text-[#C4BDB0]">
              <Loader2 className="h-4 w-4 animate-spin text-[#C9A45C]" />
              <span>Loading embeddable version...</span>
            </div>
          ) : allBlocked || !currentVideoId ? (
            <div
              className={`flex flex-col items-center justify-center gap-3 rounded border p-5 text-center text-xs ${
                isPaper
                  ? 'border-[#D5C9B4] bg-[#EFE8DA] text-[#5B5247]'
                  : 'border-[#2B2823] bg-[#0C0B0A] text-[#C4BDB0]'
              }`}
            >
              <p>
                Inline playback for all available versions was restricted by the uploader in
                this browser.
              </p>
              <a
                href={externalWatchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded bg-[#C9A45C] px-4 py-2 font-semibold text-[#0C0B0A] hover:bg-[#DEC07C]"
              >
                <span>Open directly on YouTube</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <>
              <div className="relative aspect-video w-full overflow-hidden rounded bg-black [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full">
                <div ref={mountNodeRef} className="h-full w-full" />
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className={isPaper ? 'text-[#6A5F52]' : 'text-[#9A9285]'}>
                  Playing version {activeIdx + 1} of {candidateIds.length}
                  {failedCount > 0 ? ' (switched to embeddable upload)' : ''}
                </span>

                {candidateIds.length > 1 && (
                  <button
                    type="button"
                    onClick={switchVersion}
                    className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 transition-colors ${
                      isPaper
                        ? 'border-[#C9A45C]/60 text-[#5C451C] hover:bg-[#EFE6D4]'
                        : 'border-[#2B2823] text-[#DEC07C] hover:border-[#C9A45C]'
                    }`}
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Try Alternate Version</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
