import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIframeBridge } from '../hooks/useIframeBridge';
import GameContent from '../seo/GameContent';
import HomeChip from '../components/HomeChip';

export default function OkashiCrossing() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [showPad, setShowPad] = useState(false);
  useIframeBridge(iframeRef);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goHome') { navigate('/'); return; }
      if (e.data?.type === 'goBack') {
        let internal = false;
        try { internal = sessionStorage.getItem('ww_nav_internal') === '1'; } catch { /* storage is optional */ }
        navigate(internal ? -1 : '/');
        return;
      }
      if (e.data?.type === 'okashi-crossing-running') setShowPad(!!e.data.running);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  const send = useCallback((dir) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'okashi-move', dir }, '*');
  }, []);
  const press = useCallback((dir) => (e) => { e.preventDefault(); send(dir); }, [send]);

  const pad = {
    position: 'fixed',
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
    right: 'calc(env(safe-area-inset-right, 0px) + 12px)',
    display: 'grid', gridTemplateColumns: 'repeat(3, 46px)', gridTemplateRows: 'repeat(3, 46px)',
    gap: '4px', zIndex: 10000, touchAction: 'none',
  };
  const btn = {
    border: 'none', borderRadius: 11, fontSize: 20, fontWeight: 800, color: '#2f4a72',
    background: 'rgba(255,255,255,0.5)', WebkitBackdropFilter: 'blur(2px)', backdropFilter: 'blur(2px)',
    boxShadow: '0 2px 0 rgba(120,150,190,.5)', touchAction: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none',
  };

  return (
    <div className="game-page">
      <div className="game-frame">
        <HomeChip />
        <iframe
          ref={iframeRef}
          src="/games/okashi_crossing.html"
          title="ぴょんぴょん！おかしのくに"
          allow="autoplay; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
        />
        {showPad && (
          <div style={pad}>
            <button style={{ ...btn, gridColumn: 2, gridRow: 1 }} onPointerDown={press('up')} aria-label="まえ">▲</button>
            <button style={{ ...btn, gridColumn: 1, gridRow: 2 }} onPointerDown={press('left')} aria-label="ひだり">◀</button>
            <button style={{ ...btn, gridColumn: 3, gridRow: 2 }} onPointerDown={press('right')} aria-label="みぎ">▶</button>
            <button style={{ ...btn, gridColumn: 2, gridRow: 3 }} onPointerDown={press('down')} aria-label="うしろ">▼</button>
          </div>
        )}
      </div>
      <GameContent route="/okashi-crossing" />
    </div>
  );
}
