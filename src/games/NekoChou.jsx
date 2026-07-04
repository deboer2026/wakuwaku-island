import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIframeBridge } from '../hooks/useIframeBridge';
import { useGameNav } from '../hooks/useGameNav';
import GameContent from '../seo/GameContent';
import HomeChip from '../components/HomeChip';

export default function NekoChou() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  useGameNav(navigate);
  useIframeBridge(iframeRef);

  return (
    <div className="game-page">
      <div className="game-frame">
        <HomeChip />
        <iframe
          ref={iframeRef}
          src="/games/neko_chou_v1.html"
          title="ねことちょうちょ"
          allow="autoplay; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
        />
      </div>
      <GameContent route="/neko-chou" />
    </div>
  );
}
