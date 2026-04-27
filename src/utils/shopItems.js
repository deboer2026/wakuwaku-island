// Shop item catalogue.
// Each entry maps a purchasable shop listing to a kisekae item injected into the panel.
// `chara` / `cat` match the keys in KISEKAE_ITEMS.
// `itemData` is merged into that category's item list when the item is unlocked.

export const SHOP_ITEMS = [
  // ── Princess ─────────────────────────────────────────────────────────────
  {
    id: 'ps_dress_rainbow',
    chara: 'princess', cat: 'dress',
    shopEmoji: '🌈', shopName: 'レインボードレス', price: 30,
    itemData: { id: 'shop_ps_d_rainbow', emoji: '🌈', name: 'レインボー',
      c1: '#ff9eb5', c2: '#c084fc', hair: '#F9A825' },
  },
  {
    id: 'ps_pet_unicorn',
    chara: 'princess', cat: 'pet',
    shopEmoji: '🦄', shopName: 'ユニコーンペット', price: 40,
    itemData: { id: 'shop_ps_p_unicorn', emoji: '🦄', name: 'ユニコーン' },
  },
  {
    id: 'ps_item_wand_star',
    chara: 'princess', cat: 'item',
    shopEmoji: '✨', shopName: 'まほうのステッキ', price: 25,
    itemData: { id: 'shop_ps_i_wand', emoji: '✨', name: 'まほうステッキ' },
  },
  {
    id: 'ps_pet_dragon',
    chara: 'princess', cat: 'pet',
    shopEmoji: '🐲', shopName: 'ドラゴンペット', price: 50,
    itemData: { id: 'shop_ps_p_dragon', emoji: '🐲', name: 'ドラゴン' },
  },
  {
    id: 'ps_crown_jewel',
    chara: 'princess', cat: 'crown',
    shopEmoji: '💎', shopName: 'ほうせきかんむり', price: 35,
    itemData: { id: 'shop_ps_c_jewel', emoji: '💎', name: 'ほうせき' },
  },
  {
    id: 'ps_acc_fairy',
    chara: 'princess', cat: 'accessory',
    shopEmoji: '🧚', shopName: 'ようせいのつばさ', price: 45,
    itemData: { id: 'shop_ps_a_fairy', emoji: '🧚', name: 'つばさ' },
  },
  {
    id: 'ps_dress_gold',
    chara: 'princess', cat: 'dress',
    shopEmoji: '👑', shopName: 'おうごんのドレス', price: 55,
    itemData: { id: 'shop_ps_d_gold', emoji: '👑', name: 'おうごん',
      c1: '#FFD700', c2: '#FFA000', hair: '#F9A825' },
  },
  {
    id: 'ps_item_mirror',
    chara: 'princess', cat: 'item',
    shopEmoji: '🪞', shopName: 'まほうのかがみ', price: 30,
    itemData: { id: 'shop_ps_i_mirror', emoji: '🪞', name: 'かがみ' },
  },
  {
    id: 'ps_crown_star',
    chara: 'princess', cat: 'crown',
    shopEmoji: '🌟', shopName: 'スターかんむり', price: 28,
    itemData: { id: 'shop_ps_c_star', emoji: '🌟', name: 'スター' },
  },
  {
    id: 'ps_acc_angel',
    chara: 'princess', cat: 'accessory',
    shopEmoji: '😇', shopName: 'てんしのわ', price: 38,
    itemData: { id: 'shop_ps_a_angel', emoji: '😇', name: 'てんしのわ' },
  },

  // ── Prince ───────────────────────────────────────────────────────────────
  {
    id: 'pr_dress_dragon',
    chara: 'prince', cat: 'dress',
    shopEmoji: '🐉', shopName: 'ドラゴンよろい', price: 40,
    itemData: { id: 'shop_pr_d_dragon', emoji: '🐉', name: 'ドラゴン',
      c1: '#388E3C', c2: '#1B5E20', hair: '#5D4037' },
  },
  {
    id: 'pr_pet_phoenix',
    chara: 'prince', cat: 'pet',
    shopEmoji: '🦅', shopName: 'フェニックスペット', price: 50,
    itemData: { id: 'shop_pr_p_phoenix', emoji: '🦅', name: 'フェニックス' },
  },
  {
    id: 'pr_item_gold_sword',
    chara: 'prince', cat: 'item',
    shopEmoji: '⚔️', shopName: 'おうごんのけん', price: 35,
    itemData: { id: 'shop_pr_i_gold', emoji: '⚔️', name: 'おうごんのけん' },
  },
  {
    id: 'pr_pet_lion',
    chara: 'prince', cat: 'pet',
    shopEmoji: '🦁', shopName: 'ライオンペット', price: 30,
    itemData: { id: 'shop_pr_p_lion', emoji: '🦁', name: 'ライオン' },
  },
  {
    id: 'pr_acc_shield',
    chara: 'prince', cat: 'accessory',
    shopEmoji: '🛡️', shopName: 'まほうのたて', price: 25,
    itemData: { id: 'shop_pr_a_shield', emoji: '🛡️', name: 'まほうのたて' },
  },
  {
    id: 'pr_item_star_mantle',
    chara: 'prince', cat: 'item',
    shopEmoji: '🌟', shopName: 'ほしのマント', price: 45,
    itemData: { id: 'shop_pr_i_star', emoji: '🌟', name: 'ほしのマント' },
  },
  {
    id: 'pr_dress_gold',
    chara: 'prince', cat: 'dress',
    shopEmoji: '🪙', shopName: 'おうごんのよろい', price: 55,
    itemData: { id: 'shop_pr_d_gold', emoji: '🪙', name: 'おうごん',
      c1: '#FFB300', c2: '#E65100', hair: '#5D4037' },
  },
  {
    id: 'pr_crown_dragon',
    chara: 'prince', cat: 'crown',
    shopEmoji: '🐲', shopName: 'ドラゴンかぶと', price: 42,
    itemData: { id: 'shop_pr_c_dragon', emoji: '🐲', name: 'ドラゴン' },
  },
  {
    id: 'pr_pet_wolf',
    chara: 'prince', cat: 'pet',
    shopEmoji: '🐺', shopName: 'オオカミペット', price: 35,
    itemData: { id: 'shop_pr_p_wolf', emoji: '🐺', name: 'オオカミ' },
  },
  {
    id: 'pr_item_trumpet',
    chara: 'prince', cat: 'item',
    shopEmoji: '🎺', shopName: 'ぎんのらっぱ', price: 28,
    itemData: { id: 'shop_pr_i_trumpet', emoji: '🎺', name: 'らっぱ' },
  },
];
