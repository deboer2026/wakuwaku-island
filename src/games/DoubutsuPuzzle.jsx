import { useEffect } from 'react';

export default function DoubutsuPuzzle() {
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goBack') window.history.back();
    if (e.data?.type === 'goHome') window.location.href = '/';
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <iframe
      src="/games/puzzle_v2.html"
      style={{ width: '100%', height: '100dvh', border: 'none', display: 'block' }}
      title="どうぶつパズル"
    />
  );
}
