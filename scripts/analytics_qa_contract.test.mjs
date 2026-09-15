import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const bridge = fs.readFileSync(new URL('../public/games/analytics_bridge.js', import.meta.url), 'utf8');
const messages = [];
const qaWindow = {
  parent: { postMessage: (...args) => messages.push(args) },
  location: { search: '?rb_qa=1' },
  addEventListener() {},
  setInterval() {},
};
vm.runInNewContext(bridge, { window: qaWindow, document: { hidden: false }, Date, URLSearchParams });
qaWindow.WakuwakuAnalytics.configure({ game_id: '/qa' });
qaWindow.WakuwakuAnalytics.startGame();
assert.equal(messages.length, 0, 'rb_qa=1 must suppress iframe analytics messages');

const normalMessages = [];
const normalWindow = {
  parent: { postMessage: (...args) => normalMessages.push(args) },
  location: { search: '?rb_qa=0' },
  addEventListener() {},
  setInterval() {},
};
vm.runInNewContext(bridge, { window: normalWindow, document: { hidden: false }, Date, URLSearchParams });
normalWindow.WakuwakuAnalytics.configure({ game_id: '/normal' });
normalWindow.WakuwakuAnalytics.startGame();
assert.equal(normalMessages.length, 1, 'normal URLs must continue to send analytics messages');

const analytics = fs.readFileSync(new URL('../src/utils/analytics.js', import.meta.url), 'utf8');
assert.match(analytics, /QA_QUERY_PARAMETER = 'rb_qa'/);
assert.match(analytics, /if \(isAnalyticsSuppressed\(\)\) return false/);
console.log('analytics_qa_contract.test.mjs: ok');
