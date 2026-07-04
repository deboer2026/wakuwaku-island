import GAME_META from './gameMeta';
import HomeChip from '../components/HomeChip';
import './GameContent.css';

export default function GameContent({ route }) {
  const m = GAME_META[route];
  if (!m || !m.intro) return null;
  const ageMin = m.ageMin ?? 4;
  const ageMax = m.ageMax ?? 12;
  const related = Object.entries(GAME_META)
    .filter(([r, mm]) => r !== route && mm.category === m.category && mm.intro)
    .slice(0, 3);
  return (
    <section className="game-content" aria-label={`${m.name}の説明`}>
      <h1 className="gc-title">{m.name}</h1>
      <p className="gc-intro">{m.intro}</p>
      <ul className="gc-badges">
        <li className="gc-badge">対象 {ageMin}〜{ageMax}さい</li>
        <li className="gc-badge">かんぜん無料</li>
        <li className="gc-badge">登録・インストール不要</li>
      </ul>

      {m.howto && m.howto.length > 0 && (
        <div className="gc-block">
          <h2 className="gc-h2">あそびかた</h2>
          <ol className="gc-howto">
            {m.howto.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      {m.faq && m.faq.length > 0 && (
        <div className="gc-block">
          <h2 className="gc-h2">よくあるしつもん</h2>
          <dl className="gc-faq">
            {m.faq.map((f, i) => (
              <div key={i} className="gc-faq-item">
                <dt className="gc-q">{f.q}</dt>
                <dd className="gc-a">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {related.length > 0 && (
        <nav className="gc-related" aria-label="おなじジャンルのゲーム">
          <h2 className="gc-h2">おなじジャンルのゲーム</h2>
          <ul>
            {related.map(([r, mm]) => <li key={r}><a href={r}>{mm.name}</a></li>)}
          </ul>
        </nav>
      )}

      <p className="gc-back"><a href="/">← ほかのゲームをみる</a></p>
    </section>
  );
}
