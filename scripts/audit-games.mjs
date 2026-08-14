import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const rel = (...parts) => path.join(root, ...parts);
const posix = (value) => value.split(path.sep).join('/');
const knownCategories = new Set([
  'アクション', 'パズル', 'かずあそび', 'もじあそび',
  'クイズ', 'そうぞう', 'レース', 'がくしゅう', 'ぼうけん',
]);
const errors = [];
const warnings = [];
const seenIssues = new Set();
let currentHtmlContext = null;
let previousReport = null;

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
  const referenceSeverity = severity;
  const status = options.status ?? currentHtmlContext?.status ?? null;
  if (status && status !== 'active' && severity === 'error') severity = 'warning';
  const item = {
    severity,
    referenceSeverity,
    category,
    file: posix(file),
    status,
    route: options.route ?? currentHtmlContext?.route ?? null,
    wrapper: options.wrapper ?? currentHtmlContext?.wrapper ?? null,
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
  const imports = [
    ...allMatches(text, /^import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]\.\/games\/([^'"]+)['"]/gm),
    ...allMatches(text, /^const\s+([A-Za-z_$][\w$]*)\s+=\s+lazy\(\(\)\s*=>\s*import\(['"]\.\/games\/([^'"]+)['"]\)\)/gm),
    ...allMatches(text, /^const\s+([A-Za-z_$][\w$]*)\s+=\s+lazy\(\(\)\s*=>\s*import\(['"]\.\/pages\/([^'"]+)['"]\)\)/gm),
  ].map((match) => ({ component: match[1], module: match[2], index: match.index }));
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

function maskJavaScript(source) {
  const masked = source.split('');
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      else masked[index] = ' ';
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        masked[index] = ' ';
        masked[index + 1] = ' ';
        blockComment = false;
        index += 1;
      } else if (char !== '\n') masked[index] = ' ';
      continue;
    }
    if (quote) {
      if (char !== '\n') masked[index] = ' ';
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') {
      masked[index] = ' ';
      masked[index + 1] = ' ';
      lineComment = true;
      index += 1;
    } else if (char === '/' && next === '*') {
      masked[index] = ' ';
      masked[index + 1] = ' ';
      blockComment = true;
      index += 1;
    } else if (char === "'" || char === '"' || char === '`') {
      masked[index] = ' ';
      quote = char;
    }
  }
  return masked.join('');
}

function maskExecutableJavaScript(text) {
  const masked = Array(text.length).fill(' ');
  let foundScript = false;
  for (const match of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    foundScript = true;
    const content = match[1];
    const contentStart = match.index + match[0].indexOf(content);
    const contentMasked = maskJavaScript(content);
    for (let index = 0; index < contentMasked.length; index += 1) {
      masked[contentStart + index] = contentMasked[index];
    }
  }
  return foundScript ? masked.join('') : maskJavaScript(text);
}

function enclosingBraceBlocks(masked, targetIndex) {
  const blocks = [];
  for (let open = masked.lastIndexOf('{', targetIndex); open >= 0; open = masked.lastIndexOf('{', open - 1)) {
    const close = matchingDelimiter(masked, open);
    if (close >= targetIndex) blocks.push({ open, close });
  }
  return blocks;
}

function navPostMessageIndices(source, masked, open, close, typePattern = /goBack|goHome/) {
  const indices = [];
  const block = masked.slice(open, close + 1);
  for (const match of block.matchAll(/\b(?:window\.)?parent\.postMessage\s*\(/g)) {
    const callStart = open + match.index;
    const parenOpen = masked.indexOf('(', callStart);
    const parenClose = matchingDelimiter(masked, parenOpen, '(', ')');
    if (parenClose < 0 || parenClose > close) continue;
    const call = source.slice(callStart, parenClose + 1);
    const typeMatch = call.match(/\btype\s*:\s*(['"])([\w]+)\1/);
    if (typeMatch && typePattern.test(typeMatch[2])) indices.push(callStart);
  }
  return indices;
}

function hasIframeParentCheck(maskedBlock) {
  return /\bwindow\.parent\s*!={1,2}\s*window\b/.test(maskedBlock)
    || /\bwindow\.self\s*!={1,2}\s*window\.top\b/.test(maskedBlock)
    || /\bwindow\.top\s*!={1,2}\s*window\.self\b/.test(maskedBlock);
}

function handlerIsBound(source, masked, open, close) {
  const prefixStart = Math.max(0, open - 260);
  const prefix = masked.slice(prefixStart, open);
  if (/\.onclick\s*=\s*(?:async\s*)?(?:function\s*\([^)]*\)|(?:\([^)]*\)|[A-Za-z_$][\w$]*)?\s*=>)\s*$/.test(prefix)
    || /addEventListener\s*\([\s\S]{0,220}?(?:function\s*\([^)]*\)|(?:\([^)]*\)|[A-Za-z_$][\w$]*)?\s*=>)\s*$/.test(prefix)) {
    return true;
  }
  const functionMatch = prefix.match(/function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*$/);
  if (!functionMatch) return false;
  const name = functionMatch[1].replace(/[$]/g, '\\$&');
  const functionStart = prefixStart + functionMatch.index;
  const outsideCode = `${masked.slice(0, functionStart)}\n${masked.slice(close + 1)}`;
  const outsideSource = `${source.slice(0, functionStart)}\n${source.slice(close + 1)}`;
  const inlineBinding = new RegExp(`<[^>]+\\bon(?:click|pointerdown|pointerup|touchend)\\s*=\\s*(['"])[^'"]*\\b${name}\\s*\\([^'"]*\\1`, 'i');
  return new RegExp(`\\b${name}\\s*\\(`).test(outsideCode)
    || new RegExp(`addEventListener\\s*\\([\\s\\S]{0,180}?,\\s*${name}\\b`).test(outsideCode)
    || new RegExp(`\\.onclick\\s*=\\s*${name}\\b`).test(outsideCode)
    || inlineBinding.test(outsideSource);
}

// 「history.back() のみに依存」false positive 対策：
// stopBgm()/cancelAnimationFrame() 等の後片付け呼び出しが同じブロックに
// 混在していても、postMessage(goBack) と if/else で排他制御されていれば
// 正式な親通信フォールバックとみなす（Phase 4C-3C で判定を緩和）。
function isGuardedStandaloneHistoryBack(source, masked, historyIndex) {
  for (const { open, close } of enclosingBraceBlocks(masked, historyIndex)) {
    const block = masked.slice(open, close + 1);
    const historyCalls = [...block.matchAll(/\bhistory\.back\s*\(/g)];
    if (historyCalls.length !== 1 || !hasIframeParentCheck(block)) continue;
    const postMessages = navPostMessageIndices(source, masked, open, close, /^goBack$/);
    if (!postMessages.length || !handlerIsBound(source, masked, open, close)) continue;
    for (const postIndex of postMessages) {
      const between = postIndex < historyIndex
        ? masked.slice(postIndex, historyIndex)
        : masked.slice(historyIndex, postIndex);
      if (/\belse\b/.test(between) || (postIndex < historyIndex && /\breturn\b/.test(between))) return true;
    }
  }
  return false;
}

// location 直代入版の同型ガード。goBack/goHome いずれの postMessage とも
// if/else で排他制御されていれば正式なフォールバックとみなす。
function isGuardedStandaloneLocationAssign(source, masked, locationIndex) {
  for (const { open, close } of enclosingBraceBlocks(masked, locationIndex)) {
    const block = masked.slice(open, close + 1);
    const locationCalls = [...block.matchAll(/location(?:\.href)?\s*=\s*['"]\/?['"]/g)];
    if (locationCalls.length !== 1 || !hasIframeParentCheck(block)) continue;
    const postMessages = navPostMessageIndices(source, masked, open, close, /^(?:goBack|goHome)$/);
    if (!postMessages.length || !handlerIsBound(source, masked, open, close)) continue;
    for (const postIndex of postMessages) {
      const between = postIndex < locationIndex
        ? masked.slice(postIndex, locationIndex)
        : masked.slice(locationIndex, postIndex);
      if (/\belse\b/.test(between) || (postIndex < locationIndex && /\breturn\b/.test(between))) return true;
    }
  }
  return false;
}

async function importedModuleUsesHook(source, importerFile, hookName) {
  for (const match of source.matchAll(/^import[\s\S]*?from\s+['"](\.[^'"]+)['"]/gm)) {
    const base = path.resolve(path.dirname(rel(...importerFile.split('/'))), match[1]);
    for (const candidate of [base, `${base}.js`, `${base}.jsx`, path.join(base, 'index.js'), path.join(base, 'index.jsx')]) {
      try {
        const imported = await readFile(candidate, 'utf8');
        if (new RegExp(`\\b${hookName}\\s*\\(`).test(imported)) return true;
        break;
      } catch {
        // Try the next conventional extension.
      }
    }
  }
  return false;
}

async function inspectHtml(file, text) {
  const route = currentHtmlContext?.route ?? null;
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
    const nearby = text.slice(Math.max(0, match.index - 700), Math.min(text.length, match.index + 700));
    const storageProbe = /localStorage\s*\.\s*setItem\s*\(/.test(nearby)
      && /localStorage\s*\.\s*removeItem\s*\(/.test(nearby)
      && /return\s+localStorage\b/.test(nearby)
      && /try\s*\{[\s\S]*catch\s*[({]/.test(nearby);
    const allowed = storageProbe || (/SAFE_LS|safeLS|storage(?:Available|Test)|__.*(?:test|probe)/i.test(nearby)
      && /try\s*\{|catch\s*[({]/.test(nearby));
    if (!allowed) {
      const callTail = text.slice(match.index + match[0].length, match.index + match[0].length + 160);
      const literalKey = callTail.match(/^\s*(['"])(.*?)\1/);
      const severity = literalKey && !/(?:test|probe|available)/i.test(literalKey[2]) ? 'error' : 'warning';
      const certainty = severity === 'error' ? '' : '可能性があります: ';
      issue(severity, 'STORAGE', file, `${certainty}ゲーム HTML から localStorage.${match[1]} を直接使用しています`, { text, index: match.index });
    }
  }

  const bgmNews = allMatches(text, /new\s+WakuwakuBGM\s*\(/g);
  const loaded = /<script\b[^>]*\bsrc\s*=\s*['"][^'"]*wakuwaku_bgm\.js['"]/i.test(text);
  for (const bgmNew of bgmNews) {
    const functionStart = Math.max(text.lastIndexOf('function ', bgmNew.index), text.lastIndexOf('=>', bgmNew.index));
    const localPrefix = text.slice(Math.max(0, functionStart), bgmNew.index);
    const guarded = /typeof\s+WakuwakuBGM\s*!==?\s*['"]undefined['"]/.test(localPrefix)
      || /typeof\s+WakuwakuBGM\s*===?\s*['"]undefined['"][\s\S]{0,120}?return\b/.test(localPrefix)
      || /if\s*\(\s*(?:window\.)?WakuwakuBGM\s*\)/.test(localPrefix);
    if (!guarded) issue('error', 'BGM', file, 'WakuwakuBGM を存在確認ガードなしで生成しています', { text, index: bgmNew.index });
    if (!loaded) issue('error', 'BGM', file, 'WakuwakuBGM を共有ライブラリの読込なしで使用しています', { text, index: bgmNew.index });
  }

  // goBack はゲーム内マップ等の内部ナビと、goHome はトップへの直行と対応する。
  // どちらも useGameNav（親側 message ハンドラ）が正式に受理する型なので、
  // 一方だけの実装でも親通信フォールバックとして有効とみなす。
  const hasGoBack = /postMessage\s*\(\s*\{[\s\S]{0,160}?type\s*:\s*['"](?:goBack|goHome)['"]/.test(text);
  if (!hasGoBack) {
    issue('warning', 'NAV', file, '親ページへ goBack/goHome メッセージを送る実装を確認できません');
  }
  const executableJavaScript = maskExecutableJavaScript(text);
  for (const match of executableJavaScript.matchAll(/\bhistory\.back\s*\(/g)) {
    if (!isGuardedStandaloneHistoryBack(text, executableJavaScript, match.index)) {
      issue('warning', 'NAV', file, 'history.back() に依存する戻る操作があります', { text, index: match.index });
    }
  }
  for (const match of executableJavaScript.matchAll(/location(?:\.href)?\s*=\s*['"]\/?['"]/g)) {
    if (!isGuardedStandaloneLocationAssign(text, executableJavaScript, match.index)) {
      issue('warning', 'NAV', file, 'location 代入に依存する戻る操作があります', { text, index: match.index });
    }
  }
  for (const match of text.matchAll(/parent\.(?:location|document|history)\b/g)) {
    issue('warning', 'NAV', file, '親ページを直接操作しています', { text, index: match.index });
  }

  const safeAreaLoaded = /\/games\/safe_area\.js/.test(text);
  // position:fixed だけでは判定しない。inset:0 の全画面センタリング用途と、
  // 実際に上下端へ張り付く固定UI（top:/bottom: を持つ）を区別する。
  const fixedRuleBodies = [...text.matchAll(/\{([^{}]*)\}/g)]
    .map((m) => m[1])
    .filter((body) => /position\s*:\s*fixed/i.test(body));
  const hasFixedTopUi = fixedRuleBodies.some((body) => /\btop\s*:/i.test(body));
  const hasFixedBottomUi = fixedRuleBodies.some((body) => /\bbottom\s*:/i.test(body));
  const fixedUi = (hasFixedTopUi || hasFixedBottomUi) && /<(?:button|div|header|nav)\b/i.test(text);
  if (fixedUi && !safeAreaLoaded) issue('warning', 'SAFE_AREA', file, '固定 UI がありますが safe_area.js の読込を確認できません');
  if (safeAreaLoaded && !/--sa[trbl]\b/.test(text)) {
    issue('warning', 'SAFE_AREA', file, 'safe_area.js を読み込んでいますが safe-area CSS 変数を使用していません');
  } else if (safeAreaLoaded) {
    if (hasFixedTopUi && !/--sat\b/.test(text)) issue('warning', 'SAFE_AREA', file, 'safe_area.js を読み込んでいますが --sat を使用していません');
    if (hasFixedBottomUi && !/--sab\b/.test(text)) issue('warning', 'SAFE_AREA', file, 'safe_area.js を読み込んでいますが --sab を使用していません');
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
try { previousReport = JSON.parse(await read('reports/game-audit.json')); } catch { previousReport = null; }
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
  // <GameWithSEO> でラップされていないRouteは、構造上そもそも正規／エイリアス
  // (gameMeta連携)の対象外であり、判定不能ではなく「対象外」である。
  const usesGameWithSEO = /<GameWithSEO\b/.test(route.line);
  if (usesGameWithSEO && !route.canonical) {
    issue('warning', 'REGISTRY', appFile, '正規ルートかエイリアスかを判定できない App Route です', { route: route.path, text: appText, index: route.index });
  }
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
    const numIsConsumed = /\b(?:game|g)\.num\b/.test(topText);
    issue(numIsConsumed ? 'error' : 'warning', 'REGISTRY', topFile, `${list} の num "${value}" が ${values.length} 回使われています${numIsConsumed ? '' : 'が、現在のUIから参照されていません'}`, { route: values[0].route, text: topText, index: values[1].index });
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
const componentPaths = new Map();
for (const appImport of app.imports) {
  const filename = `${path.basename(appImport.module, '.jsx')}.jsx`;
  const routes = app.routes.filter((route) => route.components.includes(appImport.component) && route.canonical).map((route) => route.canonical);
  const paths = app.routes.filter((route) => route.components.includes(appImport.component)).map((route) => route.path);
  componentRoutes.set(filename, new Set(routes));
  componentPaths.set(filename, new Set(paths));
}
for (const name of wrapperNames) {
  const file = `src/games/${name}`;
  const text = await read(file);
  const iframe = text.match(/<iframe\b[\s\S]*?>/i);
  const iframeSrcMatch = iframe?.[0].match(/\bsrc\s*=\s*['"]([^'"]+)['"]/i);
  const gameContentMatch = text.match(/<GameContent\b[^>]*\broute\s*=\s*['"]([^'"]+)['"]/i);
  const iframeSrc = iframeSrcMatch?.[1] ?? null;
  const expectedRoutes = componentRoutes.get(name) ?? new Set();
  const appPaths = componentPaths.get(name) ?? new Set();
  const gameRoute = gameContentMatch?.[1] ?? (expectedRoutes.size === 1 ? [...expectedRoutes][0] : (appPaths.size === 1 ? [...appPaths][0] : null));
  wrappers.push({ file, component: path.basename(name, '.jsx'), route: gameRoute, iframeSrc, appPaths: [...appPaths] });
  if (!iframe) continue;
  const iframeIndex = iframe.index ?? text.indexOf('<iframe');
  if (!iframeSrc) issue('error', 'WRAPPER', file, 'iframe の src を静的に取得できません', { route: gameRoute, text, index: iframeIndex });
  else {
    const diskPath = iframeSrc.startsWith('/') ? rel('public', ...iframeSrc.slice(1).split('/')) : rel('public', 'games', iframeSrc);
    try { await stat(diskPath); } catch { issue('error', 'WRAPPER', file, `iframe の参照先 ${iframeSrc} が存在しません`, { route: gameRoute, text, index: iframeIndex }); }
  }
  if (gameContentMatch && gameRoute && !metaRoutes.has(gameRoute)) issue('error', 'WRAPPER', file, 'GameContent route が gameMeta の正規ルートに存在しません', { route: gameRoute, text, index: gameContentMatch.index });
  if (gameContentMatch && gameRoute && expectedRoutes.size && !expectedRoutes.has(gameRoute)) issue('error', 'WRAPPER', file, 'GameContent route が App の正規ルートと一致しません', { route: gameRoute, text, index: gameContentMatch.index });
  const equivalentNav = /addEventListener\s*\(\s*['"]message['"]/.test(text)
    && /type\s*===?\s*['"]goBack['"]/.test(text)
    && /\bnavigate\s*\(/.test(text);
  const hasImportedNav = await importedModuleUsesHook(text, file, 'useGameNav');
  if (!/\buseGameNav\s*\(/.test(text) && !equivalentNav && !hasImportedNav) {
    issue('warning', 'WRAPPER', file, 'useGameNav または同等の親ナビゲーション処理を確認できません', { route: gameRoute });
  }
  const hasImportedBridge = await importedModuleUsesHook(text, file, 'useIframeBridge');
  if (!/\buseIframeBridge\s*\(/.test(text) && !hasImportedBridge) issue('warning', 'WRAPPER', file, 'useIframeBridge の実装を1段階追跡しても確認できません', { route: gameRoute });
  if (!/\bref\s*=\s*\{[^}]+\}/.test(iframe[0])) issue('error', 'WRAPPER', file, 'iframe ref を確認できません', { route: gameRoute, text, index: iframeIndex });
  const allow = iframe[0].match(/\ballow\s*=\s*['"]([^'"]+)['"]/i)?.[1] ?? '';
  if (!/autoplay/i.test(allow) || !/fullscreen/i.test(allow)) issue('error', 'WRAPPER', file, 'iframe の allow に autoplay と fullscreen が揃っていません', { route: gameRoute, text, index: iframeIndex });
  if (!/\bsandbox\s*=/.test(iframe[0])) issue('error', 'WRAPPER', file, 'iframe に sandbox 属性がありません', { route: gameRoute, text, index: iframeIndex });
}

const htmlNames = (await readdir(rel('public', 'games'))).filter((name) => name.endsWith('.html')).sort();
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
    html: wrapper?.iframeSrc ? `public${wrapper.iframeSrc}` : null,
    status: 'active',
    htmlExists: wrapper?.iframeSrc ? htmlNames.includes(path.posix.basename(wrapper.iframeSrc)) : false,
  };
});

const activeHtml = new Map();
for (const game of games) {
  if (game.html) activeHtml.set(game.html, { route: game.route, wrapper: game.wrapper });
}
const secondaryHtml = new Map();
for (const wrapper of wrappers) {
  if (!wrapper.iframeSrc) continue;
  const html = `public${wrapper.iframeSrc}`;
  if (!activeHtml.has(html)) secondaryHtml.set(html, { route: wrapper.route, wrapper: wrapper.file });
}
const htmlFiles = htmlNames.map((name) => {
  const html = `public/games/${name}`;
  const active = activeHtml.get(html);
  const secondary = secondaryHtml.get(html);
  return {
    status: active ? 'active' : (secondary ? 'referenced-secondary' : 'archived-or-unused'),
    route: active?.route ?? secondary?.route ?? null,
    wrapper: active?.wrapper ?? secondary?.wrapper ?? null,
    html,
  };
});
for (const entry of htmlFiles) {
  currentHtmlContext = entry;
  await inspectHtml(entry.html, await read(entry.html));
}
currentHtmlContext = null;

const activeWrappers = new Set(games.map((game) => game.wrapper).filter(Boolean));
const secondaryWrappers = new Set(wrappers.filter((wrapper) => !metaRoutes.has(wrapper.route)).map((wrapper) => wrapper.file));
for (const item of [...errors, ...warnings]) {
  if (item.status) continue;
  if (item.route && metaRoutes.has(item.route)) item.status = 'active';
  else if (activeWrappers.has(item.file)) item.status = 'active';
  else if (secondaryWrappers.has(item.file) || (item.route && app.routes.some((route) => route.path === item.route))) item.status = 'referenced-secondary';
  else if (item.category === 'REGISTRY') item.status = 'active';
}
for (let index = errors.length - 1; index >= 0; index -= 1) {
  const item = errors[index];
  if (item.status && item.status !== 'active') {
    errors.splice(index, 1);
    item.severity = 'warning';
    warnings.push(item);
  }
}

const activeIssues = [...errors, ...warnings].filter((item) => item.status === 'active');
const activeErrors = activeIssues.filter((item) => item.severity === 'error');
const activeWarnings = activeIssues.filter((item) => item.severity === 'warning');
const activeStorageErrors = activeErrors.filter((item) => item.category === 'STORAGE');
const activeStorageWarnings = activeWarnings.filter((item) => item.category === 'STORAGE');
const activeStorageFiles = new Set([...activeStorageErrors, ...activeStorageWarnings].map((item) => item.file));
const htmlIssues = [...errors, ...warnings].filter((item) => item.file.startsWith('public/games/'));
const allHtmlReferenceErrors = htmlIssues.filter((item) => item.referenceSeverity === 'error');
const allHtmlReferenceWarnings = htmlIssues.filter((item) => item.referenceSeverity === 'warning');
const archivedIssues = htmlIssues.filter((item) => item.status === 'archived-or-unused');
const archivedReferenceErrors = archivedIssues.filter((item) => item.referenceSeverity === 'error');
const archivedReferenceWarnings = archivedIssues.filter((item) => item.referenceSeverity === 'warning');

const summary = {
  gameMetaRoutes: metaRoutes.size,
  appRoutes: canonicalAppRoutes.size,
  gameRoutesSet: new Set(app.gameRoutesSet).size,
  topPageGames: topGames.length,
  wrappers: wrapperNames.length,
  htmlGames: htmlNames.length,
  activeHtml: htmlFiles.filter((entry) => entry.status === 'active').length,
  referencedSecondaryHtml: htmlFiles.filter((entry) => entry.status === 'referenced-secondary').length,
  archivedOrUnusedHtml: htmlFiles.filter((entry) => entry.status === 'archived-or-unused').length,
  activeErrors: activeErrors.length,
  activeWarnings: activeWarnings.length,
  activeLocalStorageErrors: activeStorageErrors.length,
  activeLocalStorageWarnings: activeStorageWarnings.length,
  activeLocalStorageProblemFiles: activeStorageFiles.size,
  allHtmlReferenceErrors: allHtmlReferenceErrors.length,
  allHtmlReferenceWarnings: allHtmlReferenceWarnings.length,
  archivedReferenceErrors: archivedReferenceErrors.length,
  archivedReferenceWarnings: archivedReferenceWarnings.length,
  errors: errors.length,
  warnings: warnings.length,
};
const priorSummary = previousReport?.summary ?? {};
const priorErrors = previousReport?.errors ?? [];
const priorWarnings = previousReport?.warnings ?? [];
const isPriorActive = (item) => activeHtml.has(item.file)
  || activeWrappers.has(item.file)
  || (item.route && metaRoutes.has(item.route))
  || (item.category === 'REGISTRY' && !item.route);
const inheritedBaseline = previousReport?.baseline;
const baseline = inheritedBaseline ?? {
  phase1Errors: priorSummary.errors ?? null,
  phase1Warnings: priorSummary.warnings ?? null,
  phase1ActiveErrors: priorErrors.filter(isPriorActive).length,
  phase1ActiveWarnings: priorWarnings.filter(isPriorActive).length,
  phase2PreFixActiveErrors: summary.activeErrors,
  phase2PreFixActiveWarnings: summary.activeWarnings,
};
const comparison = {
  falsePositivesResolved: Math.max(0, (baseline.phase1ActiveErrors ?? summary.activeErrors) - (baseline.phase2PreFixActiveErrors ?? summary.activeErrors)),
  actualFixesResolved: Math.max(0, (baseline.phase2PreFixActiveErrors ?? summary.activeErrors) - summary.activeErrors),
  remainingActiveErrors: summary.activeErrors,
};
const previousIssues = [...priorErrors, ...priorWarnings];
const previousActiveStorageErrors = previousIssues.filter((item) => item.status === 'active' && item.category === 'STORAGE' && item.severity === 'error');
const previousActiveStorageWarnings = previousIssues.filter((item) => item.status === 'active' && item.category === 'STORAGE' && item.severity === 'warning');
const phase3aBaseline = previousReport?.phase3aBaseline ?? {
  activeLocalStorageErrors: previousActiveStorageErrors.length,
  activeLocalStorageWarnings: previousActiveStorageWarnings.length,
  activeLocalStorageProblemFiles: new Set([...previousActiveStorageErrors, ...previousActiveStorageWarnings].map((item) => item.file)).size,
};
if (baseline.phase2PostFixActiveErrors == null) {
  baseline.phase2PostFixActiveErrors = phase3aBaseline.activeLocalStorageErrors
    + (summary.activeErrors - activeStorageErrors.length);
}
comparison.actualFixesResolved = Math.max(0,
  (baseline.phase2PreFixActiveErrors ?? baseline.phase2PostFixActiveErrors)
    - baseline.phase2PostFixActiveErrors);
const localStorage = {
  active: {
    errorFiles: new Set(activeStorageErrors.map((item) => item.file)).size,
    errorOccurrences: activeStorageErrors.length,
    warningFiles: new Set(activeStorageWarnings.map((item) => item.file)).size,
    warningOccurrences: activeStorageWarnings.length,
    problemFiles: activeStorageFiles.size,
  },
  phase3a: {
    preFixErrors: phase3aBaseline.activeLocalStorageErrors,
    fixedOccurrences: Math.max(0, phase3aBaseline.activeLocalStorageErrors - activeStorageErrors.length),
    remainingErrors: activeStorageErrors.length,
    remainingWarnings: activeStorageWarnings.length,
    remainingProblemFiles: activeStorageFiles.size,
  },
};
const report = { generatedAt: new Date().toISOString(), baseline, phase3aBaseline, comparison, localStorage, summary, errors, warnings, games, htmlFiles };
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
console.log(`- active HTML: ${summary.activeHtml}`);
console.log(`- referenced-secondary HTML: ${summary.referencedSecondaryHtml}`);
console.log(`- archived-or-unused HTML: ${summary.archivedOrUnusedHtml}`);
console.log(`- active errors: ${summary.activeErrors}`);
console.log(`- active warnings: ${summary.activeWarnings}`);
console.log(`- active localStorage errors: ${summary.activeLocalStorageErrors} in ${localStorage.active.errorFiles} files`);
console.log(`- active localStorage warnings: ${summary.activeLocalStorageWarnings} in ${localStorage.active.warningFiles} files`);
console.log(`- all HTML reference errors: ${summary.allHtmlReferenceErrors}`);
console.log(`- all HTML reference warnings: ${summary.allHtmlReferenceWarnings}`);
console.log('\nPhase comparison');
console.log(`- Phase 1 active-equivalent errors: ${baseline.phase1ActiveErrors}`);
console.log(`- Phase 2 pre-fix active errors: ${baseline.phase2PreFixActiveErrors}`);
console.log(`- Phase 2 post-fix active errors: ${baseline.phase2PostFixActiveErrors}`);
console.log(`- resolved as false positives: ${comparison.falsePositivesResolved}`);
console.log(`- resolved by P0 fixes: ${comparison.actualFixesResolved}`);
console.log('\nPhase 3A storage comparison');
console.log(`- pre-fix active localStorage errors: ${localStorage.phase3a.preFixErrors}`);
console.log(`- fixed localStorage occurrences: ${localStorage.phase3a.fixedOccurrences}`);
console.log(`- remaining active localStorage errors: ${localStorage.phase3a.remainingErrors}`);
console.log(`- remaining active localStorage warnings: ${localStorage.phase3a.remainingWarnings}`);
console.log(`- remaining localStorage problem files: ${localStorage.phase3a.remainingProblemFiles}`);
for (const [heading, items] of [['ERRORS', errors], ['WARNINGS', warnings]]) {
  console.log(`\n${heading} (${items.length})`);
  if (!items.length) console.log('- none');
  for (const item of items) {
    const where = [item.file, item.line ? `:${item.line}` : '', item.route ? ` (${item.route})` : ''].join('');
    console.log(`[${item.category}] ${where}: ${item.message}`);
  }
}
console.log(`\nResult: ${activeErrors.length ? 'FAILED' : 'PASSED'}`);
process.exitCode = activeErrors.length ? 1 : 0;
