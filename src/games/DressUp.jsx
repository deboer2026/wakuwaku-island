import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIframeBridge } from '../hooks/useIframeBridge';
import HomeChip from '../components/HomeChip';
import '../seo/GameContent.css';

export default function DressUp() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  useIframeBridge(iframeRef);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goBack') navigate(-1);
      if (e.data?.type === 'goHome') navigate('/');
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
          src="/games/dressup_v2.html"
          title="きせかえプリンセス"
          allow="autoplay; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
        />
      </div>
    </div>
  );
}
