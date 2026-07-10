/* WakuwakuBGM v1.0 — rich chord BGM library for Wakuwaku Island games */
(function(g) {
  'use strict';

  /* ---- Note frequencies (Hz) ---- */
  var N = {
    C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, Bb3:233.08, B3:246.94,
    C4:261.63, Db4:277.18, D4:293.66, Eb4:311.13, E4:329.63, F4:349.23, Gb4:369.99,
    G4:392.00, Ab4:415.30, A4:440.00, Bb4:466.16, B4:493.88,
    C5:523.25, D5:587.33, Eb5:622.25, E5:659.25, F5:698.46, G5:783.99, A5:880.00
  };

  /* ---- Theme definitions ---- */
  /* Each step: { b: bass Hz, c: [chord Hz...], d: beats } */
  var THEMES = {
    happy: {
      bpm: 130, wave: 'triangle',
      steps: [
        { b:N.C3, c:[N.C4,N.E4,N.G4,N.C5], d:4 },
        { b:N.G3, c:[N.G4,N.B4,N.D5],      d:4 },
        { b:N.A3, c:[N.A4,N.C5,N.E5],      d:4 },
        { b:N.F3, c:[N.F4,N.A4,N.C5],      d:4 }
      ]
    },
    magical: {
      bpm: 100, wave: 'sine',
      steps: [
        { b:N.A3, c:[N.A4,N.C5,N.E5],      d:4 },
        { b:N.C3, c:[N.C4,N.E4,N.G4],      d:4 },
        { b:N.G3, c:[N.G4,N.B4,N.D5],      d:4 },
        { b:N.D3, c:[N.D4,N.F4,N.A4],      d:4 }
      ]
    },
    cute: {
      bpm: 128, wave: 'triangle',
      steps: [
        { b:N.C3, c:[N.C4,N.E4,N.G4,N.C5], d:4 },
        { b:N.F3, c:[N.F4,N.A4,N.C5],      d:2 },
        { b:N.G3, c:[N.G4,N.B4,N.D5],      d:2 },
        { b:N.A3, c:[N.A4,N.C5,N.E5],      d:4 },
        { b:N.F3, c:[N.F4,N.A4,N.C5],      d:4 }
      ]
    },
    puzzle: {
      bpm: 88, wave: 'sine',
      steps: [
        { b:N.A3, c:[N.A4,N.C5,N.E5],      d:4 },
        { b:N.G3, c:[N.G4,N.B4,N.D5],      d:4 },
        { b:N.F3, c:[N.F4,N.A4,N.C5],      d:4 },
        { b:N.E3, c:[N.E4,N.Ab4,N.B4],     d:4 }
      ]
    },
    japanese: {
      bpm: 100, wave: 'sine',
      steps: [
        { b:N.D3, c:[N.D4,N.F4,N.A4,N.D5], d:4 },
        { b:N.A3, c:[N.A4,N.C5,N.D5],      d:4 },
        { b:N.G3, c:[N.G4,N.A4,N.D5],      d:4 },
        { b:N.D3, c:[N.D4,N.E4,N.A4],      d:4 }
      ]
    },
    adventure: {
      bpm: 112, wave: 'square',
      steps: [
        { b:N.A3, c:[N.A4,N.C5,N.E5],      d:4 },
        { b:N.F3, c:[N.F4,N.A4,N.C5],      d:4 },
        { b:N.C3, c:[N.C4,N.E4,N.G4],      d:4 },
        { b:N.G3, c:[N.G4,N.B4,N.D5],      d:4 }
      ]
    },
    fruity: {
      bpm: 132, wave: 'triangle',
      steps: [
        { b:N.C3, c:[N.C4,N.E4,N.G4],      d:2 },
        { b:N.F3, c:[N.F4,N.A4,N.C5],      d:2 },
        { b:N.G3, c:[N.G4,N.B4,N.D5],      d:2 },
        { b:N.C3, c:[N.C4,N.E4,N.G4],      d:2 },
        { b:N.A3, c:[N.A4,N.C5,N.E5],      d:2 },
        { b:N.F3, c:[N.F4,N.A4,N.C5],      d:2 },
        { b:N.G3, c:[N.G4,N.B4,N.D5],      d:4 }
      ]
    },
    building: {
      bpm: 116, wave: 'sawtooth',
      steps: [
        { b:N.C3,  c:[N.C4,N.E4,N.G4],     d:4 },
        { b:N.Bb3, c:[N.Bb4,N.D5,N.F5],    d:4 },
        { b:N.F3,  c:[N.F4,N.A4,N.C5],     d:4 },
        { b:N.G3,  c:[N.G4,N.B4,N.D5],     d:4 }
      ]
    },
    action: {
      bpm: 150, wave: 'sawtooth',
      steps: [
        { b:N.A3, c:[N.A4,N.C5,N.E5],      d:2 },
        { b:N.G3, c:[N.G4,N.B4,N.D5],      d:2 },
        { b:N.F3, c:[N.F4,N.A4,N.C5],      d:2 },
        { b:N.E3, c:[N.E4,N.Ab4,N.B4],     d:2 },
        { b:N.A3, c:[N.A4,N.C5,N.E5],      d:2 },
        { b:N.F3, c:[N.F4,N.A4,N.C5],      d:2 },
        { b:N.G3, c:[N.G4,N.B4,N.D5],      d:2 },
        { b:N.E3, c:[N.E4,N.Ab4,N.B4],     d:2 }
      ]
    },
    sky: {
      bpm: 104, wave: 'sine',
      steps: [
        { b:N.C3, c:[N.G4,N.C5,N.E5],      d:4 },
        { b:N.G3, c:[N.D4,N.G4,N.B4,N.D5], d:4 },
        { b:N.A3, c:[N.E4,N.A4,N.C5,N.E5], d:4 },
        { b:N.F3, c:[N.C4,N.F4,N.A4,N.F5], d:4 }
      ]
    }
  };

  /* ---- WakuwakuBGM class ---- */
  function WakuwakuBGM(theme) {
    this._cfg  = THEMES[theme] || THEMES.happy;
    this._ctx  = null;
    this._gain = null;
    this._on   = WakuwakuBGM.loadState();
    this._run  = false;
    this._si   = 0;
    this._bi   = 0;   /* beat index within step */
    this._tid  = null;
  }

  WakuwakuBGM.loadState = function() {
    var s = localStorage.getItem('wakuwaku_bgm');
    return s !== null ? s === 'on' : true;
  };

  WakuwakuBGM.saveState = function(on) {
    localStorage.setItem('wakuwaku_bgm', on ? 'on' : 'off');
  };

  Object.defineProperty(WakuwakuBGM.prototype, 'enabled', {
    get: function() { return this._on; }
  });

  WakuwakuBGM.prototype.setEnabled = function(on) {
    this._on = on;
  };

  WakuwakuBGM.prototype._initCtx = function() {
    if (this._ctx) return;
    try {
      this._ctx  = new (window.AudioContext || window.webkitAudioContext)();
      this._gain = this._ctx.createGain();
      this._gain.gain.value = 0.14;
      this._gain.connect(this._ctx.destination);
    } catch (e) {}
  };

  WakuwakuBGM.prototype._note = function(freq, t, dur, vol, wave) {
    if (!this._ctx || !this._gain) return;
    var osc = this._ctx.createOscillator();
    var env = this._ctx.createGain();
    osc.type = wave || this._cfg.wave || 'sine';
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + 0.025);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.88);
    osc.connect(env);
    env.connect(this._gain);
    osc.start(t);
    osc.stop(t + dur);
  };

  WakuwakuBGM.prototype._tick = function() {
    if (!this._run || !this._on || !this._ctx) return;
    var cfg   = this._cfg;
    var step  = cfg.steps[this._si % cfg.steps.length];
    var beat  = 60 / cfg.bpm;
    var dur   = step.d * beat;
    var t     = this._ctx.currentTime + 0.06;
    var self  = this;

    /* Bass (sine for warmth) */
    this._note(step.b, t, dur * 0.85, 0.45, 'sine');
    /* Bass octave sparkle */
    this._note(step.b * 2, t, dur * 0.6,  0.18, 'triangle');

    /* Arpeggiated chord */
    step.c.forEach(function(f, i) {
      self._note(f, t + i * 0.04, dur * 0.78, 0.22);
    });

    /* High melody sparkle every 4 steps */
    if (this._si % 4 === 0) {
      var hi = step.c[step.c.length - 1] * 2;
      this._note(hi, t + 0.08, beat * 0.45, 0.12, 'sine');
    }

    this._si++;
    this._tid = setTimeout(function() { self._tick(); }, dur * 1000 - 30);
  };

  WakuwakuBGM.prototype.start = function() {
    if (this._run || !this._on) return;
    this._initCtx();
    if (!this._ctx) return;
    if (this._ctx.state === 'suspended') this._ctx.resume();
    this._run = true;
    this._tick();
  };

  WakuwakuBGM.prototype.stop = function() {
    this._run = false;
    if (this._tid) { clearTimeout(this._tid); this._tid = null; }
  };

  WakuwakuBGM.prototype.toggle = function() {
    this._on = !this._on;
    if (this._on) this.start();
    else this.stop();
    return this._on;
  };

  g.WakuwakuBGM = WakuwakuBGM;
})(window);
