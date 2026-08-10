// src/utils/recommend.js — 「つぎはこれであそぼう！」おすすめゲームロジック

export const ALL_GAMES = [
  { route:'/shabondama',      icon:'🫧', ja:'シャボンだまポン',       en:'Bubble Pop',          category:'アクション' },
  { route:'/kudamono-catch',  icon:'🍎', ja:'くだものキャッチ',       en:'Fruit Catch',          category:'アクション' },
  { route:'/doubutsu-puzzle', icon:'🧩', ja:'どうぶつパズル',         en:'Animal Puzzle',        category:'パズル'     },
  { route:'/kazu-asobi',      icon:'🔢', ja:'かずあそび',             en:'Number Fun',           category:'かずあそび' },
  { route:'/animal-soccer',   icon:'⚽', ja:'どうぶつサッカー',       en:'Animal Soccer',        category:'アクション' },
  { route:'/jewelry-master',  icon:'💍', ja:'ジュエリーマスター',     en:'Jewelry Master',       category:'そうぞう'   },
  { route:'/sushi',           icon:'🍣', ja:'さーもん',               en:'Catch Salmon',         category:'アクション' },
  { route:'/ichigo',          icon:'🍓', ja:'いちご',                 en:'Strawberry Time',      category:'アクション' },
  { route:'/kakurenbo',       icon:'🔍', ja:'どうぶつかくれんぼ',     en:'Animal Hide & Seek',   category:'パズル'     },
  { route:'/moji',            icon:'🔤', ja:'もじあそび',             en:'Letter Fun',           category:'もじあそび' },
  { route:'/tashizan',        icon:'➕', ja:'たしざんゲーム',         en:'Math Quiz',            category:'かずあそび' },
  { route:'/iro',             icon:'🎨', ja:'いろあわせ',             en:'Color Match',          category:'パズル'     },
  { route:'/machi',           icon:'🏙️', ja:'わくわくまちづくり',     en:'City Builder',         category:'そうぞう'   },
  { route:'/kokki',           icon:'🌍', ja:'こっきクイズ',           en:'Flag Quiz',            category:'クイズ'     },
  { route:'/animal-block',    icon:'🧱', ja:'どうぶつブロック',       en:'Animal Blocks',        category:'パズル'     },
  { route:'/runner',          icon:'🏃', ja:'どうぶつランナー',       en:'Animal Runner',        category:'レース'     },
  { route:'/shooting',        icon:'🚀', ja:'どうぶつシューティング', en:'Animal Shooter',       category:'アクション' },
  { route:'/sniper',          icon:'🎯', ja:'どうぶつターゲット',     en:'Animal Target',        category:'アクション' },
  { route:'/mori',            icon:'🌲', ja:'もりのなかまたち',       en:'Forest Friends',       category:'アクション' },
  { route:'/sora',            icon:'👸', ja:'そらとびプリンセス',     en:'Sky Princess',         category:'アクション' },
  { route:'/bike',            icon:'🏍️', ja:'わくわくバイク',         en:'Wakuwaku Bike',        category:'レース'     },
  { route:'/kart',            icon:'🏎️', ja:'アニマルカートGP',       en:'Animal Kart GP',       category:'レース'     },
];

/**
 * 現在のゲームを除いた推薦ゲームを返す
 * 同カテゴリを優先してランダムに count 本選ぶ
 */
export function getRecommendedGames(currentRoute, count = 3) {
  const current = ALL_GAMES.find(g => g.route === currentRoute);
  const others  = ALL_GAMES.filter(g => g.route !== currentRoute);

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  const sameCategory = current
    ? shuffle(others.filter(g => g.category === current.category))
    : [];
  const different = shuffle(
    others.filter(g => !current || g.category !== current.category)
  );

  return [...sameCategory, ...different].slice(0, count);
}
