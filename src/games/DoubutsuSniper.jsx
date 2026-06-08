import { useEffect } from 'react';

export default function DoubutsuSniper() {
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goBack') window.history.back();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <iframe
      src="/games/sniper_v2.html"
      style={{ width: '100%', height: '100dvh', border: 'none', display: 'block' }}
      title="どうぶつスナイパー"
    />
  );
}
