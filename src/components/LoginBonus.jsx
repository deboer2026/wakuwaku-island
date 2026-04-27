import { useEffect, useRef } from 'react';
import './LoginBonus.css';

function spawnCoinRain(count = 8) {
  const emojis = ['🪙', '⭐', '✨', '💛'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.textContent = emojis[i % emojis.length];
    el.style.cssText = [
      'position:fixed',
      `left:${20 + Math.random() * 60}%`,
      `top:${10 + Math.random() * 30}%`,
      'font-size:24px',
      'pointer-events:none',
      'z-index:2100',
      `animation:lb-fly-up ${0.6 + Math.random() * 0.5}s ease ${i * 0.08}s forwards`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 1200);
  }
}

export default function LoginBonus({ bonus, streak, onClaim, lang }) {
  const claimedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => spawnCoinRain(), 300);
    return () => clearTimeout(timer);
  }, []);

  function handleClaim() {
    if (claimedRef.current) return;
    claimedRef.current = true;
    spawnCoinRain(12);
    onClaim();
  }

  const streakLabel = lang === 'en'
    ? `🔥 ${streak}-day streak!`
    : `🔥 ${streak}にちれんぞくログイン！`;

  const title = lang === 'en' ? '🎁 Daily Bonus!' : '🎁 きょうのぼーなす！';
  const btnLabel = lang === 'en' ? `Collect ${bonus} coins!` : `${bonus}まいうけとる！`;
  const coinsLabel = lang === 'en' ? 'coins' : 'まい';

  return (
    <div className="lb-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) handleClaim(); }}>
      <div className="lb-card">
        <div className="lb-header">LOGIN BONUS</div>
        <div className="lb-title">{title}</div>

        <div className="lb-coin-wrap">
          <span className="lb-coin">🪙</span>
        </div>

        <div className="lb-amount">+{bonus}</div>
        <div className="lb-amount-label">{coinsLabel}</div>

        <div className="lb-streak">{streakLabel}</div>

        <button className="lb-btn" onClick={handleClaim}>
          {btnLabel}
        </button>
      </div>
    </div>
  );
}
