import { readSoundEnabled } from "../utils/soundPreference";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bufferCache: { sr: number; buffers: SoundBuffers } | null = null;

/** True after AudioContext has been running at least once (user unlocked audio). */
let contextHasRun = false;

type SoundBuffers = {
  move: AudioBuffer;
  rotate: AudioBuffer;
  hardDrop: AudioBuffer;
  lineHit: AudioBuffer;
  levelUp: AudioBuffer;
  next: AudioBuffer;
  gameOverLow: AudioBuffer;
  winA: AudioBuffer;
  winB: AudioBuffer;
  winC: AudioBuffer;
};

function canOutputSound(): boolean {
  return readSoundEnabled();
}

function getOrCreateContext(): AudioContext | null {
  if (typeof window === "undefined" || !canOutputSound()) return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  return ctx;
}

function getMasterOut(c: AudioContext): GainNode {
  if (!masterGain || masterGain.context !== c) {
    masterGain = c.createGain();
    masterGain.gain.value = 0.92;
    masterGain.connect(c.destination);
  }
  return masterGain;
}

/** Sine blip with smooth attack / release (no oscillators at play time). */
function makeBlip(
  c: AudioContext,
  durationSec: number,
  freqHz: number,
  peak: number,
): AudioBuffer {
  const sr = c.sampleRate;
  const n = Math.max(2, Math.floor(durationSec * sr));
  const buf = c.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  let phase = 0;
  const omega = (2 * Math.PI * freqHz) / sr;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    phase += omega;
    const a = Math.min(1, t / 0.014);
    const r = Math.min(1, (durationSec - t) / 0.045);
    d[i] = Math.sin(phase) * peak * a * r;
  }
  return buf;
}

/** Linear freq sweep (triangle-ish motion). */
function makeSweep(
  c: AudioContext,
  durationSec: number,
  f0: number,
  f1: number,
  peak: number,
): AudioBuffer {
  const sr = c.sampleRate;
  const n = Math.max(2, Math.floor(durationSec * sr));
  const buf = c.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const u = t / durationSec;
    const f = f0 + (f1 - f0) * u;
    phase += (2 * Math.PI * f) / sr;
    const a = Math.min(1, t / 0.016);
    const r = Math.min(1, (durationSec - t) / 0.055);
    d[i] = Math.sin(phase) * peak * a * r;
  }
  return buf;
}

function buildBuffers(c: AudioContext): SoundBuffers {
  return {
    move: makeBlip(c, 0.06, 245, 0.16),
    rotate: makeSweep(c, 0.095, 300, 520, 0.14),
    hardDrop: makeSweep(c, 0.12, 95, 48, 0.18),
    lineHit: makeBlip(c, 0.16, 330, 0.2),
    levelUp: makeBlip(c, 0.14, 520, 0.18),
    next: makeBlip(c, 0.075, 660, 0.15),
    gameOverLow: makeSweep(c, 0.38, 200, 55, 0.16),
    winA: makeBlip(c, 0.12, 392, 0.17),
    winB: makeBlip(c, 0.12, 523, 0.16),
    winC: makeBlip(c, 0.18, 659, 0.17),
  };
}

function getBuffers(c: AudioContext): SoundBuffers {
  if (bufferCache && bufferCache.sr === c.sampleRate) {
    return bufferCache.buffers;
  }
  const buffers = buildBuffers(c);
  bufferCache = { sr: c.sampleRate, buffers };
  return buffers;
}

function playBuffer(
  c: AudioContext,
  buffer: AudioBuffer,
  when: number,
  gainMul: number,
  playbackRate = 1,
): void {
  const src = c.createBufferSource();
  const g = c.createGain();
  src.buffer = buffer;
  src.playbackRate.value = playbackRate;
  const out = getMasterOut(c);
  const dur = buffer.duration / playbackRate;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(gainMul, when + 0.012);
  g.gain.linearRampToValueAtTime(0.0001, when + Math.min(dur, 0.45));
  src.connect(g);
  g.connect(out);
  src.start(when);
  src.stop(when + dur + 0.03);
}

function withRunningContext(fn: (c: AudioContext) => void): void {
  const c = getOrCreateContext();
  if (!c) return;

  const run = () => {
    contextHasRun = true;
    getBuffers(c);
    fn(c);
  };

  if (c.state === "running") {
    run();
    return;
  }

  void c.resume().then(
    () => {
      if (c.state === "running") run();
    },
    () => {
      /* no user gesture yet */
    },
  );
}

export function unlockAudioFromUserGesture(): void {
  withRunningContext(() => {
    /* warm buffers only */
  });
}

/** Short chime when user turns sound on — confirms the pipeline works. */
export function playSoundOnChime(): void {
  if (!canOutputSound()) return;
  withRunningContext((c) => {
    const b = getBuffers(c).next;
    playBuffer(c, b, c.currentTime, 0.28, 1);
  });
}

function effectSoundsAllowed(): boolean {
  return contextHasRun || ctx?.state === "running";
}

export function playMove(): void {
  if (!canOutputSound()) return;
  withRunningContext((c) => {
    playBuffer(c, getBuffers(c).move, c.currentTime, 0.95);
  });
}

export function playRotate(): void {
  if (!canOutputSound()) return;
  withRunningContext((c) => {
    playBuffer(c, getBuffers(c).rotate, c.currentTime, 1);
  });
}

export function playHardDrop(): void {
  if (!canOutputSound()) return;
  withRunningContext((c) => {
    playBuffer(c, getBuffers(c).hardDrop, c.currentTime, 1.05);
  });
}

export function playLineClear(lineCount: number): void {
  if (!canOutputSound() || !effectSoundsAllowed()) return;
  const n = Math.min(4, Math.max(1, lineCount));
  const rate = 1 + (n - 1) * 0.07;
  withRunningContext((c) => {
    const b = getBuffers(c).lineHit;
    const t0 = c.currentTime;
    playBuffer(c, b, t0, 1, rate);
    window.setTimeout(() => {
      if (!canOutputSound()) return;
      withRunningContext((c2) => {
        playBuffer(c2, getBuffers(c2).lineHit, c2.currentTime, 0.75, rate * 1.12);
      });
    }, 88);
  });
}

export function playLevelUp(): void {
  if (!canOutputSound() || !effectSoundsAllowed()) return;
  withRunningContext((c) => {
    const t0 = c.currentTime;
    const buf = getBuffers(c);
    playBuffer(c, buf.levelUp, t0, 1);
    window.setTimeout(() => {
      if (!canOutputSound()) return;
      withRunningContext((c2) => {
        playBuffer(c2, getBuffers(c2).next, c2.currentTime, 0.85, 1.35);
      });
    }, 105);
  });
}

export function playNextPiece(): void {
  if (!canOutputSound() || !effectSoundsAllowed()) return;
  withRunningContext((c) => {
    playBuffer(c, getBuffers(c).next, c.currentTime, 0.9);
  });
}

export function playGameOver(): void {
  if (!canOutputSound() || !effectSoundsAllowed()) return;
  withRunningContext((c) => {
    playBuffer(c, getBuffers(c).gameOverLow, c.currentTime, 1);
  });
}

export function playWin(): void {
  if (!canOutputSound() || !effectSoundsAllowed()) return;
  withRunningContext((c) => {
    const buf = getBuffers(c);
    let t = c.currentTime;
    playBuffer(c, buf.winA, t, 1);
    t += 0.11;
    playBuffer(c, buf.winB, t, 0.95);
    t += 0.12;
    playBuffer(c, buf.winC, t, 1);
  });
}
