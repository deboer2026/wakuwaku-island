import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { playIchigoBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import './IchigoGame.css';

const STRAWBERRY_TYPES = [
  { type: 'big', emoji: '🍓', pts: 1, size: 34, prob: 0.35 },
  { type: 'medium', emoji: '🍓', pts: 2, size: 24, prob: 0.35 },
  { type: 'small', emoji: '🍓', pts: 3, size: 16, prob: 0.20 },
  { type: 'gold', emoji: '✨', pts: 8, size: 28, prob: 0.10 },
];
const TRAPS = ['🐱', '🐶', '🐸', '🐼', '🦊', '🐰', '🐧', '🐻', '🐮', '🐷'];

function getHi() { return parseInt(localStorage.getItem('ichigo_hi') || '0'); }
function saveHi(v) { localStorage.setItem('ichigo_hi', String(v)); }

export default function IchigoGame() {
  const navigate = useNavigate();

  // UI State
  const [screen, setScreen] = useState('title');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hp, setHp] = useState(3);
  const [combo, setCombo] = useState(1);
  const [collected, setCollected] = useState(0);
  const [hiScore, setHiScore] = useState(getHi());
  const [resultData, setResultData] = useState({ title: '', msg: '', hiText: '', isNew: false });

  // Game items state - for DOM rendering
  const [items, setItems] = useState([]);

  // Mutable game state refs
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(30);
  const hpRef = useRef(3);
  const comboRef = useRef(1);
  const collectedRef = useRef(0);
  const runningRef = useRef(false);
  const spawnIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const comboTimerRef = useRef(null);
  const itemCounterRef = useRef(0);
  const wrapRef = useRef(null);

  // Create random item
  const mkItem = useCallback(() => {
    const isTrap = Math.random() < 0.18;
    if (isTrap) {
      return {
        id: itemCounterRef.current++,
        emoji: TRAPS[Math.floor(Math.random() * TRAPS.length)],
        isTrap: true,
        pts: 0,
        size: 28,
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 200),
      };
    }

    const r = Math.random();
    let acc = 0, chosen = STRAWBERRY_TYPES[0];
    for (const t of STRAWBERRY_TYPES) {
      acc += t.prob;
      if (r < acc) {
        chosen = t;
        break;
      }
    }

    return {
      id: itemCounterRef.current++,
      emoji: chosen.emoji,
      isTrap: false,
      pts: chosen.pts,
      size: chosen.size,
      x: Math.random() * (window.innerWidth - 80),
      y: Math.random() * (window.innerHeight - 300),
    };
  }, []);

  // Spawn items periodically
  const spawnItem = useCallback(() => {
    if (!runningRef.current) {
      console.log('[IchigoGame] spawnItem: runningRef is false, stopping spawn');
      return;
    }
    console.log('[IchigoGame] spawnItem: adding new item');
    const newItem = mkItem();
    setItems(prev => [...prev, newItem]);
  }, [mkItem]);

  // Start game
  const startGame = useCallback(() => {
    console.log('[IchigoGame] startGame called');
    ensureAudioStarted();
    playIchigoBgm();
    trackGameStart('IchigoGame');

    // Clear previous state
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);

    // Reset game state
    scoreRef.current = 0;
    timeLeftRef.current = 30;
    hpRef.current = 3;
    comboRef.current = 1;
    collectedRef.current = 0;
    runningRef.current = true;
    itemCounterRef.current = 0;

    setScore(0);
    setTimeLeft(30);
    setHp(3);
    setCombo(1);
    setCollected(0);
    setItems([]);
    setScreen('game');

    // Start spawn loop
    console.log('[IchigoGame] starting spawn loop');
    spawnIntervalRef.current = setInterval(() => {
      spawnItem();
    }, 400);

    // Start timer
    console.log('[IchigoGame] starting timer');
    timerIntervalRef.current = setInterval(() => {
      timeLeftRef.current--;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        endGame();
      }
    }, 1000);
  }, [spawnItem]);

  // Handle item tap
  const handleItemTap = useCallback((itemId, isTrap, pts) => {
    if (!runningRef.current) return;

    setItems(prev => prev.filter(item => item.id !== itemId));

    if (isTrap) {
      console.log('[IchigoGame] Trap hit!');
      playSoundWrong();
      hpRef.current--;
      setHp(hpRef.current);
      comboRef.current = 1;
      setCombo(1);
      // Reset combo timer
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);

      if (hpRef.current <= 0) {
        endGame();
      }
    } else {
      console.log('[IchigoGame] Strawberry caught!');
      playSoundCorrect();
      const points = pts * comboRef.current;
      scoreRef.current += points;
      collectedRef.current++;
      setScore(scoreRef.current);
      setCollected(collectedRef.current);

      // Increase combo
      comboRef.current = Math.min(comboRef.current + 1, 10);
      setCombo(comboRef.current);

      // Reset combo timer
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        comboRef.current = 1;
        setCombo(1);
      }, 2000); // 2 second reset
    }
  }, []);

  // End game
  const endGame = useCallback(() => {
    console.log('[IchigoGame] Game Over');
    runningRef.current = false;
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    stopBgm();
    playSoundClear();

    const finalScore = scoreRef.current;
    const hi = getHi();
    const isNew = finalScore > hi;
    if (isNew) {
      saveHi(finalScore);
      trackNewHighScore('IchigoGame', finalScore);
    }
    trackGameClear('IchigoGame', finalScore, 1);
    setHiScore(isNew ? finalScore : hi);

    let title, msg;
    if (finalScore >= 300) {
      title = '🏆 チャンピオン！';
      msg = `スコア <b style="font-size:28px;color:#FFD700">${finalScore}</b> てん！`;
    } else if (finalScore >= 150) {
      title = '⭐ すごい！';
      msg = `スコア <b style="font-size:28px;color:#FFD700">${finalScore}</b> てん！`;
    } else {
      title = '🍓 もういちど';
      msg = `スコア <b style="font-size:28px;color:#FFD700">${finalScore}</b> てん<br>またちょうせん！`;
    }

    const hiText = isNew ? '🏆 ニューレコード！' : `ハイスコア: ${hi}てん`;
    setResultData({ title, msg, hiText, isNew });
    setScreen('result');
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      stopBgm();
    };
  }, []);

  // Title Screen
  if (screen === 'title') {
    return (
      <div className="ichigo-wrap ichigo-title">
        <button className="ichigo-back-btn" onClick={() => navigate('/')}>← もどる</button>
        <div className="ichigo-title-box">
          <div className="ichigo-title-emoji">🍓</div>
          <h1 className="ichigo-title-text">いちごをあつめよう！</h1>
          <div className="ichigo-rule-card">
            <h2>📖 あそびかた</h2>
            <div className="ichigo-rule-step"><div className="ichigo-rule-num">1</div><div className="ichigo-rule-text"><b>いちご🍓</b> がポップアップ！どんどんタップしよう！</div></div>
            <div className="ichigo-rule-step"><div className="ichigo-rule-num">2</div><div className="ichigo-rule-text"><b>ちいさい</b>いちごほど こうとく！すばやくタップ！</div></div>
            <div className="ichigo-rule-step"><div className="ichigo-rule-num">3</div><div className="ichigo-rule-text"><b>きんいちご✨</b> がでたら チャンス！おおきくもらえるよ！</div></div>
            <div className="ichigo-rule-step"><div className="ichigo-rule-num">4</div><div className="ichigo-rule-text"><b>どうぶつ</b>はタップしちゃダメ！ライフがへるよ！</div></div>
            <div className="ichigo-rule-ex">
              れんぞくタップで<b style={{ color: '#e91e63' }}>コンボ</b>ボーナス！<br />🍓🍓🍓 → コンボ×2！
            </div>
          </div>
          {hiScore > 0 && <div className="ichigo-hi-badge">🏆 ハイスコア: {hiScore}てん</div>}
          <button className="ichigo-start-btn" onClick={startGame}>▶ スタート！</button>
        </div>
      </div>
    );
  }

  // Result Screen
  if (screen === 'result') {
    return (
      <div className="ichigo-wrap ichigo-result">
        <div className="ichigo-result-box">
          <h2 className="ichigo-result-title">{resultData.title}</h2>
          <p className="ichigo-result-msg" dangerouslySetInnerHTML={{ __html: resultData.msg }} />
          {resultData.isNew && <div className="ichigo-result-new">🏆 ニューレコード！</div>}
          <div className="ichigo-result-hi">{resultData.hiText}</div>
          <div className="ichigo-result-btns">
            <button className="ichigo-start-btn" onClick={startGame}>もういちど</button>
            <button className="ichigo-back-btn" onClick={() => navigate('/')}>タイトルへ</button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen - position:absolute items
  return (
    <div className="ichigo-wrap" ref={wrapRef} style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#fce4ec' }}>
      {/* HUD */}
      <div className="ichigo-hud">
        <button className="ichigo-hud-back" onClick={() => { runningRef.current = false; if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current); if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); navigate('/'); }}>🏠</button>
        <div className="ichigo-hud-box"><div className="ichigo-hud-label">スコア</div><div className="ichigo-hud-val">{score}</div></div>
        <div className="ichigo-hud-title">🍓 いちごをあつめよう</div>
        <div className="ichigo-hud-box"><div className="ichigo-hud-label">のこり</div><div className="ichigo-hud-val">{timeLeft}</div></div>
      </div>

      {/* Combo display */}
      {combo > 1 && (
        <div style={{
          position: 'fixed',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          fontWeight: 'bold',
          color: combo > 5 ? '#FFD700' : '#e91e63',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          zIndex: 50,
          animation: 'pulse 0.3s ease',
        }}>
          🔥 コンボ x{combo}
        </div>
      )}

      {/* Life display */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        fontSize: '20px',
        zIndex: 50,
      }}>
        {'❤️'.repeat(hp)}{'🖤'.repeat(3 - hp)}
      </div>

      {/* Collected count */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        fontSize: '18px',
        zIndex: 50,
      }}>
        🧺 {collected}こ
      </div>

      {/* Items - position:absolute */}
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => {
            handleItemTap(item.id, item.isTrap, item.pts);
          }}
          style={{
            position: 'fixed',
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${item.size}px`,
            height: `${item.size}px`,
            fontSize: `${item.size * 0.8}px`,
            border: 'none',
            borderRadius: '50%',
            backgroundColor: item.isTrap ? 'rgba(255,255,255,0.8)' : 'rgba(255,200,220,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            zIndex: 10,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            animation: item.isTrap ? 'none' : `pop-in 0.3s ease-out`,
          }}
        >
          {item.emoji}
        </button>
      ))}
    </div>
  );
}
