import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playIchigoBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import './IchigoGame.css';

const STRAWBERRY_TYPES = [
  { type: 'big', emoji: '🍓', pts: 1, size: 34, prob: 0.35, color: '#ff5252' },
  { type: 'medium', emoji: '🍓', pts: 2, size: 24, prob: 0.35, color: '#e91e63' },
  { type: 'small', emoji: '🍓', pts: 3, size: 16, prob: 0.20, color: '#c2185b' },
  { type: 'gold', emoji: '✨', pts: 8, size: 28, prob: 0.10, color: '#FFD700', special: true },
];
const TRAPS = ['🐱', '🐶', '🐸', '🐼', '🦊', '🐰', '🐧', '🐻', '🐮', '🐷'];
const GALLERY = ['👸', '🤴', '👑', '🌸', '⭐', '🎉', '🌈', '🎀', '🦋', '🐝'];

function getHi() { return parseInt(localStorage.getItem('ichigo_hi') || '0'); }
function saveHi(v) { localStorage.setItem('ichigo_hi', String(v)); }

export default function IchigoGame() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState('title');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hp, setHp] = useState(3);
  const [combo, setCombo] = useState(1);
  const [collected, setCollected] = useState(0);
  const [hiScore, setHiScore] = useState(getHi());
  const [resultData, setResultData] = useState({ title: '', msg: '', hiText: '', isNew: false });

  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const wrapRef = useRef(null);

  const W = useRef(0);
  const H = useRef(0);
  const animIdRef = useRef(null);
  const timerIdRef = useRef(null);
  const bgAnimIdRef = useRef(null);
  const itemsRef = useRef([]);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(30);
  const hpRef = useRef(3);
  const comboRef = useRef(1);
  const collectedRef = useRef(0);
  const runningRef = useRef(false);
  const comboTimerRef = useRef(null);
  const galleryRef = useRef([]);
  const frameRef = useRef(0);

  const getCtx = () => canvasRef.current ? canvasRef.current.getContext('2d') : null;
  const getBgCtx = () => bgCanvasRef.current ? bgCanvasRef.current.getContext('2d') : null;

  const buildGallery = useCallback(() => {
    const w = W.current, h = H.current;
    const g = [];
    GALLERY.forEach((e, i) => {
      g.push({ emoji: e, x: w * (0.03 + (i % 2) * 0.07), y: h * (0.1 + Math.floor(i / 2) * 0.14), size: w * 0.06, phase: i * 1.1, speed: 1.4 + i * 0.2 });
      g.push({ emoji: GALLERY[(i + 4) % GALLERY.length], x: w * (0.97 - (i % 2) * 0.07), y: h * (0.1 + Math.floor(i / 2) * 0.14), size: w * 0.06, phase: i * 1.3, speed: 1.6 + i * 0.2 });
    });
    galleryRef.current = g;
  }, []);

  const mkItem = useCallback(() => {
    const w = W.current, h = H.current;
    const isTrap = Math.random() < 0.18;
    if (isTrap) {
      const sz = (18 + Math.random() * 16) * (w / 400);
      return {
        emoji: TRAPS[Math.floor(Math.random() * TRAPS.length)],
        isTrap: true,
        pts: 0,
        size: sz,
        x: Math.random() * (w - sz * 2) + sz,
        y: -sz,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (1.5 + Math.random() * 2) * (h / 700),
        wobble: Math.random() * Math.PI * 2,
        alive: true,
        popping: false,
        popAlpha: 1,
        popScale: 1,
        shaking: false,
        shakeT: 0,
        special: false,
      };
    }

    const r = Math.random();
    let acc = 0, chosen = STRAWBERRY_TYPES[0];
    for (const t of STRAWBERRY_TYPES) {
      acc += t.prob;
      if (r < acc) {
        chosen = t;
        break;
      }
    }
    const sz = chosen.size * (w / 400) * 1.8;
    return {
      emoji: chosen.emoji,
      isTrap: false,
      pts: chosen.pts,
      size: sz,
      stype: chosen.type,
      color: chosen.color,
      special: chosen.special || false,
      x: Math.random() * (w - sz * 2) + sz,
      y: -sz,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (1.2 + Math.random() * 1.8) * (h / 700),
      wobble: Math.random() * Math.PI * 2,
      alive: true,
      popping: false,
      popAlpha: 1,
      popScale: 1,
      shaking: false,
      shakeT: 0,
    };
  }, []);

  const spawnLoop = useCallback(() => {
    if (!runningRef.current) return;
    const active = itemsRef.current.filter(i => i.alive && !i.popping).length;
    if (active < 16) itemsRef.current.push(mkItem());
    // Continue spawning with delay
    setTimeout(spawnLoop, 350 + Math.random() * 500);
  }, [mkItem]);

  const resetCombo = useCallback(() => {
    comboRef.current = 1;
    setCombo(1);
  }, []);

  const updateComboUI = useCallback(() => {
    setCombo(comboRef.current);
  }, []);

  const drawBg = useCallback(() => {
    const ctx = getBgCtx();
    if (!ctx) return;
    const w = W.current, h = H.current;
    ctx.fillStyle = '#fce4ec';
    ctx.fillRect(0, 0, w, h);

    // Falling strawberries
    const t = performance.now() / 1000;
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 8; i++) {
      ctx.font = `${Math.round(w * 0.06)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍓', w * (0.1 + i * 0.12), h * 0.5 + Math.sin(t * 0.6 + i * 0.8) * h * 0.18);
    }
    ctx.globalAlpha = 1;

    // Gallery
    for (const g of galleryRef.current) {
      const bob = Math.sin(t * g.speed + g.phase) * 5;
      ctx.font = `${Math.round(g.size)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.emoji, g.x, g.y + bob);
    }
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

    ctx.clearRect(0, 0, w, h);

    const t = performance.now() / 1000;
    itemsRef.current.forEach(item => {
      if (!item.alive) return;
      ctx.save();
      let ox = 0;
      if (item.shaking) ox = Math.sin(item.shakeT * 6) * 8;
      if (item.popping) {
        ctx.globalAlpha = item.popAlpha;
        ctx.translate(item.x + ox, item.y);
        ctx.scale(item.popScale, item.popScale);
      } else {
        ctx.translate(item.x + ox, item.y);
      }

      // Special glow
      if (item.special && !item.popping) {
        const glow = 0.5 + Math.sin(t * 4) * 0.3;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15 * glow;
      }

      // Trap circle
      if (item.isTrap) {
        ctx.beginPath();
        ctx.arc(0, 0, item.size * 0.95, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,230,200,0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,80,80,0.5)';
        ctx.lineWidth = 2;
        const s = item.size * 0.7;
        ctx.beginPath();
        ctx.moveTo(-s, -s);
        ctx.lineTo(s, s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s, -s);
        ctx.lineTo(-s, s);
        ctx.stroke();
      } else if (!item.special) {
        // Strawberry background circle
        ctx.beginPath();
        ctx.arc(0, 0, item.size * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,180,180,0.4)';
        ctx.fill();
      }

      ctx.font = `${Math.round(item.size * 2)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.emoji, 0, 0);

      // Points display
      if (!item.isTrap && !item.popping) {
        ctx.shadowBlur = 0;
        ctx.font = `bold ${Math.round(item.size * 0.6)}px sans-serif`;
        ctx.fillStyle = item.special ? '#FFD700' : 'rgba(136,14,79,0.8)';
        ctx.fillText('+' + item.pts, 0, item.size * 0.9);
      }

      ctx.restore();
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (!runningRef.current) return;
    const w = W.current, h = H.current;

    // Update
    itemsRef.current.forEach(item => {
      if (!item.alive) return;
      if (item.popping) {
        item.popAlpha -= 0.08;
        item.popScale += 0.07;
        if (item.popAlpha <= 0) item.alive = false;
        return;
      }
      if (item.shaking) {
        item.shakeT += 0.25;
        if (item.shakeT > Math.PI * 3) {
          item.shaking = false;
          item.shakeT = 0;
        }
        return;
      }
      item.wobble += 0.025;
      item.x += item.vx + Math.sin(item.wobble) * 0.5;
      item.y += item.vy;
      if (item.x < item.size) {
        item.x = item.size;
        item.vx = Math.abs(item.vx);
      }
      if (item.x > w - item.size) {
        item.x = w - item.size;
        item.vx = -Math.abs(item.vx);
      }
      if (item.y > h + item.size) item.alive = false;
    });
    itemsRef.current = itemsRef.current.filter(i => i.alive || i.popping);

    drawGame();
    animIdRef.current = requestAnimationFrame(gameLoop);
  }, [drawGame]);

  const handleTap = useCallback((cx, cy) => {
    if (!runningRef.current) return;

    let hit = false;
    for (let i = itemsRef.current.length - 1; i >= 0; i--) {
      const item = itemsRef.current[i];
      if (!item.alive || item.popping || item.shaking) continue;
      const dx = item.x - cx, dy = item.y - cy;
      if (Math.sqrt(dx * dx + dy * dy) < item.size * 1.15) {
        if (item.isTrap) {
          item.shaking = true;
          item.shakeT = 0;
          hpRef.current = Math.max(0, hpRef.current - 1);
          setHp(hpRef.current);
          if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
          resetCombo();
          playSoundWrong();
          showPop(item.x, item.y, '🚫 ダメ！', '#f44336', 22);
          if (hpRef.current <= 0) {
            setTimeout(endGame, 600);
          }
        } else {
          item.popping = true;
          const pts = item.pts * comboRef.current;
          scoreRef.current += pts;
          collectedRef.current++;
          setScore(scoreRef.current);
          setCollected(collectedRef.current);
          comboRef.current = Math.min(comboRef.current + 1, 10);
          updateComboUI();

          if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
          comboTimerRef.current = setTimeout(() => resetCombo(), 2000);

          const msg = item.special ? `✨ きんいちご！+${pts}` : comboRef.current > 3 ? `🔥 コンボ！+${pts}` : `+${pts}`;
          const col = item.special ? '#FFD700' : comboRef.current > 3 ? '#FF6B35' : '#e91e63';
          playSoundCorrect();
          showPop(item.x, item.y, msg, col, item.special ? 26 : comboRef.current > 3 ? 22 : 18);
          if (item.special) goldEffect(item.x, item.y);
        }
        hit = true;
        break;
      }
    }
  }, [resetCombo, updateComboUI]);

  const endGame = useCallback(() => {
    runningRef.current = false;
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    stopBgm();
    playSoundClear();

    const finalScore = scoreRef.current;
    const hi = getHi();
    const isNew = finalScore > hi;
    if (isNew) {
      saveHi(finalScore);
      trackNewHighScore('IchigoGame', finalScore);
    }
    trackGameClear('IchigoGame', finalScore, 1);
    setHiScore(isNew ? finalScore : hi);

    let title, msg;
    if (finalScore >= 60) {
      title = '🏆 すごい！';
      msg = `スコア ${finalScore} てん！${collectedRef.current}こ あつめたよ！いちごの天才だ！`;
    } else if (finalScore >= 30) {
      title = '🍓 ナイス！';
      msg = `スコア ${finalScore} てん！${collectedRef.current}こ あつめたよ！よくできました！`;
    } else {
      title = '😊 もういちど';
      msg = `スコア ${finalScore} てん ${collectedRef.current}こ あつめたよ！またちょうせん！`;
    }

    setResultData({ title, msg, hiText: `ハイスコア: ${isNew ? finalScore : hi}`, isNew });
    setScreen('result');

    // Confetti
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'ichigo-pop-label';
        el.textContent = ['🍓', '⭐', '✨', '🌟', '🎉'][Math.floor(Math.random() * 5)];
        el.style.fontSize = '22px';
        el.style.left = Math.random() * W.current + 'px';
        el.style.top = '60px';
        wrapRef.current?.appendChild(el);
        setTimeout(() => el.remove(), 800);
      }, i * 70);
    }
  }, []);

  const startGame = useCallback(() => {
    ensureAudioStarted();
    playIchigoBgm();
    trackGameStart('IchigoGame');

    scoreRef.current = 0;
    timeLeftRef.current = 30;
    hpRef.current = 3;
    comboRef.current = 1;
    collectedRef.current = 0;
    itemsRef.current = [];
    runningRef.current = true;

    setScore(0);
    setTimeLeft(30);
    setHp(3);
    setCombo(1);
    setCollected(0);
    setScreen('game');

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

    // Initial spawn
    for (let i = 0; i < 8; i++) {
      const b = mkItem();
      b.y = H.current * 0.1 + Math.random() * H.current * 0.6;
      itemsRef.current.push(b);
    }

    animIdRef.current = requestAnimationFrame(gameLoop);
    spawnLoop();

    timerIdRef.current = setInterval(() => {
      timeLeftRef.current--;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timerIdRef.current);
        endGame();
      }
    }, 1000);
  }, [gameLoop, spawnLoop, buildGallery, mkItem, endGame]);

  const showPop = (x, y, text, color, size) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'ichigo-pop-label';
    el.textContent = text;
    el.style.color = color;
    el.style.fontSize = size + 'px';
    el.style.left = (x - 60) + 'px';
    el.style.top = (y - 20) + 'px';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 800);
  };

  const goldEffect = (x, y) => {
    ['⭐', '✨', '🌟', '💫'].forEach((e, i) => {
      setTimeout(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const el = document.createElement('div');
        el.className = 'ichigo-pop-label';
        el.textContent = e;
        el.style.fontSize = '24px';
        el.style.left = (x - 20 + Math.random() * 40 - 20) + 'px';
        el.style.top = (y - 20) + 'px';
        wrap.appendChild(el);
        setTimeout(() => el.remove(), 800);
      }, i * 80);
    });
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
      <div className="ichigo-wrap ichigo-title">
        <button className="ichigo-back-btn" onClick={() => navigate('/')}>← もどる</button>
        <div className="ichigo-title-box">
          <div className="ichigo-title-emoji">🍓</div>
          <h1 className="ichigo-title-text">いちごをあつめよう！</h1>
          <div className="ichigo-rule-card">
            <h2>📖 あそびかた</h2>
            <div className="ichigo-rule-step"><div className="ichigo-rule-num">1</div><div className="ichigo-rule-text"><b>いちご🍓</b> がポップアップ！どんどんタップしよう！</div></div>
            <div className="ichigo-rule-step"><div className="ichigo-rule-num">2</div><div className="ichigo-rule-text"><b>ちいさい</b>いちごほど こうとく！すばやくタップ！</div></div>
            <div className="ichigo-rule-step"><div className="ichigo-rule-num">3</div><div className="ichigo-rule-text"><b>きんいちご✨</b> がでたら チャンス！おおきくもらえるよ！</div></div>
            <div className="ichigo-rule-step"><div className="ichigo-rule-num">4</div><div className="ichigo-rule-text"><b>どうぶつ</b>はタップしちゃダメ！ライフがへるよ！</div></div>
            <div className="ichigo-rule-ex">
              れんぞくタップで<b style={{ color: '#e91e63' }}>コンボ</b>ボーナス！<br />🍓🍓🍓 → コンボ×2！
            </div>
          </div>
          {hiScore > 0 && <div className="ichigo-hi-badge">🏆 ハイスコア: {hiScore}てん</div>}
          <button className="ichigo-start-btn" onClick={startGame}>▶ スタート！</button>
        </div>
      </div>
    );
  }

  if (screen === 'result') {
    return (
      <div className="ichigo-wrap ichigo-result">
        <div className="ichigo-result-box">
          <h2 className="ichigo-result-title">{resultData.title}</h2>
          <p className="ichigo-result-msg">{resultData.msg}</p>
          {resultData.isNew && <div className="ichigo-result-new">🏆 ニューレコード！</div>}
          <div className="ichigo-result-hi">{resultData.hiText}</div>
          <div className="ichigo-result-btns">
            <button className="ichigo-start-btn" onClick={startGame}>もういちど</button>
            <button className="ichigo-back-btn" onClick={() => navigate('/')}>タイトルへ</button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="ichigo-wrap" ref={wrapRef}>
      <canvas ref={bgCanvasRef} className="ichigo-canvas-bg" />
      <canvas ref={canvasRef} className="ichigo-canvas" />
      <div className="ichigo-hud">
        <div className="ichigo-hud-box"><div className="ichigo-hud-label">スコア</div><div className="ichigo-hud-val">{score}</div></div>
        <div className="ichigo-hud-title">🍓 いちごをあつめよう</div>
        <div className="ichigo-hud-box"><div className="ichigo-hud-label">のこり</div><div className="ichigo-hud-val">{timeLeft}</div></div>
      </div>
      <div className="ichigo-combo-area" style={{ display: combo > 1 || screen === 'game' ? 'block' : 'none' }}>
        {combo > 1 ? `🔥 コンボ x${combo}` : 'コンボ x1'}
      </div>
      <div className="ichigo-basket-area" style={{ display: screen === 'game' ? 'flex' : 'none' }}>
        <span className="ichigo-basket-emoji">🧺</span>
        <span className="ichigo-basket-count">{collected}こ</span>
        <span className="ichigo-life-area">{'❤️'.repeat(hp)}{'🖤'.repeat(3 - hp)}</span>
      </div>
      <button className="ichigo-hud-back" onClick={() => { runningRef.current = false; if (timerIdRef.current) clearInterval(timerIdRef.current); if (animIdRef.current) cancelAnimationFrame(animIdRef.current); setScreen('title'); }}>← もどる</button>
    </div>
  );
}
