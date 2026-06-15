import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MojiAsobi() {
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

  useEffect(() => {
    const notify = () => {
      const landscapePhone =
        window.innerWidth > window.innerHeight &&
        Math.min(window.innerWidth, window.innerHeight) < 500;
      const f = iframeRef.current;
      if (f && f.contentWindow) {
        f.contentWindow.postMessage({ type: 'orientation', landscapePhone }, '*');
      }
    };
    window.addEventListener('resize', notify);
    window.addEventListener('orientationchange', () => setTimeout(notify, 250));
    const f = iframeRef.current;
    if (f) f.addEventListener('load', () => setTimeout(notify, 300));
    notify();
    setTimeout(notify, 500);
    return () => window.removeEventListener('resize', notify);
  }, []);

  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:0, overflow:'hidden' }}>
      <iframe
        ref={iframeRef}
        src="/games/moji_asobi_v2.html"
        style={{ width:'100%', height:'100%', border:'none', display:'block', position:'absolute', top:0, left:0 }}
        title="もじあそび"
        allow="autoplay; fullscreen"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
