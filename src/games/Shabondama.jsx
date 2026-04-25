import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playShabondamaBgm, stopBgm, playSoundCorrect, playSoundClear, ensureAudioStarted } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import './Shabondama.css';

const GALLERY_CHARS = ['👸','🤴','👑','🦁','🐨','🦝','🐮','🐷','🐔','🐦','🦄','🐯','🐺','🦋','🐝','🦀','🐙','🐭','🐹'];
const TRAP_ANIMALS = ['🐱','🐶','🐸','🐼','🦊','🐰','🐧','🐻'];
const BUBBLE_COLS = [
  ['rgba(180,220,255,0.45)','#74b9ff'],
  ['rgba(255,200,230,0.45)','#fd79a8'],
  ['rgba(200,255,220,0.45)','#55efc4'],
  ['rgba(255,230,180,0.45)','#fdcb6e'],
  ['rgba(220,200,255,0.45)','#a29bfe'],
  ['rgba(255,210,210,0.45)','#ff7675'],
];

function getHi() { return parseInt(localStorage.getItem('shabondama_hi') || '0'); }
function saveHi(v) { localStorage.setItem('shabondama_hi', String(v)); }

export default function Shabondama() {
  const navigate = useNavigate();

  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');

  // UI screen state: 'title' | 'game' | 'result'
  const [screen, setScreen] = useState('title');
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState(30);
  const [hiScore, setHiScore] = useState(getHi());
  const [resultData, setResultData] = useState({ title: '', msg: '', hiText: '', isNew: false });

  // Refs for canvas and wrap
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  // Mutable game state refs
  const W = useRef(0);
  const H = useRef(0);
  const bubblesRef = useRef([]);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(30);
  const runningRef = useRef(false);
  const penaltyRef = useRef(0);
  const galleryRef = useRef([]);
  const animIdRef = useRef(null);
  const timerIntRef = useRef(null);
  const spawnTimeoutRef = useRef(null);

  // Title screen animation refs
  const titleBubblesRef = useRef([]);
  const titleAnimIdRef = useRef(null);

  // ---------- helpers ----------
  const getCtx = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  const buildGallery = useCallback(() => {
    const w = W.current, h = H.current;
    const g = [];
    for (let i = 0; i < 5; i++) g.push({ emoji: GALLERY_CHARS[i % GALLERY_CHARS.length], x: w*0.03+(i%2)*w*0.06, y: h*0.12+i*h*0.1, size: w*0.07, phase: i*1.1, speed: 1.5+i*0.3 });
    for (let i = 0; i < 5; i++) g.push({ emoji: GALLERY_CHARS[(i+6) % GALLERY_CHARS.length], x: w*0.97-(i%2)*w*0.06, y: h*0.12+i*h*0.1, size: w*0.07, phase: i*1.4, speed: 1.8+i*0.2 });
    const topChars = ['👸','🤴','👑','🎉','⭐'];
    topChars.forEach((e, i) => g.push({ emoji: e, x: w*(0.15+i*0.18), y: h*0.06, size: w*0.065, phase: i*0.8, speed: 2 }));
    const botChars = ['🦁','🐘','🦊','🐧','🐸','🐨'];
    botChars.forEach((e, i) => g.push({ emoji: e, x: w*(0.1+i*0.16), y: h*0.94, size: w*0.065, phase: i*0.6, speed: 1.6 }));
    galleryRef.current = g;
  }, []);

  const resize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    W.current = wrap.clientWidth;
    H.current = wrap.clientHeight;
    canvas.width = W.current;
    canvas.height = H.current;
    buildGallery();
  }, [buildGallery]);

  // ---------- draw helpers ----------
  const drawClouds = useCallback((ctx) => {
    const w = W.current, h = H.current;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    [[w*0.1, h*0.15, 60], [w*0.75, h*0.1, 48], [w*0.45, h*0.08, 40]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+r*0.6, cy+4, r*0.7, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx-r*0.6, cy+6, r*0.6, 0, Math.PI*2); ctx.fill();
    });
  }, []);

  const drawGallery = useCallback((ctx) => {
    const t = performance.now() / 1000;
    galleryRef.current.forEach(g => {
      const bob = Math.sin(t * g.speed + g.phase) * 5;
      ctx.font = `${Math.round(g.size)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.emoji, g.x, g.y + bob);
    });
  }, []);

  const drawBubble = useCallback((ctx, b) => {
    if (!b.alive) return;
    ctx.save();
    let ox = 0;
    if (b.shaking) ox = Math.sin(b.shakeT * 6) * 8;
    if (b.popping) {
      ctx.globalAlpha = b.popAlpha;
      ctx.translate(b.x + ox, b.y);
      ctx.scale(b.popScale, b.popScale);
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI*2);
      ctx.strokeStyle = b.col[1]; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.translate(b.x + ox, b.y);
    if (b.isTrap) {
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,240,200,0.85)'; ctx.fill();
      ctx.strokeStyle = '#ff9966'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,80,80,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-b.r*0.5, -b.r*0.5); ctx.lineTo(b.r*0.5, b.r*0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b.r*0.5, -b.r*0.5); ctx.lineTo(-b.r*0.5, b.r*0.5); ctx.stroke();
      ctx.font = `${Math.round(b.r*1.2)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.animal, 0, 0);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI*2);
      ctx.fillStyle = b.col[0]; ctx.fill();
      ctx.strokeStyle = b.col[1]; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-b.r*0.3, -b.r*0.32, b.r*0.22, b.r*0.13, -0.4, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(b.r*0.18, b.r*0.2, b.r*0.09, b.r*0.06, 0, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
      const pts = b.r > 40 ? 1 : b.r > 28 ? 2 : 3;
      ctx.font = `bold ${Math.round(b.r*0.5)}px sans-serif`;
      ctx.fillStyle = pts === 3 ? '#a29bfe' : pts === 2 ? '#74b9ff' : 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+' + pts, 0, b.r*0.15);
    }
    ctx.restore();
  }, []);

  // ---------- pop label ----------
  const showPop = useCallback((x, y, text, color, size) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'sdm-pop-label';
    el.textContent = text;
    el.style.color = color;
    el.style.fontSize = size + 'px';
    el.style.left = (x - 50) + 'px';
    el.style.top = (y - 30) + 'px';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }, []);

  // ---------- bubble factory ----------
  const mkBubble = useCallback(() => {
    const w = W.current, h = H.current;
    const isTrap = Math.random() < 0.18;
    const r = isTrap ? 28 + Math.random()*18 : 20 + Math.random()*32;
    const col = BUBBLE_COLS[Math.floor(Math.random() * BUBBLE_COLS.length)];
    return {
      x: r + Math.random() * (w - r*2),
      y: h + r,
      r, vx: (Math.random() - 0.5) * 0.8,
      vy: -(0.8 + Math.random() * 1.4),
      wobble: Math.random() * Math.PI * 2,
      col, isTrap,
      animal: isTrap ? TRAP_ANIMALS[Math.floor(Math.random() * TRAP_ANIMALS.length)] : null,
      alive: true, popping: false, popAlpha: 1, popScale: 1,
      shaking: false, shakeT: 0,
    };
  }, []);

  // ---------- spawn loop ----------
  const spawnLoop = useCallback(() => {
    if (!runningRef.current) return;
    const count = bubblesRef.current.filter(b => b.alive && !b.popping).length;
    if (count < 14) bubblesRef.current.push(mkBubble());
    spawnTimeoutRef.current = setTimeout(spawnLoop, 400 + Math.random() * 700);
  }, [mkBubble]);

  // ---------- update ----------
  const update = useCallback(() => {
    const w = W.current, h = H.current;
    bubblesRef.current.forEach(b => {
      if (!b.alive) return;
      if (b.popping) {
        b.popAlpha -= 0.08; b.popScale += 0.08;
        if (b.popAlpha <= 0) b.alive = false;
        return;
      }
      if (b.shaking) {
        b.shakeT += 0.25;
        if (b.shakeT > Math.PI * 3) { b.shaking = false; b.shakeT = 0; }
        return;
      }
      b.wobble += 0.03;
      b.x += b.vx + Math.sin(b.wobble) * 0.4;
      b.y += b.vy;
      if (b.y + b.r < 0) b.alive = false;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); }
      if (b.x > w - b.r) { b.x = w - b.r; b.vx = -Math.abs(b.vx); }
    });
    bubblesRef.current = bubblesRef.current.filter(b => b.alive || b.popping);
  }, []);

  // ---------- draw ----------
  const draw = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const w = W.current, h = H.current;
    ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, w, h);
    drawClouds(ctx); drawGallery(ctx);
    bubblesRef.current.forEach(b => drawBubble(ctx, b));
  }, [drawClouds, drawGallery, drawBubble]);

  // ---------- game loop ----------
  const loop = useCallback(() => {
    if (!runningRef.current) return;
    update(); draw();
    animIdRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  // ---------- tap handler ----------
  const handleTap = useCallback((cx, cy) => {
    if (!runningRef.current) return;
    const bubbles = bubblesRef.current;
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (!b.alive || b.popping || b.shaking) continue;
      const dx = b.x - cx, dy = b.y - cy;
      if (Math.sqrt(dx*dx + dy*dy) < b.r * 1.1) {
        if (b.isTrap) {
          penaltyRef.current++;
          b.shaking = true; b.shakeT = 0;
          scoreRef.current = Math.max(0, scoreRef.current - 2);
          setScoreDisplay(scoreRef.current);
          showPop(b.x, b.y, '🚫 -2', '#ff4444', 20);
        } else {
          playSoundCorrect();
          b.popping = true;
          const pts = b.r > 40 ? 1 : b.r > 28 ? 2 : 3;
          scoreRef.current += pts;
          setScoreDisplay(scoreRef.current);
          showPop(b.x, b.y, pts === 1 ? '+1' : pts === 2 ? '+2 ✨' : '+3 🌟', pts === 1 ? '#74b9ff' : pts === 2 ? '#a29bfe' : '#FFD700', pts === 1 ? 16 : pts === 2 ? 20 : 24);
        }
        break;
      }
    }
  }, [showPop]);

  // ---------- endGame ----------
  const endGame = useCallback(() => {
    runningRef.current = false;
    clearInterval(timerIntRef.current);
    clearTimeout(spawnTimeoutRef.current);
    cancelAnimationFrame(animIdRef.current);
    stopBgm();
    playSoundClear();

    const score = scoreRef.current;
    const hi = getHi();
    const isNew = score > hi;
    if (isNew) {
      saveHi(score);
      trackNewHighScore('Shabondama', score);
    }
    trackGameClear('Shabondama', score, 1);
    setHiScore(isNew ? score : hi);

    let title, msg;
    if (score >= 40) {
      title = '🏆 すごい！';
      msg = `スコア <b style="font-size:28px;color:#FFD700">${score}</b> てん！<br>シャボンだまの<br>チャンピオン！`;
    } else if (score >= 20) {
      title = '⭐ ナイス！';
      msg = `スコア <b style="font-size:28px;color:#FFD700">${score}</b> てん！<br>よくできました！`;
    } else {
      title = '🫧 もういちど';
      msg = `スコア <b style="font-size:28px;color:#FFD700">${score}</b> てん<br>またちょうせん！`;
    }

    const hiText = isNew ? '🏆 ニューレコード！' : `ハイスコア: ${hi}てん`;
    setResultData({ title, msg, hiText, isNew });
    setScreen('result');
  }, []);

  // ---------- startGame ----------
  const startGame = useCallback(async () => {
    trackGameStart('Shabondama');
    await ensureAudioStarted();
    console.log('[Game] Shabondama: audio ready, playing BGM');
    playShabondamaBgm();

    scoreRef.current = 0;
    timeLeftRef.current = 30;
    runningRef.current = true;
    penaltyRef.current = 0;
    bubblesRef.current = [];
    setScoreDisplay(0);
    setTimeDisplay(30);

    // Stop title animation
    cancelAnimationFrame(titleAnimIdRef.current);
    titleBubblesRef.current = [];

    clearInterval(timerIntRef.current);
    clearTimeout(spawnTimeoutRef.current);
    cancelAnimationFrame(animIdRef.current);

    setScreen('game');

    // Seed initial bubbles — use rAF to ensure screen has switched and canvas is visible
    requestAnimationFrame(() => {
      resize();
      for (let i = 0; i < 6; i++) {
        const b = mkBubble();
        b.y = H.current * 0.3 + Math.random() * H.current * 0.5;
        bubblesRef.current.push(b);
      }
      loop();
      spawnLoop();
    });

    timerIntRef.current = setInterval(() => {
      timeLeftRef.current--;
      setTimeDisplay(timeLeftRef.current);
      if (timeLeftRef.current <= 0) endGame();
    }, 1000);
  }, [resize, mkBubble, loop, spawnLoop, endGame]);

  // ---------- goTitle ----------
  const goTitle = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(animIdRef.current);
    clearInterval(timerIntRef.current);
    clearTimeout(spawnTimeoutRef.current);
    setScreen('title');
  }, []);

  // ---------- title loop ----------
  const mkTitleBubble = useCallback(() => {
    const w = W.current, h = H.current;
    const r = 14 + Math.random() * 38;
    const col = BUBBLE_COLS[Math.floor(Math.random() * BUBBLE_COLS.length)];
    return {
      x: r + Math.random() * (w - r*2),
      y: h + r, r,
      vx: (Math.random() - 0.5) * 0.7,
      vy: -(0.5 + Math.random() * 1.2),
      wobble: Math.random() * Math.PI * 2,
      col,
      alpha: 0.7 + Math.random() * 0.25,
    };
  }, []);

  const titleLoop = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const w = W.current, h = H.current;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, w, h);
    drawClouds(ctx); drawGallery(ctx);

    if (titleBubblesRef.current.length < 30) titleBubblesRef.current.push(mkTitleBubble());

    titleBubblesRef.current.forEach(b => {
      b.wobble += 0.025;
      b.x += b.vx + Math.sin(b.wobble) * 0.35;
      b.y += b.vy;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); }
      if (b.x > w - b.r) { b.x = w - b.r; b.vx = -Math.abs(b.vx); }

      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.translate(b.x, b.y);
      ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI*2);
      ctx.fillStyle = b.col[0]; ctx.fill();
      ctx.strokeStyle = b.col[1]; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-b.r*0.3, -b.r*0.32, b.r*0.22, b.r*0.13, -0.4, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fill();
      ctx.restore();
    });

    titleBubblesRef.current = titleBubblesRef.current.filter(b => b.y + b.r > 0);
    titleAnimIdRef.current = requestAnimationFrame(titleLoop);
  }, [drawClouds, drawGallery, mkTitleBubble]);

  // ---------- effects ----------

  // Initial setup: resize + start title loop
  useEffect(() => {
    resize();
    titleLoop();

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(titleAnimIdRef.current);
      cancelAnimationFrame(animIdRef.current);
      clearInterval(timerIntRef.current);
      clearTimeout(spawnTimeoutRef.current);
      stopBgm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When screen transitions back to title, restart title loop
  useEffect(() => {
    if (screen === 'title') {
      cancelAnimationFrame(titleAnimIdRef.current);
      titleBubblesRef.current = [];
      resize();
      titleLoop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Canvas event listeners — set up once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e) => {
      const r = canvas.getBoundingClientRect();
      handleTap(
        (e.clientX - r.left) * (W.current / r.width),
        (e.clientY - r.top) * (H.current / r.height)
      );
    };

    const handleTouch = (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      Array.from(e.changedTouches).forEach(t => handleTap(
        (t.clientX - r.left) * (W.current / r.width),
        (t.clientY - r.top) * (H.current / r.height)
      ));
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [handleTap]);

  // ---------- render ----------
  const currentHi = hiScore;

  return (
    <div id="sdm-game-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} id="sdm-canvas" />

      {/* Title screen */}
      {screen === 'title' && (
        <div className="sdm-screen" id="sdm-title-screen">
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>🫧</div>
          <h1>シャボンだまポン！</h1>
          <p>とんでくる シャボンだまを<br />どんどんタップしよう！</p>
          <div className="sdm-warn-box">
            ⚠️ どうぶつがまじってるよ！<br />どうぶつは おしちゃダメ！
          </div>
          <div className="sdm-hi-badge">🏆 ハイスコア: {currentHi}てん</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <button className="sdm-big-btn" onClick={startGame}>▶ スタート！</button>
            <button className="sdm-big-btn sdm-blue" onClick={() => navigate('/')}>🏝️ トップへもどる</button>
          </div>
        </div>
      )}

      {/* HUD */}
      {screen === 'game' && (
        <div id="sdm-hud">
          {/* LEFT */}
          <button className="game-back-btn" onClick={() => {
            runningRef.current = false;
            if(timerIntRef.current) clearInterval(timerIntRef.current);
            if(animIdRef.current) cancelAnimationFrame(animIdRef.current);
            if(spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
            navigate('/');
          }}>🏠</button>
          {/* CENTER */}
          <div className="sdm-hud-center">
            <div id="sdm-hud-title">{lang === 'en' ? '🫧 Bubble Pop' : '🫧 シャボンだまポン'}</div>
            <div className="sdm-hud-score">{lang === 'en' ? 'Score' : 'スコア'}: {scoreDisplay}</div>
          </div>
          {/* RIGHT */}
          <div className="sdm-hud-box">
            <div className="sdm-hud-label">{lang === 'en' ? 'Left' : 'のこり'}</div>
            <div className="sdm-hud-val">{timeDisplay}</div>
          </div>
        </div>
      )}

      {/* Result overlay */}
      {screen === 'result' && (
        <div id="sdm-result-overlay">
          <h2>{resultData.title}</h2>
          <p dangerouslySetInnerHTML={{ __html: resultData.msg }} />
          <div
            className="sdm-hi-badge"
            style={{ color: resultData.isNew ? '#FFD700' : '#ccc' }}
          >
            {resultData.hiText}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="sdm-big-btn" onClick={startGame}>もういちど</button>
            <button className="sdm-big-btn sdm-blue" onClick={goTitle}>タイトルへ</button>
          </div>
        </div>
      )}
    </div>
  );
}
