import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playKazuAsobiBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import './KazuAsobi.css';

const ANIMALS = ['🐱','🐶','🐸','🐼','🦊','🐰','🐧','🐻','🐮','🐷','🦁','🐨','🦝','🦄','🐯','🐺'];
const GALLERY_CHARS = ['👸','🤴','👑','🦁','🐨','🦝','🐮','🐷','🐔','🐦','🦄','🐯','🐺','🦋','🐝','🦀','🐙','🐭','🐹','🦕','🐳','🦭'];
const GAME_DURATION = 30;

function getHi() { return parseInt(localStorage.getItem('kazu_hi') || '0'); }
function saveHi(v) { localStorage.setItem('kazu_hi', String(v)); }

export default function KazuAsobi() {
  const navigate = useNavigate();

  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [screen, setScreen] = useState('title');
  const [timeDisplay, setTimeDisplay] = useState(GAME_DURATION);
  const [correctDisplay, setCorrectDisplay] = useState(0);
  const [hiScore, setHiScore] = useState(getHi());
  const [resultData, setResultData] = useState({ title: '', msg: '', hiText: '', isNew: false });

  // question state (useState for re-render on question change)
  const [targetNum, setTargetNum] = useState(3);
  const [currentAnimal, setCurrentAnimal] = useState('🐱');
  const [totalButtons, setTotalButtons] = useState(6);
  const [tappedSet, setTappedSet] = useState(new Set());
  const [warning, setWarning] = useState(false);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const W = useRef(0);
  const H = useRef(0);
  const animIdRef = useRef(null);
  const timerRef = useRef(null);
  const frameRef = useRef(0);
  const galleryRef = useRef([]);
  const correctCountRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION);
  const runningRef = useRef(false);
  const targetNumRef = useRef(3);
  const warningTimerRef = useRef(null);

  const getCtx = () => canvasRef.current ? canvasRef.current.getContext('2d') : null;

  const buildGallery = useCallback(() => {
    const w = W.current, h = H.current;
    const g = [];
    // sides
    for (let i = 0; i < 4; i++) {
      g.push({ emoji: GALLERY_CHARS[i % GALLERY_CHARS.length], x: w*0.04, y: h*0.2+i*h*0.16, size: w*0.07, phase: i*1.3, speed: 1.4+i*0.3 });
      g.push({ emoji: GALLERY_CHARS[(i+6) % GALLERY_CHARS.length], x: w*0.96, y: h*0.2+i*h*0.16, size: w*0.07, phase: i*1.6, speed: 1.5+i*0.25 });
    }
    // decorative circles (stored separately, drawn differently)
    galleryRef.current = g;
  }, []);

  const drawBg = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const w = W.current, h = H.current;
    ctx.fillStyle = '#f3e5f5';
    ctx.fillRect(0, 0, w, h);

    // decorative purple circles
    const circles = [
      { x: w*0.1, y: h*0.1, r: w*0.12, alpha: 0.10 },
      { x: w*0.85, y: h*0.18, r: w*0.09, alpha: 0.08 },
      { x: w*0.5, y: h*0.05, r: w*0.07, alpha: 0.07 },
      { x: w*0.2, y: h*0.85, r: w*0.11, alpha: 0.09 },
      { x: w*0.8, y: h*0.8, r: w*0.1, alpha: 0.08 },
      { x: w*0.55, y: h*0.92, r: w*0.06, alpha: 0.07 },
    ];
    for (const c of circles) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(156,39,176,${c.alpha})`;
      ctx.fill();
    }

    // gallery emojis
    const t = frameRef.current;
    for (const g of galleryRef.current) {
      const bob = Math.sin(t * g.speed * 0.04 + g.phase) * 5;
      ctx.font = `${g.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.6;
      ctx.fillText(g.emoji, g.x, g.y + bob);
    }
    ctx.globalAlpha = 1;
  }, []);

  const bgLoop = useCallback(() => {
    frameRef.current++;
    drawBg();
    animIdRef.current = requestAnimationFrame(bgLoop);
  }, [drawBg]);

  const nextQuestion = useCallback(() => {
    const num = 1 + Math.floor(Math.random()*8);
    const animal = ANIMALS[Math.floor(Math.random()*ANIMALS.length)];
    const extra = 2 + Math.floor(Math.random()*4);
    const total = Math.min(num + extra, 12);
    targetNumRef.current = num;
    setTargetNum(num);
    setCurrentAnimal(animal);
    setTotalButtons(total);
    setTappedSet(new Set());
  }, []);

  const endGame = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    stopBgm();
    playSoundClear();
    const c = correctCountRef.current;
    const hi = getHi();
    const isNew = c > hi;
    if (isNew) {
      saveHi(c);
      trackNewHighScore('KazuAsobi', c);
    }
    trackGameClear('KazuAsobi', c, 1);
    setHiScore(isNew ? c : hi);
    let title, msg;
    if (c >= 12)     { title = '🏆 すごい！'; msg = 'てんさいキッズ！'; }
    else if (c >= 6) { title = '⭐ ナイス！'; msg = 'よくできました！'; }
    else             { title = '🔢 もういちど'; msg = 'れんしゅうしよう！'; }
    setResultData({ title, msg, hiText: `ハイスコア: ${isNew ? c : hi}`, isNew });
    setScreen('result');
  }, []);

  const startGame = useCallback(async () => {
    await ensureAudioStarted();
    console.log('[Game] KazuAsobi: audio ready, playing BGM');
    playKazuAsobiBgm();
    trackGameStart('KazuAsobi');

    correctCountRef.current = 0;
    timeLeftRef.current = GAME_DURATION;
    runningRef.current = true;
    setCorrectDisplay(0);
    setTimeDisplay(GAME_DURATION);
    setWarning(false);
    nextQuestion();
    setScreen('game');
  }, [nextQuestion]);

  const handleTap = useCallback((idx) => {
    if (!runningRef.current) return;
    setTappedSet(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
        return next;
      }
      if (next.size >= targetNumRef.current) {
        // show warning
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        setWarning(true);
        warningTimerRef.current = setTimeout(() => setWarning(false), 700);
        return prev;
      }
      next.add(idx);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!runningRef.current) return;
    setTappedSet(prev => {
      if (prev.size !== targetNumRef.current) return prev;
      correctCountRef.current++;
      setCorrectDisplay(correctCountRef.current);
      setTimeout(nextQuestion, 900);
      return prev;
    });
  }, [nextQuestion]);

  // timer
  useEffect(() => {
    if (screen !== 'game') return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      timeLeftRef.current--;
      setTimeDisplay(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        endGame();
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [screen, endGame]);

  // canvas bg loop
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
    if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    animIdRef.current = requestAnimationFrame(bgLoop);
    return () => { if (animIdRef.current) { cancelAnimationFrame(animIdRef.current); animIdRef.current = null; } };
  }, [screen, bgLoop, buildGallery]);

  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      W.current = rect.width;
      H.current = rect.height;
      canvas.width = W.current;
      canvas.height = H.current;
      buildGallery();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [buildGallery]);

  useEffect(() => {
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  const tappedCount = tappedSet.size;
  const submitActive = tappedCount === targetNum;

  const counterDots = Array.from({ length: targetNum }, (_, i) => i < tappedCount ? '🟣' : '⚪');

  // Title screen
  if (screen === 'title') {
    return (
      <div className="kazu-wrap kazu-title">
        <button className="kazu-back-btn" onClick={() => navigate('/')}>← もどる</button>
        <div className="kazu-title-box">
          <div className="kazu-title-emoji">🔢</div>
          <h1 className="kazu-title-text">かずあそび</h1>
          <p className="kazu-subtitle">おなじかずだけタップしよう！</p>
          <div className="kazu-title-rules">
            <div>⏱ 30びょうゲーム</div>
            <div>🐱 どうぶつを かぞえてね</div>
          </div>
          <button className="kazu-start-btn" onClick={startGame}>🎮 はじめる！</button>
          {hiScore > 0 && <div className="kazu-hi">ハイスコア: {hiScore}</div>}
        </div>
      </div>
    );
  }

  // Result screen
  if (screen === 'result') {
    return (
      <div className="kazu-wrap kazu-result">
        <div className="kazu-result-box">
          <div className="kazu-result-title">{resultData.title}</div>
          <div className="kazu-result-score">せいかい: {correctCountRef.current}もん</div>
          <div className="kazu-result-msg">{resultData.msg}</div>
          {resultData.isNew && <div className="kazu-result-new">🌟 新記録！</div>}
          <div className="kazu-result-hi">{resultData.hiText}</div>
          <div className="kazu-result-btns">
            <button className="kazu-start-btn" onClick={startGame}>もういちど</button>
            <button className="kazu-back-btn2" onClick={() => navigate('/')}>もどる</button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="kazu-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} className="kazu-canvas" />
      <div className="kazu-overlay">
        {/* HUD */}
        <div className="kazu-hud">
          {/* LEFT */}
          <button className="kazu-hud-back" onClick={() => { runningRef.current=false; if(timerRef.current) clearInterval(timerRef.current); if(animIdRef.current) cancelAnimationFrame(animIdRef.current); navigate('/'); }}>🏠</button>
          {/* CENTER */}
          <div className="kazu-hud-center">
            <div className="kazu-hud-title">{lang === 'en' ? '🔢 Number Fun' : '🔢 かずあそび'}</div>
            <div className="kazu-hud-score">{lang === 'en' ? 'Correct' : 'せいかい'}: {correctDisplay}</div>
          </div>
          {/* RIGHT */}
          <div className="kazu-hud-box">
            <div className="kazu-hud-label">{lang === 'en' ? 'Time' : 'のこり'}</div>
            <div className="kazu-hud-val">{timeDisplay}</div>
          </div>
        </div>

        {/* Big number */}
        <div className="kazu-number-area">
          <div className="kazu-number">{targetNum}</div>
          <div className="kazu-number-label">ひきえらんでね！</div>
          <div className="kazu-animal-label">{currentAnimal}</div>
        </div>

        {/* Counter dots */}
        <div className="kazu-counter">
          {counterDots.map((dot, i) => <span key={i} className="kazu-dot">{dot}</span>)}
        </div>

        {warning && <div className="kazu-warning">これ以上タップできないよ！</div>}

        {/* Animal grid */}
        <div className="kazu-animal-grid" style={{ gridTemplateColumns: `repeat(${Math.min(totalButtons, 4)}, 1fr)` }}>
          {Array.from({ length: totalButtons }, (_, i) => (
            <button
              key={i}
              className={`kazu-animal-btn ${tappedSet.has(i) ? 'tapped' : ''}`}
              onClick={() => handleTap(i)}
            >
              <span className="kazu-btn-emoji">{currentAnimal}</span>
              {tappedSet.has(i) && <span className="kazu-check">✓</span>}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          className={`kazu-submit-btn ${submitActive ? 'active' : ''}`}
          onClick={handleSubmit}
          disabled={!submitActive}
        >
          きめる！
        </button>
      </div>
    </div>
  );
}
