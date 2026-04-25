import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playKudamonoCatchBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import './KudamonoCatch.css';

// ─── constants ───────────────────────────────────────────────────────────────
const FRUITS = ['🍎','🍊','🍋','🍇','🍓','🍑','🍒','🍌','🍉','🍈','🥝','🫐'];
const TRAPS  = ['🐶','🦁','🐮','🐷','🦝','🐨','🐯','🐺','🦄','🐔'];
const FRUIT_PTS = {
  '🍎':1,'🍊':1,'🍋':2,'🍇':2,'🍓':3,'🍑':2,
  '🍒':3,'🍌':1,'🍉':2,'🍈':1,'🥝':3,'🫐':3,
};

const CHARACTERS = [
  { emoji: '🐱', name: 'ねこ' },
  { emoji: '🐻', name: 'くま' },
  { emoji: '🐸', name: 'かえる' },
  { emoji: '🦊', name: 'きつね' },
  { emoji: '🐼', name: 'パンダ' },
  { emoji: '🐰', name: 'うさぎ' },
];

// gallery bobbing emojis
const GALLERY_LEFT  = ['🦁','🐨','🦝','🐮','🐷','🦋','🐝'];
const GALLERY_RIGHT = ['👸','🤴','👑','🎉','⭐','🌈','🌸'];
const GALLERY_TOP   = ['👸','🤴','👑','🎀','🌈'];
const GALLERY_BOT   = ['🦁','🐘','🦊','🐸','🐧','🐨'];

// ─── localStorage helpers ─────────────────────────────────────────────────────
function getHi() { return parseInt(localStorage.getItem('kudamono_hi') || '0'); }
function saveHi(v) { localStorage.setItem('kudamono_hi', String(v)); }

// ─── component ────────────────────────────────────────────────────────────────
export default function KudamonoCatch() {
  const navigate = useNavigate();

  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');

  // ── screen state ──
  const [screen, setScreen]         = useState('title'); // 'title' | 'game' | 'result'
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [timeDisplay, setTimeDisplay]   = useState(30);
  const [hiScore, setHiScore]           = useState(getHi());
  const [selectedChara, setSelectedChara] = useState(0); // index into CHARACTERS
  const [resultData, setResultData] = useState({ title: '', msg: '', hiText: '', isNew: false });

  // ── DOM refs ──
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);

  // ── mutable game state ──
  const W = useRef(0);
  const H = useRef(0);

  // catcher
  const catcherX   = useRef(0.5);  // 0..1 normalized
  const catcherW   = useRef(80);   // pixel half-dimension (updated on resize)
  const catcherEmoji = useRef(CHARACTERS[0].emoji);

  // items array
  const itemsRef = useRef([]);

  const scoreRef    = useRef(0);
  const timeLeftRef = useRef(30);
  const hpRef       = useRef(3);
  const runningRef  = useRef(false);

  const galleryRef      = useRef([]);
  const animIdRef       = useRef(null);
  const timerIntRef     = useRef(null);
  const spawnTimeoutRef = useRef(null);

  // drag state
  const dragging         = useRef(false);
  const dragStartX       = useRef(0);
  const catcherStartX    = useRef(0);

  // title animation
  const titleAnimIdRef = useRef(null);

  // ─── helpers ─────────────────────────────────────────────────────────────────
  const getCtx = () => {
    const c = canvasRef.current;
    return c ? c.getContext('2d') : null;
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // ─── gallery build ─────────────────────────────────────────────────────────
  const buildGallery = useCallback(() => {
    const w = W.current, h = H.current;
    const g = [];
    for (let i = 0; i < 6; i++) {
      g.push({ emoji: GALLERY_LEFT[i % GALLERY_LEFT.length],
               x: w*0.03 + (i%2)*w*0.07, y: h*0.15 + i*h*0.1,
               size: w*0.07, phase: i*1.1, speed: 1.4 + i*0.2 });
      g.push({ emoji: GALLERY_RIGHT[i % GALLERY_RIGHT.length],
               x: w*0.97 - (i%2)*w*0.07, y: h*0.15 + i*h*0.1,
               size: w*0.07, phase: i*1.3, speed: 1.6 + i*0.2 });
    }
    GALLERY_TOP.forEach((e, i) =>
      g.push({ emoji: e, x: w*(0.12 + i*0.19), y: h*0.05, size: w*0.07, phase: i*0.8, speed: 2 }));
    GALLERY_BOT.forEach((e, i) =>
      g.push({ emoji: e, x: w*(0.08 + i*0.17), y: h*0.95, size: w*0.065, phase: i*0.6, speed: 1.7 }));
    galleryRef.current = g;
  }, []);

  // ─── resize ────────────────────────────────────────────────────────────────
  const resize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    W.current = wrap.clientWidth;
    H.current = wrap.clientHeight;
    canvas.width  = W.current;
    canvas.height = H.current;
    catcherW.current = W.current * 0.18;
    buildGallery();
  }, [buildGallery]);

  // ─── pop label ─────────────────────────────────────────────────────────────
  const showPop = useCallback((x, y, text, color, size) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'kdc-pop-label';
    el.textContent = text;
    el.style.color    = color;
    el.style.fontSize = size + 'px';
    el.style.left     = (x - 50) + 'px';
    el.style.top      = (y - 30) + 'px';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }, []);

  // ─── spawn one item ─────────────────────────────────────────────────────────
  const spawnItem = useCallback(() => {
    const w = W.current, h = H.current;
    const isTrap = Math.random() < 0.22;
    const emoji  = isTrap
      ? TRAPS[Math.floor(Math.random() * TRAPS.length)]
      : FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const size = (18 + Math.random() * 22) * (w / 400);
    itemsRef.current.push({
      emoji, isTrap, size,
      x: size + Math.random() * (w - size * 2),
      y: -size,
      vy: (2.5 + Math.random() * 2.5) * (h / 700),
      vx: (Math.random() - 0.5) * (w * 0.003),
      alive: true,
      caught: false, catchT: 0,
      missed: false, missT: 0,
    });
  }, []);

  // ─── spawn loop ────────────────────────────────────────────────────────────
  const spawnLoop = useCallback(() => {
    if (!runningRef.current) return;
    spawnItem();
    spawnTimeoutRef.current = setTimeout(spawnLoop, 500 + Math.random() * 800);
  }, [spawnItem]);

  // ─── draw helpers ───────────────────────────────────────────────────────────
  const drawClouds = useCallback((ctx) => {
    const w = W.current, h = H.current;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    [[w*0.12, h*0.1, 55], [w*0.7, h*0.08, 44], [w*0.42, h*0.06, 36]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r*0.6, cy + 5, r*0.7, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - r*0.55, cy + 6, r*0.6, 0, Math.PI*2); ctx.fill();
    });
  }, []);

  const drawGallery = useCallback((ctx) => {
    const t = performance.now() / 1000;
    galleryRef.current.forEach(g => {
      const bob = Math.sin(t * g.speed + g.phase) * 5;
      ctx.font = `${Math.round(g.size)}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.emoji, g.x, g.y + bob);
    });
  }, []);

  const drawItem = useCallback((ctx, item) => {
    if (!item.alive) return;
    ctx.save();
    if (item.caught) {
      ctx.globalAlpha = 1 - item.catchT;
      ctx.translate(item.x, item.y - item.catchT * 30);
      ctx.scale(1 + item.catchT * 0.5, 1 + item.catchT * 0.5);
    } else if (item.missed) {
      ctx.globalAlpha = 1 - item.missT;
      ctx.translate(item.x, item.y + item.missT * 20);
    } else {
      ctx.translate(item.x, item.y);
      if (item.isTrap) ctx.rotate(Math.sin(performance.now() / 200) * 0.18);
    }
    ctx.font = `${Math.round(item.size * 2)}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, 0, 0);

    // red X on traps that are falling (not yet caught)
    if (item.isTrap && !item.caught) {
      ctx.strokeStyle = 'rgba(255,50,50,0.55)';
      ctx.lineWidth   = 2.5;
      const s = item.size * 0.8;
      ctx.beginPath(); ctx.moveTo(-s, -s); ctx.lineTo(s, s);   ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s,  -s); ctx.lineTo(-s, s);  ctx.stroke();
    }
    ctx.restore();
  }, []);

  const drawCatcher = useCallback((ctx) => {
    const w = W.current, h = H.current;
    const cx = catcherX.current * w;
    const cy = h * 0.88;
    const hw = catcherW.current;

    ctx.save();
    // basket body
    ctx.fillStyle   = 'rgba(255,200,80,0.85)';
    ctx.strokeStyle = '#e65100';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, hw, hw * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // weave lines
    ctx.strokeStyle = 'rgba(200,100,0,0.3)';
    ctx.lineWidth   = 1.5;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * hw * 0.4,          cy - hw * 0.3);
      ctx.lineTo(cx + i * hw * 0.4 + hw * 0.1, cy + hw * 0.3);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(cx, cy, hw * 0.85, hw * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // character emoji on top of basket
    ctx.font = `${Math.round(w * 0.11)}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(catcherEmoji.current, cx, cy - hw * 0.7);
  }, []);

  const drawHP = useCallback((ctx) => {
    const w = W.current, h = H.current;
    ctx.font = `${Math.round(w * 0.055)}px serif`;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    let hstr = '';
    for (let i = 0; i < 3; i++) hstr += (i < hpRef.current ? '❤️' : '🖤');
    ctx.fillText(hstr, w * 0.02, h * 0.075);
  }, []);

  // ─── update ────────────────────────────────────────────────────────────────
  const update = useCallback((endGame) => {
    const w = W.current, h = H.current;
    const cx = catcherX.current * w;
    const cy = h * 0.88;
    const hw = catcherW.current;

    itemsRef.current.forEach(item => {
      if (!item.alive) return;

      if (item.caught) {
        item.catchT += 0.12;
        if (item.catchT > 1) item.alive = false;
        return;
      }
      if (item.missed) {
        item.missT += 0.1;
        if (item.missT > 1) item.alive = false;
        return;
      }

      // physics
      item.x += item.vx;
      item.y += item.vy;
      if (item.x < item.size)      { item.x = item.size;      item.vx =  Math.abs(item.vx); }
      if (item.x > w - item.size)  { item.x = w - item.size;  item.vx = -Math.abs(item.vx); }

      // catch check
      if (
        item.y + item.size > cy - item.size * 0.5 &&
        item.y < cy + item.size &&
        item.x > cx - hw - item.size * 0.5 &&
        item.x < cx + hw + item.size * 0.5
      ) {
        item.caught = true;
        if (item.isTrap) {
          playSoundWrong();
          hpRef.current = Math.max(0, hpRef.current - 1);
          showPop(item.x, cy, '💥 -HP', '#ff4444', 22);
          if (hpRef.current <= 0) {
            setTimeout(endGame, 600);
          }
        } else {
          playSoundCorrect();
          const pts = FRUIT_PTS[item.emoji] || 1;
          scoreRef.current += pts;
          setScoreDisplay(scoreRef.current);
          showPop(
            item.x, cy,
            (pts >= 3 ? '🌟' : pts >= 2 ? '✨' : '') + '  +' + pts,
            '#FFD700',
            pts >= 3 ? 24 : 18,
          );
        }
        return;
      }

      // fell off bottom
      if (item.y > h + item.size) item.alive = false;
    });

    itemsRef.current = itemsRef.current.filter(i => i.alive);
  }, [showPop]);

  // ─── draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const w = W.current, h = H.current;

    // sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, w, h);

    // grass
    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(0, h * 0.9, w, h * 0.1);
    ctx.fillStyle = '#81c784';
    ctx.fillRect(0, h * 0.9, w, h * 0.03);

    drawClouds(ctx);
    drawGallery(ctx);
    itemsRef.current.forEach(item => drawItem(ctx, item));
    drawCatcher(ctx);
    drawHP(ctx);
  }, [drawClouds, drawGallery, drawItem, drawCatcher, drawHP]);

  // ─── endGame ───────────────────────────────────────────────────────────────
  const endGame = useCallback(() => {
    runningRef.current = false;
    clearInterval(timerIntRef.current);
    clearTimeout(spawnTimeoutRef.current);
    cancelAnimationFrame(animIdRef.current);
    stopBgm();
    playSoundClear();

    const score = scoreRef.current;
    const hi    = getHi();
    const isNew = score > hi;
    if (isNew) {
      saveHi(score);
      trackNewHighScore('KudamonoCatch', score);
    }
    trackGameClear('KudamonoCatch', score, 1);
    setHiScore(isNew ? score : hi);

    let title, msg;
    if (score >= 30) {
      title = '🏆 すごい！';
      msg   = `スコア <b style="font-size:28px;color:#FFD700">${score}</b> てん！<br>くだものキャッチの<br>チャンピオン！`;
    } else if (score >= 15) {
      title = '⭐ ナイス！';
      msg   = `スコア <b style="font-size:28px;color:#FFD700">${score}</b> てん！<br>よくできました！`;
    } else {
      title = '🍎 もういちど';
      msg   = `スコア <b style="font-size:28px;color:#FFD700">${score}</b> てん<br>またちょうせん！`;
    }

    const hiText = isNew ? '🏆 ニューレコード！' : `ハイスコア: ${hi}てん`;
    setResultData({ title, msg, hiText, isNew });
    setScreen('result');
  }, []);

  // ─── game loop ─────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    if (!runningRef.current) return;
    update(endGame);
    draw();
    animIdRef.current = requestAnimationFrame(loop);
  }, [update, draw, endGame]);

  // ─── startGame ─────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    trackGameStart('KudamonoCatch');
    ensureAudioStarted();
    playKudamonoCatchBgm();

    catcherEmoji.current = CHARACTERS[selectedChara].emoji;

    scoreRef.current    = 0;
    timeLeftRef.current = 30;
    hpRef.current       = 3;
    runningRef.current  = true;
    itemsRef.current    = [];
    catcherX.current    = 0.5;

    setScoreDisplay(0);
    setTimeDisplay(30);

    cancelAnimationFrame(titleAnimIdRef.current);
    cancelAnimationFrame(animIdRef.current);
    clearInterval(timerIntRef.current);
    clearTimeout(spawnTimeoutRef.current);

    setScreen('game');

    requestAnimationFrame(() => {
      resize();
      loop();
      spawnLoop();
    });

    timerIntRef.current = setInterval(() => {
      timeLeftRef.current--;
      setTimeDisplay(timeLeftRef.current);
      if (timeLeftRef.current <= 0) endGame();
    }, 1000);
  }, [selectedChara, resize, loop, spawnLoop, endGame]);

  // ─── goTitle ───────────────────────────────────────────────────────────────
  const goTitle = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(animIdRef.current);
    clearInterval(timerIntRef.current);
    clearTimeout(spawnTimeoutRef.current);
    setScreen('title');
  }, []);

  // ─── title draw loop ───────────────────────────────────────────────────────
  const titleLoop = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const w = W.current, h = H.current;
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(0, h * 0.9, w, h * 0.1);
    ctx.fillStyle = '#81c784';
    ctx.fillRect(0, h * 0.9, w, h * 0.03);
    drawClouds(ctx);
    drawGallery(ctx);
    titleAnimIdRef.current = requestAnimationFrame(titleLoop);
  }, [drawClouds, drawGallery]);

  // ─── mouse / touch input ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseMove = (e) => {
      if (!runningRef.current) return;
      const r = canvas.getBoundingClientRect();
      const mx = (e.clientX - r.left) * (W.current / r.width);
      catcherX.current = clamp(mx / W.current, 0.08, 0.92);
    };

    const onTouchStart = (e) => {
      if (!runningRef.current) return;
      dragging.current      = true;
      dragStartX.current    = e.touches[0].clientX;
      catcherStartX.current = catcherX.current * W.current;
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (!runningRef.current || !dragging.current) return;
      const tx = e.touches[0].clientX;
      const dx = tx - dragStartX.current;
      catcherX.current = clamp((catcherStartX.current + dx) / W.current, 0.08, 0.92);
    };

    const onTouchEnd = () => { dragging.current = false; };

    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);

    return () => {
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── initial mount ─────────────────────────────────────────────────────────
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

  // restart title loop when returning to title screen
  useEffect(() => {
    if (screen === 'title') {
      cancelAnimationFrame(titleAnimIdRef.current);
      resize();
      titleLoop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div id="kdc-game-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} id="kdc-canvas" />

      {/* ── Title screen ── */}
      {screen === 'title' && (
        <div className="kdc-screen" id="kdc-title-screen">
          <div style={{ fontSize: '52px', marginBottom: '6px' }}>🍎</div>
          <h1>くだものキャッチ</h1>
          <p>
            おちてくる くだものを<br />
            かごでキャッチしよう！
          </p>
          <div className="kdc-warn-box">
            ⚠️ どうぶつがまじってるよ！<br />
            どうぶつは とっちゃダメ！
          </div>

          {/* character select */}
          <div className="kdc-chara-select">
            {CHARACTERS.map((c, i) => (
              <button
                key={c.emoji}
                className={`kdc-chara-btn${selectedChara === i ? ' selected' : ''}`}
                onClick={() => setSelectedChara(i)}
              >
                <span className="kdc-ci">{c.emoji}</span>
                {c.name}
              </button>
            ))}
          </div>

          <div className="kdc-hi-badge">🏆 ハイスコア: {hiScore}てん</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <button className="kdc-big-btn" onClick={startGame}>▶ スタート！</button>
            <button className="kdc-big-btn blue" onClick={() => navigate('/')}>🏝️ トップへもどる</button>
          </div>
        </div>
      )}

      {/* ── HUD ── */}
      {screen === 'game' && (
        <div id="kdc-hud">
          {/* LEFT */}
          <button className="game-back-btn" onClick={() => {
            runningRef.current = false;
            if(timerIntRef.current) clearInterval(timerIntRef.current);
            if(animIdRef.current) cancelAnimationFrame(animIdRef.current);
            if(spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
            navigate('/');
          }}>🏠</button>
          {/* CENTER */}
          <div className="kdc-hud-center">
            <div id="kdc-hud-title">{lang === 'en' ? '🍎 Fruit Catch' : '🍎 くだものキャッチ'}</div>
            <div className="kdc-hud-score">{lang === 'en' ? 'Score' : 'スコア'}: {scoreDisplay}</div>
          </div>
          {/* RIGHT */}
          <div className="kdc-hud-box">
            <div className="kdc-hud-label">{lang === 'en' ? 'Left' : 'のこり'}</div>
            <div className="kdc-hud-val">{timeDisplay}</div>
          </div>
        </div>
      )}

      {/* ── Result overlay ── */}
      {screen === 'result' && (
        <div id="kdc-result-overlay">
          <h2>{resultData.title}</h2>
          <p dangerouslySetInnerHTML={{ __html: resultData.msg }} />
          <div
            className="kdc-hi-badge"
            style={{ color: resultData.isNew ? '#FFD700' : '#ccc' }}
          >
            {resultData.hiText}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="kdc-big-btn" onClick={startGame}>もういちど</button>
            <button className="kdc-big-btn blue" onClick={goTitle}>タイトルへ</button>
          </div>
        </div>
      )}
    </div>
  );
}
