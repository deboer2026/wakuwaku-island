/**
 * wakuwaku_bgm.js - Chord-based BGM & SE library for わくわくアイランド
 * Usage: const bgm = new WakuwakuBGM('happy'); bgm.start(); bgm.toggle();
 *        WakuwakuBGM.SE(ctx, 'correct');
 */
(function(global) {
'use strict';

// ── Note frequencies ──────────────────────────────────────────────────────
const N = {
  A2:110.00, B2:123.47,
  C3:130.81, D3:146.83, E3:164.81, F3:174.61, Fs3:185.00, G3:196.00, A3:220.00, B3:246.94,
  C4:261.63, Cs4:277.18, D4:293.66, Ds4:311.13, E4:329.63, F4:349.23, Fs4:369.99,
  G4:392.00, Gs4:415.30, A4:440.00, As4:466.16, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, F5:698.46, Fs5:739.99, G5:783.99, A5:880.00,
  B5:987.77, C6:1046.50, E6:1318.51, A6:1760.00,
};

// ── Theme definitions ──────────────────────────────────────────────────────
// Each theme: bpm, beatsPerChord, chords[], bass[], melody[], wave types
const THEMES = {

  // たしざん・かずあそび — bright C major pop
  happy: {
    bpm:126, bpc:4,
    chords:[[N.C4,N.E4,N.G4],[N.G3,N.B3,N.D4],[N.A3,N.C4,N.E4],[N.F3,N.A3,N.C4]],
    bass:  [N.C3, N.G2||65.41, N.A2, N.F3||N.F3],
    mel:   [N.C5,N.E5,N.G5,N.E5,N.D5,N.C5,N.D5,N.E5,N.C5,N.G5,N.E5,N.D5,N.C5,N.B4,N.C5,N.D5],
    cWave:'triangle', mWave:'sine', bWave:'sine', cVol:0.052, mVol:0.07, bVol:0.16,
  },

  // いろあわせ・もじあそび・ジュエリー — sparkling D major
  magical: {
    bpm:100, bpc:4,
    chords:[[N.D4,N.Fs4,N.A4],[N.B3,N.D4,N.Fs4],[N.G3,N.B3,N.D4],[N.A3,N.Cs4||N.D4,N.E4]],
    bass:  [N.D3,N.B2||123.47,N.G2||97.99,N.A2],
    mel:   [N.Fs5,N.A5,N.G5,N.Fs5,N.E5,N.D5,N.E5,N.Fs5,N.D5,N.A5,N.Fs5,N.E5,N.D5,N.Cs4||N.D4,N.D5,N.E5],
    cWave:'sine', mWave:'sine', bWave:'sine', cVol:0.048, mVol:0.065, bVol:0.14,
  },

  // いちご・しゃぼんだま・着せ替え・かくれんぼ — gentle F major waltz
  cute: {
    bpm:108, bpc:6,
    chords:[[N.F3,N.A3,N.C4],[N.C4,N.E4,N.G4],[N.G3,N.B3,N.D4],[N.F3,N.A3,N.C4]],
    bass:  [N.F3,N.C3,N.G2||65.41,N.F3],
    mel:   [N.F5,N.A5,N.G5,N.F5,N.E5,N.C5,N.D5,N.E5,N.F5,N.G5,N.A5,N.G5,N.F5,N.E5,N.D5,N.C5],
    cWave:'triangle', mWave:'sine', bWave:'sine', cVol:0.045, mVol:0.065, bVol:0.14,
  },

  // めいろ・ランナー・おかしのくに — G major adventure
  adventure: {
    bpm:138, bpc:4,
    chords:[[N.G3,N.B3,N.D4],[N.E3||N.E3,N.Gs3||N.G3,N.B3],[N.C4,N.E4,N.G4],[N.D4,N.Fs4,N.A4]],
    bass:  [N.G3,N.E3||164.81,N.C3,N.D3],
    mel:   [N.G5,N.A5,N.B5||N.B5,N.A5,N.G5,N.Fs5,N.G5,N.D5,N.E5,N.Fs5,N.G5,N.A5,N.B5||N.A5,N.G5,N.Fs5,N.G5],
    cWave:'square', mWave:'triangle', bWave:'triangle', cVol:0.042, mVol:0.062, bVol:0.15,
  },

  // どうぶつパズル・テトリス — Am thoughtful
  puzzle: {
    bpm:118, bpc:4,
    chords:[[N.A3,N.C4,N.E4],[N.G3,N.B3,N.D4],[N.F3,N.A3,N.C4],[N.E3||N.E3,N.Gs3||N.G3,N.B3]],
    bass:  [N.A2,N.G2||97.99,N.F3,N.E3||164.81],
    mel:   [N.A5,N.G5,N.E5,N.D5,N.E5,N.G5,N.A5,N.C5,N.B4,N.A4,N.B4,N.C5,N.D5,N.E5,N.D5,N.C5],
    cWave:'triangle', mWave:'sine', bWave:'sine', cVol:0.048, mVol:0.062, bVol:0.15,
  },

  // シューティング・スナイパー・shoot2 — Em action
  action: {
    bpm:156, bpc:4,
    chords:[[N.E3||N.E3,N.Gs3||N.G3,N.B3],[N.C4,N.E4,N.G4],[N.D4,N.Fs4,N.A4],[N.E3||N.E3,N.Gs3||N.G3,N.B3]],
    bass:  [N.E3||164.81,N.C3,N.D3,N.E3||164.81],
    mel:   [N.E5,N.G5,N.A5,N.G5,N.E5,N.D5,N.E5,N.B4,N.C5,N.D5,N.E5,N.G5,N.A5,N.G5,N.Fs5,N.E5],
    cWave:'sawtooth', mWave:'square', bWave:'triangle', cVol:0.038, mVol:0.058, bVol:0.16,
  },

  // さーもん・こっきクイズ — D pentatonic Japanese
  japanese: {
    bpm:104, bpc:4,
    chords:[[N.D4,N.Fs4,N.A4],[N.A3,N.D4,N.Fs4],[N.G3,N.B3,N.D4],[N.D4,N.Fs4,N.A4]],
    bass:  [N.D3,N.A2,N.G2||97.99,N.D3],
    mel:   [N.D5,N.Fs5,N.A5,N.Fs5,N.E5,N.D5,N.A4,N.B4,N.D5,N.Fs5,N.E5,N.D5,N.Cs4||N.D4,N.D5,N.E5,N.Fs5],
    cWave:'triangle', mWave:'sine', bWave:'sine', cVol:0.048, mVol:0.065, bVol:0.15,
  },

  // まちづくり — peaceful C major
  building: {
    bpm:90, bpc:4,
    chords:[[N.C4,N.E4,N.G4],[N.E3||N.E3,N.Gs3||N.G3,N.B3],[N.F3,N.A3,N.C4],[N.G3,N.B3,N.D4]],
    bass:  [N.C3,N.E3||164.81,N.F3,N.G3],
    mel:   [N.C5,N.E5,N.G5,N.E5,N.D5,N.C5,N.B4,N.C5,N.D5,N.E5,N.F5,N.E5,N.D5,N.C5,N.D5,N.E5],
    cWave:'sine', mWave:'sine', bWave:'sine', cVol:0.045, mVol:0.060, bVol:0.13,
  },

  // くだもの — bouncy G major
  fruity: {
    bpm:132, bpc:4,
    chords:[[N.G3,N.B3,N.D4],[N.C4,N.E4,N.G4],[N.D4,N.Fs4,N.A4],[N.G3,N.B3,N.D4]],
    bass:  [N.G3,N.C3,N.D3,N.G3],
    mel:   [N.G5,N.B5||N.A5,N.D5,N.B4,N.A4,N.G4,N.A4,N.B4,N.C5,N.D5,N.E5,N.D5,N.C5,N.B4,N.D5,N.G5],
    cWave:'triangle', mWave:'sine', bWave:'sine', cVol:0.050, mVol:0.068, bVol:0.16,
  },

  // もりのなかまたち — retro forest G major
  forest: {
    bpm:144, bpc:4,
    chords:[[N.G3,N.B3,N.D4],[N.E3||N.E3,N.Gs3||N.G3,N.B3],[N.C4,N.E4,N.G4],[N.D4,N.Fs4,N.A4]],
    bass:  [N.G3,N.E3||164.81,N.C3,N.D3],
    mel:   [N.G5,N.A5,N.B5||N.A5,N.G5,N.Fs5,N.G5,N.D5,N.E5,N.G5,N.A5,N.B5||N.A5,N.A5,N.G5,N.Fs5,N.E5,N.D5],
    cWave:'square', mWave:'triangle', bWave:'triangle', cVol:0.040, mVol:0.060, bVol:0.15,
  },

  // そらとびプリンセス — bright A major sky
  sky: {
    bpm:132, bpc:4,
    chords:[[N.A3,N.Cs4||N.D4,N.E4],[N.Fs4,N.A4,N.Cs4||N.D4],[N.D4,N.Fs4,N.A4],[N.E4,N.Gs4,N.B4]],
    bass:  [N.A2,N.Fs3||N.Fs3,N.D3,N.E3||164.81],
    mel:   [N.A5,N.Cs4||N.D4,N.E5,N.A5,N.Gs4,N.A5,N.Fs5,N.E5,N.D5,N.E5,N.Fs5,N.A5,N.Gs4,N.A5,N.E5,N.D5],
    cWave:'triangle', mWave:'sine', bWave:'sine', cVol:0.048, mVol:0.066, bVol:0.14,
  },

  // わくわくバイク — fast Em racing
  racing: {
    bpm:168, bpc:4,
    chords:[[N.E3||N.E3,N.Gs3||N.G3,N.B3],[N.C4,N.E4,N.G4],[N.A3,N.C4,N.E4],[N.D4,N.Fs4,N.A4]],
    bass:  [N.E3||164.81,N.C3,N.A2,N.D3],
    mel:   [N.E5,N.G5,N.A5,N.G5,N.E5,N.D5,N.E5,N.G5,N.A5,N.B5||N.A5,N.A5,N.G5,N.Fs5,N.E5,N.D5,N.E5],
    cWave:'sawtooth', mWave:'square', bWave:'triangle', cVol:0.038, mVol:0.055, bVol:0.16,
  },
};

// Fix missing bass notes using approximate values
const B2=123.47, G2=98.00, Fs3=185.00, E3=164.81, Gs3=207.65;
Object.values(THEMES).forEach(t=>{
  t.bass = t.bass.map(f=>f||N.C3);
});

// ── Main class ─────────────────────────────────────────────────────────────
class WakuwakuBGM {
  constructor(themeName) {
    this.t = THEMES[themeName] || THEMES.happy;
    this.enabled = true;
    this.beat = 0;
    this.oscs = [];
    this.iv = null;
    this.ctx = null;
  }

  _ctx() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  _killOscs() {
    this.oscs.forEach(o => { try { o.stop(); } catch { /* oscillator may already be stopped */ } });
    this.oscs = [];
  }

  _tick() {
    this._killOscs();
    if (!this.enabled) return;
    const c = this._ctx(), now = c.currentTime, t = this.t;
    const ci = Math.floor(this.beat / t.bpc) % t.chords.length;
    const beat = this.beat % t.bpc;
    const dur = 60 / t.bpm;

    // ── Chord (strum) ────────────────────────────────────────────────────
    t.chords[ci].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = t.cWave;
      o.frequency.value = f;
      const d = i * 0.020;
      g.gain.setValueAtTime(0, now + d);
      g.gain.linearRampToValueAtTime(t.cVol, now + d + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.88);
      o.connect(g); g.connect(c.destination);
      o.start(now + d); o.stop(now + dur);
      this.oscs.push(o);
    });

    // ── Bass (beat 1, and beat 3 at fast tempo) ──────────────────────────
    if (beat === 0 || (t.bpm >= 132 && beat === Math.floor(t.bpc / 2))) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = t.bWave;
      o.frequency.value = t.bass[ci];
      g.gain.setValueAtTime(t.bVol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur * 1.1);
      o.connect(g); g.connect(c.destination);
      o.start(now); o.stop(now + dur * 1.2);
      this.oscs.push(o);
    }

    // ── Melody ────────────────────────────────────────────────────────────
    {
      const o = c.createOscillator(), g = c.createGain();
      o.type = t.mWave;
      o.frequency.value = t.mel[this.beat % t.mel.length];
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(t.mVol, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.82);
      o.connect(g); g.connect(c.destination);
      o.start(now); o.stop(now + dur);
      this.oscs.push(o);
    }

    this.beat++;
  }

  start() {
    if (this.iv) return;
    this._tick();
    this.iv = setInterval(() => this._tick(), 60000 / this.t.bpm);
  }

  stop() {
    clearInterval(this.iv); this.iv = null;
    this._killOscs();
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this._killOscs();
    else this._tick();
    return this.enabled;
  }

  setEnabled(v) {
    this.enabled = !!v;
    if (!v) this._killOscs();
  }

  // ── Static SE player ────────────────────────────────────────────────────
  static SE(ctx, type) {
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    // Helper: play a sequence of [freq, timeOffset, duration?] notes
    const seq = (notes, wave, vol, defDur) => {
      notes.forEach(([f, t, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = wave;
        o.frequency.value = f;
        const td = d || defDur;
        g.gain.setValueAtTime(0, now + t);
        g.gain.linearRampToValueAtTime(vol, now + t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, now + t + td);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + t); o.stop(now + t + td + 0.02);
      });
    };

    switch (type) {
      case 'correct':
        seq([[523.25,0],[659.25,0.07],[783.99,0.14],[1046.50,0.21]],'sine',0.13,0.10);
        seq([[523.25,0],[659.25,0.07],[783.99,0.14]],'triangle',0.07,0.09);
        break;
      case 'wrong':
        seq([[220,0,0.12],[196,0.12,0.12],[164.81,0.25,0.18]],'sawtooth',0.11,0.12);
        break;
      case 'perfect':
        seq([[523.25,0],[659.25,0.06],[783.99,0.12],[1046.50,0.18],[1318.51,0.25]],'sine',0.12,0.10);
        seq([[261.63,0],[329.63,0.06],[392.00,0.12],[523.25,0.18]],'triangle',0.07,0.09);
        break;
      case 'tap':
      case 'collect':
        seq([[880,0,0.04],[1108.73,0.04,0.05],[1318.51,0.09,0.06]],'sine',0.11,0.05);
        break;
      case 'miss':
        seq([[330,0,0.09],[277.18,0.09,0.11]],'triangle',0.10,0.10);
        break;
      case 'levelup':
        seq([[523.25,0],[659.25,0.07],[783.99,0.14],[1046.50,0.21],[1318.51,0.30]],'triangle',0.12,0.10);
        break;
      case 'gameover':
        seq([[440,0,0.16],[369.99,0.16,0.16],[329.63,0.33,0.16],[261.63,0.50,0.28]],'sawtooth',0.13,0.18);
        break;
      case 'start':
        seq([[392,0],[523.25,0.09],[659.25,0.18],[783.99,0.27]],'triangle',0.12,0.11);
        break;
      case 'coin':
        seq([[1318.51,0,0.04],[1760,0.05,0.08]],'sine',0.14,0.05);
        break;
      case 'jump': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(200, now);
        o.frequency.exponentialRampToValueAtTime(620, now + 0.13);
        g.gain.setValueAtTime(0.11, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.19);
        break;
      }
      case 'land': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(300, now);
        o.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        g.gain.setValueAtTime(0.10, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.10);
        break;
      }
      case 'shoot': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(880, now);
        o.frequency.exponentialRampToValueAtTime(110, now + 0.16);
        g.gain.setValueAtTime(0.10, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.18);
        break;
      }
      case 'explosion': {
        const len = Math.ceil(ctx.sampleRate * 0.22);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 1.8);
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buf; g.gain.value = 0.22;
        src.connect(g); g.connect(ctx.destination);
        src.start(now);
        break;
      }
      case 'match': // memory card match
        seq([[659.25,0],[783.99,0.06],[1046.50,0.13]],'sine',0.12,0.09);
        seq([[329.63,0],[392.00,0.06],[523.25,0.13]],'triangle',0.07,0.09);
        break;
      case 'flip': // card flip
        seq([[440,0,0.05],[523.25,0.05,0.05]],'triangle',0.08,0.05);
        break;
      case 'pop': // bubble pop
        seq([[880,0,0.04],[1046.50,0.03,0.04]],'sine',0.10,0.04);
        break;
      case 'honk': // car honk
        seq([[440,0,0.12],[330,0,0.12]],'sawtooth',0.09,0.12);
        break;
      case 'score': // points scored
        seq([[659.25,0,0.06],[783.99,0.06,0.07]],'sine',0.11,0.06);
        break;
    }
  }
}

// ── localStorage BGM state helper ──────────────────────────────────────────
WakuwakuBGM.loadState = function() {
  const s = localStorage.getItem('wakuwaku_bgm');
  return s !== null ? s === 'on' : true;
};
WakuwakuBGM.saveState = function(on) {
  localStorage.setItem('wakuwaku_bgm', on ? 'on' : 'off');
};

global.WakuwakuBGM = WakuwakuBGM;

})(window);
