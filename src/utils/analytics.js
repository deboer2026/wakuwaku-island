/** Shared, privacy-safe GA4 event layer for Wakuwaku Island. */
import { incrementPlayCount } from './playCounter';

const SITE_SCOPE = 'wakuwaku_island';
const ALLOWED_KEYS = new Set([
  'site_scope', 'hostname', 'page_path', 'page_title', 'content_type',
  'content_id', 'content_name', 'series_name', 'game_id', 'game_name',
  'game_category', 'source_context', 'stage_id', 'result', 'stars',
  'score', 'engagement_seconds', 'value', 'source_page'
]);
const sent = new Map();

function cleanValue(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'boolean') return value;
  return String(value).slice(0, 100);
}

function commonParams(params = {}) {
  const output = {
    site_scope: SITE_SCOPE,
    hostname: window.location.hostname,
    page_path: window.location.pathname
  };
  Object.entries(params).forEach(([key, value]) => {
    if (!ALLOWED_KEYS.has(key)) return;
    const clean = cleanValue(value);
    if (clean !== undefined && clean !== '') output[key] = clean;
  });
  return output;
}

export function trackEvent(eventName, params = {}, options = {}) {
  if (typeof window === 'undefined') return false;
  const name = String(eventName || '').trim();
  if (!/^[a-z][a-z0-9_]{0,39}$/.test(name)) return false;
  const payload = commonParams(params);
  const dedupeKey = options.dedupeKey || `${name}:${JSON.stringify(payload)}`;
  const now = Date.now();
  if (sent.has(dedupeKey) && now - sent.get(dedupeKey) < (options.dedupeMs || 1500)) return false;
  sent.set(dedupeKey, now);
  window.__WW_ANALYTICS_EVENTS__ = window.__WW_ANALYTICS_EVENTS__ || [];
  window.__WW_ANALYTICS_EVENTS__.push({ event: name, params: payload });
  if (window.__WW_ANALYTICS_EVENTS__.length > 100) window.__WW_ANALYTICS_EVENTS__.shift();
  if (typeof window.gtag !== 'function') return false;
  window.gtag('event', name, payload);
  return true;
}

export function trackPageView(path, title) {
  return trackEvent('page_view', {
    page_path: path || window.location.pathname,
    page_title: title || document.title
  }, { dedupeKey: `page_view:${path}`, dedupeMs: 5000 });
}

export function trackGameSelect(game, sourceContext) {
  return trackEvent('game_select', {
    game_id: game?.route || game?.id || '',
    game_name: game?.name || '',
    game_category: game?.category || '',
    source_context: sourceContext || 'unknown'
  });
}

export function trackGameView(game) {
  return trackEvent('game_view', {
    game_id: game?.route || '',
    game_name: game?.name || '',
    game_category: game?.category || ''
  }, { dedupeKey: `game_view:${game?.route}`, dedupeMs: 5000 });
}

export function trackGameStart(gameName, extra = {}) {
  incrementPlayCount();
  return trackEvent('game_start', { game_name: gameName, ...extra }, {
    dedupeKey: `game_start:${extra.game_id || gameName}`, dedupeMs: 5000
  });
}

export function trackGameClear(gameName, score, stage = 1) {
  return trackEvent('stage_complete', { game_name: gameName, score, stage_id: stage, result: 'complete' });
}

export function trackGameOver(gameName, score, stage = 1) {
  return trackEvent('game_complete', { game_name: gameName, score, stage_id: stage, result: 'ended' });
}

export function trackNewHighScore(gameName, score) {
  return trackEvent('new_high_score', { game_name: gameName, score });
}

export function trackAudioToggle(isMuted) {
  return trackEvent('audio_toggle', { result: isMuted ? 'muted' : 'unmuted' });
}

export function handleGameAnalyticsMessage(event, gameMeta = {}) {
  if (event.origin !== window.location.origin || !event.data || event.data.type !== 'wakuwaku-analytics') return;
  const eventName = event.data.eventName;
  const params = { ...gameMeta, ...(event.data.params || {}) };
  trackEvent(eventName, params, {
    dedupeKey: `${eventName}:${params.game_id || ''}:${params.stage_id || ''}:${params.engagement_seconds || ''}`,
    dedupeMs: eventName === 'game_engagement' ? 1000 : 5000
  });
}
