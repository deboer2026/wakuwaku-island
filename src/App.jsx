import { useState } from 'react'
import './App.css'
import MemoryGame from './games/MemoryGame'
import WhackMole from './games/WhackMole'
import ColorQuiz from './games/ColorQuiz'
import TypingGame from './games/TypingGame'
import MathDrill from './games/MathDrill'
import Shiritori from './games/Shiritori'

const GAMES = [
  {
    id: 'memory',
    icon: '🃏',
    title: 'かーどめもり',
    desc: 'おなじえのカードをみつけよう！きおくりょくをきたえよう',
    badge: 'badge-easy',
    badgeLabel: 'かんたん',
    component: MemoryGame,
  },
  {
    id: 'whack',
    icon: '🐹',
    title: 'もぐらたたき',
    desc: 'もぐらがでてきたら　すばやくたたこう！',
    badge: 'badge-normal',
    badgeLabel: 'ふつう',
    component: WhackMole,
  },
  {
    id: 'color',
    icon: '🎨',
    title: 'いろあてクイズ',
    desc: 'みせられたいろのなまえを　えらぼう！',
    badge: 'badge-easy',
    badgeLabel: 'かんたん',
    component: ColorQuiz,
  },
  {
    id: 'typing',
    icon: '⌨️',
    title: 'ひらがなタイピング',
    desc: 'えをみて　ひらがなをうとう！タイピングがうまくなるよ',
    badge: 'badge-normal',
    badgeLabel: 'ふつう',
    component: TypingGame,
  },
  {
    id: 'math',
    icon: '🔢',
    title: 'けいさんドリル',
    desc: 'たしざん・ひきざんをといて　てんすうをあげよう！',
    badge: 'badge-normal',
    badgeLabel: 'ふつう',
    component: MathDrill,
  },
  {
    id: 'shiritori',
    icon: '🦊',
    title: 'えでしりとり',
    desc: 'えをみて　しりとりをつなごう！ことばをおぼえよう',
    badge: 'badge-hard',
    badgeLabel: 'むずかしい',
    component: Shiritori,
  },
]

export default function App() {
  const [currentGame, setCurrentGame] = useState(null)

  if (currentGame) {
    const game = GAMES.find(g => g.id === currentGame)
    const GameComponent = game.component
    return (
      <div className="game-wrapper">
        <div className="game-header">
          <button className="back-btn" onClick={() => setCurrentGame(null)}>
            ← もどる
          </button>
          <span className="game-header-title">{game.icon} {game.title}</span>
        </div>
        <div className="game-body">
          <GameComponent />
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="site-title">🏝️ わくわくアイランド 🏝️</div>
        <div className="site-subtitle">たのしいゲームがいっぱい！あそびにきてね♪</div>
        <div className="emoji-row">🌟 🎮 🌈 🎵 🌸</div>
      </header>

      <main className="main">
        <h2 className="section-title">🎮 ゲームをえらぼう！</h2>
        <div className="game-grid">
          {GAMES.map(game => (
            <div
              key={game.id}
              className="game-card"
              onClick={() => setCurrentGame(game.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setCurrentGame(game.id)}
            >
              <span className="game-icon">{game.icon}</span>
              <div className="game-title">{game.title}</div>
              <div className="game-desc">{game.desc}</div>
              <span className={`game-badge ${game.badge}`}>{game.badgeLabel}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 わくわくアイランド 🏝️ たのしく あそんで まなぼう！</p>
      </footer>
    </div>
  )
}
