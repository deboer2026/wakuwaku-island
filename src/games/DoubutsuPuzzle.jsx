import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playDoubutsuPuzzleBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted, toggleMute, getMuteState } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import { addCoins } from '../utils/coins';
import './DoubutsuPuzzle.css';

// ─── constants ────────────────────────────────────────────────────────────────
const ANIMALS = [
  { e: '🐱', n: 'ねこ'   },
  { e: '🐶', n: 'いぬ'   },
  { e: '🐸', n: 'かえる' },
  { e: '🐼', n: 'パンダ' },
  { e: '🦊', n: 'きつね' },
  { e: '🐧', n: 'ペンギン'},
  { e: '🐰', n: 'うさぎ' },
  { e: '🐻', n: 'くま'   },
];

const GALLERY_CHARS = [
  '👸','🤴','👑','🦁','🐨','🦝','🐮','🦋','🌸','⭐','🎉','🌈',
];

// ─── helpers ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtTime(s) {
  return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
}

function getBestTime() { return parseInt(localStorage.getItem('puzzle_best') || '0'); }
function saveBestTime(v) { localStorage.setItem('puzzle_best', String(v)); }

// ─── component ────────────────────────────────────────────────────────────────
export default function DoubutsuPuzzle() {
  const navigate = useNavigate();

  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');

  // ── screen state ──
  const [screen, setScreen]         = useState('title'); // 'title' | 'game' | 'result'
  const [timeDisplay, setTimeDisplay] = useState('0:00');
  const [missDisplay, setMissDisplay] = useState(0);
  const [bestTimeDisplay, setBestTimeDisplay] = useState(getBestTime());

  // ── card state (array of 16 card objects) ──
  // Each card: { id, animal, state } where state is 'hidden'|'flipped'|'matched'|'wrong'
  const [cards, setCards] = useState([]);

  // ── result state ──
  const [resultData, setResultData] = useState({
    stars: '', time: '', misses: 0, isNewBest: false, bestTime: 0,
  });
  const [muted, setMuted] = useState(() => getMuteState());

  // ── DOM refs ──
  const wrapRef        = useRef(null);
  const galleryCanvasRef = useRef(null);
  const fieldRef       = useRef(null);

  // ── mutable game state ──
  const W = useRef(0);
  const H = useRef(0);

  const galleryRef    = useRef([]);
  const galAnimIdRef  = useRef(null);

  const timeRef       = useRef(0);    // elapsed seconds
  const missRef       = useRef(0);
  const matchedRef    = useRef(0);    // matched pairs count
  const timerIntRef   = useRef(null);
  const lockRef       = useRef(false); // prevent clicking during check

  // flipped card slots: indices into the cards array
  const flippedRef    = useRef([]);   // up to 2 indices

  // ─── gallery setup ─────────────────────────────────────────────────────────
  const buildGallery = useCallback(() => {
    const w = W.current, h = H.current;
    const g = [];
    GALLERY_CHARS.forEach((emoji, i) => {
      const side = i % 2 === 0 ? 'left' : 'right';
      const idx  = Math.floor(i / 2);
      const x    = side === 'left'
        ? w * 0.03 + (idx % 2) * w * 0.07
        : w * 0.97 - (idx % 2) * w * 0.07;
      const y = h * 0.12 + idx * h * 0.14;
      g.push({ emoji, x, y, size: w * 0.07, phase: i * 0.9, speed: 1.4 + i * 0.15 });
    });
    galleryRef.current = g;
  }, []);

  const resize = useCallback(() => {
    const wrap   = wrapRef.current;
    const canvas = galleryCanvasRef.current;
    if (!wrap || !canvas) return;
    W.current = wrap.clientWidth;
    H.current = wrap.clientHeight;
    canvas.width  = W.current;
    canvas.height = H.current;
    buildGallery();
  }, [buildGallery]);

  // ─── gallery animation loop ─────────────────────────────────────────────────
  const galleryLoop = useCallback(() => {
    const canvas = galleryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = W.current, h = H.current;

    ctx.clearRect(0, 0, w, h);

    // decorative dots behind gallery
    ctx.fillStyle = 'rgba(255,200,80,0.18)';
    for (let i = 0; i < 8; i++) {
      const r = w * (0.04 + (i % 3) * 0.01);
      ctx.beginPath();
      ctx.arc(w * (i < 4 ? 0.06 : 0.94), h * (0.1 + i * 0.1), r, 0, Math.PI * 2);
      ctx.fill();
    }

    // bobbing gallery emojis
    const t = performance.now() / 1000;
    galleryRef.current.forEach(g => {
      const bob = Math.sin(t * g.speed + g.phase) * 5;
      ctx.font = `${Math.round(g.size)}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.emoji, g.x, g.y + bob);
    });

    galAnimIdRef.current = requestAnimationFrame(galleryLoop);
  }, []);

  // ─── pop label ─────────────────────────────────────────────────────────────
  const showPop = useCallback((x, y, text, color, size) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement('div');
    el.className   = 'dbp-pop-label';
    el.textContent = text;
    el.style.color    = color;
    el.style.fontSize = (size || 18) + 'px';
    el.style.left     = (x - 40) + 'px';
    el.style.top      = (y - 20) + 'px';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }, []);

  // ─── confetti ──────────────────────────────────────────────────────────────
  const celebrate = useCallback((x, y) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    ['🎉','⭐','✨','🌟'].forEach((emoji, i) => {
      const el = document.createElement('div');
      el.className   = 'dbp-confetti';
      el.textContent = emoji;
      el.style.left  = (x - 10 + (i - 1.5) * 22) + 'px';
      el.style.top   = (y - 10) + 'px';
      wrap.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    });
  }, []);

  // ─── compute card size from wrap dimensions ─────────────────────────────────
  const getCardDims = useCallback(() => {
    const w = W.current, h = H.current;
    const pad   = Math.floor(w * 0.14);
    const hudH  = 50;
    const gap   = 8;
    const cardW = Math.floor((w - pad * 2 - gap * 3) / 4);
    const cardH = Math.floor(cardW * 1.15);
    const gridW = cardW * 4 + gap * 3;
    const gridH = cardH * 4 + gap * 3;
    const topPx = hudH + Math.floor((h - hudH - gridH) / 2);
    return { cardW, cardH, gridW, topPx };
  }, []);

  // ─── build a fresh shuffled deck ───────────────────────────────────────────
  const buildDeck = useCallback(() => {
    const pairs = [...ANIMALS, ...ANIMALS]; // 8 pairs = 16 cards
    const shuffled = shuffle(pairs);
    return shuffled.map((animal, idx) => ({
      id: idx,
      animal,
      state: 'hidden', // 'hidden' | 'flipped' | 'matched' | 'wrong'
    }));
  }, []);

  // ─── endGame ───────────────────────────────────────────────────────────────
  const endGame = useCallback((elapsed, misses) => {
    clearInterval(timerIntRef.current);
    stopBgm();
    playSoundClear();
    addCoins(5);

    const stars = misses <= 3 ? '⭐⭐⭐' : misses <= 7 ? '⭐⭐' : '⭐';
    const prevBest = getBestTime();
    const isNewBest = prevBest === 0 || elapsed < prevBest;
    if (isNewBest) {
      saveBestTime(elapsed);
      trackNewHighScore('DoubutsuPuzzle', elapsed);
      addCoins(10);
    }
    trackGameClear('DoubutsuPuzzle', elapsed, 1);
    setBestTimeDisplay(isNewBest ? elapsed : prevBest);

    setResultData({
      stars,
      time: fmtTime(elapsed),
      misses,
      isNewBest,
      bestTime: isNewBest ? elapsed : prevBest,
    });
    setScreen('result');
  }, []);

  // ─── card click handler ────────────────────────────────────────────────────
  const handleCardClick = useCallback((idx) => {
    if (lockRef.current) return;

    setCards(prev => {
      const card = prev[idx];
      // ignore already flipped/matched or if two are already open
      if (card.state !== 'hidden') return prev;
      if (flippedRef.current.length >= 2) return prev;

      const next = prev.map((c, i) => i === idx ? { ...c, state: 'flipped' } : c);
      flippedRef.current = [...flippedRef.current, idx];

      if (flippedRef.current.length === 2) {
        const [a, b] = flippedRef.current;
        const cardA  = next[a];
        const cardB  = next[b];

        if (cardA.animal.e === cardB.animal.e) {
          // match!
          const matched = next.map((c, i) =>
            i === a || i === b ? { ...c, state: 'matched' } : c
          );
          flippedRef.current = [];
          matchedRef.current++;

          // show pop & confetti after a tiny frame delay so elements exist
          requestAnimationFrame(() => {
            // find approximate card center for effects
            const { cardW, cardH, gridW, topPx } = getCardDims();
            const col = b % 4;
            const row = Math.floor(b / 4);
            const x = (W.current - gridW) / 2 + col * (cardW + 8) + cardW / 2;
            const y = topPx + row * (cardH + 8) + cardH / 2;
            showPop(x, y, '✨ ペア！', '#ff6f00', 20);
            celebrate(x, y);
          });

          if (matchedRef.current === 8) {
            setTimeout(() => endGame(timeRef.current, missRef.current), 600);
          }

          return matched;
        } else {
          // no match
          missRef.current++;
          setMissDisplay(missRef.current);
          lockRef.current = true;

          const wronged = next.map((c, i) =>
            i === a || i === b ? { ...c, state: 'wrong' } : c
          );

          setTimeout(() => {
            flippedRef.current = [];
            lockRef.current    = false;
            setCards(cur =>
              cur.map((c, i) =>
                i === a || i === b ? { ...c, state: 'hidden' } : c
              )
            );
          }, 900);

          return wronged;
        }
      }

      return next;
    });
  }, [getCardDims, showPop, celebrate, endGame]);

  // ─── startGame ─────────────────────────────────────────────────────────────
  const startGame = useCallback(async () => {
    trackGameStart('DoubutsuPuzzle');
    await ensureAudioStarted();
    console.log('[Game] DoubutsuPuzzle: audio ready, playing BGM');
    playDoubutsuPuzzleBgm();
    addCoins(1);

    matchedRef.current  = 0;
    missRef.current     = 0;
    timeRef.current     = 0;
    flippedRef.current  = [];
    lockRef.current     = false;

    setMissDisplay(0);
    setTimeDisplay('0:00');
    setCards(buildDeck());
    setScreen('game');

    clearInterval(timerIntRef.current);
    timerIntRef.current = setInterval(() => {
      timeRef.current++;
      setTimeDisplay(fmtTime(timeRef.current));
    }, 1000);
  }, [buildDeck]);

  // ─── goTitle ───────────────────────────────────────────────────────────────
  const goTitle = useCallback(() => {
    clearInterval(timerIntRef.current);
    flippedRef.current = [];
    lockRef.current    = false;
    setScreen('title');
  }, []);

  // page title
  useEffect(() => {
    document.title = 'どうぶつパズル | わくわくアイランド - 無料子供向けゲーム';
    return () => { document.title = 'わくわくアイランド | 無料の子供向けブラウザゲーム'; };
  }, []);

  // ─── initial mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    resize();
    galleryLoop();

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(galAnimIdRef.current);
      clearInterval(timerIntRef.current);
      stopBgm();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // restart gallery loop when screen changes
  useEffect(() => {
    cancelAnimationFrame(galAnimIdRef.current);
    resize();
    galleryLoop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // ─── card grid dimensions ──────────────────────────────────────────────────
  // Computed inline so that card grid is positioned correctly every render.
  const { cardW, cardH, gridW, topPx } = getCardDims();

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div id="dbp-game-wrap" ref={wrapRef}>

      {/* ── Title screen ── */}
      {screen === 'title' && (
        <div className="dbp-screen" id="dbp-title-screen">
          <div style={{ fontSize: '52px', marginBottom: '6px' }}>🧩</div>
          <h1>{lang === 'en' ? 'Animal Puzzle!' : 'どうぶつパズル'}</h1>
          <p>
            {lang === 'en' ? <>Find two matching<br />animals!</> : <>おなじ どうぶつを<br />ふたつ みつけよう！</>}
          </p>
          <div className="dbp-hi-badge">
            🏆 {lang === 'en' ? `Best: ${bestTimeDisplay > 0 ? fmtTime(bestTimeDisplay) : 'None'}` : `ベストタイム: ${bestTimeDisplay > 0 ? fmtTime(bestTimeDisplay) : 'なし'}`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <button className="dbp-big-btn" onClick={startGame}>{lang === 'en' ? '▶ Start!' : '▶ スタート！'}</button>
            <button className="ww-back-btn" onClick={() => navigate('/')}>{lang === 'en' ? '🏝️ Back to Top' : '🏝️ トップへもどる'}</button>
          </div>
        </div>
      )}

      {/* ── Game field ── */}
      {screen === 'game' && (
        <>
          {/* HUD */}
          <div id="dbp-hud">
            {/* LEFT */}
            <button className="game-back-btn" onClick={() => {
              clearInterval(timerIntRef.current);
              flippedRef.current = [];
              lockRef.current = false;
              navigate('/');
            }}>🏠</button>
            {/* CENTER */}
            <div className="dbp-hud-center">
              <div id="dbp-hud-title">{lang === 'en' ? '🧩 Animal Puzzle' : '🧩 どうぶつパズル'}</div>
              <div className="dbp-hud-score">{lang === 'en' ? 'Miss' : 'ミス'}: {missDisplay}</div>
            </div>
            {/* RIGHT */}
            <div className="dbp-hud-box">
              <div className="dbp-hud-label">{lang === 'en' ? 'Time' : 'じかん'}</div>
              <div className="dbp-hud-val">{timeDisplay}</div>
            </div>
            <button onClick={() => { const m = toggleMute(); setMuted(m); if (!m) playDoubutsuPuzzleBgm(); }}
              style={{ fontSize:20, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:10, padding:'4px 8px', cursor:'pointer', flexShrink:0 }}>
              {muted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Field with gallery canvas + card grid */}
          <div id="dbp-field" ref={fieldRef}>
            <canvas id="dbp-gallery-canvas" ref={galleryCanvasRef} />

            <div
              id="dbp-card-grid"
              style={{
                width:  gridW + 'px',
                top:    topPx + 'px',
              }}
            >
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  className={`dbp-card ${card.state === 'hidden' ? '' : card.state}`}
                  style={{ width: cardW + 'px', height: cardH + 'px' }}
                  onClick={() => handleCardClick(idx)}
                >
                  <div className="dbp-card-inner">
                    <div className="dbp-card-back" />
                    <div className="dbp-card-front">
                      <span
                        className="dbp-animal"
                        style={{ fontSize: Math.round(cardW * 0.52) + 'px' }}
                      >
                        {card.animal.e}
                      </span>
                      <span className="dbp-aname">{card.animal.n}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Result overlay ── */}
      {screen === 'result' && (
        <div id="dbp-result-overlay">
          <h2>🎉 {lang === 'en' ? 'Clear!' : 'クリア！'}</h2>
          <div className="dbp-stars-disp">{resultData.stars}</div>
          <p>
            {lang === 'en' ? 'Time' : 'タイム'}: <b style={{ fontSize: '24px', color: '#FFD700' }}>{resultData.time}</b><br />
            {lang === 'en' ? `Miss: ${resultData.misses}` : `ミス: ${resultData.misses}かい`}
          </p>
          {resultData.isNewBest && (
            <div className="dbp-new-hi-txt">🏆 {lang === 'en' ? 'Best Time Updated!' : 'ベストタイム こうしん！'}</div>
          )}
          {!resultData.isNewBest && (
            <div className="dbp-hi-badge" style={{ color: '#fff' }}>
              {lang === 'en' ? `Best: ${fmtTime(resultData.bestTime)}` : `ベストタイム: ${fmtTime(resultData.bestTime)}`}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="dbp-big-btn" onClick={startGame}>{lang === 'en' ? 'Play Again' : 'もういちど'}</button>
            <button className="dbp-big-btn blue" onClick={goTitle}>{lang === 'en' ? 'Back to Title' : 'タイトルへ'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
