import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import GameSEO from './seo/GameSEO'
import GAME_META from './seo/gameMeta'
import TopPage from './pages/TopPage'
import Shabondama from './games/Shabondama'
import KudamonoCatch from './games/KudamonoCatch'
import Meiro from './games/Meiro'
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
import DoubutsuCrossing from './games/DoubutsuCrossing'
import KokkiQuiz from './games/KokkiQuiz'
import JewelryMaster from './games/JewelryMaster'
import DressUp from './games/DressUp'
import MoriGame from './games/MoriGame'
import SoraGame from './games/SoraGame'
import BikeGame from './games/BikeGame'
import AnimalKart from './games/AnimalKart'
import BlockKuzushi from './games/BlockKuzushi'
import MahouHouki from './games/MahouHouki'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import { recordRecentGame } from './utils/recentGames'

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
  '/shabondama', '/kudamono-catch', '/meiro', '/doubutsu-puzzle',
  '/kazu-asobi', '/animal-soccer', '/sushi',
  '/ichigo', '/kakurenbo', '/moji', '/tashizan', '/iro', '/machi',
  '/kokki', '/jewelry-master', '/tetris', '/runner', '/shooting',
  '/sniper', '/crossing', '/dressup',
  '/moji-asobi', '/iro-awase', '/flag-quiz', '/shoot',
  '/mori', '/sora', '/bike', '/kart', '/block', '/houki',
  // 短縮URLエイリアスも記録
  '/kudamono', '/puzzle', '/kazu', '/soccer',
]);

// ルート変更を監視して localStorage に記録するコンポーネント
function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    if (GAME_ROUTES.has(location.pathname)) {
      recordRecentGame(location.pathname);
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
        <Route path="/meiro" element={<GameWithSEO route="/meiro"><Meiro /></GameWithSEO>} />
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
        {/* ── URL エイリアス ── */}
        <Route path="/kudamono"   element={<GameWithSEO route="/kudamono-catch"><KudamonoCatch /></GameWithSEO>} />
        <Route path="/puzzle"     element={<GameWithSEO route="/doubutsu-puzzle"><DoubutsuPuzzle /></GameWithSEO>} />
        <Route path="/kazu"       element={<GameWithSEO route="/kazu-asobi"><KazuAsobi /></GameWithSEO>} />
        <Route path="/soccer"     element={<GameWithSEO route="/animal-soccer"><AnimalSoccer /></GameWithSEO>} />
        <Route path="/moji-asobi" element={<GameWithSEO route="/moji"><MojiAsobi /></GameWithSEO>} />
        <Route path="/iro-awase"  element={<GameWithSEO route="/iro"><IroAwase /></GameWithSEO>} />
        <Route path="/flag-quiz"  element={<GameWithSEO route="/kokki"><KokkiQuiz /></GameWithSEO>} />
        <Route path="/shoot"      element={<GameWithSEO route="/shooting"><DoubutsuShoot /></GameWithSEO>} />
        <Route path="/tetris"   element={<GameWithSEO route="/tetris"><DoubutsuBlock /></GameWithSEO>} />
        <Route path="/runner"   element={<GameWithSEO route="/runner"><DoubutsuRunner /></GameWithSEO>} />
        <Route path="/shooting" element={<GameWithSEO route="/shooting"><DoubutsuShoot /></GameWithSEO>} />
        <Route path="/sniper"   element={<GameWithSEO route="/sniper"><DoubutsuSniper /></GameWithSEO>} />
        <Route path="/crossing" element={<GameWithSEO route="/crossing"><DoubutsuCrossing /></GameWithSEO>} />
        <Route path="/kokki"          element={<GameWithSEO route="/kokki"><KokkiQuiz /></GameWithSEO>} />
        <Route path="/jewelry-master" element={<GameWithSEO route="/jewelry-master"><JewelryMaster /></GameWithSEO>} />
        <Route path="/dressup"        element={<DressUp />} />
        <Route path="/mori" element={<GameWithSEO route="/mori"><MoriGame /></GameWithSEO>} />
        <Route path="/sora" element={<GameWithSEO route="/sora"><SoraGame /></GameWithSEO>} />
        <Route path="/bike" element={<GameWithSEO route="/bike"><BikeGame /></GameWithSEO>} />
        <Route path="/kart" element={<GameWithSEO route="/kart"><AnimalKart /></GameWithSEO>} />
        <Route path="/block" element={<GameWithSEO route="/block"><BlockKuzushi /></GameWithSEO>} />
        <Route path="/houki" element={<GameWithSEO route="/houki"><MahouHouki /></GameWithSEO>} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms"   element={<TermsPage />} />
      </Routes>
    </>
  )
}
