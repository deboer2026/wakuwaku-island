import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  playMachiBgm, stopBgm,
  ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { trackGameStart } from '../utils/analytics';
import { addCoins, getCoins } from '../utils/coins';
import './MachiDukuri.css';

/* ─── Constants ─────────────────────────────────────────── */
const GC = 20, GR = 20;
const ISO_TW = 64, ISO_TH = 32;

const CATS = [
  { id:'house',   ja:'🏠 いえ',    en:'🏠 House'   },
  { id:'shop',    ja:'🏪 おみせ',  en:'🏪 Shop'    },
  { id:'nature',  ja:'🌳 しぜん',  en:'🌳 Nature'  },
  { id:'road',    ja:'🛣️ みち',   en:'🛣️ Road'   },
  { id:'fun',     ja:'🎡 あそび',  en:'🎡 Fun'     },
  { id:'special', ja:'⭐ とくべつ',en:'⭐ Special'  },
];

const ITEMS = {
  house: [
    { id:'h1', e:'🏠', ja:'おうち',   en:'House',    cost:10,  inc:1,  ul:0   },
    { id:'h2', e:'🏡', ja:'にわつき', en:'Garden',   cost:20,  inc:2,  ul:0   },
    { id:'h3', e:'🛖', ja:'こや',     en:'Hut',      cost:5,   inc:0,  ul:0   },
    { id:'h4', e:'🏗️',ja:'こうじ',  en:'Building', cost:8,   inc:0,  ul:0   },
    { id:'h5', e:'🏰', ja:'おしろ',   en:'Castle',   cost:80,  inc:8,  ul:50  },
    { id:'h6', e:'🏯', ja:'やかた',   en:'Fort',     cost:60,  inc:6,  ul:40  },
    { id:'h7', e:'⛪', ja:'きょうかい',en:'Church',  cost:40,  inc:3,  ul:30  },
    { id:'h8', e:'🏛️',ja:'しんでん', en:'Temple',   cost:50,  inc:5,  ul:35  },
  ],
  shop: [
    { id:'s1', e:'🏪', ja:'おみせ',     en:'Shop',      cost:15, inc:2, ul:0  },
    { id:'s2', e:'🍰', ja:'ケーキや',   en:'Bakery',    cost:20, inc:3, ul:0  },
    { id:'s3', e:'🍎', ja:'くだものや', en:'Fruit shop',cost:18, inc:2, ul:0  },
    { id:'s4', e:'📚', ja:'としょかん', en:'Library',   cost:30, inc:2, ul:20 },
    { id:'s5', e:'🏬', ja:'デパート',   en:'Mall',      cost:50, inc:6, ul:30 },
    { id:'s6', e:'🏥', ja:'びょういん', en:'Hospital',  cost:40, inc:4, ul:25 },
    { id:'s7', e:'🏫', ja:'がっこう',   en:'School',    cost:45, inc:4, ul:30 },
    { id:'s8', e:'🎪', ja:'サーカス',   en:'Circus',    cost:60, inc:8, ul:40 },
  ],
  nature: [
    { id:'n1', e:'🌳', ja:'き',       en:'Tree',      cost:5,  inc:0, ul:0  },
    { id:'n2', e:'🌲', ja:'もみのき', en:'Pine',      cost:5,  inc:0, ul:0  },
    { id:'n3', e:'🌸', ja:'さくら',   en:'Cherry',    cost:8,  inc:0, ul:0  },
    { id:'n4', e:'🌺', ja:'はな',     en:'Flower',    cost:3,  inc:0, ul:0  },
    { id:'n5', e:'⛲', ja:'ふんすい', en:'Fountain',  cost:20, inc:1, ul:15 },
    { id:'n6', e:'🌊', ja:'うみ',     en:'Ocean',     cost:15, inc:0, ul:10 },
    { id:'n7', e:'⛰️',ja:'やま',     en:'Mountain',  cost:10, inc:0, ul:0  },
    { id:'n8', e:'🌈', ja:'にじ',     en:'Rainbow',   cost:8,  inc:0, ul:0  },
  ],
  road: [
    { id:'r1', e:'🛣️',ja:'みち',     en:'Road',     cost:3,  inc:0, ul:0  },
    { id:'r2', e:'🚦', ja:'しんごう', en:'Signal',   cost:5,  inc:0, ul:0  },
    { id:'r3', e:'🌉', ja:'はし',     en:'Bridge',   cost:15, inc:0, ul:10 },
    { id:'r4', e:'🚉', ja:'えき',     en:'Station',  cost:30, inc:4, ul:20 },
    { id:'r5', e:'✈️', ja:'くうこう', en:'Airport',  cost:60, inc:8, ul:40 },
    { id:'r6', e:'⛽', ja:'ガススタ', en:'Gas stn',  cost:10, inc:1, ul:5  },
    { id:'r7', e:'🅿️',ja:'ちゅうしゃ',en:'Parking', cost:8,  inc:1, ul:5  },
    { id:'r8', e:'🚀', ja:'ロケット', en:'Rocket',   cost:80, inc:0, ul:60 },
  ],
  fun: [
    { id:'f1', e:'🎡', ja:'かんらんしゃ', en:'Ferris wheel', cost:40, inc:5, ul:25 },
    { id:'f2', e:'🎠', ja:'メリーゴー',   en:'Carousel',     cost:35, inc:4, ul:20 },
    { id:'f3', e:'🏟️',ja:'スタジアム',   en:'Stadium',      cost:70, inc:9, ul:50 },
    { id:'f4', e:'🎆', ja:'はなび',       en:'Fireworks',    cost:15, inc:0, ul:10 },
    { id:'f5', e:'⛺', ja:'キャンプ',     en:'Camping',      cost:8,  inc:0, ul:0  },
    { id:'f6', e:'🏖️',ja:'ビーチ',       en:'Beach',        cost:25, inc:3, ul:15 },
    { id:'f7', e:'🎭', ja:'げきじょう',   en:'Theater',      cost:45, inc:6, ul:30 },
    { id:'f8', e:'🎰', ja:'ゲームC',      en:'Arcade',       cost:30, inc:4, ul:20 },
  ],
  special: [
    { id:'sp1', e:'🗼',  ja:'タワー',       en:'Tower',    cost:80,  inc:10, ul:60  },
    { id:'sp2', e:'🏆',  ja:'トロフィー',   en:'Trophy',   cost:50,  inc:0,  ul:40  },
    { id:'sp3', e:'💎',  ja:'ダイヤ',       en:'Diamond',  cost:120, inc:15, ul:80  },
    { id:'sp4', e:'🌟',  ja:'スター',       en:'Star',     cost:30,  inc:2,  ul:20  },
    { id:'sp5', e:'🦄',  ja:'ユニコーン',   en:'Unicorn',  cost:60,  inc:8,  ul:40  },
    { id:'sp6', e:'🐉',  ja:'ドラゴン',     en:'Dragon',   cost:150, inc:20, ul:100 },
    { id:'sp7', e:'🗽',  ja:'じゆうのめがみ',en:'Statue',  cost:90,  inc:12, ul:60  },
    { id:'sp8', e:'🎪',  ja:'まほうサーカス',en:'Magic',   cost:100, inc:15, ul:70  },
  ],
};

const ALL_ITEMS = Object.values(ITEMS).flat();

function getMachiLoginBonus() {
  const last = localStorage.getItem('machi_ll') || '';
  const today = new Date().toDateString();
  if (last === today) return null;
  const streak = parseInt(localStorage.getItem('machi_sk') || '0');
  const bonus = [10, 15, 20, 25, 30][Math.min(streak, 4)];
  return { bonus, streak: streak + 1 };
}
function claimMachiLoginBonus(bonus, streak) {
  localStorage.setItem('machi_ll', new Date().toDateString());
  localStorage.setItem('machi_sk', String(streak));
  addCoins(bonus);
}

/* ─── Canvas helpers ─────────────────────────────────────── */
function isoToScreen(gx, gy, scale, px, py) {
  return {
    x: px + (gx - gy) * (ISO_TW / 2) * scale,
    y: py + (gx + gy) * (ISO_TH / 2) * scale,
  };
}
function screenToIso(sx, sy, scale, px, py) {
  const dx = sx - px, dy = sy - py;
  const htw = (ISO_TW / 2) * scale;
  const hth = (ISO_TH / 2) * scale;
  const gx = Math.round((dx / htw + dy / hth) / 2);
  const gy = Math.round((dy / hth - dx / htw) / 2);
  return { gx, gy };
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function ptDist(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }

/* ─── Component ─────────────────────────────────────────── */
export default function MachiDukuri() {
  const navigate = useNavigate();
  const [lang]    = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [screen,  setScreen]  = useState('title');
  const [muted,   setMuted]   = useState(getMuteState);
  const [coins,   setCoins]   = useState(getCoins);
  const [cat,     setCat]     = useState('house');
  const [selDef,  setSelDef]  = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [income,  setIncome]  = useState(0);
  const [loginBonus, setLoginBonus] = useState(null);
  const [toast,   setToast]   = useState('');

  const canvasRef   = useRef(null);
  const bgCanvasRef = useRef(null);
  const bgReadyRef  = useRef(false);

  // mutable game state
  const placedRef   = useRef([]);
  const gridRef     = useRef({});
  const scaleRef    = useRef(0.72);
  const panXRef     = useRef(0);
  const panYRef     = useRef(0);
  const selDefRef   = useRef(null);
  const selItemRef  = useRef(null);
  const hovRef      = useRef(null);
  const incomeRef   = useRef(0);
  const coinsRef    = useRef(getCoins());
  const totalRef    = useRef(0);

  // pointer state
  const activePtr   = useRef(new Map());
  const dragStart   = useRef(null);
  const isDragRef   = useRef(false);
  const pinchStart  = useRef(null);

  const animRef     = useRef(null);
  const incTimerRef = useRef(null);
  const bigTimerRef = useRef(null);
  const toastTmRef  = useRef(null);

  // page title
  useEffect(() => {
    document.title = 'わくわくまちづくり | わくわくアイランド';
    return () => { document.title = 'わくわくアイランド | 無料の子供向けブラウザゲーム'; };
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (incTimerRef.current) clearInterval(incTimerRef.current);
      if (bigTimerRef.current) clearInterval(bigTimerRef.current);
      stopBgm();
    };
  }, []);

  // 画面回転・リサイズ時にキャンバスを再フィット（パン位置は維持）
  useEffect(() => {
    if (screen !== 'game') return;
    const handleResize = () => {
      const c = canvasRef.current;
      const bg = bgCanvasRef.current;
      if (!c || !bg) return;
      const parent = c.parentElement;
      if (!parent) return;
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (W === c.width && H === c.height) return; // 変化なし
      c.width = bg.width = W;
      c.height = bg.height = H;
      bgReadyRef.current = false;
      drawBg();
      // パン位置が画面外に出た場合のみ軽く補正
      const maxPanX = W * 0.8;
      const minPanX = W * 0.2;
      if (panXRef.current > maxPanX) panXRef.current = maxPanX;
      if (panXRef.current < minPanX - W) panXRef.current = minPanX - W;
    };
    const handleOrient = () => setTimeout(handleResize, 200);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrient);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrient);
    };
  }, [screen, drawBg]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTmRef.current) clearTimeout(toastTmRef.current);
    toastTmRef.current = setTimeout(() => setToast(''), 2200);
  }, []);

  /* ─── Background canvas ─────────────────────────── */
  const drawBg = useCallback(() => {
    const c = bgCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#5BC8F5');
    g.addColorStop(0.5, '#87CEEB');
    g.addColorStop(1, '#C5EAF8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // clouds
    const clouds = [
      { x: W * 0.1, y: H * 0.07, r: 28 },
      { x: W * 0.35, y: H * 0.04, r: 36 },
      { x: W * 0.65, y: H * 0.09, r: 30 },
      { x: W * 0.88, y: H * 0.05, r: 22 },
    ];
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    clouds.forEach(({ x, y, r }) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.arc(x + r * 0.7, y + r * 0.1, r * 0.75, 0, Math.PI * 2);
      ctx.arc(x - r * 0.6, y + r * 0.15, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
    });
    // sun
    ctx.fillStyle = '#FFE082';
    ctx.beginPath();
    ctx.arc(W * 0.88, H * 0.1, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(W * 0.86, H * 0.09, 13, 0, Math.PI * 2);
    ctx.fill();
    bgReadyRef.current = true;
  }, []);

  /* ─── Main draw loop ─────────────────────────────── */
  const drawFrame = useCallback(() => {
    const c = canvasRef.current;
    const bg = bgCanvasRef.current;
    if (!c || !bg) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // blit background
    if (bgReadyRef.current) ctx.drawImage(bg, 0, 0);

    const sc = scaleRef.current;
    const px = panXRef.current;
    const py = panYRef.current;
    const tw = ISO_TW * sc;
    const th = ISO_TH * sc;
    const hov = hovRef.current;
    const selI = selItemRef.current;
    const selD = selDefRef.current;

    // draw tiles
    for (let gy = 0; gy < GR; gy++) {
      for (let gx = 0; gx < GC; gx++) {
        const { x, y } = isoToScreen(gx, gy, sc, px, py);
        if (x < -tw || x > W + tw || y < -th || y > H + th) continue;
        const even = (gx + gy) % 2 === 0;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + tw / 2, y + th / 2);
        ctx.lineTo(x, y + th);
        ctx.lineTo(x - tw / 2, y + th / 2);
        ctx.closePath();
        ctx.fillStyle = even ? 'rgba(90,180,80,.82)' : 'rgba(76,160,68,.82)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100,200,90,.38)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
        // tile sides (3D)
        ctx.beginPath();
        ctx.moveTo(x, y + th);
        ctx.lineTo(x + tw / 2, y + th / 2);
        ctx.lineTo(x + tw / 2, y + th / 2 + th * 0.12);
        ctx.lineTo(x, y + th + th * 0.12);
        ctx.closePath();
        ctx.fillStyle = 'rgba(55,140,45,.6)';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y + th);
        ctx.lineTo(x - tw / 2, y + th / 2);
        ctx.lineTo(x - tw / 2, y + th / 2 + th * 0.12);
        ctx.lineTo(x, y + th + th * 0.12);
        ctx.closePath();
        ctx.fillStyle = 'rgba(42,120,32,.6)';
        ctx.fill();
        // hover highlight
        if (hov && hov.gx === gx && hov.gy === gy && selD) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + tw / 2, y + th / 2);
          ctx.lineTo(x, y + th);
          ctx.lineTo(x - tw / 2, y + th / 2);
          ctx.closePath();
          ctx.fillStyle = 'rgba(126,200,255,.3)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(126,200,255,.75)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }

    // draw items (sorted back to front)
    const sorted = [...placedRef.current].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
    sorted.forEach(item => {
      const { x, y } = isoToScreen(item.gx, item.gy, sc, px, py);
      if (x < -tw * 2 || x > W + tw * 2 || y < -th * 4 || y > H + th * 4) return;
      const sz = tw * 0.85;
      const isSel = item === selI;
      ctx.save();
      ctx.translate(x, y + th * 0.5);
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,.22)';
      ctx.beginPath();
      ctx.ellipse(0, 2, sz * 0.28, sz * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      if (isSel) { ctx.shadowColor = 'rgba(255,160,40,.8)'; ctx.shadowBlur = 16; }
      ctx.font = `${Math.round(sz * 0.72)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(item.def.e, 0, -sz * 0.05);
      if (item.def.inc > 0) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,.52)';
        const bw = sz * 0.7;
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -sz * 0.78, bw, sz * 0.22, sz * 0.06);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.font = `bold ${Math.round(sz * 0.15)}px sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${item.def.inc}🪙`, 0, -sz * 0.67);
      }
      ctx.restore();
    });

    animRef.current = requestAnimationFrame(drawFrame);
  }, []);

  /* ─── init size ─────────────────────────────────── */
  const initCanvas = useCallback(() => {
    const c = canvasRef.current;
    const bg = bgCanvasRef.current;
    if (!c || !bg) return;
    const parent = c.parentElement;
    const W = parent.clientWidth;
    const H = parent.clientHeight;
    c.width = bg.width = W;
    c.height = bg.height = H;
    bgReadyRef.current = false;
    drawBg();
    // set initial pan: center of grid at ~30% from top
    // grid center (GC/2, GR/2)
    const sc = scaleRef.current;
    const cx = GC / 2, cy = GR / 2;
    panXRef.current = W / 2 - (cx - cy) * (ISO_TW / 2) * sc;
    panYRef.current = H * 0.28 - (cx + cy) * (ISO_TH / 2) * sc;
  }, [drawBg]);

  /* ─── fit view ───────────────────────────────────── */
  const fitView = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const W = c.width, H = c.height;
    const gridW = (GC + GR) * (ISO_TW / 2);
    const gridH = (GC + GR) * (ISO_TH / 2) + ISO_TH;
    const sc = Math.min(W * 0.92 / gridW, H * 0.88 / gridH);
    scaleRef.current = clamp(sc, 0.25, 4);
    const nsc = scaleRef.current;
    panXRef.current = W / 2 - 0 * (ISO_TW / 2) * nsc; // grid (0,GR/2) left edge
    panXRef.current = W / 2 + (0 - GR) * (ISO_TW / 2) * nsc / 2; // roughly center
    panXRef.current = W / 2;
    panYRef.current = H * 0.06;
  }, []);

  /* ─── save/load ──────────────────────────────────── */
  const saveCity = useCallback(() => {
    localStorage.setItem('machi_c', String(coinsRef.current));
    localStorage.setItem('machi_p', JSON.stringify(
      placedRef.current.map(i => ({ id: i.def.id, gx: i.gx, gy: i.gy }))
    ));
    showToast(lang === 'en' ? '💾 Saved!' : '💾 セーブしたよ！');
  }, [lang, showToast]);

  const placeItem = useCallback((def, gx, gy, spend) => {
    const item = { def, gx, gy };
    placedRef.current.push(item);
    gridRef.current[`${gx},${gy}`] = item;
    incomeRef.current += def.inc;
    totalRef.current++;
    if (spend) {
      coinsRef.current -= def.cost;
      localStorage.setItem('machi_c', String(coinsRef.current));
      setCoins(coinsRef.current);
      localStorage.setItem('machi_p', JSON.stringify(
        placedRef.current.map(i => ({ id: i.def.id, gx: i.gx, gy: i.gy }))
      ));
    }
    setIncome(incomeRef.current);
    setTotalItems(totalRef.current);
  }, []);

  const removeItem = useCallback((item) => {
    placedRef.current = placedRef.current.filter(i => i !== item);
    delete gridRef.current[`${item.gx},${item.gy}`];
    incomeRef.current = Math.max(0, incomeRef.current - item.def.inc);
    totalRef.current = Math.max(0, totalRef.current - 1);
    const refund = Math.floor(item.def.cost / 2);
    coinsRef.current += refund;
    addCoins(refund);
    setCoins(coinsRef.current);
    localStorage.setItem('machi_c', String(coinsRef.current));
    localStorage.setItem('machi_p', JSON.stringify(
      placedRef.current.map(i => ({ id: i.def.id, gx: i.gx, gy: i.gy }))
    ));
    setIncome(incomeRef.current);
    setTotalItems(totalRef.current);
    showToast(lang === 'en' ? '🗑️ Removed (½ refund)' : `🗑️ とりのぞいたよ (+${refund}🪙)`);
  }, [lang, showToast]);

  /* ─── pointer events ────────────────────────────── */
  const handleTap = useCallback((sx, sy) => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const cx = sx - rect.left, cy = sy - rect.top;
    const { gx, gy } = screenToIso(cx, cy, scaleRef.current, panXRef.current, panYRef.current);
    if (gx < 0 || gx >= GC || gy < 0 || gy >= GR) return;
    const hit = placedRef.current.find(i => i.gx === gx && i.gy === gy);
    if (hit) {
      if (selItemRef.current === hit) {
        // second tap = remove
        removeItem(hit);
        selItemRef.current = null;
        setSelDef(null);
      } else {
        selItemRef.current = hit;
        selDefRef.current = null;
        setSelDef(null);
        showToast(lang === 'en'
          ? `Tap again to remove (½ refund)`
          : `もういちどタップで とりのぞく（半額もどる）`);
      }
      return;
    }
    if (!selDefRef.current) return;
    if (gridRef.current[`${gx},${gy}`]) {
      showToast(lang === 'en' ? 'Already occupied!' : 'ここにはおけない！');
      return;
    }
    const def = selDefRef.current;
    if (coinsRef.current < def.cost) {
      showToast(lang === 'en' ? '🪙 Not enough coins!' : '🪙 コインがたりない！');
      return;
    }
    placeItem(def, gx, gy, true);
    selItemRef.current = null;
    showToast(lang === 'en' ? '✨ Placed!' : '✨ おいたよ！');
  }, [lang, placeItem, removeItem, showToast]);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    const pt = { x: e.clientX, y: e.clientY };
    activePtr.current.set(e.pointerId, pt);
    if (activePtr.current.size === 1) {
      dragStart.current = { x: pt.x, y: pt.y, px: panXRef.current, py: panYRef.current };
      isDragRef.current = false;
    } else if (activePtr.current.size === 2) {
      const pts = [...activePtr.current.values()];
      pinchStart.current = { dist: ptDist(pts[0], pts[1]), scale: scaleRef.current };
    }
  }, []);

  const onPointerMove = useCallback((e) => {
    e.preventDefault();
    const pt = { x: e.clientX, y: e.clientY };
    activePtr.current.set(e.pointerId, pt);
    if (activePtr.current.size >= 2) {
      const pts = [...activePtr.current.values()];
      const d = ptDist(pts[0], pts[1]);
      if (pinchStart.current) {
        scaleRef.current = clamp(pinchStart.current.scale * d / pinchStart.current.dist, 0.25, 4);
      }
    } else if (activePtr.current.size === 1 && dragStart.current) {
      const dx = pt.x - dragStart.current.x;
      const dy = pt.y - dragStart.current.y;
      if (!isDragRef.current && Math.hypot(dx, dy) > 10) isDragRef.current = true;
      if (isDragRef.current) {
        panXRef.current = dragStart.current.px + dx;
        panYRef.current = dragStart.current.py + dy;
      } else {
        // update hover
        const c = canvasRef.current;
        if (c) {
          const rect = c.getBoundingClientRect();
          const cx = pt.x - rect.left, cy = pt.y - rect.top;
          const { gx, gy } = screenToIso(cx, cy, scaleRef.current, panXRef.current, panYRef.current);
          hovRef.current = (gx >= 0 && gx < GC && gy >= 0 && gy < GR) ? { gx, gy } : null;
        }
      }
    }
  }, []);

  const onPointerUp = useCallback((e) => {
    e.preventDefault();
    const pt = activePtr.current.get(e.pointerId);
    if (!isDragRef.current && activePtr.current.size === 1 && pt) {
      handleTap(pt.x, pt.y);
    }
    activePtr.current.delete(e.pointerId);
    if (activePtr.current.size < 2) pinchStart.current = null;
    if (activePtr.current.size === 0) {
      dragStart.current = null;
      isDragRef.current = false;
      hovRef.current = null;
    }
  }, [handleTap]);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    scaleRef.current = clamp(scaleRef.current * factor, 0.25, 4);
  }, []);

  /* ─── start game ─────────────────────────────────── */
  const startGame = useCallback(async () => {
    await ensureAudioStarted();
    playMachiBgm();
    trackGameStart('MachiDukuri');
    addCoins(1);

    // load saved coins
    const saved = parseInt(localStorage.getItem('machi_c') || '0');
    const base = Math.max(getCoins(), saved);
    coinsRef.current = base;
    setCoins(base);

    setScreen('game');

    // wait for next frame so canvas is mounted
    setTimeout(() => {
      initCanvas();
      // load placed items
      try {
        const ps = JSON.parse(localStorage.getItem('machi_p') || '[]');
        ps.forEach(({ id, gx, gy }) => {
          const def = ALL_ITEMS.find(i => i.id === id);
          if (def) placeItem(def, gx, gy, false);
        });
      } catch {}
      // start render loop
      if (animRef.current) cancelAnimationFrame(animRef.current);
      drawFrame();
      // auto-income: small every 10s
      incTimerRef.current = setInterval(() => {
        if (incomeRef.current > 0) {
          const e = Math.ceil(incomeRef.current / 6);
          coinsRef.current += e;
          addCoins(e);
          localStorage.setItem('machi_c', String(coinsRef.current));
          setCoins(coinsRef.current);
        }
      }, 10000);
      // big income every 60s
      bigTimerRef.current = setInterval(() => {
        if (incomeRef.current > 0) {
          coinsRef.current += incomeRef.current;
          addCoins(incomeRef.current);
          localStorage.setItem('machi_c', String(coinsRef.current));
          setCoins(coinsRef.current);
        }
      }, 60000);
      // check login bonus
      const lb = getMachiLoginBonus();
      if (lb) setLoginBonus(lb);
    }, 50);
  }, [initCanvas, drawFrame, placeItem]);

  /* ─── select item handler ────────────────────────── */
  function handleSelectItem(item) {
    if (coinsRef.current < item.ul && item.ul > 0) {
      showToast(lang === 'en'
        ? `🔒 Need ${item.ul} coins to unlock`
        : `🔒 🪙${item.ul}まいためると かいほう！`);
      return;
    }
    selDefRef.current = item;
    selItemRef.current = null;
    setSelDef(item);
    showToast(lang === 'en'
      ? `${item.e} ${item.en} – tap on map!`
      : `${item.e} ${item.ja} をえらんだ！マップにタップ！`);
  }

  /* ─── title screen ───────────────────────────────── */
  if (screen === 'title') return (
    <div className="machi-wrap machi-title-screen">
      <div className="machi-title-icon">🏙️</div>
      <h1 className="machi-title-text">
        {lang === 'en' ? '✨ City Builder!' : '✨ わくわくまちづくり'}
      </h1>
      <p className="machi-title-desc">
        {lang === 'en'
          ? 'Place buildings and\nbuild your dream city!\nCollect coins to expand!'
          : 'アイテムをおいて\nじぶんだけの まちをつくろう！\n🪙コインをためて まちをひろげてね'}
      </p>
      <button className="machi-start-btn" onClick={startGame}>
        {lang === 'en' ? '▶ Start!' : '▶ はじめる！'}
      </button>
      <button className="ww-back-btn" onClick={() => navigate('/')}>
        {lang === 'en' ? '🏝️ Back to Top' : '🏝️ トップへもどる'}
      </button>
    </div>
  );

  /* ─── game screen ────────────────────────────────── */
  const currentItems = ITEMS[cat] || [];

  return (
    <div className="machi-wrap">
      {/* HUD */}
      <div className="machi-hud">
        <button className="machi-hud-btn" onClick={() => { saveCity(); stopBgm(); navigate('/'); }}>🏠</button>
        <div className="machi-hud-title">🏙️ {lang === 'en' ? 'City' : 'まち'}</div>
        <div className="machi-hud-stat">
          🪙 <span>{coins}</span>
        </div>
        <div className="machi-hud-stat">
          🏠 <span>{totalItems}</span>
        </div>
        <div className="machi-hud-stat machi-hud-income">
          ⏱️ <span>+{income}</span>
        </div>
        <button className="machi-hud-btn" onClick={fitView} title="全体表示">🔍</button>
        <button className="machi-hud-btn" onClick={saveCity}>💾</button>
        <button className="machi-hud-btn" onClick={() => {
          const m = toggleMute();
          setMuted(m);
          if (!m) playMachiBgm();
        }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Field + Panel row (横向き時は左右並び) */}
      <div className="machi-body-row">

      {/* Canvas area */}
      <div className="machi-field">
        <canvas ref={bgCanvasRef} className="machi-bg-canvas" />
        <canvas
          ref={canvasRef}
          className="machi-canvas"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          style={{ touchAction: 'none' }}
        />
        {toast && <div className="machi-toast">{toast}</div>}
      </div>

      {/* Item panel */}
      <div className="machi-panel">
        {/* Category tabs */}
        <div className="machi-tabs">
          {CATS.map(c => (
            <button
              key={c.id}
              className={`machi-tab${cat === c.id ? ' on' : ''}`}
              onClick={() => { setCat(c.id); setSelDef(null); selDefRef.current = null; }}
            >
              {lang === 'en' ? c.en : c.ja}
            </button>
          ))}
        </div>
        {/* Item list */}
        <div className="machi-ilist">
          {currentItems.map(item => {
            const locked = coinsRef.current < item.ul && item.ul > 0;
            const selected = selDef?.id === item.id;
            return (
              <button
                key={item.id}
                className={`machi-item${selected ? ' on' : ''}${locked ? ' locked' : ''}`}
                onClick={() => handleSelectItem(item)}
              >
                {locked && <span className="machi-lock">🔒</span>}
                <span className="machi-item-e">{item.e}</span>
                <span className="machi-item-n">{lang === 'en' ? item.en : item.ja}</span>
                <span className="machi-item-c">🪙{item.cost}</span>
                {item.inc > 0 && <span className="machi-item-inc">+{item.inc}/m</span>}
              </button>
            );
          })}
        </div>
      </div>

      </div>{/* end machi-body-row */}

      {/* Login bonus modal */}
      {loginBonus && (
        <div className="machi-modal-overlay">
          <div className="machi-login-card">
            <div className="machi-login-icon">🎁</div>
            <h2 className="machi-login-title">
              {lang === 'en' ? 'Login Bonus!' : 'ログインボーナス！'}
            </h2>
            <p className="machi-login-msg">
              {lang === 'en'
                ? `Day ${loginBonus.streak} streak!`
                : `${loginBonus.streak}にちれんぞく！`}
            </p>
            <div className="machi-login-coins">+{loginBonus.bonus}🪙</div>
            {loginBonus.streak >= 3 && (
              <p className="machi-login-streak">🔥 {loginBonus.streak}{lang === 'en' ? ' day streak!' : 'にち れんぞく！'}</p>
            )}
            <button
              className="machi-login-btn"
              onClick={() => {
                claimMachiLoginBonus(loginBonus.bonus, loginBonus.streak);
                coinsRef.current += loginBonus.bonus;
                setCoins(getCoins());
                setLoginBonus(null);
                showToast(`🎁 +${loginBonus.bonus}🪙 ${lang === 'en' ? 'received!' : 'ゲット！'}`);
              }}
            >
              {lang === 'en' ? 'Claim! 🎉' : 'うけとる！🎉'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
