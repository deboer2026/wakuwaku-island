/**
 * 累計プレイカウンター
 * 各ゲームのスタート時に呼ばれ、localStorageで通算プレイ数を管理する
 */

const KEY = 'wakuwaku_total_plays';

/** プレイ数を+1してlocalStorageに保存し、新しい値を返す */
export function incrementPlayCount() {
  const current = parseInt(localStorage.getItem(KEY) || '0', 10);
  const next = current + 1;
  localStorage.setItem(KEY, String(next));
  return next;
}

/** 現在の通算プレイ数を返す */
export function getPlayCount() {
  return parseInt(localStorage.getItem(KEY) || '0', 10);
}
