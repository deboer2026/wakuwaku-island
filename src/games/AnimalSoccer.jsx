import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playAnimalSoccerBgm, stopBgm, playSoundCorrect, playSoundClear, ensureAudioStarted } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import { addCoins } from '../utils/coins';
import './AnimalSoccer.css';

const FRUITS = ['🍎','🍊','🍋','🍇','🍓','🍑','🍒','🍌'];
const GALLERY_CHARS = ['👸','🤴','👑','🦁','🐨','🦝','🐮','🐷','🐔','🐦','🦄','🐯','🐺','🦋','🐝','🦀','🐙','🐭','🐹'];
const CHARACTERS = [
  { emoji: '🐱', name: 'ねこ',    nameEn: 'Cat'     },
  { emoji: '🐰', name: 'うさぎ',  nameEn: 'Bunny'   },
  { emoji: '🐸', name: 'かえる',  nameEn: 'Frog'    },
  { emoji: '🐼', name: 'パンダ',  nameEn: 'Panda'   },
  { emoji: '🦊', name: 'きつね',  nameEn: 'Fox'     },
  { emoji: '🐧', name: 'ペンギン', nameEn: 'Penguin' },
];

function getHi() { return parseInt(localStorage.getItem('soccer_hi') || '0'); }
function saveHi(v) { localStorage.setItem('soccer_hi', String(v)); }

export default function AnimalSoccer() {
  const navigate = useNavigate();

  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [screen, setScreen] = useState('title');
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [shotsDisplay, setShotsDisplay] = useState(5);
  const [hiScore, setHiScore] = useState(getHi());
  const [resultData, setResultData] = useState({ title: '', msg: '', hiText: '', isNew: false });
  const [speech, setSpeech] = useState({ text: '', visible: false });
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const W = useRef(0);
  const H = useRef(0);
  const animIdRef = useRef(null);
  const speechTimerRef = useRef(null);

  // game state refs
  const kickerRef = useRef(CHARACTERS[0]);
  const scoreRef = useRef(0);
  const shotsLeftRef = useRef(5);
  const shootingRef = useRef(false);
  const kpXRef = useRef(0.5);
  const kpDirRef = useRef(1);
  const kpSpeedRef = useRef(0.008);
  const fruitsRef = useRef([]);
  const ballRef = useRef(null);
  const galleryRef = useRef([]);
  const frameRef = useRef(0);
  const kickerJumpRef = useRef(0);
  const keeperFallRef = useRef(0);

  const getCtx = () => canvasRef.current ? canvasRef.current.getContext('2d') : null;

  const showSpeechBubble = useCallback((text, duration) => {
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    setSpeech({ text, visible: true });
    speechTimerRef.current = setTimeout(() => setSpeech({ text: '', visible: false }), duration);
  }, []);

  const showBonusPop = useCallback((x, y, text) => {
    if (!wrapRef.current) return;
    const el = document.createElement('div');
    el.className = 'soccer-pop';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    wrapRef.current.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }, []);

  const buildGallery = useCallback(() => {
    const w = W.current, h = H.current;
    const g = [];
    for (let i = 0; i < 5; i++) {
      g.push({ emoji: GALLERY_CHARS[i % GALLERY_CHARS.length], x: w*0.03+(i%2)*w*0.05, y: h*0.35+i*h*0.09, size: w*0.065, phase: i*1.2, speed: 1.4+i*0.3 });
    }
    for (let i = 0; i < 5; i++) {
      g.push({ emoji: GALLERY_CHARS[(i+7) % GALLERY_CHARS.length], x: w*0.97-(i%2)*w*0.05, y: h*0.35+i*h*0.09, size: w*0.065, phase: i*1.5, speed: 1.6+i*0.2 });
    }
    for (let i = 0; i < 4; i++) {
      g.push({ emoji: GALLERY_CHARS[(i+12) % GALLERY_CHARS.length], x: w*0.2+i*(w*0.2), y: h*0.02, size: w*0.06, phase: i*0.8, speed: 1.2+i*0.4 });
    }
    galleryRef.current = g;
  }, []);

  const initFruits = useCallback(() => {
    fruitsRef.current = [
      { emoji: FRUITS[Math.floor(Math.random()*FRUITS.length)], x: 0.3, dir: 1,  speed: 0.003, pts: 3 },
      { emoji: FRUITS[Math.floor(Math.random()*FRUITS.length)], x: 0.7, dir: -1, speed: 0.004, pts: 5 },
    ];
  }, []);

  const endGame = useCallback(() => {
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    animIdRef.current = null;
    stopBgm();
    playSoundClear();
    addCoins(5);
    const s = scoreRef.current;
    const hi = getHi();
    const isNew = s > hi;
    if (isNew) {
      saveHi(s);
      trackNewHighScore('AnimalSoccer', s);
      addCoins(10);
    }
    trackGameClear('AnimalSoccer', s, 1);
    setHiScore(isNew ? s : hi);
    let title, msg;
    if (s >= 12) { title = '🏆 チャンピオン！'; msg = 'かんぺきなシュート！'; }
    else if (s >= 6) { title = '⭐ ナイス！'; msg = 'すごいシュート！'; }
    else { title = '😢 ざんねん…'; msg = 'もういちどチャレンジ！'; }
    setResultData({ title, msg, hiText: `ハイスコア: ${isNew ? s : hi}`, isNew });
    setScreen('result');
  }, []);

  const shoot = useCallback((dir) => {
    if (shootingRef.current || shotsLeftRef.current <= 0) return;
    shootingRef.current = true;
    const w = W.current, h = H.current;
    const kx = w*0.5, ky = h*0.74;
    const goalL = w*0.2, goalR = w*0.8;
    const goalTop = h*0.1, goalBot = h*0.26;
    let tx, ty;
    const cx = (goalL+goalR)/2;
    if (dir === 'left')        tx = goalL + (goalR-goalL)*0.18;
    else if (dir === 'right')  tx = goalL + (goalR-goalL)*0.82;
    else                       tx = cx + (Math.random()-0.5)*(goalR-goalL)*0.3;
    if (dir === 'top')         ty = goalTop + (goalBot-goalTop)*0.2;
    else if (dir === 'bottom') ty = goalTop + (goalBot-goalTop)*0.78;
    else                       ty = goalTop + (goalBot-goalTop)*0.5;

    let fruitHit = null;
    for (const f of fruitsRef.current) {
      const fx = w*f.x, fy = goalTop + (goalBot-goalTop)*0.5;
      if (Math.abs(fx-tx) < w*0.07 && Math.abs(fy-ty) < h*0.1) { fruitHit = f; break; }
    }

    const kpx = w*kpXRef.current;
    const keeperW = w*0.12;
    const kpCoversTop = Math.random() < 0.5;
    const dirTop = (dir === 'top');
    const saved = Math.abs(kpx-tx) < keeperW && (kpCoversTop === dirTop);

    const pts = fruitHit ? fruitHit.pts : 1;
    ballRef.current = { sx: kx, sy: ky-w*0.1, tx, ty, t: 0, dur: 120, pts, isGoal: !saved, fruitEmoji: fruitHit ? fruitHit.emoji : null };
  }, []);

  const drawField = useCallback((ctx) => {
    const w = W.current, h = H.current;
    ctx.fillStyle = '#388e3c';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i%2===0 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, h*i/10, w, h/10);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, h*0.63); ctx.lineTo(w, h*0.63); ctx.stroke();
    ctx.beginPath(); ctx.arc(w/2, h*0.63, w*0.13, 0, Math.PI*2); ctx.stroke();
    ctx.strokeRect(w*0.18, h*0.26, w*0.64, h*0.18);
  }, []);

  const drawGoal = useCallback((ctx) => {
    const w = W.current, h = H.current;
    const gl = w*0.2, gr = w*0.8, gt = h*0.1, gb = h*0.26;
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
    for (let x = gl; x <= gr; x += (gr-gl)/10) {
      ctx.beginPath(); ctx.moveTo(x, gt); ctx.lineTo(x, gb); ctx.stroke();
    }
    for (let y = gt; y <= gb; y += (gb-gt)/6) {
      ctx.beginPath(); ctx.moveTo(gl, y); ctx.lineTo(gr, y); ctx.stroke();
    }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(gl, gb); ctx.lineTo(gl, gt); ctx.lineTo(gr, gt); ctx.lineTo(gr, gb); ctx.stroke();
  }, []);

  const drawGallery = useCallback((ctx) => {
    const t = frameRef.current;
    for (const g of galleryRef.current) {
      const bob = Math.sin(t * g.speed * 0.04 + g.phase) * 4;
      ctx.font = `${g.size}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.75;
      ctx.fillText(g.emoji, g.x, g.y + bob);
    }
    ctx.globalAlpha = 1;
  }, []);

  const drawFruits = useCallback((ctx) => {
    const w = W.current, h = H.current;
    const gt = h*0.1, gb = h*0.26;
    const fy = gt + (gb-gt)*0.5;
    for (const f of fruitsRef.current) {
      const fx = w*f.x;
      ctx.font = `${w*0.055}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(f.emoji, fx, fy);
      ctx.font = `bold ${w*0.028}px sans-serif`;
      ctx.fillStyle = '#fff200';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeText(`+${f.pts}`, fx, fy + w*0.04);
      ctx.fillText(`+${f.pts}`, fx, fy + w*0.04);
    }
  }, []);

  const drawKeeper = useCallback((ctx) => {
    const w = W.current, h = H.current;
    const kx = w*kpXRef.current;
    const ky = h*0.195;
    const fall = keeperFallRef.current;
    ctx.save();
    ctx.translate(kx, ky);
    if (fall > 0) {
      ctx.rotate((fall/30)*Math.PI*0.4);
      ctx.translate(0, fall*2);
    }
    ctx.font = `${w*0.1}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🐻', 0, 0);
    ctx.restore();
  }, []);

  const drawKicker = useCallback((ctx) => {
    const w = W.current, h = H.current;
    const kx = w*0.5;
    const ky = h*0.74;
    const jump = kickerJumpRef.current;
    ctx.font = `${w*0.1}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(kickerRef.current.emoji, kx, ky - jump*8);
    // static ball above kicker when not shooting
    if (!ballRef.current && !shootingRef.current) {
      ctx.font = `${w*0.07}px serif`;
      ctx.fillText('⚽', kx, ky - w*0.1);
    }
  }, []);

  const drawBall = useCallback((ctx) => {
    const b = ballRef.current;
    if (!b) return;
    const p = b.t / b.dur;
    const ease = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
    const bx = b.sx + (b.tx - b.sx)*ease;
    const by = b.sy + (b.ty - b.sy)*ease - Math.sin(p*Math.PI)*W.current*0.2;
    const scale = 1 - p*0.25;
    const sz = W.current*0.07*scale;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(p*Math.PI*8);
    ctx.font = `${sz}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('⚽', 0, 0);
    ctx.restore();
  }, []);

  const update = useCallback(() => {
    kpXRef.current += kpDirRef.current * kpSpeedRef.current;
    if (kpXRef.current > 0.82) { kpXRef.current = 0.82; kpDirRef.current = -1; }
    if (kpXRef.current < 0.18) { kpXRef.current = 0.18; kpDirRef.current = 1; }

    for (const f of fruitsRef.current) {
      f.x += f.dir*f.speed;
      if (f.x > 0.82) { f.x = 0.82; f.dir = -1; }
      if (f.x < 0.18) { f.x = 0.18; f.dir = 1; }
    }

    if (kickerJumpRef.current > 0) kickerJumpRef.current = Math.max(0, kickerJumpRef.current - 1);
    if (keeperFallRef.current > 0) keeperFallRef.current = Math.max(0, keeperFallRef.current - 1);

    const b = ballRef.current;
    if (b) {
      b.t++;
      if (b.t >= b.dur) {
        const { isGoal, pts, fruitEmoji } = b;
        ballRef.current = null;
        shootingRef.current = false;
        shotsLeftRef.current--;
        setShotsDisplay(shotsLeftRef.current);
        if (isGoal) {
          scoreRef.current += pts;
          setScoreDisplay(scoreRef.current);
          const msg = fruitEmoji ? `${fruitEmoji} ボーナス +${pts}！` : `ゴール！⚽ +${pts}`;
          showSpeechBubble(msg, 1400);
          showBonusPop(W.current/2, H.current*0.38, fruitEmoji ? `${fruitEmoji}+${pts}` : '⚽ GOAL!');
          kickerJumpRef.current = 20;
          kpXRef.current = kpXRef.current < 0.5 ? 0.85 : 0.15;
          keeperFallRef.current = 30;
        } else {
          showSpeechBubble('🐻 セーブ！', 1400);
        }
        if (shotsLeftRef.current <= 0) setTimeout(endGame, 1500);
      }
    }
  }, [showSpeechBubble, showBonusPop, endGame]);

  const draw = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    drawField(ctx);
    drawGallery(ctx);
    drawGoal(ctx);
    drawFruits(ctx);
    drawKeeper(ctx);
    drawKicker(ctx);
    drawBall(ctx);
  }, [drawField, drawGallery, drawGoal, drawFruits, drawKeeper, drawKicker, drawBall]);

  const gameLoop = useCallback(() => {
    frameRef.current++;
    update();
    draw();
    animIdRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  const startGame = useCallback(async (char) => {
    trackGameStart('AnimalSoccer');
    await ensureAudioStarted();
    console.log('[Game] AnimalSoccer: audio ready, playing BGM');
    playAnimalSoccerBgm();
    addCoins(1);

    kickerRef.current = char;
    scoreRef.current = 0;
    shotsLeftRef.current = 5;
    shootingRef.current = false;
    kpXRef.current = 0.5;
    kpDirRef.current = 1;
    kpSpeedRef.current = 0.008;
    ballRef.current = null;
    kickerJumpRef.current = 0;
    keeperFallRef.current = 0;
    frameRef.current = 0;
    setScoreDisplay(0);
    setShotsDisplay(5);
    setSpeech({ text: '', visible: false });
    initFruits();
    buildGallery();
    setScreen('game');
  }, [initFruits, buildGallery]);

  // resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    W.current = rect.width;
    H.current = rect.height;
    canvas.width = W.current;
    canvas.height = H.current;
    buildGallery();
  }, [buildGallery]);

  // Start/stop game loop on screen change
  useEffect(() => {
    if (screen !== 'game') {
      if (animIdRef.current) { cancelAnimationFrame(animIdRef.current); animIdRef.current = null; }
      return;
    }
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    W.current = rect.width;
    H.current = rect.height;
    canvas.width = W.current;
    canvas.height = H.current;
    buildGallery();
    initFruits();
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    animIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animIdRef.current) { cancelAnimationFrame(animIdRef.current); animIdRef.current = null; }
    };
  }, [screen, gameLoop, buildGallery, initFruits]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      stopBgm();
    };
  }, []);

  // Title screen
  if (screen === 'title') {
    return (
      <div className="soccer-wrap soccer-title">
        <button className="soccer-back-btn" onClick={() => navigate('/')}>{lang === 'en' ? '← Back' : '← もどる'}</button>
        <div className="soccer-title-box">
          <div className="soccer-title-emoji">⚽</div>
          <h1 className="soccer-title-text">{lang === 'en' ? 'Animal Soccer!' : 'どうぶつサッカー'}</h1>
          <p className="soccer-subtitle">{lang === 'en' ? 'Pick a character and shoot!' : 'キャラをえらんでシュートしよう！'}</p>
          <div className="soccer-char-grid">
            {CHARACTERS.map(ch => (
              <button
                key={ch.emoji}
                className={`soccer-char-btn ${selectedChar.emoji === ch.emoji ? 'selected' : ''}`}
                onClick={() => setSelectedChar(ch)}
              >
                <span className="soccer-char-emoji">{ch.emoji}</span>
                <span className="soccer-char-name">{lang === 'en' ? ch.nameEn : ch.name}</span>
              </button>
            ))}
          </div>
          <button className="soccer-start-btn" onClick={() => startGame(selectedChar)}>
            {lang === 'en' ? '⚽ Start!' : '⚽ はじめる！'}
          </button>
          {hiScore > 0 && <div className="soccer-hi">{lang === 'en' ? `Best: ${hiScore}pts` : `ハイスコア: ${hiScore}`}</div>}
        </div>
      </div>
    );
  }

  // Result screen
  if (screen === 'result') {
    return (
      <div className="soccer-wrap soccer-result">
        <div className="soccer-result-box">
          <div className="soccer-result-title">{resultData.title}</div>
          <div className="soccer-result-score">スコア: {scoreRef.current}</div>
          <div className="soccer-result-msg">{resultData.msg}</div>
          {resultData.isNew && <div className="soccer-result-new">🌟 新記録！</div>}
          <div className="soccer-result-hi">{resultData.hiText}</div>
          <div className="soccer-result-btns">
            <button className="soccer-start-btn" onClick={() => startGame(kickerRef.current)}>もういちど</button>
            <button className="soccer-back-btn2" onClick={() => setScreen('title')}>キャラ選択</button>
            <button className="soccer-back-btn2" onClick={() => navigate('/')}>もどる</button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="soccer-wrap" ref={wrapRef}>
      <div className="soccer-hud">
        {/* LEFT */}
        <button className="soccer-hud-back" onClick={() => { if(animIdRef.current) cancelAnimationFrame(animIdRef.current); navigate('/'); }}>🏠</button>
        {/* CENTER */}
        <div className="soccer-hud-center">
          <div className="soccer-hud-title">{lang === 'en' ? '⚽ Animal Soccer' : '⚽ どうぶつサッカー'}</div>
          <div className="soccer-hud-score">{lang === 'en' ? 'Score' : 'スコア'}: {scoreDisplay}</div>
        </div>
        {/* RIGHT */}
        <div className="soccer-hud-box">
          <div className="soccer-hud-label">{lang === 'en' ? 'Left' : 'のこり'}</div>
          <div className="soccer-hud-val">{'⚽'.repeat(shotsDisplay)}</div>
        </div>
      </div>
      <canvas ref={canvasRef} className="soccer-canvas" />
      {speech.visible && (
        <div className="soccer-speech">
          {speech.text}
        </div>
      )}
      <div className="soccer-dpad">
        <div className="soccer-dpad-row">
          <div className="soccer-dpad-empty" />
          <button className="soccer-dpad-btn" onClick={() => shoot('top')}>
            <span>⬆️</span><br /><span className="soccer-dpad-label">たかい</span>
          </button>
          <div className="soccer-dpad-empty" />
        </div>
        <div className="soccer-dpad-row">
          <button className="soccer-dpad-btn" onClick={() => shoot('left')}>
            <span>⬅️</span><br /><span className="soccer-dpad-label">ひだり</span>
          </button>
          <div className="soccer-dpad-center">⚽</div>
          <button className="soccer-dpad-btn" onClick={() => shoot('right')}>
            <span>➡️</span><br /><span className="soccer-dpad-label">みぎ</span>
          </button>
        </div>
        <div className="soccer-dpad-row">
          <div className="soccer-dpad-empty" />
          <button className="soccer-dpad-btn" onClick={() => shoot('bottom')}>
            <span>⬇️</span><br /><span className="soccer-dpad-label">ひくい</span>
          </button>
          <div className="soccer-dpad-empty" />
        </div>
      </div>
    </div>
  );
}
