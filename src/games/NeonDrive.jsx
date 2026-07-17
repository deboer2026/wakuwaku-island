import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIframeBridge } from '../hooks/useIframeBridge';
import { useGameNav } from '../hooks/useGameNav';
import GameContent from '../seo/GameContent';
import HomeChip from '../components/HomeChip';

export default function NeonDrive() {
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
          src="/games/neon_drive_v1.html"
          title="きらきらドライブ"
          allow="autoplay; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
      <GameContent route="/neon-drive" />
    </div>
  );
}
