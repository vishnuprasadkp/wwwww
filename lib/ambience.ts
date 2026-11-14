"use client";

/*
 * The sound of Nyrro's film: soft, calm music with little beetles in it, made live in the browser (nothing to download).
 *
 * No drones and no wind: only gentle, slow sounds. Warm chords that breathe in and out, a few soft notes now and then
 * (all from one five-note scale, so nothing ever clashes), and the beetles: small beetles' tiny chirps about the place,
 * and the film's beetle itself, which sings a little phrase, in tune, as it comes into view or peeps in at you.
 *
 * It comes in several moods (see MOODS). It starts as the film opens (the click that opens it lets the browser play
 * sound) and fades away as it closes. The sound button turns it off and on; off is remembered.
 */

export const MOODS = {
  garden: { name: "Morning garden", note: "Warm chords, soft kalimba notes, a far-off bird, beetles chirping" },
  musicbox: { name: "Music box", note: "A slow, gentle music box, a whisper of chords, beetles chirping softly" },
  night: { name: "Night meadow", note: "Deep, slow chords, a soft bell now and then, crickets far away, beetles chirping" },
  air: { name: "Just air", note: "Only warm, breathing chords and the beetles: no melody at all" },
} as const;
export type Mood = keyof typeof MOODS;
export const DEFAULT_MOOD: Mood = "garden";

const KEY = "nyrro-sound";
const LEVEL = 1.6;

type Listener = (on: boolean) => void;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const hz = (semis: number, base = 293.66) => base * Math.pow(2, semis / 12); // from D

// D major pentatonic (D E F# A B): any two of these sound well together
const PENTA = [0, 2, 4, 7, 9];
const scale = (from: number, to: number) => {
  const out: number[] = [];
  for (let o = -24; o <= 24; o += 12) for (const s of PENTA) if (o + s >= from && o + s <= to) out.push(o + s);
  return out;
};
// slow chords under it all: Dmaj9, Bm7, Gmaj7, A(sus2), in semitones from D4
const CHORDS = [
  [-12, -5, 4, 9],
  [-15, -8, -3, 2],
  [-19, -12, -5, 2],
  [-17, -10, -5, 4],
];

class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null; // everything, into the master
  private wet: GainNode | null = null; // into the reverb
  private timers: number[] = [];
  private stopT = 0;
  private playing = false;
  private listeners = new Set<Listener>();
  private pad: { stop: (at: number) => void }[] = [];
  private chordIx = 0;
  muted = false;
  mood: Mood = DEFAULT_MOOD;

  constructor() {
    if (typeof window === "undefined") return;
    try {
      this.muted = window.localStorage.getItem(KEY) === "off";
    } catch {
      /* no storage: on by default */
    }
  }

  get on() {
    return !this.muted;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.on);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /** Begins (or carries on) playing, fading in. Call it from a click, so the browser lets it sound. */
  start() {
    if (typeof window === "undefined") return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) {
      try {
        this.ctx = new AC();
      } catch {
        return;
      }
      this.build();
    }
    window.clearTimeout(this.stopT);
    void this.ctx.resume().catch(() => {});
    if (!this.playing) {
      this.playing = true;
      this.schedule();
    }
    this.fade(this.muted ? 0 : LEVEL, 2.5);
  }

  /** Fades away and goes quiet. */
  stop() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    this.fade(0, 0.9);
    this.clearTimers();
    window.clearTimeout(this.stopT);
    this.stopT = window.setTimeout(() => {
      this.endPad(0);
      void this.ctx?.suspend().catch(() => {});
    }, 1600);
  }

  /** Another mood, at once (crossfading). */
  setMood(m: Mood) {
    if (m === this.mood) return;
    this.mood = m;
    if (!this.ctx || !this.playing) return;
    this.clearTimers();
    this.endPad(1.5);
    this.schedule();
  }

  /** If the browser held it back (no click yet), the next touch or key lets it play. */
  resumeOnGesture() {
    if (!this.ctx || this.ctx.state === "running") return () => {};
    const go = () => {
      if (this.playing) void this.ctx?.resume().catch(() => {});
      off();
    };
    const off = () => {
      window.removeEventListener("pointerdown", go, true);
      window.removeEventListener("keydown", go, true);
    };
    window.addEventListener("pointerdown", go, true);
    window.addEventListener("keydown", go, true);
    return off;
  }

  setOn(on: boolean) {
    this.muted = !on;
    try {
      window.localStorage.setItem(KEY, on ? "on" : "off");
    } catch {
      /* not remembered */
    }
    if (on && this.playing) void this.ctx?.resume().catch(() => {});
    if (this.playing) this.fade(on ? LEVEL : 0, on ? 1.2 : 0.5);
    this.listeners.forEach((fn) => fn(this.on));
  }

  /** The film's beetle speaks: a little sung phrase of two to five tiny syllables, in tune with the music, from where it
   *  is (-1 left .. 1 right). Returns when each syllable starts and how long it lasts (seconds from now), so the beetle
   *  can move its mouth and antennae with it; nothing (and no sound) while the sound is off. */
  speak(x: number): [number, number][] {
    if (!this.ctx || !this.playing || this.muted || this.ctx.state !== "running") return [];
    const ctx = this.ctx;
    const pan = Math.max(-0.75, Math.min(0.75, x * 0.6));
    const o2 = this.out(pan, 0.35, 0.05);
    const notes = scale(19, 31); // high in the same scale as the music (about 880 to 1760 Hz)
    const n = 2 + Math.floor(Math.random() * 4);
    let i = Math.floor(Math.random() * notes.length);
    let at = 0.04;
    const syl: [number, number][] = [];
    // a phrase rises or falls a little, like a question or an answer
    const dir = Math.random() < 0.5 ? 1 : -1;
    for (let k = 0; k < n; k++) {
      const d = k === n - 1 ? rnd(0.12, 0.2) : rnd(0.06, 0.11);
      const f = hz(notes[i]);
      const t = ctx.currentTime + at;
      const o = ctx.createOscillator();
      o.type = "sine";
      // each syllable slides into its note, with a tiny lilt
      o.frequency.setValueAtTime(f * (dir > 0 ? 0.92 : 1.08), t);
      o.frequency.exponentialRampToValueAtTime(f, t + d * 0.45);
      o.frequency.setTargetAtTime(f * (k === n - 1 ? (dir > 0 ? 1.06 : 0.94) : 1), t + d * 0.6, d * 0.3);
      const o3 = ctx.createOscillator(); // a soft second voice an octave up, for a little sparkle
      o3.type = "sine";
      o3.frequency.setValueAtTime(f * 2, t);
      const g3 = ctx.createGain();
      g3.gain.value = 0.12;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.018);
      g.gain.setTargetAtTime(0.6, t + 0.02, d * 0.4);
      g.gain.linearRampToValueAtTime(0, t + d);
      o.connect(g);
      o3.connect(g3).connect(g);
      g.connect(o2);
      o.start(t);
      o3.start(t);
      o.stop(t + d + 0.03);
      o3.stop(t + d + 0.03);
      syl.push([at, d]);
      at += d + rnd(0.035, 0.08);
      i = Math.max(0, Math.min(notes.length - 1, i + dir * pick([0, 1, 1, 2]) * (Math.random() < 0.25 ? -1 : 1)));
    }
    return syl;
  }

  private clearTimers() {
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers = [];
  }

  private fade(to: number, secs: number) {
    if (!this.ctx || !this.master) return;
    const g = this.master.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(to, t + secs);
  }

  private later(fn: () => void, secs: number) {
    const id = window.setTimeout(() => {
      this.timers = this.timers.filter((x) => x !== id);
      if (this.playing) fn();
    }, secs * 1000);
    this.timers.push(id);
  }

  private build() {
    const ctx = this.ctx!;
    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 2.5;
    comp.attack.value = 0.05;
    master.connect(comp).connect(ctx.destination);
    this.master = master;
    const bus = ctx.createGain();
    bus.connect(master);
    this.bus = bus;

    // a soft room: a warm reverb, its brightness taken off
    const verb = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 3.2);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    }
    verb.buffer = ir;
    const dark = ctx.createBiquadFilter();
    dark.type = "lowpass";
    dark.frequency.value = 3200;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    wet.connect(verb).connect(dark).connect(master);
    this.wet = wet;

  }

  // a sound's way out: some of it straight, some into the room, from one side or the other
  private out(pan: number, wetMix: number, level: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = level;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    g.connect(p);
    const dry = ctx.createGain();
    dry.gain.value = 1 - wetMix * 0.5;
    p.connect(dry).connect(this.bus!);
    const w = ctx.createGain();
    w.gain.value = wetMix;
    p.connect(w).connect(this.wet!);
    return g;
  }

  private schedule() {
    const m = this.mood;
    // the chords
    const padLevel = m === "air" ? 0.05 : m === "night" ? 0.045 : m === "musicbox" ? 0.018 : 0.034;
    const padOct = m === "night" ? -12 : 0;
    const chord = () => {
      this.playChord(CHORDS[this.chordIx % CHORDS.length].map((s) => s + padOct), padLevel, m === "night" ? 700 : 1100);
      this.chordIx++;
      this.later(chord, m === "air" ? rnd(9, 12) : rnd(7.5, 10));
    };
    chord();
    // the notes
    if (m === "garden") this.later(() => this.melody("kalimba", scale(0, 16), [1.6, 4.2], 0.06), 2);
    if (m === "musicbox") this.later(() => this.melody("box", scale(7, 26), [0.9, 2.2], 0.045), 1.2);
    if (m === "night") this.later(() => this.melody("bell", scale(-5, 9), [5, 11], 0.04), 4);
    // the beetles
    this.later(() => this.beetles(), rnd(2, 4));
    // far-off life
    if (m === "garden") this.later(() => this.bird(), rnd(6, 10));
    if (m === "night") this.later(() => this.crickets(), 1);
  }

  private endPad(secs: number) {
    if (!this.ctx) return;
    const at = this.ctx.currentTime + secs;
    this.pad.forEach((v) => v.stop(at));
    this.pad = [];
  }

  // a chord that swells in slowly, holds, and gives way to the next
  private playChord(semis: number[], level: number, bright: number) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    this.endPad(4);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = bright;
    lp.Q.value = 0.3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + 3.5);
    lp.connect(g);
    g.connect(this.out(0, 0.5, 1));
    const oscs: OscillatorNode[] = [];
    semis.forEach((s, i) => {
      const f = hz(s);
      for (const det of [-3, 3]) {
        const o = ctx.createOscillator();
        o.type = i === 0 ? "sine" : "triangle";
        o.frequency.value = f;
        o.detune.value = det + rnd(-1.5, 1.5);
        const og = ctx.createGain();
        og.gain.value = (i === 0 ? 0.9 : 0.45) / semis.length;
        o.connect(og).connect(lp);
        o.start(t);
        oscs.push(o);
      }
    });
    this.pad.push({
      stop: (at: number) => {
        const now = ctx.currentTime;
        g.gain.cancelScheduledValues(now);
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, Math.max(at, now + 0.05));
        oscs.forEach((o) => o.stop(Math.max(at, now + 0.05) + 0.1));
      },
    });
  }

  // one soft note: a kalimba's round pluck, a music box's tine, or a far bell
  private note(kind: "kalimba" | "box" | "bell", semis: number, level: number, pan: number, when = 0) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.03 + when;
    const f = hz(semis);
    const partials: [number, number, number][] =
      kind === "kalimba"
        ? [
            [1, 1, 2.6],
            [2.01, 0.12, 0.7],
            [5.4, 0.03, 0.25],
          ]
        : kind === "box"
          ? [
              [1, 1, 2.2],
              [4, 0.14, 0.6],
              [6.95, 0.04, 0.3],
            ]
          : [
              [1, 1, 5.5],
              [2.76, 0.18, 2.2],
              [5.4, 0.05, 1],
            ];
    const o2 = this.out(pan, kind === "bell" ? 0.75 : 0.55, level);
    for (const [mul, amp, dec] of partials) {
      const o = ctx.createOscillator();
      o.frequency.value = f * mul;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp, t + (kind === "bell" ? 0.02 : 0.008));
      g.gain.exponentialRampToValueAtTime(0.0005, t + dec);
      o.connect(g).connect(o2);
      o.start(t);
      o.stop(t + dec + 0.05);
    }
  }

  // notes now and then, wandering gently through the scale: a single note, or a little phrase of two to four
  private melody(kind: "kalimba" | "box" | "bell", notes: number[], gap: [number, number], level: number) {
    let i = Math.floor(notes.length / 2);
    const step = () => {
      const phrase = kind === "bell" ? 1 : Math.random() < 0.55 ? 1 : 2 + Math.floor(Math.random() * 3);
      let when = 0;
      for (let k = 0; k < phrase; k++) {
        i = Math.max(0, Math.min(notes.length - 1, i + pick([-2, -1, -1, 1, 1, 2])));
        this.note(kind, notes[i], level * rnd(0.7, 1), rnd(-0.45, 0.45), when);
        when += kind === "box" ? rnd(0.35, 0.55) : rnd(0.25, 0.45);
      }
      this.later(step, when + rnd(gap[0], gap[1]));
    };
    step();
  }

  // small beetles about the place: now and then a few tiny chirps, near or far
  private beetles() {
    this.chirps(rnd(-0.7, 0.7));
    this.later(() => this.beetles(), rnd(4, 9));
  }

  // a beetle's little voice: two to four tiny, high, soft chirps
  private chirps(pan: number) {
    const ctx = this.ctx!;
    const n = 2 + Math.floor(Math.random() * 3);
    const f = rnd(3800, 5200);
    const o2 = this.out(pan, 0.45, 0.02);
    for (let i = 0; i < n; i++) {
      const t = ctx.currentTime + 0.03 + i * rnd(0.09, 0.13);
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(f, t);
      o.frequency.linearRampToValueAtTime(f * 1.06, t + 0.035);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      o.connect(g).connect(o2);
      o.start(t);
      o.stop(t + 0.06);
    }
  }

  // a bird far off: a short, soft call, now and then
  private bird() {
    const ctx = this.ctx!;
    const o2 = this.out(rnd(-0.8, 0.8), 0.7, rnd(0.006, 0.01));
    const base = rnd(2400, 3400);
    const n = 2 + Math.floor(Math.random() * 3);
    let t = ctx.currentTime + 0.05;
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const d = rnd(0.08, 0.15);
      const f0 = base * rnd(0.9, 1.15);
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f0 * (Math.random() < 0.5 ? 1.2 : 0.85), t + d);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g).connect(o2);
      o.start(t);
      o.stop(t + d + 0.02);
      t += d + rnd(0.05, 0.12);
    }
    this.later(() => this.bird(), rnd(12, 24));
  }

  // crickets far away in the night, softly, one each side
  private crickets() {
    const ctx = this.ctx!;
    for (const [pan, freq] of [
      [-0.6, 4500],
      [0.6, 4800],
    ]) {
      const o2 = this.out(pan, 0.6, 0.004);
      const chirp = () => {
        const t0 = ctx.currentTime + 0.05;
        const o = ctx.createOscillator();
        o.frequency.value = freq + rnd(-30, 30);
        const g = ctx.createGain();
        g.gain.value = 0;
        for (let i = 0; i < 3; i++) {
          const t = t0 + i * 0.04;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(1, t + 0.008);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        }
        o.connect(g).connect(o2);
        o.start(t0);
        o.stop(t0 + 0.2);
        this.later(chirp, Math.random() < 0.3 ? rnd(3, 7) : rnd(0.9, 1.4));
      };
      this.later(chirp, rnd(0.2, 1.5));
    }
  }
}

let one: Ambience | null = null;
/** The one sound of the film, shared by the hero's film and the Nyrro page. */
export const ambience = () => (one ??= new Ambience());
