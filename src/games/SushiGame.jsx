import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSushiBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import './SushiGame.css';

const ANIMALS = ['🐱','🐶','🐸','🐼','🦊','🐰','🐧','🐻','🐮','🐷','🦁','🐨','🦝','🦄','🐯','🐺'];
const OTHERS = ['🍊','🍎','🌸','✨','🌈','🎀','⭐','🐙','🦐','🥚','🐟','🦑','🍙'];
const GALLERY_CHARS = ['👸','🤴','👑','🌸','✨','🎉','🌈','🎀'];

const LANE_COUNT = 3;
const SALMON = '🍣';
const TRAP_EMOJI = ['🐱','🐶','🐸','🐼','🦊','🐰','🐧','🐻','🍊','🍎','🎀','⭐'];

function getHi() { return parseInt(localStorage.getItem('sushi_hi') || '0'); }
function saveHi(v) { localStorage.setItem('sushi_hi', String(v)); }

export default function SushiGame() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState('title');
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(3);
  const [stage, setStage] = useState(1);
  const [hiScore, setHiScore] = useState(getHi());
  const [resultData, setResultData] = useState({ title: '', msg: '', hiText: '', isNew: false });

  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const wrapRef = useRef(null);

  const W = useRef(0);
  const H = useRef(0);
  const animIdRef = useRef(null);
  const lanesRef = useRef([[], [], []]);
  const scoreRef = useRef(0);
  const hpRef = useRef(3);
  const stageRef = useRef(1);
  const runningRef = useRef(false);
  const spawnTimeoutRef = useRef(null);
  const salmonCaughtRef = useRef(0);
  const stageGoalRef = useRef(8);
  const speedRef = useRef(2);
  const galleryRef = useRef([]);
  const bgAnimIdRef = useRef(null);
  const frameRef = useRef(0);

  const stageSpeed = (s) => 2 + s * 1.2;
  const stageGoalCount = (s) => s === 1 ? 8 : s === 2 ? 12 : 16;
  const stageInterval = (s) => s === 1 ? 1800 : s === 2 ? 1300 : 950;

  const getCtx = () => canvasRef.current ? canvasRef.current.getContext('2d') : null;
  const getBgCtx = () => bgCanvasRef.current ? bgCanvasRef.current.getContext('2d') : null;

  const buildGallery = useCallback(() => {
    const w = W.current, h = H.current;
    const g = [];
    for (let i = 0; i < 4; i++) {
      g.push({ emoji: GALLERY_CHARS[i % GALLERY_CHARS.length], x: w*0.04, y: h*0.75+i*h*0.06, size: w*0.06, phase: i*1.3, speed: 1.4+i*0.3 });
      g.push({ emoji: GALLERY_CHARS[(i+3) % GALLERY_CHARS.length], x: w*0.96, y: h*0.75+i*h*0.06, size: w*0.06, phase: i*1.5, speed: 1.5+i*0.25 });
    }
    galleryRef.current = g;
  }, []);

  const mkItem = useCallback((laneIdx) => {
    const isSalmon = Math.random() < 0.38;
    const itemSize = Math.floor(W.current * 0.12);
    const e = isSalmon ? SALMON : TRAP_EMOJI[Math.floor(Math.random() * TRAP_EMOJI.length)];
    return {
      e,
      salmon: isSalmon,
      lane: laneIdx,
      x: W.current + itemSize,
      size: itemSize,
      popping: false,
      popAlpha: 1,
      popScale: 1,
      shaking: false,
      shakeT: 0,
      alive: true,
    };
  }, []);

  const spawnLoop = useCallback(() => {
    if (!runningRef.current) return;
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const last = lanesRef.current[lane][lanesRef.current[lane].length - 1];
    if (!last || last.x < W.current - (W.current * 0.12) * 2.5) {
      lanesRef.current[lane].push(mkItem(lane));
    }
    spawnTimeoutRef.current = setTimeout(spawnLoop, stageInterval(stageRef.current) + Math.random() * 400);
  }, [mkItem]);

  const drawBg = useCallback(() => {
    const ctx = getBgCtx();
    if (!ctx) return;
    const w = W.current, h = H.current;
    ctx.fillStyle = '#fff8f0';
    ctx.fillRect(0, 0, w, h);

    const t = frameRef.current;
    for (const g of galleryRef.current) {
      const bob = Math.sin(t * g.speed * 0.04 + g.phase) * 5;
      ctx.font = `${g.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.5;
      ctx.fillText(g.emoji, g.x, g.y + bob);
    }
    ctx.globalAlpha = 1;
  }, []);

  const bgLoop = useCallback(() => {
    frameRef.current++;
    drawBg();
    bgAnimIdRef.current = requestAnimationFrame(bgLoop);
  }, [drawBg]);

  const drawGame = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const w = W.current, h = H.current;
    const laneH = Math.floor((h * 0.7) / LANE_COUNT);
    const itemSize = Math.floor(w * 0.12);

    ctx.clearRect(0, 0, w, h);

    const laneY = [];
    for (let i = 0; i < LANE_COUNT; i++) {
      laneY[i] = Math.floor(h * 0.14) + i * laneH + laneH / 2;
    }

    // Draw lanes
    const laneColors = ['rgba(255,220,220,0.5)', 'rgba(255,240,200,0.5)', 'rgba(220,240,255,0.5)'];
    for (let l = 0; l < LANE_COUNT; l++) {
      const y = laneY[l];
      ctx.fillStyle = laneColors[l];
      ctx.fillRect(0, y - laneH / 2, w, laneH);
      ctx.strokeStyle = 'rgba(200,150,120,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y + laneH / 2);
      ctx.lineTo(w, y + laneH / 2);
      ctx.stroke();
    }

    // Draw items
    for (let l = 0; l < LANE_COUNT; l++) {
      lanesRef.current[l].forEach(item => {
        if (!item.alive) return;
        ctx.save();
        let ox = 0;
        if (item.shaking) ox = Math.sin(item.shakeT * 6) * 8;
        if (item.popping) {
          ctx.globalAlpha = item.popAlpha;
          ctx.translate(item.x + ox, laneY[l]);
          ctx.scale(item.popScale, item.popScale);
        } else {
          ctx.translate(item.x + ox, laneY[l]);
        }

        ctx.beginPath();
        ctx.arc(0, 0, itemSize * 0.52, 0, Math.PI * 2);
        ctx.fillStyle = item.salmon ? 'rgba(255,240,240,0.95)' : 'rgba(255,255,255,0.88)';
        ctx.fill();
        ctx.strokeStyle = item.salmon ? '#e74c3c' : '#ddd';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = `${Math.round(itemSize * 0.75)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.e, 0, 0);

        if (!item.salmon && !item.popping) {
          ctx.strokeStyle = 'rgba(255,50,50,0.45)';
          ctx.lineWidth = 2;
          const s = itemSize * 0.35;
          ctx.beginPath();
          ctx.moveTo(-s, -s);
          ctx.lineTo(s, s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s, -s);
          ctx.lineTo(-s, s);
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    // Progress bar
    const prog = Math.min(salmonCaughtRef.current / stageGoalRef.current, 1);
    ctx.fillStyle = 'rgba(255,200,200,0.5)';
    ctx.fillRect(0, h * 0.92, w, h * 0.05);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(0, h * 0.92, w * prog, h * 0.05);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(h * 0.025)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🍣 ${salmonCaughtRef.current} / ${stageGoalRef.current}`, w / 2, h * 0.945);
  }, []);

  const gameLoop = useCallback(() => {
    if (!runningRef.current) return;
    const w = W.current, h = H.current;
    const laneH = Math.floor((h * 0.7) / LANE_COUNT);
    const itemSize = Math.floor(w * 0.12);

    // Update
    for (let l = 0; l < LANE_COUNT; l++) {
      lanesRef.current[l].forEach(item => {
        if (!item.alive) return;
        if (item.popping) {
          item.popAlpha -= 0.09;
          item.popScale += 0.07;
          if (item.popAlpha <= 0) item.alive = false;
          return;
        }
        if (item.shaking) {
          item.shakeT += 0.28;
          if (item.shakeT > Math.PI * 3) {
            item.shaking = false;
            item.shakeT = 0;
          }
          return;
        }
        item.x -= speedRef.current;
        if (item.x < -itemSize) item.alive = false;
      });
      lanesRef.current[l] = lanesRef.current[l].filter(i => i.alive || i.popping || i.shaking);
    }

    drawGame();
    animIdRef.current = requestAnimationFrame(gameLoop);
  }, [drawGame]);

  const endGame = useCallback(() => {
    runningRef.current = false;
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    stopBgm();
    playSoundClear();

    const finalScore = scoreRef.current;
    const hi = getHi();
    const isNew = finalScore > hi;
    if (isNew) {
      saveHi(finalScore);
      trackNewHighScore('SushiGame', finalScore);
    }
    trackGameClear('SushiGame', finalScore, stageRef.current);
    setHiScore(isNew ? finalScore : hi);

    let title, msg;
    if (stageRef.current >= 3 && salmonCaughtRef.current >= stageGoalRef.current) {
      title = '🏆 チャンピオン！';
      msg = `スコア ${finalScore} てん！ぜんぶ クリアしたよ！`;
    } else if (finalScore >= 80) {
      title = '🍣 ナイス！';
      msg = `スコア ${finalScore} てん！ステージ${stageRef.current}まで クリア！`;
    } else {
      title = '😅 もういちど';
      msg = `スコア ${finalScore} てん またちょうせん！`;
    }

    setResultData({ title, msg, hiText: `ハイスコア: ${isNew ? finalScore : hi}`, isNew });
    setScreen('result');
  }, []);

  const handleTap = useCallback((cx, cy) => {
    if (!runningRef.current) return;
    const w = W.current, h = H.current;
    const laneH = Math.floor((h * 0.7) / LANE_COUNT);
    const itemSize = Math.floor(w * 0.12);
    const laneY = [];
    for (let i = 0; i < LANE_COUNT; i++) {
      laneY[i] = Math.floor(h * 0.14) + i * laneH + laneH / 2;
    }

    for (let l = 0; l < LANE_COUNT; l++) {
      if (Math.abs(cy - laneY[l]) > laneH * 0.55) continue;
      for (let i = lanesRef.current[l].length - 1; i >= 0; i--) {
        const item = lanesRef.current[l][i];
        if (!item.alive || item.popping || item.shaking) continue;
        if (Math.abs(item.x - cx) < itemSize * 0.8) {
          if (item.salmon) {
            item.popping = true;
            salmonCaughtRef.current++;
            scoreRef.current += 10;
            setScore(scoreRef.current);
            playSoundCorrect();
            showPop(cx, cy, '🍣 +10', '#FFD700', 24);
            if (salmonCaughtRef.current >= stageGoalRef.current) {
              setTimeout(() => runningRef.current && checkStage(), 600);
            }
          } else {
            item.shaking = true;
            item.shakeT = 0;
            hpRef.current = Math.max(0, hpRef.current - 1);
            setHp(hpRef.current);
            playSoundWrong();
            showPop(cx, cy, '🚫 ダメ！', '#f44336', 22);
            if (hpRef.current <= 0) {
              setTimeout(endGame, 600);
            }
          }
          break;
        }
      }
    }
  }, [endGame]);

  const checkStage = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current);

    if (stageRef.current >= 3) {
      endGame();
      return;
    }

    // Stage clear - spawn confetti
    for (let i = 0; i < 16; i++) {
      setTimeout(() => spawnConfetti(), i * 80);
    }

    setTimeout(() => {
      setScreen('stageClear');
    }, 400);
  }, [endGame]);

  const nextStage = useCallback(() => {
    stageRef.current++;
    stageGoalRef.current = stageGoalCount(stageRef.current);
    speedRef.current = stageSpeed(stageRef.current);
    salmonCaughtRef.current = 0;
    lanesRef.current = [[], [], []];
    setStage(stageRef.current);
    setScreen('game');
    runningRef.current = true;
    animIdRef.current = requestAnimationFrame(gameLoop);
    spawnTimeoutRef.current = setTimeout(spawnLoop, stageInterval(stageRef.current));
  }, [gameLoop, spawnLoop]);

  const startGame = useCallback(() => {
    ensureAudioStarted();
    playSushiBgm();
    trackGameStart('SushiGame');

    scoreRef.current = 0;
    hpRef.current = 3;
    stageRef.current = 1;
    runningRef.current = true;
    salmonCaughtRef.current = 0;
    stageGoalRef.current = stageGoalCount(1);
    speedRef.current = stageSpeed(1);
    lanesRef.current = [[], [], []];

    setScore(0);
    setHp(3);
    setStage(1);
    setScreen('game');

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    W.current = rect.width;
    H.current = rect.height;
    canvas.width = W.current;
    canvas.height = H.current;
    bgCanvasRef.current.width = W.current;
    bgCanvasRef.current.height = H.current;
    buildGallery();

    animIdRef.current = requestAnimationFrame(gameLoop);
    spawnTimeoutRef.current = setTimeout(spawnLoop, stageInterval(1));
  }, [gameLoop, spawnLoop, buildGallery]);

  const spawnConfetti = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'sushi-pop-label';
    el.textContent = ['🎉', '⭐', '✨', '🍣', '🌟'][Math.floor(Math.random() * 5)];
    el.style.fontSize = '22px';
    el.style.color = '#FFD700';
    el.style.left = Math.random() * W.current + 'px';
    el.style.top = '60px';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 800);
  };

  const showPop = (x, y, text, color, size) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'sushi-pop-label';
    el.textContent = text;
    el.style.color = color;
    el.style.fontSize = size + 'px';
    el.style.left = (x - 50) + 'px';
    el.style.top = (y - 40) + 'px';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 800);
  };

  // Canvas setup
  useEffect(() => {
    if (screen !== 'game') {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (bgAnimIdRef.current) cancelAnimationFrame(bgAnimIdRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !bgCanvas || !wrap) return;

    const rect = wrap.getBoundingClientRect();
    W.current = rect.width;
    H.current = rect.height;
    canvas.width = W.current;
    canvas.height = H.current;
    bgCanvas.width = W.current;
    bgCanvas.height = H.current;
    buildGallery();

    if (bgAnimIdRef.current) cancelAnimationFrame(bgAnimIdRef.current);
    bgAnimIdRef.current = requestAnimationFrame(bgLoop);

    return () => {
      if (bgAnimIdRef.current) cancelAnimationFrame(bgAnimIdRef.current);
    };
  }, [screen, bgLoop, buildGallery]);

  // Tap handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || screen !== 'game') return;

    const handleClick = (e) => {
      const r = canvas.getBoundingClientRect();
      handleTap((e.clientX - r.left) * (W.current / r.width), (e.clientY - r.top) * (H.current / r.height));
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      Array.from(e.changedTouches).forEach(t => {
        handleTap((t.clientX - r.left) * (W.current / r.width), (t.clientY - r.top) * (H.current / r.height));
      });
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleTap, screen]);

  if (screen === 'title') {
    return (
      <div className="sushi-wrap sushi-title">
        <button className="sushi-back-btn" onClick={() => navigate('/')}>← もどる</button>
        <div className="sushi-title-box">
          <div className="sushi-title-emoji">🍣</div>
          <h1 className="sushi-title-text">さーもんをとろう！</h1>
          <div className="sushi-rule-card">
            <h2>📖 あそびかた</h2>
            <div className="sushi-rule-step"><div className="sushi-rule-num">1</div><div className="sushi-rule-text">かいてんずしの レーンを みてね！</div></div>
            <div className="sushi-rule-step"><div className="sushi-rule-num">2</div><div className="sushi-rule-text"><b>さーもん🍣</b> がながれてきたら タップ！</div></div>
            <div className="sushi-rule-step"><div className="sushi-rule-num">3</div><div className="sushi-rule-text"><b>どうぶつ</b> や <b>ほかのもの</b> は タップしちゃダメ！</div></div>
            <div className="sushi-rule-step"><div className="sushi-rule-num">4</div><div className="sushi-rule-text">ステージ3まで クリアしよう！ スピードがあがるよ！</div></div>
          </div>
          {hiScore > 0 && <div className="sushi-hi-badge">🏆 ハイスコア: {hiScore}てん</div>}
          <button className="sushi-start-btn" onClick={startGame}>▶ スタート！</button>
        </div>
      </div>
    );
  }

  if (screen === 'result') {
    return (
      <div className="sushi-wrap sushi-result">
        <div className="sushi-result-box">
          <h2 className="sushi-result-title">{resultData.title}</h2>
          <p className="sushi-result-msg">{resultData.msg}</p>
          {resultData.isNew && <div className="sushi-result-new">🏆 ニューレコード！</div>}
          <div className="sushi-result-hi">{resultData.hiText}</div>
          <div className="sushi-result-btns">
            <button className="sushi-start-btn" onClick={startGame}>もういちど</button>
            <button className="sushi-back-btn" onClick={() => navigate('/')}>タイトルへ</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'stageClear') {
    return (
      <div className="sushi-wrap sushi-stageclear">
        <div className="sushi-stageclear-box">
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>🎉</div>
          <h2 className="sushi-stageclear-title">ステージ{stage} クリア！</h2>
          <p className="sushi-stageclear-msg">🍣×{salmonCaughtRef.current} とれたよ！つぎは もっとはやいよ！</p>
          <button className="sushi-start-btn" onClick={nextStage}>つぎへ ▶</button>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="sushi-wrap" ref={wrapRef}>
      <canvas ref={bgCanvasRef} className="sushi-canvas-bg" />
      <canvas ref={canvasRef} className="sushi-canvas" />
      <div className="sushi-hud">
        <button className="sushi-hud-back" onClick={() => { runningRef.current = false; if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current); if (animIdRef.current) cancelAnimationFrame(animIdRef.current); setScreen('title'); }}>← もどる</button>
        <div className="sushi-hud-box"><div className="sushi-hud-label">スコア</div><div className="sushi-hud-val">{score}</div></div>
        <div className="sushi-hud-title">🍣 ステージ {stage}</div>
        <div className="sushi-hud-box"><div className="sushi-hud-label">ライフ</div><div className="sushi-hud-val">{'❤️'.repeat(hp)}{'🖤'.repeat(3 - hp)}</div></div>
      </div>
    </div>
  );
}
