import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { startBGM, stopBGM, toggleBGM } from '../utils/audio';
import { transitionTo } from '../utils/transition';
import { getPlayCount } from '../utils/playCounter';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { KisekaeCharacters, KisekaePanel } from '../components/Kisekae';
import { DEFAULT_KISEKAE, normalizeKisekaeState, syncSpecialUnlocks } from '../components/kisekae/data';
import LoginBonus from '../components/LoginBonus';
import Shop from '../components/Shop';
import { getCoins, checkLoginBonus, claimLoginBonus } from '../utils/coins';
import { getRecentGames } from '../utils/recentGames';
import { getPlayHistory } from '../utils/playHistory';
import { detectLang } from '../utils/i18n';
import { trackEvent } from '../utils/analytics';
import GAME_META from '../seo/gameMeta';
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
  'ぼうけん':   'linear-gradient(145deg, #8ED8C1, #9B82D8)',
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
  { key:'ぼうけん',   icon:'🌈', label:{ja:'ぼうけん',   en:'Adventure', zh:'冒险',   ko:'모험',   es:'Aventura'} },
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

  g_nijiiro: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#CFF0FF"/>
      <path d="M0 85 Q26 62 52 74 Q78 86 100 66 V85Z" fill="#B8E39B"/>
      <g fill="none" strokeWidth="5" strokeLinecap="round">
        <path d="M16 62 A34 34 0 0 1 84 62" stroke="#FF9FB6"/>
        <path d="M23 62 A27 27 0 0 1 77 62" stroke="#FFCF5C"/>
        <path d="M30 62 A20 20 0 0 1 70 62" stroke="#9BE0B4"/>
        <path d="M37 62 A13 13 0 0 1 63 62" stroke="#7FC8F0"/>
      </g>
      <g transform="translate(50 34)">
        <path d="M-15 8 L-15 -3 L-7 4 L0 -8 L7 4 L15 -3 L15 8Z" fill="#F7D374" stroke="#CE9A2A" strokeWidth="2"/>
        <rect x="-15" y="7" width="30" height="7" rx="3" fill="#F2C14E" stroke="#CE9A2A" strokeWidth="2"/>
        <circle cx="-8" cy="10.5" r="2.6" fill="#FF9FB6"/>
        <circle cx="0" cy="10.5" r="2.6" fill="#7FC8F0"/>
        <circle cx="8" cy="10.5" r="2.6" fill="#C3AEF0"/>
      </g>
      <g transform="translate(22 64)">
        <ellipse cy="8" rx="9" ry="8" fill="#FFB9D0"/>
        <ellipse cx="-4" cy="-11" rx="2.6" ry="6" fill="#FFB9D0"/>
        <ellipse cx="4" cy="-11" rx="2.6" ry="6" fill="#FFB9D0"/>
        <circle cy="-2" r="9" fill="#FFB9D0"/>
        <ellipse cy="0" rx="7" ry="6" fill="#FFF3F6"/>
        <circle cx="-2.6" cy="-1.5" r="1.3" fill="#4A3B32"/>
        <circle cx="2.6" cy="-1.5" r="1.3" fill="#4A3B32"/>
      </g>
      <g transform="translate(76 66)">
        <ellipse cy="7" rx="8.5" ry="7.5" fill="#C7A9F0"/>
        <path d="M-8 -8 L-5 -15 L-1 -9 M8 -8 L5 -15 L1 -9" fill="#C7A9F0"/>
        <circle cy="-2" r="8.5" fill="#C7A9F0"/>
        <ellipse cy="0" rx="6.6" ry="5.6" fill="#FFF0E2"/>
        <circle cx="-2.4" cy="-1.5" r="1.2" fill="#4A3B32"/>
        <circle cx="2.4" cy="-1.5" r="1.2" fill="#4A3B32"/>
      </g>
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
      <path d="M0 84 L20 33 H80 L100 84Z" fill="url(#kTrk)"/>
      <path d="M22 84 L39 33M50 84V33M78 84L61 33" stroke="#f7d755" strokeWidth="1.6" strokeDasharray="4 4" opacity=".9"/>
      <path d="M7 48h18" stroke="#58a94f" strokeWidth="5"/><path d="M76 49h18" stroke="#58a94f" strokeWidth="5"/>
      <path d="M83 31l3 5 6 .7-4.5 4 1.2 6-5.7-3.2-5.5 3.2 1.1-6-4.5-4 6-.7z" fill="#ffe14d" stroke="#e59c16" strokeWidth="1"/>
      <g transform="translate(15 48) scale(.58)"><rect x="0" y="7" width="27" height="11" rx="4" fill="#6b83dd"/><path d="M7 7l4-6h8l4 6" fill="#7d96f0"/><circle cx="6" cy="19" r="5" fill="#1f2434"/><circle cx="22" cy="19" r="5" fill="#1f2434"/></g>
      <g transform="translate(58 43) scale(.72)"><rect x="0" y="7" width="27" height="11" rx="4" fill="#57b969"/><path d="M7 7l4-6h8l4 6" fill="#80db81"/><circle cx="6" cy="19" r="5" fill="#1f2434"/><circle cx="22" cy="19" r="5" fill="#1f2434"/></g>
      <g transform="translate(36 57)"><rect x="0" y="7" width="32" height="13" rx="5" fill="#e8471e"/><path d="M7 7l5-7h10l5 7Z" fill="#ff7752"/><circle cx="7" cy="21" r="6" fill="#202431"/><circle cx="25" cy="21" r="6" fill="#202431"/><circle cx="7" cy="21" r="2.3" fill="#b9c1d1"/><circle cx="25" cy="21" r="2.3" fill="#b9c1d1"/><circle cx="16" cy="1" r="4" fill="#ffd6ad"/><path d="M12-1q4-7 8 0" fill="#ff8e5d"/></g>
      <rect x="6" y="7" width="28" height="8" rx="3" fill="#17253f" opacity=".8"/><rect x="8" y="9" width="15" height="4" rx="2" fill="#ffe14d"/><rect x="24" y="9" width="8" height="4" rx="2" fill="#ff8469"/>
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
        <linearGradient id="mmBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8edcff"/><stop offset="1" stopColor="#dff8ff"/></linearGradient>
        <linearGradient id="mmGate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#81d4fa"/><stop offset="1" stopColor="#2962ff"/></linearGradient>
        <linearGradient id="mmGem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f8bbd0"/><stop offset="1" stopColor="#c2185b"/></linearGradient>
      </defs>
      <rect width="100" height="85" fill="url(#mmBg)"/>
      <circle cx="84" cy="12" r="7" fill="#fff59d" opacity="0.9"/>
      <g fill="#65b85f">
        <rect x="8" y="14" width="52" height="8" rx="2"/>
        <rect x="8" y="14" width="8" height="34" rx="2"/>
        <rect x="30" y="30" width="38" height="8" rx="2"/>
        <rect x="84" y="26" width="8" height="38" rx="2"/>
        <rect x="8" y="60" width="44" height="8" rx="2"/>
        <rect x="62" y="46" width="8" height="22" rx="2"/>
        <rect x="24" y="44" width="8" height="16" rx="2"/>
      </g>
      <g fill="#9be37b" opacity="0.9">
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
      <rect width="100" height="85" rx="12" fill="#AEE8FF"/>
      <ellipse cx="50" cy="52" rx="48" ry="26" fill="#8FDD7E"/>
      <ellipse cx="50" cy="52" rx="48" ry="26" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity=".45"/>
      <circle cx="20" cy="30" r="9" fill="#6FC85C"/>
      <circle cx="80" cy="28" r="10" fill="#6FC85C"/>
      <circle cx="14" cy="14" r="5" fill="#FFE27A" opacity=".9"/>
      <circle cx="17" cy="61" r="7.5" fill="#FFE24A" stroke="#F2A20C" strokeWidth="1.6"/>
      <circle cx="30" cy="20" r="6.5" fill="#E53935" stroke="#B71C1C" strokeWidth="1.4"/>
      <rect x="29.2" y="14.5" width="1.6" height="3.6" rx="0.8" fill="#4CAF50"/>
      <circle cx="72" cy="18" r="5.5" fill="#E53935" stroke="#B71C1C" strokeWidth="1.4"/>
      <rect x="71.2" y="13.2" width="1.6" height="3.4" rx="0.8" fill="#4CAF50"/>
      <ellipse cx="50" cy="70" rx="15" ry="4" fill="#FFFFFF" stroke="#FFD84A" strokeWidth="2" opacity=".9"/>
      <rect x="38" y="58" width="24" height="13" rx="4" fill="#D9A15B" stroke="#8B5E34" strokeWidth="2"/>
      <path d="M37 58c2-5 8-8 13-8s11 3 13 8z" fill="none" stroke="#8B5E34" strokeWidth="2"/>
      <circle cx="50" cy="41" r="9" fill="#FFE0C0"/>
      <path d="M41 37a9 8 0 0118 0z" fill="#7E57C2"/>
      <circle cx="46.6" cy="42" r="1.3" fill="#3A2A18"/>
      <circle cx="53.4" cy="42" r="1.3" fill="#3A2A18"/>
      <path d="M47 45.5q3 2 6 0" fill="none" stroke="#B0793A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M39 53c3-4 8-6 11-6s8 2 11 6l-2 6H41z" fill="#FF9EC4"/>
      <circle cx="45" cy="30" r="2.6" fill="#FFD84A" stroke="#C9930A" strokeWidth="1"/>
      <path d="M50 6l1.6 4.4 4.4 1.6-4.4 1.6L50 18l-1.6-4.4L44 12l4.4-1.6z" fill="#FFD84A"/>
    </svg>
  ),
  g4: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" rx="12" fill="#7EC98A"/>
      <ellipse cx="50" cy="74" rx="42" ry="8" fill="#5FAF6C" opacity=".55"/>
      <circle cx="14" cy="13" r="2" fill="#FFF6C8" opacity=".7"/>
      <circle cx="86" cy="16" r="1.6" fill="#FFF6C8" opacity=".6"/>
      <rect x="8" y="26" width="26" height="34" rx="5" fill="#7E57C2" stroke="#4E3391" strokeWidth="2.5"/>
      <circle cx="21" cy="43" r="7" fill="none" stroke="#B39DDB" strokeWidth="3"/>
      <circle cx="21" cy="43" r="2" fill="#B39DDB"/>
      <rect x="66" y="26" width="26" height="34" rx="5" fill="#7E57C2" stroke="#4E3391" strokeWidth="2.5"/>
      <circle cx="79" cy="43" r="7" fill="none" stroke="#B39DDB" strokeWidth="3"/>
      <circle cx="79" cy="43" r="2" fill="#B39DDB"/>
      <rect x="35" y="44" width="30" height="20" rx="4" fill="#FFF6E3" stroke="#D9BE93" strokeWidth="2.5"/>
      <ellipse cx="50" cy="52" rx="10" ry="9" fill="#F7B267" stroke="#D98C3F" strokeWidth="2"/>
      <path d="M42 45 L40 37 L47 42 Z" fill="#F7B267" stroke="#D98C3F" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M58 45 L60 37 L53 42 Z" fill="#F7B267" stroke="#D98C3F" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="46" cy="51" r="1.8" fill="#2E2A33"/>
      <circle cx="54" cy="51" r="1.8" fill="#2E2A33"/>
      <ellipse cx="50" cy="56" rx="3.5" ry="2.4" fill="#FFF8EC"/>
      <circle cx="50" cy="55" r="1.2" fill="#E87A8A"/>
      <path d="M50 20 L52.6 26.4 L59 29 L52.6 31.6 L50 38 L47.4 31.6 L41 29 L47.4 26.4 Z" fill="#FFE082" stroke="#E8B84B" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  g5: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#241645"/>
      <circle cx="82" cy="14" r="9" fill="#3a2159"/>
      <circle cx="14" cy="10" r="1.6" fill="#FFF6E8" opacity=".8"/><circle cx="27" cy="18" r="1.1" fill="#FFF6E8" opacity=".6"/><circle cx="60" cy="8" r="1.3" fill="#FFF6E8" opacity=".7"/>
      <path d="M0 66 Q25 58 50 65 Q75 72 100 62 V85H0Z" fill="#2e2340"/>
      <g stroke="#6b4a2f" strokeWidth="2"><path d="M20 30V58"/><path d="M35 30V58"/></g>
      <path d="M16 30H39" stroke="#b94d45" strokeWidth="3"/><path d="M18.5 26H36.5" stroke="#b94d45" strokeWidth="2.5"/>
      <g transform="translate(59 40)"><ellipse rx="8" ry="9.5" fill="#E8564F"/><rect x="-6" y="-4" width="12" height="2.6" fill="#FFE5A0"/><rect x="-6" y="4" width="12" height="2.6" fill="#FFE5A0"/><rect x="-3.6" y="-2.8" width="7.2" height="7.2" fill="#FFF6E8"/><text x="0" y="2.6" textAnchor="middle" fontSize="7" fill="#633D30" fontWeight="bold">3</text></g>
      <g transform="translate(78 46)"><ellipse rx="6.5" ry="7.8" fill="#E8564F"/><rect x="-4.8" y="-3.2" width="9.6" height="2.1" fill="#FFE5A0"/><rect x="-4.8" y="3.2" width="9.6" height="2.1" fill="#FFE5A0"/><rect x="-3" y="-2.3" width="6" height="6" fill="#FFF6E8"/><text x="0" y="2.2" textAnchor="middle" fontSize="6" fill="#633D30" fontWeight="bold">5</text></g>
      <g transform="translate(30 66)"><circle cy="-11" r="8" fill="#C78B5C"/><circle cx="-6.5" cy="-16.5" r="2.6" fill="#C78B5C"/><circle cx="6.5" cy="-16.5" r="2.6" fill="#C78B5C"/><rect x="-8" y="-3" width="16" height="15" rx="6" fill="#D95562"/><circle cx="-2.8" cy="-11.5" r="1" fill="#2E2A33"/><circle cx="2.8" cy="-11.5" r="1" fill="#2E2A33"/></g>
      <path d="M50 26 L52.4 32.1 L58.5 34.5 L52.4 36.9 L50 43 L47.6 36.9 L41.5 34.5 L47.6 32.1 Z" fill="#FFD76A"/>
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
      <rect x="0" y="0" width="100" height="85" rx="12" fill="#BFE7F7"/>
      <circle cx="84" cy="13" r="7.5" fill="#FFE28A"/>
      <circle cx="84" cy="13" r="4.6" fill="#FFF6D0"/>
      <ellipse cx="20" cy="14" rx="10" ry="4.2" fill="#ffffff" opacity=".9"/>
      <ellipse cx="28" cy="11" rx="6.4" ry="3.4" fill="#ffffff" opacity=".9"/>
      <path d="M12 27h5.5v10H12z" fill="#8A5E36"/>
      <circle cx="14.8" cy="23" r="8.2" fill="#4E9E42"/>
      <circle cx="11" cy="26" r="5.2" fill="#6FC65C"/>
      <path d="M82 28h5.5v10H82z" fill="#8A5E36"/>
      <circle cx="84.8" cy="24" r="8.2" fill="#4E9E42"/>
      <circle cx="88.6" cy="27" r="5.2" fill="#6FC65C"/>
      <ellipse cx="50" cy="63" rx="45" ry="17" fill="#7A5334"/>
      <ellipse cx="50" cy="57" rx="45" ry="17" fill="#6FBE5C"/>
      <ellipse cx="50" cy="55" rx="45" ry="16" fill="#8FD478"/>
      <rect x="26" y="41" width="48" height="4.4" rx="2.2" fill="#8B5E3C"/>
      <rect x="26" y="41" width="48" height="1.6" rx="0.8" fill="#A5764F"/>
      <rect x="21" y="50" width="58" height="5" rx="2.5" fill="#8B5E3C"/>
      <rect x="21" y="50" width="58" height="1.8" rx="0.9" fill="#A5764F"/>
      <rect x="15" y="59" width="70" height="5.6" rx="2.8" fill="#8B5E3C"/>
      <rect x="15" y="59" width="70" height="2" rx="1" fill="#A5764F"/>
      <ellipse cx="33" cy="42" rx="6.4" ry="2.6" fill="#4E9E42"/>
      <ellipse cx="33" cy="41" rx="5.2" ry="2" fill="#6FC65C"/>
      <ellipse cx="33" cy="37.6" rx="3.1" ry="2.8" fill="#E8365F"/>
      <path d="M29.9 37.6q3.1 6.4 6.2 0z" fill="#E8365F"/>
      <ellipse cx="33" cy="34.6" rx="3.7" ry="1.5" fill="#5FB84E"/>
      <circle cx="31.8" cy="38.4" r=".6" fill="#FFE9A8"/>
      <circle cx="34.2" cy="37.4" r=".6" fill="#FFE9A8"/>
      <ellipse cx="50" cy="42" rx="6.4" ry="2.6" fill="#4E9E42"/>
      <ellipse cx="50" cy="41" rx="5.2" ry="2" fill="#6FC65C"/>
      <ellipse cx="50" cy="37.6" rx="3.1" ry="2.8" fill="#E8365F"/>
      <path d="M46.9 37.6q3.1 6.4 6.2 0z" fill="#E8365F"/>
      <ellipse cx="50" cy="34.6" rx="3.7" ry="1.5" fill="#5FB84E"/>
      <circle cx="48.8" cy="38.4" r=".6" fill="#FFE9A8"/>
      <circle cx="51.2" cy="37.4" r=".6" fill="#FFE9A8"/>
      <ellipse cx="67" cy="42" rx="6.4" ry="2.6" fill="#4E9E42"/>
      <ellipse cx="67" cy="41" rx="5.2" ry="2" fill="#6FC65C"/>
      <ellipse cx="67" cy="37.6" rx="3.1" ry="2.8" fill="#E8365F"/>
      <path d="M63.9 37.6q3.1 6.4 6.2 0z" fill="#E8365F"/>
      <ellipse cx="67" cy="34.6" rx="3.7" ry="1.5" fill="#5FB84E"/>
      <circle cx="65.8" cy="38.4" r=".6" fill="#FFE9A8"/>
      <circle cx="68.2" cy="37.4" r=".6" fill="#FFE9A8"/>
      <ellipse cx="29" cy="51.4" rx="7.2" ry="3" fill="#4E9E42"/>
      <ellipse cx="29" cy="50.2" rx="5.8" ry="2.3" fill="#6FC65C"/>
      <ellipse cx="29" cy="46.2" rx="3.6" ry="3.2" fill="#E8365F"/>
      <path d="M25.4 46.2q3.6 7.4 7.2 0z" fill="#E8365F"/>
      <ellipse cx="29" cy="42.8" rx="4.3" ry="1.7" fill="#5FB84E"/>
      <circle cx="27.6" cy="47.2" r=".7" fill="#FFE9A8"/>
      <circle cx="30.4" cy="46" r=".7" fill="#FFE9A8"/>
      <circle cx="29" cy="49.2" r=".7" fill="#FFE9A8"/>
      <ellipse cx="50" cy="51.4" rx="7.2" ry="3" fill="#4E9E42"/>
      <ellipse cx="50" cy="50.2" rx="5.8" ry="2.3" fill="#6FC65C"/>
      <ellipse cx="50" cy="46.2" rx="3.6" ry="3.2" fill="#FFDD55"/>
      <path d="M46.4 46.2q3.6 7.4 7.2 0z" fill="#FFDD55"/>
      <ellipse cx="50" cy="42.8" rx="4.3" ry="1.7" fill="#5FB84E"/>
      <path d="M50 25.6l1.5 3.4 3.4 1.5-3.4 1.5-1.5 3.4-1.5-3.4-3.4-1.5 3.4-1.5z" fill="#FFF6D0"/>
      <ellipse cx="71" cy="51.4" rx="7.2" ry="3" fill="#4E9E42"/>
      <ellipse cx="71" cy="50.2" rx="5.8" ry="2.3" fill="#6FC65C"/>
      <ellipse cx="71" cy="46.2" rx="3.6" ry="3.2" fill="#E8365F"/>
      <path d="M67.4 46.2q3.6 7.4 7.2 0z" fill="#E8365F"/>
      <ellipse cx="71" cy="42.8" rx="4.3" ry="1.7" fill="#5FB84E"/>
      <circle cx="69.6" cy="47.2" r=".7" fill="#FFE9A8"/>
      <circle cx="72.4" cy="46" r=".7" fill="#FFE9A8"/>
      <circle cx="71" cy="49.2" r=".7" fill="#FFE9A8"/>
      <ellipse cx="23" cy="60.6" rx="8" ry="3.4" fill="#4E9E42"/>
      <ellipse cx="23" cy="59.2" rx="6.4" ry="2.6" fill="#6FC65C"/>
      <ellipse cx="23" cy="54.8" rx="4" ry="3.6" fill="#E8365F"/>
      <path d="M19 54.8q4 8.2 8 0z" fill="#E8365F"/>
      <ellipse cx="23" cy="51" rx="4.8" ry="1.9" fill="#5FB84E"/>
      <circle cx="21.4" cy="55.9" r=".8" fill="#FFE9A8"/>
      <circle cx="24.6" cy="54.6" r=".8" fill="#FFE9A8"/>
      <circle cx="23" cy="58.1" r=".8" fill="#FFE9A8"/>
      <ellipse cx="77" cy="60.6" rx="8" ry="3.4" fill="#4E9E42"/>
      <ellipse cx="77" cy="59.2" rx="6.4" ry="2.6" fill="#6FC65C"/>
      <ellipse cx="77" cy="54.8" rx="4" ry="3.6" fill="#E8365F"/>
      <path d="M73 54.8q4 8.2 8 0z" fill="#E8365F"/>
      <ellipse cx="77" cy="51" rx="4.8" ry="1.9" fill="#5FB84E"/>
      <circle cx="75.4" cy="55.9" r=".8" fill="#FFE9A8"/>
      <circle cx="78.6" cy="54.6" r=".8" fill="#FFE9A8"/>
      <circle cx="77" cy="58.1" r=".8" fill="#FFE9A8"/>
      <ellipse cx="50" cy="65" rx="18" ry="6.4" fill="#A96E36"/>
      <ellipse cx="50" cy="65" rx="15.2" ry="4.8" fill="#8A5A2A"/>
      <ellipse cx="41.5" cy="63.6" rx="4.4" ry="3.8" fill="#E8365F"/>
      <ellipse cx="41.5" cy="60.7" rx="4.6" ry="1.8" fill="#5FB84E"/>
      <ellipse cx="58.5" cy="63.6" rx="4.4" ry="3.8" fill="#E8365F"/>
      <ellipse cx="58.5" cy="60.7" rx="4.6" ry="1.8" fill="#5FB84E"/>
      <ellipse cx="50" cy="62.2" rx="5" ry="4.4" fill="#FF5C8D"/>
      <ellipse cx="50" cy="58.8" rx="5.2" ry="2.1" fill="#5FB84E"/>
      <circle cx="48.4" cy="63" r=".8" fill="#FFF0C8"/>
      <circle cx="51.6" cy="61.8" r=".8" fill="#FFF0C8"/>
      <path d="M32 65q0 12 18 12t18-12z" fill="#C98A4B"/>
      <path d="M35 69.4q15 4.6 30 0v3.2q-15 4.6-30 0z" fill="#AE7238"/>
      <path d="M32 65a18 6.4 0 0 0 36 0" fill="none" stroke="#A96E36" strokeWidth="3"/>
      <path d="M11 41l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" fill="#FFF6D0" opacity=".9"/>
      <path d="M92 46l1.1 2.4 2.4 1.1-2.4 1.1-1.1 2.4-1.1-2.4-2.4-1.1 2.4-1.1z" fill="#FFF6D0" opacity=".85"/>
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
      <rect width="100" height="85" rx="12" fill="#1B4332"/>
      <circle cx="86" cy="14" r="7" fill="#FFF3B0" opacity=".7"/>
      <path d="M18 85V44l-9 9v-6l9-9v-8l-7 7v-6l7-7V16h6v8l7-7v6l-7 7v8l9-9v6l-9 9v41z" fill="#2E7D32"/>
      <path d="M84 85V50l-8 8v-6l8-8v-7l-6 6v-6l6-6v-9h5v9l6-6v6l-6 6v7l8-8v6l-8 8v35z" fill="#2E7D32" opacity=".85"/>
      <g>
        <path d="M40 18l6 10-6 10-6-10z" fill="#66BB6A" stroke="#1B5E20" strokeWidth="1.6" strokeLinejoin="round"/>
        <text x="40" y="32" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFFCF6">あ</text>
      </g>
      <g>
        <path d="M62 34l6.5 10.5-6.5 10.5-6.5-10.5z" fill="#42A5F5" stroke="#0D47A1" strokeWidth="1.6" strokeLinejoin="round"/>
        <text x="62" y="49" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill="#FFFCF6">A</text>
      </g>
      <g>
        <path d="M32 52l6 9.5-6 9.5-6-9.5z" fill="#FFA726" stroke="#E65100" strokeWidth="1.6" strokeLinejoin="round"/>
        <text x="32" y="65.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFCF6">ア</text>
      </g>
      <circle cx="14" cy="14" r="2" fill="#FFFCF6" opacity=".5"/>
      <circle cx="92" cy="60" r="2.4" fill="#FFE066" opacity=".7"/>
      <circle cx="52" cy="14" r="1.6" fill="#FFFCF6" opacity=".4"/>
    </svg>
  ),
  g12: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#BEE3F8"/>
      <circle cx="88" cy="14" r="7" fill="#FFF3B0" opacity=".8"/>
      <rect x="4" y="66" width="92" height="6" rx="2" fill="#8D7B63"/>
      <rect x="8" y="34" width="18" height="20" rx="3" fill="#E04A3F" stroke="#A8362D" strokeWidth="2"/>
      <circle cx="17" cy="26" r="9" fill="#E04A3F" stroke="#A8362D" strokeWidth="2"/>
      <rect x="12" y="20" width="10" height="6" rx="1" fill="#8FC9E8"/>
      <circle cx="12" cy="60" r="4" fill="#4A3B32"/>
      <circle cx="22" cy="60" r="4" fill="#4A3B32"/>
      <rect x="30" y="36" width="22" height="24" rx="3" fill="#F2B24D" stroke="#C77E1E" strokeWidth="2"/>
      <rect x="34" y="41" width="14" height="9" rx="1.5" fill="#FFF6E3"/>
      <text x="41" y="49" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#C77E1E">1</text>
      <circle cx="35" cy="60" r="4" fill="#4A3B32"/>
      <circle cx="47" cy="60" r="4" fill="#4A3B32"/>
      <text x="58" y="52" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#4A3B32">+</text>
      <rect x="64" y="36" width="22" height="24" rx="3" fill="#6EC46E" stroke="#3C8A3C" strokeWidth="2"/>
      <rect x="68" y="41" width="14" height="9" rx="1.5" fill="#FFF6E3"/>
      <text x="75" y="49" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3C8A3C">2</text>
      <circle cx="69" cy="60" r="4" fill="#4A3B32"/>
      <circle cx="81" cy="60" r="4" fill="#4A3B32"/>
      <circle cx="93" cy="46" r="10" fill="#3B79C4" stroke="#2C5FA0" strokeWidth="2"/>
      <text x="93" y="50" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#FFFCF6">？</text>
    </svg>
  ),
  g13: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#CBE9FA"/>
      <circle cx="84" cy="14" r="8" fill="#FFF3B0" opacity=".8"/>
      <circle cx="15" cy="18" r="2" fill="#FFFFFF" opacity=".75"/>
      <circle cx="24" cy="9" r="1.4" fill="#FFFFFF" opacity=".6"/>
      <path d="M31 12c2.6 3.6 4.2 6 4.2 7.8a4.2 4.2 0 11-8.4 0c0-1.8 1.6-4.2 4.2-7.8z" fill="#E63946" stroke="#A81F2B" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M50 6c2.6 3.6 4.2 6 4.2 7.8a4.2 4.2 0 11-8.4 0c0-1.8 1.6-4.2 4.2-7.8z" fill="#FDD835" stroke="#B58F00" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M69 12c2.6 3.6 4.2 6 4.2 7.8a4.2 4.2 0 11-8.4 0c0-1.8 1.6-4.2 4.2-7.8z" fill="#1E88E5" stroke="#125A9E" strokeWidth="1.5" strokeLinejoin="round"/>
      <ellipse cx="50" cy="66" rx="40" ry="11" fill="#8FD46A"/>
      <path d="M14 68c6 9 16 13 36 13s30-4 36-13z" fill="#B08A63"/>
      <ellipse cx="50" cy="64" rx="33" ry="8" fill="#D9AF7E"/>
      <path d="M24 40h52l-5.5 17.5A9 9 0 0162 64H38a9 9 0 01-8.5-6.5z" fill="#5C6A7E" stroke="#36404F" strokeWidth="2.4" strokeLinejoin="round"/>
      <ellipse cx="50" cy="40" rx="26" ry="8.5" fill="#788697" stroke="#36404F" strokeWidth="2.4"/>
      <ellipse cx="50" cy="40.5" rx="21" ry="6.4" fill="#FB8C00"/>
      <circle cx="41" cy="39.6" r="4.4" fill="#E63946" opacity=".92"/>
      <circle cx="58" cy="40.4" r="4.4" fill="#8E24AA" opacity=".85"/>
      <circle cx="50" cy="38.8" r="3.6" fill="#FDD835" opacity=".95"/>
      <ellipse cx="43" cy="37.4" rx="4.5" ry="1.5" fill="#FFFFFF" opacity=".45"/>
      <path d="M27.5 51h45" stroke="#B08A5A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="35" cy="65" r="3.2" fill="#4A5665"/>
      <circle cx="65" cy="65" r="3.2" fill="#4A5665"/>
      <path d="M19 30l1.5 3.6 3.6 1.5-3.6 1.5L19 40.2l-1.5-3.6L13.9 35l3.6-1.5z" fill="#FFE066"/>
      <path d="M81 45l1.1 2.7 2.9 1.1-2.9 1.1L81 52.6l-1.1-2.7-2.9-1.1 2.9-1.1z" fill="#FFE066" opacity=".9"/>
    </svg>
  ),
  g14: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#8FDCFF"/>
      <circle cx="16" cy="14" r="6" fill="#FFE27A" opacity=".9"/>
      <ellipse cx="50" cy="50" rx="42" ry="30" fill="#7ED07A" stroke="#4E9E4C" strokeWidth="2"/>
      <ellipse cx="50" cy="50" rx="42" ry="30" fill="none" stroke="#FFF8E0" strokeWidth="2.4" opacity=".5"/>
      <path d="M14 55c10-8 18 4 28-2s16 6 26-2s16 2 20-4" fill="none" stroke="#E8D3A0" strokeWidth="6" strokeLinecap="round" opacity=".9"/>
      <rect x="24" y="38" width="13" height="12" rx="1.5" fill="#FFB74D" stroke="#A85E00" strokeWidth="1.6"/>
      <path d="M22 38l8.5-7 8.5 7z" fill="#E05656" stroke="#A85E00" strokeWidth="1.6" strokeLinejoin="round"/>
      <rect x="60" y="34" width="13" height="14" rx="1.5" fill="#8FD8FF" stroke="#0A5D96" strokeWidth="1.6"/>
      <path d="M58 34l8.5-7 8.5 7z" fill="#7E4BC4" stroke="#0A5D96" strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="70" cy="58" r="7" fill="#B3ECFF" stroke="#2B90CE" strokeWidth="1.8"/>
      <circle cx="70" cy="58" r="2.4" fill="#FFFFFF"/>
      <circle cx="38" cy="63" r="3.4" fill="#FFE0C0"/>
      <rect x="35.6" y="65.5" width="4.8" height="6" rx="2" fill="#FF9EC4"/>
      <g>
        <ellipse cx="52" cy="66" rx="3.4" ry="2.8" fill="#F6D6A8"/>
        <circle cx="49.6" cy="63.4" r="1.6" fill="#F6D6A8"/>
        <circle cx="54.4" cy="63.4" r="1.6" fill="#F6D6A8"/>
      </g>
      <g>
        <ellipse cx="30" cy="48" rx="3" ry="2.5" fill="#FFF4E8"/>
        <ellipse cx="28.4" cy="45" rx="1.1" ry="2.2" fill="#FFF4E8"/>
        <ellipse cx="31.6" cy="45" rx="1.1" ry="2.2" fill="#FFF4E8"/>
      </g>
    </svg>
  ),
  g15: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="kokkiOcean"><stop stopColor="#61d8ff"/><stop offset="1" stopColor="#17458d"/></radialGradient></defs>
      <rect width="100" height="85" rx="12" fill="#0b1a4b"/>
      <circle cx="10" cy="13" r="1" fill="#fff"/><circle cx="88" cy="14" r="1.2" fill="#fff"/><circle cx="78" cy="32" r=".8" fill="#ffe98a"/>
      <circle cx="48" cy="45" r="31" fill="url(#kokkiOcean)" stroke="#92e8ff" strokeWidth="1.5"/>
      <path d="M26 34Q37 25 47 31T58 39Q52 48 42 48T28 43Z M54 50Q66 45 75 54Q70 67 57 67Q50 61 54 50Z" fill="#73c85e" stroke="#439c54" strokeWidth="1"/>
      <path d="M18 46Q48 62 79 46M48 14V76" fill="none" stroke="#c7f3ff" strokeWidth=".8" opacity=".65"/>
      <g transform="translate(67 13) rotate(8)"><path d="M0 0v22" stroke="#f7cf6b" strokeWidth="1.5"/><path d="M1 2h21v13H1Z" fill="#fff"/><path d="M1 2h21v4H1z" fill="#e94152"/><path d="M1 11h21v4H1z" fill="#3f67c6"/><circle cx="8" cy="8.5" r="2" fill="#fff"/></g>
      <path d="M13 68q8-8 16 0" fill="none" stroke="#ffd44e" strokeWidth="2" strokeLinecap="round"/><path d="M20 61l1.7 4.8 5.1.1-4.1 3 1.5 4.8-4.2-2.8-4.2 2.8 1.5-4.8-4.1-3 5.1-.1z" fill="#ffe166"/>
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
  g_donguri: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" fill="#7FD0F2" rx="8"/>
      <circle cx="24" cy="24" r="14" fill="#FFE066" opacity="0.95"/>
      <ellipse cx="46" cy="66" rx="30" ry="22" fill="#3f9e2c" opacity="0.55"/>
      <ellipse cx="150" cy="60" rx="34" ry="24" fill="#3f9e2c" opacity="0.55"/>
      <rect x="0" y="96" width="86" height="44" fill="#9a6a34"/>
      <rect x="0" y="96" width="86" height="10" fill="#5fbe3a"/>
      <rect x="120" y="88" width="80" height="52" fill="#9a6a34"/>
      <rect x="120" y="88" width="80" height="10" fill="#5fbe3a"/>
      <rect x="86" y="126" width="34" height="14" fill="#2f9fe0"/>
      <rect x="86" y="126" width="34" height="4" fill="#dff4ff"/>
      <ellipse cx="34" cy="84" rx="11" ry="10" fill="#b08a5a"/>
      <circle cx="34" cy="74" r="8" fill="#b08a5a"/>
      <path d="M24 78 L16 70 M27 71 L21 61 M34 68 L34 57 M41 71 L47 61 M44 78 L52 70"
            stroke="#6a4a28" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="31" cy="73" r="1.8" fill="#241a14"/>
      <circle cx="37" cy="73" r="1.8" fill="#241a14"/>
      <ellipse cx="72" cy="58" rx="7" ry="8" fill="#d8a24a"/>
      <rect x="65" y="48" width="14" height="6" rx="2" fill="#7a5020"/>
      <ellipse cx="150" cy="74" rx="13" ry="12" fill="#6b4a9c"/>
      <circle cx="145" cy="70" r="3" fill="#ffe14a"/>
      <circle cx="155" cy="70" r="3" fill="#ffe14a"/>
      <polygon points="176,60 180,50 184,60 194,64 184,68 180,78 176,68 166,64"
               fill="#ffe14a" opacity="0.95"/>
    </svg>
  ),
  g_mori: (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="moriSky5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#62C8EE"/>
          <stop offset="100%" stopColor="#BFEAFF"/>
        </linearGradient>
        <linearGradient id="moriBeam5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF7A8" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#FFD84A" stopOpacity="0.9"/>
        </linearGradient>
      </defs>
      <rect width="200" height="140" rx="8" fill="url(#moriSky5)"/>
      <path d="M0 76 Q40 58 83 70 Q126 52 200 72 L200 140 L0 140 Z" fill="#67D743"/>
      <path d="M0 104 Q45 89 92 100 Q142 110 200 88 L200 140 L0 140 Z" fill="#49B835" opacity=".72"/>
      <path d="M14 111 Q58 91 102 99 Q146 107 190 88" fill="none" stroke="#D8C9A0" strokeWidth="14" strokeLinecap="round" opacity=".9"/>
      <g opacity=".96">
        <rect x="22" y="49" width="8" height="35" rx="3" fill="#976A32"/>
        <polygon points="26,17 5,57 47,57" fill="#3F9E3B"/>
        <polygon points="26,29 8,66 44,66" fill="#53B94B"/>
        <rect x="166" y="48" width="8" height="37" rx="3" fill="#8D6130"/>
        <polygon points="170,15 147,58 193,58" fill="#3A9638"/>
        <polygon points="170,29 151,68 189,68" fill="#55BD4E"/>
      </g>
      <path d="M149 16 L160 16 L169 93 L140 93 Z" fill="url(#moriBeam5)" opacity=".82"/>
      <ellipse cx="83" cy="119" rx="18" ry="5" fill="#335127" opacity=".18"/>
      <g transform="translate(83 93)">
        <ellipse cx="0" cy="19" rx="13" ry="17" fill="#D99A43"/>
        <circle cx="0" cy="2" r="15" fill="#E9AE55"/>
        <polygon points="-13,-7 -18,-19 -5,-12" fill="#E9AE55"/>
        <polygon points="13,-7 18,-19 5,-12" fill="#E9AE55"/>
        <ellipse cx="0" cy="8" rx="8" ry="6" fill="#F3D19A"/>
        <circle cx="-5" cy="1" r="2" fill="#3B2A20"/>
        <circle cx="5" cy="1" r="2" fill="#3B2A20"/>
        <circle cx="0" cy="7" r="2" fill="#593D28"/>
        <rect x="-12" y="13" width="24" height="4" rx="2" fill="#39A5A2"/>
      </g>
      <g transform="translate(139 81)">
        <circle cx="0" cy="0" r="13" fill="#7458B8"/>
        <polygon points="-10,-7 -15,-16 -5,-12" fill="#8B6BD6"/>
        <polygon points="10,-7 15,-16 5,-12" fill="#8B6BD6"/>
        <circle cx="-4" cy="-1" r="2.3" fill="#FFF6E2"/>
        <circle cx="4" cy="-1" r="2.3" fill="#FFF6E2"/>
        <circle cx="-4" cy="0" r="1" fill="#392D50"/>
        <circle cx="4" cy="0" r="1" fill="#392D50"/>
      </g>
      <g transform="translate(111 86) rotate(-18)">
        <ellipse cx="0" cy="0" rx="5" ry="7" fill="#9A632C"/>
        <rect x="-4" y="-7" width="8" height="3" rx="1.5" fill="#5E8C35"/>
      </g>
      <g transform="translate(52 98) scale(.72)">
        <circle cx="0" cy="0" r="12" fill="#F0C484"/>
        <polygon points="-10,-5 -13,-15 -4,-10" fill="#F0C484"/>
        <polygon points="10,-5 13,-15 4,-10" fill="#F0C484"/>
        <circle cx="-4" cy="-1" r="1.8" fill="#4A3B32"/>
        <circle cx="4" cy="-1" r="1.8" fill="#4A3B32"/>
      </g>
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
      <defs><linearGradient id="nekoSky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8edfff"/><stop offset="1" stopColor="#fff2bd"/></linearGradient></defs>
      <rect width="100" height="85" rx="12" fill="url(#nekoSky)"/>
      <path d="M0 58 C19 48 31 56 47 53 C67 48 82 54 100 45 V85 H0Z" fill="#86ca70"/>
      <path d="M0 70 C22 60 39 73 59 64 C76 57 88 62 100 58 V85 H0Z" fill="#59ab64"/>
      <g fill="#fff7c9"><circle cx="17" cy="22" r="2"/><circle cx="37" cy="13" r="1.4"/><circle cx="83" cy="18" r="2.1"/></g>
      <g transform="translate(76 22)"><ellipse cx="-4" cy="-3" rx="6" ry="7" fill="#ff83b1" stroke="#c8507c" strokeWidth="1"/><ellipse cx="4" cy="-3" rx="6" ry="7" fill="#ffd257" stroke="#ca962e" strokeWidth="1"/><ellipse cx="-3" cy="5" rx="4" ry="5" fill="#ffb7d0"/><ellipse cx="3" cy="5" rx="4" ry="5" fill="#ffec9d"/><rect x="-1" y="-7" width="2" height="14" rx="1" fill="#553b48"/></g>
      <g transform="translate(55 34) scale(.72)"><ellipse cx="-4" cy="-3" rx="6" ry="7" fill="#9bc8ff" stroke="#527cc7" strokeWidth="1"/><ellipse cx="4" cy="-3" rx="6" ry="7" fill="#bda3ff" stroke="#765bc5" strokeWidth="1"/><ellipse cx="-3" cy="5" rx="4" ry="5" fill="#d7e7ff"/><ellipse cx="3" cy="5" rx="4" ry="5" fill="#e0d6ff"/><rect x="-1" y="-7" width="2" height="14" rx="1" fill="#553b48"/></g>
      <g fill="#f9e4c8" stroke="#895c40" strokeWidth="1.2"><ellipse cx="30" cy="63" rx="15" ry="11"/><circle cx="34" cy="48" r="12"/><path d="M25 42 L21 30 L32 39Z"/><path d="M41 42 L47 30 L36 39Z"/></g>
      <path d="M17 67q-11 1-8-11" fill="none" stroke="#895c40" strokeWidth="5" strokeLinecap="round"/>
      <path d="M27 52h14" stroke="#945d3c" strokeWidth="2"/><circle cx="30" cy="48" r="2" fill="#342b32"/><circle cx="38" cy="48" r="2" fill="#342b32"/><path d="M32 54l3 2 3-2" fill="none" stroke="#d76d83" strokeWidth="1.4"/>
      <g fill="#f6d347"><circle cx="9" cy="74" r="3"/><circle cx="13" cy="70" r="3"/><circle cx="17" cy="74" r="3"/><circle cx="91" cy="70" r="3"/><circle cx="95" cy="65" r="3"/></g>
    </svg>
  ),
  g_tokei: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#BFE6FA"/>
      <path d="M0 60c14-5 26-5 36-2 12 3 24 5 36 2 10-2 19-3 28-1v14a12 12 0 0 1-12 12H12A12 12 0 0 1 0 73z" fill="#8FD180"/>
      <path d="M0 68c16-4 30-3 42 1 13 4 30 4 58-2v6a12 12 0 0 1-12 12H12A12 12 0 0 1 0 73z" fill="#7BC46E"/>
      <ellipse cx="14" cy="14" rx="8.5" ry="4.4" fill="#FFFFFF" opacity=".95"/>
      <ellipse cx="20" cy="15.6" rx="5.6" ry="3.4" fill="#FFFFFF" opacity=".95"/>
      <ellipse cx="86" cy="12" rx="7.5" ry="4" fill="#FFFFFF" opacity=".88"/>
      <ellipse cx="30" cy="58" rx="7" ry="5.4" fill="#5FBF6E"/>
      <ellipse cx="83" cy="56" rx="9" ry="6.8" fill="#54B062"/>
      <circle cx="37" cy="24" r="5" fill="#F2C25A" stroke="#C98F2C" strokeWidth="1.4"/>
      <circle cx="63" cy="24" r="5" fill="#F2C25A" stroke="#C98F2C" strokeWidth="1.4"/>
      <rect x="33.5" y="58" width="5.5" height="10" rx="2.4" fill="#D19B34" transform="rotate(-17 36 63)"/>
      <rect x="61" y="58" width="5.5" height="10" rx="2.4" fill="#D19B34" transform="rotate(17 64 63)"/>
      <circle cx="50" cy="43" r="25" fill="#E0A63C"/>
      <circle cx="50" cy="43" r="22" fill="#F2C25A"/>
      <circle cx="50" cy="43" r="19" fill="#FFFBEF"/>
      <g stroke="#4A3B32" strokeWidth="2.2" strokeLinecap="round">
        <line x1="50" y1="26.5" x2="50" y2="30"/><line x1="50" y1="56" x2="50" y2="59.5"/>
        <line x1="33.5" y1="43" x2="37" y2="43"/><line x1="63" y1="43" x2="66.5" y2="43"/>
      </g>
      <g stroke="#4A3B32" strokeWidth="1.3" strokeLinecap="round" opacity=".7">
        <line x1="58.5" y1="28.7" x2="57.1" y2="31"/><line x1="64.3" y1="34.5" x2="62" y2="35.9"/>
        <line x1="64.3" y1="51.5" x2="62" y2="50.1"/><line x1="58.5" y1="57.3" x2="57.1" y2="55"/>
        <line x1="41.5" y1="57.3" x2="42.9" y2="55"/><line x1="35.7" y1="51.5" x2="38" y2="50.1"/>
        <line x1="35.7" y1="34.5" x2="38" y2="35.9"/><line x1="41.5" y1="28.7" x2="42.9" y2="31"/>
      </g>
      <text x="50" y="37" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#3A2C22">12</text>
      <text x="58.5" y="46" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#3A2C22">3</text>
      <text x="50" y="55.5" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#3A2C22">6</text>
      <text x="41.5" y="46" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#3A2C22">9</text>
      <line x1="50" y1="43" x2="50" y2="32" stroke="#D9463F" strokeWidth="2.4" strokeLinecap="round"/>
      <circle cx="50" cy="32" r="2.5" fill="#D9463F"/>
      <line x1="50" y1="43" x2="57.5" y2="48.5" stroke="#3E4A8E" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="57.5" cy="48.5" r="2.7" fill="#3E4A8E"/>
      <circle cx="50" cy="43" r="2.7" fill="#F2C25A" stroke="#C98F2C" strokeWidth="1"/>
      <path d="M13.4 67L11.2 55.6l9.4 5.2z" fill="#F7C5A0"/>
      <path d="M26.6 67l2.2-11.4-9.4 5.2z" fill="#F7C5A0"/>
      <path d="M14.4 65.2l-1.3-6.7 5.6 3.1z" fill="#FF9BB5"/>
      <path d="M25.6 65.2l1.3-6.7-5.6 3.1z" fill="#FF9BB5"/>
      <circle cx="20" cy="70.5" r="8.6" fill="#F7C5A0"/>
      <ellipse cx="20" cy="73.6" rx="4.4" ry="3.1" fill="#FFF0E2"/>
      <circle cx="16.7" cy="68.9" r="1.55" fill="#2A2028"/>
      <circle cx="23.3" cy="68.9" r="1.55" fill="#2A2028"/>
      <circle cx="17.3" cy="68.3" r=".55" fill="#FFFFFF"/>
      <circle cx="23.9" cy="68.3" r=".55" fill="#FFFFFF"/>
      <ellipse cx="20" cy="71.9" rx="1.4" ry="1" fill="#5A4038"/>
      <path d="M85 60.5l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6z" fill="#FFE566" stroke="#E8A33D" strokeWidth="1.1"/>
    </svg>
  ),
  g_katakana: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#7FC7E8"/>
      <circle cx="84" cy="14" r="8" fill="#FFF3B0" opacity=".8"/>
      <path d="M0 58c10-5 20-5 30 0s20 5 30 0 20-5 40 0v27H0z" fill="#4FA8D8"/>
      <ellipse cx="14" cy="52" rx="16" ry="12" fill="#8FC46E" stroke="#5C8A3E" strokeWidth="2"/>
      <ellipse cx="90" cy="56" rx="14" ry="11" fill="#8FC46E" stroke="#5C8A3E" strokeWidth="2"/>
      <path d="M22 50h58" stroke="#B08A5A" strokeWidth="5" strokeLinecap="round"/>
      <rect x="24" y="43" width="5" height="14" rx="1.5" fill="#C79A46" stroke="#8A6A3A" strokeWidth="1.4"/>
      <rect x="34" y="43" width="5" height="14" rx="1.5" fill="#C79A46" stroke="#8A6A3A" strokeWidth="1.4"/>
      <rect x="44" y="43" width="5" height="14" rx="1.5" fill="#C79A46" stroke="#8A6A3A" strokeWidth="1.4"/>
      <rect x="54" y="43" width="5" height="14" rx="1.5" fill="#C79A46" stroke="#8A6A3A" strokeWidth="1.4"/>
      <rect x="64" y="43" width="5" height="14" rx="1.5" fill="#C79A46" stroke="#8A6A3A" strokeWidth="1.4"/>
      <rect x="74" y="43" width="5" height="14" rx="1.5" fill="#C79A46" stroke="#8A6A3A" strokeWidth="1.4"/>
      <circle cx="14" cy="44" r="6.5" fill="#FFE9A8" stroke="#C79A46" strokeWidth="1.6"/>
      <text x="14" y="47.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#8A6A3A">ネコ</text>
      <circle cx="90" cy="48" r="6.5" fill="#FFE9A8" stroke="#C79A46" strokeWidth="1.6" opacity=".85"/>
      <text x="90" y="51.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#8A6A3A" opacity=".85">コマ</text>
      <path d="M19 22l1.5 3.6 3.6 1.5-3.6 1.5L19 32.2l-1.5-3.6L13.9 27l3.6-1.5z" fill="#FFE066"/>
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
      <rect width="100" height="85" rx="12" fill="#E9BE86"/>
      <rect x="8" y="14" width="84" height="42" rx="7" fill="#F3DCB6" stroke="#C9782B" strokeWidth="2.5"/>
      <rect x="4" y="10" width="92" height="10" rx="4" fill="#C9782B"/>
      <circle cx="26" cy="35" r="10" fill="#FF6B6B" stroke="#C94A4A" strokeWidth="2"/>
      <path d="M50 25 L58.5 41 L41.5 41 Z" fill="#5AA9E6" stroke="#3B7FB5" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="66" y="26" width="18" height="18" rx="3" fill="#FFC84D" stroke="#D69B21" strokeWidth="2"/>
      <path d="M18 68l2 4.4 4.8.7-3.5 3.4.8 4.8-4.1-2.2-4.1 2.2.8-4.8-3.5-3.4 4.8-.7z" fill="#5BC98C" stroke="#3D9E68" strokeWidth="1.6"/>
      <circle cx="50" cy="72" r="9" fill="#A98CE0" stroke="#7D63B5" strokeWidth="2"/>
      <path d="M78 62l3.5 7.2 8 1.1-5.8 5.6 1.4 7.9-6.8-3.6-6.8 3.6 1.4-7.9-5.8-5.6 8-1.1z" fill="#FF8FC6" stroke="#DB6BA3" strokeWidth="1.6"/>
    </svg>
  ),
};

/* ════════════════════════════════════════════════════
   ① 更新日時（手動で更新する定数）
════════════════════════════════════════════════════ */
const LAST_UPDATE_DATE = '2026-08-10';

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
/* ════════════════════════════════════════════════════
   ゲームリスト（ja / en 両対応）
════════════════════════════════════════════════════ */
const GAMES = [
  { id:'g1', route:'/shabondama',      icon:'🫧', num:1, color:'#4DB8FF', stars:5, isNew:true, category:'アクション',
    ja:{ name:'シャボンだまポン',   desc:'にじいろの あわを\nタップして ポン！'          },
    en:{ name:'Bubble Pop',           desc:'Pop rainbow bubbles\nin a 3D world!'         },
    zh:{ name:'泡泡消消乐',           desc:'点击彩虹泡泡\n畅玩3D世界！'                 },
    ko:{ name:'비눗방울 팡',           desc:'무지개 거품을\n탭해서 팡!'                  },
    es:{ name:'Burbuja Pop',           desc:'¡Revienta burbujas\nde arcoíris en 3D!'     } },
  { id:'g2', route:'/kudamono-catch',  icon:'🍎', num:2, color:'#FF6B35', stars:5, isNew:true, category:'アクション',
    ja:{ name:'くだものキャッチ',   desc:'3Dの かじゅえんで\nくだものを キャッチ！'      },
    en:{ name:'Fruit Catch 3D',       desc:'Catch fruits falling\nin a 3D orchard!'       },
    zh:{ name:'3D接水果',             desc:'在3D果园里\n接住掉落的水果！'                 },
    ko:{ name:'3D 과일 캐치',          desc:'3D 과수원에서\n과일을 잡아요!'               },
    es:{ name:'Atrapa Frutas 3D',     desc:'¡Atrapa las frutas\nen un huerto 3D!'         } },
  { id:'g4', route:'/doubutsu-puzzle', icon:'🃏', num:4, color:'#2ECC71', stars:5, isNew:true, category:'パズル',
    ja:{ name:'どうぶつパズル',     desc:'カードをめくって\nおなじどうぶつさがし！'       },
    en:{ name:'Animal Memory Match',  desc:'Flip cards and find\nmatching animals!'        },
    zh:{ name:'动物翻牌',             desc:'翻开卡片\n找出相同的动物！'                   },
    ko:{ name:'동물 퍼즐',             desc:'카드를 뒤집어\n같은 동물을 찾아요!'           },
    es:{ name:'Puzzle Animal',         desc:'¡Voltea cartas y busca\nanimales iguales!'    } },
  { id:'g5', route:'/kazu-asobi',      icon:'🔢', num:5, color:'#F4D03F', stars:3, isNew:true, category:'かずあそび',
    ja:{ name:'かずあそび',         desc:'よるの おまつりで\n6つの やたいを かぞえよう！'  },
    en:{ name:'Number Fun',           desc:'Count your way through\n6 night-festival stalls!' },
    zh:{ name:'数字游戏',             desc:'在夜市祭典中\n数一数6个摊位吧！'               },
    ko:{ name:'숫자 놀이',             desc:'밤 축제에서\n6개 포장마차를 세어봐요!'         },
    es:{ name:'Juego de Números',      desc:'¡Cuenta en 6 puestos\nde un festival nocturno!' } },
  { id:'g6', route:'/animal-soccer',   icon:'⚽', num:6, color:'#00BCD4', stars:5, isNew:false, category:'アクション',
    ja:{ name:'どうぶつサッカー',   desc:'3たい3+GKの\n3Dサッカー！'                    },
    en:{ name:'Animal Soccer',        desc:'3v3 + GK\n3D soccer!'                         },
    zh:{ name:'动物足球',             desc:'3对3加守门员\n3D足球！'                       },
    ko:{ name:'동물 축구',             desc:'3대3+골키퍼\n3D 축구!'                        },
    es:{ name:'Fútbol Animal',         desc:'Fútbol 3D\n3 contra 3 + portero!'            } },
  { id:'g8', route:'/sushi',           icon:'🍣', num:8, color:'#FF5722', stars:5, isNew:false, category:'アクション',
    ja:{ name:'さーもん かいてんずし', desc:'ちゅうもんに あわせて\n3Dのおすしを\nタップしよう！' },
    en:{ name:'Salmon Sushi Shop',      desc:'Serve each order\nfrom the 3D sushi belt!' },
    zh:{ name:'三文鱼回转寿司店',         desc:'按照订单\n点击3D回转寿司！' },
    ko:{ name:'연어 회전초밥집',          desc:'주문에 맞춰\n3D 초밥을 터치해요!' },
    es:{ name:'Sushi de Salmón 3D',     desc:'¡Sirve cada pedido\nde la cinta 3D!' } },
  { id:'g9', route:'/ichigo',          icon:'🍓', num:9, color:'#E91E63', stars:5, isNew:true, category:'そうぞう',
    ja:{ name:'いちごのおか',       desc:'そだてて しゅうかく！\n3Dいちごのうえん'       },
    en:{ name:'Strawberry Hill',      desc:'Grow and harvest\nin a 3D berry farm!'        },
    zh:{ name:'草莓山丘',             desc:'种植与收获！\n3D草莓农场'                     },
    ko:{ name:'딸기 언덕',             desc:'키우고 수확해요!\n3D 딸기 농장'               },
    es:{ name:'Colina de Fresas',      desc:'¡Cultiva y cosecha\nen la granja 3D!'         } },
  { id:'g10', route:'/kakurenbo',      icon:'🔍', num:10, color:'#2d6a4f', stars:5, isNew:true, category:'パズル',
    ja:{ name:'どうぶつかくれんぼ3D', desc:'3Dのしまをまわしてさがそう！\n2つのあそびと8ステージ' },
    en:{ name:'Animal Hide & Seek 3D',   desc:'Spin the 3D island and explore!\n2 modes, 8 stages, pick a partner'      },
    zh:{ name:'动物捉迷藏3D',           desc:'转动3D小岛来探索吧！\n2种玩法，8个关卡，可选搭档'                    },
    ko:{ name:'동물 숨바꼭질 3D',         desc:'3D 섬을 돌려가며 찾아봐요!\n2가지 모드, 8스테이지, 파트너 선택'              },
    es:{ name:'Escondite Animal 3D',        desc:'¡Gira la isla 3D y explora!\n2 modos, 8 niveles, elige compañero'         } },
  { id:'g11', route:'/moji',           icon:'🔤', num:11, color:'#4CAF50', stars:3, isNew:false, category:'がくしゅう',
    ja:{ name:'もじのもり3D',         desc:'3Dのもりで もじをあつめて\nことばを つくろう！'        },
    en:{ name:'Letter Forest 3D',    desc:'Collect letters in a 3D forest\nand build words!' },
    zh:{ name:'文字森林3D',           desc:'在3D森林中收集文字，\n拼出单词！'                    },
    ko:{ name:'글자의 숲 3D',         desc:'3D 숲에서 글자를 모아\n단어를 만들어요!'               },
    es:{ name:'Bosque de Letras 3D',  desc:'¡Recoge letras en un bosque 3D\ny forma palabras!'            } },
  { id:'g12', route:'/tashizan',       icon:'🚂', num:12, color:'#2196F3', stars:5, isNew:true, category:'かずあそび',
    ja:{ name:'たしざんトレイン3D', desc:'どうぶつを かぞえて\nきしゃを はっしゃ！\n3ろせん・24のえき'          },
    en:{ name:'Addition Train 3D',   desc:'Count animals and\nsend off the train!\n3 routes, 24 stations'        },
    zh:{ name:'加法列车3D',           desc:'数一数动物，\n发车出发！\n3条路线・24个车站'                             },
    ko:{ name:'덧셈 기차 3D',          desc:'동물을 세어\n기차를 출발시켜요!\n3개 노선・24개 역'                    },
    es:{ name:'Tren de Sumas 3D',     desc:'¡Cuenta animales y\nhaz partir el tren!\n3 rutas, 24 estaciones'       } },
  { id:'g13', route:'/iro',            icon:'🎨', num:13, color:'#7E57C2', stars:5, isNew:true, category:'パズル',
    ja:{ name:'いろまぜこうぼう3D', desc:'そらの アトリエで えのぐを まぜて\nいろの せいれいを あつめよう！' },
    en:{ name:'Color Mixing Workshop 3D', desc:'Mix paints in a sky atelier and\ncollect 24 color spirits!' },
    zh:{ name:'调色工坊3D',           desc:'在天空工坊调颜料，\n收集24个颜色精灵！' },
    ko:{ name:'색섞기 공방 3D',        desc:'하늘 아틀리에에서 물감을 섞어\n색의 정령을 모아요!' },
    es:{ name:'Taller de Colores 3D',  desc:'¡Mezcla pinturas en el taller\ny colecciona espíritus de color!' } },
  { id:'g_mura', route:'/mura', icon:'🏡', num:21, color:'#6bb04a', stars:5, isNew:true, category:'そうぞう',
    ja:{ name:'どうぶつのむら',   desc:'やさいをそだてて りょうり！\nどうぶつに とどけよう！' },
    en:{ name:'Animal Village',   desc:'Grow veggies, cook meals,\nand deliver to animals!' },
    zh:{ name:'动物村庄',          desc:'种蔬菜做料理，\n送给小动物们！' },
    ko:{ name:'동물 마을',        desc:'채소를 키워 요리하고\n동물에게 배달해요!' },
    es:{ name:'Aldea Animal',     desc:'¡Cultiva, cocina y\nreparte a los animales!' } },
  { id:'g14', route:'/machi',          icon:'🏙️', num:14, color:'#00897B', stars:5, isNew:true, category:'そうぞう',
    ja:{ name:'わくわくまちづくり', desc:'3Dの しまを あるいて\nどうぶつと まちを つくろう！' },
    en:{ name:'Dream Island Town',   desc:'Explore a 3D island and\nbuild a town with animals!' },
    zh:{ name:'梦幻岛小镇',           desc:'漫步3D小岛，\n和动物一起建造小镇！'             },
    ko:{ name:'꿈의 섬 마을',          desc:'3D 섬을 걸으며\n동물과 마을을 만들어요!'         },
    es:{ name:'Pueblo Isla Soñada',  desc:'¡Recorre la isla 3D y\nconstruye con los animales!' } },
  { id:'g15', route:'/kokki', icon:'🌍', num:15, color:'#0d47a1', stars:5, isNew:true, category:'がくしゅう',
    ja:{ name:'こっきクイズ',    desc:'3Dちきゅうを まわして\n51かこくを たんけんしよう！'       },
    en:{ name:'Flag World Explorer', desc:'Spin a 3D globe and\nexplore 51 country flags!' },
    zh:{ name:'国旗世界探险',      desc:'转动3D地球，\n探索51个国家的国旗！' },
    ko:{ name:'국기 세계 탐험',    desc:'3D 지구본을 돌리며\n51개 나라 국기를 탐험해요!' },
    es:{ name:'Explora Banderas',  desc:'¡Gira el globo 3D y\nexplora 51 banderas!' } },
  { id:'g16', route:'/jewelry-master', icon:'💍', num:16, color:'#7b1fa2', stars:4, isNew:false, category:'そうぞう',
    ja:{ name:'ジュエリーマスター', desc:'げんせきを みがいて\nアクセサリーを つくり\nおみせを けいえい！'      },
    en:{ name:'Jewelry Master',    desc:'Polish gems, craft\naccessories, and run\nyour own shop!'        },
    zh:{ name:'珠宝大师',           desc:'打磨原石、制作饰品\n经营你自己的\n珠宝店！'                      },
    ko:{ name:'주얼리 마스터',       desc:'원석을 다듬어\n액세서리를 만들고\n가게를 운영해요！'               },
    es:{ name:'Maestro Joyero',    desc:'¡Pule gemas, crea\naccesorios y dirige\ntu propia joyería!'           } },
  { id:'g_nurie', route:'/nurie', icon:'🖍️', num:17, color:'#FF8A65', stars:5, isNew:true, category:'そうぞう',
    ja:{ name:'ぬりえ・おえかき', desc:'ぬって かいて、じぶんの\nキャラや おえかきが うごきだす！' },
    en:{ name:'Coloring & Drawing', desc:'Draw, color and bring\nyour creations to life!' },
    zh:{ name:'涂色和画画',         desc:'涂色、画画，让自己的\n角色和作品动起来！' },
    ko:{ name:'색칠·그림 그리기',   desc:'색칠하고 그리고, 내\n캐릭터와 그림을 움직여요!' },
    es:{ name:'Colorear y Dibujar', desc:'¡Colorea, dibuja y da\nvida a tus personajes!' } },
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
    ja:{ name:'どうぶつターゲット', desc:'うごくどうぶつを\nタップでみつけよう！\nフェイクに注意！' },
    en:{ name:'Animal Target',   desc:'Tap moving animals\nto score points!\nWatch for fakes!' },
    zh:{ name:'动物目标',       desc:'点击移动动物\n积累分数！'                              },
    ko:{ name:'동물 타깃',     desc:'움직이는 동물을\n탭해서 맞혀요!'                      },
    es:{ name:'Objetivo Animal',    desc:'¡Toca animales\nen movimiento!'                        } },
  { id:'g_donguri', route:'/donguri', icon:'🌰', num:25, color:'#b0722e', stars:5, isNew:true, category:'アクション',
    ja:{ name:'どんぐりだいさくせん', desc:'どんぐりをころがして\nなかまをたすけよう！' },
    en:{ name:'Acorn Rescue',       desc:'Roll acorns and\nrescue your friends!' },
    zh:{ name:'橡果大作战',           desc:'滚动橡果\n拯救伙伴们！' },
    ko:{ name:'도토리 대작전',        desc:'도토리를 굴려서\n친구들을 구하자!' },
    es:{ name:'Rescate de Bellotas', desc:'¡Rueda bellotas y\nrescata a tus amigos!' } },
  { id:'g_mori', route:'/mori', icon:'🌲', num:6, color:'#2e7d32', stars:4, isNew:false, category:'アクション',
    ja:{ name:'もりのなかまたち', desc:'3Dのしまをたんけん！\nどんぐりでなかまをたすけよう！' },
    en:{ name:'Forest Friends',  desc:'Explore a 3D forest island\nand rescue animal friends!' },
    zh:{ name:'森林伙伴',         desc:'探索3D森林小岛\n救出动物伙伴！' },
    ko:{ name:'숲속 친구들',       desc:'3D 숲섬을 탐험하고\n동물 친구들을 구해요!' },
    es:{ name:'Amigos del Bosque',desc:'¡Explora una isla 3D\ny rescata a tus amigos!' } },
  { id:'g_sora', route:'/sora', icon:'👸', num:7, color:'#7b1fa2', stars:4, isNew:true, category:'アクション',
    ja:{ name:'そらとびプリンセス3D', desc:'4にんからなかまをえらんで\n5つの空とボスにいどもう！' },
    en:{ name:'Sky Princess 3D',    desc:'Pick from 4 characters and\nchallenge 5 skies & bosses!' },
    zh:{ name:'飞天公主3D',         desc:'从4名伙伴中选择\n挑战5个天空与首领！' },
    ko:{ name:'하늘나는 공주 3D',     desc:'4명 중 캐릭터를 골라\n5개의 하늘과 보스에 도전!' },
    es:{ name:'Princesa del Cielo 3D',desc:'¡Elige entre 4 personajes\ny desafía 5 cielos y jefes!' } },
  { id:'g_bike', route:'/bike', icon:'🏍️', num:8, color:'#f57c00', stars:4, isNew:true, category:'レース',
    ja:{ name:'わくわくバイク GP', desc:'8キャラからライダーをえらび\n4台で3コースの3D GP！' },
    en:{ name:'Wakuwaku Bike GP',  desc:'Pick 1 of 8 riders and race\n4 bikes across 3D courses!' },
    zh:{ name:'嗡嗡摩托 GP',        desc:'从8位车手中选择\n4辆摩托挑战3条3D赛道！' },
    ko:{ name:'두근두근 바이크 GP',  desc:'8명 중 라이더를 골라\n4대가 3개 3D 코스 대결!' },
    es:{ name:'Moto Wakuwaku GP',  desc:'¡Elige 1 de 8 pilotos!\n4 motos, 3 circuitos 3D.' } },
  { id:'g_kart', route:'/kart', icon:'🏎️', num:9, color:'#e53935', stars:3, isNew:true, category:'レース',
    ja:{ name:'アニマルカートGP', desc:'6ひきからキャラをえらんで\nほしで とくしゅをためる3Dレース！' },
    en:{ name:'Animal Kart GP',  desc:'Choose 1 of 6 racers!\nCollect stars for special skills in 3D!' },
    zh:{ name:'动物卡丁车GP',     desc:'从6位赛车手中选择\n收集星星发动专属技能！' },
    ko:{ name:'애니멀 카트 GP',   desc:'6명 중 캐릭터를 골라\n별로 특수 기술을 쓰는 3D 레이스!' },
    es:{ name:'Kart de Animales GP', desc:'¡Elige 1 de 6 pilotos!\nJunta estrellas y usa habilidades en 3D!' } },
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
    ja:{ name:'まほうのめいろ', desc:'かわいいどうぶつと進む\n3Dめいろぼうけん！' },
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
  { id:'g_neko', route:'/neko-chou', icon:'🐱', num:13, color:'#62ad72', stars:5, isNew:true, category:'アクション',
    ja:{ name:'ねことちょうちょ 〜ひみつの花園〜', desc:'そーっと ちかづいて\nちょうちょと なかよし！' },
    en:{ name:'Cat & Butterflies: Secret Garden', desc:'Walk gently in a 3D garden\nand befriend butterflies!' },
    zh:{ name:'猫咪与蝴蝶：秘密花园', desc:'在3D花园里轻轻靠近\n和蝴蝶交朋友！' },
    ko:{ name:'고양이와 나비: 비밀의 정원', desc:'3D 정원에서 살며시 다가가\n나비와 친구가 되어요!' },
    es:{ name:'Gato y Mariposas: Jardín Secreto', desc:'Acércate con cuidado\ny haz amistad con mariposas.' } },
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
    ja:{ name:'おたからほりほり', desc:'おたから ぜんぶ？ キツネ ぜんぶ？\nどちらでも クリアの 3Dアクション' },
    en:{ name:'Treasure Digger',   desc:'Collect every gem or bury every fox\ntwo ways to win!' },
    zh:{ name:'挖挖小宝藏',        desc:'集齐宝藏，或把狐狸全埋掉，\n两种通关方式！' },
    ko:{ name:'보물 파기',          desc:'보물을 모두 모으거나 여우를 모두 묻거나\n클리어 방법은 두 가지!' },
    es:{ name:'Cava Tesoros',      desc:'Reúne las gemas o entierra los zorros:\n¡dos formas de ganar!' } },
  { id:'g_okashi', route:'/okashi-crossing', icon:'🍭', num:16, color:'#ff9ecb', stars:4, isNew:true, category:'アクション',
    ja:{ name:'ぴょんぴょん！おかしのくに', desc:'グミのくるまとチョコのかわ！\nどこまでもすすもう！' },
    en:{ name:'Hop-Hop Sweets World', desc:'Cross gummy roads and\nchocolate rivers—go far!' },
    zh:{ name:'蹦蹦跳跳甜点王国',     desc:'越过软糖车和巧克力河，\n看你能走多远！' },
    ko:{ name:'깡충깡충 과자나라',    desc:'젤리 자동차와 초콜릿 강을\n건너 멀리 가보자!' },
    es:{ name:'Saltitos por Dulcelandia', desc:'¡Cruza autos de gomita y\nríos de chocolate!' } },
  { id:'g_tokei', route:'/tokei-yomi', icon:'🕐', num:14, color:'#F2C25A', stars:3, isNew:true, category:'がくしゅう',
    ja:{ name:'とけいよみ',         desc:'あいぼうと いちにちを ぼうけん！\nとけいを よんで すすもう！' },
    en:{ name:'Clock Reading',      desc:'A day-long adventure!\nRead the clock to move on!' },
    zh:{ name:'认识时钟',           desc:'和伙伴一起冒险一整天！\n读懂时钟继续前进！' },
    ko:{ name:'시계 읽기',          desc:'친구와 하루를 모험!\n시계를 읽고 나아가요!' },
    es:{ name:'Lectura del Reloj',  desc:'¡Una aventura de todo el día!\n¡Lee el reloj y avanza!' } },
  { id:'g_katakana', route:'/katakana-asobi', icon:'🔤', num:15, color:'#29B6F6', stars:3, isNew:true, category:'がくしゅう',
    ja:{ name:'しりとりブリッジ3D',     desc:'ことばを つないで\nはしを わたろう！' },
    en:{ name:'Shiritori Bridge 3D',    desc:'Chain words together\nand cross the bridge!' },
    zh:{ name:'接龙桥3D',               desc:'接龙连接单词，\n跨过大桥！' },
    ko:{ name:'끝말잇기 다리 3D',        desc:'단어를 이어서\n다리를 건너요!' },
    es:{ name:'Puente de Palabras 3D',  desc:'¡Encadena palabras\ny cruza el puente!' } },
  { id:'g_katachi', route:'/katachi', icon:'🔷', num:21, color:'#C9782B', stars:5, isNew:true, category:'がくしゅう',
    ja:{ name:'かたちあわせ',       desc:'おもちゃこうじょうで\nかたちを はめよう！' },
    en:{ name:'Shape Workshop',     desc:'Fit, sort & match shapes\nin a toy factory!' },
    zh:{ name:'形状工坊',           desc:'在玩具工厂里\n拼合、分类形状！' },
    ko:{ name:'모양 공방',          desc:'장난감 공장에서\n모양을 맞춰봐요!' },
    es:{ name:'Taller de Formas',   desc:'¡Encaja y clasifica formas\nen una fábrica de juguetes!' } },
  { id:'g_nijiiro', route:'/nijiiro-oukoku', icon:'🌈', num:24, color:'#F2C14E', stars:5, isNew:true, category:'ぼうけん',
    ja:{ name:'にじいろおうこく', desc:'きもちを みて えらぼう！\nどうぶつと なかよしRPG' },
    en:{ name:'Rainbow Kingdom',  desc:'Guess their feelings and\nbefriend every animal!' },
    zh:{ name:'彩虹王国',         desc:'猜中心情，\n和动物们成为好朋友！' },
    ko:{ name:'무지개 왕국',       desc:'기분을 맞혀서\n동물들과 친구가 되자!' },
    es:{ name:'Reino Arcoíris',   desc:'¡Adivina sus emociones\ny hazte amigo de todos!' } },
];

/* ── 全ゲーム統合。hard は既存の年齢フィルター分類にだけ使う。 ── */
const ALL_SHELF_GAMES = [
  ...GAMES,
  ...SCHOOL_GAMES.map(g => ({ ...g, hard: true })),
];
const TOTAL_GAME_COUNT = Object.keys(GAME_META).length;
/* ── 棚グループ定義(6棚)。アクションはゲーム性で2分割 ── */
const SHELF_SHOOT_JUMP = ['s3','s4','g_sora','g_mori','g_block','g_donguri']; // ねらう・とぶ系
const SHELF_GROUPS = [
  { key:'asobu',    icon:'⚡', match:g => g.category==='アクション' && !SHELF_SHOOT_JUMP.includes(g.id),
    label:{ja:'あそぶ',       en:'Play',        zh:'玩耍',   ko:'놀기',       es:'Jugar'    } },
  { key:'nerau',    icon:'🎯', match:g => SHELF_SHOOT_JUMP.includes(g.id),
    label:{ja:'ねらう・とぶ', en:'Aim & Jump',  zh:'瞄准・跳跃', ko:'조준・점프', es:'Apunta y salta' } },
  { key:'race',     icon:'🏁', match:g => g.category==='レース',
    label:{ja:'レース',       en:'Racing',      zh:'赛车',   ko:'레이싱',     es:'Carreras' } },
  { key:'kangaeru', icon:'🧩', match:g => ['パズル','かずあそび','もじあそび','クイズ','ぼうけん'].includes(g.category),
    label:{ja:'かんがえる',   en:'Think',       zh:'思考',   ko:'생각하기',   es:'Pensar'   } },
  { key:'tsukuru',  icon:'🎨', match:g => g.category==='そうぞう',
    label:{ja:'つくる',       en:'Create',      zh:'创造',   ko:'만들기',     es:'Crear'    } },
  { key:'manabu',   icon:'📚', match:g => g.category==='がくしゅう',
    label:{ja:'まなぶ',       en:'Learn',       zh:'学习',   ko:'배우기',     es:'Aprender' } },
];

/* フィルターは棚定義から派生させ、分類ルールを一元化する。 */
const CATEGORY_FILTERS = [
  { key:'all', icon:'🎮', match:() => true,
    label:{ja:'ぜんぶ', en:'All', zh:'全部', ko:'전체', es:'Todos'} },
  ...SHELF_GROUPS,
  { key:'adventure', icon:'🌈', match:g => g.category === 'ぼうけん',
    label:{ja:'ぼうけん', en:'Adventure', zh:'冒险', ko:'모험', es:'Aventura'} },
];

/* Fisher-Yates。呼び出し側で「マウント時に1回だけ」呼ぶことで、以降の再レンダーでは
   同じ配列を再利用し、順番を固定する。 */
function shuffleOnce(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/* ジャンル棚専用: マウント時に決めたroute順(shelfOrderRef)でitemsを並べ替える。
   フィルターで一部のゲームが除外されても、残ったゲーム同士の相対順はぶれない。 */
function sortShelfItemsByOrder(items, order) {
  const ranks = new Map((order || []).map((route, index) => [route, index]));
  return items
    .map((game, index) => ({ game, index }))
    .sort((a, b) => (ranks.has(a.game.route) ? ranks.get(a.game.route) : Number.MAX_SAFE_INTEGER)
      - (ranks.has(b.game.route) ? ranks.get(b.game.route) : Number.MAX_SAFE_INTEGER) || a.index - b.index)
    .map(entry => entry.game);
}

/* ── 年齢別の入口。年齢が重複するゲームは、遊びやすさで一つの棚に振り分ける ── */
const AGE_FILTERS = [
  { key:'all', label:{ja:'ぜんぶの年齢', en:'All ages', zh:'全部年龄', ko:'모든 연령', es:'Todas las edades'}, match:() => true },
  { key:'3-5', label:{ja:'3〜5さい', en:'Ages 3–5', zh:'3〜5岁', ko:'3〜5세', es:'3–5 años'}, match:g => {
    const meta = GAME_META[g.route];
    return meta && meta.ageMin === 3;
  } },
  { key:'6-8', label:{ja:'6〜8さい', en:'Ages 6–8', zh:'6〜8岁', ko:'6〜8세', es:'6–8 años'}, match:g => {
    const meta = GAME_META[g.route];
    return meta && meta.ageMin >= 4 && !g.hard;
  } },
  { key:'9-plus', label:{ja:'9さい〜', en:'Ages 9+', zh:'9岁以上', ko:'9세 이상', es:'9+ años'}, match:g => g.hard },
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
  '/iro',
  '/shabondama',
  '/nijiiro-oukoku',
  '/astral-fang',
  '/tashizan',
  '/neko-chou',
]);

const THUMB_ALIASES = {
  '/sora': 'sora',
  '/shooting': 'shooting',
  '/sniper': 'sniper',
};
const NO_THUMB_ROUTES = new Set([
  '/neon-drive',
  '/moji',
  '/katakana-asobi',
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
function HorizontalRail({ className, children, labels, railProps = {} }) {
  const railRef = useRef(null);
  const [edge, setEdge] = useState({ left:false, right:false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    const update = () => {
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const next = { left: rail.scrollLeft > 2, right: rail.scrollLeft < max - 2 };
      setEdge(current => current.left === next.left && current.right === next.right ? current : next);
    };
    update();
    const frame = window.requestAnimationFrame(update);
    const settleTimer = window.setTimeout(update, 100);
    rail.addEventListener('scroll', update, { passive:true });
    window.addEventListener('resize', update);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(rail);
    return () => {
      rail.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      observer?.disconnect();
    };
  }, [children]);

  const move = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.75, 180), behavior:'smooth' });
  };

  return (
    <div className="tp-horizontal-rail">
      <div ref={railRef} className={className} {...railProps}>{children}</div>
      {edge.left && <span className="tp-rail-fade tp-rail-fade--left" aria-hidden="true" />}
      {edge.right && <span className="tp-rail-fade tp-rail-fade--right" aria-hidden="true" />}
      {edge.left && <button type="button" className="tp-rail-cue tp-rail-cue--left" aria-label={labels.left} onClick={() => move(-1)}>‹</button>}
      {edge.right && <button type="button" className="tp-rail-cue tp-rail-cue--right" aria-label={labels.right} onClick={() => move(1)}>›</button>}
    </div>
  );
}

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
  const [_playCount,  setPlayCount]   = useState(0);
  const [kisekaeState,setKisekaeState]= useState(() => {
    try {
      const saved = typeof localStorage !== 'undefined' && localStorage.getItem('kisekae_state');
      return normalizeKisekaeState(saved ? JSON.parse(saved) : null);
    } catch { return normalizeKisekaeState(null); }
  });

  /* Phase4: マウント時にあそび実績(ちがうゲームを遊んだ数)を再評価し、★★★を
     sticky解放する。既存ユーザーも遡及解放。ここでは演出は出さず状態のみ同期する
     (演出はきせかえPanelを開いた時にKisekaePanel側で行う)。 */
  useEffect(() => {
    setKisekaeState(prev => {
      const { state: synced, newlyUnlocked } = syncSpecialUnlocks(prev);
      if (newlyUnlocked.length === 0) return prev;
      try { localStorage.setItem('kisekae_state', JSON.stringify(synced)); } catch { /* storage remains optional */ }
      return synced;
    });
  }, []);
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [panelChara,  setPanelChara]  = useState('princess');
  const [shopOpen,    setShopOpen]    = useState(false);
  const [coins,       setCoins]       = useState(() => typeof localStorage !== 'undefined' ? getCoins() : 0);
  const [loginBonus,  setLoginBonus]  = useState(null);
  const [recentRoutes,   _setRecentRoutes]  = useState(() => typeof localStorage !== 'undefined' ? getRecentGames() : []);
  const [catKey,  setCatKey]  = useState('all');
  const [ageKey,  setAgeKey]  = useState('all');

  /* ジャンル棚だけ「表示ごとに」ランダム化する。マウント時に1回だけ並びを決め、
     以降はフィルター切替・きせかえ開閉・BGM/言語切替があっても順番を固定する
     （「最近あそんだ」「おすすめ」等の意味のあるリストはここでは対象外）。 */
  const [shelfOrder] = useState(() => {
    const orders = {};
    SHELF_GROUPS.forEach(grp => {
      orders[grp.key] = shuffleOnce(ALL_SHELF_GAMES.filter(grp.match).map(g => g.route));
    });
    return orders;
  });

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
      const counts = CATEGORY_FILTERS.slice(1).map(c => [c, ALL_SHELF_GAMES.filter(g => c.match(g) && hist[g.route]).length]);
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

  const _lastUpdateText =
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
        <meta name="description" content="幼児・小学生向けの無料ブラウザゲームがたくさん。かず・もじ・パズル・アクション・レースなどを、登録不要・インストール不要でスマホ・タブレット・PCからすぐ遊べます。" />
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
          title={lang === 'en' ? 'Coin exchange' : 'コインでこうかん'}>
          🪙 <span className="tp-shop-label">{{ja:'コインでこうかん', en:'Coin exchange', zh:'金币兑换', ko:'코인 교환', es:'Canjear monedas'}[lang] || 'コインでこうかん'}</span>
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
                <linearGradient id="tpTowerG" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#FFFDF7" /><stop offset="1" stopColor="#EFE1FA" />
                </linearGradient>
                <linearGradient id="tpTowerRearG" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#E9DCF6" /><stop offset="1" stopColor="#CFC0E8" />
                </linearGradient>
                <linearGradient id="tpRoofPinkG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFAFCF" /><stop offset="1" stopColor="#E85D95" />
                </linearGradient>
                <linearGradient id="tpRoofBlueG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#A9C6FF" /><stop offset="1" stopColor="#5B7FE0" />
                </linearGradient>
                <linearGradient id="tpGoldG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFE58A" /><stop offset="1" stopColor="#E6A700" />
                </linearGradient>
                <radialGradient id="tpWindowG">
                  <stop offset="0" stopColor="#FFF6D8" /><stop offset="100%" stopColor="#FFC968" />
                </radialGradient>
                <linearGradient id="tpDoorG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#C9A6EF" /><stop offset="1" stopColor="#8F6BEF" />
                </linearGradient>
              </defs>
              <ellipse cx="280" cy="168" rx="262" ry="20" fill="url(#tpSeaG)" />
              <ellipse cx="280" cy="158" rx="216" ry="27" fill="url(#tpSandG)" />
              <ellipse cx="280" cy="149" rx="176" ry="21" fill="url(#tpGrassG)" />

              {/* ── 小さくても豪華な王国の城（約78%スケール・奥行きあり） ── */}
              <g aria-hidden="true">
                {/* 奥の小塔（背後にちらっと見える。淡色で遠近感） */}
                <g stroke="#7A6693" strokeWidth="1.6" opacity="0.88">
                  <rect x="216" y="96" width="12" height="36" rx="3" fill="url(#tpTowerRearG)" />
                  <polygon points="216,98 222,84 228,98" fill="url(#tpRoofBlueG)" />
                  <rect x="332" y="96" width="12" height="36" rx="3" fill="url(#tpTowerRearG)" />
                  <polygon points="332,98 338,84 344,98" fill="url(#tpRoofPinkG)" />
                </g>

                {/* 城壁の土台（左右） */}
                <g stroke="#7A6693" strokeWidth="1.8">
                  <rect x="232" y="118" width="96" height="16" rx="3" fill="url(#tpTowerG)" />
                  <rect x="232" y="118" width="96" height="4" fill="url(#tpGoldG2)" stroke="none" />
                </g>

                {/* 左右のドラム塔 */}
                <g stroke="#7A6693" strokeWidth="1.8">
                  <rect x="233" y="88" width="20" height="46" rx="5" fill="url(#tpTowerG)" />
                  <rect x="307" y="88" width="20" height="46" rx="5" fill="url(#tpTowerG)" />
                  <polygon points="231,90 243,68 255,90" fill="url(#tpRoofBlueG)" />
                  <polygon points="305,90 317,68 329,90" fill="url(#tpRoofPinkG)" />
                  <circle cx="243" cy="104" r="4.2" fill="url(#tpWindowG)" stroke="#C98F00" strokeWidth="1" />
                  <circle cx="317" cy="104" r="4.2" fill="url(#tpWindowG)" stroke="#C98F00" strokeWidth="1" />
                </g>
                {/* 側塔の旗竿・小旗 */}
                <path d="M243 68 l0 -9 M243 59 l8 2.5 -8 3.5z" stroke="#7A6693" strokeWidth="1.6" fill="url(#tpGoldG2)" />
                <path d="M317 68 l0 -9 M317 59 l8 2.5 -8 3.5z" stroke="#7A6693" strokeWidth="1.6" fill="url(#tpGoldG2)" />

                {/* 中央本館 */}
                <g stroke="#7A6693" strokeWidth="2">
                  <rect x="252" y="76" width="56" height="58" rx="5" fill="url(#tpTowerG)" />
                  <rect x="252" y="76" width="56" height="5" fill="url(#tpGoldG2)" stroke="none" />
                  <polygon points="248,78 280,45 312,78" fill="url(#tpRoofPinkG)" />
                  <path d="M280 45 L248 78 M280 45 L312 78" stroke="#FFDCEB" strokeWidth="1" opacity="0.7" />
                </g>
                <path d="M280 45 l0 -11 M280 34 l9 3 -9 4.4z" stroke="#7A6693" strokeWidth="1.8" fill="url(#tpGoldG2)" />

                {/* 中央窓（明かり） */}
                <circle cx="280" cy="92" r="7" fill="url(#tpWindowG)" stroke="#C98F00" strokeWidth="1.3" />
                <circle cx="280" cy="92" r="2.6" fill="#FFFCF0" opacity="0.9" />

                {/* 正面扉と階段 */}
                <g stroke="#7A6693" strokeWidth="1.6">
                  <rect x="271" y="112" width="18" height="22" rx="8" fill="url(#tpDoorG)" />
                  <rect x="273" y="120" width="14" height="3" fill="url(#tpGoldG2)" stroke="none" />
                  <rect x="266" y="134" width="28" height="4" rx="1.5" fill="#F6E6FF" />
                  <rect x="262" y="138" width="36" height="4" rx="1.5" fill="#EFDCFA" />
                </g>

                {/* 紋章 */}
                <circle cx="280" cy="70" r="4" fill="url(#tpGoldG2)" stroke="#7A6693" strokeWidth="1" />

                {/* 城前の小さな装飾（花・光粒） */}
                <g opacity="0.9">
                  <circle cx="222" cy="142" r="2.2" fill="#FF9BC4" />
                  <circle cx="338" cy="144" r="2.2" fill="#FFD37A" />
                  <circle cx="252" cy="146" r="1.6" fill="#FFF6D8" />
                  <circle cx="308" cy="147" r="1.6" fill="#FFF6D8" />
                </g>
              </g>

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
                onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, game.route, e.clientX, e.clientY, { name:(game[lang] || game.ja).name, category:game.category, sourceContext:'top_featured' }); }}
              />
            ))}
          </div>
        </section>

        {/* ── カテゴリ・年齢の絞り込み ── */}
        <div className="tp-sticky-bar">
          <div className="tp-filter-stack">
            <HorizontalRail
              className="tp-cat-chips"
              railProps={{ role:'tablist', 'aria-label':'カテゴリ' }}
              labels={{
                left: ({ja:'ひだりのカテゴリをみる', en:'See categories to the left', zh:'查看左侧分类', ko:'왼쪽 카테고리 보기', es:'Ver categorías a la izquierda'}[lang] || 'ひだりのカテゴリをみる'),
                right: ({ja:'みぎのカテゴリをみる', en:'See categories to the right', zh:'查看右侧分类', ko:'오른쪽 카테고리 보기', es:'Ver categorías a la derecha'}[lang] || 'みぎのカテゴリをみる'),
              }}
            >
              {CATEGORY_FILTERS.map(c => (
                <button
                  key={c.key}
                  role="tab"
                  aria-selected={catKey === c.key}
                  className={`tp-cat-chip${catKey === c.key ? ' tp-cat-chip--on' : ''}`}
                  onClick={() => setCatKey(c.key)}
                >
                  <span aria-hidden="true">{c.icon} </span>{c.label[lang] || c.label.ja}
                </button>
              ))}
            </HorizontalRail>
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
        </div>

        {/* ── ジャンルグループ別ゲーム棚(6棚) ── */}
        {SHELF_GROUPS.map(grp => {
          const chip  = CATEGORY_FILTERS.find(c => c.key === catKey) || CATEGORY_FILTERS[0];
          const age   = AGE_FILTERS.find(item => item.key === ageKey) || AGE_FILTERS[0];
          const items = sortShelfItemsByOrder(
            ALL_SHELF_GAMES.filter(grp.match).filter(chip.match).filter(age.match),
            shelfOrder[grp.key]
          );
          if (items.length === 0) return null;
          return (
            <div className="tp-shelf" key={grp.key}>
              <div className="tp-shelf-title">
                {grp.icon} {grp.label[lang] || grp.label.ja}
              </div>
              <HorizontalRail
                className="tp-shelf-scroll"
                labels={{
                  left: ({ja:'ひだりのゲームをみる', en:'See games to the left', zh:'查看左侧游戏', ko:'왼쪽 게임 보기', es:'Ver juegos a la izquierda'}[lang] || 'ひだりのゲームをみる'),
                  right: ({ja:'みぎのゲームをみる', en:'See games to the right', zh:'查看右侧游戏', ko:'오른쪽 게임 보기', es:'Ver juegos a la derecha'}[lang] || 'みぎのゲームをみる'),
                }}
              >
                {items.map(game => (
                  <ShelfCard
                    key={game.id}
                    game={game}
                    lang={lang}
                    onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, game.route, e.clientX, e.clientY, { name:(game[lang] || game.ja).name, category:game.category, sourceContext:'category' }); }}
                  />
                ))}
              </HorizontalRail>
            </div>
          );
        })}

        {/* ── 最近遊んだゲーム（マップの下へ移動） ── */}
        {recentGames.length > 0 && (
          <div className="tp-recent">
            <div className="tp-recent-title">
              🕐 {{ja:'さいきんあそんだゲーム', en:'Recently Played', zh:'最近玩过', ko:'최근 플레이', es:'Reciente'}[lang] || 'さいきんあそんだゲーム'}
            </div>
            <HorizontalRail className="tp-recent-scroll" labels={{ left:({ja:'ひだりのゲームをみる',en:'See games to the left', zh:'查看左侧游戏', ko:'왼쪽 게임 보기', es:'Ver juegos a la izquierda'}[lang] || 'ひだりのゲームをみる'), right:({ja:'みぎのゲームをみる',en:'See games to the right', zh:'查看右侧游戏', ko:'오른쪽 게임 보기', es:'Ver juegos a la derecha'}[lang] || 'みぎのゲームをみる') }}>
              {recentGames.map(g => (
                <button
                  key={g.route}
                  className="tp-recent-card"
                  onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, g.route, e.clientX, e.clientY, { name:(g[lang] || g.ja).name, category:g.category, sourceContext:'recent' }); }}
                >
                  <span className="tp-recent-icon">{g.icon}</span>
                  <span className="tp-recent-name">{(g[lang] || g.ja).name}</span>
                </button>
              ))}
            </HorizontalRail>
          </div>
        )}

        {/* ── きみにオススメ ── */}
        {recoGames.length > 0 && (
          <div className="tp-recent tp-reco">
            <div className="tp-recent-title">
              💡 {{ja:'きみに オススメ', en:'For You', zh:'为你推荐', ko:'추천 게임', es:'Para ti'}[lang] || 'きみに オススメ'}
            </div>
            <HorizontalRail className="tp-recent-scroll" labels={{ left:({ja:'ひだりのゲームをみる',en:'See games to the left', zh:'查看左侧游戏', ko:'왼쪽 게임 보기', es:'Ver juegos a la izquierda'}[lang] || 'ひだりのゲームをみる'), right:({ja:'みぎのゲームをみる',en:'See games to the right', zh:'查看右侧游戏', ko:'오른쪽 게임 보기', es:'Ver juegos a la derecha'}[lang] || 'みぎのゲームをみる') }}>
              {recoGames.map(g => (
                <button
                  key={g.route}
                  className="tp-recent-card"
                  onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, g.route, e.clientX, e.clientY, { name:(g[lang] || g.ja).name, category:g.category, sourceContext:'recommended' }); }}
                >
                  <span className="tp-recent-icon">{g.icon}</span>
                  <span className="tp-recent-name">{(g[lang] || g.ja).name}</span>
                </button>
              ))}
            </HorizontalRail>
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
          <button className="tp-footer-link" onClick={() => navigate('/parents')}>
            {{ja:'👪 保護者の方へ', en:'👪 For Parents', zh:'👪 致家长', ko:'👪 보호자 안내', es:'👪 Para familias'}[lang] || '👪 保護者の方へ'}
          </button>
          <a className="tp-footer-link tp-footer-robobella"
            href="https://robobella.wakuwakuislands.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('robobella_portal_click', { source_context:'footer', source_page:'/' })}>
            {{ja:'🤖 RoboBellaを見る', en:'🤖 Visit RoboBella', zh:'🤖 前往 RoboBella', ko:'🤖 RoboBella 보기', es:'🤖 Visitar RoboBella'}[lang] || '🤖 RoboBellaを見る'}
          </a>
          <button className="tp-footer-link" onClick={() => navigate('/privacy')}>
            {{ja:'🔒 プライバシーポリシー', en:'🔒 Privacy Policy', zh:'🔒 隐私政策', ko:'🔒 개인정보 처리방침', es:'🔒 Privacidad'}[lang] || '🔒 プライバシーポリシー'}
          </button>
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
                    onClick={(e) => { closeRoulette(); spawnParticles(e.clientX, e.clientY); transitionTo(navigate, g.route, e.clientX, e.clientY, { name:(g[lang] || g.ja).name, category:g.category, sourceContext:'recommended' }); }}>
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
        onCoinsChange={setCoins}
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
