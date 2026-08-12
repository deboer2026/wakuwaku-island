import { useState, useEffect, useRef, useId } from 'react';
import { CATS, KISEKAE_ITEMS, DEFAULT_KISEKAE, normalizeKisekaeState, findKisekaeItem, getShopExtras } from './data';
import { PrincessSVG, PrinceSVG } from './Character';
import { CrownArt, HairBack, HairFront, PrincessOutfit, PrinceOutfit, ItemArt, PetSVG } from './parts';
import './Kisekae.css';

export { KISEKAE_ITEMS, DEFAULT_KISEKAE, normalizeKisekaeState };

/* ════════════════════════════════════════════════════
   キラキラエフェクト(既存踏襲)
════════════════════════════════════════════════════ */
export function spawnSparkles(x, y) {
  const emojis = ['✨', '⭐', '💫', '🌟', '💖'];
  emojis.forEach((em, i) => {
    const el = document.createElement('div');
    el.className = 'ksk-sparkle';
    el.textContent = em;
    const a = (i / emojis.length) * Math.PI * 2;
    const d = 38 + i * 14;
    el.style.cssText = [
      `left:${x}px`, `top:${y}px`,
      `--dx:${(Math.cos(a) * d).toFixed(1)}px`,
      `--dy:${(Math.sin(a) * d - 20).toFixed(1)}px`,
      `animation-delay:${(i * 0.07).toFixed(2)}s`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 900);
  });
}

/* 装備変更ミニ演出: 星粒6〜10個を軽く撒く(reduced-motion時は最小限) */
function spawnEquipBurst(el) {
  if (!el) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height * 0.4;
  const n = reduce ? 3 : (6 + Math.floor(Math.random() * 5));
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'ksk-equip-star';
    const a = (i / n) * Math.PI * 2;
    const d = 20 + Math.random() * 18;
    s.style.cssText = [
      `left:${cx}px`, `top:${cy}px`,
      `--dx:${(Math.cos(a) * d).toFixed(1)}px`,
      `--dy:${(Math.sin(a) * d).toFixed(1)}px`,
    ].join(';');
    document.body.appendChild(s);
    setTimeout(() => { if (s.parentNode) s.remove(); }, reduce ? 260 : 620);
  }
}

/* ════════════════════════════════════════════════════
   カテゴリごとの小さなプレビュー(絵文字を使わないベクターswatch)
════════════════════════════════════════════════════ */
function ItemSwatch({ chara, cat, item }) {
  const uid = useId();
  if (cat === 'dress') {
    return <span className="ksk-swatch-dot" style={{ background: `linear-gradient(135deg, ${item.c1}, ${item.c2})` }} />;
  }
  if (cat === 'crown') {
    const g = `${uid}-swGold`;
    return (
      <svg viewBox="0 0 72 26" className="ksk-swatch-svg">
        <defs><linearGradient id={g} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFE58A"/><stop offset="100%" stopColor="#E6A700"/></linearGradient></defs>
        <CrownArt kind={item.kind} gGold={g} headX={36} headTopY={18} accent={chara==='prince'?'#2196F3':'#FF4E8B'}/>
      </svg>
    );
  }
  if (cat === 'hair') {
    const g = `${uid}-swHair`;
    return (
      <svg viewBox="0 0 72 60" className="ksk-swatch-svg">
        <defs><linearGradient id={g} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8D6E63"/><stop offset="100%" stopColor="#8D6E63" stopOpacity="0.82"/></linearGradient></defs>
        <HairBack kind={item.kind} gHair={g} headX={36} headY={30}/>
        <circle cx="36" cy="33" r="15" fill="#FFE0B2"/>
        <HairFront kind={item.kind} gHair={g} headX={36} headTopY={16}/>
      </svg>
    );
  }
  if (cat === 'outfit') {
    const gSkirt = `${uid}-swSkirt`, gDrape = `${uid}-swDrape`, gCape = `${uid}-swCape`, gCoat = `${uid}-swCoat`, gGold2 = `${uid}-swGold2`;
    return (
      <svg viewBox="0 0 72 60" className="ksk-swatch-svg">
        <defs>
          <linearGradient id={gSkirt} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f06292"/><stop offset="100%" stopColor="#ff80ab"/></linearGradient>
          <linearGradient id={gDrape} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="0.5"/><stop offset="100%" stopColor="#fff" stopOpacity="0.05"/></linearGradient>
          <linearGradient id={gCape} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1565C0"/><stop offset="100%" stopColor="#1565C0" stopOpacity="0.78"/></linearGradient>
          <linearGradient id={gCoat} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1976D2"/><stop offset="100%" stopColor="#1976D2" stopOpacity="0.85"/></linearGradient>
          <linearGradient id={gGold2} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFE58A"/><stop offset="100%" stopColor="#E6A700"/></linearGradient>
        </defs>
        <g transform="scale(1,0.62)">
          {chara === 'princess'
            ? <PrincessOutfit kind={item.kind} gSkirt={gSkirt} gDrape={gDrape} gGold={gGold2} c1="#f06292" c2="#ab47bc"/>
            : <PrinceOutfit kind={item.kind} gCape={gCape} gCoat={gCoat} gGold={gGold2} c1="#1976D2" c2="#1565C0"/>}
        </g>
      </svg>
    );
  }
  if (cat === 'item' || cat === 'accessory') {
    const g = `${uid}-swGold3`;
    return (
      <svg viewBox="-12 -12 24 24" className="ksk-swatch-svg ksk-swatch-svg--item">
        <defs><linearGradient id={g} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFE58A"/><stop offset="100%" stopColor="#E6A700"/></linearGradient></defs>
        <ItemArt kind={item.kind} gGold={g} x={0} y={0}/>
      </svg>
    );
  }
  if (cat === 'pet') {
    return <span className="ksk-swatch-pet"><PetSVG kind={item.kind}/></span>;
  }
  return null;
}

/* ════════════════════════════════════════════════════
   キャラクターウィジェット（タイトル左右に常駐）
════════════════════════════════════════════════════ */
export function KisekaeCharacters({ kisekaeState, onOpen, lang }) {
  const psPet = findKisekaeItem('princess', 'pet', kisekaeState.princess.pet);
  const prPet = findKisekaeItem('prince',   'pet', kisekaeState.prince.pet);

  return (
    <>
      {/* プリンセス（左） */}
      <button
        className="ksk-chara-wrap ksk-chara-wrap--left"
        onClick={(e) => { onOpen('princess'); spawnSparkles(e.clientX, e.clientY); }}
        aria-label="プリンセスを きせかえる"
      >
        <div className="ksk-chara-inner">
          <PrincessSVG state={kisekaeState.princess}/>
          {psPet?.kind && psPet.kind !== 'none' && <div className="ksk-pet ksk-pet--left"><PetSVG kind={psPet.kind}/></div>}
        </div>
        <div className="ksk-chara-badge">
          {lang === 'en' ? 'Dress up' : 'きがえ'}
        </div>
      </button>

      {/* プリンス（右） */}
      <button
        className="ksk-chara-wrap ksk-chara-wrap--right"
        onClick={(e) => { onOpen('prince'); spawnSparkles(e.clientX, e.clientY); }}
        aria-label="プリンスを きせかえる"
      >
        <div className="ksk-chara-inner">
          <PrinceSVG state={kisekaeState.prince}/>
          {prPet?.kind && prPet.kind !== 'none' && <div className="ksk-pet ksk-pet--right"><PetSVG kind={prPet.kind}/></div>}
        </div>
        <div className="ksk-chara-badge">
          {lang === 'en' ? 'Dress up' : 'きがえ'}
        </div>
      </button>
    </>
  );
}

/* ════════════════════════════════════════════════════
   着せ替えパネル（スライドアップモーダル）
════════════════════════════════════════════════════ */
export function KisekaePanel({ isOpen, initialChara, onClose, kisekaeState, onStateChange, lang }) {
  const [activeChara, setActiveChara] = useState(initialChara || 'princess');
  const [activeCat,   setActiveCat]   = useState('crown');
  const [reactMsg, setReactMsg] = useState(null);
  /* 連打耐性: 変更ごとにtokenを進め、古いsetTimeoutの反応を無効化する */
  const seqRef = useRef(0);
  const previewRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveChara(initialChara || 'princess');
      setActiveCat('crown');
      setReactMsg(null);
      seqRef.current++;
    }
  }, [isOpen, initialChara]);

  if (!isOpen) return null;

  const cat = activeCat === 'dress' ? 'dress' : activeCat;
  const baseItems  = KISEKAE_ITEMS[activeChara][cat] || [];
  const shopExtras = cat === 'item' || cat === 'accessory' ? getShopExtras(activeChara, cat) : [];
  const items      = [...baseItems, ...shopExtras];
  const currentVal = kisekaeState[activeChara][cat] || '';

  function handleSelect(item, e) {
    const mySeq = ++seqRef.current;
    const next = {
      ...kisekaeState,
      [activeChara]: { ...kisekaeState[activeChara], [cat]: item.id },
    };
    onStateChange(next);
    spawnSparkles(e.clientX, e.clientY);
    spawnEquipBurst(previewRef.current);

    const btn = e.currentTarget;
    btn.classList.add('ksk-item-pop');
    setTimeout(() => { if (btn) btn.classList.remove('ksk-item-pop'); }, 260);

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pv = previewRef.current;
    if (pv && !reduce) {
      pv.classList.remove('ksk-jump'); void pv.offsetWidth; pv.classList.add('ksk-jump');
      setTimeout(() => { if (pv) pv.classList.remove('ksk-jump'); }, 520);
    }

    const msgs = lang === 'en' ? ['Wow!', 'Cute!', 'Great!'] : ['わぁ！', 'かわいい！', 'にあう！'];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    /* seqをkeyに使い、連打時も毎回アニメーションを最初から再生させる */
    setReactMsg({ seq: mySeq, text: msg });
    setTimeout(() => { if (seqRef.current === mySeq) setReactMsg(null); }, reduce ? 700 : 1200);
  }

  const CharaSVG = activeChara === 'princess' ? PrincessSVG : PrinceSVG;

  return (
    <div
      className="ksk-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchEnd={(e)  => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ksk-panel">

        {/* ヘッダー */}
        <div className="ksk-panel-hd">
          <span className="ksk-panel-title">✨ きがえしよう！</span>
          <button className="ksk-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* キャラタブ */}
        <div className="ksk-chara-tabs">
          {['princess', 'prince'].map(chara => (
            <button
              key={chara}
              className={`ksk-chara-tab${activeChara === chara ? ' active' : ''}`}
              onClick={() => { setActiveChara(chara); setActiveCat('crown'); }}
            >
              <span className="ksk-tab-icon">{chara === 'princess' ? '👸' : '🤴'}</span>
              {lang === 'en'
                ? (chara === 'princess' ? 'Princess' : 'Prince')
                : (chara === 'princess' ? 'プリンセス' : 'プリンス')}
            </button>
          ))}
        </div>

        {/* プレビュー(選択中キャラを大きく表示、装備変更の反応もここで見せる) */}
        <div className="ksk-preview" ref={previewRef}>
          <CharaSVG state={kisekaeState[activeChara]}/>
          {reactMsg && <div key={reactMsg.seq} className="ksk-react-bubble">{reactMsg.text}</div>}
        </div>

        {/* カテゴリ */}
        <div className="ksk-cat-row">
          {CATS.map(c => (
            <button
              key={c.id}
              className={`ksk-cat-btn${activeCat === c.id ? ' active' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* アイテムグリッド */}
        <div className="ksk-items-grid">
          {items.map(item => (
            <button
              key={item.id}
              className={`ksk-item-btn${currentVal === item.id ? ' active' : ''}`}
              onClick={(e) => handleSelect(item, e)}
            >
              <span className="ksk-ib-swatch"><ItemSwatch chara={activeChara} cat={cat} item={item}/></span>
              <span className="ksk-ib-name">{item.name}</span>
              {currentVal === item.id && <span className="ksk-ib-check">✓</span>}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
