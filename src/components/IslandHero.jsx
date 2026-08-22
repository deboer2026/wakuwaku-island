import React, { useEffect, useRef, useState } from 'react';
import { KisekaeCharacters } from './Kisekae';

/* ════════════════════════════════════════════════════
   時間帯・季節の判定（マウント後にのみ端末時計を読む）
════════════════════════════════════════════════════ */
function todFromHour(h) {
  if (h < 5)  return 'tod-night';
  if (h < 8)  return 'tod-dawn';
  if (h < 16) return 'tod-day';
  if (h < 19) return 'tod-sunset';
  return 'tod-night';
}

const SEASON_FX = {
  spring: { n: 14, up: false, dur: [11, 18], size: [9, 15] },
  summer: { n: 16, up: true,  dur: [9, 16],  size: [6, 13] },
  autumn: { n: 13, up: false, dur: [10, 17], size: [10, 17] },
  winter: { n: 18, up: false, dur: [13, 22], size: [6, 12] },
};

function seasonFromMonth(m) {
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

function buildParticles(season) {
  const cfg = SEASON_FX[season];
  if (!cfg) return [];
  const out = [];
  for (let i = 0; i < cfg.n; i++) {
    const size = cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]);
    const dur  = cfg.dur[0]  + Math.random() * (cfg.dur[1]  - cfg.dur[0]);
    out.push({
      id: `${season}-${i}`,
      up: cfg.up,
      left: `${(Math.random() * 100).toFixed(1)}%`,
      size: size.toFixed(1),
      opacity: (0.5 + Math.random() * 0.5).toFixed(2),
      dur: `${dur.toFixed(1)}s`,
      delay: `${(-Math.random() * dur).toFixed(1)}s`,
      dx: `${(Math.random() * 90 - 45).toFixed(0)}px`,
      rot: `${(Math.random() * 620 - 310).toFixed(0)}deg`,
    });
  }
  return out;
}

function SeasonMark({ season }) {
  if (season === 'spring') return (
    <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true">
      <path d="M8 1 C11 3 14 6 12 10 C10 14 6 15 4 12 C2 9 4 4 8 1 Z" fill="#FFC2D8" />
      <path d="M8 1 C9.6 4 9.4 8 6.6 12 C6 13 4.8 13.4 4 12 C6 9 6.6 5 8 1 Z" fill="#FFE0EC" />
    </svg>
  );
  if (season === 'summer') return (
    <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="rgba(255,255,255,.5)" />
      <circle cx="8" cy="8" r="7" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".8" />
      <circle cx="5.6" cy="5.6" r="1.8" fill="#fff" />
    </svg>
  );
  if (season === 'autumn') return (
    <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true">
      <path d="M8 1 C11.5 4 14 7 12 11 C10.4 14.2 5.6 14.2 4 11 C2 7 4.5 4 8 1 Z" fill="#F2A02E" />
      <path d="M8 2 L8 14" stroke="#C97A18" strokeWidth="1.1" />
      <path d="M8 6 L11 4 M8 9 L11.6 7.6 M8 6 L5 4 M8 9 L4.4 7.6" stroke="#C97A18" strokeWidth=".9" fill="none" />
    </svg>
  );
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true">
      <g stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8 1.5 V14.5" />
        <path d="M2.2 4.8 L13.8 11.2" />
        <path d="M13.8 4.8 L2.2 11.2" />
        <path d="M8 4.4 L6 2.8 M8 4.4 L10 2.8 M8 11.6 L6 13.2 M8 11.6 L10 13.2" />
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   ロゴ（丸ゴシックBlack・多重ストローク押し出し）
════════════════════════════════════════════════════ */
function IslandLogo() {
  const pushA = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  const pushB = [8, 7, 6, 5, 4, 3, 2, 1];
  return (
    <svg className="hero-logo-svg" viewBox="0 0 420 196" xmlnsXlink="http://www.w3.org/1999/xlink" role="img" aria-label="わくわくアイランド">
      <defs>
        <linearGradient id="hlFillA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF7D4" /><stop offset="46%" stopColor="#FFDD74" />
          <stop offset="100%" stopColor="#FFB92E" />
        </linearGradient>
        <linearGradient id="hlFillB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset="40%" stopColor="#CDEBFF" />
          <stop offset="100%" stopColor="#57A9E0" />
        </linearGradient>
        <radialGradient id="hlGlow" cx="50%" cy="46%" r="54%">
          <stop offset="0" stopColor="#fff" stopOpacity=".8" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <path id="hlArc" d="M32 92 Q210 32 388 92" />
        <clipPath id="hlGlossA"><rect x="0" y="0" width="420" height="66" /></clipPath>
        <clipPath id="hlGlossB"><rect x="0" y="0" width="420" height="142" /></clipPath>
      </defs>

      <ellipse cx="210" cy="92" rx="206" ry="86" fill="url(#hlGlow)" />

      {/* わくわく */}
      <g>
        {pushA.map(n => (
          <text key={`a${n}`} fontSize="64" letterSpacing="1" transform={`translate(0,${n})`}
            fill="#C98510" stroke="#C98510" strokeWidth="18" strokeLinejoin="round" paintOrder="stroke">
            <textPath href="#hlArc" xlinkHref="#hlArc" startOffset="50%" textAnchor="middle">わくわく</textPath>
          </text>
        ))}
        <text fontSize="64" letterSpacing="1" fill="#242E63" stroke="#242E63" strokeWidth="18" strokeLinejoin="round" paintOrder="stroke">
          <textPath href="#hlArc" xlinkHref="#hlArc" startOffset="50%" textAnchor="middle">わくわく</textPath>
        </text>
        <text fontSize="64" letterSpacing="1" fill="#ffffff" stroke="#ffffff" strokeWidth="8" strokeLinejoin="round" paintOrder="stroke">
          <textPath href="#hlArc" xlinkHref="#hlArc" startOffset="50%" textAnchor="middle">わくわく</textPath>
        </text>
        <text fontSize="64" letterSpacing="1" fill="url(#hlFillA)">
          <textPath href="#hlArc" xlinkHref="#hlArc" startOffset="50%" textAnchor="middle">わくわく</textPath>
        </text>
        <g clipPath="url(#hlGlossA)">
          <text fontSize="64" letterSpacing="1" fill="#FFFFFF" opacity=".55">
            <textPath href="#hlArc" xlinkHref="#hlArc" startOffset="50%" textAnchor="middle">わくわく</textPath>
          </text>
        </g>
      </g>

      {/* アイランド */}
      <g transform="translate(210,168)">
        {pushB.map(n => (
          <text key={`b${n}`} textAnchor="middle" fontSize="50" y={n}
            fill="#2F4E8C" stroke="#2F4E8C" strokeWidth="16" strokeLinejoin="round" paintOrder="stroke">アイランド</text>
        ))}
        <text textAnchor="middle" fontSize="50" fill="#242E63" stroke="#242E63" strokeWidth="16" strokeLinejoin="round" paintOrder="stroke">アイランド</text>
        <text textAnchor="middle" fontSize="50" fill="#ffffff" stroke="#ffffff" strokeWidth="7" strokeLinejoin="round" paintOrder="stroke">アイランド</text>
        <text textAnchor="middle" fontSize="50" fill="url(#hlFillB)">アイランド</text>
      </g>
      <g clipPath="url(#hlGlossB)">
        <text x="210" y="168" textAnchor="middle" fontSize="50" fill="#FFFFFF" opacity=".34">アイランド</text>
      </g>

      {/* 島マーク */}
      <g transform="translate(28,160)">
        <ellipse cx="0" cy="6" rx="20" ry="7" fill="#FBE2B0" />
        <ellipse cx="0" cy="3" rx="13" ry="5" fill="#7FD06A" />
        <path d="M0 3 Q-3 -10 2 -19" stroke="#B98A50" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <g fill="#4FB553">
          <path d="M2 -19 Q-10 -24 -15 -17 Q-7 -20 2 -16 Z" />
          <path d="M2 -19 Q14 -25 19 -18 Q10 -21 4 -16 Z" />
          <path d="M2 -19 Q-4 -30 2 -35 Q5 -28 5 -19 Z" />
        </g>
      </g>
      <g transform="translate(392,160) scale(-1,1)">
        <ellipse cx="0" cy="6" rx="20" ry="7" fill="#FBE2B0" />
        <ellipse cx="0" cy="3" rx="13" ry="5" fill="#7FD06A" />
        <path d="M0 3 Q-3 -10 2 -19" stroke="#B98A50" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <g fill="#4FB553">
          <path d="M2 -19 Q-10 -24 -15 -17 Q-7 -20 2 -16 Z" />
          <path d="M2 -19 Q14 -25 19 -18 Q10 -21 4 -16 Z" />
          <path d="M2 -19 Q-4 -30 2 -35 Q5 -28 5 -19 Z" />
        </g>
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════════════════
   アイコン（絵文字なし・SVGのみ）
════════════════════════════════════════════════════ */
function CoinIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="12" fill="#E29B14" />
      <circle cx="13" cy="12" r="10.5" fill="#FFD24A" />
      <circle cx="13" cy="12" r="7.6" fill="#FFE894" />
      <path d="M13 7 L14.5 10.6 L18.4 10.9 L15.4 13.4 L16.4 17.2 L13 15.1 L9.6 17.2 L10.6 13.4 L7.6 10.9 L11.5 10.6 Z" fill="#E8A61B" />
    </svg>
  );
}
function DressIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 26 26" aria-hidden="true">
      <path d="M9 4 L13 7 L17 4 L22 8 L19 11 L19 22 L7 22 L7 11 L4 8 Z" fill="#FF9EC0" />
      <path d="M13 7 L17 4 L22 8 L19 11 Z" fill="#FFC2D8" />
      <circle cx="13" cy="14" r="2" fill="#fff" />
    </svg>
  );
}
function FamilyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="10" cy="9" r="4.2" fill="#7B8BD4" />
      <circle cx="17.5" cy="10.5" r="3.2" fill="#A8B4E6" />
      <path d="M3 21 Q3 14 10 14 Q17 14 17 21 Z" fill="#7B8BD4" />
      <path d="M14 21 Q14 16 17.5 16 Q23 16 23 21 Z" fill="#A8B4E6" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 3 L11 8 L5 13" stroke="#8A93BD" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlayGlyph({ fill = '#fff' }) {
  return <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M5 3 L19 11 L5 19 Z" fill={fill} /></svg>;
}
function ResumeFaceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="9" fill="#fff" opacity=".92" />
      <circle cx="10" cy="11" r="1.8" fill="#3A3050" /><circle cx="16" cy="11" r="1.8" fill="#3A3050" />
      <path d="M10 16 Q13 19 16 16" stroke="#D4667F" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
      <path d="M3 3 L10 9 L17 3" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const T = {
  welcome:    { ja: 'きみが くるのを まってたよ！', en: 'We were waiting for you!', zh: '我们一直在等你哦！', ko: '너를 기다리고 있었어!', es: '¡Te estábamos esperando!' },
  cta:        { ja: 'しまへ わたる', en: 'Go to the island', zh: '前往小岛', ko: '섬으로 가기', es: 'Ir a la isla' },
  scrollHint: { ja: 'したに ぜんぶ あるよ', en: 'Everything is below', zh: '全部都在下面哦', ko: '아래에 다 있어요', es: 'Todo está abajo' },
  resume:     { ja: 'つづきから', en: 'Continue', zh: '继续游戏', ko: '이어하기', es: 'Continuar' },
  coinExchange:{ ja: 'コインでこうかん', en: 'Coin exchange', zh: '金币兑换', ko: '코인 교환', es: 'Canjear monedas' },
  dressUp:    { ja: 'きせかえ', en: 'Dress up', zh: '换装', ko: '옷 갈아입기', es: 'Vestir' },
  forFamily:  { ja: 'おうちの人', en: 'For families', zh: '给家长', ko: '보호자', es: 'Para familias' },
};
const tt = (lang, key) => T[key][lang] || T[key].ja;

export default function IslandHero({
  lang, coins, resumeGame, onCoinChipClick, onDressUpClick, onFamilyClick,
  onResumeClick, onCtaClick, kisekaeState, onOpenKisekaeChara,
}) {
  const heroRef = useRef(null);
  const [timeTheme, setTimeTheme] = useState('tod-day');
  const [particles, setParticles] = useState([]);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    const now = new Date();
    const theme = todFromHour(now.getHours());
    setTimeTheme(theme);
    setShowStars(theme === 'tod-night');

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      setParticles(buildParticles(seasonFromMonth(now.getMonth() + 1)));
    }
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hero = heroRef.current;
    if (reduce || !hero) return undefined;

    const layers = Array.prototype.slice.call(hero.querySelectorAll('.layer'));
    let scrollY = 0, tiltX = 0, tiltY = 0, raf = null;

    function apply() {
      raf = null;
      for (const el of layers) {
        const d = parseFloat(el.getAttribute('data-depth')) || 0;
        const ty = -scrollY * d * 0.4;
        const tx = tiltX * d * 20;
        const vy = tiltY * d * 7;
        el.style.transform = `translate3d(${tx.toFixed(2)}px,${(ty + vy).toFixed(2)}px,0)`;
      }
    }
    function request() { if (!raf) raf = requestAnimationFrame(apply); }

    function onScroll() {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY < window.innerHeight * 1.2) request();
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    let onMove, onLeave;
    const pointerFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (pointerFine) {
      onMove = (e) => {
        const r = hero.getBoundingClientRect();
        tiltX = ((e.clientX - r.left) / r.width - 0.5) * -1;
        tiltY = ((e.clientY - r.top) / r.height - 0.5) * -1;
        request();
      };
      onLeave = () => { tiltX = 0; tiltY = 0; request(); };
      hero.addEventListener('pointermove', onMove, { passive: true });
      hero.addEventListener('pointerleave', onLeave, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (onMove) hero.removeEventListener('pointermove', onMove);
      if (onLeave) hero.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const resumeName = resumeGame ? (resumeGame[lang] || resumeGame.ja).name : null;

  return (
    <section className={`hero ${timeTheme}`} id="hero" ref={heroRef}>
      {/* 星（夜のみ） */}
      <div className={`layer l-sun hero-stars${showStars ? ' hero-stars--on' : ''}`} data-depth="0.03" style={{ height: '46%' }} aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 380 340" preserveAspectRatio="none">
          <g fill="#FFFFFF">
            <circle className="hero-star" cx="42" cy="46" r="2.2" />
            <circle className="hero-star" cx="118" cy="28" r="1.6" style={{ animationDelay: '.6s' }} />
            <circle className="hero-star" cx="196" cy="62" r="2.4" style={{ animationDelay: '1.2s' }} />
            <circle className="hero-star" cx="262" cy="34" r="1.8" style={{ animationDelay: '.3s' }} />
            <circle className="hero-star" cx="330" cy="72" r="2.2" style={{ animationDelay: '1.7s' }} />
            <circle className="hero-star" cx="76" cy="122" r="1.7" style={{ animationDelay: '2.1s' }} />
            <circle className="hero-star" cx="158" cy="146" r="2.1" style={{ animationDelay: '.9s' }} />
            <circle className="hero-star" cx="244" cy="126" r="1.6" style={{ animationDelay: '1.5s' }} />
            <circle className="hero-star" cx="312" cy="166" r="2.3" style={{ animationDelay: '.2s' }} />
          </g>
        </svg>
      </div>

      {/* 季節パーティクル */}
      <div className="layer l-particles" data-depth="0.16" aria-hidden="true">
        {particles.map(p => (
          <span
            key={p.id}
            className={`hero-pt${p.up ? ' hero-pt--up' : ''}`}
            style={{
              left: p.left, width: `${p.size}px`, height: `${p.size}px`, opacity: p.opacity,
              animationDuration: p.dur, animationDelay: p.delay, '--dx': p.dx, '--rot': p.rot,
            }}
          >
            <SeasonMark season={seasonFromMonth(new Date().getMonth() + 1)} />
          </span>
        ))}
      </div>

      {/* 太陽/月 */}
      <div className="layer l-sun" data-depth="0.05" aria-hidden="true">
        <div className="hero-sun-wrap">
          <svg className="hero-sun-rays" viewBox="0 0 170 170">
            <g fill="rgba(255,244,205,.34)">
              <path d="M85 12 Q92 48 85 60 Q78 48 85 12 Z" /><path d="M85 158 Q78 122 85 110 Q92 122 85 158 Z" />
              <path d="M12 85 Q48 78 60 85 Q48 92 12 85 Z" /><path d="M158 85 Q122 92 110 85 Q122 78 158 85 Z" />
              <path d="M33 33 Q62 56 66 66 Q56 62 33 33 Z" /><path d="M137 137 Q108 114 104 104 Q114 108 137 137 Z" />
              <path d="M137 33 Q114 62 104 66 Q108 56 137 33 Z" /><path d="M33 137 Q56 108 66 104 Q62 114 33 137 Z" />
            </g>
          </svg>
          <div className="hero-sun-core" />
        </div>
      </div>

      {/* 遠景の雲・鳥 */}
      <div className="layer l-cloud-far" data-depth="0.10" aria-hidden="true">
        <div className="hero-cloud hero-cloud--far">
          <svg width="120" height="46" viewBox="0 0 120 46">
            <g fill="#fff" opacity=".62">
              <ellipse cx="36" cy="30" rx="32" ry="14" /><ellipse cx="66" cy="24" rx="27" ry="18" /><ellipse cx="92" cy="31" rx="22" ry="12" />
            </g>
          </svg>
        </div>
        <div className="hero-bird">
          <svg width="28" height="13" viewBox="0 0 28 13">
            <g className="hero-bird-wing" fill="none" stroke="#4E77A8" strokeWidth="2.2" strokeLinecap="round" opacity=".7">
              <path d="M2 8 Q7 2 12 8" /><path d="M15 8 Q20 2 25 8" />
            </g>
          </svg>
        </div>
      </div>

      {/* コピー */}
      <div className="hero-copy">
        <span className="hero-welcome">{tt(lang, 'welcome')}</span>
        <div className="hero-logo-wrap"><IslandLogo /></div>
      </div>

      {/* 海 */}
      <div className="layer l-sea" data-depth="0.30" aria-hidden="true">
        <div className="hero-sea-haze" />
        {[16, 46, 82, 130].map((top, i) => (
          <div key={i} className="hero-wave-band" style={{ top: `${top}px` }}>
            <svg width="100%" height="22" viewBox="0 0 400 22" preserveAspectRatio="none">
              <path d="M0 12 Q25 4 50 12 T100 12 T150 12 T200 12 T250 12 T300 12 T350 12 T400 12 V22 H0 Z" fill={`rgba(255,255,255,${0.5 - i * 0.1})`} />
            </svg>
          </div>
        ))}
      </div>

      {/* 近景の雲 */}
      <div className="layer l-cloud-near" data-depth="0.24" aria-hidden="true">
        <div className="hero-cloud hero-cloud--near">
          <svg width="150" height="52" viewBox="0 0 150 52">
            <g fill="#fff"><ellipse cx="42" cy="38" rx="38" ry="14" /><ellipse cx="80" cy="30" rx="32" ry="19" /><ellipse cx="112" cy="39" rx="26" ry="13" /></g>
          </svg>
        </div>
      </div>

      {/* 島 */}
      <div className="layer l-island" data-depth="0.52">
        <div className="hero-island-stage">
          <svg className="hero-island-svg" viewBox="0 0 600 400" aria-hidden="true">
            <defs>
              <linearGradient id="hiGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ACEC8A" /><stop offset="1" stopColor="#5CBB4C" /></linearGradient>
              <linearGradient id="hiSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FEF0D8" /><stop offset="1" stopColor="#E9BE76" /></linearGradient>
              <linearGradient id="hiCastle" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EBD5E8" /></linearGradient>
              <linearGradient id="hiRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FDC0DE" /><stop offset="1" stopColor="#D2739F" /></linearGradient>
              <linearGradient id="hiPier" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D6A46A" /><stop offset="1" stopColor="#B07E48" /></linearGradient>
            </defs>

            <ellipse cx="300" cy="292" rx="292" ry="62" fill="#8FE0F5" opacity=".55" />
            <ellipse cx="300" cy="290" rx="256" ry="52" fill="#BDEFFA" opacity=".6" />
            <ellipse cx="300" cy="288" rx="228" ry="42" fill="rgba(14,100,148,.2)" />

            <path d="M74 258 Q112 206 190 194 Q248 184 300 184 Q352 184 410 194 Q488 206 526 258 Q460 302 300 302 Q140 302 74 258 Z" fill="url(#hiSand)" />
            <path d="M112 252 Q160 216 230 206 Q286 199 340 205 Q416 214 476 248 Q412 268 300 270 Q188 272 112 252 Z" fill="#FFF6E0" opacity=".55" />

            <path d="M112 238 Q152 194 222 184 Q266 177 300 177 Q336 177 380 185 Q450 195 488 238 Q426 266 300 266 Q174 266 112 238 Z" fill="url(#hiGrass)" />
            <path d="M144 230 Q184 200 240 192 Q282 187 318 189 Q272 206 224 214 Q180 222 144 230 Z" fill="#CBF4AB" opacity=".55" />

            <g>
              <path d="M282 262 L318 262 L336 372 L264 372 Z" fill="url(#hiPier)" />
              <g stroke="#96683A" strokeWidth="2.4" opacity=".55">
                <line x1="284" y1="280" x2="316" y2="280" /><line x1="288" y1="302" x2="312" y2="302" />
                <line x1="292" y1="324" x2="308" y2="324" /><line x1="296" y1="348" x2="304" y2="348" />
              </g>
              <rect x="258" y="366" width="84" height="10" rx="5" fill="#C4915A" />
            </g>

            <path d="M300 262 Q296 238 302 222 Q308 210 302 200" stroke="#F7E2AE" strokeWidth="18" fill="none" strokeLinecap="round" opacity=".92" />

            <g transform="translate(300,194)">
              <ellipse cx="0" cy="4" rx="80" ry="12" fill="rgba(60,140,72,.24)" />
              <rect x="-68" y="-68" width="27" height="70" rx="5" fill="url(#hiCastle)" />
              <path d="M-70 -68 L-54.5 -98 L-39 -68 Z" fill="url(#hiRoof)" />
              <circle cx="-54.5" cy="-46" r="5.6" fill="#BFE4FA" />
              <rect x="41" y="-68" width="27" height="70" rx="5" fill="url(#hiCastle)" />
              <path d="M39 -68 L54.5 -98 L70 -68 Z" fill="url(#hiRoof)" />
              <circle cx="54.5" cy="-46" r="5.6" fill="#BFE4FA" />
              <rect x="-42" y="-62" width="84" height="64" rx="6" fill="url(#hiCastle)" />
              <rect x="-42" y="-62" width="84" height="10" rx="3" fill="#EFD9EA" />
              <rect x="-18" y="-102" width="36" height="45" rx="5" fill="url(#hiCastle)" />
              <path d="M-22 -102 L0 -140 L22 -102 Z" fill="url(#hiRoof)" />
              <line x1="0" y1="-140" x2="0" y2="-158" stroke="#B4739E" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M0 -157 L22 -150 L0 -143 Z" fill="#FFC94A" />
              <circle cx="0" cy="-83" r="7" fill="#BFE4FA" />
              <rect x="-29" y="-46" width="13" height="18" rx="6.5" fill="#BFE4FA" />
              <rect x="16" y="-46" width="13" height="18" rx="6.5" fill="#BFE4FA" />
              <path d="M-12 2 L-12 -21 Q0 -33 12 -21 L12 2 Z" fill="#8E6FC4" />
              <path d="M-9 2 L-9 -20 Q0 -30 9 -20 L9 2 Z" fill="#6E52A8" />
              <circle cx="0" cy="-10" r="2.6" fill="#FFD86B" />
            </g>

            <g transform="translate(160,240)">
              <path d="M0 0 Q-4 -28 3 -54" stroke="#B98A50" strokeWidth="7.5" fill="none" strokeLinecap="round" />
              <g fill="#54BC55">
                <path d="M3 -54 Q-26 -64 -37 -49 Q-17 -56 3 -50 Z" /><path d="M3 -54 Q32 -66 43 -51 Q22 -58 3 -50 Z" />
                <path d="M3 -54 Q-11 -80 2 -90 Q7 -73 8 -54 Z" /><path d="M3 -54 Q24 -78 37 -73 Q18 -67 7 -51 Z" />
              </g>
              <circle cx="6" cy="-51" r="3.6" fill="#E29B14" />
            </g>
            <g transform="translate(446,242) scale(-.92,.92)">
              <path d="M0 0 Q-4 -28 3 -54" stroke="#B98A50" strokeWidth="7.5" fill="none" strokeLinecap="round" />
              <g fill="#49B14E">
                <path d="M3 -54 Q-26 -64 -37 -49 Q-17 -56 3 -50 Z" /><path d="M3 -54 Q32 -66 43 -51 Q22 -58 3 -50 Z" />
                <path d="M3 -54 Q-11 -80 2 -90 Q7 -73 8 -54 Z" />
              </g>
            </g>

            <g>
              <ellipse cx="222" cy="250" rx="21" ry="13" fill="#4FB24C" /><ellipse cx="218" cy="246" rx="14" ry="9" fill="#75CE68" />
              <ellipse cx="388" cy="248" rx="19" ry="12" fill="#4FB24C" /><ellipse cx="384" cy="244" rx="12" ry="8" fill="#75CE68" />
            </g>
            <g fill="#FF9FBE">
              <circle cx="190" cy="254" r="4" /><circle cx="252" cy="258" r="3.4" /><circle cx="352" cy="256" r="3.6" /><circle cx="422" cy="252" r="4" />
            </g>
            <g fill="#FFE07A">
              <circle cx="190" cy="254" r="1.6" /><circle cx="252" cy="258" r="1.4" /><circle cx="352" cy="256" r="1.5" /><circle cx="422" cy="252" r="1.6" />
            </g>
          </svg>

          <div className="hero-charas">
            <KisekaeCharacters kisekaeState={kisekaeState} onOpen={onOpenKisekaeChara} lang={lang} />
          </div>
        </div>
      </div>

      {/* ヘッダー */}
      <div className="hero-topbar">
        <button className="hero-coin-chip" onClick={onCoinChipClick} aria-label={tt(lang, 'coinExchange')}>
          <CoinIcon /><b>{coins}</b>
        </button>
        <div className="hero-topbar-spacer" />
        <button className="hero-icon-btn" onClick={onDressUpClick} aria-label={tt(lang, 'dressUp')}><DressIcon /></button>
        <button className="hero-icon-btn" onClick={onFamilyClick} aria-label={tt(lang, 'forFamily')}><FamilyIcon /></button>
      </div>

      {/* つづきから */}
      {resumeGame && (
        <button className="hero-resume" onClick={onResumeClick}>
          <span className="hero-resume-thumb"><ResumeFaceIcon /></span>
          <span className="hero-resume-txt">
            <small>{tt(lang, 'resume')}</small>
            <b>{resumeName}</b>
          </span>
          <ChevronRightIcon />
        </button>
      )}

      {/* CTA */}
      <div className="hero-cta-zone">
        <button className="hero-cta" onClick={onCtaClick}>
          <span className="hero-cta-shine" />
          <PlayGlyph />
          {tt(lang, 'cta')}
        </button>
      </div>

      <div className="hero-scroll-hint">
        <span>{tt(lang, 'scrollHint')}</span>
        <ChevronDownIcon />
      </div>
    </section>
  );
}
