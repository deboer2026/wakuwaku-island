import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTopPageBgm, stopBgm, toggleMute, getMuteState, ensureAudioStarted } from '../utils/audio';
import { getPlayCount } from '../utils/playCounter';
import { KisekaeCharacters, KisekaePanel, DEFAULT_KISEKAE } from '../components/Kisekae';
import LoginBonus from '../components/LoginBonus';
import Shop from '../components/Shop';
import { getCoins, checkLoginBonus, claimLoginBonus } from '../utils/coins';
import './TopPage.css';

/* ════════════════════════════════════════════════════
   ① 更新日時（手動で更新する定数）
════════════════════════════════════════════════════ */
const LAST_UPDATE_DATE = '2026-04-24';

function getDaysSinceUpdate() {
  return Math.floor((new Date() - new Date(LAST_UPDATE_DATE)) / 86400000);
}

/* ════════════════════════════════════════════════════
   ② 季節バナー（月から自動判定）
════════════════════════════════════════════════════ */
function getSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5)  return { emoji:'🌸', color:'#ff8fab', glow:'rgba(255,143,171,0.5)', ja:'はるのゲームパーク！', en:'Spring Game Park!' };
  if (m >= 6 && m <= 8)  return { emoji:'🌊', color:'#00d4ff', glow:'rgba(0,212,255,0.5)',   ja:'なつのゲームパーク！', en:'Summer Game Park!' };
  if (m >= 9 && m <= 11) return { emoji:'🍂', color:'#e76f51', glow:'rgba(231,111,81,0.5)',  ja:'あきのゲームパーク！', en:'Autumn Game Park!' };
  return                         { emoji:'⛄', color:'#90e0ef', glow:'rgba(144,224,239,0.5)', ja:'ふゆのゲームパーク！', en:'Winter Game Park!' };
}

/* ════════════════════════════════════════════════════
   ④ 今日のおすすめ（日付ハッシュ）
════════════════════════════════════════════════════ */
function getTodayIndex(n) {
  const s = new Date().toDateString();
  return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % n;
}

/* ════════════════════════════════════════════════════
   ゲームリスト（ja / en 両対応）
════════════════════════════════════════════════════ */
const GAMES = [
  { id:'g1', route:'/shabondama',      icon:'🫧', num:1, color:'#4DB8FF', stars:5, isNew:false,
    ja:{ name:'シャボンだまポン',   desc:'とんでくる たまを\nタップしてわろう！'        },
    en:{ name:'Bubble Pop',           desc:'Tap flying bubbles\nbefore they escape!'     } },
  { id:'g2', route:'/kudamono-catch',  icon:'🍎', num:2, color:'#FF6B35', stars:4, isNew:false,
    ja:{ name:'くだものキャッチ',   desc:'おちてくる くだものを\nキャッチしよう！'       },
    en:{ name:'Fruit Catch',          desc:'Catch falling fruits\nbefore they drop!'      } },
  { id:'g3', route:'/meiro',           icon:'🗺️', num:3, color:'#7B68EE', stars:4, isNew:false,
    ja:{ name:'めいろあそび',       desc:'めいろを とおって\nゴールをめざせ！'           },
    en:{ name:'Maze Play',            desc:'Navigate the maze\nto reach the goal!'        } },
  { id:'g4', route:'/doubutsu-puzzle', icon:'🧩', num:4, color:'#2ECC71', stars:5, isNew:false,
    ja:{ name:'どうぶつパズル',     desc:'どうぶつを ならべて\nパズルをとこう！'         },
    en:{ name:'Animal Puzzle',        desc:'Line up animals\nto solve the puzzle!'        } },
  { id:'g5', route:'/kazu-asobi',      icon:'🔢', num:5, color:'#F4D03F', stars:3, isNew:false,
    ja:{ name:'かずあそび',         desc:'かずを かぞえて\nたのしく まなぼう！'          },
    en:{ name:'Number Fun',           desc:'Count and learn\nnumbers with fun!'           } },
  { id:'g6', route:'/animal-soccer',   icon:'⚽', num:6, color:'#00BCD4', stars:5, isNew:false,
    ja:{ name:'どうぶつサッカー',   desc:'どうぶつたちと\nサッカーをしよう！'            },
    en:{ name:'Animal Soccer',        desc:'Play soccer with\ncute animals!'              } },
  { id:'g7', route:'/jewelry-shop',    icon:'💎', num:7, color:'#E91E63', stars:4, isNew:true,
    ja:{ name:'ほうせきやさん',     desc:'どうぶつさんに\nアクセサリをわたそう！'        },
    en:{ name:'Jewelry Shop',         desc:'Give accessories\nto cute animals!'           } },
  { id:'g8', route:'/sushi',           icon:'🍣', num:8, color:'#FF5722', stars:5, isNew:true,
    ja:{ name:'さーもん',           desc:'かいてんずし！\nサーモンだけ\nタップしよう！' },
    en:{ name:'Catch Salmon',         desc:'Tap only salmon\nin the sushi conveyor!'      } },
  { id:'g9', route:'/ichigo',          icon:'🍓', num:9, color:'#E91E63', stars:5, isNew:true,
    ja:{ name:'いちご',             desc:'30びょうで\nいちごを\nあつめよう！'            },
    en:{ name:'Strawberry Time',      desc:'Collect strawberries\nin 30 seconds!'         } },
];

/* ════════════════════════════════════════════════════
   星空データ（固定シード）
════════════════════════════════════════════════════ */
const STARS = Array.from({ length: 120 }, (_, i) => {
  // deterministic pseudo-random using index
  const r1 = ((i * 9301 + 49297) % 233280) / 233280;
  const r2 = ((i * 6789 + 1234)  % 233280) / 233280;
  const r3 = ((i * 3571 + 7777)  % 233280) / 233280;
  const r4 = ((i * 2345 + 5678)  % 233280) / 233280;
  const r5 = ((i * 1234 + 9876)  % 233280) / 233280;
  return {
    id:    i,
    top:   r1 * 100,
    left:  r2 * 100,
    size:  r3 * 2.5 + 0.5,
    dur:   r4 * 3 + 1.5,
    delay: r5 * 3,
  };
});

/* ════════════════════════════════════════════════════
   ⑤ プレイカウンター
════════════════════════════════════════════════════ */
function PlayCounter({ target, lang }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target) return;
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    const tm = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, 400);
    return () => { clearTimeout(tm); cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return (
    <div className="tp-counter">
      <span className="tp-counter-icon">🎮</span>
      <div className="tp-counter-body">
        <div className="tp-counter-label">
          {lang === 'en' ? 'Times Played Together' : 'みんなであそんだかず'}
        </div>
        <div className="tp-counter-num">{display.toLocaleString()}</div>
      </div>
      <span className="tp-counter-unit">{lang === 'en' ? 'times' : 'かい'}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ゲームカード（グラスモーフィズム）
════════════════════════════════════════════════════ */
function GameCard({ game, lang, isRecommended, onClick }) {
  const t = game[lang] || game.ja;
  const stars = '⭐'.repeat(game.stars) + '☆'.repeat(5 - game.stars);

  return (
    <button
      className={`tp-card${isRecommended ? ' tp-card--recommend' : ''}`}
      style={{ '--card-color': game.color }}
      onClick={onClick}
    >
      {isRecommended && (
        <div className="tp-card-ribbon">
          {lang === 'en' ? '⭐ Today\'s Pick!' : '⭐ きょうのおすすめ！'}
        </div>
      )}

      <div className="tp-card-top">
        {game.isNew && (
          <span className="tp-card-new">
            {lang === 'en' ? '✨ New!' : '✨ あたらしい！'}
          </span>
        )}
        <span className="tp-card-num">{game.num}</span>
        <span className="tp-card-icon">{game.icon}</span>
        <div className="tp-card-shine" />
      </div>

      <div className="tp-card-body">
        <div className="tp-card-name">{t.name}</div>
        <div className="tp-card-desc">
          {t.desc.split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        <div className="tp-card-stars">{stars}</div>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════
   TopPage 本体
════════════════════════════════════════════════════ */
export default function TopPage() {
  const navigate   = useNavigate();
  const [lang,        setLang]        = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [isMuted,     setIsMuted]     = useState(getMuteState());
  const [playCount,   setPlayCount]   = useState(0);
  const [kisekaeState,setKisekaeState]= useState(() => {
    try {
      const saved = localStorage.getItem('kisekae_state');
      return saved ? JSON.parse(saved) : DEFAULT_KISEKAE;
    } catch { return DEFAULT_KISEKAE; }
  });
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [panelChara,  setPanelChara]  = useState('princess');
  const [shopOpen,    setShopOpen]    = useState(false);
  const [coins,       setCoins]       = useState(getCoins);
  const [loginBonus,  setLoginBonus]  = useState(null);

  const season    = getSeason();
  const daysSince = getDaysSinceUpdate();
  const todayIdx  = getTodayIndex(GAMES.length);

  useEffect(() => {
    ensureAudioStarted().then(() => playTopPageBgm());
    setPlayCount(getPlayCount() + 1312);
    // Check login bonus
    const bonus = checkLoginBonus();
    if (bonus) setLoginBonus(bonus);
    return () => stopBgm();
  }, []);

  async function handleMuteToggle() {
    toggleMute();
    setIsMuted(getMuteState());
    if (!getMuteState()) {
      await ensureAudioStarted();
      playTopPageBgm();
    }
  }

  function spawnParticles(x, y) {
    const emojis = ['✨', '💖', '⭐', '🌟', '💫', '🎉'];
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('span');
      el.className = 'ww-particle';
      el.textContent = emojis[i % emojis.length];
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
      const angle = (i / 6) * Math.PI * 2;
      el.style.setProperty('--px', (Math.cos(angle) * 80) + 'px');
      el.style.setProperty('--py', (Math.sin(angle) * 80 - 40) + 'px');
      document.body.appendChild(el);
      setTimeout(() => { if (el.parentNode) el.remove(); }, 800);
    }
  }

  function openPanel(chara) {
    setPanelChara(chara);
    setPanelOpen(true);
  }

  function handleLoginBonusClaim() {
    claimLoginBonus();
    setCoins(getCoins());
    setLoginBonus(null);
  }

  function handleKisekaeChange(next) {
    setKisekaeState(next);
    localStorage.setItem('kisekae_state', JSON.stringify(next));
  }

  function handleLangToggle() {
    const next = lang === 'ja' ? 'en' : 'ja';
    setLang(next);
    localStorage.setItem('wakuwaku_lang', next);
  }

  const lastUpdateText = lang === 'en'
    ? (daysSince === 0 ? 'Today!' : `${daysSince} days ago`)
    : (daysSince === 0 ? 'きょう！' : `${daysSince}にちまえ`);

  return (
    <div className="tp-wrap">

      {/* ── 星空背景 ── */}
      <div className="tp-starfield" aria-hidden="true">
        {STARS.map(s => (
          <div
            key={s.id}
            className="tp-star"
            style={{
              top:   `${s.top}%`,
              left:  `${s.left}%`,
              width:  s.size,
              height: s.size,
              '--dur':   `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ── フローティングデコキャラ ── */}
      <div className="tp-deco" aria-hidden="true">
        <span style={{ left:'6%',  top:'22%', '--dur':'3.8s', '--rot':'-4deg', fontSize:28 }}>🌸</span>
        <span style={{ right:'5%', top:'18%', '--dur':'3.5s', '--rot':'8deg',  fontSize:26 }}>⭐</span>
        <span style={{ left:'2%',  top:'40%', '--dur':'4s',   '--rot':'-10deg',fontSize:24 }}>🦋</span>
        <span style={{ right:'2%', top:'38%', '--dur':'3.3s', '--rot':'5deg',  fontSize:22 }}>✨</span>
      </div>

      {/* ── コイン残高（左上） ── */}
      <div className="tp-coin-badge">
        🪙 <span className="tp-coin-num">{coins}</span>
        <span className="tp-coin-unit">{lang === 'en' ? 'coins' : 'まい'}</span>
      </div>

      {/* ── 右上ボタン群 ── */}
      <div className="tp-top-btns">
        <button className="tp-top-btn tp-shop-btn" onClick={() => setShopOpen(true)}
          title={lang === 'en' ? 'Shop' : 'ショップ'}>
          🛍️
        </button>
        <button className="tp-top-btn ksk-top-btn" onClick={() => openPanel('princess')}
          title={lang === 'en' ? 'Dress up' : 'きがえ'}>
          👗
        </button>
        <button className="tp-top-btn" onClick={handleMuteToggle}
          title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button className="tp-top-btn" onClick={handleLangToggle}
          title="Language / 言語">
          🌐
        </button>
      </div>

      {/* ── ヘッダー ── */}
      <div className="tp-header">
        <div className="tp-park-badge">🏝️ GAME PARK ✦</div>

        <div className="ksk-title-zone">
          <KisekaeCharacters
            kisekaeState={kisekaeState}
            onOpen={openPanel}
            lang={lang}
          />

          <div className="tp-title-wrap">
            <h1 className="tp-title">
              <span className="tp-title-1">
                {lang === 'en' ? 'Waku Waku' : 'わくわく'}
              </span>
              <span className="tp-title-2">
                {lang === 'en' ? 'Island' : 'アイランド'}
              </span>
            </h1>
          </div>

          <div className="tp-subtitle">
            {lang === 'en' ? '🏝️ Fun Play Island!' : '🏝️ たのしい あそびじま！'}
          </div>
        </div>

        {/* ② 季節バナー */}
        <div
          className="tp-season"
          style={{ '--season-color': season.color, '--season-glow': season.glow }}
        >
          {season.emoji} {lang === 'en' ? season.en : season.ja}
        </div>

        {/* ⑤ プレイカウンター */}
        <PlayCounter target={playCount} lang={lang} />
      </div>

      {/* ① 更新バー */}
      <div className="tp-update-bar">
        {lang === 'en' ? '🕐 Last Update: ' : '🕐 さいごのこうしん：'}
        {lastUpdateText}
        {'　✦　'}
        {lang === 'en' ? 'New games coming soon!' : 'あたらしいゲームが どんどん くるよ！'}
      </div>

      {/* ── ゲームセクション ── */}
      <div className="tp-game-section">
        <div className="tp-section-header">
          <h2>{lang === 'en' ? '🎮 Choose a Game' : '🎮 ゲームえらんでね'}</h2>
          <div className="tp-section-divider" />
        </div>

        <div className="tp-grid">
          {GAMES.map((game, i) => (
            <GameCard
              key={game.id}
              game={game}
              lang={lang}
              isRecommended={i === todayIdx}
              onClick={(e) => { spawnParticles(e.clientX, e.clientY); navigate(game.route); }}
            />
          ))}
        </div>
      </div>

      {/* ── フッターパレード ── */}
      <div className="tp-parade">
        {['🦁','🐨','🦊','🐸','🐧','🦝','🐥','🦋','🐝','🌸'].map((e, i) => (
          <span key={i} style={{ '--dur': `${2 + i * 0.3}s`, animationDelay: `${i * 0.15}s` }}>
            {e}
          </span>
        ))}
      </div>
      <div className="tp-footer">
        {lang === 'en' ? '🌟 Pick a game to play! 🌟' : '🌟 あそびたいゲームをえらんでね 🌟'}
      </div>

      {/* ── 着せ替えパネル ── */}
      <KisekaePanel
        isOpen={panelOpen}
        initialChara={panelChara}
        onClose={() => setPanelOpen(false)}
        kisekaeState={kisekaeState}
        onStateChange={handleKisekaeChange}
        lang={lang}
      />

      {/* ── ショップ ── */}
      <Shop
        isOpen={shopOpen}
        onClose={() => setShopOpen(false)}
        lang={lang}
        onCoinsChange={setCoins}
      />

      {/* ── ログインボーナス ── */}
      {loginBonus && (
        <LoginBonus
          bonus={loginBonus.bonus}
          streak={loginBonus.streak}
          onClaim={handleLoginBonusClaim}
          lang={lang}
        />
      )}

    </div>
  );
}
