import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DressUp() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goBack') navigate(-1);
      if (e.data?.type === 'goHome') navigate('/');
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 0,
      overflow: 'hidden'
    }}>
      <iframe
        src="/games/dressup_v2.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        title="きせかえプリンセス"
        allow="autoplay; fullscreen"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
      />
    </div>
  );
}
