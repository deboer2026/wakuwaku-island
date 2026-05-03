// Audio system — Web Audio API
// Replaced Tone.js to ensure reliable visibilitychange pause/resume

// ===== AudioContext (singleton) =====
let _ctx = null;
function _getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _ctx;
}

// ===== State =====
let isMuted = localStorage.getItem('wakuwaku_muted') === '1';

// Active BGM loop descriptor
// { steps, loopDuration, type, active, timeout }
let _loop = null;

// ===== Note → frequency =====
const _freqCache = {};
function _noteFreq(name) {
  if (_freqCache[name]) return _freqCache[name];
  const m = name.match(/^([A-G])(#|b)?(\d)$/);
  if (!m) return 440;
  const base = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }[m[1]];
  const acc  = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const midi = (parseInt(m[3]) + 1) * 12 + base + acc;
  _freqCache[name] = 440 * Math.pow(2, (midi - 69) / 12);
  return _freqCache[name];
}

// ===== Tone.js duration string → seconds (BPM=120) =====
const BEAT = 0.5; // quarter note at 120BPM
function _durSecs(dur) {
  if (!dur) return BEAT;
  const dotted = dur.endsWith('+') || dur.endsWith('.');
  const base   = dur.replace(/[+.]/g, '');
  const m = base.match(/^(\d+)n$/);
  if (!m) return BEAT;
  const secs = (4 / parseInt(m[1])) * BEAT;
  return dotted ? secs * 1.5 : secs;
}

// ===== Gain constants =====
const BGM_GAIN = 0.08; // ≈ -22 dBFS
const SE_GAIN  = 0.20; // ≈ -14 dBFS

// ===== Schedule one set of notes against ctx.currentTime =====
function _schedNotes(ctx, steps, type, gain) {
  const now = ctx.currentTime;
  steps.forEach(({ note, dur, t }) => {
    const freq = _noteFreq(note);
    const ds   = _durSecs(dur);
    const osc  = ctx.createOscillator();
    const env  = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(env);
    env.connect(ctx.destination);
    const st = now + t;
    const en = st + ds;
    env.gain.setValueAtTime(0,    st);
    env.gain.linearRampToValueAtTime(gain,     st + 0.02);
    env.gain.setValueAtTime(gain * 0.55,       en - 0.04);
    env.gain.linearRampToValueAtTime(0,        en + 0.08);
    osc.start(st);
    osc.stop(en + 0.12);
  });
}

// ===== BGM loop =====
function _cancelLoop() {
  if (_loop) {
    _loop.active = false;
    clearTimeout(_loop.timeout);
    _loop = null;
  }
}

function _startBgmLoop(steps, loopDuration, type) {
  _cancelLoop();
  const ctx  = _getCtx();
  const loop = { steps, loopDuration, type, active: true, timeout: null };
  _loop = loop;
  function tick() {
    if (!loop.active || ctx.state !== 'running') return;
    _schedNotes(ctx, loop.steps, loop.type, BGM_GAIN);
    loop.timeout = setTimeout(tick, loop.loopDuration * 1000);
  }
  tick();
}

// ===== Internal BGM helper =====
// Handles suspended context (unmute resume, post-lock resume)
function _bgm(steps, loopDuration, type) {
  if (isMuted) return;
  const ctx = _getCtx();
  if (ctx.state === 'running') {
    _startBgmLoop(steps, loopDuration, type);
  } else if (ctx.state === 'suspended') {
    ctx.resume().then(() => _startBgmLoop(steps, loopDuration, type)).catch(() => {});
  }
}

// ===== Visibility / lifecycle =====
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!_ctx) return;
    if (document.hidden) {
      // Pause: cancel pending tick and suspend the audio clock
      if (_loop) clearTimeout(_loop.timeout);
      _ctx.suspend().catch(() => {});
    } else if (!isMuted && _loop?.active) {
      // Resume: restart audio clock, then reschedule loop
      _ctx.resume().then(() => {
        if (!_loop?.active) return;
        const { steps, loopDuration, type } = _loop;
        _schedNotes(_ctx, steps, type, BGM_GAIN);
        function tick() {
          if (!_loop?.active) return;
          _schedNotes(_ctx, _loop.steps, _loop.type, BGM_GAIN);
          _loop.timeout = setTimeout(tick, _loop.loopDuration * 1000);
        }
        _loop.timeout = setTimeout(tick, loopDuration * 1000);
      }).catch(() => {});
    }
  });

  window.addEventListener('beforeunload', () => {
    _cancelLoop();
    if (_ctx) _ctx.suspend().catch(() => {});
  });
}

// ===== Public API =====

export async function ensureAudioStarted() {
  const ctx = _getCtx();
  console.log('[Audio] ensureAudioStarted, state:', ctx.state);
  if (ctx.state !== 'running') {
    await ctx.resume();
    console.log('[Audio] AudioContext resumed, state:', ctx.state);
  }
}

export function toggleMute() {
  isMuted = !isMuted;
  localStorage.setItem('wakuwaku_muted', isMuted ? '1' : '0');
  console.log('[Audio] mute toggled:', isMuted);
  if (isMuted) {
    _cancelLoop();
    if (_ctx) _ctx.suspend().catch(() => {});
  } else {
    // Resume context so subsequent playXxxBgm() calls work
    if (_ctx && _ctx.state === 'suspended') {
      _ctx.resume().catch(() => {});
    }
  }
  return isMuted;
}

export function getMuteState() { return isMuted; }
export function stopBgm() { _cancelLoop(); }

// ===== Visual feedback =====

export function triggerFlash(color = 'rgba(255,230,50,0.45)') {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;background:${color};pointer-events:none;z-index:9999;animation:ww-flash 0.35s forwards`;
  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 400);
}

export function triggerShake() {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;background:rgba(255,50,50,0.18);pointer-events:none;z-index:9999;animation:ww-flash 0.3s forwards`;
  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 350);
  document.body.classList.add('ww-shake');
  setTimeout(() => document.body.classList.remove('ww-shake'), 400);
}

// ===== BGM functions =====

export function playTopPageBgm() {
  console.log('[Audio] playTopPageBgm');
  _bgm([
    { note:'E4', dur:'8n', t:0.00 }, { note:'G4', dur:'8n', t:0.30 },
    { note:'C5', dur:'4n', t:0.60 }, { note:'G4', dur:'8n', t:1.20 },
    { note:'E4', dur:'8n', t:1.50 }, { note:'A4', dur:'8n', t:1.80 },
    { note:'C5', dur:'4n', t:2.10 }, { note:'F4', dur:'8n', t:2.70 },
    { note:'A4', dur:'8n', t:3.00 }, { note:'C5', dur:'4n', t:3.30 },
    { note:'G4', dur:'8n', t:3.90 }, { note:'B4', dur:'8n', t:4.20 },
    { note:'D5', dur:'8n', t:4.50 }, { note:'G4', dur:'4n', t:4.80 },
  ], 5.4, 'triangle');
}

export function playShabondamaBgm() {
  console.log('[Audio] playShabondamaBgm');
  _bgm([
    { note:'D5',  dur:'8n', t:0.00 }, { note:'F#5', dur:'8n', t:0.25 },
    { note:'A5',  dur:'4n', t:0.50 }, { note:'F#5', dur:'8n', t:1.00 },
    { note:'E5',  dur:'8n', t:1.25 }, { note:'G5',  dur:'4n', t:1.50 },
    { note:'E5',  dur:'8n', t:2.00 }, { note:'D5',  dur:'8n', t:2.25 },
    { note:'F#5', dur:'8n', t:2.50 }, { note:'B5',  dur:'4n', t:2.75 },
    { note:'A5',  dur:'8n', t:3.25 }, { note:'G5',  dur:'8n', t:3.50 },
    { note:'F#5', dur:'4n', t:3.75 }, { note:'D5',  dur:'4n', t:4.25 },
  ], 4.75, 'sine');
}

export function playKudamonoCatchBgm() {
  console.log('[Audio] playKudamonoCatchBgm');
  _bgm([
    { note:'C5', dur:'16n', t:0.00 }, { note:'E5', dur:'16n', t:0.20 },
    { note:'G5', dur:'8n',  t:0.40 }, { note:'E5', dur:'16n', t:0.80 },
    { note:'C5', dur:'16n', t:1.00 }, { note:'D5', dur:'8n',  t:1.20 },
    { note:'F5', dur:'8n',  t:1.60 }, { note:'A5', dur:'16n', t:2.00 },
    { note:'G5', dur:'16n', t:2.20 }, { note:'E5', dur:'8n',  t:2.40 },
    { note:'C5', dur:'8n',  t:2.80 }, { note:'G4', dur:'8n',  t:3.20 },
    { note:'C5', dur:'4n',  t:3.60 },
  ], 4.2, 'triangle');
}

export function playMeiroBgm() {
  console.log('[Audio] playMeiroBgm');
  _bgm([
    { note:'A4', dur:'4n', t:0.00 }, { note:'C5', dur:'8n', t:0.60 },
    { note:'E5', dur:'4n', t:1.00 }, { note:'C5', dur:'8n', t:1.60 },
    { note:'A4', dur:'8n', t:2.00 }, { note:'G4', dur:'4n', t:2.40 },
    { note:'F4', dur:'8n', t:3.00 }, { note:'E4', dur:'4n', t:3.40 },
    { note:'G4', dur:'8n', t:4.00 }, { note:'B4', dur:'4n', t:4.40 },
    { note:'A4', dur:'2n', t:5.00 },
  ], 6.0, 'sine');
}

export function playDoubutsuPuzzleBgm() {
  console.log('[Audio] playDoubutsuPuzzleBgm');
  _bgm([
    { note:'G4', dur:'8n', t:0.00 }, { note:'B4', dur:'8n', t:0.40 },
    { note:'D5', dur:'4n', t:0.80 }, { note:'B4', dur:'8n', t:1.40 },
    { note:'G4', dur:'8n', t:1.80 }, { note:'A4', dur:'4n', t:2.20 },
    { note:'C5', dur:'8n', t:2.80 }, { note:'E5', dur:'4n', t:3.20 },
    { note:'D5', dur:'8n', t:3.80 }, { note:'B4', dur:'8n', t:4.20 },
    { note:'G4', dur:'4n', t:4.60 }, { note:'D4', dur:'4n', t:5.20 },
    { note:'G4', dur:'2n', t:5.80 },
  ], 6.8, 'sine');
}

export function playKazuAsobiBgm() {
  console.log('[Audio] playKazuAsobiBgm');
  _bgm([
    { note:'C5', dur:'8n',  t:0.00 }, { note:'D5', dur:'8n',  t:0.25 },
    { note:'E5', dur:'8n',  t:0.50 }, { note:'G5', dur:'4n',  t:0.75 },
    { note:'E5', dur:'8n',  t:1.25 }, { note:'D5', dur:'8n',  t:1.50 },
    { note:'C5', dur:'4n',  t:1.75 }, { note:'A4', dur:'8n',  t:2.25 },
    { note:'C5', dur:'8n',  t:2.50 }, { note:'D5', dur:'8n',  t:2.75 },
    { note:'E5', dur:'8n',  t:3.00 }, { note:'G5', dur:'8n',  t:3.25 },
    { note:'A5', dur:'8n',  t:3.50 }, { note:'G5', dur:'4n',  t:3.75 },
    { note:'E5', dur:'8n',  t:4.25 }, { note:'C5', dur:'4n',  t:4.50 },
  ], 5.0, 'triangle');
}

export function playAnimalSoccerBgm() {
  console.log('[Audio] playAnimalSoccerBgm');
  _bgm([
    { note:'G4', dur:'16n', t:0.00 }, { note:'B4', dur:'16n', t:0.18 },
    { note:'D5', dur:'8n',  t:0.36 }, { note:'G5', dur:'16n', t:0.66 },
    { note:'D5', dur:'16n', t:0.84 }, { note:'B4', dur:'8n',  t:1.02 },
    { note:'G4', dur:'16n', t:1.32 }, { note:'A4', dur:'16n', t:1.50 },
    { note:'C5', dur:'8n',  t:1.68 }, { note:'E5', dur:'16n', t:1.98 },
    { note:'D5', dur:'16n', t:2.16 }, { note:'B4', dur:'8n',  t:2.34 },
    { note:'G4', dur:'16n', t:2.64 }, { note:'B4', dur:'16n', t:2.82 },
    { note:'D5', dur:'8n',  t:3.00 }, { note:'G5', dur:'4n',  t:3.30 },
    { note:'D5', dur:'4n',  t:3.80 },
  ], 4.3, 'triangle');
}

export function playJewelryShopBgm() {
  console.log('[Audio] playJewelryShopBgm');
  _bgm([
    { note:'A4',  dur:'16n', t:0.00 }, { note:'C#5', dur:'16n', t:0.25 },
    { note:'E5',  dur:'8n',  t:0.50 }, { note:'A5',  dur:'8n',  t:0.90 },
    { note:'E5',  dur:'16n', t:1.30 }, { note:'C#5', dur:'16n', t:1.55 },
    { note:'A4',  dur:'8n',  t:1.80 }, { note:'B4',  dur:'8n',  t:2.20 },
    { note:'D5',  dur:'16n', t:2.60 }, { note:'F#5', dur:'16n', t:2.85 },
    { note:'B5',  dur:'8n',  t:3.10 }, { note:'F#5', dur:'16n', t:3.50 },
    { note:'E5',  dur:'16n', t:3.75 }, { note:'C#5', dur:'8n',  t:4.00 },
    { note:'A4',  dur:'4n',  t:4.40 },
  ], 5.0, 'sine');
}

export function playSushiBgm() {
  console.log('[Audio] playSushiBgm');
  _bgm([
    { note:'D4', dur:'4n', t:0.00 }, { note:'F4', dur:'8n', t:0.60 },
    { note:'G4', dur:'4n', t:1.00 }, { note:'A4', dur:'8n', t:1.60 },
    { note:'C5', dur:'4n', t:2.00 }, { note:'A4', dur:'8n', t:2.60 },
    { note:'G4', dur:'8n', t:3.00 }, { note:'F4', dur:'4n', t:3.40 },
    { note:'D4', dur:'8n', t:4.00 }, { note:'G4', dur:'8n', t:4.40 },
    { note:'A4', dur:'4n', t:4.80 }, { note:'D4', dur:'2n', t:5.40 },
  ], 6.4, 'sine');
}

export function playIchigoBgm() {
  console.log('[Audio] playIchigoBgm');
  _bgm([
    { note:'G4', dur:'8n',  t:0.00 }, { note:'A4', dur:'8n',  t:0.28 },
    { note:'B4', dur:'8n',  t:0.56 }, { note:'D5', dur:'4n',  t:0.84 },
    { note:'B4', dur:'8n',  t:1.36 }, { note:'A4', dur:'8n',  t:1.64 },
    { note:'G4', dur:'4n',  t:1.92 }, { note:'E4', dur:'8n',  t:2.44 },
    { note:'G4', dur:'8n',  t:2.72 }, { note:'A4', dur:'8n',  t:3.00 },
    { note:'C5', dur:'8n',  t:3.28 }, { note:'B4', dur:'8n',  t:3.56 },
    { note:'A4', dur:'8n',  t:3.84 }, { note:'G4', dur:'4n',  t:4.12 },
    { note:'D4', dur:'8n',  t:4.64 }, { note:'G4', dur:'4n',  t:4.92 },
  ], 5.5, 'triangle');
}

export function playKakurenboBgm() {
  console.log('[Audio] playKakurenboBgm');
  _bgm([
    { note:'F4', dur:'8n', t:0.00 }, { note:'G4', dur:'8n', t:0.35 },
    { note:'A4', dur:'4n', t:0.70 }, { note:'C5', dur:'8n', t:1.30 },
    { note:'A4', dur:'8n', t:1.65 }, { note:'G4', dur:'4n', t:2.00 },
    { note:'F4', dur:'8n', t:2.60 }, { note:'A4', dur:'8n', t:2.95 },
    { note:'C5', dur:'8n', t:3.30 }, { note:'D5', dur:'4n', t:3.65 },
    { note:'C5', dur:'8n', t:4.25 }, { note:'A4', dur:'8n', t:4.60 },
    { note:'G4', dur:'8n', t:4.95 }, { note:'F4', dur:'4n', t:5.30 },
    { note:'C4', dur:'8n', t:5.90 }, { note:'F4', dur:'4n', t:6.25 },
  ], 6.85, 'sine');
}

export function playMojiAsobiBgm() {
  console.log('[Audio] playMojiAsobiBgm');
  _bgm([
    { note:'C5', dur:'8n',  t:0.00 }, { note:'E5', dur:'8n',  t:0.30 },
    { note:'G5', dur:'4n',  t:0.60 }, { note:'E5', dur:'8n',  t:1.20 },
    { note:'D5', dur:'8n',  t:1.50 }, { note:'C5', dur:'4n',  t:1.80 },
    { note:'A4', dur:'8n',  t:2.40 }, { note:'C5', dur:'8n',  t:2.70 },
    { note:'E5', dur:'8n',  t:3.00 }, { note:'G5', dur:'4n',  t:3.30 },
    { note:'F5', dur:'8n',  t:3.90 }, { note:'E5', dur:'8n',  t:4.20 },
    { note:'D5', dur:'8n',  t:4.50 }, { note:'C5', dur:'4n',  t:4.80 },
  ], 5.6, 'triangle');
}

export function playTashizanBgm() {
  console.log('[Audio] playTashizanBgm');
  _bgm([
    { note:'G4', dur:'8n',  t:0.00 }, { note:'B4', dur:'8n',  t:0.25 },
    { note:'D5', dur:'4n',  t:0.50 }, { note:'G5', dur:'8n',  t:1.00 },
    { note:'D5', dur:'8n',  t:1.25 }, { note:'B4', dur:'4n',  t:1.50 },
    { note:'A4', dur:'8n',  t:2.00 }, { note:'C5', dur:'8n',  t:2.25 },
    { note:'E5', dur:'4n',  t:2.50 }, { note:'D5', dur:'8n',  t:3.00 },
    { note:'B4', dur:'8n',  t:3.25 }, { note:'G4', dur:'8n',  t:3.50 },
    { note:'A4', dur:'8n',  t:3.75 }, { note:'B4', dur:'8n',  t:4.00 },
    { note:'G4', dur:'4n',  t:4.25 },
  ], 5.0, 'triangle');
}

export function playIroAwaseBgm() {
  console.log('[Audio] playIroAwaseBgm');
  _bgm([
    { note:'A4',  dur:'4n',  t:0.00 }, { note:'C#5', dur:'8n',  t:0.55 },
    { note:'E5',  dur:'8n',  t:0.90 }, { note:'A5',  dur:'8n',  t:1.25 },
    { note:'E5',  dur:'8n',  t:1.65 }, { note:'C#5', dur:'4n',  t:2.00 },
    { note:'B4',  dur:'8n',  t:2.55 }, { note:'D5',  dur:'8n',  t:2.90 },
    { note:'F#5', dur:'4n',  t:3.25 }, { note:'E5',  dur:'8n',  t:3.80 },
    { note:'C#5', dur:'8n',  t:4.15 }, { note:'A4',  dur:'4n',  t:4.50 },
  ], 5.2, 'sine');
}

export function playMachiBgm() {
  console.log('[Audio] playMachiBgm');
  _bgm([
    { note:'G4',  dur:'4n',  t:0.00 }, { note:'B4',  dur:'8n',  t:0.50 },
    { note:'D5',  dur:'8n',  t:0.75 }, { note:'G5',  dur:'4n',  t:1.00 },
    { note:'E5',  dur:'8n',  t:1.50 }, { note:'D5',  dur:'8n',  t:1.75 },
    { note:'C5',  dur:'4n',  t:2.00 }, { note:'E5',  dur:'8n',  t:2.50 },
    { note:'G5',  dur:'4n',  t:2.75 }, { note:'A5',  dur:'8n',  t:3.25 },
    { note:'G5',  dur:'8n',  t:3.50 }, { note:'F#5', dur:'8n',  t:3.75 },
    { note:'G5',  dur:'4n+', t:4.00 }, { note:'D5',  dur:'8n',  t:4.75 },
    { note:'G4',  dur:'4n',  t:5.00 }, { note:'B4',  dur:'8n',  t:5.50 },
    { note:'D5',  dur:'8n',  t:5.75 }, { note:'C5',  dur:'4n',  t:6.00 },
    { note:'A4',  dur:'4n',  t:6.50 }, { note:'G4',  dur:'2n',  t:7.00 },
  ], 8.2, 'triangle');
}

// ===== Sound Effects =====

function _se(notes, type, gain = SE_GAIN) {
  if (isMuted) return;
  const ctx = _getCtx();
  if (ctx.state !== 'running') return;
  const now = ctx.currentTime;
  notes.forEach(({ note, dur, t }) => {
    const freq = _noteFreq(note);
    const ds   = _durSecs(dur);
    const osc  = ctx.createOscillator();
    const env  = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(env);
    env.connect(ctx.destination);
    const st = now + t;
    const en = st + ds;
    env.gain.setValueAtTime(0,    st);
    env.gain.linearRampToValueAtTime(gain, st + 0.01);
    env.gain.linearRampToValueAtTime(0,    en + 0.05);
    osc.start(st);
    osc.stop(en + 0.08);
  });
}

export function playSoundCorrect() {
  _se([
    { note:'C5', dur:'32n', t:0.00 },
    { note:'E5', dur:'32n', t:0.05 },
    { note:'G5', dur:'32n', t:0.10 },
    { note:'C6', dur:'16n', t:0.15 },
  ], 'sine');
  triggerFlash();
}

export function playSoundWrong() {
  _se([
    { note:'G3',  dur:'32n', t:0.00 },
    { note:'F#3', dur:'32n', t:0.08 },
    { note:'G3',  dur:'32n', t:0.16 },
  ], 'sawtooth', SE_GAIN * 0.7);
  triggerShake();
}

export function playSoundClear() {
  _se([
    { note:'C5', dur:'32n', t:0.00 },
    { note:'G4', dur:'32n', t:0.06 },
    { note:'C5', dur:'32n', t:0.12 },
    { note:'E5', dur:'16n', t:0.18 },
    { note:'G5', dur:'16n', t:0.30 },
    { note:'C6', dur:'8n',  t:0.42 },
  ], 'triangle');
  triggerFlash('rgba(255,200,50,0.5)');
}

export function playSoundDamage() {
  _se([
    { note:'G3', dur:'32n', t:0.00 },
    { note:'F3', dur:'32n', t:0.10 },
  ], 'sine');
  triggerShake();
}

export function playSoundPop() {
  _se([{ note:'A4', dur:'16n', t:0.00 }], 'sine', SE_GAIN * 0.8);
}

export function playSoundReveal() {
  _se([
    { note:'E5', dur:'16n', t:0.00 },
    { note:'G5', dur:'16n', t:0.08 },
    { note:'B5', dur:'8n',  t:0.16 },
  ], 'sine');
}

export function playSoundWiggle() {
  _se([
    { note:'C4', dur:'32n', t:0.00 },
    { note:'B3', dur:'32n', t:0.06 },
    { note:'C4', dur:'32n', t:0.12 },
  ], 'sine', SE_GAIN * 0.6);
}
