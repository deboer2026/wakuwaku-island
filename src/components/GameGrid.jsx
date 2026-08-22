import { useState } from 'react';

/* ════════════════════════════════════════════════════
   カテゴリアイコン（絵で選べるように・絵文字は使わない）
════════════════════════════════════════════════════ */
function CategoryIcon({ catKey }) {
  switch (catKey) {
    case 'asobu': return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2 L6 13 L11 13 L9 22 L19 10 L13.5 10 Z" fill="#F2A02E" /></svg>
    );
    case 'nerau': return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#F2647F" strokeWidth="2.6" /><circle cx="12" cy="12" r="4" fill="#F2647F" /></svg>
    );
    case 'race': return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="6" width="9" height="6" rx="2" fill="#3E92D4" /><rect x="4" y="11" width="17" height="6" rx="3" fill="#5FB3EC" /><circle cx="8" cy="18.5" r="2.6" fill="#2E3560" /><circle cx="17" cy="18.5" r="2.6" fill="#2E3560" /></svg>
    );
    case 'kangaeru': return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 A7 7 0 0 1 16 15 L16 18 L8 18 L8 15 A7 7 0 0 1 12 2 Z" fill="#8E6FC4" /><rect x="8.5" y="19" width="7" height="3" rx="1.5" fill="#B49BE0" /></svg>
    );
    case 'tsukuru': return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20 L14 3 L18 11 L15 11 L20 20 Z" fill="#4CAF6E" /><circle cx="6" cy="7" r="3" fill="#8FD9A6" /></svg>
    );
    case 'manabu': return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4 h7 a2 2 0 0 1 2 2 v14 a3 3 0 0 0-3-2 H3 Z" fill="#E29B14" /><path d="M21 4 h-7 a2 2 0 0 0-2 2 v14 a3 3 0 0 1 3-2 h6 Z" fill="#FFC94A" /></svg>
    );
    default: return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="7" r="4" fill="#F2A02E" /><circle cx="17" cy="7" r="4" fill="#F2647F" /><circle cx="7" cy="17" r="4" fill="#4CAF6E" /><circle cx="17" cy="17" r="4" fill="#3E92D4" /></svg>
    );
  }
}

function StarIcon() {
  return <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1.4 L8.7 5 L12.6 5.4 L9.7 8 L10.6 11.9 L7 9.8 L3.4 11.9 L4.3 8 L1.4 5.4 L5.3 5 Z" fill="#F2647F" /></svg>;
}
function PlayFabIcon() {
  return <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2 L12 7 L4 12 Z" fill="#F2647F" /></svg>;
}
function PlaceholderThumb() {
  return (
    <div className="game-thumb-ph">
      <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5 L19 12 L8 19 Z" fill="#fff" opacity=".85" /></svg>
    </div>
  );
}
function DiceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#8E6FC4" />
      <circle cx="8.5" cy="8.5" r="1.6" fill="#fff" /><circle cx="15.5" cy="8.5" r="1.6" fill="#fff" />
      <circle cx="12" cy="12" r="1.6" fill="#fff" />
      <circle cx="8.5" cy="15.5" r="1.6" fill="#fff" /><circle cx="15.5" cy="15.5" r="1.6" fill="#fff" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4 h7 a2 2 0 0 1 2 2 v14 a3 3 0 0 0-3-2 H3 Z" fill="#E29B14" />
      <path d="M21 4 h-7 a2 2 0 0 0-2 2 v14 a3 3 0 0 1 3-2 h6 Z" fill="#FFC94A" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   ゲームカード（実ゲームスクリーンショットが主役・4:3）
════════════════════════════════════════════════════ */
function GameCard({ game, lang, played, thumbFor, ageText, cardGradients, defaultGradient, gameSvgs, onPlay }) {
  const t = game[lang] || game.ja;
  const thumb = thumbFor(game);
  const gradient = cardGradients[game.category] || defaultGradient;

  function handleClick(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onPlay(game, e);
  }

  return (
    <a
      href={game.route}
      className="game-card"
      aria-label={`${t.name} であそぶ`}
      onClick={handleClick}
    >
      <div className="game-thumb" style={{ background: gradient }}>
        {thumb ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const sib = e.currentTarget.nextElementSibling;
              if (sib) sib.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="game-thumb-fallback" style={{ display: thumb ? 'none' : 'flex' }}>
          {gameSvgs[game.id] || <PlaceholderThumb />}
        </div>
        {game.isNew ? (
          <span className="badge-new">NEW</span>
        ) : played ? (
          <span className="badge-played">{{ja:'あそんだ', en:'Played', zh:'玩过', ko:'플레이함', es:'Jugado'}[lang] || 'あそんだ'}</span>
        ) : null}
        <span className="play-fab" aria-hidden="true"><PlayFabIcon /></span>
      </div>
      <div className="game-body">
        <b>{t.name}</b>
        <div className="game-foot">
          <span className="age">{ageText(game, lang)}</span>
        </div>
      </div>
    </a>
  );
}

const T = {
  heading:  { ja: 'あそびたいのを えらんでね', en: 'Pick a game to play', zh: '选一个想玩的游戏吧', ko: '하고 싶은 게임을 골라봐', es: 'Elige un juego para jugar' },
  count:    { ja: 'この ゲームが あそべるよ', en: ' games ready to play', zh: '款游戏可以玩', ko: '개의 게임을 즐길 수 있어요', es: ' juegos disponibles' },
  empty:    { ja: 'この えらびかたでは まだ ないよ', en: 'No games match yet', zh: '这个条件下还没有游戏', ko: '이 조건에는 아직 게임이 없어요', es: 'Aún no hay juegos con esta selección' },
  fun:      { ja: 'おたのしみ', en: 'More fun', zh: '更多乐趣', ko: '더 즐기기', es: 'Más diversión' },
  roulette: { ja: 'おまかせ', en: 'Surprise me', zh: '随便选一个', ko: '아무거나 골라줘', es: 'Sorpréndeme' },
  zukan:    { ja: 'ずかん', en: 'Stamp book', zh: '图鉴', ko: '도감', es: 'Álbum' },
  catAria:  { ja: 'カテゴリ', en: 'Category', zh: '分类', ko: '카테고리', es: 'Categoría' },
};
const tt = (lang, key) => T[key][lang] || T[key].ja;

export default function GameGrid({
  lang, games, playHist, categories, subFilters,
  thumbFor, ageText, cardGradients, defaultGradient, gameSvgs,
  onPlay, onOpenRoulette, onOpenZukan,
}) {
  const [catKey, setCatKey] = useState('all');
  const [subKey, setSubKey] = useState('all');

  const cat = categories.find(c => c.key === catKey) || categories[0];
  const sub = subFilters.find(s => s.key === subKey) || subFilters[0];
  const list = games.filter(g => cat.match(g) && sub.match(g));

  return (
    <section className="game-list" id="games">
      <div className="game-list-head">
        <h2>{tt(lang, 'heading')}</h2>
        <p>{list.length}{tt(lang, 'count')}</p>
      </div>

      <div className="cats" role="tablist" aria-label={tt(lang, 'catAria')}>
        {categories.map(c => (
          <button
            key={c.key}
            role="tab"
            className="cat"
            aria-pressed={catKey === c.key}
            aria-label={`${c.label[lang] || c.label.ja} ${games.filter(c.match).length}`}
            onClick={() => setCatKey(c.key)}
          >
            <span className="ci"><CategoryIcon catKey={c.key} /></span>
            {c.label[lang] || c.label.ja}
          </button>
        ))}
      </div>

      <div className="filters" role="tablist" aria-label={lang === 'ja' ? 'しぼりこみ' : 'Filter'}>
        {subFilters.map(f => (
          <button
            key={f.key}
            role="tab"
            className="chip"
            aria-pressed={subKey === f.key}
            onClick={() => setSubKey(f.key)}
          >
            {f.key === 'new' && <StarIcon />}
            {f.label[lang] || f.label.ja}
          </button>
        ))}
      </div>

      <div className="fun-row">
        <span className="fun-row-label">{tt(lang, 'fun')}</span>
        <button className="fun-btn" onClick={onOpenRoulette}>
          <DiceIcon />{tt(lang, 'roulette')}
        </button>
        <button className="fun-btn" onClick={onOpenZukan}>
          <BookIcon />{tt(lang, 'zukan')}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="empty">{tt(lang, 'empty')}</div>
      ) : (
        <div className="game-grid">
          {list.map(game => (
            <GameCard
              key={game.id}
              game={game}
              lang={lang}
              played={!!playHist[game.route]}
              thumbFor={thumbFor}
              ageText={ageText}
              cardGradients={cardGradients}
              defaultGradient={defaultGradient}
              gameSvgs={gameSvgs}
              onPlay={onPlay}
            />
          ))}
        </div>
      )}
    </section>
  );
}
