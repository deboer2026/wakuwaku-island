import { useState, useEffect, useId } from 'react';
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
      { id:'p8', emoji:'🦄', name:'ユニコーン' },
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
function findKisekaeItem(chara, cat, id) {
  const base = KISEKAE_ITEMS[chara][cat].find(i => i.id === id);
  if (base) return base;
  return getShopExtras(chara, cat).find(i => i.id === id);
}

export function PrincessSVG({ state }) {
  const uid = useId();
  const dress = findKisekaeItem('princess','dress',state.dress) ?? KISEKAE_ITEMS.princess.dress[0];
  const crown = findKisekaeItem('princess','crown',state.crown);
  const acc   = findKisekaeItem('princess','accessory',state.accessory);
  const item  = findKisekaeItem('princess','item',state.item);
  const gSkirt = `${uid}-psSkirt`, gDrape = `${uid}-psDrape`, gHair = `${uid}-psHair`, gGold = `${uid}-psGold`, gIris = `${uid}-psIris`;

  return (
    <svg className="ksk-svg" viewBox="0 0 72 114" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gSkirt} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.c2}/>
          <stop offset="55%" stopColor={dress.c1}/>
          <stop offset="100%" stopColor={dress.c1}/>
        </linearGradient>
        <linearGradient id={gDrape} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05"/>
        </linearGradient>
        <linearGradient id={gHair} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.hair}/>
          <stop offset="100%" stopColor={dress.hair} stopOpacity="0.82"/>
        </linearGradient>
        <linearGradient id={gGold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE58A"/>
          <stop offset="100%" stopColor="#E6A700"/>
        </linearGradient>
        <radialGradient id={gIris} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#7A5238"/>
          <stop offset="100%" stopColor="#3B2416"/>
        </radialGradient>
      </defs>

      {/* ── ボールガウン(釣鐘型スカート) ── */}
      <path d="M36,58 C25,64 13,79 11,102 Q13,106 18,105 Q22,108 28,106 Q32,109 36,107 Q40,109 44,106 Q50,108 54,105 Q59,106 61,102 C59,79 47,64 36,58 Z" fill={`url(#${gSkirt})`}/>
      {/* オーバースカートのドレープ */}
      <path d="M36,60 C29,66 21,78 19,99 Q30,88 36,86 Q42,88 53,99 C51,78 43,66 36,60 Z" fill={`url(#${gDrape})`}/>
      {/* 裾レース(スカラップ) */}
      <path d="M12,101 Q15,97 18,101 Q21,97 25,101 Q28,97 32,101 Q35,97 39,101 Q43,97 46,101 Q50,97 53,101 Q56,97 60,101 L61,104 Q48,108 36,108 Q24,108 11,104 Z" fill="#fff" opacity="0.85"/>
      {/* スカートのきらめき */}
      <circle cx="25" cy="84" r="1.1" fill="#fff" opacity="0.8"/>
      <circle cx="45" cy="90" r="1.3" fill="#fff" opacity="0.7"/>
      <circle cx="33" cy="96" r="1"   fill="#fff" opacity="0.75"/>
      <circle cx="51" cy="78" r="0.9" fill="#fff" opacity="0.65"/>

      {/* ── ウエストとサッシュリボン ── */}
      <path d="M28,58 Q36,62 44,58 L44,62 Q36,66 28,62 Z" fill={`url(#${gGold})`}/>
      <path d="M33,61 Q30,55 26,58 Q29,63 33,63 Z" fill={dress.c2}/>
      <path d="M39,61 Q42,55 46,58 Q43,63 39,63 Z" fill={dress.c2}/>
      <circle cx="36" cy="61" r="2.4" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>

      {/* ── ボディス(上身頃) ── */}
      <path d="M28,50 Q36,47 44,50 L44,59 Q36,63 28,59 Z" fill={dress.c1}/>
      <path d="M29,50 L36,58 L43,50" stroke="rgba(255,255,255,0.45)" strokeWidth="1" fill="none"/>
      {/* パフスリーブ+腕(グローブ) */}
      <ellipse cx="25" cy="53" rx="4.5" ry="5" fill={dress.c2}/>
      <ellipse cx="47" cy="53" rx="4.5" ry="5" fill={dress.c2}/>
      <path d="M23,57 Q19,64 21,71" stroke="#fff" strokeWidth="4.2" fill="none" strokeLinecap="round"/>
      <path d="M49,57 Q53,64 51,71" stroke="#fff" strokeWidth="4.2" fill="none" strokeLinecap="round"/>

      {/* ── 首・ネックレス ── */}
      <rect x="33" y="46" width="6" height="8" rx="3" fill="#FFCCBC"/>
      <path d="M31,51 Q36,55 41,51" stroke={`url(#${gGold})`} strokeWidth="1.2" fill="none"/>
      <circle cx="36" cy="54.5" r="1.6" fill="#FF6FA5" stroke="#C98F00" strokeWidth="0.5"/>

      {/* ── 顔 ── */}
      <circle cx="36" cy="37" r="17" fill="#FFE0B2"/>
      {/* 髪(後ろ+サイドの巻き髪) */}
      <ellipse cx="36" cy="27" rx="18" ry="14" fill={`url(#${gHair})`}/>
      <path d="M18,32 C14,42 17,50 21,53 C24,49 24,40 23,34 Z" fill={`url(#${gHair})`}/>
      <path d="M54,32 C58,42 55,50 51,53 C48,49 48,40 49,34 Z" fill={`url(#${gHair})`}/>
      <circle cx="21.5" cy="50" r="3.4" fill={`url(#${gHair})`}/>
      <circle cx="50.5" cy="50" r="3.4" fill={`url(#${gHair})`}/>
      {/* 前髪ハイライト */}
      <path d="M25,22 Q30,17 36,17" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>

      {/* ── ティアラ(デフォルト'おうかん'もベクターで統一) ── */}
      {crown?.emoji && state.crown !== 'c0'
        ? <text x="36" y="20" fontSize="15" textAnchor="middle" dominantBaseline="middle">{crown.emoji}</text>
        : crown?.id !== 'c7' && (
        <>
            <path d="M24,22 Q36,17 48,22 L47,25 Q36,21 25,25 Z" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.6"/>
            <path d="M30,21 L31.5,15 L34,20 Z" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
            <path d="M34.5,19.5 L36,12 L37.5,19.5 Z" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
            <path d="M38,20 L40.5,15 L42,21 Z" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
            <circle cx="36" cy="13.5" r="2.2" fill="#FF4E8B"/>
            <circle cx="35.4" cy="12.9" r="0.7" fill="#fff" opacity="0.9"/>
            <circle cx="31.5" cy="16.5" r="1.2" fill="#69D2FF"/>
            <circle cx="40.5" cy="16.5" r="1.2" fill="#69D2FF"/>
            <circle cx="27" cy="22.5" r="0.9" fill="#fff"/>
            <circle cx="45" cy="22.5" r="0.9" fill="#fff"/>
          </>
      )}

      {/* ── 目(グラデ虹彩+二重ハイライト) ── */}
      <ellipse cx="29.5" cy="36" rx="4.2" ry="4.6" fill={`url(#${gIris})`}/>
      <ellipse cx="42.5" cy="36" rx="4.2" ry="4.6" fill={`url(#${gIris})`}/>
      <circle cx="31"   cy="34.2" r="1.7" fill="#fff"/>
      <circle cx="44"   cy="34.2" r="1.7" fill="#fff"/>
      <circle cx="28.3" cy="37.5" r="0.8" fill="#fff" opacity="0.8"/>
      <circle cx="41.3" cy="37.5" r="0.8" fill="#fff" opacity="0.8"/>
      {/* まつ毛(長め) */}
      <path d="M25.8,32.5 L23.8,30.2" stroke="#4A2E20" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M28.2,31.2 L27,28.8"   stroke="#4A2E20" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M31.2,30.8 L30.8,28.4" stroke="#4A2E20" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M40.8,30.8 L41.2,28.4" stroke="#4A2E20" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M43.8,31.2 L45,28.8"   stroke="#4A2E20" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M46.2,32.5 L48.2,30.2" stroke="#4A2E20" strokeWidth="1.2" strokeLinecap="round"/>
      {/* 口 */}
      <path d="M31.5,44 Q36,48.8 40.5,44" stroke="#E91E63" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 頬 */}
      <ellipse cx="22.5" cy="41" rx="5" ry="3.2" fill="#FFB3C1" opacity="0.6"/>
      <ellipse cx="49.5" cy="41" rx="5" ry="3.2" fill="#FFB3C1" opacity="0.6"/>
      {/* イヤリング */}
      <circle cx="19.5" cy="42.5" r="1.4" fill={`url(#${gGold})`}/>
      <circle cx="52.5" cy="42.5" r="1.4" fill={`url(#${gGold})`}/>

      {/* アクセサリ */}
      {acc?.emoji && <text x="36" y="52" fontSize="9" textAnchor="middle" dominantBaseline="middle">{acc.emoji}</text>}
      {/* こもの */}
      {item?.emoji && <text x="63" y="71" fontSize="12" textAnchor="middle" dominantBaseline="middle">{item.emoji}</text>}

      {/* きらめき */}
      <path d="M12,60 l1.2,2.6 2.6,1.2 -2.6,1.2 -1.2,2.6 -1.2,-2.6 -2.6,-1.2 2.6,-1.2 Z" fill="#fff" opacity="0.85"/>
      <path d="M60,66 l0.9,2 2,0.9 -2,0.9 -0.9,2 -0.9,-2 -2,-0.9 2,-0.9 Z" fill="#FFE58A" opacity="0.9"/>
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   SVG: プリンス
════════════════════════════════════════════════════ */
export function PrinceSVG({ state }) {
  const uid = useId();
  const dress = findKisekaeItem('prince','dress',state.dress) ?? KISEKAE_ITEMS.prince.dress[0];
  const crown = findKisekaeItem('prince','crown',state.crown);
  const acc   = findKisekaeItem('prince','accessory',state.accessory);
  const item  = findKisekaeItem('prince','item',state.item);
  const eyebrowColor = dress.hair === '#212121' ? '#555' : dress.hair;
  const gCape = `${uid}-prCape`, gCoat = `${uid}-prCoat`, gHair = `${uid}-prHair`, gGold = `${uid}-prGold`, gIris = `${uid}-prIris`;

  return (
    <svg className="ksk-svg" viewBox="0 0 72 114" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gCape} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.c2}/>
          <stop offset="100%" stopColor={dress.c2} stopOpacity="0.78"/>
        </linearGradient>
        <linearGradient id={gCoat} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.c1}/>
          <stop offset="100%" stopColor={dress.c1} stopOpacity="0.85"/>
        </linearGradient>
        <linearGradient id={gHair} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.hair}/>
          <stop offset="100%" stopColor={dress.hair} stopOpacity="0.85"/>
        </linearGradient>
        <linearGradient id={gGold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE58A"/>
          <stop offset="100%" stopColor="#E6A700"/>
        </linearGradient>
        <radialGradient id={gIris} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#553B22"/>
          <stop offset="100%" stopColor="#241708"/>
        </radialGradient>
      </defs>

      {/* ── マント(流れる形+金縁) ── */}
      <path d="M20,52 C10,64 6,84 9,100 Q17,104 24,100 L24,74 Q21,62 24,54 Z" fill={`url(#${gCape})`}/>
      <path d="M52,52 C62,64 66,84 63,100 Q55,104 48,100 L48,74 Q51,62 48,54 Z" fill={`url(#${gCape})`}/>
      <path d="M9,100 Q17,104 24,100" stroke={`url(#${gGold})`} strokeWidth="1.6" fill="none"/>
      <path d="M63,100 Q55,104 48,100" stroke={`url(#${gGold})`} strokeWidth="1.6" fill="none"/>

      {/* ── ズボン ── */}
      <rect x="23" y="74" width="11" height="28" rx="4" fill={dress.c2}/>
      <rect x="38" y="74" width="11" height="28" rx="4" fill={dress.c2}/>
      <path d="M28.5,76 L28.5,98" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2"/>
      <path d="M43.5,76 L43.5,98" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2"/>

      {/* ── 上着(ロイヤルコート) ── */}
      <path d="M20,54 Q36,49 52,54 L52,76 Q36,80 20,76 Z" fill={`url(#${gCoat})`}/>
      {/* 金トリム縁取り */}
      <path d="M20,54 Q36,49 52,54" stroke={`url(#${gGold})`} strokeWidth="1.4" fill="none"/>
      <path d="M36,52 L36,78" stroke={`url(#${gGold})`} strokeWidth="1.2"/>
      {/* エポーレット(肩章)+フリンジ */}
      <ellipse cx="21" cy="54.5" rx="5" ry="3" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
      <ellipse cx="51" cy="54.5" rx="5" ry="3" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
      <path d="M17,56 L17,60 M19.5,57 L19.5,61 M22.5,57 L22.5,61" stroke="#E6A700" strokeWidth="1" strokeLinecap="round"/>
      <path d="M49.5,57 L49.5,61 M52.5,57 L52.5,61 M55,56 L55,60" stroke="#E6A700" strokeWidth="1" strokeLinecap="round"/>
      {/* サッシュ(斜めたすき)+勲章 */}
      <path d="M23,55 L47,74 L44,77 L20,58 Z" fill="#fff" opacity="0.85"/>
      <path d="M23,55 L47,74" stroke={`url(#${gGold})`} strokeWidth="0.8" opacity="0.7"/>
      <circle cx="42" cy="70" r="2.6" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.6"/>
      <path d="M42,68 l0.6,1.2 1.3,0.2 -0.95,0.9 0.25,1.3 -1.2,-0.6 -1.2,0.6 0.25,-1.3 -0.95,-0.9 1.3,-0.2 Z" fill="#fff" opacity="0.9"/>
      {/* 金ボタン */}
      <circle cx="31" cy="60" r="1.4" fill={`url(#${gGold})`}/>
      <circle cx="31" cy="66" r="1.4" fill={`url(#${gGold})`}/>
      <circle cx="31" cy="72" r="1.4" fill={`url(#${gGold})`}/>
      {/* 立ち襟 */}
      <path d="M28,51 L33,54 L33,49 Z" fill={dress.c2}/>
      <path d="M44,51 L39,54 L39,49 Z" fill={dress.c2}/>

      {/* ── 首 ── */}
      <rect x="33" y="43" width="6" height="10" rx="3" fill="#FFCCBC"/>

      {/* ── 顔 ── */}
      <circle cx="36" cy="33" r="17" fill="#FFE0B2"/>
      {/* 髪 */}
      <ellipse cx="36" cy="23" rx="18" ry="13" fill={`url(#${gHair})`}/>
      <path d="M18,28 C16,36 18,41 21,44 C23,40 23,33 22,29 Z" fill={`url(#${gHair})`}/>
      <path d="M54,28 C56,36 54,41 51,44 C49,40 49,33 50,29 Z" fill={`url(#${gHair})`}/>
      {/* 前髪の流れ */}
      <path d="M26,18 Q31,14 37,15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M40,15 Q45,15 48,18" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

      {/* ── 王冠(デフォルト'おうかん'もベクターで統一) ── */}
      {crown?.emoji && state.crown !== 'c0'
        ? <text x="36" y="16" fontSize="15" textAnchor="middle" dominantBaseline="middle">{crown.emoji}</text>
        : crown?.id !== 'c7' && (
        <>
            <path d="M24,21 L26,11 L31,17 L36,9 L41,17 L46,11 L48,21 Q36,17.5 24,21 Z" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.7"/>
            <path d="M24.5,21 Q36,17.5 47.5,21 L47.5,23.5 Q36,20 24.5,23.5 Z" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
            <circle cx="36" cy="10.5" r="2.4" fill="#2196F3"/>
            <circle cx="35.3" cy="9.8" r="0.8" fill="#fff" opacity="0.9"/>
            <circle cx="26.5" cy="12.5" r="1.2" fill="#FF4E8B"/>
            <circle cx="45.5" cy="12.5" r="1.2" fill="#FF4E8B"/>
            <circle cx="30" cy="21" r="0.9" fill="#fff"/>
            <circle cx="42" cy="21" r="0.9" fill="#fff"/>
          </>
      )}

      {/* ── 目 ── */}
      <ellipse cx="29.5" cy="32" rx="4" ry="4.4" fill={`url(#${gIris})`}/>
      <ellipse cx="42.5" cy="32" rx="4" ry="4.4" fill={`url(#${gIris})`}/>
      <circle cx="31"   cy="30.3" r="1.6" fill="#fff"/>
      <circle cx="44"   cy="30.3" r="1.6" fill="#fff"/>
      <circle cx="28.4" cy="33.4" r="0.7" fill="#fff" opacity="0.8"/>
      <circle cx="41.4" cy="33.4" r="0.7" fill="#fff" opacity="0.8"/>
      {/* 眉(凛々しく) */}
      <path d="M25.5,27 Q29.5,24.8 33.5,26.8" stroke={eyebrowColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M38.5,26.8 Q42.5,24.8 46.5,27" stroke={eyebrowColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 口(にこやか) */}
      <path d="M31,40 Q36,44.5 41,40" stroke="#BF8A7A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 頬 */}
      <ellipse cx="22.5" cy="36" rx="4.6" ry="3" fill="#FFB3C1" opacity="0.35"/>
      <ellipse cx="49.5" cy="36" rx="4.6" ry="3" fill="#FFB3C1" opacity="0.35"/>

      {/* アクセサリ */}
      {acc?.emoji && <text x="36" y="47" fontSize="9" textAnchor="middle" dominantBaseline="middle">{acc.emoji}</text>}
      {/* こもの */}
      {item?.emoji && <text x="9" y="67" fontSize="12" textAnchor="middle" dominantBaseline="middle">{item.emoji}</text>}

      {/* ── ブーツ(金カフ付き) ── */}
      <rect x="20" y="100" width="14" height="8" rx="3.5" fill={dress.c2}/>
      <rect x="38" y="100" width="14" height="8" rx="3.5" fill={dress.c2}/>
      <rect x="20" y="100" width="14" height="2.4" rx="1.2" fill={`url(#${gGold})`}/>
      <rect x="38" y="100" width="14" height="2.4" rx="1.2" fill={`url(#${gGold})`}/>

      {/* きらめき */}
      <path d="M60,56 l1,2.2 2.2,1 -2.2,1 -1,2.2 -1,-2.2 -2.2,-1 2.2,-1 Z" fill="#FFE58A" opacity="0.9"/>
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   キャラクターウィジェット（タイトル左右に常駐）
════════════════════════════════════════════════════ */
export function KisekaeCharacters({ kisekaeState, onOpen, lang }) {
  const psPet = findKisekaeItem('princess', 'pet', kisekaeState.princess.pet);
  const prPet = findKisekaeItem('prince',   'pet', kisekaeState.prince.pet);

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
