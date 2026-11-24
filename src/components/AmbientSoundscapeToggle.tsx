import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export type SoundscapeType = 'rain' | 'wind' | 'ember';

interface AmbientSoundscapeToggleProps {
  compact?: boolean;
}

export function AmbientSoundscapeToggle({ compact = false }: AmbientSoundscapeToggleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDucked, setIsDucked] = useState(false);
  const [activeSound, setActiveSound] = useState<SoundscapeType>('rain');
  const [volume, setVolume] = useState(0.3);
  const [menuOpen, setMenuOpen] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopAudio = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch {
        // Ignored
      }
      noiseSourceRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {
        // Ignored
      }
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const startAudio = async (type: SoundscapeType) => {
    stopAudio();

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Generate 5 seconds of procedural noise buffer
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink/Brownish smoothing
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noiseSourceRef.current = noise;

    const filter = ctx.createBiquadFilter();
    filterRef.current = filter;

    if (type === 'rain') {
      // Lowpass + slight resonance for rain
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
    } else if (type === 'wind') {
      // Bandpass for nocturnal wind
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(2.2, ctx.currentTime);

      // Subtle slow wind swell modulation
      let time = 0;
      timerRef.current = window.setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        time += 0.2;
        const targetFreq = 300 + Math.sin(time) * 120 + Math.cos(time * 0.4) * 60;
        try {
          filter.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.4);
        } catch {
          // Ignored
        }
      }, 200);
    } else {
      // Ember / Hearth crackle
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);
    }

    noise.connect(filter);
    filter.connect(masterGain);

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      noise.start(0);
      setIsPlaying(true);
    } catch {
      stopAudio();
    }
  };

  useEffect(() => {
    const onSongPlay = () => setIsDucked(true);
    const onSongPause = () => setIsDucked(false);
    window.addEventListener('beniyaaz:song-play', onSongPlay);
    window.addEventListener('beniyaaz:song-pause', onSongPause);
    return () => {
      window.removeEventListener('beniyaaz:song-play', onSongPlay);
      window.removeEventListener('beniyaaz:song-pause', onSongPause);
    };
  }, []);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      try {
        const effectiveGain = isDucked ? Math.min(volume, 0.04) * 0.5 : volume;
        masterGainRef.current.gain.setTargetAtTime(
          effectiveGain,
          audioCtxRef.current.currentTime,
          isDucked ? 0.25 : 0.4
        );
      } catch {
        // Ignored
      }
    }
  }, [volume, isDucked]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio(activeSound);
    }
  };

  const handleSelectSound = (type: SoundscapeType) => {
    setActiveSound(type);
    if (isPlaying) {
      startAudio(type);
    }
  };

  const sounds: { id: SoundscapeType; label: string; desc: string }[] = [
    { id: 'rain', label: 'Monsoon Rain', desc: 'Gentle raindrops on library glass' },
    { id: 'wind', label: 'Midnight Wind', desc: 'Soft nocturnal draft through pages' },
    { id: 'ember', label: 'Pages & Ember', desc: 'Low warm hearth glow' },
  ];

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1 rounded border border-[#2B2823] bg-[#141311] p-1">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Mute ambient soundscape' : 'Play ambient reading soundscape'}
          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors ${
            isPlaying
              ? 'bg-[#C9A45C] font-medium text-[#0C0B0A]'
              : 'text-[#9A9285] hover:text-[#EFEAE0]'
          }`}
        >
          {isPlaying ? (
            <Volume2 className="h-3.5 w-3.5" />
          ) : (
            <VolumeX className="h-3.5 w-3.5" />
          )}
          {!compact && (
            <span>
              {isPlaying
                ? isDucked
                  ? 'Ducked for Song'
                  : sounds.find((s) => s.id === activeSound)?.label
                : 'Soundscape'}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Soundscape choices and volume"
          className="rounded px-1.5 py-1 text-[11px] text-[#9A9285] hover:text-[#DEC07C]"
        >
          <Sparkles className="h-3 w-3" />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-md border border-[#2B2823] bg-[#11100E] p-3.5 shadow-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A45C]">
            Reading Ambience (Web Audio)
          </p>
          <div className="mt-2.5 space-y-1.5">
            {sounds.map((sound) => {
              const active = activeSound === sound.id;
              return (
                <button
                  key={sound.id}
                  type="button"
                  onClick={() => handleSelectSound(sound.id)}
                  className={`flex w-full flex-col rounded px-2.5 py-2 text-left transition-colors ${
                    active
                      ? 'border border-[#C9A45C]/40 bg-[#1C1A17] text-[#EFEAE0]'
                      : 'hover:bg-[#181614] text-[#C4BDB0]'
                  }`}
                >
                  <span className="text-xs font-medium">{sound.label}</span>
                  <span className="text-[10px] text-[#9A9285]">{sound.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3.5 border-t border-[#2B2823] pt-3">
            <div className="flex items-center justify-between text-[11px] text-[#9A9285]">
              <span>Volume</span>
              <span className="tabular-nums">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#C9A45C]"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="text-[11px] text-[#DEC07C] hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
