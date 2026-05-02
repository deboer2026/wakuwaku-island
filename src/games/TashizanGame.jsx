import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  playTashizanBgm, stopBgm,
  playSoundCorrect, playSoundWrong, playSoundClear,
  ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { trackGameStart, trackGameClear, trackNewHighScore } from '../utils/analytics';
import { addCoins } from '../utils/coins';
import './TashizanGame.css';

const ANIMALS = ['🐱','🐶','🐰','🐸','🐼','🦊','🐧','🐻','🐮','🐷','🦁','🐨'];
const TOTAL = 10;

function getHi()   { return parseInt(localStorage.getItem('tashizan_hi') || '0'); }
function saveHi(v) { localStorage.setItem('tashizan_hi', String(v)); }

function mkQuestion() {
  const op = Math.random() < 0.6 ? '+' : '-';
  let a, b;
  if (op === '+') {
    a = 1 + Math.floor(Math.random() * 5);
    b = 1 + Math.floor(Math.random() * 5);
    if (a + b > 9) b = Math.max(1, 9 - a);
  } else {
    a = 2 + Math.floor(Math.random() * 7);
    b = 1 + Math.floor(Math.random() * (a - 1));
  }
  const ans = op === '+' ? a + b : a - b;
  const animal  = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const animal2 = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return { a, b, op, ans, animal, animal2 };
}

function mkChoices(ans) {
  const set = new Set([ans]);
  let tries = 0;
  while (set.size < 4 && tries < 40) {
    tries++;
    const delta = Math.floor(Math.random() * 4) + 1;
    const c = Math.random() < 0.5 ? ans + delta : Math.max(0, ans - delta);
    if (c !== ans && c >= 0 && c <= 10) set.add(c);
  }
  return [...set].sort(() => Math.random() - 0.5);
}

export default function TashizanGame() {
  const navigate = useNavigate();
  const [lang]    = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [screen, setScreen] = useState('title');
  const [hiScore, setHiScore] = useState(getHi());
  const [muted, setMuted]     = useState(() => getMuteState());
  const [resultData, setResultData] = useState({ title:'', msg:'', hiText:'', isNew:false });

  // question UI state
  const [qIdx, setQIdx]       = useState(0);
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);
  const [picked, setPicked]   = useState(null);   // { num, isCorrect }
  const [feedback, setFeedback]   = useState('');
  const [feedVis, setFeedVis]     = useState(false);

  const scoreRef  = useRef(0);
  const lockedRef = useRef(false);
  const timerRef  = useRef(null);

  // page title
  useEffect(() => {
    document.title = 'たしざんゲーム | わくわくアイランド - 無料子供向けゲーム';
    return () => { document.title = 'わくわくアイランド | 無料の子供向けブラウザゲーム'; };
  }, []);

  // cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); stopBgm(); };
  }, []);

  const showQuestion = useCallback((idx) => {
    lockedRef.current = false;
    setPicked(null);
    const q = mkQuestion();
    setCurrent(q);
    setChoices(mkChoices(q.ans));
    setQIdx(idx);
  }, []);

  const endGame = useCallback(() => {
    stopBgm();
    playSoundClear();
    addCoins(5);
    const c = scoreRef.current;
    const hi = getHi();
    const isNew = c > hi;
    if (isNew) { saveHi(c); trackNewHighScore('TashizanGame', c); addCoins(10); }
    trackGameClear('TashizanGame', c, 1);
    setHiScore(isNew ? c : hi);
    let title, msg;
    if (c >= 9)      { title = lang === 'en' ? '🏆 Perfect!' : '🏆 かんぺき！';  msg = lang === 'en' ? 'Math Genius!' : 'さんすうはかせだ！'; }
    else if (c >= 6) { title = lang === 'en' ? '⭐ Great!'   : '⭐ ナイス！';    msg = lang === 'en' ? 'Well done!'   : 'よくできました！'; }
    else             { title = lang === 'en' ? '📖 Try Again': '📖 もういちど'; msg = lang === 'en' ? 'Keep going!'  : 'れんしゅうしよう！'; }
    const hiText = isNew
      ? (lang === 'en' ? '🏆 New Record!' : '🏆 ニューレコード！')
      : (lang === 'en' ? `Best: ${hi}pts` : `ハイスコア: ${hi}もん`);
    setResultData({ title, msg, hiText, isNew });
    setScreen('result');
  }, [lang]);

  const onAnswer = useCallback((num) => {
    if (lockedRef.current || !current) return;
    lockedRef.current = true;
    const correct = num === current.ans;
    setPicked({ num, isCorrect: correct });
    if (correct) { scoreRef.current++; playSoundCorrect(); setFeedback('⭕'); }
    else         { playSoundWrong(); setFeedback('❌'); }
    setFeedVis(true);
    timerRef.current = setTimeout(() => {
      setFeedVis(false);
      const next = qIdx + 1;
      if (next >= TOTAL) endGame();
      else showQuestion(next);
    }, 1200);
  }, [current, qIdx, endGame, showQuestion]);

  const startGame = useCallback(async () => {
    await ensureAudioStarted();
    playTashizanBgm();
    addCoins(1);
    trackGameStart('TashizanGame');
    scoreRef.current = 0;
    lockedRef.current = false;
    setScreen('game');
    showQuestion(0);
  }, [showQuestion]);

  const prog = (qIdx / TOTAL) * 100;

  /* ── Title ── */
  if (screen === 'title') return (
    <div className="tashi-wrap">
      <div className="tashi-title-screen">
        <div className="tashi-title-icon">➕</div>
        <h1 className="tashi-title-text">{lang === 'en' ? 'Math Quiz!' : 'たしざんゲーム！'}</h1>
        <p className="tashi-title-desc">
          {lang === 'en'
            ? 'Count the animals and\nchoose the right answer!'
            : 'どうぶつを かぞえて\nこたえをえらんでね！'}
        </p>
        {hiScore > 0 && (
          <div className="tashi-hi-badge">
            🏆 {lang === 'en' ? `Best: ${hiScore}pts` : `ハイスコア: ${hiScore}もん`}
          </div>
        )}
        <button className="tashi-start-btn" onClick={startGame}>
          {lang === 'en' ? '▶ Start!' : '▶ スタート！'}
        </button>
        <button className="ww-back-btn" onClick={() => navigate('/')}>
          {lang === 'en' ? '🏝️ Back to Top' : '🏝️ トップへもどる'}
        </button>
      </div>
    </div>
  );

  /* ── Result ── */
  if (screen === 'result') return (
    <div className="tashi-wrap">
      <div className="tashi-result-screen">
        <div className="tashi-result-title">{resultData.title}</div>
        <div className="tashi-result-score">
          {lang === 'en'
            ? `Correct: ${scoreRef.current} / ${TOTAL}`
            : `せいかい: ${scoreRef.current} / ${TOTAL} もん`}
        </div>
        <div className="tashi-result-msg">{resultData.msg}</div>
        <div className="tashi-result-hi" style={{ color: resultData.isNew ? '#FFD700' : 'rgba(255,255,255,0.7)' }}>
          {resultData.hiText}
        </div>
        <div className="tashi-result-btns">
          <button className="tashi-result-btn" onClick={startGame}>
            {lang === 'en' ? 'Play Again' : 'もういちど'}
          </button>
          <button className="tashi-result-btn secondary" onClick={() => navigate('/')}>
            {lang === 'en' ? 'Back' : 'もどる'}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Game ── */
  return (
    <div className="tashi-wrap">
      {/* HUD */}
      <div className="tashi-hud">
        <button className="tashi-hud-back" onClick={() => { stopBgm(); navigate('/'); }}>🏠</button>
        <div className="tashi-hud-center">
          <div className="tashi-hud-title">➕ {lang === 'en' ? 'Math Quiz' : 'たしざん'}</div>
          <div className="tashi-hud-sub">{lang === 'en' ? `Q${qIdx + 1}/${TOTAL}` : `もんだい ${qIdx + 1}/${TOTAL}`}</div>
        </div>
        <div className="tashi-hud-box">
          <div className="tashi-hud-label">{lang === 'en' ? 'Score' : 'せいかい'}</div>
          <div className="tashi-hud-val">{scoreRef.current}</div>
        </div>
        <button className="tashi-mute-btn" onClick={() => { const m = toggleMute(); setMuted(m); if (!m) playTashizanBgm(); }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Progress */}
      <div className="tashi-progress">
        <div className="tashi-progress-bg">
          <div className="tashi-progress-fill" style={{ width: `${prog}%` }} />
        </div>
        <div className="tashi-progress-text">{qIdx} / {TOTAL}</div>
      </div>

      {/* Game area */}
      {current && (
        <div className="tashi-game-area">
          {/* Equation card */}
          <div className="tashi-eq-card">
            <div className="tashi-eq-label">
              {current.op === '+'
                ? (lang === 'en' ? 'How many in total?' : 'あわせると いくつ？')
                : (lang === 'en' ? 'How many are left?'  : 'のこりは いくつ？')}
            </div>

            {/* Row A: animals */}
            <div className="tashi-animal-row">
              {Array.from({ length: current.a }, (_, i) => (
                <span key={i} className="tashi-animal-item" style={{ animationDelay: `${i * 0.05}s` }}>
                  {current.animal}
                </span>
              ))}
            </div>

            {/* Equation row */}
            <div className="tashi-eq-row">
              <span className="tashi-num-badge">{current.a}</span>
              <span className="tashi-op-sign">{current.op === '+' ? '＋' : '－'}</span>
              <span className="tashi-num-badge">{current.b}</span>
              <span className="tashi-eq-sign">＝</span>
              <span className="tashi-q-mark">？</span>
            </div>

            {/* Row B: animals (faded for subtraction) */}
            <div className="tashi-animal-row">
              {Array.from({ length: current.b }, (_, i) => (
                <span
                  key={i}
                  className={`tashi-animal-item${current.op === '-' ? ' faded' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {current.op === '+' ? current.animal2 : current.animal}
                </span>
              ))}
            </div>
          </div>

          {/* Choices */}
          <div className="tashi-choices">
            {choices.map((num) => {
              let cls = 'tashi-choice-btn';
              if (picked) {
                if (num === picked.num) cls += picked.isCorrect ? ' correct' : ' wrong';
                else if (num === current.ans && !picked.isCorrect) cls += ' correct';
              }
              return (
                <button key={num} className={cls} onClick={() => onAnswer(num)}>
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="tashi-feedback" style={{ opacity: feedVis ? 1 : 0 }}>{feedback}</div>
    </div>
  );
}
