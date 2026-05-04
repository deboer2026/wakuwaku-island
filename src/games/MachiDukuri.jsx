import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  playMachiBgm, stopBgm, ensureAudioStarted, toggleMute, getMuteState,
} from '../utils/audio';
import { trackGameStart } from '../utils/analytics';
import { addCoins, getCoins } from '../utils/coins';
import './MachiDukuri.css';

/* ── Grid config ─────────────────────────────────────────── */
const COLS = 15;
const ROWS = 15;
const CELL = 60; // px per cell

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

/* ── Persistence ─────────────────────────────────────────── */
function loadPlaced() {
  try {
    const raw = JSON.parse(localStorage.getItem('machi_p2') || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter(p => p && p.itemId && ALL_ITEMS.find(i => i.id === p.itemId));
  } catch {
    return [];
  }
}

function persist(placed, coins) {
  try {
    localStorage.setItem('machi_p2', JSON.stringify(placed));
    localStorage.setItem('machi_c',  String(coins));
  } catch {}
}

/* ── Component ───────────────────────────────────────────── */
export default function MachiDukuri() {
  const navigate = useNavigate();

  /* ─── Mutable refs (no rerender on change) ─────────── */
  const placedRef  = useRef([]);   // placed item array (mirror of state)
  const coinsRef   = useRef(50);   // current coins (mirror of state)
  const incomeRef  = useRef(0);    // total income/min
  const selItRef   = useRef(null); // selected item definition
  const selPlRef   = useRef(null); // selected placed item id (for remove)

  // DOM refs
  const fieldRef   = useRef(null);
  const outerRef   = useRef(null); // pan container
  const hoverRef   = useRef(null);
  const panRef     = useRef({ x: 0, y: 0 });
  const dragRef    = useRef(null);
  const isDragRef  = useRef(false);
  const toastTmRef = useRef(null);
  const incTimRef  = useRef(null);
  const bigTimRef  = useRef(null);

  /* ─── React state (triggers rerender) ──────────────── */
  const [screen,  setScreen]  = useState('title');
  const [muted,   setMuted]   = useState(getMuteState);
  const [coins,   setCoins]   = useState(50);
  const [income,  setIncome]  = useState(0);
  const [placed,  setPlaced]  = useState([]);
  const [selItId, setSelItId] = useState(null);
  const [selPlId, setSelPlId] = useState(null);
  const [cat,     setCat]     = useState('house');
  const [toast,   setToast]   = useState('');

  /* ─── Load saved data on mount ─────────────────────── */
  useEffect(() => {
    const p   = loadPlaced();
    const saved = parseInt(localStorage.getItem('machi_c') || '0');
    const c   = Math.max(getCoins(), saved, 50);
    const inc = p.reduce((s, pp) => {
      const d = ALL_ITEMS.find(i => i.id === pp.itemId);
      return s + (d?.inc || 0);
    }, 0);
    placedRef.current = p;
    coinsRef.current  = c;
    incomeRef.current = inc;
    setPlaced(p);
    setCoins(c);
    setIncome(inc);
  }, []);

  /* ─── Page title ────────────────────────────────────── */
  useEffect(() => {
    document.title = 'わくわくまちづくり | わくわくアイランド';
    return () => { document.title = 'わくわくアイランド'; };
  }, []);

  /* ─── Cleanup on unmount ────────────────────────────── */
  useEffect(() => () => {
    stopBgm();
    clearInterval(incTimRef.current);
    clearInterval(bigTimRef.current);
    clearTimeout(toastTmRef.current);
  }, []);

  /* ─── Center grid when game starts ─────────────────── */
  useEffect(() => {
    if (screen !== 'game') return;
    requestAnimationFrame(() => {
      const field = fieldRef.current;
      const outer = outerRef.current;
      if (!field || !outer) return;
      const x = Math.round((field.clientWidth  - COLS * CELL) / 2);
      const y = Math.round((field.clientHeight - ROWS * CELL) / 2);
      panRef.current = { x, y };
      outer.style.transform = `translate(${x}px,${y}px)`;
    });
  }, [screen]);

  /* ─── Income timers ─────────────────────────────────── */
  useEffect(() => {
    if (screen !== 'game') return;
    incTimRef.current = setInterval(() => {
      if (incomeRef.current <= 0) return;
      const gain = Math.ceil(incomeRef.current / 6);
      const nc = coinsRef.current + gain;
      addCoins(gain);
      coinsRef.current = nc;
      setCoins(nc);
    }, 10000);
    bigTimRef.current = setInterval(() => {
      if (incomeRef.current <= 0) return;
      const nc = coinsRef.current + incomeRef.current;
      addCoins(incomeRef.current);
      coinsRef.current = nc;
      setCoins(nc);
    }, 60000);
    return () => {
      clearInterval(incTimRef.current);
      clearInterval(bigTimRef.current);
    };
  }, [screen]);

  /* ─── Helpers ────────────────────────────────────────── */
  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTmRef.current);
    toastTmRef.current = setTimeout(() => setToast(''), 2200);
  }, []);

  const doSave = useCallback(() => {
    persist(placedRef.current, coinsRef.current);
  }, []);

  /* ─── Start game ─────────────────────────────────────── */
  const startGame = useCallback(async () => {
    try {
      await ensureAudioStarted();
      playMachiBgm();
    } catch {}
    trackGameStart('MachiDukuri');
    addCoins(1);
    const saved = parseInt(localStorage.getItem('machi_c') || '0');
    const base  = Math.max(getCoins(), saved, coinsRef.current);
    coinsRef.current = base;
    setCoins(base);
    setScreen('game');
  }, []);

  /* ─── Pan ────────────────────────────────────────────── */
  const applyPan = useCallback((x, y) => {
    const outer = outerRef.current;
    if (!outer) return;
    const fw = fieldRef.current?.clientWidth  || window.innerWidth;
    const fh = fieldRef.current?.clientHeight || window.innerHeight;
    const mg = 60;
    const cx = Math.min(fw - mg, Math.max(mg - COLS * CELL, x));
    const cy = Math.min(fh - mg, Math.max(mg - ROWS * CELL, y));
    panRef.current = { x: cx, y: cy };
    outer.style.transform = `translate(${cx}px,${cy}px)`;
  }, []);

  /* ─── Pointer events ─────────────────────────────────── */
  const onPtrDown = useCallback((e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    dragRef.current = {
      sx: e.clientX, sy: e.clientY,
      px: panRef.current.x, py: panRef.current.y,
    };
    isDragRef.current = false;
  }, []);

  const onPtrMove = useCallback((e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;
    if (!isDragRef.current && Math.hypot(dx, dy) > 8) isDragRef.current = true;
    if (isDragRef.current) {
      applyPan(dragRef.current.px + dx, dragRef.current.py + dy);
      if (hoverRef.current) hoverRef.current.style.opacity = '0';
    } else if (selItRef.current && hoverRef.current && outerRef.current) {
      const rect = outerRef.current.getBoundingClientRect();
      const gx = Math.floor((e.clientX - rect.left) / CELL);
      const gy = Math.floor((e.clientY - rect.top)  / CELL);
      if (gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS) {
        hoverRef.current.style.opacity = '1';
        hoverRef.current.style.left    = gx * CELL + 'px';
        hoverRef.current.style.top     = gy * CELL + 'px';
      } else {
        hoverRef.current.style.opacity = '0';
      }
    }
  }, [applyPan]);

  const onPtrUp = useCallback((e) => {
    if (!dragRef.current) return;
    const wasDrag = isDragRef.current;
    dragRef.current  = null;
    isDragRef.current = false;
    if (hoverRef.current) hoverRef.current.style.opacity = '0';
    if (wasDrag) return;

    // Tap — compute cell
    const outer = outerRef.current;
    if (!outer) return;
    const rect = outer.getBoundingClientRect();
    const gx = Math.floor((e.clientX - rect.left) / CELL);
    const gy = Math.floor((e.clientY - rect.top)  / CELL);
    if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return;

    const hit = placedRef.current.find(p => p.gx === gx && p.gy === gy);
    if (hit) {
      if (selPlRef.current === hit.id) {
        // Second tap → remove
        const def    = ALL_ITEMS.find(i => i.id === hit.itemId);
        const refund = Math.floor((def?.cost || 0) / 2);
        const nc     = coinsRef.current + refund;
        coinsRef.current  = nc;
        incomeRef.current = Math.max(0, incomeRef.current - (def?.inc || 0));
        setCoins(nc);
        setIncome(incomeRef.current);
        const np = placedRef.current.filter(p => p.id !== hit.id);
        placedRef.current = np;
        setPlaced(np);
        persist(np, nc);
        selPlRef.current = null;
        setSelPlId(null);
        showToast(`🗑️ とりのぞいたよ (+${refund}🪙)`);
      } else {
        // First tap → highlight for removal
        selPlRef.current = hit.id;
        setSelPlId(hit.id);
        showToast('もういちどタップで とりのぞく（半額もどる）');
      }
      return;
    }

    // Empty cell — clear placed selection
    selPlRef.current = null;
    setSelPlId(null);

    // Place selected item
    const item = selItRef.current;
    if (!item) return;
    if (coinsRef.current < item.cost) { showToast('🪙 コインがたりない！'); return; }

    const nc = coinsRef.current - item.cost;
    coinsRef.current  = nc;
    incomeRef.current = incomeRef.current + (item.inc || 0);
    setCoins(nc);
    setIncome(incomeRef.current);

    const newItem = { id: `${gx}_${gy}`, itemId: item.id, gx, gy };
    const np = [
      ...placedRef.current.filter(p => !(p.gx === gx && p.gy === gy)),
      newItem,
    ];
    placedRef.current = np;
    setPlaced(np);
    persist(np, nc);
    showToast('✨ おいたよ！');
  }, [showToast]);

  /* ─── Select item from panel ─────────────────────────── */
  const handleSelectItem = useCallback((item) => {
    if ((item.ul || 0) > 0 && coinsRef.current < item.ul) {
      showToast(`🔒 🪙${item.ul}まいためると かいほう！`);
      return;
    }
    selItRef.current = item;
    setSelItId(item.id);
    selPlRef.current = null;
    setSelPlId(null);
    showToast(`${item.e} ${item.ja} をえらんだ！マップにタップ！`);
  }, [showToast]);

  /* ─── Save button ────────────────────────────────────── */
  const handleSave = useCallback(() => {
    persist(placedRef.current, coinsRef.current);
    showToast('💾 セーブしたよ！');
  }, [showToast]);

  /* ════════════════════════════════════════════════════════
     TITLE SCREEN
  ════════════════════════════════════════════════════════ */
  if (screen === 'title') return (
    <div className="machi-wrap machi-title-screen">
      <div className="machi-title-icon">🏙️</div>
      <h1 className="machi-title-text">✨ わくわくまちづくり</h1>
      <p className="machi-title-desc">
        {'アイテムをおいて\nじぶんだけの まちをつくろう！\n🪙コインをためて まちをひろげてね'}
      </p>
      <button className="machi-start-btn" onClick={startGame}>
        ▶ はじめる！
      </button>
      <button className="ww-back-btn" onClick={() => navigate('/')}>
        🏝️ トップへもどる
      </button>
    </div>
  );

  /* ════════════════════════════════════════════════════════
     GAME SCREEN
  ════════════════════════════════════════════════════════ */
  const curItems = ITEMS[cat] || [];

  return (
    <div className="machi-wrap">

      {/* ── HUD ── */}
      <div className="machi-hud">
        <button
          className="machi-hud-btn"
          onClick={() => { handleSave(); stopBgm(); navigate('/'); }}
        >🏠</button>
        <span className="machi-hud-title">🏙️ まち</span>
        <span className="machi-hud-stat">🪙<b>{coins}</b></span>
        <span className="machi-hud-stat">🏠<b>{placed.length}</b></span>
        <span className="machi-hud-stat machi-hud-inc">⏱️<b>+{income}</b></span>
        <button className="machi-hud-btn" onClick={handleSave}>💾</button>
        <button className="machi-hud-btn" onClick={() => {
          const m = toggleMute();
          setMuted(m);
          if (!m) playMachiBgm();
        }}>{muted ? '🔇' : '🔊'}</button>
      </div>

      {/* ── Field + Panel ── */}
      <div className="machi-body-row">

        {/* Pannable field */}
        <div
          className="machi-field"
          ref={fieldRef}
          onPointerDown={onPtrDown}
          onPointerMove={onPtrMove}
          onPointerUp={onPtrUp}
          onPointerCancel={onPtrUp}
          style={{ touchAction: 'none' }}
        >
          {/* Pan container (transform applied via ref) */}
          <div className="machi-grid-outer" ref={outerRef}>
            {/* Grid */}
            <div
              className="machi-grid"
              style={{ width: COLS * CELL, height: ROWS * CELL }}
            >
              {/* Hover highlight */}
              <div className="machi-hover" ref={hoverRef} style={{ opacity: 0 }} />

              {/* Placed items */}
              {placed.map(p => {
                const def = ALL_ITEMS.find(i => i.id === p.itemId);
                if (!def) return null;
                return (
                  <div
                    key={p.id}
                    className={`machi-placed${p.id === selPlId ? ' sel' : ''}`}
                    style={{ left: p.gx * CELL, top: p.gy * CELL }}
                  >
                    <span className="machi-placed-e">{def.e}</span>
                    {def.inc > 0 && (
                      <span className="machi-placed-inc">+{def.inc}🪙</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toast */}
          {toast && <div className="machi-toast">{toast}</div>}
        </div>

        {/* Item panel */}
        <div className="machi-panel">
          <div className="machi-tabs">
            {CATS.map(c => (
              <button
                key={c.id}
                className={`machi-tab${cat === c.id ? ' on' : ''}`}
                onClick={() => setCat(c.id)}
              >
                {c.ja}
              </button>
            ))}
          </div>
          <div className="machi-ilist">
            {curItems.map(item => {
              const locked = (item.ul || 0) > 0 && coins < item.ul;
              return (
                <button
                  key={item.id}
                  className={`machi-item${selItId === item.id ? ' on' : ''}${locked ? ' locked' : ''}`}
                  onClick={() => handleSelectItem(item)}
                >
                  {locked && <span className="machi-lock">🔒</span>}
                  <span className="machi-item-e">{item.e}</span>
                  <span className="machi-item-n">{item.ja}</span>
                  <span className="machi-item-c">🪙{item.cost}</span>
                  {item.inc > 0 && (
                    <span className="machi-item-inc">+{item.inc}/m</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>{/* end machi-body-row */}
    </div>
  );
}
