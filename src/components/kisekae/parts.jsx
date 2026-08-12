/* ════════════════════════════════════════════════════
   きせかえ v2 Phase2 — 共通ベクターパーツ
   左上45°光源 / 金は#FFE58A→#E6A700 / 太い黒アウトライン禁止
   全てのkindをここで一元的に描画する(princess/prince共有)。
════════════════════════════════════════════════════ */

/* ── 小さな星型スパークル(共通) ── */
export function SparkleMark({ cx, cy, r, fill, opacity }) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} opacity={opacity ?? 0.9} />;
}

function StarShape({ cx, cy, r, fill, stroke, strokeWidth }) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.44;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />;
}

/* ════════════════════════════════════════════════════
   王冠・頭飾り(crown) — headX/headYはキャラの頭頂目安位置
════════════════════════════════════════════════════ */
export function CrownArt({ kind, gGold, headX = 36, headTopY = 21, accent = '#FF4E8B' }) {
  const cx = headX, y = headTopY;
  if (kind === 'none' || !kind) return null;

  if (kind === 'crown') {
    return (
      <>
        <path d={`M${cx-12},${y+1} Q${cx},${y-4} ${cx+12},${y+1} L${cx+11},${y+4} Q${cx},${y} ${cx-11},${y+4} Z`} fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.6"/>
        <path d={`M${cx-6},${y} L${cx-4.5},${y-6} L${cx-2},${y-1} Z`} fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
        <path d={`M${cx-1.5},${y-1.5} L${cx},${y-8} L${cx+1.5},${y-1.5} Z`} fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
        <path d={`M${cx+2},${y-1} L${cx+4.5},${y-6} L${cx+6},${y} Z`} fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
        <circle cx={cx} cy={y-7.5} r="2.2" fill={accent}/>
        <circle cx={cx-0.6} cy={y-8.1} r="0.7" fill="#fff" opacity="0.9"/>
        <circle cx={cx-4.5} cy={y-3.5} r="1.2" fill="#69D2FF"/>
        <circle cx={cx+4.5} cy={y-3.5} r="1.2" fill="#69D2FF"/>
        <circle cx={cx-9} cy={y+2.5} r="0.9" fill="#fff"/>
        <circle cx={cx+9} cy={y+2.5} r="0.9" fill="#fff"/>
      </>
    );
  }
  if (kind === 'flower') {
    return (
      <g transform={`translate(${cx} ${y-2})`}>
        {[0,1,2,3,4].map(i => {
          const a = (i/5) * Math.PI * 2 - Math.PI/2;
          return <ellipse key={i} cx={Math.cos(a)*4.6} cy={Math.sin(a)*4.6} rx="3.1" ry="2.1"
            transform={`rotate(${(a*180/Math.PI)+90} ${Math.cos(a)*4.6} ${Math.sin(a)*4.6})`}
            fill="#FFB3C7" stroke="#E88AA6" strokeWidth="0.4"/>;
        })}
        <circle r="2.6" fill={`url(#${gGold})`}/>
        <ellipse cx="-9" cy="3" rx="2.6" ry="1.8" fill="#FFB3C7" stroke="#E88AA6" strokeWidth="0.3"/>
        <ellipse cx="9" cy="3" rx="2.6" ry="1.8" fill="#FFB3C7" stroke="#E88AA6" strokeWidth="0.3"/>
        <circle cx="-9" cy="3" r="1" fill={`url(#${gGold})`}/>
        <circle cx="9" cy="3" r="1" fill={`url(#${gGold})`}/>
      </g>
    );
  }
  if (kind === 'star') {
    return (
      <g>
        <StarShape cx={cx} cy={y-2} r={6.4} fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
        <StarShape cx={cx-9} cy={y+3.5} r={2.6} fill="#69D2FF" stroke="#3a97c9" strokeWidth="0.3"/>
        <StarShape cx={cx+9} cy={y+3.5} r={2.6} fill="#FF9BC4" stroke="#c95a86" strokeWidth="0.3"/>
        <circle cx={cx-1.4} cy={y-3.6} r="1" fill="#fff" opacity="0.85"/>
      </g>
    );
  }
  if (kind === 'rainbow') {
    const bands = ['#FF8A8A','#FFD37A','#8AF0A0','#8AC8FF','#C79BFF'];
    return (
      <g>
        {bands.map((c,i) => (
          <path key={c} d={`M${cx-11+i*0.4},${y+3-i*0.4} A${9-i*1.6},${9-i*1.6} 0 0 1 ${cx+11-i*0.4},${y+3-i*0.4}`}
            fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
        ))}
        <circle cx={cx-11} cy={y+3} r="1.1" fill="#fff"/>
        <circle cx={cx+11} cy={y+3} r="1.1" fill="#fff"/>
      </g>
    );
  }
  if (kind === 'ribbon') {
    return (
      <g transform={`translate(${cx} ${y-1})`}>
        <path d="M-1,-1 C-9,-7 -13,-1 -9,2 C-6,4 -2,1 -1,-1 Z" fill="#FFB3C7" stroke="#E06B96" strokeWidth="0.5"/>
        <path d="M1,-1 C9,-7 13,-1 9,2 C6,4 2,1 1,-1 Z" fill="#FF8AB0" stroke="#E06B96" strokeWidth="0.5"/>
        <circle r="1.8" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.4"/>
        <path d="M-1,1 L-4,7 L-1.5,6 Z" fill="#FF8AB0" stroke="#E06B96" strokeWidth="0.4"/>
        <path d="M1,1 L4,7 L1.5,6 Z" fill="#FFB3C7" stroke="#E06B96" strokeWidth="0.4"/>
      </g>
    );
  }
  if (kind === 'butterfly') {
    return (
      <g transform={`translate(${cx} ${y})`}>
        <ellipse cx="-4" cy="-2.5" rx="4.6" ry="5.4" fill="#9A7EFF" stroke="#6a55cc" strokeWidth="0.4"/>
        <ellipse cx="4" cy="-2.5" rx="4.6" ry="5.4" fill="#B79BFF" stroke="#6a55cc" strokeWidth="0.4"/>
        <ellipse cx="-3" cy="3" rx="3.2" ry="3.6" fill="#D9CCFF" stroke="#6a55cc" strokeWidth="0.4"/>
        <ellipse cx="3" cy="3" rx="3.2" ry="3.6" fill="#C7B8FF" stroke="#6a55cc" strokeWidth="0.4"/>
        <rect x="-0.6" y="-5" width="1.2" height="10" rx="0.6" fill="#4A3B32"/>
        <circle cx="-4" cy="-2.5" r="1.1" fill="#fff" opacity="0.7"/>
        <circle cx="4" cy="-2.5" r="1.1" fill="#fff" opacity="0.7"/>
      </g>
    );
  }
  if (kind === 'gem') {
    return (
      <g>
        <path d={`M${cx-6},${y+1} L${cx-3},${y-5} L${cx+3},${y-5} L${cx+6},${y+1} L${cx},${y+5} Z`} fill="#8FE0FF" stroke="#3a97c9" strokeWidth="0.5"/>
        <path d={`M${cx-3},${y-5} L${cx},${y+1} L${cx+3},${y-5} Z`} fill="#C8F3FF" opacity="0.8"/>
        <circle cx={cx-1.4} cy={y-2.6} r="0.9" fill="#fff" opacity="0.95"/>
        <path d={`M${cx-9},${y+2} L${cx-7},${y-1} L${cx-5},${y+2} L${cx-7},${y+4} Z`} fill={`url(#${gGold})`}/>
        <path d={`M${cx+9},${y+2} L${cx+7},${y-1} L${cx+5},${y+2} L${cx+7},${y+4} Z`} fill={`url(#${gGold})`}/>
      </g>
    );
  }
  if (kind === 'cap') {
    return (
      <g>
        <ellipse cx={cx} cy={y+3} rx="12" ry="2.4" fill="#3A3038"/>
        <path d={`M${cx-9},${y+3} Q${cx-9},${y-9} ${cx},${y-9} Q${cx+9},${y-9} ${cx+9},${y+3} Z`} fill="#4A3B44" stroke="#2A2028" strokeWidth="0.5"/>
        <rect x={cx-9.5} y={y+1.5} width="19" height="2.6" rx="1.2" fill={`url(#${gGold})`}/>
      </g>
    );
  }
  if (kind === 'helmet') {
    return (
      <g>
        <path d={`M${cx-10},${y+4} Q${cx-11},${y-8} ${cx},${y-9} Q${cx+11},${y-8} ${cx+10},${y+4} Z`} fill="#B8C4CE" stroke="#8A97A2" strokeWidth="0.5"/>
        <path d={`M${cx-10},${y+4} Q${cx-11},${y-8} ${cx},${y-9} L${cx},${y+4} Z`} fill="#D6DEE5" opacity="0.6"/>
        <rect x={cx-10.5} y={y+2.5} width="21" height="2.6" rx="1.2" fill={`url(#${gGold})`}/>
        <path d={`M${cx-1.6},${y-9} L${cx},${y-14} L${cx+1.6},${y-9} Z`} fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.4"/>
      </g>
    );
  }
  /* ── ★★★実績スペシャル: ほしのティアラ(Princess) ── */
  if (kind === 'starTiara') {
    return (
      <g>
        <path d={`M${cx-13},${y+2} Q${cx},${y-3} ${cx+13},${y+2} L${cx+12},${y+5} Q${cx},${y+1} ${cx-12},${y+5} Z`} fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.6"/>
        <StarShape cx={cx-8} cy={y-1} r={2.1} fill="#FFF6D8" stroke="#E6A700" strokeWidth="0.35"/>
        <StarShape cx={cx+8} cy={y-1} r={2.1} fill="#FFF6D8" stroke="#E6A700" strokeWidth="0.35"/>
        <StarShape cx={cx} cy={y-9.5} r={1.6} fill="#FFF6D8" stroke="#E6A700" strokeWidth="0.3"/>
        <path d={`M${cx-3.4},${y-1} L${cx},${y-7.6} L${cx+3.4},${y-1} L${cx},${y+2} Z`} fill="#B7E9FF" stroke="#5CB7E0" strokeWidth="0.5"/>
        <path d={`M${cx},${y-7.6} L${cx-1.6},${y-1} L${cx},${y-2.4} Z`} fill="#E6FBFF" opacity="0.85"/>
        <circle cx={cx-1} cy={y-4.6} r="0.8" fill="#fff" opacity="0.95"/>
        <circle cx={cx-11.5} cy={y+3} r="1" fill="#fff" opacity="0.85"/>
        <circle cx={cx+11.5} cy={y+3} r="1" fill="#fff" opacity="0.85"/>
      </g>
    );
  }
  /* ── ★★★実績スペシャル: ほしのクラウン(Prince) ── */
  if (kind === 'starCrown') {
    return (
      <g>
        <path d={`M${cx-12},${y+3} L${cx-12},${y-1} L${cx-6},${y+2} L${cx-2},${y-6} L${cx+2},${y-6} L${cx+6},${y+2} L${cx+12},${y-1} L${cx+12},${y+3} Z`}
          fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.6" strokeLinejoin="round"/>
        <rect x={cx-12.5} y={y+2.6} width="25" height="2.4" rx="1" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.4"/>
        <StarShape cx={cx} cy={y-9} r={2.6} fill="#FFF6D8" stroke="#E6A700" strokeWidth="0.4"/>
        <circle cx={cx-1} cy={y-9.6} r="0.7" fill="#fff" opacity="0.9"/>
        <circle cx={cx-6} cy={y-0.5} r="1" fill="#8FE0FF"/>
        <circle cx={cx+6} cy={y-0.5} r="1" fill="#8FE0FF"/>
      </g>
    );
  }
  return null;
}

/* ════════════════════════════════════════════════════
   かみがた(hair) — back/frontを分けて描画レイヤーへ差し込む
════════════════════════════════════════════════════ */
export function HairBack({ kind, gHair, headX = 36, headY = 33 }) {
  const cx = headX, cy = headY;
  switch (kind) {
    case 'long':
      return (
        <>
          <ellipse cx={cx} cy={cy-10} rx="18" ry="14" fill={`url(#${gHair})`}/>
          <path d={`M${cx-18},${cy-5} C${cx-22},${cy+12} ${cx-19},${cy+24} ${cx-15},${cy+27} C${cx-12},${cy+22} ${cx-12},${cy+8} ${cx-13},${cy-1} Z`} fill={`url(#${gHair})`}/>
          <path d={`M${cx+18},${cy-5} C${cx+22},${cy+12} ${cx+19},${cy+24} ${cx+15},${cy+27} C${cx+12},${cy+22} ${cx+12},${cy+8} ${cx+13},${cy-1} Z`} fill={`url(#${gHair})`}/>
        </>
      );
    case 'wave':
      return (
        <>
          <ellipse cx={cx} cy={cy-10} rx="18" ry="14" fill={`url(#${gHair})`}/>
          <path d={`M${cx-18},${cy-4} Q${cx-24},${cy+6} ${cx-17},${cy+13} Q${cx-23},${cy+19} ${cx-15},${cy+22} Q${cx-12},${cy+15} ${cx-13},${cy+2} Z`} fill={`url(#${gHair})`}/>
          <path d={`M${cx+18},${cy-4} Q${cx+24},${cy+6} ${cx+17},${cy+13} Q${cx+23},${cy+19} ${cx+15},${cy+22} Q${cx+12},${cy+15} ${cx+13},${cy+2} Z`} fill={`url(#${gHair})`}/>
        </>
      );
    case 'twin':
      return (
        <>
          <ellipse cx={cx} cy={cy-10} rx="17" ry="13" fill={`url(#${gHair})`}/>
          <circle cx={cx-19} cy={cy+3} r="6.4" fill={`url(#${gHair})`}/>
          <circle cx={cx+19} cy={cy+3} r="6.4" fill={`url(#${gHair})`}/>
          <path d={`M${cx-19},${cy+8} L${cx-21},${cy+20}`} stroke={`url(#${gHair})`} strokeWidth="5" strokeLinecap="round"/>
          <path d={`M${cx+19},${cy+8} L${cx+21},${cy+20}`} stroke={`url(#${gHair})`} strokeWidth="5" strokeLinecap="round"/>
        </>
      );
    case 'short':
      return <ellipse cx={cx} cy={cy-9} rx="17.5" ry="12.5" fill={`url(#${gHair})`}/>;
    case 'pony':
      return (
        <>
          <ellipse cx={cx} cy={cy-10} rx="17.5" ry="13.5" fill={`url(#${gHair})`}/>
          <path d={`M${cx+15},${cy-8} Q${cx+27},${cy-3} ${cx+24},${cy+14} Q${cx+21},${cy+22} ${cx+16},${cy+22} Q${cx+19},${cy+10} ${cx+14},${cy-3} Z`} fill={`url(#${gHair})`}/>
        </>
      );
    case 'bun':
      return (
        <>
          <ellipse cx={cx} cy={cy-9} rx="17" ry="12.5" fill={`url(#${gHair})`}/>
          <circle cx={cx} cy={cy-24} r="6.6" fill={`url(#${gHair})`}/>
          <path d={`M${cx-2},${cy-19} Q${cx},${cy-15} ${cx+2},${cy-19}`} stroke={`url(#${gHair})`} strokeWidth="3" fill="none"/>
        </>
      );
    /* prince */
    case 'natural':
      return <ellipse cx={cx} cy={cy-10} rx="18" ry="13" fill={`url(#${gHair})`}/>;
    case 'side':
      return (
        <>
          <ellipse cx={cx-2} cy={cy-10} rx="18" ry="13" fill={`url(#${gHair})`}/>
          <path d={`M${cx-16},${cy-16} Q${cx-24},${cy-10} ${cx-18},${cy-2}`} stroke={`url(#${gHair})`} strokeWidth="6" strokeLinecap="round" fill="none"/>
        </>
      );
    case 'princelong':
      return (
        <>
          <ellipse cx={cx} cy={cy-10} rx="18" ry="13" fill={`url(#${gHair})`}/>
          <path d={`M${cx-17},${cy-4} C${cx-20},${cy+8} ${cx-17},${cy+16} ${cx-13},${cy+18} C${cx-11},${cy+12} ${cx-12},${cy+2} ${cx-13},${cy-4} Z`} fill={`url(#${gHair})`}/>
          <path d={`M${cx+17},${cy-4} C${cx+20},${cy+8} ${cx+17},${cy+16} ${cx+13},${cy+18} C${cx+11},${cy+12} ${cx+12},${cy+2} ${cx+13},${cy-4} Z`} fill={`url(#${gHair})`}/>
        </>
      );
    case 'adventure':
      return (
        <>
          <ellipse cx={cx} cy={cy-9} rx="18.5" ry="13" fill={`url(#${gHair})`}/>
          <path d={`M${cx-17},${cy-10} Q${cx-22},${cy-2} ${cx-16},${cy+6}`} stroke={`url(#${gHair})`} strokeWidth="5" strokeLinecap="round" fill="none"/>
        </>
      );
    default:
      return <ellipse cx={cx} cy={cy-10} rx="18" ry="14" fill={`url(#${gHair})`}/>;
  }
}

export function HairFront({ kind, gHair, headX = 36, headTopY = 17 }) {
  const cx = headX, y = headTopY;
  const wispy = <path d={`M${cx-11},${y+5} Q${cx-6},${y} ${cx},${y}`} stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>;
  switch (kind) {
    case 'twin':
    case 'bun':
    case 'pony':
      return <path d={`M${cx-11},${y+5} Q${cx-4},${y-2} ${cx+4},${y-1} Q${cx+9},${y-1} ${cx+11},${y+4}`} fill={`url(#${gHair})`} opacity="0.98"/>;
    case 'short':
      return <path d={`M${cx-12},${y+6} Q${cx-5},${y-3} ${cx+3},${y-2} Q${cx+10},${y-1} ${cx+12},${y+5}`} fill={`url(#${gHair})`}/>;
    case 'side':
      return <path d={`M${cx-12},${y+6} Q${cx-2},${y-4} ${cx+10},${y+2}`} fill={`url(#${gHair})`}/>;
    case 'adventure':
      return <path d={`M${cx-12},${y+6} Q${cx-3},${y-3} ${cx+9},${y+1}`} fill={`url(#${gHair})`}/>;
    default:
      return wispy;
  }
}

/* ════════════════════════════════════════════════════
   ふく(outfit) — princess/princeそれぞれのシルエット
════════════════════════════════════════════════════ */
export function PrincessOutfit({ kind, gSkirt, gDrape, gGold, c1, c2 }) {
  switch (kind) {
    case 'fairy':
      return (
        <g>
          <path d="M36,58 C22,60 10,72 9,92 Q20,86 27,90 Q30,80 36,78 Q42,80 45,90 Q52,86 63,92 C62,72 50,60 36,58 Z" fill={`url(#${gSkirt})`} opacity="0.92"/>
          <path d="M36,58 C26,62 16,74 14,90 Q24,84 30,88" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.5"/>
          <circle cx="18" cy="80" r="1" fill="#fff" opacity="0.8"/>
          <circle cx="54" cy="80" r="1.1" fill="#fff" opacity="0.75"/>
          <path d="M28,58 Q36,54 44,58 L44,63 Q36,67 28,63 Z" fill={c1}/>
          <ellipse cx="24" cy="54" rx="4.6" ry="5" fill={c2}/>
          <ellipse cx="48" cy="54" rx="4.6" ry="5" fill={c2}/>
          <path d="M22,58 Q17,66 20,73" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M50,58 Q55,66 52,73" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </g>
      );
    case 'tutu':
      return (
        <g>
          <ellipse cx="36" cy="76" rx="26" ry="10" fill={`url(#${gSkirt})`}/>
          <ellipse cx="36" cy="72" rx="22" ry="8.4" fill={c1} opacity="0.9"/>
          <rect x="26" y="60" width="20" height="34" rx="8" fill={c2} opacity="0.28"/>
          <path d="M28,58 Q36,54 44,58 L44,63 Q36,66 28,63 Z" fill={c1}/>
          <ellipse cx="24" cy="54" rx="4.4" ry="5" fill={c2}/>
          <ellipse cx="48" cy="54" rx="4.4" ry="5" fill={c2}/>
          <path d="M22,58 Q18,65 20,71" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M50,58 Q54,65 52,71" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <rect x="18" y="98" width="12" height="9" rx="3" fill={c2}/>
          <rect x="42" y="98" width="12" height="9" rx="3" fill={c2}/>
        </g>
      );
    case 'robe':
      return (
        <g>
          <path d="M36,52 C24,58 16,76 15,104 L57,104 C56,76 48,58 36,52 Z" fill={`url(#${gSkirt})`}/>
          <path d="M36,52 L34,104 M36,52 L38,104" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
          <path d="M22,60 L18,104 M50,60 L54,104" stroke={`url(#${gGold})`} strokeWidth="1.3" opacity="0.85"/>
          <path d="M28,49 Q36,45 44,49 L44,58 Q36,62 28,58 Z" fill={c1}/>
          <path d="M22,54 L15,66 M50,54 L57,66" stroke={c2} strokeWidth="6" strokeLinecap="round"/>
        </g>
      );
    case 'cape':
      return (
        <g>
          <path d="M36,56 C24,62 16,78 16,102 Q26,107 36,105 Q46,107 56,102 C56,78 48,62 36,56 Z" fill={c1}/>
          <path d="M18,54 C8,64 5,86 9,103 Q17,106 23,100 L23,72 Q19,62 22,55 Z" fill={`url(#${gSkirt})`}/>
          <path d="M54,54 C64,64 67,86 63,103 Q55,106 49,100 L49,72 Q53,62 50,55 Z" fill={`url(#${gSkirt})`}/>
          <path d="M9,103 Q17,106 23,100" stroke={`url(#${gGold})`} strokeWidth="1.4" fill="none"/>
          <path d="M63,103 Q55,106 49,100" stroke={`url(#${gGold})`} strokeWidth="1.4" fill="none"/>
          <path d="M28,50 Q36,46 44,50 L44,59 Q36,63 28,59 Z" fill={c2}/>
        </g>
      );
    /* ── ★★★実績スペシャル: ようせいドレス ── */
    case 'starGown':
      return (
        <g>
          <path d="M36,60 C26,66 16,80 15,101 Q25,94 36,92 Q47,94 57,101 C56,80 46,66 36,60 Z" fill={`url(#${gSkirt})`}/>
          <path d="M36,56 C22,61 8,78 6,100 Q13,104 20,99 Q17,80 27,65 Z" fill="#fff" opacity="0.32"/>
          <path d="M36,56 C50,61 64,78 66,100 Q59,104 52,99 Q55,80 45,65 Z" fill="#fff" opacity="0.32"/>
          <StarShape cx={14} cy={90} r={2.2} fill="#fff" opacity="0.8"/>
          <StarShape cx={58} cy={90} r={2.2} fill="#fff" opacity="0.8"/>
          <StarShape cx={36} cy={99} r={1.8} fill="#FFF6D8" opacity="0.9"/>
          <circle cx="24" cy="80" r="1" fill="#fff" opacity="0.75"/>
          <circle cx="48" cy="83" r="1.1" fill="#fff" opacity="0.7"/>
          <path d="M28,58 Q36,62 44,58 L44,62 Q36,66 28,62 Z" fill={`url(#${gGold})`}/>
          <path d="M28,50 Q36,47 44,50 L44,59 Q36,63 28,59 Z" fill={c1}/>
          <ellipse cx="25" cy="53" rx="4.5" ry="5" fill={c2}/>
          <ellipse cx="47" cy="53" rx="4.5" ry="5" fill={c2}/>
          <path d="M20,56 Q14,62 16,70 Q19,64 24,62" fill="#fff" opacity="0.5"/>
          <path d="M52,56 Q58,62 56,70 Q53,64 48,62" fill="#fff" opacity="0.5"/>
          <path d="M23,57 Q19,64 21,71" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M49,57 Q53,64 51,71" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </g>
      );
    case 'ballgown':
    default:
      return (
        <g>
          <path d="M36,58 C25,64 13,79 11,102 Q13,106 18,105 Q22,108 28,106 Q32,109 36,107 Q40,109 44,106 Q50,108 54,105 Q59,106 61,102 C59,79 47,64 36,58 Z" fill={`url(#${gSkirt})`}/>
          <path d="M36,60 C29,66 21,78 19,99 Q30,88 36,86 Q42,88 53,99 C51,78 43,66 36,60 Z" fill={`url(#${gDrape})`}/>
          <path d="M12,101 Q15,97 18,101 Q21,97 25,101 Q28,97 32,101 Q35,97 39,101 Q43,97 46,101 Q50,97 53,101 Q56,97 60,101 L61,104 Q48,108 36,108 Q24,108 11,104 Z" fill="#fff" opacity="0.85"/>
          <circle cx="25" cy="84" r="1.1" fill="#fff" opacity="0.8"/>
          <circle cx="45" cy="90" r="1.3" fill="#fff" opacity="0.7"/>
          <path d="M28,58 Q36,62 44,58 L44,62 Q36,66 28,62 Z" fill={`url(#${gGold})`}/>
          <path d="M28,50 Q36,47 44,50 L44,59 Q36,63 28,59 Z" fill={c1}/>
          <ellipse cx="25" cy="53" rx="4.5" ry="5" fill={c2}/>
          <ellipse cx="47" cy="53" rx="4.5" ry="5" fill={c2}/>
          <path d="M23,57 Q19,64 21,71" stroke="#fff" strokeWidth="4.2" fill="none" strokeLinecap="round"/>
          <path d="M49,57 Q53,64 51,71" stroke="#fff" strokeWidth="4.2" fill="none" strokeLinecap="round"/>
        </g>
      );
  }
}

export function PrinceOutfit({ kind, gCape, gCoat, gGold, c1, c2 }) {
  switch (kind) {
    case 'tunic':
      return (
        <g>
          <rect x="24" y="76" width="10" height="26" rx="4" fill={c2}/>
          <rect x="38" y="76" width="10" height="26" rx="4" fill={c2}/>
          <path d="M22,55 Q36,51 50,55 L48,80 Q36,84 24,80 Z" fill={`url(#${gCoat})`}/>
          <path d="M22,55 Q36,51 50,55" stroke={`url(#${gGold})`} strokeWidth="1.2" fill="none"/>
          <path d="M28,60 L44,60 M27,66 L45,66" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
          <rect x="21" y="70" width="30" height="4.4" rx="2" fill={`url(#${gGold})`}/>
          <path d="M28,51 L33,54 L33,49 Z" fill={c2}/>
          <path d="M44,51 L39,54 L39,49 Z" fill={c2}/>
        </g>
      );
    case 'formal':
      return (
        <g>
          <rect x="23" y="75" width="11" height="27" rx="4" fill={c1}/>
          <rect x="38" y="75" width="11" height="27" rx="4" fill={c1}/>
          <path d="M20,54 Q36,49 52,54 L52,77 Q36,81 20,77 Z" fill={`url(#${gCoat})`}/>
          <path d="M36,52 L36,79" stroke={`url(#${gGold})`} strokeWidth="1.4"/>
          <path d="M23,55 L47,75 L44,78 L20,58 Z" fill="#fff" opacity="0.9"/>
          <circle cx="31" cy="60" r="1.3" fill={`url(#${gGold})`}/>
          <circle cx="31" cy="66" r="1.3" fill={`url(#${gGold})`}/>
          <circle cx="31" cy="72" r="1.3" fill={`url(#${gGold})`}/>
          <path d="M28,51 L33,54 L33,49 Z" fill={c2}/>
          <path d="M44,51 L39,54 L39,49 Z" fill={c2}/>
        </g>
      );
    case 'robe':
      return (
        <g>
          <path d="M36,52 C24,58 16,76 16,103 L56,103 C56,76 48,58 36,52 Z" fill={`url(#${gCoat})`}/>
          <path d="M36,52 L34,103 M36,52 L38,103" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
          <path d="M21,60 L17,103 M51,60 L55,103" stroke={`url(#${gGold})`} strokeWidth="1.3" opacity="0.85"/>
          <path d="M28,49 Q36,45 44,49 L44,58 Q36,62 28,58 Z" fill={c2}/>
        </g>
      );
    case 'cape':
      return (
        <g>
          <path d="M18,52 C8,64 4,84 8,101 Q16,105 23,100 L23,73 Q19,62 22,54 Z" fill={`url(#${gCape})`}/>
          <path d="M54,52 C64,64 68,84 64,101 Q56,105 49,100 L49,73 Q53,62 50,54 Z" fill={`url(#${gCape})`}/>
          <rect x="24" y="76" width="10" height="26" rx="4" fill={c2}/>
          <rect x="38" y="76" width="10" height="26" rx="4" fill={c2}/>
          <path d="M22,55 Q36,50 50,55 L48,78 Q36,82 24,78 Z" fill={c1}/>
          <path d="M8,101 Q16,105 23,100" stroke={`url(#${gGold})`} strokeWidth="1.6" fill="none"/>
          <path d="M64,101 Q56,105 49,100" stroke={`url(#${gGold})`} strokeWidth="1.6" fill="none"/>
        </g>
      );
    /* ── ★★★実績スペシャル: てんくうマント ── */
    case 'skyCape':
      return (
        <g>
          <path d="M15,50 C2,66 -3,94 3,112 Q15,117 24,111 L24,72 Q19,60 23,52 Z" fill={`url(#${gCape})`}/>
          <path d="M57,50 C70,66 75,94 69,112 Q57,117 48,111 L48,72 Q53,60 49,52 Z" fill={`url(#${gCape})`}/>
          <path d="M3,112 Q15,117 24,111" stroke={`url(#${gGold})`} strokeWidth="1.8" fill="none"/>
          <path d="M69,112 Q57,117 48,111" stroke={`url(#${gGold})`} strokeWidth="1.8" fill="none"/>
          <StarShape cx={12} cy={78} r={1.8} fill="#FFF6D8" opacity="0.85"/>
          <StarShape cx={9} cy={96} r="1.6" fill="#FFF6D8" opacity="0.75"/>
          <StarShape cx={60} cy={78} r={1.8} fill="#FFF6D8" opacity="0.85"/>
          <StarShape cx={63} cy={96} r="1.6" fill="#FFF6D8" opacity="0.75"/>
          <rect x="24" y="76" width="10" height="26" rx="4" fill={c2}/>
          <rect x="38" y="76" width="10" height="26" rx="4" fill={c2}/>
          <path d="M22,55 Q36,50 50,55 L48,78 Q36,82 24,78 Z" fill={c1}/>
          <circle cx="21" cy="55" r="3.4" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
          <circle cx="51" cy="55" r="3.4" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
          <circle cx="20.3" cy="54.3" r="1" fill="#fff" opacity="0.85"/>
          <circle cx="50.3" cy="54.3" r="1" fill="#fff" opacity="0.85"/>
        </g>
      );
    case 'jacket':
    default:
      return (
        <g>
          <path d="M20,52 C10,64 6,84 9,100 Q17,104 24,100 L24,74 Q21,62 24,54 Z" fill={`url(#${gCape})`}/>
          <path d="M52,52 C62,64 66,84 63,100 Q55,104 48,100 L48,74 Q51,62 48,54 Z" fill={`url(#${gCape})`}/>
          <path d="M9,100 Q17,104 24,100" stroke={`url(#${gGold})`} strokeWidth="1.6" fill="none"/>
          <path d="M63,100 Q55,104 48,100" stroke={`url(#${gGold})`} strokeWidth="1.6" fill="none"/>
          <rect x="23" y="74" width="11" height="28" rx="4" fill={c2}/>
          <rect x="38" y="74" width="11" height="28" rx="4" fill={c2}/>
          <path d="M28.5,76 L28.5,98" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2"/>
          <path d="M43.5,76 L43.5,98" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2"/>
          <path d="M20,54 Q36,49 52,54 L52,76 Q36,80 20,76 Z" fill={`url(#${gCoat})`}/>
          <path d="M20,54 Q36,49 52,54" stroke={`url(#${gGold})`} strokeWidth="1.4" fill="none"/>
          <path d="M36,52 L36,78" stroke={`url(#${gGold})`} strokeWidth="1.2"/>
          <ellipse cx="21" cy="54.5" rx="5" ry="3" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
          <ellipse cx="51" cy="54.5" rx="5" ry="3" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.5"/>
          <path d="M23,55 L47,74 L44,77 L20,58 Z" fill="#fff" opacity="0.85"/>
          <circle cx="42" cy="70" r="2.6" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.6"/>
          <circle cx="31" cy="60" r="1.4" fill={`url(#${gGold})`}/>
          <circle cx="31" cy="66" r="1.4" fill={`url(#${gGold})`}/>
          <circle cx="31" cy="72" r="1.4" fill={`url(#${gGold})`}/>
          <path d="M28,51 L33,54 L33,49 Z" fill={c2}/>
          <path d="M44,51 L39,54 L39,49 Z" fill={c2}/>
        </g>
      );
  }
}

/* ════════════════════════════════════════════════════
   こもの(item) — 手元に置く小物。x,yは配置基準点
════════════════════════════════════════════════════ */
export function ItemArt({ kind, gGold, x, y }) {
  if (!kind || kind === 'none') return null;
  const t = `translate(${x} ${y})`;
  switch (kind) {
    case 'wand':
      return (
        <g transform={t}>
          <rect x="-0.9" y="-2" width="1.8" height="11" rx="0.9" fill={`url(#${gGold})`}/>
          <StarShape cx={0} cy={-5} r={3.6} fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.4"/>
          <circle cx="-1" cy="-6" r="0.8" fill="#fff" opacity="0.8"/>
        </g>
      );
    case 'sword':
      return (
        <g transform={t}>
          <rect x="-1" y="-10" width="2" height="14" rx="1" fill="#D8E2EA"/>
          <rect x="-0.4" y="-10" width="0.8" height="14" fill="#fff" opacity="0.6"/>
          <rect x="-4" y="3" width="8" height="2" rx="1" fill={`url(#${gGold})`}/>
          <rect x="-1.3" y="4" width="2.6" height="5" rx="1" fill="#7A5A2A"/>
        </g>
      );
    case 'bag':
      return (
        <g transform={t}>
          <path d="M-4,-2 Q0,-7 4,-2" stroke="#7A5A2A" strokeWidth="1.4" fill="none"/>
          <rect x="-5" y="-2" width="10" height="8" rx="2.4" fill="#E8A85C" stroke="#B8752E" strokeWidth="0.5"/>
          <rect x="-5" y="-2" width="10" height="2.4" fill="#F0C088"/>
        </g>
      );
    case 'bouquet':
      return (
        <g transform={t}>
          <path d="M0,2 L-1.5,9 L1.5,9 Z" fill="#5FA85C"/>
          {[-3,0,3].map((dx,i) => (
            <g key={i} transform={`translate(${dx} ${-1-Math.abs(dx)*0.3})`}>
              <circle r="2.3" fill={i===1?'#FF8AAE':'#FFB3C7'} stroke="#E06B96" strokeWidth="0.35"/>
              <circle r="0.8" fill={`url(#${gGold})`}/>
            </g>
          ))}
        </g>
      );
    case 'parasol':
      return (
        <g transform={t}>
          <rect x="-0.8" y="0" width="1.6" height="10" fill="#7A5A2A"/>
          <path d="M-7,0 Q-7,-7 0,-7 Q7,-7 7,0 Z" fill="#FFB3C7" stroke="#E06B96" strokeWidth="0.5"/>
          <path d="M-7,0 Q-3.5,-2 0,0 Q3.5,-2 7,0" fill="none" stroke="#E06B96" strokeWidth="0.4"/>
        </g>
      );
    case 'plush':
      return (
        <g transform={t}>
          <circle cx="0" cy="0" r="4" fill="#E8A85C"/>
          <circle cx="-3.4" cy="-3.2" r="1.6" fill="#E8A85C"/>
          <circle cx="3.4" cy="-3.2" r="1.6" fill="#E8A85C"/>
          <ellipse cx="0" cy="1" rx="2.2" ry="1.6" fill="#FFE0B2"/>
          <circle cx="-1.2" cy="-0.3" r="0.5" fill="#3a2a14"/>
          <circle cx="1.2" cy="-0.3" r="0.5" fill="#3a2a14"/>
        </g>
      );
    case 'horn':
      return (
        <g transform={t}>
          <path d="M-6,2 L2,-3 L2,-6 Q7,-4 7,0 Q7,4 2,6 L2,3 Z" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.4"/>
          <circle cx="4.2" cy="0" r="0.9" fill="#fff" opacity="0.8"/>
        </g>
      );
    case 'map':
      return (
        <g transform={t}>
          <rect x="-4.5" y="-6" width="9" height="12" rx="1" fill="#F5E6C8" stroke="#C9A96A" strokeWidth="0.5"/>
          <path d="M-2.5,-3 L2,-3 M-2.5,0 L2.5,0 M-2.5,3 L1,3" stroke="#C9A96A" strokeWidth="0.6"/>
        </g>
      );
    case 'horse':
      return (
        <g transform={t}>
          <ellipse cx="0" cy="0" rx="4.6" ry="3.2" fill="#C9A17A"/>
          <path d="M4,-2 L8,-4 L7,0 Z" fill="#C9A17A"/>
          <path d="M6.4,-4.6 L7.4,-7 L8.2,-4.2 Z" fill="#5D4037"/>
          <rect x="-5" y="2" width="10" height="1.6" fill="#7A5A2A"/>
        </g>
      );
    case 'rainbow':
      return (
        <g transform={t}>
          {['#FF8A8A','#FFD37A','#8AF0A0','#8AC8FF'].map((c,i) => (
            <path key={c} d={`M${-7+i*0.4},${3-i*0.4} A${6-i*1.4},${6-i*1.4} 0 0 1 ${7-i*0.4},${3-i*0.4}`} fill="none" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
          ))}
        </g>
      );
    default:
      return null;
  }
}

/* ════════════════════════════════════════════════════
   アクセサリ(首元)。カテゴリタブからは廃止だが旧saveの
   互換描画としてベクターで維持する。
════════════════════════════════════════════════════ */
export function AccessoryArt({ kind, gGold, x, y }) {
  if (!kind || kind === 'none') return null;
  const t = `translate(${x} ${y})`;
  switch (kind) {
    case 'necklace':
      return <g transform={t}><path d="M-5,-2 Q0,3 5,-2" stroke={`url(#${gGold})`} strokeWidth="1.1" fill="none"/><circle r="1.5" cy="2" fill="#FF6FA5" stroke="#C98F00" strokeWidth="0.4"/></g>;
    case 'heart':
      return <g transform={t}><path d="M0,2.4 C-3.6,-1 -3,-4 0,-2 C3,-4 3.6,-1 0,2.4 Z" fill="#FF6F8E" stroke="#D9445F" strokeWidth="0.4"/></g>;
    case 'star':
      return <g transform={t}><StarShape cx={0} cy={0} r={3} fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.4"/></g>;
    case 'flower':
      return <g transform={t}>{[0,1,2,3,4].map(i=>{const a=(i/5)*Math.PI*2;return <ellipse key={i} cx={Math.cos(a)*2.4} cy={Math.sin(a)*2.4} rx="1.6" ry="1.1" fill="#FFB3C7"/>;})}<circle r="1" fill={`url(#${gGold})`}/></g>;
    case 'sparkle':
      return <g transform={t}><SparkleMark cx={0} cy={0} r={3.2} fill="#FFE58A"/></g>;
    case 'sword':
      return <g transform={t}><rect x="-0.8" y="-4" width="1.6" height="7" fill="#D8E2EA"/><rect x="-2.5" y="1.4" width="5" height="1.3" fill={`url(#${gGold})`}/></g>;
    case 'shield':
      return <g transform={t}><path d="M0,-3.4 L3.2,-2 L3.2,1 Q3.2,3.6 0,4.6 Q-3.2,3.6 -3.2,1 L-3.2,-2 Z" fill="#B8C4CE" stroke="#8A97A2" strokeWidth="0.4"/></g>;
    case 'trophy':
      return <g transform={t}><path d="M-2.6,-3 L2.6,-3 L2,1 Q0,2.4 -2,1 Z" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.35"/><rect x="-1.2" y="1.4" width="2.4" height="1.6" fill="#C98F00"/></g>;
    case 'medal':
      return <g transform={t}><circle r="2.6" fill={`url(#${gGold})`} stroke="#C98F00" strokeWidth="0.4"/><StarShape cx={0} cy={0} r={1.4} fill="#fff" opacity="0.85"/></g>;
    case 'gem':
    default:
      return <g transform={t}><path d="M-3,0 L-1.4,-2.6 L1.4,-2.6 L3,0 L0,2.8 Z" fill="#8FE0FF" stroke="#3a97c9" strokeWidth="0.4"/></g>;
  }
}

/* ════════════════════════════════════════════════════
   ペット — 大きめ頭・小さい胴・大きな目のミニSVG(独立表示用)
════════════════════════════════════════════════════ */
const PET_COLORS = {
  cat:{body:'#F7C5A0',belly:'#FFF0E2',accent:'#FF9BB5'},
  dog:{body:'#E8DCC8',belly:'#FFFBF2',accent:'#8FC7F5'},
  rabbit:{body:'#F3E4F7',belly:'#FFFBFF',accent:'#C9A6F0'},
  fox:{body:'#F2A45C',belly:'#FFF3E0',accent:'#8D5A2A'},
  frog:{body:'#8FD98A',belly:'#E4F7DC',accent:'#4FA84A'},
  butterfly:{body:'#9A7EFF',belly:'#D9CCFF',accent:'#6a55cc'},
  panda:{body:'#FAFAFA',belly:'#FFFFFF',accent:'#2A2028'},
  unicorn:{body:'#FFFFFF',belly:'#FFF0FA',accent:'#C9A6F0'},
  unicornJewel:{body:'#EDE3FB',belly:'#FFFFFF',accent:'#9B6FE0'},
  unicornLight:{body:'#FFF8EA',belly:'#FFE9F5',accent:'#E6A700'},
  dragonMini:{body:'#FFD37A',belly:'#FFF3D9',accent:'#C98F00'},
  bear:{body:'#B08A5A',belly:'#F0DCC2',accent:'#6a4a28'},
  lion:{body:'#F2C25A',belly:'#FFF0C8',accent:'#C98F2C'},
  tiger:{body:'#F2A245',belly:'#FFF0DC',accent:'#3A2A18'},
  wolf:{body:'#A8A8B0',belly:'#F0F0F5',accent:'#5A5A66'},
  dragon:{body:'#6FBF6E',belly:'#E0F5DC',accent:'#3a8a3a'},
  eagle:{body:'#B8A088',belly:'#FFF3E0',accent:'#5D4037'},
  horse:{body:'#C9A17A',belly:'#F2DCC2',accent:'#6a4a28'},
};

export function PetSVG({ kind }) {
  if (!kind || kind === 'none') return null;
  const c = PET_COLORS[kind] || PET_COLORS.cat;
  const earShape = () => {
    switch (kind) {
      case 'cat': case 'fox':
        return <>
          <path d="M8,10 L4,1 L13,7 Z" fill={c.body}/>
          <path d="M32,10 L36,1 L27,7 Z" fill={c.body}/>
          <path d="M9,8 L7,3 L11.5,6.4 Z" fill={c.accent}/>
          <path d="M31,8 L33,3 L28.5,6.4 Z" fill={c.accent}/>
        </>;
      case 'dog': case 'bear': case 'panda':
        return <>
          <ellipse cx="8" cy="8" rx="5" ry="6" fill={c.body}/>
          <ellipse cx="32" cy="8" rx="5" ry="6" fill={c.body}/>
        </>;
      case 'rabbit':
        return <>
          <ellipse cx="13" cy="-4" rx="3.2" ry="10" fill={c.body}/>
          <ellipse cx="27" cy="-4" rx="3.2" ry="10" fill={c.body}/>
          <ellipse cx="13" cy="-4" rx="1.5" ry="7" fill={c.accent} opacity="0.5"/>
          <ellipse cx="27" cy="-4" rx="1.5" ry="7" fill={c.accent} opacity="0.5"/>
        </>;
      case 'unicorn':
        return <>
          <ellipse cx="10" cy="6" rx="4" ry="5" fill={c.body}/>
          <ellipse cx="30" cy="6" rx="4" ry="5" fill={c.body}/>
          <path d="M20,-2 L17,10 L23,10 Z" fill="#FFE58A" stroke="#E6A700" strokeWidth="0.5"/>
        </>;
      /* ★★Shop: ジュエルユニコーン — 宝石つきの角、耳元に小さな飾り */
      case 'unicornJewel':
        return <>
          <ellipse cx="10" cy="6" rx="4" ry="5" fill={c.body}/>
          <ellipse cx="30" cy="6" rx="4" ry="5" fill={c.body}/>
          <path d="M20,-2 L17,10 L23,10 Z" fill="#FFE58A" stroke="#E6A700" strokeWidth="0.5"/>
          <circle cx="20" cy="6" r="1.6" fill="#8FE0FF" stroke="#3a97c9" strokeWidth="0.4"/>
          <circle cx="19.5" cy="5.5" r="0.5" fill="#fff" opacity="0.9"/>
          <circle cx="9" cy="3" r="1.1" fill="#9B6FE0"/>
          <circle cx="31" cy="3" r="1.1" fill="#9B6FE0"/>
        </>;
      /* ★★★実績: ひかりのユニコーン — 金+宝石の角、虹色のたてがみを伴う */
      case 'unicornLight':
        return <>
          <ellipse cx="10" cy="6" rx="4" ry="5" fill={c.body}/>
          <ellipse cx="30" cy="6" rx="4" ry="5" fill={c.body}/>
          <path d="M20,-3 L16.5,11 L23.5,11 Z" fill="#FFE58A" stroke="#E6A700" strokeWidth="0.5"/>
          <path d="M20,-3 L18,11 L20,11 Z" fill="#FFF6D8" opacity="0.85"/>
          <circle cx="20" cy="4.5" r="1.8" fill="#FF9BC4" stroke="#E6A700" strokeWidth="0.5"/>
          <circle cx="19.3" cy="3.8" r="0.6" fill="#fff" opacity="0.95"/>
        </>;
      /* ★★★実績: ちびドラゴン — 金の角と小さな翼 */
      case 'dragonMini':
        return <>
          <circle cx="12" cy="4" r="4.6" fill={c.body}/>
          <circle cx="28" cy="4" r="4.6" fill={c.body}/>
          <circle cx="12" cy="4" r="2.2" fill="#fff"/>
          <circle cx="28" cy="4" r="2.2" fill="#fff"/>
          <path d="M13,-1 L11,-6 L15,-2 Z" fill="#FFE58A" stroke="#E6A700" strokeWidth="0.4"/>
          <path d="M27,-1 L29,-6 L25,-2 Z" fill="#FFE58A" stroke="#E6A700" strokeWidth="0.4"/>
        </>;
      case 'frog': case 'dragon':
        return <>
          <circle cx="12" cy="4" r="4.6" fill={c.body}/>
          <circle cx="28" cy="4" r="4.6" fill={c.body}/>
          <circle cx="12" cy="4" r="2.2" fill="#fff"/>
          <circle cx="28" cy="4" r="2.2" fill="#fff"/>
        </>;
      case 'lion':
        return <g>{[...Array(10)].map((_,i)=>{const a=(i/10)*Math.PI*2;return <ellipse key={i} cx={20+Math.cos(a)*15} cy={16+Math.sin(a)*15} rx="4.5" ry="3" transform={`rotate(${a*180/Math.PI} ${20+Math.cos(a)*15} ${16+Math.sin(a)*15})`} fill={c.accent} opacity="0.85"/>;})}</g>;
      case 'tiger': case 'wolf':
        return <>
          <path d="M8,10 L4,1 L13,7 Z" fill={c.body}/>
          <path d="M32,10 L36,1 L27,7 Z" fill={c.body}/>
        </>;
      case 'eagle':
        return <>
          <path d="M14,4 Q20,-4 26,4" fill="none" stroke={c.accent} strokeWidth="2.4" strokeLinecap="round"/>
        </>;
      case 'horse':
        return <>
          <ellipse cx="9" cy="4" rx="3.6" ry="7" fill={c.body}/>
          <ellipse cx="31" cy="4" rx="3.6" ry="7" fill={c.body}/>
        </>;
      case 'butterfly':
        return <>
          <ellipse cx="10" cy="12" rx="8" ry="9" fill={c.body}/>
          <ellipse cx="30" cy="12" rx="8" ry="9" fill={c.belly}/>
        </>;
      default:
        return null;
    }
  };
  const tailShape = () => {
    switch (kind) {
      case 'cat': case 'fox': case 'lion':
        return <path d="M32,30 Q42,26 40,16" stroke={c.accent} strokeWidth="3.6" fill="none" strokeLinecap="round"/>;
      case 'rabbit':
        return <circle cx="34" cy="30" r="3.2" fill="#fff"/>;
      case 'unicorn': case 'horse':
        return <path d="M32,30 Q42,32 40,42" stroke={c.accent} strokeWidth="3" fill="none" strokeLinecap="round"/>;
      case 'unicornJewel':
        return <path d="M32,30 Q43,31 42,40" stroke="#9B6FE0" strokeWidth="3" fill="none" strokeLinecap="round"/>;
      case 'unicornLight':
        return <path d="M32,30 Q44,32 43,42" stroke="#FF9BC4" strokeWidth="3.2" fill="none" strokeLinecap="round"/>;
      case 'wolf': case 'dragon': case 'dragonMini':
        return <path d="M32,30 Q40,30 40,22" stroke={c.body} strokeWidth="3.6" fill="none" strokeLinecap="round"/>;
      default:
        return null;
    }
  };
  /* ── たてがみ／羽(角以外での見た目差)。unicorn系と小竜のみ描画 ── */
  const maneShape = () => {
    switch (kind) {
      case 'unicornJewel':
        return <path d="M27,10 Q33,14 29,22 Q34,20 31,28" stroke="#9B6FE0" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.85"/>;
      case 'unicornLight':
        return (
          <g opacity="0.92">
            <path d="M26,9 Q34,13 28,22" stroke="#FF9BC4" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
            <path d="M27,12 Q36,17 30,26" stroke="#8FE0FF" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
            <path d="M27,16 Q35,22 29,30" stroke="#FFE58A" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </g>
        );
      case 'dragonMini':
        return (
          <g>
            <path d="M9,20 Q1,16 3,9 Q7,14 12,15 Z" fill={c.accent} opacity="0.9"/>
            <path d="M31,20 Q39,16 37,9 Q33,14 28,15 Z" fill={c.accent} opacity="0.9"/>
            <SparkleMark cx={20} cy={27} r={1.6} fill="#FFF6D8" opacity="0.85"/>
          </g>
        );
      default:
        return null;
    }
  };
  return (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      {kind !== 'butterfly' && tailShape()}
      {maneShape()}
      {earShape()}
      {kind === 'butterfly' ? (
        <>
          <rect x="19" y="8" width="2" height="16" rx="1" fill="#4A3B32"/>
          <circle cx="20" cy="8" r="2.6" fill={c.accent}/>
        </>
      ) : (
        <>
          <ellipse cx="20" cy="30" rx="10" ry="7" fill={c.body}/>
          <circle cx="20" cy="18" r="12" fill={c.body}/>
          <ellipse cx="20" cy="22" rx="6" ry="4.4" fill={c.belly}/>
          <circle cx="15" cy="16" r="3" fill="#2A2028"/>
          <circle cx="25" cy="16" r="3" fill="#2A2028"/>
          <circle cx="14" cy="15" r="1" fill="#fff"/>
          <circle cx="24" cy="15" r="1" fill="#fff"/>
          <ellipse cx="20" cy="21" rx="1.4" ry="1" fill={c.accent === '#2A2028' ? '#5A4038' : c.accent}/>
          <ellipse cx="9" cy="34" rx="3" ry="2.2" fill={c.body}/>
          <ellipse cx="31" cy="34" rx="3" ry="2.2" fill={c.body}/>
        </>
      )}
    </svg>
  );
}
