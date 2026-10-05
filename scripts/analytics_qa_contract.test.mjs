import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const events = [];
const dispatched = [];
globalThis.document = { title: 'QA contract test' };
globalThis.window = {
  location: { search: '?rb_qa=1', hostname: 'wakuwakuislands.com', pathname: '/mahou-meiro' },
  sessionStorage: new MemoryStorage(), localStorage: new MemoryStorage(),
  gtag: (...args) => events.push(args), Event: class Event { constructor(type) { this.type = type; } },
  dispatchEvent: (event) => dispatched.push(event.type)
};

const analyticsSource = fs.readFileSync(new URL('../src/utils/analytics.js', import.meta.url), 'utf8')
  .replace("import { incrementPlayCount } from './playCounter';", 'const incrementPlayCount = () => {};');
assert.notEqual(analyticsSource, '', 'the production analytics module is loaded for the contract test');
const analyticsUrl = `data:text/javascript;base64,${Buffer.from(analyticsSource).toString('base64')}`;
const { isAnalyticsSuppressed, trackEvent, trackPageView, QA_MODE_CHANGE_EVENT } = await import(analyticsUrl);
assert.equal(isAnalyticsSuppressed(), true, 'rb_qa=1 enables QA mode');
assert.equal(window.sessionStorage.getItem('ww_qa_tracking_disabled'), '1', 'QA mode is stored only for the current tab session');
for (const name of ['page_view', 'game_view', 'game_start', 'stage_start', 'stage_complete', 'game_complete', 'game_engagement']) {
  assert.equal(trackEvent(name, { game_id: '/qa' }), false, `${name} is suppressed in QA mode`);
}
assert.equal(trackPageView('/qa', 'QA'), false, 'page_view helper is suppressed in QA mode');
assert.equal(events.length, 0, 'QA mode sends no GA4 events');
assert.equal(window.__WW_ANALYTICS_EVENTS__, undefined, 'QA events are not added to the browser analytics buffer');
assert.ok(dispatched.includes(QA_MODE_CHANGE_EVENT), 'the QA indicator is notified when mode turns on');

window.location.search = '';
assert.equal(isAnalyticsSuppressed(), true, 'QA mode remains active after an SPA route drops the query parameter');
window.location.search = '?rb_qa=0';
assert.equal(isAnalyticsSuppressed(), false, 'rb_qa=0 explicitly clears QA mode');
assert.equal(window.sessionStorage.getItem('ww_qa_tracking_disabled'), null, 'rb_qa=0 removes the session flag');
assert.equal(trackEvent('game_start', { game_id: '/normal' }), true, 'tracking resumes immediately after rb_qa=0');
assert.equal(events.length, 1, 'normal tracking sends GA4 events');

window.location.search = '';
window.sessionStorage.clear();
assert.equal(isAnalyticsSuppressed(), false, 'clearing sessionStorage simulates tab-session expiration');
assert.equal(trackEvent('game_view', { game_id: '/normal' }), true, 'ordinary production visits remain trackable');
assert.equal(events.length, 2, 'normal production page and game events reach gtag');

const bridge = fs.readFileSync(new URL('../public/games/analytics_bridge.js', import.meta.url), 'utf8');
function runBridge(search, parentDisabled = false) {
  const messages = [];
  const childWindow = {
    parent: { postMessage: (...args) => messages.push(args), __WW_QA_TRACKING_DISABLED__: parentDisabled },
    location: { search }, sessionStorage: new MemoryStorage(), addEventListener() {}, setInterval() {}
  };
  vm.runInNewContext(bridge, { window: childWindow, document: { hidden: false }, Date, URLSearchParams });
  childWindow.WakuwakuAnalytics.configure({ game_id: '/bridge' });
  childWindow.WakuwakuAnalytics.startGame();
  return { messages, childWindow };
}
assert.equal(runBridge('?rb_qa=1').messages.length, 0, 'the iframe bridge suppresses its events with rb_qa=1');
assert.equal(runBridge('', true).messages.length, 0, 'the iframe bridge honors the parent QA session flag');
const normalBridge = runBridge('?rb_qa=0');
assert.equal(normalBridge.messages.length, 1, 'the iframe bridge continues to report normal game starts');

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert.match(html, /send_page_view:\s*false/, 'gtag does not auto-send a page_view before the QA gate');
const gaBootstrap = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]).find((source) => source.includes('G-6T1PPPP7TR'));
assert.ok(gaBootstrap, 'the guarded GA4 bootstrap exists');
function runGaBootstrap(search, seededQa = false) {
  const storage = new MemoryStorage();
  if (seededQa) storage.setItem('ww_qa_tracking_disabled', '1');
  const scripts = [];
  const win = { location: { search }, sessionStorage: storage, dataLayer: [] };
  vm.runInNewContext(gaBootstrap, {
    window: win, URLSearchParams, Date,
    document: { createElement: (tag) => ({ tag }), head: { appendChild: (script) => scripts.push(script) } }
  });
  return { win, storage, scripts };
}
const qaBootstrap = runGaBootstrap('?rb_qa=1');
assert.equal(qaBootstrap.win.gtag, undefined, 'QA mode does not initialize gtag');
assert.equal(qaBootstrap.scripts.length, 0, 'QA mode does not load the Google tag script');
assert.equal(qaBootstrap.storage.getItem('ww_qa_tracking_disabled'), '1');
const normalBootstrap = runGaBootstrap('');
assert.equal(typeof normalBootstrap.win.gtag, 'function', 'ordinary production visits initialize gtag');
assert.equal(normalBootstrap.scripts.length, 1, 'ordinary production visits load the Google tag');
assert.equal(normalBootstrap.win.dataLayer[1][0], 'config');
assert.equal(normalBootstrap.win.dataLayer[1][2].send_page_view, false);
const releasedBootstrap = runGaBootstrap('?rb_qa=0', true);
assert.equal(releasedBootstrap.storage.getItem('ww_qa_tracking_disabled'), null, 'rb_qa=0 clears the persistent tab flag');
assert.equal(releasedBootstrap.scripts.length, 1, 'tracking resumes after rb_qa=0');
assert.match(app, /QA tracking disabled/, 'the admin-only QA status indicator exists');
assert.match(app, /if \(!disabled\) return null/, 'the QA status indicator is hidden for ordinary visitors');
console.log('analytics_qa_contract.test.mjs: ok');
