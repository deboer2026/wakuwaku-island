// Coin / Login-Bonus / Shop-Unlock system — all localStorage-backed

const KEY_COINS   = 'ww_coins';
const KEY_LOGIN   = 'ww_last_login';
const KEY_STREAK  = 'ww_streak';
const KEY_UNLOCK  = 'ww_shop_unlocked';
const KEY_STAMP   = 'ww_login_stamp_v2';

// ── Coin CRUD ──────────────────────────────────────────
export function getCoins() {
  return parseInt(localStorage.getItem(KEY_COINS) || '0', 10);
}

export function addCoins(amount) {
  const next = getCoins() + amount;
  localStorage.setItem(KEY_COINS, String(next));
  return next;
}

export function spendCoins(amount) {
  const current = getCoins();
  if (current < amount) return false;
  localStorage.setItem(KEY_COINS, String(current - amount));
  return true;
}

// ── Login Bonus V2 ───────────────────────────────────────
// 「連続ログイン」ではなく、受け取るたび1個進む7マススタンプ方式。
// 1日以上空いても進捗は失われない。7個目は大きなプレゼント。
const LOGIN_REWARDS_V2 = [5, 8, 12, 15, 20, 20, 50];

// 今の周回で既に受け取ったスタンプ数(0〜6)を返す。
// ww_login_stamp_v2 が無い既存ユーザーは、旧ww_streakから一度だけ移行する
// (legacy = max(0, streak); stamp = legacy % 7)。以後は旧streakを参照しない。
function getCompletedStamps() {
  try {
    const raw = localStorage.getItem(KEY_STAMP);
    if (raw !== null) {
      const n = parseInt(raw, 10);
      return Number.isFinite(n) ? Math.min(6, Math.max(0, n)) : 0;
    }
    const legacy = Math.max(0, parseInt(localStorage.getItem(KEY_STREAK) || '0', 10));
    const migrated = legacy % 7;
    localStorage.setItem(KEY_STAMP, String(migrated));
    return migrated;
  } catch {
    return 0;
  }
}

// 後方互換のためだけに旧ww_streak(連続日数)を更新する。スタンプ判定には使わない。
function nextLegacyStreak() {
  try {
    const prev = localStorage.getItem(KEY_LOGIN);
    const yd = new Date();
    yd.setDate(yd.getDate() - 1);
    const consecutive = prev === yd.toDateString();
    const prevStreak = parseInt(localStorage.getItem(KEY_STREAK) || '0', 10) || 0;
    return consecutive ? prevStreak + 1 : 1;
  } catch {
    return 1;
  }
}

export function checkLoginBonus() {
  try {
    const today = new Date().toDateString();
    if (localStorage.getItem(KEY_LOGIN) === today) return null;

    const completedBefore = getCompletedStamps(); // 0〜6
    const stampPos = completedBefore + 1;          // 1〜7 (今回受け取る位置)
    const bonus = LOGIN_REWARDS_V2[stampPos - 1];
    const isBigGift = stampPos === 7;

    return { bonus, stampPos, completedBefore, isBigGift };
  } catch {
    return null;
  }
}

export function claimLoginBonus() {
  try {
    const result = checkLoginBonus();
    if (!result) return null;

    const legacyStreak = nextLegacyStreak();
    const coins = addCoins(result.bonus);

    localStorage.setItem(KEY_LOGIN, new Date().toDateString());
    localStorage.setItem(KEY_STAMP, String(result.stampPos >= 7 ? 0 : result.stampPos));
    localStorage.setItem(KEY_STREAK, String(legacyStreak));

    return { ...result, coins };
  } catch {
    return null;
  }
}

// ── Shop unlock ────────────────────────────────────────
export function getUnlockedItems() {
  try {
    return JSON.parse(localStorage.getItem(KEY_UNLOCK) || '[]');
  } catch {
    return [];
  }
}

export function isItemUnlocked(id) {
  return getUnlockedItems().includes(id);
}

export function unlockItem(id) {
  const list = getUnlockedItems();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(KEY_UNLOCK, JSON.stringify(list));
  }
}
