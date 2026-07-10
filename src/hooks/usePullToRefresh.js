import { useEffect, useState } from 'react';

/**
 * usePullToRefresh — フルスクリーンPWA向けの引っ張って更新
 *
 * ページ最上部でのみ有効。下方向に threshold px 引っ張って離すと onRefresh を実行。
 * 戻り値: { pull, ready }
 *   pull  … 現在の引っ張り量(px, 0〜)。インジケーター表示用
 *   ready … 発火閾値に到達しているか(離すと更新される状態)
 *
 * PWA(display:fullscreen/standalone)ではブラウザ標準のpull-to-refreshが無効なため自前実装。
 */
export function usePullToRefresh(onRefresh, { threshold = 70, max = 120 } = {}) {
  const [pull, setPull]   = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let startY = 0;
    let pulling = false;
    let armed = false; // スクリーン最上部で開始したか

    const atTop = () =>
      (window.scrollY || document.documentElement.scrollTop || 0) <= 0;

    const onStart = (e) => {
      if (!atTop()) { armed = false; return; }
      armed = true;
      pulling = false;
      startY = e.touches[0].clientY;
    };

    const onMove = (e) => {
      if (!armed) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0) { // 上方向スワイプは通常スクロールに委ねる
        if (pulling) { pulling = false; setPull(0); setReady(false); }
        return;
      }
      if (!atTop()) { armed = false; if (pulling){ pulling=false; setPull(0); setReady(false);} return; }

      pulling = true;
      // ゴム感: 引くほど鈍く
      const damped = Math.min(max, dy * 0.5);
      setPull(damped);
      setReady(damped >= threshold);
      // ブラウザのバウンス/選択を抑止
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      if (!pulling) { armed = false; return; }
      const willRefresh = pull >= threshold;
      pulling = false;
      armed = false;
      if (willRefresh) {
        setReady(true);
        setPull(threshold); // スピナー位置で保持
        setTimeout(() => { onRefresh(); }, 180);
      } else {
        setPull(0);
        setReady(false);
      }
    };

    // passive:false で preventDefault を有効化
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove',  onMove,  { passive: false });
    window.addEventListener('touchend',   onEnd,   { passive: true });
    window.addEventListener('touchcancel', onEnd,  { passive: true });

    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove',  onMove);
      window.removeEventListener('touchend',   onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
    // pull を依存に入れると onEnd が最新値を読めるようにする
  }, [onRefresh, threshold, max, pull]);

  return { pull, ready };
}
