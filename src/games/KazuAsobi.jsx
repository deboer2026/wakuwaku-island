import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIframeBridge } from '../hooks/useIframeBridge';

export default function KazuAsobi() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goBack') navigate(-1);
      if (e.data?.type === 'goHome') navigate('/');
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  useIframeBridge(iframeRef);

  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:0, overflow:'hidden' }}>
      <iframe
        ref={iframeRef}
        src="/games/kazu_asobi_v2.html"
        style={{ width:'100%', height:'100%', border:'none', display:'block', position:'absolute', top:0, left:0 }}
        title="かずあそび"
        allow="autoplay; fullscreen"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
