import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIframeBridge } from '../hooks/useIframeBridge';

export default function DoubutsuCrossing() {
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

  const send = (dir) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'crossing-move', dir }, '*');
  };
  const press = (dir) => (e) => { e.preventDefault(); send(dir); };

  const pad = {
    position: 'fixed',
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
    left: '50%', transform: 'translateX(-50%)',
    display: 'grid', gridTemplateColumns: 'repeat(3, 58px)', gridTemplateRows: 'repeat(3, 58px)',
    gap: '6px', zIndex: 10000, touchAction: 'none',
  };
  const btn = {
    border: 'none', borderRadius: 14, fontSize: 26, fontWeight: 800, color: '#34507a',
    background: 'linear-gradient(180deg,#ffffff,#e9f0fb)',
    boxShadow: '0 4px 0 #b9cce4, inset 0 1px 0 #fff', touchAction: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src="/games/crossing_v3.html"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block', position: 'absolute', top: 0, left: 0 }}
        title="どうぶつクロッシング"
        allow="autoplay; fullscreen"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
      />
      <div style={pad}>
        <button style={{ ...btn, gridColumn: 2, gridRow: 1 }} onPointerDown={press('up')} aria-label="まえ">▲</button>
        <button style={{ ...btn, gridColumn: 1, gridRow: 2 }} onPointerDown={press('left')} aria-label="ひだり">◀</button>
        <button style={{ ...btn, gridColumn: 3, gridRow: 2 }} onPointerDown={press('right')} aria-label="みぎ">▶</button>
        <button style={{ ...btn, gridColumn: 2, gridRow: 3 }} onPointerDown={press('down')} aria-label="うしろ">▼</button>
      </div>
    </div>
  );
}
