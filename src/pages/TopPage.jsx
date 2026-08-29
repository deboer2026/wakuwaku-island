import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { startBGM, stopBGM, toggleBGM } from '../utils/audio';
import { transitionTo } from '../utils/transition';
import { getPlayCount } from '../utils/playCounter';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { KisekaePanel } from '../components/Kisekae';
import { normalizeKisekaeState, syncSpecialUnlocks } from '../components/kisekae/data';
import LoginBonus from '../components/LoginBonus';
import Shop from '../components/Shop';
import { getCoins, checkLoginBonus, claimLoginBonus } from '../utils/coins';
import { getRecentGames } from '../utils/recentGames';
import { getPlayHistory } from '../utils/playHistory';
import { detectLang } from '../utils/i18n';
import { trackEvent } from '../utils/analytics';
import GAME_META from '../seo/gameMeta';
import IslandHero from '../components/IslandHero';
import GameGrid from '../components/GameGrid';
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

/* 旧CATEGORIES/マスコット定義は新デザインで不要になったため削除(v2)。
   カテゴリはSHELF_GROUPSから再構成する。 */

/* ════════════════════════════════════════════════════
   ゲームSVGイラスト（SNES風）
════════════════════════════════════════════════════ */
const GAME_SVGS = {
  g_astral: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="85" rx="12" fill="#2b2350"/>
      <circle cx="14" cy="12" r="1.4" fill="#fff6c8" opacity=".9"/>
      <circle cx="88" cy="10" r="1.2" fill="#fff6c8" opacity=".8"/>
      <circle cx="76" cy="18" r="1" fill="#fff6c8" opacity=".7"/>
      <circle cx="10" cy="26" r="1" fill="#fff6c8" opacity=".6"/>
      <circle cx="94" cy="24" r="1" fill="#fff6c8" opacity=".7"/>
      <path d="M20 22 L21.6 26.6 L26 26.6 L22.6 29.6 L24 34 L20 31.2 L16 34 L17.4 29.6 L14 26.6 L18.4 26.6 Z" fill="#ffd35a"/>
      <path d="M62 10 L63.2 13.4 L66.6 13.4 L64 15.6 L65 19 L62 16.8 L59 19 L60 15.6 L57.4 13.4 L60.8 13.4 Z" fill="#fff2a8"/>
      <path d="M8 60 Q20 34 46 30 Q74 26 90 44" fill="none" stroke="#ff9ecb" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="1 6" opacity=".8"/>
      <ellipse cx="46" cy="60" rx="16" ry="9" fill="#8fc6ff"/>
      <path d="M30 60 L21 55 L26 62 L21 68 Z" fill="#8fc6ff"/>
      <circle cx="55" cy="57" r="1.5" fill="#1c1a44"/>
      <circle cx="30" cy="67" r="6.4" fill="#ffcf7a"/>
      <circle cx="27.4" cy="65.4" r="1.4" fill="#3a2a10"/>
      <circle cx="32.6" cy="65.4" r="1.4" fill="#3a2a10"/>
      <path d="M25 62 L26.6 59 L28.6 62 Z" fill="#ffcf7a"/>
      <path d="M31.4 62 L33.4 59 L35 62 Z" fill="#ffcf7a"/>
      <circle cx="52" cy="72" r="5.6" fill="#c7f0a8"/>
      <circle cx="49.8" cy="70.6" r="1.2" fill="#3a4a20"/>
      <circle cx="54.2" cy="70.6" r="1.2" fill="#3a4a20"/>
      <ellipse cx="47.4" cy="72.6" rx="1.6" ry="1.1" fill="#f7b9c8"/>
      <ellipse cx="56.6" cy="72.6" rx="1.6" ry="1.1" fill="#f7b9c8"/>
      <circle cx="70" cy="70" r="5.4" fill="#e6c8ff"/>
      <circle cx="67.8" cy="68.6" r="1.2" fill="#3a2a4a"/>
      <circle cx="72.2" cy="68.6" r="1.2" fill="#3a2a4a"/>
      <path d="M64.6 66 L65.8 63.4 L67.6 66.4Z" fill="#e6c8ff"/>
      <path d="M72.4 66.4 L74.2 63.4 L75.4 66Z" fill="#e6c8ff"/>
      <circle cx="86" cy="73" r="4.8" fill="#ffe4a8"/>
      <circle cx="84.1" cy="71.8" r="1.1" fill="#4a3a10"/>
      <circle cx="87.9" cy="71.8" r="1.1" fill="#4a3a10"/>
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
      <defs>
      <linearGradient id="nd_sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#150b38"/>
      <stop offset="0.55" stopColor="#3a1f6e"/>
      <stop offset="1" stopColor="#7a3f8e"/>
      </linearGradient>
      <linearGradient id="nd_road" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#241a44"/>
      <stop offset="1" stopColor="#3b2a5e"/>
      </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="85" rx="12" fill="url(#nd_sky)"/>
      <circle cx="16" cy="12" r="1.5" fill="#fff" opacity=".9"/>
      <circle cx="30" cy="7" r="1.1" fill="#fff" opacity=".75"/>
      <circle cx="72" cy="9" r="1.3" fill="#fff" opacity=".85"/>
      <circle cx="86" cy="17" r="1" fill="#fff" opacity=".7"/>
      <circle cx="58" cy="13" r="1" fill="#fff" opacity=".6"/>
      <circle cx="79" cy="15" r="7" fill="#fff2c6" opacity=".25"/>
      <circle cx="79" cy="15" r="4.6" fill="#fff4d0"/>
      <g opacity=".95">
      <path d="M22 46 a28 28 0 0 1 56 0" fill="none" stroke="#ff6b6b" strokeWidth="2.1"/>
      <path d="M25 46 a25 25 0 0 1 50 0" fill="none" stroke="#ffd166" strokeWidth="2.1"/>
      <path d="M28 46 a22 22 0 0 1 44 0" fill="none" stroke="#7dff8a" strokeWidth="2.1"/>
      <path d="M31 46 a19 19 0 0 1 38 0" fill="none" stroke="#5ecdff" strokeWidth="2.1"/>
      <path d="M34 46 a16 16 0 0 1 32 0" fill="none" stroke="#c77dff" strokeWidth="2.1"/>
      </g>
      <rect x="4" y="24" width="9" height="24" rx="1.5" fill="#0e0b1e"/>
      <rect x="5.6" y="27" width="2.4" height="2.4" fill="#ffd98a"/>
      <rect x="9.4" y="27" width="2.4" height="2.4" fill="#7df9ff"/>
      <rect x="5.6" y="32" width="2.4" height="2.4" fill="#7df9ff"/>
      <rect x="9.4" y="37" width="2.4" height="2.4" fill="#ffd98a"/>
      <rect x="5" y="20" width="7" height="3" rx="1" fill="#ff2fb0"/>
      <rect x="15" y="32" width="7" height="16" rx="1.5" fill="#0e0b1e"/>
      <rect x="16.4" y="35" width="2.2" height="2.2" fill="#ffd98a"/>
      <rect x="19" y="40" width="2.2" height="2.2" fill="#7df9ff"/>
      <rect x="87" y="27" width="9" height="21" rx="1.5" fill="#0e0b1e"/>
      <rect x="88.6" y="30" width="2.4" height="2.4" fill="#7df9ff"/>
      <rect x="92.4" y="30" width="2.4" height="2.4" fill="#ffd98a"/>
      <rect x="88.6" y="35" width="2.4" height="2.4" fill="#ffd98a"/>
      <rect x="88" y="23" width="7" height="3" rx="1" fill="#ffe14d"/>
      <rect x="78" y="34" width="7" height="14" rx="1.5" fill="#0e0b1e"/>
      <rect x="79.4" y="37" width="2.2" height="2.2" fill="#7df9ff"/>
      <path d="M38 46 L62 46 L88 85 L12 85 Z" fill="url(#nd_road)"/>
      <path d="M38 46 L12 85" stroke="#ff2fb0" strokeWidth="2.6" strokeLinecap="round"/>
      <path d="M62 46 L88 85" stroke="#00e5ff" strokeWidth="2.6" strokeLinecap="round"/>
      <g stroke="#dff2ff" strokeWidth="1.6" opacity=".55" strokeLinecap="round">
      <path d="M50 48 L50 52"/><path d="M50 57 L50 63"/><path d="M50 69 L50 78"/>
      </g>
      <g fill="#ffe14d">
      <path d="M31 57 l1.1 2.3 2.5 .3 -1.9 1.7 .5 2.5 -2.2 -1.3 -2.2 1.3 .5 -2.5 -1.9 -1.7 2.5 -.3z"/>
      <path d="M69 54 l.9 1.9 2.1 .3 -1.6 1.4 .4 2.1 -1.8 -1.1 -1.8 1.1 .4 -2.1 -1.6 -1.4 2.1 -.3z"/>
      <path d="M62 71 l.8 1.6 1.8 .2 -1.3 1.2 .3 1.8 -1.6 -.9 -1.6 .9 .3 -1.8 -1.3 -1.2 1.8 -.2z"/>
      </g>
      <g transform="translate(50 71)">
      <ellipse cx="0" cy="9" rx="13" ry="3.2" fill="#00e5ff" opacity=".22"/>
      <path d="M-11 5 q0 -6 3 -7 l16 0 q3 1 3 7 z" fill="#f6b6d4"/>
      <rect x="-11.5" y="4.6" width="23" height="2.6" rx="1.3" fill="#ff5ea8"/>
      <path d="M-6.6 -2 q1.4 -3.4 6.6 -3.4 q5.2 0 6.6 3.4 z" fill="#4a6f92"/>
      <path d="M-8 -2 l16 0 q2.6 .6 3 3 l-22 0 q.4 -2.4 3 -3z" fill="#f9cbe0"/>
      <ellipse cx="-6.5" cy="-9" rx="2" ry="5.2" fill="#f6b6d4"/>
      <ellipse cx="6.5" cy="-9" rx="2" ry="5.2" fill="#f6b6d4"/>
      <ellipse cx="-6.5" cy="-8.6" rx=".9" ry="3.4" fill="#ffdcea"/>
      <ellipse cx="6.5" cy="-8.6" rx=".9" ry="3.4" fill="#ffdcea"/>
      <rect x="-9.5" y="-1.2" width="3.6" height="1.8" rx=".9" fill="#fff6d8"/>
      <rect x="5.9" y="-1.2" width="3.6" height="1.8" rx=".9" fill="#fff6d8"/>
      <circle cx="-8.4" cy="6.4" r="2.4" fill="#14121c"/>
      <circle cx="8.4" cy="6.4" r="2.4" fill="#14121c"/>
      <circle cx="-8.4" cy="6.4" r="1" fill="#d8e6f2"/>
      <circle cx="8.4" cy="6.4" r="1" fill="#d8e6f2"/>
      </g>
      <g transform="translate(30 77)">
      <circle cx="0" cy="0" r="4.6" fill="#8fd8f0"/>
      <circle cx="-1.6" cy="-1" r="1" fill="#26343f"/>
      <circle cx="1.6" cy="-1" r="1" fill="#26343f"/>
      <path d="M-1.2 1.4 h2.4 l-1.2 1.4z" fill="#ffb347"/>
      <path d="M-4.4 -3.4 l-1 -3.4 l3.2 2.2z" fill="#8fd8f0"/>
      <path d="M4.4 -3.4 l1 -3.4 l-3.2 2.2z" fill="#8fd8f0"/>
      </g>
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
      <defs>
        <linearGradient id="skyKy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fcdf2"/>
          <stop offset="1" stopColor="#d5f0ff"/>
        </linearGradient>
        <linearGradient id="grdKy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc86e"/>
          <stop offset="1" stopColor="#5aa851"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="85" rx="12" fill="url(#skyKy)"/>
      <path d="M0 52 H100 V73 A12 12 0 0 1 88 85 H12 A12 12 0 0 1 0 73 Z" fill="url(#grdKy)"/>
      <path d="M0 52 L18 52 L9 40 Z" fill="#63b45a" opacity=".85"/>
      <path d="M74 52 L96 52 L85 37 Z" fill="#63b45a" opacity=".85"/>
      <path d="M22 52 l4 -9 l4 9 Z" fill="#3f8f47"/>
      <path d="M68 52 l4.5 -10 l4.5 10 Z" fill="#3f8f47"/>
      <ellipse cx="20" cy="20" rx="11" ry="5.5" fill="#fff" opacity=".9"/>
      <ellipse cx="80" cy="15" rx="9" ry="4.5" fill="#fff" opacity=".9"/>
      <ellipse cx="50" cy="34" rx="21" ry="20" fill="none" stroke="#e0a800" strokeWidth="7"/>
      <ellipse cx="50" cy="34" rx="21" ry="20" fill="none" stroke="#ffd24d" strokeWidth="4.5"/>
      <path d="M40 62 l14 -6 l-1 8 Z" fill="#ffe98a" opacity=".9"/>
      <g transform="translate(50 55)">
        <path d="M-7 -3 Q-24 -9 -27 2 Q-16 5 -7 3 Z" fill="#fff" stroke="#a9c4e6" strokeWidth="1"/>
        <path d="M7 -3 Q24 -9 27 2 Q16 5 7 3 Z" fill="#fff" stroke="#a9c4e6" strokeWidth="1"/>
        <ellipse cx="0" cy="3" rx="10.5" ry="10" fill="#bfb9d6"/>
        <ellipse cx="0" cy="5" rx="6" ry="5.5" fill="#f1eefb"/>
        <circle cx="0" cy="-7" r="8.5" fill="#bfb9d6"/>
        <path d="M-8 -11 L-11 -19 L-3 -14 Z" fill="#bfb9d6"/>
        <path d="M8 -11 L11 -19 L3 -14 Z" fill="#bfb9d6"/>
        <path d="M-6.5 -11 L-8.5 -16 L-3.5 -13 Z" fill="#ff9ec4"/>
        <path d="M6.5 -11 L8.5 -16 L3.5 -13 Z" fill="#ff9ec4"/>
        <circle cx="-3.4" cy="-7" r="1.7" fill="#2a2440"/>
        <circle cx="3.4" cy="-7" r="1.7" fill="#2a2440"/>
        <path d="M-1.4 -4 L1.4 -4 L0 -2 Z" fill="#ff7eb3"/>
      </g>
      <path d="M84 60 l2.4 4.8 l5 .7 l-3.7 3.4 l1 5 l-4.7 -2.5 l-4.7 2.5 l1 -5 l-3.7 -3.4 l5 -.7 Z" fill="#ffd24d" stroke="#e0a800" strokeWidth="1"/>
      <path d="M15 33 l1.8 3.6 l3.9 .5 l-2.9 2.6 l.8 3.9 l-3.6 -1.9 l-3.6 1.9 l.8 -3.9 l-2.9 -2.6 l3.9 -.5 Z" fill="#fff2a0" stroke="#e0a800" strokeWidth=".8"/>
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
      <defs>
        <linearGradient id="okSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fdcf5"/><stop offset="0.62" stopColor="#ffe7c4"/><stop offset="1" stopColor="#ffd9a8"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="85" fill="url(#okSky)"/>

      <path d="M22 33 L78 33 L82 38 L18 38 Z" fill="#f5d9a8"/>
      <path d="M18 38 L82 38 L88 45 L12 45 Z" fill="#e0679f"/>
      <path d="M12 45 L88 45 L95 53 L5 53 Z" fill="#e8c68f"/>
      <path d="M5 53 L95 53 L100 63 L0 63 Z" fill="#6b4226"/>
      <path d="M0 63 L100 63 L100 74 L0 74 Z" fill="#8a5a34" opacity=".35"/>
      <path d="M0 63 L100 63 L100 85 L0 85 Z" fill="#f5d9a8"/>
      <path d="M0 74 L100 74 L100 85 L0 85 Z" fill="#e8c68f"/>

      <rect x="26" y="40" width="7" height="2" rx="1" fill="#ffe6f3" opacity=".9"/>
      <rect x="46" y="40" width="7" height="2" rx="1" fill="#ffe6f3" opacity=".9"/>
      <rect x="66" y="40" width="7" height="2" rx="1" fill="#ffe6f3" opacity=".9"/>

      <ellipse cx="20" cy="57" rx="11" ry="4" fill="#e8b76f" stroke="#c9964f" strokeWidth="1"/>
      <circle cx="17" cy="56" r="1.2" fill="#5b3a22"/><circle cx="23" cy="58" r="1.2" fill="#5b3a22"/>
      <ellipse cx="72" cy="59" rx="12" ry="4.4" fill="#e8b76f" stroke="#c9964f" strokeWidth="1"/>
      <circle cx="69" cy="58" r="1.2" fill="#5b3a22"/><circle cx="76" cy="60" r="1.2" fill="#5b3a22"/>

      <g>
        <rect x="20" y="39" width="15" height="5" rx="2" fill="#59b8f0" opacity=".92"/>
        <rect x="23" y="36" width="8" height="4" rx="1.8" fill="#8ed2f7" opacity=".85"/>
        <circle cx="23" cy="44.4" r="1.5" fill="#5b3a2a"/><circle cx="32" cy="44.4" r="1.5" fill="#5b3a2a"/>
      </g>
      <g>
        <rect x="58" y="40" width="16" height="5" rx="2" fill="#ff8ec0" opacity=".92"/>
        <rect x="61" y="37" width="9" height="4" rx="1.8" fill="#ffb3d6" opacity=".85"/>
        <circle cx="61.5" cy="45.4" r="1.5" fill="#5b3a2a"/><circle cx="71" cy="45.4" r="1.5" fill="#5b3a2a"/>
      </g>

      <g transform="translate(50 21)">
        <path d="M-13 2 A13 8 0 0 1 13 2" fill="none" stroke="#ff9ecb" strokeWidth="2.6" strokeLinecap="round"/>
        <rect x="-15" y="1" width="3.4" height="12" rx="1.6" fill="#fff"/>
        <rect x="-15" y="4" width="3.4" height="3" fill="#ff5f8a"/>
        <rect x="-15" y="9.5" width="3.4" height="3" fill="#ff5f8a"/>
        <rect x="11.6" y="1" width="3.4" height="12" rx="1.6" fill="#fff"/>
        <rect x="11.6" y="4" width="3.4" height="3" fill="#ff5f8a"/>
        <rect x="11.6" y="9.5" width="3.4" height="3" fill="#ff5f8a"/>
        <circle cx="0" cy="-5.4" r="2.6" fill="#ffd65b" stroke="#e0a512" strokeWidth=".8"/>
      </g>

      <g transform="translate(12 46)">
        <rect x="-0.8" y="-6" width="1.6" height="8" rx=".8" fill="#fff6e2"/>
        <circle cx="0" cy="-7.4" r="3.6" fill="#ff7fb8"/>
        <path d="M0 -10.4 A3 3 0 0 1 2.1 -5.3 A1.5 1.5 0 0 1 -0.6 -6.6" fill="none" stroke="#fff" strokeWidth="1.1" strokeLinecap="round"/>
      </g>
      <g transform="translate(90 50)">
        <rect x="-0.9" y="-7" width="1.8" height="9" rx=".9" fill="#fff6e2"/>
        <circle cx="0" cy="-8.4" r="4" fill="#62d67a"/>
        <path d="M0 -11.8 A3.4 3.4 0 0 1 2.4 -6 A1.7 1.7 0 0 1 -0.7 -7.4" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
      </g>

      <g transform="translate(50 72)">
        <ellipse cx="0" cy="11" rx="9" ry="2.4" fill="#a3745e" opacity=".28"/>
        <ellipse cx="-4.6" cy="-13" rx="2.7" ry="8" fill="#fff" transform="rotate(-9 -4.6 -13)"/>
        <ellipse cx="4.6" cy="-13" rx="2.7" ry="8" fill="#fff" transform="rotate(9 4.6 -13)"/>
        <ellipse cx="-4.6" cy="-13" rx="1.2" ry="4.8" fill="#ffb3d1" transform="rotate(-9 -4.6 -13)"/>
        <ellipse cx="4.6" cy="-13" rx="1.2" ry="4.8" fill="#ffb3d1" transform="rotate(9 4.6 -13)"/>
        <ellipse cx="0" cy="2" rx="9.2" ry="8.6" fill="#fff4f8"/>
        <ellipse cx="0" cy="3.6" rx="5.4" ry="5.6" fill="#fff"/>
        <circle cx="0" cy="-5.2" r="6.6" fill="#fff4f8"/>
        <circle cx="-2.5" cy="-6" r="1.4" fill="#3a2430"/><circle cx="2.5" cy="-6" r="1.4" fill="#3a2430"/>
        <circle cx="-2" cy="-6.5" r=".5" fill="#fff"/><circle cx="3" cy="-6.5" r=".5" fill="#fff"/>
        <ellipse cx="0" cy="-3.2" rx="1.5" ry="1.1" fill="#ffb3d1"/>
        <ellipse cx="-5.4" cy="-4.2" rx="1.7" ry="1.2" fill="#ffb3d1" opacity=".6"/>
        <ellipse cx="5.4" cy="-4.2" rx="1.7" ry="1.2" fill="#ffb3d1" opacity=".6"/>
        <ellipse cx="-4.4" cy="9.4" rx="2.6" ry="1.7" fill="#ffb3d1"/>
        <ellipse cx="4.4" cy="9.4" rx="2.6" ry="1.7" fill="#ffb3d1"/>
      </g>

      <g transform="translate(21 80)">
        <rect x="-0.8" y="-5" width="1.6" height="7" rx=".8" fill="#fff6e2"/>
        <circle cx="0" cy="-6.4" r="3.6" fill="#ffd65b"/>
        <path d="M0 -9.4 A3 3 0 0 1 2.1 -4.3 A1.5 1.5 0 0 1 -0.6 -5.6" fill="none" stroke="#fff" strokeWidth="1.1" strokeLinecap="round"/>
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
      <defs>
        <linearGradient id="bHall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD3E8"/><stop offset="1" stopColor="#FFF3DE"/></linearGradient>
        <radialGradient id="bGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF6C8" stopOpacity="0.95"/><stop offset="1" stopColor="#FFF6C8" stopOpacity="0"/></radialGradient>
        <linearGradient id="bCol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#EFDCC8"/><stop offset="1" stopColor="#D8B9C9"/></linearGradient>
      </defs>
      <rect width="100" height="85" fill="url(#bHall)"/>
      <rect x="0" y="0" width="12" height="85" fill="url(#bCol)"/><rect x="88" y="0" width="12" height="85" fill="url(#bCol)"/>
      <rect x="2" y="6" width="8" height="34" rx="2" fill="#F2839F" opacity="0.55"/><rect x="90" y="6" width="8" height="34" rx="2" fill="#F2839F" opacity="0.55"/>
      <circle cx="6" cy="18" r="4.4" fill="none" stroke="#F2839F" strokeWidth="1.1" opacity="0.7"/><circle cx="94" cy="18" r="4.4" fill="none" stroke="#F2839F" strokeWidth="1.1" opacity="0.7"/>
      <rect x="0" y="0" width="100" height="7" fill="#EFDCC8"/>
      <rect x="14" y="9" width="20" height="6" rx="2" fill="#F5AEC8"/><rect x="14" y="9" width="20" height="6" rx="2" fill="#fff" opacity="0.25"/>
      <rect x="40" y="9" width="20" height="6" rx="2" fill="#F98BB4"/><rect x="40" y="9" width="20" height="6" rx="2" fill="#fff" opacity="0.25"/>
      <rect x="66" y="9" width="20" height="6" rx="2" fill="#F2D2A2"/><rect x="66" y="9" width="20" height="6" rx="2" fill="#fff" opacity="0.25"/>
      <rect x="14" y="17" width="20" height="6" rx="2" fill="#F98BB4"/><rect x="40" y="17" width="20" height="6" rx="2" fill="#F2D2A2"/><rect x="66" y="17" width="20" height="6" rx="2" fill="#F5AEC8"/>
      <circle cx="50" cy="40" r="9" fill="url(#bGlow)"/>
      <circle cx="50" cy="40" r="3.4" fill="#FFF6C8" stroke="#F2A93B" strokeWidth="0.6"/>
      <path d="M74 48 l1.8 3.7 4 .4 -3 2.6 .9 3.9 -3.7 -2.1 -3.7 2.1 .9 -3.9 -3 -2.6 4 -.4 Z" fill="#BA68C8"/>
      <rect x="22" y="65" width="56" height="6.5" rx="3.2" fill="#F06292"/>
      <g transform="translate(50 79)">
        <ellipse cx="0" cy="0" rx="9" ry="6.5" fill="#FFB74D"/>
        <ellipse cx="0" cy="1.6" rx="5.6" ry="4" fill="#F3D2A4"/>
        <path d="M-7.4 -4.2 L-5 -8.4 L-2.6 -3.4Z" fill="#FFB74D"/>
        <path d="M7.4 -4.2 L5 -8.4 L2.6 -3.4Z" fill="#FFB74D"/>
        <circle cx="-3.1" cy="-1" r="1.15" fill="#2B1E3F"/><circle cx="3.1" cy="-1" r="1.15" fill="#2B1E3F"/>
        <path d="M-1 1.6 Q0 2.6 1 1.6" stroke="#8a5a3a" strokeWidth="0.5" fill="none"/>
      </g>
    </svg>
  ),
  g_mahoumeiro: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mmSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d2a72"/><stop offset="0.5" stopColor="#6b4fb8"/><stop offset="1" stopColor="#b79cff"/>
        </linearGradient>
        <radialGradient id="mmGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3b0" stopOpacity="0.95"/><stop offset="1" stopColor="#fff3b0" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="mmGate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9be0ff"/><stop offset="1" stopColor="#2979d6"/>
        </linearGradient>
      </defs>

      <rect width="100" height="85" fill="url(#mmSky)"/>
      <g fill="#ffffff">
        <circle cx="11" cy="8" r="1.6" opacity="0.9"/><circle cx="26" cy="4" r="1" opacity="0.65"/>
        <circle cx="74" cy="7" r="1.3" opacity="0.85"/><circle cx="90" cy="14" r="1" opacity="0.6"/>
        <circle cx="5" cy="22" r="1.1" opacity="0.6"/><circle cx="95" cy="30" r="1.2" opacity="0.7"/>
      </g>

      <polygon points="50.0,17.0 94.0,39.0 50.0,61.0 6.0,39.0" fill="#f2e8bc"/>
      <polygon points="50.0,17.0 94.0,39.0 50.0,61.0 6.0,39.0" fill="none" stroke="#cdbc85" strokeWidth="1.2"/>

      <polygon points="29.3,15.0 39.0,19.8 39.0,32.8 29.3,28.0" fill="#2f7d40"/>
      <polygon points="39.0,19.8 48.7,15.0 48.7,28.0 39.0,32.8" fill="#3f9a4d"/>
      <polygon points="39.0,10.2 48.7,15.0 39.0,19.8 29.3,15.0" fill="#5fbf62"/>
      <ellipse cx="39.0" cy="13.5" rx="7" ry="4.4" fill="#79d46f"/>
      <polygon points="40.3,20.5 50.0,25.3 50.0,38.3 40.3,33.5" fill="#2f7d40"/>
      <polygon points="50.0,25.3 59.7,20.5 59.7,33.5 50.0,38.3" fill="#3f9a4d"/>
      <polygon points="50.0,15.7 59.7,20.5 50.0,25.3 40.3,20.5" fill="#5fbf62"/>
      <ellipse cx="50.0" cy="19.0" rx="7" ry="4.4" fill="#79d46f"/>
      <polygon points="51.3,26.0 61.0,30.8 61.0,43.8 51.3,39.0" fill="#2f7d40"/>
      <polygon points="61.0,30.8 70.7,26.0 70.7,39.0 61.0,43.8" fill="#3f9a4d"/>
      <polygon points="61.0,21.2 70.7,26.0 61.0,30.8 51.3,26.0" fill="#5fbf62"/>
      <ellipse cx="61.0" cy="24.5" rx="7" ry="4.4" fill="#79d46f"/>
      <polygon points="7.3,26.0 17.0,30.8 17.0,43.8 7.3,39.0" fill="#2f7d40"/>
      <polygon points="17.0,30.8 26.7,26.0 26.7,39.0 17.0,43.8" fill="#3f9a4d"/>
      <polygon points="17.0,21.2 26.7,26.0 17.0,30.8 7.3,26.0" fill="#5fbf62"/>
      <ellipse cx="17.0" cy="24.5" rx="7" ry="4.4" fill="#79d46f"/>
      <polygon points="18.3,31.5 28.0,36.3 28.0,49.3 18.3,44.5" fill="#2f7d40"/>
      <polygon points="28.0,36.3 37.7,31.5 37.7,44.5 28.0,49.3" fill="#3f9a4d"/>
      <polygon points="28.0,26.7 37.7,31.5 28.0,36.3 18.3,31.5" fill="#5fbf62"/>
      <ellipse cx="28.0" cy="30.0" rx="7" ry="4.4" fill="#79d46f"/>

      <ellipse cx="72.0" cy="45.5" rx="8.5" ry="3.4" fill="#1a1040" opacity="0.22"/>
      <rect x="64.0" y="27.5" width="3.4" height="18" rx="1.2" fill="#12508f"/>
      <rect x="76.6" y="27.5" width="3.4" height="18" rx="1.2" fill="#12508f"/>
      <rect x="64.0" y="25.0" width="16" height="3.4" rx="1.2" fill="#12508f"/>
      <rect x="66.8" y="28.5" width="10.4" height="16" rx="1.5" fill="url(#mmGate)"/>
      <path d="M72.0 33.5 l3.2 3.4 -3.2 3.4 -3.2 -3.4 z" fill="#ffffff" opacity="0.95"/>

      <circle cx="50.0" cy="13.5" r="14" fill="url(#mmGlow)"/>
      <ellipse cx="45.6" cy="11.5" rx="3.8" ry="5.4" fill="#ffffff" opacity="0.7"/>
      <ellipse cx="54.4" cy="11.5" rx="3.8" ry="5.4" fill="#ffffff" opacity="0.7"/>
      <circle cx="50.0" cy="13.5" r="4.8" fill="#fff6c8"/>

      <g transform="translate(21 29) scale(0.92)">
        <path d="M0 -7.5 L2.2 -2.2 L7.5 -2.2 L3.2 1.6 L4.8 7 L0 3.8 L-4.8 7 L-3.2 1.6 L-7.5 -2.2 L-2.2 -2.2 Z"
              fill="#ffd54f" stroke="#f9a825" strokeWidth="1.2"/>
      </g>

      <g transform="translate(50.0 45.5)">
        <ellipse cx="0" cy="10" rx="7.5" ry="2.6" fill="#1a1040" opacity="0.25"/>
        <path d="M-5.8 -5.5 L-7.4 -12 L-1.6 -8 Z" fill="#e8a85e"/>
        <path d="M5.8 -5.5 L7.4 -12 L1.6 -8 Z" fill="#e8a85e"/>
        <ellipse cx="0" cy="3.6" rx="6.4" ry="5.8" fill="#f0b66f"/>
        <circle cx="0" cy="-4" r="6.8" fill="#f6c684"/>
        <circle cx="-2.6" cy="-4.8" r="1.3" fill="#4a3b32"/>
        <circle cx="2.6" cy="-4.8" r="1.3" fill="#4a3b32"/>
        <ellipse cx="0" cy="-1.2" rx="2.8" ry="1.9" fill="#ffffff" opacity="0.92"/>
        <circle cx="0" cy="-1.9" r="1" fill="#e8887a"/>
      </g>
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
      <defs>
        <linearGradient id="k5sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#160D2A"/><stop offset="1" stopColor="#42265F"/>
        </linearGradient>
        <radialGradient id="k5glow">
          <stop offset="0" stopColor="#FFD76A" stopOpacity=".7"/><stop offset="1" stopColor="#FFD76A" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100" height="85" rx="12" fill="url(#k5sky)"/>
      <circle cx="13" cy="11" r="1.2" fill="#FFF6E8" opacity=".85"/><circle cx="34" cy="7" r=".9" fill="#FFF6E8" opacity=".6"/>
      <circle cx="62" cy="10" r=".8" fill="#FFF6E8" opacity=".55"/><circle cx="88" cy="17" r="1.1" fill="#FFF6E8" opacity=".7"/>
      <g stroke="#FF8FB8" strokeWidth="1.15" strokeLinecap="round" opacity=".9">
        <path d="M25 20v-6.5M25 20v6.5M25 20h-6.5M25 20h6.5M25 20l-4.6-4.6M25 20l4.6 4.6M25 20l4.6-4.6M25 20l-4.6 4.6"/>
      </g>
      <circle cx="25" cy="20" r="1.9" fill="#FFF3B0"/>
      <path d="M0 52 Q26 45 52 49 Q76 53 100 45 V85H0Z" fill="#2B1F44"/>
      <circle cx="50" cy="44" r="15" fill="url(#k5glow)"/>
      <g fill="#D1483F">
        <rect x="42.4" y="34" width="2.3" height="15" rx=".8"/><rect x="55.3" y="34" width="2.3" height="15" rx=".8"/>
        <rect x="39.6" y="33.2" width="20.8" height="1.9" rx=".8"/><rect x="43" y="37.6" width="14" height="1.5" rx=".6"/>
      </g>
      <rect x="38.4" y="31.4" width="23.2" height="1.7" rx=".8" fill="#2E1B2E"/>
      <ellipse cx="50" cy="36.4" rx="2.1" ry="2.6" fill="#E8564F"/><rect x="47.9" y="35.7" width="4.2" height="1.1" fill="#FFF6E8"/>
      <g fill="#6E6486">
        <ellipse cx="51" cy="53" rx="4.4" ry="1.9"/><ellipse cx="53" cy="57.4" rx="5.6" ry="2.4"/>
      </g>
      <g fill="#FFE6B0">
        <ellipse cx="48" cy="62" rx="7" ry="3"/><ellipse cx="40" cy="67.5" rx="8.6" ry="3.7"/>
        <ellipse cx="29" cy="74" rx="10.4" ry="4.4"/><ellipse cx="15" cy="80.5" rx="12" ry="5"/>
      </g>
      <ellipse cx="40" cy="67.5" rx="5" ry="2" fill="#000" opacity=".28"/>
      <g transform="translate(40 58)">
        <ellipse cy="3.4" rx="5.7" ry="6.2" fill="#FFF1E6"/>
        <ellipse cx="-1.9" cy="-6.8" rx="1.5" ry="3.9" fill="#FFF1E6"/><ellipse cx="1.9" cy="-6.8" rx="1.5" ry="3.9" fill="#FFF1E6"/>
        <circle cy="-2.2" r="4.6" fill="#FFF1E6"/>
        <ellipse cy="3.9" rx="5.7" ry="1.5" fill="#FF8FB8"/>
        <circle cx="-1.7" cy="-2.6" r=".85" fill="#3A2A22"/><circle cx="1.7" cy="-2.6" r=".85" fill="#3A2A22"/>
        <circle cx="-3.4" cy="-.9" r=".95" fill="#FFB9C8"/><circle cx="3.4" cy="-.9" r=".95" fill="#FFB9C8"/>
      </g>
      <g transform="translate(27 70)">
        <ellipse cy="2.6" rx="4.4" ry="4.8" fill="#F7C46C"/>
        <path d="M-3.4-6.4l1.5 3.2 -3-.3z" fill="#F7C46C"/><path d="M3.4-6.4l-1.5 3.2 3-.3z" fill="#F7C46C"/>
        <circle cy="-2.1" r="3.6" fill="#F7C46C"/>
        <circle cx="-1.3" cy="-2.4" r=".7" fill="#3A2A22"/><circle cx="1.3" cy="-2.4" r=".7" fill="#3A2A22"/>
      </g>
      <g stroke="#6B4A2F" strokeWidth="1.6"><path d="M84 62V44"/></g>
      <circle cx="84" cy="42" r="7.5" fill="url(#k5glow)"/>
      <ellipse cx="84" cy="42" rx="3.4" ry="4.2" fill="#E8564F"/>
      <rect x="80.6" y="41.2" width="6.8" height="1.7" fill="#FFF6E8"/>
      <circle cx="74" cy="24" r="12.5" fill="url(#k5glow)"/>
      <circle cx="74" cy="24" r="9" fill="#FFD76A"/>
      <text x="74" y="29.6" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#7A3E1E">3</text>
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
      <defs>
        <linearGradient id="s1sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fe3ff"/><stop offset="1" stopColor="#e6f8d4"/>
        </linearGradient>
        <linearGradient id="s1rb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6ec7"/><stop offset=".5" stopColor="#ffd23f"/><stop offset="1" stopColor="#4ad9e8"/>
        </linearGradient>
      </defs>
      <rect width="100" height="85" rx="12" fill="url(#s1sky)"/>
      <circle cx="15" cy="12" r="7" fill="#ffe9a2"/>
      <ellipse cx="80" cy="11" rx="10" ry="4.5" fill="#fff" opacity=".85"/>
      <rect x="20" y="6" width="60" height="76" rx="6" fill="#7d5230"/>
      <rect x="24" y="10" width="52" height="68" rx="3" fill="#4e3520"/>
      <g stroke="#fff" strokeWidth=".7" opacity=".18">
        <path d="M37 10V78M50 10V78M63 10V78"/>
      </g>
      <g stroke="#3d2f56" strokeWidth="1.3">
        <rect x="43" y="14" width="14" height="14" rx="4" fill="#ef8f33"/>
        <rect x="43" y="29" width="14" height="14" rx="4" fill="#f294bf"/>
        <rect x="43" y="44" width="14" height="14" rx="4" fill="#86c854"/>
      </g>
      <polygon points="46,14 50,9 54,14" fill="#ef8f33" stroke="#3d2f56" strokeWidth="1.1"/>
      <g stroke="#3d2f56" strokeWidth="1.3">
        <rect x="27" y="63" width="14" height="14" rx="4" fill="#f5d63c"/>
        <rect x="27" y="48" width="14" height="14" rx="4" fill="#86c854"/>
        <rect x="59" y="63" width="14" height="14" rx="4" fill="#a9764a"/>
        <rect x="43" y="63" width="14" height="14" rx="4" fill="#dedee0"/>
      </g>
      <g fill="#fff">
        <circle cx="46.5" cy="20" r="2"/><circle cx="53.5" cy="20" r="2"/>
        <circle cx="46.5" cy="35" r="2"/><circle cx="53.5" cy="35" r="2"/>
        <circle cx="30.5" cy="69" r="2"/><circle cx="37.5" cy="69" r="2"/>
        <circle cx="46.5" cy="69" r="2"/><circle cx="53.5" cy="69" r="2"/>
      </g>
      <g fill="#2b2440">
        <circle cx="47" cy="20.3" r="1"/><circle cx="54" cy="20.3" r="1"/>
        <circle cx="47" cy="35.3" r="1"/><circle cx="54" cy="35.3" r="1"/>
        <circle cx="31" cy="69.3" r="1"/><circle cx="38" cy="69.3" r="1"/>
        <circle cx="47" cy="69.3" r="1"/><circle cx="54" cy="69.3" r="1"/>
      </g>
      <circle cx="34" cy="55" r="6" fill="none" stroke="#ff3b3b" strokeWidth="2.6"/>
      <circle cx="34" cy="55" r="2.6" fill="#ffd23f"/>
      <circle cx="66" cy="55" r="6" fill="none" stroke="url(#s1rb)" strokeWidth="2.6"/>
      <circle cx="66" cy="55" r="2.6" fill="#fff"/>
      <path d="M50 60 L50 61" stroke="#fff" strokeWidth="1" opacity=".4"/>
      <polygon points="8,78 12,69 16,78" fill="#3f8a2f"/>
      <polygon points="86,79 90,70 94,79" fill="#3f8a2f"/>
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
      <defs>
        <linearGradient id="nekoSky2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a9e6ff"/><stop offset=".62" stopColor="#d9f4ff"/><stop offset="1" stopColor="#fff3c8"/>
        </linearGradient>
        <radialGradient id="nekoCalm" cx=".5" cy=".5" r=".5">
          <stop offset=".55" stopColor="#fff0b4" stopOpacity="0"/>
          <stop offset=".82" stopColor="#ffe89a" stopOpacity=".85"/>
          <stop offset="1" stopColor="#ffe89a" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100" height="85" rx="12" fill="url(#nekoSky2)"/>
      <g fill="#ffffff" opacity=".9"><ellipse cx="18" cy="15" rx="9" ry="4.4"/><ellipse cx="25" cy="16.6" rx="6" ry="3.4"/><ellipse cx="82" cy="12" rx="7.5" ry="3.8"/></g>
      <path d="M0 50 C20 41 34 49 50 46 C70 41 84 47 100 39 V85 H0Z" fill="#8ed07a"/>
      <path d="M0 62 C22 53 40 65 60 57 C77 50 89 55 100 51 V85 H0Z" fill="#69b96f"/>
      <path d="M0 74 C24 68 44 77 64 71 C80 66 91 69 100 67 V85 H0Z" fill="#55a25c"/>
      <ellipse cx="38" cy="70" rx="30" ry="15" fill="url(#nekoCalm)"/>
      <ellipse cx="38" cy="70" rx="21" ry="10" fill="none" stroke="#fff6cf" strokeWidth="1.6" opacity=".95"/>
      <ellipse cx="38" cy="70" rx="30" ry="14.6" fill="none" stroke="#ffe9a8" strokeWidth="1.3" opacity=".6"/>
      <g transform="translate(70 26) rotate(-12)">
        <ellipse cx="-5" cy="-3" rx="7" ry="7.6" fill="#ff8fb4"/>
        <ellipse cx="5" cy="-3" rx="7" ry="7.6" fill="#ffb6d5"/>
        <ellipse cx="-4" cy="5.4" rx="4.6" ry="5" fill="#fff0f6"/>
        <ellipse cx="4" cy="5.4" rx="4.6" ry="5" fill="#fff0f6"/>
        <rect x="-1.1" y="-8" width="2.2" height="15" rx="1.1" fill="#584a55"/>
        <path d="M-1 -8 L-4.5 -13 M1 -8 L4.5 -13" stroke="#584a55" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </g>
      <g transform="translate(56 40) rotate(9) scale(.66)">
        <ellipse cx="-5" cy="-3" rx="7" ry="7.6" fill="#ffe469"/>
        <ellipse cx="5" cy="-3" rx="7" ry="7.6" fill="#fff8cf"/>
        <ellipse cx="-4" cy="5.4" rx="4.6" ry="5" fill="#fff8cf"/>
        <ellipse cx="4" cy="5.4" rx="4.6" ry="5" fill="#fff8cf"/>
        <rect x="-1.1" y="-8" width="2.2" height="15" rx="1.1" fill="#584a55"/>
        <path d="M-1 -8 L-4.5 -13 M1 -8 L4.5 -13" stroke="#584a55" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </g>
      <ellipse cx="38" cy="72" rx="15" ry="4" fill="#3f7a48" opacity=".28"/>
      <path d="M50 68 q9 2 11 -6" fill="none" stroke="#d08c4a" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="36" cy="63" rx="14.5" ry="11" fill="#fbf0dc"/>
      <path d="M23 60 a14.5 11 0 0 1 12 -8 l0 16 a14.5 11 0 0 1 -12 -8Z" fill="#d08c4a" opacity=".55"/>
      <path d="M27 46 L23.5 34 L34 42Z" fill="#d08c4a"/>
      <path d="M45 46 L48.5 34 L38 42Z" fill="#d08c4a"/>
      <path d="M28 45 L26 38 L32 43Z" fill="#ff9ec0"/>
      <path d="M44 45 L46 38 L40 43Z" fill="#ff9ec0"/>
      <circle cx="36" cy="49" r="12.5" fill="#fbf0dc"/>
      <path d="M23.5 48 a12.5 12.5 0 0 1 9 -11.7 l0 8Z" fill="#d08c4a" opacity=".5"/>
      <ellipse cx="31" cy="48.5" rx="3.4" ry="4.2" fill="#ffffff"/>
      <ellipse cx="41" cy="48.5" rx="3.4" ry="4.2" fill="#ffffff"/>
      <circle cx="31" cy="49" r="2.5" fill="#4a8f5f"/>
      <circle cx="41" cy="49" r="2.5" fill="#4a8f5f"/>
      <circle cx="31" cy="49" r="1.1" fill="#2e2833"/>
      <circle cx="41" cy="49" r="1.1" fill="#2e2833"/>
      <circle cx="32" cy="47.8" r=".7" fill="#ffffff"/>
      <circle cx="42" cy="47.8" r=".7" fill="#ffffff"/>
      <path d="M36 54 l-2 1.6 h4 z" fill="#ff9ec0"/>
      <path d="M36 56.4 q-2.4 2.4 -4.6 .3 M36 56.4 q2.4 2.4 4.6 .3" fill="none" stroke="#a08b93" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M23 50 h-6 M23 54 h-6 M49 50 h6 M49 54 h6" stroke="#efe3d4" strokeWidth="1.1" strokeLinecap="round"/>
      <g transform="translate(36 33)">
        <ellipse cx="-3.4" cy="-1.6" rx="4.4" ry="4.8" fill="#8fd4ff"/>
        <ellipse cx="3.4" cy="-1.6" rx="4.4" ry="4.8" fill="#cdeeff"/>
        <ellipse cx="-2.7" cy="3.2" rx="3" ry="3.2" fill="#e4f6ff"/>
        <ellipse cx="2.7" cy="3.2" rx="3" ry="3.2" fill="#e4f6ff"/>
        <rect x="-.8" y="-5" width="1.6" height="9.6" rx=".8" fill="#584a55"/>
      </g>
      <g fill="#ffd76a"><circle cx="10" cy="76" r="2.6"/><circle cx="14" cy="72" r="2.6"/><circle cx="18" cy="76" r="2.6"/><circle cx="14" cy="76" r="1.8" fill="#ff9ec4"/></g>
      <g fill="#ff9ec4"><circle cx="86" cy="72" r="2.4"/><circle cx="90" cy="68" r="2.4"/><circle cx="94" cy="72" r="2.4"/><circle cx="90" cy="72" r="1.6" fill="#fff3c4"/></g>
      <g fill="#ffffff" opacity=".9"><circle cx="62" cy="58" r="1.5"/><circle cx="70" cy="50" r="1.1"/><circle cx="26" cy="24" r="1.3"/></g>
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
  g_pokopoko: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyPoko" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd8f5"/>
          <stop offset="1" stopColor="#d8f4ff"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="85" rx="12" fill="url(#skyPoko)"/>
      <circle cx="82" cy="16" r="9" fill="#ffd24d"/>
      <ellipse cx="18" cy="14" rx="10" ry="4.5" fill="#fff" opacity=".85"/>
      <ellipse cx="50" cy="72" rx="46" ry="14" fill="#4fb3e0"/>
      <path d="M6 62 Q50 42 94 62 L94 78 A16 16 0 0 1 78 94 H22 A16 16 0 0 1 6 78 Z" fill="#8fd66b"/>
      <path d="M6 62 Q50 42 94 62 L94 68 Q50 50 6 68 Z" fill="#f3e0a8"/>
      <g transform="translate(30 46)">
        <rect x="-2.5" y="0" width="5" height="22" rx="2" fill="#a9713f"/>
        <path d="M0 0 Q-14 -6 -18 -16 Q-6 -14 0 -2 Z" fill="#5a9e3d"/>
        <path d="M0 0 Q14 -6 18 -16 Q6 -14 0 -2 Z" fill="#6fb54e"/>
        <path d="M0 0 Q-4 -14 0 -22 Q4 -14 0 0 Z" fill="#82c661"/>
      </g>
      <g transform="translate(68 58)">
        <circle r="7" fill="#ff8a3c"/>
        <path d="M0 -7 Q2 -11 5 -10" stroke="#5a9e3d" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      </g>
      <g transform="translate(52 67)">
        <path d="M-6 -6 L-8 -13 L-2 -8 Z" fill="#ffcf6b"/>
        <path d="M6 -6 L8 -13 L2 -8 Z" fill="#ffcf6b"/>
        <circle cx="0" cy="-1" r="7" fill="#fff6e0" stroke="#e0b96b" strokeWidth="1.5"/>
        <circle cx="-2.5" cy="-2" r="1.2" fill="#2a2440"/>
        <circle cx="2.5" cy="-2" r="1.2" fill="#2a2440"/>
        <path d="M-1.5 1.5 Q0 3 1.5 1.5" stroke="#2a2440" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  ),
  g_ofuro: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="76" rx="42" ry="8" fill="#BFEAF5" opacity=".55"/><path d="M10 44h80v14a20 20 0 0 1-20 20H30A20 20 0 0 1 10 58z" fill="#F6FBFE" stroke="#9FC7D8" strokeWidth="2"/><rect x="8" y="40" width="84" height="8" rx="4" fill="#BFEAF5" stroke="#8FBFD2" strokeWidth="1.5"/><ellipse cx="50" cy="34" rx="20" ry="18" fill="#F3D9A8" stroke="#D9B478" strokeWidth="2"/><ellipse cx="34" cy="20" rx="7" ry="9" fill="#D9B478"/><ellipse cx="66" cy="20" rx="7" ry="9" fill="#D9B478"/><ellipse cx="50" cy="38" rx="8" ry="6" fill="#FFF3DE"/><ellipse cx="50" cy="35" rx="3" ry="2.4" fill="#5A4636"/><path d="M40 28q4-4 8 0M54 28q4-4 8 0" stroke="#3A2C22" strokeWidth="2.6" fill="none" strokeLinecap="round"/><circle cx="20" cy="24" r="7" fill="#fff" opacity=".92"/><circle cx="80" cy="16" r="5.5" fill="#fff" opacity=".9"/></svg>
  ),
  g_kotsu: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="85" rx="12" fill="#7FD1F5"/>
      <circle cx="82" cy="14" r="9" fill="#FFE27A"/>
      <ellipse cx="18" cy="18" rx="13" ry="7" fill="#fff" opacity=".9"/>
      <ellipse cx="30" cy="14" rx="9" ry="5.4" fill="#fff" opacity=".85"/>
      <rect x="0" y="46" width="100" height="24" fill="#5B6270"/>
      <rect x="0" y="70" width="100" height="15" fill="#8FC47A"/>
      <rect x="10" y="50" width="9" height="16" fill="#F4F1E6"/>
      <rect x="27" y="50" width="9" height="16" fill="#F4F1E6"/>
      <rect x="44" y="50" width="9" height="16" fill="#F4F1E6"/>
      <rect x="61" y="50" width="9" height="16" fill="#F4F1E6"/>
      <rect x="78" y="50" width="9" height="16" fill="#F4F1E6"/>
      <g transform="translate(14 26)">
        <rect x="-3" y="10" width="6" height="20" rx="2" fill="#8A93A3"/>
        <rect x="-9" y="0" width="18" height="24" rx="5" fill="#3C4453"/>
        <circle cx="0" cy="6" r="5" fill="#E4423E"/>
        <circle cx="0" cy="16" r="5" fill="#4CAF63"/>
      </g>
      <g transform="translate(70 54)">
        <rect x="-16" y="-4" width="34" height="13" rx="6" fill="#F26B4B"/>
        <rect x="-11" y="-11" width="20" height="9" rx="4" fill="#F8DDE0"/>
        <circle cx="-8" cy="10" r="5.2" fill="#3C4453"/>
        <circle cx="12" cy="10" r="5.2" fill="#3C4453"/>
      </g>
      <g transform="translate(24 58)">
        <ellipse cx="0" cy="14" rx="10" ry="3" fill="#3a4a20" opacity=".2"/>
        <rect x="-6" y="-2" width="12" height="14" rx="4" fill="#4AA3E0"/>
        <circle cx="0" cy="-10" r="8.4" fill="#F4A95C"/>
        <circle cx="-3.4" cy="-11" r="1.3" fill="#3a2a10"/>
        <circle cx="3.4" cy="-11" r="1.3" fill="#3a2a10"/>
        <path d="M-3 -6.5q3 2.6 6 0" stroke="#a8565a" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <ellipse cx="-6.6" cy="-8" rx="2.2" ry="1.6" fill="#ffb6c1"/>
        <ellipse cx="6.6" cy="-8" rx="2.2" ry="1.6" fill="#ffb6c1"/>
      </g>
    </svg>
  ),
};

/* ════════════════════════════════════════════════════
   ① 更新日時（手動で更新する定数）
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
  { id:'g5', route:'/kazu-asobi',      icon:'🏮', num:5, color:'#5B3A82', stars:3, isNew:true, category:'かずあそび',
    ja:{ name:'かずあそび',         desc:'かぞえて ぴょん！\nおまつりへの みち'            },
    en:{ name:'Number Fun',           desc:'Count and hop along\nthe festival road!'       },
    zh:{ name:'数字游戏',             desc:'一边数一边跳！\n走向夜晚的祭典'                 },
    ko:{ name:'숫자 놀이',             desc:'세면서 폴짝!\n축제로 가는 길'                  },
    es:{ name:'Juego de Números',      desc:'¡Cuenta y salta por\nel camino del festival!'  } },
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
    ja:{ name:'さんすうトレイン3D', desc:'＋ － × ÷ を あそんで おぼえる\nどうぶつを のせて はっしゃ！\n4ろせん・32のえき' },
    en:{ name:'Math Train 3D',       desc:'Learn + - × ÷ by playing!\nLoad the animals and go!\n4 routes, 32 stations'   },
    zh:{ name:'算术列车3D',           desc:'边玩边学 ＋ － × ÷\n载上动物，发车出发！\n4条路线・32个车站'                    },
    ko:{ name:'산수 기차 3D',          desc:'＋ － × ÷ 를 놀며 배워요\n동물을 태우고 출발!\n4개 노선・32개 역'              },
    es:{ name:'Tren de Matemáticas 3D', desc:'¡Aprende + - × ÷ jugando!\n¡Sube a los animales y sal!\n4 rutas, 32 estaciones' } },
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
  { id:'g_pokopoko', route:'/pokopoko-island', icon:'🏝️', num:26, color:'#ef8fae', stars:5, isNew:true, category:'そうぞう',
    ja:{ name:'ポコポコアイランド', desc:'フルーツと どうぶつと\nじぶんだけの 3Dしま！' },
    en:{ name:'Pokopoko Island', desc:'Build your own 3D island\nwith fruit and animal friends!' },
    zh:{ name:'啵咕啵咕岛', desc:'收集水果和动物朋友，\n打造自己的3D小岛！' },
    ko:{ name:'포코포코 아일랜드', desc:'과일과 동물 친구와 함께\n나만의 3D 섬을 만들어요!' },
    es:{ name:'Isla Pokopoko', desc:'¡Crea tu isla 3D con\nfrutas y amigos animales!' } },
  { id:'g_ofuro', route:'/ofuro', icon:'🛁', num:27, color:'#7FD8F5', stars:5, isNew:true, category:'そうぞう',
    ja:{ name:'あわあわおふろやさん', desc:'あわあわで ゴシゴシ！\nどうぶつを ピカピカに' },
    en:{ name:'Bubbly Bath House', desc:'Scrub with fluffy suds\nand make animals sparkle!' },
    zh:{ name:'泡泡澡堂', desc:'用泡泡搓一搓，\n把动物洗得亮晶晶！' },
    ko:{ name:'거품 목욕탕', desc:'거품으로 문질문질!\n동물을 반짝반짝하게' },
    es:{ name:'Baño de Burbujas', desc:'¡Frota con espuma\ny deja a los animales brillantes!' } },
  { id:'g_kotsu', route:'/kotsu-safety', icon:'🚦', num:28, color:'#F26B4B', stars:5, isNew:true, category:'がくしゅう',
    ja:{ name:'とまって みて わたろう', desc:'とまる・みる・まつを れんしゅう！\nしんごうを まもって わたろう' },
    en:{ name:'Stop, Look & Cross', desc:'Practice stop, look, wait!\nCross safely at the signal' },
    zh:{ name:'停下 看看 再过马路', desc:'练习停下、观察、等待！\n遵守信号灯安全过马路' },
    ko:{ name:'멈추고 보고 건너요', desc:'멈추고 보고 기다리기 연습!\n신호를 지키며 건너요' },
    es:{ name:'Para, mira y cruza', desc:'¡Practica parar, mirar y esperar!\nCruza con seguridad en el semáforo' } },
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
  { id:'s1', route:'/animal-block', icon:'🧱', num:1, color:'#4a90ff', stars:5, isNew:true, category:'パズル',
    ja:{ name:'どうぶつブロック', desc:'おちてくるどうぶつを\n3つならべてけそう！\nばくだんでだいれんさ！' },
    en:{ name:'Animal Blocks',   desc:'Line up 3 falling\nanimals to clear!\nBombs make combos!' },
    zh:{ name:'动物方块',         desc:'把掉落的动物\n三个排成一列消除！\n炸弹引发大连锁！' },
    ko:{ name:'동물 블록',         desc:'떨어지는 동물을\n3개 맞춰 없애요!\n폭탄으로 대연쇄!' },
    es:{ name:'Bloques Animal',   desc:'¡Alinea 3 animales\nque caen para borrar!\n¡Bombas y combos!' } },
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
    ja:{ name:'きらきらドライブ',  desc:'6つのコースをたびしよう！\nけしきはまいかいかわるよ' },
    en:{ name:'Neon Drive',        desc:'Journey across 6 courses.\nThe scenery changes every time!' },
    zh:{ name:'霓虹夜间兜风',       desc:'畅游6条路线，\n每次风景都不一样！' },
    ko:{ name:'반짝반짝 드라이브', desc:'6개 코스를 여행해요.\n풍경이 매번 달라져요!' },
    es:{ name:'Paseo de Neón',     desc:'¡Viaja por 6 rutas!\n¡El paisaje cambia cada vez!' } },
  { id:'g_astral', route:'/astral-fang', icon:'🌟', num:23, color:'#7cecff', stars:5, isNew:true, category:'アクション',
    ja:{ name:'ほしぞらアニマルレスキュー', desc:'ゆびで そらを とんで\nどうぶつの ぎょうれつを つくろう！' },
    en:{ name:'Starry Animal Rescue',       desc:'Glide with one finger\nand lead a parade of animals!' },
    zh:{ name:'星空动物救援队',             desc:'用手指在夜空飞行，\n带上小动物大队伍！' },
    ko:{ name:'별빛 동물 구조대',           desc:'손가락으로 밤하늘을 날아\n동물 행렬을 만들어요!' },
    es:{ name:'Rescate Animal Estelar',     desc:'¡Vuela con un dedo\ny forma un desfile de animales!' } },
  { id:'g_block', route:'/block', icon:'🏰', num:10, color:'#ec407a', stars:3, isNew:true, category:'アクション',
    ja:{ name:'おしろブロックくずし', desc:'３Dのおしろで ボールをはじいて\nボスをたおそう！' },
    en:{ name:'Castle Breakout',   desc:'Bounce the ball in 3D castles\nand beat the bosses!' },
    zh:{ name:'城堡打砖块',         desc:'在3D城堡中弹球\n打败头目！' },
    ko:{ name:'성 벽돌깨기',        desc:'3D 성에서 공을 튕겨\n보스를 물리쳐요!' },
    es:{ name:'Rompe Castillo',    desc:'¡Rebota la pelota en castillos 3D\ny vence a los jefes!' } },
  { id:'g_mahoumeiro', route:'/mahou-meiro', icon:'🔮', num:17, color:'#7e57c2', stars:4, isNew:true, category:'パズル',
    ja:{ name:'まほうのめいろ', desc:'3つのせかいをめぐって\nまいごのようせいをたすけよう！' },
    en:{ name:'Magic Maze', desc:'Explore three worlds and\nrescue the lost fairies!' },
    zh:{ name:'魔法迷宫', desc:'穿越三个世界\n拯救迷路的小精灵！' },
    ko:{ name:'마법의 미로', desc:'세 개의 세계를 지나\n길 잃은 요정을 구해요!' },
    es:{ name:'Laberinto Mágico', desc:'¡Recorre tres mundos y\nrescata a las hadas perdidas!' } },
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
  { id:'g_neko', route:'/neko-chou', icon:'🐱', num:13, color:'#69b96f', stars:5, isNew:true, category:'アクション',
    ja:{ name:'ねことちょうちょ 〜はなぞののひみつ〜', desc:'とまって まっていると\nちょうちょが あそびに くるよ！' },
    en:{ name:'Cat & Butterflies: Garden Secret', desc:'Stay still and wait —\nthe butterflies come to you!' },
    zh:{ name:'猫咪与蝴蝶：花园的秘密', desc:'静静地停下来等待\n蝴蝶就会飞过来！' },
    ko:{ name:'고양이와 나비: 정원의 비밀', desc:'멈춰서 기다리면\n나비가 놀러 와요!' },
    es:{ name:'Gato y Mariposas: Secreto del Jardín', desc:'Quédate quieto y espera:\n¡las mariposas vendrán a ti!' } },
  { id:'g_mahounakama', route:'/mahou-nakama', icon:'🪄', num:18, color:'#7fa8ff', stars:4, isNew:true, category:'アクション',
    ja:{ name:'まほうのなかまたい', desc:'ステッキでポン！モンスターを\nなかまにして すすもう！' },
    en:{ name:'Magic Friend Squad',  desc:'Tap monsters with your wand\nand make them your friends!' },
    zh:{ name:'魔法伙伴小队',        desc:'用魔法棒轻轻一点，\n把怪物变成伙伴！' },
    ko:{ name:'마법 친구 부대',      desc:'마법 지팡이로 콩!\n몬스터를 친구로 만들자!' },
    es:{ name:'Escuadrón Mágico',    desc:'¡Toca monstruos con tu varita\ny hazlos tus amigos!' } },
  { id:'g_kyoshitsu', route:'/sora-kyoshitsu', icon:'🎈', num:20, color:'#5ecbf7', stars:5, isNew:true, category:'アクション',
    ja:{ name:'そらのきょうしつ',   desc:'3Dのそらを ゆびひとつで！\n15ステージの フライトぼうけん' },
    en:{ name:'Sky Class',          desc:'One-finger 3D flying!\n15 stages of sky adventure' },
    zh:{ name:'天空教室',            desc:'一根手指畅游3D天空！\n15个关卡的飞行冒险' },
    ko:{ name:'하늘 교실',          desc:'손가락 하나로 3D 하늘을!\n15스테이지 비행 모험' },
    es:{ name:'Clase del Cielo',     desc:'¡Vuela en 3D con un dedo!\n15 niveles de aventura' } },
  { id:'g_otakara', route:'/otakara-horihori', icon:'⛏️', num:19, color:'#b06a3b', stars:4, isNew:true, category:'アクション',
    ja:{ name:'おたからほりほり', desc:'おたから ぜんぶ？ キツネ ぜんぶ？\nどちらでも クリアの 3Dアクション' },
    en:{ name:'Treasure Digger',   desc:'Collect every gem or bury every fox\ntwo ways to win!' },
    zh:{ name:'挖挖小宝藏',        desc:'集齐宝藏，或把狐狸全埋掉，\n两种通关方式！' },
    ko:{ name:'보물 파기',          desc:'보물을 모두 모으거나 여우를 모두 묻거나\n클리어 방법은 두 가지!' },
    es:{ name:'Cava Tesoros',      desc:'Reúne las gemas o entierra los zorros:\n¡dos formas de ganar!' } },
  { id:'g_okashi', route:'/okashi-crossing', icon:'🍭', num:16, color:'#ff9ecb', stars:5, isNew:true, category:'アクション',
    ja:{ name:'ぴょんぴょん！おかしのくに', desc:'3Dのおかしのくにを 大ぼうけん！\nぶつかってもへいき、12ステージ！' },
    en:{ name:'Hop-Hop Sweets World', desc:'A 3D candy-world adventure!\n12 stages—bumps send you back safely.' },
    zh:{ name:'蹦蹦跳跳甜点王国',     desc:'3D甜点王国大冒险！\n12个关卡，撞到了也不要紧。' },
    ko:{ name:'깡충깡충 과자나라',    desc:'3D 과자나라 대모험!\n부딪혀도 괜찮아, 12스테이지!' },
    es:{ name:'Saltitos por Dulcelandia', desc:'¡Aventura 3D en Dulcelandia!\n12 niveles; los golpes te devuelven a salvo.' } },
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

/* フィルターは棚定義から派生させ、分類ルールを一元化する(v2: 絵で分かる6カテゴリ)。 */
const CATEGORY_LABELS = {
  asobu:    {ja:'うごく',     en:'Move',   zh:'活动',   ko:'움직이기', es:'Moverse'},
  nerau:    {ja:'ねらう',     en:'Aim',    zh:'瞄准',   ko:'조준하기', es:'Apuntar'},
  race:     {ja:'はしる',     en:'Race',   zh:'竞速',   ko:'달리기',   es:'Correr'},
  kangaeru: {ja:'かんがえる', en:'Think',  zh:'思考',   ko:'생각하기', es:'Pensar'},
  tsukuru:  {ja:'つくる',     en:'Create', zh:'创造',   ko:'만들기',   es:'Crear'},
  manabu:   {ja:'まなぶ',     en:'Learn',  zh:'学习',   ko:'배우기',   es:'Aprender'},
};
const CATEGORY_FILTERS = [
  { key:'all', match:() => true,
    label:{ja:'ぜんぶ', en:'All', zh:'全部', ko:'전체', es:'Todos'} },
  ...SHELF_GROUPS.map(g => ({ key:g.key, match:g.match, label:CATEGORY_LABELS[g.key] })),
];
/* 2段目: あたらしい/あそんだ/年齢。年齢の分類ロジックはAGE_FILTERSを再利用する。 */
const NEW_FILTER   = { key:'new',    label:{ja:'あたらしい', en:'New',    zh:'新作',   ko:'새로운',   es:'Nuevo'},  match:g => g.isNew };
const PLAYED_FILTER = (playHist) => ({ key:'played', label:{ja:'あそんだ', en:'Played', zh:'玩过',   ko:'플레이함', es:'Jugado'}, match:g => !!playHist[g.route] });

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

const THUMB_ALIASES = {
  '/sora': 'sora',
  '/shooting': 'shooting',
  '/sniper': 'sniper',
};
const NO_THUMB_ROUTES = new Set([
  '/moji',
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

function CloseIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

/* ── ルーレット/ずかん用の簡易アートスロット(サムネイル→SVG→アイコンの順にフォールバック) ── */
function GameArt({ game }) {
  const thumb = thumbFor(game);
  return (
    <div className="tp-art">
      {GAME_SVGS[game.id] || null}
      {thumb && (
        <img src={thumb} alt="" loading="lazy" decoding="async"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      )}
    </div>
  );
}

const LANG_LABELS = { ja: 'JA', en: 'EN', zh: '中文', ko: '한국어', es: 'ES' };
const LANG_NAMES  = {
  ja: { ja: '日本語', en: 'Japanese', zh: '日语', ko: '일본어', es: 'Japonés' },
  en: { ja: '英語', en: 'English', zh: '英语', ko: '영어', es: 'Inglés' },
  zh: { ja: '中国語', en: 'Chinese', zh: '中文', ko: '중국어', es: 'Chino' },
  ko: { ja: '韓国語', en: 'Korean', zh: '韩语', ko: '한국어', es: 'Coreano' },
  es: { ja: 'スペイン語', en: 'Spanish', zh: '西班牙语', ko: '스페인어', es: 'Español' },
};
const LANG_ORDER = ['ja', 'en', 'zh', 'ko', 'es'];

/* ── おうちの人パネル: BGM / 言語 / 保護者向けリンクをここへ集約 ── */
function UtilityPanel({ lang, isMuted, onToggleMute, onChangeLang, onClose, onNavigate }) {
  return (
    <div
      className="tp-roulette-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchEnd={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="tp-utility-box" role="dialog" aria-modal="true" aria-label={lang === 'en' ? 'For families' : 'おうちの人'}>
        <div className="tp-roulette-title">{{ja:'おうちの人へ', en:'For families', zh:'给家长', ko:'보호자님께', es:'Para familias'}[lang] || 'おうちの人へ'}</div>

        <div className="tp-utility-row">
          <span>{{ja:'おんがく', en:'Music', zh:'音乐', ko:'음악', es:'Música'}[lang] || 'おんがく'}</span>
          <button className="tp-utility-toggle" aria-pressed={!isMuted} onClick={onToggleMute}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 7v6h3l5 4V3L7 7Z" fill="#5E7290" />
              {!isMuted && <path d="M14 6 Q17 10 14 14" stroke="#5E7290" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
              {isMuted && <path d="M15 7 L19 13 M19 7 L15 13" stroke="#F2647F" strokeWidth="1.8" strokeLinecap="round" />}
            </svg>
            {isMuted ? ({ja:'オフ', en:'Off', zh:'关闭', ko:'꺼짐', es:'Apagado'}[lang] || 'オフ') : ({ja:'オン', en:'On', zh:'开启', ko:'켜짐', es:'Encendido'}[lang] || 'オン')}
          </button>
        </div>

        <div className="tp-utility-row tp-utility-row--lang">
          <span>{{ja:'げんご', en:'Language', zh:'语言', ko:'언어', es:'Idioma'}[lang] || 'げんご'}</span>
          <div className="tp-utility-langs">
            {LANG_ORDER.map(code => (
              <button
                key={code}
                className={`tp-utility-lang${lang === code ? ' tp-utility-lang--on' : ''}`}
                aria-pressed={lang === code}
                aria-label={LANG_NAMES[code][lang] || LANG_NAMES[code].ja}
                onClick={() => onChangeLang(code)}
              >
                {LANG_LABELS[code]}
              </button>
            ))}
          </div>
        </div>

        <div className="tp-utility-links">
          <button className="tp-footer-link" onClick={() => onNavigate('/parents')}>
            {{ja:'保護者の方へ', en:'For parents', zh:'致家长', ko:'보호자 안내', es:'Para familias'}[lang] || '保護者の方へ'}
          </button>
          <button className="tp-footer-link" onClick={() => onNavigate('/privacy')}>
            {{ja:'プライバシーポリシー', en:'Privacy Policy', zh:'隐私政策', ko:'개인정보 처리방침', es:'Privacidad'}[lang] || 'プライバシーポリシー'}
          </button>
          <button className="tp-footer-link" onClick={() => onNavigate('/terms')}>
            {{ja:'利用規約', en:'Terms of Use', zh:'使用条款', ko:'이용약관', es:'Términos'}[lang] || '利用規約'}
          </button>
        </div>

        <button className="tp-roulette-close" onClick={onClose}><CloseIcon /> {{ja:'とじる', en:'Close', zh:'关闭', ko:'닫기', es:'Cerrar'}[lang] || 'とじる'}</button>
      </div>
    </div>
  );
}

/* SSR/リロード間で島棚の並びを保持する(SPA内でTopへ戻っても同じ並び、
   フルリロードでのみ新しい並びになる)。SSR初期値は必ず元配列順。 */
let _topGameOrderCache = null;

/* ════════════════════════════════════════════════════
   TopPage 本体
════════════════════════════════════════════════════ */
export default function TopPage() {
  const navigate = useNavigate();

  /* SSR安全のため、端末情報・localStorage依存の値は全て決定的な初期値にし、
     実際の値はマウント後のuseEffectで読み込む。 */
  const [lang,         setLang]        = useState('ja');
  const [isMuted,      setIsMuted]     = useState(false);
  const [_playCount,   setPlayCount]   = useState(0);
  const [kisekaeState, setKisekaeState]= useState(() => normalizeKisekaeState(null));
  const [panelOpen,    setPanelOpen]   = useState(false);
  const [panelChara,   setPanelChara]  = useState('princess');
  const [shopOpen,     setShopOpen]    = useState(false);
  const [utilityOpen,  setUtilityOpen] = useState(false);
  const [coins,        setCoins]       = useState(0);
  const [loginBonus,   setLoginBonus]  = useState(null);
  const [recentRoutes, setRecentRoutes]= useState([]);
  const [playHist,     setPlayHist]    = useState({});
  const [games,        setGames]       = useState(ALL_SHELF_GAMES);

  // 引っ張って更新(フルスクリーンPWA向け)
  const { pull, ready } = usePullToRefresh(() => window.location.reload());

  /* マウント後にのみ端末のlocalStorageを読み込む(ハイドレーション不一致防止)。
     並びは初回のみFisher-Yatesでシャッフルし、以降はモジュールスコープの
     キャッシュを再利用する(SPA内で戻っても同じ並び、フルリロードで新しい並び)。 */
  useEffect(() => {
    const savedLang = localStorage.getItem('wakuwaku_lang');
    if (savedLang) {
      setLang(savedLang);
    } else {
      const detected = detectLang();
      localStorage.setItem('wakuwaku_lang', detected);
      setLang(detected);
    }

    setIsMuted(localStorage.getItem('wakuwaku_bgm') === 'off');
    setCoins(getCoins());
    setRecentRoutes(getRecentGames());
    setPlayHist(getPlayHistory());

    try {
      const saved = localStorage.getItem('kisekae_state');
      const loaded = normalizeKisekaeState(saved ? JSON.parse(saved) : null);
      const { state: synced, newlyUnlocked } = syncSpecialUnlocks(loaded);
      if (newlyUnlocked.length > 0) {
        localStorage.setItem('kisekae_state', JSON.stringify(synced));
      }
      setKisekaeState(synced);
    } catch { /* storage remains optional */ }

    if (!_topGameOrderCache) _topGameOrderCache = shuffleOnce(ALL_SHELF_GAMES);
    setGames(_topGameOrderCache);

    if (localStorage.getItem('wakuwaku_bgm') !== 'off') startBGM();
    setPlayCount(getPlayCount() + 1312);
    const bonus = checkLoginBonus();
    if (bonus) setLoginBonus(bonus);
    return () => stopBGM();
  }, []);

  // 最近遊んだゲームの先頭 = 「つづきから」の対象
  const resumeGame = recentRoutes.length
    ? ALL_SHELF_GAMES.find(g => g.route === recentRoutes[0]) || null
    : null;

  function handleMuteToggle() {
    toggleBGM();
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('wakuwaku_bgm', next ? 'off' : 'on');
      return next;
    });
  }

  function handleLangChange(next) {
    setLang(next);
    localStorage.setItem('wakuwaku_lang', next);
  }

  function openKisekaePanel(chara) {
    setPanelChara(chara || 'princess');
    setPanelOpen(true);
  }

  function handlePlay(game, e) {
    const x = e?.clientX, y = e?.clientY;
    transitionTo(navigate, game.route, x, y, { name:(game[lang] || game.ja).name, category:game.category, sourceContext:'top_list' });
  }

  function scrollToGames() {
    const el = document.getElementById('games');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  function openZukan() {
    setPlayHist(getPlayHistory());
    setZukanOpen(true);
  }

  // 保存(claim)はここで即実行する。モーダル自身は「ありがとう!」を見せてから
  // 自ら onDismiss を呼ぶので、ここではcoins stateの更新だけ行い閉じない。
  function handleLoginBonusClaim() {
    const result = claimLoginBonus();
    if (result) setCoins(result.coins);
  }

  function handleKisekaeChange(next) {
    setKisekaeState(next);
    localStorage.setItem('kisekae_state', JSON.stringify(next));
  }

  const subFilters = [
    { key:'all', label:{ja:'ぜんぶ', en:'All', zh:'全部', ko:'전체', es:'Todos'}, match:() => true },
    NEW_FILTER,
    PLAYED_FILTER(playHist),
    ...AGE_FILTERS.slice(1),
  ];

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

      <IslandHero
        lang={lang}
        coins={coins}
        resumeGame={resumeGame}
        kisekaeState={kisekaeState}
        onOpenKisekaeChara={openKisekaePanel}
        onCoinChipClick={() => setShopOpen(true)}
        onDressUpClick={() => openKisekaePanel('princess')}
        onFamilyClick={() => setUtilityOpen(true)}
        onResumeClick={(e) => resumeGame && handlePlay(resumeGame, e)}
        onCtaClick={scrollToGames}
      />

      <GameGrid
        lang={lang}
        games={games}
        playHist={playHist}
        categories={CATEGORY_FILTERS}
        subFilters={subFilters}
        thumbFor={thumbFor}
        ageText={ageText}
        cardGradients={CARD_GRADIENTS}
        defaultGradient={DEFAULT_GRADIENT}
        gameSvgs={GAME_SVGS}
        onPlay={handlePlay}
        onOpenRoulette={startRoulette}
        onOpenZukan={openZukan}
      />

      {/* ── おうちの方へ ── */}
      <section className="tp-parents" aria-label={lang === 'ja' ? 'おうちの方へ' : 'For parents'}>
        <div className="tp-parents-inner">
          <h3>{{ja:'おうちの方へ', en:'For families', zh:'致家长', ko:'보호자님께', es:'Para familias'}[lang] || 'おうちの方へ'}</h3>
          <div className="tp-parents-grid">
            <div className="tp-parents-item">
              <span className="tp-parents-ic" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.4" fill="none" stroke="#7B8BD4" strokeWidth="1.8" /><path d="M5 8 h6" stroke="#7B8BD4" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </span>
              <span><b>{{ja:'ずっと無料', en:'Always free', zh:'完全免费', ko:'완전 무료', es:'Siempre gratis'}[lang] || 'ずっと無料'}</b><small>{{ja:'課金要素はありません', en:'No in-app payments', zh:'无付费项目', ko:'과금 요소 없음', es:'Sin compras'}[lang] || '課金要素はありません'}</small></span>
            </div>
            <div className="tp-parents-item">
              <span className="tp-parents-ic" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8.5 L6.5 12 L13 4.5" stroke="#7B8BD4" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span><b>{{ja:'登録なし', en:'No sign-up', zh:'无需注册', ko:'가입 없음', es:'Sin registro'}[lang] || '登録なし'}</b><small>{{ja:'氏名・連絡先の入力なし', en:'No name or contact details required', zh:'无需提供姓名或联系方式', ko:'이름·연락처 입력 없음', es:'No pedimos nombre ni datos de contacto'}[lang] || '氏名・連絡先の入力なし'}</small></span>
            </div>
            <div className="tp-parents-item">
              <span className="tp-parents-ic" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 2 v8 M4.5 7 L8 10.5 L11.5 7" stroke="#7B8BD4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 13 h10" stroke="#7B8BD4" strokeWidth="2" strokeLinecap="round" /></svg>
              </span>
              <span><b>{{ja:'インストール不要', en:'No install', zh:'无需安装', ko:'설치 불필요', es:'Sin instalación'}[lang] || 'インストール不要'}</b><small>{{ja:'ブラウザだけで動きます', en:'Runs in the browser', zh:'仅需浏览器', ko:'브라우저만으로 OK', es:'Solo navegador'}[lang] || 'ブラウザだけで動きます'}</small></span>
            </div>
            <div className="tp-parents-item">
              <span className="tp-parents-ic" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 13 C3 9.5 2 7 3.4 5.2 A3.2 3.2 0 0 1 8 5.4 A3.2 3.2 0 0 1 12.6 5.2 C14 7 13 9.5 8 13 Z" fill="#7B8BD4" /></svg>
              </span>
              <span><b>{{ja:'こわい表現なし', en:'No scary content', zh:'无恐怖内容', ko:'무서운 표현 없음', es:'Sin contenido de miedo'}[lang] || 'こわい表現なし'}</b><small>{{ja:'ゲームオーバーもありません', en:'No game-overs', zh:'没有游戏结束', ko:'게임 오버도 없음', es:'Sin fin de partida'}[lang] || 'ゲームオーバーもありません'}</small></span>
            </div>
          </div>

          <div className="tp-footer-links">
            <button className="tp-footer-link" onClick={() => navigate('/parents')}>
              {{ja:'保護者の方へ', en:'For parents', zh:'致家长', ko:'보호자 안내', es:'Para familias'}[lang] || '保護者の方へ'}
            </button>
            <a className="tp-footer-link"
              href="https://robobella.wakuwakuislands.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('robobella_portal_click', { source_context:'footer', source_page:'/' })}>
              {{ja:'RoboBellaを見る', en:'Visit RoboBella', zh:'前往 RoboBella', ko:'RoboBella 보기', es:'Visitar RoboBella'}[lang] || 'RoboBellaを見る'}
            </a>
            <button className="tp-footer-link" onClick={() => navigate('/privacy')}>
              {{ja:'プライバシーポリシー', en:'Privacy Policy', zh:'隐私政策', ko:'개인정보 처리방침', es:'Privacidad'}[lang] || 'プライバシーポリシー'}
            </button>
            <button className="tp-footer-link" onClick={() => navigate('/terms')}>
              {{ja:'利用規約', en:'Terms of Use', zh:'使用条款', ko:'이용약관', es:'Términos'}[lang] || '利用規約'}
            </button>
          </div>
          <div className="tp-footer-meta">
            <span>© 2026 Wakuwaku Island</span>
            <span>v{__APP_VERSION__}</span>
          </div>
        </div>
      </section>

      {/* ── ルーレットオーバーレイ ── */}
      {rouletteOpen && (() => {
        const pool = ALL_SHELF_GAMES;
        const g = pool[rouletteIdx % pool.length];
        return (
          <div className="tp-roulette-overlay" onClick={() => { if (!rouletteSpin) closeRoulette(); }}>
            <div className="tp-roulette-box" onClick={(e) => e.stopPropagation()}>
              <div className="tp-roulette-title">
                {rouletteSpin
                  ? ({ja:'えらんでるよ…', en:'Picking…', zh:'选择中…', ko:'고르는 중…', es:'Eligiendo…'}[lang] || 'えらんでるよ…')
                  : ({ja:'きょうは これ！', en:'Today\'s pick!', zh:'今天玩这个！', ko:'오늘은 이거!', es:'¡Hoy toca este!'}[lang] || 'きょうは これ！')}
              </div>
              <div className={`tp-roulette-card${rouletteSpin ? ' tp-roulette-card--spin' : ' tp-roulette-card--win'}`}
                   style={{ background: CARD_GRADIENTS[g.category] || DEFAULT_GRADIENT }}>
                <div className="tp-roulette-art"><GameArt game={g} /></div>
                <div className="tp-roulette-name">{(g[lang] || g.ja).name}</div>
              </div>
              {!rouletteSpin && (
                <div className="tp-roulette-actions">
                  <button className="tp-roulette-play"
                    onClick={(e) => { closeRoulette(); handlePlay(g, e); }}>
                    ▶ {{ja:'これであそぶ！', en:'Play this!', zh:'就玩这个！', ko:'이걸로 놀기!', es:'¡Jugar!'}[lang] || 'これであそぶ！'}
                  </button>
                  <button className="tp-roulette-retry" onClick={startRoulette}>
                    {{ja:'もういっかい', en:'Again', zh:'再来一次', ko:'다시', es:'Otra vez'}[lang] || 'もういっかい'}
                  </button>
                  <button className="tp-roulette-close" onClick={closeRoulette}><CloseIcon /></button>
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
                {{ja:'スタンプずかん', en:'Stamp Book', zh:'印章图鉴', ko:'스탬프 도감', es:'Álbum de sellos'}[lang] || 'スタンプずかん'}
              </div>
              <div className="tp-zukan-progress">
                {complete
                  ? ({ja:'コンプリート！すごい！', en:'Complete! Amazing!', zh:'全部集齐！太棒了！', ko:'컴플리트! 대단해!', es:'¡Completo! ¡Increíble!'}[lang] || 'コンプリート！すごい！')
                  : `${got} / ${all.length}`}
              </div>
              <div className="tp-zukan-grid">
                {all.map(g => {
                  const played = !!playHist[g.route];
                  return (
                    <button key={g.route}
                      className={`tp-zukan-cell${played ? ' tp-zukan-cell--got' : ''}`}
                      style={played ? { background: CARD_GRADIENTS[g.category] || DEFAULT_GRADIENT } : undefined}
                      onClick={(e) => { setZukanOpen(false); handlePlay(g, e); }}>
                      <span className="tp-zukan-art">{played ? <GameArt game={g} /> : '？'}</span>
                      <span className="tp-zukan-name">{played ? (g[lang] || g.ja).name : '？？？'}</span>
                    </button>
                  );
                })}
              </div>
              <div className="tp-zukan-hint">
                {{ja:'あそぶと スタンプが もらえるよ！', en:'Play games to collect stamps!', zh:'玩游戏就能收集印章！', ko:'게임하면 스탬프를 모을 수 있어!', es:'¡Juega para conseguir sellos!'}[lang] || 'あそぶと スタンプが もらえるよ！'}
              </div>
              <button className="tp-roulette-close" onClick={() => setZukanOpen(false)}><CloseIcon /> {{ja:'とじる', en:'Close', zh:'关闭', ko:'닫기', es:'Cerrar'}[lang] || 'とじる'}</button>
            </div>
          </div>
        );
      })()}

      {/* ── おうちの人パネル ── */}
      {utilityOpen && (
        <UtilityPanel
          lang={lang}
          isMuted={isMuted}
          onToggleMute={handleMuteToggle}
          onChangeLang={handleLangChange}
          onClose={() => setUtilityOpen(false)}
          onNavigate={(route) => { setUtilityOpen(false); navigate(route); }}
        />
      )}

      {/* ── 着せ替えパネル ── */}
      {panelOpen && <KisekaePanel
        initialChara={panelChara}
        onClose={() => setPanelOpen(false)}
        kisekaeState={kisekaeState}
        onStateChange={handleKisekaeChange}
        lang={lang}
        onCoinsChange={setCoins}
      />}

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
          stampPos={loginBonus.stampPos}
          completedBefore={loginBonus.completedBefore}
          isBigGift={loginBonus.isBigGift}
          coinsBefore={coins}
          onClaim={handleLoginBonusClaim}
          onDismiss={() => setLoginBonus(null)}
          lang={lang}
        />
      )}

    </div>
  );
}
