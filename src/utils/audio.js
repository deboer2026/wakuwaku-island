// Audio system using Tone.js
// BGM and sound effects for all games

let audioInitialized = false;
let isMuted = false;
let currentBgm = null;
let bgmSynth = null;
let bassSynth = null;

const VOLUME = -14; // dB (低めに設定)
const SE_VOLUME = -12; // Sound effect volume

// Initialize Tone.js (needs user interaction first)
export async function initAudio() {
  if (audioInitialized) return;
  try {
    await window.Tone.start();
    audioInitialized = true;
  } catch (e) {
    console.log('Audio init deferred (waiting for user interaction)');
  }
}

// Ensure audio context started on first click
export function ensureAudioStarted() {
  if (window.Tone?.context?.state === 'suspended') {
    window.Tone.context.resume();
  }
  if (!audioInitialized) {
    audioInitialized = true;
  }
}

// Mute toggle
export function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    stopAllBgm();
  }
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}

// Stop all BGM
function stopAllBgm() {
  if (currentBgm) {
    currentBgm.stop();
    currentBgm.dispose();
    currentBgm = null;
  }
  if (bgmSynth) {
    bgmSynth.triggerRelease();
    bgmSynth.dispose();
    bgmSynth = null;
  }
  if (bassSynth) {
    bassSynth.triggerRelease();
    bassSynth.dispose();
    bassSynth = null;
  }
}

// ===== BGM パターン =====

export function playTopPageBgm() {
  if (isMuted || !audioInitialized) return;
  stopAllBgm();

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 },
  }).toDestination();
  synth.volume.value = VOLUME;

  const now = window.Tone.now();
  // メロディ：C major pentatonic scale
  const melody = [
    { note: 'C4', dur: '8n' },
    { note: 'E4', dur: '8n' },
    { note: 'G4', dur: '8n' },
    { note: 'C5', dur: '4n' },
    { note: 'G4', dur: '8n' },
    { note: 'E4', dur: '8n' },
    { note: 'C4', dur: '4n' },
  ];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((m, i) => {
      const offset = i * 0.25;
      synth.triggerAttackRelease(m.note, m.dur, time + offset);
    });
  }, '2n');

  currentBgm.start(0);
}

export function playShabondamaBgm() {
  if (isMuted || !audioInitialized) return;
  stopAllBgm();

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.4 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // ふわふわ軽やかなメロディ
  const melody = [
    'D5', 'E5', 'F#5', 'A5', 'G5', 'E5', 'D5', 'E5',
  ];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.1875);
    });
  }, '3n');

  currentBgm.start(0);
}

export function playKudamonoCatchBgm() {
  if (isMuted || !audioInitialized) return;
  stopAllBgm();

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.4, release: 0.3 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // 楽しくテンポよい
  const melody = ['C5', 'D5', 'E5', 'F5', 'G5', 'F5', 'E5', 'D5'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.125);
    });
  }, '2n');

  currentBgm.start(0);
}

export function playMeiroBgm() {
  if (isMuted || !audioInitialized) return;
  stopAllBgm();

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // ドキドキ探検風
  const melody = ['G4', 'B4', 'D5', 'B4', 'G4', 'A4', 'C5', 'A4'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '8n', time + i * 0.25);
    });
  }, '2n');

  currentBgm.start(0);
}

export function playDoubutsuPuzzleBgm() {
  if (isMuted || !audioInitialized) return;
  stopAllBgm();

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.35, release: 0.5 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // 落ち着いたかわいい
  const melody = ['E4', 'G4', 'B4', 'G4', 'E4', 'F#4', 'A4', 'F#4'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '8n', time + i * 0.25);
    });
  }, '2n');

  currentBgm.start(0);
}

export function playKazuAsobiBgm() {
  if (isMuted || !audioInitialized) return;
  stopAllBgm();

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0.3, release: 0.4 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // 明るく元気
  const melody = ['C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'C5', 'D5'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.125);
    });
  }, '2n');

  currentBgm.start(0);
}

export function playAnimalSoccerBgm() {
  if (isMuted || !audioInitialized) return;
  stopAllBgm();

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.3 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // 元気でスポーティ
  const melody = ['G4', 'B4', 'D5', 'G5', 'D5', 'B4', 'G4', 'A4'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.125);
    });
  }, '2n');

  currentBgm.start(0);
}

export function playJewelryShopBgm() {
  if (isMuted || !audioInitialized) return;
  stopAllBgm();

  const synth = new window.Tone.PolySynth(window.Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.4 },
  }).toDestination();
  synth.volume.value = VOLUME;

  // きらきらかわいい
  const melody = ['D5', 'F#5', 'A5', 'F#5', 'D5', 'E5', 'G5', 'E5'];

  currentBgm = new window.Tone.Loop((time) => {
    melody.forEach((note, i) => {
      synth.triggerAttackRelease(note, '16n', time + i * 0.15);
    });
  }, '2n');

  currentBgm.start(0);
}

// Stop BGM
export function stopBgm() {
  stopAllBgm();
}

// ===== Sound Effects =====

// 正解・上昇音
export function playSoundCorrect() {
  if (isMuted || !audioInitialized) return;
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
  setTimeout(() => synth.dispose(), 500);
}

// 不正解・ブブー音
export function playSoundWrong() {
  if (isMuted || !audioInitialized) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME - 2;

  const now = window.Tone.now();
  synth.triggerAttackRelease('G3', '32n', now);
  synth.triggerAttackRelease('F#3', '32n', now + 0.08);
  synth.triggerAttackRelease('G3', '32n', now + 0.16);
  setTimeout(() => synth.dispose(), 400);
}

// クリア・ファンファーレ
export function playSoundClear() {
  if (isMuted || !audioInitialized) return;
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
  setTimeout(() => synth.dispose(), 800);
}

// ダメージ音
export function playSoundDamage() {
  if (isMuted || !audioInitialized) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.25, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME;

  const now = window.Tone.now();
  synth.triggerAttackRelease('G3', '32n', now);
  synth.triggerAttackRelease('F3', '32n', now + 0.1);
  setTimeout(() => synth.dispose(), 400);
}

// ゴール・ポン音
export function playSoundPop() {
  if (isMuted || !audioInitialized) return;
  const synth = new window.Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0 },
  }).toDestination();
  synth.volume.value = SE_VOLUME;

  synth.triggerAttackRelease('A4', '16n');
  setTimeout(() => synth.dispose(), 200);
}
