(function () {
  'use strict';
  var config = null;
  var started = false;
  var activeSeconds = 0;
  var lastActivity = Date.now();
  var milestones = [30, 60, 180, 300];
  var sentMilestones = {};

  function send(eventName, params) {
    if (window.parent === window || !config) return;
    window.parent.postMessage({
      type: 'wakuwaku-analytics',
      eventName: eventName,
      params: Object.assign({}, config, params || {})
    }, window.location.origin);
  }

  function activity() { lastActivity = Date.now(); }

  function startGame(nextConfig) {
    config = Object.assign({}, config || {}, nextConfig || {});
    activity();
    if (started) return;
    started = true;
    send('game_start');
  }

  function stageStart(stageId) {
    startGame();
    send('stage_start', typeof stageId === 'object' ? stageId : { stage_id: stageId });
  }

  function stageComplete(stageId, result, stars) {
    send('stage_complete', typeof stageId === 'object' ? stageId : { stage_id: stageId, result: result || 'complete', stars: stars });
  }

  function gameComplete(result, score, stage) {
    send('game_complete', typeof result === 'object' ? result : { result: result || 'complete', score: score, stage_id: stage });
  }

  ['pointerdown', 'keydown', 'touchstart'].forEach(function (name) {
    window.addEventListener(name, activity, { passive: true });
  });

  window.setInterval(function () {
    if (!started || document.hidden || Date.now() - lastActivity > 60000) return;
    activeSeconds += 5;
    milestones.forEach(function (seconds) {
      if (activeSeconds >= seconds && !sentMilestones[seconds]) {
        sentMilestones[seconds] = true;
        send('game_engagement', { engagement_seconds: seconds, value: seconds });
      }
    });
  }, 5000);

  window.WakuwakuAnalytics = {
    configure: function (nextConfig) { config = Object.assign({}, config || {}, nextConfig || {}); },
    startGame: startGame,
    stageStart: stageStart,
    stageComplete: stageComplete,
    gameComplete: gameComplete
  };
})();
