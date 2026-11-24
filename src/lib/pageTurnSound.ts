let sharedAudioCtx: AudioContext | null = null;

/**
 * Synthesizes a quiet, brief paper-brush rustle when the user explicitly
 * enables optional page-turn sound in the Reading Room. Never autoplays.
 */
export function playSubtlePageTurnSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }

    const duration = 0.11;
    const sampleRate = sharedAudioCtx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = sharedAudioCtx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      const env = Math.sin((i / length) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.25;
    }

    const source = sharedAudioCtx.createBufferSource();
    source.buffer = buffer;

    const filter = sharedAudioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1450;
    filter.Q.value = 0.85;

    const gain = sharedAudioCtx.createGain();
    gain.gain.setValueAtTime(0.065, sharedAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      sharedAudioCtx.currentTime + duration
    );

    source.connect(filter);
    filter.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    source.start();
  } catch {
    // Ignore audio context restrictions gracefully
  }
}
