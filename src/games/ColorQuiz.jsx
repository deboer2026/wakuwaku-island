import { useState } from 'react'
import './ColorQuiz.css'

const COLORS = [
  { name: 'あか', hex: '#e74c3c', jp: '赤' },
  { name: 'あお', hex: '#3498db', jp: '青' },
  { name: 'きいろ', hex: '#f1c40f', jp: '黄' },
  { name: 'みどり', hex: '#2ecc71', jp: '緑' },
  { name: 'むらさき', hex: '#9b59b6', jp: '紫' },
  { name: 'オレンジ', hex: '#e67e22', jp: '橙' },
  { name: 'ピンク', hex: '#ff69b4', jp: '桃' },
  { name: 'ちゃいろ', hex: '#8B4513', jp: '茶' },
  { name: 'くろ', hex: '#2c2c2c', jp: '黒' },
  { name: 'しろ', hex: '#f0f0f0', jp: '白' },
]

const TOTAL = 10

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function getQuestion(exclude) {
  const answer = COLORS[Math.floor(Math.random() * COLORS.length)]
  let choices = [answer]
  let pool = COLORS.filter(c => c.name !== answer.name)
  pool = shuffle(pool)
  choices = [...choices, pool[0], pool[1], pool[2]]
  return { answer, choices: shuffle(choices) }
}

export default function ColorQuiz() {
  const [q, setQ] = useState(() => getQuestion())
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [done, setDone] = useState(false)

  function answer(choice) {
    if (selected) return
    setSelected(choice)
    const correct = choice.name === q.answer.name
    if (correct) setScore(s => s + 1)

    setTimeout(() => {
      if (round >= TOTAL) {
        setDone(true)
        return
      }
      setRound(r => r + 1)
      setQ(getQuestion())
      setSelected(null)
    }, 900)
  }

  function reset() {
    setQ(getQuestion())
    setSelected(null)
    setScore(0)
    setRound(1)
    setDone(false)
  }

  return (
    <div className="color-quiz">
      <div className="score-bar">
        <div className="score-item">てんすう <span>{score}</span></div>
        <div className="score-item">もんだい <span>{round}</span>/{TOTAL}</div>
        <button className="action-btn btn-blue" onClick={reset}>もういちど</button>
      </div>

      <div className="cq-swatch" style={{ background: q.answer.hex }}>
        <span className="cq-label">{q.answer.jp}</span>
      </div>

      <div className="cq-prompt">このいろのなまえは？</div>

      <div className="cq-choices">
        {q.choices.map(c => {
          let state = ''
          if (selected) {
            if (c.name === q.answer.name) state = 'correct'
            else if (c.name === selected.name) state = 'wrong'
          }
          return (
            <button
              key={c.name}
              className={`cq-btn ${state}`}
              onClick={() => answer(c)}
            >
              {c.name}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={`cq-feedback ${selected.name === q.answer.name ? 'ok' : 'ng'}`}>
          {selected.name === q.answer.name ? '⭕ せいかい！' : `❌ ざんねん！「${q.answer.name}」だよ`}
        </div>
      )}

      {done && (
        <div className="result-overlay">
          <div className="result-box">
            <span className="result-emoji">{score >= 9 ? '🏆' : score >= 6 ? '🎉' : '😊'}</span>
            <div className="result-title">おわり！</div>
            <div className="result-score"><strong>{score}</strong>/{TOTAL} もんせいかい！</div>
            <button className="action-btn btn-blue" onClick={reset}>もういちど</button>
          </div>
        </div>
      )}
    </div>
  )
}
