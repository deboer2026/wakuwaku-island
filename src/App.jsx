import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useRef } from 'react'
import GameSEO from './seo/GameSEO'
import GAME_META from './seo/gameMeta'
import TopPage from './pages/TopPage'
import { recordRecentGame } from './utils/recentGames'
import { recordGamePlay } from './utils/playHistory'
import { handleGameAnalyticsMessage, trackGameView, trackPageView } from './utils/analytics'

const Shabondama = lazy(() => import('./games/Shabondama'))
const KudamonoCatch = lazy(() => import('./games/KudamonoCatch'))
const DoubutsuPuzzle = lazy(() => import('./games/DoubutsuPuzzle'))
const KazuAsobi = lazy(() => import('./games/KazuAsobi'))
const AnimalSoccer = lazy(() => import('./games/AnimalSoccer'))
const SushiGame = lazy(() => import('./games/SushiGame'))
const IchigoGame = lazy(() => import('./games/IchigoGame'))
const DoubutsuKakurenbo = lazy(() => import('./games/DoubutsuKakurenbo'))
const MojiAsobi = lazy(() => import('./games/MojiAsobi'))
const TashizanGame = lazy(() => import('./games/TashizanGame'))
const IroAwase = lazy(() => import('./games/IroAwase'))
const MachiDukuri = lazy(() => import('./games/MachiDukuri'))
const DoubutsuBlock = lazy(() => import('./games/DoubutsuBlock'))
const DoubutsuRunner = lazy(() => import('./games/DoubutsuRunner'))
const DoubutsuShoot = lazy(() => import('./games/DoubutsuShoot'))
const DoubutsuSniper = lazy(() => import('./games/DoubutsuSniper'))
const KokkiQuiz = lazy(() => import('./games/KokkiQuiz'))
const JewelryMaster = lazy(() => import('./games/JewelryMaster'))
const DressUp = lazy(() => import('./games/DressUp'))
const OkashiCrossing = lazy(() => import('./games/OkashiCrossing'))
const MoriGame = lazy(() => import('./games/MoriGame'))
const DonguriGame = lazy(() => import('./games/DonguriGame'))
const SoraGame = lazy(() => import('./games/SoraGame'))
const BikeGame = lazy(() => import('./games/BikeGame'))
const AnimalKart = lazy(() => import('./games/AnimalKart'))
const BlockKuzushi = lazy(() => import('./games/BlockKuzushi'))
const MahouHouki = lazy(() => import('./games/MahouHouki'))
const MahouMeiro = lazy(() => import('./games/MahouMeiro'))
const UsagiCarrot = lazy(() => import('./games/UsagiCarrot'))
const NekoChou = lazy(() => import('./games/NekoChou'))
const TokeiYomi = lazy(() => import('./games/TokeiYomi'))
const KatakanaAsobi = lazy(() => import('./games/KatakanaAsobi'))
const NurieOekaki = lazy(() => import('./games/NurieOekaki'))
const MahouNakama = lazy(() => import('./games/MahouNakama'))
const OtakaraHorihori = lazy(() => import('./games/OtakaraHorihori'))
const KatachiAwase = lazy(() => import('./games/KatachiAwase'))
const SoraKyoshitsu = lazy(() => import('./games/SoraKyoshitsu'))
const MuraGame = lazy(() => import('./games/MuraGame'))
const NeonDrive = lazy(() => import('./games/NeonDrive'))
const AstralFang = lazy(() => import('./games/AstralFang'))
const NijiiroOukoku = lazy(() => import('./games/NijiiroOukoku'))
const PokopokoIsland = lazy(() => import('./games/PokopokoIsland'))
const AwaawaOfuro = lazy(() => import('./games/AwaawaOfuro'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const ParentsPage = lazy(() => import('./pages/ParentsPage'))

function RouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, color: '#fff', fontSize: 18, fontWeight: 800, textShadow: '0 2px 4px rgba(26, 105, 159, .35)' }}
    >
      よみこみ中…
    </div>
  )
}

function GameWithSEO({ route, children }) {
  const meta = GAME_META[route];
  useEffect(() => {
    const game = { route, name: meta?.name || '', category: meta?.category || '' };
    const onMessage = (event) => handleGameAnalyticsMessage(event, {
      game_id: game.route,
      game_name: game.name,
      game_category: game.category
    });
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [route, meta]);
  if (!meta) return children;
  return (
    <>
      <GameSEO route={route} {...meta} />
      {children}
    </>
  );
}

// ゲームルートの一覧（トップ・プライバシー等は除外）
const GAME_ROUTES = new Set([
  '/shabondama', '/kudamono-catch', '/doubutsu-puzzle',
  '/kazu-asobi', '/animal-soccer', '/sushi',
  '/ichigo', '/kakurenbo', '/moji', '/tashizan', '/iro', '/machi',
  '/kokki', '/jewelry-master', '/animal-block', '/runner', '/shooting',
  '/sniper', '/dressup', '/okashi-crossing',
  '/moji-asobi', '/iro-awase', '/flag-quiz', '/shoot',
  '/mori', '/donguri', '/sora', '/bike', '/kart', '/block', '/houki', '/usagi-carrot', '/usagi', '/neko-chou', '/neko', '/mahou-meiro',
  '/tokei-yomi', '/katakana-asobi', '/nurie', '/mahou-nakama', '/katachi', '/katachi-awase',
  '/otakara-horihori',
  '/sora-kyoshitsu', '/kyoshitsu',
  '/mura', '/doubutsu-mura',
  '/neon-drive', '/neon',
  '/astral-fang', '/astral',
  '/nijiiro-oukoku', '/nijiiro',
  '/pokopoko-island',
  '/ofuro', '/awaawa-ofuro',
  // 短縮URLエイリアスも記録
  '/kudamono', '/puzzle', '/kazu', '/soccer',
]);

// ルート変更を監視して localStorage に記録するコンポーネント
function RouteTracker() {
  const location = useLocation();
  const navCount = useRef(0);
  useEffect(() => {
    // ブラウザの自動スクロール復元を無効化（bfcache 戻り対策）
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // ルート遷移ごとに最上部へ戻す（ゲームは必ず開始画面から見せる）
    window.scrollTo(0, 0);
    trackPageView(location.pathname, document.title);

    navCount.current += 1;
    // 着地の初回では立てず、サイト内で動いた2回目以降にフラグを立てる
    if (navCount.current >= 2) {
      try { sessionStorage.setItem('ww_nav_internal', '1'); } catch { /* private-mode storage can be unavailable */ }
    }
    if (GAME_ROUTES.has(location.pathname)) {
      recordRecentGame(location.pathname);
      recordGamePlay(location.pathname);
      const meta = GAME_META[location.pathname];
      trackGameView({ route: location.pathname, name: meta?.name || '', category: meta?.category || '' });
    }
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <RouteTracker />
      <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/shabondama" element={<GameWithSEO route="/shabondama"><Shabondama /></GameWithSEO>} />
        <Route path="/kudamono-catch" element={<GameWithSEO route="/kudamono-catch"><KudamonoCatch /></GameWithSEO>} />
        <Route path="/doubutsu-puzzle" element={<GameWithSEO route="/doubutsu-puzzle"><DoubutsuPuzzle /></GameWithSEO>} />
        <Route path="/kazu-asobi" element={<GameWithSEO route="/kazu-asobi"><KazuAsobi /></GameWithSEO>} />
        <Route path="/animal-soccer" element={<GameWithSEO route="/animal-soccer"><AnimalSoccer /></GameWithSEO>} />
        <Route path="/sushi" element={<GameWithSEO route="/sushi"><SushiGame /></GameWithSEO>} />
        <Route path="/ichigo" element={<GameWithSEO route="/ichigo"><IchigoGame /></GameWithSEO>} />
        <Route path="/kakurenbo" element={<GameWithSEO route="/kakurenbo"><DoubutsuKakurenbo /></GameWithSEO>} />
        <Route path="/moji" element={<GameWithSEO route="/moji"><MojiAsobi /></GameWithSEO>} />
        <Route path="/tashizan" element={<GameWithSEO route="/tashizan"><TashizanGame /></GameWithSEO>} />
        <Route path="/iro" element={<GameWithSEO route="/iro"><IroAwase /></GameWithSEO>} />
        <Route path="/machi" element={<GameWithSEO route="/machi"><MachiDukuri /></GameWithSEO>} />
        <Route path="/katachi" element={<GameWithSEO route="/katachi"><KatachiAwase /></GameWithSEO>} />
        {/* ── URL エイリアス ── */}
        <Route path="/katachi-awase" element={<GameWithSEO route="/katachi"><KatachiAwase /></GameWithSEO>} />
        <Route path="/kudamono"   element={<GameWithSEO route="/kudamono-catch"><KudamonoCatch /></GameWithSEO>} />
        <Route path="/puzzle"     element={<GameWithSEO route="/doubutsu-puzzle"><DoubutsuPuzzle /></GameWithSEO>} />
        <Route path="/kazu"       element={<GameWithSEO route="/kazu-asobi"><KazuAsobi /></GameWithSEO>} />
        <Route path="/soccer"     element={<GameWithSEO route="/animal-soccer"><AnimalSoccer /></GameWithSEO>} />
        <Route path="/moji-asobi" element={<GameWithSEO route="/moji"><MojiAsobi /></GameWithSEO>} />
        <Route path="/iro-awase"  element={<GameWithSEO route="/iro"><IroAwase /></GameWithSEO>} />
        <Route path="/flag-quiz"  element={<GameWithSEO route="/kokki"><KokkiQuiz /></GameWithSEO>} />
        <Route path="/shoot"      element={<GameWithSEO route="/shooting"><DoubutsuShoot /></GameWithSEO>} />
        <Route path="/animal-block" element={<GameWithSEO route="/animal-block"><DoubutsuBlock /></GameWithSEO>} />
        <Route path="/runner"   element={<GameWithSEO route="/runner"><DoubutsuRunner /></GameWithSEO>} />
        <Route path="/shooting" element={<GameWithSEO route="/shooting"><DoubutsuShoot /></GameWithSEO>} />
        <Route path="/sniper"   element={<GameWithSEO route="/sniper"><DoubutsuSniper /></GameWithSEO>} />
        <Route path="/okashi-crossing" element={<GameWithSEO route="/okashi-crossing"><OkashiCrossing /></GameWithSEO>} />
        <Route path="/kokki"          element={<GameWithSEO route="/kokki"><KokkiQuiz /></GameWithSEO>} />
        <Route path="/jewelry-master" element={<GameWithSEO route="/jewelry-master"><JewelryMaster /></GameWithSEO>} />
        <Route path="/dressup"        element={<DressUp />} />
        <Route path="/mori" element={<GameWithSEO route="/mori"><MoriGame /></GameWithSEO>} />
        <Route path="/donguri" element={<GameWithSEO route="/donguri"><DonguriGame /></GameWithSEO>} />
        <Route path="/sora" element={<GameWithSEO route="/sora"><SoraGame /></GameWithSEO>} />
        <Route path="/bike" element={<GameWithSEO route="/bike"><BikeGame /></GameWithSEO>} />
        <Route path="/kart" element={<GameWithSEO route="/kart"><AnimalKart /></GameWithSEO>} />
        <Route path="/block" element={<GameWithSEO route="/block"><BlockKuzushi /></GameWithSEO>} />
        <Route path="/houki" element={<GameWithSEO route="/houki"><MahouHouki /></GameWithSEO>} />
        <Route path="/mahou-meiro" element={<GameWithSEO route="/mahou-meiro"><MahouMeiro /></GameWithSEO>} />
        <Route path="/usagi-carrot" element={<GameWithSEO route="/usagi-carrot"><UsagiCarrot /></GameWithSEO>} />
        <Route path="/usagi"        element={<GameWithSEO route="/usagi-carrot"><UsagiCarrot /></GameWithSEO>} />
        <Route path="/neko-chou" element={<GameWithSEO route="/neko-chou"><NekoChou /></GameWithSEO>} />
        <Route path="/neko"      element={<GameWithSEO route="/neko-chou"><NekoChou /></GameWithSEO>} />
        <Route path="/tokei-yomi" element={<GameWithSEO route="/tokei-yomi"><TokeiYomi /></GameWithSEO>} />
        <Route path="/katakana-asobi" element={<GameWithSEO route="/katakana-asobi"><KatakanaAsobi /></GameWithSEO>} />
        <Route path="/nurie" element={<GameWithSEO route="/nurie"><NurieOekaki /></GameWithSEO>} />
        <Route path="/mahou-nakama" element={<GameWithSEO route="/mahou-nakama"><MahouNakama /></GameWithSEO>} />
        <Route path="/otakara-horihori" element={<GameWithSEO route="/otakara-horihori"><OtakaraHorihori /></GameWithSEO>} />
        <Route path="/sora-kyoshitsu" element={<GameWithSEO route="/sora-kyoshitsu"><SoraKyoshitsu /></GameWithSEO>} />
        <Route path="/kyoshitsu"      element={<GameWithSEO route="/sora-kyoshitsu"><SoraKyoshitsu /></GameWithSEO>} />
        <Route path="/mura" element={<GameWithSEO route="/mura"><MuraGame /></GameWithSEO>} />
        <Route path="/doubutsu-mura" element={<GameWithSEO route="/mura"><MuraGame /></GameWithSEO>} />
        <Route path="/neon-drive" element={<GameWithSEO route="/neon-drive"><NeonDrive /></GameWithSEO>} />
        <Route path="/neon"       element={<GameWithSEO route="/neon-drive"><NeonDrive /></GameWithSEO>} />
        <Route path="/astral-fang" element={<GameWithSEO route="/astral-fang"><AstralFang /></GameWithSEO>} />
        <Route path="/astral"      element={<GameWithSEO route="/astral-fang"><AstralFang /></GameWithSEO>} />
        <Route path="/nijiiro-oukoku" element={<GameWithSEO route="/nijiiro-oukoku"><NijiiroOukoku /></GameWithSEO>} />
        <Route path="/nijiiro"        element={<GameWithSEO route="/nijiiro-oukoku"><NijiiroOukoku /></GameWithSEO>} />
        <Route path="/pokopoko-island" element={<GameWithSEO route="/pokopoko-island"><PokopokoIsland /></GameWithSEO>} />
        <Route path="/ofuro" element={<GameWithSEO route="/ofuro"><AwaawaOfuro /></GameWithSEO>} />
        <Route path="/awaawa-ofuro" element={<GameWithSEO route="/ofuro"><AwaawaOfuro /></GameWithSEO>} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms"   element={<TermsPage />} />
        <Route path="/parents" element={<ParentsPage />} />
      </Routes>
      </Suspense>
    </>
  )
}
