/* ════════════════════════════════════════════════════
   きせかえ v2 Phase2 — データ定義
   既存アイテムIDはすべて維持し、絵文字の代わりに
   ベクターパーツの種類(kind)を対応させる。
════════════════════════════════════════════════════ */
import { getUnlockedItems } from '../../utils/coins';
import { SHOP_ITEMS } from '../../utils/shopItems';

export function getShopExtras(chara, cat) {
  const unlocked = getUnlockedItems();
  return SHOP_ITEMS
    .filter(s => s.chara === chara && s.cat === cat && unlocked.includes(s.id))
    .map(s => s.itemData);
}

export const CATS = [
  { id: 'crown',   label: '👑 かんむり' },
  { id: 'hair',    label: '💇 かみがた' },
  { id: 'outfit',  label: '👗 ふく'     },
  { id: 'dress',   label: '🎨 いろ'     },
  { id: 'item',    label: '🪄 こもの'   },
  { id: 'pet',     label: '🐾 ペット'   },
];

/* crown/hair/item/petは kind が共通レンダラーへの指示子。
   emojiフィールドはDOM UI(タブ等)向けに残すのみで、
   キャラクター本体の描画には一切使用しない。 */
export const KISEKAE_ITEMS = {
  princess: {
    crown: [
      { id:'c0', kind:'crown',    emoji:'👑', name:'おうかん' },
      { id:'c1', kind:'flower',   emoji:'🌸', name:'はな'     },
      { id:'c2', kind:'star',     emoji:'⭐', name:'スター'   },
      { id:'c3', kind:'rainbow',  emoji:'🌈', name:'にじ'     },
      { id:'c4', kind:'ribbon',   emoji:'🎀', name:'リボン'   },
      { id:'c5', kind:'butterfly',emoji:'🦋', name:'ちょうちょ' },
      { id:'c6', kind:'gem',      emoji:'💎', name:'ダイヤ'   },
      { id:'c7', kind:'none',     emoji:'',   name:'なし'     },
    ],
    hair: [
      { id:'h0', kind:'long',  name:'ロング'   },
      { id:'h1', kind:'wave',  name:'ウェーブ' },
      { id:'h2', kind:'twin',  name:'ツイン'   },
      { id:'h3', kind:'short', name:'ショート' },
      { id:'h4', kind:'pony',  name:'ポニー'   },
      { id:'h5', kind:'bun',   name:'おだんご' },
    ],
    outfit: [
      { id:'o0', kind:'ballgown', name:'ボールガウン'   },
      { id:'o1', kind:'fairy',    name:'フェアリー'     },
      { id:'o2', kind:'tutu',     name:'チュチュ'       },
      { id:'o3', kind:'robe',     name:'ロイヤルローブ' },
      { id:'o4', kind:'cape',     name:'ケープドレス'   },
    ],
    dress: [
      { id:'d0', name:'ピンク',   c1:'#ff80ab', c2:'#f06292', hair:'#F9A825' },
      { id:'d1', name:'むらさき', c1:'#ce93d8', c2:'#ab47bc', hair:'#F9A825' },
      { id:'d2', name:'あお',     c1:'#90caf9', c2:'#42a5f5', hair:'#FBC02D' },
      { id:'d3', name:'みどり',   c1:'#a5d6a7', c2:'#66bb6a', hair:'#8D6E63' },
      { id:'d4', name:'しろ',     c1:'#f8f8ff', c2:'#e0e0e0', hair:'#BDBDBD' },
      { id:'d5', name:'オレンジ', c1:'#ffb74d', c2:'#ff9800', hair:'#F9A825' },
      { id:'d6', name:'あか',     c1:'#ef9a9a', c2:'#e53935', hair:'#5D4037' },
      { id:'d7', name:'くろ',     c1:'#757575', c2:'#212121', hair:'#212121' },
    ],
    accessory: [
      { id:'a0', kind:'necklace', emoji:'📿', name:'ネックレス' },
      { id:'a1', kind:'gem',      emoji:'💍', name:'ゆびわ'     },
      { id:'a2', kind:'gem',      emoji:'💎', name:'ダイヤ'     },
      { id:'a3', kind:'heart',    emoji:'❤️', name:'ハート'     },
      { id:'a4', kind:'star',     emoji:'⭐', name:'スター'     },
      { id:'a5', kind:'flower',   emoji:'🌸', name:'はな'       },
      { id:'a6', kind:'sparkle',  emoji:'🌟', name:'キラキラ'   },
      { id:'a7', kind:'none',     emoji:'',   name:'なし'       },
    ],
    item: [
      { id:'i0', kind:'wand',      emoji:'🪄', name:'ステッキ'   },
      { id:'i1', kind:'bag',       emoji:'👜', name:'バッグ'     },
      { id:'i2', kind:'bouquet',   emoji:'🌹', name:'バラ'       },
      { id:'i3', kind:'parasol',   emoji:'🌂', name:'パラソル'   },
      { id:'i4', kind:'plush',     emoji:'🧸', name:'ぬいぐるみ' },
      { id:'i5', kind:'bouquet',   emoji:'💐', name:'はなたば'   },
      { id:'i6', kind:'rainbow',   emoji:'🌈', name:'にじ'       },
      { id:'i7', kind:'none',      emoji:'',   name:'なし'       },
    ],
    pet: [
      { id:'p0', kind:'cat',      emoji:'🐱', name:'ねこ'     },
      { id:'p1', kind:'dog',      emoji:'🐶', name:'いぬ'     },
      { id:'p2', kind:'rabbit',   emoji:'🐰', name:'うさぎ'   },
      { id:'p3', kind:'fox',      emoji:'🦊', name:'きつね'   },
      { id:'p4', kind:'frog',     emoji:'🐸', name:'かえる'   },
      { id:'p5', kind:'butterfly',emoji:'🦋', name:'ちょうちょ' },
      { id:'p6', kind:'panda',    emoji:'🐼', name:'パンダ'   },
      { id:'p8', kind:'unicorn',  emoji:'🦄', name:'ユニコーン' },
      { id:'p7', kind:'none',     emoji:'',   name:'なし'     },
    ],
  },
  prince: {
    crown: [
      { id:'c0', kind:'crown',  emoji:'👑', name:'おうかん'   },
      { id:'c1', kind:'star',   emoji:'⭐', name:'スター'     },
      { id:'c2', kind:'gem',    emoji:'🌟', name:'キラキラ'   },
      { id:'c3', kind:'gem',    emoji:'💎', name:'ダイヤ'     },
      { id:'c4', kind:'cap',    emoji:'🎩', name:'ぼうし'     },
      { id:'c5', kind:'helmet', emoji:'🪖', name:'ヘルメット' },
      { id:'c6', kind:'rainbow',emoji:'🌈', name:'にじ'       },
      { id:'c7', kind:'none',   emoji:'',   name:'なし'       },
    ],
    hair: [
      { id:'h0', kind:'natural',    name:'ナチュラル' },
      { id:'h1', kind:'side',       name:'サイド'     },
      { id:'h2', kind:'short',      name:'ショート'   },
      { id:'h3', kind:'wave',       name:'ウェーブ'   },
      { id:'h4', kind:'princelong', name:'王子ロング' },
      { id:'h5', kind:'adventure',  name:'アドベンチャー' },
    ],
    outfit: [
      { id:'o0', kind:'jacket',  name:'ロイヤルジャケット'     },
      { id:'o1', kind:'tunic',   name:'アドベンチャーチュニック' },
      { id:'o2', kind:'formal',  name:'セレモニースーツ'       },
      { id:'o3', kind:'robe',    name:'ローブ'                 },
      { id:'o4', kind:'cape',    name:'ケープスタイル'         },
    ],
    dress: [
      { id:'d0', name:'あお',     c1:'#1976D2', c2:'#1565C0', hair:'#5D4037' },
      { id:'d1', name:'むらさき', c1:'#7B1FA2', c2:'#4A148C', hair:'#5D4037' },
      { id:'d2', name:'あか',     c1:'#C62828', c2:'#B71C1C', hair:'#3E2723' },
      { id:'d3', name:'みどり',   c1:'#2E7D32', c2:'#1B5E20', hair:'#5D4037' },
      { id:'d4', name:'くろ',     c1:'#424242', c2:'#212121', hair:'#212121' },
      { id:'d5', name:'しろ',     c1:'#ECEFF1', c2:'#B0BEC5', hair:'#FBC02D' },
      { id:'d6', name:'オレンジ', c1:'#E65100', c2:'#BF360C', hair:'#5D4037' },
      { id:'d7', name:'きいろ',   c1:'#F9A825', c2:'#F57F17', hair:'#5D4037' },
    ],
    accessory: [
      { id:'a0', kind:'sword',    emoji:'⚔️',  name:'つるぎ'   },
      { id:'a1', kind:'shield',   emoji:'🛡️', name:'たて'      },
      { id:'a2', kind:'gem',      emoji:'💎',  name:'ダイヤ'   },
      { id:'a3', kind:'star',     emoji:'⭐',  name:'スター'   },
      { id:'a4', kind:'trophy',   emoji:'🏆',  name:'トロフィー' },
      { id:'a5', kind:'medal',    emoji:'🎖️', name:'メダル'   },
      { id:'a6', kind:'gem',      emoji:'💍',  name:'ゆびわ'   },
      { id:'a7', kind:'none',     emoji:'',    name:'なし'     },
    ],
    item: [
      { id:'i0', kind:'sword',      emoji:'⚔️', name:'けん'     },
      { id:'i1', kind:'wand',       emoji:'🪄',  name:'ステッキ' },
      { id:'i2', kind:'bouquet',    emoji:'🌹',  name:'バラ'     },
      { id:'i3', kind:'horn',       emoji:'🎺',  name:'らっぱ'   },
      { id:'i4', kind:'map',        emoji:'🗺️', name:'ちず'     },
      { id:'i5', kind:'rainbow',    emoji:'🌈',  name:'にじ'     },
      { id:'i6', kind:'horse',      emoji:'🏇',  name:'うま'     },
      { id:'i7', kind:'none',       emoji:'',    name:'なし'     },
    ],
    pet: [
      { id:'p0', kind:'bear',   emoji:'🐻', name:'くま'     },
      { id:'p1', kind:'lion',   emoji:'🦁', name:'らいおん' },
      { id:'p2', kind:'tiger',  emoji:'🐯', name:'とら'     },
      { id:'p3', kind:'wolf',   emoji:'🐺', name:'おおかみ' },
      { id:'p4', kind:'dragon', emoji:'🐲', name:'ドラゴン' },
      { id:'p5', kind:'eagle',  emoji:'🦅', name:'わし'     },
      { id:'p6', kind:'horse',  emoji:'🐴', name:'うま'     },
      { id:'p7', kind:'none',   emoji:'',   name:'なし'     },
    ],
  },
};

export const DEFAULT_KISEKAE = {
  princess: { crown: 'c0', hair: 'h0', outfit: 'o0', dress: 'd0', accessory: '', item: '', pet: '' },
  prince:   { crown: 'c0', hair: 'h0', outfit: 'o0', dress: 'd0', accessory: '', item: '', pet: '' },
};

/* 旧stateにhair/outfitが無い場合はdefaultを補い、値の型も検証する。
   crown/dress/accessory/item/petなど既存フィールドは壊さずそのまま通す。 */
export function normalizeKisekaeState(raw) {
  const base = { princess: { ...DEFAULT_KISEKAE.princess }, prince: { ...DEFAULT_KISEKAE.prince } };
  if (!raw || typeof raw !== 'object') return base;
  for (const chara of ['princess', 'prince']) {
    const src = raw[chara];
    if (!src || typeof src !== 'object') continue;
    const out = base[chara];
    for (const key of ['crown', 'hair', 'outfit', 'dress', 'accessory', 'item', 'pet']) {
      if (typeof src[key] === 'string') out[key] = src[key];
    }
  }
  return base;
}

export function findKisekaeItem(chara, cat, id) {
  const list = KISEKAE_ITEMS[chara][cat];
  if (!list) return null;
  const base = list.find(i => i.id === id);
  if (base) return base;
  return getShopExtras(chara, cat).find(i => i.id === id) || null;
}
