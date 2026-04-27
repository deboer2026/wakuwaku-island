// Coin / Login-Bonus / Shop-Unlock system — all localStorage-backed

const KEY_COINS   = 'ww_coins';
const KEY_LOGIN   = 'ww_last_login';
const KEY_STREAK  = 'ww_streak';
const KEY_UNLOCK  = 'ww_shop_unlocked';

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

// ── Login Bonus ────────────────────────────────────────
const BONUS_TABLE = [5, 8, 12, 15, 20]; // indexed by (streak - 1), capped at 4

export function checkLoginBonus() {
  const today = new Date().toDateString();
  if (localStorage.getItem(KEY_LOGIN) === today) return null;

  const prev = localStorage.getItem(KEY_LOGIN);
  const yd   = new Date();
  yd.setDate(yd.getDate() - 1);
  const consecutive = prev === yd.toDateString();

  const streak = consecutive
    ? parseInt(localStorage.getItem(KEY_STREAK) || '0', 10) + 1
    : 1;
  const bonus = BONUS_TABLE[Math.min(streak - 1, BONUS_TABLE.length - 1)];

  return { bonus, streak };
}

export function claimLoginBonus() {
  const result = checkLoginBonus();
  if (!result) return null;
  localStorage.setItem(KEY_LOGIN,  new Date().toDateString());
  localStorage.setItem(KEY_STREAK, String(result.streak));
  addCoins(result.bonus);
  return result;
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
