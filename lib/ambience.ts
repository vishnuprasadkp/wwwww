"use client";

/*
 * The sound of Nyrro's film: a calm, quiet place in nature, made live in the browser (nothing to download). Only a breath
 * of air and the faintest stir of leaves; crickets softly, far off; a bird now and then, further still. And beetles: the
 * film's beetle humming where it flies (left or right, nearer as it comes into view, softer once it is gone), small
 * beetles buzzing by from one side to the other, and now and then a beetle's tiny chirr close by in the leaves. All of it
 * in a little space of its own (a soft reverb), so it sounds like somewhere, not a recording.
 *
 * It starts as the film opens (the click that opens it lets the browser play sound) and fades away as it closes. The
 * sound button turns it off and on; off is remembered.
 */

const KEY = "nyrro-sound";
const LEVEL = 0.75;

type Listener = (on: boolean) => void;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wet: GainNode | null = null;
  private hum: { gain: GainNode; pan: StereoPannerNode; osc: OscillatorNode[] } | null = null;
  private timers: number[] = [];
  private stopT = 0;
  private playing = false;
  private listeners = new Set<Listener>();
  muted = false;

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
    this.fade(this.muted ? 0 : LEVEL, 1.6);
  }

  /** Fades away and goes quiet. */
  stop() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    this.fade(0, 0.7);
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers = [];
    window.clearTimeout(this.stopT);
    this.stopT = window.setTimeout(() => void this.ctx?.suspend().catch(() => {}), 1400);
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
    if (this.playing) this.fade(on ? LEVEL : 0, on ? 1 : 0.4);
    this.listeners.forEach((fn) => fn(this.on));
  }

  /** Where the beetle is: across the frame (-1 left .. 1 right), and whether you can see it. */
  beetle(x: number, seen: boolean) {
    if (!this.ctx || !this.hum || !this.playing) return;
    const t = this.ctx.currentTime;
    this.hum.pan.pan.setTargetAtTime(Math.max(-0.85, Math.min(0.85, x * 0.7)), t, 0.25);
    this.hum.gain.gain.setTargetAtTime(seen ? 0.075 : 0.018, t, seen ? 0.6 : 1);
  }

  private fade(to: number, secs: number) {
    if (!this.ctx || !this.master) return;
    const g = this.master.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(to, t + secs);
  }

  private build() {
    const ctx = this.ctx!;
    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    this.master = master;

    // the space it is all in: a soft, short reverb
    const verb = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 2.6);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    wet.connect(verb).connect(master);
    this.wet = wet;

    // noise, the stuff of wind and leaves: brown (deep) and white
    const nlen = ctx.sampleRate * 4;
    const brown = ctx.createBuffer(2, nlen, ctx.sampleRate);
    const white = ctx.createBuffer(2, nlen, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const b = brown.getChannelData(c);
      const w = white.getChannelData(c);
      let last = 0;
      for (let i = 0; i < nlen; i++) {
        const r = Math.random() * 2 - 1;
        w[i] = r;
        last = (last + 0.02 * r) / 1.02;
        b[i] = last * 3.5;
      }
    }
    const loop = (buf: AudioBuffer) => {
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.loop = true;
      s.loopStart = 0;
      s.start(0, Math.random() * 3);
      return s;
    };
    const lfo = (freq: number, depth: number, target: AudioParam) => {
      const o = ctx.createOscillator();
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = depth;
      o.connect(g).connect(target);
      o.start();
    };

    // wind: deep and slow, swelling and easing
    {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 240;
      const g = ctx.createGain();
      g.gain.value = 0.03; // only a breath of air, far off
      loop(brown).connect(lp).connect(g);
      g.connect(master);
      g.connect(wet);
      lfo(0.035, 0.012, g.gain);
      lfo(0.05, 50, lp.frequency);
    }
    // the leaves: a high, airy rustle that comes and goes in gusts
    {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2400;
      bp.Q.value = 0.8;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1000;
      const g = ctx.createGain();
      g.gain.value = 0.002;
      loop(white).connect(bp).connect(hp).connect(g);
      g.connect(master);
      g.connect(wet);
      const gust = () => {
        if (!this.playing) return;
        const t = ctx.currentTime;
        g.gain.setTargetAtTime(rnd(0.0008, 0.004), t, rnd(1.5, 3));
        bp.frequency.setTargetAtTime(rnd(1800, 2800), t, 2);
        this.later(gust, rnd(3, 6));
      };
      this.gusts = gust;
    }
    // the beetle's wings: a low, warm hum, two voices a breath apart, with the flutter of its wingbeat
    {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1500;
      lp.Q.value = 0.6;
      const flutter = ctx.createGain();
      flutter.gain.value = 0.7;
      lfo(28, 0.3, flutter.gain);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      const pan = ctx.createStereoPanner();
      const osc = [196, 197.6, 393].map((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 2 ? "triangle" : "sawtooth";
        o.frequency.value = f;
        const og = ctx.createGain();
        og.gain.value = i === 2 ? 0.35 : 0.5;
        o.connect(og).connect(lp);
        lfo(0.23 + i * 0.07, 4, o.frequency); // its pitch wanders a little as it flies
        o.start();
        return o;
      });
      lp.connect(flutter).connect(gain).connect(pan);
      pan.connect(master);
      pan.connect(wet);
      this.hum = { gain, pan, osc };
    }
  }

  private gusts: (() => void) | null = null;

  private later(fn: () => void, secs: number) {
    const id = window.setTimeout(() => {
      this.timers = this.timers.filter((x) => x !== id);
      fn();
    }, secs * 1000);
    this.timers.push(id);
  }

  // what comes and goes: the leaves' gusts, crickets' chirps, a bird now and then
  private schedule() {
    this.gusts?.();
    this.cricket(-0.6, 4650);
    this.cricket(0.55, 4980);
    this.later(() => this.bird(), rnd(4, 8));
    this.later(() => this.flyBy(), rnd(1.5, 3));
    this.later(() => this.chirr(), rnd(3, 6));
  }

  // a small beetle flying by: its buzz swells as it comes near and passes from one side to the other, dropping a little
  // in pitch as it goes, then fades away
  private flyBy() {
    if (!this.playing) return;
    const ctx = this.ctx!;
    const from = Math.random() < 0.5 ? -1 : 1;
    const dur = rnd(2.4, 4);
    const t0 = ctx.currentTime + 0.05;
    const f = rnd(220, 320);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f * 3;
    bp.Q.value = 0.9;
    const flutter = ctx.createGain();
    flutter.gain.value = 0.65;
    const beat = ctx.createOscillator();
    beat.frequency.value = rnd(30, 42);
    const bd = ctx.createGain();
    bd.gain.value = 0.35;
    beat.connect(bd).connect(flutter.gain);
    const env = ctx.createGain();
    const peak = rnd(0.03, 0.05);
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(peak * 0.25, t0 + dur * 0.25);
    env.gain.linearRampToValueAtTime(peak, t0 + dur * 0.5);
    env.gain.linearRampToValueAtTime(peak * 0.2, t0 + dur * 0.8);
    env.gain.linearRampToValueAtTime(0, t0 + dur);
    const pan = ctx.createStereoPanner();
    pan.pan.setValueAtTime(from * 0.85, t0);
    pan.pan.linearRampToValueAtTime(-from * 0.85, t0 + dur);
    const oscs = [0, 1.3].map((d, i) => {
      const o = ctx.createOscillator();
      o.type = i ? "triangle" : "sawtooth";
      o.frequency.setValueAtTime(f * 1.04 + d, t0);
      o.frequency.linearRampToValueAtTime(f + d, t0 + dur * 0.5);
      o.frequency.linearRampToValueAtTime(f * 0.95 + d, t0 + dur);
      o.connect(bp);
      o.start(t0);
      o.stop(t0 + dur + 0.1);
      return o;
    });
    bp.connect(flutter).connect(env).connect(pan);
    const dry = ctx.createGain();
    dry.gain.value = 0.7;
    pan.connect(dry).connect(this.master!);
    const w = ctx.createGain();
    w.gain.value = 0.35;
    pan.connect(w).connect(this.wet!);
    beat.start(t0);
    beat.stop(t0 + dur + 0.1);
    void oscs;
    this.later(() => this.flyBy(), rnd(5, 11));
  }

  // a beetle's little voice: a soft, quick chirr of tiny ticks, close by in the leaves
  private chirr() {
    if (!this.playing) return;
    const ctx = this.ctx!;
    const out = this.voice(rnd(-0.6, 0.6), 0.45, rnd(0.01, 0.018));
    const t0 = ctx.currentTime + 0.05;
    const n = 6 + Math.floor(Math.random() * 10);
    const gap = rnd(0.03, 0.05);
    const f = rnd(2600, 3600);
    for (let i = 0; i < n; i++) {
      const t = t0 + i * gap * rnd(0.9, 1.1);
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(f * rnd(0.97, 1.03), t);
      o.frequency.exponentialRampToValueAtTime(f * 0.8, t + 0.018);
      const g = ctx.createGain();
      const a = Math.sin((Math.PI * (i + 0.5)) / n); // swells and fades over the chirr
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(a, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.03);
    }
    // sometimes it answers itself
    this.later(() => this.chirr(), Math.random() < 0.3 ? rnd(0.5, 1) : rnd(4, 9));
  }

  private voice(pan: number, wetMix: number, level: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = level;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    g.connect(p);
    const dry = ctx.createGain();
    dry.gain.value = 1 - wetMix;
    p.connect(dry).connect(this.master!);
    const w = ctx.createGain();
    w.gain.value = wetMix;
    p.connect(w).connect(this.wet!);
    return g;
  }

  // a cricket: little trills of three or four pulses, over and over, with a rest now and then
  private cricket(pan: number, freq: number) {
    const ctx = this.ctx!;
    const out = this.voice(pan, 0.5, 0.006);
    const chirp = () => {
      if (!this.playing) return;
      const t0 = ctx.currentTime + 0.05;
      const n = Math.random() < 0.7 ? 3 : 4;
      const o = ctx.createOscillator();
      o.frequency.value = freq + rnd(-40, 40);
      const g = ctx.createGain();
      g.gain.value = 0;
      for (let i = 0; i < n; i++) {
        const t = t0 + i * 0.034;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(1, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.024);
      }
      o.connect(g).connect(out);
      o.start(t0);
      o.stop(t0 + n * 0.034 + 0.05);
      this.later(chirp, Math.random() < 0.25 ? rnd(3, 8) : rnd(0.7, 1.1));
    };
    this.later(chirp, rnd(0.3, 1.5));
  }

  // a bird, further off: a short phrase of two to five rising or falling notes
  private bird() {
    if (!this.playing) return;
    const ctx = this.ctx!;
    const out = this.voice(rnd(-0.8, 0.8), 0.7, rnd(0.008, 0.015));
    const base = rnd(2300, 3600);
    const n = 2 + Math.floor(Math.random() * 4);
    let t = ctx.currentTime + 0.05;
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const d = rnd(0.07, 0.16);
      const f0 = base * rnd(0.85, 1.2);
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f0 * (Math.random() < 0.5 ? rnd(1.15, 1.5) : rnd(0.7, 0.88)), t + d);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + d + 0.02);
      t += d + rnd(0.04, 0.12);
    }
    this.later(() => this.bird(), rnd(9, 20));
  }
}

let one: Ambience | null = null;
/** The one sound of the film, shared by the hero's film and the Nyrro page. */
export const ambience = () => (one ??= new Ambience());
