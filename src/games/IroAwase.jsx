import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  playIroAwaseBgm, stopBgm,
  playSoundCorrect, playSoundWrong, playSoundClear,
  ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { trackGameStart, trackGameClear, trackNewHighScore } from '../utils/analytics';
import { addCoins } from '../utils/coins';
import './IroAwase.css';

/* ── 色データ ──────────────────────────────────────────── */
const COLORS = {
  あか:     { hex: '#f44336' },
  あお:     { hex: '#2196F3' },
  きいろ:   { hex: '#FFEB3B' },
  しろ:     { hex: '#FFFFFF' },
  くろ:     { hex: '#212121' },
  みどり:   { hex: '#4CAF50' },
  きみどり: { hex: '#8BC34A' },
  オレンジ: { hex: '#FF9800' },
  むらさき: { hex: '#9C27B0' },
  ピンク:   { hex: '#E91E63' },
  みずいろ: { hex: '#03A9F4' },
  ちゃいろ: { hex: '#795548' },
  はいいろ: { hex: '#9E9E9E' },
};

const MIX_RULES = [
  { a:'あか',   b:'あお',     result:'むらさき' },
  { a:'あか',   b:'きいろ',   result:'オレンジ' },
  { a:'あお',   b:'きいろ',   result:'みどり'   },
  { a:'あか',   b:'しろ',     result:'ピンク'   },
  { a:'あお',   b:'しろ',     result:'みずいろ' },
  { a:'あか',   b:'くろ',     result:'ちゃいろ' },
  { a:'しろ',   b:'くろ',     result:'はいいろ' },
  { a:'あお',   b:'みどり',   result:'きみどり' },
  { a:'きいろ', b:'みどり',   result:'きみどり' },
  { a:'あか',   b:'むらさき', result:'ピンク'   },
];

const NAME_RULES = [
  { color:'あか'     },
  { color:'あお'     },
  { color:'きいろ'   },
  { color:'みどり'   },
  { color:'オレンジ' },
  { color:'むらさき' },
  { color:'ピンク'   },
  { color:'みずいろ' },
];

const TOTAL = 10;
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function getHi()      { return parseInt(localStorage.getItem('iro_hi') || '0'); }
function saveHi(v)    { localStorage.setItem('iro_hi', String(v)); }

function buildQueue() {
  const mix  = shuffle(MIX_RULES).slice(0, 7).map(r => ({ type:'mix',  ...r }));
  const name = shuffle(NAME_RULES).slice(0, 3).map(r => ({ type:'name', ...r }));
  return shuffle([...mix, ...name]);
}

export default function IroAwase() {
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
  const [picked, setPicked]   = useState(null);   // { name, isCorrect }
  const [feedback, setFeedback]   = useState('');
  const [feedVis, setFeedVis]     = useState(false);

  const queueRef  = useRef([]);
  const scoreRef  = useRef(0);
  const lockedRef = useRef(false);
  const timerRef  = useRef(null);

  // page title
  useEffect(() => {
    document.title = 'いろあわせ | わくわくアイランド - 無料子供向けゲーム';
    return () => { document.title = 'わくわくアイランド | 無料の子供向けブラウザゲーム'; };
  }, []);

  // cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); stopBgm(); };
  }, []);

  const showQuestion = useCallback((idx) => {
    lockedRef.current = false;
    setPicked(null);
    const q = queueRef.current[idx];
    setCurrent(q);
    setQIdx(idx);
    // build choices
    const correctAns = q.type === 'mix' ? q.result : q.color;
    const allColors = Object.keys(COLORS).filter(c => c !== q.a && c !== q.b && c !== correctAns);
    const dummies = shuffle(allColors).slice(0, 3);
    setChoices(shuffle([correctAns, ...dummies]));
  }, []);

  const endGame = useCallback(() => {
    stopBgm();
    playSoundClear();
    addCoins(5);
    const c = scoreRef.current;
    const hi = getHi();
    const isNew = c > hi;
    if (isNew) { saveHi(c); trackNewHighScore('IroAwase', c); addCoins(10); }
    trackGameClear('IroAwase', c, 1);
    setHiScore(isNew ? c : hi);
    let title, msg;
    if (c >= 9)      { title = lang === 'en' ? '🏆 Perfect!' : '🏆 かんぺき！';  msg = lang === 'en' ? 'Color Master!' : 'いろはかせだ！'; }
    else if (c >= 6) { title = lang === 'en' ? '⭐ Great!'   : '⭐ ナイス！';    msg = lang === 'en' ? 'Well done!'    : 'よくできました！'; }
    else             { title = lang === 'en' ? '🎨 Try Again': '🎨 もういちど'; msg = lang === 'en' ? 'Keep going!'   : 'れんしゅうしよう！'; }
    const hiText = isNew
      ? (lang === 'en' ? '🏆 New Record!' : '🏆 ニューレコード！')
      : (lang === 'en' ? `Best: ${hi}pts` : `ハイスコア: ${hi}もん`);
    setResultData({ title, msg, hiText, isNew });
    setScreen('result');
  }, [lang]);

  const onAnswer = useCallback((name) => {
    if (lockedRef.current || !current) return;
    lockedRef.current = true;
    const correctAns = current.type === 'mix' ? current.result : current.color;
    const correct = name === correctAns;
    setPicked({ name, isCorrect: correct });
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
    playIroAwaseBgm();
    addCoins(1);
    trackGameStart('IroAwase');
    scoreRef.current = 0;
    lockedRef.current = false;
    queueRef.current = buildQueue();
    setScreen('game');
    showQuestion(0);
  }, [showQuestion]);

  const prog = (qIdx / TOTAL) * 100;

  /* ── Title ── */
  if (screen === 'title') return (
    <div className="iro-wrap">
      <div className="iro-title-screen">
        <div className="iro-title-icon">🎨</div>
        <h1 className="iro-title-text">{lang === 'en' ? 'Color Match!' : 'いろあわせ！'}</h1>
        <p className="iro-title-desc">
          {lang === 'en'
            ? 'Mix colors and choose\nthe right answer!'
            : 'いろを まぜると\nなんいろになるかな？'}
        </p>
        {hiScore > 0 && (
          <div className="iro-hi-badge">
            🏆 {lang === 'en' ? `Best: ${hiScore}pts` : `ハイスコア: ${hiScore}もん`}
          </div>
        )}
        <button className="iro-start-btn" onClick={startGame}>
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
    <div className="iro-wrap">
      <div className="iro-result-screen">
        <div className="iro-result-title">{resultData.title}</div>
        <div className="iro-result-score">
          {lang === 'en'
            ? `Correct: ${scoreRef.current} / ${TOTAL}`
            : `せいかい: ${scoreRef.current} / ${TOTAL} もん`}
        </div>
        <div className="iro-result-msg">{resultData.msg}</div>
        <div className="iro-result-hi" style={{ color: resultData.isNew ? '#FFD700' : 'rgba(255,255,255,0.7)' }}>
          {resultData.hiText}
        </div>
        <div className="iro-result-btns">
          <button className="iro-result-btn" onClick={startGame}>
            {lang === 'en' ? 'Play Again' : 'もういちど'}
          </button>
          <button className="iro-result-btn secondary" onClick={() => navigate('/')}>
            {lang === 'en' ? 'Back' : 'もどる'}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Game ── */
  const correctAns = current ? (current.type === 'mix' ? current.result : current.color) : '';

  return (
    <div className="iro-wrap">
      {/* HUD */}
      <div className="iro-hud">
        <button className="iro-hud-back" onClick={() => { stopBgm(); navigate('/'); }}>🏠</button>
        <div className="iro-hud-center">
          <div className="iro-hud-title">🎨 {lang === 'en' ? 'Color Match' : 'いろあわせ'}</div>
          <div className="iro-hud-sub">{lang === 'en' ? `Q${qIdx + 1}/${TOTAL}` : `もんだい ${qIdx + 1}/${TOTAL}`}</div>
        </div>
        <div className="iro-hud-box">
          <div className="iro-hud-label">{lang === 'en' ? 'Score' : 'せいかい'}</div>
          <div className="iro-hud-val">{scoreRef.current}</div>
        </div>
        <button className="iro-mute-btn" onClick={() => { const m = toggleMute(); setMuted(m); if (!m) playIroAwaseBgm(); }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Progress */}
      <div className="iro-progress">
        <div className="iro-progress-bg">
          <div className="iro-progress-fill" style={{ width: `${prog}%` }} />
        </div>
        <div className="iro-progress-text">{qIdx} / {TOTAL}</div>
      </div>

      {/* Game area */}
      {current && (
        <div className="iro-game-area">
          {/* Question card */}
          <div className="iro-q-card">
            <div className="iro-q-label">
              {current.type === 'mix'
                ? (lang === 'en' ? 'What color do you get?' : 'まぜると なにいろ？')
                : (lang === 'en' ? 'What color is this?'   : 'この いろは なに？')}
            </div>

            {current.type === 'mix' ? (
              <div className="iro-mix-row">
                <div className="iro-circle" style={{ background: COLORS[current.a].hex }}>{current.a}</div>
                <div className="iro-op-sign">＋</div>
                <div className="iro-circle" style={{ background: COLORS[current.b].hex }}>{current.b}</div>
                <div className="iro-eq-sign">＝</div>
                <div className="iro-q-blob">？</div>
              </div>
            ) : (
              <div className="iro-mix-row">
                <div className="iro-circle large" style={{ background: COLORS[current.color].hex }} />
              </div>
            )}
          </div>

          {/* Choices */}
          <div className="iro-choices">
            {choices.map((name) => {
              let cls = 'iro-choice-btn';
              if (picked) {
                if (name === picked.name)                  cls += picked.isCorrect ? ' correct' : ' wrong';
                else if (name === correctAns && !picked.isCorrect) cls += ' correct';
              }
              const border = COLORS[name] ? `2px solid rgba(0,0,0,0.12)` : 'none';
              return (
                <button key={name} className={cls} onClick={() => onAnswer(name)}>
                  <div className="iro-choice-dot" style={{ background: COLORS[name]?.hex, border }} />
                  <div className="iro-choice-name">{name}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="iro-feedback" style={{ opacity: feedVis ? 1 : 0 }}>{feedback}</div>
    </div>
  );
}
