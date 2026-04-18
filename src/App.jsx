import { Routes, Route } from 'react-router-dom'
import TopPage from './pages/TopPage'
import Shabondama from './games/Shabondama'
import KudamonoCatch from './games/KudamonoCatch'
import Meiro from './games/Meiro'
import DoubutsuPuzzle from './games/DoubutsuPuzzle'
import KazuAsobi from './games/KazuAsobi'
import AnimalSoccer from './games/AnimalSoccer'
import JewelryShop from './games/JewelryShop'

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
    </Routes>
  )
}
