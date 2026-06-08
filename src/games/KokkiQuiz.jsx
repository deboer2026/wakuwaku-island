import { useEffect } from 'react';

export default function KokkiQuiz() {
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goBack') window.history.back();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <iframe
      src="/games/flag_quiz.html"
      style={{ width: '100%', height: '100dvh', border: 'none', display: 'block' }}
      title="こっきクイズ"
    />
  );
}
