// Audio system using Tone.js
// BGM and sound effects for all games

let audioInitialized = false;
let isMuted = localStorage.getItem('wakuwaku_muted') === '1';
let currentBgm = null;
let bgmSynth = null;
let bassSynth = null;

const VOLUME = -14; // dB
const SE_VOLUME = -12; // Sound effect volume

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
  if (bgmSynth) {
    try { bgmSynth.triggerRelease(); bgmSynth.dispose(); } catch (_) {}
    bgmSynth = null;
  }
  if (bassSynth) {
    try { bassSynth.triggerRelease(); bassSynth.dispose(); } catch (_) {}
    bassSynth = null;
  }
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

// ===== BGM =====

export function playTopPageBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playTopPageBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = [
    { note: 'C4', dur: '8n' }, { note: 'E4', dur: '8n' },
    { note: 'G4', dur: '8n' }, { note: 'C5', dur: '4n' },
    { note: 'G4', dur: '8n' }, { note: 'E4', dur: '8n' },
    { note: 'C4', dur: '4n' },
  ];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((m, i) => {
      synth.triggerAttackRelease(m.note, m.dur, time + i * 0.25);
    });
  }, '2n');

  currentBgm.start(0);
  window.Tone.Transport.start();
}

export function playShabondamaBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playShabondamaBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.4 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = ['D5', 'E5', 'F#5', 'A5', 'G5', 'E5', 'D5', 'E5'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.1875);
    });
  }, '3n');

  currentBgm.start(0);
  window.Tone.Transport.start();
}

export function playKudamonoCatchBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playKudamonoCatchBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.4, release: 0.3 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = ['C5', 'D5', 'E5', 'F5', 'G5', 'F5', 'E5', 'D5'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.125);
    });
  }, '2n');

  currentBgm.start(0);
  window.Tone.Transport.start();
}

export function playMeiroBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playMeiroBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = ['G4', 'B4', 'D5', 'B4', 'G4', 'A4', 'C5', 'A4'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '8n', time + i * 0.25);
    });
  }, '2n');

  currentBgm.start(0);
  window.Tone.Transport.start();
}

export function playDoubutsuPuzzleBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playDoubutsuPuzzleBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.35, release: 0.5 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = ['E4', 'G4', 'B4', 'G4', 'E4', 'F#4', 'A4', 'F#4'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '8n', time + i * 0.25);
    });
  }, '2n');

  currentBgm.start(0);
  window.Tone.Transport.start();
}

export function playKazuAsobiBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playKazuAsobiBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0.3, release: 0.4 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = ['C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'C5', 'D5'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.125);
    });
  }, '2n');

  currentBgm.start(0);
  window.Tone.Transport.start();
}

export function playAnimalSoccerBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playAnimalSoccerBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.3 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = ['G4', 'B4', 'D5', 'G5', 'D5', 'B4', 'G4', 'A4'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.125);
    });
  }, '2n');

  currentBgm.start(0);
  window.Tone.Transport.start();
}

export function playJewelryShopBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playJewelryShopBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.4 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = ['D5', 'F#5', 'A5', 'F#5', 'D5', 'E5', 'G5', 'E5'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.15);
    });
  }, '2n');

  currentBgm.start(0);
  window.Tone.Transport.start();
}

export function playSushiBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playSushiBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = [
    ['C4', '8n'], ['E4', '8n'], ['G4', '8n'], ['C5', '8n'],
    ['G4', '8n'], ['E4', '8n'], ['C4', '8n'], ['E4', '8n'],
  ];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((m, i) => {
      synth.triggerAttackRelease(m[0], m[1], time + i * 0.25);
    });
  }, '2n');

  currentBgm.start(0);
  window.Tone.Transport.start();
}

export function playIchigoBgm() {
  if (!canPlayAudio()) return;
  stopAllBgm();
  console.log('[Audio] playIchigoBgm');

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.6 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const melody = [
    ['D4', '8n'], ['F4', '8n'], ['A4', '8n'], ['D5', '8n'],
    ['A4', '8n'], ['F4', '8n'], ['D4', '8n'], ['F4', '8n'],
  ];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((m, i) => {
      synth.triggerAttackRelease(m[0], m[1], time + i * 0.25);
    });
  }, '2n');

  currentBgm.start(0);
  window.Tone.Transport.start();
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
  synth.volume.value = SE_VOLUME - 2;

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
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME - 1;

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

// ゴール・ポン音
export function playSoundPop() {
  if (!canPlayAudio()) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME;

  synth.triggerAttackRelease('A4', '16n');
  setTimeout(() => { try { synth.dispose(); } catch (_) {} }, 200);
}
