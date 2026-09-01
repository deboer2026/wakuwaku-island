import { useEffect } from 'react';

/**
 * useIframeBridge — iframe通信ブリッジ
 * 親から iframe に以下を postMessage で送る：
 *   - { type: 'orientation', landscapePhone: bool }
 *   - { type: 'safeArea', top, bottom, left, right }  (px数値)
 * iframe から { type: 'requestSafeArea' } を受信したら即返信。
 */
export function useIframeBridge(iframeRef) {
  useEffect(() => {
    // safe-area 実測用プローブ要素
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;' +
      'padding-top:env(safe-area-inset-top);' +
      'padding-bottom:env(safe-area-inset-bottom);' +
      'padding-left:env(safe-area-inset-left);' +
      'padding-right:env(safe-area-inset-right);';
    document.body.appendChild(probe);

    const getSafeArea = () => {
      const cs = getComputedStyle(probe);
      return {
        top:    parseFloat(cs.paddingTop)    || 0,
        bottom: parseFloat(cs.paddingBottom) || 0,
        left:   parseFloat(cs.paddingLeft)   || 0,
        right:  parseFloat(cs.paddingRight)  || 0,
      };
    };

    // iframe自身のviewportから見て「まだ避ける必要のある」safe-areaだけを送る。
    // 親側（.game-frame のヘッダー帯・padding）が既に画面端からの距離を
    // 消費している分は、iframe側では二重に空けなくてよいので差し引く。
    const getEffectiveSafeArea = () => {
      const raw = getSafeArea();
      const f = iframeRef.current;
      if (!f) return raw;
      const rect = f.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      return {
        top:    Math.max(0, raw.top    - rect.top),
        bottom: Math.max(0, raw.bottom - (vh - rect.bottom)),
        left:   Math.max(0, raw.left   - rect.left),
        right:  Math.max(0, raw.right  - (vw - rect.right)),
      };
    };

    const notify = () => {
      const f = iframeRef.current;
      if (!f || !f.contentWindow) return;

      const landscapePhone =
        window.innerWidth > window.innerHeight &&
        Math.min(window.innerWidth, window.innerHeight) < 500;
      f.contentWindow.postMessage({ type: 'orientation', landscapePhone }, '*');

      const sa = getEffectiveSafeArea();
      f.contentWindow.postMessage({ type: 'safeArea', ...sa }, '*');
    };

    const onMessage = (ev) => {
      if (ev.data?.type === 'requestSafeArea') {
        const f = iframeRef.current;
        if (f && f.contentWindow) {
          f.contentWindow.postMessage({ type: 'safeArea', ...getEffectiveSafeArea() }, '*');
        }
      }
    };

    window.addEventListener('resize', notify);
    window.addEventListener('orientationchange', () => setTimeout(notify, 250));
    window.addEventListener('message', onMessage);
    const f = iframeRef.current;
    if (f) f.addEventListener('load', () => setTimeout(notify, 300));
    notify();
    setTimeout(notify, 500);

    return () => {
      window.removeEventListener('resize', notify);
      window.removeEventListener('message', onMessage);
      document.body.removeChild(probe);
    };
  }, [iframeRef]);
}
