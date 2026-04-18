import { useState } from 'react'
import './Shiritori.css'

// しりとりチェーン: 各単語の最初の文字と最後の文字
const CHAINS = [
  [
    { emoji: '🦊', word: 'きつね', hint: 'きつね' },
    { emoji: '🐱', word: 'ねこ', hint: 'ねこ（ね→ね）' },
    { emoji: '🌿', word: 'こけ', hint: 'こけ（こ→こ）' },
    { emoji: '🐸', word: 'けいと', hint: 'けいと（け→け）' },
    { emoji: '🐙', word: 'とんぼ', hint: 'とんぼ（と→と）' },
  ],
  [
    { emoji: '🍎', word: 'りんご', hint: 'りんご' },
    { emoji: '🦍', word: 'ごりら', hint: 'ごりら（ご→ご）' },
    { emoji: '🦒', word: 'らくだ', hint: 'らくだ（ら→ら）' },
    { emoji: '🥁', word: 'だいこ', hint: 'だいこ（だ→だ）' },
    { emoji: '🐟', word: 'こいぬ', hint: 'こいぬ（こ→こ）' },
  ],
  [
    { emoji: '🐘', word: 'ぞう', hint: 'ぞう' },
    { emoji: '🌊', word: 'うみ', hint: 'うみ（う→う）' },
    { emoji: '🦊', word: 'みんと', hint: 'みんと（み→み）' },
    { emoji: '🐙', word: 'とびうお', hint: 'とびうお（と→と）' },
    { emoji: '🎣', word: 'おさかな', hint: 'おさかな（お→お）' },
  ],
]

export default function Shiritori() {
  const [chainIdx, setChainIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [chainDone, setChainDone] = useState(false)

  const chain = CHAINS[chainIdx]
  const current = chain[step]
  const prevWord = step > 0 ? chain[step - 1].word : null
  const expectedStart = prevWord ? prevWord[prevWord.length - 1] : null

  function check() {
    if (!input.trim()) return
    const trimmed = input.trim()
    const correct = trimmed === current.word
    if (correct) {
      setFeedback('ok')
      setScore(s => s + 1)
      setTimeout(() => {
        setFeedback(null)
        setInput('')
        const next = step + 1
        if (next >= chain.length) {
          // chain complete
          setChainDone(true)
        } else {
          setStep(next)
        }
      }, 700)
    } else {
      setFeedback('ng')
      setTimeout(() => setFeedback(null), 800)
    }
  }

  function nextChain() {
    const next = chainIdx + 1
    if (next >= CHAINS.length) {
      setDone(true)
      return
    }
    setChainIdx(next)
    setStep(0)
    setInput('')
    setFeedback(null)
    setChainDone(false)
  }

  function reset() {
    setChainIdx(0)
    setStep(0)
    setInput('')
    setFeedback(null)
    setScore(0)
    setDone(false)
    setChainDone(false)
  }

  const totalWords = CHAINS.reduce((s, c) => s + c.length, 0)

  return (
    <div className="shiritori">
      <div className="score-bar">
        <div className="score-item">てんすう <span>{score}</span>/{totalWords}</div>
        <div className="score-item">チェーン <span>{chainIdx + 1}</span>/{CHAINS.length}</div>
        <button className="action-btn btn-purple" onClick={reset}>もういちど</button>
      </div>

      {!chainDone && (
        <>
          <div className="shiritori-chain">
            {chain.map((item, i) => (
              <div key={i} className={`chain-item ${i < step ? 'done' : i === step ? 'active' : 'hidden'}`}>
                {i < step ? (
                  <>
                    <span className="chain-emoji">{item.emoji}</span>
                    <span className="chain-word">{item.word}</span>
                  </>
                ) : i === step ? (
                  <>
                    <span className="chain-emoji big">{item.emoji}</span>
                    <span className="chain-question">このえは　なに？</span>
                  </>
                ) : (
                  <span className="chain-emoji muted">？</span>
                )}
                {i < chain.length - 1 && i <= step && <span className="arrow">→</span>}
              </div>
            ))}
          </div>

          {expectedStart && (
            <div className="hint-bar">
              「<strong>{expectedStart}</strong>」から　はじまる　ことばを　いれよう！
            </div>
          )}

          <div className={`shiritori-input-row ${feedback || ''}`}>
            <input
              className="shiritori-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder="ひらがなでうとう"
            />
            <button className="action-btn btn-purple" onClick={check}>こたえる</button>
          </div>

          {feedback === 'ok' && <div className="s-feedback ok">⭕ せいかい！</div>}
          {feedback === 'ng' && <div className="s-feedback ng">❌ もういちど！</div>}
        </>
      )}

      {chainDone && !done && (
        <div className="chain-clear">
          <div style={{ fontSize: '4rem' }}>🎉</div>
          <h3>チェーン クリア！</h3>
          <button className="action-btn btn-purple" onClick={nextChain}>つぎへ →</button>
        </div>
      )}

      {done && (
        <div className="result-overlay">
          <div className="result-box">
            <span className="result-emoji">🏆</span>
            <div className="result-title">ぜんぶクリア！</div>
            <div className="result-score"><strong>{score}</strong>/{totalWords} せいかい！</div>
            <button className="action-btn btn-purple" onClick={reset}>もういちど</button>
          </div>
        </div>
      )}
    </div>
  )
}
