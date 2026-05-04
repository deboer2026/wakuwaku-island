import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  playMachiBgm, stopBgm, ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { trackGameStart } from '../utils/analytics';
import { addCoins, getCoins } from '../utils/coins';
import './MachiDukuri.css';

/* ── Isometric constants ─────────────────────────────────── */
const ISO_TW    = 64;   // tile width at scale=1
const ISO_TH    = 32;   // tile height at scale=1
const COLS      = 20;
const ROWS      = 20;
const SCALE_MIN = 0.25;
const SCALE_MAX = 4.0;

/* ── Item data ───────────────────────────────────────────── */
const CATS = [
  { id: 'house',   ja: '🏠いえ'     },
  { id: 'shop',    ja: '🏪おみせ'   },
  { id: 'nature',  ja: '🌳しぜん'   },
  { id: 'road',    ja: '🛣みち'     },
  { id: 'fun',     ja: '🎡あそび'   },
  { id: 'special', ja: '⭐とくべつ' },
];

const ITEMS = {
  house: [
    { id:'h1', e:'🏠', ja:'おうち',    cost:10,  inc:1                },
    { id:'h2', e:'🏡', ja:'にわつき',  cost:20,  inc:2                },
    { id:'h3', e:'🛖', ja:'こや',      cost:5,   inc:0                },
    { id:'h5', e:'🏰', ja:'おしろ',    cost:80,  inc:8,  ul:50        },
    { id:'h6', e:'🏯', ja:'やかた',    cost:60,  inc:6,  ul:40        },
    { id:'h7', e:'⛪', ja:'きょうかい',cost:40,  inc:3,  ul:30        },
    { id:'h8', e:'🏛️',ja:'しんでん',  cost:50,  inc:5,  ul:35        },
  ],
  shop: [
    { id:'s1', e:'🏪', ja:'おみせ',     cost:15, inc:2               },
    { id:'s2', e:'🍰', ja:'ケーキや',   cost:20, inc:3               },
    { id:'s3', e:'🍎', ja:'くだものや', cost:18, inc:2               },
    { id:'s4', e:'📚', ja:'としょかん', cost:30, inc:2, ul:20        },
    { id:'s5', e:'🏬', ja:'デパート',   cost:50, inc:6, ul:30        },
    { id:'s6', e:'🏥', ja:'びょういん', cost:40, inc:4, ul:25        },
    { id:'s7', e:'🏫', ja:'がっこう',   cost:45, inc:4, ul:30        },
    { id:'s8', e:'🎪', ja:'サーカス',   cost:60, inc:8, ul:40        },
  ],
  nature: [
    { id:'n1', e:'🌳', ja:'き',       cost:5,  inc:0                  },
    { id:'n2', e:'🌲', ja:'もみのき', cost:5,  inc:0                  },
    { id:'n3', e:'🌸', ja:'さくら',   cost:8,  inc:0                  },
    { id:'n4', e:'🌺', ja:'はな',     cost:3,  inc:0                  },
    { id:'n5', e:'⛲', ja:'ふんすい', cost:20, inc:1, ul:15           },
    { id:'n6', e:'🌊', ja:'うみ',     cost:15, inc:0, ul:10           },
    { id:'n7', e:'⛰️',ja:'やま',     cost:10, inc:0                  },
    { id:'n8', e:'🌈', ja:'にじ',     cost:8,  inc:0                  },
  ],
  road: [
    { id:'r1', e:'🛣️', ja:'みち',      cost:3,  inc:0               },
    { id:'r2', e:'🚦',  ja:'しんごう',  cost:5,  inc:0               },
    { id:'r3', e:'🌉',  ja:'はし',      cost:15, inc:0, ul:10        },
    { id:'r4', e:'🚉',  ja:'えき',      cost:30, inc:4, ul:20        },
    { id:'r5', e:'✈️',  ja:'くうこう',  cost:60, inc:8, ul:40        },
    { id:'r6', e:'⛽',  ja:'ガススタ',  cost:10, inc:1, ul:5         },
    { id:'r7', e:'🅿️', ja:'ちゅうしゃ',cost:8,  inc:1, ul:5         },
    { id:'r8', e:'🚀',  ja:'ロケット',  cost:80, inc:0, ul:60        },
  ],
  fun: [
    { id:'f1', e:'🎡', ja:'かんらんしゃ', cost:40, inc:5, ul:25      },
    { id:'f2', e:'🎠', ja:'メリーゴー',   cost:35, inc:4, ul:20      },
    { id:'f3', e:'🏟️',ja:'スタジアム',   cost:70, inc:9, ul:50      },
    { id:'f4', e:'🎆', ja:'はなび',       cost:15, inc:0, ul:10      },
    { id:'f5', e:'⛺', ja:'キャンプ',     cost:8,  inc:0             },
    { id:'f6', e:'🏖️',ja:'ビーチ',       cost:25, inc:3, ul:15      },
    { id:'f7', e:'🎭', ja:'げきじょう',   cost:45, inc:6, ul:30      },
    { id:'f8', e:'🎰', ja:'ゲームC',      cost:30, inc:4, ul:20      },
  ],
  special: [
    { id:'sp1', e:'🗼',  ja:'タワー',        cost:80,  inc:10, ul:60  },
    { id:'sp2', e:'🏆',  ja:'トロフィー',    cost:50,  inc:0,  ul:40  },
    { id:'sp3', e:'💎',  ja:'ダイヤ',        cost:120, inc:15, ul:80  },
    { id:'sp4', e:'🌟',  ja:'スター',        cost:30,  inc:2,  ul:20  },
    { id:'sp5', e:'🦄',  ja:'ユニコーン',    cost:60,  inc:8,  ul:40  },
    { id:'sp6', e:'🐉',  ja:'ドラゴン',      cost:150, inc:20, ul:100 },
    { id:'sp7', e:'🗽',  ja:'じゆうのめがみ',cost:90,  inc:12, ul:60  },
    { id:'sp8', e:'🎪',  ja:'まほうサーカス',cost:100, inc:15, ul:70  },
  ],
};

const ALL_ITEMS = Object.values(ITEMS).flat();
const ITEMS_MAP = Object.fromEntries(ALL_ITEMS.map(i => [i.id, i]));

/* ── Isometric math ──────────────────────────────────────── */
function isoPos(gx, gy, view) {
  return {
    x: view.ox + (gx - gy) * (ISO_TW / 2) * view.scale,
    y: view.oy + (gx + gy) * (ISO_TH / 2) * view.scale,
  };
}
function fromIso(sx, sy, view) {
  const dx = (sx - view.ox) / view.scale;
  const dy = (sy - view.oy) / view.scale;
  return {
    gx: Math.round((dx / (ISO_TW / 2) + dy / (ISO_TH / 2)) / 2),
    gy: Math.round((dy / (ISO_TH / 2) - dx / (ISO_TW / 2)) / 2),
  };
}

/* ── Seeded random (for stable star field) ───────────────── */
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Draw background (night sky) ─────────────────────────── */
function drawBackground(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0,   '#080620');
  g.addColorStop(0.5, '#150f3a');
  g.addColorStop(1,   '#0a0820');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const rng = mulberry32(42);
  for (let i = 0; i < 130; i++) {
    const x = rng() * W;
    const y = rng() * H * 0.65;
    const r = rng() * 1.6 + 0.3;
    ctx.fillStyle = `rgba(255,255,255,${rng() * 0.85 + 0.15})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  // Moon body
  ctx.fillStyle = 'rgba(255,240,160,.9)';
  ctx.beginPath(); ctx.arc(W * 0.82, H * 0.1, 22, 0, Math.PI * 2); ctx.fill();
  // Crescent shadow
  ctx.fillStyle = '#100830';
  ctx.beginPath(); ctx.arc(W * 0.82 - 8, H * 0.1 - 5, 18, 0, Math.PI * 2); ctx.fill();
}

/* ── Draw frame (isometric grid + placed items) ──────────── */
function filledRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
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
  ctx.fill();
}

function drawFrame(ctx, view, placedArr, selPlId, selItDef, hovCell) {
  const { ox, oy, scale } = view;
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  const TW = ISO_TW * scale;
  const TH = ISO_TH * scale;
  const sideH = Math.max(2, 5 * scale);

  // ─── Grid tiles (painter's order: back→front) ───
  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) {
      const { x, y } = isoPos(gx, gy, view);
      // Cull off-screen
      if (x + TW < 0 || x - TW > W || y + TH * 2 < 0 || y > H + 60) continue;

      const even = (gx + gy) % 2 === 0;

      // Tile face
      ctx.beginPath();
      ctx.moveTo(x,        y);
      ctx.lineTo(x + TW/2, y + TH/2);
      ctx.lineTo(x,        y + TH);
      ctx.lineTo(x - TW/2, y + TH/2);
      ctx.closePath();
      ctx.fillStyle = even ? 'rgba(60,140,60,.82)' : 'rgba(50,125,50,.82)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(80,160,80,.35)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Right side face
      ctx.beginPath();
      ctx.moveTo(x,        y + TH);
      ctx.lineTo(x + TW/2, y + TH/2);
      ctx.lineTo(x + TW/2, y + TH/2 + sideH);
      ctx.lineTo(x,        y + TH   + sideH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(40,110,40,.65)';
      ctx.fill();

      // Left side face
      ctx.beginPath();
      ctx.moveTo(x,        y + TH);
      ctx.lineTo(x - TW/2, y + TH/2);
      ctx.lineTo(x - TW/2, y + TH/2 + sideH);
      ctx.lineTo(x,        y + TH   + sideH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(30,90,30,.65)';
      ctx.fill();

      // Hover highlight
      if (hovCell && hovCell.gx === gx && hovCell.gy === gy && selItDef) {
        ctx.beginPath();
        ctx.moveTo(x,        y);
        ctx.lineTo(x + TW/2, y + TH/2);
        ctx.lineTo(x,        y + TH);
        ctx.lineTo(x - TW/2, y + TH/2);
        ctx.closePath();
        ctx.fillStyle   = 'rgba(126,200,255,.28)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(126,200,255,.75)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }
    }
  }

  // ─── Items (depth-sorted: low gx+gy first) ───
  const sorted = [...placedArr].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
  sorted.forEach(p => {
    const def = ITEMS_MAP[p.itemId];
    if (!def) return;
    const { x, y } = isoPos(p.gx, p.gy, view);
    const sz = TW * 0.88;
    const isSel = p.id === selPlId;

    ctx.save();
    ctx.translate(x, y + TH * 0.5);

    // Shadow ellipse
    ctx.fillStyle = 'rgba(0,0,0,.32)';
    ctx.beginPath();
    ctx.ellipse(0, sz * 0.05, sz * 0.32, sz * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isSel) { ctx.shadowColor = 'rgba(255,140,40,.9)'; ctx.shadowBlur = 20; }

    // Emoji
    const fs = Math.max(12, Math.round(sz * 0.68));
    ctx.font          = `${fs}px serif`;
    ctx.textAlign     = 'center';
    ctx.textBaseline  = 'bottom';
    ctx.fillText(def.e, 0, -sz * 0.05);
    ctx.shadowBlur    = 0;

    // Income badge
    if (def.inc > 0) {
      const bh = Math.max(10, 13 * scale);
      const bw = Math.max(26, bh * 2.6);
      const by = -sz * 0.78;
      ctx.fillStyle = 'rgba(0,0,0,.62)';
      filledRect(ctx, -bw / 2, by, bw, bh, 4);
      ctx.fillStyle    = '#FFD700';
      ctx.font         = `bold ${Math.max(6, Math.round(8 * scale))}px sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${def.inc}🪙`, 0, by + bh / 2);
    }

    ctx.restore();
  });
}

/* ── Persistence ─────────────────────────────────────────── */
function loadPlaced() {
  try {
    const raw = JSON.parse(localStorage.getItem('machi_p2') || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter(p => p && p.itemId && ITEMS_MAP[p.itemId]);
  } catch { return []; }
}
function persist(placed, coins) {
  try {
    localStorage.setItem('machi_p2', JSON.stringify(placed));
    localStorage.setItem('machi_c',  String(coins));
  } catch {}
}

/* ══════════════════════════════════════════════════════════
   Component
══════════════════════════════════════════════════════════ */
export default function MachiDukuri() {
  const navigate = useNavigate();

  /* ─── Game state refs ────────────────────────────── */
  const placedRef  = useRef([]);
  const coinsRef   = useRef(50);
  const incomeRef  = useRef(0);
  const selItRef   = useRef(null);
  const selPlRef   = useRef(null);

  /* ─── View refs ──────────────────────────────────── */
  const viewRef = useRef({ ox: 0, oy: 0, scale: 1 });
  const hovRef  = useRef(null);

  /* ─── Canvas/DOM refs ────────────────────────────── */
  const fieldRef    = useRef(null);
  const canvasBgRef = useRef(null);
  const canvasFgRef = useRef(null);
  const rafRef      = useRef(null);

  /* ─── Pointer tracking refs ──────────────────────── */
  const ptrsRef        = useRef(new Map());
  const dragStartRef   = useRef(null);
  const isDragRef      = useRef(false);
  const pinchRef       = useRef(null);
  const wasPinchingRef = useRef(false);

  /* ─── Timer refs ─────────────────────────────────── */
  const toastTmRef = useRef(null);
  const incTimRef  = useRef(null);
  const bigTimRef  = useRef(null);

  /* ─── React state ────────────────────────────────── */
  const [screen,  setScreen]  = useState('title');
  const [muted,   setMuted]   = useState(getMuteState);
  const [coins,   setCoins]   = useState(50);
  const [income,  setIncome]  = useState(0);
  const [placed,  setPlaced]  = useState([]);
  const [selItId, setSelItId] = useState(null);
  const [selPlId, setSelPlId] = useState(null);
  const [cat,     setCat]     = useState('house');
  const [toast,   setToast]   = useState('');

  /* ─── Load saved data ────────────────────────────── */
  useEffect(() => {
    const p    = loadPlaced();
    const saved = parseInt(localStorage.getItem('machi_c') || '0');
    const c    = Math.max(getCoins(), saved, 50);
    const inc  = p.reduce((s, pp) => s + (ITEMS_MAP[pp.itemId]?.inc || 0), 0);
    placedRef.current = p;
    coinsRef.current  = c;
    incomeRef.current = inc;
    setPlaced(p); setCoins(c); setIncome(inc);
  }, []);

  /* ─── Page title ─────────────────────────────────── */
  useEffect(() => {
    document.title = 'わくわくまちづくり | わくわくアイランド';
    return () => { document.title = 'わくわくアイランド'; };
  }, []);

  /* ─── Global cleanup ─────────────────────────────── */
  useEffect(() => () => {
    stopBgm();
    clearInterval(incTimRef.current);
    clearInterval(bigTimRef.current);
    clearTimeout(toastTmRef.current);
    cancelAnimationFrame(rafRef.current);
  }, []);

  /* ─── Toast helper ───────────────────────────────── */
  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTmRef.current);
    toastTmRef.current = setTimeout(() => setToast(''), 2200);
  }, []);

  /* ─── Start game ─────────────────────────────────── */
  const startGame = useCallback(async () => {
    try { await ensureAudioStarted(); playMachiBgm(); } catch {}
    trackGameStart('MachiDukuri');
    addCoins(1);
    const saved = parseInt(localStorage.getItem('machi_c') || '0');
    const base  = Math.max(getCoins(), saved, coinsRef.current);
    coinsRef.current = base;
    setCoins(base);
    setScreen('game');
  }, []);

  /* ─── Income timers ──────────────────────────────── */
  useEffect(() => {
    if (screen !== 'game') return;
    incTimRef.current = setInterval(() => {
      if (!incomeRef.current) return;
      const gain = Math.ceil(incomeRef.current / 6);
      const nc = coinsRef.current + gain;
      addCoins(gain); coinsRef.current = nc; setCoins(nc);
    }, 10000);
    bigTimRef.current = setInterval(() => {
      if (!incomeRef.current) return;
      const nc = coinsRef.current + incomeRef.current;
      addCoins(incomeRef.current); coinsRef.current = nc; setCoins(nc);
    }, 60000);
    return () => { clearInterval(incTimRef.current); clearInterval(bigTimRef.current); };
  }, [screen]);

  /* ─── Canvas game loop + input ───────────────────── */
  useEffect(() => {
    if (screen !== 'game') return;
    const field    = fieldRef.current;
    const bgCanvas = canvasBgRef.current;
    const fgCanvas = canvasFgRef.current;
    if (!field || !bgCanvas || !fgCanvas) return;

    /* resize */
    function resize() {
      const W = field.clientWidth;
      const H = field.clientHeight;
      bgCanvas.width = W; bgCanvas.height = H;
      fgCanvas.width = W; fgCanvas.height = H;
      viewRef.current = { ox: W / 2, oy: H * 0.15, scale: 1 };
      drawBackground(bgCanvas);
    }
    resize();
    window.addEventListener('resize', resize);

    /* RAF loop */
    function loop() {
      const ctx = fgCanvas.getContext('2d');
      drawFrame(ctx, viewRef.current, placedRef.current, selPlRef.current, selItRef.current, hovRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    /* helpers */
    function getXY(e) {
      const rect = fgCanvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function handleTap(gx, gy) {
      const hit = placedRef.current.find(p => p.gx === gx && p.gy === gy);
      if (hit) {
        if (selPlRef.current === hit.id) {
          const def    = ITEMS_MAP[hit.itemId];
          const refund = Math.floor((def?.cost || 0) / 2);
          const nc     = coinsRef.current + refund;
          coinsRef.current  = nc;
          incomeRef.current = Math.max(0, incomeRef.current - (def?.inc || 0));
          setCoins(nc); setIncome(incomeRef.current);
          const np = placedRef.current.filter(p => p.id !== hit.id);
          placedRef.current = np; setPlaced(np);
          persist(np, nc);
          selPlRef.current = null; setSelPlId(null);
          showToast(`🗑️ とりのぞいたよ (+${refund}🪙)`);
        } else {
          selPlRef.current = hit.id; setSelPlId(hit.id);
          showToast('もういちどタップで とりのぞく（半額もどる）');
        }
        return;
      }
      selPlRef.current = null; setSelPlId(null);
      const item = selItRef.current;
      if (!item) return;
      if (coinsRef.current < item.cost) { showToast('🪙 コインがたりない！'); return; }
      const nc = coinsRef.current - item.cost;
      coinsRef.current  = nc;
      incomeRef.current += (item.inc || 0);
      setCoins(nc); setIncome(incomeRef.current);
      const newItem = { id: `${gx}_${gy}`, itemId: item.id, gx, gy };
      const np = [...placedRef.current.filter(p => !(p.gx === gx && p.gy === gy)), newItem];
      placedRef.current = np; setPlaced(np);
      persist(np, nc);
      showToast('✨ おいたよ！');
    }

    /* ── pointer down ── */
    function onPtrDown(e) {
      e.preventDefault();
      const { x, y } = getXY(e);
      ptrsRef.current.set(e.pointerId, { x, y });

      if (ptrsRef.current.size === 1) {
        dragStartRef.current = { x, y, ox: viewRef.current.ox, oy: viewRef.current.oy };
        isDragRef.current    = false;
      } else if (ptrsRef.current.size === 2) {
        wasPinchingRef.current = true;
        const pts  = [...ptrsRef.current.values()];
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const mx   = (pts[0].x + pts[1].x) / 2;
        const my   = (pts[0].y + pts[1].y) / 2;
        const v    = viewRef.current;
        pinchRef.current = { dist, midX: mx, midY: my, ox: v.ox, oy: v.oy, scale: v.scale };
        dragStartRef.current = null;
      }
    }

    /* ── pointer move ── */
    function onPtrMove(e) {
      e.preventDefault();
      const { x, y } = getXY(e);
      ptrsRef.current.set(e.pointerId, { x, y });

      /* pinch zoom */
      if (ptrsRef.current.size >= 2 && pinchRef.current) {
        const pts     = [...ptrsRef.current.values()];
        const newDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const mx      = (pts[0].x + pts[1].x) / 2;
        const my      = (pts[0].y + pts[1].y) / 2;
        const { dist: iDist, midX: imx, midY: imy, ox: iox, oy: ioy, scale: isc } = pinchRef.current;
        const newScale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, isc * newDist / iDist));
        const wx = (imx - iox) / isc;
        const wy = (imy - ioy) / isc;
        viewRef.current = { ox: mx - wx * newScale, oy: my - wy * newScale, scale: newScale };
        isDragRef.current = true;
        hovRef.current    = null;
        return;
      }

      /* single-finger pan */
      if (ptrsRef.current.size === 1 && dragStartRef.current) {
        const dx = x - dragStartRef.current.x;
        const dy = y - dragStartRef.current.y;
        if (!isDragRef.current && Math.hypot(dx, dy) > 10) isDragRef.current = true;
        if (isDragRef.current) {
          viewRef.current = { ...viewRef.current, ox: dragStartRef.current.ox + dx, oy: dragStartRef.current.oy + dy };
          hovRef.current  = null;
        } else {
          const { gx, gy } = fromIso(x, y, viewRef.current);
          hovRef.current   = (gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS) ? { gx, gy } : null;
        }
      }
    }

    /* ── pointer up ── */
    function onPtrUp(e) {
      e.preventDefault();
      const { x, y } = getXY(e);
      const wasDrag     = isDragRef.current;
      const wasPinching = wasPinchingRef.current;

      ptrsRef.current.delete(e.pointerId);
      if (ptrsRef.current.size < 2) pinchRef.current = null;
      if (ptrsRef.current.size === 0) {
        dragStartRef.current  = null;
        isDragRef.current     = false;
        wasPinchingRef.current = false;
        hovRef.current        = null;
      }

      if (wasDrag || wasPinching) return;
      if (ptrsRef.current.size > 0) return;

      const { gx, gy } = fromIso(x, y, viewRef.current);
      if (gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS) handleTap(gx, gy);
    }

    /* ── wheel zoom ── */
    function onWheel(e) {
      e.preventDefault();
      const { x, y } = getXY(e);
      const factor   = e.deltaY < 0 ? 1.12 : 0.89;
      const v        = viewRef.current;
      const newScale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, v.scale * factor));
      const wx       = (x - v.ox) / v.scale;
      const wy       = (y - v.oy) / v.scale;
      viewRef.current = { ox: x - wx * newScale, oy: y - wy * newScale, scale: newScale };
    }

    fgCanvas.addEventListener('pointerdown',  onPtrDown);
    fgCanvas.addEventListener('pointermove',  onPtrMove);
    fgCanvas.addEventListener('pointerup',    onPtrUp);
    fgCanvas.addEventListener('pointercancel',onPtrUp);
    fgCanvas.addEventListener('wheel',        onWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
      fgCanvas.removeEventListener('pointerdown',  onPtrDown);
      fgCanvas.removeEventListener('pointermove',  onPtrMove);
      fgCanvas.removeEventListener('pointerup',    onPtrUp);
      fgCanvas.removeEventListener('pointercancel',onPtrUp);
      fgCanvas.removeEventListener('wheel',        onWheel);
    };
  }, [screen, showToast]);

  /* ─── Panel item select ──────────────────────────── */
  const handleSelectItem = useCallback((item) => {
    if ((item.ul || 0) > 0 && coinsRef.current < item.ul) {
      showToast(`🔒 🪙${item.ul}まいためると かいほう！`); return;
    }
    selItRef.current = item; setSelItId(item.id);
    selPlRef.current = null; setSelPlId(null);
    showToast(`${item.e} ${item.ja} をえらんだ！マップにタップ！`);
  }, [showToast]);

  /* ─── Save ───────────────────────────────────────── */
  const handleSave = useCallback(() => {
    persist(placedRef.current, coinsRef.current);
    showToast('💾 セーブしたよ！');
  }, [showToast]);

  /* ─── Reset view ─────────────────────────────────── */
  const resetView = useCallback(() => {
    const f = fieldRef.current;
    if (!f) return;
    viewRef.current = { ox: f.clientWidth / 2, oy: f.clientHeight * 0.15, scale: 1 };
  }, []);

  /* ════════════ TITLE SCREEN ════════════ */
  if (screen === 'title') return (
    <div className="machi-wrap machi-title-screen">
      <div className="machi-title-icon">🏙️</div>
      <h1 className="machi-title-text">✨ わくわくまちづくり</h1>
      <p className="machi-title-desc">
        {'アイテムをおいて\nじぶんだけの まちをつくろう！\n🪙コインをためて まちをひろげてね'}
      </p>
      <button className="machi-start-btn" onClick={startGame}>▶ はじめる！</button>
      <button className="ww-back-btn" onClick={() => navigate('/')}>🏝️ トップへもどる</button>
    </div>
  );

  /* ════════════ GAME SCREEN ════════════ */
  const curItems = ITEMS[cat] || [];

  return (
    <div className="machi-wrap">

      {/* HUD */}
      <div className="machi-hud">
        <button className="machi-hud-btn" onClick={() => { handleSave(); stopBgm(); navigate('/'); }}>🏠</button>
        <span className="machi-hud-title">🏙️ まち</span>
        <span className="machi-hud-stat">🪙<b>{coins}</b></span>
        <span className="machi-hud-stat">🏠<b>{placed.length}</b></span>
        <span className="machi-hud-stat machi-hud-inc">⏱️<b>+{income}</b></span>
        <button className="machi-hud-btn" title="表示リセット" onClick={resetView}>🔍</button>
        <button className="machi-hud-btn" onClick={handleSave}>💾</button>
        <button className="machi-hud-btn" onClick={() => { const m = toggleMute(); setMuted(m); if (!m) playMachiBgm(); }}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Body row */}
      <div className="machi-body-row">

        {/* Isometric canvas field */}
        <div className="machi-field" ref={fieldRef}>
          <canvas ref={canvasBgRef} className="machi-canvas-bg" />
          <canvas ref={canvasFgRef} className="machi-canvas-fg" />
          {toast && <div className="machi-toast">{toast}</div>}
        </div>

        {/* Item panel */}
        <div className="machi-panel">
          <div className="machi-tabs">
            {CATS.map(c => (
              <button key={c.id} className={`machi-tab${cat === c.id ? ' on' : ''}`} onClick={() => setCat(c.id)}>
                {c.ja}
              </button>
            ))}
          </div>
          <div className="machi-ilist">
            {curItems.map(item => {
              const locked = (item.ul || 0) > 0 && coins < item.ul;
              return (
                <button key={item.id}
                  className={`machi-item${selItId === item.id ? ' on' : ''}${locked ? ' locked' : ''}`}
                  onClick={() => handleSelectItem(item)}
                >
                  {locked && <span className="machi-lock">🔒</span>}
                  <span className="machi-item-e">{item.e}</span>
                  <span className="machi-item-n">{item.ja}</span>
                  <span className="machi-item-c">🪙{item.cost}</span>
                  {item.inc > 0 && <span className="machi-item-inc">+{item.inc}/m</span>}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
