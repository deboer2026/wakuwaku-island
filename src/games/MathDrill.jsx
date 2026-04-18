import { useState, useEffect, useRef } from 'react'
import './MathDrill.css'

const TOTAL = 10
const TIME_LIMIT = 60

function genQuestion(level) {
  const ops = level === 1 ? ['+'] : level === 2 ? ['+', '-'] : ['+', '-', '×']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a, b, answer
  if (op === '+') {
    a = Math.floor(Math.random() * (10 * level)) + 1
    b = Math.floor(Math.random() * (10 * level)) + 1
    answer = a + b
  } else if (op === '-') {
    a = Math.floor(Math.random() * (10 * level)) + 5
    b = Math.floor(Math.random() * a) + 1
    answer = a - b
  } else {
    a = Math.floor(Math.random() * 9) + 2
    b = Math.floor(Math.random() * 9) + 2
    answer = a * b
  }
  // generate 3 wrong answers
  const wrongs = new Set()
  while (wrongs.size < 3) {
    const w = answer + (Math.floor(Math.random() * 7) - 3)
    if (w !== answer && w >= 0) wrongs.add(w)
  }
  const choices = [answer, ...[...wrongs]].sort(() => Math.random() - 0.5)
  return { a, b, op, answer, choices }
}

export default function MathDrill() {
  const [level, setLevel] = useState(1)
  const [q, setQ] = useState(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

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

  function start(lv) {
    setLevel(lv)
    setQ(genQuestion(lv))
    setScore(0)
    setRound(1)
    setSelected(null)
    setTimeLeft(TIME_LIMIT)
    setRunning(true)
    setDone(false)
  }

  function answer(choice) {
    if (selected !== null) return
    setSelected(choice)
    const correct = choice === q.answer
    if (correct) setScore(s => s + 1)

    setTimeout(() => {
      const next = round + 1
      if (next > TOTAL) {
        setRunning(false)
        setDone(true)
        return
      }
      setRound(next)
      setQ(genQuestion(level))
      setSelected(null)
    }, 700)
  }

  const timerPct = (timeLeft / TIME_LIMIT) * 100

  if (!running && !done) {
    return (
      <div className="math-drill">
        <div className="math-start">
          <div style={{ fontSize: '4rem', marginBottom: 12 }}>🔢</div>
          <h3>レベルをえらぼう！</h3>
          <div className="level-btns">
            <button className="action-btn btn-green" onClick={() => start(1)}>
              🌱 かんたん<br /><small>たしざん</small>
            </button>
            <button className="action-btn btn-blue" onClick={() => start(2)}>
              🌿 ふつう<br /><small>たし・ひき</small>
            </button>
            <button className="action-btn btn-primary" onClick={() => start(3)}>
              🌳 むずかしい<br /><small>かけざんも</small>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="math-drill">
      <div className="score-bar">
        <div className="score-item">てんすう <span>{score}</span></div>
        <div className="score-item">もんだい <span>{round}</span>/{TOTAL}</div>
        <div className="score-item">のこり <span>{timeLeft}</span>びょう</div>
      </div>

      {running && (
        <div className="timer-bar-wrap">
          <div className="timer-bar" style={{ width: `${timerPct}%`, background: timerPct > 50 ? '#6bcb77' : timerPct > 25 ? '#ffd93d' : '#ff6b6b' }} />
        </div>
      )}

      {q && (
        <>
          <div className="math-question">
            <span className="math-num">{q.a}</span>
            <span className="math-op">{q.op}</span>
            <span className="math-num">{q.b}</span>
            <span className="math-op">=</span>
            <span className="math-blank">？</span>
          </div>

          <div className="math-choices">
            {q.choices.map(c => {
              let state = ''
              if (selected !== null) {
                if (c === q.answer) state = 'correct'
                else if (c === selected) state = 'wrong'
              }
              return (
                <button
                  key={c}
                  className={`math-btn ${state}`}
                  onClick={() => answer(c)}
                >
                  {c}
                </button>
              )
            })}
          </div>

          {selected !== null && (
            <div className={`cq-feedback ${selected === q.answer ? 'ok' : 'ng'}`}>
              {selected === q.answer ? '⭕ せいかい！' : `❌ こたえは ${q.answer} だよ`}
            </div>
          )}
        </>
      )}

      {done && (
        <div className="result-overlay">
          <div className="result-box">
            <span className="result-emoji">{score >= 9 ? '🏆' : score >= 6 ? '🎉' : '😊'}</span>
            <div className="result-title">おわり！</div>
            <div className="result-score"><strong>{score}</strong>/{TOTAL} せいかい！</div>
            <button className="action-btn btn-primary" onClick={() => { setRunning(false); setDone(false); setQ(null) }}>もういちど</button>
          </div>
        </div>
      )}
    </div>
  )
}
