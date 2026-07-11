import React, { useMemo, useRef } from 'react';
import './IslandMap.css';

/* ════════════════════════════════════════════════════
   しまマップ（縦長トレイル型・エリア別配置）
   - SHELF_GROUPS の順にエリアを縦に並べ、
     ゲームを左右ジグザグの「建物」として配置。
   - 1本の道（SVGパス）が全建物をつなぐ。
   - GAMES/ルート定義は一切変更しない表示層のみの追加。
════════════════════════════════════════════════════ */

const AREA_THEMES = {
  asobu:    { bg:'linear-gradient(180deg,#c9f0bd,#a9e39b)', sign:'#3f9d4a', deco:['🌳','🍄','🌼','🐿️'] },
  nerau:    { bg:'linear-gradient(180deg,#cdeaff,#a9d8ff)', sign:'#3a86d4', deco:['⛰️','🪁','🎈','🦅'] },
  race:     { bg:'linear-gradient(180deg,#ffe6c4,#ffd0a0)', sign:'#e07a1f', deco:['🏁','🚦','🌵','⛽'] },
  kangaeru: { bg:'linear-gradient(180deg,#e8ddff,#d3c2ff)', sign:'#8a5cd6', deco:['💡','🔮','⭐','🦉'] },
  tsukuru:  { bg:'linear-gradient(180deg,#ffdff0,#ffc7e3)', sign:'#e0559d', deco:['🎨','🧸','🍬','✂️'] },
  manabu:   { bg:'linear-gradient(180deg,#fff6c4,#ffeb99)', sign:'#d9a514', deco:['🏫','📚','✏️','🔔'] },
};
const DEFAULT_THEME = { bg:'linear-gradient(180deg,#e8e8e8,#d5d5d5)', sign:'#888', deco:['🌟'] };

const ROW_H    = 100;  // 建物1つぶんの縦間隔
const HEADER_H = 66;   // エリア看板の高さ
const TOP_PAD  = 74;   // START旗ぶん
const BOT_PAD  = 96;   // GOALぶん
const X_LEFT   = 27;   // ％
const X_RIGHT  = 63;   // ％

const UI_TEXT = {
  start: { ja:'スタート！', en:'START!', zh:'出发！', ko:'출발!', es:'¡SALIDA!' },
  goal:  { ja:'ぜんぶ あそべたかな？', en:'Did you play them all?', zh:'都玩过了吗？', ko:'전부 놀아봤어?', es:'¿Jugaste todos?' },
};

export default function IslandMap({ groups, games, lang, svgMap, onPlay }) {
  const areaRefs = useRef({});

  /* エリア・建物のレイアウトを算出（ゲーム追加時も自動対応） */
  const layout = useMemo(() => {
    let y = TOP_PAD;
    let idx = 0; // 全体通しindex（ジグザグの連続性用）
    const areas = [];
    const nodes = [];
    for (const grp of groups) {
      const items = games.filter(grp.match);
      if (items.length === 0) continue;
      const areaTop = y;
      y += HEADER_H;
      for (const game of items) {
        nodes.push({
          game,
          x: idx % 2 === 0 ? X_LEFT : X_RIGHT,
          y: y + ROW_H / 2,
          areaKey: grp.key,
        });
        y += ROW_H;
        idx++;
      }
      areas.push({ grp, top: areaTop, height: y - areaTop, count: items.length });
    }
    return { areas, nodes, totalH: y + BOT_PAD };
  }, [groups, games]);

  /* 全建物をつなぐ道（なめらかな曲線） */
  const roadPath = useMemo(() => {
    const pts = [
      { x: 50, y: 34 },                       // START旗
      ...layout.nodes.map(n => ({ x: n.x, y: n.y })),
      { x: 50, y: layout.totalH - 52 },       // GOAL
    ];
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const my = (p0.y + p1.y) / 2;
      d += ` C ${p0.x} ${my}, ${p1.x} ${my}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [layout]);

  function jumpTo(key) {
    const el = areaRefs.current[key];
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="im-wrap">
      {/* ── エリアクイックジャンプ ── */}
      <div className="im-jump">
        {layout.areas.map(({ grp }) => (
          <button
            key={grp.key}
            className="im-jump-btn"
            style={{ '--sign': (AREA_THEMES[grp.key] || DEFAULT_THEME).sign }}
            onClick={() => jumpTo(grp.key)}
          >
            <span className="im-jump-icon">{grp.icon}</span>
            <span className="im-jump-label">{grp.label[lang] || grp.label.ja}</span>
          </button>
        ))}
      </div>

      {/* ── 島本体 ── */}
      <div className="im-ocean">
        <div className="im-island" style={{ height: layout.totalH }}>
          {/* エリア背景バンド */}
          {layout.areas.map(({ grp, top, height }) => {
            const theme = AREA_THEMES[grp.key] || DEFAULT_THEME;
            return (
              <div
                key={grp.key}
                className="im-area"
                ref={el => { areaRefs.current[grp.key] = el; }}
                style={{ top, height, background: theme.bg }}
              >
                {/* エリア看板 */}
                <div className="im-area-sign" style={{ '--sign': theme.sign }}>
                  <span className="im-area-sign-icon">{grp.icon}</span>
                  {grp.label[lang] || grp.label.ja}
                </div>
                {/* デコ絵文字（左右交互・建物と反対側） */}
                {theme.deco.map((emoji, i) => (
                  <span
                    key={i}
                    className="im-deco"
                    aria-hidden="true"
                    style={{
                      top: `${HEADER_H + 22 + ((i * 137) % Math.max(height - HEADER_H - 60, 40))}px`,
                      left: i % 2 === 0 ? '84%' : '6%',
                      '--dur': `${3 + (i % 3)}s`,
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            );
          })}

          {/* 道 */}
          <svg
            className="im-road"
            viewBox={`0 0 100 ${layout.totalH}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={roadPath} className="im-road-under" vectorEffect="non-scaling-stroke" />
            <path d={roadPath} className="im-road-dash"  vectorEffect="non-scaling-stroke" />
          </svg>

          {/* START旗 */}
          <div className="im-start" aria-hidden="true">
            🚩 {UI_TEXT.start[lang] || UI_TEXT.start.ja}
          </div>

          {/* 建物（＝ゲーム） */}
          {layout.nodes.map(({ game, x, y }) => {
            const t = game[lang] || game.ja;
            return (
              <button
                key={game.id}
                className="im-house"
                style={{ left: `${x}%`, top: y, '--house-color': game.color }}
                onClick={(e) => onPlay(game, e)}
              >
                {game.isNew && <span className="im-house-new">NEW</span>}
                {game.hard  && <span className="im-house-hard">🔥</span>}
                <span className="im-house-roof" aria-hidden="true" />
                <span className="im-house-art">
                  {svgMap[game.id] || <span className="im-house-emoji">{game.icon}</span>}
                </span>
                <span className="im-house-name">{t.name}</span>
              </button>
            );
          })}

          {/* GOAL */}
          <div className="im-goal" aria-hidden="true">
            <span className="im-goal-crown">👑</span>
            <span className="im-goal-text">{UI_TEXT.goal[lang] || UI_TEXT.goal.ja}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
