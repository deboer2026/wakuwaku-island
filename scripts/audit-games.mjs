import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const rel = (...parts) => path.join(root, ...parts);
const posix = (value) => value.split(path.sep).join('/');
const knownCategories = new Set([
  'アクション', 'パズル', 'かずあそび', 'もじあそび',
  'クイズ', 'そうぞう', 'レース', 'がくしゅう',
]);
const errors = [];
const warnings = [];
const seenIssues = new Set();

async function read(relativePath) {
  return readFile(rel(...relativePath.split('/')), 'utf8');
}

function lineAt(text, index) {
  return text.slice(0, Math.max(0, index)).split(/\r?\n/).length;
}

function evidenceAt(text, index) {
  const start = text.lastIndexOf('\n', Math.max(0, index - 1)) + 1;
  const endAt = text.indexOf('\n', index);
  const end = endAt === -1 ? text.length : endAt;
  return text.slice(start, end).trim().replace(/\s+/g, ' ').slice(0, 180);
}

function issue(severity, category, file, message, options = {}) {
  const item = {
    severity,
    category,
    file: posix(file),
    route: options.route ?? null,
    message,
    line: options.line ?? (options.text != null && options.index != null
      ? lineAt(options.text, options.index)
      : null),
    evidence: options.evidence ?? (options.text != null && options.index != null
      ? evidenceAt(options.text, options.index)
      : ''),
  };
  const key = [item.severity, item.category, item.file, item.route, item.line, item.message].join('|');
  if (seenIssues.has(key)) return;
  seenIssues.add(key);
  (severity === 'error' ? errors : warnings).push(item);
}

function allMatches(text, regex) {
  return [...text.matchAll(regex)];
}

function field(block, name) {
  const match = block.match(new RegExp(`\\b${name}\\s*:\\s*(['\"\\x60])([\\s\\S]*?)\\1`));
  return match ? match[2] : null;
}

function numberField(block, name) {
  const match = block.match(new RegExp(`\\b${name}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
  return match ? Number(match[1]) : null;
}

function matchingDelimiter(text, openIndex, open = '{', close = '}') {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = openIndex; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') { lineComment = true; index += 1; continue; }
    if (char === '/' && next === '*') { blockComment = true; index += 1; continue; }
    if (char === "'" || char === '"' || char === '`') { quote = char; continue; }
    if (char === open) depth += 1;
    if (char === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function duplicates(items, key) {
  const groups = new Map();
  for (const item of items) {
    const value = item[key];
    if (value == null) continue;
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(item);
  }
  return [...groups.entries()].filter(([, values]) => values.length > 1);
}

function extractMeta(text) {
  const entries = [];
  const routePattern = /(?:^|\n)\s*(['"])(.*?)\1\s*:\s*\{/g;
  for (const match of text.matchAll(routePattern)) {
    const openIndex = match.index + match[0].lastIndexOf('{');
    const closeIndex = matchingDelimiter(text, openIndex);
    if (closeIndex < 0) continue;
    const block = text.slice(openIndex, closeIndex + 1);
    entries.push({
      route: match[2],
      name: field(block, 'name'),
      category: field(block, 'category'),
      ageMin: numberField(block, 'ageMin'),
      ageMax: numberField(block, 'ageMax'),
      index: match.index,
      block,
    });
  }
  return entries;
}

function extractArrayObjects(text, declaration) {
  const declarationIndex = text.indexOf(declaration);
  if (declarationIndex < 0) return [];
  const open = text.indexOf('[', declarationIndex);
  const close = matchingDelimiter(text, open, '[', ']');
  if (open < 0 || close < 0) return [];
  const objects = [];
  let cursor = open + 1;
  while (cursor < close) {
    const objectOpen = text.indexOf('{', cursor);
    if (objectOpen < 0 || objectOpen >= close) break;
    const objectClose = matchingDelimiter(text, objectOpen);
    if (objectClose < 0 || objectClose > close) break;
    objects.push({ block: text.slice(objectOpen, objectClose + 1), index: objectOpen });
    cursor = objectClose + 1;
  }
  return objects;
}

function extractSvgKeys(text) {
  const declarationIndex = text.indexOf('const GAME_SVGS');
  if (declarationIndex < 0) return [];
  const open = text.indexOf('{', declarationIndex);
  const close = matchingDelimiter(text, open);
  const object = text.slice(open + 1, close);
  return allMatches(object, /^\s*([A-Za-z_$][\w$]*)\s*:/gm).map((match) => ({
    key: match[1],
    index: open + 1 + match.index,
  }));
}

function extractApp(text, metaRoutes) {
  const imports = allMatches(text, /^import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]\.\/games\/([^'"]+)['"]/gm)
    .map((match) => ({ component: match[1], module: match[2], index: match.index }));
  const setStart = text.indexOf('const GAME_ROUTES');
  const setOpen = text.indexOf('[', setStart);
  const setClose = matchingDelimiter(text, setOpen, '[', ']');
  const setText = setStart >= 0 && setOpen >= 0 && setClose >= 0 ? text.slice(setOpen, setClose + 1) : '';
  const gameRoutesSet = allMatches(setText, /['"](\/[^'"]+)['"]/g).map((match) => match[1]);
  const routes = [];
  for (const match of text.matchAll(/^.*<Route\s+path=['"]([^'"]+)['"].*$/gm)) {
    const line = match[0];
    const routePath = match[1];
    const seo = line.match(/<GameWithSEO\s+route=['"]([^'"]+)['"]/);
    const components = [...line.matchAll(/<([A-Z][A-Za-z0-9_$]*)\b/g)]
      .map((value) => value[1])
      .filter((value) => !['Route', 'GameWithSEO'].includes(value));
    const canonical = seo?.[1] ?? (metaRoutes.has(routePath) ? routePath : null);
    routes.push({ path: routePath, canonical, components, index: match.index, line });
  }
  return { imports, gameRoutesSet, routes };
}

function hasEmoji(value) {
  return /\p{Extended_Pictographic}/u.test(value);
}

async function inspectHtml(file, text) {
  const route = null;
  for (const match of text.matchAll(/\b(?:[A-Za-z_$][\w$]*\.)?(?:fillText|strokeText)\s*\(\s*(['"`])([\s\S]*?)\1/g)) {
    if (hasEmoji(match[2])) {
      issue('error', 'CANVAS', file, 'Canvas の文字描画に絵文字リテラルを直接渡しています', { route, text, index: match.index });
    }
  }
  const emojiVariables = new Set();
  for (const match of text.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(['"`])([^\n]*?)\2/g)) {
    if (hasEmoji(match[3])) emojiVariables.add(match[1]);
  }
  for (const variable of emojiVariables) {
    const regex = new RegExp(`\\b(?:fillText|strokeText)\\s*\\(\\s*${variable}\\b`, 'g');
    for (const match of text.matchAll(regex)) {
      issue('warning', 'CANVAS', file, `Canvas の文字描画で絵文字を含む可能性がある変数 ${variable} を使用しています`, { text, index: match.index });
    }
  }

  for (const match of text.matchAll(/localStorage\s*\.\s*(getItem|setItem|removeItem|clear)\s*\(/g)) {
    const nearby = text.slice(Math.max(0, match.index - 500), Math.min(text.length, match.index + 500));
    const allowed = /SAFE_LS|safeLS|storage(?:Available|Test)|__.*(?:test|probe)/i.test(nearby)
      && /try\s*\{|catch\s*[({]/.test(nearby);
    if (!allowed) {
      issue('error', 'STORAGE', file, `ゲーム HTML から localStorage.${match[1]} を直接使用しています`, { text, index: match.index });
    }
  }

  const bgmNews = allMatches(text, /new\s+WakuwakuBGM\s*\(/g);
  if (bgmNews.length) {
    const guarded = /typeof\s+WakuwakuBGM\s*!==?\s*['"]undefined['"]/.test(text)
      || /if\s*\(\s*(?:window\.)?WakuwakuBGM\s*\)/.test(text);
    const loaded = /<script\b[^>]*\bsrc\s*=\s*['"][^'"]*wakuwaku_bgm\.js['"]/i.test(text);
    if (!guarded) issue('error', 'BGM', file, 'WakuwakuBGM を存在確認ガードなしで生成しています', { text, index: bgmNews[0].index });
    if (!loaded) issue('error', 'BGM', file, 'WakuwakuBGM を共有ライブラリの読込なしで使用しています', { text, index: bgmNews[0].index });
  }

  const hasGoBack = /postMessage\s*\(\s*\{[\s\S]{0,160}?type\s*:\s*['"]goBack['"]/.test(text);
  if (!hasGoBack) {
    issue('warning', 'NAV', file, '親ページへ goBack メッセージを送る実装を確認できません');
  }
  for (const [regex, message] of [
    [/history\.back\s*\(/g, 'history.back() に依存する戻る操作があります'],
    [/location(?:\.href)?\s*=\s*['"]\/?['"]/g, 'location 代入に依存する戻る操作があります'],
    [/parent\.(?:location|document|history)\b/g, '親ページを直接操作しています'],
  ]) {
    for (const match of text.matchAll(regex)) issue('warning', 'NAV', file, message, { text, index: match.index });
  }

  const safeAreaLoaded = /\/games\/safe_area\.js/.test(text);
  const fixedUi = /position\s*:\s*fixed/i.test(text) && /<(?:button|div|header|nav)\b/i.test(text);
  if (fixedUi && !safeAreaLoaded) issue('warning', 'SAFE_AREA', file, '固定 UI がありますが safe_area.js の読込を確認できません');
  if (safeAreaLoaded && !/--sa[trbl]\b/.test(text)) {
    issue('warning', 'SAFE_AREA', file, 'safe_area.js を読み込んでいますが safe-area CSS 変数を使用していません');
  } else if (safeAreaLoaded) {
    if (!/--sat\b/.test(text)) issue('warning', 'SAFE_AREA', file, 'safe_area.js を読み込んでいますが --sat を使用していません');
    if (!/--sab\b/.test(text)) issue('warning', 'SAFE_AREA', file, 'safe_area.js を読み込んでいますが --sab を使用していません');
  }

  const rotateHint = /\/games\/rotate_hint\.js/.test(text);
  const parentOrientation = /addEventListener\s*\(\s*['"]message['"][\s\S]{0,1200}?orientation/.test(text);
  if (/orientationchange/.test(text) && !rotateHint && !parentOrientation) {
    issue('warning', 'ORIENTATION', file, 'orientationchange だけに依存している可能性があります');
  }
  for (const match of text.matchAll(/screen\.orientation\.lock\s*\(/g)) {
    issue('warning', 'ORIENTATION', file, 'iframe 内で screen.orientation.lock() を前提としています', { text, index: match.index });
  }
  const fixedLandscape = /(?:min-width|min-height|aspect-ratio)[^;\n]*(?:landscape|16\s*\/\s*9)/i.test(text);
  if (fixedLandscape && !rotateHint && !parentOrientation) issue('warning', 'ORIENTATION', file, '固定向き前提の可能性がありますが向き案内を確認できません');

  const basicChecks = [
    [/<!doctype\s+html/i, '<!DOCTYPE html> がありません'],
    [/<html\b[^>]*\blang\s*=\s*['"][A-Za-z]{2,}(?:-[A-Za-z0-9]+)*['"]/i, '有効な html lang 属性を確認できません'],
    [/<meta\b[^>]*charset\s*=/i, 'meta charset がありません'],
    [/<meta\b[^>]*name\s*=\s*['"]viewport['"][^>]*viewport-fit\s*=\s*cover/i, 'viewport-fit=cover がありません'],
    [/<title\b[^>]*>[^<]+<\/title>/i, 'title がありません'],
    [/<canvas\b|<main\b|id\s*=\s*['"][^'"]*(?:game|app|root)[^'"]*['"]/i, 'Canvas または主要ゲームルート要素を確認できません'],
    [/touch-action\s*:/i, 'touch-action の指定がありません'],
  ];
  for (const [regex, message] of basicChecks) {
    if (!regex.test(text)) issue('error', 'HTML', file, message);
  }
  const ids = allMatches(text, /\bid\s*=\s*(['"])([^'"]+)\1/gi).map((match) => ({ value: match[2], index: match.index }));
  for (const [id, values] of duplicates(ids, 'value')) {
    issue('error', 'HTML', file, `同一 id "${id}" が ${values.length} 回定義されています`, { text, index: values[1].index });
  }
  for (const match of text.matchAll(/<script\b[^>]*\bsrc\s*=\s*(['"])([^'"]+)\1[^>]*>/gi)) {
    const source = match[2].split(/[?#]/, 1)[0];
    if (/^(?:https?:|data:|\/\/)/i.test(source)) continue;
    const diskPath = source.startsWith('/')
      ? rel('public', ...source.slice(1).split('/'))
      : rel('public', 'games', ...source.split('/'));
    try {
      const info = await stat(diskPath);
      if (info.isFile() && info.size === 0) {
        issue('error', 'HTML', file, `参照する JavaScript ファイル ${source} が空です`, { text, index: match.index });
      }
    } catch {
      // 参照欠落はバンドルや外部配信の可能性があるため、この軽量監査では断定しない。
    }
  }
}

const metaFile = 'src/seo/gameMeta.js';
const appFile = 'src/App.jsx';
const topFile = 'src/pages/TopPage.jsx';
const [metaText, appText, topText] = await Promise.all([read(metaFile), read(appFile), read(topFile)]);

const metaEntries = extractMeta(metaText);
const metaRoutes = new Set(metaEntries.map((entry) => entry.route));
for (const [route, entries] of duplicates(metaEntries, 'route')) {
  issue('error', 'REGISTRY', metaFile, `正規ゲームルート ${route || '(空文字)'} が ${entries.length} 回定義されています`, { route, text: metaText, index: entries[1].index });
}
for (const entry of metaEntries) {
  const options = { route: entry.route || null, text: metaText, index: entry.index };
  if (!entry.route) issue('error', 'REGISTRY', metaFile, 'ゲームルートのキーが空文字です', options);
  if (entry.route && !entry.route.startsWith('/')) issue('error', 'REGISTRY', metaFile, 'ゲームルートが / で始まっていません', options);
  if (entry.route.length > 1 && entry.route.endsWith('/')) issue('error', 'REGISTRY', metaFile, 'ゲームルート末尾に不要な / があります', options);
  if (!entry.name?.trim()) issue('error', 'REGISTRY', metaFile, 'name が欠落しています', options);
  if (!entry.category?.trim()) issue('error', 'REGISTRY', metaFile, 'category が欠落しています', options);
  else if (!knownCategories.has(entry.category)) issue('error', 'REGISTRY', metaFile, `未知の category "${entry.category}" です`, options);
  if (entry.ageMin == null) issue('error', 'REGISTRY', metaFile, 'ageMin が欠落しています', options);
  if (entry.ageMax == null) issue('error', 'REGISTRY', metaFile, 'ageMax が欠落しています', options);
  if (entry.ageMin != null && entry.ageMax != null && entry.ageMin > entry.ageMax) issue('error', 'REGISTRY', metaFile, 'ageMin が ageMax より大きくなっています', options);
}

const app = extractApp(appText, metaRoutes);
const appGameRoutes = app.routes.filter((route) => route.canonical);
const canonicalAppRoutes = new Set(appGameRoutes.map((route) => route.canonical));
const routePaths = app.routes.map((route) => ({ value: route.path, ...route }));
for (const [routePath, values] of duplicates(routePaths, 'value')) {
  issue('error', 'REGISTRY', appFile, `Route path ${routePath} が ${values.length} 回定義されています`, { route: routePath, text: appText, index: values[1].index });
}
for (const route of metaRoutes) {
  if (!canonicalAppRoutes.has(route)) issue('error', 'REGISTRY', appFile, 'gameMeta の正規ルートに対応する App ゲームルートがありません', { route });
}
for (const route of app.routes) {
  if (['/', '/privacy', '/terms'].includes(route.path)) continue;
  if (!route.canonical) issue('warning', 'REGISTRY', appFile, '正規ルートかエイリアスかを判定できない App Route です', { route: route.path, text: appText, index: route.index });
  if (!app.gameRoutesSet.includes(route.path)) issue('error', 'REGISTRY', appFile, 'App のゲームルートが GAME_ROUTES に登録されていません', { route: route.path, text: appText, index: route.index });
}
for (const route of app.gameRoutesSet) {
  if (!app.routes.some((item) => item.path === route)) issue('error', 'REGISTRY', appFile, 'GAME_ROUTES のルートに対応する Route がありません', { route });
}
const importedComponents = new Set(app.imports.map((entry) => entry.component));
const usedComponents = new Set(app.routes.flatMap((route) => route.components));
for (const imported of app.imports) {
  if (!usedComponents.has(imported.component)) issue('error', 'REGISTRY', appFile, `ゲームラッパー ${imported.component} は import されていますが Route で使われていません`, { text: appText, index: imported.index });
}
for (const route of app.routes) {
  for (const component of route.components) {
    if (!importedComponents.has(component) && !['TopPage', 'PrivacyPage', 'TermsPage'].includes(component)) {
      issue('error', 'REGISTRY', appFile, `Route で使われる ${component} の import を確認できません`, { route: route.path, text: appText, index: route.index });
    }
  }
}

const topGames = ['GAMES', 'SCHOOL_GAMES'].flatMap((list) =>
  extractArrayObjects(topText, `const ${list} =`).map(({ block, index }) => ({
    id: field(block, 'id'),
    route: field(block, 'route'),
    num: numberField(block, 'num'),
    category: field(block, 'category'),
    list,
    index,
    block,
  })),
);
for (const key of ['route', 'id']) {
  for (const [value, values] of duplicates(topGames, key)) {
    issue('error', 'REGISTRY', topFile, `GAMES の ${key} "${value}" が ${values.length} 回使われています`, { route: key === 'route' ? value : values[0].route, text: topText, index: values[1].index });
  }
}
for (const list of new Set(topGames.map((game) => game.list))) {
  for (const [value, values] of duplicates(topGames.filter((game) => game.list === list), 'num')) {
    issue('error', 'REGISTRY', topFile, `${list} の num "${value}" が ${values.length} 回使われています`, { route: values[0].route, text: topText, index: values[1].index });
  }
}
for (const game of topGames) {
  const options = { route: game.route, text: topText, index: game.index };
  if (!game.route) issue('error', 'REGISTRY', topFile, 'GAMES の route が欠落しています', options);
  if (!game.category) issue('error', 'REGISTRY', topFile, 'GAMES の category が欠落しています', options);
  if (game.route && !metaRoutes.has(game.route)) issue('error', 'REGISTRY', topFile, 'GAMES のルートが gameMeta に存在しません', options);
}
const topRoutes = new Set(topGames.map((game) => game.route).filter(Boolean));
for (const route of metaRoutes) {
  if (!topRoutes.has(route)) issue('error', 'REGISTRY', topFile, 'gameMeta の正規ルートが GAMES に存在しません', { route });
}
const svgKeys = extractSvgKeys(topText);
const svgKeySet = new Set(svgKeys.map((item) => item.key));
const usedSvgKeys = new Set(topGames.map((game) => game.id).filter(Boolean));
for (const game of topGames) {
  if (game.id && !svgKeySet.has(game.id)) issue('error', 'REGISTRY', topFile, `GAMES から参照する SVG キー ${game.id} が GAME_SVGS にありません`, { route: game.route, text: topText, index: game.index });
}
for (const svg of svgKeys) {
  if (!usedSvgKeys.has(svg.key)) issue('warning', 'REGISTRY', topFile, `GAME_SVGS のキー ${svg.key} はどのゲームからも使われていません`, { text: topText, index: svg.index });
}

const wrapperNames = (await readdir(rel('src', 'games'))).filter((name) => name.endsWith('.jsx')).sort();
const wrappers = [];
const componentRoutes = new Map();
for (const appImport of app.imports) {
  const filename = `${path.basename(appImport.module, '.jsx')}.jsx`;
  const routes = app.routes.filter((route) => route.components.includes(appImport.component) && route.canonical).map((route) => route.canonical);
  componentRoutes.set(filename, new Set(routes));
}
for (const name of wrapperNames) {
  const file = `src/games/${name}`;
  const text = await read(file);
  const iframe = text.match(/<iframe\b[\s\S]*?>/i);
  const iframeSrcMatch = iframe?.[0].match(/\bsrc\s*=\s*['"]([^'"]+)['"]/i);
  const gameContentMatch = text.match(/<GameContent\b[^>]*\broute\s*=\s*['"]([^'"]+)['"]/i);
  const iframeSrc = iframeSrcMatch?.[1] ?? null;
  const gameRoute = gameContentMatch?.[1] ?? null;
  wrappers.push({ file, component: path.basename(name, '.jsx'), route: gameRoute, iframeSrc });
  if (!iframe) continue;
  const iframeIndex = iframe.index ?? text.indexOf('<iframe');
  if (!iframeSrc) issue('error', 'WRAPPER', file, 'iframe の src を静的に取得できません', { route: gameRoute, text, index: iframeIndex });
  else {
    const diskPath = iframeSrc.startsWith('/') ? rel('public', ...iframeSrc.slice(1).split('/')) : rel('public', 'games', iframeSrc);
    try { await stat(diskPath); } catch { issue('error', 'WRAPPER', file, `iframe の参照先 ${iframeSrc} が存在しません`, { route: gameRoute, text, index: iframeIndex }); }
  }
  if (gameRoute && !metaRoutes.has(gameRoute)) issue('error', 'WRAPPER', file, 'GameContent route が gameMeta の正規ルートに存在しません', { route: gameRoute, text, index: gameContentMatch.index });
  const expectedRoutes = componentRoutes.get(name) ?? new Set();
  if (gameRoute && expectedRoutes.size && !expectedRoutes.has(gameRoute)) issue('error', 'WRAPPER', file, 'GameContent route が App の正規ルートと一致しません', { route: gameRoute, text, index: gameContentMatch.index });
  if (!/\buseGameNav\s*\(/.test(text)) issue('error', 'WRAPPER', file, 'iframe がありますが useGameNav を使用していません', { route: gameRoute });
  if (!/\buseIframeBridge\s*\(/.test(text)) issue('error', 'WRAPPER', file, 'iframe がありますが useIframeBridge を使用していません', { route: gameRoute });
  if (!/\bref\s*=\s*\{[^}]+\}/.test(iframe[0])) issue('error', 'WRAPPER', file, 'iframe ref を確認できません', { route: gameRoute, text, index: iframeIndex });
  const allow = iframe[0].match(/\ballow\s*=\s*['"]([^'"]+)['"]/i)?.[1] ?? '';
  if (!/autoplay/i.test(allow) || !/fullscreen/i.test(allow)) issue('error', 'WRAPPER', file, 'iframe の allow に autoplay と fullscreen が揃っていません', { route: gameRoute, text, index: iframeIndex });
  if (!/\bsandbox\s*=/.test(iframe[0])) issue('error', 'WRAPPER', file, 'iframe に sandbox 属性がありません', { route: gameRoute, text, index: iframeIndex });
}

const htmlNames = (await readdir(rel('public', 'games'))).filter((name) => name.endsWith('.html')).sort();
for (const name of htmlNames) {
  const file = `public/games/${name}`;
  await inspectHtml(file, await read(file));
}

const games = [...metaRoutes].sort().map((route) => {
  const meta = metaEntries.find((entry) => entry.route === route);
  const top = topGames.find((entry) => entry.route === route);
  const appRoutesForGame = app.routes.filter((entry) => entry.canonical === route);
  const wrapper = wrappers.find((entry) => entry.route === route);
  return {
    route,
    name: meta?.name ?? null,
    category: meta?.category ?? null,
    ageMin: meta?.ageMin ?? null,
    ageMax: meta?.ageMax ?? null,
    inApp: appRoutesForGame.length > 0,
    aliases: appRoutesForGame.filter((entry) => entry.path !== route).map((entry) => entry.path),
    inGameRoutes: appRoutesForGame.some((entry) => app.gameRoutesSet.includes(entry.path)),
    inTopPage: Boolean(top),
    topPageId: top?.id ?? null,
    wrapper: wrapper?.file ?? null,
    iframeSrc: wrapper?.iframeSrc ?? null,
    htmlExists: wrapper?.iframeSrc ? htmlNames.includes(path.posix.basename(wrapper.iframeSrc)) : false,
  };
});

const summary = {
  gameMetaRoutes: metaRoutes.size,
  appRoutes: canonicalAppRoutes.size,
  gameRoutesSet: new Set(app.gameRoutesSet).size,
  topPageGames: topGames.length,
  wrappers: wrapperNames.length,
  htmlGames: htmlNames.length,
  errors: errors.length,
  warnings: warnings.length,
};
const report = { generatedAt: new Date().toISOString(), summary, errors, warnings, games };
await mkdir(rel('reports'), { recursive: true });
await writeFile(rel('reports', 'game-audit.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log('Wakuwaku Island Game Audit');
console.log('==========================');
console.log('\nRegistry summary');
console.log(`- gameMeta routes: ${summary.gameMetaRoutes}`);
console.log(`- App game routes: ${summary.appRoutes}`);
console.log(`- GAME_ROUTES: ${summary.gameRoutesSet}`);
console.log(`- TopPage games: ${summary.topPageGames}`);
console.log(`- wrappers: ${summary.wrappers}`);
console.log(`- game HTML files: ${summary.htmlGames}`);
for (const [heading, items] of [['ERRORS', errors], ['WARNINGS', warnings]]) {
  console.log(`\n${heading} (${items.length})`);
  if (!items.length) console.log('- none');
  for (const item of items) {
    const where = [item.file, item.line ? `:${item.line}` : '', item.route ? ` (${item.route})` : ''].join('');
    console.log(`[${item.category}] ${where}: ${item.message}`);
  }
}
console.log(`\nResult: ${errors.length ? 'FAILED' : 'PASSED'}`);
process.exitCode = errors.length ? 1 : 0;
