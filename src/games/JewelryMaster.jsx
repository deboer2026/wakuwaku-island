// JewelryMaster — ジュエリーショップ店員ゲーム
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { transitionBack } from '../utils/transition';
import {
  playJewelryMasterBgm, stopBgm,
  playSoundCorrect, playSoundWrong, playSoundClear,
  ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { addCoins } from '../utils/coins';
import { trackGameStart, trackGameClear, trackNewHighScore } from '../utils/analytics';
import { t, getLang } from '../utils/i18n';
import './JewelryMaster.css';

// ── データ定義 ──────────────────────────────────────────

const GEMS = [
  { id:'diamond',      emoji:'💎', ja:'ダイヤ',       en:'Diamond',      color:'#b3e5fc', hard:9, origin:'ロシア・ボツワナ', feature:'最も硬い天然石' },
  { id:'ruby',         emoji:'❤️', ja:'ルビー',       en:'Ruby',         color:'#ef9a9a', hard:9, origin:'ミャンマー・タイ', feature:'コランダムの一種・赤い宝石' },
  { id:'sapphire',     emoji:'💙', ja:'サファイア',   en:'Sapphire',     color:'#90caf9', hard:9, origin:'スリランカ・マダガスカル', feature:'コランダムの一種・青い宝石' },
  { id:'emerald',      emoji:'💚', ja:'エメラルド',   en:'Emerald',      color:'#a5d6a7', hard:8, origin:'コロンビア・ブラジル', feature:'ベリルの一種・深緑の宝石' },
  { id:'amethyst',     emoji:'💜', ja:'アメジスト',   en:'Amethyst',     color:'#ce93d8', hard:7, origin:'ブラジル・ウルグアイ', feature:'クォーツの一種・紫の宝石' },
  { id:'citrine',      emoji:'🟡', ja:'シトリン',     en:'Citrine',      color:'#fff59d', hard:7, origin:'ブラジル・スペイン', feature:'黄色い水晶・太陽の石' },
  { id:'rose_quartz',  emoji:'🌸', ja:'ローズクォーツ', en:'Rose Quartz', color:'#f8bbd0', hard:7, origin:'ブラジル・マダガスカル', feature:'淡いピンクの水晶' },
  { id:'aquamarine',   emoji:'🔵', ja:'アクアマリン', en:'Aquamarine',   color:'#80deea', hard:8, origin:'ブラジル・ナイジェリア', feature:'ベリルの一種・海を連想させる青' },
  { id:'opal',         emoji:'🌈', ja:'オパール',     en:'Opal',         color:'#e8eaf6', hard:6, origin:'オーストラリア・メキシコ', feature:'遊色効果で虹色に輝く' },
  { id:'garnet',       emoji:'🍷', ja:'ガーネット',   en:'Garnet',       color:'#ef9a9a', hard:7, origin:'インド・スリランカ', feature:'深紅の石・1月の誕生石' },
  { id:'pearl',        emoji:'🤍', ja:'パール',       en:'Pearl',        color:'#f5f5f5', hard:3, origin:'日本・オーストラリア', feature:'貝から生まれる有機宝石' },
  { id:'topaz',        emoji:'🧡', ja:'トパーズ',     en:'Topaz',        color:'#ffcc80', hard:8, origin:'ブラジル・パキスタン', feature:'透明または黄色の宝石' },
];

const ACCESSORIES = [
  { id:'ring',      emoji:'💍', ja:'リング',     en:'Ring' },
  { id:'necklace',  emoji:'📿', ja:'ネックレス', en:'Necklace' },
  { id:'tiara',     emoji:'👑', ja:'ティアラ',   en:'Tiara' },
  { id:'brooch',    emoji:'🎀', ja:'ブローチ',   en:'Brooch' },
  { id:'bracelet',  emoji:'✨', ja:'ブレスレット', en:'Bracelet' },
];

const CUSTOMERS = [
  { id:'princess', emoji:'👸', ja:'プリンセス', en:'Princess' },
  { id:'prince',   emoji:'🤴', ja:'プリンス',   en:'Prince' },
  { id:'mage',     emoji:'🧙', ja:'まほうつかい', en:'Mage' },
  { id:'fairy',    emoji:'🧚', ja:'ようせい',   en:'Fairy' },
];

const DIFFICULTY = {
  easy:   { label:{ja:'やさしい',en:'Easy',zh:'简单',ko:'쉬움',es:'Fácil'},   gemCount:3,  timeLimit:0,   scoreMul:1 },
  normal: { label:{ja:'ふつう',  en:'Normal',zh:'普通',ko:'보통',es:'Normal'}, gemCount:8,  timeLimit:0,   scoreMul:1.5 },
  hard:   { label:{ja:'むずかしい',en:'Hard',zh:'困难',ko:'어려움',es:'Difícil'}, gemCount:12, timeLimit:20,  scoreMul:2 },
};

const ROUNDS_PER_STAGE = 5;
const LS_HI = 'jewelry_master_hi';

function getHi()    { return parseInt(localStorage.getItem(LS_HI) || '0'); }
function saveHi(v)  { localStorage.setItem(LS_HI, String(v)); }

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeRound(diff, usedGems) {
  const count = DIFFICULTY[diff].gemCount;
  const pool = diff === 'easy'   ? GEMS.slice(0, 3)
             : diff === 'normal' ? GEMS.slice(0, 8)
             : GEMS;
  // prefer gems not recently shown
  let available = pool.filter(g => !usedGems.includes(g.id));
  if (available.length === 0) available = pool;
  const targetGem = rnd(available);
  const targetAcc = rnd(ACCESSORIES);
  const customer  = rnd(CUSTOMERS);

  // build gem display panel (include correct gem + random others)
  let panelGems = [targetGem];
  const others = pool.filter(g => g.id !== targetGem.id);
  others.sort(() => Math.random() - 0.5);
  panelGems = panelGems.concat(others.slice(0, Math.min(count - 1, others.length)));
  panelGems.sort(() => Math.random() - 0.5);

  return { customer, targetGem, targetAcc, panelGems };
}

// ── コンポーネント ────────────────────────────────────

export default function JewelryMaster() {
  const navigate = useNavigate();
  const lang = getLang();
  const wrapRef = useRef(null);
  const bgRef   = useRef(null);
  const rafRef  = useRef(null);
  const timerRef = useRef(null);

  // screen: title | game | feedback | result
  const [screen,    setScreen]    = useState('title');
  const [diff,      setDiff]      = useState('easy');
  const [hiScore,   setHiScore]   = useState(getHi);
  const [score,     setScore]     = useState(0);
  const [combo,     setCombo]     = useState(0);
  const [stage,     setStage]     = useState(1);
  const [round,     setRound]     = useState(0);
  const [muted,     setMuted]     = useState(() => getMuteState());

  const [currentRound, setCurrentRound] = useState(null);
  const [selGem,   setSelGem]   = useState(null);
  const [selAcc,   setSelAcc]   = useState(null);
  const [custAnim, setCustAnim] = useState('');

  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState(null); // { perfect, pts, gem }
  const [isNewHi,  setIsNewHi]  = useState(false);

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const stageRef = useRef(1);
  const roundRef = useRef(0);
  const usedGemsRef = useRef([]);

  // page title
  useEffect(() => {
    document.title = 'ジュエリーマスター | わくわくアイランド - 無料子供向けゲーム';
    return () => { document.title = 'わくわくアイランド | 無料の子供向けブラウザゲーム'; };
  }, []);

  // Canvas starfield background
  useEffect(() => {
    const canvas = bgRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random(),
    }));

    const sparkles = Array.from({ length: 14 }, (_, i) => ({
      emoji: ['💎','✨','⭐','🌟','💫'][i % 5],
      x: Math.random(), y: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
    }));

    function resize() {
      canvas.width  = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function loop() {
      const W = canvas.width, H = canvas.height;
      const now = performance.now() / 1000;
      ctx.clearRect(0, 0, W, H);

      // gradient bg
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#0d001a');
      grd.addColorStop(1, '#1a0533');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // stars
      for (const s of stars) {
        const alpha = 0.4 + 0.5 * Math.sin(now * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      // floating sparkles
      for (const sp of sparkles) {
        const y = sp.y * H + Math.sin(now * sp.speed + sp.phase) * 12;
        ctx.font = `${Math.round(W * 0.028 + 4)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.25 + 0.2 * Math.sin(now * 1.2 + sp.phase);
        ctx.fillText(sp.emoji, sp.x * W, y);
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      stopBgm();
    };
  }, []);

  // Timer (hard mode)
  useEffect(() => {
    if (screen !== 'game' || diff !== 'hard' || feedback) return;
    const tl = DIFFICULTY.hard.timeLimit;
    setTimeLeft(tl);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleComplete(true); // time-out → auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound, screen, feedback]);

  function showPop(text, color, size = 22) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'jm-pop';
    el.textContent = text;
    el.style.color = color;
    el.style.fontSize = size + 'px';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 850);
  }

  function spawnConfetti() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        if (!wrap.isConnected) return;
        const el = document.createElement('div');
        el.className = 'jm-pop';
        el.textContent = ['🎉','⭐','✨','💎','🌟'][Math.floor(Math.random() * 5)];
        el.style.left = (15 + Math.random() * 70) + '%';
        el.style.top  = (20 + Math.random() * 20) + '%';
        el.style.fontSize = '24px';
        el.style.color = '#fff';
        wrap.appendChild(el);
        setTimeout(() => el.remove(), 900);
      }, i * 70);
    }
  }

  async function startGame(selectedDiff) {
    await ensureAudioStarted();
    playJewelryMasterBgm();
    addCoins(1);
    trackGameStart('JewelryMaster');
    if (window.gtag) window.gtag('event', 'start', { game: 'JewelryMaster', difficulty: selectedDiff });

    scoreRef.current = 0;
    comboRef.current = 0;
    stageRef.current = 1;
    roundRef.current = 0;
    usedGemsRef.current = [];

    setScore(0); setCombo(0); setStage(1); setRound(0);
    setDiff(selectedDiff);
    setFeedback(null);
    setScreen('game');
    nextRound(selectedDiff, 0, []);
  }

  function nextRound(d, rnd_, usedGems) {
    clearInterval(timerRef.current);
    const r = makeRound(d || diff, usedGems || usedGemsRef.current);
    usedGemsRef.current = [r.targetGem.id, ...usedGemsRef.current].slice(0, 4);
    roundRef.current = rnd_ + 1;
    setRound(roundRef.current);
    setCurrentRound(r);
    setSelGem(null);
    setSelAcc(null);
    setCustAnim('');
    setFeedback(null);
  }

  const handleComplete = useCallback((timeout = false) => {
    if (!currentRound) return;
    clearInterval(timerRef.current);

    const { targetGem, targetAcc } = currentRound;
    const gemOk = selGem === targetGem.id;
    const accOk = selAcc === targetAcc.id;

    const comboCurrent = comboRef.current;
    const comboMul = Math.min(1 + comboCurrent * 0.5, 5); // x1 to x5
    const diffMul  = DIFFICULTY[diff].scoreMul;
    const timeBonusMul = (diff === 'hard' && !timeout) ? (1 + timeLeft / DIFFICULTY.hard.timeLimit) : 1;

    let pts = 0;
    let grade = '';
    if (gemOk && accOk) {
      pts = Math.round(500 * diffMul * comboMul * timeBonusMul);
      grade = 'perfect';
      comboRef.current += 1;
      playSoundCorrect();
      setCustAnim('happy');
      spawnConfetti();
    } else if (gemOk || accOk) {
      pts = Math.round(200 * diffMul);
      grade = 'nice';
      comboRef.current = 0;
      playSoundCorrect();
      setCustAnim('happy');
    } else {
      pts = 50;
      grade = 'miss';
      comboRef.current = 0;
      playSoundWrong();
      setCustAnim('sad');
    }

    scoreRef.current += pts;
    setScore(scoreRef.current);
    setCombo(comboRef.current);

    const popText = grade === 'perfect' ? `✨ パーフェクト！ +${pts}`
                  : grade === 'nice'    ? `👍 ナイス！ +${pts}`
                  : `💦 ざんねん… +${pts}`;
    const popColor = grade === 'perfect' ? '#ffe082' : grade === 'nice' ? '#a5d6a7' : '#ef9a9a';
    showPop(popText, popColor, 20);

    setFeedback({ grade, pts, gem: targetGem, targetGem, targetAcc, gemOk, accOk });
  }, [currentRound, selGem, selAcc, diff, timeLeft]);

  function handleNext() {
    const nextR = roundRef.current;
    if (nextR >= ROUNDS_PER_STAGE) {
      // stage clear
      stageRef.current += 1;
      setStage(stageRef.current);
      roundRef.current = 0;
      nextRound(diff, 0, []);
      usedGemsRef.current = [];
    } else {
      nextRound(diff, nextR, usedGemsRef.current);
    }
  }

  function endGame() {
    stopBgm();
    playSoundClear();
    addCoins(5);

    const hi = getHi();
    const isNew = scoreRef.current > hi;
    if (isNew) {
      saveHi(scoreRef.current);
      addCoins(10);
      trackNewHighScore('JewelryMaster', scoreRef.current);
      if (window.gtag) window.gtag('event', 'newHighScore', { game: 'JewelryMaster', score: scoreRef.current });
    }
    trackGameClear('JewelryMaster', scoreRef.current, stageRef.current);
    if (window.gtag) window.gtag('event', 'clear', { game: 'JewelryMaster', score: scoreRef.current });

    setHiScore(isNew ? scoreRef.current : hi);
    setIsNewHi(isNew);
    setScreen('result');
  }

  const L = (obj) => obj[lang] ?? obj.ja ?? '';

  const diffLabel = (d) => L(DIFFICULTY[d].label);

  // Timer bar color
  const timerRatio = diff === 'hard' ? timeLeft / DIFFICULTY.hard.timeLimit : 1;
  const timerColor = timerRatio > 0.5 ? '#66bb6a' : timerRatio > 0.25 ? '#ffa726' : '#ef5350';

  return (
    <div ref={wrapRef} className="jm-wrap">
      <canvas ref={bgRef} className="jm-bg" />

      {/* ── Title ── */}
      {screen === 'title' && (
        <div className="jm-screen jm-title-screen">
          <div style={{ fontSize: 64, marginBottom: 4 }}>💎</div>
          <h1>
            {{ ja:'ジュエリーマスター', en:'Jewelry Master', zh:'珠宝大师', ko:'주얼리 마스터', es:'Maestro Joyero' }[lang] || 'ジュエリーマスター'}
          </h1>
          <p>
            {{ ja: <>おきゃくさんのリクエストに<br />こたえて ほうせきと<br />アクセサリをえらぼう！</>,
               en: <>Answer the customer's request!<br />Pick the right gem &amp; accessory!</>,
               zh: <>回应客人的请求！<br />选择正确的宝石和配饰！</>,
               ko: <>손님의 요청에 답하세요！<br />맞는 보석과 액세서리를 골라요！</>,
               es: <>¡Responde al pedido del cliente!<br />¡Elige la joya y el accesorio correcto!</> }[lang] }
          </p>
          <div className="jm-hi-badge">🏆 {t(lang,'best')}: {hiScore}</div>

          <div style={{ marginBottom: 8, color: '#ccc', fontSize: 13 }}>
            {{ ja:'むずかしさをえらんでね', en:'Select difficulty', zh:'选择难度', ko:'난이도 선택', es:'Selecciona dificultad' }[lang] || 'むずかしさをえらんでね'}
          </div>
          <div className="jm-diff-btns">
            <button className="jm-diff-btn jm-diff-easy"   onClick={() => startGame('easy')}>
              🌟 {diffLabel('easy')}
            </button>
            <button className="jm-diff-btn jm-diff-normal" onClick={() => startGame('normal')}>
              ⭐ {diffLabel('normal')}
            </button>
            <button className="jm-diff-btn jm-diff-hard"   onClick={() => startGame('hard')}>
              💎 {diffLabel('hard')} ⏱
            </button>
          </div>
          <button className="jm-back-btn" onClick={() => transitionBack(navigate)}>
            {t(lang, 'back')}
          </button>
        </div>
      )}

      {/* ── HUD (game) ── */}
      {screen === 'game' && (
        <div className="jm-hud">
          <button className="jm-hud-back" onClick={() => { stopBgm(); transitionBack(navigate); }}>🏠</button>
          <div className="jm-hud-center">
            <div className="jm-hud-title">💎 ジュエリーマスター</div>
            <div className="jm-hud-score">{t(lang,'score')}: {score}</div>
          </div>
          {combo >= 2 && (
            <div className="jm-hud-combo">🔥 x{Math.min(1 + combo * 0.5, 5).toFixed(1)}</div>
          )}
          <div className="jm-hud-box">
            <div className="jm-hud-label">{t(lang,'stage')}</div>
            <div className="jm-hud-val">{stage}-{round}/{ROUNDS_PER_STAGE}</div>
          </div>
          <button className="jm-mute-btn" onClick={() => { const m = toggleMute(); setMuted(m); if (!m) playJewelryMasterBgm(); }}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      )}

      {/* ── Game ── */}
      {screen === 'game' && currentRound && !feedback && (
        <div className="jm-game-area">
          {/* Customer zone */}
          <div className="jm-customer-zone">
            <div className="jm-speech">
              <span className="jm-speech-gem">{currentRound.targetGem.emoji}</span>
              <span className="jm-speech-acc">{currentRound.targetAcc.emoji} {currentRound.targetAcc.ja}</span>
              <span className="jm-speech-req">
                {currentRound.targetGem.ja}の{currentRound.targetAcc.ja}がほしい！
              </span>
            </div>
            <div className={`jm-customer-char ${custAnim}`}>
              {currentRound.customer.emoji}
            </div>
          </div>

          {/* Timer bar (hard mode) */}
          {diff === 'hard' && (
            <div className="jm-timer-bar-wrap">
              <div className="jm-timer-bar" style={{ width: `${timerRatio * 100}%`, background: timerColor }} />
            </div>
          )}

          {/* Panels */}
          <div className="jm-panels">
            {/* Gem selection */}
            <div>
              <div className="jm-section-label">
                💎 {{ ja:'ほうせきをえらんでね', en:'Choose a gem', zh:'选择宝石', ko:'보석을 선택하세요', es:'Elige una gema' }[lang] || 'ほうせきをえらんでね'}
              </div>
              <div className="jm-gem-grid">
                {currentRound.panelGems.map(gem => (
                  <button
                    key={gem.id}
                    className={`jm-gem-btn${selGem === gem.id ? ' selected' : ''}`}
                    onClick={() => setSelGem(gem.id)}
                  >
                    <span className="jm-gem-emoji">{gem.emoji}</span>
                    <span className="jm-gem-name">{gem.ja}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessory selection */}
            <div>
              <div className="jm-section-label">
                👑 {{ ja:'アクセサリをえらんでね', en:'Choose accessory', zh:'选择饰品', ko:'액세서리를 선택하세요', es:'Elige accesorio' }[lang] || 'アクセサリをえらんでね'}
              </div>
              <div className="jm-acc-row">
                {ACCESSORIES.map(acc => (
                  <button
                    key={acc.id}
                    className={`jm-acc-btn${selAcc === acc.id ? ' selected' : ''}`}
                    onClick={() => setSelAcc(acc.id)}
                  >
                    <span className="jm-acc-emoji">{acc.emoji}</span>
                    <span className="jm-acc-name">{acc.ja}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Complete button */}
            <button
              className="jm-complete-btn"
              disabled={!selGem || !selAcc}
              onClick={() => handleComplete(false)}
            >
              ✨ {{ ja:'かんせい！', en:'Done!', zh:'完成！', ko:'완성！', es:'¡Listo!' }[lang] || 'かんせい！'}
            </button>
          </div>
        </div>
      )}

      {/* ── Feedback overlay ── */}
      {screen === 'game' && feedback && (
        <div className="jm-feedback">
          <div className="jm-feedback-icon">
            {feedback.grade === 'perfect' ? '🌟' : feedback.grade === 'nice' ? '👍' : '💦'}
          </div>
          <div className="jm-feedback-title">
            {feedback.grade === 'perfect'
              ? ({ ja:'パーフェクト！', en:'Perfect!', zh:'完美！', ko:'퍼펙트!', es:'¡Perfecto!' }[lang] || 'パーフェクト！')
              : feedback.grade === 'nice'
              ? ({ ja:'ナイス！', en:'Nice!', zh:'不错！', ko:'잘했어요!', es:'¡Bien!' }[lang] || 'ナイス！')
              : ({ ja:'ざんねん…', en:'Oops...', zh:'可惜…', ko:'아쉬워요…', es:'Uy...' }[lang] || 'ざんねん…')}
          </div>
          <div className="jm-feedback-pts">+{feedback.pts} pt</div>

          {/* Answer reveal */}
          <div style={{ display:'flex', gap:16, marginBottom:12, fontSize:13, color:'#e0e0e0' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:28 }}>{feedback.targetGem.emoji}</div>
              <div style={{ color: feedback.gemOk ? '#a5d6a7' : '#ef9a9a' }}>
                {feedback.gemOk ? '✅' : '❌'} {feedback.targetGem.ja}
              </div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:28 }}>{feedback.targetAcc.emoji}</div>
              <div style={{ color: feedback.accOk ? '#a5d6a7' : '#ef9a9a' }}>
                {feedback.accOk ? '✅' : '❌'} {feedback.targetAcc.ja}
              </div>
            </div>
          </div>

          {/* Gem knowledge */}
          <div className="jm-gem-info">
            <div className="jm-gem-info-name">{feedback.gem.ja}</div>
            <div className="jm-gem-info-en">({feedback.gem.en})</div>
            <div className="jm-gem-info-facts">
              🔷 {feedback.gem.feature}<br />
              ⚡ 硬度: {feedback.gem.hard}<br />
              🌍 産地: {feedback.gem.origin}
            </div>
          </div>

          {round >= ROUNDS_PER_STAGE ? (
            <button className="jm-next-btn" onClick={endGame}>
              🏆 {{ ja:'けっかをみる', en:'See Results', zh:'查看结果', ko:'결과보기', es:'Ver resultado' }[lang] || 'けっかをみる'}
            </button>
          ) : (
            <button className="jm-next-btn" onClick={handleNext}>
              {{ ja:'つぎのおきゃくさん', en:'Next Customer', zh:'下一位顾客', ko:'다음 손님', es:'Siguiente cliente' }[lang] || 'つぎのおきゃくさん'} ▶
            </button>
          )}
        </div>
      )}

      {/* ── Result ── */}
      {screen === 'result' && (
        <div className="jm-screen jm-result">
          <h2>🎉 {{ ja:'おつかれさま！', en:'Well done!', zh:'辛苦了！', ko:'수고했어요!', es:'¡Buen trabajo!' }[lang] || 'おつかれさま！'}</h2>
          <div className="jm-result-score">{score} pt</div>
          <div className="jm-result-sub">
            Stage {stage} · {diffLabel(diff)}
          </div>
          <div className="jm-new-hi" style={{ color: isNewHi ? '#ffe082' : 'rgba(255,255,255,0.5)' }}>
            {isNewHi
              ? `🏆 ${t(lang, 'newRecord')}`
              : `${t(lang, 'best')}: ${hiScore}`}
          </div>
          <div className="jm-result-btns">
            <button className="jm-big-btn" onClick={() => { setScreen('title'); stopBgm(); }}>
              {t(lang, 'retry')}
            </button>
            <button className="jm-big-btn jm-blue-btn" onClick={() => { stopBgm(); transitionBack(navigate); }}>
              {t(lang, 'backToTitle')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
