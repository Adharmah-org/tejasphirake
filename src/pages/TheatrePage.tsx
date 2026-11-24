import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Compass,
  Eye,
  LampCeiling,
  Moon,
  Music2,
  Play,
  RotateCw,
  Users,
  VolumeX,
} from 'lucide-react';
import { BookCoverPreview } from '../components/BookCoverPreview';
import {
  CollectorFoilSeal,
  FolioCornerFiligree,
  ManuscriptDivider,
  ParallaxArtworkFrame,
} from '../components/FolioCraft';
import { MarginNotesDrawer } from '../components/MarginNotesDrawer';
import { ProtectedReadingSurface } from '../components/ProtectedReadingSurface';
import { ScrollProgressHairline } from '../components/ScrollProgressHairline';
import { useCatalog } from '../context/CatalogContext';
import { THEATRE_SCENE_NOTES } from '../data/marginNotesData';
import {
  DIRECTOR_NOTES,
  THEATRE_ACT_QUESTIONS,
  THEATRE_ACTS,
  THEATRE_CAST,
  THEATRE_PLAY_META,
  THEATRE_STAGE_STOPS,
  THEATRE_VERBATIM_EXCERPTS,
} from '../data/theatreArchiveData';
import { ARTWORKS } from '../lib/artworks';
import { useDocumentMeta } from '../lib/useDocumentMeta';

type LightingPreset = 'act' | 'blue-poem' | 'blackout';
type StageSoundCue = 'none' | 'clock' | 'drone';

const CAST_FOCUS_MOTIFS: Record<string, string> = {
  'अर्जुन कुलकर्णी': 'केंद्रस्थानी · रात्री ३:४८ चा शोध',
  'आई (सुमन)': 'निळा प्रकाशकिरण · ओवी व वही',
  बाबा: 'शांतता हीच अभिनयाची जागा',
  आवाज: 'अदृश्य सूत्रधार व अंतर्मन',
};

export function TheatrePage() {
  useDocumentMeta(
    'The Theatre: मीच प्रश्न, मीच उत्तर (तीन अंकी मराठी नाटक)',
    'Complete 3-Act, 28-Scene Marathi stage play by Tejas Purvesh Phirake: revolving stage deck, lighting cues, verbatim scenes, cast list, and director notes.'
  );

  const { books } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const playBook = useMemo(
    () => books.find((b) => b.slug === THEATRE_PLAY_META.bookSlug),
    [books]
  );

  const actParam = Number(searchParams.get('act'));
  const initialActIdx =
    Number.isFinite(actParam) && actParam >= 1 && actParam <= THEATRE_ACTS.length
      ? actParam - 1
      : 0;

  const [selectedActIdx, setSelectedActIdx] = useState(initialActIdx);
  const [stageStopIdx, setStageStopIdx] = useState(0);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('act');
  const [activeSoundCue, setActiveSoundCue] = useState<StageSoundCue>('none');
  const [silentPauseOpen, setSilentPauseOpen] = useState(false);

  const [selectedExcerptId, setSelectedExcerptId] = useState(
    THEATRE_VERBATIM_EXCERPTS[0].id
  );
  const [scriptView, setScriptView] = useState<'dialogue' | 'spotlight'>('dialogue');
  const [focusSpeaker, setFocusSpeaker] = useState<string>('all');
  const [rehearsalCueMode, setRehearsalCueMode] = useState(false);
  const [cueStep, setCueStep] = useState(1);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickTimerRef = useRef<number | null>(null);
  const droneNodesRef = useRef<{ stop: () => void } | null>(null);

  const activeAct = THEATRE_ACTS[selectedActIdx] || THEATRE_ACTS[0];
  const activeActQuestion =
    THEATRE_ACT_QUESTIONS[selectedActIdx] || THEATRE_ACT_QUESTIONS[0];
  const activeStageStop =
    THEATRE_STAGE_STOPS[stageStopIdx] || THEATRE_STAGE_STOPS[0];
  const activeExcerpt =
    THEATRE_VERBATIM_EXCERPTS.find((e) => e.id === selectedExcerptId) ||
    THEATRE_VERBATIM_EXCERPTS[0];
  const sceneMarginNotes = THEATRE_SCENE_NOTES[activeExcerpt.id] ?? [];

  const availableSpeakers = useMemo(() => {
    const set = new Set<string>();
    for (const line of activeExcerpt.lines) {
      if (line.type === 'dialogue' && line.speaker) {
        set.add(line.speaker);
      }
    }
    return ['all', ...Array.from(set)];
  }, [activeExcerpt]);

  useEffect(() => {
    setFocusSpeaker('all');
    setCueStep(1);
  }, [selectedExcerptId]);

  useEffect(() => {
    if (!rehearsalCueMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCueStep((c) => Math.min(activeExcerpt.lines.length, c + 1));
      } else if (e.key === 'ArrowLeft') {
        setCueStep((c) => Math.max(1, c - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rehearsalCueMode, activeExcerpt.lines.length]);

  useEffect(() => {
    setSilentPauseOpen(false);
  }, [selectedActIdx]);

  // Clean up procedural stage audio on unmount or cue switch
  const stopAllStageAudio = () => {
    if (tickTimerRef.current !== null) {
      window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    if (droneNodesRef.current) {
      try {
        droneNodesRef.current.stop();
      } catch {
        // ignore stop errors
      }
      droneNodesRef.current = null;
    }
  };

  useEffect(() => {
    stopAllStageAudio();
    if (activeSoundCue === 'none') return;

    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextCtor();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    if (activeSoundCue === 'clock') {
      const playTick = (isTock: boolean) => {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isTock ? 760 : 980, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.06, now + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      };

      let beat = 0;
      playTick(false);
      tickTimerRef.current = window.setInterval(() => {
        beat += 1;
        playTick(beat % 2 === 1);
      }, 950);
    } else if (activeSoundCue === 'drone') {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.8);
      master.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(146.83, ctx.currentTime); // D3 tanpura/bansuri tonic
      osc2.frequency.setValueAtTime(220.0, ctx.currentTime); // A3 fifth

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(master);

      osc1.start();
      osc2.start();

      droneNodesRef.current = {
        stop: () => {
          const t = ctx.currentTime;
          master.gain.linearRampToValueAtTime(0.0001, t + 0.25);
          window.setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
            } catch {
              // already stopped
            }
          }, 280);
        },
      };
    }

    return () => {
      stopAllStageAudio();
    };
  }, [activeSoundCue]);

  useEffect(() => {
    return () => {
      stopAllStageAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        void audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const actAtmosphere = useMemo(() => {
    if (lightingPreset === 'blackout') {
      return {
        label: 'मंच अंधार · आवाजासाठी शांत विराम',
        caption: 'संपूर्ण रंगमंच अंधारात. फक्त प्रेक्षकांच्या मनातलं उत्तर जागतं.',
        glowStyle:
          'radial-gradient(circle at 50% 50%, rgba(18,16,14,0.8), rgba(6,6,5,0.98) 72%)',
        arcStroke: 'rgba(154, 146, 133, 0.28)',
        dotFill: 'rgba(154, 146, 133, 0.2)',
        dotGlow: false,
      };
    }
    if (lightingPreset === 'blue-poem') {
      return {
        label: 'आईच्या कवितेचा निळा प्रकाशकिरण',
        caption: 'एकच शीतल निळा प्रकाशकिरण मंचावर, बाकी सर्व परिसर मंद.',
        glowStyle:
          'radial-gradient(circle at 50% 38%, rgba(108, 152, 224, 0.22), rgba(14,13,12,0) 68%)',
        arcStroke: 'rgba(148, 184, 240, 0.72)',
        dotFill: '#B6D0FA',
        dotGlow: true,
      };
    }
    if (selectedActIdx === 0) {
      return {
        label: 'अंक पहिला · अपूर्ण आणि तुटकं प्रश्नचिन्ह',
        caption: 'दिवा विझलेला, फक्त वरचा तुकडा मंद अंधारात.',
        glowStyle:
          'radial-gradient(circle at 50% 34%, rgba(168,180,200,0.14), rgba(14,13,12,0) 64%)',
        arcStroke: 'rgba(196, 189, 176, 0.62)',
        dotFill: 'rgba(154, 146, 133, 0.25)',
        dotGlow: false,
      };
    }
    if (selectedActIdx === 1) {
      return {
        label: 'अंक दुसरा · खालचा बिंदू उजळतो',
        caption: 'मंचावर शोध सुरू होताच प्रश्नचिन्हाचा बिंदू प्रकाशमान.',
        glowStyle:
          'radial-gradient(circle at 50% 72%, rgba(201,164,92,0.22), rgba(14,13,12,0) 62%)',
        arcStroke: 'rgba(201, 164, 92, 0.68)',
        dotFill: '#DEC07C',
        dotGlow: true,
      };
    }
    return {
      label: 'अंक तिसरा · पूर्ण आणि उबदार प्रकाश',
      caption: 'स्वतःचं उत्तर सापडताच संपूर्ण ? उबदार प्रकाशात उजळतं.',
      glowStyle:
        'radial-gradient(circle at 50% 48%, rgba(222,192,124,0.28), rgba(201,164,92,0.08) 46%, rgba(14,13,12,0) 74%)',
      arcStroke: '#DEC07C',
      dotFill: '#F5E0AC',
      dotGlow: true,
    };
  }, [lightingPreset, selectedActIdx]);

  const handleSelectAct = (idx: number) => {
    setSelectedActIdx(idx);
    setLightingPreset('act');
    const matchingStopIdx = THEATRE_STAGE_STOPS.findIndex((s) => s.actIndex === idx);
    if (matchingStopIdx >= 0) {
      setStageStopIdx(matchingStopIdx);
    }
    const next = new URLSearchParams(searchParams);
    next.set('act', String(idx + 1));
    setSearchParams(next);
  };

  const handleRotateStage = (idx: number) => {
    setStageStopIdx(idx);
    const stop = THEATRE_STAGE_STOPS[idx];
    if (stop && stop.actIndex !== selectedActIdx) {
      setSelectedActIdx(stop.actIndex);
    }
  };

  const visibleScriptLines = rehearsalCueMode
    ? activeExcerpt.lines.slice(0, cueStep)
    : activeExcerpt.lines;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ScrollProgressHairline />

      {/* 1. Stage Hero */}
      <header className="grid gap-10 border-b border-[#2B2823] pb-12 lg:grid-cols-12 lg:items-center">
        <div className="min-w-0 lg:col-span-7">
          <p className="text-xs font-medium text-[#C9A45C]">
            मराठी नाट्यसंहिता · तीन अंकी प्रयोग
          </p>
          <h1 className="devanagari-verse mt-3 font-literary text-4xl font-medium text-[#EFEAE0] headline-balance sm:text-5xl">
            {THEATRE_PLAY_META.title}
          </h1>
          <p className="devanagari-verse mt-2 text-lg text-[#DEC07C]">
            {THEATRE_PLAY_META.subtitle}
          </p>

          <ProtectedReadingSurface className="mt-5 max-w-2xl">
            <p className="devanagari-verse editorial-justify text-sm leading-relaxed text-[#C4BDB0] sm:text-base">
              {THEATRE_PLAY_META.stageArchitecture}
            </p>
          </ProtectedReadingSurface>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#9A9285]">
            <span>{THEATRE_PLAY_META.authorCredit}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">३ अंक · २८ प्रवेश · ४६ पृष्ठे</span>
            <span aria-hidden="true">·</span>
            <span>{THEATRE_PLAY_META.approximateRuntime}</span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to={`/read/${THEATRE_PLAY_META.bookSlug}`}
              className="inline-flex h-11 items-center gap-2 rounded bg-[#C9A45C] px-5 text-xs font-semibold text-[#0C0B0A] transition-colors hover:bg-[#DEC07C] whitespace-nowrap shrink-0"
            >
              <BookOpen className="h-4 w-4" />
              <span>Read Full Script (46p)</span>
            </Link>
            <Link
              to={`/books/${THEATRE_PLAY_META.bookSlug}`}
              className="inline-flex h-11 items-center gap-2 rounded border border-[#2B2823] bg-[#141311] px-5 text-xs text-[#EFEAE0] hover:border-[#C9A45C] whitespace-nowrap shrink-0"
            >
              <span>Publication Dossier</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid min-w-0 items-end gap-4 sm:grid-cols-2 lg:col-span-5">
          <div className="collector-folio-plate folio-frame overflow-hidden rounded-md border border-[#2B2823] bg-[#141311]">
            <ParallaxArtworkFrame
              src={ARTWORKS.theatreStage.src}
              alt={ARTWORKS.theatreStage.alt}
              fallbackTitle={ARTWORKS.theatreStage.fallbackTitle}
              fallbackSubtitle={ARTWORKS.theatreStage.fallbackSubtitle}
              className="aspect-[3/4]"
            />
          </div>
          <div className="mx-auto w-44 sm:w-full">
            {playBook ? (
              <Link to={`/read/${playBook.slug}`} className="block">
                <BookCoverPreview book={playBook} />
              </Link>
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-md border border-[#2B2823] bg-[#141311] p-6 text-center">
                <span className="font-literary text-6xl text-[#C9A45C]">?</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Interactive Revolving Stage & Director's Lighting Deck */}
      <section className="mt-12 border-b border-[#2B2823] pb-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#C9A45C]">
              Interactive Stagecraft Console · गोल फिरता मंच
            </p>
            <h2 className="mt-1.5 font-literary text-3xl font-medium text-[#EFEAE0]">
              Revolving Stage, Lighting &amp; Sound Cues
            </h2>
            <p className="editorial-justify mt-1.5 max-w-2xl text-xs leading-relaxed text-[#9A9285] sm:text-sm">
              Rotate the bare circular stage across all five dramatic settings of the play, test the Director&apos;s lighting cues, or trigger live acoustic stage cues.
            </p>
          </div>

          {/* Live Stage Audio Cues */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setActiveSoundCue((c) => (c === 'clock' ? 'none' : 'clock'))
              }
              aria-pressed={activeSoundCue === 'clock'}
              className={`inline-flex h-9 items-center gap-1.5 rounded border px-3 text-xs transition-colors whitespace-nowrap ${
                activeSoundCue === 'clock'
                  ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#DEC07C]'
                  : 'border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:border-[#C9A45C]/50'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>रात्री ३:४८ घड्याळ</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveSoundCue((c) => (c === 'drone' ? 'none' : 'drone'))
              }
              aria-pressed={activeSoundCue === 'drone'}
              className={`inline-flex h-9 items-center gap-1.5 rounded border px-3 text-xs transition-colors whitespace-nowrap ${
                activeSoundCue === 'drone'
                  ? 'border-[#C9A45C] bg-[#C9A45C]/15 text-[#DEC07C]'
                  : 'border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:border-[#C9A45C]/50'
              }`}
            >
              <Music2 className="h-3.5 w-3.5" />
              <span>गाभ्यातला सूर</span>
            </button>
            {activeSoundCue !== 'none' && (
              <button
                type="button"
                onClick={() => setActiveSoundCue('none')}
                aria-label="Mute stage audio cue"
                className="inline-flex h-9 items-center gap-1 rounded border border-[#2B2823] bg-[#0C0B0A] px-2.5 text-xs text-[#9A9285] hover:text-[#EFEAE0]"
              >
                <VolumeX className="h-3.5 w-3.5" />
                <span>थांबवा</span>
              </button>
            )}
          </div>
        </div>

        <div
          className="collector-folio-plate folio-frame relative mt-6 grid gap-8 rounded-lg border border-[#2B2823] bg-[#11100E] p-5 transition-all duration-500 sm:p-8 lg:grid-cols-12 lg:items-center"
          style={{ backgroundImage: actAtmosphere.glowStyle }}
        >
          <FolioCornerFiligree />
          {/* Left: Overhead ? + Circular Revolving Stage Turntable */}
          <div className="flex flex-col items-center lg:col-span-5">
            {/* Suspended ? Overhead Rig */}
            <div className="mb-3 flex flex-col items-center">
              <div className="h-4 w-px bg-[#2B2823]" aria-hidden="true" />
              <div className="flex h-14 w-12 items-center justify-center rounded border border-[#2B2823] bg-[#0C0B0A]/90">
                <svg viewBox="0 0 48 64" className="h-10 w-8" fill="none" aria-hidden="true">
                  <path
                    d="M14 21C14 14.5 18.5 10 24 10C29.8 10 34 14.2 34 19.6C34 25 29.8 27.6 26.8 30.2C24.8 31.9 24 33.8 24 37.5"
                    stroke={actAtmosphere.arcStroke}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="24"
                    cy="50"
                    r="3.2"
                    fill={actAtmosphere.dotFill}
                    style={
                      actAtmosphere.dotGlow
                        ? { filter: 'drop-shadow(0 0 6px rgba(222,192,124,0.85))' }
                        : undefined
                    }
                  />
                </svg>
              </div>
            </div>

            {/* Revolving Circular Stage Floor */}
            <div className="relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
              <div
                className="relative h-full w-full rounded-full border border-[#2B2823] bg-[#0B0A09]/95 shadow-[inset_0_0_48px_rgba(0,0,0,0.85)] transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${-activeStageStop.angle}deg)` }}
              >
                {/* Inner concentric stage circle */}
                <div className="absolute inset-8 rounded-full border border-dashed border-[#2B2823]/70" />
                <div className="absolute inset-16 rounded-full border border-[#C9A45C]/15" />

                {THEATRE_STAGE_STOPS.map((stop, idx) => {
                  const rad = ((stop.angle - 90) * Math.PI) / 180;
                  const radiusPct = 37;
                  const leftPct = 50 + radiusPct * Math.cos(rad);
                  const topPct = 50 + radiusPct * Math.sin(rad);
                  const isCurrent = idx === stageStopIdx;

                  return (
                    <button
                      key={stop.id}
                      type="button"
                      onClick={() => handleRotateStage(idx)}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        transform: `translate(-50%, -50%) rotate(${activeStageStop.angle}deg)`,
                      }}
                      title={stop.label}
                      className={`absolute flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-all duration-300 ${
                        isCurrent
                          ? 'border-[#DEC07C] bg-[#C9A45C] text-[#0C0B0A] shadow-[0_0_18px_rgba(201,164,92,0.5)]'
                          : 'border-[#2B2823] bg-[#161411] text-[#C4BDB0] hover:border-[#C9A45C]/60 hover:text-[#DEC07C]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Center Pivot & Audience Front Indicator */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <Compass className="h-4 w-4 text-[#C9A45C]/70" />
                <span className="devanagari-verse mt-1 text-[10px] text-[#9A9285]">
                  गोल फिरता मंच
                </span>
              </div>
              <span className="pointer-events-none absolute -bottom-6 text-[10px] tracking-widest text-[#9A9285]">
                ▲ प्रेक्षागृह (Audience)
              </span>
            </div>

            {/* Stage Lighting Presets */}
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setLightingPreset('act')}
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${
                  lightingPreset === 'act'
                    ? 'border-[#C9A45C] bg-[#1C1A17] text-[#DEC07C]'
                    : 'border-[#2B2823] bg-[#0C0B0A] text-[#9A9285] hover:text-[#EFEAE0]'
                }`}
              >
                <LampCeiling className="h-3.5 w-3.5" />
                <span>अंकाचा प्रकाश</span>
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset('blue-poem')}
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${
                  lightingPreset === 'blue-poem'
                    ? 'border-[#7EA8E8] bg-[#141A24] text-[#B6D0FA]'
                    : 'border-[#2B2823] bg-[#0C0B0A] text-[#9A9285] hover:text-[#EFEAE0]'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>आईचा निळा किरण</span>
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset('blackout')}
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${
                  lightingPreset === 'blackout'
                    ? 'border-[#C9A45C]/60 bg-[#070706] text-[#EFEAE0]'
                    : 'border-[#2B2823] bg-[#0C0B0A] text-[#9A9285] hover:text-[#EFEAE0]'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>अंधार विराम</span>
              </button>
            </div>
          </div>

          {/* Right: Active Stage Setting Prompt Sheet */}
          <div className="min-w-0 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B2823] pb-3">
              <p className="devanagari-verse text-xs font-medium text-[#C9A45C]">
                {actAtmosphere.label}
              </p>
              <button
                type="button"
                onClick={() =>
                  handleRotateStage((stageStopIdx + 1) % THEATRE_STAGE_STOPS.length)
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#DEC07C] hover:underline"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>मंच फिरवा ({stageStopIdx + 1}/{THEATRE_STAGE_STOPS.length})</span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {THEATRE_STAGE_STOPS.map((stop, idx) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => handleRotateStage(idx)}
                  className={`devanagari-verse rounded border px-2.5 py-1 text-xs transition-colors whitespace-nowrap ${
                    idx === stageStopIdx
                      ? 'border-[#C9A45C] bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                      : 'border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:border-[#C9A45C]/50'
                  }`}
                >
                  {idx + 1}. {stop.label}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-[#2B2823] bg-[#0E0D0B]/90 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="devanagari-verse font-literary text-2xl text-[#EFEAE0]">
                  {activeStageStop.label}
                </h3>
                <span className="text-xs tabular-nums text-[#DEC07C]">
                  {activeStageStop.sceneRef}
                </span>
              </div>

              <p className="devanagari-verse editorial-justify mt-3 text-sm leading-relaxed text-[#C4BDB0]">
                {activeStageStop.atmosphere}
              </p>

              <dl className="mt-5 divide-y divide-[#2B2823] border-t border-[#2B2823] text-xs">
                <div className="grid gap-1 py-2.5 sm:grid-cols-12">
                  <dt className="font-medium text-[#C9A45C] sm:col-span-3">
                    मंचावरील वस्तू
                  </dt>
                  <dd className="devanagari-verse text-[#EFEAE0] sm:col-span-9">
                    {activeStageStop.props.join(' · ')}
                  </dd>
                </div>
                <div className="grid gap-1 py-2.5 sm:grid-cols-12">
                  <dt className="font-medium text-[#C9A45C] sm:col-span-3">
                    प्रकाशयोजना
                  </dt>
                  <dd className="devanagari-verse text-[#C4BDB0] sm:col-span-9">
                    {activeStageStop.lighting}
                  </dd>
                </div>
                <div className="grid gap-1 py-2.5 sm:grid-cols-12">
                  <dt className="font-medium text-[#C9A45C] sm:col-span-3">
                    ध्वनी संकेत
                  </dt>
                  <dd className="devanagari-verse text-[#C4BDB0] sm:col-span-9">
                    {activeStageStop.soundCue}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#2B2823] pt-4">
                <span className="devanagari-verse text-xs italic text-[#9A9285]">
                  {actAtmosphere.caption}
                </span>
                <Link
                  to={`/read/${THEATRE_PLAY_META.bookSlug}?page=${activeStageStop.page}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DEC07C] hover:underline"
                >
                  <span>Open Scene (Page {activeStageStop.page})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three-Act Navigator & 28 Scenes */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#C9A45C]">
              अंक आणि प्रवेश अनुक्रमणिका
            </p>
            <h2 className="mt-2 font-literary text-3xl font-medium text-[#EFEAE0]">
              Three-Act Stage Structure
            </h2>
          </div>
          <Link
            to={`/read/${THEATRE_PLAY_META.bookSlug}?page=${activeAct.actPage}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#DEC07C] hover:underline"
          >
            Jump to {activeAct.actNumber} (Page {activeAct.actPage})
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {THEATRE_ACTS.map((act, idx) => {
            const isSelected = idx === selectedActIdx;
            return (
              <button
                key={act.actNumber}
                type="button"
                onClick={() => handleSelectAct(idx)}
                className={`rounded-md border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-[#C9A45C] bg-[#1C1A17]'
                    : 'border-[#2B2823] bg-[#141311] hover:border-[#C9A45C]/40'
                }`}
              >
                <p className="text-xs text-[#C9A45C]">
                  {act.actNumber} · <span className="tabular-nums">p.{act.actPage}</span>
                </p>
                <h3 className="devanagari-verse mt-1 font-literary text-2xl text-[#EFEAE0]">
                  {act.title}
                </h3>
                <p className="mt-1 text-xs tabular-nums text-[#9A9285]">
                  {act.scenes.length} प्रवेश
                </p>
              </button>
            );
          })}
        </div>

        {/* 2-column Scannable Scene List for Active Act */}
        <div className="mt-6 grid overflow-hidden rounded-md border border-[#2B2823] bg-[#2B2823] gap-px md:grid-cols-2">
          {activeAct.scenes.map((scene) => (
            <Link
              key={scene.sceneNumber}
              to={`/read/${THEATRE_PLAY_META.bookSlug}?page=${scene.page}`}
              className="group flex items-center justify-between gap-4 bg-[#141311] px-5 py-3.5 transition-colors hover:bg-[#1C1A17]"
            >
              <div className="flex min-w-0 items-baseline gap-3">
                <span className="w-20 shrink-0 text-xs font-medium text-[#C9A45C]">
                  {scene.sceneNumber}
                </span>
                <span className="devanagari-verse truncate font-literary text-xl text-[#EFEAE0] group-hover:text-[#DEC07C]">
                  {scene.title}
                </span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-[#9A9285] group-hover:text-[#DEC07C]">
                p.{scene.page} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* Interactive Act-Closing "आवाजाचा प्रश्न" (The Unseen Voice's Silent Question) */}
        <div
          className={`mt-5 rounded-md border p-6 transition-colors duration-300 ${
            silentPauseOpen
              ? 'border-[#C9A45C]/70 bg-[#0A0908]'
              : 'border-[#2B2823] bg-[#100F0D]'
          }`}
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="devanagari-verse text-xs font-medium text-[#C9A45C]">
                {activeActQuestion.actLabel} · आवाजाचा शांत क्षण
              </p>
              <h3 className="devanagari-verse mt-1 font-literary text-2xl text-[#EFEAE0]">
                {activeActQuestion.heading}
              </h3>
              <p className="devanagari-verse mt-1 text-xs italic text-[#9A9285]">
                “{activeActQuestion.instruction}”
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSilentPauseOpen((v) => !v)}
                className={`inline-flex h-10 items-center gap-2 rounded border px-4 text-xs font-medium transition-colors whitespace-nowrap ${
                  silentPauseOpen
                    ? 'border-[#C9A45C] bg-[#C9A45C] text-[#0C0B0A]'
                    : 'border-[#C9A45C]/50 bg-[#141311] text-[#DEC07C] hover:border-[#DEC07C]'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>{silentPauseOpen ? 'प्रसंग लपवा' : 'आवाजाचा प्रश्न ऐका'}</span>
              </button>
              <Link
                to={`/read/${THEATRE_PLAY_META.bookSlug}?page=${activeActQuestion.page}`}
                className="inline-flex h-10 items-center gap-1.5 rounded border border-[#2B2823] bg-[#141311] px-4 text-xs text-[#C4BDB0] hover:border-[#C9A45C] hover:text-[#EFEAE0] whitespace-nowrap"
              >
                <span>Read Page {activeActQuestion.page}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {silentPauseOpen && (
            <div className="mt-5 border-t border-[#2B2823] pt-5">
              <p className="devanagari-verse font-literary text-xl leading-relaxed text-[#DEC07C] sm:text-2xl">
                “{activeActQuestion.promptMarathi}”
              </p>
              <p className="devanagari-verse editorial-justify mt-2 text-xs leading-relaxed text-[#9A9285]">
                रंगमंचावरील दिवे मंद होतात. मंचावर टांगलेले प्रश्नचिन्ह शांतपणे प्रेक्षकांकडे पाहते.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Interactive Rehearsal Promptbook & Verbatim Opening Scenes Reader */}
      <section id="theatre-promptbook" className="mt-14 scroll-mt-24 border-t border-[#2B2823] pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#C9A45C]">
              Verbatim Script Promptbook · प्रयोग संहिता
            </p>
            <h2 className="mt-2 font-literary text-3xl font-medium text-[#EFEAE0]">
              From the Opening Curtain
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {THEATRE_VERBATIM_EXCERPTS.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setSelectedExcerptId(ex.id)}
                className={`rounded border px-3.5 py-2 text-xs transition-colors whitespace-nowrap shrink-0 ${
                  ex.id === activeExcerpt.id
                    ? 'border-[#C9A45C] bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                    : 'border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:border-[#C9A45C]/50'
                }`}
              >
                {ex.heading}
              </button>
            ))}
          </div>
        </div>

        {/* Promptbook Interactive Controls: Focus Mode, Speaker Highlighter, Cue Stepper */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#2B2823] bg-[#100F0D] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Script focus view"
              className="inline-flex items-center rounded border border-[#2B2823] bg-[#0C0B0A] p-0.5 text-xs"
            >
              <button
                type="button"
                onClick={() => setScriptView('dialogue')}
                className={`rounded px-3 py-1.5 transition-colors whitespace-nowrap ${
                  scriptView === 'dialogue'
                    ? 'bg-[#26231E] font-medium text-[#DEC07C]'
                    : 'text-[#9A9285] hover:text-[#EFEAE0]'
                }`}
              >
                Full Script
              </button>
              <button
                type="button"
                onClick={() => setScriptView('spotlight')}
                className={`rounded px-3 py-1.5 transition-colors whitespace-nowrap ${
                  scriptView === 'spotlight'
                    ? 'bg-[#26231E] font-medium text-[#DEC07C]'
                    : 'text-[#9A9285] hover:text-[#EFEAE0]'
                }`}
              >
                Stage Directions Focus
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setRehearsalCueMode((v) => !v);
                setCueStep(1);
              }}
              aria-pressed={rehearsalCueMode}
              className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${
                rehearsalCueMode
                  ? 'border-[#C9A45C] bg-[#C9A45C]/15 font-medium text-[#DEC07C]'
                  : 'border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:border-[#C9A45C]/50'
              }`}
            >
              <Play className="h-3 w-3" />
              <span>{rehearsalCueMode ? 'Rehearsal Cue Mode On' : 'Cue-by-Cue Rehearsal'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="mr-1 text-[#9A9285]">पात्र हायलाइट:</span>
            {availableSpeakers.map((spk) => (
              <button
                key={spk}
                type="button"
                onClick={() => setFocusSpeaker(spk)}
                className={`rounded px-2.5 py-1 transition-colors whitespace-nowrap ${
                  focusSpeaker === spk
                    ? 'bg-[#C9A45C] font-semibold text-[#0C0B0A]'
                    : 'border border-[#2B2823] bg-[#141311] text-[#C4BDB0] hover:text-[#EFEAE0]'
                }`}
              >
                {spk === 'all' ? 'सर्व संवाद' : spk}
              </button>
            ))}
          </div>
        </div>

        <ProtectedReadingSurface showWatermark enableFocusVeil className="mt-4">
          <article
            className="collector-folio-plate folio-frame relative rounded-md border border-[#2B2823] bg-[#141311] p-6 transition-colors sm:p-10"
            style={{ backgroundImage: actAtmosphere.glowStyle }}
          >
            <FolioCornerFiligree />
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2823] pb-4">
              <h3 className="devanagari-verse font-literary text-2xl text-[#DEC07C]">
                {activeExcerpt.heading}
              </h3>
              <Link
                to={`/read/${THEATRE_PLAY_META.bookSlug}?page=${activeExcerpt.page}`}
                className="text-xs font-medium tabular-nums text-[#C9A45C] hover:underline"
              >
                Open Page {activeExcerpt.page} in Reader →
              </Link>
            </div>

            <div className="devanagari-verse mt-6 space-y-4 text-base leading-relaxed">
              {visibleScriptLines.map((line, i) => {
                const isSpeakerMuted =
                  focusSpeaker !== 'all' &&
                  (line.type === 'stage' || line.speaker !== focusSpeaker);

                if (line.type === 'stage') {
                  return (
                    <p
                      key={i}
                      className={`italic transition-opacity duration-200 ${
                        isSpeakerMuted
                          ? 'text-[#9A9285]/40'
                          : scriptView === 'spotlight'
                            ? 'text-[#DEC07C]'
                            : 'text-[#9A9285]'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                }

                return (
                  <p
                    key={i}
                    className={`transition-opacity duration-200 ${
                      isSpeakerMuted
                        ? 'text-[#EFEAE0]/30'
                        : scriptView === 'spotlight'
                          ? 'text-[#EFEAE0]/50'
                          : 'text-[#EFEAE0]'
                    }`}
                  >
                    <span className="font-semibold text-[#DEC07C]">
                      {line.speaker}:
                    </span>{' '}
                    {line.cue && (
                      <span
                        className={`italic ${
                          scriptView === 'spotlight'
                            ? 'text-[#DEC07C]'
                            : 'text-[#9A9285]'
                        }`}
                      >
                        {line.cue}{' '}
                      </span>
                    )}
                    <span>{line.text}</span>
                  </p>
                );
              })}
            </div>

            {rehearsalCueMode && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#2B2823] pt-4 text-xs">
                <span className="tabular-nums text-[#9A9285]">
                  Cue {cueStep} of {activeExcerpt.lines.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCueStep(1)}
                    className="rounded border border-[#2B2823] bg-[#0C0B0A] px-3 py-1.5 text-[#C4BDB0] hover:border-[#C9A45C]"
                  >
                    सुरुवातीपासून
                  </button>
                  {cueStep < activeExcerpt.lines.length ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCueStep((c) => Math.min(activeExcerpt.lines.length, c + 1))
                      }
                      className="rounded bg-[#C9A45C] px-4 py-1.5 font-semibold text-[#0C0B0A] hover:bg-[#DEC07C]"
                    >
                      पुढील संवाद / Cue →
                    </button>
                  ) : (
                    <span className="text-[#DEC07C]">प्रवेश पूर्ण झाला</span>
                  )}
                </div>
              </div>
            )}

            {sceneMarginNotes.length > 0 && (
              <MarginNotesDrawer
                notes={sceneMarginNotes}
                headingLabel="Between the Lines · Stage & Subtext Notes"
              />
            )}
            <ManuscriptDivider className="mt-7 mb-4" />
            <div className="flex justify-end">
              <CollectorFoilSeal compact />
            </div>
          </article>
        </ProtectedReadingSurface>
      </section>

      {/* 5. Cast & Stage Craft Grid */}
      <ProtectedReadingSurface className="mt-14 border-t border-[#2B2823] pt-12">
        <section className="grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <div className="flex items-center gap-2 text-xs font-medium text-[#C9A45C]">
              <Users className="h-3.5 w-3.5" />
              <span>पात्रे (Cast List)</span>
            </div>
            <h2 className="mt-2 font-literary text-3xl font-medium text-[#EFEAE0]">
              Characters on Stage
            </h2>
            <dl className="mt-6 divide-y divide-[#2B2823] rounded-md border border-[#2B2823] bg-[#141311] px-5">
              {THEATRE_CAST.map((member) => {
                const matchSpeaker = availableSpeakers.find(
                  (s) => s !== 'all' && member.name.includes(s.split(' ')[0])
                );
                return (
                  <div key={member.name} className="py-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <dt className="devanagari-verse font-literary text-lg text-[#DEC07C]">
                        {member.name}
                      </dt>
                      <div className="flex items-center gap-3">
                        {CAST_FOCUS_MOTIFS[member.name] && (
                          <span className="devanagari-verse text-[11px] text-[#C9A45C]">
                            {CAST_FOCUS_MOTIFS[member.name]}
                          </span>
                        )}
                        {matchSpeaker && (
                          <button
                            type="button"
                            onClick={() => {
                              setFocusSpeaker(matchSpeaker);
                              document
                                .getElementById('theatre-promptbook')
                                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className="text-[11px] text-[#DEC07C] hover:underline"
                          >
                            Highlight Lines →
                          </button>
                        )}
                      </div>
                    </div>
                    <dd className="devanagari-verse editorial-justify mt-0.5 text-sm text-[#C4BDB0]">
                      {member.role}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {/* Connected Mother's Notebook Verses */}
            <div className="mt-6 rounded-md border border-[#2B2823] bg-[#141311] p-5">
              <p className="text-xs font-medium text-[#C9A45C]">
                निळा प्रकाशकिरण · आईच्या वहीतून कविता
              </p>
              <p className="mt-1 text-xs text-[#9A9285]">
                Read the stage poems sung beneath the blue spotlight directly in the Poetry Room:
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                {[
                  { slug: 'padraat-baandhle', title: 'पदरात बांधले' },
                  { slug: 'rikaama-ghar', title: 'रिकामं घर' },
                  { slug: 'postman', title: 'पोस्टमन' },
                  { slug: 'nila-pen', title: 'निळं पेन' },
                  { slug: 'bhaakri-aani-kavita', title: 'भाकरी आणि कविता' },
                ].map((poemLink) => (
                  <Link
                    key={poemLink.slug}
                    to={`/poetry/${poemLink.slug}`}
                    className="devanagari-verse text-[#DEC07C] hover:underline"
                  >
                    {poemLink.title} →
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-8 lg:col-span-6">
            <div>
              <p className="text-xs font-medium text-[#C9A45C]">
                नाटकाची रचना
              </p>
              <h2 className="mt-2 font-literary text-3xl font-medium text-[#EFEAE0]">
                Stage Design &amp; Audience Question
              </h2>
              <div className="editorial-justify mt-5 space-y-4 rounded-md border border-[#2B2823] bg-[#141311] p-6 text-sm leading-relaxed text-[#C4BDB0]">
                <p className="devanagari-verse">{THEATRE_PLAY_META.setDesign}</p>
                <p className="devanagari-verse">
                  {THEATRE_PLAY_META.audienceQuestionDesign}
                </p>
                <p className="devanagari-verse border-t border-[#2B2823] pt-3 text-[#DEC07C]">
                  {THEATRE_PLAY_META.musicNote}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#C9A45C]">
                दिग्दर्शकासाठी सूचना (Page 46)
              </p>
              <ol className="mt-4 space-y-3 rounded-md border border-[#2B2823] bg-[#141311] p-6">
                {DIRECTOR_NOTES.map((note, idx) => (
                  <li
                    key={idx}
                    className="devanagari-verse flex gap-3 text-sm leading-relaxed text-[#C4BDB0]"
                  >
                    <span className="shrink-0 font-literary text-base tabular-nums text-[#C9A45C]">
                      {idx + 1}.
                    </span>
                    <span className="editorial-justify">{note}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </ProtectedReadingSurface>
    </div>
  );
}
