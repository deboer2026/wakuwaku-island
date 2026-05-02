import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  playKakurenboBgm, stopBgm,
  playSoundCorrect, playSoundWrong, playSoundClear,
  playSoundReveal, playSoundWiggle,
  ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { trackGameStart, trackGameClear, trackNewHighScore } from '../utils/analytics';
import { addCoins } from '../utils/coins';
import './DoubutsuKakurenbo.css';

// ─── 定数 ─────────────────────────────────────────────────────────────────────

const ANIMALS = [
  { emoji: '🐱', name: 'ねこ',   nameEn: 'Cat'    },
  { emoji: '🐶', name: 'いぬ',   nameEn: 'Dog'    },
  { emoji: '🐸', name: 'かえる', nameEn: 'Frog'   },
  { emoji: '🐼', name: 'パンダ', nameEn: 'Panda'  },
  { emoji: '🦊', name: 'きつね', nameEn: 'Fox'    },
  { emoji: '🐰', name: 'うさぎ', nameEn: 'Bunny'  },
  { emoji: '🐧', name: 'ペンギン',nameEn:'Penguin' },
  { emoji: '🐻', name: 'くま',   nameEn: 'Bear'   },
  { emoji: '🐨', name: 'コアラ', nameEn: 'Koala'  },
  { emoji: '🦁', name: 'ライオン',nameEn:'Lion'    },
];

const HIDES = ['🌿', '🌳', '🪨', '🌸', '🌲', '🍀', '🌺', '🌾', '🎋', '🌴', '🏔️', '🌵'];

const STAGES = [
  { id: 1, objects: 6,  targets: 3, time: 0,  label: 'Stage 1' },
  { id: 2, objects: 9,  targets: 5, time: 60, label: 'Stage 2' },
  { id: 3, objects: 12, targets: 7, time: 45, label: 'Stage 3' },
];

const GALLERY = ['👸','🤴','👑','🌈','⭐','🎉','🦋','🌸','🐮','🦝','🐔','🐦','🦄'];

function getHi() { return parseInt(localStorage.getItem('kakurenbo_hi') || '0'); }
function saveHi(v) { localStorage.setItem('kakurenbo_hi', String(v)); }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── コンポーネント ────────────────────────────────────────────────────────────

export default function DoubutsuKakurenbo() {
  const navigate = useNavigate();
  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');

  // ─ Screen state ─
  const [screen, setScreen] = useState('title'); // title | game | stageClear | result
  const [stage, setStage] = useState(1);
  const [objects, setObjects] = useState([]);
  const [target, setTarget] = useState(null);
  const [found, setFound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hiScore, setHiScore] = useState(getHi());
  const [resultData, setResultData] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [muted, setMuted] = useState(() => getMuteState());

  // ─ Refs ─
  const runRef = useRef(false);
  const timerRef = useRef(null);
  const stageRef = useRef(1);
  const foundRef = useRef(0);
  const totalScoreRef = useRef(0);
  const startTimeRef = useRef(0);

  // ─ Gallery ─
  const [gallery] = useState(() =>
    GALLERY.map((emoji, i) => ({
      emoji,
      side: i % 2 === 0 ? 'left' : 'right',
      top: 10 + (i % 7) * 12,
      phase: i * 0.8,
    }))
  );

  // ─── Build stage ───────────────────────────────────────────────────────────

  const buildStage = useCallback((stageId) => {
    const cfg = STAGES[stageId - 1];
    // Pick target animal
    const tgt = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    // Pick hideout emojis
    const hidePool = shuffle([...HIDES]).slice(0, cfg.objects);
    // Assign: cfg.targets get the target animal, rest get different animals
    const otherAnimals = shuffle(ANIMALS.filter(a => a.emoji !== tgt.emoji));
    const contents = [];
    const targetSlots = new Set();
    while (targetSlots.size < cfg.targets) {
      targetSlots.add(Math.floor(Math.random() * cfg.objects));
    }
    for (let i = 0; i < cfg.objects; i++) {
      if (targetSlots.has(i)) {
        contents.push({ animal: tgt, isTarget: true });
      } else {
        const other = otherAnimals[(i - targetSlots.size + otherAnimals.length) % otherAnimals.length];
        contents.push({ animal: other, isTarget: false });
      }
    }
    // Build objects array
    const objs = hidePool.map((hide, i) => ({
      id: i,
      hide,
      content: contents[i],
      state: 'hidden', // 'hidden' | 'revealed' | 'correct' | 'wrong' | 'found'
    }));
    return { objs: shuffle(objs), tgt, cfg };
  }, []);

  // ─── Start game ────────────────────────────────────────────────────────────

  const startGame = useCallback(async () => {
    runRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);

    stageRef.current = 1;
    foundRef.current = 0;
    totalScoreRef.current = 0;
    setStage(1);
    setFound(0);
    setTotalScore(0);

    const { objs, tgt, cfg } = buildStage(1);
    setObjects(objs);
    setTarget(tgt);

    const t = cfg.time;
    setTimeLeft(t);
    runRef.current = true;
    startTimeRef.current = Date.now();

    setScreen('game');

    await ensureAudioStarted();
    playKakurenboBgm();
    addCoins(1);
    trackGameStart('DoubutsuKakurenbo');

    if (t > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            runRef.current = false;
            setTimeout(() => doGameOver(false), 300);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildStage]);

  // ─── Tap object ────────────────────────────────────────────────────────────

  const tapObject = useCallback((id) => {
    if (!runRef.current) return;

    setObjects(prev => {
      const obj = prev.find(o => o.id === id);
      if (!obj || obj.state !== 'hidden') return prev;

      if (obj.content.isTarget) {
        // Correct!
        playSoundReveal();
        foundRef.current += 1;
        const newFound = foundRef.current;
        setFound(newFound);

        const cfg = STAGES[stageRef.current - 1];
        const updated = prev.map(o =>
          o.id === id ? { ...o, state: 'correct' } : o
        );

        if (newFound >= cfg.targets) {
          // Stage clear
          const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
          totalScoreRef.current += cfg.targets * 10 + (cfg.time > 0 ? Math.max(0, cfg.time - elapsed) : 30);
          setTotalScore(totalScoreRef.current);
          runRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);

          if (stageRef.current >= 3) {
            setTimeout(() => doGameOver(true), 600);
          } else {
            playSoundClear();
            setTimeout(() => setScreen('stageClear'), 600);
          }
        }

        return updated;
      } else {
        // Wrong animal
        playSoundWiggle();
        const updated = prev.map(o =>
          o.id === id ? { ...o, state: 'wrong' } : o
        );
        // Reset after animation
        setTimeout(() => {
          setObjects(prev2 =>
            prev2.map(o => o.id === id ? { ...o, state: 'hidden' } : o)
          );
        }, 900);
        return updated;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Next stage ────────────────────────────────────────────────────────────

  const goNextStage = useCallback(async () => {
    stageRef.current += 1;
    foundRef.current = 0;
    setStage(stageRef.current);
    setFound(0);

    const { objs, tgt, cfg } = buildStage(stageRef.current);
    setObjects(objs);
    setTarget(tgt);

    const t = cfg.time;
    setTimeLeft(t);
    runRef.current = true;
    startTimeRef.current = Date.now();
    setScreen('game');

    await ensureAudioStarted();
    playKakurenboBgm();

    if (t > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            runRef.current = false;
            setTimeout(() => doGameOver(false), 300);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildStage]);

  // ─── Game over ─────────────────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doGameOver = useCallback((allClear) => {
    stopBgm();
    playSoundClear();
    addCoins(5);

    const score = totalScoreRef.current;
    const hi = getHi();
    const isNew = score > hi && score > 0;
    if (isNew) {
      saveHi(score);
      trackNewHighScore('DoubutsuKakurenbo', score);
      addCoins(10);
    }
    trackGameClear('DoubutsuKakurenbo', score, stageRef.current);
    setHiScore(isNew ? score : hi);

    let title, msg;
    if (allClear) {
      title = lang === 'en' ? '🏆 All Found!' : '🏆 ぜんぶみつけた！';
      msg   = lang === 'en' ? 'You found all the animals! Amazing!' : 'どうぶつを ぜんぶ みつけたよ！すごい！';
    } else if (stageRef.current >= 2) {
      title = lang === 'en' ? '⭐ Nice Try!' : '⭐ よくがんばった！';
      msg   = lang === 'en' ? `Cleared ${stageRef.current - 1} stage(s)! Keep going!` : `ステージ${stageRef.current - 1}まで クリア！もういちどチャレンジ！`;
    } else {
      title = lang === 'en' ? '🌿 Try Again!' : '🌿 もういちど！';
      msg   = lang === 'en' ? 'The animals are hiding well! Find them all!' : 'どうぶつたちが かくれてるよ！さがしてみよう！';
    }

    setResultData({ title, msg, score, isNew, hi: isNew ? score : hi });
    setScreen('result');
  }, [lang]);

  // ─── Handle mute ───────────────────────────────────────────────────────────

  const handleMute = () => {
    const m = toggleMute();
    setMuted(m);
    if (!m) playKakurenboBgm();
  };

  // ─── Page title ────────────────────────────────────────────────────────────

  useEffect(() => {
    document.title = 'どうぶつかくれんぼ | わくわくアイランド - 無料子供向けゲーム';
    return () => { document.title = 'わくわくアイランド | 無料の子供向けブラウザゲーム'; };
  }, []);

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      runRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      stopBgm();
    };
  }, []);

  // ─── Render: Title ─────────────────────────────────────────────────────────

  if (screen === 'title') return (
    <div className="kk-wrap kk-title-bg">
      {/* Gallery characters */}
      {gallery.map((g, i) => (
        <div
          key={i}
          className="kk-gallery-char"
          style={{ [g.side]: '1%', top: `${g.top}%`, animationDelay: `${g.phase}s` }}
        >
          {g.emoji}
        </div>
      ))}

      <div className="kk-title-box">
        <div className="kk-title-icon">🔍</div>
        <h1 className="kk-title-text">
          {lang === 'en' ? 'Animal Hide & Seek' : 'どうぶつかくれんぼ'}
        </h1>

        <div className="kk-rule-card">
          <h2>{lang === 'en' ? '📖 How to Play' : '📖 あそびかた'}</h2>
          <div className="kk-rule-step">
            <span className="kk-rule-num">1</span>
            <span>{lang === 'en' ? 'A target animal is shown at the top!' : 'うえに さがすどうぶつが でるよ！'}</span>
          </div>
          <div className="kk-rule-step">
            <span className="kk-rule-num">2</span>
            <span>{lang === 'en' ? 'Tap the objects to find where animals are hiding!' : 'オブジェクトをタップして どうぶつをさがそう！'}</span>
          </div>
          <div className="kk-rule-step">
            <span className="kk-rule-num">3</span>
            <span>{lang === 'en' ? <>Find the <b>target animal</b> — other animals are wrong!</> : <><b>さがしているどうぶつ</b>をみつけよう！ほかはNG！</>}</span>
          </div>
          <div className="kk-rule-step">
            <span className="kk-rule-num">4</span>
            <span>{lang === 'en' ? 'Clear all 3 stages to win!' : 'ステージ3まで クリアしよう！'}</span>
          </div>
        </div>

        <div className="kk-stage-info">
          <div className="kk-stage-badge">🌿 {lang === 'en' ? 'Stage 1: 6 spots' : 'ステージ1：6つ'}</div>
          <div className="kk-stage-badge">🌳 {lang === 'en' ? 'Stage 2: 9 spots + timer' : 'ステージ2：9つ＋タイマー'}</div>
          <div className="kk-stage-badge">🏔️ {lang === 'en' ? 'Stage 3: 12 spots + fast!' : 'ステージ3：12つ＋はやい！'}</div>
        </div>

        {hiScore > 0 && (
          <div className="kk-hi-badge">🏆 {lang === 'en' ? `Best: ${hiScore}pts` : `ベストスコア: ${hiScore}てん`}</div>
        )}

        <button className="kk-start-btn" onClick={startGame}>
          {lang === 'en' ? '▶ Start!' : '▶ スタート！'}
        </button>
        <button className="ww-back-btn" onClick={() => navigate('/')}>
          {lang === 'en' ? '🏝️ Back to Top' : '🏝️ トップへもどる'}
        </button>
      </div>
    </div>
  );

  // ─── Render: Stage Clear ───────────────────────────────────────────────────

  if (screen === 'stageClear') return (
    <div className="kk-wrap kk-overlay-bg">
      <div className="kk-result-box">
        <div style={{ fontSize: 72 }}>🎉</div>
        <h2 className="kk-result-title">
          {lang === 'en' ? `Stage ${stage} Clear!` : `ステージ${stage} クリア！`}
        </h2>
        <p className="kk-result-msg">
          {lang === 'en'
            ? `You found all ${STAGES[stage - 1].targets} animals! Next stage is faster!`
            : `どうぶつを${STAGES[stage - 1].targets}ひき ぜんぶみつけたよ！つぎはもっとむずかしいよ！`}
        </p>
        <div className="kk-score-display">
          {lang === 'en' ? `Score so far: ${totalScore}pts` : `スコア: ${totalScore}てん`}
        </div>
        <button className="kk-start-btn" onClick={goNextStage}>
          {lang === 'en' ? 'Next Stage ▶' : 'つぎへ ▶'}
        </button>
      </div>
    </div>
  );

  // ─── Render: Result ────────────────────────────────────────────────────────

  if (screen === 'result') return (
    <div className="kk-wrap kk-overlay-bg">
      <div className="kk-result-box">
        <h2 className="kk-result-title">{resultData?.title}</h2>
        <p className="kk-result-msg">{resultData?.msg}</p>
        <div className="kk-score-display">
          {lang === 'en' ? `Score: ${resultData?.score ?? 0}pts` : `スコア: ${resultData?.score ?? 0}てん`}
        </div>
        {resultData?.isNew && (
          <div className="kk-new-record">🏆 {lang === 'en' ? 'New Record!' : 'ニューレコード！'}</div>
        )}
        <div className="kk-hi-badge">
          🏆 {lang === 'en' ? `Best: ${resultData?.hi ?? hiScore}pts` : `ベスト: ${resultData?.hi ?? hiScore}てん`}
        </div>
        <div className="kk-result-btns">
          <button className="kk-start-btn" onClick={startGame}>
            {lang === 'en' ? 'Play Again' : 'もういちど'}
          </button>
          <button className="kk-back-btn" onClick={() => navigate('/')}>
            {lang === 'en' ? 'Back to Title' : 'タイトルへ'}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Render: Game ──────────────────────────────────────────────────────────

  const cfg = STAGES[stage - 1];

  return (
    <div className="kk-wrap kk-game-bg">
      {/* HUD */}
      <div className="kk-hud">
        <button className="kk-hud-btn" onClick={() => { runRef.current = false; if (timerRef.current) clearInterval(timerRef.current); stopBgm(); navigate('/'); }}>
          🏠
        </button>
        <div className="kk-hud-center">
          <div className="kk-hud-title">
            {lang === 'en' ? '🔍 Hide & Seek' : '🔍 どうぶつかくれんぼ'}
          </div>
          <div className="kk-hud-sub">
            {lang === 'en' ? `Stage ${stage}` : `ステージ${stage}`}
            &nbsp;|&nbsp;
            {lang === 'en' ? `Found: ${found}/${cfg.targets}` : `みつけた: ${found}/${cfg.targets}`}
          </div>
        </div>
        <div className="kk-hud-right">
          {cfg.time > 0 && (
            <div className="kk-hud-timer" style={{ color: timeLeft <= 10 ? '#ff4444' : '#fff' }}>
              ⏱ {timeLeft}
            </div>
          )}
          <button className="kk-hud-btn kk-mute-btn" onClick={handleMute}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Target animal */}
      <div className="kk-target-bar">
        <div className="kk-target-label">
          {lang === 'en' ? 'Find this animal! →' : 'このどうぶつを みつけよう！→'}
        </div>
        <div className="kk-target-animal">
          <span className="kk-target-emoji">{target?.emoji}</span>
          <span className="kk-target-name">
            {target ? (lang === 'en' ? target.nameEn : target.name) : ''}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="kk-progress-bar">
        <div
          className="kk-progress-fill"
          style={{ width: `${(found / cfg.targets) * 100}%` }}
        />
        <div className="kk-progress-text">
          {found} / {cfg.targets}
        </div>
      </div>

      {/* Objects grid */}
      <div className={`kk-grid kk-grid-${cfg.objects}`}>
        {objects.map(obj => (
          <button
            key={obj.id}
            className={`kk-obj kk-obj-${obj.state}`}
            onClick={() => tapObject(obj.id)}
            disabled={obj.state !== 'hidden'}
          >
            {obj.state === 'hidden' ? (
              <span className="kk-obj-hide">{obj.hide}</span>
            ) : obj.state === 'wrong' ? (
              <div className="kk-obj-reveal kk-obj-wrong-reveal">
                <span className="kk-obj-animal">{obj.content.animal.emoji}</span>
                <span className="kk-obj-x">✕</span>
              </div>
            ) : (
              <div className="kk-obj-reveal kk-obj-correct-reveal">
                <span className="kk-obj-animal">{obj.content.animal.emoji}</span>
                {obj.state === 'correct' && <span className="kk-obj-star">⭐</span>}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
