import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSushiBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted, toggleMute, getMuteState } from '../utils/audio';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import { addCoins } from '../utils/coins';
import './SushiGame.css';

const SALMON = '🍣';
const TRAPS = ['🐱','🐶','🐸','🐼','🦊','🐰','🐧','🐻','🍊','🍎','🎀','⭐','🐙','🦐','🥚','🐟'];
const LANE_COLORS = ['#ffe8e8','#fff8e0','#e8f0ff'];
const ITEM_PX = 84; // アイテムの直径(px) — salmonを大きく

function getHi() { return parseInt(localStorage.getItem('sushi_hi') || '0'); }
function saveHi(v) { localStorage.setItem('sushi_hi', String(v)); }

let _uid = 0;

function stageSpeed(s)  { return s === 1 ? 2.5 : s === 2 ? 4.0 : 5.5; }
function stageGoal(s)   { return s === 1 ? 8   : s === 2 ? 12  : 16;  }
function stageIntvl(s)  { return s === 1 ? 1800 : s === 2 ? 1300 : 950; }

export default function SushiGame() {
  const navigate = useNavigate();

  /* ─── UI State ─── */
  const [screen, setScreen]     = useState('title');
  const [items,  setItems]      = useState([]);
  const [score,  setScore]      = useState(0);
  const [hp,     setHp]         = useState(3);
  const [stage,  setStage]      = useState(1);
  const [caught, setCaught]     = useState(0);
  const [hiScore,setHiScore]    = useState(getHi());
  const [resultData,setResult]  = useState(null);

  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [muted, setMuted] = useState(() => getMuteState());

  /* ─── Mutable Refs ─── */
  const scoreR   = useRef(0);
  const hpR      = useRef(3);
  const stageR   = useRef(1);
  const speedR   = useRef(stageSpeed(1));
  const goalR    = useRef(stageGoal(1));
  const caughtR  = useRef(0);
  const runR     = useRef(false);
  const moveIntR = useRef(null);
  const spawnTmR = useRef(null);
  const wrapR    = useRef(null);

  /* ─── アイテム生成 ─── */
  function mkItem() {
    const W    = wrapR.current ? wrapR.current.offsetWidth : window.innerWidth;
    const lane = Math.floor(Math.random() * 3);
    const isSalmon = Math.random() < 0.38;
    return {
      id:       _uid++,
      emoji:    isSalmon ? SALMON : TRAPS[Math.floor(Math.random() * TRAPS.length)],
      isSalmon,
      lane,
      x:        W + ITEM_PX,   // 画面右端の外側からスタート
    };
  }

  /* ─── 全停止 ─── */
  function stopAll() {
    runR.current = false;
    if (moveIntR.current) { clearInterval(moveIntR.current); moveIntR.current = null; }
    if (spawnTmR.current) { clearTimeout(spawnTmR.current);  spawnTmR.current  = null; }
    stopBgm();
  }

  /* ─── スポーンループ（setTimeout再帰） ─── */
  function spawnOnce() {
    if (!runR.current) return;
    setItems(prev => [...prev, mkItem()]);
    spawnTmR.current = setTimeout(spawnOnce, stageIntvl(stageR.current) + Math.random() * 400);
  }

  /* ─── 移動ループ（setInterval 16ms ≈ 60fps） ─── */
  function startMoveInterval() {
    if (moveIntR.current) clearInterval(moveIntR.current);
    moveIntR.current = setInterval(() => {
      if (!runR.current) return;
      setItems(prev =>
        prev
          .map(item => ({ ...item, x: item.x - speedR.current }))
          .filter(item => item.x > -(ITEM_PX + 10))
      );
    }, 16);
  }

  /* ─── スタート ─── */
  async function startGame() {
    stopAll();
    _uid = 0;
    scoreR.current  = 0;
    hpR.current     = 3;
    stageR.current  = 1;
    speedR.current  = stageSpeed(1);
    goalR.current   = stageGoal(1);
    caughtR.current = 0;
    runR.current    = true;

    setScore(0); setHp(3); setStage(1); setCaught(0);
    setItems([]); setResult(null);
    setScreen('game');

    await ensureAudioStarted();
    console.log('[Game] SushiGame: audio ready, playing BGM');
    playSushiBgm();
    addCoins(1);
    trackGameStart('SushiGame');

    // setScreen が適用された後に開始する
    setTimeout(() => {
      startMoveInterval();
      spawnOnce();
    }, 80);
  }

  /* ─── タップ判定 ─── */
  function tapItem(id, isSalmon) {
    if (!runR.current) return;
    setItems(prev => prev.filter(i => i.id !== id));

    if (isSalmon) {
      playSoundCorrect();
      scoreR.current  += 10;
      caughtR.current += 1;
      setScore(scoreR.current);
      setCaught(caughtR.current);
      if (caughtR.current >= goalR.current) stageDone();
    } else {
      playSoundWrong();
      hpR.current -= 1;
      setHp(hpR.current);
      if (hpR.current <= 0) gameOver();
    }
  }

  /* ─── ステージクリア ─── */
  function stageDone() {
    stopAll();
    if (stageR.current >= 3) { gameOver(true); return; }
    setScreen('stageClear');
  }

  async function goNextStage() {
    stageR.current  += 1;
    speedR.current   = stageSpeed(stageR.current);
    goalR.current    = stageGoal(stageR.current);
    caughtR.current  = 0;
    runR.current     = true;

    setStage(stageR.current);
    setCaught(0);
    setItems([]);
    setScreen('game');

    await ensureAudioStarted();
    playSushiBgm();

    setTimeout(() => {
      startMoveInterval();
      spawnOnce();
    }, 80);
  }

  /* ─── ゲームオーバー ─── */
  function gameOver(allClear = false) {
    stopAll();
    playSoundClear();
    addCoins(5);
    const s   = scoreR.current;
    const hi  = getHi();
    const isNew = s > hi;
    if (isNew) { saveHi(s); trackNewHighScore('SushiGame', s); addCoins(10); }
    trackGameClear('SushiGame', s, stageR.current);
    setHiScore(isNew ? s : hi);

    let title, msg;
    if (allClear) {
      title = lang === 'en' ? '🏆 Champion!' : '🏆 チャンピオン！';
      msg   = lang === 'en' ? `Score: ${s}pts!<br>You cleared all stages!` : `スコア ${s} てん！<br>ぜんぶクリアしたよ！`;
    } else if (s >= 80) {
      title = lang === 'en' ? '🍣 Nice!' : '🍣 ナイス！';
      msg   = lang === 'en' ? `Score: ${s}pts!<br>You reached Stage ${stageR.current}!` : `スコア ${s} てん！<br>ステージ${stageR.current}まで！`;
    } else {
      title = lang === 'en' ? '😅 Try Again!' : '😅 もういちど';
      msg   = lang === 'en' ? `Score: ${s}pts<br>Keep challenging!` : `スコア ${s} てん<br>またちょうせん！`;
    }

    setResult({ title, msg, score: s, isNew, hi: isNew ? s : hi });
    setScreen('result');
  }

  /* ─── ページタイトル ─── */
  useEffect(() => {
    document.title = 'さーもんをとろう | わくわくアイランド - 無料子供向けゲーム';
    return () => { document.title = 'わくわくアイランド | 無料の子供向けブラウザゲーム'; };
  }, []);

  /* ─── アンマウント時クリーンアップ ─── */
  useEffect(() => () => stopAll(), []); // eslint-disable-line

  /* ═══════════════════════════════════════════════════════════
     タイトル画面
  ═══════════════════════════════════════════════════════════ */
  if (screen === 'title') return (
    <div className="sushi-wrap sushi-title">
      <div className="sushi-title-box">
        <div style={{ fontSize: 60, marginBottom: 6 }}>🍣</div>
        <h1 className="sushi-title-text">{lang === 'en' ? 'Catch Salmon!' : 'さーもんをとろう！'}</h1>
        <div className="sushi-rule-card">
          <h2>{lang === 'en' ? '📖 How to Play' : '📖 あそびかた'}</h2>
          <div className="sushi-rule-step"><div className="sushi-rule-num">1</div><div className="sushi-rule-text">{lang === 'en' ? 'Watch the conveyor belt lanes!' : 'かいてんずしの レーンを みてね！'}</div></div>
          <div className="sushi-rule-step"><div className="sushi-rule-num">2</div><div className="sushi-rule-text">{lang === 'en' ? <><b>Salmon🍣</b> comes along — tap it!</> : <><b>さーもん🍣</b> がながれてきたら タップ！</>}</div></div>
          <div className="sushi-rule-step"><div className="sushi-rule-num">3</div><div className="sushi-rule-text">{lang === 'en' ? <><b>Animals & other items</b> — don't tap!</> : <><b>どうぶつ・ほかのもの</b>はタップしちゃダメ！</>}</div></div>
          <div className="sushi-rule-step"><div className="sushi-rule-num">4</div><div className="sushi-rule-text">{lang === 'en' ? 'Clear all 3 stages — speed increases!' : 'ステージ3まで クリアしよう！スピードがあがるよ！'}</div></div>
        </div>
        {hiScore > 0 && <div className="sushi-hi-badge">🏆 {lang === 'en' ? `Best: ${hiScore}pts` : `ハイスコア: ${hiScore}てん`}</div>}
        <button className="sushi-start-btn" onClick={startGame}>{lang === 'en' ? '▶ Start!' : '▶ スタート！'}</button>
        <button className="ww-back-btn" onClick={() => navigate('/')}>{lang === 'en' ? '🏝️ Back to Top' : '🏝️ トップへもどる'}</button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     ステージクリア画面
  ═══════════════════════════════════════════════════════════ */
  if (screen === 'stageClear') return (
    <div className="sushi-wrap sushi-stageclear">
      <div className="sushi-stageclear-box">
        <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
        <h2 className="sushi-stageclear-title">{lang === 'en' ? `Stage ${stage} Clear!` : `ステージ${stage} クリア！`}</h2>
        <p className="sushi-stageclear-msg">{lang === 'en' ? `🍣×${caught} caught! Next is faster!` : `🍣×${caught} とれたよ！つぎは もっとはやいよ！`}</p>
        <button className="sushi-start-btn" onClick={goNextStage}>{lang === 'en' ? 'Next ▶' : 'つぎへ ▶'}</button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     リザルト画面
  ═══════════════════════════════════════════════════════════ */
  if (screen === 'result') return (
    <div className="sushi-wrap sushi-result">
      <div className="sushi-result-box">
        <h2 className="sushi-result-title">{resultData?.title}</h2>
        <p className="sushi-result-msg" dangerouslySetInnerHTML={{ __html: resultData?.msg ?? '' }} />
        {resultData?.isNew && <div className="sushi-result-new">🏆 {lang === 'en' ? 'New Record!' : 'ニューレコード！'}</div>}
        <div className="sushi-result-hi">{lang === 'en' ? `Best: ${resultData?.hi ?? hiScore}pts` : `ハイスコア: ${resultData?.hi ?? hiScore}てん`}</div>
        <div className="sushi-result-btns">
          <button className="sushi-start-btn" onClick={startGame}>{lang === 'en' ? 'Play Again' : 'もういちど'}</button>
          <button className="sushi-back-btn"  onClick={() => navigate('/')}>{lang === 'en' ? 'Back to Title' : 'タイトルへ'}</button>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     ゲーム画面 ── DOM ベース
     ゲームラッパーを画面全体に固定し、
     3つのレーン div を並べてアイテムを position:absolute で表示
  ═══════════════════════════════════════════════════════════ */
  const HUD_H   = 60;  // HUD の高さ(px)
  const PROG_H  = 24;  // 進捗バーの高さ(px)
  const areaH   = `calc(100vh - ${HUD_H + PROG_H}px)`; // レーン全体の高さ

  return (
    <div
      ref={wrapR}
      style={{
        position: 'fixed', inset: 0,
        background: '#fff8f0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── HUD（3カラム：左🏠 ／ 中タイトル+スコア ／ 右ライフ） ── */}
      <div style={{ flexShrink:0, height:HUD_H, background:'rgba(220,60,60,0.85)', display:'flex', alignItems:'center', padding:'0 12px', gap:8, zIndex:10 }}>
        {/* LEFT */}
        <button onClick={() => { stopAll(); navigate('/'); }}
          style={{ fontSize:22, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:10, padding:'4px 8px', cursor:'pointer', flexShrink:0 }}>🏠</button>
        {/* CENTER */}
        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ fontSize:13, fontWeight:900, color:'#fff', textShadow:'1px 1px 0 rgba(0,0,0,0.3)', lineHeight:1.2 }}>
            {lang === 'en' ? '🍣 Catch Salmon' : '🍣 さーもんをとろう'}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.88)', fontWeight:700 }}>
            {lang === 'en' ? 'Score' : 'スコア'}: {score}　{lang === 'en' ? 'Stage' : 'ステージ'} {stage}
          </div>
        </div>
        {/* RIGHT */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:12, padding:'4px 10px', textAlign:'center' }}>
            <div style={{ fontSize:10, color:'#c0392b', fontWeight:700 }}>{lang === 'en' ? 'Lives' : 'ライフ'}</div>
            <div style={{ fontSize:16, fontWeight:900 }}>{'❤️'.repeat(hp)}{'🖤'.repeat(3 - hp)}</div>
          </div>
          <button onClick={() => { const m = toggleMute(); setMuted(m); if (!m) playSushiBgm(); }}
            style={{ fontSize:20, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:10, padding:'4px 8px', cursor:'pointer' }}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* ── 3 レーン ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {[0, 1, 2].map(lane => (
          <div
            key={lane}
            style={{
              flex: 1,
              position: 'relative',
              background: LANE_COLORS[lane],
              borderBottom: lane < 2 ? '2px solid rgba(200,150,120,0.35)' : 'none',
              overflow: 'hidden',
            }}
          >
            {/* レーン内のアイテム */}
            {items
              .filter(item => item.lane === lane)
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => tapItem(item.id, item.isSalmon)}
                  style={{
                    position:    'absolute',
                    left:         item.x - ITEM_PX / 2,
                    top:         '50%',
                    transform:   'translateY(-50%)',
                    width:        ITEM_PX,
                    height:       ITEM_PX,
                    borderRadius: '50%',
                    border:       item.isSalmon ? '2.5px solid #e74c3c' : '2px solid #bbb',
                    background:   item.isSalmon ? '#fff0f0' : '#fff',
                    fontSize:     52,
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                    padding:       0,
                    cursor:        'pointer',
                    userSelect:    'none',
                    WebkitUserSelect: 'none',
                    touchAction:   'manipulation',
                    boxShadow:     '0 2px 6px rgba(0,0,0,0.15)',
                    // トラップには ✕ を重ねる（CSS で表現するため ✕ 文字を表示）
                  }}
                >
                  {item.emoji}
                  {!item.isSalmon && (
                    <span style={{
                      position: 'absolute',
                      fontSize: 20,
                      color: 'rgba(255,50,50,0.55)',
                      pointerEvents: 'none',
                      lineHeight: 1,
                    }}>✕</span>
                  )}
                </button>
              ))}
          </div>
        ))}
      </div>

      {/* ── 進捗バー ── */}
      <div style={{ flexShrink: 0, height: PROG_H, background: 'rgba(255,200,200,0.4)', position: 'relative' }}>
        <div style={{
          height: '100%',
          background: '#e74c3c',
          width: `${Math.min(caught / (goalR.current || 1), 1) * 100}%`,
          transition: 'width 0.2s ease',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
          textShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}>
          🍣 {caught} / {goalR.current}
        </div>
      </div>
    </div>
  );
}
