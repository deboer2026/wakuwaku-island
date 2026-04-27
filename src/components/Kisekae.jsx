import { useState, useEffect } from 'react';
import { getUnlockedItems } from '../utils/coins';
import { SHOP_ITEMS } from '../utils/shopItems';
import './Kisekae.css';

// Build extra items to show in a category from purchased shop items
function getShopExtras(chara, cat) {
  const unlocked = getUnlockedItems();
  return SHOP_ITEMS
    .filter(s => s.chara === chara && s.cat === cat && unlocked.includes(s.id))
    .map(s => s.itemData);
}

/* ════════════════════════════════════════════════════
   データ定義
════════════════════════════════════════════════════ */
const CATS = [
  { id: 'crown',     label: '👑 かんむり' },
  { id: 'dress',     label: '👗 いろ'     },
  { id: 'accessory', label: '📿 アクセ'   },
  { id: 'item',      label: '🪄 こもの'   },
  { id: 'pet',       label: '🐾 ペット'   },
];

export const KISEKAE_ITEMS = {
  princess: {
    crown: [
      { id:'c0', emoji:'👑', name:'おうかん' },
      { id:'c1', emoji:'🌸', name:'はな'     },
      { id:'c2', emoji:'⭐', name:'スター'   },
      { id:'c3', emoji:'🌈', name:'にじ'     },
      { id:'c4', emoji:'🎀', name:'リボン'   },
      { id:'c5', emoji:'🦋', name:'ちょうちょ' },
      { id:'c6', emoji:'💎', name:'ダイヤ'   },
      { id:'c7', emoji:'',   name:'なし'     },
    ],
    dress: [
      { id:'d0', emoji:'🩷', name:'ピンク',   c1:'#ff80ab', c2:'#f06292', hair:'#F9A825' },
      { id:'d1', emoji:'💜', name:'むらさき', c1:'#ce93d8', c2:'#ab47bc', hair:'#F9A825' },
      { id:'d2', emoji:'💙', name:'あお',     c1:'#90caf9', c2:'#42a5f5', hair:'#FBC02D' },
      { id:'d3', emoji:'💚', name:'みどり',   c1:'#a5d6a7', c2:'#66bb6a', hair:'#8D6E63' },
      { id:'d4', emoji:'🤍', name:'しろ',     c1:'#f8f8ff', c2:'#e0e0e0', hair:'#BDBDBD' },
      { id:'d5', emoji:'🧡', name:'オレンジ', c1:'#ffb74d', c2:'#ff9800', hair:'#F9A825' },
      { id:'d6', emoji:'❤️', name:'あか',     c1:'#ef9a9a', c2:'#e53935', hair:'#5D4037' },
      { id:'d7', emoji:'🖤', name:'くろ',     c1:'#757575', c2:'#212121', hair:'#212121' },
    ],
    accessory: [
      { id:'a0', emoji:'📿', name:'ネックレス' },
      { id:'a1', emoji:'💍', name:'ゆびわ'     },
      { id:'a2', emoji:'💎', name:'ダイヤ'     },
      { id:'a3', emoji:'❤️', name:'ハート'     },
      { id:'a4', emoji:'⭐', name:'スター'     },
      { id:'a5', emoji:'🌸', name:'はな'       },
      { id:'a6', emoji:'🌟', name:'キラキラ'   },
      { id:'a7', emoji:'',   name:'なし'       },
    ],
    item: [
      { id:'i0', emoji:'🪄', name:'ステッキ'   },
      { id:'i1', emoji:'👜', name:'バッグ'     },
      { id:'i2', emoji:'🌹', name:'バラ'       },
      { id:'i3', emoji:'🌂', name:'パラソル'   },
      { id:'i4', emoji:'🧸', name:'ぬいぐるみ' },
      { id:'i5', emoji:'💐', name:'はなたば'   },
      { id:'i6', emoji:'🌈', name:'にじ'       },
      { id:'i7', emoji:'',   name:'なし'       },
    ],
    pet: [
      { id:'p0', emoji:'🐱', name:'ねこ'     },
      { id:'p1', emoji:'🐶', name:'いぬ'     },
      { id:'p2', emoji:'🐰', name:'うさぎ'   },
      { id:'p3', emoji:'🦊', name:'きつね'   },
      { id:'p4', emoji:'🐸', name:'かえる'   },
      { id:'p5', emoji:'🦋', name:'ちょうちょ' },
      { id:'p6', emoji:'🐼', name:'パンダ'   },
      { id:'p7', emoji:'',   name:'なし'     },
    ],
  },
  prince: {
    crown: [
      { id:'c0', emoji:'👑', name:'おうかん'   },
      { id:'c1', emoji:'⭐', name:'スター'     },
      { id:'c2', emoji:'🌟', name:'キラキラ'   },
      { id:'c3', emoji:'💎', name:'ダイヤ'     },
      { id:'c4', emoji:'🎩', name:'ぼうし'     },
      { id:'c5', emoji:'🪖', name:'ヘルメット' },
      { id:'c6', emoji:'🌈', name:'にじ'       },
      { id:'c7', emoji:'',   name:'なし'       },
    ],
    dress: [
      { id:'d0', emoji:'💙', name:'あお',     c1:'#1976D2', c2:'#1565C0', hair:'#5D4037' },
      { id:'d1', emoji:'💜', name:'むらさき', c1:'#7B1FA2', c2:'#4A148C', hair:'#5D4037' },
      { id:'d2', emoji:'❤️', name:'あか',     c1:'#C62828', c2:'#B71C1C', hair:'#3E2723' },
      { id:'d3', emoji:'💚', name:'みどり',   c1:'#2E7D32', c2:'#1B5E20', hair:'#5D4037' },
      { id:'d4', emoji:'🖤', name:'くろ',     c1:'#424242', c2:'#212121', hair:'#212121' },
      { id:'d5', emoji:'🤍', name:'しろ',     c1:'#ECEFF1', c2:'#B0BEC5', hair:'#FBC02D' },
      { id:'d6', emoji:'🧡', name:'オレンジ', c1:'#E65100', c2:'#BF360C', hair:'#5D4037' },
      { id:'d7', emoji:'💛', name:'きいろ',   c1:'#F9A825', c2:'#F57F17', hair:'#5D4037' },
    ],
    accessory: [
      { id:'a0', emoji:'⚔️',  name:'つるぎ'   },
      { id:'a1', emoji:'🛡️', name:'たて'      },
      { id:'a2', emoji:'💎',  name:'ダイヤ'   },
      { id:'a3', emoji:'⭐',  name:'スター'   },
      { id:'a4', emoji:'🏆',  name:'トロフィー' },
      { id:'a5', emoji:'🎖️', name:'メダル'   },
      { id:'a6', emoji:'💍',  name:'ゆびわ'   },
      { id:'a7', emoji:'',    name:'なし'     },
    ],
    item: [
      { id:'i0', emoji:'⚔️', name:'けん'     },
      { id:'i1', emoji:'🪄',  name:'ステッキ' },
      { id:'i2', emoji:'🌹',  name:'バラ'     },
      { id:'i3', emoji:'🎺',  name:'らっぱ'   },
      { id:'i4', emoji:'🗺️', name:'ちず'     },
      { id:'i5', emoji:'🌈',  name:'にじ'     },
      { id:'i6', emoji:'🏇',  name:'うま'     },
      { id:'i7', emoji:'',    name:'なし'     },
    ],
    pet: [
      { id:'p0', emoji:'🐻', name:'くま'     },
      { id:'p1', emoji:'🦁', name:'らいおん' },
      { id:'p2', emoji:'🐯', name:'とら'     },
      { id:'p3', emoji:'🐺', name:'おおかみ' },
      { id:'p4', emoji:'🐲', name:'ドラゴン' },
      { id:'p5', emoji:'🦅', name:'わし'     },
      { id:'p6', emoji:'🐴', name:'うま'     },
      { id:'p7', emoji:'',   name:'なし'     },
    ],
  },
};

export const DEFAULT_KISEKAE = {
  princess: { crown: 'c0', dress: 'd0', accessory: '', item: '', pet: '' },
  prince:   { crown: 'c0', dress: 'd0', accessory: '', item: '', pet: '' },
};

/* ════════════════════════════════════════════════════
   キラキラエフェクト
════════════════════════════════════════════════════ */
export function spawnSparkles(x, y) {
  const emojis = ['✨', '⭐', '💫', '🌟', '💖'];
  emojis.forEach((em, i) => {
    const el = document.createElement('div');
    el.className = 'ksk-sparkle';
    el.textContent = em;
    const a = (i / emojis.length) * Math.PI * 2;
    const d = 38 + i * 14;
    el.style.cssText = [
      `left:${x}px`, `top:${y}px`,
      `--dx:${(Math.cos(a) * d).toFixed(1)}px`,
      `--dy:${(Math.sin(a) * d - 20).toFixed(1)}px`,
      `animation-delay:${(i * 0.07).toFixed(2)}s`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 900);
  });
}

/* ════════════════════════════════════════════════════
   SVG: プリンセス
════════════════════════════════════════════════════ */
export function PrincessSVG({ state }) {
  const dress = KISEKAE_ITEMS.princess.dress.find(i => i.id === state.dress)
    ?? KISEKAE_ITEMS.princess.dress[0];
  const crown = KISEKAE_ITEMS.princess.crown.find(i => i.id === state.crown);
  const acc   = KISEKAE_ITEMS.princess.accessory.find(i => i.id === state.accessory);
  const item  = KISEKAE_ITEMS.princess.item.find(i => i.id === state.item);

  return (
    <svg className="ksk-svg" viewBox="0 0 72 114" xmlns="http://www.w3.org/2000/svg">
      {/* スカート */}
      <ellipse cx="36" cy="93" rx="27" ry="21" fill={dress.c1}/>
      <polygon points="36,60 11,104 61,104" fill={dress.c2}/>
      <ellipse cx="28" cy="81" rx="6" ry="12" fill="rgba(255,255,255,0.2)"/>
      {/* リボン */}
      <circle cx="36" cy="60" r="3" fill={dress.c2}/>
      <path d="M33,58 Q36,54 39,58" fill={dress.c2} stroke="none"/>
      {/* ボディ */}
      <rect x="28" y="53" width="16" height="15" rx="5" fill="#FFCCBC"/>
      {/* 首 */}
      <rect x="33" y="47" width="6" height="10" rx="3" fill="#FFCCBC"/>
      {/* 顔 */}
      <circle cx="36" cy="37" r="17" fill="#FFE0B2"/>
      {/* 髪(後ろ) */}
      <ellipse cx="36" cy="27" rx="18" ry="14" fill={dress.hair}/>
      <ellipse cx="19" cy="39" rx="7.5" ry="12" fill={dress.hair}/>
      <ellipse cx="53" cy="39" rx="7.5" ry="12" fill={dress.hair}/>
      {/* かんむり */}
      {crown?.emoji
        ? <text x="36" y="20" fontSize="15" textAnchor="middle" dominantBaseline="middle">{crown.emoji}</text>
        : <>
            <polygon points="21,24 27,15 32,22 36,13 40,22 45,15 51,24" fill="#FFD700" stroke="#FFA000" strokeWidth="1"/>
            <circle cx="36" cy="14" r="3.5" fill="#FF1744"/>
            <circle cx="22" cy="24" r="1.5" fill="#FFAB40"/>
            <circle cx="50" cy="24" r="1.5" fill="#FFAB40"/>
          </>
      }
      {/* 目 */}
      <circle cx="29.5" cy="36" r="4.2" fill="#4A2E20"/>
      <circle cx="42.5" cy="36" r="4.2" fill="#4A2E20"/>
      <circle cx="31"   cy="34.5" r="1.6" fill="#fff"/>
      <circle cx="44"   cy="34.5" r="1.6" fill="#fff"/>
      {/* まつ毛 */}
      <path d="M26.5,32 L25,30" stroke="#4A2E20" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M29,31 L28,29" stroke="#4A2E20" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M44,31 L43,29" stroke="#4A2E20" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M46.5,32 L48,30" stroke="#4A2E20" strokeWidth="1.1" strokeLinecap="round"/>
      {/* 口 */}
      <path d="M30.5,44 Q36,49.5 41.5,44" stroke="#E91E63" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 頬 */}
      <ellipse cx="22" cy="41" rx="5.5" ry="3.5" fill="#FFB3C1" opacity="0.55"/>
      <ellipse cx="50" cy="41" rx="5.5" ry="3.5" fill="#FFB3C1" opacity="0.55"/>
      {/* アクセサリ */}
      {acc?.emoji && <text x="36" y="52" fontSize="9" textAnchor="middle" dominantBaseline="middle">{acc.emoji}</text>}
      {/* こもの */}
      {item?.emoji && <text x="63" y="71" fontSize="12" textAnchor="middle" dominantBaseline="middle">{item.emoji}</text>}
      {/* くつ */}
      <ellipse cx="29" cy="110" rx="6" ry="3.2" fill={dress.c2}/>
      <ellipse cx="43" cy="110" rx="6" ry="3.2" fill={dress.c2}/>
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   SVG: プリンス
════════════════════════════════════════════════════ */
export function PrinceSVG({ state }) {
  const dress = KISEKAE_ITEMS.prince.dress.find(i => i.id === state.dress)
    ?? KISEKAE_ITEMS.prince.dress[0];
  const crown = KISEKAE_ITEMS.prince.crown.find(i => i.id === state.crown);
  const acc   = KISEKAE_ITEMS.prince.accessory.find(i => i.id === state.accessory);
  const item  = KISEKAE_ITEMS.prince.item.find(i => i.id === state.item);
  const eyebrowColor = dress.hair === '#212121' ? '#555' : dress.hair;

  return (
    <svg className="ksk-svg" viewBox="0 0 72 114" xmlns="http://www.w3.org/2000/svg">
      {/* マント */}
      <path d="M18,55 Q7,74 11,97" stroke={dress.c2} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M54,55 Q65,74 61,97" stroke={dress.c2} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.65"/>
      {/* ズボン */}
      <rect x="23" y="74" width="11" height="29" rx="4" fill={dress.c2}/>
      <rect x="38" y="74" width="11" height="29" rx="4" fill={dress.c2}/>
      {/* 上着 */}
      <rect x="18" y="52" width="36" height="27" rx="7" fill={dress.c1}/>
      <rect x="20" y="54" width="13" height="17" rx="5" fill="rgba(255,255,255,0.15)"/>
      {/* ボタン */}
      <circle cx="36" cy="57" r="1.3" fill="rgba(255,255,255,0.7)"/>
      <circle cx="36" cy="62" r="1.3" fill="rgba(255,255,255,0.7)"/>
      <circle cx="36" cy="67" r="1.3" fill="rgba(255,255,255,0.7)"/>
      {/* ボディ */}
      <rect x="28" y="50" width="16" height="10" rx="3" fill="#FFCCBC"/>
      {/* 首 */}
      <rect x="33" y="43" width="6" height="11" rx="3" fill="#FFCCBC"/>
      {/* 顔 */}
      <circle cx="36" cy="33" r="17" fill="#FFE0B2"/>
      {/* 髪 */}
      <ellipse cx="36" cy="23" rx="18" ry="13" fill={dress.hair}/>
      <ellipse cx="19" cy="33" rx="6"  ry="10" fill={dress.hair}/>
      <ellipse cx="53" cy="33" rx="6"  ry="10" fill={dress.hair}/>
      {/* かんむり */}
      {crown?.emoji
        ? <text x="36" y="16" fontSize="15" textAnchor="middle" dominantBaseline="middle">{crown.emoji}</text>
        : <>
            <polygon points="21,21 27,12 32,19 36,10 40,19 45,12 51,21" fill="#FFD700" stroke="#FFA000" strokeWidth="1"/>
            <circle cx="36" cy="11" r="3.5" fill="#2196F3"/>
            <circle cx="22" cy="21" r="1.5" fill="#FFAB40"/>
            <circle cx="50" cy="21" r="1.5" fill="#FFAB40"/>
          </>
      }
      {/* 目 */}
      <circle cx="29.5" cy="32" r="4.2" fill="#2E1F0E"/>
      <circle cx="42.5" cy="32" r="4.2" fill="#2E1F0E"/>
      <circle cx="31"   cy="30.5" r="1.6" fill="#fff"/>
      <circle cx="44"   cy="30.5" r="1.6" fill="#fff"/>
      {/* 眉 */}
      <path d="M26,27 Q29.5,24.5 33,27" stroke={eyebrowColor} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M39,27 Q42.5,24.5 46,27" stroke={eyebrowColor} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 口 */}
      <path d="M30.5,40 Q36,44 41.5,40" stroke="#BF8A7A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 頬 */}
      <ellipse cx="22" cy="36" rx="5" ry="3.2" fill="#FFB3C1" opacity="0.3"/>
      <ellipse cx="50" cy="36" rx="5" ry="3.2" fill="#FFB3C1" opacity="0.3"/>
      {/* アクセサリ */}
      {acc?.emoji && <text x="36" y="47" fontSize="9" textAnchor="middle" dominantBaseline="middle">{acc.emoji}</text>}
      {/* こもの */}
      {item?.emoji && <text x="9" y="67" fontSize="12" textAnchor="middle" dominantBaseline="middle">{item.emoji}</text>}
      {/* くつ */}
      <rect x="20" y="101" width="14" height="7" rx="3.5" fill={dress.c2}/>
      <rect x="38" y="101" width="14" height="7" rx="3.5" fill={dress.c2}/>
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   キャラクターウィジェット（タイトル左右に常駐）
════════════════════════════════════════════════════ */
export function KisekaeCharacters({ kisekaeState, onOpen, lang }) {
  const psPet = KISEKAE_ITEMS.princess.pet.find(i => i.id === kisekaeState.princess.pet);
  const prPet = KISEKAE_ITEMS.prince.pet.find(i => i.id === kisekaeState.prince.pet);

  return (
    <>
      {/* プリンセス（左） */}
      <button
        className="ksk-chara-wrap ksk-chara-wrap--left"
        onClick={(e) => { onOpen('princess'); spawnSparkles(e.clientX, e.clientY); }}
        aria-label="プリンセスを着せ替え"
      >
        <div className="ksk-chara-inner">
          <PrincessSVG state={kisekaeState.princess}/>
          {psPet?.emoji && <div className="ksk-pet ksk-pet--left">{psPet.emoji}</div>}
        </div>
        <div className="ksk-chara-badge">
          {lang === 'en' ? '👗 Dress up' : '👗 きがえ'}
        </div>
      </button>

      {/* プリンス（右） */}
      <button
        className="ksk-chara-wrap ksk-chara-wrap--right"
        onClick={(e) => { onOpen('prince'); spawnSparkles(e.clientX, e.clientY); }}
        aria-label="プリンスを着せ替え"
      >
        <div className="ksk-chara-inner">
          <PrinceSVG state={kisekaeState.prince}/>
          {prPet?.emoji && <div className="ksk-pet ksk-pet--right">{prPet.emoji}</div>}
        </div>
        <div className="ksk-chara-badge">
          {lang === 'en' ? '👗 Dress up' : '👗 きがえ'}
        </div>
      </button>
    </>
  );
}

/* ════════════════════════════════════════════════════
   着せ替えパネル（スライドアップモーダル）
════════════════════════════════════════════════════ */
export function KisekaePanel({ isOpen, initialChara, onClose, kisekaeState, onStateChange, lang }) {
  const [activeChara, setActiveChara] = useState(initialChara || 'princess');
  const [activeCat,   setActiveCat]   = useState('crown');

  useEffect(() => {
    if (isOpen) {
      setActiveChara(initialChara || 'princess');
      setActiveCat('crown');
    }
  }, [isOpen, initialChara]);

  if (!isOpen) return null;

  const baseItems  = KISEKAE_ITEMS[activeChara][activeCat] || [];
  const shopExtras = getShopExtras(activeChara, activeCat);
  const items      = [...baseItems, ...shopExtras];
  const currentVal = kisekaeState[activeChara][activeCat] || '';

  function handleSelect(item, e) {
    const next = {
      ...kisekaeState,
      [activeChara]: { ...kisekaeState[activeChara], [activeCat]: item.id },
    };
    onStateChange(next);
    spawnSparkles(e.clientX, e.clientY);
  }

  return (
    <div
      className="ksk-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchEnd={(e)  => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ksk-panel">

        {/* ヘッダー */}
        <div className="ksk-panel-hd">
          <span className="ksk-panel-title">✨ きがえしよう！</span>
          <button className="ksk-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* キャラタブ */}
        <div className="ksk-chara-tabs">
          {['princess', 'prince'].map(chara => (
            <button
              key={chara}
              className={`ksk-chara-tab${activeChara === chara ? ' active' : ''}`}
              onClick={() => { setActiveChara(chara); setActiveCat('crown'); }}
            >
              <span className="ksk-tab-icon">{chara === 'princess' ? '👸' : '🤴'}</span>
              {lang === 'en'
                ? (chara === 'princess' ? 'Princess' : 'Prince')
                : (chara === 'princess' ? 'プリンセス' : 'プリンス')}
            </button>
          ))}
        </div>

        {/* カテゴリ */}
        <div className="ksk-cat-row">
          {CATS.map(cat => (
            <button
              key={cat.id}
              className={`ksk-cat-btn${activeCat === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* アイテムグリッド */}
        <div className="ksk-items-grid">
          {items.map(item => (
            <button
              key={item.id}
              className={`ksk-item-btn${currentVal === item.id ? ' active' : ''}`}
              onClick={(e) => handleSelect(item, e)}
            >
              <span className="ksk-ib-emoji">{item.emoji || '✖️'}</span>
              <span className="ksk-ib-name">{item.name}</span>
              {currentVal === item.id && <span className="ksk-ib-check">✓</span>}
            </button>
          ))}
        </div>

        {/* ミニプレビュー */}
        <div className="ksk-mini-preview">
          <div className="ksk-mini-chara">
            <PrincessSVG state={kisekaeState.princess}/>
            <span>👸</span>
          </div>
          <div className="ksk-mini-chara">
            <PrinceSVG state={kisekaeState.prince}/>
            <span>🤴</span>
          </div>
        </div>

      </div>
    </div>
  );
}
