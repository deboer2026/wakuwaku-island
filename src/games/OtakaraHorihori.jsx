import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIframeBridge } from '../hooks/useIframeBridge';
import GameContent from '../seo/GameContent';
import HomeChip from '../components/HomeChip';

export default function OtakaraHorihori() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  useIframeBridge(iframeRef);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goHome') { navigate('/'); return; }
      if (e.data?.type === 'goBack') {
        let internal = false;
        try { internal = sessionStorage.getItem('ww_nav_internal') === '1'; } catch {}
        navigate(internal ? -1 : '/');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  return (
    <div className="game-page">
      <div className="game-frame">
        <HomeChip />
        <iframe
          ref={iframeRef}
          src="/games/otakara_horihori_v2.html"
          title="おたからほりほり 3D"
          allow="autoplay; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
        />
      </div>
      <GameContent route="/otakara-horihori" />
    </div>
  );
}
