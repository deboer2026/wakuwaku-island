import { useState, useEffect, useRef } from 'react'
import './WhackMole.css'

const HOLES = 9
const GAME_TIME = 30

export default function WhackMole() {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [active, setActive] = useState(-1)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [hit, setHit] = useState(-1)
  const [miss, setMiss] = useState(-1)
  const timerRef = useRef(null)
  const moleRef = useRef(null)

  function startGame() {
    setScore(0)
    setTimeLeft(GAME_TIME)
    setActive(-1)
    setDone(false)
    setRunning(true)
  }

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          clearTimeout(moleRef.current)
          setActive(-1)
          setRunning(false)
          setDone(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  useEffect(() => {
    if (!running) return
    function spawnMole() {
      const hole = Math.floor(Math.random() * HOLES)
      setActive(hole)
      const delay = 600 + Math.random() * 800
      moleRef.current = setTimeout(() => {
        setActive(-1)
        spawnMole()
      }, delay)
    }
    spawnMole()
    return () => clearTimeout(moleRef.current)
  }, [running])

  function whack(i) {
    if (!running || active !== i) {
      setMiss(i)
      setTimeout(() => setMiss(-1), 300)
      return
    }
    setScore(s => s + 1)
    setHit(i)
    setActive(-1)
    setTimeout(() => setHit(-1), 300)
  }

  const timerPct = (timeLeft / GAME_TIME) * 100

  return (
    <div className="whack-game">
      <div className="score-bar">
        <div className="score-item">てんすう <span>{score}</span></div>
        <div className="score-item">のこり <span>{timeLeft}</span>びょう</div>
        {!running && !done && (
          <button className="action-btn btn-primary" onClick={startGame}>はじめる</button>
        )}
      </div>

      {running && (
        <div className="timer-bar-wrap">
          <div className="timer-bar" style={{ width: `${timerPct}%`, background: timerPct > 50 ? '#6bcb77' : timerPct > 25 ? '#ffd93d' : '#ff6b6b' }} />
        </div>
      )}

      {!running && !done && (
        <div className="whack-start">
          <div className="start-emoji">🐹</div>
          <p>「はじめる」をおして<br />もぐらをたたこう！</p>
        </div>
      )}

      {(running || done) && (
        <div className="whack-grid">
          {Array.from({ length: HOLES }, (_, i) => (
            <div key={i} className="hole" onClick={() => whack(i)}>
              <div className={`mole-wrap ${active === i ? 'up' : ''}`}>
                <span className={`mole ${hit === i ? 'hit' : ''} ${miss === i ? 'miss' : ''}`}>
                  🐹
                </span>
              </div>
              <div className="hole-bg" />
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="result-overlay">
          <div className="result-box">
            <span className="result-emoji">{score >= 20 ? '🏆' : score >= 10 ? '🎉' : '😊'}</span>
            <div className="result-title">おわり！</div>
            <div className="result-score"><strong>{score}</strong>ひき　たたいたよ！</div>
            <button className="action-btn btn-primary" onClick={startGame}>もういちど</button>
          </div>
        </div>
      )}
    </div>
  )
}
