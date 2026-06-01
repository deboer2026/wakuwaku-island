import { Routes, Route } from 'react-router-dom'
import TopPage from './pages/TopPage'
import Shabondama from './games/Shabondama'
import KudamonoCatch from './games/KudamonoCatch'
import Meiro from './games/Meiro'
import DoubutsuPuzzle from './games/DoubutsuPuzzle'
import KazuAsobi from './games/KazuAsobi'
import AnimalSoccer from './games/AnimalSoccer'
import JewelryShop from './games/JewelryShop'
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
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/shabondama" element={<Shabondama />} />
      <Route path="/kudamono-catch" element={<KudamonoCatch />} />
      <Route path="/meiro" element={<Meiro />} />
      <Route path="/doubutsu-puzzle" element={<DoubutsuPuzzle />} />
      <Route path="/kazu-asobi" element={<KazuAsobi />} />
      <Route path="/animal-soccer" element={<AnimalSoccer />} />
      <Route path="/jewelry-shop" element={<JewelryShop />} />
      <Route path="/sushi" element={<SushiGame />} />
      <Route path="/ichigo" element={<IchigoGame />} />
      <Route path="/kakurenbo" element={<DoubutsuKakurenbo />} />
      <Route path="/moji" element={<MojiAsobi />} />
      <Route path="/tashizan" element={<TashizanGame />} />
      <Route path="/iro" element={<IroAwase />} />
      <Route path="/machi" element={<MachiDukuri />} />
      {/* ── URL エイリアス（短縮URL → 正規ルートと同じコンポーネント） ── */}
      <Route path="/kudamono"  element={<KudamonoCatch />} />
      <Route path="/puzzle"    element={<DoubutsuPuzzle />} />
      <Route path="/kazu"      element={<KazuAsobi />} />
      <Route path="/soccer"    element={<AnimalSoccer />} />
      <Route path="/jewelry"   element={<JewelryShop />} />
      <Route path="/tetris" element={<DoubutsuBlock />} />
      <Route path="/runner" element={<DoubutsuRunner />} />
      <Route path="/shooting" element={<DoubutsuShoot />} />
      <Route path="/sniper"   element={<DoubutsuSniper />} />
      <Route path="/crossing" element={<DoubutsuCrossing />} />
      <Route path="/kokki" element={<KokkiQuiz />} />
      <Route path="/jewelry-master" element={<JewelryMaster />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
    </Routes>
  )
}
