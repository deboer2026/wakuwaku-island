import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { startBGM, stopBGM, toggleBGM } from '../utils/audio';
import { transitionTo } from '../utils/transition';
import { getPlayCount } from '../utils/playCounter';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { KisekaeCharacters, KisekaePanel, DEFAULT_KISEKAE } from '../components/Kisekae';
import LoginBonus from '../components/LoginBonus';
import Shop from '../components/Shop';
import { getCoins, checkLoginBonus, claimLoginBonus } from '../utils/coins';
import { getRecentGames } from '../utils/recentGames';
import { getPlayHistory } from '../utils/playHistory';
import { detectLang } from '../utils/i18n';
import GAME_META from '../seo/gameMeta';
import IslandMap, { AREA_THEMES as MAP_AREA_THEMES } from './IslandMap';
import './TopPage.css';

/* ── カテゴリ別グラデーション ──────────────────────────── */
const CARD_GRADIENTS = {
  'アクション': 'linear-gradient(145deg, #FF9F5A, #E8471E)',
  'パズル':     'linear-gradient(145deg, #9B7FE8, #3D2B8C)',
  'かずあそび': 'linear-gradient(145deg, #4DB8E8, #1A5A9E)',
  'もじあそび': 'linear-gradient(145deg, #5BC99A, #1A7A56)',
  'クイズ':     'linear-gradient(145deg, #4FC3A1, #1A5C3A)',
  'そうぞう':   'linear-gradient(145deg, #C97FE0, #3D0D6B)',
  'レース':     'linear-gradient(145deg, #F9A825, #E53935)',
  'がくしゅう': 'linear-gradient(145deg, #7986CB, #283593)',
};
const DEFAULT_GRADIENT = 'linear-gradient(145deg, #7B8FA1, #3D4A5C)';

const CATEGORIES = [
  { key:'すべて',     icon:'🎮', label:{ja:'すべて',     en:'All',      zh:'全部',   ko:'전체',   es:'Todo'    } },
  { key:'かずあそび', icon:'🔢', label:{ja:'かずあそび', en:'Numbers',  zh:'数字',   ko:'숫자',   es:'Números' } },
  { key:'もじあそび', icon:'✏️', label:{ja:'もじあそび', en:'Letters',  zh:'文字',   ko:'글자',   es:'Letras'  } },
  { key:'パズル',     icon:'🧩', label:{ja:'パズル',     en:'Puzzle',   zh:'拼图',   ko:'퍼즐',   es:'Puzzle'  } },
  { key:'アクション', icon:'⚡', label:{ja:'アクション', en:'Action',   zh:'动作',   ko:'액션',   es:'Acción'  } },
  { key:'レース',     icon:'🏁', label:{ja:'レース',     en:'Racing',   zh:'赛车',   ko:'레이싱', es:'Carreras'} },
  { key:'クイズ',     icon:'❓', label:{ja:'クイズ',     en:'Quiz',     zh:'问答',   ko:'퀴즈',   es:'Quiz'    } },
  { key:'そうぞう',   icon:'🎨', label:{ja:'そうぞう',   en:'Create',   zh:'创造',   ko:'창작',   es:'Crear'   } },
  { key:'がくしゅう', icon:'📚', label:{ja:'がくしゅう', en:'Study',    zh:'学习',   ko:'학습',   es:'Estudio' } },
];

/* ── マスコットのセリフ ──────────────────────────── */
const MASCOT_GREETING = {
  morning:   { ja:'おはよう！☀️',   en:'Good morning! ☀️',  zh:'早上好！☀️',  ko:'좋은 아침! ☀️',   es:'¡Buenos días! ☀️' },
  afternoon: { ja:'こんにちは！🌈', en:'Hello! 🌈',          zh:'你好！🌈',     ko:'안녕! 🌈',         es:'¡Hola! 🌈' },
  evening:   { ja:'こんばんは！🌙', en:'Good evening! 🌙',   zh:'晚上好！🌙',   ko:'좋은 저녁! 🌙',   es:'¡Buenas noches! 🌙' },
};
const MASCOT_LINES = {
  ja: ['きょうは なにして あそぶ？','いっしょに あそぼう！','タップすると キラキラ✨','🎲ルーレットも おしてみて！','きみが くるのを まってたよ！'],
  en: ['What shall we play today?','Let\'s play together!','Tap me for sparkles ✨','Try the 🎲 roulette!','I was waiting for you!'],
  zh: ['今天玩什么呢？','一起来玩吧！','点我有闪光✨','试试🎲轮盘吧！','我在等你哦！'],
  ko: ['오늘은 뭐 하고 놀까?','같이 놀자!','탭하면 반짝반짝✨','🎲룰렛도 눌러봐!','너를 기다렸어!'],
  es: ['¿A qué jugamos hoy?','¡Juguemos juntos!','¡Tócame y brillo! ✨','¡Prueba la 🎲 ruleta!','¡Te estaba esperando!'],
};

/* ════════════════════════════════════════════════════
   ゲームSVGイラスト（SNES風）
════════════════════════════════════════════════════ */
const GAME_SVGS = {
  g_astral: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" rx="12" fill="#4a5abf"/>
      <circle cx="16" cy="14" r="1.5" fill="#fff6c8" opacity=".9"/>
      <circle cx="84" cy="12" r="1.3" fill="#fff6c8" opacity=".8"/>
      <circle cx="70" cy="20" r="1" fill="#fff6c8" opacity=".7"/>
      <circle cx="26" cy="24" r="1" fill="#fff6c8" opacity=".7"/>
      <path d="M25 55 Q35 40 50 40 Q65 40 75 55" fill="none" stroke="#ff9ecb" strokeWidth="4" strokeLinecap="round" opacity=".85"/>
      <path d="M30 55 Q38 44 50 44 Q62 44 70 55" fill="none" stroke="#fff2a8" strokeWidth="4" strokeLinecap="round" opacity=".85"/>
      <path d="M35 55 Q41 48 50 48 Q59 48 65 55" fill="none" stroke="#9ff7c8" strokeWidth="4" strokeLinecap="round" opacity=".85"/>
      <ellipse cx="60" cy="66" rx="18" ry="10" fill="#8fc6ff"/>
      <path d="M42 66 L34 62 L38 68 L34 72 Z" fill="#8fc6ff"/>
      <circle cx="70" cy="62" r="1.6" fill="#1c1a44"/>
      <path d="M50 20 L52 26 L58 26 L53.2 29.6 L55 36 L50 32.2 L45 36 L46.8 29.6 L42 26 L48 26 Z" fill="#fff2a8"/>
      <circle cx="20" cy="66" r="7" fill="#ffcf7a"/>
      <circle cx="17" cy="64" r="1.6" fill="#3a2a10"/>
      <circle cx="23" cy="64" r="1.6" fill="#3a2a10"/>
      <path d="M15 60 L17 57 L19 60 Z" fill="#ffcf7a"/>
      <path d="M21 60 L23 57 L25 60 Z" fill="#ffcf7a"/>
    </svg>
  ),

  g_oukan: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#234237"/>
      <path d="M0 63 Q24 50 50 61 Q76 72 100 54 V85 H0Z" fill="#588b4c"/>
      <path d="M0 70 Q24 57 50 69 Q76 80 100 62" fill="none" stroke="#a8d76c" strokeWidth="3" strokeDasharray="5 4"/>
      <path d="M72 17 L90 17 L90 62 L72 62Z" fill="#7f9fc5" stroke="#d6ebff" strokeWidth="2"/>
      <path d="M70 18 Q81 3 92 18" fill="none" stroke="#d6ebff" strokeWidth="3"/>
      <rect x="78" y="43" width="7" height="19" rx="2" fill="#3e5d78"/>
      <g transform="translate(34 56)">
        <circle cy="-13" r="9" fill="#ffd6aa"/><path d="M-8 -16 L-11 -26 L-3 -19 M8 -16 L11 -26 L3 -19" fill="#ffd6aa"/>
        <rect x="-9" y="-3" width="18" height="17" rx="7" fill="#f08bb8"/><path d="M-7 -6 L-4 -12 L0 -7 L4 -12 L7 -6Z" fill="#f5cf4e" stroke="#a5761f" strokeWidth="1"/>
      </g>
      <g transform="translate(55 50)"><circle cy="-8" r="7" fill="#96cdf2"/><rect x="-7" y="-1" width="14" height="14" rx="6" fill="#4e7dbd"/><circle cx="-2.5" cy="-9" r="1.2" fill="#28334e"/><circle cx="2.5" cy="-9" r="1.2" fill="#28334e"/></g>
      <rect x="7" y="7" width="27" height="10" rx="4" fill="#173028" opacity=".8"/><circle cx="14" cy="12" r="2" fill="#f5cf4e"/><rect x="19" y="10" width="10" height="3" rx="1.5" fill="#fff4cc"/>
    </svg>
  ),

  g_neon: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" rx="12" fill="#1a1040"/>
      <circle cx="20" cy="14" r="1.6" fill="#fff" opacity=".9"/>
      <circle cx="78" cy="11" r="1.4" fill="#fff" opacity=".8"/>
      <circle cx="88" cy="20" r="1.2" fill="#fff" opacity=".7"/>
      <rect x="12" y="20" width="6" height="20" rx="1" fill="#2b1e5c"/>
      <rect x="12" y="22" width="6" height="4" fill="#ffd24d" opacity=".9"/>
      <rect x="12" y="30" width="6" height="4" fill="#7df9ff" opacity=".85"/>
      <rect x="80" y="16" width="7" height="26" rx="1" fill="#2b1e5c"/>
      <rect x="80" y="20" width="7" height="4" fill="#ff2fb0" opacity=".9"/>
      <rect x="80" y="30" width="7" height="4" fill="#ffd24d" opacity=".85"/>
      <path d="M38 40 L62 40 L82 85 L18 85 Z" fill="#241a44"/>
      <path d="M38 40 L62 40 L82 85 L18 85 Z" fill="none" stroke="#0e0a24" strokeWidth="1"/>
      <path d="M38 40 L18 85" stroke="#ff2fb0" strokeWidth="2.5"/>
      <path d="M62 40 L82 85" stroke="#00e5ff" strokeWidth="2.5"/>
      <rect x="48.4" y="45" width="3" height="7" fill="#bfe8ff" opacity=".85"/>
      <rect x="47.4" y="58" width="4" height="9" fill="#bfe8ff" opacity=".85"/>
      <rect x="46" y="72" width="6" height="11" fill="#bfe8ff" opacity=".85"/>
      <g transform="translate(50 64)">
        <rect x="-13" y="-4" width="26" height="9" rx="3" fill="#10c8e8"/>
        <rect x="-8" y="-10" width="16" height="7" rx="3" fill="#2ad2f0"/>
        <rect x="-13" y="4" width="26" height="2.4" rx="1.2" fill="#00ffff"/>
        <path d="M-9 -10 L-6 -15 L-3 -11 Z" fill="#10c8e8"/>
        <path d="M9 -10 L6 -15 L3 -11 Z" fill="#10c8e8"/>
        <path d="M-8.5 -11 L-6.5 -14 L-4.5 -11.5 Z" fill="#ffb0d8"/>
        <path d="M8.5 -11 L6.5 -14 L4.5 -11.5 Z" fill="#ffb0d8"/>
        <rect x="-11" y="-6" width="3" height="2.4" rx="1" fill="#fff2cc"/>
        <rect x="8" y="-6" width="3" height="2.4" rx="1" fill="#fff2cc"/>
      </g>
      <path d="M30 20 l1.6 3.2 l3.4 .4 l-2.5 2.3 l.7 3.4 l-3.2 -1.7 l-3.2 1.7 l.7 -3.4 l-2.5 -2.3 l3.4 -.4 Z" fill="#ffe14d" stroke="#e0a800" strokeWidth="1"/>
    </svg>
  ),
  g_mura: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" rx="12" fill="#bfe9ff"/>
      <circle cx="16" cy="13" r="6" fill="#ffd24d"/>
      <ellipse cx="42" cy="12" rx="9" ry="4" fill="#fff" opacity=".85"/>
      <path d="M0 36 Q25 26 50 34 Q75 42 100 32 L100 85 L0 85 Z" fill="#9ed77a"/>
      <g transform="translate(26 40)">
        <path d="M-11 0 L0 -11 L11 0 Z" fill="#e07a5f"/>
        <rect x="-8" y="0" width="16" height="12" fill="#fff3d6" stroke="#d9b06a" strokeWidth="1"/>
        <rect x="-3" y="4" width="6" height="8" fill="#8a5a30"/>
      </g>
      <g transform="translate(70 56)">
        <rect x="-14" y="-4" width="28" height="18" rx="3" fill="#a9713f" stroke="#7d4e26" strokeWidth="1.5"/>
        <path d="M-8 4 Q-11 -2 -8 -8 Q-4 -3 -8 4 Z" fill="#5a9e3d"/>
        <path d="M0 6 Q-3 0 0 -6 Q4 -1 0 6 Z" fill="#6fb54e"/>
        <path d="M8 4 Q5 -2 8 -8 Q12 -3 8 4 Z" fill="#82c661"/>
      </g>
      <g transform="translate(30 66)">
        <path d="M-5 -8 L-2 -14 L4 -10 Z" fill="#f2b56b"/>
        <path d="M9 -8 L8 -15 L2 -10 Z" fill="#f2b56b"/>
        <circle cx="2" cy="-2" r="9" fill="#f2b56b"/>
        <ellipse cx="2" cy="1" rx="4.5" ry="3.5" fill="#fbe0bb"/>
        <circle cx="-1.5" cy="-4" r="1.5" fill="#2a2440"/>
        <circle cx="5.5" cy="-4" r="1.5" fill="#2a2440"/>
        <path d="M1 -1 L3 -1 L2 0.5 Z" fill="#ff7eb3"/>
      </g>
      <g transform="translate(52 70)">
        <path d="M-4 -10 Q-9 -13 -8 -18 Q-3 -16 -4 -11 Z" fill="#5a9e3d"/>
        <path d="M-1.5 -9 Q-4 -13 -1.5 -17 Q1 -13 -1.5 -9 Z" fill="#6fb54e"/>
        <path d="M-6 -8 Q-2 -10 2 -8 L-1 6 Q-2 8 -3 6 Z" fill="#ff8a3c"/>
      </g>
      <path d="M86 68 l2.4 4.8 l4.8 .6 l-3.6 3.4 l1 4.8 l-4.6 -2.4 l-4.6 2.4 l1 -4.8 l-3.6 -3.4 l4.8 -.6 Z" fill="#ffd24d" stroke="#e0a800" strokeWidth="1"/>
    </svg>
  ),
  g_kyoshitsu: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" rx="12" fill="#bfe9ff"/>
      <circle cx="16" cy="14" r="2" fill="#fff" opacity=".8"/>
      <circle cx="86" cy="12" r="1.6" fill="#fff" opacity=".8"/>
      <ellipse cx="24" cy="26" rx="10" ry="5" fill="#fff" opacity=".85"/>
      <ellipse cx="78" cy="60" rx="12" ry="6" fill="#fff" opacity=".85"/>
      <ellipse cx="72" cy="34" rx="7" ry="15" fill="none" stroke="#ffc93c" strokeWidth="5"/>
      <g transform="translate(38 40)">
        <path d="M-6 -2 Q-20 -12 -22 2 Q-14 4 -6 4 Z" fill="#fff" stroke="#a9c4e6" strokeWidth="1"/>
        <path d="M6 -2 Q20 -12 22 2 Q14 4 6 4 Z" fill="#fff" stroke="#a9c4e6" strokeWidth="1"/>
        <ellipse cx="0" cy="8" rx="11" ry="10" fill="#b9b3c9"/>
        <ellipse cx="0" cy="10" rx="6" ry="6" fill="#e5e1f0"/>
        <circle cx="0" cy="-4" r="10" fill="#b9b3c9"/>
        <path d="M-9 -9 L-13 -18 L-4 -12 Z" fill="#b9b3c9"/>
        <path d="M9 -9 L13 -18 L4 -12 Z" fill="#b9b3c9"/>
        <path d="M-7 -9 L-9 -14 L-4 -11 Z" fill="#ff9ec4"/>
        <path d="M7 -9 L9 -14 L4 -11 Z" fill="#ff9ec4"/>
        <circle cx="-4" cy="-4" r="1.8" fill="#2a2440"/>
        <circle cx="4" cy="-4" r="1.8" fill="#2a2440"/>
        <path d="M-1.5 -1 L1.5 -1 L0 1.5 Z" fill="#ff7eb3"/>
      </g>
      <path d="M50 70 l3 6 l6 .8 l-4.5 4.2 l1.2 6 l-5.7 -3 l-5.7 3 l1.2 -6 l-4.5 -4.2 l6 -.8 Z" fill="#ffd24d" stroke="#e0a800" strokeWidth="1"/>
    </svg>
  ),
  g_otakara: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" fill="#aee9ff"/>
      <circle cx="20" cy="14" r="6" fill="#fff" opacity=".8"/>
      <circle cx="28" cy="16" r="8" fill="#fff" opacity=".8"/>
      <rect x="0" y="34" width="100" height="51" fill="#8a5a30"/>
      <rect x="0" y="34" width="100" height="6" fill="#a06c3c"/>
      <rect x="8" y="46" width="20" height="30" rx="3" fill="#151c2b"/>
      <g stroke="#e6b84c" strokeWidth="2" strokeLinecap="round">
        <line x1="60" y1="40" x2="60" y2="80"/>
        <line x1="70" y1="40" x2="70" y2="80"/>
        <line x1="60" y1="48" x2="70" y2="48"/>
        <line x1="60" y1="58" x2="70" y2="58"/>
        <line x1="60" y1="68" x2="70" y2="68"/>
      </g>
      <g transform="translate(84 58)">
        <path d="M 0 -9 L 7 -2 L 0 10 L -7 -2 Z" fill="#3fc9dc"/>
        <path d="M 0 -9 L 7 -2 L 0 -0.5 L -7 -2 Z" fill="#a8f0f8"/>
      </g>
      <g transform="translate(38 56)">
        <circle cx="-6" cy="-8" r="4" fill="#f2d4a0"/>
        <circle cx="6" cy="-8" r="4" fill="#f2d4a0"/>
        <circle cx="-6" cy="-8" r="2" fill="#e79aa0"/>
        <circle cx="6" cy="-8" r="2" fill="#e79aa0"/>
        <circle cx="0" cy="0" r="11" fill="#f2d4a0"/>
        <circle cx="-5" cy="4" r="5" fill="#f9edd2"/>
        <circle cx="5" cy="4" r="5" fill="#f9edd2"/>
        <circle cx="-4" cy="-1" r="1.6" fill="#3a2a1a"/>
        <circle cx="4" cy="-1" r="1.6" fill="#3a2a1a"/>
        <circle cx="0" cy="3" r="1.5" fill="#c96a6a"/>
      </g>
      <g transform="translate(56 40) rotate(20)">
        <line x1="0" y1="0" x2="0" y2="14" stroke="#8a5a30" strokeWidth="2.4"/>
        <path d="M -9 -2 Q 0 -6 9 -2" stroke="#c9d1dc" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  ),
  g_mahounakama: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" fill="#d9ecff"/>
      <circle cx="18" cy="14" r="6" fill="#fff" opacity=".8"/>
      <circle cx="26" cy="16" r="8" fill="#fff" opacity=".8"/>
      <circle cx="78" cy="10" r="7" fill="#fff" opacity=".7"/>
      <rect x="0" y="56" width="100" height="29" fill="#9fdc7a"/>
      <ellipse cx="20" cy="64" rx="12" ry="3" fill="#8ccb68"/>
      <ellipse cx="72" cy="72" rx="14" ry="3" fill="#8ccb68"/>
      <g transform="translate(32 52)">
        <ellipse cx="0" cy="14" rx="9" ry="3" fill="#3c5078" opacity=".18"/>
        <ellipse cx="0" cy="2" rx="8" ry="9" fill="#ffd9a0"/>
        <circle cx="0" cy="-10" r="8" fill="#ffd9a0"/>
        <path d="M -7 -14 L -10 -22 L -3 -16 Z" fill="#ffd9a0"/>
        <path d="M 7 -14 L 10 -22 L 3 -16 Z" fill="#ffd9a0"/>
        <circle cx="-2.5" cy="-11" r="1.4" fill="#3a3a4a"/>
        <circle cx="3" cy="-11" r="1.4" fill="#3a3a4a"/>
        <path d="M -1 -7 Q 0.5 -5.5 2 -7" stroke="#c9506a" strokeWidth="1.2" fill="none"/>
        <rect x="-6" y="-3" width="12" height="3.5" rx="1.7" fill="#ff8fb5"/>
        <line x1="6" y1="-4" x2="18" y2="-12" stroke="#b58643" strokeWidth="2"/>
      </g>
      <path d="M 50 38 L 51.8 42.4 L 56.5 42.7 L 52.9 45.7 L 54 50.3 L 50 47.8 L 46 50.3 L 47.1 45.7 L 43.5 42.7 L 48.2 42.4 Z" fill="#ffd84a" stroke="#e8a900" strokeWidth=".8"/>
      <g transform="translate(70 56)">
        <ellipse cx="0" cy="12" rx="9" ry="3" fill="#3c5078" opacity=".18"/>
        <ellipse cx="0" cy="0" rx="10" ry="9" fill="#8fd8ff"/>
        <path d="M -3.4 -2 Q -2 -4 -0.6 -2" stroke="#4a4a5a" strokeWidth="1.3" fill="none"/>
        <path d="M 0.6 -2 Q 2 -4 3.4 -2" stroke="#4a4a5a" strokeWidth="1.3" fill="none"/>
        <path d="M -2.5 3 Q 0 5.5 2.5 3" stroke="#4a4a5a" strokeWidth="1.3" fill="none"/>
        <path d="M -4 -9 L -1 -12 L -1 -7 Z" fill="#ff8fb5"/>
        <path d="M 4 -9 L 1 -12 L 1 -7 Z" fill="#ff8fb5"/>
      </g>
      <circle cx="88" cy="40" r="2" fill="#ffd84a"/>
      <circle cx="10" cy="44" r="2" fill="#ffd84a"/>
    </svg>
  ),
  g_okashi: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" fill="#ffe3f0"/>
      <rect x="0" y="52" width="100" height="16" fill="#8a5fc0"/>
      <rect x="0" y="52" width="100" height="2" fill="#ffe07a"/>
      <rect x="0" y="66" width="100" height="2" fill="#ffe07a"/>
      <rect x="18" y="56" width="10" height="2" rx="1" fill="#fff" opacity=".7"/>
      <rect x="58" y="56" width="10" height="2" rx="1" fill="#fff" opacity=".7"/>
      <rect x="0" y="30" width="100" height="14" fill="#6e4228"/>
      <rect x="20" y="33" width="22" height="8" rx="4" fill="#e8b76f" stroke="#c9964f" strokeWidth="1"/>
      <g transform="translate(70 58)">
        <rect x="-11" y="-6" width="22" height="12" rx="5" fill="#59d98c"/>
        <rect x="-8" y="-4" width="16" height="4" rx="2" fill="#fff" opacity=".55"/>
        <circle cx="5" cy="1" r="1.6" fill="#5a3a2a"/><circle cx="9" cy="1" r="1.6" fill="#5a3a2a"/>
      </g>
      <circle cx="70" cy="21" r="6" fill="#ffcb70" stroke="#d98535" strokeWidth="1.2"/>
      <circle cx="68" cy="20" r="1" fill="#6d3f2a"/><circle cx="72" cy="23" r="1" fill="#6d3f2a"/>
      <rect x="7" y="7" width="24" height="10" rx="4" fill="#a64d89" opacity=".9"/><circle cx="14" cy="12" r="2" fill="#fff"/><rect x="19" y="10" width="8" height="3" rx="1.5" fill="#ffe07a"/>
      <g transform="translate(38 68)">
        <ellipse cx="-5" cy="-16" rx="2.6" ry="7.5" fill="#fff" transform="rotate(-9 -5 -16)"/>
        <ellipse cx="5" cy="-16" rx="2.6" ry="7.5" fill="#fff" transform="rotate(9 5 -16)"/>
        <ellipse cx="-5" cy="-16" rx="1.2" ry="4.5" fill="#ffc2d8" transform="rotate(-9 -5 -16)"/>
        <ellipse cx="5" cy="-16" rx="1.2" ry="4.5" fill="#ffc2d8" transform="rotate(9 5 -16)"/>
        <circle cx="0" cy="-2" r="8.5" fill="#fff"/>
        <circle cx="-3" cy="-3" r="1.1" fill="#3a2a3a"/><circle cx="3" cy="-3" r="1.1" fill="#3a2a3a"/>
        <circle cx="0" cy="0" r="1" fill="#ff8fb5"/>
        <path d="M-4.5 -10 L-4.5 -13.5 L-2.2 -11 L0 -14 L2.2 -11 L4.5 -13.5 L4.5 -10 Z" fill="#ffd34d"/>
      </g>
    </svg>
  ),

  g_kart: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe9ff"/><stop offset="1" stopColor="#8fcdff"/></linearGradient>
        <linearGradient id="kTrk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9aa3b5"/><stop offset="1" stopColor="#5b6478"/></linearGradient>
      </defs>
      <rect width="100" height="85" fill="url(#kSky)"/>
      <circle cx="80" cy="15" r="9" fill="#fff3b0" opacity="0.85"/>
      <path d="M0 85 L34 38 H66 L100 85 Z" fill="url(#kTrk)"/>
      <path d="M50 40 V85" stroke="#ffd84d" strokeWidth="4" strokeDasharray="5 7"/>
      <rect x="34" y="55" width="32" height="13" rx="5" fill="#e8471e"/>
      <path d="M40 55 l5 -7 h10 l5 7 Z" fill="#c62f14"/>
      <circle cx="41" cy="69" r="6" fill="#222"/><circle cx="59" cy="69" r="6" fill="#222"/>
      <circle cx="41" cy="69" r="2.4" fill="#aaa"/><circle cx="59" cy="69" r="2.4" fill="#aaa"/>
    </svg>
  ),
  g_block: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a3a8a"/><stop offset="1" stopColor="#2a1a48"/></linearGradient></defs>
      <rect width="100" height="85" fill="url(#bNight)"/>
      <circle cx="14" cy="13" r="1.2" fill="#fff"/><circle cx="86" cy="9" r="1.2" fill="#fff"/><circle cx="70" cy="20" r="1" fill="#fff"/>
      <rect x="12" y="9" width="22" height="6" rx="2" fill="#ff5d70"/><rect x="38" y="9" width="22" height="6" rx="2" fill="#ffb23a"/><rect x="64" y="9" width="22" height="6" rx="2" fill="#7bd06a"/>
      <rect x="12" y="17" width="22" height="6" rx="2" fill="#4bb8ff"/><rect x="38" y="17" width="22" height="6" rx="2" fill="#b06bff"/><rect x="64" y="17" width="22" height="6" rx="2" fill="#ff8a3a"/>
      <path d="M50 38 l2 4.2 4.6 .4 -3.5 3 1 4.4 -4.1 -2.4 -4.1 2.4 1 -4.4 -3.5 -3 4.6 -.4 Z" fill="#ffe14d"/>
      <rect x="22" y="66" width="56" height="14" fill="#1f1238"/>
      <rect x="26" y="61" width="6" height="6" fill="#1f1238"/><rect x="47" y="61" width="6" height="6" fill="#1f1238"/><rect x="68" y="61" width="6" height="6" fill="#1f1238"/>
      <rect x="40" y="71" width="20" height="5" rx="2.5" fill="#19c6c6"/>
    </svg>
  ),
  g_mahoumeiro: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mmBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1a4e"/><stop offset="1" stopColor="#140a2e"/></linearGradient>
        <linearGradient id="mmGate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#81d4fa"/><stop offset="1" stopColor="#2962ff"/></linearGradient>
        <linearGradient id="mmGem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f8bbd0"/><stop offset="1" stopColor="#c2185b"/></linearGradient>
      </defs>
      <rect width="100" height="85" fill="url(#mmBg)"/>
      <circle cx="84" cy="12" r="7" fill="#fff59d" opacity="0.9"/>
      <g fill="#4a3a7e">
        <rect x="8" y="14" width="52" height="8" rx="2"/>
        <rect x="8" y="14" width="8" height="34" rx="2"/>
        <rect x="30" y="30" width="38" height="8" rx="2"/>
        <rect x="84" y="26" width="8" height="38" rx="2"/>
        <rect x="8" y="60" width="44" height="8" rx="2"/>
        <rect x="62" y="46" width="8" height="22" rx="2"/>
        <rect x="24" y="44" width="8" height="16" rx="2"/>
      </g>
      <g fill="#6a55b0" opacity="0.6">
        <rect x="8" y="12" width="52" height="3" rx="1.5"/>
        <rect x="30" y="28" width="38" height="3" rx="1.5"/>
        <rect x="8" y="58" width="44" height="3" rx="1.5"/>
      </g>
      <rect x="42" y="42" width="12" height="18" rx="3" fill="url(#mmGate)" opacity="0.9"/>
      <path d="M45 57 V49 Q48 45 51 49 V57" fill="none" stroke="#fff" strokeWidth="1.5"/>
      <rect x="16" y="68" width="10" height="10" rx="2" transform="rotate(45 21 73)" fill="url(#mmGem)"/>
      <g transform="translate(76 72)"><circle r="7" fill="#f3c48b"/><path d="M-6 -4 L-9 -12 L-2 -7 M6 -4 L9 -12 L2 -7" fill="#f3c48b"/><circle cx="-2.5" cy="-1" r="1" fill="#2e2450"/><circle cx="2.5" cy="-1" r="1" fill="#2e2450"/><rect x="-7" y="5" width="14" height="6" rx="3" fill="#e97eb2"/></g>
      <circle cx="90" cy="46" r="6" fill="#74d6cf" stroke="#3a9f9d" strokeWidth="1"/><circle cx="88" cy="45" r="1" fill="#26344d"/><circle cx="92" cy="45" r="1" fill="#26344d"/>
    </svg>
  ),
  g_houki: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cdeeff"/><stop offset="1" stopColor="#8fcdff"/></linearGradient>
        <linearGradient id="hGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a6e87a"/><stop offset="1" stopColor="#5fb04a"/></linearGradient>
      </defs>
      <rect width="100" height="85" fill="url(#hSky)"/>
      <path d="M0 85 L38 42 H62 L100 85 Z" fill="url(#hGrass)"/>
      <path d="M50 44 V85" stroke="#ffffff" strokeWidth="3" strokeDasharray="4 6"/>
      <circle cx="50" cy="38" r="13" fill="none" stroke="#9a6bff" strokeWidth="5"/>
      <path d="M38 70 l18 -6" stroke="#9b5a2a" strokeWidth="4" strokeLinecap="round"/>
      <path d="M56 64 l8 -3 -1 8 Z" fill="#e0b34d"/>
    </svg>
  ),
  g1: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="2" fill="white" opacity=".4"/>
      <circle cx="88" cy="16" r="1.5" fill="white" opacity=".3"/>
      <circle cx="22" cy="65" r="12" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"/>
      <circle cx="22" cy="65" r="10" fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeDasharray="8 55" opacity=".75"/>
      <circle cx="22" cy="65" r="10" fill="none" stroke="#7DF9FF" strokeWidth="1.5" strokeDasharray="8 55" strokeDashoffset="-8" opacity=".75"/>
      <ellipse cx="17" cy="59" rx="3" ry="2" fill="white" opacity=".65" transform="rotate(-30 17 59)"/>
      <circle cx="78" cy="60" r="10" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"/>
      <ellipse cx="73" cy="54" rx="2.5" ry="1.8" fill="white" opacity=".65" transform="rotate(-30 73 54)"/>
      <circle cx="50" cy="40" r="30" fill="rgba(255,255,255,.07)" stroke="white" strokeWidth="2"/>
      <circle cx="50" cy="40" r="28" fill="none" stroke="#FF6B6B" strokeWidth="2.5" strokeDasharray="16 158" opacity=".85"/>
      <circle cx="50" cy="40" r="28" fill="none" stroke="#FFD93D" strokeWidth="2.5" strokeDasharray="16 158" strokeDashoffset="-16" opacity=".85"/>
      <circle cx="50" cy="40" r="28" fill="none" stroke="#7DF9FF" strokeWidth="2.5" strokeDasharray="16 158" strokeDashoffset="-32" opacity=".85"/>
      <circle cx="50" cy="40" r="28" fill="none" stroke="#B8F7A8" strokeWidth="2.5" strokeDasharray="16 158" strokeDashoffset="-48" opacity=".85"/>
      <ellipse cx="37" cy="26" rx="9" ry="5" fill="white" opacity=".55" transform="rotate(-35 37 26)"/>
      <ellipse cx="61" cy="50" rx="4" ry="2" fill="white" opacity=".22" transform="rotate(-35 61 50)"/>
    </svg>
  ),
  g2: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="2" fill="#FFD700" opacity=".6"/>
      <circle cx="88" cy="15" r="1.5" fill="white" opacity=".5"/>
      <rect x="28" y="58" width="44" height="24" rx="4" fill="#8B4513" stroke="#5D2E0C" strokeWidth="2"/>
      <line x1="28" y1="65" x2="72" y2="65" stroke="#5D2E0C" strokeWidth="1.5"/>
      <line x1="28" y1="72" x2="72" y2="72" stroke="#5D2E0C" strokeWidth="1.5"/>
      <rect x="32" y="54" width="36" height="6" rx="3" fill="#A0522D" stroke="#5D2E0C" strokeWidth="1.5"/>
      <circle cx="30" cy="22" r="10" fill="#E53935" stroke="#B71C1C" strokeWidth="1.5"/>
      <ellipse cx="26" cy="17" rx="3" ry="2" fill="#EF9A9A" opacity=".6" transform="rotate(-20 26 17)"/>
      <rect x="29" y="11" width="2" height="5" rx="1" fill="#4CAF50"/>
      <path d="M55 30Q58 10 72 15Q78 18 72 28Q65 38 55 30" fill="#FFD700" stroke="#F57F17" strokeWidth="1.5"/>
      <ellipse cx="62" cy="17" rx="4" ry="2" fill="#FFF176" opacity=".5" transform="rotate(-25 62 17)"/>
      <path d="M40 44Q36 34 44 32Q52 30 52 42Q48 50 40 44" fill="#E53935" stroke="#B71C1C" strokeWidth="1.5"/>
      <ellipse cx="47" cy="32" rx="6" ry="3" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.2"/>
      <ellipse cx="43" cy="38" rx="1.2" ry="1.8" fill="#FFCDD2" stroke="#B71C1C" strokeWidth=".6"/>
      <ellipse cx="48" cy="36" rx="1.2" ry="1.8" fill="#FFCDD2" stroke="#B71C1C" strokeWidth=".6"/>
    </svg>
  ),
  g4: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="10" r="2" fill="white" opacity=".4"/>
      <rect x="10" y="15" width="35" height="35" rx="4" fill="#66BB6A" stroke="#2E7D32" strokeWidth="2"/>
      <circle cx="27.5" cy="49.5" r="5" fill="#66BB6A" stroke="#2E7D32" strokeWidth="2"/>
      <rect x="55" y="15" width="35" height="35" rx="4" fill="#42A5F5" stroke="#1565C0" strokeWidth="2"/>
      <circle cx="55" cy="32.5" r="5" fill="#42A5F5" stroke="#1565C0" strokeWidth="2"/>
      <circle cx="72.5" cy="49.5" r="5" fill="#42A5F5" stroke="#1565C0" strokeWidth="2"/>
      <rect x="32" y="50" width="36" height="28" rx="4" fill="#FFA726" stroke="#E65100" strokeWidth="2"/>
      <circle cx="50" cy="49.5" r="5" fill="rgba(255,255,255,.15)"/>
      <circle cx="23" cy="29" r="3" fill="white" stroke="#2E7D32" strokeWidth="1"/>
      <circle cx="23" cy="29" r="1.8" fill="#1a1a2e"/>
      <circle cx="32" cy="29" r="3" fill="white" stroke="#2E7D32" strokeWidth="1"/>
      <circle cx="32" cy="29" r="1.8" fill="#1a1a2e"/>
      <circle cx="68" cy="29" r="3" fill="white" stroke="#1565C0" strokeWidth="1"/>
      <circle cx="68" cy="29" r="1.8" fill="#1a1a2e"/>
      <circle cx="77" cy="29" r="3" fill="white" stroke="#1565C0" strokeWidth="1"/>
      <circle cx="77" cy="29" r="1.8" fill="#1a1a2e"/>
      <circle cx="46" cy="63" r="3" fill="white" stroke="#E65100" strokeWidth="1"/>
      <circle cx="46" cy="63" r="1.8" fill="#1a1a2e"/>
      <circle cx="55" cy="63" r="3" fill="white" stroke="#E65100" strokeWidth="1"/>
      <circle cx="55" cy="63" r="1.8" fill="#1a1a2e"/>
    </svg>
  ),
  g5: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#dff4ff"/>
      <rect x="7" y="8" width="25" height="11" rx="4" fill="#2e78c7"/><rect x="10" y="11" width="11" height="3" rx="1.5" fill="#fff" opacity=".8"/>
      <rect x="68" y="8" width="25" height="11" rx="4" fill="#ff866c"/><rect x="71" y="11" width="11" height="3" rx="1.5" fill="#fff" opacity=".8"/>
      <path d="M0 70 Q25 63 50 71 Q75 78 100 68 V85H0Z" fill="#93d66e"/>
      <g fill="#ffb347" stroke="#d97a21" strokeWidth="1"><circle cx="24" cy="42" r="6"/><circle cx="38" cy="50" r="6"/><circle cx="67" cy="40" r="6"/></g>
      <g transform="translate(52 58)"><circle cy="-12" r="9" fill="#ffd6aa"/><path d="M-7 -16 L-10 -24 L-3 -19 M7 -16 L10 -24 L3 -19" fill="#ffd6aa"/><rect x="-9" y="-3" width="18" height="17" rx="7" fill="#4ba0e8"/><circle cx="-3" cy="-12" r="1" fill="#372e43"/><circle cx="3" cy="-12" r="1" fill="#372e43"/></g>
      <rect x="73" y="55" width="18" height="19" rx="5" fill="#fff" stroke="#5788be" strokeWidth="1.5"/><circle cx="82" cy="65" r="5" fill="#ffcf4d"/><path d="M80 65h4M82 63v4" stroke="#9d681a" strokeWidth="1"/>
      <text x="50" y="17" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">★</text>
    </svg>
  ),
  g6: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#66bf74"/>
      <rect x="5" y="7" width="24" height="10" rx="4" fill="#1e5845" opacity=".85"/><rect x="9" y="10" width="6" height="3" rx="1" fill="#fff"/><rect x="18" y="10" width="7" height="3" rx="1" fill="#ffdc62"/>
      <path d="M50 19V85 M0 52H100" stroke="#e9fff2" strokeWidth="1.4" opacity=".7"/><circle cx="50" cy="52" r="13" fill="none" stroke="#e9fff2" strokeWidth="1.4" opacity=".7"/>
      <path d="M78 24 H96 V47 H84" fill="none" stroke="#fff" strokeWidth="2"/><path d="M4 58 H20 V78 H4" fill="none" stroke="#fff" strokeWidth="2"/>
      <g transform="translate(47 55)"><circle cy="-10" r="7" fill="#f5c99d"/><rect x="-8" y="-2" width="16" height="18" rx="6" fill="#ffd333"/><path d="M0 -25 L5 -18 H-5Z" fill="#ffd333" stroke="#aa8114" strokeWidth="1"/></g>
      <g transform="translate(66 42)"><circle cy="-8" r="6" fill="#f5c99d"/><rect x="-7" y="-1" width="14" height="16" rx="6" fill="#4d9fe9"/></g>
      <g transform="translate(34 38)"><circle cy="-7" r="6" fill="#f5c99d"/><rect x="-7" y="-1" width="14" height="16" rx="6" fill="#ef6670"/></g>
      <circle cx="55" cy="65" r="6" fill="#fff" stroke="#263449" strokeWidth="1.4"/><path d="M55 60 l3 2 -1 3h-4l-1-3z" fill="#263449"/>
    </svg>
  ),
  g8: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="2" fill="#FFD700" opacity=".6"/>
      <rect x="4" y="56" width="92" height="16" rx="8" fill="#795548" stroke="#4E342E" strokeWidth="2"/>
      <rect x="8" y="59" width="84" height="10" rx="5" fill="#5D4037"/>
      <line x1="22" y1="57" x2="22" y2="71" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
      <line x1="40" y1="57" x2="40" y2="71" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
      <line x1="58" y1="57" x2="58" y2="71" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
      <line x1="76" y1="57" x2="76" y2="71" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
      <rect x="32" y="42" width="36" height="16" rx="5" fill="#FFF8DC" stroke="#C8A855" strokeWidth="1.5"/>
      <rect x="34" y="42" width="32" height="8" rx="4" fill="#FF7043" stroke="#BF360C" strokeWidth="1.5"/>
      <ellipse cx="42" cy="44" rx="5" ry="2" fill="#FF8A65" opacity=".6" transform="rotate(-15 42 44)"/>
      <ellipse cx="65" cy="26" rx="20" ry="12" fill="#FF7043" stroke="#BF360C" strokeWidth="1.5"/>
      <path d="M84 26L94 18L94 34Z" fill="#FF7043" stroke="#BF360C" strokeWidth="1.5"/>
      <circle cx="58" cy="23" r="4" fill="white" stroke="#BF360C" strokeWidth="1"/>
      <circle cx="59" cy="23" r="2.2" fill="#1a1a2e"/>
      <circle cx="59.5" cy="22.2" r=".8" fill="white"/>
      <ellipse cx="55" cy="27" rx="3.5" ry="2" fill="#FF8A65" opacity=".6"/>
      <path d="M60 29Q65 32 70 29" stroke="#BF360C" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  g9: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="76" width="100" height="9" fill="rgba(0,0,0,.2)"/>
      <circle cx="14" cy="20" r="2" fill="#FFD700" opacity=".7"/>
      <circle cx="86" cy="25" r="1.5" fill="white" opacity=".6"/>
      <line x1="30" y1="51" x2="16" y2="39" stroke="#B71C1C" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="13" cy="37" r="5" fill="#FFCDD2" stroke="#B71C1C" strokeWidth="1.5"/>
      <line x1="70" y1="51" x2="84" y2="39" stroke="#B71C1C" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="86" cy="37" r="5" fill="#FFCDD2" stroke="#B71C1C" strokeWidth="1.5"/>
      <ellipse cx="50" cy="16" rx="22" ry="7" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2"/>
      <path d="M30 16Q35 3 50 9Q65 3 70 16" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2"/>
      <path d="M36 14Q40 5 50 9" fill="#66BB6A"/>
      <path d="M25 30Q20 55 50 73Q80 55 75 30Q62 18 50 20Q38 18 25 30" fill="#E53935" stroke="#B71C1C" strokeWidth="2.5"/>
      <path d="M30 33Q26 51 36 63" stroke="rgba(255,255,255,.35)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <ellipse cx="42" cy="46" rx="2" ry="3" fill="#FFCDD2" stroke="#B71C1C" strokeWidth=".8" transform="rotate(-10 42 46)"/>
      <ellipse cx="52" cy="42" rx="2" ry="3" fill="#FFCDD2" stroke="#B71C1C" strokeWidth=".8" transform="rotate(8 52 42)"/>
      <ellipse cx="60" cy="49" rx="2" ry="3" fill="#FFCDD2" stroke="#B71C1C" strokeWidth=".8" transform="rotate(15 60 49)"/>
      <ellipse cx="46" cy="58" rx="2" ry="3" fill="#FFCDD2" stroke="#B71C1C" strokeWidth=".8"/>
      <ellipse cx="57" cy="61" rx="2" ry="3" fill="#FFCDD2" stroke="#B71C1C" strokeWidth=".8" transform="rotate(12 57 61)"/>
      <circle cx="42" cy="41" r="5" fill="white" stroke="#B71C1C" strokeWidth="1.2"/>
      <circle cx="58" cy="41" r="5" fill="white" stroke="#B71C1C" strokeWidth="1.2"/>
      <circle cx="43" cy="41" r="3" fill="#1a1a2e"/>
      <circle cx="59" cy="41" r="3" fill="#1a1a2e"/>
      <circle cx="43.8" cy="39.8" r="1.2" fill="white"/>
      <circle cx="59.8" cy="39.8" r="1.2" fill="white"/>
      <ellipse cx="37" cy="46" rx="4" ry="3" fill="#FF8A80" opacity=".65"/>
      <ellipse cx="63" cy="46" rx="4" ry="3" fill="#FF8A80" opacity=".65"/>
      <path d="M43 50Q50 56 57 50" stroke="#B71C1C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="40" y1="74" x2="36" y2="84" stroke="#B71C1C" strokeWidth="4" strokeLinecap="round"/>
      <line x1="60" y1="74" x2="64" y2="84" stroke="#B71C1C" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),
  g10: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="75" cy="12" r="10" fill="#FFD700" stroke="#F57F17" strokeWidth="1.5" opacity=".85"/>
      <rect x="8" y="54" width="10" height="31" rx="2" fill="#5D4037" stroke="#3E2723" strokeWidth="1.5"/>
      <ellipse cx="13" cy="52" rx="17" ry="25" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2"/>
      <ellipse cx="13" cy="45" rx="12" ry="18" fill="#388E3C"/>
      <circle cx="9" cy="48" r="4" fill="#8D6E63" stroke="#4E342E" strokeWidth="1.5"/>
      <circle cx="17" cy="48" r="4" fill="#8D6E63" stroke="#4E342E" strokeWidth="1.5"/>
      <circle cx="9.8" cy="47.5" r="2" fill="#1a1a2e"/>
      <circle cx="17.8" cy="47.5" r="2" fill="#1a1a2e"/>
      <circle cx="10.3" cy="46.7" r=".8" fill="white"/>
      <circle cx="18.3" cy="46.7" r=".8" fill="white"/>
      <rect x="43" y="50" width="12" height="35" rx="2" fill="#5D4037" stroke="#3E2723" strokeWidth="1.5"/>
      <ellipse cx="49" cy="45" rx="21" ry="30" fill="#388E3C" stroke="#1B5E20" strokeWidth="2"/>
      <ellipse cx="49" cy="36" rx="15" ry="22" fill="#43A047"/>
      <circle cx="44" cy="46" r="4.5" fill="#FF8F00" stroke="#E65100" strokeWidth="1.5"/>
      <circle cx="54" cy="46" r="4.5" fill="#FF8F00" stroke="#E65100" strokeWidth="1.5"/>
      <circle cx="44.8" cy="45.5" r="2.2" fill="#1a1a2e"/>
      <circle cx="54.8" cy="45.5" r="2.2" fill="#1a1a2e"/>
      <circle cx="45.3" cy="44.7" r=".9" fill="white"/>
      <circle cx="55.3" cy="44.7" r=".9" fill="white"/>
      <rect x="78" y="56" width="10" height="29" rx="2" fill="#5D4037" stroke="#3E2723" strokeWidth="1.5"/>
      <ellipse cx="83" cy="54" rx="17" ry="25" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2"/>
      <ellipse cx="83" cy="47" rx="12" ry="18" fill="#388E3C"/>
      <ellipse cx="79" cy="39" rx="3" ry="7" fill="#F8C8D4" stroke="#C2185B" strokeWidth="1.2"/>
      <ellipse cx="87" cy="39" rx="3" ry="7" fill="#F8C8D4" stroke="#C2185B" strokeWidth="1.2"/>
      <ellipse cx="79" cy="39" rx="1.5" ry="4" fill="#FFB6C1"/>
      <ellipse cx="87" cy="39" rx="1.5" ry="4" fill="#FFB6C1"/>
      <text x="34" y="27" textAnchor="middle" fontSize="14" fill="#FFD700" fontWeight="bold" opacity=".85">?</text>
      <text x="64" y="20" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" opacity=".65">?</text>
    </svg>
  ),
  g11: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="12" r="2" fill="white" opacity=".4"/>
      <rect x="12" y="20" width="32" height="32" rx="6" fill="#66BB6A" stroke="#2E7D32" strokeWidth="2"/>
      <rect x="14" y="22" width="14" height="7" rx="2" fill="#A5D6A7" opacity=".5"/>
      <text x="28" y="44" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white">あ</text>
      <rect x="56" y="14" width="32" height="32" rx="6" fill="#42A5F5" stroke="#1565C0" strokeWidth="2"/>
      <rect x="58" y="16" width="14" height="7" rx="2" fill="#90CAF9" opacity=".5"/>
      <text x="72" y="38" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white">い</text>
      <rect x="30" y="52" width="40" height="28" rx="6" fill="#FFA726" stroke="#E65100" strokeWidth="2"/>
      <rect x="32" y="54" width="18" height="6" rx="2" fill="#FFCC80" opacity=".5"/>
      <text x="50" y="72" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">う</text>
      <circle cx="8" cy="52" r="3" fill="#FFD700" opacity=".7"/>
      <circle cx="94" cy="48" r="2.5" fill="#FF6B6B" opacity=".6"/>
    </svg>
  ),
  g12: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="12" r="2" fill="#FFD700" opacity=".6"/>
      <rect x="8" y="38" width="24" height="30" rx="4" fill="#FF5252" stroke="#B71C1C" strokeWidth="2"/>
      <rect x="10" y="40" width="10" height="7" rx="2" fill="#FF8A80" opacity=".5"/>
      <text x="20" y="62" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">1</text>
      <text x="38" y="59" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">+</text>
      <rect x="52" y="38" width="24" height="30" rx="4" fill="#66BB6A" stroke="#2E7D32" strokeWidth="2"/>
      <rect x="54" y="40" width="10" height="7" rx="2" fill="#A5D6A7" opacity=".5"/>
      <text x="64" y="62" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">2</text>
      <text x="83" y="59" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">=</text>
      <rect x="18" y="12" width="64" height="20" rx="5" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
      <text x="50" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">？</text>
      <circle cx="20" cy="72" r="4" fill="#FF8F00" stroke="#E65100" strokeWidth="1"/>
      <circle cx="30" cy="72" r="4" fill="#FF8F00" stroke="#E65100" strokeWidth="1"/>
      <circle cx="56" cy="72" r="4" fill="#388E3C" stroke="#1B5E20" strokeWidth="1"/>
      <circle cx="66" cy="72" r="4" fill="#388E3C" stroke="#1B5E20" strokeWidth="1"/>
      <circle cx="76" cy="72" r="4" fill="#388E3C" stroke="#1B5E20" strokeWidth="1"/>
    </svg>
  ),
  g13: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="12" r="2" fill="white" opacity=".4"/>
      <ellipse cx="50" cy="45" rx="36" ry="32" fill="#FFF3E0" stroke="#E65100" strokeWidth="2"/>
      <ellipse cx="56" cy="50" rx="12" ry="10" fill="#FFF3E0" opacity=".9"/>
      <circle cx="24" cy="38" r="8" fill="#E53935"/>
      <circle cx="50" cy="20" r="8" fill="#FFD700"/>
      <circle cx="76" cy="38" r="8" fill="#1565C0"/>
      <circle cx="62" cy="58" r="7" fill="#66BB6A"/>
      <circle cx="38" cy="58" r="7" fill="#9C27B0"/>
      <ellipse cx="38" cy="30" rx="8" ry="5" fill="white" opacity=".3" transform="rotate(-30 38 30)"/>
      <rect x="70" y="62" width="8" height="20" rx="3" fill="#E53935" stroke="#B71C1C" strokeWidth="1.2"/>
      <rect x="71" y="60" width="6" height="5" rx="1" fill="#8D6E63"/>
      <circle cx="50" cy="52" r="5" fill="#FF6B6B" opacity=".7"/>
    </svg>
  ),
  g14: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="14" r="11" fill="#FFD700" stroke="#F57F17" strokeWidth="1.5"/>
      <line x1="80" y1="0" x2="80" y2="4" stroke="#F57F17" strokeWidth="1.5" opacity=".7"/>
      <line x1="93" y1="4" x2="90" y2="7" stroke="#F57F17" strokeWidth="1.5" opacity=".7"/>
      <line x1="95" y1="14" x2="91" y2="14" stroke="#F57F17" strokeWidth="1.5" opacity=".7"/>
      <rect x="0" y="70" width="100" height="15" fill="#757575"/>
      <rect x="20" y="77" width="12" height="4" rx="1" fill="white" opacity=".8"/>
      <rect x="46" y="77" width="12" height="4" rx="1" fill="white" opacity=".8"/>
      <rect x="72" y="77" width="12" height="4" rx="1" fill="white" opacity=".8"/>
      <rect x="8" y="32" width="22" height="40" rx="2" fill="#F48FB1" stroke="#C2185B" strokeWidth="1.5"/>
      <rect x="10" y="34" width="18" height="6" rx="1" fill="#FCE4EC" opacity=".5"/>
      <rect x="12" y="44" width="5" height="6" rx="1" fill="#80DEEA" stroke="#0097A7" strokeWidth=".8"/>
      <rect x="20" y="44" width="5" height="6" rx="1" fill="#80DEEA" stroke="#0097A7" strokeWidth=".8"/>
      <rect x="12" y="54" width="5" height="6" rx="1" fill="#FFE082" stroke="#F57F17" strokeWidth=".8"/>
      <rect x="20" y="54" width="5" height="6" rx="1" fill="#80DEEA" stroke="#0097A7" strokeWidth=".8"/>
      <rect x="36" y="18" width="28" height="54" rx="2" fill="#FF9800" stroke="#E65100" strokeWidth="2"/>
      <rect x="38" y="20" width="24" height="8" rx="1" fill="#FFE0B2" opacity=".5"/>
      <rect x="40" y="32" width="7" height="7" rx="1" fill="#80DEEA" stroke="#0097A7" strokeWidth=".8"/>
      <rect x="51" y="32" width="7" height="7" rx="1" fill="#FFE082" stroke="#F57F17" strokeWidth=".8"/>
      <rect x="40" y="44" width="7" height="7" rx="1" fill="#FFE082" stroke="#F57F17" strokeWidth=".8"/>
      <rect x="51" y="44" width="7" height="7" rx="1" fill="#80DEEA" stroke="#0097A7" strokeWidth=".8"/>
      <rect x="40" y="56" width="7" height="7" rx="1" fill="#80DEEA" stroke="#0097A7" strokeWidth=".8"/>
      <rect x="51" y="56" width="7" height="7" rx="1" fill="#FFE082" stroke="#F57F17" strokeWidth=".8"/>
      <line x1="50" y1="18" x2="50" y2="6" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="50" cy="4" r="3" fill="#FF5252"/>
      <rect x="70" y="38" width="24" height="34" rx="2" fill="#66BB6A" stroke="#2E7D32" strokeWidth="1.5"/>
      <rect x="72" y="40" width="20" height="6" rx="1" fill="#C8E6C9" opacity=".5"/>
      <rect x="74" y="50" width="5" height="6" rx="1" fill="#80DEEA" stroke="#0097A7" strokeWidth=".8"/>
      <rect x="82" y="50" width="5" height="6" rx="1" fill="#FFE082" stroke="#F57F17" strokeWidth=".8"/>
      <rect x="74" y="60" width="5" height="6" rx="1" fill="#FFE082" stroke="#F57F17" strokeWidth=".8"/>
      <rect x="82" y="60" width="5" height="6" rx="1" fill="#80DEEA" stroke="#0097A7" strokeWidth=".8"/>
      <rect x="26" y="62" width="5" height="8" rx="1" fill="#5D4037" stroke="#3E2723" strokeWidth="1"/>
      <circle cx="28.5" cy="60" r="7" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.2"/>
    </svg>
  ),
  g15: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#dff4ff"/>
      <rect x="6" y="7" width="27" height="12" rx="4" fill="#1b568e"/><circle cx="14" cy="13" r="2" fill="#fff"/><rect x="19" y="11" width="9" height="3" rx="1.5" fill="#a8dcff"/>
      <circle cx="52" cy="47" r="30" fill="#1565C0" stroke="#0D47A1" strokeWidth="2.5"/>
      <path d="M30 34Q40 28 48 34Q52 40 45 46Q38 50 33 44Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1"/>
      <path d="M55 32Q65 26 72 34Q76 42 68 48Q60 52 55 44Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1"/>
      <path d="M38 54Q50 51 56 59Q54 68 44 69Q36 66 36 58Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1"/>
      <path d="M60 56Q70 54 74 62Q72 70 64 70Q58 66 60 58Z" fill="#66BB6A" stroke="#2E7D32" strokeWidth="1"/>
      <ellipse cx="38" cy="34" rx="10" ry="7" fill="white" opacity=".2" transform="rotate(-30 38 34)"/>
      <circle cx="46" cy="46" r="4" fill="white" stroke="#0D47A1" strokeWidth="1"/>
      <circle cx="58" cy="46" r="4" fill="white" stroke="#0D47A1" strokeWidth="1"/>
      <circle cx="47" cy="46" r="2.5" fill="#1a1a2e"/>
      <circle cx="59" cy="46" r="2.5" fill="#1a1a2e"/>
      <circle cx="47.8" cy="45" r="1" fill="white"/>
      <circle cx="59.8" cy="45" r="1" fill="white"/>
      <path d="M47 52Q52 56 57 52" stroke="#0D47A1" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="70" y="10" width="23" height="16" rx="3" fill="#fff" stroke="#5e86b0" strokeWidth="1.2"/>
      <rect x="72" y="12" width="19" height="12" fill="#e64d56"/><path d="M72 16 H91" stroke="#fff" strokeWidth="2"/><path d="M78 12V24" stroke="#fff" strokeWidth="2"/>
      <path d="M68 30 Q76 34 84 30" fill="none" stroke="#fff" strokeWidth="1.8" strokeDasharray="3 2"/>
    </svg>
  ),
  g16: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#261747"/>
      <rect x="6" y="7" width="30" height="11" rx="4" fill="#593d8d"/><circle cx="14" cy="12" r="2" fill="#ffdd55"/><rect x="19" y="10" width="11" height="3" rx="1.5" fill="#fff" opacity=".85"/>
      <rect x="10" y="24" width="80" height="52" rx="7" fill="#fff8ed" stroke="#bba7d5" strokeWidth="2"/>
      <path d="M10 61 H90" stroke="#d6c2e9" strokeWidth="1.5"/>
      <polygon points="38,29 51,44 38,59 25,44" fill="#ff6588" stroke="#a92b58" strokeWidth="1.5"/><path d="M38 29V59M25 44H51" stroke="#ffb7c8" strokeWidth="1"/>
      <polygon points="66,32 78,46 66,60 54,46" fill="#5fbdf1" stroke="#2474af" strokeWidth="1.5"/><path d="M66 32V60M54 46H78" stroke="#c9f2ff" strokeWidth="1"/>
      <circle cx="22" cy="69" r="5" fill="#ffd24d"/><circle cx="38" cy="69" r="5" fill="#76cf77"/><circle cx="54" cy="69" r="5" fill="#a98bff"/>
      <path d="M82 18 L92 29 L86 30 L89 39 L84 41 L81 31 L76 35 Z" fill="#fff" stroke="#6c578e" strokeWidth="1.3"/>
    </svg>
  ),
  s1: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="10" r="2" fill="white" opacity=".4"/>
      <rect x="20" y="50" width="60" height="12" rx="3" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.5"/>
      <rect x="22" y="52" width="20" height="4" rx="1" fill="#A5D6A7" opacity=".4"/>
      <rect x="20" y="38" width="12" height="12" rx="3" fill="#42A5F5" stroke="#1565C0" strokeWidth="1.5"/>
      <rect x="32" y="38" width="12" height="12" rx="3" fill="#42A5F5" stroke="#1565C0" strokeWidth="1.5"/>
      <rect x="44" y="26" width="12" height="12" rx="3" fill="#42A5F5" stroke="#1565C0" strokeWidth="1.5"/>
      <rect x="44" y="38" width="12" height="12" rx="3" fill="#42A5F5" stroke="#1565C0" strokeWidth="1.5"/>
      <rect x="56" y="14" width="12" height="12" rx="3" fill="#FF5252" stroke="#B71C1C" strokeWidth="1.5"/>
      <rect x="56" y="26" width="12" height="12" rx="3" fill="#FF5252" stroke="#B71C1C" strokeWidth="1.5"/>
      <rect x="68" y="26" width="12" height="12" rx="3" fill="#FF5252" stroke="#B71C1C" strokeWidth="1.5"/>
      <circle cx="26" cy="44" r="2" fill="white" stroke="#1565C0" strokeWidth=".8"/>
      <circle cx="26.5" cy="44" r="1" fill="#1a1a2e"/>
      <circle cx="38" cy="44" r="2" fill="white" stroke="#1565C0" strokeWidth=".8"/>
      <circle cx="38.5" cy="44" r="1" fill="#1a1a2e"/>
      <rect x="8" y="8" width="12" height="12" rx="3" fill="#FFD700" stroke="#F57F17" strokeWidth="1.5" opacity=".8"/>
      <rect x="8" y="20" width="12" height="12" rx="3" fill="#FFD700" stroke="#F57F17" strokeWidth="1.5" opacity=".8"/>
    </svg>
  ),
  s2: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="12" r="2" fill="#FFD700" opacity=".6"/>
      <rect x="0" y="68" width="100" height="17" rx="3" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.5"/>
      <rect x="72" y="54" width="10" height="15" rx="2" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5"/>
      <rect x="86" y="46" width="10" height="23" rx="2" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5"/>
      <ellipse cx="30" cy="52" rx="18" ry="12" fill="#FF8F00" stroke="#E65100" strokeWidth="2"/>
      <ellipse cx="44" cy="46" rx="10" ry="12" fill="#FF8F00" stroke="#E65100" strokeWidth="2"/>
      <polygon points="38,36 42,25 46,36" fill="#FF8F00" stroke="#E65100" strokeWidth="1.5"/>
      <polygon points="39,36 42,28 45,36" fill="#FFCDD2"/>
      <polygon points="48,34 52,23 56,34" fill="#FF8F00" stroke="#E65100" strokeWidth="1.5"/>
      <polygon points="49,34 52,26 55,34" fill="#FFCDD2"/>
      <circle cx="48" cy="42" r="3" fill="white" stroke="#E65100" strokeWidth="1"/>
      <circle cx="48.6" cy="42" r="1.8" fill="#1a1a2e"/>
      <circle cx="49" cy="41.2" r=".7" fill="white"/>
      <ellipse cx="44" cy="47" rx="3" ry="2" fill="#FFCCBC" opacity=".7"/>
      <path d="M13 58Q0 50 4 40Q8 36 14 46" fill="#FF8F00" stroke="#E65100" strokeWidth="1.5"/>
      <ellipse cx="6" cy="40" rx="4" ry="6" fill="white" stroke="#E65100" strokeWidth="1"/>
      <line x1="22" y1="63" x2="16" y2="76" stroke="#E65100" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="63" x2="38" y2="76" stroke="#E65100" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  s3: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="30" r="1.5" fill="white" opacity=".5"/>
      <circle cx="75" cy="18" r="1" fill="white" opacity=".4"/>
      <circle cx="50" cy="8" r="1.5" fill="white" opacity=".5"/>
      <ellipse cx="50" cy="45" rx="12" ry="22" fill="#E53935" stroke="#B71C1C" strokeWidth="2"/>
      <polygon points="50,15 40,30 60,30" fill="#FF7043" stroke="#BF360C" strokeWidth="1.5"/>
      <rect x="38" y="52" width="24" height="8" rx="2" fill="#C62828"/>
      <circle cx="50" cy="38" r="7" fill="#B2EBF2" stroke="#00838F" strokeWidth="1.5"/>
      <circle cx="50" cy="38" r="5" fill="#E0F7FA"/>
      <circle cx="47" cy="37" r="1.5" fill="#1a1a2e"/>
      <circle cx="53" cy="37" r="1.5" fill="#1a1a2e"/>
      <path d="M47 41Q50 43 53 41" stroke="#00838F" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <ellipse cx="44" cy="64" rx="4" ry="8" fill="#FF9800" opacity=".9"/>
      <ellipse cx="56" cy="64" rx="4" ry="8" fill="#FF9800" opacity=".9"/>
      <ellipse cx="50" cy="66" rx="5" ry="10" fill="#FFD700" opacity=".8"/>
      <polygon points="28,42 38,36 38,58" fill="#C62828" stroke="#B71C1C" strokeWidth="1.5"/>
      <polygon points="72,42 62,36 62,58" fill="#C62828" stroke="#B71C1C" strokeWidth="1.5"/>
      <circle cx="22" cy="22" r="8" fill="#7B1FA2" stroke="#4A148C" strokeWidth="1.5"/>
      <circle cx="19" cy="20" r="2" fill="white" stroke="#4A148C" strokeWidth=".8"/>
      <circle cx="25" cy="20" r="2" fill="white" stroke="#4A148C" strokeWidth=".8"/>
      <circle cx="19.5" cy="20" r="1" fill="#1a1a2e"/>
      <circle cx="25.5" cy="20" r="1" fill="#1a1a2e"/>
      <circle cx="80" cy="15" r="7" fill="#1565C0" stroke="#0D47A1" strokeWidth="1.5"/>
      <circle cx="77" cy="13" r="1.8" fill="white" stroke="#0D47A1" strokeWidth=".8"/>
      <circle cx="83" cy="13" r="1.8" fill="white" stroke="#0D47A1" strokeWidth=".8"/>
    </svg>
  ),
  s4: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="10" r="2" fill="white" opacity=".4"/>
      <circle cx="50" cy="42" r="34" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2"/>
      <circle cx="50" cy="42" r="25" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2"/>
      <circle cx="50" cy="42" r="16" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="2"/>
      <circle cx="50" cy="42" r="7" fill="#FF5252" stroke="white" strokeWidth="2"/>
      <line x1="50" y1="5" x2="50" y2="78" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" strokeDasharray="4 4"/>
      <line x1="8" y1="42" x2="92" y2="42" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" strokeDasharray="4 4"/>
      <circle cx="50" cy="42" r="5" fill="#FF8F00" stroke="#E65100" strokeWidth="1.2"/>
      <circle cx="22" cy="22" r="9" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.5"/>
      <circle cx="20" cy="20" r="2.5" fill="white" stroke="#2E7D32" strokeWidth=".8"/>
      <circle cx="24" cy="20" r="2.5" fill="white" stroke="#2E7D32" strokeWidth=".8"/>
      <circle cx="20.5" cy="20" r="1.2" fill="#1a1a2e"/>
      <circle cx="24.5" cy="20" r="1.2" fill="#1a1a2e"/>
      <circle cx="78" cy="65" r="9" fill="#E91E63" stroke="#880E4F" strokeWidth="1.5"/>
      <circle cx="76" cy="63" r="2.5" fill="white" stroke="#880E4F" strokeWidth=".8"/>
      <circle cx="80" cy="63" r="2.5" fill="white" stroke="#880E4F" strokeWidth=".8"/>
      <circle cx="76.5" cy="63" r="1.2" fill="#1a1a2e"/>
      <circle cx="80.5" cy="63" r="1.2" fill="#1a1a2e"/>
    </svg>
  ),
  g_mori: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="#87CEEB" rx="8"/>
      <circle cx="170" cy="25" r="18" fill="#FFD700" opacity="0.9"/>
      <polygon points="30,110 55,60 80,110" fill="#2d7a2d"/>
      <polygon points="60,110 85,55 110,110" fill="#3a9a3a"/>
      <polygon points="130,110 155,58 180,110" fill="#2d7a2d"/>
      <rect y="108" width="200" height="32" fill="#5a8f3c"/>
      <rect y="108" width="200" height="8" fill="#7ab84a"/>
      <rect x="82" y="88" width="36" height="10" fill="#e09a55" rx="2"/>
      <line x1="91" y1="88" x2="91" y2="98" stroke="#c8884a" strokeWidth="1"/>
      <line x1="99" y1="88" x2="99" y2="98" stroke="#c8884a" strokeWidth="1"/>
      <line x1="107" y1="88" x2="107" y2="98" stroke="#c8884a" strokeWidth="1"/>
      <ellipse cx="65" cy="90" rx="10" ry="11" fill="#E8834A"/>
      <ellipse cx="65" cy="84" rx="7" ry="7" fill="#E8834A"/>
      <polygon points="59,79 57,71 63,76" fill="#E8834A"/>
      <polygon points="71,79 73,71 67,76" fill="#E8834A"/>
      <ellipse cx="65" cy="84" rx="4" ry="4" fill="#f5c499"/>
      <circle cx="63" cy="82" r="1.2" fill="#222"/>
      <circle cx="67" cy="82" r="1.2" fill="#222"/>
      <line x1="20" y1="92" x2="45" y2="92" stroke="white" strokeWidth="2" opacity="0.6"/>
      <line x1="15" y1="96" x2="40" y2="96" stroke="white" strokeWidth="1.5" opacity="0.4"/>
      <polygon points="100,70 102,76 108,76 103,80 105,86 100,82 95,86 97,80 92,76 98,76" fill="#FFD700" opacity="0.9"/>
    </svg>
  ),
  g_sora: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skys" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a237e"/>
          <stop offset="100%" stopColor="#3F51B5"/>
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill="url(#skys)" rx="8"/>
      <circle cx="20" cy="15" r="2" fill="white" opacity="0.8"/>
      <circle cx="50" cy="8" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="170" cy="12" r="2" fill="white" opacity="0.8"/>
      <circle cx="90" cy="10" r="1.5" fill="white" opacity="0.7"/>
      <ellipse cx="40" cy="45" rx="20" ry="10" fill="white" opacity="0.25"/>
      <ellipse cx="160" cy="60" rx="18" ry="9" fill="white" opacity="0.2"/>
      <circle cx="150" cy="40" r="12" fill="#E53935"/>
      <circle cx="148" cy="37" r="3" fill="white"/>
      <circle cx="153" cy="37" r="3" fill="white"/>
      <circle cx="148" cy="38" r="1.5" fill="#222"/>
      <circle cx="153" cy="38" r="1.5" fill="#222"/>
      <circle cx="30" cy="75" r="10" fill="#8E24AA"/>
      <circle cx="28" cy="73" r="2.5" fill="white"/>
      <circle cx="32" cy="73" r="2.5" fill="white"/>
      <circle cx="28" cy="74" r="1.2" fill="#222"/>
      <circle cx="32" cy="74" r="1.2" fill="#222"/>
      <ellipse cx="95" cy="92" rx="11" ry="14" fill="#E91E63"/>
      <path d="M84,97 Q95,115 106,97 Z" fill="#F48FB1"/>
      <ellipse cx="95" cy="78" rx="9" ry="10" fill="#FFCDD2"/>
      <ellipse cx="95" cy="72" rx="9" ry="7" fill="#FFD700"/>
      <polygon points="88,69 90,62 93,67 95,60 97,67 100,62 102,69" fill="#FFD700"/>
      <circle cx="95" cy="61" r="2" fill="#E91E63"/>
      <circle cx="92" cy="76" r="1.8" fill="#222"/>
      <circle cx="98" cy="76" r="1.8" fill="#222"/>
      <ellipse cx="82" cy="85" rx="10" ry="5" fill="white" opacity="0.7" transform="rotate(-20,82,85)"/>
      <ellipse cx="108" cy="85" rx="10" ry="5" fill="white" opacity="0.7" transform="rotate(20,108,85)"/>
      <circle cx="120" cy="72" r="4" fill="#FFD700"/>
      <circle cx="137" cy="62" r="4" fill="#FFD700"/>
      <circle cx="154" cy="52" r="4" fill="#FFD700"/>
    </svg>
  ),
  g_bike: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8F00"/>
          <stop offset="100%" stopColor="#FF6D00"/>
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill="url(#sky2)" rx="8"/>
      <rect y="95" width="200" height="45" fill="#455A64"/>
      <rect y="95" width="200" height="6" fill="#546E7A"/>
      <rect x="10" y="115" width="30" height="4" fill="white" opacity="0.8" rx="2"/>
      <rect x="60" y="115" width="30" height="4" fill="white" opacity="0.8" rx="2"/>
      <rect x="110" y="115" width="30" height="4" fill="white" opacity="0.8" rx="2"/>
      <rect x="160" y="115" width="30" height="4" fill="white" opacity="0.8" rx="2"/>
      <line x1="0" y1="70" x2="50" y2="70" stroke="white" strokeWidth="2" opacity="0.5"/>
      <line x1="0" y1="78" x2="40" y2="78" stroke="white" strokeWidth="1.5" opacity="0.35"/>
      <line x1="0" y1="85" x2="55" y2="85" stroke="white" strokeWidth="2" opacity="0.45"/>
      <circle cx="95" cy="93" r="18" fill="#212121"/>
      <circle cx="95" cy="93" r="12" fill="#37474F"/>
      <circle cx="95" cy="93" r="5" fill="#212121"/>
      <circle cx="145" cy="96" r="16" fill="#212121"/>
      <circle cx="145" cy="96" r="10" fill="#37474F"/>
      <circle cx="145" cy="96" r="4" fill="#212121"/>
      <path d="M100,78 L130,72 L148,80 L140,93" stroke="#FF6D00" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M100,78 L95,93" stroke="#FF6D00" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <ellipse cx="118" cy="80" rx="16" ry="8" fill="#E64A19"/>
      <ellipse cx="118" cy="78" rx="12" ry="5" fill="#FF7043"/>
      <ellipse cx="120" cy="62" rx="10" ry="14" fill="#1565C0"/>
      <circle cx="120" cy="52" r="12" fill="#F44336"/>
      <rect x="113" y="54" width="14" height="6" fill="#212121" rx="3"/>
      <circle cx="75" cy="90" r="5" fill="white" opacity="0.3"/>
      <circle cx="65" cy="86" r="4" fill="white" opacity="0.2"/>
      <rect x="170" y="30" width="3" height="40" fill="white" opacity="0.8"/>
      <rect x="173" y="30" width="8" height="8" fill="#222"/>
      <rect x="181" y="30" width="8" height="8" fill="white"/>
      <rect x="173" y="38" width="8" height="8" fill="white"/>
      <rect x="181" y="38" width="8" height="8" fill="#222"/>
    </svg>
  ),
  g_usagi: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="2" fill="#FFD700" opacity=".6"/>
      <circle cx="86" cy="16" r="1.5" fill="#fff" opacity=".6"/>
      <g transform="rotate(20 26 20)">
        <path d="M22 14 L30 14 L26 31 Z" fill="#ff8a3d" stroke="#d96a1e" strokeWidth="1.5"/>
        <path d="M23 13 l-1.5 -5 M26 13 l0 -6 M29 13 l1.5 -5" stroke="#5fb83f" strokeWidth="2.2" strokeLinecap="round"/>
      </g>
      <g transform="rotate(-16 64 22)">
        <path d="M60 16 L68 16 L64 33 Z" fill="#ffae5c" stroke="#d96a1e" strokeWidth="1.5"/>
        <path d="M61 15 l-1.5 -5 M64 15 l0 -6 M67 15 l1.5 -5" stroke="#5fb83f" strokeWidth="2.2" strokeLinecap="round"/>
      </g>
      <ellipse cx="40" cy="44" rx="4" ry="11" fill="#fff" stroke="#e7c9b0" strokeWidth="1.5" transform="rotate(-12 40 44)"/>
      <ellipse cx="40" cy="44" rx="1.8" ry="7" fill="#ff9ec4" transform="rotate(-12 40 44)"/>
      <ellipse cx="52" cy="44" rx="4" ry="11" fill="#fff" stroke="#e7c9b0" strokeWidth="1.5" transform="rotate(12 52 44)"/>
      <ellipse cx="52" cy="44" rx="1.8" ry="7" fill="#ff9ec4" transform="rotate(12 52 44)"/>
      <circle cx="46" cy="54" r="13" fill="#fff" stroke="#e7c9b0" strokeWidth="1.5"/>
      <path d="M38 45 L38 38 L43 42 L46 36 L49 42 L54 38 L54 45 Z" fill="#ffd24d" stroke="#e0a800" strokeWidth="1"/>
      <circle cx="42" cy="54" r="2" fill="#3a2a14"/>
      <circle cx="50" cy="54" r="2" fill="#3a2a14"/>
      <circle cx="46" cy="58" r="1.6" fill="#ff6fa8"/>
      <ellipse cx="39" cy="58" rx="2.4" ry="1.6" fill="#ffb3d1" opacity=".7"/>
      <ellipse cx="53" cy="58" rx="2.4" ry="1.6" fill="#ffb3d1" opacity=".7"/>
      <rect x="30" y="62" width="40" height="18" rx="4" fill="#c98a4a" stroke="#8a5a28" strokeWidth="2"/>
      <line x1="33" y1="68" x2="67" y2="68" stroke="#8a5a28" strokeWidth="1.3"/>
      <line x1="35" y1="74" x2="65" y2="74" stroke="#8a5a28" strokeWidth="1.3"/>
      <ellipse cx="50" cy="62" rx="20" ry="4" fill="#e0a463" stroke="#8a5a28" strokeWidth="1.5"/>
    </svg>
  ),
  g_neko: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="2" fill="#FFD700" opacity=".6"/>
      <circle cx="84" cy="12" r="1.5" fill="#fff" opacity=".6"/>
      <g transform="translate(72 28)">
        <ellipse cx="-4" cy="-3" rx="5" ry="6" fill="#ff7eb3" stroke="#e0558f" strokeWidth="1"/>
        <ellipse cx="4" cy="-3" rx="5" ry="6" fill="#ff7eb3" stroke="#e0558f" strokeWidth="1"/>
        <ellipse cx="-3" cy="4" rx="4" ry="4.5" fill="#ffd1e6" stroke="#e0558f" strokeWidth="1"/>
        <ellipse cx="3" cy="4" rx="4" ry="4.5" fill="#ffd1e6" stroke="#e0558f" strokeWidth="1"/>
        <rect x="-1" y="-6" width="2" height="12" rx="1" fill="#5a4326"/>
      </g>
      <g transform="translate(24 22) scale(.8)">
        <ellipse cx="-4" cy="-3" rx="5" ry="6" fill="#9a86ff" stroke="#6a55cc" strokeWidth="1"/>
        <ellipse cx="4" cy="-3" rx="5" ry="6" fill="#9a86ff" stroke="#6a55cc" strokeWidth="1"/>
        <ellipse cx="-3" cy="4" rx="4" ry="4.5" fill="#ddd4ff" stroke="#6a55cc" strokeWidth="1"/>
        <ellipse cx="3" cy="4" rx="4" ry="4.5" fill="#ddd4ff" stroke="#6a55cc" strokeWidth="1"/>
        <rect x="-1" y="-6" width="2" height="12" rx="1" fill="#5a4326"/>
      </g>
      <path d="M35 71 q-11 -1 -9 -13" stroke="#f4ede1" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <ellipse cx="50" cy="67" rx="15" ry="13" fill="#f4ede1" stroke="#d9c9b2" strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="13" fill="#f4ede1" stroke="#d9c9b2" strokeWidth="1.5"/>
      <path d="M41 43 L36 32 L47 40 Z" fill="#f4ede1" stroke="#d9c9b2" strokeWidth="1.5"/>
      <path d="M59 43 L64 32 L53 40 Z" fill="#f4ede1" stroke="#d9c9b2" strokeWidth="1.5"/>
      <path d="M41 41 L39 35 L45 39 Z" fill="#ff9ec4"/>
      <path d="M59 41 L61 35 L55 39 Z" fill="#ff9ec4"/>
      <path d="M42 38 L42 32 L46 36 L50 30 L54 36 L58 32 L58 38 Z" fill="#ffd24d" stroke="#e0a800" strokeWidth="1"/>
      <circle cx="45" cy="50" r="2" fill="#3a2a14"/>
      <circle cx="55" cy="50" r="2" fill="#3a2a14"/>
      <path d="M48 54 L52 54 L50 57 Z" fill="#ff6fa8"/>
      <line x1="40" y1="52" x2="30" y2="50" stroke="#bda985" strokeWidth="1"/>
      <line x1="40" y1="55" x2="31" y2="57" stroke="#bda985" strokeWidth="1"/>
      <line x1="60" y1="52" x2="70" y2="50" stroke="#bda985" strokeWidth="1"/>
      <line x1="60" y1="55" x2="69" y2="57" stroke="#bda985" strokeWidth="1"/>
      <ellipse cx="42" cy="54" rx="2.4" ry="1.6" fill="#ffb3d1" opacity=".6"/>
      <ellipse cx="58" cy="54" rx="2.4" ry="1.6" fill="#ffb3d1" opacity=".6"/>
    </svg>
  ),
  g_tokei: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#ede3ff"/>
      <rect x="7" y="7" width="24" height="10" rx="4" fill="#6849a8"/><circle cx="14" cy="12" r="2" fill="#ffd24d"/><rect x="19" y="10" width="8" height="3" rx="1.5" fill="#fff"/>
      <circle cx="40" cy="42" r="23" fill="#fff" stroke="#60408d" strokeWidth="2.5"/>
      <g stroke="#60408d" strokeWidth="2"><line x1="40" y1="22" x2="40" y2="27"/><line x1="40" y1="57" x2="40" y2="62"/><line x1="20" y1="42" x2="25" y2="42"/><line x1="55" y1="42" x2="60" y2="42"/></g>
      <line x1="40" y1="42" x2="40" y2="29" stroke="#f06b84" strokeWidth="3" strokeLinecap="round"/><line x1="40" y1="42" x2="53" y2="49" stroke="#3ca6d9" strokeWidth="2.5" strokeLinecap="round"/><circle cx="40" cy="42" r="3" fill="#ffd24d"/>
      <g fill="#fff" stroke="#7f65aa" strokeWidth="1.2"><rect x="68" y="25" width="23" height="12" rx="4"/><rect x="68" y="42" width="23" height="12" rx="4"/><rect x="68" y="59" width="23" height="12" rx="4"/></g>
      <path d="M75 31h9M75 48h9M75 65h9" stroke="#60408d" strokeWidth="2" strokeLinecap="round"/>
      <text x="50" y="14" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">★</text>
    </svg>
  ),
  g_katakana: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="12" r="1.8" fill="#FFD700" opacity=".6"/>
      <circle cx="90" cy="18" r="1.5" fill="white" opacity=".5"/>
      <rect x="8" y="34" width="34" height="38" rx="6" fill="#29B6F6" stroke="#01579B" strokeWidth="2.5"/>
      <rect x="11" y="37" width="15" height="8" rx="2" fill="#B3E5FC" opacity=".5"/>
      <text x="25" y="63" textAnchor="middle" fontSize="24" fontWeight="bold" fill="white">ア</text>
      <rect x="58" y="34" width="34" height="38" rx="6" fill="#26A69A" stroke="#004D40" strokeWidth="2.5"/>
      <rect x="61" y="37" width="15" height="8" rx="2" fill="#B2DFDB" opacity=".5"/>
      <text x="75" y="63" textAnchor="middle" fontSize="24" fontWeight="bold" fill="white">カ</text>
      <circle cx="50" cy="24" r="13" fill="#FFD700" stroke="#B8860B" strokeWidth="2"/>
      <text x="50" y="30" textAnchor="middle" fontSize="15" fill="#5c3a00" fontWeight="bold">ナ</text>
      <path d="M44 44 L50 38 L56 44" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  g_nurie: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="10" r="1.8" fill="#FFD700" opacity=".6"/>
      <circle cx="90" cy="14" r="1.5" fill="white" opacity=".5"/>
      <ellipse cx="48" cy="48" rx="34" ry="27" fill="#FFF8E1" stroke="#8D6E63" strokeWidth="2.5"/>
      <ellipse cx="48" cy="48" rx="34" ry="27" fill="none" stroke="#6D4C41" strokeWidth="1" opacity=".3"/>
      <circle cx="34" cy="38" r="5.5" fill="#FF5252"/>
      <circle cx="50" cy="33" r="5.5" fill="#FFEB3B"/>
      <circle cx="64" cy="38" r="5.5" fill="#4CAF50"/>
      <circle cx="66" cy="53" r="5.5" fill="#2196F3"/>
      <circle cx="32" cy="53" r="5.5" fill="#AB47BC"/>
      <ellipse cx="48" cy="60" rx="7" ry="5" fill="#FFF8E1" stroke="#8D6E63" strokeWidth="1.5"/>
      <rect x="66" y="8" width="7" height="30" rx="2" fill="#FF9800" stroke="#E65100" strokeWidth="1.5" transform="rotate(35 70 23)"/>
      <path d="M84 41 L88 48 L80 48 Z" fill="#5D4037" transform="rotate(35 84 44)"/>
      <path d="M14 66 Q30 74 50 70 Q72 66 86 72" fill="none" stroke="#FF5252" strokeWidth="3" strokeLinecap="round"/>
      <path d="M14 74 Q30 82 50 78 Q72 74 86 80" fill="none" stroke="#2196F3" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  g_katachi: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" fill="#141042"/>
      <circle cx="12" cy="10" r="1.6" fill="white" opacity=".7"/>
      <circle cx="88" cy="14" r="1.3" fill="#FFD700" opacity=".6"/>
      <circle cx="72" cy="6" r="1.2" fill="white" opacity=".5"/>
      <circle cx="24" cy="72" r="1.4" fill="white" opacity=".5"/>
      <ellipse cx="50" cy="40" rx="30" ry="11" fill="#B39DDB" stroke="#7E57C2" strokeWidth="2"/>
      <path d="M34 33 A18 12 0 0 1 66 33" fill="#B3E5FC" opacity=".55" stroke="#81D4FA" strokeWidth="1.5"/>
      <rect x="26" y="40" width="48" height="26" rx="9" fill="#D1C4E9" stroke="#9575CD" strokeWidth="2"/>
      <circle cx="38" cy="53" r="6.5" fill="#0b0524" stroke="white" strokeWidth="1.5" strokeDasharray="3 2"/>
      <path d="M50 46.5 L56.2 57.5 L43.8 57.5 Z" fill="#66BB6A" stroke="#1B5E20" strokeWidth="1.5"/>
      <rect x="57" y="47" width="12" height="12" rx="2" fill="#0b0524" stroke="white" strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx="18" cy="74" r="7" fill="#EF5350" stroke="#B71C1C" strokeWidth="1.8"/>
      <path d="M50 68 L52.6 74.2 L59.3 74.6 L54.1 79 L55.8 85.4 L50 81.8 L44.2 85.4 L45.9 79 L40.7 74.6 L47.4 74.2 Z" fill="#FFD54F" stroke="#B8860B" strokeWidth="1.5"/>
      <rect x="74" y="67" width="14" height="14" rx="2.5" fill="#42A5F5" stroke="#0D47A1" strokeWidth="1.8"/>
      <path d="M35 20 L38 26 L32 26 Z" fill="#F48FB1" opacity=".85"/>
    </svg>
  ),
};

/* ════════════════════════════════════════════════════
   ① 更新日時（手動で更新する定数）
════════════════════════════════════════════════════ */
const LAST_UPDATE_DATE = '2026-06-19';

function getDaysSinceUpdate() {
  return Math.floor((new Date() - new Date(LAST_UPDATE_DATE)) / 86400000);
}

/* ════════════════════════════════════════════════════
   ② 季節バナー（月から自動判定）
════════════════════════════════════════════════════ */
function getSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5)  return { emoji:'🌸', color:'#ff8fab', glow:'rgba(255,143,171,0.5)', ja:'はるのゲームパーク！', en:'Spring Game Park!', zh:'春季游乐园！', ko:'봄 게임파크!', es:'¡Parque de Primavera!' };
  if (m >= 6 && m <= 8)  return { emoji:'🌊', color:'#00d4ff', glow:'rgba(0,212,255,0.5)',   ja:'なつのゲームパーク！', en:'Summer Game Park!', zh:'夏季游乐园！', ko:'여름 게임파크!', es:'¡Parque de Verano!' };
  if (m >= 9 && m <= 11) return { emoji:'🍂', color:'#e76f51', glow:'rgba(231,111,81,0.5)',  ja:'あきのゲームパーク！', en:'Autumn Game Park!', zh:'秋季游乐园！', ko:'가을 게임파크!', es:'¡Parque de Otoño!' };
  return                         { emoji:'⛄', color:'#90e0ef', glow:'rgba(144,224,239,0.5)', ja:'ふゆのゲームパーク！', en:'Winter Game Park!', zh:'冬季游乐园！', ko:'겨울 게임파크!', es:'¡Parque de Invierno!' };
}

/* ════════════════════════════════════════════════════
   ④ 今日のおすすめ（日付ハッシュ）
════════════════════════════════════════════════════ */
function getTodayIndex(n) {
  const s = new Date().toDateString();
  return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % n;
}

/* ════════════════════════════════════════════════════
   ゲームリスト（ja / en 両対応）
════════════════════════════════════════════════════ */
const GAMES = [
  { id:'g1', route:'/shabondama',      icon:'🫧', num:1, color:'#4DB8FF', stars:5, isNew:false, category:'アクション',
    ja:{ name:'シャボンだまポン',   desc:'とんでくる たまを\nタップしてわろう！'        },
    en:{ name:'Bubble Pop',           desc:'Tap flying bubbles\nbefore they escape!'     },
    zh:{ name:'泡泡消消乐',           desc:'点击飞来的\n泡泡消消乐！'                   },
    ko:{ name:'비눗방울 팡',           desc:'날아오는 거품을\n탭해서 터뜨려요!'          },
    es:{ name:'Burbuja Pop',           desc:'¡Toca las burbujas\nantes de que escapen!'  } },
  { id:'g2', route:'/kudamono-catch',  icon:'🍎', num:2, color:'#FF6B35', stars:4, isNew:false, category:'アクション',
    ja:{ name:'くだものキャッチ',   desc:'おちてくる くだものを\nキャッチしよう！'       },
    en:{ name:'Fruit Catch',          desc:'Catch falling fruits\nbefore they drop!'      },
    zh:{ name:'接水果',               desc:'接住掉落的水果！'                             },
    ko:{ name:'과일 캐치',             desc:'떨어지는 과일을\n잡아요!'                    },
    es:{ name:'Atrapa Frutas',         desc:'¡Atrapa las frutas\nantes de que caigan!'    } },
  { id:'g4', route:'/doubutsu-puzzle', icon:'🧩', num:4, color:'#2ECC71', stars:5, isNew:true, category:'パズル',
    ja:{ name:'どうぶつパズル',     desc:'どうぶつを ならべて\nパズルをとこう！'         },
    en:{ name:'Animal Puzzle',        desc:'Line up animals\nto solve the puzzle!'        },
    zh:{ name:'动物拼图',             desc:'排列动物\n解开拼图！'                         },
    ko:{ name:'동물 퍼즐',             desc:'동물을 맞춰\n퍼즐을 풀어요!'                 },
    es:{ name:'Puzzle Animal',         desc:'¡Ordena animales\ny resuelve el puzzle!'      } },
  { id:'g5', route:'/kazu-asobi',      icon:'🔢', num:5, color:'#F4D03F', stars:3, isNew:false, category:'かずあそび',
    ja:{ name:'かずあそび',         desc:'かずを かぞえて\nたのしく まなぼう！'          },
    en:{ name:'Number Fun',           desc:'Count and learn\nnumbers with fun!'           },
    zh:{ name:'数字游戏',             desc:'数数字\n快乐学习！'                           },
    ko:{ name:'숫자 놀이',             desc:'숫자를 세며\n즐겁게 배워요!'                  },
    es:{ name:'Juego de Números',      desc:'¡Cuenta y aprende\nnúmeros!'                  } },
  { id:'g6', route:'/animal-soccer',   icon:'⚽', num:6, color:'#00BCD4', stars:5, isNew:false, category:'アクション',
    ja:{ name:'どうぶつサッカー',   desc:'3たい3+GKの\n3Dサッカー！'                    },
    en:{ name:'Animal Soccer',        desc:'3v3 + GK\n3D soccer!'                         },
    zh:{ name:'动物足球',             desc:'3对3加守门员\n3D足球！'                       },
    ko:{ name:'동물 축구',             desc:'3대3+골키퍼\n3D 축구!'                        },
    es:{ name:'Fútbol Animal',         desc:'Fútbol 3D\n3 contra 3 + portero!'            } },
  { id:'g8', route:'/sushi',           icon:'🍣', num:8, color:'#FF5722', stars:5, isNew:false, category:'アクション',
    ja:{ name:'さーもん',           desc:'かいてんずし！\nサーモンだけ\nタップしよう！' },
    en:{ name:'Catch Salmon',         desc:'Tap only salmon\nin the sushi conveyor!'      },
    zh:{ name:'捉三文鱼',             desc:'旋转寿司！\n只点三文鱼！'                    },
    ko:{ name:'연어잡기',              desc:'회전초밥에서\n연어만 탭해요!'                 },
    es:{ name:'Atrapa Salmón',         desc:'¡Toca solo el salmón\nen el conveyor!'        } },
  { id:'g9', route:'/ichigo',          icon:'🍓', num:9, color:'#E91E63', stars:5, isNew:false, category:'アクション',
    ja:{ name:'いちご',             desc:'30びょうで\nいちごを\nあつめよう！'            },
    en:{ name:'Strawberry Time',      desc:'Collect strawberries\nin 30 seconds!'         },
    zh:{ name:'草莓时间',             desc:'30秒内收集\n草莓！'                           },
    ko:{ name:'딸기 모으기',           desc:'30초 안에\n딸기를 모아요!'                   },
    es:{ name:'Tiempo de Fresa',       desc:'¡Recoge fresas\nen 30 segundos!'              } },
  { id:'g10', route:'/kakurenbo',      icon:'🔍', num:10, color:'#2d6a4f', stars:5, isNew:true, category:'パズル',
    ja:{ name:'どうぶつかくれんぼ3D', desc:'3Dのしまをまわしてさがそう！\n2つのあそびと8ステージ' },
    en:{ name:'Animal Hide & Seek 3D',   desc:'Spin the 3D island and explore!\n2 modes, 8 stages, pick a partner'      },
    zh:{ name:'动物捉迷藏3D',           desc:'转动3D小岛来探索吧！\n2种玩法，8个关卡，可选搭档'                    },
    ko:{ name:'동물 숨바꼭질 3D',         desc:'3D 섬을 돌려가며 찾아봐요!\n2가지 모드, 8스테이지, 파트너 선택'              },
    es:{ name:'Escondite Animal 3D',        desc:'¡Gira la isla 3D y explora!\n2 modos, 8 niveles, elige compañero'         } },
  { id:'g11', route:'/moji',           icon:'🔤', num:11, color:'#4CAF50', stars:3, isNew:false, category:'もじあそび',
    ja:{ name:'もじあそび',         desc:'えをみて ただしい\nひらがなを えらんでね！'        },
    en:{ name:'Letter Fun',          desc:'Look at the picture\nand choose the right hiragana!' },
    zh:{ name:'文字游戏',             desc:'看图选择\n正确的平假名！'                    },
    ko:{ name:'글자 놀이',             desc:'그림을 보고\n히라가나를 골라요!'               },
    es:{ name:'Letras',                desc:'¡Mira el dibujo y\nelige la letra!'            } },
  { id:'g12', route:'/tashizan',       icon:'➕', num:12, color:'#2196F3', stars:3, isNew:false, category:'かずあそび',
    ja:{ name:'たしざんゲーム',     desc:'どうぶつを かぞえて\nこたえをえらんでね！'          },
    en:{ name:'Math Quiz',           desc:'Count animals and\nchoose the right answer!'        },
    zh:{ name:'加法游戏',             desc:'数动物\n选答案！'                             },
    ko:{ name:'덧셈 게임',             desc:'동물을 세어\n답을 골라요!'                    },
    es:{ name:'Suma',                  desc:'¡Cuenta animales y\nelige la respuesta!'       } },
  { id:'g13', route:'/iro',            icon:'🎨', num:13, color:'#9C27B0', stars:3, isNew:false, category:'パズル',
    ja:{ name:'いろあわせ',         desc:'いろを まぜると\nなんいろになるかな？'              },
    en:{ name:'Color Match',         desc:'Mix colors and find\nthe right answer!'             },
    zh:{ name:'颜色配对',             desc:'混合颜色\n是什么颜色？'                       },
    ko:{ name:'색깔 맞추기',           desc:'색을 섞으면\n무슨 색이 될까요?'                },
    es:{ name:'Colores',               desc:'¡Mezcla colores y\nencontra el resultado!'     } },
  { id:'g_mura', route:'/mura', icon:'🏡', num:21, color:'#6bb04a', stars:5, isNew:true, category:'そうぞう',
    ja:{ name:'どうぶつのむら',   desc:'やさいをそだてて りょうり！\nどうぶつに とどけよう！' },
    en:{ name:'Animal Village',   desc:'Grow veggies, cook meals,\nand deliver to animals!' },
    zh:{ name:'动物村庄',          desc:'种蔬菜做料理，\n送给小动物们！' },
    ko:{ name:'동물 마을',        desc:'채소를 키워 요리하고\n동물에게 배달해요!' },
    es:{ name:'Aldea Animal',     desc:'¡Cultiva, cocina y\nreparte a los animales!' } },
  { id:'g14', route:'/machi',          icon:'🏙️', num:14, color:'#00897B', stars:5, isNew:false, category:'そうぞう',
    ja:{ name:'わくわくまちづくり', desc:'じぶんだけの\nすてきなまちを\nつくろう！'            },
    en:{ name:'City Builder',        desc:'Build your own\namazing city!'                      },
    zh:{ name:'建造城市',             desc:'建造属于自己的\n美丽城市！'                   },
    ko:{ name:'도시 만들기',           desc:'나만의 멋진\n도시를 만들어요!'                 },
    es:{ name:'Constructor',           desc:'¡Construye tu propia\nciudad increíble!'       } },
  { id:'g15', route:'/kokki', icon:'🌍', num:15, color:'#0d47a1', stars:4, isNew:false, category:'クイズ',
    ja:{ name:'こっきクイズ',    desc:'せかいの こっきを\nみわけよう！\n30かこく以上！'       },
    en:{ name:'Flag Quiz',        desc:'Identify world flags!\n30+ countries!\nTest your knowledge!' },
    zh:{ name:'国旗问答',          desc:'识别世界各国国旗！\n30多个国家！'                          },
    ko:{ name:'국기 퀴즈',         desc:'세계 국기를 맞혀봐!\n30개국 이상!'                       },
    es:{ name:'Quiz de Banderas', desc:'¡Identifica banderas!\n¡Más de 30 países!'                  } },
  { id:'g16', route:'/jewelry-master', icon:'💍', num:16, color:'#7b1fa2', stars:4, isNew:false, category:'そうぞう',
    ja:{ name:'ジュエリーマスター', desc:'げんせきを みがいて\nアクセサリーを つくり\nおみせを けいえい！'      },
    en:{ name:'Jewelry Master',    desc:'Polish gems, craft\naccessories, and run\nyour own shop!'        },
    zh:{ name:'珠宝大师',           desc:'打磨原石、制作饰品\n经营你自己的\n珠宝店！'                      },
    ko:{ name:'주얼리 마스터',       desc:'원석을 다듬어\n액세서리를 만들고\n가게를 운영해요！'               },
    es:{ name:'Maestro Joyero',    desc:'¡Pule gemas, crea\naccesorios y dirige\ntu propia joyería!'           } },
  { id:'g_nurie', route:'/nurie', icon:'🖍️', num:17, color:'#FF8A65', stars:3, isNew:true, category:'そうぞう',
    ja:{ name:'ぬりえ・おえかき', desc:'すきな いろで じゆうに\nぬったり かいたり しよう！' },
    en:{ name:'Coloring & Drawing', desc:'Color pictures and\ndraw freely!' },
    zh:{ name:'涂色和画画',         desc:'用喜欢的颜色\n自由涂色画画！' },
    ko:{ name:'색칠·그림 그리기',   desc:'좋아하는 색으로\n자유롭게 색칠하고 그려요!' },
    es:{ name:'Colorear y Dibujar', desc:'¡Colorea dibujos\ny dibuja libremente!' } },
];

/* ════════════════════════════════════════════════════
   🔥チャレンジ タブ ゲームリスト
════════════════════════════════════════════════════ */
const SCHOOL_GAMES = [
  { id:'s1', route:'/animal-block', icon:'🧱', num:1, color:'#4a90ff', stars:5, isNew:false, category:'パズル',
    ja:{ name:'どうぶつブロック', desc:'おなじどうぶつを\n3つならべてけそう！\nれんさでフィーバー！' },
    en:{ name:'Animal Blocks',   desc:'Match 3 animals\nin a row to clear!\nChain for fever!' },
    zh:{ name:'动物方块',         desc:'相同动物\n三连消除！\n连锁进入狂热！' },
    ko:{ name:'동물 블록',         desc:'같은 동물을\n3개 모아 없애요!\n연쇄로 피버!' },
    es:{ name:'Bloques Animal',   desc:'¡Junta 3 animales\niguales para borrar!\n¡Combos y fiebre!' } },
  { id:'s2', route:'/runner',   icon:'🏃', num:2, color:'#43A047', stars:4, isNew:false, category:'レース',
    ja:{ name:'どうぶつランナー', desc:'タップでジャンプ！\n2かいジャンプもできるよ！\n障害物をよけて走れ！' },
    en:{ name:'Animal Runner',   desc:'Tap to jump!\nDouble jump available!\nAvoid obstacles!' },
    zh:{ name:'动物跑酷',         desc:'点击跳跃！\n二段跳也可以！'                            },
    ko:{ name:'동물 러너',         desc:'탭으로 점프!\n이단점프도 돼요!'                        },
    es:{ name:'Corredor Animal',  desc:'¡Toca para saltar!\n¡Doble salto!'                     } },
  { id:'s3', route:'/shooting', icon:'🚀', num:3, color:'#e53935', stars:5, isNew:false, category:'アクション',
    ja:{ name:'どうぶつシューティング', desc:'てきをたおして\nボスをやっつけろ！\nシューティングゲーム！' },
    en:{ name:'Animal Shooter',  desc:'Defeat enemies\nand beat the boss!\nShooter game!' },
    zh:{ name:'动物射击',         desc:'消灭敌人\n打败BOSS！'                                 },
    ko:{ name:'동물 슈팅',         desc:'적을 물리치고\n보스를 쓰러뜨려요!'                    },
    es:{ name:'Shooter Animal',   desc:'¡Elimina enemigos\ny derrota al jefe!'                 } },
  { id:'s4', route:'/sniper',   icon:'🎯', num:4, color:'#2d6a4f', stars:4, isNew:false, category:'アクション',
    ja:{ name:'どうぶつスナイパー', desc:'うごくどうぶつを\nタップでねらえ！\nフェイクに注意！' },
    en:{ name:'Animal Sniper',   desc:'Tap moving animals\nto score points!\nWatch for fakes!' },
    zh:{ name:'动物狙击手',       desc:'点击移动动物\n积累分数！'                              },
    ko:{ name:'동물 스나이퍼',     desc:'움직이는 동물을\n탭해서 맞혀요!'                      },
    es:{ name:'Francotirador',    desc:'¡Toca animales\nen movimiento!'                        } },
  { id:'g_mori', route:'/mori', icon:'🌲', num:6, color:'#2e7d32', stars:4, isNew:false, category:'アクション',
    ja:{ name:'もりのなかまたち', desc:'もりをとびこえて\nゴールをめざせ！' },
    en:{ name:'Forest Friends',  desc:'Jump through the forest\nand reach the goal!' },
    zh:{ name:'森林伙伴',         desc:'穿越森林\n冲向终点！' },
    ko:{ name:'숲속 친구들',       desc:'숲을 뛰어넘어\n골인 지점을 향해!' },
    es:{ name:'Amigos del Bosque',desc:'¡Salta por el bosque\ny llega a la meta!' } },
  { id:'g_sora', route:'/sora', icon:'👸', num:7, color:'#7b1fa2', stars:4, isNew:true, category:'アクション',
    ja:{ name:'そらとびプリンセス3D', desc:'4にんからなかまをえらんで\n5つの空とボスにいどもう！' },
    en:{ name:'Sky Princess 3D',    desc:'Pick from 4 characters and\nchallenge 5 skies & bosses!' },
    zh:{ name:'飞天公主3D',         desc:'从4名伙伴中选择\n挑战5个天空与首领！' },
    ko:{ name:'하늘나는 공주 3D',     desc:'4명 중 캐릭터를 골라\n5개의 하늘과 보스에 도전!' },
    es:{ name:'Princesa del Cielo 3D',desc:'¡Elige entre 4 personajes\ny desafía 5 cielos y jefes!' } },
  { id:'g_bike', route:'/bike', icon:'🏍️', num:8, color:'#f57c00', stars:3, isNew:false, category:'レース',
    ja:{ name:'わくわくバイク', desc:'バイクでコースを\nはしりぬけろ！' },
    en:{ name:'Wakuwaku Bike',  desc:'Race through the course\non your bike!' },
    zh:{ name:'嗡嗡摩托',        desc:'骑摩托车\n冲过赛道！' },
    ko:{ name:'두근두근 바이크',  desc:'오토바이로\n코스를 달려요!' },
    es:{ name:'Moto Wakuwaku',  desc:'¡Corre por el circuito\nen tu moto!' } },
  { id:'g_kart', route:'/kart', icon:'🏎️', num:9, color:'#e53935', stars:3, isNew:true, category:'レース',
    ja:{ name:'アニマルカートGP', desc:'6ひきからキャラをえらんで\nほしとアイテムの3Dレース！' },
    en:{ name:'Animal Kart GP',  desc:'Pick your character and race\nin full 3D with stars & items!' },
    zh:{ name:'动物卡丁车GP',     desc:'挑选角色，驾驶3D卡丁车\n收集星星和道具冲刺！' },
    ko:{ name:'애니멀 카트 GP',   desc:'캐릭터를 골라서\n별과 아이템으로 3D 레이스!' },
    es:{ name:'Kart de Animales GP', desc:'¡Elige tu personaje y compite\nen 3D con estrellas e ítems!' } },
  { id:'g_neon', route:'/neon-drive', icon:'🚗', num:22, color:'#00d5ff', stars:5, isNew:true, category:'レース',
    ja:{ name:'きらきらドライブ',  desc:'よるのまちをドライブ！\nほしをあつめてはしろう！' },
    en:{ name:'Neon Drive',        desc:'Cruise the night city\nand collect the stars!' },
    zh:{ name:'霓虹夜间兜风',       desc:'在夜晚的城市里兜风，\n收集星星吧！' },
    ko:{ name:'반짝반짝 드라이브', desc:'밤의 도시를 달리며\n별을 모아요!' },
    es:{ name:'Paseo de Neón',     desc:'¡Recorre la ciudad nocturna\ny recoge las estrellas!' } },
  { id:'g_astral', route:'/astral-fang', icon:'🌟', num:23, color:'#7cecff', stars:5, isNew:true, category:'アクション',
    ja:{ name:'ほしぞらアニマルレスキュー', desc:'ほしをあつめて\nまいごのどうぶつをたすけよう！' },
    en:{ name:'Starry Animal Rescue',       desc:'Collect the stars\nand rescue lost animals!' },
    zh:{ name:'星空动物救援队',             desc:'收集星星，\n帮助迷路的小动物！' },
    ko:{ name:'별빛 동물 구조대',           desc:'별을 모아\n길 잃은 동물을 도와요!' },
    es:{ name:'Rescate Animal Estelar',     desc:'¡Recoge estrellas\ny ayuda a los animales!' } },
  { id:'g_block', route:'/block', icon:'🏰', num:10, color:'#ec407a', stars:3, isNew:true, category:'アクション',
    ja:{ name:'おしろブロックくずし', desc:'パドルでボールをはじいて\nブロックをこわそう！' },
    en:{ name:'Castle Breakout',   desc:'Bounce the ball and\nbreak all the blocks!' },
    zh:{ name:'城堡打砖块',         desc:'弹球击碎\n所有砖块！' },
    ko:{ name:'성 벽돌깨기',        desc:'공을 튕겨서\n블록을 깨요!' },
    es:{ name:'Rompe Castillo',    desc:'¡Rebota la pelota\ny rompe los bloques!' } },
  { id:'g_mahoumeiro', route:'/mahou-meiro', icon:'🔮', num:17, color:'#7e57c2', stars:4, isNew:true, category:'パズル',
    ja:{ name:'まほうのめいろ', desc:'クリスタルでとびらをひらき\n3Dめいろをぬけだそう！' },
    en:{ name:'Magic Maze',     desc:'Open gates with crystals\nand escape the 3D maze!' },
    zh:{ name:'魔法迷宫',        desc:'用水晶打开魔法门\n逃出3D迷宫！' },
    ko:{ name:'마법의 미로',     desc:'크리스탈로 문을 열고\n3D 미로를 탈출해요!' },
    es:{ name:'Laberinto Mágico', desc:'¡Abre puertas con cristales\ny escapa del laberinto 3D!' } },
  { id:'g_houki', route:'/houki', icon:'🧹', num:11, color:'#ab47bc', stars:3, isNew:true, category:'レース',
    ja:{ name:'まほうほうきGP', desc:'そらをとんでリングをくぐり\nタイムをのばそう！' },
    en:{ name:'Magic Broom GP',  desc:'Fly and pass through rings\nto extend your time!' },
    zh:{ name:'魔法扫帚GP',       desc:'飞行穿过光环\n延长时间！' },
    ko:{ name:'마법 빗자루 GP',   desc:'날아서 링을 통과해\n시간을 늘려요!' },
    es:{ name:'Escoba Mágica GP', desc:'¡Vuela y cruza aros\npara ganar tiempo!' } },
  { id:'g_usagi', route:'/usagi-carrot', icon:'🐰', num:12, color:'#ff7eb3', stars:4, isNew:true, category:'アクション',
    ja:{ name:'うさぎとにんじん',  desc:'うえからおちてくる\nにんじんをキャッチ！' },
    en:{ name:'Bunny & Carrot',    desc:'Catch the carrots\nfalling from the sky!' },
    zh:{ name:'兔子接胡萝卜',       desc:'接住从天上\n掉落的胡萝卜！' },
    ko:{ name:'토끼와 당근',        desc:'위에서 떨어지는\n당근을 받아요!' },
    es:{ name:'Conejo y Zanahoria', desc:'¡Atrapa las zanahorias\nque caen del cielo!' } },
  { id:'g_neko', route:'/neko-chou', icon:'🐱', num:13, color:'#b39ddb', stars:4, isNew:true, category:'アクション',
    ja:{ name:'ねことちょうちょ', desc:'とんでにげるちょうちょを\nねこでつかまえよう！' },
    en:{ name:'Cat & Butterfly',  desc:'Chase the fluttering\nbutterflies with the cat!' },
    zh:{ name:'猫咪抓蝴蝶',        desc:'用猫咪抓住\n飞舞的蝴蝶！' },
    ko:{ name:'고양이와 나비',     desc:'날아다니는 나비를\n고양이로 잡아요!' },
    es:{ name:'Gato y Mariposa',   desc:'¡Atrapa las mariposas\ncon el gato!' } },
  { id:'g_mahounakama', route:'/mahou-nakama', icon:'🪄', num:18, color:'#7fa8ff', stars:4, isNew:true, category:'アクション',
    ja:{ name:'まほうのなかまたい', desc:'ステッキでポン！モンスターを\nなかまにして すすもう！' },
    en:{ name:'Magic Friend Squad',  desc:'Tap monsters with your wand\nand make them your friends!' },
    zh:{ name:'魔法伙伴小队',        desc:'用魔法棒轻轻一点，\n把怪物变成伙伴！' },
    ko:{ name:'마법 친구 부대',      desc:'마법 지팡이로 콩!\n몬스터를 친구로 만들자!' },
    es:{ name:'Escuadrón Mágico',    desc:'¡Toca monstruos con tu varita\ny hazlos tus amigos!' } },
  { id:'g_kyoshitsu', route:'/sora-kyoshitsu', icon:'🎈', num:20, color:'#5ecbf7', stars:4, isNew:true, category:'アクション',
    ja:{ name:'そらのきょうしつ',   desc:'リングをくぐって\nマットにちゃくりく！' },
    en:{ name:'Sky Class',          desc:'Fly through rings and\nland on the mat!' },
    zh:{ name:'天空教室',            desc:'穿过圆环，\n降落在垫子上！' },
    ko:{ name:'하늘 교실',          desc:'링을 통과해서\n매트에 착륙하자!' },
    es:{ name:'Clase del Cielo',     desc:'¡Cruza los aros\ny aterriza en la colchoneta!' } },
  { id:'g_otakara', route:'/otakara-horihori', icon:'⛏️', num:19, color:'#b06a3b', stars:4, isNew:true, category:'アクション',
    ja:{ name:'おたからほりほり', desc:'じめんをほって おたからを\nあつめよう！' },
    en:{ name:'Treasure Digger',   desc:'Dig the ground and\ncollect the treasures!' },
    zh:{ name:'挖挖小宝藏',        desc:'挖开地面，\n收集所有宝藏！' },
    ko:{ name:'보물 파기',          desc:'땅을 파서\n보물을 모아요!' },
    es:{ name:'Cava Tesoros',      desc:'¡Cava la tierra y\nrecoge los tesoros!' } },
  { id:'g_okashi', route:'/okashi-crossing', icon:'🍭', num:16, color:'#ff9ecb', stars:4, isNew:true, category:'アクション',
    ja:{ name:'おかしのくにたんけん', desc:'グミのくるまとチョコのかわ！\nどこまでもすすもう！' },
    en:{ name:'Candy Land Explorer',  desc:'Cross gummy roads and\nchocolate rivers—go far!' },
    zh:{ name:'糖果王国穿越',        desc:'越过软糖车和巧克力河，\n看你能走多远！' },
    ko:{ name:'과자나라 크로싱',     desc:'젤리 자동차와 초콜릿 강을\n건너 멀리 가보자!' },
    es:{ name:'Cruce del País Dulce', desc:'¡Cruza autos de gomita y\nríos de chocolate!' } },
  { id:'g_tokei', route:'/tokei-yomi', icon:'🕐', num:14, color:'#7986CB', stars:3, isNew:true, category:'がくしゅう',
    ja:{ name:'とけいよみ',         desc:'とけいの はりを よんだり\nあわせたり して あそぼう！' },
    en:{ name:'Clock Reading',      desc:'Read and match\nthe clock hands!' },
    zh:{ name:'认识时钟',           desc:'读时钟指针\n或对准时间！' },
    ko:{ name:'시계 읽기',          desc:'시계 바늘을 읽고\n맞춰봐요!' },
    es:{ name:'Lectura del Reloj',  desc:'¡Lee y ajusta\nlas manecillas!' } },
  { id:'g_katakana', route:'/katakana-asobi', icon:'🔤', num:15, color:'#29B6F6', stars:3, isNew:true, category:'がくしゅう',
    ja:{ name:'カタカナあそび',     desc:'えや ひらがなを みて\nただしい カタカナを えらぼう！' },
    en:{ name:'Katakana Play',      desc:'Pick the right katakana\nfrom pictures & hiragana!' },
    zh:{ name:'片假名游戏',         desc:'看图片和平假名\n选出正确的片假名！' },
    ko:{ name:'가타카나 놀이',      desc:'그림과 히라가나를 보고\n맞는 가타카나를 골라요!' },
    es:{ name:'Juego de Katakana',  desc:'¡Elige el katakana\ncorrecto con dibujos!' } },
  { id:'g_katachi', route:'/katachi', icon:'🔷', num:21, color:'#7C7CE8', stars:3, isNew:true, category:'がくしゅう',
    ja:{ name:'かたちあわせ',       desc:'うちゅうで かたちを\nはめたり しわけたり しよう！' },
    en:{ name:'Shape Match',        desc:'Fit and sort shapes\nin outer space!' },
    zh:{ name:'形状配对',           desc:'在宇宙中拼合\n和分类形状！' },
    ko:{ name:'모양 맞추기',        desc:'우주에서 모양을\n끼우고 분류해요!' },
    es:{ name:'Formas Espaciales',  desc:'¡Encaja y clasifica\nformas en el espacio!' } },
  { id:'g_oukan', route:'/oukan-monogatari', icon:'👑', num:24, color:'#d8b24d', stars:5, isNew:true, category:'アクション',
    ja:{ name:'おうかんものがたり', desc:'すきなキャラで\n3つのおうこくをぼうけん！' },
    en:{ name:'Crown Story',        desc:'Adventure through three\nkingdoms with your hero!' },
    zh:{ name:'王冠物语',           desc:'选择角色，\n冒险三大王国！' },
    ko:{ name:'왕관 이야기',        desc:'좋아하는 캐릭터로\n세 왕국을 모험하자!' },
    es:{ name:'Historia de la Corona', desc:'¡Aventúrate por tres\nreinos con tu héroe!' } },
];

/* ── 全ゲーム統合(チャレンジ系は🔥マーク) ── */
const ALL_SHELF_GAMES = [
  ...GAMES,
  ...SCHOOL_GAMES.map(g => ({ ...g, hard: true })),
];
/* ── 棚グループ定義(6棚)。アクションはゲーム性で2分割 ── */
const SHELF_SHOOT_JUMP = ['s3','s4','g_sora','g_mori','g_block']; // ねらう・とぶ系
const SHELF_GROUPS = [
  { key:'asobu',    icon:'⚡', match:g => g.category==='アクション' && !SHELF_SHOOT_JUMP.includes(g.id),
    label:{ja:'あそぶ',       en:'Play',        zh:'玩耍',   ko:'놀기',       es:'Jugar'    } },
  { key:'nerau',    icon:'🎯', match:g => SHELF_SHOOT_JUMP.includes(g.id),
    label:{ja:'ねらう・とぶ', en:'Aim & Jump',  zh:'瞄准・跳跃', ko:'조준・점프', es:'Apunta y salta' } },
  { key:'race',     icon:'🏁', match:g => g.category==='レース',
    label:{ja:'レース',       en:'Racing',      zh:'赛车',   ko:'레이싱',     es:'Carreras' } },
  { key:'kangaeru', icon:'🧩', match:g => ['パズル','かずあそび','もじあそび','クイズ'].includes(g.category),
    label:{ja:'かんがえる',   en:'Think',       zh:'思考',   ko:'생각하기',   es:'Pensar'   } },
  { key:'tsukuru',  icon:'🎨', match:g => g.category==='そうぞう',
    label:{ja:'つくる',       en:'Create',      zh:'创造',   ko:'만들기',     es:'Crear'    } },
  { key:'manabu',   icon:'📚', match:g => g.category==='がくしゅう',
    label:{ja:'まなぶ',       en:'Learn',       zh:'学习',   ko:'배우기',     es:'Aprender' } },
];

/* ── カテゴリチップ(4分類。既存categoryをグループにマップ) ── */
const CAT_CHIPS = [
  { key:'all',    match:() => true,
    label:{ja:'ぜんぶ',     en:'All',    zh:'全部', ko:'전체',   es:'Todos'} },
  { key:'action', match:g => ['アクション','レース'].includes(g.category),
    label:{ja:'アクション', en:'Action', zh:'动作', ko:'액션',   es:'Acción'} },
  { key:'puzzle', match:g => g.category === 'パズル',
    label:{ja:'パズル',     en:'Puzzle', zh:'益智', ko:'퍼즐',   es:'Puzle'} },
  { key:'create', match:g => g.category === 'そうぞう',
    label:{ja:'つくる',     en:'Create', zh:'创造', ko:'만들기', es:'Crear'} },
  { key:'learn',  match:g => ['かずあそび','もじあそび','クイズ','がくしゅう'].includes(g.category),
    label:{ja:'がくしゅう', en:'Learn',  zh:'学习', ko:'배우기', es:'Aprender'} },
];

/* ── 年齢別の入口。SEO側の対象年齢を唯一の参照元にする ── */
const AGE_FILTERS = [
  { key:'all', label:{ja:'ぜんぶの年齢', en:'All ages', zh:'全部年龄', ko:'모든 연령', es:'Todas las edades'}, match:() => true },
  { key:'3-5', label:{ja:'3〜5さい', en:'Ages 3–5', zh:'3〜5岁', ko:'3〜5세', es:'3–5 años'}, match:g => {
    const meta = GAME_META[g.route];
    return meta && meta.ageMin <= 5 && meta.ageMax >= 3;
  } },
  { key:'6-8', label:{ja:'6〜8さい', en:'Ages 6–8', zh:'6〜8岁', ko:'6〜8세', es:'6–8 años'}, match:g => {
    const meta = GAME_META[g.route];
    return meta && meta.ageMin <= 8 && meta.ageMax >= 6;
  } },
  { key:'9-12', label:{ja:'9〜12さい', en:'Ages 9–12', zh:'9〜12岁', ko:'9〜12세', es:'9–12 años'}, match:g => {
    const meta = GAME_META[g.route];
    return meta && meta.ageMin <= 12 && meta.ageMax >= 9;
  } },
];

/* 最初に迷わないための固定6本。全39本の棚はこの下に残す。 */
const BEGINNER_ROUTES = [
  '/shabondama',
  '/kudamono-catch',
  '/animal-soccer',
  '/astral-fang',
  '/doubutsu-puzzle',
  '/mura',
];

/* NEWを乱立させず、直近の代表作だけに絞る。 */
const FEATURED_NEW_ROUTES = new Set([
  '/oukan-monogatari',
  '/astral-fang',
  '/neon-drive',
  '/katachi',
]);

const THUMB_ALIASES = {
  '/sora': 'sora',
  '/shooting': 'shooting',
  '/sniper': 'sniper',
};
const NO_THUMB_ROUTES = new Set([
  '/neon-drive',
  '/astral-fang',
  '/mahou-meiro',
  '/oukan-monogatari',
]);

function thumbFor(game) {
  if (NO_THUMB_ROUTES.has(game.route)) return null;
  return `/thumbs/${THUMB_ALIASES[game.route] || game.route.replace(/^\//, '')}.webp`;
}

function ageText(game, lang) {
  const meta = GAME_META[game.route];
  if (!meta) return '';
  if (lang === 'en') return `Ages ${meta.ageMin}–${meta.ageMax}`;
  if (lang === 'zh') return `${meta.ageMin}〜${meta.ageMax}岁`;
  if (lang === 'ko') return `${meta.ageMin}〜${meta.ageMax}세`;
  if (lang === 'es') return `${meta.ageMin}–${meta.ageMax} años`;
  return `${meta.ageMin}〜${meta.ageMax}さい`;
}

/* ── 実ゲーム画面サムネイル(public/thumbs/<route>.webp)。
      未配置・読込失敗時は非表示→既存SVG/アイコンにフォールバック ── */
/* ── 棚用コンパクトカード ── */
function ShelfCard({ game, lang, onClick }) {
  const t = game[lang] || game.ja;
  const thumb = thumbFor(game);
  return (
    <button
      className="tp-shelf-card"
      style={{ background: CARD_GRADIENTS[game.category] || DEFAULT_GRADIENT }}
      onClick={onClick}
      aria-label={`${t.name}、${ageText(game, lang)}`}
    >
      {FEATURED_NEW_ROUTES.has(game.route) && <span className="tp-shelf-new">NEW</span>}
      {game.hard && <span className="tp-shelf-hard">🔥</span>}
      <div className="tp-shelf-art">
        {GAME_SVGS[game.id] || <span className="tp-shelf-icon-fb">{game.icon}</span>}
        {thumb && (
          <img
            className="tp-shelf-thumb"
            src={thumb}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <span className="tp-thumb-badge tp-thumb-badge--sm" aria-hidden="true">{game.icon}</span>
      </div>
      <div className="tp-shelf-copy">
        <div className="tp-shelf-name">{t.name}</div>
        <div className="tp-shelf-age">{ageText(game, lang)}</div>
      </div>
    </button>
  );
}

function BeginnerCard({ game, lang, onClick }) {
  const t = game[lang] || game.ja;
  const thumb = thumbFor(game);
  return (
    <button className="tp-beginner-card" onClick={onClick} aria-label={`${t.name}、${ageText(game, lang)}`}>
      <div className="tp-beginner-art" style={{ background: CARD_GRADIENTS[game.category] || DEFAULT_GRADIENT }}>
        {GAME_SVGS[game.id] || <span className="tp-card-icon-fb">{game.icon}</span>}
        {thumb && (
          <img
            src={thumb}
            alt=""
            loading="eager"
            decoding="async"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <span className="tp-beginner-play" aria-hidden="true">▶</span>
      </div>
      <div className="tp-beginner-copy">
        <span>{ageText(game, lang)}</span>
        <strong>{t.name}</strong>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════
   雲データ（空に浮かぶ雲）
════════════════════════════════════════════════════ */
const CLOUDS = [
  { id:0, top:'8%',  left:'5%',  size:52, dur:'7s',  delay:'0s'   },
  { id:1, top:'5%',  left:'30%', size:64, dur:'9s',  delay:'1.5s' },
  { id:2, top:'12%', left:'55%', size:46, dur:'6s',  delay:'3s'   },
  { id:3, top:'4%',  left:'75%', size:58, dur:'8s',  delay:'0.8s' },
  { id:4, top:'18%', left:'88%', size:42, dur:'7.5s',delay:'2s'   },
  { id:5, top:'22%', left:'15%', size:36, dur:'6.5s',delay:'4s'   },
];

/* ════════════════════════════════════════════════════
   ドリフト雲・魚データ
════════════════════════════════════════════════════ */
const DRIFT_CLOUDS = [
  { id:'dc0', top:'6%',  size:48, dur:'24s', delay:'0s'   },
  { id:'dc1', top:'14%', size:62, dur:'32s', delay:'-11s' },
  { id:'dc2', top:'3%',  size:38, dur:'20s', delay:'-6s'  },
];
const FISH_LIST = [
  { id:'f0', emoji:'🐠', dur:'15s', delay:'0s',   rtl:false },
  { id:'f1', emoji:'🐟', dur:'20s', delay:'-8s',  rtl:true  },
  { id:'f2', emoji:'🐬', dur:'17s', delay:'-4s',  rtl:false },
];

/* ════════════════════════════════════════════════════
   ⑤ プレイカウンター
════════════════════════════════════════════════════ */
function PlayCounter({ target, lang }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target) return;
    const duration = 1200;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    const tm = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, 400);
    return () => { clearTimeout(tm); cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return (
    <div className="tp-counter">
      <span className="tp-counter-icon">🎮</span>
      <div className="tp-counter-body">
        <div className="tp-counter-label">
          {lang === 'en' ? 'Times Played Together' :
           lang === 'zh' ? '一起游玩的次数' :
           lang === 'ko' ? '함께 플레이한 횟수' :
           lang === 'es' ? 'Veces jugadas' :
           'みんなであそんだかず'}
        </div>
        <div className="tp-counter-num">{display.toLocaleString()}</div>
      </div>
      <span className="tp-counter-unit">
        {lang === 'en' ? 'times' : lang === 'zh' ? '次' : lang === 'ko' ? '번' : lang === 'es' ? 'veces' : 'かい'}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ゲームカード（リッチ化）
════════════════════════════════════════════════════ */
function GameCard({ game, lang, isRecommended, onClick, animIndex }) {
  const t = game[lang] || game.ja;
  const gradient = CARD_GRADIENTS[game.category] || DEFAULT_GRADIENT;
  const starsFilled = Math.round(game.stars);
  const svg = GAME_SVGS[game.id] || null;

  return (
    <button
      className={`tp-card${isRecommended ? ' tp-card--recommend' : ''}`}
      style={{
        '--card-gradient': gradient,
        '--card-delay': `${(animIndex ?? 0) * 0.08}s`,
      }}
      onClick={onClick}
    >
      {isRecommended && (
        <div className="tp-card-ribbon">
          {{ja:'⭐ きょうのおすすめ！', en:"⭐ Today's Pick!", zh:'⭐ 今日推荐！', ko:'⭐ 오늘의 추천!', es:'⭐ ¡Recomendado!'}[lang] || '⭐ きょうのおすすめ！'}
        </div>
      )}

      <div className="tp-card-art">
        {game.category && (
          <span className="tp-card-cat">{game.category}</span>
        )}
        {game.isNew && (
          <span className="tp-card-new">NEW</span>
        )}
        {svg || <span className="tp-card-icon-fb">{game.icon}</span>}
        <span className="tp-thumb-badge" aria-hidden="true">{game.icon}</span>
      </div>

      <div className="tp-card-body">
        <div className="tp-card-name">{t.name}</div>
        <div className="tp-card-desc">
          {t.desc.split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        <div className="tp-card-stars">
          {Array.from({length: 5}, (_, i) => (
            <span key={i} className={i < starsFilled ? 'tp-star tp-star--filled' : 'tp-star'}>★</span>
          ))}
        </div>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════
   TopPage 本体
════════════════════════════════════════════════════ */
export default function TopPage() {
  const navigate   = useNavigate();
  const [lang,        setLang]        = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('wakuwaku_lang') : null) || 'ja');
  const [isMuted,     setIsMuted]     = useState(() => typeof localStorage !== 'undefined' && localStorage.getItem('wakuwaku_bgm') === 'off');
  const [playCount,   setPlayCount]   = useState(0);
  const [kisekaeState,setKisekaeState]= useState(() => {
    try {
      const saved = typeof localStorage !== 'undefined' && localStorage.getItem('kisekae_state');
      return saved ? JSON.parse(saved) : DEFAULT_KISEKAE;
    } catch { return DEFAULT_KISEKAE; }
  });
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [panelChara,  setPanelChara]  = useState('princess');
  const [shopOpen,    setShopOpen]    = useState(false);
  const [coins,       setCoins]       = useState(() => typeof localStorage !== 'undefined' ? getCoins() : 0);
  const [loginBonus,  setLoginBonus]  = useState(null);
  const [recentRoutes,   setRecentRoutes]   = useState(() => typeof localStorage !== 'undefined' ? getRecentGames() : []);
  // しまマップ⇔いちらん切替。SSR/ハイドレーション不一致回避のため初期値は固定し、
  // 保存値の反映はマウント後に行う。
  const [topView, setTopView] = useState('list');
  const [catKey,  setCatKey]  = useState('all');
  const [ageKey,  setAgeKey]  = useState('all');
  useEffect(() => {
    const saved = localStorage.getItem('wakuwaku_top_view');
    if (saved === 'list') setTopView('list');
  }, []);
  function changeTopView(v) {
    setTopView(v);
    localStorage.setItem('wakuwaku_top_view', v);
  }

  const season    = getSeason();
  const daysSince = getDaysSinceUpdate();
  const beginnerGames = BEGINNER_ROUTES
    .map(route => ALL_SHELF_GAMES.find(game => game.route === route))
    .filter(Boolean);

  // 引っ張って更新(フルスクリーンPWA向け)
  const { pull, ready } = usePullToRefresh(() => window.location.reload());


  // 最近遊んだゲームを可視化用データに変換
  const recentGames = recentRoutes
    .map(route => GAMES.find(g => g.route === route))
    .filter(Boolean);

  // きみにオススメ: よく遊ぶ分類の未プレイゲームを提案(マウント後に計算しSSR不一致を回避)
  const [recoGames, setRecoGames] = useState([]);
  useEffect(() => {
    try {
      const hist = getPlayHistory() || {};
      const counts = CAT_CHIPS.slice(1).map(c => [c, ALL_SHELF_GAMES.filter(g => c.match(g) && hist[g.route]).length]);
      counts.sort((a, b) => b[1] - a[1]);
      const fav = counts[0] && counts[0][1] > 0 ? counts[0][0] : null;
      const pool = fav
        ? ALL_SHELF_GAMES.filter(g => fav.match(g) && !hist[g.route])
        : ALL_SHELF_GAMES.filter(g => g.isNew && !hist[g.route]);
      setRecoGames(pool.slice(0, 4));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('wakuwaku_bgm') !== 'off') startBGM();
    setPlayCount(getPlayCount() + 1312);
    const bonus = checkLoginBonus();
    if (bonus) setLoginBonus(bonus);
    return () => stopBGM();
  }, []);

  // 初回訪問時のみ、ブラウザ言語から自動で表示言語を決定する。
  // 手動選択(wakuwaku_lang)がある場合は常にそちらを優先。
  // マウント後に実行することでSSR/prerenderとのハイドレーション不一致を防ぐ。
  useEffect(() => {
    if (localStorage.getItem('wakuwaku_lang')) return;
    const detected = detectLang();
    localStorage.setItem('wakuwaku_lang', detected);
    if (detected !== lang) setLang(detected);
  }, []);

  // 横スクロール棚(.tp-shelf-scroll / .tp-chips 等)の上でマウスホイールを
  // 縦回転させると、その要素が縦ホイールを消費してページが縦スクロールしなく
  // なるChromeの挙動への対策。横成分の無い純縦ホイールはページに転送する。
  useEffect(() => {
    const onWheel = (e) => {
      const scroller = e.target.closest?.('.tp-shelf-scroll, .tp-chips, .tp-cat-chips, .tp-recent-scroll');
      if (!scroller) return;
      // 主に縦方向の回転で、その要素が横にしかスクロールできない場合のみ転送
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const canScrollX = scroller.scrollWidth > scroller.clientWidth;
        // 横に動けない、または既に横端 → 縦ホイールをページへ委譲
        if (!canScrollX) {
          window.scrollBy({ top: e.deltaY, behavior: 'auto' });
          e.preventDefault();
        }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  function handleMuteToggle() {
    toggleBGM();
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('wakuwaku_bgm', next ? 'off' : 'on');
      return next;
    });
  }

  function spawnParticles(x, y) {
    const emojis = ['✨', '💖', '⭐', '🌟', '💫', '🎉'];
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('span');
      el.className = 'ww-particle';
      el.textContent = emojis[i % emojis.length];
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
      const angle = (i / 6) * Math.PI * 2;
      el.style.setProperty('--px', (Math.cos(angle) * 80) + 'px');
      el.style.setProperty('--py', (Math.sin(angle) * 80 - 40) + 'px');
      document.body.appendChild(el);
      setTimeout(() => { if (el.parentNode) el.remove(); }, 800);
    }
  }

  function openPanel(chara) {
    setPanelChara(chara);
    setPanelOpen(true);
  }

  /* ── マスコット吹き出し ── */
  const [mascotText,   setMascotText]   = useState('');
  const [mascotBounce, setMascotBounce] = useState(false);
  const mascotIdxRef = useRef(-1);

  function pickMascotLine(l) {
    const lines = MASCOT_LINES[l] || MASCOT_LINES.ja;
    let i;
    do { i = Math.floor(Math.random() * lines.length); } while (i === mascotIdxRef.current && lines.length > 1);
    mascotIdxRef.current = i;
    return lines[i];
  }

  useEffect(() => {
    const h = new Date().getHours();
    const slot = h < 11 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    setMascotText(MASCOT_GREETING[slot][lang] || MASCOT_GREETING[slot].ja);
    const t = setInterval(() => setMascotText(pickMascotLine(lang)), 8000);
    return () => clearInterval(t);
  }, [lang]);

  function handleMascotTap(e) {
    spawnParticles(e.clientX, e.clientY);
    setMascotText(pickMascotLine(lang));
    setMascotBounce(true);
    setTimeout(() => setMascotBounce(false), 600);
  }

  /* ── ゲームルーレット ── */
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [rouletteSpin, setRouletteSpin] = useState(false);
  const [rouletteIdx,  setRouletteIdx]  = useState(0);
  const rouletteTimer = useRef(null);

  function startRoulette() {
    const pool = ALL_SHELF_GAMES;
    setRouletteOpen(true);
    setRouletteSpin(true);
    let delay = 55;
    const stopAt = Date.now() + 1800 + Math.random() * 800;
    const tick = () => {
      setRouletteIdx(prev => (prev + 1) % pool.length);
      if (Date.now() < stopAt || delay < 320) {
        delay = Date.now() > stopAt - 700 ? delay * 1.25 : delay;
        rouletteTimer.current = setTimeout(tick, delay);
      } else {
        setRouletteSpin(false);
      }
    };
    tick();
  }

  function closeRoulette() {
    if (rouletteTimer.current) clearTimeout(rouletteTimer.current);
    setRouletteOpen(false);
    setRouletteSpin(false);
  }

  useEffect(() => () => { if (rouletteTimer.current) clearTimeout(rouletteTimer.current); }, []);

  /* ── スタンプずかん ── */
  const [zukanOpen, setZukanOpen] = useState(false);
  const [playHist,  setPlayHist]  = useState({});

  function openZukan() {
    setPlayHist(getPlayHistory());
    setZukanOpen(true);
  }

  function handleLoginBonusClaim() {
    claimLoginBonus();
    setCoins(getCoins());
    setLoginBonus(null);
  }

  function handleKisekaeChange(next) {
    setKisekaeState(next);
    localStorage.setItem('kisekae_state', JSON.stringify(next));
  }

  const LANG_FLAGS = { ja:'🇯🇵', en:'🇺🇸', zh:'🇨🇳', ko:'🇰🇷', es:'🇪🇸' };
  const LANG_ORDER = ['ja', 'en', 'zh', 'ko', 'es'];

  function handleLangToggle() {
    const idx  = LANG_ORDER.indexOf(lang);
    const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
    setLang(next);
    localStorage.setItem('wakuwaku_lang', next);
  }

  const lastUpdateText =
    lang === 'en' ? (daysSince === 0 ? 'Today!' : `${daysSince} days ago`) :
    lang === 'zh' ? (daysSince === 0 ? '今天！' : `${daysSince}天前`) :
    lang === 'ko' ? (daysSince === 0 ? '오늘!' : `${daysSince}일 전`) :
    lang === 'es' ? (daysSince === 0 ? '¡Hoy!' : `hace ${daysSince} días`) :
    (daysSince === 0 ? 'きょう！' : `${daysSince}にちまえ`);

  return (
    <div className="tp-wrap" style={{ transform: pull ? `translateY(${pull}px)` : undefined, transition: pull ? 'none' : 'transform .25s ease' }}>
      {/* ── 引っ張って更新インジケーター ── */}
      <div className="tp-ptr" aria-hidden="true" style={{ top: `${pull - 46}px`, opacity: pull > 6 ? 1 : 0 }}>
        <span className={`tp-ptr-spin${ready ? ' tp-ptr-spin--ready' : ''}`} style={{ transform: `rotate(${pull * 3}deg)` }}>
          {ready ? '↻' : '↓'}
        </span>
      </div>
      <Helmet>
        <title>わくわくアイランド｜こども向け無料ブラウザゲーム</title>
        <meta name="description" content="幼児・小学生向けの無料ミニゲームが20種類以上。かず・もじ・パズル・アクション・レースなどを登録不要・インストール不要でブラウザですぐ遊べます。" />
        <link rel="canonical" href="https://wakuwakuislands.com/" />
      </Helmet>

      {/* ── 空の雲 ── */}
      <div className="tp-clouds" aria-hidden="true">
        {/* 既存：上下ボブ雲 */}
        {CLOUDS.map(c => (
          <div
            key={c.id}
            className="tp-cloud"
            style={{
              top: c.top,
              left: c.left,
              fontSize: c.size,
              '--dur':   c.dur,
              '--delay': c.delay,
            }}
          >
            ☁️
          </div>
        ))}
        {/* ☀️ 太陽 */}
        <div className="tp-sun-wrap" aria-hidden="true">
          <span className="tp-sun-body">☀️</span>
        </div>
        {/* ☁️ 流れる雲（左→右） */}
        {DRIFT_CLOUDS.map(c => (
          <div
            key={c.id}
            className="tp-cloud-drift"
            style={{ top: c.top, fontSize: c.size, '--dur': c.dur, '--delay': c.delay }}
          >
            ☁️
          </div>
        ))}
      </div>

      {/* ── フローティングデコキャラ ── */}
      <div className="tp-deco" aria-hidden="true">
        <span style={{ left:'4%',  top:'28%', '--dur':'3.8s', '--rot':'-4deg', fontSize:28 }}>🌺</span>
        <span style={{ right:'4%', top:'24%', '--dur':'3.5s', '--rot':'8deg',  fontSize:26 }}>🌟</span>
        <span style={{ left:'3%',  top:'48%', '--dur':'4s',   '--rot':'-8deg', fontSize:24 }}>🦋</span>
        <span style={{ right:'3%', top:'46%', '--dur':'3.3s', '--rot':'5deg',  fontSize:22 }}>🌈</span>
        {/* 🐠 魚 */}
        {FISH_LIST.map(f => (
          <span
            key={f.id}
            className={f.rtl ? 'tp-fish-rtl' : 'tp-fish'}
            style={{ fontSize: 26, '--dur': f.dur, '--delay': f.delay }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      {/* ── 右上ボタン群（コイン含む） ── */}
      <div className="tp-top-btns">
        <div className="tp-coin-badge">
          🪙 <span className="tp-coin-num">{coins}</span>
        </div>
        <button className="tp-top-btn tp-shop-btn" onClick={() => setShopOpen(true)}
          title={lang === 'en' ? 'Shop' : 'ショップ'}>
          🛒 <span className="tp-shop-label">{{ja:'ショップ', en:'Shop', zh:'商店', ko:'상점', es:'Tienda'}[lang] || 'ショップ'}</span>
        </button>
        <button className="tp-top-btn" onClick={startRoulette}
          title={{ja:'ゲームルーレット', en:'Game Roulette', zh:'游戏轮盘', ko:'게임 룰렛', es:'Ruleta'}[lang] || 'ゲームルーレット'}>
          🎲
        </button>
        <button className="tp-top-btn" onClick={openZukan}
          title={{ja:'スタンプずかん', en:'Stamp Book', zh:'印章图鉴', ko:'스탬프 도감', es:'Álbum'}[lang] || 'スタンプずかん'}>
          📖
        </button>
        <button className="tp-top-btn ksk-top-btn" onClick={() => openPanel('princess')}
          title={lang === 'en' ? 'Dress up' : 'きがえ'}>
          👗
        </button>
        <button className="tp-top-btn" onClick={handleMuteToggle}
          title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button className="tp-top-btn tp-lang-btn" onClick={handleLangToggle}
          title="Language / 言語">
          {LANG_FLAGS[lang]}<span className="tp-lang-code">{lang.toUpperCase()}</span>
        </button>
      </div>

      {/* ── ヘッダー ── */}
      <div className="tp-header" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="ksk-title-zone">
          <div className="tp-mascot-bubble" key={mascotText} aria-live="polite">
            {mascotText}
          </div>
          <div className="tp-title-wrap">
            <h1 className="tp-title">
              <span className="tp-title-1">
                {{ja:'わくわく', en:'Waku Waku', zh:'哇酷哇酷', ko:'와쿠와쿠', es:'Waku Waku'}[lang] || 'わくわく'}
              </span>
              <span className="tp-title-2">
                {{ja:'アイランド', en:'Island', zh:'岛', ko:'아일랜드', es:'Island'}[lang] || 'アイランド'}
              </span>
            </h1>
          </div>

          {/* ② 季節＋ゲーム数チップ（タイトル直下に統合） */}
          <div className="tp-hero-chips">
            <div
              className="tp-season tp-season--chip"
              style={{ '--season-color': season.color, '--season-glow': season.glow }}
            >
              {season.emoji} {season[lang] || season.ja}
            </div>
            <div className="tp-count-chip">
              🎮 {{
                ja:`むりょうゲーム ${ALL_SHELF_GAMES.length}こ！`,
                en:`${ALL_SHELF_GAMES.length} Free Games!`,
                zh:`${ALL_SHELF_GAMES.length}个免费游戏！`,
                ko:`무료 게임 ${ALL_SHELF_GAMES.length}개!`,
                es:`¡${ALL_SHELF_GAMES.length} juegos gratis!`,
              }[lang] || `むりょうゲーム ${ALL_SHELF_GAMES.length}こ！`}
            </div>
          </div>

          <button
            className="tp-cta"
            onClick={() => {
              const el = document.querySelector('.tp-game-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            ▶ {{ja:'いますぐ あそぶ', en:'Play now', zh:'立即游玩', ko:'지금 플레이', es:'Jugar ahora'}[lang] || 'いますぐ あそぶ'}
          </button>

          {/* ── 島ステージ: しろ+やし+きせかえキャラ ── */}
          <div className="tp-island-stage">
            <svg className="tp-island-svg" viewBox="0 0 560 190" aria-hidden="true">
              <defs>
                <linearGradient id="tpSeaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#6FC8EF" /><stop offset="1" stopColor="#2F8DC4" />
                </linearGradient>
                <linearGradient id="tpSandG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFE9B8" /><stop offset="1" stopColor="#F0C97E" />
                </linearGradient>
                <linearGradient id="tpGrassG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#9BE87F" /><stop offset="1" stopColor="#4FBF63" />
                </linearGradient>
              </defs>
              <ellipse cx="280" cy="168" rx="262" ry="20" fill="url(#tpSeaG)" />
              <ellipse cx="280" cy="158" rx="216" ry="27" fill="url(#tpSandG)" />
              <ellipse cx="280" cy="149" rx="176" ry="21" fill="url(#tpGrassG)" />
              <g stroke="#3D3450" strokeWidth="3">
                <rect x="242" y="52" width="76" height="82" rx="6" fill="#FFF4FB" />
                <rect x="225" y="68" width="24" height="66" rx="5" fill="#F6E6FF" />
                <rect x="311" y="68" width="24" height="66" rx="5" fill="#F6E6FF" />
                <polygon points="225,70 237,44 249,70" fill="#8F6BEF" />
                <polygon points="311,70 323,44 335,70" fill="#8F6BEF" />
                <polygon points="240,54 280,20 320,54" fill="#FF7BA9" />
                <rect x="269" y="94" width="22" height="40" rx="10" fill="#B78BE8" />
                <circle cx="280" cy="74" r="8" fill="#FFC93C" />
              </g>
              <path d="M280 20 l0 -12 M280 8 l14 4 -14 6z" stroke="#3D3450" strokeWidth="3" fill="#FFC93C" />
              <g stroke="#3D3450" strokeWidth="3">
                <path d="M448 152 q5 -30 -2 -46" fill="none" stroke="#9A6B3F" strokeWidth="7" />
                <path d="M446 106 q-26 -16 -38 -2 M446 106 q3 -24 22 -21 M446 106 q26 -10 31 5" fill="#4FBF63" />
              </g>
            </svg>
            <div className={`tp-hero-chars${mascotBounce ? ' tp-hero-chars--bounce' : ''}`} onClick={handleMascotTap}>
              <KisekaeCharacters
                kisekaeState={kisekaeState}
                onOpen={openPanel}
                lang={lang}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ── 保護者にも一目で伝わる安心表示 ── */}
      <section className="tp-trust" aria-label={lang === 'ja' ? '安心して遊べるポイント' : 'Safe play information'}>
        <div><span aria-hidden="true">¥0</span><p><strong>{{ja:'ずっと無料', en:'Always free', zh:'完全免费', ko:'완전 무료', es:'Siempre gratis'}[lang] || 'ずっと無料'}</strong><small>{{ja:'お金はかかりません', en:'No payments', zh:'无需付费', ko:'결제 없음', es:'Sin pagos'}[lang] || 'お金はかかりません'}</small></p></div>
        <div><span aria-hidden="true">✓</span><p><strong>{{ja:'登録なし', en:'No sign-up', zh:'无需注册', ko:'가입 없음', es:'Sin registro'}[lang] || '登録なし'}</strong><small>{{ja:'すぐに遊べます', en:'Play right away', zh:'打开就能玩', ko:'바로 플레이', es:'Juega al instante'}[lang] || 'すぐに遊べます'}</small></p></div>
        <div><span aria-hidden="true">↓</span><p><strong>{{ja:'インストール不要', en:'No install', zh:'无需安装', ko:'설치 불필요', es:'Sin instalación'}[lang] || 'インストール不要'}</strong><small>{{ja:'ブラウザだけでOK', en:'Browser only', zh:'浏览器即可', ko:'브라우저만으로 OK', es:'Solo navegador'}[lang] || 'ブラウザだけでOK'}</small></p></div>
        <div><span aria-hidden="true">♡</span><p><strong>{{ja:'子ども向け', en:'Made for kids', zh:'儿童友好', ko:'어린이용', es:'Para niños'}[lang] || '子ども向け'}</strong><small>{{ja:'こわい表現なし', en:'No scary content', zh:'无恐怖内容', ko:'무서운 표현 없음', es:'Sin contenido aterrador'}[lang] || 'こわい表現なし'}</small></p></div>
      </section>

      {/* ── ゲームセクション ── */}
      <div className="tp-game-section">
        {/* ── 最初に選びやすい代表6本 ── */}
        <section className="tp-beginner">
          <div className="tp-beginner-head">
            <div>
              <span>{{ja:'はじめてでも かんたん', en:'Easy first picks', zh:'第一次也很简单', ko:'처음에도 쉬워요', es:'Fáciles para empezar'}[lang] || 'はじめてでも かんたん'}</span>
              <h2>{{ja:'まずは ここから！', en:'Start here!', zh:'从这里开始！', ko:'여기서 시작!', es:'¡Empieza aquí!'}[lang] || 'まずは ここから！'}</h2>
            </div>
            <p>{{ja:'人気の6本をえらびました。カードを押すと、すぐに遊べます。', en:'Six friendly favorites. Tap a card to play.', zh:'精选6款热门游戏，点击即可开始。', ko:'인기 게임 6개를 골랐어요. 카드를 눌러 바로 시작해요.', es:'Seis favoritos. Toca una tarjeta para jugar.'}[lang] || '人気の6本をえらびました。カードを押すと、すぐに遊べます。'}</p>
          </div>
          <div className="tp-beginner-grid">
            {beginnerGames.map(game => (
              <BeginnerCard
                key={game.route}
                game={game}
                lang={lang}
                onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, game.route, e.clientX, e.clientY); }}
              />
            ))}
          </div>
        </section>

        {/* ── sticky統合バー：切替タブ＋エリアジャンプ ── */}
        <div className="tp-sticky-bar">
          <div className="tp-view-toggle" role="tablist">
            <button
              role="tab"
              aria-selected={topView === 'map'}
              className={`tp-view-tab${topView === 'map' ? ' tp-view-tab--on' : ''}`}
              onClick={() => changeTopView('map')}
            >
              🗺️ {{ja:'しまマップ', en:'Island Map', zh:'岛屿地图', ko:'섬 지도', es:'Mapa'}[lang] || 'しまマップ'}
            </button>
            <button
              role="tab"
              aria-selected={topView === 'list'}
              className={`tp-view-tab${topView === 'list' ? ' tp-view-tab--on' : ''}`}
              onClick={() => changeTopView('list')}
            >
              📋 {{ja:'いちらん', en:'List', zh:'列表', ko:'목록', es:'Lista'}[lang] || 'いちらん'}
            </button>
          </div>
          {topView === 'list' && (
            <div className="tp-filter-stack">
              <div className="tp-cat-chips" role="tablist" aria-label="カテゴリ">
                {CAT_CHIPS.map(c => (
                  <button
                    key={c.key}
                    role="tab"
                    aria-selected={catKey === c.key}
                    className={`tp-cat-chip${catKey === c.key ? ' tp-cat-chip--on' : ''}`}
                    onClick={() => setCatKey(c.key)}
                  >
                    {c.label[lang] || c.label.ja}
                  </button>
                ))}
              </div>
              <div className="tp-age-filter" role="tablist" aria-label={lang === 'ja' ? '年齢で選ぶ' : 'Choose by age'}>
                <strong>{{ja:'ねんれいで えらぶ', en:'Choose by age', zh:'按年龄选择', ko:'나이로 선택', es:'Elegir por edad'}[lang] || 'ねんれいで えらぶ'}</strong>
                <div>
                  {AGE_FILTERS.map(age => (
                    <button
                      key={age.key}
                      role="tab"
                      aria-selected={ageKey === age.key}
                      className={ageKey === age.key ? 'tp-age-chip tp-age-chip--on' : 'tp-age-chip'}
                      onClick={() => setAgeKey(age.key)}
                    >
                      {age.label[lang] || age.label.ja}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {topView === 'map' && (
            <div className="tp-sticky-jump">
              {SHELF_GROUPS.map(grp => {
                if (!ALL_SHELF_GAMES.some(g => grp.match(g))) return null;
                return (
                  <button
                    key={grp.key}
                    className="im-jump-btn"
                    style={{ '--sign': (MAP_AREA_THEMES[grp.key] || {}).sign || '#888' }}
                    onClick={() => {
                      const el = document.getElementById(`im-area-${grp.key}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <span className="im-jump-icon">{grp.icon}</span>
                    <span className="im-jump-label">{grp.label[lang] || grp.label.ja}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── しまマップ ── */}
        {topView === 'map' && (
          <IslandMap
            groups={SHELF_GROUPS}
            games={ALL_SHELF_GAMES}
            lang={lang}
            svgMap={GAME_SVGS}
            onPlay={(game, e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, game.route, e.clientX, e.clientY); }}
          />
        )}

        {/* ── ジャンルグループ別ゲーム棚(6棚) ── */}
        {topView === 'list' && SHELF_GROUPS.map(grp => {
          const chip  = CAT_CHIPS.find(c => c.key === catKey) || CAT_CHIPS[0];
          const age   = AGE_FILTERS.find(item => item.key === ageKey) || AGE_FILTERS[0];
          const items = ALL_SHELF_GAMES.filter(grp.match).filter(chip.match).filter(age.match);
          if (items.length === 0) return null;
          return (
            <div className="tp-shelf" key={grp.key}>
              <div className="tp-shelf-title">
                {grp.icon} {grp.label[lang] || grp.label.ja}
              </div>
              <div className="tp-shelf-scroll">
                {items.map(game => (
                  <ShelfCard
                    key={game.id}
                    game={game}
                    lang={lang}
                    onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, game.route, e.clientX, e.clientY); }}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* ── 最近遊んだゲーム（マップの下へ移動） ── */}
        {recentGames.length > 0 && (
          <div className="tp-recent">
            <div className="tp-recent-title">
              🕐 {{ja:'さいきんあそんだゲーム', en:'Recently Played', zh:'最近玩过', ko:'최근 플레이', es:'Reciente'}[lang] || 'さいきんあそんだゲーム'}
            </div>
            <div className="tp-recent-scroll">
              {recentGames.map(g => (
                <button
                  key={g.route}
                  className="tp-recent-card"
                  onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, g.route, e.clientX, e.clientY); }}
                >
                  <span className="tp-recent-icon">{g.icon}</span>
                  <span className="tp-recent-name">{(g[lang] || g.ja).name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── きみにオススメ ── */}
        {recoGames.length > 0 && (
          <div className="tp-recent tp-reco">
            <div className="tp-recent-title">
              💡 {{ja:'きみに オススメ', en:'For You', zh:'为你推荐', ko:'추천 게임', es:'Para ti'}[lang] || 'きみに オススメ'}
            </div>
            <div className="tp-recent-scroll">
              {recoGames.map(g => (
                <button
                  key={g.route}
                  className="tp-recent-card"
                  onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, g.route, e.clientX, e.clientY); }}
                >
                  <span className="tp-recent-icon">{g.icon}</span>
                  <span className="tp-recent-name">{(g[lang] || g.ja).name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── フッターパレード ── */}
      <div className="tp-parade">
        {['🦁','🐨','🦊','🐸','🐧','🦝','🐥','🦋','🐝','🌸'].map((e, i) => (
          <span key={i} style={{ '--dur': `${2 + i * 0.3}s`, animationDelay: `${i * 0.15}s` }}>
            {e}
          </span>
        ))}
      </div>
      <div className="tp-footer">
        <div>
          {{ja:'🌟 あそびたいゲームをえらんでね 🌟', en:'🌟 Pick a game to play! 🌟', zh:'🌟 选择想玩的游戏 🌟', ko:'🌟 하고 싶은 게임을 골라요 🌟', es:'🌟 ¡Elige un juego para jugar! 🌟'}[lang] || '🌟 あそびたいゲームをえらんでね 🌟'}
        </div>
        <div className="tp-footer-links">
          <button className="tp-footer-link" onClick={() => navigate('/privacy')}>
            {{ja:'🔒 プライバシーポリシー', en:'🔒 Privacy Policy', zh:'🔒 隐私政策', ko:'🔒 개인정보 처리방침', es:'🔒 Privacidad'}[lang] || '🔒 プライバシーポリシー'}
          </button>
          <span className="tp-footer-sep">|</span>
          <button className="tp-footer-link" onClick={() => navigate('/terms')}>
            {{ja:'📜 利用規約', en:'📜 Terms of Use', zh:'📜 使用条款', ko:'📜 이용약관', es:'📜 Términos'}[lang] || '📜 利用規約'}
          </button>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(0,0,0,0.28)', display:'flex', justifyContent:'center', gap:12 }}>
          <span>© 2026 Wakuwaku Island</span>
          <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>v{__APP_VERSION__}</span>
        </div>
      </div>

      {/* ── ルーレットオーバーレイ ── */}
      {rouletteOpen && (() => {
        const pool = ALL_SHELF_GAMES;
        const g = pool[rouletteIdx % pool.length];
        return (
          <div className="tp-roulette-overlay" onClick={() => { if (!rouletteSpin) closeRoulette(); }}>
            <div className="tp-roulette-box" onClick={(e) => e.stopPropagation()}>
              <div className="tp-roulette-title">
                {rouletteSpin
                  ? ({ja:'えらんでるよ…🎲', en:'Picking… 🎲', zh:'选择中…🎲', ko:'고르는 중…🎲', es:'Eligiendo… 🎲'}[lang] || 'えらんでるよ…🎲')
                  : ({ja:'きょうは これ！', en:'Today\'s pick!', zh:'今天玩这个！', ko:'오늘은 이거!', es:'¡Hoy toca este!'}[lang] || 'きょうは これ！')}
              </div>
              <div className={`tp-roulette-card${rouletteSpin ? ' tp-roulette-card--spin' : ' tp-roulette-card--win'}`}
                   style={{ background: CARD_GRADIENTS[g.category] || DEFAULT_GRADIENT }}>
                <div className="tp-roulette-art">{GAME_SVGS[g.id] || <span className="tp-roulette-icon">{g.icon}</span>}</div>
                <div className="tp-roulette-name">{(g[lang] || g.ja).name}</div>
              </div>
              {!rouletteSpin && (
                <div className="tp-roulette-actions">
                  <button className="tp-roulette-play"
                    onClick={(e) => { closeRoulette(); spawnParticles(e.clientX, e.clientY); transitionTo(navigate, g.route, e.clientX, e.clientY); }}>
                    ▶ {{ja:'これであそぶ！', en:'Play this!', zh:'就玩这个！', ko:'이걸로 놀기!', es:'¡Jugar!'}[lang] || 'これであそぶ！'}
                  </button>
                  <button className="tp-roulette-retry" onClick={startRoulette}>
                    🎲 {{ja:'もういっかい', en:'Again', zh:'再来一次', ko:'다시', es:'Otra vez'}[lang] || 'もういっかい'}
                  </button>
                  <button className="tp-roulette-close" onClick={closeRoulette}>✕</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── スタンプずかんオーバーレイ ── */}
      {zukanOpen && (() => {
        const all = [...GAMES, ...SCHOOL_GAMES];
        const got = all.filter(g => playHist[g.route]).length;
        const complete = got === all.length;
        return (
          <div className="tp-roulette-overlay" onClick={() => setZukanOpen(false)}>
            <div className="tp-zukan-box" onClick={(e) => e.stopPropagation()}>
              <div className="tp-roulette-title">
                📖 {{ja:'スタンプずかん', en:'Stamp Book', zh:'印章图鉴', ko:'스탬프 도감', es:'Álbum de sellos'}[lang] || 'スタンプずかん'}
              </div>
              <div className="tp-zukan-progress">
                {complete
                  ? ({ja:'🎉 コンプリート！すごい！', en:'🎉 Complete! Amazing!', zh:'🎉 全部集齐！太棒了！', ko:'🎉 컴플리트! 대단해!', es:'🎉 ¡Completo! ¡Increíble!'}[lang] || '🎉 コンプリート！すごい！')
                  : `⭐ ${got} / ${all.length}`}
              </div>
              <div className="tp-zukan-grid">
                {all.map(g => {
                  const played = !!playHist[g.route];
                  return (
                    <button key={g.route}
                      className={`tp-zukan-cell${played ? ' tp-zukan-cell--got' : ''}`}
                      style={played ? { background: CARD_GRADIENTS[g.category] || DEFAULT_GRADIENT } : undefined}
                      onClick={(e) => { setZukanOpen(false); spawnParticles(e.clientX, e.clientY); transitionTo(navigate, g.route, e.clientX, e.clientY); }}>
                      <span className="tp-zukan-icon">{played ? g.icon : '❓'}</span>
                      <span className="tp-zukan-name">{played ? (g[lang] || g.ja).name : '？？？'}</span>
                    </button>
                  );
                })}
              </div>
              <div className="tp-zukan-hint">
                {{ja:'あそぶと スタンプが もらえるよ！', en:'Play games to collect stamps!', zh:'玩游戏就能收集印章！', ko:'게임하면 스탬프를 모을 수 있어!', es:'¡Juega para conseguir sellos!'}[lang] || 'あそぶと スタンプが もらえるよ！'}
              </div>
              <button className="tp-roulette-close" onClick={() => setZukanOpen(false)}>✕ {{ja:'とじる', en:'Close', zh:'关闭', ko:'닫기', es:'Cerrar'}[lang] || 'とじる'}</button>
            </div>
          </div>
        );
      })()}

      {/* ── 着せ替えパネル ── */}
      <KisekaePanel
        isOpen={panelOpen}
        initialChara={panelChara}
        onClose={() => setPanelOpen(false)}
        kisekaeState={kisekaeState}
        onStateChange={handleKisekaeChange}
        lang={lang}
      />

      {/* ── ショップ ── */}
      <Shop
        isOpen={shopOpen}
        onClose={() => setShopOpen(false)}
        lang={lang}
        onCoinsChange={setCoins}
      />

      {/* ── ログインボーナス ── */}
      {loginBonus && (
        <LoginBonus
          bonus={loginBonus.bonus}
          streak={loginBonus.streak}
          onClaim={handleLoginBonusClaim}
          lang={lang}
        />
      )}

    </div>
  );
}
