// src/utils/recentGames.js — 最近遊んだゲームの localStorage 管理

const KEY = 'recentGames';
const MAX = 5;

// ゲームルートを記録（重複排除・最大5件・新しい順）
export function recordRecentGame(route) {
  try {
    const recent = JSON.parse(localStorage.getItem(KEY) || '[]');
    const updated = [route, ...recent.filter(r => r !== route)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

// 最近遊んだゲームのルートリストを取得
export function getRecentGames() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
