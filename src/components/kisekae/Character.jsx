import { useId } from 'react';
import { findKisekaeItem, KISEKAE_ITEMS } from './data';
import { CrownArt, HairBack, HairFront, PrincessOutfit, PrinceOutfit, ItemArt, AccessoryArt } from './parts';

/* ════════════════════════════════════════════════════
   レイヤー順(背面→前面):
   glow(CSSで演出) → back pet(親側で描画) → back hair →
   outfit(cape/lower/upper含む) → arms → neck accessory →
   face → front hair → crown → held item → sparkle
   顔・目・眉・頬・口は既存の描画をそのまま維持する(壊さない)。
════════════════════════════════════════════════════ */

export function PrincessSVG({ state }) {
  const uid = useId();
  const dress = findKisekaeItem('princess','dress',state.dress) ?? KISEKAE_ITEMS.princess.dress[0];
  const crown = findKisekaeItem('princess','crown',state.crown);
  const hair  = findKisekaeItem('princess','hair',state.hair) ?? KISEKAE_ITEMS.princess.hair[0];
  const outfit= findKisekaeItem('princess','outfit',state.outfit) ?? KISEKAE_ITEMS.princess.outfit[0];
  const acc   = findKisekaeItem('princess','accessory',state.accessory);
  const item  = findKisekaeItem('princess','item',state.item);
  const gSkirt = `${uid}-psSkirt`, gDrape = `${uid}-psDrape`, gHair = `${uid}-psHair`, gGold = `${uid}-psGold`, gIris = `${uid}-psIris`;

  return (
    <svg className="ksk-svg" viewBox="0 0 72 114" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gSkirt} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.c2}/>
          <stop offset="55%" stopColor={dress.c1}/>
          <stop offset="100%" stopColor={dress.c1}/>
        </linearGradient>
        <linearGradient id={gDrape} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05"/>
        </linearGradient>
        <linearGradient id={gHair} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.hair}/>
          <stop offset="100%" stopColor={dress.hair} stopOpacity="0.82"/>
        </linearGradient>
        <linearGradient id={gGold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE58A"/>
          <stop offset="100%" stopColor="#E6A700"/>
        </linearGradient>
        <radialGradient id={gIris} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#7A5238"/>
          <stop offset="100%" stopColor="#3B2416"/>
        </radialGradient>
      </defs>

      {/* ── うしろ髪 ── */}
      <HairBack kind={hair.kind} gHair={gHair} headX={36} headY={33}/>

      {/* ── ふく(スカート/ケープ/袖などをまとめて内包) ── */}
      <PrincessOutfit kind={outfit.kind} gSkirt={gSkirt} gDrape={gDrape} gGold={gGold} c1={dress.c1} c2={dress.c2}/>

      {/* ── 首・ネックレス ── */}
      <rect x="33" y="46" width="6" height="8" rx="3" fill="#FFCCBC"/>
      <AccessoryArt kind={acc?.kind} gGold={gGold} x={36} y={54}/>

      {/* ── 顔(維持) ── */}
      <circle cx="36" cy="37" r="17" fill="#FFE0B2"/>

      {/* 前髪ハイライト・前髪シルエット */}
      <HairFront kind={hair.kind} gHair={gHair} headX={36} headTopY={17}/>

      {/* ── 目(グラデ虹彩+二重ハイライト) ── */}
      <ellipse cx="29.5" cy="36" rx="4.2" ry="4.6" fill={`url(#${gIris})`}/>
      <ellipse cx="42.5" cy="36" rx="4.2" ry="4.6" fill={`url(#${gIris})`}/>
      <circle cx="31"   cy="34.2" r="1.7" fill="#fff"/>
      <circle cx="44"   cy="34.2" r="1.7" fill="#fff"/>
      <circle cx="28.3" cy="37.5" r="0.8" fill="#fff" opacity="0.8"/>
      <circle cx="41.3" cy="37.5" r="0.8" fill="#fff" opacity="0.8"/>
      {/* まつ毛(長め) */}
      <path d="M25.8,32.5 L23.8,30.2" stroke="#4A2E20" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M28.2,31.2 L27,28.8"   stroke="#4A2E20" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M31.2,30.8 L30.8,28.4" stroke="#4A2E20" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M40.8,30.8 L41.2,28.4" stroke="#4A2E20" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M43.8,31.2 L45,28.8"   stroke="#4A2E20" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M46.2,32.5 L48.2,30.2" stroke="#4A2E20" strokeWidth="1.2" strokeLinecap="round"/>
      {/* 口 */}
      <path d="M31.5,44 Q36,48.8 40.5,44" stroke="#E91E63" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 頬 */}
      <ellipse cx="22.5" cy="41" rx="5" ry="3.2" fill="#FFB3C1" opacity="0.6"/>
      <ellipse cx="49.5" cy="41" rx="5" ry="3.2" fill="#FFB3C1" opacity="0.6"/>
      {/* イヤリング */}
      <circle cx="19.5" cy="42.5" r="1.4" fill={`url(#${gGold})`}/>
      <circle cx="52.5" cy="42.5" r="1.4" fill={`url(#${gGold})`}/>

      {/* ── ティアラ/かんむり(全種ベクター) ── */}
      <CrownArt kind={crown?.kind} gGold={gGold} headX={36} headTopY={21}/>

      {/* こもの(手元) */}
      <ItemArt kind={item?.kind} gGold={gGold} x={63} y={71}/>

      {/* きらめき */}
      <path d="M12,60 l1.2,2.6 2.6,1.2 -2.6,1.2 -1.2,2.6 -1.2,-2.6 -2.6,-1.2 2.6,-1.2 Z" fill="#fff" opacity="0.85"/>
      <path d="M60,66 l0.9,2 2,0.9 -2,0.9 -0.9,2 -0.9,-2 -2,-0.9 2,-0.9 Z" fill="#FFE58A" opacity="0.9"/>
    </svg>
  );
}

export function PrinceSVG({ state }) {
  const uid = useId();
  const dress = findKisekaeItem('prince','dress',state.dress) ?? KISEKAE_ITEMS.prince.dress[0];
  const crown = findKisekaeItem('prince','crown',state.crown);
  const hair  = findKisekaeItem('prince','hair',state.hair) ?? KISEKAE_ITEMS.prince.hair[0];
  const outfit= findKisekaeItem('prince','outfit',state.outfit) ?? KISEKAE_ITEMS.prince.outfit[0];
  const acc   = findKisekaeItem('prince','accessory',state.accessory);
  const item  = findKisekaeItem('prince','item',state.item);
  const gCape = `${uid}-prCape`, gCoat = `${uid}-prCoat`, gHair = `${uid}-prHair`, gGold = `${uid}-prGold`, gIris = `${uid}-prIris`;
  const eyebrowColor = dress.hair === '#212121' ? '#555' : dress.hair;

  return (
    <svg className="ksk-svg" viewBox="0 0 72 114" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gCape} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.c2}/>
          <stop offset="100%" stopColor={dress.c2} stopOpacity="0.78"/>
        </linearGradient>
        <linearGradient id={gCoat} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.c1}/>
          <stop offset="100%" stopColor={dress.c1} stopOpacity="0.85"/>
        </linearGradient>
        <linearGradient id={gHair} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={dress.hair}/>
          <stop offset="100%" stopColor={dress.hair} stopOpacity="0.85"/>
        </linearGradient>
        <linearGradient id={gGold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE58A"/>
          <stop offset="100%" stopColor="#E6A700"/>
        </linearGradient>
        <radialGradient id={gIris} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#553B22"/>
          <stop offset="100%" stopColor="#241708"/>
        </radialGradient>
      </defs>

      {/* ── うしろ髪 ── */}
      <HairBack kind={hair.kind} gHair={gHair} headX={36} headY={30}/>

      {/* ── ふく(マント/上着/ズボンをまとめて内包) ── */}
      <PrinceOutfit kind={outfit.kind} gCape={gCape} gCoat={gCoat} gGold={gGold} c1={dress.c1} c2={dress.c2}/>

      {/* ── 首 ── */}
      <rect x="33" y="43" width="6" height="10" rx="3" fill="#FFCCBC"/>
      <AccessoryArt kind={acc?.kind} gGold={gGold} x={36} y={49}/>

      {/* ── 顔(維持) ── */}
      <circle cx="36" cy="33" r="17" fill="#FFE0B2"/>

      {/* 前髪 */}
      <HairFront kind={hair.kind} gHair={gHair} headX={36} headTopY={14}/>

      {/* ── 目 ── */}
      <ellipse cx="29.5" cy="32" rx="4" ry="4.4" fill={`url(#${gIris})`}/>
      <ellipse cx="42.5" cy="32" rx="4" ry="4.4" fill={`url(#${gIris})`}/>
      <circle cx="31"   cy="30.3" r="1.6" fill="#fff"/>
      <circle cx="44"   cy="30.3" r="1.6" fill="#fff"/>
      <circle cx="28.4" cy="33.4" r="0.7" fill="#fff" opacity="0.8"/>
      <circle cx="41.4" cy="33.4" r="0.7" fill="#fff" opacity="0.8"/>
      {/* 眉(凛々しく) */}
      <path d="M25.5,27 Q29.5,24.8 33.5,26.8" stroke={eyebrowColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M38.5,26.8 Q42.5,24.8 46.5,27" stroke={eyebrowColor} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* 口(にこやか) */}
      <path d="M31,40 Q36,44.5 41,40" stroke="#BF8A7A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* 頬 */}
      <ellipse cx="22.5" cy="36" rx="4.6" ry="3" fill="#FFB3C1" opacity="0.35"/>
      <ellipse cx="49.5" cy="36" rx="4.6" ry="3" fill="#FFB3C1" opacity="0.35"/>

      {/* ── 王冠(全種ベクター) ── */}
      <CrownArt kind={crown?.kind} gGold={gGold} headX={36} headTopY={17} accent="#2196F3"/>

      {/* こもの */}
      <ItemArt kind={item?.kind} gGold={gGold} x={9} y={67}/>

      {/* きらめき */}
      <path d="M60,56 l1,2.2 2.2,1 -2.2,1 -1,2.2 -1,-2.2 -2.2,-1 2.2,-1 Z" fill="#FFE58A" opacity="0.9"/>
    </svg>
  );
}
