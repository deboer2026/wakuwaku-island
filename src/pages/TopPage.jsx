import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playTopPageBgm, stopBgm, toggleMute, getMuteState, ensureAudioStarted } from '../utils/audio';
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
const CAT_GRADIENT = {
  'かずあそび': 'linear-gradient(145deg, #1565c0 0%, #42a5f5 100%)',
  'もじあそび': 'linear-gradient(145deg, #1b5e20 0%, #43a047 100%)',
  'パズル':     'linear-gradient(145deg, #4a148c 0%, #ab47bc 100%)',
  'アクション': 'linear-gradient(145deg, #bf360c 0%, #ff7043 100%)',
  'クイズ':     'linear-gradient(145deg, #880e4f 0%, #e91e63 100%)',
  'そうぞう':   'linear-gradient(145deg, #7b1fa2 0%, #f06292 100%)',
};

const CATEGORIES = ['すべて', 'かずあそび', 'もじあそび', 'パズル', 'アクション', 'クイズ', 'そうぞう'];

/* ════════════════════════════════════════════════════
   ① 更新日時（手動で更新する定数）
════════════════════════════════════════════════════ */
const LAST_UPDATE_DATE = '2026-05-18';

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
  { id:'g8', route:'/sushi',           icon:'🍣', num:8, color:'#FF5722', stars:5, isNew:true, category:'アクション',
    ja:{ name:'さーもん',           desc:'かいてんずし！\nサーモンだけ\nタップしよう！' },
    en:{ name:'Catch Salmon',         desc:'Tap only salmon\nin the sushi conveyor!'      },
    zh:{ name:'捉三文鱼',             desc:'旋转寿司！\n只点三文鱼！'                    },
    ko:{ name:'연어잡기',              desc:'회전초밥에서\n연어만 탭해요!'                 },
    es:{ name:'Atrapa Salmón',         desc:'¡Toca solo el salmón\nen el conveyor!'        } },
  { id:'g9', route:'/ichigo',          icon:'🍓', num:9, color:'#E91E63', stars:5, isNew:true, category:'アクション',
    ja:{ name:'いちご',             desc:'30びょうで\nいちごを\nあつめよう！'            },
    en:{ name:'Strawberry Time',      desc:'Collect strawberries\nin 30 seconds!'         },
    zh:{ name:'草莓时间',             desc:'30秒内收集\n草莓！'                           },
    ko:{ name:'딸기 모으기',           desc:'30초 안에\n딸기를 모아요!'                   },
    es:{ name:'Tiempo de Fresa',       desc:'¡Recoge fresas\nen 30 segundos!'              } },
  { id:'g10', route:'/kakurenbo',      icon:'🔍', num:10, color:'#2d6a4f', stars:5, isNew:true, category:'パズル',
    ja:{ name:'どうぶつかくれんぼ', desc:'くさむらや きのうらに\nどうぶつが かくれてるよ！' },
    en:{ name:'Animal Hide & Seek',   desc:'Find the animals\nhiding in the bushes!'      },
    zh:{ name:'动物捉迷藏',           desc:'找找藏在\n草丛里的动物！'                    },
    ko:{ name:'동물 숨바꼭질',         desc:'풀숲에 숨어있는\n동물을 찾아요!'              },
    es:{ name:'Busca Animales',        desc:'¡Encuentra los animales\nescondidos!'         } },
  { id:'g11', route:'/moji',           icon:'🔤', num:11, color:'#4CAF50', stars:3, isNew:true, category:'もじあそび',
    ja:{ name:'もじあそび',         desc:'えをみて ただしい\nひらがなを えらんでね！'        },
    en:{ name:'Letter Fun',          desc:'Look at the picture\nand choose the right hiragana!' },
    zh:{ name:'文字游戏',             desc:'看图选择\n正确的平假名！'                    },
    ko:{ name:'글자 놀이',             desc:'그림을 보고\n히라가나를 골라요!'               },
    es:{ name:'Letras',                desc:'¡Mira el dibujo y\nelige la letra!'            } },
  { id:'g12', route:'/tashizan',       icon:'➕', num:12, color:'#2196F3', stars:3, isNew:true, category:'かずあそび',
    ja:{ name:'たしざんゲーム',     desc:'どうぶつを かぞえて\nこたえをえらんでね！'          },
    en:{ name:'Math Quiz',           desc:'Count animals and\nchoose the right answer!'        },
    zh:{ name:'加法游戏',             desc:'数动物\n选答案！'                             },
    ko:{ name:'덧셈 게임',             desc:'동물을 세어\n답을 골라요!'                    },
    es:{ name:'Suma',                  desc:'¡Cuenta animales y\nelige la respuesta!'       } },
  { id:'g13', route:'/iro',            icon:'🎨', num:13, color:'#9C27B0', stars:3, isNew:true, category:'パズル',
    ja:{ name:'いろあわせ',         desc:'いろを まぜると\nなんいろになるかな？'              },
    en:{ name:'Color Match',         desc:'Mix colors and find\nthe right answer!'             },
    zh:{ name:'颜色配对',             desc:'混合颜色\n是什么颜色？'                       },
    ko:{ name:'색깔 맞추기',           desc:'색을 섞으면\n무슨 색이 될까요?'                },
    es:{ name:'Colores',               desc:'¡Mezcla colores y\nencontra el resultado!'     } },
  { id:'g14', route:'/machi',          icon:'🏙️', num:14, color:'#00897B', stars:5, isNew:true, category:'そうぞう',
    ja:{ name:'わくわくまちづくり', desc:'じぶんだけの\nすてきなまちを\nつくろう！'            },
    en:{ name:'City Builder',        desc:'Build your own\namazing city!'                      },
    zh:{ name:'建造城市',             desc:'建造属于自己的\n美丽城市！'                   },
    ko:{ name:'도시 만들기',           desc:'나만의 멋진\n도시를 만들어요!'                 },
    es:{ name:'Constructor',           desc:'¡Construye tu propia\nciudad increíble!'       } },
  { id:'g15', route:'/kokki', icon:'🌍', num:15, color:'#0d47a1', stars:4, isNew:true, category:'クイズ',
    ja:{ name:'こっきクイズ',    desc:'せかいの こっきを\nみわけよう！\n30かこく以上！'       },
    en:{ name:'Flag Quiz',        desc:'Identify world flags!\n30+ countries!\nTest your knowledge!' },
    zh:{ name:'国旗问答',          desc:'识别世界各国国旗！\n30多个国家！'                          },
    ko:{ name:'국기 퀴즈',         desc:'세계 국기를 맞혀봐!\n30개국 이상!'                       },
    es:{ name:'Quiz de Banderas', desc:'¡Identifica banderas!\n¡Más de 30 países!'                  } },
  { id:'g16', route:'/jewelry-master', icon:'💍', num:16, color:'#7b1fa2', stars:4, isNew:true, category:'そうぞう',
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
  { id:'s2', route:'/runner',   icon:'🏃', num:2, color:'#43A047', stars:4, isNew:false, category:'アクション',
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
  { id:'s4', route:'/sniper',   icon:'🎯', num:4, color:'#2d6a4f', stars:4, isNew:true, category:'アクション',
    ja:{ name:'どうぶつスナイパー', desc:'うごくどうぶつを\nタップでねらえ！\nフェイクに注意！' },
    en:{ name:'Animal Sniper',   desc:'Tap moving animals\nto score points!\nWatch for fakes!' },
    zh:{ name:'动物狙击手',       desc:'点击移动动物\n积累分数！'                              },
    ko:{ name:'동물 스나이퍼',     desc:'움직이는 동물을\n탭해서 맞혀요!'                      },
    es:{ name:'Francotirador',    desc:'¡Toca animales\nen movimiento!'                        } },
  { id:'s5', route:'/crossing', icon:'🐔', num:5, color:'#e65100', stars:5, isNew:true, category:'アクション',
    ja:{ name:'どうぶつクロッシング', desc:'みちをわたって\nどこまでいけるかな？\nくるまに気をつけて！' },
    en:{ name:'Animal Crossing', desc:'Cross the road\nand go as far as you can!\nWatch for cars!' },
    zh:{ name:'动物过马路',       desc:'穿越马路\n走多远？'                                   },
    ko:{ name:'동물 크로싱',       desc:'길을 건너\n얼마나 멀리 갈까요?'                        },
    es:{ name:'Animal Crossing',  desc:'¡Cruza la calle\ny llega lejos!'                       } },
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
   ゲームカード（グラスモーフィズム）
════════════════════════════════════════════════════ */
function GameCard({ game, lang, isRecommended, onClick, animIndex }) {
  const t = game[lang] || game.ja;
  const gradient = CAT_GRADIENT[game.category] || `linear-gradient(145deg, ${game.color}, ${game.color}bb)`;
  // 星評価（塗り / 空白）
  const starsFilled = Math.round(game.stars);
  const starsEl = Array.from({length: 5}, (_, i) => (
    <span key={i} className={i < starsFilled ? 'tp-star tp-star--filled' : 'tp-star'}>
      {i < starsFilled ? '★' : '☆'}
    </span>
  ));

  return (
    <button
      className={`tp-card${isRecommended ? ' tp-card--recommend' : ''}`}
      style={{
        '--card-color': game.color,
        '--card-gradient': gradient,
        '--card-delay': `${(animIndex ?? 0) * 0.08}s`,
      }}
      onClick={onClick}
    >
      {isRecommended && (
        <div className="tp-card-ribbon">
          {{ja:'⭐ きょうのおすすめ！', en:'⭐ Today\'s Pick!', zh:'⭐ 今日推荐！', ko:'⭐ 오늘의 추천!', es:'⭐ ¡Recomendado!'}[lang] || '⭐ きょうのおすすめ！'}
        </div>
      )}

      <div className="tp-card-top">
        {game.isNew && (
          <span className="tp-card-new">
            {{ja:'NEW', en:'NEW', zh:'NEW', ko:'NEW', es:'NEW'}[lang] || 'NEW'}
          </span>
        )}
        {game.category && (
          <span className="tp-card-cat">{game.category}</span>
        )}
        <span className="tp-card-icon">{game.icon}</span>
        <div className="tp-card-shine" />
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
        <div className="tp-card-stars">{starsEl}</div>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════
   TopPage 本体
════════════════════════════════════════════════════ */
export default function TopPage() {
  const navigate   = useNavigate();
  const [lang,        setLang]        = useState(() => localStorage.getItem('wakuwaku_lang') || 'ja');
  const [isMuted,     setIsMuted]     = useState(getMuteState());
  const [playCount,   setPlayCount]   = useState(0);
  const [kisekaeState,setKisekaeState]= useState(() => {
    try {
      const saved = localStorage.getItem('kisekae_state');
      return saved ? JSON.parse(saved) : DEFAULT_KISEKAE;
    } catch { return DEFAULT_KISEKAE; }
  });
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [panelChara,  setPanelChara]  = useState('princess');
  const [shopOpen,    setShopOpen]    = useState(false);
  const [coins,       setCoins]       = useState(getCoins);
  const [loginBonus,  setLoginBonus]  = useState(null);
  const [activeTab,      setActiveTab]      = useState(() => localStorage.getItem('wakuwaku_tab') || 'kids');
  const [categoryFilter, setCategoryFilter] = useState('すべて');
  const [recentRoutes,   setRecentRoutes]   = useState(() => getRecentGames());

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
    ensureAudioStarted().then(() => playTopPageBgm());
    setPlayCount(getPlayCount() + 1312);
    // Check login bonus
    const bonus = checkLoginBonus();
    if (bonus) setLoginBonus(bonus);
    return () => stopBgm();
  }, []);

  async function handleMuteToggle() {
    toggleMute();
    setIsMuted(getMuteState());
    if (!getMuteState()) {
      await ensureAudioStarted();
      playTopPageBgm();
    }
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
    <div className="tp-wrap" style={{ paddingTop: 'max(44px, env(safe-area-inset-top, 44px))' }}>

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

      {/* ── コイン残高（左上） ── */}
      <div className="tp-coin-badge">
        🪙 <span className="tp-coin-num">{coins}</span>
        <span className="tp-coin-unit">
          {lang === 'en' ? 'coins' : lang === 'zh' ? '枚' : lang === 'ko' ? '개' : lang === 'es' ? ' monedas' : 'まい'}
        </span>
      </div>

      {/* ── 右上ボタン群 ── */}
      <div className="tp-top-btns">
        <button className="tp-top-btn tp-shop-btn" onClick={() => setShopOpen(true)}
          title={lang === 'en' ? 'Shop' : 'ショップ'}>
          🛍️
        </button>
        <button className="tp-top-btn ksk-top-btn" onClick={() => openPanel('princess')}
          title={lang === 'en' ? 'Dress up' : 'きがえ'}>
          👗
        </button>
        <button className="tp-top-btn" onClick={handleMuteToggle}
          title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button className="tp-top-btn" onClick={handleLangToggle}
          title="Language / 言語">
          {LANG_FLAGS[lang]}
        </button>
      </div>

      {/* ── ヘッダー ── */}
      <div className="tp-header" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="tp-park-badge">🏝️ GAME PARK ✦</div>

        <div className="ksk-title-zone">
          <div onClick={(e) => spawnParticles(e.clientX, e.clientY)} style={{ display:'contents' }}>
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

        {/* ② 季節バナー */}
        <div
          className="tp-season"
          style={{ '--season-color': season.color, '--season-glow': season.glow }}
        >
          {season.emoji} {season[lang] || season.ja}
        </div>

        {/* ⑤ プレイカウンター */}
        <PlayCounter target={playCount} lang={lang} />
      </div>

      {/* ① 更新バー */}
      <div className="tp-update-bar">
        {lang === 'en' ? '🕐 Last Update: ' : lang === 'zh' ? '🕐 最后更新：' : lang === 'ko' ? '🕐 최근 업데이트：' : lang === 'es' ? '🕐 Última actualización: ' : '🕐 さいごのこうしん：'}
        {lastUpdateText}
        {'　✦　'}
        {lang === 'en' ? 'New games coming soon!' : lang === 'zh' ? '新游戏陆续推出！' : lang === 'ko' ? '새 게임이 계속 추가돼요!' : lang === 'es' ? '¡Nuevos juegos pronto!' : 'あたらしいゲームが どんどん くるよ！'}
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
            <span className="tp-tab-new">NEW</span>
          </button>
        </div>

        {/* ── カテゴリフィルター ── */}
        <div className="tp-cat-filter">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`tp-cat-btn${categoryFilter === cat ? ' tp-cat-btn--active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
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
          <span>© 2025 Wakuwaku Island</span>
          <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>v1.0.1</span>
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
