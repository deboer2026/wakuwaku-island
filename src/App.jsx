import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import GameSEO from './seo/GameSEO'
import GAME_META from './seo/gameMeta'
import TopPage from './pages/TopPage'
import Shabondama from './games/Shabondama'
import KudamonoCatch from './games/KudamonoCatch'
import DoubutsuPuzzle from './games/DoubutsuPuzzle'
import KazuAsobi from './games/KazuAsobi'
import AnimalSoccer from './games/AnimalSoccer'
import SushiGame from './games/SushiGame'
import IchigoGame from './games/IchigoGame'
import DoubutsuKakurenbo from './games/DoubutsuKakurenbo'
import MojiAsobi from './games/MojiAsobi'
import TashizanGame from './games/TashizanGame'
import IroAwase from './games/IroAwase'
import MachiDukuri from './games/MachiDukuri'
import DoubutsuBlock from './games/DoubutsuBlock'
import DoubutsuRunner from './games/DoubutsuRunner'
import DoubutsuShoot from './games/DoubutsuShoot'
import DoubutsuSniper from './games/DoubutsuSniper'
import KokkiQuiz from './games/KokkiQuiz'
import JewelryMaster from './games/JewelryMaster'
import DressUp from './games/DressUp'
import OkashiCrossing from './games/OkashiCrossing'
import MoriGame from './games/MoriGame'
import SoraGame from './games/SoraGame'
import BikeGame from './games/BikeGame'
import AnimalKart from './games/AnimalKart'
import BlockKuzushi from './games/BlockKuzushi'
import MahouHouki from './games/MahouHouki'
import MahouMeiro from './games/MahouMeiro'
import UsagiCarrot from './games/UsagiCarrot'
import NekoChou from './games/NekoChou'
import TokeiYomi from './games/TokeiYomi'
import KatakanaAsobi from './games/KatakanaAsobi'
import NurieOekaki from './games/NurieOekaki'
import MahouNakama from './games/MahouNakama'
import OtakaraHorihori from './games/OtakaraHorihori'
import KatachiAwase from './games/KatachiAwase'
import SoraKyoshitsu from './games/SoraKyoshitsu'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import { recordRecentGame } from './utils/recentGames'
import { recordGamePlay } from './utils/playHistory'

function GameWithSEO({ route, children }) {
  const meta = GAME_META[route];
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
  '/mori', '/sora', '/bike', '/kart', '/block', '/houki', '/usagi-carrot', '/usagi', '/neko-chou', '/neko', '/mahou-meiro',
  '/tokei-yomi', '/katakana-asobi', '/nurie', '/mahou-nakama', '/katachi', '/katachi-awase',
  '/otakara-horihori',
  '/sora-kyoshitsu', '/kyoshitsu',
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

    navCount.current += 1;
    // 着地の初回では立てず、サイト内で動いた2回目以降にフラグを立てる
    if (navCount.current >= 2) {
      try { sessionStorage.setItem('ww_nav_internal', '1'); } catch {}
    }
    if (GAME_ROUTES.has(location.pathname)) {
      recordRecentGame(location.pathname);
      recordGamePlay(location.pathname);
    }
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <RouteTracker />
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
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms"   element={<TermsPage />} />
      </Routes>
    </>
  )
}
