import { renderToString } from "react-dom/server";
import { Route, Routes, StaticRouter, useLocation, useNavigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/seo/GameSEO.jsx
var BASE = "https://wakuwaku-island.pages.dev";
function GameSEO({ route, name, desc, category }) {
	const url = `${BASE}${route}`;
	const title = `${name}｜わくわくアイランド`;
	const ld = {
		"@context": "https://schema.org",
		"@type": "VideoGame",
		name,
		description: desc,
		url,
		genre: category,
		inLanguage: "ja",
		applicationCategory: "Game",
		operatingSystem: "Web Browser",
		gamePlatform: "Web Browser",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "JPY"
		},
		audience: {
			"@type": "PeopleAudience",
			suggestedMinAge: 4,
			suggestedMaxAge: 12
		},
		isAccessibleForFree: true,
		publisher: {
			"@type": "Organization",
			name: "わくわくアイランド"
		}
	};
	return /* @__PURE__ */ jsxs(Helmet, { children: [
		/* @__PURE__ */ jsx("title", { children: title }),
		/* @__PURE__ */ jsx("meta", {
			name: "description",
			content: desc
		}),
		/* @__PURE__ */ jsx("link", {
			rel: "canonical",
			href: url
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:title",
			content: title
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:description",
			content: desc
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:url",
			content: url
		}),
		/* @__PURE__ */ jsx("meta", {
			property: "og:image",
			content: `${BASE}/og-image.png`
		}),
		/* @__PURE__ */ jsx("script", {
			type: "application/ld+json",
			children: JSON.stringify(ld)
		})
	] });
}
//#endregion
//#region src/seo/gameMeta.js
var GAME_META = {
	"/shabondama": {
		name: "シャボンだまポン",
		desc: "とんでくるシャボン玉をタップして割ろう！",
		category: "アクション"
	},
	"/kudamono-catch": {
		name: "くだものキャッチ",
		desc: "おちてくるくだものをキャッチしよう！",
		category: "アクション"
	},
	"/meiro": {
		name: "めいろあそび",
		desc: "めいろをとおってゴールをめざせ！",
		category: "パズル"
	},
	"/doubutsu-puzzle": {
		name: "どうぶつパズル",
		desc: "どうぶつをならべてパズルをとこう！",
		category: "パズル"
	},
	"/kazu-asobi": {
		name: "かずあそび",
		desc: "かずをかぞえてたのしくまなぼう！",
		category: "かずあそび"
	},
	"/animal-soccer": {
		name: "どうぶつサッカー",
		desc: "どうぶつたちとサッカーをしよう！",
		category: "アクション"
	},
	"/sushi": {
		name: "さーもん",
		desc: "かいてんずし！サーモンだけタップしよう！",
		category: "アクション"
	},
	"/ichigo": {
		name: "いちご",
		desc: "30びょうでいちごをあつめよう！",
		category: "アクション"
	},
	"/kakurenbo": {
		name: "どうぶつかくれんぼ",
		desc: "くさむらやきのうらにどうぶつがかくれているよ！",
		category: "パズル"
	},
	"/moji": {
		name: "もじあそび",
		desc: "えをみてただしいひらがなをえらんでね！",
		category: "もじあそび"
	},
	"/tashizan": {
		name: "たしざんゲーム",
		desc: "どうぶつをかぞえてこたえをえらんでね！",
		category: "かずあそび"
	},
	"/iro": {
		name: "いろあわせ",
		desc: "いろをまぜるとなんいろになるかな？",
		category: "パズル"
	},
	"/machi": {
		name: "わくわくまちづくり",
		desc: "じぶんだけのすてきなまちをつくろう！",
		category: "そうぞう"
	},
	"/kokki": {
		name: "こっきクイズ",
		desc: "せかいのこっきをみわけよう！30かこく以上！",
		category: "クイズ"
	},
	"/jewelry-master": {
		name: "ジュエリーマスター",
		desc: "おきゃくさんのリクエストにこたえてほうせきをえらぼう！",
		category: "そうぞう"
	},
	"/tetris": {
		name: "どうぶつブロック",
		desc: "ブロックをならべてラインをけそう！テトリス風ゲーム！",
		category: "パズル"
	},
	"/runner": {
		name: "どうぶつランナー",
		desc: "タップでジャンプ！2かいジャンプもできるよ！障害物をよけて走れ！",
		category: "レース"
	},
	"/shooting": {
		name: "どうぶつシューティング",
		desc: "てきをたおしてボスをやっつけろ！",
		category: "アクション"
	},
	"/sniper": {
		name: "どうぶつスナイパー",
		desc: "うごくどうぶつをタップでねらえ！フェイクに注意！",
		category: "アクション"
	},
	"/crossing": {
		name: "どうぶつクロッシング",
		desc: "みちをわたってどこまでいけるかな？くるまに気をつけて！",
		category: "レース"
	},
	"/mori": {
		name: "もりのなかまたち",
		desc: "もりをとびこえてゴールをめざせ！",
		category: "アクション"
	},
	"/sora": {
		name: "そらとびプリンセス",
		desc: "そらをとんでてきをたおそう！",
		category: "アクション"
	},
	"/bike": {
		name: "わくわくバイク",
		desc: "バイクでコースをはしりぬけろ！",
		category: "レース"
	},
	"/kart": {
		name: "アニマルカートGP",
		desc: "6ひきのどうぶつでレース！スーファミ風の3Dカートゲーム。",
		category: "レース"
	}
};
//#endregion
//#region src/utils/audio.js
var _ctx = null;
function _getCtx() {
	if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
	return _ctx;
}
var isMuted = typeof localStorage !== "undefined" && localStorage.getItem("wakuwaku_muted") === "1";
var _loop = null;
var _freqCache = {};
function _noteFreq(name) {
	if (_freqCache[name]) return _freqCache[name];
	const m = name.match(/^([A-G])(#|b)?(\d)$/);
	if (!m) return 440;
	const base = {
		C: 0,
		D: 2,
		E: 4,
		F: 5,
		G: 7,
		A: 9,
		B: 11
	}[m[1]];
	const acc = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
	const midi = (parseInt(m[3]) + 1) * 12 + base + acc;
	_freqCache[name] = 440 * Math.pow(2, (midi - 69) / 12);
	return _freqCache[name];
}
var BEAT = .5;
function _durSecs(dur) {
	if (!dur) return BEAT;
	const dotted = dur.endsWith("+") || dur.endsWith(".");
	const m = dur.replace(/[+.]/g, "").match(/^(\d+)n$/);
	if (!m) return BEAT;
	const secs = 4 / parseInt(m[1]) * BEAT;
	return dotted ? secs * 1.5 : secs;
}
var BGM_GAIN = .08;
var SE_GAIN = .2;
function _schedNotes(ctx, steps, type, gain) {
	const now = ctx.currentTime;
	steps.forEach(({ note, dur, t }) => {
		const freq = _noteFreq(note);
		const ds = _durSecs(dur);
		const osc = ctx.createOscillator();
		const env = ctx.createGain();
		osc.type = type;
		osc.frequency.value = freq;
		osc.connect(env);
		env.connect(ctx.destination);
		const st = now + t;
		const en = st + ds;
		env.gain.setValueAtTime(0, st);
		env.gain.linearRampToValueAtTime(gain, st + .02);
		env.gain.setValueAtTime(gain * .55, en - .04);
		env.gain.linearRampToValueAtTime(0, en + .08);
		osc.start(st);
		osc.stop(en + .12);
	});
}
function _cancelLoop() {
	if (_loop) {
		_loop.active = false;
		clearTimeout(_loop.timeout);
		_loop = null;
	}
}
var _bgmPaused = false;
function _pauseBgm() {
	if (!_loop) return;
	_bgmPaused = true;
	clearTimeout(_loop.timeout);
	if (_ctx) _ctx.suspend().catch(() => {});
}
function _resumeBgm() {
	if (isMuted || !_loop?.active || !_bgmPaused) return;
	_bgmPaused = false;
	if (!_ctx) return;
	_ctx.resume().then(() => {
		if (!_loop?.active || document.hidden || isMuted) return;
		const { steps, loopDuration, type } = _loop;
		_schedNotes(_ctx, steps, type, BGM_GAIN);
		function tick() {
			if (!_loop?.active || document.hidden || isMuted || _bgmPaused) return;
			_schedNotes(_ctx, _loop.steps, _loop.type, BGM_GAIN);
			_loop.timeout = setTimeout(tick, _loop.loopDuration * 1e3);
		}
		_loop.timeout = setTimeout(tick, loopDuration * 1e3);
	}).catch(() => {});
}
function _startBgmLoop(steps, loopDuration, type) {
	_cancelLoop();
	_bgmPaused = false;
	const ctx = _getCtx();
	const loop = {
		steps,
		loopDuration,
		type,
		active: true,
		timeout: null
	};
	_loop = loop;
	function tick() {
		if (!loop.active) return;
		if (document.hidden || isMuted || _bgmPaused) return;
		if (ctx.state !== "running") return;
		_schedNotes(ctx, loop.steps, loop.type, BGM_GAIN);
		loop.timeout = setTimeout(tick, loop.loopDuration * 1e3);
	}
	tick();
}
function _bgm(steps, loopDuration, type) {
	if (isMuted) return;
	const ctx = _getCtx();
	if (ctx.state === "running") _startBgmLoop(steps, loopDuration, type);
	else if (ctx.state === "suspended") ctx.resume().then(() => _startBgmLoop(steps, loopDuration, type)).catch(() => {});
}
if (typeof document !== "undefined") {
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) _pauseBgm();
		else _resumeBgm();
	});
	window.addEventListener("pagehide", (e) => {
		if (e.persisted) _pauseBgm();
		else {
			_cancelLoop();
			try {
				if (_ctx) {
					_ctx.close();
					_ctx = null;
				}
			} catch (e) {}
		}
	});
	window.addEventListener("blur", () => {
		setTimeout(() => {
			if (document.hidden) _pauseBgm();
		}, 200);
		_pauseBgm();
	});
	window.addEventListener("focus", () => {
		if (!document.hidden) _resumeBgm();
	});
	window.addEventListener("beforeunload", () => {
		_cancelLoop();
		if (_ctx) {
			try {
				_ctx.close();
			} catch (e) {}
			_ctx = null;
		}
	});
}
var _bgmAudio = null;
function startBGM() {
	if (_bgmAudio) return;
	_bgmAudio = new Audio("/games/Sandcastle_Parade.mp3");
	_bgmAudio.loop = true;
	_bgmAudio.volume = .35;
	_bgmAudio.play().catch(() => {});
}
function stopBGM() {
	if (_bgmAudio) {
		_bgmAudio.pause();
		_bgmAudio.currentTime = 0;
		_bgmAudio = null;
	}
}
function toggleBGM() {
	if (!_bgmAudio || _bgmAudio.paused) if (!_bgmAudio) startBGM();
	else _bgmAudio.play().catch(() => {});
	else _bgmAudio.pause();
}
async function ensureAudioStarted() {
	if (_ctx && _ctx.state === "closed") {
		_ctx = null;
		_cancelLoop();
	}
	const ctx = _getCtx();
	if (ctx.state === "suspended") try {
		await ctx.resume();
	} catch (e) {}
	if (ctx.state !== "running") {
		await new Promise((r) => setTimeout(r, 80));
		if (ctx.state === "suspended") await ctx.resume().catch(() => {});
	}
}
function toggleMute() {
	isMuted = !isMuted;
	localStorage.setItem("wakuwaku_muted", isMuted ? "1" : "0");
	console.log("[Audio] mute toggled:", isMuted);
	if (isMuted) {
		_cancelLoop();
		if (_ctx) _ctx.suspend().catch(() => {});
	} else {
		_bgmPaused = false;
		if (_ctx && _ctx.state === "suspended") _ctx.resume().catch(() => {});
	}
	return isMuted;
}
function getMuteState() {
	return isMuted;
}
function stopBgm() {
	_cancelLoop();
	_bgmPaused = false;
	stopBGM();
}
function triggerFlash(color = "rgba(255,230,50,0.45)") {
	const el = document.createElement("div");
	el.style.cssText = `position:fixed;inset:0;background:${color};pointer-events:none;z-index:9999;animation:ww-flash 0.35s forwards`;
	document.body.appendChild(el);
	setTimeout(() => {
		if (el.parentNode) el.remove();
	}, 400);
}
function playMeiroBgm() {
	console.log("[Audio] playMeiroBgm");
	_bgm([
		{
			note: "A4",
			dur: "4n",
			t: 0
		},
		{
			note: "C5",
			dur: "8n",
			t: .6
		},
		{
			note: "E5",
			dur: "4n",
			t: 1
		},
		{
			note: "C5",
			dur: "8n",
			t: 1.6
		},
		{
			note: "A4",
			dur: "8n",
			t: 2
		},
		{
			note: "G4",
			dur: "4n",
			t: 2.4
		},
		{
			note: "F4",
			dur: "8n",
			t: 3
		},
		{
			note: "E4",
			dur: "4n",
			t: 3.4
		},
		{
			note: "G4",
			dur: "8n",
			t: 4
		},
		{
			note: "B4",
			dur: "4n",
			t: 4.4
		},
		{
			note: "A4",
			dur: "2n",
			t: 5
		}
	], 6, "sine");
}
function _se(notes, type, gain = SE_GAIN) {
	if (isMuted) return;
	const ctx = _getCtx();
	if (ctx.state !== "running") return;
	const now = ctx.currentTime;
	notes.forEach(({ note, dur, t }) => {
		const freq = _noteFreq(note);
		const ds = _durSecs(dur);
		const osc = ctx.createOscillator();
		const env = ctx.createGain();
		osc.type = type;
		osc.frequency.value = freq;
		osc.connect(env);
		env.connect(ctx.destination);
		const st = now + t;
		const en = st + ds;
		env.gain.setValueAtTime(0, st);
		env.gain.linearRampToValueAtTime(gain, st + .01);
		env.gain.linearRampToValueAtTime(0, en + .05);
		osc.start(st);
		osc.stop(en + .08);
	});
}
function playSoundCorrect() {
	_se([
		{
			note: "C5",
			dur: "32n",
			t: 0
		},
		{
			note: "E5",
			dur: "32n",
			t: .05
		},
		{
			note: "G5",
			dur: "32n",
			t: .1
		},
		{
			note: "C6",
			dur: "16n",
			t: .15
		}
	], "sine");
	triggerFlash();
}
//#endregion
//#region src/utils/transition.js
var STAR_EMOJIS = [
	"⭐",
	"🌟",
	"✨",
	"💫"
];
/**
* Top → Game transition: gold disc expands from click point + star burst (600ms)
*/
function transitionTo(navigate, path, cx, cy) {
	if (window._wwTransitioning) return;
	window._wwTransitioning = true;
	const x = cx ?? window.innerWidth / 2;
	const y = cy ?? window.innerHeight / 2;
	const w = window.innerWidth;
	const h = window.innerHeight;
	const maxDist = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
	const overlay = document.createElement("div");
	overlay.style.cssText = "position:fixed;inset:0;z-index:99999;pointer-events:all;overflow:hidden;";
	document.body.appendChild(overlay);
	const DISC_SIZE = 8;
	const discScale = Math.ceil(maxDist * 2.5 / DISC_SIZE);
	const disc = document.createElement("div");
	disc.style.cssText = `position:absolute;border-radius:50%;will-change:transform,opacity;background:radial-gradient(circle,#FFF176 0%,#FFE033 35%,#FF8C00 100%);width:${DISC_SIZE}px;height:${DISC_SIZE}px;left:${x - DISC_SIZE / 2}px;top:${y - DISC_SIZE / 2}px;--scale:${discScale};animation:ww-gold-expand 0.65s cubic-bezier(0.2,0.8,0.2,1) 0.05s both;`;
	overlay.appendChild(disc);
	const COUNT = 22;
	for (let i = 0; i < COUNT; i++) {
		const angle = i / COUNT * Math.PI * 2;
		const dist = maxDist * (.75 + Math.random() * .4);
		const el = document.createElement("div");
		el.style.cssText = `position:absolute;pointer-events:none;will-change:transform,opacity;line-height:1;left:${x}px;top:${y}px;font-size:${(14 + Math.random() * 14).toFixed(0)}px;--dx:${(Math.cos(angle) * dist).toFixed(1)}px;--dy:${(Math.sin(angle) * dist).toFixed(1)}px;--rot:${(Math.random() * 360).toFixed(0)}deg;animation:ww-star-burst 0.55s cubic-bezier(0.25,0.46,0.45,0.94) ${(i * .018).toFixed(3)}s both;`;
		el.textContent = STAR_EMOJIS[i % STAR_EMOJIS.length];
		overlay.appendChild(el);
	}
	setTimeout(() => {
		navigate(path);
		setTimeout(() => {
			if (overlay.parentNode) overlay.remove();
			window._wwTransitioning = false;
		}, 200);
	}, 600);
}
/**
* Game → Top transition: blue wave rises from bottom (500ms)
*/
function transitionBack(navigate) {
	if (window._wwTransitioning) return;
	window._wwTransitioning = true;
	const overlay = document.createElement("div");
	overlay.style.cssText = "position:fixed;inset:0;z-index:99999;pointer-events:all;overflow:hidden;";
	document.body.appendChild(overlay);
	const wave = document.createElement("div");
	wave.style.cssText = "position:absolute;inset:0;will-change:transform;animation:ww-wave-rise 0.5s cubic-bezier(0.22,1,0.36,1) both;";
	wave.innerHTML = "<svg viewBox=\"0 0 200 40\" preserveAspectRatio=\"none\" style=\"position:absolute;top:-36px;left:-1%;width:102%;height:40px;display:block;fill:#29b6f6;\"><path d=\"M0,40 C40,5 80,30 120,12 C160,-5 180,28 200,40 Z\"/></svg><div style=\"position:absolute;inset:0;background:linear-gradient(180deg,#29b6f6 0%,#0277bd 100%);\"></div>";
	overlay.appendChild(wave);
	setTimeout(() => {
		navigate("/");
		setTimeout(() => {
			if (overlay.parentNode) overlay.remove();
			window._wwTransitioning = false;
		}, 200);
	}, 500);
}
//#endregion
//#region src/utils/playCounter.js
/**
* 累計プレイカウンター
* 各ゲームのスタート時に呼ばれ、localStorageで通算プレイ数を管理する
*/
var KEY$1 = "wakuwaku_total_plays";
/** プレイ数を+1してlocalStorageに保存し、新しい値を返す */
function incrementPlayCount() {
	const next = parseInt(localStorage.getItem(KEY$1) || "0", 10) + 1;
	localStorage.setItem(KEY$1, String(next));
	return next;
}
/** 現在の通算プレイ数を返す */
function getPlayCount() {
	return parseInt(localStorage.getItem(KEY$1) || "0", 10);
}
//#endregion
//#region src/utils/coins.js
var KEY_COINS = "ww_coins";
var KEY_LOGIN = "ww_last_login";
var KEY_STREAK = "ww_streak";
var KEY_UNLOCK = "ww_shop_unlocked";
function getCoins() {
	return parseInt(localStorage.getItem(KEY_COINS) || "0", 10);
}
function addCoins(amount) {
	const next = getCoins() + amount;
	localStorage.setItem(KEY_COINS, String(next));
	return next;
}
function spendCoins(amount) {
	const current = getCoins();
	if (current < amount) return false;
	localStorage.setItem(KEY_COINS, String(current - amount));
	return true;
}
var BONUS_TABLE = [
	5,
	8,
	12,
	15,
	20
];
function checkLoginBonus() {
	const today = (/* @__PURE__ */ new Date()).toDateString();
	if (localStorage.getItem(KEY_LOGIN) === today) return null;
	const prev = localStorage.getItem(KEY_LOGIN);
	const yd = /* @__PURE__ */ new Date();
	yd.setDate(yd.getDate() - 1);
	const streak = prev === yd.toDateString() ? parseInt(localStorage.getItem(KEY_STREAK) || "0", 10) + 1 : 1;
	return {
		bonus: BONUS_TABLE[Math.min(streak - 1, BONUS_TABLE.length - 1)],
		streak
	};
}
function claimLoginBonus() {
	const result = checkLoginBonus();
	if (!result) return null;
	localStorage.setItem(KEY_LOGIN, (/* @__PURE__ */ new Date()).toDateString());
	localStorage.setItem(KEY_STREAK, String(result.streak));
	addCoins(result.bonus);
	return result;
}
function getUnlockedItems() {
	try {
		return JSON.parse(localStorage.getItem(KEY_UNLOCK) || "[]");
	} catch {
		return [];
	}
}
function isItemUnlocked(id) {
	return getUnlockedItems().includes(id);
}
function unlockItem(id) {
	const list = getUnlockedItems();
	if (!list.includes(id)) {
		list.push(id);
		localStorage.setItem(KEY_UNLOCK, JSON.stringify(list));
	}
}
//#endregion
//#region src/utils/shopItems.js
var SHOP_ITEMS = [
	{
		id: "ps_dress_rainbow",
		chara: "princess",
		cat: "dress",
		shopEmoji: "🌈",
		shopName: "レインボードレス",
		price: 30,
		itemData: {
			id: "shop_ps_d_rainbow",
			emoji: "🌈",
			name: "レインボー",
			c1: "#ff9eb5",
			c2: "#c084fc",
			hair: "#F9A825"
		}
	},
	{
		id: "ps_pet_unicorn",
		chara: "princess",
		cat: "pet",
		shopEmoji: "🦄",
		shopName: "ユニコーンペット",
		price: 40,
		itemData: {
			id: "shop_ps_p_unicorn",
			emoji: "🦄",
			name: "ユニコーン"
		}
	},
	{
		id: "ps_item_wand_star",
		chara: "princess",
		cat: "item",
		shopEmoji: "✨",
		shopName: "まほうのステッキ",
		price: 25,
		itemData: {
			id: "shop_ps_i_wand",
			emoji: "✨",
			name: "まほうステッキ"
		}
	},
	{
		id: "ps_pet_dragon",
		chara: "princess",
		cat: "pet",
		shopEmoji: "🐲",
		shopName: "ドラゴンペット",
		price: 50,
		itemData: {
			id: "shop_ps_p_dragon",
			emoji: "🐲",
			name: "ドラゴン"
		}
	},
	{
		id: "ps_crown_jewel",
		chara: "princess",
		cat: "crown",
		shopEmoji: "💎",
		shopName: "ほうせきかんむり",
		price: 35,
		itemData: {
			id: "shop_ps_c_jewel",
			emoji: "💎",
			name: "ほうせき"
		}
	},
	{
		id: "ps_acc_fairy",
		chara: "princess",
		cat: "accessory",
		shopEmoji: "🧚",
		shopName: "ようせいのつばさ",
		price: 45,
		itemData: {
			id: "shop_ps_a_fairy",
			emoji: "🧚",
			name: "つばさ"
		}
	},
	{
		id: "ps_dress_gold",
		chara: "princess",
		cat: "dress",
		shopEmoji: "👑",
		shopName: "おうごんのドレス",
		price: 55,
		itemData: {
			id: "shop_ps_d_gold",
			emoji: "👑",
			name: "おうごん",
			c1: "#FFD700",
			c2: "#FFA000",
			hair: "#F9A825"
		}
	},
	{
		id: "ps_item_mirror",
		chara: "princess",
		cat: "item",
		shopEmoji: "🪞",
		shopName: "まほうのかがみ",
		price: 30,
		itemData: {
			id: "shop_ps_i_mirror",
			emoji: "🪞",
			name: "かがみ"
		}
	},
	{
		id: "ps_crown_star",
		chara: "princess",
		cat: "crown",
		shopEmoji: "🌟",
		shopName: "スターかんむり",
		price: 28,
		itemData: {
			id: "shop_ps_c_star",
			emoji: "🌟",
			name: "スター"
		}
	},
	{
		id: "ps_acc_angel",
		chara: "princess",
		cat: "accessory",
		shopEmoji: "😇",
		shopName: "てんしのわ",
		price: 38,
		itemData: {
			id: "shop_ps_a_angel",
			emoji: "😇",
			name: "てんしのわ"
		}
	},
	{
		id: "pr_dress_dragon",
		chara: "prince",
		cat: "dress",
		shopEmoji: "🐉",
		shopName: "ドラゴンよろい",
		price: 40,
		itemData: {
			id: "shop_pr_d_dragon",
			emoji: "🐉",
			name: "ドラゴン",
			c1: "#388E3C",
			c2: "#1B5E20",
			hair: "#5D4037"
		}
	},
	{
		id: "pr_pet_phoenix",
		chara: "prince",
		cat: "pet",
		shopEmoji: "🦅",
		shopName: "フェニックスペット",
		price: 50,
		itemData: {
			id: "shop_pr_p_phoenix",
			emoji: "🦅",
			name: "フェニックス"
		}
	},
	{
		id: "pr_item_gold_sword",
		chara: "prince",
		cat: "item",
		shopEmoji: "⚔️",
		shopName: "おうごんのけん",
		price: 35,
		itemData: {
			id: "shop_pr_i_gold",
			emoji: "⚔️",
			name: "おうごんのけん"
		}
	},
	{
		id: "pr_pet_lion",
		chara: "prince",
		cat: "pet",
		shopEmoji: "🦁",
		shopName: "ライオンペット",
		price: 30,
		itemData: {
			id: "shop_pr_p_lion",
			emoji: "🦁",
			name: "ライオン"
		}
	},
	{
		id: "pr_acc_shield",
		chara: "prince",
		cat: "accessory",
		shopEmoji: "🛡️",
		shopName: "まほうのたて",
		price: 25,
		itemData: {
			id: "shop_pr_a_shield",
			emoji: "🛡️",
			name: "まほうのたて"
		}
	},
	{
		id: "pr_item_star_mantle",
		chara: "prince",
		cat: "item",
		shopEmoji: "🌟",
		shopName: "ほしのマント",
		price: 45,
		itemData: {
			id: "shop_pr_i_star",
			emoji: "🌟",
			name: "ほしのマント"
		}
	},
	{
		id: "pr_dress_gold",
		chara: "prince",
		cat: "dress",
		shopEmoji: "🪙",
		shopName: "おうごんのよろい",
		price: 55,
		itemData: {
			id: "shop_pr_d_gold",
			emoji: "🪙",
			name: "おうごん",
			c1: "#FFB300",
			c2: "#E65100",
			hair: "#5D4037"
		}
	},
	{
		id: "pr_crown_dragon",
		chara: "prince",
		cat: "crown",
		shopEmoji: "🐲",
		shopName: "ドラゴンかぶと",
		price: 42,
		itemData: {
			id: "shop_pr_c_dragon",
			emoji: "🐲",
			name: "ドラゴン"
		}
	},
	{
		id: "pr_pet_wolf",
		chara: "prince",
		cat: "pet",
		shopEmoji: "🐺",
		shopName: "オオカミペット",
		price: 35,
		itemData: {
			id: "shop_pr_p_wolf",
			emoji: "🐺",
			name: "オオカミ"
		}
	},
	{
		id: "pr_item_trumpet",
		chara: "prince",
		cat: "item",
		shopEmoji: "🎺",
		shopName: "ぎんのらっぱ",
		price: 28,
		itemData: {
			id: "shop_pr_i_trumpet",
			emoji: "🎺",
			name: "らっぱ"
		}
	}
];
//#endregion
//#region src/components/Kisekae.jsx
function getShopExtras(chara, cat) {
	const unlocked = getUnlockedItems();
	return SHOP_ITEMS.filter((s) => s.chara === chara && s.cat === cat && unlocked.includes(s.id)).map((s) => s.itemData);
}
var CATS = [
	{
		id: "crown",
		label: "👑 かんむり"
	},
	{
		id: "dress",
		label: "👗 いろ"
	},
	{
		id: "accessory",
		label: "📿 アクセ"
	},
	{
		id: "item",
		label: "🪄 こもの"
	},
	{
		id: "pet",
		label: "🐾 ペット"
	}
];
var KISEKAE_ITEMS = {
	princess: {
		crown: [
			{
				id: "c0",
				emoji: "👑",
				name: "おうかん"
			},
			{
				id: "c1",
				emoji: "🌸",
				name: "はな"
			},
			{
				id: "c2",
				emoji: "⭐",
				name: "スター"
			},
			{
				id: "c3",
				emoji: "🌈",
				name: "にじ"
			},
			{
				id: "c4",
				emoji: "🎀",
				name: "リボン"
			},
			{
				id: "c5",
				emoji: "🦋",
				name: "ちょうちょ"
			},
			{
				id: "c6",
				emoji: "💎",
				name: "ダイヤ"
			},
			{
				id: "c7",
				emoji: "",
				name: "なし"
			}
		],
		dress: [
			{
				id: "d0",
				emoji: "🩷",
				name: "ピンク",
				c1: "#ff80ab",
				c2: "#f06292",
				hair: "#F9A825"
			},
			{
				id: "d1",
				emoji: "💜",
				name: "むらさき",
				c1: "#ce93d8",
				c2: "#ab47bc",
				hair: "#F9A825"
			},
			{
				id: "d2",
				emoji: "💙",
				name: "あお",
				c1: "#90caf9",
				c2: "#42a5f5",
				hair: "#FBC02D"
			},
			{
				id: "d3",
				emoji: "💚",
				name: "みどり",
				c1: "#a5d6a7",
				c2: "#66bb6a",
				hair: "#8D6E63"
			},
			{
				id: "d4",
				emoji: "🤍",
				name: "しろ",
				c1: "#f8f8ff",
				c2: "#e0e0e0",
				hair: "#BDBDBD"
			},
			{
				id: "d5",
				emoji: "🧡",
				name: "オレンジ",
				c1: "#ffb74d",
				c2: "#ff9800",
				hair: "#F9A825"
			},
			{
				id: "d6",
				emoji: "❤️",
				name: "あか",
				c1: "#ef9a9a",
				c2: "#e53935",
				hair: "#5D4037"
			},
			{
				id: "d7",
				emoji: "🖤",
				name: "くろ",
				c1: "#757575",
				c2: "#212121",
				hair: "#212121"
			}
		],
		accessory: [
			{
				id: "a0",
				emoji: "📿",
				name: "ネックレス"
			},
			{
				id: "a1",
				emoji: "💍",
				name: "ゆびわ"
			},
			{
				id: "a2",
				emoji: "💎",
				name: "ダイヤ"
			},
			{
				id: "a3",
				emoji: "❤️",
				name: "ハート"
			},
			{
				id: "a4",
				emoji: "⭐",
				name: "スター"
			},
			{
				id: "a5",
				emoji: "🌸",
				name: "はな"
			},
			{
				id: "a6",
				emoji: "🌟",
				name: "キラキラ"
			},
			{
				id: "a7",
				emoji: "",
				name: "なし"
			}
		],
		item: [
			{
				id: "i0",
				emoji: "🪄",
				name: "ステッキ"
			},
			{
				id: "i1",
				emoji: "👜",
				name: "バッグ"
			},
			{
				id: "i2",
				emoji: "🌹",
				name: "バラ"
			},
			{
				id: "i3",
				emoji: "🌂",
				name: "パラソル"
			},
			{
				id: "i4",
				emoji: "🧸",
				name: "ぬいぐるみ"
			},
			{
				id: "i5",
				emoji: "💐",
				name: "はなたば"
			},
			{
				id: "i6",
				emoji: "🌈",
				name: "にじ"
			},
			{
				id: "i7",
				emoji: "",
				name: "なし"
			}
		],
		pet: [
			{
				id: "p0",
				emoji: "🐱",
				name: "ねこ"
			},
			{
				id: "p1",
				emoji: "🐶",
				name: "いぬ"
			},
			{
				id: "p2",
				emoji: "🐰",
				name: "うさぎ"
			},
			{
				id: "p3",
				emoji: "🦊",
				name: "きつね"
			},
			{
				id: "p4",
				emoji: "🐸",
				name: "かえる"
			},
			{
				id: "p5",
				emoji: "🦋",
				name: "ちょうちょ"
			},
			{
				id: "p6",
				emoji: "🐼",
				name: "パンダ"
			},
			{
				id: "p8",
				emoji: "🦄",
				name: "ユニコーン"
			},
			{
				id: "p7",
				emoji: "",
				name: "なし"
			}
		]
	},
	prince: {
		crown: [
			{
				id: "c0",
				emoji: "👑",
				name: "おうかん"
			},
			{
				id: "c1",
				emoji: "⭐",
				name: "スター"
			},
			{
				id: "c2",
				emoji: "🌟",
				name: "キラキラ"
			},
			{
				id: "c3",
				emoji: "💎",
				name: "ダイヤ"
			},
			{
				id: "c4",
				emoji: "🎩",
				name: "ぼうし"
			},
			{
				id: "c5",
				emoji: "🪖",
				name: "ヘルメット"
			},
			{
				id: "c6",
				emoji: "🌈",
				name: "にじ"
			},
			{
				id: "c7",
				emoji: "",
				name: "なし"
			}
		],
		dress: [
			{
				id: "d0",
				emoji: "💙",
				name: "あお",
				c1: "#1976D2",
				c2: "#1565C0",
				hair: "#5D4037"
			},
			{
				id: "d1",
				emoji: "💜",
				name: "むらさき",
				c1: "#7B1FA2",
				c2: "#4A148C",
				hair: "#5D4037"
			},
			{
				id: "d2",
				emoji: "❤️",
				name: "あか",
				c1: "#C62828",
				c2: "#B71C1C",
				hair: "#3E2723"
			},
			{
				id: "d3",
				emoji: "💚",
				name: "みどり",
				c1: "#2E7D32",
				c2: "#1B5E20",
				hair: "#5D4037"
			},
			{
				id: "d4",
				emoji: "🖤",
				name: "くろ",
				c1: "#424242",
				c2: "#212121",
				hair: "#212121"
			},
			{
				id: "d5",
				emoji: "🤍",
				name: "しろ",
				c1: "#ECEFF1",
				c2: "#B0BEC5",
				hair: "#FBC02D"
			},
			{
				id: "d6",
				emoji: "🧡",
				name: "オレンジ",
				c1: "#E65100",
				c2: "#BF360C",
				hair: "#5D4037"
			},
			{
				id: "d7",
				emoji: "💛",
				name: "きいろ",
				c1: "#F9A825",
				c2: "#F57F17",
				hair: "#5D4037"
			}
		],
		accessory: [
			{
				id: "a0",
				emoji: "⚔️",
				name: "つるぎ"
			},
			{
				id: "a1",
				emoji: "🛡️",
				name: "たて"
			},
			{
				id: "a2",
				emoji: "💎",
				name: "ダイヤ"
			},
			{
				id: "a3",
				emoji: "⭐",
				name: "スター"
			},
			{
				id: "a4",
				emoji: "🏆",
				name: "トロフィー"
			},
			{
				id: "a5",
				emoji: "🎖️",
				name: "メダル"
			},
			{
				id: "a6",
				emoji: "💍",
				name: "ゆびわ"
			},
			{
				id: "a7",
				emoji: "",
				name: "なし"
			}
		],
		item: [
			{
				id: "i0",
				emoji: "⚔️",
				name: "けん"
			},
			{
				id: "i1",
				emoji: "🪄",
				name: "ステッキ"
			},
			{
				id: "i2",
				emoji: "🌹",
				name: "バラ"
			},
			{
				id: "i3",
				emoji: "🎺",
				name: "らっぱ"
			},
			{
				id: "i4",
				emoji: "🗺️",
				name: "ちず"
			},
			{
				id: "i5",
				emoji: "🌈",
				name: "にじ"
			},
			{
				id: "i6",
				emoji: "🏇",
				name: "うま"
			},
			{
				id: "i7",
				emoji: "",
				name: "なし"
			}
		],
		pet: [
			{
				id: "p0",
				emoji: "🐻",
				name: "くま"
			},
			{
				id: "p1",
				emoji: "🦁",
				name: "らいおん"
			},
			{
				id: "p2",
				emoji: "🐯",
				name: "とら"
			},
			{
				id: "p3",
				emoji: "🐺",
				name: "おおかみ"
			},
			{
				id: "p4",
				emoji: "🐲",
				name: "ドラゴン"
			},
			{
				id: "p5",
				emoji: "🦅",
				name: "わし"
			},
			{
				id: "p6",
				emoji: "🐴",
				name: "うま"
			},
			{
				id: "p7",
				emoji: "",
				name: "なし"
			}
		]
	}
};
var DEFAULT_KISEKAE = {
	princess: {
		crown: "c0",
		dress: "d0",
		accessory: "",
		item: "",
		pet: ""
	},
	prince: {
		crown: "c0",
		dress: "d0",
		accessory: "",
		item: "",
		pet: ""
	}
};
function spawnSparkles(x, y) {
	const emojis = [
		"✨",
		"⭐",
		"💫",
		"🌟",
		"💖"
	];
	emojis.forEach((em, i) => {
		const el = document.createElement("div");
		el.className = "ksk-sparkle";
		el.textContent = em;
		const a = i / emojis.length * Math.PI * 2;
		const d = 38 + i * 14;
		el.style.cssText = [
			`left:${x}px`,
			`top:${y}px`,
			`--dx:${(Math.cos(a) * d).toFixed(1)}px`,
			`--dy:${(Math.sin(a) * d - 20).toFixed(1)}px`,
			`animation-delay:${(i * .07).toFixed(2)}s`
		].join(";");
		document.body.appendChild(el);
		setTimeout(() => {
			if (el.parentNode) el.remove();
		}, 900);
	});
}
function PrincessSVG({ state }) {
	const dress = KISEKAE_ITEMS.princess.dress.find((i) => i.id === state.dress) ?? KISEKAE_ITEMS.princess.dress[0];
	const crown = KISEKAE_ITEMS.princess.crown.find((i) => i.id === state.crown);
	const acc = KISEKAE_ITEMS.princess.accessory.find((i) => i.id === state.accessory);
	const item = KISEKAE_ITEMS.princess.item.find((i) => i.id === state.item);
	return /* @__PURE__ */ jsxs("svg", {
		className: "ksk-svg",
		viewBox: "0 0 72 114",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("ellipse", {
				cx: "36",
				cy: "93",
				rx: "27",
				ry: "21",
				fill: dress.c1
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "36,60 11,104 61,104",
				fill: dress.c2
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "28",
				cy: "81",
				rx: "6",
				ry: "12",
				fill: "rgba(255,255,255,0.2)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "36",
				cy: "60",
				r: "3",
				fill: dress.c2
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M33,58 Q36,54 39,58",
				fill: dress.c2,
				stroke: "none"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "28",
				y: "53",
				width: "16",
				height: "15",
				rx: "5",
				fill: "#FFCCBC"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "33",
				y: "47",
				width: "6",
				height: "10",
				rx: "3",
				fill: "#FFCCBC"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "36",
				cy: "37",
				r: "17",
				fill: "#FFE0B2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "36",
				cy: "27",
				rx: "18",
				ry: "14",
				fill: dress.hair
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "19",
				cy: "39",
				rx: "7.5",
				ry: "12",
				fill: dress.hair
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "53",
				cy: "39",
				rx: "7.5",
				ry: "12",
				fill: dress.hair
			}),
			crown?.emoji ? /* @__PURE__ */ jsx("text", {
				x: "36",
				y: "20",
				fontSize: "15",
				textAnchor: "middle",
				dominantBaseline: "middle",
				children: crown.emoji
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("polygon", {
					points: "21,24 27,15 32,22 36,13 40,22 45,15 51,24",
					fill: "#FFD700",
					stroke: "#FFA000",
					strokeWidth: "1"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "36",
					cy: "14",
					r: "3.5",
					fill: "#FF1744"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "22",
					cy: "24",
					r: "1.5",
					fill: "#FFAB40"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "50",
					cy: "24",
					r: "1.5",
					fill: "#FFAB40"
				})
			] }),
			/* @__PURE__ */ jsx("circle", {
				cx: "29.5",
				cy: "36",
				r: "4.2",
				fill: "#4A2E20"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "42.5",
				cy: "36",
				r: "4.2",
				fill: "#4A2E20"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "31",
				cy: "34.5",
				r: "1.6",
				fill: "#fff"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "44",
				cy: "34.5",
				r: "1.6",
				fill: "#fff"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M26.5,32 L25,30",
				stroke: "#4A2E20",
				strokeWidth: "1.1",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M29,31 L28,29",
				stroke: "#4A2E20",
				strokeWidth: "1.1",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M44,31 L43,29",
				stroke: "#4A2E20",
				strokeWidth: "1.1",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M46.5,32 L48,30",
				stroke: "#4A2E20",
				strokeWidth: "1.1",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M30.5,44 Q36,49.5 41.5,44",
				stroke: "#E91E63",
				strokeWidth: "1.8",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "22",
				cy: "41",
				rx: "5.5",
				ry: "3.5",
				fill: "#FFB3C1",
				opacity: "0.55"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "50",
				cy: "41",
				rx: "5.5",
				ry: "3.5",
				fill: "#FFB3C1",
				opacity: "0.55"
			}),
			acc?.emoji && /* @__PURE__ */ jsx("text", {
				x: "36",
				y: "52",
				fontSize: "9",
				textAnchor: "middle",
				dominantBaseline: "middle",
				children: acc.emoji
			}),
			item?.emoji && /* @__PURE__ */ jsx("text", {
				x: "63",
				y: "71",
				fontSize: "12",
				textAnchor: "middle",
				dominantBaseline: "middle",
				children: item.emoji
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "29",
				cy: "110",
				rx: "6",
				ry: "3.2",
				fill: dress.c2
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "43",
				cy: "110",
				rx: "6",
				ry: "3.2",
				fill: dress.c2
			})
		]
	});
}
function PrinceSVG({ state }) {
	const dress = KISEKAE_ITEMS.prince.dress.find((i) => i.id === state.dress) ?? KISEKAE_ITEMS.prince.dress[0];
	const crown = KISEKAE_ITEMS.prince.crown.find((i) => i.id === state.crown);
	const acc = KISEKAE_ITEMS.prince.accessory.find((i) => i.id === state.accessory);
	const item = KISEKAE_ITEMS.prince.item.find((i) => i.id === state.item);
	const eyebrowColor = dress.hair === "#212121" ? "#555" : dress.hair;
	return /* @__PURE__ */ jsxs("svg", {
		className: "ksk-svg",
		viewBox: "0 0 72 114",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("path", {
				d: "M18,55 Q7,74 11,97",
				stroke: dress.c2,
				strokeWidth: "5",
				fill: "none",
				strokeLinecap: "round",
				opacity: "0.65"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M54,55 Q65,74 61,97",
				stroke: dress.c2,
				strokeWidth: "5",
				fill: "none",
				strokeLinecap: "round",
				opacity: "0.65"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "23",
				y: "74",
				width: "11",
				height: "29",
				rx: "4",
				fill: dress.c2
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "38",
				y: "74",
				width: "11",
				height: "29",
				rx: "4",
				fill: dress.c2
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "18",
				y: "52",
				width: "36",
				height: "27",
				rx: "7",
				fill: dress.c1
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "20",
				y: "54",
				width: "13",
				height: "17",
				rx: "5",
				fill: "rgba(255,255,255,0.15)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "36",
				cy: "57",
				r: "1.3",
				fill: "rgba(255,255,255,0.7)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "36",
				cy: "62",
				r: "1.3",
				fill: "rgba(255,255,255,0.7)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "36",
				cy: "67",
				r: "1.3",
				fill: "rgba(255,255,255,0.7)"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "28",
				y: "50",
				width: "16",
				height: "10",
				rx: "3",
				fill: "#FFCCBC"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "33",
				y: "43",
				width: "6",
				height: "11",
				rx: "3",
				fill: "#FFCCBC"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "36",
				cy: "33",
				r: "17",
				fill: "#FFE0B2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "36",
				cy: "23",
				rx: "18",
				ry: "13",
				fill: dress.hair
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "19",
				cy: "33",
				rx: "6",
				ry: "10",
				fill: dress.hair
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "53",
				cy: "33",
				rx: "6",
				ry: "10",
				fill: dress.hair
			}),
			crown?.emoji ? /* @__PURE__ */ jsx("text", {
				x: "36",
				y: "16",
				fontSize: "15",
				textAnchor: "middle",
				dominantBaseline: "middle",
				children: crown.emoji
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("polygon", {
					points: "21,21 27,12 32,19 36,10 40,19 45,12 51,21",
					fill: "#FFD700",
					stroke: "#FFA000",
					strokeWidth: "1"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "36",
					cy: "11",
					r: "3.5",
					fill: "#2196F3"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "22",
					cy: "21",
					r: "1.5",
					fill: "#FFAB40"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "50",
					cy: "21",
					r: "1.5",
					fill: "#FFAB40"
				})
			] }),
			/* @__PURE__ */ jsx("circle", {
				cx: "29.5",
				cy: "32",
				r: "4.2",
				fill: "#2E1F0E"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "42.5",
				cy: "32",
				r: "4.2",
				fill: "#2E1F0E"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "31",
				cy: "30.5",
				r: "1.6",
				fill: "#fff"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "44",
				cy: "30.5",
				r: "1.6",
				fill: "#fff"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M26,27 Q29.5,24.5 33,27",
				stroke: eyebrowColor,
				strokeWidth: "1.8",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M39,27 Q42.5,24.5 46,27",
				stroke: eyebrowColor,
				strokeWidth: "1.8",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M30.5,40 Q36,44 41.5,40",
				stroke: "#BF8A7A",
				strokeWidth: "1.8",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "22",
				cy: "36",
				rx: "5",
				ry: "3.2",
				fill: "#FFB3C1",
				opacity: "0.3"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "50",
				cy: "36",
				rx: "5",
				ry: "3.2",
				fill: "#FFB3C1",
				opacity: "0.3"
			}),
			acc?.emoji && /* @__PURE__ */ jsx("text", {
				x: "36",
				y: "47",
				fontSize: "9",
				textAnchor: "middle",
				dominantBaseline: "middle",
				children: acc.emoji
			}),
			item?.emoji && /* @__PURE__ */ jsx("text", {
				x: "9",
				y: "67",
				fontSize: "12",
				textAnchor: "middle",
				dominantBaseline: "middle",
				children: item.emoji
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "20",
				y: "101",
				width: "14",
				height: "7",
				rx: "3.5",
				fill: dress.c2
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "38",
				y: "101",
				width: "14",
				height: "7",
				rx: "3.5",
				fill: dress.c2
			})
		]
	});
}
function findKisekaeItem(chara, cat, id) {
	const base = KISEKAE_ITEMS[chara][cat].find((i) => i.id === id);
	if (base) return base;
	return getShopExtras(chara, cat).find((i) => i.id === id);
}
function KisekaeCharacters({ kisekaeState, onOpen, lang }) {
	const psPet = findKisekaeItem("princess", "pet", kisekaeState.princess.pet);
	const prPet = findKisekaeItem("prince", "pet", kisekaeState.prince.pet);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
		className: "ksk-chara-wrap ksk-chara-wrap--left",
		onClick: (e) => {
			onOpen("princess");
			spawnSparkles(e.clientX, e.clientY);
		},
		"aria-label": "プリンセスを着せ替え",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ksk-chara-inner",
			children: [/* @__PURE__ */ jsx(PrincessSVG, { state: kisekaeState.princess }), psPet?.emoji && /* @__PURE__ */ jsx("div", {
				className: "ksk-pet ksk-pet--left",
				children: psPet.emoji
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "ksk-chara-badge",
			children: lang === "en" ? "👗 Dress up" : "👗 きがえ"
		})]
	}), /* @__PURE__ */ jsxs("button", {
		className: "ksk-chara-wrap ksk-chara-wrap--right",
		onClick: (e) => {
			onOpen("prince");
			spawnSparkles(e.clientX, e.clientY);
		},
		"aria-label": "プリンスを着せ替え",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "ksk-chara-inner",
			children: [/* @__PURE__ */ jsx(PrinceSVG, { state: kisekaeState.prince }), prPet?.emoji && /* @__PURE__ */ jsx("div", {
				className: "ksk-pet ksk-pet--right",
				children: prPet.emoji
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "ksk-chara-badge",
			children: lang === "en" ? "👗 Dress up" : "👗 きがえ"
		})]
	})] });
}
function KisekaePanel({ isOpen, initialChara, onClose, kisekaeState, onStateChange, lang }) {
	const [activeChara, setActiveChara] = useState(initialChara || "princess");
	const [activeCat, setActiveCat] = useState("crown");
	useEffect(() => {
		if (isOpen) {
			setActiveChara(initialChara || "princess");
			setActiveCat("crown");
		}
	}, [isOpen, initialChara]);
	if (!isOpen) return null;
	const baseItems = KISEKAE_ITEMS[activeChara][activeCat] || [];
	const shopExtras = getShopExtras(activeChara, activeCat);
	const items = [...baseItems, ...shopExtras];
	const currentVal = kisekaeState[activeChara][activeCat] || "";
	function handleSelect(item, e) {
		onStateChange({
			...kisekaeState,
			[activeChara]: {
				...kisekaeState[activeChara],
				[activeCat]: item.id
			}
		});
		spawnSparkles(e.clientX, e.clientY);
	}
	return /* @__PURE__ */ jsx("div", {
		className: "ksk-overlay",
		onMouseDown: (e) => {
			if (e.target === e.currentTarget) onClose();
		},
		onTouchEnd: (e) => {
			if (e.target === e.currentTarget) onClose();
		},
		children: /* @__PURE__ */ jsxs("div", {
			className: "ksk-panel",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "ksk-panel-hd",
					children: [/* @__PURE__ */ jsx("span", {
						className: "ksk-panel-title",
						children: "✨ きがえしよう！"
					}), /* @__PURE__ */ jsx("button", {
						className: "ksk-close-btn",
						onClick: onClose,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "ksk-chara-tabs",
					children: ["princess", "prince"].map((chara) => /* @__PURE__ */ jsxs("button", {
						className: `ksk-chara-tab${activeChara === chara ? " active" : ""}`,
						onClick: () => {
							setActiveChara(chara);
							setActiveCat("crown");
						},
						children: [/* @__PURE__ */ jsx("span", {
							className: "ksk-tab-icon",
							children: chara === "princess" ? "👸" : "🤴"
						}), lang === "en" ? chara === "princess" ? "Princess" : "Prince" : chara === "princess" ? "プリンセス" : "プリンス"]
					}, chara))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "ksk-cat-row",
					children: CATS.map((cat) => /* @__PURE__ */ jsx("button", {
						className: `ksk-cat-btn${activeCat === cat.id ? " active" : ""}`,
						onClick: () => setActiveCat(cat.id),
						children: cat.label
					}, cat.id))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "ksk-items-grid",
					children: items.map((item) => /* @__PURE__ */ jsxs("button", {
						className: `ksk-item-btn${currentVal === item.id ? " active" : ""}`,
						onClick: (e) => handleSelect(item, e),
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "ksk-ib-emoji",
								children: item.emoji || "✖️"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "ksk-ib-name",
								children: item.name
							}),
							currentVal === item.id && /* @__PURE__ */ jsx("span", {
								className: "ksk-ib-check",
								children: "✓"
							})
						]
					}, item.id))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ksk-mini-preview",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "ksk-mini-chara",
						children: [/* @__PURE__ */ jsx(PrincessSVG, { state: kisekaeState.princess }), /* @__PURE__ */ jsx("span", { children: "👸" })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "ksk-mini-chara",
						children: [/* @__PURE__ */ jsx(PrinceSVG, { state: kisekaeState.prince }), /* @__PURE__ */ jsx("span", { children: "🤴" })]
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/components/LoginBonus.jsx
function spawnCoinRain(count = 8) {
	const emojis = [
		"🪙",
		"⭐",
		"✨",
		"💛"
	];
	for (let i = 0; i < count; i++) {
		const el = document.createElement("div");
		el.textContent = emojis[i % emojis.length];
		el.style.cssText = [
			"position:fixed",
			`left:${20 + Math.random() * 60}%`,
			`top:${10 + Math.random() * 30}%`,
			"font-size:24px",
			"pointer-events:none",
			"z-index:2100",
			`animation:lb-fly-up ${.6 + Math.random() * .5}s ease ${i * .08}s forwards`
		].join(";");
		document.body.appendChild(el);
		setTimeout(() => {
			if (el.parentNode) el.remove();
		}, 1200);
	}
}
function LoginBonus({ bonus, streak, onClaim, lang }) {
	const claimedRef = useRef(false);
	useEffect(() => {
		const timer = setTimeout(() => spawnCoinRain(), 300);
		return () => clearTimeout(timer);
	}, []);
	function handleClaim() {
		if (claimedRef.current) return;
		claimedRef.current = true;
		spawnCoinRain(12);
		onClaim();
	}
	const streakLabel = lang === "en" ? `🔥 ${streak}-day streak!` : `🔥 ${streak}にちれんぞくログイン！`;
	const title = lang === "en" ? "🎁 Daily Bonus!" : "🎁 きょうのぼーなす！";
	const btnLabel = lang === "en" ? `Collect ${bonus} coins!` : `${bonus}まいうけとる！`;
	return /* @__PURE__ */ jsx("div", {
		className: "lb-overlay",
		onMouseDown: (e) => {
			if (e.target === e.currentTarget) handleClaim();
		},
		children: /* @__PURE__ */ jsxs("div", {
			className: "lb-card",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "lb-header",
					children: "LOGIN BONUS"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "lb-title",
					children: title
				}),
				/* @__PURE__ */ jsx("div", {
					className: "lb-coin-wrap",
					children: /* @__PURE__ */ jsx("span", {
						className: "lb-coin",
						children: "🪙"
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "lb-amount",
					children: ["+", bonus]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "lb-amount-label",
					children: lang === "en" ? "coins" : "まい"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "lb-streak",
					children: streakLabel
				}),
				/* @__PURE__ */ jsx("button", {
					className: "lb-btn",
					onClick: handleClaim,
					children: btnLabel
				})
			]
		})
	});
}
//#endregion
//#region src/components/Shop.jsx
var CAT_LABELS = {
	crown: "👑 かんむり",
	dress: "👗 いろ",
	accessory: "📿 アクセ",
	item: "🪄 こもの",
	pet: "🐾 ペット"
};
function Shop({ isOpen, onClose, lang, onCoinsChange }) {
	const [activeChara, setActiveChara] = useState("princess");
	const [coins, setCoins] = useState(() => typeof localStorage !== "undefined" ? getCoins() : 0);
	if (!isOpen) return null;
	const items = SHOP_ITEMS.filter((s) => s.chara === activeChara);
	function handleBuy(item, e) {
		if (isItemUnlocked(item.id)) return;
		if (!spendCoins(item.price)) return;
		unlockItem(item.id);
		const newCoins = getCoins();
		setCoins(newCoins);
		onCoinsChange(newCoins);
		spawnSparkles(e.clientX, e.clientY);
	}
	return /* @__PURE__ */ jsx("div", {
		className: "shop-overlay",
		onMouseDown: (ev) => {
			if (ev.target === ev.currentTarget) onClose();
		},
		onTouchEnd: (ev) => {
			if (ev.target === ev.currentTarget) onClose();
		},
		children: /* @__PURE__ */ jsxs("div", {
			className: "shop-panel",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "shop-hd",
					children: [/* @__PURE__ */ jsx("span", {
						className: "shop-title",
						children: "🛍️ ショップ"
					}), /* @__PURE__ */ jsx("button", {
						className: "shop-close-btn",
						onClick: onClose,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "shop-balance",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "shop-balance-icon",
							children: "🪙"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "shop-balance-num",
							children: coins
						}),
						/* @__PURE__ */ jsx("span", {
							className: "shop-balance-label",
							children: lang === "en" ? "coins" : "まい"
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "shop-chara-tabs",
					children: ["princess", "prince"].map((ch) => /* @__PURE__ */ jsxs("button", {
						className: `shop-chara-tab${activeChara === ch ? " active" : ""}`,
						onClick: () => setActiveChara(ch),
						children: [/* @__PURE__ */ jsx("span", {
							className: "shop-tab-icon",
							children: ch === "princess" ? "👸" : "🤴"
						}), lang === "en" ? ch === "princess" ? "Princess" : "Prince" : ch === "princess" ? "プリンセス" : "プリンス"]
					}, ch))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "shop-grid",
					children: items.map((item) => {
						const owned = isItemUnlocked(item.id);
						const canBuy = !owned && coins >= item.price;
						const broke = !owned && coins < item.price;
						return /* @__PURE__ */ jsxs("div", {
							className: `shop-item${owned ? " shop-item--owned" : ""}${broke ? " shop-item--broke" : ""}`,
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "shop-item-emoji",
									children: item.shopEmoji
								}),
								/* @__PURE__ */ jsx("div", {
									className: "shop-item-name",
									children: item.shopName
								}),
								/* @__PURE__ */ jsx("div", {
									className: "shop-item-cat",
									children: CAT_LABELS[item.cat] ?? item.cat
								}),
								owned ? /* @__PURE__ */ jsxs("div", {
									className: "shop-item-owned",
									children: ["✓ ", lang === "en" ? "Owned" : "もってる"]
								}) : canBuy ? /* @__PURE__ */ jsxs("button", {
									className: "shop-item-price",
									onClick: (e) => handleBuy(item, e),
									children: ["🪙 ", item.price]
								}) : /* @__PURE__ */ jsxs("div", {
									className: "shop-item-broke",
									children: [
										"🪙 ",
										item.price,
										" ",
										/* @__PURE__ */ jsx("span", {
											style: { fontSize: 9 },
											children: lang === "en" ? "need more" : "コインがたりない"
										})
									]
								})
							]
						}, item.id);
					})
				})
			]
		})
	});
}
//#endregion
//#region src/utils/recentGames.js
var KEY = "recentGames";
var MAX = 5;
function recordRecentGame(route) {
	try {
		const updated = [route, ...JSON.parse(localStorage.getItem(KEY) || "[]").filter((r) => r !== route)].slice(0, MAX);
		localStorage.setItem(KEY, JSON.stringify(updated));
	} catch {}
}
function getRecentGames() {
	try {
		return JSON.parse(localStorage.getItem(KEY) || "[]");
	} catch {
		return [];
	}
}
//#endregion
//#region src/utils/recommend.js
var ALL_GAMES = [
	{
		route: "/shabondama",
		icon: "🫧",
		ja: "シャボンだまポン",
		en: "Bubble Pop",
		category: "アクション"
	},
	{
		route: "/kudamono-catch",
		icon: "🍎",
		ja: "くだものキャッチ",
		en: "Fruit Catch",
		category: "アクション"
	},
	{
		route: "/meiro",
		icon: "🗺️",
		ja: "めいろあそび",
		en: "Maze Play",
		category: "パズル"
	},
	{
		route: "/doubutsu-puzzle",
		icon: "🧩",
		ja: "どうぶつパズル",
		en: "Animal Puzzle",
		category: "パズル"
	},
	{
		route: "/kazu-asobi",
		icon: "🔢",
		ja: "かずあそび",
		en: "Number Fun",
		category: "かずあそび"
	},
	{
		route: "/animal-soccer",
		icon: "⚽",
		ja: "どうぶつサッカー",
		en: "Animal Soccer",
		category: "アクション"
	},
	{
		route: "/jewelry-shop",
		icon: "💎",
		ja: "ほうせきやさん",
		en: "Jewelry Shop",
		category: "そうぞう"
	},
	{
		route: "/sushi",
		icon: "🍣",
		ja: "さーもん",
		en: "Catch Salmon",
		category: "アクション"
	},
	{
		route: "/ichigo",
		icon: "🍓",
		ja: "いちご",
		en: "Strawberry Time",
		category: "アクション"
	},
	{
		route: "/kakurenbo",
		icon: "🔍",
		ja: "どうぶつかくれんぼ",
		en: "Animal Hide & Seek",
		category: "パズル"
	},
	{
		route: "/moji",
		icon: "🔤",
		ja: "もじあそび",
		en: "Letter Fun",
		category: "もじあそび"
	},
	{
		route: "/tashizan",
		icon: "➕",
		ja: "たしざんゲーム",
		en: "Math Quiz",
		category: "かずあそび"
	},
	{
		route: "/iro",
		icon: "🎨",
		ja: "いろあわせ",
		en: "Color Match",
		category: "パズル"
	},
	{
		route: "/machi",
		icon: "🏙️",
		ja: "わくわくまちづくり",
		en: "City Builder",
		category: "そうぞう"
	},
	{
		route: "/kokki",
		icon: "🌍",
		ja: "こっきクイズ",
		en: "Flag Quiz",
		category: "クイズ"
	},
	{
		route: "/jewelry-master",
		icon: "💍",
		ja: "ジュエリーマスター",
		en: "Jewelry Master",
		category: "そうぞう"
	},
	{
		route: "/tetris",
		icon: "🧱",
		ja: "どうぶつブロック",
		en: "Animal Blocks",
		category: "パズル"
	},
	{
		route: "/runner",
		icon: "🏃",
		ja: "どうぶつランナー",
		en: "Animal Runner",
		category: "アクション"
	},
	{
		route: "/shooting",
		icon: "🚀",
		ja: "どうぶつシューティング",
		en: "Animal Shooter",
		category: "アクション"
	},
	{
		route: "/sniper",
		icon: "🎯",
		ja: "どうぶつスナイパー",
		en: "Animal Sniper",
		category: "アクション"
	},
	{
		route: "/crossing",
		icon: "🐔",
		ja: "どうぶつクロッシング",
		en: "Animal Crossing",
		category: "アクション"
	}
];
/**
* 現在のゲームを除いた推薦ゲームを返す
* 同カテゴリを優先してランダムに count 本選ぶ
*/
function getRecommendedGames(currentRoute, count = 3) {
	const current = ALL_GAMES.find((g) => g.route === currentRoute);
	const others = ALL_GAMES.filter((g) => g.route !== currentRoute);
	const shuffle = (arr) => [...arr].sort(() => Math.random() - .5);
	const sameCategory = current ? shuffle(others.filter((g) => g.category === current.category)) : [];
	const different = shuffle(others.filter((g) => !current || g.category !== current.category));
	return [...sameCategory, ...different].slice(0, count);
}
//#endregion
//#region src/pages/TopPage.jsx
var CARD_GRADIENTS = {
	"アクション": "linear-gradient(145deg, #FF9F5A, #E8471E)",
	"パズル": "linear-gradient(145deg, #9B7FE8, #3D2B8C)",
	"かずあそび": "linear-gradient(145deg, #4DB8E8, #1A5A9E)",
	"もじあそび": "linear-gradient(145deg, #5BC99A, #1A7A56)",
	"クイズ": "linear-gradient(145deg, #4FC3A1, #1A5C3A)",
	"そうぞう": "linear-gradient(145deg, #C97FE0, #3D0D6B)",
	"レース": "linear-gradient(145deg, #F9A825, #E53935)"
};
var DEFAULT_GRADIENT = "linear-gradient(145deg, #7B8FA1, #3D4A5C)";
var CATEGORIES = [
	{
		key: "すべて",
		icon: "🎮",
		label: {
			ja: "すべて",
			en: "All",
			zh: "全部",
			ko: "전체",
			es: "Todo"
		}
	},
	{
		key: "かずあそび",
		icon: "🔢",
		label: {
			ja: "かずあそび",
			en: "Numbers",
			zh: "数字",
			ko: "숫자",
			es: "Números"
		}
	},
	{
		key: "もじあそび",
		icon: "✏️",
		label: {
			ja: "もじあそび",
			en: "Letters",
			zh: "文字",
			ko: "글자",
			es: "Letras"
		}
	},
	{
		key: "パズル",
		icon: "🧩",
		label: {
			ja: "パズル",
			en: "Puzzle",
			zh: "拼图",
			ko: "퍼즐",
			es: "Puzzle"
		}
	},
	{
		key: "アクション",
		icon: "⚡",
		label: {
			ja: "アクション",
			en: "Action",
			zh: "动作",
			ko: "액션",
			es: "Acción"
		}
	},
	{
		key: "レース",
		icon: "🏁",
		label: {
			ja: "レース",
			en: "Racing",
			zh: "赛车",
			ko: "레이싱",
			es: "Carreras"
		}
	},
	{
		key: "クイズ",
		icon: "❓",
		label: {
			ja: "クイズ",
			en: "Quiz",
			zh: "问答",
			ko: "퀴즈",
			es: "Quiz"
		}
	},
	{
		key: "そうぞう",
		icon: "🎨",
		label: {
			ja: "そうぞう",
			en: "Create",
			zh: "创造",
			ko: "창작",
			es: "Crear"
		}
	}
];
var GAME_SVGS = {
	g1: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "2",
				fill: "white",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "16",
				r: "1.5",
				fill: "white",
				opacity: ".3"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "22",
				cy: "65",
				r: "12",
				fill: "rgba(255,255,255,.1)",
				stroke: "rgba(255,255,255,.6)",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "22",
				cy: "65",
				r: "10",
				fill: "none",
				stroke: "#FF6B6B",
				strokeWidth: "1.5",
				strokeDasharray: "8 55",
				opacity: ".75"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "22",
				cy: "65",
				r: "10",
				fill: "none",
				stroke: "#7DF9FF",
				strokeWidth: "1.5",
				strokeDasharray: "8 55",
				strokeDashoffset: "-8",
				opacity: ".75"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "17",
				cy: "59",
				rx: "3",
				ry: "2",
				fill: "white",
				opacity: ".65",
				transform: "rotate(-30 17 59)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "78",
				cy: "60",
				r: "10",
				fill: "rgba(255,255,255,.1)",
				stroke: "rgba(255,255,255,.6)",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "73",
				cy: "54",
				rx: "2.5",
				ry: "1.8",
				fill: "white",
				opacity: ".65",
				transform: "rotate(-30 73 54)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "40",
				r: "30",
				fill: "rgba(255,255,255,.07)",
				stroke: "white",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "40",
				r: "28",
				fill: "none",
				stroke: "#FF6B6B",
				strokeWidth: "2.5",
				strokeDasharray: "16 158",
				opacity: ".85"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "40",
				r: "28",
				fill: "none",
				stroke: "#FFD93D",
				strokeWidth: "2.5",
				strokeDasharray: "16 158",
				strokeDashoffset: "-16",
				opacity: ".85"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "40",
				r: "28",
				fill: "none",
				stroke: "#7DF9FF",
				strokeWidth: "2.5",
				strokeDasharray: "16 158",
				strokeDashoffset: "-32",
				opacity: ".85"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "40",
				r: "28",
				fill: "none",
				stroke: "#B8F7A8",
				strokeWidth: "2.5",
				strokeDasharray: "16 158",
				strokeDashoffset: "-48",
				opacity: ".85"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "37",
				cy: "26",
				rx: "9",
				ry: "5",
				fill: "white",
				opacity: ".55",
				transform: "rotate(-35 37 26)"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "61",
				cy: "50",
				rx: "4",
				ry: "2",
				fill: "white",
				opacity: ".22",
				transform: "rotate(-35 61 50)"
			})
		]
	}),
	g2: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "10",
				cy: "10",
				r: "2",
				fill: "#FFD700",
				opacity: ".6"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "15",
				r: "1.5",
				fill: "white",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "28",
				y: "58",
				width: "44",
				height: "24",
				rx: "4",
				fill: "#8B4513",
				stroke: "#5D2E0C",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "28",
				y1: "65",
				x2: "72",
				y2: "65",
				stroke: "#5D2E0C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "28",
				y1: "72",
				x2: "72",
				y2: "72",
				stroke: "#5D2E0C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "32",
				y: "54",
				width: "36",
				height: "6",
				rx: "3",
				fill: "#A0522D",
				stroke: "#5D2E0C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "30",
				cy: "22",
				r: "10",
				fill: "#E53935",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "26",
				cy: "17",
				rx: "3",
				ry: "2",
				fill: "#EF9A9A",
				opacity: ".6",
				transform: "rotate(-20 26 17)"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "29",
				y: "11",
				width: "2",
				height: "5",
				rx: "1",
				fill: "#4CAF50"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M55 30Q58 10 72 15Q78 18 72 28Q65 38 55 30",
				fill: "#FFD700",
				stroke: "#F57F17",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "62",
				cy: "17",
				rx: "4",
				ry: "2",
				fill: "#FFF176",
				opacity: ".5",
				transform: "rotate(-25 62 17)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M40 44Q36 34 44 32Q52 30 52 42Q48 50 40 44",
				fill: "#E53935",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "47",
				cy: "32",
				rx: "6",
				ry: "3",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "43",
				cy: "38",
				rx: "1.2",
				ry: "1.8",
				fill: "#FFCDD2",
				stroke: "#B71C1C",
				strokeWidth: ".6"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "48",
				cy: "36",
				rx: "1.2",
				ry: "1.8",
				fill: "#FFCDD2",
				stroke: "#B71C1C",
				strokeWidth: ".6"
			})
		]
	}),
	g3: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "6",
				width: "84",
				height: "76",
				rx: "3",
				fill: "rgba(0,0,0,.2)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M15 22L55 22L55 38L35 38L35 54L75 54L75 38L88 38",
				stroke: "rgba(255,255,255,.25)",
				strokeWidth: "6",
				fill: "none",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "38",
				r: "8",
				fill: "#FFD700",
				stroke: "#B8860B",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "88",
				y: "43",
				textAnchor: "middle",
				fontSize: "10",
				fill: "white",
				fontWeight: "bold",
				children: "★"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "24",
				cy: "68",
				rx: "9",
				ry: "10",
				fill: "#F8C8D4",
				stroke: "#C2185B",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "24",
				cy: "54",
				r: "11",
				fill: "#F8C8D4",
				stroke: "#C2185B",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "18",
				cy: "42",
				rx: "3.5",
				ry: "7.5",
				fill: "#F8C8D4",
				stroke: "#C2185B",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "18",
				cy: "42",
				rx: "2",
				ry: "5",
				fill: "#FFB6C1"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "30",
				cy: "42",
				rx: "3.5",
				ry: "7.5",
				fill: "#F8C8D4",
				stroke: "#C2185B",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "30",
				cy: "42",
				rx: "2",
				ry: "5",
				fill: "#FFB6C1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "20",
				cy: "53",
				r: "2.8",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "28",
				cy: "53",
				r: "2.8",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "20.7",
				cy: "52",
				r: "1.1",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "28.7",
				cy: "52",
				r: "1.1",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "17",
				cy: "57",
				rx: "3",
				ry: "2",
				fill: "#FFB6C1",
				opacity: ".7"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "31",
				cy: "57",
				rx: "3",
				ry: "2",
				fill: "#FFB6C1",
				opacity: ".7"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M21 59Q24 62 27 59",
				stroke: "#C2185B",
				strokeWidth: "1.2",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "18",
				cy: "78",
				rx: "5.5",
				ry: "3.5",
				fill: "#F8C8D4",
				stroke: "#C2185B",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "30",
				cy: "78",
				rx: "5.5",
				ry: "3.5",
				fill: "#F8C8D4",
				stroke: "#C2185B",
				strokeWidth: "1.5"
			})
		]
	}),
	g4: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "10",
				r: "2",
				fill: "white",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "10",
				y: "15",
				width: "35",
				height: "35",
				rx: "4",
				fill: "#66BB6A",
				stroke: "#2E7D32",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "27.5",
				cy: "49.5",
				r: "5",
				fill: "#66BB6A",
				stroke: "#2E7D32",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "55",
				y: "15",
				width: "35",
				height: "35",
				rx: "4",
				fill: "#42A5F5",
				stroke: "#1565C0",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "55",
				cy: "32.5",
				r: "5",
				fill: "#42A5F5",
				stroke: "#1565C0",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "72.5",
				cy: "49.5",
				r: "5",
				fill: "#42A5F5",
				stroke: "#1565C0",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "32",
				y: "50",
				width: "36",
				height: "28",
				rx: "4",
				fill: "#FFA726",
				stroke: "#E65100",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "49.5",
				r: "5",
				fill: "rgba(255,255,255,.15)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "23",
				cy: "29",
				r: "3",
				fill: "white",
				stroke: "#2E7D32",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "23",
				cy: "29",
				r: "1.8",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "32",
				cy: "29",
				r: "3",
				fill: "white",
				stroke: "#2E7D32",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "32",
				cy: "29",
				r: "1.8",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "68",
				cy: "29",
				r: "3",
				fill: "white",
				stroke: "#1565C0",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "68",
				cy: "29",
				r: "1.8",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "77",
				cy: "29",
				r: "3",
				fill: "white",
				stroke: "#1565C0",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "77",
				cy: "29",
				r: "1.8",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "46",
				cy: "63",
				r: "3",
				fill: "white",
				stroke: "#E65100",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "46",
				cy: "63",
				r: "1.8",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "55",
				cy: "63",
				r: "3",
				fill: "white",
				stroke: "#E65100",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "55",
				cy: "63",
				r: "1.8",
				fill: "#1a1a2e"
			})
		]
	}),
	g5: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "10",
				cy: "10",
				r: "1.8",
				fill: "#FFD700",
				opacity: ".6"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "15",
				r: "1.5",
				fill: "white",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "60",
				y: "38",
				width: "32",
				height: "34",
				rx: "5",
				fill: "#FF9800",
				stroke: "#E65100",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "62",
				y: "40",
				width: "14",
				height: "7",
				rx: "2",
				fill: "#FFCC02",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "76",
				y: "64",
				textAnchor: "middle",
				fontSize: "21",
				fontWeight: "bold",
				fill: "white",
				children: "3"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "38",
				width: "32",
				height: "34",
				rx: "5",
				fill: "#66BB6A",
				stroke: "#2E7D32",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "10",
				y: "40",
				width: "14",
				height: "7",
				rx: "2",
				fill: "#A5D6A7",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "24",
				y: "64",
				textAnchor: "middle",
				fontSize: "21",
				fontWeight: "bold",
				fill: "white",
				children: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "26",
				y: "22",
				width: "48",
				height: "50",
				rx: "6",
				fill: "#FF5252",
				stroke: "#B71C1C",
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "29",
				y: "25",
				width: "22",
				height: "10",
				rx: "3",
				fill: "#FF8A80",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "50",
				y: "58",
				textAnchor: "middle",
				fontSize: "34",
				fontWeight: "bold",
				fill: "white",
				children: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "12",
				r: "10",
				fill: "#FFD700",
				stroke: "#B8860B",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "50",
				y: "17",
				textAnchor: "middle",
				fontSize: "12",
				fill: "white",
				fontWeight: "bold",
				children: "★"
			})
		]
	}),
	g6: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "85",
				cy: "12",
				r: "2",
				fill: "#FFD700",
				opacity: ".6"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "5",
				y: "25",
				width: "30",
				height: "22",
				rx: "2",
				fill: "none",
				stroke: "white",
				strokeWidth: "2",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "5",
				y: "25",
				width: "30",
				height: "3",
				rx: "1",
				fill: "white",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "12",
				y1: "28",
				x2: "12",
				y2: "47",
				stroke: "white",
				strokeWidth: "1",
				opacity: ".3"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "19",
				y1: "28",
				x2: "19",
				y2: "47",
				stroke: "white",
				strokeWidth: "1",
				opacity: ".3"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "26",
				y1: "28",
				x2: "26",
				y2: "47",
				stroke: "white",
				strokeWidth: "1",
				opacity: ".3"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "5",
				y1: "33",
				x2: "35",
				y2: "33",
				stroke: "white",
				strokeWidth: "1",
				opacity: ".3"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "5",
				y1: "40",
				x2: "35",
				y2: "40",
				stroke: "white",
				strokeWidth: "1",
				opacity: ".3"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "62",
				cy: "52",
				r: "22",
				fill: "white",
				stroke: "#333",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "62,30 70,36 67,46 57,46 54,36",
				fill: "#333",
				stroke: "#333",
				strokeWidth: ".5"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "83,42 84,52 75,58 68,52 70,42",
				fill: "#333",
				stroke: "#333",
				strokeWidth: ".5"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "70,70 62,74 54,70 54,60 70,60",
				fill: "#333",
				stroke: "#333",
				strokeWidth: ".5"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "40,42 43,52 52,58 52,46 46,38",
				fill: "#333",
				stroke: "#333",
				strokeWidth: ".5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "55",
				cy: "36",
				rx: "5",
				ry: "3",
				fill: "white",
				opacity: ".5",
				transform: "rotate(-20 55 36)"
			})
		]
	}),
	g8: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "2",
				fill: "#FFD700",
				opacity: ".6"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "4",
				y: "56",
				width: "92",
				height: "16",
				rx: "8",
				fill: "#795548",
				stroke: "#4E342E",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "59",
				width: "84",
				height: "10",
				rx: "5",
				fill: "#5D4037"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "22",
				y1: "57",
				x2: "22",
				y2: "71",
				stroke: "#3E2723",
				strokeWidth: "2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "40",
				y1: "57",
				x2: "40",
				y2: "71",
				stroke: "#3E2723",
				strokeWidth: "2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "58",
				y1: "57",
				x2: "58",
				y2: "71",
				stroke: "#3E2723",
				strokeWidth: "2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "76",
				y1: "57",
				x2: "76",
				y2: "71",
				stroke: "#3E2723",
				strokeWidth: "2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "32",
				y: "42",
				width: "36",
				height: "16",
				rx: "5",
				fill: "#FFF8DC",
				stroke: "#C8A855",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "34",
				y: "42",
				width: "32",
				height: "8",
				rx: "4",
				fill: "#FF7043",
				stroke: "#BF360C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "42",
				cy: "44",
				rx: "5",
				ry: "2",
				fill: "#FF8A65",
				opacity: ".6",
				transform: "rotate(-15 42 44)"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "65",
				cy: "26",
				rx: "20",
				ry: "12",
				fill: "#FF7043",
				stroke: "#BF360C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M84 26L94 18L94 34Z",
				fill: "#FF7043",
				stroke: "#BF360C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "58",
				cy: "23",
				r: "4",
				fill: "white",
				stroke: "#BF360C",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "59",
				cy: "23",
				r: "2.2",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "59.5",
				cy: "22.2",
				r: ".8",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "55",
				cy: "27",
				rx: "3.5",
				ry: "2",
				fill: "#FF8A65",
				opacity: ".6"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M60 29Q65 32 70 29",
				stroke: "#BF360C",
				strokeWidth: "1.2",
				fill: "none",
				strokeLinecap: "round"
			})
		]
	}),
	g9: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("rect", {
				x: "0",
				y: "76",
				width: "100",
				height: "9",
				fill: "rgba(0,0,0,.2)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "14",
				cy: "20",
				r: "2",
				fill: "#FFD700",
				opacity: ".7"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "86",
				cy: "25",
				r: "1.5",
				fill: "white",
				opacity: ".6"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "30",
				y1: "51",
				x2: "16",
				y2: "39",
				stroke: "#B71C1C",
				strokeWidth: "4",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "13",
				cy: "37",
				r: "5",
				fill: "#FFCDD2",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "70",
				y1: "51",
				x2: "84",
				y2: "39",
				stroke: "#B71C1C",
				strokeWidth: "4",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "86",
				cy: "37",
				r: "5",
				fill: "#FFCDD2",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "50",
				cy: "16",
				rx: "22",
				ry: "7",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M30 16Q35 3 50 9Q65 3 70 16",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M36 14Q40 5 50 9",
				fill: "#66BB6A"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M25 30Q20 55 50 73Q80 55 75 30Q62 18 50 20Q38 18 25 30",
				fill: "#E53935",
				stroke: "#B71C1C",
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M30 33Q26 51 36 63",
				stroke: "rgba(255,255,255,.35)",
				strokeWidth: "6",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "42",
				cy: "46",
				rx: "2",
				ry: "3",
				fill: "#FFCDD2",
				stroke: "#B71C1C",
				strokeWidth: ".8",
				transform: "rotate(-10 42 46)"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "52",
				cy: "42",
				rx: "2",
				ry: "3",
				fill: "#FFCDD2",
				stroke: "#B71C1C",
				strokeWidth: ".8",
				transform: "rotate(8 52 42)"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "60",
				cy: "49",
				rx: "2",
				ry: "3",
				fill: "#FFCDD2",
				stroke: "#B71C1C",
				strokeWidth: ".8",
				transform: "rotate(15 60 49)"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "46",
				cy: "58",
				rx: "2",
				ry: "3",
				fill: "#FFCDD2",
				stroke: "#B71C1C",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "57",
				cy: "61",
				rx: "2",
				ry: "3",
				fill: "#FFCDD2",
				stroke: "#B71C1C",
				strokeWidth: ".8",
				transform: "rotate(12 57 61)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "42",
				cy: "41",
				r: "5",
				fill: "white",
				stroke: "#B71C1C",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "58",
				cy: "41",
				r: "5",
				fill: "white",
				stroke: "#B71C1C",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "43",
				cy: "41",
				r: "3",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "59",
				cy: "41",
				r: "3",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "43.8",
				cy: "39.8",
				r: "1.2",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "59.8",
				cy: "39.8",
				r: "1.2",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "37",
				cy: "46",
				rx: "4",
				ry: "3",
				fill: "#FF8A80",
				opacity: ".65"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "63",
				cy: "46",
				rx: "4",
				ry: "3",
				fill: "#FF8A80",
				opacity: ".65"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M43 50Q50 56 57 50",
				stroke: "#B71C1C",
				strokeWidth: "1.5",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "40",
				y1: "74",
				x2: "36",
				y2: "84",
				stroke: "#B71C1C",
				strokeWidth: "4",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "60",
				y1: "74",
				x2: "64",
				y2: "84",
				stroke: "#B71C1C",
				strokeWidth: "4",
				strokeLinecap: "round"
			})
		]
	}),
	g10: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "75",
				cy: "12",
				r: "10",
				fill: "#FFD700",
				stroke: "#F57F17",
				strokeWidth: "1.5",
				opacity: ".85"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "54",
				width: "10",
				height: "31",
				rx: "2",
				fill: "#5D4037",
				stroke: "#3E2723",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "13",
				cy: "52",
				rx: "17",
				ry: "25",
				fill: "#2E7D32",
				stroke: "#1B5E20",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "13",
				cy: "45",
				rx: "12",
				ry: "18",
				fill: "#388E3C"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "9",
				cy: "48",
				r: "4",
				fill: "#8D6E63",
				stroke: "#4E342E",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "17",
				cy: "48",
				r: "4",
				fill: "#8D6E63",
				stroke: "#4E342E",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "9.8",
				cy: "47.5",
				r: "2",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "17.8",
				cy: "47.5",
				r: "2",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "10.3",
				cy: "46.7",
				r: ".8",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "18.3",
				cy: "46.7",
				r: ".8",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "43",
				y: "50",
				width: "12",
				height: "35",
				rx: "2",
				fill: "#5D4037",
				stroke: "#3E2723",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "49",
				cy: "45",
				rx: "21",
				ry: "30",
				fill: "#388E3C",
				stroke: "#1B5E20",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "49",
				cy: "36",
				rx: "15",
				ry: "22",
				fill: "#43A047"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "44",
				cy: "46",
				r: "4.5",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "54",
				cy: "46",
				r: "4.5",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "44.8",
				cy: "45.5",
				r: "2.2",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "54.8",
				cy: "45.5",
				r: "2.2",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "45.3",
				cy: "44.7",
				r: ".9",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "55.3",
				cy: "44.7",
				r: ".9",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "78",
				y: "56",
				width: "10",
				height: "29",
				rx: "2",
				fill: "#5D4037",
				stroke: "#3E2723",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "83",
				cy: "54",
				rx: "17",
				ry: "25",
				fill: "#2E7D32",
				stroke: "#1B5E20",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "83",
				cy: "47",
				rx: "12",
				ry: "18",
				fill: "#388E3C"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "79",
				cy: "39",
				rx: "3",
				ry: "7",
				fill: "#F8C8D4",
				stroke: "#C2185B",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "87",
				cy: "39",
				rx: "3",
				ry: "7",
				fill: "#F8C8D4",
				stroke: "#C2185B",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "79",
				cy: "39",
				rx: "1.5",
				ry: "4",
				fill: "#FFB6C1"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "87",
				cy: "39",
				rx: "1.5",
				ry: "4",
				fill: "#FFB6C1"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "34",
				y: "27",
				textAnchor: "middle",
				fontSize: "14",
				fill: "#FFD700",
				fontWeight: "bold",
				opacity: ".85",
				children: "?"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "64",
				y: "20",
				textAnchor: "middle",
				fontSize: "10",
				fill: "white",
				fontWeight: "bold",
				opacity: ".65",
				children: "?"
			})
		]
	}),
	g11: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "12",
				r: "2",
				fill: "white",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "12",
				y: "20",
				width: "32",
				height: "32",
				rx: "6",
				fill: "#66BB6A",
				stroke: "#2E7D32",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "14",
				y: "22",
				width: "14",
				height: "7",
				rx: "2",
				fill: "#A5D6A7",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "28",
				y: "44",
				textAnchor: "middle",
				fontSize: "22",
				fontWeight: "bold",
				fill: "white",
				children: "あ"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "56",
				y: "14",
				width: "32",
				height: "32",
				rx: "6",
				fill: "#42A5F5",
				stroke: "#1565C0",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "58",
				y: "16",
				width: "14",
				height: "7",
				rx: "2",
				fill: "#90CAF9",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "72",
				y: "38",
				textAnchor: "middle",
				fontSize: "22",
				fontWeight: "bold",
				fill: "white",
				children: "い"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "30",
				y: "52",
				width: "40",
				height: "28",
				rx: "6",
				fill: "#FFA726",
				stroke: "#E65100",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "32",
				y: "54",
				width: "18",
				height: "6",
				rx: "2",
				fill: "#FFCC80",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "50",
				y: "72",
				textAnchor: "middle",
				fontSize: "20",
				fontWeight: "bold",
				fill: "white",
				children: "う"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "8",
				cy: "52",
				r: "3",
				fill: "#FFD700",
				opacity: ".7"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "94",
				cy: "48",
				r: "2.5",
				fill: "#FF6B6B",
				opacity: ".6"
			})
		]
	}),
	g12: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "90",
				cy: "12",
				r: "2",
				fill: "#FFD700",
				opacity: ".6"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "38",
				width: "24",
				height: "30",
				rx: "4",
				fill: "#FF5252",
				stroke: "#B71C1C",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "10",
				y: "40",
				width: "10",
				height: "7",
				rx: "2",
				fill: "#FF8A80",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "20",
				y: "62",
				textAnchor: "middle",
				fontSize: "20",
				fontWeight: "bold",
				fill: "white",
				children: "1"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "38",
				y: "59",
				textAnchor: "middle",
				fontSize: "20",
				fontWeight: "bold",
				fill: "white",
				children: "+"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "52",
				y: "38",
				width: "24",
				height: "30",
				rx: "4",
				fill: "#66BB6A",
				stroke: "#2E7D32",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "54",
				y: "40",
				width: "10",
				height: "7",
				rx: "2",
				fill: "#A5D6A7",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "64",
				y: "62",
				textAnchor: "middle",
				fontSize: "20",
				fontWeight: "bold",
				fill: "white",
				children: "2"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "83",
				y: "59",
				textAnchor: "middle",
				fontSize: "20",
				fontWeight: "bold",
				fill: "white",
				children: "="
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "18",
				y: "12",
				width: "64",
				height: "20",
				rx: "5",
				fill: "rgba(255,255,255,.2)",
				stroke: "rgba(255,255,255,.5)",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("text", {
				x: "50",
				y: "26",
				textAnchor: "middle",
				fontSize: "14",
				fontWeight: "bold",
				fill: "white",
				children: "？"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "20",
				cy: "72",
				r: "4",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "30",
				cy: "72",
				r: "4",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "56",
				cy: "72",
				r: "4",
				fill: "#388E3C",
				stroke: "#1B5E20",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "66",
				cy: "72",
				r: "4",
				fill: "#388E3C",
				stroke: "#1B5E20",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "76",
				cy: "72",
				r: "4",
				fill: "#388E3C",
				stroke: "#1B5E20",
				strokeWidth: "1"
			})
		]
	}),
	g13: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "12",
				r: "2",
				fill: "white",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "50",
				cy: "45",
				rx: "36",
				ry: "32",
				fill: "#FFF3E0",
				stroke: "#E65100",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "56",
				cy: "50",
				rx: "12",
				ry: "10",
				fill: "#FFF3E0",
				opacity: ".9"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "24",
				cy: "38",
				r: "8",
				fill: "#E53935"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "20",
				r: "8",
				fill: "#FFD700"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "76",
				cy: "38",
				r: "8",
				fill: "#1565C0"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "62",
				cy: "58",
				r: "7",
				fill: "#66BB6A"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "38",
				cy: "58",
				r: "7",
				fill: "#9C27B0"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "38",
				cy: "30",
				rx: "8",
				ry: "5",
				fill: "white",
				opacity: ".3",
				transform: "rotate(-30 38 30)"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "70",
				y: "62",
				width: "8",
				height: "20",
				rx: "3",
				fill: "#E53935",
				stroke: "#B71C1C",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "71",
				y: "60",
				width: "6",
				height: "5",
				rx: "1",
				fill: "#8D6E63"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "52",
				r: "5",
				fill: "#FF6B6B",
				opacity: ".7"
			})
		]
	}),
	g14: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "80",
				cy: "14",
				r: "11",
				fill: "#FFD700",
				stroke: "#F57F17",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "80",
				y1: "0",
				x2: "80",
				y2: "4",
				stroke: "#F57F17",
				strokeWidth: "1.5",
				opacity: ".7"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "93",
				y1: "4",
				x2: "90",
				y2: "7",
				stroke: "#F57F17",
				strokeWidth: "1.5",
				opacity: ".7"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "95",
				y1: "14",
				x2: "91",
				y2: "14",
				stroke: "#F57F17",
				strokeWidth: "1.5",
				opacity: ".7"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "0",
				y: "70",
				width: "100",
				height: "15",
				fill: "#757575"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "20",
				y: "77",
				width: "12",
				height: "4",
				rx: "1",
				fill: "white",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "46",
				y: "77",
				width: "12",
				height: "4",
				rx: "1",
				fill: "white",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "72",
				y: "77",
				width: "12",
				height: "4",
				rx: "1",
				fill: "white",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "32",
				width: "22",
				height: "40",
				rx: "2",
				fill: "#F48FB1",
				stroke: "#C2185B",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "10",
				y: "34",
				width: "18",
				height: "6",
				rx: "1",
				fill: "#FCE4EC",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "12",
				y: "44",
				width: "5",
				height: "6",
				rx: "1",
				fill: "#80DEEA",
				stroke: "#0097A7",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "20",
				y: "44",
				width: "5",
				height: "6",
				rx: "1",
				fill: "#80DEEA",
				stroke: "#0097A7",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "12",
				y: "54",
				width: "5",
				height: "6",
				rx: "1",
				fill: "#FFE082",
				stroke: "#F57F17",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "20",
				y: "54",
				width: "5",
				height: "6",
				rx: "1",
				fill: "#80DEEA",
				stroke: "#0097A7",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "36",
				y: "18",
				width: "28",
				height: "54",
				rx: "2",
				fill: "#FF9800",
				stroke: "#E65100",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "38",
				y: "20",
				width: "24",
				height: "8",
				rx: "1",
				fill: "#FFE0B2",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "40",
				y: "32",
				width: "7",
				height: "7",
				rx: "1",
				fill: "#80DEEA",
				stroke: "#0097A7",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "51",
				y: "32",
				width: "7",
				height: "7",
				rx: "1",
				fill: "#FFE082",
				stroke: "#F57F17",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "40",
				y: "44",
				width: "7",
				height: "7",
				rx: "1",
				fill: "#FFE082",
				stroke: "#F57F17",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "51",
				y: "44",
				width: "7",
				height: "7",
				rx: "1",
				fill: "#80DEEA",
				stroke: "#0097A7",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "40",
				y: "56",
				width: "7",
				height: "7",
				rx: "1",
				fill: "#80DEEA",
				stroke: "#0097A7",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "51",
				y: "56",
				width: "7",
				height: "7",
				rx: "1",
				fill: "#FFE082",
				stroke: "#F57F17",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "50",
				y1: "18",
				x2: "50",
				y2: "6",
				stroke: "#9E9E9E",
				strokeWidth: "1.5",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "4",
				r: "3",
				fill: "#FF5252"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "70",
				y: "38",
				width: "24",
				height: "34",
				rx: "2",
				fill: "#66BB6A",
				stroke: "#2E7D32",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "72",
				y: "40",
				width: "20",
				height: "6",
				rx: "1",
				fill: "#C8E6C9",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "74",
				y: "50",
				width: "5",
				height: "6",
				rx: "1",
				fill: "#80DEEA",
				stroke: "#0097A7",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "82",
				y: "50",
				width: "5",
				height: "6",
				rx: "1",
				fill: "#FFE082",
				stroke: "#F57F17",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "74",
				y: "60",
				width: "5",
				height: "6",
				rx: "1",
				fill: "#FFE082",
				stroke: "#F57F17",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "82",
				y: "60",
				width: "5",
				height: "6",
				rx: "1",
				fill: "#80DEEA",
				stroke: "#0097A7",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "26",
				y: "62",
				width: "5",
				height: "8",
				rx: "1",
				fill: "#5D4037",
				stroke: "#3E2723",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "28.5",
				cy: "60",
				r: "7",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "1.2"
			})
		]
	}),
	g15: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("rect", {
				x: "6",
				y: "8",
				width: "16",
				height: "11",
				rx: "1",
				fill: "#E53935",
				stroke: "#B71C1C",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "6",
				y: "8",
				width: "16",
				height: "3.5",
				fill: "#E53935"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "6",
				y: "11.5",
				width: "16",
				height: "3.5",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "6",
				y: "15",
				width: "16",
				height: "4",
				fill: "#1565C0"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "5",
				y1: "7",
				x2: "5",
				y2: "25",
				stroke: "#795548",
				strokeWidth: "1.5",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "52",
				cy: "46",
				r: "33",
				fill: "#1565C0",
				stroke: "#0D47A1",
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M30 34Q40 28 48 34Q52 40 45 46Q38 50 33 44Z",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M55 32Q65 26 72 34Q76 42 68 48Q60 52 55 44Z",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M38 54Q50 51 56 59Q54 68 44 69Q36 66 36 58Z",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M60 56Q70 54 74 62Q72 70 64 70Q58 66 60 58Z",
				fill: "#66BB6A",
				stroke: "#2E7D32",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "38",
				cy: "34",
				rx: "10",
				ry: "7",
				fill: "white",
				opacity: ".2",
				transform: "rotate(-30 38 34)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "46",
				cy: "46",
				r: "4",
				fill: "white",
				stroke: "#0D47A1",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "58",
				cy: "46",
				r: "4",
				fill: "white",
				stroke: "#0D47A1",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "47",
				cy: "46",
				r: "2.5",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "59",
				cy: "46",
				r: "2.5",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "47.8",
				cy: "45",
				r: "1",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "59.8",
				cy: "45",
				r: "1",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M47 52Q52 56 57 52",
				stroke: "#0D47A1",
				strokeWidth: "1.5",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "78",
				cy: "22",
				r: "12",
				fill: "rgba(255,255,255,.12)",
				stroke: "white",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "78",
				cy: "22",
				r: "8",
				fill: "rgba(135,206,250,.25)",
				stroke: "rgba(255,255,255,.4)",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "87",
				y1: "31",
				x2: "94",
				y2: "39",
				stroke: "white",
				strokeWidth: "2.5",
				strokeLinecap: "round"
			})
		]
	}),
	g16: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("line", {
				x1: "50",
				y1: "3",
				x2: "50",
				y2: "14",
				stroke: "#FFD700",
				strokeWidth: "1.5",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "20",
				y1: "12",
				x2: "28",
				y2: "20",
				stroke: "#FFD700",
				strokeWidth: "1.5",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "80",
				y1: "12",
				x2: "72",
				y2: "20",
				stroke: "#FFD700",
				strokeWidth: "1.5",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "4",
				y1: "38",
				x2: "16",
				y2: "38",
				stroke: "#FFD700",
				strokeWidth: "1.5",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "96",
				y1: "38",
				x2: "84",
				y2: "38",
				stroke: "#FFD700",
				strokeWidth: "1.5",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "50,12 68,34 50,56 32,34",
				fill: "#B5EEFF",
				stroke: "#0288D1",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "50,12 68,34 50,34",
				fill: "#E8FAFF"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "50,12 32,34 50,34",
				fill: "#81D4FA"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "50,34 68,34 50,56",
				fill: "#29B6F6"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "50,34 32,34 50,56",
				fill: "#0288D1"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "43",
				cy: "21",
				rx: "5",
				ry: "3",
				fill: "white",
				opacity: ".72",
				transform: "rotate(-20 43 21)"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "22,52 34,66 22,80 10,66",
				fill: "#FF5252",
				stroke: "#B71C1C",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "22,52 34,66 22,66",
				fill: "#FF8A80"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "22,52 10,66 22,66",
				fill: "#E53935"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "22,66 34,66 22,80",
				fill: "#C62828"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "22,66 10,66 22,80",
				fill: "#B71C1C"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "17",
				cy: "59",
				rx: "3",
				ry: "2",
				fill: "white",
				opacity: ".6",
				transform: "rotate(-20 17 59)"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "78,52 90,66 78,80 66,66",
				fill: "#536DFE",
				stroke: "#1A237E",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "78,52 90,66 78,66",
				fill: "#8C9EFF"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "78,52 66,66 78,66",
				fill: "#3D5AFE"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "78,66 90,66 78,80",
				fill: "#283593"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "78,66 66,66 78,80",
				fill: "#1A237E"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "73",
				cy: "59",
				rx: "3",
				ry: "2",
				fill: "white",
				opacity: ".6",
				transform: "rotate(-20 73 59)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "9",
				cy: "24",
				r: "2.5",
				fill: "#FFD700",
				opacity: ".7"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "90",
				cy: "82",
				r: "2",
				fill: "#FFD700",
				opacity: ".6"
			})
		]
	}),
	s1: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "10",
				r: "2",
				fill: "white",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "20",
				y: "50",
				width: "60",
				height: "12",
				rx: "3",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "22",
				y: "52",
				width: "20",
				height: "4",
				rx: "1",
				fill: "#A5D6A7",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "20",
				y: "38",
				width: "12",
				height: "12",
				rx: "3",
				fill: "#42A5F5",
				stroke: "#1565C0",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "32",
				y: "38",
				width: "12",
				height: "12",
				rx: "3",
				fill: "#42A5F5",
				stroke: "#1565C0",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "44",
				y: "26",
				width: "12",
				height: "12",
				rx: "3",
				fill: "#42A5F5",
				stroke: "#1565C0",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "44",
				y: "38",
				width: "12",
				height: "12",
				rx: "3",
				fill: "#42A5F5",
				stroke: "#1565C0",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "56",
				y: "14",
				width: "12",
				height: "12",
				rx: "3",
				fill: "#FF5252",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "56",
				y: "26",
				width: "12",
				height: "12",
				rx: "3",
				fill: "#FF5252",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "68",
				y: "26",
				width: "12",
				height: "12",
				rx: "3",
				fill: "#FF5252",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "26",
				cy: "44",
				r: "2",
				fill: "white",
				stroke: "#1565C0",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "26.5",
				cy: "44",
				r: "1",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "38",
				cy: "44",
				r: "2",
				fill: "white",
				stroke: "#1565C0",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "38.5",
				cy: "44",
				r: "1",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "8",
				width: "12",
				height: "12",
				rx: "3",
				fill: "#FFD700",
				stroke: "#F57F17",
				strokeWidth: "1.5",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "20",
				width: "12",
				height: "12",
				rx: "3",
				fill: "#FFD700",
				stroke: "#F57F17",
				strokeWidth: "1.5",
				opacity: ".8"
			})
		]
	}),
	s2: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "12",
				r: "2",
				fill: "#FFD700",
				opacity: ".6"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "0",
				y: "68",
				width: "100",
				height: "17",
				rx: "3",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "72",
				y: "54",
				width: "10",
				height: "15",
				rx: "2",
				fill: "#8D6E63",
				stroke: "#5D4037",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "86",
				y: "46",
				width: "10",
				height: "23",
				rx: "2",
				fill: "#8D6E63",
				stroke: "#5D4037",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "30",
				cy: "52",
				rx: "18",
				ry: "12",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "44",
				cy: "46",
				rx: "10",
				ry: "12",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "38,36 42,25 46,36",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "39,36 42,28 45,36",
				fill: "#FFCDD2"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "48,34 52,23 56,34",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "49,34 52,26 55,34",
				fill: "#FFCDD2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "48",
				cy: "42",
				r: "3",
				fill: "white",
				stroke: "#E65100",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "48.6",
				cy: "42",
				r: "1.8",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "49",
				cy: "41.2",
				r: ".7",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "44",
				cy: "47",
				rx: "3",
				ry: "2",
				fill: "#FFCCBC",
				opacity: ".7"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M13 58Q0 50 4 40Q8 36 14 46",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "6",
				cy: "40",
				rx: "4",
				ry: "6",
				fill: "white",
				stroke: "#E65100",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "22",
				y1: "63",
				x2: "16",
				y2: "76",
				stroke: "#E65100",
				strokeWidth: "3",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "30",
				y1: "63",
				x2: "38",
				y2: "76",
				stroke: "#E65100",
				strokeWidth: "3",
				strokeLinecap: "round"
			})
		]
	}),
	s3: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "20",
				cy: "30",
				r: "1.5",
				fill: "white",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "75",
				cy: "18",
				r: "1",
				fill: "white",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "8",
				r: "1.5",
				fill: "white",
				opacity: ".5"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "50",
				cy: "45",
				rx: "12",
				ry: "22",
				fill: "#E53935",
				stroke: "#B71C1C",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "50,15 40,30 60,30",
				fill: "#FF7043",
				stroke: "#BF360C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "38",
				y: "52",
				width: "24",
				height: "8",
				rx: "2",
				fill: "#C62828"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "38",
				r: "7",
				fill: "#B2EBF2",
				stroke: "#00838F",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "38",
				r: "5",
				fill: "#E0F7FA"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "47",
				cy: "37",
				r: "1.5",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "53",
				cy: "37",
				r: "1.5",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M47 41Q50 43 53 41",
				stroke: "#00838F",
				strokeWidth: "1",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "44",
				cy: "64",
				rx: "4",
				ry: "8",
				fill: "#FF9800",
				opacity: ".9"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "56",
				cy: "64",
				rx: "4",
				ry: "8",
				fill: "#FF9800",
				opacity: ".9"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "50",
				cy: "66",
				rx: "5",
				ry: "10",
				fill: "#FFD700",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "28,42 38,36 38,58",
				fill: "#C62828",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "72,42 62,36 62,58",
				fill: "#C62828",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "22",
				cy: "22",
				r: "8",
				fill: "#7B1FA2",
				stroke: "#4A148C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "19",
				cy: "20",
				r: "2",
				fill: "white",
				stroke: "#4A148C",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "25",
				cy: "20",
				r: "2",
				fill: "white",
				stroke: "#4A148C",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "19.5",
				cy: "20",
				r: "1",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "25.5",
				cy: "20",
				r: "1",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "80",
				cy: "15",
				r: "7",
				fill: "#1565C0",
				stroke: "#0D47A1",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "77",
				cy: "13",
				r: "1.8",
				fill: "white",
				stroke: "#0D47A1",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "83",
				cy: "13",
				r: "1.8",
				fill: "white",
				stroke: "#0D47A1",
				strokeWidth: ".8"
			})
		]
	}),
	s4: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "10",
				r: "2",
				fill: "white",
				opacity: ".4"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "42",
				r: "34",
				fill: "none",
				stroke: "rgba(255,255,255,.5)",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "42",
				r: "25",
				fill: "none",
				stroke: "rgba(255,255,255,.5)",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "42",
				r: "16",
				fill: "none",
				stroke: "rgba(255,255,255,.6)",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "42",
				r: "7",
				fill: "#FF5252",
				stroke: "white",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "50",
				y1: "5",
				x2: "50",
				y2: "78",
				stroke: "rgba(255,255,255,.5)",
				strokeWidth: "1.5",
				strokeDasharray: "4 4"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "8",
				y1: "42",
				x2: "92",
				y2: "42",
				stroke: "rgba(255,255,255,.5)",
				strokeWidth: "1.5",
				strokeDasharray: "4 4"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "42",
				r: "5",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "22",
				cy: "22",
				r: "9",
				fill: "#4CAF50",
				stroke: "#2E7D32",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "20",
				cy: "20",
				r: "2.5",
				fill: "white",
				stroke: "#2E7D32",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "24",
				cy: "20",
				r: "2.5",
				fill: "white",
				stroke: "#2E7D32",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "20.5",
				cy: "20",
				r: "1.2",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "24.5",
				cy: "20",
				r: "1.2",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "78",
				cy: "65",
				r: "9",
				fill: "#E91E63",
				stroke: "#880E4F",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "76",
				cy: "63",
				r: "2.5",
				fill: "white",
				stroke: "#880E4F",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "80",
				cy: "63",
				r: "2.5",
				fill: "white",
				stroke: "#880E4F",
				strokeWidth: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "76.5",
				cy: "63",
				r: "1.2",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "80.5",
				cy: "63",
				r: "1.2",
				fill: "#1a1a2e"
			})
		]
	}),
	s5: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 85",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "88",
				cy: "12",
				r: "2",
				fill: "#FFD700",
				opacity: ".6"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "0",
				y: "38",
				width: "100",
				height: "22",
				fill: "#616161",
				stroke: "#424242",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "8",
				y: "47",
				width: "12",
				height: "4",
				rx: "1",
				fill: "white",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "30",
				y: "47",
				width: "12",
				height: "4",
				rx: "1",
				fill: "white",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "52",
				y: "47",
				width: "12",
				height: "4",
				rx: "1",
				fill: "white",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "74",
				y: "47",
				width: "12",
				height: "4",
				rx: "1",
				fill: "white",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "55",
				y: "28",
				width: "38",
				height: "18",
				rx: "4",
				fill: "#E53935",
				stroke: "#B71C1C",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "60",
				y: "20",
				width: "26",
				height: "10",
				rx: "3",
				fill: "#EF9A9A",
				stroke: "#B71C1C",
				strokeWidth: "1.2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "62",
				y: "22",
				width: "10",
				height: "7",
				rx: "1",
				fill: "#B2EBF2",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "76",
				y: "22",
				width: "8",
				height: "7",
				rx: "1",
				fill: "#B2EBF2",
				opacity: ".8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "63",
				cy: "46",
				r: "5",
				fill: "#424242",
				stroke: "#212121",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "63",
				cy: "46",
				r: "2.5",
				fill: "#9E9E9E"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "84",
				cy: "46",
				r: "5",
				fill: "#424242",
				stroke: "#212121",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "84",
				cy: "46",
				r: "2.5",
				fill: "#9E9E9E"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "28",
				cy: "32",
				rx: "9",
				ry: "7",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "28",
				cy: "22",
				r: "7",
				fill: "#FF8F00",
				stroke: "#E65100",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "22,22 18,25 22,27",
				fill: "#FFD700",
				stroke: "#F57F17",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "25",
				cy: "21",
				r: "2.5",
				fill: "white",
				stroke: "#E65100",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "25.5",
				cy: "21",
				r: "1.3",
				fill: "#1a1a2e"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "24",
				y1: "38",
				x2: "20",
				y2: "55",
				stroke: "#FFD700",
				strokeWidth: "3",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "32",
				y1: "38",
				x2: "36",
				y2: "55",
				stroke: "#FFD700",
				strokeWidth: "3",
				strokeLinecap: "round"
			})
		]
	}),
	g_mori: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 200 140",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("rect", {
				width: "200",
				height: "140",
				fill: "#87CEEB",
				rx: "8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "170",
				cy: "25",
				r: "18",
				fill: "#FFD700",
				opacity: "0.9"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "30,110 55,60 80,110",
				fill: "#2d7a2d"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "60,110 85,55 110,110",
				fill: "#3a9a3a"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "130,110 155,58 180,110",
				fill: "#2d7a2d"
			}),
			/* @__PURE__ */ jsx("rect", {
				y: "108",
				width: "200",
				height: "32",
				fill: "#5a8f3c"
			}),
			/* @__PURE__ */ jsx("rect", {
				y: "108",
				width: "200",
				height: "8",
				fill: "#7ab84a"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "82",
				y: "88",
				width: "36",
				height: "10",
				fill: "#e09a55",
				rx: "2"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "91",
				y1: "88",
				x2: "91",
				y2: "98",
				stroke: "#c8884a",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "99",
				y1: "88",
				x2: "99",
				y2: "98",
				stroke: "#c8884a",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "107",
				y1: "88",
				x2: "107",
				y2: "98",
				stroke: "#c8884a",
				strokeWidth: "1"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "65",
				cy: "90",
				rx: "10",
				ry: "11",
				fill: "#E8834A"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "65",
				cy: "84",
				rx: "7",
				ry: "7",
				fill: "#E8834A"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "59,79 57,71 63,76",
				fill: "#E8834A"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "71,79 73,71 67,76",
				fill: "#E8834A"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "65",
				cy: "84",
				rx: "4",
				ry: "4",
				fill: "#f5c499"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "63",
				cy: "82",
				r: "1.2",
				fill: "#222"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "67",
				cy: "82",
				r: "1.2",
				fill: "#222"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "20",
				y1: "92",
				x2: "45",
				y2: "92",
				stroke: "white",
				strokeWidth: "2",
				opacity: "0.6"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "15",
				y1: "96",
				x2: "40",
				y2: "96",
				stroke: "white",
				strokeWidth: "1.5",
				opacity: "0.4"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "100,70 102,76 108,76 103,80 105,86 100,82 95,86 97,80 92,76 98,76",
				fill: "#FFD700",
				opacity: "0.9"
			})
		]
	}),
	g_sora: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 200 140",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
				id: "skys",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ jsx("stop", {
					offset: "0%",
					stopColor: "#1a237e"
				}), /* @__PURE__ */ jsx("stop", {
					offset: "100%",
					stopColor: "#3F51B5"
				})]
			}) }),
			/* @__PURE__ */ jsx("rect", {
				width: "200",
				height: "140",
				fill: "url(#skys)",
				rx: "8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "20",
				cy: "15",
				r: "2",
				fill: "white",
				opacity: "0.8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "50",
				cy: "8",
				r: "1.5",
				fill: "white",
				opacity: "0.7"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "170",
				cy: "12",
				r: "2",
				fill: "white",
				opacity: "0.8"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "90",
				cy: "10",
				r: "1.5",
				fill: "white",
				opacity: "0.7"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "40",
				cy: "45",
				rx: "20",
				ry: "10",
				fill: "white",
				opacity: "0.25"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "160",
				cy: "60",
				rx: "18",
				ry: "9",
				fill: "white",
				opacity: "0.2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "150",
				cy: "40",
				r: "12",
				fill: "#E53935"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "148",
				cy: "37",
				r: "3",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "153",
				cy: "37",
				r: "3",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "148",
				cy: "38",
				r: "1.5",
				fill: "#222"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "153",
				cy: "38",
				r: "1.5",
				fill: "#222"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "30",
				cy: "75",
				r: "10",
				fill: "#8E24AA"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "28",
				cy: "73",
				r: "2.5",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "32",
				cy: "73",
				r: "2.5",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "28",
				cy: "74",
				r: "1.2",
				fill: "#222"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "32",
				cy: "74",
				r: "1.2",
				fill: "#222"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "95",
				cy: "92",
				rx: "11",
				ry: "14",
				fill: "#E91E63"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M84,97 Q95,115 106,97 Z",
				fill: "#F48FB1"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "95",
				cy: "78",
				rx: "9",
				ry: "10",
				fill: "#FFCDD2"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "95",
				cy: "72",
				rx: "9",
				ry: "7",
				fill: "#FFD700"
			}),
			/* @__PURE__ */ jsx("polygon", {
				points: "88,69 90,62 93,67 95,60 97,67 100,62 102,69",
				fill: "#FFD700"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "95",
				cy: "61",
				r: "2",
				fill: "#E91E63"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "92",
				cy: "76",
				r: "1.8",
				fill: "#222"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "98",
				cy: "76",
				r: "1.8",
				fill: "#222"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "82",
				cy: "85",
				rx: "10",
				ry: "5",
				fill: "white",
				opacity: "0.7",
				transform: "rotate(-20,82,85)"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "108",
				cy: "85",
				rx: "10",
				ry: "5",
				fill: "white",
				opacity: "0.7",
				transform: "rotate(20,108,85)"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "120",
				cy: "72",
				r: "4",
				fill: "#FFD700"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "137",
				cy: "62",
				r: "4",
				fill: "#FFD700"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "154",
				cy: "52",
				r: "4",
				fill: "#FFD700"
			})
		]
	}),
	g_bike: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 200 140",
		xmlns: "http://www.w3.org/2000/svg",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
				id: "sky2",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ jsx("stop", {
					offset: "0%",
					stopColor: "#FF8F00"
				}), /* @__PURE__ */ jsx("stop", {
					offset: "100%",
					stopColor: "#FF6D00"
				})]
			}) }),
			/* @__PURE__ */ jsx("rect", {
				width: "200",
				height: "140",
				fill: "url(#sky2)",
				rx: "8"
			}),
			/* @__PURE__ */ jsx("rect", {
				y: "95",
				width: "200",
				height: "45",
				fill: "#455A64"
			}),
			/* @__PURE__ */ jsx("rect", {
				y: "95",
				width: "200",
				height: "6",
				fill: "#546E7A"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "10",
				y: "115",
				width: "30",
				height: "4",
				fill: "white",
				opacity: "0.8",
				rx: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "60",
				y: "115",
				width: "30",
				height: "4",
				fill: "white",
				opacity: "0.8",
				rx: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "110",
				y: "115",
				width: "30",
				height: "4",
				fill: "white",
				opacity: "0.8",
				rx: "2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "160",
				y: "115",
				width: "30",
				height: "4",
				fill: "white",
				opacity: "0.8",
				rx: "2"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "0",
				y1: "70",
				x2: "50",
				y2: "70",
				stroke: "white",
				strokeWidth: "2",
				opacity: "0.5"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "0",
				y1: "78",
				x2: "40",
				y2: "78",
				stroke: "white",
				strokeWidth: "1.5",
				opacity: "0.35"
			}),
			/* @__PURE__ */ jsx("line", {
				x1: "0",
				y1: "85",
				x2: "55",
				y2: "85",
				stroke: "white",
				strokeWidth: "2",
				opacity: "0.45"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "95",
				cy: "93",
				r: "18",
				fill: "#212121"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "95",
				cy: "93",
				r: "12",
				fill: "#37474F"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "95",
				cy: "93",
				r: "5",
				fill: "#212121"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "145",
				cy: "96",
				r: "16",
				fill: "#212121"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "145",
				cy: "96",
				r: "10",
				fill: "#37474F"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "145",
				cy: "96",
				r: "4",
				fill: "#212121"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M100,78 L130,72 L148,80 L140,93",
				stroke: "#FF6D00",
				strokeWidth: "5",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M100,78 L95,93",
				stroke: "#FF6D00",
				strokeWidth: "5",
				fill: "none",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "118",
				cy: "80",
				rx: "16",
				ry: "8",
				fill: "#E64A19"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "118",
				cy: "78",
				rx: "12",
				ry: "5",
				fill: "#FF7043"
			}),
			/* @__PURE__ */ jsx("ellipse", {
				cx: "120",
				cy: "62",
				rx: "10",
				ry: "14",
				fill: "#1565C0"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "120",
				cy: "52",
				r: "12",
				fill: "#F44336"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "113",
				y: "54",
				width: "14",
				height: "6",
				fill: "#212121",
				rx: "3"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "75",
				cy: "90",
				r: "5",
				fill: "white",
				opacity: "0.3"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "65",
				cy: "86",
				r: "4",
				fill: "white",
				opacity: "0.2"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "170",
				y: "30",
				width: "3",
				height: "40",
				fill: "white",
				opacity: "0.8"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "173",
				y: "30",
				width: "8",
				height: "8",
				fill: "#222"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "181",
				y: "30",
				width: "8",
				height: "8",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "173",
				y: "38",
				width: "8",
				height: "8",
				fill: "white"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: "181",
				y: "38",
				width: "8",
				height: "8",
				fill: "#222"
			})
		]
	})
};
var LAST_UPDATE_DATE = "2026-05-18";
function getDaysSinceUpdate() {
	return Math.floor((/* @__PURE__ */ new Date() - new Date(LAST_UPDATE_DATE)) / 864e5);
}
function getSeason() {
	const m = (/* @__PURE__ */ new Date()).getMonth() + 1;
	if (m >= 3 && m <= 5) return {
		emoji: "🌸",
		color: "#ff8fab",
		glow: "rgba(255,143,171,0.5)",
		ja: "はるのゲームパーク！",
		en: "Spring Game Park!",
		zh: "春季游乐园！",
		ko: "봄 게임파크!",
		es: "¡Parque de Primavera!"
	};
	if (m >= 6 && m <= 8) return {
		emoji: "🌊",
		color: "#00d4ff",
		glow: "rgba(0,212,255,0.5)",
		ja: "なつのゲームパーク！",
		en: "Summer Game Park!",
		zh: "夏季游乐园！",
		ko: "여름 게임파크!",
		es: "¡Parque de Verano!"
	};
	if (m >= 9 && m <= 11) return {
		emoji: "🍂",
		color: "#e76f51",
		glow: "rgba(231,111,81,0.5)",
		ja: "あきのゲームパーク！",
		en: "Autumn Game Park!",
		zh: "秋季游乐园！",
		ko: "가을 게임파크!",
		es: "¡Parque de Otoño!"
	};
	return {
		emoji: "⛄",
		color: "#90e0ef",
		glow: "rgba(144,224,239,0.5)",
		ja: "ふゆのゲームパーク！",
		en: "Winter Game Park!",
		zh: "冬季游乐园！",
		ko: "겨울 게임파크!",
		es: "¡Parque de Invierno!"
	};
}
function getTodayIndex(n) {
	return (/* @__PURE__ */ new Date()).toDateString().split("").reduce((a, c) => a + c.charCodeAt(0), 0) % n;
}
var GAMES = [
	{
		id: "g1",
		route: "/shabondama",
		icon: "🫧",
		num: 1,
		color: "#4DB8FF",
		stars: 5,
		isNew: false,
		category: "アクション",
		ja: {
			name: "シャボンだまポン",
			desc: "とんでくる たまを\nタップしてわろう！"
		},
		en: {
			name: "Bubble Pop",
			desc: "Tap flying bubbles\nbefore they escape!"
		},
		zh: {
			name: "泡泡消消乐",
			desc: "点击飞来的\n泡泡消消乐！"
		},
		ko: {
			name: "비눗방울 팡",
			desc: "날아오는 거품을\n탭해서 터뜨려요!"
		},
		es: {
			name: "Burbuja Pop",
			desc: "¡Toca las burbujas\nantes de que escapen!"
		}
	},
	{
		id: "g2",
		route: "/kudamono-catch",
		icon: "🍎",
		num: 2,
		color: "#FF6B35",
		stars: 4,
		isNew: false,
		category: "アクション",
		ja: {
			name: "くだものキャッチ",
			desc: "おちてくる くだものを\nキャッチしよう！"
		},
		en: {
			name: "Fruit Catch",
			desc: "Catch falling fruits\nbefore they drop!"
		},
		zh: {
			name: "接水果",
			desc: "接住掉落的水果！"
		},
		ko: {
			name: "과일 캐치",
			desc: "떨어지는 과일을\n잡아요!"
		},
		es: {
			name: "Atrapa Frutas",
			desc: "¡Atrapa las frutas\nantes de que caigan!"
		}
	},
	{
		id: "g3",
		route: "/meiro",
		icon: "🗺️",
		num: 3,
		color: "#7B68EE",
		stars: 4,
		isNew: false,
		category: "パズル",
		ja: {
			name: "めいろあそび",
			desc: "めいろを とおって\nゴールをめざせ！"
		},
		en: {
			name: "Maze Play",
			desc: "Navigate the maze\nto reach the goal!"
		},
		zh: {
			name: "迷宫游戏",
			desc: "穿过迷宫\n到达终点！"
		},
		ko: {
			name: "미로 게임",
			desc: "미로를 통과해\n골인!"
		},
		es: {
			name: "Laberinto",
			desc: "¡Navega el laberinto\nhasta la meta!"
		}
	},
	{
		id: "g4",
		route: "/doubutsu-puzzle",
		icon: "🧩",
		num: 4,
		color: "#2ECC71",
		stars: 5,
		isNew: false,
		category: "パズル",
		ja: {
			name: "どうぶつパズル",
			desc: "どうぶつを ならべて\nパズルをとこう！"
		},
		en: {
			name: "Animal Puzzle",
			desc: "Line up animals\nto solve the puzzle!"
		},
		zh: {
			name: "动物拼图",
			desc: "排列动物\n解开拼图！"
		},
		ko: {
			name: "동물 퍼즐",
			desc: "동물을 맞춰\n퍼즐을 풀어요!"
		},
		es: {
			name: "Puzzle Animal",
			desc: "¡Ordena animales\ny resuelve el puzzle!"
		}
	},
	{
		id: "g5",
		route: "/kazu-asobi",
		icon: "🔢",
		num: 5,
		color: "#F4D03F",
		stars: 3,
		isNew: false,
		category: "かずあそび",
		ja: {
			name: "かずあそび",
			desc: "かずを かぞえて\nたのしく まなぼう！"
		},
		en: {
			name: "Number Fun",
			desc: "Count and learn\nnumbers with fun!"
		},
		zh: {
			name: "数字游戏",
			desc: "数数字\n快乐学习！"
		},
		ko: {
			name: "숫자 놀이",
			desc: "숫자를 세며\n즐겁게 배워요!"
		},
		es: {
			name: "Juego de Números",
			desc: "¡Cuenta y aprende\nnúmeros!"
		}
	},
	{
		id: "g6",
		route: "/animal-soccer",
		icon: "⚽",
		num: 6,
		color: "#00BCD4",
		stars: 5,
		isNew: false,
		category: "アクション",
		ja: {
			name: "どうぶつサッカー",
			desc: "どうぶつたちと\nサッカーをしよう！"
		},
		en: {
			name: "Animal Soccer",
			desc: "Play soccer with\ncute animals!"
		},
		zh: {
			name: "动物足球",
			desc: "和动物们\n踢足球！"
		},
		ko: {
			name: "동물 축구",
			desc: "동물들과\n축구해요!"
		},
		es: {
			name: "Fútbol Animal",
			desc: "¡Juega al fútbol\ncon animales!"
		}
	},
	{
		id: "g8",
		route: "/sushi",
		icon: "🍣",
		num: 8,
		color: "#FF5722",
		stars: 5,
		isNew: false,
		category: "アクション",
		ja: {
			name: "さーもん",
			desc: "かいてんずし！\nサーモンだけ\nタップしよう！"
		},
		en: {
			name: "Catch Salmon",
			desc: "Tap only salmon\nin the sushi conveyor!"
		},
		zh: {
			name: "捉三文鱼",
			desc: "旋转寿司！\n只点三文鱼！"
		},
		ko: {
			name: "연어잡기",
			desc: "회전초밥에서\n연어만 탭해요!"
		},
		es: {
			name: "Atrapa Salmón",
			desc: "¡Toca solo el salmón\nen el conveyor!"
		}
	},
	{
		id: "g9",
		route: "/ichigo",
		icon: "🍓",
		num: 9,
		color: "#E91E63",
		stars: 5,
		isNew: false,
		category: "アクション",
		ja: {
			name: "いちご",
			desc: "30びょうで\nいちごを\nあつめよう！"
		},
		en: {
			name: "Strawberry Time",
			desc: "Collect strawberries\nin 30 seconds!"
		},
		zh: {
			name: "草莓时间",
			desc: "30秒内收集\n草莓！"
		},
		ko: {
			name: "딸기 모으기",
			desc: "30초 안에\n딸기를 모아요!"
		},
		es: {
			name: "Tiempo de Fresa",
			desc: "¡Recoge fresas\nen 30 segundos!"
		}
	},
	{
		id: "g10",
		route: "/kakurenbo",
		icon: "🔍",
		num: 10,
		color: "#2d6a4f",
		stars: 5,
		isNew: false,
		category: "パズル",
		ja: {
			name: "どうぶつかくれんぼ",
			desc: "くさむらや きのうらに\nどうぶつが かくれてるよ！"
		},
		en: {
			name: "Animal Hide & Seek",
			desc: "Find the animals\nhiding in the bushes!"
		},
		zh: {
			name: "动物捉迷藏",
			desc: "找找藏在\n草丛里的动物！"
		},
		ko: {
			name: "동물 숨바꼭질",
			desc: "풀숲에 숨어있는\n동물을 찾아요!"
		},
		es: {
			name: "Busca Animales",
			desc: "¡Encuentra los animales\nescondidos!"
		}
	},
	{
		id: "g11",
		route: "/moji",
		icon: "🔤",
		num: 11,
		color: "#4CAF50",
		stars: 3,
		isNew: false,
		category: "もじあそび",
		ja: {
			name: "もじあそび",
			desc: "えをみて ただしい\nひらがなを えらんでね！"
		},
		en: {
			name: "Letter Fun",
			desc: "Look at the picture\nand choose the right hiragana!"
		},
		zh: {
			name: "文字游戏",
			desc: "看图选择\n正确的平假名！"
		},
		ko: {
			name: "글자 놀이",
			desc: "그림을 보고\n히라가나를 골라요!"
		},
		es: {
			name: "Letras",
			desc: "¡Mira el dibujo y\nelige la letra!"
		}
	},
	{
		id: "g12",
		route: "/tashizan",
		icon: "➕",
		num: 12,
		color: "#2196F3",
		stars: 3,
		isNew: false,
		category: "かずあそび",
		ja: {
			name: "たしざんゲーム",
			desc: "どうぶつを かぞえて\nこたえをえらんでね！"
		},
		en: {
			name: "Math Quiz",
			desc: "Count animals and\nchoose the right answer!"
		},
		zh: {
			name: "加法游戏",
			desc: "数动物\n选答案！"
		},
		ko: {
			name: "덧셈 게임",
			desc: "동물을 세어\n답을 골라요!"
		},
		es: {
			name: "Suma",
			desc: "¡Cuenta animales y\nelige la respuesta!"
		}
	},
	{
		id: "g13",
		route: "/iro",
		icon: "🎨",
		num: 13,
		color: "#9C27B0",
		stars: 3,
		isNew: false,
		category: "パズル",
		ja: {
			name: "いろあわせ",
			desc: "いろを まぜると\nなんいろになるかな？"
		},
		en: {
			name: "Color Match",
			desc: "Mix colors and find\nthe right answer!"
		},
		zh: {
			name: "颜色配对",
			desc: "混合颜色\n是什么颜色？"
		},
		ko: {
			name: "색깔 맞추기",
			desc: "색을 섞으면\n무슨 색이 될까요?"
		},
		es: {
			name: "Colores",
			desc: "¡Mezcla colores y\nencontra el resultado!"
		}
	},
	{
		id: "g14",
		route: "/machi",
		icon: "🏙️",
		num: 14,
		color: "#00897B",
		stars: 5,
		isNew: false,
		category: "そうぞう",
		ja: {
			name: "わくわくまちづくり",
			desc: "じぶんだけの\nすてきなまちを\nつくろう！"
		},
		en: {
			name: "City Builder",
			desc: "Build your own\namazing city!"
		},
		zh: {
			name: "建造城市",
			desc: "建造属于自己的\n美丽城市！"
		},
		ko: {
			name: "도시 만들기",
			desc: "나만의 멋진\n도시를 만들어요!"
		},
		es: {
			name: "Constructor",
			desc: "¡Construye tu propia\nciudad increíble!"
		}
	},
	{
		id: "g15",
		route: "/kokki",
		icon: "🌍",
		num: 15,
		color: "#0d47a1",
		stars: 4,
		isNew: false,
		category: "クイズ",
		ja: {
			name: "こっきクイズ",
			desc: "せかいの こっきを\nみわけよう！\n30かこく以上！"
		},
		en: {
			name: "Flag Quiz",
			desc: "Identify world flags!\n30+ countries!\nTest your knowledge!"
		},
		zh: {
			name: "国旗问答",
			desc: "识别世界各国国旗！\n30多个国家！"
		},
		ko: {
			name: "국기 퀴즈",
			desc: "세계 국기를 맞혀봐!\n30개국 이상!"
		},
		es: {
			name: "Quiz de Banderas",
			desc: "¡Identifica banderas!\n¡Más de 30 países!"
		}
	},
	{
		id: "g16",
		route: "/jewelry-master",
		icon: "💍",
		num: 16,
		color: "#7b1fa2",
		stars: 4,
		isNew: false,
		category: "そうぞう",
		ja: {
			name: "ジュエリーマスター",
			desc: "おきゃくさんのリクエストに\nこたえて ほうせきを\nえらぼう！"
		},
		en: {
			name: "Jewelry Master",
			desc: "Pick the right gem\n& accessory for\nyour customers!"
		},
		zh: {
			name: "珠宝大师",
			desc: "根据客人的要求\n选择正确的宝石\n和饰品！"
		},
		ko: {
			name: "주얼리 마스터",
			desc: "손님의 요청에 맞는\n보석과 액세서리를\n골라요！"
		},
		es: {
			name: "Maestro Joyero",
			desc: "¡Elige la joya\ny accesorio que\npide el cliente!"
		}
	}
];
var SCHOOL_GAMES = [
	{
		id: "s1",
		route: "/tetris",
		icon: "🧱",
		num: 1,
		color: "#4a90ff",
		stars: 5,
		isNew: false,
		category: "パズル",
		ja: {
			name: "どうぶつブロック",
			desc: "ブロックをならべて\nラインをけそう！\nテトリス風ゲーム！"
		},
		en: {
			name: "Animal Blocks",
			desc: "Stack blocks and\nclear the lines!\nTetris-style game!"
		},
		zh: {
			name: "动物方块",
			desc: "叠方块消行！\n俄罗斯方块！"
		},
		ko: {
			name: "동물 블록",
			desc: "블록을 쌓아\n줄을 없애요!"
		},
		es: {
			name: "Bloques Animal",
			desc: "¡Apila bloques y\nelimina líneas!"
		}
	},
	{
		id: "s2",
		route: "/runner",
		icon: "🏃",
		num: 2,
		color: "#43A047",
		stars: 4,
		isNew: false,
		category: "レース",
		ja: {
			name: "どうぶつランナー",
			desc: "タップでジャンプ！\n2かいジャンプもできるよ！\n障害物をよけて走れ！"
		},
		en: {
			name: "Animal Runner",
			desc: "Tap to jump!\nDouble jump available!\nAvoid obstacles!"
		},
		zh: {
			name: "动物跑酷",
			desc: "点击跳跃！\n二段跳也可以！"
		},
		ko: {
			name: "동물 러너",
			desc: "탭으로 점프!\n이단점프도 돼요!"
		},
		es: {
			name: "Corredor Animal",
			desc: "¡Toca para saltar!\n¡Doble salto!"
		}
	},
	{
		id: "s3",
		route: "/shooting",
		icon: "🚀",
		num: 3,
		color: "#e53935",
		stars: 5,
		isNew: false,
		category: "アクション",
		ja: {
			name: "どうぶつシューティング",
			desc: "てきをたおして\nボスをやっつけろ！\nシューティングゲーム！"
		},
		en: {
			name: "Animal Shooter",
			desc: "Defeat enemies\nand beat the boss!\nShooter game!"
		},
		zh: {
			name: "动物射击",
			desc: "消灭敌人\n打败BOSS！"
		},
		ko: {
			name: "동물 슈팅",
			desc: "적을 물리치고\n보스를 쓰러뜨려요!"
		},
		es: {
			name: "Shooter Animal",
			desc: "¡Elimina enemigos\ny derrota al jefe!"
		}
	},
	{
		id: "s4",
		route: "/sniper",
		icon: "🎯",
		num: 4,
		color: "#2d6a4f",
		stars: 4,
		isNew: false,
		category: "アクション",
		ja: {
			name: "どうぶつスナイパー",
			desc: "うごくどうぶつを\nタップでねらえ！\nフェイクに注意！"
		},
		en: {
			name: "Animal Sniper",
			desc: "Tap moving animals\nto score points!\nWatch for fakes!"
		},
		zh: {
			name: "动物狙击手",
			desc: "点击移动动物\n积累分数！"
		},
		ko: {
			name: "동물 스나이퍼",
			desc: "움직이는 동물을\n탭해서 맞혀요!"
		},
		es: {
			name: "Francotirador",
			desc: "¡Toca animales\nen movimiento!"
		}
	},
	{
		id: "s5",
		route: "/crossing",
		icon: "🐔",
		num: 5,
		color: "#e65100",
		stars: 5,
		isNew: false,
		category: "レース",
		ja: {
			name: "どうぶつクロッシング",
			desc: "みちをわたって\nどこまでいけるかな？\nくるまに気をつけて！"
		},
		en: {
			name: "Animal Crossing",
			desc: "Cross the road\nand go as far as you can!\nWatch for cars!"
		},
		zh: {
			name: "动物过马路",
			desc: "穿越马路\n走多远？"
		},
		ko: {
			name: "동물 크로싱",
			desc: "길을 건너\n얼마나 멀리 갈까요?"
		},
		es: {
			name: "Animal Crossing",
			desc: "¡Cruza la calle\ny llega lejos!"
		}
	},
	{
		id: "g_mori",
		route: "/mori",
		icon: "🌲",
		num: 6,
		color: "#2e7d32",
		stars: 4,
		isNew: false,
		category: "アクション",
		ja: {
			name: "もりのなかまたち",
			desc: "もりをとびこえて\nゴールをめざせ！"
		},
		en: {
			name: "Forest Friends",
			desc: "Jump through the forest\nand reach the goal!"
		},
		zh: {
			name: "森林伙伴",
			desc: "穿越森林\n冲向终点！"
		},
		ko: {
			name: "숲속 친구들",
			desc: "숲을 뛰어넘어\n골인 지점을 향해!"
		},
		es: {
			name: "Amigos del Bosque",
			desc: "¡Salta por el bosque\ny llega a la meta!"
		}
	},
	{
		id: "g_sora",
		route: "/sora",
		icon: "👸",
		num: 7,
		color: "#7b1fa2",
		stars: 4,
		isNew: false,
		category: "アクション",
		ja: {
			name: "そらとびプリンセス",
			desc: "そらをとんで\nてきをたおそう！"
		},
		en: {
			name: "Sky Princess",
			desc: "Fly through the sky\nand defeat enemies!"
		},
		zh: {
			name: "飞天公主",
			desc: "翱翔天空\n消灭敌人！"
		},
		ko: {
			name: "하늘나는 공주",
			desc: "하늘을 날아\n적을 물리쳐요!"
		},
		es: {
			name: "Princesa del Cielo",
			desc: "¡Vuela por el cielo\ny derrota enemigos!"
		}
	},
	{
		id: "g_bike",
		route: "/bike",
		icon: "🏍️",
		num: 8,
		color: "#f57c00",
		stars: 3,
		isNew: false,
		category: "レース",
		ja: {
			name: "わくわくバイク",
			desc: "バイクでコースを\nはしりぬけろ！"
		},
		en: {
			name: "Wakuwaku Bike",
			desc: "Race through the course\non your bike!"
		},
		zh: {
			name: "嗡嗡摩托",
			desc: "骑摩托车\n冲过赛道！"
		},
		ko: {
			name: "두근두근 바이크",
			desc: "오토바이로\n코스를 달려요!"
		},
		es: {
			name: "Moto Wakuwaku",
			desc: "¡Corre por el circuito\nen tu moto!"
		}
	},
	{
		id: "g_kart",
		route: "/kart",
		icon: "🏎️",
		num: 9,
		color: "#e53935",
		stars: 3,
		isNew: false,
		category: "レース",
		ja: {
			name: "アニマルカートGP",
			desc: "どうぶつたちのカートで\nコースをはしりぬけろ！"
		},
		en: {
			name: "Animal Kart GP",
			desc: "Race with animal karts\naround the course!"
		},
		zh: {
			name: "动物卡丁车GP",
			desc: "驾驶动物卡丁车\n冲过赛道！"
		},
		ko: {
			name: "애니멀 카트 GP",
			desc: "동물 카트로\n코스를 달려요!"
		},
		es: {
			name: "Kart de Animales GP",
			desc: "¡Corre con karts\nde animales!"
		}
	}
];
var CLOUDS = [
	{
		id: 0,
		top: "8%",
		left: "5%",
		size: 52,
		dur: "7s",
		delay: "0s"
	},
	{
		id: 1,
		top: "5%",
		left: "30%",
		size: 64,
		dur: "9s",
		delay: "1.5s"
	},
	{
		id: 2,
		top: "12%",
		left: "55%",
		size: 46,
		dur: "6s",
		delay: "3s"
	},
	{
		id: 3,
		top: "4%",
		left: "75%",
		size: 58,
		dur: "8s",
		delay: "0.8s"
	},
	{
		id: 4,
		top: "18%",
		left: "88%",
		size: 42,
		dur: "7.5s",
		delay: "2s"
	},
	{
		id: 5,
		top: "22%",
		left: "15%",
		size: 36,
		dur: "6.5s",
		delay: "4s"
	}
];
var DRIFT_CLOUDS = [
	{
		id: "dc0",
		top: "6%",
		size: 48,
		dur: "24s",
		delay: "0s"
	},
	{
		id: "dc1",
		top: "14%",
		size: 62,
		dur: "32s",
		delay: "-11s"
	},
	{
		id: "dc2",
		top: "3%",
		size: 38,
		dur: "20s",
		delay: "-6s"
	}
];
var FISH_LIST = [
	{
		id: "f0",
		emoji: "🐠",
		dur: "15s",
		delay: "0s",
		rtl: false
	},
	{
		id: "f1",
		emoji: "🐟",
		dur: "20s",
		delay: "-8s",
		rtl: true
	},
	{
		id: "f2",
		emoji: "🐬",
		dur: "17s",
		delay: "-4s",
		rtl: false
	}
];
function PlayCounter({ target, lang }) {
	const [display, setDisplay] = useState(0);
	const rafRef = useRef(null);
	useEffect(() => {
		if (!target) return;
		const duration = 1200;
		const start = Date.now();
		const tick = () => {
			const p = Math.min((Date.now() - start) / duration, 1);
			const e = 1 - Math.pow(1 - p, 3);
			setDisplay(Math.round(e * target));
			if (p < 1) rafRef.current = requestAnimationFrame(tick);
		};
		const tm = setTimeout(() => {
			rafRef.current = requestAnimationFrame(tick);
		}, 400);
		return () => {
			clearTimeout(tm);
			cancelAnimationFrame(rafRef.current);
		};
	}, [target]);
	return /* @__PURE__ */ jsxs("div", {
		className: "tp-counter",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "tp-counter-icon",
				children: "🎮"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "tp-counter-body",
				children: [/* @__PURE__ */ jsx("div", {
					className: "tp-counter-label",
					children: lang === "en" ? "Times Played Together" : lang === "zh" ? "一起游玩的次数" : lang === "ko" ? "함께 플레이한 횟수" : lang === "es" ? "Veces jugadas" : "みんなであそんだかず"
				}), /* @__PURE__ */ jsx("div", {
					className: "tp-counter-num",
					children: display.toLocaleString()
				})]
			}),
			/* @__PURE__ */ jsx("span", {
				className: "tp-counter-unit",
				children: lang === "en" ? "times" : lang === "zh" ? "次" : lang === "ko" ? "번" : lang === "es" ? "veces" : "かい"
			})
		]
	});
}
function GameCard({ game, lang, isRecommended, onClick, animIndex }) {
	const t = game[lang] || game.ja;
	const gradient = CARD_GRADIENTS[game.category] || DEFAULT_GRADIENT;
	const starsFilled = Math.round(game.stars);
	const svg = GAME_SVGS[game.id] || null;
	return /* @__PURE__ */ jsxs("button", {
		className: `tp-card${isRecommended ? " tp-card--recommend" : ""}`,
		style: {
			"--card-gradient": gradient,
			"--card-delay": `${(animIndex ?? 0) * .08}s`
		},
		onClick,
		children: [
			isRecommended && /* @__PURE__ */ jsx("div", {
				className: "tp-card-ribbon",
				children: {
					ja: "⭐ きょうのおすすめ！",
					en: "⭐ Today's Pick!",
					zh: "⭐ 今日推荐！",
					ko: "⭐ 오늘의 추천!",
					es: "⭐ ¡Recomendado!"
				}[lang] || "⭐ きょうのおすすめ！"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "tp-card-art",
				children: [
					game.category && /* @__PURE__ */ jsx("span", {
						className: "tp-card-cat",
						children: game.category
					}),
					game.isNew && /* @__PURE__ */ jsx("span", {
						className: "tp-card-new",
						children: "NEW"
					}),
					svg || /* @__PURE__ */ jsx("span", {
						className: "tp-card-icon-fb",
						children: game.icon
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "tp-card-body",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "tp-card-name",
						children: t.name
					}),
					/* @__PURE__ */ jsx("div", {
						className: "tp-card-desc",
						children: t.desc.split("\n").map((line, i, arr) => /* @__PURE__ */ jsxs(React.Fragment, { children: [line, i < arr.length - 1 && /* @__PURE__ */ jsx("br", {})] }, i))
					}),
					/* @__PURE__ */ jsx("div", {
						className: "tp-card-stars",
						children: Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ jsx("span", {
							className: i < starsFilled ? "tp-star tp-star--filled" : "tp-star",
							children: "★"
						}, i))
					})
				]
			})
		]
	});
}
function TopPage() {
	const navigate = useNavigate();
	const [lang, setLang] = useState(() => (typeof localStorage !== "undefined" ? localStorage.getItem("wakuwaku_lang") : null) || "ja");
	const [isMuted, setIsMuted] = useState(() => typeof localStorage !== "undefined" && localStorage.getItem("wakuwaku_bgm") === "off");
	const [playCount, setPlayCount] = useState(0);
	const [kisekaeState, setKisekaeState] = useState(() => {
		try {
			const saved = typeof localStorage !== "undefined" && localStorage.getItem("kisekae_state");
			return saved ? JSON.parse(saved) : DEFAULT_KISEKAE;
		} catch {
			return DEFAULT_KISEKAE;
		}
	});
	const [panelOpen, setPanelOpen] = useState(false);
	const [panelChara, setPanelChara] = useState("princess");
	const [shopOpen, setShopOpen] = useState(false);
	const [coins, setCoins] = useState(() => typeof localStorage !== "undefined" ? getCoins() : 0);
	const [loginBonus, setLoginBonus] = useState(null);
	const [activeTab, setActiveTab] = useState(() => (typeof localStorage !== "undefined" ? localStorage.getItem("wakuwaku_tab") : null) || "kids");
	const [categoryFilter, setCategoryFilter] = useState("すべて");
	const [recentRoutes, setRecentRoutes] = useState(() => typeof localStorage !== "undefined" ? getRecentGames() : []);
	const season = getSeason();
	const daysSince = getDaysSinceUpdate();
	const todayIdx = getTodayIndex(GAMES.length);
	function switchTab(tab) {
		setActiveTab(tab);
		localStorage.setItem("wakuwaku_tab", tab);
		setCategoryFilter("すべて");
	}
	const recentGames = recentRoutes.map((route) => ALL_GAMES.find((g) => g.route === route)).filter(Boolean);
	useEffect(() => {
		if (localStorage.getItem("wakuwaku_bgm") !== "off") startBGM();
		setPlayCount(getPlayCount() + 1312);
		const bonus = checkLoginBonus();
		if (bonus) setLoginBonus(bonus);
		return () => stopBGM();
	}, []);
	function handleMuteToggle() {
		toggleBGM();
		setIsMuted((prev) => {
			const next = !prev;
			localStorage.setItem("wakuwaku_bgm", next ? "off" : "on");
			return next;
		});
	}
	function spawnParticles(x, y) {
		const emojis = [
			"✨",
			"💖",
			"⭐",
			"🌟",
			"💫",
			"🎉"
		];
		for (let i = 0; i < 6; i++) {
			const el = document.createElement("span");
			el.className = "ww-particle";
			el.textContent = emojis[i % emojis.length];
			el.style.left = x + "px";
			el.style.top = y + "px";
			const angle = i / 6 * Math.PI * 2;
			el.style.setProperty("--px", Math.cos(angle) * 80 + "px");
			el.style.setProperty("--py", Math.sin(angle) * 80 - 40 + "px");
			document.body.appendChild(el);
			setTimeout(() => {
				if (el.parentNode) el.remove();
			}, 800);
		}
	}
	function openPanel(chara) {
		setPanelChara(chara);
		setPanelOpen(true);
	}
	function handleLoginBonusClaim() {
		claimLoginBonus();
		setCoins(getCoins());
		setLoginBonus(null);
	}
	function handleKisekaeChange(next) {
		setKisekaeState(next);
		localStorage.setItem("kisekae_state", JSON.stringify(next));
	}
	const LANG_FLAGS = {
		ja: "🇯🇵",
		en: "🇺🇸",
		zh: "🇨🇳",
		ko: "🇰🇷",
		es: "🇪🇸"
	};
	const LANG_ORDER = [
		"ja",
		"en",
		"zh",
		"ko",
		"es"
	];
	function handleLangToggle() {
		const next = LANG_ORDER[(LANG_ORDER.indexOf(lang) + 1) % LANG_ORDER.length];
		setLang(next);
		localStorage.setItem("wakuwaku_lang", next);
	}
	lang === "en" ? daysSince === 0 || `${daysSince}` : lang === "zh" ? daysSince === 0 || `${daysSince}` : lang === "ko" ? daysSince === 0 || `${daysSince}` : lang === "es" ? daysSince === 0 || `${daysSince}` : daysSince === 0 || `${daysSince}`;
	return /* @__PURE__ */ jsxs("div", {
		className: "tp-wrap",
		children: [
			/* @__PURE__ */ jsxs(Helmet, { children: [
				/* @__PURE__ */ jsx("title", { children: "わくわくアイランド｜こども向け無料ブラウザゲーム" }),
				/* @__PURE__ */ jsx("meta", {
					name: "description",
					content: "幼児・小学生向けの無料ミニゲームが20種類以上。かず・もじ・パズル・アクション・レースなどを登録不要・インストール不要でブラウザですぐ遊べます。"
				}),
				/* @__PURE__ */ jsx("link", {
					rel: "canonical",
					href: "https://wakuwaku-island.pages.dev/"
				})
			] }),
			/* @__PURE__ */ jsxs("div", {
				className: "tp-clouds",
				"aria-hidden": "true",
				children: [
					CLOUDS.map((c) => /* @__PURE__ */ jsx("div", {
						className: "tp-cloud",
						style: {
							top: c.top,
							left: c.left,
							fontSize: c.size,
							"--dur": c.dur,
							"--delay": c.delay
						},
						children: "☁️"
					}, c.id)),
					/* @__PURE__ */ jsx("div", {
						className: "tp-sun-wrap",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx("span", {
							className: "tp-sun-body",
							children: "☀️"
						})
					}),
					DRIFT_CLOUDS.map((c) => /* @__PURE__ */ jsx("div", {
						className: "tp-cloud-drift",
						style: {
							top: c.top,
							fontSize: c.size,
							"--dur": c.dur,
							"--delay": c.delay
						},
						children: "☁️"
					}, c.id))
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "tp-deco",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ jsx("span", {
						style: {
							left: "4%",
							top: "28%",
							"--dur": "3.8s",
							"--rot": "-4deg",
							fontSize: 28
						},
						children: "🌺"
					}),
					/* @__PURE__ */ jsx("span", {
						style: {
							right: "4%",
							top: "24%",
							"--dur": "3.5s",
							"--rot": "8deg",
							fontSize: 26
						},
						children: "🌟"
					}),
					/* @__PURE__ */ jsx("span", {
						style: {
							left: "3%",
							top: "48%",
							"--dur": "4s",
							"--rot": "-8deg",
							fontSize: 24
						},
						children: "🦋"
					}),
					/* @__PURE__ */ jsx("span", {
						style: {
							right: "3%",
							top: "46%",
							"--dur": "3.3s",
							"--rot": "5deg",
							fontSize: 22
						},
						children: "🌈"
					}),
					FISH_LIST.map((f) => /* @__PURE__ */ jsx("span", {
						className: f.rtl ? "tp-fish-rtl" : "tp-fish",
						style: {
							fontSize: 26,
							"--dur": f.dur,
							"--delay": f.delay
						},
						children: f.emoji
					}, f.id))
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "tp-top-btns",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "tp-coin-badge",
						children: ["🪙 ", /* @__PURE__ */ jsx("span", {
							className: "tp-coin-num",
							children: coins
						})]
					}),
					/* @__PURE__ */ jsxs("button", {
						className: "tp-top-btn tp-shop-btn",
						onClick: () => setShopOpen(true),
						title: lang === "en" ? "Shop" : "ショップ",
						children: ["🛒 ", {
							ja: "ショップ",
							en: "Shop",
							zh: "商店",
							ko: "상점",
							es: "Tienda"
						}[lang] || "ショップ"]
					}),
					/* @__PURE__ */ jsx("button", {
						className: "tp-top-btn ksk-top-btn",
						onClick: () => openPanel("princess"),
						title: lang === "en" ? "Dress up" : "きがえ",
						children: "👗"
					}),
					/* @__PURE__ */ jsx("button", {
						className: "tp-top-btn",
						onClick: handleMuteToggle,
						title: isMuted ? "Unmute" : "Mute",
						children: isMuted ? "🔇" : "🔊"
					}),
					/* @__PURE__ */ jsxs("button", {
						className: "tp-top-btn tp-lang-btn",
						onClick: handleLangToggle,
						title: "Language / 言語",
						children: [LANG_FLAGS[lang], /* @__PURE__ */ jsx("span", {
							className: "tp-lang-code",
							children: lang.toUpperCase()
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "tp-header",
				style: { paddingTop: "env(safe-area-inset-top, 0px)" },
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "tp-park-badge",
						children: "🏝️ GAME PARK ✦"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "ksk-title-zone",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "tp-hero-chars",
								onClick: (e) => spawnParticles(e.clientX, e.clientY),
								children: /* @__PURE__ */ jsx(KisekaeCharacters, {
									kisekaeState,
									onOpen: openPanel,
									lang
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "tp-title-wrap",
								children: /* @__PURE__ */ jsxs("h1", {
									className: "tp-title",
									children: [/* @__PURE__ */ jsx("span", {
										className: "tp-title-1",
										children: {
											ja: "わくわく",
											en: "Waku Waku",
											zh: "哇酷哇酷",
											ko: "와쿠와쿠",
											es: "Waku Waku"
										}[lang] || "わくわく"
									}), /* @__PURE__ */ jsx("span", {
										className: "tp-title-2",
										children: {
											ja: "アイランド",
											en: "Island",
											zh: "岛",
											ko: "아일랜드",
											es: "Island"
										}[lang] || "アイランド"
									})]
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "tp-subtitle",
								children: {
									ja: "🏝️ たのしい あそびじま！",
									en: "🏝️ Fun Play Island!",
									zh: "🏝️ 快乐游戏岛！",
									ko: "🏝️ 즐거운 놀이섬!",
									es: "🏝️ ¡Isla de diversión!"
								}[lang] || "🏝️ たのしい あそびじま！"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "tp-hero-row",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "tp-season",
							style: {
								"--season-color": season.color,
								"--season-glow": season.glow
							},
							children: [
								season.emoji,
								" ",
								season[lang] || season.ja
							]
						}), /* @__PURE__ */ jsx(PlayCounter, {
							target: playCount,
							lang
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "tp-game-section",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "tp-section-header",
						children: [/* @__PURE__ */ jsx("h2", { children: {
							ja: "🎮 ゲームえらんでね",
							en: "🎮 Choose a Game",
							zh: "🎮 选择游戏",
							ko: "🎮 게임 선택",
							es: "🎮 Elige un juego"
						}[lang] || "🎮 ゲームえらんでね" }), /* @__PURE__ */ jsx("div", { className: "tp-section-divider" })]
					}),
					recentGames.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "tp-recent",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "tp-recent-title",
							children: ["🕐 ", {
								ja: "さいきんあそんだゲーム",
								en: "Recently Played",
								zh: "最近玩过",
								ko: "최근 플레이",
								es: "Reciente"
							}[lang] || "さいきんあそんだゲーム"]
						}), /* @__PURE__ */ jsx("div", {
							className: "tp-recent-scroll",
							children: recentGames.map((g) => /* @__PURE__ */ jsxs("button", {
								className: "tp-recent-card",
								onClick: (e) => {
									spawnParticles(e.clientX, e.clientY);
									transitionTo(navigate, g.route, e.clientX, e.clientY);
								},
								children: [/* @__PURE__ */ jsx("span", {
									className: "tp-recent-icon",
									children: g.icon
								}), /* @__PURE__ */ jsx("span", {
									className: "tp-recent-name",
									children: g.ja
								})]
							}, g.route))
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "tp-tabs",
						children: [/* @__PURE__ */ jsxs("button", {
							className: `tp-tab${activeTab === "kids" ? " tp-tab--active" : ""}`,
							onClick: () => switchTab("kids"),
							children: ["🌸 ", {
								ja: "かんたん",
								en: "Easy",
								zh: "简单",
								ko: "쉬움",
								es: "Fácil"
							}[lang] || "かんたん"]
						}), /* @__PURE__ */ jsxs("button", {
							className: `tp-tab${activeTab === "school" ? " tp-tab--active" : ""}`,
							onClick: () => switchTab("school"),
							children: ["🔥 ", {
								ja: "チャレンジ",
								en: "Challenge",
								zh: "挑战",
								ko: "도전",
								es: "Desafío"
							}[lang] || "チャレンジ"]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "tp-cat-filter",
						children: CATEGORIES.map((cat) => /* @__PURE__ */ jsxs("button", {
							className: `tp-cat-btn${categoryFilter === cat.key ? " tp-cat-btn--active" : ""}`,
							onClick: () => setCategoryFilter(cat.key),
							children: [
								cat.icon,
								" ",
								cat.label[lang] || cat.label.ja
							]
						}, cat.key))
					}),
					/* @__PURE__ */ jsx("div", {
						className: `tp-tab-panel${activeTab === "kids" ? " tp-tab-panel--active" : ""}`,
						children: /* @__PURE__ */ jsx("div", {
							className: "tp-grid",
							children: GAMES.filter((g) => categoryFilter === "すべて" || g.category === categoryFilter).map((game, i) => /* @__PURE__ */ jsx(GameCard, {
								game,
								lang,
								isRecommended: GAMES.indexOf(game) === todayIdx && categoryFilter === "すべて",
								animIndex: i,
								onClick: (e) => {
									spawnParticles(e.clientX, e.clientY);
									transitionTo(navigate, game.route, e.clientX, e.clientY);
								}
							}, game.id))
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: `tp-tab-panel${activeTab === "school" ? " tp-tab-panel--active" : ""}`,
						children: /* @__PURE__ */ jsx("div", {
							className: "tp-grid",
							children: SCHOOL_GAMES.filter((g) => categoryFilter === "すべて" || g.category === categoryFilter).map((game, i) => /* @__PURE__ */ jsx(GameCard, {
								game,
								lang,
								isRecommended: false,
								animIndex: i,
								onClick: (e) => {
									spawnParticles(e.clientX, e.clientY);
									transitionTo(navigate, game.route, e.clientX, e.clientY);
								}
							}, game.id))
						})
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "tp-parade",
				children: [
					"🦁",
					"🐨",
					"🦊",
					"🐸",
					"🐧",
					"🦝",
					"🐥",
					"🦋",
					"🐝",
					"🌸"
				].map((e, i) => /* @__PURE__ */ jsx("span", {
					style: {
						"--dur": `${2 + i * .3}s`,
						animationDelay: `${i * .15}s`
					},
					children: e
				}, i))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "tp-footer",
				children: [
					/* @__PURE__ */ jsx("div", { children: {
						ja: "🌟 あそびたいゲームをえらんでね 🌟",
						en: "🌟 Pick a game to play! 🌟",
						zh: "🌟 选择想玩的游戏 🌟",
						ko: "🌟 하고 싶은 게임을 골라요 🌟",
						es: "🌟 ¡Elige un juego para jugar! 🌟"
					}[lang] || "🌟 あそびたいゲームをえらんでね 🌟" }),
					/* @__PURE__ */ jsxs("div", {
						className: "tp-footer-links",
						children: [
							/* @__PURE__ */ jsx("button", {
								className: "tp-footer-link",
								onClick: () => navigate("/privacy"),
								children: {
									ja: "🔒 プライバシーポリシー",
									en: "🔒 Privacy Policy",
									zh: "🔒 隐私政策",
									ko: "🔒 개인정보 처리방침",
									es: "🔒 Privacidad"
								}[lang] || "🔒 プライバシーポリシー"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "tp-footer-sep",
								children: "|"
							}),
							/* @__PURE__ */ jsx("button", {
								className: "tp-footer-link",
								onClick: () => navigate("/terms"),
								children: {
									ja: "📜 利用規約",
									en: "📜 Terms of Use",
									zh: "📜 使用条款",
									ko: "📜 이용약관",
									es: "📜 Términos"
								}[lang] || "📜 利用規約"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							marginTop: 6,
							fontSize: 11,
							color: "rgba(0,0,0,0.28)",
							display: "flex",
							justifyContent: "center",
							gap: 12
						},
						children: [/* @__PURE__ */ jsx("span", { children: "© 2025 Wakuwaku Island" }), /* @__PURE__ */ jsxs("span", {
							style: {
								color: "rgba(255,255,255,0.4)",
								fontSize: 12
							},
							children: ["v", "1.2.1"]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx(KisekaePanel, {
				isOpen: panelOpen,
				initialChara: panelChara,
				onClose: () => setPanelOpen(false),
				kisekaeState,
				onStateChange: handleKisekaeChange,
				lang
			}),
			/* @__PURE__ */ jsx(Shop, {
				isOpen: shopOpen,
				onClose: () => setShopOpen(false),
				lang,
				onCoinsChange: setCoins
			}),
			loginBonus && /* @__PURE__ */ jsx(LoginBonus, {
				bonus: loginBonus.bonus,
				streak: loginBonus.streak,
				onClaim: handleLoginBonusClaim,
				lang
			})
		]
	});
}
//#endregion
//#region src/hooks/useIframeBridge.js
/**
* useIframeBridge — iframe通信ブリッジ
* 親から iframe に以下を postMessage で送る：
*   - { type: 'orientation', landscapePhone: bool }
*   - { type: 'safeArea', top, bottom, left, right }  (px数値)
* iframe から { type: 'requestSafeArea' } を受信したら即返信。
*/
function useIframeBridge(iframeRef) {
	useEffect(() => {
		const probe = document.createElement("div");
		probe.style.cssText = "position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);";
		document.body.appendChild(probe);
		const getSafeArea = () => {
			const cs = getComputedStyle(probe);
			return {
				top: parseFloat(cs.paddingTop) || 0,
				bottom: parseFloat(cs.paddingBottom) || 0,
				left: parseFloat(cs.paddingLeft) || 0,
				right: parseFloat(cs.paddingRight) || 0
			};
		};
		const notify = () => {
			const f = iframeRef.current;
			if (!f || !f.contentWindow) return;
			const landscapePhone = window.innerWidth > window.innerHeight && Math.min(window.innerWidth, window.innerHeight) < 500;
			f.contentWindow.postMessage({
				type: "orientation",
				landscapePhone
			}, "*");
			const sa = getSafeArea();
			f.contentWindow.postMessage({
				type: "safeArea",
				...sa
			}, "*");
		};
		const onMessage = (ev) => {
			if (ev.data?.type === "requestSafeArea") {
				const f = iframeRef.current;
				if (f && f.contentWindow) f.contentWindow.postMessage({
					type: "safeArea",
					...getSafeArea()
				}, "*");
			}
		};
		window.addEventListener("resize", notify);
		window.addEventListener("orientationchange", () => setTimeout(notify, 250));
		window.addEventListener("message", onMessage);
		const f = iframeRef.current;
		if (f) f.addEventListener("load", () => setTimeout(notify, 300));
		notify();
		setTimeout(notify, 500);
		return () => {
			window.removeEventListener("resize", notify);
			window.removeEventListener("message", onMessage);
			document.body.removeChild(probe);
		};
	}, [iframeRef]);
}
//#endregion
//#region src/games/Shabondama.jsx
function Shabondama() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/shabondama_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "しゃぼんだまポン",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/KudamonoCatch.jsx
function KudamonoCatch() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/kudamono_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "くだものキャッチ",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/utils/i18n.js
var T = {
	start: {
		ja: "スタート",
		en: "Start",
		zh: "开始",
		ko: "시작",
		es: "¡Comenzar!"
	},
	back: {
		ja: "🏠 トップへもどる",
		en: "🏠 Back to Top",
		zh: "🏠 返回首页",
		ko: "🏠 홈으로",
		es: "🏠 Volver"
	},
	hiScore: {
		ja: "ハイスコア",
		en: "Best Score",
		zh: "最高分",
		ko: "최고점수",
		es: "Récord"
	},
	score: {
		ja: "スコア",
		en: "Score",
		zh: "得分",
		ko: "점수",
		es: "Puntos"
	},
	gameOver: {
		ja: "ゲームオーバー",
		en: "Game Over",
		zh: "游戏结束",
		ko: "게임 오버",
		es: "Fin del juego"
	},
	stageClear: {
		ja: "ステージクリア！",
		en: "Stage Clear!",
		zh: "关卡通过！",
		ko: "스테이지 클리어!",
		es: "¡Nivel superado!"
	},
	retry: {
		ja: "もういちど",
		en: "Play Again",
		zh: "再玩一次",
		ko: "다시하기",
		es: "Repetir"
	},
	life: {
		ja: "ライフ",
		en: "Lives",
		zh: "生命",
		ko: "목숨",
		es: "Vidas"
	},
	easy: {
		ja: "かんたん",
		en: "Easy",
		zh: "简单",
		ko: "쉬움",
		es: "Fácil"
	},
	challenge: {
		ja: "チャレンジ",
		en: "Challenge",
		zh: "挑战",
		ko: "도전",
		es: "Desafío"
	},
	correct: {
		ja: "せいかい！",
		en: "Correct!",
		zh: "正确！",
		ko: "정답!",
		es: "¡Correcto!"
	},
	wrong: {
		ja: "ざんねん…",
		en: "Wrong...",
		zh: "不对…",
		ko: "틀렸어요…",
		es: "Incorrecto…"
	},
	stage: {
		ja: "ステージ",
		en: "Stage",
		zh: "关卡",
		ko: "스테이지",
		es: "Nivel"
	},
	timeLeft: {
		ja: "のこり",
		en: "Left",
		zh: "剩余",
		ko: "남은",
		es: "Queda"
	},
	howToPlay: {
		ja: "あそびかた",
		en: "How to Play",
		zh: "玩法",
		ko: "게임 방법",
		es: "Cómo jugar"
	},
	next: {
		ja: "つぎへ",
		en: "Next",
		zh: "下一关",
		ko: "다음으로",
		es: "Siguiente"
	},
	backToTitle: {
		ja: "タイトルへ",
		en: "Back to Title",
		zh: "返回标题",
		ko: "타이틀로",
		es: "Al título"
	},
	newRecord: {
		ja: "ニューレコード！",
		en: "New Record!",
		zh: "新纪录！",
		ko: "신기록!",
		es: "¡Nuevo récord!"
	},
	best: {
		ja: "ハイスコア",
		en: "Best",
		zh: "最高分",
		ko: "최고점수",
		es: "Récord"
	},
	amazing: {
		ja: "すごい！",
		en: "Amazing!",
		zh: "太棒了！",
		ko: "대단해요!",
		es: "¡Increíble!"
	},
	nice: {
		ja: "ナイス！",
		en: "Nice!",
		zh: "不错！",
		ko: "잘했어요!",
		es: "¡Bien!"
	},
	tryAgain: {
		ja: "もういちど",
		en: "Try Again!",
		zh: "再试一次！",
		ko: "다시 도전!",
		es: "¡Inténtalo!"
	},
	keepGoing: {
		ja: "またちょうせん！",
		en: "Keep challenging!",
		zh: "继续加油！",
		ko: "계속 도전해봐!",
		es: "¡Sigue intentando!"
	},
	wellDone: {
		ja: "よくできました！",
		en: "Well done!",
		zh: "做得好！",
		ko: "잘했어요!",
		es: "¡Bien hecho!"
	},
	miss: {
		ja: "ミス",
		en: "Miss",
		zh: "错误",
		ko: "미스",
		es: "Error"
	},
	time: {
		ja: "じかん",
		en: "Time",
		zh: "时间",
		ko: "시간",
		es: "Tiempo"
	},
	champion: {
		ja: "チャンピオン！",
		en: "Champion!",
		zh: "冠军！",
		ko: "챔피언!",
		es: "¡Campeón!"
	},
	animals: {
		ja: "どうぶつ",
		en: "Animals",
		zh: "动物",
		ko: "동물",
		es: "Animales"
	},
	warning: {
		ja: "どうぶつはおしちゃダメ！",
		en: "Don't tap the animals!",
		zh: "不要点击动物！",
		ko: "동물을 탭하지 마세요!",
		es: "¡No toques los animales!"
	}
};
function t(lang, key) {
	return T[key]?.[lang] ?? T[key]?.ja ?? key;
}
function getLang() {
	return localStorage.getItem("wakuwaku_lang") || "ja";
}
//#endregion
//#region src/utils/analytics.js
/**
* Google Analytics 4 Event Tracking Utility
* Provides helper functions to track game events and user interactions
*/
/**
* Track when a user starts playing a game
* @param {string} gameName - Name of the game (e.g., 'Shabondama', 'KudamonoCatch')
*/
function trackGameStart(gameName) {
	incrementPlayCount();
	if (window.gtag) gtag("event", "game_start", {
		game_name: gameName,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	});
}
/**
* Track when a user clears/completes a game stage or the entire game
* @param {string} gameName - Name of the game
* @param {number} score - Final score or points earned
* @param {number} stage - Current stage or level (default 1)
*/
function trackGameClear(gameName, score, stage = 1) {
	if (window.gtag) gtag("event", "game_clear", {
		game_name: gameName,
		score,
		stage,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	});
}
/**
* Track when a user's game ends (game over, out of lives, etc.)
* @param {string} gameName - Name of the game
* @param {number} score - Final score or points earned
* @param {number} stage - Current stage or level when game ended (default 1)
*/
function trackGameOver(gameName, score, stage = 1) {
	if (window.gtag) gtag("event", "game_over", {
		game_name: gameName,
		score,
		stage,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	});
}
/**
* Track when a user achieves a new high score
* @param {string} gameName - Name of the game
* @param {number} score - New high score
*/
function trackNewHighScore(gameName, score) {
	if (window.gtag) gtag("event", "new_high_score", {
		game_name: gameName,
		high_score: score,
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	});
}
//#endregion
//#region src/components/RecommendedGames.jsx
var LABELS = {
	title: {
		ja: "🎮 つぎはこれであそぼう！",
		en: "🎮 Play Next!",
		zh: "🎮 接下来玩这个！",
		ko: "🎮 다음에 이걸 해봐요!",
		es: "🎮 ¡Juega esto!"
	},
	play: {
		ja: "あそぶ ▶",
		en: "Play ▶",
		zh: "去玩 ▶",
		ko: "플레이 ▶",
		es: "Jugar ▶"
	}
};
function RecommendedGames({ currentRoute }) {
	const navigate = useNavigate();
	const lang = getLang();
	const games = getRecommendedGames(currentRoute, 3);
	if (!games.length) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "rec-wrap",
		children: [/* @__PURE__ */ jsx("div", {
			className: "rec-title",
			children: LABELS.title[lang] || LABELS.title.ja
		}), /* @__PURE__ */ jsx("div", {
			className: "rec-row",
			children: games.map((g) => /* @__PURE__ */ jsxs("button", {
				className: "rec-card",
				onClick: (e) => transitionTo(navigate, g.route, e.clientX, e.clientY),
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "rec-icon",
						children: g.icon
					}),
					/* @__PURE__ */ jsx("span", {
						className: "rec-name",
						children: g[lang] || g.ja
					}),
					/* @__PURE__ */ jsx("span", {
						className: "rec-play",
						children: LABELS.play[lang] || LABELS.play.ja
					})
				]
			}, g.route))
		})]
	});
}
//#endregion
//#region src/games/Meiro.jsx
var COLS = 11, ROWS = 11;
var GALLERY_CHARS = [
	"👸",
	"🤴",
	"👑",
	"🦁",
	"🐨",
	"🦝",
	"🐮",
	"🐷",
	"🐔",
	"🐦",
	"🦄",
	"🐯",
	"🐺",
	"🦋",
	"🐝",
	"🦀",
	"🐙",
	"🐭",
	"🐹",
	"🦕",
	"🐳",
	"🦭"
];
var CHARACTERS = [
	{
		emoji: "🐱",
		name: "ねこ",
		nameEn: "Cat"
	},
	{
		emoji: "🐰",
		name: "うさぎ",
		nameEn: "Bunny"
	},
	{
		emoji: "🐸",
		name: "かえる",
		nameEn: "Frog"
	},
	{
		emoji: "🐼",
		name: "パンダ",
		nameEn: "Panda"
	},
	{
		emoji: "🦊",
		name: "きつね",
		nameEn: "Fox"
	},
	{
		emoji: "🐧",
		name: "ペンギン",
		nameEn: "Penguin"
	}
];
var HUD_H = 56;
var MAX_HP = 3;
function getHi() {
	return parseFloat(localStorage.getItem("maze_best") || "0");
}
function saveHi(v) {
	localStorage.setItem("maze_best", String(v));
}
function fmtTime(s) {
	const m = Math.floor(s / 60);
	const sec = s % 60;
	return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}
function Meiro() {
	const navigate = useNavigate();
	const [lang] = useState(() => localStorage.getItem("wakuwaku_lang") || "ja");
	const [screen, setScreen] = useState("title");
	const [hpDisplay, setHpDisplay] = useState(MAX_HP);
	const [timeDisplay, setTimeDisplay] = useState(0);
	const [hiScore, setHiScore] = useState(getHi());
	const [resultData, setResultData] = useState({
		title: "",
		msg: "",
		hiText: "",
		isNew: false
	});
	const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
	const [muted, setMuted] = useState(() => getMuteState());
	const [isLandscape, setIsLandscape] = useState(false);
	const mazeCanvasRef = useRef(null);
	const bgCanvasRef = useRef(null);
	const wrapRef = useRef(null);
	const hudRef = useRef(null);
	const W = useRef(0);
	const H = useRef(0);
	const mazeRef = useRef([]);
	const playerRef = useRef({
		r: 1,
		c: 1
	});
	const enemiesRef = useRef([]);
	const hpRef = useRef(MAX_HP);
	const invincibleRef = useRef(false);
	const invTRef = useRef(0);
	const timeRef = useRef(0);
	const runningRef = useRef(false);
	const bgAnimRef = useRef(null);
	const mazeAnimRef = useRef(null);
	const timerIntRef = useRef(null);
	const frameRef = useRef(0);
	const galleryRef = useRef([]);
	const charRef = useRef(CHARACTERS[0]);
	const cellRef = useRef(32);
	const OXRef = useRef(0);
	const OYRef = useRef(0);
	const gameOverScheduledRef = useRef(false);
	const triggerGameOverRef = useRef(null);
	const triggerClearRef = useRef(null);
	const getCtx = (ref) => ref.current ? ref.current.getContext("2d") : null;
	const genMaze = useCallback(() => {
		const m = [];
		for (let r = 0; r < ROWS; r++) {
			m[r] = [];
			for (let c = 0; c < COLS; c++) m[r][c] = 1;
		}
		function carve(r, c) {
			m[r][c] = 0;
			const dirs = [
				[0, 2],
				[0, -2],
				[2, 0],
				[-2, 0]
			].sort(() => Math.random() - .5);
			for (const [dr, dc] of dirs) {
				const nr = r + dr, nc = c + dc;
				if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && m[nr][nc] === 1) {
					m[r + dr / 2][c + dc / 2] = 0;
					carve(nr, nc);
				}
			}
		}
		carve(1, 1);
		mazeRef.current = m;
	}, []);
	const genEnemies = useCallback(() => {
		const m = mazeRef.current;
		const count = 3 + Math.floor(Math.random() * 2);
		const enemies = [];
		let attempts = 0;
		while (enemies.length < count && attempts < 200) {
			attempts++;
			const r = 1 + Math.floor(Math.random() * (ROWS - 2));
			const c = 1 + Math.floor(Math.random() * (COLS - 2));
			if (m[r][c] !== 0) continue;
			if (r === 1 && c === 1) continue;
			if (r === ROWS - 2 && c === COLS - 2) continue;
			if (r < 3 && c < 3) continue;
			const horiz = Math.random() < .5;
			const range = 1 + Math.floor(Math.random() * 2);
			enemies.push({
				baseR: r,
				baseC: c,
				horiz,
				range,
				speed: .008 + Math.random() * .006,
				t: Math.random() * Math.PI * 2
			});
		}
		enemiesRef.current = enemies;
	}, []);
	const computeLayout = useCallback(() => {
		const w = W.current, h = H.current;
		const availW = w - 32;
		const actualHudH = hudRef.current?.getBoundingClientRect().height || HUD_H;
		const availH = h - actualHudH - 40;
		const cell = Math.floor(Math.min(availW / COLS, availH / ROWS));
		cellRef.current = cell;
		const mazeW = cell * COLS;
		const mazeH = cell * ROWS;
		OXRef.current = Math.floor((w - mazeW) / 2);
		OYRef.current = actualHudH + Math.floor((availH - mazeH) / 2) + 8;
	}, []);
	const buildGallery = useCallback(() => {
		const w = W.current, h = H.current;
		const g = [];
		for (let i = 0; i < 6; i++) {
			g.push({
				emoji: GALLERY_CHARS[i % GALLERY_CHARS.length],
				x: w * .04,
				y: h * .15 + i * h * .13,
				size: w * .07,
				phase: i * 1.2,
				speed: 1.3 + i * .25
			});
			g.push({
				emoji: GALLERY_CHARS[(i + 8) % GALLERY_CHARS.length],
				x: w * .96,
				y: h * .15 + i * h * .13,
				size: w * .07,
				phase: i * 1.7,
				speed: 1.5 + i * .2
			});
		}
		galleryRef.current = g;
	}, []);
	const enemyPos = (e) => {
		return {
			fr: e.baseR + (e.horiz ? 0 : Math.sin(e.t * Math.PI * 2) * e.range),
			fc: e.baseC + (e.horiz ? Math.sin(e.t * Math.PI * 2) * e.range : 0)
		};
	};
	const drawBg = useCallback(() => {
		const ctx = getCtx(bgCanvasRef);
		if (!ctx) return;
		const w = W.current, h = H.current;
		ctx.fillStyle = "#e8eaf6";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "rgba(63,81,181,0.06)";
		ctx.lineWidth = 1;
		for (let x = 0; x < w; x += 28) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, h);
			ctx.stroke();
		}
		for (let y = 0; y < h; y += 28) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}
		const t = frameRef.current;
		for (const g of galleryRef.current) {
			const bob = Math.sin(t * g.speed * .04 + g.phase) * 5;
			ctx.font = `${g.size}px serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.globalAlpha = .55;
			ctx.fillText(g.emoji, g.x, g.y + bob);
		}
		ctx.globalAlpha = 1;
	}, []);
	const drawMaze = useCallback(() => {
		const ctx = getCtx(mazeCanvasRef);
		if (!ctx) return;
		const w = W.current, h = H.current;
		ctx.clearRect(0, 0, w, h);
		const cell = cellRef.current;
		const OX = OXRef.current, OY = OYRef.current;
		const mazeW = cell * COLS, mazeH = cell * ROWS;
		ctx.save();
		ctx.shadowColor = "rgba(63,81,181,0.25)";
		ctx.shadowBlur = 16;
		ctx.fillStyle = "#fff";
		const pad = 6;
		roundRect(ctx, OX - pad, OY - pad, mazeW + pad * 2, mazeH + pad * 2, 12);
		ctx.fill();
		ctx.restore();
		const m = mazeRef.current;
		for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
			const x = OX + c * cell, y = OY + r * cell;
			if (m[r][c] === 1) {
				ctx.fillStyle = "#3f51b5";
				ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
			} else {
				ctx.fillStyle = r === 1 && c === 1 ? "#bbdefb" : "#f5f5f5";
				ctx.fillRect(x, y, cell, cell);
			}
		}
		const gx = OX + (COLS - 2) * cell + cell / 2;
		const gy = OY + (ROWS - 2) * cell + cell / 2;
		ctx.font = `${cell * .8}px serif`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("🏁", gx, gy);
		for (const e of enemiesRef.current) {
			e.t += e.speed;
			const { fr, fc } = enemyPos(e);
			const ex = OX + fc * cell + cell / 2;
			const ey = OY + fr * cell + cell / 2;
			ctx.font = `${cell * .8}px serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("👾", ex, ey);
		}
		const p = playerRef.current;
		const px = OX + p.c * cell + cell / 2;
		const py = OY + p.r * cell + cell / 2;
		if (!(invincibleRef.current && Math.floor(frameRef.current / 6) % 2 === 0)) {
			ctx.font = `${cell * .82}px serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.globalAlpha = invincibleRef.current ? .5 : 1;
			ctx.fillText(charRef.current.emoji, px, py);
			ctx.globalAlpha = 1;
		}
	}, []);
	function roundRect(ctx, x, y, w, h, r) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
	}
	const updateInvincible = useCallback(() => {
		if (invincibleRef.current) {
			invTRef.current++;
			if (invTRef.current >= 60) {
				invincibleRef.current = false;
				invTRef.current = 0;
			}
		}
	}, []);
	const checkEnemyCollision = useCallback(() => {
		if (invincibleRef.current || gameOverScheduledRef.current) return;
		const p = playerRef.current;
		const cell = cellRef.current;
		const OX = OXRef.current, OY = OYRef.current;
		const px = OX + p.c * cell + cell / 2;
		const py = OY + p.r * cell + cell / 2;
		for (const e of enemiesRef.current) {
			const { fr, fc } = enemyPos(e);
			const ex = OX + fc * cell + cell / 2;
			const ey = OY + fr * cell + cell / 2;
			if (Math.hypot(ex - px, ey - py) < cell * .7) {
				hpRef.current--;
				setHpDisplay(hpRef.current);
				invincibleRef.current = true;
				invTRef.current = 0;
				if (hpRef.current <= 0 && !gameOverScheduledRef.current) {
					gameOverScheduledRef.current = true;
					setTimeout(() => triggerGameOverRef.current && triggerGameOverRef.current(), 600);
				}
				break;
			}
		}
	}, []);
	const triggerClear = useCallback(() => {
		runningRef.current = false;
		if (timerIntRef.current) {
			clearInterval(timerIntRef.current);
			timerIntRef.current = null;
		}
		if (mazeAnimRef.current) {
			cancelAnimationFrame(mazeAnimRef.current);
			mazeAnimRef.current = null;
		}
		stopBgm();
		playSoundCorrect();
		const elapsed = timeRef.current;
		const hi = getHi();
		const isNew = hi === 0 || elapsed < hi;
		if (isNew) {
			saveHi(elapsed);
			trackNewHighScore("Meiro", elapsed);
			addCoins(10);
		}
		trackGameClear("Meiro", elapsed, 1);
		addCoins(5);
		setHiScore(isNew ? elapsed : hi);
		const title = isNew ? {
			ja: "🏆 ベストタイム こうしん！",
			en: "🏆 Best Time!",
			zh: "🏆 最佳时间！",
			ko: "🏆 베스트 타임!",
			es: "🏆 ¡Mejor tiempo!"
		}[lang] || "🏆 ベストタイム こうしん！" : {
			ja: "クリア！🏁",
			en: "Clear! 🏁",
			zh: "通関！🏁",
			ko: "클리어！🏁",
			es: "¡Completado！🏁"
		}[lang] || "クリア！🏁";
		const hiText = `${t(lang, "best")}: ${fmtTime(isNew ? elapsed : hi)}`;
		setResultData({
			title,
			msg: `${t(lang, "time")}: ${fmtTime(elapsed)}`,
			hiText,
			isNew
		});
		setScreen("result");
	}, []);
	const triggerGameOver = useCallback(() => {
		runningRef.current = false;
		if (timerIntRef.current) {
			clearInterval(timerIntRef.current);
			timerIntRef.current = null;
		}
		if (mazeAnimRef.current) {
			cancelAnimationFrame(mazeAnimRef.current);
			mazeAnimRef.current = null;
		}
		stopBgm();
		trackGameOver("Meiro", timeRef.current);
		const hi = getHi();
		setResultData({
			title: {
				ja: "ゲームオーバー 😢",
				en: "Game Over 😢",
				zh: "游戏结束 😢",
				ko: "게임 오버 😢",
				es: "Fin del juego 😢"
			}[lang] || "ゲームオーバー 😢",
			msg: {
				ja: "もういちどチャレンジ！",
				en: "Keep challenging!",
				zh: "继续挑战！",
				ko: "다시 도전해요!",
				es: "¡Sigue intentando!"
			}[lang] || "もういちどチャレンジ！",
			hiText: hi > 0 ? `${t(lang, "best")}: ${fmtTime(hi)}` : "",
			isNew: false
		});
		setScreen("result");
	}, []);
	useEffect(() => {
		const check = () => {
			const landscape = window.innerWidth > window.innerHeight;
			const shortSide = Math.min(window.innerWidth, window.innerHeight);
			setIsLandscape(landscape && shortSide < 500);
		};
		check();
		window.addEventListener("resize", check);
		window.addEventListener("orientationchange", () => setTimeout(check, 200));
		return () => {
			window.removeEventListener("resize", check);
			window.removeEventListener("orientationchange", check);
		};
	}, []);
	useEffect(() => {
		document.title = "めいろあそび | わくわくアイランド - 無料子供向けゲーム";
		return () => {
			document.title = "わくわくアイランド | 無料の子供向けブラウザゲーム";
		};
	}, []);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") window.history.back();
			if (e.data?.type === "goHome") window.location.href = "/";
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, []);
	useEffect(() => {
		triggerClearRef.current = triggerClear;
	}, [triggerClear]);
	useEffect(() => {
		triggerGameOverRef.current = triggerGameOver;
	}, [triggerGameOver]);
	const movePlayer = useCallback((dr, dc) => {
		if (!runningRef.current) return;
		const p = playerRef.current;
		const m = mazeRef.current;
		const nr = p.r + dr, nc = p.c + dc;
		if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
		if (m[nr][nc] !== 0) return;
		playerRef.current = {
			r: nr,
			c: nc
		};
		if (nr === ROWS - 2 && nc === COLS - 2) {
			runningRef.current = false;
			if (triggerClearRef.current) triggerClearRef.current();
		}
	}, []);
	const onMazeTap = useCallback((cx, cy) => {
		if (!runningRef.current) return;
		const cell = cellRef.current;
		const OX = OXRef.current, OY = OYRef.current;
		const p = playerRef.current;
		const ppx = OX + p.c * cell + cell / 2;
		const ppy = OY + p.r * cell + cell / 2;
		const dx = cx - ppx, dy = cy - ppy;
		if (Math.hypot(dx, dy) < cell * .3) return;
		if (Math.abs(dx) > Math.abs(dy)) movePlayer(0, dx > 0 ? 1 : -1);
		else movePlayer(dy > 0 ? 1 : -1, 0);
	}, [movePlayer]);
	useEffect(() => {
		if (screen !== "game") return;
		const onKey = (e) => {
			if (e.key === "ArrowUp") {
				e.preventDefault();
				movePlayer(-1, 0);
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				movePlayer(1, 0);
			}
			if (e.key === "ArrowLeft") {
				e.preventDefault();
				movePlayer(0, -1);
			}
			if (e.key === "ArrowRight") {
				e.preventDefault();
				movePlayer(0, 1);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [screen, movePlayer]);
	const handleCanvasClick = useCallback((e) => {
		const canvas = mazeCanvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		onMazeTap(e.clientX - rect.left, e.clientY - rect.top);
	}, [onMazeTap]);
	const handleCanvasTouch = useCallback((e) => {
		e.preventDefault();
		const canvas = mazeCanvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const touch = e.changedTouches[0];
		onMazeTap(touch.clientX - rect.left, touch.clientY - rect.top);
	}, [onMazeTap]);
	const mazeLoop = useCallback(() => {
		frameRef.current++;
		updateInvincible();
		checkEnemyCollision();
		drawMaze();
		mazeAnimRef.current = requestAnimationFrame(mazeLoop);
	}, [
		updateInvincible,
		checkEnemyCollision,
		drawMaze
	]);
	const bgLoop = useCallback(() => {
		drawBg();
		bgAnimRef.current = requestAnimationFrame(bgLoop);
	}, [drawBg]);
	const startGame = useCallback(async (char) => {
		trackGameStart("Meiro");
		await ensureAudioStarted();
		console.log("[Game] Meiro: audio ready, playing BGM");
		playMeiroBgm();
		addCoins(1);
		charRef.current = char;
		hpRef.current = MAX_HP;
		invincibleRef.current = false;
		invTRef.current = 0;
		timeRef.current = 0;
		runningRef.current = true;
		gameOverScheduledRef.current = false;
		playerRef.current = {
			r: 1,
			c: 1
		};
		setHpDisplay(MAX_HP);
		setTimeDisplay(0);
		genMaze();
		genEnemies();
		setScreen("game");
	}, [genMaze, genEnemies]);
	useEffect(() => {
		if (screen !== "game") {
			if (mazeAnimRef.current) {
				cancelAnimationFrame(mazeAnimRef.current);
				mazeAnimRef.current = null;
			}
			if (bgAnimRef.current) {
				cancelAnimationFrame(bgAnimRef.current);
				bgAnimRef.current = null;
			}
			if (timerIntRef.current) {
				clearInterval(timerIntRef.current);
				timerIntRef.current = null;
			}
			return;
		}
		const wrap = wrapRef.current;
		if (!wrap) return;
		const rect = wrap.getBoundingClientRect();
		W.current = rect.width;
		H.current = rect.height;
		[bgCanvasRef, mazeCanvasRef].forEach((ref) => {
			if (ref.current) {
				ref.current.width = W.current;
				ref.current.height = H.current;
			}
		});
		computeLayout();
		buildGallery();
		if (bgAnimRef.current) cancelAnimationFrame(bgAnimRef.current);
		bgAnimRef.current = requestAnimationFrame(bgLoop);
		if (mazeAnimRef.current) cancelAnimationFrame(mazeAnimRef.current);
		mazeAnimRef.current = requestAnimationFrame(mazeLoop);
		if (timerIntRef.current) clearInterval(timerIntRef.current);
		timerIntRef.current = setInterval(() => {
			if (!runningRef.current) return;
			timeRef.current++;
			setTimeDisplay(timeRef.current);
		}, 1e3);
		return () => {
			if (mazeAnimRef.current) {
				cancelAnimationFrame(mazeAnimRef.current);
				mazeAnimRef.current = null;
			}
			if (bgAnimRef.current) {
				cancelAnimationFrame(bgAnimRef.current);
				bgAnimRef.current = null;
			}
			if (timerIntRef.current) {
				clearInterval(timerIntRef.current);
				timerIntRef.current = null;
			}
		};
	}, [
		screen,
		bgLoop,
		mazeLoop,
		computeLayout,
		buildGallery
	]);
	useEffect(() => {
		const onResize = () => {
			const wrap = wrapRef.current;
			if (!wrap) return;
			const rect = wrap.getBoundingClientRect();
			W.current = rect.width;
			H.current = rect.height;
			[bgCanvasRef, mazeCanvasRef].forEach((ref) => {
				if (ref.current) {
					ref.current.width = W.current;
					ref.current.height = H.current;
				}
			});
			computeLayout();
			buildGallery();
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [computeLayout, buildGallery]);
	useEffect(() => {
		return () => {
			if (mazeAnimRef.current) cancelAnimationFrame(mazeAnimRef.current);
			if (bgAnimRef.current) cancelAnimationFrame(bgAnimRef.current);
			if (timerIntRef.current) clearInterval(timerIntRef.current);
			stopBgm();
		};
	}, []);
	const landscapeHint = isLandscape ? /* @__PURE__ */ jsxs("div", {
		style: {
			position: "fixed",
			inset: 0,
			zIndex: 999999,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			gap: 18,
			background: "linear-gradient(160deg,#1a2d5a,#2a1040)",
			color: "#fff",
			fontFamily: "'M PLUS Rounded 1c',system-ui,sans-serif",
			textAlign: "center",
			padding: 24
		},
		children: [
			/* @__PURE__ */ jsx("div", {
				style: {
					fontSize: 72,
					animation: "rhSpin 2s ease-in-out infinite"
				},
				children: "📱"
			}),
			/* @__PURE__ */ jsx("div", {
				style: {
					fontSize: 36,
					animation: "rhBob 1.2s ease-in-out infinite"
				},
				children: "🔄"
			}),
			/* @__PURE__ */ jsx("div", {
				style: {
					fontSize: 24,
					fontWeight: 900,
					color: "#FFD54F",
					textShadow: "2px 2px 0 rgba(0,0,0,.4)"
				},
				children: "たてむきにしてね"
			}),
			/* @__PURE__ */ jsxs("div", {
				style: {
					fontSize: 15,
					color: "rgba(255,255,255,.85)",
					lineHeight: 1.7
				},
				children: [
					"このゲームは スマホを たてに もって",
					/* @__PURE__ */ jsx("br", {}),
					"あそんでね！"
				]
			}),
			/* @__PURE__ */ jsx("style", { children: `@keyframes rhSpin{0%,40%{transform:rotate(-90deg)}60%,100%{transform:rotate(0deg)}}@keyframes rhBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}` })
		]
	}) : null;
	if (screen === "title") return /* @__PURE__ */ jsxs("div", {
		className: "meiro-wrap meiro-title",
		children: [landscapeHint, /* @__PURE__ */ jsxs("div", {
			className: "meiro-title-box",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "meiro-title-emoji",
					children: "🗺️"
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "meiro-title-text",
					children: {
						ja: "めいろあそび",
						en: "Maze Adventure!",
						zh: "迷宫冒险！",
						ko: "미로 어드벤처!",
						es: "¡Laberinto!"
					}[lang] || "めいろあそび"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "meiro-subtitle",
					children: {
						ja: "めいろをぬけてゴールしよう！",
						en: "Find your way through the maze!",
						zh: "穿过迷宫到达终点！",
						ko: "미로를 통과해 골인!",
						es: "¡Navega el laberinto!"
					}[lang] || "めいろをぬけてゴールしよう！"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "meiro-title-rules",
					children: [
						/* @__PURE__ */ jsx("div", { children: {
							ja: "👆 タップ or キーボードで うごく",
							en: "👆 Tap or use keyboard to move",
							zh: "👆 点击或使用键盘移动",
							ko: "👆 탭 또는 키보드로 이동",
							es: "👆 Toca o usa el teclado"
						}[lang] || "👆 タップ or キーボードで うごく" }),
						/* @__PURE__ */ jsx("div", { children: {
							ja: "👾 てきにあたると ❤️ がへる",
							en: "👾 Hitting enemies loses ❤️",
							zh: "👾 碰到敌人会失去❤️",
							ko: "👾 적에 닿으면 ❤️ 감소",
							es: "👾 Golpear enemigos quita ❤️"
						}[lang] || "👾 てきにあたると ❤️ がへる" }),
						/* @__PURE__ */ jsx("div", { children: {
							ja: "🏁 ゴールに たどりつこう！",
							en: "🏁 Reach the goal!",
							zh: "🏁 到达终点！",
							ko: "🏁 골인 지점에 도달해요！",
							es: "🏁 ¡Alcanza la meta!"
						}[lang] || "🏁 ゴールに たどりつこう！" })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "meiro-char-grid",
					children: CHARACTERS.map((ch) => /* @__PURE__ */ jsxs("button", {
						className: `meiro-char-btn ${selectedChar.emoji === ch.emoji ? "selected" : ""}`,
						onClick: () => setSelectedChar(ch),
						children: [/* @__PURE__ */ jsx("span", {
							className: "meiro-char-emoji",
							children: ch.emoji
						}), /* @__PURE__ */ jsx("span", {
							className: "meiro-char-name",
							children: lang === "ja" ? ch.name : ch.nameEn
						})]
					}, ch.emoji))
				}),
				/* @__PURE__ */ jsxs("button", {
					className: "meiro-start-btn",
					onClick: () => startGame(selectedChar),
					children: [
						"🗺️ ",
						t(lang, "start"),
						"！"
					]
				}),
				hiScore > 0 && /* @__PURE__ */ jsxs("div", {
					className: "meiro-hi",
					children: [
						t(lang, "best"),
						": ",
						fmtTime(hiScore)
					]
				}),
				/* @__PURE__ */ jsx("button", {
					className: "ww-back-btn",
					onClick: () => transitionBack(navigate),
					children: t(lang, "back")
				})
			]
		})]
	});
	if (screen === "result") return /* @__PURE__ */ jsxs("div", {
		className: "meiro-wrap meiro-result",
		children: [landscapeHint, /* @__PURE__ */ jsxs("div", {
			className: "meiro-result-box",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "meiro-result-title",
					children: resultData.title
				}),
				/* @__PURE__ */ jsx("div", {
					className: "meiro-result-msg",
					children: resultData.msg
				}),
				resultData.isNew && /* @__PURE__ */ jsxs("div", {
					className: "meiro-result-new",
					children: ["🌟 ", t(lang, "newRecord")]
				}),
				resultData.hiText && /* @__PURE__ */ jsx("div", {
					className: "meiro-result-hi",
					children: resultData.hiText
				}),
				/* @__PURE__ */ jsx(RecommendedGames, { currentRoute: "/meiro" }),
				/* @__PURE__ */ jsxs("div", {
					className: "meiro-result-btns",
					children: [
						/* @__PURE__ */ jsx("button", {
							className: "meiro-start-btn",
							onClick: () => startGame(charRef.current),
							children: t(lang, "retry")
						}),
						/* @__PURE__ */ jsx("button", {
							className: "meiro-back-btn2",
							onClick: () => setScreen("title"),
							children: {
								ja: "キャラ選択",
								en: "Characters",
								zh: "角色选择",
								ko: "캐릭터 선택",
								es: "Personajes"
							}[lang] || "キャラ選択"
						}),
						/* @__PURE__ */ jsx("button", {
							className: "meiro-back-btn2",
							onClick: () => transitionBack(navigate),
							children: t(lang, "back")
						})
					]
				})
			]
		})]
	});
	const hpHearts = Array.from({ length: MAX_HP }, (_, i) => i < hpDisplay ? "❤️" : "🖤");
	return /* @__PURE__ */ jsxs("div", {
		className: "meiro-wrap",
		ref: wrapRef,
		children: [
			landscapeHint,
			/* @__PURE__ */ jsx("canvas", {
				ref: bgCanvasRef,
				className: "meiro-canvas-bg"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "meiro-hud",
				ref: hudRef,
				children: [
					/* @__PURE__ */ jsx("button", {
						className: "meiro-hud-back",
						onClick: () => {
							runningRef.current = false;
							if (timerIntRef.current) clearInterval(timerIntRef.current);
							if (mazeAnimRef.current) cancelAnimationFrame(mazeAnimRef.current);
							if (bgAnimRef.current) cancelAnimationFrame(bgAnimRef.current);
							transitionBack(navigate);
						},
						children: "🏠"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "meiro-hud-center",
						children: [/* @__PURE__ */ jsx("div", {
							className: "meiro-hud-title",
							children: {
								ja: "🗺️ めいろあそび",
								en: "🗺️ Maze Play",
								zh: "🗺️ 迷宫冒险",
								ko: "🗺️ 미로 어드벤처",
								es: "🗺️ Laberinto"
							}[lang] || "🗺️ めいろあそび"
						}), /* @__PURE__ */ jsxs("div", {
							className: "meiro-hud-score",
							children: [
								t(lang, "time"),
								": ",
								fmtTime(timeDisplay)
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "meiro-hud-box",
						children: [/* @__PURE__ */ jsx("div", {
							className: "meiro-hud-label",
							children: {
								ja: "ライフ",
								en: "Lives",
								zh: "生命",
								ko: "라이프",
								es: "Vidas"
							}[lang] || "ライフ"
						}), /* @__PURE__ */ jsx("div", {
							className: "meiro-hud-val",
							children: hpHearts.join("")
						})]
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => {
							const m = toggleMute();
							setMuted(m);
							if (!m) playMeiroBgm();
						},
						style: {
							fontSize: 20,
							background: "rgba(255,255,255,0.9)",
							border: "none",
							borderRadius: 10,
							padding: "4px 8px",
							cursor: "pointer",
							flexShrink: 0
						},
						children: muted ? "🔇" : "🔊"
					})
				]
			}),
			/* @__PURE__ */ jsx("canvas", {
				ref: mazeCanvasRef,
				className: "meiro-canvas-maze",
				onClick: handleCanvasClick,
				onTouchEnd: handleCanvasTouch
			}),
			/* @__PURE__ */ jsx("div", {
				className: "meiro-hint",
				children: "👆 いきたい ほうこうを タップ！"
			})
		]
	});
}
//#endregion
//#region src/games/DoubutsuPuzzle.jsx
function DoubutsuPuzzle() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/doubutsu_puzzle_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "どうぶつパズル",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		})
	});
}
//#endregion
//#region src/games/KazuAsobi.jsx
function KazuAsobi() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/kazu_asobi_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "かずあそび",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		})
	});
}
//#endregion
//#region src/games/AnimalSoccer.jsx
function AnimalSoccer() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/soccer_v7.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "どうぶつサッカー",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/SushiGame.jsx
function SushiGame() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/sushi_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "さーもんをとろう",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		})
	});
}
//#endregion
//#region src/games/IchigoGame.jsx
function IchigoGame() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/ichigo_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "いちごゲーム",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		})
	});
}
//#endregion
//#region src/games/DoubutsuKakurenbo.jsx
function DoubutsuKakurenbo() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/kakurenbo_v1.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "どうぶつかくれんぼ",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/MojiAsobi.jsx
function MojiAsobi() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/moji_asobi_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "もじあそび",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		})
	});
}
//#endregion
//#region src/games/TashizanGame.jsx
function TashizanGame() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/tashizan_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "たしざんゲーム",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		})
	});
}
//#endregion
//#region src/games/IroAwase.jsx
function IroAwase() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/iro_awase_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "いろあわせ",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		})
	});
}
//#endregion
//#region src/games/MachiDukuri.jsx
function MachiDukuri() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/machi_v6.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "わくわくまちづくり",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/DoubutsuBlock.jsx
function DoubutsuBlock() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/tetris_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "どうぶつブロック",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/DoubutsuRunner.jsx
function DoubutsuRunner() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/runner_v6.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "どうぶつランナー",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/DoubutsuShoot.jsx
function DoubutsuShoot() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/shoot2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "どうぶつシューティング",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/DoubutsuSniper.jsx
function DoubutsuSniper() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/sniper_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "どうぶつスナイパー",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/DoubutsuCrossing.jsx
function DoubutsuCrossing() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/crossing_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "どうぶつクロッシング",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/KokkiQuiz.jsx
function KokkiQuiz() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/flag_quiz.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "こっきクイズ",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/JewelryMaster.jsx
function JewelryMaster() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/jewelry_master_v6.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "ジュエリーマスター",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/DressUp.jsx
function DressUp() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	useEffect(() => {
		const handler = (e) => {
			if (e.data?.type === "goBack") navigate(-1);
			if (e.data?.type === "goHome") navigate("/");
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/dressup_v2.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "きせかえプリンセス",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-forms allow-pointer-lock"
		})
	});
}
//#endregion
//#region src/games/MoriGame.jsx
function MoriGame() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsxs("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: [/* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/super-retro-bros.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "もりのなかまたち",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		}), /* @__PURE__ */ jsx("button", {
			onClick: () => navigate("/"),
			style: {
				position: "absolute",
				top: "max(10px, env(safe-area-inset-top))",
				left: "max(12px, env(safe-area-inset-left))",
				zIndex: 10,
				background: "rgba(0,0,0,0.55)",
				color: "white",
				border: "1.5px solid rgba(255,255,255,0.3)",
				borderRadius: 20,
				padding: "5px 14px",
				fontSize: 12,
				fontWeight: 700,
				cursor: "pointer"
			},
			children: "🏠 もどる"
		})]
	});
}
//#endregion
//#region src/games/SoraGame.jsx
function SoraGame() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsxs("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: [/* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/shooting_v1.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "そらとびプリンセス",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		}), /* @__PURE__ */ jsx("button", {
			onClick: () => navigate("/"),
			style: {
				position: "absolute",
				top: "max(10px, env(safe-area-inset-top))",
				left: "max(12px, env(safe-area-inset-left))",
				zIndex: 10,
				background: "rgba(0,0,0,0.55)",
				color: "white",
				border: "1.5px solid rgba(255,255,255,0.3)",
				borderRadius: 20,
				padding: "5px 14px",
				fontSize: 12,
				fontWeight: 700,
				cursor: "pointer"
			},
			children: "🏠 もどる"
		})]
	});
}
//#endregion
//#region src/games/BikeGame.jsx
function BikeGame() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsxs("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: [/* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/wakuwaku_bike_v1.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "わくわくバイク",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		}), /* @__PURE__ */ jsx("button", {
			onClick: () => navigate("/"),
			style: {
				position: "absolute",
				top: "max(10px, env(safe-area-inset-top))",
				left: "max(12px, env(safe-area-inset-left))",
				zIndex: 10,
				background: "rgba(0,0,0,0.55)",
				color: "white",
				border: "1.5px solid rgba(255,255,255,0.3)",
				borderRadius: 20,
				padding: "5px 14px",
				fontSize: 12,
				fontWeight: 700,
				cursor: "pointer"
			},
			children: "🏠 もどる"
		})]
	});
}
//#endregion
//#region src/games/AnimalKart.jsx
function AnimalKart() {
	const navigate = useNavigate();
	const iframeRef = useRef(null);
	useIframeBridge(iframeRef);
	return /* @__PURE__ */ jsxs("div", {
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 0,
			overflow: "hidden"
		},
		children: [/* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: "/games/animal_kart_v1.html",
			style: {
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
				position: "absolute",
				top: 0,
				left: 0
			},
			title: "アニマルカートGP",
			allow: "autoplay; fullscreen",
			allowFullScreen: true,
			sandbox: "allow-scripts allow-same-origin allow-popups"
		}), /* @__PURE__ */ jsx("button", {
			onClick: () => navigate("/"),
			style: {
				position: "absolute",
				top: "max(10px, env(safe-area-inset-top))",
				left: "max(12px, env(safe-area-inset-left))",
				zIndex: 10,
				background: "rgba(0,0,0,0.55)",
				color: "white",
				border: "1.5px solid rgba(255,255,255,0.3)",
				borderRadius: 20,
				padding: "5px 14px",
				fontSize: 12,
				fontWeight: 700,
				cursor: "pointer"
			},
			children: "🏠 もどる"
		})]
	});
}
//#endregion
//#region src/pages/PrivacyPage.jsx
function PrivacyPage() {
	const navigate = useNavigate();
	const [lang] = useState(() => localStorage.getItem("wakuwaku_lang") || "ja");
	const en = lang === "en";
	return /* @__PURE__ */ jsxs("div", {
		className: "legal-wrap",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "legal-header",
			children: [/* @__PURE__ */ jsxs("button", {
				className: "legal-back-btn",
				onClick: () => navigate("/"),
				children: ["🏝️ ", en ? "Back" : "もどる"]
			}), /* @__PURE__ */ jsx("span", {
				className: "legal-header-title",
				children: en ? "🔒 Privacy Policy" : "🔒 プライバシーポリシー"
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "legal-content",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "legal-icon",
					children: "🔒"
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "legal-title",
					children: en ? "Privacy Policy" : "プライバシーポリシー"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "legal-date",
					children: en ? "Last updated: 2025-05-01" : "最終更新日：2025年5月1日"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [/* @__PURE__ */ jsxs("h2", { children: ["📋 ", en ? "Overview" : "はじめに"] }), /* @__PURE__ */ jsx("p", { children: en ? "Wakuwaku Island (\"this site\") is a free online game site for children. We are committed to protecting the privacy of all visitors. This policy describes how we handle information." : "わくわくアイランド（以下「当サイト」）は、子ども向けの無料オンラインゲームサイトです。すべての訪問者のプライバシーを保護することに努めています。このポリシーでは、情報の取り扱いについてご説明します。" })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [
						/* @__PURE__ */ jsxs("h2", { children: ["📵 ", en ? "No Personal Information Collected" : "個人情報の非収集"] }),
						/* @__PURE__ */ jsx("p", { children: en ? "This site does NOT collect any of the following:" : "当サイトでは、以下の個人情報は一切収集しません：" }),
						/* @__PURE__ */ jsx("ul", { children: en ? /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("li", { children: "Name, address, phone number, or email address" }),
							/* @__PURE__ */ jsx("li", { children: "Account registration information" }),
							/* @__PURE__ */ jsx("li", { children: "Payment or financial information" }),
							/* @__PURE__ */ jsx("li", { children: "Information that could identify specific individuals" })
						] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("li", { children: "氏名・住所・電話番号・メールアドレス等の個人情報" }),
							/* @__PURE__ */ jsx("li", { children: "アカウント登録情報" }),
							/* @__PURE__ */ jsx("li", { children: "支払い・金融情報" }),
							/* @__PURE__ */ jsx("li", { children: "特定の個人を識別できる情報" })
						] }) })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [
						/* @__PURE__ */ jsxs("h2", { children: ["💾 ", en ? "Use of localStorage" : "localStorageの使用について"] }),
						/* @__PURE__ */ jsx("p", { children: en ? "This site saves the following data locally in your browser (localStorage) to provide game features. This data is stored only on your device and is never sent to any server." : "当サイトでは、ゲームの機能を提供するため、以下のデータをお使いのブラウザ内（localStorage）にのみ保存します。このデータはお使いの端末内にのみ保存され、外部サーバーに送信されることは一切ありません。" }),
						/* @__PURE__ */ jsx("ul", { children: en ? /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("li", { children: "Language setting (Japanese / English)" }),
							/* @__PURE__ */ jsx("li", { children: "Mute setting (sound on / off)" }),
							/* @__PURE__ */ jsx("li", { children: "High scores for each game" }),
							/* @__PURE__ */ jsx("li", { children: "Coin count and login bonus streak" }),
							/* @__PURE__ */ jsx("li", { children: "Costume (Kisekae) selection for characters" }),
							/* @__PURE__ */ jsx("li", { children: "Unlocked shop items" })
						] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("li", { children: "言語設定（日本語 / 英語）" }),
							/* @__PURE__ */ jsx("li", { children: "ミュート設定（音あり / 音なし）" }),
							/* @__PURE__ */ jsx("li", { children: "各ゲームのハイスコア" }),
							/* @__PURE__ */ jsx("li", { children: "コイン枚数・ログインボーナスの連続日数" }),
							/* @__PURE__ */ jsx("li", { children: "キャラクターの着せ替え設定" }),
							/* @__PURE__ */ jsx("li", { children: "ショップで解放したアイテム" })
						] }) }),
						/* @__PURE__ */ jsx("p", {
							style: { marginTop: 10 },
							children: en ? "You can delete this data at any time by clearing your browser's site data." : "これらのデータはブラウザのサイトデータを削除することで、いつでも消去できます。"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [
						/* @__PURE__ */ jsxs("h2", { children: ["📊 ", en ? "Google Analytics" : "Google Analyticsについて"] }),
						/* @__PURE__ */ jsx("p", { children: en ? "This site uses Google Analytics to understand how the site is being used (e.g., number of page views, which games are popular). Google Analytics collects anonymous, aggregate data and does not identify individual users." : "当サイトでは、サイトの利用状況（ページビュー数、人気ゲームなど）を把握するためにGoogle Analyticsを使用しています。Google Analyticsは匿名の集計データを収集するものであり、個人を特定するものではありません。" }),
						/* @__PURE__ */ jsx("p", {
							style: { marginTop: 8 },
							children: en ? "Google Analytics uses cookies to collect anonymous statistical data. You can opt out by installing the Google Analytics Opt-out Browser Add-on." : "Google Analyticsはクッキーを使用して匿名の統計データを収集します。Google アナリティクス オプトアウト アドオンをインストールすることで、収集を拒否することができます。"
						}),
						/* @__PURE__ */ jsx("p", {
							style: { marginTop: 8 },
							children: en ? "For details on how Google handles data, please see Google's Privacy Policy." : "Googleによるデータの取り扱いについては、Googleのプライバシーポリシーをご確認ください。"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [/* @__PURE__ */ jsxs("h2", { children: ["👶 ", en ? "For Children's Safety" : "お子さまの安全のために"] }), /* @__PURE__ */ jsx("p", { children: en ? "This site is designed for children. We do not display advertising, do not link to external sites that collect personal information, and do not include any features for communication between users." : "当サイトは子ども向けに設計されています。広告の表示は行わず、個人情報を収集する外部サイトへのリンクも設けていません。また、ユーザー間でのコミュニケーション機能も一切ありません。" })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [/* @__PURE__ */ jsxs("h2", { children: ["🔄 ", en ? "Changes to This Policy" : "ポリシーの変更"] }), /* @__PURE__ */ jsx("p", { children: en ? "We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated date." : "当サイトは必要に応じてこのプライバシーポリシーを更新することがあります。変更があった場合は、このページの更新日を変更してお知らせします。" })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-contact",
					children: [/* @__PURE__ */ jsxs("h2", {
						style: {
							justifyContent: "center",
							marginBottom: 8
						},
						children: ["✉️ ", en ? "Contact" : "お問い合わせ"]
					}), /* @__PURE__ */ jsx("p", { children: en ? "If you have any questions about this Privacy Policy, please contact us through the site's inquiry form." : "このプライバシーポリシーについてご不明な点がございましたら、サイトのお問い合わせフォームよりご連絡ください。" })]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "legal-footnote",
					children: ["© 2025 Wakuwaku Island. ", en ? "All rights reserved." : "All rights reserved."]
				})
			]
		})]
	});
}
//#endregion
//#region src/pages/TermsPage.jsx
function TermsPage() {
	const navigate = useNavigate();
	const [lang] = useState(() => localStorage.getItem("wakuwaku_lang") || "ja");
	const en = lang === "en";
	return /* @__PURE__ */ jsxs("div", {
		className: "legal-wrap",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "legal-header",
			children: [/* @__PURE__ */ jsxs("button", {
				className: "legal-back-btn",
				onClick: () => navigate("/"),
				children: ["🏝️ ", en ? "Back" : "もどる"]
			}), /* @__PURE__ */ jsx("span", {
				className: "legal-header-title",
				children: en ? "📜 Terms of Use" : "📜 利用規約"
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "legal-content",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "legal-icon",
					children: "📜"
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "legal-title",
					children: en ? "Terms of Use" : "利用規約"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "legal-date",
					children: en ? "Last updated: 2025-05-01" : "最終更新日：2025年5月1日"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [/* @__PURE__ */ jsxs("h2", { children: ["🌐 ", en ? "About This Site" : "サイトについて"] }), /* @__PURE__ */ jsx("p", { children: en ? "Wakuwaku Island (\"this site\") is a free online game site for children, provided free of charge. By using this site, you agree to these Terms of Use." : "わくわくアイランド（以下「当サイト」）は、子ども向けの無料オンラインゲームサイトです。当サイトをご利用いただくことで、この利用規約に同意したものとみなします。" })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [/* @__PURE__ */ jsxs("h2", { children: ["✅ ", en ? "Permitted Use" : "利用について"] }), /* @__PURE__ */ jsx("ul", { children: en ? /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("li", { children: "This site can be used free of charge by anyone" }),
						/* @__PURE__ */ jsx("li", { children: "Children under 13 should use this site with parental supervision" }),
						/* @__PURE__ */ jsx("li", { children: "This site can be used on PC, smartphone, and tablet browsers" }),
						/* @__PURE__ */ jsx("li", { children: "Game high scores and settings are saved in your browser (localStorage)" })
					] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("li", { children: "当サイトはどなたでも無料でご利用いただけます" }),
						/* @__PURE__ */ jsx("li", { children: "13歳未満のお子さまは保護者の監督のもとでご利用ください" }),
						/* @__PURE__ */ jsx("li", { children: "PC・スマートフォン・タブレットのブラウザでご利用いただけます" }),
						/* @__PURE__ */ jsx("li", { children: "ゲームのハイスコアや設定はブラウザ内（localStorage）に保存されます" })
					] }) })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [/* @__PURE__ */ jsxs("h2", { children: ["🚫 ", en ? "Prohibited Activities" : "禁止事項"] }), /* @__PURE__ */ jsx("ul", { children: en ? /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("li", { children: "Actions that damage or interfere with this site" }),
						/* @__PURE__ */ jsx("li", { children: "Unauthorized modification or reverse engineering of site content" }),
						/* @__PURE__ */ jsx("li", { children: "Commercial use or redistribution of site content without permission" }),
						/* @__PURE__ */ jsx("li", { children: "Actions that violate laws or public morals" }),
						/* @__PURE__ */ jsx("li", { children: "Any other actions deemed inappropriate by the site operator" })
					] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("li", { children: "当サイトを毀損・妨害する行為" }),
						/* @__PURE__ */ jsx("li", { children: "当サイトのコンテンツの無断改変・リバースエンジニアリング" }),
						/* @__PURE__ */ jsx("li", { children: "当サイトのコンテンツの無断での商用利用・再配布" }),
						/* @__PURE__ */ jsx("li", { children: "法令または公序良俗に違反する行為" }),
						/* @__PURE__ */ jsx("li", { children: "その他、運営者が不適切と判断する行為" })
					] }) })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [/* @__PURE__ */ jsxs("h2", { children: ["⚠️ ", en ? "Disclaimer" : "免責事項"] }), /* @__PURE__ */ jsx("ul", { children: en ? /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("li", { children: "Game scores and progress saved in localStorage may be lost if browser data is cleared" }),
						/* @__PURE__ */ jsx("li", { children: "The site operator is not responsible for any damages resulting from use of this site" }),
						/* @__PURE__ */ jsx("li", { children: "Content and features may be changed or discontinued without notice" }),
						/* @__PURE__ */ jsx("li", { children: "We do not guarantee uninterrupted availability of the site" })
					] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("li", { children: "localStorageに保存されたゲームデータはブラウザのデータ削除により消去される場合があります" }),
						/* @__PURE__ */ jsx("li", { children: "当サイトの利用により生じた損害について、運営者は一切の責任を負いません" }),
						/* @__PURE__ */ jsx("li", { children: "コンテンツや機能は予告なく変更・終了する場合があります" }),
						/* @__PURE__ */ jsx("li", { children: "サイトの継続的な利用可能性を保証するものではありません" })
					] }) })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [/* @__PURE__ */ jsxs("h2", { children: ["©️ ", en ? "Copyright" : "著作権"] }), /* @__PURE__ */ jsx("p", { children: en ? "All content on this site (games, designs, text, etc.) is owned by the site operator. Unauthorized reproduction or use is prohibited. Emoji displayed on the site are provided by third parties (OS/browser vendors) and are subject to their respective licenses." : "当サイトのすべてのコンテンツ（ゲーム・デザイン・テキスト等）は運営者に帰属します。無断転載・無断利用を禁止します。なお、サイト上で表示している絵文字はOS・ブラウザベンダー等の第三者が提供するものであり、各々のライセンスに従います。" })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-section",
					children: [/* @__PURE__ */ jsxs("h2", { children: ["🔄 ", en ? "Changes to Terms" : "規約の変更"] }), /* @__PURE__ */ jsx("p", { children: en ? "These Terms of Use may be updated at any time without prior notice. The latest version will always be available on this page." : "本利用規約は予告なく変更される場合があります。最新版は常にこのページでご確認いただけます。" })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "legal-contact",
					children: [/* @__PURE__ */ jsxs("h2", {
						style: {
							justifyContent: "center",
							marginBottom: 8
						},
						children: ["✉️ ", en ? "Contact" : "お問い合わせ"]
					}), /* @__PURE__ */ jsx("p", { children: en ? "If you have any questions about these Terms of Use, please contact us through the site's inquiry form." : "利用規約についてご不明な点がございましたら、サイトのお問い合わせフォームよりご連絡ください。" })]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "legal-footnote",
					children: ["© 2025 Wakuwaku Island. ", en ? "All rights reserved." : "All rights reserved."]
				})
			]
		})]
	});
}
//#endregion
//#region src/App.jsx
function GameWithSEO({ route, children }) {
	const meta = GAME_META[route];
	if (!meta) return children;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(GameSEO, {
		route,
		...meta
	}), children] });
}
var GAME_ROUTES = new Set([
	"/shabondama",
	"/kudamono-catch",
	"/meiro",
	"/doubutsu-puzzle",
	"/kazu-asobi",
	"/animal-soccer",
	"/sushi",
	"/ichigo",
	"/kakurenbo",
	"/moji",
	"/tashizan",
	"/iro",
	"/machi",
	"/kokki",
	"/jewelry-master",
	"/tetris",
	"/runner",
	"/shooting",
	"/sniper",
	"/crossing",
	"/dressup",
	"/moji-asobi",
	"/iro-awase",
	"/flag-quiz",
	"/shoot",
	"/mori",
	"/sora",
	"/bike",
	"/kart",
	"/kudamono",
	"/puzzle",
	"/kazu",
	"/soccer"
]);
function RouteTracker() {
	const location = useLocation();
	useEffect(() => {
		if (GAME_ROUTES.has(location.pathname)) recordRecentGame(location.pathname);
	}, [location.pathname]);
	return null;
}
function App() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(RouteTracker, {}), /* @__PURE__ */ jsxs(Routes, { children: [
		/* @__PURE__ */ jsx(Route, {
			path: "/",
			element: /* @__PURE__ */ jsx(TopPage, {})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/shabondama",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/shabondama",
				children: /* @__PURE__ */ jsx(Shabondama, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/kudamono-catch",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/kudamono-catch",
				children: /* @__PURE__ */ jsx(KudamonoCatch, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/meiro",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/meiro",
				children: /* @__PURE__ */ jsx(Meiro, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/doubutsu-puzzle",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/doubutsu-puzzle",
				children: /* @__PURE__ */ jsx(DoubutsuPuzzle, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/kazu-asobi",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/kazu-asobi",
				children: /* @__PURE__ */ jsx(KazuAsobi, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/animal-soccer",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/animal-soccer",
				children: /* @__PURE__ */ jsx(AnimalSoccer, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/sushi",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/sushi",
				children: /* @__PURE__ */ jsx(SushiGame, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/ichigo",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/ichigo",
				children: /* @__PURE__ */ jsx(IchigoGame, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/kakurenbo",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/kakurenbo",
				children: /* @__PURE__ */ jsx(DoubutsuKakurenbo, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/moji",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/moji",
				children: /* @__PURE__ */ jsx(MojiAsobi, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/tashizan",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/tashizan",
				children: /* @__PURE__ */ jsx(TashizanGame, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/iro",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/iro",
				children: /* @__PURE__ */ jsx(IroAwase, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/machi",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/machi",
				children: /* @__PURE__ */ jsx(MachiDukuri, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/kudamono",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/kudamono-catch",
				children: /* @__PURE__ */ jsx(KudamonoCatch, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/puzzle",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/doubutsu-puzzle",
				children: /* @__PURE__ */ jsx(DoubutsuPuzzle, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/kazu",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/kazu-asobi",
				children: /* @__PURE__ */ jsx(KazuAsobi, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/soccer",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/animal-soccer",
				children: /* @__PURE__ */ jsx(AnimalSoccer, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/moji-asobi",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/moji",
				children: /* @__PURE__ */ jsx(MojiAsobi, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/iro-awase",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/iro",
				children: /* @__PURE__ */ jsx(IroAwase, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/flag-quiz",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/kokki",
				children: /* @__PURE__ */ jsx(KokkiQuiz, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/shoot",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/shooting",
				children: /* @__PURE__ */ jsx(DoubutsuShoot, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/tetris",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/tetris",
				children: /* @__PURE__ */ jsx(DoubutsuBlock, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/runner",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/runner",
				children: /* @__PURE__ */ jsx(DoubutsuRunner, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/shooting",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/shooting",
				children: /* @__PURE__ */ jsx(DoubutsuShoot, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/sniper",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/sniper",
				children: /* @__PURE__ */ jsx(DoubutsuSniper, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/crossing",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/crossing",
				children: /* @__PURE__ */ jsx(DoubutsuCrossing, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/kokki",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/kokki",
				children: /* @__PURE__ */ jsx(KokkiQuiz, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/jewelry-master",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/jewelry-master",
				children: /* @__PURE__ */ jsx(JewelryMaster, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/dressup",
			element: /* @__PURE__ */ jsx(DressUp, {})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/mori",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/mori",
				children: /* @__PURE__ */ jsx(MoriGame, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/sora",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/sora",
				children: /* @__PURE__ */ jsx(SoraGame, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/bike",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/bike",
				children: /* @__PURE__ */ jsx(BikeGame, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/kart",
			element: /* @__PURE__ */ jsx(GameWithSEO, {
				route: "/kart",
				children: /* @__PURE__ */ jsx(AnimalKart, {})
			})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/privacy",
			element: /* @__PURE__ */ jsx(PrivacyPage, {})
		}),
		/* @__PURE__ */ jsx(Route, {
			path: "/terms",
			element: /* @__PURE__ */ jsx(TermsPage, {})
		})
	] })] });
}
//#endregion
//#region src/entry-server.jsx
function render(url) {
	return { html: renderToString(/* @__PURE__ */ jsx(HelmetProvider, {
		context: {},
		children: /* @__PURE__ */ jsx(StaticRouter, {
			location: url,
			children: /* @__PURE__ */ jsx(App, {})
		})
	})) };
}
//#endregion
export { render };
