import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { transitionBack } from '../utils/transition'
import {
  ensureAudioStarted, playSniperBgm, stopBgm,
  toggleMute, playSoundCorrect, playSoundWrong,
} from '../utils/audio'
import { getLang, t } from '../utils/i18n'
import './DoubutsuSniper.css'

const W = 360, H = 480

const ANIMALS = ['🐱','🐰','🦊','🐸','🐼','🐶','🐨','🐯','🐻','🐷']
const FAKES   = ['🌿','🍀','🌸','🍃','🌱']

const STAGE_CFG = [
  { size: 68, speed: 1.6, count: 4, fakes: 0, pts: 10, time: 30 },
  { size: 55, speed: 2.8, count: 5, fakes: 0, pts: 20, time: 30 },
  { size: 44, speed: 4.2, count: 6, fakes: 2, pts: 30, time: 30 },
]

function rnd(a, b) { return a + Math.random() * (b - a) }

function makeTargets(stageIdx) {
  const cfg = STAGE_CFG[stageIdx]
  const targets = []
  const pool = [...ANIMALS].sort(() => Math.random() - 0.5)
  const fakePool = [...FAKES].sort(() => Math.random() - 0.5)

  for (let i = 0; i < cfg.count; i++) {
    const sz = cfg.size
    targets.push({
      id: i,
      emoji: pool[i % pool.length],
      x: rnd(sz, W - sz),
      y: rnd(sz, H * 0.8 - sz),
      vx: (Math.random() < 0.5 ? 1 : -1) * rnd(cfg.speed * 0.7, cfg.speed * 1.3),
      vy: (Math.random() < 0.5 ? 1 : -1) * rnd(cfg.speed * 0.5, cfg.speed * 0.9),
      size: sz,
      isFake: false,
    })
  }
  for (let i = 0; i < cfg.fakes; i++) {
    const sz = cfg.size - 4
    targets.push({
      id: 100 + i,
      emoji: fakePool[i % fakePool.length],
      x: rnd(sz, W - sz),
      y: rnd(sz, H * 0.8 - sz),
      vx: (Math.random() < 0.5 ? 1 : -1) * rnd(cfg.speed * 0.6, cfg.speed),
      vy: (Math.random() < 0.5 ? 1 : -1) * rnd(cfg.speed * 0.4, cfg.speed * 0.8),
      size: sz,
      isFake: true,
    })
  }
  return targets
}

export default function DoubutsuSniper() {
  const navigate = useNavigate()
  const lang = getLang()
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const rafRef   = useRef(null)

  const [screen,     setScreen]     = useState('title')
  const [muted,      setMuted]      = useState(() => localStorage.getItem('wakuwaku_muted') === '1')
  const [uiStage,    setUiStage]    = useState(1)
  const [uiScore,    setUiScore]    = useState(0)
  const [uiHp,       setUiHp]       = useState(3)
  const [uiTime,     setUiTime]     = useState(30)
  const [resultData, setResultData] = useState(null)
  const [clearData,  setClearData]  = useState(null)

  const hiKey = 'sniper_hi'

  /* ── core draw ─────────────────────────────────────── */
  function drawScene(g) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    /* background */
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#4aae5a')
    grad.addColorStop(1, '#2d8a3e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    // tree silhouettes at bottom for atmosphere
    ctx.fillStyle = 'rgba(0,60,0,0.18)'
    for (let i = 0; i < 8; i++) {
      const tx = (i * 52 + 10) % W
      ctx.beginPath()
      ctx.moveTo(tx, H)
      ctx.lineTo(tx + 18, H - 45)
      ctx.lineTo(tx + 36, H)
      ctx.fill()
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    /* targets */
    g.targets.forEach(t => {
      // white drop shadow for legibility on bright green
      ctx.shadowColor = 'rgba(255,255,255,0.9)'
      ctx.shadowBlur = t.isFake ? 6 : 10
      ctx.font = `${t.size}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = 1
      ctx.fillText(t.emoji, t.x, t.y)
      ctx.shadowBlur = 0
    })

    /* particles */
    g.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / 0.6)
      ctx.font = `${p.sz}px serif`
      ctx.fillText(p.emoji, p.x, p.y)
    })
    ctx.globalAlpha = 1

    /* hit rings */
    g.rings.forEach(r => {
      const a = r.life / 0.35
      ctx.strokeStyle = r.good
        ? `rgba(255,230,50,${a})`
        : `rgba(255,60,60,${a})`
      ctx.lineWidth = 3
      const radius = (1 - a) * 44 + 8
      ctx.beginPath()
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2)
      ctx.stroke()
    })

    /* timer bar */
    const pct = Math.max(0, g.time / STAGE_CFG[g.stage].time)
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, H - 9, W, 9)
    ctx.fillStyle = pct > 0.4 ? '#4CAF50' : pct > 0.2 ? '#FFC107' : '#f44336'
    ctx.fillRect(0, H - 9, W * pct, 9)

    /* crosshair cursor hint */
    if (!g.done) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 2
      const cx = W / 2, cy = H / 2
      ctx.beginPath(); ctx.moveTo(cx - 22, cy); ctx.lineTo(cx + 22, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - 22); ctx.lineTo(cx, cy + 22); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.fill()
    }
  }

  /* ── start a stage ─────────────────────────────────── */
  function runStage(stageIdx, score, hp) {
    cancelAnimationFrame(rafRef.current)
    const g = {
      stage: stageIdx,
      score,
      hp,
      time: STAGE_CFG[stageIdx].time,
      targets: makeTargets(stageIdx),
      particles: [],
      rings: [],
      done: false,
      lastTick: performance.now(),
    }
    stateRef.current = g
    setUiStage(stageIdx + 1)
    setUiScore(score)
    setUiHp(hp)
    setUiTime(STAGE_CFG[stageIdx].time)
    setScreen('game')

    function tick() {
      rafRef.current = requestAnimationFrame(tick)
      const g = stateRef.current
      if (!g) return
      const now = performance.now()
      const dt  = Math.min((now - g.lastTick) / 1000, 0.05)
      g.lastTick = now

      if (!g.done) {
        g.time = Math.max(0, g.time - dt)
        setUiTime(Math.ceil(g.time))
      }

      /* move targets */
      const cfg = STAGE_CFG[g.stage]
      g.targets.forEach(t => {
        t.x += t.vx
        t.y += t.vy
        const r = t.size * 0.55
        if (t.x - r < 0)  { t.x = r;     t.vx =  Math.abs(t.vx) }
        if (t.x + r > W)  { t.x = W - r; t.vx = -Math.abs(t.vx) }
        if (t.y - r < 0)  { t.y = r;     t.vy =  Math.abs(t.vy) }
        if (t.y + r > H - 12) { t.y = H - 12 - r; t.vy = -Math.abs(t.vy) }
      })

      /* particles */
      g.particles = g.particles.filter(p => {
        p.life -= dt; p.x += p.vx; p.y += p.vy; p.vy += 0.1
        return p.life > 0
      })
      g.rings = g.rings.filter(r => { r.life -= dt; return r.life > 0 })

      /* stage completion check */
      if (!g.done) {
        const realLeft = g.targets.filter(t => !t.isFake).length
        if (g.time <= 0 || realLeft === 0) {
          g.done = true
          if (g.stage < 2) {
            setTimeout(() => {
              cancelAnimationFrame(rafRef.current)
              setClearData({ stage: g.stage, score: g.score, hp: g.hp })
              setScreen('stageClear')
            }, 700)
          } else {
            setTimeout(() => {
              cancelAnimationFrame(rafRef.current)
              const hi = Math.max(g.score, parseInt(localStorage.getItem(hiKey) || '0'))
              localStorage.setItem(hiKey, String(hi))
              setResultData({ score: g.score, hi })
              setScreen('result')
            }, 700)
          }
        }
      }

      drawScene(g)
    }
    tick()
  }

  /* ── tap handler ───────────────────────────────────── */
  function handleTap(e) {
    const g = stateRef.current
    if (!g || g.done || screen !== 'game') return
    const rect = canvasRef.current.getBoundingClientRect()
    const sx = W / rect.width
    const sy = H / rect.height
    const cx = (e.clientX - rect.left) * sx
    const cy = (e.clientY - rect.top)  * sy

    let hitSomething = false
    for (let i = g.targets.length - 1; i >= 0; i--) {
      const t = g.targets[i]
      const dx = cx - t.x
      const dy = cy - t.y
      const r  = t.size * 0.65
      if (dx * dx + dy * dy > r * r) continue

      hitSomething = true
      if (t.isFake) {
        g.hp = Math.max(0, g.hp - 1)
        setUiHp(g.hp)
        g.rings.push({ x: t.x, y: t.y, life: 0.35, good: false })
        playSoundWrong()
        if (g.hp <= 0) {
          g.done = true
          cancelAnimationFrame(rafRef.current)
          const hi = Math.max(g.score, parseInt(localStorage.getItem(hiKey) || '0'))
          localStorage.setItem(hiKey, String(hi))
          setResultData({ score: g.score, hi })
          setScreen('result')
        }
      } else {
        g.score += STAGE_CFG[g.stage].pts
        setUiScore(g.score)
        g.rings.push({ x: t.x, y: t.y, life: 0.35, good: true })
        const emojis = ['✨', '⭐', '💛', '🌟', '💥']
        for (let j = 0; j < 7; j++) {
          g.particles.push({
            x: t.x, y: t.y,
            vx: rnd(-3.5, 3.5), vy: rnd(-5, -1),
            emoji: emojis[j % emojis.length],
            sz: 16, life: 0.6,
          })
        }
        playSoundCorrect()
        g.targets.splice(i, 1)
      }
      break
    }

    if (!hitSomething) {
      g.rings.push({ x: cx, y: cy, life: 0.2, good: false })
    }
  }

  /* ── public actions ────────────────────────────────── */
  async function startGame() {
    cancelAnimationFrame(rafRef.current)
    await ensureAudioStarted()
    playSniperBgm()
    runStage(0, 0, 3)
  }

  function nextStage() {
    const cd = clearData
    if (!cd) return
    runStage(cd.stage + 1, cd.score, cd.hp)
  }

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); stopBgm() }, [])

  const hiVal = parseInt(localStorage.getItem(hiKey) || '0')

  /* ── render ────────────────────────────────────────── */
  if (screen === 'title') return (
    <div className="sniper-wrap sniper-title-screen">
      <div className="sniper-title-icon">🎯</div>
      <div className="sniper-title-text">どうぶつスナイパー</div>
      <div className="sniper-title-desc">
        {'動き回るどうぶつを\nタップしてやっつけよう！\n3ステージ × 30秒\n❤️ 3ライフ制\n🌿 にせものに 気をつけて！'}
      </div>
      {hiVal > 0 && <div className="sniper-hi">🏆 {t(lang, 'hiScore')}: {hiVal}</div>}
      <button className="sniper-start-btn" onClick={startGame}>{t(lang, 'start')} 🎯</button>
      <button className="ww-back-btn" onClick={() => { stopBgm(); transitionBack(navigate) }}>
        {t(lang, 'back')}
      </button>
    </div>
  )

  if (screen === 'stageClear') return (
    <div className="sniper-wrap sniper-clear-screen">
      <div className="sniper-clear-icon">✨</div>
      <div className="sniper-clear-text">
        ステージ {clearData?.stage + 1} クリア！
      </div>
      <div className="sniper-clear-score">{t(lang, 'score')}: {clearData?.score}</div>
      <div className="sniper-clear-hp">
        {'❤️'.repeat(clearData?.hp || 0)}
      </div>
      <button className="sniper-start-btn" onClick={nextStage}>
        {lang === 'ja' ? 'つぎのステージへ ▶' : lang === 'zh' ? '下一关 ▶' : lang === 'ko' ? '다음 스테이지 ▶' : lang === 'es' ? 'Siguiente ▶' : 'Next Stage ▶'}
      </button>
      <button className="ww-back-btn" onClick={() => { stopBgm(); transitionBack(navigate) }}>
        {t(lang, 'back')}
      </button>
    </div>
  )

  if (screen === 'result') return (
    <div className="sniper-wrap sniper-result-screen">
      <div className="sniper-result-icon">🎯</div>
      <div className="sniper-result-text">{t(lang, 'gameOver')}</div>
      <div className="sniper-result-score">{t(lang, 'score')}: {resultData?.score}</div>
      <div className="sniper-result-hi">🏆 {t(lang, 'hiScore')}: {resultData?.hi}</div>
      <button className="sniper-start-btn" onClick={startGame}>{t(lang, 'retry')}</button>
      <button className="ww-back-btn" onClick={() => { stopBgm(); transitionBack(navigate) }}>
        {t(lang, 'back')}
      </button>
    </div>
  )

  return (
    <div className="sniper-wrap">
      <div className="sniper-hud">
        <button className="sniper-hud-btn" onClick={() => { stopBgm(); transitionBack(navigate) }}>🏠</button>
        <span className="sniper-hud-stat">ST {uiStage}/3</span>
        <span className="sniper-hud-stat sniper-hud-hp">{'❤️'.repeat(uiHp)}</span>
        <span className="sniper-hud-stat sniper-hud-score">⭐ {uiScore}</span>
        <span
          className="sniper-hud-stat sniper-hud-time"
          style={{ color: uiTime <= 10 ? '#ff8080' : '#fff' }}
        >
          ⏱ {uiTime}s
        </span>
        <button
          className="sniper-hud-btn"
          onClick={() => { const m = toggleMute(); setMuted(m) }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="sniper-field">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="sniper-canvas"
          onPointerDown={handleTap}
        />
      </div>
    </div>
  )
}
