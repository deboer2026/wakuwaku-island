import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { startBGM, stopBGM, toggleBGM } from '../utils/audio';
import { transitionTo } from '../utils/transition';
import { getPlayCount } from '../utils/playCounter';
import { KisekaeCharacters, KisekaePanel, DEFAULT_KISEKAE } from '../components/Kisekae';
import LoginBonus from '../components/LoginBonus';
import Shop from '../components/Shop';
import { getCoins, checkLoginBonus, claimLoginBonus } from '../utils/coins';
import { getRecentGames } from '../utils/recentGames';
import { ALL_GAMES } from '../utils/recommend';
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
];

/* ════════════════════════════════════════════════════
   ゲームSVGイラスト（SNES風）
════════════════════════════════════════════════════ */
const GAME_SVGS = {
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
  g3: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="6" width="84" height="76" rx="3" fill="rgba(0,0,0,.2)"/>
      <path d="M15 22L55 22L55 38L35 38L35 54L75 54L75 38L88 38" stroke="rgba(255,255,255,.25)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="88" cy="38" r="8" fill="#FFD700" stroke="#B8860B" strokeWidth="1.5"/>
      <text x="88" y="43" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">★</text>
      <ellipse cx="24" cy="68" rx="9" ry="10" fill="#F8C8D4" stroke="#C2185B" strokeWidth="1.5"/>
      <circle cx="24" cy="54" r="11" fill="#F8C8D4" stroke="#C2185B" strokeWidth="1.5"/>
      <ellipse cx="18" cy="42" rx="3.5" ry="7.5" fill="#F8C8D4" stroke="#C2185B" strokeWidth="1.5"/>
      <ellipse cx="18" cy="42" rx="2" ry="5" fill="#FFB6C1"/>
      <ellipse cx="30" cy="42" rx="3.5" ry="7.5" fill="#F8C8D4" stroke="#C2185B" strokeWidth="1.5"/>
      <ellipse cx="30" cy="42" rx="2" ry="5" fill="#FFB6C1"/>
      <circle cx="20" cy="53" r="2.8" fill="#1a1a2e"/>
      <circle cx="28" cy="53" r="2.8" fill="#1a1a2e"/>
      <circle cx="20.7" cy="52" r="1.1" fill="white"/>
      <circle cx="28.7" cy="52" r="1.1" fill="white"/>
      <ellipse cx="17" cy="57" rx="3" ry="2" fill="#FFB6C1" opacity=".7"/>
      <ellipse cx="31" cy="57" rx="3" ry="2" fill="#FFB6C1" opacity=".7"/>
      <path d="M21 59Q24 62 27 59" stroke="#C2185B" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="18" cy="78" rx="5.5" ry="3.5" fill="#F8C8D4" stroke="#C2185B" strokeWidth="1.5"/>
      <ellipse cx="30" cy="78" rx="5.5" ry="3.5" fill="#F8C8D4" stroke="#C2185B" strokeWidth="1.5"/>
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
      <circle cx="10" cy="10" r="1.8" fill="#FFD700" opacity=".6"/>
      <circle cx="88" cy="15" r="1.5" fill="white" opacity=".5"/>
      <rect x="60" y="38" width="32" height="34" rx="5" fill="#FF9800" stroke="#E65100" strokeWidth="2"/>
      <rect x="62" y="40" width="14" height="7" rx="2" fill="#FFCC02" opacity=".4"/>
      <text x="76" y="64" textAnchor="middle" fontSize="21" fontWeight="bold" fill="white">3</text>
      <rect x="8" y="38" width="32" height="34" rx="5" fill="#66BB6A" stroke="#2E7D32" strokeWidth="2"/>
      <rect x="10" y="40" width="14" height="7" rx="2" fill="#A5D6A7" opacity=".4"/>
      <text x="24" y="64" textAnchor="middle" fontSize="21" fontWeight="bold" fill="white">2</text>
      <rect x="26" y="22" width="48" height="50" rx="6" fill="#FF5252" stroke="#B71C1C" strokeWidth="2.5"/>
      <rect x="29" y="25" width="22" height="10" rx="3" fill="#FF8A80" opacity=".5"/>
      <text x="50" y="58" textAnchor="middle" fontSize="34" fontWeight="bold" fill="white">1</text>
      <circle cx="50" cy="12" r="10" fill="#FFD700" stroke="#B8860B" strokeWidth="2"/>
      <text x="50" y="17" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">★</text>
    </svg>
  ),
  g6: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="85" cy="12" r="2" fill="#FFD700" opacity=".6"/>
      <rect x="5" y="25" width="30" height="22" rx="2" fill="none" stroke="white" strokeWidth="2" opacity=".5"/>
      <rect x="5" y="25" width="30" height="3" rx="1" fill="white" opacity=".4"/>
      <line x1="12" y1="28" x2="12" y2="47" stroke="white" strokeWidth="1" opacity=".3"/>
      <line x1="19" y1="28" x2="19" y2="47" stroke="white" strokeWidth="1" opacity=".3"/>
      <line x1="26" y1="28" x2="26" y2="47" stroke="white" strokeWidth="1" opacity=".3"/>
      <line x1="5" y1="33" x2="35" y2="33" stroke="white" strokeWidth="1" opacity=".3"/>
      <line x1="5" y1="40" x2="35" y2="40" stroke="white" strokeWidth="1" opacity=".3"/>
      <circle cx="62" cy="52" r="22" fill="white" stroke="#333" strokeWidth="2"/>
      <polygon points="62,30 70,36 67,46 57,46 54,36" fill="#333" stroke="#333" strokeWidth=".5"/>
      <polygon points="83,42 84,52 75,58 68,52 70,42" fill="#333" stroke="#333" strokeWidth=".5"/>
      <polygon points="70,70 62,74 54,70 54,60 70,60" fill="#333" stroke="#333" strokeWidth=".5"/>
      <polygon points="40,42 43,52 52,58 52,46 46,38" fill="#333" stroke="#333" strokeWidth=".5"/>
      <ellipse cx="55" cy="36" rx="5" ry="3" fill="white" opacity=".5" transform="rotate(-20 55 36)"/>
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
      <rect x="6" y="8" width="16" height="11" rx="1" fill="#E53935" stroke="#B71C1C" strokeWidth="1"/>
      <rect x="6" y="8" width="16" height="3.5" fill="#E53935"/>
      <rect x="6" y="11.5" width="16" height="3.5" fill="white"/>
      <rect x="6" y="15" width="16" height="4" fill="#1565C0"/>
      <line x1="5" y1="7" x2="5" y2="25" stroke="#795548" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="52" cy="46" r="33" fill="#1565C0" stroke="#0D47A1" strokeWidth="2.5"/>
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
      <circle cx="78" cy="22" r="12" fill="rgba(255,255,255,.12)" stroke="white" strokeWidth="2"/>
      <circle cx="78" cy="22" r="8" fill="rgba(135,206,250,.25)" stroke="rgba(255,255,255,.4)" strokeWidth="1"/>
      <line x1="87" y1="31" x2="94" y2="39" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  g16: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <line x1="50" y1="3" x2="50" y2="14" stroke="#FFD700" strokeWidth="1.5" opacity=".5"/>
      <line x1="20" y1="12" x2="28" y2="20" stroke="#FFD700" strokeWidth="1.5" opacity=".4"/>
      <line x1="80" y1="12" x2="72" y2="20" stroke="#FFD700" strokeWidth="1.5" opacity=".4"/>
      <line x1="4" y1="38" x2="16" y2="38" stroke="#FFD700" strokeWidth="1.5" opacity=".4"/>
      <line x1="96" y1="38" x2="84" y2="38" stroke="#FFD700" strokeWidth="1.5" opacity=".4"/>
      <polygon points="50,12 68,34 50,56 32,34" fill="#B5EEFF" stroke="#0288D1" strokeWidth="2"/>
      <polygon points="50,12 68,34 50,34" fill="#E8FAFF"/>
      <polygon points="50,12 32,34 50,34" fill="#81D4FA"/>
      <polygon points="50,34 68,34 50,56" fill="#29B6F6"/>
      <polygon points="50,34 32,34 50,56" fill="#0288D1"/>
      <ellipse cx="43" cy="21" rx="5" ry="3" fill="white" opacity=".72" transform="rotate(-20 43 21)"/>
      <polygon points="22,52 34,66 22,80 10,66" fill="#FF5252" stroke="#B71C1C" strokeWidth="1.8"/>
      <polygon points="22,52 34,66 22,66" fill="#FF8A80"/>
      <polygon points="22,52 10,66 22,66" fill="#E53935"/>
      <polygon points="22,66 34,66 22,80" fill="#C62828"/>
      <polygon points="22,66 10,66 22,80" fill="#B71C1C"/>
      <ellipse cx="17" cy="59" rx="3" ry="2" fill="white" opacity=".6" transform="rotate(-20 17 59)"/>
      <polygon points="78,52 90,66 78,80 66,66" fill="#536DFE" stroke="#1A237E" strokeWidth="1.8"/>
      <polygon points="78,52 90,66 78,66" fill="#8C9EFF"/>
      <polygon points="78,52 66,66 78,66" fill="#3D5AFE"/>
      <polygon points="78,66 90,66 78,80" fill="#283593"/>
      <polygon points="78,66 66,66 78,80" fill="#1A237E"/>
      <ellipse cx="73" cy="59" rx="3" ry="2" fill="white" opacity=".6" transform="rotate(-20 73 59)"/>
      <circle cx="9" cy="24" r="2.5" fill="#FFD700" opacity=".7"/>
      <circle cx="90" cy="82" r="2" fill="#FFD700" opacity=".6"/>
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
  s5: (
    <svg viewBox="0 0 100 85" xmlns="http://www.w3.org/2000/svg">
      <circle cx="88" cy="12" r="2" fill="#FFD700" opacity=".6"/>
      <rect x="0" y="38" width="100" height="22" fill="#616161" stroke="#424242" strokeWidth="1"/>
      <rect x="8" y="47" width="12" height="4" rx="1" fill="white" opacity=".8"/>
      <rect x="30" y="47" width="12" height="4" rx="1" fill="white" opacity=".8"/>
      <rect x="52" y="47" width="12" height="4" rx="1" fill="white" opacity=".8"/>
      <rect x="74" y="47" width="12" height="4" rx="1" fill="white" opacity=".8"/>
      <rect x="55" y="28" width="38" height="18" rx="4" fill="#E53935" stroke="#B71C1C" strokeWidth="1.5"/>
      <rect x="60" y="20" width="26" height="10" rx="3" fill="#EF9A9A" stroke="#B71C1C" strokeWidth="1.2"/>
      <rect x="62" y="22" width="10" height="7" rx="1" fill="#B2EBF2" opacity=".8"/>
      <rect x="76" y="22" width="8" height="7" rx="1" fill="#B2EBF2" opacity=".8"/>
      <circle cx="63" cy="46" r="5" fill="#424242" stroke="#212121" strokeWidth="1.5"/>
      <circle cx="63" cy="46" r="2.5" fill="#9E9E9E"/>
      <circle cx="84" cy="46" r="5" fill="#424242" stroke="#212121" strokeWidth="1.5"/>
      <circle cx="84" cy="46" r="2.5" fill="#9E9E9E"/>
      <ellipse cx="28" cy="32" rx="9" ry="7" fill="#FF8F00" stroke="#E65100" strokeWidth="1.5"/>
      <circle cx="28" cy="22" r="7" fill="#FF8F00" stroke="#E65100" strokeWidth="1.5"/>
      <polygon points="22,22 18,25 22,27" fill="#FFD700" stroke="#F57F17" strokeWidth="1"/>
      <circle cx="25" cy="21" r="2.5" fill="white" stroke="#E65100" strokeWidth="1"/>
      <circle cx="25.5" cy="21" r="1.3" fill="#1a1a2e"/>
      <line x1="24" y1="38" x2="20" y2="55" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
      <line x1="32" y1="38" x2="36" y2="55" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
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
  { id:'g3', route:'/meiro',           icon:'🗺️', num:3, color:'#7B68EE', stars:4, isNew:false, category:'パズル',
    ja:{ name:'めいろあそび',       desc:'めいろを とおって\nゴールをめざせ！'           },
    en:{ name:'Maze Play',            desc:'Navigate the maze\nto reach the goal!'        },
    zh:{ name:'迷宫游戏',             desc:'穿过迷宫\n到达终点！'                         },
    ko:{ name:'미로 게임',             desc:'미로를 통과해\n골인!'                         },
    es:{ name:'Laberinto',             desc:'¡Navega el laberinto\nhasta la meta!'         } },
  { id:'g4', route:'/doubutsu-puzzle', icon:'🧩', num:4, color:'#2ECC71', stars:5, isNew:false, category:'パズル',
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
    ja:{ name:'どうぶつサッカー',   desc:'どうぶつたちと\nサッカーをしよう！'            },
    en:{ name:'Animal Soccer',        desc:'Play soccer with\ncute animals!'              },
    zh:{ name:'动物足球',             desc:'和动物们\n踢足球！'                           },
    ko:{ name:'동물 축구',             desc:'동물들과\n축구해요!'                          },
    es:{ name:'Fútbol Animal',         desc:'¡Juega al fútbol\ncon animales!'              } },
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
  { id:'g10', route:'/kakurenbo',      icon:'🔍', num:10, color:'#2d6a4f', stars:5, isNew:false, category:'パズル',
    ja:{ name:'どうぶつかくれんぼ', desc:'くさむらや きのうらに\nどうぶつが かくれてるよ！' },
    en:{ name:'Animal Hide & Seek',   desc:'Find the animals\nhiding in the bushes!'      },
    zh:{ name:'动物捉迷藏',           desc:'找找藏在\n草丛里的动物！'                    },
    ko:{ name:'동물 숨바꼭질',         desc:'풀숲에 숨어있는\n동물을 찾아요!'              },
    es:{ name:'Busca Animales',        desc:'¡Encuentra los animales\nescondidos!'         } },
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
    ja:{ name:'ジュエリーマスター', desc:'おきゃくさんのリクエストに\nこたえて ほうせきを\nえらぼう！'      },
    en:{ name:'Jewelry Master',    desc:'Pick the right gem\n& accessory for\nyour customers!'        },
    zh:{ name:'珠宝大师',           desc:'根据客人的要求\n选择正确的宝石\n和饰品！'                      },
    ko:{ name:'주얼리 마스터',       desc:'손님의 요청에 맞는\n보석과 액세서리를\n골라요！'               },
    es:{ name:'Maestro Joyero',    desc:'¡Elige la joya\ny accesorio que\npide el cliente!'           } },
];

/* ════════════════════════════════════════════════════
   🔥チャレンジ タブ ゲームリスト
════════════════════════════════════════════════════ */
const SCHOOL_GAMES = [
  { id:'s1', route:'/tetris',   icon:'🧱', num:1, color:'#4a90ff', stars:5, isNew:false, category:'パズル',
    ja:{ name:'どうぶつブロック', desc:'ブロックをならべて\nラインをけそう！\nテトリス風ゲーム！' },
    en:{ name:'Animal Blocks',   desc:'Stack blocks and\nclear the lines!\nTetris-style game!' },
    zh:{ name:'动物方块',         desc:'叠方块消行！\n俄罗斯方块！'                             },
    ko:{ name:'동물 블록',         desc:'블록을 쌓아\n줄을 없애요!'                             },
    es:{ name:'Bloques Animal',   desc:'¡Apila bloques y\nelimina líneas!'                      } },
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
  { id:'s5', route:'/crossing', icon:'🐔', num:5, color:'#e65100', stars:5, isNew:false, category:'レース',
    ja:{ name:'どうぶつクロッシング', desc:'みちをわたって\nどこまでいけるかな？\nくるまに気をつけて！' },
    en:{ name:'Animal Crossing', desc:'Cross the road\nand go as far as you can!\nWatch for cars!' },
    zh:{ name:'动物过马路',       desc:'穿越马路\n走多远？'                                   },
    ko:{ name:'동물 크로싱',       desc:'길을 건너\n얼마나 멀리 갈까요?'                        },
    es:{ name:'Animal Crossing',  desc:'¡Cruza la calle\ny llega lejos!'                       } },
  { id:'g_mori', route:'/mori', icon:'🌲', num:6, color:'#2e7d32', stars:4, isNew:false, category:'アクション',
    ja:{ name:'もりのなかまたち', desc:'もりをとびこえて\nゴールをめざせ！' },
    en:{ name:'Forest Friends',  desc:'Jump through the forest\nand reach the goal!' },
    zh:{ name:'森林伙伴',         desc:'穿越森林\n冲向终点！' },
    ko:{ name:'숲속 친구들',       desc:'숲을 뛰어넘어\n골인 지점을 향해!' },
    es:{ name:'Amigos del Bosque',desc:'¡Salta por el bosque\ny llega a la meta!' } },
  { id:'g_sora', route:'/sora', icon:'👸', num:7, color:'#7b1fa2', stars:4, isNew:false, category:'アクション',
    ja:{ name:'そらとびプリンセス', desc:'そらをとんで\nてきをたおそう！' },
    en:{ name:'Sky Princess',    desc:'Fly through the sky\nand defeat enemies!' },
    zh:{ name:'飞天公主',         desc:'翱翔天空\n消灭敌人！' },
    ko:{ name:'하늘나는 공주',     desc:'하늘을 날아\n적을 물리쳐요!' },
    es:{ name:'Princesa del Cielo',desc:'¡Vuela por el cielo\ny derrota enemigos!' } },
  { id:'g_bike', route:'/bike', icon:'🏍️', num:8, color:'#f57c00', stars:3, isNew:false, category:'レース',
    ja:{ name:'わくわくバイク', desc:'バイクでコースを\nはしりぬけろ！' },
    en:{ name:'Wakuwaku Bike',  desc:'Race through the course\non your bike!' },
    zh:{ name:'嗡嗡摩托',        desc:'骑摩托车\n冲过赛道！' },
    ko:{ name:'두근두근 바이크',  desc:'오토바이로\n코스를 달려요!' },
    es:{ name:'Moto Wakuwaku',  desc:'¡Corre por el circuito\nen tu moto!' } },
  { id:'g_kart', route:'/kart', icon:'🏎️', num:9, color:'#e53935', stars:3, isNew:false, category:'レース',
    ja:{ name:'アニマルカートGP', desc:'どうぶつたちのカートで\nコースをはしりぬけろ！' },
    en:{ name:'Animal Kart GP',  desc:'Race with animal karts\naround the course!' },
    zh:{ name:'动物卡丁车GP',     desc:'驾驶动物卡丁车\n冲过赛道！' },
    ko:{ name:'애니멀 카트 GP',   desc:'동물 카트로\n코스를 달려요!' },
    es:{ name:'Kart de Animales GP', desc:'¡Corre con karts\nde animales!' } },
  { id:'g_block', route:'/block', icon:'🏰', num:10, color:'#ec407a', stars:3, isNew:true, category:'アクション',
    ja:{ name:'おしろブロックくずし', desc:'パドルでボールをはじいて\nブロックをこわそう！' },
    en:{ name:'Castle Breakout',   desc:'Bounce the ball and\nbreak all the blocks!' },
    zh:{ name:'城堡打砖块',         desc:'弹球击碎\n所有砖块！' },
    ko:{ name:'성 벽돌깨기',        desc:'공을 튕겨서\n블록을 깨요!' },
    es:{ name:'Rompe Castillo',    desc:'¡Rebota la pelota\ny rompe los bloques!' } },
  { id:'g_houki', route:'/houki', icon:'🧹', num:11, color:'#ab47bc', stars:3, isNew:true, category:'レース',
    ja:{ name:'まほうほうきGP', desc:'そらをとんでリングをくぐり\nタイムをのばそう！' },
    en:{ name:'Magic Broom GP',  desc:'Fly and pass through rings\nto extend your time!' },
    zh:{ name:'魔法扫帚GP',       desc:'飞行穿过光环\n延长时间！' },
    ko:{ name:'마법 빗자루 GP',   desc:'날아서 링을 통과해\n시간을 늘려요!' },
    es:{ name:'Escoba Mágica GP', desc:'¡Vuela y cruza aros\npara ganar tiempo!' } },
];

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
  const [activeTab,      setActiveTab]      = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('wakuwaku_tab') : null) || 'kids');
  const [categoryFilter, setCategoryFilter] = useState('すべて');
  const [recentRoutes,   setRecentRoutes]   = useState(() => typeof localStorage !== 'undefined' ? getRecentGames() : []);

  const season    = getSeason();
  const daysSince = getDaysSinceUpdate();
  const todayIdx  = getTodayIndex(GAMES.length);

  function switchTab(tab) {
    setActiveTab(tab);
    localStorage.setItem('wakuwaku_tab', tab);
    setCategoryFilter('すべて');
  }

  // 最近遊んだゲームを可視化用データに変換
  const recentGames = recentRoutes
    .map(route => ALL_GAMES.find(g => g.route === route))
    .filter(Boolean);

  useEffect(() => {
    if (localStorage.getItem('wakuwaku_bgm') !== 'off') startBGM();
    setPlayCount(getPlayCount() + 1312);
    const bonus = checkLoginBonus();
    if (bonus) setLoginBonus(bonus);
    return () => stopBGM();
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
    <div className="tp-wrap">
      <Helmet>
        <title>わくわくアイランド｜こども向け無料ブラウザゲーム</title>
        <meta name="description" content="幼児・小学生向けの無料ミニゲームが20種類以上。かず・もじ・パズル・アクション・レースなどを登録不要・インストール不要でブラウザですぐ遊べます。" />
        <link rel="canonical" href="https://wakuwaku-island.pages.dev/" />
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
          🛒 {{ja:'ショップ', en:'Shop', zh:'商店', ko:'상점', es:'Tienda'}[lang] || 'ショップ'}
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
        <div className="tp-park-badge">🏝️ GAME PARK ✦</div>

        <div className="ksk-title-zone">
          <div className="tp-hero-chars" onClick={(e) => spawnParticles(e.clientX, e.clientY)}>
            <KisekaeCharacters
              kisekaeState={kisekaeState}
              onOpen={openPanel}
              lang={lang}
            />
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

          <div className="tp-subtitle">
            {{ja:'🏝️ たのしい あそびじま！', en:'🏝️ Fun Play Island!', zh:'🏝️ 快乐游戏岛！', ko:'🏝️ 즐거운 놀이섬!', es:'🏝️ ¡Isla de diversión!'}[lang] || '🏝️ たのしい あそびじま！'}
          </div>
        </div>

        {/* ② 季節バナー + ⑤ プレイカウンター（横並び） */}
        <div className="tp-hero-row">
          <div
            className="tp-season"
            style={{ '--season-color': season.color, '--season-glow': season.glow }}
          >
            {season.emoji} {season[lang] || season.ja}
          </div>
          <PlayCounter target={playCount} lang={lang} />
        </div>
      </div>

      {/* ── ゲームセクション ── */}
      <div className="tp-game-section">
        <div className="tp-section-header">
          <h2>{{ja:'🎮 ゲームえらんでね', en:'🎮 Choose a Game', zh:'🎮 选择游戏', ko:'🎮 게임 선택', es:'🎮 Elige un juego'}[lang] || '🎮 ゲームえらんでね'}</h2>
          <div className="tp-section-divider" />
        </div>

        {/* ── 最近遊んだゲーム ── */}
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
                  <span className="tp-recent-name">{g.ja}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 年齢別タブ ── */}
        <div className="tp-tabs">
          <button
            className={`tp-tab${activeTab === 'kids' ? ' tp-tab--active' : ''}`}
            onClick={() => switchTab('kids')}
          >
            🌸 {{ja:'かんたん', en:'Easy', zh:'简单', ko:'쉬움', es:'Fácil'}[lang] || 'かんたん'}
          </button>
          <button
            className={`tp-tab${activeTab === 'school' ? ' tp-tab--active' : ''}`}
            onClick={() => switchTab('school')}
          >
            🔥 {{ja:'チャレンジ', en:'Challenge', zh:'挑战', ko:'도전', es:'Desafío'}[lang] || 'チャレンジ'}
          </button>
        </div>

        {/* ── カテゴリフィルター ── */}
        <div className="tp-cat-filter">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`tp-cat-btn${categoryFilter === cat.key ? ' tp-cat-btn--active' : ''}`}
              onClick={() => setCategoryFilter(cat.key)}
            >
              {cat.icon} {cat.label[lang] || cat.label.ja}
            </button>
          ))}
        </div>

        {/* ── タブコンテンツ ── */}
        <div className={`tp-tab-panel${activeTab === 'kids' ? ' tp-tab-panel--active' : ''}`}>
          <div className="tp-grid">
            {GAMES
              .filter(g => categoryFilter === 'すべて' || g.category === categoryFilter)
              .map((game, i) => (
                <GameCard
                  key={game.id}
                  game={game}
                  lang={lang}
                  isRecommended={GAMES.indexOf(game) === todayIdx && categoryFilter === 'すべて'}
                  animIndex={i}
                  onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, game.route, e.clientX, e.clientY); }}
                />
              ))}
          </div>
        </div>

        <div className={`tp-tab-panel${activeTab === 'school' ? ' tp-tab-panel--active' : ''}`}>
          <div className="tp-grid">
            {SCHOOL_GAMES
              .filter(g => categoryFilter === 'すべて' || g.category === categoryFilter)
              .map((game, i) => (
              <GameCard
                key={game.id}
                game={game}
                lang={lang}
                isRecommended={false}
                animIndex={i}
                onClick={(e) => { spawnParticles(e.clientX, e.clientY); transitionTo(navigate, game.route, e.clientX, e.clientY); }}
              />
            ))}
          </div>
        </div>
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
