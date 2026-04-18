import { useState, useEffect, useRef } from 'react'
import './TypingGame.css'

const WORDS = [
  { emoji: '🐶', word: 'いぬ' },
  { emoji: '🐱', word: 'ねこ' },
  { emoji: '🐘', word: 'ぞう' },
  { emoji: '🐸', word: 'かえる' },
  { emoji: '🐟', word: 'さかな' },
  { emoji: '🍎', word: 'りんご' },
  { emoji: '🍌', word: 'ばなな' },
  { emoji: '⚽', word: 'ボール' },
  { emoji: '🚗', word: 'くるま' },
  { emoji: '🌸', word: 'はな' },
  { emoji: '🌙', word: 'つき' },
  { emoji: '⭐', word: 'ほし' },
  { emoji: '🏠', word: 'いえ' },
  { emoji: '📚', word: 'ほん' },
  { emoji: '🎵', word: 'おんがく' },
]

const TOTAL = 10
const TIME_LIMIT = 60

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function TypingGame() {
  const [queue, setQueue] = useState(() => shuffle(WORDS).slice(0, TOTAL))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [shake, setShake] = useState(false)
  const [flash, setFlash] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t)
          setRunning(false)
          setDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  function start() {
    setQueue(shuffle(WORDS).slice(0, TOTAL))
    setIndex(0)
    setInput('')
    setScore(0)
    setTimeLeft(TIME_LIMIT)
    setRunning(true)
    setDone(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleChange(e) {
    const val = e.target.value
    setInput(val)
    const target = queue[index].word
    if (val === target) {
      setFlash(true)
      setTimeout(() => setFlash(false), 300)
      setScore(s => s + 1)
      const next = index + 1
      if (next >= TOTAL) {
        setRunning(false)
        setDone(true)
      } else {
        setIndex(next)
        setInput('')
      }
    }
  }

  const current = queue[index]
  const timerPct = (timeLeft / TIME_LIMIT) * 100

  return (
    <div className="typing-game">
      <div className="score-bar">
        <div className="score-item">てんすう <span>{score}</span>/{TOTAL}</div>
        <div className="score-item">のこり <span>{timeLeft}</span>びょう</div>
        {!running && <button className="action-btn btn-blue" onClick={start}>はじめる</button>}
      </div>

      {running && (
        <div className="timer-bar-wrap">
          <div className="timer-bar" style={{ width: `${timerPct}%`, background: timerPct > 50 ? '#6bcb77' : timerPct > 25 ? '#ffd93d' : '#ff6b6b' }} />
        </div>
      )}

      {!running && !done && (
        <div className="typing-start">
          <div style={{ fontSize: '5rem', marginBottom: 16 }}>⌨️</div>
          <p>えをみて　ひらがなをうとう！<br />「はじめる」をおしてスタート</p>
        </div>
      )}

      {running && (
        <>
          <div className={`typing-card ${flash ? 'flash' : ''}`}>
            <div className="typing-emoji">{current.emoji}</div>
            <div className="typing-target">
              {current.word.split('').map((ch, i) => (
                <span
                  key={i}
                  className={i < input.length ? (input[i] === ch ? 'ok' : 'ng') : ''}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          <input
            ref={inputRef}
            className="typing-input"
            value={input}
            onChange={handleChange}
            placeholder="ここにうってね"
            autoFocus
          />

          <div className="typing-progress">
            {queue.map((_, i) => (
              <span key={i} className={`dot ${i < index ? 'done' : i === index ? 'current' : ''}`} />
            ))}
          </div>
        </>
      )}

      {done && (
        <div className="result-overlay">
          <div className="result-box">
            <span className="result-emoji">{score === TOTAL ? '🏆' : score >= 7 ? '🎉' : '😊'}</span>
            <div className="result-title">おわり！</div>
            <div className="result-score"><strong>{score}</strong>/{TOTAL} せいかい！</div>
            <button className="action-btn btn-blue" onClick={start}>もういちど</button>
          </div>
        </div>
      )}
    </div>
  )
}
