import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playMeiroBgm, stopBgm, playSoundCorrect, playSoundClear, ensureAudioStarted, toggleMute, getMuteState } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import { addCoins } from '../utils/coins';
import './Meiro.css';

const COLS = 11, ROWS = 11;
const GALLERY_CHARS = ['👸','🤴','👑','🦁','🐨','🦝','🐮','🐷','🐔','🐦','🦄','🐯','🐺','🦋','🐝','🦀','🐙','🐭','🐹','🦕','🐳','🦭'];
const CHARACTERS = [
  { emoji: '🐱', name: 'ねこ',    nameEn: 'Cat'     },
  { emoji: '🐰', name: 'うさぎ',  nameEn: 'Bunny'   },
  { emoji: '🐸', name: 'かえる',  nameEn: 'Frog'    },
  { emoji: '🐼', name: 'パンダ',  nameEn: 'Panda'   },
  { emoji: '🦊', name: 'きつね',  nameEn: 'Fox'     },
  { emoji: '🐧', name: 'ペンギン', nameEn: 'Penguin' },
];
const HUD_H = 56;
const DPAD_H = 0; // no dpad, tap-on-canvas control
const MAX_HP = 3;

function getHi() { return parseFloat(localStorage.getItem('maze_best') || '0'); }
function saveHi(v) { localStorage.setItem('maze_best', String(v)); }
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

export default function Meiro() {
  const navigate = useNavigate();

  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [screen, setScreen] = useState('title');
  const [hpDisplay, setHpDisplay] = useState(MAX_HP);
  const [timeDisplay, setTimeDisplay] = useState(0);
  const [hiScore, setHiScore] = useState(getHi());
  const [resultData, setResultData] = useState({ title: '', msg: '', hiText: '', isNew: false });
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [muted, setMuted] = useState(() => getMuteState());

  const mazeCanvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const wrapRef = useRef(null);

  const W = useRef(0);
  const H = useRef(0);
  const mazeRef = useRef([]);
  const playerRef = useRef({ r: 1, c: 1 });
  const enemiesRef = useRef([]);
  const hpRef = useRef(MAX_HP);
  const invincibleRef = useRef(false);
  const invTRef = useRef(0);
  const timeRef = useRef(0);
  const runningRef = useRef(false);
  const bgAnimRef = useRef(null);
  const mazeAnimRef = useRef(null);
  const timerIntRef = useRef(null);
  const frameRef = useRef(0);
  const galleryRef = useRef([]);
  const charRef = useRef(CHARACTERS[0]);
  const cellRef = useRef(32);
  const OXRef = useRef(0);
  const OYRef = useRef(0);
  const gameOverScheduledRef = useRef(false);
  const triggerGameOverRef = useRef(null);
  const triggerClearRef = useRef(null);

  const getCtx = (ref) => ref.current ? ref.current.getContext('2d') : null;

  // ---- Maze generation ----
  const genMaze = useCallback(() => {
    const m = [];
    for (let r = 0; r < ROWS; r++) { m[r] = []; for (let c = 0; c < COLS; c++) m[r][c] = 1; }
    function carve(r, c) {
      m[r][c] = 0;
      const dirs = [[0,2],[0,-2],[2,0],[-2,0]].sort(() => Math.random()-0.5);
      for (const [dr, dc] of dirs) {
        const nr = r+dr, nc = c+dc;
        if (nr > 0 && nr < ROWS-1 && nc > 0 && nc < COLS-1 && m[nr][nc] === 1) {
          m[r+dr/2][c+dc/2] = 0;
          carve(nr, nc);
        }
      }
    }
    carve(1, 1);
    mazeRef.current = m;
  }, []);

  // ---- Enemy generation ----
  const genEnemies = useCallback(() => {
    const m = mazeRef.current;
    const count = 3 + Math.floor(Math.random()*2);
    const enemies = [];
    let attempts = 0;
    while (enemies.length < count && attempts < 200) {
      attempts++;
      const r = 1 + Math.floor(Math.random()*(ROWS-2));
      const c = 1 + Math.floor(Math.random()*(COLS-2));
      if (m[r][c] !== 0) continue;
      if (r === 1 && c === 1) continue;
      if (r === ROWS-2 && c === COLS-2) continue;
      if (r < 3 && c < 3) continue;
      const horiz = Math.random() < 0.5;
      const range = 1 + Math.floor(Math.random()*2);
      enemies.push({ baseR: r, baseC: c, horiz, range, speed: 0.008 + Math.random()*0.006, t: Math.random()*Math.PI*2 });
    }
    enemiesRef.current = enemies;
  }, []);

  // ---- Cell sizing ----
  const computeLayout = useCallback(() => {
    const w = W.current, h = H.current;
    const availW = w - 32;
    const availH = h - HUD_H - 40; // 40 for bottom hint
    const cell = Math.floor(Math.min(availW / COLS, availH / ROWS));
    cellRef.current = cell;
    const mazeW = cell * COLS;
    const mazeH = cell * ROWS;
    OXRef.current = Math.floor((w - mazeW) / 2);
    OYRef.current = HUD_H + Math.floor((availH - mazeH) / 2) + 8;
  }, []);

  // ---- Gallery build ----
  const buildGallery = useCallback(() => {
    const w = W.current, h = H.current;
    const g = [];
    for (let i = 0; i < 6; i++) {
      g.push({ emoji: GALLERY_CHARS[i % GALLERY_CHARS.length], x: w*0.04, y: h*0.15+i*h*0.13, size: w*0.07, phase: i*1.2, speed: 1.3+i*0.25 });
      g.push({ emoji: GALLERY_CHARS[(i+8) % GALLERY_CHARS.length], x: w*0.96, y: h*0.15+i*h*0.13, size: w*0.07, phase: i*1.7, speed: 1.5+i*0.2 });
    }
    galleryRef.current = g;
  }, []);

  // ---- Enemy floating position ----
  const enemyPos = (e) => {
    const fr = e.baseR + (e.horiz ? 0 : Math.sin(e.t * Math.PI * 2) * e.range);
    const fc = e.baseC + (e.horiz ? Math.sin(e.t * Math.PI * 2) * e.range : 0);
    return { fr, fc };
  };

  // ---- Draw background canvas ----
  const drawBg = useCallback(() => {
    const ctx = getCtx(bgCanvasRef);
    if (!ctx) return;
    const w = W.current, h = H.current;
    ctx.fillStyle = '#e8eaf6';
    ctx.fillRect(0, 0, w, h);
    // subtle grid pattern
    ctx.strokeStyle = 'rgba(63,81,181,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 28) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y < h; y += 28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    // gallery
    const t = frameRef.current;
    for (const g of galleryRef.current) {
      const bob = Math.sin(t * g.speed * 0.04 + g.phase) * 5;
      ctx.font = `${g.size}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.55;
      ctx.fillText(g.emoji, g.x, g.y + bob);
    }
    ctx.globalAlpha = 1;
  }, []);

  // ---- Draw maze canvas ----
  const drawMaze = useCallback(() => {
    const ctx = getCtx(mazeCanvasRef);
    if (!ctx) return;
    const w = W.current, h = H.current;
    ctx.clearRect(0, 0, w, h);

    const cell = cellRef.current;
    const OX = OXRef.current, OY = OYRef.current;
    const mazeW = cell * COLS, mazeH = cell * ROWS;

    // Panel background
    ctx.save();
    ctx.shadowColor = 'rgba(63,81,181,0.25)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#fff';
    const pad = 6;
    roundRect(ctx, OX-pad, OY-pad, mazeW+pad*2, mazeH+pad*2, 12);
    ctx.fill();
    ctx.restore();

    const m = mazeRef.current;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = OX + c*cell, y = OY + r*cell;
        if (m[r][c] === 1) {
          ctx.fillStyle = '#3f51b5';
          ctx.fillRect(x+1, y+1, cell-2, cell-2);
        } else {
          // path
          ctx.fillStyle = r===1&&c===1 ? '#bbdefb' : '#f5f5f5';
          ctx.fillRect(x, y, cell, cell);
        }
      }
    }

    // Goal
    const gx = OX + (COLS-2)*cell + cell/2;
    const gy = OY + (ROWS-2)*cell + cell/2;
    ctx.font = `${cell*0.8}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🏁', gx, gy);

    // Enemies
    for (const e of enemiesRef.current) {
      e.t += e.speed;
      const { fr, fc } = enemyPos(e);
      const ex = OX + fc*cell + cell/2;
      const ey = OY + fr*cell + cell/2;
      ctx.font = `${cell*0.8}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('👾', ex, ey);
    }

    // Player
    const p = playerRef.current;
    const px = OX + p.c*cell + cell/2;
    const py = OY + p.r*cell + cell/2;
    const blink = invincibleRef.current && Math.floor(frameRef.current / 6) % 2 === 0;
    if (!blink) {
      ctx.font = `${cell*0.82}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = invincibleRef.current ? 0.5 : 1;
      ctx.fillText(charRef.current.emoji, px, py);
      ctx.globalAlpha = 1;
    }
  }, []);

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }

  // ---- Invincibility update ----
  const updateInvincible = useCallback(() => {
    if (invincibleRef.current) {
      invTRef.current++;
      if (invTRef.current >= 60) { // ~1 second at 60fps
        invincibleRef.current = false;
        invTRef.current = 0;
      }
    }
  }, []);

  // ---- Enemy collision ----
  const checkEnemyCollision = useCallback(() => {
    if (invincibleRef.current || gameOverScheduledRef.current) return;
    const p = playerRef.current;
    const cell = cellRef.current;
    const OX = OXRef.current, OY = OYRef.current;
    const px = OX + p.c*cell + cell/2;
    const py = OY + p.r*cell + cell/2;
    for (const e of enemiesRef.current) {
      const { fr, fc } = enemyPos(e);
      const ex = OX + fc*cell + cell/2;
      const ey = OY + fr*cell + cell/2;
      const dist = Math.hypot(ex-px, ey-py);
      if (dist < cell*0.7) {
        hpRef.current--;
        setHpDisplay(hpRef.current);
        invincibleRef.current = true;
        invTRef.current = 0;
        if (hpRef.current <= 0 && !gameOverScheduledRef.current) {
          gameOverScheduledRef.current = true;
          setTimeout(() => triggerGameOverRef.current && triggerGameOverRef.current(), 600);
        }
        break;
      }
    }
  }, []);

  // ---- Game over / clear ---- (defined after hooks, used via ref trick)
  const triggerClear = useCallback(() => {
    runningRef.current = false;
    if (timerIntRef.current) { clearInterval(timerIntRef.current); timerIntRef.current = null; }
    if (mazeAnimRef.current) { cancelAnimationFrame(mazeAnimRef.current); mazeAnimRef.current = null; }
    stopBgm();
    playSoundCorrect();
    const t = timeRef.current;
    const hi = getHi();
    const isNew = hi === 0 || t < hi;
    if (isNew) {
      saveHi(t);
      trackNewHighScore('Meiro', t);
      addCoins(10);
    }
    trackGameClear('Meiro', t, 1);
    addCoins(5);
    setHiScore(isNew ? t : hi);
    const title = isNew
      ? (lang === 'en' ? '🏆 Best Time!' : '🏆 ベストタイム こうしん！')
      : (lang === 'en' ? 'Clear! 🏁' : 'クリア！🏁');
    const hiText = lang === 'en' ? `Best: ${fmtTime(isNew ? t : hi)}` : `ベスト: ${fmtTime(isNew ? t : hi)}`;
    const msg    = lang === 'en' ? `Time: ${fmtTime(t)}` : `タイム: ${fmtTime(t)}`;
    setResultData({ title, msg, hiText, isNew });
    setScreen('result');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const triggerGameOver = useCallback(() => {
    runningRef.current = false;
    if (timerIntRef.current) { clearInterval(timerIntRef.current); timerIntRef.current = null; }
    if (mazeAnimRef.current) { cancelAnimationFrame(mazeAnimRef.current); mazeAnimRef.current = null; }
    stopBgm();
    trackGameOver('Meiro', timeRef.current);
    const hi = getHi();
    setResultData({
      title: lang === 'en' ? 'Game Over 😢' : 'ゲームオーバー 😢',
      msg:   lang === 'en' ? 'Keep challenging!' : 'もういちどチャレンジ！',
      hiText: hi > 0 ? (lang === 'en' ? `Best: ${fmtTime(hi)}` : `ベスト: ${fmtTime(hi)}`) : '',
      isNew: false,
    });
    setScreen('result');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep refs in sync so closures defined before these functions can call them
  useEffect(() => { triggerClearRef.current = triggerClear; }, [triggerClear]);
  useEffect(() => { triggerGameOverRef.current = triggerGameOver; }, [triggerGameOver]);

  // ---- Move player ----
  const movePlayer = useCallback((dr, dc) => {
    if (!runningRef.current) return;
    const p = playerRef.current;
    const m = mazeRef.current;
    const nr = p.r + dr, nc = p.c + dc;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
    if (m[nr][nc] !== 0) return;
    playerRef.current = { r: nr, c: nc };
    // check goal
    if (nr === ROWS-2 && nc === COLS-2) {
      if (triggerClearRef.current) triggerClearRef.current();
    }
  }, []);

  // ---- Tap to move ----
  const onMazeTap = useCallback((cx, cy) => {
    if (!runningRef.current) return;
    const cell = cellRef.current;
    const OX = OXRef.current, OY = OYRef.current;
    const p = playerRef.current;
    const ppx = OX + p.c*cell + cell/2;
    const ppy = OY + p.r*cell + cell/2;
    const dx = cx - ppx, dy = cy - ppy;
    if (Math.hypot(dx, dy) < cell*0.3) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      movePlayer(0, dx > 0 ? 1 : -1);
    } else {
      movePlayer(dy > 0 ? 1 : -1, 0);
    }
  }, [movePlayer]);

  // ---- Keyboard handler ----
  useEffect(() => {
    if (screen !== 'game') return;
    const onKey = (e) => {
      if (e.key === 'ArrowUp')    { e.preventDefault(); movePlayer(-1, 0); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); movePlayer(1, 0); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); movePlayer(0, -1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); movePlayer(0, 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, movePlayer]);

  // ---- Canvas click ----
  const handleCanvasClick = useCallback((e) => {
    const canvas = mazeCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    onMazeTap(cx, cy);
  }, [onMazeTap]);

  const handleCanvasTouch = useCallback((e) => {
    e.preventDefault();
    const canvas = mazeCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const cx = touch.clientX - rect.left;
    const cy = touch.clientY - rect.top;
    onMazeTap(cx, cy);
  }, [onMazeTap]);

  // ---- Game loop ----
  const mazeLoop = useCallback(() => {
    frameRef.current++;
    updateInvincible();
    checkEnemyCollision();
    drawMaze();
    mazeAnimRef.current = requestAnimationFrame(mazeLoop);
  }, [updateInvincible, checkEnemyCollision, drawMaze]);

  const bgLoop = useCallback(() => {
    drawBg();
    bgAnimRef.current = requestAnimationFrame(bgLoop);
  }, [drawBg]);

  // ---- Start game ----
  const startGame = useCallback(async (char) => {
    trackGameStart('Meiro');
    await ensureAudioStarted();
    console.log('[Game] Meiro: audio ready, playing BGM');
    playMeiroBgm();
    addCoins(1);

    charRef.current = char;
    hpRef.current = MAX_HP;
    invincibleRef.current = false;
    invTRef.current = 0;
    timeRef.current = 0;
    runningRef.current = true;
    gameOverScheduledRef.current = false;
    playerRef.current = { r: 1, c: 1 };
    setHpDisplay(MAX_HP);
    setTimeDisplay(0);
    genMaze();
    genEnemies();
    setScreen('game');
  }, [genMaze, genEnemies]);

  // ---- Setup canvases when entering game ----
  useEffect(() => {
    if (screen !== 'game') {
      if (mazeAnimRef.current) { cancelAnimationFrame(mazeAnimRef.current); mazeAnimRef.current = null; }
      if (bgAnimRef.current) { cancelAnimationFrame(bgAnimRef.current); bgAnimRef.current = null; }
      if (timerIntRef.current) { clearInterval(timerIntRef.current); timerIntRef.current = null; }
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    W.current = rect.width;
    H.current = rect.height;

    [bgCanvasRef, mazeCanvasRef].forEach(ref => {
      if (ref.current) { ref.current.width = W.current; ref.current.height = H.current; }
    });

    computeLayout();
    buildGallery();

    if (bgAnimRef.current) cancelAnimationFrame(bgAnimRef.current);
    bgAnimRef.current = requestAnimationFrame(bgLoop);

    if (mazeAnimRef.current) cancelAnimationFrame(mazeAnimRef.current);
    mazeAnimRef.current = requestAnimationFrame(mazeLoop);

    // timer
    if (timerIntRef.current) clearInterval(timerIntRef.current);
    timerIntRef.current = setInterval(() => {
      if (!runningRef.current) return;
      timeRef.current++;
      setTimeDisplay(timeRef.current);
    }, 1000);

    return () => {
      if (mazeAnimRef.current) { cancelAnimationFrame(mazeAnimRef.current); mazeAnimRef.current = null; }
      if (bgAnimRef.current) { cancelAnimationFrame(bgAnimRef.current); bgAnimRef.current = null; }
      if (timerIntRef.current) { clearInterval(timerIntRef.current); timerIntRef.current = null; }
    };
  }, [screen, bgLoop, mazeLoop, computeLayout, buildGallery]);

  // ---- Resize ----
  useEffect(() => {
    const onResize = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      W.current = rect.width;
      H.current = rect.height;
      [bgCanvasRef, mazeCanvasRef].forEach(ref => {
        if (ref.current) { ref.current.width = W.current; ref.current.height = H.current; }
      });
      computeLayout();
      buildGallery();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [computeLayout, buildGallery]);

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      if (mazeAnimRef.current) cancelAnimationFrame(mazeAnimRef.current);
      if (bgAnimRef.current) cancelAnimationFrame(bgAnimRef.current);
      if (timerIntRef.current) clearInterval(timerIntRef.current);
      stopBgm();
    };
  }, []);

  // ---- Title screen ----
  if (screen === 'title') {
    return (
      <div className="meiro-wrap meiro-title">
        <div className="meiro-title-box">
          <div className="meiro-title-emoji">🗺️</div>
          <h1 className="meiro-title-text">{lang === 'en' ? 'Maze Adventure!' : 'めいろあそび'}</h1>
          <p className="meiro-subtitle">{lang === 'en' ? 'Find your way through the maze!' : 'めいろをぬけてゴールしよう！'}</p>
          <div className="meiro-title-rules">
            <div>{lang === 'en' ? '👆 Tap or use keyboard to move' : '👆 タップ or キーボードで うごく'}</div>
            <div>{lang === 'en' ? '👾 Hitting enemies loses ❤️' : '👾 てきにあたると ❤️ がへる'}</div>
            <div>{lang === 'en' ? '🏁 Reach the goal!' : '🏁 ゴールに たどりつこう！'}</div>
          </div>
          <div className="meiro-char-grid">
            {CHARACTERS.map(ch => (
              <button
                key={ch.emoji}
                className={`meiro-char-btn ${selectedChar.emoji === ch.emoji ? 'selected' : ''}`}
                onClick={() => setSelectedChar(ch)}
              >
                <span className="meiro-char-emoji">{ch.emoji}</span>
                <span className="meiro-char-name">{lang === 'en' ? ch.nameEn : ch.name}</span>
              </button>
            ))}
          </div>
          <button className="meiro-start-btn" onClick={() => startGame(selectedChar)}>{lang === 'en' ? '🗺️ Start!' : '🗺️ はじめる！'}</button>
          {hiScore > 0 && <div className="meiro-hi">{lang === 'en' ? `Best: ${fmtTime(hiScore)}` : `ベストタイム: ${fmtTime(hiScore)}`}</div>}
          <button className="ww-back-btn" onClick={() => navigate('/')}>{lang === 'en' ? '🏝️ Back to Top' : '🏝️ トップへもどる'}</button>
        </div>
      </div>
    );
  }

  // ---- Result screen ----
  if (screen === 'result') {
    return (
      <div className="meiro-wrap meiro-result">
        <div className="meiro-result-box">
          <div className="meiro-result-title">{resultData.title}</div>
          <div className="meiro-result-msg">{resultData.msg}</div>
          {resultData.isNew && <div className="meiro-result-new">🌟 {lang === 'en' ? 'New Record!' : '新記録！'}</div>}
          {resultData.hiText && <div className="meiro-result-hi">{resultData.hiText}</div>}
          <div className="meiro-result-btns">
            <button className="meiro-start-btn" onClick={() => startGame(charRef.current)}>{lang === 'en' ? 'Play Again' : 'もういちど'}</button>
            <button className="meiro-back-btn2" onClick={() => setScreen('title')}>{lang === 'en' ? 'Characters' : 'キャラ選択'}</button>
            <button className="meiro-back-btn2" onClick={() => navigate('/')}>{lang === 'en' ? 'Back' : 'もどる'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Game screen ----
  const hpHearts = Array.from({ length: MAX_HP }, (_, i) => i < hpDisplay ? '❤️' : '🖤');

  return (
    <div className="meiro-wrap" ref={wrapRef}>
      {/* Background canvas */}
      <canvas ref={bgCanvasRef} className="meiro-canvas-bg" />
      {/* HUD */}
      <div className="meiro-hud">
        {/* LEFT */}
        <button className="meiro-hud-back" onClick={() => {
          runningRef.current = false;
          if (timerIntRef.current) clearInterval(timerIntRef.current);
          if (mazeAnimRef.current) cancelAnimationFrame(mazeAnimRef.current);
          if (bgAnimRef.current) cancelAnimationFrame(bgAnimRef.current);
          navigate('/');
        }}>🏠</button>
        {/* CENTER */}
        <div className="meiro-hud-center">
          <div className="meiro-hud-title">{lang === 'en' ? '🗺️ Maze Play' : '🗺️ めいろあそび'}</div>
          <div className="meiro-hud-score">{lang === 'en' ? 'Time' : 'じかん'}: {fmtTime(timeDisplay)}</div>
        </div>
        {/* RIGHT */}
        <div className="meiro-hud-box">
          <div className="meiro-hud-label">{lang === 'en' ? 'Lives' : 'ライフ'}</div>
          <div className="meiro-hud-val">{hpHearts.join('')}</div>
        </div>
        <button onClick={() => { const m = toggleMute(); setMuted(m); if (!m) playMeiroBgm(); }}
          style={{ fontSize:20, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:10, padding:'4px 8px', cursor:'pointer', flexShrink:0 }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
      {/* Maze canvas (interactive) */}
      <canvas
        ref={mazeCanvasRef}
        className="meiro-canvas-maze"
        onClick={handleCanvasClick}
        onTouchEnd={handleCanvasTouch}
      />
      {/* Tap hint */}
      <div className="meiro-hint">👆 いきたい ほうこうを タップ！</div>
    </div>
  );
}
