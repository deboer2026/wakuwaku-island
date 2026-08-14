/**
 * rotate_hint.js - わくわくアイランド
 * 縦長ゲーム用「📱 たてむきにしてね」横向き案内オーバーレイ。
 * iframe内で動作。自分の window サイズ(=iframeの実寸)で判定する。
 * resize 主体で検知（orientationchange はsandbox iframeで発火しないことがあるため補助のみ）。
 */
(function(){
  'use strict';
  if (window.__rotateHintLoaded) return;
  window.__rotateHintLoaded = true;

  var style = document.createElement('style');
  style.textContent = [
    '#rotate-hint{position:fixed;inset:0;z-index:2147483647;display:none;',
    'flex-direction:column;align-items:center;justify-content:center;gap:18px;',
    'background:linear-gradient(160deg,#1a2d5a,#2a1040);color:#fff;',
    "font-family:'M PLUS Rounded 1c',system-ui,sans-serif;text-align:center;padding:24px;}",
    '#rotate-hint.show{display:flex;}',
    '#rotate-hint .rh-phone{font-size:72px;animation:rhSpin 2s ease-in-out infinite;}',
    '@keyframes rhSpin{0%,40%{transform:rotate(-90deg)}60%,100%{transform:rotate(0deg)}}',
    '#rotate-hint .rh-title{font-size:24px;font-weight:900;color:#FFD54F;',
    'text-shadow:2px 2px 0 rgba(0,0,0,.4);}',
    '#rotate-hint .rh-sub{font-size:15px;color:rgba(255,255,255,.85);line-height:1.7;}',
    '#rotate-hint .rh-arrow{font-size:36px;animation:rhBob 1.2s ease-in-out infinite;}',
    '@keyframes rhBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}'
  ].join('');
  (document.head || document.documentElement).appendChild(style);

  var ov = document.createElement('div');
  ov.id = 'rotate-hint';
  ov.innerHTML =
    '<div class="rh-phone">📱</div>' +
    '<div class="rh-arrow">🔄</div>' +
    '<div class="rh-title">たてむきにしてね</div>' +
    '<div class="rh-sub">このゲームは スマホを たてに もって<br>あそんでね！</div>';
  function attach(){
    if (document.body) document.body.appendChild(ov);
    else requestAnimationFrame(attach);
  }
  attach();

  function isLandscapePhone(){
    // Prefer the top-level window dimensions (works even inside a full-bleed iframe).
    var w, h;
    try {
      // If embedded, the iframe fills the page so its own innerWidth/Height
      // already reflect the device orientation. Use them directly.
      w = window.innerWidth;
      h = window.innerHeight;
      // Cross-check with screen if available (more reliable on some mobile browsers)
      if (window.screen && window.screen.width && window.screen.height) {
        // when same-origin parent is reachable this is fine; otherwise screen still
        // reports device dimensions which rotate with the device.
      }
    } catch {
      // Keep the iframe's own viewport as a safe fallback.
      w = window.innerWidth; h = window.innerHeight;
    }
    var landscape = w > h;
    var shortSide = Math.min(w, h);
    return landscape && shortSide < 500;
  }

  function check(){
    if (isLandscapePhone()) ov.classList.add('show');
    else ov.classList.remove('show');
  }

  // resize fires reliably on rotation in all browsers (incl. sandboxed iframes)
  window.addEventListener('resize', check);
  // orientationchange as a backup; harmless if it doesn't fire
  window.addEventListener('orientationchange', function(){ setTimeout(check, 250); });
  // screen.orientation API as a third signal where available
  if (window.screen && window.screen.orientation && window.screen.orientation.addEventListener){
    try { window.screen.orientation.addEventListener('change', function(){ setTimeout(check, 100); }); } catch { /* optional API */ }
  }
  // Accept an explicit signal from the parent frame (most robust)
  window.addEventListener('message', function(ev){
    if (ev && ev.data && ev.data.type === 'orientation'){
      if (ev.data.landscapePhone) ov.classList.add('show');
      else ov.classList.remove('show');
    }
  });

  // Initial checks: run a few times because iframe size may settle after load
  check();
  setTimeout(check, 100);
  setTimeout(check, 400);
  setTimeout(check, 1000);
})();
