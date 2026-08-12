// src/components/RecommendedGames.jsx — 「つぎはこれであそぼう！」コンポーネント
import { useNavigate } from 'react-router-dom';
import { getRecommendedGames } from '../utils/recommend';
import { getLang } from '../utils/i18n';
import { transitionTo } from '../utils/transition';
import './RecommendedGames.css';

const LABELS = {
  title: { ja:'🎮 つぎはこれであそぼう！', en:'🎮 Play Next!', zh:'🎮 接下来玩这个！', ko:'🎮 다음에 이걸 해봐요!', es:'🎮 ¡Juega esto!' },
  play:  { ja:'あそぶ ▶', en:'Play ▶', zh:'去玩 ▶', ko:'플레이 ▶', es:'Jugar ▶' },
};

export default function RecommendedGames({ currentRoute }) {
  const navigate = useNavigate();
  const lang = getLang();
  const games = getRecommendedGames(currentRoute, 3);

  if (!games.length) return null;

  return (
    <div className="rec-wrap">
      <div className="rec-title">{LABELS.title[lang] || LABELS.title.ja}</div>
      <div className="rec-row">
        {games.map(g => (
          <button
            key={g.route}
            className="rec-card"
            onClick={(e) => transitionTo(navigate, g.route, e.clientX, e.clientY, { name:g[lang] || g.ja, category:g.category, sourceContext:'recommended' })}
          >
            <span className="rec-icon">{g.icon}</span>
            <span className="rec-name">{g[lang] || g.ja}</span>
            <span className="rec-play">{LABELS.play[lang] || LABELS.play.ja}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
