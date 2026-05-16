let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as
        | typeof AudioContext
        | undefined;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(ctx: AudioContext, frequency: number, startAt: number, duration: number, gain = 0.18) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startAt);
  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gainNode.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + startAt + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  osc.connect(gainNode).connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.02);
}

export function playUnlockedSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 660, 0, 0.12);
  playTone(ctx, 880, 0.12, 0.18);
}

export function playRelockedSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(ctx, 520, 0, 0.12);
  playTone(ctx, 330, 0.12, 0.18);
}
