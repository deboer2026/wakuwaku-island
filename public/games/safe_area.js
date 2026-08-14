/**
 * safe_area.js - わくわくアイランド
 * iframe内ゲームは env(safe-area-inset-*) を継承できないため、
 * 親フレームから実測値を postMessage で受け取り CSS 変数に反映する。
 * ゲーム側CSSは var(--sat)/var(--sab)/var(--sal)/var(--sar) を使う。
 */
(function(){
  'use strict';
  if (window.__safeAreaLoaded) return;
  window.__safeAreaLoaded = true;

  var root = document.documentElement;

  function apply(d){
    if (typeof d.top === 'number')    root.style.setProperty('--sat', d.top + 'px');
    if (typeof d.bottom === 'number') root.style.setProperty('--sab', d.bottom + 'px');
    if (typeof d.left === 'number')   root.style.setProperty('--sal', d.left + 'px');
    if (typeof d.right === 'number')  root.style.setProperty('--sar', d.right + 'px');
  }

  window.addEventListener('message', function(ev){
    var d = ev && ev.data;
    if (d && d.type === 'safeArea') apply(d);
  });

  // Ask parent for current safe-area on load (parent replies with a safeArea message)
  function request(){
    try { if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'requestSafeArea' }, '*');
    }} catch { /* parent access can be blocked by iframe sandboxing */ }
  }
  request();
  setTimeout(request, 300);
  setTimeout(request, 1000);
})();
