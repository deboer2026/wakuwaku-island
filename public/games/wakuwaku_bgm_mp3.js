/* WakuwakuMP3BGM v1.0 — common MP3-based BGM player for Wakuwaku Island games */
/* Trial rollout: adventure / cute-animals / action only. */
(function(g) {
  'use strict';

  var TRACKS = {
    adventure: '/audio/bgm/adventure.mp3',
    'cute-animals': '/audio/bgm/cute-animals.mp3',
    action: '/audio/bgm/action.mp3',
    'happy-island': '/audio/bgm/happy-island.mp3',
    magical: '/audio/bgm/magical.mp3',
    nature: '/audio/bgm/nature.mp3',
    learning: '/audio/bgm/learning.mp3',
    puzzle: '/audio/bgm/puzzle.mp3',
    racing: '/audio/bgm/racing.mp3',
    'racing-fast': '/audio/bgm/racing-fast.mp3',
    'ocean-food': '/audio/bgm/ocean-food.mp3',
  };

  var BGM_VOLUME = 0.20;
  var CROSSFADE_SECONDS = 0.8;
  var STORAGE_KEY = 'wakuwaku_bgm';

  function loadState() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v !== 'off';
    } catch { return true; }
  }
  function saveState(on) {
    try { localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off'); } catch { /* storage unavailable */ }
  }
  function _clampVol(v) {
    if (!isFinite(v)) return 0;
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  /* ---- shared lifecycle: ONE set of document/window listeners for all instances ---- */
  var _instances = [];
  var _listenersInit = false;
  function _initGlobalListeners() {
    if (_listenersInit) return;
    _listenersInit = true;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) _instances.forEach(function (i) { i._pause(); });
      else _instances.forEach(function (i) { i._resume(); });
    });
    window.addEventListener('pagehide', function (e) {
      if (e.persisted) _instances.forEach(function (i) { i._pause(); });
      else _instances.forEach(function (i) { i._destroy(); });
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) _instances.forEach(function (i) { i._resume(); });
    });
    window.addEventListener('blur', function () {
      setTimeout(function () {
        if (document.hidden) _instances.forEach(function (i) { i._pause(); });
      }, 200);
    });
    window.addEventListener('focus', function () {
      if (!document.hidden) _instances.forEach(function (i) { i._resume(); });
    });
    window.addEventListener('beforeunload', function () {
      _instances.forEach(function (i) { i._destroy(); });
    });
  }

  function WakuwakuMP3BGM(theme) {
    this._theme = null;
    this._els = null;          /* [AudioA, AudioB] */
    this._activeIdx = 0;
    this._on = loadState();    /* user preference (ON/OFF) */
    this._run = false;         /* has start() been called and not yet stopped */
    this._hidden = false;      /* paused due to tab/visibility */
    this._scheduleTimer = null;
    this._fadeRaf = null;
    this._retryAttached = false;
    this._warnedThemes = null;
    this._setTheme(theme);
    _instances.push(this);
    _initGlobalListeners();
  }

  Object.defineProperty(WakuwakuMP3BGM.prototype, 'enabled', {
    get: function () { return this._on; },
  });

  WakuwakuMP3BGM.prototype._warnUnknownTheme = function (theme) {
    if (!this._warnedThemes) this._warnedThemes = {};
    if (this._warnedThemes[theme]) return;
    this._warnedThemes[theme] = true;
    console.warn('[WakuwakuMP3BGM] unknown theme: ' + theme);
  };

  WakuwakuMP3BGM.prototype._setTheme = function (theme) {
    if (!Object.prototype.hasOwnProperty.call(TRACKS, theme)) {
      this._warnUnknownTheme(theme);
      return false;
    }
    this._theme = theme;
    return true;
  };

  WakuwakuMP3BGM.prototype._ensureEls = function () {
    if (this._els || !this._theme) return;
    var src = TRACKS[this._theme];
    var a = new Audio(src);
    var b = new Audio(src);
    a.preload = 'auto'; b.preload = 'auto';
    a.volume = 0; b.volume = 0;
    this._els = [a, b];
    this._activeIdx = 0;
  };

  WakuwakuMP3BGM.prototype._clearSchedule = function () {
    if (this._scheduleTimer) { clearTimeout(this._scheduleTimer); this._scheduleTimer = null; }
    if (this._fadeRaf) { cancelAnimationFrame(this._fadeRaf); this._fadeRaf = null; }
  };

  WakuwakuMP3BGM.prototype._tryPlay = function (el, onSuccess) {
    var self = this;
    var p;
    try { p = el.play(); } catch { p = null; }
    if (p && typeof p.catch === 'function') {
      p.then(function () { onSuccess && onSuccess(); }).catch(function () { self._attachRetry(); });
    } else {
      onSuccess && onSuccess();
    }
  };

  WakuwakuMP3BGM.prototype._attachRetry = function () {
    if (this._retryAttached) return;
    this._retryAttached = true;
    var self = this;
    window.addEventListener('pointerdown', function handler() {
      self._retryAttached = false;
      if (!self._run || self._hidden || !self._els || !self._on) return;
      var active = self._els[self._activeIdx];
      active.volume = BGM_VOLUME;
      self._tryPlay(active, function () { self._scheduleCrossfade(active); });
    }, { once: true });
  };

  WakuwakuMP3BGM.prototype._scheduleCrossfade = function (activeEl) {
    this._clearSchedule();
    var self = this;
    function check() {
      if (!self._run || self._hidden || !self._els || !self._on) return;
      var dur = activeEl.duration;
      if (!dur || !isFinite(dur)) {
        self._scheduleTimer = setTimeout(check, 100);
        return;
      }
      var remain = Math.max(0, dur - activeEl.currentTime - CROSSFADE_SECONDS);
      self._scheduleTimer = setTimeout(function () {
        if (!self._run || self._hidden) return;
        self._runCrossfade();
      }, remain * 1000);
    }
    check();
  };

  WakuwakuMP3BGM.prototype._runCrossfade = function () {
    if (!this._els || !this._run || this._hidden) return;
    var fromIdx = this._activeIdx;
    var toIdx = 1 - fromIdx;
    var from = this._els[fromIdx];
    var to = this._els[toIdx];
    to.currentTime = 0;
    to.volume = 0;
    this._tryPlay(to);
    var self = this;
    var startTime = performance.now();
    var durationMs = CROSSFADE_SECONDS * 1000;
    function step(now) {
      var t = Math.max(0, Math.min(1, (now - startTime) / durationMs));
      from.volume = _clampVol(BGM_VOLUME * (1 - t));
      to.volume = _clampVol(BGM_VOLUME * t);
      if (t < 1) {
        self._fadeRaf = requestAnimationFrame(step);
      } else {
        self._fadeRaf = null;
        from.pause();
        from.currentTime = 0;
        from.volume = 0;
        self._activeIdx = toIdx;
        self._scheduleCrossfade(to);
      }
    }
    this._fadeRaf = requestAnimationFrame(step);
  };

  WakuwakuMP3BGM.prototype.start = function () {
    if (!this._theme) return;
    this._run = true;
    if (!this._on) return;
    if (typeof document !== 'undefined' && document.hidden) {
      /* page is already hidden (e.g. loaded in a background tab): remember
         the intent to play, but don't start audio/timers until it becomes visible */
      this._hidden = true;
      return;
    }
    this._ensureEls();
    if (!this._els) return;
    this._hidden = false;
    var active = this._els[this._activeIdx];
    var other = this._els[1 - this._activeIdx];
    other.pause();
    active.volume = BGM_VOLUME;
    var self = this;
    this._tryPlay(active, function () { self._scheduleCrossfade(active); });
  };

  WakuwakuMP3BGM.prototype.stop = function () {
    this._run = false;
    this._clearSchedule();
    if (this._els) this._els.forEach(function (el) { el.pause(); });
  };

  WakuwakuMP3BGM.prototype.toggle = function () {
    this._on = !this._on;
    saveState(this._on);
    if (this._on) this.start(); else this.stop();
    return this._on;
  };

  WakuwakuMP3BGM.prototype.setEnabled = function (on) {
    this._on = !!on;
  };

  /* setTheme: fade current out, swap source, fade new in (only if currently running) */
  WakuwakuMP3BGM.prototype.setTheme = function (theme) {
    if (theme === this._theme) return;
    var prevTheme = this._theme;
    if (!this._setTheme(theme)) return; /* unknown theme: warn, keep previous, don't crash */

    var wasRunning = this._run && this._on && this._els;
    this._clearSchedule();

    if (!this._els) {
      /* not yet started: just remember the new theme, start() will pick it up */
      return;
    }

    var self = this;
    var active = this._els[this._activeIdx];
    var startVol = active.volume;
    var startTime = performance.now();
    var fadeMs = (CROSSFADE_SECONDS * 1000) / 2;
    function fadeOut(now) {
      var t = Math.max(0, Math.min(1, (now - startTime) / fadeMs));
      active.volume = _clampVol(startVol * (1 - t));
      if (t < 1) {
        self._fadeRaf = requestAnimationFrame(fadeOut);
      } else {
        self._fadeRaf = null;
        self._els.forEach(function (el) {
          el.pause(); el.currentTime = 0; el.volume = 0; el.src = TRACKS[theme];
        });
        self._activeIdx = 0;
        if (wasRunning) self.start();
      }
    }
    if (prevTheme) {
      this._fadeRaf = requestAnimationFrame(fadeOut);
    } else {
      /* no previous theme was actually playing; just swap src directly */
      this._els.forEach(function (el) { el.pause(); el.currentTime = 0; el.volume = 0; el.src = TRACKS[theme]; });
      this._activeIdx = 0;
      if (wasRunning) this.start();
    }
  };

  /* ---- lifecycle handlers (called by the shared global listeners) ---- */
  WakuwakuMP3BGM.prototype._pause = function () {
    if (!this._els) return;
    this._hidden = true;
    this._clearSchedule();
    this._els.forEach(function (el) { el.pause(); });
  };

  WakuwakuMP3BGM.prototype._resume = function () {
    if (!this._hidden) return;
    this._hidden = false;
    if (!this._run || !this._on) return;
    if (!this._els) {
      /* start() was called while the page was already hidden: begin now */
      this._ensureEls();
      if (!this._els) return;
    }
    var active = this._els[this._activeIdx];
    var other = this._els[1 - this._activeIdx];
    other.pause();
    active.volume = BGM_VOLUME;
    var self = this;
    this._tryPlay(active, function () { self._scheduleCrossfade(active); });
  };

  WakuwakuMP3BGM.prototype._destroy = function () {
    this.stop();
    if (this._els) this._els.forEach(function (el) { el.src = ''; });
    var idx = _instances.indexOf(this);
    if (idx >= 0) _instances.splice(idx, 1);
  };

  /* static helpers, matching WakuwakuBGM's API surface */
  WakuwakuMP3BGM.loadState = loadState;
  WakuwakuMP3BGM.saveState = saveState;

  g.WakuwakuMP3BGM = WakuwakuMP3BGM;
})(window);
