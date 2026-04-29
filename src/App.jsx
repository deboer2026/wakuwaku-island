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
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
    </Routes>
  )
}
