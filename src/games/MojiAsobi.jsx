import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { transitionBack } from '../utils/transition';
import {
  playMojiAsobiBgm, stopBgm,
  playSoundCorrect, playSoundWrong, playSoundClear,
  ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { t } from '../utils/i18n';
import { trackGameStart, trackGameClear, trackNewHighScore } from '../utils/analytics';
import { addCoins } from '../utils/coins';
import './MojiAsobi.css';
import RecommendedGames from '../components/RecommendedGames';

/* ── 問題データ ─────────────────────────────────────────── */
const QUESTIONS = [
  { emoji:'🐱', word:'ねこ',      dummies:['いぬ','うさぎ','くま','とり','さる','へび'] },
  { emoji:'🐶', word:'いぬ',      dummies:['ねこ','うさぎ','くま','とり','さる','へび'] },
  { emoji:'🐰', word:'うさぎ',    dummies:['ねこ','いぬ','くま','とり','さる','へび'] },
  { emoji:'🐻', word:'くま',      dummies:['ねこ','いぬ','うさぎ','とり','さる','へび'] },
  { emoji:'🐸', word:'かえる',    dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🐼', word:'パンダ',    dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🦊', word:'きつね',    dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🐧', word:'ペンギン',  dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🐮', word:'うし',      dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🐷', word:'ぶた',      dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🦁', word:'らいおん',  dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🐯', word:'とら',      dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🐘', word:'ぞう',      dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🦒', word:'きりん',    dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🐨', word:'コアラ',    dummies:['ねこ','いぬ','うさぎ','くま','とり','さる'] },
  { emoji:'🐙', word:'たこ',      dummies:['ねこ','いぬ','うさぎ','さかな','かに','えび'] },
  { emoji:'🐟', word:'さかな',    dummies:['ねこ','いぬ','うさぎ','たこ','かに','えび'] },
  { emoji:'🦀', word:'かに',      dummies:['ねこ','いぬ','たこ','さかな','えび','くじら'] },
  { emoji:'🐬', word:'いるか',    dummies:['ねこ','いぬ','たこ','さかな','くじら','えび'] },
  { emoji:'🦋', word:'ちょうちょ',dummies:['ねこ','いぬ','うさぎ','とり','さる','へび'] },
];

const TOTAL = 10;

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function getHi()      { return parseInt(localStorage.getItem('moji_hi') || '0'); }
function saveHi(v)    { localStorage.setItem('moji_hi', String(v)); }

export default function MojiAsobi() {
  const navigate = useNavigate();
  const [lang]    = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [screen, setScreen] = useState('title');
  const [hiScore, setHiScore] = useState(getHi());
  const [muted, setMuted]     = useState(() => getMuteState());
  const [resultData, setResultData] = useState({ title:'', msg:'', hiText:'', isNew:false });

  // question UI state
  const [qIdx, setQIdx]         = useState(0);
  const [qEmoji, setQEmoji]     = useState('');
  const [choices, setChoices]   = useState([]);
  const [reveal, setReveal]     = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedVis, setFeedVis]   = useState(false);
  const [picked, setPicked]     = useState(null);   // { word, isCorrect }

  const queueRef  = useRef([]);
  const scoreRef  = useRef(0);
  const lockedRef = useRef(false);
  const timerRef  = useRef(null);

  // page title
  useEffect(() => {
    document.title = 'もじあそび | わくわくアイランド - 無料子供向けゲーム';
    return () => { document.title = 'わくわくアイランド | 無料の子供向けブラウザゲーム'; };
  }, []);

  // message handler
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goBack') window.history.back();
      if (e.data?.type === 'goHome') window.location.href = '/';
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      stopBgm();
    };
  }, []);

  const showQuestion = useCallback((idx) => {
    lockedRef.current = false;
    setPicked(null);
    setReveal('');
    const q = queueRef.current[idx];
    const opts = shuffle([q.word, ...shuffle(q.dummies).slice(0, 3)]);
    setQEmoji(q.emoji);
    setChoices(opts);
    setQIdx(idx);
  }, []);

  const endGame = useCallback(() => {
    stopBgm();
    playSoundClear();
    addCoins(5);
    const c = scoreRef.current;
    const hi = getHi();
    const isNew = c > hi;
    if (isNew) { saveHi(c); trackNewHighScore('MojiAsobi', c); addCoins(10); }
    trackGameClear('MojiAsobi', c, 1);
    setHiScore(isNew ? c : hi);
    let title, msg;
    if (c >= 9)      { title = {ja:'🏆 かんぺき！', en:'🏆 Perfect!', zh:'🏆 完美！', ko:'🏆 완벽해요!', es:'🏆 ¡Perfecto!'}[lang] || '🏆 かんぺき！';   msg = {ja:'もじはかせだ！', en:'Word Master!', zh:'文字大师！', ko:'글자 마스터!', es:'¡Maestro de palabras!'}[lang] || 'もじはかせだ！'; }
    else if (c >= 6) { title = {ja:'⭐ ナイス！', en:'⭐ Great!', zh:'⭐ 很棒！', ko:'⭐ 잘했어요!', es:'⭐ ¡Bien!'}[lang] || '⭐ ナイス！';     msg = {ja:'よくできました！', en:'Well done!', zh:'干得好！', ko:'잘했어요!', es:'¡Bien hecho!'}[lang] || 'よくできました！'; }
    else             { title = {ja:'📖 もういちど', en:'📖 Try Again', zh:'📖 再试一次！', ko:'📖 다시 도전!', es:'📖 ¡Inténtalo!'}[lang] || '📖 もういちど';   msg = {ja:'れんしゅうしよう！', en:'Keep going!', zh:'继续练习！', ko:'계속 연습해요!', es:'¡Sigue adelante!'}[lang] || 'れんしゅうしよう！'; }
    const hiText = isNew
      ? ({ja:'🏆 ニューレコード！', en:'🏆 New Record!', zh:'🏆 新纪录！', ko:'🏆 신기록!', es:'🏆 ¡Nuevo récord!'}[lang] || '🏆 ニューレコード！')
      : `${t(lang,'best')}: ${hi}`;
    setResultData({ title, msg, hiText, isNew });
    setScreen('result');
  }, [lang]);

  const onAnswer = useCallback((chosen) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    const current = queueRef.current[qIdx];
    const correct = chosen === current.word;
    setPicked({ word: chosen, isCorrect: correct });
    setReveal(current.word);
    if (correct) {
      scoreRef.current++;
      playSoundCorrect();
      setFeedback('⭕');
    } else {
      playSoundWrong();
      setFeedback('❌');
    }
    setFeedVis(true);
    timerRef.current = setTimeout(() => {
      setFeedVis(false);
      const next = qIdx + 1;
      if (next >= TOTAL) { endGame(); }
      else { showQuestion(next); }
    }, 1100);
  }, [qIdx, endGame, showQuestion]);

  const startGame = useCallback(async () => {
    await ensureAudioStarted();
    playMojiAsobiBgm();
    addCoins(1);
    trackGameStart('MojiAsobi');
    scoreRef.current = 0;
    lockedRef.current = false;
    queueRef.current = shuffle(QUESTIONS).slice(0, TOTAL);
    setScreen('game');
    showQuestion(0);
  }, [showQuestion]);

  const prog = (qIdx / TOTAL) * 100;
  const current = queueRef.current[qIdx];

  /* ── Title ── */
  if (screen === 'title') return (
    <div className="moji-wrap">
      <div className="moji-title-screen">
        <div className="moji-title-icon">🔤</div>
        <h1 className="moji-title-text">{{ja:'もじあそび！', en:'Letter Fun!', zh:'文字游戏！', ko:'글자 놀이!', es:'¡Juego de Letras!'}[lang] || 'もじあそび！'}</h1>
        <p className="moji-title-desc">
          {lang === 'en'
            ? 'Look at the picture and\nchoose the right hiragana!'
            : lang === 'zh' ? '看图片选择\n正确的平假名！'
            : lang === 'ko' ? '그림을 보고\n올바른 히라가나를 골라요！'
            : lang === 'es' ? '¡Mira el dibujo y\nelige el hiragana correcto!'
            : 'えをみて ただしい\nひらがなを えらんでね！'}
        </p>
        {hiScore > 0 && (
          <div className="moji-hi-badge">
            🏆 {t(lang,'best')}: {hiScore}
          </div>
        )}
        <button className="moji-start-btn" onClick={startGame}>
          ▶ {t(lang,'start')}！
        </button>
        <button className="ww-back-btn" onClick={() => transitionBack(navigate)}>
          {t(lang,'back')}
        </button>
      </div>
    </div>
  );

  /* ── Result ── */
  if (screen === 'result') return (
    <div className="moji-wrap">
      <div className="moji-result-screen">
        <div className="moji-result-title">{resultData.title}</div>
        <div className="moji-result-score">
          {{ja:`せいかい: ${scoreRef.current} / ${TOTAL} もん`, en:`Correct: ${scoreRef.current} / ${TOTAL}`, zh:`正确: ${scoreRef.current} / ${TOTAL}`, ko:`정답: ${scoreRef.current} / ${TOTAL}`, es:`Correcto: ${scoreRef.current} / ${TOTAL}`}[lang] || `せいかい: ${scoreRef.current} / ${TOTAL} もん`}
        </div>
        <div className="moji-result-msg">{resultData.msg}</div>
        <div className={`moji-result-hi ${resultData.isNew ? 'moji-result-new' : ''}`} style={{ color: resultData.isNew ? '#FFD700' : 'rgba(255,255,255,0.7)' }}>
          {resultData.hiText}
        </div>
        <RecommendedGames currentRoute="/moji" />
        <div className="moji-result-btns">
          <button className="moji-result-btn" onClick={startGame}>
            {t(lang,'retry')}
          </button>
          <button className="moji-result-btn secondary" onClick={() => transitionBack(navigate)}>
            {t(lang,'back')}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Game ── */
  return (
    <div className="moji-wrap">
      {/* HUD */}
      <div className="moji-hud">
        <button className="moji-hud-back" onClick={() => { stopBgm(); transitionBack(navigate); }}>🏠</button>
        <div className="moji-hud-center">
          <div className="moji-hud-title">🔤 {{ja:'もじあそび', en:'Letter Fun', zh:'文字游戏', ko:'글자 놀이', es:'Letras'}[lang] || 'もじあそび'}</div>
          <div className="moji-hud-sub">{{ja:`もんだい ${qIdx + 1}/${TOTAL}`, en:`Q${qIdx + 1}/${TOTAL}`, zh:`第${qIdx + 1}/${TOTAL}题`, ko:`문제 ${qIdx + 1}/${TOTAL}`, es:`P${qIdx + 1}/${TOTAL}`}[lang] || `もんだい ${qIdx + 1}/${TOTAL}`}</div>
        </div>
        <div className="moji-hud-box">
          <div className="moji-hud-label">{t(lang,'score')}</div>
          <div className="moji-hud-val">{scoreRef.current}</div>
        </div>
        <button className="moji-mute-btn" onClick={() => { const m = toggleMute(); setMuted(m); if (!m) playMojiAsobiBgm(); }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Progress */}
      <div className="moji-progress">
        <div className="moji-progress-bg">
          <div className="moji-progress-fill" style={{ width: `${prog}%` }} />
        </div>
        <div className="moji-progress-text">{qIdx} / {TOTAL}</div>
      </div>

      {/* Game area */}
      <div className="moji-game-area">
        <div className="moji-question">
          <div className="moji-q-label">
            {{ja:'これは なんという どうぶつ？', en:'What animal is this?', zh:'这是什么动物？', ko:'이건 어떤 동물일까요？', es:'¿Qué animal es este?'}[lang] || 'これは なんという どうぶつ？'}
          </div>
          <div className="moji-q-emoji">{qEmoji}</div>
          <div className="moji-q-reveal">{reveal}</div>
        </div>

        <div className="moji-choices">
          {choices.map((ch) => {
            let cls = 'moji-choice-btn';
            if (picked) {
              if (ch === picked.word) cls += picked.isCorrect ? ' correct' : ' wrong';
              else if (ch === current?.word && !picked.isCorrect) cls += ' correct';
            }
            return (
              <button key={ch} className={cls} onClick={() => onAnswer(ch)}>
                {ch}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      <div className="moji-feedback" style={{ opacity: feedVis ? 1 : 0 }}>{feedback}</div>
    </div>
  );
}
