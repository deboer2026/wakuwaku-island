import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSushiBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import './SushiGame.css';

const LANE_COUNT = 3;
const SALMON = '🍣';
const TRAP_EMOJI = ['🐱','🐶','🐸','🐼','🦊','🐰','🐧','🐻','🍊','🍎','🎀','⭐'];
const GALLERY_CHARS = ['👸','🤴','👑','🌸','✨','🎉','🌈','🎀'];

function getHi() { return parseInt(localStorage.getItem('sushi_hi') || '0'); }
function saveHi(v) { localStorage.setItem('sushi_hi', String(v)); }

export default function SushiGame() {
  const navigate = useNavigate();

  // UI State
  const [screen, setScreen] = useState('title');
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(3);
  const [stage, setStage] = useState(1);
  const [hiScore, setHiScore] = useState(getHi());
  const [resultData, setResultData] = useState({ title: '', msg: '', hiText: '', isNew: false });

  // Game items state - for DOM rendering
  const [items, setItems] = useState([]);

  // Mutable game state refs
  const scoreRef = useRef(0);
  const hpRef = useRef(3);
  const stageRef = useRef(1);
  const runningRef = useRef(false);
  const salmonCaughtRef = useRef(0);
  const stageGoalRef = useRef(8);
  const speedRef = useRef(2);
  const spawnTimeoutRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const itemCounterRef = useRef(0);

  const stageSpeed = (s) => 2 + s * 1.2;
  const stageGoalCount = (s) => s === 1 ? 8 : s === 2 ? 12 : 16;
  const stageInterval = (s) => s === 1 ? 1800 : s === 2 ? 1300 : 950;

  // Create new item
  const mkItem = useCallback(() => {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const isSalmon = Math.random() < 0.38;
    const emoji = isSalmon ? SALMON : TRAP_EMOJI[Math.floor(Math.random() * TRAP_EMOJI.length)];
    return {
      id: itemCounterRef.current++,
      emoji,
      isSalmon,
      lane,
      x: 100, // starts at right edge (100%)
      alive: true,
    };
  }, []);

  // Spawn loop - add items periodically
  const spawnLoop = useCallback(() => {
    if (!runningRef.current) {
      console.log('[SushiGame] spawnLoop: runningRef is false, stopping spawn');
      return;
    }
    console.log('[SushiGame] spawnLoop: adding new item');
    const newItem = mkItem();
    setItems(prev => [...prev, newItem]);

    // Schedule next spawn
    const interval = stageInterval(stageRef.current) + Math.random() * 400;
    spawnTimeoutRef.current = setTimeout(() => {
      spawnLoop();
    }, interval);
  }, [mkItem]);

  // Update loop - move items and remove off-screen ones
  const updateItems = useCallback(() => {
    setItems(prev => {
      const speed = speedRef.current;
      const updated = prev
        .map(item => ({
          ...item,
          x: item.x - speed, // move left
        }))
        .filter(item => item.x > -10); // remove off-screen

      return updated;
    });
  }, []);

  // Start game
  const startGame = useCallback(() => {
    console.log('[SushiGame] startGame called');
    ensureAudioStarted();
    playSushiBgm();
    trackGameStart('SushiGame');

    // Clear previous state
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);

    // Reset game state
    scoreRef.current = 0;
    hpRef.current = 3;
    stageRef.current = 1;
    runningRef.current = true;
    salmonCaughtRef.current = 0;
    stageGoalRef.current = stageGoalCount(1);
    speedRef.current = stageSpeed(1);
    itemCounterRef.current = 0;

    setScore(0);
    setHp(3);
    setStage(1);
    setItems([]);
    setScreen('game');

    // Start spawn loop
    console.log('[SushiGame] starting spawn loop');
    spawnTimeoutRef.current = setTimeout(() => {
      spawnLoop();
    }, stageInterval(1));

    // Start update loop (item movement)
    console.log('[SushiGame] starting update loop');
    updateIntervalRef.current = setInterval(() => {
      updateItems();
    }, 50); // Update 20 times per second
  }, [spawnLoop, updateItems]);

  // Handle item tap
  const handleItemTap = useCallback((itemId, isSalmon) => {
    if (!runningRef.current) return;

    setItems(prev => prev.filter(item => item.id !== itemId));

    if (isSalmon) {
      console.log('[SushiGame] Salmon caught!');
      playSoundCorrect();
      scoreRef.current += 10;
      salmonCaughtRef.current++;
      setScore(scoreRef.current);

      // Check if stage goal reached
      if (salmonCaughtRef.current >= stageGoalRef.current) {
        nextStage();
      }
    } else {
      console.log('[SushiGame] Trap hit!');
      playSoundWrong();
      hpRef.current--;
      setHp(hpRef.current);
      if (hpRef.current <= 0) {
        endGame();
      }
    }
  }, []);

  // End game
  const endGame = useCallback(() => {
    console.log('[SushiGame] Game Over');
    runningRef.current = false;
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    stopBgm();
    playSoundClear();

    const finalScore = scoreRef.current;
    const hi = getHi();
    const isNew = finalScore > hi;
    if (isNew) {
      saveHi(finalScore);
      trackNewHighScore('SushiGame', finalScore);
    }
    trackGameClear('SushiGame', finalScore, stageRef.current);
    setHiScore(isNew ? finalScore : hi);

    let title, msg;
    if (finalScore >= 200) {
      title = '🏆 チャンピオン！';
      msg = `スコア <b style="font-size:28px;color:#FFD700">${finalScore}</b> てん！`;
    } else if (finalScore >= 100) {
      title = '⭐ すごい！';
      msg = `スコア <b style="font-size:28px;color:#FFD700">${finalScore}</b> てん！`;
    } else {
      title = '🍣 もういちど';
      msg = `スコア <b style="font-size:28px;color:#FFD700">${finalScore}</b> てん<br>またちょうせん！`;
    }

    const hiText = isNew ? '🏆 ニューレコード！' : `ハイスコア: ${hi}てん`;
    setResultData({ title, msg, hiText, isNew });
    setScreen('result');
  }, []);

  // Next stage
  const nextStage = useCallback(() => {
    console.log(`[SushiGame] Stage ${stageRef.current} clear!`);
    runningRef.current = false;
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);

    const nextStageNum = stageRef.current + 1;
    if (nextStageNum > 3) {
      endGame();
    } else {
      setStage(nextStageNum);
      setScreen('stageClear');
    }
  }, [endGame]);

  // Continue to next stage
  const continueToNextStage = useCallback(() => {
    console.log(`[SushiGame] Continuing to stage ${stageRef.current + 1}`);
    const nextStageNum = stageRef.current + 1;
    stageRef.current = nextStageNum;
    runningRef.current = true;
    salmonCaughtRef.current = 0;
    stageGoalRef.current = stageGoalCount(nextStageNum);
    speedRef.current = stageSpeed(nextStageNum);

    setScore(scoreRef.current);
    setHp(hpRef.current);
    setStage(nextStageNum);
    setItems([]);
    setScreen('game');

    // Restart loops
    if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);

    spawnTimeoutRef.current = setTimeout(() => {
      spawnLoop();
    }, stageInterval(nextStageNum));

    updateIntervalRef.current = setInterval(() => {
      updateItems();
    }, 50);
  }, [spawnLoop, updateItems]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      stopBgm();
    };
  }, []);

  // Title Screen
  if (screen === 'title') {
    return (
      <div className="sushi-wrap sushi-title">
        <button className="sushi-back-btn" onClick={() => navigate('/')}>← もどる</button>
        <div className="sushi-title-box">
          <div className="sushi-title-emoji">🍣</div>
          <h1 className="sushi-title-text">さーもんをとろう！</h1>
          <div className="sushi-rule-card">
            <h2>📖 あそびかた</h2>
            <div className="sushi-rule-step"><div className="sushi-rule-num">1</div><div className="sushi-rule-text">かいてんずしの レーンを みてね！</div></div>
            <div className="sushi-rule-step"><div className="sushi-rule-num">2</div><div className="sushi-rule-text"><b>さーもん🍣</b> がながれてきたら タップ！</div></div>
            <div className="sushi-rule-step"><div className="sushi-rule-num">3</div><div className="sushi-rule-text"><b>どうぶつ</b> や <b>ほかのもの</b> は タップしちゃダメ！</div></div>
            <div className="sushi-rule-step"><div className="sushi-rule-num">4</div><div className="sushi-rule-text">ステージ3まで クリアしよう！ スピードがあがるよ！</div></div>
          </div>
          {hiScore > 0 && <div className="sushi-hi-badge">🏆 ハイスコア: {hiScore}てん</div>}
          <button className="sushi-start-btn" onClick={startGame}>▶ スタート！</button>
        </div>
      </div>
    );
  }

  // Stage Clear Screen
  if (screen === 'stageClear') {
    return (
      <div className="sushi-wrap sushi-stageclear">
        <div className="sushi-stageclear-box">
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>🎉</div>
          <h2 className="sushi-stageclear-title">ステージ{stage} クリア！</h2>
          <p className="sushi-stageclear-msg">🍣×{salmonCaughtRef.current} とれたよ！つぎは もっとはやいよ！</p>
          <button className="sushi-start-btn" onClick={continueToNextStage}>つぎへ ▶</button>
        </div>
      </div>
    );
  }

  // Result Screen
  if (screen === 'result') {
    return (
      <div className="sushi-wrap sushi-result">
        <div className="sushi-result-box">
          <h2 className="sushi-result-title">{resultData.title}</h2>
          <p className="sushi-result-msg" dangerouslySetInnerHTML={{ __html: resultData.msg }} />
          {resultData.isNew && <div className="sushi-result-new">🏆 ニューレコード！</div>}
          <div className="sushi-result-hi">{resultData.hiText}</div>
          <div className="sushi-result-btns">
            <button className="sushi-start-btn" onClick={startGame}>もういちど</button>
            <button className="sushi-back-btn" onClick={() => navigate('/')}>タイトルへ</button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen - DOM based lanes with items
  return (
    <div className="sushi-wrap" style={{ overflow: 'hidden', backgroundColor: '#fff8f0' }}>
      {/* HUD */}
      <div className="sushi-hud">
        <button className="sushi-hud-back" onClick={() => { runningRef.current = false; if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current); if (updateIntervalRef.current) clearInterval(updateIntervalRef.current); navigate('/'); }}>🏠</button>
        <div className="sushi-hud-box"><div className="sushi-hud-label">スコア</div><div className="sushi-hud-val">{score}</div></div>
        <div className="sushi-hud-title">🍣 ステージ {stage}</div>
        <div className="sushi-hud-box"><div className="sushi-hud-label">ライフ</div><div className="sushi-hud-val">{'❤️'.repeat(hp)}{'🖤'.repeat(3 - hp)}</div></div>
      </div>

      {/* Game Lanes Container */}
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 80px)', gap: '8px', padding: '10px', backgroundColor: '#fff8f0' }}>
        {[0, 1, 2].map(laneIdx => (
          <div
            key={laneIdx}
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: ['rgba(255,220,220,0.3)', 'rgba(255,240,200,0.3)', 'rgba(220,240,255,0.3)'][laneIdx],
              border: '2px solid rgba(150,100,80,0.3)',
              borderRadius: '8px',
            }}
          >
            {/* Items in this lane */}
            {items
              .filter(item => item.lane === laneIdx && item.alive)
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleItemTap(item.id, item.isSalmon);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '48px',
                    height: '48px',
                    fontSize: '32px',
                    border: item.isSalmon ? '2px solid #e74c3c' : '2px solid #999',
                    borderRadius: '50%',
                    backgroundColor: item.isSalmon ? 'rgba(255,240,240,0.9)' : 'rgba(255,255,255,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {item.emoji}
                </button>
              ))}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '20px',
        backgroundColor: 'rgba(255,200,200,0.3)',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          backgroundColor: '#e74c3c',
          width: `${Math.min(salmonCaughtRef.current / stageGoalRef.current, 1) * 100}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}
