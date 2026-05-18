import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playIchigoBgm, stopBgm, playSoundCorrect, playSoundWrong, playSoundClear, ensureAudioStarted, toggleMute, getMuteState } from '../utils/audio';
import { t } from '../utils/i18n';
import { trackGameStart, trackGameClear, trackGameOver, trackNewHighScore } from '../utils/analytics';
import { addCoins } from '../utils/coins';
import './IchigoGame.css';

const TRAPS = ['🐱','🐶','🐸','🐼','🦊','🐰','🐧','🐻','🐮','🐷'];
const STRAWBERRY_TYPES = [
  { type: 'big',    emoji: '🍓', pts: 1, size: 38, prob: 0.35 },
  { type: 'medium', emoji: '🍓', pts: 2, size: 28, prob: 0.35 },
  { type: 'small',  emoji: '🍓', pts: 3, size: 18, prob: 0.20 },
  { type: 'gold',   emoji: '⭐', pts: 8, size: 32, prob: 0.10 },
];

function getHi() { return parseInt(localStorage.getItem('ichigo_hi') || '0'); }
function saveHi(v) { localStorage.setItem('ichigo_hi', String(v)); }

let _uid = 0;

export default function IchigoGame() {
  const navigate = useNavigate();

  /* ─── UI State ─── */
  const [screen,    setScreen]   = useState('title');
  const [items,     setItems]    = useState([]);
  const [score,     setScore]    = useState(0);
  const [timeLeft,  setTimeLeft] = useState(30);
  const [hp,        setHp]       = useState(3);
  const [combo,     setCombo]    = useState(1);
  const [collected, setCollected]= useState(0);
  const [hiScore,   setHiScore]  = useState(getHi());
  const [resultData,setResult]   = useState(null);

  const [lang] = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [muted, setMuted] = useState(() => getMuteState());

  /* ─── Mutable Refs ─── */
  const scoreR     = useRef(0);
  const hpR        = useRef(3);
  const comboR     = useRef(1);
  const collR      = useRef(0);
  const timeR      = useRef(30);
  const runR       = useRef(false);
  const moveIntR   = useRef(null);
  const spawnTmR   = useRef(null);
  const timerIntR  = useRef(null);
  const comboTmR   = useRef(null);
  const wrapR      = useRef(null);

  /* ─── アイテム生成 ─── */
  function mkItem() {
    const W = wrapR.current ? wrapR.current.offsetWidth  : window.innerWidth;
    const H = wrapR.current ? wrapR.current.offsetHeight : window.innerHeight;
    const isTrap = Math.random() < 0.18;

    if (isTrap) {
      const sz = 28 + Math.random() * 14;
      return {
        id:      _uid++,
        emoji:   TRAPS[Math.floor(Math.random() * TRAPS.length)],
        isTrap:  true,
        pts:     0,
        size:    sz,
        x:       sz + Math.random() * (W - sz * 2),
        y:       -sz,
        vx:      (Math.random() - 0.5) * 1.5,
        vy:      1.5 + Math.random() * 2,
        wobble:  Math.random() * Math.PI * 2,
      };
    }

    // いちごタイプ抽選
    const r = Math.random();
    let acc = 0, chosen = STRAWBERRY_TYPES[0];
    for (const t of STRAWBERRY_TYPES) { acc += t.prob; if (r < acc) { chosen = t; break; } }
    const sz = chosen.size;
    return {
      id:     _uid++,
      emoji:  chosen.emoji,
      isTrap: false,
      pts:    chosen.pts,
      size:   sz,
      type:   chosen.type,
      x:      sz + Math.random() * (W - sz * 2),
      y:      -sz,
      vx:     (Math.random() - 0.5) * 1.2,
      vy:     1.2 + Math.random() * 1.8,
      wobble: Math.random() * Math.PI * 2,
    };
  }

  /* ─── 全停止 ─── */
  function stopAll() {
    runR.current = false;
    if (moveIntR.current)  { clearInterval(moveIntR.current);  moveIntR.current  = null; }
    if (spawnTmR.current)  { clearTimeout(spawnTmR.current);   spawnTmR.current  = null; }
    if (timerIntR.current) { clearInterval(timerIntR.current); timerIntR.current = null; }
    if (comboTmR.current)  { clearTimeout(comboTmR.current);   comboTmR.current  = null; }
    stopBgm();
  }

  /* ─── スポーンループ（setTimeout 再帰） ─── */
  function spawnOnce() {
    if (!runR.current) return;
    // 最大16個に制限（HTMLプロトタイプ準拠）
    setItems(prev => {
      if (prev.length >= 16) return prev;
      return [...prev, mkItem()];
    });
    spawnTmR.current = setTimeout(spawnOnce, 350 + Math.random() * 500);
  }

  /* ─── 移動ループ（setInterval 50ms ≈ 20fps） ─── */
  function startMoveInterval() {
    if (moveIntR.current) clearInterval(moveIntR.current);
    moveIntR.current = setInterval(() => {
      if (!runR.current) return;
      const W = wrapR.current ? wrapR.current.offsetWidth  : window.innerWidth;
      const H = wrapR.current ? wrapR.current.offsetHeight : window.innerHeight;

      setItems(prev =>
        prev
          .map(item => {
            const newWobble = item.wobble + 0.025;
            let   newVx     = item.vx;
            let   newX      = item.x + item.vx + Math.sin(newWobble) * 0.5;
            const newY      = item.y + item.vy;

            // 左右の壁で反射
            if (newX < item.size)      { newX = item.size;      newVx =  Math.abs(newVx); }
            if (newX > W - item.size)  { newX = W - item.size;  newVx = -Math.abs(newVx); }

            return { ...item, x: newX, y: newY, vx: newVx, wobble: newWobble };
          })
          .filter(item => item.y < H + item.size)  // 画面下を超えたら消える
      );
    }, 50);
  }

  /* ─── スタート ─── */
  async function startGame() {
    stopAll();
    _uid = 0;
    scoreR.current  = 0;
    hpR.current     = 3;
    comboR.current  = 1;
    collR.current   = 0;
    timeR.current   = 30;
    runR.current    = true;

    setScore(0); setHp(3); setCombo(1); setCollected(0); setTimeLeft(30);
    setResult(null); setScreen('game');

    await ensureAudioStarted();
    console.log('[Game] IchigoGame: audio ready, playing BGM');
    playIchigoBgm();
    addCoins(1);
    trackGameStart('IchigoGame');

    // 初期アイテム（画面中に最初からいくつか）
    const initItems = [];
    for (let i = 0; i < 8; i++) {
      const item = mkItem();
      const H = window.innerHeight;
      item.y = 80 + Math.random() * (H * 0.55); // HUDより下・画面内に
      initItems.push(item);
    }
    setItems(initItems);

    // setScreen が適用された後にループ開始
    setTimeout(() => {
      startMoveInterval();
      spawnOnce();
      // カウントダウンタイマー
      timerIntR.current = setInterval(() => {
        timeR.current -= 1;
        setTimeLeft(timeR.current);
        if (timeR.current <= 0) gameOver();
      }, 1000);
    }, 80);
  }

  /* ─── タップ判定 ─── */
  function tapItem(id, isTrap, pts) {
    if (!runR.current) return;
    setItems(prev => prev.filter(i => i.id !== id));

    if (isTrap) {
      playSoundWrong();
      hpR.current -= 1;
      comboR.current = 1;
      setHp(hpR.current);
      setCombo(1);
      if (comboTmR.current) { clearTimeout(comboTmR.current); comboTmR.current = null; }
      if (hpR.current <= 0) gameOver();
    } else {
      playSoundCorrect();
      const gained  = pts * comboR.current;
      scoreR.current += gained;
      collR.current  += 1;
      comboR.current  = Math.min(comboR.current + 1, 10);

      setScore(scoreR.current);
      setCollected(collR.current);
      setCombo(comboR.current);

      // コンボリセットタイマー（2秒）
      if (comboTmR.current) clearTimeout(comboTmR.current);
      comboTmR.current = setTimeout(() => {
        comboR.current = 1;
        setCombo(1);
      }, 2000);
    }
  }

  /* ─── ゲームオーバー ─── */
  function gameOver() {
    stopAll();
    playSoundClear();
    addCoins(5);

    const s   = scoreR.current;
    const col = collR.current;
    const hi  = getHi();
    const isNew = s > hi;
    if (isNew) { saveHi(s); trackNewHighScore('IchigoGame', s); addCoins(10); }
    trackGameClear('IchigoGame', s, 1);
    setHiScore(isNew ? s : hi);

    let title, msg;
    if (s >= 60) {
      title = {ja:'🏆 すごい！', en:'🏆 Amazing!', zh:'🏆 太棒了！', ko:'🏆 대단해요!', es:'🏆 ¡Increíble!'}[lang] || '🏆 すごい！';
      msg   = {
        ja: `スコア ${s} てん！<br>${col}こ あつめたよ！<br>いちごの天才だ！`,
        en: `Score: ${s}pts!<br>Collected ${col}!<br>Strawberry Genius!`,
        zh: `得分: ${s}分！<br>收集了${col}个！<br>草莓天才！`,
        ko: `점수: ${s}점！<br>${col}개 모았어요！<br>딸기 천재!`,
        es: `Puntos: ${s}!<br>¡Recogiste ${col}!<br>¡Genio de las fresas!`,
      }[lang] || `スコア ${s} てん！`;
    } else if (s >= 30) {
      title = {ja:'🍓 ナイス！', en:'🍓 Nice!', zh:'🍓 不错！', ko:'🍓 잘했어요!', es:'🍓 ¡Bien!'}[lang] || '🍓 ナイス！';
      msg   = {
        ja: `スコア ${s} てん！<br>${col}こ あつめたよ！<br>よくできました！`,
        en: `Score: ${s}pts!<br>Collected ${col}!<br>Well done!`,
        zh: `得分: ${s}分！<br>收集了${col}个！<br>干得好！`,
        ko: `점수: ${s}점！<br>${col}개 모았어요！<br>잘했어요!`,
        es: `Puntos: ${s}!<br>¡Recogiste ${col}!<br>¡Bien hecho!`,
      }[lang] || `スコア ${s} てん！`;
    } else {
      title = {ja:'😊 もういちど', en:'😊 Try Again!', zh:'😊 再试一次！', ko:'😊 다시 도전!', es:'😊 ¡Inténtalo!'}[lang] || '😊 もういちど';
      msg   = {
        ja: `スコア ${s} てん<br>${col}こ あつめたよ！<br>またちょうせん！`,
        en: `Score: ${s}pts<br>Collected ${col}!<br>Keep challenging!`,
        zh: `得分: ${s}分<br>收集了${col}个！<br>继续挑战！`,
        ko: `점수: ${s}점<br>${col}개 모았어요！<br>계속 도전해요!`,
        es: `Puntos: ${s}<br>¡Recogiste ${col}!<br>¡Sigue intentando!`,
      }[lang] || `スコア ${s} てん`;
    }

    setResult({ title, msg, score: s, collected: col, isNew, hi: isNew ? s : hi });
    setScreen('result');
  }

  /* ─── ページタイトル ─── */
  useEffect(() => {
    document.title = 'いちごをあつめよう | わくわくアイランド - 無料子供向けゲーム';
    return () => { document.title = 'わくわくアイランド | 無料の子供向けブラウザゲーム'; };
  }, []);

  /* ─── アンマウント時クリーンアップ ─── */
  useEffect(() => () => stopAll(), []); // eslint-disable-line

  /* ════════════════════════════════════════════════
     タイトル画面
  ════════════════════════════════════════════════ */
  if (screen === 'title') return (
    <div className="ichigo-wrap ichigo-title">
      <div className="ichigo-title-box">
        <div style={{ fontSize: 64, marginBottom: 6 }}>🍓</div>
        <h1 className="ichigo-title-text">{{ja:'いちごをあつめよう！', en:'Strawberry Time!', zh:'收集草莓！', ko:'딸기를 모아라!', es:'¡Tiempo de Fresa!'}[lang] || 'いちごをあつめよう！'}</h1>
        <div className="ichigo-rule-card">
          <h2>📖 {t(lang,'howToPlay')}</h2>
          <div className="ichigo-rule-step"><div className="ichigo-rule-num">1</div><div className="ichigo-rule-text">{{ja:<><b>いちご🍓</b> がポップアップ！どんどんタップしよう！</>, en:<><b>Strawberries🍓</b> pop up — tap them fast!</>, zh:<><b>草莓🍓</b>弹出来了，快点击！</>, ko:<><b>딸기🍓</b>가 팝업! 빨리 탭해요!</>, es:<><b>¡Las fresas🍓</b> aparecen, tócalas rápido!</>}[lang] || <><b>いちご🍓</b> がポップアップ！</>}</div></div>
          <div className="ichigo-rule-step"><div className="ichigo-rule-num">2</div><div className="ichigo-rule-text">{{ja:<><b>ちいさい</b>いちごほど こうとく！すばやくタップ！</>, en:<><b>Smaller</b> berries = more points!</>, zh:<><b>越小的草莓</b>得分越高！</>, ko:<><b>작은 딸기</b>일수록 고득점！</>, es:<><b>¡Las fresas más pequeñas</b> = más puntos!</>}[lang] || <><b>ちいさい</b>いちごほど こうとく！</>}</div></div>
          <div className="ichigo-rule-step"><div className="ichigo-rule-num">3</div><div className="ichigo-rule-text">{{ja:<><b>きんいちご⭐</b> がでたら チャンス！おおきくもらえるよ！</>, en:<><b>Gold star⭐</b> = big bonus!</>, zh:<><b>金草莓⭐</b>出现了，大奖励！</>, ko:<><b>금딸기⭐</b>가 나오면 찬스!</>, es:<><b>¡Fresa dorada⭐</b> = gran bonus!</>}[lang] || <><b>きんいちご⭐</b> がでたら チャンス！</>}</div></div>
          <div className="ichigo-rule-step"><div className="ichigo-rule-num">4</div><div className="ichigo-rule-text">{{ja:<><b>どうぶつ</b>はタップしちゃダメ！ライフがへるよ！</>, en:<>Don't tap <b>animals</b> — you'll lose a life!</>, zh:<>不要点<b>动物</b>！会减命的！</>, ko:<><b>동물</b>은 탭하지 마세요! 목숨이 줄어요!</>, es:<>¡No toques <b>animales</b> o perderás una vida!</>}[lang] || <><b>どうぶつ</b>はタップしちゃダメ！</>}</div></div>
          <div className="ichigo-rule-ex">
            {lang === 'en'
              ? <>Tap in a row for a <b style={{ color: '#e91e63' }}>Combo</b> bonus!<br />🍓🍓🍓 → Combo ×2!</>
              : lang === 'zh' ? <>连续点击获得<b style={{ color: '#e91e63' }}>连击</b>奖励！<br />🍓🍓🍓 → 连击×2！</>
              : lang === 'ko' ? <>연속 탭으로 <b style={{ color: '#e91e63' }}>콤보</b> 보너스！<br />🍓🍓🍓 → 콤보×2！</>
              : lang === 'es' ? <>¡Toca seguido para un bonus <b style={{ color: '#e91e63' }}>Combo</b>！<br />🍓🍓🍓 → Combo ×2！</>
              : <>れんぞくタップで<b style={{ color: '#e91e63' }}>コンボ</b>ボーナス！<br />🍓🍓🍓 → コンボ×2！</>}
          </div>
        </div>
        {hiScore > 0 && <div className="ichigo-hi-badge">🏆 {t(lang,'best')}: {hiScore}</div>}
        <button className="ichigo-start-btn" onClick={startGame}>▶ {t(lang,'start')}！</button>
        <button className="ww-back-btn" onClick={() => navigate('/')}>{t(lang,'back')}</button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════
     リザルト画面
  ════════════════════════════════════════════════ */
  if (screen === 'result') return (
    <div className="ichigo-wrap ichigo-result">
      <div className="ichigo-result-box">
        <h2 className="ichigo-result-title">{resultData?.title}</h2>
        <p className="ichigo-result-msg" dangerouslySetInnerHTML={{ __html: resultData?.msg ?? '' }} />
        {resultData?.isNew && <div className="ichigo-result-new">🏆 {t(lang,'newRecord')}</div>}
        <div className="ichigo-result-hi">{t(lang,'best')}: {resultData?.hi ?? hiScore}</div>
        <div className="ichigo-result-btns">
          <button className="ichigo-start-btn" onClick={startGame}>{t(lang,'retry')}</button>
          <button className="ichigo-back-btn"  onClick={() => navigate('/')}>{t(lang,'backToTitle')}</button>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════
     ゲーム画面 ── DOM ベース（position:absolute）
     アイテムはゲームエリアの中を上から下へ落下
     壁に当たると左右に反射
  ════════════════════════════════════════════════ */
  const HUD_H    = 60;
  const BASKET_H = 52;

  return (
    <div
      ref={wrapR}
      style={{
        position:   'fixed',
        inset:       0,
        background: '#fce4ec',
        overflow:   'hidden',
      }}
    >
      {/* ── HUD（3カラム：左🏠 ／ 中タイトル+スコア ／ 右のこり時間） ── */}
      <div style={{ position:'fixed', top:0, left:0, right:0, height:HUD_H, background:'rgba(233,30,99,0.82)', display:'flex', alignItems:'center', padding:'0 12px', gap:8, zIndex:10 }}>
        {/* LEFT */}
        <button onClick={() => { stopAll(); navigate('/'); }}
          style={{ fontSize:22, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:10, padding:'4px 8px', cursor:'pointer', flexShrink:0 }}>🏠</button>
        {/* CENTER */}
        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ fontSize:13, fontWeight:900, color:'#fff', textShadow:'1px 1px 0 rgba(0,0,0,0.3)', lineHeight:1.2 }}>
            {{ja:'🍓 いちごあつめ', en:'🍓 Strawberry Time', zh:'🍓 收集草莓', ko:'🍓 딸기 모으기', es:'🍓 Tiempo de Fresa'}[lang] || '🍓 いちごあつめ'}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.88)', fontWeight:700 }}>
            {t(lang,'score')}: {score}
          </div>
        </div>
        {/* RIGHT */}
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:12, padding:'4px 10px', textAlign:'center' }}>
            <div style={{ fontSize:10, color:'#880e4f', fontWeight:700 }}>{t(lang,'timeLeft')}</div>
            <div style={{ fontSize:20, fontWeight:900, color:'#560027' }}>{timeLeft}</div>
          </div>
          <button onClick={() => { const m = toggleMute(); setMuted(m); if (!m) playIchigoBgm(); }}
            style={{ fontSize:20, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:10, padding:'4px 8px', cursor:'pointer' }}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* ── コンボ表示 ── */}
      <div style={{
        position:   'fixed',
        top:         HUD_H + 4,
        right:       14,
        zIndex:      8,
        background:  combo >= 5 ? 'rgba(255,100,0,0.9)' : combo >= 3 ? 'rgba(233,30,99,0.85)' : 'rgba(255,255,255,0.92)',
        borderRadius: 14,
        padding:     '4px 12px',
        fontSize:    13,
        fontWeight:  700,
        color:       combo >= 3 ? '#fff' : '#e91e63',
        boxShadow:   '0 3px 0 #f48fb1',
        minWidth:    80,
        textAlign:   'center',
      }}>
        {combo > 1 ? `🔥 コンボ x${combo}` : 'コンボ x1'}
      </div>

      {/* ── アイテム（position:absolute） ── */}
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => tapItem(item.id, item.isTrap, item.pts)}
          style={{
            position:       'fixed',
            left:            item.x - item.size,
            top:             item.y - item.size,
            width:           item.size * 2,
            height:          item.size * 2,
            borderRadius:   '50%',
            border:          item.isTrap
                               ? '2px solid rgba(255,80,80,0.5)'
                               : item.type === 'gold'
                                 ? '3px solid #FFD700'
                                 : '2px solid rgba(255,150,150,0.5)',
            background:      item.isTrap
                               ? 'rgba(255,230,200,0.85)'
                               : item.type === 'gold'
                                 ? 'rgba(255,250,200,0.9)'
                                 : 'rgba(255,200,210,0.85)',
            fontSize:        item.size * 1.3,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            padding:          0,
            cursor:          'pointer',
            userSelect:      'none',
            WebkitUserSelect:'none',
            touchAction:     'manipulation',
            zIndex:           5,
            boxShadow:        item.type === 'gold'
                                ? '0 0 12px rgba(255,215,0,0.6)'
                                : '0 3px 8px rgba(0,0,0,0.15)',
          }}
        >
          {item.emoji}
          {/* トラップの ✕ */}
          {item.isTrap && (
            <span style={{
              position:       'absolute',
              fontSize:        item.size * 0.9,
              color:          'rgba(255,50,50,0.5)',
              pointerEvents:  'none',
            }}>✕</span>
          )}
          {/* ポイント表示 */}
          {!item.isTrap && (
            <span style={{
              position:       'absolute',
              bottom:          2,
              right:           2,
              fontSize:        Math.max(item.size * 0.5, 10),
              fontWeight:      700,
              color:           item.type === 'gold' ? '#FFD700' : 'rgba(136,14,79,0.8)',
              pointerEvents:  'none',
              lineHeight:      1,
            }}>+{item.pts}</span>
          )}
        </button>
      ))}

      {/* ── かご・ライフ表示 ── */}
      <div style={{
        position:    'fixed',
        bottom:       16,
        left:        '50%',
        transform:   'translateX(-50%)',
        zIndex:       8,
        display:     'flex',
        alignItems:  'center',
        gap:          10,
        background:  'rgba(255,255,255,0.9)',
        borderRadius: 20,
        padding:     '8px 18px',
        boxShadow:   '0 4px 0 #f48fb1',
      }}>
        <span style={{ fontSize: 32 }}>{collected >= 20 ? '🎁' : '🧺'}</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: '#880e4f' }}>{collected}こ</span>
        <span style={{ fontSize: 20 }}>{'❤️'.repeat(hp)}{'🖤'.repeat(3 - hp)}</span>
      </div>
    </div>
  );
}
