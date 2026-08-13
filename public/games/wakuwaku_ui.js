/* Wakuwaku Island shared in-game navigation presentation.
 * This file deliberately does not create buttons or change their behavior.
 */
(function () {
  'use strict';

  var style = document.createElement('style');
  style.id = 'wakuwaku-ui-style';
  style.textContent = [
    ':root{--ww-ui-top:calc(var(--sat, 0px) + 8px);--ww-ui-left:calc(var(--sal, 0px) + 10px);}',
    '[data-ww-ui]{box-sizing:border-box;min-width:44px!important;min-height:44px!important;padding:0 12px!important;border:2px solid rgba(255,255,255,.78)!important;border-radius:15px!important;background:linear-gradient(145deg,rgba(255,255,255,.94),rgba(228,243,255,.86))!important;color:#315178!important;font:800 15px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;letter-spacing:.02em!important;box-shadow:0 3px 10px rgba(33,74,115,.24),inset 0 1px rgba(255,255,255,.9)!important;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);touch-action:manipulation;}',
    '[data-ww-ui="sound"]{min-width:44px!important;padding:0 10px!important;}',
    '.ww-ui-fixed{position:fixed!important;top:var(--ww-ui-top)!important;transform:none!important;margin:0!important;z-index:90!important;}',
    '.ww-ui-fixed[data-ww-ui="back"]{left:var(--ww-ui-left)!important;right:auto!important;}',
    '.ww-ui-fixed[data-ww-ui="sound"]{left:calc(var(--ww-ui-left) + var(--ww-ui-back-width, 44px) + 8px)!important;right:auto!important;}',
    '[data-ww-ui]:focus-visible{outline:3px solid #ffd65b!important;outline-offset:2px!important;}',
    '@media (hover:hover){[data-ww-ui]:hover{transform:translateY(-1px);filter:brightness(1.04);}}',
    '@media (max-height:440px){:root{--ww-ui-top:calc(var(--sat, 0px) + 5px);}[data-ww-ui]{min-height:40px!important;min-width:40px!important;border-radius:13px!important;font-size:14px!important;}}',
    '@media (prefers-reduced-motion:reduce){[data-ww-ui]{transition:none!important;}}'
  ].join('');
  (document.head || document.documentElement).appendChild(style);

  function label(button, fallback) {
    if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', fallback);
  }
  function markFirst(selectors, kind, fallback) {
    if (document.querySelector('[data-ww-ui="' + kind + '"]')) return;
    var button = document.querySelector(selectors);
    if (!button) return;
    button.setAttribute('data-ww-ui', kind);
    label(button, fallback);
  }
  function syncSpacing() {
    var back = document.querySelector('[data-ww-ui="back"]');
    var width = back ? Math.max(44, Math.ceil(back.getBoundingClientRect().width)) : 44;
    document.documentElement.style.setProperty('--ww-ui-back-width', width + 'px');
  }
  function hasTransformedParent(button) {
    for (var parent = button.parentElement; parent && parent !== document.documentElement; parent = parent.parentElement) {
      if (getComputedStyle(parent).transform !== 'none') return true;
    }
    return false;
  }
  function placeNavigation() {
    var back = document.querySelector('[data-ww-ui="back"]');
    var sound = document.querySelector('[data-ww-ui="sound"]');
    /* A transformed game HUD establishes a fixed-position containing block.
       Leave those specialized headers untouched rather than moving controls
       into the middle of the screen. */
    [back, sound].forEach(function (button) {
      if (button && !hasTransformedParent(button)) button.classList.add('ww-ui-fixed');
    });
    syncSpacing();
  }
  document.addEventListener('DOMContentLoaded', function () {
    /* Older games use different ids.  Mark the existing element only; never
       create, replace, clone, or attach behavior to navigation controls. */
    markFirst('#backBtn,#back-btn,#hud-back,#btn-hud-back,#btn-back,#chip-back,#b-back,#worldBack,#quit-btn,#ui-home-btn,#homeBtn,#btnHome,#back,#bBack', 'back', 'もどる');
    markFirst('#bgmBtn,#bgm-btn,#ui-bgm-btn,#hud-bgm,#soundBtn,#sound-btn,#btn-bgm,#chip-bgm,#b-bgm,#bBgm,#musicBtn,#music,#btnSound', 'sound', 'おんがく');
    document.querySelectorAll('[data-ww-ui="back"]').forEach(function (button) { label(button, 'もどる'); });
    document.querySelectorAll('[data-ww-ui="sound"]').forEach(function (button) { label(button, 'おんがく'); });
    placeNavigation();
    window.addEventListener('resize', placeNavigation, { passive: true });
  }, { once: true });
}());
