import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playJewelryShopBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import './JewelryShop.css';

const ACCESSORIES = [
  { e: '💍', n: 'ゆびわ' }, { e: '📿', n: 'ネックレス' }, { e: '👑', n: 'おうかん' },
  { e: '💎', n: 'ダイヤ' }, { e: '⭐', n: 'スター' }, { e: '🌙', n: 'つき' },
  { e: '🌸', n: 'はな' }, { e: '🦋', n: 'ちょうちょ' }, { e: '❤️', n: 'ハート' },
  { e: '🎀', n: 'リボン' }, { e: '🌈', n: 'にじ' }, { e: '✨', n: 'キラキラ' },
];

const CUSTOMERS = [
  { e: '🐱', n: 'ねこ' }, { e: '🐶', n: 'いぬ' }, { e: '🐰', n: 'うさぎ' },
  { e: '🐸', n: 'かえる' }, { e: '🐼', n: 'パンダ' }, { e: '🦊', n: 'きつね' },
  { e: '🐧', n: 'ペンギン' }, { e: '🐻', n: 'くま' }, { e: '🐮', n: 'うし' },
  { e: '🐷', n: 'ぶた' }, { e: '🦁', n: 'らいおん' }, { e: '🐨', n: 'こあら' },
];

const GALLERY = ['👸', '🤴', '🌟', '🎉', '🌈', '🎀', '🦋', '🌸'];

function shelfCount(stage) { return Math.min(4 + stage, ACCESSORIES.length); }
function customersPerStage(stage) { return 4 + stage; }
function getHi() { return parseInt(localStorage.getItem('jewelry_hi') || '0'); }
function saveHi(v) { localStorage.setItem('jewelry_hi', String(v)); }

function buildShelf(answer, stage) {
  const count = shelfCount(stage);
  let pool = [...ACCESSORIES];
  pool.sort(() => Math.random() - 0.5);
  if (!pool.slice(0, count).find(a => a.e === answer.e)) {
    pool = pool.filter(a => a.e !== answer.e);
    pool.unshift(answer);
  }
  const s = pool.slice(0, count);
  s.sort(() => Math.random() - 0.5);
  return s;
}

function makeQueue(stage) {
  const total = customersPerStage(stage);
  const q = [];
  for (let i = 0; i < total; i++) {
    const cust = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const want = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)];
    q.push({ customer: cust, want });
  }
  return q;
}

export default function JewelryShop() {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const bgRef = useRef(null);
  const rafRef = useRef(null);
  const galleryRef = useRef([]);

  // Mutable game state refs (for callbacks)
  const scoreRef = useRef(0);
  const stageRef = useRef(1);
  const hpRef = useRef(3);
  const queueRef = useRef([]);
  const currentAnswerRef = useRef(null);
  const servingRef = useRef(false);

  // UI state
  const [screen, setScreen] = useState('title');
  const [hiScore, setHiScore] = useState(getHi);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [hp, setHp] = useState(3);
  const [shelf, setShelf] = useState([]);
  const [queue, setQueue] = useState([]);
  const [customerChar, setCustomerChar] = useState('🐱');
  const [customerWant, setCustomerWant] = useState({ e: '💍', n: 'ゆびわ' });
  const [customerAnim, setCustomerAnim] = useState('');
  const [correctItem, setCorrectItem] = useState(null);
  const [wrongItem, setWrongItem] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [isNewHi, setIsNewHi] = useState(false);

  // Canvas background
  useEffect(() => {
    const canvas = bgRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');

    function buildGallery(W, H) {
      const g = [];
      GALLERY.forEach((e, i) => {
        g.push({ emoji: e, x: W * (0.04 + (i % 2) * 0.07), y: H * (0.1 + Math.floor(i / 2) * 0.16), size: W * 0.065, phase: i * 1.1, speed: 1.4 + i * 0.2 });
        g.push({ emoji: GALLERY[(i + 3) % GALLERY.length], x: W * (0.96 - (i % 2) * 0.07), y: H * (0.1 + Math.floor(i / 2) * 0.16), size: W * 0.065, phase: i * 1.3, speed: 1.6 + i * 0.2 });
      });
      galleryRef.current = g;
    }

    function resize() {
      canvas.width = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
      buildGallery(canvas.width, canvas.height);
    }
    resize();

    function loop() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#fce4ec';
      ctx.fillRect(0, 0, W, H);
      const t = performance.now() / 1000;
      for (let i = 0; i < 10; i++) {
        const x = W * (0.05 + i * 0.1), y = H * (0.1 + Math.sin(t * 0.7 + i) * 0.08);
        ctx.font = `${Math.round(W * 0.03 + Math.sin(t + i) * 3)}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.3 + Math.sin(t * 1.5 + i) * 0.15;
        ctx.fillText(['💎', '✨', '⭐', '🌸'][i % 4], x, y);
      }
      ctx.globalAlpha = 1;
      galleryRef.current.forEach(g => {
        const bob = Math.sin(t * g.speed + g.phase) * 5;
        ctx.font = `${Math.round(g.size)}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(g.emoji, g.x, g.y + bob);
      });
      rafRef.current = requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  function showPop(text, color, size) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'js-pop-label';
    el.textContent = text;
    el.style.color = color;
    el.style.fontSize = size + 'px';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  function spawnConfetti() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'js-pop-label js-confetti';
    el.textContent = ['🎉', '⭐', '✨', '💎', '🌟'][Math.floor(Math.random() * 5)];
    el.style.left = Math.random() * 90 + '%';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  function advanceCustomer(q, stg) {
    if (q.length === 0) {
      // Stage clear
      setScreen('stageClear');
      for (let i = 0; i < 16; i++) setTimeout(() => spawnConfetti(), i * 80);
      return;
    }
    const remaining = [...q];
    const next = remaining.shift();
    queueRef.current = remaining;
    currentAnswerRef.current = next.want;
    servingRef.current = true;

    setQueue(remaining);
    setCustomerChar(next.customer.e);
    setCustomerWant(next.want);
    setCustomerAnim('');
    setShelf(buildShelf(next.want, stg));
    setCorrectItem(null);
    setWrongItem(null);
  }

  function setupStage(stg) {
    const q = makeQueue(stg);
    queueRef.current = q;
    advanceCustomer(q, stg);
  }

  function startGame() {
    ensureAudioStarted();
    playJewelryShopBgm();
    trackGameStart('JewelryShop');

    scoreRef.current = 0;
    stageRef.current = 1;
    hpRef.current = 3;
    setScore(0);
    setStage(1);
    setHp(3);
    setScreen('game');
    setupStage(1);
  }

  function nextStage() {
    const stg = stageRef.current + 1;
    stageRef.current = stg;
    setStage(stg);
    setScreen('game');
    setupStage(stg);
  }

  function doGameOver() {
    stopBgm();
    playSoundClear();

    const hi = getHi();
    const isNew = scoreRef.current > hi;
    if (isNew) {
      saveHi(scoreRef.current);
      trackNewHighScore('JewelryShop', scoreRef.current);
    }
    trackGameClear('JewelryShop', scoreRef.current, stageRef.current);
    setHiScore(isNew ? scoreRef.current : hi);
    setIsNewHi(isNew);
    setResultData({ score: scoreRef.current, stage: stageRef.current });
    setScreen('result');
  }

  function onSelectItem(acc) {
    if (!servingRef.current) return;
    const answer = currentAnswerRef.current;
    if (acc.e === answer.e) {
      playSoundCorrect();
      servingRef.current = false;
      setCorrectItem(acc.e);
      setCustomerAnim('happy');
      const pts = 10 + (stageRef.current - 1) * 5;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      showPop(`✨ せいかい！+${pts}`, '#FFD700', 24);
      setTimeout(() => {
        advanceCustomer(queueRef.current, stageRef.current);
      }, 900);
    } else {
      playSoundWrong();
      setWrongItem(acc.e);
      setCustomerAnim('angry');
      hpRef.current = Math.max(0, hpRef.current - 1);
      setHp(hpRef.current);
      showPop('💦 ちがうよ…', '#f44336', 22);
      setTimeout(() => {
        setWrongItem(null);
        setCustomerAnim('');
        if (hpRef.current <= 0) doGameOver();
      }, 500);
    }
  }

  const lifeStr = '❤️'.repeat(Math.max(0, hp)) + '🖤'.repeat(Math.max(0, 3 - hp));

  return (
    <div ref={wrapRef} className="js-wrap">
      <canvas ref={bgRef} className="js-bg" />

      {/* ── Title Screen ── */}
      {screen === 'title' && (
        <div className="js-screen js-title-screen">
          <div style={{ fontSize: 60, marginBottom: 6 }}>💎</div>
          <h1>ほうせきやさん</h1>
          <p>
            やってきた どうぶつさんに<br />
            ほしい アクセサリを<br />
            わたしてあげよう！<br />
            たなから えらんで タップ！
          </p>
          <div className="js-hi-badge">🏆 ハイスコア: {hiScore}てん</div>
          <button className="js-big-btn" onClick={startGame}>▶ スタート！</button>
          <button className="js-back-link" onClick={() => navigate('/')}>← もどる</button>
        </div>
      )}

      {/* ── HUD ── */}
      {(screen === 'game' || screen === 'stageClear') && (
        <div className="js-hud">
          <button className="js-hud-back" onClick={() => { servingRef.current = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); navigate('/'); }}>🏠</button>
          <div className="js-hud-box">
            <div className="js-hud-label">スコア</div>
            <div className="js-hud-val">{score}</div>
          </div>
          <div className="js-hud-title">💎 ほうせきやさん</div>
          <div className="js-hud-box">
            <div className="js-hud-label">ステージ</div>
            <div className="js-hud-val">{stage}</div>
          </div>
        </div>
      )}

      {/* ── Game Area ── */}
      {screen === 'game' && (
        <div className="js-game-area">
          {/* Queue */}
          <div className="js-queue-area">
            {queue.map((c, i) => (
              <div key={i} className="js-queue-dot">{c.customer.e}</div>
            ))}
          </div>

          {/* Customer */}
          <div className="js-customer-area">
            <div className="js-speech-bubble">
              <span className="js-speech-emoji">{customerWant.e}</span>
              <div className="js-speech-text">{customerWant.n}がほしいな</div>
            </div>
            <div className={`js-customer-char ${customerAnim}`}>{customerChar}</div>
          </div>

          {/* Life */}
          <div className="js-life-area">{lifeStr}</div>

          {/* Shelf */}
          <div className="js-shop-counter">
            <div className="js-counter-label">💎 たなからえらんでね 💎</div>
            <div className="js-shelf-grid">
              {shelf.map((acc) => (
                <button
                  key={acc.e}
                  className={`js-shelf-item${correctItem === acc.e ? ' correct' : ''}${wrongItem === acc.e ? ' wrong' : ''}`}
                  onClick={() => onSelectItem(acc)}
                >
                  <span className="js-s-emoji">{acc.e}</span>
                  <span className="js-s-name">{acc.n}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Stage Clear ── */}
      {screen === 'stageClear' && (
        <div className="js-stage-clear">
          <h2>🌟 ステージ{stage} クリア！</h2>
          <p>
            ぜんいんに わたせたよ！<br />
            スコア: <b style={{ color: '#FFD700', fontSize: 20 }}>{score}</b>てん
          </p>
          <button className="js-big-btn" onClick={nextStage}>つぎへ ▶</button>
        </div>
      )}

      {/* ── Result ── */}
      {screen === 'result' && resultData && (
        <div className="js-result-overlay">
          <h2>💔 ざんねん…</h2>
          <p>
            スコア <b style={{ fontSize: 26, color: '#FFD700' }}>{resultData.score}</b> てん<br />
            ステージ {resultData.stage} まで すすんだよ！
          </p>
          <div className="js-new-hi" style={{ color: isNewHi ? '#FFD700' : 'rgba(255,255,255,0.6)' }}>
            {isNewHi ? '🏆 ニューレコード！' : `ハイスコア: ${hiScore}てん`}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="js-big-btn" onClick={startGame}>もういちど</button>
            <button className="js-big-btn js-blue-btn" onClick={() => navigate('/')}>タイトルへ</button>
          </div>
        </div>
      )}
    </div>
  );
}
