/**
 * Google Analytics 4 Event Tracking Utility
 * Provides helper functions to track game events and user interactions
 */

/**
 * Track when a user starts playing a game
 * @param {string} gameName - Name of the game (e.g., 'Shabondama', 'KudamonoCatch')
 */
export function trackGameStart(gameName) {
  if (window.gtag) {
    gtag('event', 'game_start', {
      game_name: gameName,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Track when a user clears/completes a game stage or the entire game
 * @param {string} gameName - Name of the game
 * @param {number} score - Final score or points earned
 * @param {number} stage - Current stage or level (default 1)
 */
export function trackGameClear(gameName, score, stage = 1) {
  if (window.gtag) {
    gtag('event', 'game_clear', {
      game_name: gameName,
      score: score,
      stage: stage,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Track when a user's game ends (game over, out of lives, etc.)
 * @param {string} gameName - Name of the game
 * @param {number} score - Final score or points earned
 * @param {number} stage - Current stage or level when game ended (default 1)
 */
export function trackGameOver(gameName, score, stage = 1) {
  if (window.gtag) {
    gtag('event', 'game_over', {
      game_name: gameName,
      score: score,
      stage: stage,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Track when a user achieves a new high score
 * @param {string} gameName - Name of the game
 * @param {number} score - New high score
 */
export function trackNewHighScore(gameName, score) {
  if (window.gtag) {
    gtag('event', 'new_high_score', {
      game_name: gameName,
      high_score: score,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Track when user toggles sound/mute
 * @param {boolean} isMuted - Whether audio is muted (true) or unmuted (false)
 */
export function trackAudioToggle(isMuted) {
  if (window.gtag) {
    gtag('event', 'audio_toggle', {
      muted: isMuted,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Track custom events
 * @param {string} eventName - Name of the event
 * @param {object} eventData - Event parameters (optional)
 */
export function trackEvent(eventName, eventData = {}) {
  if (window.gtag) {
    gtag('event', eventName, {
      ...eventData,
      timestamp: new Date().toISOString()
    });
  }
}
