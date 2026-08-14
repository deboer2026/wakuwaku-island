// src/utils/playHistory.js — ゲームごとのプレイ回数記録(スタンプずかん用)

const KEY = 'wakuwaku_play_history_v1';

// ゲームプレイを記録(route → 回数)
export function recordGamePlay(route) {
  try {
    const h = JSON.parse(localStorage.getItem(KEY) || '{}');
    h[route] = (h[route] || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(h));
  } catch { /* local storage is optional */ }
}

// プレイ履歴を取得。既存プレイヤー救済として recentGames もスタンプに反映
export function getPlayHistory() {
  try {
    const h = JSON.parse(localStorage.getItem(KEY) || '{}');
    const recent = JSON.parse(localStorage.getItem('recentGames') || '[]');
    recent.forEach(r => { if (!h[r]) h[r] = 1; });
    return h;
  } catch {
    return {};
  }
}
