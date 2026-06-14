/**
 * rotate_hint.js - わくわくアイランド
 * 縦長ゲーム用「📱 たてむきにしてね」横向き案内オーバーレイ。
 * 縦長設計のゲームHTMLで <script src="/games/rotate_hint.js"></script> を読むだけ。
 * 横向き(landscape かつ 高さ<500px)のとき自動表示。
 */
(function(){
  'use strict';
  if (window.__rotateHintLoaded) return;
  window.__rotateHintLoaded = true;

  var style = document.createElement('style');
  style.textContent = [
    '#rotate-hint{position:fixed;inset:0;z-index:999999;display:none;',
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
  document.head.appendChild(style);

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

  function check(){
    // Landscape on a short screen = phone held sideways
    var landscape = window.innerWidth > window.innerHeight;
    var shortSide = Math.min(window.innerWidth, window.innerHeight);
    // Only nag on phone-sized screens (avoid tablets/desktop landscape)
    var isPhone = shortSide < 500;
    if (landscape && isPhone) ov.classList.add('show');
    else ov.classList.remove('show');
  }
  window.addEventListener('resize', check);
  window.addEventListener('orientationchange', function(){ setTimeout(check, 200); });
  check();
})();
