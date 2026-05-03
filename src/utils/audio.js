// Audio system using Tone.js
// BGM and sound effects for all games

let audioInitialized = false;
let isMuted = localStorage.getItem('wakuwaku_muted') === '1';
let currentBgm   = null;
let currentSynth = null;

const VOLUME = -20; // dB — lowered for ear-friendly volume
const SE_VOLUME = -14; // Sound effect volume

// ===== Core Audio Lifecycle =====

// Ensure Tone.js AudioContext is running (must be called on user gesture)
export async function ensureAudioStarted() {
  if (!window.Tone) {
    console.log('[Audio] Tone.js not loaded yet');
    return;
  }
  console.log('[Audio] ensureAudioStarted called, context state:', window.Tone.context.state);
  if (window.Tone.context.state !== 'running') {
    try {
      await window.Tone.start();
      console.log('[Audio] Tone.start() completed, state now:', window.Tone.context.state);
    } catch (e) {
      console.log('[Audio] Tone.start() error:', e);
    }
  }
  if (!audioInitialized) {
    audioInitialized = true;
    console.log('[Audio] audioInitialized = true');
  }
}

// Mute toggle — persisted to localStorage
export function toggleMute() {
  isMuted = !isMuted;
  localStorage.setItem('wakuwaku_muted', isMuted ? '1' : '0');
  console.log('[Audio] mute toggled:', isMuted);
  if (isMuted) {
    stopAllBgm();
  }
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}

// Internal: stop all running BGM
function stopAllBgm() {
  if (currentBgm) {
    try { currentBgm.stop(); currentBgm.dispose(); } catch (_) {}
    currentBgm = null;
  }
  if (currentSynth) {
    try { currentSynth.releaseAll?.(); currentSynth.dispose(); } catch (_) {}
    currentSynth = null;
  }
}

// visibilitychange — pause BGM when tab hidden / screen locked, resume on return
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!window.Tone) return;
    if (document.hidden) {
      if (window.Tone.Transport.state === 'started') {
        window.Tone.Transport.pause();
      }
    } else {
      if (!isMuted && window.Tone.Transport.state === 'paused') {
        window.Tone.Transport.start();
      }
    }
  });
}

// Public stop
export function stopBgm() {
  stopAllBgm();
}

// Guard check used by all BGM functions
function canPlayAudio() {
  if (isMuted) return false;
  if (!window.Tone || window.Tone.context.state !== 'running') {
    console.log('[Audio] canPlayAudio: not ready, state:', window.Tone?.context?.state);
    return false;
  }
  return true;
}

// ===== Visual Feedback =====

// Screen flash on correct answer (yellow)
export function triggerFlash(color = 'rgba(255,230,50,0.45)') {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed', 'inset:0', `background:${color}`,
    'pointer-events:none', 'z-index:9999',
    'animation:ww-flash 0.35s forwards',
  ].join(';');
  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 400);
}

// Screen shake on miss/damage (red tint)
export function triggerShake() {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed', 'inset:0', 'background:rgba(255,50,50,0.18)',
    'pointer-events:none', 'z-index:9999',
    'animation:ww-flash 0.3s forwards',
  ].join(';');
  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 350);
  document.body.classList.add('ww-shake');
  setTimeout(() => document.body.classList.remove('ww-shake'), 400);
}

// ===== BGM helpers =====

// Play a melody loop using the given PolySynth
// steps: array of { note, dur, t } where t is seconds offset from loop start
function playMelodyLoop(synth, steps, loopDuration) {
  currentSynth = synth;
  currentBgm = new window.Tone.Loop((time) => {
    steps.forEach(s => {
      synth.triggerAttackRelease(s.note, s.dur, time + s.t);
    });
  }, loopDuration);
  currentBgm.start(0);
  window.Tone.Transport.start();
}

// ===== BGM =====

// トップページ — やさしくポップなアルペジオ (C major, triangle)
export function playTopPageBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playTopPageBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.35, release: 0.9 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // C major arpeggios — gentle, island-like
  const steps = [
    { note: 'E4', dur: '8n', t: 0.00 },
    { note: 'G4', dur: '8n', t: 0.30 },
    { note: 'C5', dur: '4n', t: 0.60 },
    { note: 'G4', dur: '8n', t: 1.20 },
    { note: 'E4', dur: '8n', t: 1.50 },
    { note: 'A4', dur: '8n', t: 1.80 },
    { note: 'C5', dur: '4n', t: 2.10 },
    { note: 'F4', dur: '8n', t: 2.70 },
    { note: 'A4', dur: '8n', t: 3.00 },
    { note: 'C5', dur: '4n', t: 3.30 },
    { note: 'G4', dur: '8n', t: 3.90 },
    { note: 'B4', dur: '8n', t: 4.20 },
    { note: 'D5', dur: '8n', t: 4.50 },
    { note: 'G4', dur: '4n', t: 4.80 },
  ];

  playMelodyLoop(synth, steps, 5.4);
}

// シャボンだまポン — ふわふわした軽やかなメロディ (D major, sine high)
export function playShabondamaBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playShabondamaBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.18, sustain: 0.22, release: 0.7 },
  }).toDestination();
  synth.volume.value = VOLUME - 1;

  // Airy, floaty — high register D major
  const steps = [
    { note: 'D5',  dur: '8n', t: 0.00 },
    { note: 'F#5', dur: '8n', t: 0.25 },
    { note: 'A5',  dur: '4n', t: 0.50 },
    { note: 'F#5', dur: '8n', t: 1.00 },
    { note: 'E5',  dur: '8n', t: 1.25 },
    { note: 'G5',  dur: '4n', t: 1.50 },
    { note: 'E5',  dur: '8n', t: 2.00 },
    { note: 'D5',  dur: '8n', t: 2.25 },
    { note: 'F#5', dur: '8n', t: 2.50 },
    { note: 'B5',  dur: '4n', t: 2.75 },
    { note: 'A5',  dur: '8n', t: 3.25 },
    { note: 'G5',  dur: '8n', t: 3.50 },
    { note: 'F#5', dur: '4n', t: 3.75 },
    { note: 'D5',  dur: '4n', t: 4.25 },
  ];

  playMelodyLoop(synth, steps, 4.75);
}

// くだものキャッチ — 楽しくテンポよいが耳障りでない (C major, triangle)
export function playKudamonoCatchBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playKudamonoCatchBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.28, release: 0.5 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // Cheerful C major melody — bouncy but not abrasive
  const steps = [
    { note: 'C5', dur: '16n', t: 0.00 },
    { note: 'E5', dur: '16n', t: 0.20 },
    { note: 'G5', dur: '8n',  t: 0.40 },
    { note: 'E5', dur: '16n', t: 0.80 },
    { note: 'C5', dur: '16n', t: 1.00 },
    { note: 'D5', dur: '8n',  t: 1.20 },
    { note: 'F5', dur: '8n',  t: 1.60 },
    { note: 'A5', dur: '16n', t: 2.00 },
    { note: 'G5', dur: '16n', t: 2.20 },
    { note: 'E5', dur: '8n',  t: 2.40 },
    { note: 'C5', dur: '8n',  t: 2.80 },
    { note: 'G4', dur: '8n',  t: 3.20 },
    { note: 'C5', dur: '4n',  t: 3.60 },
  ];

  playMelodyLoop(synth, steps, 4.2);
}

// めいろあそび — ゆったりした探検風 (A minor, sine)
export function playMeiroBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playMeiroBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.03, decay: 0.25, sustain: 0.35, release: 1.0 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // Mysterious A-minor exploration feel — slow, thoughtful
  const steps = [
    { note: 'A4', dur: '4n', t: 0.00 },
    { note: 'C5', dur: '8n', t: 0.60 },
    { note: 'E5', dur: '4n', t: 1.00 },
    { note: 'C5', dur: '8n', t: 1.60 },
    { note: 'A4', dur: '8n', t: 2.00 },
    { note: 'G4', dur: '4n', t: 2.40 },
    { note: 'F4', dur: '8n', t: 3.00 },
    { note: 'E4', dur: '4n', t: 3.40 },
    { note: 'G4', dur: '8n', t: 4.00 },
    { note: 'B4', dur: '4n', t: 4.40 },
    { note: 'A4', dur: '2n', t: 5.00 },
  ];

  playMelodyLoop(synth, steps, 6.0);
}

// どうぶつパズル — 落ち着いたかわいいBGM (G major, sine)
export function playDoubutsuPuzzleBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playDoubutsuPuzzleBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.04, decay: 0.20, sustain: 0.30, release: 0.8 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // Calm, gentle G major — puzzle concentration music
  const steps = [
    { note: 'G4',  dur: '8n', t: 0.00 },
    { note: 'B4',  dur: '8n', t: 0.40 },
    { note: 'D5',  dur: '4n', t: 0.80 },
    { note: 'B4',  dur: '8n', t: 1.40 },
    { note: 'G4',  dur: '8n', t: 1.80 },
    { note: 'A4',  dur: '4n', t: 2.20 },
    { note: 'C5',  dur: '8n', t: 2.80 },
    { note: 'E5',  dur: '4n', t: 3.20 },
    { note: 'D5',  dur: '8n', t: 3.80 },
    { note: 'B4',  dur: '8n', t: 4.20 },
    { note: 'G4',  dur: '4n', t: 4.60 },
    { note: 'D4',  dur: '4n', t: 5.20 },
    { note: 'G4',  dur: '2n', t: 5.80 },
  ];

  playMelodyLoop(synth, steps, 6.8);
}

// かずあそび — 明るいが単調でないメロディ (C pentatonic, triangle)
export function playKazuAsobiBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playKazuAsobiBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.28, release: 0.6 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // C pentatonic (C-D-E-G-A) — bright, educational feel
  const steps = [
    { note: 'C5', dur: '8n',  t: 0.00 },
    { note: 'D5', dur: '8n',  t: 0.25 },
    { note: 'E5', dur: '8n',  t: 0.50 },
    { note: 'G5', dur: '4n',  t: 0.75 },
    { note: 'E5', dur: '8n',  t: 1.25 },
    { note: 'D5', dur: '8n',  t: 1.50 },
    { note: 'C5', dur: '4n',  t: 1.75 },
    { note: 'A4', dur: '8n',  t: 2.25 },
    { note: 'C5', dur: '8n',  t: 2.50 },
    { note: 'D5', dur: '8n',  t: 2.75 },
    { note: 'E5', dur: '8n',  t: 3.00 },
    { note: 'G5', dur: '8n',  t: 3.25 },
    { note: 'A5', dur: '8n',  t: 3.50 },
    { note: 'G5', dur: '4n',  t: 3.75 },
    { note: 'E5', dur: '8n',  t: 4.25 },
    { note: 'C5', dur: '4n',  t: 4.50 },
  ];

  playMelodyLoop(synth, steps, 5.0);
}

// どうぶつサッカー — 軽快なリズム (G major, triangle upbeat)
export function playAnimalSoccerBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playAnimalSoccerBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.32, release: 0.5 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // G major sporty rhythm — energetic but not harsh
  const steps = [
    { note: 'G4', dur: '16n', t: 0.00 },
    { note: 'B4', dur: '16n', t: 0.18 },
    { note: 'D5', dur: '8n',  t: 0.36 },
    { note: 'G5', dur: '16n', t: 0.66 },
    { note: 'D5', dur: '16n', t: 0.84 },
    { note: 'B4', dur: '8n',  t: 1.02 },
    { note: 'G4', dur: '16n', t: 1.32 },
    { note: 'A4', dur: '16n', t: 1.50 },
    { note: 'C5', dur: '8n',  t: 1.68 },
    { note: 'E5', dur: '16n', t: 1.98 },
    { note: 'D5', dur: '16n', t: 2.16 },
    { note: 'B4', dur: '8n',  t: 2.34 },
    { note: 'G4', dur: '16n', t: 2.64 },
    { note: 'B4', dur: '16n', t: 2.82 },
    { note: 'D5', dur: '8n',  t: 3.00 },
    { note: 'G5', dur: '4n',  t: 3.30 },
    { note: 'D5', dur: '4n',  t: 3.80 },
  ];

  playMelodyLoop(synth, steps, 4.3);
}

// ほうせきやさん — きらきらした優しいBGM (A major, sine sparkly)
export function playJewelryShopBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playJewelryShopBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.03, decay: 0.20, sustain: 0.25, release: 0.8 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // A major arpeggios — sparkly jewelry store feel
  const steps = [
    { note: 'A4',  dur: '16n', t: 0.00 },
    { note: 'C#5', dur: '16n', t: 0.25 },
    { note: 'E5',  dur: '8n',  t: 0.50 },
    { note: 'A5',  dur: '8n',  t: 0.90 },
    { note: 'E5',  dur: '16n', t: 1.30 },
    { note: 'C#5', dur: '16n', t: 1.55 },
    { note: 'A4',  dur: '8n',  t: 1.80 },
    { note: 'B4',  dur: '8n',  t: 2.20 },
    { note: 'D5',  dur: '16n', t: 2.60 },
    { note: 'F#5', dur: '16n', t: 2.85 },
    { note: 'B5',  dur: '8n',  t: 3.10 },
    { note: 'F#5', dur: '16n', t: 3.50 },
    { note: 'E5',  dur: '16n', t: 3.75 },
    { note: 'C#5', dur: '8n',  t: 4.00 },
    { note: 'A4',  dur: '4n',  t: 4.40 },
  ];

  playMelodyLoop(synth, steps, 5.0);
}

// さーもんをとろう — のんびりした和風テイスト (D pentatonic, sine)
export function playSushiBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playSushiBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 0.25, sustain: 0.35, release: 1.2 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // D pentatonic (D-F-G-A-C) — Japanese/calm sushi bar feel
  const steps = [
    { note: 'D4', dur: '4n', t: 0.00 },
    { note: 'F4', dur: '8n', t: 0.60 },
    { note: 'G4', dur: '4n', t: 1.00 },
    { note: 'A4', dur: '8n', t: 1.60 },
    { note: 'C5', dur: '4n', t: 2.00 },
    { note: 'A4', dur: '8n', t: 2.60 },
    { note: 'G4', dur: '8n', t: 3.00 },
    { note: 'F4', dur: '4n', t: 3.40 },
    { note: 'D4', dur: '8n', t: 4.00 },
    { note: 'G4', dur: '8n', t: 4.40 },
    { note: 'A4', dur: '4n', t: 4.80 },
    { note: 'D4', dur: '2n', t: 5.40 },
  ];

  playMelodyLoop(synth, steps, 6.4);
}

// いちご — かわいくポップだが控えめ (G major, triangle)
export function playIchigoBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playIchigoBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.18, sustain: 0.25, release: 0.7 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // G major cute pop — strawberry picking energy
  const steps = [
    { note: 'G4', dur: '8n',  t: 0.00 },
    { note: 'A4', dur: '8n',  t: 0.28 },
    { note: 'B4', dur: '8n',  t: 0.56 },
    { note: 'D5', dur: '4n',  t: 0.84 },
    { note: 'B4', dur: '8n',  t: 1.36 },
    { note: 'A4', dur: '8n',  t: 1.64 },
    { note: 'G4', dur: '4n',  t: 1.92 },
    { note: 'E4', dur: '8n',  t: 2.44 },
    { note: 'G4', dur: '8n',  t: 2.72 },
    { note: 'A4', dur: '8n',  t: 3.00 },
    { note: 'C5', dur: '8n',  t: 3.28 },
    { note: 'B4', dur: '8n',  t: 3.56 },
    { note: 'A4', dur: '8n',  t: 3.84 },
    { note: 'G4', dur: '4n',  t: 4.12 },
    { note: 'D4', dur: '8n',  t: 4.64 },
    { note: 'G4', dur: '4n',  t: 4.92 },
  ];

  playMelodyLoop(synth, steps, 5.5);
}

// どうぶつかくれんぼ — 探索系・のどかな発見の音楽 (F major, sine)
export function playKakurenboBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playKakurenboBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.04, decay: 0.22, sustain: 0.32, release: 0.9 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // F major — playful nature/discovery feel
  const steps = [
    { note: 'F4', dur: '8n', t: 0.00 },
    { note: 'G4', dur: '8n', t: 0.35 },
    { note: 'A4', dur: '4n', t: 0.70 },
    { note: 'C5', dur: '8n', t: 1.30 },
    { note: 'A4', dur: '8n', t: 1.65 },
    { note: 'G4', dur: '4n', t: 2.00 },
    { note: 'F4', dur: '8n', t: 2.60 },
    { note: 'A4', dur: '8n', t: 2.95 },
    { note: 'C5', dur: '8n', t: 3.30 },
    { note: 'D5', dur: '4n', t: 3.65 },
    { note: 'C5', dur: '8n', t: 4.25 },
    { note: 'A4', dur: '8n', t: 4.60 },
    { note: 'G4', dur: '8n', t: 4.95 },
    { note: 'F4', dur: '4n', t: 5.30 },
    { note: 'C4', dur: '8n', t: 5.90 },
    { note: 'F4', dur: '4n', t: 6.25 },
  ];

  playMelodyLoop(synth, steps, 6.85);
}

// もじあそび — やさしいガクシュウBGM (C major, triangle, 学校っぽい)
export function playMojiAsobiBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playMojiAsobiBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.03, decay: 0.18, sustain: 0.28, release: 0.8 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // C major — gentle school/learning feel
  const steps = [
    { note: 'C5', dur: '8n',  t: 0.00 },
    { note: 'E5', dur: '8n',  t: 0.30 },
    { note: 'G5', dur: '4n',  t: 0.60 },
    { note: 'E5', dur: '8n',  t: 1.20 },
    { note: 'D5', dur: '8n',  t: 1.50 },
    { note: 'C5', dur: '4n',  t: 1.80 },
    { note: 'A4', dur: '8n',  t: 2.40 },
    { note: 'C5', dur: '8n',  t: 2.70 },
    { note: 'E5', dur: '8n',  t: 3.00 },
    { note: 'G5', dur: '4n',  t: 3.30 },
    { note: 'F5', dur: '8n',  t: 3.90 },
    { note: 'E5', dur: '8n',  t: 4.20 },
    { note: 'D5', dur: '8n',  t: 4.50 },
    { note: 'C5', dur: '4n',  t: 4.80 },
  ];

  playMelodyLoop(synth, steps, 5.6);
}

// たしざんゲーム — 楽しくポップな算数BGM (G major, triangle, はじける)
export function playTashizanBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playTashizanBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.22, release: 0.6 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // G major — upbeat fun math energy
  const steps = [
    { note: 'G4', dur: '8n',  t: 0.00 },
    { note: 'B4', dur: '8n',  t: 0.25 },
    { note: 'D5', dur: '4n',  t: 0.50 },
    { note: 'G5', dur: '8n',  t: 1.00 },
    { note: 'D5', dur: '8n',  t: 1.25 },
    { note: 'B4', dur: '4n',  t: 1.50 },
    { note: 'A4', dur: '8n',  t: 2.00 },
    { note: 'C5', dur: '8n',  t: 2.25 },
    { note: 'E5', dur: '4n',  t: 2.50 },
    { note: 'D5', dur: '8n',  t: 3.00 },
    { note: 'B4', dur: '8n',  t: 3.25 },
    { note: 'G4', dur: '8n',  t: 3.50 },
    { note: 'A4', dur: '8n',  t: 3.75 },
    { note: 'B4', dur: '8n',  t: 4.00 },
    { note: 'G4', dur: '4n',  t: 4.25 },
  ];

  playMelodyLoop(synth, steps, 5.0);
}

// いろあわせ — ゆめかわいい色彩BGM (A major, sine, ふんわり)
export function playIroAwaseBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playIroAwaseBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.05, decay: 0.25, sustain: 0.30, release: 1.0 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // A major — dreamy, dreamy art/color palette feel
  const steps = [
    { note: 'A4',  dur: '4n',  t: 0.00 },
    { note: 'C#5', dur: '8n',  t: 0.55 },
    { note: 'E5',  dur: '8n',  t: 0.90 },
    { note: 'A5',  dur: '8n',  t: 1.25 },
    { note: 'E5',  dur: '8n',  t: 1.65 },
    { note: 'C#5', dur: '4n',  t: 2.00 },
    { note: 'B4',  dur: '8n',  t: 2.55 },
    { note: 'D5',  dur: '8n',  t: 2.90 },
    { note: 'F#5', dur: '4n',  t: 3.25 },
    { note: 'E5',  dur: '8n',  t: 3.80 },
    { note: 'C#5', dur: '8n',  t: 4.15 },
    { note: 'A4',  dur: '4n',  t: 4.50 },
  ];

  playMelodyLoop(synth, steps, 5.2);
}

export function playMachiBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.25, sustain: 0.3, release: 0.6 },
  }).toDestination();
  synth.volume.value = -8;
  const steps = [
    { note: 'G4',  dur: '4n',  t: 0.0  },
    { note: 'B4',  dur: '8n',  t: 0.5  },
    { note: 'D5',  dur: '8n',  t: 0.75 },
    { note: 'G5',  dur: '4n',  t: 1.0  },
    { note: 'E5',  dur: '8n',  t: 1.5  },
    { note: 'D5',  dur: '8n',  t: 1.75 },
    { note: 'C5',  dur: '4n',  t: 2.0  },
    { note: 'E5',  dur: '8n',  t: 2.5  },
    { note: 'G5',  dur: '4n',  t: 2.75 },
    { note: 'A5',  dur: '8n',  t: 3.25 },
    { note: 'G5',  dur: '8n',  t: 3.5  },
    { note: 'F#5', dur: '8n',  t: 3.75 },
    { note: 'G5',  dur: '4n+', t: 4.0  },
    { note: 'D5',  dur: '8n',  t: 4.75 },
    { note: 'G4',  dur: '4n',  t: 5.0  },
    { note: 'B4',  dur: '8n',  t: 5.5  },
    { note: 'D5',  dur: '8n',  t: 5.75 },
    { note: 'C5',  dur: '4n',  t: 6.0  },
    { note: 'A4',  dur: '4n',  t: 6.5  },
    { note: 'G4',  dur: '2n',  t: 7.0  },
  ];
  playMelodyLoop(synth, steps, 8.2);
}

// ===== Sound Effects =====

// 正解・上昇音
export function playSoundCorrect() {
  if (!canPlayAudio()) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME;

  const now = window.Tone.now();
  synth.triggerAttackRelease('C5', '32n', now);
  synth.triggerAttackRelease('E5', '32n', now + 0.05);
  synth.triggerAttackRelease('G5', '32n', now + 0.1);
  synth.triggerAttackRelease('C6', '16n', now + 0.15);
  setTimeout(() => { try { synth.dispose(); } catch (_) {} }, 500);

  triggerFlash();
}

// 不正解・ブブー音
export function playSoundWrong() {
  if (!canPlayAudio()) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME - 4;

  const now = window.Tone.now();
  synth.triggerAttackRelease('G3', '32n', now);
  synth.triggerAttackRelease('F#3', '32n', now + 0.08);
  synth.triggerAttackRelease('G3', '32n', now + 0.16);
  setTimeout(() => { try { synth.dispose(); } catch (_) {} }, 400);

  triggerShake();
}

// クリア・ファンファーレ
export function playSoundClear() {
  if (!canPlayAudio()) return;
  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME - 2;

  const now = window.Tone.now();
  synth.triggerAttackRelease('C5', '32n', now);
  synth.triggerAttackRelease('G4', '32n', now + 0.06);
  synth.triggerAttackRelease('C5', '32n', now + 0.12);
  synth.triggerAttackRelease('E5', '16n', now + 0.18);
  synth.triggerAttackRelease('G5', '16n', now + 0.3);
  synth.triggerAttackRelease('C6', '8n', now + 0.42);
  setTimeout(() => { try { synth.dispose(); } catch (_) {} }, 800);

  triggerFlash('rgba(255,200,50,0.5)');
}

// ダメージ音
export function playSoundDamage() {
  if (!canPlayAudio()) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.25, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME;

  const now = window.Tone.now();
  synth.triggerAttackRelease('G3', '32n', now);
  synth.triggerAttackRelease('F3', '32n', now + 0.1);
  setTimeout(() => { try { synth.dispose(); } catch (_) {} }, 400);

  triggerShake();
}

// ポップ音 (発見・タップ)
export function playSoundPop() {
  if (!canPlayAudio()) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.18, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME - 2;

  synth.triggerAttackRelease('A4', '16n');
  setTimeout(() => { try { synth.dispose(); } catch (_) {} }, 300);
}

// かくれんぼ発見音 (動物が飛び出す)
export function playSoundReveal() {
  if (!canPlayAudio()) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 },
  }).toDestination();
  synth.volume.value = SE_VOLUME - 1;

  const now = window.Tone.now();
  synth.triggerAttackRelease('E5', '16n', now);
  synth.triggerAttackRelease('G5', '16n', now + 0.08);
  synth.triggerAttackRelease('B5', '8n', now + 0.16);
  setTimeout(() => { try { synth.dispose(); } catch (_) {} }, 500);
}

// ぷるぷる (間違い・かわいいNG)
export function playSoundWiggle() {
  if (!canPlayAudio()) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME - 3;

  const now = window.Tone.now();
  synth.triggerAttackRelease('C4', '32n', now);
  synth.triggerAttackRelease('B3', '32n', now + 0.06);
  synth.triggerAttackRelease('C4', '32n', now + 0.12);
  setTimeout(() => { try { synth.dispose(); } catch (_) {} }, 300);
}
