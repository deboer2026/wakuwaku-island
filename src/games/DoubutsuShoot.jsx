import { useEffect } from 'react';

export default function DoubutsuShoot() {
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goBack') window.history.back();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <iframe
      src="/games/shoot2.html"
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      title="どうぶつシューティング"
    />
  );
}
