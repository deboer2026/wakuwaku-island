import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTopPageBgm, stopBgm, toggleMute, getMuteState, ensureAudioStarted } from '../utils/audio';
import './TopPage.css';

const GAMES = [
  {
    id: 'g1',
    route: '/shabondama',
    icon: '🫧',
    num: 1,
    name: 'シャボンだまポン',
    desc: 'とんでくる たまを\nタップしてわろう！',
    stars: '⭐⭐⭐⭐⭐',
    isNew: true,
  },
  {
    id: 'g2',
    route: '/kudamono-catch',
    icon: '🍎',
    num: 2,
    name: 'くだものキャッチ',
    desc: 'おちてくる くだものを\nキャッチしよう！',
    stars: '⭐⭐⭐⭐',
    isNew: false,
  },
  {
    id: 'g3',
    route: '/meiro',
    icon: '🗺️',
    num: 3,
    name: 'めいろあそび',
    desc: 'めいろを とおって\nゴールをめざせ！',
    stars: '⭐⭐⭐⭐',
    isNew: false,
  },
  {
    id: 'g4',
    route: '/doubutsu-puzzle',
    icon: '🧩',
    num: 4,
    name: 'どうぶつパズル',
    desc: 'どうぶつを ならべて\nパズルをとこう！',
    stars: '⭐⭐⭐⭐⭐',
    isNew: false,
  },
  {
    id: 'g5',
    route: '/kazu-asobi',
    icon: '🔢',
    num: 5,
    name: 'かずあそび',
    desc: 'かずを かぞえて\nたのしく まなぼう！',
    stars: '⭐⭐⭐',
    isNew: false,
  },
  {
    id: 'g6',
    route: '/animal-soccer',
    icon: '⚽',
    num: 6,
    name: 'どうぶつサッカー',
    desc: 'どうぶつたちと\nサッカーをしよう！',
    stars: '⭐⭐⭐⭐⭐',
    isNew: false,
  },
  {
    id: 'g7',
    route: '/jewelry-shop',
    icon: '💎',
    num: 7,
    name: 'ほうせきやさん',
    desc: 'やってきた どうぶつさんに\nアクセサリをわたそう！',
    stars: '⭐⭐⭐⭐',
    isNew: true,
  },
  {
    id: 'g8',
    route: '/sushi',
    icon: '🍣',
    num: 8,
    name: 'さーもん',
    desc: 'かいてんずし！\nサーモンだけ\nタップしよう！',
    stars: '⭐⭐⭐⭐⭐',
    isNew: true,
  },
  {
    id: 'g9',
    route: '/ichigo',
    icon: '🍓',
    num: 9,
    name: 'いちご',
    desc: '30びょうで\nいちごを\nあつめよう！',
    stars: '⭐⭐⭐⭐⭐',
    isNew: true,
  },
];

function GameCard({ game, onClick }) {
  return (
    <button className={`wi-card ${game.id}`} onClick={onClick}>
      <div className="card-top">
        {game.isNew && <span className="new-badge">NEW</span>}
        <span className="card-num">{game.num}</span>
        <span className="card-icon">{game.icon}</span>
      </div>
      <div className="card-bottom">
        <div className="card-name">{game.name}</div>
        <div className="card-desc">
          {game.desc.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < game.desc.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        <div className="card-stars">{game.stars}</div>
      </div>
    </button>
  );
}

export default function TopPage() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(getMuteState());

  useEffect(() => {
    // Initialize audio on first user interaction
    ensureAudioStarted();
    playTopPageBgm();
    return () => {
      stopBgm();
    };
  }, []);

  const handleMuteToggle = () => {
    toggleMute();
    setIsMuted(getMuteState());
  };

  return (
    <div className="wi-wrap">
      {/* Mute Button */}
      <button className="mute-btn" onClick={handleMuteToggle} title={isMuted ? 'Unmute' : 'Mute'}>
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* ── Sky ── */}
      <div className="wi-sky">
        {/* Clouds */}
        <div className="cloud c1" />
        <div className="cloud c2" />
        <div className="cloud c3" />

        {/* Princess (left) */}
        <div className="chara chara-princess">
          <svg width="52" height="70" viewBox="0 0 52 74" overflow="visible">
            <ellipse cx="26" cy="62" rx="19" ry="11" fill="#FF80AB" />
            <polygon points="26,30 8,66 44,66" fill="#FF4081" />
            <rect x="20" y="27" width="12" height="16" rx="4" fill="#FFCCBC" />
            <circle cx="26" cy="20" r="11" fill="#FFCCBC" />
            <ellipse cx="26" cy="11" rx="11" ry="7" fill="#F9A825" />
            <ellipse cx="15" cy="21" rx="5" ry="8" fill="#F9A825" />
            <ellipse cx="37" cy="21" rx="5" ry="8" fill="#F9A825" />
            <polygon points="16,9 21,3 26,8 31,3 36,9" fill="#FFD700" stroke="#FFA000" strokeWidth="1" />
            <circle cx="26" cy="8" r="2" fill="#FF1744" />
            <circle cx="22" cy="20" r="2" fill="#5D4037" />
            <circle cx="30" cy="20" r="2" fill="#5D4037" />
            <circle cx="23" cy="19.5" r="0.8" fill="#fff" />
            <circle cx="31" cy="19.5" r="0.8" fill="#fff" />
            <path d="M22,24 Q26,27 30,24" stroke="#E91E63" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <ellipse cx="12" cy="37" rx="4" ry="7" fill="#FFCCBC" transform="rotate(-20,12,37)" />
            <ellipse cx="40" cy="37" rx="4" ry="7" fill="#FFCCBC" transform="rotate(20,40,37)" />
            <text x="-4" y="14" fontSize="10">✨</text>
            <text x="42" y="10" fontSize="9">⭐</text>
          </svg>
        </div>

        {/* Prince (right) */}
        <div className="chara chara-prince">
          <svg width="52" height="70" viewBox="0 0 52 72" overflow="visible">
            <rect x="13" y="46" width="10" height="18" rx="3" fill="#1565C0" />
            <rect x="29" y="46" width="10" height="18" rx="3" fill="#1565C0" />
            <rect x="11" y="28" width="30" height="22" rx="5" fill="#1976D2" />
            <rect x="17" y="26" width="18" height="10" rx="3" fill="#FFCCBC" />
            <circle cx="26" cy="19" r="11" fill="#FFCCBC" />
            <ellipse cx="26" cy="10" rx="11" ry="7" fill="#5D4037" />
            <polygon points="16,9 21,3 26,8 31,3 36,9" fill="#FFD700" stroke="#FFA000" strokeWidth="1" />
            <circle cx="26" cy="8" r="2" fill="#2196F3" />
            <circle cx="22" cy="19" r="2" fill="#333" />
            <circle cx="30" cy="19" r="2" fill="#333" />
            <circle cx="23" cy="18.5" r="0.8" fill="#fff" />
            <circle cx="31" cy="18.5" r="0.8" fill="#fff" />
            <path d="M22,23 Q26,26 30,23" stroke="#BF8A7A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <ellipse cx="6" cy="37" rx="5" ry="8" fill="#1976D2" transform="rotate(-15,6,37)" />
            <ellipse cx="46" cy="37" rx="5" ry="8" fill="#1976D2" transform="rotate(15,46,37)" />
            <rect x="47" y="24" width="3" height="22" rx="1" fill="#CFD8DC" />
            <rect x="43" y="33" width="11" height="3" rx="1" fill="#FFA000" />
            <text x="-2" y="14" fontSize="9">⭐</text>
          </svg>
        </div>

        {/* Small bird */}
        <div className="chara chara-bird">🐦</div>

        {/* Rainbow */}
        <div className="chara chara-rainbow">🌈</div>

        {/* Star decorations */}
        <div className="chara chara-star1">★</div>
        <div className="chara chara-star2">★</div>
        <div className="chara chara-star3">✦</div>

        {/* Title */}
        <div className="wi-title-area">
          <div className="wi-logo-badge">🏝️ GAME PARK</div>
          <div className="wi-title">
            <span className="t1">わくわく</span>
            <span className="t2">アイランド</span>
          </div>
          <div className="wi-sub">🏝️ たのしい あそびじま！</div>
        </div>

        {/* Wave transition */}
        <svg className="wave" viewBox="0 0 400 32" preserveAspectRatio="none">
          <path
            d="M0,16 C60,32 120,0 180,16 C240,32 300,0 360,16 C390,24 400,20 400,20 L400,32 L0,32 Z"
            fill="#4DB8FF"
          />
        </svg>
      </div>

      {/* ── Sea ── */}
      <div className="wi-sea">
        {/* Sea creatures */}
        <div className="sea-deco sea-deco-fish1 anim-float2-22">🐠</div>
        <div className="sea-deco sea-deco-fish2 anim-wiggle-28">🐟</div>
        <div className="sea-deco sea-deco-turtle anim-float-35">🐢</div>
        <div className="sea-deco sea-deco-dolphin anim-float2-26">🐬</div>

        {/* Island shape */}
        <div className="wi-island" />

        {/* Animals around the island */}
        <div className="island-animal island-cat anim-bounce-24">🐱</div>
        <div className="island-animal island-bear anim-float2-30">🐻</div>
        <div className="island-animal island-rabbit anim-bounce-19">🐰</div>
        <div className="island-animal island-panda anim-float3-28">🐼</div>
        <div className="island-animal island-flower1">🌸</div>
        <div className="island-animal island-flower2">🌼</div>

        {/* Game grid */}
        <div className="wi-grid">
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => navigate(game.route)}
            />
          ))}
        </div>

        {/* Footer characters */}
        <div className="footer-charas">
          <span>🦁</span>
          <span>🦊</span>
          <span>🐘</span>
          <span>🐧</span>
          <span>🐨</span>
          <span>🐸</span>
          <span>🐥</span>
          <span>🦝</span>
        </div>

        <div className="wi-footer">🌟 あそびたいゲームをえらんでね 🌟</div>
      </div>
    </div>
  );
}
