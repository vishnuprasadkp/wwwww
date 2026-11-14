"use client";

/*
 * The sound of Nyrro's film: a quiet place in nature, made live in the browser (nothing to download). A soft wind in the
 * leaves, their rustle rising and falling; crickets close by, one each side; now and then a bird, further off; and the
 * beetle's wings, a low, warm hum that comes from where the beetle is (left or right, nearer as it comes into view, softer
 * once it is gone). All of it in a little space of its own (a soft reverb), so it sounds like somewhere, not a recording.
 *
 * It starts as the film opens (the click that opens it lets the browser play sound) and fades away as it closes. The
 * sound button turns it off and on; off is remembered.
 */

const KEY = "nyrro-sound";
const LEVEL = 0.9;

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
    this.hum.gain.gain.setTargetAtTime(seen ? 0.05 : 0.014, t, seen ? 0.5 : 0.9);
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
    wet.gain.value = 0.55;
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
      lp.frequency.value = 420;
      const g = ctx.createGain();
      g.gain.value = 0.22;
      loop(brown).connect(lp).connect(g);
      g.connect(master);
      g.connect(wet);
      lfo(0.045, 0.1, g.gain);
      lfo(0.07, 140, lp.frequency);
    }
    // the leaves: a high, airy rustle that comes and goes in gusts
    {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 3200;
      bp.Q.value = 0.6;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1400;
      const g = ctx.createGain();
      g.gain.value = 0.012;
      loop(white).connect(bp).connect(hp).connect(g);
      g.connect(master);
      g.connect(wet);
      const gust = () => {
        if (!this.playing) return;
        const t = ctx.currentTime;
        g.gain.setTargetAtTime(rnd(0.004, 0.03), t, rnd(0.8, 2));
        bp.frequency.setTargetAtTime(rnd(2400, 4200), t, 1.5);
        this.later(gust, rnd(1.8, 4.5));
      };
      this.gusts = gust;
    }
    // the beetle's wings: a low, warm hum, two voices a breath apart, with the flutter of its wingbeat
    {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 700;
      lp.Q.value = 0.7;
      const flutter = ctx.createGain();
      flutter.gain.value = 0.7;
      lfo(28, 0.3, flutter.gain);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      const pan = ctx.createStereoPanner();
      const osc = [118, 119.6, 236.5].map((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 2 ? "triangle" : "sawtooth";
        o.frequency.value = f;
        const og = ctx.createGain();
        og.gain.value = i === 2 ? 0.35 : 0.5;
        o.connect(og).connect(lp);
        lfo(0.23 + i * 0.07, 2.5, o.frequency); // its pitch wanders a little as it flies
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
    this.later(() => this.bird(), rnd(2, 5));
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
    const out = this.voice(pan, 0.35, 0.018);
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
      this.later(chirp, Math.random() < 0.12 ? rnd(2.5, 6) : rnd(0.55, 0.9));
    };
    this.later(chirp, rnd(0.3, 1.5));
  }

  // a bird, further off: a short phrase of two to five rising or falling notes
  private bird() {
    if (!this.playing) return;
    const ctx = this.ctx!;
    const out = this.voice(rnd(-0.8, 0.8), 0.6, rnd(0.025, 0.045));
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
    this.later(() => this.bird(), rnd(5, 13));
  }
}

let one: Ambience | null = null;
/** The one sound of the film, shared by the hero's film and the Nyrro page. */
export const ambience = () => (one ??= new Ambience());
