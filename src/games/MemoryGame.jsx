import { useState, useEffect } from 'react'
import './MemoryGame.css'

const CARD_ITEMS = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮']

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function createCards(count = 8) {
  const selected = CARD_ITEMS.slice(0, count)
  return shuffle([...selected, ...selected]).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }))
}

export default function MemoryGame() {
  const [cards, setCards] = useState(() => createCards(8))
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [locked, setLocked] = useState(false)
  const [done, setDone] = useState(false)

  const totalPairs = 8

  useEffect(() => {
    if (flipped.length === 2) {
      setLocked(true)
      const [a, b] = flipped
      if (cards[a].emoji === cards[b].emoji) {
        setCards(prev => prev.map((c, i) =>
          i === a || i === b ? { ...c, matched: true } : c
        ))
        const newMatches = matches + 1
        setMatches(newMatches)
        if (newMatches === totalPairs) setDone(true)
        setFlipped([])
        setLocked(false)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c
          ))
          setFlipped([])
          setLocked(false)
        }, 900)
      }
      setMoves(m => m + 1)
    }
  }, [flipped])

  function flip(index) {
    if (locked || cards[index].flipped || cards[index].matched) return
    setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c))
    setFlipped(prev => [...prev, index])
  }

  function reset() {
    setCards(createCards(8))
    setFlipped([])
    setMoves(0)
    setMatches(0)
    setLocked(false)
    setDone(false)
  }

  return (
    <div className="memory-game">
      <div className="score-bar">
        <div className="score-item">てんすう <span>{matches}</span>/{totalPairs}</div>
        <div className="score-item">てびっくす <span>{moves}</span></div>
        <button className="action-btn btn-primary" onClick={reset}>もういちど</button>
      </div>

      <div className="memory-grid">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`memory-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
            onClick={() => flip(i)}
          >
            <div className="card-inner">
              <div className="card-back">❓</div>
              <div className="card-front">{card.emoji}</div>
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div className="result-overlay">
          <div className="result-box">
            <span className="result-emoji">🎉</span>
            <div className="result-title">クリア！</div>
            <div className="result-score"><strong>{moves}</strong>かいで　クリア！</div>
            <button className="action-btn btn-primary" onClick={reset}>もういちど あそぶ</button>
          </div>
        </div>
      )}
    </div>
  )
}
